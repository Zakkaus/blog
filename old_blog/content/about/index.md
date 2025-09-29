---
title: "About"
slug: "about"
toc: false
date: 2025-09-01
lastmod: 2025-09-01
---
<style>
/* ==== Copied full styling parity with zh-hant version (accent uses --hb-active) ==== */
:root {
  --about-accent: var(--hb-active,#e1306c);
  --about-bg-light:#fafafa;
  --about-bg-dark:#242528;
  --about-border-light:#e2e3e6;
  --about-border-dark:#3a3d42;
  --about-text-light:#222;
  --about-text-dark:#e9e9eb;
}
/* 基礎強調還原 */
.about-page strong{background:none!important;color:inherit!important;padding:0!important;margin:0!important;border-radius:0!important;font-weight:600;}
/* Hero 初始強調（之後再被覆蓋為漸層底線） */
.about-page .about-hero strong{
  background:rgba(225,48,108,.16)!important;color:var(--about-accent)!important;
  padding:.18rem .55rem .22rem!important;margin:.12rem .25rem .12rem 0!important;border-radius:999px!important;line-height:1.15;display:inline-block;letter-spacing:.3px;
}
body.dark .about-page .about-hero strong{background:rgba(225,48,108,.32)!important;color:#ff8fb7!important;}
.about-page .about-hero{
  background:#f9fafb!important;border:1px solid #e5e6e9!important;border-radius:14px!important;
  padding:1.05rem 1.2rem 1.15rem!important;font-size:1.08rem!important;line-height:1.7!important;margin:0 0 1.6rem!important;position:relative;
}
body.dark .about-page .about-hero{background:#1f2021!important;border:1px solid #34363a!important;}
.about-page .about-hero strong{
  background:linear-gradient(to top,rgba(225,48,108,.32),rgba(225,48,108,0) 65%)!important;
  color:var(--about-accent)!important;padding:0 .2rem!important;margin:0 .15rem 0 0!important;border-radius:4px!important;line-height:1.25;letter-spacing:.25px;
}
body.dark .about-page .about-hero strong{
  background:linear-gradient(to top,rgba(225,48,108,.45),rgba(225,48,108,0) 65%)!important;color:#ff8fb7!important;
}
.about-page .about-hero p{margin:.55rem 0!important;}
.about-page .about-hero p:first-child{margin-top:0!important;}
.about-page .about-hero p:last-child{margin-bottom:.2rem!important;}
/* Section headings */
.about-page h3{
  padding:0 0 .3rem .75rem!important;margin:1.9rem 0 .55rem!important;font-size:.98rem!important;font-weight:600;line-height:1.25;position:relative;
  background:linear-gradient(to right,rgba(225,48,108,.10),rgba(225,48,108,0) 72%)!important;border-radius:6px!important;
}
.about-page h3::before{
  content:"";position:absolute;left:0;top:0;bottom:.3rem;width:3px;background:var(--about-accent);border-radius:2px;
}
.about-page h3::after{
  content:"";position:absolute;left:.75rem;bottom:-2px;height:2px;width:64px;background:var(--about-accent);border-radius:2px;opacity:.82;
}
body.dark .about-page h3{background:linear-gradient(to right,rgba(225,48,108,.22),rgba(225,48,108,0) 72%)!important;}
.about-page .about-hero + h3{margin-top:1.35rem!important;}
/* Lists */
.about-page h3 + ul{list-style:none;margin:.35rem 0 .3rem!important;padding:0!important;}
.about-page h3 + ul li{position:relative;padding:.42rem 0 .42rem 1.1rem!important;font-size:.9rem;line-height:1.45;margin:0;}
.about-page h3 + ul li::before{
  content:"";position:absolute;left:0;top:.95rem;width:6px;height:6px;background:var(--about-accent);border-radius:50%;opacity:.55;
}
body.dark .about-page h3 + ul li::before{opacity:.75;}
/* Contact list (vertical) */
.about-page .about-contacts{list-style:none;margin:.35rem 0 .3rem!important;padding:0!important;}
.about-page .about-contacts li{position:relative;padding:.42rem 0 .42rem 1.1rem!important;margin:0;}
.about-page .about-contacts li::before{
  content:"";position:absolute;left:0;top:.95rem;width:6px;height:6px;background:var(--about-accent);border-radius:50%;opacity:.55;
}
body.dark .about-page .about-contacts li::before{opacity:.75;}
.about-page .about-contacts a{color:var(--about-accent);font-weight:600;text-decoration:none;transition:.18s;}
.about-page .about-contacts a:hover{text-decoration:underline;}
/* Blue highlight unified clickable */
.about-page .blue-highlight,
.about-page a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.32),rgba(29,111,255,0) 65%)!important;
  color:#1d6fff!important;padding:.18rem .55rem .22rem!important;margin:.12rem .25rem .12rem 0!important;
  border-radius:999px!important;line-height:1.15;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:.3px;transition:.25s;
}
body.dark .about-page .blue-highlight{background:linear-gradient(to top,rgba(29,111,255,.48),rgba(29,111,255,0) 65%)!important;color:#8bc4ff!important;}
.about-page a.blue-highlight:hover{background:#1d6fff!important;color:#fff!important;box-shadow:0 0 0 3px rgba(29,111,255,.25);text-decoration:none;transform:translateY(-1px);}
body.dark .about-page a.blue-highlight:hover{box-shadow:0 0 0 3px rgba(29,111,255,.35);}
.about-page .about-hero a{color:var(--about-accent);text-decoration:none;}
.about-page .about-hero a:hover{text-decoration:underline;}
/* Modal */
.about-modal-backdrop{
  position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;padding:1.5rem;z-index:9999;
  opacity:0;visibility:hidden;transition:.25s;
}
.about-modal-backdrop.active{opacity:1;visibility:visible;}
.about-modal{
  background:#fff;color:#222;width:100%;max-width:560px;border-radius:18px;
  padding:1.6rem 1.55rem 1.9rem;max-height:85vh;overflow-y:auto;position:relative;
  font-size:.9rem;line-height:1.65;transform:translateY(12px);transition:.28s;
  box-shadow:0 25px 55px -15px rgba(0,0,0,.55);
}
.about-modal-backdrop.active .about-modal{transform:translateY(0);}
body.dark .about-modal{background:#26272c;color:#ddd;box-shadow:0 30px 65px -18px rgba(0,0,0,.75);}
.about-modal h4{margin:0 0 .55rem;font-size:1.15rem;font-weight:700;color:var(--about-accent);letter-spacing:.5px;}
body.dark .about-modal h4{color:#ff8fb7;}
.about-modal .am-sub{font-size:.7rem;opacity:.65;letter-spacing:.6px;margin:-.25rem 0 1.1rem;font-weight:600;}
.about-modal-close{
  position:absolute;top:.8rem;right:.8rem;width:34px;height:34px;border:none;border-radius:50%;
  background:rgba(0,0,0,.06);cursor:pointer;font-size:1.05rem;display:flex;align-items:center;justify-content:center;
  transition:.22s;
}
.about-modal-close:hover{background:rgba(0,0,0,.15);transform:rotate(8deg);}
body.dark .about-modal-close{background:rgba(255,255,255,.12);color:#ddd;}
body.dark .about-modal-close:hover{background:rgba(255,255,255,.22);}
.about-modal a{
  background:linear-gradient(to top,rgba(29,111,255,.32),rgba(29,111,255,0) 65%)!important;
  color:#1d6fff!important;padding:.18rem .55rem .22rem!important;margin:.12rem .25rem .12rem 0!important;
  border-radius:999px!important;font-weight:600;text-decoration:none;display:inline-block;transition:.25s;border:none!important;
}
body.dark .about-modal a{background:linear-gradient(to top,rgba(29,111,255,.48),rgba(29,111,255,0) 65%)!important;color:#8bc4ff!important;}
.about-modal a:hover{background:#1d6fff!important;color:#fff!important;box-shadow:0 0 0 3px rgba(29,111,255,.25);text-decoration:none;transform:translateY(-1px);}
body.dark .about-modal a:hover{box-shadow:0 0 0 3px rgba(29,111,255,.35);}
.about-modal .am-section{margin:0 0 1.05rem;}
/* Responsive tweaks */
@media (max-width:640px){
  .about-page h3 + ul li,.about-page .about-contacts li{padding:.38rem 0 .38rem 1rem!important;}
  .about-page h3 + ul li::before,.about-page .about-contacts li::before{top:.85rem;}
  .about-modal{padding:1.4rem 1.25rem 1.6rem;}
}
/* Reduced motion */
@media (prefers-reduced-motion:reduce){
  .about-modal,.about-modal-backdrop,.about-page a.blue-highlight{transition:none!important;transform:none!important;}
}

/* === Fix: restore blue-highlight pill effect for Instagram link in hero (English) === */
.about-page .about-hero a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.32),rgba(29,111,255,0) 65%)!important;
  display:inline-block!important;
  color:#1d6fff!important;
  border:none!important;
  padding:.18rem .55rem .22rem!important;
  margin:.12rem .25rem .12rem 0!important;
  border-radius:999px!important;
  line-height:1.15!important;
  font-weight:600!important;
  text-decoration:none!important;
  transition:.25s;
}
body.dark .about-page .about-hero a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.48),rgba(29,111,255,0) 65%)!important;
  color:#8bc4ff!important;
}
.about-page .about-hero a.blue-highlight:hover{
  background:#1d6fff!important;
  color:#fff!important;
  box-shadow:0 0 0 3px rgba(29,111,255,.25);
  transform:translateY(-1px);
  text-decoration:none!important;
}
body.dark .about-page .about-hero a.blue-highlight:hover{
  box-shadow:0 0 0 3px rgba(29,111,255,.35);
}
.about-page .about-hero a.blue-highlight strong{
  background:none!important;
  color:inherit!important;
  padding:0!important;
  margin:0!important;
  font:inherit!important;
  letter-spacing:inherit!important;
}

/* === English About: headings simple underline (no left bar / bg) === */
html[lang="en"] .about-page h3{
  background:none!important;
  padding:0 0 .35rem 0!important;
  margin:1.9rem 0 .65rem!important;
  border-radius:0!important;
}
html[lang="en"] .about-page h3::before{content:none!important;}
html[lang="en"] .about-page h3::after{
  left:0!important;
  bottom:-2px!important;
  width:64px!important;
  height:2px!important;
  background:var(--about-accent)!important;
  opacity:.85!important;
  border-radius:2px!important;
}

/* === EN Contact: pill style same as zh-hant (pink accent, no bullet) === */
html[lang="en"] .about-page .about-contacts li::before{
  display:none!important;
}
html[lang="en"] .about-page .about-contacts{
  margin:.35rem 0 .3rem!important;
  padding:0!important;
}
html[lang="en"] .about-page .about-contacts li{
  padding:.42rem 0 .42rem 0!important;
  font-size:.85rem;
  line-height:1.4;
}
html[lang="en"] .about-page .about-contacts a{
  background:rgba(225,48,108,.14)!important;
  color:var(--about-accent)!important;
  padding:.48rem .85rem .5rem!important;
  border-radius:12px!important;
  font-size:.72rem!important;
  line-height:1!important;
  letter-spacing:.3px;
  font-weight:700!important;
  text-decoration:none!important;
  display:inline-block;
  transition:background .22s,color .22s,box-shadow .22s;
  box-shadow:none;
}
html[lang="en"] .about-page .about-contacts a:hover{
  background:var(--about-accent)!important;
  color:#fff!important;
  box-shadow:0 4px 10px -4px rgba(225,48,108,.45);
  text-decoration:none!important;
}
body.dark html[lang="en"] .about-page .about-contacts a{
  background:rgba(225,48,108,.30)!important;
  color:#ff8fb7!important;
}
body.dark html[lang="en"] .about-page .about-contacts a:hover{
  background:var(--about-accent)!important;
  color:#fff!important;
  box-shadow:0 5px 14px -6px rgba(225,48,108,.65);
}

/* 保留其他語系樣式不變 */

/* === Hero clickable highlight reshape (match strong style, only blue) === */
.about-page .about-hero a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.35),rgba(29,111,255,0) 65%)!important;
  color:#1d6fff!important;
  padding:0 .2rem!important;
  margin:0 .15rem 0 0!important;
  border-radius:4px!important;
  line-height:1.25!important;
  letter-spacing:.25px!important;
  box-shadow:none!important;
  transform:none!important;
  font-weight:600!important;
}
body.dark .about-page .about-hero a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.55),rgba(29,111,255,0) 65%)!important;
  color:#8bc4ff!important;
}
.about-page .about-hero a.blue-highlight:hover{
  background:linear-gradient(to top,rgba(29,111,255,.55),rgba(29,111,255,0) 65%)!important;
  color:#fff!important;
  box-shadow:none!important;
  transform:none!important;
  text-decoration:none!important;
}
/* 保留其他 .blue-highlight（hero 外）仍為原膠囊 */
</style>

