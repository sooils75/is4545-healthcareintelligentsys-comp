export interface PatientRecord {
  id: string;
  patient_id: string;
  patient_persona?: string; // e.g. 'Elderly Chronic Care', 'Working Parent', 'Post-Op Recovery', 'Rural Commuter'
  age_group?: string; // e.g. '18-35', '36-50', '51-65', '66+'
  gender?: string;
  department: 'Emergency' | 'Inpatient Med-Surg' | 'Cardiology' | 'Pediatrics' | 'Ambulatory Surgery' | 'Outpatient Specialty';
  service_line?: string; // Aligned with department / clinical specialty
  visit_type?: 'Emergency' | 'Inpatient' | 'Outpatient' | 'Telehealth' | 'Ambulatory Surgery';
  visit_date: string;
  wait_time_minutes: number;
  satisfaction_score: number; // 1 to 5
  patient_satisfaction?: number; // 1 to 5
  communication_rating?: number; // 1 to 5
  follow_up_compliance?: 'Compliant' | 'Non-Compliant' | 'Pending';
  complaint_severity?: 'LEVEL 1 – Low' | 'LEVEL 2 – Moderate' | 'LEVEL 3 – High' | 'LEVEL 4 – Critical' | 'None';
  patient_portal_usage?: 'Active' | 'Inactive' | 'Never Logged In';
  readmission_risk?: 'Low' | 'Moderate' | 'High';
  ai_risk_flags?: 'None' | 'Hallucination Risk' | 'Bias Review' | 'Human Review Required' | string[] | string;
  feedback_text: string;
  communication_text?: string;
  complaint_category?: 'Communication' | 'Scheduling' | 'Wait Time' | 'Technology / Patient Portal' | 'Billing' | 'Clinical Care' | 'Patient Safety' | 'Privacy or Security' | 'Staff Conduct' | 'Other';
  triage_acuity?: 'Level 1 - Resuscitation' | 'Level 2 - Emergent' | 'Level 3 - Urgent' | 'Level 4 - Less Urgent' | 'Level 5 - Non-Urgent';
  primary_language?: 'English' | 'Spanish' | 'Mandarin' | 'Vietnamese' | 'Arabic' | 'Other';
  discharge_status?: 'Routine Home' | 'Home with Home Health' | 'Transferred' | 'Left Without Being Seen (LWBS)' | 'Admitted';
  requires_human_review?: boolean;
  human_review_notes?: string;
}

export interface CalculatedStatistics {
  totalPatients: number;
  averageWaitTimeMinutes: number;
  medianWaitTimeMinutes: number;
  averageSatisfactionScore: number;
  averageCommunicationRating: number;
  followUpComplianceRate: number; // percentage (0-100)
  serviceLinesRepresented: number;
  satisfactionDistribution: { score: number; count: number; percentage: number }[];
  departmentBreakdown: {
    department: string;
    patientCount: number;
    averageWaitTime: number;
    averageSatisfaction: number;
    complaintCount: number;
  }[];
  languageBreakdown: { language: string; count: number; averageSatisfaction: number }[];
  severeAcuityCount: number;
  lwbsCount: number;
}

// -------------------------------------------------------------
// STANDARD RESULT ENVELOPE (Requirement 5)
// -------------------------------------------------------------
export interface StandardResultEnvelope {
  agentId: 'agent1' | 'agent2' | 'agent3' | 'agent4' | 'agent5' | 'agent6';
  agentTitle: string;
  caseId: string;
  summary: string;
  supportingEvidence: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  humanReviewRequired: boolean;
  humanReviewReason?: string;
}

// -------------------------------------------------------------
// AGENT 1: Patient Feedback Insight Agent Output
// -------------------------------------------------------------
export interface Agent1CaseEvaluation extends StandardResultEnvelope {
  patientId: string;
  theme: 'Communication' | 'Scheduling' | 'Wait Time' | 'Technology / Patient Portal' | 'Billing' | 'Clinical Care' | 'Discharge / Follow-Up' | 'Accessibility / Equity' | 'Mixed or Ambiguous';
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  reasoning: string;
  operationalIssue: string;
  riskOrBiasConcern: string;
  recommendedAction: string;
}

