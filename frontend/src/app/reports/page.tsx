'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { useAleo } from '@/hooks/useAleo';
import { useStore } from '@/store/useStore';
import { SEVERITY_LEVELS } from '@/lib/aleo';

export default function MyReportsPage() {
  const { connected, fetchReports, fetchCredential } = useAleo();
  const { credential, reports } = useStore();
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (connected && !fetched) {
      setLoading(true);
      Promise.all([
        fetchCredential(),
        fetchReports(),
      ]).finally(() => {
        setLoading(false);
        setFetched(true);
      });
    }
  }, [connected, fetched, fetchCredential, fetchReports]);

  const getSeverityInfo = (sev: string) => {
    const val = parseInt(sev.replace('u8', ''));
    return SEVERITY_LEVELS.find(l => l.value === val) || SEVERITY_LEVELS[2];
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              My <span className="text-green-400">Reports</span>
            </h1>
            <p className="text-zinc-400 mb-8">
              Your submitted reports stored privately in your wallet. Only you can see these.
            </p>
          </motion.div>

          {!connected ? (
            <div className="card p-8 text-center">
              <p className="text-zinc-400 mb-4">Connect your wallet to view your reports</p>
            </div>
          ) : loading ? (
            <div className="card p-8 text-center">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading your records...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Credential status */}
              {credential ? (
                <div className="glass p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-green-400 font-semibold text-sm">Credential Active</span>
                  </div>
                  <span className="badge-verified">Verified Insider</span>
                </div>
              ) : (
                <div className="glass p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-zinc-600" />
                    <span className="text-zinc-400 font-semibold text-sm">No Credential</span>
                  </div>
                  <Link href="/register" className="text-green-400 text-sm hover:underline">
                    Register First
                  </Link>
                </div>
              )}

              {/* Reports list */}
              {reports.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
                  <p className="text-zinc-500 mb-6">
                    You haven&apos;t submitted any anonymous reports yet.
                  </p>
                  <Link href="/report" className="btn-primary px-6 py-3">
                    Submit Your First Report
                  </Link>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{reports.length} Report{reports.length !== 1 ? 's' : ''} Found</h2>
                    <Link href="/report" className="btn-secondary px-4 py-2 text-sm">
                      + New Report
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {reports.map((report, i) => {
                      const sevInfo = getSeverityInfo(report.severity);
                      return (
                        <motion.div
                          key={report.report_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="card p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: sevInfo.color }}
                              />
                              <span className="text-sm font-semibold" style={{ color: sevInfo.color }}>
                                Severity {sevInfo.value} — {sevInfo.label}
                              </span>
                            </div>
                            <span className="badge-verified text-xs">On-Chain</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Report Hash</span>
                              <span className="text-zinc-300 font-mono text-xs">{report.report_hash.slice(0, 28)}...</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Org Hash</span>
                              <span className="text-zinc-300 font-mono text-xs">{report.org_hash.slice(0, 28)}...</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Report ID</span>
                              <span className="text-zinc-300 font-mono text-xs">{report.report_id.slice(0, 28)}...</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
