import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  X,
  Flame,
  Clock,
  BookOpen,
  Heart,
  Settings,
  MapPin,
  BarChart3,
  Edit3,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationModal } from './LocationModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    currentStreak,
    longestStreak,
    totalPrayersCompleted,
    totalQuranPagesRead,
    totalDzikirLogged,
    setActiveTab,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [userNameInput, setUserNameInput] = useState(settings.userName || 'Hamba Allah');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (userNameInput.trim()) {
      updateSettings({ userName: userNameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleNavigate = (tab: 'settings' | 'statistics' | 'habits' | 'calendar') => {
    setActiveTab(tab as any);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
          id="profile-account-modal"
        >
          {/* Header Banner */}
          <div className="relative p-6 bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 text-white">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white text-emerald-900 font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-emerald-300">
                  {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'H'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" title="Aktif" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white text-slate-900 text-sm font-bold outline-none border border-emerald-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-extrabold text-white">
                        {settings.userName || 'Hamba Allah'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-emerald-200 hover:text-white transition-colors"
                        title="Ubah Nama"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-300" />
                    <span>{settings.city || 'Jakarta'}</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-200 font-medium">Sahabat Muslim</span>
                </div>
              </div>
            </div>

            {/* Streak & Level Ribbon */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="font-bold">{currentStreak} Hari Beruntun</span>
                <span className="text-[10px] text-emerald-200">(Terbaik: {longestStreak} hari)</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/40 border border-emerald-300/40 text-[10px] font-bold">
                <Award className="w-3 h-3 text-amber-300" />
                <span>Level Istiqomah</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="p-4 sm:p-6 space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Ringkasan Amal Ibadah
              </span>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <Clock className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span className="text-base font-extrabold text-emerald-950 font-mono block">
                    {totalPrayersCompleted}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800">Sholat Selesai</span>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <BookOpen className="w-4 h-4 text-teal-700 mx-auto mb-1" />
                  <span className="text-base font-extrabold text-teal-950 font-mono block">
                    {totalQuranPagesRead}
                  </span>
                  <span className="text-[10px] font-semibold text-teal-800">Hal. Qur'an</span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <Heart className="w-4 h-4 text-purple-700 mx-auto mb-1" />
                  <span className="text-base font-extrabold text-purple-950 font-mono block">
                    {totalDzikirLogged}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-800">Total Dzikir</span>
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Akses & Pengaturan Akun
              </span>

              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all flex items-center justify-between text-xs font-bold text-slate-700 active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-900 block">Ubah Lokasi & Jadwal Sholat</span>
                    <span className="text-[11px] text-slate-400 font-normal">Kota saat ini: {settings.city}</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold">Ubah</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('statistics')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all flex items-center justify-between text-xs font-bold text-slate-700 active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-900 block">Statistik & Evaluasi Lengkap</span>
                    <span className="text-[11px] text-slate-400 font-normal">Lihat grafik performa ibadah</span>
                  </div>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('settings')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all flex items-center justify-between text-xs font-bold text-slate-700 active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-900 block">Pengaturan Aplikasi</span>
                    <span className="text-[11px] text-slate-400 font-normal">Notifikasi, suara adzan, cadangkan data</span>
                  </div>
                </div>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};
