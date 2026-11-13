---
name: web-design-guidelines
description: Check UI code against the code-level Web Interface Guidelines rules the interface review family does not own - hydration safety, image dimensions and loading, URL state, touch gestures, dark-mode meta, and Intl locale formatting. For a full interface review (accessibility behavior, layout, typography, color, copy, polish) use `better-interface` instead.
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

**Scope.** This skill owns the code-level rules only: hydration safety, image
dimensions and loading, URL state and deep-linking, touch gestures, dark-mode
meta, and `Intl` locale formatting. Everything it also says about
accessibility, layout, typography, color and copy is owned by the interface
review family (`better-interface` and its domain skills) - report those through
that path, not here, so one rule has one owner.

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
