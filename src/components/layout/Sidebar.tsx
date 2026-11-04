import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Clock,
  BookOpen,
  Sparkles,
  MoonStar,
  CheckCircle2,
  Calendar,
  BarChart3,
  BookMarked,
  Settings,
  X,
  Flame,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useApp } from '../../context/AppContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentStreak,
    nextPrayer,
    todayRecord,
    habits,
  } = useApp();

  // Count pending habits for today
  const pendingHabitsCount = habits.filter((h) => {
    const rec = todayRecord.habits[h.id];
    return !rec || rec.status === 'pending';
  }).length;

  const NAV_ITEMS: NavItem[] = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'sholat', label: 'Jadwal Sholat', icon: Clock },
    { id: 'quran', label: 'Quran', icon: BookOpen },
    { id: 'dzikir', label: 'Dzikir & Tasbih', icon: Sparkles },
    { id: 'asmaul-husna', label: 'Asmaul Husna', icon: MoonStar },
    {
      id: 'habit',
      label: 'Habit Ibadah',
      icon: CheckCircle2,
      badge: pendingHabitsCount > 0 ? pendingHabitsCount : undefined,
    },
    { id: 'kalender', label: 'Kalender Ibadah', icon: Calendar },
    { id: 'statistik', label: 'Riwayat & Statistik', icon: BarChart3 },
    { id: 'catatan', label: 'Catatan', icon: BookMarked },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  const handleSelectNav = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderNavList = () => (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin">
      <div className="px-3 pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </span>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectNav(item.id)}
            id={`sidebar-nav-${item.id}`}
            className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
              isActive
                ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-slate-500 group-hover:text-emerald-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const renderBrandHeader = (showCloseBtn = false) => (
    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 ring-4 ring-emerald-50">
          <MoonStar className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base text-slate-800 tracking-tight">
              MuslimLife
            </span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase rounded-md bg-emerald-100 text-emerald-800">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Islamic Companion</p>
        </div>
      </div>

      {showCloseBtn && (
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          id="close-mobile-sidebar-btn"
          aria-label="Tutup Menu"
          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const renderFooter = () => (
    <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-2.5 shrink-0">
      {/* Next Prayer Mini Card */}
      <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Menuju {nextPrayer.name}
          </span>
          <span className="font-bold text-emerald-700 text-[11px]">
            {nextPrayer.timeString}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold font-mono text-slate-800 tracking-tight">
            {nextPrayer.remainingFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">lagi</span>
        </div>
      </div>

      {/* Streak Counter Mini */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-200/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-900 block leading-tight">
              {currentStreak} Hari Streak
            </span>
            <span className="text-[10px] text-amber-700">Istiqomah Beribadah</span>
          </div>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Permanent Left Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-100 shrink-0 h-screen sticky top-0 z-30 select-none"
        id="desktop-sidebar"
      >
        {renderBrandHeader(false)}
        {renderNavList()}
        {renderFooter()}
      </aside>

      {/* 2. Tablet / Mobile Slide-Over Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between select-none"
              id="mobile-sidebar-drawer"
            >
              {renderBrandHeader(true)}
              {renderNavList()}
              {renderFooter()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
