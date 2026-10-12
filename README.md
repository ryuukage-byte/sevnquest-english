# SevnQuest — English Edition

An RPG for learning English (CEFR A1–B2): vocabulary, a letter library with stroke-order writing, grammar,
reading passages, listening dialogues, quizzes, flashcards, missions and an arena arcade.

This branch (`english-edition`) is the English counterpart of the Japanese app on `main`.
See **[ENGLISH_EDITION.md](ENGLISH_EDITION.md)** for what changed, what is still in Indonesian or Japanese,
and what to do next.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npx tsc --noEmit   # type check
npm run build      # production build (dist/)
npm test           # unit tests
```

## Configuration

Copy `.env.example` to `.env` and set your own Supabase project if you want cloud save and the leaderboard.
Without it the app runs fully in the browser (progress saved locally). Do not reuse the Japanese project's keys.

## Deploy

Deploy the `dist/` folder as a static site (Vercel config included: SPA rewrite and cache headers).
