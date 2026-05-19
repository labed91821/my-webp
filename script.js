/* ============================================================
   L4B3D — MASTER SCRIPT
   Particles · Cursor · Loader · Glitch · Modals · Sheets
   ============================================================ */

'use strict';

// ── CURSOR ────────────────────────────────────────────────────
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function tick() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll('a, button, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ── PAGE LOADER ───────────────────────────────────────────────
(function initLoader() {
  const loader = document.querySelector('.page-loader');
  const bar    = document.querySelector('.loader-bar');
  const curtT  = document.querySelector('.curtain-top');
  const curtB  = document.querySelector('.curtain-bottom');
  if (!loader) return;

  let progress = 0;
  const iv = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress >= 100) { progress = 100; clearInterval(iv); finish(); }
    if (bar) bar.style.width = Math.min(progress, 100) + '%';
  }, 120);

  function finish() {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.6s';
      setTimeout(() => {
        loader.classList.add('hidden');
        loader.style.display = 'none';
        if (curtT) curtT.classList.add('open');
        if (curtB) curtB.classList.add('open');
      }, 600);
    }, 300);
  }
})();

// ── NAV HAMBURGER ─────────────────────────────────────────────
(function initNav() {
  const burger = document.querySelector('.nav-hamburger');
  const menu   = document.querySelector('.mobile-menu');
  const closeLinks = document.querySelectorAll('.mobile-menu a');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
    const bars = burger.querySelectorAll('span');
    if (menu.classList.contains('open')) {
      bars[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  closeLinks.forEach(l => l.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }));
})();

// ── SCROLL REVEAL ─────────────────────────────────────────────
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ── PARTICLE CANVAS ───────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -1000, y: -1000 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const COLORS = ['rgba(0,255,231,', 'rgba(255,45,120,', 'rgba(168,85,247,'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.1);
      this.size   = Math.random() * 2 + 0.5;
      this.alpha  = Math.random() * 0.5 + 0.1;
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life   = 0;
      this.maxLife = Math.random() * 200 + 100;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        this.vx += dx / dist * 0.04;
        this.vy += dy / dist * 0.04;
      }

      if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > W + 10) this.reset();
    }
    draw() {
      const fade = this.life < 20 ? this.life / 20 : this.life > this.maxLife - 20 ? (this.maxLife - this.life) / 20 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * fade) + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  let lastTime = 0;
  function animate(ts) {
    if (ts - lastTime < 16) { requestAnimationFrame(animate); return; }
    lastTime = ts;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// ── GLITCH EFFECT ON DEMAND ───────────────────────────────────
function triggerGlitch(el, duration = 600) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = '';
}

// ── TABS ──────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const btns   = tabGroup.querySelectorAll('.tab-btn');
    const panels = tabGroup.parentElement.querySelectorAll('.tab-panel');

    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });
  });
}

// ── MODAL SYSTEM ─────────────────────────────────────────────
function initModals() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  window.openModal = function(data) {
    const modal = overlay.querySelector('.modal');

    // cover
    const cover = modal.querySelector('.modal-cover');
    const coverPh = modal.querySelector('.modal-cover-placeholder');
    if (data.img) {
      if (cover)   { cover.src = data.img; cover.style.display = 'block'; }
      if (coverPh) coverPh.style.display = 'none';
    } else {
      if (cover)   cover.style.display = 'none';
      if (coverPh) { coverPh.textContent = data.emoji || '🎵'; coverPh.style.display = 'flex'; }
    }

    // text
    const title  = modal.querySelector('.modal-title');
    const artist = modal.querySelector('.modal-artist');
    const quote  = modal.querySelector('.modal-quote');
    const stats  = modal.querySelector('.modal-stats-row');
    if (title)  title.textContent  = data.title  || '';
    if (artist) artist.textContent = data.artist || '';
    if (quote)  quote.innerHTML    = data.quote  ? `<p>${data.quote}</p>${data.quoteAuthor ? `<cite>— ${data.quoteAuthor}</cite>` : ''}` : '';
    if (stats && data.stats) {
      stats.innerHTML = data.stats.map(s => `<div class="modal-stat">${s.label}: <span>${s.val}</span></div>`).join('');
    }

    // extra content
    const extra = modal.querySelector('.modal-extra');
    if (extra) extra.innerHTML = data.extra || '';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  overlay.querySelector('.modal-close')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── GOOGLE SHEETS LOADER ──────────────────────────────────────
const SHEETS = {
  all:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRD-8tUObA46f-lYxB9f2bSvzNsPTLiDGxhmLSvRW9N5keIKlDW5J6uWiTgsgB85C_xovHxBwzNvdN0/pub?output=csv',
  fav:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRD-8tUObA46f-lYxB9f2bSvzNsPTLiDGxhmLSvRW9N5keIKlDW5J6uWiTgsgB85C_xovHxBwzNvdN0/pub?gid=1019836446&single=true&output=csv',
  y2025:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRD-8tUObA46f-lYxB9f2bSvzNsPTLiDGxhmLSvRW9N5keIKlDW5J6uWiTgsgB85C_xovHxBwzNvdN0/pub?gid=0&single=true&output=csv',
  y2026:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRD-8tUObA46f-lYxB9f2bSvzNsPTLiDGxhmLSvRW9N5keIKlDW5J6uWiTgsgB85C_xovHxBwzNvdN0/pub?gid=1710654212&single=true&output=csv'
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (let c of line) {
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    vals.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim(); });
    return row;
  }).filter(r => Object.values(r).some(v => v));
}