<div class="about-page">
  <div class="about-hero">
    <p>Hi, I’m <strong>Zakk</strong>, living in <strong>Australia</strong> and studying <strong>Business</strong>.</p>
    <p>I have two <strong>guinea pigs</strong>:
      <a href="#" class="blue-highlight" data-am-open="potato">Potato</a> and
      <a href="#" class="blue-highlight" data-am-open="hash">Hash&nbsp;Brown</a>.
      I like <strong>gaming</strong>, <strong>Linux</strong>, <strong>finance</strong>; follow Apple / Samsung / Google ecosystems; listen to melancholic ambient music and sometimes <strong>draw</strong> & <strong>design</strong>. See more of them on
      <a class="blue-highlight" href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener"><strong>Instagram</strong></a>.
    </p>
    <p>My girlfriend <a href="#" class="blue-highlight" data-am-open="couple">Paper</a> and I are currently long‑distance (Australia / Taiwan); we are both <strong>pansexual 🩷💛🩵</strong> and share daily life, study, work, music and thoughts. We have many aligned interests and values, naturally compatible — true <strong>soulmates</strong>; we both love sleeping and being cozy at home, and we share many aligned thoughts, past experiences, and niche interests. We first met in
      <a href="https://www.youtube.com/@xilanceylan" target="_blank" rel="noopener" class="blue-highlight">Ceylan</a>'s Discord community — <a href="/timeline/#couple" class="blue-highlight">see how long we've been together here</a>.
    </p>
    <p style="margin-top:.8rem;font-size:.82rem;opacity:.75;">Below are my main setup and contact links — feel free to connect.</p>
  </div>

