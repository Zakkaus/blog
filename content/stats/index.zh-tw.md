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

## 全站即時概況

- **全站總瀏覽量**：累計所有語系文章與頁面的 PV。
- **全站訪客數**：以 UV 去重，代表實際訪客人次。
- **今日瀏覽量**：站點所在時區自 00:00 起的 PV。
- **今日訪客數**：今日內獨立訪客數量。

上述數值會同步展示在下方儀表板的 Summary Cards 中。

## API 與系統狀態

- Powered by **Cloudflare Workers · KV · D1**
- API 當前狀態：**✅ 正常**
- 部署版本：**v1.6.0**

如需追蹤實際 API 延遲與回應碼，可點開儀表板的 Health 模組，或造訪 GitHub 儲存庫查閱最新 issue。

## 儀表板會顯示什麼

- 今日 PV / UV 與昨日比較，方便掌握即時趨勢。
- 最近 7/30 天的熱門文章排行。
- 每日流量折線圖，支援深/淺色模式與全螢幕檢視。
- 引薦來源、裝置分佈等補充維度，幫助評估推廣成效。

## 熱門內容

- 🔥 Top 10 熱門頁面，依據最近 7 / 30 天 PV 排序。
- 想看更多資料（包含 referrers、瀏覽器分佈等），請開啟 <a href="https://stats.zakk.au/" target="_blank" rel="noopener">stats.zakk.au</a> 的完整儀表板。

## 想自己部署？

- [Cloudflare Stats Worker 統計系統部署與整合全指南](/zh-tw/posts/cloudflare-stats-worker-deploy/)
- [GitHub 專案](https://github.com/Zakkaus/cloudflare-stats-worker)

{{< statsDashboard url="https://stats.zakk.au" heightClass="h-[1200px]" >}}
