import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Flame,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  ShieldAlert,
  Calendar as CalendarIcon,
  ArrowUpRight,
  Play,
  RotateCcw,
  MapPin,
  Heart,
  Quote,
  Copy,
  Check,
  Award,
  ListTodo,
  BookMarked,
  Volume2,
} from 'lucide-react';
import { useApp, getTodayString } from '../context/AppContext';
import { PrayerTimeName, PrayerStatus, HabitItem, DayRecord } from '../types';
import { getHijriDate } from '../data/islamicCalendar';
import {
  formatHabitValue,
  formatHabitProgressText,
  formatTilawahUnit,
  getTilawahRecord,
  getHabitStatusData,
} from '../utils/habitFormatter';

export interface IslamicQuoteItem {
  arabic: string;
  latin?: string;
  translation: string;
  source: string;
  reminder: string;
}

const ISLAMIC_MOTIVATION_QUOTES: IslamicQuoteItem[] = [
  {
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    latin: 'Ahabul a\'mali ilallahi adwamuha wa in qalla.',
    translation: 'Amalan yang paling dicintai oleh Allah adalah amalan yang kontinu (istiqomah) walaupun sedikit.',
    source: 'HR. Bukhari & Muslim',
    reminder: 'Jaga konsistensi ibadah harianmu; sedikit demi sedikit yang terus dirawat lebih dicintai Allah dibanding banyak namun terputus.',
  },
  {
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    latin: 'Fadzkuruni adzkurkum wasykuru li wa la takfurun.',
    translation: 'Maka ingatlah kepada-Ku, niscaya Aku ingat (pula) kepadamu, dan bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat-Ku).',
    source: 'QS. Al-Baqarah: 152',
    reminder: 'Luangkan waktu sejenak untuk berdzikir; mengingat Allah senantiasa membuka ketenangan jiwa dan kemudahan urusan.',
  },
  {
    arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    latin: 'Alladzina amanu wa tathma\'innu qulubuhum bidzikrillahi ala bidzikrillahi tathma\'innul qulub.',
    translation: '(Yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
    source: 'QS. Ar-Ra\'d: 28',
    reminder: 'Bila hati terasa lelah atau gundah, hamparkan tasbih dan tenangkan batin dengan berdzikir kepada-Nya.',
  },
  {
    arabic: 'الصَّلَاةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ وَالصَّبْرُ ضِيَاءٌ',
    latin: 'Ash-shalatu nurun wash-shadaqatu burhanun wash-shabru dhiya\'.',
    translation: 'Sholat adalah cahaya, sedekah adalah bukti (keimanan), dan sabar adalah pelita yang menerangi.',
    source: 'HR. Muslim',
    reminder: 'Dirikan sholat tepat waktu sebagai lentera penuntun dan penjaga keberkahan harimu.',
  },
  {
    arabic: 'فَاسْتَقِمْ كَمَا أُمِرْتَ وَمَنْ تَابَ مَعَكَ',
    latin: 'Fastaqim kama umirta wa man taba ma\'ak.',
    translation: 'Maka tetaplah engkau (di jalan yang benar), sebagaimana telah diperintahkan kepadamu dan (juga) orang yang bertaubat bersamamu.',
    source: 'QS. Hud: 112',
    reminder: 'Istiqomah adalah karomah tertinggi; kuatkan niat dan mantapkan langkah menuju ridho-Nya di setiap waktu.',
  },
  {
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    latin: 'Ya muqallibal qulub, tsabbit qalbi \'ala dinik.',
    translation: 'Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.',
    source: 'HR. At-Tirmidzi & Ahmad',
    reminder: 'Panjatkan doa ketetapan hati agar senantiasa bersemangat, ikhlas, dan teguh dalam beramal shalih.',
  },
  {
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    latin: 'Fa inna ma\'al \'usri yusra, inna ma\'al \'usri yusra.',
    translation: 'Maka sesungguhnya bersama kesulitan ada kemudahan, sesungguhnya bersama kesulitan ada kemudahan.',
    source: 'QS. Al-Insyirah: 5-6',
    reminder: 'Tetaplah bersabar dan berprasangka baik; setiap ujian ketaatan selalu diiringi jalan kelapangan dari Allah.',
  },
  {
    arabic: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ',
    latin: 'Innas-shalata tanha \'anil-fahsya\'i wal-munkar.',
    translation: 'Sesungguhnya sholat itu mencegah dari (perbuatan) keji dan mungkar.',
    source: 'QS. Al-\'Ankabut: 45',
    reminder: 'Sholat yang khusyuk menjadi benteng perisai utama yang menjaga kesucian hati dari dosa dan kelalaian.',
  },
  {
    arabic: 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ',
    latin: 'Al-mahiru bil qur\'ani ma\'as-safarotil kiramil bararah.',
    translation: 'Orang yang mahir membaca Al-Qur\'an kelak bersama para malaikat yang mulia lagi taat.',
    source: 'HR. Bukhari & Muslim',
    reminder: 'Sempatkan membaca walau beberapa ayat atau halaman hari ini; Al-Qur\'an akan menjadi syafaat penolong di yaumul hisab.',
  },
  {
    arabic: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
    latin: 'Wa qala rabbukumud\'uni astajib lakum.',
    translation: 'Dan Tuhanmu berfirman, "Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu."',
    source: 'QS. Ghafir: 60',
    reminder: 'Jangan ragu memohon; sampaikan setiap hajat, harapan, dan keluh kesah hanya kepada Allah di setiap sujud.',
  },
  {
    arabic: 'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    latin: 'Kalimatani khafifatani \'alal-lisan, tsaqilatani fil-mizan, habibatani ilar-Rahman: Subhanallahi wa bihamdih, Subhanallahil \'Adzim.',
    translation: 'Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Ar-Rahman: Subhanallah wa bihamdihi, Subhanallahil \'Adzim.',
    source: 'HR. Bukhari & Muslim',
    reminder: 'Basahi lisan dengan tasbih di sela-sela aktivitas harian untuk memperberat timbangan amal kebaikan.',
  },
  {
    arabic: 'صَلَاةُ الْجَمَاعَةِ تَفْضُلُ صَلَاةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً',
    latin: 'Shalatul jama\'ati tafdhulu shalatal fadz-dzi bisab\'in wa \'isyrina darajah.',
    translation: 'Sholat berjamaah lebih utama dua puluh tujuh derajat dibanding sholat sendirian.',
    source: 'HR. Bukhari & Muslim',
    reminder: 'Raih keutamaan 27 derajat pahala dengan melangkahkan kaki dan menunaikan sholat berjamaah tepat waktu.',
  },
  {
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    latin: 'Ma naqashat shadaqatun min mal.',
    translation: 'Sedekah tidak akan mengurangi harta sedikit pun.',
    source: 'HR. Muslim',
    reminder: 'Awali hari dengan sedekah subuh atau infaq harian; sedekah mengundang keberkahan dan menolak bala.',
  },
  {
    arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
    latin: 'Wasta\'inu bish-shabri wash-shalah, wa innaha lakabiratun illa \'alal-khasyi\'in.',
    translation: 'Dan mohonlah pertolongan (kepada Allah) dengan sabar dan sholat. Dan sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyuk.',
    source: 'QS. Al-Baqarah: 45',
    reminder: 'Jadikan kesabaran dan sholat sebagai sandaran utama penyejuk hati di tengah ragam kesibukan duniawi.',
  },
  {
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    latin: 'Man qara\'a harfan min kitabillahi falahu bihi hasanah, wal-hasanatu bi\'asyri amtsaliha.',
    translation: 'Barangsiapa membaca satu huruf dari Kitabullah, baginya satu kebaikan dan satu kebaikan dilipatgandakan sepuluh kali.',
    source: 'HR. At-Tirmidzi',
    reminder: 'Jadikan tilawah Al-Qur\'an sahabat setia harimu; setiap huruf yang dibaca mengalirkan limpahan pahala berlipat ganda.',
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    latin: 'Man salaka thariqan yaltamisu fihi \'ilman sahhallallahu lahu bihi thariqan ilal jannah.',
    translation: 'Barangsiapa menempuh suatu jalan untuk mencari ilmu, maka Allah memudahkan baginya jalan menuju surga.',
    source: 'HR. Muslim',
    reminder: 'Tingkatkan pemahaman ilmu agama agar kualitas ibadah dan kekhusyukan kita senantiasa bertumbuh.',
  },
  {
    arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنْتُمُ الْأَعْلَوْنَ إِنْ كُنْتُمْ مُؤْمِنِينَ',
    latin: 'Wa la tahinu wa la tahzanu wa antumul a\'lawna in kuntum mu\'minin.',
    translation: 'Janganlah kamu (merasa) lemah dan janganlah bersedih hati, sebab kamu paling tinggi (derajatnya), jika kamu orang-orang yang beriman.',
    source: 'QS. Ali \'Imran: 139',
    reminder: 'Teguhkan iman dan optimisme; pertolongan serta rahmat Allah senantiasa menyertai hamba-Nya yang berserah diri.',
  },
  {
    arabic: 'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ رَبَّهُ مَثَلُ الْحَيِّ وَالْمَيِّتِ',
    latin: 'Matsalulladzi yadzkuru rabbahu walladzi la yadzkuru rabbahu matsalul hayyi wal mayyit.',
    translation: 'Perumpamaan orang yang mengingat Tuhannya dengan orang yang tidak mengingat Tuhannya seperti orang yang hidup dengan orang yang mati.',
    source: 'HR. Muslim',
    reminder: 'Hidupkan jiwa dan batin dengan senantiasa mendawamkan dzikir serta bersholawat di setiap kesempatan.',
  },
  {
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنْفُسِهِمْ لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ',
    latin: 'Qul ya \'ibadiyal-ladzina asrafu \'ala anfusihim la taqnathu min rahmatillah.',
    translation: 'Katakanlah: "Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri, janganlah kamu berputus asa dari rahmat Allah."',
    source: 'QS. Az-Zumar: 53',
    reminder: 'Pintu taubat dan ampunan senantiasa terbuka luas; jangan menunda untuk memperbaiki diri dan mendekat kepada-Nya.',
  },
  {
    arabic: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ',
    latin: '\'Ajaban li amril mu\'mini inna amrahu kullahu khair.',
    translation: 'Sungguh menakjubkan urusan seorang mukmin, seluruh urusannya adalah baik baginya.',
    source: 'HR. Muslim',
    reminder: 'Bila lapang ia bersyukur, bila diuji ia bersabar; keduanya mengalirkan ganjaran pahala yang tak terputus.',
  },
];

