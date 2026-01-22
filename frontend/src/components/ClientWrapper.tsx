'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WalletProvider to avoid SSR issues
const WalletProvider = dynamic(
  () => import('./WalletProvider'),
  { ssr: false }
);

interface Props {
  children: ReactNode;
}

export default function ClientWrapper({ children }: Props) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}
