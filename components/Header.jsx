'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Wifi, WifiOff, Thermometer, Droplets, Wind, Activity, Sun, Moon, Menu, X } from 'lucide-react';

export default function Header({ apiStatus, liveData, darkMode, setDarkMode }) {
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = apiStatus === 'connected';

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-900/90 border-emerald-900/30 shadow-2xl shadow-emerald-950/50' 
            : 'bg-white/90 border-emerald-100/60 shadow-xl shadow-emerald-950/5'
        }`}
      >
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="hover"
                className="relative flex items-center gap-3 cursor-pointer"
              >
                {/* ✨ Always-on soft glow - mobile par bhi zinda lage */}
                <div className="absolute left-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-400/40 blur-xl animate-pulse pointer-events-none" />

                {/* 🌿 Expanding glow rings on hover/tap */}
                <motion.span
                  variants={{
                    rest: { scale: 1, opacity: 0 },
                    hover: { scale: [1, 1.8], opacity: [0.7, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeOut' } },
                  }}
                  className="absolute left-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-emerald-400 pointer-events-none"
                />
                <motion.span
                  variants={{
                    rest: { scale: 1, opacity: 0 },
                    hover: { scale: [1, 1.5], opacity: [0.5, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.3 } },
                  }}
                  className="absolute left-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-teal-400 pointer-events-none"
                />

                {/* 🍃 Floating leaf particles on hover/tap */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    variants={{
                      rest: { y: 0, x: 0, opacity: 0, scale: 0.5 },
                      hover: {
                        y: [-4, -34 - i * 6],
                        x: [0, i % 2 === 0 ? -14 - i * 4 : 14 + i * 4],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1],
                        rotate: [0, i % 2 === 0 ? -45 : 45],
                        transition: { duration: 1.6, repeat: Infinity, delay: i * 0.25, ease: 'easeOut' },
                      },
                    }}
                    className="absolute left-4 md:left-5 text-emerald-500 pointer-events-none"
                  >
                    <Leaf className="w-3 h-3" />
                  </motion.span>
                ))}

                {/* ✨ Logo box with intense glow */}
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0, boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5)' },
                    hover: { scale: 1.12, rotate: [0, -8, 8, 0], boxShadow: '0 0 40px rgba(16, 185, 129, 0.9), 0 0 80px rgba(20, 184, 166, 0.5)' },
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 flex items-center justify-center"
                >
                  <motion.div
                    variants={{
                      rest: { rotate: 0 },
                      hover: { rotate: 360, transition: { duration: 2.5, repeat: Infinity, ease: 'linear' } },
                    }}
                  >
                    <Leaf className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
                  </motion.div>
                </motion.div>

                {/* 📱 Brand text - ab mobile par bhi dikhega */}
                <div className="block">
                  <h1 className={`text-lg md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    VERDANT <span className="text-emerald-600">360</span>
                  </h1>
                  <p className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                    Eco-Intelligence Platform
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="hidden lg:flex items-center gap-2 ml-4 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/20"
              >
                {isConnected ? (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-emerald-500 pulse-glow"
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                )}
                <span className={`text-sm font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  FortyGuard {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {liveData && (
                <div className="hidden md:flex items-center gap-2">
                  <QuickStat icon={Thermometer} label="2m" value={`${liveData.temp?.toFixed(1) || '—'}°`} color="text-rose-500" darkMode={darkMode} />
                  <QuickStat icon={Droplets} label="Hum" value={`${liveData.humidity?.toFixed(0) || '—'}%`} color="text-blue-500" darkMode={darkMode} />
                  <QuickStat icon={Wind} label="AQI" value={liveData.aqi?.toFixed(0) || '—'} color={getAqiColor(liveData.aqi)} darkMode={darkMode} />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all shadow-lg ${
                  darkMode 
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-yellow-500/30' 
                    : 'bg-emerald-50 text-slate-700 hover:bg-emerald-100 shadow-emerald-500/20'
                }`}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </motion.button>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${
                  darkMode ? 'bg-slate-800 shadow-slate-900/50' : 'bg-slate-100 shadow-slate-300/50'
                }`}
              >
                <Activity className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-mono font-bold ${darkMode ? 'text-emerald-300' : 'text-slate-600'}`}>
                  {mounted && currentTime ? currentTime.toLocaleTimeString('en-US', { hour12: false }) : '—:—:—'}
                </span>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-3 rounded-xl shadow-lg ${
                  darkMode ? 'bg-slate-800' : 'bg-slate-100'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`md:hidden overflow-hidden mt-4 pb-4 border-t ${
                  darkMode ? 'border-emerald-900' : 'border-emerald-100'
                }`}
              >
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {liveData && (
                    <>
                      <MobileStat icon={Thermometer} label="Temperature" value={`${liveData.temp?.toFixed(1) || '—'}°C`} color="text-rose-500" darkMode={darkMode} />
                      <MobileStat icon={Droplets} label="Humidity" value={`${liveData.humidity?.toFixed(0) || '—'}%`} color="text-blue-500" darkMode={darkMode} />
                      <MobileStat icon={Wind} label="Air Quality" value={liveData.aqi?.toFixed(0) || '—'} color={getAqiColor(liveData.aqi)} darkMode={darkMode} />
                      <MobileStat icon={Activity} label="Status" value={isConnected ? 'Live' : 'Connecting'} color="text-emerald-500" darkMode={darkMode} />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}

function QuickStat({ icon: Icon, label, value, color, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -4 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all shadow-lg ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-emerald-600 shadow-slate-900/50' 
          : 'bg-white/70 border-emerald-100 hover:bg-white hover:border-emerald-400 shadow-emerald-950/5'
      }`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
        <p className={`text-base font-bold ${color}`}>{value}</p>
      </div>
    </motion.div>
  );
}

function MobileStat({ icon: Icon, label, value, color, darkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-xl border-2 shadow-lg ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700 shadow-slate-900/50' 
          : 'bg-white border-emerald-100 shadow-emerald-950/5'
      }`}
    >
      <Icon className={`w-6 h-6 ${color} mb-2`} />
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}

function getAqiColor(aqi) {
  if (!aqi) return 'text-slate-500';
  if (aqi <= 50) return 'text-emerald-500';
  if (aqi <= 100) return 'text-amber-500';
  return 'text-rose-500';
}