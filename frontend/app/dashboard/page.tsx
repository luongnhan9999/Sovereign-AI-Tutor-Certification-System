"use client";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { getProvider, getReadProvider, getSigner, switchNetwork, CONTRACTS } from '@/lib/web3';

const COURSE_QUESTIONS: Record<string, {q: string, options: string[], answerIndex: number}[]> = {
  "Introduction to VeriLearn": [
    {
      q: "Please write a short essay explaining the core concepts of VeriLearn and how Trusted Execution Environments (TEEs) ensure verifiable execution of AI models on the blockchain.",
      options: ["Submit Essay"],
      answerIndex: 0
    },
    {
      q: "What is VeriLearn?",
      options: ["AI models controlled by a single corporation.", "AI models deployed on verifiable, decentralized infrastructure.", "AI models that run offline.", "AI models that do not require data."],
      answerIndex: 1
    },
    {
      q: "How do Trusted Execution Environments (TEEs) help Sovereign AI?",
      options: ["They make AI models run faster.", "They reduce the cost of training.", "They ensure verifiable and tamper-proof execution.", "They provide free data storage."],
      answerIndex: 2
    },
    {
      q: "What is a major challenge of running AI on-chain?",
      options: ["Blockchains have too much storage.", "High computational cost and non-determinism of AI models.", "Smart contracts cannot do math.", "There are no use cases for it."],
      answerIndex: 1
    },
    {
      q: "What makes AI execution non-deterministic on standard GPUs?",
      options: ["Memory bandwidth limitations.", "Differences in thread scheduling and parallel reduction non-associativity.", "Lack of storage space.", "Power constraints."],
      answerIndex: 1
    },
    {
      q: "How does VeriLearn differ from traditional Web2 AI?",
      options: ["It relies on centralized corporate servers.", "It removes user ownership of data.", "It ensures transparency, verifiability, and cryptographic guarantees.", "It uses less electricity."],
      answerIndex: 2
    },
    {
      q: "Which cryptographic primitive is often paired with TEEs for verifiable AI?",
      options: ["Zero-Knowledge Proofs (ZKPs).", "SHA-256.", "RSA-2048.", "Elliptic Curve Digital Signature Algorithm (ECDSA)."],
      answerIndex: 0
    },
    {
      q: "Why can't traditional smart contracts natively execute Large Language Models (LLMs)?",
      options: ["They don't understand English.", "Block gas limits and computational constraints make it impossible.", "LLMs are illegal to use.", "The EVM is not Turing-complete."],
      answerIndex: 1
    },
    {
      q: "What is the primary role of a coprocessor in VeriLearn architecture?",
      options: ["To store user profile pictures.", "To act as a centralized backend server.", "To offload heavy computation while returning a cryptographic proof to the blockchain.", "To generate random numbers."],
      answerIndex: 2
    }
  ],
  "Ritual Whitepaper": [
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
    }
  ]
};

