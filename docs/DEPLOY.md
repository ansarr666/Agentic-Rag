# Deployment

The app ships as a single Docker image: Flask behind gunicorn, the prebuilt React frontend
(`frontend/dist/`), the search indices (`data/indices/`) and both ML models baked in.
No model downloads happen at startup.

## 1. Environment variables

Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

| Variable | Required | Used for |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** (with the default `gemini` provider) | LLM answers. Without it the built-in Grounded Generator answers instead. |
| `RAG_API_KEY` | **Yes in production** | Protects the internal API. **If empty, the API accepts unauthenticated requests.** |
| `PORT` | No (default `5000`) | Port gunicorn listens on. |
| `APP_VERSION` | No (default `1.0.0`) | Reported by `/api/health`. |
| `WEB_CONCURRENCY` | No (default `2`) | gunicorn workers. Each loads its own models (~0.5 GB RAM). |
| `GUNICORN_THREADS` | No (default `4`) | Threads per worker. |
| `GROQ_API_KEY` | Only if `models.llm.provider` is `groq` | Groq LLM. |
| `OPENAI_API_KEY` | Only if the provider is `openai` | OpenAI LLM / embeddings. |
| `DATABASE_URL` | Only for PostgreSQL ingestion | Optional document source. |
| `RATE_LIMIT_DEFAULT` | No (default `100/hour`) | Per-IP limit for every `/api/*` route (the health check is exempt). |
| `RATE_LIMIT_QUERY` | No (default `20/minute`) | Per-IP limit for `/api/query`. |
| `RATE_LIMIT_STORAGE_URI` | **Yes with >1 worker or >1 instance** | Default `memory://` counts per gunicorn worker, so 2 workers allow up to 2× the limit. Use a shared store, e.g. `redis://host:6379`. |
| `TRUSTED_PROXY_COUNT` | **Yes behind a load balancer** (usually `1`) | Trust `X-Forwarded-For` from that many proxies. Without it, every client shares the proxy's IP and its rate limit. |
| `ALLOWED_ORIGINS` | No | Comma-separated origins allowed to call `/api/*` cross-origin. Unset = same-origin only. The chat widget runs in an iframe from this server, so it does not need this. |
| `SENTRY_DSN` | No | Enables Sentry error reporting. Unset = skipped. |
| `SENTRY_TRACES_SAMPLE_RATE` | No (default `0`) | Sentry performance tracing sample rate. |
| `FLASK_ENV` | No (default `production`) | Reported to Sentry as the environment. |
| `SECRET_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `DRIVE_FOLDER_ID` | Not yet | Reserved; no code reads these yet. |

Logs are JSON, one object per line on stdout, with `timestamp`, `level`, `request_id`,
`endpoint`, `method`, `status` and `latency_ms` for each API request. Every response carries an
`X-Request-ID` header; server errors return only `{"error": "Internal server error.", "request_id": ...}`
and the full traceback goes to the logs (and Sentry, if enabled).

## 2. Build

```bash
docker build -t agentic-rag .
```

The image is about 1.75 GB (CPU-only PyTorch).

## 3. Run

```bash
docker run -p 5000:5000 --env-file .env agentic-rag
```

The container runs as a non-root user and starts gunicorn through `start.py`
(2 workers × 4 threads, 120 s timeout). The app is ready once the log shows
`Agentic RAG Pipeline initialized and ready for queries.` (about 10–20 s).

> **Podman on Windows (WSL):** if `localhost:5000` does not respond, publish on the loopback
> address instead: `-p 127.0.0.1:5000:5000`.

### Persistent data

The app writes leads, conversations, the SQLite database, uploaded documents and rebuilt
indices under `/app/data`, `/app/documents` and `/app/results`. These are lost when the
container is removed unless you mount volumes, e.g. `-v ./data:/app/data`. A mounted
`data/` replaces the one in the image, so it must contain `data/indices/`, and it must be
writable by uid `10001`.

## 4. Health check

```
http://localhost:5000/api/health
```

Returns HTTP 200:

```json
{"status": "ok", "version": "1.0.0", "uptime_s": 42, "provider": "gemini",
 "google_drive_connected": true, "api_key_secured": true}
```

The image also defines a Docker `HEALTHCHECK` against this endpoint (every 30 s, 90 s start period).
