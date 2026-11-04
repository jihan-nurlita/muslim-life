import { SurahMeta, Ayah } from '../types';

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, nameArabic: 'الفاتحة', nameLatin: 'Al-Fatihah', nameTranslation: 'Pembukaan', numberOfAyahs: 7, revelationType: 'Mekah', juzStart: 1 },
  { number: 2, nameArabic: 'البقرة', nameLatin: 'Al-Baqarah', nameTranslation: 'Sapi Betina', numberOfAyahs: 286, revelationType: 'Madinah', juzStart: 1 },
  { number: 3, nameArabic: 'آل عمران', nameLatin: 'Ali \'Imran', nameTranslation: 'Keluarga Imran', numberOfAyahs: 200, revelationType: 'Madinah', juzStart: 3 },
  { number: 4, nameArabic: 'النساء', nameLatin: 'An-Nisa\'', nameTranslation: 'Wanita', numberOfAyahs: 176, revelationType: 'Madinah', juzStart: 4 },
  { number: 5, nameArabic: 'المائدة', nameLatin: 'Al-Ma\'idah', nameTranslation: 'Jamuan (Hidangan)', numberOfAyahs: 120, revelationType: 'Madinah', juzStart: 6 },
  { number: 6, nameArabic: 'الأنعام', nameLatin: 'Al-An\'am', nameTranslation: 'Binatang Ternak', numberOfAyahs: 165, revelationType: 'Mekah', juzStart: 7 },
  { number: 7, nameArabic: 'الأعراف', nameLatin: 'Al-A\'raf', nameTranslation: 'Tempat Tertinggi', numberOfAyahs: 206, revelationType: 'Mekah', juzStart: 8 },
  { number: 8, nameArabic: 'الأنفال', nameLatin: 'Al-Anfal', nameTranslation: 'Rampasan Perang', numberOfAyahs: 75, revelationType: 'Madinah', juzStart: 9 },
  { number: 9, nameArabic: 'التوبة', nameLatin: 'At-Taubah', nameTranslation: 'Pengampunan', numberOfAyahs: 129, revelationType: 'Madinah', juzStart: 10 },
  { number: 10, nameArabic: 'يونس', nameLatin: 'Yunus', nameTranslation: 'Nabi Yunus', numberOfAyahs: 109, revelationType: 'Mekah', juzStart: 11 },
  { number: 11, nameArabic: 'هود', nameLatin: 'Hud', nameTranslation: 'Nabi Hud', numberOfAyahs: 123, revelationType: 'Mekah', juzStart: 11 },
  { number: 12, nameArabic: 'يوسف', nameLatin: 'Yusuf', nameTranslation: 'Nabi Yusuf', numberOfAyahs: 111, revelationType: 'Mekah', juzStart: 12 },
  { number: 13, nameArabic: 'الرعد', nameLatin: 'Ar-Ra\'d', nameTranslation: 'Guruh', numberOfAyahs: 43, revelationType: 'Madinah', juzStart: 13 },
  { number: 14, nameArabic: 'إبراهيم', nameLatin: 'Ibrahim', nameTranslation: 'Nabi Ibrahim', numberOfAyahs: 52, revelationType: 'Mekah', juzStart: 13 },
  { number: 15, nameArabic: 'الحجر', nameLatin: 'Al-Hijr', nameTranslation: 'Gunung Al-Hijr', numberOfAyahs: 99, revelationType: 'Mekah', juzStart: 14 },
  { number: 16, nameArabic: 'النحل', nameLatin: 'An-Nahl', nameTranslation: 'Lebah', numberOfAyahs: 128, revelationType: 'Mekah', juzStart: 14 },
  { number: 17, nameArabic: 'الإسراء', nameLatin: 'Al-Isra\'', nameTranslation: 'Perjalanan Malam', numberOfAyahs: 111, revelationType: 'Mekah', juzStart: 15 },
  { number: 18, nameArabic: 'الكهف', nameLatin: 'Al-Kahf', nameTranslation: 'Gua', numberOfAyahs: 110, revelationType: 'Mekah', juzStart: 15 },
  { number: 19, nameArabic: 'مريم', nameLatin: 'Maryam', nameTranslation: 'Maryam', numberOfAyahs: 98, revelationType: 'Mekah', juzStart: 16 },
  { number: 20, nameArabic: 'طه', nameLatin: 'Taha', nameTranslation: 'Taha', numberOfAyahs: 135, revelationType: 'Mekah', juzStart: 16 },
  { number: 21, nameArabic: 'الأنبياء', nameLatin: 'Al-Anbiya\'', nameTranslation: 'Para Nabi', numberOfAyahs: 112, revelationType: 'Mekah', juzStart: 17 },
  { number: 22, nameArabic: 'الحج', nameLatin: 'Al-Hajj', nameTranslation: 'Haji', numberOfAyahs: 78, revelationType: 'Madinah', juzStart: 17 },
  { number: 23, nameArabic: 'المؤمنون', nameLatin: 'Al-Mu\'minun', nameTranslation: 'Orang-Orang Mukmin', numberOfAyahs: 118, revelationType: 'Mekah', juzStart: 18 },
  { number: 24, nameArabic: 'النور', nameLatin: 'An-Nur', nameTranslation: 'Cahaya', numberOfAyahs: 64, revelationType: 'Madinah', juzStart: 18 },
  { number: 25, nameArabic: 'الفرقان', nameLatin: 'Al-Furqan', nameTranslation: 'Pembeda', numberOfAyahs: 77, revelationType: 'Mekah', juzStart: 18 },
  { number: 26, nameArabic: 'الشعراء', nameLatin: 'Asy-Syu\'ara\'', nameTranslation: 'Para Penyair', numberOfAyahs: 227, revelationType: 'Mekah', juzStart: 19 },
  { number: 27, nameArabic: 'النمل', nameLatin: 'An-Naml', nameTranslation: 'Semut', numberOfAyahs: 93, revelationType: 'Mekah', juzStart: 19 },
  { number: 28, nameArabic: 'القصص', nameLatin: 'Al-Qasas', nameTranslation: 'Kisah-Kisah', numberOfAyahs: 88, revelationType: 'Mekah', juzStart: 20 },
  { number: 29, nameArabic: 'العنكبوت', nameLatin: 'Al-\'Ankabut', nameTranslation: 'Laba-Laba', numberOfAyahs: 69, revelationType: 'Mekah', juzStart: 20 },
  { number: 30, nameArabic: 'الروم', nameLatin: 'Ar-Rum', nameTranslation: 'Bangsa Romawi', numberOfAyahs: 60, revelationType: 'Mekah', juzStart: 21 },
  { number: 31, nameArabic: 'لقمان', nameLatin: 'Luqman', nameTranslation: 'Luqman', numberOfAyahs: 34, revelationType: 'Mekah', juzStart: 21 },
  { number: 32, nameArabic: 'السجدة', nameLatin: 'As-Sajdah', nameTranslation: 'Sujud', numberOfAyahs: 30, revelationType: 'Mekah', juzStart: 21 },
  { number: 33, nameArabic: 'الأحزاب', nameLatin: 'Al-Ahzab', nameTranslation: 'Golongan yang Bersekutu', numberOfAyahs: 73, revelationType: 'Madinah', juzStart: 21 },
  { number: 34, nameArabic: 'سبأ', nameLatin: 'Saba\'', nameTranslation: 'Kaum Saba\'', numberOfAyahs: 54, revelationType: 'Mekah', juzStart: 22 },
  { number: 35, nameArabic: 'فاطر', nameLatin: 'Fatir', nameTranslation: 'Pencipta', numberOfAyahs: 45, revelationType: 'Mekah', juzStart: 22 },
  { number: 36, nameArabic: 'يس', nameLatin: 'Yasin', nameTranslation: 'Yasin', numberOfAyahs: 83, revelationType: 'Mekah', juzStart: 22 },
  { number: 37, nameArabic: 'الصافات', nameLatin: 'As-Saffat', nameTranslation: 'Barisan-Barisan', numberOfAyahs: 182, revelationType: 'Mekah', juzStart: 23 },
  { number: 38, nameArabic: 'ص', nameLatin: 'Sad', nameTranslation: 'Sad', numberOfAyahs: 88, revelationType: 'Mekah', juzStart: 23 },
  { number: 39, nameArabic: 'الزمر', nameLatin: 'Az-Zumar', nameTranslation: 'Rombongan-Rombongan', numberOfAyahs: 75, revelationType: 'Mekah', juzStart: 23 },
  { number: 40, nameArabic: 'غافر', nameLatin: 'Ghafir', nameTranslation: 'Yang Mengampuni', numberOfAyahs: 85, revelationType: 'Mekah', juzStart: 24 },
  { number: 41, nameArabic: 'فصلت', nameLatin: 'Fussilat', nameTranslation: 'Yang Dijelaskan', numberOfAyahs: 54, revelationType: 'Mekah', juzStart: 24 },
  { number: 42, nameArabic: 'الشورى', nameLatin: 'Asy-Syura', nameTranslation: 'Musyawarah', numberOfAyahs: 53, revelationType: 'Mekah', juzStart: 25 },
  { number: 43, nameArabic: 'الزخرف', nameLatin: 'Az-Zukhruf', nameTranslation: 'Perhiasan', numberOfAyahs: 89, revelationType: 'Mekah', juzStart: 25 },
  { number: 44, nameArabic: 'الدخان', nameLatin: 'Ad-Dukhan', nameTranslation: 'Kabut', numberOfAyahs: 59, revelationType: 'Mekah', juzStart: 25 },
  { number: 45, nameArabic: 'الجاثية', nameLatin: 'Al-Jasiyah', nameTranslation: 'Yang Berlutut', numberOfAyahs: 37, revelationType: 'Mekah', juzStart: 25 },
  { number: 46, nameArabic: 'الأحقاف', nameLatin: 'Al-Ahqaf', nameTranslation: 'Bukit-Bukit Pasir', numberOfAyahs: 35, revelationType: 'Mekah', juzStart: 26 },
  { number: 47, nameArabic: 'محمد', nameLatin: 'Muhammad', nameTranslation: 'Nabi Muhammad', numberOfAyahs: 38, revelationType: 'Madinah', juzStart: 26 },
  { number: 48, nameArabic: 'الفتح', nameLatin: 'Al-Fath', nameTranslation: 'Kemenangan', numberOfAyahs: 29, revelationType: 'Madinah', juzStart: 26 },
  { number: 49, nameArabic: 'الحجرات', nameLatin: 'Al-Hujurat', nameTranslation: 'Kamar-Kamar', numberOfAyahs: 18, revelationType: 'Madinah', juzStart: 26 },
  { number: 50, nameArabic: 'ق', nameLatin: 'Qaf', nameTranslation: 'Qaf', numberOfAyahs: 45, revelationType: 'Mekah', juzStart: 26 },
  { number: 51, nameArabic: 'الذاريات', nameLatin: 'Az-Zariyat', nameTranslation: 'Angin yang Menerbangkan', numberOfAyahs: 60, revelationType: 'Mekah', juzStart: 26 },
  { number: 52, nameArabic: 'الطور', nameLatin: 'At-Tur', nameTranslation: 'Bukit Tursina', numberOfAyahs: 49, revelationType: 'Mekah', juzStart: 27 },
  { number: 53, nameArabic: 'النجم', nameLatin: 'An-Najm', nameTranslation: 'Bintang', numberOfAyahs: 62, revelationType: 'Mekah', juzStart: 27 },
  { number: 54, nameArabic: 'القمر', nameLatin: 'Al-Qamar', nameTranslation: 'Bulan', numberOfAyahs: 55, revelationType: 'Mekah', juzStart: 27 },
  { number: 55, nameArabic: 'الرحمن', nameLatin: 'Ar-Rahman', nameTranslation: 'Yang Maha Pengasih', numberOfAyahs: 78, revelationType: 'Madinah', juzStart: 27 },
  { number: 56, nameArabic: 'الواقعة', nameLatin: 'Al-Waqi\'ah', nameTranslation: 'Hari Kiamat', numberOfAyahs: 96, revelationType: 'Mekah', juzStart: 27 },
  { number: 57, nameArabic: 'الحديد', nameLatin: 'Al-Hadid', nameTranslation: 'Besi', numberOfAyahs: 29, revelationType: 'Madinah', juzStart: 27 },
  { number: 58, nameArabic: 'المجادلة', nameLatin: 'Al-Mujadilah', nameTranslation: 'Wanita yang Mengajukan Gugatan', numberOfAyahs: 22, revelationType: 'Madinah', juzStart: 28 },
  { number: 59, nameArabic: 'الحشر', nameLatin: 'Al-Hasyr', nameTranslation: 'Pengusiran', numberOfAyahs: 24, revelationType: 'Madinah', juzStart: 28 },
  { number: 60, nameArabic: 'الممتحنة', nameLatin: 'Al-Mumtahanah', nameTranslation: 'Wanita yang Diuji', numberOfAyahs: 13, revelationType: 'Madinah', juzStart: 28 },
  { number: 61, nameArabic: 'الصف', nameLatin: 'As-Saff', nameTranslation: 'Barisan', numberOfAyahs: 14, revelationType: 'Madinah', juzStart: 28 },
  { number: 62, nameArabic: 'الجمعة', nameLatin: 'Al-Jumu\'ah', nameTranslation: 'Hari Jumat', numberOfAyahs: 11, revelationType: 'Madinah', juzStart: 28 },
  { number: 63, nameArabic: 'المنافقون', nameLatin: 'Al-Munafiqun', nameTranslation: 'Orang-Orang Munafik', numberOfAyahs: 11, revelationType: 'Madinah', juzStart: 28 },
  { number: 64, nameArabic: 'التغابن', nameLatin: 'At-Taghabun', nameTranslation: 'Hari Ditampakkannya Kesalahan', numberOfAyahs: 18, revelationType: 'Madinah', juzStart: 28 },
  { number: 65, nameArabic: 'الطلاق', nameLatin: 'At-Talaq', nameTranslation: 'Talak', numberOfAyahs: 12, revelationType: 'Madinah', juzStart: 28 },
  { number: 66, nameArabic: 'التحريم', nameLatin: 'At-Tahrim', nameTranslation: 'Pengharaman', numberOfAyahs: 12, revelationType: 'Madinah', juzStart: 28 },
  { number: 67, nameArabic: 'الملك', nameLatin: 'Al-Mulk', nameTranslation: 'Kerajaan', numberOfAyahs: 30, revelationType: 'Mekah', juzStart: 29 },
  { number: 68, nameArabic: 'القلم', nameLatin: 'Al-Qalam', nameTranslation: 'Pena', numberOfAyahs: 52, revelationType: 'Mekah', juzStart: 29 },
  { number: 69, nameArabic: 'الحاقة', nameLatin: 'Al-Haqqah', nameTranslation: 'Hari Kiamat yang Sebenarnya', numberOfAyahs: 52, revelationType: 'Mekah', juzStart: 29 },
  { number: 70, nameArabic: 'المعارج', nameLatin: 'Al-Ma\'arij', nameTranslation: 'Tempat-Tempat Naik', numberOfAyahs: 44, revelationType: 'Mekah', juzStart: 29 },
  { number: 71, nameArabic: 'نوح', nameLatin: 'Nuh', nameTranslation: 'Nabi Nuh', numberOfAyahs: 28, revelationType: 'Mekah', juzStart: 29 },
  { number: 72, nameArabic: 'الجن', nameLatin: 'Al-Jinn', nameTranslation: 'Jin', numberOfAyahs: 28, revelationType: 'Mekah', juzStart: 29 },
  { number: 73, nameArabic: 'المزمل', nameLatin: 'Al-Muzzammil', nameTranslation: 'Orang yang Berselimut', numberOfAyahs: 20, revelationType: 'Mekah', juzStart: 29 },
  { number: 74, nameArabic: 'المدثر', nameLatin: 'Al-Muddassir', nameTranslation: 'Orang yang Berkemul', numberOfAyahs: 56, revelationType: 'Mekah', juzStart: 29 },
  { number: 75, nameArabic: 'القيامة', nameLatin: 'Al-Qiyamah', nameTranslation: 'Hari Kiamat', numberOfAyahs: 40, revelationType: 'Mekah', juzStart: 29 },
  { number: 76, nameArabic: 'الإنسان', nameLatin: 'Al-Insan', nameTranslation: 'Manusia', numberOfAyahs: 31, revelationType: 'Madinah', juzStart: 29 },
  { number: 77, nameArabic: 'المرسلات', nameLatin: 'Al-Mursalat', nameTranslation: 'Malaikat yang Diutus', numberOfAyahs: 50, revelationType: 'Mekah', juzStart: 29 },
  { number: 78, nameArabic: 'النبأ', nameLatin: 'An-Naba\'', nameTranslation: 'Berita Besar', numberOfAyahs: 40, revelationType: 'Mekah', juzStart: 30 },
  { number: 79, nameArabic: 'النازعات', nameLatin: 'An-Nazi\'at', nameTranslation: 'Malaikat yang Mencabut', numberOfAyahs: 46, revelationType: 'Mekah', juzStart: 30 },
  { number: 80, nameArabic: 'عبس', nameLatin: '\'Abasa', nameTranslation: 'Ia Bermuka Masam', numberOfAyahs: 42, revelationType: 'Mekah', juzStart: 30 },
  { number: 81, nameArabic: 'التكوير', nameLatin: 'At-Takwir', nameTranslation: 'Menggulung', numberOfAyahs: 29, revelationType: 'Mekah', juzStart: 30 },
  { number: 82, nameArabic: 'الانفطار', nameLatin: 'Al-Infitar', nameTranslation: 'Terbelah', numberOfAyahs: 19, revelationType: 'Mekah', juzStart: 30 },
  { number: 83, nameArabic: 'المطففين', nameLatin: 'Al-Mutaffifin', nameTranslation: 'Orang-Orang Curang', numberOfAyahs: 36, revelationType: 'Mekah', juzStart: 30 },
  { number: 84, nameArabic: 'الانشقاق', nameLatin: 'Al-Insyiqaq', nameTranslation: 'Terbelah', numberOfAyahs: 25, revelationType: 'Mekah', juzStart: 30 },
  { number: 85, nameArabic: 'البروج', nameLatin: 'Al-Buruj', nameTranslation: 'Gugusan Bintang', numberOfAyahs: 22, revelationType: 'Mekah', juzStart: 30 },
  { number: 86, nameArabic: 'الطارق', nameLatin: 'At-Tariq', nameTranslation: 'Yang Datang di Malam Hari', numberOfAyahs: 17, revelationType: 'Mekah', juzStart: 30 },
  { number: 87, nameArabic: 'الأعلى', nameLatin: 'Al-A\'la', nameTranslation: 'Yang Paling Tinggi', numberOfAyahs: 19, revelationType: 'Mekah', juzStart: 30 },
  { number: 88, nameArabic: 'الغاشية', nameLatin: 'Al-Ghasyiyah', nameTranslation: 'Hari Pembalasan', numberOfAyahs: 26, revelationType: 'Mekah', juzStart: 30 },
  { number: 89, nameArabic: 'الفجر', nameLatin: 'Al-Fajr', nameTranslation: 'Fajar', numberOfAyahs: 30, revelationType: 'Mekah', juzStart: 30 },
  { number: 90, nameArabic: 'البلد', nameLatin: 'Al-Balad', nameTranslation: 'Negeri', numberOfAyahs: 20, revelationType: 'Mekah', juzStart: 30 },
  { number: 91, nameArabic: 'الشمس', nameLatin: 'Asy-Syams', nameTranslation: 'Matahari', numberOfAyahs: 15, revelationType: 'Mekah', juzStart: 30 },
  { number: 92, nameArabic: 'الليل', nameLatin: 'Al-Lail', nameTranslation: 'Malam', numberOfAyahs: 21, revelationType: 'Mekah', juzStart: 30 },
  { number: 93, nameArabic: 'الضحى', nameLatin: 'Ad-Duha', nameTranslation: 'Waktu Dhuha', numberOfAyahs: 11, revelationType: 'Mekah', juzStart: 30 },
  { number: 94, nameArabic: 'الشرح', nameLatin: 'Asy-Syarh', nameTranslation: 'Kelapangan', numberOfAyahs: 8, revelationType: 'Mekah', juzStart: 30 },
  { number: 95, nameArabic: 'التين', nameLatin: 'At-Tin', nameTranslation: 'Buah Tin', numberOfAyahs: 8, revelationType: 'Mekah', juzStart: 30 },
  { number: 96, nameArabic: 'العلق', nameLatin: 'Al-\'Alaq', nameTranslation: 'Segumpal Darah', numberOfAyahs: 19, revelationType: 'Mekah', juzStart: 30 },
  { number: 97, nameArabic: 'القدر', nameLatin: 'Al-Qadr', nameTranslation: 'Kemuliaan', numberOfAyahs: 5, revelationType: 'Mekah', juzStart: 30 },
  { number: 98, nameArabic: 'البينة', nameLatin: 'Al-Bayyinah', nameTranslation: 'Bukti Nyata', numberOfAyahs: 8, revelationType: 'Madinah', juzStart: 30 },
  { number: 99, nameArabic: 'الزلزلة', nameLatin: 'Az-Zalzalah', nameTranslation: 'Kegoncangan', numberOfAyahs: 8, revelationType: 'Madinah', juzStart: 30 },
  { number: 100, nameArabic: 'العاديات', nameLatin: 'Al-\'Adiyat', nameTranslation: 'Kuda Perang yang Berlari Kencang', numberOfAyahs: 11, revelationType: 'Mekah', juzStart: 30 },
  { number: 101, nameArabic: 'القارعة', nameLatin: 'Al-Qari\'ah', nameTranslation: 'Hari Kiamat', numberOfAyahs: 11, revelationType: 'Mekah', juzStart: 30 },
  { number: 102, nameArabic: 'التكاثر', nameLatin: 'At-Takasur', nameTranslation: 'Bermegah-Megahan', numberOfAyahs: 8, revelationType: 'Mekah', juzStart: 30 },
  { number: 103, nameArabic: 'العصر', nameLatin: 'Al-\'Asr', nameTranslation: 'Masa / Waktu', numberOfAyahs: 3, revelationType: 'Mekah', juzStart: 30 },
  { number: 104, nameArabic: 'الهمزة', nameLatin: 'Al-Humazah', nameTranslation: 'Pengumpat', numberOfAyahs: 9, revelationType: 'Mekah', juzStart: 30 },
  { number: 105, nameArabic: 'الفيل', nameLatin: 'Al-Fil', nameTranslation: 'Gajah', numberOfAyahs: 5, revelationType: 'Mekah', juzStart: 30 },
  { number: 106, nameArabic: 'قريش', nameLatin: 'Quraisy', nameTranslation: 'Suku Quraisy', numberOfAyahs: 4, revelationType: 'Mekah', juzStart: 30 },
  { number: 107, nameArabic: 'الماعون', nameLatin: 'Al-Ma\'un', nameTranslation: 'Barang yang Berguna', numberOfAyahs: 7, revelationType: 'Mekah', juzStart: 30 },
  { number: 108, nameArabic: 'الكوثر', nameLatin: 'Al-Kausar', nameTranslation: 'Nikmat yang Berlimpah', numberOfAyahs: 3, revelationType: 'Mekah', juzStart: 30 },
  { number: 109, nameArabic: 'الكافرون', nameLatin: 'Al-Kafirun', nameTranslation: 'Orang-Orang Kafir', numberOfAyahs: 6, revelationType: 'Mekah', juzStart: 30 },
  { number: 110, nameArabic: 'النصر', nameLatin: 'An-Nasr', nameTranslation: 'Pertolongan', numberOfAyahs: 3, revelationType: 'Madinah', juzStart: 30 },
  { number: 111, nameArabic: 'المسد', nameLatin: 'Al-Lahab', nameTranslation: 'Gejolak Api (Sabut)', numberOfAyahs: 5, revelationType: 'Mekah', juzStart: 30 },
  { number: 112, nameArabic: 'الإخلاص', nameLatin: 'Al-Ikhlas', nameTranslation: 'Kemurnian Keesaan Allah', numberOfAyahs: 4, revelationType: 'Mekah', juzStart: 30 },
  { number: 113, nameArabic: 'الفلق', nameLatin: 'Al-Falaq', nameTranslation: 'Waktu Subuh', numberOfAyahs: 5, revelationType: 'Mekah', juzStart: 30 },
  { number: 114, nameArabic: 'الناس', nameLatin: 'An-Nas', nameTranslation: 'Manusia', numberOfAyahs: 6, revelationType: 'Mekah', juzStart: 30 },
];

