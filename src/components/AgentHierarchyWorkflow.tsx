import React, { useState } from 'react';
import { 
  Layers, 
  GitBranch, 
  Cpu, 
  Brain, 
  ShieldCheck, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  ArrowDown, 
  ChevronRight,
  Info,
  Terminal,
  FileCode,
  Sparkles,
  RefreshCw,
  Eye,
  Activity
} from 'lucide-react';
import { PatientRecord, CalculatedStatistics, FullOrchestrationResult, AgentExecutionLog } from '../types/healthcare';
import { AgentOrchestrationMonitor } from './AgentOrchestrationMonitor';

interface AgentHierarchyWorkflowProps {
  records: PatientRecord[];
  calculatedStats: CalculatedStatistics;
  latestAnalysis: FullOrchestrationResult | null;
  orchestrationLogs: AgentExecutionLog[];
  isOrchestrating: boolean;
  onRunOrchestration: (params: { taskType: string; managerObjective: string; executionMode: 'parallel' | 'sequential'; targetRecords?: PatientRecord[] }) => Promise<void>;
  onResetWorkflow: () => void;
  onOpenAgentModal: (agentId: string) => void;
  onRunStandaloneAgent: (agentId: string) => Promise<any>;
}

export const AgentHierarchyWorkflow: React.FC<AgentHierarchyWorkflowProps> = ({
  records,
  calculatedStats,
  latestAnalysis,
  orchestrationLogs,
  isOrchestrating,
  onRunOrchestration,
  onResetWorkflow,
  onOpenAgentModal,
  onRunStandaloneAgent,
}) => {
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [standaloneResults, setStandaloneResults] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'monitor' | 'diagram' | 'educational'>('monitor');

  const agents = [
    {
      id: 'agent4',
      code: 'Agent 4',
      title: 'Hospital Manager Decision Support Agent',
      role: 'Apex Orchestrator & Executive Advisor',
      category: 'Orchestrator',
      description: 'Receives hospital leadership objectives, formulates delegation plan, coordinates execution of specialists, synthesizes enterprise findings, and issues prioritized managerial action items.',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Cpu,
      isOrchestrator: true,
    },
    {
      id: 'agent1',
      code: 'Agent 1',
      title: 'Patient Feedback Insight Agent',
      role: 'Micro Qualitative Feedback Analyst',
      category: 'Specialist',
      description: 'Analyzes individual patient comments, survey open-text, and family feedback. Identifies core themes, sentiment polarity, concrete operational friction, and latent safety risks.',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: Brain,
    },
    {
      id: 'agent2',
      code: 'Agent 2',
      title: 'Patient Experience Monitoring Agent',
      role: 'Macro Longitudinal & Equity Monitor',
      category: 'Specialist',
      description: 'Surveys systemic patterns across departments and demographic cohorts. Identifies operational bottlenecks, language access disparities, and organizational burnout spillover.',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: GitBranch,
    },
    {
      id: 'agent3',
      code: 'Agent 3',
      title: 'Complaint Triage Assistant',
      role: 'Grievance Classification & SLA Router',
      category: 'Specialist',
      description: 'Categorizes complaints, assigns severity Levels 1 through 4, flags cases requiring urgent human review, and routes to appropriate hospital departments with strict SLA response windows.',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-300',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: AlertCircle,
    },
    {
      id: 'agent6',
      code: 'Agent 6',
      title: 'Healthcare Communication Quality Evaluator',
      role: 'Health Literacy & Jargon Auditor',
      category: 'Specialist',
      description: 'Evaluates discharge instructions and patient dialogue across 5 dimensions: clarity, readability, empathy, health literacy, and actionability. Rewrites medical jargon into plain language without altering clinical intent.',
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      icon: FileCode,
    },
    {
      id: 'agent5',
      code: 'Agent 5',
      title: 'Healthcare Analytics Agent',
      role: 'Quantitative-Qualitative Synthesizer',
      category: 'Synthesizer',
      description: 'Fuses verified empirical statistics with qualitative specialist outputs. Produces department benchmark matrices, cross-agent correlation discoveries, and executive risk scorecards.',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: Layers,
    },
  ];

  const handleTestAgent = async (agentId: string) => {
    setTestingAgentId(agentId);
    try {
      const res = await onRunStandaloneAgent(agentId);
      setStandaloneResults(prev => ({ ...prev, [agentId]: res }));
    } catch (err: any) {
      console.error('Test error:', err);
      setStandaloneResults(prev => ({ ...prev, [agentId]: { error: err.message || 'Execution failed' } }));
    } finally {
      setTestingAgentId(null);
    }
  };

  const orchestrator = agents.find(a => a.id === 'agent4')!;
  const specialists = agents.filter(a => ['agent1', 'agent2', 'agent3', 'agent6'].includes(a.id));
  const synthesizer = agents.find(a => a.id === 'agent5')!;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Section 2 &bull; Multi-Agent System Architecture</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hierarchical Multi-Agent Topology & Workflow
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Demonstrating the Supervisor-Worker orchestration pattern: Agent 4 delegates to 4 domain specialists, feeds findings to Agent 5 for quantitative synthesis, and consolidates executive decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs gap-1">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'monitor' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-200" />
              <span>Interactive Orchestration Monitor</span>
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'diagram' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Architecture & Testing
            </button>
            <button
              onClick={() => setActiveTab('educational')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'educational' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              AI Pedagogical Theory
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: LIVE INTERACTIVE AGENT ORCHESTRATION MONITOR */}
      {activeTab === 'monitor' && (
        <AgentOrchestrationMonitor
          records={records}
          calculatedStats={calculatedStats}
          latestAnalysis={latestAnalysis}
          orchestrationLogs={orchestrationLogs}
          isOrchestrating={isOrchestrating}
          onRunOrchestration={onRunOrchestration}
          onResetWorkflow={onResetWorkflow}
          onOpenAgentModal={onOpenAgentModal}
        />
      )}

      {activeTab === 'diagram' && (
        /* INTERACTIVE DIAGRAM VIEW */
        <div className="space-y-8">
          {/* TOP TIER: APEX ORCHESTRATOR */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white dark:bg-gradient-to-b dark:from-slate-850 dark:to-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-6 shadow-sm dark:shadow-2xl relative group transition-colors">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 tracking-wider uppercase flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Level 1: Central Orchestrator</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400">{orchestrator.code}</span>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base">{orchestrator.title}</h2>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-200/80 font-semibold">{orchestrator.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onOpenAgentModal(orchestrator.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer font-semibold shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Inspect Prompt</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 leading-relaxed font-medium">
                {orchestrator.description}
              </p>

              {/* Data Flow Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center space-x-1 text-amber-700 dark:text-amber-300/80">
                  <Info className="w-3.5 h-3.5" />
                  <span>Delegation: Dispatches tasks sequentially or in parallel</span>
                </span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">
                  gemini-3.8-flash &bull; JSON Schema
                </span>
              </div>
            </div>

            {/* Connecting Flow Lines Downward */}
            <div className="flex flex-col items-center my-3">
              <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500 to-cyan-500" />
              <div className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 flex items-center space-x-1 shadow-xs font-medium">
                <span>Task Dispatch Payload &bull; Parallel or Sequential</span>
                <ArrowDown className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="w-0.5 h-6 bg-cyan-500/60" />
            </div>
          </div>

          {/* MIDDLE TIER: 4 SPECIALIST AGENTS */}
          <div>
            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30">
                Level 2: Autonomous Specialist Agents (Domain Experts)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {specialists.map((agent) => {
                const Icon = agent.icon;
                const isTesting = testingAgentId === agent.id;
                const result = standaloneResults[agent.id];

                return (
                  <div
                    key={agent.id}
                    className={`bg-white dark:bg-slate-850 border rounded-xl p-5 shadow-xs dark:shadow-lg flex flex-col justify-between transition-all hover:border-slate-400 dark:hover:border-slate-600 ${
                      agent.id === 'agent1' ? 'border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-500' :
                      agent.id === 'agent2' ? 'border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500' :
                      agent.id === 'agent3' ? 'border-rose-300 dark:border-rose-500/30 hover:border-rose-500' :
                      'border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500'
                    }`}
                  >
                    <div>
                      {/* Agent Badge & Name */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${agent.badgeColor}`}>
                          {agent.code}
                        </span>
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{agent.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">{agent.role}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300/90 leading-relaxed mb-4 font-medium">{agent.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          onClick={() => onOpenAgentModal(agent.id)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 text-[11px] font-medium cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          <span>View Spec</span>
                        </button>

                        <button
                          onClick={() => handleTestAgent(agent.id)}
                          disabled={isTesting}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {isTesting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-cyan-600 dark:text-cyan-400" />
                              <span>Calling...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                              <span>Test Agent</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Standalone Result Preview */}
                      {result && (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-300 max-h-32 overflow-y-auto font-mono">
                          <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                            <span>Live Standalone Output:</span>
                            <CheckCircle className="w-3 h-3" />
                          </div>
                          <pre className="whitespace-pre-wrap text-[10px] text-slate-700 dark:text-slate-400">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connecting Flow Lines Downward */}
            <div className="flex flex-col items-center my-4">
              <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500 to-purple-500" />
              <div className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 flex items-center space-x-1 shadow-xs font-medium">
                <span>Domain Findings Aggregation &bull; Structured JSON Payloads</span>
                <ArrowDown className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="w-0.5 h-6 bg-purple-500/60" />
            </div>
          </div>

          {/* LOWER-MIDDLE TIER: AGENT 5 (SYNTHESIZER) */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white dark:bg-gradient-to-b dark:from-slate-850 dark:to-slate-900 border border-purple-300 dark:border-purple-500/40 rounded-2xl p-6 shadow-sm dark:shadow-2xl relative transition-colors">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 tracking-wider uppercase flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Level 3: Quantitative & Qualitative Synthesizer</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-800 dark:text-purple-400">{synthesizer.code}</span>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base">{synthesizer.title}</h2>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-200/80 font-semibold">{synthesizer.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onOpenAgentModal(synthesizer.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer font-semibold shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Inspect Prompt</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 leading-relaxed font-medium">
                {synthesizer.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                <span className="text-purple-800 dark:text-purple-300/80 font-semibold">
                  Epistemological Guardrail: Hard separation of mathematical facts vs model risk inferences
                </span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">
                  Feeds into Agent 4 Final Synthesis
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EDUCATIONAL PEDAGOGICAL VIEW */}
      {activeTab === 'educational' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Hierarchical Multi-Agent Orchestration Theory</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              In modern Artificial Intelligence engineering, complex enterprise tasks (such as hospital clinical operations and patient experience governance) exceed the capability of a single monolithic prompt. 
            </p>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-cyan-800 dark:text-cyan-300">1. Supervisor-Worker Pattern:</strong>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  Agent 4 operates as the Supervisor (executive orchestrator), breaking down high-level manager queries into bounded sub-tasks delegated to domain workers (Agents 1, 2, 3, 6).
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-emerald-800 dark:text-emerald-300">2. Parallel vs Sequential Concurrency:</strong>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  Specialist agents can run in parallel (via Promise.all for low latency) or sequentially (when one agent's output is strictly required as prompt context for the next).
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-purple-800 dark:text-purple-300">3. Context Segregation & Modularity:</strong>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  Each agent possesses an isolated system instruction and bespoke schema, avoiding attention dilution and cognitive drift.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Safety, Guardrails & Human-in-the-Loop</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Healthcare environments mandate strict ethical constraints and verifiable boundaries.
            </p>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-rose-700 dark:text-rose-400">Strict Anti-Diagnosis Guardrail:</strong>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  Agents are strictly instructed never to invent clinical diagnoses or recommend medical therapies. Their mandate is purely operational, administrative, and logistical.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-amber-800 dark:text-amber-400">Deterministic Mathematical Grounding:</strong>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  Raw metric figures (wait times, counts, CSAT) are calculated strictly by deterministic TypeScript algorithms. The AI models are forbidden from hallucinating baseline statistics.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-blue-800 dark:text-blue-400">Mandatory Human Review Escalation:</strong>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  Any record indicating potential adverse events, near-miss falls, or medication disputes automatically flags a mandatory clinician human review workflow with an SLA deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
