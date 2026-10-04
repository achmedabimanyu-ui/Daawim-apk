import type { Habit } from './defaults';
import { addDays, fromKey, todayKey } from './date';
import type { Logs, Period, State } from '@/store/app';

export const inPeriod = (periods: Period[], date: string) =>
  periods.some((p) => date >= p.start && date <= (p.end ?? todayKey()));

export function scheduled(s: Pick<State, 'habits' | 'periods' | 'settings'>, date: string): Habit[] {
  const dow = fromKey(date).getDay();
  const udzur = s.settings.gender === 'muslimah' && inPeriod(s.periods, date);
  return s.habits.filter(
    (h) => h.active && h.days.includes(dow) && !(udzur && (h.prayer || ['tahajjud', 'dhuha', 'witir', 'puasa'].includes(h.builtin ?? ''))),
  );
}

export const progressOf = (h: Habit, logs: Logs, date: string) => {
  const v = logs[date]?.[h.id]?.value ?? 0;
  return Math.min(1, v / Math.max(1, h.target));
};

export const isDone = (h: Habit, logs: Logs, date: string) => progressOf(h, logs, date) >= 1;

export function dayRate(s: Pick<State, 'habits' | 'periods' | 'settings' | 'logs'>, date: string) {
  const list = scheduled(s, date);
  if (!list.length) return { done: 0, total: 0, rate: 0 };
  const done = list.filter((h) => isDone(h, s.logs, date)).length;
  return { done, total: list.length, rate: done / list.length };
}

export type DayStatus = 'goal' | 'udzur' | 'partial' | 'none' | 'future';

export function dayStatus(s: Pick<State, 'habits' | 'periods' | 'settings' | 'logs'>, date: string): DayStatus {
  if (date > todayKey()) return 'future';
  const { rate, total, done } = dayRate(s, date);
  if (total > 0 && rate >= s.settings.dailyGoal) return 'goal';
  if (s.settings.gender === 'muslimah' && inPeriod(s.periods, date)) return 'udzur';
  return done > 0 ? 'partial' : 'none';
}

const keeps = (st: DayStatus) => st === 'goal' || st === 'udzur';

export function streaks(s: Pick<State, 'habits' | 'periods' | 'settings' | 'logs'>) {
  const today = todayKey();
  let d = keeps(dayStatus(s, today)) ? today : addDays(today, -1);
  let current = 0;
  while (keeps(dayStatus(s, d))) {
    if (dayStatus(s, d) === 'goal') current++;
    d = addDays(d, -1);
    if (current > 3650) break;
  }
  const dates = Object.keys(s.logs).sort();
  let best = current;
  if (dates.length) {
    let run = 0;
    for (let k = dates[0]; k <= today; k = addDays(k, 1)) {
      const st = dayStatus(s, k);
      if (st === 'goal') run++;
      else if (st !== 'udzur') run = 0;
      best = Math.max(best, run);
    }
  }
  return { current, best, todayDone: dayStatus(s, today) === 'goal' };
}

export function habitStreak(h: Habit, logs: Logs) {
  let d = todayKey();
  if (!isDone(h, logs, d)) d = addDays(d, -1);
  let n = 0;
  while (n < 3650) {
    const dow = fromKey(d).getDay();
    if (h.days.includes(dow)) {
      if (!isDone(h, logs, d)) break;
      n++;
    }
    d = addDays(d, -1);
    if (Object.keys(logs).length === 0) break;
  }
  return n;
}

export function rangeStats(s: Pick<State, 'habits' | 'periods' | 'settings' | 'logs'>, keys: string[]) {
  const start = s.settings.startedAt ?? '0000';
  const past = keys.filter((k) => k <= todayKey() && k >= start);
  let done = 0;
  let total = 0;
  const per: Record<string, { done: number; total: number }> = {};
  const totals: Record<string, number> = {};
  for (const k of past) {
    for (const h of scheduled(s, k)) {
      per[h.id] ??= { done: 0, total: 0 };
      per[h.id].total++;
      total++;
      if (isDone(h, s.logs, k)) {
        per[h.id].done++;
        done++;
      }
    }
    for (const [hid, e] of Object.entries(s.logs[k] ?? {})) totals[hid] = (totals[hid] ?? 0) + e.value;
  }
  const ranked = Object.entries(per)
    .filter(([, v]) => v.total > 0)
    .map(([id, v]) => ({ id, rate: v.done / v.total }))
    .sort((a, b) => b.rate - a.rate);
  return {
    done,
    total,
    rate: total ? done / total : 0,
    best: ranked[0],
    worst: ranked.length > 1 ? ranked[ranked.length - 1] : undefined,
    totals,
    activeDays: past.filter((k) => dayStatus(s, k) === 'goal').length,
    udzurDays: past.filter((k) => dayStatus(s, k) === 'udzur').length,
  };
}
