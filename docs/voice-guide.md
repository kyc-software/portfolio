# Anthony AI assistant

## Outcome

Landing-page assistant answers from Anthony's curated Markdown profile. OpenAI
Realtime handles live speech over WebRTC. Convex owns anonymous weekly quota,
exact and semantic FAQ routing, reusable audio, prepared-question discovery, and
an asynchronously prepared FAQ-candidate queue. Browser never receives OpenAI keys
or Convex bridge secret.

Detailed diagrams and trust boundaries: [voice-cache-architecture.md](voice-cache-architecture.md).
Production findings and readiness: [voice-production-audit.md](voice-production-audit.md).

## Production setup

Production Convex deployment:

- Deployment: `fabulous-warbler-191`
- API URL: `https://fabulous-warbler-191.convex.cloud`
- HTTP bridge: `https://fabulous-warbler-191.convex.site`
- Dashboard: `https://dashboard.convex.dev/t/anthony-abramo/portfolio-2026/fabulous-warbler-191`

Generate one random bridge secret, then set these values.

Portfolio hosting environment:

```dotenv
OPENAI_API_KEY=sk-proj-your-key
CONVEX_SITE_URL=https://fabulous-warbler-191.convex.site
CONVEX_BRIDGE_SECRET=<random-secret>
```

Convex production environment:

```dotenv
OPENAI_API_KEY=sk-proj-your-key
BRIDGE_SECRET=<same-random-secret>
```

Do not prefix secrets with `VITE_`; Vite-prefixed values can become public.
`OPENAI_API_KEY` is required in both runtimes because portfolio server creates
Realtime sessions while Convex creates reusable Speech API audio and FAQ/query
embeddings.

After deploying catalog changes, provision production explicitly:

```bash
bunx convex run --prod assistant:provisionCatalog '{"force":false}'
bunx convex run --prod assistant:catalogStatus '{}'
```

Ready production status is 52 records and audio files, 51 prepared questions, 51
embeddings, and zero failures. Explicit provisioning keeps catalog work out of every
visitor session. Run same commands without `--prod` to keep development on same
51-question baseline; files and embeddings are generated inside each deployment.

Deploy later Convex changes with:

```bash
bunx convex deploy
```

## Local development

`bunx convex dev` creates/updates `.env.local` with development deployment URLs.
Add matching local bridge values:

```dotenv
OPENAI_API_KEY=sk-proj-your-key
CONVEX_BRIDGE_SECRET=<development-secret>
```

Set Convex development variables:

```bash
bunx convex env set BRIDGE_SECRET <development-secret>
bunx convex env set OPENAI_API_KEY <your-key>
bunx convex run assistant:provisionCatalog '{"force":false}'
bunx convex run assistant:catalogStatus '{}'
bun run dev
```

Both environments show remaining-question counter and Base UI explanation popover.
Development additionally shows model picker immediately left of quota. Prepared
answers show Prepared; development semantic hits additionally show Semantic for
routing verification.

## Runtime behavior

- Secure, HttpOnly, host-only visitor cookie persists anonymous identity.
- Visitor gets twenty uncached answers during seven-day window starting at first miss.
- Every turn first passes distributed Convex visitor and global burst limits. This
  includes exact prepared answers, so cached audio cannot be spammed through normal UI/API.
- FAQ lookup happens before quota charge: exact normalized alias first, then
  semantic intent. Cached answers cost no live-answer quota.
- Semantic routing uses `text-embedding-3-small`, one stored vector per FAQ,
  direct cosine comparison, a portfolio-subject gate, intent signals, confidence
  threshold, and runner-up margin. Lightweight metadata is loaded first; only
  signal-eligible vectors cross into semantic routing. This avoids vector-database
  overhead for 51 bounded intents and rejects unrelated or ambiguous questions.
- `Tony`, `he`, `him`, and `his` are treated as Anthony. Common pronoun questions
  use exact aliases; freer phrasings continue through semantic matching.
- Fifty-one prepared topics cover profile, skills, projects, leadership, location,
  availability, education, and contact. See
  [prepared-questions.md](prepared-questions.md).
- Chat initializes from Convex before attempting OpenAI Realtime. Cached greeting,
  quota, and prepared questions therefore remain usable when Realtime is unavailable
  or its budget is exhausted. Arbitrary typed and spoken questions stay disabled until
  Realtime connects.
- Chat footer always exposes a Base UI prepared-question collapsible. Its 51
  searchable questions load when the initialized panel auto-opens it beside greeting
  and only include FAQs whose stored audio is ready. First user turn collapses it;
  visitor can reopen it anytime. Selecting one follows same turn pipeline and never
  spends live-answer quota. Expanded results are capped below half chat height and
  scroll independently, so future 50+ question catalogs cannot hide conversation
  history.
- Prepared-question metadata is fetched once per page visit through a retryable,
  deduplicated promise; browser private caching remains a secondary layer.
- Stored MP3 plays locally while cached assistant text enters same Realtime history,
  preserving follow-up context.
- Missing MP3 still renders its prepared transcript; Realtime availability never gates
  prepared content.
- Common closing phrases route to a prepared goodbye with stored audio, preserve quota,
  and close the panel only after playback finishes.
- Cache misses reserve one credit atomically and use Realtime. Completed answers are
  recorded asynchronously, embedded, and grouped by intent. Two distinct visitors
  must ask a matching question before preparation begins.