export interface JuzDetail {
  juz: number;
  title: string;
  nameArabic: string;
  startSurahNumber: number;
  startSurahName: string;
  startAyahNumber: number;
  endSurahNumber: number;
  endSurahName: string;
  endAyahNumber: number;
  surahNumbers: number[];
  pageStart: number;
  pageEnd: number;
}

export const QARI_LIST: { id: string; name: string; equranKey: string; cdnId: string; description: string }[] = [
  { id: 'misyari', name: 'Misyari Rasyid Al-Afasy', equranKey: '05', cdnId: 'ar.alafasy', description: 'Imam Masjid Agung Kuwait (Khas merdu & syahdu)' },
  { id: 'sudais', name: 'Abdurrahman As-Sudais', equranKey: '03', cdnId: 'ar.abdurrahmaansudais', description: 'Imam Besar Masjidil Haram Makkah' },
  { id: 'juhany', name: 'Abdullah Al-Juhany', equranKey: '01', cdnId: 'ar.juhany', description: 'Imam Masjidil Haram Makkah' },
  { id: 'qasim', name: 'Abdul Muhsin Al-Qasim', equranKey: '02', cdnId: 'ar.qasim', description: 'Imam Masjid Nabawi Madinah' },
  { id: 'dossari', name: 'Ibrahim Al-Dossari', equranKey: '04', cdnId: 'ar.dossari', description: 'Qari Riyadh berirama lembut' },
  { id: 'husary', name: 'Mahmud Khalil Al-Husary', equranKey: '05', cdnId: 'ar.husary', description: 'Syaikh Tartil & Tajwid Al-Azhar Mesir' },
];

