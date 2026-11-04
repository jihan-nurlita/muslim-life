import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Target,
  Sparkles,
  BookOpen,
  Heart,
  Moon,
  Sun,
  Flame,
  Coins,
  Feather,
  Sunrise,
  Sunset,
  CloudSun,
  HeartHandshake,
  CalendarCheck,
  Edit3,
  Bell,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  Power,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitCategory, HabitFrequencyType, HabitItem, DayRecord } from '../../types';
import {
  STANDARD_HABIT_UNITS,
  isCurrencyUnit,
  formatHabitValue,
  parseCleanNumber,
} from '../../utils/habitFormatter';

const PUASA_CONFIGS: Record<
  string,
  {
    title: string;
    fastingType: DayRecord['fastingType'];
    target: number;
    unit: string;
    iconName: string;
    frequency: HabitFrequencyType;
    specificDays?: number[];
    frequencyNote?: string;
    reminderEnabled: boolean;
    reminderTime: string;
    description: string;
  }
> = {
  puasa_senin_kamis: {
    title: 'Puasa Sunnah Senin/Kamis',
    fastingType: 'senin_kamis',
    target: 1,
    unit: 'hari',
    iconName: 'Sun',
    frequency: 'specific_days',
    specificDays: [1, 4],
    frequencyNote: 'Senin & Kamis',
    reminderEnabled: true,
    reminderTime: '03:30',
    description: 'Puasa sunnah setiap hari Senin dan Kamis',
  },
  puasa_ayyamul_bidh: {
    title: 'Puasa Ayyamul Bidh (13–15)',
    fastingType: 'ayyamul_bidh',
    target: 1,
    unit: 'hari',
    iconName: 'CalendarCheck',
    frequency: 'custom',
    frequencyNote: 'Tanggal 13, 14, 15 Hijriyah',
    reminderEnabled: true,
    reminderTime: '03:30',
    description: 'Puasa sunnah pertengahan bulan hijriyah (13, 14, 15)',
  },
  puasa_daud: {
    title: 'Puasa Daud',
    fastingType: 'daud',
    target: 1,
    unit: 'hari',
    iconName: 'CalendarCheck',
    frequency: 'custom',
    frequencyNote: 'Sehari Puasa, Sehari Berbuka',
    reminderEnabled: true,
    reminderTime: '03:30',
    description: 'Puasa selang-seling sehari puasa dan sehari tidak',
  },
  puasa_ramadhan: {
    title: 'Puasa Wajib Ramadhan',
    fastingType: 'ramadhan',
    target: 1,
    unit: 'hari',
    iconName: 'Sparkles',
    frequency: 'daily',
    reminderEnabled: true,
    reminderTime: '03:30',
    description: 'Puasa wajib di bulan suci Ramadhan',
  },
  puasa_nazar: {
    title: 'Puasa Qadha/Nazar',
    fastingType: 'nazar',
    target: 1,
    unit: 'hari',
    iconName: 'Heart',
    frequency: 'custom',
    frequencyNote: 'Sesuai Niat / Kewajiban',
    reminderEnabled: true,
    reminderTime: '03:30',
    description: 'Puasa qadha pengganti atau penunaian nazar',
  },
  puasa_sunnah_lainnya: {
    title: 'Puasa Sunnah Lainnya (Arafah, Asyura, dll.)',
    fastingType: 'sunnah_lainnya',
    target: 1,
    unit: 'hari',
    iconName: 'CalendarCheck',
    frequency: 'custom',
    frequencyNote: 'Arafah, Asyura, Syawal, dll.',
    reminderEnabled: true,
    reminderTime: '03:30',
    description: 'Puasa sunnah momentum khusus umat Islam',
  },
};

