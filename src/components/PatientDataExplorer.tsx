import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Star, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  X, 
  Bot, 
  MessageSquare, 
  FileText, 
  Check, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  Upload,
  Layers,
  Database,
  Info,
  CheckSquare,
  Square,
  Play,
  Activity,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Percent,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { PatientRecord } from '../types/healthcare';
import { validateDataset, parseCSV, DatasetValidationReport } from '../utils/csvHelper';

interface PatientDataExplorerProps {
  records: PatientRecord[];
  onUpdateRecord: (updated: PatientRecord) => void;
  onRunSingleAgentOnRecord: (agentId: string, record: PatientRecord) => Promise<any>;
  initialFilter?: string;
  datasetName?: string;
  onUploadDataset?: (records: PatientRecord[], filename: string) => void;
  onRunMultiAgentAnalysis?: (selectedRecords?: PatientRecord[]) => void;
  isOrchestrating?: boolean;
}

export const PatientDataExplorer: React.FC<PatientDataExplorerProps> = ({
  records,
  onUpdateRecord,
  onRunSingleAgentOnRecord,
  initialFilter,
  datasetName = 'Active Dataset',
  onUploadDataset,
  onRunMultiAgentAnalysis,
  isOrchestrating = false,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedPersona, setSelectedPersona] = useState<string>('All');
  const [selectedServiceLine, setSelectedServiceLine] = useState<string>('All');
  const [selectedVisitType, setSelectedVisitType] = useState<string>('All');
  const [selectedSatisfaction, setSelectedSatisfaction] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedAiRisk, setSelectedAiRisk] = useState<string>('All');
  const [onlyFlagged, setOnlyFlagged] = useState<boolean>(initialFilter === 'flagged');

  // Case Selection State (Single case, Group of cases, Full dataset)
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());

  // UI Panels State
  const [showValidationPanel, setShowValidationPanel] = useState<boolean>(false);
  const [showUploadZone, setShowUploadZone] = useState<boolean>(false);
  const [uploadStatusNotice, setUploadStatusNotice] = useState<string | null>(null);

  // Detail Modal / Drawer State
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [agentTestResult, setAgentTestResult] = useState<{ agentId: string; data: any; loading: boolean } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Requirement 1, 2 & 8: Parse & Validate Dataset, Compute Simple Numerical Summaries in Application Code
  const validationReport = useMemo<DatasetValidationReport>(() => {
    return validateDataset(records);
  }, [records]);

  // Dynamic filter options based on available fields in dataset (Requirement 4)
  const availablePersonas = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.patient_persona).filter(Boolean))) as string[];
    return list.sort();
  }, [records]);

  const availableServiceLines = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.service_line).filter(Boolean))) as string[];
    return list.sort();
  }, [records]);

  const availableVisitTypes = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.visit_type).filter(Boolean))) as string[];
    return list.sort();
  }, [records]);

  const availableDepartments = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.department).filter(Boolean))) as string[];
    return list.sort();
  }, [records]);

  const hasSeverities = useMemo(() => {
    return records.some(r => r.complaint_severity && r.complaint_severity !== 'None');
  }, [records]);

  const hasAiRisks = useMemo(() => {
    return records.some(r => r.ai_risk_flags && r.ai_risk_flags !== 'None');
  }, [records]);

  // Filtered Records (Preserving original patient/case identifiers)
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (onlyFlagged && !r.requires_human_review) return false;
      if (selectedDepartment !== 'All' && r.department !== selectedDepartment) return false;
      if (selectedPersona !== 'All' && r.patient_persona !== selectedPersona) return false;
      if (selectedServiceLine !== 'All' && r.service_line !== selectedServiceLine) return false;
      if (selectedVisitType !== 'All' && r.visit_type !== selectedVisitType) return false;
      
      // Patient_Satisfaction Filter (Requirement 4)
      if (selectedSatisfaction !== 'All') {
        const sat = Number(r.satisfaction_score || r.patient_satisfaction);
        if (String(sat) !== selectedSatisfaction) return false;
      }

      // Complaint_Severity Filter (Requirement 4)
      if (selectedSeverity !== 'All') {
        const sev = r.complaint_severity || 'None';
        if (sev !== selectedSeverity) return false;
      }

      // AI_Risk_Flag Filter (Requirement 4)
      if (selectedAiRisk !== 'All') {
        const risk = String(r.ai_risk_flags || 'None');
        if (selectedAiRisk === 'None' && risk !== 'None' && risk !== '') return false;
        if (selectedAiRisk !== 'None' && !risk.toLowerCase().includes(selectedAiRisk.toLowerCase())) return false;
      }

      // Search Query over original identifiers, comments, and communication
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (r.patient_id || '').toLowerCase().includes(q);
        const matchesComment = (r.feedback_text || '').toLowerCase().includes(q);
        const matchesComm = (r.communication_text || '').toLowerCase().includes(q);
        const matchesPersona = (r.patient_persona || '').toLowerCase().includes(q);
        const matchesService = (r.service_line || '').toLowerCase().includes(q);
        const matchesDept = (r.department || '').toLowerCase().includes(q);
        const matchesNotes = (r.human_review_notes || '').toLowerCase().includes(q);
        if (!matchesId && !matchesComment && !matchesComm && !matchesPersona && !matchesService && !matchesDept && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [
    records, 
    onlyFlagged, 
    selectedDepartment, 
    selectedPersona, 
    selectedServiceLine, 
    selectedVisitType, 
    selectedSatisfaction, 
    selectedSeverity, 
    selectedAiRisk, 
    searchQuery
  ]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers (Requirement 3: single case, group of cases, full dataset)
  const isAllVisibleSelected = paginatedRecords.length > 0 && paginatedRecords.every(r => selectedCaseIds.has(r.id));
  const isEntireDatasetSelected = records.length > 0 && selectedCaseIds.size === records.length;

  const handleToggleSelectRow = (id: string) => {
    setSelectedCaseIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllVisible = () => {
    setSelectedCaseIds(prev => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        paginatedRecords.forEach(r => next.delete(r.id));
      } else {
        paginatedRecords.forEach(r => next.add(r.id));
      }
      return next;
    });
  };

  const handleSelectEntireDataset = () => {
    if (isEntireDatasetSelected) {
      setSelectedCaseIds(new Set());
    } else {
      setSelectedCaseIds(new Set(records.map(r => r.id)));
    }
  };

  const handleSelectHighSeverityOnly = () => {
    const highIds = records
      .filter(r => r.complaint_severity === 'LEVEL 4 – Critical' || r.complaint_severity === 'LEVEL 3 – High' || (r.satisfaction_score && r.satisfaction_score <= 2))
      .map(r => r.id);
    setSelectedCaseIds(new Set(highIds));
  };

  const handleSelectAiRisksOnly = () => {
    const riskIds = records
      .filter(r => (r.ai_risk_flags && r.ai_risk_flags !== 'None') || r.requires_human_review)
      .map(r => r.id);
    setSelectedCaseIds(new Set(riskIds));
  };

  const handleClearSelection = () => {
    setSelectedCaseIds(new Set());
  };

  const getSelectedRecords = (): PatientRecord[] => {
    return records.filter(r => selectedCaseIds.has(r.id));
  };

  // Run Multi-Agent Analysis trigger (Requirement 9 & 10)
  const handleTriggerAnalysis = (subset: 'selection' | 'filtered' | 'all') => {
    if (!onRunMultiAgentAnalysis) return;
    if (subset === 'selection' && selectedCaseIds.size > 0) {
      onRunMultiAgentAnalysis(getSelectedRecords());
    } else if (subset === 'filtered') {
      onRunMultiAgentAnalysis(filteredRecords);
    } else {
      onRunMultiAgentAnalysis(records);
    }
  };

  // Direct CSV Upload inside Explorer (Requirement 1, 8, 9)
  const handleExplorerCSVUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { records: parsedRecords, errors, validationReport: report } = parseCSV(text);
        if (parsedRecords.length === 0) {
          alert('Could not parse any records from CSV.');
          return;
        }
        if (onUploadDataset) {
          onUploadDataset(parsedRecords, file.name);
        }
        setShowUploadZone(false);
        setShowValidationPanel(true);
        setSelectedCaseIds(new Set());
        setUploadStatusNotice(
          `Dataset "${file.name}" uploaded and validated with ${parsedRecords.length} records and ${report.availableFields.length} detected fields. Multi-Agent Analysis has NOT been initiated yet. Review the telemetry below, select cases, and click "Run Multi-Agent Analysis" when ready.`
        );
      } catch (err: any) {
        alert(`Error parsing CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Case Modal Handlers
  const handleOpenDetail = (record: PatientRecord) => {
    setSelectedRecord(record);
    setEditingNotes(record.human_review_notes || '');
    setAgentTestResult(null);
  };

  const handleToggleFlag = (record: PatientRecord) => {
    const updated = {
      ...record,
      requires_human_review: !record.requires_human_review,
      human_review_notes: !record.requires_human_review 
        ? (record.human_review_notes || 'Manually flagged for clinical manager safety review.') 
        : record.human_review_notes,
    };
    onUpdateRecord(updated);
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(updated);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedRecord) return;
    const updated = {
      ...selectedRecord,
      human_review_notes: editingNotes,
      requires_human_review: true,
    };
    onUpdateRecord(updated);
    setSelectedRecord(updated);
  };

  const handleTestAgentOnThisRecord = async (agentId: string) => {
    if (!selectedRecord) return;
    setAgentTestResult({ agentId, data: null, loading: true });
    try {
      const data = await onRunSingleAgentOnRecord(agentId, selectedRecord);
      setAgentTestResult({ agentId, data, loading: false });
    } catch (err: any) {
      setAgentTestResult({ agentId, data: { error: err.message }, loading: false });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION HEADER & CONTROL TOOLBAR */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-6 shadow-xs dark:shadow-md relative overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1.5 px-2.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Section 3 &bull; Patient Data Explorer & Dataset Ingestion</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-3">
              <span>Patient Experience Dataset Explorer</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#121c2e] text-cyan-800 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
                {datasetName}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed font-medium">
              Inspect raw qualitative feedback, validate dataset schema completeness, select single or groups of patient cases, and explicitly initiate multi-agent analysis workflows.
            </p>
          </div>

          {/* Action Buttons: Upload CSV & Run Multi-Agent Analysis */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Toggle Upload Dropzone */}
            <button
              onClick={() => setShowUploadZone(prev => !prev)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{showUploadZone ? 'Hide CSV Ingest' : 'Upload CSV'}</span>
            </button>

            {/* Schema Validation Inspector Toggle */}
            <button
              onClick={() => setShowValidationPanel(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-xs ${
                showValidationPanel 
                  ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Schema & Validation ({validationReport.availableFields.length} Fields)</span>
              {showValidationPanel ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {/* Requirement 10: Run Multi-Agent Analysis Button */}
            <button
              onClick={() => handleTriggerAnalysis(selectedCaseIds.size > 0 ? 'selection' : 'all')}
              disabled={isOrchestrating}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 hover:shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {selectedCaseIds.size > 0
                  ? `Run Multi-Agent Analysis (${selectedCaseIds.size} Selected Cases)`
                  : `Run Multi-Agent Analysis (All ${records.length} Cases)`}
              </span>
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>
        </div>

        {/* CSV Ingestion Banner when active */}
        {showUploadZone && (
          <div className="mt-5 p-5 bg-slate-50 dark:bg-slate-850 border border-dashed border-cyan-400 dark:border-cyan-500/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-800 dark:text-cyan-300 text-xs font-bold">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Healthcare Survey CSV File (Parse & Validate Without Auto-Analyzing)</span>
              </div>
              <button onClick={() => setShowUploadZone(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Drag and drop your dataset or select a file. The system preserves original patient identifiers and maps standard fields (<code className="text-cyan-700 dark:text-cyan-300 font-bold">Patient_Satisfaction</code>, <code className="text-cyan-700 dark:text-cyan-300 font-bold">Communication_Rating</code>, <code className="text-cyan-700 dark:text-cyan-300 font-bold">Complaint_Severity</code>, <code className="text-cyan-700 dark:text-cyan-300 font-bold">AI_Risk_Flag</code>, <code className="text-cyan-700 dark:text-cyan-300 font-bold">Comment</code>, and <code className="text-cyan-700 dark:text-cyan-300 font-bold">Patient_Facing_Communication</code>). Model analysis will not run until you explicitly click "Run Multi-Agent Analysis".
            </p>
            <input 
              type="file" 
              accept=".csv,text/csv" 
              onChange={(e) => e.target.files?.[0] && handleExplorerCSVUpload(e.target.files[0])}
              className="block w-full text-xs text-slate-700 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
            />
          </div>
        )}

        {/* Upload Status Alert (Requirement 9: Do not automatically analyze) */}
        {uploadStatusNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:text-cyan-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <span className="font-medium">{uploadStatusNotice}</span>
            </div>
            <button onClick={() => setUploadStatusNotice(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* REQUIREMENT 2 & 8: DATASET HEALTH & SCHEMA VALIDATION TELEMETRY */}
      {showValidationPanel && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Dataset Schema Validation & Missing Values Audit</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Audited purely in application code across {validationReport.totalRecords} records.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold">
                {validationReport.availableFields.length} Available Fields
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">
                {validationReport.missingFields.length} Unmatched Fields
              </span>
            </div>
          </div>

          {/* Validation Warnings if any */}
          {validationReport.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Schema Validation Warnings:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200/90">
                {validationReport.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Field-by-Field Telemetry Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Standard Field</th>
                  <th className="py-2.5 px-3">Matched CSV Header</th>
                  <th className="py-2.5 px-3">Present Records</th>
                  <th className="py-2.5 px-3">Missing Values</th>
                  <th className="py-2.5 px-3">Completeness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {validationReport.fieldValidations.map(f => (
                  <tr key={f.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${f.presentCount > 0 ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
                      <span>{f.label}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {f.matchedHeader ? (
                        <span className="text-cyan-700 dark:text-cyan-300 font-bold">{f.matchedHeader}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Not in header (derived)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                      {f.presentCount} / {validationReport.totalRecords}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      <span className={f.missingCount > 0 ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                        {f.missingCount} rows ({100 - f.completionRate}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              f.completionRate >= 90 ? 'bg-emerald-500' :
                              f.completionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${f.completionRate}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-semibold tabular-nums">{f.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUIREMENT 7 & 8: DETERMINISTIC NUMERICAL SUMMARY RIBBON (CALCULATED IN TS CODE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Records */}
        <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs transition-colors">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 uppercase font-bold mb-1">Total Records</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{validationReport.totalRecords}</div>
          <div className="text-[10px] text-cyan-800 dark:text-cyan-300 mt-1 font-semibold">Calculated in app code</div>
        </div>

        {/* Mean Patient Satisfaction */}
        <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs transition-colors">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 uppercase font-bold mb-1">Mean Satisfaction</div>
          <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 font-mono tabular-nums">
            {validationReport.numericalSummary.meanSatisfaction.toFixed(2)}{' '}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-700 dark:text-slate-300 mt-1 flex items-center space-x-1 font-medium">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span>Patient_Satisfaction</span>
          </div>
        </div>

        {/* Mean Communication Rating */}
        <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs transition-colors">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 uppercase font-bold mb-1">Comm Rating</div>
          <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 font-mono tabular-nums">
            {validationReport.numericalSummary.meanCommunicationRating.toFixed(2)}{' '}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-700 dark:text-slate-300 mt-1 flex items-center space-x-1 font-medium">
            <MessageCircle className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Communication_Rating</span>
          </div>
        </div>

        {/* Critical Severity Count */}
        <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs transition-colors">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 uppercase font-bold mb-1">Critical (L4)</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {validationReport.numericalSummary.severityCounts.level4}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-medium font-mono">
            L3: {validationReport.numericalSummary.severityCounts.level3} | L2: {validationReport.numericalSummary.severityCounts.level2}
          </div>
        </div>

        {/* AI Risk Flags */}
        <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs transition-colors">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 uppercase font-bold mb-1">AI Risk Flags</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono tabular-nums">
            {validationReport.numericalSummary.aiRiskFlagCounts.humanReview + 
             validationReport.numericalSummary.aiRiskFlagCounts.hallucination + 
             validationReport.numericalSummary.aiRiskFlagCounts.bias}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Halluc: {validationReport.numericalSummary.aiRiskFlagCounts.hallucination} | Bias: {validationReport.numericalSummary.aiRiskFlagCounts.bias}
          </div>
        </div>

        {/* Follow-Up Compliance */}
        <div className="bg-white dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs transition-colors">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 uppercase font-bold mb-1">Compliance Rate</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
            {validationReport.numericalSummary.complianceRate}%
          </div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {validationReport.numericalSummary.uniquePersonasCount} Personas represented
          </div>
        </div>
      </div>

      {/* REQUIREMENT 4: COMPREHENSIVE FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl p-5 shadow-xs dark:shadow-md space-y-4 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Interactive Filters & Dynamic Querying</span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Showing {filteredRecords.length} of {records.length} Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Free Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, comment, dialogue, persona..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
            />
          </div>

          {/* Patient Persona Filter */}
          <div>
            <select
              value={selectedPersona}
              onChange={(e) => { setSelectedPersona(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-semibold"
            >
              <option value="All">Patient Persona: All ({availablePersonas.length})</option>
              {availablePersonas.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Service Line Filter */}
          <div>
            <select
              value={selectedServiceLine}
              onChange={(e) => { setSelectedServiceLine(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-semibold"
            >
              <option value="All">Service Line: All ({availableServiceLines.length})</option>
              {availableServiceLines.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Visit Type Filter */}
          <div>
            <select
              value={selectedVisitType}
              onChange={(e) => { setSelectedVisitType(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-semibold"
            >
              <option value="All">Visit Type: All ({availableVisitTypes.length})</option>
              {availableVisitTypes.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Patient_Satisfaction Filter (1-5) */}
          <div>
            <select
              value={selectedSatisfaction}
              onChange={(e) => { setSelectedSatisfaction(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-semibold"
            >
              <option value="All">Patient_Satisfaction: All</option>
              <option value="1">1 Star (Severe Dissatisfaction)</option>
              <option value="2">2 Stars (Dissatisfied)</option>
              <option value="3">3 Stars (Neutral)</option>
              <option value="4">4 Stars (Satisfied)</option>
              <option value="5">5 Stars (Exemplary)</option>
            </select>
          </div>

          {/* Complaint_Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => { setSelectedSeverity(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-semibold"
            >
              <option value="All">Complaint_Severity: All</option>
              <option value="LEVEL 4 – Critical">LEVEL 4 – Critical</option>
              <option value="LEVEL 3 – High">LEVEL 3 – High</option>
              <option value="LEVEL 2 – Moderate">LEVEL 2 – Moderate</option>
              <option value="LEVEL 1 – Low">LEVEL 1 – Low</option>
              <option value="None">None (Positive / Routine)</option>
            </select>
          </div>

          {/* AI_Risk_Flag Filter */}
          <div>
            <select
              value={selectedAiRisk}
              onChange={(e) => { setSelectedAiRisk(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-[#080d18] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-semibold"
            >
              <option value="All">AI_Risk_Flag: All</option>
              <option value="Hallucination Risk">Hallucination Risk</option>
              <option value="Bias Review">Bias Review</option>
              <option value="Human Review Required">Human Review Required</option>
              <option value="None">None (Unflagged)</option>
            </select>
          </div>

          {/* Reset Filters & Review Flag */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setOnlyFlagged(!onlyFlagged); setCurrentPage(1); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-2xs ${
                onlyFlagged
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/60'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#121c2e] dark:hover:bg-[#1a263d] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Flagged ({records.filter(r => r.requires_human_review).length})</span>
            </button>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('All');
                setSelectedPersona('All');
                setSelectedServiceLine('All');
                setSelectedVisitType('All');
                setSelectedSatisfaction('All');
                setSelectedSeverity('All');
                setSelectedAiRisk('All');
                setOnlyFlagged(false);
                setCurrentPage(1);
              }}
              title="Reset All Filters"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#121c2e] dark:hover:bg-[#1a263d] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 3: MULTI-CASE SELECTION ACTION BAR */}
      <div className="bg-slate-100 dark:bg-[#121c2e] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-200">Case Selection:</span>
          <button
            onClick={handleSelectEntireDataset}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer shadow-2xs ${
              isEntireDatasetSelected
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-200 dark:border-cyan-700/60'
                : 'bg-white dark:bg-[#080d18] text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-slate-700'
            }`}
          >
            {isEntireDatasetSelected ? 'Deselect Entire Dataset' : `Select All Cases (${records.length})`}
          </button>
          <button
            onClick={handleSelectHighSeverityOnly}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#080d18] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 text-[11px] font-bold transition cursor-pointer shadow-2xs"
          >
            Select High/Critical Severity
          </button>
          <button
            onClick={handleSelectAiRisksOnly}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#080d18] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 text-[11px] font-bold transition cursor-pointer shadow-2xs"
          >
            Select AI Risk Cases
          </button>
          {selectedCaseIds.size > 0 && (
            <button
              onClick={handleClearSelection}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#080d18] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="font-mono text-cyan-800 dark:text-cyan-300 font-bold">
            {selectedCaseIds.size === 0 
              ? 'No cases selected (Full dataset default)'
              : `${selectedCaseIds.size} of ${records.length} Cases Selected`}
          </div>
          {selectedCaseIds.size > 0 && onRunMultiAgentAnalysis && (
            <button
              onClick={() => handleTriggerAnalysis('selection')}
              disabled={isOrchestrating}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-xs transition cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Run Agents on {selectedCaseIds.size} Cases</span>
            </button>
          )}
        </div>
      </div>

      {/* REQUIREMENT 3 & 5 & 7: INTERACTIVE DATA TABLE */}
      <div className="bg-white dark:bg-[#0e1626] border border-slate-300 dark:border-slate-750 rounded-2xl shadow-xs dark:shadow-md overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-[#080d18] text-slate-800 dark:text-slate-200 uppercase text-[10px] font-bold border-b-2 border-slate-300 dark:border-slate-700">
              <tr>
                {/* Selection Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={handleToggleSelectAllVisible}
                    className="w-3.5 h-3.5 rounded bg-white dark:bg-[#080d18] border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                    title="Select/Deselect visible rows"
                  />
                </th>
                <th className="py-3 px-3">Patient / Case ID</th>
                <th className="py-3 px-3">Persona</th>
                <th className="py-3 px-3">Service Line & Visit</th>
                <th className="py-3 px-3">Patient_Satisfaction</th>
                <th className="py-3 px-3">Communication_Rating</th>
                <th className="py-3 px-3">Complaint_Severity</th>
                <th className="py-3 px-3">AI_Risk_Flag</th>
                <th className="py-3 px-3 max-w-xs">Comment</th>
                <th className="py-3 px-3 max-w-xs">Patient_Facing_Communication</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0e1626]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                    No patient records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isSelected = selectedCaseIds.has(r.id);
                  const sat = Number(r.satisfaction_score || r.patient_satisfaction || 3);
                  const comm = Number(r.communication_rating ?? 3);
                  const isCritical = r.complaint_severity === 'LEVEL 4 – Critical' || sat <= 1;

                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-cyan-50/60 dark:hover:bg-[#142036] transition ${isSelected ? 'bg-cyan-50/90 dark:bg-cyan-950/40' : ''}`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(r.id)}
                          className="w-3.5 h-3.5 rounded bg-white dark:bg-[#080d18] border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Requirement 5: Preserve Original Patient/Case Identifier */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span>{r.patient_id}</span>
                          {r.requires_human_review && (
                            <span title="Flagged for Clinical Review">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Persona */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-cyan-850 dark:text-cyan-300 font-bold">
                          {r.patient_persona || 'General Patient'}
                        </span>
                        <span className="block text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">
                          {r.age_group || 'Age Unspec.'}
                        </span>
                      </td>

                      {/* Service Line & Visit Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {r.service_line || r.department}
                        </span>
                        <span className="block text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                          {r.visit_type || 'Routine'} &bull; {r.department}
                        </span>
                      </td>

                      {/* Patient_Satisfaction (Requirement 6) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className={`font-bold font-mono tabular-nums ${
                            sat >= 4 ? 'text-emerald-700 dark:text-emerald-400' :
                            sat === 3 ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {sat}★
                          </span>
                          <span className="text-[10px] text-slate-500">/ 5</span>
                        </div>
                      </td>

                      {/* Communication_Rating (Requirement 6) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className={`font-bold font-mono tabular-nums ${
                            comm >= 4 ? 'text-emerald-700 dark:text-emerald-400' :
                            comm === 3 ? 'text-cyan-800 dark:text-cyan-300' : 'text-amber-700 dark:text-amber-400'
                          }`}>
                            {comm}
                          </span>
                          <span className="text-[10px] text-slate-500">/ 5</span>
                        </div>
                      </td>

                      {/* Complaint_Severity (Requirement 6) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          r.complaint_severity?.includes('Critical') || isCritical
                            ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/60'
                            : r.complaint_severity?.includes('High')
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/60'
                            : r.complaint_severity?.includes('Moderate')
                            ? 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-200 dark:border-yellow-700/60'
                            : r.complaint_severity?.includes('Low')
                            ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700/60'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {r.complaint_severity || 'None'}
                        </span>
                      </td>

                      {/* AI_Risk_Flag (Requirement 6) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          String(r.ai_risk_flags).includes('Hallucination')
                            ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700/60'
                            : String(r.ai_risk_flags).includes('Bias')
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-700/60'
                            : String(r.ai_risk_flags).includes('Human') || r.requires_human_review
                            ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/60'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                          {String(r.ai_risk_flags || 'None')}
                        </span>
                      </td>

                      {/* Comment (Requirement 6) */}
                      <td className="py-3 px-3 max-w-xs truncate" title={r.feedback_text}>
                        <span className="text-slate-800 dark:text-slate-200 italic font-medium">"{r.feedback_text}"</span>
                      </td>

                      {/* Patient_Facing_Communication (Requirement 6) */}
                      <td className="py-3 px-3 max-w-xs truncate" title={r.communication_text || 'None'}>
                        {r.communication_text ? (
                          <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                            {r.communication_text}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">Not captured</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(r)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-slate-300 dark:bg-[#121c2e] dark:hover:bg-[#1a263d] dark:text-cyan-300 dark:border-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                          Inspect Case
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#080d18] transition-colors">
          <div>
            Page <span className="font-bold text-slate-900 dark:text-white tabular-nums">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white tabular-nums">{totalPages}</span>
            <span className="ml-2 text-slate-500 font-medium">({filteredRecords.length} filtered records)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent disabled:opacity-40 transition cursor-pointer font-semibold shadow-2xs"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent disabled:opacity-40 transition cursor-pointer font-semibold shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER FOR SINGLE CASE (Requirement 3 & 6) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-slate-900 dark:text-white transition-colors">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white text-lg font-mono">{selectedRecord.patient_id}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold">
                    {selectedRecord.department}
                  </span>
                  {selectedRecord.service_line && (
                    <span className="px-2 py-0.5 rounded text-xs bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-semibold">
                      {selectedRecord.service_line}
                    </span>
                  )}
                  {selectedRecord.requires_human_review && (
                    <span className="px-2 py-0.5 rounded text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 flex items-center space-x-1 font-bold">
                      <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      <span>Human Review Mandated</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  Encounter: {selectedRecord.visit_date} &bull; Triage: {selectedRecord.triage_acuity || 'Standard'} &bull; Disposition: {selectedRecord.discharge_status || 'Routine'}
                </p>
              </div>
            </div>

            {/* Semantic Standard Fields Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Patient_Persona</span>
                <strong className="text-cyan-800 dark:text-cyan-300 font-semibold">{selectedRecord.patient_persona || 'Standard Patient'}</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Visit_Type</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedRecord.visit_type || 'General Encounter'}</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Patient_Satisfaction</span>
                <strong className="text-yellow-700 dark:text-yellow-400 font-mono font-bold tabular-nums">
                  {selectedRecord.satisfaction_score || selectedRecord.patient_satisfaction || '3'} / 5 ★
                </strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Communication_Rating</span>
                <strong className="text-cyan-800 dark:text-cyan-300 font-mono font-bold tabular-nums">
                  {selectedRecord.communication_rating ?? '3'} / 5
                </strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Complaint_Severity</span>
                <span className={`font-semibold ${
                  selectedRecord.complaint_severity?.includes('Critical') ? 'text-rose-600 dark:text-rose-400 font-bold' :
                  selectedRecord.complaint_severity?.includes('High') ? 'text-amber-600 dark:text-amber-400 font-semibold' :
                  'text-slate-700 dark:text-slate-300'
                }`}>
                  {selectedRecord.complaint_severity || 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">AI_Risk_Flag</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300 font-mono">
                  {String(selectedRecord.ai_risk_flags || 'None')}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Follow-Up Compliance</span>
                <strong className={selectedRecord.follow_up_compliance === 'Compliant' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                  {selectedRecord.follow_up_compliance || 'Pending'}
                </strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Wait Time</span>
                <strong className="text-slate-900 dark:text-slate-200 font-mono tabular-nums">{selectedRecord.wait_time_minutes} minutes</strong>
              </div>
            </div>

            {/* Comment (Feedback Text) Box */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Comment (Patient Narrative / Grievance):
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  "{selectedRecord.feedback_text}"
                </p>
              </div>

              {/* Patient_Facing_Communication Box */}
              {selectedRecord.communication_text && (
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Patient_Facing_Communication (Discharge / Clinical Dialogue):
                  </span>
                  <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {selectedRecord.communication_text}
                  </p>
                </div>
              )}

              {/* Human-in-the-Loop Review Controls */}
              <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Clinical Quality & Safety Reviewer Notes</span>
                  </span>
                  <button
                    onClick={() => handleToggleFlag(selectedRecord)}
                    className={`text-xs px-2.5 py-1 rounded border transition cursor-pointer font-semibold ${
                      selectedRecord.requires_human_review
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {selectedRecord.requires_human_review ? 'Flagged for Escalation' : 'Not Flagged'}
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Enter clinical manager notes, service recovery instructions, or escalation justification..."
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition cursor-pointer shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Reviewer Notes</span>
                  </button>
                </div>
              </div>

              {/* Standalone Agent Runner on this Record */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Test Specialist AI Agent On This Record:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTestAgentOnThisRecord('agent3')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-medium transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Triage Complaint (Agent 3)</span>
                  </button>

                  <button
                    onClick={() => handleTestAgentOnThisRecord('agent6')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 text-xs font-medium transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Evaluate Communication (Agent 6)</span>
                  </button>

                  <button
                    onClick={() => handleTestAgentOnThisRecord('agent1')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 text-xs font-medium transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Analyze Feedback (Agent 1)</span>
                  </button>
                </div>

                {/* Agent Single Test Result Display */}
                {agentTestResult && (
                  <div className="mt-3 bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-300 dark:border-slate-800 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px] text-cyan-700 dark:text-cyan-400 font-sans mb-1 font-bold">
                      <span>{agentTestResult.agentId.toUpperCase()} Execution Response:</span>
                      {agentTestResult.loading && <span className="animate-pulse">Calling Gemini API...</span>}
                    </div>
                    {agentTestResult.loading ? (
                      <div className="text-slate-600 dark:text-slate-400 py-3 text-center">Processing record with model...</div>
                    ) : (
                      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-[10px]">
                        {JSON.stringify(agentTestResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
