/**
 * Asset Loader — images and audio
 */
export class AssetLoader {
  constructor() {
    this._images = {};
    this._audio  = {};
    this._pending = 0;
    this._onComplete = null;
  }

  /** Load an image. Returns a promise. */
  loadImage(key, src) {
    this._pending++;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this._images[key] = img;
        this._pending--;
        resolve(img);
        if (this._pending === 0 && this._onComplete) this._onComplete();
      };
      img.onerror = () => {
        console.warn(`[AssetLoader] Failed to load image: ${src}`);
        this._pending--;
        if (this._pending === 0 && this._onComplete) this._onComplete();
        resolve(null);
      };
      img.src = src;
    });
  }

  /** Load an audio file. Returns a promise. */
  loadAudio(key, src) {
    this._pending++;
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.addEventListener('canplaythrough', () => {
        this._audio[key] = audio;
        this._pending--;
        if (this._pending === 0 && this._onComplete) this._onComplete();
        resolve(audio);
      }, { once: true });
      audio.onerror = () => {
        console.warn(`[AssetLoader] Failed to load audio: ${src}`);
        this._pending--;
        if (this._pending === 0 && this._onComplete) this._onComplete();
        resolve(null);
      };
      audio.load();
    });
  }

  /** Wait for all pending loads. */
  waitForAll() {
    if (this._pending === 0) return Promise.resolve();
    return new Promise(resolve => { this._onComplete = resolve; });
  }

  getImage(key) { return this._images[key] || null; }
  getAudio(key) { return this._audio[key]  || null; }
}
