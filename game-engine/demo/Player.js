import { GameObject }    from '../engine/GameObject.js';
import { Animator }      from '../engine/Animator.js';
import { ParticleSystem } from '../engine/Particle.js';

const MOVE_SPEED   = 220;
const JUMP_FORCE   = -520;
const DASH_SPEED   = 550;
const DASH_TIME    = 0.15;
const COYOTE_TIME  = 0.1;
const JUMP_BUFFER  = 0.1;
const FRICTION     = 12;
const AIR_FRICTION = 4;
const WALL_SLIDE   = 80;  // max fall speed while wall sliding
const WALL_JUMP_X  = 280;
const WALL_JUMP_Y  = -480;

export class Player extends GameObject {
  constructor(x, y) {
    super(x, y, 24, 32);
    this.tag = 'player';
    this.physicsEnabled = true;
    this.zIndex = 10;

    this.health    = 3;
    this.maxHealth = 3;
    this.coins     = 0;
    this.dead      = false;

    this._animator   = new Animator();
    this._particles  = new ParticleSystem();

    this._coyoteTimer  = 0;
    this._jumpBuffer   = 0;
    this._dashTimer    = 0;
    this._dashCooldown = 0;
    this._dashDir      = 1;
    this._dashing      = false;

    this._wallSlideDir = 0;
    this._hurtTimer    = 0;
    this._hurtCooldown = 1.0;
    this._respawnX     = x;
    this._respawnY     = y;
    this._facing       = 1; // 1 = right, -1 = left

    this._wasOnGround  = false;

    this._setupAnimations();
  }

  _setupAnimations() {
    // We'll draw procedurally if no image is set, but define anims anyway
    const makeFrames = (row, count, w = 24, h = 32) =>
      Array.from({ length: count }, (_, i) => ({ x: i * w, y: row * h, w, h }));

    this._animator.addAnimation('idle',  makeFrames(0, 1), 8);
    this._animator.addAnimation('run',   makeFrames(1, 6), 10);
    this._animator.addAnimation('jump',  makeFrames(2, 2), 8, false);
    this._animator.addAnimation('fall',  makeFrames(3, 2), 8);
    this._animator.addAnimation('dash',  makeFrames(4, 3), 20, false);
    this._animator.addAnimation('hurt',  makeFrames(5, 3), 12, false);
    this._animator.addAnimation('wall',  makeFrames(6, 1), 8);
    this._animator.play('idle');
  }

  init(scene) {
    this._scene = scene;
  }

  update(dt, input) {
    if (this.dead) return;

    const audio = this._scene.engine.audio;

    // Timers
    this._hurtTimer    = Math.max(0, this._hurtTimer    - dt);
    this._dashCooldown = Math.max(0, this._dashCooldown - dt);
    this._jumpBuffer   = Math.max(0, this._jumpBuffer   - dt);

    const wasOnGround = this._wasOnGround;
    this._wasOnGround = this.onGround;

    if (this.onGround) {
      this._coyoteTimer = COYOTE_TIME;
      if (!wasOnGround && this.velY >= 0) {
        audio.playProceduralSFX('land');
        this._particles.emit({
          count: 6, x: this.centerX, y: this.y + this.height,
          velXRange: [-60, 60], velYRange: [-40, -10],
          lifetime: [0.2, 0.4], sizeStart: 5, sizeEnd: 0,
          colorStart: '#aaa', gravity: 400,
        });
      }
    } else {
      this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
    }

    // Dash
    if (!this._dashing && input.isDash() && this._dashCooldown <= 0) {
      this._startDash();
      audio.playProceduralSFX('dash');
    }

    if (this._dashing) {
      this._dashTimer -= dt;
      this.velX = this._dashDir * DASH_SPEED;
      this.velY = 0;
      this._scene.physics.gravity && (this._scene.physics._dashingGravity = true);
      if (this._dashTimer <= 0) {
        this._dashing = false;
        this.velX = this._dashDir * MOVE_SPEED * 0.5;
      }
    } else {
      // Horizontal movement
      const hAxis = input.getHorizontal();
      if (hAxis !== 0) this._facing = hAxis > 0 ? 1 : -1;

      const targetVX = hAxis * MOVE_SPEED;
      const friction  = this.onGround ? FRICTION : AIR_FRICTION;
      this.velX += (targetVX - this.velX) * Math.min(1, friction * dt);

      // Wall slide
      this._wallSlideDir = 0;
      if (!this.onGround && this.onWall && this._hurtTimer <= 0) {
        if ((hAxis > 0 && this.velX > 0) || (hAxis < 0 && this.velX < 0)) {
          this._wallSlideDir = hAxis > 0 ? 1 : -1;
          if (this.velY > WALL_SLIDE) this.velY = WALL_SLIDE;
        }
      }
    }

    // Jump buffer
    if (input.isJump()) this._jumpBuffer = JUMP_BUFFER;

    // Jump
    if (this._jumpBuffer > 0) {
      if (this._coyoteTimer > 0) {
        // Normal jump
        this.velY = JUMP_FORCE;
        this._coyoteTimer = 0;
        this._jumpBuffer  = 0;
        audio.playProceduralSFX('jump');
        this._emitJumpParticles();
      } else if (this._wallSlideDir !== 0) {
        // Wall jump
        this.velX = -this._wallSlideDir * WALL_JUMP_X;
        this.velY = WALL_JUMP_Y;
        this._facing = -this._wallSlideDir;
        this._jumpBuffer = 0;
        audio.playProceduralSFX('jump');
      }
    }

    // Animate
    this._updateAnimation();
    this._animator.update(dt);
    this._particles.update(dt);

    // World bounds / death pit
    if (this.y > this._scene.tilemap.height + 200) {
      this._die();
    }
  }

