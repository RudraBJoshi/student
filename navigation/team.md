---
layout: default
title: Team
permalink: /team/
---

<style>
  .team-header {
    text-align: center;
    padding: 3rem 1rem 2rem;
  }
  .team-header h1 {
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 700;
    color: #00ff41;
    text-shadow: 0 0 16px rgba(0,255,65,.4);
    margin-bottom: .4rem;
  }
  .team-header p {
    opacity: .65;
    font-size: .95rem;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.4rem;
    margin: 2rem 0 3rem;
  }

  .member-card {
    background: rgba(0,10,0,.45);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0,255,65,.2);
    border-radius: 14px;
    padding: 1.6rem 1.2rem;
    text-align: center;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .7rem;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    cursor: pointer;
  }
  .member-card:hover {
    transform: translateY(-5px);
    border-color: rgba(0,255,65,.5);
    box-shadow: 0 10px 30px rgba(0,255,65,.12);
    text-decoration: none;
    color: inherit;
  }

  .member-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(0,255,65,.4);
  }
  .member-avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(0,255,65,.08);
    border: 2px solid rgba(0,255,65,.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: #00ff41;
  }

  .member-name {
    font-size: 1rem;
    font-weight: 600;
    color: #00ff41;
  }
  .member-role {
    font-size: .78rem;
    opacity: .6;
  }
  .member-link-label {
    font-size: .75rem;
    border: 1px solid rgba(0,255,65,.3);
    border-radius: 20px;
    padding: .2rem .7rem;
    margin-top: .2rem;
    opacity: .75;
    transition: opacity .2s;
  }
  .member-card:hover .member-link-label {
    opacity: 1;
  }
  .qr-wrap {
    margin-top: .8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .4rem;
  }
  .qr-wrap img {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 1px solid rgba(0,255,65,.25);
    image-rendering: pixelated;
  }
  .qr-label {
    font-size: .65rem;
    opacity: .5;
    text-transform: uppercase;
    letter-spacing: .05em;
  }
</style>

<div class="team-header">
  <img src="{{ site.baseurl }}/images/about/logo-transparent.png" alt="Malware Madness" style="max-width:280px;margin-bottom:1rem;">
  <h1>The Team</h1>
  <p>Click a card to visit their about me page.</p>
</div>

<div class="team-grid">

  <a class="member-card" href="{{ site.baseurl }}/">
    <div class="member-avatar-placeholder">RJ</div>
    <span class="member-name">Rudra Joshi</span>
    <span class="member-link-label">About Me →</span>
  </a>

  <a class="member-card" href="https://wick2009.github.io/student/aboutme/" target="_blank" rel="noopener">
    <div class="member-avatar-placeholder">SK</div>
    <span class="member-name">Sathwik Kintada</span>
    <span class="member-link-label">About Me →</span>
  </a>

  <a class="member-card" href="https://darshan528.github.io/student/about-me/" target="_blank" rel="noopener">
    <div class="member-avatar-placeholder">DS</div>
    <span class="member-name">Darshan Sivashankar</span>
    <span class="member-link-label">About Me →</span>
  </a>

</div>

<script>
(function () {
  document.querySelectorAll('a.member-card').forEach(card => {
    const url = card.href;
    if (!url || url.endsWith('#')) return;
    const wrap = document.createElement('div');
    wrap.className = 'qr-wrap';
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=00-0a-00&color=00-ff-41&format=png`;
    img.alt = 'QR code';
    img.loading = 'lazy';
    const lbl = document.createElement('span');
    lbl.className = 'qr-label';
    lbl.textContent = 'scan to visit';
    wrap.appendChild(img);
    wrap.appendChild(lbl);
    card.appendChild(wrap);
  });
})();
</script>
