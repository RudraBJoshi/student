/**
 * Input Manager — keyboard and gamepad support
 */
export class Input {
  constructor() {
    this._keys = {};
    this._prevKeys = {};
    this._gamepad = null;

    window.addEventListener('keydown', e => {
      this._keys[e.code] = true;
      // Prevent arrow/space from scrolling the page
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => { this._keys[e.code] = false; });
    window.addEventListener('gamepadconnected', e => { this._gamepad = e.gamepad.index; });
    window.addEventListener('gamepaddisconnected', () => { this._gamepad = null; });
  }

  /** Called each frame before update — snapshots previous key state */
  update() {
    this._prevKeys = { ...this._keys };
    if (this._gamepad !== null) {
      this._gp = navigator.getGamepads()[this._gamepad];
    }
  }

  /** Is key currently held? */
  isDown(code) { return !!this._keys[code]; }
  /** Was key just pressed this frame? */
  isPressed(code) { return !!this._keys[code] && !this._prevKeys[code]; }
  /** Was key just released this frame? */
  isReleased(code) { return !this._keys[code] && !!this._prevKeys[code]; }

  /** Convenience axis: -1, 0, or 1 */
  getHorizontal() {
    let axis = 0;
    if (this.isDown('ArrowLeft')  || this.isDown('KeyA')) axis -= 1;
    if (this.isDown('ArrowRight') || this.isDown('KeyD')) axis += 1;
    if (this._gp) axis += this._gp.axes[0];
    return Math.max(-1, Math.min(1, axis));
  }

  isJump() {
    const kb = this.isPressed('ArrowUp') || this.isPressed('KeyW') || this.isPressed('Space');
    const gp = this._gp && this._gp.buttons[0] && this._gp.buttons[0].pressed;
    return kb || !!gp;
  }

  isDash() {
    return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
  }
}
