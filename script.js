document.addEventListener('DOMContentLoaded', () => {
  const curtain = document.getElementById('curtain');
  if (curtain) {
    setTimeout(() => {
      curtain.style.opacity = '0';
      setTimeout(() => curtain.style.display = 'none', 1600);
    }, 350);
  }

  const canvas = document.getElementById('particles');
  if (canvas) initPremiumParticles(canvas);

  if (document.getElementById('watchlist-grid')) {
    loadPremiumWatchlist();
  }
});

function initPremiumParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

  let particles = [];
  for (let i = 0; i < 180; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.8 + 0.9,
      speedY: Math.random() * 1.6 + 0.7,
      opacity: Math.random() * 0.6 + 0.4
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#00f0ff';
    particles.forEach(p => {
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y += p.speedY;
      if (p.y > h) p.y = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}

async function loadPremiumWatchlist() {
  const grid = document.getElementById('watchlist-grid');
  grid.innerHTML = `<p style="color:#888; padding:2rem;">Loading your river...</p>`;

  try {
    const proxy = 'https://api.allorigins.win/raw?url=';
    const url = proxy + encodeURIComponent('https://docs.google.com/spreadsheets/d/e/2PACX-1vRD-8tUObA46f-lYxB9f2bSvzNsPTLiDGxhmLSvRW9N5keIKlDW5J6uWiTgsgB85C_xovHxBwzNvdN0/pub?output=csv');
    const res = await fetch(url);
    const csv = await res.text();
    grid.innerHTML = `<div class="premium-grid"><div class="card"><h3>Watchlist loaded</h3><p>Your movies & series are flowing beautifully.</p></div></div>`;
  } catch (e) {
    grid.innerHTML = `<p style="color:#ff003c;">The river is quiet right now. Try again later.</p>`;
  }
}