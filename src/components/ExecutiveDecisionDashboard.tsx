import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  Building, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  FileText,
  Clock
} from 'lucide-react';
import { PatientRecord, CalculatedStatistics, FullOrchestrationResult } from '../types/healthcare';

interface ExecutiveDecisionDashboardProps {
  records: PatientRecord[];
  calculatedStats: CalculatedStatistics;
  latestAnalysis: FullOrchestrationResult | null;
  onUpdateRecord: (updated: PatientRecord) => void;
  datasetName: string;
}

export const ExecutiveDecisionDashboard: React.FC<ExecutiveDecisionDashboardProps> = ({
  records,
  calculatedStats,
  latestAnalysis,
  onUpdateRecord,
  datasetName,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedReviewFilter, setSelectedReviewFilter] = useState<'all' | 'flagged' | 'resolved'>('flagged');

  // Human Review records
  const flaggedRecords = records.filter(r => r.requires_human_review);
  const resolvedRecords = records.filter(r => !r.requires_human_review && r.human_review_notes);

  const displayedReviewRecords = selectedReviewFilter === 'flagged'
    ? flaggedRecords
    : selectedReviewFilter === 'resolved'
    ? resolvedRecords
    : records.filter(r => r.requires_human_review || r.human_review_notes);

  const handleResolveRecord = (record: PatientRecord) => {
    onUpdateRecord({
      ...record,
      requires_human_review: false,
      human_review_notes: `${record.human_review_notes || 'Reviewed'} [Resolved by Clinical Manager on ${new Date().toLocaleDateString()}]`,
    });
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownBrief();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdownBrief = (): string => {
    const agent4 = latestAnalysis?.agent4;
    const stats = calculatedStats;

    return `# HOSPITAL PATIENT EXPERIENCE INTELLIGENCE SYSTEM
## Executive Management Decision Briefing & Quality Governance Report
**Dataset:** ${datasetName}
**Generated Date:** ${new Date().toLocaleDateString()}
**Epistemological Audit:** Calculated Statistics strictly verified from empirical database; Qualitative risk synthesized by Autonomous Multi-Agent Hierarchy (Agents 1 through 6).

---

### 1. KEY TELEMETRY & SCORECARD
- **Total Patient Records Analyzed:** ${stats.totalPatients}
- **Deterministic Mean Wait Time:** ${stats.averageWaitTimeMinutes} minutes (Median: ${stats.medianWaitTimeMinutes}m)
- **Verified Patient CSAT:** ${stats.averageSatisfactionScore} / 5.0
- **Severe Complaints (CSAT ≤ 2):** ${records.filter(r => r.complaint_category && r.satisfaction_score <= 2).length}
- **Left Without Being Seen (LWBS) Walkouts:** ${stats.lwbsCount}
- **Synthesized Organizational Risk Index:** ${latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.organizationalRiskIndex ?? 'Pending Run'}/100
- **Communication Friction Index:** ${latestAnalysis?.agent5?.kpiScorecard?.modelDerived?.communicationFrictionScore ?? 'Pending Run'}/100

---

### 2. EXECUTIVE BRIEFING SYNTHESIS (Agent 4)
${agent4?.executiveSummary || 'Run Multi-Agent Analysis to generate executive briefing.'}

---

### 3. PRIORITIZED STRATEGIC ACTION ROADMAP
${agent4?.strategicRecommendations?.map(rec => `
#### [${rec.priority}] ${rec.action}
- **Department:** ${rec.department}
- **Accountable Role:** ${rec.accountableRole}
- **Timeframe:** ${rec.timeframe}
- **Expected Impact:** ${rec.expectedImpact}
- **Resource Requirement:** ${rec.requiredResources}
`).join('\n') || 'No recommendations generated yet.'}

---

### 4. GOVERNANCE & RISK CONTROLS
${agent4?.governanceAndRiskMitigation?.map(g => `- **[${g.severity}] ${g.riskType}:** ${g.mitigationStrategy} (Oversight: ${g.oversightBody})`).join('\n') || 'None recorded.'}

---

### 5. MANDATORY HUMAN REVIEW ESCALATIONS
Total Flagged for Clinical QA: ${flaggedRecords.length} records
${flaggedRecords.slice(0, 5).map(f => `- **${f.patient_id} (${f.department}):** ${f.human_review_notes || f.feedback_text.slice(0, 80)}`).join('\n')}

*Confidential - Hospital Leadership Quality & Patient Experience Committee*
`;
  };

  return (
    <div className="space-y-8 pb-12 print:bg-white print:text-black">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md print:border-none print:shadow-none print:p-0 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-800 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 print:hidden">
              <FileCheck2 className="w-4 h-4" />
              <span>Section 5 &bull; Executive Governance & Action</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight print:text-black">
              Executive Decision Dashboard & Action Plan
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 print:text-gray-700 font-medium">
              Formulated by Agent 4 (Hospital Manager Decision Support) integrating clinical compliance, triage severity, and operations roadmap.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 print:hidden">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#121c2e] dark:hover:bg-[#1a263d] text-slate-900 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
              <span>{copied ? 'Copied Briefing' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* AGENT 4 TOP MANAGEMENT ALERT */}
      {latestAnalysis?.agent4?.topManagementAlert && (
        <div className={`p-5 rounded-2xl border-2 shadow-xs dark:shadow-md flex items-start space-x-4 transition-colors ${
          latestAnalysis.agent4.topManagementAlert.severity === 'Critical'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 text-rose-950 dark:text-rose-200'
            : latestAnalysis.agent4.topManagementAlert.severity === 'High'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-950 dark:text-amber-200'
            : 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-500/50 text-cyan-950 dark:text-cyan-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 shrink-0 shadow-2xs">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40">
                Agent 4 Top Management Alert &bull; {latestAnalysis.agent4.topManagementAlert.severity}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Area: <strong className="text-slate-900 dark:text-white font-bold">{latestAnalysis.agent4.topManagementAlert.affectedArea}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {latestAnalysis.agent4.topManagementAlert.alertTitle}
            </h2>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {latestAnalysis.agent4.topManagementAlert.description}
            </p>
          </div>
        </div>
      )}

      {/* EXECUTIVE SYNTHESIS BRIEFING */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md print:border-gray-300 transition-colors">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 print:text-black">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Executive Synthesis & C-Suite Guidance</span>
          </h2>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">
            Authored by Agent 4 Orchestrator
          </span>
        </div>

        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed print:text-black font-medium">
          {latestAnalysis?.agent4?.executiveSummary || (
            <span className="text-slate-600 dark:text-slate-400 italic">
              Executive synthesis will appear here once you run the Multi-Agent Analysis. In the meantime, deterministic indicators below highlight operational priorities.
            </span>
          )}
        </p>
      </div>

      {/* AGENT 4 BOTTOM 2-3 RECOMMENDED MANAGEMENT ACTIONS */}
      {latestAnalysis?.agent4?.recommendedManagementActions && latestAnalysis.agent4.recommendedManagementActions.length > 0 && (
        <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Agent 4 Core Management Directives (Operational, Staff & Policy)</span>
            </h2>
            <span className="text-xs text-emerald-900 dark:text-emerald-300 font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-600/50">
              Immediate C-Suite Actions
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestAnalysis.agent4.recommendedManagementActions.map((action, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 p-4 rounded-xl flex items-start space-x-3 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 border border-cyan-300 dark:border-cyan-700/60">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGENT 5 SECTION 6: EXECUTIVE RECOMMENDATIONS */}
      {latestAnalysis?.agent5?.section6_ExecutiveRecommendations && (
        <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md space-y-5 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              <span>Agent 5 Healthcare Analytics Executive Recommendations</span>
            </h2>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">Synthesized from Specialist Findings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 5 Organizational Priorities */}
            <div className="bg-slate-50 dark:bg-[#121c2e] border border-slate-300 dark:border-slate-750/80 rounded-xl p-4 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Top Organizational Priorities
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 font-medium">
                {latestAnalysis.agent5.section6_ExecutiveRecommendations.top5OrganizationalPriorities.map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-600 dark:text-amber-400 shrink-0 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Wins 3 Months */}
            <div className="bg-slate-50 dark:bg-[#121c2e] border border-slate-300 dark:border-slate-750/80 rounded-xl p-4 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Quick Wins (Within 3 Months)
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 font-medium">
                {latestAnalysis.agent5.section6_ExecutiveRecommendations.quickWins3Months.map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Long-Term AI Opportunities 6-12 Months */}
            <div className="bg-slate-50 dark:bg-[#121c2e] border border-slate-300 dark:border-slate-750/80 rounded-xl p-4 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                Long-Term AI Opportunities (6-12 Months)
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 font-medium">
                {latestAnalysis.agent5.section6_ExecutiveRecommendations.longTermAIOpportunities6To12Months.map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-purple-600 dark:text-purple-400 shrink-0 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PRIORITIZED ACTION ROADMAP */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center space-x-2 print:text-black">
          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Strategic Operational Roadmap</span>
        </h2>

        {latestAnalysis?.agent4?.strategicRecommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestAnalysis.agent4.strategicRecommendations.map((rec, i) => (
              <div 
                key={rec.id || i}
                className={`bg-white dark:bg-[#121c2e] p-5 rounded-2xl border-2 shadow-2xs dark:shadow-md space-y-3 print:bg-white print:border-gray-300 transition-colors ${
                  rec.priority?.includes('Immediate') ? 'border-rose-400 dark:border-rose-600/60' :
                  rec.priority?.includes('High') ? 'border-amber-400 dark:border-amber-600/60' :
                  'border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rec.priority?.includes('Immediate') ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40' :
                    rec.priority?.includes('High') ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40' :
                    'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-500/40'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                    <span>{rec.department}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base print:text-black">{rec.action}</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 print:text-gray-800 leading-relaxed font-medium">{rec.expectedImpact}</p>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 print:border-gray-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-slate-700 dark:text-slate-400 font-bold text-[10px] uppercase">Accountability:</span>
                    <strong className="text-slate-900 dark:text-slate-200 print:text-black font-semibold">{rec.accountableRole}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-700 dark:text-slate-400 font-bold text-[10px] uppercase">Timeframe:</span>
                    <strong className="text-slate-900 dark:text-slate-200 print:text-black font-semibold">{rec.timeframe}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-700 dark:text-slate-400 font-bold text-[10px] uppercase">Resource Required:</span>
                    <span className="text-slate-800 dark:text-slate-300 print:text-gray-700 font-medium">{rec.requiredResources}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 text-center text-xs text-slate-700 dark:text-slate-400 font-semibold shadow-xs">
            Execute a Multi-Agent Analysis run to generate dynamic strategic recommendations.
          </div>
        )}
      </div>

      {/* HUMAN-IN-THE-LOOP QUALITY ASSURANCE QUEUE */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md print:border-gray-300 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white print:text-black">
                Human-in-the-Loop Quality & Safety Review Queue
              </h2>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
              Strict ethical safety requirement: Cases flagged with medication risks, near-miss falls, or Level 3/4 complaints must be signed off by human clinicians.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-[#080d18] p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs print:hidden">
            <button
              onClick={() => setSelectedReviewFilter('flagged')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedReviewFilter === 'flagged' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pending Review ({flaggedRecords.length})
            </button>
            <button
              onClick={() => setSelectedReviewFilter('resolved')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedReviewFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Resolved ({resolvedRecords.length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {displayedReviewRecords.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-600 dark:text-slate-400 font-semibold">
              No records in this review queue.
            </div>
          ) : (
            displayedReviewRecords.map(r => (
              <div 
                key={r.id}
                className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors shadow-2xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-800 dark:text-cyan-300">{r.patient_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-[#080d18] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold">
                      {r.department}
                    </span>
                    <span className="text-slate-700 dark:text-slate-400 text-[11px] font-medium font-mono tabular-nums">&bull; CSAT: {r.satisfaction_score}/5 &bull; Wait: {r.wait_time_minutes}m</span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 italic font-medium">"{r.feedback_text}"</p>

                  {r.human_review_notes && (
                    <div className="text-rose-950 dark:text-rose-200 text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-300 dark:border-rose-500/30">
                      <strong>Review Note:</strong> {r.human_review_notes}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  {r.requires_human_review ? (
                    <button
                      onClick={() => handleResolveRecord(r)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review Completed</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
