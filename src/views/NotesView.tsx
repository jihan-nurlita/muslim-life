import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookMarked,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Tag,
  Calendar,
  Sparkles,
  Heart,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NoteItem } from '../types';
import { AddNoteModal } from '../components/modals/AddNoteModal';

export const NotesView: React.FC = () => {
  const { notes, deleteNote } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const CATEGORIES = [
    { id: 'all', label: 'Semua Catatan' },
    { id: 'refleksi', label: 'Refleksi Ayat' },
    { id: 'jurnal', label: 'Jurnal Ibadah' },
    { id: 'doa', label: 'Doa Pribadi' },
    { id: 'target', label: 'Target Kebaikan' },
    { id: 'khutbah', label: 'Kajian / Khutbah' },
  ];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort notes: pinned first, then newest
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleEditNote = (note: NoteItem) => {
    setEditingNote(note);
    setIsAddModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingNote(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10" id="notes-view">
      {/* Header & New Note Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Catatan & Jurnal Ibadah
          </h2>
          <p className="text-xs text-slate-500">
            Kumpulan mutiara ilmu, doa mustajab, refleksi ayat, dan jurnal harian
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            id="create-note-btn"
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tulis Catatan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari catatan / tag..."
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            id="search-notes-input"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs">Belum ada catatan ibadah pada kategori ini.</p>
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            Tulis Catatan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map((note) => {
            return (
              <motion.div
                key={note.id}
                layout
                id={`note-card-${note.id}`}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                  note.isPinned
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50/40 to-white shadow-xs ring-1 ring-amber-200'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Note Top Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {note.category}
                    </span>
                    {note.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        <Pin className="w-3 h-3 fill-amber-600" />
                        Tersemat
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditNote(note)}
                      title="Edit Catatan"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      title="Hapus Catatan"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">{note.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                    {note.content}
                  </p>
                </div>

                {/* Footer: Tags & Date */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{note.date}</span>
                  </div>

                  <div className="flex items-center gap-1 overflow-hidden">
                    {note.tags.slice(0, 2).map((tag, idx) => (
                      <span key={`note-${note.id}-tag-${tag}-${idx}`} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingNote(null);
        }}
        editingNote={editingNote}
      />
    </div>
  );
};
