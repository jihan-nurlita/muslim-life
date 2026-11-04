import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  CheckCircle2,
  Flame,
  Target,
  ListOrdered,
  Layers,
  Copy,
  Check,
  Sliders,
  X,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  Plus,
  SkipForward,
  SkipBack,
  Repeat,
  Compass,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { useApp, getTodayString } from '../context/AppContext';
import { getTilawahRecord } from '../utils/habitFormatter';
import {
  SURAH_LIST,
  JUZ_LIST,
  QARI_LIST,
  fetchSurahFullData,
  getJuzForAyah,
  getAyahAudioUrl,
  SurahFullData,
} from '../data/surahs';
import { Ayah, SurahMeta } from '../types';
import { soundController } from '../utils/soundEffects';

type ViewStage = 'list' | 'reader';
type TabMode = 'surah' | 'juz' | 'bookmark' | 'khatam';
type ReadingMode = 'lengkap' | 'terjemahan' | 'mushaf';
type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl';

export const QuranView: React.FC = () => {
  const {
    activeQuranSurah,
    setActiveQuranSurah,
    lastReadQuran,
    setLastRead,
    bookmarks,
    toggleBookmark,
    settings,
    updateSettings,
    dayRecords,
    logQuranPages,
    selectedDate,
    totalQuranPagesRead,
    habits,
  } = useApp();

  // 2-Stage View State: 'list' (Tahap 1: Daftar Surah / Juz / Filter) vs 'reader' (Tahap 2: Pembaca Khusus)
  const [viewStage, setViewStage] = useState<ViewStage>('list');

  // List View Tab Mode
  const [activeTabMode, setActiveTabMode] = useState<TabMode>('surah');

  // Surah List & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRevelationFilter, setSelectedRevelationFilter] = useState<'all' | 'Mekah' | 'Madinah' | 'popular'>('all');
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [surahFullData, setSurahFullData] = useState<SurahFullData | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // In-Surah Search & Jump Toolbar (Stage 2)
  const [verseSearchQuery, setVerseSearchQuery] = useState('');
  const [targetAyahJump, setTargetAyahJump] = useState<string>('');
  const [showSurahInfo, setShowSurahInfo] = useState(false);

  // Reading Experience Preferences
  const [readingMode, setReadingMode] = useState<ReadingMode>('lengkap');
  const [arabicFontSize, setArabicFontSize] = useState<FontSizeOption>('md');
  const [selectedQariId, setSelectedQariId] = useState<string>(() => {
    const matched = QARI_LIST.find((q) => q.name.toLowerCase().includes((settings.audioQari || '').toLowerCase()));
    return matched ? matched.id : 'misyari';
  });

  // Audio Murattal Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activePlayingAyah, setActivePlayingAyah] = useState<number | null>(null);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState({ currentTime: 0, duration: 0 });
  const [repeatMode, setRepeatMode] = useState<'auto_next' | 'repeat_single' | 'stop'>('auto_next');
  const [isAudioPlayerVisible, setIsAudioPlayerVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize activeQuranSurah with selectedSurah
  useEffect(() => {
    const targetSurah = SURAH_LIST.find((s) => s.number === activeQuranSurah) || SURAH_LIST[0];
    setSelectedSurah(targetSurah);
  }, [activeQuranSurah]);

  // Fetch full Surah content (with verses & API audio) only when in reader mode or selectedSurah changes
  useEffect(() => {
    if (!selectedSurah || viewStage !== 'reader') return;

    let isMounted = true;
    setIsLoadingSurah(true);
    setFetchError(null);

    fetchSurahFullData(selectedSurah.number, selectedQariId)
      .then((data) => {
        if (isMounted) {
          setSurahFullData(data);
          setIsLoadingSurah(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching surah:', err);
          setFetchError("Gagal memuat ayat Al-Qur'an dari server. Silakan coba lagi.");
          setIsLoadingSurah(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurah, selectedQariId, viewStage]);

  // Scroll to ayah if requested
  const scrollToAyah = (ayahNumber: number) => {
    setTimeout(() => {
      const el = document.getElementById(`ayah-card-${ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  // Open specific Surah in Reader View
  const handleOpenSurah = (surah: SurahMeta, targetAyah?: number) => {
    setSelectedSurah(surah);
    setActiveQuranSurah(surah.number);
    setViewStage('reader');
    setVerseSearchQuery('');
    setTargetAyahJump('');
    if (targetAyah) {
      scrollToAyah(targetAyah);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Return to List View
  const handleBackToList = () => {
    setViewStage('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Surah list filtering for Stage 1
  const popularSurahNumbers = [1, 2, 18, 36, 55, 56, 67, 112, 113, 114];
  const filteredSurahs = useMemo(() => {
    return SURAH_LIST.filter((s) => {
      const matchesSearch =
        s.nameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.number).includes(searchQuery) ||
        s.nameArabic.includes(searchQuery);

      if (!matchesSearch) return false;

      if (selectedRevelationFilter === 'Mekah') return s.revelationType === 'Mekah';
      if (selectedRevelationFilter === 'Madinah') return s.revelationType === 'Madinah';
      if (selectedRevelationFilter === 'popular') return popularSurahNumbers.includes(s.number);
      return true;
    });
  }, [searchQuery, selectedRevelationFilter]);

  // Verses filtering in current surah (Stage 2)
  const filteredVerses = useMemo(() => {
    if (!surahFullData?.verses) return [];
    if (!verseSearchQuery.trim()) return surahFullData.verses;

    const q = verseSearchQuery.toLowerCase();
    return surahFullData.verses.filter(
      (v) =>
        String(v.numberInSurah) === q ||
        v.translationId.toLowerCase().includes(q) ||
        v.textLatin.toLowerCase().includes(q)
    );
  }, [surahFullData, verseSearchQuery]);

  // Audio Playback Handlers
  const handlePlayAyahAudio = (ayah: Ayah) => {
    if (!audioRef.current || !selectedSurah) return;

    if (isPlayingAudio && activePlayingAyah === ayah.numberInSurah) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const audioUrl =
      ayah.audioUrl || getAyahAudioUrl(selectedSurah.number, ayah.numberInSurah, selectedQariId, ayah.audioMap);
    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = audioPlaybackSpeed;
    audioRef.current.muted = isAudioMuted;

    audioRef.current
      .play()
      .then(() => {
        setIsPlayingAudio(true);
        setActivePlayingAyah(ayah.numberInSurah);
        setIsAudioPlayerVisible(true);
        scrollToAyah(ayah.numberInSurah);
      })
      .catch((err) => {
        console.warn('Audio playback error:', err);
        showToast('Memuat audio... Pastikan koneksi internet aktif.');
      });
  };

  const handleAudioEnded = () => {
    if (!selectedSurah || !surahFullData?.verses || activePlayingAyah === null) {
      setIsPlayingAudio(false);
      setActivePlayingAyah(null);
      return;
    }

    if (repeatMode === 'repeat_single') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (repeatMode === 'auto_next') {
      const nextIndex = surahFullData.verses.findIndex((v) => v.numberInSurah === activePlayingAyah + 1);
      if (nextIndex !== -1) {
        const nextAyah = surahFullData.verses[nextIndex];
        handlePlayAyahAudio(nextAyah);
        return;
      }
    }

    setIsPlayingAudio(false);
    setActivePlayingAyah(null);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress({
        currentTime: audioRef.current.currentTime || 0,
        duration: audioRef.current.duration || 0,
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setAudioProgress((prev) => ({ ...prev, currentTime: seekTime }));
    }
  };

  const togglePlayPauseGlobal = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (activePlayingAyah && surahFullData?.verses) {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      } else if (surahFullData?.verses && surahFullData.verses.length > 0) {
        handlePlayAyahAudio(surahFullData.verses[0]);
      }
    }
  };

  const handleSkipNext = () => {
    if (!surahFullData?.verses || !activePlayingAyah) return;
    const nextAyah = surahFullData.verses.find((v) => v.numberInSurah === activePlayingAyah + 1);
    if (nextAyah) handlePlayAyahAudio(nextAyah);
  };

  const handleSkipPrev = () => {
    if (!surahFullData?.verses || !activePlayingAyah) return;
    const prevAyah = surahFullData.verses.find((v) => v.numberInSurah === activePlayingAyah - 1);
    if (prevAyah) handlePlayAyahAudio(prevAyah);
  };

  // Copy Ayah Text
  const handleCopyAyah = (ayah: Ayah) => {
    if (!selectedSurah) return;
    const copyText = `[Q.S. ${selectedSurah.nameLatin}: ${ayah.numberInSurah}]\n\n${ayah.textArabic}\n\n"${ayah.translationId}"\n\n(Dibaca melalui MuslimLife App)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyText).then(() => {
        setCopiedAyahId(ayah.numberInSurah);
        showToast(`Ayat ${ayah.numberInSurah} berhasil disalin ke clipboard!`);
        setTimeout(() => setCopiedAyahId(null), 2000);
      });
    }
  };

  // Share Ayah
  const handleShareAyah = async (ayah: Ayah) => {
    if (!selectedSurah) return;
    const text = `[Q.S. ${selectedSurah.nameLatin}: ${ayah.numberInSurah}]\n\n${ayah.textArabic}\n\n"${ayah.translationId}"`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Q.S. ${selectedSurah.nameLatin}: ${ayah.numberInSurah}`,
          text,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      handleCopyAyah(ayah);
    }
  };

  // Mark as Last Read with Sound & Toast
  const handleMarkLastRead = (ayah: Ayah) => {
    if (!selectedSurah) return;
    const juzNumber = ayah.juz || getJuzForAyah(selectedSurah.number, ayah.numberInSurah);
    setLastRead(selectedSurah.number, ayah.numberInSurah, selectedSurah.nameLatin, juzNumber);
    soundController.playMilestoneChime();
    showToast(`Tandai terakhir dibaca: ${selectedSurah.nameLatin} Ayat ${ayah.numberInSurah}`);
  };

  // Khatam Target Calculations
  const totalQuranPages = 604;
  const targetDays = settings.khatamTargetDays || 30;
  const targetDateStr = selectedDate || getTodayString();
  const currentDayRecord = dayRecords[targetDateStr];
  const quranHabit = habits.find((h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran');
  const tilawahRecord = getTilawahRecord(currentDayRecord, quranHabit);
  const tilawahUnit = tilawahRecord.formattedUnit;
  const tilawahActual = tilawahRecord.actual;
  const tilawahTarget = tilawahRecord.target;
  const pagesReadToday = tilawahActual;
  const actualPagesRead = Math.min(604, Math.max(0, totalQuranPagesRead || 0));
  const khatamProgress = Math.min(100, Math.round((actualPagesRead / totalQuranPages) * 100));
  const pagesPerDay = Math.ceil(totalQuranPages / targetDays);

  const handleAddTodayPages = (amount: number) => {
    logQuranPages(amount, targetDateStr);
    soundController.playTasbihClick();
    const newTotal = tilawahActual + amount;
    showToast(`Berhasil mencatat +${amount} ${tilawahUnit} tilawah! Total: ${newTotal} ${tilawahUnit}.`);
  };

  // Font size mapping classes
  const arabicFontClass = {
    sm: 'text-xl sm:text-2xl leading-loose',
    md: 'text-2xl sm:text-3xl leading-loose',
    lg: 'text-3xl sm:text-4xl leading-loose',
    xl: 'text-4xl sm:text-5xl leading-loose',
  }[arabicFontSize];

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 pb-28 lg:pb-16 text-slate-800" id="quran-view-container">
      {/* Hidden Audio Controller Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        muted={isAudioMuted}
        className="hidden"
      />

      {/* Floating Toast Notification */}
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
        {/* TAHAP 1: DAFTAR SURAH, JUZ, BOOKMARK, & TARGET KHATAM (LIST VIEW)        */}
        {/* ========================================================================= */}
        {viewStage === 'list' ? (
          <motion.div
            key="stage-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Header & Mode Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Al-Qur'anul Karim
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Kemenag RI
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih surah untuk mulai membaca dengan terjemahan, audio qari, dan penanda bacaan
                </p>
              </div>

              {/* Tab Switcher Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-full overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTabMode('surah')}
                  id="tab-114-surah"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTabMode === 'surah'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  114 Surah
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('juz')}
                  id="tab-30-juz"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTabMode === 'juz'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  30 Juz
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('bookmark')}
                  id="tab-bookmark"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTabMode === 'bookmark'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Bookmark ({bookmarks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('khatam')}
                  id="tab-khatam"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTabMode === 'khatam'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  Target Khatam
                </button>
              </div>
            </div>

            {/* Terakhir Dibaca Hero Banner */}
            <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-lg shadow-emerald-950/10 border border-emerald-700/50">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-6">
                <span className="font-amiri text-8xl">القرآن</span>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shrink-0 shadow-inner">
                    <BookOpen className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] text-emerald-200 font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">
                        Terakhir Dibaca
                      </span>
                      <span className="text-[10px] text-emerald-100/70">
                        {new Date(lastReadQuran.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {lastReadQuran.surahName} • Ayat {lastReadQuran.ayahNumber} (Juz {lastReadQuran.juzNumber})
                    </h3>
                    <p className="text-xs text-emerald-100/80">
                      Lanjutkan tilawah Anda dari penanda bacaan terakhir
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const surah =
                        SURAH_LIST.find((s) => s.number === lastReadQuran.surahNumber) || SURAH_LIST[0];
                      handleOpenSurah(surah, lastReadQuran.ayahNumber);
                    }}
                    id="btn-resume-last-read"
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-900 text-emerald-900" />
                    Lanjutkan Baca
                  </button>
                </div>
              </div>
            </div>

            {/* 1. TAB: 114 SURAH (Compact & Focused Grid) */}
            {activeTabMode === 'surah' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama surah / nomor / terjemahan / teks arab..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                      id="quran-search-input"
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

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedRevelationFilter('all')}
                      className={`px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                        selectedRevelationFilter === 'all'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      Semua ({SURAH_LIST.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRevelationFilter('Mekah')}
                      className={`px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                        selectedRevelationFilter === 'Mekah'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      Makkiyah (86)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRevelationFilter('Madinah')}
                      className={`px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                        selectedRevelationFilter === 'Madinah'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      Madaniyah (28)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRevelationFilter('popular')}
                      className={`px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                        selectedRevelationFilter === 'popular'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      Populer ⭐
                    </button>
                  </div>
                </div>

                {/* Surah List Grid */}
                {filteredSurahs.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">
                      Tidak ditemukan surah dengan kata kunci "{searchQuery}".
                    </p>
                    <p className="text-xs text-slate-400">
                      Coba cari dengan nama latin lain seperti "Yasin", "Al-Kahf", atau nomor surah "18".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredSurahs.map((surah) => {
                      const isLastRead = lastReadQuran.surahNumber === surah.number;
                      return (
                        <button
                          key={`surah-card-${surah.number}`}
                          type="button"
                          onClick={() => handleOpenSurah(surah)}
                          id={`surah-card-${surah.number}`}
                          className={`p-4 rounded-2xl bg-white border transition-all text-left flex items-center justify-between gap-3 group relative overflow-hidden ${
                            isLastRead
                              ? 'border-emerald-500/80 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200/80 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/10'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Surah Number Box with Octagonal feel */}
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                              {surah.number}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-900 transition-colors truncate">
                                  {surah.nameLatin}
                                </h4>
                                {isLastRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Terakhir dibaca" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {surah.nameTranslation}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                                  {surah.revelationType}
                                </span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] text-slate-500">
                                  {surah.numberOfAyahs} Ayat
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <span className="font-amiri text-xl text-emerald-950 font-bold block group-hover:scale-105 transition-transform">
                              {surah.nameArabic}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                              Juz {surah.juzStart}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. TAB: 30 JUZ (Accurate & Navigable) */}
            {activeTabMode === 'juz' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {JUZ_LIST.map((juz) => (
                  <div
                    key={`juz-card-${juz.juz}`}
                    id={`juz-card-${juz.juz}`}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {juz.juz}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{juz.title}</h4>
                          <span className="text-[11px] text-slate-500">
                            Hal. {juz.pageStart} - {juz.pageEnd}
                          </span>
                        </div>
                      </div>
                      <span className="font-amiri text-lg font-bold text-emerald-900">{juz.nameArabic}</span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                      <div className="truncate">
                        <span className="text-slate-400 font-semibold">Mulai:</span> {juz.startSurahName} (Ayat {juz.startAyahNumber})
                      </div>
                      <div className="truncate">
                        <span className="text-slate-400 font-semibold">Akhir:</span> {juz.endSurahName} (Ayat {juz.endAyahNumber})
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const targetSurah =
                          SURAH_LIST.find((s) => s.number === juz.startSurahNumber) || SURAH_LIST[0];
                        handleOpenSurah(targetSurah, juz.startAyahNumber);
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Buka Awal Juz {juz.juz}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 3. TAB: BOOKMARK (Saved Ayahs) */}
            {activeTabMode === 'bookmark' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                {bookmarks.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">Belum ada Bookmark</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Tandai ayat favorit Anda saat membaca dengan menekan ikon penanda (bookmark) pada ayat.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bookmarks.map((bm) => (
                      <div
                        key={`bm-card-${bm.id}`}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 transition-all flex flex-col justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                              ★
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 truncate">
                              {bm.surahName} : Ayat {bm.ayahNumber}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {bm.note || 'Penanda Bacaan'} •{' '}
                            {new Date(bm.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              const surah =
                                SURAH_LIST.find((s) => s.number === bm.surahNumber) || SURAH_LIST[0];
                              handleOpenSurah(surah, bm.ayahNumber);
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Buka Ayat
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleBookmark({
                                surahNumber: bm.surahNumber,
                                surahName: bm.surahName,
                                ayahNumber: bm.ayahNumber,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                            title="Hapus Bookmark"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. TAB: TARGET KHATAM */}
            {activeTabMode === 'khatam' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs max-w-2xl mx-auto">
                {/* Progress Overview Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-700" />
                      Progress Khatam Al-Qur'an
                    </span>
                    <span className="text-sm font-extrabold text-emerald-800">{khatamProgress}%</span>
                  </div>

                  <div className="w-full bg-emerald-200/80 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${khatamProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progres: {actualPagesRead} / 604 Halaman</span>
                    <span>Juz {lastReadQuran.juzNumber} dari 30</span>
                  </div>
                </div>

                {/* Target Setting */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 block">Pilih Durasi Target Khatam:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map((days) => (
                      <button
                        key={`khatam-days-${days}`}
                        type="button"
                        onClick={() => updateSettings({ khatamTargetDays: days })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          targetDays === days
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {days} Hari
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 pt-1">
                    Target harian Anda: <span className="font-bold text-emerald-800">{pagesPerDay} halaman / hari</span> (~{Math.ceil(pagesPerDay / 5)} hal tiap selesai sholat fardhu).
                  </p>
                </div>

                {/* Quick Log Reading Today */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Tilawah Hari Ini:</span>
                    <span className="text-xs font-extrabold text-emerald-700">{tilawahActual} {tilawahUnit}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tilawahUnit.toLowerCase() === 'juz' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(0.5)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +0.5 Juz
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(1)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +1 Juz
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(2)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +2 Juz
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(tilawahTarget)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Target ({tilawahTarget} Juz)
                        </button>
                      </>
                    ) : tilawahUnit.toLowerCase() === 'ayat' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(5)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +5 Ayat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(10)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +10 Ayat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(20)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +20 Ayat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(tilawahTarget)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Target ({tilawahTarget} Ayat)
                        </button>
                      </>
                    ) : tilawahUnit.toLowerCase() === 'menit' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(5)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +5 Mnt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(10)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +10 Mnt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(15)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +15 Mnt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(tilawahTarget)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Target ({tilawahTarget} Mnt)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(1)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +1 Hal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(2)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +2 Hal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(5)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> +5 Hal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTodayPages(20)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> +1 Juz (20h)
                        </button>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block italic text-center">
                    Tersinkronisasi otomatis dengan habit & kalender ibadah harian.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* TAHAP 2: HALAMAN PEMBACA KHUSUS (DEDICATED SURAH READER VIEW)             */
          /* ========================================================================= */
          <motion.div
            key="stage-reader"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {selectedSurah && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-6">
                {/* Top Reader Navigation Bar with "Kembali ke Daftar Surah" */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  {/* Primary Back Button */}
                  <button
                    type="button"
                    onClick={handleBackToList}
                    id="btn-back-to-surah-list"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Surah</span>
                  </button>

                  {/* Previous & Next Surah Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={selectedSurah.number <= 1}
                      onClick={() => {
                        if (selectedSurah.number > 1) {
                          const prev = SURAH_LIST.find((s) => s.number === selectedSurah.number - 1);
                          if (prev) handleOpenSurah(prev);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Surah Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    <span className="text-xs font-bold text-slate-400 px-1">
                      {selectedSurah.number} / 114
                    </span>

                    <button
                      type="button"
                      disabled={selectedSurah.number >= 114}
                      onClick={() => {
                        if (selectedSurah.number < 114) {
                          const next = SURAH_LIST.find((s) => s.number === selectedSurah.number + 1);
                          if (next) handleOpenSurah(next);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Surah Berikutnya"
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reading Experience Preferences (Mode, Font Size, Qari) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reading Mode Switcher */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setReadingMode('lengkap')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          readingMode === 'lengkap' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Lengkap
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadingMode('terjemahan')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          readingMode === 'terjemahan' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Arti
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadingMode('mushaf')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          readingMode === 'mushaf' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Mushaf
                      </button>
                    </div>

                    {/* Font Size Selector */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-semibold">
                      {(['sm', 'md', 'lg', 'xl'] as FontSizeOption[]).map((size) => (
                        <button
                          key={`font-size-${size}`}
                          type="button"
                          onClick={() => setArabicFontSize(size)}
                          className={`px-2 py-1 rounded-lg transition-all uppercase ${
                            arabicFontSize === size ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    {/* Qari Selector Dropdown */}
                    <select
                      value={selectedQariId}
                      onChange={(e) => {
                        const newQari = e.target.value;
                        setSelectedQariId(newQari);
                        const qariObj = QARI_LIST.find((q) => q.id === newQari);
                        if (qariObj) updateSettings({ audioQari: qariObj.name });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 max-w-[150px] truncate"
                      title="Pilih Qari Murottal"
                    >
                      {QARI_LIST.map((q) => (
                        <option key={`opt-qari-${q.id}`} value={q.id}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Surah Hero Header Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 border border-emerald-200/80 text-center space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-3 py-0.5 rounded-full border border-emerald-300/60">
                      Surah ke-{selectedSurah.number} • {selectedSurah.revelationType} • {selectedSurah.numberOfAyahs} Ayat
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Juz {selectedSurah.juzStart}
                    </span>
                  </div>

                  <h3 className="font-amiri text-4xl sm:text-5xl text-emerald-950 font-bold py-1">
                    {selectedSurah.nameArabic}
                  </h3>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{selectedSurah.nameLatin}</h4>
                    <p className="text-xs text-slate-600 italic">"{selectedSurah.nameTranslation}"</p>
                  </div>

                  {/* Collapsible Surah Description */}
                  {surahFullData?.deskripsi && (
                    <div className="pt-2 max-w-xl mx-auto">
                      <button
                        type="button"
                        onClick={() => setShowSurahInfo(!showSurahInfo)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
                      >
                        <Info className="w-3.5 h-3.5" />
                        {showSurahInfo ? 'Tutup Ringkasan Surah' : 'Tentang Surah Ini (Tafsir Ringkas)'}
                        {showSurahInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {showSurahInfo && (
                        <p className="text-xs text-slate-700 bg-white/90 p-4 rounded-2xl border border-emerald-200 mt-2.5 text-left leading-relaxed shadow-xs">
                          {surahFullData.deskripsi}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bismillah Header (Except Surah 9 At-Taubah) */}
                  {selectedSurah.number !== 9 && (
                    <div className="pt-4 border-t border-emerald-200/70 max-w-md mx-auto">
                      <span className="font-amiri text-2xl sm:text-3xl text-emerald-950 block">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </span>
                      <span className="text-xs text-emerald-800/80 italic mt-1 block">
                        Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
                      </span>
                    </div>
                  )}
                </div>

                {/* In-Surah Ayah Search & Jump Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  {/* Search in surah */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={verseSearchQuery}
                      onChange={(e) => setVerseSearchQuery(e.target.value)}
                      placeholder="Cari kata/arti di surah ini..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                    />
                    {verseSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setVerseSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Jump to Ayah & Quick Play Surah */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Lompat:</span>
                      <select
                        value={targetAyahJump}
                        onChange={(e) => {
                          const target = Number(e.target.value);
                          if (target) {
                            setTargetAyahJump(String(target));
                            scrollToAyah(target);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                      >
                        <option value="">Pilih Ayat...</option>
                        {surahFullData?.verses?.map((v) => (
                          <option key={`opt-verse-${selectedSurah.number}-${v.numberInSurah}`} value={v.numberInSurah}>
                            Ayat {v.numberInSurah}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (surahFullData?.verses && surahFullData.verses.length > 0) {
                          handlePlayAyahAudio(surahFullData.verses[0]);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Putar Surah
                    </button>
                  </div>
                </div>

                {/* Verses List / Loading / Error State */}
                {isLoadingSurah ? (
                  <div className="py-24 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">Memuat Ayat Al-Qur'an...</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Mengambil data resmi Kemenag RI & Audio Qari</p>
                    </div>
                  </div>
                ) : fetchError ? (
                  <div className="p-8 text-center space-y-3 bg-red-50/60 rounded-3xl border border-red-200">
                    <p className="text-xs text-red-600 font-semibold">{fetchError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSurah) {
                          setIsLoadingSurah(true);
                          fetchSurahFullData(selectedSurah.number, selectedQariId)
                            .then((data) => {
                              setSurahFullData(data);
                              setIsLoadingSurah(false);
                            })
                            .catch(() => setIsLoadingSurah(false));
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVerses.map((ayah) => {
                      const isBookmarked = bookmarks.some(
                        (b) => b.surahNumber === selectedSurah.number && b.ayahNumber === ayah.numberInSurah
                      );
                      const isCurrentPlaying = isPlayingAudio && activePlayingAyah === ayah.numberInSurah;
                      const isLastReadHere =
                        lastReadQuran.surahNumber === selectedSurah.number &&
                        lastReadQuran.ayahNumber === ayah.numberInSurah;

                      return (
                        <div
                          key={`ayah-${selectedSurah.number}-${ayah.numberInSurah}`}
                          id={`ayah-card-${ayah.numberInSurah}`}
                          className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 relative ${
                            isCurrentPlaying
                              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/30 shadow-md'
                              : isLastReadHere
                              ? 'border-teal-400 bg-teal-50/40 shadow-xs'
                              : 'border-slate-200/80 bg-white hover:border-slate-300'
                          }`}
                        >
                          {/* Ayah Meta Bar & Action Toolbar */}
                          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center justify-center border border-emerald-200">
                                {ayah.numberInSurah}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                Juz {ayah.juz || getJuzForAyah(selectedSurah.number, ayah.numberInSurah)}
                              </span>
                              {isLastReadHere && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white shadow-xs animate-pulse">
                                  Terakhir Dibaca
                                </span>
                              )}
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-1">
                              {/* Play audio button */}
                              <button
                                type="button"
                                onClick={() => handlePlayAyahAudio(ayah)}
                                id={`play-ayah-btn-${ayah.numberInSurah}`}
                                className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                                  isCurrentPlaying
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900'
                                }`}
                                title={isCurrentPlaying ? 'Jeda Murottal' : 'Putar Murottal Ayat Ini'}
                              >
                                {isCurrentPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                              </button>

                              {/* Mark Last Read */}
                              <button
                                type="button"
                                onClick={() => handleMarkLastRead(ayah)}
                                id={`btn-last-read-${ayah.numberInSurah}`}
                                className={`p-2 rounded-xl text-xs transition-all ${
                                  isLastReadHere
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-900'
                                }`}
                                title="Tandai Terakhir Dibaca"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Bookmark button */}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleBookmark({
                                    surahNumber: selectedSurah.number,
                                    surahName: selectedSurah.nameLatin,
                                    ayahNumber: ayah.numberInSurah,
                                  })
                                }
                                id={`btn-bookmark-${ayah.numberInSurah}`}
                                className={`p-2 rounded-xl text-xs transition-all ${
                                  isBookmarked
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-800'
                                }`}
                                title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
                              </button>

                              {/* Copy button */}
                              <button
                                type="button"
                                onClick={() => handleCopyAyah(ayah)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="Salin Ayat"
                              >
                                {copiedAyahId === ayah.numberInSurah ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Share button */}
                              <button
                                type="button"
                                onClick={() => handleShareAyah(ayah)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="Bagikan Ayat"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Arabic Text Typography */}
                          <div className="text-right py-3">
                            <p
                              className={`font-amiri text-slate-950 font-normal tracking-wide select-text ${arabicFontClass}`}
                              dir="rtl"
                            >
                              {ayah.textArabic}
                            </p>
                          </div>

                          {/* Latin Transliteration (Toggleable) */}
                          {readingMode === 'lengkap' && (
                            <p className="text-xs sm:text-sm text-emerald-900 font-medium italic select-text">
                              {ayah.textLatin}
                            </p>
                          )}

                          {/* Indonesian Translation (Toggleable) */}
                          {readingMode !== 'mushaf' && (
                            <div className="pt-2 border-t border-slate-100">
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed select-text">
                                {ayah.translationId}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating / Sticky Bottom Audio Murattal Player Bar */}
      <AnimatePresence>
        {isAudioPlayerVisible && selectedSurah && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-3 left-4 right-4 md:left-64 md:right-8 z-40 bg-emerald-950/95 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-emerald-700/50 backdrop-blur-lg flex flex-col gap-2"
          >
            {/* Audio Progress Scrubber */}
            <div className="flex items-center gap-2 text-[10px] text-emerald-200 font-mono">
              <span>{formatSeconds(audioProgress.currentTime)}</span>
              <input
                type="range"
                min={0}
                max={audioProgress.duration || 100}
                value={audioProgress.currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span>{formatSeconds(audioProgress.duration)}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Surah & Ayah Info */}
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 flex items-center justify-center text-emerald-300 shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">
                    {selectedSurah.nameLatin} • Ayat {activePlayingAyah || 1}
                  </h4>
                  <span className="text-[10px] text-emerald-300 block truncate">
                    Qari: {QARI_LIST.find((q) => q.id === selectedQariId)?.name || 'Misyari Rasyid'}
                  </span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Previous */}
                <button
                  type="button"
                  onClick={handleSkipPrev}
                  className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
                  title="Ayat Sebelumnya"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Play / Pause Primary Button */}
                <button
                  type="button"
                  onClick={togglePlayPauseGlobal}
                  className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 flex items-center justify-center shadow-lg transition-transform active:scale-90"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-emerald-950" />}
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={handleSkipNext}
                  className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
                  title="Ayat Selanjutnya"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Repeat Mode */}
                <button
                  type="button"
                  onClick={() => {
                    const modes: ('auto_next' | 'repeat_single' | 'stop')[] = ['auto_next', 'repeat_single', 'stop'];
                    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
                    setRepeatMode(nextMode);
                    showToast(
                      nextMode === 'auto_next'
                        ? 'Mode: Lanjut Otomatis ke Ayat Berikutnya'
                        : nextMode === 'repeat_single'
                        ? 'Mode: Ulangi Ayat Ini'
                        : 'Mode: Berhenti Setelah Ayat Selesai'
                    );
                  }}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    repeatMode === 'repeat_single' ? 'bg-emerald-700 text-amber-300' : 'text-emerald-200 hover:bg-white/10'
                  }`}
                  title="Mode Pemutaran"
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Speed selector */}
                <select
                  value={audioPlaybackSpeed}
                  onChange={(e) => {
                    const speed = Number(e.target.value);
                    setAudioPlaybackSpeed(speed);
                    if (audioRef.current) audioRef.current.playbackRate = speed;
                  }}
                  className="px-1.5 py-1 rounded-lg bg-emerald-900 border border-emerald-700 text-[10px] font-bold text-emerald-100 hidden sm:inline-block"
                >
                  <option value="0.75">0.75x</option>
                  <option value="1">1.0x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                </select>

                {/* Mute toggle */}
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-1.5 rounded-lg text-emerald-200 hover:bg-white/10"
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close Player */}
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    setIsPlayingAudio(false);
                    setIsAudioPlayerVisible(false);
                  }}
                  className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10"
                  title="Tutup Player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
