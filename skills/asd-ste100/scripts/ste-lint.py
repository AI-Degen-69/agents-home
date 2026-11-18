#!/usr/bin/env python3
"""Deterministic linter and Issue 9 dictionary lookup for ASD-STE100.

Structural checks are stdlib-only and enforce STE-Core clarity without
hurting technical depth or honest modality (may/might/could are never
flagged). Dictionary lookup and --strict-dict checks read the local
references/issue9-dictionary.json built from ASD-STE100 Issue 9.
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
import tempfile
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from typing import Any

DICT_PATH = Path(__file__).resolve().parent.parent / "references" / "issue9-dictionary.json"

IRREGULAR_PARTICIPLES = (
    "given|taken|made|done|found|seen|known|shown|written|built|sent|set|run|"
    "read|kept|held|left|put|cut|hit|let|shut|split|spread|begun|become|come|"
    "gone|got|gotten|lost|met|paid|said|sold|told|thought|brought|bought|"
    "caught|taught|won|worn|torn|born|drawn|grown|thrown|flown|driven|risen|"
    "chosen|broken|spoken|frozen|hidden|ridden|forgotten|fallen|eaten|beaten|"
    "understood|stood|struck|stuck|swung|hung|led|fed|bled|fled|sped|bound|"
    "wound|dug|spun|slid|bit|lit|quit|failed"
)
PASSIVE_PARTICIPLES = (
    "given|taken|made|done|found|seen|known|shown|written|built|sent|set|run|"
    "read|kept|held|left|put"
)

MODAL_PERFECT_PREFIX = re.compile(
    r"\b(?:(?:may|might|could|should|would|must|can|will|shall)(?:n['’]t)?|"
    r"cannot|can['’]t|won['’]t|shan['’]t)"
    r"(?:\s+(?:not|already|also|ever|even|just|never|still|very|well|\w+ly)){0,2}\s+$",
    re.I,
)

RULES: list[tuple[str, str, re.Pattern[str], str]] = [
    (
        "semicolon",
        "advisory-free",
        re.compile(r";"),
        "STE bans the semicolon (Rule 8.1). Split into separate sentences.",
    ),
    (
        "phrasal-verb",
        "advisory-free",
        re.compile(
            r"\b(?:spin(?:ning|s)? up|spun up|reach(?:ing|es|ed)? out|"
            r"div(?:e|es|ing|ed) into|dove into|kick(?:ing|s|ed)? off|"
            r"circl(?:e|es|ing|ed) back|touch(?:ing|es|ed)? base|"
            r"drill(?:ing|s|ed)? down|roll(?:ing|s|ed)? out|"
            r"flesh(?:ing|es|ed)? out|iron(?:ing|s|ed)? out)\b",
            re.I,
        ),
        "Soft phrasal verb. Use one plain verb (start, contact, read, begin, release, inspect).",
    ),
    (
        "marketing-adjective",
        "advisory-free",
        re.compile(
            r"\b(?:seamless(?:ly)?|robust(?:ly)?|cutting-edge|effortless(?:ly)?|"
            r"blazing[- ]fast|world-class|state-of-the-art|"
            r"game-chang(?:ing|er)|groundbreaking|revolutionary)\b",
            re.I,
        ),
        "Marketing adjective. Delete it or state the concrete measurement.",
    ),
    (
        "nominalization",
        "advisory-free",
        re.compile(
            r"\b(?:perform|performs|performed|conduct|conducts|conducted|"
            r"carry out|carries out|carried out|make|makes|made|"
            r"provide|provides|provided)\s+(?:a|an|the)\s+\w+"
            r"(?:tion|sion|ment|ance|ence|ysis)\b",
            re.I,
        ),
        "Nominalization (Rule 3.7). Use the action verb instead of verb + noun.",
    ),
    (
        "bloat-phrase",
        "advisory-free",
        re.compile(
            r"\b(?:in order to|prior to|subsequent to|in the event that|"
            r"due to the fact that|at this point in time|has the ability to|"
            r"have the ability to|is able to|are able to|a large number of|"
            r"utiliz(?:e|es|ed|ing)|leverag(?:e|es|ed|ing))\b",
            re.I,
        ),
        "Wordy phrase or filler verb. Replace with the plain word (to, before, after, if, because, now, can, many, use).",
    ),
    (
        "passive-voice",
        "advisory",
        re.compile(
            rf"\b(?:is|are|was|were|been|being)\s+(?:\w+ed|{PASSIVE_PARTICIPLES})\b"
            r"(?!\s+(?:to|for|by)\s+\w+ing)",
            re.I,
        ),
        "Possible passive voice. Name the actor and use an active verb unless the actor is unknown or irrelevant.",
    ),
    (
        "present-perfect",
        "advisory",
        re.compile(
            rf"\b(?:has|have|had)\s+(?:been\s+)?(?:\w+(?:ed|en)|{IRREGULAR_PARTICIPLES})\b",
            re.I,
        ),
        "Compound tense. Use simple past or present unless current relevance or modality requires it.",
    ),
]

SYNONYM_GROUPS: list[tuple[str, ...]] = [
    ("check", "verify", "confirm", "validate"),
    ("delete", "remove", "erase"),
    ("start", "launch", "begin", "initiate"),
    ("stop", "halt", "terminate"),
    ("show", "display"),
    ("use", "utilize", "employ"),
    ("fix", "repair", "correct"),
    ("send", "transmit"),
    ("get", "retrieve", "fetch", "obtain"),
    ("change", "modify", "alter"),
]

# Everyday software/CLI words kept exempt from --strict-dict warnings unless --aerospace is set.
SOFTWARE_WHITELIST: frozenset[str] = frozenset({
    "check", "checks", "checked", "test", "tests", "tested", "verify", "verified",
    "confirm", "confirmed", "validate", "validated", "build", "builds", "built",
    "run", "runs", "running", "deploy", "deployed", "debug", "lint", "linter",
    "commit", "committed", "push", "pushed", "pull", "pulled", "merge", "merged",
    "branch", "query", "parse", "parsed", "script", "scripts", "token", "tokens",
    "cache", "cached", "server", "client", "agent", "agents", "skill", "skills",
    "file", "files", "line", "lines", "code", "path", "paths", "flag", "flags",
    "command", "commands", "output", "error", "errors", "status", "config",
    "json", "markdown", "html", "cli", "api", "repo", "pr", "issue", "issues",
    "tool", "tools", "user", "users", "work", "works", "worked", "now",
})

CODE_FENCE = re.compile(r"^\s*(?:>\s*)*(`{3,}|~{3,})")
INLINE_CODE = re.compile(r"`[^`\n]+`")
MD_LINK_DEST = re.compile(r"(\[[^\]]*\]\()([^)\s]+(?:\s+\"[^\"]*\")?)(\))")
AUTOLINK = re.compile(r"<(?:https?|ftp)://[^>\s]+>|\bhttps?://\S+|\bwww\.\S+", re.I)
FILE_NAME = re.compile(
    r"(?<![\w./\\:-])[\w./\\:-]*[\w-]\."
    r"(?:py|md|ps1|sh|json|ya?ml|txt|html?|js|ts|tsx|css|pdf|png|svg|csv)\b"
)
WORD_CHAR = re.compile(r"[^\W_]")
ALPHA_WORD = re.compile(r"\b[A-Za-z][A-Za-z'-]*\b")
HEADING_OR_RULE = re.compile(r"^\s*(?:#{1,6}\s|[-*_]{3,}\s*$|\|(?:\s*:?-+:?\s*\|)+\s*$)")
BLOCKQUOTE_LIST_PREFIX = re.compile(r"^(?:\s*>\s*)*(?:\s*(?:[-*+]|\d{1,9}[.)])\s+)?")
LIST_ITEM_RE = re.compile(r"^(?P<indent> {0,3})(?P<marker>[-*+]|\d{1,9}[.)])(?P<gap>[ \t]+)(?P<body>.*)$")
CONJUNCTION_END = re.compile(r"\b(?:and|or)\s*$", re.I)
ABBREVIATIONS = {"vs.", "cf.", "approx.", "mr.", "mrs.", "ms.", "dr.", "fig.", "no.", "e.g.", "i.e."}
DOTTED_ABBR = re.compile(r"^(?:[A-Za-z]\.){2,}$")

RULE_IDS: set[str] = {r[0] for r in RULES} | {
    "long-sentence",
    "synonym-rotation",
    "dangling-conjunction",
    "unapproved-word",
}


def _word_re(base: str) -> re.Pattern[str]:
    return re.compile(rf"\b{re.escape(base)}(?:s|es|ed|d|ing)?\b", re.I)


def _blank_span(text: str, pattern: re.Pattern[str], group_idx: int = 0) -> str:
    """Replace regex matches with spaces of identical length to preserve columns."""
    def _repl(m: re.Match[str]) -> str:
        if group_idx:
            s, e = m.span(group_idx)
            rel_s = s - m.start()
            rel_e = e - m.start()
            g = m.group(0)
            return g[:rel_s] + (" " * (rel_e - rel_s)) + g[rel_e:]
        return " " * len(m.group(0))
    return pattern.sub(_repl, text)


def _mask_line_markup(raw: str) -> str:
    """Mask inline code spans, link destinations, URLs, and HTML comments while preserving indices."""
    masked = re.sub(r"<!--.*?-->", lambda m: " " * len(m.group(0)), raw)
    masked = _blank_span(masked, INLINE_CODE)
    masked = _blank_span(masked, MD_LINK_DEST, group_idx=2)
    masked = _blank_span(masked, AUTOLINK)
    return masked


def _strip_front_matter(lines: list[str]) -> tuple[int, list[tuple[int, str]]]:
    """Skip YAML front matter lines (blanked) while keeping 'description:' prose."""
    if not lines or lines[0].rstrip() != "---":
        return 0, []
    for end in range(1, len(lines)):
        if lines[end].rstrip() == "---":
            desc_lines: list[tuple[int, str]] = []
            for idx in range(1, end):
                m = re.match(r'^description\s*:\s*["\']?(.*?)["\']?\s*$', lines[idx].strip())
                if m and m.group(1) and m.group(1) not in ("|", ">", "|-", ">-"):
                    desc_lines.append((idx + 1, m.group(1)))
            return end + 1, desc_lines
    return 0, []


def _split_sentences(block_lines: list[tuple[int, int, str]]) -> list[tuple[int, int, int]]:
    """Return list of (start_line, start_col, word_count) for each sentence in a prose block."""
    tokens: list[tuple[int, int, str]] = []
    for lineno, col_offset, prose in block_lines:
        # Remove inline code completely when counting words (mirrors README word rule).
        no_code = INLINE_CODE.sub("", prose)
        for m in re.finditer(r"\S+", no_code):
            tokens.append((lineno, col_offset + m.start() + 1, m.group(0)))

    sentences: list[tuple[int, int, int]] = []
    cur_start: tuple[int, int] | None = None
    count = 0

    for idx, (lineno, col, tok) in enumerate(tokens):
        if cur_start is None:
            cur_start = (lineno, col)
        # Strip surrounding markdown markers and trailing brackets/quotes for word & end detection.
        cleaned = tok.strip("\"'“”‘’()[]*_~")
        if WORD_CHAR.search(cleaned):
            count += 1
        ends_sent = False
        stripped_end = tok.rstrip("\"'”’)]*_~")
        if stripped_end.endswith((".", "!", "?")):
            low = cleaned.lower()
            if low in ABBREVIATIONS:
                ends_sent = False
            elif DOTTED_ABBR.match(cleaned):
                nxt_tok = tokens[idx + 1][2].lstrip("\"'“‘([*_") if idx + 1 < len(tokens) else ""
                ends_sent = bool(nxt_tok and nxt_tok[0].isupper())
            elif re.fullmatch(r"\d+\.", cleaned):
                ends_sent = False
            else:
                ends_sent = True
        if ends_sent and cur_start is not None:
            if count > 0:
                sentences.append((cur_start[0], cur_start[1], count))
            cur_start = None
            count = 0

    if cur_start is not None and count > 0:
        sentences.append((cur_start[0], cur_start[1], count))
    return sentences


def _dangling_conjunctions(lines: list[str], start_idx: int, filename: str) -> list[dict[str, Any]]:
    """Detect Markdown list items whose final meaningful line ends in 'and' or 'or'."""
    findings: list[dict[str, Any]] = []
    fence_char: str | None = None
    fence_len = 0
    in_html_comment = False
    i = start_idx

    while i < len(lines):
        raw = lines[i]
        if in_html_comment:
            if "-->" in raw:
                in_html_comment = False
            i += 1
            continue
        if raw.lstrip().startswith("<!--") and "-->" not in raw:
            in_html_comment = True
            i += 1
            continue
        fm = CODE_FENCE.match(raw)
        if fm:
            run = fm.group(1)
            if fence_char is None:
                fence_char, fence_len = run[0], len(run)
            elif run[0] == fence_char and len(run) >= fence_len and not raw[fm.end():].strip():
                fence_char, fence_len = None, 0
            i += 1
            continue
        if fence_char is not None:
            i += 1
            continue

        m = LIST_ITEM_RE.match(raw)
        if not m:
            i += 1
            continue

        content_col = len(m.group("indent")) + len(m.group("marker")) + len(m.group("gap").expandtabs(4))
        item_lines = [(i + 1, m.group("body"))]
        j = i + 1
        while j < len(lines):
            nxt = lines[j]
            if not nxt.strip():
                break
            if CODE_FENCE.match(nxt) or LIST_ITEM_RE.match(nxt):
                break
            indent = len(nxt.expandtabs(4)) - len(nxt.expandtabs(4).lstrip(" "))
            if indent < content_col and indent == 0 and j > i + 1:
                break
            if indent < len(m.group("indent")) + len(m.group("marker")) + 1:
                break
            item_lines.append((j + 1, nxt))
            j += 1

        # Evaluate last non-blank line outside inline code
        last_line_no, last_txt = item_lines[-1]
        for lno, txt in reversed(item_lines):
            cleaned = INLINE_CODE.sub(" CODE ", txt).strip()
            if cleaned:
                last_line_no, last_txt = lno, cleaned
                break
        cm = CONJUNCTION_END.search(last_txt)
        if cm:
            findings.append({
                "file": filename,
                "line": last_line_no,
                "col": cm.start() + 1,
                "rule": "dangling-conjunction",
                "level": "advisory-free",
                "match": cm.group(0).strip(),
                "message": "List item ends with 'and'/'or'. Complete the item or join items.",
            })
        i = j
    return findings


def _load_dictionary(dict_path: Path = DICT_PATH) -> dict[str, Any]:
    """Load local Issue 9 JSON dictionary."""
    if not dict_path.exists():
        raise FileNotFoundError(
            f"Issue 9 dictionary not found at {dict_path}. Run build_dictionary.py first."
        )
    return json.loads(dict_path.read_text(encoding="utf-8"))


def _build_dict_index(payload: dict[str, Any]) -> tuple[set[str], dict[str, list[dict[str, Any]]]]:
    """Build approved-form set and unapproved entry lookup table."""
    approved_forms: set[str] = set()
    by_key: dict[str, list[dict[str, Any]]] = {}
    for entry in payload.get("entries", []):
        key = entry["key"]
        by_key.setdefault(key, []).append(entry)
        if entry["approved"]:
            approved_forms.add(key)
            for inf in entry.get("inflections", []):
                for tok in inf.split():
                    approved_forms.add(tok.lower().strip(","))
    for v in payload.get("approved_verbs", []):
        approved_forms.add(v.lower())
    return approved_forms, by_key


def _lookup_words(words: list[str], dict_path: Path = DICT_PATH) -> int:
    """Print local Issue 9 dictionary entries for each queried word."""
    payload = _load_dictionary(dict_path)
    _, by_key = _build_dict_index(payload)
    recurring = {
        r["non_ste"].split("(")[0].strip().lower(): r["ste"]
        for r in payload.get("recurring_errors", [])
    }

    for word in words:
        q = word.strip().lower()
        matches = by_key.get(q, [])
        if not matches:
            partial = [e for k, v in by_key.items() if k.startswith(q) for e in v][:5]
            print(f"=== {word} ===\nNot an exact Issue 9 headword.")
            if q in recurring:
                print(f"  Recurring error -> STE: {recurring[q]}")
            if partial:
                print("  Related:", ", ".join(f"{e['word']} ({e['pos']})" for e in partial))
            continue

        print(f"=== {word} ({len(matches)} entry/entries) ===")
        for e in matches:
            status = "APPROVED" if e["approved"] else "UNAPPROVED"
            inf = f" [{', '.join(e['inflections'])}]" if e["inflections"] else ""
            print(f"  [{status}] {e['word']} ({e['pos']}){inf}  (PDF p.{e['page']})")
            if e["meaning_or_alternatives"]:
                label = "Meaning" if e["approved"] else "Alternatives"
                print(f"    {label}: {e['meaning_or_alternatives']}")
            if e["ste_example"]:
                print(f"    STE example: {e['ste_example']}")
            if e["non_ste_example"]:
                print(f"    Non-STE example: {e['non_ste_example']}")
    return 0


def lint(
    text: str,
    filename: str = "<stdin>",
    max_words: int = 25,
    strict_dict: bool = False,
    aerospace: bool = False,
    dict_path: Path = DICT_PATH,
) -> tuple[list[dict[str, Any]], int]:
    """Lint Markdown or plain text against structural STE rules (and optional Issue 9 dictionary)."""
    lines = text.splitlines()
    start_idx, fm_desc = _strip_front_matter(lines)

    findings: list[dict[str, Any]] = []
    words_total = 0
    seen_synonyms: dict[tuple[int, str], tuple[int, int, str]] = {}
    blocks: list[list[tuple[int, int, str]]] = []
    cur_block: list[tuple[int, int, str]] = []
    prev_prose_tail = ""

    dict_approved: set[str] = set()
    dict_by_key: dict[str, list[dict[str, Any]]] = {}
    if strict_dict:
        dict_approved, dict_by_key = _build_dict_index(_load_dictionary(dict_path))

    def flush_block() -> None:
        nonlocal prev_prose_tail
        if cur_block:
            blocks.append(cur_block[:])
            cur_block.clear()
        prev_prose_tail = ""

    def scan_segment(lineno: int, raw_seg: str, col_offset: int, skip_block: bool = False) -> None:
        nonlocal words_total, prev_prose_tail
        masked = _mask_line_markup(raw_seg)
        words_total += sum(1 for t in masked.split() if WORD_CHAR.search(t))

        for rule_id, level, pattern, msg in RULES:
            for m in pattern.finditer(masked):
                before = (prev_prose_tail + " " if prev_prose_tail else "") + masked[:m.start()]
                if rule_id == "present-perfect" and MODAL_PERFECT_PREFIX.search(before):
                    continue
                findings.append({
                    "file": filename,
                    "line": lineno,
                    "col": col_offset + m.start() + 1,
                    "rule": rule_id,
                    "level": level,
                    "match": m.group(0),
                    "message": msg,
                })

        no_files = _blank_span(masked, FILE_NAME)
        for gi, group in enumerate(SYNONYM_GROUPS):
            for base in group:
                if (gi, base) in seen_synonyms:
                    continue
                m = _word_re(base).search(no_files)
                if m:
                    seen_synonyms[(gi, base)] = (lineno, col_offset + m.start() + 1, m.group(0))

        if strict_dict:
            for m in ALPHA_WORD.finditer(no_files):
                tok = m.group(0).lower()
                if len(tok) <= 1:
                    continue
                if not aerospace and tok in SOFTWARE_WHITELIST:
                    continue
                entries = dict_by_key.get(tok, [])
                unapproved_entries = [e for e in entries if not e["approved"]]
                if not unapproved_entries:
                    continue
                approved_entries = [e for e in entries if e["approved"]]
                if tok in dict_approved and not (aerospace and approved_entries):
                    continue
                alts = "; ".join(
                    f"{e['pos']}: {e['meaning_or_alternatives']}"
                    for e in unapproved_entries
                    if e["meaning_or_alternatives"]
                )
                if approved_entries:
                    app_pos = "/".join(e["pos"] for e in approved_entries)
                    msg = f"Mixed-POS in Issue 9 (approved only as {app_pos}). If used otherwise: {alts}"
                else:
                    msg = f"Unapproved in Issue 9 dictionary. Approved alternative(s): {alts}"
                findings.append({
                    "file": filename,
                    "line": lineno,
                    "col": col_offset + m.start() + 1,
                    "rule": "unapproved-word",
                    "level": "advisory",
                    "match": m.group(0),
                    "message": msg,
                })

        # Keep raw inline code markers intact for sentence-splitter while keeping prefix column aligned
        if not skip_block and masked.strip():
            # Use raw_seg with only link destinations blanked so _split_sentences strips inline code properly
            prose_for_split = _blank_span(re.sub(r"<!--.*?-->", " ", raw_seg), MD_LINK_DEST, group_idx=2)
            cur_block.append((lineno, col_offset, prose_for_split))
            prev_prose_tail = masked.strip()
        elif not masked.strip():
            prev_prose_tail = ""

    for lno, desc_text in fm_desc:
        scan_segment(lno, desc_text, 0)
        flush_block()

    fence_char: str | None = None
    fence_len = 0
    in_html_comment = False

    for idx in range(start_idx, len(lines)):
        lineno = idx + 1
        raw = lines[idx]

        if in_html_comment:
            if "-->" in raw:
                in_html_comment = False
            flush_block()
            continue
        if raw.lstrip().startswith("<!--") and "-->" not in raw:
            in_html_comment = True
            flush_block()
            continue

        fm = CODE_FENCE.match(raw)
        if fm:
            run = fm.group(1)
            if fence_char is None:
                fence_char, fence_len = run[0], len(run)
            elif run[0] == fence_char and len(run) >= fence_len and not raw[fm.end():].strip():
                fence_char, fence_len = None, 0
            flush_block()
            continue
        if fence_char is not None:
            continue

        if not raw.strip() or HEADING_OR_RULE.match(raw):
            flush_block()
            continue

        # Split Markdown table rows per cell
        if raw.lstrip().startswith("|") and raw.rstrip().endswith("|") and raw.count("|") >= 2:
            flush_block()
            pos = 1
            for cell in raw.split("|")[1:-1]:
                scan_segment(lineno, cell, pos, skip_block=False)
                flush_block()
                pos += len(cell) + 1
            continue

        # Strip blockquote / list prefix for prose scanning while preserving column offset
        pm = BLOCKQUOTE_LIST_PREFIX.match(raw)
        skip_col = pm.end() if pm else 0
        if LIST_ITEM_RE.match(raw):
            flush_block()
        scan_segment(lineno, raw[skip_col:], skip_col)

    flush_block()

    for block in blocks:
        for lno, col, wcount in _split_sentences(block):
            if wcount > max_words:
                findings.append({
                    "file": filename,
                    "line": lno,
                    "col": col,
                    "rule": "long-sentence",
                    "level": "advisory-free",
                    "match": f"{wcount} words",
                    "message": f"Sentence has {wcount} words (cap {max_words}). Split it.",
                })

    for gi, group in enumerate(SYNONYM_GROUPS):
        present = [(seen_synonyms[(gi, b)], b) for b in group if (gi, b) in seen_synonyms]
        if len(present) > 1:
            present.sort()
            first_base = present[0][1]
            for (lno, col, match), base in present[1:]:
                findings.append({
                    "file": filename,
                    "line": lno,
                    "col": col,
                    "rule": "synonym-rotation",
                    "level": "advisory-free",
                    "match": match,
                    "message": f"'{base}' and '{first_base}' name the same action. Pick one and use it every time.",
                })

    findings.extend(_dangling_conjunctions(lines, start_idx, filename))
    findings.sort(key=lambda f: (f["line"], f["col"], f["rule"]))
    return findings, words_total


def report(findings: list[dict[str, Any]], words_total: int, as_json: bool, hard_count: int, baseline: int) -> None:
    """Print findings in human or JSON format."""
    rate = round(len(findings) * 100 / words_total, 1) if words_total else 0.0
    if as_json:
        print(json.dumps({
            "violations": findings,
            "count": len(findings),
            "hard_count": hard_count,
            "baseline": baseline,
            "words": words_total,
            "per_100_words": rate,
        }, indent=2))
        return
    for f in findings:
        print(f"{f['file']}:{f['line']}:{f['col']} {f['rule']}: {f['message']} [{f['match']}]")
    print(f"\n{len(findings)} violations ({hard_count} hard, baseline {baseline}), "
          f"{words_total} words, {rate} per 100 words")
    print("Hedges/modality (may, might, could) are never flagged: confidence is content.")


def selftest() -> None:
    """Run built-in unit tests for all structural rules, modality safety, fences, and dictionary."""
    bad = (
        "The panel is removed; spin up the job. "
        "Perform an analysis of the seamless log. "
        "In order to fix it, utilize the tool. "
        "We have received the report."
    )
    bad_findings, _ = lint(bad)
    rules = {f["rule"] for f in bad_findings}
    for expected in (
        "semicolon", "phrasal-verb", "nominalization",
        "marketing-adjective", "bloat-phrase", "passive-voice", "present-perfect",
    ):
        assert expected in rules, (expected, bad_findings)

    # Modal hedges must never be flagged (including wrapped lines)
    for hedge in (
        "The request may have failed. It could be a timeout. The disk might have filled.",
        "The task may\nhave failed.",
        "The task couldn't have run. It won't have finished. It might already have finished.",
    ):
        findings, _ = lint(hedge)
        assert findings == [], (hedge, findings)

    # Code fences and inline code must be ignored
    findings, _ = lint("```python\nx = a; utilize()\n```\nUse `spin_up()` to start.")
    assert findings == [], findings

    # Long sentence detection and cap parameter
    twenty_six = " ".join(f"word{i}" for i in range(1, 27)) + "."
    findings, _ = lint(twenty_six, max_words=25)
    assert [f["rule"] for f in findings] == ["long-sentence"], findings
    findings, _ = lint(" ".join(f"word{i}" for i in range(1, 22)) + ".", max_words=20)
    assert [f["rule"] for f in findings] == ["long-sentence"], findings

    # Synonym rotation ignores bare file names
    findings, _ = lint("Check the log. Verify the config.")
    assert any(f["rule"] == "synonym-rotation" for f in findings), findings
    findings, _ = lint("Check `verify.py` and verify-geometry.py first.")
    assert not any(f["rule"] == "synonym-rotation" for f in findings), findings

    # Dangling conjunction in lists (but ignored in code fences)
    findings, _ = lint("- Set the target and\n- Record the result or\n~~~\n- Keep and\n~~~")
    assert len([f for f in findings if f["rule"] == "dangling-conjunction"]) == 2, findings

    # CLI flags & UTF-8 error handling
    with tempfile.TemporaryDirectory() as tmp:
        p = Path(tmp) / "a.md"
        p.write_text("a; b.\n", encoding="utf-8")
        buf = io.StringIO()
        with redirect_stdout(buf):
            assert main([str(p), "--json", "--disable", "semicolon"]) == 0
        assert json.loads(buf.getvalue())["count"] == 0

        bad_p = Path(tmp) / "bad.md"
        bad_p.write_bytes(b"\xff\xfe")
        err = io.StringIO()
        try:
            with redirect_stderr(err):
                main([str(bad_p)])
        except SystemExit as exc:
            assert exc.code == 2
        else:
            raise AssertionError("Expected exit 2 for non-UTF8 file")

    # Local dictionary check if present
    if DICT_PATH.exists():
        findings, _ = lint("Utilize this tool to check the build.", strict_dict=True)
        assert any(f["rule"] == "unapproved-word" and f["match"].lower() == "utilize" for f in findings), findings
        assert not any(f["rule"] == "unapproved-word" and f["match"].lower() == "check" for f in findings), findings
        findings_aero, _ = lint("Check the valve.", strict_dict=True, aerospace=True)
        assert any(f["rule"] == "unapproved-word" and f["match"].lower() == "check" for f in findings_aero), findings_aero

    print("selftest OK")


def _rule_list(value: str) -> set[str]:
    rules = {r.strip() for r in value.split(",") if r.strip()}
    unknown = rules - RULE_IDS
    if unknown:
        raise argparse.ArgumentTypeError(
            f"unknown rule(s): {', '.join(sorted(unknown))}. Known: {', '.join(sorted(RULE_IDS))}"
        )
    return rules


def _non_negative_int(value: str) -> int:
    try:
        n = int(value)
    except ValueError:
        n = -1
    if n < 0:
        raise argparse.ArgumentTypeError(f"expected non-negative integer, got {value!r}")
    return n


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="ste-lint.py",
        allow_abbrev=False,
        description="Deterministic structural linter and Issue 9 dictionary lookup for ASD-STE100.",
    )
    parser.add_argument("paths", nargs="*", metavar="FILE")
    parser.add_argument("--json", action="store_true", help="print findings as JSON")
    parser.add_argument("--baseline", type=_non_negative_int, default=0, metavar="N",
                        help="pass unless hard violations exceed N (default 0)")
    parser.add_argument("--disable", type=_rule_list, action="append", default=[], metavar="RULES",
                        help="comma-separated rule IDs to silence; may be repeated")
    parser.add_argument("--max-words", type=_non_negative_int, default=25, metavar="N",
                        help="sentence word cap (default 25; use 20 for procedures)")
    parser.add_argument("--strict-dict", action="store_true",
                        help="check words against local Issue 9 dictionary (advisory warnings)")
    parser.add_argument("--aerospace", action="store_true",
                        help="disable software term whitelist when --strict-dict is active")
    parser.add_argument("--lookup", nargs="+", metavar="WORD",
                        help="look up words in the local Issue 9 dictionary")
    parser.add_argument("--selftest", action="store_true", help="run built-in unit tests")
    args = parser.parse_intermixed_args(argv)

    if args.selftest:
        selftest()
        return 0
    if args.lookup:
        try:
            return _lookup_words(args.lookup)
        except FileNotFoundError as exc:
            parser.error(str(exc))

    disabled = set().union(*args.disable)
    findings: list[dict[str, Any]] = []
    words_total = 0

    try:
        if args.paths:
            for p in args.paths:
                try:
                    text = Path(p).read_text(encoding="utf-8")
                except (OSError, UnicodeDecodeError) as exc:
                    parser.error(f"cannot read {p}: {exc}")
                f, w = lint(
                    text,
                    filename=p,
                    max_words=args.max_words,
                    strict_dict=args.strict_dict,
                    aerospace=args.aerospace,
                )
                findings.extend(f)
                words_total += w
        else:
            findings, words_total = lint(
                sys.stdin.read(),
                max_words=args.max_words,
                strict_dict=args.strict_dict,
                aerospace=args.aerospace,
            )
    except FileNotFoundError as exc:
        parser.error(str(exc))

    findings = [f for f in findings if f["rule"] not in disabled]
    hard_count = sum(1 for f in findings if f["level"] == "advisory-free")
    report(findings, words_total, args.json, hard_count, args.baseline)
    return 1 if hard_count > args.baseline else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
