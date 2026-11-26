// Native Android & Web Unified Text-to-Speech Engine for Sense Calm
import { registerPlugin, Capacitor } from "@capacitor/core";
import { TTSLanguage, TTSStatus } from "@/types";
import { getAvailableVoices, isTeluguVoiceAvailable } from "./audioManager";

export interface NativeTTSPlugin {
  speak(options: {
    text: string;
    lang?: string;
    rate?: number;
    pitch?: number;
  }): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    utteranceId?: string;
    language?: string;
  }>;
  stop(): Promise<{ success: boolean }>;
  getEngineStatus(): Promise<{
    initialized: boolean;
    initStatus?: number;
    defaultEngine: string;
    isTeluguAvailable: boolean;
    teluguStatusCode?: number;
    isEnglishAvailable: boolean;
    englishStatusCode?: number;
    voicesCount: number;
    currentLanguage: string;
  }>;
  getVoices(): Promise<{
    voices: Array<{ name: string; lang: string; requiresNetwork?: boolean }>;
  }>;
  openTtsSettings(): Promise<{ success: boolean }>;
  addListener(
    eventName: "ttsStart" | "ttsEnd" | "ttsError",
    listenerFunc: (data: any) => void
  ): Promise<any>;
  removeAllListeners?(): Promise<void>;
}

export const SenseCalmTTS = registerPlugin<NativeTTSPlugin>("SenseCalmTTS");

export interface VoiceDiagnosticsInfo {
  platform: "android" | "browser";
  selectedLanguage: TTSLanguage;
  ttsEngineAvailable: boolean;
  engineName: string;
  isEnglishAvailable: boolean;
  isTeluguAvailable: boolean;
  voicesCount: number;
  currentStatus: TTSStatus;
  lastSpokenText: string;
  lastSpokenLanguage: string;
  lastError: string | null;
}

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
};

// State trackers for diagnostics
let lastSpokenText = "";
let lastSpokenLang = "en";
let lastTtsError: string | null = null;
let listenersInitialized = false;

export function initNativeTtsListeners(
  onStatusChange?: (status: TTSStatus, utteranceText?: string) => void,
  onError?: (errorMessage: string) => void
) {
  if (!isNativeAndroid() || listenersInitialized) return;
  listenersInitialized = true;

  try {
    SenseCalmTTS.addListener("ttsStart", () => {
      if (onStatusChange) onStatusChange("playing", lastSpokenText);
    });

    SenseCalmTTS.addListener("ttsEnd", () => {
      if (onStatusChange) onStatusChange("idle", "");
    });

    SenseCalmTTS.addListener("ttsError", (data) => {
      const err = data?.error || (data?.errorCode ? `Error code: ${data.errorCode}` : "Playback error");
      lastTtsError = err;
      if (onError) onError(err);
      if (onStatusChange) onStatusChange("idle", "");
    });
  } catch (err) {
    console.warn("Could not register native TTS event listeners:", err);
  }
}

