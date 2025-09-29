(function(){
  if(window.__STRAY_CLEAN_DONE) return;
  const PATS=[/nowDark\s*\?\s*'light':'dark'/,/toggleTheme/,/apply\(target\)/,/const\s+target\s*=\s*nowDark/];
  function sweep(){
    let removed=0;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);
    const doomed=[];
    while(walker.nextNode()){
      const n=walker.currentNode;
      const t=n.textContent;
      if(!t) continue;
      const trim=t.trim();
      if(!trim) continue;
      if(PATS.some(p=>p.test(trim))){
        // 只刪除完整殘碼行，不影響正常文字（長度限制）
        if(trim.length<400) doomed.push(n);
      }
    }
    doomed.forEach(n=>{ n.parentNode&&n.parentNode.removeChild(n); removed++;});
    if(removed && !window.__STRAY_CLEAN_LOGGED){
      console.warn('[stray-cleanup] removed stray script fragments:',removed);
      window.__STRAY_CLEAN_LOGGED=true;
    }
    if(!removed) window.__STRAY_CLEAN_DONE=true;
  }
  const schedule=[0,120,500];
  schedule.forEach(ms=>setTimeout(sweep,ms));
})();
