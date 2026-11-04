import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle2,
  MoreHorizontal,
  MoonStar,
  Calendar,
  BarChart3,
  BookMarked,
  Settings,
  X,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, todayRecord, habits } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pendingHabitsCount = habits.filter((h) => {
    const rec = todayRecord.habits[h.id];
    return !rec || rec.status === 'pending';
  }).length;

  const PRIMARY_TABS: { id: NavigationTab; label: string; icon: any; badge?: number }[] = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'sholat', label: 'Sholat', icon: Clock },
    { id: 'quran', label: 'Al-Qur\'an', icon: BookOpen },
    { id: 'dzikir', label: 'Dzikir', icon: Sparkles },
    { id: 'habit', label: 'Habit', icon: CheckCircle2, badge: pendingHabitsCount > 0 ? pendingHabitsCount : undefined },
  ];

  const SECONDARY_TABS: { id: NavigationTab; label: string; icon: any; desc: string }[] = [
    { id: 'asmaul-husna', label: 'Asmaul Husna', icon: MoonStar, desc: '99 Nama Allah lengkap tasbih' },
    { id: 'kalender', label: 'Kalender Hijriyah', icon: Calendar, desc: 'Jadwal puasa sunnah & peristiwa Islam' },
    { id: 'statistik', label: 'Riwayat & Statistik', icon: BarChart3, desc: 'Laporan progress & konsistensi ibadah' },
    { id: 'catatan', label: 'Catatan Ibadah', icon: BookMarked, desc: 'Jurnal refleksi & kumpulan doa' },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, desc: 'Metode sholat, notifikasi, adzan & backup' },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg shadow-slate-900/5 safe-area-pb"
        id="mobile-bottom-nav"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                id={`bottom-nav-${tab.id}`}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`w-10 h-7 rounded-xl flex items-center justify-center relative transition-all ${
                    isActive ? 'bg-emerald-100/80 text-emerald-700' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            id="bottom-nav-more-btn"
            className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all ${
              ['asmaul-husna', 'kalender', 'statistik', 'catatan', 'pengaturan'].includes(activeTab)
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="w-10 h-7 rounded-xl flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Lainnya</span>
          </button>
        </div>
      </div>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="bg-white rounded-t-3xl border-t border-slate-100 p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
              id="mobile-more-drawer"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Menu Tambahan</h3>
                  <p className="text-xs text-slate-500">Fitur pelengkap ibadah & pengaturan</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  id="close-more-drawer-btn"
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {SECONDARY_TABS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      id={`more-menu-${item.id}`}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-slate-800">{item.label}</span>
                        <span className="text-[11px] text-slate-500 block">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
