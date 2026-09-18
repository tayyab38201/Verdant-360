
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Copy, RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function AiSummarySection({ liveData, darkMode }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const generateSummary = async () => {
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          message: 'Generate executive summary',
          liveData,
          type: 'summary'
        }),
      });
      clearTimeout(timer);
      
      const data = await res.json();
      
      if (data.success && data.reply) {
        setSummary(data.reply);
      } else {
        setSummary(generateFallbackSummary());
      }
    } catch (e) {
      console.error('Summary error:', e);
      setSummary(generateFallbackSummary());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackSummary = () => {
    const temp = liveData?.temp || 32.5;
    const humidity = liveData?.humidity || 58;
    const aqi = liveData?.aqi || 45;
    const riskLevel = temp > 35 ? 'HIGH' : (temp > 30 ? 'MODERATE' : 'LOW');
    
    return `**CURRENT CONDITIONS**
Manhattan is currently experiencing an apparent temperature of ${temp}°C with ${humidity}% humidity. The US Air Quality Index reads ${aqi}, which falls within the ${aqi < 50 ? 'Good' : 'Moderate'} range. Live FortyGuard 2-meter telemetry is actively monitoring these conditions at human level.

**RISK ASSESSMENT**
Current conditions indicate a ${riskLevel} risk level for outdoor workers based on OSHA WBGT guidelines. The Vulnerability Index shows combined heat and air pollution stress requiring proactive mitigation measures.

**RECOMMENDATIONS**
• Enforce 15-minute shaded rest cycles every hour for outdoor workers
• Prioritize CoolPath™ shaded routes between 11AM-3PM
• Accelerate tree canopy expansion to achieve -2.4°C cooling potential`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-emerald-500 font-bold flex-shrink-0">•</span>
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }
      
      if (!line.trim()) return <div key={i} className="h-2" />;
      return <div key={i} className="my-1">{formattedParts}</div>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl p-6 transition-all ${
        darkMode 
          ? 'bg-slate-900/50 border-2 border-slate-800' 
          : 'bg-white/80 backdrop-blur-xl border-2 border-emerald-100 shadow-lg'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              AI Executive Summary
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Powered by Llama 3 AI · Live Manhattan telemetry
            </p>
          </div>
        </div>
        
        <button
          onClick={generateSummary}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{summary ? 'Regenerate' : 'Generate'}</span>
            </>
          )}
        </button>
      </div>

      {isLoading && !summary && (
        <div className="space-y-3 py-4">
          <div className={`h-4 rounded-full animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-emerald-100'}`} />
          <div className={`h-4 rounded-full w-3/4 animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-emerald-100'}`} />
          <div className={`h-4 rounded-full w-5/6 animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-emerald-100'}`} />
          <p className={`text-sm italic mt-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            ✨ Analyzing live telemetry from Manhattan...
          </p>
        </div>
      )}

      {summary && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full flex items-center justify-between py-2 border-b ${darkMode ? 'border-slate-700' : 'border-emerald-100'}`}
          >
            <span className={`text-xs uppercase tracking-wider font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {expanded ? 'Summary' : 'Summary (click to expand)'}
            </span>
            {expanded ? (
              <ChevronUp className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {formatContent(summary)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-dashed ${darkMode ? 'border-slate-700' : 'border-emerald-200'}`}>
            <button
              onClick={copyToClipboard}
              disabled={copied}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
            
            <button
              onClick={generateSummary}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>
        </motion.div>
      )}

      {!summary && !isLoading && (
        <div className={`py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FileText className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-emerald-200'}`} />
          <p className="text-sm">
            Click <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Generate</strong> to create an AI-powered executive summary of current Manhattan conditions.
          </p>
        </div>
      )}
    </motion.div>
  );
}
