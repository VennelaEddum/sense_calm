import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Preferences, Progress, RoutineMap, TTSLanguage } from "@/types";
import { routineItems } from "@/data/learningData";
import { achievementBadges } from "@/data/badgesData";
import {
  findBestVoice,
  soundEffects,
  getAvailableVoices,
  isTeluguVoiceAvailable,
} from "@/utils/audioManager";

const STORAGE_KEYS = {
  visitorName: "senseCalmVisitorName",
  progress: "senseCalmProgress",
  preferences: "senseCalmPreferences",
  routines: "senseCalmRoutines",
};

export const defaultPreferences: Preferences = {
  reducedMotion: false,
  muted: false, // Default: sound enabled, but user can mute with one click!
  silentMode: false,
  simplified: false,
  speechEnabled: true,
  quietMode: false,
  ttsLanguage: "en",
  ttsVoiceURI: "",
  ttsRate: 0.88,
  ttsPitch: 1.0,
};

export const defaultProgress: Progress = {
  completedActivities: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  communicationUses: 0,
  lastActiveDate: "",
  activityHistory: [],
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  totalGamesCompleted: 0,
  activeDates: [],
  unlockedBadges: [],
};

export type TTSStatus = "idle" | "speaking" | "paused";

interface AppContextValue {
  visitorName: string;
  setVisitorName: (name: string) => void;
  preferences: Preferences;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  toggleSilentMode: () => void;
  progress: Progress;
  recordActivity: (label: string, points?: number) => void;
  recordAnswer: (isCorrect: boolean) => void;
  recordGameCompleted: (gameName: string, earnedPoints?: number) => void;
  recordCommunication: (sentenceText?: string) => void;
  routines: RoutineMap;
  toggleRoutine: (dateKey: string, index: number) => void;
  saveRoutines: (dateKey: string, indices: number[]) => void;
  todayKey: string;
  speak: (text: string, langOverride?: TTSLanguage) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  ttsStatus: TTSStatus;
  currentUtteranceText: string;
  isTeluguSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  playSound: (type: "pop" | "chime" | "swoosh" | "celebration") => void;
  showNotice: (message: string) => void;
  notice: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [visitorName, setVisitorNameState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.visitorName) || ""
  );

  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = readJSON<Partial<Preferences>>(STORAGE_KEYS.preferences, {});
    // Ensure muted and silentMode are synced
    const isMuted = saved.silentMode ?? saved.muted ?? defaultPreferences.muted;
    return {
      ...defaultPreferences,
      ...saved,
      muted: isMuted,
      silentMode: isMuted,
      speechEnabled: saved.speechEnabled ?? true,
    };
  });

  const [progress, setProgress] = useState<Progress>(() => {
    const saved = readJSON<Partial<Progress>>(STORAGE_KEYS.progress, {});
    const today = getLocalDateKey();
    const yesterday = getYesterdayDateKey();

    let initialStreak = saved.currentStreak ?? (saved.completedActivities ? 1 : 0);
    // If last activity was before yesterday, streak expired -> reset to 0 until an activity is completed today
    if (saved.lastActiveDate && saved.lastActiveDate !== today && saved.lastActiveDate !== yesterday) {
      initialStreak = 0;
    }

    return {
      ...defaultProgress,
      ...saved,
      currentStreak: initialStreak,
      longestStreak: saved.longestStreak ?? (saved.completedActivities ? 1 : 0),
      totalPoints: saved.totalPoints ?? (saved.completedActivities ? saved.completedActivities * 10 : 0),
      totalGamesCompleted: saved.totalGamesCompleted ?? 0,
      activeDates: saved.activeDates ?? (saved.lastActiveDate ? [saved.lastActiveDate] : []),
      unlockedBadges: saved.unlockedBadges ?? [],
      activityHistory: saved.activityHistory ?? [],
    };
  });

  const [routines, setRoutines] = useState<RoutineMap>(() =>
    readJSON(STORAGE_KEYS.routines, {})
  );

  const [notice, setNotice] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>("idle");
  const [currentUtteranceText, setCurrentUtteranceText] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [teluguAvailable, setTeluguAvailable] = useState<boolean>(false);

  const todayKey = getLocalDateKey();
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize and track browser voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
      setTeluguAvailable(isTeluguVoiceAvailable());
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.routines, JSON.stringify(routines));
  }, [routines]);

  const setVisitorName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEYS.visitorName, name);
    setVisitorNameState(name);
  }, []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  }, []);

  // Centralized stop speech
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setTtsStatus("idle");
    setCurrentUtteranceText("");
    activeUtteranceRef.current = null;
  }, []);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setTtsStatus("paused");
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setTtsStatus("speaking");
    }
  }, []);

  const updatePreferences = useCallback(
    (prefs: Partial<Preferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...prefs };
        // If muted or silentMode was changed, sync both
        if (prefs.silentMode !== undefined) {
          next.muted = prefs.silentMode;
          next.silentMode = prefs.silentMode;
        } else if (prefs.muted !== undefined) {
          next.silentMode = prefs.muted;
          next.muted = prefs.muted;
        }
        // If silent mode was turned ON, stop all currently playing audio immediately!
        if (next.silentMode) {
          stopSpeech();
        }
        return next;
      });
    },
    [stopSpeech]
  );

  const toggleSilentMode = useCallback(() => {
    setPreferences((prev) => {
      const willBeSilent = !prev.silentMode;
      if (willBeSilent) {
        stopSpeech();
        showNotice("Silent Mode is ON 🤫 Audio muted. Visuals remain active.");
      } else {
        showNotice("Silent Mode is OFF 🔊 Audio and speech enabled.");
      }
      return {
        ...prev,
        silentMode: willBeSilent,
        muted: willBeSilent,
      };
    });
  }, [stopSpeech, showNotice]);

  // Sound effects runner obeying silent mode
  const playSound = useCallback(
    (type: "pop" | "chime" | "swoosh" | "celebration") => {
      if (preferences.silentMode || preferences.muted) return;
      if (type === "pop") soundEffects.playPop(false);
      else if (type === "chime") soundEffects.playChime(false);
      else if (type === "swoosh") soundEffects.playSwoosh(false);
      else if (type === "celebration") soundEffects.playCelebration(false);
    },
    [preferences.silentMode, preferences.muted]
  );

  // Central Speech Synthesis (TTS) Engine
  const speak = useCallback(
    (text: string, langOverride?: TTSLanguage) => {
      // 1. Silent Mode check
      if (preferences.silentMode || preferences.muted || !preferences.speechEnabled) {
        return;
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        showNotice("Text-to-speech is not available in this browser.");
        return;
      }

      const cleanText = text.trim();
      if (!cleanText) return;

      window.speechSynthesis.cancel();

      const lang = langOverride || preferences.ttsLanguage;
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select best voice
      const chosenVoice = findBestVoice(lang, preferences.ttsVoiceURI);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = lang === "te" ? "te-IN" : "en-US";
      }

      utterance.rate = preferences.ttsRate || 0.88;
      utterance.pitch = preferences.ttsPitch || 1.0;

      utterance.onstart = () => {
        setTtsStatus("speaking");
        setCurrentUtteranceText(cleanText);
      };

      utterance.onend = () => {
        setTtsStatus("idle");
        setCurrentUtteranceText("");
        activeUtteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        // "interrupted" or "canceled" are normal when canceling
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("Speech synthesis notice:", e.error);
        }
        setTtsStatus("idle");
        setCurrentUtteranceText("");
        activeUtteranceRef.current = null;
      };

      utterance.onpause = () => setTtsStatus("paused");
      utterance.onresume = () => setTtsStatus("speaking");

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [
      preferences.silentMode,
      preferences.muted,
      preferences.speechEnabled,
      preferences.ttsLanguage,
      preferences.ttsVoiceURI,
      preferences.ttsRate,
      preferences.ttsPitch,
      showNotice,
    ]
  );

  // Helper to evaluate and unlock achievement badges
  const checkBadgeUnlocks = useCallback(
    (newProgress: Progress) => {
      const newlyEarned: string[] = [];
      const currentUnlocked = new Set(newProgress.unlockedBadges);

      achievementBadges.forEach((badge) => {
        if (currentUnlocked.has(badge.id)) return;

        let shouldUnlock = false;
        if (badge.id === "streak_3" && newProgress.currentStreak >= 3) shouldUnlock = true;
        if (badge.id === "streak_7" && newProgress.currentStreak >= 7) shouldUnlock = true;
        if (badge.id === "streak_14" && newProgress.currentStreak >= 14) shouldUnlock = true;
        if (badge.id === "streak_30" && newProgress.currentStreak >= 30) shouldUnlock = true;
        if (badge.id === "first_sentence" && newProgress.communicationUses >= 1) shouldUnlock = true;
        if (badge.id === "games_3" && newProgress.totalGamesCompleted >= 3) shouldUnlock = true;
        if (badge.id === "points_100" && newProgress.totalPoints >= 100) shouldUnlock = true;

        if (shouldUnlock) {
          newlyEarned.push(badge.id);
          showNotice(`🌟 Achievement Unlocked: ${badge.title}! 🎉`);
          playSound("celebration");
        }
      });

      if (newlyEarned.length > 0) {
        return [...newProgress.unlockedBadges, ...newlyEarned];
      }
      return newProgress.unlockedBadges;
    },
    [showNotice, playSound]
  );

  // Streak & Activity Engine: strictly obeys single-calendar-day count
  const recordActivity = useCallback(
    (label: string, points = 10) => {
      setProgress((prev) => {
        const today = getLocalDateKey();
        const yesterday = getYesterdayDateKey();

        let newStreak = prev.currentStreak;

        if (prev.lastActiveDate === today) {
          // Already recorded active today -> do not increase streak again!
          newStreak = prev.currentStreak || 1;
        } else if (prev.lastActiveDate === yesterday) {
          // Active yesterday -> streak increases!
          newStreak = (prev.currentStreak || 0) + 1;
        } else {
          // First day or missed day -> reset streak to 1
          newStreak = 1;
        }

        const newLongest = Math.max(prev.longestStreak || 0, newStreak);
        const newPoints = (prev.totalPoints || 0) + points;

        const updatedDates = prev.activeDates.includes(today)
          ? prev.activeDates
          : [...prev.activeDates, today];

        const history = [
          { label, date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString() },
          ...prev.activityHistory,
        ].slice(0, 40);

        const updatedProgress: Progress = {
          ...prev,
          completedActivities: prev.completedActivities + 1,
          lastActiveDate: today,
          currentStreak: newStreak,
          longestStreak: newLongest,
          totalPoints: newPoints,
          activeDates: updatedDates,
          activityHistory: history,
        };

        updatedProgress.unlockedBadges = checkBadgeUnlocks(updatedProgress);
        return updatedProgress;
      });
    },
    [checkBadgeUnlocks]
  );

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setProgress((prev) => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));
  }, []);

  const recordGameCompleted = useCallback(
    (gameName: string, earnedPoints = 15) => {
      setProgress((prev) => {
        const updatedGames = (prev.totalGamesCompleted || 0) + 1;
        const progressWithGames = {
          ...prev,
          totalGamesCompleted: updatedGames,
        };
        progressWithGames.unlockedBadges = checkBadgeUnlocks(progressWithGames);
        return progressWithGames;
      });
      recordActivity(`Game: ${gameName}`, earnedPoints);
    },
    [checkBadgeUnlocks, recordActivity]
  );

  const recordCommunication = useCallback(
    (sentenceText?: string) => {
      setProgress((prev) => {
        const nextUses = prev.communicationUses + 1;
        const updated = {
          ...prev,
          communicationUses: nextUses,
        };
        updated.unlockedBadges = checkBadgeUnlocks(updated);
        return updated;
      });
      recordActivity(
        sentenceText ? `Spoke AAC: "${sentenceText.slice(0, 30)}..."` : "AAC message",
        10
      );
    },
    [checkBadgeUnlocks, recordActivity]
  );

  const toggleRoutine = useCallback((dateKey: string, index: number) => {
    setRoutines((prev) => {
      const current = prev[dateKey] || [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [dateKey]: next };
    });
  }, []);

  const saveRoutines = useCallback(
    (dateKey: string, indices: number[]) => {
      setRoutines((prev) => ({ ...prev, [dateKey]: indices }));
      recordActivity("Daily routine completed", 20);

      // Check if all routines completed
      if (indices.length === routineItems.length) {
        setProgress((prev) => {
          if (!prev.unlockedBadges.includes("routine_complete")) {
            showNotice("🌷 Routine Star Badge Unlocked! All steps done! 🎉");
            playSound("celebration");
            return {
              ...prev,
              unlockedBadges: [...prev.unlockedBadges, "routine_complete"],
            };
          }
          return prev;
        });
      }
    },
    [recordActivity, showNotice, playSound]
  );

  return (
    <AppContext.Provider
      value={{
        visitorName,
        setVisitorName,
        preferences,
        updatePreferences,
        toggleSilentMode,
        progress,
        recordActivity,
        recordAnswer,
        recordGameCompleted,
        recordCommunication,
        routines,
        toggleRoutine,
        saveRoutines,
        todayKey,
        speak,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        ttsStatus,
        currentUtteranceText,
        isTeluguSupported: teluguAvailable,
        availableVoices: voices,
        playSound,
        showNotice,
        notice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { routineItems };
