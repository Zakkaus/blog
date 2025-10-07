(function () {
  if (typeof window === "undefined") return;

  const API_BASE = "https://stats.zakk.au";
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

    const currentPageNodes = groups.get(currentPath) || null;

    if (currentPageNodes) {
      fetchCount(currentPath)
        .then((json) => {
          if (!json || !json.success) return;
          const pv = json.page?.pv || 0;
          updateNodes(currentPageNodes, pv);
          groups.delete(currentPath);
        })
        .catch((err) => {
          console.warn("[stats] count error", err);
          updateNodes(currentPageNodes, "—");
          groups.delete(currentPath);
        });
    }

    const otherPaths = Array.from(groups.keys());
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
    
    fetchStats()
      .then((json) => {
        if (!json || !json.success) return;
        const pv = (json.site?.pv ?? json.page?.pv ?? 0);
        const uv = (json.site?.uv ?? json.page?.uv ?? 0);
        
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

    if (raw.startsWith("taxonomy_")) {
      const slug = raw.replace(/^taxonomy_/, "");
      return normalizePath(`/${slug}/`);
    }

    if (raw.startsWith("term_")) {
      return currentPath || null;
    }

    let path = raw;
    
    path = path.replace(/\.(en|zh-tw|zh-cn)\.md$/i, "");
    path = path.replace(/\.md$/i, "");
    
    path = path.replace(/\/_index$/i, "");
    path = path.replace(/\/index$/i, "");
    
    path = path.replace(/^content\//i, "");
    
    if (!path.startsWith("/")) path = "/" + path;
    
    path = path.replace(/\/+/g, "/");
    
    if (path !== "/" && !path.endsWith("/")) path += "/";
    if (path === "") path = "/";

    return normalizePath(path);
  }

  function normalizePath(input) {
    if (!input) return "/";

    let path = input.split("?")[0].split("#")[0] || "/";
    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/\/+/g, "/");
    path = path.replace(/\/index\.html$/i, "/");

    // 移除語言前綴
    const langMatch = path.match(/^\/(zh-cn|zh-tw|en)(\/(.*))?$/i);
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
      node.classList.remove("animate-pulse", "text-transparent", "bg-neutral-300", "dark:bg-neutral-400", "-mt-[2px]");
      node.style.marginTop = "0";
      node.style.verticalAlign = "baseline";
      node.textContent = display;
    });
  }

  function fetchCount(path) {
    const url = new URL("/api/count", API_BASE);
    url.searchParams.set("url", path);
    url.searchParams.set("t", Date.now().toString());
    return fetchWithTimeout(url.toString());
  }

  function fetchBatch(paths) {
    const url = new URL("/api/batch", API_BASE);
    url.searchParams.set("urls", paths.join(","));
    url.searchParams.set("t", Date.now().toString());
    return fetchWithTimeout(url.toString());
  }

  function fetchStats(path) {
    const url = new URL("/api/stats", API_BASE);
    if (path) {
      url.searchParams.set("url", path);
    }
    url.searchParams.set("t", Date.now().toString());
    return fetchWithTimeout(url.toString());
  }

  function fetchWithTimeout(resource) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    return fetch(resource, { method: "GET", signal: controller.signal, credentials: "omit" })
      .then((res) => {
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
