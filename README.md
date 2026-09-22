# Speakwell

Speakwell is a public-speaking practice app that helps users improve both delivery and content. Choose a prompt, record a short response, review the transcript, and receive separate feedback on how you spoke and how well you addressed the prompt.

## Features

- Random prompts across everyday storytelling, curious discoveries, and arguments
- Timed microphone recording with a downloadable audio file
- Editable browser-generated transcript
- Speaking feedback for pace, vocal variation, volume consistency, pauses, fillers, immediate restarts, and possible incomplete endings
- AI content feedback for organization and relevance to the assigned prompt
- Local audio analysis that does not send recordings to the content-analysis endpoint

## Requirements

- Node.js 20 or newer
- A modern desktop browser, preferably Chrome or Edge for live transcription
- Microphone access
- An OpenAI API key for AI content feedback

## Run locally

Open a terminal in the `Speakwell` folder and install dependencies:

```bash
npm install
cp .env.example .env
```

Open `.env` and add your OpenAI API key:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
```

Build the browser files, then start the local server:

```bash
npm run build
npm start
```

Open [http://localhost:4173](http://localhost:4173) in your browser. Allow microphone access when asked.

## Using Speakwell

1. Choose a topic category and a practice length.
2. Select **Start speaking** and respond to the prompt.
3. Finish the recording or let the timer end the round.
4. Correct the transcript if the browser misunderstood anything.
5. Select **Update both scores** to refresh the feedback.
6. Use the suggestions before trying another prompt.

## Speaking score

Speakwell uses browser audio measurements and the editable transcript to estimate delivery habits:

- **Vocal variation:** Whether pitch and vocal energy change enough to avoid sounding monotone.
- **Pace control:** Whether the response is rushed or unusually slow.
- **Volume consistency:** Whether the speaker remains clearly audible.
- **Pause control:** Whether pauses support a natural speaking rhythm.
- **Filler control:** Vocal fillers such as `um` and `uh`, plus context-aware fillers such as some uses of `like`.
- **Restarts and stutters:** Immediate repeated words that may show a false start. Deliberate emphasis is not counted for common emphatic repeats such as “very very.”
- **Possible incomplete endings:** A low-confidence prompt when a recognized response ends on a connector such as “because” or “and.”

These are coaching signals, not clinical measures. Background noise, microphone quality, multiple speakers, and transcription mistakes can affect the results.

## Content score

The content score evaluates only the response’s relationship to the assigned prompt:

- **Organization — 50%:** Whether the response has a discernible progression and connects ideas in a useful order.
- **Relevance — 50%:** Whether the response directly answers the assigned prompt.

Content feedback intentionally ignores grammar, missing punctuation, likely recognition errors, filler words, stutters, incomplete phrases, accent, identity, opinion, and vocabulary sophistication. Those belong to delivery feedback or are outside the app’s scope.

## Transcript and privacy

Speakwell uses browser speech recognition when available. It works best in current Chrome or Edge. If it is unavailable or inaccurate, users can enter or edit the transcript manually.

Audio recording and local audio measurements remain in the browser tab unless the user downloads the recording. For AI content feedback, Speakwell sends the topic, prompt, and transcript to the configured OpenAI endpoint. It does not send the audio recording for content analysis.

Keep the OpenAI API key in `.env`. Never put it in browser code.

## Accounts and progress tracking

Speakwell supports email sign-up and sign-in through Supabase. Signed-in users save a small record for each completed round: the topic, date, duration, delivery metrics, and content and speaking scores. Audio recordings and transcript text are not stored in the progress history.

### Supabase setup

1. Create a Supabase project and enable **Email** under **Authentication**.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates the practice-history table and row-level security policies so each user can read and save only their own attempts.
3. Copy the project URL and the **publishable** key from Supabase’s Connect dialog or API settings. Do not use a secret or service-role key.
4. Add these values to `.env`:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

5. Restart Speakwell. The **Sign in** button now supports creating an account, signing in, signing out, and viewing saved progress.

The browser receives the Supabase URL and publishable key so it can sign users in directly. Row-level security in `supabase/schema.sql` protects the saved records. Keep all secret or service-role keys private and off the client.

When Speakwell runs as a static site, add the same public values to `dist/supabase-config.js`. The URL and publishable key can appear in a static app because they are not secrets. Never put a Supabase secret or service-role key in that file.

## Troubleshooting

**Microphone does not work**

Check browser microphone permissions and reload the page. Recording requires `localhost` during local development or HTTPS elsewhere.

**Transcript is unavailable or inaccurate**

Try Chrome or Edge, then correct or enter the transcript manually.

**Content feedback is unavailable**

Confirm that `.env` has a valid `OPENAI_API_KEY`, then restart the server:

```bash
npm start
```

**Changes do not appear in the browser**

Rebuild the browser files, then restart the server:

```bash
npm run build
npm start
```

## Commands

```bash
npm start
npm run build
npm test
npm run check
```

- `npm start` starts the local server.
- `npm run build` rebuilds browser analysis files.
- `npm test` runs the automated test suite.
- `npm run check` checks JavaScript syntax.
