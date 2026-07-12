"use client";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { getProvider, getReadProvider, getSigner, CONTRACTS } from '@/lib/web3';

export default function Dashboard() {
  const [account, setAccount] = useState<string>('');
  const [courses, setCourses] = useState<Array<any>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [quizId, setQuizId] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);

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

  // Fetch available courses (public view)
  useEffect(() => {
    async function fetchCourses() {
      try {
        const provider = getReadProvider();
        const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, provider);
        const courseCount = await contract.nextCourseId();
        const list = [];
        for (let i = 1; i <= Number(courseCount); i++) {
          const c = await contract.courses(i);
          // Ethers v6 tuple access
          const id = Number(c[0]);
          const name = c[1];
          const totalQuizzes = Number(c[2]);
          const rewardAmount = c[3];
          
          list.push({ id, name, totalQuizzes, reward: ethers.formatEther(rewardAmount) });
        }
        setCourses(list);
      } catch (e) {
        console.error("Failed to fetch courses", e);
      }
    }
    fetchCourses();
  }, []);

  // Fetch user progress for selected course
  useEffect(() => {
    if (!selectedCourse || !account) return;
    async function fetchProgress() {
      try {
        const provider = getReadProvider();
        const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, provider);
        const prog = await contract.userProgress(account, selectedCourse);
        setProgress({ completed: Number(prog[0]), certificateMinted: prog[2] });
      } catch (e) {
        console.error("Failed to fetch progress", e);
      }
    }
    fetchProgress();
  }, [selectedCourse, account]);

  const requestQuiz = async () => {
    if (!selectedCourse) return;
    try {
      await switchNetwork(); // Ensure they are on Ritual before writing
      const signer = await getSigner();
      if (!signer) return;
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.requestQuiz(selectedCourse);
      await tx.wait();
      
      setQuizId("mock-quiz-" + account.slice(0,6) + "-" + selectedCourse + "-" + Date.now());
    } catch (e: any) {
      console.error(e);
      if (e.code !== 4001) { // 4001 is user rejected
        alert("Failed to request quiz. Make sure you are connected to the Ritual Testnet.");
      }
    }
  };

  const submitAnswer = async () => {
    if (!selectedCourse || !quizId) return;
    try {
      await switchNetwork(); // Ensure they are on Ritual before writing
      const signer = await getSigner();
      if (!signer) return;
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.submitAnswer(selectedCourse, quizId, answer);
      await tx.wait();
      
      const prog = await contract.userProgress(account, selectedCourse);
      setProgress({ completed: Number(prog[0]), certificateMinted: prog[2] });
      setQuizId('');
      setAnswer('');
    } catch (e: any) {
      console.error(e);
      if (e.code !== 4001) {
        alert("Failed to submit answer.");
      }
    }
  };

  return (
    <main className="dashboard-container">
      <h1 className="dashboard-title">Student Dashboard</h1>

      {!account && (
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Please connect your MetaMask wallet using the button in the header to view your progress.</p>
        </div>
      )}

      {account && (
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="hero-badge" style={{ margin: 0 }}>
            <span className="hero-badge-dot"></span>
            Connected
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{account}</span>
        </div>
      )}

      <div className="cards-section" style={{ padding: 0, margin: 0, maxWidth: '100%', alignItems: 'start' }}>
        {/* Course List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Available Courses</h2>
          {courses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading courses...</p>
          ) : (
            courses.map((c) => (
              <div
                key={c.id}
                className="glass-card"
                style={{ 
                  cursor: 'pointer', 
                  border: selectedCourse === c.id ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)' 
                }}
                onClick={() => setSelectedCourse(c.id)}
              >
                <div className="card-icon" style={{ marginBottom: '1rem', width: '40px', height: '40px', fontSize: '1.2rem' }}>📚</div>
                <h3>{c.name}</h3>
                <p><strong>{c.totalQuizzes}</strong> Quizzes • Reward: <strong>{c.reward} TRW</strong></p>
              </div>
            ))
          )}
        </section>

        {/* Course Details / Quiz Area */}
        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Study Room</h2>
          {!selectedCourse ? (
            <div className="glass-card" style={{ opacity: 0.7, textAlign: 'center' }}>
              <p>Select a course from the left to start learning.</p>
            </div>
          ) : (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                {courses.find(c => c.id === selectedCourse)?.name}
              </h3>

              {progress && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Progress</span>
                    <span style={{ fontWeight: 600 }}>{progress.completed} / {courses.find((c) => c.id === selectedCourse)?.totalQuizzes}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--glass-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(progress.completed / (courses.find((c) => c.id === selectedCourse)?.totalQuizzes || 1)) * 100}%`, 
                      height: '100%', 
                      background: 'var(--gradient-primary)',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
              )}

              {progress?.certificateMinted && (
                <div style={{ padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  🏆 <strong>Certificate Minted!</strong> You have mastered this course.
                </div>
              )}

              {account && (!progress?.certificateMinted) && !quizId && (
                <button onClick={requestQuiz} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Request Next Quiz
                </button>
              )}

              {quizId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 600 }}>Active Quiz (Powered by Ritual)</span>
                    <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {quizId}</p>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                      <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        <strong>Question:</strong> Please write a short essay explaining the core concepts of Sovereign AI and how Trusted Execution Environments (TEEs) ensure verifiable execution of AI models on the blockchain.
                      </p>
                    </div>
                  </div>
                  <textarea
                    placeholder="Type your answer here..."
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
                  <button onClick={submitAnswer} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Answer
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
