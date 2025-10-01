(function(){
  if (window.__THEME_TOGGLE_INIT) return;
  window.__THEME_TOGGLE_INIT = true;

  const root = document.documentElement;
  const body = document.body;
  const isZH = (root.lang || '').toLowerCase().startsWith('zh');
  const KEY = 'site-theme';
  const btn = document.getElementById('themeToggle');

  function sysPref(){
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function label(next){
    if (isZH) return next === 'dark' ? '🌓 黑暗' : '🌞 明亮';
    return next === 'dark' ? '🌓 Dark Mode' : '🌞 Light Mode';
  }

  function updateLabel(current){
    if(!btn) return;
    const next = current === 'dark' ? 'light' : 'dark';
    btn.textContent = label(next);
  }

  function apply(mode){
    const dark = mode === 'dark';
    root.classList.toggle('dark', dark);
    body.classList.toggle('dark', dark);
    updateLabel(mode);
  }

  function toggle(){
    const target = root.classList.contains('dark') ? 'light' : 'dark';
    apply(target);
    localStorage.setItem(KEY, target);
  }

  apply(localStorage.getItem(KEY) || sysPref());
  if(btn) btn.addEventListener('click', toggle);

  addEventListener('resize', () => {
    if (innerWidth > 900){
      const m = document.getElementById('mobileMenu');
      if (m) m.classList.remove('open');
    }
  });
})();
