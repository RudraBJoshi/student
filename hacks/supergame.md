---
layout: default
permalink: /rpg
title: Rune Warriors RPG
---

<style>
    .rpg-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        min-height: 100vh;
        color: #fff;
    }

    .game-header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .game-header h1 {
        margin: 0;
        font-size: 2.5em;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .game-header .stage-info {
        font-size: 1.2em;
        margin-top: 10px;
        opacity: 0.9;
    }

    .main-content {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 20px;
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .panel {
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
    }

    .panel h3 {
        margin: 0 0 15px 0;
        color: #ffd700;
        border-bottom: 2px solid #ffd700;
        padding-bottom: 10px;
    }

    .stat-bar {
        margin: 10px 0;
    }

    .stat-bar label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 0.9em;
    }

    .bar-container {
        height: 20px;
        background: rgba(0,0,0,0.3);
        border-radius: 10px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
    }

    .hp-bar { background: linear-gradient(90deg, #ff6b6b, #ee5a5a); }
    .mp-bar { background: linear-gradient(90deg, #4facfe, #00f2fe); }
    .xp-bar { background: linear-gradient(90deg, #f093fb, #f5576c); }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        font-size: 0.9em;
    }

    .stat-item {
        background: rgba(0,0,0,0.2);
        padding: 8px 12px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
    }

    .rune-slots {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 10px;
    }

    .rune-slot {
        aspect-ratio: 1;
        background: rgba(0,0,0,0.3);
        border-radius: 10px;
        border: 2px dashed rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .rune-slot:hover {
        border-color: #ffd700;
        transform: scale(1.05);
    }

    .rune-slot.equipped {
        border: 2px solid #ffd700;
        background: rgba(255,215,0,0.2);
    }

    .rune {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .rune:hover {
        transform: scale(1.1);
    }

    .rune.common { background: linear-gradient(135deg, #808080, #a0a0a0); }
    .rune.uncommon { background: linear-gradient(135deg, #2ecc71, #27ae60); }
    .rune.rare { background: linear-gradient(135deg, #3498db, #2980b9); }
    .rune.epic { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
    .rune.legendary { background: linear-gradient(135deg, #f39c12, #e74c3c); box-shadow: 0 0 20px rgba(243, 156, 18, 0.5); }

    .rune-inventory {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        max-height: 200px;
        overflow-y: auto;
        padding: 10px;
        background: rgba(0,0,0,0.2);
        border-radius: 10px;
    }

    .battle-arena {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .arena-display {
        background: radial-gradient(circle, #2a2a4e 0%, #1a1a2e 100%);
        border-radius: 15px;
        padding: 30px;
        min-height: 300px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 2px solid rgba(255,255,255,0.1);
    }

    .combatant {
        text-align: center;
        padding: 20px;
    }

    .combatant-sprite {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 4em;
        margin: 0 auto 15px;
        transition: all 0.3s ease;
    }

    .player-sprite {
        background: linear-gradient(135deg, #667eea, #764ba2);
        box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
    }

    .enemy-sprite {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        box-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
    }

    .combatant-name {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .combatant-hp {
        width: 150px;
        margin: 0 auto;
    }

    .vs-text {
        font-size: 2em;
        font-weight: bold;
        color: #ffd700;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .battle-log {
        background: rgba(0,0,0,0.3);
        border-radius: 10px;
        padding: 15px;
        max-height: 150px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 0.9em;
    }

    .battle-log p {
        margin: 5px 0;
        padding: 5px;
        border-radius: 5px;
    }

    .log-player { background: rgba(102, 126, 234, 0.2); }
    .log-enemy { background: rgba(231, 76, 60, 0.2); }
    .log-system { background: rgba(255, 215, 0, 0.2); color: #ffd700; }

    .action-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }

    .action-btn {
        padding: 15px 20px;
        border: none;
        border-radius: 10px;
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        color: white;
    }

    .action-btn:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-attack { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .btn-skill { background: linear-gradient(135deg, #3498db, #2980b9); }
    .btn-defend { background: linear-gradient(135deg, #27ae60, #2ecc71); }
    .btn-heal { background: linear-gradient(135deg, #f39c12, #e67e22); }

    .damage-popup {
        position: absolute;
        font-size: 2em;
        font-weight: bold;
        animation: damageFloat 1s ease-out forwards;
        pointer-events: none;
    }

    @keyframes damageFloat {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-50px); }
    }

    .damage-player { color: #ff6b6b; }
    .damage-enemy { color: #ffd700; }
    .damage-heal { color: #2ecc71; }

    .shake { animation: shake 0.3s ease-in-out; }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }

    .overlay-screen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .overlay-screen.hidden { display: none; }

    .overlay-screen h2 { font-size: 3em; margin-bottom: 20px; }
    .victory-title { color: #ffd700; }
    .defeat-title { color: #e74c3c; }
    .start-title { color: #667eea; }

    .reward-box {
        background: rgba(255,255,255,0.1);
        padding: 30px;
        border-radius: 15px;
        margin: 20px 0;
        text-align: center;
    }

    .continue-btn {
        padding: 15px 40px;
        font-size: 1.2em;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .continue-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
    }

    .game-complete h1 {
        font-size: 3em;
        color: #ffd700;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    }

    @media (max-width: 768px) {
        .main-content {
            grid-template-columns: 1fr;
        }
        .action-buttons {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>

<div class="rpg-container" id="game">
    <div class="overlay-screen" id="start-screen">
        <h2 class="start-title">Rune Warriors</h2>
        <p style="font-size: 1.2em; margin: 20px 0; opacity: 0.8;">Collect runes, grow stronger, conquer 30 stages!</p>
        <button class="continue-btn" onclick="startGame()">Begin Adventure</button>
    </div>

    <div class="game-header">
        <h1>Rune Warriors</h1>
        <div class="stage-info">Stage <span id="current-stage">1</span> / 30</div>
    </div>

    <div class="main-content">
        <div class="sidebar">
            <div class="panel">
                <h3>Hero Stats</h3>
                <div class="stat-bar">
                    <label><span>HP</span><span id="hp-text">100/100</span></label>
                    <div class="bar-container">
                        <div class="bar-fill hp-bar" id="hp-bar" style="width: 100%"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <label><span>MP</span><span id="mp-text">50/50</span></label>
                    <div class="bar-container">
                        <div class="bar-fill mp-bar" id="mp-bar" style="width: 100%"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <label><span>EXP</span><span id="xp-text">0/100</span></label>
                    <div class="bar-container">
                        <div class="bar-fill xp-bar" id="xp-bar" style="width: 0%"></div>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item"><span>Level</span><span id="level">1</span></div>
                    <div class="stat-item"><span>ATK</span><span id="atk">10</span></div>
                    <div class="stat-item"><span>DEF</span><span id="def">5</span></div>
                    <div class="stat-item"><span>Gold</span><span id="gold">0</span></div>
                </div>
            </div>

            <div class="panel">
                <h3>Equipped Runes (Click to unequip)</h3>
                <div class="rune-slots" id="equipped-runes">
                    <div class="rune-slot" data-slot="0" onclick="unequipRune(0)"></div>
                    <div class="rune-slot" data-slot="1" onclick="unequipRune(1)"></div>
                    <div class="rune-slot" data-slot="2" onclick="unequipRune(2)"></div>
                    <div class="rune-slot" data-slot="3" onclick="unequipRune(3)"></div>
                    <div class="rune-slot" data-slot="4" onclick="unequipRune(4)"></div>
                    <div class="rune-slot" data-slot="5" onclick="unequipRune(5)"></div>
                </div>
            </div>

            <div class="panel">
                <h3>Rune Inventory (Click to equip)</h3>
                <div class="rune-inventory" id="rune-inventory"></div>
            </div>
        </div>

        <div class="battle-arena">
            <div class="arena-display">
                <div class="combatant player">
                    <div class="combatant-sprite player-sprite" id="player-sprite">&#9876;</div>
                    <div class="combatant-name">Hero</div>
                    <div class="combatant-hp">
                        <div class="bar-container">
                            <div class="bar-fill hp-bar" id="player-battle-hp" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
                <div class="vs-text">VS</div>
                <div class="combatant enemy">
                    <div class="combatant-sprite enemy-sprite" id="enemy-sprite">&#128126;</div>
                    <div class="combatant-name" id="enemy-name">Slime</div>
                    <div class="combatant-hp">
                        <div class="bar-container">
                            <div class="bar-fill hp-bar" id="enemy-battle-hp" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="battle-log" id="battle-log">
                <p class="log-system">Prepare for battle!</p>
            </div>

            <div class="action-buttons">
                <button class="action-btn btn-attack" onclick="playerAction('attack')">Attack</button>
                <button class="action-btn btn-skill" onclick="playerAction('skill')">Skill (15 MP)</button>
                <button class="action-btn btn-defend" onclick="playerAction('defend')">Defend</button>
                <button class="action-btn btn-heal" onclick="playerAction('heal')">Heal (20 MP)</button>
            </div>
        </div>
    </div>

    <div class="overlay-screen hidden" id="victory-screen">
        <h2 class="victory-title">Victory!</h2>
        <div class="reward-box">
            <p>Stage <span id="victory-stage">1</span> Complete!</p>
            <p style="color: #ffd700; font-size: 1.5em;" id="reward-text">+50 Gold, +30 EXP</p>
            <div id="rune-reward" style="margin-top: 20px;"></div>
        </div>
        <button class="continue-btn" onclick="nextStage()">Continue</button>
    </div>

    <div class="overlay-screen hidden" id="defeat-screen">
        <h2 class="defeat-title">Defeated!</h2>
        <div class="reward-box">
            <p>You have fallen at Stage <span id="defeat-stage">1</span></p>
            <p style="opacity: 0.7;">Don't give up! Equip better runes and try again.</p>
        </div>
        <button class="continue-btn" onclick="retryStage()">Retry</button>
    </div>

    <div class="overlay-screen hidden" id="complete-screen">
        <div style="text-align: center;">
            <h1 style="font-size: 3em; color: #ffd700; text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);">Congratulations!</h1>
            <p style="font-size: 1.5em; margin: 20px 0;">You have conquered all 30 stages!</p>
            <p style="color: #ffd700; font-size: 1.2em;">You are a true Rune Warrior!</p>
            <div style="margin-top: 30px;">
                <p>Final Stats:</p>
                <p id="final-stats"></p>
            </div>
            <button class="continue-btn" onclick="resetGame()" style="margin-top: 30px;">Play Again</button>
        </div>
    </div>
</div>

<script>
(function() {
    var gameState = {
        stage: 1,
        player: {
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            xp: 0,
            xpToLevel: 100,
            atk: 10,
            def: 5,
            gold: 0,
            equippedRunes: [null, null, null, null, null, null],
            inventory: []
        },
        enemy: null,
        inBattle: false,
        defending: false,
        playerActing: false
    };

    var runeTypes = [
        { name: 'Power', icon: '&#9733;', stat: 'atk', color: 'common' },
        { name: 'Shield', icon: '&#9632;', stat: 'def', color: 'common' },
        { name: 'Vitality', icon: '&#9829;', stat: 'maxHp', color: 'common' },
        { name: 'Wisdom', icon: '&#9670;', stat: 'maxMp', color: 'uncommon' },
        { name: 'Fury', icon: '&#9876;', stat: 'atk', color: 'uncommon' },
        { name: 'Fortress', icon: '&#9670;', stat: 'def', color: 'rare' },
        { name: 'Dragon', icon: '&#128009;', stat: 'atk', color: 'rare' },
        { name: 'Phoenix', icon: '&#128293;', stat: 'maxHp', color: 'epic' },
        { name: 'Titan', icon: '&#9889;', stat: 'atk', color: 'epic' },
        { name: 'Godslayer', icon: '&#128081;', stat: 'atk', color: 'legendary' }
    ];

    var enemies = [
        { name: 'Slime', icon: '&#128126;', hpMult: 1, atkMult: 1 },
        { name: 'Goblin', icon: '&#128127;', hpMult: 1.2, atkMult: 1.1 },
        { name: 'Wolf', icon: '&#128058;', hpMult: 1.3, atkMult: 1.2 },
        { name: 'Orc', icon: '&#128128;', hpMult: 1.5, atkMult: 1.3 },
        { name: 'Skeleton', icon: '&#128128;', hpMult: 1.6, atkMult: 1.4 },
        { name: 'Ghost', icon: '&#128123;', hpMult: 1.4, atkMult: 1.5 },
        { name: 'Troll', icon: '&#129430;', hpMult: 2, atkMult: 1.5 },
        { name: 'Vampire', icon: '&#129499;', hpMult: 1.8, atkMult: 1.7 },
        { name: 'Golem', icon: '&#129302;', hpMult: 2.5, atkMult: 1.6 },
        { name: 'Dragon', icon: '&#128009;', hpMult: 3, atkMult: 2 }
    ];

    function initBattle() {
        var stage = gameState.stage;
        var enemyIndex = Math.min(Math.floor((stage - 1) / 3), enemies.length - 1);
        var enemyTemplate = enemies[enemyIndex];
        var baseHp = 50 + stage * 20;
        var baseAtk = 5 + stage * 3;

        gameState.enemy = {
            name: enemyTemplate.name,
            icon: enemyTemplate.icon,
            hp: Math.floor(baseHp * enemyTemplate.hpMult),
            maxHp: Math.floor(baseHp * enemyTemplate.hpMult),
            atk: Math.floor(baseAtk * enemyTemplate.atkMult)
        };

        gameState.inBattle = true;
        gameState.defending = false;
        gameState.playerActing = false;
        setButtonsEnabled(true);
        updateUI();
        addLog('A wild ' + gameState.enemy.name + ' appears!', 'system');
    }

    function setButtonsEnabled(enabled) {
        var buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(function(btn) {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.pointerEvents = enabled ? 'auto' : 'none';
        });
    }

    function playerAction(action) {
        if (!gameState.inBattle) return;
        if (gameState.playerActing) return;

        gameState.playerActing = true;
        setButtonsEnabled(false);

        var player = gameState.player;
        var enemy = gameState.enemy;
        gameState.defending = false;

        if (action === 'attack') {
            var damage = Math.max(1, player.atk + getTotalStat('atk') - Math.floor(enemy.atk * 0.2));
            var variance = Math.floor(Math.random() * 5) - 2;
            var finalDamage = Math.max(1, damage + variance);
            enemy.hp -= finalDamage;
            addLog('You deal ' + finalDamage + ' damage!', 'player');
            showDamage('enemy', finalDamage);
            shakeElement('enemy-sprite');
        } else if (action === 'skill') {
            if (player.mp < 15) {
                addLog('Not enough MP!', 'system');
                gameState.playerActing = false;
                setButtonsEnabled(true);
                return;
            }
            player.mp -= 15;
            var skillDamage = Math.floor((player.atk + getTotalStat('atk')) * 1.8);
            enemy.hp -= skillDamage;
            addLog('Power Strike deals ' + skillDamage + ' damage!', 'player');
            showDamage('enemy', skillDamage);
            shakeElement('enemy-sprite');
        } else if (action === 'defend') {
            gameState.defending = true;
            addLog('You brace for impact!', 'player');
        } else if (action === 'heal') {
            if (player.mp < 20) {
                addLog('Not enough MP!', 'system');
                gameState.playerActing = false;
                setButtonsEnabled(true);
                return;
            }
            player.mp -= 20;
            var healAmount = Math.floor(player.maxHp * 0.3);
            var totalMaxHp = player.maxHp + getTotalStat('maxHp');
            player.hp = Math.min(totalMaxHp, player.hp + healAmount);
            addLog('You restore ' + healAmount + ' HP!', 'player');
            showDamage('player', healAmount, true);
        }

        updateUI();

        if (enemy.hp <= 0) {
            victory();
            return;
        }

        setTimeout(enemyTurn, 800);
    }

    function enemyTurn() {
        var player = gameState.player;
        var enemy = gameState.enemy;

        var damage = Math.max(1, enemy.atk - (player.def + getTotalStat('def')));
        if (gameState.defending) {
            damage = Math.floor(damage * 0.4);
            addLog('Your defense reduces the damage!', 'system');
        }

        var variance = Math.floor(Math.random() * 3) - 1;
        damage = Math.max(1, damage + variance);

        player.hp -= damage;
        addLog(enemy.name + ' deals ' + damage + ' damage!', 'enemy');
        showDamage('player', damage);
        shakeElement('player-sprite');

        updateUI();

        gameState.playerActing = false;
        setButtonsEnabled(true);

        if (player.hp <= 0) {
            defeat();
        }
    }

    function victory() {
        gameState.inBattle = false;
        var stage = gameState.stage;
        var goldReward = 30 + stage * 10;
        var xpReward = 20 + stage * 5;
        gameState.player.gold += goldReward;
        gameState.player.xp += xpReward;

        while (gameState.player.xp >= gameState.player.xpToLevel) {
            levelUp();
        }

        var runeReward = null;
        var dropChance = 0.4 + stage * 0.02;
        if (Math.random() < dropChance) {
            runeReward = generateRune(stage);
            gameState.player.inventory.push(runeReward);
        }

        document.getElementById('victory-stage').textContent = stage;
        document.getElementById('reward-text').textContent = '+' + goldReward + ' Gold, +' + xpReward + ' EXP';

        var runeRewardDiv = document.getElementById('rune-reward');
        if (runeReward) {
            runeRewardDiv.innerHTML = '<p style="color: #ffd700;">New Rune Found!</p>' +
                '<div class="rune ' + runeReward.color + '" style="margin: 10px auto;">' + runeReward.icon + '</div>' +
                '<p>' + runeReward.name + ' (+' + runeReward.value + ' ' + runeReward.stat.toUpperCase() + ')</p>';
        } else {
            runeRewardDiv.innerHTML = '';
        }

        document.getElementById('victory-screen').classList.remove('hidden');
        updateInventoryUI();
    }

    function defeat() {
        gameState.inBattle = false;
        document.getElementById('defeat-stage').textContent = gameState.stage;
        document.getElementById('defeat-screen').classList.remove('hidden');
    }

    function nextStage() {
        document.getElementById('victory-screen').classList.add('hidden');
        gameState.stage++;

        if (gameState.stage > 30) {
            gameComplete();
            return;
        }

        var totalMaxHp = gameState.player.maxHp + getTotalStat('maxHp');
        var totalMaxMp = gameState.player.maxMp + getTotalStat('maxMp');
        gameState.player.hp = Math.min(totalMaxHp, gameState.player.hp + Math.floor(gameState.player.maxHp * 0.3));
        gameState.player.mp = Math.min(totalMaxMp, gameState.player.mp + Math.floor(gameState.player.maxMp * 0.3));

        initBattle();
    }

    function retryStage() {
        document.getElementById('defeat-screen').classList.add('hidden');
        gameState.player.hp = gameState.player.maxHp + getTotalStat('maxHp');
        gameState.player.mp = gameState.player.maxMp + getTotalStat('maxMp');
        initBattle();
    }

    function gameComplete() {
        var p = gameState.player;
        document.getElementById('final-stats').innerHTML =
            'Level: ' + p.level + ' | ATK: ' + (p.atk + getTotalStat('atk')) +
            ' | DEF: ' + (p.def + getTotalStat('def')) + ' | Gold: ' + p.gold;
        document.getElementById('complete-screen').classList.remove('hidden');
    }

    function resetGame() {
        location.reload();
    }

    function levelUp() {
        var player = gameState.player;
        player.xp -= player.xpToLevel;
        player.level++;
        player.xpToLevel = Math.floor(player.xpToLevel * 1.3);
        player.maxHp += 15;
        player.maxMp += 8;
        player.atk += 3;
        player.def += 2;
        player.hp = player.maxHp + getTotalStat('maxHp');
        player.mp = player.maxMp + getTotalStat('maxMp');
        addLog('Level Up! You are now level ' + player.level + '!', 'system');
    }

    function generateRune(stage) {
        var rarity;
        var roll = Math.random();
        if (stage >= 25 && roll < 0.1) rarity = 'legendary';
        else if (stage >= 15 && roll < 0.2) rarity = 'epic';
        else if (stage >= 8 && roll < 0.35) rarity = 'rare';
        else if (roll < 0.5) rarity = 'uncommon';
        else rarity = 'common';

        var possibleRunes = runeTypes.filter(function(r) { return r.color === rarity; });
        var template = possibleRunes[Math.floor(Math.random() * possibleRunes.length)];

        var valueMultipliers = { common: 1, uncommon: 1.5, rare: 2.5, epic: 4, legendary: 7 };
        var baseValue = 3 + Math.floor(stage / 3);
        var value = Math.floor(baseValue * valueMultipliers[rarity]);

        return {
            id: Date.now() + Math.random(),
            name: template.name + ' Rune',
            icon: template.icon,
            stat: template.stat,
            value: value,
            color: rarity
        };
    }

    function getTotalStat(stat) {
        var total = 0;
        gameState.player.equippedRunes.forEach(function(rune) {
            if (rune && rune.stat === stat) {
                total += rune.value;
            }
        });
        return total;
    }

    function equipRune(runeIndex) {
        var inventory = gameState.player.inventory;
        var equipped = gameState.player.equippedRunes;

        if (runeIndex < 0 || runeIndex >= inventory.length) return;

        var emptySlot = -1;
        for (var i = 0; i < equipped.length; i++) {
            if (equipped[i] === null) {
                emptySlot = i;
                break;
            }
        }

        if (emptySlot === -1) {
            addLog('All rune slots are full!', 'system');
            return;
        }

        var rune = inventory.splice(runeIndex, 1)[0];
        equipped[emptySlot] = rune;

        updateUI();
        updateInventoryUI();
    }

    function unequipRune(slotIndex) {
        var equipped = gameState.player.equippedRunes;
        if (!equipped[slotIndex]) return;

        var rune = equipped[slotIndex];
        equipped[slotIndex] = null;
        gameState.player.inventory.push(rune);

        updateUI();
        updateInventoryUI();
    }

    function updateUI() {
        var player = gameState.player;
        var enemy = gameState.enemy;

        var totalMaxHp = player.maxHp + getTotalStat('maxHp');
        var totalMaxMp = player.maxMp + getTotalStat('maxMp');

        document.getElementById('hp-text').textContent = Math.max(0, player.hp) + '/' + totalMaxHp;
        document.getElementById('hp-bar').style.width = Math.max(0, player.hp / totalMaxHp * 100) + '%';
        document.getElementById('mp-text').textContent = player.mp + '/' + totalMaxMp;
        document.getElementById('mp-bar').style.width = (player.mp / totalMaxMp * 100) + '%';
        document.getElementById('xp-text').textContent = player.xp + '/' + player.xpToLevel;
        document.getElementById('xp-bar').style.width = (player.xp / player.xpToLevel * 100) + '%';

        document.getElementById('level').textContent = player.level;
        document.getElementById('atk').textContent = player.atk + getTotalStat('atk');
        document.getElementById('def').textContent = player.def + getTotalStat('def');
        document.getElementById('gold').textContent = player.gold;
        document.getElementById('current-stage').textContent = gameState.stage;

        document.getElementById('player-battle-hp').style.width = Math.max(0, player.hp / totalMaxHp * 100) + '%';

        if (enemy) {
            document.getElementById('enemy-name').textContent = enemy.name;
            document.getElementById('enemy-sprite').innerHTML = enemy.icon;
            document.getElementById('enemy-battle-hp').style.width = Math.max(0, enemy.hp / enemy.maxHp * 100) + '%';
        }

        var slots = document.querySelectorAll('.rune-slot');
        slots.forEach(function(slot, index) {
            var rune = player.equippedRunes[index];
            if (rune) {
                slot.innerHTML = '<div class="rune ' + rune.color + '" title="' + rune.name + '\n+' + rune.value + ' ' + rune.stat.toUpperCase() + '">' + rune.icon + '</div>';
                slot.classList.add('equipped');
            } else {
                slot.innerHTML = '';
                slot.classList.remove('equipped');
            }
        });
    }

    function updateInventoryUI() {
        var inventory = document.getElementById('rune-inventory');
        inventory.innerHTML = '';

        gameState.player.inventory.forEach(function(rune, index) {
            var runeEl = document.createElement('div');
            runeEl.className = 'rune ' + rune.color;
            runeEl.innerHTML = rune.icon;
            runeEl.title = rune.name + '\n+' + rune.value + ' ' + rune.stat.toUpperCase() + '\nClick to equip';
            runeEl.onclick = function() { equipRune(index); };
            inventory.appendChild(runeEl);
        });
    }

    function addLog(message, type) {
        var log = document.getElementById('battle-log');
        var p = document.createElement('p');
        p.className = 'log-' + type;
        p.textContent = message;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;

        while (log.children.length > 20) {
            log.removeChild(log.firstChild);
        }
    }

    function showDamage(target, amount, isHeal) {
        var sprite = document.getElementById(target === 'player' ? 'player-sprite' : 'enemy-sprite');
        var popup = document.createElement('div');
        popup.className = 'damage-popup ' + (isHeal ? 'damage-heal' : (target === 'player' ? 'damage-player' : 'damage-enemy'));
        popup.textContent = isHeal ? '+' + amount : '-' + amount;
        popup.style.left = '50%';
        popup.style.top = '20%';
        sprite.appendChild(popup);
        setTimeout(function() { popup.remove(); }, 1000);
    }

    function shakeElement(id) {
        var el = document.getElementById(id);
        el.classList.add('shake');
        setTimeout(function() { el.classList.remove('shake'); }, 300);
    }

    function giveStarterRunes() {
        gameState.player.inventory.push(generateRune(1));
        gameState.player.inventory.push(generateRune(1));
        updateInventoryUI();
    }

    window.startGame = function() {
        document.getElementById('start-screen').classList.add('hidden');
        giveStarterRunes();
        initBattle();
    };
    window.playerAction = playerAction;
    window.nextStage = nextStage;
    window.retryStage = retryStage;
    window.resetGame = resetGame;
    window.equipRune = equipRune;
    window.unequipRune = unequipRune;

    updateUI();
})();
</script>
