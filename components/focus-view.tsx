"use client";

import { ArrowLeft, Pause, Play, RotateCcw, Square, TimerReset } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatClock } from "@/lib/date";
import type { ActiveFocus, Task, UserSettings } from "@/types";

interface FocusViewProps {
  active: ActiveFocus | null;
  tasks: Task[];
  settings: UserSettings;
  onUpdate: (focus: ActiveFocus) => void;
  onFocusComplete: (focus: ActiveFocus) => void;
  onClear: () => void;
  onStartTask: (task: Task) => void;
  onStartFree: () => void;
  onBack: () => void;
}

export function FocusView({ active, tasks, settings, onUpdate, onFocusComplete, onClear, onStartTask, onStartFree, onBack }: FocusViewProps) {
  const [now, setNow] = useState(0);
  const handledCompletion = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const running = active?.phase === "focusing" || active?.phase === "breaking";
  const remaining = useMemo(() => {
    if (!active) return 0;
    if (running && active.endsAt) return Math.max(0, (new Date(active.endsAt).getTime() - now) / 1000);
    return active.pausedRemainingSeconds ?? 0;
  }, [active, now, running]);

  useEffect(() => {
    if (!active || !running || remaining > 0 || !active.endsAt) return;
    const key = `${active.phase}:${active.endsAt}`;
    if (handledCompletion.current === key) return;
    handledCompletion.current = key;

    if (active.phase === "focusing") {
      onFocusComplete({ ...active, phase: "focusComplete", endsAt: null, pausedRemainingSeconds: 0, sessionRecorded: true });
    } else {
      onUpdate({ ...active, phase: "breakComplete", endsAt: null, pausedRemainingSeconds: 0 });
    }
  }, [active, onFocusComplete, onUpdate, remaining, running]);

  if (!active) {
    const openTasks = tasks.filter((task) => task.status !== "done").slice(0, 4);
    return (
      <div className="view focus-picker">
        <button className="text-action" type="button" onClick={onBack}><ArrowLeft size={17} /> 返回今日</button>
        <div className="focus-picker-copy">
          <span className="eyebrow">FOCUS / 专注</span>
          <h1>把其他事情<br />赶出去。</h1>
          <p>默认 {settings.focusDuration} 分钟。开始后，只留一件事。</p>
        </div>
        <button type="button" className="primary-action free-focus" onClick={onStartFree}>
          无任务专注 {settings.focusDuration} MIN <Play size={19} fill="currentColor" />
        </button>
        {openTasks.length > 0 && (
          <section className="focus-task-picks">
            <span className="eyebrow">选择一件</span>
            {openTasks.map((task, index) => (
              <button key={task.id} type="button" onClick={() => onStartTask(task)}>
                <span>0{index + 1}</span><strong>{task.title}</strong><small>{task.estimatedMinutes ?? settings.focusDuration} MIN</small><Play size={17} />
              </button>
            ))}
          </section>
        )}
      </div>
    );
  }

  const focus = active;
  const isBreak = focus.phase === "breaking" || focus.phase === "breakPaused" || focus.phase === "breakComplete";
  const isPaused = focus.phase === "paused" || focus.phase === "breakPaused";
  const isComplete = focus.phase === "focusComplete" || focus.phase === "breakComplete";
  const totalSeconds = (isBreak ? focus.breakMinutes : focus.focusMinutes) * 60;
  const progress = isComplete ? 1 : Math.min(1, Math.max(0, (totalSeconds - remaining) / totalSeconds));

  function pause() {
    if (!running) return;
    onUpdate({
      ...focus,
      phase: focus.phase === "breaking" ? "breakPaused" : "paused",
      endsAt: null,
      pausedRemainingSeconds: Math.ceil(remaining),
    });
  }

  function resume() {
    if (!isPaused) return;
    onUpdate({
      ...focus,
      phase: focus.phase === "breakPaused" ? "breaking" : "focusing",
      endsAt: new Date(Date.now() + remaining * 1000).toISOString(),
      pausedRemainingSeconds: null,
    });
  }

  function startBreak() {
    handledCompletion.current = null;
    onUpdate({
      ...focus,
      phase: "breaking",
      endsAt: new Date(Date.now() + focus.breakMinutes * 60_000).toISOString(),
      pausedRemainingSeconds: null,
    });
  }

  function restartFocus() {
    handledCompletion.current = null;
    onUpdate({
      ...focus,
      phase: "focusing",
      startedAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + focus.focusMinutes * 60_000).toISOString(),
      pausedRemainingSeconds: null,
      sessionRecorded: false,
    });
  }

  function abandon() {
    const message = focus.phase === "focusComplete" || focus.phase === "breakComplete" ? "结束这一轮并返回今日？" : "确定放弃当前计时？这次不会计入完成记录。";
    if (window.confirm(message)) onClear();
  }

  return (
    <div className={`focus-room ${isBreak ? "break-room" : ""} ${isComplete ? "complete-room" : ""}`}>
      <div className="noise" />
      <header>
        <button type="button" className="focus-brand" onClick={abandon}>NO DELAY®</button>
        <span>{isBreak ? "REST PROTOCOL" : "FOCUS PROTOCOL"} / {isBreak ? "02" : "01"}</span>
      </header>

      <div className="focus-status">
        <span>{isComplete ? "COMPLETE" : isPaused ? "PAUSED" : isBreak ? "BREAK" : "FOCUS"}</span>
        <i />
        <span>{isComplete ? "搞定一轮" : "DO NOT DISTURB"}</span>
      </div>

      <main>
        <p className="focus-task-title">{isBreak ? "休息。别偷看任务。" : focus.taskTitle}</p>
        <div className="timer-wrap" style={{ "--progress": `${progress * 360}deg` } as React.CSSProperties}>
          <div className="timer-ring" />
          <div className="timer-value">{formatClock(remaining)}</div>
          <span>{isComplete ? "结束" : isBreak ? "休息中" : "只做这一件"}</span>
        </div>

        {focus.phase === "focusComplete" ? (
          <div className="completion-actions">
            <p>你已经专注 {focus.focusMinutes} 分钟。</p>
            <button type="button" className="focus-primary" onClick={startBreak}>休息 {focus.breakMinutes} MIN <TimerReset size={20} /></button>
            <button type="button" className="focus-secondary" onClick={restartFocus}>再来一轮 <RotateCcw size={17} /></button>
          </div>
        ) : focus.phase === "breakComplete" ? (
          <div className="completion-actions">
            <p>休息结束。下一件事。</p>
            <button type="button" className="focus-primary" onClick={onClear}>回到今日 <ArrowLeft size={20} /></button>
            <button type="button" className="focus-secondary" onClick={restartFocus}>继续这件 <RotateCcw size={17} /></button>
          </div>
        ) : (
          <div className="timer-actions">
            <button type="button" onClick={isPaused ? resume : pause}>
              {isPaused ? <Play size={19} fill="currentColor" /> : <Pause size={19} fill="currentColor" />}
              {isPaused ? "继续干" : "暂停"}
            </button>
            <button type="button" onClick={abandon}><Square size={17} fill="currentColor" /> 放弃</button>
          </div>
        )}
      </main>

      <footer><span>开始于 {new Date(focus.startedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span><span>少想，多做。</span></footer>
    </div>
  );
}
