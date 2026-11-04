import { PrayerTimeName } from '../types';

export interface PrayerTimesMap {
  Imsak: string;
  Subuh: string;
  Syuruq: string;
  Dhuha: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
}

export interface NextPrayerInfo {
  name: PrayerTimeName;
  timeString: string;
  remainingSeconds: number;
  remainingFormatted: string;
  isPassed: boolean;
  progressPercent: number;
}

export const CALCULATION_METHODS = [
  { id: 'kemenag', name: 'Kemenag RI (Indonesia)', fajrAngle: 20.0, ishaAngle: 18.0 },
  { id: 'mwl', name: 'Muslim World League (MWL)', fajrAngle: 18.0, ishaAngle: 17.0 },
  { id: 'makkah', name: 'Umm Al-Qura (Makkah)', fajrAngle: 18.5, ishaAngle: 19.0 },
  { id: 'egypt', name: 'Egyptian General Authority', fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: 'isna', name: 'ISNA (North America)', fajrAngle: 15.0, ishaAngle: 15.0 },
];

// Popular Indonesian & World Cities Coordinates
export const POPULAR_CITIES = [
  { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, timezone: 7 },
  { city: 'Surabaya', country: 'Indonesia', lat: -7.2575, lng: 112.7521, timezone: 7 },
  { city: 'Bandung', country: 'Indonesia', lat: -6.9175, lng: 107.6191, timezone: 7 },
  { city: 'Medan', country: 'Indonesia', lat: 3.5952, lng: 98.6722, timezone: 7 },
  { city: 'Makassar', country: 'Indonesia', lat: -5.1477, lng: 119.4327, timezone: 8 },
  { city: 'Semarang', country: 'Indonesia', lat: -6.9667, lng: 110.4167, timezone: 7 },
  { city: 'Yogyakarta', country: 'Indonesia', lat: -7.7956, lng: 110.3695, timezone: 7 },
  { city: 'Palembang', country: 'Indonesia', lat: -2.9909, lng: 104.7565, timezone: 7 },
  { city: 'Banjarmasin', country: 'Indonesia', lat: -3.3194, lng: 114.5908, timezone: 8 },
  { city: 'Denpasar', country: 'Indonesia', lat: -8.6705, lng: 115.2126, timezone: 8 },
  { city: 'Banda Aceh', country: 'Indonesia', lat: 5.5483, lng: 95.3238, timezone: 7 },
  { city: 'Makkah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262, timezone: 3 },
  { city: 'Madinah', country: 'Saudi Arabia', lat: 24.5247, lng: 39.5692, timezone: 3 },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869, timezone: 8 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 8 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezone: 9 },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 0 },
];

/**
 * Standard Astronomical Prayer Calculation
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude: number = -6.2088,
  longitude: number = 106.8456,
  method: 'kemenag' | 'mwl' | 'makkah' | 'egypt' | 'isna' = 'kemenag'
): PrayerTimesMap {
  const d = new Date(date);
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Solar declination & Equation of time
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const declination = 23.45 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81)); // degrees

  const degToRad = (deg: number) => (deg * Math.PI) / 180;
  const radToDeg = (rad: number) => (rad * 180) / Math.PI;

  const latRad = degToRad(latitude);
  const decRad = degToRad(declination);

  // Timezone calculation (local timezone offset in hours)
  const timezoneOffset = -d.getTimezoneOffset() / 60;

  // Solar noon in hours
  const solarNoon = 12 + timezoneOffset - longitude / 15 - eot / 60;

  // Fajr and Isha angles based on method
  let fajrAngle = 20; // Kemenag
  let ishaAngle = 18; // Kemenag

  if (method === 'mwl') {
    fajrAngle = 18;
    ishaAngle = 17;
  } else if (method === 'makkah') {
    fajrAngle = 18.5;
    ishaAngle = 19;
  } else if (method === 'egypt') {
    fajrAngle = 19.5;
    ishaAngle = 17.5;
  } else if (method === 'isna') {
    fajrAngle = 15;
    ishaAngle = 15;
  }

  // Hour angles
  const getHourAngle = (angle: number) => {
    const cosHA =
      (-Math.sin(degToRad(angle)) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1 || cosHA < -1) return 0;
    return radToDeg(Math.acos(cosHA)) / 15;
  };

  const sunriseHA = getHourAngle(0.833);
  const fajrHA = getHourAngle(fajrAngle);
  const ishaHA = getHourAngle(ishaAngle);

  // Asr shadow angle (Shafi'i/Hanbali/Maliki: shadow = object length + noon shadow)
  const noonAltitude = 90 - latitude + declination;
  const asrAltitude = radToDeg(Math.atan(1 + Math.tan(degToRad(Math.abs(latitude - declination)))));
  const asrHA =
    radToDeg(
      Math.acos(
        (Math.sin(degToRad(90 - asrAltitude)) - Math.sin(latRad) * Math.sin(decRad)) /
          (Math.cos(latRad) * Math.cos(decRad))
      )
    ) / 15;

  const fajrTime = solarNoon - fajrHA;
  const sunriseTime = solarNoon - sunriseHA;
  const dhuhaTime = sunriseTime + 20 / 60; // 20 min after sunrise
  const dhuhrTime = solarNoon + 2 / 60; // 2 min ihtiyat (safe buffer)
  const asrTime = solarNoon + asrHA;
  const maghribTime = solarNoon + sunriseHA + 2 / 60;
  const ishaTime = solarNoon + ishaHA;
  const imsakTime = fajrTime - 10 / 60; // 10 min before Subuh

  const formatHours = (val: number) => {
    let hours = Math.floor(val);
    let minutes = Math.floor((val - hours) * 60);
    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }
    if (hours >= 24) hours -= 24;
    if (hours < 0) hours += 24;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return {
    Imsak: formatHours(imsakTime),
    Subuh: formatHours(fajrTime),
    Syuruq: formatHours(sunriseTime),
    Dhuha: formatHours(dhuhaTime),
    Dzuhur: formatHours(dhuhrTime),
    Ashar: formatHours(asrTime),
    Maghrib: formatHours(maghribTime),
    Isya: formatHours(ishaTime),
  };
}

/**
 * Calculates next prayer and countdown details
 */
