import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultCategories, defaultHabits, type Category, type Habit } from '@/lib/defaults';
import type { Lang } from '@/lib/i18n';
import type { AccentKey } from '@/lib/theme';

export type Entry = { value: number; book?: string; juz?: string; surah?: string; matan?: string };
export type Logs = Record<string, Record<string, Entry>>;
export type Period = { start: string; end?: string };

export type Settings = {
  onboarded: boolean;
  startedAt?: string;
  name: string;
  photo?: string;
  gender: 'muslim' | 'muslimah';
  lang: Lang;
  theme: 'system' | 'light' | 'dark';
  accent: AccentKey;
  dailyGoal: number;
  prayer: {
    lat?: number;
    lng?: number;
    city?: string;
    method: string;
    madhab: 'shafi' | 'hanafi';
  };
};

export type State = {
  settings: Settings;
  habits: Habit[];
  categories: Category[];
  logs: Logs;
  periods: Period[];
  cycle: { cycleLen: number; periodLen: number };
  fastDebt: { total: number; paid: string[] };
};

type Actions = {
  setSettings: (p: Partial<Settings>) => void;
  setPrayer: (p: Partial<Settings['prayer']>) => void;
  setEntry: (date: string, habitId: string, entry: Entry | null) => void;
  upsertHabit: (h: Habit) => void;
  deleteHabit: (id: string) => void;
  addCategory: (name: string) => string;
  startPeriod: (date: string) => void;
  endPeriod: (date: string) => void;
  deletePeriod: (start: string) => void;
  setCycle: (c: Partial<State['cycle']>) => void;
  setDebtTotal: (n: number) => void;
  payDebt: (date: string) => void;
  unpayDebt: () => void;
  importState: (s: State) => void;
  reset: () => void;
};

export const initialState = (): State => ({
  settings: {
    onboarded: false,
    name: '',
    gender: 'muslim',
    lang: 'id',
    theme: 'system',
    accent: 'emerald',
    dailyGoal: 0.6,
    prayer: { method: 'Singapore', madhab: 'shafi' },
  },
  habits: defaultHabits(),
  categories: defaultCategories(),
  logs: {},
  periods: [],
  cycle: { cycleLen: 28, periodLen: 7 },
  fastDebt: { total: 0, paid: [] },
});

export const useApp = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      setPrayer: (p) => set((s) => ({ settings: { ...s.settings, prayer: { ...s.settings.prayer, ...p } } })),
      setEntry: (date, habitId, entry) =>
        set((s) => {
          const day = { ...(s.logs[date] ?? {}) };
          if (entry && entry.value > 0) day[habitId] = entry;
          else delete day[habitId];
          return { logs: { ...s.logs, [date]: day } };
        }),
      upsertHabit: (h) =>
        set((s) => {
          const exists = s.habits.some((x) => x.id === h.id);
          return { habits: exists ? s.habits.map((x) => (x.id === h.id ? h : x)) : [...s.habits, h] };
        }),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      addCategory: (name) => {
        const id = `c_${Date.now()}`;
        set((s) => ({ categories: [...s.categories, { id, name }] }));
        return id;
      },
      startPeriod: (date) =>
        set((s) => ({ periods: [...s.periods.filter((p) => p.end), { start: date }].sort((a, b) => a.start.localeCompare(b.start)) })),
      endPeriod: (date) =>
        set((s) => ({ periods: s.periods.map((p) => (p.end ? p : { ...p, end: date })) })),
      deletePeriod: (start) => set((s) => ({ periods: s.periods.filter((p) => p.start !== start) })),
      setCycle: (c) => set((s) => ({ cycle: { ...s.cycle, ...c } })),
      setDebtTotal: (n) => set((s) => ({ fastDebt: { ...s.fastDebt, total: Math.max(0, n) } })),
      payDebt: (date) =>
        set((s) =>
          s.fastDebt.paid.length >= s.fastDebt.total ? s : { fastDebt: { ...s.fastDebt, paid: [...s.fastDebt.paid, date] } },
        ),
      unpayDebt: () => set((s) => ({ fastDebt: { ...s.fastDebt, paid: s.fastDebt.paid.slice(0, -1) } })),
      importState: (data) => set({ ...initialState(), ...data, settings: { ...initialState().settings, ...data.settings, onboarded: true } }),
      reset: () => set(initialState()),
    }),
    {
      name: 'daawim',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ settings, habits, categories, logs, periods, cycle, fastDebt }) => ({
        settings, habits, categories, logs, periods, cycle, fastDebt,
      }),
    },
  ),
);

export const exportable = (): State => {
  const { settings, habits, categories, logs, periods, cycle, fastDebt } = useApp.getState();
  return { settings, habits, categories, logs, periods, cycle, fastDebt };
};
