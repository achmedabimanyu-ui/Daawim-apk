import type { Lang } from './i18n';

export type HabitKind = 'check' | 'count';
export type DetailField = 'book' | 'juz' | 'surah' | 'matan';

export type Habit = {
  id: string;
  name: string;
  builtin?: string;
  category: string;
  icon: string;
  kind: HabitKind;
  target: number;
  unit: string;
  days: number[];
  active: boolean;
  fields?: DetailField[];
  prayer?: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
};

export type Category = { id: string; name: string; builtin?: 'ibadah' | 'produktif' };

const ALL = [0, 1, 2, 3, 4, 5, 6];

export const builtinNames: Record<string, Record<Lang, string>> = {
  fajr: { id: 'Shalat Subuh', en: 'Fajr Prayer', ar: 'صلاة الفجر' },
  dhuhr: { id: 'Shalat Dzuhur', en: 'Dhuhr Prayer', ar: 'صلاة الظهر' },
  asr: { id: 'Shalat Ashar', en: 'Asr Prayer', ar: 'صلاة العصر' },
  maghrib: { id: 'Shalat Maghrib', en: 'Maghrib Prayer', ar: 'صلاة المغرب' },
  isha: { id: 'Shalat Isya', en: 'Isha Prayer', ar: 'صلاة العشاء' },
  tahajjud: { id: 'Tahajjud', en: 'Tahajjud', ar: 'التهجد' },
  dhuha: { id: 'Dhuha', en: 'Duha', ar: 'الضحى' },
  witir: { id: 'Witir', en: 'Witr', ar: 'الوتر' },
  dzikir: { id: 'Dzikir Pagi & Petang', en: 'Morning & Evening Adhkar', ar: 'أذكار الصباح والمساء' },
  puasa: { id: 'Puasa Sunnah', en: 'Sunnah Fasting', ar: 'صيام التطوع' },
  tilawah: { id: 'Tilawah', en: 'Quran Recitation', ar: 'التلاوة' },
  murojaah: { id: 'Murojaah Al-Qur\'an', en: 'Quran Revision', ar: 'مراجعة القرآن' },
  book: { id: 'Baca Buku', en: 'Reading', ar: 'القراءة' },
  matan: { id: 'Hafalan / Murojaah Matan', en: 'Matn Memorization', ar: 'حفظ المتون' },
};

export const categoryNames: Record<'ibadah' | 'produktif', Record<Lang, string>> = {
  ibadah: { id: 'Ibadah', en: 'Worship', ar: 'العبادة' },
  produktif: { id: 'Produktivitas', en: 'Productivity', ar: 'الإنتاجية' },
};

const b = (
  key: string,
  icon: string,
  category: string,
  extra: Partial<Habit> = {},
): Habit => ({
  id: key,
  builtin: key,
  name: builtinNames[key].id,
  category,
  icon,
  kind: 'check',
  target: 1,
  unit: '',
  days: ALL,
  active: true,
  ...extra,
});

export const defaultHabits = (): Habit[] => [
  b('fajr', 'sunrise', 'ibadah', { prayer: 'fajr' }),
  b('dhuhr', 'sun', 'ibadah', { prayer: 'dhuhr' }),
  b('asr', 'cloud-sun', 'ibadah', { prayer: 'asr' }),
  b('maghrib', 'sunset', 'ibadah', { prayer: 'maghrib' }),
  b('isha', 'moon', 'ibadah', { prayer: 'isha' }),
  b('tahajjud', 'moon-star', 'ibadah', { active: false }),
  b('dhuha', 'sun-medium', 'ibadah'),
  b('witir', 'sparkles', 'ibadah'),
  b('dzikir', 'circle-dot', 'ibadah'),
  b('puasa', 'utensils-crossed', 'ibadah', { days: [1, 4], active: false }),
  b('tilawah', 'book-open', 'produktif', { kind: 'count', target: 5, unit: 'pages' }),
  b('murojaah', 'repeat', 'produktif', { kind: 'count', target: 5, unit: 'pages', fields: ['juz', 'surah'] }),
  b('book', 'library', 'produktif', { kind: 'count', target: 10, unit: 'pages', fields: ['book'] }),
  b('matan', 'scroll-text', 'produktif', { kind: 'count', target: 5, unit: 'verses', fields: ['matan'] }),
];

export const defaultCategories = (): Category[] => [
  { id: 'ibadah', name: 'Ibadah', builtin: 'ibadah' },
  { id: 'produktif', name: 'Produktivitas', builtin: 'produktif' },
];

export const habitIcons = [
  'sunrise', 'sun', 'cloud-sun', 'sunset', 'moon', 'moon-star', 'sun-medium', 'sparkles',
  'circle-dot', 'utensils-crossed', 'book-open', 'repeat', 'library', 'scroll-text',
  'heart', 'dumbbell', 'droplet', 'pen-line', 'hand-heart', 'footprints', 'brain', 'clock',
];

export const quotes: Record<Lang, { text: string; src: string }[]> = {
  id: [
    { text: 'Amalan yang paling dicintai Allah adalah yang paling kontinu, meskipun sedikit.', src: 'HR. Bukhari & Muslim' },
    { text: 'Sesungguhnya bersama kesulitan ada kemudahan.', src: 'QS. Al-Insyirah: 6' },
    { text: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.', src: 'QS. Ar-Ra\'d: 28' },
    { text: 'Manfaatkan lima perkara sebelum lima perkara: mudamu sebelum tuamu...', src: 'HR. Al-Hakim' },
    { text: 'Ilmu itu didatangi, bukan mendatangi.', src: 'Imam Malik' },
    { text: 'Waktu itu laksana pedang; jika engkau tidak memotongnya, ia yang akan memotongmu.', src: 'Imam Asy-Syafi\'i' },
    { text: 'Maka apabila engkau telah selesai (dari suatu urusan), tetaplah bekerja keras.', src: 'QS. Al-Insyirah: 7' },
  ],
  en: [
    { text: 'The most beloved deeds to Allah are those done consistently, even if small.', src: 'Bukhari & Muslim' },
    { text: 'Indeed, with hardship comes ease.', src: 'Quran 94:6' },
    { text: 'Verily, in the remembrance of Allah do hearts find rest.', src: 'Quran 13:28' },
    { text: 'Take advantage of five before five: your youth before your old age...', src: 'Al-Hakim' },
    { text: 'Knowledge is to be sought, it does not come to you.', src: 'Imam Malik' },
    { text: 'Time is like a sword; if you do not cut it, it will cut you.', src: 'Imam Ash-Shafi\'i' },
    { text: 'So when you have finished, then stand up for worship.', src: 'Quran 94:7' },
  ],
  ar: [
    { text: 'أحب الأعمال إلى الله أدومها وإن قل.', src: 'متفق عليه' },
    { text: 'فإن مع العسر يسرا.', src: 'الشرح: ٦' },
    { text: 'ألا بذكر الله تطمئن القلوب.', src: 'الرعد: ٢٨' },
    { text: 'اغتنم خمسًا قبل خمس: شبابك قبل هرمك...', src: 'الحاكم' },
    { text: 'العلم يُؤتى ولا يأتي.', src: 'الإمام مالك' },
    { text: 'الوقت كالسيف إن لم تقطعه قطعك.', src: 'الإمام الشافعي' },
    { text: 'فإذا فرغت فانصب.', src: 'الشرح: ٧' },
  ],
};
