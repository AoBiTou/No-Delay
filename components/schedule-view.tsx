"use client";

import { Plus } from "lucide-react";
import { endOfWeek, formatDateLabel, startOfWeek, toDateKey } from "@/lib/date";
import type { Task } from "@/types";
import { TaskRow } from "./task-row";

type Filter = "today" | "week" | "all";

interface ScheduleViewProps {
  tasks: Task[];
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  onAdd: () => void;
  onToggle: (task: Task) => void;
  onStart: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function ScheduleView({ tasks, filter, onFilterChange, onAdd, onToggle, onStart, onEdit, onDelete }: ScheduleViewProps) {
  const today = toDateKey();
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  const filtered = tasks.filter((task) => {
    if (filter === "today") return task.date === today;
    if (filter === "week") {
      const date = new Date(`${task.date}T00:00:00`);
      return date >= weekStart && date <= weekEnd;
    }
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));

  const groups = filtered.reduce<Record<string, Task[]>>((result, task) => {
    result[task.date] = [...(result[task.date] ?? []), task];
    return result;
  }, {});

  return (
    <div className="view schedule-view">
      <header className="view-header stacked-mobile">
        <div><span className="eyebrow">SCHEDULE / 排程</span><h1>只看眼前。</h1></div>
        <button type="button" className="outline-action" onClick={onAdd}><Plus size={18} /> 新建任务</button>
      </header>
      <div className="filter-bar" role="tablist" aria-label="日程范围">
        {(["today", "week", "all"] as Filter[]).map((value) => (
          <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? "active" : ""} onClick={() => onFilterChange(value)}>
            {{ today: "今日", week: "本周", all: "全部" }[value]}
          </button>
        ))}
        <span>{filtered.length} TASKS</span>
      </div>
      {Object.keys(groups).length ? (
        <div className="schedule-groups">
          {Object.entries(groups).map(([date, dayTasks]) => (
            <section key={date} className="schedule-day">
              <header><strong>{date === today ? "今天" : formatDateLabel(date)}</strong><span>{date}</span></header>
              <div className="task-list">
                {dayTasks.map((task) => <TaskRow key={task.id} task={task} showDate={filter === "all"} onToggle={onToggle} onStart={onStart} onEdit={onEdit} onDelete={onDelete} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <button className="empty-state schedule-empty" type="button" onClick={onAdd}>
          <Plus size={32} /><strong>这段时间没有任务。</strong><span>加一件，然后开始。</span>
        </button>
      )}
    </div>
  );
}
