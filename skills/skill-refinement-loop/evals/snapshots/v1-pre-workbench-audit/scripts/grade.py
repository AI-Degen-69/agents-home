#!/usr/bin/env python3
"""
Minimal eval-grade helper for the skill-refinement-loop.

Reads an agentskills.io-style evals.json and a folder of grading.json files,
and prints a compact pass/fail table. Deterministic-check territory only — this
is the "deterministic checks first" step. LLM-as-judge judgments belong in
grading.json under a separate key and are reported but not computed here.

Usage:
    python scripts/grade.py /path/to/evals.json /path/to/iteration-1/

The folder should contain one subfolder per eval case, each with a grading.json
that at minimum has:
    {
      "deterministic": { "passed": true/false, "failures": [...] },
      "behavioral":    { "passed": true/false, "failures": [...] },
      "judge":         { "passed": true/false, "notes": "..." }   # optional
    }
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def format_bool(b: bool) -> str:
    return "PASS" if b else "FAIL"


def main() -> None:
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <evals.json> <iteration-folder>")
        sys.exit(1)

    evals_path = Path(sys.argv[1])
    iteration_path = Path(sys.argv[2])

    evals = load_json(evals_path)
    eval_cases = evals.get("evals", [])

    rows: list[tuple[str, str, str, str, str]] = []
    total_deterministic_pass = 0
    total_behavioral_pass = 0
    total_judge_pass = 0
    judged = 0

    for case in eval_cases:
        case_id = case.get("id", "unknown")
        folder = iteration_path / case_id
        grading_path = folder / "grading.json"

        if not grading_path.exists():
            rows.append((case_id, "MISSING", "MISSING", "MISSING", "no grading.json"))
            continue

        grading = load_json(grading_path)
        deterministic = grading.get("deterministic", {})
        behavioral = grading.get("behavioral", {})
        judge = grading.get("judge")

        det_pass = deterministic.get("passed", False)
        beh_pass = behavioral.get("passed", False)
        det_failures = deterministic.get("failures", [])
        beh_failures = behavioral.get("failures", [])

        if det_pass:
            total_deterministic_pass += 1
        if beh_pass:
            total_behavioral_pass += 1

        judge_pass_str = "—"
        if isinstance(judge, dict):
            judged += 1
            judge_pass_str = format_bool(judge.get("passed", False))
            if judge.get("passed"):
                total_judge_pass += 1

        det_str = format_bool(det_pass)
        beh_str = format_bool(beh_pass)

        first_failure: str
        if det_failures:
            first_failure = det_failures[0]
        elif beh_failures:
            first_failure = beh_failures[0]
        else:
            first_failure = ""

        rows.append((case_id, det_str, beh_str, judge_pass_str, first_failure))

    print("\n== Eval grade summary ==")
    if eval_cases:
        print(f"skill: {evals.get('skill_name', '<unnamed>')}")
        print(f"cases: {len(eval_cases)}")
    print(f"{'case':<14} {'det':<6} {'beh':<6} {'judge':<6} first_failure")
    for row in rows:
        print(f"{row[0]:<14} {row[1]:<6} {row[2]:<6} {row[3]:<6} {row[4]}")

    n = len(eval_cases) or 1
    print("\n== Aggregate ==")
    print(f"deterministic pass rate: {total_deterministic_pass}/{n}")
    print(f"behavioral pass rate:    {total_behavioral_pass}/{n}")
    if judged:
        print(f"judge pass rate:         {total_judge_pass}/{judged}")
    print(
        "note: judge results are LLM-as-judge and should be treated as qualitative,"
    )
    print("      not as the primary pass signal. Deterministic checks come first.")


if __name__ == "__main__":
    main()
