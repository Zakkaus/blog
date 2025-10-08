---
title: "統計監控儀表板"
translationKey: "stats-dashboard"
subtitle: "即時掌握全站流量與互動情況"
description: "Cloudflare Stats Worker 儀表板即時呈現 PV / UV、熱門內容與每日趨勢，資料直接來自 Cloudflare Workers + KV。"
ShowToc: false
dashboardURL: "https://stats.zakk.au"
---
{{< lead >}}
這份儀表板由 Cloudflare Stats Worker 提供，所有 PV / UV 都透過 Cloudflare Workers + KV 即時計算，無需第三方 Cookie。{{< /lead >}}

## Cloudflare Stats Worker 是什麼

- 自架、零追蹤腳本的統計方案，資料完全掌握在自己的 Cloudflare 帳號內。
- 同一個 Worker 同時提供 `/api/*` 端點與這個儀表板的前端。
- 內建 URL 正規化，會把 `/`、`/zh-tw/` 與 `/posts/foo/` 統一到單一統計鍵值。

## 儀表板會顯示什麼

- 今日 PV / UV 與昨日比較，方便掌握即時趨勢。
- 最近 7/30 天的熱門文章排行。
- 每日流量折線圖，支援深/淺色模式與全螢幕檢視。
- 引薦來源、裝置分佈等補充維度，幫助評估推廣成效。

## 想自己部署？

- [Cloudflare Stats Worker 統計系統部署與整合全指南](/zh-tw/posts/cloudflare-stats-worker-deploy/)
- [GitHub 專案](https://github.com/Zakkaus/cloudflare-stats-worker)

{{< statsDashboard url="https://stats.zakk.au" heightClass="h-[1200px]" >}}
