---
layout: default
title: Welcome! My name is Rudra Joshi!
hide: true
permalink: /
---

<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet">

<style>
  * { font-family: 'Orbitron', monospace; }

  /* ── Hero ── */
  .hero {
    text-align: center;
    padding: 4rem 1rem 3rem;
  }
  .hero h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    margin-bottom: .5rem;
  }
  .typewriter-wrap {
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    min-height: 2em;
    color: #00ff41;
    font-family: monospace;
    display: inline-block;
    background: rgba(0,10,0,.45);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0,255,65,.3);
    border-radius: 999px;
    padding: .35rem 1.2rem;
    margin-top: .5rem;
  }
  #typed-cursor {
    display: inline-block;
    width: 2px;
    background: #00ff41;
    animation: blink .7s step-end infinite;
    margin-left: 2px;
    vertical-align: middle;
    height: 1.1em;
  }
  @keyframes blink { 50% { opacity: 0; } }

  /* ── Stats ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin: 2.5rem 0;
  }
  .stat-card {
    background: rgba(0,10,0,.45);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0,255,65,.2);
    border-radius: 12px;
    padding: 1.2rem 1rem;
    text-align: center;
    transition: transform .2s, box-shadow .2s;
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,255,65,.15);
  }
  .stat-num {
    font-size: 2rem;
    font-weight: 700;
    color: #00ff41;
    display: block;
  }
  .stat-label {
    font-size: .8rem;
    opacity: .7;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  /* ── Skills ── */
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 2.5rem 0 1rem;
    padding-bottom: .4rem;
    border-bottom: 2px solid rgba(0,255,65,.3);
  }
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem;
    margin-bottom: 1.5rem;
  }
  .skill-tag {
    background: rgba(0,10,0,.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0,255,65,.25);
    border-radius: 20px;
    padding: .35rem .9rem;
    font-size: .85rem;
    cursor: default;
    transition: background .2s, transform .15s;
  }
  .skill-tag:hover {
    background: rgba(0,255,65,.28);
    transform: translateY(-2px);
  }

  /* ── Project cards ── */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.2rem;
    margin-bottom: 2rem;
  }
  .proj-card {
    background: rgba(0,10,0,.45);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0,255,65,.15);
    border-radius: 12px;
    padding: 1.2rem 1.4rem;
    transition: transform .2s, border-color .2s, box-shadow .2s;
  }
  .proj-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0,255,65,.4);
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
  }
  .proj-card h3 {
    font-size: 1rem;
    margin: 0 0 .5rem;
    color: #00ff41;
  }
  .proj-card p {
    font-size: .85rem;
    opacity: .8;
    margin: 0 0 .8rem;
    line-height: 1.5;
  }
  .proj-tag {
    display: inline-block;
    background: rgba(0,255,65,.15);
    border-radius: 4px;
    padding: .15rem .5rem;
    font-size: .72rem;
    margin: .1rem .15rem 0 0;
    opacity: .85;
  }

  /* ── Contact ── */
  .contact-links {
    display: flex;
    flex-wrap: wrap;
    gap: .8rem;
    margin-top: 1rem;
  }
  .contact-btn {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .55rem 1.2rem;
    border-radius: 8px;
    border: 1px solid rgba(0,255,65,.35);
    background: rgba(0,10,0,.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(14px);
    color: inherit;
    text-decoration: none;
    font-size: .9rem;
    transition: background .2s, transform .15s;
  }
  .contact-btn:hover {
    background: rgba(0,255,65,.22);
    transform: translateY(-2px);
    text-decoration: none;
    color: inherit;
  }

  /* ── Scroll-reveal ── */
  .reveal {
    opacity: 0;
    transform: translateY(22px);
    transition: opacity .55s ease, transform .55s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: none;
  }
  /* ── Matrix canvas ── */
  #index-matrix {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    pointer-events: none;
  }
  html, body, .page-content, .page-content .wrapper, main {
    background: transparent !important;
  }
  body {
    background-color: #000 !important;
  }
  .hero, .stats-row, .skills-grid, .projects-grid,
  .section-title, .contact-links, p.reveal {
    position: relative;
    z-index: 1;
  }
</style>

<canvas id="index-matrix"></canvas>

<!-- ── HERO ── -->
<div class="hero">
  <div style="display:flex;justify-content:center;align-items:center;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap;">
    <img src="{{ site.baseurl }}/images/about/RJ.png" alt="RJ initials" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid rgba(0,255,65,.4);">
    <img src="{{ site.baseurl }}/images/about/Portrait.png" alt="Rudra Joshi" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid rgba(0,255,65,.4);">
  </div>
  <h1>Hi, I'm Rudra Joshi</h1>
  <div class="typewriter-wrap">
    <span id="typed-text"></span><span id="typed-cursor"></span>
  </div>
</div>

<!-- ── STATS ── -->
<div class="stats-row reveal">
  <div class="stat-card">
    <span class="stat-num" data-target="5">0</span>
    <span class="stat-label">Programming Languages</span>
  </div>
  <div class="stat-card">
    <span class="stat-num" style="font-size:1.3rem;">Python</span>
    <span class="stat-label">Preferred Language</span>
  </div>
  <div class="stat-card">
    <span class="stat-num" data-target="3">0</span>
    <span class="stat-label">Notable Projects</span>
  </div>
  <div class="stat-card">
    <span class="stat-num" data-target="4">0</span>
    <span class="stat-label">Years Coding</span>
  </div>
</div>

