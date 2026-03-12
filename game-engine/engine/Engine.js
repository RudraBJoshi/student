import { Input }        from './Input.js';
import { AssetLoader }  from './AssetLoader.js';
import { AudioManager } from './Audio.js';
import { Camera }       from './Camera.js';

/**
 * Engine — the core game loop and scene manager.
 *
 * Usage:
 *   const engine = new Engine({ canvas: document.getElementById('canvas') });
 *   engine.loadScene(new MyScene());
 *   engine.start();
 */
export class Engine {
  /**
   * @param {object} opts
   *   canvas   {HTMLCanvasElement}
   *   width    {number}  logical resolution width  (default: canvas.width)
   *   height   {number}  logical resolution height (default: canvas.height)
   *   maxDt    {number}  max delta time cap in seconds (default: 0.05)
   *   debug    {boolean} show debug overlay
   */
  constructor(opts = {}) {
    this.canvas = opts.canvas;
    this.ctx    = this.canvas.getContext('2d');
    this.width  = opts.width  || this.canvas.width;
    this.height = opts.height || this.canvas.height;
    this.maxDt  = opts.maxDt  ?? 0.05;
    this.debug  = opts.debug  ?? false;

    // Pixel-perfect scaling
    this.canvas.style.imageRendering = 'pixelated';
    this.ctx.imageSmoothingEnabled   = false;

    this.input  = new Input();
    this.assets = new AssetLoader();
    this.audio  = new AudioManager();

    this._scene       = null;
    this._nextScene   = null;
    this._running     = false;
    this._lastTime    = 0;
    this._rafId       = null;

    // FPS tracking
    this._fpsFrames = 0;
    this._fpsTimer  = 0;
    this._fps       = 0;

    this._boundLoop = this._loop.bind(this);

    // Handle canvas resize
    this._setupResize(opts);
  }

  _setupResize(opts) {
    if (!opts.responsive) return;
    const resize = () => {
      const ratio = this.width / this.height;
      const maxW  = window.innerWidth;
      const maxH  = window.innerHeight;
      let w = maxW, h = maxW / ratio;
      if (h > maxH) { h = maxH; w = maxH * ratio; }
      this.canvas.style.width  = `${w}px`;
      this.canvas.style.height = `${h}px`;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  /** Load and start a scene (immediately or next frame) */
  loadScene(scene) {
    this._nextScene = scene;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _loop(timestamp) {
    if (!this._running) return;

    let dt = (timestamp - this._lastTime) / 1000;
    this._lastTime = timestamp;
    dt = Math.min(dt, this.maxDt);

    // FPS counter
    this._fpsFrames++;
    this._fpsTimer += dt;
    if (this._fpsTimer >= 0.5) {
      this._fps = Math.round(this._fpsFrames / this._fpsTimer);
      this._fpsFrames = 0;
      this._fpsTimer  = 0;
    }

    // Transition scenes
    if (this._nextScene) {
      if (this._scene) this._scene.destroy();
      this._scene = this._nextScene;
      this._nextScene = null;
      this._scene.engine = this;
      this._scene.init(this);
    }

    // Update & draw current scene
    if (this._scene) {
      this._scene.update(dt, this.input);
      this._scene.draw(this.ctx);
    }

    // Snapshot input state AFTER the scene reads it so isPressed/isReleased
    // correctly compare this frame's keys against the previous frame's keys.
    this.input.update();

    // Debug overlay
    if (this.debug) this._drawDebug(dt);

    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  _drawDebug(dt) {
    const scene = this._scene;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(4, 4, 160, 52);
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '11px monospace';
    this.ctx.fillText(`FPS: ${this._fps}`, 8, 18);
    if (scene) {
      this.ctx.fillText(`Objects: ${scene.objectCount}`, 8, 32);
      const player = scene.findFirst('player');
      if (player) {
        this.ctx.fillText(`POS: ${Math.round(player.x)},${Math.round(player.y)}`, 8, 46);
      }
    }
    this.ctx.restore();
  }
}
