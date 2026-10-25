import Papa from 'papaparse';
import { PatientRecord } from '../types/healthcare';

export interface FieldValidationInfo {
  key: keyof PatientRecord | string;
  label: string;
  matchedHeader: string | null;
  presentCount: number;
  missingCount: number;
  completionRate: number; // percentage (0-100)
}

export interface DatasetValidationReport {
  totalRecords: number;
  rawHeaders: string[];
  availableFields: string[];
  missingFields: string[];
  fieldValidations: FieldValidationInfo[];
  numericalSummary: {
    meanSatisfaction: number;
    meanCommunicationRating: number;
    severityCounts: { level1: number; level2: number; level3: number; level4: number; none: number };
    aiRiskFlagCounts: { none: number; hallucination: number; bias: number; humanReview: number; other: number };
    complianceRate: number;
    uniquePersonasCount: number;
    uniqueServiceLinesCount: number;
  };
  warnings: string[];
}

export function validateDataset(records: PatientRecord[], rawHeaders?: string[]): DatasetValidationReport {
  const total = records.length;
  const headers = rawHeaders || [
    'Patient_ID', 'Patient_Persona', 'Service_Line', 'Visit_Type', 
    'Patient_Satisfaction', 'Communication_Rating', 'Complaint_Severity', 
    'AI_Risk_Flag', 'Comment', 'Patient_Facing_Communication'
  ];

  const standardFieldDefinitions: { key: keyof PatientRecord; label: string; headerAliases: string[] }[] = [
    { key: 'patient_id', label: 'Patient / Case Identifier', headerAliases: ['patient_id', 'case_id', 'patientid', 'caseid', 'mrn', 'id'] },
    { key: 'patient_persona', label: 'Patient Persona', headerAliases: ['patient_persona', 'persona'] },
    { key: 'service_line', label: 'Service Line', headerAliases: ['service_line', 'serviceline', 'specialty'] },
    { key: 'visit_type', label: 'Visit Type', headerAliases: ['visit_type', 'visittype'] },
    { key: 'satisfaction_score', label: 'Patient Satisfaction (1-5)', headerAliases: ['patient_satisfaction', 'satisfaction_score', 'satisfaction', 'csat'] },
    { key: 'communication_rating', label: 'Communication Rating (1-5)', headerAliases: ['communication_rating', 'communicationrating', 'comm_rating'] },
    { key: 'complaint_severity', label: 'Complaint Severity', headerAliases: ['complaint_severity', 'complaintseverity', 'severity'] },
    { key: 'ai_risk_flags', label: 'AI Risk Flag', headerAliases: ['ai_risk_flag', 'ai_risk_flags', 'risk_flag'] },
    { key: 'feedback_text', label: 'Comment (Patient Feedback)', headerAliases: ['comment', 'feedback_text', 'feedback', 'comments', 'patient_comment'] },
    { key: 'communication_text', label: 'Patient-Facing Communication', headerAliases: ['patient_facing_communication', 'communication_text', 'discharge_instructions', 'communication'] },
    { key: 'department', label: 'Department / Unit', headerAliases: ['department', 'dept', 'unit'] },
    { key: 'wait_time_minutes', label: 'Wait Time (Minutes)', headerAliases: ['wait_time_minutes', 'wait_time', 'waittime'] },
  ];

  const fieldValidations: FieldValidationInfo[] = standardFieldDefinitions.map(def => {
    let matchedHeader: string | null = null;
    for (const h of headers) {
      const normalizedH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (def.headerAliases.some(alias => alias.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedH)) {
        matchedHeader = h;
        break;
      }
    }

    let presentCount = 0;
    records.forEach(r => {
      const val = (r as any)[def.key];
      if (val !== undefined && val !== null && val !== '' && val !== 'None' && val !== 'Unspecified') {
        presentCount++;
      }
    });

    const missingCount = total - presentCount;
    const completionRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return {
      key: def.key,
      label: def.label,
      matchedHeader,
      presentCount,
      missingCount,
      completionRate,
    };
  });

  // Calculate simple numerical summaries purely in application code (Requirement 8)
  let satSum = 0;
  let satCount = 0;
  let commSum = 0;
  let commCount = 0;
  let compliantCount = 0;
  const severityCounts = { level1: 0, level2: 0, level3: 0, level4: 0, none: 0 };
  const aiRiskCounts = { none: 0, hallucination: 0, bias: 0, humanReview: 0, other: 0 };
  const personas = new Set<string>();
  const serviceLines = new Set<string>();

  records.forEach(r => {
    const sat = Number(r.satisfaction_score || r.patient_satisfaction);
    if (!isNaN(sat) && sat > 0) {
      satSum += sat;
      satCount++;
    }

    const comm = Number(r.communication_rating);
    if (!isNaN(comm) && comm > 0) {
      commSum += comm;
      commCount++;
    }

    if (r.follow_up_compliance === 'Compliant') compliantCount++;

    const sev = (r.complaint_severity || '').toLowerCase();
    if (sev.includes('1') || sev.includes('low')) severityCounts.level1++;
    else if (sev.includes('2') || sev.includes('moderate')) severityCounts.level2++;
    else if (sev.includes('3') || sev.includes('high')) severityCounts.level3++;
    else if (sev.includes('4') || sev.includes('critical')) severityCounts.level4++;
    else severityCounts.none++;

    const risk = String(r.ai_risk_flags || '').toLowerCase();
    if (risk.includes('hallucination')) aiRiskCounts.hallucination++;
    else if (risk.includes('bias')) aiRiskCounts.bias++;
    else if (risk.includes('human') || risk.includes('review') || r.requires_human_review) aiRiskCounts.humanReview++;
    else if (!risk || risk.includes('none')) aiRiskCounts.none++;
    else aiRiskCounts.other++;

    if (r.patient_persona) personas.add(r.patient_persona);
    if (r.service_line) serviceLines.add(r.service_line);
  });

  const availableFields = fieldValidations.filter(f => f.matchedHeader !== null || f.presentCount > 0).map(f => f.label);
  const missingFields = fieldValidations.filter(f => f.matchedHeader === null && f.presentCount === 0).map(f => f.label);

  const warnings: string[] = [];
  if (total === 0) warnings.push('Dataset contains 0 rows.');
  if (missingFields.includes('Comment (Patient Feedback)')) warnings.push('Missing Comment / feedback_text column. Agent analysis requires qualitative patient remarks.');
  if (missingFields.includes('Patient Satisfaction (1-5)')) warnings.push('Missing Patient_Satisfaction column. Satisfaction scores will default to neutral 3.');

  return {
    totalRecords: total,
    rawHeaders: headers,
    availableFields,
    missingFields,
    fieldValidations,
    numericalSummary: {
      meanSatisfaction: satCount > 0 ? Number((satSum / satCount).toFixed(2)) : 0,
      meanCommunicationRating: commCount > 0 ? Number((commSum / commCount).toFixed(2)) : 0,
      severityCounts,
      aiRiskFlagCounts: aiRiskCounts,
      complianceRate: total > 0 ? Math.round((compliantCount / total) * 100) : 0,
      uniquePersonasCount: personas.size,
      uniqueServiceLinesCount: serviceLines.size,
    },
    warnings,
  };
}

