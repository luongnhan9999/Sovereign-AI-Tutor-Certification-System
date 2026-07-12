"use client";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { getProvider, getSigner, CONTRACTS } from '@/lib/web3';

export default function Dashboard() {
  const [account, setAccount] = useState<string>('');
  const [courses, setCourses] = useState<Array<any>>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [quizId, setQuizId] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);

  // Load account from MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => {
        setAccount(ethers.getAddress(accounts[0]));
      });
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(ethers.getAddress(accounts[0]));
      });
      (window as any).ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  // Fetch available courses (public view)
  useEffect(() => {
    async function fetchCourses() {
      const provider = getProvider();
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, provider);
      try {
        const courseCount = await contract.nextCourseId();
        const list = [];
        for (let i = 1; i <= Number(courseCount); i++) {
          const c = await contract.courses(i);
          list.push({ id: Number(c.id), name: c.name, totalQuizzes: Number(c.totalQuizzes), reward: ethers.formatEther(c.rewardAmount) });
        }
        setCourses(list);
      } catch (e) {
        console.error("Failed to fetch courses (dummy address?)", e);
      }
    }
    fetchCourses();
  }, []);

  // Fetch user progress for selected course
  useEffect(() => {
    if (!selectedCourse || !account) return;
    async function fetchProgress() {
      const provider = getProvider();
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, provider);
      try {
        const prog = await contract.userProgress(account, selectedCourse);
        setProgress({ completed: Number(prog.completedQuizzes), certificateMinted: prog.certificateMinted });
      } catch (e) {
        console.error("Failed to fetch progress", e);
      }
    }
    fetchProgress();
  }, [selectedCourse, account]);

  const requestQuiz = async () => {
    if (!selectedCourse) return;
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.requestQuiz(selectedCourse);
      await tx.wait();
      
      // We'll just fake a quiz ID for the demo if events fail
      setQuizId("mock-quiz-" + account + "-" + selectedCourse);
    } catch (e) {
      console.error(e);
      alert("Failed to request quiz. Make sure you are connected to the correct network and the contract exists.");
    }
  };

  const submitAnswer = async () => {
    if (!selectedCourse || !quizId) return;
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACTS.tutor.address, CONTRACTS.tutor.abi, signer);
      const tx = await contract.submitAnswer(selectedCourse, quizId, answer);
      await tx.wait();
      // Refresh progress
      const prog = await contract.userProgress(account, selectedCourse);
      setProgress({ completed: Number(prog.completedQuizzes), certificateMinted: prog.certificateMinted });
      setQuizId('');
      setAnswer('');
    } catch (e) {
      console.error(e);
      alert("Failed to submit answer.");
    }
  };

  return (
    <main className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard</h1>

      {account ? (
        <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
          Connected as: <strong>{account}</strong>
        </p>
      ) : (
        <p style={{ marginBottom: '1rem', color: '#f87171' }}>Please connect MetaMask.</p>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>Available Courses</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {courses.map((c) => (
            <li
              key={c.id}
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedCourse(c.id)}
            >
              <strong>{c.name}</strong> – {c.totalQuizzes} quizzes – Reward: {c.reward} TRW
            </li>
          ))}
        </ul>
      </section>

      {selectedCourse && (
        <section className="glass-card" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Course #{selectedCourse}
          </h2>

          {progress && (
            <p style={{ marginBottom: '0.75rem' }}>
              Completed quizzes: {progress.completed} / {courses.find((c) => c.id === selectedCourse)?.totalQuizzes}
            </p>
          )}

          {progress?.certificateMinted && (
            <p style={{ color: '#34d399', marginBottom: '1rem' }}>Certificate minted! 🎉</p>
          )}

          {!quizId && (
            <button onClick={requestQuiz} className="btn-primary">
              Request Quiz
            </button>
          )}

          {quizId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <p><strong>Quiz ID:</strong> {quizId}</p>
              <textarea
                placeholder="Your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  minHeight: '80px',
                }}
              />
              <button onClick={submitAnswer} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Submit Answer
              </button>
            </div>
          )}

          <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#a5b4fc', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </section>
      )}
    </main>
  );
}
