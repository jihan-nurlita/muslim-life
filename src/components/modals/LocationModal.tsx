import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Navigation, Check, Search, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POPULAR_CITIES } from '../../utils/prayerCalculator';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useApp();
  const [search, setSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCity = (c: (typeof POPULAR_CITIES)[0]) => {
    updateSettings({
      city: c.city,
      country: c.country,
      latitude: c.lat,
      longitude: c.lng,
      isAutoLocation: false,
    });
    onClose();
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Browser tidak mendukung geolokasi');
      return;
    }

    setIsLocating(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        updateSettings({
          city: 'Lokasi Terdeteksi (GPS)',
          country: 'Koordinat Presisi',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isAutoLocation: true,
        });
        onClose();
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage('Gagal mendeteksi lokasi otomatis. Silakan pilih kota manual.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
          id="location-modal"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Lokasi & Jadwal Sholat</h3>
                <p className="text-xs text-slate-500">Sesuaikan kota untuk akurasi waktu sholat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-location-modal-btn"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* GPS Button */}
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              id="gps-auto-detect-btn"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Mendeteksi Lokasi GPS...' : 'Gunakan Lokasi Saat Ini (GPS Otomatis)'}
            </button>

            {errorMessage && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                {errorMessage}
              </p>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama kota..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50"
                id="search-city-input"
              />
            </div>

            {/* City List */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 block">Daftar Kota Populer:</label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {filteredCities.map((c) => {
                  const isCurrent = settings.city === c.city;
                  return (
                    <button
                      key={`city-${c.city}-${c.country}-${c.lat}-${c.lng}`}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      id={`select-city-${c.city.toLowerCase()}`}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className={`w-4 h-4 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs block text-slate-800 font-medium">{c.city}</span>
                          <span className="text-[10px] text-slate-500">{c.country} ({c.lat.toFixed(2)}°, {c.lng.toFixed(2)}°)</span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
