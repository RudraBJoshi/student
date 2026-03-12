import { Physics } from './Physics.js';

/**
 * Scene — container for GameObjects, a TileMap, Camera, and Physics.
 *
 * Lifecycle:
 *   scene.init()          called once by Engine
 *   scene.update(dt, input)
 *   scene.draw(ctx)
 *   scene.destroy()       called when switching scenes
 */
export class Scene {
  constructor() {
    this._objects = [];
    this._toAdd   = [];
    this._toRemove = new Set();

    this.tilemap  = null;
    this.camera   = null;
    this.physics  = new Physics();
    this.engine   = null; // set by Engine

    // Background color or null for transparent
    this.backgroundColor = '#1a1a2e';

    // Parallax background layers [{image, scrollFactorX, scrollFactorY, repeatX, repeatY}]
    this.bgLayers = [];
  }

  /** Override to set up scene content */
  init(engine) {}

  /** Override for scene-level teardown */
  destroy() {}

  add(obj) {
    obj._scene = this;
    this._toAdd.push(obj);
    return obj;
  }

  remove(obj) {
    this._toRemove.add(obj);
  }

  /** Get all objects with a given tag */
  findByTag(tag) {
    return this._objects.filter(o => o.tag === tag);
  }

  /** Get first object with tag */
  findFirst(tag) {
    return this._objects.find(o => o.tag === tag) || null;
  }

  update(dt, input) {
    // Flush adds
    for (const obj of this._toAdd) {
      this._objects.push(obj);
      obj.init(this);
    }
    this._toAdd.length = 0;

    // Update all active objects
    for (const obj of this._objects) {
      if (!obj.active) continue;

      // Physics step
      if (obj.physicsEnabled) {
        this.physics.step(obj, this.tilemap, dt);
      }

      obj.update(dt, input);
    }

    // Camera follow (if camera has a target)
    if (this.camera) {
      this.camera.update(dt);
    }

    // Flush removes
    for (const obj of this._toRemove) {
      obj.destroy();
      const idx = this._objects.indexOf(obj);
      if (idx !== -1) this._objects.splice(idx, 1);
    }
    this._toRemove.clear();
  }

  draw(ctx) {
    const cam = this.camera;

    // Clear background
    if (this.backgroundColor) {
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, cam ? cam.viewW : ctx.canvas.width, cam ? cam.viewH : ctx.canvas.height);
    }

    // Parallax background layers (drawn before camera transform)
    this._drawBgLayers(ctx);

    // Begin camera transform
    if (cam) cam.begin(ctx);

    // Draw tilemap
    if (this.tilemap && cam) {
      this.tilemap.draw(ctx, cam);
    } else if (this.tilemap) {
      this.tilemap.draw(ctx, { x: 0, y: 0, viewW: ctx.canvas.width, viewH: ctx.canvas.height, zoom: 1 });
    }

    // Sort by zIndex then draw
    const sorted = [...this._objects].sort((a, b) => a.zIndex - b.zIndex);
    for (const obj of sorted) {
      if (!obj.active) continue;
      obj.draw(ctx);
    }

    if (cam) cam.end(ctx);
  }

  _drawBgLayers(ctx) {
    if (!this.camera || this.bgLayers.length === 0) return;
    const cam = this.camera;

    for (const layer of this.bgLayers) {
      const offX = cam.x * (layer.scrollFactorX ?? 0.5);
      const offY = cam.y * (layer.scrollFactorY ?? 0.5);
      ctx.save();
      ctx.translate(-offX % (layer.image?.width || cam.viewW), -offY % (layer.image?.height || cam.viewH));

      if (layer.image) {
        const iw = layer.image.width;
        const ih = layer.image.height;
        const cols = layer.repeatX ? Math.ceil(cam.viewW / iw) + 2 : 1;
        const rows = layer.repeatY ? Math.ceil(cam.viewH / ih) + 2 : 1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.drawImage(layer.image, c * iw, r * ih);
          }
        }
      } else if (layer.color) {
        ctx.fillStyle = layer.color;
        ctx.fillRect(0, 0, cam.viewW + 100, cam.viewH + 100);
      }
      ctx.restore();
    }
  }

  get objectCount() { return this._objects.length; }
}
