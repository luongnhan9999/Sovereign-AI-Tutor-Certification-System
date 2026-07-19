"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="bg-grid"></div>
      <main className="main-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge" style={{ borderColor: 'var(--accent-magenta)', color: 'var(--accent-magenta)' }}>
            <span className="hero-badge-dot" style={{ background: 'var(--accent-magenta)', boxShadow: '0 0 10px var(--accent-magenta)' }}></span>
            SYSTEM ONLINE
          </div>
          <h1 className="hero-title" style={{ marginTop: '1rem' }}>
            The Future of <br/> <span className="gradient-text">Verifiable Learning</span>
          </h1>
          <p className="hero-subtitle typing-text" style={{ color: 'var(--accent-cyan)' }}>
            Initializing Neural Network... establishing secure TEE connection.
          </p>
          <p className="hero-subtitle" style={{ color: 'var(--text-secondary)' }}>
            An autonomous on‑chain AI tutor that creates personalized quizzes, evaluates your answers in a Trusted Execution Environment, and issues cryptographically verifiable ERC‑721 certificates.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="btn-primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
              Establish Link
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <a href="#features" className="btn-secondary">
              Explore Tech
            </a>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" style={{ perspective: '1000px' }}>
          <div className="bento-grid">
            
            <div className="bento-item bento-large holo-card">
              <div className="bento-icon" style={{ background: 'rgba(247, 37, 133, 0.1)', color: 'var(--accent-magenta)' }}>🧠</div>
              <h3 style={{ color: 'var(--text-primary)' }}>Dynamic Neural Generation</h3>
              <p>
                The AI tutor dynamically generates quizzes based on your selected course context. Utilizing state-of-the-art LLMs, no two tests are exactly the same, preventing systemic cheating and ensuring true knowledge synthesis.
              </p>
            </div>

            <div className="bento-item bento-small holo-card">
              <div className="bento-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>🛡️</div>
              <h3>TEE Execution</h3>
              <p>
                Answers are evaluated directly by the AI model running inside a Trusted Execution Environment (TEE).
              </p>
            </div>

            <div className="bento-item bento-small holo-card">
              <div className="bento-icon" style={{ background: 'rgba(157, 78, 221, 0.1)', color: 'var(--accent-purple)' }}>⛓️</div>
              <h3>On-Chain State</h3>
              <p>
                Every interaction, grading decision, and certificate issuance is anchored to the Ethereum blockchain.
              </p>
            </div>

            <div className="bento-item bento-medium holo-card">
              <div className="bento-icon" style={{ background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent-gold)' }}>🏆</div>
              <h3>Verifiable SBT Certificates</h3>
              <p>
                Upon passing a course, receive an ERC-721 Soulbound Token (SBT) directly to your Web3 wallet. This acts as an immutable, cryptographically secure proof of your mastery that can be integrated into your decentralized identity.
              </p>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" style={{ textAlign: 'center', margin: '5rem 0', perspective: '1000px' }}>
          <div className="glass-card holo-card" 
            style={{ padding: '4rem 2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Ready to interface?</h2>
            <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Initialize your session and connect your neural-link (wallet).</p>
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              Initialize Sequence
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
