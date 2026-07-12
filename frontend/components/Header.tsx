"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { switchNetwork } from '@/lib/web3';

export default function Header() {
  const [account, setAccount] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length) setAccount(ethers.getAddress(accounts[0]));
        });
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
          setAccount(ethers.getAddress(accounts[0]));
          await switchNetwork();
        }
      } catch (err) {
        console.error("User rejected request", err);
      }
    } else {
      alert("Please install MetaMask to use this app.");
    }
  };

  return (
    <header className="header">
      <Link href="/" className="header-brand">
        🎓 Sovereign AI Tutor
      </Link>
      
      {account ? (
        <div style={{ position: 'relative' }}>
          <div 
            className="header-status connected hover-effect" 
            style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            🟢 {account.slice(0, 6)}…{account.slice(-4)}
          </div>
          {showDropdown && (
            <div style={{ 
              position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, 
              background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '150px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 100
            }}>
              <button 
                className="btn"
                style={{ 
                  width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                  border: 'none', padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
                onClick={() => {
                  setAccount("");
                  setShowDropdown(false);
                  // Reload the page to clear the dashboard state as well since it has its own account state
                  window.location.reload();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={connectWallet} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Connect Wallet
        </button>
      )}
    </header>
  );
}
