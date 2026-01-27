---
layout: default
title: "Future Problem Solvers (FPS) Simulator"
permalink: /FPSSIM/
---

<!-- React CDN -->
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- Firebase Modular CDN -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

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

  // Expose to global scope for React component
  window.firebaseDB = db;
  window.firebaseHelpers = { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp };
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
</style>

<div id="fps-root"></div>

<script type="text/babel">
  const { useState, useEffect, useCallback } = React;

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
    const [actionPlan, setActionPlan] = useState({
      summary: '',
      steps: Array(5).fill({ action: '', who: '', when: '' }),
      addressUP: '',
      outcomes: '',
      humaneness: ''
    });

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

    // Submit to Firebase
    const handleSubmit = async () => {
      if (!firebaseReady || !window.firebaseDB) {
        alert('Firebase not ready! Please wait or refresh.');
        return;
      }

      const { collection, addDoc, serverTimestamp } = window.firebaseHelpers;
      const db = window.firebaseDB;

      setLoading(true);

      const data = {
        timestamp: serverTimestamp(),
        status: 'pending',
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
        alert('Submission saved globally! Everyone can see it now.');
        setActiveTab('admin');
        resetForm();
      } catch (error) {
        console.error("Error submitting:", error);
        alert('Error submitting: ' + error.message);
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
      setActionPlan({ summary: '', steps: Array(5).fill({ action: '', who: '', when: '' }), addressUP: '', outcomes: '', humaneness: '' });
    };

    const markReviewed = async (id) => {
      if (!firebaseReady || !window.firebaseDB) return;
      const { doc, updateDoc } = window.firebaseHelpers;
      const db = window.firebaseDB;
      await updateDoc(doc(db, 'fps_submissions', id), { status: 'reviewed' });
    };

    const deleteSubmission = async (id) => {
      if (!firebaseReady || !window.firebaseDB) return;
      if (confirm('Delete this submission globally?')) {
        const { doc, deleteDoc } = window.firebaseHelpers;
        const db = window.firebaseDB;
        await deleteDoc(doc(db, 'fps_submissions', id));
      }
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
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel ({submissions.length})
          </button>
        </div>

        {/* SIMULATION PANEL */}
        <div className={`fps-panel ${activeTab === 'simulation' ? 'active' : ''}`}>
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

          {/* Step 0: Team Info */}
          {currentStep === 0 && (
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
              <div className="nav-buttons">
                <div></div>
                <button className="fps-btn fps-btn-primary" onClick={() => setCurrentStep(1)}>
                  Next: Challenges →
                </button>
              </div>
            </div>
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

              <label className="fps-label">Selected Solution Summary</label>
              <textarea
                className="fps-textarea"
                value={actionPlan.summary}
                onChange={e => setActionPlan({...actionPlan, summary: e.target.value})}
                placeholder="Summarize your winning solution..."
              />

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Action Steps</h4>
              {actionPlan.steps.map((step, i) => (
                <div key={i} style={{ background: '#333', padding: 15, borderRadius: 8, marginBottom: 10 }}>
                  <label className="fps-label">Step {i + 1}</label>
                  <div className="fps-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                    <input
                      className="fps-input"
                      value={step.action}
                      onChange={e => {
                        const newSteps = [...actionPlan.steps];
                        newSteps[i] = {...newSteps[i], action: e.target.value};
                        setActionPlan({...actionPlan, steps: newSteps});
                      }}
                      placeholder="Action to take..."
                    />
                    <input
                      className="fps-input"
                      value={step.who}
                      onChange={e => {
                        const newSteps = [...actionPlan.steps];
                        newSteps[i] = {...newSteps[i], who: e.target.value};
                        setActionPlan({...actionPlan, steps: newSteps});
                      }}
                      placeholder="Who?"
                    />
                    <input
                      className="fps-input"
                      value={step.when}
                      onChange={e => {
                        const newSteps = [...actionPlan.steps];
                        newSteps[i] = {...newSteps[i], when: e.target.value};
                        setActionPlan({...actionPlan, steps: newSteps});
                      }}
                      placeholder="When?"
                    />
                  </div>
                </div>
              ))}

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>How does this solution address the UP?</h4>
              <textarea
                className="fps-textarea"
                value={actionPlan.addressUP}
                onChange={e => setActionPlan({...actionPlan, addressUP: e.target.value})}
                placeholder="Explain how your solution solves the underlying problem..."
              />

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Expected Outcomes</h4>
              <textarea
                className="fps-textarea"
                value={actionPlan.outcomes}
                onChange={e => setActionPlan({...actionPlan, outcomes: e.target.value})}
                placeholder="List expected outcomes..."
              />

              <h4 style={{ color: '#4a9eff', marginTop: 20 }}>Humaneness Considerations</h4>
              <textarea
                className="fps-textarea"
                value={actionPlan.humaneness}
                onChange={e => setActionPlan({...actionPlan, humaneness: e.target.value})}
                placeholder="How does this consider human values and ethics?"
              />

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
        </div>

        {/* ADMIN PANEL */}
        <div className={`fps-panel ${activeTab === 'admin' ? 'active' : ''}`}>
          <div className="fps-section">
            <h3>Global Submissions ({submissions.length})</h3>
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
                    <div><strong>Division:</strong> {sub.team?.division || 'N/A'}</div>
                    <div><strong>Topic:</strong> {sub.team?.topic || 'N/A'}</div>
                    <div><strong>Challenges:</strong> {sub.challenges?.length || 0}/16</div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                    {sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleString() : 'Just now'}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button className="fps-btn fps-btn-primary" onClick={() => setSelectedSubmission(sub)}>
                      View
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
        </div>

        {/* VIEW MODAL */}
        {selectedSubmission && (
          <div className="modal-overlay active" onClick={() => setSelectedSubmission(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedSubmission.team?.name || 'Submission'}</h2>
                <button className="modal-close" onClick={() => setSelectedSubmission(null)}>&times;</button>
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
              <p><strong>Summary:</strong> {selectedSubmission.actionPlan?.summary}</p>
              <p><strong>How it addresses UP:</strong> {selectedSubmission.actionPlan?.addressUP}</p>
              <p><strong>Expected Outcomes:</strong> {selectedSubmission.actionPlan?.outcomes}</p>
              <p><strong>Humaneness:</strong> {selectedSubmission.actionPlan?.humaneness}</p>
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
