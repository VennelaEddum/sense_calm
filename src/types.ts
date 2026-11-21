export type ModuleName =
  | "home"
  | "activities"
  | "communication"
  | "emotions"
  | "learning"
  | "routine"
  | "sensory"
  | "progress"
  | "caregiver"
  | "login"
  | "register"
  | "forgot-password"
  | "child-setup";

export type TTSLanguage = "en" | "te";

export type GameDifficulty = "beginner" | "intermediate" | "advanced";

export type SensoryTheme = "default" | "sage" | "cream" | "night" | "sky";

export type AmbientSoundType = "none" | "rain" | "waves" | "forest";

export type SyncStatus = "idle" | "synced" | "syncing" | "offline" | "error";

export interface Preferences {
  reducedMotion: boolean;
  muted: boolean; // Silent Mode: true = silent, false = audio enabled
  silentMode: boolean; // Explicit mirror for clarity
  simplified: boolean;
  speechEnabled: boolean;
  quietMode: boolean;
  ttsLanguage: TTSLanguage;
  ttsVoiceURI: string;
  ttsRate: number;
  ttsPitch: number;
  sensoryTheme: SensoryTheme;
  brightnessOverlay: "normal" | "soft" | "dim";
  highContrast: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  gameDifficulty: GameDifficulty;
}

export interface ActivityRecord {
  label: string;
  date: string;
}

export interface Progress {
  completedActivities: number;
  correctAnswers: number;
  totalAnswers: number;
  communicationUses: number;
  lastActiveDate: string;
  activityHistory: ActivityRecord[];
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  totalGamesCompleted: number;
  activeDates: string[]; // Set of YYYY-MM-DD strings for calendar
  unlockedBadges: string[];
}

export type RoutineMap = Record<string, number[]>;

export interface LearningQuestion {
  prompt: string;
  choices: string[];
  answer: number;
}

export interface AACToken {
  id: string;
  emoji: string;
  text: string;
  teluguText?: string;
  category?: string;
  imageUrl?: string;
}

export interface AACCardItem {
  id: string;
  emoji: string;
  text: string;
  teluguText: string;
  category: "needs" | "feelings" | "actions" | "food" | "people" | "family" | "school" | "places" | "emergency";
  color: string;
  bgColor: string;
  borderColor: string;
  isCustom?: boolean;
  imageUrl?: string;
  familiarRole?: string; // e.g. "Mother", "Father", "Teacher", "Friend"
  usageCount?: number;
  childId?: string;
  caregiverId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  teluguTitle?: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  requiredDays?: number;
  requirementText: string;
}

export type TTSStatus = "idle" | "playing" | "paused" | "stopped";

// ==========================================
// PART 1: EMOTION ASSISTANT INTERFACES
// ==========================================
export type EmotionIntensity = "low" | "medium" | "high";

export interface EmotionDefinition {
  id: string;
  name: string;
  teluguName: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  explanation: string;
  teluguExplanation: string;
  supportiveSuggestions: string[];
  teluguSuggestions: string[];
}

export interface EmotionTrigger {
  id: string;
  label: string;
  teluguLabel: string;
  emoji: string;
}

export interface EmotionSupportAction {
  id: string;
  label: string;
  teluguLabel: string;
  emoji: string;
  targetAction?: "break" | "talk" | "help" | "breathing";
}

export interface EmotionCheckInRecord {
  id: string;
  emotionId: string;
  emotionLabel: string;
  intensity: EmotionIntensity;
  reasonId: string;
  reasonLabel: string;
  actionId: string;
  actionLabel: string;
  timestamp: string;
  dateKey: string;
  childId?: string;
  notes?: string;
}

// ==========================================
// PART 3 & 8: CHILD & CAREGIVER PROFILE
// ==========================================
export interface CaregiverProfile {
  id: string;
  fullName: string;
  email: string;
  role: "caregiver" | "teacher" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary?: boolean;
}

