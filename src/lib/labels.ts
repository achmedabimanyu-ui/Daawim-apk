import { builtinNames, categoryNames, type Category, type Habit } from './defaults';
import type { Dict, Lang } from './i18n';

export const habitName = (h: Habit, lang: Lang) =>
  h.builtin && builtinNames[h.builtin] && h.name === builtinNames[h.builtin].id ? builtinNames[h.builtin][lang] : h.name;

export const categoryName = (c: Category, lang: Lang) => (c.builtin ? categoryNames[c.builtin][lang] : c.name);

export const unitLabel = (unit: string, t: (k: keyof Dict) => string) =>
  ['pages', 'verses', 'times', 'minutes'].includes(unit) ? t(unit as keyof Dict) : unit;
