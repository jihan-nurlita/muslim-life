import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  User,
  Menu,
  Sparkles,
  Clock,
  BookOpen,
  Heart,
  ChevronDown,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  MapPin,
  Flame,
  Settings,
  Calendar,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { ProfileModal } from '../modals/ProfileModal';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'prayer' | 'habit' | 'event' | 'info';
  read: boolean;
}

export const Topbar: React.FC = () => {
  const {
    settings,
    updateSettings,
    nextPrayer,
    currentStreak,
    setIsMobileMenuOpen,
    setActiveTab,
  } = useApp();

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  // Profile Modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification Dropdown state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Dynamic notifications based on prayer & daily habits
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-prayer',
      title: `Waktu ${nextPrayer.name} Segera Tiba`,
      message: `Jadwal ${nextPrayer.name} pukul ${nextPrayer.timeString} (${nextPrayer.remainingFormatted} lagi). Persiapkan diri & wudhu.`,
      time: 'Tepat Waktu',
      type: 'prayer',
      read: false,
    },
    {
      id: 'notif-habit',
      title: 'Pertahankan Istiqomah Ibadah',
      message: `Streak Anda saat ini ${currentStreak} hari. Jangan lewatkan tilawah Al-Qur'an dan dzikir harian.`,
      time: 'Hari Ini',
      type: 'habit',
      read: false,
    },
    {
      id: 'notif-event',
      title: 'Pengingat Puasa Sunnah & Hari Baik',
      message: 'Cek jadwal puasa sunnah Senin-Kamis dan Ayyamul Bidh di Kalender Ibadah.',
      time: 'Update',
      type: 'event',
      read: true,
    },
  ]);

  // Update prayer notification when nextPrayer changes
  useEffect(() => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === 'notif-prayer'
          ? {
              ...n,
              title: `Waktu ${nextPrayer.name} Segera Tiba`,
              message: `Jadwal ${nextPrayer.name} pukul ${nextPrayer.timeString} (${nextPrayer.remainingFormatted} lagi). Persiapkan diri & wudhu.`,
            }
          : n
      )
    );
  }, [nextPrayer.name, nextPrayer.timeString, nextPrayer.remainingFormatted]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationItemClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.type === 'prayer') {
      setActiveTab('prayer-times');
    } else if (notif.type === 'habit') {
      setActiveTab('habit');
    } else if (notif.type === 'event') {
      setActiveTab('calendar');
    }
    setIsNotificationOpen(false);
  };

  // Keyboard shortcut for Search (Ctrl+K or ⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notification flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const userName = settings.userName?.trim() || 'Hamba Allah';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <header
        className="w-full bg-white border-b border-slate-200/80 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 sticky top-0 z-30 shadow-2xs"
        id="app-topbar-modern"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left: Mobile Menu Trigger + Search Bar */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0 max-w-2xl">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              id="topbar-mobile-menu-btn"
              aria-label="Buka Menu Navigasi"
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shrink-0 active:scale-95"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </button>

            {/* 1. Pencarian (Search Bar) Input Component */}
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setSearchInitialQuery('');
                  setIsSearchOpen(true);
                }}
                id="topbar-search-trigger"
                className="w-full h-8 sm:h-11 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left flex items-center justify-between gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-2xs group focus:ring-2 focus:ring-emerald-500/20 min-w-0"
              >
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 group-hover:text-emerald-800 shrink-0" />
                  <span className="text-[11px] sm:text-sm text-slate-400 group-hover:text-slate-600 truncate font-medium">
                    Cari surat, doa, atau artikel kajian...
                  </span>
                </div>

                
              </button>
            </div>
          </div>

          {/* Right: 2. Notifikasi & 3. Profil / Akun */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* 2. Notifikasi: Ikon Lonceng Pengingat Waktu Sholat & Update */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                id="topbar-notification-btn"
                aria-label="Notifikasi dan Pengingat"
                className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 shrink-0 ${
                  isNotificationOpen
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/90 text-slate-700'
                }`}
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />

                {/* Unread badge indicator */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center shadow-xs border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Flyout Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-x-2.5 top-14 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.25rem)] sm:max-w-none bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 z-50 overflow-hidden"
                    id="notification-flyout-dropdown"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Pusat Notifikasi & Pengingat
                        </h4>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Tandai Dibaca</span>
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => handleNotificationItemClick(notif)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                            notif.read
                              ? 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 text-slate-600'
                              : 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/60 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.type === 'prayer' ? (
                              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                            ) : notif.type === 'habit' ? (
                              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                <Flame className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {notif.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Quick Setting Sound Toggle inside Flyout */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        {settings.audioMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>Suara & Notifikasi Adzan</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateSettings({ audioMuted: !settings.audioMuted })
                        }
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                          settings.audioMuted
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {settings.audioMuted ? 'Muted (Nonaktif)' : 'Aktif'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Profil / Akun: Avatar User & Profile Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              id="topbar-profile-btn"
              aria-label="Buka Profil dan Akun"
              className="flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:p-1 sm:pr-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-all cursor-pointer active:scale-95 shadow-2xs group shrink-0"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center shadow-xs border border-emerald-400/50">
                  {userInitial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 block truncate max-w-[100px] md:max-w-[130px] leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block leading-none mt-0.5">
                  🔥 {currentStreak} Hari
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 hidden sm:block shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchInitialQuery}
      />

      {/* Profile & Account Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
