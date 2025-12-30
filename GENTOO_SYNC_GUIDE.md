# Gentoo Article Synchronization Guide

This document summarizes the synchronization workflow, language differences, and specific adjustments made when porting articles from `gentoo-zh.github.com` to this blog.

## Overview

*   **Source**: [gentoo-zh.github.com](https://github.com/gentoo-zh/gentoo-zh.github.com) (Simplified Chinese)
*   **Target**: This Hugo blog (`content/posts/`)
*   **Languages**: Simplified Chinese (`zh-cn`), Traditional Chinese (`zh-tw`), English (`en`)

## File Structure & Differences

### 1. Source Structure (gentoo-zh)
*   Format: Jekyll/Hexo style Markdown.
*   Internal Links: `/posts/YYYY-MM-DD-title/` (Relative or Absolute).
*   Special Pages: `/mirrorlist/`, `/download/` (Internal pages).

### 2. Target Structure (Blog)
*   Format: Hugo Standard (`index.{lang}.md`).
*   Internal Links: `/posts/slug/` (Hugo automatically handles language prefixes `/zh-cn/`, `/zh-tw/`).

## Language Specifics

### Simplified Chinese (`.zh-cn.md`)
*   **Details**: Direct synchronization from source.
*   **Sync Logic**: 
    1.  Copy content from `gentoo-zh`.
    2.  Preserve blog-specific frontmatter (`slug`, `authors`, `translationKey`, `featureImage`).
    3.  **Link Adjustment**:
        *   Convert `/posts/YYYY.../` -> `/posts/slug/`.
        *   **Crucial**: Replace `/mirrorlist/` with `https://www.gentoo.org/downloads/mirrors/`.
        *   **Crucial**: Replace `/download/` with `https://www.gentoo.org/downloads/`.
*   **Mirrors**: Retain recommendation for Chinese mirrors (USTC, TUNA, Aliyun).

### Traditional Chinese (`.zh-tw.md`)
*   **Details**: Converted from `zh-cn` using OpenCC and custom terminology fixes.
*   **Conversion Tool**: `gentoo-zh.github.com/convert-zh-tw.sh`.
*   **Adjustments**:
    *   **Terms**: `软件` -> `軟體`, `默认` -> `預設`, etc.
    *   **Mirrors**: Replaced Chinese mirrors with Taiwan/Global mirrors (NCHC, CICKU).
    *   **Links**: Same adjustments as `zh-cn`.

### English (`.en.md`)
*   **Details**: Manually translated/adapted from `zh-tw` (to ensure latest content).
*   **Adjustments**:
    *   **Content**: "Globalized" content. Removed references to QQ groups, Chinese forums. Added links to `#gentoo` IRC and Gentoo Forums.
    *   **Mirrors**: Removed specific regional mirror configs in favor of generic examples or `mirrorselect`.
    *   **Links**: Pointed to official `gentoo.org` documentation and download pages.
    *   **Downloads**: Explicitly linked to `https://www.gentoo.org/downloads/`.

## Maintenance Workflow

When `gentoo-zh` updates:

1.  **Sync `zh-cn`**:
    *   Run `sync_gentoo_articles.py` (ensure logic handles new links).
    *   Manually verify Frontmatter.

2.  **Regenerate `zh-tw`**:
    *   Run `gentoo-zh.github.com/convert-zh-tw.sh` to generate new `zh-tw` files.
    *   Manually consistency check (Formatting, Links).

3.  **Update `en`**:
    *   Diff the `zh-tw` changes.
    *   Translate updates to `en` files manually.
    *   Ensure English tone and global context.

## Common Replacements

| Original (Source) | Replacement (Target) |
| :--- | :--- |
| `/mirrorlist/` | `https://www.gentoo.org/downloads/mirrors/` |
| `/download/` | `https://www.gentoo.org/downloads/` |
| `https://www.gentoo.org.cn/mirrorlist/` | `https://www.gentoo.org/downloads/mirrors/` |

**Note**: The blog does NOT have a local `/mirrorlist/` or `/download/` page. Always link to official Gentoo resources.
