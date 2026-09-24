import { 
  Conversation, 
  DocumentRecord, 
  KnowledgeCollection, 
  AgentTool, 
  EvaluationBenchmark, 
  ObservabilityLog, 
  SystemSettings,
  PipelineStageTrace
} from '../types';

export const initialCollections: KnowledgeCollection[] = [
  {
    id: 'col-services',
    name: 'Company Information & Services',
    description: 'Official capabilities, client Q&A, service catalog, and project portfolios.',
    docCount: 1,
    chunkCount: 74,
    lastUpdated: 'Today at 2:52 PM',
    accessScope: 'All Employees',
    iconName: 'Building2',
    status: 'Active'
  },
  {
    id: 'col-engineering',
    name: 'Engineering & Architecture',
    description: 'System design standards, API contracts, deployment guidelines, and codebase practices.',
    docCount: 4,
    chunkCount: 142,
    lastUpdated: 'Yesterday at 5:10 PM',
    accessScope: 'Engineering Only',
    iconName: 'Code2',
    status: 'Active'
  },
  {
    id: 'col-operations',
    name: 'Operations & Delivery',
    description: 'Sprint protocols, client SLA definitions, on-demand app delivery templates, and QA checklists.',
    docCount: 3,
    chunkCount: 88,
    lastUpdated: '3 days ago',
    accessScope: 'All Employees',
    iconName: 'Briefcase',
    status: 'Active'
  },
  {
    id: 'col-marketing',
    name: 'Sales & Digital Marketing',
    description: 'SEO strategy, Google Ads vs Facebook Ads guidelines, branding and logo identity packages.',
    docCount: 2,
    chunkCount: 56,
    lastUpdated: '4 days ago',
    accessScope: 'All Employees',
    iconName: 'TrendingUp',
    status: 'Active'
  },
  {
    id: 'col-client-docs',
    name: 'Client Documentation',
    description: 'Case studies for eCommerce stores, skincare brand sites, and food ordering platforms.',
    docCount: 3,
    chunkCount: 92,
    lastUpdated: '1 week ago',
    accessScope: 'All Employees',
    iconName: 'FileText',
    status: 'Active'
  },
  {
    id: 'col-hr',
    name: 'HR & Governance (Archived)',
    description: 'Historical records and internal company compliance documents.',
    docCount: 0,
    chunkCount: 0,
    lastUpdated: 'Removed today',
    accessScope: 'HR Only',
    iconName: 'ShieldAlert',
    status: 'Needs Review'
  }
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: 'doc-001',
    filename: 'OrionSoft_Chatbot_QA.pdf',
    title: 'OrionSoft Technologies - Services & Client Chatbot Knowledge',
    collection: 'Company Information & Services',
    fileSizeBytes: 24159,
    status: 'Ready',
    totalChunks: 74,
    uploadedAt: 'Today at 2:50 PM',
    lastIndexedAt: 'Today at 2:52 PM',
    accessScope: 'All Employees',
    summary: 'Comprehensive 12-section customer FAQ covering Web, Mobile (Uber/Zomato on-demand), Cloud, Cybersecurity, AI/Chatbots, Staff Augmentation, SEO, Paid Ads, and Brand Design.'
  },
  {
    id: 'doc-002',
    filename: 'Mobile_Architecture_Standards_v2.pdf',
    title: 'Mobile App Architecture & On-Demand Systems Spec',
    collection: 'Engineering & Architecture',
    fileSizeBytes: 148200,
    status: 'Ready',
    totalChunks: 42,
    uploadedAt: 'Yesterday at 4:12 PM',
    lastIndexedAt: 'Yesterday at 4:15 PM',
    accessScope: 'Engineering Only',
    summary: 'Technical blueprints for real-time driver tracking, customer ordering flows, and admin dispatcher panels.'
  },
  {
    id: 'doc-003',
    filename: 'SEO_and_Marketing_Playbook_2026.docx',
    title: 'Digital Marketing & Paid Acquisition Playbook',
    collection: 'Sales & Digital Marketing',
    fileSizeBytes: 89400,
    status: 'Ready',
    totalChunks: 38,
    uploadedAt: '16-Sep-2026',
    lastIndexedAt: '16-Sep-2026',
    accessScope: 'All Employees',
    summary: 'Best practices comparing high-intent search (Google Ads) and demographic interest targeting (Facebook/Instagram Ads).'
  },
  {
    id: 'doc-004',
    filename: 'Staff_Augmentation_Master_Agreement.pdf',
    title: 'Staff Augmentation & Developer Allocation Policy',
    collection: 'Operations & Delivery',
    fileSizeBytes: 64200,
    status: 'Ready',
    totalChunks: 26,
    uploadedAt: '15-Sep-2026',
    lastIndexedAt: '15-Sep-2026',
    accessScope: 'All Employees',
    summary: 'Terms of engagement, onboarding timelines, and client management workflows for dedicated engineers.'
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-01',
    title: 'On-demand App Capabilities (Uber / Zomato)',
    createdAt: 'Today, 2:40 PM',
    updatedAt: 'Today, 2:42 PM',
    category: 'Engineering & Services',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Can you build on-demand service apps like Zomato or Uber?',
        timestamp: '2:40 PM'
      },
      {
        id: 'm2',
        role: 'assistant',
        content: `Yes, OrionSoft Technologies builds custom on-demand and service-based mobile applications with complete end-to-end architectures:

1. **Core Feature Set**: Includes real-time live GPS tracking, dynamic order matching, and integrated secure payment gateways.
2. **Dual Portals**: We build both the user-facing customer app (available seamlessly on iOS and Android) and dedicated admin/staff dispatcher panels to manage orders, bookings, and fleet allocations.
3. **Social Authentication**: Supports one-tap social logins via Google and Facebook for fast onboarding.
4. **Maintenance & Support**: Post-launch technical support and iterative feature expansion as your business scales.`,
        timestamp: '2:41 PM',
        latencyMs: 142,
        confidenceScore: 0.94,
        citations: [
          {
            id: 'c1',
            chunkId: 'OrionSoft_Chatbot_QA.pdf_c0012',
            docId: 'OrionSoft_Chatbot_QA.pdf',
            docTitle: 'OrionSoft Technologies Client Chatbot Knowledge',
            section: 'App Development · On-Demand Capabilities',
            page: 3,
            snippet: 'Q: Can you build an app like Zomato or Uber?\nA: Yes, we can build on demand and service based apps with features like live tracking, order matching, and payments.',
            highlightedText: 'Yes, we can build on demand and service based apps with features like live tracking, order matching, and payments.',
            confidenceScore: 0.96,
            category: 'Mobile Applications'
          },
          {
            id: 'c2',
            chunkId: 'OrionSoft_Chatbot_QA.pdf_c0013',
            docId: 'OrionSoft_Chatbot_QA.pdf',
            docTitle: 'OrionSoft Technologies Client Chatbot Knowledge',
            section: 'App Development · Admin Panels & Cross-Platform',
            page: 4,
            snippet: 'Q: Do you build both the app and the admin panel to manage it?\nA: Yes, we build the customer app, and if needed, a separate app or panel for your team or staff to manage things like orders and bookings.\nQ: Will my app work on both iPhone and Android?\nA: Yes, we can build the app to work on both.',
            highlightedText: 'we build the customer app, and if needed, a separate app or panel for your team or staff to manage things',
            confidenceScore: 0.92,
            category: 'Architecture'
          }
        ],
        agentActivity: [
          { id: 's1', label: 'Parsed employee question & identified mobile app capabilities intent', status: 'completed' },
          { id: 's2', label: 'Searched internal Knowledge Base across vector and keyword indices', status: 'completed' },
          { id: 's3', label: 'Retrieved 4 relevant sections from OrionSoft_Chatbot_QA.pdf', status: 'completed' },
          { id: 's4', label: 'Synthesized grounded response with strict enterprise constraints', status: 'completed' },
          { id: 's5', label: 'Generated authoritative clickable source citations', status: 'completed' }
        ]
      }
    ]
  },
  {
    id: 'conv-02',
    title: 'Staff Augmentation & Dedicated Developers',
    createdAt: 'Today, 1:15 PM',
    updatedAt: 'Today, 1:18 PM',
    category: 'Company Services',
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'What is staff augmentation and can I hire dedicated developers from your team?',
        timestamp: '1:15 PM'
      },
      {
        id: 'm4',
        role: 'assistant',
        content: `**Staff Augmentation** allows clients to add skilled developers directly to their existing team on a temporary or ongoing project basis, bypassing the long and costly traditional hiring process.

Key aspects from our company documentation:
- **Flexible Team Sizing**: You can hire a single specialized engineer or a complete cross-functional engineering team.
- **Skill Availability**: Engineers experienced in modern Web development, Mobile applications (iOS/Android), Cloud platforms, and Artificial Intelligence.
- **Direct Collaboration**: Developers work directly alongside your team, participate in daily standups, and follow your internal sprints.
- **Contract Flexibility**: Engagements can scale up, scale down, or conclude based on project milestones.`,
        timestamp: '1:16 PM',
        latencyMs: 135,
        confidenceScore: 0.96,
        citations: [
          {
            id: 'c3',
            chunkId: 'OrionSoft_Chatbot_QA.pdf_c0044',
            docId: 'OrionSoft_Chatbot_QA.pdf',
            docTitle: 'OrionSoft Technologies Client Chatbot Knowledge',
            section: 'Staff Augmentation and Hiring Developers',
            page: 8,
            snippet: 'Q: What is staff augmentation exactly?\nA: It means adding our developers to your existing team on a temporary or ongoing basis, instead of hiring full time employees yourself.\nQ: Can I hire just one developer, or does it have to be a full team?\nA: You can hire based on what you need.',
            highlightedText: 'adding our developers to your existing team on a temporary or ongoing basis, instead of hiring full time employees yourself.',
            confidenceScore: 0.98,
            category: 'Staffing'
          }
        ],
        agentActivity: [
          { id: 's1', label: 'Understood staff augmentation inquiry', status: 'completed' },
          { id: 's2', label: 'Queried Company Information & Services collection', status: 'completed' },
          { id: 's3', label: 'Extracted terms of developer engagement', status: 'completed' },
          { id: 's4', label: 'Verified accuracy against official handbook', status: 'completed' }
        ]
      }
    ]
  },
  {
    id: 'conv-03',
    title: 'Probation Leave Policy Query (Negative Test)',
    createdAt: 'Yesterday, 4:00 PM',
    updatedAt: 'Yesterday, 4:02 PM',
    category: 'Policy & Compliance',
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'What is the leave policy during probation period?',
        timestamp: '4:00 PM'
      },
      {
        id: 'm6',
        role: 'assistant',
        content: `The available company documents do not specify this information.

*(Note: In accordance with Enterprise Grounding Rule 6, the system strictly relies on indexed company documents. Because the general HR employee policy is currently not indexed in this collection, no ungrounded assumptions or estimates are made.)*`,
        timestamp: '4:01 PM',
        latencyMs: 110,
        confidenceScore: 0.28,
        citations: [],
        agentActivity: [
          { id: 's1', label: 'Analyzed query intent for internal HR probation policy', status: 'completed' },
          { id: 's2', label: 'Searched indexed documents (OrionSoft_Chatbot_QA.pdf)', status: 'completed' },
          { id: 's3', label: 'Checked retrieved chunk relevance thresholds', status: 'completed' },
          { id: 's4', label: 'Enforced Rule 6: No speculative answer generated', status: 'completed' }
        ]
      }
    ]
  }
];

