import { Scene }    from '../engine/Scene.js';
import { TileMap }  from '../engine/TileMap.js';
import { Camera }   from '../engine/Camera.js';

import { Player }          from './Player.js';
import { Coin }            from './entities/Coin.js';
import { WalkingEnemy, FlyingEnemy } from './entities/Enemy.js';
import { GoalFlag, Checkpoint }      from './entities/Goal.js';
import { MovingPlatform, FallingPlatform } from './entities/Platform.js';

import { LEVEL1, LEVEL1_ENTITIES } from './levels/level1.js';

const TILE = 32;

export class GameScene extends Scene {
  constructor() {
    super();
    this.backgroundColor = '#0d1b2a';

    this._levelComplete = false;
    this._levelTimer    = 0;
    this._transTimer    = 0;
    this._showComplete  = false;
  }

  init(engine) {
    this.engine = engine;

    // TileMap
    this.tilemap = new TileMap(LEVEL1, TILE, TILE);
    this.tilemap.setColor(1, '#3a7d44');
    this.tilemap.setColor(2, '#7a5c3a');
    this.tilemap.setColor(3, '#6a7a8a');
    this.tilemap.setColor(4, '#8a6a5a');
    this.tilemap.setColor(5, '#3a4a5a');

    // Camera
    this.camera = new Camera(engine.width, engine.height);
    this.camera.setBounds(0, 0, this.tilemap.width, this.tilemap.height);
    this.camera.lerpFactor = 0.05;
    this.camera.zoom = 1.5;

    // Update camera bounds for zoom
    this.camera.setBounds(0, 0, this.tilemap.width, this.tilemap.height);

    // Parallax bg layers
    this.bgLayers = [
      { color: '#0d1b2a', scrollFactorX: 0, scrollFactorY: 0 },
    ];

    // Player
    const spawn = LEVEL1_ENTITIES.playerStart;
    this._player = new Player(spawn.x, spawn.y);
    this.add(this._player);

    // Coins
    for (const c of LEVEL1_ENTITIES.coins) {
      this.add(new Coin(c.x, c.y));
    }

    // Enemies
    for (const e of LEVEL1_ENTITIES.enemies) {
      if (e.type === 'walk') {
        this.add(new WalkingEnemy(e.x, e.y, e.patrol));
      } else if (e.type === 'fly') {
        this.add(new FlyingEnemy(e.x, e.y));
      }
    }

    // Moving platforms
    for (const p of LEVEL1_ENTITIES.movingPlatforms) {
      const mp = new MovingPlatform(p.x, p.y, p.w, p.h, p.moveX, p.moveY, p.speed);
      this.add(mp);
    }

    // Falling platforms
    for (const p of LEVEL1_ENTITIES.fallingPlatforms) {
      this.add(new FallingPlatform(p.x, p.y, p.w, p.h));
    }

    // Checkpoints
    for (const cp of LEVEL1_ENTITIES.checkpoints) {
      this.add(new Checkpoint(cp.x, cp.y));
    }

    // Goal
    const g = LEVEL1_ENTITIES.goal;
    this.add(new GoalFlag(g.x, g.y));

    // Level complete callback
    this.onLevelComplete = (player) => {
      this._levelComplete = true;
      this._showComplete  = true;
    };
  }

  update(dt, input) {
    super.update(dt, input);

    // Camera follow player
    if (this.camera && this._player) {
      this.camera.follow(this._player);
    }

    // Moving platforms interact with tilemap physics
    this._updateMovingPlatformCollision(dt);

    if (this._levelComplete) {
      this._transTimer += dt;
    }

    // Restart
    if (input.isPressed('KeyR')) {
      this.engine.loadScene(new GameScene());
    }
  }

  _updateMovingPlatformCollision(dt) {
    const platforms = this.findByTag('platform').concat(this.findByTag('fallingPlatform'));
    const player    = this._player;
    if (!player || player.dead) return;

    for (const plat of platforms) {
      // Check if player is falling onto platform top
      const prevBottom = player.y + player.height - player.velY * dt;
      const platTop    = plat.y;

      if (
        player.velY >= 0 &&
        prevBottom <= platTop + 2 &&
        player.y + player.height >= platTop &&
        player.y + player.height <= platTop + player.velY * dt + 10 &&
        player.x + player.width  > plat.x + 2 &&
        player.x                 < plat.x + plat.width - 2
      ) {
        player.y      = platTop - player.height;
        player.velY   = 0;
        player.onGround = true;
      }
    }
  }

  draw(ctx) {
    super.draw(ctx);

    // HUD
    this._drawHUD(ctx);

    // Level complete overlay
    if (this._showComplete) {
      this._drawLevelComplete(ctx);
    }

    // Controls hint (first 5 seconds)
    if (this._levelTimer < 5) {
      this._levelTimer += 0.016;
      const alpha = Math.min(1, (5 - this._levelTimer) * 2);
      this._drawControls(ctx, alpha);
    }
  }

  _drawHUD(ctx) {
    const p = this._player;
    const pad = 12;
    const w = this.engine.width;

    ctx.save();

    // Health hearts
    for (let i = 0; i < p.maxHealth; i++) {
      const filled = i < p.health;
      ctx.fillStyle = filled ? '#e74c3c' : 'rgba(200,80,80,0.25)';
      ctx.font = '20px serif';
      ctx.fillText('♥', pad + i * 26, pad + 20);
    }

    // Coins
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`✦ ${p.coins}`, pad, pad + 44);

    // Controls reminder (small)
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('R = Restart', w - pad, pad + 16);
    ctx.textAlign = 'left';

    // Dash cooldown indicator
    if (p._dashCooldown > 0) {
      ctx.fillStyle = 'rgba(100,100,255,0.4)';
      ctx.fillRect(pad, pad + 52, 50, 6);
      ctx.fillStyle = '#88f';
      ctx.fillRect(pad, pad + 52, 50 * (1 - p._dashCooldown / 0.6), 6);
    } else {
      ctx.fillStyle = '#88f';
      ctx.fillRect(pad, pad + 52, 50, 6);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px monospace';
    ctx.fillText('DASH', pad, pad + 67);

    ctx.restore();
  }

  _drawLevelComplete(ctx) {
    const w = this.engine.width, h = this.engine.height;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, h);

    const t = this._transTimer;
    const scale = Math.min(1, 0.5 + t * 2);
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', w / 2, h / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`Coins: ${this._player.coins}`, w / 2, h / 2 + 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Press R to play again', w / 2, h / 2 + 55);

    ctx.textAlign = 'left';
    ctx.restore();
  }

  _drawControls(ctx, alpha) {
    const w = this.engine.width, h = this.engine.height;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(w / 2 - 120, h - 70, 240, 55);

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow/WASD: Move    Space/Up: Jump', w / 2, h - 48);
    ctx.fillText('Shift: Dash    Stomp enemies from above!', w / 2, h - 30);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}
