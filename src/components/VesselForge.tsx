/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Snd } from '../utils/sound';
import { ERAS, TYPES, CLANS, TECHNIQUES, UPBRINGINGS, CE_EXPOSURES } from '../data/gameData';
import { GameState, StatSet, StatName, CustomTechMove } from '../types';
import { CursedSynthesizer } from './CursedSynthesizer';

interface VesselForgeProps {
  onBack: () => void;
  onAwaken: (characterData: Partial<GameState> & { stats: StatSet }) => void;
  parentInheritance?: GameState | null;
}

export default function VesselForge({ onBack, onAwaken, parentInheritance }: VesselForgeProps) {
  // Configured inputs
  const [selectedEra, setSelectedEra] = useState('modern');
  const [firstName, setFirstName] = useState('Kenji');
  const [idealType, setIdealType] = useState('nocare');

  const [useCustomClan, setUseCustomClan] = useState(false);
  const [selectedClan, setSelectedClan] = useState('none');
  const [customClanName, setCustomClanName] = useState('');
  const [customClanTrait, setCustomClanTrait] = useState('warrior');
  // Extended custom clan traits
  const [customClanRestrictionChance, setCustomClanRestrictionChance] = useState<number>(35); // 10%, 35%, 60%, 100%
  const [customClanRestrictionType, setCustomClanRestrictionType] = useState<'toji' | 'mechamaru'>('toji');

  const [useCustomTech, setUseCustomTech] = useState(false);
  const [selectedTech, setSelectedTech] = useState('random');
  const [customTechName, setCustomTechName] = useState('');
  const [customTechArch, setCustomTechArch] = useState('destruction');
  // Extended custom technique variables
  const [customTechDmgMult, setCustomTechDmgMult] = useState<number>(1.5); // 1.5, 2.0, 2.5, 3.0
  const [customTechSecondary, setCustomTechSecondary] = useState<string>('none'); // none, stun, frost, burn, barrier, heal
  const [customTechHasDomain, setCustomTechHasDomain] = useState<boolean>(false);
  const [customTechDomainName, setCustomTechDomainName] = useState<string>('');
  const [customTechDomainSureHit, setCustomTechDomainSureHit] = useState<string>('stun'); // stun, bypass, siphon, chaos
  const [customTechCeCost, setCustomTechCeCost] = useState<number>(12); // 8, 12, 18
  const [customTechVowBinding, setCustomTechVowBinding] = useState<string>('none'); // none, life_for_power, divergent, focus_charge, ce_recycle
  const [customTechVisualTheme, setCustomTechVisualTheme] = useState<string>('spatial'); // spatial, blood_occult, dark_shadow, cosmic_void, black_furnace, electric_dis

  // NEW: ADVANCED BUILDER STATE ATTRIBUTES
  const [customTechScaleStat, setCustomTechScaleStat] = useState<string>('mst');
  const [customTechMinDmg, setCustomTechMinDmg] = useState<number>(10);
  const [customTechMaxDmg, setCustomTechMaxDmg] = useState<number>(25);
  const [customTechCooldown, setCustomTechCooldown] = useState<number>(0);

  // ADVANCED MODULAR TECHNIQUE & DOMAIN STATE
  const [customTechMoves, setCustomTechMoves] = useState<CustomTechMove[]>([
    {
      id: 'move_1',
      name: 'Dynamic Kinetic Strike',
      type: 'strike',
      ceCost: 10,
      cooldown: 0,
      dmgMult: 1.8,
      scaleStat: 'mst',
      minDmg: 15,
      maxDmg: 30,
      secondary: 'none'
    }
  ]);

  const [domainHandSign, setDomainHandSign] = useState<string>('Ganesha Clasp');
  const [domainEnvironment, setDomainEnvironment] = useState<string>('Submerged Abyssal Temple');
  const [domainBarrierRule, setDomainBarrierRule] = useState<string>('standard');
  const [domainSureHitSpell, setDomainSureHitSpell] = useState<string>('stun');
  const [domainVisualAura, setDomainVisualAura] = useState<string>('purple_abyss');

  // Hereditary Rogue-Lite Biological Talents
  const [geneticBonusStats, setGeneticBonusStats] = useState<Record<string, number>>({
    str: 0, agi: 0, end: 0, ce: 0, mst: 0, lck: 0, int: 0, cha: 0
  });

  // Auto-populate from parents if playing as biological offspring
  useEffect(() => {
    if (parentInheritance) {
      if (parentInheritance.clanKey) {
        if (parentInheritance.clanKey === 'custom') {
          setUseCustomClan(true);
          setCustomClanName(parentInheritance.lastName || '');
        } else {
          setUseCustomClan(false);
          setSelectedClan(parentInheritance.clanKey);
        }
      } else if (parentInheritance.lastName) {
        setCustomClanName(parentInheritance.lastName);
        setUseCustomClan(true);
      }

      if (parentInheritance.stats) {
        const par = parentInheritance.stats;
        setGeneticBonusStats({
          str: Math.min(5, Math.floor((par.str || 10) * 0.15)),
          agi: Math.min(5, Math.floor((par.agi || 10) * 0.15)),
          end: Math.min(5, Math.floor((par.end || 10) * 0.15)),
          ce: Math.min(5, Math.floor((par.ce || 10) * 0.15)),
          mst: Math.min(5, Math.floor((par.mst || 10) * 0.15)),
          lck: Math.min(5, Math.floor((par.lck || 10) * 0.15)),
          int: Math.min(5, Math.floor((par.int || 10) * 0.15)),
          cha: Math.min(5, Math.floor((par.cha || 10) * 0.15)),
        });
      }

      if (parentInheritance.customTechDef) {
        setUseCustomTech(true);
        const def = parentInheritance.customTechDef;
        setCustomTechName(def.name);
        setCustomTechArch(def.arch);
        setCustomTechDmgMult(def.dmgMult);
        setCustomTechSecondary(def.secondary);
        setCustomTechHasDomain(def.hasDomain);
        setCustomTechDomainName(def.domainName);
        setCustomTechDomainSureHit(def.domainSureHit);
        setCustomTechCeCost(def.ceCost || 12);
        setCustomTechVowBinding(def.vowBinding || 'none');
        setCustomTechVisualTheme(def.visualTheme || 'spatial');
        if (def.scaleStat) setCustomTechScaleStat(def.scaleStat);
        if (def.minDmg) setCustomTechMinDmg(def.minDmg);
        if (def.maxDmg) setCustomTechMaxDmg(def.maxDmg);
        if (def.cooldown) setCustomTechCooldown(def.cooldown);
        if (def.moves) setCustomTechMoves(def.moves);
        if (def.domainCustom) {
          setDomainHandSign(def.domainCustom.handSign);
          setDomainEnvironment(def.domainCustom.environment);
          setDomainBarrierRule(def.domainCustom.barrierRule);
          setDomainSureHitSpell(def.domainCustom.sureHitSpell);
          setDomainVisualAura(def.domainCustom.visualAura);
        }
      } else if (parentInheritance.techKey) {
        setUseCustomTech(false);
        setSelectedTech(parentInheritance.techKey);
      }
      Snd.forge();
    }
  }, [parentInheritance]);

  const [upbringing, setUpbringing] = useState('normal');
  const [ceExp, setCeExp] = useState('mod');

  // Heavenly Restriction Selector (General)
  const [restriction, setRestriction] = useState<'none' | 'toji' | 'mechamaru'>('none');

  // Stats
  const [baseStats, setBaseStats] = useState<StatSet>({
    str: 1,
    agi: 1,
    int: 1,
    cha: 1,
    mst: 1,
    end: 1,
    lck: 1,
    ce: 1
  });

  // God Mode (Root Access via Konami Code)
  const [godMode, setGodMode] = useState(false);

  // Konami detector state
  const [konamiIdx, setKonamiIdx] = useState(0);
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Skip if typing in text inputs
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === konamiSequence[konamiIdx]) {
        const nextIdx = konamiIdx + 1;
        setKonamiIdx(nextIdx);
        if (nextIdx === konamiSequence.length) {
          setGodMode(true);
          setKonamiIdx(0);
          Snd.forge();
          alert('⚠ ROOT ACCESS GRANTED: VESSEL ALLOCATION LIMITS COMPROMISED (∞ POINTS)');
        }
      } else {
        setKonamiIdx(0);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [konamiIdx]);

  // Points calculation
  const totalAllocation: number = godMode ? 999999 : 150;

  const getPointsSpent = () => {
    let pts = 0;
    // Custom Clan cost
    if (useCustomClan) {
      pts += 15; // base custom clan cost
      if (customClanTrait === 'restricted') {
        if (customClanRestrictionChance === 10) pts += 5;
        else if (customClanRestrictionChance === 35) pts += 12;
        else if (customClanRestrictionChance === 60) pts += 20;
        else if (customClanRestrictionChance === 100) pts += 35;
      } else {
        pts += 10; // other custom traits cost
      }
    } else {
      const clanDef = CLANS.find(c => c.key === selectedClan);
      pts += clanDef?.pts || 0;
    }
    // Custom Tech cost
    if (useCustomTech) {
      pts += 10; // base activation cost for custom innate technique

      // Domain costs
      if (customTechHasDomain) {
        pts += 15; // base domain activation
        if (domainBarrierRule === 'open_barrier') pts += 12;
        else if (domainBarrierRule === 'time_locked') pts += 4;
        else if (domainBarrierRule === 'deadly_court') pts += 10;
        else if (domainBarrierRule === 'sumo_ring') pts += 6;

        if (domainSureHitSpell === 'stun') pts += 15;
        else if (domainSureHitSpell === 'bypass') pts += 15;
        else if (domainSureHitSpell === 'siphon') pts += 15;
        else if (domainSureHitSpell === 'chaos') pts += 15;
        else if (domainSureHitSpell === 'burn_dot') pts += 10;
        else if (domainSureHitSpell === 'tech_seal') pts += 12;
        else if (domainSureHitSpell === 'physical_duel') pts += 10;
      }

      // Loop moves and add individual costs
      customTechMoves.forEach(move => {
        pts += 4; // base move cost
        
        // Refund/Charge based on cost
        if (move.ceCost <= 5) pts -= 3; // very low cost refund
        else if (move.ceCost >= 15) pts += 5; // overcharged move
        
        if (move.cooldown === 1) pts -= 2;
        else if (move.cooldown >= 2) pts -= 4;

        if (move.type === 'strike') {
          const dmgScale = move.dmgMult || 1.5;
          if (dmgScale === 2.0) pts += 4;
          else if (dmgScale === 2.5) pts += 8;
          else if (dmgScale === 3.0) pts += 12;

          const min = move.minDmg !== undefined ? move.minDmg : 10;
          const max = move.maxDmg !== undefined ? move.maxDmg : 25;
          const avgDmg = (min + max) / 2;
          const deltaAvg = avgDmg - 18;
          if (deltaAvg > 0) {
            pts += Math.floor(deltaAvg * 0.6);
          } else if (deltaAvg < 0) {
            pts += Math.floor(deltaAvg * 0.3); // refund
          }

          if (move.scaleStat && move.scaleStat !== 'mst') pts += 2;

          if (move.secondary === 'stun') pts += 8;
          else if (move.secondary === 'frost') pts += 4;
          else if (move.secondary === 'burn') pts += 4;
          else if (move.secondary === 'barrier') pts += 6;
          else if (move.secondary === 'heal') pts += 8;
        } else if (move.type === 'summon') {
          const hp = move.summonHp || 50;
          if (hp > 50) {
            pts += Math.floor((hp - 50) / 10);
          }
          // Stats
          const atk = move.summonAtk || 10;
          const mst = move.summonMst || 10;
          const agi = move.summonAgi || 10;
          const statsAbove10 = Math.max(0, atk - 10) + Math.max(0, mst - 10) + Math.max(0, agi - 10);
          pts += Math.floor(statsAbove10 * 0.8);

          const pass = move.summonPassive || 'none';
          if (pass === 'totality') pts += 5;
          else if (pass === 'paralysis') pts += 6;
          else if (pass === 'shield_intercept') pts += 6;
          else if (pass === 'adaptive_gauge') pts += 8;
        } else if (move.type === 'speed_frame') {
          const fps = move.fpsLimit || 24;
          if (fps > 24) pts += 2;
          const action = move.speedAction || 'stack_agi';
          if (action === 'stack_agi') pts += 6;
          else if (action === 'freeze_frame') pts += 10;
          else if (action === 'loop_dodge') pts += 8;
        } else if (move.type === 'curse_law') {
          const lType = move.lawType || 'kinetic_store';
          if (lType === 'cost_reduction') pts += 5;
          else if (lType === 'double_snap') pts += 6;
          else if (lType === 'kinetic_store') pts += 5;
          else if (lType === 'counter_charge') pts += 6;
        }
      });
    } else {
      const techDef = TECHNIQUES.find(t => t.key === selectedTech);
      pts += techDef?.pts || 0;
    }
    // Stats Cost
    const keys: (keyof StatSet)[] = ['str', 'agi', 'int', 'cha', 'mst', 'end', 'lck', 'ce'];
    keys.forEach(k => {
      pts += (baseStats[k] - 1);
    });

    return pts;
  };

  const pointsRemaining = totalAllocation - getPointsSpent();

  // Combine upbringing, clan, and exposure effects to get final attributes
  const getFinalStats = (): StatSet => {
    const f: StatSet = { ...baseStats };

    // Add biological genetic talent premiums inherited from parent lineage
    Object.entries(geneticBonusStats).forEach(([k, v]) => {
      const key = k as StatName;
      f[key] = f[key] + (v as number);
    });

    // Upbringing bonuses
    const upbDef = UPBRINGINGS.find(u => u.key === upbringing);
    if (upbDef) {
      Object.entries(upbDef.bon || {}).forEach(([k, v]) => {
        const key = k as StatName;
        f[key] = Math.max(1, Math.min(20, f[key] + (v || 0)));
      });
      Object.entries(upbDef.pen || {}).forEach(([k, v]) => {
        const key = k as StatName;
        f[key] = Math.max(1, Math.min(20, f[key] + (v || 0)));
      });
    }

    // Clan bonuses
    if (useCustomClan) {
      if (customClanTrait === 'restricted') {
        if (customClanRestrictionType === 'toji') {
          f.ce = 0;
          f.str = Math.min(40, f.str + 15);
          f.agi = Math.min(40, f.agi + 15);
          f.end = Math.min(40, f.end + 15);
        } else if (customClanRestrictionType === 'mechamaru') {
          f.end = 1;
          f.ce = Math.min(50, f.ce + 25);
          f.mst = Math.min(40, f.mst + 15);
        }
      } else {
        const traits: Record<string, Partial<StatSet>> = {
          warrior: { str: 3, end: 2 },
          mystic: { ce: 3, mst: 2 },
          shadow: { agi: 3, int: 2 },
          noble: { cha: 3, int: 2 },
          cursed: { ce: 4, mst: 1, lck: -1 }
        };
        const tb = traits[customClanTrait] || {};
        Object.entries(tb).forEach(([k, v]) => {
          const key = k as StatName;
          f[key] = Math.max(1, Math.min(20, f[key] + (v || 0)));
        });
      }
    } else {
      const clanDef = CLANS.find(c => c.key === selectedClan);
      if (clanDef?.bon) {
        Object.entries(clanDef.bon).forEach(([k, v]) => {
          const key = k as StatName;
          f[key] = Math.max(1, Math.min(20, f[key] + (v || 0)));
        });
      }
    }

    // Exposure parameters
    const ceDef = CE_EXPOSURES.find(c => c.key === ceExp);
    if (ceDef) {
      if (useCustomClan && customClanTrait === 'restricted' && customClanRestrictionType === 'toji') {
        f.ce = 0;
      } else {
        f.ce = Math.max(1, Math.min(20, f.ce + ceDef.ceB));
      }
      f.mst = Math.max(1, Math.min(20, f.mst + ceDef.mstB));
    }

    // Heavenly Restriction adjustments (General preset)
    if (!useCustomClan) {
      if (restriction === 'toji') {
        f.ce = 0;
        f.str = Math.min(40, f.str + 15);
        f.agi = Math.min(40, f.agi + 15);
        f.end = Math.min(40, f.end + 15);
      } else if (restriction === 'mechamaru') {
        f.end = 1;
        f.ce = Math.min(50, f.ce + 25);
        f.mst = Math.min(40, f.mst + 15);
      }
    }

    return f;
  };

  const incrementStat = (key: StatName) => {
    const maxVal = godMode ? 20 : 15;
    if (baseStats[key] >= maxVal) return;
    if (pointsRemaining <= 0 && !godMode) return;

    Snd.ui();
    setBaseStats(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }));
  };

  const decrementStat = (key: StatName) => {
    if (baseStats[key] <= 1) return;
    Snd.ui();
    setBaseStats(prev => ({
      ...prev,
      [key]: prev[key] - 1
    }));
  };

  const finalStats = getFinalStats();

  const validate = () => {
    if (pointsRemaining < 0 && !godMode) return 'INSUFFICIENT ALLOCATION POINTS';
    if (firstName.trim().length < 2) return 'NAME TOO SHORT (MIN 2 CHARS)';
    if (useCustomClan && customClanName.trim().length < 2) return 'CUSTOM CLAN NAME REQUIRED';
    if (useCustomTech && customTechName.trim().length < 2) return 'CUSTOM TECHNIQUE NAME REQUIRED';
    return null;
  };

  const validationError = validate();

  const handleAwaken = () => {
    if (validationError) return;

    Snd.forge();

    let clanName = '';
    let lastName = '';
    let clanKey = selectedClan;

    let actualRestriction: 'none' | 'toji' | 'mechamaru' = restriction;

    if (useCustomClan) {
      lastName = customClanName.trim();
      clanKey = 'custom';
      
      if (customClanTrait === 'restricted') {
        const roll = Math.random() * 100;
        if (roll < customClanRestrictionChance || godMode) {
          actualRestriction = customClanRestrictionType;
          clanName = lastName + ' [Heavenly Shackled]';
          alert(`🧬 BIOLOGICAL COUPLING SUCCESS!\nYou have successfully inherited the legendary ${customClanRestrictionType === 'toji' ? 'TOJI-type' : 'MECHAMARU-type'} Heavenly Restriction! Standard limits shattered.`);
        } else {
          actualRestriction = 'none';
          clanName = lastName + ' [Standard Bloodline]';
          alert(`🧬 COUPLING MISFIT!\nYou did not inherit the Heavenly Restriction trait (${customClanRestrictionChance}% chance failed). You are born in the ${lastName} family with a standard sorcerer physiology and traits!`);
        }
      } else {
        clanName = lastName + ' Clan';
      }
    } else {
      const clanDef = CLANS.find(c => c.key === selectedClan);
      lastName = clanDef?.ln || '';
      clanName = clanDef?.name || 'No Clan';
    }

    let techName = '';
    let techKey = selectedTech;

    if (actualRestriction === 'toji') {
      techKey = 'toji_restriction';
      techName = 'Heavenly Restriction (Physical God)';
    } else if (actualRestriction === 'mechamaru') {
      techKey = 'mechamaru_restriction';
      techName = 'Heavenly Restriction (Puppet Proxy)';
    } else if (useCustomTech) {
      techName = customTechName.trim();
      techKey = 'custom';
    } else {
      const techDef = TECHNIQUES.find(t => t.key === selectedTech);
      techName = techDef?.name || 'Unknown Technique';
    }

    const eraDef = ERAS.find(e => e.key === selectedEra) || null;

    // Compile custom tech definition if used
    const customTechDef = useCustomTech ? {
      name: customTechName.trim(),
      arch: customTechArch,
      dmgMult: customTechDmgMult,
      secondary: customTechSecondary,
      hasDomain: customTechHasDomain,
      domainName: customTechDomainName.trim() || 'Domain Expansion: Soul Core',
      domainSureHit: customTechDomainSureHit,
      ceCost: customTechCeCost,
      vowBinding: customTechVowBinding,
      visualTheme: customTechVisualTheme,
      scaleStat: customTechScaleStat,
      minDmg: customTechMinDmg,
      maxDmg: customTechMaxDmg,
      cooldown: customTechCooldown,
      moves: customTechMoves,
      domainCustom: customTechHasDomain ? {
        name: customTechDomainName.trim() || 'Domain Expansion: Soul Core',
        handSign: domainHandSign,
        environment: domainEnvironment,
        barrierRule: domainBarrierRule,
        sureHitSpell: domainSureHitSpell,
        visualAura: domainVisualAura
      } : undefined
    } : undefined;

    // Recalculating stats based on the actual birth roll
    const actualStats = { ...finalStats };
    if (useCustomClan && customClanTrait === 'restricted') {
      // Re-evaluate stat buffs depending on actualRestriction
      if (actualRestriction === 'none') {
        // Did not roll successfully - grant standard "warrior" as fallback so points aren't fully lost
        actualStats.str = Math.min(20, actualStats.str + 1);
        actualStats.end = Math.min(20, actualStats.end + 1);
      } else if (actualRestriction === 'toji') {
        actualStats.ce = 0;
        actualStats.str = Math.min(40, actualStats.str + 15);
        actualStats.agi = Math.min(40, actualStats.agi + 15);
        actualStats.end = Math.min(40, actualStats.end + 15);
      } else if (actualRestriction === 'mechamaru') {
        actualStats.end = 1;
        actualStats.ce = Math.min(50, actualStats.ce + 25);
        actualStats.mst = Math.min(40, actualStats.mst + 15);
      }
    }

    onAwaken({
      name: firstName.trim(),
      lastName: lastName,
      fullName: [firstName.trim(), lastName].filter(Boolean).join(' '),
      era: selectedEra,
      eraDef: eraDef,
      birthYear: eraDef?.y0 || 2018,
      birthMonth: 1,
      clanKey: clanKey,
      clanName: clanName,
      techKey: techKey,
      techName: techName,
      customTechDef: customTechDef,
      upbringing: upbringing,
      ceExp: ceExp,
      girlType: idealType,
      godMode: godMode,
      restriction: actualRestriction,
      stats: actualStats
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020504] text-[#a4c8aa] font-mono select-none">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 bg-[#040908] border-b border-[#112019]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              Snd.ui();
              onBack();
            }}
            className="text-xs text-[#628a6a] border border-[#2e4a34] px-2 py-1 hover:border-[#00ff9c] hover:text-[#00ff9c] cursor-pointer"
          >
            ◀ MENU
          </button>
          <span className="text-xl font-bold tracking-wider text-[#00ff9c] font-vt uppercase">
            // Vessel Forge //
          </span>
          {godMode && (
            <span className="text-[9px] font-bold text-red-500 border border-red-500 px-2 py-0.5 tracking-widest animate-pulse">
              ⚠ ROOT ACCESS
            </span>
          )}
        </div>
        <div className="text-xs px-3 py-1 border border-[#1d3828] bg-black">
          ALLOCATION:{' '}
          <span className={`font-bold ${pointsRemaining < 0 ? 'text-red-500' : 'text-[#00ff9c]'}`}>
            {godMode ? '∞' : pointsRemaining} PTS
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left scrollable form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* S1: ERA */}
          <div className="border border-[#112019] bg-[#040908]">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">①</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Era of Birth</h3>
                <p className="text-[9px] text-[#2e4a34]">Choose when your soul anchors into history</p>
              </div>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ERAS.map(e => (
                <div
                  key={e.key}
                  onClick={() => {
                    Snd.sel();
                    setSelectedEra(e.key);
                  }}
                  className={`border p-2 cursor-pointer transition-all ${
                    selectedEra === e.key
                      ? 'border-[#00ff9c] bg-[rgba(0,255,156,0.04)] text-white'
                      : 'border-[#112019] bg-[#070e0b] hover:border-[#1d3828] text-[#628a6a]'
                  }`}
                >
                  <div className="text-xs font-bold text-[#00ff9c]">{e.name}</div>
                  <div className="text-[8px] text-[#2e4a34] tracking-wider mb-1">{e.years}</div>
                  <div className="text-[9px] leading-relaxed opacity-85">{e.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* S2: IDENTITY */}
          <div className="border border-[#112019] bg-[#040908]">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">②</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Identity Profile</h3>
                <p className="text-[9px] text-[#2e4a34]">Provide name structures and internal preferences</p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-[#2e4a34] tracking-widest uppercase mb-1">Birth First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-[#070e0b] border border-[#112019] text-[#a4c8aa] px-3 py-2 text-xs focus:outline-none focus:border-[#00c47a]"
                  placeholder="Enter given name..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2">
                  Ideal Partner Type (Matters when meeting Todo Aoi!)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <div
                      key={t.key}
                      onClick={() => {
                        Snd.sel();
                        setIdealType(t.key);
                      }}
                      className={`border p-2 cursor-pointer transition-all text-center ${
                        idealType === t.key
                          ? 'border-[#ff80bf] bg-[rgba(255,128,191,0.06)] text-white'
                          : 'border-[#112019] bg-[#070e0b] text-[#628a6a]'
                      }`}
                    >
                      <div className="text-xl mb-1">{t.emoji}</div>
                      <div className="text-[10px] font-bold text-[#ff80bf]">{t.label}</div>
                      <div className="text-[8px] text-[#2e4a34] tracking-wider leading-relaxed mt-1">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* S3: BLOODLINE CLAN */}
          <div className="border border-[#112019] bg-[#040908]">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">③</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Lineage & Surname</h3>
                <p className="text-[9px] text-[#2e4a34]">Connect your bloodline with core houses (Affects baseline stats)</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {parentInheritance && (
                <div className="p-3 border border-amber-500/40 bg-amber-950/10 text-amber-300 rounded-sm mb-3 text-[10px] space-y-1.5 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                  <div className="font-extrabold flex items-center gap-1 text-[11px] text-amber-400 tracking-wider">
                    <span>🧬 BIOLOGICAL SOUL INTEGRATION ACTIVE</span>
                  </div>
                  <div>
                    Your vessel continues the direct blood lineage of <span className="font-bold text-[#00ff9c]">{parentInheritance.fullName}</span>, descendant of the <span className="text-purple-400 font-bold">{parentInheritance.lastName}</span> bloodlines.
                  </div>
                  <div className="text-[9px] text-amber-200/80 leading-relaxed">
                    🧬 <span className="text-[#00ff9c] font-bold">GENETIC ADVANTAGE:</span> Your starting surname is biologically locked to <span className="font-bold underline text-white">{parentInheritance.lastName}</span>. You carry their fully developed <span className="text-purple-300 font-bold">{parentInheritance.techName}</span> innate technique signature in your DNA!
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => {
                    Snd.ui();
                    setUseCustomClan(false);
                  }}
                  type="button"
                  className={`flex-1 py-2 text-xs border ${
                    !useCustomClan ? 'border-[#00c47a] text-[#00ff9c] bg-[rgba(0,255,156,0.04)] font-bold' : 'border-[#112019] text-[#2e4a34]'
                  } cursor-pointer`}
                >
                  KNOWN CLANS
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    setUseCustomClan(true);
                  }}
                  type="button"
                  className={`flex-1 py-2 text-xs border ${
                    useCustomClan ? 'border-[#00c47a] text-[#00ff9c] bg-[rgba(0,255,156,0.04)] font-bold' : 'border-[#112019] text-[#2e4a34]'
                  } cursor-pointer`}
                >
                  CREATE CUSTOM CLAN
                </button>
              </div>

              {!useCustomClan ? (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {CLANS.map(c => (
                    <div
                      key={c.key}
                      onClick={() => {
                        Snd.sel();
                        setSelectedClan(c.key);
                      }}
                      className={`flex justify-between items-center p-2 border cursor-pointer ${
                        selectedClan === c.key
                          ? 'border-[#00ff9c] bg-[rgba(0,255,156,0.04)] text-white'
                          : 'border-[#112019] bg-[#070e0b] text-[#628a6a]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{c.name} {c.ln ? `(${c.ln})` : ''}</div>
                        <div className="text-[9px] text-[#2e4a34] mt-0.5">{c.desc}</div>
                      </div>
                      <div className="text-[9px] border border-[#112019] px-2 py-0.5 select-none font-semibold">
                        {c.pts > 0 ? `-${c.pts} PTS` : 'FREE'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-[#112019] p-3 bg-[#070e0b] space-y-3">
                  <div className="text-[10px] text-[#00ff9c] font-bold tracking-wider uppercase border-b border-[#112019] pb-1 select-none">
                    Custom Genotype Synth (Base: -15 PTS)
                  </div>
                  <div>
                    <label className="block text-[9px] text-[#2e4a34] uppercase mb-1">Custom Surname</label>
                    <input
                      type="text"
                      value={customClanName}
                      onChange={e => setCustomClanName(e.target.value)}
                      className="w-full bg-black border border-[#112019] text-white px-2 py-1 text-xs focus:outline-none focus:border-[#00ff9c]"
                      placeholder="e.g. Furuya"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[#2e4a34] uppercase mb-1">Inherited Core Trait</label>
                    <select
                      value={customClanTrait}
                      onChange={e => {
                        Snd.sel();
                        setCustomClanTrait(e.target.value);
                      }}
                      className="w-full bg-black border border-[#112019] text-xs py-1 px-2 focus:outline-none text-[#a4c8aa]"
                    >
                      <option value="warrior">Warrior Core (+3 STR, +2 END - Heavy Physicals) [-10 PTS]</option>
                      <option value="mystic">Occult Mystic (+3 CE, +2 MST - Cursed Purity) [-10 PTS]</option>
                      <option value="shadow">Shadow Lurker (+3 AGI, +2 INT - High Agility) [-10 PTS]</option>
                      <option value="noble">Aristocrat Ruler (+3 CHA, +2 INT - Charisma Peak) [-10 PTS]</option>
                      <option value="cursed">Womb Stain (+4 CE, +1 MST, -1 LCK - Unpredictable Volts) [-10 PTS]</option>
                      <option value="restricted">Heavenly Restriction (Genetic Mutation Trait) [PROBABILITY COST]</option>
                    </select>
                  </div>

                  {customClanTrait === 'restricted' && (
                    <div className="border border-amber-900/30 p-2.5 bg-black/40 space-y-3.5 mt-2 rounded-sm">
                      <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">// Mutant Physiology Profile //</div>
                      
                      <div>
                        <label className="block text-[9px] text-[#a4c8aa] uppercase mb-1 font-bold">Restriction Type</label>
                        <select
                          value={customClanRestrictionType}
                          onChange={e => {
                            Snd.sel();
                            setCustomClanRestrictionType(e.target.value as 'toji' | 'mechamaru');
                          }}
                          className="w-full bg-black border border-[#102319] text-xs py-1 px-2 focus:outline-none text-amber-400"
                        >
                          <option value="toji">Toji-style (0 CE, Extreme Physical Power / Holds Fabled Spear)</option>
                          <option value="mechamaru">Mechamaru-style (1 END, Massive Cursed Reserves & Remote Puppets)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-[#a4c8aa] uppercase mb-1.5 font-bold">Bloodline Manifestation Chance (Probability)</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[10, 35, 60, 100].map(chance => (
                            <button
                              key={chance}
                              type="button"
                              onClick={() => {
                                Snd.ui();
                                setCustomClanRestrictionChance(chance);
                              }}
                              className={`py-1.5 text-[10px] font-bold border rounded-sm transition-all ${
                                customClanRestrictionChance === chance
                                  ? 'border-amber-500 bg-amber-950/20 text-amber-300'
                                  : 'border-[#112019] bg-black text-[#2e4a34] hover:border-[#1d3828] hover:text-[#628a6a]'
                              }`}
                            >
                              {chance}%
                              <div className="text-[8px] font-medium opacity-75">
                                {chance === 10 ? '+5' : chance === 35 ? '+12' : chance === 60 ? '+20' : '+35'} pts
                              </div>
                            </button>
                          ))}
                        </div>
                        <p className="text-[8px] text-[#4d7155] leading-normal mt-1.5">
                          Heritage check executes upon Awakening. If failed, you are born in the family as a standard sorcerer (Warrior Core fallback).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* S4: INNATE TECHNIQUE */}
          <div className="border border-[#112019] bg-[#040908]">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">④</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Innate Technique</h3>
                <p className="text-[9px] text-[#2e4a34]">Your birth-right cursed art – manifests during early childhood years</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => {
                    Snd.ui();
                    setUseCustomTech(false);
                  }}
                  type="button"
                  className={`flex-1 py-2 text-xs border ${
                    !useCustomTech ? 'border-[#00c47a] text-[#00ff9c] bg-[rgba(0,255,156,0.04)] font-bold' : 'border-[#112019] text-[#2e4a34]'
                  } cursor-pointer`}
                >
                  KNOWN ARTS
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    setUseCustomTech(true);
                  }}
                  type="button"
                  className={`flex-1 py-2 text-xs border ${
                    useCustomTech ? 'border-[#00c47a] text-[#00ff9c] bg-[rgba(0,255,156,0.04)] font-bold' : 'border-[#112019] text-[#2e4a34]'
                  } cursor-pointer`}
                >
                  SYNTHESIZE NEW ART
                </button>
              </div>

              {!useCustomTech ? (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {TECHNIQUES.map(t => (
                    <div
                      key={t.key}
                      onClick={() => {
                        Snd.sel();
                        setSelectedTech(t.key);
                      }}
                      className={`flex justify-between items-center p-2 border cursor-pointer ${
                        selectedTech === t.key
                          ? 'border-[#00ff9c] bg-[rgba(0,255,156,0.04)] text-white'
                          : 'border-[#112019] bg-[#070e0b] text-[#628a6a]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{t.name}</div>
                        <div className="text-[9px] text-[#2e4a34] mt-0.5">{t.desc}</div>
                      </div>
                      <div className="text-[9px] border border-[#112019] px-2 py-0.5 select-none font-semibold">
                        {t.pts > 0 ? `-${t.pts} PTS` : 'FREE'}
                      </div>
                    </div>
                  ))}
                </div>
               ) : (
                <div className="border border-[#112019] p-3 bg-[#070e0b] space-y-4">
                  <div className="text-[10px] text-[#00ff9c] font-bold tracking-wider uppercase border-b border-[#112019] pb-1 select-none flex justify-between items-center">
                    <span>CURSED ART SYNTHESIZER (Innate Base: -10 PTS)</span>
                    <span className="text-amber-400 text-[9px] font-mono font-bold">PTS Allocated dynamically in ledger</span>
                  </div>

                  {/* TEMPLATE QUICK LOADS */}
                  <div className="bg-black/40 border border-[#1d3225]/50 p-2 text-center rounded-sm space-y-1.5">
                    <div className="text-[9px] text-[#4d7155] uppercase font-bold tracking-widest">
                      ⚡ Quick-Load Legendary Concept Templates
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          Snd.forge();
                          setCustomTechName('Projection Sorcery');
                          setCustomTechArch('utility');
                          setCustomTechMoves([
                            { id: 'p1', name: '24 FPS: Agility Velocity Stacking', type: 'speed_frame', ceCost: 4, cooldown: 0, fpsLimit: 24, speedMultiplier: 1.5, speedAction: 'stack_agi' },
                            { id: 'p2', name: '24 FPS Calibration: Frame Freeze', type: 'speed_frame', ceCost: 12, cooldown: 1, fpsLimit: 24, speedMultiplier: 2.0, speedAction: 'freeze_frame' },
                            { id: 'p3', name: 'Supersonic Kinetic Collapse', type: 'strike', ceCost: 8, cooldown: 0, dmgMult: 2.5, scaleStat: 'agi', minDmg: 20, maxDmg: 50, secondary: 'frost' }
                          ]);
                          setCustomTechHasDomain(true);
                          setCustomTechDomainName('Domain Expansion: Time-Space Frame Capture');
                          setDomainHandSign('Enma Join');
                          setDomainEnvironment('Infinite Mirror Hall');
                          setDomainBarrierRule('time_locked');
                          setDomainSureHitSpell('tech_seal');
                          setDomainVisualAura('neon_lines');
                        }}
                        className="p-1 px-1.5 text-[8.5px] font-bold text-sky-300 border border-sky-500/20 bg-sky-950/25 hover:border-sky-400 hover:text-white rounded-xs select-none"
                      >
                        ⏱️ PROJECTION SORCERY
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          Snd.forge();
                          setCustomTechName('Ten Shadows Technique');
                          setCustomTechArch('utility');
                          setCustomTechMoves([
                            { id: 't1', name: 'Ten Shadows: Divine Dog Totality', type: 'summon', ceCost: 10, cooldown: 0, summonName: 'Divine Dog: Totality', summonType: 'canine', summonHp: 80, summonAtk: 18, summonMst: 8, summonAgi: 15, summonPassive: 'totality' },
                            { id: 't2', name: 'Ten Shadows: Nué Thunderbird', type: 'summon', ceCost: 12, cooldown: 1, summonName: 'Nué', summonType: 'avian', summonHp: 65, summonAtk: 12, summonMst: 20, summonAgi: 16, summonPassive: 'paralysis' },
                            { id: 't3', name: 'Shadow Well: Kinetic Storage', type: 'curse_law', ceCost: 6, cooldown: 0, lawType: 'kinetic_store', lawEffectDescription: 'Converts combat damage impacts into negative energy barriers' }
                          ]);
                          setCustomTechHasDomain(true);
                          setCustomTechDomainName('Domain Expansion: Chimera Shadow Garden');
                          setDomainHandSign('Ganesha Clasp');
                          setDomainEnvironment('Submerged Abyssal Temple');
                          setDomainBarrierRule('open_barrier');
                          setDomainSureHitSpell('chaos');
                          setDomainVisualAura('purple_abyss');
                        }}
                        className="p-1 px-1.5 text-[8.5px] font-bold text-purple-300 border border-purple-500/20 bg-purple-950/25 hover:border-purple-400 hover:text-white rounded-xs select-none"
                      >
                        👥 TEN SHADOWS SUMMON
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          Snd.forge();
                          setCustomTechName('Limitless Inversion');
                          setCustomTechArch('destruction');
                          setCustomTechMoves([
                            { id: 'l1', name: 'Cursed Lapse: Blue (Gravity Gravity)', type: 'strike', ceCost: 14, cooldown: 1, dmgMult: 2.5, scaleStat: 'mst', minDmg: 20, maxDmg: 60, secondary: 'frost' },
                            { id: 'l2', name: 'Infinity Barrier Skin Alignment', type: 'curse_law', ceCost: 12, cooldown: 2, lawType: 'kinetic_store', lawEffectDescription: 'Negative space barrier countering heavy kinetic blows' },
                            { id: 'l3', name: 'Cursed Reversal: Red Burst', type: 'strike', ceCost: 18, cooldown: 2, dmgMult: 3.0, scaleStat: 'mst', minDmg: 35, maxDmg: 85, secondary: 'burn' }
                          ]);
                          setCustomTechHasDomain(true);
                          setCustomTechDomainName('Domain Expansion: Unlimited Void Screen');
                          setDomainHandSign('Infinite Mudra');
                          setDomainEnvironment('Asylum of Judgement');
                          setDomainBarrierRule('standard');
                          setDomainSureHitSpell('stun');
                          setDomainVisualAura('gold_buddhism');
                        }}
                        className="p-1 px-1.5 text-[8.5px] font-bold text-amber-300 border border-amber-500/20 bg-amber-950/25 hover:border-amber-400 hover:text-white rounded-xs select-none"
                      >
                        🌌 LIMITLESS VOID
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CursedSynthesizer
                      customTechMoves={customTechMoves}
                      setCustomTechMoves={setCustomTechMoves}
                      customTechName={customTechName}
                      setCustomTechName={setCustomTechName}
                      customTechArch={customTechArch}
                      setCustomTechArch={setCustomTechArch}
                      customTechDmgMult={customTechDmgMult}
                      setCustomTechDmgMult={setCustomTechDmgMult}
                      customTechSecondary={customTechSecondary}
                      setCustomTechSecondary={setCustomTechSecondary}
                      customTechHasDomain={customTechHasDomain}
                      setCustomTechHasDomain={setCustomTechHasDomain}
                      customTechDomainName={customTechDomainName}
                      setCustomTechDomainName={setCustomTechDomainName}
                      customTechDomainSureHit={customTechDomainSureHit}
                      setCustomTechDomainSureHit={setCustomTechDomainSureHit}
                      customTechDomainHandSign={domainHandSign}
                      setCustomTechDomainHandSign={setDomainHandSign}
                      customTechDomainEnvironment={domainEnvironment}
                      setCustomTechDomainEnvironment={setDomainEnvironment}
                      customTechDomainBarrierRule={domainBarrierRule}
                      setCustomTechDomainBarrierRule={setDomainBarrierRule}
                      customTechDomainAura={domainVisualAura}
                      setCustomTechDomainAura={setDomainVisualAura}
                      customTechCeCost={customTechCeCost}
                      setCustomTechCeCost={setCustomTechCeCost}
                      customTechVowBinding={customTechVowBinding}
                      setCustomTechVowBinding={setCustomTechVowBinding}
                      customTechVisualTheme={customTechVisualTheme}
                      setCustomTechVisualTheme={setCustomTechVisualTheme}
                      customTechScaleStat={customTechScaleStat}
                      setCustomTechScaleStat={setCustomTechScaleStat}
                      customTechMinDmg={customTechMinDmg}
                      setCustomTechMinDmg={setCustomTechMinDmg}
                      customTechMaxDmg={customTechMaxDmg}
                      setCustomTechMaxDmg={setCustomTechMaxDmg}
                      customTechCooldown={customTechCooldown}
                      setCustomTechCooldown={setCustomTechCooldown}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* S5: UPBRINGING */}
          <div className="border border-[#112019] bg-[#040908]">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">⑤</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Origin Background</h3>
                <p className="text-[9px] text-[#2e4a34]">Upbringing and initial cursed volume spikes during childhood years</p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-[#2e4a34] tracking-widest uppercase mb-1.5">Childhood Household Type</label>
                <select
                  value={upbringing}
                  onChange={e => {
                    Snd.ui();
                    setUpbringing(e.target.value);
                  }}
                  className="w-full bg-[#070e0b] border border-[#112019] text-[#a4c8aa] text-xs py-2 px-3 focus:outline-none focus:border-[#00c47a]"
                >
                  {UPBRINGINGS.map(u => (
                    <option key={u.key} value={u.key}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-[#628a6a] mt-1.5 leading-relaxed italic">
                  {UPBRINGINGS.find(u => u.key === upbringing)?.desc}
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-[#2e4a34] tracking-widest uppercase mb-1.5">Cursed Energy Trace at Birth</label>
                <select
                  value={ceExp}
                  onChange={e => {
                    Snd.ui();
                    setCeExp(e.target.value);
                  }}
                  className="w-full bg-[#070e0b] border border-[#112019] text-[#a4c8aa] text-xs py-2 px-3 focus:outline-none focus:border-[#00c47a]"
                >
                  {CE_EXPOSURES.map(c => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-[#628a6a] mt-1.5 leading-relaxed italic">
                  {CE_EXPOSURES.find(c => c.key === ceExp)?.desc}
                </p>
              </div>
            </div>
          </div>

          {/* S6: BASE STAT ALLOCATION */}
          <div className="border border-[#112019] bg-[#040908]">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">⑥</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Stats Allocation Pool</h3>
                <p className="text-[9px] text-[#2e4a34]">
                  Buy points to increase baseline parameters. Max limits: 15 (Gods can purchase up to 20!)
                </p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {(Object.keys(baseStats) as StatName[]).map(key => {
                const currentVal = baseStats[key];
                const finalVal = finalStats[key];
                const limitMax = godMode ? 20 : 15;

                return (
                  <div key={key} className="flex justify-between items-center bg-[#070e0b] p-2 border border-[#112019]">
                    <div className="w-12 text-xs font-bold uppercase text-[#a4c8aa]">{key}</div>
                    <div className="flex items-center gap-2 flex-1 max-w-xs mx-4">
                      <button
                        onClick={() => decrementStat(key)}
                        disabled={currentVal <= 1}
                        className="w-6 h-6 bg-black border border-[#112019] border-b text-[#00c47a] font-bold text-xs hover:border-[#00ff9c] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <div className="flex-1 bg-black h-2.5 border border-[#112019] relative overflow-hidden">
                        <div
                          className="h-full bg-[#00c47a]"
                          style={{ width: `${(finalVal / 20) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-6 text-center font-bold text-xs text-[#00ff9c]">{finalVal}</div>
                    </div>
                    <div className="text-[9px] text-[#2e4a34] w-12 text-right uppercase">
                      {currentVal > 1 ? `-${currentVal - 1}p` : 'FREE'}
                    </div>
                    <button
                      onClick={() => incrementStat(key)}
                      disabled={currentVal >= limitMax || (pointsRemaining <= 0 && !godMode)}
                      className="w-6 h-6 bg-black border border-[#112019] border-b text-[#00c47a] font-bold text-xs hover:border-[#00ff9c] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* S7: HEAVENLY RESTRICTION PATHWAYS */}
          <div className="border border-[#112019] bg-[#040908] mt-4">
            <div className="flex items-center gap-2 p-3 bg-[#070e0b] border-b border-[#112019]">
              <div className="text-xl font-bold text-[#00ff9c] pr-2">⑦</div>
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#00c47a] uppercase">Heavenly Restriction Shackle</h3>
                <p className="text-[9px] text-[#2e4a34]">
                  Standard souls possess typical human limits. Exceptional shackles trade away entire fields in exchange for monstrous extremes.
                </p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-black/50 p-3 border border-[#112019] text-center space-y-2">
                <div className="text-[9px] text-[#2e4a34] tracking-wider uppercase font-extrabold">
                  // SOUL CONSTRAINT REGISTRY //
                </div>
                <div className="text-sm font-bold font-vt text-center">
                  {restriction === 'none' && <span className="text-[#a4c8aa]">STANDARD SOUL PATTERN</span>}
                  {restriction === 'toji' && <span className="text-red-500 animate-pulse font-extrabold tracking-widest">⚠️ TOJI-TYPE HARBINGER (PHYSICAL GOD)</span>}
                  {restriction === 'mechamaru' && <span className="text-cyan-400 animate-pulse font-extrabold tracking-widest">⚡ MECHAMARU-TYPE PROXY (OCCULT OVERFLOW)</span>}
                </div>
                <p className="text-[9.5px] leading-relaxed text-[#628a6a]">
                  {restriction === 'none' && 'Ordinary biological design. Normal CE pools and typical human thresholds.'}
                  {restriction === 'toji' && '0 Cursed Energy permanently. Base Strength, Agility, and Endurance receive +15 points! Immune to barrier traps, born with the fabled Inverted Spear of Heaven.'}
                  {restriction === 'mechamaru' && 'F frail. Base HP restricted to 1 (Endurance locked to 1). Cursed Energy registry capacity receives +25, Technique Mastery receives +15! Unlimited transmission range.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    Snd.forge();
                    const r = Math.random();
                    if (r < 0.12) {
                      setRestriction('toji');
                    } else if (r < 0.24) {
                      setRestriction('mechamaru');
                    } else {
                      setRestriction('none');
                    }
                  }}
                  className="flex-1 py-2.5 border border-[#1d3828] text-xs font-bold text-[#00ff9c] hover:bg-[#00ff9c]/5 bg-black cursor-pointer transition-all uppercase tracking-wider text-center"
                >
                  🎲 ROLL RESTRICTION (12% CHANCE)
                </button>
                {restriction !== 'none' && (
                  <button
                    onClick={() => {
                      Snd.ui();
                      setRestriction('none');
                    }}
                    className="py-2.5 px-3 border border-red-950 text-red-400 font-bold text-xs hover:bg-red-950/20 bg-black cursor-pointer transition-all uppercase"
                  >
                    CLEANSE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Sidebar */}
        <aside className="w-full md:w-64 bg-[#040908] border-t md:border-t-0 md:border-l border-[#112019] p-4 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold tracking-widest text-[#2e4a34] uppercase border-b border-[#112019] pb-1.5">
              // Vessel Blueprint //
            </h3>

            <div className="space-y-3.5">
              <div>
                <h4 className="text-xl font-bold text-[#00ff9c] tracking-wide font-vt uppercase truncate">
                  {firstName.trim() || 'UNNAMED'} {useCustomClan ? customClanName.trim() : CLANS.find(c => c.key === selectedClan)?.ln}
                </h4>
                <p className="text-[9px] text-[#2e4a34] tracking-wider uppercase mt-0.5">
                  {ERAS.find(e => e.key === selectedEra)?.name || '— SELECT ERA —'}
                </p>
              </div>

              <div className="border border-[#112019] bg-black p-2 space-y-1.5 rounded-sm">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#2e4a34] font-semibold uppercase">CLAN:</span>
                  <span className="text-[#00c47a] font-medium max-w-[120px] truncate uppercase">
                    {useCustomClan ? (customClanName.trim() || 'Custom') : (CLANS.find(c => c.key === selectedClan)?.name || 'None')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#2e4a34] font-semibold uppercase">ART:</span>
                  <span className="text-[#00c47a] font-medium max-w-[120px] truncate uppercase">
                    {useCustomTech ? (customTechName.trim() || 'Custom') : (TECHNIQUES.find(t => t.key === selectedTech)?.name || 'None')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#2e4a34] font-semibold uppercase">ORIGIN:</span>
                  <span className="text-[#00c47a] font-medium max-w-[120px] truncate uppercase">
                    {UPBRINGINGS.find(u => u.key === upbringing)?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#2e4a34] font-semibold uppercase">CE TRACE:</span>
                  <span className="text-[#00c47a] font-medium max-w-[120px] truncate uppercase">
                    {CE_EXPOSURES.find(c => c.key === ceExp)?.name || '—'}
                  </span>
                </div>
              </div>

              <div className="border border-[#112019] bg-black p-2 rounded-sm">
                <p className="text-[8px] text-[#2e4a34] tracking-widest uppercase font-bold mb-1.5">
                  // FINAL BASE PARAMETERS //
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(finalStats).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-[#2e4a34] text-[9px] uppercase font-bold">{k}</span>
                      <span className="text-[#00ff9c] font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#112019] mt-6">
            <div
              className={`text-[9px] font-bold py-1.5 px-3 border mb-3 text-center  ${
                validationError ? 'border-red-500 text-red-500 bg-red-950/20' : 'border-[#00c47a] text-[#00ff9c] bg-[#00ff9c]/5'
              }`}
            >
              {validationError ? `✗ ${validationError}` : '✓ MATRIX STABLE — READY TO AWAKEN'}
            </div>
            <button
              onClick={handleAwaken}
              disabled={!!validationError}
              className={`w-full py-3.5 border ${
                validationError
                  ? 'border-[#112019] text-[#2e4a34] cursor-not-allowed opacity-50'
                  : 'border-[#00ff9c] text-[#00ff9c] bg-[rgba(0,255,156,0.06)] hover:bg-[rgba(0,255,156,0.12)] hover:shadow-[0_0_15px_rgba(0,255,156,0.2)] cursor-pointer'
              } font-vt tracking-[0.2em] font-extrabold text-xl transition-all uppercase`}
            >
              ⚙ Awaken Vessel
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