export const initialAgentTools: AgentTool[] = [
  {
    id: 'tool-knowledge-search',
    name: 'Knowledge Retrieval Agent',
    code: 'hybrid_rag_search',
    category: 'Retrieval',
    description: 'Combines dense vector embeddings (384-d feature hash) and sparse BM25 keyword matching with Reciprocal Rank Fusion.',
    enabled: true,
    accessScope: 'All Employees',
    executions24h: 1248,
    avgLatencyMs: 42,
    status: 'Online'
  },
  {
    id: 'tool-document-analyzer',
    name: 'Document Synthesizer Agent',
    code: 'doc_cross_synthesis',
    category: 'Analysis',
    description: 'Performs multi-chunk reasoning and cross-document comparison while preserving strict citation integrity.',
    enabled: true,
    accessScope: 'All Employees',
    executions24h: 382,
    avgLatencyMs: 115,
    status: 'Online'
  },
  {
    id: 'tool-database-query',
    name: 'Enterprise SQL Connector',
    code: 'sql_read_only_agent',
    category: 'Data',
    description: 'Executes parameterized, read-only queries against company transactional databases with strict data masking.',
    enabled: true,
    accessScope: 'Elevated Roles',
    executions24h: 94,
    avgLatencyMs: 68,
    status: 'Online'
  },
  {
    id: 'tool-internal-api',
    name: 'Workspace API Gateway',
    code: 'workspace_connectors',
    category: 'Integration',
    description: 'Integrates with internal tools (Jira ticket status, Google Drive assets, Slack team updates).',
    enabled: true,
    accessScope: 'All Employees',
    executions24h: 215,
    avgLatencyMs: 82,
    status: 'Online'
  },
  {
    id: 'tool-web-search',
    name: 'Controlled Web Grounding',
    code: 'external_web_verifier',
    category: 'Retrieval',
    description: 'Optional agent tool for pulling public industry documentation or verified external references when authorized.',
    enabled: false,
    accessScope: 'Admin Only',
    executions24h: 12,
    avgLatencyMs: 240,
    status: 'Online'
  },
  {
    id: 'tool-comms',
    name: 'Notification Dispatcher',
    code: 'comms_dispatcher',
    category: 'Communication',
    description: 'Sends automated task summaries, meeting invites, and confirmation receipts to employee email or Slack.',
    enabled: true,
    accessScope: 'Elevated Roles',
    executions24h: 46,
    avgLatencyMs: 54,
    status: 'Online'
  }
];

