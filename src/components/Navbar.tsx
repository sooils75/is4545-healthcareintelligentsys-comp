import React from 'react';
import { 
  Building2, 
  Layers, 
  Database, 
  Cpu, 
  FileCheck2, 
  Upload, 
  Download, 
  Activity, 
  Sparkles,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { DatasetPreset } from '../data/syntheticDatasets';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  datasets: DatasetPreset[];
  activeDatasetId: string;
  onSelectDataset: (id: string) => void;
  onOpenUploadModal: () => void;
  onExportCSV: () => void;
  totalRecordsCount: number;
  isOrchestrating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  datasets,
  activeDatasetId,
  onSelectDataset,
  onOpenUploadModal,
  onExportCSV,
  totalRecordsCount,
  isOrchestrating,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: Activity },
    { id: 'hierarchy', label: 'Agent Hierarchy & Monitor', icon: Layers },
    { id: 'explorer', label: 'Patient Data Explorer', icon: Database, badge: totalRecordsCount },
    { id: 'analysis', label: 'Multi-Agent Analysis', icon: Cpu, isAi: true },
    { id: 'decisions', label: 'Executive Decision Dashboard', icon: FileCheck2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0b101d] border-b border-slate-300/80 dark:border-slate-800 text-slate-800 dark:text-white shadow-xs dark:shadow-md transition-colors duration-200">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/20 text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  Hospital Patient Experience Intelligence
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-700/60">
                  AI Multi-Agent System
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Hierarchical Orchestration &bull; 6 Specialized Autonomous Agents &bull; Undergraduate AI Course
              </p>
            </div>
          </div>

          {/* Dataset Switcher, Actions & Theme Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Dataset Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-[#121a2d] rounded-lg p-1 border border-slate-300 dark:border-slate-700 text-xs shadow-2xs">
              <span className="text-slate-700 dark:text-slate-300 px-2 font-medium">Dataset:</span>
              <select
                value={activeDatasetId}
                onChange={(e) => onSelectDataset(e.target.value)}
                className="bg-white dark:bg-[#080d18] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-cyan-500 cursor-pointer font-medium shadow-xs"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.split(':')[0]} ({d.records.length} records)
                  </option>
                ))}
                {activeDatasetId === 'custom-uploaded' && (
                  <option value="custom-uploaded">Custom Uploaded CSV ({totalRecordsCount} records)</option>
                )}
              </select>
            </div>

            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-[#121a2d] dark:hover:bg-[#1a253e] dark:text-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
              title="Upload custom CSV dataset"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Upload CSV</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-[#121a2d] dark:hover:bg-[#1a253e] dark:text-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
              title="Download current dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-[#121a2d] dark:hover:bg-[#1a253e] dark:text-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-200 dark:border-slate-800/80 pt-1 -mb-px overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer rounded-t-md ${
                  isActive
                    ? 'border-cyan-600 dark:border-cyan-400 text-cyan-900 dark:text-cyan-200 bg-cyan-50/80 dark:bg-[#141e33] font-bold shadow-2xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive 
                      ? 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-200' 
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.isAi && isOrchestrating && (
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Running</span>
                  </span>
                )}
                {item.isAi && !isOrchestrating && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-900 dark:bg-purple-900/50 dark:text-purple-300 flex items-center space-x-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>6 Agents</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

