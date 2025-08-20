---
layout: post
title: About
permalink: /about/
comments: true
---

## As a conversation Starter
Hi, My name is Rudra Joshi and I am 15 years old!

Binary Joke: In this CSP class there are 10 types of people in your class. People who code code code, and people who kill kill time. 



Where I lived:
<style>
    /* Style looks pretty compact, 
       - grid-container and grid-item are referenced the code 
    */
    .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Dynamic columns */
        gap: 10px;
    }
    .grid-item {
        text-align: center;
    }
    .grid-item img {
        width: 100%;
        height: 100px; /* Fixed height for uniformity */
        object-fit: contain; /* Ensure the image fits within the fixed height */
    }
    .grid-item p {
        margin: 5px 0; /* Add some margin for spacing */
    }

    .image-gallery {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        gap: 10px;
        }

    .image-gallery img {
        max-height: 150px;
        object-fit: cover;
        border-radius: 5px;
    }
</style>

<!-- This grid_container class is used by CSS styling and the id is used by JavaScript connection -->
<div class="grid-container" id="grid_container">
    <!-- content will be added here by JavaScript -->
</div>

<script>
    // 1. Make a connection to the HTML container defined in the HTML div
    var container = document.getElementById("grid_container"); // This container connects to the HTML div

    // 2. Define a JavaScript object for our http source and our data rows for the Living in the World grid
    var http_source = "https://upload.wikimedia.org/wikipedia/commons/";
    var living_in_the_world = [
        {"flag": "0/01/Flag_of_California.svg", "greeting": "I never moved from here", "description": "California - forever"},
        {"flag": "4/41/Flag_of_India.svg", "greeting": "I dont exactly live here but I visit annually for 2 weeks", "description": "India"},
       
    ];

    // 3a. Consider how to update style count for size of container
    // The grid-template-columns has been defined as dynamic with auto-fill and minmax

    // 3b. Build grid items inside of our container for each row of data
    for (const location of living_in_the_world) {
        // Create a "div" with "class grid-item" for each row
        var gridItem = document.createElement("div");
        gridItem.className = "grid-item";  // This class name connects the gridItem to the CSS style elements
        // Add "img" HTML tag for the flag
        var img = document.createElement("img");
        img.src = http_source + location.flag; // concatenate the source and flag
        img.alt = location.flag + " Flag"; // add alt text for accessibility

        // Add "p" HTML tag for the description
        var description = document.createElement("p");
        description.textContent = location.description; // extract the description

        // Add "p" HTML tag for the greeting
        var greeting = document.createElement("p");
        greeting.textContent = location.greeting;  // extract the greeting

        // Append img and p HTML tags to the grid item DIV
        gridItem.appendChild(img);
        gridItem.appendChild(description);
        gridItem.appendChild(greeting);

        // Append the grid item DIV to the container DIV
        container.appendChild(gridItem);
    }
</script>

### A little about me

- I code in python
- I understand OS hardening
- I can bake
- I like to Spend time with Friends
- I play Volleyball

### Culture, Family, and Fun

In my life I care about 3 things: Religion, Family, and Experience.

- I come from a line of Gujarati Brahmins and I believe in Hindu Faith
- I live with my sister, my parents, and my maternal grandparents
- I travelled to 8 countries:
    - ![USA](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1fa-1f1f8.png) United States  
    - ![Canada](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1e8-1f1e6.png) Canada  
    - ![Mexico](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1f2-1f1fd.png) Mexico  
    - ![Costa Rica](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1e8-1f1f7.png) Costa Rica  
    - ![UAE](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1e6-1f1ea.png) United Arab Emirates  
    - ![India](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1ee-1f1f3.png) India  
    - ![Switzerland](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1e8-1f1ed.png) Switzerland  
    - ![France](https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1eb-1f1f7.png) France  

- Highlights:
# Famous Landscapes Carousel

