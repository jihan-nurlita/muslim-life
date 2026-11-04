export interface IslamicArticle {
  id: string;
  title: string;
  category: 'Kajian' | 'Panduan Sholat' | 'Keutamaan' | 'Fiqih' | 'Adab & Akhlak';
  summary: string;
  content: string;
  readTime: string;
  author: string;
  tags: string[];
}

export const ISLAMIC_ARTICLES: IslamicArticle[] = [
  {
    id: 'keutamaan-sholat-berjamaah',
    title: 'Keutamaan dan Keberkahan Sholat Fardhu Berjamaah di Masjid',
    category: 'Keutamaan',
    summary: 'Rasulullah SAW menjelaskan bahwa sholat berjamaah melipatgandakan pahala hingga 27 derajat dibandingkan sholat sendirian.',
    content: 'Sholat berjamaah memiliki kedudukan yang sangat agung dalam Islam. Selain mendapatkan pahala 27 derajat, setiap langkah menuju masjid dihitung sebagai penggugur dosa dan peningkat derajat di sisi Allah SWT.',
    readTime: '3 menit',
    author: 'Kajian Fiqih Ibadah',
    tags: ['sholat', 'berjamaah', 'masjid', 'pahala'],
  },
  {
    id: 'adab-dzikir-doa',
    title: 'Adab dan Waktu Mustajab dalam Berdzikir serta Berdoa',
    category: 'Adab & Akhlak',
    summary: 'Tata cara menghadirkan hati, mengangkat tangan, memuji Allah, dan bersholawat saat memanjatkan permohonan doa.',
    content: 'Di antara waktu mustajab berdoa adalah sepertiga malam terakhir, antara adzan dan iqamah, saat sujud dalam sholat, hari Jumat setelah ashar, dan ketika turun hujan.',
    readTime: '4 menit',
    author: 'Kajian Tazkiyatun Nafs',
    tags: ['doa', 'dzikir', 'adab', 'mustajab'],
  },
  {
    id: 'keutamaan-puasa-senin-kamis',
    title: 'Hikmah dan Keutamaan Puasa Sunnah Senin - Kamis',
    category: 'Keutamaan',
    summary: 'Hari Senin dan Kamis adalah hari di mana amal-amal manusia diangkat dan diperlihatkan kepada Allah SWT.',
    content: 'Rasulullah SAW bersabda: "Amal-amal manusia diperiksa di hadapan Allah pada setiap hari Senin dan Kamis. Maka aku menyukai saat amalku diperiksa aku dalam keadaan berpuasa." (HR. Tirmidzi).',
    readTime: '3 menit',
    author: 'Kajian Sunnah Nabawiyah',
    tags: ['puasa', 'senin kamis', 'sunnah', 'amal'],
  },
  {
    id: 'tadabbur-al-quran',
    title: 'Panduan Praktis Mentadabburi dan Menghidupkan Al-Qur\'an',
    category: 'Kajian',
    summary: 'Bukan sekadar membaca lisan, melainkan merenungkan makna ayat dan mengamalkannya dalam kehidupan sehari-hari.',
    content: 'Tadabbur Al-Qur\'an membawa ketenangan jiwa (sakinah), membuka wawasan hati, dan menjadi petunjuk terang dalam setiap permasalahan hidup.',
    readTime: '5 menit',
    author: 'Ulumul Qur\'an',
    tags: ['quran', 'tadabbur', 'tilawah', 'pedoman'],
  },
  {
    id: 'panduan-qiyamul-lail',
    title: 'Panduan Qiyamul Lail & Sholat Tahajjud Bagi Pemula',
    category: 'Panduan Sholat',
    summary: 'Langkah demi langkah memulai kebiasaan sholat malam, rahasia istiqomah, dan doa-doa ma\'tsur tahajjud.',
    content: 'Sholat Tahajjud adalah kemuliaan seorang mukmin. Dilaksanakan setelah tidur malam minimal dua rakaat hingga witir, diakhiri dengan istighfar di waktu sahar.',
    readTime: '4 menit',
    author: 'Panduan Ibadah Praktis',
    tags: ['tahajjud', 'sholat malam', 'qiyamullail', 'witir'],
  },
  {
    id: 'sedekah-pembuka-rezeki',
    title: 'Keajaiban Sedekah Subuh dan Pembuka Pintu Keberkahan',
    category: 'Keutamaan',
    summary: 'Dua malaikat mendoakan orang yang bersedekah di waktu subuh agar Allah mengganti hartanya dengan keberkahan berlipat.',
    content: 'Setiap pagi hari turun dua malaikat, salah satunya berdoa: "Ya Allah, berikanlah ganti bagi orang yang berinfak," dan yang lain berdoa: "Ya Allah, berikanlah kebinasaan bagi orang yang menahan hartanya." (HR. Bukhari & Muslim).',
    readTime: '3 menit',
    author: 'Kajian Muamalah & Tazkiyah',
    tags: ['sedekah', 'infaq', 'subuh', 'rezeki'],
  },
  {
    id: 'keutamaan-asmaul-husna',
    title: 'Meneladani dan Berdoa dengan 99 Asmaul Husna',
    category: 'Kajian',
    summary: 'Mengenal sifat-sifat keagungan Allah SWT melalui nama-nama terindah untuk memperkuat keimanan dan tawakal.',
    content: 'Allah mempunyai Asmaul Husna, maka bermohonlah kepada-Nya dengan menyebut Asmaul Husna itu (QS. Al-A\'raf: 180). Menghafal dan memahami maknanya dijanjikan surga oleh Rasulullah SAW.',
    readTime: '4 menit',
    author: 'Kajian Aqidah & Asma',
    tags: ['asmaul husna', 'nama allah', 'tauhid', 'doa'],
  },
];
