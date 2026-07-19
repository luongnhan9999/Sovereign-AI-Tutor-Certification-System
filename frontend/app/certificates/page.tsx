"use client";
import React from 'react';

export default function CertificatesPage() {
  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '120px 5% 40px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}>Neural Certificates</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          View and manage your minted VeriLearn TCERT NFTs securely stored on-chain.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="vip-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(247, 37, 133, 0.6))' }}>📜</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>No Certificates Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            You haven't minted any Neural Certificates yet. Head over to the Dashboard, validate the required nodes, and claim your genesis NFT!
          </p>
          <a href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
            Access Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
