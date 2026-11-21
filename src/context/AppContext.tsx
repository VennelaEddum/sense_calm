import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  Preferences,
  Progress,
  RoutineMap,
  TTSLanguage,
  AACCardItem,
  EmotionCheckInRecord,
  TimelineStepItem,
  ChildProfile,
  EmergencyCard,
  GameDifficulty,
} from "@/types";
import { routineItems } from "@/data/learningData";
import { achievementBadges } from "@/data/badgesData";
import { initialTimelineSteps } from "@/data/routineTimelineData";
import {
  findBestVoice,
  soundEffects,
  ambientSoundManager,
  getAvailableVoices,
  isTeluguVoiceAvailable,
} from "@/utils/audioManager";
import {
  storeImageInDB,
  deleteImageFromDB,
  getAllCustomImages,
} from "@/utils/indexedDBStorage";

const STORAGE_KEYS = {
  visitorName: "senseCalmVisitorName",
  progress: "senseCalmProgress",
  preferences: "senseCalmPreferences",
  routines: "senseCalmRoutines",
  customCards: "senseCalmCustomCards",
  emotionHistory: "senseCalmEmotionHistory",
  timelineRoutines: "senseCalmTimelineRoutines",
  childProfile: "senseCalmChildProfile",
};

export const defaultPreferences: Preferences = {
  reducedMotion: false,
  muted: false,
  silentMode: false,
  simplified: false,
  speechEnabled: true,
  quietMode: false,
  ttsLanguage: "en",
  ttsVoiceURI: "",
  ttsRate: 0.88,
  ttsPitch: 1.0,
  sensoryTheme: "default",
  brightnessOverlay: "normal",
  highContrast: false,
  ambientSound: "none",
  ambientVolume: 0.35,
  gameDifficulty: "beginner",
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

export const defaultChildProfile: ChildProfile = {
  name: "",
  preferredLanguage: "en",
  preferredVoiceURI: "",
  favoriteCardIds: ["need_help", "need_water", "feel_happy", "need_break"],
  favoriteActivities: ["Picture Detective", "Emotion Explorer"],
  frequentlyUsedSentences: ["I want water", "I need a break", "I feel happy"],
  caregiverPIN: "",
  notes: "A calm, gentle learning and communication space.",
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
  playSound: (type: "pop" | "chime" | "swoosh" | "celebration" | "breathing") => void;
  showNotice: (message: string) => void;
  notice: string | null;

  // Part 1: Emotion Assistant
  emotionHistory: EmotionCheckInRecord[];
  recordEmotionCheckIn: (
    checkIn: Omit<EmotionCheckInRecord, "id" | "timestamp" | "dateKey">
  ) => void;

  // Part 3 & 4: Custom AAC Cards & Familiar People
  customAACCards: AACCardItem[];
  addCustomAACCard: (card: AACCardItem, imageBlobOrDataUrl?: string) => Promise<void>;
  updateCustomAACCard: (card: AACCardItem, imageBlobOrDataUrl?: string) => Promise<void>;
  deleteCustomAACCard: (cardId: string) => Promise<void>;
  recordCardUsage: (cardId: string) => void;

  // Part 5: Emergency Communication
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  triggerEmergency: (card: EmergencyCard) => void;

  // Part 2 & Comfort
  breathingModalOpen: boolean;
  setBreathingModalOpen: (open: boolean) => void;

  // Part 6: Visual Routine Timeline
  timelineSteps: TimelineStepItem[];
  toggleTimelineStep: (id: string) => void;
  addTimelineStep: (step: TimelineStepItem) => void;
  deleteTimelineStep: (id: string) => void;
  reorderTimelineSteps: (steps: TimelineStepItem[]) => void;

  // Part 3: Caregiver Profile & Gate
  childProfile: ChildProfile;
  updateChildProfile: (profile: Partial<ChildProfile>) => void;
  isCaregiverAuthenticated: boolean;
  setIsCaregiverAuthenticated: (auth: boolean) => void;
  caregiverGateModalOpen: boolean;
  setCaregiverGateModalOpen: (open: boolean) => void;

  // Part 7: Connectivity
  isOnline: boolean;

  // Part 10: Privacy & Export
  exportAllData: () => void;
  clearAllUserData: () => void;
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

  // New Upgrade States
  const [customAACCards, setCustomAACCards] = useState<AACCardItem[]>(() =>
    readJSON(STORAGE_KEYS.customCards, [])
  );

  const [emotionHistory, setEmotionHistory] = useState<EmotionCheckInRecord[]>(() =>
    readJSON(STORAGE_KEYS.emotionHistory, [])
  );

  const [timelineSteps, setTimelineSteps] = useState<TimelineStepItem[]>(() =>
    readJSON(STORAGE_KEYS.timelineRoutines, initialTimelineSteps)
  );

  const [childProfile, setChildProfile] = useState<ChildProfile>(() => {
    const saved = readJSON<Partial<ChildProfile>>(STORAGE_KEYS.childProfile, {});
    return {
      ...defaultChildProfile,
      ...saved,
      name: visitorName || saved.name || "",
    };
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>("idle");
  const [currentUtteranceText, setCurrentUtteranceText] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [teluguAvailable, setTeluguAvailable] = useState<boolean>(false);

  // Modals & Navigation Barriers
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);
  const [caregiverGateModalOpen, setCaregiverGateModalOpen] = useState(false);
  const [isCaregiverAuthenticated, setIsCaregiverAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const todayKey = getLocalDateKey();
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Track Online / Offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Hydrate custom AAC card images from IndexedDB
  useEffect(() => {
    async function loadCustomImages() {
      try {
        const imageMap = await getAllCustomImages();
        setCustomAACCards((prev) =>
          prev.map((card) => {
            if (imageMap[card.id]) {
              return { ...card, imageUrl: imageMap[card.id] };
            }
            return card;
          })
        );
      } catch (err) {
        console.warn("Could not hydrate images from IndexedDB:", err);
      }
    }
    loadCustomImages();
  }, []);

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

  // Sync ambient sounds with preferences
  useEffect(() => {
    if (preferences.silentMode || preferences.muted || preferences.ambientSound === "none") {
      ambientSoundManager.stop();
    } else {
      ambientSoundManager.start(
        preferences.ambientSound,
        preferences.ambientVolume,
        preferences.silentMode
      );
    }
    return () => {
      ambientSoundManager.stop();
    };
  }, [preferences.ambientSound, preferences.ambientVolume, preferences.silentMode, preferences.muted]);

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

  useEffect(() => {
    // Save custom cards metadata without raw heavy base64 to avoid quota issues
    const lightweight = customAACCards.map(({ imageUrl, ...rest }) => ({
      ...rest,
      imageUrl: imageUrl && !imageUrl.startsWith("blob:") ? imageUrl : undefined,
    }));
    localStorage.setItem(STORAGE_KEYS.customCards, JSON.stringify(lightweight));
  }, [customAACCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.emotionHistory, JSON.stringify(emotionHistory));
  }, [emotionHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.timelineRoutines, JSON.stringify(timelineSteps));
  }, [timelineSteps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.childProfile, JSON.stringify(childProfile));
  }, [childProfile]);

  const setVisitorName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEYS.visitorName, name);
    setVisitorNameState(name);
    setChildProfile((prev) => ({ ...prev, name }));
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
        if (prefs.silentMode !== undefined) {
          next.muted = prefs.silentMode;
          next.silentMode = prefs.silentMode;
        } else if (prefs.muted !== undefined) {
          next.silentMode = prefs.muted;
          next.muted = prefs.muted;
        }
        if (next.silentMode) {
          stopSpeech();
          ambientSoundManager.stop();
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
        ambientSoundManager.stop();
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

  const playSound = useCallback(
    (type: "pop" | "chime" | "swoosh" | "celebration" | "breathing") => {
      if (preferences.silentMode || preferences.muted) return;
      if (type === "pop") soundEffects.playPop(false);
      else if (type === "chime") soundEffects.playChime(false);
      else if (type === "breathing") soundEffects.playBreathingChime(false);
      else if (type === "swoosh") soundEffects.playSwoosh(false);
      else if (type === "celebration") soundEffects.playCelebration(false);
    },
    [preferences.silentMode, preferences.muted]
  );

  const speak = useCallback(
    (text: string, langOverride?: TTSLanguage) => {
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

  const recordActivity = useCallback(
    (label: string, points = 10) => {
      setProgress((prev) => {
        const today = getLocalDateKey();
        const yesterday = getYesterdayDateKey();

        let newStreak = prev.currentStreak;

        if (prev.lastActiveDate === today) {
          newStreak = prev.currentStreak || 1;
        } else if (prev.lastActiveDate === yesterday) {
          newStreak = (prev.currentStreak || 0) + 1;
        } else {
          newStreak = 1;
        }

        const newLongest = Math.max(prev.longestStreak || 0, newStreak);
        const newPoints = (prev.totalPoints || 0) + points;

        const updatedDates = prev.activeDates.includes(today)
          ? prev.activeDates
          : [...prev.activeDates, today];

        const history = [
          {
            label,
            date:
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
              ", " +
              new Date().toLocaleDateString(),
          },
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

      // Track frequently used sentences in child profile
      if (sentenceText && sentenceText.trim()) {
        setChildProfile((prev) => {
          const list = [sentenceText.trim(), ...prev.frequentlyUsedSentences.filter((s) => s !== sentenceText.trim())].slice(0, 8);
          return { ...prev, frequentlyUsedSentences: list };
        });
      }
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

  // ==========================================
  // PART 1: EMOTION CHECK-IN
  // ==========================================
  const recordEmotionCheckIn = useCallback(
    (checkIn: Omit<EmotionCheckInRecord, "id" | "timestamp" | "dateKey">) => {
      const newRecord: EmotionCheckInRecord = {
        ...checkIn,
        id: `emot-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dateKey: getLocalDateKey(),
      };
      setEmotionHistory((prev) => [newRecord, ...prev].slice(0, 50));
      recordActivity(`Emotion check-in: ${checkIn.emotionLabel}`, 10);
    },
    [recordActivity]
  );

  // ==========================================
  // PART 3 & 4: CUSTOM AAC & FAMILIAR PEOPLE
  // ==========================================
  const addCustomAACCard = useCallback(
    async (card: AACCardItem, imageBlobOrDataUrl?: string) => {
      if (imageBlobOrDataUrl) {
        await storeImageInDB(card.id, imageBlobOrDataUrl);
      }
      setCustomAACCards((prev) => [...prev, card]);
      showNotice(`Card "${card.text}" added! 🌟`);
    },
    [showNotice]
  );

  const updateCustomAACCard = useCallback(
    async (updatedCard: AACCardItem, imageBlobOrDataUrl?: string) => {
      if (imageBlobOrDataUrl) {
        await storeImageInDB(updatedCard.id, imageBlobOrDataUrl);
      }
      setCustomAACCards((prev) =>
        prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
      );
      showNotice(`Card "${updatedCard.text}" updated!`);
    },
    [showNotice]
  );

  const deleteCustomAACCard = useCallback(
    async (cardId: string) => {
      await deleteImageFromDB(cardId);
      setCustomAACCards((prev) => prev.filter((c) => c.id !== cardId));
      showNotice("Custom card removed.");
    },
    [showNotice]
  );

  const recordCardUsage = useCallback((cardId: string) => {
    setCustomAACCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c))
    );
  }, []);

  // ==========================================
  // PART 5: EMERGENCY ACTIONS
  // ==========================================
  const triggerEmergency = useCallback(
    (card: EmergencyCard) => {
      setEmergencyModalOpen(true);
      const msg = preferences.ttsLanguage === "te" ? card.teluguTitle : card.title;
      // Emergency alert speaks even if silentMode is active, or prompts loudly
      speak(msg, preferences.ttsLanguage);
      recordActivity(`Emergency: ${card.title}`, 0);
    },
    [preferences.ttsLanguage, speak, recordActivity]
  );

  // ==========================================
  // PART 6: TIMELINE ROUTINES
  // ==========================================
  const toggleTimelineStep = useCallback((id: string) => {
    setTimelineSteps((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
      const allDone = updated.every((s) => s.isCompleted);
      if (allDone) {
        showNotice("🌟 All daily timeline steps completed! Wonderful! 🎉");
      }
      return updated;
    });
  }, [showNotice]);

  const addTimelineStep = useCallback((step: TimelineStepItem) => {
    setTimelineSteps((prev) => [...prev, step]);
  }, []);

  const deleteTimelineStep = useCallback((id: string) => {
    setTimelineSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderTimelineSteps = useCallback((steps: TimelineStepItem[]) => {
    setTimelineSteps(steps);
  }, []);

  // ==========================================
  // PART 3 & 8: CHILD PROFILE
  // ==========================================
  const updateChildProfile = useCallback(
    (profile: Partial<ChildProfile>) => {
      setChildProfile((prev) => {
        const next = { ...prev, ...profile };
        if (profile.name !== undefined) {
          setVisitorName(profile.name);
        }
        if (profile.preferredLanguage !== undefined) {
          updatePreferences({ ttsLanguage: profile.preferredLanguage });
        }
        return next;
      });
      showNotice("Child profile updated ♡");
    },
    [setVisitorName, updatePreferences, showNotice]
  );

  // ==========================================
  // PART 10: PRIVACY EXPORT & DELETION
  // ==========================================
  const exportAllData = useCallback(() => {
    const fullReport = {
      app: "SenseCalm",
      version: "2.1",
      exportedAt: new Date().toISOString(),
      childProfile,
      preferences,
      progress,
      routines,
      timelineSteps,
      emotionHistory,
      customAACCards: customAACCards.map(({ imageUrl, ...rest }) => rest), // Export metadata safely
    };
    const blob = new Blob([JSON.stringify(fullReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sensecalm-complete-export-${todayKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Complete data backup downloaded safely.");
  }, [childProfile, preferences, progress, routines, timelineSteps, emotionHistory, customAACCards, todayKey, showNotice]);

  const clearAllUserData = useCallback(() => {
    localStorage.clear();
    setVisitorNameState("");
    setPreferences(defaultPreferences);
    setProgress(defaultProgress);
    setRoutines({});
    setCustomAACCards([]);
    setEmotionHistory([]);
    setTimelineSteps(initialTimelineSteps);
    setChildProfile(defaultChildProfile);
    showNotice("All local user data has been reset.");
  }, [showNotice]);

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

        // New feature accessors
        emotionHistory,
        recordEmotionCheckIn,

        customAACCards,
        addCustomAACCard,
        updateCustomAACCard,
        deleteCustomAACCard,
        recordCardUsage,

        emergencyModalOpen,
        setEmergencyModalOpen,
        triggerEmergency,

        breathingModalOpen,
        setBreathingModalOpen,

        timelineSteps,
        toggleTimelineStep,
        addTimelineStep,
        deleteTimelineStep,
        reorderTimelineSteps,

        childProfile,
        updateChildProfile,
        isCaregiverAuthenticated,
        setIsCaregiverAuthenticated,
        caregiverGateModalOpen,
        setCaregiverGateModalOpen,

        isOnline,

        exportAllData,
        clearAllUserData,
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
