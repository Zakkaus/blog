# Zakk Blog

**English** · Static site for https://zakk.au built with Hugo + Blowfish in English, 繁體中文, and 简体中文.
**繁體中文** · 使用 Hugo 與 Blowfish 主題打造的個人部落格，支援英文、繁體中文與簡體中文。

---

## Tech stack
- [Hugo](https://gohugo.io/) `v0.162.0` (extended) with the [Blowfish](https://blowfish.page/) theme `v2.103.0` (git submodule).
- Asset pipeline via Hugo Pipes (SCSS/JS minify) under `assets/`.
- Analytics: [cloudflare-stats-worker](cloudflare-stats-worker/) (`/api/count`, `/api/daily`).

## Content
- `content/_index.*.md` — home page copy per language.
- `content/posts/` — long-form posts (one folder per post; one Markdown file per locale).
- `content/about/`, `content/timeline/` — single pages.
- Static assets under `static/`.

## Running locally
```bash
git submodule update --init --recursive
hugo server --buildDrafts --disableFastRender
```
Visit http://localhost:1313/. Requires Hugo extended.

## Build & deploy
```bash
hugo --gc --minify
```
Output goes to `public/`. Cloudflare Pages rebuilds on `main`.

When updating the Blowfish theme, bump the submodule:

```bash
cd themes/blowfish
git fetch --tags
git checkout vX.Y.Z
cd ../..
git add themes/blowfish && git commit -m "chore: bump blowfish to vX.Y.Z"
```

## Analytics integration
- **Worker source:** `cloudflare-stats-worker/` — REST API and standalone dashboard.
- **Frontend script:** `assets/js/cloudflare-stats.js` calls the `https://stats.zakk.au` Worker API at page load. Override `API_BASE` to point at your own Worker.
- **Placeholder integration:** Blowfish templates render `views_` spans which the script fills in.
- **Site-wide stats:** `/api/stats` (no `url` param) returns site totals for both the timeline and the dashboard.
- **Standalone dashboard:** [stats.zakk.au](https://stats.zakk.au/) — PV/UV, top pages, daily trends, light/dark, English/繁中.

## SEO
- `static/robots.txt` carries standard `User-agent` / `Allow` / `Sitemap` directives.

## Folders
```
assets/        # JS / SCSS / images
config/        # Hugo configuration (multi-language)
content/       # Markdown content
layouts/       # Custom layouts and partials
static/        # Untouched static files
cloudflare-stats-worker/ # Analytics Worker (submodule)
```

## Contributing
Typos, translation tweaks, and automation improvements are welcome via Issues or PRs. Theme changes should go in the submodule upstream, not vendored here.

## License
- Blog content: CC BY-NC-SA 4.0.
- Code in this repository: MIT.
