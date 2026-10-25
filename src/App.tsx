/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { AgentHierarchyWorkflow } from './components/AgentHierarchyWorkflow';
import { PatientDataExplorer } from './components/PatientDataExplorer';
import { MultiAgentAnalysis } from './components/MultiAgentAnalysis';
import { ExecutiveDecisionDashboard } from './components/ExecutiveDecisionDashboard';
import { DataUploadModal } from './components/DataUploadModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { SYNTHETIC_DATASETS, DatasetPreset } from './data/syntheticDatasets';
import { calculateStatistics } from './utils/statistics';
import { exportToCSV } from './utils/csvHelper';
import { PatientRecord, FullOrchestrationResult, AgentExecutionLog } from './types/healthcare';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Datasets State
  const [datasets] = useState<DatasetPreset[]>(SYNTHETIC_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string>('metropolitan-ed-surge');
  const [records, setRecords] = useState<PatientRecord[]>(() => {
    const preset = SYNTHETIC_DATASETS.find(d => d.id === 'metropolitan-ed-surge');
    return preset ? preset.records : [];
  });
  const [customDatasetName, setCustomDatasetName] = useState<string>('');

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectedAgentId, setInspectedAgentId] = useState<string | null>(null);

  // Orchestration State
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<FullOrchestrationResult | null>(null);
  const [orchestrationLogs, setOrchestrationLogs] = useState<AgentExecutionLog[]>([]);
  const [systemAlert, setSystemAlert] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  // Filter state for navigation to explorer
  const [explorerFilter, setExplorerFilter] = useState<string | undefined>(undefined);

  // Dynamic Calculated Statistics (Deterministic arithmetic, never hallucinated)
  const calculatedStats = useMemo(() => {
    return calculateStatistics(records);
  }, [records]);

  // Dataset Switcher Handler
  const handleSelectDataset = (datasetId: string) => {
    setActiveDatasetId(datasetId);
    if (datasetId === 'custom-uploaded') {
      // Retain custom uploaded
      return;
    }
    const preset = datasets.find(d => d.id === datasetId);
    if (preset) {
      setRecords(preset.records);
      setLatestAnalysis(null);
      setOrchestrationLogs([]);
      setSystemAlert({ message: `Switched active dataset to "${preset.name}".`, type: 'info' });
    }
  };

  // Upload Custom Dataset Handler
  const handleUploadSuccess = (uploadedRecords: PatientRecord[], filename: string) => {
    setActiveDatasetId('custom-uploaded');
    setCustomDatasetName(filename);
    setRecords(uploadedRecords);
    setLatestAnalysis(null);
    setOrchestrationLogs([]);
    setSystemAlert({ message: `Loaded custom dataset "${filename}" with ${uploadedRecords.length} records.`, type: 'success' });
  };

  // Export Current Dataset as CSV
  const handleExportCSV = () => {
    const csvData = exportToCSV(records);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDatasetId}_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Record Update Handler (e.g. human review flag, notes)
  const handleUpdateRecord = (updated: PatientRecord) => {
    setRecords(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  };

  // Full Multi-Agent Orchestration Run
  const handleRunOrchestration = async (params: {
    taskType: string;
    managerObjective: string;
    executionMode: 'parallel' | 'sequential';
    targetRecords?: PatientRecord[];
  }) => {
    setIsOrchestrating(true);
    setSystemAlert(null);
    setOrchestrationLogs([]);

    const activeDataset = params.targetRecords && params.targetRecords.length > 0 ? params.targetRecords : records;
    const activeStats = params.targetRecords && params.targetRecords.length > 0 ? calculateStatistics(params.targetRecords) : calculatedStats;

    try {
      const response = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset: activeDataset,
          taskType: params.taskType,
          managerObjective: params.managerObjective,
          executionMode: params.executionMode,
          calculatedStats: activeStats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const result: FullOrchestrationResult = await response.json();
      setLatestAnalysis(result);
      setOrchestrationLogs(result.logs || []);
      setSystemAlert({
        message: `Multi-Agent Orchestration completed on ${activeDataset.length} cases in ${(result.totalDurationMs / 1000).toFixed(1)}s across ${result.orchestrationPlan.agentsSelected.length} agents.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Orchestration failed:', err);
      setSystemAlert({
        message: `Orchestration error: ${err.message || 'Failed to complete execution.'}`,
        type: 'error',
      });
    } finally {
      setIsOrchestrating(false);
    }
  };

  // Standalone Agent Execution Runner
  const handleRunStandaloneAgent = async (agentId: string) => {
    let endpoint = '/api/agents/agent1-feedback';
    let body: any = { records };

    if (agentId === 'agent1') {
      endpoint = '/api/agents/agent1-feedback';
      body = { records };
    } else if (agentId === 'agent2') {
      endpoint = '/api/agents/agent2-monitoring';
      body = { records, calculatedStats };
    } else if (agentId === 'agent3') {
      endpoint = '/api/agents/agent3-triage';
      body = { records };
    } else if (agentId === 'agent6') {
      endpoint = '/api/agents/agent6-communication';
      body = { records };
    } else if (agentId === 'agent5') {
      endpoint = '/api/agents/agent5-analytics';
      body = { calculatedStats, agent1Output: latestAnalysis?.agent1, agent2Output: latestAnalysis?.agent2, agent3Output: latestAnalysis?.agent3, agent6Output: latestAnalysis?.agent6 };
    } else if (agentId === 'agent4') {
      // Run full orchestrator
      await handleRunOrchestration({
        taskType: 'full_audit',
        managerObjective: 'Hospital leadership decision support review',
        executionMode: 'parallel',
      });
      return latestAnalysis?.agent4;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Failed to execute ${agentId}`);
    }

    return await response.json();
  };

  // Single Record Agent Tester
  const handleRunSingleAgentOnRecord = async (agentId: string, record: PatientRecord) => {
    let endpoint = '/api/agents/agent1-feedback';
    if (agentId === 'agent3') endpoint = '/api/agents/agent3-triage';
    if (agentId === 'agent6') endpoint = '/api/agents/agent6-communication';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [record] }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Agent call failed');
    }

    return await response.json();
  };

  const currentDatasetDisplayName = activeDatasetId === 'custom-uploaded'
    ? `Custom Uploaded (${customDatasetName})`
    : datasets.find(d => d.id === activeDatasetId)?.name || 'Active Healthcare Dataset';

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-900 dark:bg-[#070b13] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        onSelectDataset={handleSelectDataset}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onExportCSV={handleExportCSV}
        totalRecordsCount={records.length}
        isOrchestrating={isOrchestrating}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Toast / System Alert Banner */}
        {systemAlert && (
          <div className={`mb-6 p-4 rounded-xl border shadow-sm flex items-center justify-between text-xs transition font-medium ${
            systemAlert.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-500/50 dark:text-rose-200' :
            systemAlert.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-emerald-200' :
            'bg-cyan-50 border-cyan-300 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-500/50 dark:text-cyan-200'
          }`}>
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{systemAlert.message}</span>
            </div>
            <button
              onClick={() => setSystemAlert(null)}
              className="p-1 hover:opacity-75 transition cursor-pointer rounded hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Section 1: Executive Overview */}
        {activeSection === 'overview' && (
          <ExecutiveOverview
            records={records}
            calculatedStats={calculatedStats}
            latestAnalysis={latestAnalysis}
            onNavigateToAnalysis={() => setActiveSection('analysis')}
            onNavigateToExplorer={(filter) => {
              setExplorerFilter(filter);
              setActiveSection('explorer');
            }}
            datasetName={currentDatasetDisplayName}
          />
        )}

        {/* Section 2: Agent Hierarchy and Orchestration Monitor */}
        {activeSection === 'hierarchy' && (
          <AgentHierarchyWorkflow
            records={records}
            calculatedStats={calculatedStats}
            latestAnalysis={latestAnalysis}
            orchestrationLogs={orchestrationLogs}
            isOrchestrating={isOrchestrating}
            onRunOrchestration={handleRunOrchestration}
            onResetWorkflow={() => {
              setLatestAnalysis(null);
              setOrchestrationLogs([]);
              setSystemAlert({ message: 'Orchestration workflow reset to Not Started.', type: 'info' });
            }}
            onOpenAgentModal={(agentId) => setInspectedAgentId(agentId)}
            onRunStandaloneAgent={handleRunStandaloneAgent}
          />
        )}

        {/* Section 3: Patient Data Explorer */}
        {activeSection === 'explorer' && (
          <PatientDataExplorer
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onRunSingleAgentOnRecord={handleRunSingleAgentOnRecord}
            initialFilter={explorerFilter}
            datasetName={currentDatasetDisplayName}
            onUploadDataset={handleUploadSuccess}
            onRunMultiAgentAnalysis={(selectedSubset) => {
              const target = selectedSubset && selectedSubset.length > 0 ? selectedSubset : records;
              setActiveSection('analysis');
              handleRunOrchestration({
                taskType: 'full_audit',
                managerObjective: `Hospital management decision audit on ${target.length} patient cases`,
                executionMode: 'parallel',
                targetRecords: target,
              });
            }}
            isOrchestrating={isOrchestrating}
          />
        )}

        {/* Section 4: Multi-Agent Analysis Cockpit */}
        {activeSection === 'analysis' && (
          <MultiAgentAnalysis
            records={records}
            calculatedStats={calculatedStats}
            latestAnalysis={latestAnalysis}
            onRunOrchestration={handleRunOrchestration}
            isOrchestrating={isOrchestrating}
            orchestrationLogs={orchestrationLogs}
            onResetWorkflow={() => {
              setLatestAnalysis(null);
              setOrchestrationLogs([]);
              setSystemAlert({ message: 'Orchestration workflow reset to Not Started.', type: 'info' });
            }}
          />
        )}

        {/* Section 5: Executive Decision Dashboard */}
        {activeSection === 'decisions' && (
          <ExecutiveDecisionDashboard
            records={records}
            calculatedStats={calculatedStats}
            latestAnalysis={latestAnalysis}
            onUpdateRecord={handleUpdateRecord}
            datasetName={currentDatasetDisplayName}
          />
        )}
      </main>

      {/* CSV Upload & Preset Modal */}
      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        datasets={datasets}
        onSelectDataset={handleSelectDataset}
      />

      {/* Deep Agent Specification & Standalone Test Modal */}
      <AgentDetailModal
        agentId={inspectedAgentId}
        onClose={() => setInspectedAgentId(null)}
        onRunStandalone={handleRunStandaloneAgent}
      />

      {/* Footer */}
      <footer className="border-t border-slate-300/80 bg-white dark:border-slate-800 dark:bg-[#0a0f1d] py-6 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Hospital Patient Experience Intelligence System &bull; Hierarchical Multi-Agent Orchestration
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            Powered by Google Gemini 3.8 Flash &bull; Deterministic Telemetry &bull; Safety Hardened
          </span>
        </div>
      </footer>
    </div>
  );
}

