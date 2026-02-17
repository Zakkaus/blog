# Gentoo Article Synchronization Guide

This document summarizes the synchronization workflow, language differences, and specific adjustments made when porting articles from `gentoo-zh.github.io` to this blog.

## Overview

*   **Source**: [gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io) (Simplified Chinese)
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
    1.  Copy content from `gentoo-zh.github.io`.
    2.  Preserve blog-specific frontmatter (`slug`, `authors`, `translationKey`, `featureImage`).
    3.  **Link Adjustment**:
        *   Convert `/posts/YYYY.../` -> `/posts/slug/`.
        *   **Crucial**: Replace `/mirrorlist/` with `https://www.gentoo.org/downloads/mirrors/`.
        *   **Crucial**: Replace `/download/` with `https://www.gentoo.org/downloads/`.
*   **Mirrors**: Retain recommendation for Chinese mirrors (USTC, TUNA, Aliyun).
*   **LiveGUI Recommendation**: Gig-OS LiveGUI (https://iso.gig-os.org/) with Chinese support and login credentials.

### Traditional Chinese (`.zh-tw.md`)
*   **Details**: Converted from `zh-cn` using OpenCC and custom terminology fixes.
*   **Conversion Tool**: `gentoo-zh.github.io/sync_to_tw.sh`.
*   **Adjustments**:
    *   **Terms**: `软件` -> `軟體`, `默认` -> `預設`, etc.
    *   **Mirrors**: Replaced Chinese mirrors with Taiwan/Global mirrors (TWAREN).
    *   **Links**: Same adjustments as `zh-cn`.
*   **LiveGUI Recommendation**: Same as `zh-cn` - Gig-OS LiveGUI with Chinese support.

### English (`.en.md`)
*   **Details**: Manually translated/adapted from `zh-tw` (to ensure latest content).
*   **Adjustments**:
    *   **Content**: "Globalized" content. Removed references to Chinese communities (Telegram groups, QQ, WeChat).
    *   **Mirrors**: Use `mirrorselect` or link to official mirror list. Remove region-specific mirrors.
    *   **Links**: Point to official `gentoo.org` documentation and download pages.
    *   **Downloads**: Link to `https://www.gentoo.org/downloads/`.
    *   **Timezone**: Use generic examples (UTC) or list common timezones.
    *   **Input Methods**: Include multilingual support (Chinese, Japanese, Korean, Vietnamese, Arabic, etc.).
    *   **Fonts**: Include multilingual font packages.
    *   **Community**: Use Gentoo Forums and IRC (#gentoo @ Libera.Chat).

## Content-Specific Differences

### LiveGUI USB Image Recommendations

*   **Chinese versions** (`zh-cn`, `zh-tw`): 
    *   Recommend Gig-OS LiveGUI (https://iso.gig-os.org/)
    *   Include login credentials (live/live/live)
    *   Mention Chinese language support, fcitx5, and other features
    
*   **English version** (`en`):
    *   Recommend official Gentoo LiveGUI USB Image
    *   Link to https://www.gentoo.org/downloads/
    *   Emphasize general benefits (browser, Wi-Fi setup, multiple terminals)

### Input Methods (English Version)

Include packages that actually exist in Gentoo. Verify at: https://packages.gentoo.org/categories/app-i18n

**Verified Working Packages**:

| Language | Package | Notes |
|----------|---------|-------|
| Chinese (Fcitx5) | `app-i18n/fcitx` | Framework |
| Chinese | `app-i18n/fcitx-chinese-addons` | Addons |
| Japanese | `app-i18n/mozc` | Google Japanese Input |
| Japanese | `app-i18n/anthy` | Japanese input |
| Japanese | `app-i18n/fcitx-anthy` | Fcitx Anthy |
| Korean | `app-i18n/fcitx-hangul` | Korean for Fcitx |
| Korean | `app-i18n/ibus-hangul` | Korean for IBus |
| Vietnamese | `app-i18n/fcitx-unikey` | Vietnamese for Fcitx |
| Vietnamese | `app-i18n/ibus-unikey` | Vietnamese for IBus |
| Multilingual | `app-i18n/ibus` | IBus framework |
| Multilingual | `app-i18n/fcitx-rime` | Rime for Fcitx |
| Multilingual | `app-i18n/ibus-rime` | Rime for IBus |

**DO NOT Use** (packages don't exist):
- `app-i18n/bamboo` ❌
- `app-i18n/nimf` ❌
- `app-i18n/keyman` ❌
- `app-i18n/univie` ❌

### Fonts (English Version)

Include packages that actually exist in Gentoo. Verify at: https://packages.gentoo.org/categories/media-fonts

**Verified Working Packages**:

| Category | Package | Notes |
|----------|---------|-------|
| Universal | `media-fonts/noto` | Google Noto (covers many languages) |
| CJK | `media-fonts/noto-cjk` | Chinese, Japanese, Korean |
| Chinese | `media-fonts/wqy-microhei` | WenQuanYi MicroHei |
| Chinese | `media-fonts/wqy-zenhei` | WenQuanYi ZenHei |
| Chinese | `media-fonts/arphicfonts` | Arphic Chinese fonts |
| Japanese | `media-fonts/ipaex-fonts` | IPA Ex Gothic |
| Japanese | `media-fonts/mplus-outline-fonts` | M+ fonts |
| Korean | `media-fonts/nanum-gothic` | Nanum Gothic |
| Korean | `media-fonts/nanum-gothic-coding` | Nanum Gothic Coding |
| Arabic | `media-fonts/noto` | Includes Arabic |
| Arabic | `media-fonts/dejavu` | Includes Arabic |
| Arabic | `media-fonts/scheherazade` | Arabic font |
| Arabic | `media-fonts/freefont` | FreeFont collection |
| Hebrew | `media-fonts/noto` | Includes Hebrew |
| Hebrew | `media-fonts/culmus` | Hebrew academic fonts |
| Cyrillic | `media-fonts/noto` | Includes Cyrillic |
| Cyrillic | `media-fonts/dejavu` | Includes Cyrillic |
| Cyrillic | `media-fonts/liberation-fonts` | Liberation fonts |
| Indian | `media-fonts/lohit-deva` | Hindi/Devanagari |
| Indian | `media-fonts/lohit-bengali` | Bengali |
| Indian | `media-fonts/lohit-tamil` | Tamil |
| Thai | `media-fonts/tlwg-latex` | TLWG Thai fonts |
| Coding | `media-fonts/jetbrains-mono` | JetBrains Mono |
| Coding | `media-fonts/fira` | Fira Code |
| Coding | `media-fonts/source-code-pro` | Source Code Pro |
| Coding | `media-fonts/cascadia-code` | Cascadia Code |

### Timezone Configuration (English Version)

Use generic examples or list common timezones. Show how to find the list.

```bash
# List available timezones:
ls /usr/share/zoneinfo/

# Common timezones:
# UTC, America/New_York, America/Los_Angeles, America/Chicago
# Europe/London, Europe/Paris, Europe/Berlin
# Asia/Tokyo, Asia/Shanghai, Asia/Singapore
# Australia/Sydney, Pacific/Auckland
```

## Common Replacements

| Original (Source) | Replacement (Target) |
| :--- | :--- |
| `/mirrorlist/` | `https://www.gentoo.org/downloads/mirrors/` |
| `/download/` | `https://www.gentoo.org/downloads/` |
| `https://www.gentoo.org.cn/mirrorlist/` | `https://www.gentoo.org/downloads/mirrors/` |
| `Asia/Taipei` | `UTC` (or user's timezone) |
| `China mirrors (USTC, TUNA, Aliyun)` | Use `mirrorselect` |
| `Gentoo 中文社群` | `Gentoo Community` |
| Telegram/QQ/WeChat links | Remove or replace with Gentoo Forums |

## Maintenance Workflow

When `gentoo-zh` updates:

1.  **Sync `zh-cn`**:
    *   Copy files from `gentoo-zh.github.io/content/posts/`.
    *   Run link replacements (see Common Replacements).
    *   Verify frontmatter.

2.  **Regenerate `zh-tw`**:
    *   Run `gentoo-zh.github.io/sync_to_tw.sh` to convert.
    *   Manually check formatting and links.

3.  **Update `en`**:
    *   Start from `zh-tw` version.
    *   Apply all English-specific adjustments (see above).
    *   Verify packages exist in Gentoo.
    *   Use generic/global examples.

## Known Issues & Fixes

### Slug Consistency
**Issue**: Article `2025-10-02-gentoo-m-series-mac` had inconsistent slugs between languages.

*   **Fix**: Ensure `slug` field matches across all language versions.

### Package Verification
**Issue**: Some packages listed may not exist in Gentoo.

*   **Fix**: Always verify packages at https://packages.gentoo.org/ before adding to articles.

### Mixed Language Text
**Issue**: Sometimes Chinese text remains in English articles.

*   **Fix**: Check for non-ASCII characters:
    ```bash
    grep -P '[\\x{4e00}-\\x{9fff}]' content/posts/*/index.en.md
    ```

## Verification Checklist

Before publishing English version:

- [ ] No Chinese/Taiwan/China-specific content
- [ ] All package names verified at packages.gentoo.org
- [ ] Links point to official Gentoo resources
- [ ] Timezone uses generic examples
- [ ] Community links are global (Forums, IRC)
- [ ] Mirror recommendations use mirrorselect or official list
- [ ] No mixed language text (e.g., "recommend 3-6 hours")
