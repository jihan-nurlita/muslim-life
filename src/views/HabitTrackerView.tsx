import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Plus,
  Target,
  Sparkles,
  ShieldAlert,
  Flame,
  Calendar,
  Filter,
  Check,
  Heart,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  CloudSun,
  Coins,
  BookOpen,
  Feather,
  HeartHandshake,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Edit3,
  Trash2,
  Power,
  Clock,
  Bell,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HabitCategory, HabitItem, PrayerTimeName } from '../types';
import { AddHabitModal } from '../components/modals/AddHabitModal';
import { HalanganModal } from '../components/modals/HalanganModal';
import { HabitDetailModal } from '../components/modals/HabitDetailModal';
import { ConfirmDeleteModal } from '../components/modals/ConfirmDeleteModal';
import { LogHabitValueModal } from '../components/modals/LogHabitValueModal';
import {
  formatHabitValue,
  formatHabitProgressText,
  isCurrencyUnit,
  getTilawahRecord,
  getHabitStatusData,
} from '../utils/habitFormatter';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Feather,
  HeartHandshake,
  Heart,
  Coins,
  CalendarCheck,
  Flame,
  Target,
};

const toLocalDateStr = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
};

export const HabitTrackerView: React.FC = () => {
  const {
    habits,
    todayRecord,
    selectedDayRecord,
    selectedDate,
    setSelectedDate,
    updateHabitStatus,
    deleteHabit,
    toggleHabitActive,
    setPrayerStatus,
    setHalanganModalPrayer,
    halanganModalPrayer,
    currentStreak,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterActiveStatus, setFilterActiveStatus] = useState<'all' | 'active_only' | 'inactive_only'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);
  const [selectedDetailHabit, setSelectedDetailHabit] = useState<HabitItem | null>(null);
  const [habitToLog, setHabitToLog] = useState<HabitItem | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<HabitItem | null>(null);
  const [habitForHalangan, setHabitForHalangan] = useState<string | null>(null);

  const CATEGORY_TABS = [
    { id: 'all', label: 'Semua Habit' },
    { id: 'sholat', label: 'Sholat Wajib & Sunnah' },
    { id: 'quran', label: "Tilawah Qur'an" },
    { id: 'dzikir', label: 'Dzikir' },
    { id: 'sholawat', label: 'Sholawat' },
    { id: 'sedekah', label: 'Sedekah' },
    { id: 'puasa', label: 'Puasa' },
    { id: 'custom', label: 'Kebaikan Lain' },
  ];

  const filteredHabits = habits.filter((h) => {
    if (activeCategory !== 'all' && h.category !== activeCategory) {
      return false;
    }
    if (filterActiveStatus === 'active_only' && h.isActive === false) {
      return false;
    }
    if (filterActiveStatus === 'inactive_only' && h.isActive !== false) {
      return false;
    }
    return true;
  });

  // Calculate completion for active habits
  const activeHabitsList = habits.filter((h) => h.isActive !== false);
  const totalHabits = activeHabitsList.length;
  const completedCount = activeHabitsList.filter(
    (h) => selectedDayRecord.habits[h.id]?.status === 'completed'
  ).length;
  const halanganCount = activeHabitsList.filter(
    (h) => selectedDayRecord.habits[h.id]?.status === 'halangan'
  ).length;
  const progressPercent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  // Date Navigator Helpers
  const handlePreviousDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toLocalDateStr(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toLocalDateStr(d));
  };

  const handleToday = () => {
    setSelectedDate(toLocalDateStr(new Date()));
  };

  const isToday = selectedDate === toLocalDateStr(new Date());

  const getFormattedDate = (dateStr: string) => {
    const d = parseLocalDate(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  };

  const getFrequencyBadge = (h: HabitItem) => {
    if (!h.frequency || h.frequency === 'daily') return null;
    if (h.frequency === 'specific_days') {
      const days = h.specificDays || [];
      const labels = days.map((d) => ['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d]);
      return labels.join(', ');
    }
    if (h.frequency === 'weekly') return 'Mingguan';
    return 'Custom';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 min-w-0" id="habit-tracker-view">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Habit & Mutaba'ah Ibadah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Istiqomah membangun kebiasaan shalih dengan target, pencatatan hasil aktual, dan pengingat
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingHabit(null);
              setIsAddModalOpen(true);
            }}
            id="add-habit-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah Habit</span>
          </button>
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="flex items-center justify-between gap-2 p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs min-w-0">
        <button
          type="button"
          onClick={handlePreviousDay}
          id="habit-prev-day-btn"
          className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/60 shrink-0"
          title="Hari Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-center min-w-0">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {getFormattedDate(selectedDate)}
          </span>
          {!isToday && (
            <button
              type="button"
              onClick={handleToday}
              id="habit-today-btn"
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Kembali ke Hari Ini
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          id="habit-next-day-btn"
          className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/60 shrink-0"
          title="Hari Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Cards (Daily Progress & Streak) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
        {/* Progress Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-700/20 relative overflow-hidden flex flex-col justify-between min-w-0">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold">
                Mutaba'ah Harian
              </span>
              <span className="text-xs text-emerald-100">
                {totalHabits} Habit Aktif
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-black font-mono">{progressPercent}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-black/20 rounded-full h-3 p-0.5 backdrop-blur-xs overflow-hidden">
              <motion.div
                className="bg-emerald-300 h-full rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between gap-2 text-xs text-emerald-100">
              <span>{completedCount} Selesai Dikerjakan</span>
              {halanganCount > 0 && <span>{halanganCount} Udzur Syar'i</span>}
            </div>
          </div>
        </div>

        {/* Streak & Consistency Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak Ibadah</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-extrabold text-slate-800 font-mono">{currentStreak}</span>
              <span className="text-sm font-bold text-amber-700">Hari Berturut-turut</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              “Amalan yang paling dicintai oleh Allah adalah amalan yang berkelanjutan walaupun sedikit.” (HR. Bukhari)
            </p>
          </div>

          <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <span className="text-[11px] font-bold text-amber-900">Tetap Semangat & Istiqomah!</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        {/* Category Tabs Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin flex-1 min-w-0">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active / Inactive Filter toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto shadow-2xs max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterActiveStatus('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
              filterActiveStatus === 'all'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Semua ({habits.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActiveStatus('active_only')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
              filterActiveStatus === 'active_only'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Aktif ({habits.filter((h) => h.isActive !== false).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActiveStatus('inactive_only')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
              filterActiveStatus === 'inactive_only'
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Nonaktif ({habits.filter((h) => h.isActive === false).length})
          </button>
        </div>
      </div>

      {/* Habits List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 min-w-0">
        {filteredHabits.map((h) => {
          const {
            isCompleted,
            isHalangan,
            halanganReasonText,
            actualVal,
            targetVal,
            unitVal,
            rawRec: record,
          } = getHabitStatusData(h, selectedDayRecord);
          const isInactive = h.isActive === false;
          const frequencyBadge = getFrequencyBadge(h);
          const IconComp = ICON_MAP[h.iconName] || Target;
          const percentProgress =
            targetVal > 0 ? Math.min(100, Math.round((actualVal / targetVal) * 100)) : 0;

          return (
            <div
              key={h.id}
              id={`habit-card-${h.id}`}
              className={`min-w-0 overflow-hidden p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                isInactive
                  ? 'border-slate-200 bg-slate-50/70 opacity-75'
                  : isCompleted
                  ? 'border-emerald-300 bg-emerald-50/50 shadow-xs'
                  : isHalangan
                  ? 'border-rose-300 bg-rose-50/50 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Top Row: Info & Meta */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div
                  className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer group"
                  onClick={() => setSelectedDetailHabit(h)}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isInactive
                        ? 'bg-slate-200 text-slate-500'
                        : isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isHalangan
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 break-words group-hover:text-emerald-700 transition-colors">
                        {h.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          Tuntas
                        </span>
                      )}
                      {isHalangan && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0 max-w-full truncate">
                          Udzur ({halanganReasonText || record?.halanganReason || 'Halangan'})
                        </span>
                      )}
                      {isInactive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 shrink-0">
                          Nonaktif
                        </span>
                      )}
                    </div>

                    {/* Target & Progress Text */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1">
                      <span className="font-semibold text-emerald-800">
                        {formatHabitProgressText(actualVal, targetVal, unitVal)}
                      </span>
                    </div>

                    {h.description && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {h.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {frequencyBadge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 shrink-0" />
                          {frequencyBadge}
                        </span>
                      )}
                      {h.reminderEnabled && h.reminderTime && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          {h.reminderTime} WIB
                        </span>
                      )}
                      {h.syncSource && h.syncSource !== 'none' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                          Sinkron
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Mini Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-600' : actualVal > 0 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  style={{ width: `${percentProgress}%` }}
                />
              </div>

              {/* Bottom Action Bar: Baris 1 ikon manajemen, Baris 2 Catat, Centang, Halangan */}
              <div className="flex flex-col gap-2.5 pt-2.5 border-t border-slate-100/80 min-w-0">
                {/* Baris 1: Management Action Icons (Detail, Edit, Nonaktif, Hapus) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailHabit(h)}
                    title="Lihat Detail & Riwayat"
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200/80 flex items-center justify-center shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingHabit(h);
                      setIsAddModalOpen(true);
                    }}
                    title="Edit Habit"
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors border border-slate-200/80 flex items-center justify-center shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleHabitActive(h.id)}
                    title={h.isActive !== false ? 'Nonaktifkan Habit' : 'Aktifkan Habit'}
                    className={`w-8 h-8 rounded-full transition-colors border flex items-center justify-center shrink-0 ${
                      h.isActive !== false
                        ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 border-slate-200/80'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setHabitToDelete(h)}
                    title="Hapus Habit"
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border border-slate-200/80 flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Baris 2: Right Quick Status Controls (Catat, Centang, Halangan) */}
                <div className="flex items-center justify-end gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => setHabitToLog(h)}
                    title="Catat / Tambah Hasil Aktual"
                    className="h-8 px-3 rounded-xl text-xs font-semibold bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Catat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateHabitStatus(
                        h.id,
                        isCompleted ? 'pending' : 'completed',
                        isCompleted ? 0 : targetVal,
                        undefined,
                        undefined,
                        selectedDate
                      )
                    }
                    id={`habit-toggle-btn-${h.id}`}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                        : 'bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200/90'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{isCompleted ? 'Tuntas' : 'Centang'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHabitForHalangan(h.id)}
                    title="Catat Ada Halangan / Udzur Syar'i"
                    id={`habit-halangan-btn-${h.id}`}
                    className={`w-8 h-8 rounded-xl text-xs border transition-all flex items-center justify-center shrink-0 ${
                      isHalangan
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 border-slate-200/90 text-slate-400 hover:text-rose-600 hover:border-rose-300'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {/* 1. Add / Edit Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        editingHabit={editingHabit}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
      />

      {/* 2. Habit Detail Modal */}
      <HabitDetailModal
        isOpen={Boolean(selectedDetailHabit)}
        habit={selectedDetailHabit}
        onClose={() => setSelectedDetailHabit(null)}
        onEdit={(h) => {
          setEditingHabit(h);
          setIsAddModalOpen(true);
        }}
        onDelete={(h) => setHabitToDelete(h)}
        onHalanganClick={(h) => setHabitForHalangan(h.id)}
      />

      {/* 3. Log Habit Value Modal */}
      <LogHabitValueModal
        isOpen={Boolean(habitToLog)}
        habit={habitToLog}
        targetDate={selectedDate}
        onClose={() => setHabitToLog(null)}
      />

      {/* 4. Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(habitToDelete)}
        title="Hapus Habit Ibadah?"
        itemName={habitToDelete?.title}
        description={`Apakah Anda yakin ingin menghapus habit "${habitToDelete?.title}"? Riwayat ibadah yang telah tercatat sebelumnya di kalender akan tetap aman.`}
        onClose={() => setHabitToDelete(null)}
        onConfirm={() => {
          if (habitToDelete) {
            deleteHabit(habitToDelete.id);
            setHabitToDelete(null);
            if (selectedDetailHabit?.id === habitToDelete.id) {
              setSelectedDetailHabit(null);
            }
          }
        }}
      />

      {/* 5. Halangan Modals */}
      {habitForHalangan && (
        <HalanganModal
          prayerName={null}
          habitId={habitForHalangan}
          onClose={() => setHabitForHalangan(null)}
        />
      )}

      {halanganModalPrayer && (
        <HalanganModal
          prayerName={halanganModalPrayer}
          onClose={() => setHalanganModalPrayer(null)}
        />
      )}
    </div>
  );
};
