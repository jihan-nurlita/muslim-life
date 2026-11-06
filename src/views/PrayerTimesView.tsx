import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  MapPin,
  Compass,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  Globe,
  Sliders,
  Settings2,
  Check,
  RotateCcw,
  Users,
  User,
  Calendar as CalendarIcon,
  HelpCircle,
  Play,
  Flame,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrayerTimeName, PrayerStatus, HalanganReason } from '../types';
import { calculateQiblaAngle, POPULAR_CITIES, CALCULATION_METHODS } from '../utils/prayerCalculator';
import { soundController, FAMOUS_MUADZINS } from '../utils/soundEffects';
import { getHijriDate } from '../data/islamicCalendar';
import { LocationModal } from '../components/modals/LocationModal';
import { QiblaModal } from '../components/modals/QiblaModal';
import { parseLocalDate } from '../utils/dateUtils';

const SOUND_OPTIONS: { id: string; label: string; desc: string }[] = [
  ...FAMOUS_MUADZINS.map((m) => ({
    id: m.id,
    label: `${m.name} (${m.location})`,
    desc: m.description,
  })),
  { id: 'gentle-chime', label: 'Gentle Chime Bell', desc: 'Nada lonceng harmonis lembut' },
  { id: 'beep-soft', label: 'Soft Beep Alert', desc: 'Nada bip ringkas & minimalis' },
];

const REMINDER_MINUTE_OPTIONS = [5, 10, 15, 20, 30];

