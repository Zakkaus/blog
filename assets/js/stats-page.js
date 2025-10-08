const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function toURL(input) {
  if (input instanceof URL) {
    return new URL(input.toString());
  }
  try {
    return new URL(String(input));
  } catch (error) {
    return new URL(String(input), window.location.origin);
  }
}

async function fetchJSON(input) {
  const resource = toURL(input);
  resource.searchParams.set("t", Date.now().toString());
  const response = await fetch(resource.toString(), {
    credentials: "omit",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function resolveBase(element) {
  return element?.dataset.api?.replace(/\/$/, "") ?? "";
}

function setField(el, key, value) {
  const target = el.querySelector(`[data-field="${key}"]`);
  if (target) {
    target.textContent = value;
  }
}

function formatNumber(value) {
  if (typeof value !== "number") return "—";
  return numberFormatter.format(value);
}

function getStatusText(element, key, fallback) {
  if (!element) return fallback;
  const dataset = element.dataset;
  const map = {
    ok: dataset.textOk,
    healthy: dataset.textHealthy || dataset.textOk,
    error: dataset.textError,
  };
  return map[key] ?? fallback;
}

function normalizeStatusKey(value) {
  if (typeof value !== "string") return "error";
  const key = value.toLowerCase();
  if (["ok", "okay", "success", "pass", "up"].includes(key)) return "ok";
  if (["healthy", "good", "online"].includes(key)) return "healthy";
  if (["warn", "warning", "degraded", "maintenance", "partial"].includes(key)) return "warn";
  if (["error", "fail", "failed", "down", "offline", "critical", "fatal"].includes(key)) return "error";
  return key;
}

function formatStatus(status, element) {
  if (!status) return getStatusText(element, "error", "⚠️ Error");
  const key = normalizeStatusKey(status);
  const fallback = typeof status === "string" ? status : String(status);
  return getStatusText(element, key, fallback) ?? fallback;
}

async function updateSummary() {
  const summary = document.querySelector("[data-stats-summary]");
  if (!summary) return;
  const base = resolveBase(summary);
  if (!base) return;
  try {
    const [statsData, dailyData] = await Promise.all([
      fetchJSON(`${base}/api/stats`),
      fetchJSON(`${base}/api/daily`),
    ]);

    const totalsSource =
      statsData.totals ??
      statsData.total ??
      statsData.site ??
      statsData.summary ??
      {};

    const totalsViews = Number(
      totalsSource.views ?? totalsSource.pageviews ?? totalsSource.pv ?? 0,
    );
    const totalsVisitors = Number(totalsSource.visitors ?? totalsSource.uv ?? 0);

    const dailyRaw = Array.isArray(dailyData)
      ? dailyData
      : dailyData.results ?? dailyData.daily ?? [];
    const lastEntry = dailyRaw.length ? dailyRaw[dailyRaw.length - 1] : {};
    const todayViews = Number(
      lastEntry.views ?? lastEntry.pageviews ?? lastEntry.pv ?? 0,
    );
    const todayVisitors = Number(lastEntry.visitors ?? lastEntry.uv ?? 0);

    setField(summary, "totalViews", formatNumber(totalsViews));
    setField(summary, "totalVisitors", formatNumber(totalsVisitors));
    setField(summary, "todayViews", formatNumber(todayViews));
    setField(summary, "todayVisitors", formatNumber(todayVisitors));
  } catch (error) {
    console.warn("Failed to update summary", error);
  }
}

async function updateHealth() {
  const health = document.querySelector("[data-stats-health]");
  if (!health) return;
  const base = resolveBase(health);
  if (!base) return;
  const statusEl = health.querySelector("[data-field='status']");
  const versionEl = health.querySelector("[data-field='version']");
  if (statusEl) statusEl.textContent = "…";
  if (versionEl) versionEl.textContent = "…";
  health.dataset.state = "loading";
  try {
    const data = await fetchJSON(`${base}/health`);
    const status = data.status ?? data.state ?? "error";
    const normalized = normalizeStatusKey(status);
    health.dataset.state = normalized;
    if (statusEl) statusEl.textContent = formatStatus(status, health);
    const version = data.version ?? data.meta?.version ?? data.worker?.version ?? "—";
    if (versionEl) versionEl.textContent = version;
  } catch (error) {
    console.warn("Health endpoint fallback", error);
    try {
      const data = await fetchJSON(`${base}/api/stats`);
      const status = data.status ?? data.state ?? "error";
      const normalized = normalizeStatusKey(status);
      health.dataset.state = normalized;
      if (statusEl) statusEl.textContent = formatStatus(status, health);
      const version = data.version ?? data.meta?.version ?? data.worker?.version ?? "—";
      if (versionEl) versionEl.textContent = version;
    } catch (err) {
      console.error("Failed to resolve stats health", err);
      if (statusEl) statusEl.textContent = getStatusText(health, "error", "⚠️ Error");
      if (versionEl) versionEl.textContent = "—";
      health.dataset.state = "error";
    }
  }
}

function buildChart(ctx, points) {
  if (!ctx) return null;
  if (typeof window.Chart === "undefined") {
    console.error("Chart.js not available");
    return null;
  }
  const labels = points.map((item) => dateFormatter.format(new Date(item.date ?? item.day)));
  const views = points.map((item) => item.views ?? item.pageviews ?? item.pv ?? 0);
  const visitors = points.map((item) => item.visitors ?? item.uv ?? 0);
  return new window.Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "PV",
          data: views,
          tension: 0.35,
          borderColor: "#6366F1",
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          fill: true,
          pointRadius: 0,
        },
        {
          label: "UV",
          data: visitors,
          tension: 0.35,
          borderColor: "#F97316",
          backgroundColor: "rgba(249, 115, 22, 0.15)",
          fill: true,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { autoSkip: true, maxTicksLimit: 8 },
        },
        y: {
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          ticks: {
            callback: (value) => numberFormatter.format(value),
          },
        },
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          intersect: false,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${numberFormatter.format(context.parsed.y)}`,
          },
        },
      },
    },
  });
}

async function updateTrend() {
  const trend = document.querySelector("[data-stats-trend]");
  if (!trend) return;
  const base = resolveBase(trend);
  if (!base) return;
  const canvas = trend.querySelector("canvas[data-field='chart']");
  if (!canvas) return;
  const emptyEl = trend.querySelector("[data-field='empty']");
  const emptyText = trend.dataset.emptyText ?? "No data yet.";
  const errorText = trend.dataset.errorText ?? "Unable to load chart.";
  const loadingText = trend.dataset.loadingText ?? "Loading…";
  const defaultRange = Number(trend.dataset.defaultRange ?? 30);
  const rangeButtons = trend.querySelectorAll(".stats-range__button");

  let chartInstance = null;
  let activeRange = defaultRange;
  let requestToken = 0;
  const cache = new Map();

  const dimChart = (shouldDim) => {
    canvas.classList.toggle("is-dimmed", Boolean(shouldDim));
  };

  const setOverlay = (message, { dim = true, clearChart = false } = {}) => {
    if (emptyEl) {
      emptyEl.textContent = message ?? "";
      emptyEl.classList.toggle("is-visible", Boolean(message));
    }
    dimChart(dim && Boolean(message));
    if (clearChart && chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  };

  const hideOverlay = () => setOverlay("", { dim: false });

  const loadPoints = async (range) => {
    if (cache.has(range)) return cache.get(range);
    const url = new URL(`${base}/api/daily`);
    if (Number.isFinite(range)) {
      url.searchParams.set("days", String(range));
    }
    const daily = await fetchJSON(url.toString());
    const results = Array.isArray(daily)
      ? daily
      : daily.results ?? daily.daily ?? daily.data ?? [];
    const points = results
      .map((point) => ({
        date: point.date ?? point.day ?? point.d,
        views: Number(point.views ?? point.pageviews ?? point.pv ?? 0),
        visitors: Number(point.visitors ?? point.uv ?? 0),
      }))
      .filter((point) => point.date);
    points.sort((a, b) => new Date(a.date) - new Date(b.date));
    cache.set(range, points);
    return points;
  };

  const render = async (range) => {
    activeRange = range;
    requestToken += 1;
    const token = requestToken;
    setOverlay(loadingText, { dim: true, clearChart: false });
    try {
      const points = await loadPoints(range);
      if (token !== requestToken) return;
      if (!points.length) {
        setOverlay(emptyText, { dim: true, clearChart: true });
        return;
      }
      hideOverlay();
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = buildChart(canvas.getContext("2d"), points);
    } catch (error) {
      if (token !== requestToken) return;
      console.error("Failed to render trend", error);
      setOverlay(errorText, { dim: true, clearChart: true });
    }
  };

  const setActiveButton = (activeButton) => {
    rangeButtons.forEach((button) => button.classList.remove("is-active"));
    if (activeButton) {
      activeButton.classList.add("is-active");
    }
  };

  rangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const range = Number(button.dataset.range ?? defaultRange);
      setActiveButton(button);
      render(range);
    });
  });

  const defaultButton = Array.from(rangeButtons).find(
    (button) => Number(button.dataset.range) === defaultRange,
  );
  if (defaultButton) {
    setActiveButton(defaultButton);
  } else if (rangeButtons.length) {
    setActiveButton(rangeButtons[0]);
  }

  await render(defaultRange);
}

function createTopEntry(item, index, maxViews) {
  const viewsValue = Number(item.views ?? item.pageviews ?? item.pv ?? 0);
  const visitorsValue = Number(item.visitors ?? item.uv ?? 0);
  const rawPath = item.url ?? item.link ?? item.path ?? "/";

  let href = rawPath;
  try {
    href = new URL(rawPath, window.location.origin).href;
  } catch (error) {
    // Leave href as-is when URL construction fails (e.g., mailto:)
  }

  let displayPath = rawPath;
  try {
    const urlObj = new URL(href);
    displayPath = urlObj.pathname || "/";
  } catch (error) {
    displayPath = rawPath;
  }

  const title = item.title ?? item.name ?? decodeURIComponent(displayPath);
  const li = document.createElement("li");
  li.className = "stats-top__item";

  const titleBlock = document.createElement("div");
  titleBlock.className = "stats-top__title";

  const heading = document.createElement("div");
  heading.className = "stats-top__heading";

  const rank = document.createElement("span");
  rank.className = "stats-top__rank";
  rank.textContent = String(index + 1).padStart(2, "0");

  const link = document.createElement("a");
  link.href = href;
  link.className = "stats-top__link";
  link.textContent = title;
  link.target = "_blank";
  link.rel = "noopener";

  heading.append(rank, link);

  const subtitle = document.createElement("span");
  subtitle.className = "stats-top__path";
  subtitle.textContent = decodeURI(displayPath);

  titleBlock.append(heading, subtitle);

  const metrics = document.createElement("div");
  metrics.className = "stats-top__metrics";

  const pvChip = document.createElement("span");
  pvChip.className = "stats-chip stats-chip--highlight";
  pvChip.innerHTML = `<span>PV</span><span>${numberFormatter.format(viewsValue)}</span>`;

  const uvChip = document.createElement("span");
  uvChip.className = "stats-chip";
  uvChip.innerHTML = `<span>UV</span><span>${numberFormatter.format(visitorsValue)}</span>`;

  metrics.append(pvChip, uvChip);

  const container = document.createElement("div");
  container.append(titleBlock, metrics);

  const progress = document.createElement("div");
  progress.className = "stats-progress";

  const fill = document.createElement("div");
  fill.className = "stats-progress__fill";
  const ratio = maxViews > 0 ? Math.max((viewsValue / maxViews) * 100, 5) : 0;
  fill.style.width = `${Math.min(ratio, 100)}%`;

  progress.appendChild(fill);

  li.append(container, progress);
  return li;
}

async function updateTop() {
  const topEl = document.querySelector("[data-stats-top]");
  if (!topEl) return;
  const base = resolveBase(topEl);
  if (!base) return;
  const limit = Number(topEl.dataset.limit ?? 10);
  const list = topEl.querySelector("[data-field='list']");
  if (!list) return;
  const emptyText = topEl.dataset.emptyText ?? "No data yet.";
  const errorText = topEl.dataset.errorText ?? "Unable to load top pages.";
  list.innerHTML = `<li class="stats-top__empty">${emptyText}</li>`;
  try {
    let items = [];
    try {
      const url = new URL(`${base}/api/top`);
      url.searchParams.set("limit", limit);
      const data = await fetchJSON(url.toString());
      items = data.items ?? data.results ?? data.top ?? data ?? [];
    } catch (error) {
      console.warn("Top endpoint fallback", error);
      const stats = await fetchJSON(`${base}/api/stats`);
      items = stats.top ?? stats.popular ?? stats.results ?? [];
    }
    if (!Array.isArray(items) || !items.length) {
      list.innerHTML = `<li class="stats-top__empty">${emptyText}</li>`;
      return;
    }
    list.innerHTML = "";
    const visible = items.slice(0, limit);
    const maxViews = visible.reduce(
      (acc, item) => Math.max(acc, Number(item.views ?? item.pageviews ?? item.pv ?? 0)),
      0,
    );
    visible.forEach((item, index) => {
      list.appendChild(createTopEntry(item, index, maxViews));
    });
  } catch (error) {
    console.error("Failed to render top pages", error);
    list.innerHTML = `<li class="stats-top__empty">${errorText}</li>`;
  }
}

function bootstrap() {
  updateSummary();
  updateHealth();
  updateTrend();
  updateTop();
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.Chart === "undefined") {
    window.addEventListener("load", bootstrap, { once: true });
  } else {
    bootstrap();
  }
});
