---
title: "统计监控仪表板"
translationKey: "stats-dashboard"
subtitle: "即时掌握全站流量走势"
description: "Cloudflare Stats Worker 仪表板实时展示 PV / UV、热门内容与每日趋势，数据直接来自 Cloudflare Workers + KV。"
ShowToc: false
dashboardURL: "https://stats.zakk.au"
---
{{< lead >}}
此页展示 zakk.au 的实时统计数据，全部由 Cloudflare Stats Worker 透过 Cloudflare Workers、KV 与 D1 生成，无需第三方 Cookie。{{< /lead >}}

## 全站概况

{{< statsSummary
	totalViews="全站总浏览量"
	totalVisitors="全站访客数"
	todayViews="今日浏览量"
	todayVisitors="今日访客数"
	totalViewsHint="合并所有语言路径的累计 PV"
	totalVisitorsHint="以 UV 去重后的累计访客"
	todayViewsHint="当天 00:00 起累计的 PV"
	todayVisitorsHint="当天内的独立访客"
>}}

## API 状态

{{< statsHealth title="API 当前状态" powered="Powered by Cloudflare Workers · KV · D1" statusLabel="当前状态" statusPlaceholder="检测中…" versionLabel="版本" okText="正常" healthyText="正常" errorText="异常" >}}

## 每日访问趋势

{{< statsTrend
	title="每日访问趋势"
	description="切换 7 / 30 / 90 天区间，检视 PV 与 UV 的变化。"
	rangeLabel="统计区间"
	emptyText="暂无数据"
	errorText="无法加载趋势图"
>}}

## 热门页面 Top 10

{{< statsTop title="热门页面 Top 10" ctaLabel="前往 stats.zakk.au 查看更多" ctaUrl="https://stats.zakk.au/" emptyText="暂无数据" errorText="暂时无法加载热门页面" >}}

{{< statsPageScripts >}}

## 想自己部署？

- <a href="/zh-cn/posts/cloudflare-stats-worker-deploy/">Cloudflare Stats Worker 部署与整合全指南</a>
- <a href="https://github.com/Zakkaus/cloudflare-stats-worker">GitHub 项目</a>
