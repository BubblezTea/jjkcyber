/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomTechMove, TechScriptNode, TechScriptNodeType } from '../types';

interface CursedSynthesizerProps {
  customTechMoves: CustomTechMove[];
  setCustomTechMoves: React.Dispatch<React.SetStateAction<CustomTechMove[]>>;
  customTechName: string;
  setCustomTechName: (name: string) => void;
  customTechArch: string;
  setCustomTechArch: (arch: string) => void;
  customTechDmgMult: number;
  setCustomTechDmgMult: (val: number) => void;
  customTechSecondary: string;
  setCustomTechSecondary: (val: string) => void;
  customTechHasDomain: boolean;
  setCustomTechHasDomain: (val: boolean) => void;
  customTechDomainName: string;
  setCustomTechDomainName: (name: string) => void;
  customTechDomainSureHit: string;
  setCustomTechDomainSureHit: (val: string) => void;
  customTechDomainHandSign: string;
  setCustomTechDomainHandSign: (val: string) => void;
  customTechDomainEnvironment: string;
  setCustomTechDomainEnvironment: (val: string) => void;
  customTechDomainBarrierRule: string;
  setCustomTechDomainBarrierRule: (val: string) => void;
  customTechDomainAura: string;
  setCustomTechDomainAura: (val: string) => void;
  customTechCeCost: number;
  setCustomTechCeCost: (val: number) => void;
  customTechVowBinding: string;
  setCustomTechVowBinding: (val: string) => void;
  customTechVisualTheme: string;
  setCustomTechVisualTheme: (val: string) => void;
  customTechScaleStat: string;
  setCustomTechScaleStat: (val: string) => void;
  customTechMinDmg: number;
  setCustomTechMinDmg: (val: number) => void;
  customTechMaxDmg: number;
  setCustomTechMaxDmg: (val: number) => void;
  customTechCooldown: number;
  setCustomTechCooldown: (val: number) => void;
  onClose?: () => void;
}

// Scratch Category Definitions
type BlockCategory = 'control' | 'action' | 'matrix';

interface BlockDefinition {
  type: TechScriptNodeType;
  category: BlockCategory;
  name: string;
  desc: string;
  emoji: string;
  defaultParams: Partial<TechScriptNode>;
}

// Scratch Block Templates
const SCRATCH_PALETTE: BlockDefinition[] = [
  // Controls (Yellow/Orange)
  { type: 'logic_if_distance', category: 'control', emoji: '⚖️', name: 'If Distance ≤ Targets', desc: 'Branch if target is close', defaultParams: { paramDist: 3 } },
  { type: 'logic_if_shikigami', category: 'control', emoji: '👥', name: 'If Shikigami Exists', desc: 'Branch if active summon is on field', defaultParams: { paramName: 'Shadow Wolf', paramName2: '' } },
  { type: 'logic_if_self_hp', category: 'control', emoji: '🩸', name: 'If Self HP ≤ %', desc: 'Branch if health is low', defaultParams: { paramHpThreshold: 35 } },
  { type: 'logic_if_enemy_hp', category: 'control', emoji: '🧪', name: 'If Target HP ≤ %', desc: 'Branch if target health is low', defaultParams: { paramHpThreshold: 50 } },
  { type: 'logic_if_ce', category: 'control', emoji: '🌀', name: 'If CE ≥ Amount', desc: 'Branch if you have enough energy', defaultParams: { paramStatChange: 15 } },
  { type: 'logic_if_stunned', category: 'control', emoji: '⚡', name: 'If Target Stunned', desc: 'Branch if target is stunned', defaultParams: {} },
  { type: 'logic_if_turn_count', category: 'control', emoji: '⏱️', name: 'If Round ≥ Turn', desc: 'Branch if turn limit met', defaultParams: { paramTurnTreshold: 3 } },
  { type: 'logic_else', category: 'control', emoji: '🔁', name: 'Else Fallback', desc: 'Alternative branch', defaultParams: {} },
  { type: 'logic_end_if', category: 'control', emoji: '🛑', name: 'End Condition Branch', desc: 'Terminates condition check', defaultParams: {} },

  // Offensive Combat Actions (Blue)
  { type: 'action_strike', category: 'action', emoji: '⚔️', name: 'Strike Target Impact', desc: 'Slash or pierce target', defaultParams: { paramDmgMult: 1.5 } },
  { type: 'action_approach', category: 'action', emoji: '👟', name: 'Approach Close', desc: 'Move within distance', defaultParams: { paramDist: 2 } },
  { type: 'action_teleport_behind', category: 'action', emoji: '🚪', name: 'Teleport Behind', desc: 'Instant spatial warp', defaultParams: {} },
  { type: 'action_stun_target', category: 'action', emoji: '⚡', name: 'Inertia Stun', desc: 'Stuns the target', defaultParams: {} },
  { type: 'action_burn_target', category: 'action', emoji: '🔥', name: 'Thermal Burn DOT', desc: 'Inflicts continuous fire', defaultParams: {} },
  { type: 'action_frost_target', category: 'action', emoji: '❄️', name: 'Frost Lock Slow', desc: 'Slows down and freezes', defaultParams: {} },
  { type: 'action_summon', category: 'action', emoji: '👥', name: 'Summon Generic Beast', desc: 'Spawns a standard summon', defaultParams: { paramName: 'Shadow Wolf' } },
  { type: 'action_summon_modular', category: 'action', emoji: '🧬', name: 'Summon Modular Beast', desc: 'Spawns custom blueprint animal', defaultParams: { paramName: 'Shadow Snake', summonHp: 50, summonAtk: 15, summonMst: 10, summonAgi: 10 } },
  { type: 'action_unsummon', category: 'action', emoji: '💨', name: 'Dismiss Summon', desc: 'Recalls active animal', defaultParams: { paramName: 'Shadow Wolf' } },

  // Cursed Energy & Secondary matrix (Fuchsia)
  { type: 'action_heal', category: 'matrix', emoji: '❤️', name: 'Reverse Cursed Heal', desc: 'HP recovery via RCT', defaultParams: { paramHealAmt: 25 } },
  { type: 'action_blood_manipulation', category: 'matrix', emoji: '🩸', name: 'Blood Spike Pact', desc: 'Sacrifice HP for damage boost', defaultParams: { paramHealAmt: 15, paramDmgMult: 2.0 } },
  { type: 'action_drain_ce', category: 'matrix', emoji: '🌀', name: 'Siphon CE Channels', desc: 'Drains energy from opponent', defaultParams: { paramHealAmt: 10 } },
  { type: 'action_buff_self', category: 'matrix', emoji: '💪', name: 'Overtime Parameter Buff', desc: 'Boost parameters', defaultParams: { paramStatChange: 15 } },
  { type: 'action_debuff_target', category: 'matrix', emoji: '📉', name: 'Disruptive Debuff', desc: 'Reduces opponent stats', defaultParams: { paramStatChange: 10 } },
  { type: 'action_black_flash_check', category: 'matrix', emoji: '💥', name: 'Black Flash Surge', desc: 'Increase critical rates', defaultParams: { paramDmgMult: 1.5 } },
  { type: 'action_domain_expansion', category: 'matrix', emoji: '⛩️', name: 'Expand Spatial Domain', desc: 'Triggers sure-hit domain', defaultParams: {} },
  { type: 'action_play_sound', category: 'matrix', emoji: '🔊', name: 'Play Sound Resonance', desc: 'Plays sound effects', defaultParams: { paramName: 'energy_spark' } }
];

// Shikigami Species Base Stat Templates
const SHIKI_SPECIES = {
  canine: { hp: 40, atk: 18, mst: 10, agi: 22, guard: 10, name: '🐺 Canine (Shadow Wolf)' },
  avian: { hp: 35, atk: 15, mst: 25, agi: 25, guard: 5, name: '🦅 Nué (Thunderbird)' },
  elephant: { hp: 60, atk: 10, mst: 15, agi: 5, guard: 30, name: '🐘 Colossus Mammoth' },
  serpent: { hp: 45, atk: 20, mst: 5, agi: 18, guard: 12, name: '🐍 Grave Viper' },
  toad: { hp: 50, atk: 12, mst: 10, agi: 15, guard: 13, name: '🐸 Swamp Toad' },
  phantom: { hp: 30, atk: 15, mst: 20, agi: 30, guard: 5, name: '👥 Shadow Phantom' },
  colossus: { hp: 70, atk: 25, mst: 20, agi: 10, guard: 25, name: '👹 Divine General (Mahoraga)' }
};

