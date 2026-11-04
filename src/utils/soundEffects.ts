/**
 * Authentic Adzan Audio Controller & Web Audio Effects
 * Plays real recordings of renowned muazzins with fallback synthesizers for tactile UI feedback.
 */

export interface AdzanMuadzin {
  id: string;
  name: string;
  location: string;
  audioUrl: string;
  description: string;
  isFajr?: boolean;
}

export const FAMOUS_MUADZINS: AdzanMuadzin[] = [
  {
    id: 'ali-ahmad-mulla',
    name: 'Syaikh Ali Ahmad Mulla',
    location: 'Masjidil Haram, Makkah Al-Mukarramah',
    audioUrl: '/audio/adzan/ali-ahmad-mulla.mp3',
    description: 'Muadzin legendaris paling termasyhur Masjidil Haram (Suara Bilalnya Mekkah)',
  },
  {
    id: 'misyari-alafasy',
    name: 'Syaikh Misyari Rasyid Al-Afasy',
    location: 'Kuwait',
    audioUrl: '/audio/adzan/misyari-alafasy.mp3',
    description: 'Lantunan azan syahdu, merdu dan menyentuh hati khas Syaikh Al-Afasy',
  },
  {
    id: 'muhammad-makkawi',
    name: 'Syaikh Muhammad Makkawi',
    location: 'Irama Khas Makkah Al-Mukarramah',
    audioUrl: '/audio/adzan/muhammad-makkawi.mp3',
    description: 'Lantunan irama Makkawi klasik yang syahdu dan khidmat',
  },
  {
    id: 'essam-bukhari',
    name: 'Syaikh Essam Bukhari',
    location: 'Masjidil Haram, Makkah',
    audioUrl: '/audio/adzan/essam-bukhari.mp3',
    description: 'Muadzin resmi Masjidil Haram Makkah dengan resonansi suara yang jernih',
  },
  {
    id: 'mansoor-al-zahrani',
    name: 'Syaikh Mansoor Al-Zahrani',
    location: 'Arab Saudi',
    audioUrl: '/audio/adzan/mansoor-al-zahrani.mp3',
    description: 'Lantunan maqam Hijaz merdu yang sangat indah dan menenangkan jiwa',
  },
  {
    id: 'masjid-nabawi',
    name: 'Adzan Masjid Nabawi Madinah',
    location: 'Madinah Al-Munawwarah',
    audioUrl: '/audio/adzan/masjid-nabawi.mp3',
    description: 'Lantunan khas maqam Rast Masjid Nabawi yang sejuk dan menyejukkan hati',
  },
  {
    id: 'abdul-basit',
    name: 'Syaikh Abdul Basit Abdus Samad',
    location: 'Kairo, Mesir',
    audioUrl: '/audio/adzan/abdul-basit.mp3',
    description: 'Rekaman bersejarah Qari & Muadzin legendaris dunia Islam',
  },
  {
    id: 'nasser-al-qatami',
    name: 'Syaikh Nasser Al-Qatami',
    location: 'Riyadh, Arab Saudi',
    audioUrl: '/audio/adzan/nasser-al-qatami.mp3',
    description: 'Lantunan azan khusyuk dan penuh penghayatan mendalam',
  },
  {
    id: 'masjid-al-aqsa',
    name: 'Adzan Masjid Al-Aqsa',
    location: 'Baitul Maqdis, Yerusalem',
    audioUrl: '/audio/adzan/masjid-al-aqsa.mp3',
    description: 'Gema azan penuh berkah dari kiblat pertama umat Islam di Masjid Al-Aqsa',
  },
];

// Helper to normalize legacy sound IDs
export function resolveAdzanMuadzin(soundId?: string): AdzanMuadzin {
  if (!soundId) return FAMOUS_MUADZINS[0];

  if (soundId === 'adzan-makkah') {
    return FAMOUS_MUADZINS[0]; // Syaikh Ali Ahmad Mulla
  }
  if (soundId === 'adzan-madinah') {
    return FAMOUS_MUADZINS[5]; // Masjid Nabawi
  }

  const found = FAMOUS_MUADZINS.find((m) => m.id === soundId);
  return found || FAMOUS_MUADZINS[0];
}

