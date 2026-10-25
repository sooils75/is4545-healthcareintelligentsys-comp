import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Layers, 
  Brain, 
  FileText, 
  ShieldAlert, 
  Activity, 
  RefreshCw,
  Terminal,
  Eye,
  Zap,
  Split,
  MessageSquare,
  Search,
  Check,
  AlertTriangle,
  Send,
  HelpCircle
} from 'lucide-react';
import { 
  PatientRecord, 
  CalculatedStatistics, 
  FullOrchestrationResult, 
  AgentExecutionLog 
} from '../types/healthcare';
import { 
  AGENT_1_PROMPT, 
  AGENT_2_PROMPT, 
  AGENT_3_PROMPT, 
  AGENT_4_PROMPT, 
  AGENT_5_PROMPT, 
  AGENT_6_PROMPT 
} from '../prompts/agentPrompts';

import { AgentOrchestrationMonitor } from './AgentOrchestrationMonitor';

interface MultiAgentAnalysisProps {
  records: PatientRecord[];
  calculatedStats: CalculatedStatistics;
  latestAnalysis: FullOrchestrationResult | null;
  onRunOrchestration: (params: { taskType: string; managerObjective: string; executionMode: 'parallel' | 'sequential' }) => Promise<void>;
  isOrchestrating: boolean;
  orchestrationLogs: AgentExecutionLog[];
  onResetWorkflow?: () => void;
}

