---
layout: default
title: CTE Career Fair - Technical Details for UESL Project
permalink: /blogs/technicals/
---

<style>
  .tech-section { margin-bottom: 2.5rem; }
  .tech-section h2 { border-bottom: 2px solid #6366f1; padding-bottom: 0.4rem; color: #6366f1; }
  .tech-section h3 { color: #a78bfa; margin-top: 1.2rem; }
  .badge { display: inline-block; background: #1e1e2e; color: #a78bfa; border: 1px solid #6366f1; border-radius: 4px; padding: 2px 8px; font-size: 0.82rem; margin: 2px; font-family: monospace; }
  .endpoint-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .endpoint-table th { background: #1e1e2e; color: #a78bfa; padding: 6px 10px; text-align: left; }
  .endpoint-table td { border-bottom: 1px solid #2d2d3d; padding: 5px 10px; }
  .endpoint-table tr:hover td { background: #1a1a2e; }
  .model-card { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 6px; padding: 12px 16px; margin-bottom: 10px; }
  .model-card strong { color: #c4b5fd; }
  .arch-diagram { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 6px; padding: 16px; font-family: monospace; font-size: 0.85rem; white-space: pre; overflow-x: auto; color: #a3e635; }
  summary { cursor: pointer; color: #818cf8; font-weight: bold; }
  details[open] summary { color: #c4b5fd; }
</style>

<div class="tech-section">
<h2>Project Overview</h2>

<strong>Unified Esports League (UESL)</strong> is a full-stack accessible gaming platform for people with intellectual and developmental disabilities. Students build and share games, play against AI coaches, and compete on leaderboards — all through a Python/Flask backend and Jekyll frontend.

<div class="arch-diagram">
Browser (Jekyll / GitHub Pages · uesl.io)
        │  HTTPS + CORS
        ▼
  Flask REST API  ←→  SQLite (SQLAlchemy ORM)
  (port 8424)
        │
        ├── Flask-SocketIO  ←── real-time multiplayer rooms
        ├── Groq AI  (LLaMA 3.3-70b)  ←── in-game AI chat
        ├── Gemini AI  (gemini-2.5-flash)  ←── AI NPC coach taunts
        └── Leaderboard Socket Server  (port 8501)
</div>
</div>

---

<div class="tech-section">
<h2>Tech Stack</h2>

<h3>Frontend — Game Engine</h3>
<span class="badge">Vanilla JS (ES Modules)</span>
<span class="badge">Jekyll</span>
<span class="badge">GitHub Pages</span>
<span class="badge">Canvas API</span>
<span class="badge">Web Speech API</span>
<span class="badge">MediaDevices (camera)</span>

<ul>
<li>Game engine lives in <code>assets/js/GameEnginev1.2/</code> — pure ES module classes, no external framework</li>
<li>Rendered on an HTML <code>&lt;canvas&gt;</code> element via <code>Game.js</code> game loop</li>
<li>Accessibility inputs: touch controls, voice commands, face tracking (via camera)</li>
</ul>

<h3>Backend</h3>
<span class="badge">Python 3</span>
<span class="badge">Flask</span>
<span class="badge">Flask-RESTful</span>
<span class="badge">Flask-Login</span>
<span class="badge">Flask-SQLAlchemy</span>
<span class="badge">Flask-SocketIO</span>
<span class="badge">Flask-CORS</span>
<span class="badge">PyJWT</span>
<span class="badge">Docker</span>
<span class="badge">Nginx</span>

<ul>
<li>REST API + WebSocket on <strong>port 8424</strong>, leaderboard socket on <strong>port 8501</strong></li>
<li>SQLite via SQLAlchemy ORM (<code>instance/volumes/user_management.db</code>)</li>
<li>Deployed via Docker + docker-compose, reverse-proxied through Nginx</li>
<li>Production: <code>https://uesl.opencodingsociety.com</code></li>
</ul>

<h3>AI / External Services</h3>
<span class="badge">Groq (LLaMA 3.3-70b)</span>
<span class="badge">Google Gemini 2.5 Flash</span>
<span class="badge">Google OAuth</span>
<span class="badge">SMTP (OTP)</span>

</div>

---

<div class="tech-section">
<h2>Game Engine — Frontend</h2>

All source in <code>assets/js/GameEnginev1.2/</code>. Everything imports through <code>essentials/Imports.js</code>.

<h3>Core Loop (<code>essentials/</code>)</h3>

<table class="endpoint-table">
<tr><th>File</th><th>Role</th></tr>
<tr><td>Game.js</td><td>Main game loop — initializes levels, runs requestAnimationFrame tick</td></tr>
<tr><td>GameEnv.js</td><td>Shared environment state (canvas size, active objects, gravity)</td></tr>
<tr><td>GameLevel.js</td><td>Loads/unloads a level's objects and background</td></tr>
<tr><td>GameObject.js</td><td>Base class for all entities — draw, update, destroy lifecycle</td></tr>
<tr><td>GameControl.js</td><td>Keyboard + gamepad input dispatcher</td></tr>
<tr><td>GameUI.js</td><td>HUD rendering (hearts, score, level name)</td></tr>
<tr><td>Camera.js</td><td>Scrolling camera that follows the player</td></tr>
</table>

<h3>Characters & AI</h3>

<table class="endpoint-table">
<tr><th>File</th><th>Role</th></tr>
<tr><td>Player.js</td><td>Player character — movement, jump, collision, health</td></tr>
<tr><td>Character.js</td><td>Shared base for sprite-sheet animated characters</td></tr>
<tr><td>Enemy.js</td><td>Base enemy — patrol, chase, damage on contact</td></tr>
<tr><td>Npc.js</td><td>Friendly NPC — dialogue, interaction triggers</td></tr>
<tr><td>AiNpc.js</td><td>Calls <code>/api/ainpc/chat</code> for live AI-generated dialogue</td></tr>
<tr><td>UESLCoach.js</td><td>Hostile AI enemy — chases player, calls <code>/api/gemini</code> every ~4.5s for live trash-talk speech bubbles. Removes a heart on contact; 2s invincibility window after each hit.</td></tr>
<tr><td>CharacterSelect.js</td><td>Pre-game character selection screen</td></tr>
</table>

<h3>Game Maker Builder (<code>builder/</code>)</h3>

<ul>
<li><code>templates.js</code> — predefined level templates users can start from in the editor</li>
<li>The game maker UI (<code>pages/game-maker.html</code>) lets users place platforms, enemies, coins, and goals, then saves the full level JSON to the backend via <code>POST /api/game/save</code></li>
</ul>

<h3>Accessibility Controls</h3>

<table class="endpoint-table">
<tr><th>Input method</th><th>Implementation</th></tr>
<tr><td>Touch / D-pad</td><td>TouchControls.js — on-screen buttons mapped to game actions</td></tr>
<tr><td>Voice commands</td><td>Web Speech API — "jump", "left", "right" trigger GameControl events</td></tr>
<tr><td>Face tracking</td><td>MediaDevices camera feed — head pose drives player direction</td></tr>
</table>

<h3>Leaderboard & Scoring</h3>

<ul>
<li><code>Leaderboard.js</code> — fetches <code>GET /api/game/&lt;id&gt;/leaderboard</code> and renders top scores in-game</li>
<li><code>Scoreboard.js</code> — live session scoreboard during multiplayer</li>
<li><code>scorefeature.js</code> / <code>scoreSettings.js</code> — star collection logic and score config per level</li>
</ul>

</div>

---

<div class="tech-section">
<h2>Authentication</h2>

Hybrid decorator in <code>api/authorize.py</code> — checks Flask-Login session first, falls back to JWT cookie.

<table class="endpoint-table">
<tr><th>Method</th><th>How</th></tr>
<tr><td>Username + password</td><td>JWT cookie via <code>/api/authenticate</code></td></tr>
<tr><td>Google OAuth</td><td>ID token verified server-side with <code>google-auth</code></td></tr>
<tr><td>OTP (email)</td><td>SMTP → 6-digit code → JWT cookie</td></tr>
</table>

<p><code>@token_required(role)</code> — returns <code>401</code> if no valid token, <code>403</code> if wrong role. Roles: <code>Admin</code>, <code>Teacher</code>, <code>Student</code>.</p>

</div>

---

<div class="tech-section">
<h2>API Endpoints</h2>

<details open>
<summary>Game Maker  <code>/api/game/</code>  —  <code>api/game_api.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/game/save</td><td>token</td><td>Save (upsert by name) full level JSON for the current user</td></tr>
<tr><td>GET</td><td>/api/game/list</td><td>token</td><td>List all games saved by the current user</td></tr>
<tr><td>GET</td><td>/api/game/load/&lt;name&gt;</td><td>token</td><td>Load a specific game by name</td></tr>
<tr><td>DELETE</td><td>/api/game/delete/&lt;id&gt;</td><td>token</td><td>Delete a saved game</td></tr>
<tr><td>GET</td><td>/api/game/shared</td><td>—</td><td>Browse all games published by any user</td></tr>
</table>
</details>

<details open>
<summary>Leaderboard & Comments  <code>/api/game/</code>  —  <code>api/game_social_api.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/game/&lt;id&gt;/score</td><td>token</td><td>Submit a play score — only the player's best score per game is kept</td></tr>
<tr><td>GET</td><td>/api/game/&lt;id&gt;/leaderboard</td><td>—</td><td>Top scores for a game</td></tr>
<tr><td>POST</td><td>/api/game/&lt;id&gt;/comment</td><td>token</td><td>Post a comment on a shared game</td></tr>
<tr><td>GET</td><td>/api/game/&lt;id&gt;/comments</td><td>—</td><td>Get all comments for a game</td></tr>
</table>
</details>

<details open>
<summary>AI NPC  —  <code>api/gemini_api.py</code>  <code>api/groq_api.py</code>  <code>api/api_ainpc.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Model</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/gemini</td><td>gemini-2.5-flash</td><td>Used by UESLCoach.js for live trash-talk taunts every ~4.5s</td></tr>
<tr><td>POST</td><td>/api/ainpc/chat</td><td>gemini-2.5-flash</td><td>Conversational NPC dialogue with personality templates (history, merchant…)</td></tr>
<tr><td>POST</td><td>/api/groq/chat</td><td>LLaMA 3.3-70b</td><td>General in-game AI chat</td></tr>
</table>
</details>

<details open>
<summary>User & Auth  —  <code>api/user.py</code>  <code>api/otp_api.py</code>  <code>api/pfp.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/authenticate</td><td>—</td><td>Login → sets JWT cookie</td></tr>
<tr><td>GET</td><td>/api/id</td><td>token</td><td>Get current user profile + role</td></tr>
<tr><td>POST</td><td>/api/user</td><td>—</td><td>Create account</td></tr>
<tr><td>PUT</td><td>/api/user</td><td>token</td><td>Update profile fields</td></tr>
<tr><td>POST</td><td>/api/otp/request</td><td>—</td><td>Send OTP to email via SMTP</td></tr>
<tr><td>POST</td><td>/api/otp/verify</td><td>—</td><td>Verify OTP → JWT cookie</td></tr>
<tr><td>GET/PUT</td><td>/api/id/pfp</td><td>token</td><td>Get or upload profile picture (base64)</td></tr>
</table>
</details>

</div>

---

<div class="tech-section">
<h2>Real-Time: WebSocket / Socket.IO</h2>

<strong>Multiplayer rooms</strong> (<code>api/multiplayer.py</code> — same process as REST API):

<table class="endpoint-table">
<tr><th>Event</th><th>Description</th></tr>
<tr><td><code>create_room</code></td><td>Host creates a room, receives a <code>room_id</code></td></tr>
<tr><td><code>join_room</code></td><td>Guest joins by <code>room_id</code></td></tr>
<tr><td><code>game_event</code></td><td>Arbitrary game state forwarded to all room members</td></tr>
<tr><td><code>disconnect</code></td><td>Player removed from room, others notified</td></tr>
</table>

<strong>Leaderboard server</strong> (<code>socket/socket_server.py</code> — port 8501, standalone process):

<table class="endpoint-table">
<tr><th>Event</th><th>Description</th></tr>
<tr><td><code>player_join</code></td><td>Register player by name, broadcast join</td></tr>
<tr><td><code>player_score</code></td><td>Update score, re-broadcast sorted leaderboard to all</td></tr>
<tr><td><code>clear_leaderboard</code></td><td>Reset all scores</td></tr>
<tr><td><code>get_leaderboard</code></td><td>Emit current sorted list to requester</td></tr>
</table>

</div>

---

<div class="tech-section">
<h2>Database Models</h2>

<div class="model-card">
<strong>User</strong> — <code>users</code><br>
<code>_uid</code>, <code>_name</code>, <code>_email</code>, <code>_password</code> (Werkzeug hash), <code>_role</code> (Admin/Teacher/Student), <code>_pfp</code>, <code>_auth_type</code> (local/google)
</div>

<div class="model-card">
<strong>Game</strong> — <code>games</code><br>
<code>user_id</code> (FK), <code>name</code>, <code>game_data</code> (full level JSON as Text), <code>updated_at</code><br>
One user → many games. Upserted by name on save.
</div>

<div class="model-card">
<strong>GameScore</strong> — <code>game_scores</code><br>
<code>game_id</code>, <code>user_id</code>, <code>score</code> (stars), <code>levels_completed</code>, <code>played_at</code><br>
One row per (game, user) — only the best score is kept on update.
</div>

<div class="model-card">
<strong>GameComment</strong> — <code>game_comments</code><br>
<code>game_id</code>, <code>user_id</code>, <code>body</code>, <code>posted_at</code>. Cascade-deletes when the game is deleted.
</div>

</div>

---

<div class="tech-section">
<h2>Infrastructure</h2>

<ul>
<li><strong>Docker Compose</strong> — main Flask service (port 8424) + leaderboard socket service (port 8501)</li>
<li><strong>Nginx</strong> (<code>nginx_for_uesl</code>) — reverse proxy, SSL termination</li>
<li><strong>CORS allowed origins:</strong> <code>localhost:4000–4700</code>, <code>unified-esports-league.github.io</code>, <code>uesl.io</code>, <code>uesl.opencodingsociety.com</code></li>
</ul>
<strong>Key env vars</strong> (<code>.env</code>):
<ul>
<li><code>FLASK_PORT</code> (default 8424)</li>
<li><code>SECRET_KEY</code> — JWT signing</li>
<li><code>GROQ_API_KEY</code>, <code>GEMINI_API_KEY</code></li>
</ul>

</div>
