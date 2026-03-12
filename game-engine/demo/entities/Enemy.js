import { GameObject }    from '../../engine/GameObject.js';
import { Physics }       from '../../engine/Physics.js';
import { ParticleSystem } from '../../engine/Particle.js';

export class WalkingEnemy extends GameObject {
  constructor(x, y, patrolDist = 96) {
    super(x, y, 28, 26);
    this.tag    = 'enemy';
    this.zIndex = 5;
    this.physicsEnabled = true;

    this._startX    = x;
    this._patrolDist = patrolDist;
    this._dir       = 1;
    this._speed     = 70;
    this._time      = 0;
    this._particles = new ParticleSystem();
    this._dead      = false;
  }

  update(dt) {
    if (this._dead) {
      this._particles.update(dt);
      if (this._particles.count === 0) this.remove();
      return;
    }

    this._time += dt;
    this.velX = this._dir * this._speed;

    // Reverse at patrol edges or when hitting a wall
    if (this.x < this._startX - this._patrolDist) {
      this.x = this._startX - this._patrolDist;
      this._dir = 1;
    }
    if (this.x > this._startX + this._patrolDist) {
      this.x = this._startX + this._patrolDist;
      this._dir = -1;
    }
    if (this.onWall) this._dir *= -1;

    this._particles.update(dt);

    // Check collision with player
    const player = this._scene?.findFirst('player');
    if (player && !player.dead && Physics.overlaps(this, player)) {
      // If player is falling onto enemy — stomp
      if (player.velY > 50 && player.y + player.height < this.y + this.height / 2 + 8) {
        this._die();
        player.velY = -350;
        player.coins += 2;
        this._scene.engine.audio.playProceduralSFX('coin');
      } else {
        player.hurt(1);
      }
    }
  }

  _die() {
    this._dead = true;
    this._scene.engine.audio.playProceduralSFX('hurt');

    this._particles.emit({
      count: 12,
      x: this.centerX, y: this.centerY,
      velXRange: [-100, 100], velYRange: [-140, -40],
      lifetime: [0.4, 0.7], sizeStart: 8, sizeEnd: 0,
      colorStart: '#f66', gravity: 350,
    });
  }

  draw(ctx) {
    this._particles.draw(ctx);
    if (this._dead) return;

    const x = this.x, y = this.y, w = this.width, h = this.height;
    const walk = Math.sin(this._time * 6) * 2;

    // Body
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x + 2, y + 6, w - 4, h - 6);

    // Head
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x, y, w, 10);

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 2, 6, 5);
    ctx.fillRect(x + w - 10, y + 2, 6, 5);
    ctx.fillStyle = '#111';
    const ex = this._dir > 0 ? 2 : 1;
    ctx.fillRect(x + 4 + ex, y + 3, 3, 3);
    ctx.fillRect(x + w - 10 + ex, y + 3, 3, 3);

    // Legs
    ctx.fillStyle = '#922b21';
    ctx.fillRect(x + 4, y + h - 8 + walk, 7, 8);
    ctx.fillRect(x + w - 11, y + h - 8 - walk, 7, 8);

    // Angry eyebrows
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 3,  y + 1);
    ctx.lineTo(x + 10, y + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 3,  y + 1);
    ctx.lineTo(x + w - 10, y + 4);
    ctx.stroke();
  }
}

export class FlyingEnemy extends GameObject {
  constructor(x, y) {
    super(x, y, 24, 24);
    this.tag    = 'enemy';
    this.zIndex = 5;
    this._startX = x;
    this._startY = y;
    this._time   = Math.random() * Math.PI * 2;
    this._speed  = 60;
    this._dead   = false;
    this._particles = new ParticleSystem();
  }

  update(dt) {
    if (this._dead) {
      this._particles.update(dt);
      if (this._particles.count === 0) this.remove();
      return;
    }

    this._time += dt;
    // Figure-8 / sine patrol
    this.x = this._startX + Math.cos(this._time * 0.8) * 60;
    this.y = this._startY + Math.sin(this._time * 1.4) * 28;

    this._particles.update(dt);

    const player = this._scene?.findFirst('player');
    if (player && !player.dead && Physics.overlaps(this, player)) {
      player.hurt(1);
    }
  }

  _die() {
    this._dead = true;
    this._scene.engine.audio.playProceduralSFX('hurt');
    this._particles.emit({
      count: 10, x: this.centerX, y: this.centerY,
      velXRange: [-80, 80], velYRange: [-100, -20],
      lifetime: [0.4, 0.7], sizeStart: 6, sizeEnd: 0,
      colorStart: '#a8f', gravity: 200,
    });
  }

  draw(ctx) {
    this._particles.draw(ctx);
    if (this._dead) return;

    const x = this.x, y = this.y, w = this.width, h = this.height;
    const flap = Math.sin(this._time * 10) * 4;

    // Wings
    ctx.fillStyle = 'rgba(160, 100, 240, 0.7)';
    ctx.beginPath();
    ctx.ellipse(x - 4, y + h / 2 + flap, 10, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w + 4, y + h / 2 + flap, 10, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#8e44ad';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(x + w / 2 - 4, y + h / 2 - 2, 3, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + 4, y + h / 2 - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x + w / 2 - 4, y + h / 2 - 2, 1.5, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + 4, y + h / 2 - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
