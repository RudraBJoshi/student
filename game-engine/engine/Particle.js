/**
 * Particle System — lightweight CPU-side particles
 */
export class ParticleSystem {
  constructor() {
    this._particles = [];
  }

  /**
   * Emit particles at a world position.
   * @param {object} opts
   *   count, x, y,
   *   velXRange [min,max], velYRange [min,max],
   *   lifetime [min,max],
   *   sizeStart, sizeEnd,
   *   colorStart (hex/css), colorEnd,
   *   gravity
   */
  emit(opts) {
    const count = opts.count ?? 8;
    for (let i = 0; i < count; i++) {
      this._particles.push({
        x: opts.x, y: opts.y,
        velX: lerp(opts.velXRange?.[0] ?? -50, opts.velXRange?.[1] ?? 50, Math.random()),
        velY: lerp(opts.velYRange?.[0] ?? -100, opts.velYRange?.[1] ?? -20, Math.random()),
        lifetime: lerp(opts.lifetime?.[0] ?? 0.3, opts.lifetime?.[1] ?? 0.7, Math.random()),
        age: 0,
        sizeStart: opts.sizeStart ?? 6,
        sizeEnd:   opts.sizeEnd   ?? 0,
        colorStart: opts.colorStart ?? '#fff',
        colorEnd:   opts.colorEnd   ?? 'rgba(255,255,255,0)',
        gravity: opts.gravity ?? 300,
      });
    }
  }

  update(dt) {
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.age  += dt;
      p.velY += p.gravity * dt;
      p.x    += p.velX * dt;
      p.y    += p.velY * dt;
      if (p.age >= p.lifetime) this._particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this._particles) {
      const t    = p.age / p.lifetime;
      const size = lerp(p.sizeStart, p.sizeEnd, t);
      if (size <= 0) continue;

      ctx.globalAlpha = 1 - t;
      ctx.fillStyle   = p.colorStart;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  get count() { return this._particles.length; }
}

function lerp(a, b, t) { return a + (b - a) * t; }
