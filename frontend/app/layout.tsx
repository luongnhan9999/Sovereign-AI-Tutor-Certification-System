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
          <div style={{ 
            fontFamily: 'Space Grotesk', 
            fontSize: '1.2rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem' 
          }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-cyan)' }}></span>
            VeriLearn
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            © {new Date().getFullYear()} VeriLearn. Secured by Ritual TEE.
          </div>
        </footer>
      </body>
    </html>
  );
}
