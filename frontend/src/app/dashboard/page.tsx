'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { hashToField } from '@/lib/aleo';
import { getOrgStats } from '@/lib/aleoService';
import type { OrgStats } from '@/types';

const SEVERITY_COLORS = [
  { min: 0, max: 1, color: '#4ade80', label: 'Low' },
  { min: 1, max: 2, color: '#facc15', label: 'Medium' },
  { min: 2, max: 3, color: '#fb923c', label: 'High' },
  { min: 3, max: 4, color: '#ef4444', label: 'Critical' },
  { min: 4, max: 5, color: '#dc2626', label: 'Severe' },
];

function SeverityBar({ value }: { value: number }) {
  if (value <= 0) return null;
  const pct = Math.min((value / 5) * 100, 100);
  const info = SEVERITY_COLORS.find(s => value >= s.min && value < s.max) || SEVERITY_COLORS[4];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-500">Severity Scale</span>
        <span style={{ color: info.color }} className="font-semibold">{info.label}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: info.color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [searchOrg, setSearchOrg] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrgStats[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchOrg.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const orgHash = await hashToField(searchOrg.toLowerCase().trim());
      const stats = await getOrgStats(orgHash, searchOrg.trim());

      setResults(prev => {
        const exists = prev.find(r => r.orgHash === stats.orgHash);
        if (exists) {
          return prev.map(r => r.orgHash === stats.orgHash ? stats : r);
        }
        return [stats, ...prev];
      });
    } catch {
      // Failed to fetch — show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-4 grid-bg">
        <div className="max-w-4xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Public <span className="text-green-400">Dashboard</span>
            </h1>
            <p className="text-zinc-400 mb-8">
              View aggregate report statistics per organization.
              Only total counts and average severity are public — no individual data.
            </p>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 mb-6 flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-green-400 text-sm font-semibold">Privacy Guarantee</span>
              <p className="text-zinc-500 text-xs">
                All data below comes from public on-chain mappings. No individual reports, addresses, or identities are ever visible.{' '}
                <Link href="/privacy" className="text-green-400 hover:underline">Learn more</Link>
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <div className="card p-6 mb-8">
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Look up an organization
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                className="input-dark flex-1"
                placeholder="Enter organization name..."
                value={searchOrg}
                onChange={(e) => setSearchOrg(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn-primary px-6 py-3 disabled:opacity-50"
                onClick={handleSearch}
                disabled={loading || !searchOrg.trim()}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : 'Search'}
              </button>
            </div>
            <p className="text-zinc-600 text-xs mt-2">
              The org name is hashed locally to look up on-chain data — the name is never sent to the network
            </p>
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((org, i) => (
                <motion.div
                  key={org.orgHash}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{org.orgName}</h3>
                    {org.isRegistered ? (
                      <span className="badge-verified">Insiders Registered</span>
                    ) : (
                      <span className="badge-pending">No Activity</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="text-3xl font-bold text-green-400">{org.reportCount}</div>
                      <div className="text-zinc-500 text-sm mt-1">Total Reports</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="text-3xl font-bold" style={{
                        color: org.avgSeverity >= 4 ? '#ef4444' :
                               org.avgSeverity >= 3 ? '#fb923c' :
                               org.avgSeverity >= 2 ? '#facc15' : '#4ade80'
                      }}>
                        {org.avgSeverity > 0 ? org.avgSeverity.toFixed(1) : '—'}
                      </div>
                      <div className="text-zinc-500 text-sm mt-1">Avg Severity</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <div className="text-3xl font-bold text-zinc-400">{org.severitySum}</div>
                      <div className="text-zinc-500 text-sm mt-1">Severity Sum</div>
                    </div>
                  </div>

                  {/* Severity visualization bar */}
                  <SeverityBar value={org.avgSeverity} />

                  <p className="text-zinc-600 text-xs mt-4 font-mono">
                    Hash: {org.orgHash.slice(0, 30)}...
                  </p>
                </motion.div>
              ))}
            </div>
          ) : searched && !loading ? (
            <div className="card p-8 text-center">
              <p className="text-zinc-400">No data found for this organization.</p>
              <p className="text-zinc-600 text-sm mt-2">
                Either no insiders have registered or the program hasn&apos;t been deployed yet.
              </p>
            </div>
          ) : !searched ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Search Organizations</h3>
              <p className="text-zinc-400 mb-2">Search for an organization to view its aggregate report data</p>
              <p className="text-zinc-600 text-sm">
                All data shown here is from public on-chain mappings — no private information is revealed
              </p>
            </motion.div>
          ) : null}
        </div>
      </main>
    </>
  );
}