export const benchmarkResults: EvaluationBenchmark = {
  timestamp: '2026-09-18 16:01:23',
  totalQueries: 12,
  hitRateAt3: 1.000,
  mrr: 1.000,
  precisionAt3: 1.000,
  faithfulnessScore: 0.879,
  relevanceScore: 0.552,
  avgLatencyMs: 148,
  queries: [
    {
      id: 'q001',
      query: 'What does OrionSoft Technologies do and what services do you provide?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['websites', 'software', 'mobile apps', 'marketing'],
      intent: 'general_factual',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.95,
      latencyMs: 138
    },
    {
      id: 'q002',
      query: 'Can you build on-demand service apps like Zomato or Uber?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['Zomato', 'Uber', 'on demand', 'tracking', 'matching'],
      intent: 'technical_explanation',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.92,
      latencyMs: 145
    },
    {
      id: 'q003',
      query: 'What is staff augmentation and can I hire dedicated developers from your team?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['staff augmentation', 'hire', 'skilled developers', 'project'],
      intent: 'general_factual',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.94,
      latencyMs: 132
    },
    {
      id: 'q004',
      query: 'Do you offer SEO services and how do they help businesses?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['SEO', 'services', 'Google', 'higher', 'business'],
      intent: 'general_factual',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.88,
      latencyMs: 140
    },
    {
      id: 'q005',
      query: 'What is the difference between Google Ads and Facebook Ads?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['Google Ads', 'Facebook Ads', 'searching', 'interests'],
      intent: 'technical_explanation',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.91,
      latencyMs: 152
    },
    {
      id: 'q006',
      query: 'Can you help design a logo and build a complete brand identity?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['logo', 'brand identity', 'colors', 'fonts'],
      intent: 'general_factual',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.96,
      latencyMs: 129
    },
    {
      id: 'q007',
      query: 'Do you offer cybersecurity services and website security audits?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['cybersecurity', 'threats', 'review', 'security gaps'],
      intent: 'technical_explanation',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.89,
      latencyMs: 144
    },
    {
      id: 'q008',
      query: 'Can you build an AI chatbot for our website that connects to WhatsApp?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['chatbot', 'website', 'WhatsApp', 'customer'],
      intent: 'technical_explanation',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.93,
      latencyMs: 156
    },
    {
      id: 'q009',
      query: 'Can you build custom software for specific industries like restaurants or insurance?',
      groundTruthDoc: 'OrionSoft_Chatbot_QA.pdf',
      expectedKeywords: ['custom software', 'restaurants', 'insurance', 'specific business needs'],
      intent: 'technical_explanation',
      status: 'PASS',
      retrievedDocs: ['OrionSoft_Chatbot_QA.pdf'],
      faithfulnessScore: 0.90,
      latencyMs: 141
    },
    {
      id: 'q010',
      query: 'What is the policy for probation period duration and taking leaves?',
      groundTruthDoc: 'UNANSWERABLE',
      expectedKeywords: ['not specify this information'],
      intent: 'policy_compliance',
      status: 'UNANSWERABLE_PASS',
      retrievedDocs: [],
      faithfulnessScore: 1.00,
      latencyMs: 112
    },
    {
      id: 'q011',
      query: 'What are the official office working hours and Saturday schedule?',
      groundTruthDoc: 'UNANSWERABLE',
      expectedKeywords: ['not specify this information'],
      intent: 'policy_compliance',
      status: 'UNANSWERABLE_PASS',
      retrievedDocs: [],
      faithfulnessScore: 1.00,
      latencyMs: 118
    },
    {
      id: 'q012',
      query: 'What is the policy for tuition reimbursement for PhD degrees?',
      groundTruthDoc: 'UNANSWERABLE',
      expectedKeywords: ['not specify this information'],
      intent: 'policy_compliance',
      status: 'UNANSWERABLE_PASS',
      retrievedDocs: [],
      faithfulnessScore: 1.00,
      latencyMs: 108
    }
  ]
};