### 💻 Desktop
- Motherboard: ASUS ROG STRIX X670E-A GAMING WIFI  
- CPU: AMD Ryzen 9 7950X3D (16C / 32T)  
- GPU: NVIDIA GeForce RTX 4080 SUPER  
- Memory: 64 GB DDR5 6400 MHz  
- Network: Static public IP (Aussie Telecom, 1000/50 Mbps)  
- Router: BE9300 Tri-band Wi‑Fi 7  
- Monitor: Samsung Odyssey G9 49" (5120×1440) via HDMI 2.1 (Belkin cable)  
- OS: Windows 11 Pro 64-bit + Gentoo Linux (KDE Plasma)

### 💼 Laptops
- Apple MacBook Air M2 (16GB / 512GB)  
- ASUS ROG Zephyrus G16 Air (Intel Core Ultra 9 185H / 32GB LPDDR5X / 1TB SSD / RTX 4060 / Windows 11 Pro)

### 📱 Phones (some have been gifted to family/friends)
- Samsung Galaxy Z Fold 7  
- Samsung Galaxy S25 Ultra  
- Google Pixel 7 Pro  
- iPhone 17 Pro  
- iPhone 17 Pro Max  
- iPhone 16 Pro  
- iPhone 15 Pro  
- iPhone 15 Pro Max  
- iPhone 14 Pro  
- iPhone 14  

