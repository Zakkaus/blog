---
title: "Timeline"
slug: "timeline"
toc: false
date: 2025-09-01
lastmod: 2025-09-01
url: "/timeline/"  # 明確指定URL
---

<div id="timelineContainer">Loading...</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Data definitions
  const timelineData = [
    {
      id: "couple",
      title: "Together",
      date: "07/08/2025 11:38",
      image: "/images/timeline/f-avatar.webp",
      alt: "Girlfriend avatar",
      modalTitle: "Relationship",
      modalSubtitle: "Started on 07 Aug 2025 11:38 (Sydney time)",
      modalContent: `
        <p>I (Zakk) and my girlfriend (Paper) currently live apart (Australia / Taiwan) and maintain a long-distance relationship. We are both pansexual 🩷💛🩵 and we embrace openness, respect, and diversity in identity and love.</p>
        <p>Even with distance, we share daily life, study progress, work, thoughts and emotions. We happen to have a lot of overlapping interests, values and perspectives — our rhythm fits naturally and we became what we both feel is a <span style="font-weight:700;">soulmate</span> connection.</p>
        <p>We first met inside <a href="https://www.youtube.com/@xilanceylan" target="_blank" rel="noopener" class="tl-highlight-link">Ceylan</a>'s Discord community. Casual chat turned into companionship, and over time the bond grew until being together felt effortless and obvious.</p>
        <p>We meet in person every few months. Paper plans to study in Australia after finishing senior high (Year 12), and we look forward to building more chapters side by side.</p>
        <p>We both love sleeping, being cozy at home, and we share many aligned thoughts, past experiences, and niche interests.</p>
        <p>For more of our moments, you can follow Paper’s Instagram: <a href="https://www.instagram.com/abyss_74.50/" target="_blank" rel="noopener" class="tl-highlight-link">@abyss_74.50</a></p>
      `,
      linkUrl: "/about/#relationship"
    },
    {
      id: "hash",
      title: "Hash Brown Age",
      date: "24/06/2025",
      image: "/images/timeline/hashbrown.webp",
      alt: "Hash Brown",
      modalTitle: "Hash Brown",
      modalSubtitle: "Birthday: June 24, 2025",
      modalContent: `
        <p>Hash Brown is a purebred Teddy guinea pig with light brown (slightly yellowish) fur. Very active, loves running laps and pushing her hideout around.</p>
        <p>Favorite foods: Red & green bell peppers, corn silk, carrots. She makes a distinctive <strong>"515151"</strong> (Chinese) sound when she sees people or when I open the fridge for treats. She is a girl.</p>
        <p>Name origin: Named after the McDonald's breakfast <a href="https://mcdonalds.com.au/menu/hash-brown" target="_blank" rel="noopener" class="tl-highlight-link">hash brown</a>.</p>
        <p>More photos on Instagram: <a href="https://instagram.com/zakk.au" target="_blank" rel="noopener" class="tl-highlight-link">@zakk.au</a></p>
      `,
      linkUrl: "/about/#pets"
    },
    {
      id: "potato",
      title: "Potato Age",
      date: "27/07/2025",
      image: "/images/timeline/potato.webp",
      alt: "Potato",
      modalTitle: "Potato",
      modalSubtitle: "Birthday: July 27, 2025",
      modalContent: `
        <p>Potato is a purebred Teddy guinea pig with dark brown fur; bold and food‑driven, sometimes eating and pooping at the same time.</p>
        <p>Loves bell peppers, corn silk and carrots; often naps buried in hay then keeps eating. She is a girl.</p>
        <p>More photos on Instagram: <a href="https://instagram.com/zakk.au" target="_blank" rel="noopener" class="tl-highlight-link">@zakk.au</a></p>
      `,
      linkUrl: "/about/#pets"
    }
  ];
  
  // Page HTML
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
            <p class="tl-meta">${item.id === 'couple' ? `Since ${item.date}` : `Birthday: ${item.date}`}</p>
          </div>
          <button class="tl-more">Learn More</button>
        </div>
      `).join('')}
    </div>
    <div class="tl-footer">
      <p class="tl-note" id="timeInfo">Sydney time loading...</p>
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
        <a href="#" class="tl-btn tl-about-link">View Details</a>
        <button class="tl-btn tl-close-btn-alt">Close</button>
      </div>
    </div>
  </div>
  `;
  
  // Insert HTML
  document.getElementById('timelineContainer').innerHTML = html;
  
  // Get elements
  const modalBackdrop = document.querySelector('.tl-modal-backdrop');
  const modal = document.querySelector('.tl-modal');
  const closeButtons = document.querySelectorAll('.tl-close-btn');
  const aboutLink = document.querySelector('.tl-about-link');
  
  // Handle modal close
  const closeModal = () => {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  // Bind close events
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  document.querySelector('.tl-close-btn-alt').addEventListener('click', closeModal);
  
  modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) closeModal();
  });
  
  // ESC key close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Open modal
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
  
  // Bind card clicks
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
  
  // === 新時間處理（Sydney 自動 AEST / AEDT）取代舊 parseDateAEST / timeSince / getSydneyNow / formatSydneyDateTime ===
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
    const reconstructedUtc = Date.UTC(y, m-1, d, h, mi, s);
    return (reconstructedUtc - utcMs)/60000; // local - utc
  }

  // 將「DD/MM/YYYY HH:MM」(Sydney 本地) 轉為 UTC ms，考慮夏令時 (+10 / +11)
  function parseSydneyLocal(dateStr){
    const [datePart, timePart='00:00'] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    // 先假設 +10 做初始猜測
    let assumedOffset = 600;
    let utcMs = Date.UTC(year, month-1, day, hh, mm, 0) - assumedOffset*60000;
    let actual = getSydneyOffsetMinutes(utcMs);
    if(actual !== assumedOffset){
      // 用實際 offset 再計算一次
      utcMs = Date.UTC(year, month-1, day, hh, mm, 0) - actual*60000;
    }
    return utcMs;
  }

  function timeSinceSydney(dateStr){
    const startUtc = parseSydneyLocal(dateStr);
    let diff = Date.now() - startUtc;
    if(diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000)/3600000);
    const minutes = Math.floor((diff % 3600000)/60000);
    const seconds = Math.floor((diff % 60000)/1000);
    return {days,hours,minutes,seconds};
  }

  function getSydneyNow(){
    // 利用 toLocaleString 取得當前 Sydney 時間再 new Date 以避免本地時區
    return new Date(new Date().toLocaleString('en-US',{timeZone:'Australia/Sydney'}));
  }

  function currentSydneyZoneLabel(){
    // 判斷 offset (+600 -> AEST, +660 -> AEDT)
    const offset = getSydneyOffsetMinutes(Date.now());
    return offset === 660 ? 'AEDT' : 'AEST';
  }

  function formatSydneyNow(){
    const now = getSydneyNow();
    const Y = now.getFullYear();
    const M = String(now.getMonth()+1).padStart(2,'0');
    const D = String(now.getDate()).padStart(2,'0');
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    return { date:`${D}/${M}/${Y}`, time:`${h}:${m}:${s}` };
  }

  function updateCounters(){
    timelineData.forEach(item=>{
      const t = timeSinceSydney(item.date);
      const wrap = document.getElementById(item.id+'Counter');
      if(!wrap) return;
      const dEl = wrap.querySelector('.tl-days');
      const timeEl = wrap.querySelector('.tl-time');
      if(dEl) dEl.textContent = t.days;
      if(timeEl) timeEl.textContent =
        `${String(t.hours).padStart(2,'0')}:${String(t.minutes).padStart(2,'0')}:${String(t.seconds).padStart(2,'0')}`;
    });
    const info = document.getElementById('timeInfo');
    if(info){
      const z = currentSydneyZoneLabel();
      const ft = formatSydneyNow();
      info.textContent = `Sydney (${z}) time: ${ft.date} ${ft.time}`;
    }
  }

  updateCounters();
  setInterval(updateCounters, 1000);
  // === 時間處理結束 ===
});
</script>

