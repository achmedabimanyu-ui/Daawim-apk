import { useColorScheme } from 'react-native';
import { useApp } from '@/store/app';

export const accents = {
  emerald: { main: '#1DB37A', dark: '#14915F', soft: '#DDF6EA' },
  teal: { main: '#16A6B6', dark: '#0F8593', soft: '#D9F3F6' },
  indigo: { main: '#5B6CF0', dark: '#4252CC', soft: '#E4E7FD' },
  rose: { main: '#EC5B8F', dark: '#C9406F', soft: '#FCE3EC' },
} as const;
export type AccentKey = keyof typeof accents;

const light = {
  bg: '#FFFFFF',
  card: '#FFFFFF',
  sunk: '#F6F7F9',
  border: '#E6E8EC',
  text: '#2F3437',
  muted: '#8A9099',
  faint: '#C3C8CF',
};
const dark = {
  bg: '#121619',
  card: '#1A2024',
  sunk: '#20272C',
  border: '#2E363C',
  text: '#ECEFF1',
  muted: '#8E979F',
  faint: '#4A535A',
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
  return { ...(isDark ? dark : light), ...fixed, accent: accents[accentKey], isDark };
}
export type Theme = ReturnType<typeof useTheme>;
