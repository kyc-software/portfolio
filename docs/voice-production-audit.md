# Voice assistant production audit

Date: 2026-08-04  
Release confidence: **4.5/5 for portfolio-scale production**

## Verified production state

- Convex catalog version `2026-08-04-50-v3` deployed.
- 50 prepared questions and one greeting present.
- 51/51 reusable MP3 files ready; zero failed.
- 50/50 `text-embedding-3-small` vectors ready at 512 dimensions; zero failed.
- Production Convex limits active: daily 10k/25k warning-disable function calls,
  1/2 GB database I/O, 1/2 GB egress, and 1/2 GB-hours action compute; monthly
  100k/250k calls, 5/10 GB database I/O, 10/20 GB egress, and 1/3 GB-hours compute.
- Exact and semantic production probes returned stored answer/audio without spending quota.
- Measured Convex routing: 13–23 ms for warm exact hits; about 298 ms for a semantic
  hit including OpenAI question embedding.
- Formatting, types, 12 automated tests, and production build pass.

## Minor improvements shipped

- Moved catalog reconciliation out of visitor startup into explicit deployment provisioning.
- Added catalog version, readiness report, failure counts, and safe retry command.
- Regenerate audio when verified answer changes; remove superseded stored audio after success.
- Regenerate embeddings when intent or embedding version changes.
- Reduced stored vectors from default 1,536 dimensions to 512.
- Reduced per-turn FAQ transfer from about 510 KB to about 25 KB of metadata, then
  loads only signal-eligible vectors. One-candidate probe transferred about 10 KB.
- Staggered one-time generation jobs to avoid unnecessary request bursts.
- Skip paid semantic embedding after visitor quota reaches zero while keeping exact
  prepared questions available.
- Expanded common paraphrases found during production probes, including recent
  projects, years of experience, education, availability, contact, and delivery coaching.
- Added automated catalog count, uniqueness, completeness, and embedding-version checks.
- Added official Convex rate-limiter component before all repeatable assistant paths:
  session initialization, every prepared/live turn, prepared-list reads, and candidate writes.
- Layered per-visitor limits with sharded global ceilings so deleting anonymous identity
  cannot remove aggregate protection.
- Added production daily/monthly warning and hard-disable thresholds for calls,
  database I/O, egress, and action compute.
- Deduplicated and cached prepared-question metadata for one page visit without adding
  query-state machinery.
- Split Convex bootstrap from OpenAI session authorization. Panel now renders cached
  greeting, quota, and all prepared questions first; Realtime failure leaves prepared
  text and stored audio fully usable.
- Synchronized development with production baseline: 51 audio files and 50 embeddings
  ready with zero failures.

## Major improvements not implemented

These need architectural or product decisions:

1. **Strict quota enforcement.** Browser owns Realtime data channel and a determined user
   can send `response.create` outside normal turn route. Hard enforcement needs server
   sideband control or server-owned Realtime orchestration.
2. **Strict stored-audio enforcement.** Issued Convex storage URLs can be replayed until
   expiry. Global URL-issuance limits and deployment egress hard limits contain exposure;
   authenticated per-play control needs an edge/server audio proxy and would add latency.
3. **Identity-resistant distributed abuse.** Anonymous cookie can be erased. Global
   Convex limits contain aggregate traffic, but strong actor identity needs sign-in or
   edge/network signals. Convex recommends a separate edge for custom network policies.
4. **Measured semantic quality.** Production probes pass representative cases, but no
   labeled precision/recall suite exists for all intents. Threshold changes should wait for
   a real evaluation corpus built from candidate logs.
5. **Prompt retrieval.** Realtime receives full roughly 4,000-word profile. Stable prompt
   prefix and retention-ratio truncation help caching, but selective retrieval could reduce
   recurring input cost and latency. This is a larger grounding architecture change.

## Operations before public launch

- Set OpenAI project budget alerts and hard usage limits.
- Monitor configured Convex deployment limits, function concurrency, database bandwidth,
  file bandwidth, error rate, and action duration.
- Verify production portfolio environment has `OPENAI_API_KEY`, `CONVEX_SITE_URL`, and
  `CONVEX_BRIDGE_SECRET`; Convex needs matching `BRIDGE_SECRET` plus `OPENAI_API_KEY`.
- Keep catalog readiness at 51 audio / 50 embeddings / zero failures before each release.
- Review cache-miss candidates and logs; promote only verified, recurring intents.

## References

- [OpenAI Realtime with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- [OpenAI Realtime conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)
- [OpenAI text-to-speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- [OpenAI embeddings](https://developers.openai.com/api/docs/guides/embeddings)
- [OpenAI safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [Convex actions](https://docs.convex.dev/tutorial/actions)
- [Convex best practices](https://docs.convex.dev/understanding/best-practices)
- [Convex abuse protection](https://docs.convex.dev/production/abuse-protection)
- [Convex limits](https://docs.convex.dev/production/state/limits)
- [Convex usage limits](https://docs.convex.dev/production/usage-limits)
- [Convex log streams](https://docs.convex.dev/production/integrations/log-streams)
