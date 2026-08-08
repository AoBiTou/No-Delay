"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toDateKey } from "@/lib/date";
import { defaultSettings, storage } from "@/lib/storage";
import type { ActiveFocus, AppView, FocusSession, Task, UserSettings } from "@/types";
import { AppNav } from "./app-nav";
import { FocusView } from "./focus-view";
import { OpeningScreen } from "./opening-screen";
import { ScheduleView } from "./schedule-view";
import { SettingsView } from "./settings-view";
import { StatsView } from "./stats-view";
import { TaskEditor } from "./task-editor";
import { TodayView } from "./today-view";

const OPENING_SESSION_KEY = "no-delay:opening-complete";

function playCompletion(enabled: boolean) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [0, 0.12].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = index ? 392 : 262;
      gain.gain.setValueAtTime(0.07, context.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + 0.22);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + 0.24);
    });
    window.setTimeout(() => void context.close(), 700);
  } catch {
    // Audio feedback is optional.
  }
}

export function NoDelayApp() {
  const [ready, setReady] = useState(false);
  const [showOpening, setShowOpening] = useState(false);
  const [view, setView] = useState<AppView>("today");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeFocus, setActiveFocus] = useState<ActiveFocus | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [scheduleFilter, setScheduleFilter] = useState<"today" | "week" | "all">("today");

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const savedSettings = storage.getSettings();
      const savedActive = storage.getActiveFocus();
      setTasks(storage.getTasks());
      setSessions(storage.getSessions());
      setSettings(savedSettings);
      setActiveFocus(savedActive);
      if (savedActive) setView("focus");
      const hasOpened = window.sessionStorage.getItem(OPENING_SESSION_KEY) === "true";
      setShowOpening(savedSettings.openingAnimationEnabled && !hasOpened && !savedActive);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => { if (ready) storage.setTasks(tasks); }, [ready, tasks]);
  useEffect(() => { if (ready) storage.setSessions(sessions); }, [ready, sessions]);
  useEffect(() => { if (ready) storage.setSettings(settings); }, [ready, settings]);
  useEffect(() => { if (ready) storage.setActiveFocus(activeFocus); }, [activeFocus, ready]);

  const updateActiveFocus = useCallback((focus: ActiveFocus) => setActiveFocus(focus), []);

  const completeFocus = useCallback((focus: ActiveFocus) => {
    setActiveFocus(focus);
    setSessions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        taskId: focus.taskId,
        taskTitle: focus.taskTitle,
        focusMinutes: focus.focusMinutes,
        breakMinutes: focus.breakMinutes,
        startedAt: focus.startedAt,
        completedAt: new Date().toISOString(),
        completed: true,
      },
    ]);
    playCompletion(settings.soundEnabled);
    if (navigator.vibrate) navigator.vibrate([90, 45, 90]);
  }, [settings.soundEnabled]);

  function finishOpening() {
    window.sessionStorage.setItem(OPENING_SESSION_KEY, "true");
    setShowOpening(false);
  }

  function saveTask(task: Task) {
    setTasks((current) => current.some((item) => item.id === task.id)
      ? current.map((item) => item.id === task.id ? task : item)
      : [...current, task]);
    setEditingTask(undefined);
  }

  function toggleTask(task: Task) {
    const done = task.status !== "done";
    setTasks((current) => current.map((item) => item.id === task.id ? {
      ...item,
      status: done ? "done" : "todo",
      completedAt: done ? new Date().toISOString() : undefined,
    } : item));
  }

  function deleteTask(task: Task) {
    if (!window.confirm(`删除“${task.title}”？此操作无法撤销。`)) return;
    setTasks((current) => current.filter((item) => item.id !== task.id));
  }

  function startFocus(task?: Task) {
    const now = new Date();
    const focusMinutes = task?.estimatedMinutes ?? settings.focusDuration;
    const active: ActiveFocus = {
      taskId: task?.id,
      taskTitle: task?.title ?? "无任务专注",
      phase: "focusing",
      focusMinutes,
      breakMinutes: settings.breakDuration,
      startedAt: now.toISOString(),
      endsAt: new Date(now.getTime() + focusMinutes * 60_000).toISOString(),
      pausedRemainingSeconds: null,
      sessionRecorded: false,
    };
    if (task) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "doing" } : item));
    }
    setActiveFocus(active);
    setView("focus");
  }

  function clearFocus() {
    setActiveFocus(null);
    setView("today");
  }

  if (!ready) return <div className="boot-screen"><span>NO DELAY®</span></div>;
  if (showOpening) return <OpeningScreen soundEnabled={settings.soundEnabled} onComplete={finishOpening} />;

  if (view === "focus" && activeFocus) {
    return (
      <FocusView
        active={activeFocus}
        tasks={tasks}
        settings={settings}
        onUpdate={updateActiveFocus}
        onFocusComplete={completeFocus}
        onClear={clearFocus}
        onStartTask={startFocus}
        onStartFree={() => startFocus()}
        onBack={() => setView("today")}
      />
    );
  }

  const todayTasks = tasks.filter((task) => task.date === toDateKey());
  return (
    <div className="app-shell" data-theme={settings.theme}>
      <AppNav active={view} onChange={setView} />
      <AnimatePresence mode="wait">
        <motion.div key={view} className="page-stage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
          {view === "today" && <TodayView tasks={todayTasks} onAdd={() => setEditingTask(null)} onReplayOpening={() => setShowOpening(true)} onToggle={toggleTask} onStart={startFocus} onEdit={setEditingTask} onDelete={deleteTask} />}
          {view === "schedule" && <ScheduleView tasks={tasks} filter={scheduleFilter} onFilterChange={setScheduleFilter} onAdd={() => setEditingTask(null)} onToggle={toggleTask} onStart={startFocus} onEdit={setEditingTask} onDelete={deleteTask} />}
          {view === "focus" && <FocusView active={null} tasks={todayTasks} settings={settings} onUpdate={updateActiveFocus} onFocusComplete={completeFocus} onClear={clearFocus} onStartTask={startFocus} onStartFree={() => startFocus()} onBack={() => setView("today")} />}
          {view === "stats" && <StatsView sessions={sessions} tasks={tasks} />}
          {view === "settings" && <SettingsView settings={settings} onChange={setSettings} onReplayOpening={() => setShowOpening(true)} />}
        </motion.div>
      </AnimatePresence>
      {editingTask !== undefined && <TaskEditor task={editingTask} onSave={saveTask} onClose={() => setEditingTask(undefined)} />}
    </div>
  );
}
