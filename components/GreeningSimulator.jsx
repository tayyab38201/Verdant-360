'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trees, TrendingDown, Cloud, Wind } from 'lucide-react';

export default function GreeningSimulator({ darkMode }) {
  const [canopy, setCanopy] = useState(15);
  const baseTemp = 34.5;

  const coolingEffect = Math.min(3.2, canopy * 0.064);
  const newTemp = baseTemp - coolingEffect;
  const co2Offset = canopy * 12.4;
  const humidityGain = canopy * 0.3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-900/50 border border-slate-800' : 'glass-card'}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl">
          <Trees className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Tree Canopy Simulator</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Urban greening impact model</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Canopy Coverage</span>
          <span className="text-2xl font-black text-emerald-500">{canopy}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={canopy}
          onChange={(e) => setCanopy(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-amber-200 via-emerald-300 to-emerald-600 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500"
        />
        <div className="flex justify-between mt-1">
          <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>0% Baseline</span>
          <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>50% Max</span>
        </div>
      </div>

      <div className="space-y-3">
        <ImpactCard icon={TrendingDown} label="Temperature Drop" value={`-${coolingEffect.toFixed(1)}°C`} subtext={`New temp: ${newTemp.toFixed(1)}°C`} color="text-emerald-500" bgColor="bg-emerald-50" darkMode={darkMode} />
        <ImpactCard icon={Cloud} label="CO₂ Offset (Annual)" value={`${co2Offset.toFixed(0)} kg`} subtext="Per 1000m² area" color="text-blue-500" bgColor="bg-blue-50" darkMode={darkMode} />
        <ImpactCard icon={Wind} label="Humidity Regulation" value={`+${humidityGain.toFixed(1)}%`} subtext="Evapotranspiration benefit" color="text-cyan-500" bgColor="bg-cyan-50" darkMode={darkMode} />
      </div>

      <div className={`mt-4 p-3 rounded-xl border ${
        darkMode ? 'bg-emerald-950/40 border-emerald-800' : 'bg-gradient-to-br from-emerald-100/50 to-emerald-50 border-emerald-200/60'
      }`}>
        <p className={`text-xs font-medium leading-relaxed ${darkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>
          {canopy < 15
            ? 'Minimal canopy · Heat island effect remains severe'
            : canopy < 30
            ? 'Moderate greening · Noticeable microclimate improvement'
            : 'Dense urban forest · Significant cooling & air quality benefits'}
        </p>
      </div>
    </motion.div>
  );
}

function ImpactCard({ icon: Icon, label, value, subtext, color, bgColor, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        darkMode ? 'bg-slate-800/60 border-slate-700' : `${bgColor} border-emerald-100`
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1">
        <p className={`text-[10px] uppercase tracking-wider font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-lg font-black ${color}`}>{value}</p>
        <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</p>
      </div>
    </motion.div>
  );
}