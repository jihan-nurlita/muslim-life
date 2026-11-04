import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitItem } from '../../types';
import {
  isCurrencyUnit,
  formatHabitValue,
  formatHabitProgressText,
  parseCleanNumber,
  getTilawahRecord,
} from '../../utils/habitFormatter';

interface LogHabitValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: HabitItem | null;
  targetDate?: string;
}

export const LogHabitValueModal: React.FC<LogHabitValueModalProps> = ({
  isOpen,
  onClose,
  habit,
  targetDate,
}) => {
  const {
    selectedDate: globalSelectedDate,
    dayRecords,
    logHabitProgress,
    setHabitActualValue,
  } = useApp();

  const activeDate = targetDate || globalSelectedDate;
  const isQuran = habit ? (habit.id === 'h-quran' || habit.category === 'quran' || habit.syncSource === 'quran') : false;
  const tilawahRecord = (habit && isQuran) ? getTilawahRecord(dayRecords[activeDate], habit) : null;
  const currentRecord = habit ? dayRecords[activeDate]?.habits?.[habit.id] : undefined;
  const currentActualValue = tilawahRecord ? tilawahRecord.actual : (currentRecord?.value || 0);

  const [mode, setMode] = useState<'add' | 'set'>('add');
  const [inputValue, setInputValue] = useState<number | string>('');

  useEffect(() => {
    if (isOpen) {
      setMode('add');
      setInputValue('');
    }
  }, [isOpen, habit]);

  if (!isOpen || !habit) return null;

  const target = tilawahRecord ? tilawahRecord.target : (habit.target || 1);
  const activeUnit = tilawahRecord ? tilawahRecord.formattedUnit : habit.unit;
  const isCurrency = isCurrencyUnit(activeUnit);

  // Preset quick chips based on unit
  const quickChips: number[] = isCurrency
    ? [5000, 10000, 20000, 50000, 100000]
    : activeUnit.toLowerCase() === 'juz'
    ? [0.5, 1, 2]
    : activeUnit.toLowerCase() === 'halaman'
    ? [1, 2, 5, 10, 20]
    : activeUnit.toLowerCase() === 'ayat'
    ? [10, 20, 50, 100]
    : activeUnit.toLowerCase() === 'menit'
    ? [5, 10, 15, 30, 60]
    : activeUnit.toLowerCase() === 'kali'
    ? [1, 10, 33, 100]
    : [1, 2, 5, 10];

  const numInput = parseCleanNumber(inputValue) || 0;
  const projectedTotal = mode === 'add' ? currentActualValue + numInput : Math.max(0, numInput);
  const projectedPercent = Math.min(100, Math.round((projectedTotal / target) * 100));

  const handleChipClick = (amount: number) => {
    if (mode === 'add') {
      setInputValue((prev) => (parseCleanNumber(prev) || 0) + amount);
    } else {
      setInputValue(amount);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (numInput <= 0 && mode === 'add') {
      onClose();
      return;
    }

    if (mode === 'add') {
      logHabitProgress(habit.id, numInput, activeDate);
    } else {
      setHabitActualValue(habit.id, Math.max(0, numInput), activeDate);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          id="log-habit-value-modal"
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Catat Hasil Aktual Habit
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
                  {habit.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-log-habit-btn"
              type="button"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Status Current / Target Overview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Hasil Tercatat Saat Ini:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {formatHabitValue(currentActualValue, activeUnit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Target Harian:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {formatHabitValue(target, activeUnit)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((currentActualValue / target) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Progres: {Math.min(100, Math.round((currentActualValue / target) * 100))}%</span>
                  <span>Tanggal: {activeDate}</span>
                </div>
              </div>
            </div>

            {/* Mode Switcher: Tambah (Penjumlahan) vs Set Total */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'add'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Tambah (Dijumlahkan)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('set');
                  setInputValue(currentActualValue || '');
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'set'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Set Total Aktual
              </button>
            </div>

            {/* Input Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {mode === 'add'
                  ? `Masukkan Nilai Tambahan (${activeUnit}):`
                  : `Masukkan Total Hasil Aktual (${activeUnit}):`}
              </label>
              <div className="relative">
                {isCurrency && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isCurrency ? 'Contoh: 20000' : `Contoh: ${target}`}
                  autoFocus
                  className={`w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 transition-colors ${
                    isCurrency ? 'pl-10 pr-3.5' : 'px-3.5'
                  }`}
                  id="habit-log-value-input"
                />
              </div>
            </div>

            {/* Quick Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Pilih Nominal Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors active:scale-95"
                  >
                    {mode === 'add' ? `+${formatHabitValue(chip, activeUnit)}` : formatHabitValue(chip, activeUnit)}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Result Preview */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
              <span className="text-emerald-800 font-medium">Hasil Akhir Setelah Disimpan:</span>
              <span className="font-extrabold text-emerald-950 font-mono">
                {formatHabitValue(projectedTotal, activeUnit)} ({projectedPercent}%)
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submit-log-habit-value-btn"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Hasil Aktual
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
