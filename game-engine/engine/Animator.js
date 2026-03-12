/**
 * Animator — frame-based sprite-sheet animation
 *
 * An "animation" is defined as:
 *   { frames: [{x, y, w, h}], fps: 12, loop: true }
 *
 * where each frame is a rectangle on a sprite sheet.
 */
export class Animator {
  constructor() {
    this._anims = {};
    this._current = null;
    this._frame = 0;
    this._elapsed = 0;
    this._done = false;
    this._image = null;
  }

  setImage(img) { this._image = img; }

  addAnimation(name, frames, fps = 12, loop = true) {
    this._anims[name] = { frames, fps, loop };
  }

  play(name, force = false) {
    if (!force && this._current === name) return;
    this._current = name;
    this._frame = 0;
    this._elapsed = 0;
    this._done = false;
  }

  update(dt) {
    const anim = this._anims[this._current];
    if (!anim || this._done) return;

    this._elapsed += dt;
    const frameDur = 1 / anim.fps;

    while (this._elapsed >= frameDur) {
      this._elapsed -= frameDur;
      this._frame++;
      if (this._frame >= anim.frames.length) {
        if (anim.loop) {
          this._frame = 0;
        } else {
          this._frame = anim.frames.length - 1;
          this._done = true;
          break;
        }
      }
    }
  }

  isDone() { return this._done; }

  /**
   * Draw the current frame.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x  - destination x
   * @param {number} y  - destination y
   * @param {number} w  - destination width
   * @param {number} h  - destination height
   * @param {boolean} flipX
   */
  draw(ctx, x, y, w, h, flipX = false) {
    const anim = this._anims[this._current];
    if (!anim || !this._image) return;

    const frame = anim.frames[this._frame];
    ctx.save();
    if (flipX) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(this._image, frame.x, frame.y, frame.w, frame.h, 0, 0, w, h);
    } else {
      ctx.drawImage(this._image, frame.x, frame.y, frame.w, frame.h, x, y, w, h);
    }
    ctx.restore();
  }

  getCurrentFrame() {
    const anim = this._anims[this._current];
    if (!anim) return null;
    return anim.frames[this._frame];
  }
}
