import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Layers, 
  ArrowRight,
  Database
} from 'lucide-react';
import { parseCSV, generateSampleCSV } from '../utils/csvHelper';
import { PatientRecord } from '../types/healthcare';
import { DatasetPreset } from '../data/syntheticDatasets';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (records: PatientRecord[], filename: string) => void;
  datasets: DatasetPreset[];
  onSelectDataset: (id: string) => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  datasets,
  onSelectDataset,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<{ 
    records: PatientRecord[]; 
    errors: string[]; 
    filename: string;
    validationReport?: import('../utils/csvHelper').DatasetValidationReport;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setUploadError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setUploadError('Please select a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { records, errors, validationReport } = parseCSV(text);
        if (records.length === 0) {
          setUploadError('No records could be parsed. Check that your CSV contains data rows.');
          return;
        }
        setParseResult({ records, errors, filename: file.name, validationReport });
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse CSV file.');
      }
    };
    reader.onerror = () => setUploadError('Error reading file from disk.');
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmUpload = () => {
    if (!parseResult) return;
    onUploadSuccess(parseResult.records, parseResult.filename);
    onClose();
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hospital_patient_experience_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0e1626] border-2 border-slate-300 dark:border-slate-750 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#121c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-slate-300 dark:border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-700/60 flex items-center justify-center text-cyan-800 dark:text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Healthcare Dataset (CSV)</h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Import synthetic or clinical patient experience survey records for multi-agent evaluation.
            </p>
          </div>
        </div>

        {/* Tab / Option: Upload CSV vs Choose Synthetic Preset */}
        <div className="space-y-6">
          {/* File Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
              dragActive ? 'border-cyan-600 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-[#121c2e]'
            }`}
          >
            <FileSpreadsheet className="w-10 h-10 text-cyan-700 dark:text-cyan-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Drag & Drop your CSV file here, or{' '}
              <label className="text-cyan-800 dark:text-cyan-400 hover:underline cursor-pointer font-bold">
                browse files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
              Auto-maps fields: <code className="text-slate-900 dark:text-slate-200 font-bold">patient_id</code>, <code className="text-slate-900 dark:text-slate-200 font-bold">department</code>, <code className="text-slate-900 dark:text-slate-200 font-bold">feedback_text</code>, <code className="text-slate-900 dark:text-slate-200 font-bold">satisfaction_score</code>, <code className="text-slate-900 dark:text-slate-200 font-bold">wait_time_minutes</code>.
            </p>

            <div className="mt-3">
              <button
                onClick={handleDownloadSample}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#080d18] hover:bg-slate-100 dark:hover:bg-[#1a263d] text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                <span>Download Sample CSV Template</span>
              </button>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/50 text-xs text-rose-950 dark:text-rose-200 flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parseResult && (
            <div className="bg-slate-50 dark:bg-[#121c2e] border border-emerald-300 dark:border-emerald-500/50 rounded-xl p-4 space-y-3 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Successfully Parsed: {parseResult.filename}</span>
                </span>
                <span className="text-xs text-slate-800 dark:text-slate-200 font-mono font-bold">
                  {parseResult.records.length} records ready
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto rounded border border-slate-300 dark:border-slate-750 text-[11px] font-mono bg-white dark:bg-[#080d18] p-2 text-slate-900 dark:text-slate-300">
                <div className="text-slate-600 dark:text-slate-400 mb-1 font-sans font-bold">First 3 preview rows:</div>
                {parseResult.records.slice(0, 3).map((r, i) => (
                  <div key={i} className="truncate border-b border-slate-200 dark:border-slate-800 py-1">
                    {r.patient_id} | {r.department} | CSAT: {r.satisfaction_score} | Wait: {r.wait_time_minutes}m | "{r.feedback_text.slice(0, 50)}..."
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setParseResult(null)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#080d18] text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1a263d] border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Load this Dataset into App
                </button>
              </div>
            </div>
          )}

          {/* Quick Pre-loaded Synthetic Presets Selector */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-2 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
              <span>Or Choose a Pre-Loaded Synthetic Healthcare Dataset:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {datasets.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelectDataset(d.id);
                    onClose();
                  }}
                  className="text-left p-3 rounded-xl bg-slate-50 dark:bg-[#121c2e] hover:bg-white dark:hover:bg-[#18243b] border border-slate-300 dark:border-slate-750 hover:border-cyan-500/60 transition group cursor-pointer shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                    {d.name.split(':')[0]}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5 line-clamp-2 font-medium">
                    {d.subtitle}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-800 dark:text-cyan-400 mt-2 block">
                    {d.records.length} records
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
