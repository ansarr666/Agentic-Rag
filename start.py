"""Production entrypoint: launch gunicorn on $PORT (default 5000).

Workers and threads can be tuned with WEB_CONCURRENCY and GUNICORN_THREADS.
Each worker loads its own copy of the embedding and reranker models (~0.5 GB each).
"""

import os


def main() -> None:
    port = os.getenv("PORT", "5000")
    workers = os.getenv("WEB_CONCURRENCY", "2")
    threads = os.getenv("GUNICORN_THREADS", "4")

    print(f"Starting Agentic RAG: http://localhost:{port} "
          f"(bind 0.0.0.0:{port}, workers={workers}, threads={threads}, timeout=120s)", flush=True)

    # Replace this process so gunicorn receives container stop signals directly.
    # No gunicorn access log: app.py logs each API request as JSON with latency_ms.
    os.execvp("gunicorn", [
        "gunicorn",
        "--bind", f"0.0.0.0:{port}",
        "--workers", workers,
        "--threads", threads,
        "--timeout", "120",
        "app:app",
    ])


if __name__ == "__main__":
    main()
