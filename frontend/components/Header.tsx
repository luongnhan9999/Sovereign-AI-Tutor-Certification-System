"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function Header() {
  const [account, setAccount] = useState<string>('');

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
        if (accounts.length) setAccount(ethers.getAddress(accounts[0]));
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
        <div className="header-status connected">
          🟢 {account.slice(0, 6)}…{account.slice(-4)}
        </div>
      ) : (
        <button onClick={connectWallet} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Connect Wallet
        </button>
      )}
    </header>
  );
}