function getInitialCategoryOption(habit?: HabitItem | null): string {
  if (!habit) return 'custom';
  if (habit.category === 'puasa') {
    if (habit.fastingType && habit.fastingType !== 'none') {
      return `puasa_${habit.fastingType}`;
    }
    if (habit.syncSource?.startsWith('puasa_')) {
      return habit.syncSource;
    }
    const t = (habit.title || '').toLowerCase();
    if (t.includes('ayyamul')) return 'puasa_ayyamul_bidh';
    if (t.includes('daud')) return 'puasa_daud';
    if (t.includes('ramadhan')) return 'puasa_ramadhan';
    if (t.includes('nazar') || t.includes('qadha')) return 'puasa_nazar';
    if (t.includes('senin') || t.includes('kamis')) return 'puasa_senin_kamis';
    if (t.includes('arafah') || t.includes('asyura') || t.includes('lainnya')) return 'puasa_sunnah_lainnya';
    return 'puasa_senin_kamis';
  }
  return habit.category;
}

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabit?: HabitItem | null;
}

const ICONS = [
  { name: 'Sparkles', label: 'Bintang', icon: Sparkles },
  { name: 'BookOpen', label: 'Al-Qur\'an', icon: BookOpen },
  { name: 'Sunrise', label: 'Subuh', icon: Sunrise },
  { name: 'Sun', label: 'Siang', icon: Sun },
  { name: 'CloudSun', label: 'Sore', icon: CloudSun },
  { name: 'Sunset', label: 'Maghrib', icon: Sunset },
  { name: 'Moon', label: 'Malam', icon: Moon },
  { name: 'Feather', label: 'Dzikir', icon: Feather },
  { name: 'HeartHandshake', label: 'Kebaikan', icon: HeartHandshake },
  { name: 'Heart', label: 'Sholawat', icon: Heart },
  { name: 'Coins', label: 'Sedekah', icon: Coins },
  { name: 'CalendarCheck', label: 'Puasa', icon: CalendarCheck },
  { name: 'Flame', label: 'Tahajjud', icon: Flame },
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Sen', full: 'Senin' },
  { id: 2, label: 'Sel', full: 'Selasa' },
  { id: 3, label: 'Rab', full: 'Rabu' },
  { id: 4, label: 'Kam', full: 'Kamis' },
  { id: 5, label: 'Jum', full: 'Jumat' },
  { id: 6, label: 'Sab', full: 'Sabtu' },
  { id: 0, label: 'Ahd', full: 'Ahad' },
];

