import { PatientRecord, CalculatedStatistics } from '../types/healthcare';

export function calculateStatistics(records: PatientRecord[]): CalculatedStatistics {
  if (!records || records.length === 0) {
    return {
      totalPatients: 0,
      averageWaitTimeMinutes: 0,
      medianWaitTimeMinutes: 0,
      averageSatisfactionScore: 0,
      averageCommunicationRating: 0,
      followUpComplianceRate: 0,
      serviceLinesRepresented: 0,
      satisfactionDistribution: [
        { score: 1, count: 0, percentage: 0 },
        { score: 2, count: 0, percentage: 0 },
        { score: 3, count: 0, percentage: 0 },
        { score: 4, count: 0, percentage: 0 },
        { score: 5, count: 0, percentage: 0 },
      ],
      departmentBreakdown: [],
      languageBreakdown: [],
      severeAcuityCount: 0,
      lwbsCount: 0,
    };
  }

  const totalPatients = records.length;
  const waitTimes = records.map(r => Number(r.wait_time_minutes) || 0).sort((a, b) => a - b);
  const totalWaitTime = waitTimes.reduce((acc, curr) => acc + curr, 0);
  const averageWaitTimeMinutes = Math.round((totalWaitTime / totalPatients) * 10) / 10;
  
  const midIndex = Math.floor(waitTimes.length / 2);
  const medianWaitTimeMinutes = waitTimes.length % 2 !== 0
    ? waitTimes[midIndex]
    : Math.round(((waitTimes[midIndex - 1] + waitTimes[midIndex]) / 2) * 10) / 10;

  const satisfactionScores = records.map(r => Number(r.satisfaction_score || r.patient_satisfaction) || 0);
  const totalSatisfaction = satisfactionScores.reduce((acc, curr) => acc + curr, 0);
  const averageSatisfactionScore = Math.round((totalSatisfaction / totalPatients) * 100) / 100;

  // Communication rating (1-5)
  const commRatings = records.map(r => Number(r.communication_rating) || Math.min(5, Math.max(1, Math.round(Number(r.satisfaction_score) || 3))));
  const totalComm = commRatings.reduce((acc, curr) => acc + curr, 0);
  const averageCommunicationRating = Math.round((totalComm / totalPatients) * 100) / 100;

  // Follow-up compliance rate
  const compliantCount = records.filter(r => r.follow_up_compliance === 'Compliant').length;
  const followUpComplianceRate = Math.round((compliantCount / totalPatients) * 1000) / 10;

  // Service lines represented
  const serviceLines = new Set(records.map(r => r.service_line || r.department));
  const serviceLinesRepresented = serviceLines.size;

  // Distribution 1 to 5
  const distCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  records.forEach(r => {
    const sc = Math.round(Number(r.satisfaction_score || r.patient_satisfaction)) || 3;
    const clamped = Math.max(1, Math.min(5, sc));
    distCounts[clamped] = (distCounts[clamped] || 0) + 1;
  });

  const satisfactionDistribution = [1, 2, 3, 4, 5].map(score => ({
    score,
    count: distCounts[score],
    percentage: Math.round((distCounts[score] / totalPatients) * 1000) / 10,
  }));

  // Department breakdown
  const deptMap: Record<string, { count: number; totalWait: number; totalSat: number; complaints: number }> = {};
  records.forEach(r => {
    const dept = r.department || r.service_line || 'General';
    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, totalWait: 0, totalSat: 0, complaints: 0 };
    }
    deptMap[dept].count += 1;
    deptMap[dept].totalWait += Number(r.wait_time_minutes) || 0;
    deptMap[dept].totalSat += Number(r.satisfaction_score || r.patient_satisfaction) || 0;
    if (r.complaint_category || r.complaint_severity?.includes('LEVEL') || Number(r.satisfaction_score) <= 2) {
      deptMap[dept].complaints += 1;
    }
  });

  const departmentBreakdown = Object.entries(deptMap).map(([department, data]) => ({
    department,
    patientCount: data.count,
    averageWaitTime: Math.round((data.totalWait / data.count) * 10) / 10,
    averageSatisfaction: Math.round((data.totalSat / data.count) * 100) / 100,
    complaintCount: data.complaints,
  }));

  // Language breakdown
  const langMap: Record<string, { count: number; totalSat: number }> = {};
  records.forEach(r => {
    const lang = r.primary_language || 'English';
    if (!langMap[lang]) {
      langMap[lang] = { count: 0, totalSat: 0 };
    }
    langMap[lang].count += 1;
    langMap[lang].totalSat += Number(r.satisfaction_score || r.patient_satisfaction) || 0;
  });

  const languageBreakdown = Object.entries(langMap).map(([language, data]) => ({
    language,
    count: data.count,
    averageSatisfaction: Math.round((data.totalSat / data.count) * 100) / 100,
  }));

  // Severe Acuity count (Level 1 or Level 2)
  const severeAcuityCount = records.filter(r => 
    r.triage_acuity?.includes('Level 1') || r.triage_acuity?.includes('Level 2')
  ).length;

  // LWBS count
  const lwbsCount = records.filter(r =>
    r.discharge_status === 'Left Without Being Seen (LWBS)'
  ).length;

  return {
    totalPatients,
    averageWaitTimeMinutes,
    medianWaitTimeMinutes,
    averageSatisfactionScore,
    averageCommunicationRating,
    followUpComplianceRate,
    serviceLinesRepresented,
    satisfactionDistribution,
    departmentBreakdown,
    languageBreakdown,
    severeAcuityCount,
    lwbsCount,
  };
}
