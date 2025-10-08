---
title: "统计监控仪表板"
translationKey: "stats-dashboard"
subtitle: "即时掌握全站流量走势"
description: "Cloudflare Stats Worker 仪表板实时展示 PV / UV、热门内容与每日趋势，数据直接来自 Cloudflare Workers + KV。"
ShowToc: false
dashboardURL: "https://stats.zakk.au"
---
{{< lead >}}
下方仪表板由 Cloudflare Stats Worker 驱动，PV / UV 全程在 Cloudflare Workers + KV 侧计算，无需第三方 Cookie。{{< /lead >}}

## Cloudflare Stats Worker 有什么特点

- 完全自托管，PV / UV 数据掌握在自己的 Cloudflare 帐号里。
- 单个 Worker 同时提供 `/api/*` 接口与仪表板前端。
- 自动统一多语言路径，避免 `/zh-cn/`、`/posts/` 统计被拆分。
- Hugo Blowfish 通过短码嵌入仪表板，同时保留主题的原生排版。

## 可以在这里看到什么

- 今日 PV / UV 卡片，以及与昨日的增减幅度。
- 最近 7 / 30 天的热门文章排行。
- 每日流量趋势折线图，支持深浅色模式与全屏查看。
- 引荐来源、装置类型等补充维度，辅助判断推广成效。

## 想自己部署？

- <a href="/zh-cn/posts/cloudflare-stats-worker-deploy/">Cloudflare Stats Worker 部署与整合全指南</a>
- <a href="https://github.com/Zakkaus/cloudflare-stats-worker">GitHub 项目</a>

{{< statsDashboard url="https://stats.zakk.au" heightClass="h-[1200px]" >}}
