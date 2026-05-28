---
title: "Stats Dashboard"
translationKey: "stats-dashboard"
subtitle: "See real-time page views, visitors, and trends"
description: "The Cloudflare Stats Worker dashboard streams PV/UV metrics, trending posts, and daily trend charts directly from Cloudflare Workers + KV."
ShowToc: false
dashboardURL: "https://stats.zakk.au"
---
{{< lead >}}
This page shows the real-time analytics that power zakk.au, refreshed by Cloudflare Stats Worker with zero third-party cookies.{{< /lead >}}

## Site overview

{{< statsSummary
	totalViews="Total Views"
	totalVisitors="Total Visitors"
	todayViews="Today’s Views"
	todayVisitors="Today’s Visitors"
	totalViewsHint="All-time page views across every locale."
	totalVisitorsHint="Unique visitors (UV) across the entire site."
	todayViewsHint="Page views collected since 00:00 local time."
	todayVisitorsHint="Unique visitors recorded today."
>}}

## API status

{{< statsHealth title="API Status" powered="Powered by Cloudflare Workers · KV · D1" statusLabel="Current State" statusPlaceholder="Checking…" versionLabel="Version" okText="Normal" healthyText="Normal" errorText="Issue" >}}

## Daily traffic trend

{{< statsTrend
	title="Daily Traffic Trend"
	description="Switch between 7 / 30 / 90 day windows to explore PV and UV history."
	rangeLabel="Trend range"
	emptyText="No data yet."
	errorText="Unable to load chart."
>}}

## Top pages (Top 10)

{{< statsTop title="Top Pages (Top 10)" ctaLabel="Open full dashboard" ctaUrl="https://stats.zakk.au/" emptyText="No data yet." errorText="Unable to load top pages." >}}

{{< statsPageScripts >}}

## Build your own

- <a href="/en/posts/cloudflare-stats-worker-deploy/">Cloudflare Stats Worker Deployment &amp; Integration Guide</a>
- <a href="https://github.com/Zakkaus/cloudflare-stats-worker">GitHub repository</a>

