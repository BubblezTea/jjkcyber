/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EraDefinition,
  TypeDefinition,
  ClanDefinition,
  TechniqueDefinition,
  UpbringingDefinition,
  CeExposureDefinition,
  TrainingRegimen,
  EnemyTemplate,
  LifeEvent,
  GameState
} from '../types';

export const ERAS: EraDefinition[] = [
  { key: 'heian', name: 'Heian Era', years: '794–1185', y0: 900, desc: 'Ancient Japan. Ryomen Sukuna walks the earth. Curses roam unchecked.' },
  { key: 'sengoku', name: 'Sengoku Era', years: '1467–1615', y0: 1500, desc: 'Warring states. Sorcerers serve warlords as lethal hidden assets.' },
  { key: 'edo', name: 'Edo Era', years: '1603–1868', y0: 1660, desc: 'Uneasy peace. Jujutsu clans consolidate. The world starts closing off.' },
  { key: 'meiji', name: 'Meiji Era', years: '1868–1912', y0: 1875, desc: 'Modernization. The sorcerer world is forced underground to survive.' },
  { key: 'showa', name: 'Showa Era', years: '1926–1989', y0: 1960, desc: 'Post-war Japan. Jujutsu High takes its current form. Gojo Satoru is born.' },
  { key: 'modern', name: 'Modern Era', years: '1989–2017', y0: 1995, desc: 'The age of Gojo Satoru. The strongest changes everything.' },
  { key: 'shibuya', name: 'Post-Shibuya Era', years: '2018–', y0: 2019, desc: 'The incident shattered the world. Ancient powers resurface in the chaos.' },
];

export const TYPES: TypeDefinition[] = [
  { key: 'tall', label: 'Tall & Voluptuous', emoji: '💃', desc: 'A tall girl. With a big chest.' },
  { key: 'cute', label: 'Small & Cute', emoji: '🌸', desc: 'Short, soft, and adorable.' },
  { key: 'cool', label: 'Cool & Aloof', emoji: '❄️', desc: 'Distant, mysterious, unreadable.' },
  { key: 'smart', label: 'Smart & Studious', emoji: '📚', desc: 'Sharp mind. Always reading something.' },
  { key: 'athletic', label: 'Athletic & Strong', emoji: '⚡', desc: 'Competitive. Built. Never backs down.' },
  { key: 'nocare', label: 'No Preference', emoji: '🎲', desc: 'Personality is what matters.' },
];

export const CLANS: ClanDefinition[] = [
  { key: 'none', name: 'No Clan', ln: '', pts: 0, desc: 'No lineage. Your birth name stands alone.', bon: { lck: 1 } },
  { key: 'zenin', name: 'Zenin', ln: 'Zenin', pts: 25, desc: 'Elite martial sorcerers. Physical power above all else.', bon: { str: 3, end: 2 } },
  { key: 'gojo', name: 'Gojo', ln: 'Gojo', pts: 40, desc: 'Sugawara descendants. Has a 1% chance at birth to inherit the Six Eyes (99.99% CE reduction. If born in Satoru\'s era, you must duel him to seize it!)', bon: { ce: 5, mst: 3 } },
  { key: 'kamo', name: 'Kamo', ln: 'Kamo', pts: 20, desc: 'Traditionalists. Blood technique mastery carried in the genes.', bon: { mst: 3, end: 2 } },
  { key: 'inumaki', name: 'Inumaki', ln: 'Inumaki', pts: 15, desc: 'The snake and fangs seal. Fragile bodies, but words kill.', bon: { mst: 2, int: 2 } },
  { key: 'sugawara', name: 'Sugawara', ln: 'Sugawara', pts: 35, desc: 'Vengeful Spirit lineage. Ancient, massive CE potential.', bon: { ce: 4, mst: 3 } },
  { key: 'abe', name: 'Abe', ln: 'Abe', pts: 25, desc: 'Masters of barriers and deep scholastic jujutsu.', bon: { int: 3, mst: 3 } },
  { key: 'fujiwara', name: 'Fujiwara', ln: 'Fujiwara', pts: 20, desc: 'Aristocratic lineage. Vast political reach and cursed resources.', bon: { cha: 3, int: 2 } },
  { key: 'itadori', name: 'Itadori', ln: 'Itadori', pts: 30, desc: 'Anomalous genetics. Superhuman physicals from birth.', bon: { str: 4, end: 3 } },
  { key: 'fushiguro', name: 'Fushiguro', ln: 'Fushiguro', pts: 20, desc: 'Family bearing Ten Shadows potential. Hidden power.', bon: { mst: 2, int: 2, agi: 1 } },
  { key: 'okkotsu', name: 'Okkotsu', ln: 'Okkotsu', pts: 30, desc: 'Tragedy bonded to overwhelming power. Special potential.', bon: { ce: 3, str: 2, mst: 2 } },
  { key: 'geto', name: 'Geto', ln: 'Geto', pts: 30, desc: 'Rare talent for cursed spirit manipulation.', bon: { mst: 4, ce: 2 } },
  { key: 'hoshi', name: 'Hoshi', ln: 'Hoshi', pts: 15, desc: 'Star-gazers and masters of spatial distortion.', bon: { int: 2, mst: 2 } },
  { key: 'ashiya', name: 'Ashiya', ln: 'Ashiya', pts: 15, desc: 'Masters of simple domains and anti-domain techniques.', bon: { mst: 3, end: 1 } },
  { key: 'kusakabe', name: 'Kusakabe', ln: 'Kusakabe', pts: 10, desc: 'Non-special-grade but never quit. Simple domain experts.', bon: { end: 2, agi: 1 } },
  { key: 'nanami', name: 'Nanami', ln: 'Nanami', pts: 10, desc: 'Ordinary family. High results through efficiency & overtime.', bon: { end: 3, str: 1 } },
  { key: 'todo', name: 'Todo', ln: 'Todo', pts: 10, desc: 'Rough upbringing forged raw power. Instinct over academic rules.', bon: { str: 3, agi: 1 } },
  { key: 'miwa', name: 'Miwa', ln: 'Miwa', pts: 10, desc: 'Simple background. Genuine effort. Keen blade instincts.', bon: { agi: 2, str: 1 } },
  { key: 'ryomen', name: 'Ryomen', ln: 'Ryomen', pts: 50, desc: 'LEGENDARY. The King of Curses\' bloodline. Ancient terror.', bon: { ce: 6, str: 4, mst: 4 } },
];

export const TECHNIQUES: TechniqueDefinition[] = [
  { key: 'random', name: 'Natural Awakening', pts: 0, desc: 'Manifests naturally in childhood. Unknown potential.', arch: 'unknown' },
  { key: 'limitless', name: 'Limitless', pts: 40, desc: 'Control space at the atomic level. Infinity, Red, Blue, Purple.', arch: 'utility' },
  { key: 'ten_shad', name: 'Ten Shadows Technique', pts: 30, desc: 'Summon ten divine shikigami through shadow mediums.', arch: 'utility' },
  { key: 'blood', name: 'Blood Manipulation', pts: 20, desc: 'Complete control over blood. Piercing Blood, Convergence.', arch: 'destruction' },
  { key: 'speech', name: 'Cursed Speech', pts: 20, desc: 'Words enforced by cursed energy. Commands bind reality itself.', arch: 'binding' },
  { key: 'ratio', name: 'Ratio Technique', pts: 15, desc: 'Divide targets 3:7. Direct hit on the partition point is fatal.', arch: 'lethal' },
  { key: 'shrine', name: 'Shrine', pts: 35, desc: 'Slashing techniques that cut whatever you target. Cleave, Dismantle.', arch: 'destruction' },
  { key: 'boogie', name: 'Boogie Woogie', pts: 15, desc: 'Swap places of any two things bearing cursed energy with a clap.', arch: 'utility' },
  { key: 'idle', name: 'Idle Transfiguration', pts: 35, desc: 'Reshape human souls. Transform biology directly.', arch: 'binding' },
  { key: 'star', name: 'Star Rage', pts: 30, desc: 'Compress massive weight into physical strikes or Shikigami mass.', arch: 'destruction' },
  { key: 'construct', name: 'Construction', pts: 35, desc: 'Manifest materials and items into reality from absolute nothingness.', arch: 'utility' },
  { key: 'ice', name: 'Ice Formation', pts: 25, desc: 'Condense and weaponise water molecules at absolute zero.', arch: 'barrier' },
  { key: 'copy', name: 'Copy', pts: 45, desc: 'Perfectly duplicate other techniques you observe. The ultimate utility.', arch: 'utility' },
  { key: 'flames', name: 'Disaster Flames', pts: 30, desc: 'Generate eruptive cursed flames of pure volcanic annihilation.', arch: 'destruction' },
  { key: 'straw', name: 'Straw Doll Technique', pts: 15, desc: 'Damage nails pierce distant targets through cursed effigies.', arch: 'lethal' },
  { key: 'project', name: 'Projection Sorcery', pts: 25, desc: 'Pre-calculate movements and execute at 24 frames per second.', arch: 'utility' },
  { key: 'divfist', name: 'Divergent Fist', pts: 20, desc: 'Impact strikes first, followed instantly by a delayed heavy CE surge.', arch: 'destruction' },
  { key: 'gravity', name: 'Gravity Control', pts: 30, desc: 'Manipulate gravitational forces on objects and environments.', arch: 'binding' },
  { key: 'invspear', name: 'Inverted Spear of Heaven', pts: 45, desc: 'Nullify any active cursed technique instantly upon touch.', arch: 'utility' },
  { key: 'bflash', name: 'Black Flash Focus', pts: 25, desc: 'Innate mastery of Black Flash syncing. Space distortions feel natural.', arch: 'destruction' },
];

