/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Snd } from '../utils/sound';
import { TRAINING_REGIMENS, ENEMIES } from '../data/gameData';
import { TrainingRegimen, EnemyTemplate } from '../types';

interface ModalsProps {
  modalOpen: 'passtime' | 'train' | 'missions' | 'actions' | null;
  onClose: () => void;
  onSelectPassTime: (months: number) => void;
  onSelectTrain: (regimen: TrainingRegimen) => void;
  onSelectMission?: (enemy: EnemyTemplate) => void;
  onSelectAction?: (actionKey: string) => void;
  playerLevel?: number;
}

export default function Modals({
  modalOpen,
  onClose,
  onSelectPassTime,
  onSelectTrain,
  onSelectMission,
  onSelectAction,
  playerLevel = 1
}: ModalsProps) {
  if (!modalOpen) return null;

  // For missions, derive 3 suitable missions based on player level
  const missions = React.useMemo(() => {
    if (modalOpen !== 'missions') return [];
    
    // Scale opponent index based on array length (~170) and typical max level (~30)
    const scaleFactor = ENEMIES.length / 30; // approx 5.5
    let fitLevelIndex = Math.floor(playerLevel * scaleFactor);
    fitLevelIndex = Math.min(ENEMIES.length - 1, Math.max(0, fitLevelIndex));
    
    let choices: EnemyTemplate[] = [];
    
    // Add an easy mission
    choices.push(ENEMIES[Math.max(0, fitLevelIndex - Math.floor(scaleFactor))]);
    
    // Add a normal mission
    choices.push(ENEMIES[fitLevelIndex]);
    
    // Add a hard mission / special grade potential
    const hardBoost = Math.floor(Math.random() * (scaleFactor * 2)) + Math.floor(scaleFactor);
    choices.push(ENEMIES[Math.min(ENEMIES.length - 1, fitLevelIndex + hardBoost)]);

    // Ensure we have unique missions
    return Array.from(new Set(choices));
  }, [modalOpen, playerLevel]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#040908] border border-[#1d3828] rounded-sm focus:outline-none shadow-[0_0_35px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#070e0b] border-b border-[#112019] px-4 py-3">
          <span className="text-sm font-bold font-vt text-[#00ff9c] tracking-widest uppercase">
            {modalOpen === 'passtime' ? '// Pass Time Threshold //' : modalOpen === 'train' ? '// Training Regimens //' : modalOpen === 'missions' ? '// Available Missions //' : '// Available Actions //'}
          </span>
          <button
            onClick={() => {
              Snd.ui();
              onClose();
            }}
            className="text-xs text-[#2e4a34] border border-[#112019] w-6 h-6 flex items-center justify-center hover:border-red-500 hover:text-red-500 cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {modalOpen === 'passtime' ? (
            <div className="space-y-4">
              <p className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2">
                Select timeline jump duration (Each month triggers energy resets and event rolls):
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      Snd.ui();
                      onSelectPassTime(m);
                    }}
                    className="py-3 border border-[#112019] bg-[#020504] text-xs hover:border-[#00ff9c] hover:text-[#00ff9c] hover:bg-[rgba(0,255,156,0.02)] transition-all cursor-pointer text-center font-bold"
                  >
                    {m} {m === 1 ? 'MO' : 'MOS'}
                  </button>
                ))}
              </div>
            </div>
          ) : modalOpen === 'missions' ? (
            <div className="space-y-4">
              <div className="bg-[#0f1c16] p-3 border border-[#1d3828] hidden md:block">
                <p className="text-[10px] text-[#4d7155] font-mono leading-relaxed">
                  <span className="text-[#00ff9c]">[JUJUTSU HIGH SECURE INTEL]</span><br/>
                  Window surveillance has confirmed multiple cursed signatures in the sector. Select a target to deploy a curtain and commence the exorcism. Target threat levels are estimations based on residual cursed energy output.
                </p>
              </div>
              <p className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2">
                Available Field Operations:
              </p>
              {missions.map((mission, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    Snd.ui();
                    if (onSelectMission) onSelectMission(mission);
                  }}
                  className="w-full text-left p-4 border border-[#112019] bg-gradient-to-r from-[#020504] to-[#040908] hover:border-red-600 hover:from-[#1a0505] hover:to-black group transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 h-full w-12 bg-red-900/0 group-hover:bg-red-600/10 transition-colors skew-x-12 translate-x-4" />
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-sm font-bold text-red-500 group-hover:text-red-400 capitalize tracking-wide">{mission.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 border font-bold uppercase tracking-widest ${mission.grade.includes('Special') ? 'border-purple-500/50 text-purple-400 bg-purple-950/20' : mission.grade.includes('1') ? 'border-amber-500/50 text-amber-500 bg-amber-950/20' : 'border-[#00ff9c]/30 text-[#00ff9c] bg-[#00ff9c]/10'}`}>{mission.grade}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#2e4a34] leading-relaxed group-hover:text-[#6e9678] transition-colors relative z-10">
                    <span className="opacity-50">THREAT LEVEL //</span> CE RESERVES: {mission.ce[1]}+ | EST. HP: {mission.hp[1]} <br/>
                    <span className="opacity-50 text-[9px] mt-1 block">Expected Compensation: {mission.xp} XP</span>
                  </div>
                </button>
              ))}
            </div>
          ) : modalOpen === 'actions' ? (
            <div className="space-y-4">
              <p className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-2">
                Spend time performing activities. Most actions cost months, HP, or CE:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('train');
                  }}
                  className="p-3 border text-left border-[#112019] bg-[#020504] hover:border-[#a4c8aa] transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-[#628a6a] group-hover:text-[#a4c8aa] uppercase">🏋 Train Body</div>
                  <div className="text-[9px] text-[#2e4a34] mt-1 line-clamp-2">Undergo rigorous regimens to increase specific stats over several months.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('passtime');
                  }}
                  className="p-3 border text-left border-[#112019] bg-[#020504] hover:border-[#a4c8aa] transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-[#628a6a] group-hover:text-[#a4c8aa] uppercase">⌛ Pass Time</div>
                  <div className="text-[9px] text-[#2e4a34] mt-1 line-clamp-2">Quickly skip forward in months to regenerate HP/CE, triggering passive events.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('meditate');
                  }}
                  className="p-3 border text-left border-indigo-900/30 bg-indigo-950/10 hover:border-indigo-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-indigo-500/70 group-hover:text-indigo-400 uppercase">🧘 Deep Meditation</div>
                  <div className="text-[9px] text-indigo-500/50 mt-1 line-clamp-2">Costs 1 Month. Greatly recovers CE and a modest amount of HP without aging much.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('study');
                  }}
                  className="p-3 border text-left border-cyan-900/30 bg-cyan-950/10 hover:border-cyan-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-cyan-500/70 group-hover:text-cyan-400 uppercase">📚 Study Theories</div>
                  <div className="text-[9px] text-cyan-500/50 mt-1 line-clamp-2">Costs 1 Month and 15 CE. Spend time studying Jujutsu theory to slowly raise Mastery point limits.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('scavenge');
                  }}
                  className="p-3 border text-left border-orange-900/30 bg-orange-950/10 hover:border-orange-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-orange-500/70 group-hover:text-orange-400 uppercase">🕵️ Scavenge / Work</div>
                  <div className="text-[9px] text-orange-500/50 mt-1 line-clamp-2">Costs 1 Month and 20 HP. Gather credits and possibly gain reputation in the underground.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('network');
                  }}
                  className="p-3 border text-left border-fuchsia-900/30 bg-fuchsia-950/10 hover:border-fuchsia-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-fuchsia-500/70 group-hover:text-fuchsia-400 uppercase">🤝 Network & Socialize</div>
                  <div className="text-[9px] text-fuchsia-500/50 mt-1 line-clamp-2">Costs 1 Month and 50 ¥. Go out into town, improving relationships with all known NPCs.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('clinic');
                  }}
                  className="p-3 border text-left border-red-900/30 bg-red-950/10 hover:border-red-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-red-500/70 group-hover:text-red-400 uppercase">🏥 Visit Black Clinic</div>
                  <div className="text-[9px] text-red-500/50 mt-1 line-clamp-2">Costs 1 Month and 100 ¥. Undergo experimental or RCT healing to fully restore HP.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('crime');
                  }}
                  className="p-3 border text-left border-zinc-700/50 bg-black hover:border-zinc-400 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 uppercase">🔪 Shady Curse Job</div>
                  <div className="text-[9px] text-zinc-500 mt-1 line-clamp-2">Costs 1 Month and 40 HP. High risk underground hit. Yields high ¥ but costs reputation.</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('gamble');
                  }}
                  className="p-3 border text-left border-yellow-900/30 bg-yellow-950/10 hover:border-yellow-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-yellow-500/70 group-hover:text-yellow-400 uppercase">🎰 Pachinko Parlor</div>
                  <div className="text-[9px] text-yellow-500/50 mt-1 line-clamp-2">Costs 0 Months. Bet 20 ¥ for a chance to win the jackpot. (Repeatable)</div>
                </button>
                <button
                  onClick={() => {
                    Snd.ui();
                    if (onSelectAction) onSelectAction('pet');
                  }}
                  className="p-3 border text-left border-emerald-900/30 bg-emerald-950/10 hover:border-emerald-500/80 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-emerald-500/70 group-hover:text-emerald-400 uppercase">🐕 Adopt Shikigami Pet</div>
                  <div className="text-[9px] text-emerald-500/50 mt-1 line-clamp-2">Costs 0 Months and 300 ¥. Gain a loyal supernatural companion.</div>
                </button>
              </div>
            </div>
          ) : modalOpen === 'train' ? (
            <div className="space-y-2">
              <p className="text-[10px] text-[#2e4a34] tracking-widest uppercase mb-3">
                Condition stats by spending months on rigorous routines:
              </p>
              <div className="space-y-2">
                {TRAINING_REGIMENS.map(r => (
                  <div
                    key={r.key}
                    onClick={() => {
                      Snd.sel();
                      onSelectTrain(r);
                    }}
                    className="p-3 border border-[#112019] bg-[#020504] hover:bg-[#070e0b] hover:border-[#00c47a] cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs font-semibold text-[#a4c8aa]">
                      <span>{r.name}</span>
                      <span className="text-[9px] text-[#628a6a] bg-black border border-[#112019] px-2 py-0.5">
                        +{r.mo} {r.mo === 1 ? 'MONTH' : 'MONTHS'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#00ff9c] font-bold">{r.eff}</div>
                    <div className="text-[9px] text-[#2e4a34] italic font-sans">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 bg-[#070e0b] border-t border-[#112019]">
          <button
            onClick={() => {
              Snd.ui();
              onClose();
            }}
            className="px-4 py-1.5 border border-[#112019] hover:border-[#2e4a34] text-xs cursor-pointer text-[#628a6a]"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