export interface Agent1Output {
  agentId: 'agent1';
  agentTitle: string;
  results: Agent1CaseEvaluation[];
  overallSentiment: {
    score: number; // -1.0 to 1.0
    label: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
    distribution: { positive: number; neutral: number; negative: number; mixed: number };
  };
  thematicAnalysis: {
    theme: string;
    category: string;
    frequencyCount: number;
    sentimentScore: number;
    representativeQuotes: string[];
    operationalImplication: string;
  }[];
  operationalIssues: {
    issue: string;
    department: string;
    severity: 'Low' | 'Medium' | 'High';
    affectedRecordIds: string[];
  }[];
  latentSafetySignals: {
    recordId: string;
    signal: string;
    context: string;
    riskLevel: 'High' | 'Moderate' | 'Low';
  }[];
}

// -------------------------------------------------------------
// AGENT 2: Patient Experience Monitoring Agent Output
// -------------------------------------------------------------
export interface Agent2CaseEvaluation extends StandardResultEnvelope {
  primaryTheme: string;
  secondaryThemes: string[];
  operationalBottlenecks: string[];
  equityAndAccessibilityFlags: {
    affectedGroup: string;
    concernDetails: string;
  }[];
  riskAssessment: {
    overallRisk: 'Low' | 'Moderate' | 'High';
    riskCategories: {
      patientSafety?: string;
      reputational?: string;
      compliance?: string;
      equity?: string;
    };
  };
  managerialRecommendation: string;
}

export interface Agent2Output {
  agentId: 'agent2';
  agentTitle: string;
  summary: string;
  results: Agent2CaseEvaluation[];
  trendOverview: string;
  departmentalRankings: {
    department: string;
    performanceRating: 'Exemplary' | 'Satisfactory' | 'Needs Improvement' | 'Critical Attention';
    keyBottleneck: string;
    primaryStrength: string;
    satisfactionTrend: 'Improving' | 'Stable' | 'Declining';
  }[];
  systemicBottlenecks: {
    bottleneck: string;
    frequency: number;
    suggestedIntervention: string;
  }[];
  equityReviewSummary: string;
}

// -------------------------------------------------------------
// AGENT 3: Complaint Triage Assistant Output
// -------------------------------------------------------------
export interface Agent3CaseTriage extends StandardResultEnvelope {
  whatHappened: string;
  primaryCategory: 'Communication' | 'Scheduling' | 'Wait Time' | 'Technology / Patient Portal' | 'Billing' | 'Clinical Care' | 'Patient Safety' | 'Privacy or Security' | 'Staff Conduct' | 'Other';
  secondaryCategories: string[];
  severityLevel: 'LEVEL 1 – Low' | 'LEVEL 2 – Moderate' | 'LEVEL 3 – High' | 'LEVEL 4 – Critical';
  severityReasoning: string;
  risksDetected: {
    riskType: 'Patient Safety Risk' | 'Clinical Risk' | 'Compliance Risk' | 'Privacy Risk' | 'Accessibility Risk' | 'Equity Risk' | 'Reputational Risk' | 'Operational Risk';
    explanation: string;
  }[];
  routeTo: 'Patient Experience Team' | 'Nursing Leadership' | 'Physician Leadership' | 'Quality Improvement Team' | 'Compliance Office' | 'Information Technology' | 'Revenue Cycle / Billing' | 'Accessibility Coordinator' | 'Risk Management' | 'Executive Review';
  escalationTimeline: string;
  humanInterventionRequired: boolean;
}

export interface Agent3Output {
  agentId: 'agent3';
  agentTitle: string;
  summary: string;
  triageResults: Agent3CaseTriage[];
  triageSummary: {
    totalComplaints: number;
    level1Count: number;
    level2Count: number;
    level3Count: number;
    level4Count: number;
    urgentHumanReviewCount: number;
  };
  severityDistribution: { level1: number; level2: number; level3: number; level4: number };
  routingBreakdown: { [department: string]: number };
}

