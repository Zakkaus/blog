---
title: "Cloudflare Stats Worker 统计系统指南"
slug: "cloudflare-stats-worker-guide"
translationKey: "cloudflare-stats-guide"
date: 2025-10-08T00:00:00+00:00
lastmod: 2025-10-08T00:00:00+00:00
description: "介绍如何部署 Cloudflare Stats Worker、配置 Hugo Blowfish 主题并嵌入统计仪表板。"
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
  title: "Cloudflare Stats Worker 部署配置全攻略"
  description: "一步步教你部署 Cloudflare Stats Worker、设置自定义域名并与 Blowfish 主题整合。"
---

> 目前详细内容以繁体中文版为主：<a href="/zh-tw/posts/cloudflare-stats-worker-guide/">Cloudflare Stats Worker 統計系統完全指南</a>。我们会在完成整理后补上简体中文版全文。

## 快速重点

- 使用脚本 `./scripts/install.sh` 部署 Worker 并自动建立 KV 绑定。
- 在 Cloudflare 控制台设定 `stats.example.com` 路由到该 Worker。
- 将 `assets/js/cloudflare-stats.js` 引入你的 Hugo 项目，并在 `extend-head.html` 中载入。
- 覆写 Blowfish 模板（`_default/list.html`、`_default/single.html`、`partials/meta/views.html`、`partials/meta/likes.html`）确保 slug 正规化。
- 新增 `stats` 页面（版面 `stats/stats-dashboard`）或直接通过 `<iframe>` 嵌入 Worker 仪表板。

完整译文即将推出，敬请期待。
