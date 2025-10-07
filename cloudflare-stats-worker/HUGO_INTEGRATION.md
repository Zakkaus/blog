# Hugo 博客整合 Cloudflare Stats Worker 指南

本指南說明如何在 Hugo 博客（使用 Blowfish 主題）中整合 Cloudflare Stats Worker 來顯示文章閱讀量統計。

## 前置要求

- 已部署的 Cloudflare Stats Worker（參考主 README.md）
- Hugo 網站使用 Blowfish 主題
- Worker URL：`https://stats.zakk.au` 或你的自訂域名

## 整合步驟

### 1. 啟用閱讀量顯示

編輯 `config/_default/params.toml`，啟用 `showViews` 選項：

```toml
[article]
  showViews = true  # 顯示文章閱讀量
```

### 2. 創建統計腳本

創建文件 `assets/js/cloudflare-stats.js`：

```javascript
(function () {
  if (typeof window === "undefined") return;

  const API_BASE = "https://stats.zakk.au";  // 替換為你的 Worker URL
  const FETCH_TIMEOUT = 5000;

  document.addEventListener("DOMContentLoaded", init, { once: true });

  function init() {
    // 處理網站總流量 (timeline 頁面)
    initSiteStats();
    
    // 找出主題產生的所有 views_ placeholder
    const viewNodes = Array.from(document.querySelectorAll("span[id^='views_']"));
    
    if (!viewNodes.length) return;

    const currentPath = normalizePath(window.location.pathname);
    const groups = groupViewNodes(viewNodes, currentPath);

    // 當前頁面：優先使用頁面上的 views_ ID 對應的路徑
    let currentPagePath = null;
    let currentPageNodes = null;
    
    // 找出當前頁面的 views_ 節點（通常在文章頁頂部單獨出現）
    viewNodes.forEach((node) => {
      const path = getPathFromId(node.id, currentPath);
      if (path && !currentPagePath) {
        const samePathNodes = groups.get(path) || [];
        if (samePathNodes.length === 1) {
          currentPagePath = path;
          currentPageNodes = samePathNodes;
        }
      }
    });
    
    // 如果沒找到，回退到使用當前 URL
    if (!currentPagePath && groups.has(currentPath)) {
      currentPagePath = currentPath;
      currentPageNodes = groups.get(currentPath);
    }

    // 當前頁面遞增 + 取值
    if (currentPagePath && currentPageNodes) {
      fetchCount(currentPagePath)
        .then((json) => {
          if (!json || !json.success) return;
          const pv = json.page?.pv || 0;
          updateNodes(currentPageNodes, pv);
          groups.delete(currentPagePath);
        })
        .catch((err) => {
          console.warn("[stats] count error", err);
          updateNodes(currentPageNodes, "—");
          groups.delete(currentPagePath);
        });
    }

    // 列表頁其他路徑批次查詢
    const otherPaths = Array.from(groups.keys()).filter((p) => p !== currentPagePath);
    if (otherPaths.length) {
      fetchBatch(otherPaths)
        .then((json) => {
          if (!json || !json.success || !json.results) return;
          otherPaths.forEach((path) => {
            const result = json.results[path];
            const pv = result?.pv || 0;
            if (groups.has(path)) {
              updateNodes(groups.get(path), pv);
              groups.delete(path);
            }
          });
        })
        .catch((err) => {
          console.warn("[stats] batch error", err);
          otherPaths.forEach((path) => {
            if (groups.has(path)) {
              updateNodes(groups.get(path), "—");
              groups.delete(path);
            }
          });
        });
    }
  }

  function initSiteStats() {
    const pvEl = document.getElementById("site-pv");
    const uvEl = document.getElementById("site-uv");
    
    if (!pvEl && !uvEl) return;
    
    fetchStats("/")
      .then((json) => {
        if (!json || !json.success) return;
        const pv = json.page?.pv || 0;
        const uv = json.page?.uv || 0;
        
        if (pvEl) {
          pvEl.classList.remove("animate-pulse");
          pvEl.textContent = formatNumber(pv);
        }
        if (uvEl) {
          uvEl.classList.remove("animate-pulse");
          uvEl.textContent = formatNumber(uv);
        }
      })
      .catch((err) => {
        console.warn("[stats] site stats error", err);
        if (pvEl) {
          pvEl.classList.remove("animate-pulse");
          pvEl.textContent = "—";
        }
        if (uvEl) {
          uvEl.classList.remove("animate-pulse");
          uvEl.textContent = "—";
        }
      });
  }

  function groupViewNodes(nodes, currentPath) {
    const map = new Map();
    nodes.forEach((node) => {
      const path = getPathFromId(node.id, currentPath);
      if (!path) return;
      if (!map.has(path)) map.set(path, []);
      map.get(path).push(node);
    });
    return map;
  }

  function getPathFromId(id, currentPath) {
    if (!id || !id.startsWith("views_")) return null;

    const raw = id.slice("views_".length);
    if (!raw) return null;

    // taxonomy: views_taxonomy_tags
    if (raw.startsWith("taxonomy_")) {
      const slug = raw.replace(/^taxonomy_/, "");
      return normalizePath(\`/\${slug}/\`);
    }

    // term: views_term_xxx (use current path)
    if (raw.startsWith("term_")) {
      return currentPath || null;
    }

    // 一般文章: views_posts/gentoo-m-series-mac/index.md
    let path = raw;
    
    // 移除 .md 擴展名（包括語言變體）
    path = path.replace(/\\.(en|zh-tw|zh-cn)\\.md$/i, "");
    path = path.replace(/\\.md$/i, "");
    
    // 移除 index 和 _index
    path = path.replace(/\\/_index$/i, "");
    path = path.replace(/\\/index$/i, "");
    
    // 移除開頭的 content/
    path = path.replace(/^content\\//i, "");
    
    // 確保以 / 開頭和結尾
    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/\\/+/g, "/");
    if (path !== "/" && !path.endsWith("/")) path += "/";
    if (path === "") path = "/";

    return normalizePath(path);
  }

  function normalizePath(input) {
    if (!input) return "/";

    let path = input.split("?")[0].split("#")[0] || "/";
    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/\\/+/g, "/");
    path = path.replace(/\\/index\\.html$/i, "/");

    // 移除語言前綴
    const langMatch = path.match(/^\\/(zh-cn|zh-tw|en)(\\/(.*))?$/i);
    if (langMatch) {
      path = langMatch[2] ? langMatch[2] : "/";
    }

    if (path !== "/" && !path.endsWith("/")) path += "/";
    if (path === "") path = "/";

    return path;
  }

  function updateNodes(nodes, value) {
    if (!nodes || !nodes.length) return;

    const display = typeof value === "number" ? formatNumber(value) : String(value);

    nodes.forEach((node) => {
      // 移除主題 loading 樣式
      node.classList.remove("animate-pulse", "text-transparent", "bg-neutral-300", "dark:bg-neutral-400");
      node.textContent = display;
    });
  }

  function fetchCount(path) {
    const url = new URL("/api/count", API_BASE);
    url.searchParams.set("url", path);
    return fetchWithTimeout(url.toString());
  }

  function fetchBatch(paths) {
    const url = new URL("/api/batch", API_BASE);
    url.searchParams.set("urls", paths.join(","));
    return fetchWithTimeout(url.toString());
  }

  function fetchStats(path) {
    const url = new URL("/api/stats", API_BASE);
    url.searchParams.set("url", path);
    return fetchWithTimeout(url.toString());
  }

  function fetchWithTimeout(resource) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    return fetch(resource, { method: "GET", signal: controller.signal, credentials: "omit" })
      .then((res) => {
        clearTimeout(timer);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .catch((err) => {
        clearTimeout(timer);
        throw err;
      });
  }

  function formatNumber(value) {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
    } catch {
      return String(value);
    }
  }
})();
```

