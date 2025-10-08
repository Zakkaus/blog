---
title: "Cloudflare Stats Worker 统计系统部署指南"
date: 2025-01-08
draft: false
description: "部署自己的统计仪表板,就像 stats.zakk.au 一样使用 Cloudflare Workers"
tags: ["Cloudflare", "Analytics", "Hugo"]
---

想要实时掌握 PV/UV 却不想塞进 Google Analytics?**Cloudflare Stats Worker** 把 API 与独立仪表板网站打包在同一个 Worker。看看实际案例 [stats.zakk.au](https://stats.zakk.au/)!

## 为什么选择 Cloudflare Stats Worker

- 隐私优先:无 Cookie、IP 哈希
- 单一 Worker 全搞定:同时拿到统计 API 与仪表板网站
- 多语言友善:自动规范化路径
- 零元起跳:Cloudflare 免费额度足以支撑个人博客
- Hugo Blowfish 集成简单:前端脚本即开即用

## 仪表板亮点

造访 **[stats.zakk.au](https://stats.zakk.au/)** 看看实际运作!

- 实时今日/全站 PV·UV 卡片
- 热门文章排行
- 7/30 天趋势图表
- 深浅色主题切换
- 独立部署在自定义域名

## 快速开始

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
./scripts/install.sh
```

## 访问仪表板

部署完成后,直接访问你的仪表板域名:

```
https://stats.example.com/
```

**选配:嵌入博客**

如果你想把仪表板嵌入博客(如本站的 `/stats/` 页面),可使用 iframe 或项目提供的 Hugo 短代码。

---

这份指南即是 [stats.zakk.au](stats.zakk.au/) 的数据骨干。完成部署后,你将拥有独立仪表板网站、完整的统计 API 与 Hugo 文章页实时 PV/UV 显示。

如有问题,欢迎造访 [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)。
