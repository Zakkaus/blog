---
slug: cloudflare-error-pages
title: "打造多语言 Cloudflare 错误页"
date: 2025-10-01
tags: ["Cloudflare","Pages","Error Pages"]
categories: ["Infrastructure"]
description: "记录 error.zakk.au 如何使用自建的 Cloudflare Pages 项目提供品牌化的多语言错误页。"
translationKey: "cloudflare-error-pages"
authors:
  - "Zakk"
seo:
  description: "Cloudflare Pages 项目 error.zakk.au 的幕后细节，提供多语言、响应式的错误与挑战模板，覆盖每种 Cloudflare 场景。"
  keywords:
    - "Cloudflare 错误页"
    - "Cloudflare Pages"
    - "自定义错误页"
    - "Zakk"
    - "多语言界面"
    - "Tailwind CSS"
    - "Ray ID 排障"
---

## 为什么要做 error.zakk.au？

Cloudflare 默认错误页与网站调性差很多，访问者会觉得被跳出站外。我想要一个轻量替代方案，能够：

- 自动识别浅色 / 深色模式，也允许使用者手动切换
- 自动识别语言（英文、繁体中文、简体中文），并允许手动切换
- 显示 **Ray ID** 与预填信息的支援邮件链接，减少排障时间
- 完全托管在 Cloudflare Pages 上，只要 git push 就能更新

于是就诞生了 [`Zakkaus/cf-pages`](https://github.com/Zakkaus/cf-pages) 仓库，以及正式上线的 [error.zakk.au](https://error.zakk.au/)。

## 仓库里有哪些模板？

仓库收录常见的 Cloudflare 错误模板，并用 Tailwind CSS 重写版面：

| 模板 | 场景 |
| --- | --- |
| `cf-1000.html` | Cloudflare 1000 系列配置错误 |
| `cf-500.html` | 源站 5xx 错误 |
| `cf-waf-block.html` | WAF（403）拦截 |
| `cf-ip-block.html` | IP / 国家封锁 |
| `cf-ip-challenge.html`、`cf-attack.html` | 管理式验证 / I'm Under Attack Mode |
| `cf-rate-limit.html` | 429 速率限制 |
| `offline.html` | Always Online™ 离线提示 |

每个页面都会显示品牌视觉（Logo、3D 树袋熊）、实时 Ray ID，以及引导使用者自助排障的主要按钮。

## 多语言文案与自动切换

所有文案集中在 `lang.js`：

1. 读取 `navigator.language`
2. 匹配 `en`、`zh-Hant` 或 `zh-Hans`
3. 若没有匹配则使用默认语言

用户仍可手动选择语言，并会写入 `localStorage`，下次访问会自动套用。

## 设计系统与样式

- **Tailwind CSS 流程**：在 `input.css` 编写类名，执行 `npm run build`（或 `pnpm run build`）生成 `output.css`。
- **日夜模式成对设计**：`assets/screenshots/*.webp` 保留浅色与深色截图，确保对比符合 WCAG。
- **共享组件**：按钮、提示、栅格与本站 Blowfish 主题一致，让使用者在各站切换毫无违和感。

## 部署到 Cloudflare Pages

1. 将仓库连接到 Pages，构建命令使用 `npm run build`。
2. Framework preset 选择 None，Pages 会在部署时编译 Tailwind。
3. 输出目录设为 `/`，Cloudflare 会直接映射根目录的 HTML 模板。
4. 在 Custom Error Pages 指定 **error.zakk.au**，也可延伸到 help.zakk.au 等站点。

每次提交都会生成预览环境，可先验证再在 Cloudflare 控制台启用。

## Ray ID 的支援流程

模板底部的「Need help?」区块会：

- 实时显示触发错误的 Ray ID
- 提供预填邮件链接，把 Ray ID、时间戳与客户端 IP 一次交给支援信箱（Cloudflare 注入后）
- 附上状态页链接，若问题出在我端能立即公告

这样第一次联络就带齐所有细节，大幅减少追问。

## 想自己试试？

- 查看程式码与截图：[Zakkaus/cf-pages](https://github.com/Zakkaus/cf-pages)
- 触发范例页面（例如离线提示）：[error.zakk.au/offline.html](https://error.zakk.au/offline.html)
- 想换成自己的品牌？替换仓库里的素材、调整 `lang.js` 文案，再部署到你的 Cloudflare Pages 项目即可。

这套错误页让「Cloudflare 提示」不再突兀，也能在关键时刻提供语言一致、资讯充分的支援体验。
