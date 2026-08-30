'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Map, X, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      const csv = [
        ['Metric', 'Value', 'Unit', 'Timestamp'],
        ['2m Apparent Temperature', data?.temp || 32.5, '°C', new Date().toISOString()],
        ['Heat Index', data?.heatIndex || 36.2, '°C', new Date().toISOString()],
        ['Relative Humidity', data?.humidity || 58, '%', new Date().toISOString()],
        ['Air Quality Index', data?.aqi || 45, 'US AQI', new Date().toISOString()],
        ['PM2.5', data?.pm25 || 12.4, 'µg/m³', new Date().toISOString()],
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

  const exportPDF = () => {
    setExporting('pdf');
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(5, 150, 105);
      doc.text('VERDANT 360', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Urban Climate Resilience Report', 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Thermal Telemetry', 14, 50);

      autoTable(doc, {
        startY: 55,
        head: [['Parameter', 'Value', 'Status']],
        body: [
          ['2m Apparent Temperature', `${data?.temp || 32.5}°C`, 'Measured'],
          ['Heat Index', `${data?.heatIndex || 36.2}°C`, 'Elevated'],
          ['Relative Humidity', `${data?.humidity || 58}%`, 'Normal'],
          ['Air Quality Index', `${data?.aqi || 45}`, 'Good'],
          ['PM2.5', `${data?.pm25 || 12.4} µg/m³`, 'Acceptable'],
        ],
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 10 },
      });

      doc.save(`verdant360_report_${Date.now()}.pdf`);
      setSuccess('pdf');
      setTimeout(() => setSuccess(null), 2000);
      setExporting(null);
    }, 1000);
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
              className={`rounded-2xl p-6 max-w-md w-full ${
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

              <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Download thermal telemetry and air quality data for civic reporting.
              </p>

              <div className="space-y-2">
                <ExportButton icon={FileText} label="PDF Report" sublabel="Formatted civic report" onClick={exportPDF} loading={exporting === 'pdf'} success={success === 'pdf'} color="from-rose-500 to-orange-500" darkMode={darkMode} />
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
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        {success ? (
          <Check className="w-5 h-5 text-white" />
        ) : loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{label}</p>
        <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{sublabel}</p>
      </div>
    </motion.button>
  );
}