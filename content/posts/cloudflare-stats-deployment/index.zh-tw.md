---
title: "Cloudflare Stats Worker 部署與整合教學"
slug: "cloudflare-stats-worker-deploy"
translationKey: "cloudflare-stats-deploy"
date: 2025-10-08
draft: false
description: "一步步完成 Cloudflare Stats Worker 部署、綁定自訂網域，並將統計功能接入 Hugo Blowfish 主題。"
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
  title: "Cloudflare Stats Worker 部署整合實戰"
  description: "完整示範如何部署 Cloudflare Stats Worker、設定 KV、驗證 API 與嵌入 Blowfish 主題的統計模組。"
---

{{< lead >}}
這份筆記整理了我在 zakk.au 佈署 Cloudflare Stats Worker 的全流程：從初始化專案、建立 KV、設定網域，到在 Hugo Blowfish 主題顯示 PV/UV 與儀表板。{{< /lead >}}

> 若你只想快速了解成品長什麼樣，請先閱讀〈[Cloudflare Stats Worker 統計系統概覽](/zh-tw/posts/cloudflare-stats-worker-guide/)〉。

## 0. 前置條件

- 已註冊 Cloudflare 帳號並啟用帳單（免費額度足夠）。
- 你的主網域託管在 Cloudflare 上，方便設定子網域路由。
- 環境安裝 Git、Node.js 18+、Wrangler CLI（`npm install -g wrangler`）。
- 若要跑驗證腳本，建議 macOS / Linux，或 WSL2。

## 1. 取得專案

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
```

專案主要目錄：

- `src/`：Cloudflare Worker 程式碼。
- `dashboard/`：儀表板靜態網頁，會隨 Worker 一起部署。
- `scripts/`：自動化腳本，本文都會使用。

## 2. 執行安裝腳本

```bash
./scripts/install.sh
```

腳本會依序：

1. 檢查 Wrangler 是否登入。
2. 建立 KV Namespace 並寫入 `wrangler.toml`。
3. 上傳 Worker 並綁定 `stats.example.com` Route。
4. 啟動 Health Check 確認回傳 `{"status":"ok"}`。

過程中如果想使用不同子網域，可加上 `--domain stats.zakk.au` 這類參數，詳細請執行 `./scripts/install.sh --help` 查看。

## 3. 驗證 API

先透過健康檢查確認 Worker 可用：

```bash
curl https://stats.example.com/health
# {"status":"ok"}
```

常用端點：

```bash
curl "https://stats.example.com/api/count?url=/" | jq
curl "https://stats.example.com/api/stats" | jq
curl "https://stats.example.com/api/daily" | jq
```

也可以使用專案提供的驗證腳本：

```bash
./scripts/verify.sh https://stats.example.com
```

這會一次測所有端點並顯示成功/失敗。

## 4. 匯入 Hugo 前端腳本

在 Hugo 專案將 `cloudflare-stats-worker/client/cloudflare-stats.js` 複製到 `assets/js/cloudflare-stats.js`（或自訂路徑）。

接著於 `layouts/partials/extend-head.html` 加入：

```go-html-template
{{ $stats := resources.Get "js/cloudflare-stats.js" | resources.Minify | resources.Fingerprint }}
<script defer src="{{ $stats.RelPermalink }}" data-api="https://stats.example.com"></script>
```

這段腳本會：

- 尋找所有 `span[id^="views_"]`、`span[id^="likes_"]`。
- 對 URL 正規化，例如 `/zh-tw/posts/foo/` → `/posts/foo/`。
- 請求 `/api/count`、`/api/batch` 並更新 DOM。
- 失敗時顯示 `—`，避免破版。

## 5. 覆寫 Blowfish 模板

為確保所有語系都使用一致 slug，我額外建立了四個覆寫檔案：

- `layouts/_default/list.html`
- `layouts/_default/single.html`
- `layouts/partials/meta/views.html`
- `layouts/partials/meta/likes.html`

範例片段：

```go-html-template
{{ $oidPath := "" }}
{{ with .RelPermalink }}
  {{ $rel := printf "%s" . }}
  {{ if not (strings.HasSuffix $rel "/") }}
    {{ $rel = printf "%s/" $rel }}
  {{ end }}
  {{ $clean := strings.TrimLeft "/" $rel }}
  {{ if or (eq $clean "") (eq $clean "/") }}
    {{ $oidPath = "/" }}
  {{ else }}
    {{ $oidPath = $clean }}
  {{ end }}
{{ end }}
<span id="views_{{ $oidPath }}" class="animate-pulse text-sm text-muted">…</span>
```

這樣就能把 `/zh-tw/posts/foo/`、`/posts/foo/`、`/posts/foo/index.html` 全部合併成單一鍵值。

## 6. 本地測試

```bash
hugo server -D
```

在文章頁開啟瀏覽器 Network 面板，確認：

- `/api/count?url=/posts/foo/` 200；
- `/api/batch` 回傳所有卡片的 PV；
- Console 不再出現 `count error` 警告。

如果要壓測，可用 `hey` 或 `autocannon` 打 `/api/count`，觀察 R2/KV 的延遲。

## 7. 部署儀表板頁面

我另外建立了 `content/stats/index.*.md`，版面 `stats/stats-dashboard.html` 會把儀表板 `iframe` 拉進 Hugo 主題：

```html
<iframe
  src="https://stats.example.com"
  class="h-[1200px] w-full"
  loading="lazy"
  referrerpolicy="no-referrer"
></iframe>
```

若你不想用 `iframe`，也可以將 `dashboard/` 裡的 HTML/CSS/JS 打包成 Hugo partial 自行設計。

## 8. 常見問題排查

| 狀況 | 排查步驟 |
| ---- | -------- |
| `/api/count` 500 | 檢查 Wrangler 日誌：`npx wrangler tail --format=json` |
| PV/UV 沒更新 | 確認前端 `data-api`、`data-site` 是否正確，或清除 Cloudflare Cache |
| 想排除內部流量 | 在 Worker `src/router.ts` 增加 IP/UA 黑名單，或加上 Turnstile 驗證 |
|

## 9. 後續優化

- 把 KV Snapshot 自動備份到 R2 / GitHub。
- 啟用 D1 將每日統計寫入資料表，方便長期分析。
- 用 Cloudflare Queues/Scheduled Jobs 做每小時整理。
- 把儀表板加進主選單（本篇最後有範例）。

---

希望這份部署筆記能讓你也在自己的 Hugo 網站上跑起 Cloudflare Stats Worker。如果遇到其他問題，歡迎寫信或在 Matrix 聊天室討論！
