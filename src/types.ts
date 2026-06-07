/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StatSet {
  str: number;
  agi: number;
  int: number;
  cha: number;
  mst: number;
  end: number;
  lck: number;
  ce: number;
}

export type StatName = keyof StatSet;

export interface EraDefinition {
  key: string;
  name: string;
  years: string;
  y0: number;
  desc: string;
}

export interface TypeDefinition {
  key: string;
  label: string;
  emoji: string;
  desc: string;
}

export interface ClanDefinition {
  key: string;
  name: string;
  ln: string;
  pts: number;
  desc: string;
  bon?: Partial<StatSet>;
}

export interface TechniqueDefinition {
  key: string;
  name: string;
  pts: number;
  desc: string;
  arch: 'destruction' | 'utility' | 'lethal' | 'barrier' | 'binding' | 'unknown';
}

export interface UpbringingDefinition {
  key: string;
  name: string;
  bon?: Partial<StatSet>;
  pen?: Partial<StatSet>;
  desc: string;
}

export interface CeExposureDefinition {
  key: string;
  name: string;
  ceB: number;
  mstB: number;
  desc: string;
}

export interface TrainingRegimen {
  key: string;
  name: string;
  eff: string;
  mo: number;
  stat: StatName | 'ce';
  ex?: {
    hpB?: number;
    xpB?: number;
    ceB?: number;
    [key: string]: number | undefined;
  };
  desc: string;
}

export interface EnemyTemplate {
  name: string;
  grade: string;
  hp: [number, number];
  ce: [number, number];
  str: [number, number];
  agi: [number, number];
  mst: [number, number];
  xp: number;
  cr: [number, number];
  isShikigami?: boolean;
  shikiKey?: string;
}

export interface DialogueChoice {
  t: string; // The choice text / dialogue line
  todoKey?: string; // Special key for Todo Aoi's question
  r: string; // The result description
  ef?: (G: GameState) => void; // Side effects on game state
}

export interface LifeEvent {
  id: string;
  age: [number, number] | null; // Eligible range, null for any
  era: string | null; // e.g. "heian|sengoku" or null
  w?: number; // Weight
  title: string;
  cat: 'neutral' | 'jujutsu' | 'combat' | 'training' | 'social';
  text: string;
  chips?: Array<{ l: string; c: 'pos' | 'neg' | 'neu' }>;
  choices: DialogueChoice[] | null;
  ef?: (G: GameState) => void;
  repeat?: boolean;
}

export interface NpcBond {
  name: string;
  rel: string; // "Father" | "Mother" | "Friend" | "Rival" | "Enemy" | "Best Friend" | "Mentor" | "Romance" | "Spouse" | "Child" | "Adopted Child"
  bond: number;     // 0 - 100
  trust: number;    // 0 - 100
  respect: number;  // 0 - 100
  fear: number;     // 0 - 100
  gender: 'M' | 'F';
  romance?: number; // 0 - 100 (Unlocks if flirting)
  knownYears?: number;
  marriedYears?: number;
  isSpouse?: boolean;
  yearsDated?: number;
  monthsPregnant?: number; // Tracks 9 months child progress when married and start family
  famous?: boolean;
}

export interface ActiveQuest {
  title: string;
  status: 'active' | 'complete';
}

export interface InventoryItem {
  name: string;
  qty: number;
}

export type TechScriptNodeType = 
  | 'action_strike'
  | 'action_approach'
  | 'action_summon'
  | 'action_summon_modular'
  | 'action_unsummon'
  | 'action_heal'
  | 'action_buff_self'
  | 'action_debuff_target'
  | 'action_teleport_behind'
  | 'action_stun_target'
  | 'action_domain_expansion'
  | 'action_play_sound'
  | 'action_burn_target'
  | 'action_frost_target'
  | 'action_drain_ce'
  | 'action_blood_manipulation'
  | 'action_black_flash_check'
  | 'logic_if_distance'
  | 'logic_if_shikigami'
  | 'logic_if_self_hp'
  | 'logic_if_enemy_hp'
  | 'logic_if_ce'
  | 'logic_if_stunned'
  | 'logic_if_turn_count'
  | 'logic_else'
  | 'logic_end_if';

