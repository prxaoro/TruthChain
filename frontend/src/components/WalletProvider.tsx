'use client';

import { useMemo, ReactNode } from 'react';
import { WalletProvider as AleoWalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
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
