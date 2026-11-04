import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  NavigationTab,
  PrayerTimeName,
  PrayerStatus,
  HalanganReason,
  HabitItem,
  DayRecord,
  DzikirItem,
  NoteItem,
  QuranBookmark,
  LastReadQuran,
  AppSettings,
} from '../types';
import { calculatePrayerTimes, getNextPrayerInfo, PrayerTimesMap, NextPrayerInfo, POPULAR_CITIES } from '../utils/prayerCalculator';
import { INITIAL_DZIKIR_LIST } from '../data/dzikirData';
import { soundController } from '../utils/soundEffects';
import {
  formatLocalDate,
  parseLocalDate,
  getTodayString,
  addDaysToDateString,
} from '../utils/dateUtils';
import { getTilawahRecord } from '../utils/habitFormatter';

export { formatLocalDate, parseLocalDate, getTodayString, addDaysToDateString };

const STORAGE_KEYS = {
  SETTINGS: 'muslimlife_settings_v1',
  DAY_RECORDS: 'muslimlife_day_records_v1',
  HABITS: 'muslimlife_habits_v1',
  DZIKIR: 'muslimlife_dzikir_v1',
  DZIKIR_DATE: 'muslimlife_dzikir_date_v1',
  DZIKIR_ACHIEVED: 'muslimlife_dzikir_achieved_v1',
  LAST_READ: 'muslimlife_last_read_v1',
  BOOKMARKS: 'muslimlife_bookmarks_v1',
  NOTES: 'muslimlife_notes_v1',
};

const getStoredAchievements = (): Record<string, Record<string, boolean>> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DZIKIR_ACHIEVED);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredAchievement = (date: string, dzikirId: string, achieved: boolean) => {
  try {
    const current = getStoredAchievements();
    if (!current[date]) current[date] = {};
    if (achieved) {
      current[date][dzikirId] = true;
    } else {
      delete current[date][dzikirId];
    }
    localStorage.setItem(STORAGE_KEYS.DZIKIR_ACHIEVED, JSON.stringify(current));
  } catch {}
};

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Hamba Allah',
  gender: 'male',
  city: 'Jakarta',
  country: 'Indonesia',
  latitude: -6.2088,
  longitude: 106.8456,
  isAutoLocation: false,
  calculationMethod: 'kemenag',
  adzanSound: 'ali-ahmad-mulla',
  adzanSoundEnabled: true,
  soundEffectsEnabled: true,
  tasbihSoundEnabled: true,
  prayerReminders: {
    Imsak: { adzanEnabled: false, reminderMinutesBefore: 10, sound: 'beep-soft' },
    Subuh: { adzanEnabled: true, reminderMinutesBefore: 15, sound: 'ali-ahmad-mulla' },
    Syuruq: { adzanEnabled: false, reminderMinutesBefore: 5, sound: 'gentle-chime' },
    Dhuha: { adzanEnabled: false, reminderMinutesBefore: 10, sound: 'gentle-chime' },
    Dzuhur: { adzanEnabled: true, reminderMinutesBefore: 15, sound: 'ali-ahmad-mulla' },
    Ashar: { adzanEnabled: true, reminderMinutesBefore: 15, sound: 'ali-ahmad-mulla' },
    Maghrib: { adzanEnabled: true, reminderMinutesBefore: 15, sound: 'ali-ahmad-mulla' },
    Isya: { adzanEnabled: true, reminderMinutesBefore: 15, sound: 'ali-ahmad-mulla' },
  },
  khatamTargetDays: 30,
  khatamStartDate: getTodayString(),
  theme: 'emerald',
  audioQari: 'Misyari Rasyid Al-Afasy',
  audioAutoPlayNext: true,
  language: 'id',
};

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h-subuh', title: 'Sholat Subuh', category: 'sholat', description: '2 Rakaat tepat waktu', target: 1, unit: 'waktu', iconName: 'Sunrise', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '04:30', syncSource: 'prayer_subuh' },
  { id: 'h-dzuhur', title: 'Sholat Dzuhur', category: 'sholat', description: '4 Rakaat berjamaah', target: 1, unit: 'waktu', iconName: 'Sun', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '12:00', syncSource: 'prayer_dzuhur' },
  { id: 'h-ashar', title: 'Sholat Ashar', category: 'sholat', description: '4 Rakaat tepat waktu', target: 1, unit: 'waktu', iconName: 'CloudSun', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '15:15', syncSource: 'prayer_ashar' },
  { id: 'h-maghrib', title: 'Sholat Maghrib', category: 'sholat', description: '3 Rakaat berjamaah di awal waktu', target: 1, unit: 'waktu', iconName: 'Sunset', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '18:00', syncSource: 'prayer_maghrib' },
  { id: 'h-isya', title: 'Sholat Isya', category: 'sholat', description: '4 Rakaat & Witir', target: 1, unit: 'waktu', iconName: 'Moon', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '19:15', syncSource: 'prayer_isya' },
  { id: 'h-dhuha', title: 'Sholat Dhuha', category: 'sholat', description: 'Minimal 2 atau 4 rakaat pembuka rezeki', target: 2, unit: 'rakaat', iconName: 'Sparkles', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: false, reminderTime: '08:00', syncSource: 'prayer_dhuha' },
  { id: 'h-tahajjud', title: 'Sholat Tahajjud & Qiyamul Lail', category: 'sholat', description: 'Sholat sunnah sepertiga malam', target: 2, unit: 'rakaat', iconName: 'Flame', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: false, reminderTime: '03:30', syncSource: 'prayer_tahajjud' },
  { id: 'h-quran', title: 'Tilawah Al-Qur\'an', category: 'quran', description: 'Membaca Al-Qur\'an One Day One Juz', target: 20, unit: 'halaman', iconName: 'BookOpen', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '05:30', syncSource: 'quran' },
  { id: 'h-dzikir-pagi', title: 'Dzikir Pagi', category: 'dzikir', description: 'Al-Matsurat / Doa pelindung pagi', target: 1, unit: 'sesi', iconName: 'Feather', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '06:00', syncSource: 'dzikir_pagi' },
  { id: 'h-dzikir-petang', title: 'Dzikir Petang', category: 'dzikir', description: 'Dzikir sore penenang jiwa', target: 1, unit: 'sesi', iconName: 'HeartHandshake', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: true, reminderTime: '16:30', syncSource: 'dzikir_petang' },
  { id: 'h-sholawat', title: 'Sholawat Nabi', category: 'sholawat', description: 'Sholawat Jibril / Ibrahimiyah 100x', target: 100, unit: 'kali', iconName: 'Heart', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: false, reminderTime: '19:45', syncSource: 'sholawat' },
  { id: 'h-sedekah', title: 'Sedekah Subuh / Harian', category: 'sedekah', description: 'Infaq subuh membuka pintu berkah & rezeki', target: 10000, unit: 'rupiah', iconName: 'Coins', status: 'pending', currentValue: 0, isActive: true, frequency: 'daily', reminderEnabled: false, reminderTime: '06:00', syncSource: 'sedekah' },
  { id: 'h-puasa', title: 'Puasa Sunnah', category: 'puasa', description: 'Senin-Kamis / Ayyamul Bidh', target: 1, unit: 'hari', iconName: 'CalendarCheck', status: 'pending', currentValue: 0, isActive: true, frequency: 'specific_days', specificDays: [1, 4], frequencyNote: 'Senin & Kamis', reminderEnabled: true, reminderTime: '03:30', syncSource: 'puasa' },
];

const DEFAULT_NOTES: NoteItem[] = [];

