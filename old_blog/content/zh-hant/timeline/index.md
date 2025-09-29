---
title: "時間線"
slug: "timeline"
toc: false
date: 2025-09-01
lastmod: 2025-09-01
url: "/zh-hant/timeline/"
---
<div id="timelineContainer">載入中...</div>

<script>
document.addEventListener('DOMContentLoaded',function(){
  const timelineData = [
    {
      id:"couple",
      title:"在一起",
      date:"07/08/2025 11:38",
      image:"/images/timeline/f-avatar.webp",
      alt:"我們",
      modalTitle:"關係",
      modalSubtitle:"開始於 07/08/2025 11:38（雪梨時間）",
      modalContent:`
        <p>我（Zakk）與女友 Paper 現在是遠距（澳洲 / 台灣），我們都是 pansexual 🩷💛🩵，尊重並擁抱多元身分與情感。</p>
        <p>距離之下仍每日分享生活、課業、工作、想法與情緒；價值觀與節奏自然契合，是彼此的 <strong>靈魂伴侶</strong>。</p>
        <p>最初在 <a href="https://www.youtube.com/@xilanceylan" target="_blank" rel="noopener" class="tl-highlight-link">Ceylan</a> 的 Discord 認識，輕鬆聊天逐漸變成陪伴，直到「在一起」成為最自然的決定。</p>
        <p>我們每隔幾個月線下見面；Paper 高中畢業後計畫來澳洲求學，期待一起寫更多篇章。</p>
        <p>我們都很喜歡睡覺、喜歡宅在家，也分享了許多相同的想法、過去的經歷與各種小眾興趣。</p>
        <p>更多片段（Paper IG）：<a href="https://www.instagram.com/abyss_74.50/" target="_blank" rel="noopener" class="tl-highlight-link">@abyss_74.50</a></p>
      `,
      linkUrl:"/zh-hant/about/#relationship"
    },
    {
      id:"hash",
      title:"薯餅天數",
      date:"24/06/2025",
      image:"/images/timeline/hashbrown.webp",
      alt:"薯餅",
      modalTitle:"薯餅",
      modalSubtitle:"生日：2025/06/24",
      modalContent:`
        <p>薯餅是純種泰迪天竺鼠，毛色淺棕（帶一點黃），很活潑，愛跑圈並把小屋推來推去。</p>
        <p>最愛紅/綠甜椒、玉米鬚、胡蘿蔔。看到人或我打開冰箱時會發出 <strong>515151</strong> 聲討零食。牠是女生。</p>
        <p>名字來自麥當勞早餐 <a href="https://www.mcdonalds.com/tw/zh-tw/product/hash-browns.html" target="_blank" rel="noopener" class="tl-highlight-link">薯餅</a>。</p>
        <p>更多照片：<a href="https://instagram.com/zakk.au" target="_blank" rel="noopener" class="tl-highlight-link">@zakk.au</a></p>
      `,
      linkUrl:"/zh-hant/about/#pets"
    },
    {
      id:"potato",
      title:"馬鈴薯天數",
      date:"27/07/2025",
      image:"/images/timeline/potato.webp",
      alt:"馬鈴薯",
      modalTitle:"馬鈴薯",
      modalSubtitle:"生日：2025/07/27",
      modalContent:`
        <p>馬鈴薯是純種泰迪天竺鼠，毛色深棕，膽大又很愛吃，偶爾邊吃邊排泄。</p>
        <p>喜歡甜椒、玉米鬚、胡蘿蔔；常埋進草堆睡一覺醒來繼續吃。牠是女生。</p>
        <p>更多照片：<a href="https://instagram.com/zakk.au" target="_blank" rel="noopener" class="tl-highlight-link">@zakk.au</a></p>
      `,
      linkUrl:"/zh-hant/about/#pets"
    }
  ];

  // 頁面HTML
  let html = `
  <div class="tl-container">
    <div class="tl-grid">
      ${timelineData.map(item => `
        <div class="tl-card" data-key="${item.id}">
          <div class="tl-image">
            <img src="${item.image}" alt="${item.alt}" loading="lazy">
          </div>
          <div class="tl-content">
            <h3>${item.title}</h3>
            <div class="tl-counter" id="${item.id}Counter">
              <p class="tl-days">0</p>
              <p class="tl-time">00:00:00</p>
            </div>
            <p class="tl-meta">${item.id === 'couple' ? `自 ${item.date} 起` : `生日：${item.date}`}</p>
          </div>
          <button class="tl-more">了解更多</button>
        </div>
      `).join('')}
    </div>
    <div class="tl-footer">
      <p class="tl-note" id="timeInfo">雪梨時間載入中...</p>
    </div>
  </div>
  
  <div class="tl-modal-backdrop">
    <div class="tl-modal">
      <button class="tl-close-btn">✕</button>
      <div class="tl-modal-header">
        <h3 class="tl-modal-title"></h3>
        <p class="tl-modal-subtitle"></p>
      </div>
      <div class="tl-modal-body"></div>
      <div class="tl-modal-footer">
        <a href="#" class="tl-btn tl-about-link">查看詳情</a>
        <button class="tl-btn tl-close-btn-alt">關閉</button>
      </div>
    </div>
  </div>
  `;
  
  // 插入HTML
  document.getElementById('timelineContainer').innerHTML = html;
  
  // 獲取元素
  const modalBackdrop = document.querySelector('.tl-modal-backdrop');
  const modal = document.querySelector('.tl-modal');
  const closeButtons = document.querySelectorAll('.tl-close-btn');
  const aboutLink = document.querySelector('.tl-about-link');
  
  // 處理模態框關閉
  const closeModal = () => {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  // 綁定關閉事件
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  document.querySelector('.tl-close-btn-alt').addEventListener('click', closeModal);
  
  modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) closeModal();
  });
  
  // ESC鍵關閉
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });
  
  // 打開模態框
  const openModal = (key) => {
    const data = timelineData.find(item => item.id === key);
    if (!data) return;
    
    modal.querySelector('.tl-modal-title').textContent = data.modalTitle;
    modal.querySelector('.tl-modal-subtitle').textContent = data.modalSubtitle;
    modal.querySelector('.tl-modal-body').innerHTML = data.modalContent;
    aboutLink.href = data.linkUrl;
    
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  
  // 綁定卡片點擊
  document.querySelectorAll('.tl-card').forEach(card => {
    const key = card.getAttribute('data-key');
    const btn = card.querySelector('.tl-more');
    
    card.addEventListener('click', e => {
      if (e.target !== btn && !btn.contains(e.target)) {
        openModal(key);
      }
    });
    
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(key);
    });
  });
  
  /* === Sydney 動態時間 (AEST/AEDT) === */
  const dtfSydney = new Intl.DateTimeFormat('en-CA',{
    timeZone:'Australia/Sydney',
    year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',
    hourCycle:'h23'
  });
  function getSydneyOffsetMinutes(utcMs){
    const parts = dtfSydney.formatToParts(new Date(utcMs));
    let y,m,d,h,mi,s;
    for(const p of parts){
      if(p.type==='year') y=+p.value;
      else if(p.type==='month') m=+p.value;
      else if(p.type==='day') d=+p.value;
      else if(p.type==='hour') h=+p.value;
      else if(p.type==='minute') mi=+p.value;
      else if(p.type==='second') s=+p.value;
    }
    const reconstructedUtc = Date.UTC(y,m-1,d,h,mi,s);
    return (reconstructedUtc - utcMs)/60000;
  }
  function parseSydneyLocal(str){
    const [dPart,tPart='00:00'] = str.split(' ');
    const [day,mon,year] = dPart.split('/').map(Number);
    const [hh,mm] = tPart.split(':').map(Number);
    let assumed = 600;
    let utcMs = Date.UTC(year,mon-1,day,hh,mm,0)-assumed*60000;
    const actual = getSydneyOffsetMinutes(utcMs);
    if(actual!==assumed) utcMs = Date.UTC(year,mon-1,day,hh,mm,0)-actual*60000;
    return utcMs;
  }
  function timeSinceSydney(str){
    const start = parseSydneyLocal(str);
    let diff = Date.now()-start;
    if(diff<0) diff=0;
    const days=Math.floor(diff/86400000);
    const hours=Math.floor((diff%86400000)/3600000);
    const minutes=Math.floor((diff%3600000)/60000);
    const seconds=Math.floor((diff%60000)/1000);
    return {days,hours,minutes,seconds};
  }
  function sydneyNow(){
    return new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
  }
  function zoneLabel(){
    return getSydneyOffsetMinutes(Date.now())===660?'AEDT':'AEST';
  }
  function formatNow(){
    const n=sydneyNow();
    return {
      date:`${String(n.getDate()).padStart(2,'0')}/${String(n.getMonth()+1).padStart(2,'0')}/${n.getFullYear()}`,
      time:`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`
    };
  }
  function updateCounters(){
    timelineData.forEach(item=>{
      const t=timeSinceSydney(item.date);
      const wrap=document.getElementById(item.id+'Counter');
      if(!wrap) return;
      const dEl=wrap.querySelector('.tl-days');
      const timeEl=wrap.querySelector('.tl-time');
      if(dEl) dEl.textContent=t.days;
      if(timeEl) timeEl.textContent=`${String(t.hours).padStart(2,'0')}:${String(t.minutes).padStart(2,'0')}:${String(t.seconds).padStart(2,'0')}`;
    });
    const info=document.getElementById('timeInfo');
    if(info){
      const z=zoneLabel();
      const f=formatNow();
      info.textContent=`雪梨 (${z}) 時間：${f.date} ${f.time}`;
    }
  }
  updateCounters();
  setInterval(updateCounters,1000);
  /* === End Sydney Time === */
});
</script>

