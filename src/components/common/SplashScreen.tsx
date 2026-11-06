import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <motion.div
      id="app-splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none px-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center text-center"
      >
        {/* Logo Aplikasi Al-Qur'an */}
        <div
          id="splash-quran-logo"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl sm:rounded-[28px] md:rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xl shadow-emerald-700/15"
        >
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white stroke-[1.8]" />
        </div>

        {/* Nama Aplikasi Tepat di Bawah Logo */}
        <h1
          id="splash-app-name"
          className="mt-4 sm:mt-5 md:mt-6 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight"
        >
          MuslimLife
        </h1>
      </motion.div>
    </motion.div>
  );
};