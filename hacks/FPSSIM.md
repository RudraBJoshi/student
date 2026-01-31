---
layout: default
title: "Future Problem Solvers (FPS) Simulator"
permalink: /FPSSIM/
---

### Automating the Future Problem Solvers Simulation Process With a simple Web App
<!--Firebase config and React app for FPS Simulation-->
<!-- React CDN -->
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- Mammoth.js for DOCX parsing -->
<script src="https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js"></script>

<!-- Firebase Modular CDN -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
  import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCdXPLmJjGeLoL7zBAhpZeCXcwcdJxSawY",
    authDomain: "fps-simulation.firebaseapp.com",
    projectId: "fps-simulation",
    storageBucket: "fps-simulation.firebasestorage.app",
    messagingSenderId: "714327350398",
    appId: "1:714327350398:web:4bf81bb2481aed6e694c2f"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  // Expose to global scope for React component
  window.firebaseDB = db;
  window.firebaseAuth = auth;
  window.firebaseHelpers = { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp };
  window.authHelpers = { signInWithPopup, GoogleAuthProvider: googleProvider, signOut, onAuthStateChanged };
  window.firebaseReady = true;
  window.dispatchEvent(new Event('firebase-ready'));
</script>

<style>
  .fps-container {
    max-width: 900px;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .fps-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  }
  .fps-tab {
    padding: 12px 24px;
    border: none;
    background: #2a2a2a;
    color: #fff;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    font-size: 16px;
    transition: all 0.3s;
  }
  .fps-tab:hover { background: #444; }
  .fps-tab.active { background: #4a9eff; }
  .fps-panel {
    display: none;
    padding: 20px;
    background: #1a1a1a;
    border-radius: 0 0 8px 8px;
  }
  .fps-panel.active { display: block; }
  .fps-section {
    background: #2a2a2a;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  .fps-section h3 {
    color: #4a9eff;
    margin-top: 0;
    border-bottom: 1px solid #444;
    padding-bottom: 10px;
  }
  .fps-input, .fps-textarea, .fps-select {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #444;
    border-radius: 4px;
    background: #333;
    color: #fff;
    font-size: 14px;
    box-sizing: border-box;
  }
  .fps-input:focus, .fps-textarea:focus { outline: none; border-color: #4a9eff; }
  .fps-textarea { min-height: 60px; resize: vertical; }
  .fps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  .fps-label { color: #aaa; font-size: 12px; margin-bottom: 2px; display: block; }
  .fps-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    margin: 5px;
    transition: all 0.3s;
  }
  .fps-btn-primary { background: #4a9eff; color: #fff; }
  .fps-btn-primary:hover { background: #3a8eef; }
  .fps-btn-success { background: #28a745; color: #fff; }
  .fps-btn-success:hover { background: #218838; }
  .fps-btn-danger { background: #dc3545; color: #fff; }
  .fps-btn-danger:hover { background: #c82333; }
  .fps-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .challenge-row, .solution-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .challenge-row span, .solution-row span {
    min-width: 30px;
    color: #4a9eff;
    font-weight: bold;
  }
  .criteria-grid { overflow-x: auto; }
  .criteria-grid table { width: 100%; border-collapse: collapse; }
  .criteria-grid th, .criteria-grid td {
    border: 1px solid #444;
    padding: 8px;
    text-align: center;
  }
  .criteria-grid th { background: #333; color: #4a9eff; }
  .criteria-grid input {
    width: 50px;
    text-align: center;
    padding: 5px;
    border: 1px solid #555;
    background: #333;
    color: #fff;
    border-radius: 4px;
  }
  .total-cell { background: #333; font-weight: bold; color: #4a9eff; }
  .step-indicator {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 20px;
  }
  .step-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .step-dot.active { background: #4a9eff; color: #fff; }
  .step-dot.completed { background: #28a745; color: #fff; }
  .nav-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #444;
  }
  .submission-card {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid #4a9eff;
  }
  .submission-card.pending { border-left-color: #ffc107; }
  .submission-card.reviewed { border-left-color: #28a745; }
  .submission-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .submission-id { font-weight: bold; color: #4a9eff; }
  .submission-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
  }
  .status-pending { background: #ffc107; color: #000; }
  .status-reviewed { background: #28a745; color: #fff; }
  .submission-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    font-size: 14px;
    color: #aaa;
  }
  .no-submissions { text-align: center; padding: 40px; color: #666; }
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 1000;
    justify-content: center;
    align-items: center;
  }
  .modal-overlay.active { display: flex; }
  .modal-content {
    background: #1a1a1a;
    padding: 30px;
    border-radius: 12px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    width: 90%;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #444;
    padding-bottom: 15px;
  }
  .modal-close {
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
  }
  .progress-bar {
    width: 100%;
    height: 8px;
    background: #333;
    border-radius: 4px;
    margin-bottom: 20px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4a9eff, #28a745);
    transition: width 0.3s;
  }
  .loading { text-align: center; padding: 20px; color: #4a9eff; }
  .global-badge {
    background: #28a745;
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    margin-left: 10px;
  }
  .config-warning {
    background: #ff6b35;
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  .password-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .password-box {
    background: #2a2a2a;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    max-width: 350px;
    width: 90%;
  }
  .password-box h3 {
    color: #4a9eff;
    margin-top: 0;
  }
  .password-box input {
    width: 100%;
    padding: 12px;
    margin: 15px 0;
    border: 2px solid #444;
    border-radius: 6px;
    background: #333;
    color: #fff;
    font-size: 16px;
    text-align: center;
    box-sizing: border-box;
  }
  .password-box input.error {
    border-color: #dc3545;
  }
  .password-error {
    color: #dc3545;
    font-size: 14px;
    margin-bottom: 10px;
  }
  /* Assignment styles */
  .assignment-card {
    background: #2a2a2a;
    border: 2px solid #444;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .assignment-card:hover {
    border-color: #4a9eff;
  }
  .assignment-card.selected {
    border-color: #28a745;
    background: #1a3a1a;
  }
  .assignment-title {
    color: #4a9eff;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .assignment-date {
    color: #666;
    font-size: 12px;
  }
  .future-scene-preview {
    background: #1a1a1a;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 15px;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 15px;
    font-size: 14px;
    line-height: 1.6;
  }
  .file-upload-zone {
    border: 2px dashed #444;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 15px;
  }
  .file-upload-zone:hover {
    border-color: #4a9eff;
    background: #1a2a3a;
  }
  .file-upload-zone.dragover {
    border-color: #28a745;
    background: #1a3a1a;
  }
  .admin-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
  }
  .admin-tab {
    padding: 8px 16px;
    border: none;
    background: #333;
    color: #aaa;
    cursor: pointer;
    border-radius: 4px;
    font-size: 13px;
  }
  .admin-tab.active {
    background: #4a9eff;
    color: #fff;
  }
  /* Evaluation styles */
  .eval-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1001;
    overflow-y: auto;
    padding: 20px;
  }
  .eval-content {
    background: #1e1e1e;
    border-radius: 12px;
    max-width: 700px;
    width: 100%;
    margin: 20px auto;
  }
  .eval-header {
    background: #4a9eff;
    padding: 15px 20px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .eval-header h2 {
    margin: 0;
    color: #fff;
  }
  .eval-body {
    padding: 20px;
  }
  .eval-section {
    background: #2a2a2a;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  .eval-section h4 {
    color: #4a9eff;
    margin: 0 0 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .eval-score {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .eval-score input {
    width: 60px;
    padding: 8px;
    border: 2px solid #444;
    border-radius: 4px;
    background: #333;
    color: #fff;
    text-align: center;
    font-size: 16px;
  }
  .eval-score span {
    color: #888;
    font-size: 14px;
  }
  .eval-comment {
    width: 100%;
    padding: 10px;
    border: 2px solid #444;
    border-radius: 6px;
    background: #333;
    color: #fff;
    font-size: 14px;
    resize: vertical;
    min-height: 60px;
    margin-top: 10px;
  }
  .eval-total {
    background: #1a3a1a;
    border: 2px solid #28a745;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 15px;
  }
  .eval-total h3 {
    color: #28a745;
    margin: 0;
    font-size: 24px;
  }
  .eval-total span {
    color: #888;
    font-size: 14px;
  }
  .eval-badge {
    display: inline-block;
    background: #ff6b35;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    margin-left: 10px;
  }
  .eval-badge.graded {
    background: #28a745;
  }
  /* Search styles */
  .search-section {
    background: linear-gradient(135deg, #1a2a3a 0%, #2a3a4a 100%);
    border: 2px solid #4a9eff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .search-section h3 {
    color: #4a9eff;
    margin: 0 0 15px 0;
  }
  .search-bar {
    display: flex;
    gap: 10px;
  }
  .search-bar input {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #444;
    border-radius: 8px;
    background: #1e1e1e;
    color: #fff;
    font-size: 16px;
  }
  .search-bar input:focus {
    border-color: #4a9eff;
    outline: none;
  }
  .search-results {
    margin-top: 15px;
  }
  .search-result-card {
    background: #2a2a2a;
    border: 2px solid #28a745;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .search-result-card:hover {
    background: #1a3a1a;
    transform: translateY(-2px);
  }
  .result-score {
    font-size: 24px;
    color: #28a745;
    font-weight: bold;
  }
  .result-percentage {
    font-size: 14px;
    color: #888;
    margin-left: 10px;
  }
  .no-results {
    color: #888;
    text-align: center;
    padding: 20px;
    background: #1a1a1a;
    border-radius: 8px;
  }
  /* Timer styles */
  .timer-display {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border: 3px solid #ff6b35;
    border-radius: 12px;
    padding: 15px 30px;
    z-index: 999;
    text-align: center;
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
  }
  .timer-display.warning {
    border-color: #ffc107;
    animation: pulse 1s infinite;
  }
  .timer-display.danger {
    border-color: #dc3545;
    animation: pulse 0.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3); }
    50% { box-shadow: 0 4px 30px rgba(255, 107, 53, 0.6); }
  }
  .timer-time {
    font-size: 32px;
    font-weight: bold;
    color: #ff6b35;
    font-family: 'Courier New', monospace;
  }
  .timer-display.warning .timer-time { color: #ffc107; }
  .timer-display.danger .timer-time { color: #dc3545; }
  .timer-label {
    font-size: 12px;
    color: #888;
    margin-bottom: 5px;
  }
  .mode-selection {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }
  .mode-card {
    flex: 1;
    background: #2a2a2a;
    border: 3px solid #444;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
  }
  .mode-card:hover {
    border-color: #4a9eff;
    transform: translateY(-2px);
  }
  .mode-card.selected {
    border-color: #28a745;
    background: #1a3a1a;
  }
  .mode-card h4 {
    color: #4a9eff;
    margin: 0 0 10px 0;
    font-size: 18px;
  }
  .mode-card.selected h4 { color: #28a745; }
  .mode-card p {
    color: #888;
    margin: 0;
    font-size: 14px;
  }
  .mode-card .mode-icon {
    font-size: 36px;
    margin-bottom: 10px;
  }
  .start-timer-btn {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    margin-top: 15px;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
  }
  .start-timer-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
  }
  .start-timer-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  .time-up-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  .time-up-content {
    background: #1e1e1e;
    border: 3px solid #dc3545;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    max-width: 400px;
  }
  .time-up-content h2 {
    color: #dc3545;
    font-size: 36px;
    margin: 0 0 15px 0;
  }
  .time-up-content p {
    color: #888;
    font-size: 16px;
    margin-bottom: 25px;
  }
  /* Toast Notifications */
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .toast {
    padding: 15px 20px;
    border-radius: 8px;
    color: #fff;
    min-width: 280px;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .toast.success { background: linear-gradient(135deg, #28a745, #20863a); }
  .toast.error { background: linear-gradient(135deg, #dc3545, #b02a37); }
  .toast.warning { background: linear-gradient(135deg, #ffc107, #d4a106); color: #000; }
  .toast.info { background: linear-gradient(135deg, #4a9eff, #3a7ecc); }
  .toast-icon { font-size: 20px; }
  .toast-message { flex: 1; }
  .toast-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 18px;
    cursor: pointer;
    opacity: 0.7;
    padding: 0;
  }
  .toast-close:hover { opacity: 1; }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  /* Confirm Modal */
  .confirm-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  }
  .confirm-box {
    background: #2a2a2a;
    padding: 25px 30px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
  }
  .confirm-box h3 {
    color: #fff;
    margin: 0 0 10px 0;
  }
  .confirm-box p {
    color: #aaa;
    margin: 0 0 20px 0;
  }
  .confirm-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  </style>

<div id="fps-root"></div>

{% raw %}
<script type="text/babel">
  const { useState, useEffect, useCallback } = React;

  // ============================================
  // SUPER ADMIN - Cannot be removed
  // ============================================
  const SUPER_ADMIN = "rudraj2022@gmail.com";

  // ============================================
  // MAIN APP COMPONENT
  // ============================================
  function App() {
    const [activeTab, setActiveTab] = useState('simulation');
    const [currentStep, setCurrentStep] = useState(0);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [firebaseReady, setFirebaseReady] = useState(window.firebaseReady || false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [adminEmails, setAdminEmails] = useState([SUPER_ADMIN]);
    const [newAdminEmail, setNewAdminEmail] = useState('');

    // Toast notifications
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    const removeToast = (id) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    };

    const showConfirm = (message, onConfirm) => {
      setConfirmModal({ message, onConfirm });
    };

    const handleConfirm = (confirmed) => {
      if (confirmed && confirmModal?.onConfirm) {
        confirmModal.onConfirm();
      }
      setConfirmModal(null);
    };

    // Assignment state
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [adminSubTab, setAdminSubTab] = useState('submissions');
    const [simSubTab, setSimSubTab] = useState('simulation'); // 'simulation' or 'find'
    const [showHttpsLogger, setShowHttpsLogger] = useState(false);
    const [httpsLogs, setHttpsLogs] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ title: '', futureScene: '', timerMode: 'variable', timerDuration: 120 });
    const [uploadingFile, setUploadingFile] = useState(false);

    // Evaluation state
    const [showEvalModal, setShowEvalModal] = useState(false);
    const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
    const [evaluation, setEvaluation] = useState({
      challenges: { score: 0, comment: '' },
      underlyingProblem: { score: 0, comment: '' },
      solutions: { score: 0, comment: '' },
      criteria: { score: 0, comment: '' },
      evaluationGrid: { score: 0, comment: '' },
      actionPlan: { score: 0, comment: '' },
      overallComments: ''
    });
    const maxScores = {
      challenges: 60,
      underlyingProblem: 30,
      solutions: 60,
      criteria: 20,
      evaluationGrid: 30,
      actionPlan: 100
    };

    // Search state for users to find their graded booklets
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [viewingResult, setViewingResult] = useState(null);

    // Timed mode state
    const [simulationMode, setSimulationMode] = useState('practice'); // 'practice' or 'timed'
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(2 * 60 * 60); // 2 hours in seconds
    const [timerStarted, setTimerStarted] = useState(false);

    // Search for graded booklets by team name
    const searchGradedBooklets = () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const results = submissions.filter(sub =>
        sub.evaluation &&
        sub.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    };

    // Timer countdown effect
    useEffect(() => {
      let interval = null;
      if (timerRunning && timeRemaining > 0) {
        interval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              setTimerRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [timerRunning, timeRemaining]);

    // Format time helper
    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Start timed simulation
    const startTimedSimulation = (durationMinutes = 120) => {
      setTimerStarted(true);
      setTimerRunning(true);
      setTimeRemaining(durationMinutes * 60); // Convert minutes to seconds
      setCurrentStep(1); // Move to first step (Challenges)
    };

    // Reset simulation mode
    const resetSimulation = () => {
      setSimulationMode('practice');
      setTimerRunning(false);
      setTimerStarted(false);
      setTimeRemaining(2 * 60 * 60);
      setCurrentStep(0);
    };

    // HTTPS Logger helper
    const logHttps = (method, endpoint, status = 200) => {
      const startTime = performance.now();
      setHttpsLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        method,
        url: `https://firestore.googleapis.com/v1/projects/fps-simulation/${endpoint}`,
        status,
        duration: `${Math.round(performance.now() - startTime)}ms`
      }]);
    };

    // Load admin emails from Firestore
    useEffect(() => {
      if (!firebaseReady || !window.firebaseDB) return;

      const { collection, onSnapshot } = window.firebaseHelpers;
      const db = window.firebaseDB;

      const unsubscribe = onSnapshot(collection(db, 'fps_admins'), (snapshot) => {
        const emails = [SUPER_ADMIN];
        snapshot.docs.forEach(doc => {
          const email = doc.data().email;
          if (email && !emails.includes(email)) {
            emails.push(email);
          }
        });
        setAdminEmails(emails);
      });

      return () => unsubscribe();
    }, [firebaseReady]);

    // Listen to auth state changes
    useEffect(() => {
      if (!firebaseReady || !window.firebaseAuth) return;

      const { onAuthStateChanged } = window.authHelpers;
      const auth = window.firebaseAuth;

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user && adminEmails.includes(user.email)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      });

      return () => unsubscribe();
    }, [firebaseReady, adminEmails]);

    const handleGoogleSignIn = async () => {
      if (!window.firebaseAuth) return;
      setAuthLoading(true);
      try {
        const { signInWithPopup, GoogleAuthProvider } = window.authHelpers;
        const result = await signInWithPopup(window.firebaseAuth, GoogleAuthProvider);
        if (adminEmails.includes(result.user.email)) {
          setActiveTab('admin');
          showToast('Signed in successfully!', 'success');
        } else {
          showToast('Not authorized as admin. Your email: ' + result.user.email, 'warning');
        }
      } catch (error) {
        console.error('Sign in error:', error);
        showToast('Sign in failed: ' + error.message, 'error');
      }
      setAuthLoading(false);
    };

    // Add new admin email
    const addAdminEmail = async () => {
      if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
        showToast('Please enter a valid email address', 'warning');
        return;
      }
      if (adminEmails.includes(newAdminEmail.trim())) {
        showToast('This email is already an admin', 'warning');
        return;
      }

      const { collection, addDoc } = window.firebaseHelpers;
      const db = window.firebaseDB;

      try {
        await addDoc(collection(db, 'fps_admins'), {
          email: newAdminEmail.trim().toLowerCase(),
          addedBy: currentUser.email,
          addedAt: new Date().toISOString()
        });
        logHttps('POST', 'documents/fps_admins', 200);
        setNewAdminEmail('');
        showToast('Admin added successfully!', 'success');
      } catch (error) {
        console.error('Error adding admin:', error);
        logHttps('POST', 'documents/fps_admins', 500);
        showToast('Error adding admin: ' + error.message, 'error');
      }
    };

    // Remove admin email
    const removeAdminEmail = (emailToRemove) => {
      if (emailToRemove === SUPER_ADMIN) {
        showToast('Cannot remove the super admin', 'error');
        return;
      }
      showConfirm(`Remove ${emailToRemove} from admins?`, async () => {
        const { collection, getDocs, deleteDoc, doc } = window.firebaseHelpers;
        const db = window.firebaseDB;

        try {
          logHttps('GET', 'documents/fps_admins', 200);
          const snapshot = await getDocs(collection(db, 'fps_admins'));
          for (const docSnap of snapshot.docs) {
            if (docSnap.data().email === emailToRemove) {
              await deleteDoc(doc(db, 'fps_admins', docSnap.id));
              logHttps('DELETE', `documents/fps_admins/${docSnap.id}`, 200);
            }
          }
          showToast('Admin removed successfully', 'success');
        } catch (error) {
          console.error('Error removing admin:', error);
          logHttps('DELETE', 'documents/fps_admins', 500);
          showToast('Error removing admin: ' + error.message, 'error');
        }
      });
    };

    const handleSignOut = async () => {
      if (!window.firebaseAuth) return;
      try {
        const { signOut } = window.authHelpers;
        await signOut(window.firebaseAuth);
        setActiveTab('simulation');
      } catch (error) {
        console.error('Sign out error:', error);
      }
    };

    const handleAdminAccess = () => {
      if (isAdmin) {
        setActiveTab('admin');
      } else if (currentUser) {
        showToast('You are signed in but not authorized as admin. Your email: ' + currentUser.email, 'warning');
      } else {
        handleGoogleSignIn();
      }
    };

    // Form state
    const [teamInfo, setTeamInfo] = useState({
      name: '', division: '', topic: '', members: ''
    });
    const [challenges, setChallenges] = useState(Array(16).fill(''));
    const [underlyingProblem, setUnderlyingProblem] = useState({
      who: '', what: '', where: '', when: '', why: '', action: '', outcome: ''
    });
    const [solutions, setSolutions] = useState(Array(16).fill(''));
    const [criteria, setCriteria] = useState(Array(5).fill(''));
    const [selectedSolutions, setSelectedSolutions] = useState([]);
    const [evalScores, setEvalScores] = useState({});
    // Action Plan - dynamic fields with custom labels
    const [actionPlan, setActionPlan] = useState([
      { label: '', content: '' }
    ]);

    // Wait for Firebase to be ready
    useEffect(() => {
      if (window.firebaseReady) {
        setFirebaseReady(true);
      } else {
        const handler = () => setFirebaseReady(true);
        window.addEventListener('firebase-ready', handler);
        return () => window.removeEventListener('firebase-ready', handler);
      }
    }, []);

    // Load submissions from Firebase (real-time)
    useEffect(() => {
      if (!firebaseReady || !window.firebaseDB) return;

      const { collection, query, orderBy, onSnapshot } = window.firebaseHelpers;
      const db = window.firebaseDB;

      setLoading(true);
      const q = query(collection(db, 'fps_submissions'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmissions(subs);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [firebaseReady]);

    // Load assignments from Firebase (real-time)
    useEffect(() => {
      if (!firebaseReady || !window.firebaseDB) return;

      const { collection, query, orderBy, onSnapshot } = window.firebaseHelpers;
      const db = window.firebaseDB;

      const q = query(collection(db, 'fps_assignments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const assigns = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAssignments(assigns);
      }, (error) => {
        console.error("Error fetching assignments:", error);
      });

      return () => unsubscribe();
    }, [firebaseReady]);

    // Handle DOCX file upload
    const handleFileUpload = async (file) => {
      if (!file || !file.name.endsWith('.docx')) {
        showToast('Please upload a .docx file', 'warning');
        return;
      }

      setUploadingFile(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setNewAssignment(prev => ({ ...prev, futureScene: result.value }));
      } catch (error) {
        console.error('Error parsing DOCX:', error);
        showToast('Error parsing DOCX file: ' + error.message, 'error');
      }
      setUploadingFile(false);
    };

    // Create new assignment
    const createAssignment = async () => {
      if (!newAssignment.title.trim() || !newAssignment.futureScene.trim()) {
        showToast('Please provide a title and upload a future scene document', 'warning');
        return;
      }

      const { collection, addDoc, serverTimestamp } = window.firebaseHelpers;
      const db = window.firebaseDB;

      try {
        await addDoc(collection(db, 'fps_assignments'), {
          title: newAssignment.title,
          futureScene: newAssignment.futureScene,
          timerMode: newAssignment.timerMode, // 'timeless', 'timed', or 'variable'
          timerDuration: newAssignment.timerDuration, // duration in minutes
          createdAt: serverTimestamp(),
          active: true
        });
        logHttps('POST', 'documents/fps_assignments', 200);
        setNewAssignment({ title: '', futureScene: '', timerMode: 'variable', timerDuration: 120 });
        showToast('Assignment created successfully!', 'success');
      } catch (error) {
        console.error('Error creating assignment:', error);
        logHttps('POST', 'documents/fps_assignments', 500);
        showToast('Error creating assignment: ' + error.message, 'error');
      }
    };

    // Delete assignment
    const deleteAssignment = (id) => {
      showConfirm('Delete this assignment? This cannot be undone.', async () => {
        const { doc, deleteDoc } = window.firebaseHelpers;
        const db = window.firebaseDB;

        try {
          await deleteDoc(doc(db, 'fps_assignments', id));
          logHttps('DELETE', `documents/fps_assignments/${id}`, 200);
          showToast('Assignment deleted', 'success');
        } catch (error) {
          console.error('Error deleting assignment:', error);
          showToast('Error deleting assignment: ' + error.message, 'error');
        }
      });
    };

    // Open evaluation modal
    const openEvaluation = (submission) => {
      setEvaluatingSubmission(submission);
      // Load existing evaluation if present
      if (submission.evaluation) {
        setEvaluation(submission.evaluation);
      } else {
        setEvaluation({
          challenges: { score: 0, comment: '' },
          underlyingProblem: { score: 0, comment: '' },
          solutions: { score: 0, comment: '' },
          criteria: { score: 0, comment: '' },
          evaluationGrid: { score: 0, comment: '' },
          actionPlan: { score: 0, comment: '' },
          overallComments: ''
        });
      }
      setShowEvalModal(true);
    };

    // Calculate total score
    const getTotalScore = () => {
      return Object.keys(maxScores).reduce((sum, key) => sum + (evaluation[key]?.score || 0), 0);
    };

    const getMaxTotal = () => {
      return Object.values(maxScores).reduce((sum, val) => sum + val, 0);
    };

    // Save evaluation to Firebase
    const saveEvaluation = async () => {
      if (!firebaseReady || !window.firebaseDB || !evaluatingSubmission) return;

      const { doc, updateDoc, serverTimestamp } = window.firebaseHelpers;
      const db = window.firebaseDB;

      try {
        await updateDoc(doc(db, 'fps_submissions', evaluatingSubmission.id), {
          evaluation: {
            ...evaluation,
            totalScore: getTotalScore(),
            maxScore: getMaxTotal(),
            evaluatedAt: new Date().toISOString()
          },
          status: 'evaluated'
        });
        logHttps('PATCH', `documents/fps_submissions/${evaluatingSubmission.id}`, 200);
        showToast('Evaluation saved successfully!', 'success');
        setShowEvalModal(false);
        setEvaluatingSubmission(null);
      } catch (error) {
        console.error('Error saving evaluation:', error);
        logHttps('PATCH', `documents/fps_submissions/${evaluatingSubmission.id}`, 500);
        showToast('Error saving evaluation: ' + error.message, 'error');
      }
    };

    // Submit to Firebase
    const handleSubmit = async () => {
      if (!firebaseReady || !window.firebaseDB) {
        showToast('Firebase not ready! Please wait or refresh.', 'warning');
        return;
      }

      const { collection, addDoc, serverTimestamp } = window.firebaseHelpers;
      const db = window.firebaseDB;

      setLoading(true);

      const data = {
        timestamp: serverTimestamp(),
        status: 'pending',
        assignmentId: selectedAssignment?.id || null,
        assignmentTitle: selectedAssignment?.title || 'Free Practice',
        team: teamInfo,
        challenges: challenges.filter(c => c.trim()),
        underlyingProblem,
        solutions: solutions.map((s, i) => ({ num: i + 1, text: s })).filter(s => s.text.trim()),
        criteria: criteria.filter(c => c.trim()),
        evaluationGrid: selectedSolutions.map(solIdx => ({
          solutionNum: solIdx + 1,
          scores: [1, 2, 3, 4, 5].map(c => evalScores[`${solIdx}-${c}`] || 0),
          total: [1, 2, 3, 4, 5].reduce((sum, c) => sum + (evalScores[`${solIdx}-${c}`] || 0), 0)
        })),
        actionPlan
      };

      try {
        await addDoc(collection(db, 'fps_submissions'), data);
        logHttps('POST', 'documents/fps_submissions', 200);
        showToast('Submission saved globally! Everyone can see it now.', 'success');
        setActiveTab('admin');
        resetForm();
      } catch (error) {
        console.error("Error submitting:", error);
        logHttps('POST', 'documents/fps_submissions', 500);
        showToast('Error submitting: ' + error.message, 'error');
      }

      setLoading(false);
    };

    const resetForm = () => {
      setCurrentStep(0);
      setTeamInfo({ name: '', division: '', topic: '', members: '' });
      setChallenges(Array(16).fill(''));
      setUnderlyingProblem({ who: '', what: '', where: '', when: '', why: '', action: '', outcome: '' });
      setSolutions(Array(16).fill(''));
      setCriteria(Array(5).fill(''));
      setSelectedSolutions([]);
      setEvalScores({});
      setActionPlan([{ label: '', content: '' }]);
    };

    const markReviewed = async (id) => {
      if (!firebaseReady || !window.firebaseDB) return;
      const { doc, updateDoc } = window.firebaseHelpers;
      const db = window.firebaseDB;
      try {
        await updateDoc(doc(db, 'fps_submissions', id), { status: 'reviewed' });
        logHttps('PATCH', `documents/fps_submissions/${id}`, 200);
      } catch (error) {
        logHttps('PATCH', `documents/fps_submissions/${id}`, 500);
      }
    };

    const deleteSubmission = (id) => {
      if (!firebaseReady || !window.firebaseDB) return;
      showConfirm('Delete this submission globally?', async () => {
        const { doc, deleteDoc } = window.firebaseHelpers;
        const db = window.firebaseDB;
        try {
          await deleteDoc(doc(db, 'fps_submissions', id));
          logHttps('DELETE', `documents/fps_submissions/${id}`, 200);
          showToast('Submission deleted', 'success');
        } catch (error) {
          logHttps('DELETE', `documents/fps_submissions/${id}`, 500);
          showToast('Error deleting: ' + error.message, 'error');
        }
      });
    };

    const progress = (currentStep / 6) * 100;

    return (
      <div className="fps-container">
        <h1>Future Problem Solvers Simulator <span className="global-badge">GLOBAL</span></h1>

        {!firebaseReady && (
          <div className="config-warning">
            <strong>Loading Firebase...</strong> Please wait while connecting to the global database. If this persists, check your internet connection.
          </div>
        )}

        <div className="fps-tabs">
          <button
            className={`fps-tab ${activeTab === 'simulation' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulation')}
          >
            Simulation
          </button>
          <button
            className={`fps-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={handleAdminAccess}
          >
            Admin Panel {isAdmin && `(${submissions.length})`}
          </button>
          {currentUser && (
            <button
              className="fps-tab"
              onClick={handleSignOut}
              style={{ marginLeft: 'auto', background: '#dc3545' }}
            >
              Sign Out ({currentUser.email?.split('@')[0]})
            </button>
          )}
        </div>

        {/* SIGN IN PROMPT */}
        {authLoading && (
          <div className="password-modal">
            <div className="password-box">
              <h3>Signing in...</h3>
              <p style={{ color: '#aaa' }}>Please complete sign in with Google</p>
            </div>
          </div>
        )}

        {/* SIMULATION PANEL */}
        <div className={`fps-panel ${activeTab === 'simulation' ? 'active' : ''}`}>
          {/* Simulation Subtabs */}
          <div className="admin-tabs" style={{ marginBottom: 20 }}>
            <button
              className={`admin-tab ${simSubTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setSimSubTab('simulation')}
            >
              📝 New Simulation
            </button>
            <button
              className={`admin-tab ${simSubTab === 'find' ? 'active' : ''}`}
              onClick={() => setSimSubTab('find')}
            >
              🔍 Find Your Booklet
            </button>
          </div>

          {/* Timer Display for Timed Mode */}
          {timerStarted && simulationMode === 'timed' && (
            <div className={`timer-display ${timeRemaining <= 600 ? 'danger' : timeRemaining <= 1800 ? 'warning' : ''}`}>
              <div className="timer-label">TIME REMAINING</div>
              <div className="timer-time">{formatTime(timeRemaining)}</div>
              {timeRemaining <= 600 && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 5 }}>Less than 10 minutes!</div>}
            </div>
          )}

          {/* Time's Up Modal */}
          {timerStarted && timeRemaining === 0 && (
            <div className="time-up-modal">
              <div className="time-up-content">
                <h2>⏰ Time's Up!</h2>
                <p>Your 2 hours have ended. Submit your booklet now or continue reviewing.</p>
                <button
                  className="fps-btn fps-btn-success"
                  style={{ marginRight: 10 }}
                  onClick={handleSubmit}
                >
                  Submit Booklet
                </button>
                <button
                  className="fps-btn fps-btn-primary"
                  onClick={() => setTimeRemaining(1)}
                >
                  Continue Reviewing
                </button>
              </div>
            </div>
          )}

          {/* SIMULATION SUBTAB */}
          {simSubTab === 'simulation' && (
          <>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="step-indicator">
            {[0, 1, 2, 3, 4, 5, 6].map(step => (
              <div
                key={step}
                className={`step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step)}
              >
                {step + 1}
              </div>
            ))}
          </div>
          </>
          )}

          {/* FIND YOUR BOOKLET SUBTAB */}
          {simSubTab === 'find' && (
          <>
          <div className="fps-section">
            <h3>Find Your Graded Booklet</h3>
            <p style={{ color: '#888', marginBottom: 15 }}>Search for your team's graded submission to view feedback and scores.</p>
            <div className="search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && searchGradedBooklets()}
                placeholder="Enter your team name..."
              />
              <button className="fps-btn fps-btn-primary" onClick={searchGradedBooklets}>
                Search
              </button>
            </div>

            {searchQuery && searchResults.length === 0 && (
              <div className="no-results">
                No graded booklets found for "{searchQuery}". Your booklet may not be graded yet.
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="search-results">
                <p style={{ color: '#888', marginBottom: 10 }}>Found {searchResults.length} graded booklet(s):</p>
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="search-result-card"
                    onClick={() => setViewingResult(result)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: 18 }}>{result.team?.name}</strong>
                        <div style={{ color: '#888', fontSize: 13 }}>
                          {result.assignmentTitle || 'Free Practice'} | {result.timestamp?.toDate ? result.timestamp.toDate().toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="result-score">{result.evaluation.totalScore}</span>
                        <span style={{ color: '#888' }}>/{result.evaluation.maxScore}</span>
                        <div className="result-percentage">
                          {Math.round((result.evaluation.totalScore / result.evaluation.maxScore) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VIEW GRADED RESULT MODAL */}
          {viewingResult && (
            <div className="modal-overlay active" onClick={() => setViewingResult(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{viewingResult.team?.name} - Results</h2>
                  <button className="modal-close" onClick={() => setViewingResult(null)}>&times;</button>
                </div>

                <div style={{ background: '#1a3a1a', padding: 15, borderRadius: 8, marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, color: '#28a745', fontWeight: 'bold' }}>
                    {viewingResult.evaluation.totalScore} / {viewingResult.evaluation.maxScore}
                  </div>
                  <div style={{ fontSize: 18, color: '#888' }}>
                    {Math.round((viewingResult.evaluation.totalScore / viewingResult.evaluation.maxScore) * 100)}%
                  </div>
                </div>

                <div style={{ background: '#2a2a2a', padding: 10, borderRadius: 6, marginBottom: 15 }}>
                  <strong style={{ color: '#4a9eff' }}>Assignment:</strong> {viewingResult.assignmentTitle || 'Free Practice'}
                  <br />
                  <strong style={{ color: '#4a9eff' }}>Submitted:</strong> {viewingResult.timestamp?.toDate ? viewingResult.timestamp.toDate().toLocaleString() : 'Recent'}
                </div>

                <h4 style={{ color: '#ff6b35', marginTop: 20 }}>Score Breakdown</h4>
                {[
                  { key: 'challenges', label: 'Step 1: Challenges', max: 60 },
                  { key: 'underlyingProblem', label: 'Step 2: Underlying Problem', max: 30 },
                  { key: 'solutions', label: 'Step 3: Solutions', max: 60 },
                  { key: 'criteria', label: 'Step 4: Criteria', max: 20 },
                  { key: 'evaluationGrid', label: 'Step 5: Evaluation Grid', max: 30 },
                  { key: 'actionPlan', label: 'Step 6: Action Plan', max: 100 }
                ].map(({ key, label, max }) => (
                  <div key={key} style={{ background: '#2a2a2a', padding: 12, borderRadius: 6, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{label}</strong>
                      <span style={{ color: '#4a9eff', fontSize: 18 }}>
                        {viewingResult.evaluation[key]?.score || 0} / {max}
                      </span>
                    </div>
                    {viewingResult.evaluation[key]?.comment && (
                      <div style={{ marginTop: 8, padding: 10, background: '#1a1a1a', borderRadius: 4, borderLeft: '3px solid #4a9eff' }}>
                        <span style={{ color: '#888', fontSize: 12 }}>Feedback:</span>
                        <p style={{ color: '#fff', margin: '5px 0 0 0', fontSize: 14 }}>
                          {viewingResult.evaluation[key].comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {viewingResult.evaluation.overallComments && (
                  <div style={{ background: '#333', padding: 15, borderRadius: 8, marginTop: 20, borderLeft: '4px solid #ff6b35' }}>
                    <strong style={{ color: '#ff6b35' }}>Overall Feedback:</strong>
                    <p style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {viewingResult.evaluation.overallComments}
                    </p>
                  </div>
                )}

                <button
                  className="fps-btn fps-btn-primary"
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => setViewingResult(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          </>
          )}

          {/* SIMULATION STEPS */}
          {simSubTab === 'simulation' && (
          <>
          {/* Step 0: Assignment Selection & Team Info */}
          {currentStep === 0 && (
            <>
            <div className="fps-section">
              <h3>Select Assignment</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Choose an assignment or practice freely</p>

              <div
                className={`assignment-card ${!selectedAssignment ? 'selected' : ''}`}
                onClick={() => setSelectedAssignment(null)}
              >
                <div className="assignment-title">Free Practice</div>
                <div style={{ color: '#888', fontSize: 13 }}>Practice without a specific future scene</div>
              </div>

              {assignments.map(assignment => (
                <div
                  key={assignment.id}
                  className={`assignment-card ${selectedAssignment?.id === assignment.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="assignment-title">{assignment.title}</div>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: assignment.timerMode === 'timeless' ? '#28a745' : assignment.timerMode === 'timed' ? '#ff6b35' : '#4a9eff',
                      color: 'white'
                    }}>
                      {assignment.timerMode === 'timeless' ? '📝 Practice' : assignment.timerMode === 'timed' ? `⏱️ ${assignment.timerDuration || 120}m` : '🔄 Choice'}
                    </span>
                  </div>
                  <div className="assignment-date">
                    {assignment.createdAt?.toDate ? assignment.createdAt.toDate().toLocaleDateString() : 'New'}
                  </div>
                </div>
              ))}

              {selectedAssignment && (
                <div className="future-scene-preview">
                  <strong style={{ color: '#4a9eff' }}>Future Scene:</strong>
                  <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                    {selectedAssignment.futureScene}
                  </div>
                </div>
              )}
            </div>

            {/* Mode Selection - conditional based on assignment timerMode */}
            {(() => {
              const assignmentTimerMode = selectedAssignment?.timerMode || 'variable';
              const timerDuration = selectedAssignment?.timerDuration || 120;

              // Timeless assignment - no mode selection needed, show info
              if (assignmentTimerMode === 'timeless') {
                return (
                  <div className="fps-section" style={{ background: 'linear-gradient(135deg, #1a2a1a 0%, #2a3a2a 100%)', border: '2px solid #28a745' }}>
                    <h3 style={{ color: '#28a745' }}>📝 Practice Mode</h3>
                    <p style={{ color: '#888' }}>This assignment is set to practice mode. Take your time and work at your own pace - no timer!</p>
                  </div>
                );
              }

              // Timed assignment - forced timer, show info
              if (assignmentTimerMode === 'timed') {
                return (
                  <div className="fps-section" style={{ background: 'linear-gradient(135deg, #2a1a1a 0%, #3a2a2a 100%)', border: '2px solid #ff6b35' }}>
                    <h3 style={{ color: '#ff6b35' }}>⏱️ Timed Mode Required</h3>
                    <p style={{ color: '#888' }}>
                      This assignment requires timed completion. You'll have <strong style={{ color: '#ff6b35' }}>{Math.floor(timerDuration / 60)}h {timerDuration % 60}m</strong> to complete the entire booklet.
                    </p>
                  </div>
                );
              }

              // Variable - user chooses
              return (
                <div className="fps-section">
                  <h3>Select Mode</h3>
                  <p style={{ color: '#888', marginBottom: 15 }}>Choose how you want to complete this assignment</p>
                  <div className="mode-selection">
                    <div
                      className={`mode-card ${simulationMode === 'practice' ? 'selected' : ''}`}
                      onClick={() => setSimulationMode('practice')}
                    >
                      <div className="mode-icon">📝</div>
                      <h4>Practice</h4>
                      <p>Take your time, no pressure. Practice at your own pace.</p>
                    </div>
                    <div
                      className={`mode-card ${simulationMode === 'timed' ? 'selected' : ''}`}
                      onClick={() => setSimulationMode('timed')}
                    >
                      <div className="mode-icon">⏱️</div>
                      <h4>Timed</h4>
                      <p>{Math.floor(timerDuration / 60)}h {timerDuration % 60}m to complete. Just like the real competition!</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="fps-section">
              <h3>Team Information</h3>
              <div className="fps-grid">
                <div>
                  <label className="fps-label">Team Name</label>
                  <input
                    className="fps-input"
                    value={teamInfo.name}
                    onChange={e => setTeamInfo({...teamInfo, name: e.target.value})}
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="fps-label">Division</label>
                  <select
                    className="fps-input"
                    value={teamInfo.division}
                    onChange={e => setTeamInfo({...teamInfo, division: e.target.value})}
                  >
                    <option value="">Select Division</option>
                    <option value="Junior">Junior</option>
                    <option value="Middle">Middle</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="fps-label">Topic</label>
                  <input
                    className="fps-input"
                    value={teamInfo.topic}
                    onChange={e => setTeamInfo({...teamInfo, topic: e.target.value})}
                    placeholder="Competition topic"
                  />
                </div>
                <div>
                  <label className="fps-label">Team Members</label>
                  <input
                    className="fps-input"
                    value={teamInfo.members}
                    onChange={e => setTeamInfo({...teamInfo, members: e.target.value})}
                    placeholder="Names (comma separated)"
                  />
                </div>
              </div>
              {(() => {
                const assignmentTimerMode = selectedAssignment?.timerMode || 'variable';
                const timerDuration = selectedAssignment?.timerDuration || 120;

                // Timeless assignment - always practice mode, just proceed
                if (assignmentTimerMode === 'timeless') {
                  return (
                    <div className="nav-buttons">
                      <div></div>
                      <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(1)}>
                        Next: Challenges →
                      </button>
                    </div>
                  );
                }

                // Timed assignment - forced timer
                if (assignmentTimerMode === 'timed') {
                  return (
                    <>
                      <div className="nav-buttons">
                        <div></div>
                        <button
                          className="start-timer-btn"
                          onClick={() => startTimedSimulation(timerDuration)}
                          disabled={!teamInfo.name}
                        >
                          ⏱️ Start {Math.floor(timerDuration / 60)}h {timerDuration % 60}m Timer & Begin
                        </button>
                      </div>
                      {!teamInfo.name && (
                        <p style={{ color: '#ff6b35', fontSize: 13, marginTop: 10, textAlign: 'right' }}>
                          Please enter a team name to start the timed simulation
                        </p>
                      )}
                    </>
                  );
                }

                // Variable - user chooses between practice and timed
                return (
                  <>
                    <div className="nav-buttons">
                      <div></div>
                      {simulationMode === 'practice' ? (
                        <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(1)}>
                          Next: Challenges →
                        </button>
                      ) : (
                        <button
                          className="start-timer-btn"
                          onClick={() => startTimedSimulation(timerDuration)}
                          disabled={!teamInfo.name}
                        >
                          ⏱️ Start {Math.floor(timerDuration / 60)}h {timerDuration % 60}m Timer & Begin
                        </button>
                      )}
                    </div>
                    {simulationMode === 'timed' && !teamInfo.name && (
                      <p style={{ color: '#ff6b35', fontSize: 13, marginTop: 10, textAlign: 'right' }}>
                        Please enter a team name to start the timed simulation
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
            </>
          )}

          {/* Step 1: Challenges */}
          {currentStep === 1 && (
            <div className="fps-section">
              <h3>Step 1: Identify 16 Challenges</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Format: CONDITION + VERB + TOPIC + RESULT</p>
              {challenges.map((challenge, i) => (
                <div key={i} className="challenge-row">
                  <span>{i + 1}.</span>
                  <input
                    className="fps-input"
                    value={challenge}
                    onChange={e => {
                      const newChallenges = [...challenges];
                      newChallenges[i] = e.target.value;
                      setChallenges(newChallenges);
                    }}
                    placeholder={`Challenge ${i + 1}...`}
                  />
                </div>
              ))}
              <div className="nav-buttons">
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(0)}>← Back</button>
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(2)}>Next: Underlying Problem →</button>
              </div>
            </div>
          )}

          {/* Step 2: Underlying Problem */}
          {currentStep === 2 && (
            <div className="fps-section">
              <h3>Step 2: Underlying Problem</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Format: HOW MIGHT WE [action] SO THAT [outcome]?</p>

              <h4 style={{ color: '#4a9eff' }}>Key Parameters</h4>
              <div className="fps-grid">
                {['who', 'what', 'where', 'when', 'why'].map(param => (
                  <div key={param}>
                    <label className="fps-label">{param.toUpperCase()}</label>
                    <input
                      className="fps-input"
                      value={underlyingProblem[param]}
                      onChange={e => setUnderlyingProblem({...underlyingProblem, [param]: e.target.value})}
                      placeholder={`${param.charAt(0).toUpperCase() + param.slice(1)}?`}
                    />
                  </div>
                ))}
              </div>

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Underlying Problem Statement</h4>
              <label className="fps-label">How might we...</label>
              <textarea
                className="fps-textarea"
                value={underlyingProblem.action}
                onChange={e => setUnderlyingProblem({...underlyingProblem, action: e.target.value})}
                placeholder="[action to solve the problem]"
              />
              <label className="fps-label">So that...</label>
              <textarea
                className="fps-textarea"
                value={underlyingProblem.outcome}
                onChange={e => setUnderlyingProblem({...underlyingProblem, outcome: e.target.value})}
                placeholder="[desired outcome]"
              />
              <div className="nav-buttons">
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(1)}>← Back</button>
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(3)}>Next: Solutions →</button>
              </div>
            </div>
          )}

          {/* Step 3: Solutions */}
          {currentStep === 3 && (
            <div className="fps-section">
              <h3>Step 3: Produce 16 Solution Ideas</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Solutions must directly address your Underlying Problem</p>
              {solutions.map((solution, i) => (
                <div key={i} className="solution-row">
                  <span>{i + 1}.</span>
                  <input
                    className="fps-input"
                    value={solution}
                    onChange={e => {
                      const newSolutions = [...solutions];
                      newSolutions[i] = e.target.value;
                      setSolutions(newSolutions);
                    }}
                    placeholder={`Solution ${i + 1}...`}
                  />
                </div>
              ))}
              <div className="nav-buttons">
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(2)}>← Back</button>
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(4)}>Next: Criteria →</button>
              </div>
            </div>
          )}

          {/* Step 4: Criteria */}
          {currentStep === 4 && (
            <div className="fps-section">
              <h3>Step 4: Generate 5 Criteria</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Criteria should be measurable and relevant</p>
              {criteria.map((crit, i) => (
                <div key={i} style={{ marginBottom: 15 }}>
                  <label className="fps-label">Criterion {i + 1}</label>
                  <input
                    className="fps-input"
                    value={crit}
                    onChange={e => {
                      const newCriteria = [...criteria];
                      newCriteria[i] = e.target.value;
                      setCriteria(newCriteria);
                    }}
                    placeholder="e.g., Cost-effective, Feasible, Sustainable..."
                  />
                </div>
              ))}
              <div className="nav-buttons">
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(3)}>← Back</button>
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(5)}>Next: Evaluation Grid →</button>
              </div>
            </div>
          )}

          {/* Step 5: Evaluation Grid */}
          {currentStep === 5 && (
            <div className="fps-section">
              <h3>Step 5: Apply Criteria (Evaluation Grid)</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Select your top 8 solutions and rate each (1-10)</p>

              <label className="fps-label">Select Top 8 Solutions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {solutions.map((sol, i) => sol.trim() && (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#333', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedSolutions.includes(i)}
                      onChange={e => {
                        if (e.target.checked && selectedSolutions.length < 8) {
                          setSelectedSolutions([...selectedSolutions, i]);
                        } else if (!e.target.checked) {
                          setSelectedSolutions(selectedSolutions.filter(s => s !== i));
                        }
                      }}
                    />
                    <span style={{ fontSize: 12 }}>{i + 1}. {sol.substring(0, 25)}{sol.length > 25 ? '...' : ''}</span>
                  </label>
                ))}
              </div>

              {selectedSolutions.length > 0 && (
                <div className="criteria-grid">
                  <table>
                    <thead>
                      <tr>
                        <th>Solution</th>
                        {criteria.map((c, i) => <th key={i}>{c.substring(0, 12) || `C${i + 1}`}</th>)}
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSolutions.map(solIdx => {
                        const total = [1, 2, 3, 4, 5].reduce((sum, c) => sum + (evalScores[`${solIdx}-${c}`] || 0), 0);
                        return (
                          <tr key={solIdx}>
                            <td style={{ textAlign: 'left', padding: 8, fontSize: 12 }}>
                              {solIdx + 1}. {solutions[solIdx].substring(0, 20)}...
                            </td>
                            {[1, 2, 3, 4, 5].map(c => (
                              <td key={c}>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={evalScores[`${solIdx}-${c}`] || ''}
                                  onChange={e => setEvalScores({
                                    ...evalScores,
                                    [`${solIdx}-${c}`]: parseInt(e.target.value) || 0
                                  })}
                                />
                              </td>
                            ))}
                            <td className="total-cell">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="nav-buttons">
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(4)}>← Back</button>
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(6)}>Next: Action Plan →</button>
              </div>
            </div>
          )}

          {/* Step 6: Action Plan */}
          {currentStep === 6 && (
            <div className="fps-section">
              <h3>Step 6: Action Plan</h3>
              <p style={{ color: '#888', marginBottom: 20 }}>Add custom fields to build your action plan. Label each section and fill in the details.</p>

              {actionPlan.map((field, i) => (
                <div key={i} style={{ background: '#333', padding: 15, borderRadius: 8, marginBottom: 15, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ color: '#4a9eff', fontWeight: 'bold' }}>Field {i + 1}</span>
                    {actionPlan.length > 1 && (
                      <button
                        onClick={() => {
                          const newPlan = actionPlan.filter((_, idx) => idx !== i);
                          setActionPlan(newPlan);
                        }}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: 20 }}
                        title="Remove field"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: '#888' }}>Label (what this section covers)</label>
                    <input
                      className="fps-input"
                      value={field.label}
                      onChange={e => {
                        const newPlan = [...actionPlan];
                        newPlan[i] = {...newPlan[i], label: e.target.value};
                        setActionPlan(newPlan);
                      }}
                      placeholder="e.g., Timeline, Resources Needed, Implementation Steps, Expected Outcomes..."
                      style={{ fontWeight: 'bold', borderColor: '#4a9eff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#888' }}>Content</label>
                    <textarea
                      className="fps-textarea"
                      value={field.content}
                      onChange={e => {
                        const newPlan = [...actionPlan];
                        newPlan[i] = {...newPlan[i], content: e.target.value};
                        setActionPlan(newPlan);
                      }}
                      placeholder="Enter the details for this section..."
                      style={{ minHeight: 100 }}
                    />
                  </div>
                </div>
              ))}

              <button
                className="fps-btn fps-btn-primary"
                onClick={() => setActionPlan([...actionPlan, { label: '', content: '' }])}
                style={{ marginBottom: 20, width: '100%' }}
              >
                + Add Field
              </button>

              <div style={{ background: '#1a2a1a', border: '1px solid #28a745', borderRadius: 8, padding: 15, marginBottom: 20 }}>
                <p style={{ color: '#28a745', margin: 0, fontSize: 13 }}>
                  <strong>Tip:</strong> Common action plan sections include: Your solution from step 3 with more details, assistors and resistors, humaness, how it will solve the UP, etc.
                </p>
              </div>

              <div className="nav-buttons">
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(5)}>← Back</button>
                <button
                  className="fps-btn fps-btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Globally'}
                </button>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {/* ADMIN PANEL */}
        <div className={`fps-panel ${activeTab === 'admin' ? 'active' : ''}`}>
          {!isAdmin ? (
            <div className="fps-section" style={{ textAlign: 'center' }}>
              <h3>Admin Access Required</h3>
              <p style={{ color: '#888', marginBottom: 20 }}>Sign in with an authorized Google account to access the admin panel.</p>
              <button className="fps-btn fps-btn-primary" onClick={handleGoogleSignIn} disabled={authLoading}>
                Sign in with Google
              </button>
            </div>
          ) : (
          <>
          <div className="admin-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                className={`admin-tab ${adminSubTab === 'submissions' ? 'active' : ''}`}
                onClick={() => setAdminSubTab('submissions')}
              >
                Submissions ({submissions.length})
              </button>
              <button
                className={`admin-tab ${adminSubTab === 'admins' ? 'active' : ''}`}
                onClick={() => setAdminSubTab('admins')}
              >
                Admins ({adminEmails.length})
              </button>
              <button
                className={`admin-tab ${adminSubTab === 'assignments' ? 'active' : ''}`}
                onClick={() => setAdminSubTab('assignments')}
              >
                Assignments ({assignments.length})
              </button>
            </div>
            <button
              onClick={() => setShowHttpsLogger(true)}
              style={{
                background: 'none',
                border: '2px solid #444',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                color: httpsLogs.length > 0 ? '#28a745' : '#888',
                fontSize: 16,
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseOver={e => { e.target.style.borderColor = '#4a9eff'; e.target.style.color = '#4a9eff'; }}
              onMouseOut={e => { e.target.style.borderColor = '#444'; e.target.style.color = httpsLogs.length > 0 ? '#28a745' : '#888'; }}
              title="HTTPS Logger"
            >
              📡 {httpsLogs.length > 0 && <span style={{ fontSize: 10, position: 'absolute', top: -5, right: -5, background: '#28a745', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{httpsLogs.length}</span>}
            </button>
          </div>

          {/* HTTPS LOGGER MODAL */}
          {showHttpsLogger && (
            <div className="modal-overlay active" onClick={() => setShowHttpsLogger(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
                <div className="modal-header">
                  <h2>📡 HTTPS Logger</h2>
                  <button className="modal-close" onClick={() => setShowHttpsLogger(false)}>&times;</button>
                </div>
                <div style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <p style={{ color: '#888', margin: 0 }}>
                      Network requests made by this app ({httpsLogs.length} logged)
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="fps-btn fps-btn-primary"
                        onClick={() => {
                          setHttpsLogs(prev => [...prev, {
                            id: Date.now(),
                            timestamp: new Date().toLocaleTimeString(),
                            method: 'TEST',
                            url: 'https://example.com/test',
                            status: 200,
                            duration: '50ms'
                          }]);
                        }}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        + Test Log
                      </button>
                      <button
                        className="fps-btn fps-btn-danger"
                        onClick={() => setHttpsLogs([])}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div style={{ maxHeight: 400, overflowY: 'auto', background: '#0d1117', borderRadius: 8, padding: 10 }}>
                    {httpsLogs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                        <p>No requests logged yet</p>
                        <p style={{ fontSize: 12 }}>Network activity will appear here</p>
                      </div>
                    ) : (
                      httpsLogs.slice().reverse().map(log => (
                        <div
                          key={log.id}
                          style={{
                            background: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: 6,
                            padding: 12,
                            marginBottom: 8,
                            fontFamily: 'monospace',
                            fontSize: 13
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                background: log.method === 'GET' ? '#238636' : log.method === 'POST' ? '#1f6feb' : log.method === 'DELETE' ? '#da3633' : '#8b949e',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 'bold'
                              }}>
                                {log.method}
                              </span>
                              <span style={{
                                background: log.status >= 200 && log.status < 300 ? '#238636' : log.status >= 400 ? '#da3633' : '#8b949e',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 11
                              }}>
                                {log.status}
                              </span>
                            </div>
                            <span style={{ color: '#8b949e', fontSize: 11 }}>{log.timestamp} • {log.duration}</span>
                          </div>
                          <div style={{ color: '#58a6ff', wordBreak: 'break-all' }}>{log.url}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginTop: 15, padding: 12, background: '#1a1a2e', borderRadius: 8, border: '1px solid #333' }}>
                    <p style={{ color: '#4a9eff', margin: '0 0 8px 0', fontSize: 13, fontWeight: 'bold' }}>📊 Firebase Endpoints</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: '#888' }}>
                      <div>• firestore.googleapis.com</div>
                      <div>• identitytoolkit.googleapis.com</div>
                      <div>• securetoken.googleapis.com</div>
                      <div>• fps-simulation.firebaseapp.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {adminSubTab === 'submissions' && (
            <div className="fps-section">
              <h3>Global Submissions</h3>
              <p style={{ color: '#888', marginBottom: 15 }}>Real-time updates from all users worldwide</p>

              {loading ? (
                <div className="loading">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="no-submissions">No submissions yet. Be the first to submit!</div>
              ) : (
                submissions.map(sub => (
                  <div key={sub.id} className={`submission-card ${sub.status}`}>
                    <div className="submission-header">
                      <span className="submission-id">{sub.team?.name || 'Anonymous'}</span>
                      <span className={`submission-status status-${sub.status}`}>
                        {sub.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="submission-details">
                      <div><strong>Assignment:</strong> {sub.assignmentTitle || 'Free Practice'}</div>
                      <div><strong>Division:</strong> {sub.team?.division || 'N/A'}</div>
                      <div><strong>Challenges:</strong> {sub.challenges?.length || 0}/16</div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                      {sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleString() : 'Just now'}
                    </div>
                    {sub.evaluation && (
                      <div style={{ marginTop: 10, padding: 8, background: '#1a3a1a', borderRadius: 4 }}>
                        <strong style={{ color: '#28a745' }}>Score: {sub.evaluation.totalScore}/{sub.evaluation.maxScore}</strong>
                        <span style={{ color: '#888', marginLeft: 10, fontSize: 12 }}>
                          ({Math.round((sub.evaluation.totalScore / sub.evaluation.maxScore) * 100)}%)
                        </span>
                      </div>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <button className="fps-btn fps-btn-primary" onClick={() => setSelectedSubmission(sub)}>
                        View
                      </button>
                      <button
                        className="fps-btn"
                        style={{ background: '#ff6b35' }}
                        onClick={() => openEvaluation(sub)}
                      >
                        {sub.evaluation ? 'Edit Evaluation' : 'Evaluate'}
                      </button>
                      <button className="fps-btn fps-btn-success" onClick={() => markReviewed(sub.id)}>
                        Mark Reviewed
                      </button>
                      <button className="fps-btn fps-btn-danger" onClick={() => deleteSubmission(sub.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {adminSubTab === 'assignments' && (
            <>
              <div className="fps-section">
                <h3>Create New Assignment</h3>
                <div style={{ marginBottom: 15 }}>
                  <label className="fps-label">Assignment Title</label>
                  <input
                    className="fps-input"
                    value={newAssignment.title}
                    onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g., Practice Booklet #1 - Climate Change"
                  />
                </div>

                <label className="fps-label">Future Scene (Upload DOCX)</label>
                <div
                  className="file-upload-zone"
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                    const file = e.dataTransfer.files[0];
                    handleFileUpload(file);
                  }}
                  onClick={() => document.getElementById('docx-upload').click()}
                >
                  <input
                    type="file"
                    id="docx-upload"
                    accept=".docx"
                    style={{ display: 'none' }}
                    onChange={e => handleFileUpload(e.target.files[0])}
                  />
                  {uploadingFile ? (
                    <span style={{ color: '#4a9eff' }}>Processing DOCX...</span>
                  ) : newAssignment.futureScene ? (
                    <span style={{ color: '#28a745' }}>✓ Future scene loaded ({newAssignment.futureScene.length} characters)</span>
                  ) : (
                    <span style={{ color: '#888' }}>Drop DOCX file here or click to upload</span>
                  )}
                </div>

                {newAssignment.futureScene && (
                  <div className="future-scene-preview">
                    <strong style={{ color: '#4a9eff' }}>Preview:</strong>
                    <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                      {newAssignment.futureScene.substring(0, 500)}
                      {newAssignment.futureScene.length > 500 && '...'}
                    </div>
                  </div>
                )}

                {/* Timer Mode Selection */}
                <div style={{ marginTop: 20 }}>
                  <label className="fps-label">Timer Mode</label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                      className={`fps-btn ${newAssignment.timerMode === 'timeless' ? 'fps-btn-success' : ''}`}
                      style={{ flex: 1, background: newAssignment.timerMode === 'timeless' ? '#28a745' : '#333' }}
                      onClick={() => setNewAssignment({...newAssignment, timerMode: 'timeless'})}
                    >
                      📝 Timeless
                    </button>
                    <button
                      className={`fps-btn ${newAssignment.timerMode === 'timed' ? 'fps-btn-success' : ''}`}
                      style={{ flex: 1, background: newAssignment.timerMode === 'timed' ? '#28a745' : '#333' }}
                      onClick={() => setNewAssignment({...newAssignment, timerMode: 'timed'})}
                    >
                      ⏱️ Timed
                    </button>
                    <button
                      className={`fps-btn ${newAssignment.timerMode === 'variable' ? 'fps-btn-success' : ''}`}
                      style={{ flex: 1, background: newAssignment.timerMode === 'variable' ? '#28a745' : '#333' }}
                      onClick={() => setNewAssignment({...newAssignment, timerMode: 'variable'})}
                    >
                      🔄 User Choice
                    </button>
                  </div>
                  <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
                    {newAssignment.timerMode === 'timeless' && 'Students can take as long as they need - no timer shown.'}
                    {newAssignment.timerMode === 'timed' && 'Students must complete within the time limit.'}
                    {newAssignment.timerMode === 'variable' && 'Students choose between practice (untimed) or timed mode.'}
                  </p>
                </div>

                {/* Timer Duration (for timed and variable modes) */}
                {newAssignment.timerMode !== 'timeless' && (
                  <div style={{ marginTop: 15 }}>
                    <label className="fps-label">Timer Duration (minutes)</label>
                    <input
                      type="number"
                      className="fps-input"
                      value={newAssignment.timerDuration}
                      onChange={e => setNewAssignment({...newAssignment, timerDuration: parseInt(e.target.value) || 120})}
                      min="10"
                      max="300"
                      style={{ width: 120 }}
                    />
                    <span style={{ color: '#888', marginLeft: 10 }}>
                      ({Math.floor(newAssignment.timerDuration / 60)}h {newAssignment.timerDuration % 60}m)
                    </span>
                  </div>
                )}

                <button
                  className="fps-btn fps-btn-success"
                  onClick={createAssignment}
                  disabled={!newAssignment.title || !newAssignment.futureScene}
                  style={{ marginTop: 15 }}
                >
                  Create Assignment
                </button>
              </div>

              <div className="fps-section">
                <h3>Existing Assignments</h3>
                {assignments.length === 0 ? (
                  <div className="no-submissions">No assignments yet. Create one above!</div>
                ) : (
                  assignments.map(assignment => (
                    <div key={assignment.id} className="submission-card">
                      <div className="submission-header">
                        <span className="submission-id">{assignment.title}</span>
                      </div>
                      <div style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>
                        Created: {assignment.createdAt?.toDate ? assignment.createdAt.toDate().toLocaleDateString() : 'New'}
                      </div>
                      <div style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>
                        {assignment.futureScene?.substring(0, 150)}...
                      </div>
                      <button
                        className="fps-btn fps-btn-danger"
                        onClick={() => deleteAssignment(assignment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ADMINS TAB */}
          {adminSubTab === 'admins' && (
            <div className="fps-section">
              <h3>Manage Admin Access</h3>
              <p style={{ color: '#888', marginBottom: 20 }}>Add or remove Gmail accounts that can access the admin panel.</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input
                  className="fps-input"
                  style={{ flex: 1 }}
                  type="email"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addAdminEmail()}
                  placeholder="Enter Gmail address..."
                />
                <button className="fps-btn fps-btn-success" onClick={addAdminEmail}>
                  Add Admin
                </button>
              </div>

              <h4 style={{ color: '#4a9eff', marginBottom: 10 }}>Current Admins ({adminEmails.length})</h4>
              {adminEmails.map(email => (
                <div key={email} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#2a2a2a',
                  padding: '12px 15px',
                  borderRadius: 6,
                  marginBottom: 8,
                  borderLeft: email === SUPER_ADMIN ? '4px solid #ffc107' : '4px solid #4a9eff'
                }}>
                  <div>
                    <span style={{ color: '#fff' }}>{email}</span>
                    {email === SUPER_ADMIN && (
                      <span style={{
                        background: '#ffc107',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        marginLeft: 10
                      }}>SUPER ADMIN</span>
                    )}
                    {email === currentUser?.email && (
                      <span style={{
                        background: '#4a9eff',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        marginLeft: 10
                      }}>YOU</span>
                    )}
                  </div>
                  {email !== SUPER_ADMIN && (
                    <button
                      className="fps-btn fps-btn-danger"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => removeAdminEmail(email)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="fps-section">
            <h3>Scoring Rubric</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#333' }}>
                  <th style={{ padding: 10, textAlign: 'left', border: '1px solid #444' }}>Component</th>
                  <th style={{ padding: 10, textAlign: 'center', border: '1px solid #444' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: 8, border: '1px solid #444' }}>Step 1: Challenges</td><td style={{ textAlign: 'center', border: '1px solid #444' }}>48 pts</td></tr>
                <tr><td style={{ padding: 8, border: '1px solid #444' }}>Step 2: Underlying Problem</td><td style={{ textAlign: 'center', border: '1px solid #444' }}>25 pts</td></tr>
                <tr><td style={{ padding: 8, border: '1px solid #444' }}>Step 3: Solutions</td><td style={{ textAlign: 'center', border: '1px solid #444' }}>48 pts</td></tr>
                <tr><td style={{ padding: 8, border: '1px solid #444' }}>Step 4: Criteria</td><td style={{ textAlign: 'center', border: '1px solid #444' }}>15 pts</td></tr>
                <tr><td style={{ padding: 8, border: '1px solid #444' }}>Step 5: Grid</td><td style={{ textAlign: 'center', border: '1px solid #444' }}>20 pts</td></tr>
                <tr><td style={{ padding: 8, border: '1px solid #444' }}>Step 6: Action Plan</td><td style={{ textAlign: 'center', border: '1px solid #444' }}>44 pts</td></tr>
                <tr style={{ background: '#333', fontWeight: 'bold' }}>
                  <td style={{ padding: 10, border: '1px solid #444' }}>TOTAL</td>
                  <td style={{ textAlign: 'center', border: '1px solid #444', color: '#4a9eff' }}>200 pts</td>
                </tr>
              </tbody>
            </table>
          </div>
          </>
          )}
        </div>

        {/* VIEW MODAL */}
        {selectedSubmission && (
          <div className="modal-overlay active" onClick={() => setSelectedSubmission(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedSubmission.team?.name || 'Submission'}</h2>
                <button className="modal-close" onClick={() => setSelectedSubmission(null)}>&times;</button>
              </div>

              <div style={{ background: '#1a3a1a', padding: 10, borderRadius: 6, marginBottom: 15 }}>
                <strong style={{ color: '#28a745' }}>Assignment:</strong> {selectedSubmission.assignmentTitle || 'Free Practice'}
              </div>

              <h4 style={{ color: '#4a9eff' }}>Team Information</h4>
              <p><strong>Division:</strong> {selectedSubmission.team?.division} | <strong>Topic:</strong> {selectedSubmission.team?.topic}</p>
              <p><strong>Members:</strong> {selectedSubmission.team?.members}</p>

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Challenges ({selectedSubmission.challenges?.length}/16)</h4>
              <ol style={{ marginLeft: 20 }}>
                {selectedSubmission.challenges?.map((c, i) => <li key={i}>{c}</li>)}
              </ol>

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Underlying Problem</h4>
              <p><strong>WHO:</strong> {selectedSubmission.underlyingProblem?.who}</p>
              <p><strong>WHAT:</strong> {selectedSubmission.underlyingProblem?.what}</p>
              <p><strong>WHERE:</strong> {selectedSubmission.underlyingProblem?.where}</p>
              <p><strong>WHEN:</strong> {selectedSubmission.underlyingProblem?.when}</p>
              <p><strong>WHY:</strong> {selectedSubmission.underlyingProblem?.why}</p>
              <p style={{ background: '#333', padding: 10, borderRadius: 4, marginTop: 10 }}>
                <em>How might we {selectedSubmission.underlyingProblem?.action} so that {selectedSubmission.underlyingProblem?.outcome}?</em>
              </p>

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Solutions ({selectedSubmission.solutions?.length}/16)</h4>
              <ol style={{ marginLeft: 20 }}>
                {selectedSubmission.solutions?.map((s, i) => <li key={i}>{s.text}</li>)}
              </ol>

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Criteria</h4>
              <ol style={{ marginLeft: 20 }}>
                {selectedSubmission.criteria?.map((c, i) => <li key={i}>{c}</li>)}
              </ol>

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Action Plan</h4>
              {Array.isArray(selectedSubmission.actionPlan) ? (
                selectedSubmission.actionPlan.map((field, i) => (
                  <div key={i} style={{ background: '#333', padding: 12, borderRadius: 6, marginBottom: 10 }}>
                    <strong style={{ color: '#4a9eff' }}>{field.label || `Field ${i + 1}`}:</strong>
                    <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>{field.content}</p>
                  </div>
                ))
              ) : (
                <>
                  <p><strong>Summary:</strong> {selectedSubmission.actionPlan?.summary}</p>
                  <p><strong>How it addresses UP:</strong> {selectedSubmission.actionPlan?.addressUP}</p>
                  <p><strong>Expected Outcomes:</strong> {selectedSubmission.actionPlan?.outcomes}</p>
                  <p><strong>Humaneness:</strong> {selectedSubmission.actionPlan?.humaneness}</p>
                </>
              )}

              {/* Display Evaluation if exists */}
              {selectedSubmission.evaluation && (
                <>
                  <h4 style={{ color: '#ff6b35', marginTop: 30, borderTop: '2px solid #ff6b35', paddingTop: 15 }}>
                    Evaluation Results
                  </h4>
                  <div style={{ background: '#1a3a1a', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                    <h3 style={{ color: '#28a745', margin: 0, textAlign: 'center' }}>
                      Total Score: {selectedSubmission.evaluation.totalScore}/{selectedSubmission.evaluation.maxScore}
                      ({Math.round((selectedSubmission.evaluation.totalScore / selectedSubmission.evaluation.maxScore) * 100)}%)
                    </h3>
                  </div>
                  {[
                    { key: 'challenges', label: 'Challenges', max: 60 },
                    { key: 'underlyingProblem', label: 'Underlying Problem', max: 30 },
                    { key: 'solutions', label: 'Solutions', max: 60 },
                    { key: 'criteria', label: 'Criteria', max: 20 },
                    { key: 'evaluationGrid', label: 'Evaluation Grid', max: 30 },
                    { key: 'actionPlan', label: 'Action Plan', max: 100 }
                  ].map(({ key, label, max }) => (
                    <div key={key} style={{ background: '#2a2a2a', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{label}</strong>
                        <span style={{ color: '#4a9eff' }}>{selectedSubmission.evaluation[key]?.score || 0}/{max}</span>
                      </div>
                      {selectedSubmission.evaluation[key]?.comment && (
                        <p style={{ color: '#888', fontSize: 13, margin: '5px 0 0 0' }}>
                          {selectedSubmission.evaluation[key].comment}
                        </p>
                      )}
                    </div>
                  ))}
                  {selectedSubmission.evaluation.overallComments && (
                    <div style={{ background: '#333', padding: 15, borderRadius: 8, marginTop: 15 }}>
                      <strong style={{ color: '#ff6b35' }}>Overall Comments:</strong>
                      <p style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>{selectedSubmission.evaluation.overallComments}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* EVALUATION MODAL */}
        {showEvalModal && evaluatingSubmission && (
          <div className="eval-modal" onClick={() => setShowEvalModal(false)}>
            <div className="eval-content" onClick={e => e.stopPropagation()}>
              <div className="eval-header">
                <h2>Evaluate: {evaluatingSubmission.team?.name || 'Submission'}</h2>
                <button className="modal-close" onClick={() => setShowEvalModal(false)}>&times;</button>
              </div>
              <div className="eval-body">
                <div className="eval-total">
                  <h3>{getTotalScore()} / {getMaxTotal()}</h3>
                  <span>Total Score ({Math.round((getTotalScore() / getMaxTotal()) * 100)}%)</span>
                </div>

                {[
                  { key: 'challenges', label: 'Step 1: Challenges', max: 60 },
                  { key: 'underlyingProblem', label: 'Step 2: Underlying Problem', max: 30 },
                  { key: 'solutions', label: 'Step 3: Solutions', max: 60 },
                  { key: 'criteria', label: 'Step 4: Criteria', max: 20 },
                  { key: 'evaluationGrid', label: 'Step 5: Evaluation Grid', max: 30 },
                  { key: 'actionPlan', label: 'Step 6: Action Plan', max: 100 }
                ].map(({ key, label, max }) => (
                  <div key={key} className="eval-section">
                    <h4>
                      {label}
                      <div className="eval-score">
                        <input
                          type="number"
                          min="0"
                          max={max}
                          value={evaluation[key]?.score || 0}
                          onChange={e => setEvaluation({
                            ...evaluation,
                            [key]: { ...evaluation[key], score: Math.min(max, Math.max(0, parseInt(e.target.value) || 0)) }
                          })}
                        />
                        <span>/ {max}</span>
                      </div>
                    </h4>
                    <textarea
                      className="eval-comment"
                      placeholder={`Comments for ${label}...`}
                      value={evaluation[key]?.comment || ''}
                      onChange={e => setEvaluation({
                        ...evaluation,
                        [key]: { ...evaluation[key], comment: e.target.value }
                      })}
                    />
                  </div>
                ))}

                <div className="eval-section">
                  <h4>Overall Comments</h4>
                  <textarea
                    className="eval-comment"
                    style={{ minHeight: 100 }}
                    placeholder="Overall feedback, strengths, areas for improvement..."
                    value={evaluation.overallComments || ''}
                    onChange={e => setEvaluation({ ...evaluation, overallComments: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button className="fps-btn fps-btn-success" style={{ flex: 1 }} onClick={saveEvaluation}>
                    Save Evaluation
                  </button>
                  <button className="fps-btn fps-btn-danger" onClick={() => setShowEvalModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATIONS */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              <span className="toast-icon">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'warning' && '⚠'}
                {toast.type === 'info' && 'ℹ'}
              </span>
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
            </div>
          ))}
        </div>

        {/* CONFIRM MODAL */}
        {confirmModal && (
          <div className="confirm-modal" onClick={() => handleConfirm(false)}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
              <h3>Confirm Action</h3>
              <p>{confirmModal.message}</p>
              <div className="confirm-buttons">
                <button className="fps-btn fps-btn-danger" onClick={() => handleConfirm(true)}>
                  Yes, Delete
                </button>
                <button className="fps-btn fps-btn-primary" onClick={() => handleConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render the app
  const root = ReactDOM.createRoot(document.getElementById('fps-root'));
  root.render(<App />);
</script>
{% endraw %}