<!-- ── ABOUT ── -->
<p class="reveal">
  10th grader (Class of 2028) at <strong>Del Norte High School</strong> in San Diego, CA.
  Self-taught software developer with a passion for machine learning, web development,
  and scientific computing. Always looking for new opportunities to grow and collaborate.
</p>

<!-- ── SKILLS ── -->
<div class="section-title reveal">Tech Stack</div>
<div class="skills-grid reveal">
  <span class="skill-tag">Python</span>
  <span class="skill-tag">JavaScript</span>
  <span class="skill-tag">SQL</span>
  <span class="skill-tag">Jekyll</span>
  <span class="skill-tag">Machine Learning</span>
  <span class="skill-tag">Neural Networks</span>
  <span class="skill-tag">OpenMC</span>
  <span class="skill-tag">Linux / OS Hardening</span>
  <span class="skill-tag">GitHub Pages</span>
  <span class="skill-tag">HTML / CSS</span>
</div>

<!-- ── PROJECTS ── -->
<div class="section-title reveal">Notable Projects</div>
<div class="projects-grid reveal">
  <div class="proj-card">
    <h3>Digit Recognition CNN</h3>
    <p>Convolutional Neural Network trained to classify handwritten digits with high accuracy.</p>
    <span class="proj-tag">Python</span>
    <span class="proj-tag">Deep Learning</span>
    <span class="proj-tag">CNN</span>
  </div>
  <div class="proj-card">
    <h3>Particle Transport Simulation</h3>
    <p>OpenMC simulation modeling radiation shielding via Monte Carlo particle transport.</p>
    <span class="proj-tag">OpenMC</span>
    <span class="proj-tag">Python</span>
    <span class="proj-tag">Physics</span>
  </div>
  <div class="proj-card">
    <h3>Personal Dev Portfolio</h3>
    <p>This site — built with Jekyll, hosted on GitHub Pages, with custom layouts and dark theming.</p>
    <span class="proj-tag">Jekyll</span>
    <span class="proj-tag">GitHub Pages</span>
    <span class="proj-tag">HTML/CSS/JS</span>
  </div>
</div>

<!-- ── CONTACT ── -->
<div class="section-title reveal">Contact</div>
<div class="contact-links reveal">
  <a class="contact-btn" href="mailto:Rudraj2022@gmail.com">&#9993; Email</a>
  <a class="contact-btn" href="https://www.linkedin.com/in/rudra-joshi-a328803a9/" target="_blank" rel="noopener">in LinkedIn</a>
  <a class="contact-btn" href="https://github.com/RudraBJoshi" target="_blank" rel="noopener">&#9095; GitHub</a>
</div>

<script>
// ── Matrix rain ──
(function () {
  const canvas = document.getElementById('index-matrix');
  const ctx = canvas.getContext('2d');
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  const FS = 15;
  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / FS);
    drops = Array.from({ length: cols }, () => Math.random() * -80);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < cols; i++) {
      const bright = Math.random() > 0.97;
      ctx.fillStyle = bright ? '#ffffff' : (Math.random() > 0.5 ? '#00ff41' : '#00cc33');
      ctx.font = FS + 'px monospace';
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, drops[i] * FS);
      if (drops[i] * FS > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 45);
})();

// ── Typewriter ──
(function () {
  const roles = [
    'High School Software Developer',
    'ML Enthusiast',
    'Independent Researcher',
    'Space Fan',
    'Cybersecurity Fanatic',
    'Aerospace Student',
  ];
  const el = document.getElementById('typed-text');
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const word = roles[ri];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    let delay = deleting ? 55 : 95;
    if (!deleting && ci > word.length)  { delay = 1600; deleting = true; }
    else if (deleting && ci < 0)        { deleting = false; ci = 0; ri = (ri + 1) % roles.length; delay = 350; }
    setTimeout(tick, delay);
  }
  tick();
})();

// ── Animated counters ──
(function () {
  function animateCounter(el) {
    const target = +el.dataset.target;
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(t * target);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-target]').forEach(animateCounter);
      io.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stats-row').forEach(el => io.observe(el));
})();

// ── Scroll reveal ──
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ── Mouse glow spotlight ──
(function () {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:0;
    width:380px;height:380px;border-radius:50%;
    background:radial-gradient(circle, rgba(0,255,65,0.07) 0%, transparent 70%);
    transform:translate(-50%,-50%);
    transition:opacity .3s;
    top:0;left:0;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', () => glow.style.opacity = '0');
  document.addEventListener('mouseenter', () => glow.style.opacity = '1');
})();

// ── Click ripple ──
(function () {
  document.addEventListener('click', e => {
    const r = document.createElement('span');
    r.style.cssText = `
      position:absolute;pointer-events:none;z-index:9999;
      border-radius:50%;
      width:6px;height:6px;
      left:${e.pageX}px;top:${e.pageY}px;
      transform:translate(-50%,-50%) scale(1);
      background:rgba(0,255,65,0.6);
      box-shadow:0 0 12px 4px rgba(0,255,65,0.4);
      animation:ripple-out .6s ease-out forwards;
    `;
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
  const s = document.createElement('style');
  s.textContent = `@keyframes ripple-out {
    to { transform:translate(-50%,-50%) scale(22); opacity:0; }
  }`;
  document.head.appendChild(s);
})();

// ── Card magnetic tilt ──
(function () {
  document.querySelectorAll('.stat-card, .proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      card.style.boxShadow = `${-x*12}px ${-y*12}px 28px rgba(0,255,65,0.15)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
})();
</script>
