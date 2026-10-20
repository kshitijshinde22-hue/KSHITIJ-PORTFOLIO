// Web Audio API Synthesizer & Cyberpunk BGM Sound Controller
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.enabled = false;
    this.bgm = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.bgm && typeof window !== 'undefined') {
      this.bgm = new Audio('/bgm.mp3');
      this.bgm.loop = true;
      this.bgm.volume = 0.35; // Medium intensity, balanced background volume
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    this.init();

    if (this.enabled) {
      this.playClick();
      if (this.bgm) {
        this.bgm.play().catch(() => {
          // Autoplay policy fallback
        });
      }
    } else {
      if (this.bgm) {
        this.bgm.pause();
      }
    }
    return this.enabled;
  }

  playHover() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch {
      // Audio context safety fallback
    }
  }

  playCollision(v = 0.5) {
    if (!this.enabled || !this.audioCtx) return;
    const t = this.audioCtx.currentTime;
    const o = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(380 + v * 520, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04 + v * 0.06, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    o.connect(g);
    g.connect(this.audioCtx.destination);
    o.start(t);
    o.stop(t + 0.12);
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {
      // Audio context safety fallback
    }
  }
}

export const soundFx = new SoundController();
