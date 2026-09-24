import os
import sys
import json
import time
import uuid
import logging
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime, timezone
from threading import Lock
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

# Setup project root and ensure UTF-8 encoding on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config import load_config
from pipeline import RAGPipeline, IngestionPipeline
from evaluation.run_eval import run_decision_evaluation

# ── Logging ──────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

# ── Flask App ────────────────────────────────────────────
app = Flask(__name__, static_folder="frontend/dist", static_url_path="")

# ── Load RAG Pipeline (once at startup) ──────────────────
config = load_config()
rag = RAGPipeline(config, project_root=PROJECT_ROOT)
logger.info("Agentic RAG Pipeline initialized and ready for queries.")

# ── API Key Security ─────────────────────────────────────
RAG_API_KEY = os.getenv("RAG_API_KEY", "").strip()

def check_auth():
    """
    Validate API key from incoming requests.
    Supports 'X-API-Key' header or 'Authorization: Bearer <key>'.
    Allows internal browser requests originating from the local web dashboard.
    """
    if not RAG_API_KEY:
        return False

    # 1. Check X-API-Key header
    client_key = request.headers.get("X-API-Key", "").strip()
    if client_key and client_key == RAG_API_KEY:
        return True

    # 2. Check Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization", "").strip()
    if auth_header.startswith("Bearer "):
        bearer_token = auth_header[7:].strip()
        if bearer_token == RAG_API_KEY:
            return True

    # 3. Allow internal calls from local browser web dashboard
    origin = request.headers.get("Origin") or request.headers.get("Referer") or ""
    host = request.host
    if host and (f"//{host}" in origin or host in origin):
        return True

    return False

def require_admin_key():
    """Strict API key check for admin-only endpoints (no origin bypass)."""
    if not RAG_API_KEY:
        return False
    client_key = request.headers.get("X-API-Key", "").strip()
    if client_key == RAG_API_KEY:
        return True
    auth_header = request.headers.get("Authorization", "").strip()
    if auth_header.startswith("Bearer ") and auth_header[7:].strip() == RAG_API_KEY:
        return True
    return False

# In-memory per-IP rate limiter for public endpoints
_public_rate_limits = defaultdict(list)
_leads_lock = Lock()
_conversations_lock = Lock()

def public_rate_limited(limit: int = 10, window: int = 60) -> bool:
    ip = request.remote_addr or "unknown"
    now = time.time()
    _public_rate_limits[ip] = [t for t in _public_rate_limits[ip] if now - t < window]
    if len(_public_rate_limits[ip]) >= limit:
        return True
    _public_rate_limits[ip].append(now)
    return False

# Registered tool definitions in memory
REGISTERED_TOOLS = [
    {
        "id": "tool-knowledge-search",
        "name": "Internal Knowledge Search",
        "code": "knowledge_search",
        "category": "Retrieval",
        "description": "Combines dense vectors and sparse BM25 with Reciprocal Rank Fusion (RRF) and Cross-Encoder reranking.",
        "enabled": True,
        "accessScope": "All Employees",
        "executions24h": 1420,
        "avgLatencyMs": 48,
        "status": "Online"
    },
    {
        "id": "tool-google-drive",
        "name": "Google Drive Knowledge Connector",
        "code": "google_drive",
        "category": "Integration",
        "description": "Securely discovers, incrementally synchronizes, and searches approved company Google Drive documents.",
        "enabled": True,
        "accessScope": "All Employees",
        "executions24h": 312,
        "avgLatencyMs": 62,
        "status": "Online"
    },
    {
        "id": "tool-calculator",
        "name": "Deterministic AST Calculator",
        "code": "calculator",
        "category": "Analysis",
        "description": "Safe AST-evaluated arithmetic, percentage reductions, and financial calculations with zero hallucination.",
        "enabled": True,
        "accessScope": "All Employees",
        "executions24h": 184,
        "avgLatencyMs": 4,
        "status": "Online"
    },
    {
        "id": "tool-web-search",
        "name": "Authoritative Web Search",
        "code": "web_search",
        "category": "Retrieval",
        "description": "Controlled fallback for public technical releases and external official documentation with domain authority gating.",
        "enabled": True,
        "accessScope": "Elevated Roles",
        "executions24h": 68,
        "avgLatencyMs": 195,
        "status": "Online"
    },
    {
        "id": "tool-database-query",
        "name": "Enterprise PostgreSQL Connector",
        "code": "sql_read_only_agent",
        "category": "Data",
        "description": "Executes parameterized read-only queries with SQL injection prevention and data masking.",
        "enabled": True,
        "accessScope": "Elevated Roles",
        "executions24h": 94,
        "avgLatencyMs": 56,
        "status": "Online"
    }
]

