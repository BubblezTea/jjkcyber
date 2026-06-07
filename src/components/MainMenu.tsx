/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Snd } from '../utils/sound';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  canContinue: boolean;
}

export default function MainMenu({ onNewGame, onContinue, canContinue }: MainMenuProps) {
  useEffect(() => {
    // Interaction initiates sound context
    const handleTouch = () => Snd.resume();
    window.addEventListener('click', handleTouch);
    return () => window.removeEventListener('click', handleTouch);
  }, []);

  return (
    <div
      id="sMenu"
      className="flex flex-col items-center justify-center min-h-screen bg-black text-[#a4c8aa] font-mono select-none px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #060e09 0%, #000000 75%)',
      }}
    >
      <div className="text-center max-w-xl">
        <h1
          className="text-6xl md:text-8xl font-bold tracking-widest text-[#00ff9c] text-shadow mb-2 animate-pulse"
          style={{
            fontFamily: "'Share Tech Mono', sans-serif",
            textShadow: '0 0 25px rgba(0, 255, 156, 0.47), 0 0 50px rgba(0, 255, 156, 0.2)',
          }}
        >
          CURSED REALM
        </h1>
        <p className="text-xs md:text-sm tracking-[0.4em] text-[#2e4a34] font-semibold mb-12">
          // VESSEL OF FATE // A JUJUTSU KAISEN LIFE SIMULATOR
        </p>

        <div className="flex flex-col gap-4 w-72 mx-auto">
          <button
            onClick={() => {
              Snd.sel();
              onNewGame();
            }}
            className="w-full py-4 px-6 border border-[#2e4a34] text-[#00c47a] bg-transparent hover:border-[#00ff9c] hover:text-[#00ff9c] hover:bg-[rgba(0,255,156,0.05)] transition-all duration-300 font-bold uppercase tracking-wider text-xs flex justify-between items-center group cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <span>⟢ New Vessel</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">▶</span>
          </button>

          <button
            onClick={() => {
              if (canContinue) {
                Snd.sel();
                onContinue();
              }
            }}
            disabled={!canContinue}
            className={`w-full py-4 px-6 border font-bold uppercase tracking-wider text-xs flex justify-between items-center group cursor-pointer ${
              canContinue
                ? 'border-[#2e4a34] text-[#00c47a] hover:border-[#00ff9c] hover:text-[#00ff9c] hover:bg-[rgba(0,255,156,0.05)] text-[#00c47a]'
                : 'border-[#112019] text-[#2e4a34] opacity-50 cursor-not-allowed'
            } transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
          >
            <span>⟢ Continue Story</span>
            {canContinue && <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">▶</span>}
          </button>

          <div className="py-2 border-t border-[#112019] mt-4">
            <p className="text-[10px] text-[#2e4a34] tracking-widest text-[#628a6a]">
              SOUND ENGINE: <span className="text-[#00c47a]">ONLINE</span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-[9px] text-[#2e4a34] tracking-[0.3em]">
        VER 1.1.0 // CURSED REALM CORE // JUJUTSU OS
      </div>
    </div>
  );
}
