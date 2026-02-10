'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { useAleo } from '@/hooks/useAleo';
import { useStore } from '@/store/useStore';
import type { TxStatus } from '@/types';

const STATUS_STEPS: { key: TxStatus; label: string }[] = [
  { key: 'signing', label: 'Signing' },
  { key: 'proving', label: 'Generating ZK Proof' },
  { key: 'broadcasting', label: 'Broadcasting' },
  { key: 'confirmed', label: 'Confirmed' },
];

export default function VerifyPage() {
  const { connected, fetchCredential, verifyCredential, getRawCredentialRecord } = useAleo();
  const { credential, txStatus, txId, error } = useStore();

  const [loadingCredential, setLoadingCredential] = useState(false);
  const [credentialChecked, setCredentialChecked] = useState(false);

  useEffect(() => {
    if (connected && !credentialChecked) {
      setLoadingCredential(true);
      fetchCredential().finally(() => {
        setLoadingCredential(false);
        setCredentialChecked(true);
      });
    }
  }, [connected, credentialChecked, fetchCredential]);

  const handleVerify = async () => {
    const rawRecord = await getRawCredentialRecord();
    if (!rawRecord) {
      useStore.getState().setError('No credential found');
      return;
    }
    await verifyCredential(rawRecord);
  };

  const isProcessing = txStatus !== 'idle' && txStatus !== 'confirmed' && txStatus !== 'failed';

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Verify <span className="text-green-400">Credential</span>
            </h1>
            <p className="text-zinc-400 mb-8">
              Prove you&apos;re a registered insider by consuming and re-issuing your credential.
              This generates a verifiable ZK proof without revealing your identity.
            </p>
          </motion.div>

          {!connected ? (
            <div className="card p-8 text-center">
              <p className="text-zinc-400 mb-4">Connect your wallet to verify your credential</p>
            </div>
          ) : loadingCredential ? (
            <div className="card p-8 text-center">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Checking for credential...</p>
            </div>
          ) : !credential ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Credential Found</h3>
              <p className="text-zinc-400 mb-6">
                You need to register as an insider first.
              </p>
              <Link href="/register" className="btn-primary px-6 py-3">
                Register as Insider
              </Link>
            </div>
          ) : txStatus === 'confirmed' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 glow-green"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-green-400">Credential Verified</h2>
                <p className="text-zinc-400 mb-4">
                  Your insider status has been cryptographically proven. Your credential has been re-issued.
                </p>
                {txId && (
                  <p className="text-zinc-600 text-sm font-mono break-all">
                    TX: {txId}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="card p-8">
              <div className="space-y-6">
                {/* Credential details */}
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                  <h3 className="text-sm font-semibold text-green-400 mb-3">Your Credential</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Org Hash</span>
                      <span className="text-zinc-300 font-mono text-xs">{credential.org_hash.slice(0, 24)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Role Hash</span>
                      <span className="text-zinc-300 font-mono text-xs">{credential.role_hash.slice(0, 24)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Credential ID</span>
                      <span className="text-zinc-300 font-mono text-xs">{credential.credential_id.slice(0, 24)}...</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2">What happens when you verify?</h3>
                  <ul className="text-zinc-500 text-sm space-y-1">
                    <li>1. Your old credential record is consumed (spent)</li>
                    <li>2. A new identical credential is created for you</li>
                    <li>3. This creates a ZK proof that you own a valid credential</li>
                    <li>4. Nobody learns who you are or which org you belong to</li>
                  </ul>
                </div>

                {/* Transaction status */}
                {txStatus !== 'idle' && (
                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
                    <div className="flex items-center space-x-3">
                      {STATUS_STEPS.map((step, i) => {
                        const stepIdx = STATUS_STEPS.findIndex(s => s.key === txStatus);
                        const isActive = i === stepIdx;
                        const isDone = i < stepIdx || (txStatus as string) === 'confirmed';
                        return (
                          <div key={step.key} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isDone ? 'bg-green-400' :
                              isActive ? 'bg-green-400 animate-pulse' :
                              'bg-zinc-700'
                            }`} />
                            <span className={`ml-1 text-xs ${
                              isDone || isActive ? 'text-green-400' : 'text-zinc-600'
                            }`}>
                              {step.label}
                            </span>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`w-6 h-px mx-1 ${isDone ? 'bg-green-400' : 'bg-zinc-700'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="border border-red-900 rounded-lg p-4 bg-red-900/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleVerify}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Verify Credential'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
