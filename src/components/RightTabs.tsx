/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Snd } from '../utils/sound';
import { GameState, NpcBond, EnemyTemplate } from '../types';

interface RightTabsProps {
  player: GameState;
  onUpdatePlayer: React.Dispatch<React.SetStateAction<GameState>>;
  onChallengeShikigami?: (shiki: EnemyTemplate) => void;
}

export default function RightTabs({ player, onUpdatePlayer, onChallengeShikigami }: RightTabsProps) {
  const [activeTab, setActiveTab] = useState<'bonds' | 'shop' | 'quests' | 'inv' | 'tech' | 'factions'>('bonds');
  const [selectedNpc, setSelectedNpc] = useState<NpcBond | null>(null);

  const handleTabChange = (tab: 'bonds' | 'shop' | 'quests' | 'inv' | 'tech' | 'factions') => {
    Snd.ui();
    setActiveTab(tab);
    setSelectedNpc(null);
  };

  const updateNpcInState = (updatedNpc: NpcBond) => {
    onUpdatePlayer(prev => {
      const idx = prev.npcs.findIndex(n => n.name === updatedNpc.name);
      if (idx === -1) return prev;
      const copies = [...prev.npcs];
      copies[idx] = updatedNpc;
      return { ...prev, npcs: copies };
    });
    setSelectedNpc(updatedNpc);
  };

  // Interactions
  const handleSpendTime = (npc: NpcBond) => {
    if (player.credits < 5) {
      Snd.miss();
      alert("Insufficient credits (Requires 5 ¥ to buy family gifts & refreshments).");
      return;
    }
    Snd.forge();
    const updated: NpcBond = {
      ...npc,
      bond: Math.min(100, npc.bond + 10),
      trust: Math.min(100, npc.trust + 8),
      respect: Math.min(100, npc.respect + 6),
      fear: Math.max(0, npc.fear - 4)
    };
    onUpdatePlayer(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits - 5)
    }));
    updateNpcInState(updated);
  };

  const handleGift = (npc: NpcBond) => {
    if (player.credits < 100) {
      Snd.miss();
      alert("Requires 100 ¥ to buy a lavish gift.");
      return;
    }
    Snd.forge();
    const updated: NpcBond = {
      ...npc,
      bond: Math.min(100, npc.bond + 20),
      trust: Math.min(100, npc.trust + 15),
    };
    onUpdatePlayer(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits - 100)
    }));
    updateNpcInState(updated);
    alert(`🎁 You gave a beautiful 100 ¥ gift to ${npc.name}. Their bond and trust increased significantly!`);
  };

  const handleInsult = (npc: NpcBond) => {
    Snd.miss();
    const updated: NpcBond = {
      ...npc,
      bond: Math.max(0, npc.bond - 25),
      trust: Math.max(0, npc.trust - 20),
      fear: Math.min(100, npc.fear + 15)
    };
    if (updated.bond <= 10 && updated.trust <= 10 && updated.rel !== 'Mother' && updated.rel !== 'Father' && updated.rel !== 'Child' && updated.rel !== 'Spouse') {
      updated.rel = 'Enemy';
      alert(`🤬 You insulted ${npc.name} brutally! They despise you. They are now your Enemy.`);
    } else {
      alert(`🤬 You insulted ${npc.name}. They are deeply offended.`);
    }
    updateNpcInState(updated);
  };

  const handleAssassinate = (npc: NpcBond) => {
    if (player.hp < 30) {
      Snd.miss();
      alert("You are too weak to attempt murder right now (Needs 30 HP).");
      return;
    }
    Snd.tech();
    const successRate = 0.5 + (0.5 * player.stats.agi / 30);
    const success = Math.random() < successRate;
    
    if (success) {
      Snd.atk();
      onUpdatePlayer(prev => ({
        ...prev,
        hp: prev.hp - 10,
        reputation: prev.reputation - 5,
        npcs: prev.npcs.filter(n => n.name !== npc.name)
      }));
      setSelectedNpc(null);
      alert(`🔪 ASSASSINATION SUCCESS: You ambushed and murdered ${npc.name}. They are gone from your life forever. You lost reputation.`);
    } else {
      Snd.crit();
      const updated: NpcBond = {
        ...npc,
        rel: 'Enemy',
        bond: 0,
        trust: 0,
        respect: 0,
        fear: Math.min(100, npc.fear + 50)
      };
      onUpdatePlayer(prev => ({
        ...prev,
        hp: Math.max(1, prev.hp - 30),
        reputation: prev.reputation - 10,
        npcs: prev.npcs.map(n => n.name === npc.name ? updated : n)
      }));
      setSelectedNpc(updated);
      alert(`💥 ASSASSINATION FAILED: ${npc.name} fought back! You took 30 damage. They are now your mortal Enemy and your reputation plummeted.`);
    }
  };

  const handleFlirt = (npc: NpcBond) => {
    Snd.tech();
    const updated: NpcBond = { ...npc };
    if (updated.romance === undefined) {
      updated.romance = 10;
    } else {
      updated.romance = Math.min(100, updated.romance + 15);
    }
    updated.bond = Math.min(100, updated.bond + 8);
    updated.trust = Math.min(100, updated.trust + 4);
    updated.respect = Math.max(0, updated.respect - 2); // Slight loss of respect initially
    updated.fear = Math.max(0, updated.fear - 3);

    updateNpcInState(updated);
  };

  const handleAskOut = (npc: NpcBond) => {
    const chance = Math.floor((npc.bond * 0.4) + (npc.trust * 0.4) + (npc.respect * 0.2) - (npc.fear * 0.1));
    const roll = Math.random() * 100;

    if (roll < chance) {
      Snd.forge();
      const updated: NpcBond = {
        ...npc,
        rel: 'Romance',
        yearsDated: 0,
        bond: Math.min(100, npc.bond + 15),
        trust: Math.min(100, npc.trust + 15)
      };
      updateNpcInState(updated);
      alert(`💖 Success! You asked out ${npc.name} and they happily said YES! You are now dating.`);
    } else {
      Snd.miss();
      const updated: NpcBond = {
        ...npc,
        bond: Math.max(0, npc.bond - 10),
        trust: Math.max(0, npc.trust - 12)
      };
      updateNpcInState(updated);
      alert(`💔 Ouch! ${npc.name} declined or changed the topic. Strengthen your bond and trust before asking again.`);
    }
  };

  const handleMarry = (npc: NpcBond) => {
    if (npc.bond < 90 || npc.trust < 90) {
      Snd.miss();
      alert(`Requires at least 90 Bond and 90 Trust to propose marriage to ${npc.name}!`);
      return;
    }
    Snd.forge();
    const updated: NpcBond = {
      ...npc,
      rel: 'Spouse',
      isSpouse: true,
      bond: 100,
      trust: 100
    };
    updateNpcInState(updated);
    alert(`💍 MARRY: You proposed to ${npc.name} at a beautiful Shinto shrine and married them!`);
  };

  const handleStartFamily = (npc: NpcBond) => {
    Snd.forge();
    const updated: NpcBond = {
      ...npc,
      monthsPregnant: 1
    };
    updateNpcInState(updated);
    alert(`👶 SUCCESS: You and ${npc.name} chose to start a family. A child will arrive after 9 months of pregnancy (passes on the next Age Up!)`);
  };

  const handleAdoptChild = (npc: NpcBond) => {
    if (player.credits < 30) {
      Snd.miss();
      alert("Adoption paperwork costs exactly 30 ¥.");
      return;
    }
    Snd.forge();
    
    // Create child bond
    const childName = `Ren ${player.lastName || 'Soji'}`;
    const childNpc: NpcBond = {
      name: childName,
      rel: 'Adopted Child',
      bond: 50,
      trust: 50,
      respect: 30,
      fear: 5,
      gender: Math.random() > 0.5 ? 'M' : 'F'
    };

    onUpdatePlayer(prev => {
      return {
        ...prev,
        credits: Math.max(0, prev.credits - 30),
        npcs: [...prev.npcs, childNpc]
      };
    });

    alert(`📋 ADOPTION: You and ${npc.name} officially adopted ${childName}! They are now part of your relations.`);
    setSelectedNpc(npc);
  };

  // Shoppe Items list
  const SHOP_ITEMS = [
    { name: 'Special Healing Draft', cost: 12, desc: 'Heals +45 VITALS (HP) instantly during or outside of conflict.', type: 'heal' },
    { name: 'Gojo Sweet Mochi', cost: 15, desc: 'Restores +50 OCCULT CE. Promotes deep bonds and focus.', type: 'mochi' },
    { name: 'Occult Training Weights', cost: 25, desc: 'Perm increases STR +2 base attributes permanently upon purchase.', type: 'str_buff' },
    { name: 'Gilded Frame Program', cost: 35, desc: 'Perm increases AGI +2 base agility permanently upon purchase.', type: 'agi_buff' },
    { name: 'Iron Shackle Band', cost: 30, desc: 'Perm increases END +2 base endurance permanently upon purchase.', type: 'end_buff' },
    { name: 'Inverted Spear Replica', cost: 80, desc: 'Adds permanent +12 basic speed flurries & technique kinetic impacts.', type: 'wpn' }
  ];

  const handleBuyItem = (item: typeof SHOP_ITEMS[0]) => {
    if (player.credits < item.cost) {
      Snd.miss();
      alert("Insufficient funds in currency matrix!");
      return;
    }

    Snd.forge();

    onUpdatePlayer(prev => {
      const nextCredits = Math.max(0, prev.credits - item.cost);
      let nextStats = { ...prev.stats };
      let nextMaxHp = prev.maxHp;
      let nextMaxCe = prev.maxCe;

      // Handle direct permanent stat injectors
      if (item.type === 'str_buff') {
        nextStats.str = Math.min(40, nextStats.str + 2);
      } else if (item.type === 'agi_buff') {
        nextStats.agi = Math.min(40, nextStats.agi + 2);
      } else if (item.type === 'end_buff') {
        nextStats.end = Math.min(40, nextStats.end + 2);
        // Recalculating HP caps if endurance changed
        const hpGrowth = 8;
        nextMaxHp = prev.maxHp + hpGrowth;
      }

      // Add to inventory
      const existingIdx = prev.inventory.findIndex(i => i.name === item.name);
      const updatedInv = [...prev.inventory];
      if (existingIdx !== -1) {
        updatedInv[existingIdx] = {
          ...updatedInv[existingIdx],
          qty: updatedInv[existingIdx].qty + 1
        };
      } else {
        updatedInv.push({ name: item.name, qty: 1 });
      }

      return {
        ...prev,
        credits: nextCredits,
        stats: nextStats,
        maxHp: nextMaxHp,
        inventory: updatedInv
      };
    });

    alert(`✓ Purchased: ${item.name}! Spent -${item.cost} ¥.`);
  };

  return (
    <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-[#112019] bg-[#040908] flex flex-col h-full flex-shrink-0 select-none overflow-hidden">
      {/* Tab Selectors header */}
      <div className="flex border-b border-[#112019] flex-wrap bg-black/40">
        {([
          { k: 'bonds', l: 'Bonds' },
          { k: 'shop', l: 'Shop' },
          { k: 'quests', l: 'Tasks' },
          { k: 'inv', l: 'Bag' },
          { k: 'tech', l: 'Arts' },
          { k: 'factions', l: 'Factions' }
        ] as const).map(tab => (
          <button
            key={tab.k}
            onClick={() => handleTabChange(tab.k)}
            className={`flex-1 min-w-[50px] py-2 text-[9px] font-extrabold tracking-widest uppercase transition-all border-r border-[#112019] last:border-r-0 cursor-pointer ${
              activeTab === tab.k
                ? 'text-[#00ff9c] bg-[rgba(0,255,156,0.05)] font-black'
                : 'text-[#2e4a34] bg-transparent hover:text-[#628a6a]'
            }`}
          >
            {tab.l}
          </button>
        ))}
      </div>

      {/* Tab contents scroll section */}
      <div className="flex-1 overflow-y-auto p-3 text-sans">
        
        {/* TAB 1: SOCIAL CONNECTIONS */}
        {activeTab === 'bonds' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#112019] pb-1 select-none">
              <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase font-extrabold">
                {selectedNpc ? `// Bond: ${selectedNpc.name} //` : '// Social Connections //'}
              </h4>
              {selectedNpc && (
                <button
                  onClick={() => {
                    Snd.ui();
                    setSelectedNpc(null);
                  }}
                  className="text-[9px] text-[#00ff9c] hover:underline"
                >
                  ↩ CLOSE
                </button>
              )}
            </div>

            {selectedNpc ? (
              /* NPC Detail Panel */
              <div className="border border-[#112019] bg-black p-3 rounded-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-[#a4c8aa]">
                    {selectedNpc.name} <span className="text-[10px] text-gray-500 font-normal">({selectedNpc.gender})</span>
                  </div>
                  <span className="text-[8px] border border-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">
                    {selectedNpc.rel}
                  </span>
                </div>
                
                {/* Year Durations */}
                <div className="flex flex-col gap-0.5 mt-[-4px] mb-2 text-[9px] text-[#4d7155]">
                  {selectedNpc.knownYears !== undefined && selectedNpc.knownYears > 0 && (
                    <span>Known for: {selectedNpc.knownYears} year{selectedNpc.knownYears > 1 ? 's' : ''}</span>
                  )}
                  {selectedNpc.yearsDated !== undefined && selectedNpc.yearsDated > 0 && (
                    <span className="text-[#ff80bf]/70">Dating for: {selectedNpc.yearsDated} year{selectedNpc.yearsDated > 1 ? 's' : ''}</span>
                  )}
                  {selectedNpc.marriedYears !== undefined && selectedNpc.marriedYears > 0 && (
                    <span className="text-emerald-400/70">Married for: {selectedNpc.marriedYears} year{selectedNpc.marriedYears > 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* The 4 Stats */}
                <div className="space-y-2 text-[9px]">
                  {/* Stat: Bond */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[#2e4a34]">
                      <span>BOND (AFFECTION)</span>
                      <span className="text-[#a4c8aa]">{selectedNpc.bond}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0a120e] rounded-sm overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${selectedNpc.bond}%` }} />
                    </div>
                  </div>

                  {/* Stat: Trust */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[#2e4a34]">
                      <span>TRUST (LOYALTY)</span>
                      <span className="text-sky-400">{selectedNpc.trust}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0a120e] rounded-sm overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${selectedNpc.trust}%` }} />
                    </div>
                  </div>

                  {/* Stat: Respect */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[#2e4a34]">
                      <span>RESPECT (ESTEEM)</span>
                      <span className="text-amber-400">{selectedNpc.respect}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0a120e] rounded-sm overflow-hidden">
                      <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${selectedNpc.respect}%` }} />
                    </div>
                  </div>

                  {/* Stat: Fear */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[#2e4a34]">
                      <span>FEAR (DOMINANCE)</span>
                      <span className="text-red-400">{selectedNpc.fear}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0a120e] rounded-sm overflow-hidden">
                      <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${selectedNpc.fear}%` }} />
                    </div>
                  </div>

                  {/* Stat: Romance (If Unlocked) */}
                  {selectedNpc.romance !== undefined && (
                    <div className="space-y-0.5 border-t border-[#112019] pt-2">
                      <div className="flex justify-between text-[#ff80bf]">
                        <span>ROMANCE LEVEL</span>
                        <span className="text-[#ff80bf] font-bold">{selectedNpc.romance}%</span>
                      </div>
                      <div className="h-1.5 bg-[#0a120e] rounded-sm overflow-hidden border border-[#ff80bf]/25">
                        <div className="h-full bg-[#ff80bf] transition-all duration-300" style={{ width: `${selectedNpc.romance}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Pregnant Progress */}
                  {selectedNpc.monthsPregnant !== undefined && (
                    <div className="bg-purple-950/20 text-[#a4c8aa] text-[8.5px] p-2 border border-purple-900/40 text-center leading-relaxed font-bold animate-pulse">
                      🤰 Pregnancy Protocol: Progressing ({selectedNpc.monthsPregnant}/9 months). Child emerges on the next Age Up event!
                    </div>
                  )}
                </div>

                {/* Interaction Action list */}
                <div className="space-y-1.5 border-t border-[#112019] pt-2">
                  <button
                    onClick={() => handleSpendTime(selectedNpc)}
                    className="w-full text-left bg-black text-[#a4c8aa] font-bold text-[9px] hover:border-[#00ff9c] hover:bg-[#00ff9c]/5 py-2 px-2.5 border border-[#112019] flex justify-between items-center transition cursor-pointer"
                  >
                    <span>☕ Spend Time Together</span>
                    <span className="text-amber-500">-5 ¥</span>
                  </button>
                  
                  <button
                    onClick={() => handleGift(selectedNpc)}
                    className="w-full text-left bg-black text-amber-300 font-bold text-[9px] hover:border-amber-400 hover:bg-amber-400/5 py-2 px-2.5 border border-[#112019] flex justify-between items-center transition cursor-pointer"
                  >
                    <span>🎁 Give Lavish Gift</span>
                    <span className="text-amber-500">-100 ¥</span>
                  </button>

                  <button
                    onClick={() => handleInsult(selectedNpc)}
                    className="w-full text-left bg-black text-orange-400 font-bold text-[9px] hover:border-orange-500 hover:bg-orange-500/5 py-2 px-2.5 border border-[#112019] transition cursor-pointer"
                  >
                    🤬 Brutally Insult
                  </button>

                  <button
                    onClick={() => handleAssassinate(selectedNpc)}
                    className="w-full text-left bg-black text-red-500 font-bold text-[9px] hover:border-red-600 hover:bg-red-600/5 py-2 px-2.5 border border-[#112019] transition cursor-pointer"
                  >
                    🔪 Assassinate / Attack
                  </button>

                  {/* Flirting Option */}
                  {selectedNpc.rel !== 'Father' && selectedNpc.rel !== 'Mother' && selectedNpc.rel !== 'Child' && selectedNpc.rel !== 'Adopted Child' && !selectedNpc.isSpouse && (
                    <button
                      onClick={() => handleFlirt(selectedNpc)}
                      className="w-full text-left bg-black text-[#ff80bf] font-bold text-[9px] hover:border-[#ff80bf] hover:bg-[#ff80bf]/5 py-2 px-2.5 border border-[#112019] transition cursor-pointer"
                    >
                      💖 Flirt & Seek Resonance
                    </button>
                  )}

                  {/* Ask Out Option */}
                  {selectedNpc.romance !== undefined && selectedNpc.romance >= 100 && selectedNpc.rel !== 'Romance' && !selectedNpc.isSpouse && (
                    <button
                      onClick={() => handleAskOut(selectedNpc)}
                      className="w-full text-center bg-transparent text-[#ff80bf] font-bold text-[10px] hover:border-[#ff80bf] hover:bg-[#ff80bf]/15 py-2.5 border-2 border-[#ff80bf]/60 rounded-sm cursor-pointer transition animate-pulse"
                    >
                      💍 Ask Out & Date!
                    </button>
                  )}

                  {/* Marriage Option */}
                  {selectedNpc.rel === 'Romance' && (selectedNpc.yearsDated || 0) >= 1 && !selectedNpc.isSpouse && (
                    <button
                      onClick={() => handleMarry(selectedNpc)}
                      className="w-full text-center bg-transparent text-emerald-400 font-bold text-[10px] hover:border-emerald-400 hover:bg-emerald-950/20 py-2.5 border-2 border-emerald-500/60 rounded-sm cursor-pointer transition animate-pulse"
                    >
                      💒 Propose Shinto Marriage! (Dated {selectedNpc.yearsDated} yr)
                    </button>
                  )}

                  {/* Spouse specific options */}
                  {(selectedNpc.isSpouse || selectedNpc.rel === 'Romance') && selectedNpc.monthsPregnant === undefined && (
                    <button
                      onClick={() => handleStartFamily(selectedNpc)}
                      className="w-full text-center bg-[#a2005a]/10 text-[#ff80bf] font-bold text-[9.5px] hover:bg-[#a2005a]/25 py-2 border border-[#a2005a]/40 rounded-sm cursor-pointer transition"
                    >
                      🍼 Start a Family (Gestate Child)
                    </button>
                  )}

                  {(selectedNpc.isSpouse || selectedNpc.rel === 'Romance') && (
                    <button
                      onClick={() => handleAdoptChild(selectedNpc)}
                      className="w-full text-left bg-black text-[#a4c8aa] font-bold text-[9px] hover:border-[#00ff9c] hover:bg-[#00ff9c]/5 py-2 px-2.5 border border-[#112019] flex justify-between items-center transition cursor-pointer"
                    >
                      <span>📋 Adopt a Child from Orphanage</span>
                      <span className="text-amber-500">-30 ¥</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* NPC Grid List */
              <div className="space-y-1.5">
                {player.npcs.map((npc, idx) => {
                  let relColor = 'text-[#628a6a] border-[#112019]';
                  if (npc.rel === 'Best Friend') relColor = 'text-[#00ff9c] border-[#00c47a]/20 bg-[#00ff9c]/5';
                  else if (npc.rel === 'Mentor') relColor = 'text-[#ffcc00] border-[#ffcc00]/20 bg-[#ffcc00]/5';
                  else if (npc.rel === 'Rival') relColor = 'text-orange-400 border-orange-400/20 bg-orange-500/5';
                  else if (npc.rel === 'Enemy') relColor = 'text-red-500 border-red-500/20 bg-red-500/5';
                  else if (npc.rel === 'Romance' || npc.rel === 'Spouse') relColor = 'text-[#ff80bf] border-[#ff80bf]/20 bg-[#ff80bf]/5';
                  else if (npc.rel === 'Father' || npc.rel === 'Mother') relColor = 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        Snd.ui();
                        setSelectedNpc(npc);
                      }}
                      className="flex justify-between items-center p-2 border border-[#112019] bg-black hover:border-[#00ff9c] cursor-pointer transition rounded-sm"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#a4c8aa]">{npc.name}</div>
                        <div className="text-[7.5px] text-[#2e4a34] tracking-widest mt-0.5">
                          BOND: {npc.bond}% / TRUST: {npc.trust}%
                        </div>
                      </div>
                      <div className={`text-[8px] font-bold tracking-wider border px-1.5 py-0.5 rounded-sm uppercase ${relColor}`}>
                        {npc.rel}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GENERAL OCCULT SHOP */}
        {activeTab === 'shop' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#112019] pb-1 select-none">
              <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase font-extrabold">
                // Occult Shoppe //
              </h4>
              <div className="text-[10px] text-[#00ff9c] font-bold px-1.5 py-0.5 border border-[#112019]">
                ¥ {player.credits}
              </div>
            </div>

            <div className="space-y-2">
              {SHOP_ITEMS.map((item, idx) => {
                const canAfford = player.credits >= item.cost;
                return (
                  <div key={idx} className="p-2.5 border border-[#112019] bg-[#020504] space-y-1 bg-gradient-to-b from-[#050a08]/40 to-black select-text">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#a4c8aa]">{item.name}</span>
                      <span className="text-[10px] font-extrabold text-[#00c47a] bg-black px-1.5 border border-[#112019] font-mono">
                        {item.cost} ¥
                      </span>
                    </div>
                    <p className="text-[8.5px] text-[#2e4a34] leading-normal select-none">{item.desc}</p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={!canAfford}
                        className={`text-[8px] font-extrabold uppercase px-3 py-1.5 border cursor-pointer ${
                          canAfford
                            ? 'border-[#00ff9c] text-[#00ff9c] bg-[#00ff9c]/5 hover:bg-[#00ff9c]/15'
                            : 'border-[#112019] text-[#2e4a34] cursor-not-allowed opacity-30'
                        }`}
                      >
                        ✓ ENGAGE BUY
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE QUESTS */}
        {activeTab === 'quests' && (
          <div className="space-y-2">
            <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2 font-bold select-none border-b border-[#112019] pb-1">
              // Active Directives //
            </h4>
            {player.quests.length > 0 ? (
              <div className="space-y-1.5">
                {player.quests.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2 border border-[#112019] bg-black rounded-sm space-y-1"
                  >
                    <div className="text-xs text-[#a4c8aa] leading-snug">{q.title}</div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc00]"></span>
                      <span className="text-[8px] font-bold text-[#ffcc00] tracking-widest uppercase">
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[#2e4a34] leading-relaxed text-center py-8">
                All pathways clear. No ongoing directives.
              </p>
            )}
          </div>
        )}

        {/* TAB 4: INVENTORY */}
        {activeTab === 'inv' && (
          <div className="space-y-2">
            <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2 font-bold select-none border-b border-[#112019] pb-1">
              // Storage Inventory //
            </h4>
            {player.inventory.length > 0 ? (
              <div className="space-y-1">
                {player.inventory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 border border-[#112019] bg-[#020504] text-xs hover:border-[#2e4a34]"
                  >
                    <span className="text-[#628a6a] font-medium">{item.name}</span>
                    <span className="text-[10px] text-[#00c47a] bg-black border border-[#112019] px-1.5">
                      ×{item.qty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[#2e4a34] leading-relaxed text-center py-8">
                Your pockets are empty. Secure credits and tools from missions.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: ARTS DETAIL */}
        {activeTab === 'tech' && (
          <div className="space-y-3.5 p-1">
            <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2 font-bold select-none border-b border-[#112019] pb-1">
              // Innate Arts //
            </h4>
            <div className="border border-[#112019] bg-black p-3 space-y-2 rounded-sm select-text text-sans">
              <h5 className="text-sm font-bold text-purple-400 uppercase tracking-wider font-vt">
                {player.techName}
              </h5>
              <p className="text-[10px] text-[#628a6a] leading-relaxed">
                An active soul signature triggering spatial compression loops and raw negative volume manipulations.
              </p>
              <div className="pt-2 border-t border-[#112019] grid grid-cols-2 gap-1.5 text-[9px] text-[#2e4a34] tracking-widest">
                <div>MASTERY:</div>
                <div className="text-right text-[#00ff9c] font-bold">{player.stats.mst}/20</div>
                <div>ENERGY RATIO:</div>
                <div className="text-right text-[#00ff9c] font-bold">{player.stats.ce}/20</div>
              </div>
            </div>

            {/* Ten Shadows Taming Ritual list */}
            {player.techKey === 'ten_shad' && (
              <div className="border border-[#112019] bg-[#020504] p-3 space-y-2 rounded-sm">
                <h5 className="text-[10px] text-[#00ff9c] font-bold tracking-widest uppercase border-b border-[#112019] pb-1.5">
                  🔮 SHIKIGAMI TAMING RITUALS
                </h5>
                <p className="text-[9px] text-[#4d7155] leading-relaxed pb-1 select-none">
                  Defeat shadows in a solo Taming Ritual to bind and summon them in subsequent battles!
                </p>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {[
                    { key: 'dog', name: 'Divine Dog Totality', grade: 'Grade 3', hp: 80, desc: 'Swift hunting jaws with critical claws.', agi: 12, str: 8, mst: 6 },
                    { key: 'toad', name: 'Toad', grade: 'Grade 3', hp: 70, desc: 'Ensnaring sticky tongue.', agi: 10, str: 7, mst: 6 },
                    { key: 'serpent', name: 'Great Serpent (Orochi)', grade: 'Grade 2', hp: 120, desc: 'Colossal snake binding targets from beneath.', agi: 10, str: 17, mst: 12 },
                    { key: 'nue', name: 'Nue (Thunder Bird)', grade: 'Grade 2', hp: 130, desc: 'Winged eagle charging electrical currents.', agi: 15, str: 10, mst: 12 },
                    { key: 'rabbit', name: 'Rabbit Escape', grade: 'Grade 3', hp: 50, desc: 'Countless distracting rabbits.', agi: 16, str: 4, mst: 8 },
                    { key: 'elephant', name: 'Max Elephant', grade: 'Grade 2', hp: 160, desc: 'Crushing water pressure and earth stomps.', agi: 6, str: 14, mst: 10 },
                    { key: 'ox', name: 'Piercing Ox', grade: 'Grade 1', hp: 220, desc: 'Linear charging beast of destruction.', agi: 5, str: 24, mst: 10 },
                    { key: 'deer', name: 'Round Deer (Madoka)', grade: 'Grade 1', hp: 140, desc: 'Nullifies techniques with Reverse Cursed Technique.', agi: 8, str: 6, mst: 15 },
                    { key: 'tiger', name: 'Mourning Tiger', grade: 'Grade 1', hp: 190, desc: 'Ferocious beast with blazing speed.', agi: 14, str: 16, mst: 12 },
                    { key: 'abyss', name: 'Wells Unknown Abyss', grade: 'Grade 1', hp: 120, desc: 'Fusion of Toad and Nue, electrical sticky traps.', agi: 14, str: 11, mst: 10 },
                    { key: 'agito', name: 'Chimera Beast Agito', grade: 'Special Grade', hp: 350, desc: 'Ultimate fusion beast with incredible power.', agi: 19, str: 25, mst: 22 },
                    { key: 'mahoraga', name: 'Divine General Mahoraga', grade: 'Special Grade', hp: 450, desc: 'The untamed general of absolute adaptation.', agi: 18, str: 28, mst: 25 }
                  ].map(shiki => {
                    const isTamed = !!player.flags[`tamed_${shiki.key}`];
                    return (
                      <div
                        key={shiki.key}
                        className="p-2 border border-[#112019] bg-black hover:border-[#1d3828] transition flex justify-between items-center"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-purple-300 font-vt uppercase tracking-wide">
                              {shiki.name}
                            </span>
                            <span className="text-[8px] text-[#2e4a34] scale-90">
                              [{shiki.grade}]
                            </span>
                          </div>
                          <p className="text-[8px] text-[#4d7155] leading-none">{shiki.desc}</p>
                        </div>

                        {isTamed ? (
                          <span className="text-[9px] font-bold text-[#00ff9c] bg-[rgba(0,255,156,0.06)] px-1.5 py-0.5 border border-[#00ff9c]/10 rounded-sm select-none">
                            ✓ TAMED
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              Snd.ui();
                              if (onChallengeShikigami) {
                                onChallengeShikigami({
                                  name: shiki.name,
                                  grade: shiki.grade,
                                  hp: [shiki.hp, shiki.hp],
                                  ce: [50, 80],
                                  str: [shiki.str, shiki.str],
                                  agi: [shiki.agi, shiki.agi],
                                  mst: [shiki.mst, shiki.mst],
                                  xp: shiki.key === 'mahoraga' ? 400 : 100,
                                  cr: [0, 0],
                                  isShikigami: true,
                                  shikiKey: shiki.key
                                });
                              }
                            }}
                            className="bg-purple-950/20 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:text-white px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider transition cursor-pointer"
                          >
                            TAMING BATTLE
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: FACTIONS, SCHOOLS, & DOJOS */}
        {activeTab === 'factions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#112019] pb-1 select-none">
              <h4 className="text-[10px] text-[#2e4a34] tracking-widest uppercase font-extrabold font-mono">
                // Factions & Dojos //
              </h4>
              <span className="text-[10px] text-[#00ff9c] font-black font-mono">REP: {player.reputation || 0}pts</span>
            </div>

            {/* Part 1: School System */}
            <div className="space-y-2">
              <h5 className="text-[9px] text-[#4d7155] font-extrabold uppercase tracking-widest block font-sans">// JUJUTSU ACADEMICS:</h5>
              {player.flags.enrolledHigh ? (
                <div className="bg-black/60 border border-[#00ff9c]/20 p-2.5 rounded-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10.5px] font-black text-white hover:text-[#00ff9c] uppercase tracking-wide">
                        🏫 Tokyo Jujutsu High
                      </div>
                      <p className="text-[8px] text-gray-400 mt-0.5">Enrolled Student (Trust Active)</p>
                    </div>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 font-extrabold px-1.5 py-0.5 border border-emerald-400/20 uppercase">
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-[9px] text-neutral-300 leading-normal italic">
                    "The path of a sorcerer is characterized by individual death, but collectively, we stand together."
                  </p>

                  {/* School Action: Peer Sparring / Joint Training */}
                  <div className="pt-2 border-t border-[#112019] space-y-1.5">
                    <span className="text-[8px] text-[#4d7155] font-extrabold uppercase block">// SPECIAL ACADEMIC SPARRING:</span>
                    <button
                      onClick={() => {
                        if (player.credits < 12) {
                          Snd.miss();
                          alert("Requires 12 ¥ (credits) to purchase quality grade-one sparring energy drinks.");
                          return;
                        }
                        Snd.tech();
                        onUpdatePlayer(prev => ({
                          ...prev,
                          credits: Math.max(0, prev.credits - 12),
                          stats: {
                            ...prev.stats,
                            str: Math.min(20, prev.stats.str + 1),
                            agi: Math.min(20, prev.stats.agi + 1),
                            mst: Math.min(20, prev.stats.mst + 1)
                          }
                        }));
                        alert("⚡ Sparred with classmate peers at Jujutsu High! Strength +1, Agility +1, Mastery +1, Spent -12 ¥!");
                      }}
                      className="w-full bg-[#00ff9c]/10 text-[#00ff9c] border border-[#00ff9c]/30 hover:bg-[#00ff9c]/20 text-[9px] font-bold py-1 px-2 uppercase tracking-wide cursor-pointer transition"
                    >
                      🤝 Joint Spar with Classmates (-12 ¥)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 border border-[#112019] p-2.5 rounded-sm space-y-2">
                  <div className="text-[10px] font-bold text-[#628a6a] uppercase">// Unenrolled Student //</div>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    You have not enrolled in Jujutsu High yet. To gain admission, classmates support, and access Tokyo's premium barrier library, you must raise your reputation to <span className="font-bold text-white">15+</span>!
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        Snd.ui();
                        if (player.hp < 15) {
                          Snd.miss();
                          alert("You are too exhausted to try out. Resting is advised! (Need 15+ HP)");
                          return;
                        }
                        
                        // Small chance to meet a new NPC
                        let newNpcs = [...player.npcs];
                        let metSomeone = false;
                        if (Math.random() < 0.3) {
                          const genders = ['M', 'F'];
                          const firsts = ['Kaito', 'Ryo', 'Takeo', 'Mei', 'Rina', 'Yuri', 'Kenji', 'Shin', 'Hiro'];
                          const lasts = ['Sato', 'Suzuki', 'Tanaka', 'Ito', 'Watanabe', 'Kumagai', 'Okamoto'];
                          const newName = `${firsts[Math.floor(Math.random() * firsts.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`;
                          if (!newNpcs.find(n => n.name === newName)) {
                            newNpcs.push({ name: newName, rel: 'Rival', bond: 5, trust: 10, respect: 5, fear: 0, gender: genders[Math.floor(Math.random() * genders.length)] as 'M' | 'F', famous: false });
                            metSomeone = true;
                          }
                        }

                        const repGain = Math.floor(Math.random() * 3) + 1; // 1 to 3
                        
                        onUpdatePlayer(prev => ({
                          ...prev,
                          hp: prev.hp - 10,
                          reputation: (prev.reputation || 0) + repGain,
                          npcs: metSomeone ? newNpcs : prev.npcs
                        }));
                        
                        alert(`🥋 You sparred with some Jujutsu students! Lost 10 HP. Gained +${repGain} Reputation!${metSomeone ? ' You also met an aspiring sorcerer during the spar!' : ''}`);
                      }}
                      className="w-full bg-purple-950/20 text-purple-300 border border-purple-500/30 hover:border-purple-400 hover:text-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wider transition cursor-pointer"
                    >
                      🥋 Try Out (Spar with Students)
                    </button>

                    <button
                      disabled={(player.reputation || 0) < 15}
                    onClick={() => {
                      Snd.heavyHit();
                      let injectedNpcs: NpcBond[] = [];
                      const eraStr = (player.era || '').toLowerCase();
                      if (eraStr === 'modern' || eraStr === 'shibuya') {
                        injectedNpcs = [
                          { name: 'Yuji Itadori', rel: 'Friend', bond: 30, trust: 25, respect: 20, fear: 5, gender: 'M', famous: true },
                          { name: 'Megumi Fushiguro', rel: 'Friend', bond: 18, trust: 15, respect: 25, fear: 2, gender: 'M', famous: true },
                          { name: 'Nobara Kugisaki', rel: 'Friend', bond: 25, trust: 20, respect: 20, fear: 12, gender: 'F', famous: true },
                          { name: 'Satoru Gojo', rel: 'Mentor', bond: 20, trust: 20, respect: 50, fear: 10, gender: 'M', famous: true }
                        ];
                      } else if (eraStr === 'showa') {
                        injectedNpcs = [
                          { name: 'Satoru Gojo (Teen)', rel: 'Rival', bond: 15, trust: 12, respect: 20, fear: 15, gender: 'M', famous: true },
                          { name: 'Suguru Geto (Teen)', rel: 'Friend', bond: 22, trust: 20, respect: 25, fear: 8, gender: 'M', famous: true },
                          { name: 'Shoko Ieiri', rel: 'Friend', bond: 25, trust: 30, respect: 35, fear: 0, gender: 'F', famous: true }
                        ];
                      } else {
                        injectedNpcs = [
                          { name: 'Uraume', rel: 'Rival', bond: 5, trust: 5, respect: 30, fear: 40, gender: 'F', famous: true },
                          { name: 'Kenjaku (Ancestor)', rel: 'Mentor', bond: 15, trust: 8, respect: 45, fear: 50, gender: 'M', famous: true },
                          { name: 'Ryu Ishigori', rel: 'Rival', bond: 12, trust: 10, respect: 25, fear: 8, gender: 'M', famous: true }
                        ];
                      }

                      onUpdatePlayer(prev => {
                        const existingNames = prev.npcs.map(n => n.name);
                        const filteredNew = injectedNpcs.filter(n => !existingNames.includes(n.name));
                        return {
                          ...prev,
                          currentSchool: 'Jujutsu High',
                          reputation: prev.reputation + 10,
                          npcs: [...prev.npcs, ...filteredNew],
                          flags: { ...prev.flags, enrolledHigh: true }
                        };
                      });

                      alert(`✨ WELCOME TO TOKYO JUJUTSU HIGH!\nYour reputation has earned you a solid nomination! Era-appropriate classmates (including Gojo if alive) have been introduced to your Bonds roster!`);
                    }}
                    className={`w-full text-center py-1 text-[9px] font-black uppercase tracking-wider border transition cursor-pointer ${
                      (player.reputation || 0) >= 15
                        ? 'border-[#00ff9c] bg-[#00ff9c]/10 text-[#00ff9c] hover:bg-[#00ff9c]/20'
                        : 'border-[#112019] bg-neutral-900/10 text-[#2e4a34] cursor-not-allowed'
                    }`}
                  >
                    {(player.reputation || 0) >= 15 ? '📝 Apply for admission (Rep: OK)' : '🔒 Apply (Requires 15 Rep)'}
                  </button>
                  </div>
                </div>
              )}
            </div>

            {/* Part 2: Dojo System */}
            <div className="space-y-2 pt-2 border-t border-[#112019]">
              <h5 className="text-[9px] text-[#4d7155] font-extrabold uppercase tracking-widest block font-sans">// CLAN TRAINING DOJO:</h5>
              {player.dojoTrust !== undefined && player.dojoTrust > 0 ? (
                <div className="bg-black/60 border border-purple-500/25 p-2.5 rounded-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10.5px] font-black text-purple-300 uppercase tracking-wide">
                        🥋 Zenin Clan Sword Dojo
                      </div>
                      <p className="text-[8px] text-purple-400 mt-0.5">Dojo Trust: <span className="font-bold text-white">{player.dojoTrust}%</span></p>
                    </div>
                    <span className="text-[8px] bg-purple-950 text-purple-300 font-extrabold px-1 py-0.5 border border-purple-500/20 uppercase">
                      REGISTERED
                    </span>
                  </div>

                  <div className="w-full bg-[#112019] h-1 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full animate-pulse" style={{ width: `${player.dojoTrust}%` }} />
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-[#112019]/40">
                    <span className="text-[8px] text-purple-400 font-bold uppercase block font-mono">// DOJO ACTIONS:</span>
                    
                    <button
                      onClick={() => {
                        if (player.credits < 5) {
                          Snd.miss();
                          alert("Requires 5 ¥ to buy pristine floor polishing cloths.");
                          return;
                        }
                        Snd.ui();
                        onUpdatePlayer(prev => ({
                          ...prev,
                          credits: Math.max(0, prev.credits - 5),
                          dojoTrust: Math.min(100, (prev.dojoTrust || 0) + 12)
                        }));
                        alert("🧹 Diligently cleaned and swept the Dojo tatami mats! The Dojo Master nods in silent respect. Dojo Trust +12%!");
                      }}
                      className="w-full text-left bg-black border border-purple-950 hover:border-purple-500 text-purple-300 text-[8px] font-bold py-1 px-1.5 uppercase tracking-wide cursor-pointer flex justify-between items-center transition"
                    >
                      <span>🧹 Sweep Dojo Mat</span>
                      <span className="text-pink-400 font-mono">-5 ¥</span>
                    </button>

                    <button
                      onClick={() => {
                        if (player.ce < 12) {
                          Snd.miss();
                          alert("Requires 12 CE.");
                          return;
                        }
                        Snd.tech();
                        onUpdatePlayer(prev => ({
                          ...prev,
                          ce: Math.max(0, prev.ce - 12),
                          dojoTrust: Math.min(100, (prev.dojoTrust || 0) + 15),
                          stats: {
                            ...prev.stats,
                            end: Math.min(20, prev.stats.end + 1),
                            str: Math.min(20, prev.stats.str + 1)
                          }
                        }));
                        alert("⚔ Sparred with Clan Instructors! Strength +1, Endurance +1, Dojo Trust +15%!");
                      }}
                      className="w-full text-left bg-black border border-purple-950 hover:border-purple-500 text-purple-300 text-[8px] font-bold py-1 px-1.5 uppercase tracking-wide cursor-pointer flex justify-between items-center transition"
                    >
                      <span>⚔ Spar with Dojo Instructors</span>
                      <span className="text-[#00ff9c] font-mono">-12 CE</span>
                    </button>

                    <button
                      disabled={player.dojoTrust < 80}
                      onClick={() => {
                        Snd.heavyHit();
                        onUpdatePlayer(prev => ({
                          ...prev,
                          dojoTrust: 5, // resets trust as master seal is claimed
                          flags: {
                            ...prev.flags,
                            dojo_secret_unlocked: true
                          },
                          stats: {
                            ...prev.stats,
                            mst: Math.min(20, prev.stats.mst + 3),
                            str: Math.min(20, prev.stats.str + 2)
                          }
                        }));
                        alert(`💮 OUTSTANDING ACHIEVEMENT! You reached 80%+ Trust! The Dojo master reveals the inner mysteries of continuous physical acceleration. MST +3, STR +2 permanently!`);
                      }}
                      className={`w-full text-center py-1 text-[8.5px] font-black uppercase tracking-wider border transition ${
                        player.dojoTrust >= 80
                          ? 'border-purple-400 bg-purple-950/25 text-purple-200 hover:bg-purple-950/50 cursor-pointer animate-pulse'
                          : 'border-neutral-950 text-neutral-600 bg-neutral-900/10 cursor-not-allowed'
                      }`}
                    >
                      {player.dojoTrust >= 80 ? '💮 Obtain Dojo Secret Art (TRUST READY!)' : '💮 Unlocks Secret Art (Requires 80% Trust)'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 border border-[#112019] p-2.5 rounded-sm space-y-2">
                  <div className="text-[10px] font-bold text-[#628a6a] uppercase">// Unaffiliated Dojo Wanderer //</div>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    You are currently independent. To gain Zenin Sword Dojo trust, enter training regimens, and learn their secret arts, pay their initiate registry fee of <span className="font-bold text-white">20 ¥</span>!
                  </p>

                  <button
                    disabled={player.credits < 20}
                    onClick={() => {
                      Snd.ui();
                      onUpdatePlayer(prev => ({
                        ...prev,
                        credits: Math.max(0, prev.credits - 20),
                        dojoTrust: 25
                      }));
                      alert("⛩️ Successfully registered with the Zenin Sword Dojo! Initial trust set to 25%! Spent -20 ¥.");
                    }}
                    className={`w-full text-center py-1 text-[9px] font-black uppercase tracking-wider border transition cursor-pointer ${
                      player.credits >= 20
                        ? 'border-purple-600/60 bg-purple-950/15 text-purple-400 hover:border-purple-400 hover:bg-purple-950/35'
                        : 'border-[#112019] text-[#2c3e1e] cursor-not-allowed'
                    }`}
                  >
                    {player.credits >= 20 ? '⛩️ Pay Initiator Registration Fee (-20 ¥)' : '🔒 Registration Fee (Requires 20 ¥)'}
                  </button>
                </div>
              )}
            </div>

            {/* Part 3: Underworld / City Streets */}
            <div className="space-y-2 pt-2 border-t border-[#112019]">
              <h5 className="text-[9px] text-[#4d7155] font-extrabold uppercase tracking-widest block font-sans">// CITY STREETS:</h5>
              <div className="bg-black/40 border border-[#112019] p-2.5 rounded-sm space-y-2">
                <p className="text-[9px] text-gray-500 leading-normal">
                  Network in the underground society and city streets. Expend HP to potentially encounter new sorcerers, curse users, and allies.
                </p>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (player.hp < 10) {
                      alert("You are too exhausted to network. HP must be 10+.");
                      return;
                    }
                    
                    let newNpcs = [...player.npcs];
                    let metSomeone = false;
                    let msg = "You roamed the streets but didn't meet anyone interesting.";

                    // High chance to meet a new NPC
                    if (Math.random() < 0.6) {
                      const genders = ['M', 'F'];
                      const firsts = ['Kaito', 'Ryo', 'Takeo', 'Mei', 'Rina', 'Yuri', 'Kenji', 'Shin', 'Hiro', 'Souta', 'Daiki', 'Kohaku'];
                      const lasts = ['Sato', 'Suzuki', 'Tanaka', 'Ito', 'Watanabe', 'Kumagai', 'Okamoto', 'Nakamura', 'Kobayashi', 'Yoshida', 'Abe'];
                      const newName = `${firsts[Math.floor(Math.random() * firsts.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`;
                      
                      if (!newNpcs.find(n => n.name === newName)) {
                        newNpcs.push({ 
                          name: newName, 
                          rel: Math.random() > 0.5 ? 'Friend' : 'Rival', 
                          bond: 10, trust: 15, respect: 10, fear: 5, 
                          gender: genders[Math.floor(Math.random() * genders.length)] as 'M' | 'F', 
                          famous: false 
                        });
                        metSomeone = true;
                        msg = `You met a new acquaintance: ${newName}!`;
                      }
                    }

                    onUpdatePlayer(prev => ({
                      ...prev,
                      hp: prev.hp - 10,
                      npcs: metSomeone ? newNpcs : prev.npcs,
                      reputation: (prev.reputation || 0) + (Math.random() > 0.5 ? 1 : 0)
                    }));
                    
                    alert(`🌆 ${msg} (Lost 10 HP)`);
                  }}
                  className="w-full text-center py-1 text-[9px] font-black uppercase tracking-wider border border-cyan-700/60 bg-cyan-950/15 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-950/35 transition cursor-pointer"
                >
                  🏙️ Patrol and Network (-10 HP)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