export const PrayerTimesView: React.FC = () => {
  const {
    prayerTimes,
    nextPrayer,
    settings,
    updateSettings,
    todayRecord,
    selectedDayRecord,
    setPrayerStatus,
    selectedDate,
    setSelectedDate,
    setHalanganModalPrayer,
  } = useApp();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isQiblaModalOpen, setIsQiblaModalOpen] = useState(false);
  const [activeSettingsPrayer, setActiveSettingsPrayer] = useState<PrayerTimeName | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // Date information
  const dateObj = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const hijriInfo = useMemo(() => getHijriDate(dateObj), [dateObj]);

  // Kiblat Angle
  const qiblaAngle = useMemo(
    () => calculateQiblaAngle(settings.latitude, settings.longitude),
    [settings.latitude, settings.longitude]
  );

  const ALL_PRAYERS: {
    name: PrayerTimeName;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isFardhu: boolean;
    description: string;
    rakaat?: number;
  }[] = [
    { name: 'Imsak', label: 'Imsak', icon: Moon, isFardhu: false, description: '10 menit sebelum fajar Subuh' },
    { name: 'Subuh', label: 'Subuh', icon: Sunrise, isFardhu: true, description: 'Sholat fardhu 2 rakaat awal hari', rakaat: 2 },
    { name: 'Syuruq', label: 'Syuruq (Terbit)', icon: Sunrise, isFardhu: false, description: 'Matahari mulai terbit' },
    { name: 'Dhuha', label: 'Dhuha', icon: Sparkles, isFardhu: false, description: 'Sholat dhuha pembuka pintu rezeki' },
    { name: 'Dzuhur', label: 'Dzuhur', icon: Sun, isFardhu: true, description: 'Sholat fardhu 4 rakaat tengah hari', rakaat: 4 },
    { name: 'Ashar', label: 'Ashar', icon: CloudSun, isFardhu: true, description: 'Sholat fardhu 4 rakaat sore hari', rakaat: 4 },
    { name: 'Maghrib', label: 'Maghrib', icon: Sunset, isFardhu: true, description: 'Sholat fardhu 3 rakaat saat terbenam', rakaat: 3 },
    { name: 'Isya', label: 'Isya', icon: Moon, isFardhu: true, description: 'Sholat fardhu 4 rakaat malam hari', rakaat: 4 },
  ];

  // GPS Auto-detect handler
  const handleAutoGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung geolokasi GPS.');
      return;
    }

    setIsLocatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingGPS(false);
        updateSettings({
          city: 'Lokasi Terdeteksi (GPS)',
          country: 'Koordinat Presisi',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isAutoLocation: true,
        });
      },
      (err) => {
        setIsLocatingGPS(false);
        setGpsError('Gagal mengakses GPS. Pastikan izin lokasi aktif atau pilih wilayah manual.');
      },
      { timeout: 10000 }
    );
  };

  // Toggle individual prayer reminder
  const handleToggleReminder = (prayer: PrayerTimeName) => {
    const current = settings.prayerReminders[prayer] || {
      adzanEnabled: true,
      reminderMinutesBefore: 10,
      sound: settings.adzanSound || 'adzan-makkah',
    };
    updateSettings({
      prayerReminders: {
        ...settings.prayerReminders,
        [prayer]: {
          ...current,
          adzanEnabled: !current.adzanEnabled,
        },
      },
    });
  };

  // Update specific reminder properties
  const handleUpdateReminderConfig = (
    prayer: PrayerTimeName,
    updates: Partial<{
      adzanEnabled: boolean;
      reminderMinutesBefore: number;
      sound: 'adzan-makkah' | 'adzan-madinah' | 'beep-soft' | 'gentle-chime';
    }>
  ) => {
    const current = settings.prayerReminders[prayer] || {
      adzanEnabled: true,
      reminderMinutesBefore: 10,
      sound: settings.adzanSound || 'adzan-makkah',
    };

    updateSettings({
      prayerReminders: {
        ...settings.prayerReminders,
        [prayer]: {
          ...current,
          ...updates,
        },
      },
    });
  };

  // Sync with sound controller
  useEffect(() => {
    const unsubscribe = soundController.subscribe((isPlaying, soundId) => {
      setPlayingSoundId(isPlaying ? soundId : null);
    });
    return () => unsubscribe();
  }, []);

  // Sound test handler
  const handleTestSound = (soundType: string) => {
    if (soundController.isPlaying() && playingSoundId === soundType) {
      soundController.stopAdzan();
      setPlayingSoundId(null);
      return;
    }
    setPlayingSoundId(soundType);
    soundController.playAdzanPreview(soundType);
  };

  // Open Halangan Modal for a prayer
  const handleOpenHalangan = (prayer: PrayerTimeName) => {
    setHalanganModalPrayer(prayer);
  };

  return (
    <div className="space-y-6 pb-12 select-none" id="prayer-times-view">
      {/* 1. Header & Location Controls Bar */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Jadwal Waktu Sholat
            </h2>
            <p className="text-xs text-slate-500">
              Waktu sholat fardhu & sunnah disinkronkan otomatis sesuai zona koordinat wilayah Anda
            </p>
          </div>

          {/* Location Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              id="manual-location-btn"
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/90 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="truncate max-w-[140px]">{settings.city}</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Ubah Wilayah
              </span>
            </button>
          </div>
        </div>

        {/* GPS Error Notification if any */}
        {gpsError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center justify-between">
            <span>{gpsError}</span>
            <button
              type="button"
              onClick={() => setGpsError(null)}
              className="font-bold underline text-rose-800 ml-2"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Date Specs */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">{hijriInfo.formatted}</span>
            <span className="text-slate-400">•</span>
            <span>{dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Next Prayer & Live Countdown Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-4">
          <Moon className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs w-fit">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Waktu Sholat Selanjutnya</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQiblaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              <span>Kiblat {qiblaAngle.toFixed(0)}°</span>
            </button>

            <button
              type="button"
              onClick={() => handleTestSound(settings.adzanSound || 'adzan-makkah')}
              id="header-test-sound-btn"
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Volume2 className={`w-3.5 h-3.5 ${playingSoundId ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{playingSoundId ? 'Memutar Suara...' : 'Tes Suara Adzan'}</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {nextPrayer.name}
              </h3>
              <span className="text-2xl sm:text-3xl font-mono text-emerald-200 font-bold">
                {nextPrayer.timeString}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Menghitung mundur waktu sholat untuk wilayah {settings.city} dan sekitarnya.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/15 text-right sm:text-right shrink-0">
            <span className="text-xs text-emerald-200 block">Sisa Waktu Menuju Adzan</span>
            <span className="font-mono text-white text-2xl font-black tracking-tight block">
              {nextPrayer.remainingFormatted}
            </span>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span>Interval Menuju {nextPrayer.name}</span>
            <span className="text-emerald-100 font-mono font-semibold">
              {Math.round(nextPrayer.progressPercent)}% Selesai
            </span>
          </div>

          <div className="w-full bg-black/25 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-300 to-teal-200 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(5, Math.min(100, nextPrayer.progressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Prayer Schedule & Per-Prayer Control Cards */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Jadwal Sholat Lengkap & Pencatatan</h3>
            <p className="text-xs text-slate-500">
              Tandai ibadah sholat, catat udzur syar'i, dan atur reminder khusus setiap waktu sholat
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Global Suara:</span>
            <select
              value={settings.adzanSound || 'adzan-makkah'}
              onChange={(e) => updateSettings({ adzanSound: e.target.value as any })}
              className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              {SOUND_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {ALL_PRAYERS.map((item) => {
            const Icon = item.icon;
            const timeStr = prayerTimes[item.name] || '--:--';
            const isNext = nextPrayer.name === item.name;
            const reminderConfig = settings.prayerReminders[item.name] || {
              adzanEnabled: true,
              reminderMinutesBefore: 10,
              sound: settings.adzanSound || 'adzan-makkah',
            };
            const isReminderOn = reminderConfig.adzanEnabled;
            const record = selectedDayRecord?.prayers?.[item.name] || { status: 'pending' };
            const isCompleted = record.status === 'completed';
            const isHalangan = record.status === 'halangan';
            const isSettingsOpen = activeSettingsPrayer === item.name;

            return (
              <div
                key={item.name}
                id={`prayer-schedule-row-${item.name.toLowerCase()}`}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isNext
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                    : isHalangan
                    ? 'border-rose-200 bg-rose-50/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                {/* Main Row Content */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Icon & Name */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isNext
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isHalangan
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-base">{item.label}</span>
                        {item.isFardhu && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {item.rakaat} Rakaat Fardhu
                          </span>
                        )}
                        {isNext && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 animate-pulse">
                            Waktu Berikutnya
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {/* Middle Column: Exact Time & Status Badge */}
                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-800 block">
                        {timeStr}
                      </span>
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            {record.isJamaah ? 'Selesai Berjamaah' : 'Selesai Munfarid'}
                          </span>
                        ) : isHalangan ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md">
                            <ShieldAlert className="w-3 h-3" />
                            {record.halanganReason ? `Ada Udzur: ${record.halanganReason}` : 'Ada Halangan'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">Belum Ditandai</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                    {(item.isFardhu || item.name === 'Dhuha') && (
                      <>
                        {/* 1. Mark Completed (Munfarid / Selesai) */}
                        <button
                          type="button"
                          onClick={() =>
                            setPrayerStatus(item.name, isCompleted && !record.isJamaah ? 'pending' : 'completed', {
                              isJamaah: false,
                              date: selectedDate,
                            })
                          }
                          id={`prayer-btn-munfarid-${item.name.toLowerCase()}`}
                          title="Tandai Selesai"
                          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isCompleted && !record.isJamaah
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>{item.isFardhu ? 'Munfarid' : 'Selesai'}</span>
                        </button>

                        {/* 2. Mark Completed (Jamaah - Fardhu only) */}
                        {item.isFardhu && (
                          <button
                            type="button"
                            onClick={() =>
                              setPrayerStatus(item.name, isCompleted && record.isJamaah ? 'pending' : 'completed', {
                                isJamaah: true,
                                date: selectedDate,
                              })
                            }
                            id={`prayer-btn-jamaah-${item.name.toLowerCase()}`}
                            title="Tandai Selesai Berjamaah"
                            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isCompleted && record.isJamaah
                                ? 'bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Berjamaah</span>
                          </button>
                        )}

                        {/* 3. Mark Halangan / Udzur Syar'i */}
                        <button
                          type="button"
                          onClick={() => handleOpenHalangan(item.name)}
                          id={`prayer-btn-halangan-${item.name.toLowerCase()}`}
                          title="Catat Alasan Halangan / Udzur"
                          className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isHalangan
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700'
                          }`}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* 4. Toggle Reminder / Settings */}
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(item.name)}
                      id={`prayer-toggle-reminder-${item.name.toLowerCase()}`}
                      title={isReminderOn ? 'Reminder Adzan Aktif' : 'Reminder Adzan Nonaktif'}
                      className={`p-2 rounded-xl text-xs transition-all ${
                        isReminderOn
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {isReminderOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>

                    {/* 5. Open Per-Prayer Settings Drawer */}
                    <button
                      type="button"
                      onClick={() => setActiveSettingsPrayer(isSettingsOpen ? null : item.name)}
                      id={`prayer-settings-toggle-${item.name.toLowerCase()}`}
                      title="Atur Menit Pengingat & Suara Adzan"
                      className={`p-2 rounded-xl text-xs transition-all ${
                        isSettingsOpen
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Per-Prayer Reminder Configuration */}
                {isSettingsOpen && (
                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Pengaturan Pengingat & Suara untuk {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500">Konfigurasi Mandiri</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Reminder Before Minutes */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Waktu Pengingat Sebelum Adzan:
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {REMINDER_MINUTE_OPTIONS.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleUpdateReminderConfig(item.name, { reminderMinutesBefore: m })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                reminderConfig.reminderMinutesBefore === m
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {m} Menit
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sound Type Selection */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Pilihan Suara Notifikasi:
                        </label>
                        <select
                          value={reminderConfig.sound || 'adzan-makkah'}
                          onChange={(e) =>
                            handleUpdateReminderConfig(item.name, { sound: e.target.value as any })
                          }
                          className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {SOUND_OPTIONS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Test Sound Button */}
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleTestSound(reminderConfig.sound || 'adzan-makkah')}
                          className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Uji Nada Suara</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Location Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* 5. Qibla Direction Modal */}
      <QiblaModal
        isOpen={isQiblaModalOpen}
        onClose={() => setIsQiblaModalOpen(false)}
        qiblaAngle={qiblaAngle}
      />
    </div>
  );
};