// -------------------------------------------------------------
// AGENT 6: Healthcare Communication Quality Evaluator Output
// -------------------------------------------------------------
export interface Agent6CaseEvaluation extends StandardResultEnvelope {
  originalText: string;
  communicationPurpose: {
    purpose: 'Patient Education' | 'Appointment Information' | 'Medication Instructions' | 'Follow-up Care' | 'Care Coordination' | 'Administrative Communication' | 'Billing Communication' | 'Health Promotion' | 'Emergency Instructions' | 'Other';
    rationale: string;
  };
  qualityScores: {
    clarity: { score: number; explanation: string };
    organization: { score: number; explanation: string };
    completeness: { score: number; explanation: string };
    readability: { score: number; explanation: string };
    professionalism: { score: number; explanation: string };
    empathy: { score: number; explanation: string };
    patientCenteredness: { score: number; explanation: string };
    actionability: { score: number; explanation: string };
  };
  averageScore: number;
  healthLiteracyAssessment: {
    classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    jargonDetected: string[];
    explanation: string;
  };
  communicationRisks: {
    riskLevel: 'Low' | 'Moderate' | 'High';
    reason: string;
    riskCategories: string[];
  };
  improvementRecommendations: string[];
  rewrittenCommunication: string;
  executiveSummary: {
    overallQuality: string;
    majorStrengths: string[];
    majorWeaknesses: string[];
    highestCommunicationRisk: string;
    mostImportantImprovement: string;
  };
}

export interface Agent6Output {
  agentId: 'agent6';
  agentTitle: string;
  summary: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  humanReviewRequired: boolean;
  evaluations: Agent6CaseEvaluation[];
  aggregateScores: {
    overallCommunicationScore: number;
    clarity: number;
    readability: number;
    empathy: number;
    healthLiteracy: number;
    actionability: number;
    averageReadingGradeLevel: string;
  };
  jargonIdentified: {
    jargonTerm: string;
    frequency: number;
    plainLanguageAlternative: string;
    contextFound: string;
  }[];
}

// -------------------------------------------------------------
// AGENT 5: Healthcare Analytics Agent Output (Sections 1 through 6)
// -------------------------------------------------------------
export interface Agent5Output {
  agentId: 'agent5';
  agentTitle: string;
  summary: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  humanReviewRequired: boolean;
  
  section1_ExecutiveOverview: {
    totalCommentsAnalyzed: number;
    averageSatisfactionScore: number;
    averageCommunicationRating: number;
    followUpComplianceRate: number;
    serviceLinesRepresented: number;
  };

  section2_SatisfactionInsights: {
    satisfactionDistribution: { score: number; count: number; percentage: number }[];
    byServiceLine: { serviceLine: string; avgScore: number; count: number }[];
    byVisitType: { visitType: string; avgScore: number; count: number }[];
    byPatientPersona: { persona: string; avgScore: number; count: number }[];
  };

  section3_NLPAnalysis: {
    topThemes: { theme: string; count: number; percentage: number }[];
    frequentKeywords: { word: string; count: number }[];
    themeDistribution: { [theme: string]: number };
    wordCloud: { text: string; value: number }[];
  };

  section4_HiddenOrganizationalProblems: {
    highComplaintServiceLines: { serviceLine: string; complaintRate: number; explanation: string }[];
    communicationBottlenecks: string[];
    techIssues: string[];
    schedulingIssues: string[];
    waitTimeComplaints: string[];
  };

  section5_AIRiskMonitoring: {
    hallucinationTrapComments: { caseId: string; comment: string; flagReason: string }[];
    biasRelatedComments: { caseId: string; comment: string; biasCategory: string }[];
    casesRequiringHumanReview: { caseId: string; reason: string; priority: string }[];
  };

  section6_ExecutiveRecommendations: {
    top5OrganizationalPriorities: string[];
    quickWins3Months: string[];
    longTermAIOpportunities6To12Months: string[];
  };

