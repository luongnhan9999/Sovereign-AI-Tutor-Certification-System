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

        {/* Premium Minimalist Footer */}
        <footer style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '2rem 5%', 
          marginTop: 'auto', 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          background: 'rgba(0,0,0,0.2)', 
          backdropFilter: 'blur(20px)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div className="footer-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="/terms" style={{ fontSize: '0.9rem' }}>Terms of Service</a>
            <a href="/privacy" style={{ fontSize: '0.9rem' }}>Privacy Policy</a>
            <a href="https://docs.ritual.net" target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem' }}>Documentation</a>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            © {new Date().getFullYear()} VeriLearn. Secured by Ritual TEE.
          </div>
        </footer>
      </body>
    </html>
  );
}