export const UPBRINGINGS: UpbringingDefinition[] = [
  { key: 'sorcerer', name: 'Sorcerer Household', bon: { mst: 2, ce: 1 }, pen: { cha: -1, lck: -1 }, desc: 'Born into jujutsu. Training before you could walk. The path was never a choice.' },
  { key: 'noble', name: 'Noble House', bon: { cha: 2, int: 1 }, pen: { str: -1, end: -1 }, desc: 'Privilege and refinement. Politics over battlefield power. You know how to persuade.' },
  { key: 'orphan', name: 'Street Orphan', bon: { agi: 2, lck: 1 }, pen: { int: -1, mst: -1 }, desc: 'No safety net. You learned fast or you went hungry. Survival is your specialty.' },
  { key: 'military', name: 'Military Household', bon: { str: 2, end: 2 }, pen: { int: -1, lck: -1 }, desc: 'Strict structure. Weakness was never tolerated in your compound.' },
  { key: 'scholar', name: 'Scholarly Family', bon: { int: 2, mst: 1 }, pen: { str: -1, end: -1 }, desc: 'Books before brawls. You understand jujutsu theory better than old sorcerers.' },
  { key: 'incident', name: 'Cursed Incident', bon: { ce: 2, mst: 1 }, pen: { cha: -1, lck: -2 }, desc: 'A rogue curse attacked your family. You barely survived, but it awoke you.' },
  { key: 'normal', name: 'Normal Family', bon: { lck: 1 }, pen: {}, desc: 'Stable, peaceful upbringing. Your potential was entirely your own to trace.' },
];

export const CE_EXPOSURES: CeExposureDefinition[] = [
  { key: 'none', name: 'None', ceB: -3, mstB: -1, desc: 'No CE detected at birth. Late-blooming or zero visual sensory.' },
  { key: 'trace', name: 'Trace', ceB: -1, mstB: 0, desc: 'Barely detectable readings. Weak potential or a sleepy lineage.' },
  { key: 'low', name: 'Low', ceB: 0, mstB: 0, desc: 'Below average, but present. Innate potentials can still strike.' },
  { key: 'mod', name: 'Moderate', ceB: 1, mstB: 0, desc: 'Average sorcerer parameters. Fully equipped to survive.' },
  { key: 'high', name: 'High', ceB: 2, mstB: 1, desc: 'Significant readings. Active cursed technique manifests early.' },
  { key: 'ext', name: 'Extreme', ceB: 4, mstB: 2, desc: 'Frightening readings. The sorcerer clan took note immediately.' },
  { key: 'over', name: 'Overwhelming', ceB: 6, mstB: 3, desc: 'SPECIAL GRADE POTENTIAL. Your birth caused standard records to burst.' },
];

export const TRAINING_REGIMENS: TrainingRegimen[] = [
  { key: 'phys', name: 'Physical Conditioning', eff: 'STR +1', mo: 3, stat: 'str', ex: {}, desc: 'Spar, lift, sprint. Forge the body into a durable physical weapon.' },
  { key: 'tech', name: 'Technique Exercises', eff: 'MST +1', mo: 3, stat: 'mst', ex: {}, desc: 'Spend hours refining manual triggers of your innate technique.' },
  { key: 'end', name: 'Pain Tolerance Study', eff: 'END +1, Max HP +5', mo: 2, stat: 'end', ex: { hpB: 5 }, desc: 'Push your limits. Suppress pain using physical focus.' },
  { key: 'study', name: 'Sorcery Literature', eff: 'INT +1', mo: 2, stat: 'int', ex: {}, desc: 'Read scrolls on barriers, bindings, and anti-domain principles.' },
  { key: 'social', name: 'Influence Building', eff: 'CHA +1', mo: 2, stat: 'cha', ex: {}, desc: 'Connect with local factions. Build your name and reputation.' },
  { key: 'med', name: 'CE Flow Meditation', eff: 'CE +1, Max CE +5', mo: 3, stat: 'ce', ex: { ceB: 5 }, desc: 'Realign your perspective. Direct cursed energy continuously.' },
  { key: 'spar', name: 'Pro Combat Sparring', eff: 'AGI +1, +15 XP', mo: 2, stat: 'agi', ex: { xpB: 15 }, desc: 'Trade heavy physical blows with senior sorcerers or cursed dolls.' },
];