export const samplePipelineTrace: PipelineStageTrace[] = [
  {
    stageId: 1,
    name: 'Query Ingestion & Normalization',
    description: 'Cleans whitespace, lowercases input, expands standard enterprise abbreviations.',
    latencyMs: 2.1,
    inputSummary: 'Query: "Can you build on-demand service apps like Zomato or Uber?"',
    outputSummary: 'Cleaned query with extracted intent flags: [category: mobile_dev, entities: [Zomato, Uber, on-demand]]'
  },
  {
    stageId: 2,
    name: 'Query Intent & Synonym Expansion',
    description: 'Enriches query with domain terms (e.g. tracking, matching, driver dispatcher).',
    latencyMs: 4.8,
    inputSummary: 'Cleaned text: "can you build on demand service apps like zomato or uber"',
    outputSummary: 'Expanded search tokens: [on demand, service, apps, Zomato, Uber, tracking, matching, mobile]'
  },
  {
    stageId: 3,
    name: 'Dense Vector Retrieval',
    description: 'Encodes query using 384-dimensional deterministic feature hashing & computes cosine similarities.',
    latencyMs: 14.3,
    inputSummary: 'Dimension: 384 | Target Index: 74 chunks',
    outputSummary: 'Top 10 candidate chunks retrieved (Highest vector score: 0.7207)'
  },
  {
    stageId: 4,
    name: 'Sparse BM25 Inverted Search',
    description: 'Morphologically stemmed BM25 Okapi search scoring exact keyword matches and n-grams.',
    latencyMs: 8.5,
    inputSummary: 'Inverted index: 2,140 terms | k1=1.5, b=0.75',
    outputSummary: 'Top 10 lexical candidate chunks retrieved (Highest BM25 score: 8.42)'
  },
  {
    stageId: 5,
    name: 'Reciprocal Rank Fusion (RRF)',
    description: 'Fuses rank positions from vector and BM25 channels using RRF formula with k=60 constant.',
    latencyMs: 3.2,
    inputSummary: 'Vector Top-10 + BM25 Top-10',
    outputSummary: 'Top 3 fused chunks selected: [c0012: rank_score=0.0318, c0013: rank_score=0.0275, c0031: rank_score=0.0194]'
  },
  {
    stageId: 6,
    name: 'Context Selection & Deduplication',
    description: 'Deduplicates overlapping chunk paragraphs, verifies token budget (under 2,048 tokens).',
    latencyMs: 3.0,
    inputSummary: '3 candidate chunks (approx. 480 tokens total)',
    outputSummary: 'Final authoritative context block assembled with unambiguous chunk ID markers.'
  },
  {
    stageId: 7,
    name: '10 Core Rules Grounded LLM Generation',
    description: 'Enforces Grounding, No Speculation, Multi-Chunk Reasoning, Distinctive Concept Verification (Rule 6).',
    latencyMs: 98.4,
    inputSummary: 'Prompt with strict system directives and verified document context',
    outputSummary: 'Grounded natural language response produced with zero hallucinations.'
  },
  {
    stageId: 8,
    name: 'Citations & Confidence Verification',
    description: 'Validates that every claim corresponds to an active retrieved chunk and formats human-readable citations.',
    latencyMs: 7.7,
    inputSummary: 'Generated answer + Source chunk mapping',
    outputSummary: '2 valid citations anchored with page & section metadata. Overall confidence score: 0.94.'
  }
];

