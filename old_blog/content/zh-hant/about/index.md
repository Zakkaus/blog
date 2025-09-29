---
title: "關於我"
slug: "about"
toc: false
date: 2025-09-01
lastmod: 2025-09-01
---
<style>
:root {
  --about-accent: var(--hb-active,#e1306c);
  --about-bg-light: #fafafa;
  --about-bg-dark: #242528;
  --about-border-light: #e2e3e6;
  --about-border-dark: #3a3d42;
  --about-text-light: #222;
  --about-text-dark: #e9e9eb;
  --about-pill-bg-light: rgba(225,48,108,.12);
  --about-pill-bg-dark: rgba(225,48,108,.30);
}

/* 移除原全域 strong 高亮，統一還原 */
.about-page strong{
  background:none!important;
  color:inherit!important;
  padding:0!important;
  margin:0!important;
  border-radius:0!important;
  font-weight:600;
}

/* 僅個人簡介內強調高亮 */
.about-page .about-hero strong{
  background:rgba(225,48,108,.16)!important;
  color:var(--about-accent)!important;
  padding:.18rem .55rem .22rem!important;
  margin:.12rem .25rem .12rem 0!important;
  border-radius:999px!important;
  line-height:1.15;
  display:inline-block;
  letter-spacing:.3px;
}
body.dark .about-page .about-hero strong{
  background:rgba(225,48,108,.32)!important;
  color:#ff8fb7!important;
}

/* === Hero 再次精簡：扁平、融入版面 === */
.about-page .about-hero{
  background:#f9fafb !important;
  border:1px solid #e5e6e9 !important;
  border-radius:14px !important;
  box-shadow:none !important;
  padding:1.05rem 1.2rem 1.15rem !important;
  font-size:1.08rem !important;
  line-height:1.7 !important;
  position:relative;
  margin:0 0 1.6rem !important; /* 原 2.1rem */
}
body.dark .about-page .about-hero{
  background:#1f2021 !important;
  border:1px solid #34363a !important;
}

/* 移除舊裝飾 */
.about-page .about-hero::before,
.about-page .about-hero::after{
  content:none !important;
}

/* 強調詞：改用半透明底線 + 主色文字（不再膠囊） */
.about-page .about-hero strong{
  background:
    linear-gradient(to top,rgba(225,48,108,.32),rgba(225,48,108,0) 65%) !important;
  color:var(--about-accent) !important;
  padding:0 .2rem 0 .2rem !important;
  margin:0 .15rem 0 0 !important;
  border-radius:4px !important;
  font-weight:600;
  line-height:1.25;
  display:inline-block;
  letter-spacing:.25px;
}
body.dark .about-page .about-hero strong{
  background:linear-gradient(to top,rgba(225,48,108,.45),rgba(225,48,108,0) 65%) !important;
  color:#ff8fb7 !important;
}

/* Hero 段落間距微調 */
.about-page .about-hero p{margin:.55rem 0 !important;}
.about-page .about-hero p:first-child{margin-top:0 !important;}
.about-page .about-hero p:last-child{margin-bottom:.2rem !important;}

/* 標題：更細緻左線，去除多餘 padding */
.about-page h3{
  padding:0 0 .3rem .75rem !important;
  margin:1.9rem 0 .55rem !important;
  font-size:.98rem !important;
  line-height:1.25;
  font-weight:600;
  position:relative;
  background:linear-gradient(to right,rgba(225,48,108,.10),rgba(225,48,108,0) 72%) !important;
  border-radius:6px !important;
}
.about-page h3::before{
  width:2px !important;
  background:var(--about-accent) !important;
  bottom:.3rem !important;
}
.about-page h3::after{
  content:"";
  position:absolute;
  left:.75rem;
  bottom:0;
  height:2px;
  width:64px;
  background:var(--about-accent);
  border-radius:2px;
  opacity:.78;
}
body.dark .about-page h3,
body.dark .about-page h3::after{
  background:linear-gradient(to right,rgba(225,48,108,.22),rgba(225,48,108,0) 72%) !important;
  opacity:.9;
}

/* 第一個標題（緊接 hero）再略縮 */
.about-page .about-hero + h3{
  margin-top:1.35rem !important;
}

/* 列表 */
.about-page h3 + ul {
  list-style: none;
  margin:.15rem 0 .2rem !important;
  padding: 0;
}
.about-page h3 + ul li {
  position: relative;
  padding:.4rem 0 .4rem 1.15rem !important;
  font-size: .9rem;
}
.about-page h3 + ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: .98rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--about-accent);
  opacity: .55;
}
body.dark .about-page h3 + ul li::before { opacity: .75; }

