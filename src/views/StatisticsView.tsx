import React, { useState, useMemo, useCallback } from 'react';
import {
  Flame,
  Award,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Calendar,
  Layers,
  HeartHandshake,
  Clock,
  Search,
  Check,
  UtensilsCrossed,
  ArrowRight,
  ChevronRight,
  X,
  Filter,
  TrendingUp,
  Coins,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PrayerTimeName } from '../types';
import { formatLocalDate, parseLocalDate, getTodayString } from '../utils/dateUtils';
import { getTilawahRecord, formatTilawahUnit } from '../utils/habitFormatter';

interface ActivityHistoryItem {
  id: string;
  date: string;
  dateFormatted: string;
  isToday: boolean;
  name: string;
  category: 'sholat' | 'quran' | 'dzikir' | 'sedekah' | 'puasa' | 'habit';
  status: 'completed' | 'halangan';
  statusLabel: string;
  target: string;
  actual: string;
  lastReadPosition?: string;
  note?: string;
}

const FARDHU_NAMES: PrayerTimeName[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
const FARDHU_HABIT_IDS = ['h-subuh', 'h-dzuhur', 'h-ashar', 'h-maghrib', 'h-isya'];

export type TimeRange = 'today' | 'week' | 'thisMonth' | '30days' | 'all';

export const StatisticsView: React.FC = () => {
  const {
    dayRecords,
    habits,
    lastReadQuran,
  } = useApp();

  const records = dayRecords || {};
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<string>('all');
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  // Local calendar date helper (YYYY-MM-DD)
  const formatLocalDate = useCallback((d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Today's date string in local timezone
  const todayStr = useMemo(() => formatLocalDate(new Date()), [formatLocalDate]);

  // Primary Quran habit and user-configured tilawah unit
  const quranHabit = useMemo(
    () => habits.find((h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran'),
    [habits]
  );
  const tilawahUnit = useMemo(() => formatTilawahUnit(quranHabit?.unit || 'halaman'), [quranHabit]);

  // Generate strictly ordered array of date strings for the selected period [oldest ... newest (today)]
  const dateStringsInRange = useMemo(() => {
    const today = new Date();
    const arr: string[] = [];

    if (timeRange === 'today') {
      arr.push(formatLocalDate(today));
    } else if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        arr.push(formatLocalDate(d));
      }
    } else if (timeRange === 'thisMonth') {
      const currentDay = today.getDate();
      for (let day = 1; day <= currentDay; day++) {
        const d = new Date(today.getFullYear(), today.getMonth(), day);
        arr.push(formatLocalDate(d));
      }
    } else if (timeRange === '30days') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        arr.push(formatLocalDate(d));
      }
    } else if (timeRange === 'all') {
      // Find the earliest date among all stored records or default to today
      const validDates = Object.keys(records).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
      let minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (validDates.length > 0) {
        validDates.sort();
        const earliestStr = validDates[0];
        const [ey, em, ed] = earliestStr.split('-').map(Number);
        if (!isNaN(ey) && !isNaN(em) && !isNaN(ed)) {
          const candidate = new Date(ey, em - 1, ed);
          if (candidate < minDate) {
            minDate = candidate;
          }
        }
      }

      const cur = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      while (cur <= end) {
        arr.push(formatLocalDate(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }

    return arr;
  }, [timeRange, records, formatLocalDate]);

  const daysCount = dateStringsInRange.length;

  const periodLabel = useMemo(() => {
    switch (timeRange) {
      case 'today':
        return 'hari ini';
      case 'week':
        return 'minggu ini';
      case 'thisMonth':
        return 'bulan ini';
      case '30days':
        return '30 hari';
      case 'all':
        return 'semua riwayat';
      default:
        return 'periode terpilih';
    }
  }, [timeRange]);

  const periodLabelLong = useMemo(() => {
    switch (timeRange) {
      case 'today':
        return 'Riwayat Hari Ini';
      case 'week':
        return 'Minggu Ini';
      case 'thisMonth':
        return 'Bulan Ini';
      case '30days':
        return '30 Hari Terakhir';
      case 'all':
        return 'Semua Riwayat';
      default:
        return 'Periode Terpilih';
    }
  }, [timeRange]);

  // Determine if a specific date has at least one truly completed activity
  const checkDayActive = useCallback((dStr: string) => {
    const rec = records[dStr];
    if (!rec) return false;

    // 1. Sholat fardhu completed
    if (rec.prayers && FARDHU_NAMES.some((pName) => rec.prayers[pName]?.status === 'completed')) {
      return true;
    }

    // 2. Sholat Sunnah (e.g. Dhuha) completed
    if (rec.prayers?.Dhuha?.status === 'completed') {
      return true;
    }

    // 3. Tilawah Quran logged
    const tilawah = getTilawahRecord(rec, quranHabit);
    if (tilawah.actual > 0 || tilawah.isCompleted) {
      return true;
    }

    // 4. Dzikir counter logged
    if ((rec.totalDzikirCount || 0) > 0) {
      return true;
    }

    // 5. Sedekah logged
    if ((rec.sedekahAmount || 0) > 0) {
      return true;
    }

    // 6. Puasa logged
    if (rec.fastingType && rec.fastingType !== 'none') {
      return true;
    }

    // 7. Habits completed
    if (rec.habits) {
      const hasCompletedHabit = Object.values(rec.habits).some((h: any) => h?.status === 'completed');
      if (hasCompletedHabit) return true;
    }

    return false;
  }, [records]);

  // Calculate Streak Saat Ini, Rekor Streak, and Active Days in the selected period
  const { periodCurrentStreak, periodLongestStreak, periodActiveDaysCount } = useMemo(() => {
    const len = dateStringsInRange.length;
    if (len === 0) {
      return { periodCurrentStreak: 0, periodLongestStreak: 0, periodActiveDaysCount: 0 };
    }

    const activeMap: Record<string, boolean> = {};
    let activeCount = 0;
    dateStringsInRange.forEach((dStr) => {
      const isActive = checkDayActive(dStr);
      activeMap[dStr] = isActive;
      if (isActive) activeCount++;
    });

    // Current streak (counting backwards from today or yesterday)
    let curr = 0;
    const todayActive = activeMap[dateStringsInRange[len - 1]];
    const yesterdayActive = len > 1 ? activeMap[dateStringsInRange[len - 2]] : false;

    if (todayActive) {
      curr = 1;
      for (let i = len - 2; i >= 0; i--) {
        if (activeMap[dateStringsInRange[i]]) {
          curr++;
        } else {
          break;
        }
      }
    } else if (yesterdayActive) {
      curr = 1;
      for (let i = len - 3; i >= 0; i--) {
        if (activeMap[dateStringsInRange[i]]) {
          curr++;
        } else {
          break;
        }
      }
    } else {
      curr = 0;
    }

    // Longest streak in the selected period
    let longest = 0;
    let running = 0;
    for (let i = 0; i < len; i++) {
      if (activeMap[dateStringsInRange[i]]) {
        running++;
        if (running > longest) longest = running;
      } else {
        running = 0;
      }
    }
    if (curr > longest) longest = curr;

    return {
      periodCurrentStreak: curr,
      periodLongestStreak: longest,
      periodActiveDaysCount: activeCount,
    };
  }, [dateStringsInRange, checkDayActive]);

  // Calculate Total Sholat Fardhu, Total Tilawah, Dzikir, Sedekah, Puasa, and Prayer Distribution in the selected period
  const {
    periodPrayersCompleted,
    periodQuranTilawahTotal,
    periodDzikirTotal,
    periodSedekahTotal,
    periodPuasaDays,
    prayerBreakdown,
    totalFardhuInPeriod,
  } = useMemo(() => {
    let totalPrayers = 0;
    let totalTilawah = 0;
    let totalDzikir = 0;
    let totalSedekah = 0;
    let totalPuasa = 0;

    const breakdown = [
      { name: 'Subuh', count: 0, color: '#10b981' },
      { name: 'Dzuhur', count: 0, color: '#059669' },
      { name: 'Ashar', count: 0, color: '#047857' },
      { name: 'Maghrib', count: 0, color: '#0f766e' },
      { name: 'Isya', count: 0, color: '#115e59' },
    ];

    dateStringsInRange.forEach((dStr) => {
      const rec = records[dStr];
      if (rec) {
        if (rec.prayers) {
          breakdown.forEach((p) => {
            if (rec.prayers[p.name as PrayerTimeName]?.status === 'completed') {
              p.count += 1;
              totalPrayers += 1;
            }
          });
        }
        const tRec = getTilawahRecord(rec, quranHabit);
        totalTilawah += tRec.actual;
        totalDzikir += rec.totalDzikirCount || 0;
        totalSedekah += rec.sedekahAmount || 0;
        if (rec.fastingType && rec.fastingType !== 'none') {
          totalPuasa += 1;
        }
      }
    });

    return {
      periodPrayersCompleted: totalPrayers,
      periodQuranTilawahTotal: totalTilawah,
      periodDzikirTotal: totalDzikir,
      periodSedekahTotal: totalSedekah,
      periodPuasaDays: totalPuasa,
      prayerBreakdown: breakdown,
      totalFardhuInPeriod: totalPrayers,
    };
  }, [dateStringsInRange, records, quranHabit]);

  // Consistency score strictly based on active days in the selected period
  const consistencyScore = useMemo(() => {
    if (periodActiveDaysCount === 0 || daysCount === 0) return 0;
    return Math.min(100, Math.round((periodActiveDaysCount / daysCount) * 100));
  }, [periodActiveDaysCount, daysCount]);

  // Target progress percentage in the selected period based on active habits
  const { periodProgressPercent, periodTargetAchieved, periodExpectedTargets } = useMemo(() => {
    const activeHabits = habits.filter((h) => h.isActive !== false);
    if (activeHabits.length === 0 || dateStringsInRange.length === 0) {
      return { periodProgressPercent: 0, periodTargetAchieved: 0, periodExpectedTargets: 0 };
    }

    const expected = activeHabits.length * dateStringsInRange.length;
    let achieved = 0;

    dateStringsInRange.forEach((dStr) => {
      const rec = records[dStr];
      if (!rec) return;

      activeHabits.forEach((h) => {
        const isQuran = h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran';
        if (isQuran) {
          const t = getTilawahRecord(rec, h);
          if (t.isCompleted || (t.actual > 0 && t.actual >= t.target)) achieved++;
        } else if (FARDHU_HABIT_IDS.includes(h.id)) {
          const prayerNameMap: Record<string, PrayerTimeName> = {
            'h-subuh': 'Subuh',
            'h-dzuhur': 'Dzuhur',
            'h-ashar': 'Ashar',
            'h-maghrib': 'Maghrib',
            'h-isya': 'Isya',
          };
          const pName = prayerNameMap[h.id];
          if (pName && rec.prayers?.[pName]?.status === 'completed') achieved++;
        } else if (h.id === 'h-dhuha') {
          if (rec.prayers?.Dhuha?.status === 'completed') achieved++;
        } else if (h.id === 'h-sedekah') {
          if ((rec.sedekahAmount || 0) >= (h.target || 1)) achieved++;
        } else if (h.id === 'h-puasa') {
          if (rec.fastingType && rec.fastingType !== 'none') achieved++;
        } else {
          const hRec = rec.habits?.[h.id];
          if (hRec?.status === 'completed') achieved++;
        }
      });
    });

    const percent = expected > 0 ? Math.min(100, Math.round((achieved / expected) * 100)) : 0;
    return {
      periodProgressPercent: percent,
      periodTargetAchieved: achieved,
      periodExpectedTargets: expected,
    };
  }, [habits, dateStringsInRange, records]);

  // Chart data for daily activity trend (Habit, Prayer, Udzur)
  const chartData = useMemo(() => {
    return dateStringsInRange.map((dateStr) => {
      const rec = records[dateStr];
      const d = new Date(dateStr + 'T00:00:00');
      const isMultiWeek = dateStringsInRange.length > 7;
      const dayName =
        timeRange === 'today'
          ? 'Hari Ini'
          : new Intl.DateTimeFormat('id-ID', {
              weekday: isMultiWeek ? undefined : 'short',
              day: 'numeric',
              month: isMultiWeek ? 'numeric' : undefined,
            }).format(d);

      let completedHabits = 0;
      let completedPrayers = 0;
      let halanganCount = 0;

      // Count fardhu prayers
      if (rec?.prayers) {
        FARDHU_NAMES.forEach((pName) => {
          const p = rec.prayers[pName];
          if (p?.status === 'completed') completedPrayers++;
          if (p?.status === 'halangan') halanganCount++;
        });
      }

      // Count habits excluding fardhu prayers to avoid double counting
      if (rec?.habits) {
        Object.entries(rec.habits).forEach(([hId, h]: [string, any]) => {
          if (FARDHU_HABIT_IDS.includes(hId)) return;
          if (h?.status === 'completed') completedHabits++;
          if (h?.status === 'halangan') halanganCount++;
        });
      }

      return {
        date: dateStr,
        displayDay: dayName,
        habits: completedHabits,
        prayers: completedPrayers,
        halangan: halanganCount,
        totalScore: completedHabits + completedPrayers,
      };
    });
  }, [dateStringsInRange, records]);

  // Detailed Activity History: Strictly compiles real completed activities performed by the user in the selected period
  const rawActivityHistory = useMemo<ActivityHistoryItem[]>(() => {
    const items: ActivityHistoryItem[] = [];

    // Iterate backwards so newest dates appear first
    const reversedDates = [...dateStringsInRange].reverse();

    reversedDates.forEach((dStr) => {
      const rec = records[dStr];
      if (!rec) return;

      const d = parseLocalDate(dStr);
      const dateFormatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
      const isToday = dStr === todayStr;

      // 1. Sholat Fardhu (Only completed prayers performed by user)
      if (rec.prayers) {
        FARDHU_NAMES.forEach((pName) => {
          const p = rec.prayers[pName];
          if (p && p.status === 'completed') {
            items.push({
              id: `${dStr}-prayer-${pName}`,
              date: dStr,
              dateFormatted,
              isToday,
              name: `Sholat ${pName}`,
              category: 'sholat',
              status: 'completed',
              statusLabel: p.isJamaah ? 'Selesai Berjamaah' : 'Selesai Munfarid',
              target: '1 Waktu Fardhu',
              actual: p.isJamaah ? 'Berjamaah' : 'Munfarid (Sendiri)',
              note: p.halanganNote,
            });
          }
        });

        // Sholat Sunnah (Dhuha)
        if (rec.prayers.Dhuha && rec.prayers.Dhuha.status === 'completed') {
          const dhuha = rec.prayers.Dhuha;
          items.push({
            id: `${dStr}-prayer-Dhuha`,
            date: dStr,
            dateFormatted,
            isToday,
            name: 'Sholat Dhuha',
            category: 'sholat',
            status: 'completed',
            statusLabel: 'Selesai Dikerjakan',
            target: 'Min. 2 Rakaat',
            actual: 'Terlaksana',
            note: dhuha.halanganNote,
          });
        }
      }

      // 2. Tilawah Al-Qur'an (Only when actually read / completed based on actual data)
      const tilawahRecord = getTilawahRecord(rec, quranHabit);
      if (tilawahRecord.actual > 0 || tilawahRecord.isCompleted) {
        let lastReadText = '';
        if (rec.quranLastRead?.surahNumber) {
          lastReadText = `${rec.quranLastRead.surahName} • Ayat ${rec.quranLastRead.ayahNumber}${rec.quranLastRead.juzNumber ? ` (Juz ${rec.quranLastRead.juzNumber})` : ''}`;
        } else if ((isToday || lastReadQuran?.updatedAt?.startsWith(dStr)) && lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0) {
          lastReadText = `${lastReadQuran.surahName} • Ayat ${lastReadQuran.ayahNumber} (Juz ${lastReadQuran.juzNumber})`;
        }

        const isAchieved = tilawahRecord.actual >= tilawahRecord.target;

        items.push({
          id: `${dStr}-quran`,
          date: dStr,
          dateFormatted,
          isToday,
          name: "Tilawah Al-Qur'an",
          category: 'quran',
          status: 'completed',
          statusLabel: isAchieved ? 'Target Tercapai' : 'Selesai Dibaca',
          target: `${tilawahRecord.target} ${tilawahRecord.formattedUnit}`,
          actual: `${tilawahRecord.actual}/${tilawahRecord.target} ${tilawahRecord.formattedUnit}`,
          lastReadPosition: lastReadText || undefined,
          note: rec.habits?.['h-quran']?.note || undefined,
        });
      }

      // 3. Dzikir & Tasbih (Only when dzikir was actually counted)
      if (rec.totalDzikirCount && rec.totalDzikirCount > 0) {
        const dzikirHabit = habits.find((h) => h.category === 'dzikir' || h.syncSource === 'dzikir_all');
        const dzTarget = dzikirHabit?.target || 100;
        items.push({
          id: `${dStr}-dzikir`,
          date: dStr,
          dateFormatted,
          isToday,
          name: 'Dzikir & Tasbih Harian',
          category: 'dzikir',
          status: 'completed',
          statusLabel: rec.totalDzikirCount >= dzTarget ? 'Target Tercapai' : 'Selesai Dikerjakan',
          target: `${dzTarget}x Hitungan`,
          actual: `${rec.totalDzikirCount}x Bacaan`,
        });
      }

      // 4. Sedekah & Infaq (Only when sedekah amount was actually recorded)
      if (rec.sedekahAmount && rec.sedekahAmount > 0) {
        const sedekahHabit = habits.find((h) => h.id === 'h-sedekah' || h.category === 'sedekah');
        const sTarget = sedekahHabit?.target || 10000;
        items.push({
          id: `${dStr}-sedekah`,
          date: dStr,
          dateFormatted,
          isToday,
          name: 'Sedekah & Infaq',
          category: 'sedekah',
          status: 'completed',
          statusLabel: rec.sedekahAmount >= sTarget ? 'Target Tercapai' : 'Selesai Bersedekah',
          target: `Rp ${sTarget.toLocaleString('id-ID')}`,
          actual: `Rp ${rec.sedekahAmount.toLocaleString('id-ID')}`,
        });
      }

      // 5. Puasa (Only when fasting was actually recorded)
      if (rec.fastingType && rec.fastingType !== 'none') {
        const fastingTitles: Record<string, string> = {
          senin_kamis: 'Puasa Sunnah Senin-Kamis',
          ayyamul_bidh: 'Puasa Ayyamul Bidh',
          daud: 'Puasa Daud',
          ramadhan: 'Puasa Wajib Ramadhan',
          nazar: 'Puasa Nazar',
          sunnah_lainnya: 'Puasa Sunnah',
        };
        items.push({
          id: `${dStr}-fasting`,
          date: dStr,
          dateFormatted,
          isToday,
          name: fastingTitles[rec.fastingType] || 'Puasa',
          category: 'puasa',
          status: 'completed',
          statusLabel: 'Selesai Berpuasa',
          target: '1 Hari Penuh',
          actual: 'Tuntas Hingga Berbuka',
        });
      }

      // 6. Non-duplicate and custom habits (Strictly completed activities from active/current habits)
      if (rec.habits) {
        habits.forEach((h) => {
          // Skip prayer habits already handled above from rec.prayers
          if (FARDHU_HABIT_IDS.includes(h.id)) return;
          if (h.id === 'h-dhuha') return;
          // Skip core synced habits already handled above
          if (h.id === 'h-quran' && (tilawahRecord.actual > 0 || tilawahRecord.isCompleted)) return;
          if (h.id === 'h-sedekah' && (rec.sedekahAmount || 0) > 0) return;
          if (h.id === 'h-puasa' && rec.fastingType && rec.fastingType !== 'none') return;
          if ((h.id === 'h-dzikir-pagi' || h.id === 'h-dzikir-petang') && (rec.totalDzikirCount || 0) > 0) return;

          const hRec = rec.habits[h.id];
          if (hRec && hRec.status === 'completed') {
            const actualVal = hRec.value !== undefined && hRec.value > 0 ? hRec.value : h.target;
            items.push({
              id: `${dStr}-habit-${h.id}`,
              date: dStr,
              dateFormatted,
              isToday,
              name: h.title,
              category: (h.category as any) || 'habit',
              status: 'completed',
              statusLabel: actualVal >= h.target ? 'Target Tercapai' : 'Selesai Dikerjakan',
              target: `${h.target} ${h.unit}`,
              actual: `${actualVal} ${h.unit}`,
              note: hRec.note,
            });
          }
        });
      }
    });

    return items;
  }, [dateStringsInRange, records, todayStr, habits, lastReadQuran, quranHabit]);

  // Summary list (compact top items for the main page)
  const compactSummaryItems = useMemo(() => {
    return rawActivityHistory.slice(0, 5);
  }, [rawActivityHistory]);

  // Counts per category for modal filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: rawActivityHistory.length,
      sholat: 0,
      quran: 0,
      dzikir: 0,
      sedekah: 0,
      puasa: 0,
      habit: 0,
    };
    rawActivityHistory.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, [rawActivityHistory]);

  // Filtered Activity History for the Detail Modal
  const modalFilteredHistory = useMemo(() => {
    return rawActivityHistory.filter((item) => {
      if (modalCategoryFilter !== 'all' && item.category !== modalCategoryFilter) {
        return false;
      }
      if (modalSearchQuery.trim() !== '') {
        const q = modalSearchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.actual.toLowerCase().includes(q) ||
          item.dateFormatted.toLowerCase().includes(q) ||
          (item.note && item.note.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rawActivityHistory, modalCategoryFilter, modalSearchQuery]);

  // Group filtered history by date for modal
  const modalGroupedHistory = useMemo(() => {
    const groups: { date: string; dateFormatted: string; isToday: boolean; items: ActivityHistoryItem[] }[] = [];
    modalFilteredHistory.forEach((item) => {
      let grp = groups.find((g) => g.date === item.date);
      if (!grp) {
        grp = {
          date: item.date,
          dateFormatted: item.dateFormatted,
          isToday: item.isToday,
          items: [],
        };
        groups.push(grp);
      }
      grp.items.push(item);
    });
    return groups;
  }, [modalFilteredHistory]);

  return (
    <div className="space-y-6 pb-20 lg:pb-10" id="statistics-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Riwayat & Statistik Ibadah
          </h2>
          <p className="text-xs text-slate-500">
            Laporan analitik konsistensi, grafik perkembangan & pencapaian istiqomah
          </p>
        </div>

        {/* Range filter */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex-wrap">
          <button
            type="button"
            onClick={() => setTimeRange('today')}
            id="btn-range-today"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === 'today'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            id="btn-range-week"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === 'week'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('thisMonth')}
            id="btn-range-thisMonth"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === 'thisMonth'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30days')}
            id="btn-range-30days"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === '30days'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            id="btn-range-all"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Essential Statistics: Total Aktivitas, Progress, Streak, Konsistensi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* 1. Total Aktivitas Ibadah */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Aktivitas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono block">
            {rawActivityHistory.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            Amalan ({periodLabel})
          </span>
        </div>

        {/* 2. Progress Target */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Progress Ibadah</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-extrabold text-teal-700 font-mono block">
            {periodProgressPercent}%
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {periodTargetAchieved} dari {periodExpectedTargets} target
          </span>
        </div>

        {/* 3. Streak Saat Ini */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Streak Ibadah</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-800 font-mono block">
            {periodCurrentStreak} Hari
          </span>
          <span className="text-[11px] text-amber-600 font-medium block">
            Rekor: {periodLongestStreak} Hari
          </span>
        </div>

        {/* 4. Skor Konsistensi */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Skor Konsistensi</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-700 font-mono block">
            {consistencyScore}%
          </span>
          <span className="text-[11px] text-emerald-700 font-medium block">
            {periodActiveDaysCount === 0
              ? 'Belum ada aktivitas'
              : `${periodActiveDaysCount} dari ${daysCount} hari aktif`}
          </span>
        </div>
      </div>

      {/* Ringkasan Aktivitas Sesuai Data Yang Benar-benar Tersimpan */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Ringkasan Aktivitas Ibadah ({periodLabelLong})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Sumber Data: Kalender & Catatan Nyata
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Sholat 5 Waktu */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-[11px] text-slate-500 font-medium block">Sholat Fardhu</span>
            <span className="text-lg font-bold text-emerald-800 font-mono block mt-0.5">
              {periodPrayersCompleted}x
            </span>
            <span className="text-[10px] text-slate-400">5 Waktu Utama</span>
          </div>

          {/* Tilawah Al-Qur'an */}
          <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
            <span className="text-[11px] text-slate-500 font-medium block">Tilawah Qur'an</span>
            <span className="text-lg font-bold text-teal-800 font-mono block mt-0.5">
              {timeRange === 'today' && quranHabit?.target
                ? `${periodQuranTilawahTotal}/${quranHabit.target} ${tilawahUnit}`
                : `${periodQuranTilawahTotal} ${tilawahUnit}`}
            </span>
            <span className="text-[10px] text-slate-500 truncate block">
              {lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0
                ? `${lastReadQuran.surahName} : ${lastReadQuran.ayahNumber}`
                : 'Satuan Dinamis'}
            </span>
          </div>

          {/* Dzikir & Tasbih */}
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[11px] text-slate-500 font-medium block">Dzikir & Tasbih</span>
            <span className="text-lg font-bold text-indigo-800 font-mono block mt-0.5">
              {periodDzikirTotal}x
            </span>
            <span className="text-[10px] text-slate-400">Hitungan Wirid</span>
          </div>

          {/* Sedekah */}
          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
            <span className="text-[11px] text-slate-500 font-medium block">Sedekah & Infaq</span>
            <span className="text-lg font-bold text-amber-800 font-mono block mt-0.5">
              Rp {periodSedekahTotal.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-400">Tercatat Nyata</span>
          </div>

          {/* Puasa */}
          <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 font-medium block">Puasa</span>
            <span className="text-lg font-bold text-rose-800 font-mono block mt-0.5">
              {periodPuasaDays} Hari
            </span>
            <span className="text-[10px] text-slate-400">Sunnah / Wajib</span>
          </div>
        </div>
      </div>

      {/* Main Charts: Activity Trend + Prayer Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Grafik Aktivitas Ibadah Harian</h3>
              <p className="text-xs text-slate-500">
                Jumlah habit kebaikan dan sholat fardhu yang terselesaikan ({periodLabelLong})
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="displayDay"
                  stroke="#94a3b8"
                  fontSize={dateStringsInRange.length > 14 ? 9 : 11}
                  tickLine={false}
                  interval={dateStringsInRange.length > 20 ? 2 : dateStringsInRange.length > 10 ? 1 : 0}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="habits" name="Habit Selesai" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="prayers" name="Sholat Fardhu" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="halangan" name="Udzur Syar'i" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-600 font-medium">Habit Kebaikan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-600" />
              <span className="text-slate-600 font-medium">Sholat Fardhu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">Udzur Syar'i</span>
            </div>
          </div>
        </div>

        {/* Prayer Distribution Pie (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Distribusi Sholat 5 Waktu</h3>
            <p className="text-xs text-slate-500">
              Frekuensi sholat fardhu dalam {periodLabel}
            </p>
          </div>

          {totalFardhuInPeriod === 0 ? (
            <div className="h-48 w-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-slate-300" />
              </div>
              <span className="text-xs font-bold text-slate-600">Belum Ada Sholat Tercatat</span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                dalam {periodLabel}
              </span>
            </div>
          ) : (
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prayerBreakdown.filter((p) => p.count > 0)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {prayerBreakdown
                      .filter((p) => p.count > 0)
                      .map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value}x (${Math.round((Number(value) / totalFardhuInPeriod) * 100)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {prayerBreakdown.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-700 font-medium">{p.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">{p.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Activity History Summary with "Lihat Semua Detail" button */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4" id="history-activity-section">
        {/* Section Header with Right-Side Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Riwayat Aktivitas Ibadah</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                {rawActivityHistory.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan catatan amal terbaru pada periode {periodLabel}
            </p>
          </div>

          {/* "Lihat Semua Detail" Button */}
          <button
            type="button"
            onClick={() => {
              setModalSearchQuery('');
              setModalCategoryFilter('all');
              setShowDetailModal(true);
            }}
            id="btn-view-all-history-details"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs group self-start sm:self-auto cursor-pointer"
          >
            <span>Lihat Semua Detail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Compact Summary List (Max 5 Recent Activities) */}
        {compactSummaryItems.length === 0 ? (
          <div className="py-6 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200" id="empty-state-history">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-xs">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">Belum ada aktivitas ibadah yang tercatat.</h4>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {compactSummaryItems.map((item) => {
                const isHalangan = item.status === 'halangan';

                let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let categoryBadge = 'bg-slate-100 text-slate-600';
                let icon = <Check className="w-3.5 h-3.5" />;

                if (item.category === 'sholat') {
                  categoryBadge = 'bg-teal-50 text-teal-700 border-teal-200/60';
                } else if (item.category === 'quran') {
                  categoryBadge = 'bg-teal-50 text-teal-700 border-teal-200/60';
                } else if (item.category === 'dzikir') {
                  categoryBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
                } else if (item.category === 'sedekah') {
                  categoryBadge = 'bg-amber-50 text-amber-700 border-amber-200/60';
                } else if (item.category === 'puasa') {
                  categoryBadge = 'bg-rose-50 text-rose-700 border-rose-200/60';
                }

                if (isHalangan) {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  icon = <ShieldAlert className="w-3.5 h-3.5" />;
                }

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    {/* Left: Date, Name, Category */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500">
                          {item.dateFormatted}
                        </span>
                        {item.isToday && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Hari Ini
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wide ${categoryBadge}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.lastReadPosition && (
                        <p className="text-[11px] text-teal-800 font-semibold flex items-center gap-1 mt-0.5">
                          <BookOpen className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>Terakhir dibaca: {item.lastReadPosition}</span>
                        </p>
                      )}
                      {item.note && !item.lastReadPosition && (
                        <p className="text-[10px] text-slate-500 italic truncate max-w-md">
                          Catatan: {item.note}
                        </p>
                      )}
                    </div>

                    {/* Right: Actual Result & Status */}
                    <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                      <div className="text-right text-xs">
                        <span className="text-[10px] text-slate-400 block sm:inline sm:mr-2">
                          Target: {item.target}
                        </span>
                        <span className="font-bold font-mono text-slate-800">
                          Aktual: <span className={isHalangan ? 'text-rose-600' : 'text-emerald-700'}>{item.actual}</span>
                        </span>
                      </div>

                      <div
                        className={`px-2 py-0.8 rounded-lg text-[11px] font-semibold border flex items-center gap-1 whitespace-nowrap ${badgeColor}`}
                      >
                        {icon}
                        <span>{item.statusLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary link */}
            {rawActivityHistory.length > 5 && (
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalSearchQuery('');
                    setModalCategoryFilter('all');
                    setShowDetailModal(true);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer py-1"
                >
                  <span>Menampilkan 5 dari {rawActivityHistory.length} aktivitas tersimpan. Klik untuk lihat semua</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dedicated Full Detail Panel / Modal */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          id="modal-full-history-details"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetailModal(false);
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                      Seluruh Riwayat Aktivitas Ibadah
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rincian lengkap amalan, status, target, dan hasil aktual periode {periodLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                id="btn-close-history-modal"
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Filter Toolbar */}
            <div className="p-4 sm:px-6 border-b border-slate-100 bg-white space-y-3">
              {/* Search & Stats Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Cari aktivitas, jenis amal, atau catatan..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    id="input-modal-search"
                  />
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Menampilkan:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono font-bold">
                    {modalFilteredHistory.length} dari {rawActivityHistory.length} Catatan
                  </span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'Semua', count: categoryCounts.all },
                  { id: 'sholat', label: 'Sholat', count: categoryCounts.sholat },
                  { id: 'quran', label: "Al-Qur'an", count: categoryCounts.quran },
                  { id: 'dzikir', label: 'Dzikir', count: categoryCounts.dzikir },
                  { id: 'sedekah', label: 'Sedekah', count: categoryCounts.sedekah },
                  { id: 'puasa', label: 'Puasa', count: categoryCounts.puasa },
                  { id: 'habit', label: 'Habit Lain', count: categoryCounts.habit },
                ].map((cat) => {
                  const isActive = modalCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setModalCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Complete Grouped History */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {modalGroupedHistory.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">
                    {modalSearchQuery ? 'Tidak Ada Aktivitas Ditemukan' : 'Belum ada aktivitas ibadah yang tercatat.'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    {modalSearchQuery
                      ? `Tidak ada catatan yang cocok dengan kata kunci "${modalSearchQuery}".`
                      : 'Aktivitas yang Anda selesaikan di Jadwal Sholat, Al-Qur’an, Dzikir, atau Habit Ibadah akan otomatis tampil di sini.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalGroupedHistory.map((group) => (
                    <div key={group.date} className="space-y-2.5">
                      {/* Date Header */}
                      <div className="sticky top-0 z-10 py-2 px-3.5 rounded-2xl bg-slate-100/90 backdrop-blur-xs border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{group.dateFormatted}</span>
                          {group.isToday && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Hari Ini
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 font-mono">
                          {group.items.length} aktivitas
                        </span>
                      </div>

                      {/* Items in this date */}
                      <div className="grid grid-cols-1 gap-2 pl-1 sm:pl-2">
                        {group.items.map((item) => {
                          const isHalangan = item.status === 'halangan';

                          let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          let categoryBadge = 'bg-slate-100 text-slate-600';
                          let icon = <Check className="w-3.5 h-3.5" />;

                          if (item.category === 'sholat') {
                            categoryBadge = 'bg-teal-50 text-teal-700 border-teal-200/60';
                          } else if (item.category === 'quran') {
                            categoryBadge = 'bg-teal-50 text-teal-700 border-teal-200/60';
                          } else if (item.category === 'dzikir') {
                            categoryBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
                          } else if (item.category === 'sedekah') {
                            categoryBadge = 'bg-amber-50 text-amber-700 border-amber-200/60';
                          } else if (item.category === 'puasa') {
                            categoryBadge = 'bg-rose-50 text-rose-700 border-rose-200/60';
                          }

                          if (isHalangan) {
                            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                            icon = <ShieldAlert className="w-3.5 h-3.5" />;
                          }

                          return (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              {/* Left: Info */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-800">{item.name}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${categoryBadge}`}
                                  >
                                    {item.category}
                                  </span>
                                </div>
                                {item.lastReadPosition && (
                                  <p className="text-xs text-teal-800 font-semibold flex items-center gap-1.5 mt-0.5">
                                    <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>Terakhir dibaca: {item.lastReadPosition}</span>
                                  </p>
                                )}
                                {item.note && !item.lastReadPosition && (
                                  <p className="text-[11px] text-slate-500 italic">
                                    Catatan: {item.note}
                                  </p>
                                )}
                              </div>

                              {/* Right: Target, Actual, Status */}
                              <div className="flex items-center gap-4 self-end sm:self-center flex-wrap">
                                <div className="text-right text-xs">
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    Target: <span className="font-mono text-slate-600">{item.target}</span>
                                  </div>
                                  <div className="font-bold font-mono text-slate-800">
                                    Aktual: <span className={isHalangan ? 'text-rose-600' : 'text-emerald-700'}>{item.actual}</span>
                                  </div>
                                </div>

                                <div
                                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 whitespace-nowrap ${badgeColor}`}
                                >
                                  {icon}
                                  <span>{item.statusLabel}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Data tersinkronisasi langsung dari database lokal aplikasi Anda
              </span>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