<style>
  .carousel{position:relative;max-width:900px;margin:0 auto 1rem;overflow:hidden;border-radius:12px}
  .carousel__track{display:flex;transition:transform 300ms ease-in-out;will-change:transform}
  .carousel__slide{min-width:100%;user-select:none}
  .carousel__slide img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}
  .carousel__caption{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;padding:.6rem .9rem;font-weight:600;text-shadow:0 1px 2px rgba(0,0,0,.6)}
  .carousel__btn{position:absolute;top:50%;transform:translateY(-50%);border:0;background:rgba(0,0,0,.45);color:#fff;width:44px;height:44px;border-radius:50%;cursor:pointer}
  .carousel__btn:hover{background:rgba(0,0,0,.6)}
  .carousel__btn:focus{outline:2px solid #fff;outline-offset:2px}
  .carousel__btn--prev{left:.5rem}
  .carousel__btn--next{right:.5rem}
  .carousel__dots{display:flex;gap:.4rem;justify-content:center;margin:.5rem 0 0}
  .carousel__dot{width:10px;height:10px;border-radius:50%;background:#bbb;border:0;cursor:pointer}
  .carousel__dot[aria-current="true"]{background:#333}
</style>

<div class="carousel" id="landscapes" aria-roledescription="carousel">
  <div class="carousel__track">
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="1 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Toronto_Skyline_Summer_2020.jpg?width=1600" alt="Toronto skyline with CN Tower" loading="lazy">
      <figcaption class="carousel__caption">Toronto</figcaption>
    </figure>
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="2 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Dubai_landscape_from_the_Burj_Khalifa_4.jpg?width=1600" alt="Dubai skyline from Burj Khalifa" loading="lazy">
      <figcaption class="carousel__caption">Dubai</figcaption>
    </figure>
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="3 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Cloud_Forest_at_Monteverde.JPG?width=1600" alt="Monteverde Cloud Forest canopy" loading="lazy">
      <figcaption class="carousel__caption">Monteverde</figcaption>
    </figure>
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="4 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=1600" alt="Eiffel Tower in Paris" loading="lazy">
      <figcaption class="carousel__caption">Paris</figcaption>
    </figure>
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="5 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Summit_of_Jungfrau_reveals_itself_from_the_clouds_in_2012_August.jpg?width=1600" alt="Jungfrau summit, Swiss Alps" loading="lazy">
      <figcaption class="carousel__caption">Jungfrau</figcaption>
    </figure>
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="6 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Taj-Mahal.jpg?width=1600" alt="Taj Mahal reflected in pool" loading="lazy">
      <figcaption class="carousel__caption">Taj Mahal</figcaption>
    </figure>
    <figure class="carousel__slide" aria-roledescription="slide" aria-label="7 of 7">
      <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Chichen_Itza_3.jpg?width=1600" alt="El Castillo pyramid at Chichén Itzá" loading="lazy">
      <figcaption class="carousel__caption">Chichén Itzá</figcaption>
    </figure>
  </div>

  <button class="carousel__btn carousel__btn--prev" aria-label="Previous slide" type="button">&#10094;</button>
  <button class="carousel__btn carousel__btn--next" aria-label="Next slide" type="button">&#10095;</button>
</div>

<div class="carousel__dots" data-for="landscapes" aria-label="Slide navigation"></div>

<script>
(function () {
  const root = document.getElementById('landscapes');
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(track.children);
  const prevBtn = root.querySelector('.carousel__btn--prev');
  const nextBtn = root.querySelector('.carousel__btn--next');
  const dotsWrap = document.querySelector('.carousel__dots[data-for="landscapes"]');

  let index = 0;
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'carousel__dot'; b.type = 'button';
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} of ${slides.length}`));
  }
  function go(i) { index = (i + slides.length) % slides.length; update(); }

  prevBtn.addEventListener('click', () => go(index - 1));
  nextBtn.addEventListener('click', () => go(index + 1));

  // Keyboard + swipe
  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (e) => { if (e.key==='ArrowLeft') go(index-1); if (e.key==='ArrowRight') go(index+1); });
  let startX=null;
  root.addEventListener('touchstart',(e)=>{startX=e.touches[0].clientX;},{passive:true});
  root.addEventListener('touchmove',(e)=>{ if(startX===null)return; const dx=e.touches[0].clientX-startX; if(Math.abs(dx)>40){ go(index+(dx<0?1:-1)); startX=null; }},{passive:true});

  update();
})();
</script>
