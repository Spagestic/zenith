# Zenith

Turn real-world news into kid-friendly cartoon stories in minutes.

Zenith is a hackathon project that converts a topic or news URL into a short multi-scene cartoon video pipeline:

1. ingest sources with Exa,
2. generate kid-friendly scenes/script/characters with MiniMax,
3. generate scene image prompts,
4. render start/end frames,
5. chain videos per scene,
6. play the full story.

Built for HackTheEast 2026.

## What works now

- Authenticated users can create workflow tasks from the header dialog.
- URL/topic ingestion with Exa (`getContents` + `searchAndContents`) and paywall fallback search.
- Structured task pipeline persisted in Convex with stage/status tracking.
- Story planning with MiniMax text generation.
- Prompt-pack generation with JSON repair fallback.
- Scene image generation from start/end frame prompts.
- Scene video generation with first/last-frame chaining and polling.
- Task detail page with:
  - source, story plan, prompt pack, image/video asset sections
  - stage-aware next action button
  - "Play Full Story" sequential playback experience

## Current workflow stages

- `queued`
- `ingesting`
- `ingested`
- `planning`
- `planned`
- `prompting`
- `prompted`
- `rendering`
- `rendered`
- `failed`

## Tech stack

- Next.js (App Router) + TypeScript
- Convex + Convex Auth
- MiniMax (chat, image, video, music, speech APIs)
- Exa (search/scrape/news retrieval)
- Tailwind + shadcn/ui
- Bun

## Key files

- `convex/schema.ts` - workflow task schema and status model
- `convex/workflowTasks.ts` - workflow API re-export barrel
- `convex/workflowTasks.actions.ts` - orchestration actions
- `convex/workflowTasks.mutations.ts` - task state persistence mutations
- `convex/workflowTasks.queries.ts` - task queries
- `convex/workflow/helpers.ts` - normalization/parsing helpers
- `convex/workflow/validators.ts` - Convex validators
- `components/workflow/CreateTaskDialog.tsx` - quick task launcher
- `app/(protected)/tasks/[taskId]/page.tsx` - task details + full story playback

## Getting started

### Prerequisites

- Bun
- Convex account/deployment
- Exa API key
- MiniMax API key

### Setup

```bash
bun install
bunx convex dev
bun run dev
```

### Environment variables

Create `.env.local`:

```env
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

EXA_API_KEY=your-exa-api-key

MINIMAX_API_KEY=your-minimax-api-key
MINIMAX_GROUP_ID=your-group-id
```

## In progress / next

- Background music generation + timeline mixing
- Character dialogue TTS generation
- Final composed export (single merged output file)
- Optional style presets per task

## License

MIT
