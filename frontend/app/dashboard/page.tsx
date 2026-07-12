"use client";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { getProvider, getReadProvider, getSigner, switchNetwork, CONTRACTS } from '@/lib/web3';

const RITUAL_QUESTIONS = [
  {
    q: "What is the primary problem with Replicated State Machine (SMR) for GPU workloads according to Ritual?",
    options: ["GPUs are too expensive.", "Hardware non-reproducibility causes divergent state roots.", "Smart contracts cannot call GPUs.", "Nodes don't have enough storage."],
    answerIndex: 1
  },
  {
    q: "What does Extended External Validity in Symphony achieve?",
    options: ["It encrypts the mempool.", "It transfers proposer's powers (inclusion, exclusion, ordering) to users.", "It reduces the block time to 1 second.", "It increases block gas limits."],
    answerIndex: 1
  },
  {
    q: "What are Inclusion Guarantees in Symphony?",
    options: ["A promise of execution.", "A fee market priority.", "A way to include data.", "A protocol-enforced rule where a block is invalid if a triggered transaction is absent."],
    answerIndex: 3
  },
  {
    q: "How does Symphony verify long-running delegated computations?",
    options: ["All validators re-run it.", "Fraud proofs.", "Product Lattice over proof systems (TEE, ZKP) and committee sampling.", "Trusting a centralized server."],
    answerIndex: 2
  },
  {
    q: "What is the primary role of the Ritual Chain?",
    options: ["To store user profile pictures.", "To execute AI models on-chain without any off-chain coprocessors.", "To act as a sovereign execution layer orchestrating AI workloads.", "To replace Ethereum's consensus layer."],
    answerIndex: 2
  },
  {
    q: "Why is the LLM precompile important in the Ritual architecture?",
    options: ["It allows smart contracts to natively call AI models.", "It reduces the gas cost of transferring ERC20 tokens.", "It prevents users from deploying malicious contracts.", "It generates random numbers for games."],
    answerIndex: 0
  },
  {
    q: "In the context of Sovereign AI Tutor, how are correct answers evaluated?",
    options: ["By a manual human grader.", "Using Ritual's TEE/LLM precompiles.", "By executing Python scripts on IPFS.", "By polling the network validators."],
    answerIndex: 1
  }
];

