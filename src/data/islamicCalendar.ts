import { IslamicEvent } from '../types';

export const HIJRI_MONTHS = [
  { id: 1, name: 'Muharram', arabic: 'مُحَرَّم' },
  { id: 2, name: 'Safar', arabic: 'صَفَر' },
  { id: 3, name: 'Rabi\'ul Awwal', arabic: 'رَبِيع الأَوَّل' },
  { id: 4, name: 'Rabi\'ul Akhir', arabic: 'رَبِيع الآخِر' },
  { id: 5, name: 'Jumadil Ula', arabic: 'جُمَادَى الأُولَى' },
  { id: 6, name: 'Jumadil Akhirah', arabic: 'جُمَادَى الآخِرَة' },
  { id: 7, name: 'Rajab', arabic: 'رَجَب' },
  { id: 8, name: 'Sya\'ban', arabic: 'شَعْبَان' },
  { id: 9, name: 'Ramadhan', arabic: 'رَمَضَان' },
  { id: 10, name: 'Syawwal', arabic: 'شَوَّال' },
  { id: 11, name: 'Dzulqa\'dah', arabic: 'ذُو القَعْدَة' },
  { id: 12, name: 'Dzulhijjah', arabic: 'ذُو الحِجَّة' },
];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { dateHijri: '01-01', title: 'Tahun Baru Islam (1 Muharram)', description: 'Awal tahun baru kalender Hijriyah, momentum hijrah dan muhasabah diri.', isHoliday: true },
  { dateHijri: '01-09', title: 'Puasa Tasu\'a (9 Muharram)', description: 'Puasa sunnah pengiring sebelum puasa Asyura.', recommendedFasting: true },
  { dateHijri: '01-10', title: 'Puasa \'Asyura (10 Muharram)', description: 'Puasa sunnah utama yang menghapuskan dosa setahun yang lalu.', recommendedFasting: true },
  { dateHijri: '03-12', title: 'Maulid Nabi Muhammad SAW (12 Rabi\'ul Awwal)', description: 'Peringatan kelahiran baginda Rasulullah SAW.', isHoliday: true },
  { dateHijri: '07-27', title: 'Isra Mi\'raj Nabi Muhammad SAW (27 Rajab)', description: 'Peristiwa perjalanan malam dan perintah sholat 5 waktu.', isHoliday: true },
  { dateHijri: '08-15', title: 'Malam Nisfu Sya\'ban (15 Sya\'ban)', description: 'Malam penuh ampunan dan pelaporan catatan amal tahunan.', recommendedFasting: true },
  { dateHijri: '09-01', title: 'Awal Puasa Ramadhan (1 Ramadhan)', description: 'Hari pertama ibadah puasa wajib bulan suci Ramadhan.', isHoliday: true, recommendedFasting: true },
  { dateHijri: '09-17', title: 'Nuzulul Qur\'an (17 Ramadhan)', description: 'Peringatan turunnya ayat pertama Al-Qur\'an di Gua Hira.', isHoliday: true },
  { dateHijri: '09-21', title: 'Malam 10 Terakhir Ramadhan / Lailatul Qadr', description: 'Malam kemuliaan yang lebih baik dari seribu bulan.' },
  { dateHijri: '10-01', title: 'Hari Raya Idul Fitri (1 Syawwal)', description: 'Hari kemenangan dan kembali kepada kesucian.', isHoliday: true },
  { dateHijri: '10-02', title: 'Hari Raya Idul Fitri Hari Ke-2', description: 'Hari raya kedua Idul Fitri.', isHoliday: true },
  { dateHijri: '12-09', title: 'Hari Arafah & Puasa Arafah (9 Dzulhijjah)', description: 'Puncak ibadah haji dan puasa sunnah penghapus dosa 2 tahun.', recommendedFasting: true },
  { dateHijri: '12-10', title: 'Hari Raya Idul Adha (10 Dzulhijjah)', description: 'Hari raya qurban dan keteladanan Nabi Ibrahim AS.', isHoliday: true },
  { dateHijri: '12-11', title: 'Hari Tasyrik Ke-1 (11 Dzulhijjah)', description: 'Hari tasyrik, dilarang berpuasa, disunnahkan berdzikir.' },
  { dateHijri: '12-12', title: 'Hari Tasyrik Ke-2 (12 Dzulhijjah)', description: 'Hari tasyrik hari kedua.' },
  { dateHijri: '12-13', title: 'Hari Tasyrik Ke-3 (13 Dzulhijjah)', description: 'Hari tasyrik hari ketiga.' },
];

export interface HijriDateInfo {
  day: number;
  month: number;
  monthName: string;
  monthArabic: string;
  year: number;
  formatted: string;
  isAyyamulBidh: boolean;
  event?: IslamicEvent;
}

/**
 * Converts a Gregorian Date object into an approximate Hijri Date (Kuwaiti / Umm al-Qura algorithm)
 */
export function getHijriDate(date: Date = new Date()): HijriDateInfo {
  const day = date.getDate();
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();

  // Julian Day Number algorithm
  let m = month + 1;
  let y = year;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Conversion from JD to Hijri
  const epoch = 1948439.5;
  const l = Math.floor(jd - epoch) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lPrime = l - 10631 * n + 354;
  const j = (Math.floor((10985 - lPrime) / 5316)) * (Math.floor((50 * lPrime) / 17719)) + (Math.floor(lPrime / 5670)) * (Math.floor((43 * lPrime) / 15238));
  const lDoublePrime = lPrime - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  const hijriMonth = Math.floor((24 * lDoublePrime) / 709);
  const hijriDay = lDoublePrime - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const validMonth = Math.max(1, Math.min(12, hijriMonth));
  const validDay = Math.max(1, Math.min(30, hijriDay));
  const monthObj = HIJRI_MONTHS[validMonth - 1] || HIJRI_MONTHS[0];

  const monthKey = String(validMonth).padStart(2, '0');
  const dayKey = String(validDay).padStart(2, '0');
  const event = ISLAMIC_EVENTS.find((e) => e.dateHijri === `${monthKey}-${dayKey}`);

  const isAyyamulBidh = validDay === 13 || validDay === 14 || validDay === 15;

  return {
    day: validDay,
    month: validMonth,
    monthName: monthObj.name,
    monthArabic: monthObj.arabic,
    year: hijriYear,
    formatted: `${validDay} ${monthObj.name} ${hijriYear} H`,
    isAyyamulBidh,
    event,
  };
}

export function isMondayOrThursday(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 1 || day === 4; // Monday (1) or Thursday (4)
}
