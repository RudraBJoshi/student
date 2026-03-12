/**
 * Camera — follows a target with optional bounds clamping
 */
export class Camera {
  /**
   * @param {number} viewW  - canvas/viewport width
   * @param {number} viewH  - canvas/viewport height
   */
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
    this.zoom = 1;

    // World bounds (null = infinite)
    this.boundsX = null;
    this.boundsY = null;
    this.boundsW = null;
    this.boundsH = null;

    // Lerp smoothing (0 = instant, 1 = never moves)
    this.lerpFactor = 0.1;

    this._targetX = 0;
    this._targetY = 0;
  }

  setBounds(x, y, w, h) {
    this.boundsX = x;
    this.boundsY = y;
    this.boundsW = w;
    this.boundsH = h;
  }

  follow(entity) {
    this._targetX = entity.x + entity.width  / 2 - this.viewW / 2 / this.zoom;
    this._targetY = entity.y + entity.height / 2 - this.viewH / 2 / this.zoom;
    this._clampTarget();
  }

  _clampTarget() {
    if (this.boundsW !== null) {
      const maxX = this.boundsX + this.boundsW - this.viewW / this.zoom;
      this._targetX = Math.max(this.boundsX, Math.min(maxX, this._targetX));
    }
    if (this.boundsH !== null) {
      const maxY = this.boundsY + this.boundsH - this.viewH / this.zoom;
      this._targetY = Math.max(this.boundsY, Math.min(maxY, this._targetY));
    }
  }

  update(dt) {
    const t = 1 - Math.pow(this.lerpFactor, dt * 60);
    this.x += (this._targetX - this.x) * t;
    this.y += (this._targetY - this.y) * t;
  }

  /** Apply the camera transform to a canvas context */
  begin(ctx) {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  end(ctx) {
    ctx.restore();
  }

  /** Convert screen coords to world coords */
  screenToWorld(sx, sy) {
    return {
      x: sx / this.zoom + this.x,
      y: sy / this.zoom + this.y,
    };
  }
}
