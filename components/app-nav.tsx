"use client";

import { BarChart3, CalendarDays, Crosshair, ListTodo, Settings } from "lucide-react";
import type { AppView } from "@/types";

interface AppNavProps {
  active: AppView;
  onChange: (view: AppView) => void;
}

const items: Array<{ view: AppView; label: string; icon: typeof ListTodo }> = [
  { view: "today", label: "今日", icon: ListTodo },
  { view: "schedule", label: "日程", icon: CalendarDays },
  { view: "focus", label: "专注", icon: Crosshair },
  { view: "stats", label: "记录", icon: BarChart3 },
  { view: "settings", label: "设置", icon: Settings },
];

export function AppNav({ active, onChange }: AppNavProps) {
  return (
    <>
      <aside className="side-nav">
        <button className="brand" type="button" onClick={() => onChange("today")} aria-label="返回今日">
          <span>绝不</span><span>拖延</span>
        </button>
        <nav aria-label="主导航">
          {items.map(({ view, label, icon: Icon }, index) => (
            <button key={view} type="button" className={active === view ? "active" : ""} onClick={() => onChange(view)}>
              <span className="nav-index">0{index + 1}</span>
              <Icon size={18} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-mantra">少想<br />多做</div>
      </aside>
      <nav className="mobile-nav" aria-label="移动端主导航">
        {items.map(({ view, label, icon: Icon }) => (
          <button key={view} type="button" className={active === view ? "active" : ""} onClick={() => onChange(view)}>
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
