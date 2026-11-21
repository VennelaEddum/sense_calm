export type ModuleName =
  | "home"
  | "activities"
  | "communication"
  | "emotions"
  | "learning"
  | "routine"
  | "sensory"
  | "progress"
  | "caregiver";

export type TTSLanguage = "en" | "te";

export type GameDifficulty = "beginner" | "intermediate" | "advanced";

export type SensoryTheme = "default" | "sage" | "cream" | "night" | "sky";

export type AmbientSoundType = "none" | "rain" | "waves" | "forest";

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

// ==========================================
// PART 1: EMOTION ASSISTANT TYPES
// ==========================================
export type EmotionIntensity = "little" | "medium" | "much";

export interface EmotionDefinition {
  id: string;
  label: string;
  teluguLabel: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  explanation: string;
  teluguExplanation: string;
  suggestions: {
    en: string;
    te: string;
    icon: string;
  }[];
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
}

// ==========================================
// PART 3 & 8: CHILD PROFILE & CAREGIVER
// ==========================================
export interface ChildProfile {
  name: string;
  preferredLanguage: TTSLanguage;
  preferredVoiceURI: string;
  favoriteCardIds: string[];
  favoriteActivities: string[];
  frequentlyUsedSentences: string[];
  caregiverPIN: string; // Optional 4-digit PIN for sensitive settings
  notes: string;
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
  title: string;
  teluguTitle: string;
  timeEstimate: string;
  emoji: string;
  category: "morning" | "school" | "afternoon" | "evening" | "night";
  isCompleted: boolean;
  reminderNote?: string;
}

// ==========================================
// GAMES WITH 3 DIFFICULTY LEVELS
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
