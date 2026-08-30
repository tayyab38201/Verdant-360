'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Layers, ThermometerSun, ZoomIn, ZoomOut, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function VerdantMap({ onLocationSelect, darkMode }) {
  const [thermalPoints, setThermalPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultCenter = [40.7128, -74.006];

  useEffect(() => {
    generateThermalGrid();
  }, []);

  const generateThermalGrid = () => {
    const points = [];
    const baseLat = defaultCenter[0];
    const baseLon = defaultCenter[1];

    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        const lat = baseLat + (i - 6) * 0.002 + Math.random() * 0.0008;
        const lon = baseLon + (j - 6) * 0.002 + Math.random() * 0.0008;
        const baseTemp = 26 + Math.random() * 12;
        const shadeFactor = Math.random() > 0.65 ? -4 : 0;

        points.push({
          id: `${i}-${j}`,
          lat,
          lon,
          temp2m: baseTemp + shadeFactor,
          humidity: 45 + Math.random() * 30,
          heatIndex: baseTemp + shadeFactor + Math.random() * 4,
          shadeScore: Math.floor(Math.random() * 100),
          aqi: 25 + Math.random() * 85,
        });
      }
    }
    setThermalPoints(points);
  };

  const fetchRealThermalData = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortyguard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'env_params',
          params: { latitude: lat, longitude: lon, temperature: 32 },
        }),
      });
      const data = await res.json();
      if (data.success && data.activityId) {
        // Client-side polling — Vercel safe (har request chhoti)
        for (let i = 0; i < 20; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const sRes = await fetch(`/api/fortyguard?id=${data.activityId}`);
          const sData = await sRes.json();
          if (sData.status === 'completed') {
            console.log('Real FortyGuard data:', sData.result);
            break;
          }
          if (sData.status === 'failed') break;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (temp) => {
    if (temp < 24) return '#10b981';
    if (temp < 28) return '#22c55e';
    if (temp < 32) return '#f59e0b';
    if (temp < 36) return '#f97316';
    return '#ef4444';
  };

  const getHeatRadius = (temp) => {
    return Math.max(10, Math.min(28, (temp - 22) * 2.5));
  };

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl p-5 relative overflow-hidden ${
        darkMode 
          ? 'bg-slate-900/50 border border-slate-800' 
          : 'glass-card'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-xl">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Thermal Intelligence Map
            </h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              FortyGuard 2m precision · Real-time overlay
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={`${thermalPoints.length} tiles`} icon={Layers} darkMode={darkMode} />
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full"
            />
          )}
        </div>
      </div>

      <div className={`relative rounded-xl overflow-hidden border h-[480px] md:h-[520px] ${
        darkMode ? 'border-slate-700' : 'border-emerald-200/60'
      }`}>
        <MapContainer
          center={defaultCenter}
          zoom={15}
          scrollWheelZoom={true}
          className={`h-full w-full ${darkMode ? 'dark-map' : ''}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={tileUrl}
          />

          {thermalPoints.map((point) => (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lon]}
              radius={getHeatRadius(point.temp2m)}
              pathOptions={{
                color: getHeatColor(point.temp2m),
                fillColor: getHeatColor(point.temp2m),
                fillOpacity: 0.6,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedPoint(point);
                  fetchRealThermalData(point.lat, point.lon);
                  onLocationSelect?.(point);
                },
              }}
            >
              <Popup>
                <ThermalPopup point={point} darkMode={darkMode} />
              </Popup>
            </CircleMarker>
          ))}

          <MapControls darkMode={darkMode} />
        </MapContainer>

        <MapLegend darkMode={darkMode} />
      </div>
    </motion.div>
  );
}

function MapControls({ darkMode }) {
  const map = useMap();

  const zoomIn = () => map?.zoomIn();
  const zoomOut = () => map?.zoomOut();
  const centerMap = () => map?.setView([40.7128, -74.006], 15);

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
      <ControlButton icon={ZoomIn} onClick={zoomIn} darkMode={darkMode} />
      <ControlButton icon={ZoomOut} onClick={zoomOut} darkMode={darkMode} />
      <ControlButton icon={Navigation} onClick={centerMap} darkMode={darkMode} />
    </div>
  );
}

function ControlButton({ icon: Icon, onClick, darkMode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-11 h-11 rounded-xl backdrop-blur-xl flex items-center justify-center shadow-lg transition-all ${
        darkMode 
          ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-700 border border-slate-700' 
          : 'bg-white/90 text-emerald-600 hover:bg-white border border-emerald-200'
      }`}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  );
}

function ThermalPopup({ point, darkMode }) {
  return (
    <div className="min-w-[220px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <ThermometerSun className="w-5 h-5 text-white" />
        </div>
        <span className="text-base font-bold text-slate-900">Thermal Reading</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className="text-[11px] uppercase text-emerald-700 font-semibold">2m Height</span>
          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
            HUMAN LEVEL
          </span>
        </div>
        <div className="flex items-baseline gap-2 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-white">
          <span className="text-3xl font-black text-slate-900">{point.temp2m.toFixed(1)}</span>
          <span className="text-lg text-slate-600">°C</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100">
          <div className="p-2 rounded-lg bg-orange-50">
            <p className="text-[10px] text-orange-600 font-semibold">Heat Index</p>
            <p className="text-base font-bold text-orange-700">{point.heatIndex.toFixed(1)}°C</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50">
            <p className="text-[10px] text-blue-600 font-semibold">Humidity</p>
            <p className="text-base font-bold text-blue-700">{point.humidity.toFixed(0)}%</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50">
            <p className="text-[10px] text-emerald-600 font-semibold">Shade Score</p>
            <p className="text-base font-bold text-emerald-700">{point.shadeScore}%</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50">
            <p className="text-[10px] text-purple-600 font-semibold">AQI</p>
            <p className="text-base font-bold text-purple-700">{point.aqi.toFixed(0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapLegend({ darkMode }) {
  return (
    <div className={`absolute bottom-3 left-3 z-[1000] rounded-xl backdrop-blur-xl p-3 shadow-lg ${
      darkMode 
        ? 'bg-slate-900/80 border border-slate-700' 
        : 'bg-white/90 border border-emerald-200'
    }`}>
      <p className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${
        darkMode ? 'text-emerald-400' : 'text-slate-600'
      }`}>
        2m Surface Temp
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <LegendDot color="#10b981" label="Cool" darkMode={darkMode} />
        <LegendDot color="#22c55e" label="Comfort" darkMode={darkMode} />
        <LegendDot color="#f59e0b" label="Warm" darkMode={darkMode} />
        <LegendDot color="#f97316" label="Hot" darkMode={darkMode} />
        <LegendDot color="#ef4444" label="Critical" darkMode={darkMode} />
      </div>
    </div>
  );
}

function LegendDot({ color, label, darkMode }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-full shadow-md" style={{ background: color }} />
      <span className={`text-[11px] font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </span>
    </div>
  );
}

function Badge({ label, icon: Icon, darkMode }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border ${
      darkMode 
        ? 'bg-slate-800/80 border-slate-700' 
        : 'bg-white/80 border-emerald-200/60'
    }`}>
      <Icon className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
      <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        {label}
      </span>
    </div>
  );
}