export const MultiAgentAnalysis: React.FC<MultiAgentAnalysisProps> = ({
  records,
  calculatedStats,
  latestAnalysis,
  onRunOrchestration,
  isOrchestrating,
  orchestrationLogs,
  onResetWorkflow,
}) => {
  const [selectedTask, setSelectedTask] = useState<string>('full_audit');
  const [managerObjective, setManagerObjective] = useState<string>('Conduct a rigorous cross-departmental audit of patient experience, identify systemic bottlenecks, triage high-severity complaints, and formulate executive interventions.');
  const [executionMode, setExecutionMode] = useState<'parallel' | 'sequential'>('parallel');

  // Active Results Tab
  const [activeTab, setActiveTab] = useState<'monitor' | 'agent4' | 'agent1' | 'agent2' | 'agent3' | 'agent6' | 'agent5' | 'student_lab' | 'execution_log'>('agent4');

  // Student Lab Selected Agent
  const [inspectedAgentLab, setInspectedAgentLab] = useState<'agent4' | 'agent1' | 'agent2' | 'agent3' | 'agent6' | 'agent5'>('agent4');

  const taskPresets = [
    {
      id: 'full_audit',
      name: 'Comprehensive Hospital Enterprise Audit',
      description: 'Activates all 6 agents: Sentiment, Bottlenecks, Severity Triage, Communication Quality, and Analytics Synthesis.',
      defaultObjective: 'Conduct a rigorous cross-departmental audit of patient experience, identify systemic bottlenecks, triage high-severity complaints, and formulate executive interventions.',
    },
    {
      id: 'ed_surge',
      name: 'Emergency Department Boarding & Triage Audit',
      description: 'Specializes on ED overcrowding, triage acuity delays, ambulance diversions, and walkout (LWBS) risks.',
      defaultObjective: 'Investigate acute Emergency Department surge impacts, boarding delays, triage misclassification risks, and patient safety compromises.',
    },
    {
      id: 'discharge_safety',
      name: 'Inpatient Discharge, Medication Safety & Communication',
      description: 'Audits post-surgical handoffs, medication reconciliation errors, and nurse call response latency.',
      defaultObjective: 'Audit inpatient discharge transitions, identify polypharmacy and medication instruction hazards, and improve patient-centered health literacy.',
    },
    {
      id: 'triage_complaints',
      name: 'High-Severity Grievance & Sentinel Event Triage',
      description: 'Prioritizes Level 3 and Level 4 complaints requiring immediate human risk management review.',
      defaultObjective: 'Isolate and triage severe complaints, categorize regulatory hazards, and establish urgent service recovery protocols.',
    },
    {
      id: 'communication_audit',
      name: 'Patient Communication & Health Literacy Audit',
      description: 'Evaluates discharge paperwork for medical jargon, reading level, clarity, empathy, and actionability.',
      defaultObjective: 'Evaluate patient-facing instructions across clinical wards, eliminate harmful medical jargon, and provide plain-language rewrites.',
    },
    {
      id: 'custom',
      name: 'Custom Hospital Manager Inquiry',
      description: 'Input any specific management objective or operational inquiry for autonomous agent orchestration.',
      defaultObjective: '',
    },
  ];

  const handleSelectPreset = (taskId: string) => {
    setSelectedTask(taskId);
    const preset = taskPresets.find(p => p.id === taskId);
    if (preset && taskId !== 'custom') {
      setManagerObjective(preset.defaultObjective);
    } else if (taskId === 'custom') {
      setManagerObjective('');
    }
  };

  const handleStartRun = () => {
    onRunOrchestration({
      taskType: selectedTask,
      managerObjective: managerObjective.trim() || 'Comprehensive patient experience evaluation',
      executionMode,
    });
  };

  const agentPromptsMap: Record<string, string> = {
    agent1: AGENT_1_PROMPT,
    agent2: AGENT_2_PROMPT,
    agent3: AGENT_3_PROMPT,
    agent4: AGENT_4_PROMPT,
    agent5: AGENT_5_PROMPT,
    agent6: AGENT_6_PROMPT,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cockpit Header & Execution Trigger */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md relative overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-800 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Section 4 &bull; Multi-Agent Orchestration Cockpit</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hospital Manager Autonomous Analysis Console
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Agent 4 coordinates specialized autonomous agents (1, 2, 3, 6), passes completed findings to Agent 5 for quantitative synthesis, and formulates executive decisions.
            </p>
          </div>

          {/* Trigger Button & Mode */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-[#080d18] p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setExecutionMode('parallel')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition font-semibold cursor-pointer ${
                  executionMode === 'parallel'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Parallel Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('sequential')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition font-semibold cursor-pointer ${
                  executionMode === 'sequential'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Sequential Pipeline</span>
              </button>
            </div>

            <button
              onClick={handleStartRun}
              disabled={isOrchestrating}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-cyan-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isOrchestrating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Orchestrating Agents...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Multi-Agent Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Task Objective Configuration */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-1.5">
              Select Orchestration Task Preset:
            </label>
            <select
              value={selectedTask}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              {taskPresets.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {taskPresets.find(p => p.id === selectedTask)?.description}
            </p>
          </div>

          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-1.5">
              Hospital Manager Objective / Query (Received by Agent 4):
            </label>
            <div className="relative">
              <input
                type="text"
                value={managerObjective}
                onChange={(e) => setManagerObjective(e.target.value)}
                placeholder="E.g., Investigate high wait times and severe complaints in Emergency Department..."
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AGENT STATE CARDS FEED */}
      {/* 6-STEP HIERARCHICAL ORCHESTRATION PIPELINE VISUAL STEPPER */}
      {(isOrchestrating || orchestrationLogs.length > 0) && (
        <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-5 shadow-xs dark:shadow-md space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400 flex items-center space-x-2">
                <Terminal className="w-4 h-4" />
                <span>Hierarchical Multi-Agent Orchestration Sequence (Steps 1 &rarr; 6)</span>
              </h2>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                Executable agent delegation and result transfer: Agent 4 plans &rarr; Agents 1 & 3 run in parallel &rarr; Agent 2 monitors patterns with prior findings &rarr; Agent 6 audits communication &rarr; Agent 5 synthesizes empirical KPIs &rarr; Agent 4 recommends management actions.
              </p>
            </div>
            {latestAnalysis && !isOrchestrating && (
              <span className="text-xs text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-600/50 flex items-center space-x-1 shrink-0 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Hierarchical Execution Succeeded ({(latestAnalysis.totalDurationMs / 1000).toFixed(1)}s)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              { 
                step: 1, 
                agentId: 'agent4', 
                title: 'Step 1: Planning', 
                agentName: 'Agent 4 (Orchestrator)', 
                role: 'Interprets request & devises delegation plan',
                handoff: 'Outputs plan & names required specialists'
              },
              { 
                step: 2, 
                agentId: 'agent1', 
                title: 'Step 2: Parallel Dispatch', 
                agentName: 'Agents 1 & 3 (Parallel)', 
                role: 'Feedback sentiment & complaint severity triage',
                handoff: 'Outputs sentiment, themes & Level 1-4 severities'
              },
              { 
                step: 3, 
                agentId: 'agent2', 
                title: 'Step 3: Pattern Audit', 
                agentName: 'Agent 2 (Monitor)', 
                role: 'Evaluates bottlenecks using Agent 1 & 3 results',
                handoff: 'Consumes Agent 1 themes + Agent 3 severities'
              },
              { 
                step: 4, 
                agentId: 'agent6', 
                title: 'Step 4: Comm Quality', 
                agentName: 'Agent 6 (Comm Evaluator)', 
                role: 'Audits discharge instructions for health literacy',
                handoff: 'Scores readability & provides plain rewrites'
              },
              { 
                step: 5, 
                agentId: 'agent5', 
                title: 'Step 5: Executive Analytics', 
                agentName: 'Agent 5 (Analytics)', 
                role: 'Integrates all specialist outputs + verified KPIs',
                handoff: 'Consumes Agents 1, 3, 2, 6 with verified data'
              },
              { 
                step: 6, 
                agentId: 'agent4', 
                title: 'Step 6: Management Action', 
                agentName: 'Agent 4 (Decision Support)', 
                role: 'Reviews synthesis, top alert & 2-3 actions',
                handoff: 'Enforces human review flags on critical cases'
              },
            ].map(stage => {
              const matchingLogs = orchestrationLogs.filter(l => 
                stage.step === 2 
                  ? (l.agentId === 'agent1' || l.agentId === 'agent3')
                  : l.agentId === stage.agentId && (stage.step === 1 ? l.stepNumber === 1 || l.stepName?.includes('Step 1') : stage.step === 6 ? l.stepNumber === 6 || l.stepName?.includes('Step 6') : true)
              );
              const latestLog = matchingLogs[matchingLogs.length - 1];
              const isRunning = isOrchestrating && matchingLogs.some(l => l.status === 'running');
              const isCompleted = matchingLogs.length > 0 && matchingLogs.every(l => l.status === 'completed');
              const isFailed = matchingLogs.some(l => l.status === 'failed');

              return (
                <div
                  key={stage.step}
                  onClick={() => {
                    setInspectedAgentLab(stage.agentId as any);
                    setActiveTab('student_lab');
                  }}
                  className={`p-3.5 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                    isRunning ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500/60 shadow-md ring-1 ring-amber-400' :
                    isCompleted ? 'bg-emerald-50/70 dark:bg-[#121c2e] border-emerald-300 dark:border-emerald-600/60 hover:border-emerald-500 shadow-2xs' :
                    isFailed ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50' :
                    'bg-slate-50 dark:bg-[#121c2e] border-slate-300 dark:border-slate-750/80 text-slate-700 dark:text-slate-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#080d18] text-cyan-900 dark:text-cyan-300 border border-slate-300 dark:border-slate-700">
                        {stage.title}
                      </span>
                      {isRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />}
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                      {!isRunning && !isCompleted && !isFailed && <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                    </div>

                    <div className="font-bold text-slate-900 dark:text-white text-xs mt-1">{stage.agentName}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug font-medium">{stage.role}</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[9px] text-cyan-800 dark:text-cyan-300 flex items-center justify-between font-mono">
                    <span className="truncate font-semibold" title={stage.handoff}>{stage.handoff.slice(0, 32)}...</span>
                    <span className="underline shrink-0 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-white font-bold">I/O</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY TABS */}
      {latestAnalysis ? (
        <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl shadow-xs dark:shadow-md overflow-hidden transition-colors">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-300/80 dark:border-slate-800 bg-slate-100/80 dark:bg-[#080d18] px-4 pt-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'monitor', label: 'Interactive Orchestration Monitor (Network Nodes)' },
              { id: 'agent4', label: 'Agent 4: Manager Decision Support (Orchestrator)' },
              { id: 'agent5', label: 'Agent 5: Executive Analytics (6 Sections)' },
              { id: 'agent1', label: 'Agent 1: Patient Feedback Insight' },
              { id: 'agent2', label: 'Agent 2: Experience Monitoring' },
              { id: 'agent3', label: 'Agent 3: Complaint Triage Assistant' },
              { id: 'agent6', label: 'Agent 6: Communication Quality' },
              { id: 'student_lab', label: 'Student AI Lab: Agent I/O Inspector' },
              { id: 'execution_log', label: 'Execution Order Log' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-cyan-600 dark:border-cyan-400 text-cyan-900 dark:text-cyan-200 bg-white dark:bg-[#141e33] font-bold shadow-2xs'
                    : 'border-transparent text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* TAB: AGENT ORCHESTRATION MONITOR */}
            {activeTab === 'monitor' && (
              <AgentOrchestrationMonitor
                records={records}
                calculatedStats={calculatedStats}
                latestAnalysis={latestAnalysis}
                orchestrationLogs={orchestrationLogs}
                isOrchestrating={isOrchestrating}
                onRunOrchestration={onRunOrchestration}
                onResetWorkflow={onResetWorkflow || (() => {})}
              />
            )}

            {/* TAB: AGENT 4 (Hospital Manager Decision Support & Orchestrator) */}
            {activeTab === 'agent4' && latestAnalysis.agent4 && (
              <div className="space-y-6">
                {/* Top Management Alert (Mandated by Agent 4 specification) */}
                <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/50 rounded-2xl p-5 shadow-xs dark:shadow-md relative overflow-hidden transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 rounded-xl shrink-0 mt-0.5 border border-rose-200 dark:border-rose-500/30 shadow-2xs">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-500/30 text-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-500/50">
                          {latestAnalysis.agent4.topManagementAlert?.severity || 'Critical'} Priority Management Alert
                        </span>
                        <span className="text-xs text-rose-900 dark:text-rose-300 font-semibold">
                          Area: {latestAnalysis.agent4.topManagementAlert?.affectedArea || 'Emergency & Inpatient'}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {latestAnalysis.agent4.topManagementAlert?.alertTitle}
                      </h2>
                      <p className="text-xs text-slate-800 dark:text-rose-200 mt-1 leading-relaxed font-medium">
                        {latestAnalysis.agent4.topManagementAlert?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Case Analyses Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Case-by-Case Managerial Prioritization & Risk Review</span>
                    </h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/30 font-bold">
                        High: {latestAnalysis.agent4.priorityBreakdown?.high || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/30 font-bold">
                        Medium: {latestAnalysis.agent4.priorityBreakdown?.medium || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#080d18] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold">
                        Low: {latestAnalysis.agent4.priorityBreakdown?.low || 0}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-300 dark:border-slate-750 rounded-xl shadow-xs dark:shadow-md">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-[#080d18] text-slate-800 dark:text-slate-300 uppercase text-[10px] font-bold border-b-2 border-slate-300 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">Case ID</th>
                          <th className="py-2.5 px-3">Persona & Line</th>
                          <th className="py-2.5 px-3">Main Problem</th>
                          <th className="py-2.5 px-3">Priority & Reasoning</th>
                          <th className="py-2.5 px-3">Recommended Actions</th>
                          <th className="py-2.5 px-3">Human Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-300">
                        {latestAnalysis.agent4.caseAnalyses?.map((c, i) => (
                          <tr key={i} className="hover:bg-cyan-50/60 dark:hover:bg-[#142036] transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-800 dark:text-cyan-300">{c.caseId}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-900 dark:text-slate-200 block">{c.patientPersona}</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400">{c.serviceLine} &bull; {c.visitType}</span>
                            </td>
                            <td className="py-2.5 px-3 max-w-xs">{c.mainProblem}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold block w-fit mb-1 ${
                                c.managementPriority === 'High' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40' :
                                c.managementPriority === 'Medium' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40' :
                                'bg-slate-100 dark:bg-[#080d18] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                              }`}>
                                {c.managementPriority} Priority
                              </span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{c.priorityReasoning}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                {c.recommendedActions?.map((act, j) => (
                                   <li key={j}>{act}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="py-2.5 px-3">
                              {c.humanReviewNeeded ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40">
                                  <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                  <span>Review Needed</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px]">Standard</span>
                              )}
                              {c.aiRiskFlagConcern && (
                                <span className="block text-[10px] text-amber-800 dark:text-amber-300 mt-0.5 font-mono font-semibold">
                                  Flag: {c.aiRiskFlagConcern}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom 2-3 Recommended Management Actions (Mandated by Agent 4 specification) */}
                <div className="bg-amber-50/70 dark:bg-[#121c2e] border border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 shadow-2xs space-y-3 transition-colors">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider block">
                    Recommended Management Actions (2–3 Key Directives based on data):
                  </span>
                  <div className="space-y-2">
                    {latestAnalysis.agent4.recommendedManagementActions?.map((act, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-[#080d18] p-3 rounded-xl border border-amber-200 dark:border-slate-800 shadow-2xs">
                        <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px] border border-amber-300 dark:border-amber-700/60">
                          {i + 1}
                        </span>
                        <p className="mt-0.5 font-medium leading-relaxed">{act}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AGENT 5 (Healthcare Analytics Agent - 6 Sections) */}
            {activeTab === 'agent5' && latestAnalysis.agent5 && (
              <div className="space-y-6">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700/60 rounded-xl text-xs text-purple-950 dark:text-purple-200 shadow-2xs">
                  <span className="font-bold block mb-1">Synthesizer Architecture Note:</span>
                  Agent 5 received the completed specialist results from Agent 1, Agent 2, Agent 3, and Agent 6 and compiled the 6 executive sections below strictly from real specialist findings rather than inventing its own.
                </div>

                {/* SECTION 1: Executive Overview */}
                <div className="bg-slate-50 dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 space-y-3 shadow-2xs transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400">
                    SECTION 1: Executive Overview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-700 dark:text-slate-400 uppercase font-bold block">Total Comments</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {latestAnalysis.agent5.section1_ExecutiveOverview?.totalCommentsAnalyzed}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-700 dark:text-slate-400 uppercase font-bold block">Avg Satisfaction</span>
                      <span className="text-xl font-bold text-emerald-800 dark:text-emerald-400 font-mono tabular-nums">
                        {latestAnalysis.agent5.section1_ExecutiveOverview?.averageSatisfactionScore} / 5
                      </span>
                    </div>
                    <div className="bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-700 dark:text-slate-400 uppercase font-bold block">Avg Communication</span>
                      <span className="text-xl font-bold text-cyan-800 dark:text-cyan-400 font-mono tabular-nums">
                        {latestAnalysis.agent5.section1_ExecutiveOverview?.averageCommunicationRating} / 5
                      </span>
                    </div>
                    <div className="bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-700 dark:text-slate-400 uppercase font-bold block">Compliance Rate</span>
                      <span className="text-xl font-bold text-amber-800 dark:text-amber-400 font-mono tabular-nums">
                        {latestAnalysis.agent5.section1_ExecutiveOverview?.followUpComplianceRate}%
                      </span>
                    </div>
                    <div className="bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-700 dark:text-slate-400 uppercase font-bold block">Service Lines</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {latestAnalysis.agent5.section1_ExecutiveOverview?.serviceLinesRepresented}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Patient Satisfaction Insights */}
                <div className="bg-slate-50 dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 space-y-4 shadow-2xs transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400">
                    SECTION 2: Patient Satisfaction Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 space-y-2 shadow-2xs">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block">Satisfaction by Service Line:</span>
                      {latestAnalysis.agent5.section2_SatisfactionInsights?.byServiceLine?.map((s, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{s.serviceLine}</span>
                          <span className="font-mono text-cyan-800 dark:text-cyan-300 font-bold tabular-nums">{s.avgScore} / 5</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 space-y-2 shadow-2xs">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block">Satisfaction by Visit Type:</span>
                      {latestAnalysis.agent5.section2_SatisfactionInsights?.byVisitType?.map((v, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{v.visitType}</span>
                          <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold tabular-nums">{v.avgScore} / 5</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 space-y-2 shadow-2xs">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block">Satisfaction by Patient Persona:</span>
                      {latestAnalysis.agent5.section2_SatisfactionInsights?.byPatientPersona?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px] font-medium">{p.persona}</span>
                          <span className="font-mono text-amber-800 dark:text-amber-300 font-bold tabular-nums">{p.avgScore} / 5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: NLP Analysis (with Word Cloud) */}
                <div className="bg-slate-50 dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 space-y-4 shadow-2xs transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400">
                    SECTION 3: NLP Analysis & Text Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Themes */}
                    <div className="bg-white dark:bg-[#080d18] p-4 rounded-xl border border-slate-300 dark:border-slate-800 space-y-2 text-xs shadow-2xs">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block">Top Themes Extracted from Comments:</span>
                      {latestAnalysis.agent5.section3_NLPAnalysis?.topThemes?.map((th, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-800 dark:text-slate-300 font-medium">{th.theme}</span>
                            <span className="text-cyan-800 dark:text-cyan-400 font-mono font-bold tabular-nums">{th.count} ({th.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full" style={{ width: `${th.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Word Cloud Visualizer */}
                    <div className="bg-white dark:bg-[#080d18] p-4 rounded-xl border border-slate-300 dark:border-slate-800 space-y-2 shadow-2xs">
                      <span className="font-bold text-slate-900 dark:text-slate-200 text-xs block">Visual Word Cloud (Keyword Frequency):</span>
                      <div className="flex flex-wrap gap-2 items-center justify-center p-3 min-h-[140px] bg-slate-100 dark:bg-[#060a14] rounded-lg border border-slate-200 dark:border-slate-850">
                        {latestAnalysis.agent5.section3_NLPAnalysis?.wordCloud?.map((wc, i) => {
                          const sizeClass = wc.value > 35 ? 'text-lg text-cyan-800 dark:text-cyan-300 font-extrabold' :
                                            wc.value > 25 ? 'text-sm text-blue-700 dark:text-blue-400 font-bold' :
                                            wc.value > 18 ? 'text-xs text-purple-700 dark:text-purple-400 font-semibold' :
                                            'text-[10px] text-slate-700 dark:text-slate-400 font-medium';
                          return (
                            <span key={i} className={`${sizeClass} px-2.5 py-1 rounded-lg bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 shadow-2xs hover:scale-105 transition-transform cursor-default font-mono tabular-nums`}>
                              {wc.text} ({wc.value})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Hidden Organizational Problems */}
                <div className="bg-slate-50 dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 space-y-4 shadow-2xs transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400">
                    SECTION 4: Hidden Organizational Problems
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="font-bold text-rose-800 dark:text-rose-400 block mb-1">Service Lines with High Complaint Rates:</span>
                      {latestAnalysis.agent5.section4_HiddenOrganizationalProblems?.highComplaintServiceLines?.map((hl, i) => (
                        <div key={i} className="mb-2">
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>{hl.serviceLine}</span>
                            <span className="text-rose-800 dark:text-rose-400 font-mono tabular-nums">{hl.complaintRate}%</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">{hl.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 space-y-1.5 shadow-2xs">
                      <span className="font-bold text-amber-900 dark:text-amber-400 block mb-1">Communication & Operational Bottlenecks:</span>
                      {latestAnalysis.agent5.section4_HiddenOrganizationalProblems?.communicationBottlenecks?.map((cb, i) => (
                        <p key={i} className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">&bull; {cb}</p>
                      ))}
                      {latestAnalysis.agent5.section4_HiddenOrganizationalProblems?.waitTimeComplaints?.map((wt, i) => (
                        <p key={i} className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">&bull; {wt}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 5: AI Risk Monitoring */}
                <div className="bg-slate-50 dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 space-y-4 shadow-2xs transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400">
                    SECTION 5: AI Risk Monitoring (Hallucination, Bias, Human Review)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="font-bold text-purple-900 dark:text-purple-300 block mb-2">Hallucination Trap Comments:</span>
                      {latestAnalysis.agent5.section5_AIRiskMonitoring?.hallucinationTrapComments?.length ? (
                        latestAnalysis.agent5.section5_AIRiskMonitoring.hallucinationTrapComments.map((ht, i) => (
                          <div key={i} className="mb-2 text-[11px]">
                            <strong className="text-slate-900 dark:text-white font-mono">{ht.caseId}:</strong> "{ht.comment}"
                            <span className="block text-purple-800 dark:text-purple-400 text-[10px] mt-0.5 font-medium">{ht.flagReason}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 font-medium">None detected in sample.</span>
                      )}
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block mb-2">Bias & Equity Flags:</span>
                      {latestAnalysis.agent5.section5_AIRiskMonitoring?.biasRelatedComments?.map((br, i) => (
                        <div key={i} className="mb-2 text-[11px]">
                          <strong className="text-slate-900 dark:text-white font-mono">{br.caseId}:</strong> "{br.comment}"
                          <span className="block text-amber-800 dark:text-amber-400 text-[10px] mt-0.5 font-medium">{br.biasCategory}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-rose-300 dark:border-rose-500/40 shadow-2xs">
                      <span className="font-bold text-rose-900 dark:text-rose-300 block mb-2">Mandatory Human Review Cases:</span>
                      {latestAnalysis.agent5.section5_AIRiskMonitoring?.casesRequiringHumanReview?.map((hr, i) => (
                        <div key={i} className="mb-2 text-[11px]">
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                            <span className="font-mono">{hr.caseId}</span>
                            <span className="text-rose-800 dark:text-rose-400">{hr.priority}</span>
                          </div>
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{hr.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 6: Executive Recommendations */}
                <div className="bg-slate-50 dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 space-y-3 shadow-2xs transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-400">
                    SECTION 6: Executive Recommendations (Priorities, Quick Wins, Long-Term AI)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-400 block mb-1">Top 5 Priorities:</span>
                      <ul className="space-y-1 text-slate-800 dark:text-slate-300 text-[11px] font-medium">
                        {latestAnalysis.agent5.section6_ExecutiveRecommendations?.top5OrganizationalPriorities?.map((p, i) => (
                          <li key={i}>{i + 1}. {p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="font-bold text-cyan-900 dark:text-cyan-400 block mb-1">Quick Wins (Within 3 Months):</span>
                      <ul className="space-y-1 text-slate-800 dark:text-slate-300 text-[11px] font-medium">
                        {latestAnalysis.agent5.section6_ExecutiveRecommendations?.quickWins3Months?.map((qw, i) => (
                          <li key={i}>&bull; {qw}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-[#080d18] p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-2xs">
                      <span className="font-bold text-purple-900 dark:text-purple-400 block mb-1">Long-term AI Opportunities (6–12 Mo):</span>
                      <ul className="space-y-1 text-slate-800 dark:text-slate-300 text-[11px] font-medium">
                        {latestAnalysis.agent5.section6_ExecutiveRecommendations?.longTermAIOpportunities6To12Months?.map((lt, i) => (
                          <li key={i}>&bull; {lt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AGENT 1 (Patient Feedback Insight Agent) */}
            {activeTab === 'agent1' && latestAnalysis.agent1 && (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-cyan-300 dark:border-cyan-500/50 flex items-center justify-between text-xs transition-colors shadow-2xs">
                  <div>
                    <span className="font-bold text-cyan-900 dark:text-cyan-400 uppercase tracking-wider block">Agent 1: Patient Feedback Insight Agent</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Overall Sentiment: <strong className="text-slate-900 dark:text-white">{latestAnalysis.agent1.overallSentiment?.label}</strong> (Score: {latestAnalysis.agent1.overallSentiment?.score})</span>
                  </div>
                  <div className="flex space-x-3 font-mono font-bold text-xs">
                    <span className="text-emerald-800 dark:text-emerald-400">Pos: {latestAnalysis.agent1.overallSentiment?.distribution?.positive}</span>
                    <span className="text-rose-800 dark:text-rose-400">Neg: {latestAnalysis.agent1.overallSentiment?.distribution?.negative}</span>
                    <span className="text-slate-700 dark:text-slate-400">Neu: {latestAnalysis.agent1.overallSentiment?.distribution?.neutral}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Per-Comment 6-Step Evaluations:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {latestAnalysis.agent1.results?.map((res, i) => (
                      <div key={i} className="bg-white dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-750/80 text-xs space-y-2 shadow-2xs transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-cyan-800 dark:text-cyan-300">{res.patientId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/60 font-bold">
                            {res.theme}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 italic font-medium">"{res.supportingEvidence}"</p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <div><strong className="text-slate-900 dark:text-slate-200">Sentiment:</strong> {res.sentiment} &bull; {res.reasoning}</div>
                          <div><strong className="text-slate-900 dark:text-slate-200">Operational Issue:</strong> {res.operationalIssue}</div>
                          <div><strong className="text-slate-900 dark:text-slate-200">Risk/Bias:</strong> {res.riskOrBiasConcern}</div>
                          <div><strong className="text-emerald-800 dark:text-emerald-400">Recommended Action:</strong> {res.recommendedAction}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AGENT 2 (Patient Experience Monitoring Agent) */}
            {activeTab === 'agent2' && latestAnalysis.agent2 && (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-emerald-300 dark:border-emerald-500/50 text-xs space-y-2 transition-colors shadow-2xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider block">Agent 2: Patient Experience Monitoring Agent</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{latestAnalysis.agent2.trendOverview}</p>
                  <p className="text-emerald-900 dark:text-emerald-300 text-[11px] font-semibold">{latestAnalysis.agent2.equityReviewSummary}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Internal 5-Step Macro Analysis Cases:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {latestAnalysis.agent2.results?.map((res, i) => (
                      <div key={i} className="bg-white dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-750/80 text-xs space-y-2 shadow-2xs transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-cyan-800 dark:text-cyan-300">{res.caseId}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                            Theme: {res.primaryTheme}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 italic font-medium">"{res.supportingEvidence}"</p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <div><strong className="text-slate-900 dark:text-slate-200">Bottlenecks:</strong> {res.operationalBottlenecks?.join(', ')}</div>
                          <div><strong className="text-slate-900 dark:text-slate-200">Risk:</strong> {res.riskAssessment?.overallRisk}</div>
                          <div><strong className="text-emerald-800 dark:text-emerald-400">Recommendation:</strong> {res.managerialRecommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AGENT 3 (Complaint Triage Assistant) */}
            {activeTab === 'agent3' && latestAnalysis.agent3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white dark:bg-[#121c2e] p-3 rounded-xl border border-slate-300 dark:border-slate-750 shadow-2xs">
                    <span className="text-slate-700 dark:text-slate-400 block text-[10px] uppercase font-bold">Level 1 - Low</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{latestAnalysis.agent3.severityDistribution?.level1}</span>
                  </div>
                  <div className="bg-white dark:bg-[#121c2e] p-3 rounded-xl border border-slate-300 dark:border-slate-750 shadow-2xs">
                    <span className="text-slate-700 dark:text-slate-400 block text-[10px] uppercase font-bold">Level 2 - Moderate</span>
                    <span className="text-lg font-bold text-amber-800 dark:text-amber-300 font-mono tabular-nums">{latestAnalysis.agent3.severityDistribution?.level2}</span>
                  </div>
                  <div className="bg-white dark:bg-[#121c2e] p-3 rounded-xl border border-slate-300 dark:border-slate-750 shadow-2xs">
                    <span className="text-slate-700 dark:text-slate-400 block text-[10px] uppercase font-bold">Level 3 - High</span>
                    <span className="text-lg font-bold text-orange-800 dark:text-orange-400 font-mono tabular-nums">{latestAnalysis.agent3.severityDistribution?.level3}</span>
                  </div>
                  <div className="bg-white dark:bg-[#121c2e] p-3 rounded-xl border border-rose-300 dark:border-rose-500/50 shadow-2xs">
                    <span className="text-rose-900 dark:text-rose-300 block text-[10px] uppercase font-bold">Level 4 - Critical</span>
                    <span className="text-lg font-bold text-rose-800 dark:text-rose-400 font-mono tabular-nums">{latestAnalysis.agent3.severityDistribution?.level4}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Triage & Escalation Results:</h4>
                  <div className="overflow-x-auto border border-slate-300 dark:border-slate-750 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-[#080d18] text-slate-800 dark:text-slate-300 uppercase text-[10px] font-bold border-b-2 border-slate-300 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">Case ID</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Severity Level</th>
                          <th className="py-2.5 px-3">Escalate / Route To</th>
                          <th className="py-2.5 px-3">Timeline</th>
                          <th className="py-2.5 px-3">Human Intervention</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-300 font-medium">
                        {latestAnalysis.agent3.triageResults?.map((tr, i) => (
                          <tr key={i} className="hover:bg-cyan-50/60 dark:hover:bg-[#142036] transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-800 dark:text-cyan-300">{tr.caseId}</td>
                            <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100 font-semibold">{tr.primaryCategory}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tr.severityLevel.includes('Critical') ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40' :
                                tr.severityLevel.includes('High') ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-500/40' :
                                'bg-slate-100 dark:bg-[#080d18] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                              }`}>
                                {tr.severityLevel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-cyan-800 dark:text-cyan-300 font-bold">{tr.routeTo}</td>
                            <td className="py-2.5 px-3 font-mono text-rose-800 dark:text-rose-400 font-bold">{tr.escalationTimeline}</td>
                            <td className="py-2.5 px-3">
                              {tr.humanInterventionRequired ? (
                                <span className="text-rose-800 dark:text-rose-400 font-bold">Required</span>
                              ) : (
                                <span className="text-slate-500">Standard</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AGENT 6 (Healthcare Communication Quality Evaluator) */}
            {activeTab === 'agent6' && latestAnalysis.agent6 && (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-indigo-300 dark:border-indigo-500/50 text-xs flex justify-between items-center transition-colors shadow-2xs">
                  <div>
                    <span className="font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider block">Agent 6: Healthcare Communication Quality Evaluator</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Composite Score: <strong className="text-slate-900 dark:text-white font-mono">{latestAnalysis.agent6.aggregateScores?.overallCommunicationScore}/100</strong> &bull; Average Reading Level: <strong className="text-slate-900 dark:text-white">{latestAnalysis.agent6.aggregateScores?.averageReadingGradeLevel}</strong></span>
                  </div>
                </div>

                <div className="space-y-4">
                  {latestAnalysis.agent6.evaluations?.map((ev, i) => (
                    <div key={i} className="bg-white dark:bg-[#121c2e] p-5 rounded-xl border border-slate-300 dark:border-slate-750/80 text-xs space-y-3 shadow-2xs transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-cyan-800 dark:text-cyan-300 text-sm">{ev.caseId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/60 font-bold">
                          Purpose: {ev.communicationPurpose?.purpose}
                        </span>
                      </div>

                      {/* 8 Quality Dimensions */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
                        {Object.entries(ev.qualityScores || {}).map(([dim, data]: [string, any]) => (
                          <div key={dim} className="bg-slate-50 dark:bg-[#080d18] p-2 rounded-lg border border-slate-300 dark:border-slate-800">
                            <span className="text-[9px] uppercase text-slate-700 dark:text-slate-400 font-bold block truncate">{dim}</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">{data.score} / 5</span>
                          </div>
                        ))}
                      </div>

                      {/* Original vs Rewritten */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-400 block mb-1">Original Healthcare Text:</span>
                          <p className="text-slate-800 dark:text-slate-300 italic font-medium">{ev.originalText}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-300 dark:border-emerald-600/50">
                          <span className="text-[10px] uppercase font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Rewritten Plain Language (6th Grade Literacy):</span>
                          <p className="text-emerald-950 dark:text-emerald-200 font-medium">{ev.rewrittenCommunication}</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between pt-1">
                        <span>Literacy Rating: <strong className="text-slate-900 dark:text-white">{ev.healthLiteracyAssessment?.classification}</strong></span>
                        <span>Risk Level: <strong className={ev.communicationRisks?.riskLevel === 'High' ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-300'}>{ev.communicationRisks?.riskLevel}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: STUDENT AI LAB (Requirement 6: Interface where students can examine each agent's input and output) */}
            {activeTab === 'student_lab' && (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-cyan-300 dark:border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <span>Student AI Lab: Agent I/O & Inter-Agent Payload Inspector</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
                      Examine the exact multi-agent delegation sequence. Inspect the system instruction, input payloads passed across agents, structured JSON responses, and schema validation checklists.
                    </p>
                  </div>

                  {/* Step / Agent Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
                    {[
                      { id: 'agent4', step: 1, label: 'Step 1 & 6: Agent 4 (Orchestrator)' },
                      { id: 'agent1', step: 2, label: 'Step 2: Agent 1 (Feedback)' },
                      { id: 'agent3', step: 2, label: 'Step 2: Agent 3 (Triage)' },
                      { id: 'agent2', step: 3, label: 'Step 3: Agent 2 (Monitor)' },
                      { id: 'agent6', step: 4, label: 'Step 4: Agent 6 (Communication)' },
                      { id: 'agent5', step: 5, label: 'Step 5: Agent 5 (Analytics)' },
                    ].map(a => (
                      <button
                        key={a.id}
                        onClick={() => setInspectedAgentLab(a.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-bold font-mono text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                          inspectedAgentLab === a.id
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Role & Pipeline Information Banner */}
                {(() => {
                  const logEntries = orchestrationLogs.filter(l => l.agentId === inspectedAgentLab);
                  const latestLog = logEntries[logEntries.length - 1];
                  const hasValidationErrors = latestLog?.validationErrors && latestLog.validationErrors.length > 0;
                  const isFailed = latestLog?.status === 'failed';

                  const agentDescriptions: Record<string, { role: string; handoffReceived: string; handoffPassed: string }> = {
                    agent4: {
                      role: 'Acts as the central orchestrator and executive decision support. In Step 1, interprets the manager query and determines required specialists. In Step 6, reviews consolidated findings and formulates strategic actions.',
                      handoffReceived: 'Raw manager query/objective and consolidated specialist findings from Agent 5.',
                      handoffPassed: 'Execution plan in Step 1; Top Management Alert, prioritized cases, and executive actions in Step 6.',
                    },
                    agent1: {
                      role: 'Analyzes individual patient comments to identify sentiment, themes, operational issues, and safety risks. Dispatched in parallel with Agent 3 in Step 2.',
                      handoffReceived: 'Raw patient feedback comments and visit metadata from the active dataset.',
                      handoffPassed: 'Structured sentiment scores, primary themes, operational issues, and risk flags transferred to Agent 2 and Agent 5.',
                    },
                    agent2: {
                      role: 'Analyzes cross-record organizational trends, bottlenecks, demographic equity concerns, and systemic risks. Executes in Step 3 consuming completed findings from Agents 1 & 3.',
                      handoffReceived: 'Active dataset records, empirical calculated statistics, plus completed themes from Agent 1 and severity counts from Agent 3.',
                      handoffPassed: 'Systemic bottlenecks, unit rankings, and equity findings routed to Agent 5 for executive integration.',
                    },
                    agent3: {
                      role: 'Classifies grievances into 10 healthcare categories, assigns severity Levels 1-4, routes to reviewing departments, and flags cases requiring urgent human review.',
                      handoffReceived: 'Patient grievance records and satisfaction scores from active dataset.',
                      handoffPassed: 'Severity breakdown (Levels 1-4), escalation routing, and human intervention flags passed to Agent 2, Agent 5, and Agent 4.',
                    },
                    agent6: {
                      role: 'Evaluates patient-facing discharge paperwork, medication instructions, and clinical dialogues for readability, clarity, empathy, and health literacy; provides 6th-grade rewrites.',
                      handoffReceived: 'Patient-facing communication texts and clinical discharge instructions.',
                      handoffPassed: 'Communication quality dimension scores, jargon identifications, and plain-language rewrites sent to Agent 5.',
                    },
                    agent5: {
                      role: 'Integrates all completed specialist findings into 6 executive dashboard sections. Deterministic KPIs are strictly calculated from the empirical dataset.',
                      handoffReceived: 'Completed structured outputs from Agents 1, 3, 2, and 6, along with verified deterministic KPIs.',
                      handoffPassed: 'Consolidated 6-section analytics dashboard transferred to Agent 4 for final managerial decision support.',
                    },
                  };

                  const currentMeta = agentDescriptions[inspectedAgentLab] || { role: '', handoffReceived: '', handoffPassed: '' };

                  return (
                    <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-750 rounded-xl p-4 space-y-3 transition-colors shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-cyan-900 dark:text-cyan-400 font-mono uppercase">
                            {inspectedAgentLab.toUpperCase()}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                          <span className="text-xs text-slate-900 dark:text-white font-semibold">
                            {latestLog?.stepName || `Hierarchical Step for ${inspectedAgentLab.toUpperCase()}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                          {isFailed ? (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40 flex items-center space-x-1.5 font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>Execution Failed (Isolated)</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40 flex items-center space-x-1.5 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Execution Succeeded ({latestLog?.durationMs ? `${(latestLog.durationMs / 1000).toFixed(2)}s` : 'Cached'})</span>
                            </span>
                          )}

                          <span className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold ${
                            hasValidationErrors 
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700/60' 
                              : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60'
                          }`}>
                            {hasValidationErrors ? `Schema Notes (${latestLog?.validationErrors?.length})` : 'Schema Verified Valid'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-400 block mb-1">Agent Responsibility:</span>
                          <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed font-medium">{currentMeta.role}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">Inputs & Predecessor Context Received:</span>
                          <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed font-medium">{currentMeta.handoffReceived}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block mb-1">Structured Outputs Transferred Downstream:</span>
                          <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed font-medium">{currentMeta.handoffPassed}</p>
                        </div>
                      </div>

                      {hasValidationErrors && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs text-amber-950 dark:text-amber-200 space-y-1">
                          <span className="font-bold flex items-center space-x-1.5 text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Schema Validation Checklist Notes:</span>
                          </span>
                          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-950 dark:text-amber-200 pl-1 font-medium">
                            {latestLog?.validationErrors?.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Selected Agent Inspector Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                  {/* System Prompt Box */}
                  <div className="lg:col-span-2 bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-750 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-bold text-cyan-900 dark:text-cyan-400 uppercase tracking-wider text-[11px] flex items-center space-x-2">
                        <Brain className="w-3.5 h-3.5" />
                        <span>Authoritative System Prompt ({inspectedAgentLab.toUpperCase()}):</span>
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(agentPromptsMap[inspectedAgentLab] || '')}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 dark:bg-[#080d18] dark:hover:bg-[#1a263d] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[10px] transition font-sans cursor-pointer font-bold shadow-2xs"
                      >
                        Copy Prompt
                      </button>
                    </div>
                    <pre className="text-slate-900 dark:text-slate-200 text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 leading-relaxed font-mono">
                      {agentPromptsMap[inspectedAgentLab]}
                    </pre>
                  </div>

                  {/* Input Payload */}
                  <div className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-750 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-2">
                        <Send className="w-3.5 h-3.5" />
                        <span>Input Payload Received by {inspectedAgentLab.toUpperCase()}:</span>
                      </span>
                      <button
                        onClick={() => {
                          const payload = orchestrationLogs.find(l => l.agentId === inspectedAgentLab)?.inputPayload;
                          navigator.clipboard.writeText(JSON.stringify(payload || {}, null, 2));
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 dark:bg-[#080d18] dark:hover:bg-[#1a263d] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[10px] transition font-sans cursor-pointer font-bold shadow-2xs"
                      >
                        Copy Input JSON
                      </button>
                    </div>
                    <pre className="text-slate-900 dark:text-cyan-300 text-[11px] whitespace-pre-wrap max-h-96 overflow-y-auto bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 font-mono">
                      {JSON.stringify(
                        orchestrationLogs.find(l => l.agentId === inspectedAgentLab)?.inputPayload || { message: 'Input transmitted during orchestration.' },
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  {/* Output Payload */}
                  <div className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-750 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Structured Output JSON Generated by {inspectedAgentLab.toUpperCase()}:</span>
                      </span>
                      <button
                        onClick={() => {
                          const payload = latestAnalysis[inspectedAgentLab as keyof FullOrchestrationResult];
                          navigator.clipboard.writeText(JSON.stringify(payload || {}, null, 2));
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 dark:bg-[#080d18] dark:hover:bg-[#1a263d] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[10px] transition font-sans cursor-pointer font-bold shadow-2xs"
                      >
                        Copy Output JSON
                      </button>
                    </div>
                    <pre className="text-slate-900 dark:text-emerald-300 text-[11px] whitespace-pre-wrap max-h-96 overflow-y-auto bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 font-mono">
                      {JSON.stringify(
                        latestAnalysis[inspectedAgentLab as keyof FullOrchestrationResult] || { status: 'No output data.' },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXECUTION LOG (Requirement 8: Show an execution log indicating which agents were called, in what order, and whether they succeeded) */}
            {activeTab === 'execution_log' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Hierarchical Orchestrator Execution Log</span>
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                      Chronological audit of real agent dispatches, latencies, schema integrity checks, and inter-agent handoffs.
                    </p>
                  </div>
                  <span className="text-xs text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-[#080d18] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-medium">
                    Total Pipeline Duration: <strong className="text-cyan-800 dark:text-cyan-400 font-bold">{(latestAnalysis.totalDurationMs / 1000).toFixed(2)}s</strong>
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-300 dark:border-slate-750 rounded-xl shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-[#080d18] text-slate-800 dark:text-slate-300 uppercase text-[10px] font-bold border-b-2 border-slate-300 dark:border-slate-700">
                      <tr>
                        <th className="py-3 px-3">Order</th>
                        <th className="py-3 px-3">Step & Phase</th>
                        <th className="py-3 px-3">Agent</th>
                        <th className="py-3 px-3">Execution Status</th>
                        <th className="py-3 px-3">Latency</th>
                        <th className="py-3 px-3">Schema Audit</th>
                        <th className="py-3 px-3">Input Summary</th>
                        <th className="py-3 px-3">Output Summary</th>
                        <th className="py-3 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-300 font-medium">
                      {latestAnalysis.logs?.map((l, i) => (
                        <tr key={i} className="hover:bg-cyan-50/60 dark:hover:bg-[#142036] transition">
                          <td className="py-3 px-3 font-mono font-bold text-cyan-800 dark:text-cyan-300">
                            #{l.sequenceOrder || i + 1}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {l.stepNumber ? `Step ${l.stepNumber}` : 'Orchestration'}
                            </span>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                              {l.stepName || 'Pipeline'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-200">
                            {l.agentName}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                              l.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40' :
                              l.status === 'failed' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40' :
                              'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40'
                            }`}>
                              {l.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                              {l.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                              {l.status === 'running' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />}
                              <span>{l.status === 'completed' ? 'Succeeded' : l.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-900 dark:text-slate-200 tabular-nums">
                            {l.durationMs ? `${(l.durationMs / 1000).toFixed(2)}s` : 'Instant'}
                          </td>
                          <td className="py-3 px-3">
                            {l.validationErrors && l.validationErrors.length > 0 ? (
                              <span className="text-[10px] font-mono text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 font-bold">
                                {l.validationErrors.length} Note(s)
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-600/50 font-bold">
                                Valid Schema
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300 font-medium" title={l.inputSummary}>
                            {l.inputSummary || 'N/A'}
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-emerald-900 dark:text-emerald-300 font-medium" title={l.outputSummary}>
                            {l.outputSummary || 'Completed'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setInspectedAgentLab(l.agentId as any);
                                setActiveTab('student_lab');
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-cyan-600 hover:text-white dark:bg-[#080d18] dark:hover:bg-cyan-600 dark:hover:text-white text-cyan-900 dark:text-cyan-300 text-[11px] font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                            >
                              Inspect I/O
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AgentOrchestrationMonitor
          records={records}
          calculatedStats={calculatedStats}
          latestAnalysis={latestAnalysis}
          orchestrationLogs={orchestrationLogs}
          isOrchestrating={isOrchestrating}
          onRunOrchestration={onRunOrchestration}
          onResetWorkflow={onResetWorkflow || (() => {})}
        />
      )}
    </div>
  );
};