async function fetchSheet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sheet fetch failed');
  return parseCSV(await res.text());
}

function watchTypeIcon(type) {
  if (!type) return '🎬';
  const t = type.toLowerCase();
  if (t.includes('serie') || t.includes('tv') || t.includes('show')) return '📺';
  if (t.includes('anime')) return '⛩';
  if (t.includes('doc')) return '📽';
  return '🎬';
}

function renderWatchCard(item) {
  const title  = item['Title'] || item['title'] || item['Name'] || 'Untitled';
  const year   = item['Year'] || item['year'] || '';
  const type   = item['Type'] || item['type'] || item['Category'] || '';
  const rating = item['Rating'] || item['rating'] || item['Score'] || '';
  const poster = item['Poster'] || item['poster'] || item['Image'] || '';
  const isTV   = type.toLowerCase().includes('serie') || type.toLowerCase().includes('tv') || type.toLowerCase().includes('show') || type.toLowerCase().includes('anime');
  const stars  = parseFloat(rating) || 0;
  const starsHtml = stars ? '★'.repeat(Math.round(stars / 2)) + '☆'.repeat(5 - Math.round(stars / 2)) : '';

  return `
    <div class="watch-card reveal">
      <div class="watch-card-img">
        ${poster
          ? `<img src="${poster}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'watch-card-img-placeholder\\'>${watchTypeIcon(type)}</div>'">`
          : `<div class="watch-card-img-placeholder">${watchTypeIcon(type)}</div>`}
        <span class="watch-badge ${isTV ? 'watch-badge-tv' : 'watch-badge-movie'}">${type || (isTV ? 'Series' : 'Film')}</span>
      </div>
      <div class="watch-card-body">
        <div class="watch-card-title">${title}</div>
        <div class="watch-card-meta">${year}</div>
        ${starsHtml ? `<div class="watch-card-rating">${starsHtml} <span style="color:var(--text-dim)">${rating}/10</span></div>` : ''}
      </div>
    </div>`;
}

// ── ARCHIVE PAGE INIT ─────────────────────────────────────────
async function initArchive() {
  initModals();
  initTabs();

  // Spotify cards click
  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.modal;
      const d = SPOTIFY_DATA[key];
      if (d) openModal(d);
    });
  });

  // Watchlist
  const tabs = [
    { key: 'fav',   id: 'watch-fav' },
    { key: 'y2025', id: 'watch-2025' },
    { key: 'y2026', id: 'watch-2026' }
  ];

  for (const t of tabs) {
    const container = document.getElementById(t.id);
    if (!container) continue;
    try {
      const rows = await fetchSheet(SHEETS[t.key]);
      if (!rows.length) throw new Error('empty');
      container.innerHTML = `<div class="card-grid card-grid-3" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">${rows.map(renderWatchCard).join('')}</div>`;
      // re-observe reveals
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
        }, { threshold: 0.05 });
        io.observe(el);
      });
    } catch {
      container.innerHTML = `<p style="color:var(--text-dim);font-family:var(--font-mono);font-size:.8rem;padding:20px 0;">Could not load data — check your Google Sheet publishing settings.</p>`;
    }
  }
}

