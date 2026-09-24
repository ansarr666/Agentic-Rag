"""Latency, cost, and operational trace tracking for RAG pipelines."""

import time
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

@dataclass
class PipelineTrace:
    """Detailed timing and telemetry trace for a single RAG request."""
    query: str
    query_understanding_ms: float = 0.0
    retrieval_ms: float = 0.0
    reranking_ms: float = 0.0
    generation_ms: float = 0.0
    total_latency_ms: float = 0.0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    estimated_cost_usd: float = 0.0

class LatencyTracker:
    """Measures latency per stage and estimates token costs."""

    def __init__(self, cost_per_1k_prompt: float = 0.0015, cost_per_1k_completion: float = 0.002):
        self.cost_per_1k_prompt = cost_per_1k_prompt
        self.cost_per_1k_completion = cost_per_1k_completion
        self._checkpoints: Dict[str, float] = {}

    def start_stage(self, stage_name: str) -> None:
        """Mark start of a stage."""
        self._checkpoints[stage_name] = time.perf_counter()

    def end_stage(self, stage_name: str) -> float:
        """Mark end of a stage and return elapsed milliseconds."""
        start = self._checkpoints.get(stage_name, time.perf_counter())
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        return round(elapsed_ms, 2)

    def estimate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """Estimate query cost in USD."""
        cost = (prompt_tokens / 1000.0 * self.cost_per_1k_prompt) + \
               (completion_tokens / 1000.0 * self.cost_per_1k_completion)
        return round(cost, 6)
