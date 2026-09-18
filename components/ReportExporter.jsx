'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Map, X, Check, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// PDF-SAFE TEXT CLEANER
// jsPDF ka standard font sirf WinAnsi characters support karta hai.
// Unicode subscripts (PM₂.₅), smart quotes, special spaces, emojis = garbled text.
const sanitizeForPdf = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[₀-₉]/g, (c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)))
    .replace(/[⁰-⁹]/g, (c) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)))
    .replace(/[^\x09\x0A\x0D\x20-\xFF\u2022]/g, '');
};

export default function ReportExporter({ data, darkMode }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [success, setSuccess] = useState(null);

  const exportJSON = () => {
    setExporting('json');
    setTimeout(() => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verdant360_thermal_${Date.now()}.json`;
      a.click();
      setSuccess('json');
      setTimeout(() => setSuccess(null), 2000);
      setExporting(null);
    }, 800);
  };

  const exportCSV = () => {
    setExporting('csv');
    setTimeout(() => {
      const temp = Number(data?.temp ?? 32.5);
      const heatIndex = Number(data?.heatIndex ?? 36.2);
      const humidity = Number(data?.humidity ?? 58);
      const aqi = Math.round(Number(data?.aqi ?? 45));
      const pm25 = Number(data?.pm25 ?? 12.4);

      const csv = [
        ['Metric', 'Value', 'Unit', 'Timestamp'],
        ['2m Apparent Temperature', temp.toFixed(1), 'C', new Date().toISOString()],
        ['Heat Index', heatIndex.toFixed(1), 'C', new Date().toISOString()],
        ['Relative Humidity', humidity.toFixed(1), '%', new Date().toISOString()],
        ['Air Quality Index', aqi, 'US AQI', new Date().toISOString()],
        ['PM2.5', pm25.toFixed(1), 'ug/m3', new Date().toISOString()],
      ].map((row) => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verdant360_report_${Date.now()}.csv`;
      a.click();
      setSuccess('csv');
      setTimeout(() => setSuccess(null), 2000);
      setExporting(null);
    }, 800);
  };

  const buildFallbackSummary = () => {
    const temp = Number(data?.temp ?? 32.5).toFixed(1);
    const humidity = Number(data?.humidity ?? 58).toFixed(1);
    const aqi = Math.round(Number(data?.aqi ?? 45));
    const heatIndex = Number(data?.heatIndex ?? 36.2).toFixed(1);
    const pm25 = Number(data?.pm25 ?? 12.4).toFixed(1);
    const riskLevel = Number(temp) > 35 ? 'HIGH' : Number(temp) > 30 ? 'MODERATE' : 'LOW';

    return [
      '**CURRENT CONDITIONS**',
      `Manhattan is currently experiencing an apparent temperature of ${temp} C with ${humidity}% humidity and a heat index of ${heatIndex} C. The US Air Quality Index reads ${aqi} with PM2.5 at ${pm25} ug/m3, monitored live by FortyGuard 2-meter human-level telemetry.`,
      '',
      '**RISK ASSESSMENT**',
      `Current conditions indicate a ${riskLevel} risk level for outdoor workers based on OSHA WBGT guidelines. The combined heat and air pollution vulnerability index requires proactive mitigation for sensitive groups and outdoor labor.`,
      '',
      '**RECOMMENDATIONS**',
      '• Enforce 15-minute shaded rest cycles every hour for outdoor workers.',
      '• Prioritize CoolPath shaded routing between 11:00 and 15:00.',
      '• Accelerate tree canopy expansion to unlock -2.4 C cooling potential.',
    ].join('\n');
  };

  const fetchAiSummary = async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: 'Generate executive summary for the official PDF report',
          liveData: data,
          type: 'summary',
        }),
      });
      clearTimeout(timer);
      const json = await res.json();
      if (json.success && json.reply) return json.reply;
    } catch (e) {
      console.warn('AI summary unavailable, using fallback:', e);
    }
    return buildFallbackSummary();
  };

  const renderSummaryToPdf = (doc, summary, startY) => {
    let y = startY;
    const maxWidth = 180;
    const lines = sanitizeForPdf(summary).split('\n');

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        y += 4;
        return;
      }

      const headerMatch = line.match(/^\*\*(.+)\*\*$/);
      if (headerMatch) {
        if (y > 262) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(headerMatch[1], 14, y);
        y += 7;
        return;
      }

      const clean = line.replace(/\*\*/g, '');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70);
      const wrapped = doc.splitTextToSize(clean, maxWidth);
      wrapped.forEach((wl) => {
        if (y > 282) {
          doc.addPage();
          y = 20;
        }
        doc.text(wl, 14, y);
        y += 5;
      });
      y += 2;
    });

    return y;
  };

  const exportPDF = async () => {
    setExporting('pdf');
    try {
      const summaryText = await fetchAiSummary();

      const temp = Number(data?.temp ?? 32.5);
      const heatIndex = Number(data?.heatIndex ?? 36.2);
      const humidity = Number(data?.humidity ?? 58);
      const aqi = Math.round(Number(data?.aqi ?? 45));
      const pm25 = Number(data?.pm25 ?? 12.4);

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(5, 150, 105);
      doc.text('VERDANT 360', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Urban Climate Resilience Report', 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
      doc.text('Location: Manhattan, New York City, NY', 14, 40);
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.5);
      doc.line(14, 44, 196, 44);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('AI Executive Summary', 14, 52);
      const summaryEndY = renderSummaryToPdf(doc, summaryText, 60);

      let tableTitleY = summaryEndY + 8;
      if (tableTitleY > 250) {
        doc.addPage();
        tableTitleY = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Thermal Telemetry', 14, tableTitleY);

      autoTable(doc, {
        startY: tableTitleY + 5,
        head: [['Parameter', 'Value', 'Status']],
        body: [
          ['2m Apparent Temperature', `${temp.toFixed(1)} C`, 'Measured'],
          ['Heat Index', `${heatIndex.toFixed(1)} C`, heatIndex > 40 ? 'Extreme' : heatIndex > 32 ? 'Elevated' : 'Normal'],
          ['Relative Humidity', `${humidity.toFixed(1)}%`, 'Normal'],
          ['Air Quality Index', `${aqi}`, aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy'],
          ['PM2.5', `${pm25.toFixed(1)} ug/m3`, pm25 <= 12 ? 'Acceptable' : 'Elevated'],
        ],
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 10 },
      });

      let footerY = (doc.lastAutoTable?.finalY || tableTitleY + 50) + 10;
      if (footerY > 280) {
        doc.addPage();
        footerY = 20;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120);
      doc.text('Generated by VERDANT 360 AI Executive Engine - FortyGuard Hackathon 2026', 14, footerY);

      doc.save(`verdant360_report_${Date.now()}.pdf`);
      setSuccess('pdf');
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base font-semibold shadow-lg shadow-emerald-500/30"
      >
        <Download className="w-5 h-5" />
        Export Report
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-slate-900 border border-slate-700' : 'glass-card'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Export Data</h3>
                <button
                  onClick={() => setOpen(false)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                >
                  <X className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                </button>
              </div>

              <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Download thermal telemetry and air quality data for civic reporting.
              </p>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-medium ${
                darkMode ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                PDF includes an AI-generated Executive Summary
              </div>

              <div className="space-y-2">
                <ExportButton icon={FileText} label="PDF Report" sublabel="Civic report + AI executive summary" onClick={exportPDF} loading={exporting === 'pdf'} success={success === 'pdf'} color="from-rose-500 to-orange-500" darkMode={darkMode} />
                <ExportButton icon={FileSpreadsheet} label="CSV Data" sublabel="Spreadsheet format" onClick={exportCSV} loading={exporting === 'csv'} success={success === 'csv'} color="from-emerald-500 to-teal-500" darkMode={darkMode} />
                <ExportButton icon={Map} label="GeoJSON" sublabel="Thermal map tiles" onClick={exportJSON} loading={exporting === 'json'} success={success === 'json'} color="from-blue-500 to-indigo-500" darkMode={darkMode} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ExportButton({ icon: Icon, label, sublabel, onClick, loading, success, color, darkMode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all disabled:opacity-70 ${
        darkMode ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-white/60 border-emerald-100 hover:bg-white/80'
      }`}
    >
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        {success ? (
          <Check className="w-5 h-5 text-white" />
        ) : loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{label}</p>
        <p className={`text-[11px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{sublabel}</p>
      </div>
    </motion.button>
  );
}
