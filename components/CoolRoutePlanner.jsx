'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Route, Sun, Trees, Clock, TrendingDown, Zap } from 'lucide-react';

export default function CoolRoutePlanner({ darkMode }) {
  const [origin, setOrigin] = useState('City Hall');
  const [destination, setDestination] = useState('Central Park');
  const [calculated, setCalculated] = useState(true);
const [isAnalyzing, setIsAnalyzing] = useState(false);
  const directRoute = { distance: 2.4, time: 28, heatStress: 78, avgTemp: 34.2, shadePercent: 12 };
  const coolPath = { distance: 2.9, time: 35, heatStress: 42, avgTemp: 29.8, shadePercent: 68, tempSaved: 4.4 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-900/50 border border-slate-800' : 'glass-card'}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl">
          <Route className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>CoolPath™ Route Comparer</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Shaded urban corridor optimization</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <RouteInput label="From" value={origin} onChange={setOrigin} darkMode={darkMode} />
        <RouteInput label="To" value={destination} onChange={setDestination} darkMode={darkMode} />
      </div>

     <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setCalculated(true);
      setIsAnalyzing(false);
    }, 1500); // 1.5 second ka fake loading time
  }}
  disabled={isAnalyzing}
  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base font-semibold shadow-lg shadow-emerald-500/30 mb-4 disabled:opacity-70"
>
  {isAnalyzing ? (
    <span className="flex items-center justify-center gap-2">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
      Analyzing Thermal Corridors...
    </span>
  ) : (
    "Analyze Routes"
  )}
</motion.button>
      {calculated && (
        <div className="space-y-3">
          <RouteCard title="Direct Route" icon={Sun} data={directRoute} color="from-orange-100 to-rose-100" textColor="text-orange-700" darkMode={darkMode} />
          <RouteCard title="CoolPath™ Shaded" icon={Trees} data={coolPath} color="from-emerald-100 to-teal-100" textColor="text-emerald-700" highlight darkMode={darkMode} />

          <div className={`p-3 rounded-xl border ${
            darkMode ? 'bg-emerald-950/40 border-emerald-800' : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200/60'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={`text-sm font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>Thermal Savings</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <SavingsMetric label="Temp Saved" value="-4.4°C" darkMode={darkMode} />
              <SavingsMetric label="Heat Stress" value="-46%" darkMode={darkMode} />
              <SavingsMetric label="Shade Gain" value="+56%" darkMode={darkMode} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function RouteInput({ label, value, onChange, darkMode }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[11px] uppercase tracking-wider font-semibold w-10 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white/70 border-emerald-100/80 text-slate-900'
        }`}
      />
    </div>
  );
}

function RouteCard({ title, icon: Icon, data, color, textColor, highlight, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative p-3 rounded-xl bg-gradient-to-br border ${color} ${
        highlight ? 'border-emerald-400 shadow-lg shadow-emerald-200/40' : 'border-transparent'
      }`}
    >
      {highlight && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase">
          Recommended
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${textColor}`} />
        <span className={`text-base font-bold ${textColor}`}>{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniStat icon={Route} label="Distance" value={`${data.distance} km`} />
        <MiniStat icon={Clock} label="Walk Time" value={`${data.time} min`} />
        <MiniStat icon={Zap} label="Heat Stress" value={data.heatStress} />
        <MiniStat icon={Trees} label="Shade" value={`${data.shadePercent}%`} />
      </div>
    </motion.div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-4 h-4 text-slate-500" />
      <div>
        <p className="text-[9px] uppercase text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function SavingsMetric({ label, value, darkMode }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{value}</p>
      <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>{label}</p>
    </div>
  );
}