- Candidate preparation runs after the response path, one worker at a time. It uses
  structured output grounded only in the versioned Markdown profile. New intents stage
  a 512-dimension embedding and MP3; existing intents stage aliases only. Every result
  requires manual approval before becoming searchable. Rejection, regeneration, and
  rollback remain available.
- Common microphone fillers are ignored without spending quota.
- Input transcription deltas render while visitor speaks. Inline status markers
  label conversation initialization and thinking without adding fake message
  bubbles.
- Full transcript remains scrollable until the conversation ends; no messages
  are discarded during an active session.
- Production fails closed when Convex is unavailable or misconfigured.
- Ending conversation closes WebRTC peer, data channel, microphone tracks, pending
  request, and both audio players. New click starts fresh context.

## Main parts

- `convex/schema.ts`: visitors, FAQs, candidates, and candidate occurrences.
- `convex/convex.config.ts` and `convex/rateLimits.ts`: Convex rate-limiter component
  plus visitor/global policies for turns, sessions, browsing, and candidate writes.
- `convex/faqCatalog.ts`: versioned production questions, answers, aliases, and signals.
- `convex/assistant.ts`: provisioning, readiness, atomic quota, and catalog reads.
- `convex/candidates.ts`: background capture, intent clustering, grounded proposal
  preparation, approval, rejection, regeneration, and rollback.
- `convex/speech.ts`: shared OpenAI Speech generation.
- `convex/anthonyProfile.generated.ts`: generated trusted profile snapshot and version.
- `scripts/sync-assistant-profile.ts`: Markdown-to-Convex profile synchronization.
- `convex/embeddings.ts`: official Embeddings API call and cosine similarity.
- `convex/routing.ts`: exact/semantic/Realtime decision pipeline.
- `convex/http.ts`: shared-secret HTTP bridge.
- `src/server/assistant-backend.server.ts`: cookie and Convex client boundary.
- `src/app/api.assistant.turn.ts`: browser cache/quota route.
- `src/app/api.assistant.initialize.ts`: quota and cached-greeting bootstrap route.
- `src/app/api.assistant.faqs.ts`: lazy prepared-question listing route.
- `src/app/api.assistant.candidate.ts`: completed miss logging.
- `src/server/realtime-session.server.ts`: prompt, validation, OpenAI handshake.
- `src/components/voice-assistant.tsx`: WebRTC, cache playback, context injection,
  quota UI, fallback behavior.
- `src/content/anthony-profile.md`: public knowledge source.

## Security and limits

- OpenAI keys remain server-only.
- Convex HTTP actions require bearer bridge secret.
- Cookie is opaque UUID with `Secure`, `HttpOnly`, `SameSite=Lax` in production.
- Convex mutation makes quota check/increment atomic across tabs and deployments.
- Convex rate-limiter component adds distributed visitor and global limits before
  expensive or repeatable work. Current policy: turns 12/minute with burst 2 per
  visitor; starts 4/10 minutes; panel bootstraps 12/10 minutes; prepared-list reads
  6/minute with burst 2; candidate writes 10/hour with burst 3. Candidate preparation
  is capped at three new intents per 24 hours, serialized globally, and retried at most
  three times. One candidate consumes one preparation allowance; retries do not.
  Global ceilings cover cookie rotation/distributed abuse.
- Deployment warning and hard-disable limits cap daily/monthly function calls,
  database I/O, egress, and action compute.
- User can erase browser data to receive new anonymous identity. Preventing this
  completely requires account identity or stricter network-level controls.
- Determined users can bypass normal per-turn UI routing through direct WebRTC data
  channel calls. Strict enforcement requires server-owned Realtime sideband control.
- Set OpenAI project usage limits as final budget ceiling.

## Verification

```bash
bun run verify
```

Automated tests cover FAQ normalization, semantic guards, cosine comparison, filler
filtering, Realtime events, session limiting, candidate clustering, grounded proposal
validation, profile synchronization, type safety, formatting, and production build.
Catalog tests enforce exactly 51 unique and complete baseline prepared questions.
Production status confirms all audio and embeddings exist; routing probes confirm
exact and semantic hits preserve quota. Live generation requires Convex
`OPENAI_API_KEY`.

Candidate operations require the same bridge secret and candidate ID:

```bash
bunx convex run candidates:listReady '{"secret":"<bridge-secret>"}'
bunx convex run candidates:approve '{"secret":"<bridge-secret>","candidateId":"<id>"}'
bunx convex run candidates:reject '{"secret":"<bridge-secret>","candidateId":"<id>"}'
bunx convex run candidates:regenerate '{"secret":"<bridge-secret>","candidateId":"<id>"}'
bunx convex run candidates:rollback '{"secret":"<bridge-secret>","candidateId":"<id>"}'
```

Add `--prod` only when reviewing production. Treat terminal history as sensitive because
these commands contain bridge secret. After profile edits, run
`bun run assistant:sync-profile` before verification and deployment.

## Official references

- [Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- [Realtime conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)
- [Text-to-speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- [Embeddings](https://developers.openai.com/api/docs/guides/embeddings)
- [Semantic search](https://developers.openai.com/api/docs/guides/retrieval#semantic-search)
- [Convex HTTP actions](https://docs.convex.dev/functions/http-actions)
- [Convex file storage](https://docs.convex.dev/file-storage/store-files)
- [Convex scheduled functions](https://docs.convex.dev/scheduling/scheduled-functions)
- [Convex rate limiting](https://docs.convex.dev/agents/rate-limiting)
- [Convex usage limits](https://docs.convex.dev/production/usage-limits)
- [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
