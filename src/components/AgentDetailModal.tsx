import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Brain, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  GitBranch 
} from 'lucide-react';
import { 
  AGENT_1_PROMPT, 
  AGENT_2_PROMPT, 
  AGENT_3_PROMPT, 
  AGENT_4_PROMPT, 
  AGENT_5_PROMPT, 
  AGENT_6_PROMPT 
} from '../prompts/agentPrompts';

interface AgentDetailModalProps {
  agentId: string | null;
  onClose: () => void;
  onRunStandalone: (agentId: string) => Promise<any>;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agentId,
  onClose,
  onRunStandalone,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!agentId) return null;

  const agentSpecs: Record<string, {
    title: string;
    code: string;
    category: string;
    model: string;
    systemInstruction: string;
    inputSchema: string;
    outputSchema: string;
    guardrails: string[];
  }> = {
    agent4: {
      title: 'Hospital Manager Decision Support Agent',
      code: 'Agent 4',
      category: 'Central Orchestrator & Manager Decision Support',
      model: 'gemini-3.8-flash (Structured JSON)',
      systemInstruction: AGENT_4_PROMPT,
      inputSchema: `{
  "taskType": "full_audit" | "ed_surge" | "discharge_safety" | "triage_complaints" | "communication_audit" | "custom",
  "managerObjective": string,
  "executionMode": "parallel" | "sequential",
  "dataset": [ { "patient_persona": string, "service_line": string, "visit_type": string, "patient_satisfaction": number, "communication_rating": number, "follow_up_compliance": string, "complaint_severity": string, "patient_portal_usage": string, "readmission_risk": string, "ai_risk_flags": string, "feedback_text": string } ]
}`,
      outputSchema: `{
  "agentId": "agent4",
  "topManagementAlert": { "alertTitle": string, "severity": "Critical"|"High"|"Moderate", "description": string, "affectedArea": string },
  "caseAnalyses": [ { "caseId": string, "patientPersona": string, "mainProblem": string, "managementPriority": "Low"|"Medium"|"High", "priorityReasoning": string, "recommendedActions": string[], "humanReviewNeeded": boolean } ],
  "recommendedManagementActions": [ "Action 1", "Action 2", "Action 3" ]
}`,
      guardrails: [
        'Do not diagnose medical conditions or recommend medical treatment',
        'Use only the information provided. Do not invent missing information',
        'Recommend human review for unclear, contradictory, sensitive, or high-risk cases',
        'Pay special attention to AI Risk Flags (Hallucination Risk, Bias Review, Human Review Required)',
      ]
    },
    agent1: {
      title: 'Patient Feedback Insight Agent',
      code: 'Agent 1',
      category: 'Patient Comment Experience & Risk Analyst',
      model: 'gemini-3.8-flash (Structured JSON)',
      systemInstruction: AGENT_1_PROMPT,
      inputSchema: `{ "records": [ { "patient_id": string, "feedback_text": string, "satisfaction_score": number } ] }`,
      outputSchema: `{
  "agentId": "agent1",
  "results": [ {
    "patientId": string,
    "theme": "Communication"|"Scheduling"|"Wait Time"|"Technology / Patient Portal"|"Billing"|"Clinical Care"|"Discharge / Follow-Up"|"Accessibility / Equity"|"Mixed or Ambiguous",
    "sentiment": "Positive"|"Negative"|"Neutral"|"Mixed",
    "reasoning": string,
    "operationalIssue": string,
    "riskOrBiasConcern": string,
    "recommendedAction": string
  } ]
}`,
      guardrails: [
        'Use a professional healthcare quality-improvement tone',
        'Do not invent medical facts',
        'If ambiguous, say so clearly; state what additional information would be needed',
      ]
    },
    agent2: {
      title: 'Patient Experience Monitoring Agent',
      code: 'Agent 2',
      category: 'Macro Experience, Equity & Operational Monitor',
      model: 'gemini-3.8-flash (Structured JSON)',
      systemInstruction: AGENT_2_PROMPT,
      inputSchema: `{ "records": [...], "calculatedStats": {...} }`,
      outputSchema: `{
  "agentId": "agent2",
  "results": [ {
    "caseId": string,
    "primaryTheme": string,
    "operationalBottlenecks": string[],
    "equityAndAccessibilityFlags": [ { "affectedGroup": string, "concernDetails": string } ],
    "riskAssessment": { "overallRisk": "Low"|"Moderate"|"High" },
    "managerialRecommendation": string
  } ],
  "systemicBottlenecks": [...],
  "equityReviewSummary": string
}`,
      guardrails: [
        'Identify specific bottlenecks involving older adults, rural patients, disabilities, LEP, low digital literacy',
        'Classify risk across Patient Safety, Reputational, Compliance, Equity',
        'Do not invent medical facts',
      ]
    },
    agent3: {
      title: 'Complaint Triage Assistant',
      code: 'Agent 3',
      category: 'Complaint Triage, Severity & Route Router',
      model: 'gemini-3.8-flash (Structured JSON)',
      systemInstruction: AGENT_3_PROMPT,
      inputSchema: `{ "records": [ { "patient_id": string, "feedback_text": string, "complaint_category": string } ] }`,
      outputSchema: `{
  "agentId": "agent3",
  "triageResults": [ {
    "caseId": string,
    "whatHappened": string,
    "primaryCategory": "Communication"|"Scheduling"|"Wait Time"|"Technology / Patient Portal"|"Billing"|"Clinical Care"|"Patient Safety"|"Privacy or Security"|"Staff Conduct"|"Other",
    "severityLevel": "LEVEL 1 – Low"|"LEVEL 2 – Moderate"|"LEVEL 3 – High"|"LEVEL 4 – Critical",
    "severityReasoning": string,
    "risksDetected": [...],
    "routeTo": "Patient Experience Team"|"Nursing Leadership"|"Physician Leadership"|"Quality Improvement Team"|"Compliance Office"|"Information Technology"|"Revenue Cycle / Billing"|"Accessibility Coordinator"|"Risk Management"|"Executive Review",
    "humanInterventionRequired": boolean
  } ]
}`,
      guardrails: [
        'Do NOT resolve complaints; triage and route only',
        'Assign Severity Levels 1 through 4 with explicit reasoning',
        'Flag immediate human intervention for clinical and patient safety risks',
      ]
    },
    agent6: {
      title: 'Healthcare Communication Quality Evaluator',
      code: 'Agent 6',
      category: 'Health Literacy & Communication Evaluator',
      model: 'gemini-3.8-flash (Structured JSON)',
      systemInstruction: AGENT_6_PROMPT,
      inputSchema: `{ "records": [ { "communication_text": string, "feedback_text": string } ] }`,
      outputSchema: `{
  "agentId": "agent6",
  "evaluations": [ {
    "caseId": string,
    "communicationPurpose": { "purpose": "Patient Education"|"Medication Instructions"|..., "rationale": string },
    "qualityScores": { "clarity": 1-5, "organization": 1-5, "completeness": 1-5, "readability": 1-5, "professionalism": 1-5, "empathy": 1-5, "patientCenteredness": 1-5, "actionability": 1-5 },
    "healthLiteracyAssessment": { "classification": "Excellent"|"Good"|"Fair"|"Poor" },
    "communicationRisks": { "riskLevel": "Low"|"Moderate"|"High" },
    "improvementRecommendations": string[],
    "rewrittenCommunication": string (6th-grade reading level),
    "executiveSummary": { "overallQuality": string, "majorStrengths": [], "majorWeaknesses": [], "highestCommunicationRisk": string, "mostImportantImprovement": string }
  } ]
}`,
      guardrails: [
        'Evaluate communication quality, not medical correctness',
        'Preserve original meaning when rewriting to 6th-grade level',
        'Prioritize clarity, empathy, accessibility, and patient safety',
      ]
    },
    agent5: {
      title: 'Healthcare Analytics Agent',
      code: 'Agent 5',
      category: 'Executive Dashboard Synthesizer (6 Sections)',
      model: 'gemini-3.8-flash (Structured JSON)',
      systemInstruction: AGENT_5_PROMPT,
      inputSchema: `{ "calculatedStats": {...}, "agent1Output": {...}, "agent2Output": {...}, "agent3Output": {...}, "agent6Output": {...} }`,
      outputSchema: `{
  "agentId": "agent5",
  "section1_ExecutiveOverview": { "totalCommentsAnalyzed": number, "averageSatisfactionScore": number, "averageCommunicationRating": number, "followUpComplianceRate": number, "serviceLinesRepresented": number },
  "section2_SatisfactionInsights": { "satisfactionDistribution": [], "byServiceLine": [], "byVisitType": [], "byPatientPersona": [] },
  "section3_NLPAnalysis": { "topThemes": [], "frequentKeywords": [], "themeDistribution": {}, "wordCloud": [] },
  "section4_HiddenOrganizationalProblems": { "highComplaintServiceLines": [], "communicationBottlenecks": [], "techIssues": [], "schedulingIssues": [], "waitTimeComplaints": [] },
  "section5_AIRiskMonitoring": { "hallucinationTrapComments": [], "biasRelatedComments": [], "casesRequiringHumanReview": [] },
  "section6_ExecutiveRecommendations": { "top5OrganizationalPriorities": [], "quickWins3Months": [], "longTermAIOpportunities6To12Months": [] }
}`,
      guardrails: [
        'Synthesizes completed specialist results without independently inventing findings',
        '6 dedicated sections: Overview, Satisfaction, NLP, Problems, AI Risk, Recommendations',
        'Do not resolve complaints or invent medical facts',
      ]
    }
  };

  const spec = agentSpecs[agentId] || agentSpecs.agent4;

  const handleRun = async () => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const res = await onRunStandalone(agentId);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Execution error' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(spec.systemInstruction);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0e1626] border-2 border-slate-300 dark:border-slate-750 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#121c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-slate-300 dark:border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-700/60 flex items-center justify-center text-cyan-800 dark:text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-400">{spec.code}</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{spec.title}</h2>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {spec.category} &bull; Model: <span className="text-slate-900 dark:text-white font-mono font-bold">{spec.model}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Authoritative System Prompt Box */}
          <div className="bg-slate-50 dark:bg-[#121c2e] p-4 rounded-xl border border-slate-300 dark:border-slate-750/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                <span>Authoritative Reusable System Prompt</span>
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 dark:bg-[#080d18] dark:hover:bg-[#1a263d] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[11px] transition cursor-pointer font-bold shadow-2xs"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>
            <pre className="bg-white dark:bg-[#080d18] p-3 rounded-lg border border-slate-300 dark:border-slate-800 font-mono text-[11px] text-slate-900 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {spec.systemInstruction}
            </pre>
          </div>

          {/* JSON Schemas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#121c2e] p-3.5 rounded-xl border border-slate-300 dark:border-slate-750/80 shadow-2xs">
              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] block mb-1">
                Input JSON Data Contract
              </span>
              <pre className="bg-white dark:bg-[#080d18] p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 font-mono text-[10px] text-slate-900 dark:text-cyan-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {spec.inputSchema}
              </pre>
            </div>

            <div className="bg-slate-50 dark:bg-[#121c2e] p-3.5 rounded-xl border border-slate-300 dark:border-slate-750/80 shadow-2xs">
              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] block mb-1">
                Structured Output JSON Contract
              </span>
              <pre className="bg-white dark:bg-[#080d18] p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 font-mono text-[10px] text-slate-900 dark:text-emerald-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {spec.outputSchema}
              </pre>
            </div>
          </div>

          {/* Constraints & Guardrails */}
          <div className="bg-slate-50 dark:bg-[#121c2e] p-3.5 rounded-xl border border-slate-300 dark:border-slate-750/80 shadow-2xs">
            <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] block mb-2 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Specification Constraints & Guardrails</span>
            </span>
            <ul className="space-y-1 text-slate-800 dark:text-slate-300 text-[11px] font-medium">
              {spec.guardrails.map((g, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Standalone Execution Tester */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                Test Agent Independently with Active Dataset:
              </span>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Model...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Standalone Test</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className="bg-white dark:bg-[#080d18] p-3 rounded-xl border border-slate-300 dark:border-slate-800 font-mono text-[11px] text-slate-900 dark:text-slate-200 max-h-52 overflow-y-auto">
                <span className="text-emerald-800 dark:text-emerald-400 font-sans font-bold block mb-1">
                  Live Response Payload:
                </span>
                <pre className="whitespace-pre-wrap text-slate-900 dark:text-slate-200 font-mono">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