export function createEmptyDayRecord(date: string): DayRecord {
  return {
    date,
    prayers: {
      Imsak: { status: 'pending' },
      Subuh: { status: 'pending' },
      Syuruq: { status: 'pending' },
      Dhuha: { status: 'pending' },
      Dzuhur: { status: 'pending' },
      Ashar: { status: 'pending' },
      Maghrib: { status: 'pending' },
      Isya: { status: 'pending' },
    },
    habits: {},
    quranPagesRead: 0,
    quranTilawahValue: 0,
    quranTilawahUnit: 'halaman',
    totalDzikirCount: 0,
    dzikirCounts: {},
    dzikirAchievements: {},
    sedekahAmount: 0,
    fastingType: 'none',
  };
}

// Clean initialization: Only generate the current day's record with zero dummy data
function generateInitialRecords(): Record<string, DayRecord> {
  const today = getTodayString();
  return {
    [today]: createEmptyDayRecord(today),
  };
}

// Sanitize saved records to guarantee 100% real user data without any legacy mock/synthetic seeds
function sanitizeDayRecords(savedRecords: Record<string, DayRecord> | null): Record<string, DayRecord> {
  const today = getTodayString();
  if (!savedRecords || typeof savedRecords !== 'object') {
    return { [today]: createEmptyDayRecord(today) };
  }

  const dates = Object.keys(savedRecords);
  let totalPrayers = 0;
  let totalQuran = 0;
  let totalDzikir = 0;

  dates.forEach((d) => {
    const r = savedRecords[d];
    if (!r) return;
    if (r.prayers) {
      (['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'] as PrayerTimeName[]).forEach((p) => {
        if (r.prayers[p]?.status === 'completed') totalPrayers++;
      });
    }
    totalQuran += r.quranPagesRead || 0;
    totalDzikir += r.totalDzikirCount || 0;
  });

  // Check if savedRecords contains the old synthetic/dummy seed (e.g. 37 prayers, 118 tilawah, 165 dzikir)
  const hasLegacyMockSeed =
    (totalPrayers === 37 && totalQuran === 118) ||
    (totalPrayers === 37 && totalDzikir === 165) ||
    (totalQuran === 118 && totalDzikir === 165) ||
    (totalPrayers === 37) ||
    (totalQuran === 118) ||
    (dates.length >= 20 && totalPrayers >= 35 && totalPrayers <= 40 && totalQuran >= 110 && totalQuran <= 125);

  if (hasLegacyMockSeed) {
    // Purge the old mock data! Preserve today's real user actions if any.
    const todayRec = savedRecords[today];
    const cleanToday = createEmptyDayRecord(today);
    if (todayRec) {
      if (todayRec.dzikirCounts && Object.keys(todayRec.dzikirCounts).length > 0) {
        cleanToday.dzikirCounts = todayRec.dzikirCounts;
        cleanToday.totalDzikirCount = todayRec.totalDzikirCount || 0;
        cleanToday.dzikirAchievements = todayRec.dzikirAchievements || {};
      }
      if (todayRec.prayers) {
        (['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya', 'Dhuha', 'Imsak', 'Syuruq'] as PrayerTimeName[]).forEach((p) => {
          if (todayRec.prayers[p]?.status === 'completed') {
            cleanToday.prayers[p] = todayRec.prayers[p];
          }
        });
      }
      if (todayRec.quranPagesRead && todayRec.quranPagesRead !== 118) {
        cleanToday.quranPagesRead = todayRec.quranPagesRead;
      }
      if (todayRec.sedekahAmount) {
        cleanToday.sedekahAmount = todayRec.sedekahAmount;
      }
      if (todayRec.habits) {
        cleanToday.habits = todayRec.habits;
      }
    }
    const cleanState = { [today]: cleanToday };
    try {
      localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(cleanState));
    } catch {}
    return cleanState;
  }

  // Ensure today's record exists
  if (!savedRecords[today]) {
    savedRecords[today] = createEmptyDayRecord(today);
  }

  return savedRecords;
}

export interface ImportDataResult {
  success: boolean;
  message: string;
  summary?: {
    daysCount: number;
    habitsCount: number;
    notesCount: number;
    bookmarksCount: number;
  };
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  prayerTimes: PrayerTimesMap;
  nextPrayer: NextPrayerInfo;
  dayRecords: Record<string, DayRecord>;
  historyRecords: Record<string, DayRecord>;
  todayRecord: DayRecord;
  selectedDayRecord: DayRecord;
  habits: HabitItem[];
  dzikirList: DzikirItem[];
  activeDzikirId: string;
  setActiveDzikirId: (id: string) => void;
  activeTasbihDzikir: DzikirItem | null;
  setActiveTasbihDzikir: (dzikir: DzikirItem | null) => void;
  openTasbihWithCustom: (item: { title: string; textArabic?: string; textLatin?: string; arabic?: string; latin?: string; meaning: string; targetCount?: number }) => void;
  lastReadQuran: LastReadQuran;
  bookmarks: QuranBookmark[];
  notes: NoteItem[];
  
  // Handlers
  setPrayerStatus: (prayer: PrayerTimeName, status: PrayerStatus, options?: { isJamaah?: boolean; halanganReason?: HalanganReason; halanganNote?: string; date?: string }) => void;
  updateHabitStatus: (habitId: string, status: 'completed' | 'pending' | 'halangan', value?: number, halanganReason?: HalanganReason, halanganNote?: string, date?: string) => void;
  setHabitActualValue: (habitId: string, actualValue: number, date?: string) => void;
  logHabitProgress: (habitId: string, addedValue: number, date?: string) => void;
  logSedekah: (amount: number, date?: string) => void;
  logQuranPages: (pagesCount: number, date?: string) => void;
  toggleHabit: (habitId: string, status: 'completed' | 'pending' | 'halangan', value?: number, halanganReason?: HalanganReason, halanganNote?: string, date?: string) => void;
  addCustomHabit: (habit: Omit<HabitItem, 'id' | 'status' | 'currentValue'>) => void;
  updateCustomHabit: (id: string, updates: Partial<HabitItem>) => void;
  deleteCustomHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<HabitItem>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitActive: (id: string) => void;
  restoreDefaultHabits: () => void;
  incrementDzikir: (dzikirId: string, step?: number, date?: string) => void;
  resetDzikirCount: (dzikirId: string, date?: string) => void;
  resetDzikir: (dzikirId: string, date?: string) => void;
  addCustomDzikir: (dzikir: Omit<DzikirItem, 'id' | 'currentCount'>) => void;
  updateCustomDzikir: (id: string, updates: Partial<DzikirItem>) => void;
  updateDzikir: (id: string, updates: Partial<DzikirItem>) => void;
  deleteCustomDzikir: (id: string) => void;
  deleteDzikir: (id: string) => void;
  setDzikirTarget: (id: string, targetCount: number) => void;
  restoreOriginalDzikir: (id: string) => void;
  restoreAllDefaultDzikir: () => void;
  setLastRead: (surahNumber: number, ayahNumber: number, surahName?: string, juzNumber?: number) => void;
  toggleBookmark: (bookmark: Omit<QuranBookmark, 'id' | 'createdAt'>) => void;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  setFastingType: (type: DayRecord['fastingType'], date?: string) => void;
  setDayJournalNote: (note: string, date?: string) => void;
  
  // Active Quran Reader
  activeQuranSurah: number;
  setActiveQuranSurah: (surah: number) => void;

  // Mobile Navigation Drawer state
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Halangan Modal state helper
  halanganModalPrayer: PrayerTimeName | null;
  setHalanganModalPrayer: (prayer: PrayerTimeName | null) => void;
  
