# Speakwell

A standalone, responsive public-speaking practice app. No install, API key, or paid service is required. Built with browser JavaScript, CSS, MediaRecorder and Web Speech recognition.

## Run locally

From this directory:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. Microphone recording requires localhost or HTTPS. Allow microphone access when starting a round. Browser speech recognition availability varies; try current desktop Chrome or Edge. If unavailable, recording and playback still work, and you can enter a transcript manually.

## Features

- Random topics in everyday, research/discovery, and open-question argument modes
- 30-second, 60-second and 2-minute rounds, with automatic stop or early finish
- Discovery prompts, Google Scholar research links, and preparation notes
- Audio recording, replay, and download
- Speech transcription with editable review
- Estimated pace, candidate filler phrases, and immediate word repetitions
- Transparent delivery score for everyday/discovery practice, plus actionable coaching
- Argument mode uses descriptive feedback without a numerical score
- Responsive layout, labeled inputs, keyboard focus and reduced-motion support

## Accuracy and privacy

This version uses browser speech recognition and deterministic feedback rules, not an LLM or a dedicated acoustic stutter detector. Recognizers can normalize or omit hesitations. Repeated transcript words are only a rough proxy, not reliable detection of syllable-level stutters. “Like,” “kind of,” and similar phrases can be meaningful; review them before interpreting the score. Scores do not measure argument quality, eloquence, accent, intelligence or disability.

Score: 40% pace (110–170 words/minute practice range), 40% filler rate, 20% immediate repetition rate. Outside the pace range, each word/minute subtracts 1.2 from its 100-point component; filler and repetition components subtract 700 and 1000 times their respective rates. Components are clamped at zero. At least 10 words and 5 seconds are required. Compare personal practice sessions rather than different people.

Audio blobs and notes remain in tab memory and disappear on reload. Nothing is saved by the app to a server. The browser recognition service may send audio to its provider; the interface discloses this before recording. Fonts are fetched from Google Fonts. Research links open Google Scholar.

## Verify

```sh
npm test
npm run check
```

Manual device check: allow the microphone; speak through a 30-second round; confirm auto-stop, replay, download, and recognized text. Try early finish and denied permissions. Microphone and recognition service behavior requires a real browser/device and cannot be established by unit tests.

For production-grade filler and stutter analysis, replace the browser transcript path with a consent-based acoustic analysis pipeline and validate it against labeled speech samples. This app does not claim clinical or validated fluency analysis.

## Project layout

`dist/index.html`: interface; `dist/style.css`: responsive styles; `dist/app.js`: topics and recording lifecycle; `dist/analysis.js`: scoring rules; `tests/`: meaningful scoring tests. Static hosting needs only `dist/` over HTTPS. No build step.
