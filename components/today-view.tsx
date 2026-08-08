"use client";

import { ArrowUpRight, Plus, RotateCcw } from "lucide-react";
import { formatDay } from "@/lib/date";
import type { Task } from "@/types";
import { TaskRow } from "./task-row";

interface TodayViewProps {
  tasks: Task[];
  onAdd: () => void;
  onReplayOpening: () => void;
  onToggle: (task: Task) => void;
  onStart: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TodayView({ tasks, onAdd, onReplayOpening, onToggle, onStart, onEdit, onDelete }: TodayViewProps) {
  const date = formatDay();
  const sorted = [...tasks].sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
  const unfinished = sorted.filter((task) => task.status !== "done");
  const recommended = [...unfinished].sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority] || (a.startTime || "99:99").localeCompare(b.startTime || "99:99");
  })[0];
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const plannedMinutes = tasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 60), 0);
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="view today-view">
      <header className="view-header">
        <div className="date-lockup">
          <strong>{date.day}</strong>
          <div><span>{date.month}</span><span>{date.weekday}</span></div>
        </div>
        <div className="header-actions">
          <button type="button" className="replay-ritual" onClick={onReplayOpening}><RotateCcw size={15} /> 再劈十块砖</button>
          <button type="button" className="outline-action" onClick={onAdd}><Plus size={18} /> 新建任务</button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="today-copy">
          <span className="eyebrow">TODAY / 现在</span>
          <h1>今天必须<br />完成什么？</h1>
          <p>{unfinished.length ? `还有 ${unfinished.length} 件。别管明天。` : "清单空了。给今天一个明确的起点。"}</p>
        </div>

        <aside className="next-action-panel">
          <span className="eyebrow">下一步 / AUTO PICK</span>
          {recommended ? (
            <>
              <div className="next-number">{plannedMinutes}</div>
              <span className="next-unit">MINUTES PLANNED</span>
              <h2>{recommended.title}</h2>
              <button type="button" className="primary-action" onClick={() => onStart(recommended)}>
                别选了，开始 <ArrowUpRight size={22} />
              </button>
            </>
          ) : (
            <>
              <div className="next-number">{plannedMinutes}</div>
              <span className="next-unit">MINUTES PLANNED</span>
              <h2>{tasks.length ? "今天，干净了。" : "先写下一件事。"}</h2>
              <button type="button" className="primary-action" onClick={onAdd}>加入任务 <Plus size={22} /></button>
            </>
          )}
        </aside>
      </section>

      <section className="task-section">
        <div className="section-heading">
          <div><span className="eyebrow">今日清单</span><h2>{String(tasks.length).padStart(2, "0")} 件事</h2></div>
          <div className="mini-stats">
            <span><b>{plannedMinutes}</b> 计划分钟</span>
            <span><b>{doneCount}/{tasks.length}</b> 已完成</span>
          </div>
        </div>
        {sorted.length ? (
          <div className="task-list">
            {sorted.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} onStart={onStart} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        ) : (
          <button type="button" className="empty-state" onClick={onAdd}>
            <Plus size={32} />
            <strong>别在脑子里排队。</strong>
            <span>把第一件事写下来。</span>
          </button>
        )}
        <div className="progress-strip" aria-label={`今日完成度 ${progress}%`}><i style={{ width: `${progress}%` }} /></div>
      </section>
    </div>
  );
}
