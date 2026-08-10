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

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Bhajan Marg Wisdom AI — future ingestion pipeline

This MVP ships the full UI and data model with an honest, empty knowledge base:
official sources are registered as **metadata only**, and answers correctly return
`INSUFFICIENT SOURCE EVIDENCE` until real ingestion is authorised and run. Synthetic
demo fixtures (clearly labelled, never attributed to Maharaj Ji) exist only to preview
the citation UI.

### Data model (Supabase/Postgres ready)
`sources` → `content_items` → `transcript_segments` → (`segment_topics` ↔ `topics`),
plus `qa_pairs`, `citations`, `ingestion_jobs`, `answer_audits`. See `src/data/types.ts`;
each interface maps 1:1 to a table. `transcript_segments.embedding` becomes
`vector(3072)` with pgvector + an HNSW index over a `halfvec` cast.

### Pipeline stages
1. **Source registration** — URL, platform, OFFICIAL vs THIRD-PARTY DISCOVERY flag,
   reliability tier, copyright/usage notes, and explicit permission state. Nothing is
   fetched before permission is recorded.
2. **YouTube metadata/transcript ingestion where permitted** — enumerate uploads, store
   title, `published_at`, duration, language, canonical URL; ingest public captions only
   where the rights holder permits. Media is never re-hosted.
3. **Speech-to-text fallback** — only for owned or explicitly authorised media, with
   language hints (hi/hi-en) and word-level timings preserved for citations.
4. **Web article parsing** — readability extraction of Bhajan Marg / Radha Keli Kunj
   articles, keeping canonical URL and fetch date on every excerpt.
5. **Instagram metadata + manual transcript intake** — metadata only under platform terms;
   transcripts entered manually by a reviewer where compliant.
6. **Chunking at question–answer boundaries** — segment on speaker/question turns rather
   than fixed windows, so a citation always contains a complete answer; store
   `start_seconds`/`end_seconds`.
7. **Multilingual normalisation** — Devanagari ↔ transliteration folding into
   `text_normalized` so Hinglish queries match Hindi transcripts.
8. **Dedupe hashes** — `content_hash` per item and `segment_hash` per chunk to prevent
   re-indexing reuploads and cross-channel duplicates.
9. **Embeddings** — `google/gemini-embedding-001` (3072-dim) via the AI gateway from
   server-side code, with `embedding_model` stored for safe re-embedding on model change.
10. **Retrieval + reranking** — vector search over topic-filtered candidates, then a
    cross-encoder rerank; confidence thresholds decide DIRECT vs SYNTHESIZED vs refusal.
11. **Citation validation** — every quote and timestamp is re-checked against stored
    segment text; a failing citation is dropped and the answer downgraded rather than shown.
12. **Human review** — reviewers approve segments, Q&A pairs and topic labels before
    publication; `answer_audits` logs every generated answer, its mode, citations and
    safety flags for ongoing spot checks.

### Safety rules encoded in `src/lib/rag.ts`
Retrieve first; refuse when evidence is weak; never fabricate quotes or timestamps; never
speak as Maharaj Ji; and for medical, legal, financial, self-harm or crisis questions,
lead with professional/emergency guidance and treat sourced material as supplementary only.
