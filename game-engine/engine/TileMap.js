/**
 * TileMap — grid-based level tile system
 *
 * Tile IDs:
 *   0 = empty (no collision)
 *   1+ = solid tiles (collision)
 *
 * Tiles can optionally have a sprite sheet image + tile definitions
 * for rendering, or fall back to solid-color rendering.
 */
export class TileMap {
  /**
   * @param {number[][]} data   - 2D array [row][col] of tile IDs
   * @param {number} tileW      - tile pixel width
   * @param {number} tileH      - tile pixel height
   */
  constructor(data, tileW = 32, tileH = 32) {
    this.data  = data;
    this.tileW = tileW;
    this.tileH = tileH;
    this.rows  = data.length;
    this.cols  = data[0]?.length ?? 0;

    // Optional sprite sheet image for tiles
    this._image = null;

    // Map: tileId -> { x, y, w, h } on sprite sheet
    this._tileDefs = {};

    // Map: tileId -> solid boolean (default: id > 0 is solid)
    this._solidMap = {};

    // Map: tileId -> color (fallback rendering)
    this._colorMap = {
      1: '#5a7a3a',
      2: '#7a6a4a',
      3: '#4a5a7a',
      4: '#8a4a3a',
      5: '#9a9a9a',
    };
  }

  setImage(img) { this._image = img; }

  defineTile(id, srcX, srcY, srcW, srcH, solid = true) {
    this._tileDefs[id] = { x: srcX, y: srcY, w: srcW, h: srcH };
    this._solidMap[id] = solid;
  }

  setColor(id, color) { this._colorMap[id] = color; }

  isSolid(id) {
    if (id === 0) return false;
    if (id in this._solidMap) return this._solidMap[id];
    return true; // default: everything non-zero is solid
  }

  getTileAt(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 0;
    return this.data[row][col];
  }

  getTileAtWorld(wx, wy) {
    const col = Math.floor(wx / this.tileW);
    const row = Math.floor(wy / this.tileH);
    return this.getTileAt(col, row);
  }

  isSolidAt(wx, wy) {
    return this.isSolid(this.getTileAtWorld(wx, wy));
  }

  /** World width/height in pixels */
  get width()  { return this.cols * this.tileW; }
  get height() { return this.rows * this.tileH; }

  /**
   * Return all solid tile rects overlapping the given AABB (in world space).
   * Used by the physics engine for collision resolution.
   */
  getSolidTilesInRect(rx, ry, rw, rh) {
    const rects = [];
    const c0 = Math.floor(rx / this.tileW);
    const c1 = Math.floor((rx + rw - 1) / this.tileW);
    const r0 = Math.floor(ry / this.tileH);
    const r1 = Math.floor((ry + rh - 1) / this.tileH);

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const id = this.getTileAt(c, r);
        if (this.isSolid(id)) {
          rects.push({
            x: c * this.tileW,
            y: r * this.tileH,
            w: this.tileW,
            h: this.tileH,
            id,
          });
        }
      }
    }
    return rects;
  }

  /**
   * Render only tiles visible within the camera viewport.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Camera} camera
   */
  draw(ctx, camera) {
    const startCol = Math.max(0, Math.floor(camera.x / this.tileW));
    const endCol   = Math.min(this.cols - 1, Math.ceil((camera.x + camera.viewW / camera.zoom) / this.tileW));
    const startRow = Math.max(0, Math.floor(camera.y / this.tileH));
    const endRow   = Math.min(this.rows - 1, Math.ceil((camera.y + camera.viewH / camera.zoom) / this.tileH));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const id = this.data[r][c];
        if (id === 0) continue;

        const dx = c * this.tileW;
        const dy = r * this.tileH;

        if (this._image && this._tileDefs[id]) {
          const def = this._tileDefs[id];
          ctx.drawImage(this._image, def.x, def.y, def.w, def.h, dx, dy, this.tileW, this.tileH);
        } else {
          ctx.fillStyle = this._colorMap[id] || '#888';
          ctx.fillRect(dx, dy, this.tileW, this.tileH);

          // Simple beveled highlight
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(dx, dy, this.tileW, 3);
          ctx.fillRect(dx, dy, 3, this.tileH);

          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(dx, dy + this.tileH - 3, this.tileW, 3);
          ctx.fillRect(dx + this.tileW - 3, dy, 3, this.tileH);
        }
      }
    }
  }
}
