# Video Verification (vendor proof)

Exact commands for pulling transcripts and frames from a vendor's YouTube proof, on a Windows/git-bash host. Works with no YouTube API key: yt-dlp + ffmpeg + vision_analyze.

## Setup (once per host)
`uv tool install yt-dlp` — installs to ~/.local/bin. Verify ffmpeg is on PATH (`ffmpeg -version`) before planning any frame pull.

## 1. Channel sweep
```
yt-dlp --flat-playlist --print "%(id)s | %(title).80s | %(duration_string)s | %(view_count)s views" "https://www.youtube.com/@HANDLE"
```
Look for: duplicate-looking "live" streams, shorts claiming impossible feats, view-count anomalies, clickbait-title ratio vs substantive content.

## 2. Transcript
```
yt-dlp --skip-download --write-auto-subs --sub-langs "en.*" --convert-subs srt -o "ID.%(ext)s" URL
sed -e 's/<[^>]*>//g' ID.en.srt | grep -v '^[0-9]*$' | grep -v '\-\->' | awk 'NR%2==1' | head -c 2600
```
- Auto-captions are machine-translated from the upload language; expect rough phrasing and name drift ("Rulik/Ruik").
- A "12h live trading" stream whose transcript is only song lyrics = no spoken proof at all; the visual is the only evidence — go to frames.
- Cross-check spoken strategy claims against the product page: a founder saying the strategy "no longer works" while it stays in the store is a first-class finding.

## 3. Frames (the decisive check)
- `-f "w"` (worst) fails on some videos with "Requested format is not available"; list formats and pick an explicit id instead: `yt-dlp -F URL`, then `-f "230"` (640x360).
- Pull only the windows needed — never download a 12h stream whole:
```
yt-dlp -f "230" --download-sections "*0-20" -o "start.%(ext)s" URL
yt-dlp -f "230" --download-sections "*42690-42760" -o "end.%(ext)s" URL
```
- Extract and read:
```
ffmpeg -loglevel error -ss 3 -i start.mp4 -frames:v 1 -q:v 2 frame.jpg
```
Then vision_analyze the frame asking for the exact on-screen numbers (portfolio, cash, PnL, PID) and any wallet address or username.

### Frame pitfalls
- **Read numbers at ≥360p.** A 144p frame produced a confident wrong read (a named trading terminal misread as a generic exchange) that nearly inverted the verdict. Low-res reads are not evidence.
- **Never compare frame/video hashes to prove two uploads are the same recording** — YouTube re-encodes every upload, so identical content yields different MD5s. Prove sameness by reading the on-screen numbers: same portfolio value + same process PID = same session; different values/dates/PIDs = genuinely different sessions (do not report them as re-uploads).
- Check start AND end frames of a long stream: the same PID across 12 hours = one continuous run; the changing portfolio trajectory is the account's actual curve.

## 4. Portfolio math-consistency check
For any streamed account screen:
- deposits_base = portfolio_value − PnL; then PnL / deposits_base must reproduce the displayed percentage to rounding.
- A consistent base across start and end = one continuous account OR a consistently fabricated one — it rules out sloppy edits only, never authenticity.
- Compare the streamed profit delta against the verified reviewer accounts' measured ROI: a vendor account gaining ~100% in 12h while linked reviewers grind at 0.25–1.25% ROI on turnover is an unanswered vendor question, not proof either way.
- PnL > portfolio value ⇒ withdrawals ≥ the difference: real profit extraction OR a fabricated page. Indistinguishable without the wallet address — ask for it.
- No wallet address or username anywhere on screen is the standing gap: the streamed account cannot be tied to any public profile, so "verify on-chain yourself" stays unfulfilled until the vendor names the account.