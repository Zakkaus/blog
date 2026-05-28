---
slug: cloudflare-stats-worker-deploy
title: "Cloudflare Stats Worker — 隱私優先的統計儀表板"
date: 2025-01-08
tags: ["Cloudflare", "Analytics", "Workers", "Privacy"]
categories: ["Infrastructure"]
description: "用 Cloudflare Workers 部署一個像 stats.zakk.au 的隱私優先統計儀表板。"
translationKey: "cloudflare-stats-deploy"
authors:
  - "Zakk"
---

一個跑在 Cloudflare 邊緣網路上的小型 Worker，提供即時的網站統計，不需要 Google Analytics、不需要 Cookie，也不依賴第三方腳本。線上演示：**[stats.zakk.au](https://stats.zakk.au/)**。

![統計儀表板](stats-dashboard.webp)

## 為什麼用這個 Worker？

- **無 Cookie。** 訪客 IP 經 SHA-256 雜湊並截斷後才存。
- **免費額度夠用。** 個人站幾乎都能跑在 Cloudflare 的免費方案內。
- **邊緣原生。** 基於 Workers + KV，由 Cloudflare 全球網路提供服務。
- **多語言路徑感知。** 自動正規化不同語言版本的 URL。
- **API + 儀表板合一。** 單一 Worker 同時承載，不需要額外前端託管。

## 你會得到什麼

**即時統計**

- 今日 PV/UV 即時更新
- 7 / 14 / 30 天趨勢
- 熱門頁面 Top 10

**儀表板**

- 深 / 淺主題
- 響應式版面，桌面與手機均可
- 繁中 / 英文介面
- 部署在自有子網域（例如 `stats.example.com`）

**API**

- REST 端點，方便自訂整合
- 批次端點以高效查詢
- 健康檢查端點以利監控

## 快速部署

需求：Node.js ≥ 18、`wrangler` CLI ≥ 3.0。

1. **複製專案**
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
   把回傳的 ID 填到 `wrangler.toml`。

4. **（可選）啟用 D1 以支援趨勢圖與熱門頁面**
   ```bash
   wrangler d1 create cloudflare-stats-top
   wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote
   ```
   解除 `wrangler.toml` 中 `d1_databases` 區塊的註解，並填入生成的 ID。

5. **部署**
   ```bash
   wrangler deploy
   ```

6. **打開儀表板**

   ```
   https://stats.example.com/
   ```

   會看到和 [stats.zakk.au](https://stats.zakk.au/) 一樣的介面：

   - 今日 PV/UV 卡片
   - API 健康狀態指示
   - 7 / 14 / 30 天趨勢圖
   - 熱門頁面排行
   - 主題切換（深 / 淺）
   - 語言切換（繁中 / 英文）

   儀表板是獨立的——不需要嵌入，把網址分享出去就行。

## 定價方案：免費 vs 付費

### Workers

| 方案 | 價格 | 包含請求數 | CPU 時間 | 超額計費 |
|------|------|-----------|---------|---------|
| **免費** | $0 | 每日 10 萬次 | 10ms/次 | N/A（硬性上限） |
| **付費** | **$5/月** | 每月 1000 萬次 | 50ms/次 | 每增加 100 萬次 $0.50 |

### KV（鍵值儲存）

| 方案 | 價格 | 讀取 | 寫入/刪除/列表 | 儲存空間 | 超額計費 |
|------|------|------|---------------|---------|---------|
| **免費** | $0 | 每日 10 萬次 | 每日 1000 次 | 1 GB | N/A（硬性上限） |
| **付費** | **包含在 Workers Paid ($5/月)** | 每月 1000 萬次 | 每月 100 萬次 | 1 GB | • 讀取：每 1000 萬次 $0.50<br>• 寫入：每 100 萬次 $5<br>• 儲存：每 GB/月 $0.50 |

### D1（無伺服器 SQL 資料庫）

| 方案 | 價格 | 讀取列數 | 寫入列數 | 儲存空間 | 超額計費 |
|------|------|---------|---------|---------|---------|
| **免費** | $0 | 每日 500 萬列 | 每日 10 萬列 | 500 MB | N/A（硬性上限） |
| **付費** | **$5/月** | 每月 250 億列 | 每月 5000 萬列 | 5 GB | • 讀取：每 100 萬列 $0.001<br>• 寫入：每 100 萬列 $1<br>• 儲存：每 GB/月 $0.75 |

### 按需計費選項

即使不訂閱付費方案，也可以**啟用按需計費**以避免硬性上限：

- Workers：超過免費額度後每 100 萬次請求 $0.50
- KV：按上述單項操作計費
- D1：按上述單項操作計費

### 哪個方案適合你

- **小型個人部落格（< 1 萬訪客 / 日）：** 免費方案足夠。
- **中型部落格（1–5 萬訪客 / 日）：** Workers Paid（$5 / 月）。
- **高流量網站（> 5 萬訪客 / 日）：** Workers Paid + KV/D1 按需計費。

> D1 是可選的。如果你只需要即時 PV/UV，單靠 KV 就夠，儀表板仍可用（僅少 Top 10 趨勢）。

## API 端點

部署後可以呼叫這些端點：

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

**為什麼不用 Google Analytics？**
自架方案讓你完全掌控資料，無需 Cookie，也不會被廣告攔截器擋下。

**可以自訂儀表板嗎？**
可以。儀表板原始碼在 `dashboard/`，修改 HTML/CSS/JS 即可。

**如何備份資料？**
用專案內的備份腳本，定期把 KV 資料匯出到 R2 或 GitHub。

---

這套就是 [stats.zakk.au](https://stats.zakk.au/) 背後的技術棧。部署後你會擁有：

- 部署在自有網域上的獨立統計儀表板
- 完整的統計 REST API
- 無 Cookie 的隱私優先追蹤

問題與回報：[GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)。
