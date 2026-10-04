import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';
import { addDays, fromKey, todayKey } from './date';

export const methods: { key: keyof typeof CalculationMethod; label: string }[] = [
  { key: 'Singapore', label: 'Kemenag RI / MUIS (20°, 18°)' },
  { key: 'MuslimWorldLeague', label: 'Muslim World League' },
  { key: 'UmmAlQura', label: 'Umm al-Qura (Makkah)' },
  { key: 'Egyptian', label: 'Egyptian General Authority' },
  { key: 'Karachi', label: 'Karachi' },
  { key: 'Dubai', label: 'Dubai' },
  { key: 'Kuwait', label: 'Kuwait' },
  { key: 'Qatar', label: 'Qatar' },
  { key: 'Turkey', label: 'Diyanet (Turkey)' },
  { key: 'NorthAmerica', label: 'ISNA (North America)' },
];

export const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = (typeof PRAYERS)[number];

export function timesFor(lat: number, lng: number, method: string, madhab: 'shafi' | 'hanafi', date = todayKey()) {
  const fn = CalculationMethod[method as keyof typeof CalculationMethod] ?? CalculationMethod.Singapore;
  const params = fn();
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return new PrayerTimes(new Coordinates(lat, lng), fromKey(date), params);
}

export function nextPrayer(lat: number, lng: number, method: string, madhab: 'shafi' | 'hanafi', now = new Date()) {
  const today = timesFor(lat, lng, method, madhab);
  for (const p of PRAYERS) {
    if (p === 'sunrise') continue;
    if (today[p] > now) return { name: p as PrayerName, at: today[p], today };
  }
  const tomorrow = timesFor(lat, lng, method, madhab, addDays(todayKey(), 1));
  return { name: 'fajr' as PrayerName, at: tomorrow.fajr, today };
}
