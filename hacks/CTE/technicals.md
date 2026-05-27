---
layout: default
title: CTE Career Fair - Technical Details for UESL Project
permalink: /blogs/technicals/
---

<style>
  .tech-section { margin-bottom: 2.5rem; }
  .tech-section h2 { border-bottom: 2px solid #6366f1; padding-bottom: 0.4rem; color: #6366f1; }
  .tech-section h3 { color: #a78bfa; margin-top: 1.4rem; margin-bottom: 0.5rem; }
  .tech-section h4 { color: #c4b5fd; margin-top: 1rem; margin-bottom: 0.3rem; }
  .badge { display: inline-block; background: #1e1e2e; color: #a78bfa; border: 1px solid #6366f1; border-radius: 4px; padding: 2px 8px; font-size: 0.82rem; margin: 2px; font-family: monospace; }
  .endpoint-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; margin-bottom: 0.8rem; }
  .endpoint-table th { background: #1e1e2e; color: #a78bfa; padding: 6px 10px; text-align: left; }
  .endpoint-table td { border-bottom: 1px solid #2d2d3d; padding: 5px 10px; vertical-align: top; }
  .endpoint-table tr:hover td { background: #1a1a2e; }
  .model-card { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 6px; padding: 12px 16px; margin-bottom: 10px; font-size: 0.9rem; line-height: 1.6; }
  .model-card strong { color: #c4b5fd; }
  .model-card code { background: #1e1e2e; padding: 1px 5px; border-radius: 3px; font-size: 0.82rem; }
  .arch-diagram { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 6px; padding: 16px; font-family: monospace; font-size: 0.85rem; white-space: pre; overflow-x: auto; color: #a3e635; }
  .code-block { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 0.82rem; overflow-x: auto; color: #e2e8f0; margin-bottom: 10px; white-space: pre; }
  .note { background: #0f172a; border-left: 3px solid #6366f1; padding: 8px 14px; margin: 10px 0; font-size: 0.88rem; color: #94a3b8; }
  summary { cursor: pointer; color: #818cf8; font-weight: bold; padding: 4px 0; }
  details[open] summary { color: #c4b5fd; }
  details { margin-bottom: 14px; }
</style>

<div class="tech-section">
<h2>Project Overview</h2>

<strong>Unified Esports League (UESL)</strong> is a full-stack accessible gaming platform built for people with intellectual and developmental disabilities (IDD). Users can build and share custom games in a no-code editor, play against an AI coach that trash-talks in real time, compete on leaderboards, and race teammates in 2-player co-op — all in the browser.

<div class="arch-diagram">
Browser  (Jekyll / GitHub Pages · uesl.io)
         │  HTTPS + JWT cookie
         ▼
  Flask REST API  (port 8424)
  Flask-SocketIO  (same process — /socket.io)
         │              │
         │              ├── In-memory multiplayer rooms  (max 2 players)
         │              └── player_update / game_event relay
         │
         ├── SQLite  via  SQLAlchemy ORM
         │   instance/volumes/user_management.db
         │
         ├── Groq  LLaMA 3.3-70b    →  /api/groq/chat
         ├── Gemini 2.5 Flash        →  /api/gemini  (UESLCoach taunts)
         │                           →  /api/ainpc/chat  (NPC dialogue)
         └── Leaderboard Socket Server  (port 8501, standalone process)
</div>

<div class="note">Frontend repo: <strong>MalwareMadness</strong> (Jekyll + ES modules) &nbsp;|&nbsp; Backend repo: <strong>MalwareMadness-backend</strong> (Python/Flask) &nbsp;|&nbsp; Production: <code>https://uesl.opencodingsociety.com</code></div>
</div>

---

<div class="tech-section">
<h2>Tech Stack</h2>

<h3>Frontend</h3>
<span class="badge">Vanilla JS (ES Modules)</span>
<span class="badge">Jekyll 4</span>
<span class="badge">GitHub Pages</span>
<span class="badge">HTML Canvas API</span>
<span class="badge">Web Speech API</span>
<span class="badge">MediaDevices (camera)</span>
<span class="badge">Socket.IO client</span>

<ul>
<li>Game engine lives entirely in <code>assets/js/GameEnginev1.2/</code> — pure ES module classes, zero external framework</li>
<li>All rendering on a single <code>&lt;canvas&gt;</code> element driven by a <code>requestAnimationFrame</code> game loop in <code>Game.js</code></li>
<li>Three accessibility input modes: touch D-pad, Web Speech API voice commands, and camera face tracking</li>
</ul>

<h3>Backend</h3>
<span class="badge">Python 3</span>
<span class="badge">Flask</span>
<span class="badge">Flask-RESTful</span>
<span class="badge">Flask-Login</span>
<span class="badge">Flask-SQLAlchemy</span>
<span class="badge">Flask-SocketIO</span>
<span class="badge">Flask-CORS</span>
<span class="badge">PyJWT (HS256)</span>
<span class="badge">Werkzeug</span>
<span class="badge">Docker + Nginx</span>

<ul>
<li>REST API + WebSocket on <strong>port 8424</strong>; standalone leaderboard socket on <strong>port 8501</strong></li>
<li>SQLite database via SQLAlchemy ORM at <code>instance/volumes/user_management.db</code></li>
<li>Deployed via <code>docker-compose</code>, reverse-proxied through Nginx with SSL termination</li>
</ul>

<h3>AI / External Services</h3>
<span class="badge">Groq — LLaMA 3.3-70b</span>
<span class="badge">Google Gemini 2.5 Flash</span>
<span class="badge">Google OAuth 2.0</span>
<span class="badge">SMTP (OTP email)</span>
</div>

---

<div class="tech-section">
<h2>Game Engine — Frontend</h2>

All source in <code>assets/js/GameEnginev1.2/</code>. Every file is an ES module; the entire engine bootstraps through <code>essentials/Imports.js</code>.

<h3>Core Loop — <code>essentials/</code></h3>

<table class="endpoint-table">
<tr><th>File</th><th>Role</th></tr>
<tr><td><code>Game.js</code></td><td>Entry point — initializes levels, runs the <code>requestAnimationFrame</code> tick, manages game state (start / pause / end)</td></tr>
<tr><td><code>GameEnv.js</code></td><td>Shared singleton — canvas size, gravity constant, list of active GameObjects, current level reference</td></tr>
<tr><td><code>GameLevel.js</code></td><td>Loads a level definition: instantiates every object listed in the level config, handles unload/cleanup on level change</td></tr>
<tr><td><code>GameObject.js</code></td><td>Base class for all on-screen entities — defines <code>draw()</code>, <code>update()</code>, <code>destroy()</code> lifecycle; holds position, size, collision box</td></tr>
<tr><td><code>GameControl.js</code></td><td>Input dispatcher — normalises keyboard, gamepad, touch, voice, and face-tracking signals into a single action map</td></tr>
<tr><td><code>GameUI.js</code></td><td>HUD layer — renders health hearts, star score, and level name on a canvas overlay</td></tr>
<tr><td><code>Camera.js</code></td><td>Scrolling camera — follows the player with a configurable deadzone; transforms all world-space coordinates before draw</td></tr>
</table>

<h3>Characters & AI Entities</h3>

<table class="endpoint-table">
<tr><th>File</th><th>Role</th></tr>
<tr><td><code>Player.js</code></td><td>Player character — movement, jump physics, collision resolution, health tracking, death/respawn</td></tr>
<tr><td><code>Character.js</code></td><td>Shared base for sprite-sheet animated characters — frame index, animation speed, directional flip</td></tr>
<tr><td><code>Enemy.js</code></td><td>Base enemy — patrol between waypoints, chase player when in range, deal damage on contact</td></tr>
<tr><td><code>Npc.js</code></td><td>Friendly NPC — static dialogue bubbles, proximity-triggered interaction</td></tr>
<tr><td><code>AiNpc.js</code></td><td>Extends Npc — on player interaction, calls <code>POST /api/ainpc/chat</code> with a personality template and conversation history; renders the response as a speech bubble</td></tr>
<tr><td><code>UESLCoach.js</code></td><td>Hostile AI enemy — chases the player, calls <code>POST /api/gemini</code> every ~4.5 s with the current game context for live trash-talk taunts rendered as floating speech bubbles. Removes one heart on contact; player has a 2-second invincibility window after each hit.</td></tr>
<tr><td><code>CharacterSelect.js</code></td><td>Pre-game character selection screen — renders available sprites, stores chosen character in <code>GameEnv</code></td></tr>
</table>

<h3>Game Maker Builder — <code>builder/</code></h3>

<ul>
<li><code>templates.js</code> — predefined level templates the editor pre-loads as starting points</li>
<li>The game maker page (<code>pages/game-maker.html</code>) is a drag-and-drop level editor: users place platforms, enemies, coins, and goals on a grid, configure properties, then click <strong>Save</strong></li>
<li>On save, the entire level config is serialised to JSON and sent to <code>POST /api/game/save</code> — the backend upserts by <code>(user_id, name)</code> so re-saving the same name overwrites without creating duplicates</li>
<li>The <strong>Shared Games</strong> gallery calls <code>GET /api/game/shared</code> (no auth) to browse all published games and launch any of them in the engine</li>
</ul>

<h3>Accessibility Controls</h3>

<table class="endpoint-table">
<tr><th>Input method</th><th>Implementation</th><th>Detail</th></tr>
<tr><td>Keyboard / Gamepad</td><td><code>GameControl.js</code></td><td>Standard WASD/arrow + Gamepad API; all inputs normalised to an action enum</td></tr>
<tr><td>Touch D-pad</td><td><code>TouchControls.js</code></td><td>On-screen directional buttons rendered over the canvas, touch events mapped to the same action enum</td></tr>
<tr><td>Voice commands</td><td>Web Speech API</td><td>"jump", "left", "right" recognised continuously; dispatched into <code>GameControl</code> as synthetic key events</td></tr>
<tr><td>Face tracking</td><td><code>MediaDevices</code> + camera</td><td>Head pose (tilt left/right, open mouth) drives player direction via a lightweight landmark model</td></tr>
</table>

<h3>Leaderboard & Scoring</h3>

<ul>
<li><code>Leaderboard.js</code> — on level load, fetches <code>GET /api/game/&lt;id&gt;/leaderboard</code> and renders top-10 scores as an in-game overlay panel</li>
<li><code>Scoreboard.js</code> — live session scoreboard during multiplayer; subscribes to the leaderboard Socket.IO server on port 8501</li>
<li><code>scorefeature.js</code> / <code>scoreSettings.js</code> — per-level star-collection config; tracks collected stars in <code>GameEnv</code> and POSTs the final score on level completion</li>
</ul>
</div>

---

<div class="tech-section">
<h2>Authentication</h2>

<h3>Auth Decorator — <code>api/authorize.py</code></h3>

Every protected endpoint uses <code>@token_required(role)</code>. The decorator checks credentials in this order:

<div class="code-block">1. JWT cookie  →  name: app.config["JWT_TOKEN_NAME"]
2. Authorization: Bearer &lt;token&gt; header  (fallback for non-browser clients)
3. Flask-Login session  (fallback if no JWT present at all)

On success: sets g.current_user, checks role, calls the route handler.
On failure: 401 Unauthorized  |  wrong role: 403 Forbidden</div>

<h3>JWT Details</h3>

<table class="endpoint-table">
<tr><th>Property</th><th>Value</th></tr>
<tr><td>Algorithm</td><td>HS256 signed with <code>SECRET_KEY</code></td></tr>
<tr><td>Payload</td><td><code>{"_uid": user._uid}</code></td></tr>
<tr><td>Lifetime</td><td>43 200 s (12 hours)</td></tr>
<tr><td>Cookie (production)</td><td><code>secure=True, httponly=True, SameSite=None, domain=.opencodingsociety.com</code></td></tr>
<tr><td>Cookie (development)</td><td><code>secure=False, httponly=False, SameSite=Lax</code></td></tr>
<tr><td>Roles</td><td><code>Admin</code>, <code>Teacher</code>, <code>Student</code></td></tr>
</table>

<h3>Login Methods</h3>

<table class="endpoint-table">
<tr><th>Method</th><th>Endpoint</th><th>How it works</th></tr>
<tr><td>Password + OTP</td><td><code>POST /api/otp/send</code> → <code>POST /api/otp/verify</code></td><td>Credentials checked first; if valid, a 6-digit OTP is generated, stored in an in-memory dict with a 10-minute TTL, and sent via SMTP. Verify call exchanges the code for a JWT cookie.</td></tr>
<tr><td>Password only</td><td><code>POST /api/authenticate</code></td><td>Werkzeug <code>check_password_hash</code>; JWT cookie returned immediately (used when 2FA is disabled)</td></tr>
<tr><td>Google OAuth</td><td><code>POST /api/google/auth</code></td><td>Frontend sends Google ID token; server verifies with <code>google-auth</code> library and issues JWT cookie</td></tr>
</table>

<h4>OTP Flow Detail</h4>
<div class="code-block">_otp_store = {}   # in-memory: { email: { 'otp': '381924', 'expires': datetime } }

POST /api/otp/send
  body: { uid/email, password }
  → verify credentials (Werkzeug hash check)
  → generate random.randint(100000, 999999)
  → store with expires = now + 10 min
  → send via SMTP

POST /api/otp/verify
  body: { email, otp }
  → check _otp_store[email]['otp'] matches
  → check not expired
  → delete entry, issue JWT cookie</div>
</div>

---

<div class="tech-section">
<h2>API Endpoints</h2>

<details open>
<summary>Game Maker — <code>/api/game/</code> — <code>api/game_api.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/game/save</td><td>token</td><td>Upsert a game by <code>(user_id, name)</code>. Body: <code>{name, game_data}</code> — <code>game_data</code> can be a JSON string or object; the backend normalises to a string. Returns <code>{id, updated_at}</code>.</td></tr>
<tr><td>GET</td><td>/api/game/list</td><td>token</td><td>All games for the current user, ordered newest first. Returns metadata only (no <code>game_data</code>) — used to populate the editor's "My Games" dropdown.</td></tr>
<tr><td>GET</td><td>/api/game/load/&lt;id&gt;</td><td>token</td><td>Full game record including <code>game_data</code>. Ownership enforced — 404 if the game doesn't belong to the caller.</td></tr>
<tr><td>DELETE</td><td>/api/game/delete/&lt;id&gt;</td><td>token</td><td>Delete a saved game. Ownership enforced.</td></tr>
<tr><td>GET</td><td>/api/game/shared</td><td>—</td><td>All games published by any user — powers the community games gallery.</td></tr>
</table>
</details>

<details open>
<summary>Leaderboard & Comments — <code>/api/game/</code> — <code>api/game_social_api.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/game/score/&lt;id&gt;</td><td>token</td><td>Submit a score. Body: <code>{score, levels_completed}</code>. Only the player's <strong>best score</strong> per game is persisted — if a higher score already exists, the request is a no-op and returns the current best.</td></tr>
<tr><td>GET</td><td>/api/game/leaderboard/&lt;id&gt;</td><td>—</td><td>Top-10 scores for a game, descending. Returns <code>{rank, player, score, levels_completed, played_at}</code> per row. Public — no auth.</td></tr>
<tr><td>GET</td><td>/api/game/comments/&lt;id&gt;</td><td>—</td><td>All comments for a game, newest first. Returns author name, body, timestamp. Public.</td></tr>
<tr><td>POST</td><td>/api/game/comments/&lt;id&gt;</td><td>token</td><td>Post a comment. Body: <code>{body}</code>. Max 500 characters — enforced server-side.</td></tr>
<tr><td>DELETE</td><td>/api/game/comments/&lt;id&gt;/&lt;comment_id&gt;</td><td>token</td><td>Delete a comment. Only the comment's author or an Admin can delete.</td></tr>
</table>
</details>

<details open>
<summary>AI NPC — <code>api/gemini_api.py</code> · <code>api/groq_api.py</code> · <code>api/api_ainpc.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Model</th><th>Used by</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/gemini</td><td>gemini-2.5-flash</td><td><code>UESLCoach.js</code></td><td>Called every ~4.5 s with the player's current game context. Returns a short taunt rendered as a floating speech bubble over the AI coach enemy.</td></tr>
<tr><td>POST</td><td>/api/ainpc/chat</td><td>gemini-2.5-flash</td><td><code>AiNpc.js</code></td><td>Conversational NPC dialogue. Request includes a personality template (historian, merchant, etc.) and the full conversation history array so the model maintains context across turns.</td></tr>
<tr><td>POST</td><td>/api/groq/chat</td><td>LLaMA 3.3-70b</td><td>General chat UI</td><td>General-purpose in-game AI chat using Groq's low-latency inference endpoint.</td></tr>
</table>
</details>

<details open>
<summary>User & Auth — <code>api/user.py</code> · <code>api/otp_api.py</code> · <code>api/pfp.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/authenticate</td><td>—</td><td>Password login (no OTP). Returns JWT cookie on success.</td></tr>
<tr><td>GET</td><td>/api/id</td><td>token</td><td>Current user profile: uid, name, email, role, auth_type, pfp URL.</td></tr>
<tr><td>POST</td><td>/api/user</td><td>—</td><td>Create account. Body: <code>{uid, name, email, password, dob}</code>. If age &lt; 18, a <code>guardian_name</code> field is required.</td></tr>
<tr><td>PUT</td><td>/api/user</td><td>token</td><td>Update profile fields (name, uid, email, password). Change-tracking on frontend — only sends modified fields.</td></tr>
<tr><td>POST</td><td>/api/otp/send</td><td>—</td><td>Validate credentials, generate 6-digit OTP, send via SMTP. 10-minute TTL in memory.</td></tr>
<tr><td>POST</td><td>/api/otp/verify</td><td>—</td><td>Verify OTP code, issue JWT cookie identical to <code>/api/authenticate</code>.</td></tr>
<tr><td>GET</td><td>/api/id/pfp</td><td>token</td><td>Retrieve profile picture (base64-encoded, served as data URI).</td></tr>
<tr><td>PUT</td><td>/api/id/pfp</td><td>token</td><td>Upload profile picture. Body: <code>{pfp: "&lt;base64 string&gt;"}</code>. Stored in the User row.</td></tr>
</table>
</details>

<details open>
<summary>Social — <code>api/presence_api.py</code> · <code>api/social_api.py</code></summary>

<table class="endpoint-table">
<tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/api/heartbeat</td><td>token</td><td>Browser sends every few minutes. Updates an in-memory timestamp for the user. The social sidebar shows a green dot for users active within the last 5 minutes.</td></tr>
<tr><td>GET</td><td>/api/friends</td><td>token</td><td>List accepted friends with online status derived from heartbeat timestamps.</td></tr>
<tr><td>POST</td><td>/api/friends/request</td><td>token</td><td>Send a friend request by UID. Stored in <code>friend_requests</code> table with <code>pending</code> status. Unique constraint on <code>(from_uid, to_uid)</code> prevents duplicates.</td></tr>
<tr><td>POST</td><td>/api/friends/respond</td><td>token</td><td>Accept or decline a pending request. Status transitions: <code>pending → accepted</code> or <code>pending → declined</code>.</td></tr>
<tr><td>GET/POST</td><td>/api/messages/&lt;uid&gt;</td><td>token</td><td>Get or send DMs with a specific user. Messages support text, emoji, and base64-encoded image attachments.</td></tr>
</table>
</details>
</div>

---

<div class="tech-section">
<h2>Real-Time: WebSocket / Socket.IO</h2>

<h3>Multiplayer Rooms — <code>api/multiplayer.py</code></h3>

Runs in the same Flask process as the REST API (Flask-SocketIO on the same port). Rooms are stored in a Python dict — no database involved.

<div class="code-block">_rooms = {
  "A3F9K2": {
    "host_uid":  "player1",
    "host_name": "Player 1",
    "game_data": "{...level JSON...}",    # host's game sent to guest on join
    "game_name": "My Platformer",
    "sids":      {sid_host, sid_guest},   # max 2 players
    "players":   {}
  }
}</div>

<table class="endpoint-table">
<tr><th>Event (client → server)</th><th>Payload</th><th>Effect</th></tr>
<tr><td><code>create_room</code></td><td><code>{uid, name, game_data, game_name, room_id?}</code></td><td>Creates room with auto-generated 8-char uppercase ID (or uses provided). Emits <code>room_created {room_id}</code> back to host.</td></tr>
<tr><td><code>join_room_event</code></td><td><code>{room_id, uid, name}</code></td><td>Validates room exists and has space (&lt;2 players). Sends host's <code>game_data</code> to guest via <code>game_data</code> event. Notifies host via <code>partner_joined</code>.</td></tr>
<tr><td><code>player_update</code></td><td><code>{room_id, x, y, emoji, name}</code></td><td>Relays position to the partner as <code>partner_update</code>. Runs every frame for smooth co-op movement sync.</td></tr>
<tr><td><code>game_event</code></td><td><code>{room_id, type, ...payload}</code></td><td>Relays co-op events (star collected, level cleared) to partner as <code>partner_game_event</code>.</td></tr>
<tr><td><code>disconnect</code></td><td>—</td><td>Removes SID from room, emits <code>partner_left</code> to remaining player, garbage-collects empty rooms.</td></tr>
</table>

<h3>Leaderboard Server — <code>socket/socket_server.py</code> (port 8501)</h3>

Standalone process separate from the main API. Holds all scores in memory for the current session.

<table class="endpoint-table">
<tr><th>Event</th><th>Payload</th><th>Description</th></tr>
<tr><td><code>player_join</code></td><td><code>{name}</code></td><td>Register a player, broadcast join notification to all.</td></tr>
<tr><td><code>player_score</code></td><td><code>{name, score}</code></td><td>Update score in the in-memory store, re-broadcast the full sorted leaderboard to all connected clients.</td></tr>
<tr><td><code>get_leaderboard</code></td><td>—</td><td>Emit current sorted leaderboard to the requesting socket only.</td></tr>
<tr><td><code>clear_leaderboard</code></td><td>—</td><td>Wipe all scores, broadcast empty leaderboard.</td></tr>
</table>
</div>

---

<div class="tech-section">
<h2>Database Models</h2>

All models use SQLAlchemy ORM with SQLite. <code>CASCADE</code> deletes are set on foreign keys so child rows are removed when a parent is deleted.

<div class="model-card">
<strong>User</strong> — table: <code>users</code><br><br>
<code>id</code> PK &nbsp;|&nbsp; <code>_uid</code> unique string &nbsp;|&nbsp; <code>_name</code> &nbsp;|&nbsp; <code>_email</code> &nbsp;|&nbsp; <code>_password</code> Werkzeug hash &nbsp;|&nbsp; <code>_role</code> (Admin / Teacher / Student) &nbsp;|&nbsp; <code>_pfp</code> base64 Text &nbsp;|&nbsp; <code>_auth_type</code> (local / otp / google) &nbsp;|&nbsp; <code>_dob</code> &nbsp;|&nbsp; <code>_guardian_name</code> nullable (populated when age &lt; 18) &nbsp;|&nbsp; <code>totp_enabled</code> bool<br><br>
Relations: one User → many Games, GameScores, GameComments
</div>

<div class="model-card">
<strong>Game</strong> — table: <code>games</code><br><br>
<code>id</code> PK &nbsp;|&nbsp; <code>user_id</code> FK → users &nbsp;|&nbsp; <code>name</code> String(200) &nbsp;|&nbsp; <code>game_data</code> Text (full level JSON) &nbsp;|&nbsp; <code>updated_at</code> DateTime auto-updated<br><br>
Upsert logic: <code>Game.query.filter_by(user_id=user.id, name=name).first()</code> — if found, overwrite <code>game_data</code> and <code>updated_at</code>; otherwise insert new row.
</div>

<div class="model-card">
<strong>GameScore</strong> — table: <code>game_scores</code><br><br>
<code>id</code> PK &nbsp;|&nbsp; <code>game_id</code> FK → games <code>ON DELETE CASCADE</code> &nbsp;|&nbsp; <code>user_id</code> FK → users <code>ON DELETE CASCADE</code> &nbsp;|&nbsp; <code>score</code> int (stars) &nbsp;|&nbsp; <code>levels_completed</code> int &nbsp;|&nbsp; <code>played_at</code> DateTime<br><br>
Best-score enforcement: on submit, if <code>score &gt; existing.score</code>, update; otherwise discard. One row per (game, user) pair.
</div>

<div class="model-card">
<strong>GameComment</strong> — table: <code>game_comments</code><br><br>
<code>id</code> PK &nbsp;|&nbsp; <code>game_id</code> FK → games <code>ON DELETE CASCADE</code> &nbsp;|&nbsp; <code>user_id</code> FK → users <code>ON DELETE CASCADE</code> &nbsp;|&nbsp; <code>body</code> Text (max 500 chars, enforced in API) &nbsp;|&nbsp; <code>posted_at</code> DateTime<br><br>
Deletion: owner or Admin only — enforced in <code>_CommentDelete</code> resource.
</div>
</div>

---

<div class="tech-section">
<h2>Infrastructure</h2>

<h3>Docker Compose</h3>
<ul>
<li><strong>flask-app</strong> — main Flask/SocketIO service, port 8424</li>
<li><strong>socket-server</strong> — standalone leaderboard socket, port 8501</li>
<li>Both share a bind-mounted volume at <code>instance/volumes/</code> for the SQLite database</li>
</ul>

<h3>Nginx</h3>
<ul>
<li>Reverse proxy in front of both services with SSL termination</li>
<li>Config file: <code>nginx_for_uesl</code> in the backend repo root</li>
</ul>

<h3>CORS</h3>
Allowed origins: <code>localhost:4000–4700</code> (local dev), <code>unified-esports-league.github.io</code>, <code>uesl.io</code>, <code>uesl.opencodingsociety.com</code>

<h3>Key Environment Variables (<code>.env</code>)</h3>
<table class="endpoint-table">
<tr><th>Variable</th><th>Purpose</th></tr>
<tr><td><code>FLASK_PORT</code></td><td>REST API port (default 8424)</td></tr>
<tr><td><code>SECRET_KEY</code></td><td>JWT HS256 signing key</td></tr>
<tr><td><code>JWT_TOKEN_NAME</code></td><td>Cookie name for the JWT</td></tr>
<tr><td><code>GROQ_API_KEY</code></td><td>Groq LLaMA inference</td></tr>
<tr><td><code>GEMINI_API_KEY</code></td><td>Google Gemini 2.5 Flash</td></tr>
<tr><td><code>GEMINI_SERVER</code></td><td>Full Gemini API URL</td></tr>
<tr><td><code>SMTP_*</code></td><td>Email server config for OTP delivery</td></tr>
<tr><td><code>IS_PRODUCTION</code></td><td>Switches JWT cookie to <code>secure=True, SameSite=None</code></td></tr>
</table>
</div>