// ── LISTENING CLOCK CANVAS ────────────────────────────────────
function drawListeningClock(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2, cy = size / 2, r = size / 2 - 24;

  // Sample data: hours 0-23 with relative intensity
  const data = [0.1,0.05,0.02,0.01,0.02,0.05,0.15,0.3,0.45,0.5,0.55,0.6,0.7,0.65,0.6,0.55,0.7,0.9,1,0.95,0.85,0.7,0.5,0.3];

  ctx.clearRect(0,0,size,size);

  // Background ring
  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 20;
  ctx.stroke();

  data.forEach((val, i) => {
    const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const barLen = val * 36;
    const x1 = cx + (r - 10) * Math.cos(angle);
    const y1 = cy + (r - 10) * Math.sin(angle);
    const x2 = cx + (r - 10 + barLen) * Math.cos(angle);
    const y2 = cy + (r - 10 + barLen) * Math.sin(angle);

    const grad = ctx.createLinearGradient(x1,y1,x2,y2);
    const hue = (i / 24) * 60 + 200;
    grad.addColorStop(0, `hsla(${hue},100%,60%,0.3)`);
    grad.addColorStop(1, `hsla(${hue},100%,80%,0.9)`);

    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  });

  // Center text
  ctx.fillStyle = 'rgba(0,255,231,0.9)';
  ctx.font = `bold 22px 'Orbitron', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('24H', cx, cy - 10);
  ctx.font = `12px 'Space Mono', monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('ACTIVITY', cx, cy + 14);
}

// ── EMOTION BARS ──────────────────────────────────────────────
function initEmotionBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.emotion-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.w || '0%';
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.emotion-bar').forEach(el => {
    el.querySelectorAll('.emotion-bar-fill').forEach(bar => { bar.style.width = '0%'; });
    io.observe(el);
  });
}

// ── MINI AUDIO PLAYER ─────────────────────────────────────────
function initMiniPlayers() {
  document.querySelectorAll('.mini-player').forEach(player => {
    const btn  = player.querySelector('.mini-player-btn');
    const src  = player.dataset.src;
    if (!src || !btn) return;

    const audio = new Audio(src);
    audio.volume = 0.7;
    let playing = false;

    btn.addEventListener('click', () => {
      if (playing) { audio.pause(); btn.textContent = '▶'; btn.classList.remove('playing'); }
      else         { audio.play().catch(()=>{}); btn.textContent = '⏸'; btn.classList.add('playing'); }
      playing = !playing;
    });

    audio.addEventListener('ended', () => { playing = false; btn.textContent = '▶'; btn.classList.remove('playing'); });
  });
}

// ── RIVER PAGE: NOTES PARALLAX ────────────────────────────────
function initRiverParallax() {
  const notes = document.querySelectorAll('.river-note');
  if (!notes.length) return;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    notes.forEach((note, i) => {
      const factor = (i % 2 === 0) ? 0.03 : -0.03;
      note.style.transform = `translateX(${sy * factor}px)`;
    });
  });
}

