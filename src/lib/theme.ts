import { useColorScheme } from 'react-native';
import { useApp } from '@/store/app';

export const accents = {
  elkisai: { main: '#3A4DC4', dark: '#222462', soft: '#E3E8FA' },
  emerald: { main: '#1DB37A', dark: '#14915F', soft: '#DDF6EA' },
  teal: { main: '#16A6B6', dark: '#0F8593', soft: '#D9F3F6' },
  indigo: { main: '#5B6CF0', dark: '#4252CC', soft: '#E4E7FD' },
  rose: { main: '#EC5B8F', dark: '#C9406F', soft: '#FCE3EC' },
} as const;
export type AccentKey = keyof typeof accents;

const light = {
  bg: '#F4F5F9',
  card: '#FFFFFF',
  sunk: '#EEF0F5',
  border: '#E4E7EE',
  text: '#2B3035',
  muted: '#7D848D',
  faint: '#BCC2C9',
};
const dark = {
  bg: '#0D1013',
  card: '#171C21',
  sunk: '#20262C',
  border: '#2C353B',
  text: '#F4F6F7',
  muted: '#B3BCC4',
  faint: '#78838C',
};

export const fixed = {
  flame: '#FF8A3D',
  flameDark: '#E86A1C',
  flameSoft: '#FFF1E2',
  gold: '#FFC23D',
  ice: '#4FB4F5',
  iceDark: '#2E95D8',
  iceSoft: '#E3F3FE',
  danger: '#EF5350',
  dangerDark: '#CC3A37',
};

export function useTheme() {
  const scheme = useColorScheme();
  const mode = useApp((s) => s.settings.theme);
  const accentKey = useApp((s) => s.settings.accent);
  const isDark = mode === 'system' ? scheme === 'dark' : mode === 'dark';
  const acc = accents[accentKey];
  if (!isDark) return { ...light, ...fixed, accent: acc, isDark };
  return {
    ...dark,
    ...fixed,
    flameSoft: 'rgba(255,138,61,0.18)',
    iceSoft: 'rgba(79,180,245,0.18)',
    accent: { main: acc.main, dark: acc.dark, soft: `${acc.main}2E` },
    isDark,
  };
}
export type Theme = ReturnType<typeof useTheme>;

const PASTELS = [
  { from: '#E3EEFF', to: '#F3F7FF', fg: '#3B7BF0' },
  { from: '#FFE9DC', to: '#FFF6F0', fg: '#F07A2E' },
  { from: '#E1F7EC', to: '#F2FBF6', fg: '#1BA672' },
  { from: '#F0E6FF', to: '#F8F3FF', fg: '#8B5CF6' },
  { from: '#FFE3EC', to: '#FFF3F7', fg: '#E5487B' },
  { from: '#DDF4F7', to: '#F1FAFB', fg: '#0FA3B1' },
];

export function pastel(key: string, dark: boolean) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const p = PASTELS[h % PASTELS.length];
  return dark ? { from: `${p.fg}30`, to: `${p.fg}12`, fg: p.fg } : p;
}