class SoundController {
  private ctx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private activeSoundId: string | null = null;
  private listeners: Set<(isPlaying: boolean, soundId: string | null) => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Subscribe to playback status changes
   */
  subscribe(listener: (isPlaying: boolean, soundId: string | null) => void): () => void {
    this.listeners.add(listener);
    // Initial emit
    listener(this.isPlaying(), this.activeSoundId);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(isPlaying: boolean, soundId: string | null) {
    this.listeners.forEach((fn) => {
      try {
        fn(isPlaying, soundId);
      } catch (err) {
        console.error('Error notifying sound listener:', err);
      }
    });
  }

  /**
   * Check if adzan audio is currently playing
   */
  isPlaying(): boolean {
    return Boolean(this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended);
  }

  /**
   * Get active playing sound ID
   */
  getActiveSoundId(): string | null {
    return this.isPlaying() ? this.activeSoundId : null;
  }

  /**
   * Stop any currently playing adzan audio
   */
  stopAdzan() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    const prevId = this.activeSoundId;
    this.activeSoundId = null;
    this.notify(false, null);
  }

  /**
   * Play genuine authentic recording of adzan
   */
  async playAdzan(soundId: string = 'ali-ahmad-mulla'): Promise<boolean> {
    // If the exact same sound is already playing, stop it (toggle behavior)
    if (this.isPlaying() && this.activeSoundId === soundId) {
      this.stopAdzan();
      return false;
    }

    // Stop existing playback first
    this.stopAdzan();

    // Handle soft tones if requested
    if (soundId === 'beep-soft') {
      this.playSoftBeep();
      return true;
    }
    if (soundId === 'gentle-chime') {
      this.playGentleChime();
      return true;
    }

    const muadzin = resolveAdzanMuadzin(soundId);
    try {
      const audio = new Audio(muadzin.audioUrl);
      this.currentAudio = audio;
      this.activeSoundId = muadzin.id;

      audio.onplay = () => {
        this.notify(true, muadzin.id);
      };

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.activeSoundId = null;
          this.notify(false, null);
        }
      };

      audio.onerror = () => {
        console.warn(`Could not play adzan audio from ${muadzin.audioUrl}, using melodic fallback`);
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.activeSoundId = null;
          this.notify(false, null);
        }
        // Fallback to soothing melody if network issue
        this.playMelodicFallback();
      };

      await audio.play();
      return true;
    } catch (err) {
      console.warn('Audio playback error (e.g. autoplay restriction):', err);
      this.stopAdzan();
      return false;
    }
  }

  /**
   * Play Adzan Preview (used by Settings and Prayer reminders test buttons)
   */
  playAdzanPreview(soundId: string = 'ali-ahmad-mulla') {
    return this.playAdzan(soundId);
  }

  /**
   * Subtle tactile tasbih bead click sound
   */
  playTasbihClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);

      // Trigger soft device vibration if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch (e) {
      // Audio playback might be restricted before user gesture
    }
  }

  /**
   * Celebratory milestone completion chime for reaching target (e.g. 33x, 100x)
   */
  playMilestoneChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.45);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 40, 60, 80]);
      }
    } catch (e) {}
  }

  /**
   * Minimalist soft beep alert
   */
  private playSoftBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const beeps = [0, 0.2, 0.4];
      beeps.forEach((time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.13);
      });
    } catch (e) {}
  }

  /**
   * Gentle chime alert
   */
  private playGentleChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const chimeNotes = [523.25, 659.25, 783.99, 1046.5];
      chimeNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.25);
        osc.stop(ctx.currentTime + i * 0.25 + 0.75);
      });
    } catch (e) {}
  }

  /**
   * Synthesizer fallback in case network prevents loading local mp3
   */
  private playMelodicFallback() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const melody = [
        { freq: 440.0, time: 0, dur: 0.4 },
        { freq: 493.88, time: 0.45, dur: 0.4 },
        { freq: 587.33, time: 0.9, dur: 0.7 },
        { freq: 523.25, time: 1.65, dur: 0.5 },
        { freq: 440.0, time: 2.2, dur: 0.8 },
      ];

      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

        gain.gain.setValueAtTime(0.22, ctx.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + note.dur + 0.05);
      });
    } catch (e) {}
  }
}

export const soundController = new SoundController();
