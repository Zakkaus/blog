---
title: "統計監控儀表板"
translationKey: "stats-dashboard"
subtitle: "即時掌握全站流量與互動情況"
description: "這裡嵌入了 Cloudflare Stats Worker 儀表板，提供今日 PV / UV、熱門文章、每日趨勢等關鍵指標。"
dashboardURL: "https://stats.zakk.au"
---

本站的統計系統是透過 [Cloudflare Stats Worker](https://github.com/Zakkaus/cloudflare-stats-worker) 部署在 Cloudflare Workers 上，並透過 Hugo Blowfish 主題的客製佈景取得統計資訊與列表。想了解更多，可參考：

- 〈[Cloudflare Stats Worker 統計系統概覽](/zh-tw/posts/cloudflare-stats-worker-guide/)〉：快速認識架構、儀表板與整合重點。
- 〈[Cloudflare Stats Worker 部署與整合教學](/zh-tw/posts/cloudflare-stats-worker-deploy/)〉：完整部署腳本、覆寫模板與排錯筆記。

{{< statsDashboard url="https://stats.zakk.au" heightClass="h-[1200px]" >}}