export interface TechScriptNode {
  id: string;
  type: TechScriptNodeType;
  paramDist?: number; // distance threshold or approach limit
  paramName?: string; // shikigami name or target name
  paramName2?: string; // secondary condition
  paramDmgMult?: number;
  paramHealAmt?: number;
  paramSecondary?: string;
  paramStatChange?: number; // buff/debuff amount
  paramHpThreshold?: number; // percentage or flat
  paramTurnTreshold?: number;
  
  // Custom summon params
  summonHp?: number;
  summonAtk?: number;
  summonMst?: number;
  summonAgi?: number;
}

export interface CustomTechMove {
  id: string;
  name: string;
  type: 'strike' | 'summon' | 'speed_frame' | 'curse_law' | 'macro_script';
  ceCost: number;
  cooldown: number;
  
  // Script / Routine based
  scriptNodes?: TechScriptNode[];

  // Strike parameters
  dmgMult?: number;
  scaleStat?: string;
  minDmg?: number;
  maxDmg?: number;
  secondary?: string;

  // Summon parameters
  summonName?: string;
  summonType?: string; // tiger, avian, canine, phantom, colossus
  summonHp?: number;
  summonAtk?: number;
  summonMst?: number;
  summonAgi?: number;
  summonPassive?: string; // totality, paralysis, shield_intercept, adaptive_gauge

  // Speed Frame/Projection Parameters
  fpsLimit?: number; // 24, 60
  speedMultiplier?: number; // 1.5, 2.0
  speedAction?: string; // stack_agi, freeze_frame, loop_dodge

  // Curse Law Parameters
  lawType?: string; // cost_reduction, double_snap, kinetic_store, counter_charge
  lawEffectDescription?: string;
}

export interface CustomDomainDef {
  name: string;
  handSign: string; // Infinite Mudra, Ganesha Clasp, Enma Join, Prithvi Mudra, None
  environment: string; // Submerged Abyssal Temple, Infinite Mirror Hall, Molten Gehenna Furnace, Garden of Pure Dew Drops, Asylum of Judgement
  barrierRule: string; // open_barrier, time_locked, deadly_court, sumo_ring, standard
  sureHitSpell: string; // stun, bypass, siphon, chaos, burn_dot, tech_seal, physical_duel
  visualAura: string; // purple_abyss, crimson_blood, neon_lines, gold_buddhism, carbon_furnace
}

export interface CustomTechDef {
  name: string;
  arch: string;
  dmgMult: number;
  secondary: string;
  hasDomain: boolean;
  domainName: string;
  domainSureHit: string;
  ceCost?: number;
  vowBinding?: string;
  visualTheme?: string;
  scaleStat?: string;
  minDmg?: number;
  maxDmg?: number;
  cooldown?: number;
  // NEW ADVANCED MODULAR FIELDS
  moves?: CustomTechMove[];
  domainCustom?: CustomDomainDef;
}

export interface GameState {
  name: string;
  lastName: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  age: number;
  birthYear: number;
  birthMonth: number;
  curYear: number;
  curMonth: number;
  era: string;
  eraDef: EraDefinition | null;

  hp: number;
  maxHp: number;
  ce: number;
  maxCe: number;
  stats: StatSet;

  xp: number;
  level: number;
  xpToNext: number;
  rank: string;
  rankIndex: number;
  credits: number;
  rebirths: number;

  clanKey: string;
  clanName: string;
  techKey: string;
  techName: string;
  customTechDef?: CustomTechDef;
  upbringing: string;
  ceExp: string;
  girlType: string;

  restriction: 'none' | 'toji' | 'mechamaru';

  flags: Record<string, boolean>;
  npcs: NpcBond[];
  quests: ActiveQuest[];
  inventory: InventoryItem[];
  seenEvents: string[];

  pendingChoice: boolean;
  isDead: boolean;
  inCombat: boolean;
  godMode: boolean;
  reputation: number;
  currentSchool?: string;
  dojoTrust?: number;
  copiedTechKey?: string;
}
