---
slug: cloudflare-stats-worker-deploy
title: "Cloudflare Stats Worker - 隐私优先的统计仪表板"
date: 2025-01-08
tags: ["Cloudflare", "Analytics", "Workers", "Privacy"]
categories: ["Infrastructure"]
description: "部署你自己的隐私优先统计仪表板,就像 stats.zakk.au 一样使用 Cloudflare Workers"
translationKey: "cloudflare-stats-deploy"
authors:
  - "Zakk"
---

想要实时网站统计却不想用 Google Analytics?**Cloudflare Stats Worker** 是一个完全运行在 Cloudflare 边缘网络上的隐私优先分析方案。

看看实际案例：**[stats.zakk.au](https://stats.zakk.au/)**

![统计仪表板](stats-dashboard.webp)

## 为什么选择 Cloudflare Stats Worker?

- **隐私优先**：无 Cookie，IP 地址经 SHA-256 哈希并截断
- **零成本**：大多数个人网站使用 Cloudflare 免费方案即可运行
- **边缘性能**：基于 Cloudflare Workers + KV，全球低延迟访问
- **多语言支持**：自动规范化不同语言版本的路径
- **完整方案**：单一 Worker 同时提供 API 端点与独立仪表板

## 主要特色

### 实时分析
- 今日 PV/UV 实时计数器
- 7/14/30 天历史趋势
- 热门页面 Top 10 排行

### 精美仪表板
- 玻璃拟态设计，支持深浅色主题
- 响应式布局，支持手机与桌面
- 多语言界面（简中/英文）
- 可通过自定义域名访问（如 stats.example.com）

### 开发者友善 API
- RESTful API 端点，方便自定义集成
- 批次操作，高效数据查询
- 健康检查端点，便于监控

## 快速部署

> 需求：Node.js ≥ 18、`wrangler` CLI ≥ 3.0

1. **克隆并进入项目目录**
   ```bash
   git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
   cd cloudflare-stats-worker
   ```

2. **安装 Wrangler 并登录**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **创建 KV 命名空间**
   ```bash
   wrangler kv namespace create PAGE_STATS
   wrangler kv namespace create PAGE_STATS --preview
   ```
   然后将 ID 粘贴到 `wrangler.toml` 中。

4. **（可选）启用 D1 以支持趋势图与热门页面**
   ```bash
   wrangler d1 create cloudflare-stats-top
   wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote
   ```
   取消 `wrangler.toml` 中 `d1_databases` 区块的注释，并填入生成的 ID。

5. **部署 🎉**
   ```bash
   wrangler deploy
   ```

## 步骤 7：访问统计仪表板

部署完成后，直接访问你的仪表板域名：

```
https://stats.example.com/
```

你会看到与 [stats.zakk.au](https://stats.zakk.au/) 相同的精美分析界面：

- **实时指标**：今日 PV/UV 卡片实时更新
- **API 健康状态**：可视化系统状态指示器
- **趋势图表**：7/14/30 天交互式图表
- **热门页面**：最受欢迎内容排行榜
- **主题切换**：深浅色模式自由切换
- **语言选择器**：简中/英文界面选项

仪表板完全独立运作 - 无需嵌入，直接分享网址即可！

## 免费方案与升级选项

| 服务 | 免费额度 | 何时升级 |
|------|---------|---------|
| **Workers** | 每日 100k 请求<br>10ms CPU 时间 | 当每日流量超过 100k 或需要更大 CPU 资源时，升级到 **Workers Paid ($5/月)**。 |
| **KV** | 1 GB 存储空间<br>每日 100k 次读取<br>每日 1k 次写入 | 当需要存储大型 JSON 或保留长期历史记录时，升级到付费方案。 |
| **D1** | 每月 5M 次查询<br>1 GB 存储空间 | 当需要大量使用 Top 10 排行或长时间趋势查询时，升级到 D1 Paid。 |

> **注意**：D1 是可选的。如果你只需要实时 PV/UV 统计，KV 已足够，仪表板依然可用（仅缺少 Top 10 与趋势图）。

对大多数个人网站来说，免费方案绰绰有余！

## API 端点

部署后，你可以访问这些端点：

```bash
# 健康检查
curl https://stats.example.com/health

# 页面浏览计数
curl "https://stats.example.com/api/count?url=/posts/example/"

# 整体统计
curl https://stats.example.com/api/stats

# 每日趋势
curl https://stats.example.com/api/daily
```

## 架构

```
浏览器 → Worker (stats.example.com)
          ├── /api/*     → 统计 API
          ├── /*         → 仪表板静态文件
          └── Storage    → Cloudflare KV
```

## 常见问题

### 为什么不用 Google Analytics?
自架方案让你完全掌控数据，无需 Cookie，且不会被广告拦截器封锁。

### 可以自定义仪表板吗?
当然！仪表板源码在 dashboard/ 文件夹，可修改 HTML/CSS/JS 配合你的品牌风格。

### 如何备份数据?
使用项目提供的备份脚本，定期将 KV 数据导出到 R2 或 GitHub。

---

这就是 [stats.zakk.au](https://stats.zakk.au/) 背后的技术架构。部署完成后，你将拥有：

✅ 自定义域名的独立统计仪表板  
✅ 完整的统计 REST API  
✅ 无 Cookie 的隐私优先追踪  

如有问题，欢迎造访 [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)。
