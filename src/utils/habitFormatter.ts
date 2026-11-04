import { DayRecord, HabitItem, PrayerTimeName } from '../types';

/**
 * Helper utilities for formatting and calculating Habit values, targets, and units
 */

export const STANDARD_HABIT_UNITS = [
  { id: 'kali', label: 'Kali (x)', defaultTarget: 33 },
  { id: 'halaman', label: 'Halaman (Hal)', defaultTarget: 20 },
  { id: 'ayat', label: 'Ayat', defaultTarget: 50 },
  { id: 'juz', label: 'Juz', defaultTarget: 1 },
  { id: 'menit', label: 'Menit', defaultTarget: 15 },
  { id: 'rupiah', label: 'Rupiah (Rp)', defaultTarget: 20000 },
  { id: 'hari', label: 'Hari', defaultTarget: 1 },
  { id: 'rakaat', label: 'Rakaat', defaultTarget: 2 },
  { id: 'waktu', label: 'Waktu Sholat', defaultTarget: 1 },
  { id: 'sesi', label: 'Sesi', defaultTarget: 1 },
  { id: 'custom', label: 'Satuan Custom...', defaultTarget: 1 },
];

export function parseCleanNumber(input: string | number | undefined | null): number {
  if (input === undefined || input === null) return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  const str = String(input).trim();
  if (!str) return 0;
  
  // Remove currency prefix if typed by user
  const cleanStr = str.replace(/^Rp\.?\s*/i, '').trim();
  
  // If Indonesian thousand format e.g. "10.000" or "10.500" or "1.000.000" (three digits per dot group)
  if (/^\d{1,3}(\.\d{3})+$/.test(cleanStr)) {
    return Number(cleanStr.replace(/\./g, '')) || 0;
  }
  // If English thousand format e.g. "10,000" or "50,000"
  if (/^\d{1,3}(,\d{3})+$/.test(cleanStr)) {
    return Number(cleanStr.replace(/,/g, '')) || 0;
  }
  // Standard decimal format e.g. "10.5" or "10,5"
  const normalized = cleanStr.replace(/,/g, '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function isCurrencyUnit(unit?: string): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase().trim();
  return u === 'rupiah' || u === 'rp' || u === 'idr' || u.includes('rupiah') || u.startsWith('rp');
}

export function formatHabitValue(value: number | undefined, unit: string | undefined): string {
  const val = Math.max(0, Number(value) || 0);
  if (isCurrencyUnit(unit)) {
    return `Rp ${val.toLocaleString('id-ID')}`;
  }
  return `${val.toLocaleString('id-ID')} ${unit || 'kali'}`;
}

export function formatHabitProgressText(actual: number | undefined, target: number | undefined, unit: string | undefined): string {
  const act = Math.max(0, Number(actual) || 0);
  const tgt = Math.max(1, Number(target) || 1);

  if (isCurrencyUnit(unit)) {
    return `Rp ${act.toLocaleString('id-ID')} / Rp ${tgt.toLocaleString('id-ID')}`;
  }
  return `${act.toLocaleString('id-ID')} / ${tgt.toLocaleString('id-ID')} ${unit || 'kali'}`;
}

export function formatTilawahUnit(unit?: string): string {
  if (!unit) return 'Halaman';
  const u = unit.trim().toLowerCase();
  if (u === 'juz') return 'Juz';
  if (u === 'ayat') return 'Ayat';
  if (u === 'halaman' || u === 'hal') return 'Halaman';
  if (u === 'menit') return 'Menit';
  if (u === 'lembar') return 'Lembar';
  if (u === 'surah') return 'Surah';
  if (u === 'kali' || u === 'x') return 'Kali';
  return unit.charAt(0).toUpperCase() + unit.slice(1);
}

export interface TilawahData {
  actual: number;
  target: number;
  unit: string;
  formattedUnit: string;
  status: 'completed' | 'pending' | 'halangan';
  isCompleted: boolean;
  displayText: string;
  progressText: string;
  lastReadPosition?: string;
}

export function getTilawahRecord(
  dayRecord: DayRecord | undefined,
  quranHabit: HabitItem | undefined
): TilawahData {
  const habitId = quranHabit?.id || 'h-quran';
  const hRec = dayRecord?.habits?.[habitId];
  const unit = (hRec as any)?.unit || dayRecord?.quranTilawahUnit || quranHabit?.unit || 'halaman';
  const formattedUnit = formatTilawahUnit(unit);
  const target = Math.max(1, (hRec as any)?.target || dayRecord?.quranTilawahTarget || quranHabit?.target || 1);

  let actual = 0;
  let status: 'completed' | 'pending' | 'halangan' = 'pending';

  if (hRec) {
    actual = typeof hRec.value === 'number' ? Math.max(0, hRec.value) : 0;
    status = hRec.status || (actual >= target ? 'completed' : 'pending');
  } else if (typeof dayRecord?.quranTilawahValue === 'number') {
    actual = Math.max(0, dayRecord.quranTilawahValue);
    status = actual >= target ? 'completed' : 'pending';
  } else if (typeof dayRecord?.quranPagesRead === 'number' && dayRecord.quranPagesRead > 0) {
    actual = Math.max(0, dayRecord.quranPagesRead);
    status = actual >= target ? 'completed' : 'pending';
  }

  let lastReadPosition: string | undefined = undefined;
  if (dayRecord?.quranLastRead?.surahNumber) {
    lastReadPosition = `${dayRecord.quranLastRead.surahName} • Ayat ${dayRecord.quranLastRead.ayahNumber}${dayRecord.quranLastRead.juzNumber ? ` (Juz ${dayRecord.quranLastRead.juzNumber})` : ''}`;
  }

  const isCompleted = status === 'completed';
  const progressText = `${actual}/${target} ${formattedUnit}`;
  const displayText = `${actual} ${formattedUnit}`;

  return {
    actual,
    target,
    unit,
    formattedUnit,
    status,
    isCompleted,
    displayText,
    progressText,
    lastReadPosition,
  };
}

export interface HabitStatusResult {
  isCompleted: boolean;
  isHalangan: boolean;
  halanganReasonText: string;
  actualVal: number;
  targetVal: number;
  unitVal: string;
  rawRec: { status: 'completed' | 'pending' | 'halangan'; value: number; halanganReason?: string; note?: string };
}

export function getHabitStatusData(h: HabitItem, dayRecord: DayRecord | undefined): HabitStatusResult {
  const isQuran = h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran';
  const tilawahRec = isQuran ? getTilawahRecord(dayRecord, h) : null;
  const rawRec = dayRecord?.habits?.[h.id] || { status: 'pending', value: 0 };

  const prayerNameMap: Record<string, PrayerTimeName> = {
    'h-subuh': 'Subuh',
    'h-dzuhur': 'Dzuhur',
    'h-ashar': 'Ashar',
    'h-maghrib': 'Maghrib',
    'h-isya': 'Isya',
    'h-dhuha': 'Dhuha',
  };
  const prayerName = prayerNameMap[h.id] || (h.syncSource?.startsWith('prayer_') ? (h.syncSource.replace('prayer_', '').charAt(0).toUpperCase() + h.syncSource.replace('prayer_', '').slice(1) as PrayerTimeName) : undefined);
  const prayerRec = prayerName ? dayRecord?.prayers?.[prayerName] : undefined;

  let isCompleted = rawRec.status === 'completed';
  let isHalangan = rawRec.status === 'halangan';
  let halanganReason = rawRec.halanganReason;
  let actualVal = rawRec.value || 0;
  let targetVal = h.target || 1;
  let unitVal = h.unit || 'kali';

  if (tilawahRec) {
    isCompleted = tilawahRec.isCompleted;
    if (tilawahRec.status === 'halangan') isHalangan = true;
    actualVal = tilawahRec.actual;
    targetVal = tilawahRec.target;
    unitVal = tilawahRec.formattedUnit;
  } else if (prayerRec) {
    if (prayerRec.status === 'completed') isCompleted = true;
    if (prayerRec.status === 'halangan') {
      isHalangan = true;
      halanganReason = prayerRec.halanganReason || halanganReason || 'haid';
    }
  } else if (h.id === 'h-sedekah') {
    if ((dayRecord?.sedekahAmount || 0) >= (h.target || 1)) isCompleted = true;
    if ((dayRecord?.sedekahAmount || 0) > 0) actualVal = dayRecord!.sedekahAmount!;
  } else if (h.id === 'h-puasa' || h.category === 'puasa' || h.syncSource?.startsWith('puasa')) {
    const habitFastingType = h.fastingType || (h.syncSource?.startsWith('puasa_') ? h.syncSource.replace('puasa_', '') : undefined);
    if (dayRecord?.fastingType && dayRecord.fastingType !== 'none') {
      if (!habitFastingType || habitFastingType === dayRecord.fastingType || (habitFastingType === 'sunnah_lainnya' && dayRecord.fastingType !== 'ramadhan')) {
        isCompleted = true;
        actualVal = Math.max(actualVal, h.target || 1);
      }
    }
  }

  const reasonKey = (halanganReason || 'haid').toLowerCase();
  const halanganReasonText =
    reasonKey === 'haid'
      ? 'Haid'
      : reasonKey === 'nifas'
      ? 'Nifas'
      : reasonKey === 'sakit'
      ? 'Sakit'
      : reasonKey === 'safar'
      ? 'Safar'
      : reasonKey === 'ketiduran'
      ? 'Ketiduran'
      : reasonKey.charAt(0).toUpperCase() + reasonKey.slice(1);

  return {
    isCompleted,
    isHalangan,
    halanganReasonText,
    actualVal,
    targetVal,
    unitVal,
    rawRec,
  };
}

