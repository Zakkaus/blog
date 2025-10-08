title: "Cloudflare Stats Worker 統計系統概覽"
slug: "cloudflare-stats-worker-guide"
translationKey: "cloudflare-stats-guide"
date: 2025-10-08
draft: false
description: "帶你快速認識 Cloudflare Stats Worker 的特色、架構與儀表板介面，並說明本站如何整合。"
authors:
  - "Zakk"
categories:
  - "Infrastructure"
tags:
  - "Cloudflare"
  - "Analytics"
  - "Hugo"
  - "Blowfish"
  - "Workers"
seo:
  title: "Cloudflare Stats Worker 統計系統介紹"
  description: "了解 Cloudflare Stats Worker 如何提供即時、隱私友善的 PV / UV 統計與儀表板，以及在 Hugo Blowfish 主題上的整合方式。"
{{< lead >}}
Cloudflare Stats Worker 是我在 zakk.au 上使用的開源統計方案：既有 API、儀表板，也能無縫整合 Hugo Blowfish 主題，提供即時又隱私友善的 PV / UV 數據。本文快速總覽它的特色與本站的實際應用。{{< /lead >}}

## 為什麼改用自架統計

- **零 Cookie、零追蹤腳本**：所有資料留在 Cloudflare KV / D1，自行掌控 retain policy。
- **單一 Worker 搭配儀表板**：部署後立刻擁有 `/api/*` 端點與一個開箱即用的 dashboard。
- **多語系友善**：內建 URL 正規化，會把 `/zh-tw/posts/foo/`、`/posts/foo/` 視為同一頁面。
- **成本 = 0**：免費額度對個人部落格綽綽有餘，超量再考慮升級。

## 架構與資料流

```mermaid

  Browser[訪客瀏覽網站] -->|fetch /api/count| Worker[Stats Worker]
  Browser -->|fetch /api/batch| Worker
  Worker -->|寫入/讀取| KV[(Cloudflare KV)]
  Worker -->|可選| D1[(Cloudflare D1)]
  Dashboard[stats.zakk.au 儀表板] -->|fetch /api/stats /api/daily| Worker
```

- 前端腳本集中於 `assets/js/cloudflare-stats.js`，會自動找出列表與文章頁的 PV / Like 佔位符。
- Worker 端會以 `page:/posts/foo/:pv`、`uv` 作為鍵值儲存。
- 儀表板頁面則是同一個 Worker 服務的靜態前端，無需額外托管。

## 儀表板亮點

- **今日 PV / UV 卡片**：進站就能看到即時趨勢。
- **Top Articles**：自動列出最熱門內容，方便追蹤轉載效果。
- **Daily Timeline**：7/30 天圖表一目瞭然，支援深色模式。
- **全螢幕模式**：手機也能舒服瀏覽，不怕縮放。

你可以直接到 [統計監控頁面](/zh-tw/stats/) 試玩，該頁面就是將儀表板 `<iframe>` 嵌入主題的範例。

## 與 Hugo Blowfish 的最佳化

- **覆寫模板**：我在 `layouts/_default/single.html`、`list.html` 以及 `layouts/partials/meta/views.html`、`likes.html` 內統一 slug 產生方式，確保多語系/多層路徑都能對到 KV。
- **延遲載入腳本**：透過 `extend-head.html` 引入指紋化後的 `cloudflare-stats.js`，並透過 `data-api` 指向 Worker。
- **容錯 UI**：統計數字更新前會有骨架動畫，失敗時保留 `—`，視覺不會跳動。

## 想自己操作？

部署流程、指令與常見問題我都整理在另一篇長文：

- [Cloudflare Stats Worker 部署與整合教學](/zh-tw/posts/cloudflare-stats-worker-deploy/)

那篇會從 `./scripts/install.sh` 開始講，到覆寫模板、健康檢查、排錯都有覆蓋。

## 常見問題

### 為什麼不用 Google Analytics？
我希望可控、無 Cookie、且能在中國訪問，自己托管的 Worker 更能自由調整資料結構。

### 儀表板會影響頁面速度嗎？
統計頁採 `<iframe>` 分離載入，不會阻塞主站；文章頁的統計腳本也以 `defer` 載入，並採批次 API 減少請求數量。

### 可以擴充資料模型嗎？
可以，把 Worker 的儲存格式改為 JSON 即可，再搭配 D1 進行匯總或導出外部 BI。

---

未來我會持續優化統計模組：包含今天 UV widget、每日自動備份，以及更多報表。歡迎追蹤改版，或在 Matrix 聊天室與我討論你的實作需求！
### 2. 調整模板 ID（若必要）