/* 連結（一般） */
.about-page a[href^="http"],
.about-page a[href^="mailto:"] {
  color: var(--about-accent);
  font-weight: 600;
  text-decoration: none;
  transition: color .18s;
}
.about-page a:hover { text-decoration: underline; }

/* 聯絡方式 Pills */
.about-page .about-contacts {
  list-style: none;
  margin: .55rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: .55rem .65rem;
}
.about-page .about-contacts li { margin: 0; padding: 0; }
.about-page .about-contacts li::before { display: none; }
.about-page .about-contacts a {
  background: var(--about-pill-bg-light);
  padding: .48rem .85rem .5rem;
  font-size: .7rem;
  letter-spacing: .45px;
  line-height: 1;
  border-radius: 9px;
  display: inline-block;
  text-decoration: none;
  color: var(--about-accent);
  transition: background .22s, color .22s;
}
body.dark .about-page .about-contacts a {
  background: var(--about-pill-bg-dark);
  color: #ff8fb7;
}
.about-page .about-contacts a:hover {
  background: var(--about-accent);
  color: #fff;
}

/* === 覆蓋：聯絡方式改為垂直列表，統一風格 === */
.about-page .about-contacts{
  display:block !important;
  flex-wrap:nowrap !important;
  gap:0 !important;
  margin:.2rem 0 0 !important;
  padding:0 !important;
  list-style:none;
}
.about-page .about-contacts li{
  display:block !important;
  position:relative;
  margin:0 0 .45rem !important;
  padding:.42rem 0 .42rem 1.15rem !important;
  background:transparent !important;
}
.about-page .about-contacts li:last-child{margin-bottom:0 !important;}
.about-page .about-contacts li::before{
  content:"";
  position:absolute;
  left:0;top:.95rem;
  width:6px;height:6px;
  background:var(--about-accent);
  border-radius:50%;
  opacity:.55;
}
body.dark .about-page .about-contacts li::before{opacity:.75;}
.about-page .about-contacts a{
  background:rgba(225,48,108,.14) !important;
  padding:.28rem .55rem .32rem !important;
  border-radius:6px !important;
  font-size:.72rem !important;
  letter-spacing:.3px;
  line-height:1;
  display:inline-block;
  text-decoration:none;
  color:var(--about-accent);
  transition:background .2s,color .2s;
}
body.dark .about-page .about-contacts a{
  background:rgba(225,48,108,.30) !important;
  color:#ff8fb7 !important;
}
.about-page .about-contacts a:hover{
  background:var(--about-accent) !important;
  color:#fff !important;
}

/* 頁面頂部與 Hero 間距（讓標題/日期與內容拉開） */
.about-page{
  padding-top:1.2rem !important;
}

/* 通用段落標題間距（縮短段落間空白） */
.about-page h3{
  margin:1.9rem 0 .55rem !important;
}

/* 列表與下一標題之間距離更緊湊 */
.about-page h3 + ul{
  margin:.15rem 0 .2rem !important;
}
.about-page h3 + ul li{
  padding:.4rem 0 .4rem 1.15rem !important;
}

/* 聯絡方式區塊頂部再收斂 */
.about-page h3:has(+ .about-contacts){
  margin-top:1.6rem !important;
}
.about-page .about-contacts{
  margin:.2rem 0 0 !important;
}

/* === 統一：設備與聯絡方式列表風格覆寫 (雙語同步使用) === */
.about-page{
  --about-list-font:.9rem;
  --about-list-gap:.42rem;
  --about-bullet-size:6px;
  --about-link-pill:0; /* 若需 pill 樣式改成 1 */
}

/* 所有 h3 後的列表與聯絡方式統一基底 */
.about-page h3 + ul,
.about-page .about-contacts{
  list-style:none !important;
  margin:.35rem 0 .3rem !important;
  padding:0 !important;
  display:block !important;
}

.about-page h3 + ul li,
.about-page .about-contacts li{
  position:relative;
  padding:var(--about-list-gap) 0 var(--about-list-gap) 1.1rem !important;
  margin:0 !important;
  font-size:var(--about-list-font);
  line-height:1.45;
}

.about-page h3 + ul li::before,
.about-page .about-contacts li::before{
  content:"";
  position:absolute;
  left:0;top:.95rem;
  width:var(--about-bullet-size);
  height:var(--about-bullet-size);
  background:var(--about-accent);
  border-radius:50%;
  opacity:.55;
}
body.dark .about-page h3 + ul li::before,
body.dark .about-page .about-contacts li::before{
  opacity:.75;
}

/* 連結標準化 */
.about-page .about-contacts a,
.about-page h3 + ul li a{
  color:var(--about-accent);
  font-weight:600;
  text-decoration:none;
  position:relative;
  padding:.05rem .1rem;
  border-radius:4px;
  transition:color .18s,background-color .18s;
}

