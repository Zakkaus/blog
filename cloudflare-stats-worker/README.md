# Cloudflare Stats Worker

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Zakkaus/cloudflare-stats-worker)
[![Version](https://img.shields.io/badge/version-1.5.0-brightgreen.svg)](https://github.com/Zakkaus/cloudflare-stats-worker/releases)

🚀 **輕量級、隱私優先的頁面訪問統計系統** - 基於 Cloudflare Workers + KV + D1

完美替代 Google Analytics，專為靜態網站設計（Hugo、Hexo、Jekyll、VuePress 等）

[繁體中文文檔](README.zh-TW.md) | [English](#)

---

## ✨ 核心功能

### 🎯 統計功能
- **📊 實時統計**: 頁面瀏覽量（PV）、獨立訪客數（UV）實時更新
- **🔥 熱門頁面**: Top 10 頁面排行榜（基於 D1 數據庫）
- **📈 趨勢圖表**: 每日訪問趨勢可視化（Chart.js）
- **🔍 路徑查詢**: 單頁面、批量查詢統計數據

### 🌐 多語言支持
- **🌍 雙語儀表板**: 繁體中文 ⇄ English 一鍵切換
- **💾 語言記憶**: LocalStorage 保存用戶語言偏好
- **🔤 i18n 路徑**: 自動合併多語言路徑（`/zh-tw/posts/` → `/posts/`）

### 🎨 用戶體驗
- **🌓 主題切換**: 深色/淺色模式自由切換
- **🎯 Logo 顯示**: SVG 漸變 logo，與博客風格統一
- **📱 響應式**: 完美適配桌面、平板、手機
- **⚡ 極速加載**: 全球 300+ CDN 節點，延遲 <50ms

### 🔒 隱私與安全
- **🛡️ 隱私優先**: 無 Cookies、IP 哈希處理
- **⏰ 訪客匿名化**: 24 小時後自動清除訪客記錄
- **🚫 防濫用**: 內建速率限制（120 req/60s per IP）
- **🔐 CORS 保護**: 僅允許授權域名訪問

### 💰 成本與性能
- **💸 幾乎免費**: Cloudflare 免費版 10 萬次請求/日
- **🚀 邊緣計算**: Workers 分佈式執行，零冷啟動
- **📦 單一部署**: API + 儀表板整合在一個 Worker

---

## 🎯 在線演示

- **📊 儀表板**: https://stats.zakk.au（查看統計、圖表、趨勢）
- **🔌 API 端點**: https://stats.zakk.au/api/*
- **💚 健康檢查**: https://stats.zakk.au/health

**儀表板功能：**
- ✅ 全站總瀏覽量 / 訪客數
- ✅ 今日訪問數據
- ✅ 每日趨勢圖表（7 / 14 / 30 天）
- ✅ 頁面查詢工具
- ✅ 熱門頁面 Top 10
- ✅ 雙語切換（中文 ⇄ English）
- ✅ 深色/淺色主題

---

## 🏗️ 系統架構

本項目將 **API 和儀表板整合在單一 Worker** 中：

```
stats.zakk.au/              → 📊 儀表板（HTML 界面）
stats.zakk.au/logo.webp     → 🎨 SVG Logo
stats.zakk.au/api/count     → ➕ 增加頁面瀏覽量
stats.zakk.au/api/stats     → 📈 獲取統計數據
stats.zakk.au/api/batch     → 📋 批量查詢
stats.zakk.au/api/top       → 🔥 熱門頁面（需要 D1）
stats.zakk.au/health        → 💚 健康檢查
```

**優勢：**
- ✅ 單次部署，API + 儀表板全包
- ✅ 無 CORS 跨域問題（同源）
- ✅ 簡化維護和更新
- ✅ 支持自定義域名（CNAME）

**數據存儲：**
- **KV 命名空間**: 存儲所有頁面統計數據（PV、UV、訪客哈希）
- **D1 數據庫**: 存儲熱門頁面排行榜（可選但推薦）

---

## 📦 快速開始

### 🚀 一鍵安裝（推薦）

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
chmod +x scripts/install.sh
./scripts/install.sh
```

**安裝腳本會自動完成：**
1. ✅ 檢查並安裝 Wrangler CLI
2. ✅ 登錄 Cloudflare 帳戶
3. ✅ 創建 KV 命名空間（PAGE_STATS）
4. ✅ 創建 D1 數據庫（cloudflare-stats-top）
5. ✅ 配置 `wrangler.toml`
6. ✅ 初始化 D1 數據表
7. ✅ 部署 Worker
8. ✅ 顯示部署信息和 API 端點

### 📋 手動部署

<details>
<summary>點擊展開手動部署步驟</summary>

#### 1. 安裝 Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

#### 2. 創建 KV 命名空間
```bash
wrangler kv namespace create PAGE_STATS
wrangler kv namespace create PAGE_STATS --preview
```

複製輸出的 ID 到 `wrangler.toml`：
```toml
[[kv_namespaces]]
binding = "PAGE_STATS"
id = "abc123..."           # 生產環境 ID
preview_id = "xyz789..."   # 預覽環境 ID
```

#### 3. 創建 D1 數據庫（可選但推薦）
```bash
wrangler d1 create cloudflare-stats-top
```

複製輸出的 database_id 到 `wrangler.toml`：
```toml
[[d1_databases]]
binding = "DB"
database_name = "cloudflare-stats-top"
database_id = "your-database-id-here"
```

初始化數據表：
```bash
wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote
```

#### 4. 部署 Worker
```bash
wrangler deploy
```

</details>

---

## 🔌 API 端點

### 1. 健康檢查
```bash
GET /health
```

**響應示例：**
```json
{
  "status": "ok",
  "version": "1.5.0",
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

### 2. 增加頁面瀏覽量
```bash
POST /api/count?url=/posts/hello-world/&action=pv
```

**參數：**
- `url` (必填): 頁面路徑
- `action` (可選): `pv` 或 `both`（默認：both）

**響應示例：**
```json
{
  "success": true,
  "page": {
    "path": "/posts/hello-world/",
    "pv": 123,
    "uv": 45
  }
}
```

### 3. 查詢統計數據
```bash
GET /api/stats?url=/posts/hello-world/
```

**響應示例：**
```json
{
  "success": true,
  "page": {
    "path": "/posts/hello-world/",
    "pv": 123,
    "uv": 45
  }
}
```

### 4. 批量查詢
```bash
POST /api/batch

Body:
{
  "urls": ["/", "/about/", "/posts/"]
}
```

**響應示例：**
```json
{
  "success": true,
  "results": [
    { "path": "/", "pv": 500, "uv": 120 },
    { "path": "/about/", "pv": 234, "uv": 78 },
    { "path": "/posts/", "pv": 345, "uv": 89 }
  ]
}
```

### 5. 熱門頁面 Top 10
```bash
GET /api/top?limit=10&min_pv=5
```

**參數：**
- `limit` (可選): 返回數量，默認 10，最大 50
- `min_pv` (可選): 最小瀏覽量過濾，默認 0

**響應示例：**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "path": "/",
      "pv": 500,
      "uv": 120,
      "updated_at": "2025-10-07 12:00:00"
    },
    {
      "path": "/posts/popular-post/",
      "pv": 345,
      "uv": 89,
      "updated_at": "2025-10-07 11:30:00"
    }
  ],
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

---

## 🌐 博客集成

### Hugo（Blowfish 主題）快速整合

以下步驟以本倉庫的 Hugo 部落格為範例，其他主題也可依樣調整：

1. **放置統計腳本**  
   將 `assets/js/cloudflare-stats.js` 複製到你的 Hugo 專案，並在 `layouts/partials/extend-head.html` 引入：

   ```html
   {{ $stats := resources.Get "js/cloudflare-stats.js" | resources.Minify }}
   <script defer src="{{ $stats.RelPermalink }}"></script>
   ```

2. **確保模板輸出 `views_` 佔位符**  
   Blowfish 已在 `partials/meta/views.html` 內產生 `span`，ID 形如 `views_posts/example/`。若自訂模板，可參考：

   ```html
   <span id="views_{{ .File.Path }}" class="animate-pulse text-transparent bg-neutral-300 dark:bg-neutral-400">0</span>
   ```

3. **顯示站點總流量（選擇性）**  
   於頁面新增：

   ```html
   <span id="site-pv" class="animate-pulse">0</span>
   <span id="site-uv" class="animate-pulse">0</span>
   ```

4. **調整配置**  
   若採用自訂 Worker 網域，記得在腳本第 5 行將 `API_BASE` 改為你的統計域名。

5. **無需額外 CSS**  
   腳本在填入資料時會移除骨架樣式（`animate-pulse`、`text-transparent` 等），保持主題原生外觀。

---

## 🎨 儀表板功能

### 雙語支持
- 點擊右上角 **🌐** 按鈕切換語言（中文 ⇄ English）
- 語言偏好自動保存在 LocalStorage

### 主題切換
- 點擊 **🌙** / **☀️** 按鈕切換深色/淺色模式
- 主題偏好自動保存

### 統計卡片
- **全站總瀏覽量**: 所有頁面的總 PV
- **全站訪客數**: 所有頁面的總 UV
- **今日瀏覽量**: 當日訪問量（模擬數據）
- **API 狀態**: Worker 健康狀態和版本號

### 趨勢圖表
- 支持查看 **7 天** / **14 天** / **30 天** 的訪問趨勢
- PV（藍色線）和 UV（綠色線）雙線圖表
- 響應式設計，移動端完美顯示

### 頁面查詢
- 輸入路徑（如 `/posts/hello-world/`）查詢統計
- 顯示該頁面的 PV 和 UV

### 熱門頁面
- 顯示訪問量最高的 Top 10 頁面
- 需要配置 D1 數據庫

---

## 🔧 配置說明

### wrangler.toml 配置文件

```toml
name = "cloudflare-stats-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

# KV 命名空間（必需）
[[kv_namespaces]]
binding = "PAGE_STATS"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

# D1 數據庫（可選，用於熱門頁面功能）
[[d1_databases]]
binding = "DB"
database_name = "cloudflare-stats-top"
database_id = "your-d1-database-id"
```

### D1 數據表結構

```sql
CREATE TABLE IF NOT EXISTS page_stats (
  path TEXT PRIMARY KEY,
  pv INTEGER DEFAULT 0,
  uv INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_pv ON page_stats(pv DESC);
CREATE INDEX IF NOT EXISTS idx_updated_at ON page_stats(updated_at DESC);
```

---

## 📊 數據流程

### PV/UV 計數流程
```
用戶訪問頁面
    ↓
前端調用 /api/count
    ↓
Worker 處理請求
    ↓
├─ 檢查 IP 哈希（訪客去重）
├─ 更新 KV 存儲（頁面 PV/UV）
├─ 同步到 D1（熱門頁面）
└─ 返回最新統計數據
    ↓
前端更新顯示
```

### 數據存儲策略
1. **KV 存儲**：
   - `page:/path` → `{ pv, uv }`（頁面統計）
   - `visitors:/path:{hash}` → `1`（24h TTL，訪客去重）
   - `site:pv` → 總 PV
   - `site:uv` → 總 UV

2. **D1 數據庫**（可選）：
   - 每次計數後自動同步
   - 用於熱門頁面排行榜
   - 支持複雜查詢和分析

---

## 🛡️ 隱私保護

### IP 處理
- ✅ **哈希處理**: IP 地址經過 SHA-256 + Salt 哈希
- ✅ **不存儲原始 IP**: 只存儲哈希值
- ✅ **24 小時過期**: 訪客記錄自動清除

### 無 Cookies
- ✅ 不使用 Cookies 追蹤用戶
- ✅ 符合 GDPR 隱私要求
- ✅ 不收集個人信息

### CORS 限制
- ✅ 僅允許授權域名訪問 API
- ✅ 防止濫用和數據洩露

---

## 🚀 進階配置

### 自定義域名

在 Cloudflare Dashboard 中：
1. 進入 **Workers & Pages** → 選擇你的 Worker
2. 點擊 **Custom Domains** → **Add Custom Domain**
3. 輸入域名（如 `stats.yourdomain.com`）
4. 按提示添加 DNS 記錄

或使用 Wrangler CLI：
```bash
wrangler custom-domains add stats.yourdomain.com
```

### 環境變量（可選）

在 `wrangler.toml` 中添加：
```toml
[vars]
ALLOWED_ORIGINS = "https://yourblog.com,https://www.yourblog.com"
RATE_LIMIT_MAX = 120
RATE_LIMIT_WINDOW = 60
```

### 速率限制調整

修改 `src/index.js` 中的常量：
```javascript
const RATE_LIMIT = { MAX_REQUESTS: 120, WINDOW_SECONDS: 60 };
```

---

## 📝 常見問題

### Q1: 為什麼熱門頁面顯示"暫無熱門頁面數據"？

**A:** 這通常是因為：
1. D1 數據庫未配置或未初始化
2. 頁面訪問量還太少，D1 中沒有數據
3. D1 同步失敗

**解決方法：**
```bash
# 1. 確認 D1 已創建並配置
wrangler d1 list

# 2. 初始化 D1 數據表
wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote

# 3. 手動插入測試數據
wrangler d1 execute cloudflare-stats-top --command \
  "INSERT INTO page_stats (path, pv, uv) VALUES ('/', 100, 50)" --remote

# 4. 測試 API
curl "https://stats.zakk.au/api/top?limit=10"
```

### Q2: 為什麼前幾天沒部署儀表板，現在儀表板依然有數據？

**A:** 因為統計數據存儲在 **KV 命名空間**中，而不是儀表板本身！

- Worker API 一直在運行並收集數據到 KV
- 儀表板只是讀取和展示 KV 中的數據
- KV 數據是持久化的，與儀表板部署無關

**數據流：**
```
用戶訪問博客 → API 計數 → KV 存儲（一直累積）
                              ↓
                        儀表板讀取並顯示
```

### Q3: 如何清空所有統計數據？

```bash
# 清空 KV（會刪除所有統計）
wrangler kv key list --namespace-id=your-kv-id | \
  jq -r '.[].name' | \
  xargs -I {} wrangler kv key delete {} --namespace-id=your-kv-id

# 清空 D1
wrangler d1 execute cloudflare-stats-top --command \
  "DELETE FROM page_stats" --remote
```

### Q4: 如何備份數據？

```bash
# 備份 D1 數據
wrangler d1 export cloudflare-stats-top --remote --output=backup.sql

# 恢復數據
wrangler d1 execute cloudflare-stats-top --file=backup.sql --remote
```

### Q5: 閱讀量還需要額外 CSS 調整嗎？

不需要。最新腳本在寫入數字時會自動移除骨架類別並恢復主題的 `vertical-align` 設定。  
若你使用舊版主題或自訂樣式，仍可加上以下覆蓋：

```css
span[id^="views_"].animate-pulse {
  margin-top: 0 !important;
  transform: none !important;
  animation: none !important;
}
```

---

## 📂 項目結構

```
cloudflare-stats-worker/
├── src/
│   ├── index.js           # Worker 主邏輯
│   └── dashboard.js       # 儀表板 HTML
├── scripts/
│   ├── install.sh         # 一鍵安裝腳本
│   └── deploy.sh          # 舊版部署腳本
├── schema.sql             # D1 數據表結構
├── wrangler.toml          # Worker 配置文件
├── CHANGELOG.md           # 更新紀錄
├── README.md              # 本文檔
└── LICENSE                # MIT 許可證
```

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 開發指南
```bash
# 克隆倉庫
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker

# 本地開發
wrangler dev

# 部署到生產
wrangler deploy
```

---

## 📜 更新日誌

### v1.5.0 (2025-10-07)
- ✨ 新增 favicon 支持（SVG logo）
- 🔧 修復 D1 數據同步邏輯
- 🌐 優化雙語支持，移除標題中的 emoji
- 📚 完善 README 和安裝腳本
- 🐛 修復熱門頁面顯示問題

### v1.4.0 (2025-10-07)
- 🌍 雙語儀表板（繁體中文 ⇄ English）
- 🎨 SVG Logo 整合
- 🗄️ D1 數據庫部署
- 🔧 修復加載動畫偏移
- 📝 Hugo 整合文檔

### v1.3.0
- 📊 整合儀表板和 API
- 🎨 主題切換功能
- 📈 每日趨勢圖表

---

## 📄 許可證

[MIT License](LICENSE)

---

## 🔗 相關鏈接

- **GitHub**: https://github.com/Zakkaus/cloudflare-stats-worker
- **演示站點**: https://stats.zakk.au
- **作者博客**: https://zakk.au
- **Cloudflare Workers 文檔**: https://developers.cloudflare.com/workers/

---

**⭐ 如果這個項目對你有幫助，請給個 Star！**
