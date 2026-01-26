---
layout: default
title: Cricket Simulator
permalink: /cricket/
---

<style>
.cricket-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.scoreboard {
  background: linear-gradient(135deg, #1a472a, #2d5a3f);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.score {
  font-size: 3rem;
  font-weight: bold;
  margin: 10px 0;
}

.overs {
  font-size: 1.2rem;
  color: #90EE90;
}

.target-display {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  padding: 10px 20px;
  border-radius: 10px;
  display: inline-block;
  margin: 10px 0;
  font-weight: bold;
  color: white;
}

.phase-indicator {
  background: linear-gradient(135deg, #3498db, #2980b9);
  padding: 8px 20px;
  border-radius: 20px;
  display: inline-block;
  margin: 10px 0;
  font-weight: bold;
  color: white;
  font-size: 1.1rem;
}

.bank {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  padding: 10px 20px;
  border-radius: 10px;
  display: inline-block;
  margin: 10px 0;
  font-weight: bold;
  color: white;
}

.ball-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 20px 50px;
  font-size: 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin: 10px;
}

.ball-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.ball-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.bowling-controls {
  display: none;
  margin: 20px 0;
}

.bowling-controls.active {
  display: block;
}

.bowl-type-btn {
  padding: 15px 30px;
  font-size: 1.2rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin: 5px;
  transition: transform 0.2s, box-shadow 0.2s;
  color: white;
}

.bowl-type-btn:hover {
  transform: scale(1.05);
}

.bowl-type-btn.fast {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.bowl-type-btn.spin {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.bowl-type-btn.normal {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.bowl-type-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.bowl-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.bowl-stat {
  background: #2c3e50;
  padding: 8px 15px;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #ecf0f1;
}

.reset-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  margin: 10px;
}

.shop-btn {
  background: #9b59b6;
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  margin: 10px;
}

.result {
  font-size: 2rem;
  padding: 15px;
  margin: 15px 0;
  border-radius: 10px;
  font-weight: bold;
  min-height: 60px;
}

.commentary {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  min-height: 80px;
  font-style: italic;
}

.ball-history {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 15px 0;
}

.ball-history span {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.run-0 { background: #95a5a6; color: white; }
.run-1 { background: #3498db; color: white; }
.run-2 { background: #2ecc71; color: white; }
.run-3 { background: #9b59b6; color: white; }
.run-4 { background: #f39c12; color: white; }
.run-6 { background: #e74c3c; color: white; }
.wicket { background: #c0392b; color: white; }

.game-over {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-top: 20px;
}

.game-over.win {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.game-over.lose {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
}

/* Hero Shop Styles */
.shop-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  overflow-y: auto;
}

.shop-content {
  background: #1a1a2e;
  max-width: 700px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 20px;
  position: relative;
}

.close-shop {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 2rem;
  cursor: pointer;
  color: #fff;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.hero-card {
  background: linear-gradient(135deg, #16213e, #1a1a2e);
  border: 2px solid #0f3460;
  border-radius: 15px;
  padding: 15px;
  transition: transform 0.2s, border-color 0.2s;
}

.hero-card:hover {
  transform: translateY(-5px);
  border-color: #e94560;
}

.hero-card.owned {
  border-color: #2ecc71;
}

.hero-card.active {
  border-color: #f39c12;
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.4);
}

.hero-avatar {
  font-size: 3rem;
  margin-bottom: 10px;
}

.hero-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
}

.hero-tier {
  font-size: 0.9rem;
  font-weight: bold;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 8px;
}

.tier-S {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.tier-A {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: #fff;
}

.tier-B {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: #fff;
}

.tier-C {
  background: linear-gradient(135deg, #7f8c8d, #95a5a6);
  color: #fff;
}

.shop-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.shop-tab {
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s;
}

.shop-tab.batsman {
  background: #3498db;
  color: white;
}

.shop-tab.bowler {
  background: #e74c3c;
  color: white;
}

.shop-tab.active {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.shop-tab:not(.active) {
  opacity: 0.6;
}

.hero-type-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 5px;
}

.badge-batsman {
  background: #3498db;
  color: white;
}

.badge-bowler {
  background: #e74c3c;
  color: white;
}

.hero-country {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 10px;
}

.hero-ability {
  font-size: 0.85rem;
  color: #90EE90;
  margin-bottom: 10px;
  min-height: 40px;
}

.hero-price {
  font-size: 1rem;
  color: #f39c12;
  font-weight: bold;
}

.buy-btn {
  background: linear-gradient(135deg, #e94560, #c0392b);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: bold;
}

.buy-btn:disabled {
  background: #444;
  cursor: not-allowed;
}

.buy-btn.owned {
  background: #2ecc71;
}

.buy-btn.select {
  background: #3498db;
}

.active-hero {
  background: linear-gradient(135deg, #0f3460, #16213e);
  padding: 10px 20px;
  border-radius: 10px;
  margin: 10px 0;
  display: inline-block;
}

.active-hero span {
  color: #f39c12;
  font-weight: bold;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 10px 0;
  font-size: 0.9rem;
  color: #aaa;
}
</style>

<div class="cricket-container">
  <h2>🏏 Cricket Simulator</h2>

  <div class="bank">💵 Cash: $<span id="bank">0</span></div>

  <div class="phase-indicator" id="phaseIndicator">🏏 BATTING INNINGS</div>

  <div class="active-hero" id="activeHeroDisplay">
    🏏 Batsman: <span id="activeBatsmanName">None</span> | 🎳 Bowler: <span id="activeBowlerName">None</span>
  </div>

  <div class="target-display" id="targetDisplay" style="display: none;">
    🎯 Target: <span id="target">0</span>
  </div>

  <div class="scoreboard">
    <div>Wickets: <span id="wickets">0</span>/10</div>
    <div class="score"><span id="runs">0</span></div>
    <div class="overs">Overs: <span id="overs">0.0</span>/20</div>
  </div>

  <div class="stats-bar" id="battingStats">
    <span>⚠️ Wicket Rate: <span id="wicketRate">12</span>%</span>
    <span>🎯 Boundary Bonus: +<span id="boundaryBonus">0</span>%</span>
    <span>6️⃣ Six Bonus: +<span id="sixBonus">0</span>%</span>
  </div>

  <div class="stats-bar" id="bowlingStats" style="display: none;">
    <span>🎳 Wicket Bonus: +<span id="bowlWicketBonus">0</span>%</span>
    <span>🛡️ Boundary Block: -<span id="boundaryBlock">0</span>%</span>
    <span>🚫 Six Block: -<span id="sixBlock">0</span>%</span>
  </div>

  <div class="ball-history" id="ballHistory"></div>

  <div class="result" id="result"></div>

  <!-- Batting Controls -->
  <div id="battingControls">
    <button class="ball-btn" id="bowlBtn" onclick="bat()">🏏 Play!</button>
  </div>

  <!-- Bowling Controls -->
  <div class="bowling-controls" id="bowlingControls">
    <p style="color: #888; margin-bottom: 15px;">Choose your bowling type:</p>
    <div class="bowl-stats">
      <div class="bowl-stat">🔥 Fast: High wicket chance, but risky</div>
      <div class="bowl-stat">🌀 Spin: Balanced, fewer boundaries</div>
      <div class="bowl-stat">🎯 Normal: Safe, consistent</div>
    </div>
    <button class="bowl-type-btn fast" onclick="bowl('fast')">🔥 Fast</button>
    <button class="bowl-type-btn spin" onclick="bowl('spin')">🌀 Spin</button>
    <button class="bowl-type-btn normal" onclick="bowl('normal')">🎯 Normal</button>
  </div>

  <br>
  <button class="reset-btn" onclick="resetGame()">New Game</button>
  <button class="shop-btn" onclick="openShop()">🛒 Hero Shop</button>
  <button class="reset-btn" onclick="resetAllProgress()" style="background: #e74c3c;">🗑️ Reset All</button>

  <div class="commentary" id="commentary">Click "Play!" to start batting...</div>

  <div id="gameOver" class="game-over" style="display: none;">
    <h3 id="gameOverTitle">🏆 Match Complete!</h3>
    <p id="finalScore"></p>
    <p id="earnings"></p>
  </div>
</div>

<!-- Hero Shop Modal -->
<div class="shop-modal" id="shopModal">
  <div class="shop-content">
    <span class="close-shop" onclick="closeShop()">&times;</span>
    <h2>🏪 Hero Shop</h2>
    <p style="color: #888;">Buy legendary cricketers to enhance your game!</p>
    <p class="bank">💵 Cash: $<span id="shopBank">0</span></p>
    <div class="shop-tabs">
      <button class="shop-tab batsman active" onclick="switchShopTab('batsman')">🏏 Batsmen</button>
      <button class="shop-tab bowler" onclick="switchShopTab('bowler')">🎳 Bowlers</button>
    </div>
    <div class="hero-grid" id="heroGrid"></div>
  </div>
</div>

<script>
// Game State
let runs = 0;
let wickets = 0;
let balls = 0;
let ballHistory = [];
let bank = parseInt(localStorage.getItem('cricketBank')) || 0;
let ownedHeroes = JSON.parse(localStorage.getItem('cricketHeroes')) || [];
let activeBatsman = localStorage.getItem('cricketActiveBatsman') || null;
let activeBowler = localStorage.getItem('cricketActiveBowler') || null;
let currentShopTab = 'batsman';

// Match State
let gamePhase = 'batting'; // 'batting', 'bowling', 'finished'
let yourScore = 0;
let target = 0;
let opponentRuns = 0;
let opponentWickets = 0;
let opponentBalls = 0;

// Heroes Database - Legendary Batsmen (prices based on current status/legacy)
const batsmen = [
  // S-TIER (Legends / GOATs)
  {
    id: 'sachin',
    name: 'Sachin Tendulkar',
    country: '🇮🇳 India',
    avatar: '🏏',
    tier: 'S',
    price: 600,
    ability: 'God of Cricket: +6% boundary, -4% wicket rate',
    effect: { boundaryBonus: 6, wicketReduction: 4 }
  },
  {
    id: 'abd',
    name: 'AB de Villiers',
    country: '🇿🇦 South Africa',
    avatar: '🦸',
    tier: 'S',
    price: 450,
    ability: 'Mr. 360: +5% boundary & +5% six',
    effect: { boundaryBonus: 5, sixBonus: 5 }
  },
  // A-TIER (Elite / World Class)
  {
    id: 'kohli',
    name: 'Virat Kohli',
    country: '🇮🇳 India',
    avatar: '👑',
    tier: 'A',
    price: 400,
    ability: 'Chase Master: -4% wicket rate, +3% boundary',
    effect: { wicketReduction: 4, boundaryBonus: 3 }
  },
  {
    id: 'lara',
    name: 'Brian Lara',
    country: '🇯🇲 West Indies',
    avatar: '🎯',
    tier: 'A',
    price: 380,
    ability: 'Prince of Trinidad: -5% wicket rate, +4% boundary',
    effect: { wicketReduction: 5, boundaryBonus: 4 }
  },
  {
    id: 'dhoni',
    name: 'MS Dhoni',
    country: '🇮🇳 India',
    avatar: '🧤',
    tier: 'A',
    price: 350,
    ability: 'Finisher: -5% wicket rate',
    effect: { wicketReduction: 5 }
  },
  {
    id: 'rohit',
    name: 'Rohit Sharma',
    country: '🇮🇳 India',
    avatar: '🎩',
    tier: 'A',
    price: 320,
    ability: 'Hitman: +6% six, +3% boundary',
    effect: { sixBonus: 6, boundaryBonus: 3 }
  },
  // B-TIER (Very Good / Stars)
  {
    id: 'gayle',
    name: 'Chris Gayle',
    country: '🇯🇲 West Indies',
    avatar: '💪',
    tier: 'B',
    price: 300,
    ability: 'Universe Boss: +8% six chance',
    effect: { sixBonus: 8 }
  },
  {
    id: 'buttler',
    name: 'Jos Buttler',
    country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    avatar: '⚡',
    tier: 'B',
    price: 300,
    ability: 'Reverse Sweep King: +5% boundary, +4% six',
    effect: { boundaryBonus: 5, sixBonus: 4 }
  },
  {
    id: 'stokes',
    name: 'Ben Stokes',
    country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    avatar: '🦁',
    tier: 'B',
    price: 280,
    ability: 'Miracle Man: -5% wicket rate, +2% six',
    effect: { wicketReduction: 5, sixBonus: 2 }
  },
  {
    id: 'maxwell',
    name: 'Glenn Maxwell',
    country: '🇦🇺 Australia',
    avatar: '🌪️',
    tier: 'B',
    price: 220,
    ability: 'Big Show: +10% six chance',
    effect: { sixBonus: 10 }
  },
  // C-TIER (Good / Solid)
  {
    id: 'warner',
    name: 'David Warner',
    country: '🇦🇺 Australia',
    avatar: '🔥',
    tier: 'C',
    price: 200,
    ability: 'Bull: +5% boundary chance',
    effect: { boundaryBonus: 5 }
  },
  {
    id: 'babar',
    name: 'Babar Azam',
    country: '🇵🇰 Pakistan',
    avatar: '⭐',
    tier: 'C',
    price: 180,
    ability: 'Cover Drive King: +3% boundary, -2% wicket',
    effect: { boundaryBonus: 3, wicketReduction: 2 }
  }
];

// Bowlers Database - Legendary Bowlers
const bowlers = [
  // S-TIER (Legends / GOATs)
  {
    id: 'murali',
    name: 'Muttiah Muralitharan',
    country: '🇱🇰 Sri Lanka',
    avatar: '🌀',
    tier: 'S',
    price: 550,
    ability: 'Spin God: +8% wicket, -5% boundary conceded',
    effect: { wicketBonus: 8, boundaryReduction: 5 }
  },
  {
    id: 'mcgrath',
    name: 'Glenn McGrath',
    country: '🇦🇺 Australia',
    avatar: '🎯',
    tier: 'S',
    price: 500,
    ability: 'Line & Length: +6% wicket, -6% boundary conceded',
    effect: { wicketBonus: 6, boundaryReduction: 6 }
  },
  {
    id: 'bumrah',
    name: 'Jasprit Bumrah',
    country: '🇮🇳 India',
    avatar: '💥',
    tier: 'S',
    price: 520,
    ability: 'Yorker King: +7% wicket, -5% six conceded',
    effect: { wicketBonus: 7, sixReduction: 5 }
  },
  // A-TIER (Elite / World Class)
  {
    id: 'warne',
    name: 'Shane Warne',
    country: '🇦🇺 Australia',
    avatar: '🧙',
    tier: 'A',
    price: 400,
    ability: 'Spin Wizard: +7% wicket with spin bowling',
    effect: { wicketBonus: 7 }
  },
  {
    id: 'wasim',
    name: 'Wasim Akram',
    country: '🇵🇰 Pakistan',
    avatar: '⚡',
    tier: 'A',
    price: 380,
    ability: 'Sultan of Swing: +5% wicket, -3% boundary',
    effect: { wicketBonus: 5, boundaryReduction: 3 }
  },
  {
    id: 'starc',
    name: 'Mitchell Starc',
    country: '🇦🇺 Australia',
    avatar: '🔥',
    tier: 'A',
    price: 350,
    ability: 'Left-arm Thunder: +5% wicket with fast',
    effect: { wicketBonus: 5 }
  },
  // B-TIER (Very Good / Stars)
  {
    id: 'rashid',
    name: 'Rashid Khan',
    country: '🇦🇫 Afghanistan',
    avatar: '🌪️',
    tier: 'B',
    price: 300,
    ability: 'Mystery Spinner: +5% wicket, -4% six',
    effect: { wicketBonus: 5, sixReduction: 4 }
  },
  {
    id: 'rabada',
    name: 'Kagiso Rabada',
    country: '🇿🇦 South Africa',
    avatar: '🏹',
    tier: 'B',
    price: 280,
    ability: 'KG Fire: +4% wicket, -3% boundary',
    effect: { wicketBonus: 4, boundaryReduction: 3 }
  },
  {
    id: 'anderson',
    name: 'James Anderson',
    country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    avatar: '☁️',
    tier: 'B',
    price: 260,
    ability: 'Swing King: +4% wicket, -4% boundary',
    effect: { wicketBonus: 4, boundaryReduction: 4 }
  },
  {
    id: 'ashwin',
    name: 'Ravichandran Ashwin',
    country: '🇮🇳 India',
    avatar: '🧠',
    tier: 'B',
    price: 240,
    ability: 'Chess Master: +4% wicket with spin',
    effect: { wicketBonus: 4 }
  },
  // C-TIER (Good / Solid)
  {
    id: 'archer',
    name: 'Jofra Archer',
    country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
    avatar: '🏃',
    tier: 'C',
    price: 200,
    ability: 'Express Pace: +3% wicket with fast',
    effect: { wicketBonus: 3 }
  },
  {
    id: 'shaheen',
    name: 'Shaheen Afridi',
    country: '🇵🇰 Pakistan',
    avatar: '🦅',
    tier: 'C',
    price: 180,
    ability: 'Young Gun: +3% wicket, -2% boundary',
    effect: { wicketBonus: 3, boundaryReduction: 2 }
  }
];

// Base outcomes for batting (higher wicket rate - 12%)
const baseOutcomes = {
  dot: 20,
  single: 28,
  double: 18,
  triple: 4,
  four: 10,
  six: 4,
  wicket: 12
};

// Bowling type outcomes
const bowlingTypes = {
  fast: {
    name: 'Fast',
    outcomes: { dot: 22, single: 20, double: 12, triple: 2, four: 15, six: 10, wicket: 18 },
    commentary: {
      wicket: ["BOWLED HIM! Pace too hot!", "Caught behind! The speedster strikes!", "Clean bowled! Lightning fast!"],
      boundary: ["Edged for four!", "Pulled away!", "Cut shot races away!"],
      dot: ["Quick delivery, defended.", "Beaten by pace!", "Good length, no run."]
    }
  },
  spin: {
    name: 'Spin',
    outcomes: { dot: 28, single: 25, double: 15, triple: 3, four: 8, six: 5, wicket: 14 },
    commentary: {
      wicket: ["STUMPED! Deceived by flight!", "LBW! Trapped in front!", "Caught at slip! Turn did it!"],
      boundary: ["Swept away!", "Driven down the ground!", "Slog sweep for four!"],
      dot: ["Turn and bounce!", "Left alone wisely.", "Defended off the back foot."]
    }
  },
  normal: {
    name: 'Normal',
    outcomes: { dot: 25, single: 28, double: 18, triple: 4, four: 10, six: 4, wicket: 10 },
    commentary: {
      wicket: ["Got him! Good bowling!", "Caught at mid-off!", "Bowled through the gate!"],
      boundary: ["Driven beautifully!", "Flicked for four!", "Cut past point!"],
      dot: ["Good line and length.", "Defended solidly.", "Left alone outside off."]
    }
  }
};

const battingCommentaries = {
  0: ["Defended well.", "No run there.", "Solid defense.", "Left alone outside off."],
  1: ["Pushed for a single.", "Quick running!", "Rotates the strike.", "Smart cricket."],
  2: ["Good running between the wickets!", "Two runs added.", "Excellent placement."],
  3: ["Three runs! Misfield!", "Running hard for three!", "Good running!"],
  4: ["Crashes through covers!", "Swept away for four!", "Cut shot, boundary!", "Driven beautifully!"],
  6: ["Into the stands!", "Maximum!", "What a shot!", "That's out of the ground!"],
  'W': ["Clean bowled!", "Caught behind!", "LBW! Plumb in front!", "Caught at slip!", "Edged and gone!"]
};

function getBattingOutcomes() {
  let outcomes = { ...baseOutcomes };

  if (activeBatsman) {
    const hero = batsmen.find(h => h.id === activeBatsman);
    if (hero && hero.effect) {
      if (hero.effect.wicketReduction) {
        outcomes.wicket -= hero.effect.wicketReduction;
        outcomes.single += hero.effect.wicketReduction;
      }
      if (hero.effect.boundaryBonus) {
        outcomes.four += hero.effect.boundaryBonus;
        outcomes.dot -= hero.effect.boundaryBonus;
      }
      if (hero.effect.sixBonus) {
        outcomes.six += hero.effect.sixBonus;
        outcomes.dot -= hero.effect.sixBonus;
      }
    }
  }

  return [
    { result: 0, weight: outcomes.dot },
    { result: 1, weight: outcomes.single },
    { result: 2, weight: outcomes.double },
    { result: 3, weight: outcomes.triple },
    { result: 4, weight: outcomes.four },
    { result: 6, weight: outcomes.six },
    { result: 'W', weight: outcomes.wicket }
  ];
}

function getBowlingOutcomes(baseOutcomes) {
  let outcomes = { ...baseOutcomes };

  if (activeBowler) {
    const hero = bowlers.find(h => h.id === activeBowler);
    if (hero && hero.effect) {
      if (hero.effect.wicketBonus) {
        outcomes.wicket += hero.effect.wicketBonus;
        outcomes.single -= Math.floor(hero.effect.wicketBonus / 2);
        outcomes.dot -= Math.ceil(hero.effect.wicketBonus / 2);
      }
      if (hero.effect.boundaryReduction) {
        outcomes.four -= hero.effect.boundaryReduction;
        outcomes.dot += hero.effect.boundaryReduction;
      }
      if (hero.effect.sixReduction) {
        outcomes.six -= hero.effect.sixReduction;
        outcomes.dot += hero.effect.sixReduction;
      }
    }
  }

  return outcomes;
}

function getRandomOutcome(outcomesArray) {
  const totalWeight = outcomesArray.reduce((sum, o) => sum + o.weight, 0);
  let random = Math.random() * totalWeight;

  for (let outcome of outcomesArray) {
    random -= outcome.weight;
    if (random <= 0) return outcome;
  }
  return outcomesArray[0];
}

// BATTING PHASE
function bat() {
  if (gamePhase !== 'batting' || wickets >= 10 || balls >= 120) return;

  const outcomes = getBattingOutcomes();
  const outcome = getRandomOutcome(outcomes);
  balls++;

  if (outcome.result === 'W') {
    wickets++;
    ballHistory.push('W');
  } else {
    runs += outcome.result;
    ballHistory.push(outcome.result);
  }

  updateBattingDisplay(outcome);

  if (wickets >= 10 || balls >= 120) {
    endBattingInnings();
  }
}

function updateBattingDisplay(outcome) {
  document.getElementById('runs').textContent = runs;
  document.getElementById('wickets').textContent = wickets;
  document.getElementById('overs').textContent = formatOvers(balls);

  const resultDiv = document.getElementById('result');
  if (outcome.result === 'W') {
    resultDiv.textContent = "OUT!";
    resultDiv.style.background = "#c0392b";
    resultDiv.style.color = "white";
  } else if (outcome.result >= 4) {
    resultDiv.textContent = outcome.result === 6 ? "SIX!" : "FOUR!";
    resultDiv.style.background = outcome.result === 6 ? "#e74c3c" : "#f39c12";
    resultDiv.style.color = "white";
  } else {
    resultDiv.textContent = outcome.result + " run" + (outcome.result !== 1 ? "s" : "");
    resultDiv.style.background = "#2ecc71";
    resultDiv.style.color = "white";
  }

  const commArray = battingCommentaries[outcome.result];
  document.getElementById('commentary').textContent = commArray[Math.floor(Math.random() * commArray.length)];

  renderBallHistory();
  updateStats();
}

function endBattingInnings() {
  yourScore = runs;
  target = runs + 1;

  document.getElementById('commentary').textContent = `Innings over! You scored ${runs}/${wickets}. Now defend ${target} runs!`;

  setTimeout(() => {
    startBowlingPhase();
  }, 2000);
}

// BOWLING PHASE
function startBowlingPhase() {
  gamePhase = 'bowling';

  // Reset for opponent innings
  opponentRuns = 0;
  opponentWickets = 0;
  opponentBalls = 0;
  ballHistory = [];

  // Update UI
  document.getElementById('phaseIndicator').textContent = '🎳 BOWLING INNINGS';
  document.getElementById('phaseIndicator').style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
  document.getElementById('targetDisplay').style.display = 'inline-block';
  document.getElementById('target').textContent = target;
  document.getElementById('battingStats').style.display = 'none';
  document.getElementById('bowlingStats').style.display = 'flex';
  updateBowlingStats();

  document.getElementById('battingControls').style.display = 'none';
  document.getElementById('bowlingControls').classList.add('active');

  document.getElementById('runs').textContent = '0';
  document.getElementById('wickets').textContent = '0';
  document.getElementById('overs').textContent = '0.0';
  document.getElementById('result').textContent = '';
  document.getElementById('result').style.background = 'transparent';
  document.getElementById('ballHistory').innerHTML = '';

  document.getElementById('commentary').textContent = 'Choose your bowling type to defend your total!';
}

function bowl(type) {
  if (gamePhase !== 'bowling' || opponentWickets >= 10 || opponentBalls >= 120) return;

  const bowlType = bowlingTypes[type];
  const modifiedOutcomes = getBowlingOutcomes(bowlType.outcomes);
  const outcomes = [
    { result: 0, weight: modifiedOutcomes.dot },
    { result: 1, weight: modifiedOutcomes.single },
    { result: 2, weight: modifiedOutcomes.double },
    { result: 3, weight: modifiedOutcomes.triple },
    { result: 4, weight: modifiedOutcomes.four },
    { result: 6, weight: modifiedOutcomes.six },
    { result: 'W', weight: modifiedOutcomes.wicket }
  ];

  const outcome = getRandomOutcome(outcomes);
  opponentBalls++;

  if (outcome.result === 'W') {
    opponentWickets++;
    ballHistory.push('W');
  } else {
    opponentRuns += outcome.result;
    ballHistory.push(outcome.result);
  }

  updateBowlingDisplay(outcome, bowlType);

  // Check win/lose conditions
  if (opponentRuns >= target) {
    endMatch(false); // You lose
  } else if (opponentWickets >= 10 || opponentBalls >= 120) {
    endMatch(true); // You win
  }
}

function updateBowlingDisplay(outcome, bowlType) {
  document.getElementById('runs').textContent = opponentRuns;
  document.getElementById('wickets').textContent = opponentWickets;
  document.getElementById('overs').textContent = formatOvers(opponentBalls);

  const resultDiv = document.getElementById('result');
  if (outcome.result === 'W') {
    resultDiv.textContent = "WICKET!";
    resultDiv.style.background = "#27ae60";
    resultDiv.style.color = "white";
  } else if (outcome.result >= 4) {
    resultDiv.textContent = outcome.result === 6 ? "SIX..." : "FOUR...";
    resultDiv.style.background = "#e74c3c";
    resultDiv.style.color = "white";
  } else {
    resultDiv.textContent = outcome.result + " run" + (outcome.result !== 1 ? "s" : "");
    resultDiv.style.background = outcome.result === 0 ? "#27ae60" : "#f39c12";
    resultDiv.style.color = "white";
  }

  // Commentary based on bowling type
  let commArray;
  if (outcome.result === 'W') {
    commArray = bowlType.commentary.wicket;
  } else if (outcome.result >= 4) {
    commArray = bowlType.commentary.boundary;
  } else {
    commArray = bowlType.commentary.dot;
  }
  document.getElementById('commentary').textContent = commArray[Math.floor(Math.random() * commArray.length)];

  renderBallHistory();

  // Show runs needed
  const runsNeeded = target - opponentRuns;
  if (runsNeeded > 0) {
    document.getElementById('target').textContent = `${target} (Need ${runsNeeded})`;
  }
}

function endMatch(didWin) {
  gamePhase = 'finished';

  // Disable bowling buttons
  document.querySelectorAll('.bowl-type-btn').forEach(btn => btn.disabled = true);

  const gameOverDiv = document.getElementById('gameOver');
  const titleEl = document.getElementById('gameOverTitle');
  const finalScoreEl = document.getElementById('finalScore');
  const earningsEl = document.getElementById('earnings');

  gameOverDiv.classList.remove('win', 'lose');

  let earnings = 0;

  if (didWin) {
    const margin = target - 1 - opponentRuns;
    // Big cash reward for winning: base + score bonus + margin bonus
    earnings = 100 + Math.floor(yourScore * 1.5) + (margin * 2);
    if (opponentWickets >= 10) {
      earnings += 50; // Bonus for bowling them all out
    }
    titleEl.textContent = '🏆 YOU WON!';
    finalScoreEl.textContent = `You: ${yourScore} | Opponent: ${opponentRuns}/${opponentWickets}`;
    if (opponentWickets >= 10) {
      finalScoreEl.textContent += ` (All out!)`;
    } else {
      finalScoreEl.textContent += ` (Won by ${margin} runs)`;
    }
    gameOverDiv.classList.add('win');
  } else {
    // Small consolation cash for losing
    earnings = 10 + Math.floor(yourScore * 0.1);
    titleEl.textContent = '😢 YOU LOST!';
    finalScoreEl.textContent = `You: ${yourScore} | Opponent: ${opponentRuns}/${opponentWickets}`;
    const wicketsRemaining = 10 - opponentWickets;
    finalScoreEl.textContent += ` (Lost by ${wicketsRemaining} wickets)`;
    gameOverDiv.classList.add('lose');
  }

  bank += earnings;
  localStorage.setItem('cricketBank', bank);
  earningsEl.textContent = `+$${earnings} earned!${didWin ? ' 💰 Big win bonus!' : ' (consolation)'}`;
  updateBank();

  gameOverDiv.style.display = 'block';
}

function renderBallHistory() {
  const container = document.getElementById('ballHistory');
  container.innerHTML = ballHistory.slice(-12).map(b => {
    const cls = b === 'W' ? 'wicket' : 'run-' + b;
    return `<span class="${cls}">${b}</span>`;
  }).join('');
}

function formatOvers(balls) {
  return Math.floor(balls / 6) + '.' + (balls % 6);
}

function resetGame() {
  // Reset all state
  runs = 0;
  wickets = 0;
  balls = 0;
  ballHistory = [];
  gamePhase = 'batting';
  yourScore = 0;
  target = 0;
  opponentRuns = 0;
  opponentWickets = 0;
  opponentBalls = 0;

  // Reset UI
  document.getElementById('runs').textContent = '0';
  document.getElementById('wickets').textContent = '0';
  document.getElementById('overs').textContent = '0.0';
  document.getElementById('result').textContent = '';
  document.getElementById('result').style.background = 'transparent';
  document.getElementById('commentary').textContent = 'Click "Play!" to start batting...';
  document.getElementById('ballHistory').innerHTML = '';
  document.getElementById('gameOver').style.display = 'none';
  document.getElementById('gameOver').classList.remove('win', 'lose');

  document.getElementById('phaseIndicator').textContent = '🏏 BATTING INNINGS';
  document.getElementById('phaseIndicator').style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
  document.getElementById('targetDisplay').style.display = 'none';
  document.getElementById('battingStats').style.display = 'flex';
  document.getElementById('bowlingStats').style.display = 'none';

  document.getElementById('battingControls').style.display = 'block';
  document.getElementById('bowlingControls').classList.remove('active');
  document.querySelectorAll('.bowl-type-btn').forEach(btn => btn.disabled = false);

  document.getElementById('bowlBtn').disabled = false;
  updateStats();
}

function updateBank() {
  document.getElementById('bank').textContent = bank;
  document.getElementById('shopBank').textContent = bank;
}

function updateStats() {
  // Batting stats
  const outcomes = getBattingOutcomes();
  const wicketOutcome = outcomes.find(o => o.result === 'W');
  const fourOutcome = outcomes.find(o => o.result === 4);
  const sixOutcome = outcomes.find(o => o.result === 6);

  document.getElementById('wicketRate').textContent = wicketOutcome.weight;
  document.getElementById('boundaryBonus').textContent = fourOutcome.weight - baseOutcomes.four;
  document.getElementById('sixBonus').textContent = sixOutcome.weight - baseOutcomes.six;

  // Bowling stats
  updateBowlingStats();
}

function updateBowlingStats() {
  let wicketBonus = 0;
  let boundaryBlock = 0;
  let sixBlock = 0;

  if (activeBowler) {
    const hero = bowlers.find(h => h.id === activeBowler);
    if (hero && hero.effect) {
      wicketBonus = hero.effect.wicketBonus || 0;
      boundaryBlock = hero.effect.boundaryReduction || 0;
      sixBlock = hero.effect.sixReduction || 0;
    }
  }

  document.getElementById('bowlWicketBonus').textContent = wicketBonus;
  document.getElementById('boundaryBlock').textContent = boundaryBlock;
  document.getElementById('sixBlock').textContent = sixBlock;
}

function updateActiveHeroDisplay() {
  const batsmanEl = document.getElementById('activeBatsmanName');
  const bowlerEl = document.getElementById('activeBowlerName');

  if (activeBatsman) {
    const hero = batsmen.find(h => h.id === activeBatsman);
    batsmanEl.textContent = hero ? hero.name : 'None';
  } else {
    batsmanEl.textContent = 'None';
  }

  if (activeBowler) {
    const hero = bowlers.find(h => h.id === activeBowler);
    bowlerEl.textContent = hero ? hero.name : 'None';
  } else {
    bowlerEl.textContent = 'None';
  }
}

// Shop Functions
function openShop() {
  document.getElementById('shopModal').style.display = 'block';
  renderHeroGrid();
}

function closeShop() {
  document.getElementById('shopModal').style.display = 'none';
}

function switchShopTab(tab) {
  currentShopTab = tab;
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.shop-tab.${tab}`).classList.add('active');
  renderHeroGrid();
}

function renderHeroGrid() {
  const grid = document.getElementById('heroGrid');
  const heroList = currentShopTab === 'batsman' ? batsmen : bowlers;
  const activeHero = currentShopTab === 'batsman' ? activeBatsman : activeBowler;

  grid.innerHTML = heroList.map(hero => {
    const owned = ownedHeroes.includes(hero.id);
    const isActive = activeHero === hero.id;

    let btnText = `Buy ($${hero.price})`;
    let btnClass = '';
    let btnDisabled = bank < hero.price;

    if (owned) {
      btnText = isActive ? '✓ Active' : 'Select';
      btnClass = isActive ? 'owned' : 'select';
      btnDisabled = isActive;
    }

    return `
      <div class="hero-card ${owned ? 'owned' : ''} ${isActive ? 'active' : ''}">
        <div class="hero-tier tier-${hero.tier}">${hero.tier}-TIER</div>
        <div class="hero-avatar">${hero.avatar}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-country">${hero.country}</div>
        <div class="hero-ability">${hero.ability}</div>
        ${!owned ? `<div class="hero-price">💵 $${hero.price}</div>` : ''}
        <button class="buy-btn ${btnClass}"
                onclick="${owned ? `selectHero('${hero.id}', '${currentShopTab}')` : `buyHero('${hero.id}', '${currentShopTab}')`}"
                ${btnDisabled ? 'disabled' : ''}>
          ${btnText}
        </button>
      </div>
    `;
  }).join('');
}

function buyHero(heroId, type) {
  const heroList = type === 'batsman' ? batsmen : bowlers;
  const hero = heroList.find(h => h.id === heroId);
  if (!hero || bank < hero.price || ownedHeroes.includes(heroId)) return;

  bank -= hero.price;
  ownedHeroes.push(heroId);

  localStorage.setItem('cricketBank', bank);
  localStorage.setItem('cricketHeroes', JSON.stringify(ownedHeroes));

  updateBank();
  renderHeroGrid();
}

function selectHero(heroId, type) {
  if (!ownedHeroes.includes(heroId)) return;

  if (type === 'batsman') {
    activeBatsman = heroId;
    localStorage.setItem('cricketActiveBatsman', heroId);
  } else {
    activeBowler = heroId;
    localStorage.setItem('cricketActiveBowler', heroId);
  }

  updateActiveHeroDisplay();
  updateStats();
  renderHeroGrid();
}

function resetAllProgress() {
  if (!confirm('Are you sure? This will reset your cash, owned heroes, and all progress!')) return;

  bank = 0;
  ownedHeroes = [];
  activeBatsman = null;
  activeBowler = null;

  localStorage.removeItem('cricketBank');
  localStorage.removeItem('cricketHeroes');
  localStorage.removeItem('cricketActiveBatsman');
  localStorage.removeItem('cricketActiveBowler');

  updateBank();
  updateActiveHeroDisplay();
  updateStats();
  resetGame();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  updateBank();
  updateActiveHeroDisplay();
  updateStats();
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('shopModal');
  if (event.target === modal) {
    closeShop();
  }
}
</script>
