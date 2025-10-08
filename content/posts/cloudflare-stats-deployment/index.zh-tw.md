---
title: "Cloudflare Stats Worker 統計系統部署指南"
date: 2025-01-08
draft: false
description: "部署自己的統計儀表板,就像 stats.zakk.au 一樣使用 Cloudflare Workers"
tags: ["Cloudflare", "Analytics", "Hugo"]
---

想要即時掌握 PV/UV 卻不想塞進 Google Analytics?**Cloudflare Stats Worker** 把 API 與獨立儀表板網站打包在同一個 Worker。看看實際案例 [stats.zakk.au](https://stats.zakk.au/)!

## 為什麼選擇 Cloudflare Stats Worker

- 隱私優先:無 Cookie、IP 雜湊
- 單一 Worker 全搞定:同時拿到統計 API 與儀表板網站
- 多語言友善:自動正規化路徑
- 零元起跳:Cloudflare 免費額度足以支撐個人部落格
- Hugo Blowfish 整合簡單:前端腳本即開即用

## 儀表板亮點

造訪 **[stats.zakk.au](https://stats.zakk.au/)** 看看實際運作!

- 即時今日/全站 PV·UV 卡片
- 熱門文章排行
- 7/30 天趨勢圖表
- 深淺色主題切換
- 獨立部署在自訂網域

## 快速開始

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
./scripts/install.sh
```

## 訪問儀表板

部署完成後,直接訪問你的儀表板網域:

```
https://stats.example.com/
```

**選配:嵌入部落格**

如果你想把儀表板嵌入部落格(如本站的 `/stats/` 頁面),可使用 iframe 或專案提供的 Hugo 短碼。

---

這份指南即是 [stats.zakk.au](https://stats.zakk.au/) 的數據骨幹。完成部署後,你將擁有獨立儀表板網站、完整的統計 API 與 Hugo 文章頁即時 PV/UV 顯示。

如有問題,歡迎造訪 [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)。
