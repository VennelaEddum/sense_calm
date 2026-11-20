export type ModuleName =
  | "home"
  | "activities"
  | "communication"
  | "learning"
  | "routine"
  | "games"
  | "sensory"
  | "progress";

export interface Preferences {
  reducedMotion: boolean;
  muted: boolean;
  simplified: boolean;
  speechEnabled: boolean;
  quietMode: boolean;
  silentMode: boolean;
}

export interface ActivityRecord {
  label: string;
  date: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activeDays: string[];
}

export interface Progress {
  completedActivities: number;
  correctAnswers: number;
  totalAnswers: number;
  communicationUses: number;
  lastActiveDate: string;
  activityHistory: ActivityRecord[];
  gamesCompleted: number;
  totalPoints: number;
  streak: StreakData;
  badges: string[];
}

export type RoutineMap = Record<string, number[]>;

export interface LearningQuestion {
  prompt: string;
  choices: string[];
  answer: number;
}

export interface SpeechState {
  speaking: boolean;
  paused: boolean;
}

export type GameId =
  | "picture-detective"
  | "emotion-explorer"
  | "build-sentence"
  | "what-happens-next"
  | "everyday-challenge";
