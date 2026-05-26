---
layout: default
title: CTE Career Fair - Feature Highlights
permalink: /blogs/highlights/
---

At the CTE Expo, I had the chance to showcase the features I built for the Unified Esports League (UESL) website. Below are some of the highlights from my project, including the social system, login flow, and preferences page. Each section includes a breakdown of the key features and how they work together to create a seamless user experience for UESL participants.


<style>
  .hl-section { margin-bottom: 2.5rem; }
  .hl-section h2 { border-bottom: 2px solid #6366f1; padding-bottom: 0.4rem; color: #6366f1; }
  .hl-section h3 { color: #a78bfa; margin-top: 1.4rem; margin-bottom: 0.5rem; }
  .feature-card { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; }
  .feature-card strong { color: #c4b5fd; }
  .step { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 12px; }
  .step-num { background: #6366f1; color: #fff; font-weight: 700; font-size: 0.85rem; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .step-body { flex: 1; }
  .step-body strong { color: #c4b5fd; }
  .tag { display: inline-block; background: #1e1e2e; color: #a78bfa; border: 1px solid #6366f1; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; margin: 2px; font-family: monospace; }
</style>

<div class="hl-section">
<h2>Social System</h2>

<p>One of the features I built for UESL is a full social hub embedded into the site — accessible from any page via the nav bar. It was designed so UESL participants could communicate and stay connected without leaving the platform.</p>

<h3>Friend System</h3>
<div class="feature-card">
<strong>Finding &amp; adding friends</strong> — Users can search by UID, send a friend request, and the recipient gets a live notification badge on their social button. Requests are stored in the <code>friend_requests</code> table with a <code>pending → accepted / declined</code> status flow. A unique constraint on <code>(from_uid, to_uid)</code> prevents duplicate requests.
</div>
<div class="feature-card">
<strong>Online presence</strong> — Every user's browser sends a heartbeat to <code>POST /api/heartbeat</code> every few minutes. The social sidebar shows a green dot for users active in the last 5 minutes, grey for offline — powered by an in-memory presence store on the backend (<code>api/presence_api.py</code>).
</div>

<h3>Direct Messaging</h3>
<div class="feature-card">
<strong>Chat UI</strong> — The social overlay opens full-screen with a friend list sidebar on the left and a chat panel on the right. Messages are styled in bubbles: sent messages in cyan, received in dark surface — similar to a standard messaging app. Timestamps and day-divider labels group conversations.
</div>
<div class="feature-card">
<strong>Emoji &amp; image sharing</strong> — An emoji picker lets users add reactions inline. Images can be shared directly in chat and open in a lightbox overlay when clicked.
</div>
<div class="feature-card">
<strong>Invite toasts</strong> — When someone sends a game invite, a toast notification pops up at the bottom of the screen with a <em>Join</em> and <em>Dismiss</em> button. If the user has pending friend requests, a red dot appears on their social nav button.
</div>
</div>

---

<div class="hl-section">
<h2>Login System</h2>

<p>The login page (<code>navigation/authentication/login.md</code>) supports two flows — signing in and creating an account — both using OTP email verification as a second factor. This was important for UESL because many participants are minors, so we needed a verified identity without relying on passwords alone.</p>

<h3>Sign In Flow</h3>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body"><strong>User ID + Password</strong> — User enters their credentials. On submit, the frontend calls <code>POST /api/otp/send</code> with the credentials.</div>
</div>
<div class="step">
  <div class="step-num">2</div>
  <div class="step-body"><strong>OTP sent to email</strong> — If credentials are valid, the backend generates a 6-digit code, stores it in memory with a TTL, and sends it via SMTP. In dev mode, the code is displayed directly on the page.</div>
</div>
<div class="step">
  <div class="step-num">3</div>
  <div class="step-body"><strong>Verify &amp; sign in</strong> — User enters the code. <code>POST /api/otp/verify</code> checks it and returns a JWT cookie. The page then redirects to home.</div>
</div>

<h3>Registration Flow</h3>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body"><strong>Email verification</strong> — User enters their email, receives an OTP, and verifies ownership before seeing any other fields.</div>
</div>
<div class="step">
  <div class="step-num">2</div>
  <div class="step-body"><strong>Account details</strong> — After email is verified, the user fills in name, UID, age, and password. If age is under 18, a <strong>parent/guardian name</strong> field appears automatically.</div>
</div>
<div class="step">
  <div class="step-num">3</div>
  <div class="step-body"><strong>Account created</strong> — <code>POST /api/user</code> creates the record. The user is signed in immediately and redirected to home.</div>
</div>

<p>The whole UI is a single-card tabbed component — Sign In and Create Account switch without any page reload.</p>
</div>

---

<div class="hl-section">
<h2>Preferences Page</h2>

<p>The profile/preferences page (<code>/profile</code>) lets users manage their account details, security settings, and how they appear on the platform.</p>

<h3>Personal Information</h3>
<div class="feature-card">
Users can update their <strong>display name</strong>, <strong>User ID</strong>, <strong>email address</strong>, and <strong>password</strong> from a single form. Changes are tracked — the save button only activates when something has actually been modified, preventing accidental empty saves.
</div>

<h3>Two-Factor Authentication</h3>
<div class="feature-card">
A toggle switch enables or disables 2FA (OTP-on-login). When on, every sign-in triggers an email verification step. This was added specifically for UESL participants whose accounts may be shared or accessed across multiple devices at tech centers.
</div>

<h3>Minor Protection</h3>
<div class="feature-card">
If the user sets their age to under 18, a <strong>parent/guardian name</strong> field appears on both the registration form and the preferences page. This satisfies UESL's requirement to record a responsible adult for every minor participant.
</div>

<h3>Profile Picture</h3>
<div class="feature-card">
Users can upload a custom profile picture which is encoded as base64 and sent to <code>PUT /api/id/pfp</code>. The image is stored server-side and returned on subsequent <code>GET /api/id/pfp</code> calls. It appears as their avatar in the social hub, friend list, and chat bubbles.
</div>
</div>
