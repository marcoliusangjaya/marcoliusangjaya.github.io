/* ================================================================
   TOUCH DETECTION — disables cursor and canvas on touch devices
   ================================================================ */

const isTouch = window.matchMedia('(hover: none)').matches;

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */

if (!isTouch) {
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursor && cursorRing) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      setTimeout(() => {
        cursorRing.style.left = e.clientX + 'px';
        cursorRing.style.top  = e.clientY + 'px';
      }, 60);
    });
  }
}

/* ================================================================
   DOT GRID CANVAS (repels from mouse)
   ================================================================ */

if (!isTouch) {
  (function () {
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, mx = -999, my = -999, hasMouse = false;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      build();
    }

    document.addEventListener('mousemove',  e => { mx = e.clientX; my = e.clientY; hasMouse = true; });
    document.addEventListener('mouseleave', () => { hasMouse = false; });

    const COLS = 40, ROWS = 28;
    let dots = [];

    function build() {
      dots = [];
      const gx = W / COLS, gy = H / ROWS;
      for (let c = 0; c <= COLS; c++) {
        for (let r = 0; r <= ROWS; r++) {
          dots.push({
            bx: c * gx, by: r * gy,
            x:  c * gx, y:  r * gy,
            size:  Math.random() * .9 + .5,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const R = 150;
      for (const d of dots) {
        const dx   = mx - d.bx, dy = my - d.by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let tx = d.bx, ty = d.by;
        if (dist < R && hasMouse) {
          const f = (1 - dist / R) * 24;
          tx -= (dx / dist) * f;
          ty -= (dy / dist) * f;
        }
        d.x += (tx - d.x) * .13;
        d.y += (ty - d.y) * .13;
        const nearness = hasMouse
          ? Math.max(0, 1 - Math.sqrt((d.x - mx) ** 2 + (d.y - my) ** 2) / R)
          : 0;
        const alpha = .1 + Math.sin(t * .018 + d.phase) * .03 + nearness * .7;
        const size  = d.size + nearness * 3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${alpha})`;
        ctx.fill();
      }
      t++;
      requestAnimationFrame(draw);
    }
    draw();
  })();
}

/* ================================================================
   NAV AUTO-HIDE ON MOBILE SCROLL
   ================================================================ */

const navEl = document.querySelector('nav');
if (navEl) {
  window.addEventListener('scroll', () => {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    navEl.classList.toggle('nav-scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ================================================================
   HAMBURGER MENU
   ================================================================ */

const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && navEl) navEl.classList.remove('nav-scrolled');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ================================================================
   SCROLL REVEAL
   ================================================================ */

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ================================================================
   COUNTER ANIMATION (stats bar on index page)
   ================================================================ */

function animCount(el, target, suffix) {
  let start = null;
  const dur  = 1800;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target.querySelector('.stat-num');
      if (el && el.dataset.target) {
        animCount(el, +el.dataset.target, el.dataset.suffix || '');
        counterObs.unobserve(e.target);
      }
    }
  });
}, { threshold: .3 });
document.querySelectorAll('.stat').forEach(el => counterObs.observe(el));
