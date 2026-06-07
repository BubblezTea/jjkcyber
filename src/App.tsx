/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import VesselForge from './components/VesselForge';
import CombatScreen from './components/CombatScreen';
import RightTabs from './components/RightTabs';
import LifeFeed from './components/LifeFeed';
import Modals from './components/Modals';
import { Snd } from './utils/sound';
import { LIFE_EVENTS, ENEMIES } from './data/gameData';
import { GameState, DialogueChoice, LifeEvent, EnemyTemplate, StatName, TrainingRegimen } from './types';

interface FeedCard {
  id: string;
  age: number;
  year: number;
  month: number;
  title: string;
  text: string;
  cat?: string;
  chips?: Array<{ l: string; c: 'pos' | 'neg' | 'neu' }>;
  choices: DialogueChoice[] | null;
  chosenIndex?: number | null;
  resultDesc?: string | null;
}

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'forge' | 'game' | 'combat'>('menu');
  const [canContinue, setCanContinue] = useState(false);
  const [parentInheritance, setParentInheritance] = useState<GameState | null>(null);
  const [mobileTab, setMobileTab] = useState<'stats' | 'feed' | 'activities'>('feed');

  // Active state engine
  const [gameState, rawSetGameState] = useState<GameState>({
    name: '',
    lastName: '',
    fullName: '',
    fatherName: 'None',
    motherName: 'None',
    age: 0,
    birthYear: 0,
    birthMonth: 1,
    curYear: 0,
    curMonth: 1,
    era: '',
    eraDef: null,
    hp: 100,
    maxHp: 100,
    ce: 50,
    maxCe: 50,
    stats: { str: 5, agi: 5, int: 5, cha: 5, mst: 5, end: 5, lck: 5, ce: 5 },
    xp: 0,
    level: 1,
    xpToNext: 100,
    rank: 'Unranked',
    rankIndex: 0,
    credits: 15,
    rebirths: 0,
    clanKey: 'none',
    clanName: 'No Clan',
    techKey: 'random',
    techName: 'Unknown',
    upbringing: 'normal',
    ceExp: 'mod',
    girlType: 'nocare',
    restriction: 'none',
    flags: {},
    npcs: [],
    quests: [],
    inventory: [],
    seenEvents: [],
    pendingChoice: false,
    isDead: false,
    inCombat: false,
    godMode: false,
    reputation: 0,
    currentSchool: 'none',
    dojoTrust: 0,
    copiedTechKey: ''
  });

  const setGameState = (value: React.SetStateAction<GameState>) => {
    rawSetGameState(prev => {
      let next = typeof value === 'function' ? (value as any)(prev) : value;

      // Apply Toji heavenly restriction intercept
      if (next.restriction === 'toji' || prev.restriction === 'toji') {
        const prevMaxCe = prev.maxCe || 0;
        const ceGain = next.maxCe - prevMaxCe;
        if (ceGain > 0) {
          next.maxCe = prevMaxCe;
          next.ce = Math.max(0, next.maxCe);
          const statPoints = Math.floor(ceGain / 2);
          if (statPoints > 0) {
            next.stats = {
              ...next.stats,
              str: Math.min(60, next.stats.str + statPoints),
              agi: Math.min(60, next.stats.agi + statPoints)
            };
          }
        } else if (next.maxCe > 0 && prevMaxCe === 0) {
          // Additional safety: if they somehow get CE initialized when it was 0, zero it out.
          next.maxCe = 0;
          next.ce = 0;
        }
      }
      return next;
    });
  };

  // Dialog and timing parameters
  const [feedCards, setFeedCards] = useState<FeedCard[]>([]);
  const [modalOpen, setModalOpen] = useState<'passtime' | 'train' | 'missions' | 'actions' | null>(null);
  const [activeEnemy, setActiveEnemy] = useState<EnemyTemplate | null>(null);

  // Rebirth counters
  const [rebirthCount, setRebirthCount] = useState(0);

  // Inspect existing save files upon boot
  useEffect(() => {
    const raw = localStorage.getItem('cr_save');
    if (raw) {
      setCanContinue(true);
    }
  }, []);

  // Sync sound context on the first click
  useEffect(() => {
    const handleFirstClick = () => {
      Snd.resume();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const handleNewGame = () => {
    setParentInheritance(null);
    setScreen('forge');
  };

  const handleContinue = () => {
    try {
      const raw = localStorage.getItem('cr_save');
      if (raw) {
        const parsed = JSON.parse(raw);
        setGameState(parsed);
        // Regenerate feed cards to represent their history
        if (parsed.seenEvents) {
          const loadedCards: FeedCard[] = [];
          
          // Re-insert initial card
          loadedCards.push({
            id: 'birth_loaded',
            age: 0,
            year: parsed.birthYear,
            month: parsed.birthMonth,
            title: 'SOUL VESSEL MANIFESTED',
            text: `Your avatar was resurrected from storage nodes. Current age: ${parsed.age}. Surname: ${parsed.clanName}. Innate Technique: ${parsed.techName}.`,
            cat: 'neutral',
            choices: null,
            resultDesc: 'Resuming continuous chronicle...'
          });

          setFeedCards(loadedCards);
        }
        setScreen('game');
      }
    } catch (e) {
      alert('Save records are corrupted.');
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('cr_save', JSON.stringify(gameState));
      setCanContinue(true);
      Snd.cash();
      alert('Vessel state saved safely inside local registers.');
    } catch (e) {
      alert('Failed to execute save.');
    }
  };

  const promoteRank = (currentRankIdx: number) => {
    const RANKS = ['Unranked', 'Grade 4', 'Grade 3', 'Grade 2', 'Semi-Grade 1', 'Grade 1', 'Special Grade'];
    if (currentRankIdx >= RANKS.length - 1) return { index: currentRankIdx, name: RANKS[currentRankIdx] };
    const nextIdx = currentRankIdx + 1;
    Snd.lvl();
    return { index: nextIdx, name: RANKS[nextIdx] };
  };

  const checkLevelUp = (state: GameState, addedXp: number): GameState => {
    let currentXp = state.xp + addedXp;
    let nextThreshold = state.xpToNext;
    let currLevel = state.level;
    let currMaxHp = state.maxHp;
    let currMaxCe = state.maxCe;

    let leveled = false;

    while (currentXp >= nextThreshold) {
      currentXp -= nextThreshold;
      currLevel += 1;
      nextThreshold = Math.floor(nextThreshold * 1.55);
      currMaxHp += 10;
      currMaxCe += 8;
      leveled = true;
    }

    if (leveled) {
      Snd.lvl();
    }

    // Auto-rank checks across distinct XP bounds
    const RANK_THRESHOLDS = [0, 50, 150, 350, 700, 1200, 2500];
    let currRankIdx = state.rankIndex;
    const RANKS = ['Unranked', 'Grade 4', 'Grade 3', 'Grade 2', 'Semi-Grade 1', 'Grade 1', 'Special Grade'];

    while (currRankIdx < RANKS.length - 1 && currentXp >= RANK_THRESHOLDS[currRankIdx + 1]) {
      currRankIdx++;
    }

    return {
      ...state,
      xp: currentXp,
      xpToNext: nextThreshold,
      level: currLevel,
      maxHp: currMaxHp,
      hp: leveled ? currMaxHp : state.hp,
      maxCe: currMaxCe,
      ce: leveled ? currMaxCe : state.ce,
      rankIndex: currRankIdx,
      rank: RANKS[currRankIdx]
    };
  };

  // Triggers dialog occurrences. Solves: "Dialogue choices that can affect you every time you age up?"
  const triggerDialogueEvent = (targetAge: number, customState?: GameState) => {
    const activeState = customState || gameState;

    // Filter potential occurrences
    const pool = LIFE_EVENTS.filter(ev => {
      // Check Age parameters
      if (ev.age && (targetAge < ev.age[0] || targetAge > ev.age[1])) return false;
      // Check Era parameters
      if (ev.era) {
        const eras = ev.era.split('|');
        if (!eras.includes(activeState.era)) return false;
      }
      // Check unique seen limits
      if (!ev.repeat && activeState.seenEvents.includes(ev.id)) return false;
      return true;
    });

    // Fallback selection if no targeted event exists
    let chosenEvent: LifeEvent;
    if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      chosenEvent = pool[idx];
    } else {
      // Find a repeating fallback event
      const fallbacks = LIFE_EVENTS.filter(ev => ev.repeat);
      const idx = Math.floor(Math.random() * fallbacks.length);
      chosenEvent = fallbacks[idx];
    }

    // Adapt narrative texts
    const adaptedText = chosenEvent.text
      .replace('{{year}}', activeState.curYear.toString())
      .replace('{{era}}', activeState.eraDef?.name || activeState.era);

    const newCard: FeedCard = {
      id: chosenEvent.id,
      age: targetAge,
      year: activeState.curYear,
      month: activeState.curMonth,
      title: chosenEvent.title,
      text: adaptedText,
      cat: chosenEvent.cat,
      chips: chosenEvent.chips,
      choices: chosenEvent.choices
    };

    setFeedCards(prev => [...prev, newCard]);

    setGameState(prev => ({
      ...prev,
      seenEvents: [...prev.seenEvents, chosenEvent.id],
      pendingChoice: chosenEvent.choices && chosenEvent.choices.length > 0 ? true : false
    }));
  };

function generateParents(clanKey: string, lastName: string): { father: string; mother: string } {
  const ln = lastName ? lastName : '';
  const key = clanKey ? clanKey.toLowerCase() : 'none';
  if (key === 'gojo') {
    return { father: 'Shingo Gojo', mother: 'Aiko Gojo' };
  } else if (key === 'zenin') {
    return { father: 'Naobito Zenin', mother: 'Saki Zenin' };
  } else if (key === 'kamo') {
    return { father: 'Shino Kamo', mother: 'Yuriko Kamo' };
  } else if (key === 'inumaki') {
    return { father: 'Toshi Inumaki', mother: 'Miyo Inumaki' };
  } else if (key === 'sugawara') {
    return { father: 'Kiyonari Sugawara', mother: 'Kiyoko Sugawara' };
  } else if (key === 'abe') {
    return { father: 'Yasuna Abe', mother: 'Kuzunoha Abe' };
  } else if (key === 'fujiwara') {
    return { father: 'Kanesuke Fujiwara', mother: 'Kaguya Fujiwara' };
  } else if (key === 'itadori') {
    return { father: 'Jin Itadori', mother: 'Kaori Itadori' };
  } else if (key === 'fushiguro') {
    return { father: 'Toji Fushiguro', mother: 'Chio Fushiguro' };
  } else if (key === 'okkotsu') {
    return { father: 'Kazuto Okkotsu', mother: 'Aoi Okkotsu' };
  } else if (key === 'geto') {
    return { father: 'Masanori Geto', mother: 'Atsuko Geto' };
  } else if (key === 'hoshi') {
    return { father: 'Raiden Hoshi', mother: 'Hina Hoshi' };
  } else if (key === 'ashiya') {
    return { father: 'Doman Ashiya', mother: 'Yui Ashiya' };
  } else if (key === 'kusakabe') {
    return { father: 'Goro Kusakabe', mother: 'Nene Kusakabe' };
  } else if (key === 'nanami') {
    return { father: 'Ryu Nanami', mother: 'Nanako Nanami' };
  } else if (key === 'todo') {
    return { father: 'Kenta Todo', mother: 'Mana Todo' };
  } else if (key === 'miwa') {
    return { father: 'Jiro Miwa', mother: 'Masae Miwa' };
  } else if (key === 'ryomen') {
    return { father: 'Asura Ryomen', mother: 'Izanami Ryomen' };
  } else if (ln) {
    return { father: `Goro ${ln}`, mother: `Saki ${ln}` };
  } else {
    return { father: 'Soji', mother: 'Sana' };
  }
}

  const handleAwakenVessel = (characterData: any) => {
    const fallbackYear = characterData.birthYear || characterData.eraDef?.y0 || 2018;
    const fallbackMonth = characterData.birthMonth || 1;
    const parentsName = generateParents(characterData.clanKey || 'none', characterData.lastName || '');

    // Calculate adult potential bases
    let adultMaxHp = 100 + (characterData.stats.end || 0) * 4;
    let adultMaxCe = 50 + (characterData.stats.ce || 0) * 6;
    const startInv = [
      { name: 'Occult Healing Salve', qty: 2 },
      { name: 'Grade 4 Paper Talisman', qty: 3 }
    ];

    if (characterData.restriction === 'toji') {
      adultMaxCe = 0;
      adultMaxHp = 160 + (characterData.stats.end || 0) * 8; // Heavy physical boost
      startInv.push({ name: 'Inverted Spear of Heaven (Special Grade)', qty: 1 });
    } else if (characterData.restriction === 'mechamaru') {
      adultMaxHp = 35; // Delicate body
      adultMaxCe = (50 + (characterData.stats.ce || 0) * 6) * 3.5; // Massive energy supply
      startInv.push({ name: 'Ultimate Puppet Controller', qty: 1 });
    }

    // Starting infants (age 0) begin fragile at 20% of their future potential
    const baseMaxHp = Math.max(25, Math.floor(adultMaxHp * 0.2));
    const baseMaxCe = Math.max(10, Math.floor(adultMaxCe * 0.2));

    const startingFlags: Record<string, boolean> = {};
    if (characterData.techKey === 'ten_shad') {
      startingFlags['tamed_dog'] = true;
    }

    let hasSixEyes = false;
    let sixEyesClash = false;
    if (characterData.clanKey === 'gojo') {
      const roll = Math.random();
      if (roll < 0.01 || characterData.name?.trim().toLowerCase() === 'satoru') {
        const isGojoEra = characterData.era === 'modern' || characterData.era === 'shibuya';
        if (isGojoEra) {
          sixEyesClash = true;
          startingFlags['six_eyes_clash'] = true;
        } else {
          hasSixEyes = true;
          startingFlags['six_eyes'] = true;
          startingFlags['six_eyes_active'] = true;
        }
      }
    }

    const initialCharacterState: GameState = {
      ...gameState,
      ...characterData,
      fatherName: parentsName.father,
      motherName: parentsName.mother,
      age: 0,
      birthYear: fallbackYear,
      birthMonth: fallbackMonth,
      curYear: fallbackYear,
      curMonth: fallbackMonth,
      hp: baseMaxHp,
      maxHp: baseMaxHp,
      ce: hasSixEyes ? Math.max(100, baseMaxCe + 200) : baseMaxCe,
      maxCe: hasSixEyes ? Math.max(100, baseMaxCe + 200) : baseMaxCe,
      xp: 0,
      level: 1,
      xpToNext: 105,
      rank: 'Unranked',
      rankIndex: 0,
      credits: 15 + (characterData.stats.lck || 0) * 2,
      rebirths: rebirthCount,
      inventory: startInv,
      flags: startingFlags,
      npcs: [
        {
          name: parentsName.father,
          rel: 'Father',
          bond: 65,
          trust: 55,
          respect: 80,
          fear: 35,
          gender: 'M'
        },
        {
          name: parentsName.mother,
          rel: 'Mother',
          bond: 80,
          trust: 75,
          respect: 60,
          fear: 10,
          gender: 'F'
        }
      ],
      quests: [{ title: 'Walk the chronological paths to develop bonds and strength.', status: 'active' }],
      seenEvents: [],
      isDead: false,
      inCombat: false,
      pendingChoice: false
    };

    setGameState(initialCharacterState);

    const initialFeed: FeedCard[] = [];

    if (hasSixEyes) {
      initialFeed.push({
        id: 'six_eyes_birth_destiny',
        age: 0,
        year: fallbackYear,
        month: fallbackMonth,
        title: '🌌 LEGENDARY DESTINY: THE SIX EYES',
        text: `Witnessing your first breath, the Gojo Clan elders collapse to their knees in absolute terror. They witness the stellar, cosmic-blue irises in your infant eyes. You have inherited the mythical Six Eyes! High-frequency mathematical vision reduces ALL your Cursed Energy (CE) expenditure by 99.99%! You wield functionally limitless energy.`,
        cat: 'achievement',
        chips: [{ l: 'Six Eyes Active', c: 'pos' }],
        choices: [
          {
            t: 'Silently decode the molecular composition of your crib',
            r: 'The mathematical beauty of the cosmos prints on your child mind. Your Cursed Potential rises! Max CE +100!',
            ef: G => { G.maxCe += 100; G.ce = G.maxCe; }
          }
        ]
      });
    } else if (sixEyesClash) {
      initialFeed.push({
        id: 'six_eyes_clash_destiny',
        age: 0,
        year: fallbackYear,
        month: fallbackMonth,
        title: '👁️ DESTINY SUPPRESSED: SIX EYES CLASH',
        text: `You were born with the exact celestial blueprint for the legendary Six Eyes... but Satoru Gojo already lives and wields them in this Modern era! Since only one Six Eyes bearer can exist at any single time, your infinite eyes are forced under a lock. Satoru Gojo's existence suppresses your vision. To break the lock and claim them, you must grow strong, gain Tokyo High's trust, and defeat Satoru Gojo in a high-stakes duel!`,
        cat: 'warning',
        chips: [{ l: 'Six Eyes Sealed', c: 'neg' }],
        choices: [
          {
            t: 'Vow to surpass Satoru Gojo and strip the seal!',
            r: 'A fierce instinct of absolute rivalry ignites. Starting physical and magical parameters rise!',
            ef: G => {
              G.stats.str = Math.min(25, G.stats.str + 2);
              G.stats.mst = Math.min(25, G.stats.mst + 2);
            }
          }
        ]
      });
    }

    initialFeed.push({
      id: 'infant_birth_card',
      age: 0,
      year: fallbackYear,
      month: fallbackMonth,
      title: 'FIRST BREATH (SOUL DISCHARGE)',
      text: `You emerge into the ${characterData.eraDef?.name || 'World'} to your father, ${parentsName.father}, and your mother, ${parentsName.mother}. The year is ${fallbackYear}. Heavy winds bend outer shinto pillars.`,
      cat: 'neutral',
      choices: [
        {
          t: 'Clench your tiny fists and absorb the atmospheric cursed dust',
          r: 'The negative space hums inside your crib. Your starting Cursed parameters stabilizer. Max CE +5!',
          ef: G => { G.maxCe += 5; G.ce = G.maxCe; }
        },
        {
          t: 'Scream loudly to call the compound priests',
          r: 'Priest signatures bless your baseline. AGI and LCK attributes grow immediately.',
          ef: G => {
            G.stats.agi = Math.min(20, G.stats.agi + 1);
            G.stats.lck = Math.min(20, G.stats.lck + 1);
          }
        }
      ]
    });

    setFeedCards(initialFeed);
    setScreen('game');
  };

  const handleChooseOption = (cardId: string, choiceIdx: number, choice: DialogueChoice) => {
    Snd.sel();

    // Apply choice side-effects to states
    let tempState = { ...gameState };
    if (choice.ef) {
      choice.ef(tempState);
    }

    // Resolve structural Todo best friendliness ties
    if (tempState.flags.todoBond && !tempState.npcs.some(n => n.name === 'Todo Aoi')) {
      tempState.npcs.push({ name: 'Todo Aoi', rel: 'Best Friend', famous: true, bond: 100, trust: 100, respect: 100, fear: 0, gender: 'M' });
    }

    tempState.pendingChoice = false;

    // Advance leveling threshold
    tempState = checkLevelUp(tempState, 15);

    setGameState(tempState);

    // Update active feed card locally to show chosen state
    setFeedCards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            chosenIndex: choiceIdx,
            resultDesc: choice.r
          };
        }
        return c;
      })
    );
  };

  // Age up trigger - Solves: "Dialogue choices that can affect you every time you age up?"
  const handleAgeUp = () => {
    if (gameState.isDead || gameState.pendingChoice) return;
    Snd.age();
    // Use the central pass time logic to safely advance one year (12 months)
    handleSelectPassTime(12);
  };

  const handleSelectPassTime = (months: number) => {
    setModalOpen(null);
    Snd.ui();

    let nextMonth = gameState.curMonth + months;
    let nextYear = gameState.curYear;
    let nextAge = gameState.age;
    let childBorn = false;
    let bornChildName = "";
    let yearsPassed = 0;

    while (nextMonth > 12) {
      nextMonth -= 12;
      nextYear += 1;
      nextAge += 1;
      yearsPassed += 1;
    }

    const updatedNpcs = gameState.npcs.map(npc => {
      const copy = { ...npc };
      if (yearsPassed > 0) {
        copy.knownYears = (copy.knownYears || 0) + yearsPassed;
      }
      if (copy.rel === 'Romance' && yearsPassed > 0) {
        copy.yearsDated = (copy.yearsDated || 0) + yearsPassed;
      }
      if (copy.isSpouse && yearsPassed > 0) {
        copy.marriedYears = (copy.marriedYears || 0) + yearsPassed;
      }
      if (copy.monthsPregnant !== undefined) {
        copy.monthsPregnant += months;
        if (copy.monthsPregnant >= 9) {
          childBorn = true;
          delete copy.monthsPregnant;
        }
      }
      return copy;
    });

    if (childBorn) {
      const boyNames = ["Megumi", "Toji", "Yuji", "Satoru", "Ren", "Aoi"];
      const girlNames = ["Nobara", "Maki", "Mai", "Shoko", "Haru", "Kasumi"];
      const rollsBoy = Math.random() > 0.5;
      const first = rollsBoy ? boyNames[Math.floor(Math.random() * boyNames.length)] : girlNames[Math.floor(Math.random() * girlNames.length)];
      bornChildName = `${first} ${gameState.lastName || 'Soji'}`;
      updatedNpcs.push({
        name: bornChildName,
        rel: 'Child',
        bond: 80,
        trust: 80,
        respect: 20,
        fear: 5,
        gender: rollsBoy ? 'M' : 'F'
      });
    }

    // Recover indicators
    const hpRecovery = months * Math.floor(gameState.stats.end * 0.4);
    const ceRecovery = months * Math.floor(gameState.stats.mst * 0.3);

    // Calculate adult potential targets
    let potentialMaxHp = 100 + (gameState.stats.end || 0) * 4;
    let potentialMaxCe = 50 + (gameState.stats.ce || 0) * 6;

    if (gameState.restriction === 'toji') {
      potentialMaxCe = 0;
      potentialMaxHp = 160 + (gameState.stats.end || 0) * 8;
    } else if (gameState.restriction === 'mechamaru') {
      potentialMaxHp = 35;
      potentialMaxCe = (50 + (gameState.stats.ce || 0) * 6) * 3.5;
    }

    // Dynamic linear childhood growth from 20% birth limits up to 100% full potential at age 18
    const nextFactor = nextAge >= 18 ? 1.0 : (0.2 + 0.8 * (nextAge / 18));
    let nextMaxHp = Math.max(25, Math.floor(potentialMaxHp * nextFactor));
    let nextMaxCe = Math.max(10, Math.floor(potentialMaxCe * nextFactor));

    if (nextMaxHp < gameState.maxHp && nextAge < 45) nextMaxHp = gameState.maxHp;
    if (nextMaxCe < gameState.maxCe && nextAge < 45) nextMaxCe = gameState.maxCe;

    // Apply soft aging decline if over 45
    if (nextAge > 45 && yearsPassed > 0) {
      const decay = Math.floor((nextAge - 45) / 5) * yearsPassed;
      if (Math.random() < 0.2) nextMaxHp = Math.max(1, nextMaxHp - decay);
      if (Math.random() < 0.1) nextMaxCe = Math.max(0, nextMaxCe - decay);
    }

    const updatedState: GameState = {
      ...gameState,
      age: nextAge,
      curMonth: nextMonth,
      curYear: nextYear,
      maxHp: nextMaxHp,
      maxCe: nextMaxCe,
      hp: Math.min(nextMaxHp, gameState.hp + hpRecovery + Math.max(0, nextMaxHp - gameState.maxHp)),
      ce: Math.min(nextMaxCe, gameState.ce + ceRecovery + Math.max(0, nextMaxCe - gameState.maxCe)),
      npcs: updatedNpcs
    };

    setGameState(updatedState);

    if (childBorn) {
      const birthCard: FeedCard = {
        id: `birth_announcement_${Date.now()}`,
        age: nextAge,
        year: nextYear,
        month: nextMonth,
        title: "🍼 SOUL VESSEL FRUITION — CHILD BORN!",
        text: `Incredibly, after nine months of dedicated pregnancy progress, your newborn child, ${bornChildName}, is safely born! Healthy spiritual flows aura the room. Your ancestral techniques can now pass to another generation!`,
        cat: 'social',
        chips: [{ l: "Npcs Updated", c: "pos" }],
        choices: []
      };
      setFeedCards(prev => [...prev, birthCard]);
    }

    triggerDialogueEvent(nextAge, updatedState);
  };

  const handleSelectTrain = (regimen: TrainingRegimen) => {
    setModalOpen(null);
    Snd.sel();

    let nextMonth = gameState.curMonth + regimen.mo;
    let nextYear = gameState.curYear;
    let nextAge = gameState.age;
    let childBorn = false;
    let bornChildName = "";
    let yearsPassed = 0;

    while (nextMonth > 12) {
      nextMonth -= 12;
      yearsPassed += 1;
      nextYear += 1;
      nextAge += 1;
    }

    const updatedNpcs = gameState.npcs.map(npc => {
      const copy = { ...npc };
      if (yearsPassed > 0) {
        copy.knownYears = (copy.knownYears || 0) + yearsPassed;
      }
      if (copy.rel === 'Romance' && yearsPassed > 0) {
        copy.yearsDated = (copy.yearsDated || 0) + yearsPassed;
      }
      if (copy.isSpouse && yearsPassed > 0) {
        copy.marriedYears = (copy.marriedYears || 0) + yearsPassed;
      }
      if (copy.monthsPregnant !== undefined) {
        copy.monthsPregnant += regimen.mo;
        if (copy.monthsPregnant >= 9) {
          childBorn = true;
          delete copy.monthsPregnant;
        }
      }
      return copy;
    });

    if (childBorn) {
      const boyNames = ["Megumi", "Toji", "Yuji", "Satoru", "Ren", "Aoi"];
      const girlNames = ["Nobara", "Maki", "Mai", "Shoko", "Haru", "Kasumi"];
      const rollsBoy = Math.random() > 0.5;
      const first = rollsBoy ? boyNames[Math.floor(Math.random() * boyNames.length)] : girlNames[Math.floor(Math.random() * girlNames.length)];
      bornChildName = `${first} ${gameState.lastName || 'Soji'}`;
      updatedNpcs.push({
        name: bornChildName,
        rel: 'Child',
        bond: 80,
        trust: 80,
        respect: 20,
        fear: 5,
        gender: rollsBoy ? 'M' : 'F'
      });
    }

    const hpBonus = regimen.ex?.hpB || 0;
    const xpBonus = regimen.ex?.xpB || 0;
    const ceBonus = regimen.ex?.ceB || 0;

    let updatedStats = { ...gameState.stats };
    if (regimen.stat !== 'ce') {
      updatedStats[regimen.stat] = Math.min(20, updatedStats[regimen.stat] + 1);
    }

    if (regimen.ex) {
      Object.entries(regimen.ex).forEach(([k, v]) => {
        if (k !== 'hpB' && k !== 'xpB' && k !== 'ceB') {
          const keyName = k as StatName;
          updatedStats[keyName] = Math.min(20, (updatedStats[keyName] || 0) + (v || 0));
        }
      });
    }

    // Calculate adult potential targets
    let potentialMaxHp = 100 + (updatedStats.end || 0) * 4;
    let potentialMaxCe = 50 + (updatedStats.ce || 0) * 6;

    if (gameState.restriction === 'toji') {
      potentialMaxCe = 0;
      potentialMaxHp = 160 + (updatedStats.end || 0) * 8;
    } else if (gameState.restriction === 'mechamaru') {
      potentialMaxHp = 35;
      potentialMaxCe = (50 + (updatedStats.ce || 0) * 6) * 3.5;
    }

    const nextFactor = nextAge >= 18 ? 1.0 : (0.2 + 0.8 * (nextAge / 18));
    let nextMaxHp = Math.max(25, Math.floor(potentialMaxHp * nextFactor)) + hpBonus;
    let nextMaxCe = Math.max(10, Math.floor(potentialMaxCe * nextFactor)) + ceBonus;

    if (nextMaxHp < gameState.maxHp && nextAge < 45) nextMaxHp = gameState.maxHp + hpBonus;
    if (nextMaxCe < gameState.maxCe && nextAge < 45) nextMaxCe = gameState.maxCe + ceBonus;

    if (nextAge > 45 && yearsPassed > 0) {
      const decay = Math.floor((nextAge - 45) / 5) * yearsPassed;
      if (Math.random() < 0.2) nextMaxHp = Math.max(1, nextMaxHp - decay);
      if (Math.random() < 0.1) nextMaxCe = Math.max(0, nextMaxCe - decay);
    }

    let updatedState: GameState = {
      ...gameState,
      age: nextAge,
      curMonth: nextMonth,
      curYear: nextYear,
      maxHp: nextMaxHp,
      maxCe: nextMaxCe,
      hp: Math.min(nextMaxHp, gameState.hp + hpBonus + Math.floor(updatedStats.end * 0.6)),
      ce: Math.min(nextMaxCe, gameState.ce + Math.floor(updatedStats.mst * 0.5)),
      stats: updatedStats,
      npcs: updatedNpcs
    };

    updatedState = checkLevelUp(updatedState, xpBonus + 20);

    setGameState(updatedState);

    if (childBorn) {
      const birthCard: FeedCard = {
        id: `birth_announcement_${Date.now()}`,
        age: nextAge,
        year: nextYear,
        month: nextMonth,
        title: "🍼 SOUL VESSEL FRUITION — CHILD BORN!",
        text: `Incredibly, during your ${regimen.mo} month training, your newborn child, ${bornChildName}, is safely born! Healthy spiritual flows aura the room!`,
        cat: 'social',
        chips: [{ l: "Npcs Updated", c: "pos" }],
        choices: []
      };
      setFeedCards(prev => [...prev, birthCard]);
    }

    // Insert procedural training notification in chronology
    const trainCard: FeedCard = {
      id: `training_${Date.now()}`,
      age: nextAge,
      year: nextYear,
      month: nextMonth,
      title: 'TRAINING DISCIPLINE COMPLETED',
      text: `You complete ${regimen.mo} month${regimen.mo > 1 ? 's' : ''} of dedicated [${regimen.name}]. Your physical core realigns to focus baseline pressure.`,
      cat: 'training',
      chips: [{ l: regimen.eff, c: 'pos' }],
      choices: null
    };

    setFeedCards(prev => [...prev, trainCard]);
  };

  const handleSelectAction = (actionKey: string) => {
    if (gameState.isDead || gameState.pendingChoice) return;
    
    // First, process things that just trigger other modals
    if (actionKey === 'train') {
      setModalOpen('train');
      return;
    }
    if (actionKey === 'passtime') {
      setModalOpen('passtime');
      return;
    }

    setModalOpen(null);
    Snd.ui();

    // Now process the instant actions
    let costHp = 0;
    let costCe = 0;
    let msg = '';
    let updatedState = { ...gameState };

    if (actionKey === 'meditate') {
      if (updatedState.hp >= updatedState.maxHp && updatedState.ce >= updatedState.maxCe) {
        alert("You are already fully rested.");
        setModalOpen('actions');
        return;
      }
      costHp = -30; // Heals 30
      costCe = -50; // Heals 50
      msg = "🧘 You spent 1 month in deep meditation. Regained substantial HP and CE.";
    } else if (actionKey === 'study') {
      costHp = 10;
      costCe = 15;
      if (updatedState.hp <= costHp || updatedState.ce <= costCe) {
        alert(`You need at least ${costHp} HP and ${costCe} CE to study.`);
        setModalOpen('actions');
        return;
      }
      updatedState.stats.mst = Math.min(20, updatedState.stats.mst + 1);
      msg = "📚 You spent 1 month studying Jujutsu theories and advanced barriers. Gained +1 Mastery.";
    } else if (actionKey === 'scavenge') {
      costHp = 20;
      if (updatedState.hp <= costHp) {
        alert("You are too exhausted to scavenge. (Needs 20 HP)");
        setModalOpen('actions');
        return;
      }
      const credGain = Math.floor(Math.random() * 30) + 15;
      updatedState.credits = (updatedState.credits || 0) + credGain;
      const repGain = Math.random() > 0.4 ? 1 : 0;
      updatedState.reputation = (updatedState.reputation || 0) + repGain;
      msg = `🕵️ You spent 1 month working and scavenging. Gained ${credGain} ¥${repGain ? ' and +1 Reputation' : ''}.`;
    } else if (actionKey === 'network') {
      const costCred = 50;
      if (updatedState.credits < costCred) {
        alert("You need at least 50 ¥ to network and socialize in the city.");
        setModalOpen('actions');
        return;
      }
      updatedState.credits -= costCred;
      updatedState.npcs = updatedState.npcs.map(n => ({
        ...n,
        bond: Math.min(100, n.bond + Math.floor(Math.random() * 5) + 2),
        trust: Math.min(100, n.trust + Math.floor(Math.random() * 4) + 1)
      }));
      msg = "🤝 You spent 1 month and 50 ¥ socializing. Your bonds and trust with allies have improved.";
    } else if (actionKey === 'clinic') {
      const costCred = 100;
      if (updatedState.credits < costCred) {
        alert("You need at least 100 ¥ to afford black clinic treatment.");
        setModalOpen('actions');
        return;
      }
      updatedState.credits -= costCred;
      costHp = -(updatedState.maxHp - updatedState.hp); // Heals to max
      msg = "🏥 You spent 1 month and 100 ¥ at the clinic. Your HP is completely restored through Reverse Cursed Technique.";
    } else if (actionKey === 'crime') {
      costHp = 40;
      if (updatedState.hp <= costHp) {
        alert("You are too weak to take on a shady curse user job. (Needs > 40 HP)");
        setModalOpen('actions');
        return;
      }
      // Risk of injury or success
      const success = Math.random() > 0.3;
      updatedState.reputation = (updatedState.reputation || 0) - Math.floor(Math.random() * 3 + 1); // Lose rep
      if (success) {
        const steal = Math.floor(Math.random() * 150) + 50;
        updatedState.credits += steal;
        msg = `🔪 You spent 1 month completing an underground hit. Success! You stole ${steal} ¥ but your reputation dropped.`;
      } else {
        const dmg = Math.floor(Math.random() * 30) + 10;
        costHp += dmg; // Extra damage
        msg = `🔪 You spent 1 month on a shady job but it went wrong! You failed, took extra damage (-${dmg} HP), and your reputation dropped.`;
      }
    } else if (actionKey === 'gamble') {
      const costCred = 20;
      if (updatedState.credits < costCred) {
        alert("You need at least 20 ¥ to play pachinko.");
        setModalOpen('actions');
        return;
      }
      updatedState.credits -= costCred;
      const win = Math.random() > 0.65;
      if (win) {
        const payout = Math.floor(Math.random() * 80) + 40;
        updatedState.credits += payout;
        msg = `🎰 You played pachinko and hit a jackpot! Won ${payout} ¥!`;
      } else {
        msg = `🎰 You played pachinko and lost your 20 ¥ bet. Better luck next time.`;
      }
    } else if (actionKey === 'pet') {
      const costCred = 300;
      if (updatedState.credits < costCred) {
        alert("You need at least 300 ¥ to adopt a Shikigami pet.");
        setModalOpen('actions');
        return;
      }
      updatedState.credits -= costCred;
      const petNames = ["Kuro", "Shiro", "Pochi", "Tama", "Inu", "Tora", "Gyokuso"];
      const petName = petNames[Math.floor(Math.random() * petNames.length)];
      updatedState.npcs.push({
        name: `${petName} (Pet)`,
        rel: 'Adopted Child', // using this to allow interaction but acts like a pet
        bond: 100,
        trust: 100,
        respect: 100,
        fear: 0,
        gender: Math.random() > 0.5 ? 'M' : 'F'
      });
      msg = `🐕 You paid 300 ¥ and adopted a Shikigami pet named ${petName}!`;
    }

    // Apply costs
    updatedState.hp = Math.max(1, Math.min(updatedState.maxHp, updatedState.hp - costHp));
    updatedState.ce = Math.max(0, Math.min(updatedState.maxCe, updatedState.ce - costCe));

    // Time pass for these actions is 1 month (0 for gamble and pet)
    const monthsToPass = (actionKey === 'gamble' || actionKey === 'pet') ? 0 : 1;
    let nextMonth = updatedState.curMonth + monthsToPass;
    let nextYear = updatedState.curYear;
    let nextAge = updatedState.age;
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
      nextAge += 1;
    }
    
    updatedState.curMonth = nextMonth;
    updatedState.curYear = nextYear;
    updatedState.age = nextAge;

    setGameState(updatedState);

    const actionCard: FeedCard = {
      id: `action_${Date.now()}`,
      age: nextAge,
      year: nextYear,
      month: nextMonth,
      title: "ACTIVITY COMPLETED",
      text: msg,
      cat: 'social',
      chips: [],
      choices: []
    };
    
    setFeedCards(prev => [...prev, actionCard]);
  };

  const handleSelectMission = (selectedCurse: EnemyTemplate) => {
    if (gameState.isDead || gameState.pendingChoice) return;
    setModalOpen(null);
    Snd.evt();
    setActiveEnemy(selectedCurse);
    setScreen('combat');
  };

  const handleVictoryCombat = (xpGained: number, creditsGained: number, copiedTechKey?: string, remainingHp?: number, remainingCe?: number) => {
    setScreen('game');
    Snd.lvl();

    let updatedFlags = { ...gameState.flags };
    let tamingNotify = '';
    if (activeEnemy?.isShikigami && activeEnemy?.shikiKey) {
      updatedFlags[`tamed_${activeEnemy.shikiKey}`] = true;
      tamingNotify = `✓ SHIKIGAMI BOUND: The spirit signature of [${activeEnemy.name}] is successfully subdued and permanently bound to your shadow collection. You can now summon them to fight beside you!`;
    }

    const isSatoruDuel = activeEnemy?.name === 'Satoru Gojo (True Limitless)';
    if (isSatoruDuel) {
      updatedFlags['six_eyes_clash'] = false;
      updatedFlags['six_eyes'] = true;
      updatedFlags['six_eyes_active'] = true;
      tamingNotify = `🌌 THE SIX EYES AWAKEN: You have defeated Satoru Gojo in high-stakes mortal combat! Satoru bows, acknowledging your superior mastery. Under the stellar winds, Satoru's cosmic suppressive seal shatters, and your own Six Eyes fully unseal! Your CE usage is now reduced by 99.99% permanently!`;
    }

    let repGain = 5;
    if (activeEnemy?.grade === 'Special Grade') repGain = 45;
    else if (activeEnemy?.grade === 'Grade 1') repGain = 20;
    else if (activeEnemy?.grade === 'Grade 2') repGain = 10;
    else if (activeEnemy?.grade === 'Grade 3') repGain = 5;

    let updatedHp = remainingHp !== undefined ? remainingHp : gameState.hp;
    // Add a slight natural regen
    updatedHp = Math.min(gameState.maxHp, updatedHp + Math.floor(gameState.stats.end * 1.5));
    
    let updatedCe = remainingCe !== undefined ? remainingCe : gameState.ce;
    updatedCe = Math.min(gameState.maxCe, updatedCe + Math.floor(gameState.stats.mst * 2));

    let updatedState = {
      ...gameState,
      credits: gameState.credits + creditsGained,
      hp: updatedHp,
      ce: updatedCe,
      reputation: (gameState.reputation || 0) + repGain,
      copiedTechKey: copiedTechKey !== undefined ? copiedTechKey : gameState.copiedTechKey,
      flags: updatedFlags
    };

    if (isSatoruDuel) {
      updatedState.maxCe += 1000;
      updatedState.ce = updatedState.maxCe;
    }

    updatedState = checkLevelUp(updatedState, xpGained);
    setGameState(updatedState);

    // Dynamic feed notification
    const winCard: FeedCard = {
      id: `battle_win_${Date.now()}`,
      age: gameState.age,
      year: gameState.curYear,
      month: gameState.curMonth,
      title: isSatoruDuel ? '👁️ UNLIMITED SIX EYES ASCENT' : (activeEnemy?.isShikigami ? 'SHIKIGAMI BOUND & TAMED' : 'MISSION COMPLETE: EXORCISM'),
      text: tamingNotify || `Mission successful. You completed an exorcism of the rogue threat. The atmospheric negative pressure settles. Your core registers deep experience gains.`,
      cat: 'combat',
      chips: [
        { l: `+${xpGained} XP`, c: 'pos' },
        { l: `+${creditsGained} Credits (¥)`, c: 'pos' },
        { l: `+${repGain} REP`, c: 'pos' }
      ],
      choices: null
    };

    setFeedCards(prev => [...prev, winCard]);
  };

  const handleDefeatCombat = (cause: string) => {
    setScreen('game');
    Snd.death();

    setGameState(prev => ({
      ...prev,
      isDead: true,
      flags: { ...prev.flags, killedByCombat: true }
    }));
  };

  const handleFleeCombat = () => {
    setScreen('game');
    Snd.ui();

    const escapeCard: FeedCard = {
      id: `battle_skip_${Date.now()}`,
      age: gameState.age,
      year: gameState.curYear,
      month: gameState.curMonth,
      title: 'MISSION: TACTICAL ESCAPE',
      text: `Mission aborted. You deployed decoy particles to slip out of the curse combat lock. Vitals stabilized safely at base.`,
      cat: 'combat',
      chips: [{ l: 'TACTICAL RETREAT', c: 'neu' }],
      choices: null
    };

    setFeedCards(prev => [...prev, escapeCard]);
  };

  const handleReincarnate = () => {
    Snd.forge();
    setParentInheritance(null);
    setRebirthCount(prev => prev + 1);
    setScreen('forge');
  };

  const handlePlayOffspring = () => {
    Snd.forge();
    setParentInheritance(gameState);
    setRebirthCount(prev => prev + 1);
    setScreen('forge');
  };

  return (
    <div className="min-h-screen bg-black select-none">
      {screen === 'menu' && (
        <MainMenu
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          canContinue={canContinue}
        />
      )}

      {screen === 'forge' && (
        <VesselForge
          onBack={() => setScreen('menu')}
          onAwaken={handleAwakenVessel}
          parentInheritance={parentInheritance}
        />
      )}

      {screen === 'combat' && activeEnemy && (
        <CombatScreen
          player={gameState}
          enemyTemplate={activeEnemy}
          onVictory={handleVictoryCombat}
          onDefeat={handleDefeatCombat}
          onFlee={handleFleeCombat}
        />
      )}

      {screen === 'game' && (
        <div className="flex flex-col h-screen bg-[#020504] text-[#a4c8aa] font-mono overflow-hidden">          {/* Main Top Header Navbar */}
          <header className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#040908] border-b border-[#112019] flex-shrink-0 gap-2 select-none">
            <div className="flex items-center gap-3">
              <span
                onClick={() => {
                  Snd.ui();
                  setScreen('menu');
                }}
                className="text-lg font-bold text-[#00ff9c] font-vt uppercase cursor-pointer"
              >
                // Cursed Realm //
              </span>
              <span className="text-xs text-[#a4c8aa] bg-black border border-[#112019] px-2 py-0.5 font-bold uppercase rounded-sm">
                AGE {gameState.age}
              </span>
              <span className="text-[10px] text-[#2e4a34] tracking-[0.1em] font-semibold uppercase">
                {gameState.curMonth}/12 · Yr {gameState.curYear}
              </span>
            </div>

            <div className="flex items-center gap-3 select-none">
              <span className="text-xs uppercase border border-[#ffcc00] px-2 py-0.5 text-[#ffcc00] bg-[#ffcc00]/5 font-bold rounded-sm tracking-widest font-vt text-shadow-orange">
                {gameState.rank}
              </span>
              <span className="text-xs text-[#628a6a] font-bold bg-[#020504] border border-[#112019] px-2 py-0.5">
                LVL {gameState.level}
              </span>
              <span className="text-xs text-[#00ff9c] bg-[#112019]/(30) border border-[#00c47a]/20 px-2 py-0.5">
                {gameState.credits} ¥
              </span>
            </div>
          </header>

          {/* Mobile Tabs Navigation */}
          <div className="md:hidden flex border-b border-[#112019] flex-shrink-0 bg-black">
            <button
              onClick={() => { Snd.ui(); setMobileTab('stats'); }}
              className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-widest border-r border-[#112019] ${mobileTab === 'stats' ? 'text-[#00ff9c] bg-[#00ff9c]/5' : 'text-[#2e4a34]'}`}
            >
              Stats
            </button>
            <button
              onClick={() => { Snd.ui(); setMobileTab('feed'); }}
              className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-widest border-r border-[#112019] ${mobileTab === 'feed' ? 'text-[#00ff9c] bg-[#00ff9c]/5' : 'text-[#2e4a34]'}`}
            >
              Events
            </button>
            <button
              onClick={() => { Snd.ui(); setMobileTab('activities'); }}
              className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-widest ${mobileTab === 'activities' ? 'text-[#00ff9c] bg-[#00ff9c]/5' : 'text-[#2e4a34]'}`}
            >
              Activities
            </button>
          </div>

          {/* Central Workspace Dashboard */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Left status bars panel */}
            <aside className={`${mobileTab === 'stats' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-56 bg-[#040908] border-b md:border-b-0 md:border-r border-[#112019] p-4 space-y-4 flex-shrink-0 select-none overflow-y-auto`}>
              <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-1 font-extrabold select-none border-b border-[#112019] pb-1">
                // Vital Meters //
              </h4>

              {/* HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#2e4a34] font-bold">VITALS (HP)</span>
                  <span className={gameState.hp / gameState.maxHp < 0.3 ? 'text-red-500 font-bold' : 'text-[#00ff9c]'}>
                    {gameState.hp}/{gameState.maxHp}
                  </span>
                </div>
                <div className="h-2 border border-[#112019] bg-black relative">
                  <div
                    className={`h-full transition-all duration-300 ${gameState.hp / gameState.maxHp < 0.3 ? 'bg-red-500 animate-pulse' : 'bg-[#00c47a]'}`}
                    style={{ width: `${Math.max(0, (gameState.hp / gameState.maxHp) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* CE Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#2e4a34] font-bold">RESOURCING (CE)</span>
                  <span className="text-purple-400 font-bold">{gameState.ce}/{gameState.maxCe}</span>
                </div>
                <div className="h-2 border border-[#112019] bg-black">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, (gameState.ce / gameState.maxCe) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* XP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#2e4a34] font-bold">CHRONICLE INDEX (XP)</span>
                  <span className="text-amber-400 font-bold">{gameState.xp}/{gameState.xpToNext}</span>
                </div>
                <div className="h-1.5 border border-[#112019] bg-black">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, (gameState.xp / gameState.xpToNext) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Secondary Baseline parameters */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-1 font-extrabold select-none border-b border-[#112019] pb-1 pt-1">
                  // Baseline Attributes //
                </h4>
                <div className="grid grid-cols-2 gap-1.5 border border-[#112019] bg-black p-1.5 rounded-sm text-center">
                  {Object.entries(gameState.stats).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center px-1">
                      <span className="text-[#2e4a34] text-[8px] font-bold uppercase">{k}</span>
                      <span className="text-[#00ff9c] font-bold text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biological Lineage info */}
              <div className="space-y-1 bg-black border border-[#112019] p-2 rounded-sm text-[10px]">
                <div className="text-[8px] text-[#2e4a34] font-extrabold tracking-widest uppercase border-b border-[#112019] pb-0.5 mb-1 select-none">
                  // Biological Lineage //
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[#2e4a34] uppercase font-extrabold text-[8px]">Father</span>
                  <span className="text-[#a4c8aa] font-semibold text-[11px] truncate max-w-[110px]" title={gameState.fatherName}>{gameState.fatherName}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[#2e4a34] uppercase font-extrabold text-[8px]">Mother</span>
                  <span className="text-[#a4c8aa] font-semibold text-[11px] truncate max-w-[110px]" title={gameState.motherName}>{gameState.motherName}</span>
                </div>
              </div>
            </aside>

            {/* Central chronology feed */}
            <main className={`${mobileTab === 'feed' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-black/40 overflow-hidden relative`}>
              <LifeFeed cards={feedCards} onChoose={handleChooseOption} />
            </main>

            {/* Right statistics panels */}
            <div className={`${mobileTab === 'activities' ? 'flex' : 'hidden'} md:flex flex-col flex-1 md:flex-none h-full`}>
              <RightTabs player={gameState} onUpdatePlayer={setGameState} onChallengeShikigami={(shiki) => {
                setActiveEnemy(shiki);
                setScreen('combat');
              }} />
            </div>
          </div>

          {/* Bottom active control buttons bar */}
          <footer className="px-2 md:px-4 py-3 bg-[#040908] border-t border-[#112019] flex-shrink-0 flex flex-col gap-2.5 select-none">
            {/* Main Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full">
              <button
                onClick={handleAgeUp}
                disabled={gameState.pendingChoice || gameState.isDead}
                className={`py-3 px-2 border ${
                  gameState.pendingChoice || gameState.isDead
                    ? 'border-[#112019] text-[#2e4a34] opacity-40 cursor-not-allowed'
                    : 'border-[#00ff9c] text-[#00ff9c] hover:bg-[rgba(0,255,156,0.06)] hover:shadow-[0_0_15px_rgba(0,255,156,0.2)] cursor-pointer'
                } font-vt tracking-widest md:tracking-[0.15em] font-extrabold text-sm md:text-lg uppercase transition-all`}
              >
                ++ Age Up (+1 Year)
              </button>

              <button
                onClick={() => {
                  Snd.ui();
                  setModalOpen('actions');
                }}
                disabled={gameState.pendingChoice || gameState.isDead}
                className={`col-span-1 md:col-span-2 py-3 px-2 border font-vt tracking-[0.15em] font-extrabold text-sm md:text-lg uppercase transition-all ${
                  gameState.pendingChoice || gameState.isDead
                    ? 'border-[#112019] text-[#2e4a34] opacity-40 cursor-not-allowed'
                    : 'border-cyan-900 text-cyan-400 bg-cyan-950/20 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-900/40 cursor-pointer'
                }`}
              >
                🛠️ Open Activities & Actions
              </button>

              <button
                onClick={() => {
                  Snd.ui();
                  setModalOpen('missions');
                }}
                disabled={gameState.pendingChoice || gameState.isDead || !gameState.flags.enrolledHigh}
                className={`py-3 px-2 border font-vt tracking-[0.15em] font-extrabold text-sm md:text-lg uppercase transition-all ${
                  gameState.pendingChoice || gameState.isDead || !gameState.flags.enrolledHigh
                    ? 'border-[#112019] text-[#2e4a34] opacity-40 cursor-not-allowed'
                    : 'border-red-900 text-red-500 bg-red-950/20 hover:border-red-400 hover:text-red-400 hover:bg-red-900/40 cursor-pointer'
                }`}
              >
                {!gameState.flags.enrolledHigh ? "🔒 Missions (Enroll First)" : "⚔ Missions & Tasks"}
              </button>
            </div>

            {/* Row 3: System Menu */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={handleSave}
                disabled={gameState.isDead}
                className="py-1.5 px-6 border border-[#112019] text-[#2e4a34] hover:border-[#00c47a] hover:text-[#00ff9c] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer bg-black/20"
              >
                💾 Save Game
              </button>
              <button
                onClick={() => {
                  Snd.ui();
                  setScreen('menu');
                }}
                className="py-1.5 px-6 border border-[#112019] text-[#2e4a34] hover:border-red-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer bg-black/20"
              >
                ↩ Main Menu
              </button>
            </div>
          </footer>

          {/* Dynamic timer & conditioning overlays */}
          <Modals
            modalOpen={modalOpen}
            onClose={() => setModalOpen(null)}
            onSelectPassTime={handleSelectPassTime}
            onSelectTrain={handleSelectTrain}
            onSelectMission={handleSelectMission}
            onSelectAction={handleSelectAction}
            playerLevel={gameState.level}
          />

          {/* Stark holographic overlay depicting mortal defeat */}
          {gameState.isDead && (
            <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
              <div className="max-w-md w-full border border-red-500 p-6 bg-[#040908] shadow-[0_0_50px_rgba(239,68,68,0.3)] rounded-sm space-y-6">
                <div>
                  <div className="text-red-500 text-6xl animate-bounce mb-2 font-vt">☠</div>
                  <h3 className="text-3xl font-bold text-red-500 font-vt uppercase tracking-widest">
                    Vessel Flatlined
                  </h3>
                  <p className="text-xs text-[#628a6a] italic font-sans leading-relaxed mt-2 p-1.5 border border-red-500/10 bg-red-950/15">
                    Your physical constructs and CE parameters collapsed under fatal strain.
                  </p>
                </div>

                <div className="border border-[#112019] bg-black p-3 rounded-sm text-left">
                  <p className="text-[8px] text-[#2e4a34] tracking-widest uppercase font-bold mb-2">
                    // Historical Analytics //
                  </p>
                  <div className="space-y-1.5 text-xs text-[#a4c8aa]">
                    <div className="flex justify-between border-b border-[#112019]/40 pb-1">
                      <span className="text-[#2e4a34]">NAME:</span>
                      <span className="font-bold">{gameState.fullName || gameState.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#112019]/40 pb-1">
                      <span className="text-[#2e4a34]">CLAN:</span>
                      <span className="font-bold text-[#00c47a]">{gameState.clanName}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#112019]/40 pb-1">
                      <span className="text-[#2e4a34]">AGE COMPLETED:</span>
                      <span className="font-bold">{gameState.age} Years</span>
                    </div>
                    <div className="flex justify-between border-b border-[#112019]/40 pb-1">
                      <span className="text-[#2e4a34]">RANK ATTAINED:</span>
                      <span className="text-[#ffcc00] font-bold uppercase">{gameState.rank}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#112019]/40 pb-1">
                      <span className="text-[#2e4a34]">LEVEL SCALE:</span>
                      <span className="font-bold">Lvl {gameState.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2e4a34]">REBIRTH COUNT:</span>
                      <span className="text-purple-400 font-bold">{gameState.rebirths}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleReincarnate}
                    className="w-full py-3 border border-purple-500/60 text-purple-400 hover:text-purple-300 hover:border-purple-300 hover:bg-purple-950/20 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    ◈ Reincarnate (Memory Surge)
                  </button>
                  <button
                    onClick={handlePlayOffspring}
                    className="w-full py-3 border border-[#00c47a] text-[#00ff9c] hover:bg-[rgba(0,255,156,0.06)] hover:shadow-[0_0_10px_rgba(0,255,156,0.2)] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    ⟢ Play as Offspring (Inherited Surname)
                  </button>
                  <button
                    onClick={() => {
                      setScreen('menu');
                    }}
                    className="w-full py-2.5 border border-[#112019] text-[#2e4a34] hover:border-[#628a6a] hover:text-[#a4c8aa] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ↩ Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
