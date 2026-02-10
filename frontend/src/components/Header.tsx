'use client';

import Link from 'next/link';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';

export default function Header() {
  const { publicKey, connected } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              TRUTH<span className="text-green-400">CHAIN</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/register" className="text-zinc-400 hover:text-green-400 transition-colors">
              Register
            </Link>
            <Link href="/report" className="text-zinc-400 hover:text-green-400 transition-colors">
              Report
            </Link>
            <Link href="/dashboard" className="text-zinc-400 hover:text-green-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/verify" className="text-zinc-400 hover:text-green-400 transition-colors">
              Verify
            </Link>
            <Link href="/reports" className="text-zinc-400 hover:text-green-400 transition-colors">
              My Reports
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-green-400 transition-colors">
              Privacy
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {connected && publicKey ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-700">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-zinc-300 font-mono">
                    {truncateAddress(publicKey)}
                  </span>
                </div>
              </div>
            ) : null}
            <WalletMultiButton
              style={{
                backgroundColor: connected ? '#27272a' : '#4ade80',
                color: connected ? '#a1a1aa' : '#000',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                border: connected ? '1px solid #3f3f46' : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