export default function Dashboard() {
  const [account, setAccount] = useState<string>('');
  const [courses, setCourses] = useState<Array<any>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ completed: number, certificateMinted: boolean, askedQuestions?: number[] }>({ completed: 0, certificateMinted: false, askedQuestions: [] });
  const [points, setPoints] = useState<number>(0);
  const [askedQuestions, setAskedQuestions] = useState<any[]>([]);
  const [quizId, setQuizId] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadgePopup, setNewBadgePopup] = useState<{name: string, icon: string, color: string} | null>(null);
  const [historyTab, setHistoryTab] = useState<'history' | 'leaderboard'>('history');
  const [botPlayers, setBotPlayers] = useState<{address: string, score: number, isUser?: boolean, type?: string}[]>([
    { address: 'vitalik.eth', score: 185, type: 'human' },
    { address: 'NeuralNode_8F', score: 142, type: 'node' },
    { address: 'ritual_validator.eth', score: 98, type: 'human' },
    { address: '0x99C2...77FA', score: 76, type: 'wallet' },
    { address: 'zkVerifier_11', score: 65, type: 'node' },
    { address: 'cyber.eth', score: 43, type: 'human' },
    { address: '0x10A9...BB21', score: 21, type: 'wallet' },
    { address: 'TEE_Operator_X', score: 15, type: 'node' },
    { address: '0x7172...9990', score: 8, type: 'wallet' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBotPlayers(prev => prev.map(bot => {
        if (Math.random() < 0.4) {
          return { ...bot, score: bot.score + 1 };
        }
        return bot;
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      if (localStorage.getItem('manuallyDisconnected') !== 'true') {
        (window as any).ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts.length) setAccount(ethers.getAddress(accounts[0]));
        }).catch(() => {});
      }
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
      const seenNames = new Set();
      for (let i = 1; i <= count; i++) {
        const c = await contract.courses(i);
        let courseName = c[1];
        if (courseName === "Symphony Whitepaper: Execution-Aware Consensus") {
          courseName = "Ritual Whitepaper";
        }
        if (courseName === "Introduction to Sovereign AI") {
          courseName = "Introduction to VeriLearn";
        }
        if (seenNames.has(courseName)) continue;
        seenNames.add(courseName);
        loaded.push({
          id: i,
          name: courseName,
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
      setProgress({ completed: Number(prog[0]), certificateMinted: prog[2], askedQuestions: [] });
      
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
    
    if (account && selectedCourse) {
      const stored = localStorage.getItem(`askedQuestions_${account}_${selectedCourse}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const formatted = parsed.map((item: any) => {
            if (typeof item === 'number') {
              return { qIndex: item, answered: true, correct: true, selectedAnswer: null };
            }
            return item;
          });
          setAskedQuestions(formatted);
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

  useEffect(() => {
    if (account && selectedCourse && askedQuestions.length > 0) {
      localStorage.setItem(`askedQuestions_${account}_${selectedCourse}`, JSON.stringify(askedQuestions));
    }
  }, [askedQuestions, account, selectedCourse]);

  const requestQuiz = async (forceNetworkSwitch = true) => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      if (forceNetworkSwitch) await switchNetwork();
      const signer = await getSigner();
      if (!signer) { setIsSubmitting(false); return; }
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.requestQuiz(selectedCourse);
      await tx.wait();
      
      const courseObj = courses.find(c => c.id === selectedCourse);
      const courseName = courseObj?.name || "Introduction to VeriLearn";
      const questions = COURSE_QUESTIONS[courseName] || COURSE_QUESTIONS["Introduction to VeriLearn"];
      const unaskedIndices = questions.map((_, i) => i).filter(i => !askedQuestions.some(aq => aq.qIndex === i));
      const qIndex = unaskedIndices.length > 0 ? unaskedIndices[Math.floor(Math.random() * unaskedIndices.length)] : Math.floor(Math.random() * questions.length);
      
      setAskedQuestions(prev => [...prev, { qIndex, answered: false }]);
      setQuizId(`mock-quiz-${account.slice(0,6)}-${selectedCourse}-${qIndex}-${Date.now()}`);
      setAnswer('');
    } catch (e: any) {
      console.error(e);
      if (e.code !== 4001) {
        alert("Failed to request quiz: " + (e.message || "Unknown error. Check console or get Ritual tokens."));
      }
    }
    setIsSubmitting(false);
  };

  const submitAnswer = async () => {
    if (!selectedCourse || !quizId || !answer) return;
    setIsSubmitting(true);
    try {
      await switchNetwork();
      const signer = await getSigner();
      if (!signer) { setIsSubmitting(false); return; }
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      
      const qIndex = parseInt(quizId.split('-')[4]);
      const courseObj = courses.find(c => c.id === selectedCourse);
      const courseName = courseObj?.name || "Introduction to VeriLearn";
      const questions = COURSE_QUESTIONS[courseName] || COURSE_QUESTIONS["Introduction to VeriLearn"];
      const qItem = questions[qIndex];
      let isCorrect = false;
      if (qItem) {
        if (qItem.options.length === 1 && qItem.options[0] === "Submit Essay") {
          isCorrect = answer.trim().length > 10;
        } else {
          isCorrect = answer === qItem.options[qItem.answerIndex];
        }
      }
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

      if (isCorrect) {
        // Fire confetti
        for (let i = 0; i < 30; i++) {
          const confetti = document.createElement('div');
          confetti.classList.add('confetti');
          confetti.style.left = '50%';
          confetti.style.top = '50%';
          confetti.style.setProperty('--tx', `${(Math.random() - 0.5) * 300}px`);
          confetti.style.setProperty('--ty', `${(Math.random() - 0.5) * 300}px`);
          document.body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 1500);
        }
      }

      const oldCompleted = progress.completed;
      const newProg = await fetchProgress();
      setQuizId('');
      setAnswer('');
      
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
            setTimeout(() => setNewBadgePopup(null), 6000);
            break;
          }
        }
      }
      
      const courseDetails = courses.find(c => c.id === selectedCourse);
      if (courseDetails && newProg !== undefined) {
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

  return (
    <div className="dashboard-container">
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
      
      <header className="dash-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontFamily: 'Space Grotesk', fontWeight: 700 }}>Neural <span className="gradient-text">Dashboard</span></h2>
      </header>

      <main className="dashboard-grid">
        <aside className="sidebar">
          
          <div className="profile-card">
            <div className="avatar-pro">{account ? account.slice(2,4).toUpperCase() : 'UI'}</div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>Student Profile</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, fontFamily: 'monospace' }}>
                {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Not Connected'}
              </p>
            </div>
          </div>

          <div className="stat-group">
            <div className="stat-box">
              <div className="val">{progress.completed}</div>
              <div className="lbl">Quizzes Passed</div>
            </div>
            <div className="stat-box">
              <div className="val">{points.toFixed(0)}</div>
              <div className="lbl">Tokens Earned</div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Modules</h3>
            <div className="course-list">
              {courses.length === 0 ? (
                <p className="text-muted">Loading modules...</p>
              ) : (
                courses.map(c => (
                  <div 
                    key={c.id} 
                    className={`course-item ${selectedCourse === c.id ? 'active' : ''}`}
                    onClick={() => setSelectedCourse(c.id)}
                  >
                    <div>
                      <h4 style={{ fontFamily: 'Space Grotesk' }}>{c.name}</h4>
                      <p>Unlimited Generation</p>
                    </div>
                    <div style={{ color: selectedCourse === c.id ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="main-content">
          {selectedCourse ? (
            <div className="glass-card study-room">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                {courses.find(c => c.id === selectedCourse)?.name}
              </h2>
              
              <div className="progress-bar-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Progress: {progress.completed} Quizzes Completed</span>
                </div>
              </div>

              {!quizId && (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => requestQuiz(true)} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : progress.completed === 0 ? "Start Course" : "Request Next Quiz"}
                </button>
              )}

              {(() => {
                const courseObj = courses.find(c => c.id === selectedCourse);
                const courseName = courseObj?.name || "Introduction to VeriLearn";
                const questions = COURSE_QUESTIONS[courseName] || COURSE_QUESTIONS["Introduction to VeriLearn"];
                const currentQ = quizId && quizId.split('-').length > 4 ? questions[parseInt(quizId.split('-')[4])] : null;
                
                return quizId && currentQ ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                    <div className="quiz-card holo-card" 
                      style={{ padding: '2rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', zIndex: 10 }}>
                      <span className="quiz-label" style={{ fontSize: '0.8rem', color: 'var(--accent-magenta)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Active Connection (Ritual Network)</span>
                      <p className="quiz-question" style={{ marginTop: '1rem', fontSize: '1.2rem', lineHeight: '1.6', fontWeight: 500 }}>
                        {currentQ.q}
                      </p>
                      
                      <div className="quiz-options" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {currentQ.options.length === 1 && currentQ.options[0] === "Submit Essay" ? (
                          <textarea
                            placeholder="Type your answer here (must be longer than 10 characters)..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '1rem',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--text-primary)',
                              fontFamily: 'inherit',
                              fontSize: '0.95rem',
                              resize: 'vertical',
                              minHeight: '120px',
                            }}
                          />
                        ) : (
                          currentQ.options.map((opt: string, i: number) => (
                            <label key={i} className="quiz-option" style={{
                              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                              background: answer === opt ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                              border: answer === opt ? '1px solid var(--accent-blue)' : '1px solid transparent',
                              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                              <input type="radio" name="quiz_option" value={opt} onChange={() => setAnswer(opt)} checked={answer === opt} style={{ accentColor: 'var(--accent-blue)', width: '18px', height: '18px' }} />
                              <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <button className="btn btn-secondary" onClick={submitAnswer} disabled={!answer || isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </button>
                  </div>
                ) : null;
              })()}
              
              {(() => {
                let badge = null;
                if (progress.completed >= 201) badge = { name: "Diamond Badge", icon: "💎", color: "#00d2ff", bg: "rgba(0, 210, 255, 0.1)" };
                else if (progress.completed >= 101) badge = { name: "Gold Badge", icon: "🥇", color: "#ffd700", bg: "rgba(255, 215, 0, 0.1)" };
                else if (progress.completed >= 51) badge = { name: "Silver Badge", icon: "🥈", color: "#c0c0c0", bg: "rgba(192, 192, 192, 0.1)" };
                else if (progress.completed >= 10) badge = { name: "Bronze Badge", icon: "🥉", color: "#cd7f32", bg: "rgba(205, 127, 50, 0.1)" };
                
                if (!badge) return null;
                
                return (
                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: badge.bg, border: `1px solid ${badge.color}40`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem', filter: `drop-shadow(0 0 10px ${badge.color}80)` }}>{badge.icon}</div>
                    <div>
                      <h4 style={{ color: badge.color, marginBottom: '0.25rem', fontSize: '1.1rem' }}>{badge.name} Unlocked!</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have reached {progress.completed} correct answers.</p>
                    </div>
                  </div>
                );
              })()}

              {progress.completed >= 10 && (
                <div className="holo-card" 
                  style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(247, 37, 133, 0.15) 0%, rgba(157, 78, 221, 0.15) 100%)', border: '1px solid rgba(247, 37, 133, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: '0 0 30px rgba(247, 37, 133, 0.15)' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px rgba(247, 37, 133, 0.8))' }}>📜</div>
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, textShadow: '0 2px 15px rgba(247, 37, 133, 0.8)' }}>VeriLearn TCERT NFT</h3>
                  {(() => {
                    if (progress.completed >= 201) return <p style={{ color: '#ffb3c6', fontWeight: 600 }}>💎 Diamond Tier Reached! Your NFT Certificate has been auto-minted to your wallet as proof of mastery.</p>;
                    if (progress.completed >= 101) return <p style={{ color: '#ffb3c6' }}>🥇 Gold Tier Reached! Just {201 - progress.completed} more correct answers to Diamond tier to automatically mint this exclusive NFT Certificate.</p>;
                    if (progress.completed >= 51) return <p style={{ color: '#ffb3c6' }}>🥈 Silver Tier Reached! Just {201 - progress.completed} more correct answers to Diamond tier to automatically mint this exclusive NFT Certificate.</p>;
                    return <p style={{ color: '#ffb3c6' }}>🥉 Bronze Tier Reached! Just {201 - progress.completed} more correct answers to Diamond tier to automatically mint this exclusive NFT Certificate.</p>;
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)' }}>
              Select a course to start learning
            </div>
          )}
        </section>
        <section className="leaderboard-container">
          <div style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <div className="leaderboard-header">
              <div className="tabs">
                <button 
                  className={`tab-btn ${historyTab === 'history' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('history')}
                >
                  Neural Logs
                </button>
                <button 
                  className={`tab-btn ${historyTab === 'leaderboard' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('leaderboard')}
                >
                  Leaderboard 🏆
                </button>
              </div>
            </div>
            
            {historyTab === 'history' ? (
              <div className="history-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '600px', paddingRight: '0.5rem' }}>
                {askedQuestions.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>Awaiting initial telemetry...</p>
                ) : (
                  [...askedQuestions].reverse().filter(q => q.answered).map((qObj, i) => {
                    const courseObj = courses.find(c => c.id === selectedCourse);
                    const courseName = courseObj?.name || "Introduction to VeriLearn";
                    const questions = COURSE_QUESTIONS[courseName] || COURSE_QUESTIONS["Introduction to VeriLearn"];
                    const qItem = questions[qObj.qIndex];
                    const qText = qItem ? qItem.q : "Legacy Question";
                    const correctAns = qItem ? qItem.options[qItem.answerIndex] : "N/A";
                    return (
                      <div key={i} className="history-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <p className="history-q" style={{ flex: 1, paddingRight: '1rem' }}>{qText}</p>
                          <span className={`history-status ${qObj.correct ? 'status-correct' : 'status-pending'}`}>
                             {qObj.correct ? 'VERIFIED' : 'REJECTED'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', padding: '1rem', background: qObj.correct ? 'rgba(163, 230, 53, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderLeft: `2px solid ${qObj.correct ? 'var(--accent-lime)' : '#ef4444'}` }}>
                          <div className="text-muted">Extracted Output: <strong style={{ color: qObj.correct ? 'var(--accent-lime)' : '#ef4444' }}>{qObj.selectedAnswer || (qObj.correct ? correctAns : 'Unknown')}</strong></div>
                          {!qObj.correct && (
                            <div className="text-muted" style={{ marginTop: '0.25rem' }}>Expected Hash: <strong style={{ color: 'var(--accent-lime)' }}>{correctAns}</strong></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="lb-list" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {(() => {
                  const allPlayers = [...botPlayers];
                  if (account) {
                    allPlayers.push({ address: account.substring(0, 6) + '...' + account.substring(account.length - 4), score: progress.completed, isUser: true });
                  }
                  allPlayers.sort((a, b) => b.score - a.score);
                  
                  return (
                    <>
                      {allPlayers.slice(0, 10).map((player, idx) => (
                        <div key={idx} className={`lb-item ${player.isUser ? 'is-user' : ''}`}>
                          <div className="lb-rank">#{idx + 1}</div>
                          <div className="lb-address" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {player.isUser ? (
                              <span style={{ fontSize: '1.2rem' }}>🧑‍🚀</span>
                            ) : player.type === 'human' ? (
                              <span style={{ fontSize: '1.2rem' }}>👤</span>
                            ) : player.type === 'node' ? (
                              <span style={{ fontSize: '1.2rem' }}>🤖</span>
                            ) : (
                              <span style={{ fontSize: '1.2rem' }}>💼</span>
                            )}
                            <span style={{ fontWeight: player.isUser ? 'bold' : 'normal', color: player.isUser ? 'var(--accent-cyan)' : 'inherit' }}>
                              {player.isUser ? player.address + ' (You)' : player.address}
                            </span>
                            {player.type === 'node' && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(247, 37, 133, 0.2)', color: 'var(--accent-magenta)', borderRadius: '4px', marginLeft: '0.5rem' }}>VERIFIER</span>}
                          </div>
                          <div className="lb-score">
                            {player.score} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>pts</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Telemetry Widget */}
                      <div className="holo-card tilt-card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '1rem', fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="brand-dot" style={{ animation: 'pulse 2s infinite' }}></span>
                          System Telemetry
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Active Nodes:</span>
                            <span style={{ color: '#fff', fontFamily: 'monospace' }}>2,408</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Network Latency:</span>
                            <span style={{ color: '#a3e635', fontFamily: 'monospace' }}>12ms</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">TEE Status:</span>
                            <span style={{ color: 'var(--accent-magenta)', fontWeight: 'bold' }}>SECURE</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted">Last Block:</span>
                            <span style={{ color: '#fff', fontFamily: 'monospace' }}>18,452,901</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
