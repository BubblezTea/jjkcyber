/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Snd } from '../utils/sound';
import { DialogueChoice } from '../types';

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

interface LifeFeedProps {
  cards: FeedCard[];
  onChoose: (cardId: string, choiceIndex: number, choice: DialogueChoice) => void;
}

export default function LifeFeed({ cards, onChoose }: LifeFeedProps) {
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cards]);

  const MO_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#2e4a34] select-none">
          <p className="text-sm font-vt tracking-[0.2em] mb-1 animate-pulse">// SYSTEM CALIBRATED //</p>
          <p className="text-[10px] tracking-wider uppercase">Your chronological pathway has not yet initiated.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          <AnimatePresence initial={false}>
            {cards.map((card) => {
              const hasChoices = card.choices && card.choices.length > 0;
              const hasChosen = card.chosenIndex !== undefined && card.chosenIndex !== null;

              return (
                <motion.div
                  key={card.id + '_' + card.age}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="border border-[#112019] bg-[#040908] rounded-sm overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.5)] select-text"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center bg-[#070e0b] border-b border-[#112019] px-3 py-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#00ff9c] font-vt tracking-wider">
                        AGE {card.age}
                      </span>
                      <span className="text-[#2e4a34] font-medium tracking-[0.15em]">
                        {MO_NAMES[card.month - 1] || 'JAN'} {card.year}
                      </span>
                    </div>

                    {card.cat && card.cat !== 'neutral' && (
                      <span className={`px-1.5 py-0.5 border text-[8px] font-bold tracking-widest uppercase rounded-sm ${
                        card.cat === 'combat' ? 'border-red-500/30 text-red-400 bg-red-950/10' :
                        card.cat === 'jujutsu' ? 'border-purple-500/30 text-purple-400 bg-purple-950/10' :
                        card.cat === 'training' ? 'border-amber-500/30 text-amber-400 bg-amber-950/10' :
                        card.cat === 'social' ? 'border-blue-500/30 text-blue-400 bg-blue-950/10' :
                        'border-[#112019] text-[#628a6a]'
                      }`}>
                        {card.cat}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-3">
                    <h3 className="text-sm font-bold tracking-wider text-[#00c47a] uppercase font-vt">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#a4c8aa] leading-relaxed font-sans">{card.text}</p>

                    {/* Chips indicators */}
                    {card.chips && card.chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {card.chips.map((chip, i) => (
                          <span
                            key={i}
                            className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded-sm ${
                              chip.c === 'pos' ? 'border-green-500/20 text-[#00ff9c] bg-[#00ff9c]/5' :
                              chip.c === 'neg' ? 'border-red-500/20 text-red-400 bg-red-950/5' :
                              'border-[#112019] text-[#628a6a] bg-black'
                            }`}
                          >
                            {chip.l}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dialogue Choices Button Block */}
                    {hasChoices && card.choices && (
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-[#112019]/40 mt-3 select-none">
                        {card.choices.map((choice, idx) => {
                          const isThisChosen = card.chosenIndex === idx;

                          return (
                            <button
                              key={idx}
                              disabled={hasChosen}
                              onClick={() => {
                                onChoose(card.id, idx, choice);
                              }}
                              className={`w-full text-left py-2.5 px-3.5 text-xs font-mono border rounded-sm transition-all flex items-start gap-1 p-2 ${
                                hasChosen
                                  ? isThisChosen
                                    ? 'border-[#00ff9c] text-[#00ff9c] bg-[rgba(0,255,156,0.02)]'
                                    : 'border-[#112019] text-[#2e4a34] opacity-25 cursor-default'
                                  : 'border-[#1d3828] text-[#628a6a] hover:border-[#00ff9c] hover:text-[#00ff9c] hover:bg-[rgba(0,255,156,0.03)] cursor-pointer'
                              }`}
                            >
                              <span className="text-[#00c47a] pr-1 select-none">▶</span>
                              <span className="leading-normal">{choice.t}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Choice side effect outcome card details */}
                    {card.resultDesc && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#020504] border border-[#112019]/65 p-2.5 rounded-sm text-xs leading-relaxed text-[#628a6a] font-sans italic border-l-2 border-l-[#00c47a] select-text"
                      >
                        {card.resultDesc}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={feedEndRef} />
        </div>
      )}
    </div>
  );
}
