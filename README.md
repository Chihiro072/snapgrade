# SnapGrade

**An AI-powered Chinese handwriting practice PWA for young learners.**

SnapGrade turns a printed Chinese spelling worksheet into a simple mobile feedback loop. A learner chooses an MOE lesson, prints a Tian Zige worksheet, captures it with their phone, and receives a score, red-pen corrections, and a history of past attempts.

## Live demo

**[Open SnapGrade on Vercel →](https://snapgrade-gamma.vercel.app/)**

> For the complete scan flow, create an account, generate a fresh worksheet from Syllabus, then scan its QR code using a mobile device.

## What this project solves

Chinese spelling practice often relies on a parent or teacher manually checking a physical worksheet. SnapGrade demonstrates a faster feedback loop for that process:

`Choose lesson → print worksheet → capture photo → grade on backend → red-pen feedback → track improvement`

The assignment prioritises this working end-to-end flow over perfect handwriting recognition accuracy.

## Key features

### QR-linked worksheets

Every newly generated worksheet includes a QR code identifying its exact MOE lesson. This means the app knows the correct expected vocabulary before grading; it does not need to guess a course from handwriting.

### Mobile camera capture built for worksheets

- Uses the device rear camera through `getUserMedia`.
- Alignment brackets, QR target and torch control guide the learner.
- Tapping the shutter freezes and saves the frame immediately.
- The camera is released straight away and replaced with a loading state, so the learner does not need to keep holding the phone.

### Complete backend grading pipeline

1. The captured image is uploaded to private Supabase Storage via `POST /api/upload`.
2. A pending submission record is created in PostgreSQL.
3. `POST /api/grade` downloads the image, sends it and the lesson word list to a vision model, calculates the score, and writes individual results to `character_results`.
4. The frontend reads the stored results and overlays missed words in red pen on the submitted worksheet.

### Results and progress history

- Live score header with date, completion status and missed-word count.
- Red handwritten correction overlay on the captured worksheet.
- Historical results matrix: vocabulary rows and attempt-date columns.
- Horizontally scrollable on mobile, so every past attempt remains readable.
- Native Share Report action on supported phones, with clipboard fallback elsewhere.

### MOE lesson experience

- P1–P6 level selector; all levels are accessible for practice.
- Lesson vocabulary, printable revision sheets and student-specific completion status.
- Lucas / Primary 2 dashboard, prepaid credits and weekly practice view, matching the supplied mobile design direction.

### PWA and authentication

- Installable PWA manifest, SnapGrade icon and mobile viewport configuration.
- Supabase email authentication.
- Dashboard, Syllabus, History, Camera and Results routes redirect unauthenticated visitors to Login.

## AI models

The brief names Gemini 1.5 Flash. That model is no longer available through the configured Gemini API, so this project uses a current supported Flash model and a second provider as resilience fallback.

| Role | Model | Use |
| --- | --- | --- |
| Primary grader | Google Gemini `gemini-3.6-flash` | Default worksheet vision grading. |
| Fallback grader | OpenRouter `google/gemma-4-26b-a4b-it:free` | Used if Gemini is temporarily unavailable or quota-limited. |

Both models receive the photo and strict expected-word prompt, then return JSON correct/incorrect results. Free provider capacity may be rate-limited; both API keys should be configured for the best demonstration experience.

## Technology

- Next.js 16, React 19, TypeScript and Tailwind CSS
- Supabase Auth, PostgreSQL, Storage and Row Level Security
- Google Gemini and OpenRouter vision APIs
- `qrcode` and `jsQR` for worksheet identification
- `sharp` and `pdf-lib` for Chinese A4 worksheet PDFs
- Vercel deployment

## Local setup

Requirements: Node.js 20.9+ and a Supabase project.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Configure `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

Keep `GEMINI_API_KEY` and `OPENROUTER_API_KEY` server-side only. Never expose them with a `NEXT_PUBLIC_` prefix.

## Supabase and Vercel deployment

1. Run [`supabase/migrations/schema.sql`](supabase/migrations/schema.sql) in Supabase SQL Editor. It creates the lesson, submission and result tables, private `worksheets` bucket and access policies.
2. Enable Email auth and add local/Vercel URLs to Supabase Auth redirect URLs.
3. Import the repository into Vercel with the Next.js preset.
4. Add the four environment variables above for Production, Preview and Development.
5. Add the deployed Vercel URL to Supabase Auth Site URL and redirect URLs.

The worksheet endpoint includes a bundled Chinese font for Vercel PDF generation and allows up to 60 seconds for image/PDF operations.

## Verification

```bash
npm run build
npx tsc --noEmit
```

Both checks pass before deployment.
