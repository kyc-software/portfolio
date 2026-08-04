# Anthony AI assistant

## Outcome

Landing-page assistant answers from Anthony's curated Markdown profile. OpenAI
Realtime handles live speech over WebRTC. Convex owns anonymous weekly quota,
exact and semantic FAQ routing, reusable audio, prepared-question discovery, and
cache-candidate analytics. Browser never receives OpenAI keys or Convex bridge
secret.

Detailed diagrams and trust boundaries: [voice-cache-architecture.md](voice-cache-architecture.md).

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

After setting Convex variables, start one conversation. Idempotent initialization
seeds seven FAQ records and schedules seven MP3 files. Failed generation retries on
next initialization. Check `faqs` table for `audioStatus: "ready"` and populated
`audioStorageId`.

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
bun run dev
```

Both environments show remaining-question counter and Base UI explanation popover.
Development additionally shows model picker immediately left of quota. Prepared
answers show Prepared; development semantic hits additionally show Semantic for
routing verification.

## Runtime behavior

- Secure, HttpOnly, host-only visitor cookie persists anonymous identity.
- Visitor gets ten uncached answers during seven-day window starting at first miss.
- FAQ lookup happens before quota charge: exact normalized alias first, then
  semantic intent. Cached answers cost no live-answer quota.
- Semantic routing uses `text-embedding-3-small`, one stored vector per FAQ,
  direct cosine comparison, a portfolio-subject gate, intent signals, confidence
  threshold, and runner-up margin. This avoids vector-database overhead for six
  searchable intents and rejects unrelated or ambiguous questions.
- `Tony`, `he`, `him`, and `his` are treated as Anthony. Common pronoun questions
  use exact aliases; freer phrasings continue through semantic matching.
- Seven cached topics cover greeting, identity, profile overview, Next.js experience,
  latest projects, location, and working style.
- Chat footer always exposes a Base UI prepared-question collapsible. Its six
  searchable questions load when the ready session auto-opens it beside greeting
  and only include FAQs whose stored audio is ready. First user turn collapses it;
  visitor can reopen it anytime. Selecting one follows same turn pipeline and never
  spends live-answer quota. Expanded results are capped below half chat height and
  scroll independently, so future 50+ question catalogs cannot hide conversation
  history.
- Stored MP3 plays locally while cached assistant text enters same Realtime history,
  preserving follow-up context.
- Missing MP3 falls back to exact Realtime speech, so feature remains usable during
  setup or Speech API failure.
- Cache misses reserve one credit atomically, use Realtime, then upsert question and
  answer into `candidates` for later FAQ review. Candidates never auto-promote.
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

- `convex/schema.ts`: visitors, FAQs, candidates.
- `convex/assistant.ts`: seed, atomic quota, candidate upsert, Speech and stored
  intent-embedding generation.
- `convex/embeddings.ts`: official Embeddings API call and cosine similarity.
- `convex/routing.ts`: exact/semantic/Realtime decision pipeline.
- `convex/http.ts`: shared-secret HTTP bridge.
- `src/server/assistant-backend.server.ts`: cookie and Convex client boundary.
- `src/app/api.assistant.turn.ts`: browser cache/quota route.
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
- Existing per-process session burst limit remains four starts per ten minutes per
  IP-derived identifier.
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
filtering, Realtime events, session limiting, type safety, formatting, and production
build. Convex bridge validation additionally confirms exact and semantic hits keep
quota while near misses reserve one credit. Live audio and embedding generation
require Convex `OPENAI_API_KEY`.

## Official references

- [Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- [Realtime conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)
- [Text-to-speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- [Embeddings](https://developers.openai.com/api/docs/guides/embeddings)
- [Semantic search](https://developers.openai.com/api/docs/guides/retrieval#semantic-search)
- [Convex HTTP actions](https://docs.convex.dev/functions/http-actions)
- [Convex file storage](https://docs.convex.dev/file-storage/store-files)
- [Convex scheduled functions](https://docs.convex.dev/scheduling/scheduled-functions)
- [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
