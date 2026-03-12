---
layout: default
title: 2D Platformer Engine
permalink: /render
---

<style>
  .engine-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin: 20px 0;
  }

  .engine-frame {
    position: relative;
    display: inline-block;
    border: 2px solid #1e3a5f;
    box-shadow: 0 0 30px rgba(74,158,255,0.2);
    background: #0d1b2a;
  }

  #game-canvas {
    display: block;
    width: 720px;
    height: 480px;
    max-width: 100%;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  #game-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d1b2a;
    color: #4a9eff;
    font-family: monospace;
    font-size: 1rem;
    letter-spacing: 2px;
    pointer-events: none;
  }

  .engine-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    font-family: monospace;
    font-size: 0.75rem;
    color: #556677;
  }

  .engine-controls span {
    background: #111;
    border: 1px solid #223;
    padding: 3px 10px;
    border-radius: 3px;
  }

  .engine-controls kbd {
    color: #4a9eff;
  }

  .engine-title {
    font-family: monospace;
    font-size: 0.8rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #4a9eff;
    text-align: center;
  }
</style>

<div class="engine-wrap">
  <p class="engine-title">2D Platformer Engine — Live Demo</p>

  <div class="engine-frame">
    <canvas id="game-canvas"></canvas>
    <div id="game-loading">LOADING…</div>
  </div>

  <div class="engine-controls">
    <span><kbd>← →</kbd> / <kbd>A D</kbd> Move</span>
    <span><kbd>↑</kbd> / <kbd>W</kbd> / <kbd>Space</kbd> Jump</span>
    <span><kbd>Shift</kbd> Dash</span>
    <span><kbd>Stomp</kbd> enemies from above</span>
    <span><kbd>R</kbd> Restart</span>
  </div>
</div>

<script type="module">
  import('{{ site.baseurl }}/game-engine/demo/game.js')
    .then(() => {
      const loading = document.getElementById('game-loading');
      if (loading) loading.style.display = 'none';
    })
    .catch(err => {
      const loading = document.getElementById('game-loading');
      if (loading) loading.textContent = 'Error: ' + err.message;
      console.error('[rendereng] Failed to load game engine:', err);
    });
</script>
