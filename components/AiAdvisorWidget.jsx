'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, AlertTriangle, TreePine, Route, MapPin, FileDown, RefreshCw } from 'lucide-react';

export default function AiAdvisorWidget({ liveData, darkMode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your VERDANT 360 Climate Advisor 🌿\n\nI'm powered by real-time AI and I know everything about this dashboard — Manhattan heat patterns, FortyGuard 2m readings, CoolPath routes, OSHA safety, and more.\n\n**Ask me anything about the current conditions!**",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your VERDANT 360 Climate Advisor 🌿\n\nI'm powered by real-time AI and I know everything about this dashboard — Manhattan heat patterns, FortyGuard 2m readings, CoolPath routes, OSHA safety, and more.\n\n**Ask me anything about the current conditions!**",
      },
    ]);
  };

  const promptChips = [
    { icon: Sparkles, label: 'What can you do?', color: 'text-emerald-500' },
    { icon: MapPin, label: 'Tell me about NYC coverage', color: 'text-blue-500' },
    { icon: AlertTriangle, label: 'Current heat risks?', color: 'text-orange-500' },
    { icon: TreePine, label: 'Best trees for NYC?', color: 'text-green-500' },
    { icon: Route, label: 'Coolest walking routes?', color: 'text-cyan-500' },
    { icon: FileDown, label: 'How does export work?', color: 'text-purple-500' },
    { icon: Sparkles, label: 'Analyze current report', color: 'text-emerald-600' },
  ];

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsLoading(true);

    // Seedha AI API par bhejte hain — koi artificial block nahi
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ message: msg, liveData }),
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.reply && data.reply.trim().length > 0) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        setIsLoading(false);
        return;
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (e) {
      // Sirf tab fallback chalega jab internet/API bilkul down ho
      console.error('AI API Error:', e);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', content: generateFallbackResponse(msg) }]);
        setIsLoading(false);
      }, 300);
    }
  };

  // Fallback sirf emergency cases ke liye (internet down, API error)
  const generateFallbackResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('analy') || q.includes('report') || q.includes('summar')) {
      const currentTemp = liveData?.temp || 32.5;
      const currentAQI = liveData?.aqi || 45;
      const currentHumidity = liveData?.humidity || 58;
      const riskLevel = currentTemp > 35 ? 'HIGH' : currentTemp > 30 ? 'MODERATE' : 'LOW';
      return `📊 **Real-Time Dashboard Analysis**\n\nBased on live telemetry from Manhattan:\n\n• 🌡️ **Thermal Status:** Apparent temperature is **${currentTemp}°C** with **${currentHumidity}%** humidity.\n• 🌬️ **Air Quality:** Current US AQI is **${currentAQI}**.\n• 🛡️ **OSHA Risk Level:** **${riskLevel}**.\n\n**💡 Actionable Insight:** Activate CoolPath™ shaded routing and enforce 15-minute hydration breaks.`;
    }

    if (q.includes('what can you do') || q.includes('about') || q.includes('help') || q.includes('feature') || q.includes('verdant')) {
      return '🌿 **VERDANT 360 — NYC Eco-Intelligence Platform**\n\n• 🗺️ Thermal Intelligence Map (Manhattan, live tiles)\n• 🌡️ FortyGuard 2m Telemetry gauges\n• 🚶 CoolPath™ shaded route comparer\n• 🌳 Tree Canopy Simulator\n• 🛡️ OSHA WBGT Work Safety timer\n• 🌬️ Live Air Quality layer\n• 📄 PDF / CSV / GeoJSON export with AI executive summary\n\nAsk me anything about Manhattan heat conditions!';
    }

    if (q.includes('city') || q.includes('cities') || q.includes('cover') || q.includes('where') || q.includes('location') || q.includes('nyc') || q.includes('new york') || q.includes('manhattan')) {
      return '🗽 **Coverage: New York City (Manhattan)**\n\nVERDANT 360 currently focuses on a hyperlocal live analysis zone in **Manhattan**, powered by FortyGuard 2m temperature intelligence at 20m² resolution.\n\nEvery circle on the Thermal Map is a live 2-meter human-level reading. Tap any tile for instant hyperlocal telemetry!';
    }

    if (q.includes('fortyguard') || q.includes('2m') || q.includes('satellite') || q.includes('accurate') || q.includes('precision')) {
      return '🛰️ **Why 2m Height Matters**\n\nFortyGuard measures temperature at **2-meter human level** — not satellite ground heat. Every readout carries the "HUMAN LEVEL" badge, so WBGT, heat index and CoolPath scores reflect what a person actually feels on a Manhattan street.';
    }

    if (q.includes('air') || q.includes('aqi') || q.includes('pollution') || q.includes('pm2.5') || q.includes('pm10')) {
      return '🌬️ **Live Air Quality Layer**\n\nReal-time PM2.5, PM10 and US AQI come from the **Open-Meteo Air Quality API**, fused with FortyGuard heat data into the combined Vulnerability Index (0-100) shown in the top stat cards.';
    }

    if (q.includes('export') || q.includes('download') || q.includes('pdf') || q.includes('csv') || q.includes('geojson')) {
      return '📄 **One-Click Civic Data Exporter**\n\nHit the green "Export Report" button (top right):\n\n• **PDF Report** — now includes an AI-generated Executive Summary\n• **CSV Data** — spreadsheet-ready telemetry\n• **GeoJSON** — raw thermal tiles for GIS tools\n\nPerfect for city councils and OSHA compliance filings!';
    }

    if (q.includes('osha') || q.includes('wbgt') || q.includes('worker') || q.includes('safety') || q.includes('rest')) {
      return '🛡️ **OSHA Work Safety Matrix**\n\nWBGT is computed from FortyGuard 2m apparent temp + humidity:\n\n• < 23°C LOW — normal work\n• 23-27°C MODERATE — scheduled hydration\n• 27-31°C HIGH — mandatory rest intervals\n• > 31°C EXTREME — work suspension advised\n\nThe live countdown timer enforces rest/hydration breaks.';
    }

    if (q.includes('risk') || q.includes('danger') || q.includes('heat') || q.includes('hot')) {
      return '🌡️ **Current Heat Assessment**\n\nLive 2m telemetry shows elevated heat stress over Manhattan. Recommendations:\n\n• 15-min rest every hour in shade\n• 250ml water every 15-20 min\n• Use CoolPath™ shaded routes\n• Check the OSHA widget for your WBGT zone';
    }

    if (q.includes('tree') || q.includes('plant') || q.includes('canopy') || q.includes('green')) {
      return '🌳 **Top Cooling Trees for NYC**\n\n• **London Plane** — broad canopy, drought tolerant\n• **Silver Birch** — fast-growing, reflective bark\n• **Norway Maple** — up to 6°C surface cooling\n• **Red Oak** — large spread, long-term benefit\n\nTry the Tree Canopy Simulator: 30%+ coverage gives up to -3.2°C cooling!';
    }

    if (q.includes('route') || q.includes('walk') || q.includes('cool path') || q.includes('coolpath')) {
      return '🚶 **CoolPath™ Recommendation**\n\nThe shaded corridor saves **-4.4°C** vs the direct route:\n\n• Direct: 2.4 km · 28 min · heat stress 78\n• CoolPath: 2.9 km · 35 min · heat stress 42\n\n68% canopy coverage gives continuous shade 11AM-3PM.';
    }

    if (q.includes('hydration') || q.includes('water') || q.includes('drink')) {
      return '💧 **OSHA Hydration Protocol**\n\n• Drink 250ml every 15-20 minutes\n• Electrolytes after 2 hours\n• Avoid caffeine & sugary drinks\n\nThe countdown timer in the OSHA widget automates your break schedule!';
    }

    return '🌿 I\'m the VERDANT 360 Climate Advisor for Manhattan, NYC. Try asking:\n\n• "What can you do?"\n• "Current heat risks?"\n• "Best trees for NYC?"\n• "Coolest walking routes?"\n• "How does export work?"\n• "Analyze current report"';
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
              
              {/* HEADER */}
              <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-emerald-100/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Climate Advisor</h3>
                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Gemini AI · Online
                    </p>
                  </div>
                </div>
                
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
                
                {/* AI TYPING INDICATOR */}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${
                      darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-emerald-100'
                    }`}>
                      <div className="flex items-center gap-1">
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                        disabled={isLoading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium disabled:opacity-50 ${
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
                    placeholder="Ask about NYC heat, routes, risks..."
                    disabled={isLoading}
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white/70 border-emerald-100'
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 disabled:opacity-50"
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
  
  const formatContent = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      
      // Bullet detect karein (• ya "- " ya "* ") — bold (**text**) ko bullet mat samjho
      const isBullet = trimmed.startsWith('•') || /^-\s/.test(trimmed) || /^\*\s/.test(trimmed);
      const cleanLine = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : trimmed;
      
      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      if (isBullet) {
        return (
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-emerald-500 font-bold flex-shrink-0">•</span>
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }
      
      return <div key={i} className="my-0.5">{formattedParts}</div>;
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-100' : 'bg-emerald-100'}`}>
        {isUser ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-emerald-600" />}
      </div>
      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
        isUser
          ? 'bg-emerald-600 text-white rounded-br-sm'
          : darkMode
          ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
          : 'bg-white border border-emerald-100 text-slate-800 rounded-bl-sm'
      }`}>
        {isUser ? message.content : formatContent(message.content)}
      </div>
    </motion.div>
  );
}