export function parseCSV(fileContent: string): { 
  records: PatientRecord[]; 
  errors: string[];
  validationReport: DatasetValidationReport;
} {
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(err => errors.push(`Row ${err.row}: ${err.message}`));
  }

  const rawRows = result.data as Record<string, string>[];
  const records: PatientRecord[] = [];
  const rawHeaders = result.meta.fields || [];

  rawRows.forEach((row, index) => {
    // Flexible header mapping preserving exact semantic meanings
    const findField = (...keys: string[]): string => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')) {
            return (row[rowKey] || '').trim();
          }
        }
      }
      return '';
    };

    // Requirement 6: Preserve the original patient/case identifiers
    const patientId = findField(
      'Patient_ID', 'Case_ID', 'patient_id', 'case_id', 
      'PatientId', 'CaseId', 'mrn', 'id', 'record_id'
    ) || `PT-${10000 + index}`;

    const rawDept = findField('department', 'dept', 'unit', 'clinic', 'service');
    let department: PatientRecord['department'] = 'Emergency';
    const deptLower = rawDept.toLowerCase();
    if (deptLower.includes('inpatient') || deptLower.includes('med-surg') || deptLower.includes('ward')) {
      department = 'Inpatient Med-Surg';
    } else if (deptLower.includes('cardio') || deptLower.includes('heart')) {
      department = 'Cardiology';
    } else if (deptLower.includes('ped') || deptLower.includes('child')) {
      department = 'Pediatrics';
    } else if (deptLower.includes('surg') || deptLower.includes('or') || deptLower.includes('ambulatory')) {
      department = 'Ambulatory Surgery';
    } else if (deptLower.includes('outpatient') || deptLower.includes('clinic') || deptLower.includes('specialty')) {
      department = 'Outpatient Specialty';
    }

    const wait = parseInt(findField('wait_time_minutes', 'waittime', 'wait', 'minutes', 'delay') || '45', 10);
    
    // Requirement 7: Patient_Satisfaction (1 to 5)
    const rawSat = findField('Patient_Satisfaction', 'patient_satisfaction', 'satisfaction_score', 'satisfaction', 'csat', 'score', 'rating');
    const sat = parseFloat(rawSat || '3');
    const validSat = isNaN(sat) ? 3 : Math.min(5, Math.max(1, Math.round(sat)));

    // Requirement 7: Communication_Rating (1 to 5)
    const rawCommRating = findField('Communication_Rating', 'communication_rating', 'communicationrating', 'comm_rating');
    const commRatingParsed = parseInt(rawCommRating || '', 10);
    const validCommRating = isNaN(commRatingParsed) ? (validSat >= 4 ? 4 : validSat <= 2 ? 2 : 3) : Math.min(5, Math.max(1, commRatingParsed));

    // Requirement 7: Comment (raw qualitative patient remarks)
    const feedback = findField('Comment', 'comment', 'feedback_text', 'feedback', 'comments', 'patient_comment', 'notes', 'review', 'complaint') || 'No comment provided.';

    // Requirement 7: Patient_Facing_Communication (discharge, dialogue, staff explanation)
    const communication = findField('Patient_Facing_Communication', 'patient_facing_communication', 'communication_text', 'communication', 'discharge_instructions', 'instructions', 'dialogue') || '';

    // Requirement 7: Complaint_Severity
    const rawSeverity = findField('Complaint_Severity', 'complaint_severity', 'complaintseverity', 'severity').toLowerCase();
    let complaintSeverity: PatientRecord['complaint_severity'] = 'None';
    if (rawSeverity.includes('4') || rawSeverity.includes('critical')) complaintSeverity = 'LEVEL 4 – Critical';
    else if (rawSeverity.includes('3') || rawSeverity.includes('high')) complaintSeverity = 'LEVEL 3 – High';
    else if (rawSeverity.includes('2') || rawSeverity.includes('moderate')) complaintSeverity = 'LEVEL 2 – Moderate';
    else if (rawSeverity.includes('1') || rawSeverity.includes('low')) complaintSeverity = 'LEVEL 1 – Low';
    else if (validSat <= 1) complaintSeverity = 'LEVEL 4 – Critical';
    else if (validSat === 2) complaintSeverity = 'LEVEL 2 – Moderate';

    // Requirement 7: AI_Risk_Flag
    const rawAiRisk = findField('AI_Risk_Flag', 'ai_risk_flag', 'ai_risk_flags', 'risk_flag', 'ai_risk').toLowerCase();
    let aiRiskFlags: PatientRecord['ai_risk_flags'] = 'None';
    if (rawAiRisk.includes('hallucination')) aiRiskFlags = 'Hallucination Risk';
    else if (rawAiRisk.includes('bias')) aiRiskFlags = 'Bias Review';
    else if (rawAiRisk.includes('human') || rawAiRisk.includes('review') || rawAiRisk.includes('urgent')) aiRiskFlags = 'Human Review Required';
    else if (validSat === 1 || complaintSeverity === 'LEVEL 4 – Critical') aiRiskFlags = 'Human Review Required';

    const ageGroup = findField('age_group', 'age', 'agegroup') || '36-50';
    const gender = findField('gender', 'sex') || 'Unspecified';
    const visitDate = findField('visit_date', 'date', 'visitdate', 'timestamp') || new Date().toISOString().slice(0, 16).replace('T', ' ');
    const patientPersona = findField('Patient_Persona', 'patient_persona', 'persona') || 'General Patient';
    const serviceLine = findField('Service_Line', 'service_line', 'serviceline') || department;
    
    const rawVisitType = findField('Visit_Type', 'visit_type', 'visittype').toLowerCase();
    let visitType: PatientRecord['visit_type'] = 'Outpatient';
    if (rawVisitType.includes('emerg')) visitType = 'Emergency';
    else if (rawVisitType.includes('inpatient')) visitType = 'Inpatient';
    else if (rawVisitType.includes('surg')) visitType = 'Ambulatory Surgery';
    else if (rawVisitType.includes('tele')) visitType = 'Telehealth';

    let rawCategory = findField('complaint_category', 'category', 'complaint_type');
    let complaintCategory: PatientRecord['complaint_category'] = undefined;
    if (rawCategory) {
      const catLower = rawCategory.toLowerCase();
      if (catLower.includes('wait') || catLower.includes('delay') || catLower.includes('access')) complaintCategory = 'Wait Time';
      else if (catLower.includes('comm') || catLower.includes('jargon') || catLower.includes('expla')) complaintCategory = 'Communication';
      else if (catLower.includes('bill') || catLower.includes('cost') || catLower.includes('insurance')) complaintCategory = 'Billing';
      else if (catLower.includes('sched') || catLower.includes('appoint')) complaintCategory = 'Scheduling';
      else if (catLower.includes('tech') || catLower.includes('portal') || catLower.includes('app')) complaintCategory = 'Technology / Patient Portal';
      else if (catLower.includes('safe') || catLower.includes('fall') || catLower.includes('medication')) complaintCategory = 'Patient Safety';
      else if (catLower.includes('priv') || catLower.includes('hipaa') || catLower.includes('secur')) complaintCategory = 'Privacy or Security';
      else if (catLower.includes('staff') || catLower.includes('rude') || catLower.includes('nurse') || catLower.includes('doctor')) complaintCategory = 'Staff Conduct';
      else if (catLower.includes('clinic') || catLower.includes('care') || catLower.includes('treatment')) complaintCategory = 'Clinical Care';
      else complaintCategory = 'Other';
    }

    const triageAcuity = findField('triage_acuity', 'triage', 'acuity', 'esi') as any || 'Level 3 - Urgent';
    const primaryLanguage = findField('primary_language', 'language', 'lang') as any || 'English';
    const dischargeStatus = findField('discharge_status', 'discharge', 'disposition') as any || 'Routine Home';
    const requiresReview = findField('requires_human_review', 'human_review', 'flagged').toLowerCase() === 'true' || 
                           validSat === 1 || 
                           complaintSeverity === 'LEVEL 4 – Critical' || 
                           aiRiskFlags === 'Human Review Required';

    records.push({
      id: `rec-csv-${index + 1}`,
      patient_id: patientId, // Preserved original identifier
      patient_persona: patientPersona,
      service_line: serviceLine,
      visit_type: visitType,
      department,
      wait_time_minutes: isNaN(wait) ? 45 : wait,
      satisfaction_score: validSat,
      patient_satisfaction: validSat,
      communication_rating: validCommRating,
      follow_up_compliance: validSat <= 2 ? 'Non-Compliant' : 'Compliant',
      complaint_severity: complaintSeverity,
      patient_portal_usage: 'Active',
      readmission_risk: validSat <= 2 ? 'Moderate' : 'Low',
      ai_risk_flags: aiRiskFlags,
      feedback_text: feedback,
      communication_text: communication,
      age_group: ageGroup,
      gender,
      visit_date: visitDate,
      complaint_category: complaintCategory,
      triage_acuity: triageAcuity,
      primary_language: primaryLanguage,
      discharge_status: dischargeStatus,
      requires_human_review: requiresReview,
      human_review_notes: requiresReview ? 'Flagged for clinical manager / human-in-the-loop safety audit.' : undefined,
    });
  });

  const validationReport = validateDataset(records, rawHeaders);

  return { records, errors, validationReport };
}