# ── Static UI Route ───────────────────────────────────────

@app.route("/")
def index():
    widget_index = PROJECT_ROOT / "frontend" / "dist" / "widget.html"
    if widget_index.exists():
        return send_from_directory("frontend/dist", "widget.html")
    return send_from_directory("static", "index.html")


@app.route("/admin")
def admin_index():
    dist_index = PROJECT_ROOT / "frontend" / "dist" / "index.html"
    if dist_index.exists():
        return send_from_directory("frontend/dist", "index.html")
    return send_from_directory("static", "index.html")


@app.route("/widget")
def widget():
    widget_index = PROJECT_ROOT / "frontend" / "dist" / "widget.html"
    if widget_index.exists():
        return send_from_directory("frontend/dist", "widget.html")
    return "Widget not built yet. Run 'npm run build' in frontend.", 404


# ── Public Prospect Endpoints ───────────────────────────

@app.route("/api/public/chat", methods=["POST"])
def public_chat():
    if public_rate_limited():
        return jsonify({"error": "Too many requests. Please try again later."}), 429

    data = request.get_json(force=True)
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty."}), 400

    try:
        resp = rag.query(question, user_role="employee", persona="prospect")
        return jsonify({
            "answer": resp.answer,
            "suggested_queries": resp.suggested_queries or []
        })
    except Exception as e:
        logger.error(f"Public chat failed: {e}", exc_info=True)
        return jsonify({"error": "Something went wrong. Please try again."}), 500


@app.route("/api/public/lead", methods=["POST"])
def public_lead():
    if public_rate_limited(limit=10, window=60):
        return jsonify({"error": "Too many requests."}), 429

    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Please provide valid contact details."}), 400

    def clean(field, limit=500):
        return str(data.get(field) or "").strip()[:limit]

    name = clean("name", 120)
    email = clean("email", 254).lower()
    phone = clean("phone", 40)
    company = clean("company", 200)

    if not name or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return jsonify({"error": "Please provide a valid name and work email."}), 400
    if len(re.sub(r"\D", "", phone)) < 7:
        return jsonify({"error": "Please provide a valid phone number."}), 400

    existing_lead_id = clean("lead_id", 64)
    lead_id = existing_lead_id or uuid.uuid4().hex
    conversation_id = clean("conversation_id", 64) or uuid.uuid4().hex

    leads_path = PROJECT_ROOT / "data" / "leads.json"
    now = datetime.now(timezone.utc).isoformat()

    with _leads_lock:
        leads = []
        if leads_path.exists():
            try:
                loaded = json.loads(leads_path.read_text(encoding="utf-8"))
                leads = loaded if isinstance(loaded, list) else []
            except (OSError, json.JSONDecodeError):
                logger.warning("Could not read existing lead data; starting a new lead list.")

        # Update an existing lead (e.g., handoff request) rather than duplicating it
        if existing_lead_id:
            for lead in leads:
                if lead.get("lead_id") == existing_lead_id:
                    lead["name"] = name
                    lead["email"] = email
                    lead["phone"] = phone
                    lead["company"] = company or lead.get("company", "")
                    lead["project_requirement"] = clean("project_requirement", 3000) or lead.get("project_requirement", "")
                    lead["conversation_summary"] = clean("conversation_summary", 5000) or lead.get("conversation_summary", "")
                    lead["requested_action"] = clean("requested_action", 200) or lead.get("requested_action", "Talk to an OrionSoft expert")
                    lead["intent_level"] = clean("intent_level", 40) or lead.get("intent_level", "medium")
                    lead["updated_at"] = now
                    leads_path.write_text(json.dumps(leads, indent=2, ensure_ascii=False), encoding="utf-8")
                    return jsonify({
                        "success": True,
                        "lead_id": existing_lead_id,
                        "conversation_id": lead.get("conversation_id", conversation_id)
                    })

        lead_record = {
            "lead_id": lead_id,
            "conversation_id": conversation_id,
            "name": name,
            "email": email,
            "phone": phone,
            "company": company,
            "industry": clean("industry", 200),
            "project_requirement": clean("project_requirement", 3000),
            "desired_solution": clean("desired_solution", 500),
            "existing_technology": clean("existing_technology", 1000),
            "timeline": clean("timeline", 120),
            "budget": clean("budget", 120),
            "intent_level": clean("intent_level", 40) or "medium",
            "conversation_summary": clean("conversation_summary", 5000),
            "requested_action": clean("requested_action", 200) or "Talk to an OrionSoft expert",
            "timestamp": now,
            "message": clean("project_requirement", 3000)
        }
        leads.append(lead_record)
        leads_path.write_text(json.dumps(leads, indent=2, ensure_ascii=False), encoding="utf-8")

    return jsonify({"success": True, "lead_id": lead_id, "conversation_id": conversation_id})