  // Model-derived vs calculated scorecard for dashboard compatibility
  kpiScorecard?: {
    calculated: {
      totalPatientsAnalyzed: number;
      averageWaitTimeMinutes: number;
      averageSatisfactionScore: number;
      severeComplaintsCount: number;
      positiveFeedbackPercentage: number;
      lwbsCount: number;
    };
    modelDerived: {
      organizationalRiskIndex: number;
      communicationFrictionScore: number;
      equityAlertLevel: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
      serviceRecoveryUrgency: 'Normal' | 'High' | 'Critical';
    };
  };
  departmentalMatrix?: {
    department: string;
    patientCount: number;
    avgWaitTime: number;
    avgCsat: number;
    dominantIssue: string;
    triageLevelDistribution: { l1: number; l2: number; l3: number; l4: number };
    communicationScore: number;
    compositeHealthScore: number;
  }[];
}

// -------------------------------------------------------------
// AGENT 4: Hospital Manager Decision Support Agent (Orchestrator)
// -------------------------------------------------------------
export interface Agent4CaseAnalysis extends StandardResultEnvelope {
  patientPersona: string;
  ageGroup: string;
  serviceLine: string;
  visitType: string;
  mainProblem: string;
  managementPriority: 'Low' | 'Medium' | 'High';
  priorityReasoning: string;
  recommendedActions: string[];
  humanReviewNeeded: boolean;
  aiRiskFlagConcern?: string;
}

export interface Agent4Output {
  agentId: 'agent4';
  agentTitle: string;
  topManagementAlert: {
    alertTitle: string;
    severity: 'Critical' | 'High' | 'Moderate';
    description: string;
    affectedArea: string;
  };
  caseAnalyses: Agent4CaseAnalysis[];
  recommendedManagementActions: string[]; // 2-3 management actions at bottom
  priorityBreakdown: { high: number; medium: number; low: number };
  humanReviewRequiredCount: number;

  // Inter-agent orchestration contract
  orchestrationSummary: {
    orchestratorObjective: string;
    agentsInvoked: string[];
    executionSequence: string[];
    interAgentDataFlowDescription: string;
  };
  orchestrationPlan?: {
    objective: string;
    agentsSelected: string[];
    executionMode: 'parallel' | 'sequential';
    rationaleForSelection: string;
    dataScope: string;
  };
  executiveSummary?: string;
  strategicRecommendations?: {
    id: string;
    action: string;
    department: string;
    priority: string;
    timeframe: string;
    expectedImpact: string;
    requiredResources: string;
    accountableRole: string;
  }[];
  governanceAndRiskMitigation?: {
    riskType: string;
    severity: string;
    mitigationStrategy: string;
    oversightBody: string;
  }[];
}

// -------------------------------------------------------------
// EXECUTION LOGGING (Requirement 8)
// -------------------------------------------------------------
export interface AgentExecutionLog {
  id: string;
  sequenceOrder: number;
  stepNumber?: number;
  stepName?: string;
  agentId: 'agent1' | 'agent2' | 'agent3' | 'agent4' | 'agent5' | 'agent6';
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  timestamp?: number;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  inputPayload?: any;
  outputPayload?: any;
  inputSummary?: string;
  outputSummary?: string;
  validationErrors?: string[];
  error?: string;
}

export interface FullOrchestrationResult {
  orchestrationPlan: {
    objective: string;
    agentsSelected: string[];
    executionMode: 'parallel' | 'sequential' | 'hierarchical';
    rationaleForSelection: string;
    dataScope: string;
  };
  logs: AgentExecutionLog[];
  agent1?: Agent1Output;
  agent2?: Agent2Output;
  agent3?: Agent3Output;
  agent6?: Agent6Output;
  agent5?: Agent5Output;
  agent4?: Agent4Output;
  calculatedStats: CalculatedStatistics;
  executionMode: 'parallel' | 'sequential' | 'hierarchical';
  totalDurationMs: number;
}
