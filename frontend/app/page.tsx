"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <section className="w-full max-w-3xl rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center shadow-lg">
        <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-md">
          Sovereign AI Tutor
        </h1>
        <p className="mb-6 text-lg text-white/80">
          Autonomous on‑chain AI tutor that creates personalized quizzes, tracks progress, and issues ERC‑721 certificates.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => {
              const demoId = Math.random().toString(36).substring(2, 10);
              localStorage.setItem('demoUser', demoId);
              alert(`Demo user created: ${demoId}`);
            }}
            className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 transition"
          >
            Random Demo
          </button>
        </div>
      </section>
    </main>
  );
}
