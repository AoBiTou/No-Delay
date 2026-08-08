"use client";

import { formatDateLabel, toDateKey } from "@/lib/date";
import type { FocusSession, Task } from "@/types";

interface StatsViewProps {
  sessions: FocusSession[];
  tasks: Task[];
}

export function StatsView({ sessions, tasks }: StatsViewProps) {
  const today = toDateKey();
  const todaySessions = sessions.filter((session) => toDateKey(new Date(session.completedAt)) === today);
  const todayTasks = tasks.filter((task) => task.date === today);
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.focusMinutes, 0);
  const completedTasks = todayTasks.filter((task) => task.status === "done").length;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.focusMinutes, 0);
  const recent = [...sessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 10);

  return (
    <div className="view stats-view">
      <header className="view-header"><div><span className="eyebrow">PROOF / 记录</span><h1>不是计划。<br />是已经做了。</h1></div></header>
      <section className="stat-grid">
        <article className="stat-main"><span>TODAY FOCUS</span><strong>{todayMinutes}</strong><small>MINUTES</small></article>
        <article><span>SESSIONS</span><strong>{todaySessions.length}</strong><small>ROUNDS</small></article>
        <article><span>TASKS</span><strong>{completedTasks}/{todayTasks.length}</strong><small>DONE</small></article>
        <article><span>ALL TIME</span><strong>{Math.floor(totalMinutes / 60)}<em>H</em> {totalMinutes % 60}<em>M</em></strong><small>FOCUSED</small></article>
      </section>
      <section className="history-section">
        <div className="section-heading"><div><span className="eyebrow">FOCUS LOG</span><h2>最近完成</h2></div></div>
        {recent.length ? (
          <div className="history-list">
            {recent.map((session, index) => (
              <article key={session.id}>
                <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{session.taskTitle}</strong><small>{formatDateLabel(toDateKey(new Date(session.completedAt)))} · {new Date(session.completedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</small></div>
                <b>{session.focusMinutes}<small> MIN</small></b>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-log"><strong>还没有完成记录。</strong><span>计时归零以后，证据会出现在这里。</span></div>
        )}
      </section>
    </div>
  );
}