export function exportToCSV(records: PatientRecord[]): string {
  const data = records.map(r => ({
    patient_id: r.patient_id,
    patient_persona: r.patient_persona || '',
    service_line: r.service_line || '',
    department: r.department,
    visit_type: r.visit_type || '',
    visit_date: r.visit_date,
    wait_time_minutes: r.wait_time_minutes,
    satisfaction_score: r.satisfaction_score,
    communication_rating: r.communication_rating ?? '',
    feedback_text: r.feedback_text,
    communication_text: r.communication_text || '',
    complaint_category: r.complaint_category || '',
    triage_acuity: r.triage_acuity || '',
    age_group: r.age_group || '',
    gender: r.gender || '',
    primary_language: r.primary_language || 'English',
    discharge_status: r.discharge_status || 'Routine Home',
    requires_human_review: r.requires_human_review ? 'true' : 'false',
    human_review_notes: r.human_review_notes || '',
  }));

  return Papa.unparse(data);
}

export function generateSampleCSV(): string {
  const sample: Partial<PatientRecord>[] = [
    {
      patient_id: 'PT-901',
      patient_persona: 'Working Parent',
      service_line: 'Emergency',
      visit_type: 'Emergency',
      department: 'Emergency',
      visit_date: '2026-10-24 14:30',
      wait_time_minutes: 210,
      satisfaction_score: 1,
      communication_rating: 1,
      feedback_text: 'Waited 3.5 hours for severe migraine. The lights in the waiting room were blinding and the desk nurse was impatient.',
      communication_text: 'Discharge instructions: Take sumatriptan PRN. Follow up with neurology if episodes recur >3x/month.',
      complaint_category: 'Wait Time',
      triage_acuity: 'Level 3 - Urgent',
      age_group: '36-50',
      gender: 'Female',
      primary_language: 'English',
      discharge_status: 'Routine Home',
      requires_human_review: true,
      human_review_notes: 'Prolonged wait with severe sensory distress.'
    },
    {
      patient_id: 'PT-902',
      patient_persona: 'Elderly Chronic Care',
      service_line: 'Inpatient Care',
      visit_type: 'Inpatient',
      department: 'Inpatient Med-Surg',
      visit_date: '2026-10-24 16:00',
      wait_time_minutes: 40,
      satisfaction_score: 4,
      communication_rating: 4,
      feedback_text: 'Nurses were kind and responsive, but discharge paperwork took 3 hours after doctor cleared me.',
      communication_text: 'Discharge summary: Follow low-sodium cardiac diet. Ambulate daily. Continue carvedilol 12.5mg BID.',
      complaint_category: 'Wait Time',
      triage_acuity: 'Level 4 - Less Urgent',
      age_group: '51-65',
      gender: 'Male',
      primary_language: 'English',
      discharge_status: 'Routine Home',
      requires_human_review: false,
    },
    {
      patient_id: 'PT-903',
      patient_persona: 'Post-Op Recovery',
      service_line: 'Cardiology',
      visit_type: 'Inpatient',
      department: 'Cardiology',
      visit_date: '2026-10-24 18:20',
      wait_time_minutes: 30,
      satisfaction_score: 5,
      communication_rating: 5,
      feedback_text: 'Dr. Adams walked me through my stent procedure results with unmatched empathy. I understood every step.',
      communication_text: 'Post-catheterization review note with patient and spouse present. Teach-back confirmed.',
      complaint_category: undefined,
      triage_acuity: 'Level 2 - Emergent',
      age_group: '66+',
      gender: 'Female',
      primary_language: 'English',
      discharge_status: 'Admitted',
      requires_human_review: false,
    }
  ];

  return Papa.unparse(sample);
}
