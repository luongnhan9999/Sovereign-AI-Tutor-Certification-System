"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { switchNetwork } from '@/lib/web3';

export default function Header() {
  const [account, setAccount] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      if (localStorage.getItem('manuallyDisconnected') !== 'true') {
        (window as any).ethereum
          .request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length) setAccount(ethers.getAddress(accounts[0]));
          });
      }
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts.length ? ethers.getAddress(accounts[0]) : '');
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length) {
          localStorage.removeItem('manuallyDisconnected');
          setAccount(ethers.getAddress(accounts[0]));
          await switchNetwork();
          window.location.reload();
        }
      } catch (err) {
        console.error("User rejected request", err);
      }
    } else {
      alert("Please install MetaMask to use this app.");
    }
  };

  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,229,255,0.1)', borderRadius: '10px', border: '1px solid rgba(0,229,255,0.3)', boxShadow: '0 0 15px rgba(0,229,255,0.2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk', background: 'linear-gradient(90deg, #fff, var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
          VeriLearn
        </span>
      </Link>
      
      <div className="header-nav" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', background: 'rgba(0,229,255,0.05)', padding: '0.6rem 2rem', borderRadius: '100px', border: '1px solid rgba(0,229,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, fontSize: '0.95rem' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.textShadow = '0 0 8px rgba(0,229,255,0.5)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.textShadow = 'none' }}>Dashboard</Link>
        <Link href="/learn" style={{ color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, fontSize: '0.95rem' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.textShadow = '0 0 8px rgba(0,229,255,0.5)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.textShadow = 'none' }}>Learn & Docs</Link>
        <Link href="/certificates" style={{ color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, fontSize: '0.95rem' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.textShadow = '0 0 8px rgba(0,229,255,0.5)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.textShadow = 'none' }}>Certificates</Link>
        <Link href="/network" style={{ color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, fontSize: '0.95rem' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.textShadow = '0 0 8px rgba(0,229,255,0.5)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.textShadow = 'none' }}>Network Status</Link>
      </div>
      
      <div className="header-actions">
        {account ? (
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', 
                background: 'var(--glass-bg)', padding: '0.5rem 1.25rem', 
                borderRadius: '100px', border: '1px solid var(--glass-border)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
              <span style={{ width: '8px', height: '8px', background: 'var(--accent-lime)', borderRadius: '50%', boxShadow: '0 0 5px var(--accent-lime)' }}></span>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>{`${account.slice(0,6)}...${account.slice(-4)}`}</span>
            </div>
            {showDropdown && (
              <div style={{ 
                position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, 
                background: 'rgba(0, 0, 0, 0.9)', border: '1px solid var(--glass-border)', 
                borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '160px',
                boxShadow: 'var(--shadow-neon)', zIndex: 100, backdropFilter: 'blur(10px)'
              }}>
                <button 
                  style={{ 
                    width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    fontFamily: 'Space Grotesk', fontWeight: 600, transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onClick={() => {
                    setAccount("");
                    setShowDropdown(false);
                    localStorage.setItem('manuallyDisconnected', 'true');
                    window.location.reload();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={connectWallet} className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