// ── SCROLL PROGRESS BAR ───────────────────────────────────────
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:2px;width:0%;
    background:linear-gradient(90deg,var(--cyan),var(--purple),var(--pink));
    z-index:99999;transition:width 0.1s linear;
    box-shadow:0 0 8px var(--cyan);
  `;
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  });
})();

// ── ACTIVE NAV LINK ───────────────────────────────────────────
(function setActiveNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === current || (current === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

// ── SPOTLIGHT EFFECT ON HOVER ─────────────────────────────────
(function initSpotlight() {
  document.querySelectorAll('.card, .spotify-card, .gateway-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

// ── SPOTIFY DATA (example/placeholder) ───────────────────────
const SPOTIFY_DATA = {
  track1: {
    title: 'The Night We Met',
    artist: 'Lord Huron',
    img: 'assets/gallery/i3.jpg',
    emoji: '🎵',
    quote: 'I had all and then most of you, some and now none of you...',
    quoteAuthor: 'Lord Huron',
    stats: [
      { label: 'Streams', val: '1,247' },
      { label: 'Hours', val: '82.3h' },
      { label: 'Top Year', val: '2023' },
      { label: 'Rank', val: '#1 All Time' }
    ],
    extra: '<p style="color:var(--text-dim);font-family:var(--font-serif);font-style:italic;line-height:1.8">This track found you at 2AM more times than you can count. The one song that made loneliness feel like the only honest thing in the world.</p>'
  },
  track2: {
    title: 'Apocalypse',
    artist: 'Cigarettes After Sex',
    emoji: '🌙',
    quote: 'I love you more than I can say...',
    quoteAuthor: 'Cigarettes After Sex',
    stats: [
      { label: 'Streams', val: '934' },
      { label: 'Hours', val: '61.2h' },
      { label: 'Top Year', val: '2022' },
      { label: 'Rank', val: '#2 All Time' }
    ],
    extra: '<p style="color:var(--text-dim);font-family:var(--font-serif);font-style:italic;line-height:1.8">The soundtrack to every drive at dusk. Soft and devastating in equal measure.</p>'
  },
  track3: {
    title: 'When the Party\'s Over',
    artist: 'Billie Eilish',
    emoji: '🖤',
    quote: "Don't you know I'm no good for you?",
    quoteAuthor: 'Billie Eilish',
    stats: [
      { label: 'Streams', val: '811' },
      { label: 'Hours', val: '53.7h' },
      { label: 'Top Year', val: '2021' },
      { label: 'Rank', val: '#3 All Time' }
    ],
    extra: '<p style="color:var(--text-dim);font-family:var(--font-serif);font-style:italic;line-height:1.8">Four notes. Entire worlds destroyed.</p>'
  },
  track4: {
    title: 'Falling',
    artist: 'Harry Styles',
    emoji: '🌊',
    quote: "I'm in my bed and you're not here...",
    quoteAuthor: 'Harry Styles',
    stats: [
      { label: 'Streams', val: '703' },
      { label: 'Hours', val: '46.9h' },
      { label: 'Top Year', val: '2023' }
    ]
  },
  track5: {
    title: 'Motion Sickness',
    artist: 'Phoebe Bridgers',
    emoji: '🎸',
    quote: 'I hate you for what you did and I miss you like a little kid...',
    quoteAuthor: 'Phoebe Bridgers',
    stats: [
      { label: 'Streams', val: '688' },
      { label: 'Hours', val: '45.8h' },
      { label: 'Top Year', val: '2024' }
    ]
  },
  artist1: {
    title: 'Lord Huron',
    artist: 'Indie Folk / Dream Pop',
    emoji: '🏔',
    stats: [
      { label: 'Total Streams', val: '3,412' },
      { label: 'Listening Hours', val: '228h' },
      { label: 'Top Track', val: 'The Night We Met' }
    ],
    extra: '<p style="color:var(--text-dim);font-family:var(--font-serif);font-style:italic;line-height:1.8">Every album a ghost story. Every song a long night drive into somewhere unnamed.</p>'
  },
  artist2: {
    title: 'Cigarettes After Sex',
    artist: 'Ambient Pop / Dream Pop',
    emoji: '🌫',
    stats: [
      { label: 'Total Streams', val: '2,890' },
      { label: 'Listening Hours', val: '193h' },
      { label: 'Top Track', val: 'Apocalypse' }
    ]
  },
  artist3: {
    title: 'Billie Eilish',
    artist: 'Alt Pop / Dark Pop',
    emoji: '🕷',
    stats: [
      { label: 'Total Streams', val: '2,544' },
      { label: 'Listening Hours', val: '169h' },
      { label: 'Top Track', val: 'When the Party\'s Over' }
    ]
  },
  album1: {
    title: 'Strange Trails',
    artist: 'Lord Huron',
    emoji: '🌌',
    stats: [
      { label: 'Streams', val: '2,100+' },
      { label: 'Hours', val: '140h' },
      { label: 'Year', val: '2015' }
    ],
    extra: '<p style="color:var(--text-dim);font-family:var(--font-serif);font-style:italic;line-height:1.8">The album that rewired something. Perfect from first to last.</p>'
  },
  album2: {
    title: 'Cigarettes After Sex',
    artist: 'Cigarettes After Sex',
    emoji: '🌹',
    stats: [
      { label: 'Streams', val: '1,800+' },
      { label: 'Hours', val: '120h' },
      { label: 'Year', val: '2017' }
    ]
  },
  album3: {
    title: 'When We All Fall Asleep',
    artist: 'Billie Eilish',
    emoji: '😴',
    stats: [
      { label: 'Streams', val: '1,560' },
      { label: 'Hours', val: '104h' },
      { label: 'Year', val: '2019' }
    ]
  }
};

// ── INIT EVERYTHING ON DOM READY ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModals();
  initEmotionBars();
  initMiniPlayers();
  initRiverParallax();

  // Clock (archive page only)
  if (document.getElementById('listening-clock')) {
    drawListeningClock('listening-clock');
  }

  // Archive watchlist (archive page only)
  if (document.getElementById('watch-fav')) {
    initArchive();
  }

  // Spotify card modals (archive page)
  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.modal;
      if (SPOTIFY_DATA[key]) openModal(SPOTIFY_DATA[key]);
    });
    card.setAttribute('data-hover', '1');
  });
});
