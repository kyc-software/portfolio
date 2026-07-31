# Anthony Abramo | Portfolio

Static-first portfolio built with TanStack Start, React 19, shadcn/Base UI, and
Tailwind CSS. Bun handles dependencies, scripts, and runtime.

## Local development

Requires Bun 1.3+.

```bash
bun install
bun run dev
```

## Verify and build

```bash
bun run verify
```

Production output is written to `.output`:

```bash
bun run build
bun run start
```

## Content

- Site identity and projects: `src/content/portfolio.ts`
- Hero portrait: `public/assets/portrait-new-transparent-1800.webp`
- Social preview: `public/og.png`
- Canonical production URL: set `VITE_SITE_URL` before building

External iframe projects also need their origins added to `frame-src` in
`vite.config.ts`. Sites that deny framing through CSP or `X-Frame-Options` must
remain case studies.

## Architecture

- Initial route is statically prerendered.
- Hero portrait is present in initial HTML.
- Project embeds mount only after selection.
- Nitro provides deployment output and Vercel preset auto-detection.

## License

Source code is available under the [MIT License](LICENSE). Reuse, modification,
and redistribution are welcome.

Anthony Abramo's portrait is not covered by the MIT License. Copying, modifying,
redistributing, publishing, or using `public/assets/portrait-new-transparent-1800.webp`
or derivatives of that portrait is forbidden. See [ASSETS-LICENSE.md](ASSETS-LICENSE.md).
