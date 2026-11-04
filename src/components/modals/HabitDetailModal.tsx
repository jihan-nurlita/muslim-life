import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Target,
  Flame,
  Trophy,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  Circle,
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
  Edit3,
  Trash2,
  Power,
  RefreshCw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitItem, HalanganReason } from '../../types';
import {
  formatHabitValue,
  formatHabitProgressText,
  isCurrencyUnit,
  parseCleanNumber,
  getTilawahRecord,
  getHabitStatusData,
} from '../../utils/habitFormatter';

interface HabitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: HabitItem | null;
  onEdit: (habit: HabitItem) => void;
  onDelete: (habit: HabitItem) => void;
  onHalanganClick?: (habit: HabitItem) => void;
}

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

const CATEGORY_NAMES: Record<string, string> = {
  sholat: 'Sholat Wajib & Sunnah',
  quran: 'Tilawah Al-Qur\'an',
  dzikir: 'Dzikir & Doa',
  sholawat: 'Sholawat Nabi',
  sedekah: 'Sedekah & Infaq',
  puasa: 'Puasa Sunnah',
  custom: 'Kebaikan Harian',
};

const DAYS_NAME = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  isOpen,
  onClose,
  habit,
  onEdit,
  onDelete,
  onHalanganClick,
}) => {
  const {
    dayRecords,
    selectedDate,
    selectedDayRecord,
    updateHabitStatus,
    toggleHabitActive,
    logHabitProgress,
    setHabitActualValue,
  } = useApp();

  const [addCustomVal, setAddCustomVal] = React.useState<string>('');

  // Compute Streak, Total Completion, and 14-day history for this specific habit
  const habitStats = useMemo(() => {
    if (!habit) {
      return {
        streak: 0,
        totalCompleted: 0,
        totalHalangan: 0,
        consistencyRate: 0,
        history14Days: [],
      };
    }

    const isQuranHabit = habit.id === 'h-quran' || habit.category === 'quran' || habit.syncSource === 'quran';
    let totalCompleted = 0;
    let totalHalangan = 0;
    let totalTrackedDays = 0;
    let streak = 0;
    let streakBroken = false;

    // Check last 30 days
    const today = new Date();
    const history14Days: Array<{
      dateStr: string;
      dayInitial: string;
      dayNumber: number;
      status: 'completed' | 'pending' | 'halangan';
      value: number;
      isToday: boolean;
    }> = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRec = dayRecords[dStr];
      const tRec = isQuranHabit ? getTilawahRecord(dayRec, habit) : null;
      const rec = dayRec?.habits?.[habit.id];
      const st = tRec ? (tRec.isCompleted ? 'completed' : (rec?.status || 'pending')) : (rec?.status || 'pending');
      const val = tRec ? tRec.actual : (rec?.value || 0);

      if (st === 'completed') totalCompleted++;
      if (st === 'halangan') totalHalangan++;
      totalTrackedDays++;

      history14Days.push({
        dateStr: dStr,
        dayInitial: DAYS_NAME[d.getDay()],
        dayNumber: d.getDate(),
        status: st,
        value: val,
        isToday: i === 0,
      });
    }

    // Calculate current streak backward from today / yesterday
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRec = dayRecords[dStr];
      const tRec = isQuranHabit ? getTilawahRecord(dayRec, habit) : null;
      const rec = dayRec?.habits?.[habit.id];
      const st = tRec ? (tRec.isCompleted ? 'completed' : rec?.status) : rec?.status;

      if (st === 'completed' || st === 'halangan') {
        if (!streakBroken) streak++;
      } else {
        // If today is pending, don't break streak yet if yesterday was completed
        if (i === 0) {
          continue;
        }
        streakBroken = true;
      }
    }

    const consistencyRate =
      totalTrackedDays > 0 ? Math.round((totalCompleted / totalTrackedDays) * 100) : 0;

    return {
      streak,
      totalCompleted,
      totalHalangan,
      consistencyRate,
      history14Days,
    };
  }, [dayRecords, habit]);

  const frequencyLabel = useMemo(() => {
    if (!habit) return 'Setiap Hari';
    if (!habit.frequency || habit.frequency === 'daily') return 'Setiap Hari';
    if (habit.frequency === 'specific_days') {
      const days = habit.specificDays || [];
      const labels = days.map((d) => ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d]);
      return labels.length > 0 ? labels.join(', ') : 'Hari Tertentu';
    }
    if (habit.frequency === 'weekly') return habit.frequencyNote || 'Mingguan (1x Seminggu)';
    return habit.frequencyNote || 'Jadwal Khusus';
  }, [habit]);

  const syncDescription = useMemo(() => {
    if (!habit) return 'Input & Checklist Mandiri';
    if (habit.syncSource?.startsWith('prayer')) {
      const pName = habit.syncSource.replace('prayer_', '').toUpperCase();
      return `Tersinkron otomatis dengan Sholat ${pName} di Jadwal Sholat`;
    }
    if (habit.syncSource === 'quran') {
      return 'Tersinkron otomatis dengan catatan Tilawah Al-Qur\'an';
    }
    if (habit.syncSource?.startsWith('dzikir')) {
      return 'Tersinkron otomatis dengan Tasbih Digital & Dzikir Harian';
    }
    if (habit.syncSource === 'sholawat') {
      return 'Tersinkron otomatis dengan counter Sholawat Nabi';
    }
    if (habit.syncSource === 'sedekah') {
      return 'Tersinkron otomatis dengan catatan Infaq & Sedekah Harian';
    }
    if (habit.syncSource === 'puasa' || habit.syncSource?.startsWith('puasa')) {
      const fastingLabels: Record<string, string> = {
        senin_kamis: 'Puasa Sunnah Senin/Kamis',
        ayyamul_bidh: 'Puasa Ayyamul Bidh (13–15)',
        daud: 'Puasa Daud',
        ramadhan: 'Puasa Wajib Ramadhan',
        nazar: 'Puasa Qadha/Nazar',
        sunnah_lainnya: 'Puasa Sunnah Lainnya',
      };
      const fType = habit.fastingType || (habit.syncSource.startsWith('puasa_') ? habit.syncSource.replace('puasa_', '') : undefined);
      const label = fType ? fastingLabels[fType] || 'Puasa' : 'Puasa Sunnah';
      return `Tersinkron otomatis dengan catatan ${label} di Kalender Ibadah`;
    }
    return 'Input & Checklist Mandiri';
  }, [habit?.syncSource, habit?.fastingType]);

  if (!isOpen || !habit) return null;

  const IconComponent = ICON_MAP[habit.iconName] || Target;

  // Selected date record status for this habit (unified with Home & Calendar)
  const habitStatus = getHabitStatusData(habit, selectedDayRecord);
  const isCompleted = habitStatus.isCompleted;
  const isHalangan = habitStatus.isHalangan;
  const actualVal = habitStatus.actualVal;
  const targetVal = habitStatus.targetVal;
  const unitVal = habitStatus.unitVal;
  const currentRecord = habitStatus.rawRec || { status: 'pending', value: 0 };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
          id="habit-detail-modal"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-base">{habit.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      habit.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {habit.isActive !== false ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {CATEGORY_NAMES[habit.category] || habit.category}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-habit-detail-btn"
              type="button"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Description if present */}
            {habit.description && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed italic">
                "{habit.description}"
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Streak */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5 shadow-2xs">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-amber-800">{habitStats.streak}</span>
                <span className="text-[10px] font-semibold text-amber-700">Hari Streak</span>
              </div>

              {/* Total Completed */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5 shadow-2xs">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-emerald-800">{habitStats.totalCompleted}</span>
                <span className="text-[10px] font-semibold text-emerald-700">Hari Selesai</span>
              </div>

              {/* Target / Consistency */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-1.5 shadow-2xs">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-teal-800 truncate max-w-full">
                  {formatHabitValue(targetVal, unitVal)}
                </span>
                <span className="text-[10px] font-semibold text-teal-700">Target Harian</span>
              </div>
            </div>

            {/* Today's Interactive Status & Actual Value Card */}
            <div className="p-4.5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Pencatatan Tanggal Terpilih ({selectedDate})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isCompleted
                      ? 'Alhamdulillah, target habit ini telah tuntas tercapai'
                      : isHalangan
                      ? `Tercatat Udzur Syar'i (${currentRecord.halanganReason || 'Haid'})`
                      : 'Catat progres atau tandai selesai'}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isHalangan
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCompleted ? 'Tuntas' : isHalangan ? 'Udzur' : 'Sebagian/Belum'}
                </span>
              </div>

              {/* Progress Text & Bar */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Hasil Aktual:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {formatHabitProgressText(actualVal, targetVal, unitVal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((actualVal / (targetVal || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Quick Increment / Add Value Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 block">
                  + Tambah Progres (Dijumlahkan ke Riwayat):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(isCurrencyUnit(unitVal)
                    ? [5000, 10000, 20000, 50000]
                    : unitVal.toLowerCase() === 'juz'
                    ? [0.5, 1, 2]
                    : unitVal.toLowerCase() === 'halaman'
                    ? [1, 2, 5, 10]
                    : unitVal.toLowerCase() === 'ayat'
                    ? [10, 20, 50]
                    : unitVal.toLowerCase() === 'menit'
                    ? [5, 10, 15, 30]
                    : [1, 5, 10, 33]
                  ).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => logHabitProgress(habit.id, val, selectedDate)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors active:scale-95"
                    >
                      +{formatHabitValue(val, habit.unit)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Value Adder & Checklist */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={addCustomVal}
                    onChange={(e) => setAddCustomVal(e.target.value)}
                    placeholder={`+ Input (${habit.unit})`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const num = parseCleanNumber(addCustomVal) || 0;
                    if (num > 0) {
                      logHabitProgress(habit.id, num, selectedDate);
                      setAddCustomVal('');
                    }
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                >
                  + Tambah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateHabitStatus(
                      habit.id,
                      isCompleted ? 'pending' : 'completed',
                      isCompleted ? 0 : targetVal,
                      undefined,
                      undefined,
                      selectedDate
                    );
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isCompleted
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCompleted ? 'Batalkan' : 'Tuntas'}
                </button>

                {onHalanganClick && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onHalanganClick(habit);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border ${
                      isHalangan
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    Udzur
                  </button>
                )}
              </div>
            </div>

            {/* Riwayat 14 Hari Terakhir (Visual Activity Tracker) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Riwayat 14 Hari Terakhir
                </span>
                <span className="text-[10px] text-slate-500">
                  Konsistensi: <strong>{habitStats.consistencyRate}%</strong>
                </span>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                {habitStats.history14Days.map((h, idx) => {
                  let bgClass = 'bg-slate-200 text-slate-400';
                  if (h.status === 'completed') bgClass = 'bg-emerald-600 text-white shadow-2xs';
                  if (h.status === 'halangan') bgClass = 'bg-rose-500 text-white shadow-2xs';

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1"
                      title={`${h.dateStr}: ${h.status}`}
                    >
                      <span className="text-[9px] font-medium text-slate-400">{h.dayInitial}</span>
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-transform ${bgClass} ${
                          h.isToday ? 'ring-2 ring-emerald-500 ring-offset-1 font-black' : ''
                        }`}
                      >
                        {h.dayNumber}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Selesai</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Udzur</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span>Belum</span>
                </div>
              </div>
            </div>

            {/* Habit Meta Information */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Frekuensi:
                </span>
                <span className="font-semibold text-slate-800">{frequencyLabel}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  Pengingat:
                </span>
                <span className="font-semibold text-slate-800">
                  {habit.reminderEnabled && habit.reminderTime
                    ? `⏰ ${habit.reminderTime} WIB`
                    : 'Tidak aktif'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                  Sinkronisasi:
                </span>
                <span className="font-semibold text-teal-700 text-right max-w-[200px] truncate">
                  {syncDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                toggleHabitActive(habit.id);
              }}
              className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                habit.isActive !== false
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {habit.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(habit);
                }}
                className="py-2.5 px-3.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(habit);
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Habit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
