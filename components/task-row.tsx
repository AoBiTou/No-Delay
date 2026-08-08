"use client";

import { Check, Clock3, Pencil, Play, Trash2 } from "lucide-react";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onStart: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  showDate?: boolean;
}

export function TaskRow({ task, onToggle, onStart, onEdit, onDelete, showDate }: TaskRowProps) {
  const done = task.status === "done";
  return (
    <article className={`task-row ${done ? "done" : ""}`}>
      <button type="button" className="check-button" onClick={() => onToggle(task)} aria-label={done ? "恢复任务" : "完成任务"}>
        {done && <Check size={18} strokeWidth={3} />}
      </button>
      <div className="task-time">
        <strong>{task.startTime || "--:--"}</strong>
        <span>{showDate ? task.date.slice(5).replace("-", "/") : `${task.estimatedMinutes ?? 60} MIN`}</span>
      </div>
      <div className="task-main">
        <div className="task-title-line">
          <h3>{task.title}</h3>
          <span className={`priority priority-${task.priority}`}>{task.priority.toUpperCase()}</span>
        </div>
        {task.description && <p>{task.description}</p>}
      </div>
      <div className="task-actions">
        {!done && (
          <button type="button" className="start-task" onClick={() => onStart(task)}>
            <Play size={16} fill="currentColor" /> 开始
          </button>
        )}
        <button type="button" className="icon-button" onClick={() => onEdit(task)} aria-label="编辑任务">
          <Pencil size={16} />
        </button>
        <button type="button" className="icon-button danger" onClick={() => onDelete(task)} aria-label="删除任务">
          <Trash2 size={16} />
        </button>
      </div>
      <Clock3 className="task-watermark" aria-hidden="true" />
    </article>
  );
}
