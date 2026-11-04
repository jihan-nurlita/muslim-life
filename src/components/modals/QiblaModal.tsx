import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  MapPin,
  Sparkles,
  Navigation,
  Info,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sliders,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  calculateQiblaAngle,
  calculateDistanceToMakkah,
  getCardinalDirection,
  MAKKAH_COORDINATES,
} from '../../utils/prayerCalculator';
import { LocationModal } from './LocationModal';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
  qiblaAngle?: number;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useApp();

  // Calculated Qibla Bearing & Distance in real-time from current coordinates
  const calculatedBearing = calculateQiblaAngle(settings.latitude, settings.longitude);
  const distanceToKaabah = calculateDistanceToMakkah(settings.latitude, settings.longitude);
  const cardinalText = getCardinalDirection(calculatedBearing);

  // Device orientation / compass state
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [sensorStatus, setSensorStatus] = useState<'unsupported' | 'idle' | 'active' | 'denied' | 'error'>('idle');
  const [sensorErrorMsg, setSensorErrorMsg] = useState<string | null>(null);
  const [isTilted, setIsTilted] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  // Simulated desktop heading for testing
  const [simulatedHeading, setSimulatedHeading] = useState<number>(0);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  const lastVibrationTimeRef = useRef<number>(0);

  // Determine active heading: from real sensor, simulation, or null (static mode)
  const currentHeading = isSimulationMode
    ? simulatedHeading
    : deviceHeading !== null
    ? deviceHeading
    : null;

  // Relative angle to Qibla: where the Ka'bah is relative to the top of the device
  // If top of device points at heading H, and Qibla is at bearing B:
  // Relative angle = (B - H + 360) % 360
  const relativeQiblaAngle = currentHeading !== null
    ? ((calculatedBearing - currentHeading + 360) % 360)
    : calculatedBearing;

  // Calculate deviation from direct alignment (0 degrees)
  const deviation = relativeQiblaAngle > 180 ? 360 - relativeQiblaAngle : relativeQiblaAngle;
  const isAligned = currentHeading !== null && deviation <= 3.5;

  // Trigger gentle haptic vibration when perfectly aligned
  useEffect(() => {
    if (isAligned && typeof window !== 'undefined' && 'vibrate' in navigator) {
      const now = Date.now();
      if (now - lastVibrationTimeRef.current > 1500) {
        try {
          navigator.vibrate([50, 40, 50]);
          lastVibrationTimeRef.current = now;
        } catch (e) {
          // ignore if vibration blocked
        }
      }
    }
  }, [isAligned]);

  // Handle Orientation Sensor Event
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // 1. iOS Safari compass heading (0 = true north or magnetic north)
    if (typeof (event as any).webkitCompassHeading === 'number') {
      heading = (event as any).webkitCompassHeading;
    }
    // 2. Android deviceorientationabsolute or absolute deviceorientation
    else if (event.absolute && typeof event.alpha === 'number') {
      heading = (360 - event.alpha + 360) % 360;
    }
    // 3. Standard fallback alpha
    else if (typeof event.alpha === 'number') {
      heading = (360 - event.alpha + 360) % 360;
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading((prev) => {
        if (prev === null) return heading;
        // Exponential smoothing filter to reduce sensor jitter
        let diff = heading! - prev;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return ((prev + diff * 0.3) + 360) % 360;
      });
      setSensorStatus('active');
    }

    // Check if phone is tilted excessively (more than 45 deg tilt)
    if (typeof event.beta === 'number' && typeof event.gamma === 'number') {
      const tilt = Math.abs(event.beta) > 55 || Math.abs(event.gamma) > 45;
      setIsTilted(tilt);
    }
  }, []);

  // Request & Start Compass Sensor
  const startCompassSensor = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Check if DeviceOrientation is available
    if (!window.DeviceOrientationEvent) {
      setSensorStatus('unsupported');
      setSensorErrorMsg('Sensor kompas/giroskop tidak didukung pada browser ini.');
      return;
    }

    // iOS 13+ permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setSensorStatus('active');
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setSensorStatus('denied');
          setSensorErrorMsg('Izin akses sensor orientasi ditolak. Menampilkan mode kompas statis.');
        }
      } catch (err: any) {
        setSensorStatus('error');
        setSensorErrorMsg('Gagal meminta izin sensor kompas.');
      }
    } else {
      // Standard Android / Chrome / Firefox
      try {
        const win = window as any;
        if ('ondeviceorientationabsolute' in win) {
          win.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
          win.addEventListener('deviceorientation', handleOrientation, true);
        }
        setSensorStatus('active');
      } catch (e) {
        setSensorStatus('unsupported');
      }
    }
  }, [handleOrientation]);

  // Auto-attempt sensor activation on mount if modal opens
  useEffect(() => {
    if (isOpen) {
      // If permission API does not require explicit gesture (e.g. Android/Chrome)
      if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
        if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
          startCompassSensor();
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        (window as any).removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isOpen, startCompassSensor, handleOrientation]);

  // Real-time GPS Refresh from inside Modal
  const handleRefreshGPS = () => {
    if (!navigator.geolocation) {
      setSensorErrorMsg('Geolokasi GPS tidak didukung di perangkat ini.');
      return;
    }

    setIsLocatingGPS(true);
    setGpsSuccessMsg(null);
    setSensorErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingGPS(false);
        const { latitude, longitude } = position.coords;
        updateSettings({
          city: 'Lokasi Terdeteksi (GPS)',
          country: 'Koordinat Presisi',
          latitude,
          longitude,
          isAutoLocation: true,
        });
        setGpsSuccessMsg(`Lokasi diperbarui: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
        setTimeout(() => setGpsSuccessMsg(null), 4000);
      },
      (err) => {
        setIsLocatingGPS(false);
        setSensorErrorMsg('Gagal mendeteksi koordinat GPS. Pastikan izin lokasi aktif.');
        setTimeout(() => setSensorErrorMsg(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto"
          id="qibla-direction-modal"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-colors ${
                isAligned ? 'bg-emerald-600 text-white shadow-emerald-500/30 animate-pulse' : 'bg-emerald-700 text-white shadow-emerald-700/20'
              }`}>
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <span>Arah Kiblat Presisi</span>
                  {isAligned && (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                      PAS!
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Great-Circle Initial Bearing ke Ka'bah Makkah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* 1. Location Bar & Quick Action Controls */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900 truncate">
                    {settings.city}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
                    ({settings.latitude.toFixed(4)}°, {settings.longitude.toFixed(4)}°)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRefreshGPS}
                    disabled={isLocatingGPS}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                    title="Dapatkan koordinat GPS terkini secara real-time"
                  >
                    <RefreshCw className={`w-3 h-3 text-emerald-600 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                    <span>{isLocatingGPS ? 'Mencari...' : 'GPS Saya'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 transition-all shadow-2xs cursor-pointer"
                  >
                    <span>Ubah Wilayah</span>
                  </button>
                </div>
              </div>

              {gpsSuccessMsg && (
                <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 p-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{gpsSuccessMsg}</span>
                </div>
              )}

              {sensorErrorMsg && (
                <div className="text-[11px] text-rose-700 font-semibold bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{sensorErrorMsg}</span>
                </div>
              )}
            </div>

            {/* 2. Sensor Status Banner & Instructions */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {currentHeading !== null ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                )}
                <span className="text-emerald-950 font-bold truncate">
                  {currentHeading !== null
                    ? isSimulationMode
                      ? `Mode Simulasi Kompas (Heading: ${Math.round(currentHeading)}°)`
                      : `Sensor Kompas HP Aktif (${Math.round(currentHeading)}° Heading)`
                    : 'Mode Kompas Statis (Berdasarkan Koordinat)'}
                </span>
              </div>

              {typeof window !== 'undefined' && typeof (DeviceOrientationEvent as any)?.requestPermission === 'function' && sensorStatus !== 'active' && (
                <button
                  type="button"
                  onClick={startCompassSensor}
                  className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Izinkan Sensor</span>
                </button>
              )}
            </div>

            {/* Warning if phone is held tilted vertically */}
            {isTilted && sensorStatus === 'active' && (
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Posisikan perangkat mendatar/horizontal di meja atau telapak tangan untuk hasil kompas terbaik.</span>
              </div>
            )}

            {/* 3. Real-Time Interactive Compass Display */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              {/* Target Alignment Status Ring Indicator */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Outer Ring Dial (Rotates with -currentHeading if sensor active so dial matches real world North) */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-slate-200 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50/80 shadow-md flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{
                    transform: currentHeading !== null ? `rotate(${-currentHeading}deg)` : 'rotate(0deg)',
                  }}
                >
                  {/* Subtle 360 degree tick marks */}
                  <div className="absolute inset-2.5 rounded-full border border-dashed border-emerald-300/70" />

                  {/* Cardinal Points on Dial */}
                  <span className="absolute top-2.5 font-mono font-black text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 shadow-2xs">
                    U (0°)
                  </span>
                  <span className="absolute right-3 font-mono font-bold text-xs text-slate-500">
                    T (90°)
                  </span>
                  <span className="absolute bottom-2.5 font-mono font-bold text-xs text-slate-500">
                    S (180°)
                  </span>
                  <span className="absolute left-3 font-mono font-bold text-xs text-slate-500">
                    B (270°)
                  </span>

                  {/* Fixed Qibla Angle Marker on the Dial Ring */}
                  <div
                    className="absolute inset-0 flex items-start justify-center pointer-events-none"
                    style={{ transform: `rotate(${calculatedBearing}deg)` }}
                  >
                    <div className="mt-1 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-sm ring-2 ring-emerald-300" />
                      <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-300 shadow-2xs mt-0.5">
                        🕋 Kiblat
                      </span>
                    </div>
                  </div>
                </div>

                {/* Device Top Reference Marker (When phone sensor is active) */}
                <div className="absolute top-0 -translate-y-2 z-20 flex flex-col items-center pointer-events-none">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-800" />
                  <span className="text-[9px] font-extrabold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md border border-slate-300">
                    Arah Depan HP
                  </span>
                </div>

                {/* Active Dynamic Qibla Needle */}
                <div
                  className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out z-10"
                  style={{
                    transform: `rotate(${relativeQiblaAngle}deg)`,
                  }}
                >
                  {/* Ka'bah Needle Head Badge */}
                  <div className="absolute top-4 sm:top-5 flex flex-col items-center -translate-y-1">
                    <motion.div
                      animate={isAligned ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-black text-xs shadow-md border ${
                        isAligned
                          ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-300/60'
                          : 'bg-emerald-700 text-emerald-50 border-emerald-500'
                      }`}
                    >
                      <span className="text-sm">🕋</span>
                      <span>Ka'bah</span>
                    </motion.div>
                  </div>

                  {/* Needle Stem */}
                  <div className={`w-3 h-44 sm:h-48 rounded-full shadow-lg relative transition-colors duration-300 ${
                    isAligned
                      ? 'bg-gradient-to-t from-emerald-800 via-emerald-500 to-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-gradient-to-t from-slate-700 via-emerald-600 to-rose-500'
                  }`}>
                    {/* Top Triangle Arrow */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[12px] ${
                      isAligned ? 'border-b-emerald-400' : 'border-b-rose-500'
                    }`} />
                  </div>

                  {/* Center Pivot Pin */}
                  <div className="absolute w-7 h-7 rounded-full bg-white border-2 border-emerald-700 shadow-md flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full transition-colors ${
                      isAligned ? 'bg-emerald-500 animate-ping' : 'bg-emerald-700'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Dynamic Turn Guidance & Degrees Readout */}
              <div className="text-center mt-4 space-y-1.5">
                {currentHeading !== null ? (
                  isAligned ? (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm shadow-md animate-bounce">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>TEPAT MENGHADAP KIBLAT! 🕋</span>
                    </div>
                  ) : relativeQiblaAngle <= 180 ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                      <span>Putar HP {Math.round(deviation)}° ke Kanan</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                      <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
                      <span>Putar HP {Math.round(deviation)}° ke Kiri</span>
                    </div>
                  )
                ) : (
                  <div className="inline-flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                      {calculatedBearing.toFixed(2)}°
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      ({cardinalText})
                    </span>
                  </div>
                )}

                <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                  <span>Sudut Kiblat: <strong className="text-slate-800 font-mono">{calculatedBearing.toFixed(2)}°</strong> dari Utara</span>
                  <span>•</span>
                  <span>Jarak: <strong className="text-slate-800 font-mono">{distanceToKaabah.toLocaleString('id-ID')} km</strong></span>
                </div>
              </div>
            </div>

            {/* 4. Desktop Simulation Slider / Test Mode Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setIsSimulationMode(!isSimulationMode)}
                  className="font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSimulationMode ? 'Tutup Uji Simulasi Putaran' : 'Tes Simulasi Putar Manual (Desktop/Demo)'}</span>
                </button>

                {isSimulationMode && (
                  <button
                    type="button"
                    onClick={() => setSimulatedHeading(Math.round(calculatedBearing))}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Set ke Arah Kiblat
                  </button>
                )}
              </div>

              {isSimulationMode && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Arah Hadap Kompas: {simulatedHeading}°</span>
                    <span>Target: {calculatedBearing.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={simulatedHeading}
                    onChange={(e) => setSimulatedHeading(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* 5. Precise Technical Reference Coordinates */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>Metode Hisab & Koordinat Referensi</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Titik Lokasi Pengguna:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {settings.latitude.toFixed(5)}°, {settings.longitude.toFixed(5)}°
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Titik Ka'bah Makkah:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {MAKKAH_COORDINATES.lat}°, {MAKKAH_COORDINATES.lng}°
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Dihitung menggunakan rumus spherical trigonometry (great-circle initial bearing) dengan akurasi hisab falak tinggi.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Ka'bah, Makkah Al-Mukarramah
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </motion.div>
      </div>

      {/* Embedded Location Modal for Changing City/Region */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </AnimatePresence>
  );
};
