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
    <main className="flex flex-col items-center p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {account ? (
        <p className="mb-4">Connected as: {account}</p>
      ) : (
        <p className="mb-4 text-red-400">Please connect MetaMask.</p>
      )}
      <section className="w-full max-w-2xl mb-8">
        <h2 className="text-xl font-semibold mb-3">Available Courses</h2>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li key={c.id} className="p-3 bg-white/5 rounded-md cursor-pointer hover:bg-white/10" onClick={() => setSelectedCourse(c.id)}>
              <span className="font-medium">{c.name}</span> – {c.totalQuizzes} quizzes – Reward: {c.reward} TRW
            </li>
          ))}
        </ul>
      </section>
      {selectedCourse && (
        <section className="w-full max-w-2xl space-y-6">
          <h2 className="text-xl font-semibold">Course #{selectedCourse}</h2>
          {progress && (
            <p>Completed quizzes: {progress.completed} / {courses.find((c) => c.id === selectedCourse)?.totalQuizzes}</p>
          )}
          {progress?.certificateMinted && (
            <p className="text-green-400">Certificate minted! 🎉</p>
          )}
          {!quizId && (
            <button onClick={requestQuiz} className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition">
              Request Quiz
            </button>
          )}
          {quizId && (
            <div className="space-y-4">
              <p className="font-medium">Quiz ID: {quizId}</p>
              <textarea
                placeholder="Your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white"
              />
              <button onClick={submitAnswer} className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition">
                Submit Answer
              </button>
            </div>
          )}
          <Link href="/" className="inline-block mt-4 text-indigo-300 hover:underline">← Back to Home</Link>
        </section>
      )}
    </main>
  );
}