export const ENEMIES: EnemyTemplate[] = [
  // --- GRADE 4 (20 enemies) ---
  { name: "Sewer Parasite", grade: "Grade 4", hp: [20, 35], ce: [5, 10], str: [1, 3], agi: [2, 4], mst: [1, 2], xp: 10, cr: [1, 4] },
  { name: "Cabinet Fly-Head Cluster", grade: "Grade 4", hp: [15, 30], ce: [4, 8], str: [1, 2], agi: [4, 6], mst: [1, 2], xp: 10, cr: [1, 4] },
  { name: "Attic Dust Creeper", grade: "Grade 4", hp: [22, 36], ce: [6, 12], str: [2, 3], agi: [2, 3], mst: [1, 2], xp: 12, cr: [2, 5] },
  { name: "Finger Bearer (Spawn)", grade: "Grade 4", hp: [30, 55], ce: [10, 20], str: [3, 6], agi: [3, 5], mst: [2, 4], xp: 20, cr: [3, 10] },
  { name: "Grasshopper Curse", grade: "Grade 4", hp: [25, 45], ce: [8, 18], str: [2, 5], agi: [5, 9], mst: [2, 4], xp: 15, cr: [2, 8] },
  { name: "Shadow Swarm Infant", grade: "Grade 4", hp: [18, 32], ce: [5, 11], str: [1, 3], agi: [3, 5], mst: [1, 3], xp: 11, cr: [2, 5] },
  { name: "Crying Face Spider", grade: "Grade 4", hp: [26, 42], ce: [7, 14], str: [2, 4], agi: [4, 7], mst: [2, 3], xp: 14, cr: [3, 6] },
  { name: "Wall-Crawl Phantom", grade: "Grade 4", hp: [20, 38], ce: [6, 13], str: [2, 4], agi: [3, 6], mst: [1, 3], xp: 13, cr: [2, 6] },
  { name: "Grumbling Dog Spirit", grade: "Grade 4", hp: [28, 48], ce: [9, 16], str: [3, 5], agi: [4, 8], mst: [2, 4], xp: 16, cr: [3, 8] },
  { name: "Window Whisperer", grade: "Grade 4", hp: [16, 28], ce: [12, 22], str: [1, 2], agi: [2, 5], mst: [3, 5], xp: 15, cr: [3, 7] },
  { name: "Street Fly Crawl", grade: "Grade 4", hp: [18, 30], ce: [5, 10], str: [1, 3], agi: [3, 6], mst: [1, 2], xp: 11, cr: [1, 4] },
  { name: "Vending Machine Moth", grade: "Grade 4", hp: [20, 34], ce: [6, 12], str: [2, 3], agi: [4, 7], mst: [1, 3], xp: 12, cr: [2, 5] },
  { name: "Wandering Slime Pup", grade: "Grade 4", hp: [25, 44], ce: [8, 15], str: [2, 4], agi: [2, 4], mst: [2, 3], xp: 13, cr: [2, 6] },
  { name: "Cottage Rust Leech", grade: "Grade 4", hp: [22, 36], ce: [5, 10], str: [2, 4], agi: [2, 5], mst: [1, 2], xp: 12, cr: [2, 5] },
  { name: "Alleyway Eye Cluster", grade: "Grade 4", hp: [15, 30], ce: [10, 18], str: [1, 2], agi: [3, 5], mst: [2, 4], xp: 14, cr: [2, 6] },
  { name: "Lost Toy Imp", grade: "Grade 4", hp: [24, 40], ce: [8, 14], str: [2, 4], agi: [4, 6], mst: [2, 4], xp: 15, cr: [3, 7] },
  { name: "Mirror Mimic Hatchling", grade: "Grade 4", hp: [19, 32], ce: [7, 13], str: [2, 3], agi: [3, 5], mst: [2, 3], xp: 13, cr: [2, 5] },
  { name: "Graveyard Spade Imp", grade: "Grade 4", hp: [28, 46], ce: [6, 12], str: [3, 5], agi: [2, 4], mst: [1, 3], xp: 14, cr: [3, 7] },
  { name: "Mold Spore Larva", grade: "Grade 4", hp: [21, 35], ce: [8, 14], str: [1, 3], agi: [3, 5], mst: [2, 3], xp: 12, cr: [2, 5] },
  { name: "Dojo Novice Target", grade: "Grade 4", hp: [35, 60], ce: [5, 15], str: [3, 5], agi: [3, 6], mst: [1, 3], xp: 18, cr: [4, 8] },

  // --- GRADE 3 (20 enemies) ---
  { name: "Tongue Twister Curse", grade: "Grade 3", hp: [60, 95], ce: [20, 38], str: [5, 10], agi: [5, 8], mst: [4, 7], xp: 40, cr: [8, 20] },
  { name: "Inherited Curse Beast", grade: "Grade 3", hp: [80, 120], ce: [25, 45], str: [9, 14], agi: [8, 13], mst: [5, 9], xp: 60, cr: [10, 24] },
  { name: "Transfigured Corpse", grade: "Grade 3", hp: [70, 100], ce: [15, 30], str: [8, 13], agi: [4, 7], mst: [3, 6], xp: 50, cr: [8, 18] },
  { name: "Screaming Banshee Puppet", grade: "Grade 3", hp: [65, 85], ce: [22, 40], str: [4, 8], agi: [6, 11], mst: [4, 8], xp: 45, cr: [9, 19] },
  { name: "Weeping Doll Curse", grade: "Grade 3", hp: [55, 80], ce: [28, 46], str: [4, 7], agi: [5, 9], mst: [5, 9], xp: 48, cr: [10, 22] },
  { name: "Lesser Shadow Hound", grade: "Grade 3", hp: [72, 105], ce: [18, 32], str: [7, 12], agi: [7, 12], mst: [3, 7], xp: 52, cr: [9, 21] },
  { name: "Hospital Plinth Lurker", grade: "Grade 3", hp: [68, 98], ce: [24, 42], str: [6, 10], agi: [4, 7], mst: [4, 8], xp: 46, cr: [8, 19] },
  { name: "Classroom Fear Geist", grade: "Grade 3", hp: [58, 90], ce: [30, 50], str: [4, 8], agi: [6, 10], mst: [6, 10], xp: 50, cr: [10, 23] },
  { name: "Sewer Octopus Swarm", grade: "Grade 3", hp: [82, 115], ce: [20, 36], str: [8, 12], agi: [5, 8], mst: [4, 7], xp: 55, cr: [11, 25] },
  { name: "Kyoto Pre-School Rookie", grade: "Grade 3", hp: [75, 100], ce: [25, 45], str: [6, 11], agi: [7, 11], mst: [5, 8], xp: 58, cr: [12, 26] },
  { name: "Feral Cursed Boar", grade: "Grade 3", hp: [85, 125], ce: [12, 24], str: [9, 15], agi: [5, 8], mst: [2, 5], xp: 54, cr: [9, 21] },
  { name: "Library Paper Wisp", grade: "Grade 3", hp: [50, 78], ce: [32, 52], str: [3, 6], agi: [8, 12], mst: [6, 11], xp: 49, cr: [10, 22] },
  { name: "Chalkboard Ghoul", grade: "Grade 3", hp: [62, 92], ce: [20, 35], str: [6, 9], agi: [5, 9], mst: [4, 7], xp: 45, cr: [8, 18] },
  { name: "Subway Ticket Mimic", grade: "Grade 3", hp: [56, 88], ce: [22, 38], str: [5, 8], agi: [6, 10], mst: [4, 8], xp: 47, cr: [9, 20] },
  { name: "Forgotten Umbrella Sprite", grade: "Grade 3", hp: [60, 90], ce: [24, 40], str: [4, 8], agi: [7, 11], mst: [5, 9], xp: 46, cr: [9, 20] },
  { name: "Iron Wire Spider", grade: "Grade 3", hp: [70, 102], ce: [16, 28], str: [7, 11], agi: [8, 12], mst: [3, 6], xp: 52, cr: [10, 22] },
  { name: "Alleyway Fence Ghoul", grade: "Grade 3", hp: [66, 94], ce: [18, 30], str: [6, 10], agi: [5, 8], mst: [4, 7], xp: 48, cr: [8, 19] },
  { name: "Crying Infant Phantom", grade: "Grade 3", hp: [52, 82], ce: [34, 54], str: [3, 6], agi: [6, 9], mst: [7, 12], xp: 51, cr: [11, 24] },
  { name: "Rogue Paper-Seal Beast", grade: "Grade 3", hp: [78, 110], ce: [20, 40], str: [8, 13], agi: [7, 10], mst: [4, 8], xp: 56, cr: [10, 23] },
  { name: "Dojo Sparring Squire", grade: "Grade 3", hp: [90, 130], ce: [20, 40], str: [8, 13], agi: [7, 11], mst: [4, 8], xp: 60, cr: [15, 30] },

  // --- GRADE 2 (20 enemies) ---
  { name: "Womb Wraith", grade: "Grade 2", hp: [110, 155], ce: [38, 58], str: [8, 14], agi: [6, 10], mst: [6, 10], xp: 85, cr: [15, 35] },
  { name: "Death Painting Womb", grade: "Grade 2", hp: [125, 165], ce: [42, 65], str: [10, 16], agi: [8, 12], mst: [8, 13], xp: 100, cr: [18, 40] },
  { name: "Curse User Rogue", grade: "Grade 2", hp: [95, 135], ce: [42, 68], str: [7, 12], agi: [8, 13], mst: [9, 14], xp: 90, cr: [20, 45] },
  { name: "Screaming Golem Curse", grade: "Grade 2", hp: [140, 185], ce: [30, 50], str: [12, 17], agi: [5, 8], mst: [5, 9], xp: 95, cr: [20, 44] },
  { name: "Bouncing Pig-Face Fiend", grade: "Grade 2", hp: [120, 160], ce: [35, 55], str: [9, 14], agi: [9, 14], mst: [6, 11], xp: 92, cr: [17, 38] },
  { name: "Haruta Shigemo (Rogue)", grade: "Grade 2", hp: [100, 140], ce: [40, 65], str: [8, 13], agi: [11, 16], mst: [8, 13], xp: 105, cr: [25, 50] },
  { name: "Mei Mei's Trained Crow", grade: "Grade 2", hp: [80, 115], ce: [50, 75], str: [6, 10], agi: [14, 20], mst: [11, 16], xp: 110, cr: [22, 48] },
  { name: "Aizu Shadow Disciple", grade: "Grade 2", hp: [115, 150], ce: [36, 56], str: [10, 14], agi: [10, 14], mst: [8, 12], xp: 98, cr: [18, 42] },
  { name: "Ganeshan Light Demon", grade: "Grade 2", hp: [130, 175], ce: [45, 70], str: [11, 15], agi: [7, 11], mst: [9, 14], xp: 100, cr: [21, 46] },
  { name: "Bloody Scythe User", grade: "Grade 2", hp: [105, 145], ce: [38, 62], str: [11, 16], agi: [9, 13], mst: [7, 11], xp: 95, cr: [20, 45] },
  { name: "Tangled Iron Maiden", grade: "Grade 2", hp: [150, 195], ce: [32, 52], str: [13, 18], agi: [4, 7], mst: [6, 10], xp: 97, cr: [20, 45] },
  { name: "Kyoto Second-Year Miwa", grade: "Grade 2", hp: [110, 145], ce: [34, 54], str: [9, 13], agi: [10, 14], mst: [7, 11], xp: 96, cr: [20, 45] },
  { name: "Kyoto Second-Year Mai", grade: "Grade 2", hp: [90, 130], ce: [24, 44], str: [9, 14], agi: [9, 13], mst: [8, 12], xp: 94, cr: [19, 42] },
  { name: "Rogue Cursed Toad", grade: "Grade 2", hp: [120, 160], ce: [30, 50], str: [8, 13], agi: [8, 12], mst: [6, 10], xp: 90, cr: [15, 35] },
  { name: "Cursed Mechamaru Scout", grade: "Grade 2", hp: [80, 120], ce: [120, 180], str: [7, 12], agi: [9, 13], mst: [11, 16], xp: 110, cr: [25, 55] },
  { name: "Rampaging Bull Curse", grade: "Grade 2", hp: [160, 210], ce: [20, 40], str: [14, 20], agi: [5, 8], mst: [4, 7], xp: 105, cr: [22, 48] },
  { name: "Ghostly Lantern Geist", grade: "Grade 2", hp: [100, 140], ce: [55, 80], str: [6, 10], agi: [8, 12], mst: [10, 15], xp: 102, cr: [21, 46] },
  { name: "Zenin Clan Guard Rookie", grade: "Grade 2", hp: [125, 165], ce: [24, 44], str: [11, 15], agi: [9, 13], mst: [5, 9], xp: 97, cr: [18, 40] },
  { name: "Lesser Smallpox Devotee", grade: "Grade 2", hp: [135, 175], ce: [50, 75], str: [9, 14], agi: [6, 10], mst: [9, 14], xp: 104, cr: [23, 50] },
  { name: "Dojo Master Instructor", grade: "Grade 2", hp: [140, 190], ce: [50, 80], str: [12, 17], agi: [11, 15], mst: [10, 14], xp: 120, cr: [30, 60] },

  // --- GRADE 1 (20 enemies) ---
  { name: "Vengeful Spirit", grade: "Grade 1", hp: [170, 215], ce: [58, 85], str: [13, 18], agi: [10, 15], mst: [11, 16], xp: 160, cr: [30, 65] },
  { name: "Chimera Cursed Beast", grade: "Grade 1", hp: [175, 215], ce: [65, 98], str: [12, 18], agi: [13, 18], mst: [14, 20], xp: 180, cr: [38, 75] },
  { name: "Rival Sorcerer", grade: "Grade 1", hp: [160, 200], ce: [60, 90], str: [11, 17], agi: [12, 17], mst: [12, 18], xp: 170, cr: [35, 70] },
  { name: "Eso (Death Painting)", grade: "Grade 1", hp: [180, 230], ce: [70, 105], str: [13, 19], agi: [12, 16], mst: [13, 18], xp: 190, cr: [40, 80] },
  { name: "Kechizu (Death Painting)", grade: "Grade 1", hp: [165, 210], ce: [60, 90], str: [14, 20], agi: [11, 15], mst: [11, 16], xp: 175, cr: [35, 75] },
  { name: "Kento Nanami (7:3 Strike)", grade: "Grade 1", hp: [190, 240], ce: [65, 95], str: [15, 21], agi: [11, 15], mst: [14, 19], xp: 210, cr: [50, 100] },
  { name: "Kusakabe Atsuya (Sword)", grade: "Grade 1", hp: [200, 250], ce: [50, 80], str: [14, 19], agi: [13, 17], mst: [15, 20], xp: 200, cr: [45, 90] },
  { name: "Naoya Zen'in (Projection)", grade: "Grade 1", hp: [170, 220], ce: [75, 110], str: [12, 17], agi: [19, 25], mst: [15, 21], xp: 230, cr: [55, 110] },
  { name: "Naobito Zen'in (Elder)", grade: "Grade 1", hp: [180, 230], ce: [80, 120], str: [13, 18], agi: [18, 24], mst: [16, 22], xp: 240, cr: [60, 120] },
  { name: "Lethal Rogue Juzo Kumiya", grade: "Grade 1", hp: [175, 225], ce: [50, 85], str: [16, 22], agi: [11, 15], mst: [11, 16], xp: 185, cr: [40, 85] },
  { name: "Inumaki Toge (Megaphone)", grade: "Grade 1", hp: [140, 195], ce: [100, 140], str: [10, 14], agi: [14, 18], mst: [16, 22], xp: 205, cr: [42, 90] },
  { name: "Panda (Gorilla Mode)", grade: "Grade 1", hp: [220, 280], ce: [60, 90], str: [18, 24], agi: [10, 14], mst: [11, 16], xp: 215, cr: [48, 95] },
  { name: "Todo Aoi (Boogie Woogie)", grade: "Grade 1", hp: [210, 270], ce: [62, 95], str: [17, 23], agi: [13, 17], mst: [13, 18], xp: 220, cr: [50, 100] },
  { name: "Kamo Noritoshi (Blood)", grade: "Grade 1", hp: [180, 235], ce: [75, 110], str: [12, 17], agi: [12, 16], mst: [14, 19], xp: 195, cr: [42, 85] },
  { name: "Charles Bernard (Manga)", grade: "Grade 1", hp: [170, 215], ce: [58, 88], str: [13, 18], agi: [11, 15], mst: [12, 17], xp: 180, cr: [38, 80] },
  { name: "Iori Hazenoki (Exploding)", grade: "Grade 1", hp: [185, 235], ce: [70, 105], str: [14, 19], agi: [11, 16], mst: [14, 19], xp: 195, cr: [42, 88] },
  { name: "Reggie Star (Contracts)", grade: "Grade 1", hp: [195, 245], ce: [78, 115], str: [13, 18], agi: [12, 16], mst: [15, 20], xp: 205, cr: [46, 92] },
  { name: "Kurourushi (Insect King)", grade: "Grade 1", hp: [215, 275], ce: [72, 112], str: [15, 21], agi: [12, 16], mst: [13, 18], xp: 210, cr: [48, 96] },
  { name: "Hei Squad Elite Assassin", grade: "Grade 1", hp: [180, 230], ce: [50, 80], str: [15, 20], agi: [14, 18], mst: [11, 16], xp: 190, cr: [40, 85] },
  { name: "Dojo Grandmaster Duelist", grade: "Grade 1", hp: [230, 290], ce: [80, 120], str: [17, 22], agi: [15, 19], mst: [15, 21], xp: 250, cr: [70, 140] },

  // --- SPECIAL GRADE (20 enemies) ---
  { name: "Special Grade Curse", grade: "Special Grade", hp: [250, 340], ce: [85, 130], str: [18, 26], agi: [15, 21], mst: [16, 23], xp: 320, cr: [60, 120] },
  { name: "Hanami (Nature Vengeance)", grade: "Special Grade", hp: [320, 420], ce: [110, 160], str: [19, 25], agi: [14, 19], mst: [19, 25], xp: 380, cr: [80, 160] },
  { name: "Jogo (Volcanic Calamity)", grade: "Special Grade", hp: [240, 310], ce: [150, 220], str: [16, 22], agi: [20, 26], mst: [22, 28], xp: 400, cr: [95, 190] },
  { name: "Dagon (Abyssal Overlord)", grade: "Special Grade", hp: [350, 460], ce: [125, 180], str: [18, 24], agi: [15, 20], mst: [20, 26], xp: 390, cr: [90, 180] },
  { name: "Mahito (Soul Distorter)", grade: "Special Grade", hp: [280, 370], ce: [140, 200], str: [17, 24], agi: [17, 23], mst: [24, 30], xp: 420, cr: [100, 200] },
  { name: "Hanami & Jogo (Tag-Team)", grade: "Special Grade", hp: [400, 520], ce: [180, 260], str: [20, 28], agi: [18, 24], mst: [21, 27], xp: 480, cr: [120, 240] },
  { name: "Smallpox Deity Plague", grade: "Special Grade", hp: [290, 380], ce: [130, 190], str: [18, 25], agi: [15, 20], mst: [21, 27], xp: 360, cr: [85, 170] },
  { name: "Choso (Supernova Burst)", grade: "Special Grade", hp: [260, 350], ce: [100, 150], str: [17, 23], agi: [16, 21], mst: [19, 25], xp: 350, cr: [80, 165] },
  { name: "Yutaka Okkotsu (Rika Support)", grade: "Special Grade", hp: [340, 450], ce: [250, 350], str: [21, 28], agi: [19, 25], mst: [23, 29], xp: 500, cr: [150, 300] },
  { name: "Geto Suguru (Maximum Uzumaki)", grade: "Special Grade", hp: [310, 410], ce: [200, 300], str: [19, 25], agi: [18, 24], mst: [22, 28], xp: 460, cr: [130, 260] },
  { name: "Toji Fushiguro (Mortal Killer)", grade: "Special Grade", hp: [450, 550], ce: [0, 0], str: [28, 38], agi: [25, 35], mst: [10, 15], xp: 550, cr: [160, 320] },
  { name: "Ryomen Sukuna (3-Fingers)", grade: "Special Grade", hp: [360, 480], ce: [300, 450], str: [22, 30], agi: [21, 28], mst: [24, 32], xp: 520, cr: [170, 340] },
  { name: "Ryomen Sukuna (15-Fingers)", grade: "Special Grade", hp: [550, 750], ce: [600, 900], str: [32, 45], agi: [30, 42], mst: [35, 48], xp: 800, cr: [250, 500] },
  { name: "Uraume (Frost Doom)", grade: "Special Grade", hp: [270, 360], ce: [140, 210], str: [16, 23], agi: [16, 22], mst: [22, 29], xp: 370, cr: [85, 175] },
  { name: "Kashimo Hajime (Lightning)", grade: "Special Grade", hp: [300, 390], ce: [160, 240], str: [20, 26], agi: [22, 28], mst: [20, 26], xp: 440, cr: [110, 220] },
  { name: "Yorozu (Bug Armor Metamorphosis)", grade: "Special Grade", hp: [330, 430], ce: [180, 250], str: [22, 29], agi: [19, 25], mst: [23, 30], xp: 450, cr: [120, 240] },
  { name: "Takako Uro (Sky Manipulator)", grade: "Special Grade", hp: [260, 340], ce: [130, 190], str: [15, 21], agi: [18, 24], mst: [21, 27], xp: 360, cr: [80, 160] },
  { name: "Ryu Ishigori (Granite Blast)", grade: "Special Grade", hp: [310, 400], ce: [220, 320], str: [21, 27], agi: [15, 20], mst: [22, 29], xp: 390, cr: [90, 185] },
  { name: "Sugawara Michizane Vengeful Ghost", grade: "Special Grade", hp: [400, 550], ce: [400, 600], str: [25, 35], agi: [22, 30], mst: [30, 40], xp: 600, cr: [200, 400] },
  { name: "Satoru Gojo (True Limitless)", grade: "Special Grade", hp: [600, 800], ce: [1000, 1500], str: [35, 48], agi: [32, 44], mst: [38, 50], xp: 1000, cr: [300, 600] }
];

