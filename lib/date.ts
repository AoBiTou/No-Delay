export function toDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDay(date = new Date()): { day: string; month: string; weekday: string } {
  const day = new Intl.DateTimeFormat("zh-CN", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date).toUpperCase();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date).toUpperCase();
  return { day, month, weekday };
}

export function startOfWeek(date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfWeek(date = new Date()): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(date);
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
