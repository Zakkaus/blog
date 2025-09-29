const SYDNEY_TIMEZONE = "Australia/Sydney";
const MS_IN_SECOND = 1_000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

const intlOptions = {
  time: new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: SYDNEY_TIMEZONE
  }),
  zone: new Intl.DateTimeFormat([], {
    timeZone: SYDNEY_TIMEZONE,
    timeZoneName: "short"
  })
};

function pad(number) {
  return number.toString().padStart(2, "0");
}

function extractZoneName(date) {
  const parts = intlOptions.zone.formatToParts(date);
  const zonePart = parts.find((part) => part.type === "timeZoneName");
  return zonePart ? zonePart.value : SYDNEY_TIMEZONE;
}

function updateSydneyClock(nowEl, zoneEl, now) {
  if (nowEl) {
    nowEl.textContent = intlOptions.time.format(now);
  }
  if (zoneEl) {
    zoneEl.textContent = extractZoneName(now);
  }
}

function updateCounters(counters, now) {
  counters.forEach((entry) => {
    if (!entry.origin) {
      return;
    }

    const diffMs = Math.max(0, now.getTime() - entry.origin.getTime());

    if (entry.format === "days") {
      const days = Math.floor(diffMs / MS_IN_DAY);
      entry.element.textContent = days.toLocaleString();
      return;
    }

    const remainder = diffMs % MS_IN_DAY;
    const hours = Math.floor(remainder / MS_IN_HOUR);
    const minutes = Math.floor((remainder % MS_IN_HOUR) / MS_IN_MINUTE);
    const seconds = Math.floor((remainder % MS_IN_MINUTE) / MS_IN_SECOND);

    entry.element.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  });
}

(function initTimelineCounters() {
  if (typeof document === "undefined") {
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const counters = Array.from(document.querySelectorAll("[data-counter-origin]"))
      .map((element) => {
        const originValue = element.getAttribute("data-counter-origin");
        const formatValue = element.getAttribute("data-counter-format") || "time";
        const origin = originValue ? new Date(originValue) : null;

        if (!origin || Number.isNaN(origin.getTime())) {
          return null;
        }

        return { element, origin, format: formatValue };
      })
      .filter(Boolean);

    const nowEl = document.querySelector("[data-sydney-now]");
    const zoneEl = document.querySelector("[data-sydney-zone]");

    if (!counters.length && !nowEl && !zoneEl) {
      return;
    }

    function tick() {
      const now = new Date();
      updateCounters(counters, now);
      updateSydneyClock(nowEl, zoneEl, now);
    }

    tick();
    window.setInterval(tick, MS_IN_SECOND);
  });
})();
