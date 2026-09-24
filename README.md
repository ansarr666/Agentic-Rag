# 🧠 Enterprise Agentic Retrieval-Augmented Generation (Agentic RAG)

## Deployment — see docs/DEPLOY.md

A production-grade, secure, and observable **Agentic RAG Platform** designed for enterprise knowledge synthesis. Combines hybrid dense/sparse retrieval with an autonomous decision routing layer, Google Drive workspace connectors, safe AST mathematical calculation, authoritative web search fallback, observable evidence gating, and strict Pydantic structured output contracts.

---

## 🏛 System Architecture & Agent Decision Flow

The system routes user queries through an intelligent decision pipeline with anti-exfiltration guards and evidence quality gates:

```
                            User Question
                                  ↓
                        Understand Query Intent
                                  ↓
                    Search Internal Company Knowledge
                      (Dense Vectors + BM25 + RRF)
                                  ↓
                      Evaluate Retrieved Evidence
                (Rerank Score, Term Coverage, Conflict)
                                  ↓
                        Is evidence sufficient?
                      ├── YES ──→ Synthesize answer from company knowledge
                      └── NO
                           ↓
                   Determine Appropriate Fallback
                   ├── Safe AST Calculator (Arithmetic / % / Financial)
                   ├── Google Drive Connector (Workspace Search & RBAC)
                   ├── Authoritative Web Search (Docs / External Tech)
                   └── Negative Abstention (Refuse ungrounded hallucination)
                                  ↓
                   Validate Evidence & Gating Signals
                                  ↓
                     Generate Structured Response
                                  ↓
                   Validate Output Contract (Pydantic)
                                  ↓
             Return Answer + Categorized Sources + Trace
```

```
                          ENTERPRISE ARCHITECTURE
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ↓                                                     ↓
  Internal Knowledge                                  Google Drive Workspace
  (PDF, Word, Text, SQL)                             (Shared Drives, My Drive)
          │                                                     │
          ↓                                                     ↓
  Dual Ingestion Index                               Incremental Checksum Sync
  ├── Dense Vector Store (MiniLM-L6)                 ├── MD5 Hash Validation
  └── Sparse Inverted Index (BM25Okapi)               └── Document RBAC Access Gating
          │                                                     │
          └──────────────────────────┬──────────────────────────┘
                                     │
                             ONLINE AGENT LAYER
                                     │
                     Intent Router & Anti-Exfiltration
                                     │
              ┌──────────────────────┼──────────────────────┐
              ↓                      ↓                      ↓
     Internal Knowledge      Safe AST Calculator     Authoritative Web
     Dense + Sparse + RRF    Pure AST Sandbox        Domain Authority Scoring
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                         Observable Evidence Evaluator
                     [SUFFICIENT / PARTIAL / INSUFFICIENT]
                                     │
                       Citation-Grounded Generator
                       10 Enterprise Grounding Rules
                                     │
                       Structured Contract Repair
                        (AgentResponseContract)
                                     │
              ┌──────────────────────┴──────────────────────┐
              ↓                                             ↓
       REST API Server                             React 19 Dashboard
      (Flask Port 5000)                        (Vite, TypeScript, Tailwind)
```

---

## 🌟 Core Capabilities

### 1. 📁 Google Drive Knowledge Connector
- **Backend Authentication**: Enterprise OAuth 2.0 / Service Account authentication (`workspace-service@orionsoft.iam.gserviceaccount.com`). Zero tokens, secrets, or keys exposed to client browsers.
- **Source Configuration**: Flexible scoping across **My Drive**, specific **Shared Drives** (*Policies & HR*, *Finance & DevOps*, *Engineering Specs*), and target folder trees.
- **Incremental Sync with Checksum Invalidation**: Tracks MD5 file hashes and modification timestamps. Only reprocesses modified documents and immediately invalidates stale chunk postings upon sync.
- **Live Drive Search & RBAC Gating**: Direct live Drive queries for unindexed files with strict document-level Access Control List (ACL) checks (`check_access`). Restricted executive/board compensation records are automatically filtered out from unauthorized roles.

