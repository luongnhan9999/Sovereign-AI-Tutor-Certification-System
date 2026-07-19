import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'] });

import './globals.css';

export const metadata: Metadata = {
  title: 'VeriLearn',
  description: 'Autonomous on‑chain AI tutor with certificate NFTs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="app-body">
        {/* Animated Background */}
        <div className="bg-animation">
          <div className="bg-orb bg-orb-1"></div>
          <div className="bg-orb bg-orb-2"></div>
          <div className="bg-orb bg-orb-3"></div>
        </div>
        <div className="bg-grid"></div>

        <Header />
        {children}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-brand">VeriLearn</div>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Docs</a>
          </div>
          <div>© {new Date().getFullYear()} VeriLearn. Built on Ritual.</div>
        </footer>
      </body>
    </html>
  );
}
