/**
 * GameObject — base class for all entities in a scene.
 *
 * Properties available:
 *   x, y          - world position (top-left of bounding box)
 *   width, height - bounding box size
 *   velX, velY    - velocity (px/s)
 *   tag           - string tag for identification
 *   active        - if false, skipped for update/draw
 *   physicsEnabled - if false, physics engine skips this
 *   onGround, onWall, onCeiling - collision flags set by physics
 *   zIndex        - draw order (lower = drawn first)
 */
export class GameObject {
  constructor(x = 0, y = 0, width = 32, height = 32) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;

    this.velX = 0;
    this.velY = 0;

    this.tag   = 'object';
    this.active = true;
    this.physicsEnabled = false;

    this.onGround  = false;
    this.onWall    = false;
    this.onCeiling = false;

    this.zIndex = 0;

    // Internal reference to scene (set by Scene.add)
    this._scene = null;
  }

  /** Called once when added to a scene */
  init(scene) {}

  /**
   * Update logic — override in subclasses.
   * @param {number} dt  delta time in seconds
   * @param {Input}  input
   */
  update(dt, input) {}

  /**
   * Draw the object — override in subclasses.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // Default: magenta rectangle (useful for debugging)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  /** Called when the object is removed from the scene */
  destroy() {}

  /** Convenience: center X */
  get centerX() { return this.x + this.width  / 2; }
  get centerY() { return this.y + this.height / 2; }

  /** Shorthand to remove self from scene */
  remove() {
    if (this._scene) this._scene.remove(this);
  }
}