<style>
/* ===== 時間線設計 ===== */

/* 基本變量與容器 */
.tl-container {
  --tl-accent: var(--hb-active, #e1306c);
  --tl-radius: 18px;
  --tl-bg-light: #fff;
  --tl-bg-dark: #2a2b2f;
  --tl-border-light: rgba(0,0,0,0.06);
  --tl-border-dark: rgba(255,255,255,0.1);
  --tl-shadow: 0 8px 16px rgba(0,0,0,0.08);
  --tl-shadow-hover: 0 12px 24px rgba(0,0,0,0.12);
  
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 0 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: rgba(0, 0, 0, 0.85);
}

body.dark .tl-container { color: rgba(255, 255, 255, 0.85); }

/* 卡片網格 - 桌面三列 */
.tl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 0.25rem;
  margin-bottom: 1.25rem;
}

/* 卡片基本樣式 - 確保overflow和圓角 */
.tl-card {
  background: var(--tl-bg-light) !important;
  border-radius: var(--tl-radius);
  box-shadow: var(--tl-shadow);
  overflow: hidden; /* 關鍵：確保所有內容被裁切 */
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tl-border-light);
  height: 100%;
  position: relative;
}

body.dark .tl-card {
  background: var(--tl-bg-dark) !important;
  border-color: var(--tl-border-dark);
}