/* 非 pill 模式（預設）下 hover 只改顏色或輕底色 */
.about-page .about-contacts a:hover,
.about-page h3 + ul li a:hover{
  text-decoration:underline;
}

/* 可選 pill 模式：將 --about-link-pill 設 1 啟用 */
.about-page[style*="--about-link-pill:1"] .about-contacts a,
.about-page[style*="--about-link-pill:1"] h3 + ul li a{
  padding:.38rem .65rem;
  background:rgba(225,48,108,.12);
  text-decoration:none;
  border-radius:8px;
  font-size:.68rem;
  letter-spacing:.4px;
  line-height:1;
}
body.dark .about-page[style*="--about-link-pill:1"] .about-contacts a,
body.dark .about-page[style*="--about-link-pill:1"] h3 + ul li a{
  background:rgba(225,48,108,.28);
  color:#ff8fb7;
}
.about-page[style*="--about-link-pill:1"] .about-contacts a:hover,
.about-page[style*="--about-link-pill:1"] h3 + ul li a:hover{
  background:var(--about-accent);
  color:#fff;
  text-decoration:none;
}

/* 移除舊聯絡方式覆寫殘留（若之前存在） */
.about-page .about-contacts li::after{content:none!important;}

/* 行動裝置微調 */
@media (max-width:640px){
  .about-page h3 + ul li,
  .about-page .about-contacts li{
    padding:.38rem 0 .38rem 1rem !important;
  }
  .about-page h3 + ul li::before,
  .about-page .about-contacts li::before{
    top:.85rem;
  }
}

/* === 標題特效：左側紅線 + 底部粉色短線 === */
.about-page h3{
  background:none!important;
  border-radius:0!important;
  position:relative;
}
.about-page h3::before{
  width:3px!important; /* 保持左側實心紅線 */
}
.about-page h3::after{
  content:"";
  position:absolute;
  left:.75rem;
  bottom:-2px;
  width:64px;
  height:2px;
  background:var(--about-accent);
  border-radius:2px;
  opacity:.82;
}

/* === Hero 內可點擊連結專屬樣式（與一般 strong 區分） === */
/* 變更：使用較顯眼的藍色系，與一般粉色 accent 做區隔 */
.about-page .about-hero a{
  --hero-link-accent:#1d6fff;
  position:relative;
  display:inline-block;
  padding:.16rem .55rem .20rem;
  margin:.08rem .18rem .08rem 0;
  color:#0b3d91; /* 深藍文字 */
  background:rgba(29,111,255,.08); /* 淡藍底 */
  border-radius:9px;
  font-weight:600;
  text-decoration:none;
  line-height:1.18;
  vertical-align:baseline;
  border:1px solid rgba(29,111,255,.20);
  transition:background .22s,color .22s,box-shadow .22s,border-color .22s,transform .08s;
}
body.dark .about-page .about-hero a{
  color:#9fd1ff;
  background:rgba(29,111,255,.12);
  border-color:rgba(29,111,255,.28);
}
.about-page .about-hero a:hover,
.about-page .about-hero a:focus-visible{
  background:var(--hero-link-accent);
  color:#fff;
  border-color:var(--hero-link-accent);
  box-shadow:0 0 0 4px rgba(29,111,255,.12);
  text-decoration:none;
  transform:translateY(-1px);
}
body.dark .about-page .about-hero a:hover,
body.dark .about-page .about-hero a:focus-visible{
  box-shadow:0 0 0 4px rgba(29,111,255,.18);
}
.about-page .about-hero a:active{
  transform:translateY(0);
}

/* 連結內的 strong 去除原高亮，僅繼承顏色 */
.about-page .about-hero a strong{
  background:none!important;
  padding:0!important;
  margin:0!important;
  border-radius:0!important;
  color:inherit!important;
  line-height:inherit!important;
}

/* 行動版微調間距 */
@media (max-width:640px){
  .about-page .about-hero a{padding:.14rem .5rem .18rem;margin:.06rem .15rem .06rem 0;}
}