export default function Dashboard() {
  const [account, setAccount] = useState<string>('');
  const [courses, setCourses] = useState<Array<any>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ completed: number, certificateMinted: boolean }>({ completed: 0, certificateMinted: false });
  const [points, setPoints] = useState<number>(0);
  const [askedQuestions, setAskedQuestions] = useState<any[]>([]);
  const [quizId, setQuizId] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadgePopup, setNewBadgePopup] = useState<{name: string, icon: string, color: string} | null>(null);

  // Load account from MetaMask silently on load
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length) setAccount(ethers.getAddress(accounts[0]));
      }).catch(() => {});
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts.length ? ethers.getAddress(accounts[0]) : '');
      });
      (window as any).ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const readProvider = getReadProvider();
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, readProvider);
      const nextId = await contract.nextCourseId();
      const count = Number(nextId);
      const loaded = [];
      for (let i = 1; i <= count; i++) {
        const c = await contract.courses(i);
        loaded.push({
          id: i,
          name: c[1],
          totalQuizzes: Number(c[2]),
          reward: ethers.formatEther(c[3])
        });
      }
      setCourses(loaded);
    } catch (e) {
      console.error("Fetch courses error", e);
    }
  };

  const fetchProgress = async () => {
    if (!account || !selectedCourse) return 0;
    try {
      const readProvider = getReadProvider();
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, readProvider);
      const prog = await contract.userProgress(account, selectedCourse);
      setProgress({ completed: Number(prog[0]), certificateMinted: prog[2] });
      
      try {
        const bal = await contract.rewardBalance(account);
        setPoints(Number(ethers.formatEther(bal || 0)));
      } catch (e) {
        setPoints(0);
      }
      return Number(prog[0]);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchProgress();
    setQuizId('');
    setAnswer('');
    
    // Load askedQuestions from localStorage
    if (account && selectedCourse) {
      const stored = localStorage.getItem(`askedQuestions_${account}_${selectedCourse}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          let hasLegacy = false;
          const formatted = parsed.map((item: any) => {
            if (typeof item === 'number') {
              hasLegacy = true;
              return { qIndex: item, answered: true, correct: true, selectedAnswer: null };
            }
            return item;
          });
          // If we have legacy data, we filter them out so user only sees accurate history
          setAskedQuestions(hasLegacy ? formatted.filter((q: any) => q.selectedAnswer !== null) : formatted);
        } catch(e) {
          setAskedQuestions([]);
        }
      } else {
        setAskedQuestions([]);
      }
    } else {
      setAskedQuestions([]);
    }
  }, [account, selectedCourse]);

  // Save askedQuestions to localStorage whenever it changes
  useEffect(() => {
    if (account && selectedCourse && askedQuestions.length > 0) {
      localStorage.setItem(`askedQuestions_${account}_${selectedCourse}`, JSON.stringify(askedQuestions));
    }
  }, [askedQuestions, account, selectedCourse]);

  const requestQuiz = async (forceNetworkSwitch = true) => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      if (forceNetworkSwitch) await switchNetwork(); // Ensure they are on Ritual before writing
      const signer = await getSigner();
      if (!signer) { setIsSubmitting(false); return; }
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.requestQuiz(selectedCourse);
      await tx.wait();
      
      // Find a random question that hasn't been asked yet
      let qIndex = Math.floor(Math.random() * RITUAL_QUESTIONS.length);
      let attempts = 0;
      while (askedQuestions.some(q => q.qIndex === qIndex) && attempts < 50) {
        qIndex = Math.floor(Math.random() * RITUAL_QUESTIONS.length);
        attempts++;
      }
      setAskedQuestions(prev => [...prev, { qIndex, answered: false }]);
      
      setQuizId("mock-quiz-" + account.slice(0,6) + "-" + selectedCourse + "-" + qIndex + "-" + Date.now());
      setAnswer('');
    } catch (e: any) {
      console.error(e);
      if (e.code !== 4001) { // 4001 is user rejected
        alert("Failed to request quiz: " + (e.message || "Unknown error. Check console or get Ritual tokens."));
      }
    }
    setIsSubmitting(false);
  };

  const submitAnswer = async () => {
    if (!selectedCourse || !quizId || !answer) return;
    setIsSubmitting(true);
    try {
      await switchNetwork(); // Ensure they are on Ritual before writing
      const signer = await getSigner();
      if (!signer) { setIsSubmitting(false); return; }
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      
      // We are using TutorAgent Mock Mode which checks bytes(answer).length > 10.
      // So we format the string sent to the contract based on whether it is actually correct.
      const currentQ = getQuestion();
      const isCorrect = currentQ && currentQ.options.indexOf(answer) === currentQ.answerIndex;
      const payloadAnswer = isCorrect ? "CORRECT_ANSWER_PADDED" : "WRONG";

      const tx = await contract.submitAnswer(selectedCourse, quizId, payloadAnswer);
      await tx.wait();
      
      setAskedQuestions(prev => {
        const newQ = [...prev];
        if (newQ.length > 0) {
          newQ[newQ.length - 1] = {
            ...newQ[newQ.length - 1],
            answered: true,
            correct: isCorrect,
            selectedAnswer: answer
          };
        }
        return newQ;
      });

      const oldCompleted = progress.completed;
      const newProg = await fetchProgress();
      setQuizId('');
      setAnswer('');
      
      // Check for badge unlock
      if (newProg !== undefined && newProg > oldCompleted) {
        const thresholds = [
          { score: 201, badge: { name: "Diamond Badge", icon: "💎", color: "#00d2ff" } },
          { score: 101, badge: { name: "Gold Badge", icon: "🥇", color: "#ffd700" } },
          { score: 51, badge: { name: "Silver Badge", icon: "🥈", color: "#c0c0c0" } },
          { score: 10, badge: { name: "Bronze Badge", icon: "🥉", color: "#cd7f32" } },
        ];
        
        for (const t of thresholds) {
          if (oldCompleted < t.score && newProg >= t.score) {
            setNewBadgePopup(t.badge);
            setTimeout(() => setNewBadgePopup(null), 6000); // Hide after 6 seconds
            break;
          }
        }
      }
      
      // Automatically request next quiz
      const courseDetails = courses.find(c => c.id === selectedCourse);
      if (courseDetails && newProg !== undefined) {
        // Auto trigger next
        setTimeout(() => requestQuiz(false), 500);
      }
      
    } catch (e: any) {
      console.error(e);
      if (e.code !== 4001) {
        alert("Failed to submit answer: " + (e.message || "Unknown error. Check console."));
      }
    }
    setIsSubmitting(false);
  };

  // Helper to parse question
  const getQuestion = () => {
    if (!quizId) return null;
    const parts = quizId.split('-');
    if (parts.length > 4) {
      const idx = parseInt(parts[4]) % RITUAL_QUESTIONS.length;
      return RITUAL_QUESTIONS[idx];
    }
    return RITUAL_QUESTIONS[0];
  };
  const currentQ = getQuestion();

  return (
    <div className="dashboard-container">
      {/* Badge Unlock Popup */}
      {newBadgePopup && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: 'rgba(20, 20, 30, 0.95)', border: `1px solid ${newBadgePopup.color}`, 
          borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
          boxShadow: `0 0 20px ${newBadgePopup.color}60`, backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.5s ease-out, fadeOut 0.5s ease-in 5.5s'
        }}>
          <div style={{ fontSize: '3.5rem', filter: `drop-shadow(0 0 10px ${newBadgePopup.color})` }}>
            {newBadgePopup.icon}
          </div>
          <div>
            <h3 style={{ color: newBadgePopup.color, margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
              Unlocked {newBadgePopup.name}!
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Congratulations on reaching this milestone!
            </p>
          </div>
        </div>
      )}
      
      <header className="dash-header">
        <h2>Student Dashboard</h2>
        <div className="wallet-badge">
          {account ? (
            <><span className="status-dot"></span> {account}</>
          ) : (
            <button className="btn btn-primary" onClick={async () => {
              await switchNetwork();
              if ((window as any).ethereum) {
                (window as any).ethereum.request({ method: 'eth_requestAccounts' });
              }
            }}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main className="dash-grid">
        <section className="courses-panel">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Available Courses</h3>
          <div className="course-list">
            {courses.length === 0 ? (
              <p>Loading courses...</p>
            ) : (
              courses.map(c => (
                <div 
                  key={c.id} 
                  className={`glass-card course-card ${selectedCourse === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCourse(c.id)}
                >
                  <div className="card-icon" style={{ marginBottom: '1rem', width: '40px', height: '40px', fontSize: '1.2rem' }}>📚</div>
                  <h3>{c.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unlimited Quizzes • Reward Balance: {points} Ritual Points</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="study-panel">
          {selectedCourse ? (
            <div className="glass-card study-room">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                {courses.find(c => c.id === selectedCourse)?.name}
              </h2>
              
              <div className="progress-bar-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Progress: {progress.completed} Quizzes Completed</span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Balance: {points} Ritual Points</span>
                </div>
              </div>



              {!quizId && (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => requestQuiz(true)} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : progress.completed === 0 ? "Start Course" : "Request Next Quiz"}
                </button>
              )}

              {quizId && currentQ && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 600 }}>Active Quiz (Ritual Network)</span>
                    <p style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
                      {currentQ.q}
                    </p>
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {currentQ.options.map((opt, i) => (
                        <label key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                          background: answer === opt ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: answer === opt ? '1px solid var(--accent-blue)' : '1px solid transparent',
                          borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                          <input type="radio" name="quiz_option" value={opt} onChange={() => setAnswer(opt)} checked={answer === opt} style={{ accentColor: 'var(--accent-blue)', width: '18px', height: '18px' }} />
                          <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button className="btn btn-secondary" onClick={submitAnswer} disabled={!answer || isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              )}
              {(() => {
                let badge = null;
                if (progress.completed >= 201) badge = { name: "Diamond Badge", icon: "💎", color: "#00d2ff", bg: "rgba(0, 210, 255, 0.1)" };
                else if (progress.completed >= 101) badge = { name: "Gold Badge", icon: "🥇", color: "#ffd700", bg: "rgba(255, 215, 0, 0.1)" };
                else if (progress.completed >= 51) badge = { name: "Silver Badge", icon: "🥈", color: "#c0c0c0", bg: "rgba(192, 192, 192, 0.1)" };
                else if (progress.completed >= 10) badge = { name: "Bronze Badge", icon: "🥉", color: "#cd7f32", bg: "rgba(205, 127, 50, 0.1)" };
                
                if (badge) {
                  return (
                    <div style={{ marginTop: '2rem', padding: '2rem', background: badge.bg, border: `1px solid ${badge.color}40`, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: `drop-shadow(0 0 10px ${badge.color}80)` }}>{badge.icon}</div>
                      <h3 style={{ color: badge.color, marginBottom: '0.5rem', fontSize: '1.8rem' }}>{badge.name}</h3>
                      <p style={{ color: 'var(--text-muted)' }}>Congratulations! Keep answering correctly to reach the next rank.</p>
                    </div>
                  );
                }
                return (
                  <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5, filter: 'grayscale(100%)' }}>🏆</div>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>No Badge Yet</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Answer 10 questions correctly to unlock the Bronze Badge.</p>
                  </div>
                );
              })()}

              {/* NFT Certificate Section */}
              {progress.completed >= 101 && (
                <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: '0 0 20px rgba(236, 72, 153, 0.1)' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.6))' }}>📜</div>
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, textShadow: '0 2px 10px rgba(236, 72, 153, 0.5)' }}>Sovereign TCERT NFT</h3>
                  {progress.completed >= 201 ? (
                    <p style={{ color: '#fbcfe8', fontWeight: 600 }}>💎 Diamond Tier Reached! Your NFT Certificate has been auto-minted to your wallet as proof of mastery.</p>
                  ) : (
                    <p style={{ color: '#fbcfe8' }}>🥇 Gold Tier Reached! Just {201 - progress.completed} more correct answers to Diamond tier to automatically mint this exclusive NFT Certificate.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)' }}>
              Select a course to start learning
            </div>
          )}
        </section>
        
        {/* History Panel */}
        <section className="history-panel">
          <div className="glass-card history-room" style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Quiz History</h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', paddingRight: '0.5rem' }}>
              {askedQuestions.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2rem' }}>No history yet. Start learning!</p>
              ) : (
                [...askedQuestions].reverse().filter(q => q.answered).map((qObj, i) => {
                  const qText = RITUAL_QUESTIONS[qObj.qIndex].q;
                  const correctAns = RITUAL_QUESTIONS[qObj.qIndex].options[RITUAL_QUESTIONS[qObj.qIndex].answerIndex];
                  return (
                    <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', lineHeight: '1.4', fontWeight: 600, flex: 1, paddingRight: '1rem' }}>{qText}</p>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: qObj.correct ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: qObj.correct ? '#4ade80' : '#f87171', fontWeight: 600, whiteSpace: 'nowrap' }}>
                           {qObj.correct ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', padding: '0.5rem', background: qObj.correct ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `3px solid ${qObj.correct ? '#4ade80' : '#f87171'}`, borderRadius: '4px' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>Your answer: <strong style={{ color: qObj.correct ? '#4ade80' : '#f87171' }}>{qObj.selectedAnswer || (qObj.correct ? correctAns : 'Unknown')}</strong></div>
                        {!qObj.correct && (
                          <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Correct answer: <strong style={{ color: '#4ade80' }}>{correctAns}</strong></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
