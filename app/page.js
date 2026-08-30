'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ThermalTelemetry from '@/components/ThermalTelemetry';
import CoolRoutePlanner from '@/components/CoolRoutePlanner';
import GreeningSimulator from '@/components/GreeningSimulator';
import HydrationSafetyWidget from '@/components/HydrationSafetyWidget';
import AiAdvisorWidget from '@/components/AiAdvisorWidget';
import ReportExporter from '@/components/ReportExporter';
import { Leaf, MapPin, Zap, TrendingDown, TreePine, Users, Building, AlertTriangle, CheckCircle, TrendingUp, Globe, Sparkles } from 'lucide-react';
const VerdantMap = dynamic(() => import('@/components/VerdantMap'), {
  ssr: false,
  loading: () => (
    <div className="glass-card rounded-2xl p-5 h-[480px] md:h-[520px] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <span className="text-base text-slate-600">Loading Interactive Map...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [apiStatus, setApiStatus] = useState('connecting');
  const [liveData, setLiveData] = useState({
    temp: 32.5,
    heatIndex: 36.2,
    humidity: 58,
    aqi: 45,
    pm25: 12.4,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setApiStatus('connected');
    fetchAirQuality();
    fetchFortyGuardData();
  }, []);

  const fetchAirQuality = async () => {
    try {
      const res = await fetch('/api/air-quality?lat=40.7128&lon=-74.0060');
      const data = await res.json();
      if (data.success) {
        setLiveData((prev) => ({
          ...prev,
          aqi: data.data.aqi,
          pm25: data.data.pm25,
          pm10: data.data.pm10,
        }));
      }
    } catch (e) {
      console.error('AQ fetch error:', e);
    }
  };

  const fetchFortyGuardData = async () => {
    try {
      const res = await fetch('/api/fortyguard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'env_params',
          params: { latitude: 40.7128, longitude: -74.006, temperature: 32 },
        }),
      });
      const data = await res.json();
      if (!data.success || !data.activityId) return;

      // Client-side polling — Vercel safe (har request chhoti)
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const sRes = await fetch(`/api/fortyguard?id=${data.activityId}`);
        const sData = await sRes.json();

        if (sData.status === 'completed' && sData.result?.locations?.[0]) {
          const params = sData.result.locations[0].parameters;
          setLiveData((prev) => ({
            ...prev,
            temp: params.apparent_temperature_celsius?.[0] || prev.temp,
            heatIndex: params.heat_index_celsius?.[0] || prev.heatIndex,
            humidity: params.relative_humidity_percent?.[0] || prev.humidity,
            wbgt: params.wet_bulb_temperature_celsius?.[0] || 28.5,
          }));
          break;
        }
        if (sData.status === 'failed') break;
      }
    } catch (e) {
      console.error('FortyGuard fetch error:', e);
    }
  };
  const handleLocationSelect = (point) => {
    setSelectedLocation(point);
    setLiveData((prev) => ({
      ...prev,
      temp: point.temp2m,
      heatIndex: point.heatIndex,
      humidity: point.humidity,
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950' : 'bg-[#F2F9F5]'
    }`}>
      <Header apiStatus={apiStatus} liveData={liveData} darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-glow" />
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold">
                Live Intelligence Feed
              </span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Urban Climate Dashboard
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-base text-slate-500">
                <MapPin className="w-5 h-5" />
                {selectedLocation ? (
                  <span className="font-mono font-semibold">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}</span>
                ) : (
                  <span className="font-semibold">New York City, NY</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-base text-slate-500">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Real-time</span>
              </div>
            </div>
          </div>
          <ReportExporter data={liveData} darkMode={darkMode} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Leaf}
            label="Vulnerability Index"
            value={calculateVulnerability(liveData)}
            unit="/100"
            color="from-emerald-500 to-teal-600"
            darkMode={darkMode}
          />
          <StatCard
            icon={TrendingDown}
            label="Thermal Exposure"
            value={liveData.temp?.toFixed(1) || '32.5'}
            unit="°C"
            color="from-rose-500 to-orange-600"
            darkMode={darkMode}
          />
          <StatCard
            icon={Zap}
            label="Heat Stress Score"
            value={calculateHeatStress(liveData)}
            unit="/100"
            color="from-amber-500 to-orange-500"
            darkMode={darkMode}
          />
          <StatCard
            icon={Leaf}
            label="Canopy Benefit"
            value="-2.4"
            unit="°C potential"
            color="from-emerald-600 to-green-700"
            darkMode={darkMode}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <VerdantMap onLocationSelect={handleLocationSelect} darkMode={darkMode} />
            <ThermalTelemetry liveData={liveData} darkMode={darkMode} />
          </div>

          <div className="space-y-6">
            <HydrationSafetyWidget darkMode={darkMode} />
            <GreeningSimulator darkMode={darkMode} />
            <CoolRoutePlanner darkMode={darkMode} />
          </div>
        </div>

        {/* Impact Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h3 className={`text-2xl md:text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Platform Impact Metrics
            </h3>
            <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-time urban climate intelligence powered by FortyGuard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactCard
              icon={TreePine}
              title="Trees Analyzed"
              value="12,847"
              subtitle="Urban canopy coverage"
              color="from-emerald-500 to-green-600"
              darkMode={darkMode}
            />
            <ImpactCard
              icon={Users}
              title="Workers Protected"
              value="3,421"
              subtitle="OSHA compliance"
              color="from-blue-500 to-cyan-600"
              darkMode={darkMode}
            />
            <ImpactCard
              icon={Building}
              title="Buildings Mapped"
              value="8,932"
              subtitle="Thermal profiling"
              color="from-purple-500 to-indigo-600"
              darkMode={darkMode}
            />
            <ImpactCard
              icon={Globe}
              title="CO₂ Offset"
              value="156 tons"
              subtitle="Annual potential"
              color="from-teal-500 to-emerald-600"
              darkMode={darkMode}
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h3 className={`text-2xl md:text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Key Features
            </h3>
            <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Comprehensive urban heat island mitigation toolkit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={AlertTriangle}
              title="Real-time Alerts"
              description="Instant heat stress warnings with OSHA-compliant recommendations"
              color="text-amber-500"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={CheckCircle}
              title="Precision Mapping"
              description="2-meter human-level temperature readings, not satellite estimates"
              color="text-emerald-500"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Predictive Analytics"
              description="AI-powered forecasting for urban heat mitigation planning"
              color="text-blue-500"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={TreePine}
              title="Greening Simulator"
              description="Model tree canopy impact on microclimate cooling"
              color="text-green-500"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={Users}
              title="Worker Safety"
              description="WBGT monitoring with automated rest/hydration schedules"
              color="text-orange-500"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={Globe}
              title="Air Quality Integration"
              description="Combined heat and pollution vulnerability assessment"
              color="text-purple-500"
              darkMode={darkMode}
            />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-12 py-8 border-t ${darkMode ? 'border-slate-800' : 'border-emerald-100'}`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  VERDANT 360
                </p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Hyperlocal Eco-Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-base">
              <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Built by
              </span>
              <span className={`font-bold ${darkMode ? 'text-amber-300' : 'text-amber-500'}`}>
                Tayyab
              </span>
              <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                for <span className="font-bold text-emerald-600">FortyGuard Hackathon '26</span>
              </span>
            </div>
          </div>
        </motion.footer>
      </main>

      <AiAdvisorWidget darkMode={darkMode} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit, color, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className={`rounded-2xl p-5 transition-all ${
        darkMode 
          ? 'bg-slate-900/50 border-2 border-slate-800 hover:bg-slate-800/50 hover:border-emerald-600 shadow-xl shadow-slate-950/50' 
          : 'glass-card hover:shadow-2xl hover:border-emerald-300 border-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className={`text-xs uppercase tracking-wider font-bold ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl md:text-4xl font-black ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          {value}
        </span>
        <span className="text-sm font-semibold text-slate-400">{unit}</span>
      </div>
    </motion.div>
  );
}

function ImpactCard({ icon: Icon, title, value, subtitle, color, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className={`rounded-2xl p-6 transition-all ${
        darkMode 
          ? 'bg-slate-900/50 border-2 border-slate-800 hover:border-emerald-600 shadow-xl' 
          : 'glass-card hover:shadow-2xl'
      }`}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-xl mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {title}
      </p>
      <p className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </p>
      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        {subtitle}
      </p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description, color, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`rounded-2xl p-6 transition-all ${
        darkMode 
          ? 'bg-slate-900/50 border-2 border-slate-800 hover:border-emerald-600 shadow-xl' 
          : 'glass-card hover:shadow-2xl'
      }`}
    >
      <Icon className={`w-10 h-10 ${color} mb-4`} />
      <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h4>
      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {description}
      </p>
    </motion.div>
  );
}

function calculateVulnerability(data) {
  const heatScore = Math.min(40, ((data.temp || 32) - 25) * 5);
  const aqiScore = Math.min(40, (data.aqi || 45) / 2.5);
  const humidityScore = Math.min(20, ((data.humidity || 58) - 40) / 2);
  return Math.round(heatScore + aqiScore + humidityScore);
}

function calculateHeatStress(data) {
  const temp = data.temp || 32;
  const humidity = data.humidity || 58;
  const wbgt = 0.567 * temp + 0.393 * (humidity / 100 * 6.105 * Math.exp(17.27 * temp / (237.7 + temp))) + 3.94;
  return Math.min(100, Math.round((wbgt - 20) * 5));
}