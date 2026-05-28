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

一个在 Cloudflare 边缘网络上运行的小型 Worker，提供实时网站统计，不需要 Google Analytics、不需要 Cookie，也不依赖第三方脚本。在线演示：**[stats.zakk.au](https://stats.zakk.au/)**。

![统计仪表板](stats-dashboard.webp)

## 为什么用这个 Worker？

- **无 Cookie。** 访客 IP 经 SHA-256 哈希并截断后才存储。
- **免费额度够用。** 个人站点基本都能跑在 Cloudflare 的免费方案内。
- **边缘原生。** 基于 Workers + KV，由 Cloudflare 全球网络提供服务。
- **多语言路径感知。** 自动规范化不同语言版本的 URL。
- **API + 仪表板合一。** 单一 Worker 同时承载，不需要额外前端托管。

## 你会得到什么

**实时统计**

- 今日 PV/UV 实时更新
- 7 / 14 / 30 天趋势
- 热门页面 Top 10

**仪表板**

- 深浅色主题
- 响应式布局，桌面与手机均可
- 简中 / 英文界面
- 部署在你自己的子域名（例如 `stats.example.com`）

**API**

- REST 端点，方便自定义集成
- 批次端点用于高效查询
- 健康检查端点用于监控

## 快速部署

需求：Node.js ≥ 18、`wrangler` CLI ≥ 3.0。

1. **克隆仓库**
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
   将返回的 ID 填入 `wrangler.toml`。

4. **（可选）启用 D1 以支持趋势图与热门页面**
   ```bash
   wrangler d1 create cloudflare-stats-top
   wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote
   ```
   取消 `wrangler.toml` 中 `d1_databases` 区块的注释，并填入生成的 ID。

5. **部署**
   ```bash
   wrangler deploy
   ```

6. **打开仪表板**

   ```
   https://stats.example.com/
   ```

   你会看到和 [stats.zakk.au](https://stats.zakk.au/) 一样的界面：

   - 今日 PV/UV 卡片
   - API 健康状态指示
   - 7 / 14 / 30 天趋势图
   - 热门页面排行
   - 主题切换（深 / 浅）
   - 语言切换（简中 / 英文）

   仪表板是独立的——不需要嵌入，把网址分享出去就行。

## 定价方案：免费 vs 付费

### Workers

| 方案 | 价格 | 包含请求数 | CPU 时间 | 超额计费 |
|------|------|-----------|---------|---------|
| **免费** | $0 | 每日 10 万次 | 10ms/次 | N/A（硬性上限） |
| **付费** | **$5/月** | 每月 1000 万次 | 50ms/次 | 每增加 100 万次 $0.50 |

### KV（键值存储）

| 方案 | 价格 | 读取 | 写入/删除/列表 | 存储空间 | 超额计费 |
|------|------|------|---------------|---------|---------|
| **免费** | $0 | 每日 10 万次 | 每日 1000 次 | 1 GB | N/A（硬性上限） |
| **付费** | **包含在 Workers Paid ($5/月)** | 每月 1000 万次 | 每月 100 万次 | 1 GB | • 读取：每 1000 万次 $0.50<br>• 写入：每 100 万次 $5<br>• 存储：每 GB/月 $0.50 |

### D1（无服务器 SQL 数据库）

| 方案 | 价格 | 读取列数 | 写入列数 | 存储空间 | 超额计费 |
|------|------|---------|---------|---------|---------|
| **免费** | $0 | 每日 500 万列 | 每日 10 万列 | 500 MB | N/A（硬性上限） |
| **付费** | **$5/月** | 每月 250 亿列 | 每月 5000 万列 | 5 GB | • 读取：每 100 万列 $0.001<br>• 写入：每 100 万列 $1<br>• 存储：每 GB/月 $0.75 |

### 按需计费选项

即使不订阅付费方案，也可以**启用按需计费**以避免硬性上限：
- Workers：超过免费额度后每 100 万次请求 $0.50
- KV：按上述单项操作计费
- D1：按上述单项操作计费

### 哪种方案适合你

- **小型个人博客（< 1 万访客 / 日）：** 免费方案足够。
- **中型博客（1–5 万访客 / 日）：** Workers Paid（$5 / 月）。
- **高流量网站（> 5 万访客 / 日）：** Workers Paid + KV/D1 按需计费。

> D1 是可选的。如果你只需要实时 PV/UV，单靠 KV 就够，仪表板仍可用（仅少 Top 10 趋势）。

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

**为什么不用 Google Analytics？**
自架方案让你完全掌控数据，无需 Cookie，也不会被广告拦截器挡住。

**可以自定义仪表板吗？**
可以。仪表板源码在 `dashboard/`，修改 HTML/CSS/JS 即可。

**如何备份数据？**
用项目内的备份脚本，定期把 KV 数据导出到 R2 或 GitHub。

---

这套就是 [stats.zakk.au](https://stats.zakk.au/) 背后的技术栈。部署后你会得到：

- 部署在自有域名上的独立统计仪表板
- 完整的统计 REST API
- 无 Cookie 的隐私优先追踪

问题与回报：[GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)。
