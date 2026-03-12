/**
 * Physics Engine
 *
 * Handles gravity, velocity integration, and AABB tile collision.
 * Objects must expose: x, y, width, height, velX, velY, onGround, onWall
 */
export class Physics {
  constructor(options = {}) {
    this.gravity     = options.gravity     ?? 1200;  // px/s²
    this.maxFallSpeed = options.maxFallSpeed ?? 800;
    this.terminalVelocityX = options.terminalVelocityX ?? 600;
  }

  /**
   * Step a single entity.
   * @param {object} entity   - game object with physics properties
   * @param {TileMap|null} tilemap
   * @param {number} dt       - delta time in seconds
   */
  step(entity, tilemap, dt) {
    if (!entity.physicsEnabled) return;

    // Apply gravity
    if (!entity.onGround) {
      entity.velY += this.gravity * dt;
    }

    // Clamp velocity
    entity.velY = Math.max(-this.maxFallSpeed, Math.min(this.maxFallSpeed, entity.velY));
    entity.velX = Math.max(-this.terminalVelocityX, Math.min(this.terminalVelocityX, entity.velX));

    // Reset ground/wall flags
    entity.onGround = false;
    entity.onWall   = false;
    entity.onCeiling = false;

    if (tilemap) {
      this._moveAndCollide(entity, tilemap, dt);
    } else {
      entity.x += entity.velX * dt;
      entity.y += entity.velY * dt;
    }
  }

  _moveAndCollide(entity, tilemap, dt) {
    // Horizontal movement
    entity.x += entity.velX * dt;
    const hTiles = tilemap.getSolidTilesInRect(entity.x, entity.y, entity.width, entity.height);
    for (const tile of hTiles) {
      const overlapX = this._resolveAxisX(entity, tile);
      if (overlapX !== 0) {
        entity.x += overlapX;
        entity.velX = 0;
        entity.onWall = true;
      }
    }

    // Vertical movement
    entity.y += entity.velY * dt;
    const vTiles = tilemap.getSolidTilesInRect(entity.x, entity.y, entity.width, entity.height);
    for (const tile of vTiles) {
      const overlapY = this._resolveAxisY(entity, tile);
      if (overlapY !== 0) {
        entity.y += overlapY;
        if (overlapY < 0) {
          entity.onGround = true;
          entity.velY = 0;
        } else {
          entity.onCeiling = true;
          entity.velY = 0;
        }
      }
    }
  }

  _resolveAxisX(entity, tile) {
    const eLeft  = entity.x;
    const eRight = entity.x + entity.width;
    const tLeft  = tile.x;
    const tRight = tile.x + tile.w;

    if (eRight <= tLeft || eLeft >= tRight) return 0;

    const overlapLeft  = tRight - eLeft;
    const overlapRight = eRight - tLeft;

    return overlapLeft < overlapRight ? overlapLeft : -overlapRight;
  }

  _resolveAxisY(entity, tile) {
    const eTop    = entity.y;
    const eBottom = entity.y + entity.height;
    const tTop    = tile.y;
    const tBottom = tile.y + tile.h;

    if (eBottom <= tTop || eTop >= tBottom) return 0;

    const overlapTop    = tBottom - eTop;
    const overlapBottom = eBottom - tTop;

    return overlapTop < overlapBottom ? overlapTop : -overlapBottom;
  }

  /**
   * Check AABB overlap between two entities (for object-to-object collision).
   * Returns the overlap vector {x, y} or null if no overlap.
   */
  static checkAABB(a, b) {
    const ax1 = a.x, ax2 = a.x + a.width;
    const ay1 = a.y, ay2 = a.y + a.height;
    const bx1 = b.x, bx2 = b.x + b.width;
    const by1 = b.y, by2 = b.y + b.height;

    if (ax2 <= bx1 || ax1 >= bx2 || ay2 <= by1 || ay1 >= by2) return null;

    const ox = Math.min(ax2 - bx1, bx2 - ax1);
    const oy = Math.min(ay2 - by1, by2 - ay1);
    return { x: ox, y: oy };
  }

  static overlaps(a, b) {
    return !(
      a.x + a.width  <= b.x ||
      a.x            >= b.x + b.width  ||
      a.y + a.height <= b.y ||
      a.y            >= b.y + b.height
    );
  }
}
