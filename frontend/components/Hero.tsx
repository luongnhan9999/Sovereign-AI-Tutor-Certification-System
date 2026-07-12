import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-section">
      <h1 className="hero-title">Sovereign AI Tutor</h1>
      <p className="hero-subtitle">
        Autonomous on‑chain AI tutor that creates personalized quizzes, tracks progress, and issues ERC‑721 certificates.
      </p>
      <Link href="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </section>
  );
}
