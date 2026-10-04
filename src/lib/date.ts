export const pad = (n: number) => String(n).padStart(2, '0');

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toKey(new Date());

export const addDays = (k: string, n: number) => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

export const diffDays = (a: string, b: string) =>
  Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86400000);

export const rangeKeys = (end: string, count: number) =>
  Array.from({ length: count }, (_, i) => addDays(end, i - count + 1));

export const monthKeys = (year: number, month: number) => {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => toKey(new Date(year, month, i + 1)));
};

export const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
