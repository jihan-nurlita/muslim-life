import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit3, Pin, Tag, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NoteItem } from '../../types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote?: NoteItem | null;
  defaultDate?: string;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, editingNote, defaultDate }) => {
  const { addNote, updateNote } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'jurnal' | 'refleksi' | 'doa' | 'target' | 'khutbah'>('refleksi');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setCategory(editingNote.category);
      setContent(editingNote.content);
      setTagInput(editingNote.tags.join(', '));
      setIsPinned(editingNote.isPinned);
    } else {
      setTitle('');
      setCategory('refleksi');
      setContent('');
      setTagInput('');
      setIsPinned(false);
    }
  }, [editingNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title.trim(),
        category,
        content: content.trim(),
        tags,
        isPinned,
      });
    } else {
      addNote({
        title: title.trim(),
        category,
        content: content.trim(),
        date: defaultDate || new Date().toISOString().split('T')[0],
        tags,
        isPinned,
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
          id="add-note-modal"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {editingNote ? 'Edit Catatan' : 'Tulis Catatan Ibadah'}
                </h3>
                <p className="text-xs text-slate-500">Abadikan mutiara ilmu, doa, dan refleksi spiritual</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-add-note-btn"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Judul Catatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Hikmah Sabar dalam Surah Al-Baqarah 153"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50"
                id="note-title-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Kategori</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50"
                  id="note-category-select"
                >
                  <option value="refleksi">Refleksi Ayat / Hadits</option>
                  <option value="jurnal">Jurnal Harian Ibadah</option>
                  <option value="doa">Kumpulan Doa Pribadi</option>
                  <option value="target">Target Kebaikan</option>
                  <option value="khutbah">Catatan Khutbah / Kajian</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                    isPinned
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                  id="note-pin-toggle-btn"
                >
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {isPinned ? 'Tersemat di Atas' : 'Sematkan Catatan'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Isi Catatan <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan refleksi, doa yang sedang dipanjatkan, atau ringkasan ilmu yang didapat hari ini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 leading-relaxed"
                id="note-content-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Tags (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Quran, Doa, Kajian, Istiqomah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50"
                id="note-tags-input"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                id="cancel-add-note-btn"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                id="save-note-submit-btn"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingNote ? 'Perbarui Catatan' : 'Simpan Catatan'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
