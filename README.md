# Anthony Abramo | Portfolio

Static-first portfolio built with TanStack Start, React 19, shadcn/Base UI, and
Tailwind CSS.

## Run

Requires Node 22.14+.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run verify
```

## Replace placeholder content

- Site identity and projects: `src/content/portfolio.ts`
- Hero portrait: `public/assets/portrait-new-transparent-1800.webp`
- Social preview: `public/og.png`
- Canonical production URL: set `VITE_SITE_URL`

External iframe projects also need their origins added to `frame-src` in
`vite.config.ts`. Sites that deny framing through CSP or `X-Frame-Options` must
remain case studies.

## Architecture

- Initial route is statically prerendered.
- Hero portrait is present in initial HTML.
- Project embeds mount only after selection.
- Nitro provides deployment output and Vercel preset auto-detection.

Deployment intentionally excluded. Output is ready for user-managed Vercel hosting.