.tl-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--tl-shadow-hover);
}

/* 圖片容器 - 增加向上移動距離 */
.tl-image {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 保持1:1比例 */
  background: #f0f0f0;
  flex-shrink: 0;
  margin-top: -20px; /* 從 -10px 增加到 -20px */
  border-radius: var(--tl-radius) var(--tl-radius) 0 0;
  overflow: hidden;
}

body.dark .tl-image {
  background: #333;
}

/* 圖片填充 */
.tl-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.35s;
}

.tl-card:hover .tl-image img {
  transform: scale(1.05);
}

/* 卡片內容區 - 增加向上移動距離 */
.tl-content {
  padding: 1rem 1.2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background: inherit;
  position: relative;
  z-index: 1;
  margin-top: -10px; /* 從 -5px 增加到 -10px */
}

.tl-content h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: var(--tl-accent);
}

/* 計數器 */
.tl-counter {
  margin-bottom: 0.3rem; /* 從 0.6rem 減少到 0.3rem */
}

.tl-days {
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.2rem;
  color: var(--tl-accent);
}

.tl-time {
  font-size: 0.8rem;
  font-family: monospace;
  letter-spacing: 0.02rem;
  opacity: 0.8;
  font-weight: 600;
}

.tl-meta {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.2rem; /* 從 0.4rem 減少到 0.2rem */
}

