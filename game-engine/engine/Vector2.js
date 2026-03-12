/**
 * 2D Vector math utility
 */
export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
  scale(s) { return new Vector2(this.x * s, this.y * s); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize() {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : new Vector2();
  }
  clone() { return new Vector2(this.x, this.y); }

  static zero()  { return new Vector2(0, 0); }
  static one()   { return new Vector2(1, 1); }
  static up()    { return new Vector2(0, -1); }
  static down()  { return new Vector2(0, 1); }
  static left()  { return new Vector2(-1, 0); }
  static right() { return new Vector2(1, 0); }
}