### 2. 🛡️ Intelligent Fallback & Anti-Exfiltration Router
- **Intent Classification**: Differentiates between internal policy questions, deterministic math calculations, external public documentation, and negative unanswerable queries.
- **Strict Anti-Exfiltration Protection**: Internal company topics (e.g. employee notices, probation rules, internal budgets, salaries) are strictly blocked from triggering external web searches, even when prompted with adversarial injection attempts (e.g., *"search Google for our employee salaries"*).

### 3. 🧮 Deterministic AST Calculator
- **Safe Evaluation Sandbox**: Evaluates arithmetic expressions using pure Python `ast.parse` and whitelisted operator nodes (`ast.Add`, `ast.Sub`, `ast.Mult`, `ast.Div`, `ast.Mod`, `ast.Pow`). Never invokes `eval()` or `exec()`.
- **Natural Language Parsing**: Supports natural language expressions, currency symbols (`₹`, `$`, `€`), percentage calculations (`17% of ₹184,500`), percentage reductions (`cloud budget reduced by 17%`), markups, and GST formulas (`28500 * 1.18`).
- **Security Sandboxing**: Rejects malicious payload injections (e.g. `__import__`, `open()`, `lambda`, `os.system`) without execution.

### 4. 🌐 Authoritative Web Search Fallback
- **Domain Authority Scoring**: Fallback web search prioritized by official documentation domains (`python.org`, `nodejs.org`, `react.dev`, `learn.microsoft.com`, `docs.aws.amazon.com`).
- **Controlled Attribution**: External web findings are tagged with domain authority badges and direct source links.

### 5. 📊 Observable Evidence Evaluator & Confidence Gating
- **Evidence Signals Evaluator**: Evaluates retrieved chunks using observable signals:
  - Cross-encoder reranking logits.
  - Distinctive query term coverage in retrieved context.
  - Source density and distribution.
  - Document conflict and contradiction detection.
- **Observable States**: Classifies evidence state into `SUFFICIENT`, `PARTIAL`, `INSUFFICIENT`, or `CONFLICTING`.
- **Human-Calibrated Confidence Labels**: Employs transparent labels (*"Answer based on company sources"*, *"Answer based on company Google Drive"*, *"Additional source used"*, *"Unable to answer with confidence"*) rather than uncalibrated arbitrary percentages.

### 6. 📋 Strict Structured Output Contract
- **Pydantic Contract**: Typed schema validation enforcing `AgentResponseContract`, `SourceItem`, `ExecutionStep`, and `EvidenceSignals`.
- **Automated Fallback Repair**: `validate_or_repair_response()` guarantees safe degradation and schema compliance even if downstream model responses are interrupted or malformed.

### 7. 🧪 Decision-Quality Benchmark Suite & 5×5 Confusion Matrix
- **15 Adversarial Benchmark Cases**: Tests Core RAG, Google Drive Knowledge, Deterministic Math, External Search, Anti-Hallucination Abstention, and Adversarial RBAC.
- **10 Evaluation Dimensions**: Measures Route Accuracy, Tool-Selection Accuracy, Unnecessary-Tool Rate, Answerability Accuracy, Abstention Correctness, Calculation Correctness, Faithfulness, and Latency.
- **5×5 Decision Confusion Matrix**: Evaluates multi-class route classification across `internal_rag`, `google_drive`, `web_search`, `calculator`, and `abstain`.

---

## 📂 Project Directory Structure