export const initialObservabilityLogs: ObservabilityLog[] = [
  {
    id: 'req-9801',
    timestamp: '16:01:41',
    query: 'Can you build on-demand apps like Uber or Zomato?',
    userRole: 'employee',
    latencyMs: 142,
    status: 'Success',
    retrievedCount: 3,
    model: 'Grounded Engine (Llama 3.3 70B Fallback)'
  },
  {
    id: 'req-9802',
    timestamp: '16:02:02',
    query: 'What is the probation period and leave policy?',
    userRole: 'employee',
    latencyMs: 110,
    status: 'Success',
    retrievedCount: 0,
    model: 'Grounded Engine (Rule 6 Negative Gate)'
  },
  {
    id: 'req-9803',
    timestamp: '15:45:10',
    query: 'What is staff augmentation and how to hire dedicated devs?',
    userRole: 'admin',
    latencyMs: 135,
    status: 'Success',
    retrievedCount: 2,
    model: 'Grounded Engine (Llama 3.3 70B Fallback)'
  },
  {
    id: 'req-9804',
    timestamp: '15:30:22',
    query: 'Compare Google Ads vs Facebook Ads benefits',
    userRole: 'employee',
    latencyMs: 154,
    status: 'Success',
    retrievedCount: 2,
    model: 'Grounded Engine (Llama 3.3 70B Fallback)'
  },
  {
    id: 'req-9805',
    timestamp: '14:20:05',
    query: 'Do you provide website security and cybersecurity audits?',
    userRole: 'engineer',
    latencyMs: 144,
    status: 'Success',
    retrievedCount: 3,
    model: 'Grounded Engine (Llama 3.3 70B Fallback)'
  },
  {
    id: 'req-9806',
    timestamp: '13:10:44',
    query: 'Can we build custom claims software for insurance?',
    userRole: 'employee',
    latencyMs: 149,
    status: 'Success',
    retrievedCount: 2,
    model: 'Grounded Engine (Llama 3.3 70B Fallback)'
  }
];

export const initialSystemSettings: SystemSettings = {
  systemName: 'OrionSoft Enterprise Agentic RAG',
  primaryModel: 'Groq Llama-3.3-70b-versatile',
  fallbackModel: 'Deterministic Grounded Pipeline Generator',
  temperature: 0.1,
  maxTokens: 1024,
  retrievalAlpha: 0.5,
  topKRetrieval: 3,
  rerankingEnabled: true,
  groundingStrictness: 'Strict Core Rules',
  auditLogging: true,
  retentionDays: 90
};