**重要**：將 `API_BASE` 改為你的 Worker URL。

### 3. 載入統計腳本

創建文件 `layouts/partials/extend-head.html`：

```html
<!-- Cloudflare Stats Worker -->
{{ $stats := resources.Get "js/cloudflare-stats.js" }}
{{ if $stats }}
  {{ $statsMin := $stats | minify }}
  <script src="{{ $statsMin.RelPermalink }}" defer></script>
{{ end }}
```

### 4. 修復閱讀量顯示對齊

創建文件 `assets/css/custom.css`：

```css
/* 修復閱讀量數字與眼睛圖標對齊問題 */
/* 移除主題的 margin-top 偏移，統一使用 vertical-align */
span[id^="views_"] {
  margin-top: 0 !important;
  vertical-align: baseline !important;
}

/* 防止加載動畫（animate-pulse）時元素向上偏移 */
/* 移除動畫效果，只保留主題默認的閃爍效果 */
span[id^="views_"].animate-pulse {
  margin-top: 0 !important;
  transform: none !important;
  animation: none !important;
}
```

### 5. 添加儀表板菜單項（可選）

如果你想在博客菜單中添加統計監控鏈接，編輯菜單配置文件：

**繁體中文** (`config/_default/menus.zh-tw.toml`)：
```toml
[[main]]
  name = "統計監控"
  parent = "more"
  url = "https://stats.zakk.au/"
  weight = 45
```

