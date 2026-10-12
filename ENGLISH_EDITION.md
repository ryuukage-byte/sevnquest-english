# SevnQuest — English Edition

This branch (`english-edition`) turns the Japanese learning RPG into an English-learning RPG (CEFR A1–B2).
It keeps the original layout, design system, navigation, progression (EXP, levels, tiers, missions,
streaks, SRS recall, leaderboard screens) and the writing canvas. Learning content, the alphabet
writing mode and the level structure are English.

The Japanese original stays on `main`, untouched.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Checks:

```bash
npx tsc --noEmit   # type check (0 errors)
npm run build      # production build into dist/
npm test           # unit tests (weekId, kanji writing record)
```

## Deploy it

`npm run build` produces a static site in `dist/`. `vercel.json` keeps the SPA rewrite and cache headers.
The Japanese `/supabase-proxy` rewrite was removed on purpose.

## Backend and data (read this before deploying)

- **No backend is configured by default.** Progress is saved in the browser. Cloud save and the
  leaderboard run only if you set your **own** Supabase project:
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).
  - Do **not** point this build at the Japanese production project. Its URL and anon key were removed from the code.
- The Supabase migrations / schema are not in this repository. Set up the tables your project needs before enabling cloud save.
- `VITE_GOOGLE_AUTH` / `VITE_GOOGLE_CLIENT_ID` are optional.
- AI deck generation (`api/deck-topic.ts`) is optional and needs `DECK_AI_*` variables. Its prompt is still written in Indonesian/Japanese (see remaining work).

## What changed

### Content (new English datasets, same JSON shapes as before)
| File | What it holds |
|---|---|
| `src/data/db/kotoba.json` | 217 English words, A1–B2: IPA in `reading`, part of speech, gloss (`meaningEn`), definition, example sentence, collocation |
| `src/data/db/bunpou.json` + `bunpou_questions.json` | 20 grammar points (A1–B2: present simple, past simple, going to, present perfect, conditionals, passive, relative clauses, reported speech, modals of deduction…), 80 multiple-choice questions |
| `src/data/db/dokkai.json` | 8 reading passages (2 per level) with 3 questions each |
| `src/data/db/choukai.json` | 6 listening dialogues (2 per level, A1–B1), spoken with the browser's English voice |
| `src/data/db/kanji.json` | 52 letters (A–Z, a–z): sound (IPA), stroke count, shape group, example words, 2 generated questions each |
| `src/data/world/maps.json`, `stages.json` | 10 maps, 60 stages: "Alphabet Academy" (capital and small letters) and A1, A2, B1, B2 "Essentials" / "Everyday Life" maps with bosses |
| `src/data/letters/strokeData.json` | Stroke outlines and medians for A–Z and a–z in hanzi-writer's format (116 strokes) |
| `src/data/officialBooks.ts`, `templateDecks.ts` | Per-level English books and starter decks, built from the datasets above |

Content generation scripts were kept out of the repo (they lived in a session scratch folder). The
JSON files above are the source of truth from here on.

### Writing mode
- The existing canvas (`KanjiWritingCanvas`, hanzi-writer) now draws **letters**. `fetchSingleCharStrokeData` looks up `src/data/letters/strokeData.json` and never goes to the network for letters.
- Vocabulary spelling practice (`KotobaWritingPractice`) reuses the same canvas: each letter of the word is traced in order.
- The Japanese kana/kanji stroke data and the CDN fallbacks were removed.

### Learning features adapted
- **Vocabulary quiz** (`KotobaModule`): meaning questions and fill-in-the-blank questions from the stage's own words. Distractors are words of the same part of speech. The Japanese conjugation generator is stubbed out (returns nothing).
- **Letter module** (`KanjiModule`, `KanjiDetailCard`, `KanjiLibraryView`): replaced the kana/kanji charts with a Letter Library (grid, search, capital/small/shape filters) and English letter cards (sound, example words, shape).
- **Grammar** (`bunpou.ts`, `grammarSkillNodes.ts`, `FormulaDisplay.tsx`): English items, levels from the data, and the grammar detail view built directly from each item (no Japanese skill adapter).
- **Reading and listening** (`dokkai.ts`, `choukai.ts`): English passages and dialogues. Listening is enabled (`CHOUKAI_ENABLED = true`).
- **Arena arcade**: Letter Speed Rush, Vocabulary Sprint (Kotoba Guess), Survival mode (Sudden Death). Conjugation and star-sentence rush removed.
- **Notebook** (decks): English level decks, the alphabet deck and the English official books.
- **Search**: a plain `SearchInput` replaced the Japanese IME search box.

### Level system
- JLPT levels were renamed to CEFR: `N5→A1`, `N4→A2`, `N3→B1`, `N2→B2`, `N1→C1`. `KANA→ALPHABET`. World IDs follow (`world_a1`…). Labels in the UI were updated where they were translated.

