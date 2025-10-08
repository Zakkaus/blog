---
title: "Cloudflare Stats Worker 部署与整合全指南"
slug: "cloudflare-stats-worker-deploy"
translationKey: "cloudflare-stats-deploy"
date: 2025-10-08
draft: false
aliases:
  - "/zh-cn/posts/cloudflare-stats/"
  - "/zh-cn/posts/cloudflare-stats-worker-guide/"
description: "完整介绍 Cloudflare Stats Worker 的架构、部署脚本与 Hugo Blowfish 整合技巧。"
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
  title: "Cloudflare Stats Worker 部署与整合全指南"
  description: "解析 stats.zakk.au 背后的 Cloudflare Stats Worker，包括部署流程、脚本、仪表板与 Hugo 整合细节。"
---
{{< lead >}}
Cloudflare Stats Worker 是我在 zakk.au 部署的开源数据统计方案：一个 Worker 就能同时提供 API、仪表板以及 Hugo Blowfish 的整合，让 PV / UV 实时刷新又不泄露访客隐私。本指南把架构、部署、调优一次讲透，照着步骤就能复刻 `stats.zakk.au` 的完整体验。{{< /lead >}}

## 为什么选择 Cloudflare Stats Worker

- **零 Cookie、零第三方追踪**：数据全部留在你的 Cloudflare KV / D1 里，自行掌控保存策略。
- **一次部署、全套功能**：同一个 Worker 就提供 `/api/*` 接口和仪表板页面。
- **多语言 slug 统一**：`/zh-cn/posts/foo/` 与 `/posts/foo/` 会归并为同一个计数键。
- **免费额度够用**：对个人博客而言，Cloudflare 免费配额完全足够。

## 架构与数据流

```mermaid
graph LR
  Browser[访客打开页面] -->|fetch /api/count| Worker[Stats Worker]
  Browser -->|fetch /api/batch| Worker
  Worker -->|读写| KV[(Cloudflare KV)]
  Worker -->|可选| D1[(Cloudflare D1)]
  Dashboard[stats.zakk.au 仪表板] -->|fetch /api/stats /api/daily| Worker
```

- 前端脚本位于 `assets/js/cloudflare-stats.js`，会自动抓取列表页与文章页的 PV / Like 占位符。
- Worker 端以 `page:/posts/foo/:pv`、`:uv` 作为键值，确保不同语言共用同一份数据。
- 仪表板由同一个 Worker 提供静态页面，无需额外托管。

## 仪表板亮点

- **今日 PV / UV 卡片**：一眼看到实时增长。
- **热门文章排行**：追踪哪些内容正在发酵。
- **每日趋势图**：预设显示 7 / 30 天，原生支持深浅色模式。
- **全屏模式**：手机和平板浏览同样舒适。

想先体验？欢迎到 [统计监控页面](/zh-cn/stats/) 或其它语言版本先行预览。

## 部署前准备

- 注册 Cloudflare 帐号并启用账单（免费额度即可覆盖）。
- 主域名托管在 Cloudflare，方便配置子域名路由。
- 已安装 Git、Node.js 18+、Wrangler CLI（`npm install -g wrangler`）。
- 推荐在 macOS、Linux 或 WSL2 环境执行脚本。

## 步骤 1：取得原始码

```bash
git clone https://github.com/Zakkaus/cloudflare-stats-worker.git
cd cloudflare-stats-worker
```

目录说明：

- `src/`：Cloudflare Worker 源码。
- `dashboard/`：随 Worker 部署的静态仪表板。
- `scripts/`：本文会用到的自动化脚本。

## 步骤 2：执行安装脚本

```bash
./scripts/install.sh
```

脚本会依序：

1. 检查 Wrangler 是否已登录。
2. 创建 KV 命名空间并写入 `wrangler.toml`。
3. 部署 Worker 并绑定子域名（例如 `stats.example.com`）。
4. 进行健康检查，预期返回 `{"status":"ok"}`。

若要使用不同子域，可加上 `--domain stats.yoursite.com`，完整参数请看 `./scripts/install.sh --help`。

## 步骤 3：验证 API

先确认健康检查通过：

