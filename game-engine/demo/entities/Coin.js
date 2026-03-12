import { GameObject }    from '../../engine/GameObject.js';
import { Physics }       from '../../engine/Physics.js';
import { ParticleSystem } from '../../engine/Particle.js';

export class Coin extends GameObject {
  constructor(x, y) {
    super(x, y, 16, 16);
    this.tag    = 'coin';
    this.zIndex = 5;
    this._time  = Math.random() * Math.PI * 2;
    this._baseY = y;
    this._particles = new ParticleSystem();
    this._collected = false;
  }

  update(dt) {
    if (this._collected) {
      this._particles.update(dt);
      if (this._particles.count === 0) this.remove();
      return;
    }

    this._time += dt * 2;
    this.y = this._baseY + Math.sin(this._time) * 4;

    // Check collision with player
    const player = this._scene?.findFirst('player');
    if (player && Physics.overlaps(this, player)) {
      this._collect(player);
    }
  }

  _collect(player) {
    this._collected = true;
    player.coins++;
    this._scene.engine.audio.playProceduralSFX('coin');

    this._particles.emit({
      count: 10,
      x: this.centerX, y: this.centerY,
      velXRange: [-80, 80], velYRange: [-120, -40],
      lifetime: [0.3, 0.6], sizeStart: 6, sizeEnd: 0,
      colorStart: '#ffd700', gravity: 300,
    });
  }

  draw(ctx) {
    this._particles.draw(ctx);
    if (this._collected) return;

    // Coin body
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(this.centerX, this.centerY, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = '#fff9';
    ctx.beginPath();
    ctx.ellipse(this.centerX - 2, this.centerY - 2, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner
    ctx.strokeStyle = '#c8a600';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(this.centerX, this.centerY, 4, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