  _startDash() {
    this._dashing    = true;
    this._dashTimer  = DASH_TIME;
    this._dashDir    = this._facing;
    this._dashCooldown = 0.6;

    this._particles.emit({
      count: 8, x: this.centerX, y: this.centerY,
      velXRange: [-this._dashDir * 80, -this._dashDir * 160],
      velYRange: [-20, 20],
      lifetime: [0.1, 0.2], sizeStart: 8, sizeEnd: 0,
      colorStart: '#88f', gravity: 0,
    });
  }

  _emitJumpParticles() {
    this._particles.emit({
      count: 8, x: this.centerX, y: this.y + this.height,
      velXRange: [-80, 80], velYRange: [-60, -20],
      lifetime: [0.2, 0.5], sizeStart: 6, sizeEnd: 0,
      colorStart: '#fff', gravity: 500,
    });
  }

  _updateAnimation() {
    if (this._hurtTimer > 0) {
      this._animator.play('hurt');
    } else if (this._dashing) {
      this._animator.play('dash');
    } else if (this._wallSlideDir !== 0) {
      this._animator.play('wall');
    } else if (!this.onGround) {
      this._animator.play(this.velY < 0 ? 'jump' : 'fall');
    } else if (Math.abs(this.velX) > 10) {
      this._animator.play('run');
    } else {
      this._animator.play('idle');
    }
  }

  hurt(damage = 1) {
    if (this._hurtTimer > 0 || this.dead) return;
    this.health -= damage;
    this._hurtTimer = this._hurtCooldown;
    this._scene.engine.audio.playProceduralSFX('hurt');

    this._particles.emit({
      count: 12, x: this.centerX, y: this.centerY,
      velXRange: [-100, 100], velYRange: [-120, -40],
      lifetime: [0.3, 0.6], sizeStart: 7, sizeEnd: 0,
      colorStart: '#f44', gravity: 400,
    });

    if (this.health <= 0) this._die();
  }

  _die() {
    this.dead = true;
    this._scene.engine.audio.playProceduralSFX('death');
    this._scene.engine.audio.playProceduralSFX('hurt');

    // Respawn after delay
    setTimeout(() => {
      this.x      = this._respawnX;
      this.y      = this._respawnY;
      this.velX   = 0;
      this.velY   = 0;
      this.health = this.maxHealth;
      this.dead   = false;
      this._hurtTimer = 0;
    }, 1200);
  }

  setRespawn(x, y) {
    this._respawnX = x;
    this._respawnY = y;
  }

  draw(ctx) {
    this._particles.draw(ctx);

    // Hurt flash
    if (this._hurtTimer > 0 && Math.floor(this._hurtTimer / 0.08) % 2 === 0) return;

    const img = this._animator._image;
    if (img) {
      this._animator.draw(ctx, this.x, this.y, this.width, this.height, this._facing < 0);
    } else {
      // Procedural character drawing
      this._drawProcedural(ctx);
    }

    // Debug hitbox
    if (this._scene?.engine?.debug) {
      ctx.strokeStyle = 'rgba(0,255,0,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  _drawProcedural(ctx) {
    const x = this.x, y = this.y, w = this.width, h = this.height;
    const f = this._facing;

    // Body
    ctx.fillStyle = this._hurtTimer > 0 ? '#f88' : '#4a9eff';
    ctx.fillRect(x + 4, y + 10, w - 8, h - 10);

    // Head
    ctx.fillStyle = this._hurtTimer > 0 ? '#faa' : '#ffd89b';
    ctx.fillRect(x + 3, y + 1, w - 6, 12);

    // Eyes
    ctx.fillStyle = '#222';
    const eyeX = f > 0 ? x + w - 9 : x + 5;
    ctx.fillRect(eyeX, y + 4, 3, 3);

    // Mouth
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(eyeX + (f > 0 ? -3 : 3), y + 9, 4, 2);

    // Legs
    const runFrame = Math.floor(Date.now() / 80) % 4;
    const leg1Y = this.onGround ? [0, 2, 0, -2][runFrame] : 0;
    const leg2Y = this.onGround ? [0, -2, 0, 2][runFrame] : 0;
    ctx.fillStyle = '#2563eb';
    if (Math.abs(this.velX) > 10 && this.onGround) {
      ctx.fillRect(x + 4, y + h - 10 + leg1Y, 6, 10);
      ctx.fillRect(x + w - 10, y + h - 10 + leg2Y, 6, 10);
    } else {
      ctx.fillRect(x + 4, y + h - 10, 6, 10);
      ctx.fillRect(x + w - 10, y + h - 10, 6, 10);
    }

    // Dash trail
    if (this._dashing) {
      ctx.fillStyle = 'rgba(136,136,255,0.3)';
      ctx.fillRect(x - 15 * f, y + 5, 15, h - 10);
    }

    // Wall slide indicator
    if (this._wallSlideDir !== 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const wx = this._wallSlideDir > 0 ? x + w : x - 6;
      ctx.fillRect(wx, y + 8, 6, h - 16);
    }
  }
}
