export type NavigationTab =
  | 'beranda'
  | 'sholat'
  | 'quran'
  | 'dzikir'
  | 'asmaul-husna'
  | 'habit'
  | 'kalender'
  | 'statistik'
  | 'catatan'
  | 'pengaturan';

export type PrayerTimeName = 'Imsak' | 'Subuh' | 'Syuruq' | 'Dhuha' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya';

export type PrayerStatus = 'completed' | 'pending' | 'halangan';

export type HalanganReason =
  | 'haid'
  | 'nifas'
  | 'sakit'
  | 'safar'
  | 'ketiduran'
  | 'lainnya';

export interface PrayerRecord {
  status: PrayerStatus;
  completedAt?: string;
  isJamaah?: boolean;
  halanganReason?: HalanganReason;
  halanganNote?: string;
}

export type HabitCategory = 'sholat' | 'quran' | 'dzikir' | 'sholawat' | 'sedekah' | 'puasa' | 'custom';

export type HabitFrequencyType = 'daily' | 'specific_days' | 'weekly' | 'custom';

export interface HabitItem {
  id: string;
  title: string;
  category: HabitCategory;
  description?: string;
  target: number;
  unit: string;
  iconName: string;
  isCustom?: boolean;
  status: 'completed' | 'pending' | 'halangan';
  currentValue: number;
  halanganReason?: HalanganReason;
  halanganNote?: string;
  notes?: string;
  isActive?: boolean;
  frequency?: HabitFrequencyType;
  specificDays?: number[]; // 0: Ahad/Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
  frequencyNote?: string;
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g. "05:00"
  syncSource?: 'prayer_subuh' | 'prayer_dzuhur' | 'prayer_ashar' | 'prayer_maghrib' | 'prayer_isya' | 'prayer_dhuha' | 'prayer_tahajjud' | 'quran' | 'dzikir_pagi' | 'dzikir_petang' | 'dzikir_all' | 'sholawat' | 'sedekah' | 'puasa' | 'puasa_senin_kamis' | 'puasa_ayyamul_bidh' | 'puasa_daud' | 'puasa_ramadhan' | 'puasa_nazar' | 'puasa_sunnah_lainnya' | 'none';
  fastingType?: 'none' | 'ramadhan' | 'senin_kamis' | 'ayyamul_bidh' | 'daud' | 'nazar' | 'sunnah_lainnya';
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerTimeName, PrayerRecord>;
  habits: Record<string, { status: 'completed' | 'pending' | 'halangan'; value: number; target?: number; unit?: string; halanganReason?: HalanganReason; note?: string }>;
  quranPagesRead: number;
  quranTilawahValue?: number;
  quranTilawahUnit?: string;
  quranTilawahTarget?: number;
  quranLastRead?: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    juzNumber?: number;
  };
  totalDzikirCount: number;
  dzikirCounts?: Record<string, number>;
  dzikirAchievements?: Record<string, boolean>;
  sedekahAmount: number;
  fastingType: 'none' | 'ramadhan' | 'senin_kamis' | 'ayyamul_bidh' | 'daud' | 'nazar' | 'sunnah_lainnya';
  journalNote?: string;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameLatin: string;
  nameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Mekah' | 'Madinah';
  juzStart: number;
}

export interface Ayah {
  numberInSurah: number;
  numberInQuran: number;
  juz: number;
  textArabic: string;
  textLatin: string;
  translationId: string;
  audioUrl?: string;
  audioMap?: Record<string, string>;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  createdAt: string;
  note?: string;
}

export interface LastReadQuran {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  pageNumber?: number;
  juzNumber: number;
  updatedAt: string;
  isSetByUser?: boolean;
}

export interface DzikirItem {
  id: string;
  title: string;
  category: 'pagi' | 'petang' | 'sholat' | 'tidur' | 'sholawat' | 'harian' | 'custom';
  textArabic: string;
  textLatin: string;
  meaning: string;
  targetCount: number;
  currentCount: number;
  benefit?: string;
  source?: string;
  isCustom?: boolean;
  isPersonalCopy?: boolean;
  isEdited?: boolean;
  favorite?: boolean;
}

export interface AsmaulHusnaItem {
  id: number;
  nameArabic: string;
  nameLatin: string;
  meaning: string;
  explanation: string;
}

export interface NoteItem {
  id: string;
  title: string;
  category: 'jurnal' | 'refleksi' | 'doa' | 'target' | 'khutbah';
  content: string;
  date: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerReminderConfig {
  adzanEnabled: boolean;
  reminderMinutesBefore: number;
  sound: string;
}

export interface AppSettings {
  userName: string;
  gender: 'male' | 'female';
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isAutoLocation: boolean;
  calculationMethod: 'kemenag' | 'mwl' | 'makkah' | 'egypt' | 'isna';
  adzanSound: string;
  adzanSoundEnabled: boolean;
  soundEffectsEnabled: boolean;
  tasbihSoundEnabled: boolean;
  prayerReminders: Record<PrayerTimeName, PrayerReminderConfig>;
  khatamTargetDays: number;
  khatamStartDate: string;
  theme: 'emerald' | 'sage' | 'classic';
  audioQari: string;
  audioAutoPlayNext: boolean;
  language: 'id' | 'en';
}

export interface IslamicEvent {
  dateHijri: string; // MM-DD
  title: string;
  description: string;
  isHoliday?: boolean;
  recommendedFasting?: boolean;
}
