Agentic RAG Platform — Engineering Handoff
Owner: Engineering Team
Status: Production-Ready
Stack: Python 3.11 / Flask · React 19 / TypeScript / Vite
Last Updated: 2026-09-24

1. What This Is
An enterprise-grade Agentic RAG platform that answers user queries by autonomously routing across four evidence sources — internal knowledge (hybrid dense + sparse retrieval), Google Drive workspaces, a sandboxed AST calculator, and authoritative web search — with strict anti-exfiltration, RBAC, and observable evidence gating.

Design principles: Zero client-side secrets · Deterministic over probabilistic where possible · Transparent confidence labels over fake percentages · Negative abstention over hallucination.

2. Decision Flow (One Diagram)
text
Query → Intent Router → Evidence Retrieval → Evidence Evaluation
                                                    │
                                    ┌───────────────┴───────────────┐
                                 SUFFICIENT                     INSUFFICIENT
                                    │                               │
                          Grounded Synthesis              Fallback Selection
                          (Citation-bound)         ┌──────────┬─────────┬──────────┐
                                    │              │          │         │          │
                                    │          Calculator  Drive    Web Search  Abstain
                                    │              │          │         │          │
                                    └──────────────┴──────────┴─────────┴──────────┘
                                                    │
                                    Pydantic Contract Validation → Response
3. Core Components (Ownership Map)
Module	Responsibility	Key Entry Point
pipeline/agent_router.py	Intent classification + anti-exfiltration gate	Route resolution
pipeline/evidence_evaluator.py	Rerank logits, term coverage, conflict detection → SUFFICIENT / PARTIAL / INSUFFICIENT / CONFLICTING	evaluate()
pipeline/structured_contract.py	Pydantic AgentResponseContract + auto-repair	validate_or_repair_response()
pipeline/06_hybrid_retrieval.py	Dense (MiniLM-L6) + BM25Okapi fused via RRF (k=60), then cross-encoder rerank	hybrid_search()
pipeline/tools/calculator.py	AST-only evaluator (whitelist: Add Sub Mult Div Mod Pow). No eval/exec	safe_eval()
pipeline/tools/google_drive.py	OAuth/Service Account, MD5 checksum sync, ACL gating	sync(), check_access()
pipeline/tools/web_search.py	Domain-authority-ranked fallback	search()
pipeline/08_orchestrator.py	End-to-end pipeline composition	run_query()
app.py	Flask REST + static React host (port 5000)	—
4. Get Running (5 Minutes)
powershell
# 1. Backend
cd D:\Agentic-RAG
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 2. Frontend (only needed if modifying UI)
cd frontend && npm install && npm run build && cd ..

# 3. Serve
python app.py
# → http://localhost:5000
Config: config/config.yaml holds hyperparameters, model IDs, index paths, top-k values. Reload requires server restart.

5. API Surface (Contract-Bound)
Method	Endpoint	Purpose
POST	/api/query	Main agentic query → AgentResponseContract
POST	/api/trace/query	Same, returns full pipeline trace
GET	/api/integrations/google-drive/status	Connection + sync state
POST	/api/integrations/google-drive/{connect,disconnect,sync,sources}	Drive lifecycle
POST	/api/evaluations/run	Trigger 15-case benchmark
GET	/api/evaluations/latest	Latest report + confusion matrix
GET	/api/tools · POST /api/tools/<id>/toggle	Tool registry control
GET	/api/health	Liveness + model provider state
Request/response shape: see README §"Sample Query Request & Response Contract" — the AgentResponseContract is the single source of truth for all client integrations.

6. Verification Gates
Unit + integration (fast):

powershell
python -m pytest tests/ -v   # 14 tests, ~0.6s
Decision-quality benchmark (authoritative):

powershell
python evaluation/run_eval.py
Signal	Value	Gate
Overall pass rate	15/15	≥ 90%
Route accuracy	100%	≥ 95%
Unnecessary-tool rate	0%	≤ 5%
Abstention correctness	100%	= 100%
Structured output validity	100%	= 100%
Avg latency	~575 ms	≤ 1500 ms
Confusion matrix: perfect 5×5 diagonal across internal_rag · google_drive · web_search · calculator · abstain.

7. Security Guarantees (Do Not Regress)
No client-side secrets — Service Account keys, OAuth secrets stay server-side.

Anti-exfiltration — Internal topics (salaries, probation, budgets) never leak to web search, even under adversarial prompts.

AST sandbox — Arithmetic via whitelisted AST nodes only; __import__, open, lambda, os.system rejected pre-execution.

RBAC on Drive — Live ACL check per document; restricted board/exec records filtered by role.

Negative abstention (Rule 6) — No grounded source → explicit refusal, never hallucination.

Any PR touching calculator.py, google_drive.py, or agent_router.py requires review by two engineers.

8. Repository Layout (Condensed)
text
Agentic-RAG/
├── app.py                       # Flask server
├── main.py                      # CLI entry
├── config/config.yaml           # Hyperparameters
├── pipeline/                    # 8-step pipeline + tools/ + router + evaluator
│   ├── 01..08_*.py              # ingestion → orchestrator
│   └── tools/                   # calculator · google_drive · web_search
├── evaluation/                  # 15-case benchmark + confusion matrix
├── tests/                       # pytest suite
├── frontend/                    # React 19 + Vite (dist/ served by Flask)
├── data/{raw,processed,indices}/# Sources, chunks, vector + BM25 + Drive state
└── results/                     # Latest benchmark JSONs
9. Frontend Surfaces (React Dashboard)
Chat Workspace — streaming answers, route badges ([Internal RAG], [Google Drive], [Safe Calculator], [Web Search], [Abstained]), categorized collapsible sources, slide-out source preview.

Drive Integration Panel — status, last sync, doc count, "Sync Now", source scoping modal.

Evaluation View — interactive 5×5 confusion matrix + 10-metric cards + case inspector.

Debug Trace Inspector — per-stage latency, I/O, rationale.

10. Known Boundaries / Next Steps
Web search authority list is hardcoded in web_search.py — extend via config if needed.

Drive sync is incremental (MD5) but not realtime — webhook/push notification is the natural next step.

Benchmark suite covers 15 cases; expand with domain-specific adversarial cases per tenant before prod rollout.

Confidence labels are intentionally qualitative — do not surface numeric confidence_score to end users without calibration study.

11. On-Call Cheat Sheet
Symptom	First check
Query returns abstain unexpectedly	/api/trace/query → evidence_evaluation stage
Drive sources missing	/api/integrations/google-drive/status → last sync + ACL scope
Latency spike	results/latency_benchmark.json vs /api/tools per-tool metrics
Route misclassification	evaluation/run_eval.py → confusion matrix off-diagonal
Contract violation	Server logs from validate_or_repair_response()
