---
slug: cloudflare-stats-worker-deploy
title: "Cloudflare Stats Worker - Privacy-First Analytics Dashboard"
date: 2025-01-08
tags: ["Cloudflare", "Analytics", "Workers", "Privacy"]
categories: ["Infrastructure"]
description: "Deploy your own privacy-focused analytics dashboard like stats.zakk.au with Cloudflare Workers"
translationKey: "cloudflare-stats-deploy"
authors:
  - "Zakk"
---

Want real-time website analytics without Google Analytics? **Cloudflare Stats Worker** is a privacy-first analytics solution that runs entirely on Cloudflare's edge network.

Check out the live demo: **[stats.zakk.au](https://stats.zakk.au/)**

![Stats Dashboard](stats-dashboard.webp)

## Why Cloudflare Stats Worker?

- **Privacy-First**: No cookies, IP addresses are SHA-256 hashed and truncated
- **Zero Cost**: Runs on Cloudflare's free tier for most personal sites
- **Edge Performance**: Built on Cloudflare Workers + KV for global low-latency access
- **Multi-Language Support**: Automatically normalizes paths across different language versions
- **Complete Solution**: API endpoints + standalone dashboard in a single Worker

## Key Features

### Real-Time Analytics
- Today's PV/UV counters with live updates
- Historical trends for 7/14/30 days
- Top 10 most popular pages ranking

### Beautiful Dashboard
- Glass-morphism design with dark/light theme support
- Responsive layout for mobile and desktop
- Multi-language UI (English/Chinese)
- Accessible at your custom domain (e.g., stats.example.com)

### Developer-Friendly API
- RESTful API endpoints for custom integrations
- Batch operations for efficient data queries
- Health check endpoint for monitoring

## Quick Deployment

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
./scripts/install.sh
```

The script will:
1. Verify Wrangler authentication
2. Create KV namespace and update configuration
3. Deploy Worker and bind to your subdomain
4. Run health checks

## Step 7: Access Your Analytics Dashboard

After deployment completes, visit your dashboard directly:

```
https://stats.example.com/
```

You'll see a beautiful analytics interface just like [stats.zakk.au](https://stats.zakk.au/) with:

- **Real-time metrics**: Today's PV/UV cards with instant updates
- **API health status**: Visual indicator showing system status
- **Trend charts**: Interactive graphs for 7/14/30-day periods
- **Top pages**: Ranked list of your most popular content
- **Theme toggle**: Switch between dark and light modes
- **Language selector**: English and Chinese interface options

The dashboard is completely standalone - no embedding needed, just share the URL!

## Free Tier Limits

**Cloudflare Workers Free Plan**:
- 100,000 requests/day
- 10ms CPU time per request
- Perfect for personal blogs and small sites

**Cloudflare KV Free Plan**:
- 1 GB storage
- 100,000 reads/day
- 1,000 writes/day

For most personal websites, the free tier is more than enough!

## API Endpoints

Once deployed, you can access these endpoints:

```bash
# Health check
curl https://stats.example.com/health

# Page view count
curl "https://stats.example.com/api/count?url=/posts/example/"

# Overall statistics
curl https://stats.example.com/api/stats

# Daily trends
curl https://stats.example.com/api/daily
```

## Architecture

```
Browser → Worker (stats.example.com)
          ├── /api/*     → Statistics API
          ├── /*         → Dashboard Static Files  
          └── Storage    → Cloudflare KV
```

## FAQ

### Why not use Google Analytics?
Self-hosted solutions give you complete data control, no cookies required, and won't be blocked by ad blockers.

### Can I customize the dashboard?
Yes! The dashboard source is in the dashboard/ folder. Modify the HTML/CSS/JS to match your brand.

### How do I backup my data?
Use the provided backup scripts to export KV data to R2 or GitHub periodically.

---

This is the same stack powering [stats.zakk.au](https://stats.zakk.au/). After deployment, you'll have:

✅ A standalone analytics dashboard at your custom domain  
✅ Complete REST API for statistics  
✅ Privacy-focused tracking with no cookies  

For questions or issues, visit [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues).
