import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Preferences, Progress, RoutineMap } from "@/types";
import { routineItems } from "@/data/learningData";

const STORAGE_KEYS = {
  visitorName: "senseCalmVisitorName",
  progress: "senseCalmProgress",
  preferences: "senseCalmPreferences",
  routines: "senseCalmRoutines",
};

const defaultPreferences: Preferences = {
  reducedMotion: false,
  muted: true,
  simplified: false,
  speechEnabled: false,
  quietMode: false,
};

const defaultProgress: Progress = {
  completedActivities: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  communicationUses: 0,
  lastActiveDate: "",
  activityHistory: [],
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
  routines: RoutineMap;
  toggleRoutine: (dateKey: string, index: number) => void;
  saveRoutines: (dateKey: string, indices: number[]) => void;
  todayKey: string;
  speak: (text: string) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [visitorName, setVisitorNameState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.visitorName) || ""
  );
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...defaultPreferences,
    ...readJSON(STORAGE_KEYS.preferences, {}),
  }));
  const [progress, setProgress] = useState<Progress>(() => ({
    ...defaultProgress,
    ...readJSON(STORAGE_KEYS.progress, {}),
  }));
  const [routines, setRoutines] = useState<RoutineMap>(() =>
    readJSON(STORAGE_KEYS.routines, {})
  );
  const [notice, setNotice] = useState<string | null>(null);

  const todayKey = new Date().toISOString().slice(0, 10);

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

  const recordActivity = useCallback((label: string) => {
    setProgress((prev) => {
      const history = [
        { label, date: new Date().toLocaleString() },
        ...prev.activityHistory,
      ].slice(0, 30);
      return {
        ...prev,
        completedActivities: prev.completedActivities + 1,
        lastActiveDate: todayKey,
        activityHistory: history,
      };
    });
  }, [todayKey]);

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

  const toggleRoutine = useCallback((dateKey: string, index: number) => {
    setRoutines((prev) => {
      const current = prev[dateKey] || [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [dateKey]: next };
    });
  }, []);

  const saveRoutines = useCallback((dateKey: string, indices: number[]) => {
    setRoutines((prev) => ({ ...prev, [dateKey]: indices }));
  }, []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!preferences.speechEnabled || preferences.muted) return;
      if (!("speechSynthesis" in window)) {
        showNotice("Speech is not available in this browser.");
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    [preferences.speechEnabled, preferences.muted, showNotice]
  );

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
        routines,
        toggleRoutine,
        saveRoutines,
        todayKey,
        speak,
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