/**
 * ── COLLATED CHRONICLE OF AGE EVENTS ──
 * Every age up is guaranteed to pull an interactive dialogue choice event.
 * We include fine-grained events for every age range, plus fallback/repeating matrices!
 */
export const LIFE_EVENTS: LifeEvent[] = [
  // AGE 1 - Universal & Multi-flavor
  {
    id: 'age_1_shadow',
    age: [1, 1],
    era: null,
    title: 'THE CHRONICLE GATES',
    cat: 'neutral',
    text: 'You are now 1 year old. Safe in your nursery, your eyes track shifting shadows across the ceiling. Strange humanoid patterns seem to flicker in the dark.',
    choices: [
      { t: 'Reach toward the dark shapes', r: 'Cursed energy flow triggers. Gained +5 Max CE.', ef: G => { G.maxCe += 5; G.ce = G.maxCe; } },
      { t: 'Cry out to alert your guardians', r: 'Your parent runs in and wards off the spirits. LCK rises.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 2); } }
    ]
  },
  {
    id: 'age_1_embers',
    age: [1, 1],
    era: null,
    title: 'THE COLD SPARKS',
    cat: 'jujutsu',
    text: 'Floating violet dust floats above your cradle. They feel completely frozen to the touch.',
    choices: [
      { t: 'Swallow the floating embers', r: 'A strange frost cools your throat. Max CE rises +8.', ef: G => { G.maxCe += 8; G.ce = G.maxCe; } },
      { t: 'Blow them away with your breath', r: 'Your wind reflex sharpens. AGI rises.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); } }
    ]
  },

  // AGE 2
  {
    id: 'age_2_toy',
    age: [2, 2],
    era: null,
    title: 'THE WEIRD PHANTOM',
    cat: 'jujutsu',
    text: 'A insect-like curse crawls inside your crib. It has three wet eyes and circles your favorite wooden rattle.',
    choices: [
      { t: 'Smash the phantom with your hands', r: 'Your palm flares with raw CE. The curse dissolves. STR rises, +10 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.xp += 10; } },
      { t: 'Observe and mimic its movements', r: 'You study the curse\'s erratic rhythm. INT and MST rise.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 1); G.stats.mst = Math.min(20, G.stats.mst + 1); } }
    ]
  },
  {
    id: 'age_2_mirror',
    age: [2, 2],
    era: null,
    title: 'THE COPPER IMAGE',
    cat: 'neutral',
    text: 'Staring into a polished copper pan, you see a second, grinning shadow child sitting directly on your shoulders.',
    choices: [
      { t: 'Smash the copper pan away', r: 'The heavy noise startles the spirit. STR and END climb.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.end = Math.min(20, G.stats.end + 1); } },
      { t: 'Wink at the shadow twin', r: 'It leaves a lingering trace of lucky aura. CHA and LCK rise.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 1); G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },

  // AGE 3
  {
    id: 'age_3_stare',
    age: [3, 3],
    era: null,
    title: 'STAIRCASE SENTINEL',
    cat: 'neutral',
    text: 'Alone outside a closed storage door, a heavy, humid draft slips under the gap, smelling of rusted iron and ozone.',
    choices: [
      { t: 'Slide your fingers inside the gap', r: 'A strange tingling numbs your hand. END rises.', ef: G => { G.stats.end = Math.min(20, G.stats.end + 2); } },
      { t: 'Step back and draw defensive symbols in dirt', r: 'Your safety focus aligns your young aura. Max CE rises +8.', ef: G => { G.maxCe += 8; G.ce = G.maxCe; } }
    ]
  },
  {
    id: 'age_3_stray_cat',
    age: [3, 3],
    era: null,
    title: 'THE BULGING EYE FELINE',
    cat: 'social',
    text: 'A black cat with dual pupils sits on your stone garden wall. It is holding a dead, glowing blue mouse.',
    choices: [
      { t: 'Offer it a bowl of warm milk', r: 'The cat purrs, leaving the blue mouse. Gained +1 LCK and $+5 credits.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 1); G.credits += 5; } },
      { t: 'Suck the blue spark from the mouse', r: 'Raw, pristine beast energy feeds your reservoirs. Max CE +12.', ef: G => { G.maxCe += 12; G.ce = G.maxCe; } }
    ]
  },

  // AGE 4
  {
    id: 'age_4_playground',
    age: [4, 4],
    era: null,
    title: 'MIRROR SPIRITIONS',
    cat: 'social',
    text: 'Playing near school grounds, you notice another toddler crying because a small, writhing shadow is biting their leg. No one else notices.',
    choices: [
      { t: 'Shout and throw a rock at the shadow', r: 'The curse shifts and flees. CHA and LCK rise.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 1); G.stats.lck = Math.min(20, G.stats.lck + 1); } },
      { t: 'Absorb the pain into your shoes', r: 'The curse latches onto you. END +2, Max HP +12, current HP takes -10.', ef: G => { G.maxHp += 12; G.hp = Math.max(10, G.hp - 10); G.stats.end = Math.min(20, G.stats.end + 2); } }
    ]
  },
  {
    id: 'age_4_doll',
    age: [4, 4],
    era: null,
    title: 'STRAP OF STRAW',
    cat: 'jujutsu',
    text: 'An abandoned straw doll wrapped in coarse iron nails lies near the well. It hums with high-frequency residual energy.',
    choices: [
      { t: 'Tear the nails out to use as throwing pins', r: 'Your dexterity and spatial coordination rise. AGI +2.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); } },
      { t: 'Infuse the doll with your own signature pulse', r: 'The doll aligns to your output. MST +2, Max CE +5.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 2); G.maxCe += 5; } }
    ]
  },

  // AGE 5
  {
    id: 'age_5_shrine',
    age: [5, 5],
    era: null,
    title: 'AWAKENING THRESHOLD',
    cat: 'jujutsu',
    text: 'The blood within your veins begins to hum. Cursed energy pools in your belly. You are ready to try your first intentional release.',
    choices: [
      { t: 'Focus the energy into a pinpoint on your fingertip', r: 'Your technique triggers smoothly! MST and INT rise.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 2); G.stats.int = Math.min(20, G.stats.int + 1); G.flags.techniqueAwakened = true; } },
      { t: 'Let the energy explode outward like armor', r: 'Cursed pressure reinforces your skin, bones! STR and END rise.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.end = Math.min(20, G.stats.end + 2); G.flags.techniqueAwakened = true; } }
    ]
  },
  {
    id: 'age_5_surge',
    age: [5, 5],
    era: null,
    title: 'THE SUMMER STORM FEVER',
    cat: 'training',
    text: 'A massive atmospheric typhoon rattles your home. The air pressure triggers a sudden, severe fever of raw CE build-up.',
    choices: [
      { t: 'Force yourself to stand under the heavy rainfall', r: 'The cold rain tempers your exploding veins. Max HP rises +15, STR +1.', ef: G => { G.maxHp += 15; G.hp = G.maxHp; G.stats.str = Math.min(20, G.stats.str + 1); } },
      { t: 'Contain the heat entirely in your mind via meditation', r: 'Your brain adjusts to intense cursed strain. INT and MST climb.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); } }
    ]
  },

  // AGE 6
  {
    id: 'age_6_bully',
    age: [6, 6],
    era: null,
    title: 'THE PLAYGROUND ENFORCER',
    cat: 'social',
    text: 'An older kid tries to push you down and steal your shiny copper marble.',
    choices: [
      { t: 'Stare him down and manifest a shadow face mask', r: 'He flees in raw, primal fear. CHA rises +2.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); } },
      { t: 'Sweep his feet out with superhuman speed', r: 'You lay him flat instantly. His friends look shocked. AGI and STR rise.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); G.stats.str = Math.min(20, G.stats.str + 1); } }
    ]
  },
  {
    id: 'age_6_haunted_shogi',
    age: [6, 6],
    era: null,
    title: 'GHOST STRATEGIST',
    cat: 'training',
    text: 'A withered ghost sorcerer floats over an old shogi board. "Beat me, ward, and I will reveal ancestral knowledge."',
    choices: [
      { t: 'Accept the match and play with calculated logic', r: 'You outplay the spirit with pure geometry. INT +2, MST +1.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); } },
      { t: 'Flip the board and punch the phantom\'s core', r: 'You disperse the ghost with primal physical output. STR +1, AGI +1, +20 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.agi = Math.min(20, G.stats.agi + 1); G.xp += 20; } }
    ]
  },

  // AGE 7
  {
    id: 'age_7_woods',
    age: [7, 7],
    era: null,
    title: 'THE HIDDEN CATACOMB',
    cat: 'jujutsu',
    text: 'Exploring a forest, you discover a stone lantern tied heavily with rotten Shimenawa rope. Black muck drips from the seams.',
    choices: [
      { t: 'Tear the rope and drink the pooling black essence', r: 'Horrific flavor! Gained +15 Max CE but lost -1 LCK.', ef: G => { G.maxCe += 15; G.ce = G.maxCe; G.stats.lck = Math.max(1, G.stats.lck - 1); } },
      { t: 'Carve your own technique marks to seal the leakage', r: 'You stabilize the boundary. Your control expands. MST +2, INT +1.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 2); G.stats.int = Math.min(20, G.stats.int + 1); } }
    ]
  },
  {
    id: 'age_7_waterfall',
    age: [7, 7],
    era: null,
    title: 'THE FROST CASCADE',
    cat: 'training',
    text: 'You find a deep mountain waterfall running with icy glacial meltwater. The current is vicious.',
    choices: [
      { t: 'Meditate directly under the freezing impact', r: 'Your nervous system adapts to immense pain. END +2, Max HP +10.', ef: G => { G.stats.end = Math.min(20, G.stats.end + 2); G.maxHp += 10; } },
      { t: 'Practice sweeping energy cuts across the torrent', r: 'You learn to cleave fluid forces. AGI +1, MST +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); G.stats.mst = Math.min(20, G.stats.mst + 1); } }
    ]
  },

  // AGE 8
  {
    id: 'age_8_dog',
    age: [8, 8],
    era: null,
    title: 'THE FLEEING FLOCK',
    cat: 'neutral',
    text: 'Walking through back streets, you encounter a pack of wild dogs chased by crawling red-eyed centipede curses.',
    choices: [
      { t: 'Leap onto a roof and let them pass', r: 'You escape cleanly. Your situational reflex climbs. AGI +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); } },
      { t: 'Discharge raw technique and crush the swarms', r: 'You obliterate the centipedes. Gained +15 XP, STR +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.xp += 15; } }
    ]
  },
  {
    id: 'age_8_artifact',
    age: [8, 8],
    era: null,
    title: 'DIGGING TRINKETS',
    cat: 'neutral',
    text: 'You unearth a weird copper compass in your clan compound backyard. Its needle fluctuates wildly toward nearby fear.',
    choices: [
      { t: 'Tuck it into your sleeve as a luck charm', r: 'You anticipate sudden dangers. Gained Fear Compass item, LCK +1.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 1); G.inventory.push({ name: 'Fear Compass', qty: 1 }); } },
      { t: 'Siphon its structural alloy energy', r: 'The metal alloy feeds your defenses. END rises, Max HP +8.', ef: G => { G.stats.end = Math.min(20, G.stats.end + 1); G.maxHp += 8; } }
    ]
  },

  // AGE 9
  {
    id: 'age_9_well',
    age: [9, 9],
    era: null,
    title: 'THE ABANDONED STRATUM',
    cat: 'jujutsu',
    text: 'An old dry well whispers from the woods: "Feed me three drops of blood for a secret relic..."',
    choices: [
      { t: 'Prick your finger and drop your blood', r: 'A strange bone fragment flies up. Gained Cursed Bone and +10 Max CE.', ef: G => { G.inventory.push({ name: 'Cursed Bone Fragment', qty: 1 }); G.maxCe += 10; G.ce = G.maxCe; } },
      { t: 'Decline and cover the well with a stone slab', r: 'You avoid the trap. LCK and AGI rise.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 1); G.stats.agi = Math.min(20, G.stats.agi + 1); } }
    ]
  },
  {
    id: 'age_9_shards',
    age: [9, 9],
    era: null,
    title: 'CRYSTALLINE MIRROR SHARDS',
    cat: 'combat',
    text: 'A jagged shard of ancient mirror lies on the mountain path, reflecting a distorted nightmare version of your face.',
    choices: [
      { t: 'Smash the shard under your sandals', r: 'You shatter the illusion instantly. Gained +25 XP, STR +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.xp += 25; } },
      { t: 'Study the warped reflections to learn soul geometry', r: 'You decipher deep cognitive layers of the ego. INT +2, MST +1.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); } }
    ]
  },

  // AGE 10
  {
    id: 'age_10_summon',
    age: [10, 10],
    era: null,
    title: 'THE CALL OF DESTINY',
    cat: 'social',
    text: 'A clan elder catches you manipulating elements of negative energy. "Choose your life pathway now, grandchild."',
    choices: [
      { t: '"I will protect the weak. Pure and simple."', r: 'They smile heavily. Your aura brightens. CHA +2, Max CE +5.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); G.maxCe += 5; } },
      { t: '"I seek ultimate power. Let the weak perish."', r: 'They nod grimly. "A warrior\'s reality." STR +2, MST +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); } },
      { t: '"I will walk the shadows alone, forgotten."', r: 'They look concerned. Your presence thins. AGI +2, LCK +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },
  {
    id: 'age_10_elder_vow',
    age: [10, 10],
    era: null,
    title: 'SACRED BINDING VOW',
    cat: 'jujutsu',
    text: 'An offering monk approaches with a sacrificial trade. "Trade a fraction of your mental comfort to forge physical steel."',
    choices: [
      { t: 'Exchange Intellect for direct Physical Might', r: 'Your logic dims slightly but muscles burst. STR +3, INT -1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 3); G.stats.int = Math.max(1, G.stats.int - 1); } },
      { t: 'Exchange Luck for high Cursed Energy reservoirs', r: 'Your destiny grows darker but reservoirs explode. Max CE +20, LCK -2.', ef: G => { G.maxCe += 20; G.ce = G.maxCe; G.stats.lck = Math.max(1, G.stats.lck - 2); } }
    ]
  },

  // AGE 11
  {
    id: 'age_11_scared',
    age: [11, 11],
    era: null,
    title: 'SHRINE CREEPER',
    cat: 'combat',
    text: 'A Grade 4 creeping curse crawls from a shrine gap, seeking to ingest your shadows.',
    choices: [
      { t: 'Perform a tactical disarm counter', r: 'You break its wrist and execute! +25 XP, AGI +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); G.xp += 25; } },
      { t: 'Withstand its impact with raw muscle density', r: 'You block with raw muscle. HP takes -10 but END climbs +2.', ef: G => { G.hp = Math.max(15, G.hp - 10); G.maxHp += 8; G.stats.end = Math.min(20, G.stats.end + 2); } }
    ]
  },
  {
    id: 'age_11_maggots',
    age: [11, 11],
    era: null,
    title: 'RICE FIELD ROT',
    cat: 'combat',
    text: 'The local harvest is infested with flying locusts that scream with human voices. They spit negative acid rot.',
    choices: [
      { t: 'Devastate them with sweeping technique discharges', r: 'Your precision sweeps wipe out the swarm. Gained +30 XP, MST +1.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 1); G.xp += 30; } },
      { t: 'Evade their acid lines with elegant movements', r: 'You dodge flawlessly. Physical speed increases. AGI +2.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); } }
    ]
  },

  // AGE 12
  {
    id: 'age_12_book',
    age: [12, 12],
    era: null,
    title: 'THE GRIMOIRE OF WEI',
    cat: 'training',
    text: 'A dusty, heavy textbook contains diagrams of barrier boundaries written in old spider sap ink.',
    choices: [
      { t: 'Force yourself to read all 400 pages overnight', r: 'Your brain burns but intellect spikes. INT +3, MST +1.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 3); G.stats.mst = Math.min(20, G.stats.mst + 1); } },
      { t: 'Meditate on the raw concentric runic circles', r: 'You align energy flows directly. Max CE +15, MST +1.', ef: G => { G.maxCe += 15; G.ce = G.maxCe; G.stats.mst = Math.min(20, G.stats.mst + 1); } }
    ]
  },
  {
    id: 'age_12_runes',
    age: [12, 12],
    era: null,
    title: 'GLYPH CALLIGRAPHY',
    cat: 'jujutsu',
    text: 'A scholar tutor tasks you with painting 10,000 warding characters onto paper seals without spilling ink.',
    choices: [
      { t: 'Paint with meticulous artistic precision', r: 'Your focus and patience harden. MST +2, INT +1.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 2); G.stats.int = Math.min(20, G.stats.int + 1); } },
      { t: 'Rush the seals with rapid physical strokes', r: 'Your dexterity grows faster. AGI +2, LCK +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },

  // AGE 13
  {
    id: 'age_13_tragedy',
    age: [13, 13],
    era: null,
    title: 'THE RUPTURED VEIL',
    cat: 'neutral',
    text: 'A massive emotional grief wave blankets your district after a localized tragic fire. A thick grey aura blankets the streets.',
    choices: [
      { t: 'Channel the collective sorrow into body density', r: 'Your body hardens from shared pain. STR and END climb.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.end = Math.min(20, G.stats.end + 1); } },
      { t: 'Shield the survivors with temporary barrier grids', r: 'They bless your safe deeds. CHA +2, LCK +1.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },
  {
    id: 'age_13_robbers',
    age: [13, 13],
    era: null,
    title: 'THE HIGHWAY RAID',
    cat: 'combat',
    text: 'While traveling on a trade route, rogue outlaws block your cart, claiming all your clan belongings.',
    choices: [
      { t: 'Annihilate their leader with an explosive technique blast', r: 'The leader falls instantly; the others scatter. STR +1, CHA +1, +30 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.cha = Math.min(20, G.stats.cha + 1); G.xp += 30; } },
      { t: 'Slip behind them in the dust and steal their coin pouches', r: 'You rob the robbers! Gained +35 credits, AGI +2.', ef: G => { G.credits += 35; G.stats.agi = Math.min(20, G.stats.agi + 2); } }
    ]
  },

  // AGE 14
  {
    id: 'age_14_shady_trader',
    age: [14, 14],
    era: null,
    title: 'THE SHADY MERCHANT',
    cat: 'social',
    text: 'A hooded trader whispers from an alley: "I have a raw cursed crystal shard. 15 credits, or your lucky star."',
    choices: [
      { t: 'Purchase it with 15 credits', r: 'You gain the crystal. Max CE rises +15.', ef: G => { if (G.credits >= 15) { G.credits -= 15; G.inventory.push({ name: 'Cursed Crystal', qty: 1 }); G.maxCe += 15; G.ce = G.maxCe; } else { G.stats.lck = Math.max(1, G.stats.lck - 1); } } },
      { t: 'Suck its residue using fast physical deception', r: 'You rob the merchant quickly. Gained Stolen Crystal, AGI +2, LCK -2.', ef: G => { G.inventory.push({ name: 'Stolen Cursed Crystal', qty: 1 }); G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.lck = Math.max(1, G.stats.lck - 2); } }
    ]
  },
  {
    id: 'age_14_blade_forge',
    age: [14, 14],
    era: null,
    title: 'THE BLOOD IRON HAMMER',
    cat: 'training',
    text: 'A rogue blacksmith allows you to assist in pounding hot, pure iron mixed with dried cursed ash.',
    choices: [
      { t: 'Swing the forge hammer with steady, rhythmic muscle', r: 'Your physical arms harden like steel. STR +2, END +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.end = Math.min(20, G.stats.end + 1); } },
      { t: 'Infuse your flowing technique into the metal core', r: 'The blade glows violet. Gained Cursed Dagger relic, MST +2.', ef: G => { G.inventory.push({ name: 'Cursed Dagger', qty: 1 }); G.stats.mst = Math.min(20, G.stats.mst + 2); } }
    ]
  },

  // AGE 15
  {
    id: 'age_15_revelation',
    age: [15, 15],
    era: null,
    title: 'THE WEIGHT OF THE SOUL',
    cat: 'social',
    text: 'The boundary of childhood is ending. Word of an elite assassin targeting young students surfaces. You must choose your stance.',
    choices: [
      { t: '"I will hunt alone under moonlight to capture him."', r: 'Your night senses sharpen. AGI +2, MST +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); } },
      { t: '"I will safeguard our compound alongside class peers."', r: 'You unify your defenses. CHA +2, INT +1.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); G.stats.int = Math.min(20, G.stats.int + 1); } }
    ]
  },
  {
    id: 'age_15_alley_confront',
    age: [15, 15],
    era: null,
    title: 'THE AMBUSH IN GREY',
    cat: 'combat',
    text: 'A rogue curse user blocks your path home, displaying clawed hands that emit putrid black gas.',
    choices: [
      { t: 'Overwhelm him with maximum output blast immediately', r: 'He is blown backward into a brick wall. STR +2, +35 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.xp += 35; } },
      { t: 'Perform an elegant dodge and slice his ankles', r: 'He trips and flees cursing. AGI +2, LCK +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },

  // AGE 16 (Special Era triggers)
  {
    id: 'age_16_tokyo_invite',
    age: [16, 16],
    era: 'modern|shibuya',
    title: 'THE HIGHER-UP ADMISSIONS',
    cat: 'jujutsu',
    text: 'A sleek black sedan idles by the curb. Auxiliary Manager Ijichi hands you an encrypted dossier. "Your anomalous cursed energy metrics have reached the higher-ups. Tokyo Jujutsu High has formally opened its gates for your enrollment."',
    choices: [
      { t: '"Formalize the registration immediately."', r: 'Registered. Cleared for Grade 4 classification. Access to missions unlocked. +40 XP.', ef: G => { G.flags.enrolledHigh = true; G.xp += 40; if (G.rankIndex === 0) { G.rankIndex = 1; G.rank = 'Grade 4'; } } },
      { t: '"I decline. I will operate as a lone wolf."', r: 'Your path is unchained. Gained +2 LCK, +1 CHA. Access to high command missions is sealed.', ef: G => { G.flags.loner = true; G.stats.lck = Math.min(20, G.stats.lck + 2); G.stats.cha = Math.min(20, G.stats.cha + 1); } }
    ]
  },

  // AGE 17 to 20
  {
    id: 'age_17_todo_meeting',
    age: [17, 20],
    era: 'modern|shibuya',
    title: 'AOI\'S CORRIDOR INTERROGATION',
    cat: 'social',
    text: 'Aoi Todo blocks your path, staring down with absolute weight. "Tell me, friend. What is your type of partner?"',
    choices: [
      { t: '"A tall person with a voluptuous build!"', r: 'Todo\'s eyes tear up. "BROTHER!" Gained Aoi\'s eternal trust! STR +3, CHA +2, +50 XP.', ef: G => { G.flags.todoBond = true; G.stats.str = Math.min(20, G.stats.str + 3); G.stats.cha = Math.min(20, G.stats.cha + 2); G.xp += 50; } },
      { t: '"Someone short, cute, and gentle."', r: '"Tolerable..." he says, looking somewhat generic. +15 XP.', ef: G => { G.xp += 15; } },
      { t: '"A sharp, clever person with a book."', r: '"Boring. Utterly boring." He steps past you.', ef: G => {} }
    ]
  },
  {
    id: 'age_17_mei_mei',
    age: [17, 20],
    era: 'modern|shibuya',
    title: 'MEI MEI\'S TRANSACTIONAL AUDIT',
    cat: 'social',
    text: 'The elite Grade 1 sorcerer Mei Mei is counting clean gold coins. "I will rate you, kid. If your coin purse supports my service."',
    choices: [
      { t: 'Offer her a heavy stack of 50 credits', r: 'She grins gorgeously. "Fascinating... direct recommendation sent!" CHA +3, Grade up!', ef: G => { if (G.credits >= 50) { G.credits -= 50; G.stats.cha = Math.min(20, G.stats.cha + 3); G.rankIndex = Math.min(5, G.rankIndex + 1); } } },
      { t: 'Refuse and walk away silently', r: 'She sighs. "No currency, no service." LCK rises.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },

  // AGE 21 to 25
  {
    id: 'age_21_bloodline_secrets',
    age: [21, 25],
    era: null,
    title: 'CLAN SACRED CHAMBER',
    cat: 'training',
    text: 'Elite elders invite you to meditate inside the Chamber of Unborn Roots, holding ancient memory plates.',
    choices: [
      { t: 'Absorb the ancestral memory streams directly', r: 'Your mental capacity bursts. INT +2, MST +2.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.mst = Math.min(20, G.stats.mst + 2); } },
      { t: 'Politely decline to keep your mind pure', r: 'You discover your own individual path. CHA +2, AGI +1.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); G.stats.agi = Math.min(20, G.stats.agi + 1); } }
    ]
  },
  {
    id: 'age_21_reverse_rct',
    age: [21, 25],
    era: null,
    title: 'THE SPARKS OF REVERSE TECHNIQUE',
    cat: 'jujutsu',
    text: 'While defending a vital line, a deep toxic curse pierces your lung. Your brain feels the cold breath of death.',
    choices: [
      { t: 'Multiply negative energy by negative energy', r: 'REVERSE CURSED TECHNIQUE AWAKENED! Max HP +30 and full restoration!', ef: G => { G.flags.rctUnlocked = true; G.maxHp += 30; G.hp = G.maxHp; G.stats.int = Math.min(20, G.stats.int + 2); } },
      { t: 'Seal the physical poison utilizing raw physical focus', r: 'You push past the death threshold using physical steel. STR +2, END +2.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.end = Math.min(20, G.stats.end + 2); G.hp = Math.max(10, G.hp - 20); } }
    ]
  },

  // AGE 26 to 30
  {
    id: 'age_26_blackflash_peak',
    age: [26, 30],
    era: null,
    title: 'THE FLOW STATE OF DISASTER',
    cat: 'combat',
    text: 'A terrible multi-limbed curse corners you. Space aligns dynamically with your knuckles.',
    choices: [
      { t: 'Strike with 100% emotional alignment — force Black Flash', r: 'BLACK FLASH SPARK! Space warps; curse vaporizes. +50 XP, STR +2, MST +1.', ef: G => { G.xp += 50; G.stats.str = Math.min(20, G.stats.str + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); G.flags.bfHit = true; } },
      { t: 'Compress the environment into a tight barrier cube', r: 'Curse suffocates. Max CE rises +15, END +2.', ef: G => { G.maxCe += 15; G.stats.end = Math.min(20, G.stats.end + 2); } }
    ]
  },

  // AGE 31 to 40
  {
    id: 'age_31_mercenary',
    age: [31, 40],
    era: null,
    title: 'THE OUTLAW CONFRONTATION',
    cat: 'combat',
    text: 'Rogue curse users occupy a civilian housing block, demanding high-tier tools to spare children.',
    choices: [
      { t: 'Infiltrate like a ghost and eliminate them silently', r: 'You neutralize all outlaws. AGI +2, STR +1, $+30 credits.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.str = Math.min(20, G.stats.str + 1); G.credits += 30; } },
      { t: 'Walk in the front gate and break their minds with talk', r: 'You talk down the hostage taker. CHA +2, INT +2.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); G.stats.int = Math.min(20, G.stats.int + 2); } }
    ]
  },

  // AGE 41 to 50
  {
    id: 'age_41_domain_manifest',
    age: [41, 50],
    era: null,
    title: 'REVELATION OF INNER REALM',
    cat: 'jujutsu',
    text: 'Your lifetime of battles culminates in a grand enlightenment. You comprehend how to project your soul in physical material space.',
    choices: [
      { t: 'Attempt a complete outer Domain Expansion', r: 'Dark skies enclose! DOMAIN UNLOCKED! MST +3, Max CE +20.', ef: G => { G.flags.domainUnlocked = true; G.stats.mst = Math.min(20, G.stats.mst + 3); G.maxCe += 20; G.ce = G.maxCe; } },
      { t: 'Refine an immediate anti-domain Simple Domain barrier', r: 'You sculpt a perfect shield. SIMPLE DOMAIN UNLOCKED! END +2, INT +2.', ef: G => { G.flags.simpleDomainUnlocked = true; G.stats.end = Math.min(20, G.stats.end + 2); G.stats.int = Math.min(20, G.stats.int + 2); } }
    ]
  },

  // AGE 51 to 60
  {
    id: 'age_51_mentor_call',
    age: [51, 60],
    era: null,
    title: 'THE RISING SUCCESSOR',
    cat: 'social',
    text: 'Your gray hair marks you a legend. A brilliant orphan toddler bearing deep eye marks begs to study under your legacy.',
    choices: [
      { t: 'Accept them and transfer your active lineage memory', r: 'They bloom under your guidance. CHA +2, LCK +2.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 2); G.stats.lck = Math.min(20, G.stats.lck + 2); } },
      { t: 'Set a harsh, extreme physical sparring exam', r: 'They fail, but your strict lesson tempers both of you. STR +1, MST +2.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.mst = Math.min(20, G.stats.mst + 2); } }
    ]
  },

  // AGE 61 to 70
  {
    id: 'age_61_retirement',
    age: [61, 70],
    era: null,
    title: 'THE AGE OF COLD SILK',
    cat: 'neutral',
    text: 'Combat scars burn in cold weather. Cursed currents continue to hum, but your lungs demand peace.',
    choices: [
      { t: 'Retire to a quiet forest shrine cabin', r: 'You live at absolute baseline. LCK +4, Max CE +10.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 4); G.maxCe += 10; G.flags.retired = true; } },
      { t: 'Refuse to yield and guard Tokyo gate until death', r: 'The youth admire your steel. Grade 1 instantly; STR +1, CHA +2.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.cha = Math.min(20, G.stats.cha + 2); G.rank = 'Grade 1'; G.rankIndex = 5; } }
    ]
  },

  // ── ERA SPECIFIC STORY QUEST EVENTS ──
  // HEIAN ERA
  {
    id: 'heian_sukuna_shadow',
    age: [10, 40],
    era: 'heian',
    title: 'THE FOUR-ARMED DEMON CALAMITY',
    cat: 'combat',
    text: 'A devastating blood fog blankets the temple. Ryomen Sukuna has walked past the courtyard. His dual red eyes scan your presence.',
    choices: [
      { t: 'Kneel in absolute subservience and bow your head', r: 'You survive the terror. Your survival instincts spike. LCK +3, END +2.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 3); G.stats.end = Math.min(20, G.stats.end + 2); } },
      { t: 'Draw your blade and channel raw output to the maximum', r: 'The sovereign laughs. He steps past you, giving a minor slash. HP damages -40, but Max CE explodes +25 and MST +2.', ef: G => { G.hp = Math.max(10, G.hp - 40); G.maxCe += 25; G.stats.mst = Math.min(20, G.stats.mst + 2); } }
    ]
  },
  {
    id: 'heian_orochi',
    age: [12, 30],
    era: 'heian',
    title: 'THE GIANT EIGHT-TAILED WRECKAGE',
    cat: 'combat',
    text: 'An enormous mountain serpent curse, mutated by Sukuna\'s leftover fingers, lays waste to the local shrines.',
    choices: [
      { t: 'Charge the central eye with a lethal air-pierce sweep', r: 'You pierce the center, sending black blood soaring! STR +2, AGI +1, +40 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.agi = Math.min(20, G.stats.agi + 1); G.xp += 40; } },
      { t: 'Siphon the residual blood-mist pools to mutate your reserves', r: 'The snake blood increases your core CE flow. Max CE +15, LCK -1.', ef: G => { G.maxCe += 15; G.stats.lck = Math.max(1, G.stats.lck - 1); } }
    ]
  },

  // SENGOKU ERA
  {
    id: 'sengoku_siege',
    age: [15, 35],
    era: 'sengoku',
    title: 'THE BLOOD MIST FORTRESS',
    cat: 'combat',
    text: 'A rival warlord deploys a horde of blind transfigured soldiers with iron blades to massacre the fortress compound.',
    choices: [
      { t: 'Guard the master gate with fluid technique counters', r: 'You decapitate their front ranks. STR +2, END +1, +35 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.end = Math.min(20, G.stats.end + 1); G.xp += 35; } },
      { t: 'Deceive them using silent shadow decoys', r: 'They sweep empty air; you counter-cleave. AGI +2, INT +1, $+20 credits.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.int = Math.min(20, G.stats.int + 1); G.credits += 20; } }
    ]
  },

  // EDO ERA
  {
    id: 'edo_coliseum',
    age: [16, 45],
    era: 'edo',
    title: 'THE REBEL PIT ARENA',
    cat: 'combat',
    text: 'An underground Edo gambling ring organises non-sanctioned death matches for rogue sorcerers and cursed beasts.',
    choices: [
      { t: 'Enroll in the heavy physical bracket and fight openly', r: 'You win three continuous rounds! STR +2, END +1, $+40 credits.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.end = Math.min(20, G.stats.end + 1); G.credits += 40; } },
      { t: 'Bet your family inheritance on the dark horse and fix the fight', r: 'Your target wins under your hidden technique. $+80 credits, LCK +2.', ef: G => { G.credits += 80; G.stats.lck = Math.min(20, G.stats.lck + 2); } }
    ]
  },

  // MEIJI ERA
  {
    id: 'meiji_steamboat',
    age: [16, 40],
    era: 'meiji',
    title: 'THE COAL SMOKE PHANTOM',
    cat: 'combat',
    text: 'Industrial fear of modern foreign engines awakens a smoke-faced steel spider curse inside the steamboat docks.',
    choices: [
      { t: 'Dismantle the steel pipes with structural technique output', r: 'The curse falls; harbor saved. INT +2, MST +1, +30 XP.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.mst = Math.min(20, G.stats.mst + 1); G.xp += 30; } },
      { t: 'Dodge the hot steam pipes using quick tactical positioning', r: 'You navigate the boiling vapor. AGI +2, END +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 2); G.stats.end = Math.min(20, G.stats.end + 1); } }
    ]
  },

  // SHOWA ERA
  {
    id: 'showa_depot',
    age: [15, 30],
    era: 'showa',
    title: 'THE BOMB SHELTER MIASMA',
    cat: 'combat',
    text: 'A forgotten WWII underground storage room leaks a massive, toxic gas curse that mimics skeletal metal shards.',
    choices: [
      { t: 'Purge the depot with a concentrated thermal blast', r: 'The rot is incinerated. Gained +40 XP, STR +1, MST +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.mst = Math.min(20, G.stats.mst + 1); G.xp += 40; } },
      { t: 'Shield the nearby citizens using your physical body', r: 'Your armor absorbs the shock. END +3, Max HP +15, HP takes -15.', ef: G => { G.stats.end = Math.min(20, G.stats.end + 3); G.maxHp += 15; G.hp = Math.max(10, G.hp - 15); } }
    ]
  },

  // MODERN / SHIBUYA EXTRA
  {
    id: 'modern_gojo_flicker',
    age: [10, 30],
    era: 'modern|shibuya',
    title: 'BLUE FLASH APPORTIONMENT',
    cat: 'social',
    text: 'While walking in Shibuya subway, Gojo Satoru walks by. His radiant blindfold slips, exposing his crystalline eyes.',
    choices: [
      { t: 'Observe his residual space distortion patterns', r: 'Your brain decodes space metrics. MST +2, INT +2, Max CE +10.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 2); G.stats.int = Math.min(20, G.stats.int + 2); G.maxCe += 10; } },
      { t: 'Politely ask him for a signature sticker', r: 'He laughs. "Cool kid!" He leaves. CHA +3, LCK +1.', ef: G => { G.stats.cha = Math.min(20, G.stats.cha + 3); G.stats.lck = Math.min(20, G.stats.lck + 1); } }
    ]
  },

  // ── REPEATING / PROCEDURAL EVENTS (RANDOMIZED FALLBACK CORES) ──
  {
    id: 'gen_curse_skulk',
    age: null,
    era: null,
    title: 'SKULKING STALKER',
    repeat: true,
    cat: 'combat',
    text: 'A low-tier shadow curse with four cold hands drops from above, aiming for your weak points.',
    choices: [
      { t: 'Shatter its head with a heavy kick', r: 'Primal execution. STR +1, AGI +1, +15 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.agi = Math.min(20, G.stats.agi + 1); G.xp += 15; } },
      { t: 'Discharge a targeted point laser', r: 'Neat dissolution. MST +1, Max CE +5, +15 XP.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 1); G.maxCe += 5; G.ce = G.maxCe; G.xp += 15; } }
    ]
  },
  {
    id: 'gen_med_spirit',
    age: null,
    era: null,
    title: 'AMORPHOUS VESTIGE',
    repeat: true,
    cat: 'jujutsu',
    text: 'A clean liquid bubble containing ancient sorcerer emotions wraps around your glass.',
    choices: [
      { t: 'Drink the liquid bubble directly', r: 'Complete cellular health! HP fully restored, END +1.', ef: G => { G.maxHp += 10; G.hp = G.maxHp; G.stats.end = Math.min(20, G.stats.end + 1); } },
      { t: 'Draw details of purification runes around it', r: 'Conduits purified. INT +1, MST +1, Max CE +10.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 1); G.stats.mst = Math.min(20, G.stats.mst + 1); G.maxCe += 10; G.ce = G.maxCe; } }
    ]
  },
  {
    id: 'gen_sparring_challenge',
    age: null,
    era: null,
    title: 'THE DRILL BATTLE',
    repeat: true,
    cat: 'training',
    text: 'A peer smiles. "Let\'s see what your technique output is made of!"',
    choices: [
      { t: 'Engage in extreme physical wrestling', r: 'You throw them repeatedly. STR +1, END +1, +20 XP.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 1); G.stats.end = Math.min(20, G.stats.end + 1); G.xp += 20; } },
      { t: 'Confuse them with rapid energy decoy maneuvers', r: 'They swipe blank space. AGI +1, INT +1, +20 XP.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); G.stats.int = Math.min(20, G.stats.int + 1); G.xp += 20; } }
    ]
  },
  {
    id: 'gen_district_scandals',
    age: null,
    era: null,
    title: 'LOCAL FEUD RUMORS',
    repeat: true,
    cat: 'social',
    text: 'Two rival lower groups argue about who has authorization to collect a bounty on a minor sewer ghoul.',
    choices: [
      { t: 'Propose a beautiful mutual partition deal', r: 'Both sides agree. Gained $+25 credits, CHA +1.', ef: G => { G.credits += 25; G.stats.cha = Math.min(20, G.stats.cha + 1); } },
      { t: 'Exorcise the sewer curse instantly and take 100% of the bag', r: 'Greedy but efficient. Gained $+40 credits, CHA -1.', ef: G => { G.credits += 40; G.stats.cha = Math.max(1, G.stats.cha - 1); G.xp += 25; } }
    ]
  },
  {
    id: 'gen_cursed_artifact_re',
    age: null,
    era: null,
    title: 'THE HAUNTED TRINKET',
    repeat: true,
    cat: 'neutral',
    text: 'An ancient brass hourglass lies buried. Its sand flows upward whenever a curse is actively stalking your lineage.',
    choices: [
      { t: 'Keep the hourglass in your coat pocket', r: 'Your reflexes grow impeccable. Gained Glass Relic, AGI +1, LCK +1.', ef: G => { G.stats.agi = Math.min(20, G.stats.agi + 1); G.stats.lck = Math.min(20, G.stats.lck + 1); G.inventory.push({ name: 'Curse Hourglass', qty: 1 }); } },
      { t: 'Shatter it and siphon the raw historical glass dirt', r: 'The elements fuse to your bones. END +2, Max HP +10.', ef: G => { G.stats.end = Math.min(20, G.stats.end + 2); G.maxHp += 10; G.hp = Math.min(G.maxHp, G.hp + 10); } }
    ]
  },
  {
    id: 'gen_back_alley_mug',
    age: null,
    era: null,
    title: 'THE GREY BACKALLEY THUGS',
    repeat: true,
    cat: 'combat',
    text: 'Three rogue curse-user scavengers corner you in a damp side alleyway.',
    choices: [
      { t: 'Blast them into the brick walls immediately', r: 'They fall screaming; you loot their pockets. $+30 credits, STR +1.', ef: G => { G.credits += 30; G.stats.str = Math.min(20, G.stats.str + 1); G.xp += 20; } },
      { t: 'Slip into the shadows and pickpocket their main ledger', r: 'You extract their secret files. INT +2, AGI +1.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.agi = Math.min(20, G.stats.agi + 1); } }
    ]
  },
  {
    id: 'gen_creepy_shrine',
    age: null,
    era: null,
    title: 'THE WATER WELL SENTINEL',
    repeat: true,
    cat: 'jujutsu',
    text: 'A rotten, dripping wooden archway is tied with cursed talismans. A dark spirit floats in the water basin.',
    choices: [
      { t: 'Tear down the warding locks and ingest the essence', r: 'Extreme, painful energy surge. Max CE +12, current HP takes -10.', ef: G => { G.maxCe += 12; G.ce = G.maxCe; G.hp = Math.max(10, G.hp - 10); } },
      { t: 'Re-align the paper charms to clear the spring', r: 'The mountain water becomes pure. Gained +15 XP, LCK +2.', ef: G => { G.stats.lck = Math.min(20, G.stats.lck + 2); G.xp += 15; } }
    ]
  },
  {
    id: 'gen_shikigami_test',
    age: null,
    era: null,
    title: 'THE ESCAPED TIGER BEAST',
    repeat: true,
    cat: 'combat',
    text: 'A wild, feral tiger cursed beast covered in stone plates rushes through the forest bamboo trees.',
    choices: [
      { t: 'Subdue the beast with a heavy headlock', r: 'You bring it down with muscle! STR +2, END +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.end = Math.min(20, G.stats.end + 1); G.xp += 25; } },
      { t: 'Purify its core by hum-singing your CE harmonics', r: 'The tiger bows and fades into dust. MST +2, CHA +1.', ef: G => { G.stats.mst = Math.min(20, G.stats.mst + 2); G.stats.cha = Math.min(20, G.stats.cha + 1); } }
    ]
  },
  {
    id: 'gen_merchant_deal',
    age: null,
    era: null,
    title: 'THE TRAVELING WARD PEDDLER',
    repeat: true,
    cat: 'social',
    text: 'An old merchant whispers. "I have premium spirit incenses. 20 credits, or trade a portion of your stamina."',
    choices: [
      { t: 'Buy the incense with 20 credits', r: 'The incense purifies your channels. Max CE +12, credits -20.', ef: G => { if (G.credits >= 20) { G.credits -= 20; G.maxCe += 12; G.ce = G.maxCe; } } },
      { t: 'Trade your physical focus in exchange of the wards', r: 'Your body feels heavy but eyes see clearly. INT +2, STR -1.', ef: G => { G.stats.int = Math.min(20, G.stats.int + 2); G.stats.str = Math.max(1, G.stats.str - 1); } }
    ]
  },
  {
    id: 'gen_brawler_clash',
    age: null,
    era: null,
    title: 'THE BARROOM ACCUSATION',
    repeat: true,
    cat: 'social',
    text: 'A drunken sorcerer claims you stole his custom seal technique.',
    choices: [
      { t: 'Challenge him to an immediate arm-wrestling contest', r: 'You slam his arm down! STR +2, CHA +1.', ef: G => { G.stats.str = Math.min(20, G.stats.str + 2); G.stats.cha = Math.min(20, G.stats.cha + 1); } },
      { t: 'Buy him a heavy keg of rice wine to pacify him', r: 'He slurs a apology and gives a rare talisman. Credits -10, LCK +2.', ef: G => { G.credits = Math.max(0, G.credits - 10); G.stats.lck = Math.min(20, G.stats.lck + 2); } }
    ]
  }
];