INTENT_SIGNALS = [
    "i want to build", "i want to automate", "i want to create", "i want to develop",
    "i want a", "we want to", "we need", "can you develop", "can you build",
    "can you integrate", "can you help us build", "can you help me build",
    "how much would", "how much does", "how much will",
    "we are looking for", "we're looking for", "we are looking to", "we're looking to",
    "i'm looking to", "i am looking to", "looking to build", "looking to automate",
    "we need this for", "can someone from your team", "i want a quote",
    "i'd like a consultation", "i would like a consultation", "get a quote",
    "talk to", "speak with", "contact me", "book a", "schedule a", "hire",
    "build me", "proposal", "estimate", "starting a project", "our company needs",
    "we are a company",
]

def detect_project_intent(question: str) -> str:
    """Lightweight high-intent signal detection for the public conversation."""
    q = question.lower()
    if any(sig in q for sig in INTENT_SIGNALS):
        return "high"
    return "normal"


def _persist_conversation(lead_id: str, conversation_id: str, name: str, question: str, answer: str) -> None:
    """Append a visitor/assistant exchange to the conversation store keyed by conversation_id."""
    if not conversation_id:
        return
    path = PROJECT_ROOT / "data" / "conversations.json"
    now = datetime.now(timezone.utc).isoformat()
    with _conversations_lock:
        store = {}
        if path.exists():
            try:
                loaded = json.loads(path.read_text(encoding="utf-8"))
                store = loaded if isinstance(loaded, dict) else {}
            except (OSError, json.JSONDecodeError):
                logger.warning("Could not read existing conversation data; starting fresh.")
        entry = store.get(conversation_id, {"lead_id": lead_id, "name": name, "messages": []})
        entry["lead_id"] = lead_id or entry.get("lead_id", "")
        entry["name"] = name or entry.get("name", "")
        entry["messages"].append({"role": "user", "content": question, "timestamp": now})
        entry["messages"].append({"role": "assistant", "content": answer, "timestamp": now})
        store[conversation_id] = entry
        path.write_text(json.dumps(store, indent=2, ensure_ascii=False), encoding="utf-8")


@app.route("/api/public/conversation", methods=["POST"])
def public_conversation():
    if public_rate_limited(limit=30, window=60):
        return jsonify({"error": "Too many requests. Please try again in a moment."}), 429

    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "Please enter a message."}), 400
    if len(question) > 2000:
        question = question[:2000]

    raw_history = data.get("history") or []
    history = []
    if isinstance(raw_history, list):
        for turn in raw_history:
            if isinstance(turn, dict) and turn.get("role") in ("user", "assistant"):
                history.append({
                    "role": turn.get("role"),
                    "content": (turn.get("content") or "")[:2000]
                })
    history = history[-12:]

    lead_id = str(data.get("lead_id") or "").strip()[:64]
    conversation_id = str(data.get("conversation_id") or "").strip()[:64]
    name = str(data.get("name") or "").strip()[:120]

    try:
        result = rag.conversational_query(question, history=history, visitor_name=name or None)
    except Exception as e:
        logger.error(f"Conversational query failed: {e}", exc_info=True)
        return jsonify({"error": "Something went wrong. Please try again."}), 500

    answer = result.get("answer") or ""
    suggestions = (result.get("suggested_questions") or [])[:4]
    intent = detect_project_intent(question)

    _persist_conversation(lead_id, conversation_id, name, question, answer)

    return jsonify({
        "answer": answer,
        "suggested_questions": suggestions,
        "intent": intent,
    })


