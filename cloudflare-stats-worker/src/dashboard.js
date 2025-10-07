// 儀表板 HTML 內容（雙語版本）
export const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="zh-TW" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>統計數據 - Cloudflare Stats</title>
    <meta name="description" content="查看網站訪問統計數據">
    <link rel="icon" type="image/svg+xml" href="/logo.webp">
    <link rel="apple-touch-icon" href="/logo.webp">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        (function () {
            const API_BASE = window.location.origin;
            let dailyChart = null;
            let currentDays = 7;
            let currentLang = "zh-TW";
            const i18n = {
                "zh-TW": {
                    title: "統計數據儀表板",
                    subtitle: "實時查看網站訪問統計",
                    darkMode: "深色模式",
                    lightMode: "淺色模式",
                    totalPageViews: "全站總瀏覽量",
                    totalUniqueVisitors: "全站訪客數",
                    todayPageViews: "今日瀏覽量",
                    apiStatus: "API 狀態",
                    dailyTrend: "📈 每日訪問趨勢",
                    last7Days: "過去 7 天",
                    last14Days: "過去 14 天",
                    last30Days: "過去 30 天",
                    searchPage: "🔍 查詢頁面統計",
                    searchPlaceholder: "輸入路徑，例如: /posts/hello-world/",
                    search: "查詢",
                    pageViews: "頁面瀏覽量",
                    uniqueVisitors: "獨立訪客",
                    topPages: "🔥 熱門頁面 Top 10",
                    loading: "載入中...",
                    total: "總計",
                    today: "今日",
                    normal: "✅ 正常",
                    error: "❌ 錯誤",
                    version: "版本",
                    cannotConnect: "無法連接",
                    loadFailed: "載入失敗",
                    poweredBy: "Powered by",
                    pvLabel: "瀏覽量 (PV)",
                    uvLabel: "訪客數 (UV)",
                    views: "次瀏覽",
                    visitors: "位訪客",
                    noData: "暫無熱門頁面數據",
                    loadError: "載入失敗",
                    noDailyData: "暫無趨勢數據，已顯示 0",
                    updatedAtPrefix: "更新於 (UTC)",
                    chartUpdatedPrefix: "趨勢圖資料更新 (UTC)"
                },
                "en": {
                    title: "Statistics Dashboard",
                    subtitle: "Real-time website analytics",
                    darkMode: "Dark Mode",
                    lightMode: "Light Mode",
                    totalPageViews: "Total Page Views",
                    totalUniqueVisitors: "Total Unique Visitors",
                    todayPageViews: "Today's Views",
                    apiStatus: "API Status",
                    dailyTrend: "📈 Daily Traffic Trend",
                    last7Days: "Last 7 Days",
                    last14Days: "Last 14 Days",
                    last30Days: "Last 30 Days",
                    searchPage: "🔍 Search Page Stats",
                    searchPlaceholder: "Enter path, e.g.: /posts/hello-world/",
                    search: "Search",
                    pageViews: "Page Views",
                    uniqueVisitors: "Unique Visitors",
                    topPages: "🔥 Top 10 Pages",
                    loading: "Loading...",
                    total: "Total",
                    today: "Today",
                    normal: "✅ Normal",
                    error: "❌ Error",
                    version: "Version",
                    cannotConnect: "Cannot Connect",
                    loadFailed: "Load Failed",
                    poweredBy: "Powered by",
                    pvLabel: "Page Views (PV)",
                    uvLabel: "Unique Visitors (UV)",
                    views: " views",
                    visitors: " visitors",
                    noData: "No popular pages yet",
                    loadError: "Load failed",
                    noDailyData: "No trend data yet. Showing zeros.",
                    updatedAtPrefix: "Updated (UTC)",
                    chartUpdatedPrefix: "Trend refreshed (UTC)"
                }
            };
            const sitePvElement = document.getElementById("site-pv");
            const siteUvElement = document.getElementById("site-uv");
            const sitePvNote = sitePvElement ? sitePvElement.nextElementSibling : null;
            const siteUvNote = siteUvElement ? siteUvElement.nextElementSibling : null;
            const chartUpdatedEl = document.getElementById("daily-updated");
            let siteStatus = "loading";
            let lastSiteTimestamp = null;
            let dailyStatus = "loading";
            let lastDailyTimestamp = null;

            function updateI18n() {
                document.querySelectorAll("[data-i18n]").forEach(function (el) {
                    const key = el.getAttribute("data-i18n");
                    if (i18n[currentLang] && i18n[currentLang][key]) {
                        el.textContent = i18n[currentLang][key];
                    }
                });
                document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
                    const key = el.getAttribute("data-i18n-placeholder");
                    if (i18n[currentLang] && i18n[currentLang][key]) {
                        el.setAttribute("placeholder", i18n[currentLang][key]);
                    }
                });
                document.documentElement.lang = currentLang;
                if (dailyChart) {
                    dailyChart.data.datasets[0].label = i18n[currentLang].pvLabel;
                    dailyChart.data.datasets[1].label = i18n[currentLang].uvLabel;
                    dailyChart.update();
                }
                renderSiteStatus();
                renderDailyStatus();
            }

            </script>
                const textColor = isDark ? "#e2e8f0" : "#1e293b";
                const gridColor = isDark ? "#334155" : "#e2e8f0";
                if (dailyChart) {
                    dailyChart.destroy();
                }
                dailyChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: [],
                        datasets: [
                            {
                                label: i18n[currentLang].pvLabel,
                                data: [],
                                borderColor: "#3b82f6",
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            },
                            {
                                label: i18n[currentLang].uvLabel,
                                data: [],
                                borderColor: "#10b981",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: textColor,
                                    font: { size: 12 }
                                }
                            },
                            tooltip: {
                                mode: "index",
                                intersect: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: textColor },
                                grid: { color: gridColor }
                            },
                            x: {
                                ticks: { color: textColor },
                                grid: { color: gridColor }
                            }
                        }
                    }
                });
            }

            function updateChartTheme() {
                if (!dailyChart) {
                    return;
                }
                const theme = html.getAttribute("data-theme");
                const isDark = theme === "dark";
                const textColor = isDark ? "#e2e8f0" : "#1e293b";
                const gridColor = isDark ? "#334155" : "#e2e8f0";
                dailyChart.options.plugins.legend.labels.color = textColor;
                dailyChart.options.scales.y.ticks.color = textColor;
                dailyChart.options.scales.y.grid.color = gridColor;
                dailyChart.options.scales.x.ticks.color = textColor;
                dailyChart.options.scales.x.grid.color = gridColor;
                dailyChart.update();
            }

            async function loadDailyChart(days) {
                const targetDays = typeof days === "number" && !Number.isNaN(days) ? days : 7;
                const todayValueEl = document.getElementById("today-pv");
                const todayLabelEl = todayValueEl ? todayValueEl.nextElementSibling : null;
                const errorEl = document.getElementById("daily-error");

                dailyStatus = "loading";
                renderDailyStatus();

                if (todayLabelEl) {
                    todayLabelEl.textContent = i18n[currentLang].loading;
                }
                if (errorEl) {
                    errorEl.style.display = "none";
                }

                try {
                    const dailyUrl = new URL("/api/daily", API_BASE);
                    dailyUrl.searchParams.set("days", String(targetDays));
                    dailyUrl.searchParams.set("t", Date.now().toString());
                    const response = await fetch(dailyUrl.toString());
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }
                    const data = await response.json();
                    const hasResults = Array.isArray(data.results) && data.results.length > 0;
                    const series = hasResults
                        ? data.results
                        : Array.from({ length: targetDays }, function (_, idx) {
                            const date = new Date();
                            date.setDate(date.getDate() - (targetDays - 1 - idx));
                            return { date: date.toISOString().split("T")[0], pv: 0, uv: 0 };
                        });

                    updateDailyChart(series);

                    const todayData = series.length > 0 ? series[series.length - 1] : { pv: 0 };
                    if (todayValueEl) {
                        todayValueEl.textContent = formatNumber(todayData.pv || 0);
                    }
                    if (todayLabelEl) {
                        todayLabelEl.textContent = i18n[currentLang].today;
                    }

                    lastDailyTimestamp = data.timestamp || new Date().toISOString();
                    dailyStatus = "ok";
                    renderDailyStatus();

                    if (!hasResults && errorEl) {
                        errorEl.style.display = "block";
                        errorEl.textContent = i18n[currentLang].noDailyData;
                    }
                } catch (error) {
                    console.warn("[dashboard] daily fetch error", error);
                    const fallbackSeries = Array.from({ length: targetDays }, function (_, idx) {
                        const date = new Date();
                        date.setDate(date.getDate() - (targetDays - 1 - idx));
                        return { date: date.toISOString().split("T")[0], pv: 0, uv: 0 };
                    });
                    updateDailyChart(fallbackSeries);
                    if (todayValueEl) {
                        todayValueEl.textContent = "0";
                    }
                    if (todayLabelEl) {
                        todayLabelEl.textContent = i18n[currentLang].today;
                    }
                    if (errorEl) {
                        errorEl.style.display = "block";
                        errorEl.textContent = i18n[currentLang].loadFailed;
                    }
                    lastDailyTimestamp = null;
                    dailyStatus = "error";
                    renderDailyStatus();
                }
            }

            function updateDailyChart(series) {
                if (!dailyChart) {
                    return;
                }
                const labels = series.map(function (item) {
                    const date = new Date(item.date);
                    if (Number.isNaN(date.getTime())) {
                        return item.date;
                    }
                    return (date.getMonth() + 1) + "/" + date.getDate();
                });
                dailyChart.data.labels = labels;
                dailyChart.data.datasets[0].data = series.map(function (item) {
                    return item.pv || 0;
                });
                dailyChart.data.datasets[1].data = series.map(function (item) {
                    return item.uv || 0;
                });
                dailyChart.update();
            }

            document.querySelectorAll(".chart-controls button").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    document.querySelectorAll(".chart-controls button").forEach(function (other) {
                        other.classList.remove("active");
                    });
                    btn.classList.add("active");
                    currentDays = parseInt(btn.getAttribute("data-days"), 10) || 7;
                    loadDailyChart(currentDays);
                });
            });

            async function searchPage() {
                const pathInput = document.getElementById("path-input");
                const path = pathInput ? pathInput.value.trim() : "";
                const resultDiv = document.getElementById("search-result");
                const errorDiv = document.getElementById("search-error");

                if (errorDiv) {
                    errorDiv.innerHTML = "";
                }
                if (resultDiv) {
                    resultDiv.classList.remove("show");
                }

                if (!path) {
                    if (errorDiv) {
                        errorDiv.innerHTML = '<div class="error">' + i18n[currentLang].searchPlaceholder + "</div>";
                    }
                    return;
                }

                try {
                    const statsUrl = new URL("/api/stats", API_BASE);
                    statsUrl.searchParams.set("url", path);
                    statsUrl.searchParams.set("t", Date.now().toString());
                    const response = await fetch(statsUrl.toString());
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }
                    const data = await response.json();
                    if (data.success) {
                        const resultPath = document.getElementById("result-path");
                        const resultPv = document.getElementById("result-pv");
                        const resultUv = document.getElementById("result-uv");
                        if (resultPath) {
                            resultPath.textContent = data.page && data.page.path ? data.page.path : path;
                        }
                        if (resultPv) {
                            resultPv.textContent = formatNumber(data.page && typeof data.page.pv === "number" ? data.page.pv : 0);
                        }
                        if (resultUv) {
                            resultUv.textContent = formatNumber(data.page && typeof data.page.uv === "number" ? data.page.uv : 0);
                        }
                        if (resultDiv) {
                            resultDiv.classList.add("show");
                        }
                    } else if (errorDiv) {
                        const message = data.error || i18n[currentLang].loadFailed;
                        errorDiv.innerHTML = '<div class="error">' + message + "</div>";
                    }
                } catch (error) {
                    if (errorDiv) {
                        errorDiv.innerHTML = '<div class="error">' + i18n[currentLang].loadFailed + "</div>";
                    }
                }
            }

            async function loadTopPages() {
                const loadingDiv = document.getElementById("top-loading");
                const listEl = document.getElementById("top-list");
                const errorDiv = document.getElementById("top-error");
                try {
                    const topUrl = new URL("/api/top", API_BASE);
                    topUrl.searchParams.set("limit", "10");
                    topUrl.searchParams.set("t", Date.now().toString());
                    const response = await fetch(topUrl.toString());
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }
                    const data = await response.json();
                    if (loadingDiv) {
                        loadingDiv.style.display = "none";
                    }
                    if (data.success && Array.isArray(data.results) && data.results.length > 0) {
                        if (listEl) {
                            const markup = data.results.map(function (page, index) {
                                const rank = index + 1;
                                const pv = formatNumber(page.pv || 0);
                                const uv = formatNumber(page.uv || 0);
                                return '<li class="page-item">' +
                                    '<div class="page-rank">' + rank + '</div>' +
                                    '<div class="page-info">' +
                                        '<div class="page-path">' + page.path + '</div>' +
                                        '<div class="page-stats">' + pv + i18n[currentLang].views + ' · ' + uv + i18n[currentLang].visitors + '</div>' +
                                    '</div>' +
                                    '<div class="page-views">' + pv + '</div>' +
                                '</li>';
                            }).join("");
                            listEl.innerHTML = markup;
                        }
                    } else if (errorDiv) {
                        errorDiv.innerHTML = '<div class="error">' + i18n[currentLang].noData + "</div>";
                    }
                } catch (error) {
                    if (loadingDiv) {
                        loadingDiv.style.display = "none";
                    }
                    if (errorDiv) {
                        errorDiv.innerHTML = '<div class="error">' + i18n[currentLang].loadError + "</div>";
                    }
                }
            }

            function formatNumber(num) {
                const value = typeof num === "number" ? num : 0;
                return new Intl.NumberFormat(currentLang).format(value);
            }

            if (typeof fetch === "function") {
                fetch(API_BASE + "/logo.webp")
                    .then(function (response) {
                        if (response.ok) {
                            return response.blob();
                        }
                        return null;
                    })
                    .then(function (blob) {
                        if (blob) {
                            const objectUrl = URL.createObjectURL(blob);
                            const logo = document.getElementById("logo-img");
                            if (logo) {
                                logo.src = objectUrl;
                            }
                        }
                    })
                    .catch(function () {
                        // ignore fetch logo errors
                    });
            }

            document.addEventListener("DOMContentLoaded", function () {
                renderSiteStatus();
                renderDailyStatus();
                loadSiteStats();
                checkHealth();
                loadTopPages();
                initChart();
                loadDailyChart(currentDays);

                const searchButton = document.getElementById("search-btn");
                const pathInput = document.getElementById("path-input");
                if (searchButton) {
                    searchButton.addEventListener("click", searchPage);
                }
                if (pathInput) {
                    pathInput.addEventListener("keypress", function (event) {
                        if (event.key === "Enter") {
                            searchPage();
                        }
                    });
                }
            });
        })();
    </script>
                const res = await fetch(\`\${API_BASE}/health\`), data = await res.json();
                if (data.status === 'ok') {
                    document.getElementById('api-status').textContent = i18n[currentLang].normal;
                    document.getElementById('api-version').textContent = \`\${i18n[currentLang].version} \${data.version}\`;
                }
            } catch (err) {
                document.getElementById('api-status').textContent = i18n[currentLang].error;
                document.getElementById('api-version').textContent = i18n[currentLang].cannotConnect;
            }
        }
        function initChart() {
            const ctx = document.getElementById('dailyChart').getContext('2d');
            const theme = html.getAttribute('data-theme'), isDark = theme === 'dark';
            const textColor = isDark ? '#e2e8f0' : '#1e293b', gridColor = isDark ? '#334155' : '#e2e8f0';
            if (dailyChart) dailyChart.destroy();
            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        { label: i18n[currentLang].pvLabel, data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 2, fill: true, tension: 0.4 },
                        { label: i18n[currentLang].uvLabel, data: [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: textColor, font: { size: 12 } } }, tooltip: { mode: 'index', intersect: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    }
                }
            });
        }
        function updateChartTheme() {
            if (!dailyChart) return;
            const theme = html.getAttribute('data-theme'), isDark = theme === 'dark';
            const textColor = isDark ? '#e2e8f0' : '#1e293b', gridColor = isDark ? '#334155' : '#e2e8f0';
            dailyChart.options.plugins.legend.labels.color = textColor;
            dailyChart.options.scales.y.ticks.color = textColor; dailyChart.options.scales.y.grid.color = gridColor;
            dailyChart.options.scales.x.ticks.color = textColor; dailyChart.options.scales.x.grid.color = gridColor;
            dailyChart.update();
        }
        async function loadDailyChart(days = 7) {
            const todayValueEl = document.getElementById('today-pv');
            const todayLabelEl = todayValueEl ? todayValueEl.nextElementSibling : null;
            const errorEl = document.getElementById('daily-error');
            dailyStatus = 'loading';
            renderDailyStatus();
            if (todayLabelEl) todayLabelEl.textContent = i18n[currentLang].loading;
            if (errorEl) errorEl.style.display = 'none';

            try {
                const res = await fetch(\`\${API_BASE}/api/daily?days=\${days}&t=\${Date.now()}\`);
                if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
                const data = await res.json();
                const hasResults = Array.isArray(data.results) && data.results.length > 0;
                const series = hasResults
                    ? data.results
                    : Array.from({ length: days }, (_, idx) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (days - 1 - idx));
                        return { date: date.toISOString().split('T')[0], pv: 0, uv: 0 };
                    });

                updateDailyChart(series);

                const todayData = series[series.length - 1] || { pv: 0 };
                if (todayValueEl) todayValueEl.textContent = formatNumber(todayData.pv || 0);
                if (todayLabelEl) todayLabelEl.textContent = i18n[currentLang].today;
                lastDailyTimestamp = data.timestamp || new Date().toISOString();
                dailyStatus = 'ok';
                renderDailyStatus();
                if (!hasResults && errorEl) {
                    errorEl.style.display = 'block';
                    errorEl.textContent = i18n[currentLang].noDailyData;
                }
            } catch (err) {
                console.warn('[dashboard] daily fetch error', err);
                const fallbackSeries = Array.from({ length: days }, (_, idx) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (days - 1 - idx));
                    return { date: date.toISOString().split('T')[0], pv: 0, uv: 0 };
                });
                updateDailyChart(fallbackSeries);
                if (todayValueEl) todayValueEl.textContent = '0';
                if (todayLabelEl) todayLabelEl.textContent = i18n[currentLang].today;
                if (errorEl) {
                    errorEl.style.display = 'block';
                    errorEl.textContent = i18n[currentLang].loadFailed;
                }
                lastDailyTimestamp = null;
                dailyStatus = 'error';
                renderDailyStatus();
            }
        }
        function updateDailyChart(series) {
            if (!dailyChart) return;
            const labels = series.map((item) => {
                const date = new Date(item.date);
                if (Number.isNaN(date.getTime())) return item.date;
                return \`\${date.getMonth() + 1}/\${date.getDate()}\`;
            });
            dailyChart.data.labels = labels;
            dailyChart.data.datasets[0].data = series.map((item) => item.pv || 0);
            dailyChart.data.datasets[1].data = series.map((item) => item.uv || 0);
            dailyChart.update();
        }
        document.querySelectorAll('.chart-controls button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-controls button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active'); const days = parseInt(btn.getAttribute('data-days'));
                currentDays = days; loadDailyChart(days);
            });
        });
        async function searchPage() {
            const path = document.getElementById('path-input').value.trim();
            const resultDiv = document.getElementById('search-result'), errorDiv = document.getElementById('search-error');
            errorDiv.innerHTML = ''; resultDiv.classList.remove('show');
            if (!path) { errorDiv.innerHTML = \`<div class="error">\${i18n[currentLang].searchPlaceholder}</div>\`; return; }
            try {
                const res = await fetch(\`\${API_BASE}/api/stats?url=\${encodeURIComponent(path)}\`), data = await res.json();
                if (data.success) {
                    document.getElementById('result-path').textContent = data.page?.path || path;
                    document.getElementById('result-pv').textContent = formatNumber(data.page?.pv || 0);
                    document.getElementById('result-uv').textContent = formatNumber(data.page?.uv || 0);
                    resultDiv.classList.add('show');
                } else { errorDiv.innerHTML = \`<div class="error">\${data.error || i18n[currentLang].loadFailed}</div>\`; }
            } catch (err) { errorDiv.innerHTML = \`<div class="error">\${i18n[currentLang].loadFailed}</div>\`; }
        }
        async function loadTopPages() {
            const loadingDiv = document.getElementById('top-loading'), listEl = document.getElementById('top-list'), errorDiv = document.getElementById('top-error');
            try {
                const topUrl = new URL('/api/top', API_BASE);
                topUrl.searchParams.set('limit', '10');
                topUrl.searchParams.set('t', Date.now().toString());
                const res = await fetch(topUrl.toString()), data = await res.json();
                loadingDiv.style.display = 'none';
                if (data.success && data.results && data.results.length > 0) {
                    listEl.innerHTML = data.results.map((page, index) => \`
                        <li class="page-item">
                            <div class="page-rank">\${index + 1}</div>
                            <div class="page-info">
                                <div class="page-path">\${page.path}</div>
                                <div class="page-stats">\${formatNumber(page.pv)}\${i18n[currentLang].views} · \${formatNumber(page.uv)}\${i18n[currentLang].visitors}</div>
                            </div>
                            <div class="page-views">\${formatNumber(page.pv)}</div>
                        </li>
                    \`).join('');
                } else { loadingDiv.style.display = 'none'; errorDiv.innerHTML = \`<div class="error">\${i18n[currentLang].noData}</div>\`; }
            } catch (err) { loadingDiv.style.display = 'none'; errorDiv.innerHTML = \`<div class="error">\${i18n[currentLang].loadError}</div>\`; }
        }
        function formatNumber(num) { return new Intl.NumberFormat(currentLang).format(num); }
        // 嘗試載入真實 logo
        fetch(\`\${API_BASE}/logo.webp\`).then(res => { if (res.ok) return res.blob(); }).then(blob => {
            if (blob) document.getElementById('logo-img').src = URL.createObjectURL(blob);
        }).catch(() => {});
        document.addEventListener('DOMContentLoaded', () => {
            renderSiteStatus();
            renderDailyStatus();
            loadSiteStats(); checkHealth(); loadTopPages(); initChart(); loadDailyChart(currentDays);
            document.getElementById('search-btn').addEventListener('click', searchPage);
            document.getElementById('path-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchPage(); });
        });
    </script>
</body>
</html>`;