export interface ChildProfile {
  id?: string;
  caregiverId?: string;
  name: string;
  age?: number;
  gender?: string;
  preferredLanguage: TTSLanguage;
  preferredVoiceURI: string;
  preferredCommMode?: "aac" | "speech" | "mixed" | "gestures";
  sensorySensitivities?: string[];
  favoriteCalmingTools?: string[];
  avatarEmoji?: string;
  favoriteCardIds: string[];
  favoriteActivities: string[];
  frequentlyUsedSentences: string[];
  caregiverPIN: string; // Optional 4-digit PIN for sensitive settings
  notes: string;
  emergencyContacts?: EmergencyContact[];
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// DATABASE SCHEMA TYPES (SUPABASE TABLES)
// ==========================================
export interface DBCaregiverProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface DBChildProfile {
  id: string;
  caregiver_id: string;
  name: string;
  age: number | null;
  gender: string | null;
  preferred_comm_mode: string;
  sensory_sensitivities: string[] | null;
  favorite_calming_tools: string[] | null;
  avatar_emoji: string;
  caregiver_pin: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBAACCard {
  id: string;
  child_id: string;
  caregiver_id: string;
  label: string;
  telugu_label: string;
  emoji: string | null;
  image_url: string | null;
  category: string;
  is_familiar_person: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface DBEmotionLog {
  id: string;
  child_id: string;
  caregiver_id: string;
  emotion_id: string;
  intensity: string;
  trigger_id: string | null;
  notes: string | null;
  consent_given: boolean;
  created_at: string;
}

export interface DBRoutine {
  id: string;
  child_id: string;
  caregiver_id: string;
  title: string;
  telugu_title: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBRoutineStep {
  id: string;
  routine_id: string;
  child_id: string;
  step_number: number;
  title: string;
  telugu_title: string;
  instruction: string | null;
  time_hint: string | null;
  emoji: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBLearningProgress {
  id: string;
  child_id: string;
  caregiver_id: string;
  game_name: string;
  points: number;
  correct_answers: number;
  total_answers: number;
  difficulty: string;
  streak: number;
  completed_at: string;
}

export interface DBSensoryPreferences {
  id: string;
  child_id: string;
  caregiver_id: string;
  sensory_theme: string;
  brightness_overlay: string;
  reduced_motion: boolean;
  quiet_mode: boolean;
  speech_enabled: boolean;
  tts_language: string;
  tts_rate: number;
  tts_voice_uri: string | null;
  ambient_sound: string;
  ambient_volume: number;
  silent_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBEmergencyContact {
  id: string;
  child_id: string;
  caregiver_id: string;
  name: string;
  relation: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// PART 5: EMERGENCY COMMUNICATION
// ==========================================
export interface EmergencyCard {
  id: string;
  title: string;
  teluguTitle: string;
  detail: string;
  teluguDetail: string;
  emoji: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

// ==========================================
// PART 6: VISUAL DAILY ROUTINE TIMELINE
// ==========================================
export interface TimelineStepItem {
  id: string;
  stepNumber: number;
  title: string;
  teluguTitle: string;
  timeHint: string;
  emoji: string;
  instruction: string;
  teluguInstruction: string;
  completed: boolean;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

// ==========================================
// PART 7 & 9: GAME LEARNING INTERFACES
// ==========================================
export interface DetectiveClue {
  id: string;
  clue: string;
  teluguClue: string;
  clueEmoji: string;
  level: "easy" | "medium" | "explorer";
  options: {
    id: string;
    label: string;
    teluguLabel: string;
    emoji: string;
    isCorrect: boolean;
    hint?: string;
  }[];
}

export interface EmotionItem {
  id: string;
  emotion: string;
  teluguEmotion: string;
  emoji: string;
  color: string;
  bgColor: string;
  scenario: string;
  teluguScenario: string;
  options: {
    emotion: string;
    emoji: string;
    isCorrect: boolean;
  }[];
}

export interface SentencePuzzle {
  id: string;
  targetSentence: string;
  teluguSentence: string;
  hintEmoji: string;
  difficulty?: GameDifficulty;
  tokens: {
    id: string;
    text: string;
    teluguText: string;
    emoji: string;
    order: number;
  }[];
}

export interface SequenceStep {
  stepNumber: number;
  label: string;
  teluguLabel: string;
  emoji: string;
}

export interface NextStepOption {
  id: string;
  label: string;
  teluguLabel: string;
  emoji: string;
  isCorrect: boolean;
}

export interface SequenceStory {
  id: string;
  title: string;
  teluguTitle: string;
  difficulty?: GameDifficulty;
  steps: SequenceStep[];
  options: NextStepOption[];
}

export interface EverydaySituation {
  id: string;
  situation: string;
  teluguSituation: string;
  contextEmoji: string;
  difficulty?: GameDifficulty;
  options: {
    id: string;
    response: string;
    teluguResponse: string;
    emoji: string;
    isBest: boolean;
    feedback: string;
  }[];
}

// ==========================================
// PART 10: COMMUNICATION INSIGHTS
// ==========================================
export interface CommunicationInsightsData {
  topCards: { id: string; text: string; emoji: string; count: number }[];
  emotionCounts: Record<string, number>;
  routinesCompletedCount: number;
  totalSentencesSpoken: number;
  weeklyActivityTrend: { day: string; count: number }[];
}
