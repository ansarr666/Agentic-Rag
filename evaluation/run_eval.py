"""Benchmark runner executing automated Decision-Quality, Retrieval, and Grounding evaluation."""

import sys
import json
import logging
from pathlib import Path
from dataclasses import asdict
from typing import Dict, Any, List

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config import load_config
from pipeline import RAGPipeline
from evaluation.retrieval_eval import RetrievalEvaluator
from evaluation.generation_eval import GenerationEvaluator
from evaluation.decision_evaluator import DecisionEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def run_decision_evaluation(config_path: str = "config/config.yaml") -> Dict[str, Any]:
    """Run decision-quality evaluation benchmark with confusion matrix."""
    config = load_config(config_path)
    root = Path(__file__).parent.parent.resolve()

    dataset_path = root / "evaluation" / "decision_test_cases.json"
    results_dir = root / config.get("paths", {}).get("results_dir", "results")
    results_dir.mkdir(parents=True, exist_ok=True)

    if not dataset_path.exists():
        logger.error(f"Decision test cases not found at {dataset_path}")
        return {}

    with open(dataset_path, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    rag = RAGPipeline(config, project_root=root)
    report = DecisionEvaluator.evaluate_suite(test_cases, rag)

    report_dict = {
        "timestamp": report.timestamp,
        "total_cases": report.total_cases,
        "passed_cases": report.passed_cases,
        "failed_cases": report.failed_cases,
        "overall_pass_rate": report.overall_pass_rate,
        "route_accuracy": report.route_accuracy,
        "tool_selection_accuracy": report.tool_selection_accuracy,
        "unnecessary_tool_rate": report.unnecessary_tool_rate,
        "answerability_accuracy": report.answerability_accuracy,
        "abstention_correctness": report.abstention_correctness,
        "structured_output_validity": report.structured_output_validity,
        "calculation_accuracy": report.calculation_accuracy,
        "avg_faithfulness": report.avg_faithfulness,
        "avg_latency_ms": report.avg_latency_ms,
        "confusion_matrix": report.confusion_matrix,
        "detailed_cases": [asdict(c) for c in report.detailed_cases]
    }

    benchmark_path = results_dir / "decision_benchmark.json"
    with open(benchmark_path, "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2)

    logger.info(f"Decision evaluation complete! Saved to {benchmark_path}")
    print("\n" + "="*60)
    print("        AGENTIC DECISION EVALUATION SUMMARY")
    print("="*60)
    print(f"Total Evaluation Cases      : {report.total_cases}")
    print(f"Overall Pass Rate           : {report.overall_pass_rate * 100:.1f}% ({report.passed_cases}/{report.total_cases})")
    print(f"Route Accuracy              : {report.route_accuracy * 100:.1f}%")
    print(f"Tool-Selection Accuracy     : {report.tool_selection_accuracy * 100:.1f}%")
    print(f"Unnecessary-Tool Rate       : {report.unnecessary_tool_rate * 100:.1f}%")
    print(f"Answerability Accuracy      : {report.answerability_accuracy * 100:.1f}%")
    print(f"Abstention Correctness      : {report.abstention_correctness * 100:.1f}%")
    print(f"Structured Output Validity  : {report.structured_output_validity * 100:.1f}%")
    print(f"Calculation Correctness     : {report.calculation_accuracy * 100:.1f}%")
    print(f"Average Grounded Faithfulness: {report.avg_faithfulness * 100:.1f}%")
    print(f"Average E2E Latency         : {report.avg_latency_ms:.1f} ms")
    print("\nDecision Confusion Matrix (Rows: Expected -> Cols: Actual):")
    routes = ["internal_rag", "google_drive", "web_search", "calculator", "abstain"]
    header = f"{'Expected':<14} | " + " | ".join([f"{r[:9]:<9}" for r in routes])
    print(header)
    print("-" * len(header))
    for exp in routes:
        row = f"{exp[:14]:<14} | "
        for act in routes:
            count = report.confusion_matrix.get(exp, {}).get(act, 0)
            row += f"{count:<9} | "
        print(row)
    print("="*60 + "\n")

    return report_dict

def run_evaluation(config_path: str = "config/config.yaml"):
    """Run both decision-quality and retrieval evaluations."""
    run_decision_evaluation(config_path)

if __name__ == "__main__":
    run_evaluation()
