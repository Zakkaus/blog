---
title: "Cloudflare Stats Worker Integration Guide"
slug: "cloudflare-stats-worker-guide"
translationKey: "cloudflare-stats-guide"
date: 2025-10-08T00:00:00+00:00
lastmod: 2025-10-08T00:00:00+00:00
description: "How this blog deploys Cloudflare Stats Worker, connects the dashboard, and wires Hugo Blowfish templates for analytics."
authors:
  - "Zakk"
categories:
  - "Infrastructure"
tags:
  - "Cloudflare"
  - "Analytics"
  - "Hugo"
  - "Blowfish"
  - "Workers"
seo:
  title: "Cloudflare Stats Worker Setup"
  description: "Deploy Cloudflare Stats Worker, configure a custom domain, and embed the stats dashboard in the Blowfish theme."
---

> The full deep-dive for this article is currently available in Traditional Chinese: <a href="/zh-tw/posts/cloudflare-stats-worker-guide/">Cloudflare Stats Worker 統計系統完全指南</a>. An English translation is in progress.

## Quick Overview

- Deploy the Worker with `./scripts/install.sh` to create the KV namespace and bindings automatically.
- Point a custom domain (e.g. `stats.example.com`) to the Worker using Cloudflare's Zones → Workers Routes.
- Copy the `assets/js/cloudflare-stats.js` helper into your Hugo site and add the script via `extend-head.html`.
- Override Blowfish templates (`_default/list.html`, `_default/single.html`, `partials/meta/views.html`, `partials/meta/likes.html`) to normalize slugs before they reach the API.
- Embed the dashboard with the new `stats` page (layout `stats/stats-dashboard`) or simply use an `<iframe>` pointing at the Worker.

Stay tuned for the full English write-up!
