---
title: "統計監控儀表板"
translationKey: "stats-dashboard"
subtitle: "即時掌握全站流量與互動情況"
description: "Cloudflare Stats Worker 儀表板即時呈現 PV / UV、熱門內容與每日趨勢，資料直接來自 Cloudflare Workers + KV。"
ShowToc: false
dashboardURL: "https://stats.zakk.au"
---
{{< lead >}}
這裡即時呈現 zakk.au 的全站流量：所有數據都由 Cloudflare Stats Worker 驅動，透過 Cloudflare Workers、KV 與 D1 無 Cookie 計算並更新。{{< /lead >}}

## 全站總覽

{{< statsSummary totalViews="全站總瀏覽量" totalVisitors="全站訪客數" todayViews="今日瀏覽量" todayVisitors="今日訪客數" >}}

## API 與系統狀態

{{< statsHealth title="API 當前狀態" powered="Powered by Cloudflare Workers · KV · D1" statusLabel="API 當前狀態" statusPlaceholder="檢查中…" versionLabel="版本" okText="✅ 正常" healthyText="✅ 正常" errorText="⚠️ 異常" >}}

## 📈 每日訪問趨勢

{{< statsTrend title="📈 每日訪問趨勢" description="最近 7 / 30 / 90 天的 PV / UV 變化，點擊範圍即可切換。" rangeLabel="統計範圍" >}}

## 🔥 熱門頁面 Top 10

{{< statsTop title="🔥 熱門頁面 Top 10" ctaLabel="在 stats.zakk.au 查看更多" ctaUrl="https://stats.zakk.au/" emptyText="目前沒有數據" errorText="暫時無法載入熱門頁面" >}}

{{< statsPageScripts >}}

## 想自己部署？

- [Cloudflare Stats Worker 統計系統部署與整合全指南](/zh-tw/posts/cloudflare-stats-worker-deploy/)
- [GitHub 專案](https://github.com/Zakkaus/cloudflare-stats-worker)
