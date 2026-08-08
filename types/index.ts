export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  estimatedMinutes?: number;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  focusMinutes: number;
  breakMinutes: number;
  startedAt: string;
  completedAt: string;
  completed: boolean;
}

export interface UserSettings {
  focusDuration: number;
  breakDuration: number;
  soundEnabled: boolean;
  openingAnimationEnabled: boolean;
  theme: "dark" | "light";
}

export type FocusPhase =
  | "focusing"
  | "paused"
  | "focusComplete"
  | "breaking"
  | "breakPaused"
  | "breakComplete";

export interface ActiveFocus {
  taskId?: string;
  taskTitle: string;
  phase: FocusPhase;
  focusMinutes: number;
  breakMinutes: number;
  startedAt: string;
  endsAt: string | null;
  pausedRemainingSeconds: number | null;
  sessionRecorded: boolean;
}

export type AppView = "today" | "schedule" | "focus" | "stats" | "settings";
