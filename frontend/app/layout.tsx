import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'] });

import './globals.css';

export const metadata: Metadata = {
  title: 'VeriLearn',
  description: 'VeriLearn: Autonomous on‑chain AI tutor with certificate NFTs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="app-body">
        {/* Ambient Mesh Background */}
        <div className="ambient-background"></div>

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