// Modular Sockets Items
const SENSORY_CREST_MODULES = [
  { key: 'gilded_horn', name: '🦏 Ivory Gilded Horn', desc: 'Extra physical crash protection', hp: 20, atk: 5, mst: 0, agi: -5, guard: 15, ability: 'shield_intercept' },
  { key: 'six_paths_eye', name: '👁️ Mystic Hex-Eye Replica', desc: 'Cursed energy tracking, boosts magic', hp: -10, atk: 0, mst: 25, agi: 10, guard: 0, ability: 'totality' },
  { key: 'split_tongue', name: '🐍 Split Cobra Tongue', desc: 'Nerve sensing, electric shock charges', hp: 5, atk: 10, mst: 10, agi: 15, guard: -5, ability: 'paralysis' },
  { key: 'mirror_mask', name: '🎭 Hollow Phantasm Mask', desc: 'Evasive visual blurs, high dodge speed', hp: 0, atk: 5, mst: 15, agi: 20, guard: -10, ability: 'mirror_mirror' },
];

const APPENDAGE_MODULES = [
  { key: 'iron_claws', name: '⚔️ Adamantite Claw Spikes', desc: 'Severe tearing physical slash', hp: 0, atk: 25, mst: 0, agi: 10, guard: 5 },
  { key: 'feather_wings', name: '🪶 Storm-feathered Gliders', desc: 'Aerial lift, agile storm movement', hp: -5, atk: 5, mst: 15, agi: 25, guard: -5 },
  { key: 'turtle_shell', name: '🛡️ Genbu Shell Plating', desc: 'Absorbs lethal blows for owner', hp: 35, atk: -5, mst: 0, agi: -15, guard: 30 },
  { key: 'orochi_tail', name: '🐉 Toxic Snake Whip Tail', desc: 'Poison inject, extra leverage range', hp: 10, atk: 15, mst: 15, agi: 0, guard: 10 },
];

const RESONANCE_CORE_MODULES = [
  { key: 'adaptive_wheel', name: '⚙️ Eight-Spanned Wheel of Dharma', desc: 'Gradually decrypts enemy elements', hp: 20, atk: 10, mst: 10, agi: 10, guard: 10, ability: 'adaptive_gauge' },
  { key: 'corrosive_sac', name: '🧪 Caustic Acidic Gland', desc: 'Discharges corrosive biological fluids', hp: 10, atk: 15, mst: 15, agi: 0, guard: 0, ability: 'acid_spit' },
  { key: 'ce_battery', name: '🌀 Abyssal CE Sieve Tube', desc: 'Returns spent CE on critical strikes', hp: -5, atk: 5, mst: 25, agi: 10, guard: -10, ability: 'blood_recovery' },
  { key: 'reverse_cells', name: '🧬 Reversal Cellular Nucleus', desc: 'High percentage automated vital repair', hp: 40, atk: -10, mst: 20, agi: -5, guard: 15, ability: 'blood_recovery' },
];

