'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Activity, TrendingUp } from 'lucide-react';

export default function ThermalTelemetry({ liveData, darkMode }) {
  const [temp, setTemp] = useState(32.5);
  const [humidity, setHumidity] = useState(58);
  const [heatIndex, setHeatIndex] = useState(36.2);

  useEffect(() => {
    if (liveData) {
      setTemp(liveData.temp || 32.5);
      setHumidity(liveData.humidity || 58);
      setHeatIndex(liveData.heatIndex || 36.2);
    }
  }, [liveData]);

  const tempData = [{ name: 'Temp', value: temp, fill: getTempColor(temp) }];
  const humidityData = [{ name: 'Humidity', value: humidity, fill: '#3b82f6' }];
  const heatIndexData = [{ name: 'HeatIndex', value: heatIndex, fill: '#f97316' }];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-900/50 border border-slate-800' : 'glass-card'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-xl">
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Thermal Telemetry</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>2m Human-Level Precision</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
          FortyGuard 2m
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GaugeCard data={tempData} max={50} value={temp} unit="°C" label="2m Apparent Temp" icon={Thermometer} color="text-rose-600" darkMode={darkMode} />
        <GaugeCard data={heatIndexData} max={55} value={heatIndex} unit="°C" label="Heat Index" icon={TrendingUp} color="text-orange-600" darkMode={darkMode} />
        <GaugeCard data={humidityData} max={100} value={humidity} unit="%" label="Relative Humidity" icon={Droplets} color="text-blue-600" darkMode={darkMode} />
      </div>

      <div className={`mt-4 p-3 rounded-xl border ${
        darkMode ? 'bg-emerald-950/40 border-emerald-800' : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200/60'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Activity className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span className={`text-sm font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>Heat Stress Assessment</span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
          {getHeatRisk(temp, heatIndex, humidity)}
        </p>
      </div>
    </motion.div>
  );
}

function GaugeCard({ data, max, value, unit, label, icon: Icon, color, darkMode }) {
  const percentage = (value / max) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-4 border transition-all duration-300 group cursor-pointer ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10' 
          : 'bg-white/60 border-emerald-100/80 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
            label.includes('Temp') ? 'from-rose-500 to-orange-600' : 
            label.includes('Heat') ? 'from-orange-500 to-amber-600' : 
            'from-blue-500 to-cyan-600'
          } flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <span className={`text-[11px] uppercase tracking-wider font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      </div>
      <div className="relative h-24 w-24 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={-180}>
            <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
            <RadialBar background={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter value={value} decimals={1} className={`text-xl font-black ${color}`} />
          <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{unit}</span>
        </div>
      </div>
      <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: data[0].fill }}
        />
      </div>
    </motion.div>
  );
}

function AnimatedCounter({ value, decimals = 0, className }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [value]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}

function getTempColor(temp) {
  if (temp < 20) return '#10b981';
  if (temp < 28) return '#f59e0b';
  if (temp < 35) return '#f97316';
  return '#ef4444';
}

function getHeatRisk(temp, heatIndex, humidity) {
  const wbgt = 0.567 * temp + 0.393 * (humidity / 100 * 6.105 * Math.exp(17.27 * temp / (237.7 + temp))) + 3.94;
  if (wbgt < 23) return 'Low Risk · Normal operations safe';
  if (wbgt < 27) return 'Moderate Risk · Monitor hydration & rest cycles';
  if (wbgt < 31) return 'High Risk · Mandatory cooling intervals required';
  return 'Extreme Risk · Immediate heat stress mitigation needed';
}
