---
title: "Cloudflare Stats Worker Deployment Guide"
date: 2025-01-08
draft: false
description: "Deploy your own analytics dashboard like stats.zakk.au with Cloudflare Workers"
tags: ["Cloudflare", "Analytics", "Hugo"]
---

Want real-time PV/UV tracking without Google Analytics? **Cloudflare Stats Worker** packages both API and standalone dashboard website in a single Worker. Check out the live demo at [stats.zakk.au](https://stats.zakk.au/)!

## Why Cloudflare Stats Worker

- Privacy-first: No cookies, IP hashing
- Single Worker deployment: Get both `/api/*` endpoints and dashboard
- Multi-language support: Automatically normalizes paths
- Free tier friendly: Cloudflare free plan covers most personal blogs
- Hugo Blowfish integration: Ready-to-use scripts

## Dashboard Highlights

Visit **[stats.zakk.au](https://stats.zakk.au/)** to see it in action!

- Real-time PV/UV cards
- Top articles ranking
- 7/30-day trend charts
- Dark/light theme support
- Standalone deployment at your custom domain

## Quick Start

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
./scripts/install.sh
```

## Access Your Dashboard

After deployment, visit your dashboard directly:

```
https://stats.example.com/
```

**Optional: Embed in Blog**

If you want to embed the dashboard in your blog (like my `/stats/` page), use an iframe or the provided Hugo shortcode.

---

This guide powers [stats.zakk.au](https://stats.zakk.au/). After deployment, you'll have a standalone dashboard website, complete stats API, and real-time PV/UV display in Hugo articles.

For issues, visit [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues).