### Removed (Japanese-only), see `git show main:<path>` to restore
- Castle Tower (both towers; `TOWER_ENABLED = false`, the tab stays locked).
- Dungeon gates: sentence building, sakubun, conjugation altar, grammar fusion, blackboard, text-study library, immersion (YouTube/karaoke), and the kanji-extreme gate. The writing, flashcard and quiz dungeons were removed with the dungeon portal. Their modes are still available in Library, Notebook, World and Recall.
- JLPT mock exams (tryouts), star-sentence quiz, JLPT question bank parts (only the list view is kept, with an empty tryout section).
- Conjugation dojo and sandbox, conjugation sheet, morphology and syntax engines, sentence synthesiser, text-study engine, IME, furigana dictionary, grammar metadata and sub-knowledge data, thematic books.
- Japanese datasets: `db/sentences.json`, `sentence_links.json`, `bunpou_w1–w6.json`, JLPT kanji lists, kana and kanji stroke files under `public/data`, `scripts/jmdict`, `api/captions` (YouTube captions).
- Tests tied to Japanese behaviour: `universalSearch.test.ts`, `deckBuilder.test.ts`, `bunpou.golden.test.ts`.

### Infrastructure
- `src/lib/supabase.ts`: the production URL and anon key were removed. Without env variables, the app uses its local stub client.
- `vite.config.ts`: the Supabase dev proxy only runs if `VITE_SUPABASE_URL` is set. The captions dev API plugin was removed.
- `vercel.json`: removed the `/supabase-proxy` rewrite. `functions/supabase-proxy` removed.
- `index.html`, `public/manifest.webmanifest`, `package.json` name, service worker cache name: English branding.

## Feature checklist

| Area | Status |
|---|---|
| Home (Castle), stats, daily missions, streak | Works; copy mostly English |
| World: Arena arcade (3 games) | Works; copy partly English |
| Library: vocabulary, letters, grammar | Works in the browser check; the rest of the copy is partly Indonesian |
| Library: question bank | Works; category labels English; logic still JLPT-shaped |
| Letter writing canvas | Loads letter stroke data; drawing input responds. Full stroke-quiz flow not verified end to end |
| Notebook (decks, official books, flashcards, writing runner) | Works; most copy English |
| Recall (SRS) | Works; tutor messages still Indonesian |
| Leaderboard, profile | Works; copy partly English. Cloud data needs your own Supabase project |
| Settings, auth modal, onboarding tour, start guide | Copy English |
| PWA install guide | Still Indonesian |
| Castle Tower, dungeons, conjugation, fusion, text study | Removed or disabled (see above) |

Verified: `tsc` 0 errors, `npm run build` passes, `npm test` 6/6, dev server loads with no console errors on Home, Library and the letter card. The writing canvas was not exercised beyond opening it and drawing one stroke.

## Known limitations

- **Copy is not fully translated.** About 620 non-comment lines still contain Indonesian or Japanese text. The biggest groups are `utils/mastery.ts` (tutor feedback), `library/QuestionLibraryView.tsx` (question logic and labels), `utils/bunpouTitleUtils.ts`, `utils/grammarHighlight.ts` (Japanese grammar patterns), `engine/types.ts`, `utils/aiDeckPrompt.ts`, `modals/UniversalEntityModal.tsx`, `pwa/PwaInstallModal.tsx`, and `library/BunpouDetailModal.tsx`. Code comments are also still in Indonesian.
- **Content is a starter set**, not a curriculum: 217 words, 20 grammar points, 8 passages, 6 dialogues, 52 letters. There is no C1 content and no speaking or pronunciation scoring.
- **Letter stroke data is hand-drawn** (simple stroke centrelines in a 1024-unit box). It is good enough to trace and to practise order, but it is not a typeface's true outline. Quiz leniency has not been tuned.
- **Search** (`engine/search/universalSearch.ts`) still has Japanese romaji/kana logic. Search works on the English fields but is not tuned for English.
- **Deck builder by topic** (`engine/deck/deckBuilder.ts`) still uses Indonesian keyword maps, so topic-based deck creation will not match English topics well.
- **Grammar detail** shows the English formula, explanation and examples, but the "usage notes" checklist (`GrammarChecklist.tsx`) still reads Japanese-grammar rules.
- **Question bank** keeps its Japanese-shaped filters and the empty "tryout" section. Its logic was only lightly adapted (`any` typing added for the empty tryout list).
- **Types:** `types/tower.ts` and the level types still mention removed concepts. Type names such as `JlptLevel` were kept to limit churn.
- **Cloud save and leaderboard** were not exercised against any Supabase project. The AuthModal copy and Supabase error messages need a final pass.
- **Old tests removed:** the Japanese search and deck-builder test suites were removed rather than rewritten. The English search has no automated tests yet.
- **Service worker and offline cache** were renamed, so existing installs will refetch.

## Remaining work (suggested order)

1. Translate the remaining ~620 lines (start with `mastery.ts`, `QuestionLibraryView.tsx`, `UniversalEntityModal.tsx`, `BunpouDetailModal.tsx`, `PwaInstallModal.tsx`).
2. Verify the full letter-writing quiz flow in the browser and tune stroke leniency; add a proper letter outline check if the handwriting feels too strict.
3. Rewrite `GrammarChecklist` usage notes and `grammarHighlight` for English patterns.
4. Replace `universalSearch` romaji/kana logic with English tokenising and fuzzy matching; add tests.
5. Rewrite topic keywords for `deckBuilder` and the AI deck prompt (`aiDeckPrompt.ts`) in English.
6. Decide on the Castle Tower and dungeons: rebuild with English floors, or remove the code.
7. Connect your own Supabase project, then test sign-up, cloud save and the leaderboard.
8. Clean up the Japanese-shaped types (`JlptLevel`, `tower.ts`) and the leftover comments.
