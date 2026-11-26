import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  Preferences,
  Progress,
  RoutineMap,
  ModuleName,
  TTSStatus,
  TTSLanguage,
  AACCardItem,
  EmotionCheckInRecord,
  TimelineStepItem,
  ChildProfile,
  CaregiverProfile,
  EmergencyCard,
  SyncStatus,
} from "@/types";
import {
  soundEffects,
  ambientSoundManager,
  getAvailableVoices,
  isTeluguVoiceAvailable,
} from "@/utils/audioManager";
import {
  speakUnified,
  stopUnified,
  openAndroidTtsSettings,
  initNativeTtsListeners,
} from "@/utils/nativeTTS";
import {
  saveCustomImage,
  getCustomImage,
  getAllCustomImages,
  deleteCustomImage,
} from "@/utils/indexedDBStorage";
import { initialTimelineSteps } from "@/data/routineTimelineData";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  getOrCreateCaregiverProfile,
  fetchChildProfilesFromDB,
  createChildProfileInDB,
  updateChildProfileInDB,
  fetchAACCardsFromDB,
  saveAACCardToDB,
  deleteAACCardFromDB,
  logEmotionCheckInToDB,
  fetchSensoryPreferencesFromDB,
  saveSensoryPreferencesToDB,
  saveLearningProgressToDB,
  fetchRoutineStepsFromDB,
  flushSyncQueue,
} from "@/lib/syncService";

const STORAGE_KEYS = {
  preferences: "sense_calm_preferences_v2",
  progress: "sense_calm_progress_v2",
  routines: "sense_calm_routines_v2",
  visitorName: "sense_calm_visitor_name_v2",
  customCards: "sense_calm_custom_cards_v2",
  emotionHistory: "sense_calm_emotion_history_v2",
  timelineRoutines: "sense_calm_timeline_routines_v2",
  childProfile: "sense_calm_child_profile_v2",
  childProfilesList: "sense_calm_child_profiles_list_v2",
  caregiverProfile: "sense_calm_caregiver_profile_v2",
};

const defaultPreferences: Preferences = {
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
  ambientVolume: 0.4,
  gameDifficulty: "beginner",
};