```bash
curl https://stats.example.com/health
# {"status":"ok"}
```

常用端点：

```bash
curl "https://stats.example.com/api/count?url=/" | jq
curl "https://stats.example.com/api/stats" | jq
curl "https://stats.example.com/api/daily" | jq
```

也可以执行验证脚本：

```bash
./scripts/verify.sh https://stats.example.com
```

它会一次打完所有端点并输出通过 / 失败结果。

## 步骤 4：接入 Hugo 前端脚本

把 `cloudflare-stats-worker/client/cloudflare-stats.js` 复制到你的 Hugo 专案，例如 `assets/js/cloudflare-stats.js`。

接着在 `layouts/partials/extend-head.html` 加入：

```go-html-template
{{ $stats := resources.Get "js/cloudflare-stats.js" | resources.Minify | resources.Fingerprint }}
<script defer src="{{ $stats.RelPermalink }}" data-api="https://stats.example.com"></script>
```

脚本会：

- 寻找 `span[id^="views_"]`、`span[id^="likes_"]`。
- 正规化 URL（例如 `/zh-cn/posts/foo/` → `/posts/foo/`）。
- 调用 `/api/count`、`/api/batch` 并即时更新 DOM。
- 若请求失败则显示 `—`，避免版面错位。

## 步骤 5：覆写 Blowfish 模板

为了让所有语言共用同一 slug，需要新增下列覆写：

- `layouts/_default/list.html`
- `layouts/_default/single.html`
- `layouts/partials/meta/views.html`
- `layouts/partials/meta/likes.html`

示例片段：

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

这样 `/zh-cn/posts/foo/`、`/posts/foo/`、`/posts/foo/index.html` 都会写入同一个键值。

## 步骤 6：本地测试

```bash
hugo server -D
```

在文章页的浏览器 Network 面板检查：

- `/api/count?url=/posts/foo/` 返回 200。
- `/api/batch` 覆盖所有占位符的 PV 数据。
- Console 不再出现 `count error` 警告。

若想压测，可用 `hey` 或 `autocannon` 打 `/api/count`，观察 KV 延迟表现。

## 步骤 7：建立统计仪表板页面

本站利用 Hugo 主题模板与短码嵌入仪表板：

```markdown
{{< statsDashboard url="https://stats.example.com" heightClass="h-[1200px]" >}}
```

- 短码位于 `layouts/shortcodes/statsDashboard.html`，自带圆角、阴影与暗色模式样式。
- 配合 `content/stats/index.*.md` 即可生成 `/stats/` 页面，同时保留 Blowfish 的单篇排版。
- 若要完全自定义 UI，可以把 `dashboard/` 资源改写成 Hugo partial 或独立 SPA。

## 常见问题

### 为什么不用 Google Analytics？
自托管方案可控、无 Cookie，在部分地区也不会被封锁，同时可以随需求扩充数据模型。

### 仪表板会拖慢页面吗？
仪表板通过 `<iframe>` 独立加载，文章脚本也使用 `defer` 与批量 API，首屏影响极小。

### 可以扩展数据模型吗？
当然，可以把 Worker 存储格式换成 JSON、增加 D1 数据表，或把数据投递到外部 BI。 

## 故障排查

| 现象 | 排查步骤 |
| ---- | -------- |
| `/api/count` 返回 500 | 使用 `npx wrangler tail --format=json` 查看日志 |
| PV / UV 不更新 | 检查前端 `data-api`、`data-site`，或清除 Cloudflare 缓存 |
| 想屏蔽内部流量 | 在 `src/router.ts` 增加 IP / UA 黑名单，或接入 Turnstile |
| 仪表板空白 | 确认 CORS 设置、iframe URL 与 CSP Header |

## 后续优化

- 定期把 KV 快照备份到 R2 或 GitHub。
- 启用 D1 将每日统计写入表格，方便长期分析。
- 利用 Cloudflare Queues / Scheduled Jobs 做每小时整理。
- 把仪表板加入主菜单（本文末尾有示例配置）。

---

这份部署指南即是 zakk.au 的数据骨干—如果你在实作中遇到问题，欢迎邮件或到 Matrix 聊天室联系我。