const TIME_PRESETS = [
  { label: 'Subuh', time: '04:30' },
  { label: 'Pagi', time: '06:00' },
  { label: 'Dhuha', time: '08:30' },
  { label: 'Dzuhur', time: '12:00' },
  { label: 'Ashar', time: '15:15' },
  { label: 'Maghrib', time: '18:00' },
  { label: 'Isya', time: '19:30' },
  { label: 'Malam', time: '21:00' },
  { label: 'Tahajjud', time: '03:30' },
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, editingHabit }) => {
  const {
    addCustomHabit,
    updateHabit,
  } = useApp();

  // Basic Info
  const [title, setTitle] = useState('');
  const [categoryOption, setCategoryOption] = useState<string>('custom');
  const [category, setCategory] = useState<HabitCategory>('custom');
  const [puasaType, setPuasaType] = useState<DayRecord['fastingType'] | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState<number | string>(1);
  const [unitPreset, setUnitPreset] = useState<string>('kali');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [iconName, setIconName] = useState('Sparkles');

  // Advanced Settings
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [frequency, setFrequency] = useState<HabitFrequencyType>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([1, 4]); // default Senin & Kamis
  const [frequencyNote, setFrequencyNote] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('05:00');
  const [isActive, setIsActive] = useState(true);

  const effectiveUnit = unitPreset === 'custom' ? customUnit || 'kali' : unitPreset;
  const isCurrency = isCurrencyUnit(effectiveUnit);

  useEffect(() => {
    if (editingHabit) {
      const initialCatOpt = getInitialCategoryOption(editingHabit);
      setCategoryOption(initialCatOpt);
      setTitle(editingHabit.title);
      setCategory(editingHabit.category);
      if (editingHabit.category === 'puasa') {
        const config = PUASA_CONFIGS[initialCatOpt];
        setPuasaType(editingHabit.fastingType || config?.fastingType || 'senin_kamis');
      } else {
        setPuasaType(undefined);
      }
      setDescription(editingHabit.description || '');
      setTarget(editingHabit.target || 1);

      const standardMatch = STANDARD_HABIT_UNITS.find(
        (u) => u.id === editingHabit.unit?.toLowerCase()
      );
      if (standardMatch) {
        setUnitPreset(standardMatch.id);
        setCustomUnit('');
      } else {
        setUnitPreset('custom');
        setCustomUnit(editingHabit.unit || '');
      }

      setIconName(editingHabit.iconName || 'Sparkles');
      setFrequency(editingHabit.frequency || 'daily');
      setSpecificDays(editingHabit.specificDays || [1, 4]);
      setFrequencyNote(editingHabit.frequencyNote || '');
      setReminderEnabled(Boolean(editingHabit.reminderEnabled));
      setReminderTime(editingHabit.reminderTime || '05:00');
      setIsActive(editingHabit.isActive !== false);

      if (editingHabit.frequency !== 'daily' || editingHabit.reminderEnabled || editingHabit.isActive === false) {
        setIsAdvancedOpen(true);
      } else {
        setIsAdvancedOpen(false);
      }
    } else {
      setTitle('');
      setCategoryOption('custom');
      setCategory('custom');
      setPuasaType(undefined);
      setDescription('');
      setTarget(1);
      setUnitPreset('kali');
      setCustomUnit('');
      setIconName('Sparkles');
      setFrequency('daily');
      setSpecificDays([1, 4]);
      setFrequencyNote('');
      setReminderEnabled(false);
      setReminderTime('05:00');
      setIsActive(true);
      setIsAdvancedOpen(false);
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newOption: string) => {
    setCategoryOption(newOption);

    if (newOption.startsWith('puasa')) {
      const config = PUASA_CONFIGS[newOption] || PUASA_CONFIGS['puasa_senin_kamis'];
      setCategory('puasa');
      setPuasaType(config.fastingType);

      // Target dan satuan pelaksanaan otomatis menyesuaikan jenis puasa
      setTarget(config.target);
      setUnitPreset(config.unit);
      setCustomUnit('');

      // Update default metadata if title is empty or matching a known default puasa title
      const isDefaultOrEmpty =
        !title.trim() ||
        title.trim() === 'Puasa Sunnah' ||
        Object.values(PUASA_CONFIGS).some((c) => c.title === title.trim());

      if (isDefaultOrEmpty) {
        setTitle(config.title);
        setDescription(config.description);
        setIconName(config.iconName);
        setFrequency(config.frequency);
        if (config.specificDays) setSpecificDays(config.specificDays);
        if (config.frequencyNote) setFrequencyNote(config.frequencyNote);
        setReminderEnabled(config.reminderEnabled);
        setReminderTime(config.reminderTime);
      }
    } else {
      setCategory(newOption as HabitCategory);
      setPuasaType(undefined);
      if (!editingHabit) {
        if (newOption === 'sedekah') {
          setTarget(10000);
          setUnitPreset('rupiah');
          setIconName('Coins');
        } else if (newOption === 'quran') {
          setTarget(20);
          setUnitPreset('halaman');
          setIconName('BookOpen');
        } else if (newOption === 'dzikir') {
          setTarget(33);
          setUnitPreset('kali');
          setIconName('Feather');
        } else if (newOption === 'sholawat') {
          setTarget(100);
          setUnitPreset('kali');
          setIconName('Heart');
        } else if (newOption === 'sholat') {
          setTarget(2);
          setUnitPreset('rakaat');
          setIconName('Sunrise');
        } else {
          setTarget(1);
          setUnitPreset('kali');
          setIconName('Sparkles');
        }
      }
    }
  };

  const handleUnitPresetChange = (newPreset: string) => {
    setUnitPreset(newPreset);
    if (!editingHabit && (target === 1 || target === '1')) {
      const matched = STANDARD_HABIT_UNITS.find((u) => u.id === newPreset);
      if (matched) {
        setTarget(matched.defaultTarget);
      }
    }
  };

  const toggleDay = (dayId: number) => {
    setSpecificDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalUnit = (unitPreset === 'custom' ? customUnit.trim() : unitPreset) || 'kali';
    const numTarget = Math.max(1, parseCleanNumber(target) || 1);

    const habitPayload = {
      title: title.trim(),
      category,
      description: description.trim() || undefined,
      target: numTarget,
      unit: finalUnit,
      iconName,
      isActive,
      frequency,
      specificDays: frequency === 'specific_days' ? specificDays : undefined,
      frequencyNote: frequency === 'custom' || frequency === 'weekly' ? frequencyNote.trim() || undefined : undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      syncSource:
        category === 'puasa' && puasaType
          ? (`puasa_${puasaType}` as any)
          : editingHabit?.syncSource || (category === 'puasa' ? 'puasa' : undefined),
      fastingType: category === 'puasa' ? puasaType : undefined,
    };

    if (editingHabit) {
      updateHabit(editingHabit.id, habitPayload);
    } else {
      const generatedId = `custom-h-${Date.now()}`;
      addCustomHabit({
        ...habitPayload,
        id: generatedId,
        isCustom: true,
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
          id="add-habit-modal"
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                {editingHabit ? <Edit3 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {editingHabit ? 'Edit Habit Ibadah' : 'Tambah Habit Ibadah'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingHabit ? 'Perbarui target, satuan, nilai & pengingat habit' : 'Bangun kebiasaan ibadah dengan target & pencatatan nyata'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-add-habit-btn"
              type="button"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Nama Habit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nama Habit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sholat Sunnah Rawatib / Sedekah Subuh / Baca Al-Qur'an"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 transition-colors"
                id="habit-title-input"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Kategori Ibadah</label>
              <select
                value={categoryOption}
                onChange={(e: any) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 transition-colors"
                id="habit-category-select"
              >
                <option value="custom">Kebaikan Harian / Amal Shalih</option>
                <option value="sholat">Sholat Wajib & Sunnah (Dhuha/Tahajjud/Rawatib)</option>
                <option value="quran">Tilawah Al-Qur'an</option>
                <option value="dzikir">Dzikir & Doa</option>
                <option value="sholawat">Sholawat Nabi</option>
                <option value="sedekah">Sedekah & Infaq Subuh</option>
                <optgroup label="Puasa (Sinkron Kalender Ibadah)">
                  <option value="puasa_senin_kamis">Puasa Sunnah Senin/Kamis</option>
                  <option value="puasa_ayyamul_bidh">Puasa Ayyamul Bidh (13–15)</option>
                  <option value="puasa_daud">Puasa Daud</option>
                  <option value="puasa_ramadhan">Puasa Wajib Ramadhan</option>
                  <option value="puasa_nazar">Puasa Qadha/Nazar</option>
                  <option value="puasa_sunnah_lainnya">Puasa Sunnah Lainnya (Arafah, Asyura, dll.)</option>
                </optgroup>
                <option value="puasa" className="hidden">Puasa Sunnah</option>
              </select>
            </div>

            {/* Target & Satuan Target (Full Precision) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Target & Satuan Pelaksanaan
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Wajib diisi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Jumlah Target:
                  </label>
                  <div className="relative">
                    {isCurrency && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        Rp
                      </span>
                    )}
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder={isCurrency ? '50000' : '1'}
                      className={`w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-colors ${
                        isCurrency ? 'pl-9 pr-3' : 'px-3'
                      }`}
                      id="habit-target-input"
                    />
                  </div>
                </div>

                {/* Satuan Preset */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Satuan Target:
                  </label>
                  <select
                    value={unitPreset}
                    onChange={(e) => handleUnitPresetChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-colors"
                    id="habit-unit-preset-select"
                  >
                    {STANDARD_HABIT_UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* If Custom Unit selected */}
              {unitPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1 pt-1"
                >
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Ketik Nama Satuan Custom:
                  </label>
                  <input
                    type="text"
                    required
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="Contoh: lembar / artikel / orang / putaran"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-colors"
                    id="habit-custom-unit-input"
                  />
                </motion.div>
              )}

              {/* Summary display */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Preview Target:</span>
                <span className="font-extrabold text-emerald-800 font-mono">
                  {formatHabitValue(parseCleanNumber(target) || 0, effectiveUnit)}
                </span>
              </div>
            </div>

            {/* Deskripsi / Niat */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Deskripsi / Niat Amal</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rutin menjaga kebiasaan sunnah membuka pintu keberkahan..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 resize-none transition-colors"
                id="habit-desc-input"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Pilih Ikon Visual</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {ICONS.map((ic) => {
                  const IconComp = ic.icon;
                  const isSelected = iconName === ic.name;
                  return (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setIconName(ic.name)}
                      className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-[10px] truncate max-w-full">{ic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pengaturan Lanjutan (Accordion Section) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                id="toggle-advanced-settings-btn"
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Pengaturan Lanjutan</span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      (Frekuensi, Pengingat Waktu, Status Aktif)
                    </span>
                  </div>
                </div>
                {isAdvancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {isAdvancedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-200/60 bg-white px-4 py-4 space-y-4"
                  >
                    {/* Status Aktif / Nonaktif */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                          <Power className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Status Habit</p>
                          <p className="text-[10px] text-slate-500">
                            {isActive ? 'Habit aktif dan tampil di daftar mutaba\'ah harian' : 'Habit dinonaktifkan sementara (riwayat tetap aman)'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        id="toggle-habit-active-switch"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Frekuensi Pelaksanaan */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Frekuensi Pelaksanaan
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'daily', label: 'Setiap Hari' },
                          { id: 'specific_days', label: 'Hari Tertentu' },
                          { id: 'weekly', label: 'Mingguan' },
                          { id: 'custom', label: 'Custom' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFrequency(item.id as HabitFrequencyType)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                              frequency === item.id
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Jika Hari Tertentu */}
                      {frequency === 'specific_days' && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1.5"
                        >
                          <span className="text-[11px] font-semibold text-slate-700 block">
                            Pilih Hari Pelaksanaan:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {DAYS_OF_WEEK.map((day) => {
                              const isChecked = specificDays.includes(day.id);
                              return (
                                <button
                                  key={day.id}
                                  type="button"
                                  onClick={() => toggleDay(day.id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    isChecked
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {day.label}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-slate-500 pt-1">
                            Habit diutamakan pada hari pilihan (contoh: Puasa Sunnah Senin & Kamis).
                          </p>
                        </motion.div>
                      )}

                      {/* Jika Mingguan atau Custom */}
                      {(frequency === 'weekly' || frequency === 'custom') && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <input
                            type="text"
                            value={frequencyNote}
                            onChange={(e) => setFrequencyNote(e.target.value)}
                            placeholder={
                              frequency === 'weekly'
                                ? 'Contoh: 1x setiap hari Jumat'
                                : 'Contoh: 3 hari di pertengahan bulan Hijriah'
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Pengingat Waktu (Opsional) */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-emerald-600" />
                          <label className="text-xs font-semibold text-slate-700">
                            Pengingat Waktu (Opsional)
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReminderEnabled(!reminderEnabled)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            reminderEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          id="toggle-reminder-switch"
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              reminderEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      {reminderEnabled && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <input
                              type="time"
                              value={reminderTime}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <span className="text-[11px] text-slate-500 font-semibold">WIB</span>
                          </div>

                          {/* Quick Presets */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              Pilih Waktu Cepat:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {TIME_PRESETS.map((p) => (
                                <button
                                  key={p.label}
                                  type="button"
                                  onClick={() => setReminderTime(p.time)}
                                  className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                                    reminderTime === p.time
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {p.label} ({p.time})
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Sinkronisasi Info */}
                    <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start gap-2">
                      <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-teal-800 leading-relaxed">
                        <strong>Sinkronisasi Otomatis:</strong> Progres aktivitas habit tersimpan langsung di database harian, kalender mutaba'ah, dan grafik statistik tanpa duplikasi data.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                id="cancel-add-habit-btn"
                className="px-4.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                id="save-new-habit-btn"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition-colors"
              >
                {editingHabit ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingHabit ? 'Simpan Perubahan' : 'Simpan Habit'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