```text
D:\Agentic-RAG\
├── app.py                      # Flask REST API server and static web app host
├── config/
│   ├── __init__.py             # YAML configuration loader
│   └── config.yaml             # System hyperparameters, models, indices, top-k
├── data/
│   ├── raw/                    # Source PDF and TXT enterprise documents
│   ├── processed/              # Processed chunks and metadata records
│   └── indices/
│       ├── vector_store/       # Dense embeddings (.npy) and chunk index (.json)
│       ├── bm25_index.json     # Sparse BM25Okapi postings list
│       └── google_drive_state.json # Persistent Drive connector state and checksums
├── documents/                  # Additional enterprise document drop folder
├── evaluation/
│   ├── decision_evaluator.py   # 10-dimension decision & routing evaluation engine
│   ├── decision_test_cases.json# 15 comprehensive benchmark test cases
│   ├── run_eval.py             # Automated benchmark execution runner
│   ├── retrieval_eval.py       # Hit Rate@K, MRR, Precision, Recall metrics
│   ├── generation_eval.py      # Grounding faithfulness & relevance evaluation
│   └── latency_tracker.py      # Granular execution stage profiling
├── frontend/                   # Modern React 19 + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # Chat workspace, input bar, and structured MessageItem
│   │   │   ├── debug/          # Pipeline trace inspector and deep execution tester
│   │   │   ├── evaluations/    # 5×5 Decision Confusion Matrix & benchmark dashboard
│   │   │   ├── settings/       # System configuration & Google Drive integration panel
│   │   │   ├── sources/        # Source preview drawer & document modal
│   │   │   └── layout/         # AppShell, responsive sidebar, navigation header
│   │   └── types/index.ts      # TypeScript contract definitions
│   ├── dist/                   # Production bundled frontend assets
│   └── package.json            # Node.js frontend dependencies
├── pipeline/                   # Modular Agentic RAG Pipeline Modules
│   ├── 01_ingestion.py         # Step 1: Connectors for PDF, Word, HTML, Text, & PostgreSQL
│   ├── 02_preprocessing.py     # Step 2: Normalization, cleaning, and content hashing
│   ├── 03_chunking.py          # Step 3: Recursive boundary-aware chunking with overlap
│   ├── 04_embeddings_and_vector_db.py # Step 4: Dense embeddings & persistent vector store
│   ├── 05_bm25_index.py        # Step 5: Sparse BM25Okapi inverted index
│   ├── 06_hybrid_retrieval.py  # Step 6: Hybrid Search (RRF k=60) & Cross-Encoder reranker
│   ├── 07_llm_and_citations.py # Step 7: Citation-grounded generator & 10 enterprise rules
│   ├── 08_orchestrator.py      # Step 8: Full Agentic RAG orchestrator pipeline
│   ├── agent_router.py         # Query intent classifier & fallback router
│   ├── evidence_evaluator.py   # Observable evidence signals gate & conflict detector
│   ├── structured_contract.py  # Pydantic AgentResponseContract & automated repair
│   └── tools/                  # Registered Agent Tools
│       ├── calculator.py       # Safe AST mathematical operations evaluator
│       ├── google_drive.py     # Google Drive connector, sync pipeline & RBAC gate
│       └── web_search.py       # Authoritative web search tool with domain scoring
├── results/
│   ├── decision_benchmark.json # Latest decision quality benchmark results
│   └── retrieval_benchmark.json# Retrieval quality evaluation metrics
├── tests/
│   ├── test_agent_decision.py  # Unit tests for router, calculator AST, Drive RBAC, contracts
│   ├── test_preprocessing.py   # Unit tests for text cleaning and normalization
│   ├── test_chunking.py        # Unit tests for recursive chunking
│   └── test_retrieval.py       # Unit tests for vector and BM25 retrieval
├── main.py                     # Command-line interface
├── requirements.txt            # Python dependencies
└── README.md                   # System documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ (Recommended: Python 3.11)
- Node.js 18+ and npm (for frontend modifications)

### 2. Activate Virtual Environment & Install Dependencies

From PowerShell:

```powershell
cd D:\Agentic-RAG
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Build Frontend Production Assets

The frontend is built with React 19, TypeScript, and Vite:

```powershell
cd D:\Agentic-RAG\frontend
npm install
npm run build
cd ..
```

The compiled assets are placed in `frontend/dist/` and served directly by the backend Flask server.

### 4. Start the Application Server

```powershell
python app.py
```

Open your browser and navigate to:
**`http://localhost:5000`**

---

## 🌐 REST API Endpoints

