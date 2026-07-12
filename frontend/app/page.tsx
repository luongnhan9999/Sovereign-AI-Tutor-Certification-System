"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="main-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Live on Ritual Testnet
        </div>
        <h1 className="hero-title">
          The Future of <span className="gradient-text">Learning</span>
        </h1>
        <p className="hero-subtitle">
          An autonomous on‑chain AI tutor that creates personalized quizzes, evaluates your answers, and issues verifiable ERC‑721 certificates.
        </p>
        <div className="hero-actions">
          <Link href="/dashboard" className="btn-primary">
            Launch App
          </Link>
          <a href="#how-it-works" className="btn-secondary">
            Learn More
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-value">24/7</div>
          <div className="stat-label">AI Availability</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">100%</div>
          <div className="stat-label">On-Chain Verifiable</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">Zero</div>
          <div className="stat-label">Human Bias</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-header" id="features">
        <div className="section-tag">Features</div>
        <h2 className="section-title">Powered by Sovereign AI</h2>
        <p className="section-desc">
          Experience a new paradigm in education where artificial intelligence meets blockchain technology for transparent and objective learning.
        </p>
      </section>

      <section className="cards-section">
        <div className="glass-card">
          <div className="card-icon">🧠</div>
          <h3>Dynamic Quiz Generation</h3>
          <p>
            The AI tutor creates personalized quizzes on the fly based on your selected course and progress. No two tests are exactly the same.
          </p>
        </div>
        <div className="glass-card">
          <div className="card-icon">⚖️</div>
          <h3>Objective Evaluation</h3>
          <p>
            Your answers are evaluated directly by the AI model running in a Trusted Execution Environment (TEE), ensuring fair and unbiased grading.
          </p>
        </div>
        <div className="glass-card">
          <div className="card-icon">🏆</div>
          <h3>Verifiable Certificates</h3>
          <p>
            Upon completing a course, receive an ERC-721 NFT certificate directly to your wallet, cryptographically proving your mastery.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="section-header" id="how-it-works">
        <div className="section-tag">Process</div>
        <h2 className="section-title">How It Works</h2>
      </section>

      <section className="steps-section">
        <div className="step-card">
          <div className="step-number">1</div>
          <h4>Connect Wallet</h4>
          <p>Link your MetaMask to the Ritual Testnet to start your learning journey.</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h4>Request a Quiz</h4>
          <p>Select a course and the smart contract will request the AI to generate a question.</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h4>Submit Answer</h4>
          <p>Provide your answer and the AI will evaluate its correctness on-chain.</p>
        </div>
        <div className="step-card">
          <div className="step-number">4</div>
          <h4>Earn Certificate</h4>
          <p>Pass all quizzes to automatically mint your verifiable NFT certificate.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to start learning?</h2>
          <p>Join the decentralized education revolution today.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