export function getNextPrayerInfo(times: PrayerTimesMap, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayerOrder: PrayerTimeName[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

  const prayerMinutes = prayerOrder.map((name) => {
    const [h, m] = times[name].split(':').map(Number);
    return { name, timeString: times[name], minutes: h * 60 + m };
  });

  // Find the next upcoming prayer
  let next = prayerMinutes.find((p) => p.minutes > currentMinutes);
  let isNextTomorrow = false;

  if (!next) {
    // If passed Isya, next is tomorrow's Subuh
    next = prayerMinutes[0];
    isNextTomorrow = true;
  }

  let diffMinutes = 0;
  if (isNextTomorrow) {
    diffMinutes = 24 * 60 - currentMinutes + next.minutes;
  } else {
    diffMinutes = next.minutes - currentMinutes;
  }

  const remainingSeconds = Math.max(0, Math.floor(diffMinutes * 60));
  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;

  const remainingFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Calculate percentage of progress in current prayer period
  const progressPercent = Math.min(100, Math.max(0, Math.round(((360 - Math.min(diffMinutes, 360)) / 360) * 100)));

  return {
    name: next.name,
    timeString: next.timeString,
    remainingSeconds,
    remainingFormatted,
    isPassed: false,
    progressPercent,
  };
}

// High-precision coordinates of Ka'bah in Masjidil Haram, Makkah Al-Mukarramah
export const MAKKAH_COORDINATES = {
  lat: 21.422487,
  lng: 39.826206,
  name: "Ka'bah, Masjidil Haram, Makkah Al-Mukarramah",
};

/**
 * Qibla direction calculation (Great-Circle Initial Bearing from user lat/lng to Ka'bah)
 * Formula:
 *   Δλ = λ2 - λ1
 *   y = sin(Δλ) * cos(φ2)
 *   x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
 *   θ = atan2(y, x)
 *   bearing = (θ * 180 / π + 360) % 360
 */
export function calculateQiblaAngle(latitude: number, longitude: number): number {
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    return 295.2; // Safe fallback for Jakarta if invalid
  }

  const degToRad = (d: number) => (d * Math.PI) / 180;
  const radToDeg = (r: number) => (r * 180) / Math.PI;

  const phi1 = degToRad(latitude);
  const phi2 = degToRad(MAKKAH_COORDINATES.lat);
  const deltaLambda = degToRad(MAKKAH_COORDINATES.lng - longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let qibla = radToDeg(Math.atan2(y, x));
  return (qibla + 360) % 360;
}

/**
 * Calculates geodesic distance (km) to Ka'bah using the Haversine formula
 */
export function calculateDistanceToMakkah(latitude: number, longitude: number): number {
  const R = 6371; // Earth's mean radius in km
  const degToRad = (d: number) => (d * Math.PI) / 180;

  const phi1 = degToRad(latitude);
  const phi2 = degToRad(MAKKAH_COORDINATES.lat);
  const deltaPhi = degToRad(MAKKAH_COORDINATES.lat - latitude);
  const deltaLambda = degToRad(MAKKAH_COORDINATES.lng - longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Maps bearing angle to Indonesian cardinal direction text
 */
export function getCardinalDirection(angle: number): string {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized >= 348.75 || normalized < 11.25) return 'Utara (N)';
  if (normalized >= 11.25 && normalized < 33.75) return 'Utara Timur Laut (NNE)';
  if (normalized >= 33.75 && normalized < 56.25) return 'Timur Laut (NE)';
  if (normalized >= 56.25 && normalized < 78.75) return 'Timur Timur Laut (ENE)';
  if (normalized >= 78.75 && normalized < 101.25) return 'Timur (E)';
  if (normalized >= 101.25 && normalized < 123.75) return 'Timur Tenggara (ESE)';
  if (normalized >= 123.75 && normalized < 146.25) return 'Tenggara (SE)';
  if (normalized >= 146.25 && normalized < 168.75) return 'Selatan Tenggara (SSE)';
  if (normalized >= 168.75 && normalized < 191.25) return 'Selatan (S)';
  if (normalized >= 191.25 && normalized < 213.75) return 'Selatan Barat Daya (SSW)';
  if (normalized >= 213.75 && normalized < 236.25) return 'Barat Daya (SW)';
  if (normalized >= 236.25 && normalized < 258.75) return 'Barat Barat Daya (WSW)';
  if (normalized >= 258.75 && normalized < 281.25) return 'Barat (W)';
  if (normalized >= 281.25 && normalized < 303.75) return 'Barat Barat Laut (WNW)';
  if (normalized >= 303.75 && normalized < 326.25) return 'Barat Laut (NW)';
  if (normalized >= 326.25 && normalized < 348.75) return 'Utara Barat Laut (NNW)';
  return 'Barat Laut (NW)';
}

