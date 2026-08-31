'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, AlertTriangle, TreePine, Route, Droplet, MapPin, FileDown, Building2, RefreshCw } from 'lucide-react';

export default function AiAdvisorWidget({ darkMode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your VERDANT 360 Climate Advisor 🌿 I know everything about this platform — features, US city coverage, heat risks, cooling strategies & more. Ask away!",
    },
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);
  const isDragging = useRef(false);
  const [constraints, setConstraints] = useState({ left: -2000, right: 16, top: -2000, bottom: 16 });

  useEffect(() => {
    const update = () => {
      if (typeof window !== 'undefined') {
        setConstraints({
          left: -(window.innerWidth - 80),
          right: 16,
          top: -(window.innerHeight - 80),
          bottom: 16,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // 🔄 New Function: Clear Chat
  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your VERDANT 360 Climate Advisor 🌿 I know everything about this platform — features, US city coverage, heat risks, cooling strategies & more. Ask away!",
      },
    ]);
  };

  const promptChips = [
    { icon: Sparkles, label: 'What can you do?', color: 'text-emerald-500' },
    { icon: MapPin, label: 'Which cities are covered?', color: 'text-blue-500' },
    { icon: AlertTriangle, label: 'Current heat risks?', color: 'text-orange-500' },
    { icon: TreePine, label: 'Best trees for cooling?', color: 'text-green-500' },
    { icon: Route, label: 'Coolest walking routes?', color: 'text-cyan-500' },
    { icon: FileDown, label: 'How does export work?', color: 'text-purple-500' },
  ];

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: generateResponse(msg) }]);
    }, 700);
  };

  const generateResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('what can you do') || q.includes('about') || q.includes('project') || q.includes('platform') || q.includes('feature') || q.includes('verdant') || q.includes('what is this') || q.includes('kya hai') || q.includes('how does this work') || q.includes('help') || q.includes('dashboard') || q.includes('urban climate') || q.includes('what do') || q.includes('what does')) {
      return '🌿 **VERDANT 360 — Hyperlocal Eco-Intelligence Platform**\n\nI can guide you through everything on this dashboard:\n\n• 🗺️ Thermal Intelligence Map — live 2m heat tiles, tap any circle for hyperlocal readings\n• 🌡️ Thermal Telemetry — apparent temp, heat index & humidity radial gauges\n• 🚶 CoolPath™ — shaded route vs direct route comparison with temperature saved\n• 🌳 Tree Canopy Simulator — model greening impact (-0.5°C to -3.2°C cooling)\n• 🛡️ OSHA Work Safety — WBGT risk matrix + live rest/hydration countdown\n• 🌬️ Air Quality Layer — live PM2.5, PM10 & US AQI via Open-Meteo\n• 📊 Vulnerability Index — combined Heat & Air Pollution score (0-100)\n• 📄 Report Exporter — one-click PDF / CSV / GeoJSON civic downloads\n\nAsk me about any feature, heat risks, or covered cities!';
    }

    if (q.includes('city') || q.includes('cities') || q.includes('location') || q.includes('where') || q.includes('cover') || q.includes('area') || q.includes('country') || q.includes('kaun sa')) {
      return '🇺 **Coverage: United States Urban Areas**\n\nVERDANT 360 runs on FortyGuard\'s 2m temperature intelligence across US metros. The live demo is centered on **New York City (Manhattan)**.\n\nFully analyzable cities include:\n• Los Angeles • Chicago • Houston • Phoenix\n• Philadelphia • Miami • Dallas • Atlanta\n• Boston • Seattle • Detroit • Washington DC\n\nTap any thermal tile on the map to get a hyperlocal reading for that exact spot — each one triggers a live FortyGuard 2m analysis!';
    }

    if (q.includes('fortyguard') || q.includes('2m') || q.includes('satellite') || q.includes('accurate') || q.includes('precision')) {
      return '🛰️ **Why 2m Height Matters**\n\nFortyGuard measures temperature at **2-meter human level** — not satellite ground heat. This is 115x more accurate for human heat-stress decisions.\n\nEvery readout on this dashboard carries the glowing "HUMAN LEVEL" badge to distinguish it from satellite estimates. That\'s why our WBGT, heat index and CoolPath scores reflect what a person *actually feels* on the street.';
    }

    if (q.includes('air') || q.includes('aqi') || q.includes('pollution') || q.includes('pm2.5') || q.includes('pm10')) {
      return '🌬️ **Live Air Quality Layer**\n\nWe fetch real-time PM2.5, PM10 and US AQI from the **Open-Meteo Air Quality API**, then fuse it with FortyGuard heat data into a combined **Heat & Air Pollution Vulnerability Index (0-100)** — shown in the top stat cards.\n\nCurrent live values appear in the header AQI badge. Green = good, amber = moderate, red = unhealthy.';
    }

    if (q.includes('export') || q.includes('report') || q.includes('download') || q.includes('pdf') || q.includes('csv') || q.includes('geojson')) {
      return '📄 **One-Click Civic Data Exporter**\n\nHit the green "Export Report" button (top right) and choose:\n\n• **PDF Report** — formatted civic report with thermal tables\n• **CSV Data** — spreadsheet-ready telemetry\n• **GeoJSON** — raw thermal map tiles for GIS tools\n\nPerfect for city councils, OSHA compliance filings & hackathon judging!';
    }

    if (q.includes('osha') || q.includes('wbgt') || q.includes('worker') || q.includes('safety') || q.includes('rest')) {
      return '🛡️ **OSHA Work Safety Matrix**\n\nThe Hydration Safety widget computes **Wet-Bulb Globe Temperature (WBGT)** from FortyGuard 2m apparent temp + humidity:\n\n• < 23°C LOW — normal work\n• 23-27°C MODERATE — scheduled hydration\n• 27-31°C HIGH — mandatory rest intervals\n• > 31°C EXTREME — work suspension advised\n\nThe live countdown timer enforces rest/hydration breaks with audio alerts.';
    }

    if (q.includes('risk') || q.includes('danger') || q.includes('heat') || q.includes('hot')) {
      return '🌡️ **Current Heat Assessment**\n\nThe 2m apparent temperature reads ~34°C with 58% humidity → heat index ~36°C. This is **MODERATE-HIGH risk** for outdoor workers.\n\nRecommendations:\n• 15-min rest every hour in shade\n• 250ml water every 15-20 min\n• Use CoolPath™ shaded routes for walking\n• Check the OSHA widget for your WBGT zone';
    }

    if (q.includes('tree') || q.includes('plant') || q.includes('canopy') || q.includes('green')) {
      return '🌳 **Top Urban Cooling Trees (US Cities)**\n\n• **London Plane** — broad canopy, drought tolerant\n• **Silver Birch** — fast-growing, reflective bark\n• **Norway Maple** — up to 6°C surface cooling\n• **Red Oak** — large spread, long-term benefit\n\nTry the **Tree Canopy Simulator**: drag the slider to 30%+ and watch up to -3.2°C microclimate cooling plus CO₂ offset estimates update live!';
    }

    if (q.includes('route') || q.includes('walk') || q.includes('cool path') || q.includes('coolpath')) {
      return '🚶 **CoolPath™ Recommendation**\n\nThe shaded corridor via Park Avenue saves **-4.4°C** vs the direct route:\n\n• Direct: 2.4 km · 28 min · 78 heat stress\n• CoolPath: 2.9 km · 35 min · 42 heat stress\n\n68% canopy coverage gives continuous shade during peak hours (11AM-3PM). Open the CoolPath™ comparer in the right panel to see side-by-side telemetry!';
    }

    if (q.includes('hydration') || q.includes('water') || q.includes('drink')) {
      return '💧 **OSHA Hydration Protocol**\n\nAt current WBGT (~28.5°C, HIGH risk):\n\n• Drink 250ml every 15-20 minutes\n• Electrolyte replacement after 2 hours\n• Avoid caffeine & sugary drinks\n• Pale-yellow urine = well hydrated\n\nThe countdown timer in the OSHA widget automates your break schedule!';
    }

    return '🤔 I\'m scoped to the VERDANT 360 universe — US cities & everything on this dashboard! Try asking:\n\n• "What can you do?"\n• "Which cities are covered?"\n• "How does FortyGuard 2m work?"\n• "Current heat risks?"\n• "How does export work?"\n• "Best trees for cooling?"';
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        whileDrag={{ scale: 1.2 }}
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={constraints}
        onDragStart={() => (isDragging.current = true)}
        onDragEnd={() => setTimeout(() => (isDragging.current = false), 150)}
        onClick={() => {
          if (!isDragging.current) setOpen(true);
        }}
        style={{ touchAction: 'none' }}
        title="Drag me anywhere!"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/40 z-40 cursor-grab active:cursor-grabbing"
      >
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50"
          >
            <div className={`h-full flex flex-col shadow-2xl border-l ${
              darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/95 backdrop-blur-xl border-emerald-200/60'
            }`}>
              
              {/* HEADER: Ab isme Clear Chat button bhi hai */}
              <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-emerald-100/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Climate Advisor</h3>
                    <p className="text-[11px] text-emerald-500 font-medium">VERDANT 360 Expert · Online</p>
                  </div>
                </div>
                
                {/* Buttons Group */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={clearChat} 
                    title="Clear Chat"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                  </button>
                  <button 
                    onClick={() => setOpen(false)} 
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    <X className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                  </button>
                </div>
              </div>

              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg} darkMode={darkMode} />
                ))}
              </div>

              {messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    Quick Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {promptChips.map((chip, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(chip.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-emerald-100 text-slate-700'
                        }`}
                      >
                        <chip.icon className={`w-4 h-4 ${chip.color}`} />
                        {chip.label}
      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-emerald-100/60'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about the platform, cities, heat..."
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white/70 border-emerald-100'
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend()}
                    className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatMessage({ message, darkMode }) {
  const isUser = message.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-100' : 'bg-emerald-100'}`}>
        {isUser ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-emerald-600" />}
      </div>
      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
        isUser
          ? 'bg-emerald-600 text-white rounded-br-sm'
          : darkMode
          ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
          : 'bg-white border border-emerald-100 text-slate-800 rounded-bl-sm'
      }`}>
        {message.content}
      </div>
    </motion.div>
  );
}
