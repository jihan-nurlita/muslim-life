import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MoonStar,
  Search,
  Sparkles,
  Heart,
  Play,
  RotateCcw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASMAUL_HUSNA_LIST } from '../data/asmaulHusna';
import { AsmaulHusnaItem } from '../types';

export const AsmaulHusnaView: React.FC = () => {
  const { openTasbihWithCustom } = useApp();
  const [search, setSearch] = useState('');

  const filteredList = ASMAUL_HUSNA_LIST.filter(
    (item) =>
      item.nameLatin.toLowerCase().includes(search.toLowerCase()) ||
      item.meaning.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search)
  );

  const handleOpenInTasbih = (item: AsmaulHusnaItem) => {
    openTasbihWithCustom({
      title: `Ya ${item.nameLatin}`,
      arabic: `يَا ${item.nameArabic}`,
      latin: `Ya ${item.nameLatin}`,
      meaning: item.meaning,
      targetCount: 100,
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10" id="asmaul-husna-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Asmaul Husna (99 Nama Allah)
          </h2>
          <p className="text-xs text-slate-500">
            Lengkap dengan teks Arab, latin, makna mendalam dan zikir tasbih langsung
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Asmaul Husna..."
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            id="search-asmaul-husna-input"
          />
        </div>
      </div>

      {/* Hero Hadits & Benefit Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
            <MoonStar className="w-3.5 h-3.5 text-emerald-300" />
            <span>Hadits Riwayat Bukhari & Muslim</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold">
            "Sesungguhnya Allah memiliki 99 nama, seratus kurang satu. Barangsiapa yang menghafalnya niscaya ia masuk surga."
          </h3>
          <p className="text-xs text-emerald-100/80">
            Pahami maknanya, teladani sifat-sifat keagungan-Nya dalam kehidupan sehari-hari.
          </p>
        </div>
      </div>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredList.map((item) => {
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              id={`asmaul-husna-card-${item.id}`}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              {/* Card Top */}
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-100">
                  {item.id}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenInTasbih(item)}
                  title="Zikirkan di Tasbih Digital"
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Tasbih
                </button>
              </div>

              {/* Arabic Name (Large Typography) */}
              <div className="text-center py-2">
                <span className="font-amiri text-2xl sm:text-3xl text-slate-800 block">
                  {item.nameArabic}
                </span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">{item.nameLatin}</h4>
              </div>

              {/* Meaning */}
              <div className="pt-2 border-t border-slate-100 text-center space-y-0.5">
                <p className="text-xs text-slate-700 font-medium leading-snug">
                  "{item.meaning}"
                </p>
                {item.explanation && (
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {item.explanation}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