export async function speakUnified(
  text: string,
  lang: TTSLanguage,
  rate = 0.9,
  pitch = 1.0,
  voiceURI?: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: string) => void;
  }
): Promise<{ success: boolean; error?: string; message?: string }> {
  lastSpokenText = text;
  lastSpokenLang = lang;
  lastTtsError = null;

  // 1. Native Android Path
  if (isNativeAndroid()) {
    try {
      if (callbacks?.onStart) callbacks.onStart();

      const langCode = lang === "te" ? "te-IN" : "en-US";
      const result = await SenseCalmTTS.speak({
        text,
        lang: langCode,
        rate,
        pitch,
      });

      if (!result.success) {
        lastTtsError = result.message || result.error || "Speech failed";
        if (callbacks?.onError) callbacks.onError(lastTtsError);
        return result;
      }

      return result;
    } catch (e: any) {
      const msg = e?.message || "Native Android TTS error";
      lastTtsError = msg;
      if (callbacks?.onError) callbacks.onError(msg);
      return { success: false, error: "NATIVE_EXCEPTION", message: msg };
    }
  }

  // 2. Web Browser Path (Fallback)
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    const msg = "Web Speech API is not supported in this browser environment.";
    lastTtsError = msg;
    if (callbacks?.onError) callbacks.onError(msg);
    return { success: false, error: "NOT_SUPPORTED", message: msg };
  }

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel();

      // Check Telugu voice availability on browser
      if (lang === "te" && !isTeluguVoiceAvailable()) {
        const warning = "Telugu voice is not available in your browser. Audio output might be limited.";
        lastTtsError = warning;
        // Still proceed with best effort
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = lang === "te" ? "te-IN" : "en-US";

      const voices = getAvailableVoices();
      if (voiceURI && voices.length > 0) {
        const matched = voices.find((v) => v.voiceURI === voiceURI);
        if (matched) utterance.voice = matched;
      }

      utterance.onstart = () => {
        if (callbacks?.onStart) callbacks.onStart();
      };

      utterance.onend = () => {
        if (callbacks?.onEnd) callbacks.onEnd();
        resolve({ success: true });
      };

      utterance.onerror = (e) => {
        const errorMsg = e.error || "Browser speech error";
        lastTtsError = errorMsg;
        if (callbacks?.onError) callbacks.onError(errorMsg);
        resolve({ success: false, error: "BROWSER_SPEECH_ERROR", message: errorMsg });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      const msg = err?.message || "Speech synthesis exception";
      lastTtsError = msg;
      if (callbacks?.onError) callbacks.onError(msg);
      resolve({ success: false, error: "EXCEPTION", message: msg });
    }
  });
}

export async function stopUnified(): Promise<void> {
  if (isNativeAndroid()) {
    try {
      await SenseCalmTTS.stop();
    } catch {
      // Safe fallback
    }
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Safe fallback
    }
  }
}

export async function openAndroidTtsSettings(): Promise<boolean> {
  if (isNativeAndroid()) {
    try {
      const res = await SenseCalmTTS.openTtsSettings();
      return !!res.success;
    } catch {
      return false;
    }
  }
  return false;
}

export async function getVoiceDiagnostics(
  selectedLanguage: TTSLanguage,
  currentStatus: TTSStatus
): Promise<VoiceDiagnosticsInfo> {
  const isAndroid = isNativeAndroid();

  if (isAndroid) {
    try {
      const status = await SenseCalmTTS.getEngineStatus();
      return {
        platform: "android",
        selectedLanguage,
        ttsEngineAvailable: status.initialized,
        engineName: status.defaultEngine || "Android TTS Engine",
        isEnglishAvailable: status.isEnglishAvailable,
        isTeluguAvailable: status.isTeluguAvailable,
        voicesCount: status.voicesCount || 0,
        currentStatus,
        lastSpokenText,
        lastSpokenLanguage: lastSpokenLang,
        lastError: lastTtsError,
      };
    } catch (err: any) {
      return {
        platform: "android",
        selectedLanguage,
        ttsEngineAvailable: false,
        engineName: "Android Native Bridge",
        isEnglishAvailable: false,
        isTeluguAvailable: false,
        voicesCount: 0,
        currentStatus,
        lastSpokenText,
        lastSpokenLanguage: lastSpokenLang,
        lastError: err?.message || "Failed to query Android TTS status",
      };
    }
  }

  // Browser diagnostics
  const browserVoices = getAvailableVoices();
  const hasTelugu = isTeluguVoiceAvailable();
  const hasEnglish = browserVoices.some((v) => v.lang.toLowerCase().startsWith("en"));
  const hasEngine = typeof window !== "undefined" && "speechSynthesis" in window;

  return {
    platform: "browser",
    selectedLanguage,
    ttsEngineAvailable: hasEngine,
    engineName: hasEngine ? "Browser Web Speech API" : "None",
    isEnglishAvailable: hasEnglish,
    isTeluguAvailable: hasTelugu,
    voicesCount: browserVoices.length,
    currentStatus,
    lastSpokenText,
    lastSpokenLanguage: lastSpokenLang,
    lastError: lastTtsError,
  };
}

export function getLastSpokenInfo() {
  return {
    text: lastSpokenText,
    lang: lastSpokenLang as TTSLanguage,
    error: lastTtsError,
  };
}
