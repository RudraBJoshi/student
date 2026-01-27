---
layout: default
title: Matrix Rain
description: A cool Matrix-style falling characters background effect.
permalink: /matrix
---

<canvas id="matrix"></canvas>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        overflow: hidden;
        background: #000;
    }
    canvas {
        display: block;
    }
</style>

<script>
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    function draw() {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = charArray[Math.floor(Math.random() * charArray.length)];

            // Draw the character
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Brighter head of the droplet
            ctx.fillStyle = '#fff';
            ctx.fillText(char, x, y);

            // Trail characters in green
            ctx.fillStyle = `hsl(120, 100%, ${Math.random() * 50 + 25}%)`;
            ctx.fillText(charArray[Math.floor(Math.random() * charArray.length)], x, y - fontSize);

            // Reset drop to top with random delay
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Run animation at 30fps
    setInterval(draw, 33);
</script>
