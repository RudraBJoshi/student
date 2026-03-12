import { Engine }    from '../engine/Engine.js';
import { GameScene } from './GameScene.js';

const canvas = document.getElementById('game-canvas');
if (!canvas) throw new Error('No #game-canvas element found on page.');

canvas.width  = 480;
canvas.height = 320;

const engine = new Engine({
  canvas,
  width:  480,
  height: 320,
  debug:  false,
  // responsive sizing is handled by CSS (max-width: 100%)
});

// Expose to window for console debugging
window.engine = engine;

engine.loadScene(new GameScene());
engine.start();
