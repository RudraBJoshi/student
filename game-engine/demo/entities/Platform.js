import { GameObject } from '../../engine/GameObject.js';
import { Physics }    from '../../engine/Physics.js';

/**
 * MovingPlatform — a solid platform that moves back and forth.
 * Players stand on it by using a secondary physics check.
 */
export class MovingPlatform extends GameObject {
  constructor(x, y, w, h, moveX = 0, moveY = 0, speed = 60) {
    super(x, y, w, h);
    this.tag    = 'platform';
    this.zIndex = 3;
    this.physicsEnabled = false;

    this._startX = x;
    this._startY = y;
    this._moveX  = moveX;
    this._moveY  = moveY;
    this._speed  = speed;
    this._t      = 0;
    this._dir    = 1;
    this._prevX  = x;
    this._prevY  = y;
  }

  update(dt) {
    this._prevX = this.x;
    this._prevY = this.y;

    this._t += this._dir * this._speed * dt;
    const maxT = Math.max(Math.abs(this._moveX), Math.abs(this._moveY));

    if (this._t >= maxT) { this._t = maxT; this._dir = -1; }
    if (this._t <= 0)    { this._t = 0;    this._dir =  1; }

    const ratio = maxT > 0 ? this._t / maxT : 0;
    this.x = this._startX + this._moveX * ratio;
    this.y = this._startY + this._moveY * ratio;

    // Carry player
    const player = this._scene?.findFirst('player');
    if (player && !player.dead) {
      const standingOn =
        player.onGround &&
        player.x + player.width  > this.x &&
        player.x                 < this.x + this.width &&
        player.y + player.height >= this._prevY &&
        player.y + player.height <= this._prevY + 6;

      if (standingOn) {
        player.x += this.x - this._prevX;
        player.y += this.y - this._prevY;
      }
    }
  }

  draw(ctx) {
    const x = this.x, y = this.y, w = this.width, h = this.height;
    ctx.fillStyle = '#6a4ca8';
    ctx.fillRect(x, y, w, h);

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x, y, w, 4);

    // Arrow indicator
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px monospace';
    const label = this._moveX !== 0 ? '↔' : '↕';
    ctx.fillText(label, x + w / 2 - 5, y + h / 2 + 4);
  }
}

/**
 * FallingPlatform — falls when the player stands on it.
 */
export class FallingPlatform extends GameObject {
  constructor(x, y, w = 80, h = 12) {
    super(x, y, w, h);
    this.tag    = 'fallingPlatform';
    this.zIndex = 3;
    this.physicsEnabled = false;

    this._startX    = x;
    this._startY    = y;
    this._triggered = false;
    this._fallVel   = 0;
    this._shakeTimer = 0;
    this._resetTimer = 0;
    this._fallen    = false;
  }

  update(dt) {
    const player = this._scene?.findFirst('player');
    if (!this._triggered && player) {
      const above =
        player.onGround &&
        player.x + player.width  > this.x + 2 &&
        player.x                 < this.x + this.width - 2 &&
        Math.abs((player.y + player.height) - this.y) < 6;
      if (above) {
        this._triggered = true;
        this._shakeTimer = 0.4;
      }
    }

    if (this._shakeTimer > 0) {
      this._shakeTimer -= dt;
    } else if (this._triggered && !this._fallen) {
      this._fallVel += 800 * dt;
      this.y += this._fallVel * dt;

      if (this.y > this._startY + 600) {
        this._fallen  = true;
        this._resetTimer = 2;
      }
    }

    if (this._fallen) {
      this._resetTimer -= dt;
      if (this._resetTimer <= 0) {
        this.x = this._startX;
        this.y = this._startY;
        this._fallVel   = 0;
        this._triggered = false;
        this._fallen    = false;
        this._shakeTimer = 0;
      }
    }
  }

  draw(ctx) {
    const shakeX = this._shakeTimer > 0 ? (Math.random() - 0.5) * 3 : 0;
    const x = this.x + shakeX, y = this.y, w = this.width, h = this.height;

    if (this._fallen) return;

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, w, 4);

    if (this._shakeTimer > 0) {
      ctx.strokeStyle = 'rgba(255,80,80,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }
  }
}
