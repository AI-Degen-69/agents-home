# YouTube transcripts via yt-dlp (no API key)

Use this when `$TRANSCRIPT_API_KEY` is absent or credits should be preserved. Fully local, works for any public video.

## Install (once)

- `uv tool install yt-dlp` (Windows; binary lands in `~/.local/bin/yt-dlp`)
- Fallback if uv is unavailable: `pipx install yt-dlp` or `python3 -m pip install yt-dlp`

## Check caption availability

`yt-dlp --list-subs URL | grep -A3 -i available`

Auto-captions exist for virtually every video in ~170 languages — auto-translated English (`en.*`) is present even for non-English videos.

## Download captions only (no video)

```
yt-dlp --skip-download --write-auto-subs --write-subs \
  --sub-langs "en.*,ru.*" --sub-format vtt \
  -o "%(id)s.%(ext)s" URL
```

Request BOTH the language you read and the original language (`ru.*` for Russian videos): the auto-translation of the original track is more faithful than a second-order translation.

## Metadata one-liner

```
yt-dlp --skip-download --print \
  "%(id)s | %(title)s | uploaded %(upload_date)s | %(duration)s sec | %(view_count)s views | %(channel)s" URL
```

Upload date, duration, and view count are due-diligence signals (young channel, thin engagement, multi-hour "live" streams).

## Clean VTT to plain text (Python)

- Drop lines containing `-->` and the `WEBVTT` / `Kind:` / `Language:` / `NOTE` headers.
- Strip inline `<...>` tags.
- Dedup consecutive identical lines — rolling captions repeat each line 2-3 times.

## Long streams

A 12-hour stream produces ~30K words / ~1.6MB of captions. Never read it raw — keyword-window or sample it in code, then print only the relevant slices.

## Pitfall: captions are not proof of content

Auto-captions can be pure song lyrics, silence, or background music. Before treating a transcript as evidence of a claimed content (e.g. a "live trading" stream), verify the substance is actually in the audio — count digits and `$` for finance/trading claims. Zero numbers in a "live trading" broadcast means the audio proves nothing; flag the gap instead of parroting the video title.
