import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  Clock,
  BookOpen,
  Heart,
  Flame,
  ShieldAlert,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Info,
  Check,
  RotateCcw,
  Filter,
  Layers,
  Star,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ISLAMIC_EVENTS, HIJRI_MONTHS, getHijriDate, isMondayOrThursday } from '../data/islamicCalendar';
import { PrayerTimeName, PrayerStatus, DayRecord, NoteItem } from '../types';
import { AddNoteModal } from '../components/modals/AddNoteModal';
import { soundController } from '../utils/soundEffects';
import {
  formatHabitProgressText,
  formatHabitValue,
  getTilawahRecord,
  formatTilawahUnit,
  getHabitStatusData,
} from '../utils/habitFormatter';

type ViewStage = 'calendar' | 'detail';

// Helper for timezone-safe date parsing
const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

const formatDateToString = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const CalendarView: React.FC = () => {
  const {
    dayRecords,
    selectedDate,
    setSelectedDate,
    setActiveTab,
    prayerTimes,
    setPrayerStatus,
    setFastingType,
    setDayJournalNote,
    notes,
    deleteNote,
    habits,
    updateHabitStatus,
    logHabitProgress,
  } = useApp();

  const quranHabit = habits.find((h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran');

  // 2-Stage Navigation: 'calendar' (Tahap 1: Kalender Penuh) | 'detail' (Tahap 2: Detail Tanggal)
  const [viewStage, setViewStage] = useState<ViewStage>('calendar');

  // Month navigation state - preserved when going back and forth
  const [currentYear, setCurrentYear] = useState(() => {
    const d = parseLocalDate(selectedDate);
    return d.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = parseLocalDate(selectedDate);
    return d.getMonth(); // 0-indexed (0 = Januari, 11 = Desember)
  });

  // Filter / View for Islamic Events in Stage 1
  const [isEventsExpanded, setIsEventsExpanded] = useState<boolean>(true);
  const [eventsFilter, setEventsFilter] = useState<'month' | 'all'>('month');

  // Note Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const records = dayRecords || {};

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    const todayStr = formatDateToString(now);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Generate calendar days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Hijri Month range for current Gregorian month header
  const startMonthHijri = useMemo(() => {
    return getHijriDate(new Date(currentYear, currentMonth, 1));
  }, [currentYear, currentMonth]);

  const endMonthHijri = useMemo(() => {
    return getHijriDate(new Date(currentYear, currentMonth, daysInMonth));
  }, [currentYear, currentMonth, daysInMonth]);

  const hijriMonthHeader = useMemo(() => {
    if (startMonthHijri.month === endMonthHijri.month) {
      return `${startMonthHijri.monthName} ${startMonthHijri.year} H`;
    }
    return `${startMonthHijri.monthName} - ${endMonthHijri.monthName} ${endMonthHijri.year} H`;
  }, [startMonthHijri, endMonthHijri]);

  // Click on a date in Stage 1 -> Open Stage 2 (Detail)
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    const parsed = parseLocalDate(dateString);
    setCurrentYear(parsed.getFullYear());
    setCurrentMonth(parsed.getMonth());
    setViewStage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to Stage 1 (Calendar) - retains currentYear, currentMonth & selectedDate
  const handleBackToCalendar = () => {
    setViewStage('calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stage 2: Next / Prev Date Navigation
  const handlePrevDay = () => {
    const curr = parseLocalDate(selectedDate);
    curr.setDate(curr.getDate() - 1);
    const newDateStr = formatDateToString(curr);
    setSelectedDate(newDateStr);
    setCurrentYear(curr.getFullYear());
    setCurrentMonth(curr.getMonth());
  };

  const handleNextDay = () => {
    const curr = parseLocalDate(selectedDate);
    curr.setDate(curr.getDate() + 1);
    const newDateStr = formatDateToString(curr);
    setSelectedDate(newDateStr);
    setCurrentYear(curr.getFullYear());
    setCurrentMonth(curr.getMonth());
  };

  // Selected Day Data for Stage 2
  const activeRecord: DayRecord | undefined = records[selectedDate];
  const activeHijri = useMemo(() => {
    return getHijriDate(parseLocalDate(selectedDate));
  }, [selectedDate]);

  const isToday = useMemo(() => {
    const todayStr = formatDateToString(new Date());
    return selectedDate === todayStr;
  }, [selectedDate]);

  const selectedDateObj = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const isSelectedSunnahFasting = useMemo(() => {
    const dayOfWeek = selectedDateObj.getDay();
    return dayOfWeek === 1 || dayOfWeek === 4 || activeHijri.isAyyamulBidh || activeHijri.event?.recommendedFasting;
  }, [selectedDateObj, activeHijri]);

  // Notes matching selected date
  const dateNotes = useMemo(() => {
    return notes.filter((n) => n.date === selectedDate);
  }, [notes, selectedDate]);

  // Handle Quick Prayer Status Toggle in Detail View
  const handleTogglePrayer = (prayer: PrayerTimeName) => {
    const currentStatus = activeRecord?.prayers?.[prayer]?.status || 'pending';
    let newStatus: PrayerStatus = 'completed';
    if (currentStatus === 'completed') {
      newStatus = 'pending';
    } else if (currentStatus === 'pending') {
      newStatus = 'completed';
    }

    setPrayerStatus(prayer, newStatus, {
      date: selectedDate,
      isJamaah: newStatus === 'completed' ? true : undefined,
    });
  };

  // Handle Fasting Type Toggle
  const handleSelectFastingType = (type: DayRecord['fastingType']) => {
    setFastingType(type, selectedDate);
  };

  // Islamic Events filtered for Month vs All
  const displayedEvents = useMemo(() => {
    if (eventsFilter === 'all') {
      return ISLAMIC_EVENTS;
    }
    // Filter events that fall in the current Hijri months
    const startM = String(startMonthHijri.month).padStart(2, '0');
    const endM = String(endMonthHijri.month).padStart(2, '0');
    return ISLAMIC_EVENTS.filter((ev) => {
      const [m] = ev.dateHijri.split('-');
      return m === startM || m === endM;
    });
  }, [eventsFilter, startMonthHijri, endMonthHijri]);

  // Habit completed count
  const habitCompletedCount = useMemo(() => {
    if (!activeRecord?.habits) return 0;
    const activeHabitIds = new Set(habits.filter((h) => h.isActive !== false).map((h) => h.id));
    return Object.entries(activeRecord.habits).filter(
      ([id, h]: [string, any]) => activeHabitIds.has(id) && h?.status === 'completed'
    ).length;
  }, [activeRecord, habits]);

  // Fardhu Prayers completed count
  const completedFardhuPrayersCount = useMemo(() => {
    const fardhuList: PrayerTimeName[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
    if (!activeRecord?.prayers) return 0;
    return fardhuList.filter((p) => activeRecord.prayers[p]?.status === 'completed').length;
  }, [activeRecord]);

  const FASTING_OPTIONS: { id: DayRecord['fastingType']; label: string; icon: any; color: string }[] = [
    { id: 'none', label: 'Tidak Berpuasa', icon: Moon, color: 'text-slate-500 bg-slate-100' },
    { id: 'senin_kamis', label: 'Puasa Sunnah Senin / Kamis', icon: Sun, color: 'text-amber-800 bg-amber-50 border-amber-200' },
    { id: 'ayyamul_bidh', label: 'Puasa Ayyamul Bidh (13-15)', icon: Star, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
    { id: 'ramadhan', label: 'Puasa Wajib Ramadhan', icon: Sparkles, color: 'text-emerald-900 bg-emerald-100 border-emerald-300' },
    { id: 'daud', label: 'Puasa Daud', icon: RotateCcw, color: 'text-teal-800 bg-teal-50 border-teal-200' },
    { id: 'nazar', label: 'Puasa Qadha / Nazar', icon: Heart, color: 'text-purple-800 bg-purple-50 border-purple-200' },
    { id: 'sunnah_lainnya', label: "Puasa Sunnah Lainnya (Arafah, Asyura, dll)", icon: Sparkles, color: 'text-amber-900 bg-amber-100 border-amber-300' },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-12 text-slate-800" id="calendar-view-root">
      {/* Note Modal for adding/editing notes for selected date */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        editingNote={editingNote}
        defaultDate={selectedDate}
      />

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAHAP 1: KALENDER UTAMA HIJRIYAH & MASEHI (COMPACT, FULL-WIDTH FOCUS)     */}
        {/* ========================================================================= */}
        {viewStage === 'calendar' && (
          <motion.div
            key="calendar-stage-main"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Kalender Ibadah
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Hijriyah & Masehi
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tanggal untuk melihat rincian ibadah harian, sholat 5 waktu, catatan, dan puasa
                </p>
              </div>

              {/* Month Navigation Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  id="btn-calendar-jump-today"
                  className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Hari Ini</span>
                </button>

                <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    id="btn-calendar-prev-month"
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="px-3 min-w-[170px] sm:min-w-[210px] text-center select-none">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block font-mono">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 block truncate">
                      {hijriMonthHeader}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    id="btn-calendar-next-month"
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Calendar Grid Card (Full Width, Compact & Clean) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-3.5 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-slate-500 pb-2.5 border-b border-slate-100">
                <span className="text-rose-600">Ahad</span>
                <span>Senin</span>
                <span>Selasa</span>
                <span>Rabu</span>
                <span>Kamis</span>
                <span className="text-emerald-700">Jum'at</span>
                <span>Sabtu</span>
              </div>

              {/* Days Matrix */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
                {/* Blank Offset Days */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div
                    key={`cal-blank-${currentYear}-${currentMonth}-${i}`}
                    className="h-16 sm:h-22 rounded-2xl bg-slate-50/40 border border-slate-100/40 opacity-40 pointer-events-none"
                  />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                  const dayDate = new Date(currentYear, currentMonth, dayNumber);
                  const now = new Date();
                  const isCurrentDay =
                    now.getFullYear() === currentYear &&
                    now.getMonth() === currentMonth &&
                    now.getDate() === dayNumber;
                  const isSelected = selectedDate === dateString;
                  const record = records[dateString];
                  const hijri = getHijriDate(dayDate);

                  // Sunnah Fasting check
                  const dayOfWeek = dayDate.getDay();
                  const isSeninKamis = dayOfWeek === 1 || dayOfWeek === 4;
                  const isAyyamulBidh = hijri.isAyyamulBidh;
                  const hasEvent = Boolean(hijri.event);
                  const isSunnahFastingDay = isSeninKamis || isAyyamulBidh || hijri.event?.recommendedFasting;

                  // Completion metrics
                  const hasCompletedPrayers =
                    record?.prayers &&
                    Object.values(record.prayers).some((p: any) => p?.status === 'completed');
                  const hasCompletedHabits =
                    record?.habits &&
                    Object.values(record.habits).some((h: any) => h?.status === 'completed');
                  const cellTilawah = getTilawahRecord(record, quranHabit);
                  const hasOtherWorship =
                    Boolean(record?.sedekahAmount && record.sedekahAmount > 0) ||
                    cellTilawah.actual > 0 ||
                    cellTilawah.isCompleted ||
                    Boolean(record?.totalDzikirCount && record.totalDzikirCount > 0);
                  const hasHalangan =
                    (record?.prayers && Object.values(record.prayers).some((p: any) => p?.status === 'halangan')) ||
                    (record?.habits && Object.values(record.habits).some((h: any) => h?.status === 'halangan'));
                  const isFastingLogged = record?.fastingType && record.fastingType !== 'none';
                  const hasNotes = notes.some((n) => n.date === dateString) || Boolean(record?.journalNote);

                  return (
                    <button
                      key={`cal-day-${dateString}`}
                      type="button"
                      onClick={() => handleSelectDate(dateString)}
                      id={`cal-day-cell-${dateString}`}
                      className={`group relative h-16 sm:h-22 p-1.5 sm:p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none active:scale-[0.97] ${
                        isCurrentDay
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-xs'
                          : isSelected
                          ? 'border-emerald-400 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-100 bg-slate-50/60 hover:bg-emerald-50/30 hover:border-emerald-200 text-slate-700'
                      }`}
                      title={`${dayNumber} ${monthNames[currentMonth]} ${currentYear} (${hijri.formatted}) - Klik untuk lihat rincian`}
                    >
                      {/* Top row: Gregorian Date Number & Hijri Day */}
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs sm:text-base font-extrabold ${
                              isCurrentDay
                                ? 'text-emerald-900 bg-emerald-200/80 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-md sm:rounded-lg'
                                : dayOfWeek === 0
                                ? 'text-rose-600'
                                : dayOfWeek === 5
                                ? 'text-emerald-700'
                                : 'text-slate-800'
                            }`}
                          >
                            {dayNumber}
                          </span>
                          {isCurrentDay && (
                            <span className="hidden sm:inline-block text-[8px] font-extrabold text-emerald-800 uppercase">
                              Kini
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] sm:text-xs font-bold text-emerald-800/90 font-mono">
                          {hijri.day}
                        </span>
                      </div>

                      {/* Middle row: Event / Fasting text on desktop (hidden on mobile) */}
                      <div className="hidden sm:block w-full overflow-hidden">
                        {hijri.event ? (
                          <span
                            className={`text-[9px] font-bold block truncate px-1 py-0.2 rounded-md ${
                              hijri.event.isHoliday
                                ? 'text-rose-700 bg-rose-50 border border-rose-200/60'
                                : 'text-purple-700 bg-purple-50 border border-purple-200/60'
                            }`}
                          >
                            {hijri.event.title.split('(')[0]}
                          </span>
                        ) : isAyyamulBidh ? (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 block truncate px-1 py-0.2 rounded-md">
                            Ayyamul Bidh
                          </span>
                        ) : isSeninKamis ? (
                          <span className="text-[9px] font-semibold text-slate-500 block truncate">
                            Puasa Sunnah
                          </span>
                        ) : null}
                      </div>

                      {/* Bottom Status Dots Row */}
                      <div className="flex items-center justify-between w-full pt-0.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Worship completed indicator */}
                          {(hasCompletedPrayers || hasCompletedHabits || hasOtherWorship) && (
                            <span
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"
                              title="Ibadah Dikerjakan"
                            />
                          )}
                          {/* Fasting indicator */}
                          {(isFastingLogged || isSunnahFastingDay) && (
                            <span
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                isFastingLogged ? 'bg-amber-500' : 'bg-amber-300'
                              }`}
                              title="Puasa Sunnah / Wajib"
                            />
                          )}
                          {/* Halangan / Udzur indicator */}
                          {hasHalangan && (
                            <span
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500"
                              title="Udzur / Halangan"
                            />
                          )}
                          {/* Islamic event indicator */}
                          {hasEvent && (
                            <span
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"
                              title={`Hari Besar: ${hijri.event?.title}`}
                            />
                          )}
                          {/* Note indicator */}
                          {hasNotes && (
                            <span
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-600"
                              title="Ada Catatan"
                            />
                          )}
                        </div>

                        {/* Subtle arrow on hover */}
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Compact Legend / Keterangan Warna */}
              <div className="flex items-center justify-between flex-wrap gap-2.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Ibadah Terisi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Puasa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Hari Besar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Udzur</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>Catatan</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                  💡 Klik tanggal mana saja untuk membuka rincian lengkap & kelola ibadah
                </span>
              </div>
            </div>

            {/* Hari Besar & Peristiwa Islam (Compact Collapsible Section) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Hari Besar & Peristiwa Penting Islam
                    </h3>
                    <p className="text-xs text-slate-500">
                      Jadwal momen bersejarah dan puasa sunnah utama
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setEventsFilter('month')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        eventsFilter === 'month' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Bulan Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        eventsFilter === 'all' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Semua ({ISLAMIC_EVENTS.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEventsExpanded(!isEventsExpanded)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                    title={isEventsExpanded ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {isEventsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Event Cards Grid */}
              <AnimatePresence>
                {isEventsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2"
                  >
                    {displayedEvents.length === 0 ? (
                      <div className="col-span-full p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                        Tidak ada hari besar khusus pada rentang bulan Hijriyah ini. Pilih tab "Semua" untuk melihat kalender tahunan.
                      </div>
                    ) : (
                      displayedEvents.map((ev, idx) => (
                        <div
                          key={`event-${ev.dateHijri}-${ev.title}-${idx}`}
                          className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-purple-200 transition-all flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {ev.title}
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 shrink-0 font-mono">
                              {ev.dateHijri} H
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {ev.description}
                          </p>
                          <div className="flex items-center gap-1.5 pt-1">
                            {ev.isHoliday && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                Hari Libur
                              </span>
                            )}
                            {ev.recommendedFasting && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                Sunnah Puasa
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 2: DETAIL TANGGAL LENGKAP (FOCUSED COMPREHENSIVE DATE VIEW)         */}
        {/* ========================================================================= */}
        {viewStage === 'detail' && (
          <motion.div
            key="calendar-stage-detail"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Top Navigation Bar with Back Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
              <button
                type="button"
                onClick={handleBackToCalendar}
                id="btn-back-to-calendar-grid"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span>Kembali ke Kalender</span>
              </button>

              {/* Day switchers & actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1 shadow-xs transition-colors active:scale-95"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hari Sebelumnya</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextDay}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1 shadow-xs transition-colors active:scale-95"
                  title="Hari Berikutnya"
                >
                  <span className="hidden sm:inline">Hari Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('habit')}
                  id="btn-manage-habits-from-calendar"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/10 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kelola Ibadah</span>
                </button>
              </div>
            </div>

            {/* Date Headline Showcase Banner */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-lg shadow-emerald-950/10 border border-emerald-700/50">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-8 select-none">
                <span className="font-amiri text-9xl">{activeHijri.monthArabic}</span>
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 text-emerald-100 backdrop-blur-xs border border-white/20 font-mono">
                    {activeHijri.formatted}
                  </span>
                  {isToday && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400 text-emerald-950 shadow-xs">
                      Hari Ini
                    </span>
                  )}
                  {activeHijri.isAyyamulBidh && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950">
                      🌕 Ayyamul Bidh (13-15)
                    </span>
                  )}
                  {isSelectedSunnahFasting && !activeHijri.isAyyamulBidh && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-300/30 text-amber-200 border border-amber-300/40">
                      Sunnah Puasa
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {new Intl.DateTimeFormat('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(parseLocalDate(selectedDate))}
                </h3>

                {/* Islamic Event Banner if matching */}
                {activeHijri.event && (
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-2xl space-y-1">
                    <div className="flex items-center gap-2 text-emerald-200 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>{activeHijri.event.title}</span>
                    </div>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      {activeHijri.event.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Detail Sections: Sholat 5 Waktu + Puasa & Catatan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Sholat 5 Waktu & Status Tracker */}
              <div className="lg:col-span-7 space-y-6">
                {/* Sholat 5 Waktu Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          Sholat 5 Waktu Tanggal Ini
                        </h4>
                        <p className="text-xs text-slate-500">
                          Klik langsung pada waktu sholat untuk mengubah status pelaksanaan
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5 Daily Prayers Interactive List */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'] as PrayerTimeName[]).map((prayer) => {
                      const prayerData = activeRecord?.prayers?.[prayer];
                      const status = prayerData?.status || 'pending';
                      const isCompleted = status === 'completed';
                      const isHalangan = status === 'halangan';
                      const timeStr = prayerTimes?.[prayer]?.time || '--:--';

                      return (
                        <button
                          key={prayer}
                          type="button"
                          onClick={() => handleTogglePrayer(prayer)}
                          id={`prayer-card-toggle-${prayer}`}
                          className={`p-3 sm:p-3.5 rounded-2xl border text-center flex flex-col justify-between items-center space-y-2 transition-all cursor-pointer active:scale-95 ${
                            isCompleted
                              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                              : isHalangan
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                          }`}
                          title={`Klik untuk tandai ${prayer}`}
                        >
                          <span className="text-xs font-bold">{prayer}</span>
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {timeStr}
                          </span>

                          <div
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold w-full flex items-center justify-center gap-1 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isHalangan
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Selesai</span>
                              </>
                            ) : isHalangan ? (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                <span>Udzur</span>
                              </>
                            ) : (
                              <span>Belum</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Prayer Summary Metric */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Total Sholat Dikerjakan:</span>
                    <span className="font-extrabold text-emerald-800 font-mono">
                      {completedFardhuPrayersCount} / 5 Waktu
                    </span>
                  </div>
                </div>

                {/* Status Puasa Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          Status & Niat Puasa
                        </h4>
                        <p className="text-xs text-slate-500">
                          Tentukan status ibadah puasa untuk tanggal {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(parseLocalDate(selectedDate))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fasting Type Selector Pills */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Pilih Status Puasa:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FASTING_OPTIONS.map((opt) => {
                        const isSelected = (activeRecord?.fastingType || 'none') === opt.id;
                        const Icon = opt.icon;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectFastingType(opt.id)}
                            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 text-xs font-bold transition-all active:scale-98 ${
                              isSelected
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-700'}`} />
                            <span className="line-clamp-1">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Catatan Ibadah & Amalan Harian */}
              <div className="lg:col-span-5 space-y-6">
                {/* Ringkasan Amalan Lainnya (Tilawah, Dzikir, Sedekah) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Ringkasan Amalan Tanggal Ini
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    {(() => {
                      const activeTilawah = getTilawahRecord(activeRecord, quranHabit);
                      return (
                        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                          <span className="text-[11px] font-semibold text-emerald-800 block">Tilawah Qur'an</span>
                          <span className="text-lg font-extrabold text-emerald-950 font-mono mt-0.5 block">
                            {activeTilawah.actual} {activeTilawah.formattedUnit}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
                      <span className="text-[11px] font-semibold text-teal-800 block">Total Dzikir</span>
                      <span className="text-lg font-extrabold text-teal-950 font-mono mt-0.5 block">
                        {activeRecord?.totalDzikirCount || 0}x
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                      <span className="text-[11px] font-semibold text-amber-800 block">Sedekah</span>
                      <span className="text-xs sm:text-sm font-extrabold text-amber-950 font-mono mt-0.5 block truncate">
                        Rp {(activeRecord?.sedekahAmount || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                      <span className="text-[11px] font-semibold text-purple-800 block">Habit Checklist</span>
                      <span className="text-lg font-extrabold text-purple-950 font-mono mt-0.5 block">
                        {habitCompletedCount} Selesai
                      </span>
                    </div>
                  </div>
                </div>

                {/* Habit & Hasil Aktual Tanggal Ini */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Habit & Hasil Aktual
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Data riwayat mutaba'ah tanggal terpilih
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('habit')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Buka Tracker →
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {habits.filter((h) => h.isActive !== false).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">
                        Belum ada habit ibadah yang aktif.
                      </p>
                    ) : (
                      habits
                        .filter((h) => h.isActive !== false)
                        .map((h) => {
                          const {
                            isCompleted: isDone,
                            isHalangan: isUdzur,
                            halanganReasonText,
                            actualVal,
                            targetVal,
                            unitVal,
                          } = getHabitStatusData(h, activeRecord);

                          return (
                            <div
                              key={`cal-habit-${h.id}`}
                              id={`cal-habit-${h.id}`}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isDone
                                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 shadow-xs'
                                  : isUdzur
                                  ? 'bg-rose-50/50 border-rose-200 text-rose-950 shadow-xs'
                                  : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateHabitStatus(
                                      h.id,
                                      isDone || isUdzur ? 'pending' : 'completed',
                                      isDone ? 0 : targetVal,
                                      undefined,
                                      undefined,
                                      selectedDate
                                    )
                                  }
                                  id={`cal-habit-btn-${h.id}`}
                                  title={isDone ? 'Tandai belum selesai' : isUdzur ? 'Hapus status udzur' : 'Tandai selesai'}
                                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                    isDone
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : isUdzur
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'bg-white border border-slate-300 hover:border-emerald-500'
                                  }`}
                                >
                                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  {isUdzur && <ShieldAlert className="w-3.5 h-3.5" />}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span
                                      className={`text-xs font-bold block truncate ${
                                        isDone
                                          ? 'text-slate-800'
                                          : isUdzur
                                          ? 'text-rose-950'
                                          : 'text-slate-800'
                                      }`}
                                    >
                                      {h.title}
                                    </span>
                                    {isDone && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                        Tuntas
                                      </span>
                                    )}
                                    {isUdzur && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 shrink-0 inline-flex items-center gap-0.5">
                                        <ShieldAlert className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                        Udzur ({halanganReasonText})
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] font-semibold block truncate ${
                                      isDone
                                        ? 'text-emerald-700'
                                        : isUdzur
                                        ? 'text-rose-700'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {isUdzur
                                      ? `Tercatat Udzur Syar'i (${halanganReasonText})`
                                      : formatHabitProgressText(actualVal, targetVal, unitVal)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => logHabitProgress(h.id, 1, selectedDate)}
                                  title="+1 Unit"
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 transition-all active:scale-95"
                                >
                                  +1
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Catatan & Jurnal Ibadah Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Catatan & Jurnal Tanggal Ini
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingNote(null);
                        setIsNoteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition-colors shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  {/* List of Notes for this date */}
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {dateNotes.length === 0 ? (
                      <div className="p-5 text-center bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                        <FileText className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs font-semibold text-slate-500">
                          Belum ada catatan atau refleksi untuk tanggal ini.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNote(null);
                            setIsNoteModalOpen(true);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline inline-block"
                        >
                          + Buat Catatan Baru
                        </button>
                      </div>
                    ) : (
                      dateNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-emerald-200 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">
                              {note.title}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNote(note);
                                  setIsNoteModalOpen(true);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 transition-colors"
                                title="Edit Catatan"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNote(note.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                title="Hapus Catatan"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {note.content}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {note.category}
                            </span>
                            {note.tags.map((tag, tIdx) => (
                              <span key={`note-${note.id}-tag-${tag}-${tIdx}`} className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Primary CTA: Kelola Ibadah Tanggal Ini */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/80 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Kelola Habit & Tracker Harian
                      </h4>
                      <p className="text-xs text-slate-600">
                        Buka lembar checklist amalan harian dan evaluasi ibadah
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('habit')}
                    id="btn-open-habit-tracker-from-calendar-bottom"
                    className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Buka Habit Tracker Lengkap</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
