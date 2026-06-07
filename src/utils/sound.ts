/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private on = true;
  private lastHov = 0;

  constructor() {
    // Lazy initialisation to comply with browser autoplay policies
  }

  private init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.');
    }
  }

  public resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(v: boolean) {
    this.on = v;
    if (v && !this.ctx) this.init();
  }

  public isEnabled(): boolean {
    return this.on;
  }

  public playTone(f: number, dur: number, type: OscillatorType = 'sine', vol = 0.08, f2: number | null = null) {
    if (!this.on) return;
    this.resume();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f, now);
      if (f2) osc.frequency.exponentialRampToValueAtTime(f2, now + dur * 0.6);

      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(g);
      g.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {
      // Audio nodes can sometimes complain if tab context changes out of bounds, fail silently
    }
  }

  public triggerHover() {
    if (!this.on) return;
    const now = Date.now();
    if (now - this.lastHov > 110) {
      this.playTone(200, 0.1, 'sine', 0.02, 220);
      this.lastHov = now;
    }
  }

  public ui() {
    this.playTone(1200, 0.05, 'sine', 0.03);
  }

  public sel() {
    this.playTone(900, 0.07, 'sine', 0.05);
  }

  public forge() {
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.2, 'sine', 0.08), i * 110);
    });
  }

  public lvl() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.18, 'sine', 0.08), i * 95);
    });
  }

  public age() {
    this.playTone(660, 0.09, 'sine', 0.05);
    setTimeout(() => this.playTone(880, 0.14, 'sine', 0.06), 90);
  }

  public evt() {
    this.playTone(330, 0.09, 'triangle', 0.04);
  }

  public hit() {
    this.playTone(220, 0.12, 'sawtooth', 0.07);
  }

  public heavyHit() {
    this.playTone(180, 0.18, 'sawtooth', 0.09);
    this.playTone(120, 0.24, 'square', 0.05);
  }

  public miss() {
    this.playTone(140, 0.08, 'sine', 0.04);
  }

  public tech() {
    this.playTone(440, 0.09, 'square', 0.05);
    setTimeout(() => this.playTone(880, 0.18, 'sawtooth', 0.07), 75);
  }

  public death() {
    [220, 196, 185, 170].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.3, 'sine', 0.07), i * 140);
    });
  }

  public todo() {
    [440, 660, 880, 1100].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.15, 'sine', 0.08), i * 110);
    });
  }

  public cash() {
    this.playTone(880, 0.08, 'sine', 0.06);
    setTimeout(() => this.playTone(1100, 0.12, 'sine', 0.06), 70);
  }
}

export const Snd = new SoundEngine();