<style>
/* ===== Timeline Design - Simplified Image Position Fix ===== */

/* Basic Variables & Container */
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

/* Card Grid - Desktop 3 columns */
.tl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 0.25rem;
  margin-bottom: 1.25rem;
}

/* Card Base Style */
.tl-card {
  background: var(--tl-bg-light) !important;
  border-radius: var(--tl-radius);
  box-shadow: var(--tl-shadow);
  overflow: hidden;
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

/* Image Container - Increase upward movement */
.tl-image {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background: #f0f0f0;
  flex-shrink: 0;
  margin-top: -20px; /* Increase from -10px to -20px */
  border-radius: var(--tl-radius) var(--tl-radius) 0 0;
  overflow: hidden;
}

body.dark .tl-image {
  background: #333;
}

/* Image fill */
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

/* Card Content Area - Increase upward movement */
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
  margin-top: -10px; /* Increase from -5px to -10px */
}

.tl-content h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: var(--tl-accent);
}

/* Counter */
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

/* Learn More Button */
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

/* Time Note */
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

/* Modal Styles */
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

/* Loading Hint */
#timelineContainer {
  text-align: center;
  padding: 1rem 0;
  font-weight: 500;
  opacity: 0.7;
}

/* Tablet Responsive Design */
@media (max-width: 1080px) {
  .tl-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }
}

/* Mobile Responsive Design */
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
  }
  
  .tl-image {
    width: 110px;
    height: 125px; /* Increase from 110px to 125px, extend downward */
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
    margin-top: 0px; /* Change from -2px to 0px, move down */
    margin-left: 5px; /* Add right movement */
  }
  
  .tl-content h3 {
    margin-top: 0px; /* Change from -2px to 0px */
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
  
  .tl-more {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    left: auto;
    width: auto;
    padding: 0.4rem 0.7rem;
    font-size: 0.65rem;
    border-radius: 6px;
    border: none;
    margin: 0;
    background: rgba(0,0,0,0.05);
    border-top: none;
    z-index: 2;
  }
  
  body.dark .tl-more {
    background: rgba(255,255,255,0.08);
  }
}

/* Extra Small Screen */
@media (max-width: 380px) {
  .tl-card {
    grid-template-columns: 90px 1fr;
  }
  
  .tl-image {
    width: 90px;
    height: 105px;
    margin-top: -15px;
    margin-left: -5px;
  }
  
  .tl-days {
    font-size: 1.6rem;
  }
  
  .tl-content {
    padding: 0.5rem 0.7rem 2.5rem 0.7rem;
    margin-top: 0px; /* Change from -2px to 0px */
    margin-left: 5px; /* Add right movement */
  }
  
  .tl-content h3 {
    font-size: 0.9rem;
    margin-top: 0px; /* Change from -2px to 0px */
    margin-bottom: 0.4rem;
  }
  
  .tl-more {
    padding: 0.3rem 0.6rem;
    font-size: 0.6rem;
    right: 0.4rem;
    bottom: 0.4rem;
  }
}
</style>