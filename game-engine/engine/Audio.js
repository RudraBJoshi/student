/**
 * Audio Manager
 * Wraps the Web Audio API for positional + global sound.
 */
export class AudioManager {
  constructor() {
    this._ctx   = null;
    this._clips = {};
    this._bgm   = null;
    this.masterVolume = 0.8;
    this.muted = false;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  /** Register an AudioBuffer or HTMLAudioElement under a key */
  register(key, audioEl) {
    this._clips[key] = audioEl;
  }

  /**
   * Play a sound effect (one-shot).
   * @param {string} key
   * @param {number} volume 0-1
   * @param {number} pitch  playback rate multiplier
   */
  play(key, volume = 1, pitch = 1) {
    if (this.muted) return;
    const clip = this._clips[key];
    if (!clip) return;

    // Clone so overlapping plays work
    const clone = clip.cloneNode(true);
    clone.volume        = Math.min(1, volume * this.masterVolume);
    clone.playbackRate  = pitch;
    clone.play().catch(() => {});
  }

  /** Play background music (looped) */
  playBGM(key, volume = 0.4) {
    this.stopBGM();
    const clip = this._clips[key];
    if (!clip || this.muted) return;
    this._bgm = clip.cloneNode(true);
    this._bgm.loop   = true;
    this._bgm.volume = volume * this.masterVolume;
    this._bgm.play().catch(() => {});
  }

  stopBGM() {
    if (this._bgm) { this._bgm.pause(); this._bgm = null; }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this._bgm) this._bgm.pause();
    else if (!this.muted && this._bgm) this._bgm.play().catch(() => {});
  }

  /**
   * Generate a simple procedural sound using Web Audio API.
   * type: 'jump' | 'land' | 'coin' | 'hurt' | 'death'
   */
  playProceduralSFX(type) {
    if (this.muted) return;
    try {
      const ctx   = this._getCtx();
      const gain  = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.value = 0.15 * this.masterVolume;

      const osc = ctx.createOscillator();
      osc.connect(gain);

      switch (type) {
        case 'jump':
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
          break;
        case 'land':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
          break;
        case 'coin':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          break;
        case 'hurt':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
          break;
        case 'death':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
          break;
        case 'dash':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
          break;
      }
    } catch (_) {}
  }
}
