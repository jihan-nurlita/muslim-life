import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  MapPin,
  Clock,
  Bell,
  Volume2,
  VolumeX,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  User,
  Heart,
  Globe,
  Play,
  Square,
  AlertTriangle,
  X,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CALCULATION_METHODS } from '../utils/prayerCalculator';
import { LocationModal } from '../components/modals/LocationModal';
import { soundController, FAMOUS_MUADZINS, resolveAdzanMuadzin } from '../utils/soundEffects';

interface FeedbackMessage {
  type: 'success' | 'error';
  text: string;
  details?: string;
}

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportDataJSON, importDataJSON, resetAllData } = useApp();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [userNameInput, setUserNameInput] = useState(settings.userName);
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPlayingAdzan, setIsPlayingAdzan] = useState(false);

  // Sync username input if settings update
  useEffect(() => {
    setUserNameInput(settings.userName);
  }, [settings.userName]);

  // Sync playing adzan status from soundController
  useEffect(() => {
    const unsubscribe = soundController.subscribe((playing) => {
      setIsPlayingAdzan(playing);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSaveUserName = () => {
    const trimmed = userNameInput.trim() || 'Sahabat Muslim';
    updateSettings({ userName: trimmed });
    setFeedbackMessage({
      type: 'success',
      text: 'Nama pengguna berhasil diperbarui!',
      details: `Nama ditampilkan sebagai "${trimmed}".`,
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // 1. Audio Azan Preview Toggle
  const handleTogglePlayPreview = () => {
    const activeMuadzinId = settings.adzanSound || 'ali-ahmad-mulla';
    if (isPlayingAdzan) {
      soundController.stopAdzan();
    } else {
      soundController.playAdzanPreview(activeMuadzinId);
    }
  };

  const selectedMuadzin = useMemo(() => {
    return resolveAdzanMuadzin(settings.adzanSound);
  }, [settings.adzanSound]);

  // 2. Export Backup JSON Handler
  const handleExportBackup = () => {
    try {
      const rawJson = exportDataJSON();
      const blob = new Blob([rawJson], { type: 'application/json;charset=utf-8' });
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const filename = `muslimlife-cadangan-${datePart}-${timePart}.json`;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      const sizeKB = (blob.size / 1024).toFixed(1);
      setFeedbackMessage({
        type: 'success',
        text: 'File cadangan berhasil diekspor dan diunduh!',
        details: `File "${filename}" (${sizeKB} KB) tersimpan aman di perangkat Anda.`,
      });
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: 'Gagal mengekspor file cadangan.',
        details: err?.message || 'Terjadi kendala teknis saat mengompresi data.',
      });
    }
  };

  // 3. Import Backup JSON Handler with thorough validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json') && file.type && !file.type.includes('json')) {
      setFeedbackMessage({
        type: 'error',
        text: 'Format berkas tidak sesuai.',
        details: 'Harap pilih file dengan ekstensi .json hasil ekspor cadangan aplikasi MuslimLife.',
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const result = importDataJSON(content);

        if (result.success) {
          const s = result.summary;
          const detailStr = s
            ? `Berhasil memulihkan ${s.daysCount} hari riwayat ibadah, ${s.habitsCount} habit, ${s.bookmarksCount} bookmark Quran, dan ${s.notesCount} catatan.`
            : result.message;

          setFeedbackMessage({
            type: 'success',
            text: 'Data cadangan berhasil dipulihkan secara permanen!',
            details: detailStr,
          });
        } else {
          setFeedbackMessage({
            type: 'error',
            text: 'Pemulihan data gagal.',
            details: result.message,
          });
        }
      } catch (err: any) {
        setFeedbackMessage({
          type: 'error',
          text: 'Gagal memproses berkas cadangan.',
          details: 'Format isi berkas tidak valid atau tidak cocok dengan skema aplikasi.',
        });
      }
      e.target.value = '';
    };

    reader.onerror = () => {
      setFeedbackMessage({
        type: 'error',
        text: 'Gagal membaca file dari penyimpanan lokal.',
      });
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  // 4. Reset All User Data Handler
  const handlePerformReset = () => {
    resetAllData();
    setIsResetModalOpen(false);
    setFeedbackMessage({
      type: 'success',
      text: 'Seluruh data pengguna berhasil direset ke awal.',
      details: 'Data aktivitas, Habit, riwayat, statistik, bookmark, dan catatan telah dibersihkan. Data Al-Qur\'an, doa, dan dzikir bawaan tetap aman.',
    });
    setTimeout(() => setFeedbackMessage(null), 7000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10" id="settings-view">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-slate-500">
          Sesuaikan preferensi lokasi, metode hisab sholat, audio adzan, notifikasi & pencadangan data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Profil & Lokasi */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Profil & Nama Pengguna</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Nama Panggilan Anda:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  placeholder="Nama Sahabat Muslim"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50"
                  id="settings-username-input"
                />
                <button
                  type="button"
                  onClick={handleSaveUserName}
                  id="settings-save-username-btn"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>

            {/* Lokasi Aktif */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Kota & Koordinat Jadwal Sholat:</label>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {settings.city}, {settings.country}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {settings.latitude.toFixed(3)}° LU, {settings.longitude.toFixed(3)}° BT
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationOpen(true)}
                  id="settings-change-location-btn"
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-emerald-700 hover:bg-slate-50"
                >
                  Ubah Lokasi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Metode Perhitungan Waktu Sholat */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Metode Hisab Waktu Sholat</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Otoritas / Standar Hisab:</label>
              <select
                value={settings.calculationMethod}
                onChange={(e: any) => updateSettings({ calculationMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 font-medium"
                id="settings-calc-method-select"
              >
                {CALCULATION_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Subuh: {m.fajrAngle}°, Isya: {m.ishaAngle}°)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-600 leading-relaxed">
              Standar <strong className="text-emerald-950">Kemenag RI (Indonesia)</strong> menggunakan sudut fajar Subuh 20.0° dan Isya 18.0°, sesuai ketetapan sidang isbat Kemenag Republik Indonesia.
            </div>
          </div>
        </div>

        {/* 3. Suara Adzan & Efek Suara */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Volume2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Suara Adzan & Efek Suara</h3>
          </div>

          <div className="space-y-3">
            {/* Pilihan Muadzin Adzan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Pilihan Muadzin Adzan:</label>
              <select
                value={settings.adzanSound || 'ali-ahmad-mulla'}
                onChange={(e) => {
                  const newSound = e.target.value;
                  updateSettings({ adzanSound: newSound });
                  if (isPlayingAdzan) {
                    soundController.playAdzanPreview(newSound);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 font-medium"
                id="settings-muadzin-select"
              >
                {FAMOUS_MUADZINS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Suara Adzan Tester Card with Real Audio Playback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {selectedMuadzin.name}
                  </span>
                  {isPlayingAdzan && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white animate-pulse">
                      Memutar...
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-emerald-800 font-medium block truncate">
                  {selectedMuadzin.location}
                </span>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                  {selectedMuadzin.description}
                </span>
              </div>
              <button
                type="button"
                onClick={handleTogglePlayPreview}
                id="settings-test-adzan-btn"
                className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs ${
                  isPlayingAdzan
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isPlayingAdzan ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Hentikan</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tes Suara</span>
                  </>
                )}
              </button>
            </div>

            {/* Switch 1: Manual ON/OFF Suara Azan */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Suara Panggilan Adzan</span>
                <span className="text-[10px] text-slate-500">Putar suara azan asli muadzin saat waktu sholat tiba</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ adzanSoundEnabled: settings.adzanSoundEnabled === false ? true : false })}
                id="settings-toggle-adzan-sound-btn"
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                  settings.adzanSoundEnabled !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {settings.adzanSoundEnabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Switch 2: Manual ON/OFF Efek Suara Aplikasi */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Efek Suara Aplikasi</span>
                <span className="text-[10px] text-slate-500">Audio lonceng saat mencapai target dzikir & milestone ibadah</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ soundEffectsEnabled: settings.soundEffectsEnabled === false ? true : false })}
                id="settings-toggle-sound-effects-btn"
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                  settings.soundEffectsEnabled !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {settings.soundEffectsEnabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Switch 3: Manual ON/OFF Suara Ketukan Tasbih */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Suara Ketukan Tasbih</span>
                <span className="text-[10px] text-slate-500">Bunyi klik taktil lembut saat menekan tombol tasbih digital</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ tasbihSoundEnabled: settings.tasbihSoundEnabled === false ? true : false })}
                id="settings-toggle-tasbih-sound-btn"
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                  settings.tasbihSoundEnabled !== false
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {settings.tasbihSoundEnabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Target Khatam Setting */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 block">Target Khatam Al-Qur'an (Hari):</label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.khatamTargetDays}
                onChange={(e) => updateSettings({ khatamTargetDays: Number(e.target.value) || 30 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 font-medium"
                id="settings-khatam-days-input"
              />
            </div>
          </div>
        </div>

        {/* 4. Pencadangan & Keamanan Data */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Pencadangan & Keamanan Data</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Seluruh riwayat ibadah, habit, bookmark Quran, dan catatan tersimpan secara aman di peramban Anda. Anda dapat mengekspor atau memulihkan data kapan saja.
            </p>

            {/* Feedback Message Banner */}
            <AnimatePresence>
              {feedbackMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`p-3 rounded-2xl text-xs font-medium border flex items-start gap-2.5 ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {feedbackMessage.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-bold block">{feedbackMessage.text}</span>
                    {feedbackMessage.details && (
                      <span className="text-[11px] opacity-90 block mt-0.5 leading-relaxed">
                        {feedbackMessage.details}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedbackMessage(null)}
                    className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                id="export-data-btn"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-98"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Ekspor Cadangan
              </button>

              <label
                id="import-data-label"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <Upload className="w-4 h-4 text-teal-600" />
                Impor Data
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset All */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                id="reset-all-data-btn"
                className="w-full py-2.5 px-3 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Seluruh Data Aplikasi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset All Data */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Konfirmasi Reset Data</h3>
                  <p className="text-xs text-slate-500">Tindakan ini akan mengosongkan riwayat pengguna</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs text-rose-950 space-y-2 leading-relaxed">
                <p className="font-semibold">
                  Apakah Anda yakin ingin mereset seluruh data pengguna ke awal?
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                  <li>Data aktivitas, Habit, riwayat sholat, tilawah, dan statistik akan dibersihkan.</li>
                  <li>Bookmark Quran dan catatan pribadi Anda akan dihapus.</li>
                  <li>
                    <strong className="text-emerald-800 font-bold">Data bawaan aplikasi</strong> (seluruh isi Al-Qur'an 30 Juz, doa-doa, dan dzikir bawaan) <strong className="text-emerald-800 font-bold">tetap aman</strong> dan tidak akan terhapus.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handlePerformReset}
                  id="confirm-reset-all-btn"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Ya, Reset Seluruh Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </div>
  );
};
