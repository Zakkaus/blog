const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

async function fetchJSON(url) {
  const response = await fetch(url, {
    credentials: "omit",
    headers: { Accept: "application/json" },
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

function formatStatus(status, element) {
  if (!status) return getStatusText(element, "error", "⚠️ Error");
  const key = status.toLowerCase();
  return getStatusText(element, key, status) ?? status;
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
  try {
    const data = await fetchJSON(`${base}/health`);
    const status = data.status ?? data.state ?? "error";
    if (statusEl) statusEl.textContent = formatStatus(status, health);
    const version = data.version ?? data.meta?.version ?? data.worker?.version ?? "—";
    if (versionEl) versionEl.textContent = version;
  } catch (error) {
    console.warn("Health endpoint fallback", error);
    try {
      const data = await fetchJSON(`${base}/api/stats`);
      const status = data.status ?? data.state ?? "error";
      if (statusEl) statusEl.textContent = formatStatus(status, health);
      const version = data.version ?? data.meta?.version ?? data.worker?.version ?? "—";
      if (versionEl) versionEl.textContent = version;
    } catch (err) {
      console.error("Failed to resolve stats health", err);
      if (statusEl) statusEl.textContent = getStatusText(health, "error", "⚠️ Error");
      if (versionEl) versionEl.textContent = "—";
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
  let chartInstance = null;
  let allPoints = [];
  const canvas = trend.querySelector("canvas[data-field='chart']");
  if (!canvas) return;
  const emptyEl = trend.querySelector("[data-field='empty']");
  const emptyText = trend.dataset.emptyText ?? "No data yet.";
  const errorText = trend.dataset.errorText ?? "Unable to load chart.";

  if (emptyEl) {
    emptyEl.classList.add("hidden");
  }

  const hideMessage = () => {
    if (emptyEl) {
      emptyEl.textContent = "";
      emptyEl.classList.remove("flex");
      emptyEl.classList.add("hidden");
    }
    canvas.style.opacity = "1";
  };

  const showMessage = (message) => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (emptyEl) {
      emptyEl.textContent = message;
      emptyEl.classList.remove("hidden");
      emptyEl.classList.add("flex");
    }
    canvas.style.opacity = "0.35";
  };

  const render = (range) => {
    if (!allPoints.length) {
      showMessage(emptyText);
      return;
    }
    hideMessage();
    const span = Math.max(1, Math.min(range, allPoints.length));
    const slice = allPoints.slice(-span);
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = buildChart(canvas.getContext("2d"), slice);
  };

  try {
    const daily = await fetchJSON(`${base}/api/daily`);
    const points = Array.isArray(daily)
      ? daily
      : daily.results ?? daily.daily ?? [];
    allPoints = points
      .map((point) => ({
        date: point.date ?? point.day ?? point.d,
        views: Number(point.views ?? point.pageviews ?? point.pv ?? 0),
        visitors: Number(point.visitors ?? point.uv ?? 0),
      }))
      .filter((point) => point.date);
    allPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!allPoints.length) {
      showMessage(emptyText);
    } else {
      render(30);
    }
    trend.querySelectorAll(".stats-range-button").forEach((button) => {
      button.addEventListener("click", () => {
        trend
          .querySelectorAll(".stats-range-button")
          .forEach((btn) => btn.classList.remove("bg-primary", "text-white"));
        button.classList.add("bg-primary", "text-white");
        const range = Number(button.dataset.range ?? 30);
        render(range);
      });
    });
    const defaultButton = trend.querySelector('[data-range="30"]');
    if (defaultButton) defaultButton.classList.add("bg-primary", "text-white");
  } catch (error) {
    console.error("Failed to render trend", error);
    showMessage(errorText);
  }
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
  li.className = "group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-surface px-5 py-4 text-sm shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900/60";

  const header = document.createElement("div");
  header.className = "flex items-start justify-between gap-4";

  const left = document.createElement("div");
  left.className = "flex flex-col gap-1";

  const heading = document.createElement("div");
  heading.className = "flex items-baseline gap-3";

  const rank = document.createElement("span");
  rank.className = "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/60 text-xs font-semibold uppercase tracking-wide text-muted dark:border-neutral-700";
  rank.textContent = String(index + 1).padStart(2, "0");

  const link = document.createElement("a");
  link.href = href;
  link.className = "max-w-xs truncate font-semibold text-primary transition hover:underline sm:max-w-md";
  link.textContent = title;
  link.target = "_blank";
  link.rel = "noopener";

  heading.append(rank, link);

  const subtitle = document.createElement("span");
  subtitle.className = "text-xs text-muted";
  subtitle.textContent = decodeURI(displayPath);

  left.append(heading, subtitle);

  const metrics = document.createElement("div");
  metrics.className = "flex flex-wrap items-center gap-2 text-xs";

  const pvBadge = document.createElement("span");
  pvBadge.className = "inline-flex items-center gap-1 rounded-full border border-primary px-2 py-0.5 font-semibold text-primary";
  pvBadge.innerHTML = `<span>PV</span><span>${numberFormatter.format(viewsValue)}</span>`;

  const uvBadge = document.createElement("span");
  uvBadge.className = "inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-0.5 font-medium text-muted dark:border-neutral-700";
  uvBadge.innerHTML = `<span>UV</span><span>${numberFormatter.format(visitorsValue)}</span>`;

  metrics.append(pvBadge, uvBadge);

  header.append(left, metrics);

  const bar = document.createElement("div");
  bar.className = "mt-4 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800";
  bar.style.height = "6px";

  const fill = document.createElement("div");
  fill.className = "h-full rounded-full bg-primary transition-all duration-500";
  const ratio = maxViews > 0 ? Math.max((viewsValue / maxViews) * 100, 6) : 0;
  fill.style.width = `${Math.min(ratio, 100)}%`;

  bar.appendChild(fill);

  li.append(header, bar);
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
  list.innerHTML = `<li class="text-sm text-muted">${emptyText}</li>`;
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
      list.innerHTML = `<li class="text-sm text-muted">${emptyText}</li>`;
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
    list.innerHTML = `<li class="text-sm text-muted">${errorText}</li>`;
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
