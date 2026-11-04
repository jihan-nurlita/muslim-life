import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  BookOpen,
  Heart,
  Sparkles,
  FileText,
  ChevronRight,
  ArrowRight,
  Clock,
  Volume2,
  Tag,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SURAH_LIST } from '../../data/surahs';
import { INITIAL_DZIKIR_LIST } from '../../data/dzikirData';
import { ASMAUL_HUSNA_LIST } from '../../data/asmaulHusna';
import { ISLAMIC_ARTICLES, IslamicArticle } from '../../data/articlesData';
import { NavigationTab } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

type FilterCategory = 'all' | 'quran' | 'dzikir' | 'asmaul' | 'kajian';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const {
    setActiveTab,
    setActiveQuranSurah,
    setActiveDzikirId,
    openTasbihWithCustom,
  } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [selectedArticle, setSelectedArticle] = useState<IslamicArticle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedArticle(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialQuery]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedArticle]);

  // Search calculations
  const searchResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    // Surahs filter
    const matchedSurahs = SURAH_LIST.filter((s) => {
      if (!cleanQuery) return true;
      return (
        s.nameLatin.toLowerCase().includes(cleanQuery) ||
        s.nameTranslation.toLowerCase().includes(cleanQuery) ||
        s.nameArabic.includes(cleanQuery) ||
        String(s.number).includes(cleanQuery)
      );
    }).slice(0, cleanQuery ? 15 : 6);

    // Dzikir & Doa filter
    const matchedDzikir = INITIAL_DZIKIR_LIST.filter((d) => {
      if (!cleanQuery) return true;
      return (
        d.title.toLowerCase().includes(cleanQuery) ||
        d.meaning.toLowerCase().includes(cleanQuery) ||
        d.category.toLowerCase().includes(cleanQuery) ||
        d.textLatin?.toLowerCase().includes(cleanQuery)
      );
    }).slice(0, cleanQuery ? 15 : 6);

    // Asmaul Husna filter
    const matchedAsmaul = ASMAUL_HUSNA_LIST.filter((a) => {
      if (!cleanQuery) return true;
      return (
        a.nameLatin.toLowerCase().includes(cleanQuery) ||
        a.meaning.toLowerCase().includes(cleanQuery) ||
        a.explanation.toLowerCase().includes(cleanQuery) ||
        String(a.id).includes(cleanQuery)
      );
    }).slice(0, cleanQuery ? 15 : 6);

    // Islamic Articles / Kajian filter
    const matchedArticles = ISLAMIC_ARTICLES.filter((art) => {
      if (!cleanQuery) return true;
      return (
        art.title.toLowerCase().includes(cleanQuery) ||
        art.summary.toLowerCase().includes(cleanQuery) ||
        art.category.toLowerCase().includes(cleanQuery) ||
        art.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      );
    }).slice(0, cleanQuery ? 15 : 6);

    return {
      surahs: matchedSurahs,
      dzikir: matchedDzikir,
      asmaul: matchedAsmaul,
      articles: matchedArticles,
      totalCount:
        matchedSurahs.length +
        matchedDzikir.length +
        matchedAsmaul.length +
        matchedArticles.length,
    };
  }, [query]);

  // Action handlers
  const handleSelectSurah = (surahNumber: number) => {
    setActiveQuranSurah(surahNumber);
    setActiveTab('quran');
    onClose();
  };

  const handleSelectDzikir = (dzikir: (typeof INITIAL_DZIKIR_LIST)[0]) => {
    setActiveDzikirId(dzikir.id);
    setActiveTab('dzikir');
    onClose();
  };

  const handleSelectAsmaul = (item: (typeof ASMAUL_HUSNA_LIST)[0]) => {
    setActiveTab('asmaul-husna');
    onClose();
  };

  const handleReadArticle = (article: IslamicArticle) => {
    setSelectedArticle(article);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto sm:my-8"
        id="global-search-modal"
      >
        {/* Article Full View Mode */}
        {selectedArticle ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                ← Kembali ke Pencarian
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedArticle.readTime} bacaan • {selectedArticle.author}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {selectedArticle.title}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 font-medium leading-relaxed">
              💡 <strong>Ringkasan:</strong> {selectedArticle.summary}
            </div>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
              <p>{selectedArticle.content}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-bold">Topik Terkait:</span>
              {selectedArticle.tags.map((t, idx) => (
                <span
                  key={`tag-${selectedArticle.id}-${t}-${idx}`}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Search View */
          <div>
            {/* Search Input Box */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Search className="w-5 h-5 text-emerald-700 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari surat Al-Qur'an, doa, dzikir, atau artikel kajian..."
                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium"
                id="global-search-input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 text-xs font-bold transition-colors shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('quran')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFilter === 'quran'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Al-Qur'an ({searchResults.surahs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('dzikir')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFilter === 'dzikir'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Doa & Dzikir ({searchResults.dzikir.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('kajian')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFilter === 'kajian'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kajian ({searchResults.articles.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('asmaul')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFilter === 'asmaul'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Asmaul Husna ({searchResults.asmaul.length})</span>
              </button>
            </div>

            {/* Results Scrollable Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* 1. Surah Al-Qur'an Section */}
              {(selectedFilter === 'all' || selectedFilter === 'quran') &&
                searchResults.surahs.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Surat Al-Qur'an</span>
                      </div>
                      <span>{searchResults.surahs.length} Surat</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.surahs.map((surah) => (
                        <button
                          key={surah.number}
                          type="button"
                          onClick={() => handleSelectSurah(surah.number)}
                          className="p-3 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 text-left transition-all flex items-center justify-between group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-emerald-800 font-extrabold text-xs flex items-center justify-center font-mono shadow-2xs group-hover:border-emerald-300">
                              {surah.number}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                                {surah.nameLatin}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[130px] sm:max-w-[160px]">
                                {surah.nameTranslation} • {surah.numberOfAyahs} Ayat
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-amiri text-base sm:text-lg text-emerald-800 font-bold block">
                              {surah.nameArabic}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Juz {surah.juzStart}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* 2. Dzikir & Doa Section */}
              {(selectedFilter === 'all' || selectedFilter === 'dzikir') &&
                searchResults.dzikir.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Doa & Dzikir Pilihan</span>
                      </div>
                      <span>{searchResults.dzikir.length} Dzikir</span>
                    </div>

                    <div className="space-y-2">
                      {searchResults.dzikir.map((dzikir) => (
                        <button
                          key={dzikir.id}
                          type="button"
                          onClick={() => handleSelectDzikir(dzikir)}
                          className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 text-left transition-all flex items-start justify-between gap-3 group active:scale-[0.98]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                                {dzikir.title}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700 capitalize">
                                {dzikir.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-1">
                              {dzikir.meaning}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* 3. Artikel Kajian & Panduan Section */}
              {(selectedFilter === 'all' || selectedFilter === 'kajian') &&
                searchResults.articles.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        <span>Artikel Kajian & Panduan Ibadah</span>
                      </div>
                      <span>{searchResults.articles.length} Artikel</span>
                    </div>

                    <div className="space-y-2">
                      {searchResults.articles.map((art) => (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => handleReadArticle(art)}
                          className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-200/70 hover:border-purple-200 text-left transition-all flex items-start justify-between gap-3 group active:scale-[0.98]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-purple-950">
                                {art.title}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-800 shrink-0">
                                {art.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              {art.summary}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {art.readTime}
                            </span>
                            <span className="text-[11px] font-bold text-purple-700 flex items-center gap-0.5 mt-1 group-hover:underline">
                              <span>Baca</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* 4. Asmaul Husna Section */}
              {(selectedFilter === 'all' || selectedFilter === 'asmaul') &&
                searchResults.asmaul.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>99 Asmaul Husna</span>
                      </div>
                      <span>{searchResults.asmaul.length} Nama</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.asmaul.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectAsmaul(item)}
                          className="p-3 rounded-2xl bg-slate-50/80 hover:bg-amber-50/60 border border-slate-200/70 hover:border-amber-200 text-left transition-all flex items-center justify-between group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-amber-900 font-extrabold text-xs flex items-center justify-center font-mono">
                              {item.id}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-950">
                                {item.nameLatin}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {item.meaning}
                              </div>
                            </div>
                          </div>

                          <span className="font-amiri text-lg text-amber-800 font-bold">
                            {item.nameArabic}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Empty state */}
              {searchResults.totalCount === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Tidak ditemukan hasil untuk "{query}"
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Coba cari dengan kata kunci lain seperti nama surat (Al-Kahf, Yasin), doa, atau topik kajian.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Fast Suggestions */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-600">Pencarian Populer:</span>
                <button
                  type="button"
                  onClick={() => setQuery('Al-Kahf')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] hover:text-emerald-700"
                >
                  Al-Kahf
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Yasin')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] hover:text-emerald-700"
                >
                  Yasin
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Istighfar')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] hover:text-emerald-700"
                >
                  Istighfar
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Tahajjud')}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] hover:text-emerald-700"
                >
                  Tahajjud
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Gunakan <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px]">Ctrl+K</kbd> untuk buka cepat
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