export const HomeView: React.FC = () => {
  const {
    settings,
    prayerTimes,
    nextPrayer,
    todayRecord,
    habits,
    setPrayerStatus,
    updateHabitStatus,
    setHalanganModalPrayer,
    lastReadQuran,
    dzikirList,
    activeDzikirId,
    setActiveDzikirId,
    incrementDzikir,
    resetDzikir,
    currentStreak,
    longestStreak,
    totalPrayersCompleted,
    totalQuranPagesRead,
    notes,
    setActiveTab,
    setActiveQuranSurah,
  } = useApp();

  const [copiedQuote, setCopiedQuote] = useState(false);

  // Hijri Date info
  const hijriInfo = useMemo(() => getHijriDate(new Date()), []);

  // Dynamic Islamic Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      return { salam: 'Shobahul Khair', label: 'Selamat Pagi' };
    }
    if (hour >= 11 && hour < 15) {
      return { salam: 'Naharukum Sa\'id', label: 'Selamat Siang' };
    }
    if (hour >= 15 && hour < 18) {
      return { salam: 'Masa\'ul Khair', label: 'Selamat Sore' };
    }
    return { salam: 'Lailatukum Sa\'idah', label: 'Selamat Malam' };
  }, []);

  // Islamic Motivation Quotes rotating automatically with time and intervals
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const d = new Date();
    const seed = d.getFullYear() * 365 + d.getMonth() * 31 + d.getDate() * 17 + d.getHours() * 7 + Math.floor(d.getMinutes() / 15);
    return Math.abs(seed) % ISLAMIC_MOTIVATION_QUOTES.length;
  });

  // Automatically rotate quotes periodically every 45s without affecting any user activity or data
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ISLAMIC_MOTIVATION_QUOTES.length);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = useMemo(() => {
    return ISLAMIC_MOTIVATION_QUOTES[quoteIndex % ISLAMIC_MOTIVATION_QUOTES.length];
  }, [quoteIndex]);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ISLAMIC_MOTIVATION_QUOTES.length);
  };

  const handleCopyQuote = () => {
    const text = `"${currentQuote.arabic}"\n\nArtinya: ${currentQuote.translation}\n\nPengingat Istiqomah: ${currentQuote.reminder}\n(${currentQuote.source}) - MuslimLife`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const PRAYER_CARDS: { name: PrayerTimeName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { name: 'Subuh', label: 'Subuh', icon: Sunrise },
    { name: 'Dzuhur', label: 'Dzuhur', icon: Sun },
    { name: 'Ashar', label: 'Ashar', icon: CloudSun },
    { name: 'Maghrib', label: 'Maghrib', icon: Sunset },
    { name: 'Isya', label: 'Isya', icon: Moon },
  ];

  // Active or selected Dzikir - strictly using today's actual stored count
  const currentDzikir = useMemo(() => {
    const item = dzikirList.find((d) => d.id === activeDzikirId) || dzikirList[0];
    if (!item) {
      return {
        id: 'dz-1',
        title: 'Istighfar',
        textArabic: 'أَسْتَغْفِرُ اللَّهَ',
        textLatin: 'Astaghfirullah',
        meaning: 'Aku memohon ampun kepada Allah',
        targetCount: 33,
        currentCount: 0,
        category: 'harian' as const,
      };
    }
    const todayCount =
      todayRecord?.dzikirCounts && typeof todayRecord.dzikirCounts[item.id] === 'number'
        ? todayRecord.dzikirCounts[item.id]
        : 0;
    return {
      ...item,
      currentCount: todayCount,
    };
  }, [dzikirList, activeDzikirId, todayRecord]);

  // Calculate habit statistics for today (only active habits)
  const habitStats = useMemo(() => {
    const activeHabits = habits.filter((h) => h.isActive !== false);
    const total = activeHabits.length;
    let completed = 0;
    let halangan = 0;
    let pending = 0;

    activeHabits.forEach((h) => {
      const statusData = getHabitStatusData(h, todayRecord);
      if (statusData.isCompleted) completed++;
      else if (statusData.isHalangan) halangan++;
      else pending++;
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, halangan, pending, percentage };
  }, [habits, todayRecord]);

  // Calculate 5 Prayers breakdown for today
  const prayerStats = useMemo(() => {
    const fivePrayers: PrayerTimeName[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
    let completed = 0;
    let halangan = 0;
    let jamaahCount = 0;

    fivePrayers.forEach((p) => {
      const rec = todayRecord.prayers[p];
      if (rec?.status === 'completed') {
        completed++;
        if (rec.isJamaah) jamaahCount++;
      } else if (rec?.status === 'halangan') {
        halangan++;
      }
    });

    return { completed, halangan, jamaahCount, total: 5 };
  }, [todayRecord.prayers]);

  // Tilawah unit and habit
  const quranHabit = habits.find((h) => h.id === 'h-quran' || h.category === 'quran' || h.syncSource === 'quran');
  const tilawahUnit = formatTilawahUnit(quranHabit?.unit || 'halaman');
  const isJuzUnit = tilawahUnit.toLowerCase() === 'juz';
  const khatamDaysTarget = settings.khatamTargetDays || 30;
  const juzCompletedEstimate = isJuzUnit
    ? Math.min(30, totalQuranPagesRead)
    : Math.min(30, Math.max(0, Math.floor((totalQuranPagesRead / 604) * 30)));
  const khatamProgressPercent = isJuzUnit
    ? Math.min(100, Math.round((totalQuranPagesRead / 30) * 100))
    : Math.min(100, Math.round((totalQuranPagesRead / 604) * 100));

  return (
    <div className="space-y-6 pb-12 select-none" id="home-view">
      {/* 1. Header & Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {greeting.salam}
            </span>
            <span className="text-xs text-slate-400 font-medium">Assalamu'alaikum</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {settings.userName ? settings.userName : 'Hamba Allah'}
          </h1>
          <p className="text-xs text-slate-500">
            {greeting.label}, semoga hari ini dipenuhi keberkahan dan keistiqomahan ibadah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Hijri Date Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80">
            <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {hijriInfo.formatted}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-800 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[130px]">{settings.city}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Next Prayer & Countdown Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-lg shadow-emerald-900/10">
        {/* Background Islamic Geometric Pattern Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Moon className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Waktu Sholat Berikutnya</span>
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {nextPrayer.name}
                </h2>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-200">
                  {nextPrayer.timeString}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed">
                Menuju waktu {nextPrayer.name} untuk wilayah {settings.city} dan sekitarnya. Persiapkan wudhu dan kesucian lahir batin.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('sholat')}
                id="home-open-prayer-schedule-btn"
                className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                Lihat Jadwal Lengkap
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {hijriInfo.isAyyamulBidh && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-300/30 text-amber-200 text-xs font-semibold">
                  Hari Puasa Ayyamul Bidh
                </span>
              )}
            </div>
          </div>

          {/* Real-time Countdown Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col items-center justify-center shrink-0 min-w-[210px] text-center shadow-inner">
            <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
              Hitung Mundur Sholat
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight my-1 text-white drop-shadow-xs">
              {nextPrayer.remainingFormatted}
            </span>
            <span className="text-[11px] text-emerald-200/80 mb-2">Tersisa sebelum adzan</span>

            <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-300 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(5, Math.min(100, nextPrayer.progressPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Jadwal 5 Waktu Sholat Ringkas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Sholat 5 Waktu Hari Ini</h3>
            <p className="text-xs text-slate-500">
              {prayerStats.completed}/5 Selesai • {prayerStats.jamaahCount} Berjamaah • {prayerStats.halangan} Udzur
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('sholat')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Pengaturan Adzan & Notifikasi <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRAYER_CARDS.map((p) => {
            const Icon = p.icon;
            const timeStr = prayerTimes[p.name] || '--:--';
            const record = todayRecord.prayers[p.name] || { status: 'pending' };
            const isCompleted = record.status === 'completed';
            const isHalangan = record.status === 'halangan';

            return (
              <div
                key={p.name}
                id={`home-prayer-card-${p.name.toLowerCase()}`}
                className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 shadow-xs'
                    : isHalangan
                    ? 'border-rose-200 bg-rose-50/50 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isHalangan
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100/70 px-2 py-0.5 rounded-md">
                      {timeStr}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{p.label}</h4>
                  
                  <div className="mt-1 min-h-[18px]">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {record.isJamaah ? 'Berjamaah' : 'Munfarid'}
                      </span>
                    ) : isHalangan ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 truncate max-w-full">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        {record.halanganReason ? `Udzur: ${record.halanganReason}` : 'Ada Udzur'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Belum Ditandai</span>
                    )}
                  </div>
                </div>

                {/* Card Quick Action Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPrayerStatus(p.name, isCompleted ? 'pending' : 'completed', {
                        isJamaah: !isCompleted,
                      })
                    }
                    id={`toggle-prayer-${p.name.toLowerCase()}`}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isCompleted ? 'Selesai' : 'Selesai'}
                  </button>

                  <button
                    type="button"
                    title="Catat Udzur / Halangan"
                    onClick={() => setHalanganModalPrayer(p.name)}
                    id={`halangan-btn-${p.name.toLowerCase()}`}
                    className={`p-1.5 rounded-xl text-xs transition-all ${
                      isHalangan
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-700'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bento Grid: Habit Progress & Quran & Dzikir */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Habits & Quran) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Daily Habit Progress Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Habit Ibadah Hari Ini</h4>
                  <p className="text-xs text-slate-500">Target mutaba'ah & amalan harian</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('habit')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Kelola Habit <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Progress + Stats */}
            <div className="py-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-600 transition-all duration-700"
                    strokeDasharray={`${habitStats.percentage}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-extrabold text-slate-800 font-mono">
                    {habitStats.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Tuntas</span>
                </div>
              </div>

              <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Capaian Ibadah</span>
                  <span className="font-bold text-slate-800">
                    {habitStats.completed} dari {habitStats.total} Amalan
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${habitStats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {habitStats.percentage === 100
                    ? '🎉 Alhamdulillah, semua target habit hari ini telah tuntas!'
                    : habitStats.percentage >= 60
                    ? '✨ Hampir tuntas, pertahankan semangat ibadahmu.'
                    : 'Ayo mulai amalan kebaikan untuk mengisi hari ini.'}
                </p>
              </div>
            </div>

            {/* Quick Habit Items List */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              {habits.filter((h) => h.isActive !== false).slice(0, 4).map((h) => {
                const {
                  isCompleted: isDone,
                  isHalangan,
                  halanganReasonText,
                  actualVal,
                  targetVal,
                  unitVal,
                } = getHabitStatusData(h, todayRecord);

                return (
                  <div
                    key={h.id}
                    id={`home-habit-item-${h.id}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/50 shadow-xs'
                        : isHalangan
                        ? 'border-rose-200 bg-rose-50/50 shadow-xs'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isHalangan) {
                            updateHabitStatus(h.id, 'pending', 0);
                          } else {
                            updateHabitStatus(h.id, isDone ? 'pending' : 'completed', isDone ? 0 : targetVal);
                          }
                        }}
                        id={`home-habit-check-${h.id}`}
                        title={isDone ? 'Tandai belum selesai' : isHalangan ? 'Hapus status udzur' : 'Tandai selesai'}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isHalangan
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'border-2 border-slate-300 hover:border-emerald-600'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        {isHalangan && <ShieldAlert className="w-3 h-3" />}
                      </button>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`font-semibold truncate block ${
                              isDone
                                ? 'text-slate-800'
                                : isHalangan
                                ? 'text-rose-900'
                                : 'text-slate-700'
                            }`}
                          >
                            {h.title}
                          </span>
                          {isDone && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                              Tuntas
                            </span>
                          )}
                          {isHalangan && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 shrink-0 inline-flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                              Udzur ({halanganReasonText})
                            </span>
                          )}
                        </div>
                        {actualVal > 0 && !isHalangan && (
                          <span className="text-[10px] text-emerald-700 font-medium block">
                            Hasil: {formatHabitValue(actualVal, unitVal)}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono shrink-0 font-bold ${
                        isDone
                          ? 'text-emerald-700'
                          : isHalangan
                          ? 'text-rose-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatHabitValue(targetVal, unitVal)}
                    </span>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  Belum ada habit ibadah aktif.{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('habit')}
                    className="text-emerald-700 font-semibold underline"
                  >
                    Tambah sekarang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quran Terakhir Dibaca & Progress Khatam Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Al-Qur'an & Target Khatam</h4>
                  <p className="text-xs text-slate-500">Lanjutkan tilawah harianmu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveQuranSurah(lastReadQuran.surahNumber);
                  setActiveTab('quran');
                }}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                Buka Mushaf <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Last Read Highlight */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-100/80 px-2 py-0.5 rounded-md">
                  {lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0 ? 'Terakhir Dibaca' : 'Tilawah Al-Qur\'an'}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1.5">
                  {lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0
                    ? `Surah ${lastReadQuran.surahName}`
                    : "Mulai Tilawah Al-Qur'an"}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0
                    ? `Surah ke-${lastReadQuran.surahNumber} • Ayat ke-${lastReadQuran.ayahNumber} • Juz ${lastReadQuran.juzNumber}`
                    : "Tandai ayat terakhir dibaca untuk melanjutkan tilawah"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveQuranSurah(lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0 ? lastReadQuran.surahNumber : 1);
                  setActiveTab('quran');
                }}
                id="home-continue-quran-btn"
                className="w-11 h-11 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-700/20 transition-transform active:scale-95 shrink-0"
                title={lastReadQuran?.isSetByUser && lastReadQuran.surahNumber > 0 ? "Lanjutkan Tilawah" : "Mulai Tilawah"}
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </button>
            </div>

            {/* Khatam Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Progres Khatam 30 Juz</span>
                <span className="font-bold text-teal-800">
                  {isJuzUnit
                    ? `${totalQuranPagesRead} / 30 Juz`
                    : `${juzCompletedEstimate} / 30 Juz (${totalQuranPagesRead} ${tilawahUnit})`}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${khatamProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Target {khatamDaysTarget} Hari</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('quran')}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Lihat Daftar 114 Surah
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Dzikir, Streak & Islamic Agenda) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Dzikir & Tasbih Digital Quick Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Dzikir & Tasbih</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[170px]">{currentDzikir.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dzikir')}
                className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1"
              >
                Tasbih Penuh <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Dzikir Counter Preview */}
            <div className="my-4 text-center p-4 rounded-2xl bg-amber-50/50 border border-amber-100/80">
              <span className="font-amiri text-2xl text-slate-800 block mb-1">
                {currentDzikir.textArabic}
              </span>
              <p className="text-xs text-slate-600 font-medium italic truncate">
                {currentDzikir.textLatin}
              </p>
              
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-3xl font-extrabold text-amber-800 font-mono">
                  {currentDzikir.currentCount}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  / {currentDzikir.targetCount}x
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => incrementDzikir(currentDzikir.id, 1, getTodayString())}
                id="home-quick-dzikir-tap-btn"
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Hitung Dzikir (+1)
              </button>

              <button
                type="button"
                onClick={() => resetDzikir(currentDzikir.id, getTodayString())}
                title="Reset Hitungan"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Streak Ibadah & Kalender Agenda */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Streak Istiqomah</h4>
                  <p className="text-xs text-slate-500">Konsistensi mutaba'ah harian</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('statistik')}
                className="text-xs font-semibold text-orange-700 hover:underline flex items-center gap-1"
              >
                Statistik <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200/60 flex items-center justify-between">
              <div>
                <span className="text-2xl font-extrabold text-orange-950 font-mono">
                  {currentStreak} Hari
                </span>
                <span className="text-xs text-orange-800 block font-medium">
                  Streak Berturut-turut
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Rekor Terpanjang</span>
                <span className="text-sm font-bold text-slate-700 font-mono">{longestStreak} Hari</span>
              </div>
            </div>

            {/* Islamic Activity / Fasting Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    {hijriInfo.event?.title || 'Agenda Ibadah Harian'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {hijriInfo.event?.description || 'Jaga sholat 5 waktu & sempatkan tilawah'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('kalender')}
                className="text-emerald-700 font-semibold shrink-0 hover:underline"
              >
                Kalender
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Metric Summary & Islamic Ayah of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Metric Summary Tiles (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Ringkasan Aktivitas Ibadah</h3>
                <p className="text-xs text-slate-500">Statistik dan mutaba'ah akumulatif</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('statistik')}
              className="text-xs font-semibold text-indigo-700 hover:underline flex items-center gap-1"
            >
              Lihat Grafik <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">Sholat Fardhu</span>
              <span className="text-xl font-extrabold text-emerald-700 block mt-0.5 font-mono">
                {totalPrayersCompleted}
              </span>
              <span className="text-[10px] text-slate-500">Waktu tercatat</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">Tilawah Quran</span>
              <span className="text-xl font-extrabold text-teal-700 block mt-0.5 font-mono">
                {totalQuranPagesRead}
              </span>
              <span className="text-[10px] text-slate-500">{tilawahUnit} dibaca</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">Dzikir Hari Ini</span>
              <span className="text-xl font-extrabold text-amber-700 block mt-0.5 font-mono">
                {todayRecord.totalDzikirCount}x
              </span>
              <span className="text-[10px] text-slate-500">Hitungan tasbih</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">Catatan Jurnal</span>
              <span className="text-xl font-extrabold text-indigo-700 block mt-0.5 font-mono">
                {notes.length}
              </span>
              <span className="text-[10px] text-slate-500">Mutaba'ah & refleksi</span>
            </div>
          </div>
        </div>

        {/* Ayat & Kutipan Islami Hari Ini (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Mutiara & Motivasi Islami
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNextQuote}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Ganti Motivasi"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCopyQuote}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Salin Kutipan"
              >
                {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="my-4 space-y-3">
            <p className="font-amiri text-lg sm:text-xl text-emerald-100 leading-relaxed text-right">
              {currentQuote.arabic}
            </p>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{currentQuote.translation}"
            </p>

            {/* Pengingat Singkat Relevan untuk Istiqomah */}
            <div className="pt-1">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed font-medium">
                  <span className="font-bold text-emerald-200">Pengingat Istiqomah: </span>
                  {currentQuote.reminder}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
            <span className="font-semibold text-emerald-400">{currentQuote.source}</span>
            <span className="text-[10px] text-slate-400">Renungan & Istiqomah</span>
          </div>
        </div>
      </div>
    </div>
  );
};
