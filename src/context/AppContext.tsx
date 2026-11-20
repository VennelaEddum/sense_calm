import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Preferences, Progress, RoutineMap, StreakData, SpeechState } from "@/types";
import { routineItems, milestoneBadges } from "@/data/learningData";

const STORAGE_KEYS = {
  visitorName: "senseCalmVisitorName",
  progress: "senseCalmProgress",
  preferences: "senseCalmPreferences",
  routines: "senseCalmRoutines",
};

const defaultPreferences: Preferences = {
  reducedMotion: false,
  muted: false,
  simplified: false,
  speechEnabled: true,
  quietMode: false,
  silentMode: false,
};

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: "",
  activeDays: [],
};

const defaultProgress: Progress = {
  completedActivities: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  communicationUses: 0,
  lastActiveDate: "",
  activityHistory: [],
  gamesCompleted: 0,
  totalPoints: 0,
  streak: defaultStreak,
  badges: [],
};

interface AppContextValue {
  visitorName: string;
  setVisitorName: (name: string) => void;
  preferences: Preferences;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  progress: Progress;
  recordActivity: (label: string) => void;
  recordAnswer: (isCorrect: boolean) => void;
  recordCommunication: () => void;
  recordGameComplete: (gameLabel: string, points?: number) => void;
  addPoints: (points: number) => void;
  routines: RoutineMap;
  toggleRoutine: (dateKey: string, index: number) => void;
  saveRoutines: (dateKey: string, indices: number[]) => void;
  todayKey: string;
  speak: (text: string, lang?: string) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  speechState: SpeechState;
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

function migrateProgress(raw: Partial<Progress> | null): Progress {
  if (!raw) return { ...defaultProgress };
  return {
    ...defaultProgress,
    ...raw,
    gamesCompleted: raw.gamesCompleted ?? 0,
    totalPoints: raw.totalPoints ?? 0,
    streak: { ...defaultStreak, ...(raw.streak ?? {}) },
    badges: raw.badges ?? [],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [visitorName, setVisitorNameState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.visitorName) || ""
  );
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...defaultPreferences,
    ...readJSON(STORAGE_KEYS.preferences, {}),
  }));
  const [progress, setProgress] = useState<Progress>(() =>
    migrateProgress(readJSON<Progress | null>(STORAGE_KEYS.progress, null))
  );
  const [routines, setRoutines] = useState<RoutineMap>(() =>
    readJSON(STORAGE_KEYS.routines, {})
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [speechState, setSpeechState] = useState<SpeechState>({ speaking: false, paused: false });

  const todayKey = new Date().toISOString().slice(0, 10);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

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

  const updatePreferences = useCallback((prefs: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  }, []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  /* ===== Streak logic ===== */
  const updateStreak = useCallback((dateKey: string) => {
    setProgress((prev) => {
      const streak = { ...prev.streak };
      const activeDays = [...streak.activeDays];

      // Already active today — don't increase streak
      if (streak.lastActivityDate === dateKey) {
        return prev;
      }

      const yesterday = new Date(dateKey);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);

      if (streak.lastActivityDate === yesterdayKey) {
        streak.currentStreak += 1;
      } else if (streak.lastActivityDate === "") {
        streak.currentStreak = 1;
      } else {
        streak.currentStreak = 1;
      }

      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.lastActivityDate = dateKey;

      if (!activeDays.includes(dateKey)) {
        activeDays.push(dateKey);
      }
      // Keep last 60 days
      streak.activeDays = activeDays.slice(-60);

      // Check for new badges
      const existingBadges = [...prev.badges];
      for (const milestone of milestoneBadges) {
        if (streak.currentStreak >= milestone.days && !existingBadges.includes(milestone.label)) {
          existingBadges.push(milestone.label);
        }
      }

      return { ...prev, streak, badges: existingBadges };
    });
  }, []);

  const recordActivity = useCallback((label: string) => {
    setProgress((prev) => {
      const history = [{ label, date: new Date().toLocaleString() }, ...prev.activityHistory].slice(0, 30);
      return {
        ...prev,
        completedActivities: prev.completedActivities + 1,
        lastActiveDate: todayKey,
        activityHistory: history,
      };
    });
    updateStreak(todayKey);
  }, [todayKey, updateStreak]);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setProgress((prev) => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));
  }, []);

  const recordCommunication = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      communicationUses: prev.communicationUses + 1,
    }));
  }, []);

  const recordGameComplete = useCallback((gameLabel: string, points = 10) => {
    setProgress((prev) => {
      const history = [{ label: gameLabel, date: new Date().toLocaleString() }, ...prev.activityHistory].slice(0, 30);
      return {
        ...prev,
        gamesCompleted: prev.gamesCompleted + 1,
        totalPoints: prev.totalPoints + points,
        completedActivities: prev.completedActivities + 1,
        lastActiveDate: todayKey,
        activityHistory: history,
      };
    });
    updateStreak(todayKey);
  }, [todayKey, updateStreak]);

  const addPoints = useCallback((points: number) => {
    setProgress((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
    }));
  }, []);

  const toggleRoutine = useCallback((dateKey: string, index: number) => {
    setRoutines((prev) => {
      const current = prev[dateKey] || [];
      const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
      return { ...prev, [dateKey]: next };
    });
  }, []);

  const saveRoutines = useCallback((dateKey: string, indices: number[]) => {
    setRoutines((prev) => ({ ...prev, [dateKey]: indices }));
  }, []);

  /* ===== Improved TTS with play/pause/resume/stop ===== */
  const speak = useCallback(
    (text: string, lang?: string) => {
      // Silent Mode mutes all audio but keeps visuals
      // muted also blocks speech; speechEnabled must be on
      if (preferences.silentMode || preferences.muted || !preferences.speechEnabled) return;
      if (!("speechSynthesis" in window)) {
        showNotice("Speech is not available in this browser.");
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      if (lang) {
        utterance.lang = lang;
      }

      // Try to pick a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = (lang || "en").split("-")[0];
        const preferred = voices.find((v) => v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes("google"));
        const natural = preferred || voices.find((v) => v.lang.startsWith(langPrefix) && v.localService);
        const fallback = preferred || natural || voices.find((v) => v.lang.startsWith(langPrefix)) || voices[0];
        if (fallback) utterance.voice = fallback;
      }

      utterance.onstart = () => setSpeechState({ speaking: true, paused: false });
      utterance.onend = () => setSpeechState({ speaking: false, paused: false });
      utterance.onerror = () => setSpeechState({ speaking: false, paused: false });

      currentUtterance.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [preferences.silentMode, preferences.muted, preferences.speechEnabled, showNotice]
  );

  const pauseSpeech = useCallback(() => {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setSpeechState({ speaking: true, paused: true });
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSpeechState({ speaking: true, paused: false });
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechState({ speaking: false, paused: false });
  }, []);

  // Load voices if they load asynchronously
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
  }, []);

  // Stop speech when silent mode turns on
  useEffect(() => {
    if (preferences.silentMode && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeechState({ speaking: false, paused: false });
    }
  }, [preferences.silentMode]);

  return (
    <AppContext.Provider
      value={{
        visitorName,
        setVisitorName,
        preferences,
        updatePreferences,
        progress,
        recordActivity,
        recordAnswer,
        recordCommunication,
        recordGameComplete,
        addPoints,
        routines,
        toggleRoutine,
        saveRoutines,
        todayKey,
        speak,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        speechState,
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
