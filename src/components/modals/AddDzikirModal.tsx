import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, BookOpen, Edit3, RotateCcw, Target, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DzikirItem } from '../../types';
import { INITIAL_DZIKIR_LIST } from '../../data/dzikirData';

interface AddDzikirModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDzikir?: DzikirItem | null;
}

export const AddDzikirModal: React.FC<AddDzikirModalProps> = ({ isOpen, onClose, editingDzikir }) => {
  const { addCustomDzikir, updateDzikir, restoreOriginalDzikir } = useApp();
  const [title, setTitle] = useState('');
  const [textArabic, setTextArabic] = useState('');
  const [textLatin, setTextLatin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [category, setCategory] = useState<'pagi' | 'petang' | 'sholat' | 'tidur' | 'sholawat' | 'harian' | 'custom'>('custom');
  const [targetCount, setTargetCount] = useState<number>(33);
  const [isCustomTargetMode, setIsCustomTargetMode] = useState<boolean>(false);
  const [benefit, setBenefit] = useState('');
  const [source, setSource] = useState('');

  const isBuiltIn = editingDzikir ? INITIAL_DZIKIR_LIST.some((d) => d.id === editingDzikir.id) : false;

  useEffect(() => {
    if (editingDzikir) {
      setTitle(editingDzikir.title);
      setTextArabic(editingDzikir.textArabic || '');
      setTextLatin(editingDzikir.textLatin || '');
      setMeaning(editingDzikir.meaning || '');
      setCategory((editingDzikir.category as any) || 'custom');
      setTargetCount(editingDzikir.targetCount || 33);
      setIsCustomTargetMode(![33, 100, 1000, 5000].includes(editingDzikir.targetCount));
      setBenefit(editingDzikir.benefit || '');
      setSource(editingDzikir.source || '');
    } else {
      setTitle('');
      setTextArabic('');
      setTextLatin('');
      setMeaning('');
      setCategory('custom');
      setTargetCount(33);
      setIsCustomTargetMode(false);
      setBenefit('');
      setSource('');
    }
  }, [editingDzikir, isOpen]);

  if (!isOpen) return null;

  const handleResetToOriginal = () => {
    if (editingDzikir && isBuiltIn) {
      restoreOriginalDzikir(editingDzikir.id);
      const orig = INITIAL_DZIKIR_LIST.find((d) => d.id === editingDzikir.id);
      if (orig) {
        setTitle(orig.title);
        setTextArabic(orig.textArabic);
        setTextLatin(orig.textLatin);
        setMeaning(orig.meaning);
        setCategory(orig.category);
        setTargetCount(orig.targetCount);
        setIsCustomTargetMode(![33, 100, 1000, 5000].includes(orig.targetCount));
        setBenefit(orig.benefit || '');
        setSource(orig.source || '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validatedTarget = Math.max(1, Number(targetCount) || 33);

    if (editingDzikir) {
      updateDzikir(editingDzikir.id, {
        title: title.trim(),
        category,
        textArabic: textArabic.trim() || 'سُبْحَانَ اللَّهِ',
        textLatin: textLatin.trim() || title,
        meaning: meaning.trim() || 'Dzikir dan doa kepada Allah SWT.',
        targetCount: validatedTarget,
        benefit: benefit.trim() || undefined,
        source: source.trim() || undefined,
      });
    } else {
      addCustomDzikir({
        title: title.trim(),
        category,
        textArabic: textArabic.trim() || 'سُبْحَانَ اللَّهِ',
        textLatin: textLatin.trim() || title,
        meaning: meaning.trim() || 'Dzikir dan doa kepada Allah SWT.',
        targetCount: validatedTarget,
        benefit: benefit.trim() || undefined,
        source: source.trim() || undefined,
      });
    }

    onClose();
  };

  const TARGET_PRESETS = [33, 100, 1000, 5000];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
          id="add-dzikir-modal"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                {editingDzikir ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingDzikir ? 'Edit Data Dzikir & Target' : 'Tambah Dzikir Manual'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingDzikir
                    ? isBuiltIn
                      ? 'Salinan personal dzikir bawaan (data asli tetap aman)'
                      : 'Perbarui rincian bacaan dan target hitungan'
                    : 'Buat dzikir atau sholawat custom untuk tasbih digital'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              id="close-add-dzikir-btn"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
            {/* Built-in Personal Copy Banner */}
            {editingDzikir && isBuiltIn && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Dzikir Bawaan Sistem</span>
                    <span className="text-amber-800 text-[11px]">
                      Perubahan nama, lafadz, maupun target akan disimpan sebagai salinan personal Anda tanpa merusak data asli.
                    </span>
                  </div>
                </div>
                {(editingDzikir.isPersonalCopy || editingDzikir.isEdited) && (
                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100 transition-colors shrink-0 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Asli</span>
                  </button>
                )}
              </div>
            )}

            {/* Nama Dzikir */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nama Dzikir / Sholawat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sholawat Munjiyat / Dzikir Khusus"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                id="dzikir-title-input"
              />
            </div>

            {/* Kategori & Target Settings */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Kategori Dzikir</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                  id="dzikir-category-select"
                >
                  <option value="custom">Dzikir Pilihan (Custom)</option>
                  <option value="sholawat">Sholawat Nabi</option>
                  <option value="pagi">Dzikir Pagi</option>
                  <option value="petang">Dzikir Petang</option>
                  <option value="sholat">Setelah Sholat</option>
                  <option value="tidur">Sebelum Tidur</option>
                  <option value="harian">Dzikir Harian</option>
                </select>
              </div>

              {/* Target Hitungan with Quick Presets (33, 100, 1000, 5000, Custom) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Target Hitungan Tasbih</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    {targetCount.toLocaleString('id-ID')}x
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-5 gap-1.5">
                  {TARGET_PRESETS.map((preset) => (
                    <button
                      key={`add-dzikir-preset-${preset}`}
                      type="button"
                      onClick={() => {
                        setTargetCount(preset);
                        setIsCustomTargetMode(false);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                        targetCount === preset && !isCustomTargetMode
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset >= 1000 ? `${preset.toLocaleString('id-ID')}` : preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomTargetMode(true)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      isCustomTargetMode
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Custom Number Input */}
                {isCustomTargetMode && (
                  <div className="pt-1.5">
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={targetCount}
                      onChange={(e) => setTargetCount(Math.max(1, Number(e.target.value)))}
                      placeholder="Masukkan angka target bebas (misal 70, 300, 10000)"
                      className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-mono"
                      id="dzikir-custom-target-input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Teks Arab */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Teks Arab (Kaligrafi)</label>
              <textarea
                dir="rtl"
                rows={2}
                value={textArabic}
                onChange={(e) => setTextArabic(e.target.value)}
                placeholder="اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-amiri text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 resize-none"
                id="dzikir-arabic-input"
              />
            </div>

            {/* Transliterasi Latin */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Transliterasi Latin</label>
              <input
                type="text"
                value={textLatin}
                onChange={(e) => setTextLatin(e.target.value)}
                placeholder="Allahumma shalli 'ala sayyidina Muhammad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                id="dzikir-latin-input"
              />
            </div>

            {/* Arti / Terjemahan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Arti / Terjemahan</label>
              <textarea
                rows={2}
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 resize-none"
                id="dzikir-meaning-input"
              />
            </div>

            {/* Keutamaan & Sumber */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Fadhilah / Keutamaan (Opsional)</label>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  placeholder="Penenang hati dan pembuka pintu rezeki"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                  id="dzikir-benefit-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Sumber / Dalil Hadits (Opsional)</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Contoh: HR. Bukhari & Muslim"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                  id="dzikir-source-input"
                />
              </div>
            </div>

            {/* Submit & Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                id="cancel-add-dzikir-btn"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                id="save-new-dzikir-btn"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-950/10 flex items-center gap-2 transition-all active:scale-95"
              >
                {editingDzikir ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingDzikir ? 'Simpan Perubahan' : 'Simpan Dzikir'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