export const CursedSynthesizer: React.FC<CursedSynthesizerProps> = ({
  customTechMoves,
  setCustomTechMoves,
  customTechName,
  setCustomTechName,
  customTechArch,
  setCustomTechArch,
  customTechDmgMult,
  setCustomTechDmgMult,
  customTechSecondary,
  setCustomTechSecondary,
  customTechHasDomain,
  setCustomTechHasDomain,
  customTechDomainName,
  setCustomTechDomainName,
  customTechDomainSureHit,
  setCustomTechDomainSureHit,
  customTechDomainHandSign,
  setCustomTechDomainHandSign,
  customTechDomainEnvironment,
  setCustomTechDomainEnvironment,
  customTechDomainBarrierRule,
  setCustomTechDomainBarrierRule,
  customTechDomainAura,
  setCustomTechDomainAura,
  customTechVisualTheme,
  setCustomTechVisualTheme,
  customTechCooldown,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'moves' | 'shikigami' | 'projection'>('moves');
  const [selectedMoveIdx, setSelectedMoveIdx] = useState<number>(0);

  // Modular Sockets State
  const [shikiSpecies, setShikiSpecies] = useState<keyof typeof SHIKI_SPECIES>('canine');
  const [socketSensory, setSocketSensory] = useState<string>('gilded_horn');
  const [socketAppendage, setSocketAppendage] = useState<string>('iron_claws');
  const [socketCore, setSocketCore] = useState<string>('adaptive_wheel');

  // Fine-tuning points allocation
  const [shikiBonusStats, setShikiBonusStats] = useState({ hp: 0, atk: 0, mst: 0, agi: 0, guard: 0 });
  const [shikiName, setShikiName] = useState<string>('Shadow Wolf');

  const playClick = () => {
    try {
      if ((window as any).Snd) {
        (window as any).Snd.ui();
      }
    } catch {}
  };

  // Sync state when move slot changes
  useEffect(() => {
    const move = customTechMoves[selectedMoveIdx];
    if (move && move.type === 'summon') {
      if (move.summonName) setShikiName(move.summonName);
      if (move.summonType && move.summonType in SHIKI_SPECIES) {
        setShikiSpecies(move.summonType as keyof typeof SHIKI_SPECIES);
      }
      
      const passives = (move.summonPassive || '').split('+');
      if (passives[0]) {
        const foundCrest = SENSORY_CREST_MODULES.find(m => m.ability === passives[0]);
        if (foundCrest) setSocketSensory(foundCrest.key);
      }
      if (passives[1]) {
        const foundCore = RESONANCE_CORE_MODULES.find(m => m.ability === passives[1]);
        if (foundCore) setSocketCore(foundCore.key);
      }
    }
  }, [selectedMoveIdx, activeTab]);

  // Calculations for current metrics
  const currentBase = SHIKI_SPECIES[shikiSpecies] || SHIKI_SPECIES.canine;
  const currentCrest = SENSORY_CREST_MODULES.find(m => m.key === socketSensory) || SENSORY_CREST_MODULES[0];
  const currentAppendage = APPENDAGE_MODULES.find(m => m.key === socketAppendage) || APPENDAGE_MODULES[0];
  const currentCore = RESONANCE_CORE_MODULES.find(m => m.key === socketCore) || RESONANCE_CORE_MODULES[0];

  const calcHp = currentBase.hp + currentCrest.hp + currentAppendage.hp + currentCore.hp + shikiBonusStats.hp;
  const calcAtk = currentBase.atk + currentCrest.atk + currentAppendage.atk + currentCore.atk + shikiBonusStats.atk;
  const calcMst = currentBase.mst + currentCrest.mst + currentAppendage.mst + currentCore.mst + shikiBonusStats.mst;
  const calcAgi = currentBase.agi + currentCrest.agi + currentAppendage.agi + currentCore.agi + shikiBonusStats.agi;
  const calcGuard = currentBase.guard + currentCrest.guard + currentAppendage.guard + currentCore.guard + shikiBonusStats.guard;

  const totalBonusGained = shikiBonusStats.hp + shikiBonusStats.atk + shikiBonusStats.mst + shikiBonusStats.agi + shikiBonusStats.guard;
  const reallocPointsLeft = 30 - totalBonusGained;

  const handleAdjustBonusStat = (statKey: keyof typeof shikiBonusStats, isAdd: boolean) => {
    playClick();
    const curr = shikiBonusStats[statKey];
    if (isAdd && reallocPointsLeft <= 0) return;
    if (!isAdd && curr <= 0) return;

    setShikiBonusStats(prev => ({
      ...prev,
      [statKey]: Math.max(0, curr + (isAdd ? 5 : -5))
    }));
  };

  const syncActiveMoveWithShikigami = () => {
    playClick();
    const updated = [...customTechMoves];
    if (updated[selectedMoveIdx]) {
      updated[selectedMoveIdx].type = 'summon';
      updated[selectedMoveIdx].name = shikiName || 'Custom Beast';
      updated[selectedMoveIdx].summonName = shikiName || 'Custom Beast';
      updated[selectedMoveIdx].summonHp = calcHp;
      updated[selectedMoveIdx].summonAtk = calcAtk;
      updated[selectedMoveIdx].summonMst = calcMst;
      updated[selectedMoveIdx].summonAgi = calcAgi;
      updated[selectedMoveIdx].summonType = shikiSpecies;
      updated[selectedMoveIdx].summonPassive = `${currentCrest.ability || 'totality'}+${currentCore.ability || 'adaptive_gauge'}`;
      setCustomTechMoves(updated);
    }
  };

  // Reorder macro nodes
  const moveNode = (nKeyIdx: number, offset: number) => {
    playClick();
    const updated = [...customTechMoves];
    const move = updated[selectedMoveIdx];
    if (move && move.scriptNodes) {
      const arr = [...move.scriptNodes];
      const targetIdx = nKeyIdx + offset;
      if (targetIdx >= 0 && targetIdx < arr.length) {
        const temp = arr[nKeyIdx];
        arr[nKeyIdx] = arr[targetIdx];
        arr[targetIdx] = temp;
        move.scriptNodes = arr;
        setCustomTechMoves(updated);
      }
    }
  };

  // Delete node
  const deleteNode = (nKeyIdx: number) => {
    playClick();
    const updated = [...customTechMoves];
    const move = updated[selectedMoveIdx];
    if (move && move.scriptNodes) {
      move.scriptNodes = move.scriptNodes.filter((_, idx) => idx !== nKeyIdx);
      setCustomTechMoves(updated);
    }
  };

  // Append new Block from Toolbox
  const addBlockFromToolbox = (preset: BlockDefinition) => {
    playClick();
    const updated = [...customTechMoves];
    const move = updated[selectedMoveIdx];
    if (move) {
      const nodes = move.scriptNodes || [];
      const newNode: TechScriptNode = {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: preset.type,
        ...preset.defaultParams
      };
      move.scriptNodes = [...nodes, newNode];
      setCustomTechMoves(updated);
    }
  };

  // 24 FPS Logic Sequence
  const [fpsSequence, setFpsSequence] = useState<string[]>(Array(24).fill('null'));
  const [selectedFrame, setSelectedFrame] = useState<number>(0);
  const [fpsOverlordMode, setFpsOverlordMode] = useState<boolean>(false);

  const calculateCalibrationScore = () => {
    let score = 0;
    let kineticBuild = 0;
    let errors = 0;
    fpsSequence.forEach((pos) => {
      if (pos === 'acceleration') { kineticBuild += 15; score += 10; }
      else if (pos === 'pivot') { if (kineticBuild > 10) score += 15; else { errors++; score -= 5; } }
      else if (pos === 'compression') { kineticBuild += 25; score += 12; }
      else if (pos === 'slipstream') { score += 15; kineticBuild += 10; }
      else if (pos === 'air_step') { score += 15; kineticBuild += 10; }
      else if (pos === 'capture') { if (kineticBuild > 40) score += 20; else { errors++; score -= 8; } }
      else if (pos === 'release') { if (kineticBuild > 50) score += 35; else score += 5; kineticBuild = 0; }
    });
    return {
      score: Math.max(5, Math.min(100, score - errors * 5)),
      errors,
      multiplier: (1.0 + (score / 150)).toFixed(2)
    };
  };

  const cal = calculateCalibrationScore();

  const handleSetFramePose = (poseKey: string) => {
    playClick();
    const nextSeq = [...fpsSequence];
    nextSeq[selectedFrame] = poseKey;
    setFpsSequence(nextSeq);
  };

  const generateTrajectorySVGPath = () => {
    let x = 30; let y = 140;
    let points = [`${x},${y}`];
    let angle = 0;
    let currentSpeed = 10;

    fpsSequence.forEach(pos => {
      if (pos === 'acceleration') { currentSpeed += 12; x += currentSpeed; }
      else if (pos === 'pivot') { angle += 45; x += Math.cos((angle * Math.PI) / 180) * currentSpeed; y += Math.sin((angle * Math.PI) / 180) * currentSpeed; }
      else if (pos === 'compression') { y += 18; }
      else if (pos === 'slipstream') { x += currentSpeed * 1.5; y -= 8; }
      else if (pos === 'air_step') { y -= 25; x += 10; }
      else if (pos === 'capture') { x += 4; y += 4; }
      else if (pos === 'release') { x += currentSpeed * 2; }
      else { x += 12; }
      points.push(`${Math.max(20, Math.min(680, x))},${Math.max(20, Math.min(270, y))}`);
    });
    return points.join(' ');
  };

  const syncActiveMoveWithProjection = () => {
    playClick();
    const updated = [...customTechMoves];
    if (updated[selectedMoveIdx]) {
      updated[selectedMoveIdx].type = 'speed_frame';
      updated[selectedMoveIdx].name = `Velocity Loop ${cal.score}%`;
      updated[selectedMoveIdx].fpsLimit = fpsOverlordMode ? 60 : 24;
      updated[selectedMoveIdx].speedMultiplier = parseFloat(cal.multiplier);
      updated[selectedMoveIdx].speedAction = cal.errors > 2 ? 'freeze_frame' : 'stack_agi';
      setCustomTechMoves(updated);
    }
  };

  const renderScratchBlock = (node: TechScriptNode, nIdx: number, nestLevel: number) => {
    const preset = SCRATCH_PALETTE.find(p => p.type === node.type);
    if (!preset) return null;

    // Color mapper
    let colorClasses = '';
    if (preset.category === 'control') {
      colorClasses = 'bg-amber-500/90 border-[#c2410c] text-black shadow-[3px_3px_0px_#7c2d12]';
    } else if (preset.category === 'action') {
      colorClasses = 'bg-blue-600/95 border-[#1d4ed8] text-white shadow-[3px_3px_0px_#1e3a8a]';
    } else {
      colorClasses = 'bg-purple-600/95 border-[#7e22ce] text-white shadow-[3px_3px_0px_#581c87]';
    }

    const isEndingOrElse = node.type === 'logic_else' || node.type === 'logic_end_if';
    const computedIndent = isEndingOrElse ? Math.max(0, nestLevel - 1) : nestLevel;

    // Inline inputs modifier
    const updateNodeParam = (field: keyof TechScriptNode, val: any) => {
      const updated = [...customTechMoves];
      const move = updated[selectedMoveIdx];
      if (move && move.scriptNodes && move.scriptNodes[nIdx]) {
        move.scriptNodes[nIdx] = {
          ...move.scriptNodes[nIdx],
          [field]: val
        };
        setCustomTechMoves(updated);
      }
    };

    return (
      <div
        key={node.id}
        className="relative group transition-all duration-150 flex items-center pr-2"
        style={{ marginLeft: `${computedIndent * 24}px` }}
      >
        {/* Scratch-style Brace Connector for Nested Structures */}
        {computedIndent > 0 && (
          <div 
            className="absolute -left-4 top-0 bottom-0 border-l-2 border-dashed border-[#1b3c25]/60 pointer-events-none" 
            style={{ left: `-${24}px` }}
          />
        )}

        {/* Tactile Puzzle Interlocking Notch */}
        <div className="absolute top-0 left-8 w-5 h-1.5 -translate-y-full bg-inherit rounded-t-sm z-30 opacity-70 filter saturate-150 hidden sm:block" />

        <div className={`relative flex-1 rounded-md border-l-[8px] p-2 sm:p-2.5 my-1.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 select-none ${colorClasses}`}>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black tracking-wide font-mono">
            <span className="text-sm">{preset.emoji}</span>
            <span className="opacity-90">{preset.name.toUpperCase()}</span>

            {/* Logical & parameters inline scratch templates */}
            {node.type === 'logic_if_distance' && (
              <>
                <span className="opacity-75">IS ≤</span>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={node.paramDist || 3}
                  onChange={e => updateNodeParam('paramDist', parseInt(e.target.value) || 3)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 text-[9px] font-bold text-white focus:outline-none"
                />
                <span className="opacity-75">METERS</span>
              </>
            )}

            {node.type === 'logic_if_shikigami' && (
              <>
                <span className="opacity-75">NAMED</span>
                <input
                  type="text"
                  value={node.paramName || ''}
                  onChange={e => updateNodeParam('paramName', e.target.value)}
                  className="bg-black/30 border border-white/20 rounded-xs px-1 text-[9px] text-[#00ff9c] focus:outline-none w-20"
                  placeholder="Shadow Wolf"
                />
              </>
            )}

            {node.type === 'logic_if_self_hp' && (
              <>
                <span className="opacity-75">IS ≤</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={node.paramHpThreshold || 35}
                  onChange={e => updateNodeParam('paramHpThreshold', parseInt(e.target.value) || 35)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none"
                />
                <span className="opacity-75">% OF MAX</span>
              </>
            )}

            {node.type === 'logic_if_enemy_hp' && (
              <>
                <span className="opacity-75">IS ≤</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={node.paramHpThreshold || 50}
                  onChange={e => updateNodeParam('paramHpThreshold', parseInt(e.target.value) || 50)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none"
                />
                <span className="opacity-75">% OF MAX</span>
              </>
            )}

            {node.type === 'logic_if_ce' && (
              <>
                <span className="opacity-75">IS ≥</span>
                <input
                  type="number"
                  min="0"
                  value={node.paramStatChange || 15}
                  onChange={e => updateNodeParam('paramStatChange', parseInt(e.target.value) || 15)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none"
                />
                <span className="opacity-75">CE POINTS</span>
              </>
            )}

            {node.type === 'logic_if_turn_count' && (
              <>
                <span className="opacity-75">IS ≥</span>
                <input
                  type="number"
                  min="1"
                  value={node.paramTurnTreshold || 3}
                  onChange={e => updateNodeParam('paramTurnTreshold', parseInt(e.target.value) || 3)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-9 focus:outline-none"
                />
                <span className="opacity-75">ROUNDS</span>
              </>
            )}

            {node.type === 'action_strike' && (
              <>
                <span className="opacity-75">WITH MULTIPLIER</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="5"
                  value={node.paramDmgMult || 1.5}
                  onChange={e => updateNodeParam('paramDmgMult', parseFloat(e.target.value) || 1.5)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none"
                />
                <span className="opacity-75">X MASTERY</span>
              </>
            )}

            {node.type === 'action_approach' && (
              <>
                <span className="opacity-75">UNTIL WITHIN</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={node.paramDist || 2}
                  onChange={e => updateNodeParam('paramDist', parseInt(e.target.value) || 2)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-9 focus:outline-none"
                />
                <span className="opacity-75">METERS</span>
              </>
            )}

            {node.type === 'action_summon' && (
              <>
                <span className="opacity-75">NAMED</span>
                <input
                  type="text"
                  value={node.paramName || ''}
                  onChange={e => updateNodeParam('paramName', e.target.value)}
                  className="bg-black/30 border border-white/20 rounded-xs px-1 w-20 text-[9px] text-[#00ff9c] focus:outline-none"
                />
              </>
            )}

            {node.type === 'action_unsummon' && (
              <>
                <span className="opacity-75">NAMED</span>
                <input
                  type="text"
                  value={node.paramName || ''}
                  onChange={e => updateNodeParam('paramName', e.target.value)}
                  className="bg-black/30 border border-white/20 rounded-xs px-1 w-20 focus:outline-none"
                />
              </>
            )}

            {node.type === 'action_heal' && (
              <>
                <span className="opacity-75">HEAL FOR</span>
                <input
                  type="number"
                  min="1"
                  value={node.paramHealAmt || 25}
                  onChange={e => updateNodeParam('paramHealAmt', parseInt(e.target.value) || 25)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-11 focus:outline-none"
                />
                <span className="opacity-75">VITAL HIGHS</span>
              </>
            )}

            {node.type === 'action_blood_manipulation' && (
              <>
                <span className="opacity-75">SACRIFICE</span>
                <input
                  type="number"
                  min="1"
                  value={node.paramHealAmt || 15}
                  onChange={e => updateNodeParam('paramHealAmt', parseInt(e.target.value) || 15)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none text-red-100"
                />
                <span className="opacity-75">HP FOR EXTRA DAMAGE</span>
              </>
            )}

            {node.type === 'action_drain_ce' && (
              <>
                <span className="opacity-75">DRAIN</span>
                <input
                  type="number"
                  min="1"
                  value={node.paramHealAmt || 10}
                  onChange={e => updateNodeParam('paramHealAmt', parseInt(e.target.value) || 10)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none"
                />
                <span className="opacity-75">CE</span>
              </>
            )}

            {node.type === 'action_buff_self' && (
              <>
                <span className="opacity-75">BOOST BY</span>
                <input
                  type="number"
                  min="1"
                  value={node.paramStatChange || 15}
                  onChange={e => updateNodeParam('paramStatChange', parseInt(e.target.value) || 15)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-9 focus:outline-none"
                />
                <span className="opacity-75">POINTS</span>
              </>
            )}

            {node.type === 'action_debuff_target' && (
              <>
                <span className="opacity-75">WEAKEN BY</span>
                <input
                  type="number"
                  min="1"
                  value={node.paramStatChange || 10}
                  onChange={e => updateNodeParam('paramStatChange', parseInt(e.target.value) || 10)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-9 focus:outline-none"
                />
                <span className="opacity-75">POINTS</span>
              </>
            )}

            {node.type === 'action_black_flash_check' && (
              <>
                <span className="opacity-75">MULTIPLIER</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  value={node.paramDmgMult || 1.5}
                  onChange={e => updateNodeParam('paramDmgMult', parseFloat(e.target.value) || 1.5)}
                  className="bg-black/30 border border-white/20 rounded-xs text-center w-10 focus:outline-none"
                />
              </>
            )}

            {node.type === 'action_play_sound' && (
              <>
                <span className="opacity-75">AUDIO KEY</span>
                <input
                  type="text"
                  value={node.paramName || 'energy_spark'}
                  onChange={e => updateNodeParam('paramName', e.target.value)}
                  className="bg-black/30 border border-white/20 rounded-xs px-1 w-20 text-[9px] focus:outline-none"
                />
              </>
            )}

            {node.type === 'action_summon_modular' && (
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 bg-black/10 py-0.5 px-1 rounded-sm w-full font-sans font-normal text-[8px] text-white/90 uppercase">
                <span>Summon custom beast {node.paramName || 'Beast'}</span>
                <span>(HP: <input type="number" value={node.summonHp || 50} onChange={e => updateNodeParam('summonHp', parseInt(e.target.value) || 50)} className="w-8 bg-black/20 text-center text-emerald-400" /></span>
                <span>ATK: <input type="number" value={node.summonAtk || 15} onChange={e => updateNodeParam('summonAtk', parseInt(e.target.value) || 15)} className="w-8 bg-black/20 text-center text-pink-400" /></span>
                <span>MST: <input type="number" value={node.summonMst || 10} onChange={e => updateNodeParam('summonMst', parseInt(e.target.value) || 10)} className="w-8 bg-black/20 text-center text-purple-400" /></span>
                <span>AGI: <input type="number" value={node.summonAgi || 10} onChange={e => updateNodeParam('summonAgi', parseInt(e.target.value) || 10)} className="w-8 bg-black/20 text-center text-cyan-400" />)</span>
              </div>
            )}
          </div>

          {/* Block Reorder & Destroy Rails */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => moveNode(nIdx, -1)}
              disabled={nIdx === 0}
              className="text-[9px] p-1 bg-black/20 rounded-xs text-current font-extrabold disabled:opacity-20 hover:bg-black/40"
              title="Move Up"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveNode(nIdx, 1)}
              disabled={!customTechMoves[selectedMoveIdx]?.scriptNodes || nIdx === customTechMoves[selectedMoveIdx].scriptNodes.length - 1}
              className="text-[9px] p-1 bg-black/20 rounded-xs text-current font-extrabold disabled:opacity-20 hover:bg-black/40"
              title="Move Down"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => deleteNode(nIdx)}
              className="text-[9px] p-1 bg-black/20 hover:bg-red-900/60 rounded-xs text-red-900 hover:text-red-200 font-extrabold ml-1"
              title="Delete Block"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#030605] border border-[#12281a] p-3 sm:p-4 rounded-xs shadow-[0_0_25px_rgba(0,196,122,0.12)] space-y-4 text-[#a4c8aa] font-mono relative select-none">
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-950/20 rounded-full blur-2xl -z-10" />

      {/* Header block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1b3c25] pb-2.5">
        <div>
          <h2 className="text-sm font-black text-[#00ff9c] tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="text-teal-400 animate-spin text-xs">🌀</span>
            Jujutsu Innate Art Synthesizer
          </h2>
          <p className="text-[10px] text-[#42644a] italic mt-0.5">
            Forge interlocking logical scratch scripts and customize bio-organic Shikigami mediums.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[9.5px] text-red-400 hover:text-red-200 border border-red-950 px-2 py-0.5 bg-red-950/25 mt-2 sm:mt-0 font-extrabold"
          >
            ✕ CLOSE
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#0f1d14] pb-1">
        <button
          type="button"
          onClick={() => { playClick(); setActiveTab('moves'); }}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
            activeTab === 'moves' ? 'border-[#00ff9c] text-[#00ff9c] bg-[#00ff9c]/5' : 'border-transparent text-neutral-500'
          }`}
        >
          🧩 1. Scratch Code Moves
        </button>
        <button
          type="button"
          onClick={() => { playClick(); setActiveTab('shikigami'); }}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
            activeTab === 'shikigami' ? 'border-purple-400 text-purple-300 bg-purple-950/10' : 'border-transparent text-neutral-500'
          }`}
        >
          🧬 2. Modular Shikigami
        </button>
        <button
          type="button"
          onClick={() => { playClick(); setActiveTab('projection'); }}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
            activeTab === 'projection' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/15' : 'border-transparent text-neutral-500'
          }`}
        >
          ⏱️ 3. 24 FPS Sequence
        </button>
      </div>

      {/* TAB 1: SCRATCH-BASED CUSTOM MOVES */}
      {activeTab === 'moves' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Innate general parameters Panel */}
          <div className="lg:col-span-4 bg-black/60 border border-[#112019] p-3 space-y-4 rounded-sm">
            <h3 className="text-[10px] text-[#00ffff] font-extrabold tracking-widest uppercase border-b border-[#112019] pb-1">
              // Core Innate Setup //
            </h3>

            <div>
              <label className="block text-[8px] text-[#4d7155] uppercase font-bold mb-0.5">Technique Name</label>
              <input
                type="text"
                value={customTechName}
                onChange={e => setCustomTechName(e.target.value)}
                className="w-full bg-black border border-[#112019] text-sky-400 px-2 py-1 text-xs font-bold"
                placeholder="e.g. Ten Shadows Rebirth"
              />
            </div>

            <div>
              <label className="block text-[8px] text-[#4d7155] uppercase font-bold mb-0.5">Architecture Core</label>
              <select
                value={customTechArch}
                onChange={e => setCustomTechArch(e.target.value)}
                className="w-full bg-black border border-[#112019] text-[#a4c8aa] text-[9.5px] p-0.5"
              >
                <option value="destruction">Destruction (Offensive Multipliers boost)</option>
                <option value="utility">Utility (Shadow setups, summon defenses)</option>
                <option value="lethal">Lethal (Fast penetrative and DOTs)</option>
              </select>
            </div>

            <div>
              <label className="block text-[8px] text-[#4d7155] uppercase font-bold mb-0.5">Energy Theme Aura</label>
              <select
                value={customTechVisualTheme}
                onChange={e => setCustomTechVisualTheme(e.target.value)}
                className="w-full bg-black border border-[#112019] text-[#a4c8aa] text-[9.5px] p-0.5"
              >
                <option value="spatial">✂️ Spatial Warp Lattice</option>
                <option value="dark_shadow">👥 Abyssal Shadow Pools</option>
                <option value="blood_occult">🩸 Cursed Blood Vessel</option>
                <option value="cosmic_void">🌌 Eternal Cosmic Void</option>
              </select>
            </div>

            <div className="pt-2 border-t border-[#112019] flex items-center justify-between">
              <span className="text-[10px] text-[#ff80bf] font-bold">Deploy Barrier Domain?</span>
              <button
                type="button"
                onClick={() => setCustomTechHasDomain(!customTechHasDomain)}
                className={`px-2 py-0.5 text-[9px] font-black border uppercase ${
                  customTechHasDomain ? 'border-amber-500 bg-amber-950/20 text-amber-300' : 'border-neutral-800 text-neutral-500'
                }`}
              >
                {customTechHasDomain ? '✓ ENABLED' : '✗ DISABLED'}
              </button>
            </div>

            {customTechHasDomain && (
              <div className="space-y-1.5 pt-2 border-t border-purple-900 bg-purple-950/5 p-2 rounded-xs border-dashed border">
                <input
                  type="text"
                  value={customTechDomainName}
                  onChange={e => setCustomTechDomainName(e.target.value)}
                  className="w-full bg-black border border-purple-900/60 text-purple-200 px-2 py-0.5 text-[10px]"
                  placeholder="Domain name..."
                />
                <select
                  value={customTechDomainSureHit}
                  onChange={e => setCustomTechDomainSureHit(e.target.value)}
                  className="w-full bg-black border border-purple-900/60 text-purple-200 text-[9px] p-0.5"
                >
                  <option value="stun">Sure-Hit Neural Shock (2t Stun)</option>
                  <option value="bypass">Piercing Cleave Space (Bypasses armor)</option>
                  <option value="siphon">Aura Life-Force Siphon (Self Heals)</option>
                  <option value="burn_dot">Molten Sulfur Flame (DOT decay)</option>
                </select>
              </div>
            )}
          </div>

          {/* Modular Move Scratch Block Coding workspace */}
          <div className="lg:col-span-8 bg-black/40 border border-[#112019] p-3 space-y-4 rounded-sm">
            <div className="flex justify-between items-center border-b border-[#112019] pb-1.5">
              <span className="text-[10px] text-[#00ff9c] font-extrabold uppercase">// Active Move Slots ({customTechMoves.length}/10) //</span>
              {customTechMoves.length < 10 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextId = 'move_' + Date.now();
                    setCustomTechMoves([
                      ...customTechMoves,
                      { id: nextId, name: 'Slash Strike Combo', type: 'strike', ceCost: 8, cooldown: 0, dmgMult: 1.5, scaleStat: 'mst', minDmg: 10, maxDmg: 25, secondary: 'none' }
                    ]);
                  }}
                  className="px-2 py-0.5 text-[8.5px] border border-[#00ff9c]/50 text-[#00ff9c] hover:bg-[#00ff9c]/10"
                >
                  + CREATE NEW MOVE SLOT
                </button>
              )}
            </div>

            {/* Slots navigation tabs */}
            <div className="flex gap-1 flex-wrap">
              {customTechMoves.map((mov, mIdx) => (
                <button
                  key={mov.id}
                  type="button"
                  onClick={() => { playClick(); setSelectedMoveIdx(mIdx); }}
                  className={`px-2 py-1 text-[9px] border cursor-pointer ${
                    selectedMoveIdx === mIdx ? 'border-[#00ff9c] text-[#00ff9c] bg-[#00ff9c]/5' : 'border-[#112019] text-[#42644a] hover:text-white'
                  }`}
                >
                  SLOT {mIdx + mIdx + 1 > 0 ? mIdx + 1 : 1}: {mov.name || 'Unnamed Move'}
                </button>
              ))}
            </div>

            {customTechMoves[selectedMoveIdx] ? (
              <div className="space-y-3.5 border border-[#112019] bg-[#020504] p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] text-[#4d7155] uppercase font-mono font-bold mb-0.5">Move Label</label>
                    <input
                      type="text"
                      value={customTechMoves[selectedMoveIdx].name}
                      onChange={e => {
                        const updated = [...customTechMoves];
                        updated[selectedMoveIdx].name = e.target.value;
                        setCustomTechMoves(updated);
                      }}
                      className="w-full bg-black border border-[#112019] text-emerald-400 px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-[#4d7155] uppercase font-mono font-bold mb-0.5">Action Category Style</label>
                    <select
                      value={customTechMoves[selectedMoveIdx].type}
                      onChange={e => {
                        const val = e.target.value as any;
                        const updated = [...customTechMoves];
                        updated[selectedMoveIdx].type = val;
                        if (val === 'macro_script' && !updated[selectedMoveIdx].scriptNodes) {
                          updated[selectedMoveIdx].scriptNodes = [];
                        }
                        setCustomTechMoves(updated);
                      }}
                      className="w-full bg-black border border-[#112019] text-sky-400 text-[10px]"
                    >
                      <option value="strike">⚔️ Physical Damage Strike</option>
                      <option value="summon">👥 Shikigami Medium Conjure</option>
                      <option value="speed_frame">⏱️ 24-FPS Projection Warp</option>
                      <option value="macro_script">🧩 Scratch Logical Script (Visual Builder)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] text-pink-400 uppercase font-mono font-bold">Cursed Energy Cost</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="40" 
                      value={customTechMoves[selectedMoveIdx].ceCost} 
                      onChange={e => {
                        const updated = [...customTechMoves];
                        updated[selectedMoveIdx].ceCost = parseInt(e.target.value) || 8;
                        setCustomTechMoves(updated);
                      }} 
                      className="w-full bg-black border border-[#112019] text-pink-300 text-xs px-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-cyan-400 uppercase font-mono font-bold">Adaptation Cooldown (Turns)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="5" 
                      value={customTechMoves[selectedMoveIdx].cooldown} 
                      onChange={e => {
                        const updated = [...customTechMoves];
                        updated[selectedMoveIdx].cooldown = parseInt(e.target.value) || 0;
                        setCustomTechMoves(updated);
                      }} 
                      className="w-full bg-black border border-[#112019] text-cyan-300 text-xs px-2"
                    />
                  </div>
                </div>

                {/* Specific details depending on type */}
                {customTechMoves[selectedMoveIdx].type === 'strike' && (
                  <div className="p-2 border border-emerald-900 bg-emerald-900/5 rounded-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[7.5px] uppercase text-[#4d7155] font-bold">Scaling Stat</span>
                      <select
                        value={customTechMoves[selectedMoveIdx].scaleStat || 'mst'}
                        onChange={e => {
                          const updated = [...customTechMoves];
                          updated[selectedMoveIdx].scaleStat = e.target.value;
                          setCustomTechMoves(updated);
                        }}
                        className="bg-black text-[9px] w-full text-emerald-400"
                      >
                        <option value="mst">Cursed Magic Output (MST)</option>
                        <option value="str">Physical Brutal Force (STR)</option>
                        <option value="agi">Velocity Speed Acceleration (AGI)</option>
                      </select>
                    </div>
                    <div>
                      <span className="block text-[7.5px] uppercase text-[#4d7155] font-bold">Damage Multiplier</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={customTechMoves[selectedMoveIdx].dmgMult || 1.5} 
                        onChange={e => {
                          const updated = [...customTechMoves];
                          updated[selectedMoveIdx].dmgMult = parseFloat(e.target.value) || 1.2;
                          setCustomTechMoves(updated);
                        }} 
                        className="bg-black text-[9px] w-full text-pink-400"
                      />
                    </div>
                  </div>
                )}

                {/* SCRATCH VISUAL BOARD */}
                {customTechMoves[selectedMoveIdx].type === 'macro_script' && (
                  <div className="border border-purple-950 rounded-xs overflow-hidden flex flex-col md:grid md:grid-cols-12">
                    
                    {/* Block Catalog (Toolbox sidebar) */}
                    <div className="md:col-span-4 bg-purple-950/15 border-r border-purple-950 p-2 space-y-3.5 bg-black">
                      <span className="block text-[8px] text-purple-400 font-extrabold tracking-wider border-b border-purple-900pb-1 uppercase">
                        📂 Scratch Block Toolbox
                      </span>

                      {/* Filter category shortcuts */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        <div>
                          <span className="block text-[7px] text-[#4d7155] uppercase font-bold select-none">Conditional Checks</span>
                          <div className="flex flex-col gap-1 mt-1">
                            {SCRATCH_PALETTE.filter(p => p.category === 'control').map(preset => (
                              <button
                                key={preset.type}
                                type="button"
                                onClick={() => addBlockFromToolbox(preset)}
                                className="px-1.5 py-1 text-left text-[8px] bg-amber-500 hover:bg-amber-400 font-bold border border-amber-600 text-black flex items-center gap-1 leading-none rounded-xs select-none"
                              >
                                <span>{preset.emoji}</span>
                                <span className="truncate">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="block text-[7px] text-[#4d7155] uppercase font-bold select-none">Combat Impact</span>
                          <div className="flex flex-col gap-1 mt-1">
                            {SCRATCH_PALETTE.filter(p => p.category === 'action').map(preset => (
                              <button
                                key={preset.type}
                                type="button"
                                onClick={() => addBlockFromToolbox(preset)}
                                className="px-1.5 py-1 text-left text-[8px] bg-blue-600 hover:bg-blue-500 font-bold border border-blue-700 text-white flex items-center gap-1 leading-none rounded-xs select-none"
                              >
                                <span>{preset.emoji}</span>
                                <span className="truncate">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="block text-[7px] text-[#4d7155] uppercase font-bold select-none">Cursed energy & Matrix</span>
                          <div className="flex flex-col gap-1 mt-1">
                            {SCRATCH_PALETTE.filter(p => p.category === 'matrix').map(preset => (
                              <button
                                key={preset.type}
                                type="button"
                                onClick={() => addBlockFromToolbox(preset)}
                                className="px-1.5 py-1 text-left text-[8px] bg-purple-600 hover:bg-purple-500 font-bold border border-purple-700 text-white flex items-center gap-1 leading-none rounded-xs select-none"
                              >
                                <span>{preset.emoji}</span>
                                <span className="truncate">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Workspace panel */}
                    <div className="md:col-span-8 p-2.5 min-h-[300px] bg-black/80 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-[#1b3c25]/30">
                          <span className="text-[8px] text-neutral-400 tracking-wider">WORKSPACE / CONSTRUCT CHRONOLOGY</span>
                          <span className="text-[7.5px] text-purple-400 uppercase font-bold font-mono">Scratch Block Stack Engine</span>
                        </div>

                        <div className="pt-2 space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
                          {(!customTechMoves[selectedMoveIdx]?.scriptNodes || customTechMoves[selectedMoveIdx].scriptNodes.length === 0) ? (
                            <div className="h-32 flex flex-col justify-center items-center text-center text-[10px] text-purple-900 border border-dashed border-purple-900/30 font-mono italic">
                              No interlocking logic scripts present.
                              <p className="text-[7.5px] text-neutral-600 not-italic mt-1 uppercase font-bold">◄ Click items inside the catalog sidebar on the left to add blocks</p>
                            </div>
                          ) : (
                            <>
                              {(() => {
                                let nestTracker = 0;
                                return customTechMoves[selectedMoveIdx].scriptNodes?.map((node, nIdx) => {
                                  const rendered = renderScratchBlock(node, nIdx, nestTracker);
                                  // Update nest after tracking
                                  if (node.type.startsWith('logic_if_')) {
                                    nestTracker++;
                                  } else if (node.type === 'logic_end_if') {
                                    nestTracker = Math.max(0, nestTracker - 1);
                                  }
                                  return rendered;
                                });
                              })()}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-1 px-2 border-t border-purple-950 mt-4 text-[8px] text-[#4d7155] leading-relaxed select-none">
                        💡 **SCRATCH LOGIC**: Condition checks like `IF` must close with a corresponding `END_IF` block. Inside commands execute sequentially down the track.
                      </div>
                    </div>
                  </div>
                )}

                {customTechMoves[selectedMoveIdx].type === 'summon' && (
                  <div className="p-3 bg-purple-950/10 border border-purple-900/50 rounded-sm text-center">
                    <span className="block text-[9.5px] text-purple-300 font-bold uppercase mb-1">🐾 CONNECTED SHIKIGAMI summon ACTIVE</span>
                    <p className="text-[8.5px] text-neutral-400 italic">
                      Linked: [{customTechMoves[selectedMoveIdx].summonName || 'Shadow Beast'}] species medium. Stats dynamically tied.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('shikigami')}
                      className="mt-2.5 px-3 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-[8.5px] text-white tracking-widest font-bold uppercase rounded-xs"
                    >
                      Open Modular Genesis Core →
                    </button>
                  </div>
                )}

                {customTechMoves[selectedMoveIdx].type === 'speed_frame' && (
                  <div className="p-3 bg-cyan-950/15 border border-cyan-900/50 rounded-sm text-center">
                    <span className="block text-[9.5px] text-cyan-300 font-bold uppercase mb-1">⏱️ 24-FPS VECTOR SEQUENCER EMBEDDED</span>
                    <p className="text-[8.5px] text-neutral-400 italic">
                      Acceleration ratio: {customTechMoves[selectedMoveIdx].speedMultiplier || 1.5}x total gain mapping.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projection')}
                      className="mt-2.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-[8.5px] text-white tracking-widest font-bold uppercase rounded-xs"
                    >
                      Open Timeline Sequencer →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-600 border border-[#112019] rounded-sm">
                No custom move slots currently present. Setup a slot to design custom martial arts!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MODULAR SHIKIGAMI ASSEMBLY CHIMERA */}
      {activeTab === 'shikigami' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Panel: Holographic synthesis Blueprint (SVG visually-focused layout) */}
          <div className="lg:col-span-5 bg-black/60 border border-purple-900/45 p-3.5 space-y-4 rounded-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] text-purple-400 font-black tracking-widest uppercase border-b border-purple-900/40 pb-1.5 flex justify-between">
                <span>🧬 BIOLOGICAL blueprint VECTOR</span>
                <span className="text-[#00ff9c] font-black tracking-normal">SYNTHESIS GRADES</span>
              </h3>

              {/* Assembly blueprint diagram inside beautiful canvas */}
              <div className="relative border border-purple-950 bg-[#020504] h-[200px] rounded-xs flex flex-col justify-center items-center overflow-hidden my-2 border-dashed">
                <div className="absolute top-2 left-2 text-[7.5px] text-[#3b2e4b] font-bold tracking-widest pointer-events-none uppercase">
                  // CHIMERA GENESIS ASSEMBLY STAGE //
                </div>

                {/* Cybernetic overlay concentric lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                  <circle cx="50%" cy="50%" r="40" stroke="#a855f7" strokeWidth="1" fill="none" />
                  <circle cx="50%" cy="50%" r="80" stroke="#a855f7" strokeWidth="1" fill="none" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#a855f7" strokeWidth="0.5" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#a855f7" strokeWidth="0.5" />
                </svg>

                {/* Floating graphic element representing the constructed modules */}
                <div className="flex flex-col items-center gap-1 pb-1 z-10 selection:bg-purple-900">
                  <span className="text-4xl animate-pulse">
                    {shikiSpecies === 'canine' && '🐺'}
                    {shikiSpecies === 'avian' && '🦅'}
                    {shikiSpecies === 'elephant' && '🐘'}
                    {shikiSpecies === 'serpent' && '🐍'}
                    {shikiSpecies === 'toad' && '🐸'}
                    {shikiSpecies === 'phantom' && '👥'}
                    {shikiSpecies === 'colossus' && '👹'}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#00ff9c] text-center max-w-[170px] truncate">{shikiName}</span>
                  <span className="text-[7.5px] px-1 bg-purple-950 border border-purple-900/60 rounded-sm text-purple-300 tracking-wider">
                    {currentBase.name.replace(/.*?\s/, '')} BASE
                  </span>
                </div>

                {/* Display socket indicator hubs */}
                <div className="absolute bottom-2 flex justify-around w-full px-4 border-t border-purple-950/25 pt-2 text-[7px] text-neutral-500 tracking-wider">
                  <div>
                    <span className="text-pink-400">🔴 CREST: </span>
                    <span className="text-neutral-300 uppercase shrink truncate w-24 block">{currentCrest.name.replace(/.*?\s/, '')}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">🟢 LIMB: </span>
                    <span className="text-neutral-300 uppercase shrink truncate w-24 block">{currentAppendage.name.replace(/.*?\s/, '')}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">🟣 CORE: </span>
                    <span className="text-neutral-300 uppercase shrink truncate w-24 block">{currentCore.name.replace(/.*?\s/, '')}</span>
                  </div>
                </div>
              </div>

              {/* Aggregate calculations readout */}
              <div className="space-y-1 bg-purple-950/5 p-2.5 border border-purple-950/30 rounded-xs">
                <span className="block text-[7.5px] uppercase font-bold text-purple-400">// COMPOSITE STATISTICS ANALYSIS //</span>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono leading-none pt-1">
                  <div className="flex justify-between items-center border-b border-purple-950/15 pb-0.5">
                    <span className="text-neutral-400">Vessel Health (HP):</span>
                    <span className="text-white font-bold">{calcHp}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-purple-950/15 pb-0.5">
                    <span className="text-neutral-400">Claw Attack (ATK):</span>
                    <span className="text-white font-bold">{calcAtk}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-purple-950/15 pb-0.5">
                    <span className="text-neutral-400">Occult Magic (MST):</span>
                    <span className="text-white font-bold">{calcMst}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-purple-950/15 pb-0.5">
                    <span className="text-neutral-400">Joint Speed (AGI):</span>
                    <span className="text-white font-bold">{calcAgi}</span>
                  </div>
                  <div className="flex justify-between items-center pb-0.5">
                    <span className="text-neutral-400">Armor Rating (GUARD):</span>
                    <span className="text-amber-300 font-bold">{calcGuard}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={syncActiveMoveWithShikigami}
              className="w-full py-2 bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-500 hover:border-purple-300 text-white font-black tracking-widest text-[10px] uppercase rounded-xs transition shadow-md"
            >
              💾 SYNC BLUEPRINT TO ACTIVE MOVE #{selectedMoveIdx + 1}
            </button>
          </div>

          {/* Right Panel: Modular Assembly Socket choosing Inventory */}
          <div className="lg:col-span-7 bg-black/60 border border-purple-900/45 p-3.5 space-y-4 rounded-sm">
            <div className="flex justify-between items-center border-b border-purple-950 pb-1.5 flex-wrap gap-1.5">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">🧬 assembly sockets inventory catalog</span>
              <span className="text-[8.5px] px-1.5 py-0.5 border border-purple-900 bg-purple-950/25 font-mono text-purple-300 rounded-xs select-none">
                REALLOC POOL: {reallocPointsLeft} PTS LEFT
              </span>
            </div>

            {/* Sockets configuration panels */}
            <div className="space-y-3.5">
              
              {/* Species Core layout */}
              <div>
                <label className="block text-[8px] text-[#4d7155] uppercase font-bold mb-0.5">1. Nomencalture & Species</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={shikiName}
                    onChange={e => setShikiName(e.target.value)}
                    className="bg-black border border-purple-900/70 text-purple-200 px-2.5 py-1 text-xs focus:outline-none focus:border-purple-400 font-bold rounded-xs"
                    placeholder="Custom name..."
                  />
                  <select
                    value={shikiSpecies}
                    onChange={e => { playClick(); setShikiSpecies(e.target.value as keyof typeof SHIKI_SPECIES); }}
                    className="bg-black border border-purple-900/70 text-purple-300 text-[10px] py-1 rounded-xs focus:outline-none w-full"
                  >
                    {Object.entries(SHIKI_SPECIES).map(([k, meta]) => (
                      <option key={k} value={k}>{meta.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Sockets Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5 border-t border-purple-950/20">
                
                {/* Socket 1: Crest Selection */}
                <div className="space-y-1.5">
                  <span className="block text-[7.5px] font-bold text-pink-400 uppercase">🔴 CREST socket option</span>
                  <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-0.5">
                    {SENSORY_CREST_MODULES.map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => { playClick(); setSocketSensory(m.key); }}
                        className={`text-left p-1 rounded-xs border text-[8px] transition-all cursor-pointer ${
                          socketSensory === m.key ? 'border-pink-500 bg-pink-950/25 text-pink-200' : 'border-neutral-900 bg-neutral-950/40 text-neutral-400 hover:border-neutral-800'
                        }`}
                      >
                        <span className="font-bold truncate block">{m.name}</span>
                        <span className="text-[6.5px] opacity-70 block truncate leading-none mt-0.5">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Socket 2: Appendage Selection */}
                <div className="space-y-1.5">
                  <span className="block text-[7.5px] font-bold text-blue-400 uppercase">🟢 Appendage claw option</span>
                  <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-0.5">
                    {APPENDAGE_MODULES.map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => { playClick(); setSocketAppendage(m.key); }}
                        className={`text-left p-1 rounded-xs border text-[8px] transition-all cursor-pointer ${
                          socketAppendage === m.key ? 'border-blue-500 bg-blue-950/25 text-blue-200 font-bold' : 'border-neutral-900 bg-neutral-950/40 text-neutral-400 hover:border-neutral-800'
                        }`}
                      >
                        <span className="font-bold truncate block">{m.name}</span>
                        <span className="text-[6.5px] opacity-70 block truncate leading-none mt-0.5">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Socket 3: Energy Catalyst Selection */}
                <div className="space-y-1.5">
                  <span className="block text-[7.5px] font-bold text-purple-400 uppercase">🟣 Catalyst Resonance Core</span>
                  <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-0.5">
                    {RESONANCE_CORE_MODULES.map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => { playClick(); setSocketCore(m.key); }}
                        className={`text-left p-1 rounded-xs border text-[8px] transition-all cursor-pointer ${
                          socketCore === m.key ? 'border-purple-500 bg-purple-950/25 text-purple-300' : 'border-neutral-900 bg-neutral-950/40 text-neutral-400 hover:border-neutral-800'
                        }`}
                      >
                        <span className="font-bold truncate block">{m.name}</span>
                        <span className="text-[6.5px] opacity-70 block truncate leading-none mt-0.5">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slider Fine Tuning Core */}
              <div className="space-y-2.5 pt-2 border-t border-purple-950/20 bg-purple-950/5 p-2 rounded-xs">
                <span className="block text-[7.5px] font-bold text-amber-500 uppercase">// FINE-TUNE COMPONENT ALLOCATIONS (+{reallocPointsLeft} Spare) //</span>
                
                {/* Loop the stats realloc options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['hp', 'atk', 'mst', 'agi'] as const).map(k => (
                    <div key={k} className="flex justify-between items-center text-[9px] bg-black/60 p-1 px-2 border border-purple-950/40 rounded-xs select-none">
                      <span className="text-neutral-400 uppercase font-bold">{k === 'mst' ? 'Occult Mastery' : k} Score modifier:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustBonusStat(k, false)}
                          className="px-1 text-purple-400 font-extrabold bg-purple-950/25 border border-purple-950 leading-none h-4 w-4 rounded-xs text-[10px] hover:bg-purple-900/30"
                        >
                          -
                        </button>
                        <span className="text-purple-300 font-black font-mono w-5 text-center">+{shikiBonusStats[k]}</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustBonusStat(k, true)}
                          className="px-1 text-purple-400 font-extrabold bg-purple-950/25 border border-purple-950 leading-none h-4 w-4 rounded-xs text-[10px] hover:bg-purple-900/30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 24 FPS SHITTING TIMELINE */}
      {activeTab === 'projection' && (
        <div className="space-y-4">
          <div className="bg-black/60 border border-cyan-900/40 p-3.5 space-y-3 rounded-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-900/40 pb-2.5">
              <div>
                <h3 className="text-[10px] text-cyan-400 font-black tracking-widest uppercase flex items-center gap-1.5">
                  <span>⏱️ PROJECTION 24 FPS VECTORS</span>
                </h3>
                <p className="text-[8.5px] text-[#4d7155] leading-normal mt-0.5">
                  Design micro acceleration kinetic timelines frame-by-frame.
                </p>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0 select-none">
                <button
                  type="button"
                  onClick={() => { playClick(); setFpsOverlordMode(false); }}
                  className={`px-2 py-0.5 text-[8.5px] border ${!fpsOverlordMode ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20' : 'border-neutral-800 text-neutral-500'}`}
                >
                  24 FPS
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setFpsOverlordMode(true); }}
                  className={`px-2 py-0.5 text-[8.5px] border ${fpsOverlordMode ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20' : 'border-neutral-800 text-neutral-500'}`}
                >
                  60 FPS MODE
                </button>
              </div>
            </div>

            {/* Trajectory Grid Preview */}
            <div className="relative border border-cyan-950 bg-black h-[140px] rounded-xs select-none overflow-hidden">
              <svg className="w-full h-full pointer-events-none absolute inset-0">
                <defs>
                  <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00ff9c" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#d946ef" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <polyline fill="none" stroke="url(#glowGrad)" strokeWidth="3" strokeDasharray="3, 3" points={generateTrajectorySVGPath()} />
                {generateTrajectorySVGPath().split(' ').map((pt, pIdx) => {
                  const arr = pt.split(',');
                  const x = parseFloat(arr[0]); const y = parseFloat(arr[1]);
                  if (isNaN(x) || isNaN(y)) return null;
                  return <circle key={pIdx} cx={x} cy={y} r={pIdx === selectedFrame + 1 ? "4.5" : "2.5"} fill={pIdx === selectedFrame + 1 ? "#00ffff" : "#00ff9c"} opacity={pIdx === selectedFrame + 1 ? "1" : "0.5"} />;
                })}
              </svg>

              <div className="absolute bottom-2 right-2 bg-black/80 p-1.5 border border-cyan-950 text-right text-[8.5px]">
                <div>CALIBRATION: <span className="text-[#00ff9c] font-black">{cal.score}%</span></div>
                <div>ACCELERATION: <span className="text-cyan-400 font-mono font-bold">{cal.multiplier}x</span></div>
              </div>
            </div>

            {/* Interval Timeline Sequence */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {fpsSequence.map((posKey, fIdx) => (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => { playClick(); setSelectedFrame(fIdx); }}
                    className={`h-10 border rounded-xs flex flex-col justify-between p-1 cursor-pointer transition ${
                      selectedFrame === fIdx
                        ? 'border-[#00ffff] bg-cyan-950/25'
                        : 'border-neutral-900 bg-black/40 text-neutral-500'
                    }`}
                  >
                    <span className="text-[7px]">F{fIdx + 1}</span>
                    <span className="text-[6.5px] truncate w-full text-center">
                      {posKey === 'null' ? '•' : posKey.substring(0, 4).toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select active sequence */}
            <div className="border border-cyan-900 p-2 bg-cyan-950/5 grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xs">
              <div>
                <span className="text-[8px] text-cyan-300 uppercase font-black">Configure Motion for Frame #{selectedFrame + 1}:</span>
                <div className="grid grid-cols-2 gap-1 mt-1.5">
                  {[
                    { k: 'null', l: 'Buffer Frame' },
                    { k: 'acceleration', l: '🏃 Accel Step' },
                    { k: 'pivot', l: '🌀 Pivot Torque' },
                    { k: 'compression', l: '⚙️ Compression' },
                    { k: 'slipstream', l: '💨 Slipstream' },
                    { k: 'air_step', l: '🌌 Air Step' },
                    { k: 'capture', l: '📸 Snap Capture' },
                    { k: 'release', l: '💥 Release Spark' }
                  ].map(p => (
                    <button
                      key={p.k}
                      onClick={() => handleSetFramePose(p.k)}
                      className={`py-1 px-1.5 border text-[7.5px] font-black uppercase rounded-xs cursor-pointer ${
                        fpsSequence[selectedFrame] === p.k ? 'border-[#00ffff] text-[#00ffff] bg-cyan-950/20' : 'border-neutral-900 bg-neutral-950/40 text-neutral-400'
                      }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <p className="text-[8.5px] leading-relaxed text-neutral-400">
                  Each frame must coordinate kinetic alignments. Transitions are critical to prevent spatial deceleration penalty blocks in active combat grids.
                </p>
                <button
                  type="button"
                  onClick={syncActiveMoveWithProjection}
                  className="w-full mt-2 py-1.5 bg-cyan-950 border border-cyan-500 hover:border-[#00ff9c] text-cyan-300 hover:text-[#00ff9c] text-[9.5px] font-black uppercase tracking-widest cursor-pointer"
                >
                  💾 MAP 24-FPS MOMENTUM TO MOVE #{selectedMoveIdx + 1}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
