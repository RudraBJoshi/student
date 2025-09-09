---
layout: default
title: Background with Object
description: Use JavaScript to have an in motion background.
sprite: images/platformer/sprites/SR-71.png
background: images/platformer/backgrounds/6dxam0d4mgh81.jpg
permalink: /background
---

<!-- Canvas element where everything will be drawn -->
<canvas id="world"></canvas>

<script>
  // Get canvas and its 2D drawing context
  const canvas = document.getElementById("world");
  const ctx = canvas.getContext('2d');

  // Create image objects for background and sprite
  const backgroundImg = new Image();
  const spriteImg = new Image();

  // Assign image sources from Jekyll page variables
  backgroundImg.src = '{{page.background}}'; // Background image
  spriteImg.src = '{{page.sprite}}';         // Player sprite image
  
  // Track how many images are loaded
  let imagesLoaded = 0;

  // Increase counter when background is loaded, then attempt to start
  backgroundImg.onload = function() {
    imagesLoaded++;
    startGameWorld();
  };

  // Increase counter when sprite is loaded, then attempt to start
  spriteImg.onload = function() {
    imagesLoaded++;
    startGameWorld();
  };

  /* Starts the game world once both images are ready */
  function startGameWorld() {
    // Wait until both images are loaded before running
    if (imagesLoaded < 2) return; 

    // Base class for drawable objects in the game
    class GameObject {
      constructor(image, width, height, x = 0, y = 0, speedRatio = 0) {
        this.image = image;       // Image to display
        this.width = width;       // Width of object
        this.height = height;     // Height of object
        this.x = x;               // X-position
        this.y = y;               // Y-position
        this.speedRatio = speedRatio; // Movement relative to game speed
        this.speed = GameWorld.gameSpeed * this.speedRatio;
      }
      update() {} // Placeholder update method (for subclasses)
      draw(ctx) { // Draws the image on canvas
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }

    // Background that scrolls continuously
    class Background extends GameObject {
      constructor(image, gameWorld) {
        // Fill entire canvas with background image
        super(image, gameWorld.width, gameWorld.height, 0, 0, 0.1);
      }
      update() {
        // Moves background leftwards, loops seamlessly
        this.x = (this.x - this.speed) % this.width;
      }
      draw(ctx) {
        // Draw background twice side-by-side for infinite scroll
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
      }
    }

    // Player object that floats up and down
    class Player extends GameObject {
      constructor(image, gameWorld) {
        // Resize player image to half natural size
        const width = image.naturalWidth / 2;
        const height = image.naturalHeight / 2;
        // Position player in the center of the canvas
        const x = (gameWorld.width - width) / 2;
        const y = (gameWorld.height - height) / 2;
        super(image, width, height, x, y);
        this.baseY = y;  // Remember base vertical position
        this.frame = 0;  // Animation frame counter
      }
      update() {
        // Oscillates the player up and down using sine wave
        this.y = this.baseY + Math.sin(this.frame * 0.15) * 20;
        this.frame++;
      }
    }

    // Main game world controller
    class GameWorld {
      static gameSpeed = 5; // Global movement speed
      constructor(backgroundImg, spriteImg) {
        // Setup canvas dimensions to match browser window
        this.canvas = document.getElementById("world");
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Style canvas to cover the page
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `0px`;
        this.canvas.style.top = `${(window.innerHeight - this.height) / 2}px`;

        // Objects in the game: scrolling background + player
        this.objects = [
         new Background(backgroundImg, this),
         new Player(spriteImg, this)
        ];
      }
      // Main animation loop: clears, updates, draws
      gameLoop() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (const obj of this.objects) {
          obj.update();
          obj.draw(this.ctx);
        }
        requestAnimationFrame(this.gameLoop.bind(this)); // Repeat next frame
      }
      // Start the loop
      start() {
        this.gameLoop();
      }
    }

    // Create and run the game
    const world = new GameWorld(backgroundImg, spriteImg);
    world.start();
  }
</script>
