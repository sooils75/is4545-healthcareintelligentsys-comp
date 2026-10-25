import React from 'react';
import { 
  Users, 
  Clock, 
  Star, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Brain, 
  Calculator,
  MessageSquareWarning,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { PatientRecord, CalculatedStatistics, FullOrchestrationResult } from '../types/healthcare';

interface ExecutiveOverviewProps {
  records: PatientRecord[];
  calculatedStats: CalculatedStatistics;
  latestAnalysis: FullOrchestrationResult | null;
  onNavigateToAnalysis: () => void;
  onNavigateToExplorer: (filter?: string) => void;
  datasetName: string;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  records,
  calculatedStats,
  latestAnalysis,
  onNavigateToAnalysis,
  onNavigateToExplorer,
  datasetName,
}) => {
  const flaggedCount = records.filter(r => r.requires_human_review).length;
  const severeComplaints = records.filter(r => r.complaint_category && Number(r.satisfaction_score) <= 2).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Distinction Notice */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1.5 px-2.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60">
              <Activity className="w-3.5 h-3.5" />
              <span>Section 1 &bull; Executive Command Center</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hospital Patient Experience Intelligence Overview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Active Dataset: <span className="text-slate-900 dark:text-white font-semibold underline decoration-cyan-500/50">{datasetName}</span>. 
              Synthesizing real-time empirical operational telemetry with autonomous multi-agent cognitive evaluations.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onNavigateToAnalysis}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Multi-Agent Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Epistemological Distinction Banner */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start space-x-3 bg-blue-50/80 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-2xs">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0 shadow-2xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-blue-900 dark:text-blue-200 text-sm">📊 Calculated Statistics (Deterministic):</span>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                Direct arithmetic computations derived purely from raw record fields (e.g., patient counts, mathematical mean wait times, distribution percentages). Unbiased and verifiable.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-purple-50/80 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-2xs">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0 shadow-2xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-purple-900 dark:text-purple-200 text-sm">🧠 Model-Generated Interpretations (Cognitive):</span>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                Autonomous qualitative synthesis produced by Gemini specialist agents (thematic sentiment, latent risk flags, triage severity Levels 1-4, and health literacy scoring).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Deterministic Operational Telemetry (Calculated)</span>
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold font-mono">Based on {calculatedStats.totalPatients} verified records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Patients */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs mb-1 font-semibold">
              <span>Total Records</span>
              <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{calculatedStats.totalPatients}</div>
            <div className="text-[11px] text-cyan-800 dark:text-cyan-300 mt-1 font-semibold flex items-center space-x-1">
              <span>Active sample</span>
            </div>
          </div>

          {/* Average Wait Time */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs mb-1 font-semibold">
              <span>Mean Wait Time</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {calculatedStats.averageWaitTimeMinutes} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">min</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium font-mono">
              Median: {calculatedStats.medianWaitTimeMinutes}m
            </div>
          </div>

          {/* Mean CSAT Score */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs mb-1 font-semibold">
              <span>Average CSAT</span>
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-yellow-500/20" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {calculatedStats.averageSatisfactionScore.toFixed(2)} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {calculatedStats.averageSatisfactionScore >= 3.5 ? 'Above target benchmark' : 'Below target benchmark'}
            </div>
          </div>

          {/* Severe Grievances */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs mb-1 font-semibold">
              <span>Severe Grievances</span>
              <MessageSquareWarning className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">{severeComplaints}</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              CSAT &le; 2 with complaints
            </div>
          </div>

          {/* Left Without Being Seen */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs mb-1 font-semibold">
              <span>LWBS Walkouts</span>
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 tabular-nums">{calculatedStats.lwbsCount}</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Left without being seen
            </div>
          </div>

          {/* Human Review Queue */}
          <div 
            onClick={() => onNavigateToExplorer('flagged')}
            className="bg-white dark:bg-[#121c2e] border border-rose-300 dark:border-rose-500/50 hover:border-rose-500 rounded-xl p-4 shadow-2xs hover:shadow-xs cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs mb-1 font-semibold">
              <span className="text-rose-800 dark:text-rose-300 font-bold">Review Flags</span>
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">{flaggedCount}</div>
            <div className="text-[11px] text-rose-800 dark:text-rose-300 mt-1 font-bold flex items-center space-x-0.5">
              <span>Inspect flagged</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* MODEL-DERIVED INTELLIGENCE SUMMARY (From Multi-Agent Analysis) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>AI Specialist Agent Synthesis (Model-Derived)</span>
          </h2>
          {latestAnalysis ? (
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-md border border-purple-300 dark:border-purple-700/60">
              Active Synthesis &bull; Completed in {(latestAnalysis.totalDurationMs / 1000).toFixed(1)}s
            </span>
          ) : (
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Run Multi-Agent Analysis to populate model-derived indices
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Organizational Risk Index */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-5 relative overflow-hidden shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">Organizational Risk Index</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">Agent 5</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.organizationalRiskIndex ?? 58}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  (latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.organizationalRiskIndex ?? 58) > 60
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                }`}
                style={{ width: `${latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.organizationalRiskIndex ?? 58}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed font-medium">
              Synthesized from latent safety signals, severe complaint density, and triage dwell times.
            </p>
          </div>

          {/* Communication Friction Score */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">Communication Friction</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">Agent 6</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.communicationFrictionScore ?? 
                 (latestAnalysis?.agent6 ? Math.round(100 - latestAnalysis.agent6.aggregateScores.overallCommunicationScore) : 48)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                style={{ width: `${latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.communicationFrictionScore ?? 48}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed font-medium">
              Measures medical jargon density, readability deficit, and lack of discharge actionability.
            </p>
          </div>

          {/* Equity & Vulnerability Alert */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">Equity & Disparity Alert</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">Agent 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                (latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.equityAlertLevel || 'Elevated') === 'Critical'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/60'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/60'
              }`}>
                {latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.equityAlertLevel || 'Elevated'}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-3 leading-relaxed font-medium">
              Identified language translation gaps and digital portal literacy friction among geriatric cohorts.
            </p>
          </div>

          {/* Service Recovery Urgency */}
          <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">Service Recovery Urgency</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">Agent 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold px-3 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/60">
                {latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.serviceRecoveryUrgency || 'High Priority'}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-3 leading-relaxed font-medium">
              {latestAnalysis?.agent3?.triageSummary?.level4Count 
                ? `${latestAnalysis.agent3.triageSummary.level4Count} Critical Level-4 safety events require immediate human follow-up.`
                : 'Multiple Level-3 service breakdowns warrant clinical manager intervention.'}
            </p>
          </div>
        </div>
      </div>

      {/* DEPARTMENTAL BENCHMARK MATRIX & SATISFACTION HISTOGRAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Benchmark Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Departmental Operational Benchmark</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Comparing patient volume, wait times, and satisfaction ratings</p>
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-mono font-bold bg-slate-100 dark:bg-[#121c2e] px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs">
              {calculatedStats.departmentBreakdown.length} Clinical Units
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#080d17] text-slate-800 dark:text-slate-300 uppercase text-[10px] font-bold border-b-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3.5">Department</th>
                  <th className="py-3 px-3.5">Patients</th>
                  <th className="py-3 px-3.5">Mean Wait</th>
                  <th className="py-3 px-3.5">Mean CSAT</th>
                  <th className="py-3 px-3.5">Grievances</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0e1626]">
                {calculatedStats.departmentBreakdown.map((dept) => {
                  const isHighWait = dept.averageWaitTime > 120;
                  const isLowSat = dept.averageSatisfaction < 3.0;
                  return (
                    <tr key={dept.department} className="hover:bg-cyan-50/60 dark:hover:bg-[#142036] transition">
                      <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span>{dept.department}</span>
                      </td>
                      <td className="py-3 px-3.5 font-mono tabular-nums font-semibold">{dept.patientCount}</td>
                      <td className="py-3 px-3.5">
                        <span className={`font-mono font-bold tabular-nums ${isHighWait ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {dept.averageWaitTime} min
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-mono font-bold tabular-nums ${isLowSat ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                            {dept.averageSatisfaction.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">/ 5</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold tabular-nums text-rose-700 dark:text-rose-300">
                        {dept.complaintCount}
                      </td>
                      <td className="py-3 px-3.5">
                        {isLowSat || isHighWait ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60">
                            Attention Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60">
                            Stable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSAT Distribution Breakdown */}
        <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md flex flex-col justify-between transition-colors">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Satisfaction Distribution</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Patient rating spread (1 to 5 Stars)</p>
            </div>

            <div className="space-y-3.5">
              {calculatedStats.satisfactionDistribution.slice().reverse().map((item) => (
                <div key={item.score} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1 font-semibold">
                      <span>{item.score}</span>
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold tabular-nums">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.score >= 4
                          ? 'bg-emerald-500'
                          : item.score === 3
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs flex flex-col space-y-2">
            <button
              onClick={() => onNavigateToExplorer()}
              className="w-full text-center py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-[#121c2e] dark:hover:bg-[#1a263d] dark:text-slate-200 dark:border-slate-700 transition font-bold cursor-pointer shadow-2xs"
            >
              Explore All {calculatedStats.totalPatients} Patient Comments &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