### 🔗 Contact
<ul class="about-contacts">
  <li><span class="contact-label">Instagram:</span><a href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener">@zakk.au</a></li>
  <li><span class="contact-label">GitHub:</span><a href="https://github.com/Zakkaus" target="_blank" rel="noopener">Zakkaus</a></li>
  <li><span class="contact-label">X:</span><a href="https://x.com/zakkauu" target="_blank" rel="noopener">@zakkauu</a></li>
  <li><span class="contact-label">Email:</span><a href="mailto:admin@zakk.au">admin@zakk.au</a></li>
</ul>
</div>

<!-- Shared Modal -->
<div class="about-modal-backdrop" id="aboutModalBackdrop">
  <div class="about-modal" role="dialog" aria-modal="true" aria-labelledby="aboutModalTitle">
    <button class="about-modal-close" type="button" aria-label="Close" id="aboutModalClose">✕</button>
    <div id="aboutModalContent"></div>
  </div>
</div>

<script>
(()=> {
  const data = {
    couple:{
      title:"Our Relationship",
      sub:"Since 2025/08/07 11:38",
      html:`
        <div class="am-section"><p>I (Zakk) and Paper live apart (Australia / Taiwan) in a long‑distance relationship; we are both <strong>pansexual 🩷💛🩵</strong>.</p></div>
        <div class="am-section"><p>We share daily life, study, work, music and ideas; aligned values & rhythm — genuine <strong>soulmates</strong>.</p></div>
        <div class="am-section"><p>We first met inside <a href="https://www.youtube.com/@xilanceylan" target="_blank" rel="noopener" class="blue-highlight">Ceylan</a>'s Discord; we meet every few months; Paper plans to study in Australia after high school.</p></div>
        <div class="am-section"><p>We both love sleeping, being cozy at home, and we share many aligned thoughts, past experiences, and niche interests.</p></div>
        <div class="am-section"><p><a href="/timeline/#couple" class="blue-highlight">See how long we've been together</a> | Paper IG: <a href="https://www.instagram.com/abyss_74.50/" target="_blank" rel="noopener" class="blue-highlight">@abyss_74.50</a></p></div>
      `
    },
    hash:{
      title:"Hash Brown",
      sub:"Birthday: 2025/06/24",
      html:`
        <div class="am-section"><p>Purebred Teddy guinea pig, light brown (slightly yellowish), very energetic — loves sprinting laps and often pushes her little hideout around the cage.</p></div>
        <div class="am-section"><p>Favorites: red/green bell peppers, corn silk, carrots; makes a <strong>“515151”</strong> (Chinese) sound when she sees people or when I open the fridge to ask for treats. She is a girl.</p></div>
        <div class="am-section"><p><a href="/timeline/#hash" class="blue-highlight">See her day counter</a> | More: <a href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener" class="blue-highlight">@zakk.au</a></p></div>
      `
    },
    potato:{
      title:"Potato",
      sub:"Birthday: 2025/07/27",
      html:`
        <div class="am-section"><p>Dark brown Teddy; bold and food‑driven; sometimes eats and poops simultaneously.</p></div>
        <div class="am-section"><p>Loves bell peppers, corn silk, carrots; often naps buried in hay then resumes eating. She is a girl.</p></div>
        <div class="am-section"><p><a href="/timeline/#potato" class="blue-highlight">See her day counter</a> | More: <a href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener" class="blue-highlight">@zakk.au</a></p></div>
      `
    }
  };

  const backdrop=document.getElementById('aboutModalBackdrop');
  const wrap=document.getElementById('aboutModalContent');
  const closeBtn=document.getElementById('aboutModalClose');

  function openModal(key){
    const d=data[key]; if(!d) return;
    wrap.innerHTML=`<h4 id="aboutModalTitle">${d.title}</h4><div class="am-sub">${d.sub}</div>${d.html}`;
    backdrop.classList.add('active'); document.body.style.overflow='hidden';
  }
  function closeModal(){backdrop.classList.remove('active');document.body.style.overflow='';}

  document.querySelectorAll('[data-am-open]').forEach(el=>{
    el.addEventListener('click',e=>{e.preventDefault();openModal(el.getAttribute('data-am-open'));});
  });
  backdrop.addEventListener('click',e=>{if(e.target===backdrop) closeModal();});
  closeBtn.addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('active')) closeModal();});
})();
</script>