**簡體中文** (`config/_default/menus.zh-cn.toml`)：
```toml
[[main]]
  name = "统计监控"
  parent = "more"
  url = "https://stats.zakk.au/"
  weight = 45
```

**英文** (`config/_default/menus.en.toml`)：
```toml
[[main]]
  name = "Stats Monitor"
  parent = "more"
  url = "https://stats.zakk.au/"
  weight = 45
```

## 功能說明

### 自動功能

- ✅ **當前頁面計數**：訪問文章時自動增加 PV
- ✅ **列表頁批量查詢**：首頁/分類頁一次性獲取所有文章閱讀量
- ✅ **多語言路徑合併**：`/zh-tw/posts/article/` 和 `/posts/article/` 統計合併
- ✅ **防止重複計數**：同一訪客 24 小時內不重複計算 UV
- ✅ **加載動畫**：數據載入前顯示脈衝動畫
- ✅ **錯誤處理**：API 失敗時顯示 "—"

### Timeline 頁面全站統計（可選）

如果你的 Timeline 頁面有 `site-pv` 和 `site-uv` 元素，腳本會自動顯示全站統計：

```html
<span id="site-pv" class="animate-pulse">...</span>
<span id="site-uv" class="animate-pulse">...</span>
```

## 路徑解析邏輯

腳本會自動從 DOM 元素 ID 中解析路徑：

| DOM ID 格式 | 解析結果 |
|------------|---------|
| `views_posts/hello-world/index.md` | `/posts/hello-world/` |
| `views_posts/hello-world/index.zh-tw.md` | `/posts/hello-world/` |
| `views_taxonomy_tags` | `/tags/` |
| `views_term_golang` | 當前頁面路徑 |

語言前綴會自動移除：
- `/zh-tw/posts/article/` → `/posts/article/`
- `/zh-cn/about/` → `/about/`
- `/en/timeline/` → `/timeline/`

## 測試驗證

### 1. 檢查控制台

打開瀏覽器開發者工具（F12），查看 Console：

```
✅ 正常：無錯誤訊息
❌ 錯誤：[stats] count error / batch error
```

### 2. 檢查網絡請求

在 Network 標籤查看：

```
✅ /api/count?url=/posts/article/  → 200 OK
✅ /api/batch?urls=/posts/a/,/posts/b/  → 200 OK
```

### 3. 驗證顯示

- 文章頁：閱讀量數字應該顯示在眼睛圖標旁
- 列表頁：所有文章都應顯示閱讀量
- 載入中：應該有脈衝動畫效果
- 載入失敗：顯示 "—"

## 常見問題

### Q: 閱讀量一直顯示 0？

A: 檢查：
1. `API_BASE` 是否正確
2. Worker 是否成功部署
3. KV 命名空間是否綁定
4. 瀏覽器控制台是否有錯誤

### Q: 數字和圖標不對齊？

A: 確認已創建 `custom.css` 並正確載入。

### Q: 某些頁面沒有閱讀量？

A: 檢查頁面 HTML 是否有 `<span id="views_...">` 元素，這由主題的 `showViews` 設定控制。

### Q: 多語言站點統計不合併？

A: 腳本會自動移除 `/zh-tw/`、`/zh-cn/`、`/en/` 前綴，確保統計合併。

### Q: 加載動畫向上偏移？

A: 確認 `custom.css` 中包含 `animate-pulse` 的修復規則。

## 進階配置

### 自訂 API 超時時間

修改 `cloudflare-stats.js`：

```javascript
const FETCH_TIMEOUT = 10000;  // 10 秒
```

### 自訂錯誤顯示

修改 `updateNodes` 函數中的 `"—"` 為其他內容：

```javascript
updateNodes(currentPageNodes, "N/A");  // 或其他文字
```

### 禁用某些頁面的統計

在頁面 Front Matter 中設置：

```yaml
---
title: "我的文章"
showViews: false  # 不顯示閱讀量
---
```

## API 端點說明

| 端點 | 用途 | 範例 |
|------|------|------|
| `/api/count` | 增加並獲取 PV | `GET /api/count?url=/posts/article/` |
| `/api/batch` | 批量查詢 | `GET /api/batch?urls=/posts/a/,/posts/b/` |
| `/api/stats` | 僅查詢（不增加） | `GET /api/stats?url=/posts/article/` |

## 相關資源

- [Worker 主文檔](../README.md)
- [API 參考](../README.md#api-reference)
- [統計儀表板](https://stats.zakk.au)
- [Blowfish 主題文檔](https://blowfish.page/)

## 支持

遇到問題？

1. 查看 [GitHub Issues](https://github.com/Zakkaus/cloudflare-stats-worker/issues)
2. 查看瀏覽器控制台錯誤
3. 測試 API 端點：`curl https://stats.zakk.au/health`
