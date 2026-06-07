/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Snd } from '../utils/sound';
import { EnemyTemplate, GameState, NpcBond } from '../types';

interface CombatScreenProps {
  player: GameState;
  enemyTemplate: EnemyTemplate;
  onVictory: (xpGained: number, creditsGained: number, copiedTechKey?: string, remainingHp?: number, remainingCe?: number) => void;
  onDefeat: (cause: string) => void;
  onFlee: () => void;
}

interface CombatLog {
  msg: string;
  type: 'player' | 'enemy' | 'crit' | 'system' | 'default';
}

interface DeployedCombatant {
  id: string; // "player", "partner", "shikigami", "enemy-0", "enemy-1", "enemy-2"
  name: string;
  hp: number;
  maxHp: number;
  ce: number;
  maxCe: number;
  agi: number;
  str: number;
  mst: number;
  type: 'player' | 'partner' | 'shikigami' | 'enemy';
  grade?: string;
  shikiKey?: string;
  stunned: number;
  burn: number;
  frost: number;
  barrier: number;
  isDead: boolean;
  x?: number;
  y?: number;
}

export default function CombatScreen({
  player,
  enemyTemplate,
  onVictory,
  onDefeat,
  onFlee
}: CombatScreenProps) {
  // Pre-combat deployment controls
  const [showPreSetup, setShowPreSetup] = useState(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('none');
  const [selectedShikiId, setSelectedShikiId] = useState<string>('none');
  const [currentCopiedTechKey, setCurrentCopiedTechKey] = useState<string>(player.copiedTechKey || '');

  // Turn battle states
  const [combatTurn, setCombatTurn] = useState<number>(1);
  const [combatants, setCombatants] = useState<DeployedCombatant[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const [logs, setLogs] = useState<CombatLog[]>([]);
  const [locked, setLocked] = useState(false);

  // Buff stats that affect the player
  const [persistentAtkBuff, setPersistentAtkBuff] = useState(0);
  const [delayedSurgeDmg, setDelayedSurgeDmg] = useState(0);
  const [ratioTurns, setRatioTurns] = useState(0);

  // Domain Clashing parameters
  const [clashActive, setClashActive] = useState(false);
  const [clashValue, setClashValue] = useState(50); // 0 (lost) to 100 (won)
  const [clashLog, setClashLog] = useState<string>('');
  const [clashPlayerMultiplier, setClashPlayerMultiplier] = useState(1.0);
  const [clashVisualBoundEffect, setClashVisualBoundEffect] = useState(false);

  // Projection Sorcery (Frame planning)
  const [isPlanningProject, setIsPlanningProject] = useState(false);
  const [projectQueue, setProjectQueue] = useState<string[]>([]);
  const [showShikiSummonMenu, setShowShikiSummonMenu] = useState(false);
  const [projectionEffectActive, setProjectionEffectActive] = useState(false);

  // Mahoraga Adaptation State Machines
  const [mahoragaTotalSpins, setMahoragaTotalSpins] = useState<number>(0);
  const [mahoragaAttackHits, setMahoragaAttackHits] = useState<Record<string, number>>({});
  const [mahoragaAdaptedAttacks, setMahoragaAdaptedAttacks] = useState<string[]>([]);

  // Selection states for Speech words and Construction items
  const [showSpeechBubbleSelection, setShowSpeechBubbleSelection] = useState<boolean>(false);
  const [showConstructSelection, setShowConstructSelection] = useState<boolean>(false);
  const [showBoogieMenu, setShowBoogieMenu] = useState<boolean>(false);

  // Custom technique trackers
  const [customSkillCooldownActive, setCustomSkillCooldownActive] = useState<number>(0);
  const [showCustomMoveSelector, setShowCustomMoveSelector] = useState<boolean>(false);
  const [customMoveCooldowns, setCustomMoveCooldowns] = useState<Record<string, number>>({});

  // Tactical Radar & Spatial Systems
  const [selectedSpatialTarget, setSelectedSpatialTarget] = useState<string | null>(null);
  const [radarMode, setRadarMode] = useState<'idle' | 'move'>('idle');

  const getDistance = (a: DeployedCombatant, b: DeployedCombatant) => {
    if (a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) return 999;
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  };

  const processDamageToMahoraga = (rawDamage: number, attackName: string) => {
    const normalizedKey = attackName.toLowerCase().trim();
    const currentHits = (mahoragaAttackHits[normalizedKey] || 0) + 1;
    const newTotalSpins = mahoragaTotalSpins + 1;
    
    // Check if already adapted as whole (8+ total spins, or 8+ hits for this one attack)
    if (mahoragaTotalSpins >= 8 || currentHits >= 8 || newTotalSpins >= 8) {
      const finalDmg = Math.max(1, Math.floor(rawDamage * 0.1)); // 90% damage reduction!
      return {
        finalDamage: finalDmg,
        spinLog: `⚙️ CLANG! Divine General Mahoraga has completed 8 spins and adapted to the opponent as a whole! Absolute law of adaptation reduces all damage by 90%: took ${finalDmg} damage.`
      };
    }
    
    // Check if adapted to this specific attack
    if (mahoragaAdaptedAttacks.includes(normalizedKey)) {
      return {
        finalDamage: 0,
        spinLog: `⚙️ CLANG! CLANG! Divine General Mahoraga has completely adapted to [${attackName}]! The attack is completely nullified: took 0 damage!`
      };
    }
    
    // Otherwise, progress adaptation
    setMahoragaAttackHits(prev => ({ ...prev, [normalizedKey]: currentHits }));
    setMahoragaTotalSpins(newTotalSpins);
    
    let isNowAdapted = false;
    
    // Adapts to specific attack if hit 3 times (spinned 3 times for this attack)
    if (currentHits >= 3) {
      isNowAdapted = true;
      setMahoragaAdaptedAttacks(prev => {
        if (!prev.includes(normalizedKey)) {
          return [...prev, normalizedKey];
        }
        return prev;
      });
    }
    
    let spinLog = `⚙️ CLANG! Divine General Mahoraga's eight-handled law wheel spins! (Wheel Spin ${newTotalSpins}/8). Progressing adaptation to [${attackName}] (${currentHits}/3 hits)...`;
    if (isNowAdapted) {
      spinLog = `⚙️ CLANG-CLANG! Complete Adaptation achieved! Divine General Mahoraga has fully adapted to [${attackName}] specifically! Future strikes of [${attackName}] are now fully nullified!`;
    }
    
    if (newTotalSpins >= 8 || currentHits >= 8) {
      spinLog = `⚙️ THE LAW OF ADAPTATION IS COMPLETED! The wheel completes 8 spins (Hits for [${attackName}]: ${currentHits}, Total spins: ${newTotalSpins}). Divine General Mahoraga has adapted to the enemy as a whole! Dmg reduced by 90%!`;
    }
    
    return {
      finalDamage: isNowAdapted ? 0 : rawDamage,
      spinLog
    };
  };

  const PROJECT_ACTIONS = [
    { key: 'strike', name: 'Kinetic Strike', desc: 'Swift frame jab. Deals light speed damage.', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/10' },
    { key: 'evade', name: 'Aero-Evade', desc: 'Evade physics grids. Adds +15% perfect dodge.', color: 'text-sky-400 border-sky-500/30 bg-sky-950/10' },
    { key: 'accel', name: 'Velocity Accel', desc: 'Program high velocity. Surges damage of the whole sequence.', color: 'text-amber-400 border-amber-500/30 bg-amber-950/10' },
    { key: 'freeze', name: 'Freeze Frame', desc: 'Touch target to stun them after the combo.', color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/10' },
    { key: 'move_fwd', name: 'Move Forward', desc: 'Advance tactical grid position (+1 Coord Y)', color: 'text-teal-400 border-teal-500/30 bg-teal-950/10' },
    { key: 'move_back', name: 'Move Retreat', desc: 'Retreat tactical grid position (-1 Coord Y)', color: 'text-blue-400 border-blue-500/30 bg-blue-950/10' },
  ];

  const logEndRef = useRef<HTMLDivElement>(null);

  // Core setup checklist: allies eligibility list
  const eligiblePartners = [
    ...(player.flags.enrolledHigh ? [
      { id: 'jujutsu_megumi', name: 'Megumi Fushiguro', desc: 'Ten Shadows Prodigy - Deploys stuns and coordinates battles.', agi: 14, str: 10, mst: 14, hp: 120, ce: 50 },
      { id: 'jujutsu_nobara', name: 'Nobara Kugisaki', desc: 'Straw Doll expert - High-piercing resonance.', agi: 11, str: 9, mst: 12, hp: 110, ce: 40 },
      { id: 'jujutsu_maki', name: 'Maki Zenin', desc: 'Heavenly Restricted - High physical steel weapons.', agi: 18, str: 16, mst: 0, hp: 140, ce: 0 },
      { id: 'jujutsu_todo', name: 'Aoi Todo', desc: 'Grade 1 - Boogie Woogie coordinate swaps.', agi: 16, str: 20, mst: 12, hp: 200, ce: 60 }
    ] : []),
    ...(player.level >= 15 && player.flags.enrolledHigh ? [
      { id: 'jujutsu_gojo', name: 'Satoru Gojo', desc: 'The Honored One - Limitless support.', agi: 25, str: 28, mst: 25, hp: 400, ce: 200 },
      { id: 'jujutsu_yuta', name: 'Yuta Okkotsu', desc: 'Special Grade - Rika and massive CE reserves.', agi: 18, str: 20, mst: 28, hp: 350, ce: 500 }
    ] : []),
    // Spouses & high-bond parents
    ...player.npcs
      .filter((n: NpcBond) => n.bond >= 50 && ['Father', 'Mother', 'Spouse', 'Friend', 'Best Friend'].includes(n.rel))
      .filter((n: NpcBond) => !['Aoi Todo', 'Megumi Fushiguro', 'Nobara Kugisaki', 'Maki Zenin', 'Satoru Gojo', 'Yuta Okkotsu'].includes(n.name))
      .map((npc: NpcBond) => ({
        id: `npc_${npc.name}`,
        name: `${npc.name} (${npc.rel})`,
        desc: `Bond level: ${npc.bond}. Ready to lay everything line for you. Supports with defensive shields.`,
        agi: 10,
        str: 11,
        mst: 10,
        hp: 110,
        ce: 35
      }))
  ];

  // Shikigamis unlocked list
  const eligibleShikis = [
    { key: 'dog', name: 'Divine Dog Totality', agi: 12, str: 9, mst: 6, hp: 80, ce: 20, desc: 'Swift claw slashing.' },
    { key: 'toad', name: 'Toad', agi: 10, str: 7, mst: 6, hp: 70, ce: 15, desc: 'Sticky elastic tongue lash.' },
    { key: 'nue', name: 'Nue (Thunder Bird)', agi: 15, str: 10, mst: 12, hp: 120, ce: 40, desc: 'Electrical shock stuns.' },
    { key: 'elephant', name: 'Max Elephant', agi: 6, str: 14, mst: 10, hp: 150, ce: 30, desc: 'Torrential joint-frost slows.' },
    { key: 'serpent', name: 'Great Serpent', agi: 10, str: 17, mst: 12, hp: 180, ce: 40, desc: 'Ground coils binding.' },
    { key: 'rabbit', name: 'Rabbit Escape', agi: 16, str: 4, mst: 8, hp: 50, ce: 15, desc: 'Stampede distraction.' },
    { key: 'deer', name: 'Round Deer (Madoka)', agi: 8, str: 6, mst: 15, hp: 140, ce: 60, desc: 'RCT positive healing.' },
    { key: 'ox', name: 'Piercing Ox', agi: 5, str: 24, mst: 10, hp: 220, ce: 30, desc: 'Defending head charge charge.' },
    { key: 'tiger', name: 'Mourning Tiger', agi: 14, str: 16, mst: 12, hp: 190, ce: 35, desc: 'Fiery tearing slashes.' },
    { key: 'mahoraga', name: 'Divine General Mahoraga', agi: 18, str: 28, mst: 25, hp: 450, ce: 150, desc: 'Absolute adaptive power.' },
    // Synthesized Fusions
    { key: 'abyss', name: 'Wells Unknown Abyss', agi: 14, str: 11, mst: 10, hp: 120, ce: 35, desc: 'Electric sticky wings (Toad+Nue).' },
    { key: 'agito', name: 'Chimera Beast Agito', agi: 19, str: 25, mst: 22, hp: 350, ce: 100, desc: 'Omni beast fusion.' }
  ].filter(sh => !!player.flags[`tamed_${sh.key}`]);

  // Initialisation turn structure loader
  const handleDeployCommence = () => {
    Snd.forge();
    addLog(`Pre-deployment verified. Commencing combat engagement!`, 'system');

    // Compile participants list
    const list: DeployedCombatant[] = [];

    // 1. The Player
    list.push({
      id: 'player',
      name: player.fullName || player.name,
      hp: player.hp,
      maxHp: player.maxHp,
      ce: player.ce,
      maxCe: player.maxCe,
      agi: player.stats.agi,
      str: player.stats.str,
      mst: player.stats.mst,
      type: 'player',
      stunned: 0,
      burn: 0,
      frost: 0,
      barrier: 0,
      isDead: false
    });

    // 2. Selected Allied Partner
    if (selectedPartnerId !== 'none' && !enemyTemplate.isShikigami) {
      const part = eligiblePartners.find(p => p.id === selectedPartnerId);
      if (part) {
        list.push({
          id: part.id,
          name: part.name,
          hp: part.hp,
          maxHp: part.hp,
          ce: part.ce,
          maxCe: part.ce,
          agi: part.agi,
          str: part.str,
          mst: part.mst,
          type: 'partner',
          stunned: 0,
          burn: 0,
          frost: 0,
          barrier: 0,
          isDead: false
        });
      }
    }

    // 3. Selected Summoned Shikigami
    if (selectedShikiId !== 'none') {
      const sh = eligibleShikis.find(s => s.key === selectedShikiId);
      if (sh) {
        list.push({
          id: `shiki_${sh.key}`,
          name: sh.name,
          hp: sh.hp,
          maxHp: sh.hp,
          ce: sh.ce,
          maxCe: sh.ce,
          agi: sh.agi,
          str: sh.str,
          mst: sh.mst,
          type: 'shikigami',
          shikiKey: sh.key,
          stunned: 0,
          burn: 0,
          frost: 0,
          barrier: 0,
          isDead: false
        });
      }
    }

    // 4. Enemy targets
    if (enemyTemplate.isShikigami) {
      if (enemyTemplate.shikiKey === 'rabbit') {
        // Core Rabbit
        list.push({
          id: 'enemy-0', name: 'Rabbit Escape (Core)',
          hp: 40, maxHp: 40, ce: 50, maxCe: 50,
          agi: 16, str: 4, mst: 8, type: 'enemy', shikiKey: 'rabbit',
          grade: enemyTemplate.grade, stunned: 0, burn: 0, frost: 0, barrier: 0, isDead: false
        });
        // Infinite Clones (start with 11)
        for (let i = 1; i <= 11; i++) {
          list.push({
            id: `enemy-${i}`, name: 'Rabbit Escape (Clone)',
            hp: 20, maxHp: 20, ce: 10, maxCe: 10,
            agi: Math.floor(14 + Math.random() * 4), str: 2, mst: 4, type: 'enemy', shikiKey: 'rabbit',
            grade: enemyTemplate.grade, stunned: 0, burn: 0, frost: 0, barrier: 0, isDead: false
          });
        }
      } else {
        // Taming rituals always feature exactly 1 boss enemy (the shikigami)
        const eh = enemyTemplate.hp[0];
        const ec = enemyTemplate.ce[0];
        list.push({
          id: 'enemy-0',
          name: enemyTemplate.name,
          hp: eh,
          maxHp: eh,
          ce: ec,
          maxCe: ec,
          agi: enemyTemplate.agi[0],
          str: enemyTemplate.str[0],
          mst: enemyTemplate.mst[0],
          type: 'enemy',
          shikiKey: enemyTemplate.shikiKey,
          grade: enemyTemplate.grade,
          stunned: 0,
          burn: 0,
          frost: 0,
          barrier: 0,
          isDead: false
        });
      }
    } else {
      // Normal fights roll 1 to 3 enemies based on level
      const countRoll = Math.random();
      const enemyCount = countRoll < 0.6 || player.level < 4 ? 1 : countRoll < 0.9 ? 2 : 3;

      for (let i = 0; i < enemyCount; i++) {
        const hpVal = Math.floor(Math.random() * (enemyTemplate.hp[1] - enemyTemplate.hp[0] + 1)) + enemyTemplate.hp[0];
        const ceVal = Math.floor(Math.random() * (enemyTemplate.ce[1] - enemyTemplate.ce[0] + 1)) + enemyTemplate.ce[0];
        const suffix = enemyCount > 1 ? ` ${String.fromCharCode(65 + i)}` : '';

        list.push({
          id: `enemy-${i}`,
          name: `${enemyTemplate.name}${suffix}`,
          hp: hpVal,
          maxHp: hpVal,
          ce: ceVal,
          maxCe: ceVal,
          agi: Math.floor(enemyTemplate.agi[0] + Math.random() * 3),
          str: Math.floor(enemyTemplate.str[0] + Math.random() * 2),
          mst: Math.floor(enemyTemplate.mst[0] + Math.random() * 2),
          type: 'enemy',
          grade: enemyTemplate.grade,
          stunned: 0,
          burn: 0,
          frost: 0,
          barrier: 0,
          isDead: false
        });
      }
    }

    // SORT ALL COMBATANTS DESCENDING BY THEIR AGILITY STAT VALUE!
    const listWithCoords = list.map(c => {
      let x = 50;
      let y = 50;
      if (c.type === 'player') { x = 50; y = 80; }
      else if (c.type === 'partner') { x = 30; y = 80; }
      else if (c.type === 'shikigami') { x = 70; y = 80; }
      else if (c.type === 'enemy') { x = 15 + Math.random() * 70; y = 10 + Math.random() * 20; }
      return { ...c, x, y };
    });

    const sorted = [...listWithCoords].sort((a,b) => b.agi - a.agi);

    setCombatants(sorted);
    setShowPreSetup(false);

    // Initial battle report logs
    addLog(`Battle order compiled according to neurological Agility rates:`, 'system');
    sorted.forEach((combatant, order) => {
      addLog(`[${order + 1}] ${combatant.name} (type: ${combatant.type.toUpperCase()}, Agility: ${combatant.agi})`, 'system');
    });

    // Check if the fastest turn can be processed
    setTimeout(() => {
      triggerTurnCycle(sorted, 0);
    }, 600);
  };

  // Scroll logging panel to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: 'player' | 'enemy' | 'crit' | 'system' | 'default' = 'default') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  // ADVANCED TURN CYCLING LOGIC
  const triggerTurnCycle = (currentCombatants: DeployedCombatant[], targetIndex: number) => {
    if (checkBattleResults(currentCombatants)) return;

    let nextIdx = targetIndex % currentCombatants.length;
    let loopGuard = 0;

    // Find the next alive combatant
    while (currentCombatants[nextIdx].isDead && loopGuard < currentCombatants.length) {
      nextIdx = (nextIdx + 1) % currentCombatants.length;
      loopGuard++;
    }

    setActiveIdx(nextIdx);
    if (nextIdx <= activeIdx || nextIdx === 0) {
      setCombatTurn(t => t + 1);
    }
    const active = currentCombatants[nextIdx];

    // Tick down custom skill cooldowns when player starts their turn
    if (active.id === 'player') {
      setCustomSkillCooldownActive(prev => Math.max(0, prev - 1));
      setCustomMoveCooldowns(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] -= 1;
        });
        return next;
      });
    }

    // Tick down state conditions for active unit
    let updated = [...currentCombatants];
    if (active.burn > 0) {
      const burnDmg = 15;
      const nextHp = Math.max(0, active.hp - burnDmg);
      updated[nextIdx].hp = nextHp;
      updated[nextIdx].burn = Math.max(0, active.burn - 1);
      addLog(`🔥 THERMAL SHOCK: ${active.name} suffers ${burnDmg} black furnace burn tick. Vitals remaining: ${nextHp}/${active.maxHp}.`, 'enemy');
      
      if (nextHp <= 0) {
        updated[nextIdx].isDead = true;
        addLog(`☠ EXORCISED: ${active.name} disintegrated from fatal cell damage.`, 'system');
        setCombatants(updated);
        if (checkBattleResults(updated)) return;
      }
    }

    if (active.stunned > 0) {
      updated[nextIdx].stunned = Math.max(0, active.stunned - 1);
      addLog(`❄ INCAPACITATED: ${active.name} is caught in pocket space locks! Skip turn. Stuns left: ${active.stunned - 1}T.`, 'system');
      setCombatants(updated);
      setTimeout(() => {
        triggerTurnCycle(updated, nextIdx + 1);
      }, 900);
      return;
    }

    setCombatants(updated);

    // Resolve based on Unit Type
    if (active.type === 'player') {
      setLocked(false); // Enable controls for human player
      addLog(`▷ YOUR TURN! Select offense pattern or technique. Vitals: ${active.hp}/${active.maxHp} HP.`, 'player');
    } else if (active.type === 'partner') {
      setTimeout(() => {
        resolvePartnerAI(updated, nextIdx);
      }, 1000);
    } else if (active.type === 'shikigami') {
      setLocked(false); // Enable manual tactical choices for summoned teammate
      addLog(`▷ SHIKIGAMI COMMAND: Select actions for ${active.name}! Vitals: ${active.hp}/${active.maxHp} HP.`, 'player');
    } else if (active.type === 'enemy') {
      setTimeout(() => {
        resolveEnemyAI(updated, nextIdx);
      }, 1000);
    }
  };

  const checkBattleResults = (list: DeployedCombatant[]): boolean => {
    // Player status
    const playerUnit = list.find(u => u.id === 'player');
    if (!playerUnit || playerUnit.isDead) {
      addLog(`☢ CRITICAL CONCURRENCE: Your physical shell collapsed...`, 'system');
      setTimeout(() => {
        onDefeat(`Subdued during multi-curse engagement.`);
      }, 1200);
      return true;
    }

    // Rabbit Escape Taming Rule: Core Dies => All Die
    let modifiedList = [...list];
    let clonesDied = false;
    if (enemyTemplate.isShikigami && enemyTemplate.shikiKey === 'rabbit') {
      const coreRabbit = modifiedList.find(u => u.id === 'enemy-0' && u.name === 'Rabbit Escape (Core)');
      if (coreRabbit && coreRabbit.isDead) {
        modifiedList = modifiedList.map(u => {
          if (u.type === 'enemy' && !u.isDead) {
            clonesDied = true;
            return { ...u, isDead: true, hp: 0 };
          }
          return u;
        });
      }
    }
    
    if (clonesDied) {
       setCombatants(modifiedList);
    }

    // Enemies status
    const aliveEnemies = modifiedList.filter(u => u.type === 'enemy' && !u.isDead);
    if (aliveEnemies.length === 0) {
      addLog(`✓ EXORCISM PERFECTED: All threat sigils successfully cleared!`, 'system');
      setTimeout(() => {
        const playerState = modifiedList.find(u => u.id === 'player');
        const remainingHp = playerState ? Math.max(1, playerState.hp) : 1;
        const remainingCe = playerState ? Math.max(0, playerState.ce) : 0;
        const totalXp = enemyTemplate.isShikigami ? (enemyTemplate.shikiKey === 'mahoraga' ? 400 : 150) : enemyTemplate.xp + list.length * 10;
        const totalCredits = enemyTemplate.cr ? Math.floor(Math.random() * (enemyTemplate.cr[1] - enemyTemplate.cr[0] + 1)) + enemyTemplate.cr[0] : 15;
        onVictory(totalXp, totalCredits, currentCopiedTechKey, remainingHp, remainingCe);
      }, 1200);
      return true;
    }

    return false;
  };

  // RESOLVE ASSIST PARTNER AI TURNS automatically
  const resolvePartnerAI = (list: DeployedCombatant[], index: number) => {
    const ally = list[index];
    const targetIdx = list.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (targetIdx === -1) return;
    const target = list[targetIdx];

    let updated = [...list];
    
    // AI Spatial Movement Logic
    const dist = getDistance(ally, target);
    if (dist > 25) {
      const dx = (target.x || 50) - (ally.x || 50);
      const dy = (target.y || 20) - (ally.y || 80);
      const angle = Math.atan2(dy, dx);
      let moveDist = ally.agi;
      if (moveDist > dist - 25) moveDist = dist - 25; // stop at striking distance
      
      updated[index].x = (ally.x || 50) + Math.cos(angle) * moveDist;
      updated[index].y = (ally.y || 80) + Math.sin(angle) * moveDist;
      
      addLog(`👟 ${ally.name} advances by ${moveDist.toFixed(0)}m.`, 'system');

      // Check if distance is still too far to attack
      if (dist - moveDist > 25) {
        setCombatants(updated);
        setTimeout(() => triggerTurnCycle(updated, index + 1), 800);
        return;
      }
    }

    Snd.tech();
    const isGojo = ally.id === 'jujutsu_gojo';
    const isMaki = ally.id === 'jujutsu_maki';
    const isMegumi = ally.id === 'jujutsu_megumi';
    const isTodo = ally.id === 'jujutsu_todo';
    const isYuta = ally.id === 'jujutsu_yuta';
    const isNobara = ally.id === 'jujutsu_nobara';

    let baseDmg = ally.str * 2 + 10;
    let logMsg = '';

    if (isGojo) {
      baseDmg = ally.mst * 4.5;
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      logMsg = `🌀 SATORU GOJO executes [Reversal: Red]! Massive gravitational shock deals ${baseDmg} gravitational output to ${list[targetIdx].name} and stuns them!`;
    } else if (isMegumi) {
      const megumiShikis = [
        { name: 'Divine Dog Totality', dmgMult: 2.2, log: 'summons Divine Dog Totality! Feral fangs tear into' },
        { name: 'Toad', dmgMult: 1.5, log: 'summons Shadow Toads! Deals kinetic capture and restricts' },
        { name: 'Nue (Thunder Bird)', dmgMult: 2.0, log: 'summons Nue! Electrical dive-bomb strikes' },
        { name: 'Great Serpent', dmgMult: 2.5, log: 'summons Great Serpent from the shadows! Jaws clamp down on' },
        { name: 'Max Elephant', dmgMult: 1.8, log: 'summons Max Elephant! Torrential rapid water blasts crush' },
        { name: 'Rabbit Escape', dmgMult: 0.5, log: 'summons Rabbit Escape! Endless fuzzy confusion distracts' }
      ];
      const move = megumiShikis[Math.floor(Math.random() * megumiShikis.length)];
      baseDmg = ally.mst * move.dmgMult + 10;
      
      if (['Toad', 'Nue (Thunder Bird)', 'Max Elephant', 'Rabbit Escape'].includes(move.name)) {
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      }
      
      if (move.name === 'Rabbit Escape') {
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 2); // Disoriented effect
      }

      logMsg = `🔮 MEGUMI FUSHIGURO ${move.log} ${list[targetIdx].name} for ${baseDmg} damage!`;
    } else if (isMaki) {
      baseDmg = ally.str * 3.5;
      logMsg = `⚔ MAKI ZENIN swings special tool "Playful Cloud"! High impact metal friction inflicts ${baseDmg} physical armor-bypass damage onto ${list[targetIdx].name}!`;
    } else if (isNobara) {
      baseDmg = ally.mst * 2.5 + ally.str;
      logMsg = `🔨 NOBARA KUGISAKI strikes her Straw Doll with [Resonance]! Cursed Energy surges through ${list[targetIdx].name}'s soul for ${baseDmg} true damage!`;
    } else if (isTodo) {
      baseDmg = 0; // No damage for Boogie Woogie
      // Coordinates swap between target and player
      const pIdx = list.findIndex(u => u.id === 'player');
      if (pIdx !== -1) {
        const pUnit = updated[pIdx];
        const tUnit = updated[targetIdx];
        const tmpX = pUnit.x;
        const tmpY = pUnit.y;
        pUnit.x = tUnit.x;
        pUnit.y = tUnit.y;
        tUnit.x = tmpX;
        tUnit.y = tmpY;
      }
      logMsg = `👏 AOI TODO claps! [Boogie Woogie] flawlessly swaps your coordinates with ${list[targetIdx].name}!`;
    } else if (isYuta) {
      baseDmg = ally.mst * 5.0;
      const pIdx = list.findIndex(u => u.id === 'player');
      if (pIdx !== -1) updated[pIdx].hp = Math.min(updated[pIdx].maxHp, updated[pIdx].hp + 80);
      logMsg = `💍 YUTA OKKOTSU summons Rika! A devastating Cursed Attack deals ${baseDmg} output, whilst he outputs Reverse Cursed Energy to heal you for 80 HP!`;
    } else if (ally.id.includes('Father')) {
      baseDmg = Math.floor(ally.str * 2.5 + ally.mst * 1.5);
      logMsg = `🔥 ${ally.name} activates [Innate Output: Flare]! Scorching CE beams pierce ${list[targetIdx].name} for ${baseDmg} burning damage!`;
    } else if (ally.id.includes('Mother')) {
      baseDmg = Math.floor(ally.mst * 3.0);
      const healAmount = 40;
      const pIdx = list.findIndex(u => u.id === 'player');
      if (pIdx !== -1) updated[pIdx].hp = Math.min(updated[pIdx].maxHp, updated[pIdx].hp + healAmount);
      logMsg = `❄️ ${ally.name} weaves [Ice Ward & Reverse Cursed Healing]! Smashes ${list[targetIdx].name} for ${baseDmg} damage while restoring ${healAmount} HP to you!`;
    } else {
      // NPC Bonds, Spouse
      baseDmg = Math.floor(ally.str * 1.5 + 5);
      const shieldVal = 25;
      const pIdx = list.findIndex(u => u.id === 'player');
      if (pIdx !== -1) {
        updated[pIdx].barrier = (updated[pIdx].barrier || 0) + shieldVal;
      }
      logMsg = `💖 ${ally.name} shouts combat encouragement! Striking ${list[targetIdx].name} for ${baseDmg} damage while raising a Protective +${shieldVal} Shield on you!`;
    }

    const nextEnemyHp = Math.max(0, updated[targetIdx].hp - baseDmg);
    updated[targetIdx].hp = nextEnemyHp;
    addLog(logMsg, 'player');

    if (nextEnemyHp <= 0) {
      updated[targetIdx].isDead = true;
      addLog(`✓ EXORCISED: ${updated[targetIdx].name} was completely crushed.`, 'system');
    }

    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, index + 1);
    }, 1100);
  };

  // RESOLVE COMPANION SHIKIGAMI AI TURNS automatically
  const resolveShikigamiAI = (list: DeployedCombatant[], index: number) => {
    const sh = list[index];
    const targetIdx = list.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (targetIdx === -1) return;
    const target = list[targetIdx];

    let updated = [...list];

    // AI Spatial Movement Logic
    const dist = getDistance(sh, target);
    if (dist > 25) {
      const dx = (target.x || 50) - (sh.x || 50);
      const dy = (target.y || 20) - (sh.y || 80);
      const angle = Math.atan2(dy, dx);
      let moveDist = sh.agi;
      if (moveDist > dist - 25) moveDist = dist - 25; // stop at striking distance
      
      updated[index].x = (sh.x || 50) + Math.cos(angle) * moveDist;
      updated[index].y = (sh.y || 80) + Math.sin(angle) * moveDist;
      
      addLog(`👟 ${sh.name} advances by ${moveDist.toFixed(0)}m.`, 'system');

      // Check if distance is still too far to attack
      if (dist - moveDist > 25) {
        setCombatants(updated);
        setTimeout(() => triggerTurnCycle(updated, index + 1), 800);
        return;
      }
    }

    Snd.heavyHit();
    const key = sh.shikiKey;
    let baseDmg = sh.str * 2 + 5;
    let logMsg = '';

    if (key === 'dog') {
      baseDmg = Math.floor(sh.str * 2.8 + 10);
      logMsg = `🐺 Divine Dog (Totality) tears through ${list[targetIdx].name}'s posture! Rips and slashes for ${baseDmg} bleeding physical damage!`;
    } else if (key === 'nue') {
      baseDmg = Math.floor(sh.mst * 2 + 8);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      logMsg = `⚡ Nué the Thunder Bird discharges a focal lightning strike: Deals ${baseDmg} volts to ${list[targetIdx].name} and stuns them!`;
    } else if (key === 'elephant') {
      baseDmg = Math.floor(sh.str * 2.2 + 15);
      updated[targetIdx].frost = Math.max(updated[targetIdx].frost, 2);
      logMsg = `🐘 Max Elephant releases a focal water column flood! Deals ${baseDmg} crushing joint force on ${list[targetIdx].name} and slows them down.`;
    } else if (key === 'serpent') {
      baseDmg = Math.floor(sh.str * 3 + 12);
      logMsg = `🐍 Orochi Great Serpent coils around ${list[targetIdx].name}, biting for ${baseDmg} massive capture damage!`;
    } else if (key === 'mahoraga') {
      baseDmg = Math.floor(sh.str * 4 + sh.mst * 2.5);
      logMsg = `🌌 Divine General Mahoraga rotates its eight-handled law wheel! Complete adaptation strike deals ${baseDmg} devastating absolute output!`;
    }

    const nextEnemyHp = Math.max(0, updated[targetIdx].hp - baseDmg);
    updated[targetIdx].hp = nextEnemyHp;
    addLog(logMsg, 'player');

    if (nextEnemyHp <= 0) {
      updated[targetIdx].isDead = true;
      addLog(`✓ EXORCISED: ${updated[targetIdx].name} disintegrated.`, 'system');
    }

    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, index + 1);
    }, 1100);
  };

  // RESOLVE ENEMIES TARGET SELECTION AND STRIKES automatically
  const resolveEnemyAI = (list: DeployedCombatant[], index: number) => {
    const enemy = list[index];
    let updated = [...list];
    
    // Rabbit Cloning Mechanic
    if (enemyTemplate.isShikigami && enemyTemplate.shikiKey === 'rabbit' && !enemy.isDead) {
      if (Math.random() < 0.6) { // 60% chance to clone instead of attack
        const currentRabbits = updated.filter(u => u.type === 'enemy' && !u.isDead).length;
        if (currentRabbits < 20) { // Max 20 rabbits on field
          const newCloneId = `enemy-${Math.random().toString(36).substr(2, 9)}`;
          updated.push({
            id: newCloneId, name: 'Rabbit Escape (Clone)',
            hp: 20, maxHp: 20, ce: 10, maxCe: 10,
            agi: Math.floor(14 + Math.random() * 4), str: 2, mst: 4, type: 'enemy', shikiKey: 'rabbit',
            grade: enemyTemplate.grade, stunned: 0, burn: 0, frost: 0, barrier: 0, isDead: false
          });
          addLog(`🐰 THREAT MULTIPLIED! ${enemy.name} divided, adding a new clone to the unending stampede!`, 'enemy');
          setCombatants(updated);
          setTimeout(() => {
            triggerTurnCycle(updated, index + 1);
          }, 800);
          return;
        }
      }
    }

    // Choose alive target randomly from player party (Player, Deployed partner, Shikigami)
    const targets = list.filter(u => u.type !== 'enemy' && !u.isDead);
    if (targets.length === 0) return;

    const chosenTarget = targets[Math.floor(Math.random() * targets.length)];
    const targetStateIdx = list.findIndex(u => u.id === chosenTarget.id);

    // AI Spatial Movement Logic
    const dist = getDistance(enemy, chosenTarget);
    if (dist > 25) {
      const dx = (chosenTarget.x || 50) - (enemy.x || 50);
      const dy = (chosenTarget.y || 80) - (enemy.y || 20);
      const angle = Math.atan2(dy, dx);
      let moveDist = enemy.agi;
      if (moveDist > dist - 25) moveDist = dist - 25; // stop at striking distance
      
      updated[index].x = (enemy.x || 50) + Math.cos(angle) * moveDist;
      updated[index].y = (enemy.y || 20) + Math.sin(angle) * moveDist;
      
      addLog(`👟 ${enemy.name} closes distance by ${moveDist.toFixed(0)}m.`, 'enemy');

      // Check if distance is still too far to attack
      if (dist - moveDist > 25) {
        setCombatants(updated);
        setTimeout(() => triggerTurnCycle(updated, index + 1), 800);
        return;
      }
    }

    Snd.hit();
    const minStr = enemyTemplate.str[0];
    const maxStr = enemyTemplate.str[1];
    
    let baseDmg = Math.floor(Math.random() * (maxStr - minStr + 1)) + minStr;
    const isHeavy = Math.random() < 0.25;
    if (isHeavy) {
      baseDmg = Math.floor(baseDmg * 1.6);
      addLog(`☠ CRITICAL STRIKE! ${enemy.name} executes a heavy alignment impact!`, 'enemy');
    } else {
      addLog(`☠ ${enemy.name} delivers a physical strike...`, 'enemy');
    }

    // Apply frost debuffs
    if (enemy.frost > 0) {
      baseDmg = Math.floor(baseDmg * 0.5);
      addLog(`❄ FRIGID DEBUFF: ${enemy.name}'s joints are frozen. Attack reduced by 50%!`, 'system');
    }

    // Mitigate damage via target defenses
    const defenseVal = Math.floor(chosenTarget.mst * 0.2 + chosenTarget.str * 0.2 + 2);
    let outputDmg = Math.max(4, baseDmg - defenseVal);

    if (chosenTarget.type === 'player' && player.techKey === 'limitless' && player.ce > 0) {
      outputDmg = 0;
      addLog(`♾️ ACTUAL INFINITY ACTIVATED: Convergent space stretches Satoru's coordinates infinitely! The attack slows down and halts infinitely far away! Damage received: 0.`, 'player');
    }

    if ((chosenTarget.shikiKey === 'mahoraga' || chosenTarget.name.includes('Mahoraga')) && !chosenTarget.isDead) {
      const attackName = `Enemy Attack (${enemy.name})`;
      const result = processDamageToMahoraga(outputDmg, attackName);
      outputDmg = result.finalDamage;
      if (result.spinLog) {
        addLog(result.spinLog, 'crit');
      }
    }

    // Mitigate via shield barrier
    if (chosenTarget.barrier > 0) {
      const absorbed = Math.min(chosenTarget.barrier, outputDmg);
      updated[targetStateIdx].barrier -= absorbed;
      outputDmg -= absorbed;
      addLog(`🛡 SHIELD ABSORB: Protective barriers took ${absorbed} damage. Vowels remaining on shield: ${updated[targetStateIdx].barrier} pts.`, 'player');
    }

    const finalHp = Math.max(0, chosenTarget.hp - outputDmg);
    updated[targetStateIdx].hp = finalHp;
    addLog(`☠ Damage result: ${chosenTarget.name} takes ${outputDmg} damage (HP remaining: ${finalHp}/${chosenTarget.maxHp}).`, 'enemy');

    if (finalHp <= 0) {
      updated[targetStateIdx].isDead = true;
      addLog(`✕ POSTURE FALL: ${chosenTarget.name} was knocked out of action!`, 'system');
    }

    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, index + 1);
    }, 1100);
  };

  // SHIKIGAMI COMMAND: BASIC STRIKE
  const handleShikiBasicStrike = () => {
    if (locked) return;
    setLocked(true);
    Snd.hit();

    const sh = combatants[activeIdx];
    const key = sh.shikiKey;
    let targetIdx = -1;
    if (selectedSpatialTarget) {
      targetIdx = combatants.findIndex(u => u.id === selectedSpatialTarget && !u.isDead && u.type === 'enemy');
    }
    if (targetIdx === -1) {
      targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    }
    if (targetIdx === -1) {
      setLocked(false);
      return;
    }

    let baseDmg = sh.str * 2 + 5;
    let logMsg = '';
    let updated = [...combatants];

    if (key === 'dog') {
      baseDmg = Math.floor(sh.str * 2.8 + 10);
      logMsg = `🐺 Divine Dog (Totality) tears through ${updated[targetIdx].name}'s posture! Rips and slashes for ${baseDmg} physical damage!`;
    } else if (key === 'nue') {
      baseDmg = Math.floor(sh.mst * 2 + 8);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      logMsg = `⚡ Nué the Thunder Bird discharges a focal lightning strike: Deals ${baseDmg} volts to ${updated[targetIdx].name} and stuns them!`;
    } else if (key === 'elephant') {
      baseDmg = Math.floor(sh.str * 2.2 + 15);
      updated[targetIdx].frost = Math.max(updated[targetIdx].frost, 2);
      logMsg = `🐘 Max Elephant releases a focal water column flood! Deals ${baseDmg} crushing joint force on ${updated[targetIdx].name} and slows them down (Speed reduced for 2 turns).`;
    } else if (key === 'serpent') {
      baseDmg = Math.floor(sh.str * 3 + 12);
      logMsg = `🐍 Great Serpent Orochi erupts and coils around ${updated[targetIdx].name}, biting for ${baseDmg} massive capture damage!`;
    } else if (key === 'mahoraga') {
      baseDmg = Math.floor(sh.str * 4 + sh.mst * 2.5);
      logMsg = `🌌 Divine General Mahoraga rotates its eight-handled law wheel! Complete adaptation strike deals ${baseDmg} devastating absolute positive output!`;
    } else {
      logMsg = `🐾 ${sh.name} strikes ${updated[targetIdx].name} for ${baseDmg} damage!`;
    }

    const nextEnemyHp = Math.max(0, updated[targetIdx].hp - baseDmg);
    updated[targetIdx].hp = nextEnemyHp;

    if (nextEnemyHp <= 0) {
      updated[targetIdx].isDead = true;
      logMsg += ` ✓ EXORCISED: ${updated[targetIdx].name} collapsed.`;
    }

    addLog(logMsg, 'player');
    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1100);
  };

  // SHIKIGAMI COMMAND: SPECIAL ART
  const handleShikiSpecialMove = () => {
    if (locked) return;
    const sh = combatants[activeIdx];
    const key = sh.shikiKey;

    let cost = 10;
    if (key === 'dog') cost = 6;
    else if (key === 'toad') cost = 6;
    else if (key === 'nue') cost = 10;
    else if (key === 'elephant') cost = 12;
    else if (key === 'serpent') cost = 12;
    else if (key === 'rabbit') cost = 5;
    else if (key === 'deer') cost = 15;
    else if (key === 'ox') cost = 15;
    else if (key === 'tiger') cost = 12;
    else if (key === 'mahoraga') cost = 25;
    else if (key === 'abyss') cost = 12;
    else if (key === 'agito') cost = 25;

    if (sh.ce < cost) {
      addLog(`🐾 Not enough Cursed Energy to execute ${sh.name}'s special move! Needs ${cost} CE.`, 'system');
      return;
    }

    setLocked(true);
    let updated = [...combatants];
    let targetIdx = -1;
    if (selectedSpatialTarget) {
      targetIdx = updated.findIndex(u => u.id === selectedSpatialTarget && !u.isDead && u.type === 'enemy');
    }
    if (targetIdx === -1) {
      targetIdx = updated.findIndex(u => u.type === 'enemy' && !u.isDead);
    }
    if (targetIdx === -1) {
      setLocked(false);
      return;
    }

    updated[activeIdx].ce = Math.max(0, updated[activeIdx].ce - cost);

    let logMsg = '';
    if (key === 'dog') {
      updated[activeIdx].str += 4;
      updated[activeIdx].agi += 4;
      logMsg = `🐺 Divine Dog Totality lets out a blood-curdling shadow howl! Rages up stats: STR and AGI increased by +4 permanently for this battle!`;
    } else if (key === 'toad') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 25);
      updated[targetIdx].agi = Math.max(1, updated[targetIdx].agi - 4);
      logMsg = `🐸 Toad whips its sticky tongue through shadows, wrapping ${updated[targetIdx].name} for 25 damage and dragging their agility down (AGI -4)!`;
    } else if (key === 'nue') {
      const pIdx = updated.findIndex(u => u.id === 'player');
      if (pIdx !== -1) {
        updated[pIdx].barrier = (updated[pIdx].barrier || 0) + 40;
      }
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 30);
      logMsg = `⚡ Nué discharges high-tension Electric Gale! Shocks ${updated[targetIdx].name} for 30 spark damage and shields the summoner with +40 HP negative barrier!`;
    } else if (key === 'elephant') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 60);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      logMsg = `🐘 Max Elephant charges with Colossal Pressure Stamp! Flat-crushes ${updated[targetIdx].name} for 60 heavy crushing damage and stuns them for 1 turn!`;
    } else if (key === 'serpent') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 45);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 2);
      logMsg = `🐍 Great Serpent Orochi erupts from the shadow ground in a surprise bite! Deals 45 damage, binding and stunning ${updated[targetIdx].name} for 2 turns!`;
    } else if (key === 'rabbit') {
      updated.forEach(c => {
        if (c.type !== 'enemy' && !c.isDead) {
          c.barrier = (c.barrier || 0) + 30;
        }
      });
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 15);
      logMsg = `🐰 Rabbit Escape floods the battlefield in an infinite stampede of duplicates! Deals 15 chip damage and grants all friendly units +30 shielding barrier!`;
    } else if (key === 'deer') {
      updated.forEach(c => {
        if (c.type !== 'enemy' && !c.isDead) {
          c.hp = Math.min(c.maxHp, c.hp + 75);
          c.burn = 0;
          c.frost = 0;
          c.stunned = 0;
        }
      });
      logMsg = `🦌 Round Deer (Madoka) pulses infinite Reverse Cursed Energy across the sector! Heals all party allies for +75 HP and purges all active debuffs!`;
    } else if (key === 'ox') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 95);
      updated[targetIdx].barrier = Math.max(0, (updated[targetIdx].barrier || 0) - 50);
      logMsg = `🐂 Piercing Ox roars, charging forward in a single, straight-line trajectory! Deals 95 bone-crushing blunt damage and pulverizes up to 50 HP of target barriers!`;
    } else if (key === 'tiger') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 55);
      updated[targetIdx].burn = Math.max(updated[targetIdx].burn, 2);
      logMsg = `🐅 Mourning Tiger pounces with claws of blazing blood! Slashes ${updated[targetIdx].name} for 55 fire-laced cutting damage and inflicts internal burning for 2 turns!`;
    } else if (key === 'abyss') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 45);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      updated[targetIdx].agi = Math.max(1, updated[targetIdx].agi - 6);
      logMsg = `🦅🐸 Wells Unknown Abyss traps ${updated[targetIdx].name} in electrified webbing! Deals 45 shock damage, reduces agility (-6 AGI), and stuns the target!`;
    } else if (key === 'agito') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 120);
      updated.forEach(c => {
        if (c.type !== 'enemy' && !c.isDead) {
          c.hp = Math.min(c.maxHp, c.hp + 60);
          c.barrier = (c.barrier || 0) + 40;
        }
      });
      logMsg = `🐅⚡ Chimera Beast Agito releases an overwhelming elemental roar! Deals 120 ultimate damage, heals all allies for +60 HP, and grants a +40 shielding barrier!`;
    } else if (key === 'mahoraga') {
      const adaptCount = Math.floor((updated[activeIdx].str - 28) / 10);
      let adaptationDmg = 120;
      let adaptMsg = '';
      if (adaptCount === 0) {
        updated[activeIdx].str += 10;
        adaptationDmg = 120;
        adaptMsg = `*The golden wheel on Mahoraga's head clicks once!* It adapts to ${updated[targetIdx].name}'s structural armor (+10 permanent STR and bypasses defenses).`;
      } else if (adaptCount === 1) {
        updated[activeIdx].str += 10;
        updated[activeIdx].agi += 10;
        adaptationDmg = 160;
        adaptMsg = `*The golden wheel clicks a second time!* Mahoraga adapts to elemental curses (purges status debuffs, receives immune spikes, +10 STR and +10 AGI).`;
      } else {
        updated[activeIdx].str += 15;
        adaptationDmg = 220;
        adaptMsg = `*The golden wheel clicks a third time! ABSOLUTE ADAPTATION ACHIEVED!* The Sword of Extermination overflows with pure positive output. Unleashes a cataclysmic slash!`;
      }

      updated.forEach((c) => {
        if (c.type !== 'enemy' && !c.isDead) {
          c.burn = 0;
          c.frost = 0;
          c.stunned = 0;
        }
      });
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - adaptationDmg);
      logMsg = `🌌 Divine General Mahoraga rotates its golden eight-handled wheel! Clang! ${adaptMsg} Deals ${adaptationDmg} absolute positive output blade damage to ${updated[targetIdx].name}!`;
    } else if (key === 'abyss') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 50);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
      const pIdx = updated.findIndex(u => u.id === 'player');
      if (pIdx !== -1) {
        updated[pIdx].barrier = (updated[pIdx].barrier || 0) + 30;
      }
      logMsg = `👾 Well's Unknown Abyss strikes with electric shadow wings! Deals 50 shock damage to ${updated[targetIdx].name}, stuns them for 1 turn, and projects a +30 HP shield onto you!`;
    } else if (key === 'agito') {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 130);
      const pIdx = updated.findIndex(u => u.id === 'player');
      if (pIdx !== -1) {
        updated[pIdx].hp = Math.min(updated[pIdx].maxHp, updated[pIdx].hp + 50);
      }
      logMsg = `🦁 Chimera Beast Agito charges with positive-energy claws and Nue's thunder! Shreds ${updated[targetIdx].name} for 130 holy physical damage and heals your main soul reserve for +50 HP!`;
    }

    if (updated[targetIdx].hp <= 0) {
      updated[targetIdx].isDead = true;
      logMsg += ` ✓ EXORCISED: ${updated[targetIdx].name} collapsed.`;
    }

    addLog(logMsg, 'player');
    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1100);
  };

  // SHIKIGAMI COMMAND: RETRACT SUMMON
  const handleShikiDismiss = () => {
    if (locked) return;
    setLocked(true);
    const sh = combatants[activeIdx];
    let updated = [...combatants];
    
    addLog(`🐾 Shadow Recoil: You command ${sh.name} to retract back into your shadows.`, 'system');
    
    // Set dead so it is cleanly bypassed in combat, but keep stats for memory
    updated[activeIdx].isDead = true;
    updated[activeIdx].hp = 0;
    
    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1000);
  };

  // IN-BATTLE SUMMON EXECUTION PROCESS
  const handleBoogieWoogieAction = (mode: 'swap-enemy' | 'swap-others') => {
    Snd.tech();
    setShowBoogieMenu(false);
    setLocked(true);
    let updated = [...combatants];
    const playerStateIdx = updated.findIndex(u => u.id === 'player');
    let targetIdx = -1;
    if (selectedSpatialTarget) {
      targetIdx = updated.findIndex(u => u.id === selectedSpatialTarget && !u.isDead && u.type === 'enemy');
    }
    if (targetIdx === -1) {
      targetIdx = updated.findIndex(u => u.type === 'enemy' && !u.isDead);
    }
    if (targetIdx === -1) {
      setLocked(false);
      return;
    }
    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - 6);

    let logMsg = "";
    if (mode === 'swap-enemy') {
       const pUnit = updated[playerStateIdx];
       const tUnit = updated[targetIdx];
       const tmpX = pUnit.x;
       const tmpY = pUnit.y;
       pUnit.x = tUnit.x;
       pUnit.y = tUnit.y;
       tUnit.x = tmpX;
       tUnit.y = tmpY;
       
       updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
       logMsg = `👏 Boogie Woogie: Clapped hands! Swapped your coordinates with ${tUnit.name}. Target is Disorientated!`;
    } else {
       const allies = updated.filter(u => u.type !== 'player' && u.type !== 'enemy' && !u.isDead);
       const tUnit = updated[targetIdx];
       if (allies.length > 0) {
         const randomAlly = allies[Math.floor(Math.random() * allies.length)];
         const allyIdx = updated.findIndex(u => u.id === randomAlly.id);
         const tmpX = updated[allyIdx].x;
         const tmpY = updated[allyIdx].y;
         updated[allyIdx].x = tUnit.x;
         updated[allyIdx].y = tUnit.y;
         tUnit.x = tmpX;
         tUnit.y = tmpY;
         updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
         updated[allyIdx].stunned = Math.max(updated[allyIdx].stunned, 1);
         logMsg = `👏 Boogie Woogie: Clapped hands! Swapped ${tUnit.name} with ${randomAlly.name}. Both are Disorientated!`;
       } else {
          const pUnit = updated[playerStateIdx];
          const tmpX = pUnit.x;
          const tmpY = pUnit.y;
          pUnit.x = tUnit.x;
          pUnit.y = tUnit.y;
          tUnit.x = tmpX;
          tUnit.y = tmpY;
          updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
          logMsg = `👏 Boogie Woogie: No allies to swap! Clapped hands and swapped with ${tUnit.name}. Target is Disorientated!`;
       }
    }
    
    addLog(logMsg, 'player');
    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1200);
  };

  const spawnedSummonAction = (shKey: string) => {
    Snd.forge();
    const shDef = eligibleShikis.find(s => s.key === shKey);
    if (!shDef) return;

    const alreadyActive = combatants.some(c => c.id === `shiki_${shKey}` && !c.isDead);
    if (alreadyActive) {
      addLog(`🐾 Summon failed: ${shDef.name} is already alive in the active battlefield.`, 'system');
      return;
    }

    const newShiki: DeployedCombatant = {
      id: `shiki_${shKey}`,
      name: shDef.name,
      hp: shDef.hp,
      maxHp: shDef.hp,
      ce: shDef.ce,
      maxCe: shDef.ce,
      agi: shDef.agi,
      str: shDef.str,
      mst: shDef.mst,
      type: 'shikigami',
      shikiKey: shKey,
      stunned: 0,
      burn: 0,
      frost: 0,
      barrier: 0,
      isDead: false
    };

    let updated = [...combatants];
    const playerStateIdx = updated.findIndex(u => u.id === 'player');
    if (playerStateIdx !== -1) {
      updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - 12);
    }
    updated.push(newShiki);

    // Sort descending by agi to preserve turn order!
    const activeUnitId = updated[activeIdx].id;
    updated.sort((a,b) => b.agi - a.agi);
    const tblId = updated.findIndex(u => u.id === activeUnitId);
    setActiveIdx(tblId);

    setCombatants(updated);
    addLog(`🔮 INVOCATION COMMITTED: You summon ${shDef.name} onto the field! (Spends -12 CE). It enters the speed sequence at Agility ${shDef.agi}!`, 'player');
    setShowShikiSummonMenu(false);

    setTimeout(() => {
      triggerTurnCycle(updated, tblId + 1);
    }, 1100);
  };

  // BASIC OFFENSE COMBAT ACTION
  const handleChargeCE = () => {
    if (locked) return;
    setLocked(true);
    Snd.ui();
    let updated = [...combatants];
    const pIdx = activeIdx;
    
    // Regain CE based on mastery
    const recovered = Math.floor(updated[pIdx].maxCe * 0.2) + updated[pIdx].mst;
    updated[pIdx].ce = Math.min(updated[pIdx].maxCe, updated[pIdx].ce + recovered);
    
    // Also regain minor amount of health
    const healed = Math.floor(updated[pIdx].maxHp * 0.05) + updated[pIdx].end;
    updated[pIdx].hp = Math.min(updated[pIdx].maxHp, updated[pIdx].hp + healed);
    
    addLog(`🌀 FLOW STATE: You center your breathing and refine your core! Recovered +${recovered} Cursed Energy and +${healed} HP!`, 'player');

    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1000);
  };

  const handleBasicStrike = () => {
    if (locked) return;
    
    // Validate target selection and range
    const playerState = combatants[activeIdx];
    let targetIdx = -1;
    if (selectedSpatialTarget) {
      targetIdx = combatants.findIndex(u => u.id === selectedSpatialTarget && !u.isDead && u.type === 'enemy');
    }
    if (targetIdx === -1) {
      targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    }
    
    if (targetIdx === -1) {
      addLog(`System Error: No valid enemy target selected. Select a RED dot on radar!`, 'system');
      return;
    }
    
    const dist = getDistance(playerState, combatants[targetIdx]);
    if (dist > 25) {
      addLog(`System Limit: Basic attack range is 25m. Target is ${dist.toFixed(1)}m away. Move closer!`, 'system');
      return;
    }

    setLocked(true);
    Snd.hit();

    let bonusSurge = 0;
    if (delayedSurgeDmg > 0) {
      bonusSurge = delayedSurgeDmg;
      setDelayedSurgeDmg(0);
      addLog(`💥 SURGE RELEASE! Divergent Fist's delay snap lands: +${bonusSurge} feedback damage!`, 'crit');
    }

    const minStr = player.stats.str;
    const baseDmg = Math.floor(Math.random() * (minStr * 2 - minStr + 1)) + minStr + 4 + persistentAtkBuff + bonusSurge;

    const ratioActive = ratioTurns > 0;
    if (ratioActive) {
      setRatioTurns(prev => Math.max(0, prev - 1));
    }

    const isCrit = Math.random() < 0.08 + player.stats.lck * 0.015 + (ratioActive ? 0.40 : 0);
    const finalDmg = isCrit ? Math.floor(baseDmg * 2.3) : baseDmg;

    let updated = [...combatants];
    let damageApplied = finalDmg;
    const targetUnit = updated[targetIdx];
    const isTargetMahoraga = targetUnit.shikiKey === 'mahoraga' || targetUnit.name.includes('Mahoraga');

    if (isTargetMahoraga) {
      const attackName = player.techKey === 'custom' && player.customTechDef ? player.customTechDef.name : 'Martial Combo Strike';
      const result = processDamageToMahoraga(finalDmg, attackName);
      damageApplied = result.finalDamage;
      if (result.spinLog) {
        addLog(result.spinLog, 'crit');
      }
    }

    const nextEnemyHp = Math.max(0, updated[targetIdx].hp - damageApplied);
    updated[targetIdx].hp = nextEnemyHp;

    if (isCrit) {
      Snd.heavyHit();
      let critMsg = '';
      if (player.techKey === 'ratio') {
        critMsg = `⚡ FLASHPOINT IMPACT! Precise strike in the 3:7 dissection point: deals ${finalDmg} fatal damage to ${updated[targetIdx].name}!`;
      } else if (player.techKey === 'ten_shad') {
        critMsg = `⚡ SHADOW FLURRY CRITICAL! A heavy negative energy blow from the shadow currents deals ${finalDmg} critical damage to ${updated[targetIdx].name}!`;
      } else if (player.techKey === 'limitless') {
        critMsg = `⚡ INFINITE IMPACT! An aero-gravitational distortion crush deals ${finalDmg} space-clashing critical damage to ${updated[targetIdx].name}!`;
      } else if (player.techKey === 'shrine') {
        critMsg = `⚡ DISMANTLE CRITICAL! A sudden high-frequency blade laceration deals ${finalDmg} critical damage to ${updated[targetIdx].name}!`;
      } else if (player.techKey === 'blood') {
        critMsg = `⚡ BLOOD CONCENTRATE CRITICAL! A hardened hematoma capsule burst deals ${finalDmg} shock impact to ${updated[targetIdx].name}!`;
      } else if (player.techKey === 'custom' && player.customTechDef) {
        critMsg = `⚡ ${player.customTechDef.name.toUpperCase()} CRITICAL OVERCHARGE! Your custom art surges with raw curse power dealing ${finalDmg} critical damage to ${updated[targetIdx].name}!`;
      } else {
        critMsg = `⚡ CRITICAL HIT! Blinding negative output impact deals ${finalDmg} kinetic damage to ${updated[targetIdx].name}!`;
      }
      addLog(critMsg, 'crit');
    } else {
      addLog(`⚔ You execute a martial combo strike on ${updated[targetIdx].name}: deals ${finalDmg} damage.`, 'player');
    }

    if (nextEnemyHp <= 0) {
      updated[targetIdx].isDead = true;
      addLog(`✓ EXORCISED: ${updated[targetIdx].name} collapsed.`, 'system');
    }

    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1000);
  };

  // DOMAIN BARRIER CLASH TUG OF WAR INVOCATION
  const triggerDomainClash = (playerDomainName: string, sureHitAction: () => void) => {
    Snd.forge();
    setClashActive(true);
    setClashValue(50);
    setClashPlayerMultiplier(1.0);
    setClashVisualBoundEffect(false);
    setClashLog(`A powerful dynamic domain clash occurs! Your barrier struggles with ${enemyTemplate.name}'s cursed output in an locked overlap pocket!`);
  };

  const resolveDomainClashRoll = (vowsUsed: boolean) => {
    Snd.heavyHit();
    
    // competitive calculation: player mastery + multipliers vs enemy base grade mastery
    const playerBase = player.stats.mst + (clashVisualBoundEffect ? 6 : 0);
    const playerRoll = Math.floor((playerBase + Math.random() * 10) * clashPlayerMultiplier);
    
    const enemyBase = enemyTemplate.mst[1] || 12;
    const enemyRoll = Math.floor(enemyBase + Math.random() * 12);

    const delta = playerRoll - enemyRoll;
    const nextClashValue = Math.min(100, Math.max(0, clashValue + delta * 2.5));

    if (nextClashValue >= 85) {
      // OVERWHELMING PLAYERS WIN!
      Snd.lvl();
      setClashActive(false);
      addLog(`🌌🌌 BARRIER SHATTERED! Your domain expansion overwhelms the environmental rules of ${enemyTemplate.name}!`, 'crit');
      
      const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
      if (targetIdx !== -1) {
        let updated = [...combatants];
        const clashDmg = Math.floor(player.stats.mst * 4.5 + 40);
        updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - clashDmg);
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 2);
        addLog(`✓ Sure-Hit Domain rules locked down onto targets! Deals ${clashDmg} crushing barrier breach damage!`, 'crit');
        
        if (updated[targetIdx].hp <= 0) {
          updated[targetIdx].isDead = true;
          addLog(`☠ EXORCISED: ${updated[targetIdx].name} was vaporised inside your Domain!`, 'system');
        }
        setCombatants(updated);
      }
      
      // triggerTurnCycle
      setTimeout(() => {
        triggerTurnCycle(combatants, activeIdx + 1);
      }, 1200);

    } else if (nextClashValue <= 15) {
      // DOMAIN FELL
      Snd.death();
      setClashActive(false);
      addLog(`❌ BARRIER OVERWHELMED! ${enemyTemplate.name}'s dark barrier shatters your coordinates!`, 'enemy');
      
      const pIdx = combatants.findIndex(u => u.id === 'player');
      if (pIdx !== -1) {
        let updated = [...combatants];
        const recoilDmg = Math.floor(enemyTemplate.mst[1] * 3.5 + 20);
        updated[pIdx].hp = Math.max(0, updated[pIdx].hp - recoilDmg);
        updated[pIdx].stunned = Math.max(updated[pIdx].stunned, 1);
        addLog(`☠ Recoil Feedback: Your central nervous system burns out! Take -${recoilDmg} damage and fall stunned next turn!`, 'enemy');
        
        if (updated[pIdx].hp <= 0) {
          updated[pIdx].isDead = true;
          addLog(`Your physiological structure collapsed...`, 'system');
        }
        setCombatants(updated);
      }
      
      setTimeout(() => {
        triggerTurnCycle(combatants, activeIdx + 1);
      }, 1200);

    } else {
      setClashValue(nextClashValue);
      setClashLog(`Barrier overlap persists! Tug index shifted to ${nextClashValue.toFixed(0)}%. ${
        delta > 0 ? 'Your focus gains upper ground.' : 'The opponent sways the barrier.'
      }`);
    }
  };

  // CURSED SPEECH ACTION HANDLER
  const handleExecuteCursedSpeech = (commandWord: string) => {
    const playerStateIdx = combatants.findIndex(u => u.id === 'player');
    const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (playerStateIdx === -1 || targetIdx === -1 || locked) return;

    setLocked(true);
    setShowSpeechBubbleSelection(false);

    let cost = 16;
    let dmg = 0;
    let setStun = 0;
    let selfHurts = 10;
    let logMsg = '';

    if (commandWord === "DON'T MOVE!") {
      cost = 16;
      dmg = 35;
      setStun = 3;
      selfHurts = 10;
      logMsg = `💬 "🛑 DON'T MOVE!"\nYour voice expands in a colossal, shock-waves speech bubble! Spends ${cost} CE. Deals ${dmg} cerebral damage to ${combatants[targetIdx].name} and freezes them rigid, stunning them for 3 full turns! Your throat feels a light recoil burn (-10 HP).`;
    } else if (commandWord === 'CRUSH!') {
      cost = 20;
      dmg = 120;
      selfHurts = 35;
      logMsg = `💬 "💥 DIE! CRUSH!"\nAn absolutely cataclysmic acoustic kinetic burst erupts from your vocal cords! Spends ${cost} CE. Deals a massive 120 true physical implosion damage to ${combatants[targetIdx].name}! Throat bleeding recoil inflicts -35 HP damage on your main body.`;
    } else if (commandWord === 'SLEEP!') {
      cost = 14;
      dmg = 10;
      setStun = 2;
      selfHurts = 10;
      logMsg = `💬 "💤 SLEEP!"\nA soothing, tranquil negative frequency rings through the ears of ${combatants[targetIdx].name}, putting them to sleep (stunned for 2 turns!) Spends ${cost} CE and lulls target. Recoil deals -10 throat HP.`;
    } else if (commandWord === 'BLAST AWAY!') {
      cost = 16;
      dmg = 70;
      selfHurts = 20;
      logMsg = `💬 "🌪️ BLAST AWAY!"\nA sonic typhoon crashes outward, blasting ${combatants[targetIdx].name} from their position! Spends ${cost} CE. Deals ${dmg} sound-wave impact damage and reduces target physical capabilities (STR and AGI reduced by -6). Recoil deals -20 throat HP.`;
    }

    let updated = [...combatants];
    let actualCECost = cost;
    if (player.flags.six_eyes_active) {
      actualCECost = 0;
    }
    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - actualCECost);
    updated[playerStateIdx].hp = Math.max(1, updated[playerStateIdx].hp - selfHurts);
    updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - dmg);
    if (setStun > 0) {
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, setStun);
    }
    if (commandWord === 'BLAST AWAY!') {
      updated[targetIdx].str = Math.max(1, updated[targetIdx].str - 6);
      updated[targetIdx].agi = Math.max(1, updated[targetIdx].agi - 6);
    }

    if (updated[targetIdx].hp <= 0) {
      updated[targetIdx].isDead = true;
      logMsg += ` ✓ EXORCISED: Target collapsed.`;
    }

    addLog(logMsg, 'player');
    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1200);
  };

  // CONSTRUCTION ACTION HANDLER
  const handleExecuteConstruction = (type: 'blade' | 'armor' | 'sphere') => {
    const playerStateIdx = combatants.findIndex(u => u.id === 'player');
    const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (playerStateIdx === -1 || targetIdx === -1 || locked) return;

    setLocked(true);
    setShowConstructSelection(false);

    let cost = 14;
    let dmg = 0;
    let logMsg = '';

    let updated = [...combatants];

    if (type === 'blade') {
      cost = 14;
      dmg = Math.floor(player.stats.mst * 2.2 + 20);
      setPersistentAtkBuff(prev => prev + 15);
      logMsg = `◈ CONSTRUCTION (MANUFACTURE): You solidify liquid metal into an extremely sharp high-frequency edge! Deals ${dmg} slashing damage to ${combatants[targetIdx].name} and permanently adds +15 basic strike damage for this entire combat!`;
    } else if (type === 'armor') {
      cost = 14;
      updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 65;
      logMsg = `◈ CONSTRUCTION (MANUFACTURE): You coat your skin in thick, customized steel reactive plate armor! Creates +65 HP absorbing barrier shield.`;
    } else if (type === 'sphere') {
      cost = 25;
      dmg = Math.floor(player.stats.mst * 8.0 + 160);
      updated[targetIdx].barrier = 0;
      logMsg = `🪐 MASTER INTENT: CONSTRUCTION PERFECT SPHERE!\nWith sovereign mastery (MST 15+), you materialize Yorozu's pinnacle construct—THE PERFECT SPHERE! A mathematical impossibility generating infinite pressure! The sphere flat-crushes ${combatants[targetIdx].name}'s barriers and deals an absolute true ${dmg} damage, decimating the atomic structure!`;
    }

    let actualCECost = cost;
    if (player.flags.six_eyes_active) {
      actualCECost = 0;
    }
    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - actualCECost);

    if (dmg > 0) {
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - dmg);
    }

    if (updated[targetIdx].hp <= 0) {
      updated[targetIdx].isDead = true;
      logMsg += ` ✓ ATOMS VAPORIZED: Target collapsed.`;
    }

    addLog(logMsg, 'player');
    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1200);
  };

  // ADVANCED MODULAR CUSTOM MOVES & DOMAINS DIRECT EXECUTION
  const handleExecuteCustomMove = (moveId: string) => {
    const playerUnit = combatants.find(u => u.id === 'player');
    
    let targetIdx = -1;
    if (selectedSpatialTarget) {
      targetIdx = combatants.findIndex(u => u.id === selectedSpatialTarget && !u.isDead && u.type === 'enemy');
    }
    if (targetIdx === -1) {
      targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    }
    
    if (targetIdx === -1) {
      addLog(`System Error: No valid target selected.`, 'system');
      return;
    }
    const targetUnit = combatants[targetIdx];
    if (!playerUnit || !targetUnit || locked) return;

    const def = player.customTechDef;
    if (!def) return;
    const move = def.moves?.find(m => m.id === moveId);
    if (!move) return;

    // Range checks based on move type
    const dist = getDistance(playerUnit, targetUnit);
    if (move.type === 'strike' && dist > 25) {
      addLog(`System Limit: Melee strikes require target within 25m. Target is ${dist.toFixed(1)}m away. Move closer!`, 'system');
      return;
    }
    if (move.type === 'curse_law' && dist > 80) {
      addLog(`System Limit: Projected cursing laws require target within 80m. Target is ${dist.toFixed(1)}m away. Move closer!`, 'system');
      return;
    }

    // Validation
    if (playerUnit.ce < move.ceCost) {
      addLog(`◈ Custom Art [${move.name}] requires at least ${move.ceCost} CE reserves!`, 'system');
      return;
    }

    if (customMoveCooldowns[move.id] > 0) {
      addLog(`◈ Custom Art [${move.name}] is currently charges buffering! Cooldown leftover: ${customMoveCooldowns[move.id]} turns.`, 'system');
      return;
    }

    setLocked(true);
    setShowCustomMoveSelector(false);
    Snd.tech();

    let cost = move.ceCost || 8;
    let dmg = 0;
    let logMsg = '';
    let setStun = 0;
    let setDodge = false;
    let setFrost = 0;
    let setBurn = 0;
    let setBarrier = 0;
    let setHeal = 0;

    let updated = [...combatants];
    const playerStateIdx = updated.findIndex(u => u.id === 'player');

    // Deduct CE
    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - cost);

    // Save cooldown turn
    if (move.cooldown) {
      setCustomMoveCooldowns(prev => ({ ...prev, [move.id]: move.cooldown }));
    }

    if (move.type === 'strike') {
      const scaleFactor = move.dmgMult || 1.5;
      const scaleStatName = move.scaleStat || 'mst';
      const scaleStatValue = player.stats[scaleStatName as keyof typeof player.stats] || 10;
      const minBound = move.minDmg !== undefined ? move.minDmg : 10;
      const maxBound = move.maxDmg !== undefined ? move.maxDmg : 25;
      const randBaseDmg = Math.floor(Math.random() * (maxBound - minBound + 1)) + minBound;

      const scaleDynamicBonus = Math.floor(scaleStatValue * scaleFactor * 1.6);
      dmg = randBaseDmg + scaleDynamicBonus;

      // Check binding vows from the main customTechDef
      const binding = def.vowBinding || 'none';
      if (binding === 'life_for_power') {
        dmg = Math.floor(dmg * 1.5);
        const selfHurts = Math.floor(player.maxHp * 0.08);
        updated[playerStateIdx].hp = Math.max(1, updated[playerStateIdx].hp - selfHurts);
        addLog(`⚠️ [BINDING VOW - COVENANT OF SACRIFICE]: Spends ${selfHurts} HP from player's flesh to supercharge the offensive scale!`, 'crit');
      }

      // Check Mahoraga adaptation on target
      let finalDamage = dmg;
      let spinLogStr = '';
      if (targetUnit.shikiKey === 'mahoraga' || targetUnit.name.includes('Mahoraga')) {
        const res = processDamageToMahoraga(dmg, move.name);
        finalDamage = res.finalDamage;
        if (res.spinLog) spinLogStr = '\n' + res.spinLog;
      }

      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - finalDamage);

      let visualPrefix = '◈';
      const theme = def.visualTheme || 'spatial';
      if (theme === 'spatial') visualPrefix = '✂️ [Spatial Warp]';
      else if (theme === 'blood_occult') visualPrefix = '🩸 [Blood Occult]';
      else if (theme === 'dark_shadow') visualPrefix = '👥 [Shadow Pool]';
      else if (theme === 'cosmic_void') visualPrefix = '🌌 [Cosmic Void]';
      else if (theme === 'black_furnace') visualPrefix = '🔥 [Black Furnace]';
      else if (theme === 'electric_dis') visualPrefix = '⚡ [Thunder Flash]';

      logMsg = `${visualPrefix} CUSTOM MODULAR ART [${move.name}]: Spends ${cost} CE. Deals ${finalDamage} damage to ${targetUnit.name}!${spinLogStr}`;

      if (move.secondary === 'stun') {
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
        logMsg += ` Cerebral nerve stuns target next turn!`;
      } else if (move.secondary === 'frost') {
        updated[targetIdx].slowed = 3;
        logMsg += ` Stiffens target Joint Agility (-50% speed for 3 turns)!`;
      } else if (move.secondary === 'burn') {
        updated[targetIdx].burn = 3;
        logMsg += ` Ignites ash fire burn (15 burn damage per turn for 3 turns)!`;
      } else if (move.secondary === 'barrier') {
        updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 30;
        logMsg += ` Wraps player in negative space barrier (+30 shield HP)!`;
      } else if (move.secondary === 'heal') {
        const healVal = Math.floor(player.maxHp * 0.22);
        updated[playerStateIdx].hp = Math.min(player.maxHp, updated[playerStateIdx].hp + healVal);
        logMsg += ` Reversal Blood restoration heals +${healVal} HP!`;
      }

    } else if (move.type === 'summon') {
      const shikiName = move.summonName || 'Shadow Beast';
      const shikiHp = move.summonHp || 50;
      const shikiAtk = move.summonAtk || 12;
      const shikiMst = move.summonMst || 10;
      const shikiAgi = move.summonAgi || 10;
      const shikiPass = move.summonPassive || 'none';

      const newSpawn = {
        id: `shiki_${shikiName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
        name: `👥 ${shikiName} (Summon)`,
        hp: shikiHp,
        maxHp: shikiHp,
        ce: 20,
        maxCe: 20,
        type: 'summon' as const,
        isDead: false,
        shikiKey: move.summonType === 'general' ? 'mahoraga' : 'standard',
        passive: shikiPass,
        combatStats: {
          str: shikiAtk,
          end: Math.floor(shikiHp / 6),
          ce: 20,
          mst: shikiMst,
          agi: shikiAgi,
          lck: 10
        }
      };

      updated.push(newSpawn);
      logMsg = `👥 TEN SHADOWS SACRED CHANT: You summon [${shikiName}] directly from your pooled shadow well to the field of battle! (HP: ${shikiHp}, ATK: ${shikiAtk}, passive: ${shikiPass})`;

    } else if (move.type === 'speed_frame') {
      const action = move.speedAction || 'stack_agi';
      const fps = move.fpsLimit || 24;
      const multiplier = move.speedMultiplier || 1.5;

      logMsg = `⏱️ PROJECTION 24-FPS ENGINE CALIBRATION: Initialized FPS clock limit at ${fps}-frames with absolute multiplier ${multiplier}!`;

      if (action === 'stack_agi') {
        updated[playerStateIdx].combatStats.agi = Math.floor(updated[playerStateIdx].combatStats.agi * 1.35);
        logMsg += `\n🏃 Stack Velocity Speed: Player's Agility dynamically multiplied to ${updated[playerStateIdx].combatStats.agi}! (FPS Momentum stacks!)`;
      } else if (action === 'freeze_frame') {
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
        logMsg += `\n❄️ Frame Capture Freeze: ${targetUnit.name} failed to conform to the 24-frames rule! Capture frame locked (stuns opponent for 1 turn)!`;
      } else if (action === 'loop_dodge') {
        updated[playerStateIdx].combatStats.lck = Math.floor(updated[playerStateIdx].combatStats.lck * 2.5);
        logMsg += `\n🛡️ Perfect Loop Dodge Vow: Focus luck augmented (+65% absolute dodge rates enabled)!`;
      }

    } else if (move.type === 'curse_law') {
      const law = move.lawType || 'kinetic_store';
      logMsg = `📜 ACTIVE CURSED COVENANT LAW TRIGGERED: [${move.name}] binding law active!`;

      if (law === 'kinetic_store') {
        updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 40;
        logMsg += `\n🛡️ Kinetic Shield Accumulator: Converts lingering space friction into +40 HP negative space shield protection barrier!`;
      } else if (law === 'double_snap') {
        setDelayedSurgeDmg(40);
        logMsg += `\n⛓️ Snapback Delayed feedback vow: Encodes delayed pressure surge. Dealing +40 guaranteed impact damage on next Basic attack strike!`;
      } else if (law === 'cost_reduction') {
        updated[playerStateIdx].ce = Math.min(updated[playerStateIdx].maxCe, updated[playerStateIdx].ce + 8);
        logMsg += `\n♻️ Occult Optimization: Recovered +8 CE reserves by binding spatial friction!`;
      } else if (law === 'counter_charge') {
        updated[playerStateIdx].combatStats.str = Math.floor(updated[playerStateIdx].combatStats.str * 1.4);
        logMsg += `\n🔋 Focus Surge Aura Priming: Absorbed immediate air particles. Next blow damage physical strength scale amplified (+40% Strength)!`;
      }
    } else if (move.type === 'macro_script') {
      const nodes = move.scriptNodes || [];
      let currentLog = `⚙️ Macro Script Executed: [${move.name}]`;
      let skipToElse = false;
      let inIfBlock = false;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        if (inIfBlock && skipToElse && node.type !== 'logic_else' && node.type !== 'logic_end_if') {
          continue; // skipping branch
        }
        if (inIfBlock && !skipToElse && node.type === 'logic_else') {
          skipToElse = true; // skip else branch since if was true
          continue;
        }

        if (node.type === 'logic_if_distance') {
          inIfBlock = true;
          const distAllowed = node.paramDist || 0;
          const curDist = getDistance(updated[playerStateIdx], updated[targetIdx]);
          if (curDist > distAllowed) {
            skipToElse = true;
            currentLog += `\n ↳ [IF] Distance ${curDist.toFixed(1)}m > ${distAllowed}m. Condition FALSE.`;
          } else {
            skipToElse = false;
            currentLog += `\n ↳ [IF] Distance ${curDist.toFixed(1)}m <= ${distAllowed}m. Condition TRUE.`;
          }
        } else if (node.type === 'logic_if_shikigami') {
          inIfBlock = true;
          const nameToCheck = (node.paramName || '').toLowerCase();
          const name2ToCheck = (node.paramName2 || '').toLowerCase();
          const hasShiki1 = updated.some(u => u.type === 'shikigami' && !u.isDead && u.name.toLowerCase().includes(nameToCheck));
          const hasShiki2 = !name2ToCheck ? true : updated.some(u => u.type === 'shikigami' && !u.isDead && u.name.toLowerCase().includes(name2ToCheck));
          if (hasShiki1 && hasShiki2) {
             skipToElse = false;
             currentLog += `\n ↳ [IF] Shikigami criteria met. Condition TRUE.`;
          } else {
             skipToElse = true;
             currentLog += `\n ↳ [IF] Shikigami criteria NOT met. Condition FALSE.`;
          }
        } else if (node.type === 'logic_if_self_hp') {
          inIfBlock = true;
          const pct = node.paramHpThreshold || 0;
          const curPct = (updated[playerStateIdx].hp / player.maxHp) * 100;
          if (curPct <= pct) {
            skipToElse = false;
            currentLog += `\n ↳ [IF] Self HP ${curPct.toFixed(0)}% <= ${pct}%. Condition TRUE.`;
          } else {
            skipToElse = true;
            currentLog += `\n ↳ [IF] Self HP ${curPct.toFixed(0)}% > ${pct}%. Condition FALSE.`;
          }
        } else if (node.type === 'logic_if_enemy_hp') {
          inIfBlock = true;
          const pct = node.paramHpThreshold || 0;
          const curPct = (updated[targetIdx].hp / updated[targetIdx].maxHp) * 100;
          if (curPct <= pct) {
            skipToElse = false;
            currentLog += `\n ↳ [IF] Target HP ${curPct.toFixed(0)}% <= ${pct}%. Condition TRUE.`;
          } else {
            skipToElse = true;
            currentLog += `\n ↳ [IF] Target HP ${curPct.toFixed(0)}% > ${pct}%. Condition FALSE.`;
          }
        } else if (node.type === 'logic_if_turn_count') {
          inIfBlock = true;
          const turnTh = node.paramTurnTreshold || 1;
          if (combatTurn >= turnTh) {
            skipToElse = false;
            currentLog += `\n ↳ [IF] Turn count ${combatTurn} >= ${turnTh}. Condition TRUE.`;
          } else {
            skipToElse = true;
            currentLog += `\n ↳ [IF] Turn count ${combatTurn} < ${turnTh}. Condition FALSE.`;
          }
        } else if (node.type === 'logic_if_ce') {
          inIfBlock = true;
          const amt = node.paramStatChange || 0;
          if (updated[playerStateIdx].ce >= amt) {
            skipToElse = false;
            currentLog += `\n ↳ [IF] Self CE >= ${amt}. Condition TRUE.`;
          } else {
            skipToElse = true;
            currentLog += `\n ↳ [IF] Self CE < ${amt}. Condition FALSE.`;
          }
        } else if (node.type === 'logic_if_stunned') {
          inIfBlock = true;
          if (updated[targetIdx].stunned > 0) {
            skipToElse = false;
            currentLog += `\n ↳ [IF] Target Stunned. Condition TRUE.`;
          } else {
            skipToElse = true;
            currentLog += `\n ↳ [IF] Target NOT Stunned. Condition FALSE.`;
          }
        } else if (node.type === 'logic_else') {
           skipToElse = !skipToElse; // flip branch
        } else if (node.type === 'logic_end_if') {
           inIfBlock = false;
           skipToElse = false;
        } else if (node.type === 'action_strike') {
           const mult = node.paramDmgMult || 1.0;
           const sDmg = Math.floor(player.stats.mst * mult * 1.5 + 10);
           updated[targetIdx].hp -= sDmg;
           currentLog += `\n ↳ [ACTION: STRIKE] Dealt ${sDmg.toFixed(0)} damage to target.`;
        } else if (node.type === 'action_approach') {
           const limit = node.paramDist || 0;
           const dx = (updated[targetIdx].x || 50) - (updated[playerStateIdx].x || 50);
           const dy = (updated[targetIdx].y || 20) - (updated[playerStateIdx].y || 80);
           const angle = Math.atan2(dy, dx);
           let moveDist = player.stats.agi;
           const actualDist = getDistance(updated[playerStateIdx], updated[targetIdx]);
           if (moveDist > actualDist - limit) moveDist = Math.max(0, actualDist - limit);
           
           if (moveDist > 0) {
             updated[playerStateIdx].x = (updated[playerStateIdx].x || 50) + Math.cos(angle) * moveDist;
             updated[playerStateIdx].y = (updated[playerStateIdx].y || 80) + Math.sin(angle) * moveDist;
             currentLog += `\n ↳ [ACTION: APPROACH] Assumes closing velocity, moved ${moveDist.toFixed(1)}m.`;
           } else {
             currentLog += `\n ↳ [ACTION: APPROACH] Already within optimal distance span.`;
           }
        } else if (node.type === 'action_teleport_behind') {
           updated[playerStateIdx].x = (updated[targetIdx].x || 50) + 5;
           updated[playerStateIdx].y = (updated[targetIdx].y || 20) - 5;
           currentLog += `\n ↳ [ACTION: TELEPORT] Shifted coordinates directly behind the target.`;
        } else if (node.type === 'action_stun_target') {
           updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
           currentLog += `\n ↳ [ACTION: STUN] Target motor functions compromised.`;
        } else if (node.type === 'action_buff_self') {
           const amt = node.paramStatChange || 5;
           updated[playerStateIdx].combatStats.str += amt;
           updated[playerStateIdx].combatStats.agi += amt;
           currentLog += `\n ↳ [ACTION: BUFF] Stats increased by ${amt}.`;
        } else if (node.type === 'action_debuff_target') {
           const amt = node.paramStatChange || 5;
           updated[targetIdx].str = Math.max(1, updated[targetIdx].str - amt);
           updated[targetIdx].agi = Math.max(1, updated[targetIdx].agi - amt);
           currentLog += `\n ↳ [ACTION: DEBUFF] Target stats decreased by ${amt}.`;
        } else if (node.type === 'action_burn_target') {
           const turns = node.paramStatChange || 2;
           updated[targetIdx].burn += turns;
           currentLog += `\n ↳ [ACTION: BURN] Target ignited for ${turns} turns.`;
        } else if (node.type === 'action_frost_target') {
           const turns = node.paramStatChange || 2;
           updated[targetIdx].frost += turns;
           currentLog += `\n ↳ [ACTION: FROST] Target frostbitten for ${turns} turns.`;
        } else if (node.type === 'action_drain_ce') {
           const amt = node.paramStatChange || 5;
           const stolen = Math.min(updated[targetIdx].ce, amt);
           updated[targetIdx].ce -= stolen;
           updated[playerStateIdx].ce = Math.min(updated[playerStateIdx].maxCe, updated[playerStateIdx].ce + stolen);
           currentLog += `\n ↳ [ACTION: DRAIN] Spiraled ${stolen} CE from target.`;
        } else if (node.type === 'action_blood_manipulation') {
           const hpSpent = node.paramStatChange || 10;
           if (updated[playerStateIdx].hp > hpSpent) {
             updated[playerStateIdx].hp -= hpSpent;
             const dmg = hpSpent * 2.5; // Blood piercing scaling
             updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - dmg);
             currentLog += `\n ↳ [ACTION: BLOOD] Piercing Blood! Consumed ${hpSpent} HP to deal ${dmg} convergence damage.`;
           } else {
             currentLog += `\n ↳ [ACTION: BLOOD] Not enough HP to perform technique!`;
           }
        } else if (node.type === 'action_black_flash_check') {
           const chance = node.paramStatChange || 15;
           if (Math.random() * 100 <= chance) {
             const bfDmg = 50; // Flat additional damage for simplicity or scale later
             updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - bfDmg);
             currentLog += `\n ↳ [ACTION: BLACK FLASH] 💥 CRITICAL ALIGNMENT (2.5^)! Dealt bonus ${bfDmg} spatial distortion damage!`;
           } else {
             currentLog += `\n ↳ [ACTION: BLACK FLASH] Alignment failed.`;
           }
        } else if (node.type === 'action_summon') {
           const sName = node.paramName || 'Shikigami';
           updated.push({
             id: `script_sum_${Date.now()}_${Math.random()}`,
             name: sName, hp: 50, maxHp: 50, ce: 10, maxCe: 10,
             agi: 10, str: 10, mst: 10, type: 'shikigami',
             isDead: false, stunned: 0, burn: 0, frost: 0, barrier: 0,
             x: (updated[playerStateIdx].x || 50) + (Math.random() * 10 - 5),
             y: (updated[playerStateIdx].y || 80) + (Math.random() * 10 - 5),
             shikiKey: 'standard'
           });
           currentLog += `\n ↳ [ACTION: SUMMON] Reconstructed shadow mass: spawned "${sName}".`;
        } else if (node.type === 'action_summon_modular') {
           const sName = node.paramName || 'Custom Beast';
           updated.push({
             id: `script_sum_${Date.now()}_${Math.random()}`,
             name: sName, hp: node.summonHp || 50, maxHp: node.summonHp || 50, ce: 10, maxCe: 10,
             agi: node.summonAgi || 10, str: node.summonAtk || 10, mst: node.summonMst || 10, type: 'shikigami',
             isDead: false, stunned: 0, burn: 0, frost: 0, barrier: 0,
             x: (updated[playerStateIdx].x || 50) + (Math.random() * 10 - 5),
             y: (updated[playerStateIdx].y || 80) + (Math.random() * 10 - 5),
             shikiKey: 'standard'
           });
           currentLog += `\n ↳ [ACTION: SUMMON (MODULAR)] Bootstrapped "${sName}" with custom parameters.`;
        } else if (node.type === 'action_unsummon') {
           const uName = (node.paramName || '').toLowerCase();
           let killed = 0;
           updated = updated.map(u => {
              if (u.type === 'shikigami' && !u.isDead && u.name.toLowerCase().includes(uName)) {
                 killed++;
                 return { ...u, isDead: true, hp: 0 };
              }
              return u;
           });
           currentLog += `\n ↳ [ACTION: UNSUMMON] Dissipated ${killed} entity nodes.`;
        } else if (node.type === 'action_heal') {
           const hAmt = node.paramHealAmt || 0;
           updated[playerStateIdx].hp = Math.min(player.maxHp, updated[playerStateIdx].hp + hAmt);
           currentLog += `\n ↳ [ACTION: HEAL] Output reversed, recovered ${hAmt} vitals.`;
        } else if (node.type === 'action_play_sound') {
           Snd.tech();
           currentLog += `\n ↳ [ACTION: SOUND] Triggered audio cue.`;
        } else if (node.type === 'action_domain_expansion') {
           handleExpandCustomDomain();
           currentLog += `\n ↳ [ACTION: DOMAIN] ⛩️ Expanded Innate Domain!`;
        }
      }
      
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp);
      logMsg = currentLog;
    }

    if (updated[targetIdx].hp <= 0) {
      updated[targetIdx].isDead = true;
      logMsg += `\n☠️ EXORCISED: ${updated[targetIdx].name} falls.`;
    }

    addLog(logMsg, 'player');
    setCombatants(updated);

    setTimeout(() => {
      setLocked(false);
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1200);
  };

  const handleExpandStandardDomain = () => {
    const playerUnit = combatants.find(u => u.id === 'player');
    const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (targetIdx === -1) return;
    const targetUnit = combatants[targetIdx];
    if (!playerUnit || !targetUnit || locked) return;

    const dist = getDistance(playerUnit, targetUnit);
    if (dist > 40) {
      addLog(`◈ Domain Expansion requires target within 40m barrier radius! They are ${dist.toFixed(1)}m away.`, 'system');
      return;
    }

    if (playerUnit.ce < 25) {
      addLog(`◈ Domain Expansion requires at least 25 CE reserves!`, 'system');
      return;
    }

    setLocked(true);
    Snd.tech();

    let updated = [...combatants];
    const playerStateIdx = updated.findIndex(u => u.id === 'player');

    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - 25);
    setCombatants(updated);

    addLog(`⛩️ DOMAIN EXPANSION TRIGGERED!\n${player.name} expands boundaries to entrap the opponent of Grade ${enemyTemplate.grade}.`, 'crit');

    if (player.techKey === 'limitless') {
      triggerDomainClash("Domain Expansion: Infinite Void", () => {
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 3);
      });
    } else if (player.techKey === 'ten_shad') {
      triggerDomainClash("Domain Expansion: Chimera Shadow Garden", () => {
        updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 80);
        updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 80;
      });
    } else if (player.techKey === 'shrine') {
      triggerDomainClash("Domain Expansion: Malevolent Shrine", () => {
        updated[targetIdx].burn = Math.max(updated[targetIdx].burn, 4);
      });
    } else {
      triggerDomainClash("Domain Expansion", () => {});
    }
  };

  const handleExpandCustomDomain = () => {
    const playerUnit = combatants.find(u => u.id === 'player');
    const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (targetIdx === -1) return;
    const targetUnit = combatants[targetIdx];
    if (!playerUnit || !targetUnit || locked) return;

    const def = player.customTechDef;
    if (!def) return;

    const dist = getDistance(playerUnit, targetUnit);
    if (dist > 40) {
      addLog(`◈ Custom Domain Expansion requires target within 40m barrier radius! They are ${dist.toFixed(1)}m away.`, 'system');
      return;
    }

    if (playerUnit.ce < 25) {
      addLog(`◈ Custom Domain Expansion: requires at least 25 CE reserves!`, 'system');
      return;
    }

    setLocked(true);
    setShowCustomMoveSelector(false);
    Snd.tech();

    let updated = [...combatants];
    const playerStateIdx = updated.findIndex(u => u.id === 'player');

    // Deduct CE
    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - 25);
    setCombatants(updated);

    const dCust = def.domainCustom;
    const handStr = dCust?.handSign && dCust.handSign !== 'None' ? ` forming signature gesture hand-mudra [${dCust.handSign}],` : '';
    const envStr = dCust?.environment ? ` Enters the majestic domain realm of [${dCust.environment}]!` : '';
    const ruleStr = dCust?.barrierRule ? ` Barrier rules set to [${dCust.barrierRule}].` : '';
    const auraStr = dCust?.visualAura ? ` The space illuminates with a dense [${dCust.visualAura}] aura.` : '';
    
    addLog(`⛩️ DOMAIN EXPANSION TRIGGERED!\n${player.name}${handStr} expands boundaries to entrap the opponent of Grade ${enemyTemplate.grade}.${envStr}${ruleStr}${auraStr}`, 'crit');

    triggerDomainClash(def.domainName || 'Domain Alignment', () => {
      const sHit = dCust?.sureHitSpell || def.domainSureHit || 'stun';
      let effectLog = '';

      if (sHit === 'stun') {
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 3);
        effectLog = `⚖️ SURE-HIT SPELL [Neural Lock]: target is hit by absolute cognitive sensory overload, locking them in continuous stun for 3 turns!`;
      } else if (sHit === 'bypass') {
        const dScore = Math.floor(player.stats.mst * 4.5 + 40);
        updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - dScore);
        effectLog = `⚔️ SURE-HIT SPELL [True Strike Bypass]: Deals absolute piercing warp energy score of ${dScore} damage (totally ignoring target defense)!`;
      } else if (sHit === 'siphon') {
        const drained = 65;
        updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - drained);
        updated[playerStateIdx].hp = Math.min(player.maxHp, updated[playerStateIdx].hp + drained);
        effectLog = `🩸 SURE-HIT SPELL [Life Siphon]: Siphons 65 HP from enemy capillaries directly into your body vitals!`;
      } else if (sHit === 'chaos') {
        updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 120;
        effectLog = `🛡️ SURE-HIT SPELL [Perfect Evasion Limit]: Wraps your body in perfect adaptation barrier space (+120 shield HP)!`;
      } else if (sHit === 'burn_dot') {
        updated[targetIdx].burn = 4;
        effectLog = `🔥 SURE-HIT SPELL [Molten Gehenna]: Engulfs opponent in burning sulfur (applies extreme burn DOT for 4 turns)!`;
      } else if (sHit === 'tech_seal') {
        updated[targetIdx].agi = Math.max(1, updated[targetIdx].agi - 4);
        updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
        effectLog = `⛓️ SURE-HIT SPELL [Art Purge Sealing]: Seals enemy cursed flows (stuns for 1 turn, restricts agility)!`;
      } else if (sHit === 'physical_duel') {
        updated[playerStateIdx].str = Math.max(updated[playerStateIdx].str, updated[targetIdx].str);
        effectLog = `🤼 SURE-HIT SPELL [Melee Contract Area]: Imposes a fair sumo-boxing pact. Equalizes physical Strength level to force direct fist brawl combat!`;
      }

      if (updated[targetIdx].hp <= 0) {
        updated[targetIdx].isDead = true;
        effectLog += `\n☠️ EXORCISED: ${updated[targetIdx].name} turned into dust particles.`;
      }

      addLog(effectLog, 'crit');
      setCombatants(updated);

      setTimeout(() => {
        setLocked(false);
        triggerTurnCycle(updated, activeIdx + 1);
      }, 1000);
    });
  };

  // CURSED TECHNIQUE INVOCATION ACTIONS
  const handleCursedTechnique = () => {
    const playerUnit = combatants[activeIdx];
    let targetIdx = -1;
    if (selectedSpatialTarget) {
      targetIdx = combatants.findIndex(u => u.id === selectedSpatialTarget && !u.isDead && u.type === 'enemy');
    }
    if (targetIdx === -1) {
      targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    }
    if (targetIdx === -1) {
      addLog(`System Error: No valid target selected for Technique!`, 'system');
      return;
    }
    
    // Check range
    const dist = getDistance(playerUnit, combatants[targetIdx]);
    if (dist > 80 && player.restriction !== 'toji') {
      addLog(`System Limit: Technique projection maximum range is 80m. Target is ${dist.toFixed(1)}m away. Move closer!`, 'system');
      return;
    }

    // Heavenly restrictions check
    if (player.restriction === 'toji') {
      setLocked(true);
      Snd.heavyHit();
      const damage = Math.floor(player.stats.str * 4.2 + player.stats.agi * 3.0);
      let updated = [...combatants];
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - damage);
      
      addLog(`◈ HEAVENLY RESTRICTION (PHYSICAL PROWESS): You deploy the Special Grade physical blade "Inverted Spear of Heaven" in blinding arcs! Deals ${damage} absolute armor-ignoring damage to ${updated[targetIdx].name}!`, 'crit');
      
      if (updated[targetIdx].hp <= 0) {
        updated[targetIdx].isDead = true;
        addLog(`✓ EXORCISED: ${updated[targetIdx].name} was dismantled under your sheer physical acceleration!`, 'system');
      }

      setCombatants(updated);
      setTimeout(() => {
        triggerTurnCycle(updated, activeIdx + 1);
      }, 1000);
      return;
    }

    if (player.restriction === 'mechamaru') {
      if (playerUnit.ce < 25) {
        addLog(`◈ Puppet Cannon cores require exactly 25 CE reserves to fire!`, 'system');
        return;
      }
      setLocked(true);
      Snd.tech();
      const damage = Math.floor(player.stats.mst * 5.5 + 40);
      let updated = [...combatants];
      updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - damage);
      updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 2);
      
      const pIdx = updated.findIndex(u => u.id === 'player');
      updated[pIdx].ce = Math.max(0, updated[pIdx].ce - 25);

      addLog(`◈ HEAVENLY RESTRICTION (CURSE EXTRACTION): You trigger "Ultimate Remote Cannon: 10 Years Charge"! Spends 25 CE. High-tier focused pulse deals ${damage} thermal impact to ${updated[targetIdx].name} and stuns them for 2 turns!`, 'crit');

      if (updated[targetIdx].hp <= 0) {
        updated[targetIdx].isDead = true;
        addLog(`✓ EXORCISED: ${updated[targetIdx].name} was vaporised.`, 'system');
      }

      setCombatants(updated);
      setTimeout(() => {
        triggerTurnCycle(updated, activeIdx + 1);
      }, 1000);
      return;
    }

    const minRequiredCe = 8;
    if (locked) return;

    if (player.techKey === 'custom' && player.customTechDef && player.customTechDef.moves && player.customTechDef.moves.length > 0) {
      Snd.ui();
      setShowCustomMoveSelector(true);
      return;
    }

    if (playerUnit.ce < minRequiredCe) return;

    // Custom Technique Cooldown validation check
    if (player.techKey === 'custom' && player.customTechDef) {
      const cDef = player.customTechDef;
      if (cDef.cooldown && customSkillCooldownActive > 0) {
        addLog(`◈ Custom Art [${cDef.name}] is currently charges buffering! Remaining cooldown: ${customSkillCooldownActive} turns.`, 'system');
        return;
      }
    }

    if (player.techKey === 'project') {
      if (playerUnit.ce < 14) {
        addLog(`◈ Projection Sorcery requires exactly 14 CE to map FPS physics coordinates!`, 'system');
        return;
      }
      Snd.ui();
      setIsPlanningProject(true);
      return;
    }

    setLocked(true);
    Snd.tech();

    // Determine custom technique parameters vs. standard presets
    const isCustom = player.techKey === 'custom' || !player.techKey;
    const key = player.techKey || 'random';
    
    let cost = 12;
    let dmg = 0;
    let logMsg = '';
    let setStun = 0;
    let setDodge = false;
    let setFrost = 0;
    let setBurn = 0;
    let setBarrier = 0;
    let setHeal = 0;

    let updated = [...combatants];
    const playerStateIdx = updated.findIndex(u => u.id === 'player');

    // IF CUSTOM TECHNIQUE COMPILED FROM FORGING
    if (isCustom && player.customTechDef) {
      const cDef = player.customTechDef;
      cost = cDef.ceCost || 12;

      if (playerUnit.ce < cost) {
        addLog(`◈ Custom Art [${cDef.name}] requires at least ${cost} CE reserves to execute!`, 'system');
        return;
      }

      // Check Domain configuration
      if (cDef.hasDomain && playerUnit.ce >= 25 && (enemyTemplate.mst[1] >= 8 || enemyTemplate.grade === 'Special Grade' || enemyTemplate.grade === 'Grade 1')) {
        // Enforce DOMAIN CLASHER sequence!
        cost = 25;
        updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - cost);
        setCombatants(updated);
        
        triggerDomainClash(cDef.domainName || 'Domain Alignment', () => {
          // Custom Sure-hit effects
          const sHit = cDef.domainSureHit;
          if (sHit === 'stun') {
            updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 3);
          } else if (sHit === 'bypass') {
            updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - 100);
          } else if (sHit === 'siphon') {
            const drained = 60;
            updated[targetIdx].hp = Math.max(0, updated[targetIdx].hp - drained);
            updated[playerStateIdx].hp = Math.min(player.maxHp, updated[playerStateIdx].hp + drained);
          } else if (sHit === 'chaos') {
            updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 120;
          } else if (sHit === 'burn_dot') {
            updated[targetIdx].burn = 4;
          } else if (sHit === 'tech_seal') {
            updated[targetIdx].agi = Math.max(1, updated[targetIdx].agi - 4);
            updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, 1);
          } else if (sHit === 'physical_duel') {
            updated[playerStateIdx].str = Math.max(updated[playerStateIdx].str, updated[targetIdx].str);
          }
        });
        return;
      }

      // Visual blast theme prefixes
      let visualPrefix = '◈';
      const theme = cDef.visualTheme || 'spatial';
      if (theme === 'spatial') visualPrefix = '✂️ [Spatial Warp] Dimension shearing cuts slice through coordinate planes!';
      else if (theme === 'blood_occult') visualPrefix = '🩸 [Blood Occult] Pressurized blood spires erupt outward from target capillaries!';
      else if (theme === 'dark_shadow') visualPrefix = '👥 [Shadow Pool] Pitiless hands of pure negative solid shadows lock from below!';
      else if (theme === 'cosmic_void') visualPrefix = '🌌 [Cosmic Void] Gravitational space pressure caves the surrounding air mass!';
      else if (theme === 'black_furnace') visualPrefix = '🔥 [Black Furnace] A pitch-black carbon carbon-ash core ignites!';
      else if (theme === 'electric_dis') visualPrefix = '⚡ [Thunder Flash] High tension electrical discharges crack down on neural cells!';

      // Calculate base dmg based on configured strike multiplier & cost scaling
      const scaleFactor = cDef.dmgMult || 1.5;
      const scaleStatName = cDef.scaleStat || 'mst';
      // Safely access character stat levels
      const scaleStatValue = player.stats[scaleStatName as keyof typeof player.stats] || 10;

      // Extract random baseline bounds from custom sliders
      const minBound = cDef.minDmg !== undefined ? cDef.minDmg : 10;
      const maxBound = cDef.maxDmg !== undefined ? cDef.maxDmg : 25;
      const randBaseDmg = Math.floor(Math.random() * (maxBound - minBound + 1)) + minBound;

      const ceMultiplier = cost === 18 ? 1.35 : cost === 8 ? 0.75 : 1.0;
      // Formula matches: Custom baseline dynamic bounds + (attribute stat value * scale index * 1.6) * multipliers
      const scaleDynamicBonus = Math.floor(scaleStatValue * scaleFactor * 1.6);
      dmg = Math.floor((randBaseDmg + scaleDynamicBonus) * ceMultiplier);

      // Save Cooldown trigger if configured
      if (cDef.cooldown) {
        setCustomSkillCooldownActive(cDef.cooldown);
      }
      
      // Binding vows tradeoff multipliers
      const binding = cDef.vowBinding || 'none';
      if (binding === 'life_for_power') {
        dmg = Math.floor(dmg * 1.5);
        // Self damage
        const selfHurts = Math.floor(player.maxHp * 0.10);
        updated[playerStateIdx].hp = Math.max(1, updated[playerStateIdx].hp - selfHurts);
        addLog(`⚠️ [BINDING VOW - COVENANT OF SACRIFICE]: Spends ${selfHurts} HP from player's flesh to supercharge the offensive scale!`, 'crit');
      }

      const archLabel = cDef.arch.toUpperCase();
      logMsg = `${visualPrefix}\n◈ CUSTOM ART [${cDef.name} - ${archLabel}]: Spends ${cost} CE. Deals ${dmg} customized damage to ${updated[targetIdx].name}!`;

      // Trigger secondary impact configured in foraging
      const secondary = cDef.secondary;
      if (secondary === 'stun') {
        setStun = 1;
        logMsg += ` Cerebral nerve stuns target next turn!`;
      } else if (secondary === 'frost') {
        setFrost = 3;
        logMsg += ` Stiffens joint agility (reduces target speed by 50% for 3 turns)!`;
      } else if (secondary === 'burn') {
        setBurn = 3;
        logMsg += ` Ignites black furnace fire burn (15 HP damage over time for 3 turns)!`;
      } else if (secondary === 'barrier') {
        setBarrier = 30;
        logMsg += ` Wraps player body in negative space barrier (+30 HP absorption)!`;
      } else if (secondary === 'heal') {
        setHeal = Math.floor(player.maxHp * 0.22);
        logMsg += ` Triggers Reversal Blood restoration (heals inside vitals by +${setHeal} HP)!`;
      }

      // Execute other Binding Vows logic
      if (binding === 'divergent') {
        // No immediate damage, set delayed snap surge damage!
        const delayedDmg = Math.floor(dmg * 1.2);
        setDelayedSurgeDmg(delayedDmg);
        dmg = 0; // immediate damage zero
        logMsg += `\n⛓️ [BINDING VOW - DOUBLE SNAP-BACK]: Immediate strike damage set to zero, but programs a delayed feedback surge of +${delayedDmg} damage to land on next Basic strike!`;
      } else if (binding === 'focus_charge') {
        // Boost mastery for 2 turns or check focus flag
        if (player.flags.custom_art_focused) {
          dmg = Math.floor(dmg * 2.2);
          player.flags.custom_art_focused = false;
          logMsg += `\n⚡ [BINDING VOW - SURGE DISCHARGE]: Consumed focus aura charge! Deals an enormous +120% double-hit blast of ${dmg} customized output!`;
        } else {
          dmg = 0;
          player.flags.custom_art_focused = true;
          setBarrier = (setBarrier || 0) + 25;
          logMsg += `\n🛡️ [BINDING VOW - PRIMING PHASE]: Channeling occult currents. Immediate strike damage is zero, but grants +25 barrier and primes next turn's customized strike output to deal +120% double-hit damage!`;
        }
      } else if (binding === 'ce_recycle') {
        player.flags.ce_recycle_active = true;
        logMsg += `\n♻️ [BINDING VOW - RECYCLE]: If the target is exorcised on this strike, refund 100% of CE cost (${cost} CE)!`;
      }
    } 
    // STANDARD TECH PRESETS ORIGINAL MATRICES
    else if (key === 'limitless') {
      cost = 18;
      dmg = Math.floor(player.stats.mst * 2.5 + 20);
      setBarrier = Math.floor(player.stats.mst * 3.5 + 15);
      logMsg = `◈ Limitless Space: Repulsive shock core targets ${updated[targetIdx].name} for ${dmg} gravitational force, and creates an Infinity Barrier (+${setBarrier} shield)!`;
    }
    else if (key === 'ten_shad') {
      cost = 12;
      if (playerUnit.ce < cost) {
        addLog(`◈ Ten Shadows: Not enough Cursed Energy to perform a shadow summoning! Need 12 CE.`, 'system');
        setLocked(false);
        return;
      }
      // Open the in-battle interactive selection menu!
      setShowShikiSummonMenu(true);
      addLog(`🔮 TEN SHADOWS: You focus your hands into shadow structures. Select which Shikigami to summon!`, 'system');
      return; // Return early, the selector menu will fire the turn cycle when choice is locked in
    }
    else if (key === 'shrine') {
      cost = 18;
      const lowLife = updated[targetIdx].hp < updated[targetIdx].maxHp * 0.5;
      if (lowLife) {
        dmg = Math.floor(player.stats.mst * 4.2 + 25);
        logMsg = `◈ Shrine Cleave: Execute dismember strike on weakened target ${updated[targetIdx].name}, dealing ${dmg} massive damage!`;
      } else {
        dmg = Math.floor(player.stats.mst * 2.5 + 10);
        logMsg = `◈ Shrine Dismantle: Release soaring slashes on ${updated[targetIdx].name} for ${dmg} damage.`;
      }
    }
    else if (key === 'blood') {
      cost = 14;
      dmg = Math.floor(player.stats.mst * 2.8 + player.stats.end * 1.5);
      setHeal = Math.floor(player.maxHp * 0.20 + 15);
      logMsg = `◈ Blood Manipulation: Piercing Blood puncture strikes ${updated[targetIdx].name} for ${dmg} damage, while cellular flow heals you for +${setHeal} HP!`;
    }
    else if (key === 'speech') {
      setLocked(false);
      setShowSpeechBubbleSelection(true);
      addLog(`🗯️ CURSED SPEECH: Select which word command to convey over the megaphone!`, 'system');
      return;
    }
    else if (key === 'ratio') {
      cost = 10;
      dmg = Math.floor(player.stats.mst * 2.5 + 20);
      setRatioTurns(3);
      logMsg = `◈ Ratio Technique: Dissection grids weakpoints on ${updated[targetIdx].name} for ${dmg} damage. Strike critical rates are boosted +60% for coming 3 actions!`;
    }
    else if (key === 'boogie') {
      cost = 6;
      if (playerUnit.ce < cost) {
        addLog(`◈ Boogie Woogie: Not enough Cursed Energy! Need 6 CE.`, 'system');
        setLocked(false);
        return;
      }
      setShowBoogieMenu(true);
      addLog(`👏 BOOGIE WOOGIE: You clap your hands! Select whom to swap.`, 'system');
      return;
    }
    else if (key === 'idle') {
      cost = 15;
      dmg = Math.floor(player.stats.mst * 3.5 + 20);
      setHeal = 35;
      logMsg = `◈ Idle Transfiguration: soul-bending palm deals ${dmg} ignore-def damage to ${updated[targetIdx].name} while reconstructing +35 HP!`;
    }
    else if (key === 'star') {
      cost = 16;
      dmg = Math.floor(player.stats.str * 2.2 + player.stats.mst * 2.8);
      logMsg = `◈ Star Rage: Massive virtual density hits ${updated[targetIdx].name} for ${dmg} gravitational crushing damage!`;
    }
    else if (key === 'construct') {
      setLocked(false);
      setShowConstructSelection(true);
      addLog(`🛠️ CONSTRUCTION: Select what physical tool or entity to manufacture from liquid metal!`, 'system');
      return;
    }
    else if (key === 'copy') {
      const copiedKey = currentCopiedTechKey;
      if (copiedKey) {
        cost = 14;
        dmg = Math.floor(player.stats.mst * 3.5 + 20);
        let copiedDesc = copiedKey === 'shrine' ? 'Shrine Cleave & Dismantle' :
                        copiedKey === 'limitless' ? 'Limitless Space Infinity' :
                        copiedKey === 'ten_shad' ? 'Ten Shadows Summons' :
                        copiedKey === 'blood' ? 'Blood Manipulation' :
                        copiedKey === 'speech' ? 'Cursed Speech' :
                        copiedKey === 'ratio' ? 'Ratio 7:3 Dissection' :
                        copiedKey === 'boogie' ? 'Boogie Woogie Coordinate Shift' :
                        copiedKey === 'idle' ? 'Idle Transfiguration' :
                        copiedKey === 'star' ? 'Star Rage' :
                        copiedKey === 'construct' ? 'Construction Materialization' :
                        copiedKey === 'ice' ? 'Ice Formation Glaciers' : 'Innate Sorcery Catalyst';

        let copiedEffectLog = '';
        if (copiedKey === 'limitless') {
          setBarrier = Math.floor(player.stats.mst * 3.0 + 20);
          copiedEffectLog = `mimics [Limitless], drawing an Infinity Shield (+${setBarrier} barrier!)`;
        } else if (copiedKey === 'blood') {
          setHeal = Math.floor(player.maxHp * 0.20 + 10);
          copiedEffectLog = `mimics [Blood Manipulation], siphoning raw blood flow to restore +${setHeal} HP!`;
        } else if (copiedKey === 'speech') {
          setStun = 2;
          copiedEffectLog = `mimics [Cursed Speech], roaring "DON'T MOVE!" to stun target for 2 turns!`;
        } else if (copiedKey === 'ratio') {
          setRatioTurns(3);
          copiedEffectLog = `mimics [Ratio Technique], boosting strike critical rates +50% for 3 turns!`;
        } else if (copiedKey === 'boogie') {
          setDodge = true;
          const targetUnit = updated[targetIdx];
          const pUnit = updated[playerStateIdx];
          const tmpX = pUnit.x;
          const tmpY = pUnit.y;
          pUnit.x = targetUnit.x;
          pUnit.y = targetUnit.y;
          targetUnit.x = tmpX;
          targetUnit.y = tmpY;
          copiedEffectLog = `mimics [Boogie Woogie], preprogramming perfect evasion and swapping coordinates on grid!`;
        } else if (copiedKey === 'idle') {
          dmg = Math.floor(player.stats.mst * 4.5);
          copiedEffectLog = `mimics [Idle Transfiguration], striking souls for massive ignore-barrier ${dmg} damage!`;
        } else if (copiedKey === 'shrine') {
          dmg = Math.floor(player.stats.mst * 4.0);
          copiedEffectLog = `mimics [Shrine Cleave], executing soaring slashes for ${dmg} massive target damage!`;
        } else {
          dmg = Math.floor(player.stats.mst * 3.0 + 10);
          copiedEffectLog = `mimics [Innate Sorcery], discharging unpredictable adaptive energy!`;
        }
        logMsg = `◈ MIMICRY REBOUND: Utilizing copied pathways, you materialise [${copiedDesc}]! \n💥 ${copiedEffectLog} and strikes ${updated[targetIdx].name} for ${dmg} copied damage!`;
      } else {
        cost = 8;
        let techToCopy = 'shrine';
        let copiedName = 'Shrine Cleave & Dismantle';
        const enemyName = enemyTemplate.name.toLowerCase();
        if (enemyName.includes('gojo') || enemyName.includes('satoru')) {
          techToCopy = 'limitless';
          copiedName = 'Limitless Void & Space';
        } else if (enemyName.includes('megumi') || enemyName.includes('fushiguro') || enemyName.includes('shadow')) {
          techToCopy = 'ten_shad';
          copiedName = 'Ten Shadows Summons';
        } else if (enemyName.includes('choso') || enemyName.includes('kamo') || enemyName.includes('blood')) {
          techToCopy = 'blood';
          copiedName = 'Blood Manipulation';
        } else if (enemyName.includes('inumaki') || enemyName.includes('speech')) {
          techToCopy = 'speech';
          copiedName = 'Cursed Speech';
        } else if (enemyName.includes('nanami')) {
          techToCopy = 'ratio';
          copiedName = 'Ratio 7:3 dissection';
        } else if (enemyName.includes('todo') || enemyName.includes('aoi')) {
          techToCopy = 'boogie';
          copiedName = 'Boogie Woogie';
        } else if (enemyName.includes('mahito') || enemyName.includes('idle')) {
          techToCopy = 'idle';
          copiedName = 'Idle Transfiguration';
        } else if (enemyName.includes('yuki') || enemyName.includes('tsukumo') || enemyName.includes('star')) {
          techToCopy = 'star';
          copiedName = 'Star Rage high density';
        } else if (enemyName.includes('yorozu') || enemyName.includes('construct') || enemyName.includes('mai')) {
          techToCopy = 'construct';
          copiedName = 'Construction Materialization';
        } else if (enemyName.includes('uraume') || enemyName.includes('ice')) {
          techToCopy = 'ice';
          copiedName = 'Ice Formation Glaciers';
        }

        setCurrentCopiedTechKey(techToCopy);

        dmg = Math.floor(player.stats.mst * 2.5 + 10);
        logMsg = `◈ COPY DEPLOYED: You mimic ${enemyTemplate.name}'s cursed signature! Successfully copied technique [${copiedName}]! Mirror strike deals ${dmg} resonance damage!`;
      }
    }
    else if (key === 'ice') {
      cost = 11;
      dmg = Math.floor(player.stats.mst * 2.2 + 10);
      setFrost = 3;
      logMsg = `◈ Ice Formation: Glacial spires hit ${updated[targetIdx].name} for ${dmg} frost damage and reduces target speed by 50% for 3 turns!`;
    }
    else {
      cost = 10;
      dmg = Math.floor(Math.random() * 45) + 20;
      logMsg = `◈ Sorcery Trigger: Release unpredictable CE discharges dealing ${dmg} damage!`;
    }

    // Spend Cursed Energy (Reduced by 99.99% if Six Eyes is active!)
    let actualCECost = cost;
    if (player.flags.six_eyes_active) {
      actualCECost = 0;
    }
    updated[playerStateIdx].ce = Math.max(0, playerUnit.ce - actualCECost);

    // Apply stats to targets
    let finalDmgApplied = dmg;
    const targetUnit = updated[targetIdx];
    const isTargetMahoraga = targetUnit.shikiKey === 'mahoraga' || targetUnit.name.includes('Mahoraga');

    if (isTargetMahoraga) {
      const attackName = player.techKey === 'custom' && player.customTechDef ? player.customTechDef.name : player.techName || 'Cursed Technique Spurt';
      const result = processDamageToMahoraga(dmg, attackName);
      finalDmgApplied = result.finalDamage;
      if (result.spinLog) {
        addLog(result.spinLog, 'crit');
      }
    }

    const nextEnemyHp = Math.max(0, updated[targetIdx].hp - finalDmgApplied);
    updated[targetIdx].hp = nextEnemyHp;

    if (setStun > 0) updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, setStun);
    if (setFrost > 0) updated[targetIdx].frost = Math.max(updated[targetIdx].frost, setFrost);
    if (setBurn > 0) updated[targetIdx].burn = Math.max(updated[targetIdx].burn, setBurn);
    if (setBarrier > 0) updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + setBarrier;
    if (setHeal > 0) updated[playerStateIdx].hp = Math.min(player.maxHp, updated[playerStateIdx].hp + setHeal);

    addLog(logMsg, 'player');

    if (setDodge) {
      // Set future dodge
      addLog(`🟢 Evasion corridor active: Immune to coming target action!`, 'player');
    }

    if (nextEnemyHp <= 0) {
      updated[targetIdx].isDead = true;
      addLog(`✓ EXORCISED: ${updated[targetIdx].name} collapsed.`, 'system');
      if (player.flags.ce_recycle_active) {
        updated[playerStateIdx].ce = Math.min(player.maxCe || 100, updated[playerStateIdx].ce + cost);
        addLog(`♻️ RECLAMATION GLOW: Binding Vow triggered! Refunded ${cost} Cursed Energy for successfully exorcising target enemy!`, 'player');
        player.flags.ce_recycle_active = false;
      }
    }

    setCombatants(updated);
    setTimeout(() => {
      triggerTurnCycle(updated, activeIdx + 1);
    }, 1100);
  };

  // RESOVLE THE PROJECTION SORCERY 24 FPS PRE PLANNING CORRIDOR
  const executeProjectionSorcery = () => {
    if (projectQueue.length < 24) return;
    setLocked(true);

    const cost = 14;
    const playerStateIdx = combatants.findIndex(u => u.id === 'player');
    const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (targetIdx === -1) return;

    let updated = [...combatants];
    updated[playerStateIdx].ce = Math.max(0, updated[playerStateIdx].ce - cost);

    addLog(`◈ PROJECTION SORCERY: Slicing 1 second grid into 24 distinct cells... Spends -14 CE.`, 'player');

    let consecutiveAccel = false;
    for (let i = 0; i < projectQueue.length - 1; i++) {
      if (projectQueue[i] === 'accel' && projectQueue[i + 1] === 'accel') {
        consecutiveAccel = true;
        break;
      }
    }

    if (consecutiveAccel) {
      setTimeout(() => {
        Snd.miss();
        addLog(`✕ Infraction on consecutive Accel coordinate segments! Physics posture failed!`, 'enemy');
        addLog(`✕ RULE OF 24 FPS INFRACTION! Your coordination collapses and you freeze rigid!`, 'crit');
        
        setProjectQueue([]);
        setIsPlanningProject(false);

        // Exploit lock
        const rawDmg = Math.floor(enemyTemplate.str[1] * 1.5 + 5);
        const defenseVal = Math.floor(player.stats.end * 0.4 + player.stats.agi * 0.2);
        const outputDmg = Math.max(8, rawDmg - defenseVal);
        
        updated[playerStateIdx].hp = Math.max(0, updated[playerStateIdx].hp - outputDmg);
        
        addLog(`☠ ${enemyTemplate.name} exploits your frozen state: Inflicts ${outputDmg} heavy feedback damage!`, 'enemy');

        if (updated[playerStateIdx].hp <= 0) {
          updated[playerStateIdx].isDead = true;
          setCombatants(updated);
          setTimeout(() => {
            onDefeat(`Exorcised due to motor mapping failure under 24 FPS constraints.`);
          }, 800);
        } else {
          setCombatants(updated);
          setTimeout(() => {
            triggerTurnCycle(updated, activeIdx + 1);
          }, 1000);
        }
      }, 800);
      return;
    }

    setTimeout(() => {
      setProjectionEffectActive(true);
      
      setTimeout(() => {
        setProjectionEffectActive(false);
        let multiplier = 1.0;
        let totalDmg = 0;
        let freezeCount = 0;
        let dodgeBonus = 0;

        projectQueue.forEach((act) => {
          if (act === 'strike') {
            let force = Math.max(1, Math.floor(((player.stats.agi * 0.25 + player.stats.str * 0.08) * multiplier) + 1));
            totalDmg += force;
          } 
          else if (act === 'evade') {
            dodgeBonus += 4;
          } 
          else if (act === 'accel') {
            multiplier += 0.12;
          } 
          else if (act === 'freeze') {
            freezeCount += 1;
          }
          else if (act === 'move_fwd') {
            updated[playerStateIdx].y = Math.max(0, (updated[playerStateIdx].y || 50) - 2);
          }
          else if (act === 'move_back') {
            updated[playerStateIdx].y = Math.min(100, (updated[playerStateIdx].y || 50) + 2);
          }
        });

        const nextEnemyHp = Math.max(0, updated[targetIdx].hp - totalDmg);
        updated[targetIdx].hp = nextEnemyHp;
        
        Snd.tech();
        addLog(`⚡ SUCCESSFUL RESOLUTION! All 24 frames loop seamlessly. Deals ${totalDmg} total speed-flurry damage (Multiplier: ${multiplier.toFixed(2)}x) to ${updated[targetIdx].name}!`, 'crit');

        const holdsDodge = dodgeBonus > 0 && Math.random() * 100 < dodgeBonus;
        if (holdsDodge) {
          updated[playerStateIdx].barrier = (updated[playerStateIdx].barrier || 0) + 40;
          addLog(`🟢 Aero Grid active: Immune to target incoming strikes (+40 protective barrier)!`, 'player');
        }

        const activeFreezeCount = Math.floor(freezeCount / 6) + (freezeCount % 6 > 0 ? 1 : 0);
        if (activeFreezeCount > 0) {
          updated[targetIdx].stunned = Math.max(updated[targetIdx].stunned, activeFreezeCount);
          addLog(`❄ 24 FPS COMPRESSION: Target fails to map preprogrammed coordinates! Frozen solid for ${activeFreezeCount} turns!`, 'system');
        }

        setProjectQueue([]);
        setIsPlanningProject(false);

        if (nextEnemyHp <= 0) {
          updated[targetIdx].isDead = true;
          addLog(`✓ EXORCISED: ${updated[targetIdx].name} collapsed.`, 'system');
        }

        setCombatants(updated);
        setTimeout(() => {
          triggerTurnCycle(updated, activeIdx + 1);
        }, 1000);
      }, 1500); // the duration of the visualizer
    }, 200);
  };

  // BLACK FLASH ATTACKS SYNCS (25%)
  const handleBlackFlash = () => {
    if (locked) return;
    setLocked(true);

    const targetIdx = combatants.findIndex(u => u.type === 'enemy' && !u.isDead);
    if (targetIdx === -1) return;

    const success = Math.random() < 0.25;

    if (success) {
      Snd.heavyHit();
      const dmg = Math.floor((player.stats.mst * 3.5 + Math.random() * (player.stats.mst * 2)) * 2.3);

      let updated = [...combatants];
      const nextEnemyHp = Math.max(0, updated[targetIdx].hp - dmg);
      updated[targetIdx].hp = nextEnemyHp;

      addLog(`⚡⚡ BLACK FLASH COLLISION! ⚡⚡ Your strike is perfectly synchronized within 0.000001 seconds of CE delivery! Space warps and buckles: Deal ${dmg} absolute fatal damage to ${updated[targetIdx].name}!`, 'crit');

      if (nextEnemyHp <= 0) {
        updated[targetIdx].isDead = true;
        addLog(`✓ TARGET SUBDUED! ${updated[targetIdx].name} was vaporised under the Black Flash void.`, 'system');
      }

      setCombatants(updated);
      setTimeout(() => {
        triggerTurnCycle(updated, activeIdx + 1);
      }, 1000);
    } else {
      Snd.miss();
      addLog(`✕ Spatial sync failure. Cursed energy was delivered slightly too early or late. Black Flash fizzled out!`, 'system');
      setTimeout(() => {
        triggerTurnCycle(combatants, activeIdx + 1);
      }, 1000);
    }
  };

  // ESCAPE THE BATTLEGROUND
  const handleFlee = () => {
    if (locked) return;
    setLocked(true);

    const escapeProb = 0.35 + player.stats.agi * 0.04;
    const success = Math.random() < escapeProb;

    if (success) {
      Snd.ui();
      addLog(`↩ Tactical escape active! Weaving behind partitions and blending into shadow coordinates. Escaping...`, 'system');
      setTimeout(() => {
        onFlee();
      }, 900);
    } else {
      Snd.hit();
      addLog(`❌ ESCAPE INTERCEPTED! Active targets anticipate physical displacements and shield the exit.`, 'enemy');
      setTimeout(() => {
        triggerTurnCycle(combatants, activeIdx + 1);
      }, 1000);
    }
  };

  // PRE-SETUP SCREEN VIEW (DEPLOYMENT DETAILS)
  if (showPreSetup) {
    return (
      <div className="fixed inset-0 min-h-screen bg-[#010202] text-[#a4c8aa] font-mono p-4 z-[999] flex flex-col justify-between overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto space-y-6 py-6 flex-1 flex flex-col justify-center">
          
          <div className="text-center border-b border-[#112019] pb-4">
            <h2 className="text-2xl font-black font-vt text-purple-400 tracking-widest uppercase">
              // Pre-Deployment Protocol //
            </h2>
            <p className="text-[10px] text-[#4d7155] tracking-widest mt-1 select-none">
              DEPLOY MISSION PARTNERS AND CONJURE BOUND SHIKIGAMI ENCOUNTERS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Deploy Partners column */}
            <div className="border border-[#112019] bg-[#040908] p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] text-[#00ff9c] font-black uppercase tracking-wider mb-2.5 border-b border-[#112019] pb-1.5 flex items-center justify-between">
                  <span>① Allies Co-deployment</span>
                  <span className="text-[9px] text-[#2e4a34] font-normal">MAX 1 PARTNER</span>
                </h4>

                {enemyTemplate.isShikigami ? (
                  <div className="text-center py-8 text-[10px] text-amber-500/80 leading-relaxed font-bold animate-pulse">
                    SHIKIGAMI EXORCISM RITUAL
                    <br />
                    <span className="opacity-75 font-normal text-[#2e4a34]">You must face the ritual alone. Partner deployment is globally locked and invalidated for taming processes.</span>
                  </div>
                ) : eligiblePartners.length > 0 ? (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <div
                      onClick={() => {
                        Snd.sel();
                        setSelectedPartnerId('none');
                      }}
                      className={`p-2 border text-xs cursor-pointer ${
                        selectedPartnerId === 'none'
                          ? 'border-[#00ff9c] bg-[rgba(0,255,156,0.03)] text-white'
                          : 'border-[#112019] bg-black text-[#527d5b]'
                      }`}
                    >
                      <div className="font-bold">SOLO MISSION</div>
                      <div className="text-[9px] text-[#2e4a34] mt-0.5">Commence the battle on raw solo limits (free).</div>
                    </div>

                    {eligiblePartners.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          Snd.sel();
                          setSelectedPartnerId(p.id);
                        }}
                        className={`p-2 border text-xs cursor-pointer transition ${
                          selectedPartnerId === p.id
                            ? 'border-[#00ff9c] bg-[rgba(0,255,156,0.03)] text-white'
                            : 'border-[#112019] bg-black text-[#527d5b] hover:border-[#1d3828]'
                        }`}
                      >
                        <div className="font-bold flex justify-between">
                          <span>{p.name}</span>
                          <span className="text-[#00c47a] text-[9.5px]">Agi: {p.agi}</span>
                        </div>
                        <div className="text-[9px] text-[#2e4a34] leading-tight mt-0.5">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[10px] text-[#2e4a34] leading-relaxed">
                    No active mission partners available.
                    <br />
                    <span className="opacity-75">Connect with allies at Jujutsu High, or build high Bonds with your family parents/spouse to unlock assist deployment!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deploy Shikigamis column */}
            <div className="border border-[#112019] bg-[#040908] p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] text-purple-400 font-black uppercase tracking-wider mb-2.5 border-b border-[#112019] pb-1.5 flex items-center justify-between">
                  <span>② Shikigami Conjuring</span>
                  <span className="text-[9px] text-[#2e4a34] font-normal">MAX 1 SHIKI</span>
                </h4>

                {eligibleShikis.length > 0 ? (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <div
                      onClick={() => {
                        Snd.sel();
                        setSelectedShikiId('none');
                      }}
                      className={`p-2 border text-xs cursor-pointer ${
                        selectedShikiId === 'none'
                          ? 'border-purple-500 bg-purple-950/10 text-white'
                          : 'border-[#112019] bg-black text-[#527d5b]'
                      }`}
                    >
                      <div className="font-bold">NO SHIKIGAMI</div>
                      <div className="text-[9px] text-[#2e4a34] mt-0.5">Fight without auxiliary shadow projections.</div>
                    </div>

                    {eligibleShikis.map(s => (
                      <div
                        key={s.key}
                        onClick={() => {
                          Snd.sel();
                          setSelectedShikiId(s.key);
                        }}
                        className={`p-2 border text-xs cursor-pointer transition ${
                          selectedShikiId === s.key
                            ? 'border-purple-500 bg-purple-950/10 text-white'
                            : 'border-[#112019] bg-black text-[#527d5b] hover:border-[#1d3828]'
                        }`}
                      >
                        <div className="font-bold flex justify-between">
                          <span>{s.name}</span>
                          <span className="text-purple-300 text-[9.5px]">Agi: {s.agi}</span>
                        </div>
                        <div className="text-[9px] text-[#2e4a34] leading-tight mt-0.5">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[10px] text-[#2e4a34] leading-relaxed">
                    No tamed shadows currently available.
                    <br />
                    <span className="opacity-75">Defeat shade entities under raw Taming Rituals in your [Innate Art] tab to bind their sigils!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Commence button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleDeployCommence}
              className="px-8 py-3.5 border-2 border-[#00ff9c] bg-[#020504] text-[#00ff9c] hover:bg-[#00ff9c]/10 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(0,255,156,0.15)] flex items-center gap-1.5 animate-pulse"
            >
              <span>⚔ COMMENCE FIELD ENGAGEMENT ⚔</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CORE COMBAT CONSTANTS FOR HEADER CALCULATIONS
  const playerState = combatants.find(u => u.id === 'player');
  const primaryEnemyState = combatants.find(u => u.id === 'enemy-0') || combatants.find(u => u.type === 'enemy' && !u.isDead);

  const activeStateObj = combatants[activeIdx] || { type: 'player', name: 'Unknown' };

  // CORE RENDER SCREEN
  return (
    <div className="min-h-[100dvh] bg-[#010202] text-[#a4c8aa] font-mono z-[999] flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none pb-12 lg:pb-0">
      
      {/* 1. DOMAIN CLASH MODAL TUG OF WAR SCREEN OVERLAY */}
      {clashActive && (
        <div className="fixed inset-0 bg-[#000]/95 z-[99999] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-xl border-2 border-purple-500 bg-black p-6 space-y-6 text-center select-none shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <h3 className="text-xl font-black font-vt text-purple-400 tracking-widest animate-pulse flex items-center justify-center gap-2">
              <span>🌌 BARRIER DOMAIN MATCH CLASH 🌌</span>
            </h3>
            
            <p className="text-xs text-[#628a6a] max-w-md mx-auto leading-relaxed select-text">
              {clashLog}
            </p>

            {/* Overlap Progress Bar visualizer */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[9px] tracking-wider text-[#2e4a34] font-bold">
                <span className="text-[#00ff9c]">YOUR BARRIER DOMINANCE ({(100 - clashValue).toFixed(0)}%)</span>
                <span className="text-red-500">ENEMY COMPRESSION ON SHORE ({clashValue.toFixed(0)}%)</span>
              </div>
              <div className="h-5 border border-purple-900 bg-black flex overflow-hidden">
                <div
                  className="h-full bg-[#00ff9c] transition-all duration-300"
                  style={{ width: `${100 - clashValue}%` }}
                />
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${clashValue}%` }}
                />
              </div>
            </div>

            {/* Buttons for convergence decisions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  Snd.ui();
                  setClashPlayerMultiplier(prev => prev + 0.15);
                  resolveDomainClashRoll(false);
                }}
                className="py-3 px-4 border border-[#00ff9c] hover:bg-[#00ff9c]/10 text-[#00ff9c] text-xs font-bold uppercase transition"
              >
                Focus Output (+15% flow)
              </button>

              <button
                disabled={clashVisualBoundEffect}
                onClick={() => {
                  Snd.forge();
                  setClashVisualBoundEffect(true);
                  setClashPlayerMultiplier(prev => prev + 0.50);
                  resolveDomainClashRoll(true);
                }}
                className="py-3 px-4 border border-amber-600 disabled:opacity-40 text-amber-500 hover:bg-amber-950/10 text-xs font-bold uppercase transition col-span-1"
              >
                Visual Binding (+50% roll)
              </button>
            </div>

            <p className="text-[9px] text-[#2e4a34] uppercase tracking-wide">
              Push the dominance slider completely to your limit to shatter the enemy domain shell!
            </p>
          </div>
        </div>
      )}

      {/* PROJECTION SORCERY 24 FPS VISUALIZER OVERLAY */}
      {projectionEffectActive && (
        <div className="fixed inset-0 bg-[#000]/95 z-[999999] flex items-center justify-center pointer-events-none p-4 overflow-hidden">
           <div className="relative w-full h-[60vh] border-y-[10px] border-[#000] flex animate-pulse">
             {/* 24 Frame simulation */}
             {Array.from({ length: 24 }).map((_, i) => (
               <div key={i} className="flex-1 border-r border-[#00ff9c]/20 bg-cover bg-center transition-all" 
                    style={{ 
                      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" transform="rotate(${i * 15})"><rect width="1" height="10" fill="gray"/></svg>')` ,
                      opacity: Math.random() * 0.5 + 0.3,
                      filter: `invert(${Math.random() > 0.5 ? 1 : 0})`
                    }}>
                 <div className="w-full h-full bg-[#00ff9c]/10" style={{ transform: `scaleX(${Math.random() * 2})` }} />
               </div>
             ))}
             <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl md:text-8xl font-black italic text-[#00ff9c] tracking-tighter opacity-80" style={{ textShadow: "0 0 40px #00ff9c" }}>24 FPS</h1>
             </div>
           </div>
        </div>
      )}

      {/* 2. MAIN FULL SCREEN INTERFACES CARD */}
      <div className="w-full h-full flex-1 flex flex-col p-4 sm:p-6 gap-4 justify-between bg-radial bg-[#040a08]/30">
        
        {/* Battle Header bar */}
        <div className="border-b border-[#112019] pb-3 flex flex-wrap justify-between items-center bg-black/40 px-3 py-1.5 select-none gap-2">
          <div>
            <h2 className="text-xl font-black font-vt text-shadow text-red-500 tracking-widest uppercase">
              ⚔ EXORCISM FIELD COLLISION ⚔
            </h2>
            <div className="text-[9px] text-[#2e4a34] tracking-widest uppercase mt-0.5">
              // SCENT INDEX REGISTRY: {enemyTemplate.grade} ENCOUNTER TRUCE //
            </div>
          </div>

          {/* Active queue visualizer top ribbon */}
          <div className="flex items-center gap-1 bg-black p-1 border border-[#112019] max-w-md overflow-x-auto select-none">
            <span className="text-[8px] text-[#2e4a34] pr-1.5 font-bold uppercase">Order:</span>
            {combatants.map((cmb, i) => {
              const isActive = i === activeIdx;
              const hasStunned = cmb.stunned > 0;
              const isFriendly = cmb.type !== 'enemy';

              return (
                <div
                  key={cmb.id}
                  className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 border select-none ${
                    cmb.isDead
                      ? 'border-[#2d1111]/30 bg-[#2d1111]/10 text-red-900/30'
                      : isActive
                      ? 'border-[#00ff9c] text-[#00ff9c] font-black bg-[rgba(0,255,156,0.065)] scale-105'
                      : isFriendly
                      ? 'border-purple-600/35 bg-purple-950/5 text-purple-400'
                      : 'border-red-600/30 bg-red-950/5 text-red-400'
                  }`}
                >
                  <span className="font-vt uppercase truncate max-w-[50px]">{cmb.name.split(' ')[0]}</span>
                  {hasStunned && <span className="text-[7.5px] text-fuchsia-400 font-extrabold">❄</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Both fighters details dashboards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(250px,320px)_1fr] gap-4 flex-1 min-h-0 overflow-y-auto py-1">
          
          {/* Active Enemies Nodes lists */}
          <div className="space-y-2 max-h-full overflow-y-auto pr-1">
            <h4 className="text-[9px] text-[#2e4a34] tracking-widest uppercase font-bold border-b border-[#112019] pb-1 select-none flex justify-between">
              <span>TARGET OCCULT ALIGNMENT</span>
              <span>GRADE DETECTED</span>
            </h4>

            {combatants
              .filter(cmb => cmb.type === 'enemy')
              .map(cmb => {
                const isTargetDead = cmb.isDead;
                const hpPct = (cmb.hp / cmb.maxHp) * 100;
                
                return (
                  <div
                    key={cmb.id}
                    className={`border p-3 transition-all ${
                      isTargetDead 
                        ? 'border-red-950/20 bg-red-950/5 opacity-35' 
                        : 'border-[#112019] bg-[#020504]/90'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold uppercase font-vt tracking-wide ${isTargetDead ? 'text-red-900 line-through' : 'text-red-500'}`}>
                        {cmb.name} {isTargetDead && ' (EXORCISED)'}
                      </span>
                      <span className="text-[8px] text-[#2e4a34] px-1.5 py-0.5 border border-[#112019] scale-90 select-none">
                        {cmb.grade || 'Grade 3'}
                      </span>
                    </div>

                    {!isTargetDead && (
                      <div className="space-y-1.5 mt-2">
                        {/* HP Bar */}
                        <div>
                          <div className="flex justify-between text-[8px] text-[#2e4a34] leading-none mb-0.5">
                            <span>VITALS (HP)</span>
                            <span className="text-red-400">{cmb.hp}/{cmb.maxHp}</span>
                          </div>
                          <div className="h-1.5 border border-[#112019] bg-black">
                            <div
                              className="h-full bg-red-600 transition-all duration-300"
                              style={{ width: `${Math.max(0, hpPct)}%` }}
                            />
                          </div>
                        </div>

                        {/* Status elements */}
                        {(cmb.stunned > 0 || cmb.burn > 0 || cmb.frost > 0) && (
                          <div className="flex gap-1 pt-1 border-t border-[#112019]/40 select-none">
                            {cmb.stunned > 0 && <span className="text-[7px] bg-purple-900/40 text-purple-400 font-extrabold border border-purple-500/30 px-1 py-0.5 rounded-sm">STUN {cmb.stunned}T</span>}
                            {cmb.burn > 0 && <span className="text-[7px] bg-red-950 text-red-300 font-extrabold border border-red-500/30 px-1 py-0.5 rounded-sm">BURN {cmb.burn}T</span>}
                            {cmb.frost > 0 && <span className="text-[7px] bg-cyan-950 text-cyan-300 font-extrabold border border-cyan-500/30 px-1 py-0.5 rounded-sm">FROST {cmb.frost}T</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* MIDDLE COLUMN: TACTICAL SPATIAL RADAR */}
          <div className="border border-[#112019] bg-[#020504]/90 p-4 flex flex-col justify-between select-none min-h-[200px] lg:min-h-0 order-first lg:order-none mb-4 lg:mb-0">
            <h4 className="text-[9px] text-[#2e4a34] tracking-widest uppercase font-bold border-b border-[#112019] pb-1 flex justify-between">
              <span>SPATIAL ALIGNMENT RADAR</span>
              <span className="text-[#00ff9c] animate-pulse">LIVE</span>
            </h4>
            
            <div className="flex-1 my-2 min-h-[180px] border border-[#112019]/50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#05110a] to-[#010202] relative touch-none overflow-hidden" 
              onClick={(e) => {
                if (radarMode !== 'move' || locked) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                
                // Validate if click is within Agility range of active unit
                const active = combatants[activeIdx];
                const currentX = active.x || 50;
                const currentY = active.y || 80;
                const dist = Math.sqrt(Math.pow(clickX - currentX, 2) + Math.pow(clickY - currentY, 2));
                
                if (dist <= active.agi) {
                  // Execute move
                  Snd.ui();
                  let updated = [...combatants];
                  updated[activeIdx].x = clickX;
                  updated[activeIdx].y = clickY;
                  addLog(`👟 TACTICAL REPOSITION: ${active.name} traversed across the battlefield. Vitals stabilized at new spatial coordinates.`, 'player');
                  setCombatants(updated);
                  setRadarMode('idle');
                  setTimeout(() => {
                    triggerTurnCycle(updated, activeIdx + 1);
                  }, 800);
                } else {
                  addLog(`✕ MOVEMENT OUT OF BOUNDS: ${active.name}'s agility (${active.agi}m) cannot reach that span.`, 'system');
                }
              }}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 opacity-10 pointer-events-none">
                {Array.from({length: 25}).map((_, i) => <div key={i} className="border-[0.5px] border-[#00ff9c]"></div>)}
              </div>

              {/* Movement Range Visualizer */}
              {radarMode === 'move' && combatants[activeIdx] && !combatants[activeIdx].isDead && (
                <div 
                  className="absolute border border-[#00ff9c]/30 bg-[#00ff9c]/5 rounded-full pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${combatants[activeIdx].x}%`,
                    top: `${combatants[activeIdx].y}%`,
                    width: `${combatants[activeIdx].agi * 2}%`,
                    height: `${combatants[activeIdx].agi * 2}%`
                  }}
                />
              )}

              {/* Render combatants on radar */}
              {combatants.map(cmb => {
                if (cmb.isDead || cmb.x === undefined || cmb.y === undefined) return null;
                const isFriendly = cmb.type !== 'enemy';
                
                let dotColor = 'bg-red-500';
                if (cmb.type === 'player') dotColor = 'bg-[#00ff9c]';
                else if (cmb.type === 'partner') dotColor = 'bg-blue-400';
                else if (cmb.type === 'shikigami') dotColor = 'bg-purple-500';

                const isSelectedForTarget = selectedSpatialTarget === cmb.id;
                const isActive = activeIdx >= 0 && combatants[activeIdx].id === cmb.id;

                return (
                  <div
                    key={cmb.id}
                    onClick={() => {
                      if (!locked) {
                        setSelectedSpatialTarget(cmb.id);
                        Snd.sel();
                      }
                    }}
                    className={`absolute w-3 h-3 rounded-full ${dotColor} cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_currentColor] transition-all duration-300
                      ${isSelectedForTarget ? 'ring-2 ring-white scale-125 z-20 animate-pulse' : 'hover:scale-110 z-10'}
                      ${isActive ? 'ring-2 ring-yellow-400 animate-bounce' : ''}
                    `}
                    style={{ left: `${cmb.x}%`, top: `${cmb.y}%` }}
                    title={`${cmb.name} (Dist: ${
                      combatants[activeIdx] && !combatants[activeIdx].isDead 
                        ? getDistance(cmb, combatants[activeIdx]).toFixed(1) 
                        : '?'
                    }m)`}
                  />
                )
              })}
            </div>
            {radarMode === 'move' ? (
              <div className="text-center">
                 <div className="text-[10px] text-amber-500 animate-pulse font-bold">CLICK RADAR TO MOVE ({combatants[activeIdx].agi}m RANGE)</div>
                 <button onClick={()=>{setRadarMode('idle');Snd.sel();}} className="mt-1 text-[8px] text-gray-500 hover:text-white uppercase cursor-pointer">Cancel Move</button>
              </div>
            ) : selectedSpatialTarget ? (
              <div className="text-[10px] text-center font-bold text-white uppercase bg-white/10 border border-white/20 p-1">
                🎯 TARGET LOCKED: {combatants.find(c => c.id === selectedSpatialTarget)?.name}
              </div>
            ) : (
              <div className="text-[8px] text-[#2e4a34] text-center leading-tight">
                SELECT TARGET DOT TO FOCUS ATTACKS.
                <br/>GREEN=You | BLUE=Ally | PURPLE=Shiki | RED=Enemy
              </div>
            )}
          </div>

          {/* Player Team list nodes */}
          <div className="space-y-2 max-h-full overflow-y-auto pr-1">
            <h4 className="text-[9px] text-[#2e4a34] tracking-widest uppercase font-bold border-b border-[#112019] pb-1 select-none flex justify-between">
              <span>ALIGNED DEFENSIVE PARTY</span>
              <span>GRADE</span>
            </h4>

            {combatants
              .filter(cmb => cmb.type !== 'enemy')
              .map(cmb => {
                const isAllyDead = cmb.isDead;
                const hpPct = (cmb.hp / cmb.maxHp) * 100;
                const isActv = activeStateObj.id === cmb.id;

                return (
                  <div
                    key={cmb.id}
                    className={`border p-3 transition-all ${
                      isAllyDead
                        ? 'border-gray-950/20 bg-gray-950/5 opacity-35'
                        : isActv
                        ? 'border-[#00ff9c] bg-[rgba(0,255,156,0.02)]'
                        : 'border-[#112019] bg-[#020504]/90'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold uppercase font-vt tracking-wide ${isAllyDead ? 'text-gray-600 line-through' : cmb.id === 'player' ? 'text-[#00ff9c]' : 'text-purple-400'}`}>
                        {cmb.name} {isAllyDead && ' (POSTURE BROKEN)'}
                      </span>
                      <span className="text-[8px] text-[#2e4a34] px-1.5 py-0.5 border border-[#112019] scale-90 select-none uppercase">
                        {cmb.id === 'player' ? player.rank : 'ALLY'}
                      </span>
                    </div>

                    {!isAllyDead && (
                      <div className="space-y-1.5 mt-2">
                        {/* HP Bar */}
                        <div>
                          <div className="flex justify-between text-[8px] text-[#2e4a34] leading-none mb-0.5">
                            <span>VITALS (HP)</span>
                            <span className="text-[#00ff9c]">{cmb.hp}/{cmb.maxHp}</span>
                          </div>
                          <div className="h-1.5 border border-[#112019] bg-black">
                            <div
                              className="h-full bg-[#00ff9c] transition-all duration-300"
                              style={{ width: `${Math.max(0, hpPct)}%` }}
                            />
                          </div>
                        </div>

                        {/* CE Bar */}
                        {cmb.maxCe > 0 && (
                          <div>
                            <div className="flex justify-between text-[8px] text-[#2e4a34] leading-none mb-0.5">
                              <span>CURSED FLOW (CE)</span>
                              <span className="text-purple-400">{cmb.ce}/{cmb.maxCe}</span>
                            </div>
                            <div className="h-1 border border-[#112019] bg-black">
                              <div
                                className="h-full bg-purple-500 transition-all duration-300"
                                style={{ width: `${Math.max(0, (cmb.ce / cmb.maxCe) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Status overlays */}
                        {(cmb.barrier > 0 || cmb.id === 'player' && (ratioTurns > 0 || persistentAtkBuff > 0 || delayedSurgeDmg > 0)) && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-[#112019]/40 select-none">
                            {cmb.barrier > 0 && <span className="text-[7px] bg-sky-950 text-sky-400 font-extrabold border border-sky-400/20 px-1 py-0.5">SHIELD {cmb.barrier}</span>}
                            {cmb.id === 'player' && ratioTurns > 0 && <span className="text-[7px] bg-amber-950 text-amber-400 font-extrabold border border-amber-500/20 px-1 py-0.5">GRID {ratioTurns}T</span>}
                            {cmb.id === 'player' && persistentAtkBuff > 0 && <span className="text-[7px] bg-red-950 text-red-300 font-extrabold border border-red-500/20 px-1 py-0.5">ATK +{persistentAtkBuff}</span>}
                            {cmb.id === 'player' && delayedSurgeDmg > 0 && <span className="text-[7px] bg-purple-950 text-purple-300 font-extrabold border border-purple-500/20 px-1 py-0.5">SURGE +{delayedSurgeDmg}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* 3. Dynamic Real-Time Terminal Log */}
        <div className="border border-[#112019] bg-black p-3.5 h-[16vh] overflow-y-auto space-y-1 rounded-sm shadow-inner relative select-text">
          <div className="text-[8px] text-[#223626] font-bold tracking-widest uppercase mb-1.5 border-b border-[#112019]/40 pb-0.5 select-none font-sans">
            // OCCULT TERMINAL BATTLEFEED //
          </div>
          {logs.map((log, i) => {
            let colorClass = 'text-[#628a6a]';
            if (log.type === 'player') colorClass = 'text-[#00ff9c]';
            else if (log.type === 'enemy') colorClass = 'text-red-400';
            else if (log.type === 'crit') colorClass = 'text-[#ffcc00] font-extrabold text-shadow';
            else if (log.type === 'system') colorClass = 'text-[#2e4a34] italic';

            return (
              <div key={i} className={`text-[11.5px] ${colorClass} leading-relaxed`}>
                {log.msg}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>

        {/* 4. Action Interface Area panel (Frame planner or action selection) */}
        <div className="bg-[#020504] border border-[#112019] p-3 rounded-sm">
          {isPlanningProject ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-purple-500/35 pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-purple-400 flex items-center gap-2">
                    <span>◈ PROJECTION SORCERY // FPS PROGRAMMING CORRIDOR</span>
                  </h3>
                  <p className="text-[9px] text-[#4d7155] leading-relaxed select-none">
                    Fill exactly 24 segments. <span className="text-red-400 font-bold font-sans">Wait! Never stack consecutive Accels back-to-back</span> or coordinates lock rigid!
                  </p>
                </div>
                <button
                  onClick={() => {
                    Snd.ui();
                    setProjectQueue([]);
                    setIsPlanningProject(false);
                  }}
                  className="text-[9px] border border-red-500/50 text-red-400 hover:bg-red-500/10 px-2.5 py-1 font-bold uppercase transition"
                >
                  ABORT FLOW
                </button>
              </div>

              {/* Progress counter */}
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-0.5 sm:gap-1 py-1 select-none">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const val = projectQueue[idx];
                  const matched = PROJECT_ACTIONS.find(a => a.key === val);
                  return (
                    <div
                      key={idx}
                      className={`h-7 sm:h-11 flex flex-col items-center justify-center p-0.5 border ${
                        matched
                          ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-[0_0_5px_rgba(168,85,247,0.15)]'
                          : 'border-[#112019] bg-black text-[#2e4a34]'
                      }`}
                    >
                      <span className="hidden sm:inline-block text-[7px] text-[#2c3e31] font-bold self-start">{idx + 1}</span>
                      <span className="text-[7px] sm:text-[9px] font-black font-vt text-center truncate w-full uppercase leading-none">
                        {matched ? matched.name.split(' ')[0].substring(0,3) : '–'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-1">
                {PROJECT_ACTIONS.map(act => (
                  <button
                    key={act.key}
                    disabled={projectQueue.length >= 24}
                    onClick={() => {
                      if (projectQueue.length < 24) {
                        Snd.sel();
                        setProjectQueue(prev => [...prev, act.key]);
                      }
                    }}
                    className={`border p-1 sm:p-1.5 rounded-sm flex flex-col items-center justify-center sm:items-start gap-0.5 hover:bg-opacity-85 transition disabled:opacity-20 ${act.color} text-center sm:text-left min-h-[36px] sm:min-h-[44px] cursor-pointer`}
                  >
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">{act.name}</span>
                    <span className="hidden sm:block text-[8px] leading-tight font-medium opacity-70 truncate w-full">{act.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={projectQueue.length === 0}
                  onClick={() => {
                    Snd.ui();
                    setProjectQueue(prev => prev.slice(0, -1));
                  }}
                  className="flex-1 py-1.5 text-xs border border-[#112019] text-[#2e4a34] hover:border-gray-500 hover:text-white uppercase font-bold disabled:opacity-20"
                >
                  ⌫ POP Segment
                </button>
                <button
                  disabled={projectQueue.length < 24}
                  onClick={executeProjectionSorcery}
                  className="flex-[2] py-2 text-xs border border-purple-500 bg-purple-950/20 text-purple-300 hover:border-purple-300 hover:bg-purple-950/50 uppercase font-extrabold tracking-widest disabled:opacity-20 flex items-center justify-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
                >
                  ⚡ COMPRESS 24 FPS GRID ⚡
                </button>
              </div>
            </div>
          ) : showCustomMoveSelector ? (
            <div className="space-y-3.5 bg-black/60 p-3.5 border border-[#1b3c25] rounded-sm">
              <div className="flex justify-between items-center border-b border-[#00ff9c]/30 pb-1.5 w-full">
                <span className="text-xs text-[#00ff9c] font-black uppercase tracking-widest">// DEPLOY INNATE ADVANCED ART: {player.customTechDef?.name || 'CUSTOM CORE'}</span>
                <button
                  type="button"
                  onClick={() => {
                    Snd.ui();
                    setShowCustomMoveSelector(false);
                  }}
                  className="text-[9px] text-pink-400 font-extrabold hover:underline uppercase tracking-wider bg-black/80 px-2 py-0.5 border border-pink-950/50 cursor-pointer"
                >
                  ✕ CANCEL SELECT
                </button>
              </div>

              {/* Sub moves list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {player.customTechDef?.moves?.map((move) => {
                  const cooldownLeft = customMoveCooldowns[move.id] || 0;
                  const canAfford = (playerState?.ce || 0) >= move.ceCost;
                  const isBlocked = cooldownLeft > 0 || !canAfford;

                  return (
                    <button
                      key={move.id}
                      disabled={isBlocked}
                      onClick={() => handleExecuteCustomMove(move.id)}
                      className={`p-2.5 border text-left rounded-xs flex flex-col justify-between h-[105px] transition cursor-pointer relative overflow-hidden group ${
                        isBlocked
                          ? 'border-neutral-950 bg-neutral-950/20 text-neutral-500 cursor-not-allowed'
                          : move.type === 'strike'
                          ? 'border-purple-900/60 hover:border-purple-400 bg-purple-950/5 hover:bg-purple-900/10 text-purple-200'
                          : move.type === 'summon'
                          ? 'border-emerald-900/60 hover:border-emerald-400 bg-emerald-950/5 hover:bg-emerald-900/10 text-emerald-200'
                          : move.type === 'speed_frame'
                          ? 'border-cyan-900/60 hover:border-cyan-400 bg-cyan-950/5 hover:bg-cyan-900/10 text-cyan-200'
                          : 'border-amber-900/60 hover:border-amber-400 bg-amber-950/5 hover:bg-amber-900/10 text-amber-200'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10.5px] font-black uppercase tracking-wide truncate w-[75%]">{move.name}</span>
                          <span className={`text-[8px] px-1 font-bold rounded-xs font-mono uppercase ${
                            move.type === 'strike' ? 'bg-purple-950 text-purple-400' :
                            move.type === 'summon' ? 'bg-emerald-950 text-emerald-400' :
                            move.type === 'speed_frame' ? 'bg-cyan-950 text-cyan-400' :
                            'bg-amber-950 text-amber-400'
                          }`}>
                            {move.type}
                          </span>
                        </div>
                        <p className="text-[8.5px] leading-relaxed mt-1 text-neutral-400 opacity-90 line-clamp-2 italic">
                          {move.type === 'strike' && `Deals calibrated striking impact scales (${move.dmgMult || 1.5}x multiplier) scaling off ${move.scaleStat?.toUpperCase()}.`}
                          {move.type === 'summon' && `Conjures Shadow summon [${move.summonName}] featuring specialized ${move.summonPassive || 'none'} qualities.`}
                          {move.type === 'speed_frame' && `Calculates 24-FPS mechanics: triggers frame actions like ${move.speedAction}.`}
                          {move.type === 'curse_law' && `Deploys binding rule pales: activates ${move.lawType} space law.`}
                        </p>
                      </div>

                      <div className="flex justify-between items-center w-full mt-1.5 pt-1.5 border-t border-white/5 text-[9px] font-mono">
                        <span className={canAfford ? 'text-pink-400 font-bold' : 'text-red-500 font-extrabold'}>
                          ⚡ {move.ceCost} CE
                        </span>
                        {cooldownLeft > 0 ? (
                          <span className="text-amber-500 font-bold animate-pulse">
                            ⏳ CD: {cooldownLeft}t
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">✓ Ready</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Domain Expansion Button */}
              {(player.customTechDef?.hasDomain || (['limitless', 'ten_shad', 'shrine'].includes(player.techKey) && player.stats.mst >= 25)) && (
                <div className="pt-2 border-t border-[#112019] flex justify-center">
                  <button
                    disabled={(playerState?.ce || 0) < 25}
                    onClick={player.customTechDef?.hasDomain ? handleExpandCustomDomain : handleExpandStandardDomain}
                    className={`w-full max-w-md py-2 text-xs tracking-[0.15em] font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      (playerState?.ce || 0) >= 25
                        ? 'border-amber-500 bg-amber-950/25 text-amber-300 hover:border-amber-300 hover:bg-amber-950/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'border-[#112019] text-[#2c3e31] cursor-not-allowed opacity-40'
                    }`}
                  >
                    <span>⛩️ EXPAND BARRIER REALM: {
                      player.customTechDef?.hasDomain
                        ? (player.customTechDef.domainName?.toUpperCase() || 'DOMAIN EXPANSION')
                        : (player.techKey === 'limitless' ? 'INFINITE VOID' : player.techKey === 'ten_shad' ? 'CHIMERA SHADOW GARDEN' : 'MALEVOLENT SHRINE')
                    } (25 CE)</span>
                  </button>
                </div>
              )}
            </div>
          ) : showSpeechBubbleSelection ? (
            <div className="space-y-4 bg-black/80 p-4 border border-[#00ff9c]/30 rounded-md">
              <div className="flex justify-between items-center border-b border-[#00ff9c]/20 pb-2 w-full animate-pulse">
                <span className="text-xs text-[#00ff9c] font-black uppercase tracking-widest">🗣️ SELECT SPEECH WORD MODULE</span>
                <button
                  type="button"
                  onClick={() => {
                    Snd.ui();
                    setShowSpeechBubbleSelection(false);
                    setLocked(false);
                  }}
                  className="text-[9px] text-pink-400 font-extrabold hover:underline uppercase tracking-wider bg-black/80 px-2 py-0.5 border border-pink-950/50 cursor-pointer"
                >
                  ✕ CANCEL SPEECH
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 animate-fadeIn">
                {[
                  { word: "DON'T MOVE!", desc: "Stuns the opponent rigid for 3 full turns.", dmg: 35, cost: 16, self: 10, color: "border-yellow-600/50 hover:border-yellow-400 text-yellow-300 bg-yellow-950/10" },
                  { word: "CRUSH!", desc: "Deals extremely massive mental implosion damage.", dmg: 120, cost: 20, self: 35, color: "border-red-600/50 hover:border-red-400 text-red-300 bg-red-950/10" },
                  { word: "SLEEP!", desc: "Puts the enemy to sleep for 2 turns.", dmg: 10, cost: 14, self: 10, color: "border-sky-600/50 hover:border-sky-400 text-sky-300 bg-sky-950/10" },
                  { word: "BLAST AWAY!", desc: "Blasts target back, inflicting agility and strength debuffs.", dmg: 70, cost: 16, self: 20, color: "border-orange-600/50 hover:border-orange-400 text-orange-300 bg-orange-950/10" },
                ].map((item) => {
                  const canAfford = (playerState?.ce || 0) >= (player.flags.six_eyes_active ? 0 : item.cost);
                  return (
                    <button
                      key={item.word}
                      disabled={!canAfford}
                      onClick={() => handleExecuteCursedSpeech(item.word)}
                      className={`p-3 border rounded-md text-left flex flex-col justify-between h-[120px] transition cursor-pointer hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                        !canAfford 
                          ? 'border-gray-900 bg-neutral-950 text-gray-500 cursor-not-allowed opacity-50' 
                          : item.color
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-black tracking-wider uppercase">"{item.word}"</span>
                        <p className="text-[9px] text-[#86a68f] leading-normal">{item.desc}</p>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] font-mono mt-1 pt-1 border-t border-white/5">
                        <span className="font-bold text-pink-400">⚡ {player.flags.six_eyes_active ? 0 : item.cost} CE</span>
                        <span className="text-red-400 font-semibold">💖 -{item.self} HP Recoil</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : showConstructSelection ? (
            <div className="space-y-4 bg-black/80 p-4 border border-teal-500/30 rounded-md">
              <div className="flex justify-between items-center border-b border-teal-500/20 pb-2 w-full animate-pulse">
                <span className="text-xs text-teal-400 font-black uppercase tracking-widest">🛠️ SELECT CONSTRUCTION MATERIALIZATION</span>
                <button
                  type="button"
                  onClick={() => {
                    Snd.ui();
                    setShowConstructSelection(false);
                    setLocked(false);
                  }}
                  className="text-[9px] text-pink-400 font-extrabold hover:underline uppercase tracking-wider bg-black/80 px-2 py-0.5 border border-pink-950/50 cursor-pointer"
                >
                  ✕ CANCEL MANUFACTURE
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 animate-fadeIn">
                {[
                  { id: "blade" as const, name: "🗡️ Steel Blade", desc: "Forges a high-frequency katana that adds +15 strike damage permanently for this battle.", cost: 14, req: "" },
                  { id: "armor" as const, name: "🛡️ Liquid Metal Armor", desc: "Constructs thick tactical plate skin coatings, granting a solid +65 HP Shield Barrier.", cost: 14, req: "" },
                  { id: "sphere" as const, name: "🪐 PERFECT SPHERE", desc: "Yorozu's pinnacle construct: A mathematical impossibility that strikes for 220 absolute true damage.", cost: 25, req: "Requires MST 15+" },
                ].map((item) => {
                  const masterLevel = player.stats.mst >= 15;
                  const sphereBlocked = item.id === 'sphere' && !masterLevel;
                  const canAfford = (playerState?.ce || 0) >= (player.flags.six_eyes_active ? 0 : item.cost);
                  const isBlocked = sphereBlocked || !canAfford;

                  return (
                    <button
                      key={item.id}
                      disabled={isBlocked}
                      onClick={() => handleExecuteConstruction(item.id)}
                      className={`p-3 border rounded-md text-left flex flex-col justify-between h-[120px] transition cursor-pointer hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                        isBlocked
                          ? 'border-gray-900 bg-neutral-950 text-gray-500 cursor-not-allowed opacity-50'
                          : 'border-teal-900/60 hover:border-teal-400 bg-teal-950/5 hover:bg-teal-900/10 text-teal-100'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-black uppercase tracking-wide">{item.name}</span>
                        <p className="text-[9px] text-neutral-400 leading-normal">{item.desc}</p>
                        {item.id === 'sphere' && (
                          <span className={`text-[8.5px] font-bold ${masterLevel ? 'text-emerald-400 animate-pulse' : 'text-[#ff5555] font-black'}`}>
                            {masterLevel ? '✓ MASTER UNLOCKED!' : '⚠ Mastery 15 Required!'}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] font-mono mt-1 pt-1 border-t border-white/5">
                        <span className="font-bold text-pink-400">⚡ {player.flags.six_eyes_active ? 0 : item.cost} CE</span>
                        <span className="text-teal-400 font-semibold">{item.id === 'sphere' ? 'True Destructive' : 'Tactical Buff'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : showShikiSummonMenu ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-purple-500/30 pb-1 w-full">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">🔮 IN-BATTLE SUMMONING MENU (12 CE)</span>
                <button
                  type="button"
                  onClick={() => {
                    Snd.ui();
                    setShowShikiSummonMenu(false);
                    setLocked(false);
                  }}
                  className="text-[9px] text-[#ff80bf] hover:underline"
                >
                  [Cancel Summon]
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1.5">
                {eligibleShikis.map((sh) => {
                  const isActiveOnField = combatants.some(c => c.id === `shiki_${sh.key}` && !c.isDead);
                  return (
                    <button
                      key={sh.key}
                      disabled={isActiveOnField}
                      onClick={() => spawnedSummonAction(sh.key)}
                      className={`p-2 border text-left rounded-sm flex flex-col justify-between h-[75px] transition cursor-pointer ${
                        isActiveOnField
                          ? 'border-gray-900 bg-black text-gray-600 opacity-40'
                          : 'border-purple-900/50 hover:border-purple-500/80 bg-black text-purple-300 hover:bg-purple-950/10'
                      }`}
                    >
                      <span className="text-[9.5px] font-bold uppercase truncate">{sh.name}</span>
                      <span className="text-[8px] opacity-75 line-clamp-2">{sh.desc}</span>
                      <span className="text-[8px] font-mono text-[#a4c8aa]">Agi: {sh.agi}</span>
                    </button>
                  );
                })}
                {eligibleShikis.length === 0 && (
                  <div className="col-span-5 text-center text-xs py-4 text-red-400 font-mono italic">
                    YOU HAVE NO TAMED SHIKIGAMIS YET! Defeat them under the Wild Hunt mission first!
                  </div>
                )}
              </div>
            </div>
          ) : showBoogieMenu ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-indigo-500/30 pb-1 w-full">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">👏 BOOGIE WOOGIE TARGET SELECTION</span>
                <button
                  type="button"
                  onClick={() => {
                    Snd.ui();
                    setShowBoogieMenu(false);
                    setLocked(false);
                  }}
                  className="text-[9px] text-indigo-300 hover:underline cursor-pointer"
                >
                  [Cancel Variant]
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5">
                <button
                  onClick={() => handleBoogieWoogieAction('swap-enemy')}
                  className="p-3 border border-indigo-900/50 hover:border-indigo-400 bg-black text-indigo-300 hover:bg-indigo-950/20 text-left rounded-sm transition cursor-pointer flex flex-col justify-center"
                >
                  <span className="text-[10px] font-bold uppercase">Swap with Enemy</span>
                  <span className="text-[9px] text-indigo-400/70">Swap your coordinate with target enemy. Disorients target.</span>
                </button>

                <button
                  onClick={() => handleBoogieWoogieAction('swap-others')}
                  className="p-3 border border-indigo-900/50 hover:border-indigo-400 bg-black text-indigo-300 hover:bg-indigo-950/20 text-left rounded-sm transition cursor-pointer flex flex-col justify-center"
                >
                  <span className="text-[10px] font-bold uppercase">Swap Ally & Enemy</span>
                  <span className="text-[9px] text-indigo-400/70">Swap random ally with enemy. Disorients both!</span>
                </button>
              </div>
            </div>
          ) : activeStateObj.type === 'shikigami' ? (
            /* Shikigami commands panel */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <button
                disabled={locked}
                onClick={handleShikiBasicStrike}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-20 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>⚔️ {activeStateObj.shikiKey === 'mahoraga' ? 'Sword of Extermination' : 'Combat Strike'}</span>
              </button>

              <button
                disabled={locked}
                onClick={handleShikiSpecialMove}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-20 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>◈ Execute Special Move</span>
              </button>

              <button
                disabled={locked}
                onClick={handleShikiDismiss}
                className="py-3 px-4 border border-red-950 bg-black hover:border-red-500 hover:text-red-400 hover:bg-red-500/5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-20 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>↩ Recoil Summon (Retract)</span>
              </button>
            </div>
          ) : (
            /* Action Options grid */
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
              <button
                disabled={locked || activeStateObj.type !== 'player' || radarMode === 'move'}
                onClick={() => setRadarMode('move')}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👟 Move Grids</span>
              </button>

              <button
                disabled={locked || activeStateObj.type !== 'player'}
                onClick={handleChargeCE}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/5 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🌀 Charge CE</span>
              </button>

              <button
                disabled={locked || activeStateObj.type !== 'player' || radarMode === 'move'}
                onClick={handleBasicStrike}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-[#00ff9c] hover:text-[#00ff9c] hover:bg-[#00ff9c]/5 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚔ Attack</span>
              </button>

              <button
                disabled={locked || activeStateObj.type !== 'player' || radarMode === 'move' || (playerState && playerState.ce < 8 && player.restriction !== 'toji')}
                onClick={handleCursedTechnique}
                className={`py-3 px-4 border text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer ${
                  playerState && playerState.ce >= 8
                    ? 'border-purple-600/60 bg-purple-950/5 text-purple-400 hover:border-purple-400 hover:text-white'
                    : player.restriction === 'toji'
                    ? 'border-amber-600 bg-amber-950/5 text-amber-500 hover:border-amber-400 hover:text-white'
                    : 'border-[#112019] text-[#2e4a34]'
                }`}
              >
                <span>◈ Innate Art</span>
              </button>

              <button
                disabled={locked || activeStateObj.type !== 'player'}
                onClick={handleBlackFlash}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-amber-500 hover:text-white hover:bg-amber-500/5 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Black Flash (25%)</span>
              </button>

              <button
                disabled={locked || activeStateObj.type !== 'player'}
                onClick={handleFlee}
                className="py-3 px-4 border border-[#112019] bg-black hover:border-gray-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                ↩ Escape
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