  // Analytics helpers
  currentStreak: number;
  longestStreak: number;
  totalPrayersCompleted: number;
  totalQuranPagesRead: number;
  totalDzikirLogged: number;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => ImportDataResult;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activeQuranSurah, setActiveQuranSurah] = useState<number>(1);
  const [halanganModalPrayer, setHalanganModalPrayer] = useState<PrayerTimeName | null>(null);

  // Load Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Load Day Records
  const [dayRecords, setDayRecords] = useState<Record<string, DayRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
      if (saved) return sanitizeDayRecords(JSON.parse(saved));
    } catch {}
    return generateInitialRecords();
  });

  // Load Habits
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (saved) {
        const parsed: HabitItem[] = JSON.parse(saved);
        return parsed.map((h) => ({
          ...h,
          isActive: h.isActive !== false,
          frequency: h.frequency || 'daily',
        }));
      }
    } catch {}
    return DEFAULT_HABITS;
  });

  // Load Dzikir List with date-based rollover and actual stored count support
  const [dzikirList, setDzikirList] = useState<DzikirItem[]>(() => {
    const today = getTodayString();
    let baseList = INITIAL_DZIKIR_LIST;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DZIKIR);
      if (saved) baseList = JSON.parse(saved);
    } catch {}

    // Initialize currentCount strictly from today's saved records
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        const todayRec = parsed[today];
        const todayCounts = todayRec?.dzikirCounts || {};
        return baseList.map((item) => ({
          ...item,
          currentCount: typeof todayCounts[item.id] === 'number' ? todayCounts[item.id] : 0,
        }));
      }
    } catch {}

    return baseList.map((item) => ({ ...item, currentCount: 0 }));
  });

  const [activeDzikirId, setActiveDzikirId] = useState<string>(() => INITIAL_DZIKIR_LIST[0]?.id || 'dz-1');
  const [activeTasbihDzikir, setActiveTasbihDzikir] = useState<DzikirItem | null>(null);

  // Load Last Read (clean empty state by default unless actively saved by user)
  const [lastReadQuran, setLastReadQuran] = useState<LastReadQuran>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_READ);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If this was the old default Al-Kahf with no isSetByUser, treat as unread
          if (parsed.surahNumber === 18 && parsed.ayahNumber === 1 && !parsed.isSetByUser) {
            return {
              surahNumber: 0,
              surahName: '',
              ayahNumber: 0,
              juzNumber: 0,
              updatedAt: '',
              isSetByUser: false,
            };
          }
          if (parsed.surahNumber > 0 && parsed.isSetByUser !== false) {
            return { ...parsed, isSetByUser: true };
          }
        }
      }
    } catch {}
    return {
      surahNumber: 0,
      surahName: '',
      ayahNumber: 0,
      juzNumber: 0,
      updatedAt: '',
      isSetByUser: false,
    };
  });

  // Load Bookmarks
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((b) => b.id !== 'bm-1' && b.id !== 'bm-2');
        }
      }
    } catch {}
    return [];
  });

  // Load Notes
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => n.id !== 'note-1' && n.id !== 'note-2');
        }
      }
    } catch {}
    return DEFAULT_NOTES;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(dayRecords));
    } catch (e) {}
  }, [dayRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {}
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DZIKIR, JSON.stringify(dzikirList));
    } catch (e) {}
  }, [dzikirList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(lastReadQuran));
    } catch (e) {}
  }, [lastReadQuran]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  // Prayer Times calculation based on current settings
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(
      new Date(),
      settings.latitude,
      settings.longitude,
      settings.calculationMethod
    );
  }, [settings.latitude, settings.longitude, settings.calculationMethod]);

  // Real-time ticking next prayer info
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(() => getNextPrayerInfo(prayerTimes));

  useEffect(() => {
    const updateCountdown = () => {
      setNextPrayer(getNextPrayerInfo(prayerTimes));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const todayStr = getTodayString();
  const todayRecord = useMemo(() => {
    return dayRecords[todayStr] || createEmptyDayRecord(todayStr);
  }, [dayRecords, todayStr]);

  const selectedDayRecord = useMemo(() => {
    return dayRecords[selectedDate] || createEmptyDayRecord(selectedDate);
  }, [dayRecords, selectedDate]);

  // Synchronize dzikirList currentCount with the active date's stored dayRecord dzikirCounts
  useEffect(() => {
    const targetDate = selectedDate || getTodayString();
    const currentCounts = dayRecords[targetDate]?.dzikirCounts || {};
    setDzikirList((prev) => {
      let isDifferent = false;
      const updated = prev.map((item) => {
        const storedCount = typeof currentCounts[item.id] === 'number' ? currentCounts[item.id] : 0;
        if (item.currentCount !== storedCount) {
          isDifferent = true;
          return { ...item, currentCount: storedCount };
        }
        return item;
      });
      return isDifferent ? updated : prev;
    });
  }, [selectedDate, dayRecords]);

  // Automatic Daily Dzikir & Record Rollover:
  // Detects local day changes (e.g. across midnight or upon reopening on a new day),
  // closes the previous day's progress (keeping it safely recorded in DayRecord/Riwayat),
  // and starts the new day's dzikir progress automatically from 0 without user having to press reset.
  useEffect(() => {
    const handleDailyRollover = () => {
      const today = getTodayString();
      const savedDate = localStorage.getItem(STORAGE_KEYS.DZIKIR_DATE);

      if (savedDate && savedDate !== today) {
        // Date changed! Ensure new day starts at 0 while preserving historical records
        setDayRecords((prev) => {
          if (!prev[today]) {
            return {
              ...prev,
              [today]: createEmptyDayRecord(today),
            };
          }
          return prev;
        });

        // Reset active dzikir progress to 0 for the new day
        setDzikirList((prev) =>
          prev.map((item) => ({
            ...item,
            currentCount: 0,
          }))
        );

        localStorage.setItem(STORAGE_KEYS.DZIKIR_DATE, today);
      } else if (!savedDate) {
        localStorage.setItem(STORAGE_KEYS.DZIKIR_DATE, today);
      }
    };

    handleDailyRollover();
    const interval = setInterval(handleDailyRollover, 10000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleDailyRollover();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleDailyRollover);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleDailyRollover);
    };
  }, []);

  // Set Prayer Status (Completed / Pending / Halangan)
  const setPrayerStatus = useCallback(
    (
      prayer: PrayerTimeName,
      status: PrayerStatus,
      options?: { isJamaah?: boolean; halanganReason?: HalanganReason; halanganNote?: string; date?: string }
    ) => {
      const targetDate = options?.date || selectedDate || getTodayString();

      setDayRecords((prev) => {
        const currentDay = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
        const updatedPrayers = {
          ...currentDay.prayers,
          [prayer]: {
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            isJamaah: options?.isJamaah ?? (status === 'completed' ? true : undefined),
            halanganReason: status === 'halangan' ? (options?.halanganReason || 'haid') : undefined,
            halanganNote: status === 'halangan' ? options?.halanganNote : undefined,
          },
        };

        // Link habit item status
        const prayerHabitMap: Partial<Record<PrayerTimeName, string>> = {
          Subuh: 'h-subuh',
          Dzuhur: 'h-dzuhur',
          Ashar: 'h-ashar',
          Maghrib: 'h-maghrib',
          Isya: 'h-isya',
          Dhuha: 'h-dhuha',
        };

        const linkedHabitId = prayerHabitMap[prayer];
        const prayerSyncKey = `prayer_${prayer.toLowerCase()}`;
        const updatedHabits = { ...currentDay.habits };

        const matchingHabits = habits.filter(
          (h) => h.id === linkedHabitId || h.syncSource === prayerSyncKey
        );

        if (matchingHabits.length > 0) {
          matchingHabits.forEach((hMeta) => {
            const targetVal = hMeta.target || (prayer === 'Dhuha' ? 2 : 1);
            updatedHabits[hMeta.id] = {
              status,
              value: status === 'completed' ? targetVal : 0,
              halanganReason: status === 'halangan' ? options?.halanganReason : undefined,
              note: options?.halanganNote,
            };
          });
        } else if (linkedHabitId) {
          const defTarget = prayer === 'Dhuha' ? 2 : 1;
          updatedHabits[linkedHabitId] = {
            status,
            value: status === 'completed' ? defTarget : 0,
            halanganReason: status === 'halangan' ? options?.halanganReason : undefined,
            note: options?.halanganNote,
          };
        }

        return {
          ...prev,
          [targetDate]: {
            ...currentDay,
            prayers: updatedPrayers,
            habits: updatedHabits,
          },
        };
      });

      // Sound & Celebration
      if (status === 'completed') {
        soundController.playMilestoneChime();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#059669', '#10B981', '#34D399', '#FBBF24'],
        });
      }
    },
    [habits, selectedDate]
  );

  // Update Habit Status (with 2-way real data synchronization)
  const updateHabitStatus = useCallback(
    (
      habitId: string,
      status: 'completed' | 'pending' | 'halangan',
      value?: number,
      halanganReason?: HalanganReason,
      halanganNote?: string,
      date?: string
    ) => {
      const targetDate = date || selectedDate || getTodayString();

      setDayRecords((prev) => {
        const currentDay = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
        const habitMeta = habits.find((h) => h.id === habitId);
        const finalValue = value !== undefined ? value : status === 'completed' ? (habitMeta?.target || 1) : 0;

        const updatedHabits = {
          ...currentDay.habits,
          [habitId]: {
            status,
            value: finalValue,
            target: habitMeta?.target,
            unit: habitMeta?.unit,
            halanganReason: status === 'halangan' ? halanganReason : undefined,
            note: halanganNote,
          },
        };

        // Real data synchronization with prayers
        const habitToPrayerMap: Partial<Record<string, PrayerTimeName>> = {
          'h-subuh': 'Subuh',
          'h-dzuhur': 'Dzuhur',
          'h-ashar': 'Ashar',
          'h-maghrib': 'Maghrib',
          'h-isya': 'Isya',
          'h-dhuha': 'Dhuha',
        };

        const updatedPrayers = { ...currentDay.prayers };
        let linkedPrayer = habitToPrayerMap[habitId];
        if (!linkedPrayer && habitMeta?.syncSource) {
          if (habitMeta.syncSource === 'prayer_subuh') linkedPrayer = 'Subuh';
          else if (habitMeta.syncSource === 'prayer_dzuhur') linkedPrayer = 'Dzuhur';
          else if (habitMeta.syncSource === 'prayer_ashar') linkedPrayer = 'Ashar';
          else if (habitMeta.syncSource === 'prayer_maghrib') linkedPrayer = 'Maghrib';
          else if (habitMeta.syncSource === 'prayer_isya') linkedPrayer = 'Isya';
          else if (habitMeta.syncSource === 'prayer_dhuha') linkedPrayer = 'Dhuha';
        }

        if (linkedPrayer && updatedPrayers[linkedPrayer]) {
          updatedPrayers[linkedPrayer] = {
            ...updatedPrayers[linkedPrayer],
            status,
            completedAt: status === 'completed' ? (updatedPrayers[linkedPrayer]?.completedAt || new Date().toISOString()) : undefined,
            isJamaah: status === 'completed' ? (updatedPrayers[linkedPrayer]?.isJamaah ?? false) : undefined,
            halanganReason: status === 'halangan' ? halanganReason : undefined,
            halanganNote: status === 'halangan' ? halanganNote : undefined,
          };
        }

        let quranPages = currentDay.quranPagesRead || 0;
        let tilawahVal = currentDay.quranTilawahValue !== undefined ? currentDay.quranTilawahValue : quranPages;
        let tilawahUnit = currentDay.quranTilawahUnit || habitMeta?.unit || 'halaman';
        let sedekah = currentDay.sedekahAmount || 0;
        let dzikirCount = currentDay.totalDzikirCount || 0;
        let fasting = currentDay.fastingType || 'none';

        if (habitId === 'h-quran' || habitMeta?.category === 'quran' || habitMeta?.syncSource === 'quran') {
          tilawahUnit = habitMeta?.unit || tilawahUnit;
          if (status === 'completed') {
            tilawahVal = finalValue && finalValue > 0 ? finalValue : (tilawahVal > 0 ? tilawahVal : (habitMeta?.target || 1));
            quranPages = tilawahVal;
          } else if (status === 'pending') {
            tilawahVal = finalValue > 0 ? finalValue : 0;
            quranPages = tilawahVal;
          } else if (status === 'halangan') {
            tilawahVal = 0;
            quranPages = 0;
          }
        }
        if (habitId === 'h-sedekah' || habitMeta?.category === 'sedekah' || habitMeta?.syncSource === 'sedekah') {
          if (status === 'completed') {
            sedekah = finalValue && finalValue > 0 ? finalValue : (sedekah > 0 ? sedekah : (habitMeta?.target || 10000));
          } else if (status === 'pending') {
            sedekah = finalValue > 0 ? finalValue : 0;
          }
        }
        if (habitId === 'h-dzikir-pagi' || habitId === 'h-dzikir-petang' || habitMeta?.category === 'dzikir' || habitMeta?.syncSource?.startsWith('dzikir')) {
          if (status === 'completed') {
            dzikirCount = Math.max(dzikirCount, finalValue || habitMeta?.target || 33);
          }
        }
        if (habitId === 'h-sholawat' || habitMeta?.category === 'sholawat' || habitMeta?.syncSource === 'sholawat') {
          if (status === 'completed') {
            dzikirCount = Math.max(dzikirCount, finalValue || habitMeta?.target || 100);
          }
        }
        if (habitId === 'h-puasa' || habitMeta?.category === 'puasa' || habitMeta?.syncSource?.startsWith('puasa')) {
          if (status === 'completed') {
            if (fasting === 'none') {
              if (habitMeta?.fastingType && habitMeta.fastingType !== 'none') {
                fasting = habitMeta.fastingType;
              } else if (habitMeta?.syncSource?.startsWith('puasa_')) {
                fasting = habitMeta.syncSource.replace('puasa_', '') as DayRecord['fastingType'];
              } else {
                const parts = targetDate.split('-').map(Number);
                const targetD = new Date(parts[0], parts[1] - 1, parts[2]);
                const dayOfWeek = targetD.getDay(); // 1 = Senin, 4 = Kamis
                if (dayOfWeek === 1 || dayOfWeek === 4) {
                  fasting = 'senin_kamis';
                } else {
                  fasting = 'sunnah_lainnya';
                }
              }
            }
          } else if (status === 'pending' && finalValue === 0) {
            fasting = 'none';
          }
        }

        return {
          ...prev,
          [targetDate]: {
            ...currentDay,
            prayers: updatedPrayers,
            habits: updatedHabits,
            quranPagesRead: quranPages,
            quranTilawahValue: tilawahVal,
            quranTilawahUnit: tilawahUnit,
            quranTilawahTarget: (habitMeta?.category === 'quran' || habitId === 'h-quran' || habitMeta?.syncSource === 'quran') ? habitMeta?.target : currentDay.quranTilawahTarget,
            sedekahAmount: sedekah,
            totalDzikirCount: dzikirCount,
            fastingType: fasting,
          },
        };
      });

      if (status === 'completed') {
        soundController.playMilestoneChime();
      }
    },
    [habits, selectedDate]
  );

  // Set explicit Actual Value for a Habit on a given date
  const setHabitActualValue = useCallback(
    (habitId: string, actualValue: number, date?: string) => {
      const targetDate = date || selectedDate || getTodayString();
      const habitMeta = habits.find((h) => h.id === habitId);
      const target = habitMeta?.target || 1;
      const numValue = Math.max(0, Number(actualValue) || 0);
      const newStatus: 'completed' | 'pending' = numValue >= target ? 'completed' : 'pending';

      updateHabitStatus(habitId, newStatus, numValue, undefined, undefined, targetDate);
    },
    [habits, selectedDate, updateHabitStatus]
  );

  // Increment / Sum Habit Progress on a given date (supports multiple loggings with correct addition)
  const logHabitProgress = useCallback(
    (habitId: string, addedValue: number, date?: string) => {
      const targetDate = date || selectedDate || getTodayString();
      const currentDay = dayRecords[targetDate] || createEmptyDayRecord(targetDate);
      const prevVal = currentDay.habits?.[habitId]?.value || 0;
      const numAdd = Number(addedValue) || 0;
      const finalVal = Math.max(0, prevVal + numAdd);
      const habitMeta = habits.find((h) => h.id === habitId);
      const target = habitMeta?.target || 1;
      const newStatus: 'completed' | 'pending' = finalVal >= target ? 'completed' : 'pending';

      updateHabitStatus(habitId, newStatus, finalVal, undefined, undefined, targetDate);
    },
    [dayRecords, habits, selectedDate, updateHabitStatus]
  );

  // Direct Sedekah logger
  const logSedekah = useCallback(
    (amount: number, date?: string) => {
      const targetDate = date || selectedDate || getTodayString();
      const numAmount = Math.max(0, Number(amount) || 0);

      setDayRecords((prev) => {
        const cur = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
        const prevAmount = cur.sedekahAmount || 0;
        const newTotal = prevAmount + numAmount;

        const matchingSedekahHabits = habits.filter(
          (h) => h.id === 'h-sedekah' || h.category === 'sedekah' || h.syncSource === 'sedekah'
        );
        const updatedHabits = { ...cur.habits };

        matchingSedekahHabits.forEach((sHabit) => {
          const target = sHabit.target || 10000;
          updatedHabits[sHabit.id] = {
            status: newTotal >= target ? 'completed' : 'pending',
            value: newTotal,
          };
        });

        return {
          ...prev,
          [targetDate]: {
            ...cur,
            sedekahAmount: newTotal,
            habits: updatedHabits,
          },
        };
      });

      const matchingSedekahHabits = habits.filter(
        (h) => h.id === 'h-sedekah' || h.category === 'sedekah' || h.syncSource === 'sedekah'
      );
      if (matchingSedekahHabits.some((h) => numAmount >= (h.target || 10000))) {
        soundController.playMilestoneChime();
      }
    },
    [habits, selectedDate]
  );

  // Direct Quran pages logger
  const logQuranPages = useCallback(
    (amount: number, date?: string) => {
      const targetDate = date || selectedDate || getTodayString();
      const numAmount = Math.max(0, Number(amount) || 0);

      setDayRecords((prev) => {
        const cur = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
        const matchingQuranHabits = habits.filter(
          (h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran'
        );
        const primaryQuranHabit = matchingQuranHabits[0];
        const habitUnit = primaryQuranHabit?.unit || cur.quranTilawahUnit || 'halaman';
        const habitTarget = primaryQuranHabit?.target || 1;

        const prevVal = cur.habits?.[primaryQuranHabit?.id || 'h-quran']?.value ?? (cur.quranTilawahValue ?? cur.quranPagesRead ?? 0);
        const newTotal = prevVal + numAmount;

        const updatedHabits = { ...cur.habits };

        matchingQuranHabits.forEach((qHabit) => {
          const target = qHabit.target || habitTarget;
          updatedHabits[qHabit.id] = {
            status: newTotal >= target ? 'completed' : 'pending',
            value: newTotal,
            target,
            unit: habitUnit,
          };
        });

        return {
          ...prev,
          [targetDate]: {
            ...cur,
            quranPagesRead: newTotal,
            quranTilawahValue: newTotal,
            quranTilawahUnit: habitUnit,
            quranTilawahTarget: habitTarget,
            habits: updatedHabits,
          },
        };
      });

      const matchingQuranHabits = habits.filter(
        (h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran'
      );
      if (matchingQuranHabits.some((h) => numAmount >= (h.target || 1))) {
        soundController.playMilestoneChime();
      }
    },
    [habits, selectedDate]
  );

  // Add Custom Habit
  const addCustomHabit = useCallback((newHabitData: Omit<HabitItem, 'id' | 'status' | 'currentValue'> & { id?: string }) => {
    const id = newHabitData.id || `custom-h-${Date.now()}`;
    const newHabit: HabitItem = {
      ...newHabitData,
      id,
      isCustom: true,
      status: 'pending',
      currentValue: 0,
      isActive: newHabitData.isActive !== false,
      frequency: newHabitData.frequency || 'daily',
    };
    setHabits((prev) => [...prev, newHabit]);
    return id;
  }, []);

  // Update Habit (for all habits)
  const updateHabit = useCallback((id: string, updates: Partial<HabitItem>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const updateCustomHabit = updateHabit;

  // Delete Habit (for all habits)
  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const deleteCustomHabit = deleteHabit;

  // Toggle Habit Active/Inactive
  const toggleHabitActive = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isActive: h.isActive === false ? true : false } : h))
    );
  }, []);

  // Restore Default Habits
  const restoreDefaultHabits = useCallback(() => {
    setHabits((prev) => {
      const customItems = prev.filter((h) => h.isCustom);
      return [...DEFAULT_HABITS, ...customItems];
    });
  }, []);

  // Increment Dzikir counter
  const incrementDzikir = useCallback((dzikirId: string, step: number = 1, date?: string) => {
    soundController.playTasbihClick();

    const targetDate = date || selectedDate || getTodayString();
    localStorage.setItem(STORAGE_KEYS.DZIKIR_DATE, targetDate);

    const targetItem = dzikirList.find((d) => d.id === dzikirId);
    const targetCount = targetItem?.targetCount || 33;
    const itemTitle = targetItem?.title || '';
    const itemCategory = targetItem?.category || '';

    setDayRecords((prev) => {
      const currentDay = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
      const currentDzikirCounts = { ...(currentDay.dzikirCounts || {}) };
      const currentAchievements = { ...(currentDay.dzikirAchievements || {}) };

      // Base previous count strictly on actual stored count (default 0)
      const prevActualCount = typeof currentDzikirCounts[dzikirId] === 'number' ? currentDzikirCounts[dzikirId] : 0;
      const newActualCount = prevActualCount + step;
      currentDzikirCounts[dzikirId] = newActualCount;
      const newTotal = (currentDay.totalDzikirCount || 0) + step;

      // Check achievement status:
      // 1. targetCount must be positive
      // 2. Previously, count was strictly below target (< targetCount)
      // 3. Newly, count reaches or surpasses target (>= targetCount)
      // 4. Not already recorded as achieved for this dzikir on this date
      const storedMap = getStoredAchievements();
      const isAlreadyAchieved = Boolean(currentAchievements[dzikirId] || storedMap[targetDate]?.[dzikirId]);
      const isTargetNewlyReached = !isAlreadyAchieved && targetCount > 0 && prevActualCount < targetCount && newActualCount >= targetCount;

      if (isTargetNewlyReached) {
        currentAchievements[dzikirId] = true;
        saveStoredAchievement(targetDate, dzikirId, true);

        // Sound & Confetti ONLY when target is newly reached (e.g. exactly reaching 30x)
        soundController.playMilestoneChime();
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#059669', '#10B981', '#F59E0B', '#34D399'],
          });
        } catch {}
      } else if (newActualCount >= targetCount && !currentAchievements[dzikirId]) {
        // Ensure state marks it achieved if count is >= target even without refiring celebration
        currentAchievements[dzikirId] = true;
        saveStoredAchievement(targetDate, dzikirId, true);
      }

      // Sync habits
      const updatedHabits = { ...currentDay.habits };
      const titleLower = itemTitle.toLowerCase();
      const isPagi = itemCategory === 'pagi' || titleLower.includes('pagi');
      const isPetang = itemCategory === 'petang' || titleLower.includes('petang') || titleLower.includes('sore');
      const isSholawat = itemCategory === 'sholawat' || titleLower.includes('sholawat');

      if (isPagi && newActualCount >= targetCount) {
        const pagiHabit = habits.find((h) => h.id === 'h-dzikir-pagi' || h.syncSource === 'dzikir_pagi');
        const habitId = pagiHabit?.id || 'h-dzikir-pagi';
        updatedHabits[habitId] = { status: 'completed', value: 1 };
      }
      if (isPetang && newActualCount >= targetCount) {
        const petangHabit = habits.find((h) => h.id === 'h-dzikir-petang' || h.syncSource === 'dzikir_petang');
        const habitId = petangHabit?.id || 'h-dzikir-petang';
        updatedHabits[habitId] = { status: 'completed', value: 1 };
      }
      if (isSholawat) {
        const sholawatHabit = habits.find((h) => h.id === 'h-sholawat' || h.category === 'sholawat' || h.syncSource === 'sholawat');
        const habitId = sholawatHabit?.id || 'h-sholawat';
        const target = sholawatHabit?.target || 100;
        const prevVal = updatedHabits[habitId]?.value || 0;
        const currentSholawatVal = Math.max(newActualCount, prevVal + step);
        updatedHabits[habitId] = {
          status: currentSholawatVal >= target ? 'completed' : 'pending',
          value: currentSholawatVal,
        };
      }

      // Sync any general dzikir habit
      const generalHabits = habits.filter((h) => h.syncSource === 'dzikir_all');
      generalHabits.forEach((gHabit) => {
        updatedHabits[gHabit.id] = {
          status: newTotal >= gHabit.target ? 'completed' : 'pending',
          value: newTotal,
        };
      });

      // Update dzikirList immediately to reflect the actual count
      setDzikirList((prevList) =>
        prevList.map((item) => (item.id === dzikirId ? { ...item, currentCount: newActualCount } : item))
      );

      return {
        ...prev,
        [targetDate]: {
          ...currentDay,
          totalDzikirCount: newTotal,
          dzikirCounts: currentDzikirCounts,
          dzikirAchievements: currentAchievements,
          habits: updatedHabits,
        },
      };
    });
  }, [dzikirList, habits, selectedDate]);

  // Reset Dzikir count
  const resetDzikirCount = useCallback((dzikirId: string, date?: string) => {
    const targetDate = date || selectedDate || getTodayString();
    saveStoredAchievement(targetDate, dzikirId, false);

    setDzikirList((prev) =>
      prev.map((item) => (item.id === dzikirId ? { ...item, currentCount: 0 } : item))
    );
    setDayRecords((prev) => {
      if (!prev[targetDate]) return prev;
      const currentDay = prev[targetDate];
      const currentDzikirCounts = { ...(currentDay.dzikirCounts || {}) };
      const currentAchievements = { ...(currentDay.dzikirAchievements || {}) };
      const prevCount = currentDzikirCounts[dzikirId] || 0;
      delete currentDzikirCounts[dzikirId];
      delete currentAchievements[dzikirId];
      const newTotal = Math.max(0, (currentDay.totalDzikirCount || 0) - prevCount);
      return {
        ...prev,
        [targetDate]: {
          ...currentDay,
          totalDzikirCount: newTotal,
          dzikirCounts: currentDzikirCounts,
          dzikirAchievements: currentAchievements,
        },
      };
    });
  }, [selectedDate]);

  const resetDzikir = resetDzikirCount;

  // Add Custom Dzikir Manual
  const addCustomDzikir = useCallback((data: Omit<DzikirItem, 'id' | 'currentCount'>) => {
    const id = `custom-dzikir-${Date.now()}`;
    const newItem: DzikirItem = {
      ...data,
      id,
      currentCount: 0,
      isCustom: true,
      favorite: true,
    };
    setDzikirList((prev) => [newItem, ...prev]);
    setActiveDzikirId(id);
  }, []);

  // Update Dzikir (Custom or Personal Copy of Built-in)
  const updateDzikir = useCallback((id: string, updates: Partial<DzikirItem>) => {
    setDzikirList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isBuiltIn = INITIAL_DZIKIR_LIST.some((d) => d.id === id);
          return {
            ...item,
            ...updates,
            isPersonalCopy: isBuiltIn ? true : item.isPersonalCopy,
            isEdited: true,
          };
        }
        return item;
      })
    );
  }, []);

  const updateCustomDzikir = updateDzikir;

  // Delete Dzikir with confirmation & clean active fallback
  const deleteDzikir = useCallback((id: string) => {
    setDzikirList((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      return remaining;
    });
    setActiveDzikirId((current) => {
      if (current === id) {
        return dzikirList.find((d) => d.id !== id)?.id || '';
      }
      return current;
    });
  }, [dzikirList]);

  const deleteCustomDzikir = deleteDzikir;

  // Set target count without modifying progress / history
  const setDzikirTarget = useCallback((id: string, targetCount: number) => {
    const validTarget = Math.max(1, Math.floor(targetCount) || 33);
    setDzikirList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isBuiltIn = INITIAL_DZIKIR_LIST.some((d) => d.id === id);
          return {
            ...item,
            targetCount: validTarget,
            isPersonalCopy: isBuiltIn ? true : item.isPersonalCopy,
          };
        }
        return item;
      })
    );
  }, []);

  // Restore single built-in dzikir to original data
  const restoreOriginalDzikir = useCallback((id: string) => {
    const original = INITIAL_DZIKIR_LIST.find((d) => d.id === id);
    if (original) {
      setDzikirList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...original,
              currentCount: item.currentCount, // preserve existing counter!
              isPersonalCopy: false,
              isEdited: false,
            };
          }
          return item;
        })
      );
    }
  }, []);

  // Restore all default built-in dzikir
  const restoreAllDefaultDzikir = useCallback(() => {
    setDzikirList((prev) => {
      const customItems = prev.filter((item) => item.isCustom);
      const currentCountsMap = new Map<string, number>();
      prev.forEach((d) => currentCountsMap.set(d.id, d.currentCount));

      const restoredDefaults = INITIAL_DZIKIR_LIST.map((d) => ({
        ...d,
        currentCount: currentCountsMap.get(d.id) || 0,
        isPersonalCopy: false,
        isEdited: false,
      }));

      return [...restoredDefaults, ...customItems];
    });
  }, []);

  // Open Tasbih with custom / Asmaul Husna item
  const openTasbihWithCustom = useCallback((item: { title: string; textArabic?: string; textLatin?: string; arabic?: string; latin?: string; meaning: string; targetCount?: number }) => {
    const arabic = item.textArabic || item.arabic || 'سُبْحَانَ اللَّهِ';
    const latin = item.textLatin || item.latin || item.title;
    const targetCount = item.targetCount || 33;
    const existing = dzikirList.find((d) => d.title.toLowerCase() === item.title.toLowerCase());

    if (existing) {
      setActiveDzikirId(existing.id);
    } else {
      const id = `custom-dzikir-${Date.now()}`;
      const newItem: DzikirItem = {
        id,
        title: item.title,
        category: 'custom',
        textArabic: arabic,
        textLatin: latin,
        meaning: item.meaning,
        targetCount,
        currentCount: 0,
        isCustom: true,
        favorite: true,
      };
      setDzikirList((prev) => [newItem, ...prev]);
      setActiveDzikirId(id);
    }

    setActiveTab('dzikir');
  }, [dzikirList]);

  // Set Last Read Quran (without injecting fake page read counts)
  const setLastRead = useCallback((surahNumber: number, ayahNumber: number, surahName?: string, juzNumber?: number) => {
    const sName = surahName || `Surah ${surahNumber}`;
    const jNum = juzNumber || 1;
    const nowIso = new Date().toISOString();
    const todayStr = getTodayString();

    setLastReadQuran({
      surahNumber,
      surahName: sName,
      ayahNumber,
      juzNumber: jNum,
      updatedAt: nowIso,
      isSetByUser: true,
    });

    setDayRecords((prev) => {
      const currentDay = prev[todayStr] ? { ...prev[todayStr] } : createEmptyDayRecord(todayStr);
      return {
        ...prev,
        [todayStr]: {
          ...currentDay,
          quranLastRead: {
            surahNumber,
            surahName: sName,
            ayahNumber,
            juzNumber: jNum,
          },
        },
      };
    });
  }, []);

  // Toggle Quran Bookmark
  const toggleBookmark = useCallback((bookmarkData: Omit<QuranBookmark, 'id' | 'createdAt'>) => {
    setBookmarks((prev) => {
      const exists = prev.find(
        (b) => b.surahNumber === bookmarkData.surahNumber && b.ayahNumber === bookmarkData.ayahNumber
      );
      if (exists) {
        return prev.filter((b) => b.id !== exists.id);
      } else {
        const newBm: QuranBookmark = {
          ...bookmarkData,
          id: `bm-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        return [newBm, ...prev];
      }
    });
  }, []);

  // Notes CRUD
  const addNote = useCallback((noteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Update Fasting Type for a date
  const setFastingType = useCallback((type: DayRecord['fastingType'], date?: string) => {
    const targetDate = date || selectedDate || getTodayString();
    setDayRecords((prev) => {
      const currentDay = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
      const isPuasa = type !== 'none';
      const updatedHabits = { ...currentDay.habits };

      const puasaHabits = habits.filter(
        (h) => h.id === 'h-puasa' || h.category === 'puasa' || h.syncSource?.startsWith('puasa')
      );
      if (puasaHabits.length > 0) {
        puasaHabits.forEach((pHabit) => {
          const habitFType = pHabit.fastingType || (pHabit.syncSource?.startsWith('puasa_') ? pHabit.syncSource.replace('puasa_', '') : undefined);
          const isMatch = isPuasa && (!habitFType || habitFType === type || (habitFType === 'sunnah_lainnya' && type !== 'ramadhan'));
          updatedHabits[pHabit.id] = {
            status: isMatch ? 'completed' : 'pending',
            value: isMatch ? (pHabit.target || 1) : 0,
          };
        });
      } else {
        updatedHabits['h-puasa'] = {
          status: isPuasa ? 'completed' : 'pending',
          value: isPuasa ? 1 : 0,
        };
      }

      return {
        ...prev,
        [targetDate]: {
          ...currentDay,
          fastingType: type,
          habits: updatedHabits,
        },
      };
    });

    if (type !== 'none') {
      soundController.playMilestoneChime();
    }
  }, [habits, selectedDate]);

  // Update Day Journal Note for a date
  const setDayJournalNote = useCallback((note: string, date?: string) => {
    const targetDate = date || getTodayString();
    setDayRecords((prev) => {
      const currentDay = prev[targetDate] ? { ...prev[targetDate] } : createEmptyDayRecord(targetDate);
      return {
        ...prev,
        [targetDate]: {
          ...currentDay,
          journalNote: note,
        },
      };
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Real Analytics & Streak Computations without dummy floors
  const { currentStreak, longestStreak, totalPrayersCompleted, totalQuranPagesRead, totalDzikirLogged } = useMemo(() => {
    const dates = Object.keys(dayRecords).sort();
    let totalP = 0;
    let totalQ = 0;
    let totalDz = 0;

    const activeDates = new Set<string>();

    const primaryQuranHabit = habits.find(
      (h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran'
    );

    dates.forEach((dStr) => {
      const day = dayRecords[dStr];
      if (!day) return;

      const fardhuCount = day.prayers
        ? (['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'] as PrayerTimeName[]).filter(
            (pName) => day.prayers[pName]?.status === 'completed'
          ).length
      : 0;
      const anyPrayerCompleted = day.prayers
        ? Object.values(day.prayers).some((p: any) => p?.status === 'completed')
        : false;
      const completedHabitsCount = day.habits
        ? Object.values(day.habits).filter((h: any) => h?.status === 'completed' || h?.status === 'halangan').length
        : 0;

      const tilawahData = getTilawahRecord(day, primaryQuranHabit);
      const dayTilawah = tilawahData.actual || 0;

      totalP += fardhuCount;
      totalQ += dayTilawah;
      totalDz += day.totalDzikirCount || 0;

      const hasActivity =
        anyPrayerCompleted ||
        dayTilawah > 0 ||
        tilawahData.isCompleted ||
        (day.totalDzikirCount && day.totalDzikirCount > 0) ||
        (day.sedekahAmount && day.sedekahAmount > 0) ||
        (day.fastingType && day.fastingType !== 'none') ||
        completedHabitsCount > 0;

      if (hasActivity) {
        activeDates.add(dStr);
      }
    });

    // Calculate current streak counting backwards from today or yesterday
    const today = parseLocalDate(getTodayString());
    let curr = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dStr = formatLocalDate(d);

      if (activeDates.has(dStr)) {
        curr++;
      } else {
        if (i === 0) {
          // If no activity today yet, check if yesterday had activity
          continue;
        }
        break;
      }
    }

    // Longest streak
    let longest = 0;
    let tempStreak = 0;
    let prevDateObj: Date | null = null;
    const sortedActiveDates = Array.from(activeDates).sort();

    for (const dStr of sortedActiveDates) {
      const dObj = parseLocalDate(dStr);
      if (prevDateObj) {
        const diffDays = Math.round((dObj.getTime() - prevDateObj.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDateObj = dObj;
      if (tempStreak > longest) {
        longest = tempStreak;
      }
    }
    if (curr > longest) longest = curr;

    return {
      currentStreak: curr,
      longestStreak: longest,
      totalPrayersCompleted: totalP,
      totalQuranPagesRead: totalQ,
      totalDzikirLogged: totalDz,
    };
  }, [dayRecords]);

  // Export Data JSON
  const exportDataJSON = useCallback(() => {
    const exportObject = {
      appName: 'MuslimLife',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
      dayRecords,
      habits,
      dzikirList,
      bookmarks,
      notes,
      lastReadQuran,
      dzikirAchievements: getStoredAchievements(),
    };
    return JSON.stringify(exportObject, null, 2);
  }, [settings, dayRecords, habits, dzikirList, bookmarks, notes, lastReadQuran]);

  // Import Data JSON with robust validation and permanent persistence
  const importDataJSON = useCallback((jsonString: string): ImportDataResult => {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        return { success: false, message: 'Isi file cadangan kosong atau tidak dapat dibaca.' };
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        return { success: false, message: 'File rusak atau bukan format JSON yang valid.' };
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { success: false, message: 'Format struktur data cadangan tidak sesuai (harus berupa objek).' };
      }

      // Check if it contains recognized MuslimLife data
      const hasRecognizedKeys = Boolean(
        parsed.dayRecords || parsed.habits || parsed.settings || parsed.dzikirList || parsed.bookmarks || parsed.notes || parsed.lastReadQuran
      );
      if (!hasRecognizedKeys) {
        return { success: false, message: 'File tidak memuat data aplikasi MuslimLife yang valid.' };
      }

      let daysCount = 0;
      let habitsCount = 0;
      let notesCount = 0;
      let bookmarksCount = 0;

      // 1. Settings
      if (parsed.settings && typeof parsed.settings === 'object' && !Array.isArray(parsed.settings)) {
        const mergedSettings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
          prayerReminders: {
            ...DEFAULT_SETTINGS.prayerReminders,
            ...(parsed.settings.prayerReminders || {}),
          },
        };
        setSettings(mergedSettings);
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
        } catch {}
      }

      // 2. Day Records
      if (parsed.dayRecords && typeof parsed.dayRecords === 'object' && !Array.isArray(parsed.dayRecords)) {
        const sanitized = sanitizeDayRecords(parsed.dayRecords);
        daysCount = Object.keys(sanitized).length;
        setDayRecords(sanitized);
        try {
          localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(sanitized));
        } catch {}
      }

      // 3. Habits
      if (Array.isArray(parsed.habits)) {
        const validHabits: HabitItem[] = parsed.habits.filter(
          (h: any) => h && typeof h === 'object' && typeof h.id === 'string' && typeof h.title === 'string'
        );
        habitsCount = validHabits.length;
        if (habitsCount > 0) {
          setHabits(validHabits);
          try {
            localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(validHabits));
          } catch {}
        }
      }

      // 4. Dzikir List
      if (Array.isArray(parsed.dzikirList)) {
        const validDzikir: DzikirItem[] = parsed.dzikirList.filter(
          (d: any) => d && typeof d === 'object' && typeof d.id === 'string' && typeof d.title === 'string'
        );
        if (validDzikir.length > 0) {
          setDzikirList(validDzikir);
          try {
            localStorage.setItem(STORAGE_KEYS.DZIKIR, JSON.stringify(validDzikir));
          } catch {}
        }
      }

      // 5. Bookmarks
      if (Array.isArray(parsed.bookmarks)) {
        const validBookmarks = parsed.bookmarks.filter(
          (b: any) => b && typeof b === 'object' && typeof b.surahNumber === 'number' && typeof b.ayahNumber === 'number'
        );
        bookmarksCount = validBookmarks.length;
        setBookmarks(validBookmarks);
        try {
          localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(validBookmarks));
        } catch {}
      }

      // 6. Notes
      if (Array.isArray(parsed.notes)) {
        const validNotes = parsed.notes.filter(
          (n: any) => n && typeof n === 'object' && typeof n.id === 'string' && typeof n.title === 'string'
        );
        notesCount = validNotes.length;
        setNotes(validNotes);
        try {
          localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(validNotes));
        } catch {}
      }

      // 7. Last Read Quran
      if (parsed.lastReadQuran && typeof parsed.lastReadQuran === 'object') {
        const lr = parsed.lastReadQuran;
        const validLR: LastReadQuran = {
          surahNumber: Number(lr.surahNumber) || 0,
          surahName: String(lr.surahName || ''),
          ayahNumber: Number(lr.ayahNumber) || 0,
          pageNumber: lr.pageNumber ? Number(lr.pageNumber) : undefined,
          juzNumber: Number(lr.juzNumber) || 1,
          updatedAt: String(lr.updatedAt || new Date().toISOString()),
          isSetByUser: Boolean(lr.isSetByUser),
        };
        setLastReadQuran(validLR);
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(validLR));
        } catch {}
      }

      // 8. Achievements
      if (parsed.dzikirAchievements && typeof parsed.dzikirAchievements === 'object') {
        try {
          localStorage.setItem(STORAGE_KEYS.DZIKIR_ACHIEVED, JSON.stringify(parsed.dzikirAchievements));
        } catch {}
      }

      return {
        success: true,
        message: 'Data cadangan berhasil dipulihkan dengan aman dan seluruh perubahan tersimpan permanen.',
        summary: {
          daysCount,
          habitsCount,
          notesCount,
          bookmarksCount,
        },
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Gagal memproses file cadangan: ${e?.message || 'Kesalahan format'}`,
      };
    }
  }, []);

  // Reset all user data cleanly while preserving built-in application databases
  const resetAllData = useCallback(() => {
    try {
      localStorage.clear();
    } catch {}

    const cleanSettings: AppSettings = { ...DEFAULT_SETTINGS };
    const cleanRecords = generateInitialRecords();
    const cleanHabits = [...DEFAULT_HABITS];
    const cleanDzikir = [...INITIAL_DZIKIR_LIST];
    const cleanNotes: NoteItem[] = [];
    const cleanBookmarks: QuranBookmark[] = [];
    const cleanLastRead: LastReadQuran = {
      surahNumber: 0,
      surahName: '',
      ayahNumber: 0,
      juzNumber: 0,
      updatedAt: '',
      isSetByUser: false,
    };

    setSettings(cleanSettings);
    setDayRecords(cleanRecords);
    setHabits(cleanHabits);
    setDzikirList(cleanDzikir);
    setNotes(cleanNotes);
    setBookmarks(cleanBookmarks);
    setLastReadQuran(cleanLastRead);

    // Persist clean baseline immediately
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cleanSettings));
      localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(cleanRecords));
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(cleanHabits));
      localStorage.setItem(STORAGE_KEYS.DZIKIR, JSON.stringify(cleanDzikir));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(cleanNotes));
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(cleanBookmarks));
      localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(cleanLastRead));
    } catch {}
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        settings,
        updateSettings,
        prayerTimes,
        nextPrayer,
        dayRecords,
        historyRecords: dayRecords,
        todayRecord,
        selectedDayRecord,
        habits,
        dzikirList,
        activeDzikirId,
        setActiveDzikirId,
        activeTasbihDzikir,
        setActiveTasbihDzikir,
        openTasbihWithCustom,
        lastReadQuran,
        bookmarks,
        notes,
        setPrayerStatus,
        updateHabitStatus,
        setHabitActualValue,
        logHabitProgress,
        logSedekah,
        logQuranPages,
        toggleHabit: updateHabitStatus,
        addCustomHabit,
        updateCustomHabit,
        deleteCustomHabit,
        updateHabit,
        deleteHabit,
        toggleHabitActive,
        restoreDefaultHabits,
        incrementDzikir,
        resetDzikirCount,
        resetDzikir,
        addCustomDzikir,
        updateCustomDzikir,
        updateDzikir,
        deleteCustomDzikir,
        deleteDzikir,
        setDzikirTarget,
        restoreOriginalDzikir,
        restoreAllDefaultDzikir,
        setLastRead,
        toggleBookmark,
        addNote,
        updateNote,
        deleteNote,
        setFastingType,
        setDayJournalNote,
        activeQuranSurah,
        setActiveQuranSurah,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        halanganModalPrayer,
        setHalanganModalPrayer,
        currentStreak,
        longestStreak,
        totalPrayersCompleted,
        totalQuranPagesRead,
        totalDzikirLogged,
        exportDataJSON,
        importDataJSON,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
