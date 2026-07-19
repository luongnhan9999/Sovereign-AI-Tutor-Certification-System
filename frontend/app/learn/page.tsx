"use client";
import React from 'react';
import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className="dashboard-container" style={{ minHeight: '80vh', padding: '100px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>
          Learning <span className="text-gradient">Resources</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '800px' }}>
          Study the official documentation and architectural concepts below before taking the quizzes to earn your verifiable credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Module 1 */}
        <div className="bento-item">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>1. Introduction to VeriLearn & TEEs</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>VeriLearn</strong> aims to bring AI models to decentralized infrastructure. Standard smart contracts (EVM) cannot run Large Language Models (LLMs) due to gas limits and the non-deterministic nature of AI on GPUs (e.g., differences in thread scheduling).
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
            To solve this, we use <strong>Trusted Execution Environments (TEEs)</strong> combined with Cryptographic Proofs (like ZKPs) to ensure the AI executes correctly off-chain and the verifiable result is brought on-chain securely.
          </p>
        </div>

        {/* Module 2 */}
        <div className="bento-item">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>2. Ritual Whitepaper (Symphony)</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            The standard <strong>Replicated State Machine (SMR)</strong> model fails for GPU workloads because hardware non-reproducibility causes divergent state roots across nodes. 
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
            Ritual introduces <strong>Symphony</strong>, an Execution-Aware Consensus. It features <strong>Extended External Validity</strong> (transferring proposer's powers to users) and <strong>Inclusion Guarantees</strong> (blocks are invalid if triggered transactions are absent). Long-running computations are verified via a Product Lattice over proof systems (TEE, ZKP) and committee sampling.
          </p>
        </div>

        {/* Module 3 */}
        <div className="bento-item">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>3. Infernet Architecture</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>Ritual Infernet</strong> is the off-chain platform that executes AI tasks and returns results on-chain. An Infernet Node consists of core components like the <strong>Router, Anvil, Redis, and Compute Containers</strong>.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
            Smart contracts interact with this architecture primarily by calling the <code>requestCompute()</code> function, which emits an event that the off-chain Router picks up and routes to the Compute Containers.
          </p>
        </div>

        {/* Module 4 */}
        <div className="bento-item">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>4. Developing with Ritual SDK</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            When building decentralized apps with the Ritual SDK, the results of the AI computation are typically returned to the smart contract via a callback function named <code>_deliver()</code>.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
            Inside the Compute Containers, developers can run models using popular Python frameworks like <strong>PyTorch and HuggingFace</strong>. The validity of these off-chain executions is guaranteed using Cryptographic Signatures or ZK Proofs.
          </p>
        </div>

        {/* Module 5 */}
        <div className="bento-item">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>5. Real-World On-Chain AI Use Cases</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Bringing AI on-chain unlocks massive potential. In <strong>DeFi</strong>, AI Coprocessors can perform real-time credit risk assessments based on a wallet's complex historical transaction data, something traditional contracts cannot compute.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
            In the <strong>NFT</strong> space, it enables true Generative NFTs that evolve dynamically using on-chain AI outputs rather than static metadata.
          </p>
        </div>

      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <Link href="/dashboard" style={{
          display: 'inline-block',
          padding: '1rem 2.5rem',
          background: 'linear-gradient(45deg, var(--accent-blue), var(--accent-cyan))',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '50px',
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(0, 198, 255, 0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          I'm Ready - Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
