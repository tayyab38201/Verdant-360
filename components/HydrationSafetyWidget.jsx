'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Volume2, VolumeX } from 'lucide-react';

export default function HydrationSafetyWidget({ liveData, darkMode }) {
  const [wbgt, setWbgt] = useState(liveData?.wbgt || 28.5);
  const [restInterval, setRestInterval] = useState(45);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          triggerAlert();
          return restInterval * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, restInterval]);

  const triggerAlert = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const riskLevel = getWbgtRisk(wbgt);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-900/50 border border-slate-800' : 'glass-card'}`}
    >
      <audio ref={audioRef}>
        <source src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" type="audio/wav" />
      </audio>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl ${riskLevel.bgColor}`}>
            <Shield className={`w-6 h-6 ${riskLevel.color}`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>OSHA Work Safety</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>WBGT Risk Matrix</p>
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/70 border-emerald-100'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className={`w-5 h-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />}
        </button>
      </div>

      <div className={`p-4 rounded-xl border-2 mb-4 ${riskLevel.borderColor} ${riskLevel.bgColor} ${riskLevel.glow ? 'heat-risk-glow' : ''}`}>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Wet-Bulb Globe Temp</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskLevel.badgeColor}`}>{riskLevel.level}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-black ${riskLevel.textColor}`}>{wbgt.toFixed(1)}</span>
          <span className="text-sm text-slate-500">°C</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">{riskLevel.description}</p>
      </div>

      <div className="mb-3">
        <label className={`text-[11px] uppercase tracking-wider font-semibold mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          WBGT Adjustment
        </label>
        <input
          type="range"
          min="20"
          max="40"
          step="0.5"
          value={wbgt}
          onChange={(e) => setWbgt(Number(e.target.value))}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 ${
            darkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}
        />
      </div>

      <div className={`p-4 rounded-xl border mb-3 ${
        darkMode ? 'bg-slate-800/60 border-slate-700' : `bg-gradient-to-br ${riskLevel.timerBg} ${riskLevel.timerBorder}`
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className={`text-[11px] uppercase tracking-wider font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Next Rest/Hydration
            </span>
          </div>
          <button onClick={() => setIsRunning(!isRunning)} className="text-[10px] font-bold text-emerald-600 uppercase">
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
        <div className="text-center">
          <span className={`text-3xl font-black font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <IntervalButton minutes={30} current={restInterval} onClick={setRestInterval} darkMode={darkMode} />
        <IntervalButton minutes={45} current={restInterval} onClick={setRestInterval} darkMode={darkMode} />
        <IntervalButton minutes={60} current={restInterval} onClick={setRestInterval} darkMode={darkMode} />
      </div>
    </motion.div>
  );
}

function IntervalButton({ minutes, current, onClick, darkMode }) {
  const active = current === minutes;
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(minutes)}
      className={`py-2 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
          : darkMode
          ? 'bg-slate-800 text-slate-300 border border-slate-700'
          : 'bg-white/60 text-slate-600 border border-emerald-100'
      }`}
    >
      {minutes} min
    </motion.button>
  );
}

function getWbgtRisk(wbgt) {
  if (wbgt < 23) return { level: 'LOW', color: 'text-emerald-600', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', badgeColor: 'bg-emerald-100 text-emerald-700', timerBg: 'from-emerald-50 to-white', timerBorder: 'border-emerald-200', description: 'Normal work activities safe', glow: false };
  if (wbgt < 27) return { level: 'MODERATE', color: 'text-amber-600', textColor: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', badgeColor: 'bg-amber-100 text-amber-700', timerBg: 'from-amber-50 to-white', timerBorder: 'border-amber-200', description: 'Scheduled hydration required', glow: false };
  if (wbgt < 31) return { level: 'HIGH', color: 'text-orange-600', textColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', badgeColor: 'bg-orange-100 text-orange-700', timerBg: 'from-orange-50 to-white', timerBorder: 'border-orange-200', description: 'Mandatory rest intervals enforced', glow: true };
  return { level: 'EXTREME', color: 'text-red-600', textColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', badgeColor: 'bg-red-100 text-red-700', timerBg: 'from-red-50 to-white', timerBorder: 'border-red-200', description: 'Work suspension recommended', glow: true };
}
