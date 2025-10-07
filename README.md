# Zakk Blog## [Zakk Blog](https://zakk.au)



**English** · Static site for https://zakk.au built with Hugo + Blowfish, localised in English, 繁體中文, and 简体中文.  這個倉庫是使用 [Hugo](https://gohugo.io/) 與 [Blowfish](https://blowfish.page/)主題打造的多語靜態網站。

**繁體中文** · 使用 Hugo 與 Blowfish 主題打造的個人部落格，支援英文、繁體中文與簡體中文三種語系。

---

## Tech Stack · 技術棧
- [Hugo](https://gohugo.io/) `v0.151.0` with the [Blowfish](https://blowfish.page/) theme (git submodule)。  
  使用 Hugo 產生靜態頁面，Blowfish 主題透過子模組維護。
- Asset pipeline via Hugo Pipes (SCSS/JS minify) stored under `assets/`。  
  使用 Hugo Pipes 處理 SCSS、JS 檔案。
- Analytics powered by [cloudflare-stats-worker](cloudflare-stats-worker/) (`/api/count`, `/api/daily`)，自家的 Cloudflare Worker 方案。  
  統計來源為自建的 Cloudflare Worker。

## Content · 內容
- `content/_index.*.md` – home page copy for each language。  
  首頁文案依語系分開維護。
- `content/posts/` – long-form posts (多語版本放在同一資料夾)。
- `content/about/`, `content/timeline/` – 單頁介紹與時間軸。
- Static assets位於 `static/`（favicon、公開圖像）。

## Running locally · 本地開發
```bash
hugo server --buildDrafts --disableFastRender
```
- Visit http://localhost:1313/.  
  頁面會自動反映 Markdown 與資源的變更。
- 需要 Hugo extended 版本，且需已同步 Blowfish 子模組。

## Build & Deploy · 建置與部署
```bash
hugo --gc --minify
```
- 產出的靜態檔位於 `public/`（Cloudflare Pages 使用該目錄）。  
  Cloudflare Pages 會在 main 分支更新時自動重新建置。
- 若調整主題，請記得在 `themes/blowfish` 子模組內提交或拉取最新版本。

## Analytics Integration · 統計整合
- 前端腳本：`assets/js/cloudflare-stats.js` 會在頁面載入時調用 `https://stats.zakk.au` Worker。  
  可在 `API_BASE` 改成自己的 Worker 網域。
- 佔位符：Blowfish 產生 `views_` span；腳本會填入 PV 並維持圖示對齊。
- 全站統計：`/api/stats` 省略 `url` 時回傳全站 PV/UV，現已同時供 timeline 與儀表板使用，並附上 UTC 時戳避免數據不一致。
- Dashboard：`https://stats.zakk.au/` 顯示即時 PV/UV、熱門頁面與每日趨勢，卡片與圖表會標示最新「更新於 (UTC)」並在載入或錯誤時顯示狀態提示。

## SEO
- `static/robots.txt` 提供標準 `User-agent` / `Allow` / `Sitemap` 指令，已移除 Search Console 無法解析的自訂標頭。

## Folder overview · 資料夾總覽
```
assets/        # JS / SCSS / 圖片資源
config/        # 多語系 Hugo 設定檔
content/       # Markdown 內容
layouts/       # 自訂頁面與 partial
static/        # 不需處理的靜態資源
cloudflare-stats-worker/ # Analytics Worker 子專案
```

## Contributing · 參與方式
- Issues and pull requests are welcome for typos, translation tweaks, or automation improvements.  
  歡迎透過 Issue / PR 回報錯字、翻譯修正或工作流程建議。
- 主題更新請在子模組中提交，避免覆蓋 upstream。  
  更新 Blowfish 時請注意子模組同步。

## License · 授權
- Blog content: CC BY-NC-SA 4.0。  
  文章內容採 CC BY-NC-SA 4.0。
- Code in this repository: MIT License。  
  程式碼部分採 MIT 授權。