@app.route("/api/public/intent", methods=["POST"])
def public_intent():
    """Record a high-intent handoff request against an existing lead."""
    if public_rate_limited(limit=10, window=60):
        return jsonify({"error": "Too many requests."}), 429

    data = request.get_json(silent=True) or {}
    lead_id = str(data.get("lead_id") or "").strip()[:64]
    conversation_id = str(data.get("conversation_id") or "").strip()[:64]
    summary = str(data.get("summary") or "").strip()[:5000]
    action = str(data.get("requested_action") or "Talk to an OrionSoft expert").strip()[:200]

    if not lead_id:
        return jsonify({"error": "Missing lead identifier."}), 400

    leads_path = PROJECT_ROOT / "data" / "leads.json"
    with _leads_lock:
        leads = []
        if leads_path.exists():
            try:
                loaded = json.loads(leads_path.read_text(encoding="utf-8"))
                leads = loaded if isinstance(loaded, list) else []
            except (OSError, json.JSONDecodeError):
                leads = []
        updated = False
        for lead in leads:
            if lead.get("lead_id") == lead_id:
                lead["intent_level"] = "high"
                lead["requested_action"] = action
                if summary:
                    lead["conversation_summary"] = summary
                if conversation_id:
                    lead["conversation_id"] = conversation_id
                lead["updated_at"] = datetime.now(timezone.utc).isoformat()
                updated = True
                break
        if updated:
            leads_path.write_text(json.dumps(leads, indent=2, ensure_ascii=False), encoding="utf-8")

    return jsonify({"success": True})


@app.route("/api/admin/leads", methods=["GET"])
def admin_leads():
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401

    leads_path = PROJECT_ROOT / "data" / "leads.json"
    if not leads_path.exists():
        return jsonify({"leads": []})
    try:
        return jsonify({"leads": json.loads(leads_path.read_text(encoding="utf-8"))})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Core Agentic Query Endpoint ──────────────────────────