The backend exposes clean REST endpoints communicating via structured contracts:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/query` | Executes an agentic query and returns a typed `AgentResponseContract`. |
| `GET` | `/api/integrations/google-drive/status` | Reports Google Drive connection status, account, sync state, and doc counts. |
| `POST` | `/api/integrations/google-drive/connect` | Connects Google Drive workspace via backend Service Account credentials. |
| `POST` | `/api/integrations/google-drive/disconnect` | Disconnects workspace and invalidates active session. |
| `GET` | `/api/integrations/google-drive/sources` | Lists discoverable My Drive, Shared Drives, and folders. |
| `POST` | `/api/integrations/google-drive/sources` | Updates active folder and shared drive selection scope. |
| `POST` | `/api/integrations/google-drive/sync` | Executes incremental sync with checksum change detection. |
| `POST` | `/api/evaluations/run` | Triggers the 15-case Decision Quality Benchmark Suite. |
| `GET` | `/api/evaluations/latest` | Returns latest benchmark evaluation report and confusion matrix. |
| `POST` | `/api/trace/query` | Executes query and returns step-by-step technical pipeline trace. |
| `GET` | `/api/tools` | Lists registered agent tools and operational latency metrics. |
| `POST` | `/api/tools/<id>/toggle` | Enables or disables an agent tool. |
| `GET` | `/api/health` | System health check and model provider status. |

### Sample Query Request & Response Contract

```json
// POST /api/query
{
  "question": "What is the notice period during probation at OrionSoft?",
  "user_role": "employee"
}
```

```json
// Response (AgentResponseContract)
{
  "status": "answered",
  "decision": "google_drive",
  "evidence_state": "sufficient",
  "confidence_label": "Answer based on company Google Drive",
  "confidence_score": 0.95,
  "answer": "According to the OrionSoft Employee Handbook in Google Drive, the notice period during the 3-month probation period is strictly 15 calendar days. Post-confirmation, regular full-time employees are required to serve a 60-day notice period.",
  "sources": [
    {
      "type": "google_drive",
      "document_id": "gdrive-hr-001",
      "title": "OrionSoft_Employee_Handbook_and_Notice_Period_2026.gdoc",
      "section": "Notice Period Policy",
      "snippet": "During the 3-month probation period, the employee notice period is strictly 15 calendar days. Post-confirmation, regular full-time employees are required to serve a 60-day notice period.",
      "score": 0.94
    }
  ],
  "tools_used": ["google_drive"],
  "execution_trace": [
    { "stage": "intent_routing", "status": "completed", "latency_ms": 1.2, "details": "Routed to Google Drive" },
    { "stage": "google_drive_search", "status": "completed", "latency_ms": 14.5, "details": "Live Drive search matched 1 record" },
    { "stage": "evidence_evaluation", "status": "completed", "latency_ms": 2.1, "details": "Evidence state: sufficient" },
    { "stage": "schema_validation", "status": "completed", "latency_ms": 0.8, "details": "Validated against AgentResponseContract" }
  ],
  "latency_ms": 128.4
}
```

---

## 📊 Decision-Quality Evaluation Benchmark

The system includes an automated 10-dimension evaluation benchmark tested across adversarial scenarios:

```powershell
python evaluation/run_eval.py
```

### Benchmark Summary Results

| Metric | Score | Target | Description |
| :--- | :---: | :---: | :--- |
| **Overall Pass Rate** | **100.0%** (15/15) | $\ge 90\%$ | All quality checks passed |
| **Route Accuracy** | **100.0%** | $\ge 95\%$ | Multi-class routing accuracy |
| **Tool-Selection Accuracy** | **100.0%** | $\ge 95\%$ | Correct tool invocation |
| **Unnecessary-Tool Rate** | **0.0%** | $\le 5\%$ | Avoids unnecessary tool calls |
| **Answerability Accuracy** | **100.0%** | $\ge 90\%$ | Evidence sufficiency evaluation |
| **Abstention Correctness** | **100.0%** | $100\%$ | Refuses ungrounded questions without hallucination |
| **Calculation Accuracy** | **100.0%** | $100\%$ | Safe AST mathematical evaluations |
| **Structured Output Validity**| **100.0%** | $100\%$ | Pydantic schema contract compliance |
| **Average Latency** | **574.7 ms** | $\le 1500\text{ ms}$ | Full end-to-end execution |

### 5×5 Decision Confusion Matrix

```text
Expected \ Actual  │ internal_rag │ google_drive │ web_search │ calculator │ abstain
───────────────────┼──────────────┼──────────────┼────────────┼────────────┼────────
internal_rag       │      4       │      0       │     0      │     0      │    0
google_drive       │      0       │      1       │     0      │     0      │    0
web_search         │      0       │      0       │     2      │     0      │    0
calculator         │      0       │      0       │     0      │     4      │    0
abstain            │      0       │      0       │     0      │     0      │    4
```

*Perfect diagonal classification across all 5 routes with 0 off-diagonal routing errors and 0 confidential data leaks.*

---

## 🧪 Running Unit & Integration Tests

Execute the complete pytest suite:

```powershell
python -m pytest tests/ -v
```

```text
============================= test session starts =============================
tests/test_agent_decision.py::test_safe_calculator_basic_and_percentage PASSED
tests/test_agent_decision.py::test_safe_calculator_security_sandbox PASSED
tests/test_agent_decision.py::test_google_drive_connector_and_rbac PASSED
tests/test_agent_decision.py::test_evidence_evaluator_signals PASSED
tests/test_agent_decision.py::test_agent_router_anti_exfiltration PASSED
tests/test_agent_decision.py::test_structured_contract_validation_and_repair PASSED
tests/test_chunking.py::test_recursive_chunker_basic PASSED
tests/test_chunking.py::test_chunk_overlap PASSED
tests/test_preprocessing.py::test_unicode_normalization PASSED
tests/test_preprocessing.py::test_html_tag_stripping PASSED
tests/test_preprocessing.py::test_document_hashing PASSED
tests/test_retrieval.py::test_bm25_index_basic PASSED
tests/test_retrieval.py::test_reciprocal_rank_fusion PASSED
tests/test_retrieval.py::test_vector_store_cosine_similarity PASSED
============================= 14 passed in 0.63s ==============================
```

---

## 🖥️ Frontend Features

The web interface provides specialized perspectives for employees and AI engineers:

1. **Intelligent Chat Workspace**:
   - Live query streaming and real-time execution telemetry.
   - Calibrated route and evidence badges (`[Internal RAG]`, `[Google Drive]`, `[Safe Calculator]`, `[Web Search]`, `[Abstained]`).
   - Categorized collapsible sources:
     - 🏢 **Company Documents**: Internal handbooks and policy manuals.
     - 📁 **Google Drive Workspace**: Connected Drive files with RBAC tags.
     - 🌐 **External Web Sources**: Official documentation citations with authority badges and links.
   - Slide-out **Source Preview Drawer** for verbatim passage inspection.
2. **Google Drive Integration Panel** (`Settings → Integrations`):
   - Connection status indicator (`Connected` vs `Disconnected`).
   - Live account metadata, last sync timestamp, and indexed document counters.
   - **Sync Now** trigger for incremental checksum change detection.
   - **Manage Sources Modal** for toggling My Drive, authorized Shared Drives, and folder paths.
3. **Decision-Quality Evaluation View**:
   - Interactive **5×5 Decision Confusion Matrix Visualizer**.
   - 10-dimension metric summary cards.
   - Searchable and category-filterable benchmark cases.
   - Case inspection modal displaying expected vs actual routing, tools called, evidence signals, and failure diagnostics.
4. **Pipeline Debug Trace Inspector**:
   - Real-time technical execution tracer connected to `/api/trace/query`.
   - Stage-by-stage latency, input summaries, output artifacts, and architectural rationales.

---

## 🔒 Security, Privacy & Grounding Guarantees

- **Zero Client-Side Secrets**: Service Account keys, OAuth secrets, and API credentials are kept exclusively on the server.
- **Anti-Exfiltration Protocol**: Confidential enterprise policies, leave rules, and internal documents are prevented from leaking into external search queries.
- **Strict AST Sandbox**: Mathematical calculations are executed through Abstract Syntax Tree traversal without `eval()` or `exec()`.
- **Role-Based Access Control**: Live Drive search checks user roles (`employee`, `admin`, `engineering`) against document access rules before exposing chunks.
- **Rule 6 Negative Abstention**: When knowledge is absent from internal and authorized sources, the system explicitly refuses to hallucinate, responding with a transparent abstention notice.
