export type ModuleName =
  | "home"
  | "activities"
  | "communication"
  | "learning"
  | "routine"
  | "sensory"
  | "progress";

export type TTSLanguage = "en" | "te";

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
}

export interface AACCardItem {
  id: string;
  emoji: string;
  text: string;
  teluguText: string;
  category: "needs" | "feelings" | "actions" | "food" | "people" | "places";
  color: string;
  bgColor: string;
  borderColor: string;
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

// Game 1: Picture Detective
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

// Game 2: Emotion Explorer
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

// Game 3: Build the Sentence
export interface SentencePuzzle {
  id: string;
  targetSentence: string;
  teluguSentence: string;
  hintEmoji: string;
  tokens: {
    id: string;
    text: string;
    teluguText: string;
    emoji: string;
    order: number;
  }[];
}

// Game 4: What Happens Next?
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
  steps: SequenceStep[];
  options: NextStepOption[];
}

// Game 5: Everyday Situation Challenge
export interface EverydaySituation {
  id: string;
  situation: string;
  teluguSituation: string;
  contextEmoji: string;
  situationImage?: string;
  options: {
    id: string;
    response: string;
    teluguResponse: string;
    emoji: string;
    isBest: boolean;
    feedback: string;
  }[];
}

