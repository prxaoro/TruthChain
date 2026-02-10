'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { useAleo } from '@/hooks/useAleo';
import { useStore } from '@/store/useStore';
import { hashToField, generateId } from '@/lib/aleo';
import type { TxStatus } from '@/types';

const STATUS_STEPS: { key: TxStatus; label: string }[] = [
  { key: 'signing', label: 'Signing' },
  { key: 'proving', label: 'Generating ZK Proof' },
  { key: 'broadcasting', label: 'Broadcasting' },
  { key: 'confirmed', label: 'Confirmed' },
];

export default function RegisterPage() {
  const { publicKey, connected, registerInsider, fetchCredential } = useAleo();
  const { credential, txStatus, txId, error } = useStore();

  const [orgName, setOrgName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [registrationDone, setRegistrationDone] = useState(false);
  const [loadingCredential, setLoadingCredential] = useState(false);
  const [credentialChecked, setCredentialChecked] = useState(false);

  // Check if user already has a credential
  useEffect(() => {
    if (connected && !credentialChecked) {
      setLoadingCredential(true);
      fetchCredential().finally(() => {
        setLoadingCredential(false);
        setCredentialChecked(true);
      });
    }
  }, [connected, credentialChecked, fetchCredential]);

  const handleRegister = async () => {
    if (!orgName.trim() || !roleName.trim() || !publicKey) return;

    const orgHash = await hashToField(orgName.toLowerCase().trim());
    const roleHash = await hashToField(roleName.toLowerCase().trim());
    const credentialId = await generateId(publicKey);

    // Store credential in zustand after registration so other pages can see it
    useStore.getState().setCredential({
      owner: publicKey,
      org_hash: orgHash,
      role_hash: roleHash,
      credential_id: credentialId,
    });

    await registerInsider(orgHash, roleHash, credentialId);
    setRegistrationDone(true);
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
              Register as <span className="text-green-400">Insider</span>
            </h1>
            <p className="text-zinc-400 mb-8">
              Create a private credential proving your organizational membership.
              Nobody can see this — not even on-chain.
            </p>
          </motion.div>

          {!connected ? (
            <div className="card p-8 text-center">
              <p className="text-zinc-400 mb-4">Connect your wallet to register</p>
              <p className="text-zinc-600 text-sm">
                Install <a href="https://www.leo.app/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Shield Wallet</a> and connect above
              </p>
            </div>
          ) : loadingCredential ? (
            <div className="card p-8 text-center">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Checking for existing credential...</p>
            </div>
          ) : credential && !registrationDone ? (
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
                <h2 className="text-2xl font-bold mb-2 text-green-400">Already Registered</h2>
                <p className="text-zinc-400 mb-4">
                  You already have an InsiderCredential in your wallet.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <a href="/report" className="btn-primary px-6 py-3">Submit a Report</a>
                  <a href="/verify" className="btn-secondary px-6 py-3">Verify Credential</a>
                </div>
              </div>
            </motion.div>
          ) : (txStatus === 'confirmed' || registrationDone) && txStatus !== 'idle' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 glow-green"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-green-400">Credential Created</h2>
                <p className="text-zinc-400 mb-4">
                  Your InsiderCredential record is now in your wallet. Only you can see it.
                </p>
                {txId && (
                  <p className="text-zinc-600 text-sm font-mono break-all">
                    TX: {txId}
                  </p>
                )}
                <div className="mt-6 flex justify-center gap-4">
                  <a href="/report" className="btn-primary px-6 py-3">Submit a Report</a>
                  <a href="/verify" className="btn-secondary px-6 py-3">Verify Credential</a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="e.g., Acme Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-zinc-600 text-xs mt-1">
                    This will be hashed — the name itself is never stored on-chain
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Department / Role
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="e.g., Engineering"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-zinc-600 text-xs mt-1">
                    Also hashed — proves your department without revealing it
                  </p>
                </div>

                {/* Transaction status */}
                {txStatus !== 'idle' && (
                  <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
                    <div className="flex items-center space-x-3 mb-3">
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
                    {txStatus === 'proving' && (
                      <p className="text-zinc-500 text-xs">Generating zero-knowledge proof... this may take 30-60 seconds</p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="border border-red-900 rounded-lg p-4 bg-red-900/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRegister}
                  disabled={isProcessing || !orgName.trim() || !roleName.trim()}
                >
                  {isProcessing ? 'Processing...' : 'Register as Insider'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
