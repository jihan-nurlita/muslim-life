import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Sun,
  Sunset,
  Moon,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  Bookmark,
  Share2,
  Edit3,
  Trash2,
  ArrowLeft,
  Search,
  Copy,
  Check,
  Play,
  Pause,
  BookOpen,
  X,
  Layers,
  ListOrdered,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DzikirItem } from '../types';
import { AddDzikirModal } from '../components/modals/AddDzikirModal';
import { soundController } from '../utils/soundEffects';
import { INITIAL_DZIKIR_LIST } from '../data/dzikirData';

type ViewStage = 'list' | 'detail' | 'tasbih';

export const DzikirView: React.FC = () => {
  const {
    dzikirList,
    activeDzikirId,
    setActiveDzikirId,
    incrementDzikir,
    resetDzikir,
    updateDzikir,
    deleteDzikir,
    setDzikirTarget,
    restoreOriginalDzikir,
    restoreAllDefaultDzikir,
    settings,
    updateSettings,
    selectedDate,
    dayRecords,
    todayRecord,
  } = useApp();

  // 3-Stage Navigation State:
  // 'list' (Tahap 1: Daftar Dzikir & Kategori)
  // 'detail' (Tahap 2: Rincian Lengkap Dzikir, Fadhilah, Audio)
  // 'tasbih' (Tahap 3: Mode Tasbih Digital Fokus)
  const [viewStage, setViewStage] = useState<ViewStage>('list');

  // Selected Dzikir State
  const [selectedDzikirIdState, setSelectedDzikirIdState] = useState<string>(() => {
    return activeDzikirId || (dzikirList.length > 0 ? dzikirList[0].id : '');
  });

  // Filter & Search State (Tahap 1)
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Edit State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDzikir, setEditingDzikir] = useState<DzikirItem | null>(null);

  // Delete Confirmation Modal State
  const [dzikirToDelete, setDzikirToDelete] = useState<DzikirItem | null>(null);

  // Custom Target Modal / Inline Input State (Tahap 2 & 3)
  const [isCustomTargetModalOpen, setIsCustomTargetModalOpen] = useState(false);
  const [customTargetInputValue, setCustomTargetInputValue] = useState<string>('100');

  // Audio / Speech Synthesis & Copy State (Tahap 2)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vibration toggle state (Tahap 3)
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

  // Synchronize selected dzikir safely
  const selectedDzikir = useMemo(() => {
    const found = dzikirList.find((d) => d.id === selectedDzikirIdState);
    if (found) return found;
    const fallbackActive = dzikirList.find((d) => d.id === activeDzikirId);
    if (fallbackActive) return fallbackActive;
    return dzikirList[0] || INITIAL_DZIKIR_LIST[0];
  }, [dzikirList, selectedDzikirIdState, activeDzikirId]);

  // Keep activeDzikirId in sync when selectedDzikir changes
  useEffect(() => {
    if (selectedDzikir && selectedDzikir.id !== activeDzikirId) {
      setActiveDzikirId(selectedDzikir.id);
    }
  }, [selectedDzikir, activeDzikirId, setActiveDzikirId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const CATEGORIES = [
    { id: 'all', label: 'Semua Dzikir', icon: Layers },
    { id: 'pagi', label: 'Dzikir Pagi', icon: Sun },
    { id: 'petang', label: 'Dzikir Petang', icon: Sunset },
    { id: 'sholat', label: 'Setelah Sholat', icon: Clock },
    { id: 'sholawat', label: 'Sholawat Nabi', icon: Heart },
    { id: 'tidur', label: 'Sebelum Tidur', icon: Moon },
    { id: 'harian', label: 'Dzikir Harian', icon: Bookmark },
    { id: 'custom', label: 'Custom / Pilihan', icon: Sparkles },
  ];

  // Filtered Dzikir for Tahap 1
  const filteredDzikir = useMemo(() => {
    return dzikirList.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.textLatin.toLowerCase().includes(q) ||
        item.textArabic.includes(searchQuery) ||
        item.meaning.toLowerCase().includes(q) ||
        (item.benefit && item.benefit.toLowerCase().includes(q))
      );
    });
  }, [dzikirList, activeCategory, searchQuery]);

  // Navigation Handlers between stages
  const handleOpenDetail = (item: DzikirItem) => {
    setSelectedDzikirIdState(item.id);
    setActiveDzikirId(item.id);
    setViewStage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTasbih = (item?: DzikirItem) => {
    if (item) {
      setSelectedDzikirIdState(item.id);
      setActiveDzikirId(item.id);
    }
    setViewStage('tasbih');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setViewStage('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDetail = () => {
    setViewStage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next / Prev Dzikir Navigation
  const handleNextDzikir = () => {
    const currentIndex = dzikirList.findIndex((d) => d.id === selectedDzikir.id);
    if (currentIndex !== -1 && currentIndex < dzikirList.length - 1) {
      const next = dzikirList[currentIndex + 1];
      setSelectedDzikirIdState(next.id);
      setActiveDzikirId(next.id);
    }
  };

  const handlePrevDzikir = () => {
    const currentIndex = dzikirList.findIndex((d) => d.id === selectedDzikir.id);
    if (currentIndex > 0) {
      const prev = dzikirList[currentIndex - 1];
      setSelectedDzikirIdState(prev.id);
      setActiveDzikirId(prev.id);
    }
  };

  // Audio recitation
  const handleToggleAudio = () => {
    if (typeof window === 'undefined') return;

    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedDzikir.textArabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        soundController.playTasbihClick();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      soundController.playTasbihClick();
      showToast('Audio pelafalan siap.');
    }
  };

  // Copy Dzikir Text
  const handleCopyDzikir = () => {
    const text = `[${selectedDzikir.title}]\n\n${selectedDzikir.textArabic}\n\n"${selectedDzikir.textLatin}"\n\nArtinya: "${selectedDzikir.meaning}"\n\n${
      selectedDzikir.benefit ? `Keutamaan: ${selectedDzikir.benefit}\n` : ''
    }(Dibaca melalui MuslimLife App)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedText(true);
        showToast('Dzikir berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedText(false), 2000);
      });
    }
  };

  // Share Dzikir
  const handleShareDzikir = async () => {
    const text = `[${selectedDzikir.title}]\n\n${selectedDzikir.textArabic}\n\n"${selectedDzikir.textLatin}"\n\nArtinya: "${selectedDzikir.meaning}"`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: selectedDzikir.title,
          text,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      handleCopyDzikir();
    }
  };

  // Target count modification (33, 100, 1000, 5000, Custom)
  // Preserves existing currentCount and history records intact!
  const TARGET_PRESETS = [33, 100, 1000, 5000];

  const handleApplyTarget = (newTarget: number) => {
    const validated = Math.max(1, Math.floor(newTarget) || 33);
    setDzikirTarget(selectedDzikir.id, validated);
    showToast(`Target ${selectedDzikir.title} diubah menjadi ${validated.toLocaleString('id-ID')}x`);
    setIsCustomTargetModalOpen(false);
  };

  // Delete Dzikir with confirmation
  const handleConfirmDelete = () => {
    if (!dzikirToDelete) return;
    const targetId = dzikirToDelete.id;
    deleteDzikir(targetId);
    showToast(`Dzikir "${dzikirToDelete.title}" berhasil dihapus.`);
    setDzikirToDelete(null);

    // If currently in detail or tasbih view of that dzikir, navigate back to list
    if (selectedDzikirIdState === targetId) {
      setViewStage('list');
    }
  };

  // Interactive Tasbih Tap in Tahap 3
  const handleTasbihTap = () => {
    incrementDzikir(selectedDzikir.id);

    // Audio click feedback
    if (settings.tasbihSoundEnabled !== false && settings.soundEffectsEnabled !== false) {
      soundController.playTasbihClick();
    }

    // Vibration feedback
    if (isVibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleQuickAdd = (step: number) => {
    incrementDzikir(selectedDzikir.id, step);
    showToast(`+${step} hitungan`);
  };

  const handleResetCount = () => {
    resetDzikir(selectedDzikir.id);
    soundController.playTasbihClick();
    showToast('Hitungan tasbih berhasil direset ke 0');
  };

  const targetDate = selectedDate || (todayRecord?.date || '');
  const activeDayRec = dayRecords[targetDate] || todayRecord;
  const currentActualCount = (activeDayRec?.dzikirCounts && typeof activeDayRec.dzikirCounts[selectedDzikir.id] === 'number')
    ? activeDayRec.dzikirCounts[selectedDzikir.id]
    : (selectedDzikir.currentCount || 0);

  const progressPercent = Math.min(
    100,
    Math.round((currentActualCount / Math.max(1, selectedDzikir.targetCount)) * 100)
  );

  const isTargetAchieved = selectedDzikir.targetCount > 0 && currentActualCount >= selectedDzikir.targetCount;
  const isSelectedBuiltIn = INITIAL_DZIKIR_LIST.some((d) => d.id === selectedDzikir.id);
  const hasModifiedOrDeletedDefaults = dzikirList.length < INITIAL_DZIKIR_LIST.length || dzikirList.some((d) => d.isPersonalCopy || d.isEdited);

  return (
    <div className="space-y-6 pb-28 lg:pb-16 text-slate-800" id="dzikir-view-container">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAHAP 1: DAFTAR DZIKIR & KATEGORI (FULL-WIDTH COMPACT LIST VIEW)          */}
        {/* ========================================================================= */}
        {viewStage === 'list' && (
          <motion.div
            key="dzikir-stage-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Dzikir & Tasbih Digital
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Sunnah & Shahih
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kumpulan dzikir pagi-petang, ba'da sholat, sholawat, doa harian & pengaturan target tasbih
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {hasModifiedOrDeletedDefaults && (
                  <button
                    type="button"
                    onClick={() => {
                      restoreAllDefaultDzikir();
                      showToast('Semua dzikir bawaan berhasil dipulihkan!');
                    }}
                    id="btn-restore-all-defaults"
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    title="Pulihkan semua dzikir bawaan tanpa menghapus dzikir custom buatan Anda"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pulihkan Dzikir Bawaan</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingDzikir(null);
                    setIsAddModalOpen(true);
                  }}
                  id="btn-add-dzikir-manual"
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/10 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Dzikir Manual</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Summary Banner */}
            <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-lg shadow-emerald-950/10 border border-emerald-700/50">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-6">
                <span className="font-amiri text-8xl">الذِّكْر</span>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shrink-0 shadow-inner">
                    <Sparkles className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] text-emerald-200 font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">
                        Statistik Tilawah & Dzikir Hari Ini
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {todayRecord.totalDzikirCount}x Dzikir Dihitung
                    </h3>
                    <p className="text-xs text-emerald-100/80">
                      Pilih dzikir di bawah untuk membuka detail, menyesuaikan target, atau memulai tasbih fokus
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartTasbih(selectedDzikir)}
                    id="btn-quick-start-active-tasbih"
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-900 text-emerald-900" />
                    <span>Lanjutkan Tasbih Terakhir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul dzikir, lafadz Arab, latin, arti, atau fadhilah..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                    id="dzikir-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Counter Badge */}
                <div className="text-xs font-semibold text-slate-500 px-2 shrink-0 text-right">
                  Menampilkan <span className="font-bold text-emerald-800">{filteredDzikir.length}</span> Dzikir
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count =
                    cat.id === 'all'
                      ? dzikirList.length
                      : dzikirList.filter((d) => d.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      id={`tab-category-${cat.id}`}
                      className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 text-xs ${
                        activeCategory === cat.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dzikir Grid (Full Width & Compact Layout) */}
            {filteredDzikir.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  Tidak ditemukan dzikir yang cocok dengan filter atau kata kunci "{searchQuery}".
                </p>
                <p className="text-xs text-slate-400">
                  Coba ganti kategori dzikir atau ketik kata kunci lain seperti "Subhanallah", "Sholawat", atau "Istighfar".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDzikir.map((item) => {
                  const itemActualCount = (activeDayRec?.dzikirCounts && typeof activeDayRec.dzikirCounts[item.id] === 'number')
                    ? activeDayRec.dzikirCounts[item.id]
                    : (item.currentCount || 0);
                  const isDone = item.targetCount > 0 && itemActualCount >= item.targetCount;
                  const percent = Math.min(
                    100,
                    Math.round((itemActualCount / Math.max(1, item.targetCount)) * 100)
                  );
                  const isBuiltInItem = INITIAL_DZIKIR_LIST.some((d) => d.id === item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      id={`dzikir-card-${item.id}`}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                    >
                      {/* Top Meta info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            {item.category}
                          </span>
                          {item.isCustom && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                              Custom
                            </span>
                          )}
                          {isBuiltInItem && (item.isPersonalCopy || item.isEdited) && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60">
                              Salinan Personal
                            </span>
                          )}
                          {isDone && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Tercapai
                            </span>
                          )}
                        </div>

                        {/* Actions (Edit & Delete with Confirmation) */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDzikir(item);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors border border-slate-200"
                            title="Edit Dzikir & Target"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDzikirToDelete(item)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border border-slate-200"
                            title="Hapus Dzikir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Arabic preview */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-right">
                          <p className="font-amiri text-lg sm:text-xl text-slate-800 truncate leading-relaxed">
                            {item.textArabic}
                          </p>
                        </div>
                        <p className="text-xs text-emerald-900/80 font-medium italic line-clamp-1">
                          "{item.textLatin}"
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.meaning}
                        </p>
                      </div>

                      {/* Footer: Progress bar & Action button */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">Hitungan:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            {itemActualCount} / {item.targetCount.toLocaleString('id-ID')}x ({percent}%)
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Button opens Stage 2 / Stage 3 */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(item);
                            }}
                            className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Lihat Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTasbih(item);
                            }}
                            className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1 active:scale-95"
                            title="Mulai Tasbih"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Tasbih</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 2: DETAIL DZIKIR (FULL COMPREHENSIVE DETAIL VIEW)                   */}
        {/* ========================================================================= */}
        {viewStage === 'detail' && selectedDzikir && (
          <motion.div
            key="dzikir-stage-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Navigation Bar with Back Button & Prev/Next */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
              <button
                type="button"
                onClick={handleBackToList}
                id="btn-back-to-dzikir-list"
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Dzikir</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDzikir(selectedDzikir);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Edit Data & Target"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDzikirToDelete(selectedDzikir)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Hapus Dzikir"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  type="button"
                  onClick={handlePrevDzikir}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                  title="Dzikir Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextDzikir}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                  title="Dzikir Berikutnya"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Detail Container */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header Badge & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Kategori: {selectedDzikir.category.toUpperCase()}
                    </span>
                    {selectedDzikir.isCustom && (
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-100">
                        Custom
                      </span>
                    )}
                    {isSelectedBuiltIn && (selectedDzikir.isPersonalCopy || selectedDzikir.isEdited) && (
                      <span className="text-[11px] font-bold bg-purple-50 text-purple-800 px-3 py-1 rounded-full border border-purple-100">
                        Salinan Personal
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {selectedDzikir.title}
                  </h3>
                </div>

                {/* Action Buttons: Copy, Share, Audio */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isPlayingAudio
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="Dengarkan Lafadz"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Berhenti</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Dengarkan</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyDzikir}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    title="Salin Teks"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareDzikir}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    title="Bagikan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Big Arabic Calligraphy Showcase Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-emerald-100/30 border border-emerald-200/80 text-right space-y-3 shadow-inner">
                <p className="font-amiri text-2xl sm:text-4xl text-slate-900 leading-loose">
                  {selectedDzikir.textArabic}
                </p>
              </div>

              {/* Transliterasi Latin */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transliterasi Latin:
                </span>
                <p className="text-sm sm:text-base text-emerald-950 font-semibold italic bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 leading-relaxed">
                  "{selectedDzikir.textLatin}"
                </p>
              </div>

              {/* Terjemahan Bahasa Indonesia */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Terjemahan / Arti:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedDzikir.meaning}
                </p>
              </div>

              {/* Keutamaan / Fadhilah & Hadits Source */}
              {(selectedDzikir.benefit || selectedDzikir.source) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Keutamaan & Dalil (Fadhilah):</span>
                  </div>
                  {selectedDzikir.benefit && (
                    <p className="text-xs text-amber-950 leading-relaxed pl-6">
                      {selectedDzikir.benefit}
                    </p>
                  )}
                  {selectedDzikir.source && (
                    <span className="text-[11px] font-semibold text-amber-800/80 block pl-6 italic">
                      Sumber: {selectedDzikir.source}
                    </span>
                  )}
                </div>
              )}

              {/* Target Count Adjustment & Progress with 33, 100, 1.000, 5.000 & Custom */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Pengaturan Target Tasbih:</span>
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Telah dibaca <strong className="text-slate-800 font-mono">{currentActualCount}</strong> dari target <strong className="text-emerald-800 font-mono">{selectedDzikir.targetCount.toLocaleString('id-ID')}x</strong> ({progressPercent}%)
                    </span>
                  </div>

                  {/* Target Presets (33, 100, 1000, 5000 & Custom) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 mr-1 font-semibold">Pilih Cepat:</span>
                    {TARGET_PRESETS.map((tgt) => (
                      <button
                        key={`detail-tgt-${tgt}`}
                        type="button"
                        onClick={() => handleApplyTarget(tgt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedDzikir.targetCount === tgt
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tgt >= 1000 ? `${tgt.toLocaleString('id-ID')}x` : `${tgt}x`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTargetInputValue(String(selectedDzikir.targetCount));
                        setIsCustomTargetModalOpen(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                        !TARGET_PRESETS.includes(selectedDzikir.targetCount)
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Custom</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTargetAchieved ? 'bg-emerald-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Primary Call To Action: "Mulai Tasbih" Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleStartTasbih(selectedDzikir)}
                  id="btn-start-tasbih-from-detail"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Mulai Tasbih Interaktif</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 3: MODE TASBIH DIGITAL FOKUS (FOCUSED INTERACTIVE TASBIH MODE)      */}
        {/* ========================================================================= */}
        {viewStage === 'tasbih' && selectedDzikir && (
          <motion.div
            key="dzikir-stage-tasbih"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            {/* Top Bar with Return Buttons and Sound/Vibration Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToDetail}
                  id="btn-back-to-dzikir-detail"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Rincian</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToList}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Daftar Dzikir</span>
                </button>
              </div>

              {/* Sound, Vibrate, Target, Reset Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Target Switcher Chip */}
                <button
                  type="button"
                  onClick={() => {
                    setCustomTargetInputValue(String(selectedDzikir.targetCount));
                    setIsCustomTargetModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Ubah Target Tasbih"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Target: {selectedDzikir.targetCount.toLocaleString('id-ID')}x</span>
                </button>

                {/* Audio Sound Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ tasbihSoundEnabled: !settings.tasbihSoundEnabled });
                    showToast(
                      !settings.tasbihSoundEnabled ? 'Suara ketukan aktif 🔊' : 'Suara ketukan dinonaktifkan 🔇'
                    );
                  }}
                  className={`p-2 rounded-xl text-xs border transition-all flex items-center gap-1 ${
                    settings.tasbihSoundEnabled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                  title="Suara Ketukan Tasbih"
                >
                  {settings.tasbihSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Vibration Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsVibrationEnabled(!isVibrationEnabled);
                    showToast(!isVibrationEnabled ? 'Getaran aktif 📳' : 'Getaran dinonaktifkan');
                  }}
                  className={`p-2 rounded-xl text-xs border transition-all flex items-center gap-1 ${
                    isVibrationEnabled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                  title="Vibrasi / Getar"
                >
                  <Vibrate className="w-4 h-4" />
                </button>

                {/* Reset Counter Button */}
                <button
                  type="button"
                  onClick={handleResetCount}
                  id="reset-tasbih-count-btn"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Reset Hitungan ke 0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dzikir Reading Focus Header */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {selectedDzikir.title}
              </span>
              <p className="font-amiri text-2xl sm:text-3xl text-slate-900 pt-1 leading-loose">
                {selectedDzikir.textArabic}
              </p>
              <p className="text-xs sm:text-sm text-emerald-900/90 font-medium italic">
                "{selectedDzikir.textLatin}"
              </p>
            </div>

            {/* Main Interactive Tasbih Ring Machine */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center space-y-6">
              {/* Circular SVG Ring & Big Tap Button */}
              <div className="relative my-2 flex flex-col items-center justify-center">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                  {/* Background Track */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Active Progress Dash */}
                    <path
                      className="text-emerald-600 transition-all duration-300"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>

                  {/* Big Touch Button inside Ring */}
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={handleTasbihTap}
                    id="tasbih-interactive-big-tap-btn"
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-950/20 active:shadow-inner cursor-pointer select-none group border-4 border-white"
                  >
                    <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest group-hover:text-white transition-colors">
                      KETUK UNTUK TASBIH
                    </span>
                    <span className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight my-2 drop-shadow-sm">
                      {currentActualCount}
                    </span>
                    <span className="text-xs text-emerald-200 font-semibold">
                      Target: {selectedDzikir.targetCount.toLocaleString('id-ID')}x ({progressPercent}%)
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Quick Target Chips right inside Tasbih Mode */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1">
                <span className="text-xs font-semibold text-slate-400 mr-1">Target:</span>
                {TARGET_PRESETS.map((tgt) => (
                  <button
                    key={`tasbih-tgt-${tgt}`}
                    type="button"
                    onClick={() => handleApplyTarget(tgt)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                      selectedDzikir.targetCount === tgt
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tgt >= 1000 ? `${tgt.toLocaleString('id-ID')}` : tgt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomTargetInputValue(String(selectedDzikir.targetCount));
                    setIsCustomTargetModalOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                    !TARGET_PRESETS.includes(selectedDzikir.targetCount)
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                <span className="text-xs font-semibold text-slate-400 mr-1">Input Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 font-bold text-xs transition-all active:scale-95"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(5)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 font-bold text-xs transition-all active:scale-95"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(10)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 font-bold text-xs transition-all active:scale-95"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(33)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs transition-all active:scale-95"
                >
                  +33 (1 Set)
                </button>
              </div>

              {/* Quick Status Bar */}
              <div className="w-full grid grid-cols-2 gap-3 text-center text-xs pt-4 border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Total Dzikir Hari Ini
                  </span>
                  <span className="font-bold text-slate-800 text-base mt-0.5 block">
                    {todayRecord.totalDzikirCount}x
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Status Target
                  </span>
                  <span
                    className={`font-bold text-base mt-0.5 block ${
                      isTargetAchieved ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {isTargetAchieved ? 'Tercapai 🎉' : 'Sedang Berjalan'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {dzikirToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4"
              id="delete-dzikir-confirmation-modal"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Konfirmasi Hapus Dzikir</h3>
                  <p className="text-xs text-slate-500">Tindakan ini membutuhkan persetujuan Anda</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <p className="text-xs text-slate-700">
                  Apakah Anda yakin ingin menghapus dzikir <strong className="text-slate-900 font-bold">"{dzikirToDelete.title}"</strong> dari daftar aktif?
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {INITIAL_DZIKIR_LIST.some((d) => d.id === dzikirToDelete.id)
                    ? 'Dzikir bawaan sistem akan dihapus dari daftar Anda dan dapat dipulihkan kapan saja melalui tombol "Pulihkan Dzikir Bawaan".'
                    : 'Dzikir custom ini akan dihapus dari daftar aktif Anda.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDzikirToDelete(null)}
                  id="cancel-delete-dzikir-btn"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  id="confirm-delete-dzikir-btn"
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Dzikir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Target Modal */}
      <AnimatePresence>
        {isCustomTargetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4"
              id="custom-target-modal"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Ubah Target Tasbih</h3>
                    <p className="text-[11px] text-slate-500">{selectedDzikir.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomTargetModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets Buttons in Modal */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Pilihan Cepat Target:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TARGET_PRESETS.map((preset) => (
                    <button
                      key={`modal-preset-${preset}`}
                      type="button"
                      onClick={() => setCustomTargetInputValue(String(preset))}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        Number(customTargetInputValue) === preset
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset >= 1000 ? `${preset.toLocaleString('id-ID')}` : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Numeric Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Atau Masukkan Angka Bebas:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={customTargetInputValue}
                  onChange={(e) => setCustomTargetInputValue(e.target.value)}
                  placeholder="Contoh: 70, 300, 10000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomTargetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTarget(Number(customTargetInputValue) || 33)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all active:scale-95"
                >
                  Terapkan Target
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Dzikir Modal */}
      <AddDzikirModal
        isOpen={isAddModalOpen}
        editingDzikir={editingDzikir}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDzikir(null);
        }}
      />
    </div>
  );
};
