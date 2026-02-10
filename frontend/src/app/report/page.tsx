'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { useAleo } from '@/hooks/useAleo';
import { useStore } from '@/store/useStore';
import { hashToField, generateId, SEVERITY_LEVELS } from '@/lib/aleo';
import type { TxStatus } from '@/types';

const STATUS_STEPS: { key: TxStatus; label: string }[] = [
  { key: 'signing', label: 'Signing' },
  { key: 'proving', label: 'Generating ZK Proof' },
  { key: 'broadcasting', label: 'Broadcasting' },
  { key: 'confirmed', label: 'Confirmed' },
];

export default function ReportPage() {
  const { publicKey, connected, submitReport, fetchCredential, getRawCredentialRecord } = useAleo();
  const { credential, txStatus, txId, error } = useStore();

  const [reportContent, setReportContent] = useState('');
  const [severity, setSeverity] = useState(3);
  const [loadingCredential, setLoadingCredential] = useState(false);
  const [credentialChecked, setCredentialChecked] = useState(false);

  // Reset txStatus on mount so previous page's confirmed state doesn't show
  useEffect(() => {
    useStore.getState().setTxStatus('idle');
    useStore.getState().setTxId(null);
    useStore.getState().setError(null);
  }, []);

  // Fetch credential when wallet connects (skip if already in store)
  useEffect(() => {
    if (connected && !credentialChecked) {
      if (credential) {
        setCredentialChecked(true);
        return;
      }
      setLoadingCredential(true);
      fetchCredential().finally(() => {
        setLoadingCredential(false);
        setCredentialChecked(true);
      });
    }
  }, [connected, credentialChecked, credential, fetchCredential]);

  const handleSubmit = async () => {
    if (!reportContent.trim() || !publicKey) return;

    const rawRecord = await getRawCredentialRecord();
    if (!rawRecord) {
      useStore.getState().setError('No credential found. Register first.');
      return;
    }

    const reportHash = await hashToField(reportContent.trim());
    const reportId = await generateId(publicKey);

    await submitReport(rawRecord, reportHash, severity, reportId);
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
              Submit <span className="text-green-400">Anonymous Report</span>
            </h1>
            <p className="text-zinc-400 mb-8">
              Your credential proves insider status. Your identity stays hidden.
              Only aggregate stats become public.
            </p>
          </motion.div>

          {!connected ? (
            <div className="card p-8 text-center">
              <p className="text-zinc-400 mb-4">Connect your wallet to submit a report</p>
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
                You need to register as an insider before submitting a report.
              </p>
              <Link href="/register" className="btn-primary px-6 py-3">
                Register First
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-green-400">Report Submitted</h2>
                <p className="text-zinc-400 mb-2">
                  Your report is on-chain. Your identity remains completely anonymous.
                </p>
                <p className="text-zinc-500 text-sm mb-4">
                  Only the report count and severity aggregate were made public.
                </p>
                {txId && (
                  <p className="text-zinc-600 text-sm font-mono break-all">
                    TX: {txId}
                  </p>
                )}
                <div className="mt-6">
                  <Link href="/dashboard" className="btn-secondary px-6 py-3">View Dashboard</Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Credential info */}
              <div className="card p-4 border-green-900">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-green-400 font-semibold text-sm">Credential Active</span>
                </div>
                <p className="text-zinc-500 text-xs mt-1 font-mono">
                  Org: {credential.org_hash.slice(0, 20)}...
                </p>
              </div>

              <div className="card p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Report Content
                    </label>
                    <textarea
                      className="input-dark min-h-[150px] resize-y"
                      placeholder="Describe the wrongdoing in detail..."
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-zinc-600 text-xs mt-1">
                      This content is hashed — only the hash goes on-chain, not the text itself.
                      Keep a copy of your report for your records.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-3">
                      Severity Level
                    </label>
                    <div className="flex gap-2">
                      {SEVERITY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setSeverity(level.value)}
                          disabled={isProcessing}
                          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                            severity === level.value
                              ? 'ring-2 ring-offset-1 ring-offset-black scale-105'
                              : 'opacity-60 hover:opacity-80'
                          }`}
                          style={{
                            backgroundColor: severity === level.value ? level.color + '33' : '#18181b',
                            color: level.color,
                            borderColor: severity === level.value ? level.color : '#333',
                            border: `1px solid ${severity === level.value ? level.color : '#333'}`,
                          }}
                        >
                          {level.value}
                          <div className="text-xs opacity-70">{level.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-zinc-500 text-xs mt-2">
                      {SEVERITY_LEVELS.find(l => l.value === severity)?.description}
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
                    onClick={handleSubmit}
                    disabled={isProcessing || !reportContent.trim()}
                  >
                    {isProcessing ? 'Processing...' : 'Submit Anonymous Report'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
