document.addEventListener('DOMContentLoaded',()=>{
  const box=document.querySelector('.custom-topbuttons');
  if(!box) return;
  // 例：若需要根據 header 高度定位，可在此加入：
  // const h=document.querySelector('header');
  // if(h){ const r=h.getBoundingClientRect(); box.style.top=(r.top+8)+'px'; }
});