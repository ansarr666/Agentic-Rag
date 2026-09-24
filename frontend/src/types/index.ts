export type UserRole = 'employee' | 'admin' | 'engineer';

export type AgentDecision =
  | 'internal_rag'
  | 'google_drive'
  | 'web_search'
  | 'calculator'
  | 'multi_tool'
  | 'clarification'
  | 'abstain';

export type EvidenceState = 'sufficient' | 'partial' | 'insufficient' | 'conflicting';

export interface SourceItem {
  type: 'internal_document' | 'google_drive' | 'web_search';
  document_id: string;
  title: string;
  section?: string;
  page?: number;
  url?: string;
  snippet: string;
  score: number;
  authority?: string;
}

export interface Citation {
  id: string;
  chunkId: string;
  docId: string;
  docTitle: string;
  section?: string;
  page?: number;
  snippet: string;
  highlightedText?: string;
  confidenceScore: number;
  category?: string;
}

export interface AgentStep {
  id?: string;
  stage?: string;
  label?: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  timestamp?: string;
  details?: string;
  latency_ms?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  decision?: AgentDecision;
  evidenceState?: EvidenceState;
  confidenceLabel?: string;
  sources?: SourceItem[];
  citations?: Citation[];
  agentActivity?: AgentStep[];
  latencyMs?: number;
  confidenceScore?: number;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  category?: string;
}

export interface DocumentRecord {
  id: string;
  filename: string;
  title: string;
  collection: string;
  fileSizeBytes: number;
  status: 'Ready' | 'Processing' | 'Chunking' | 'Indexing' | 'Failed';
  totalChunks: number;
  uploadedAt: string;
  lastIndexedAt: string;
  accessScope: 'All Employees' | 'Confidential' | 'HR Only' | 'Engineering Only';
  summary: string;
  rawText?: string;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  docCount: number;
  chunkCount: number;
  lastUpdated: string;
  accessScope: string;
  iconName: string;
  status: 'Active' | 'Syncing' | 'Needs Review';
}

export interface AgentTool {
  id: string;
  name: string;
  code: string;
  category: 'Retrieval' | 'Analysis' | 'Data' | 'Integration' | 'Communication';
  description: string;
  enabled: boolean;
  accessScope: 'All Employees' | 'Elevated Roles' | 'Admin Only';
  executions24h: number;
  avgLatencyMs: number;
  status: 'Online' | 'Degraded' | 'Offline';
}

export interface DecisionTestCase {
  id: string;
  query: string;
  category: string;
  expected_route: string;
  actual_route: string;
  route_correct: boolean;
  expected_tool: string;
  actual_tools: string[];
  tool_correct: boolean;
  unnecessary_tool_called: boolean;
  expected_answerability: string;
  actual_answerability: string;
  answerability_correct: boolean;
  abstention_correct: boolean;
  structured_output_valid: boolean;
  calculation_correct?: boolean | null;
  faithfulness_score: number;
  citation_valid: boolean;
  latency_ms: number;
  status: 'PASS' | 'FAIL';
  failure_reason?: string | null;
  answer?: string;
  sources?: SourceItem[];
}

export interface DecisionBenchmarkReport {
  timestamp: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  overall_pass_rate: number;
  route_accuracy: number;
  tool_selection_accuracy: number;
  unnecessary_tool_rate: number;
  answerability_accuracy: number;
  abstention_correctness: number;
  structured_output_validity: number;
  calculation_accuracy: number;
  avg_faithfulness: number;
  avg_latency_ms: number;
  confusion_matrix: Record<string, Record<string, number>>;
  detailed_cases: DecisionTestCase[];
}

export interface EvaluationQuery {
  id: string;
  query: string;
  groundTruthDoc: string;
  expectedKeywords: string[];
  intent: string;
  status: 'PASS' | 'FAIL' | 'UNANSWERABLE_PASS';
  retrievedDocs: string[];
  faithfulnessScore: number;
  latencyMs: number;
}

export interface EvaluationBenchmark {
  timestamp: string;
  totalQueries: number;
  hitRateAt3: number;
  mrr: number;
  precisionAt3: number;
  faithfulnessScore: number;
  relevanceScore: number;
  avgLatencyMs: number;
  queries: EvaluationQuery[];
}

export interface PipelineStageTrace {
  stageId: number;
  name: string;
  description: string;
  latencyMs: number;
  inputSummary: string;
  outputSummary: string;
  details?: Record<string, any>;
}

export interface ObservabilityLog {
  id: string;
  timestamp: string;
  query: string;
  userRole: string;
  latencyMs: number;
  status: 'Success' | 'Fallback' | 'Error';
  retrievedCount: number;
  model: string;
}

export interface GoogleDriveStatus {
  connected: boolean;
  account: string;
  workspace: string;
  last_sync: string;
  sync_status: string;
  documents_discovered: number;
  documents_indexed: number;
  selected_sources?: {
    my_drive?: boolean;
    shared_drives?: string[];
    folders?: string[];
    files?: string[];
  };
}

export interface GoogleDriveSources {
  my_drive: { name: string; available: boolean; selected: boolean };
  shared_drives: Array<{ id: string; name: string; doc_count: number; path: string }>;
  folders: Array<{ id: string; name: string; parent: string }>;
}

export interface SystemSettings {
  systemName: string;
  primaryModel: string;
  fallbackModel: string;
  temperature: number;
  maxTokens: number;
  retrievalAlpha: number;
  topKRetrieval: number;
  rerankingEnabled: boolean;
  groundingStrictness: 'Permissive' | 'Balanced' | 'Strict Core Rules';
  auditLogging: boolean;
  retentionDays: number;
}