@app.route("/api/query", methods=["POST"])
def api_query():
    """
    Handle a user query with agentic routing, evidence gating,
    tool execution, and strict structured output validation.
    Secured with API Key authentication for external integrations.
    """
    if not require_admin_key():
        return jsonify({
            "error": "Unauthorized: Missing or invalid API Key. Please include the 'X-API-Key' header in your request."
        }), 401

    data = request.get_json(force=True)
    question = data.get("question", "").strip()
    user_role = data.get("user_role", "employee")
    user_groups = data.get("user_groups", [])

    if not question:
        return jsonify({"error": "Question cannot be empty."}), 400

    try:
        response = rag.query(question, user_role=user_role, user_groups=user_groups)
        return jsonify(response.model_dump())
    except Exception as e:
        logger.error(f"Query execution failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# ── Document Upload & Ingestion Endpoint ────────────────

SUPPORTED_UPLOAD_EXTENSIONS = {".txt", ".pdf", ".md", ".docx", ".html", ".htm"}

@app.route("/api/documents/upload", methods=["POST"])
def upload_document():
    """Accept document uploads, persist them, and re-index the knowledge base."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401

    if "file" not in request.files:
        return jsonify({"error": "No file part in request."}), 400

    files = request.files.getlist("file")
    if not files or all(f.filename == "" for f in files):
        return jsonify({"error": "No file selected."}), 400

    docs_dir = PROJECT_ROOT / "documents"
    docs_dir.mkdir(parents=True, exist_ok=True)

    uploaded = []
    for f in files:
        filename = secure_filename(f.filename)
        ext = Path(filename).suffix.lower()
        if ext not in SUPPORTED_UPLOAD_EXTENSIONS:
            return jsonify({
                "error": f"Unsupported file type '{ext}'. Supported: {', '.join(sorted(SUPPORTED_UPLOAD_EXTENSIONS))}"
            }), 400
        f.save(str(docs_dir / filename))
        uploaded.append(filename)

    try:
        pipeline = IngestionPipeline(config, project_root=PROJECT_ROOT)
        summary = pipeline.run()
    except Exception as e:
        logger.error(f"Ingestion after upload failed: {e}", exc_info=True)
        return jsonify({"error": f"File saved but indexing failed: {e}"}), 500

    global rag
    rag = RAGPipeline(config, project_root=PROJECT_ROOT)

    return jsonify({
        "success": True,
        "uploaded": uploaded,
        "total_documents": summary.total_documents,
        "total_chunks": summary.total_chunks
    })

# ── Google Drive Integration Endpoints ───────────────────

@app.route("/api/integrations/google-drive/status", methods=["GET"])
def gdrive_status():
    """Get high-level Google Drive connection and sync status."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    return jsonify(rag.google_drive.get_status())


@app.route("/api/integrations/google-drive/connect", methods=["POST"])
def gdrive_connect():
    """Connect company Google Drive workspace."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    data = request.get_json(silent=True) or {}
    account = data.get("account", "admin@orionsofttechnologies.com")
    workspace = data.get("workspace", "OrionSoft Corporate Drive")
    status = rag.google_drive.connect(account=account, workspace=workspace)
    return jsonify(status)


@app.route("/api/integrations/google-drive/disconnect", methods=["POST"])
def gdrive_disconnect():
    """Disconnect company Google Drive workspace."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    status = rag.google_drive.disconnect()
    return jsonify(status)


@app.route("/api/integrations/google-drive/sources", methods=["GET", "POST"])
def gdrive_sources():
    """Inspect or update explicit source folder/file selection."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    if request.method == "POST":
        data = request.get_json(force=True)
        selected = data.get("selected_sources", {})
        status = rag.google_drive.update_sources(selected)
        return jsonify(status)
    else:
        return jsonify(rag.google_drive.get_available_sources())


@app.route("/api/integrations/google-drive/sync", methods=["POST"])
def gdrive_sync():
    """Trigger incremental sync pipeline for connected Drive documents."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    try:
        summary = rag.google_drive.sync_now()
        from dataclasses import asdict
        return jsonify(asdict(summary))
    except Exception as e:
        return jsonify({"error": str(e), "status": "Failed"}), 500


# ── Agents & Tools Hub Endpoints ─────────────────────────

@app.route("/api/tools", methods=["GET"])
def list_tools():
    """List registered agent tools and operational metrics."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    return jsonify(REGISTERED_TOOLS)


@app.route("/api/tools/<tool_id>/toggle", methods=["POST"])
def toggle_tool(tool_id):
    """Enable or disable an agent tool."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    for t in REGISTERED_TOOLS:
        if t["id"] == tool_id:
            t["enabled"] = not t["enabled"]
            return jsonify({"success": True, "tool": t})
    return jsonify({"error": f"Tool '{tool_id}' not found."}), 404


# ── Decision-Quality Evaluation Endpoints ────────────────

@app.route("/api/evaluations/run", methods=["POST"])
def run_eval():
    """Execute the automated decision-quality benchmark suite."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    try:
        report = run_decision_evaluation()
        return jsonify(report)
    except Exception as e:
        logger.error(f"Evaluation failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route("/api/evaluations/latest", methods=["GET"])
def get_latest_eval():
    """Retrieve the latest benchmark evaluation results and confusion matrix."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    report_path = PROJECT_ROOT / "results" / "decision_benchmark.json"
    if report_path.exists():
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                return jsonify(json.load(f))
        except Exception as e:
            return jsonify({"error": f"Error reading report: {e}"}), 500

    # If decision_benchmark doesn't exist yet, run it
    report = run_decision_evaluation()
    return jsonify(report)


# ── Pipeline Deep Trace Inspector Endpoint ───────────────

@app.route("/api/trace/query", methods=["POST"])
def trace_query():
    """Execute query and return step-by-step technical execution trace."""
    if not require_admin_key():
        return jsonify({"error": "Unauthorized: Missing or invalid API Key."}), 401
    data = request.get_json(force=True)
    question = data.get("question", "").strip()
    user_role = data.get("user_role", "employee")

    if not question:
        return jsonify({"error": "Question cannot be empty."}), 400

    resp = rag.query(question, user_role=user_role)
    return jsonify({
        "query": question,
        "decision": resp.decision.value,
        "evidence_state": resp.evidence_state.value,
        "tools_used": resp.tools_used,
        "confidence_label": resp.confidence_label,
        "confidence_score": resp.confidence_score,
        "latency_ms": resp.latency_ms,
        "execution_trace": [t.model_dump() for t in resp.execution_trace],
        "evidence_signals": resp.evidence_signals.model_dump() if resp.evidence_signals else None,
        "sources": [s.model_dump() for s in resp.sources],
        "answer": resp.answer
    })


# ── System Health & Auth Status ──────────────────────────

@app.route("/api/auth/status", methods=["GET"])
def auth_status():
    """Check API key authentication status and instructions."""
    return jsonify({
        "auth_required": bool(RAG_API_KEY),
        "header_name": "X-API-Key",
        "configuration_status": "configured" if RAG_API_KEY else "missing",
        "is_authenticated": check_auth()
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "provider": config.get("models", {}).get("llm", {}).get("provider", "unknown"),
        "google_drive_connected": rag.google_drive.state.get("connected", False),
        "api_key_secured": bool(RAG_API_KEY)
    })



if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    print(f"  Open http://localhost:{port} in your browser")
    app.run(host="0.0.0.0", port=port, debug=True)
