"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function Header() {
  const [account, setAccount] = useState<string>('');

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

  return (
    <header className="header">
      <Link href="/" className="header-brand">
        🎓 Sovereign AI Tutor
      </Link>
      <div className={`header-status ${account ? 'connected' : ''}`}>
        {account
          ? `🟢 ${account.slice(0, 6)}…${account.slice(-4)}`
          : '⚪ Not connected'}
      </div>
    </header>
  );
}
