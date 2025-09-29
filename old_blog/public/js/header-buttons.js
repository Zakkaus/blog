(function () {
  'use strict';
  if (window.__HB_INIT__) return;
  window.__HB_INIT__ = true;

  const LABELS = {
    en:       { home: "Home",  posts: "Posts",  about: "About",  search: "Search" },
    "zh-hant":{ home: "首頁",  posts: "文章",   about: "關於我", search: "搜尋" }
  };

  function detectLang() {
    if (location.pathname.startsWith("/zh-hant/")) return "zh-hant";
    const h = (document.documentElement.lang || "").toLowerCase();
    if (h.startsWith("zh")) return "zh-hant";
    return "en";
  }

  function prefix(lang) {
    return lang === "zh-hant" ? "/zh-hant" : "";
  }

  function ensureCSS() {
    if (document.querySelector('link[href*="header-buttons.css"]')) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/css/header-buttons.css";
    document.head.appendChild(l);
  }

  function build(lang) {
    const L = LABELS[lang] || LABELS.en;
    const p = prefix(lang);
    const box = document.createElement("div");
    box.className = "custom-topbuttons";
    box.innerHTML = `
      <button class="cb-toggle" aria-label="Toggle menu">☰</button>
      <nav class="cb-menu" aria-hidden="true">
        <a href="${p || '/'}" class="cb-btn" data-name="home">🏠 ${L.home}</a>
        <a href="${p}/posts/" class="cb-btn" data-name="posts">📚 ${L.posts}</a>
        <a href="${p}/about/" class="cb-btn" data-name="about">👤 ${L.about}</a>
        <a href="${p}/search/" class="cb-btn" data-name="search">🔍 ${L.search}</a>
      </nav>`;
    return box;
  }

  function highlight(container) {
    const cur = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
    container.querySelectorAll('a.cb-btn').forEach(a => {
      try {
        const u = new URL(a.href, location.origin).pathname;
        const norm = u.endsWith('/') ? u : u + '/';
        if (norm === cur) a.classList.add('active');
      } catch (e) {}
      a.addEventListener('click', () => {
        container.querySelectorAll('a.cb-btn').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
      });
    });
  }

  function addMobile(container) {
    const toggle = container.querySelector('.cb-toggle');
    const menu = container.querySelector('.cb-menu');
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', String(!open));
    });
    document.addEventListener('click', e => {
      if (!container.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function mount() {
    if (document.querySelector('.custom-topbuttons')) return;
    ensureCSS();
    const lang = detectLang();
    const el = build(lang);
    const header = document.querySelector('header.header, header.site-header, header');

    if (header) {
      if (getComputedStyle(header).position === 'static') header.style.position = 'relative';
      el.style.position = 'absolute';
      const langSwitch = header.querySelector('.lang, .language, .i18n, .language-switcher, [data-language]');
      el.style.top = langSwitch ? '56px' : '12px';
      el.style.right = '12px';
      el.style.zIndex = '9999';
      header.appendChild(el);
    } else {
      el.classList.add('fallback-fixed');
      document.body.appendChild(el);
    }

    highlight(el);
    addMobile(el);
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }

  try {
    init();
  } catch (err) {
    console.error("header-buttons init error", err);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const normalize = (p) => {
      if (!p) return '';
      return ('/' + p).replace(/\/+/g, '/').replace(/\/$/, '');
    };

    const lang = (document.documentElement.lang || '').toLowerCase();
    const isZh = lang.startsWith('zh');
    const timelineHref = isZh ? '/zh-hant/timeline/' : '/timeline/';
    const timelinePathNorm = normalize(timelineHref);

    const currentPathNorm = normalize(window.location.pathname);

    const ensureActive = (a) => {
      if (normalize(a.getAttribute('href')) === timelinePathNorm &&
          currentPathNorm === timelinePathNorm) {
        a.classList.add('active');
      }
    };

    const buildTimelineLink = (extraClass) => {
      const a = document.createElement('a');
      a.href = timelineHref;
      a.className = (extraClass ? extraClass + ' ' : '') + 'nav-timeline';
      // 內容：與其他項一致 = 純文字 + emoji（不做額外位移）
      // 目前其他導航是直接寫 emoji 和文字在同一個 <a>，所以這裡保持簡單
      a.textContent = (isZh ? '🕒 天數' : '🕒 Days');
      ensureActive(a);
      return a;
    };

    // 桌面導覽列處理
    const mainUl = document.querySelector('.main-nav ul');
    if (mainUl) {
      let existing = mainUl.querySelector('a.nav-timeline');
      if (!existing) {
        // 依 About 位置插入（放在 About 後面）
        const aboutA = [...mainUl.querySelectorAll('a')].find(a => /\/about\/?$/.test(a.getAttribute('href') || ''));
        const li = document.createElement('li');
        li.appendChild(buildTimelineLink(''));
        if (aboutA && aboutA.parentElement) {
          aboutA.parentElement.after(li);
        } else {
          mainUl.appendChild(li);
        }
      } else {
        // 已存在：確保 href / active 狀態正確
        existing.setAttribute('href', timelineHref);
        ensureActive(existing);
      }
    }

    // 手機選單處理
    const mobileMenu = document.querySelector('#mobileMenu.cb-menu');
    if (mobileMenu) {
      let existingMobile = mobileMenu.querySelector('a.nav-timeline');
      if (!existingMobile) {
        mobileMenu.appendChild(buildTimelineLink('cb-btn'));
      } else {
        existingMobile.setAttribute('href', timelineHref);
        ensureActive(existingMobile);
        // 若手機版需要與桌面版相同文字格式，確保內容同步
        existingMobile.textContent = (isZh ? '🕒 天數' : '🕒 Days');
      }
    }

    /* === 新增：手機選單 Active 標記 (Home / Posts / About / Timeline) === */
    const markActiveMobile = () => {
      const current = location.pathname.replace(/\/$/,'');
      document.querySelectorAll('#mobileMenu.cb-menu a.cb-btn[href]').forEach(a=>{
        try{
          const u = new URL(a.getAttribute('href'), location.origin);
          const p = u.pathname.replace(/\/$/,'');
          if(p === current){
            a.classList.add('active');
          }
        }catch(e){}
      });
    };

    // 若 timeline 按鈕是動態插入，需在插入後再標記
    markActiveMobile();

    // 若之後有延遲載入（保險再跑一次）
    setTimeout(markActiveMobile, 150);
  });
})();
