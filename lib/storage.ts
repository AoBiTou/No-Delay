import type { ActiveFocus, FocusSession, Task, UserSettings } from "@/types";

const KEYS = {
  tasks: "no-delay:tasks:v1",
  sessions: "no-delay:sessions:v1",
  settings: "no-delay:settings:v1",
  activeFocus: "no-delay:active-focus:v1",
} as const;

export const defaultSettings: UserSettings = {
  focusDuration: 60,
  breakDuration: 20,
  soundEnabled: true,
  openingAnimationEnabled: true,
  theme: "dark",
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getTasks: () => readJson<Task[]>(KEYS.tasks, []),
  setTasks: (tasks: Task[]) => writeJson(KEYS.tasks, tasks),
  getSessions: () => readJson<FocusSession[]>(KEYS.sessions, []),
  setSessions: (sessions: FocusSession[]) => writeJson(KEYS.sessions, sessions),
  getSettings: () => ({ ...defaultSettings, ...readJson<Partial<UserSettings>>(KEYS.settings, {}) }),
  setSettings: (settings: UserSettings) => writeJson(KEYS.settings, settings),
  getActiveFocus: () => readJson<ActiveFocus | null>(KEYS.activeFocus, null),
  setActiveFocus: (focus: ActiveFocus | null) => writeJson(KEYS.activeFocus, focus),
};