/* === 重構寵物 Tooltip（由 ::after 改成內嵌元素 .pet-tip） === */
.about-page .pet-info{
  position:relative;
  cursor:help;
  display:inline-block;
  line-height:1;
}
.about-page .pet-info > strong{
  /* 名稱 pill 樣式（與 hero 連結一致風格藍色系） */
  --pet-pill:#1d6fff;
  display:inline-block;
  background:rgba(29,111,255,.10);
  color:#0b3d91;
  padding:.28rem .65rem .34rem;
  margin:.08rem .28rem .08rem 0;
  font-weight:600;
  font-size:.78rem;
  line-height:1.05;
  border:1px solid rgba(29,111,255,.28);
  border-radius:11px;
  text-decoration:none;
  transition:background .22s,color .22s,border-color .22s,box-shadow .22s,transform .18s;
}
body.dark .about-page .pet-info > strong{
  background:rgba(29,111,255,.18);
  color:#9fd1ff;
  border-color:rgba(29,111,255,.38);
}
.about-page .pet-info:hover > strong,
.about-page .pet-info:focus-visible > strong,
.about-page .pet-info.tip-open > strong{
  background:var(--pet-pill);
  color:#fff;
  border-color:var(--pet-pill);
  box-shadow:0 0 0 3px rgba(29,111,255,.20);
  transform:translateY(-2px);
}
body.dark .about-page .pet-info:hover > strong,
body.dark .about-page .pet-info:focus-visible > strong,
body.dark .about-page .pet-info.tip-open > strong{
  box-shadow:0 0 0 4px rgba(29,111,255,.28);
}

.about-page .pet-info .pet-tip{
  position:absolute;
  left:50%;
  top:100%;
  transform:translate(-50%,10px) scale(.94);
  transform-origin:top center;
  background:#fff;
  color:#222;
  border:1px solid rgba(0,0,0,.12);
  border-radius:12px;
  padding:.65rem .75rem .7rem;
  min-width:180px;
  max-width:240px;
  width:max-content;
  font-size:.7rem;
  line-height:1.35;
  letter-spacing:.35px;
  box-shadow:0 10px 30px -10px rgba(0,0,0,.35);
  opacity:0;
  pointer-events:none;
  transition:opacity .22s,transform .22s;
  backdrop-filter:blur(8px);
  text-align:left;
  z-index:30;
  white-space:normal;
}
body.dark .about-page .pet-info .pet-tip{
  background:rgba(38,38,42,.92);
  color:#eee;
  border-color:rgba(255,255,255,.18);
  box-shadow:0 12px 34px -12px rgba(0,0,0,.65);
}

.about-page .pet-info:hover .pet-tip,
.about-page .pet-info:focus-visible .pet-tip,
.about-page .pet-info.tip-open .pet-tip{
  opacity:1;
  transform:translate(-50%,6px) scale(1);
  pointer-events:auto;
}

