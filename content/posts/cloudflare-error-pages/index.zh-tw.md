---
slug: cloudflare-error-pages
title: "打造多語版的 Cloudflare 錯誤頁"
date: 2025-10-01
tags: ["Cloudflare","Pages","Error Pages"]
categories: ["Infrastructure"]
description: "記錄 error.zakk.au 如何利用自製 Cloudflare Pages 專案提供品牌化的多語錯誤頁。"
translationKey: "cloudflare-error-pages"
authors:
  - "Zakk"
seo:
  description: "error.zakk.au 背後的 Cloudflare Pages 專案，提供多語、響應式的錯誤與挑戰頁面，完整涵蓋各式 Cloudflare 場景。"
  keywords:
    - "Cloudflare 錯誤頁"
    - "Cloudflare Pages"
    - "自訂錯誤頁"
    - "Zakk"
    - "多語介面"
    - "Tailwind CSS"
    - "Ray ID 疑難排解"
---

## 為什麼要做 error.zakk.au？

Cloudflare 預設錯誤頁與網站風格落差很大，對訪客來說體驗被打斷。我希望有一個輕量代替方案，可以：

- 自動偵測淺色／深色模式，也允許使用者手動切換
- 自動偵測語系（英文、繁體中文、簡體中文），並提供手動切換
- 顯示 **Ray ID** 與預填資訊的支援信件連結，縮短排錯時間
- 完全托管在 Cloudflare Pages，只要 git push 就能更新

於是就有了 [`Zakkaus/cf-pages`](https://github.com/Zakkaus/cf-pages) 這個專案，以及正式部署在 [error.zakk.au](https://error.zakk.au/) 的版本。

## 儲存庫包含哪些模板？

倉庫收錄所有 Cloudflare 常見錯誤頁，並以 Tailwind CSS 重寫版面：

| 模板 | 使用情境 |
| --- | --- |
| `cf-1000.html` | Cloudflare 1000 系列設定錯誤 |
| `cf-500.html` | 來源端 5xx 錯誤 |
| `cf-waf-block.html` | WAF（403）封鎖 |
| `cf-ip-block.html` | IP / 國別封鎖 |
| `cf-ip-challenge.html`、`cf-attack.html` | 管理解鎖／I'm Under Attack Mode |
| `cf-rate-limit.html` | 429 流量限制 |
| `offline.html` | Always Online™ 離線提示 |

每個頁面都會注入品牌視覺（Logo、3D 無尾熊）、即時 Ray ID，以及一個指向自助排錯的行動按鈕。

## 多語文案與自動切換

所有字串集中在 `lang.js`：

1. 讀取 `navigator.language`
2. 對應 `en`、`zh-Hant` 或 `zh-Hans`
3. 若無對應語系就使用預設語言

使用者仍可手動改語系，結果會存進 `localStorage`，下次進站自動套用。

## 設計系統與樣式

- **Tailwind CSS 流程**：在 `input.css` 撰寫樣式，透過 `npm run build`（或 `pnpm run build`）輸出 `output.css`。
- **日夜模式一致**：`assets/screenshots/*.webp` 同步展示淺色與深色，確保符合 WCAG 對比要求。
- **共用元件**：按鈕、提示框、版面結構與本站 Blowfish 主題相近，讓使用者在各站之間切換不違和。

## 部署到 Cloudflare Pages

1. 將儲存庫串接到 Pages，建置指令維持 `npm run build`。
2. Framework preset 選擇 None，Pages 會在部署前編譯 Tailwind。
3. 輸出目錄維持 `/`，Cloudflare 會直接對應根目錄的 HTML 模板。
4. 在 Custom Error Pages 指定 **error.zakk.au**，也能延伸至 help.zakk.au 等子站使用。

每一次 commit 都會有預覽環境，可以先確認結果再於 Cloudflare 後台套用。

## Ray ID 的支援流程

所有模板底部都有「Need help?」區塊，會：

- 即時顯示觸發錯誤的 Ray ID
- 提供預填信件連結，將 Ray ID、時間戳與客戶端 IP 一次帶給支援信箱（當 Cloudflare 注入資料後）
- 附上狀態頁次連結，若問題出在我端可以即時公告

如此一來，第一次聯繫就能拿到完整資訊，減少來回詢問。

## 想自己試試？

- 查看程式碼與截圖：[`Zakkaus/cf-pages`](https://github.com/Zakkaus/cf-pages)
- 直接觸發範例頁（例如離線通知）：[error.zakk.au/offline.html](https://error.zakk.au/offline.html)
- 需要換成自己品牌？替換倉庫中的素材、調整 `lang.js` 文案，再部署到你的 Cloudflare Pages 專案即可。

這套錯誤頁讓「遇到 Cloudflare 訊息」不再突兀，也能在關鍵時刻提供語言一致、資訊充足的支援流程。