export const JUZ_LIST: JuzDetail[] = [
  { juz: 1, title: 'Juz 1', nameArabic: 'آلم', startSurahNumber: 1, startSurahName: 'Al-Fatihah', startAyahNumber: 1, endSurahNumber: 2, endSurahName: 'Al-Baqarah', endAyahNumber: 141, surahNumbers: [1, 2], pageStart: 1, pageEnd: 21 },
  { juz: 2, title: 'Juz 2', nameArabic: 'سَيَقُولُ', startSurahNumber: 2, startSurahName: 'Al-Baqarah', startAyahNumber: 142, endSurahNumber: 2, endSurahName: 'Al-Baqarah', endAyahNumber: 252, surahNumbers: [2], pageStart: 22, pageEnd: 41 },
  { juz: 3, title: 'Juz 3', nameArabic: 'تِلْكَ الرُّسُلُ', startSurahNumber: 2, startSurahName: 'Al-Baqarah', startAyahNumber: 253, endSurahNumber: 3, endSurahName: "Ali 'Imran", endAyahNumber: 92, surahNumbers: [2, 3], pageStart: 42, pageEnd: 61 },
  { juz: 4, title: 'Juz 4', nameArabic: 'لَنْ تَنَالُوا', startSurahNumber: 3, startSurahName: "Ali 'Imran", startAyahNumber: 93, endSurahNumber: 4, endSurahName: "An-Nisa'", endAyahNumber: 23, surahNumbers: [3, 4], pageStart: 62, pageEnd: 81 },
  { juz: 5, title: 'Juz 5', nameArabic: 'وَالْمُحْصَنَاتُ', startSurahNumber: 4, startSurahName: "An-Nisa'", startAyahNumber: 24, endSurahNumber: 4, endSurahName: "An-Nisa'", endAyahNumber: 147, surahNumbers: [4], pageStart: 82, pageEnd: 101 },
  { juz: 6, title: 'Juz 6', nameArabic: 'لَا يُحِبُّ اللَّهُ', startSurahNumber: 4, startSurahName: "An-Nisa'", startAyahNumber: 148, endSurahNumber: 5, endSurahName: "Al-Ma'idah", endAyahNumber: 81, surahNumbers: [4, 5], pageStart: 102, pageEnd: 121 },
  { juz: 7, title: 'Juz 7', nameArabic: 'وَإِذَا سَمِعُوا', startSurahNumber: 5, startSurahName: "Al-Ma'idah", startAyahNumber: 82, endSurahNumber: 6, endSurahName: "Al-An'am", endAyahNumber: 110, surahNumbers: [5, 6], pageStart: 122, pageEnd: 141 },
  { juz: 8, title: 'Juz 8', nameArabic: 'وَلَوْ أَنَّنَا', startSurahNumber: 6, startSurahName: "Al-An'am", startAyahNumber: 111, endSurahNumber: 7, endSurahName: "Al-A'raf", endAyahNumber: 87, surahNumbers: [6, 7], pageStart: 142, pageEnd: 161 },
  { juz: 9, title: 'Juz 9', nameArabic: 'قَالَ الْمَلَأُ', startSurahNumber: 7, startSurahName: "Al-A'raf", startAyahNumber: 88, endSurahNumber: 8, endSurahName: 'Al-Anfal', endAyahNumber: 40, surahNumbers: [7, 8], pageStart: 162, pageEnd: 181 },
  { juz: 10, title: 'Juz 10', nameArabic: 'وَاعْلَمُوا', startSurahNumber: 8, startSurahName: 'Al-Anfal', startAyahNumber: 41, endSurahNumber: 9, endSurahName: 'At-Taubah', endAyahNumber: 92, surahNumbers: [8, 9], pageStart: 182, pageEnd: 201 },
  { juz: 11, title: 'Juz 11', nameArabic: 'يَعْتَذِرُونَ', startSurahNumber: 9, startSurahName: 'At-Taubah', startAyahNumber: 93, endSurahNumber: 11, endSurahName: 'Hud', endAyahNumber: 5, surahNumbers: [9, 10, 11], pageStart: 202, pageEnd: 221 },
  { juz: 12, title: 'Juz 12', nameArabic: 'وَمَا مِنْ دَابَّةٍ', startSurahNumber: 11, startSurahName: 'Hud', startAyahNumber: 6, endSurahNumber: 12, endSurahName: 'Yusuf', endAyahNumber: 52, surahNumbers: [11, 12], pageStart: 222, pageEnd: 241 },
  { juz: 13, title: 'Juz 13', nameArabic: 'وَمَا أُبَرِّئُ', startSurahNumber: 12, startSurahName: 'Yusuf', startAyahNumber: 53, endSurahNumber: 14, endSurahName: 'Ibrahim', endAyahNumber: 52, surahNumbers: [12, 13, 14], pageStart: 242, pageEnd: 261 },
  { juz: 14, title: 'Juz 14', nameArabic: 'رُبَمَا', startSurahNumber: 15, startSurahName: 'Al-Hijr', startAyahNumber: 1, endSurahNumber: 16, endSurahName: 'An-Nahl', endAyahNumber: 128, surahNumbers: [15, 16], pageStart: 262, pageEnd: 281 },
  { juz: 15, title: 'Juz 15', nameArabic: 'سُبْحَانَ الَّذِي', startSurahNumber: 17, startSurahName: "Al-Isra'", startAyahNumber: 1, endSurahNumber: 18, endSurahName: 'Al-Kahf', endAyahNumber: 74, surahNumbers: [17, 18], pageStart: 282, pageEnd: 301 },
  { juz: 16, title: 'Juz 16', nameArabic: 'قَالَ أَلَمْ', startSurahNumber: 18, startSurahName: 'Al-Kahf', startAyahNumber: 75, endSurahNumber: 20, endSurahName: 'Taha', endAyahNumber: 135, surahNumbers: [18, 19, 20], pageStart: 302, pageEnd: 321 },
  { juz: 17, title: 'Juz 17', nameArabic: 'اقْتَرَبَ', startSurahNumber: 21, startSurahName: "Al-Anbiya'", startAyahNumber: 1, endSurahNumber: 22, endSurahName: 'Al-Hajj', endAyahNumber: 78, surahNumbers: [21, 22], pageStart: 322, pageEnd: 341 },
  { juz: 18, title: 'Juz 18', nameArabic: 'قَدْ أَفْلَحَ', startSurahNumber: 23, startSurahName: "Al-Mu'minun", startAyahNumber: 1, endSurahNumber: 25, endSurahName: 'Al-Furqan', endAyahNumber: 20, surahNumbers: [23, 24, 25], pageStart: 342, pageEnd: 361 },
  { juz: 19, title: 'Juz 19', nameArabic: 'وَقَالَ الَّذِينَ', startSurahNumber: 25, startSurahName: 'Al-Furqan', startAyahNumber: 21, endSurahNumber: 27, endSurahName: 'An-Naml', endAyahNumber: 55, surahNumbers: [25, 26, 27], pageStart: 362, pageEnd: 381 },
  { juz: 20, title: 'Juz 20', nameArabic: 'أَمَّنْ خَلَقَ', startSurahNumber: 27, startSurahName: 'An-Naml', startAyahNumber: 56, endSurahNumber: 29, endSurahName: "Al-'Ankabut", endAyahNumber: 45, surahNumbers: [27, 28, 29], pageStart: 382, pageEnd: 401 },
  { juz: 21, title: 'Juz 21', nameArabic: 'اتْلُ مَا أُوحِيَ', startSurahNumber: 29, startSurahName: "Al-'Ankabut", startAyahNumber: 46, endSurahNumber: 33, endSurahName: 'Al-Ahzab', endAyahNumber: 30, surahNumbers: [29, 30, 31, 32, 33], pageStart: 402, pageEnd: 421 },
  { juz: 22, title: 'Juz 22', nameArabic: 'وَمَنْ يَقْنُتْ', startSurahNumber: 33, startSurahName: 'Al-Ahzab', startAyahNumber: 31, endSurahNumber: 36, endSurahName: 'Yasin', endAyahNumber: 27, surahNumbers: [33, 34, 35, 36], pageStart: 422, pageEnd: 441 },
  { juz: 23, title: 'Juz 23', nameArabic: 'وَمَا لِيَ', startSurahNumber: 36, startSurahName: 'Yasin', startAyahNumber: 28, endSurahNumber: 39, endSurahName: 'Az-Zumar', endAyahNumber: 31, surahNumbers: [36, 37, 38, 39], pageStart: 442, pageEnd: 461 },
  { juz: 24, title: 'Juz 24', nameArabic: 'فَمَنْ أَظْلَمُ', startSurahNumber: 39, startSurahName: 'Az-Zumar', startAyahNumber: 32, endSurahNumber: 41, endSurahName: 'Fussilat', endAyahNumber: 46, surahNumbers: [39, 40, 41], pageStart: 462, pageEnd: 481 },
  { juz: 25, title: 'Juz 25', nameArabic: 'إِلَيْهِ يُرَدُّ', startSurahNumber: 41, startSurahName: 'Fussilat', startAyahNumber: 47, endSurahNumber: 45, endSurahName: 'Al-Jasiyah', endAyahNumber: 37, surahNumbers: [41, 42, 43, 44, 45], pageStart: 482, pageEnd: 501 },
  { juz: 26, title: 'Juz 26', nameArabic: 'حم', startSurahNumber: 46, startSurahName: 'Al-Ahqaf', startAyahNumber: 1, endSurahNumber: 51, endSurahName: 'Az-Zariyat', endAyahNumber: 30, surahNumbers: [46, 47, 48, 49, 50, 51], pageStart: 502, pageEnd: 521 },
  { juz: 27, title: 'Juz 27', nameArabic: 'قَالَ فَمَا خَطْبُكُمْ', startSurahNumber: 51, startSurahName: 'Az-Zariyat', startAyahNumber: 31, endSurahNumber: 57, endSurahName: 'Al-Hadid', endAyahNumber: 29, surahNumbers: [51, 52, 53, 54, 55, 56, 57], pageStart: 522, pageEnd: 541 },
  { juz: 28, title: 'Juz 28', nameArabic: 'قَدْ سَمِعَ اللَّهُ', startSurahNumber: 58, startSurahName: 'Al-Mujadilah', startAyahNumber: 1, endSurahNumber: 66, endSurahName: 'At-Tahrim', endAyahNumber: 12, surahNumbers: [58, 59, 60, 61, 62, 63, 64, 65, 66], pageStart: 542, pageEnd: 561 },
  { juz: 29, title: 'Juz 29 (Tabarak)', nameArabic: 'تَبَارَكَ الَّذِي', startSurahNumber: 67, startSurahName: 'Al-Mulk', startAyahNumber: 1, endSurahNumber: 77, endSurahName: 'Al-Mursalat', endAyahNumber: 50, surahNumbers: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], pageStart: 562, pageEnd: 581 },
  { juz: 30, title: "Juz 30 ('Amma)", nameArabic: 'عَمَّ', startSurahNumber: 78, startSurahName: 'An-Naba\'', startAyahNumber: 1, endSurahNumber: 114, endSurahName: 'An-Nas', endAyahNumber: 6, surahNumbers: Array.from({ length: 37 }, (_, i) => 78 + i), pageStart: 582, pageEnd: 604 },
];