.about-page .pet-info .pet-tip .tip-title{
  font-weight:600;
  margin:0 0 .3rem;
  font-size:.72rem;
  letter-spacing:.4px;
  color:#c81352;
}
body.dark .about-page .pet-info .pet-tip .tip-title{color:#ff7faa;}
.about-page .pet-info .pet-tip .tip-line{
  margin:.18rem 0;
  display:block;
}
.about-page .pet-info .pet-tip a{
  color:#1d6fff;
  font-weight:600;
  text-decoration:underline;
  border-bottom:none!important; /* 移除原本 dotted 底線樣式 */
  padding-bottom:0!important;
  background:none!important;
  box-shadow:none!important;
  transition:color .16s ease-in-out;
}
.about-page .pet-info .pet-tip a:hover,
.about-page .pet_info .pet-tip a:focus{
  color:#0b3dff;
  text-decoration:underline;
  box-shadow:none;
}
body.dark .about-page .pet_info .pet-tip a{
  color:#7fc8ff;
}
body.dark .about-page .pet-info .pet-tip a:hover,
body.dark .about-page .pet_info .pet-tip a:focus{
  color:#bfe9ff;
  text-decoration:underline;
}

/* 移除舊 ::after 方案（若殘留） */
.about-page .pet-info::after{content:none!important;}

/* 行動調整 */
@media (max-width:640px){
  .about-page .pet-info > strong{
    padding:.26rem .6rem .32rem;
    font-size:.75rem;
    margin:.06rem .22rem .06rem 0;
  }
  .about-page .pet_info .pet-tip{
    font-size:.66rem;
    max-width:200px;
  }
}

/* 動畫偏好 */
@media (prefers-reduced-motion:reduce){
  .about-page .pet-info > strong,
  .about-page .pet-info .pet-tip{transition:none!important;transform:none!important;}
}

/* === 藍色高亮（與粉色 strong 同造型，只換色） === */
.about-page .about-hero .blue-highlight,
.about-page .about-hero a.blue-highlight,
.about-page .about-hero .blue-highlight strong{
  background:linear-gradient(to top,rgba(29,111,255,.32),rgba(29,111,255,0) 65%)!important;
  color:#1d6fff!important;
  padding:.18rem .55rem .22rem!important;
  margin:.12rem .25rem .12rem 0!important;
  border-radius:999px!important;
  line-height:1.15;
  letter-spacing:.3px;
  display:inline-block;
  font-weight:600;
  text-decoration:none;
  position:relative;
  transition:color .25s,background .25s,box-shadow .25s;
}
body.dark .about-page .about-hero .blue-highlight,
body.dark .about-page .about-hero a.blue-highlight,
body.dark .about-page .about-hero .blue-highlight strong{
  background:linear-gradient(to top,rgba(29,111,255,.45),rgba(29,111,255,0) 65%)!important;
  color:#79b6ff!important;
}
.about-page .about-hero a.blue-highlight:hover{
  box-shadow:0 0 0 2px rgba(29,111,255,.25);
  text-decoration:none;
}

/* 移除先前 hero a 藍色膠囊按鈕樣式（若存在） */
.about-page .about-hero a{
  background:none;
  border:none;
  padding:0;
  margin:0;
  box-shadow:none;
  color:var(--about-accent);
  display:inline;
}
.about-page .about-hero a:hover{text-decoration:underline;}
/* 只對標記為 blue-highlight 的連結再套上藍色造型 */
.about-page .about-hero a.blue-highlight{padding:0!important;margin:.12rem .25rem .12rem 0!important;}

/* 寵物名稱：撤銷 pill，改用藍色高亮；保留 tooltip 內容容器 */
.about-page .pet-info > strong{
  background:none!important;
  padding:0!important;
  margin:0!important;
  border:none!important;
}
.about-page .pet-info > strong.blue-highlight{ /* 由 blue-highlight 控制外觀 */ }

/* Tooltip 位置微調因為膠囊高度稍降 */
.about-page .pet-info .pet-tip{top:100%;}

/* 若有舊的 pet-info pill 陰影/邊框移除 */
.about-page .pet-info,
.about-page .pet-info > strong{
  box-shadow:none!important;
}

/* === 修正：寵物名稱字體與一般文字一致，並確保藍色高亮套用 === */
.about-page .pet-info > strong{
  font-size:inherit!important;
}

/* === 修正：若有舊 pill 間距殘留，統一為與一般 strong 一致 === */
.about-page .pet-info > strong.blue-highlight{
  margin:.12rem .25rem .12rem 0!important;
  padding:.18rem .55rem .22rem!important;
  line-height:1.25!important;
}

/* === Tooltip 命名靈感連結全新簡潔特效 (與其他可點擊樣式區隔) === */
.about-page .pet-info .pet-tip a.pet-origin {
  all:unset;
  cursor:pointer;
  font-weight:700;
  color:#1d6fff;
  font-size:.78rem;
  line-height:1.18;
  text-decoration:none;
  border-radius:0;
  transition:color .16s;
  display:inline;
}
.about-page .pet-info .pet-tip a.pet-origin:hover,
.about-page .pet-info .pet-tip a.pet-origin:focus-visible {
  color:#0b3dff;
  text-decoration:underline;
}
body.dark .about-page .pet-info .pet-tip a.pet-origin {
  color:#7fc8ff;
}
body.dark .about-page .pet-info .pet-tip a.pet-origin:hover,
body.dark .about-page .pet_info .pet-tip a.pet-origin:focus-visible {
  color:#bfe9ff;
  text-decoration:underline;
}
.about-page .pet-info .pet-tip a.pet-origin strong {
  background:none!important;
  padding:0!important;
  margin:0!important;
  color:inherit!important;
  font-weight:700;
}

/* === 新增：About 模態框樣式（精簡版） === */
.about-modal-backdrop{
  position:fixed;inset:0;
  background:rgba(0,0,0,.75);
  backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  padding:1.5rem;
  z-index:9999;
  opacity:0;visibility:hidden;
  transition:opacity .25s,visibility .25s;
}
.about-modal-backdrop.active{opacity:1;visibility:visible;}
.about-modal{
  background:#fff;
  color:#222;
  width:100%;max-width:560px;
  border-radius:18px;
  padding:1.6rem 1.55rem 1.9rem;
  position:relative;
  box-shadow:0 25px 55px -15px rgba(0,0,0,.55);
  transform:translateY(12px);
  transition:transform .28s;
  max-height:85vh;overflow-y:auto;
  font-size:.9rem;line-height:1.65;
}
.about-modal-backdrop.active .about-modal{transform:translateY(0);}
body.dark .about-modal{
  background:#26272c;
  color:#ddd;
  box-shadow:0 30px 65px -18px rgba(0,0,0,.75);
}
.about-modal h4{
  margin:0 0 .55rem;
  font-size:1.15rem;
  font-weight:700;
  color:var(--about-accent);
  letter-spacing:.5px;
}
body.dark .about-modal h4{color:#ff8fb7;}
.about-modal .am-sub{
  font-size:.7rem;
  opacity:.65;
  letter-spacing:.6px;
  margin:-.25rem 0 1.1rem;
  font-weight:600;
}
.about-modal-close{
  position:absolute;
  top:.8rem;right:.8rem;
  width:34px;height:34px;
  border:none;
  border-radius:50%;
  background:rgba(0,0,0,.06);
  cursor:pointer;
  font-size:1.05rem;
  display:flex;align-items:center;justify-content:center;
  transition:background .22s,transform .22s;
}
.about-modal-close:hover{background:rgba(0,0,0,.15);transform:rotate(8deg);}
body.dark .about-modal-close{background:rgba(255,255,255,.12);color:#ddd;}
body.dark .about-modal-close:hover{background:rgba(255,255,255,.22);}

.about-modal a{
  color:var(--about-accent);
  font-weight:700;
  text-decoration:none;
  border-bottom:2px solid var(--about-accent);
  padding-bottom:1px;
  transition:color .2s,background .2s,border-color .2s;
}
.about-modal a:hover{
  background:var(--about-accent);
  color:#fff;
  border-color:transparent;
}

.about-inline-link{
  font-weight:700;
  color:var(--about-accent);
  text-decoration:none;
  position:relative;
  display:inline-block;
  padding:.08rem .4rem .12rem;
  background:rgba(225,48,108,.12);
  border-radius:8px;
  line-height:1.15;
  margin:.05rem .35rem .05rem 0;
  transition:background .22s,color .22s;
}
body.dark .about-inline-link{background:rgba(225,48,108,.28);color:#ff8fb7;}
.about-inline-link:hover{
  background:var(--about-accent);
  color:#fff;
  text-decoration:none;
}

.about-modal .am-section{margin:0 0 1.05rem;}
.about-modal .am-section:last-child{margin-bottom:.3rem;}
.about-modal .am-tagline{
  font-size:.68rem;
  letter-spacing:.5px;
  text-transform:uppercase;
  opacity:.55;
  font-weight:600;
  margin:.2rem 0 .6rem;
}

/* 覆寫：統一所有可點擊的高亮為藍色樣式 */
.about-page .blue-highlight,
.about-page a.blue-highlight,
.about-inline-link,
.about-page .about-hero a.about-inline-link,
.about-modal a,
.about-modal .about-inline-link {
  background:linear-gradient(to top,rgba(29,111,255,.32),rgba(29,111,255,0) 65%)!important;
  color:#1d6fff!important;
  padding:.18rem .55rem .22rem!important;
  margin:.12rem .25rem .12rem 0!important;
  border-radius:999px!important;
  line-height:1.15!important;
  letter-spacing:.3px;
  display:inline-block;
  font-weight:600;
  text-decoration:none;
  position:relative;
  transition:color .25s,background .25s,box-shadow .25s,transform .15s;
  border:none!important;
}
body.dark .about-page .blue-highlight,
body.dark .about-page a.blue-highlight,
body.dark .about-inline-link,
body.dark .about-modal a,
body.dark .about-modal .about-inline-link {
  background:linear-gradient(to top,rgba(29,111,255,.48),rgba(29,111,255,0) 65%)!important;
  color:#8bc4ff!important;
}

.about-page .blue-highlight:hover,
.about-page a.blue-highlight:hover,
.about-inline-link:hover,
.about-modal a:hover,
.about-modal .about-inline-link:hover {
  background:#1d6fff!important;
  color:#fff!important;
  text-decoration:none!important;
  box-shadow:0 0 0 3px rgba(29,111,255,.25);
  transform:translateY(-1px);
}
body.dark .about-page .blue-highlight:hover,
body.dark .about-inline-link:hover,
body.dark .about-modal a:hover {
  box-shadow:0 0 0 3px rgba(29,111,255,.35);
}

.about-modal a { border-bottom:none!important; padding-bottom:.22rem!important; }

/* 內文普通超連結仍保留粉色主題（若要全部改藍，可再覆寫） */

/* === Hero 可點擊高亮調整：與 strong 同形狀（4px），僅顏色改藍 === */
.about-page .about-hero a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.35),rgba(29,111,255,0) 65%)!important;
  color:#1d6fff!important;
  padding:0 .2rem!important;
  margin:0 .15rem 0 0!important;
  border-radius:4px!important;          /* 由原膠囊改為 4px */
  line-height:1.25!important;
  letter-spacing:.25px!important;
  font-weight:600!important;
  box-shadow:none!important;
  transform:none!important;
  text-decoration:none!important;
}
body.dark .about-page .about-hero a.blue-highlight{
  background:linear-gradient(to top,rgba(29,111,255,.55),rgba(29,111,255,0) 65%)!important;
  color:#8bc4ff!important;
}
.about-page .about-hero a.blue-highlight:hover{
  background:linear-gradient(to top,rgba(29,111,255,.55),rgba(29,111,255,0) 65%)!important;
  color:#fff!important;
  border-radius:4px!important;
  box-shadow:none!important;
  transform:none!important;
  text-decoration:none!important;
}
/* Hero 外其他 .blue-highlight 保持既有膠囊樣式 */
</style>

<div class="about-page">
  <div class="about-hero">
    <p>嗨，我是 <strong>Zakk</strong>，在 <strong>澳大利亞</strong> 生活並就讀 <strong>Business</strong>。</p>
    <p>我養了兩隻 <strong>🐹 天竺鼠</strong>，
      <a href="#" class="blue-highlight" data-am-open="potato">馬鈴薯</a> 與
      <a href="#" class="blue-highlight" data-am-open="hash">薯餅</a>。
      我喜歡 <strong>遊戲</strong>、<strong>Linux</strong> 與 <strong>金融</strong>，也關注 Apple、Samsung、Google 生態；平常聽偏憂鬱氛圍音樂，偶爾 <strong>畫畫</strong> 與 <strong>設計</strong>。在
      <a class="blue-highlight" href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener"><strong>Instagram</strong></a>
      可以看到牠們的日常。</p>
    <p>我（Zakk）與女友 <a href="#" class="blue-highlight" data-am-open="couple">Paper</a> 目前遠距（澳洲 / 台灣），我們都是 <strong>pansexual 🩷💛🩵</strong>，每天分享生活、學習、工作、音樂與想法，價值觀與節奏高度契合，是彼此真正的 <strong>靈魂伴侶</strong>；我們都很喜歡睡覺、喜歡宅在家，也分享了許多相同的想法、過去的經歷與各種小眾興趣，最初是在 <a href="https://www.youtube.com/@xilanceylan" target="_blank" rel="noopener" class="blue-highlight">Ceylan</a> 的 Discord 社群認識 — <a href="/zh-hant/timeline/#couple" class="blue-highlight">在這裡可以看到我們在一起多久</a>。</p>
    <p style="margin-top:.8rem;font-size:.82rem;opacity:.75;">下面是我的主要裝備配置與聯絡方式，歡迎認識或交流。</p>
  </div>

### 💻 桌機
- 主機板：ASUS ROG STRIX X670E-A GAMING WIFI  
- 處理器：AMD Ryzen 9 7950X3D（16C/32T）  
- 顯示卡：NVIDIA GeForce RTX 4080 SUPER  
- 記憶體：64 GB DDR5 6400 MHz
- 網路：固定公网 IP（Aussie Telecom，1000/50 Mbps）  
- 路由器：BE9300 三頻 Wi-Fi 7  
- 螢幕：Samsung Odyssey G9 49"（5120×1440）透過 HDMI 2.1（Belkin 傳輸線）  
- 作業系統：Windows 11 Pro 64-bit + Gentoo Linux（KDE Plasma）

### 💼 筆電
- Apple MacBook Air M2（16GB / 512GB）  
- ASUS ROG Zephyrus G16 Air（Intel Core Ultra 9 185H・32GB LPDDR5X・1TB SSD・RTX 4060・Windows 11 Pro）  

### 📱 手機（部分已贈送給親友）
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

### 🔗 聯絡方式
<ul class="about-contacts">
  <li>Instagram：<a href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener">@zakk.au</a></li>
  <li>GitHub：<a href="https://github.com/Zakkaus" target="_blank" rel="noopener">Zakkaus</a></li>
  <li>X：<a href="https://x.com/zakkauu" target="_blank" rel="noopener">@zakkauu</a></li>
  <li>Email：<a href="mailto:admin@zakk.au">admin@zakk.au</a></li>
</ul>
</div>

<!-- === 新增：三個模態框容器（共用 Backdrop，多內容切換） === -->
<div class="about-modal-backdrop" id="aboutModalBackdrop">
  <div class="about-modal" role="dialog" aria-modal="true" aria-labelledby="aboutModalTitle">
    <button class="about-modal-close" type="button" aria-label="關閉" id="aboutModalClose">✕</button>
    <div id="aboutModalContent"><!-- 動態填入 --></div>
  </div>
</div>

<script>
/* 寵物 tooltip 點擊支援（行動裝置） */
(()=> {
  const pets=document.querySelectorAll('.about-page .pet-info');
  const closeAll=()=>pets.forEach(p=>p.classList.remove('tip-open'));
  pets.forEach(p=>{
    p.setAttribute('tabindex','0');
    p.addEventListener('click',e=>{
      e.stopPropagation();
      const on=p.classList.contains('tip-open');
      closeAll();
      if(!on) p.classList.add('tip-open');
    });
    p.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' ') {
        e.preventDefault();
        p.click();
      }
      if(e.key==='Escape'){closeAll();}
    });
  });
  document.addEventListener('click',closeAll);
})();

