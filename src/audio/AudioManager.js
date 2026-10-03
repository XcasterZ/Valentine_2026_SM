/**
 * Web Audio Ambient Music & Sound Effects Generator
 * Uses Web Audio API for zero-dependency, crystalline romantic chords & chimes
 */
export class AudioManager {
  constructor({ onToggle } = {}) {
    this.onToggle = onToggle;
    this.isMuted = true;
    this.ctx = null;
    this.masterGain = null;
    this.ambientInterval = null;

    this.soundToggleBtn = document.querySelector('.audio-toggle-btn');
    this.init();
  }

  init() {
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
  }

  setupAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      try {
        this.ctx = new AudioCtx();
      } catch (error) {
        console.warn('Audio is unavailable in this browser:', error);
        return false;
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  toggle() {
    if (!this.setupAudioContext()) return;

    if (this.isMuted) {
      this.isMuted = false;
      this.soundToggleBtn?.setAttribute('aria-pressed', 'true');
      document.body.classList.remove('audio-muted');
      this.masterGain.gain.setTargetAtTime(0.4, this.ctx.currentTime, 0.5);
      this.startAmbientLoop();
      this.playChime(659.25); // E5 chord note
    } else {
      this.isMuted = true;
      this.soundToggleBtn?.setAttribute('aria-pressed', 'false');
      document.body.classList.add('audio-muted');
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
      this.stopAmbientLoop();
    }
    this.onToggle?.(this.isMuted);
  }

  startAmbientLoop() {
    if (this.ambientInterval) return;

    // Romantic chord progression (Fmaj7 -> Cmaj7 -> Am9 -> Gsus4)
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // Cmaj (C4, E4, G4, C5)
      [220.00, 261.63, 329.63, 440.00], // Am (A3, C4, E4, A4)
      [174.61, 261.63, 329.63, 392.00], // Fmaj7 (F3, C4, E4, G4)
      [196.00, 293.66, 392.00, 493.88]  // G (G3, D4, G4, B4)
    ];

    let chordIndex = 0;
    const playNext = () => {
      if (this.isMuted) return;
      this.playPadChord(chords[chordIndex]);
      chordIndex = (chordIndex + 1) % chords.length;
    };

    playNext();
    this.ambientInterval = setInterval(playNext, 4800);
  }

  stopAmbientLoop() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  playPadChord(frequencies) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.001, now);
    chordGain.gain.linearRampToValueAtTime(0.07, now + 1.8);
    chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.6);
    chordGain.connect(this.masterGain);

    frequencies.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Slight detune for warm chorus lushness
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      osc.connect(chordGain);
      osc.start(now);
      osc.stop(now + 4.8);
    });
  }

  playChime(freq = 880) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.2);
  }
}