/* 了解更多按鈕 */
.tl-more {
  margin-top: auto;
  background: #f5f5f7;
  color: #333;
  border: none;
  padding: 0.7rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  border-top: 1px solid rgba(0,0,0,0.04);
}

.tl-more:hover {
  background: var(--tl-accent);
  color: white;
}

body.dark .tl-more {
  background: #32333a;
  color: #ddd;
  border-top: 1px solid rgba(255,255,255,0.05);
}

body.dark .tl-more:hover {
  background: var(--tl-accent);
  color: white;
}

/* 時間備註 - 左對齊與紅線 */
.tl-footer {
  margin-top: 0.8rem;
  text-align: left;
}

.tl-note {
  font-size: 0.75rem;
  opacity: 0.8;
  padding-left: 0.8rem;
  position: relative;
  line-height: 1.5;
  font-family: monospace;
  display: inline-block;
}

.tl-note::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--tl-accent);
  border-radius: 3px;
}

/* 模態框樣式 */
.tl-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 9999;
  backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}

.tl-modal-backdrop.active {
  opacity: 1;
  visibility: visible;
}

.tl-modal {
  background: #fff;
  width: 100%;
  max-width: 540px;
  border-radius: 18px;
  padding: 1.8rem;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
  max-height: 85vh;
  overflow-y: auto;
  transform: scale(0.95);
  transition: transform 0.3s;
  color: rgba(0, 0, 0, 0.85);
}

.tl-modal-backdrop.active .tl-modal {
  transform: scale(1);
}

body.dark .tl-modal {
  background: #26272c;
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
}

.tl-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--tl-accent);
  margin-bottom: 0.3rem;
}

body.dark .tl-modal-title {
  color: #ff8fb7;
}