/* === 新增：About 模態框資料與邏輯 === */
(()=>{
  const data = {
    couple: {
      title: "我們的關係",
      sub: "自 2025/08/07 11:38 起",
      html: `
        <div class="am-section">
          <p>我 (Zakk) 與女朋友 (Paper) 分隔 <strong>澳洲 / 台灣</strong>，是遠距關係，我們都是 <strong>泛性戀 🩷💛🩵</strong>。</p>
        </div>
        <div class="am-section">
          <p>分享生活、學習、工作與靈感；價值觀節奏契合，是彼此的 <strong>靈魂伴侶</strong>。</p>
        </div>
        <div class="am-section">
          <p>最初在 <a href="https://www.youtube.com/@xilanceylan" target="_blank" rel="noopener" class="blue-highlight">錫蘭 Ceylan</a> Discord 認識；每隔幾個月見面；Paper 計畫高中畢業赴澳。</p>
        </div>
        <div class="am-section">
          <p>我們都很喜歡睡覺、喜歡宅在家，也分享了許多相同的想法、過去的經歷與各種小眾興趣。</p>
        </div>
        <div class="am-section">
          <p><a href="/zh-hant/timeline/#couple" class="blue-highlight">在這裡可以看到我們在一起的時間</a>｜Paper IG：
             <a href="https://www.instagram.com/abyss_74.50/" target="_blank" rel="noopener" class="blue-highlight">@abyss_74.50</a></p>
        </div>
      `
    },
    hash: {
      title: "薯餅 (Hash Brown)",
      sub: "生日：2025/06/24",
      html: `
        <div class="am-section">
          <p>薯餅是一隻 <strong>純種泰迪天竺鼠</strong>，毛色淺棕色（帶一點黃），個性活潑好動，常在籠子裡高速跑圈並把小屋推著走。</p>
        </div>
        <div class="am-section">
          <p>最愛 <strong>紅 / 綠甜椒、玉米鬚、胡蘿蔔</strong>。看到人或我打開冰箱時會發出 <strong>515151</strong> 的聲音討零食。牠是女生。</p>
        </div>
        <div class="am-section">
          <p>名字來源：取自麥當勞早餐 <a href="https://www.mcdonalds.com/tw/zh-tw/product/hash-browns.html" target="_blank" rel="noopener" class="blue-highlight">薯餅</a>，因為我們很喜歡那種香脆的口感。</p>
        </div>
        <div class="am-section">
          <p><a href="/zh-hant/timeline/#hash" class="blue-highlight">在這裡可以看到牠的天數</a>｜更多：
             <a href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener" class="blue-highlight">@zakk.au</a></p>
        </div>`
    },
    potato: {
      title: "馬鈴薯 (Potato)",
      sub: "生日：2025/07/27",
      html: `
        <div class="am-section">
          <p>馬鈴薯是 <strong>純種泰迪天竺鼠</strong>，毛色深棕色，勇敢又偏貪吃，常邊吃邊玩甚至「吃到一半順便排泄」。</p>
        </div>
        <div class="am-section">
          <p>喜歡 <strong>甜椒、玉米鬚、胡蘿蔔</strong>，常埋在草堆裡睡覺醒來續吃，是個樂天的小傢伙。牠是女生。</p>
        </div>
        <div class="am-section">
          <p><a href="/zh-hant/timeline/#potato" class="blue-highlight">在這裡可以看到牠的天數</a>，更多日常見 <a href="https://www.instagram.com/zakk.au/" target="_blank" rel="noopener" class="blue-highlight">@zakk.au</a>。</p>
        </div>`
    }
  };

  const backdrop = document.getElementById('aboutModalBackdrop');
  const contentWrap = document.getElementById('aboutModalContent');
  const closeBtn = document.getElementById('aboutModalClose');

  function openModal(key){
    const d = data[key];
    if(!d) return;
    contentWrap.innerHTML = `
      <h4 id="aboutModalTitle">${d.title}</h4>
      <div class="am-sub">${d.sub}</div>
      ${d.html}
    `;
    backdrop.classList.add('active');
    document.body.style.overflow='hidden';
  }
  function closeModal(){
    backdrop.classList.remove('active');
    document.body.style.overflow='';
  }

  document.querySelectorAll('[data-am-open]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      openModal(a.getAttribute('data-am-open'));
    });
  });
  backdrop.addEventListener('click',e=>{
    if(e.target===backdrop) closeModal();
  });
  closeBtn.addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && backdrop.classList.contains('active')) closeModal();
  });
})();
</script>