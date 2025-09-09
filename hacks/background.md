---
layout: default
title: Background with Object
description: Use JavaScript to have an in motion background.
# Images used in this demo
sprite: images/platformer/sprites/SR-71.png
background: images/platformer/backgrounds/6dxam0d4mgh81.jpg
permalink: /background
---

<!-- The canvas is like our “game screen.” Everything will be drawn here -->
<canvas id="world"></canvas>

<script>
  // --- BLOCK 1: Get the canvas ready ---
  const canvas = document.getElementById("world");
  const ctx = canvas.getContext('2d'); // this lets us draw on the canvas

  // --- BLOCK 2: Load the pictures we need (background + player) ---
  const backgroundImg = new Image();
  const spriteImg = new Image();

  // Images come from the page info above
  backgroundImg.src = '{{page.background}}';
  spriteImg.src = '{{page.sprite}}';

  // --- BLOCK 3: Wait until both pictures are ready before starting ---
  let imagesLoaded = 0;
  backgroundImg.onload = () => { imagesLoaded++; startGameWorld(); };
  spriteImg.onload   = () => { imagesLoaded++; startGameWorld(); };

  /*
   * This function is called when images load.
   * It will ONLY start the game when both are ready (imagesLoaded = 2).
   */
  function startGameWorld() {
    if (imagesLoaded < 2) return; 

    // --- BLOCK 4: Blueprint for all things in the game ---
    class GameObject {
      constructor(image, width, height, x = 0, y = 0, speedRatio = 0) {
        this.image = image;        // the picture we draw
        this.width = width;        // how wide it is
        this.height = height;      // how tall it is
        this.x = x;                // where it starts (left/right)
        this.y = y;                // where it starts (up/down)
        this.speedRatio = speedRatio; 
        this.speed = GameWorld.gameSpeed * this.speedRatio; // how fast it moves
      }

      // For now, this does nothing. Special objects can add movement here.
      update() {}

      // This draws the object’s picture onto the canvas
      draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }
  }

  // --- BLOCK 5: Background (special GameObject that scrolls forever) ---
  class Background extends GameObject {
    constructor(image, gameWorld) {
      // Fill the entire screen and move slowly (speedRatio = 0.1)
      super(image, gameWorld.width, gameWorld.height, 0, 0, 0.1);
    }

    update() {
      // Move left each frame, loop back when it goes too far
      this.x = (this.x - this.speed) % this.width;
    }

    draw(ctx) {
      // Draw two copies side by side so it looks endless
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
  }

  // --- BLOCK 6: Player (special GameObject that gently “bobs”) ---
  class Player extends GameObject {
    constructor(image, gameWorld) {
      // Make the sprite half its original size
      const width = image.naturalWidth / 2;
      const height = image.naturalHeight / 2;

      // Place it in the center of the screen
      const x = (gameWorld.width - width) / 2;
      const y = (gameWorld.height - height) / 2;

      super(image, width, height, x, y);

      // Save its starting Y position and frame counter for the animation
      this.baseY = y;
      this.frame = 0;
    }

    update() {
      // Make the player bob up and down using a sine wave
      this.y = this.baseY + Math.sin(this.frame * 0.15) * 20;
      this.frame++;
    }
  }

  // --- BLOCK 7: GameWorld (controls the canvas, objects, and loop) ---
  class GameWorld {
    static gameSpeed = 5; // base speed number used by all moving things

    constructor(backgroundImg, spriteImg) {
      // Set canvas to match the window size
      this.canvas = document.getElementById("world");
      this.ctx = this.canvas.getContext('2d');
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // Make the canvas stick to the screen
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = `0px`;
      this.canvas.style.top = `${(window.innerHeight - this.height) / 2}px`;

      // Create the things that exist in our world
      this.objects = [
        new Background(backgroundImg, this), // scrolling background
        new Player(spriteImg, this)          // player in the middle
      ];
    }

    // The main loop: clear → update → draw → repeat
    gameLoop() {
      // Erase what was there before
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Update and redraw every object
      for (const obj of this.objects) {
        obj.update();
        obj.draw(this.ctx);
      }

      // Ask the browser to run this function again on the next frame
      requestAnimationFrame(this.gameLoop.bind(this));
    }

    // Starts the loop
    start() {
      this.gameLoop();
    }
  }

  // --- BLOCK 8: Put it all together ---
  const world = new GameWorld(backgroundImg, spriteImg);
  world.start(); // begin the animation
</script>
