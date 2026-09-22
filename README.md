# Speakwell

Speakwell is a responsive public-speaking practice app with random prompts, timed recording, editable browser transcription, local voice analysis, and AI content feedback.

## Run locally

Requirements: Node.js 20 or newer and a modern desktop browser.

```sh
cd ~/Downloads/Speakwell
cp .env.example .env
```

Open http://localhost:4173. Microphone recording requires localhost or HTTPS. Allow microphone access when starting a round. Browser speech recognition availability varies; try current desktop Chrome or Edge. If unavailable, recording and playback still work, and you can enter a transcript manually.

## Publish on GitHub Pages

This repository is a static site, so it does not need a build service or API key.

1. Create a new empty repository on GitHub.
2. From this project folder, run:

   ```sh
   git init
   git add .
   git commit -m "Initial Speakwell app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. In the GitHub repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab and wait for the included “Deploy Speakwell to GitHub Pages” workflow to finish. The deployment summary will contain the public URL.

The included workflow publishes the `dist` folder whenever `main` changes. GitHub Pages uses HTTPS, which is required for microphone recording outside localhost.

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

The test suite covers contextual filler decisions, audio-score boundaries, monotone and rushing signals, and the structured OpenAI request with a mocked response. A real microphone/browser check and a real API-key check are still needed on the deployment target.

## Project layout

- `dist/`: browser interface and generated analysis bundles
- `src/analysis.js`: contextual transcript analysis
- `src/audio-analysis.js`: microphone feature extraction and speaking score
- `server/content-analysis.js`: OpenAI content rubric and structured request
- `functions/api/analyze-content.js`: Cloudflare Pages Function
- `server.mjs`: local static/API server
- `tests/`: transcript, audio, and API-contract tests
