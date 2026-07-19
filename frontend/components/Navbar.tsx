import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function Navbar() {
  const [account, setAccount] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length) setAccount(ethers.getAddress(accounts[0]));
      });
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts.length ? ethers.getAddress(accounts[0]) : '');
      });
    }
  }, []);

  return (
    <nav className="flex items-center justify-between bg-black/30 backdrop-blur-md px-6 py-4 mb-8 rounded-b-xl">
      <Link href="/" className="text-2xl font-bold text-white">
        VeriLearn
      </Link>
      <div className="text-sm text-gray-300">
        {account ? `Connected: ${account.slice(0, 6)}…${account.slice(-4)}` : 'Not connected'}
      </div>
    </nav>
  );
}
