import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Check, HeartCrack, Thermometer, Plane, Moon, HelpCircle } from 'lucide-react';
import { HalanganReason, PrayerTimeName } from '../../types';
import { useApp } from '../../context/AppContext';

interface HalanganModalProps {
  prayerName: PrayerTimeName | null;
  habitId?: string;
  onClose: () => void;
}

const REASONS: { id: HalanganReason; label: string; icon: any; desc: string }[] = [
  { id: 'haid', label: 'Haid / Menstruasi', icon: HeartCrack, desc: 'Diberikan udzur syar\'i dalam ibadah sholat & puasa' },
  { id: 'nifas', label: 'Nifas', icon: HeartCrack, desc: 'Udzur syar\'i pasca persalinan' },
  { id: 'sakit', label: 'Sakit / Medis', icon: Thermometer, desc: 'Kondisi kesehatan tidak memungkinkan' },
  { id: 'safar', label: 'Safar / Perjalanan Jauh', icon: Plane, desc: 'Sedang dalam perjalanan musafir (jamak/qashar/udzur)' },
  { id: 'ketiduran', label: 'Ketiduran / Lupa', icon: Moon, desc: 'Tidak sengaja terlewat karena tertidur pulas' },
  { id: 'lainnya', label: 'Halangan Lainnya', icon: HelpCircle, desc: 'Keadaan darurat atau alasan syar\'i lainnya' },
];

export const HalanganModal: React.FC<HalanganModalProps> = ({ prayerName, habitId, onClose }) => {
  const { setPrayerStatus, updateHabitStatus, selectedDate, todayRecord } = useApp();
  
  const existingRecord = prayerName ? todayRecord?.prayers?.[prayerName] : undefined;
  const [selectedReason, setSelectedReason] = useState<HalanganReason>(existingRecord?.halanganReason || 'haid');
  const [customNote, setCustomNote] = useState(existingRecord?.halanganNote || '');

  const handleSave = () => {
    if (prayerName) {
      setPrayerStatus(prayerName, 'halangan', {
        halanganReason: selectedReason,
        halanganNote: customNote.trim() || undefined,
        date: selectedDate,
      });
    } else if (habitId) {
      updateHabitStatus(habitId, 'halangan', 0, selectedReason, customNote.trim() || undefined, selectedDate);
    }
    onClose();
  };

  const handleClearHalangan = () => {
    if (prayerName) {
      setPrayerStatus(prayerName, 'pending', { date: selectedDate });
    } else if (habitId) {
      updateHabitStatus(habitId, 'pending', 0, undefined, undefined, selectedDate);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden flex flex-col"
          id="halangan-modal-container"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/20">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100/80 text-rose-500 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base leading-tight">Status Ada Halangan</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {prayerName ? `Sholat ${prayerName}` : 'Kebiasaan Ibadah'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              id="close-halangan-modal-btn"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-slate-500 leading-relaxed">
              Catatan udzur syar'i membantu menjaga ketepatan statistik ibadah tanpa menurunkan motivasi istiqomah Anda.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Pilih Alasan Halangan:</label>
              <div className="grid grid-cols-1 gap-2.5">
                {REASONS.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedReason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      id={`halangan-reason-${r.id}`}
                      onClick={() => setSelectedReason(r.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-rose-300 bg-white ring-4 ring-rose-50 shadow-xs'
                          : 'border-slate-100/90 bg-slate-50/70 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-rose-500 text-white shadow-xs' : 'bg-white text-slate-500 border border-slate-200/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-800">{r.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-rose-500 shrink-0 stroke-[2.5]" />}
                        </div>
                        <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">{r.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 block">
                Keterangan Tambahan / Alasan Khusus (Opsional):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Contoh: Sedang opname di RS / Perjalanan ke luar kota"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 bg-slate-50/70 focus:bg-white transition-all"
                id="halangan-custom-note-input"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClearHalangan}
              id="clear-halangan-btn"
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-2 py-1.5 transition-colors cursor-pointer"
            >
              Hapus Halangan
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                id="cancel-halangan-btn"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                id="save-halangan-btn"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all active:scale-95 cursor-pointer"
              >
                Simpan Halangan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
