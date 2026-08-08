"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { toDateKey } from "@/lib/date";
import type { Priority, Task } from "@/types";

const DURATION_PRESETS = [25, 45, 60, 90] as const;

interface TaskEditorProps {
  task?: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export function TaskEditor({ task, onSave, onClose }: TaskEditorProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [date, setDate] = useState(task?.date ?? toDateKey());
  const [startTime, setStartTime] = useState(task?.startTime ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(task?.estimatedMinutes ?? 60));
  const [customDuration, setCustomDuration] = useState(
    () => !DURATION_PRESETS.includes((task?.estimatedMinutes ?? 60) as (typeof DURATION_PRESETS)[number]),
  );
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: task?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      estimatedMinutes: Math.max(1, Number(estimatedMinutes) || 60),
      priority,
      status: task?.status ?? "todo",
      createdAt: task?.createdAt ?? now,
      completedAt: task?.completedAt,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="task-editor" role="dialog" aria-modal="true" aria-labelledby="task-editor-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow">TASK INPUT</span>
            <h2 id="task-editor-title">{task ? "改这件事" : "今天要干什么？"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </header>

        <form onSubmit={submit}>
          <label className="field field-wide">
            <span>任务名称</span>
            <input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="只写下一步动作" />
          </label>
          <label className="field field-wide">
            <span>备注（可选）</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="需要记住的限制或交付标准" />
          </label>
          <label className="field">
            <span>日期</span>
            <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field">
            <span>开始时间</span>
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </label>
          <fieldset className="field field-wide duration-field">
            <legend>专注时长</legend>
            <div className="duration-options">
              {DURATION_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={!customDuration && Number(estimatedMinutes) === minutes ? "active" : ""}
                  onClick={() => {
                    setEstimatedMinutes(String(minutes));
                    setCustomDuration(false);
                  }}
                >
                  {minutes} MIN
                </button>
              ))}
              <button type="button" className={customDuration ? "active" : ""} onClick={() => setCustomDuration(true)}>
                自定义
              </button>
            </div>
            {customDuration && (
              <label className="custom-duration-input">
                <span>输入分钟数</span>
                <input type="number" min="1" max="600" required value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} />
              </label>
            )}
          </fieldset>
          <fieldset className="field priority-field">
            <legend>优先级</legend>
            <div className="segmented">
              {(["low", "medium", "high"] as Priority[]).map((value) => (
                <button key={value} type="button" className={priority === value ? "active" : ""} onClick={() => setPriority(value)}>
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="primary-action field-wide" type="submit">
            {task ? "保存修改" : "加入今天"}<span>↗</span>
          </button>
        </form>
      </section>
    </div>
  );
}
