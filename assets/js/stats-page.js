const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function safeText(value, fallback = "—") {
  return value ?? fallback;
}

async function fetchJSON(url) {
  const response = await fetch(url, { credentials: "omit" });
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
    const data = await fetchJSON(`${base}/api/stats`);
    const totals = data.totals ?? data.total ?? {};
    const today = data.today ?? data.daily?.at?.(-1) ?? {};
    setField(summary, "totalViews", formatNumber(totals.views ?? totals.pageviews ?? totals.pv));
    setField(summary, "totalVisitors", formatNumber(totals.visitors ?? totals.uv));
    setField(summary, "todayViews", formatNumber(today.views ?? today.pageviews ?? today.pv));
    setField(summary, "todayVisitors", formatNumber(today.visitors ?? today.uv));
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

  const render = (range) => {
    if (!allPoints.length) return;
    const slice = allPoints.slice(-range);
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = buildChart(canvas.getContext("2d"), slice);
  };

  try {
    const daily = await fetchJSON(`${base}/api/daily`);
    const points = Array.isArray(daily) ? daily : daily.daily ?? [];
    allPoints = points
      .map((point) => ({
        date: point.date ?? point.day ?? point.d,
        views: Number(point.views ?? point.pageviews ?? point.pv ?? 0),
        visitors: Number(point.visitors ?? point.uv ?? 0),
      }))
      .filter((point) => point.date);
    allPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    render(30);
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
  }
}

function createTopEntry(item, index) {
  const views = numberFormatter.format(item.views ?? item.pageviews ?? item.pv ?? 0);
  const url = item.url ?? item.link ?? item.path ?? "#";
  const title = item.title ?? item.name ?? url;
  const li = document.createElement("li");
  li.className = "flex items-baseline justify-between gap-4 rounded-lg border border-neutral-200/60 px-4 py-3 text-sm transition hover:border-primary hover:text-primary dark:border-neutral-800/60";
  const left = document.createElement("div");
  left.className = "flex items-baseline gap-3";
  const rank = document.createElement("span");
  rank.className = "text-xs font-semibold uppercase tracking-wide text-muted";
  rank.textContent = String(index + 1).padStart(2, "0");
  const link = document.createElement("a");
  link.href = url;
  link.className = "font-medium";
  link.textContent = title;
  link.target = "_blank";
  link.rel = "noopener";
  left.append(rank, link);
  const right = document.createElement("span");
  right.className = "text-xs font-semibold uppercase tracking-wide text-muted";
  right.textContent = views;
  li.append(left, right);
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
  list.innerHTML = "<li class=\"text-sm text-muted\">…</li>";
  try {
    let items = [];
    try {
      const url = new URL(`${base}/api/top`);
      url.searchParams.set("limit", limit);
      const data = await fetchJSON(url.toString());
      items = data.items ?? data.top ?? data ?? [];
    } catch (error) {
      console.warn("Top endpoint fallback", error);
      const stats = await fetchJSON(`${base}/api/stats`);
      items = stats.top ?? stats.popular ?? [];
    }
    if (!Array.isArray(items) || !items.length) {
      list.innerHTML = "<li class=\"text-sm text-muted\">No data yet.</li>";
      return;
    }
    list.innerHTML = "";
    items.slice(0, limit).forEach((item, index) => {
      list.appendChild(createTopEntry(item, index));
    });
  } catch (error) {
    console.error("Failed to render top pages", error);
    list.innerHTML = "<li class=\"text-sm text-muted\">Unable to load top pages.</li>";
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
