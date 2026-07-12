import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sovereign AI Tutor',
  description: 'Autonomous on‑chain AI tutor with certificate NFTs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-gray-900 text-white min-h-screen">
      <body className="flex flex-col min-h-screen antialiased bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {children}
      </body>
    </html>
  );
}
