#!/usr/bin/env python3
"""Extract the ASD-STE100 Issue 9 Part 2 Dictionary into local JSON.

Reads references/ASD-STE100 (Issue 9).pdf via PyMuPDF and writes
references/issue9-dictionary.json inside this skill directory.
For local operator use only; do not redistribute ASD-STE100 copyrighted text.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import pymupdf

DEFAULT_PDF = Path(__file__).resolve().parent.parent / "references" / "ASD-STE100 (Issue 9).pdf"
DEFAULT_OUT = Path(__file__).resolve().parent.parent / "references" / "issue9-dictionary.json"

POS_INNER = (
    r"n|v|adj|adv|prep|conj|pron|art|det|num|phr|prefix|suffix|symb|TN|"
    r"n/v|adj/adv|prep/conj|v/n|adj/n|adv/prep"
)
POS_RE = re.compile(rf"\(({POS_INNER})\)", re.I)
HEADWORD_RE = re.compile(
    rf"^([A-Za-z0-9][A-Za-z0-9'./-]*(?:\s+(?:[A-Za-z0-9'./-]+|\([^)]+\)))*?)\s*"
    rf"\(({POS_INNER})\)\s*(.*)$",
    re.I,
)
ALT_UPPER_RE = re.compile(
    r"\b([A-Z][A-Z0-9-]+(?:\s+[A-Z0-9-]+){0,3})\s*(?:\(([a-zA-Z/., ]+)\))?"
)


def _group_words_by_y(words: list[tuple], y_tol: float = 4.0) -> list[tuple[float, str]]:
    """Group PyMuPDF word tuples into sorted lines separated by vertical tolerance."""
    if not words:
        return []
    ordered = sorted(words, key=lambda w: (w[1], w[0]))
    lines: list[tuple[float, list[str]]] = []
    for w in ordered:
        if lines and abs(w[1] - lines[-1][0]) <= y_tol:
            lines[-1][1].append(w[4])
        else:
            lines.append((w[1], [w[4]]))
    return [(y, " ".join(toks)) for y, toks in lines]


def _extract_recurring_errors(doc: pymupdf.Document) -> list[dict[str, str]]:
    """Extract the Recurring Errors table (pages 2-0-17 and 2-0-18)."""
    rows: list[dict[str, str]] = []
    for pno in (144, 145):
        all_w = doc[pno].get_text("words")
        ste_hdr = [w for w in all_w if w[4] == "STE" and 100 <= w[1] <= 180]
        if not ste_hdr:
            continue
        ste_x = ste_hdr[0][0] - 4.0
        hdr_y = ste_hdr[0][1] + 4.0
        body = [w for w in all_w if hdr_y < w[1] <= 710]
        by_y: dict[int, list[tuple]] = {}
        for w in body:
            bucket = round(w[1] / 4.0)
            by_y.setdefault(bucket, []).append(w)
        for bucket in sorted(by_y):
            ws = sorted(by_y[bucket], key=lambda w: w[0])
            left = " ".join(w[4] for w in ws if w[0] < ste_x).strip()
            right = " ".join(w[4] for w in ws if w[0] >= ste_x).strip()
            if left and right:
                rows.append({"non_ste": left, "ste": right})
    return rows


def _extract_approved_verbs(doc: pymupdf.Document) -> list[str]:
    """Extract the Approved Verbs quick-reference table (page 2-0-19)."""
    all_w = doc[146].get_text("words")
    verbs: list[str] = []
    for w in all_w:
        if 115 <= w[1] <= 710:
            tok = w[4].strip()
            if tok.isupper() and len(tok) > 1 and tok not in {"X,", "Y,"}:
                # Combine two-word approved verbs printed on separate columns/words? Wait: on same line!
                verbs.append(tok)
    # Re-group by (column bucket, y) so "GO OFF", "MAKE SURE", "PUT ON", "COME ON" stay intact.
    cols: list[tuple[float, float]] = [(68, 170), (170, 265), (265, 360), (360, 455), (455, 560)]
    grouped: list[str] = []
    for x_min, x_max in cols:
        col_w = [w for w in all_w if 135 <= w[1] <= 710 and x_min <= w[0] < x_max]
        for _, line in _group_words_by_y(col_w, y_tol=3.0):
            txt = line.strip()
            if txt in {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                       "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X,", "Y, Z", "X, Y, Z"}:
                continue
            if txt and txt.replace("-", "").replace(" ", "").isupper():
                grouped.append(txt)
    return grouped


def _col0_bold_lines(page: pymupdf.Page, c1_x: float) -> list[tuple[float, float, str, str]]:
    """Collect Column 0 spans grouped into lines preserving font name."""
    d = page.get_text("dict")
    spans = []
    for b in d["blocks"]:
        if "lines" not in b:
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                if 85 <= s["bbox"][1] <= 710 and s["bbox"][0] < c1_x and s["text"].strip():
                    spans.append((s["bbox"][0], s["bbox"][1], s["font"], s["text"].strip()))
    spans.sort(key=lambda item: (item[1], item[0]))
    lines: list[list[Any]] = []
    for x0, y0, font, txt in spans:
        if lines and abs(y0 - lines[-1][1]) <= 3.0:
            lines[-1][3] += " " + txt
            if "Bold" in font:
                lines[-1][2] = font
        else:
            lines.append([x0, y0, font, txt])
    return [(item[0], item[1], item[2], item[3]) for item in lines]


def _extract_entries(doc: pymupdf.Document) -> list[dict[str, Any]]:
    """Extract all Part 2 dictionary entries across pages 148..end."""
    entries: list[dict[str, Any]] = []
    for pno in range(148, len(doc)):
        page = doc[pno]
        all_w = page.get_text("words")
        hdr = [w for w in all_w if w[1] < 85]
        if not any(w[4] == "Approved" for w in hdr):
            continue
        word_x = next(w[0] for w in hdr if w[4] == "Word")
        c1_x = next(w[0] for w in hdr if w[4] == "Approved") - 4.0
        c2_x = next(w[0] for w in hdr if w[4] == "STE") - 4.0
        c3_x = next(w[0] for w in hdr if w[4] == "Non-STE") - 4.0

        col0 = _col0_bold_lines(page, c1_x)
        # Words in columns 1..3 for matching y-position on expression-only headwords
        c1_words = [w for w in all_w if 85 <= w[1] <= 710 and c1_x <= w[0] < c2_x]

        starts: list[dict[str, Any]] = []
        i = 0
        prev_was_hw = False
        while i < len(col0):
            x0, y0, font, txt = col0[i]
            if "Bold" not in font or x0 > word_x + 5.0:
                if starts and not txt.startswith("("):
                    starts[-1]["notes"].append(txt)
                prev_was_hw = False
                i += 1
                continue
            if txt.lower() in {"continued", "(continued)"}:
                i += 1
                continue
            if txt.startswith("("):
                if starts:
                    starts[-1]["inflections"].append(txt)
                i += 1
                continue

            # Check if next line finishes a wrapped headword or multi-line expression
            nxt = col0[i + 1] if i + 1 < len(col0) and abs(col0[i + 1][1] - y0) < 18.0 else None
            combined = f"{txt} {nxt[3]}" if nxt and "Bold" in nxt[2] and not POS_RE.search(txt) else ""

            if POS_RE.search(txt):
                starts.append({"y": y0, "raw": txt, "inflections": [], "notes": []})
                prev_was_hw = True
                i += 1
                continue

            if combined and POS_RE.search(combined) and (
                nxt[3].startswith("(") or "process of" in nxt[3] or nxt[3].endswith(")")
            ):
                starts.append({"y": y0, "raw": combined, "inflections": [], "notes": []})
                prev_was_hw = True
                i += 2
                continue

            # Inflection lines directly under a previous headword vs standalone expression ("such as", "FOR EXAMPLE")
            gap = y0 - col0[i - 1][1] if i > 0 else 99.0
            has_c1_at_row = any(abs(w[1] - y0) <= 4.0 for w in c1_words)
            if has_c1_at_row and (gap > 20.0 or not prev_was_hw):
                starts.append({"y": y0, "raw": txt, "inflections": [], "notes": []})
                prev_was_hw = True
            elif starts:
                starts[-1]["inflections"].append(txt.rstrip(","))
            i += 1

        body_words = [w for w in all_w if 85 <= w[1] <= 710]
        for idx, st in enumerate(starts):
            y_min = st["y"] - 5.0
            y_max = starts[idx + 1]["y"] - 5.0 if idx + 1 < len(starts) else 712.0
            band = [w for w in body_words if y_min <= w[1] < y_max]
            c1 = " ".join(line for _, line in _group_words_by_y([w for w in band if c1_x <= w[0] < c2_x]))
            c2 = " ".join(line for _, line in _group_words_by_y([w for w in band if c2_x <= w[0] < c3_x]))
            c3 = " ".join(line for _, line in _group_words_by_y([w for w in band if w[0] >= c3_x]))

            raw = st["raw"].strip()
            m = HEADWORD_RE.match(raw)
            if m:
                word = m.group(1).strip()
                pos = m.group(2).strip()
                tail = m.group(3).strip(" ,")
                if tail:
                    st["inflections"].insert(0, tail)
            else:
                word = raw.rstrip(",")
                pos = "phr"

            # Clean inflections like "(WIDER,", "WIDEST)" and preserve line-separated tokens
            inflections_raw = ", ".join(st["inflections"]).replace("(", "").replace(")", "")
            inflections = [tok.strip(" ,") for tok in inflections_raw.split(",") if tok.strip(" ,")]

            approved = word.isupper()
            entry: dict[str, Any] = {
                "word": word,
                "key": word.lower(),
                "pos": pos,
                "approved": approved,
                "page": pno + 1,
                "inflections": inflections,
                "meaning_or_alternatives": c1,
                "ste_example": c2,
                "non_ste_example": c3,
            }
            if st["notes"]:
                entry["notes"] = " ".join(st["notes"])
            entries.append(entry)
    return entries


def build_dictionary(pdf_path: Path, out_path: Path) -> dict[str, Any]:
    """Build full structured JSON from the local Issue 9 PDF."""
    if not pdf_path.exists():
        raise FileNotFoundError(f"ASD-STE100 Issue 9 PDF not found at {pdf_path}")
    doc = pymupdf.open(str(pdf_path))
    recurring = _extract_recurring_errors(doc)
    approved_verbs = _extract_approved_verbs(doc)
    entries = _extract_entries(doc)

    approved_count = sum(1 for e in entries if e["approved"])
    unapproved_count = len(entries) - approved_count

    payload = {
        "source": "ASD-STE100 Issue 9 (2025-01-15)",
        "stats": {
            "total_entries": len(entries),
            "approved_entries": approved_count,
            "unapproved_entries": unapproved_count,
            "approved_verbs_ref": len(approved_verbs),
            "recurring_errors": len(recurring),
        },
        "recurring_errors": recurring,
        "approved_verbs": approved_verbs,
        "entries": entries,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Build local Issue 9 JSON dictionary from PDF.")
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF, help="Path to ASD-STE100 Issue 9 PDF")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Output JSON path")
    args = parser.parse_args()
    payload = build_dictionary(args.pdf, args.out)
    print(f"Wrote {args.out}: {json.dumps(payload['stats'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
