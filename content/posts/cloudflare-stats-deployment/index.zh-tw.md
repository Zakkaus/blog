---
slug: cloudflare-stats-worker-deploy
title: "Cloudflare Stats Worker - 隱私優先的統計儀表板"
date: 2025-01-08
tags: ["Cloudflare", "Analytics", "Workers", "Privacy"]
categories: ["Infrastructure"]
description: "部署你自己的隱私優先統計儀表板,就像 stats.zakk.au 一樣使用 Cloudflare Workers"
translationKey: "cloudflare-stats-deploy"
authors:
  - "Zakk"
---

想要即時網站統計卻不想用 Google Analytics?**Cloudflare Stats Worker** 是一個完全運行在 Cloudflare 邊緣網路上的隱私優先分析方案。

看看實際案例：**[stats.zakk.au](https://stats.zakk.au/)**

![統計儀表板](stats-dashboard.webp)

## 為什麼選擇 Cloudflare Stats Worker?

- **隱私優先**：無 Cookie，IP 位址經 SHA-256 雜湊並截斷
- **零成本**：大多數個人網站使用 Cloudflare 免費方案即可運行
- **邊緣效能**：基於 Cloudflare Workers + KV，全球低延遲訪問
- **多語言支援**：自動正規化不同語言版本的路徑
- **完整方案**：單一 Worker 同時提供 API 端點與獨立儀表板

## 主要特色

### 即時分析
- 今日 PV/UV 即時計數器
- 7/14/30 天歷史趨勢
- 熱門頁面 Top 10 排行

### 精美儀表板
- 玻璃擬態設計，支援深淺色主題
- 響應式佈局，支援手機與桌面
- 多語言介面（繁中/英文）
- 可透過自訂網域訪問（如 stats.example.com）

### 開發者友善 API
- RESTful API 端點，方便自訂整合
- 批次操作，高效資料查詢
- 健康檢查端點，便於監控

## 快速部署

> 需求：Node.js ≥ 18、`wrangler` CLI ≥ 3.0

1. **複製並進入專案目錄**
   ```bash
   git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
   cd cloudflare-stats-worker
   ```

2. **安裝 Wrangler 並登入**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **建立 KV 命名空間**
   ```bash
   wrangler kv namespace create PAGE_STATS
   wrangler kv namespace create PAGE_STATS --preview
   ```
   然後將 ID 貼到 `wrangler.toml` 中。

4. **（可選）啟用 D1 以支援趨勢圖與熱門頁面**
   ```bash
   wrangler d1 create cloudflare-stats-top
   wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote
   ```
   解除 `wrangler.toml` 中 `d1_databases` 區塊的註解，並填入生成的 ID。

5. **部署 🎉**
   ```bash
   wrangler deploy
   ```

## 步驟 7：訪問統計儀表板

部署完成後，直接訪問你的儀表板網域：

```
https://stats.example.com/
```

你會看到與 [stats.zakk.au](https://stats.zakk.au/) 相同的精美分析介面：

- **即時指標**：今日 PV/UV 卡片即時更新
- **API 健康狀態**：視覺化系統狀態指示器
- **趨勢圖表**：7/14/30 天互動式圖表
- **熱門頁面**：最受歡迎內容排行榜
- **主題切換**：深淺色模式自由切換
- **語言選擇器**：繁中/英文介面選項

儀表板完全獨立運作 - 無需嵌入，直接分享網址即可！

## 免費方案與升級選項

| 服務 | 免費額度 | 何時升級 |
|------|---------|---------|
| **Workers** | 每日 100k 請求<br>10ms CPU 時間 | 當每日流量超過 100k 或需要更大 CPU 資源時，升級到 **Workers Paid ($5/月)**。 |
| **KV** | 1 GB 儲存空間<br>每日 100k 次讀取<br>每日 1k 次寫入 | 當需要儲存大型 JSON 或保留長期歷史記錄時，升級到付費方案。 |
| **D1** | 每月 5M 次查詢<br>1 GB 儲存空間 | 當需要大量使用 Top 10 排行或長時間趨勢查詢時，升級到 D1 Paid。 |

> **注意**：D1 是可選的。如果你只需要即時 PV/UV 統計，KV 已足夠，儀表板依然可用（僅缺少 Top 10 與趨勢圖）。

對大多數個人網站來說，免費方案綽綽有餘！

## API 端點

部署後，你可以訪問這些端點：

```bash
# 健康檢查
curl https://stats.example.com/health

# 頁面瀏覽計數
curl "https://stats.example.com/api/count?url=/posts/example/"

# 整體統計
curl https://stats.example.com/api/stats

# 每日趨勢
curl https://stats.example.com/api/daily
```

## 架構

```
瀏覽器 → Worker (stats.example.com)
          ├── /api/*     → 統計 API
          ├── /*         → 儀表板靜態檔案
          └── Storage    → Cloudflare KV
```

## 常見問題

### 為什麼不用 Google Analytics?
自架方案讓你完全掌控資料，無需 Cookie，且不會被廣告攔截器封鎖。

### 可以自訂儀表板嗎?
當然！儀表板原始碼在 dashboard/ 資料夾，可修改 HTML/CSS/JS 配合你的品牌風格。

### 如何備份資料?
使用專案提供的備份腳本，定期將 KV 資料匯出到 R2 或 GitHub。

---

這就是 [stats.zakk.au](https://stats.zakk.au/) 背後的技術架構。部署完成後，你將擁有：

✅ 自訂網域的獨立統計儀表板  
✅ 完整的統計 REST API  
✅ 無 Cookie 的隱私優先追蹤  

如有問題，歡迎造訪 [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)。