.tl-modal-subtitle {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.tl-modal-body {
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.tl-modal-body p {
  margin-bottom: 1rem;
}

.tl-highlight-link {
  color: var(--tl-accent);
  text-decoration: none;
  font-weight: 700;
  border-bottom: 2px solid var(--tl-accent);
  padding-bottom: 1px;
  transition: background-color 0.2s, color 0.2s;
}

.tl-highlight-link:hover {
  background-color: var(--tl-accent);
  color: white;
  border-color: transparent;
}

.tl-modal-body a {
  color: var(--tl-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.tl-modal-body a:hover {
  border-color: var(--tl-accent);
}

.tl-modal-footer {
  display: flex;
  justify-content: space-between;
}

.tl-btn {
  padding: 0.7rem 1.3rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.tl-about-link {
  background: #f0f0f2;
  color: #333;
  text-decoration: none;
}

.tl-about-link:hover {
  background: var(--tl-accent);
  color: white;
}

body.dark .tl-about-link {
  background: #32333a;
  color: #ddd;
}

body.dark .tl-about-link:hover {
  background: var(--tl-accent);
  color: white;
}

.tl-close-btn-alt {
  background: rgba(0,0,0,0.05);
  color: #666;
  border: none;
}

.tl-close-btn-alt:hover {
  background: #f44336;
  color: white;
}

body.dark .tl-close-btn-alt {
  background: rgba(255,255,255,0.1);
  color: #ddd;
}

body.dark .tl-close-btn-alt:hover {
  background: #f44336;
  color: white;
}

.tl-close-btn {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  width: 32px;
  height: 32px;
  background: rgba(0,0,0,0.05);
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.25s;
}

.tl-close-btn:hover {
  background: rgba(0,0,0,0.15);
  color: #333;
}

body.dark .tl-close-btn {
  background: rgba(255,255,255,0.1);
  color: #bbb;
}

body.dark .tl-close-btn:hover {
  background: rgba(255,255,255,0.2);
  color: white;
}

/* 載入提示 */
#timelineContainer {
  text-align: center;
  padding: 1rem 0;
  font-weight: 500;
  opacity: 0.7;
}

/* 平板響應式設計 */
@media (max-width: 1080px) {
  .tl-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }
}

/* 手機響應式設計 */
@media (max-width: 640px) {
  .tl-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
  
  .tl-card {
    display: grid;
    grid-template-columns: 110px 1fr;
    height: auto;
    min-height: 110px;
    grid-template-rows: auto;
    grid-template-areas: "image content";
    overflow: hidden;
    position: relative; /* 確保定位基準 */
  }
  
  .tl-image {
    width: 110px;
    height: 125px; /* 從 110px 增加到 125px，向下延伸 */
    padding-bottom: 0;
    grid-area: image;
    flex-shrink: 0;
    margin-top: -15px;
    margin-left: -5px;
    border-radius: var(--tl-radius) 0 0 var(--tl-radius);
    overflow: hidden;
  }
  
  .tl-content {
    width: auto;
    text-align: left;
    padding: 0.6rem 0.8rem;
    padding-bottom: 2.5rem;
    position: relative;
    grid-area: content;
    margin-top: 0px; /* 從 -2px 改為 0px，向下移動 */
    margin-left: 5px; /* 新增右移 */
  }
  
  .tl-content h3 {
    margin-top: 0px; /* 從 -2px 改為 0px */
    margin-bottom: 0.4rem;
  }
  
  .tl-counter {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin-bottom: 0.1rem; /* 保持較小間距 */
  }
  
  .tl-meta {
    font-size: 0.65rem;
    margin-top: 0.05rem; /* 從 0.1rem 減少到 0.05rem */
  }
  
  /* 修復手機版按鈕 */
  .tl-more {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    left: auto; /* 取消左側對齊 */
    width: auto;
    padding: 0.4rem 0.7rem;
    font-size: 0.65rem;
    border-radius: 6px;
    border: none;
    margin: 0; /* 重置外邊距 */
    background: rgba(0,0,0,0.05);
    border-top: none; /* 移除頂部邊框 */
    z-index: 2;
  }
  
  body.dark .tl-more {
    background: rgba(255,255,255,0.08);
  }
}

/* 超小屏幕適配 */
@media (max-width: 380px) {
  .tl-card {
    grid-template-columns: 90px 1fr;
  }
  
  .tl-image {
    width: 90px;
    height: 105px; /* 從 90px 增加到 105px，向下延伸 */
    margin-top: -15px;
    margin-left: -5px;
  }
  
  .tl-content {
    padding: 0.5rem 0.7rem 2.5rem 0.7rem;
    margin-top: 0px; /* 從 -2px 改為 0px */
    margin-left: 5px; /* 新增右移 */
  }
  
  .tl-content h3 {
    font-size: 0.9rem;
    margin-top: 0px; /* 從 -2px 改為 0px */
    margin-bottom: 0.4rem;
  }
  
  .tl-more {
    padding: 0.3rem 0.6rem;
    font-size: 0.6rem;
    right: 0.4rem;
    bottom: 0.4rem;
  }
}

/* === 中文版加粗小字（時間 & 開始日期 / 生日） === */
.tl-time {
  font-weight: 700; /* 原本 600 -> 提升可讀性 */
}
.tl-meta {
  font-weight: 600; /* 加粗開始日期 / 生日行 */
}

/* 可選：時間備註（頁腳當前時間）若也需加粗可解除註解 */
// .tl-note { font-weight:600; }
</style>