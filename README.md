# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Offline course reader (`/khoa-hoc`)

The course reader plays your own PDF + MP3 material inside the app, so studying
never needs a second tab or a file manager.

Media is **not** in this repository (`public/course` is gitignored). Point the
ingest script at your own folder to wire it up:

```sh
npm run ingest:course -- --src "/path/to/Course Folder" --id my-course --title "My course" --audio 48k
```

The script hardlinks the media into `public/course/<id>` (instant, no extra disk
usage on the same volume — pass `--copy` to force real copies) and writes a
manifest to `src/data/courses/<id>.json`. Re-running it is idempotent.

`--audio 48k` re-encodes audio to mono AAC at that bitrate. Lecture audio is
usually stereo-encoded speech, so this cuts it ~3x with no audible loss and is
worth it when the media has to travel over a network. Drop the flag to keep the
originals byte-for-byte.

It expects `<Section>/<Lesson>/[<Group>/]<file>` and infers roles from filenames:
`DE*`/`ĐỀ*` → question, `DA*`/`ĐA*`/`*KEY*` → answer, other PDFs → theory, audio
by extension. Folders that only mean "media lives here" (`File nghe`, `Audio`,
`Tài liệu`) are folded away so exercise folders keep their labels.

Register a new manifest by importing it in `src/routes/khoa-hoc.tsx`.

### Answer sheet and grading

Ingest also reads the _shape_ of each practice test out of the worksheet and
stores it as `exam` on the group: how many questions, how many options (3 for
TOEIC Part 2, 4 elsewhere), and the time limit the original platform allowed
("14m 49s" printed on page 1). The reader draws a matching A/B/C/D sheet beside
the PDF, with a countdown that keeps running across reloads and lesson changes.

Each of the two PDFs is authoritative about something different: the answer key
covers every question so its count is the one to trust, while the time limit only
appears on the question paper. Both get read.

Which option is correct is not stated in the text of these keys — it is drawn as
a bitmap beside the option: a green tick for the answer, a red cross for a wrong
pick, an empty circle otherwise. Ingest reads it by tracking the transform matrix
to place each bitmap and classifying it by mean colour, then tying it to the
option row directly to its right. A letter is only accepted when exactly one
option on that question carries a tick, so an unrecognised layout yields nothing
rather than a wrong answer.

Two guesses were measured and rejected on the way here. Matching the option text
against the explanation identifies the answer for only 31% of questions and
varies from 0% to 75% between tests, which is far too weak to grade against or
even to warn about — a warning that fires on a correct key most of the time
teaches you to ignore it. And none of these keys prints a textual answer list.

When every position of a test is recovered, the key is written to `exam.key` as
one string (index 0 being question 1) and the answer sheet grades with nothing
typed at all. A partial read is discarded rather than stored: a key with a hole
would shift every answer after it and mark a correct paper wrong.

You can still paste a key by hand (any format: `CABD…`, `1.C 2.A`; digits and
punctuation are ignored), and a typed key always overrides the extracted one, so
a misread is correctable.

Four layout details decide how much of this works, and each was a bug first.
Coverage went 38 → 60 → 75 → 82 of 88 as they were found.

- Part 6 blocks are printed twice, once inline in the passage without markers and
  again expanded with them, so a question number may be re-read — but only when
  the copy already held carries no markers at all.
- Part 1 and 2 options have no text whatsoever, just "(A)" beside a photo or a
  recording, so the usual "an option must have text" guard skips them. A marker
  bitmap next to the row is accepted as proof instead.
- Marker rows come in three shapes: `Câu 3`, `Câu 3/40` and `Câu 1 - 10 /10`.
  Matching anything looser than those three lets an explanation mentioning
  "Câu 5" open a question and shift every number after it.
- Some Part 1 and 2 keys print one marker for the whole paper and then nothing
  but option blocks, so a marked "A" has to stand in for the missing boundary.
  That inference is enabled **per document** — only when there are no numbered
  stems and at most two marker rows — because switching it on everywhere fixed
  five tests and broke four others.

The six tests still without a key fall back to manual entry. Three are physically
impossible (two have no answer PDF, one is a scan) and three have a one- or
two-question gap from a layout quirk unique to that file; each would need its own
special case, which is not worth risking the 82 that work.

Saving a graded test does two things. It records a score in the star map —
because these tests aren't full-length parts (10 questions for Part 1 vs 6 in the
real exam), the ratio is what carries over: `round(correct / total *
part.questions)`, filed against `goal700` through the same `recordScore` path the
map's own score lessons use. Part 5 and 6 share a folder here, so they're told
apart by the lesson title.

It also appends to a review log keyed by _topic_, derived from the lesson title:
"Bài thi online 2 - Đại từ (1)" and "Thi online 1. Đại từ (2)" both reduce to
"Đại từ", so repeated attempts on one grammar point aggregate into a single miss
rate. Plain part tests roll up to "Part 4". The sidebar's second tab ranks topics
by miss rate; clicking one searches the lesson list for it. Re-grading a test
replaces its entry rather than double-counting the same questions.

Note that `splitOrder` in the ingest script normalises titles to NFC. macOS
returns decomposed filenames, where "à" is "a" plus a combining mark, and the
Vietnamese prefix matching above silently fails against that form.