const defaultProgress: Progress = {
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

const defaultChildProfile: ChildProfile = {
  name: "",
  preferredLanguage: "en",
  preferredVoiceURI: "",
  preferredCommMode: "aac",
  sensorySensitivities: ["Loud sudden noises"],
  favoriteCalmingTools: ["Guided 4-4-4 breathing", "Gentle rain & ocean waves"],
  avatarEmoji: "🐰",
  favoriteCardIds: [],
  favoriteActivities: [],
  frequentlyUsedSentences: [],
  caregiverPIN: "",
  notes: "",
};

const routineItems = [
  "Brush Teeth",
  "Eat Breakfast",
  "School Activities",
  "Quiet Play",
  "Bedtime Stories",
];

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
  speak: (text: string, langOverride?: TTSLanguage, forceSpeak?: boolean) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  repeatSpeech: () => void;
  openSystemTtsSettings: () => Promise<boolean>;
  voiceDiagnosticsOpen: boolean;
  setVoiceDiagnosticsOpen: (open: boolean) => void;
  lastVoiceError: string | null;
  ttsStatus: TTSStatus;
  currentUtteranceText: string;
  isTeluguSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  playSound: (type: "pop" | "chime" | "swoosh" | "celebration" | "breathing") => void;
  showNotice: (message: string) => void;
  notice: string | null;

  // Emotion Assistant
  emotionHistory: EmotionCheckInRecord[];
  recordEmotionCheckIn: (
    checkIn: Omit<EmotionCheckInRecord, "id" | "timestamp" | "dateKey">
  ) => void;

  // Custom AAC Cards & Familiar People
  customAACCards: AACCardItem[];
  addCustomAACCard: (card: AACCardItem, imageBlobOrDataUrl?: string) => Promise<void>;
  updateCustomAACCard: (card: AACCardItem, imageBlobOrDataUrl?: string) => Promise<void>;
  deleteCustomAACCard: (cardId: string) => Promise<void>;
  recordCardUsage: (cardId: string) => void;

  // Emergency Communication
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  triggerEmergency: (card: EmergencyCard) => void;

  // Comfort & Breathing
  breathingModalOpen: boolean;
  setBreathingModalOpen: (open: boolean) => void;

  // Visual Routine Timeline
  timelineSteps: TimelineStepItem[];
  toggleTimelineStep: (id: string) => void;
  addTimelineStep: (step: TimelineStepItem) => void;
  deleteTimelineStep: (id: string) => void;
  reorderTimelineSteps: (steps: TimelineStepItem[]) => void;

  // Caregiver Gate & Authentication
  childProfile: ChildProfile;
  updateChildProfile: (profile: Partial<ChildProfile>) => void;
  isCaregiverAuthenticated: boolean;
  setIsCaregiverAuthenticated: (auth: boolean) => void;
  caregiverGateModalOpen: boolean;
  setCaregiverGateModalOpen: (open: boolean) => void;

  // Supabase Authentication & Database Integration
  isAuthenticated: boolean;
  authLoading: boolean;
  caregiverProfile: CaregiverProfile | null;
  childProfiles: ChildProfile[];
  activeChildProfile: ChildProfile | null;
  isSupabaseActive: boolean;
  syncStatus: SyncStatus;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; requireVerification?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  createChildProfile: (profile: Omit<ChildProfile, "id">) => Promise<ChildProfile | null>;
  selectActiveChild: (child: ChildProfile) => void;
  syncNow: () => Promise<void>;

  // Connectivity
  isOnline: boolean;

  // Privacy & Export
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

  // Supabase Auth & Profile States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfile | null>(() =>
    readJSON(STORAGE_KEYS.caregiverProfile, null)
  );
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(() =>
    readJSON(STORAGE_KEYS.childProfilesList, [])
  );
  const [activeChildProfile, setActiveChildProfile] = useState<ChildProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const [notice, setNotice] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>("idle");
  const [currentUtteranceText, setCurrentUtteranceText] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [teluguAvailable, setTeluguAvailable] = useState<boolean>(false);
  const [voiceDiagnosticsOpen, setVoiceDiagnosticsOpen] = useState(false);
  const [lastVoiceError, setLastVoiceError] = useState<string | null>(null);
  const lastUtteranceTextRef = useRef<string>("Hello! Welcome to Sense Calm.");
  const lastUtteranceLangRef = useRef<TTSLanguage>("en");

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

  // Track Online / Offline status and flush pending sync items
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("syncing");
      flushSyncQueue().then(() => setSyncStatus("synced")).catch(() => setSyncStatus("error"));
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

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

  // Initialize native Android TTS listeners
  useEffect(() => {
    initNativeTtsListeners(
      (status, utteranceText) => {
        setTtsStatus(status);
        setCurrentUtteranceText(utteranceText || "");
      },
      (errMsg) => {
        setLastVoiceError(errMsg);
      }
    );
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.childProfilesList, JSON.stringify(childProfiles));
  }, [childProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.caregiverProfile, JSON.stringify(caregiverProfile));
  }, [caregiverProfile]);

  // -------------------------------------------------------------
  // SUPABASE SESSION RESTORATION & AUTH STATE LISTENER
  // -------------------------------------------------------------
  const loadCaregiverAndChildren = useCallback(
    async (userId: string, email: string, name?: string) => {
      try {
        setSyncStatus("syncing");
        const profile = await getOrCreateCaregiverProfile(userId, email, name);
        if (profile) {
          setCaregiverProfile(profile);
          setIsCaregiverAuthenticated(true);
        }

        const children = await fetchChildProfilesFromDB(userId);
        if (children && children.length > 0) {
          setChildProfiles(children);
          const first = children[0];
          setActiveChildProfile(first);
          setChildProfile(first);

          // Fetch cloud AAC cards and merge with local
          const dbCards = await fetchAACCardsFromDB(first.id!, userId);
          if (dbCards && dbCards.length > 0) {
            setCustomAACCards((prev) => {
              const map = new Map<string, AACCardItem>();
              prev.forEach((c) => map.set(c.id, c));
              dbCards.forEach((c) => map.set(c.id, c));
              return Array.from(map.values());
            });
          }

          // Fetch sensory preferences
          const dbSensory = await fetchSensoryPreferencesFromDB(first.id!, userId);
          if (dbSensory) {
            setPreferences((prev) => ({ ...prev, ...dbSensory }));
          }

          // Fetch routine steps
          const dbSteps = await fetchRoutineStepsFromDB(first.id!, userId);
          if (dbSteps && dbSteps.length > 0) {
            setTimelineSteps(dbSteps);
          }
        }
        setSyncStatus("synced");
      } catch (err) {
        console.warn("Error restoring caregiver data from Supabase:", err);
        setSyncStatus("error");
      }
    },
    []
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        loadCaregiverAndChildren(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata?.full_name
        );
      }
      setAuthLoading(false);
    });

    // 2. Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        loadCaregiverAndChildren(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata?.full_name
        );
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setIsCaregiverAuthenticated(false);
        setCaregiverProfile(null);
        setActiveChildProfile(null);
        setSyncStatus("idle");
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCaregiverAndChildren]);

  // -------------------------------------------------------------
  // AUTH METHODS
  // -------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      if (!isSupabaseConfigured) {
        // Local mode fallback
        const mockCaregiver: CaregiverProfile = {
          id: `local_cg_${Date.now()}`,
          email,
          fullName: email.split("@")[0] || "Caregiver",
          role: "caregiver",
        };
        setCaregiverProfile(mockCaregiver);
        setIsAuthenticated(true);
        setIsCaregiverAuthenticated(true);
        return { success: true };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          setIsAuthenticated(true);
          await loadCaregiverAndChildren(
            data.user.id,
            data.user.email || email,
            data.user.user_metadata?.full_name
          );
          return { success: true };
        }

        return { success: false, error: "Sign in failed. Please try again." };
      } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred." };
      }
    },
    [loadCaregiverAndChildren]
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      if (!isSupabaseConfigured) {
        const mockCaregiver: CaregiverProfile = {
          id: `local_cg_${Date.now()}`,
          email,
          fullName,
          role: "caregiver",
        };
        setCaregiverProfile(mockCaregiver);
        setIsAuthenticated(true);
        setIsCaregiverAuthenticated(true);
        return { success: true };
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Check if email confirmation is required
          const requireVerification = !data.session;
          if (data.session) {
            setIsAuthenticated(true);
            await loadCaregiverAndChildren(data.user.id, email, fullName);
          }
          return { success: true, requireVerification };
        }

        return { success: false, error: "Could not create account." };
      } catch (err: any) {
        return { success: false, error: err.message || "Registration error." };
      }
    },
    [loadCaregiverAndChildren]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setIsCaregiverAuthenticated(false);
    setCaregiverProfile(null);
    setActiveChildProfile(null);
    setSyncStatus("idle");
    setNotice("You have safely signed out.");
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const createChildProfile = useCallback(
    async (profile: Omit<ChildProfile, "id">) => {
      const caregiverId = caregiverProfile?.id || "local_caregiver";
      const created = await createChildProfileInDB(profile, caregiverId);
      if (created) {
        setChildProfiles((prev) => [...prev, created]);
        setActiveChildProfile(created);
        setChildProfile(created);
        setVisitorNameState(created.name);
        return created;
      }
      return null;
    },
    [caregiverProfile]
  );

  const selectActiveChild = useCallback(
    async (child: ChildProfile) => {
      setActiveChildProfile(child);
      setChildProfile(child);
      setVisitorNameState(child.name);

      if (caregiverProfile?.id && child.id) {
        // Load custom cards for selected child
        const cards = await fetchAACCardsFromDB(child.id, caregiverProfile.id);
        if (cards && cards.length > 0) {
          setCustomAACCards(cards);
        }
      }
      setNotice(`Active child profile set to ${child.name} ♡`);
    },
    [caregiverProfile]
  );

  const syncNow = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus("offline");
      return;
    }
    setSyncStatus("syncing");
    try {
      await flushSyncQueue();
      if (caregiverProfile?.id && activeChildProfile?.id) {
        await saveSensoryPreferencesToDB(preferences, activeChildProfile.id, caregiverProfile.id);
      }
      setSyncStatus("synced");
      setNotice("Cloud Database synchronized. ☁");
    } catch {
      setSyncStatus("error");
    }
  }, [isOnline, caregiverProfile, activeChildProfile, preferences]);

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
    stopUnified().catch(() => {});
    setTtsStatus("idle");
    setCurrentUtteranceText("");
    activeUtteranceRef.current = null;
  }, []);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    setTtsStatus("paused");
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }
    setTtsStatus("speaking");
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

        // Sync to Supabase if authenticated
        if (caregiverProfile?.id && activeChildProfile?.id) {
          saveSensoryPreferencesToDB(next, activeChildProfile.id, caregiverProfile.id);
        }

        return next;
      });
    },
    [stopSpeech, caregiverProfile, activeChildProfile]
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
      const updated = {
        ...prev,
        silentMode: willBeSilent,
        muted: willBeSilent,
      };

      if (caregiverProfile?.id && activeChildProfile?.id) {
        saveSensoryPreferencesToDB(updated, activeChildProfile.id, caregiverProfile.id);
      }

      return updated;
    });
  }, [stopSpeech, showNotice, caregiverProfile, activeChildProfile]);

  const playSound = useCallback(
    (type: "pop" | "chime" | "swoosh" | "celebration" | "breathing") => {
      if (preferences.silentMode || preferences.muted) return;
      if (type === "pop") soundEffects.playPop(false);
      else if (type === "chime") soundEffects.playChime(false);
      else if (type === "swoosh") soundEffects.playSwoosh(false);
      else if (type === "celebration") soundEffects.playCelebration(false);
      else if (type === "breathing") soundEffects.playBreathingChime(false);
    },
    [preferences.silentMode, preferences.muted]
  );

  const speak = useCallback(
    (text: string, langOverride?: TTSLanguage, forceSpeak?: boolean) => {
      if (!forceSpeak && (preferences.silentMode || preferences.muted || !preferences.speechEnabled)) {
        return;
      }

      const lang = langOverride || preferences.ttsLanguage || "en";
      lastUtteranceTextRef.current = text;
      lastUtteranceLangRef.current = lang;
      setLastVoiceError(null);

      // Cancel previous speech to prevent overlapping audio
      stopUnified().catch(() => {});

      setTtsStatus("playing");
      setCurrentUtteranceText(text);

      speakUnified(
        text,
        lang,
        preferences.ttsRate || 0.88,
        preferences.ttsPitch || 1.0,
        preferences.ttsVoiceURI,
        {
          onStart: () => {
            setTtsStatus("playing");
            setCurrentUtteranceText(text);
          },
          onEnd: () => {
            setTtsStatus("idle");
            setCurrentUtteranceText("");
          },
          onError: (errMsg) => {
            setTtsStatus("idle");
            setCurrentUtteranceText("");
            setLastVoiceError(errMsg);
            if (lang === "te" && (errMsg.includes("TELUGU") || errMsg.includes("missing"))) {
              showNotice("Telugu voice data missing on this device. Install voice data in Android Text-to-Speech settings.");
            }
          },
        }
      ).then((res) => {
        if (!res.success && res.error === "TELUGU_VOICE_MISSING") {
          setTtsStatus("idle");
          setCurrentUtteranceText("");
          setLastVoiceError(res.message || "Telugu voice package missing");
          showNotice("Telugu voice is not installed on this Android device. You can install it in Android Text-to-Speech settings.");
        }
      });
    },
    [preferences, showNotice]
  );

  const repeatSpeech = useCallback(() => {
    const textToRepeat = lastUtteranceTextRef.current || "Hello! Welcome to Sense Calm.";
    const langToRepeat = lastUtteranceLangRef.current || preferences.ttsLanguage || "en";
    speak(textToRepeat, langToRepeat);
  }, [speak, preferences.ttsLanguage]);

  const openSystemTtsSettings = useCallback(async () => {
    return await openAndroidTtsSettings();
  }, []);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setProgress((prev) => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
    }));
  }, []);

  const recordActivity = useCallback((label: string, points = 10) => {
    const today = getLocalDateKey();
    const yesterday = getYesterdayDateKey();

    setProgress((prev) => {
      let nextStreak = prev.currentStreak;
      const alreadyActiveToday = prev.activeDates.includes(today);

      if (!alreadyActiveToday) {
        if (prev.lastActiveDate === yesterday || prev.currentStreak === 0) {
          nextStreak += 1;
        } else {
          nextStreak = 1;
        }
      }

      const longest = Math.max(prev.longestStreak, nextStreak);
      const newActiveDates = alreadyActiveToday ? prev.activeDates : [...prev.activeDates, today];

      const newHistory = [
        { label, date: new Date().toISOString() },
        ...prev.activityHistory.slice(0, 49),
      ];

      return {
        ...prev,
        completedActivities: prev.completedActivities + 1,
        totalPoints: prev.totalPoints + points,
        currentStreak: nextStreak,
        longestStreak: longest,
        lastActiveDate: today,
        activeDates: newActiveDates,
        activityHistory: newHistory,
      };
    });
  }, []);

  const recordGameCompleted = useCallback(
    (gameName: string, earnedPoints = 15) => {
      setProgress((prev) => ({
        ...prev,
        totalGamesCompleted: prev.totalGamesCompleted + 1,
      }));
      recordActivity(`Played ${gameName}`, earnedPoints);

      // Save to Supabase if authenticated
      if (caregiverProfile?.id && activeChildProfile?.id) {
        saveLearningProgressToDB(
          gameName,
          earnedPoints,
          progress.correctAnswers + 1,
          progress.totalAnswers + 1,
          preferences.gameDifficulty,
          progress.currentStreak,
          activeChildProfile.id,
          caregiverProfile.id
        );
      }
    },
    [recordActivity, caregiverProfile, activeChildProfile, progress, preferences.gameDifficulty]
  );

  const recordCommunication = useCallback((sentenceText?: string) => {
    setProgress((prev) => ({
      ...prev,
      communicationUses: prev.communicationUses + 1,
    }));
    if (sentenceText) {
      setChildProfile((prev) => {
        const sentences = [sentenceText, ...prev.frequentlyUsedSentences.filter((s) => s !== sentenceText)].slice(0, 10);
        return { ...prev, frequentlyUsedSentences: sentences };
      });
    }
  }, []);

  const toggleRoutine = useCallback((dateKey: string, index: number) => {
    setRoutines((prev) => {
      const current = prev[dateKey] || [];
      const updated = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [dateKey]: updated };
    });
  }, []);

  const saveRoutines = useCallback((dateKey: string, indices: number[]) => {
    setRoutines((prev) => ({ ...prev, [dateKey]: indices }));
  }, []);

  // -------------------------------------------------------------
  // EMOTIONS ASSISTANT
  // -------------------------------------------------------------
  const recordEmotionCheckIn = useCallback(
    (checkIn: Omit<EmotionCheckInRecord, "id" | "timestamp" | "dateKey">) => {
      const record: EmotionCheckInRecord = {
        ...checkIn,
        id: `emotion_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        dateKey: getLocalDateKey(),
      };

      setEmotionHistory((prev) => [record, ...prev].slice(0, 50));
      recordActivity(`Emotion Check-in: ${checkIn.emotionLabel}`, 5);

      // Save to Supabase if authenticated
      if (caregiverProfile?.id && activeChildProfile?.id) {
        logEmotionCheckInToDB(record, activeChildProfile.id, caregiverProfile.id);
      }
    },
    [recordActivity, caregiverProfile, activeChildProfile]
  );

  // -------------------------------------------------------------
  // CUSTOM AAC CARDS & FAMILIAR PEOPLE
  // -------------------------------------------------------------
  const addCustomAACCard = useCallback(
    async (card: AACCardItem, imageBlobOrDataUrl?: string) => {
      if (imageBlobOrDataUrl) {
        await saveCustomImage(card.id, imageBlobOrDataUrl);
      }

      setCustomAACCards((prev) => [card, ...prev]);

      // Save to Supabase if authenticated
      if (caregiverProfile?.id && activeChildProfile?.id) {
        const dbId = await saveAACCardToDB(card, activeChildProfile.id, caregiverProfile.id);
        if (dbId && dbId !== card.id) {
          setCustomAACCards((prev) =>
            prev.map((c) => (c.id === card.id ? { ...c, id: dbId } : c))
          );
        }
      }

      showNotice(`Added card: "${card.text}" ♡`);
    },
    [showNotice, caregiverProfile, activeChildProfile]
  );

  const updateCustomAACCard = useCallback(
    async (card: AACCardItem, imageBlobOrDataUrl?: string) => {
      if (imageBlobOrDataUrl) {
        await saveCustomImage(card.id, imageBlobOrDataUrl);
      }
      setCustomAACCards((prev) =>
        prev.map((c) => (c.id === card.id ? card : c))
      );

      if (caregiverProfile?.id && activeChildProfile?.id) {
        await saveAACCardToDB(card, activeChildProfile.id, caregiverProfile.id);
      }

      showNotice(`Updated card: "${card.text}" ♡`);
    },
    [showNotice, caregiverProfile, activeChildProfile]
  );

  const deleteCustomAACCard = useCallback(
    async (cardId: string) => {
      await deleteCustomImage(cardId);
      setCustomAACCards((prev) => prev.filter((c) => c.id !== cardId));

      if (caregiverProfile?.id) {
        await deleteAACCardFromDB(cardId, caregiverProfile.id);
      }

      showNotice("AAC picture card removed.");
    },
    [showNotice, caregiverProfile]
  );

  const recordCardUsage = useCallback(
    (cardId: string) => {
      setCustomAACCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c
        )
      );
      setChildProfile((prev) => {
        if (!prev.favoriteCardIds.includes(cardId)) {
          return {
            ...prev,
            favoriteCardIds: [...prev.favoriteCardIds, cardId].slice(0, 15),
          };
        }
        return prev;
      });
    },
    []
  );

  // -------------------------------------------------------------
  // EMERGENCY COMMUNICATION
  // -------------------------------------------------------------
  const triggerEmergency = useCallback(
    (card: EmergencyCard) => {
      setEmergencyModalOpen(true);
      const isTelugu = preferences.ttsLanguage === "te";
      const phrase = isTelugu
        ? `అత్యవసరం: ${card.teluguTitle}! ${card.teluguDetail}`
        : `Urgent: ${card.title}! ${card.detail}`;
      speak(phrase, preferences.ttsLanguage);
    },
    [speak, preferences.ttsLanguage]
  );

  // -------------------------------------------------------------
  // VISUAL ROUTINE TIMELINE
  // -------------------------------------------------------------
  const toggleTimelineStep = useCallback((id: string) => {
    setTimelineSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  }, []);

  const addTimelineStep = useCallback((step: TimelineStepItem) => {
    setTimelineSteps((prev) => [...prev, step]);
  }, []);

  const deleteTimelineStep = useCallback((id: string) => {
    setTimelineSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderTimelineSteps = useCallback((steps: TimelineStepItem[]) => {
    setTimelineSteps(steps);
  }, []);

  // -------------------------------------------------------------
  // CHILD PROFILE UPDATE
  // -------------------------------------------------------------
  const updateChildProfile = useCallback(
    (updates: Partial<ChildProfile>) => {
      setChildProfile((prev) => {
        const next = { ...prev, ...updates };
        if (updates.name) {
          setVisitorNameState(updates.name);
          localStorage.setItem(STORAGE_KEYS.visitorName, updates.name);
        }
        return next;
      });

      if (activeChildProfile) {
        setActiveChildProfile((prev) => (prev ? { ...prev, ...updates } : null));
        setChildProfiles((prev) =>
          prev.map((c) => (c.id === activeChildProfile.id ? { ...c, ...updates } : c))
        );
        if (caregiverProfile?.id && activeChildProfile.id) {
          updateChildProfileInDB(activeChildProfile.id, updates, caregiverProfile.id);
        }
      }
    },
    [activeChildProfile, caregiverProfile]
  );

  // -------------------------------------------------------------
  // PRIVACY, DATA EXPORT & CLEAR
  // -------------------------------------------------------------
  const exportAllData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      caregiverProfile,
      activeChild: activeChildProfile || childProfile,
      childProfiles,
      preferences,
      progress,
      emotionHistory,
      customAACCards: customAACCards.map(({ imageUrl, ...rest }) => rest),
      timelineSteps,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SenseCalm_Data_${getLocalDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Your complete Sense Calm data has been exported ♡");
  }, [
    caregiverProfile,
    activeChildProfile,
    childProfile,
    childProfiles,
    preferences,
    progress,
    emotionHistory,
    customAACCards,
    timelineSteps,
    showNotice,
  ]);

  const clearAllUserData = useCallback(() => {
    localStorage.clear();
    setPreferences(defaultPreferences);
    setProgress(defaultProgress);
    setRoutines({});
    setCustomAACCards([]);
    setEmotionHistory([]);
    setTimelineSteps(initialTimelineSteps);
    setChildProfile(defaultChildProfile);
    setChildProfiles([]);
    setActiveChildProfile(null);
    setCaregiverProfile(null);
    setIsAuthenticated(false);
    setIsCaregiverAuthenticated(false);
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
        repeatSpeech,
        openSystemTtsSettings,
        voiceDiagnosticsOpen,
        setVoiceDiagnosticsOpen,
        lastVoiceError,
        ttsStatus,
        currentUtteranceText,
        isTeluguSupported: teluguAvailable,
        availableVoices: voices,
        playSound,
        showNotice,
        notice,

        // Emotion Assistant
        emotionHistory,
        recordEmotionCheckIn,

        // Custom AAC Cards & Familiar People
        customAACCards,
        addCustomAACCard,
        updateCustomAACCard,
        deleteCustomAACCard,
        recordCardUsage,

        // Emergency Communication
        emergencyModalOpen,
        setEmergencyModalOpen,
        triggerEmergency,

        // Comfort & Breathing
        breathingModalOpen,
        setBreathingModalOpen,

        // Routine Timeline
        timelineSteps,
        toggleTimelineStep,
        addTimelineStep,
        deleteTimelineStep,
        reorderTimelineSteps,

        // Caregiver Gate & Authentication
        childProfile,
        updateChildProfile,
        isCaregiverAuthenticated,
        setIsCaregiverAuthenticated,
        caregiverGateModalOpen,
        setCaregiverGateModalOpen,

        // Supabase Auth & Database
        isAuthenticated,
        authLoading,
        caregiverProfile,
        childProfiles,
        activeChildProfile,
        isSupabaseActive: isSupabaseConfigured,
        syncStatus,
        login,
        register,
        logout,
        resetPassword,
        createChildProfile,
        selectActiveChild,
        syncNow,

        // Connectivity
        isOnline,

        // Privacy & Export
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
