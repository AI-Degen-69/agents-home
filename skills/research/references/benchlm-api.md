# BenchLM.ai API Usage

## Fetch benchmark data for a model

Endpoint: `https://benchlm.ai/api/data/benchmarks?model=<model>&format=csv`

Example (Python):

```python
import requests
import csv

model = "mercury-3"
url = f"https://benchlm.ai/api/data/benchmarks?model={model}&format=csv"
resp = requests.get(url)
resp.raise_for_status()
lines = resp.text.splitlines()
reader = csv.DictReader(lines)
for row in reader:
    print(row['category'], row['benchmark'], row['value'])
```

## Typical columns returned

- category: Agentic, Coding, Reasoning, Knowledge, Multimodal, Multilingual, Instruction following
- benchmark: specific benchmark name (e.g., MRCRv2, DeepSWE, GPQA-D)
- key: internal key
- value: numeric score (float)
- formatted: percentage string
- verification: Provider exact, Benchmark exact, etc.
- source_label: where the data came from
- source_url: link to source

## Tips

- Cache the CSV response if you need to query multiple models in a session.
- Cross‑check each metric with at least one independent source (provider blog, model card, or paper).
- When reporting speed, look for rows where benchmark contains "tok/s" or similar; BenchLM often provides a Speed category.

## Example: Getting Mercury 3 metrics

```bash
curl -s "https://benchlm.ai/api/data/benchmarks?model=mercury-3&format=csv" | grep -E "Reasoning|Agentic|Coding|Knowledge"
```

This returns rows you can paste into a comparative table.
```