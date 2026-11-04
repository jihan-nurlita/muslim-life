import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { HalanganModal } from './components/modals/HalanganModal';
import { SplashScreen } from './components/common/SplashScreen';

// Views
import { HomeView } from './views/HomeView';
import { PrayerTimesView } from './views/PrayerTimesView';
import { QuranView } from './views/QuranView';
import { DzikirView } from './views/DzikirView';
import { AsmaulHusnaView } from './views/AsmaulHusnaView';
import { HabitTrackerView } from './views/HabitTrackerView';
import { CalendarView } from './views/CalendarView';
import { StatisticsView } from './views/StatisticsView';
import { NotesView } from './views/NotesView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab, halanganModalPrayer, setHalanganModalPrayer } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'beranda':
        return <HomeView />;
      case 'sholat':
        return <PrayerTimesView />;
      case 'quran':
        return <QuranView />;
      case 'dzikir':
        return <DzikirView />;
      case 'asmaul-husna':
        return <AsmaulHusnaView />;
      case 'habit':
        return <HabitTrackerView />;
      case 'kalender':
        return <CalendarView />;
      case 'statistik':
        return <StatisticsView />;
      case 'catatan':
        return <NotesView />;
      case 'pengaturan':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50/70 overflow-hidden font-jakarta text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Scrollable Viewport */}
        <main
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 w-full"
          id="main-viewport"
        >
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Halangan Modal for Prayers */}
      {halanganModalPrayer && (
        <HalanganModal
          prayerName={halanganModalPrayer}
          onClose={() => setHalanganModalPrayer(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      <AnimatePresence>
        {showSplash && <SplashScreen key="app-splash" />}
      </AnimatePresence>
      <MainContent />
    </AppProvider>
  );
}
