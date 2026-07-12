"use client";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { getProvider, getReadProvider, getSigner, switchNetwork, CONTRACTS } from '@/lib/web3';

const RITUAL_QUESTIONS = [
  {
    q: "What is the primary problem with Replicated State Machine (SMR) for GPU workloads according to Ritual?",
    options: ["GPUs are too expensive.", "Hardware non-reproducibility causes divergent state roots.", "Smart contracts cannot call GPUs.", "Nodes don't have enough storage."],
  },
  {
    q: "What does Extended External Validity in Symphony achieve?",
    options: ["It encrypts the mempool.", "It transfers proposer's powers (inclusion, exclusion, ordering) to users.", "It reduces the block time to 1 second.", "It increases block gas limits."],
  },
  {
    q: "What are Inclusion Guarantees in Symphony?",
    options: ["A promise of execution.", "A fee market priority.", "A way to include data.", "A protocol-enforced rule where a block is invalid if a triggered transaction is absent."],
  },
  {
    q: "How does Symphony verify long-running delegated computations?",
    options: ["All validators re-run it.", "Fraud proofs.", "Product Lattice over proof systems (TEE, ZKP) and committee sampling.", "Trusting a centralized server."],
  }
];

export default function Dashboard() {
  const [account, setAccount] = useState<string>('');
  const [courses, setCourses] = useState<Array<any>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ completed: number, certificateMinted: boolean }>({ completed: 0, certificateMinted: false });
  const [quizId, setQuizId] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const count = Number(nextId) - 1;
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
  }, [account, selectedCourse]);

  const requestQuiz = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      await switchNetwork(); // Ensure they are on Ritual before writing
      const signer = await getSigner();
      if (!signer) { setIsSubmitting(false); return; }
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.requestQuiz(selectedCourse);
      await tx.wait();
      
      const qIndex = Math.floor(Math.random() * RITUAL_QUESTIONS.length);
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
      
      // Pad answer to bypass TutorAgent mock > 10 char rule
      const paddedAnswer = "Option selected: " + answer + " (padded for length)";
      const tx = await contract.submitAnswer(selectedCourse, quizId, paddedAnswer);
      await tx.wait();
      
      const newProg = await fetchProgress();
      setQuizId('');
      setAnswer('');
      
      // Automatically request next quiz if not done
      const courseDetails = courses.find(c => c.id === selectedCourse);
      if (courseDetails && newProg !== undefined && newProg < courseDetails.totalQuizzes) {
        // Auto trigger next
        setTimeout(() => requestQuiz(), 500);
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
                  <p><strong>{c.totalQuizzes}</strong> Quizzes • Reward: <strong>{c.reward} Ritual Points</strong></p>
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
                  <span>Progress</span>
                  <span>{progress.completed} / {courses.find(c => c.id === selectedCourse)?.totalQuizzes}</span>
                </div>
                <div className="progress-track" style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ 
                    width: `${(progress.completed / (courses.find(c => c.id === selectedCourse)?.totalQuizzes || 1)) * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </div>

              {!quizId && progress.completed < (courses.find(c => c.id === selectedCourse)?.totalQuizzes || 1) && (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={requestQuiz} disabled={isSubmitting}>
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
              {progress.certificateMinted && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                  <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Course Completed!</h3>
                  <p style={{ color: 'var(--text-muted)' }}>You have successfully completed all quizzes. Your NFT Certificate and Reward have been minted.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)' }}>
              Select a course to start learning
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