### Review cards from wrong answers

Ingest also lifts individual questions out of machine-readable answer keys into
`src/data/courses/<id>.questions.json`, which the reader imports dynamically —
it is larger than the manifest and only needed once a test has been graded.

Only fill-in-the-blank questions are kept. Requiring a blank in the stem is what
excludes listening questions, which are unanswerable without their audio, and
Part 7 items, which lose their reading passage — no part numbers are hard-coded.
The blank is written as underscores in some keys and as an ellipsis run
("…………for the money management seminar") in others; both are recognised and
normalised to one form.

Parsing fails closed: a question only opens on a number that continues the
sequence, and the whole exam is dropped unless the numbers come out contiguous,
because pairing a stem with another question's options would teach a wrong
answer. `npm run diagnose:questions -- <course-id>` reports, per test, whether it
produced cards and if not which check rejected it — useful when adding a course
whose keys are laid out differently.

The shared reader lives in `scripts/lib/course-pdf.mjs` precisely so the
diagnostic and the ingest can't drift apart. A throwaway probe that reimplements
the parsing will agree with itself and disagree with what ships.

Two layout details this handles, both of which silently corrupt output if
ignored. Some keys emit each Vietnamese diacritic as its own glyph run, so "phân
từ" arrives as "phân t" + "ừ"; runs are joined using the gap between one run's
end and the next one's start rather than a blanket space. And explanations often
walk back through every option ("A.Invite: động từ nguyên thể"), so a lettered
line after the explanation starts is prose, not a new question.

Pressing "Tạo thẻ ôn" turns each wrong answer into a cloze card in _Thẻ của
tôi_ — sentence on the front, correct option plus explanation on the back,
translation as the example. The correct letter comes from the key you typed, not
from the PDF, so re-running after fixing a mistyped key **replaces** the existing
cards rather than skipping them (`upsertMyCards`).

One quirk worth knowing: the worksheet fonts map their f-ligatures to U+0000, so
"office" arrives as `o\0ce`. `fixLigatures` restores the recurring words and
falls back to "fi"; without it the text renders with holes.

### Practice runs (`Luyện`)

Because the answers were recovered, the extracted questions can be practised
directly — no PDF open, no key to type. The lesson header offers a run drawn from
the current test, and each row of the review log offers one pooled across every
test that drilled that topic.

### What to do next

`planActions` in `src/lib/course-plan.ts` ranks the next step from the data
already on hand, worst-understood first: the topic you miss most (only above a
30% miss rate over at least 10 questions, so a single bad test doesn't derail
you), then the first test never graded, preferring one that grades itself, then
simply the next unfinished lesson. It shows up at the top of the reader's
sidebar.

Every suggestion carries its own evidence — "Sai 63% ở chủ đề này (19/30 câu)"
rather than just "do this" — because a recommendation you can't sanity-check is
one you learn to ignore.

The home page shows the same headline in `TodayCard`, read from a small summary
in `localStorage` that the reader leaves behind. That avoids pulling the whole
manifest into the landing page for one line of text, and it can't go stale: only
the reader can change what the plan is derived from.

### Practice mechanics

The quiz reuses the star map's own `QuizSession`, so option order is shuffled and
questions you previously missed come back first. Its history is kept separately
from the map's (`bdi-course-quiz`) and practice results deliberately do **not**
feed the TOEIC estimate: the run is untimed and repeatable, and folding it in
would inflate the score. The timed answer sheet remains what records a score.
Finishing a run offers to turn the misses into cards, same as the worksheet path.

### Listening files on the answer sheet

Part 1–4 recordings are matched to question numbers from the file name at
runtime (`audioByQuestion` in `src/lib/course-audio.ts`), not at ingest:

- a range (`Câu 7 - 9`, `Câu 1- 3`) covers every question in that span — one
  Part 4 talk is one file
- a single number (`07`, `01-1`, `01 (1)`, `Câu 5`) covers that question only
- a whole-test file (`Test 01_mp3`, `File nghe Thi Online - Part 4 (3)`) is left
  unmapped rather than guessed at, so the dock still plays it as a full playlist
  but the sheet does not show a per-question play button

Where a match exists, each row of the sheet has a play control, and after
grading, “Nghe lại N câu sai” narrows the dock to those recordings (with an X on
the dock to restore the full list). Switching lesson or exercise clears the
filter.

### Where the reader looks for files

On load it probes `public/course/<id>` first and falls back to
`VITE_COURSE_BASE/<id>` (see `.env`). Nothing to configure per environment: local
dev reads from disk (fast, works offline), a deployed build reads from the CDN
since the media never enters git, and a fresh clone works before anyone has run
the ingest. If neither has the files, the reader says so instead of showing empty
frames.

To publish the media to the CDN after an ingest:

```sh
npm run deploy:course-media
```

That clones `public/course` next to `scripts/course-cdn/firebase.json` (Firebase
Hosting refuses a public dir outside its project directory) and deploys it to the
site named in that config. The files are served publicly but under an unguessable
site name and with `X-Robots-Tag: noindex`, so keep the URL to yourself if the
material isn't yours to share.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
