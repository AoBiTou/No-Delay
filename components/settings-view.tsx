"use client";

import type { UserSettings } from "@/types";

interface SettingsViewProps {
  settings: UserSettings;
  onChange: (settings: UserSettings) => void;
  onReplayOpening: () => void;
}

const presets = [[25, 5], [45, 10], [60, 20], [90, 30]] as const;

export function SettingsView({ settings, onChange, onReplayOpening }: SettingsViewProps) {
  function update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="view settings-view">
      <header className="view-header"><div><span className="eyebrow">CONTROL / 设置</span><h1>规则先定好。<br />开始时别再选。</h1></div></header>
      <section className="settings-section">
        <header><span>01</span><div><h2>专注节奏</h2><p>选择常用节奏，或输入自己的分钟数。</p></div></header>
        <div className="preset-grid">
          {presets.map(([focus, rest]) => (
            <button key={focus} type="button" className={settings.focusDuration === focus && settings.breakDuration === rest ? "active" : ""} onClick={() => onChange({ ...settings, focusDuration: focus, breakDuration: rest })}>
              <strong>{focus}<small> / {rest}</small></strong><span>FOCUS / BREAK</span>
            </button>
          ))}
        </div>
        <div className="custom-times">
          <label><span>专注分钟</span><input type="number" min="1" max="600" value={settings.focusDuration} onChange={(event) => update("focusDuration", Math.max(1, Number(event.target.value)))} /></label>
          <label><span>休息分钟</span><input type="number" min="1" max="180" value={settings.breakDuration} onChange={(event) => update("breakDuration", Math.max(1, Number(event.target.value)))} /></label>
        </div>
      </section>
      <section className="settings-section">
        <header><span>02</span><div><h2>启动反馈</h2><p>减少花哨选项，只保留有冲击感的反馈。</p></div></header>
        <div className="toggle-list">
          <label><div><strong>声音反馈</strong><span>点击砖块和计时结束时播放短促提示</span></div><input type="checkbox" checked={settings.soundEnabled} onChange={(event) => update("soundEnabled", event.target.checked)} /></label>
          <label><div><strong>开屏启动仪式</strong><span>每个新浏览会话先完成十次劈砖</span></div><input type="checkbox" checked={settings.openingAnimationEnabled} onChange={(event) => update("openingAnimationEnabled", event.target.checked)} /></label>
        </div>
        <button type="button" className="outline-action replay-button" onClick={onReplayOpening}>现在重播启动仪式</button>
      </section>
      <p className="settings-footnote">数据只保存在当前浏览器中。第一版不需要账号，也不会上传你的任务。</p>
    </div>
  );
}
