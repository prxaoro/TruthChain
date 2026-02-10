'use client';

import { useMemo, ReactNode } from 'react';
import { WalletProvider as AleoWalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import { FoxWalletAdapter } from 'aleo-adapters';
import { PuzzleWalletAdapter } from 'aleo-adapters';
import { SoterWalletAdapter } from 'aleo-adapters';
import { DecryptPermission, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

// Import wallet adapter styles
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

interface Props {
  children: ReactNode;
}

export default function WalletProvider({ children }: Props) {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'TruthChain',
      }),
      new FoxWalletAdapter({
        appName: 'TruthChain',
      }),
      new PuzzleWalletAdapter({
        appName: 'TruthChain',
        appDescription: 'Anonymous Whistleblower Platform on Aleo',
        programIdPermissions: {
          [WalletAdapterNetwork.TestnetBeta]: ['truthchain_v2.aleo'],
        },
      }),
      new SoterWalletAdapter({
        appName: 'TruthChain',
      }),
    ],
    []
  );

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.AutoDecrypt}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect={true}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
}