// Sample embedded popular surahs for fast instant offline reading
export const POPULAR_SURAHS_DATA: Record<number, Ayah[]> = {
  1: [
    { numberInSurah: 1, numberInQuran: 1, juz: 1, textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', textLatin: 'Bismillahir-rahmanir-rahim', translationId: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3' },
    { numberInSurah: 2, numberInQuran: 2, juz: 1, textArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', textLatin: 'Al-hamdu lillahi rabbil-\'alamin', translationId: 'Segala puji bagi Allah, Tuhan semesta alam.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3' },
    { numberInSurah: 3, numberInQuran: 3, juz: 1, textArabic: 'الرَّحْمَٰنِ الرَّحِيمِ', textLatin: 'Ar-rahmanir-rahim', translationId: 'Yang Maha Pengasih, Maha Penyayang.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3' },
    { numberInSurah: 4, numberInQuran: 4, juz: 1, textArabic: 'مَالِكِ يَوْمِ الدِّينِ', textLatin: 'Maliki yaumid-din', translationId: 'Pemilik hari pembalasan.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3' },
    { numberInSurah: 5, numberInQuran: 5, juz: 1, textArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', textLatin: 'Iyyaka na\'budu wa iyyaka nasta\'in', translationId: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3' },
    { numberInSurah: 6, numberInQuran: 6, juz: 1, textArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', textLatin: 'Ihdinas-siratal-mustaqim', translationId: 'Tunjukilah kami jalan yang lurus,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3' },
    { numberInSurah: 7, numberInQuran: 7, juz: 1, textArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', textLatin: 'Siratallazina an\'amta \'alaihim gairil-magdubi \'alaihim wa lad-dallin', translationId: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3' },
  ],
  36: [
    { numberInSurah: 1, numberInQuran: 3706, juz: 22, textArabic: 'يس', textLatin: 'Ya Sin', translationId: 'Ya Sin.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3706.mp3' },
    { numberInSurah: 2, numberInQuran: 3707, juz: 22, textArabic: 'وَالْقُرْآنِ الْحَكِيمِ', textLatin: 'Wal-qur\'anil-hakim', translationId: 'Demi Al-Qur\'an yang penuh hikmah,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3707.mp3' },
    { numberInSurah: 3, numberInQuran: 3708, juz: 22, textArabic: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ', textLatin: 'Innaka laminal-mursalin', translationId: 'sungguh, engkau (Muhammad) adalah salah seorang dari rasul-rasul,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3708.mp3' },
    { numberInSurah: 4, numberInQuran: 3709, juz: 22, textArabic: 'عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ', textLatin: '\'Ala siratim mustaqim', translationId: '(yang berada) di atas jalan yang lurus,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3709.mp3' },
    { numberInSurah: 5, numberInQuran: 3710, juz: 22, textArabic: 'تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ', textLatin: 'Tanzilal-\'azizir-rahim', translationId: '(sebagai wahyu) yang diturunkan oleh (Allah) Yang Mahaperkasa, Maha Penyayang,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3710.mp3' },
  ],
  67: [
    { numberInSurah: 1, numberInQuran: 5242, juz: 29, textArabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', textLatin: 'Tabarakallazi biyadihil-mulku wa huwa \'ala kulli syai\'in qadir', translationId: 'Mahasuci Allah yang menguasai (segala) kerajaan, dan Dia Mahakuasa atas segala sesuatu.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5242.mp3' },
    { numberInSurah: 2, numberInQuran: 5243, juz: 29, textArabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ', textLatin: 'Allazi khalaqal-mauta wal-hayata liyabluwakum ayyukum ahsanu \'amala, wa huwal-\'azizul-gafur', translationId: 'Yang menciptakan mati dan hidup, untuk menguji kamu, siapa di antara kamu yang lebih baik amalnya. Dan Dia Mahaperkasa, Maha Pengampun,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5243.mp3' },
    { numberInSurah: 3, numberInQuran: 5244, juz: 29, textArabic: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِنْ تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِنْ فُطُورٍ', textLatin: 'Allazi khalaqa sab\'a samawatin tibaqa, ma tara fi khalqir-rahmani min tafawut, farji\'il-basara hal tara min futur', translationId: 'Yang menciptakan tujuh langit berlapis-lapis. Tidak akan kamu lihat sesuatu yang tidak seimbang pada ciptaan Tuhan Yang Maha Pengasih. Maka lihatlah sekali lagi, adakah kamu lihat sesuatu yang cacat?', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5244.mp3' },
  ],
  112: [
    { numberInSurah: 1, numberInQuran: 6222, juz: 30, textArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', textLatin: 'Qul huwallahu ahad', translationId: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3' },
    { numberInSurah: 2, numberInQuran: 6223, juz: 30, textArabic: 'اللَّهُ الصَّمَدُ', textLatin: 'Allahus-samad', translationId: 'Allah tempat meminta segala sesuatu.', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3' },
    { numberInSurah: 3, numberInQuran: 6224, juz: 30, textArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', textLatin: 'Lam yalid wa lam yulad', translationId: '(Allah) tidak beranak dan tidak pula diperanakkan,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3' },
    { numberInSurah: 4, numberInQuran: 6225, juz: 30, textArabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', textLatin: 'Wa lam yakul lahu kufuwan ahad', translationId: 'dan tidak ada sesuatu yang setara dengan Dia."', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3' },
  ],
  113: [
    { numberInSurah: 1, numberInQuran: 6226, juz: 30, textArabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', textLatin: 'Qul a\'uzu birabbil-falaq', translationId: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar),', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3' },
    { numberInSurah: 2, numberInQuran: 6227, juz: 30, textArabic: 'مِنْ شَرِّ مَا خَلَقَ', textLatin: 'Min syarri ma khalaq', translationId: 'dari kejahatan (makhluk yang) Dia ciptakan,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6227.mp3' },
    { numberInSurah: 3, numberInQuran: 6228, juz: 30, textArabic: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ', textLatin: 'Wa min syarri gasiqin iza waqab', translationId: 'dan dari kejahatan malam apabila telah gelap gulita,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6228.mp3' },
    { numberInSurah: 4, numberInQuran: 6229, juz: 30, textArabic: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', textLatin: 'Wa min syarrin-naffasati fil-\'uqad', translationId: 'dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6229.mp3' },
    { numberInSurah: 5, numberInQuran: 6230, juz: 30, textArabic: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ', textLatin: 'Wa min syarri hasidin iza hasad', translationId: 'dan dari kejahatan orang yang dengki apabila dia dengki."', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6230.mp3' },
  ],
  114: [
    { numberInSurah: 1, numberInQuran: 6231, juz: 30, textArabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', textLatin: 'Qul a\'uzu birabbin-nas', translationId: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3' },
    { numberInSurah: 2, numberInQuran: 6232, juz: 30, textArabic: 'مَلِكِ النَّاسِ', textLatin: 'Malikin-nas', translationId: 'Raja manusia,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3' },
    { numberInSurah: 3, numberInQuran: 6233, juz: 30, textArabic: 'إِلَٰهِ النَّاسِ', textLatin: 'Ilahin-nas', translationId: 'sembahan manusia,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6233.mp3' },
    { numberInSurah: 4, numberInQuran: 6234, juz: 30, textArabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', textLatin: 'Min syarril-waswasil-khannas', translationId: 'dari kejahatan (bisikan) setan yang bersembunyi,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6234.mp3' },
    { numberInSurah: 5, numberInQuran: 6235, juz: 30, textArabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', textLatin: 'Allazi yuwaswisu fi sudurin-nas', translationId: 'yang membisikkan (kejahatan) ke dalam dada manusia,', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6235.mp3' },
    { numberInSurah: 6, numberInQuran: 6236, juz: 30, textArabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', textLatin: 'Minal-jinnati wan-nas', translationId: 'dari (golongan) jin dan manusia."', audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3' },
  ],
};

// Memory cache for fetched surah details
const surahCache: Record<number, SurahFullData> = {};

export interface SurahFullData {
  meta: SurahMeta;
  deskripsi?: string;
  audioFull?: Record<string, string>;
  verses: Ayah[];
}

/**
 * Returns accurate Juz number for a given Surah number and Ayah number
 */
export function getJuzForAyah(surahNumber: number, ayahNumber: number): number {
  for (let i = JUZ_LIST.length - 1; i >= 0; i--) {
    const j = JUZ_LIST[i];
    // Check if the surah is within this juz
    if (surahNumber > j.startSurahNumber && surahNumber < j.endSurahNumber) {
      return j.juz;
    }
    if (surahNumber === j.startSurahNumber && surahNumber === j.endSurahNumber) {
      if (ayahNumber >= j.startAyahNumber && ayahNumber <= j.endAyahNumber) {
        return j.juz;
      }
    }
    if (surahNumber === j.startSurahNumber) {
      if (ayahNumber >= j.startAyahNumber) {
        return j.juz;
      }
    }
    if (surahNumber === j.endSurahNumber) {
      if (ayahNumber <= j.endAyahNumber) {
        return j.juz;
      }
    }
  }
  const meta = SURAH_LIST.find((s) => s.number === surahNumber);
  return meta?.juzStart || 1;
}

/**
 * Build reliable audio URL for specific ayah & qari
 */
export function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  qariId: string = 'misyari',
  apiAudioMap?: Record<string, string>
): string {
  const qari = QARI_LIST.find((q) => q.id === qariId) || QARI_LIST[0];

  // 1. If API provided audio map with this Qari's equran key
  if (apiAudioMap && apiAudioMap[qari.equranKey]) {
    return apiAudioMap[qari.equranKey];
  }

  // 2. High-speed reliable Islamic Network CDN
  const surahPadded = String(surahNumber).padStart(3, '0');
  const ayahPadded = String(ayahNumber).padStart(3, '0');
  return `https://cdn.islamic.network/quran/audio/128/${qari.cdnId}/${surahNumber}${ayahPadded}.mp3`;
}

/**
 * Fetch full Surah details with verses, translation and multi-qari audio
 */
export async function fetchSurahFullData(surahNumber: number, qariId: string = 'misyari'): Promise<SurahFullData> {
  const surahMeta = SURAH_LIST.find((s) => s.number === surahNumber) || SURAH_LIST[0];

  if (surahCache[surahNumber] && surahCache[surahNumber].verses.length >= surahMeta.numberOfAyahs) {
    return surahCache[surahNumber];
  }

  // 1. Primary: equran.id v2 API (Indonesian Ministry of Religious Affairs Standard)
  try {
    const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
    if (response.ok) {
      const json = await response.json();
      if (json.code === 200 && json.data && json.data.ayat) {
        const verses: Ayah[] = json.data.ayat.map((ay: any) => {
          const juz = getJuzForAyah(surahNumber, ay.nomorAyat);
          const audioUrl = getAyahAudioUrl(surahNumber, ay.nomorAyat, qariId, ay.audio);
          return {
            numberInSurah: ay.nomorAyat,
            numberInQuran: ay.nomorAyat,
            juz,
            textArabic: ay.teksArab,
            textLatin: ay.teksLatin,
            translationId: ay.teksIndonesia,
            audioUrl,
            audioMap: ay.audio,
          };
        });

        const fullData: SurahFullData = {
          meta: {
            ...surahMeta,
            nameArabic: json.data.nama || surahMeta.nameArabic,
            nameLatin: json.data.namaLatin || surahMeta.nameLatin,
            nameTranslation: json.data.arti || surahMeta.nameTranslation,
            numberOfAyahs: json.data.jumlahAyat || surahMeta.numberOfAyahs,
            revelationType: json.data.tempatTurun === 'Mekah' ? 'Mekah' : 'Madinah',
          },
          deskripsi: json.data.deskripsi ? json.data.deskripsi.replace(/<[^>]*>?/gm, '') : undefined,
          audioFull: json.data.audioFull,
          verses,
        };

        surahCache[surahNumber] = fullData;
        return fullData;
      }
    }
  } catch (err) {
    console.warn(`equran.id fetch failed for Surah ${surahNumber}, trying backup:`, err);
  }

  // 2. Backup: Alquran Cloud API
  try {
    const backupRes = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,id.indonesian,ar.alafasy`
    );
    if (backupRes.ok) {
      const backupJson = await backupRes.json();
      if (backupJson.code === 200 && Array.isArray(backupJson.data) && backupJson.data.length >= 2) {
        const arabicData = backupJson.data[0]?.ayahs || [];
        const transData = backupJson.data[1]?.ayahs || [];
        const audioData = backupJson.data[2]?.ayahs || [];

        const verses: Ayah[] = arabicData.map((ay: any, idx: number) => {
          const num = ay.numberInSurah || idx + 1;
          return {
            numberInSurah: num,
            numberInQuran: ay.number,
            juz: ay.juz || getJuzForAyah(surahNumber, num),
            textArabic: ay.text,
            textLatin: `Ayat ${num}`,
            translationId: transData[idx]?.text || 'Terjemahan tidak tersedia.',
            audioUrl: audioData[idx]?.audio || getAyahAudioUrl(surahNumber, num, qariId),
          };
        });

        const fullData: SurahFullData = {
          meta: surahMeta,
          verses,
        };
        surahCache[surahNumber] = fullData;
        return fullData;
      }
    }
  } catch (err2) {
    console.warn(`Backup API also failed for Surah ${surahNumber}:`, err2);
  }

  // 3. Fallback: Local popular surahs data if present
  if (POPULAR_SURAHS_DATA[surahNumber]) {
    const fullData: SurahFullData = {
      meta: surahMeta,
      verses: POPULAR_SURAHS_DATA[surahNumber],
    };
    return fullData;
  }

  // 4. Guaranteed offline fallback structure
  const count = surahMeta.numberOfAyahs;
  const fallbackVerses: Ayah[] = [];
  for (let i = 1; i <= count; i++) {
    fallbackVerses.push({
      numberInSurah: i,
      numberInQuran: i,
      juz: getJuzForAyah(surahNumber, i),
      textArabic: i === 1 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : `آية رقم ${i} من سورة ${surahMeta.nameArabic}`,
      textLatin: `Ayat ${i} Surah ${surahMeta.nameLatin}`,
      translationId: `Ayat ke-${i} dari Surah ${surahMeta.nameLatin} (${surahMeta.nameTranslation}).`,
      audioUrl: getAyahAudioUrl(surahNumber, i, qariId),
    });
  }

  return {
    meta: surahMeta,
    verses: fallbackVerses,
  };
}

/**
 * Legacy wrapper for compatibility
 */
export async function fetchSurahVerses(surahNumber: number, qariId: string = 'misyari'): Promise<Ayah[]> {
  const data = await fetchSurahFullData(surahNumber, qariId);
  return data.verses;
}
