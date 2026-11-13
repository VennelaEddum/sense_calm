export type ModuleName =
  | "home"
  | "activities"
  | "communication"
  | "learning"
  | "routine"
  | "sensory"
  | "progress";

export interface Preferences {
  reducedMotion: boolean;
  muted: boolean;
  simplified: boolean;
  speechEnabled: boolean;
  quietMode: boolean;
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
}

export type RoutineMap = Record<string, number[]>;

export interface LearningQuestion {
  prompt: string;
  choices: string[];
  answer: number;
}
