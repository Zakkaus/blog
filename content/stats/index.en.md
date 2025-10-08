---
title: "Stats Dashboard"
translationKey: "stats-dashboard"
subtitle: "See real-time page views, visitors, and trends"
description: "The Cloudflare Stats Worker dashboard streams PV/UV metrics, trending posts, and daily trend charts directly from Cloudflare Workers + KV."
ShowToc: false
dashboardURL: "https://stats.zakk.au"
---
{{< lead >}}
This dashboard is powered by Cloudflare Stats Worker, delivering privacy-friendly PV/UV metrics directly from Cloudflare Workers and KV with no third-party cookies.{{< /lead >}}

## What powers the dashboard?

- Cloudflare Workers serve the `/api/*` endpoints and the dashboard frontend from a single deployment.
- KV (plus optional D1) keeps locale-aware PV/UV counters in sync across every language path.
- The Hugo Blowfish theme uses a reusable shortcode to embed the dashboard while preserving native styling.

## What you can monitor

- Today’s PV / UV cards with day-over-day comparison.
- Seven and thirty-day trend charts for traffic patterns.
- Top content rankings highlighting what’s resonating right now.
- Dedicated modules for referrers, device mix, and timeline counters.

## Build your own

- <a href="/en/posts/cloudflare-stats-worker-deploy/">Cloudflare Stats Worker Deployment &amp; Integration Guide</a>
- <a href="https://github.com/Zakkaus/cloudflare-stats-worker">GitHub repository</a>

{{< statsDashboard url="https://stats.zakk.au" heightClass="h-[1200px]" >}}

