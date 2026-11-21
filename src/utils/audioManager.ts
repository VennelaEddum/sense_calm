// Centralized Audio & Sound Manager for Sense Calm
// Handles Web Audio synthesized gentle sound effects, ambient calming sounds, and Speech Synthesis (TTS)
// Strictly obeys Silent Mode

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const soundEffects = {
  // Gentle pop when tapping cards or AAC tokens
  playPop(isSilent: boolean) {
    if (isSilent) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio fallback silent
    }
  },

  // Soft musical chime for correct answers & matches
  playChime(isSilent: boolean) {
    if (isSilent) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        const startTime = ctx.currentTime + idx * 0.07;
        const duration = 0.35;

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio fallback silent
    }
  },

  // Soft gentle bell chime for breathing phase transition
  playBreathingChime(isSilent: boolean) {
    if (isSilent) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio fallback silent
    }
  },

  // Soft swoosh for clear / reset
  playSwoosh(isSilent: boolean) {
    if (isSilent) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback silent
    }
  },

  // Celebration fanfare for streak milestones and game completion
  playCelebration(isSilent: boolean) {
    if (isSilent) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      arpeggio.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        const startTime = ctx.currentTime + idx * 0.09;
        const duration = 0.45;

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio fallback silent
    }
  },
};

// ==========================================
// AMBIENT CALMING SOUND ENGINE (Web Audio)
// ==========================================
let ambientSourceNode: AudioBufferSourceNode | null = null;
let ambientGainNode: GainNode | null = null;
let ambientLfoNode: OscillatorNode | null = null;

function createNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Pink noise filter
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  return buffer;
}

export const ambientSoundManager = {
  start(type: "rain" | "waves" | "forest", volume = 0.3, isSilent = false) {
    this.stop();
    if (isSilent || type === "none") return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const noiseBuffer = createNoiseBuffer(ctx, 5);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.min(0.5, Math.max(0.05, volume * 0.4)), ctx.currentTime);

      if (type === "rain") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(900, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);
      } else if (type === "waves") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        // LFO for ocean wave swell
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8s swell

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
        ambientLfoNode = lfo;
      } else if (type === "forest") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);
      }

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      ambientSourceNode = source;
      ambientGainNode = gain;
    } catch (err) {
      console.warn("Ambient sound error:", err);
    }
  },

  setVolume(volume: number) {
    if (ambientGainNode && audioCtx) {
      try {
        ambientGainNode.gain.setValueAtTime(
          Math.min(0.5, Math.max(0.05, volume * 0.4)),
          audioCtx.currentTime
        );
      } catch {
        // Safe fallback
      }
    }
  },

  stop() {
    try {
      if (ambientSourceNode) {
        ambientSourceNode.stop();
        ambientSourceNode.disconnect();
        ambientSourceNode = null;
      }
      if (ambientLfoNode) {
        ambientLfoNode.stop();
        ambientLfoNode.disconnect();
        ambientLfoNode = null;
      }
      if (ambientGainNode) {
        ambientGainNode.disconnect();
        ambientGainNode = null;
      }
    } catch {
      // Safe fallback
    }
  },
};

// Global voice cache & detection
let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  if (cachedVoices.length > 0) return cachedVoices;
  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) {
    cachedVoices = list;
  }
  return cachedVoices;
}

// Refresh cache on voiceschanged
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function findBestVoice(
  lang: "en" | "te",
  preferredURI?: string
): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  // 1. If user preferred voice URI matches
  if (preferredURI) {
    const matched = voices.find((v) => v.voiceURI === preferredURI);
    if (matched) return matched;
  }

  if (lang === "te") {
    // Look for Telugu voices (te-IN or name contains Telugu)
    const teluguVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("te") ||
        v.name.toLowerCase().includes("telugu")
    );
    if (teluguVoice) return teluguVoice;
    // Fallback to Indian English natural voice
    const indianEnglishVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === "en-in" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("heera") ||
        v.name.toLowerCase().includes("ravi")
    );
    if (indianEnglishVoice) return indianEnglishVoice;
  }

  // For English: prioritize clear, natural, high quality voices
  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (enVoices.length > 0) {
    const qualityNames = [
      "natural",
      "google",
      "samantha",
      "karen",
      "serena",
      "victoria",
      "daniel",
      "george",
      "microsoft zira",
      "microsoft aria",
      "microsoft guy",
    ];
    for (const name of qualityNames) {
      const found = enVoices.find((v) =>
        v.name.toLowerCase().includes(name)
      );
      if (found) return found;
    }
    return enVoices[0];
  }

  return voices[0] || null;
}

export function isTeluguVoiceAvailable(): boolean {
  const voices = getAvailableVoices();
  return voices.some(
    (v) =>
      v.lang.toLowerCase().startsWith("te") ||
      v.name.toLowerCase().includes("telugu")
  );
}
