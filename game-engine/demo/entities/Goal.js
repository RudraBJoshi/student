import { GameObject } from '../../engine/GameObject.js';
import { Physics }    from '../../engine/Physics.js';

export class GoalFlag extends GameObject {
  constructor(x, y) {
    super(x, y, 32, 64);
    this.tag    = 'goal';
    this.zIndex = 5;
    this._time  = 0;
    this._triggered = false;
  }

  update(dt) {
    this._time += dt;

    if (!this._triggered) {
      const player = this._scene?.findFirst('player');
      if (player && !player.dead && Physics.overlaps(this, player)) {
        this._triggered = true;
        this._scene.engine.audio.playProceduralSFX('coin');
        setTimeout(() => {
          this._scene.engine.audio.playProceduralSFX('coin');
        }, 200);
        setTimeout(() => {
          this._scene.engine.audio.playProceduralSFX('coin');
          // Signal level complete
          if (this._scene.onLevelComplete) this._scene.onLevelComplete(player);
        }, 400);
      }
    }
  }

  draw(ctx) {
    const x = this.x, y = this.y;

    // Pole
    ctx.fillStyle = '#aaa';
    ctx.fillRect(x + 14, y, 4, this.height);

    // Flag wave
    const wave = Math.sin(this._time * 3);
    ctx.fillStyle = this._triggered ? '#00e676' : '#f44336';
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 2);
    ctx.lineTo(x + 18 + 20 + wave * 4, y + 8);
    ctx.lineTo(x + 18 + 18 + wave * 2, y + 14 + wave * 2);
    ctx.lineTo(x + 18, y + 20);
    ctx.closePath();
    ctx.fill();

    // Base
    ctx.fillStyle = '#666';
    ctx.fillRect(x + 6, y + this.height - 8, 20, 8);

    if (this._triggered) {
      // Star burst
      ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(this._time * 8) * 0.4})`;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + this._time;
        const r = i % 2 === 0 ? 20 : 10;
        const px = x + 16 + Math.cos(a) * r;
        const py = y + 10 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

export class Checkpoint extends GameObject {
  constructor(x, y) {
    super(x, y, 24, 48);
    this.tag       = 'checkpoint';
    this.zIndex    = 4;
    this._time     = 0;
    this._activated = false;
  }

  update(dt) {
    this._time += dt;
    const player = this._scene?.findFirst('player');
    if (!this._activated && player && Physics.overlaps(this, player)) {
      this._activated = true;
      player.setRespawn(this.x, this.y);
      this._scene.engine.audio.playProceduralSFX('coin');
    }
  }

  draw(ctx) {
    const x = this.x, y = this.y;
    ctx.fillStyle = '#666';
    ctx.fillRect(x + 10, y, 4, this.height);

    const color = this._activated
      ? `hsl(${120 + Math.sin(this._time * 4) * 10}, 80%, 55%)`
      : '#888';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 2);
    ctx.lineTo(x + 14 + 14, y + 10);
    ctx.lineTo(x + 14, y + 18);
    ctx.closePath();
    ctx.fill();
  }
}
