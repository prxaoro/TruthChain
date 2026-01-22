'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { getKnownCompanies, KnownCompany } from '@/lib/companyRegistry';
import { getCompanySubmissionCount, getVerifiedLeakCount } from '@/lib/aleoService';

interface CompanyStat {
  name: string;
  hash: string;
  submissions: number;
  verified: number;
  verificationRate: number;
}

export default function StatsPage() {
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalVerified, setTotalVerified] = useState(0);
  const [totalBountyPool] = useState(125000); // Placeholder per user request
  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [animatedSubmissions, setAnimatedSubmissions] = useState(0);
  const [animatedVerified, setAnimatedVerified] = useState(0);
  const [animatedBounty, setAnimatedBounty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch real blockchain data
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const knownCompanies = getKnownCompanies();

      if (knownCompanies.length === 0) {
        // No companies tracked yet - show empty state
        setCompanies([]);
        setTotalSubmissions(0);
        setTotalVerified(0);
        setLoading(false);
        setLastRefresh(new Date());
        return;
      }

      // Fetch stats for each known company from blockchain
      const companyStats: CompanyStat[] = [];
      let totalSubs = 0;
      let totalVer = 0;

      for (const company of knownCompanies) {
        const [submissions, verified] = await Promise.all([
          getCompanySubmissionCount(company.hash),
          getVerifiedLeakCount(company.hash),
        ]);

        totalSubs += submissions;
        totalVer += verified;

        // Only include companies with at least 1 submission
        if (submissions > 0) {
          companyStats.push({
            name: company.name || 'Unknown Company',
            hash: `${company.hash.slice(0, 12)}...`,
            submissions,
            verified,
            verificationRate: submissions > 0 ? Math.round((verified / submissions) * 100) : 0,
          });
        }
      }

      // Sort by submissions (descending)
      companyStats.sort((a, b) => b.submissions - a.submissions);

      setCompanies(companyStats);
      setTotalSubmissions(totalSubs);
      setTotalVerified(totalVer);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Animate numbers
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const submissionStep = totalSubmissions / steps;
    const verifiedStep = totalVerified / steps;
    const bountyStep = totalBountyPool / steps;

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setAnimatedSubmissions(Math.min(Math.floor(submissionStep * current), totalSubmissions));
      setAnimatedVerified(Math.min(Math.floor(verifiedStep * current), totalVerified));
      setAnimatedBounty(Math.min(Math.floor(bountyStep * current), totalBountyPool));

      if (current >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [totalSubmissions, totalVerified, totalBountyPool]);

  const verificationRate = totalSubmissions > 0
    ? Math.round((totalVerified / totalSubmissions) * 100)
    : 0;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Platform <span className="text-green-400">Statistics</span>
              </h1>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Real-time aggregated statistics from the TruthChain network.
                Only aggregate counts are public—individual submissions remain encrypted.
              </p>
              {/* Refresh Button */}
              <div className="mt-4 flex items-center justify-center space-x-4">
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                {lastRefresh && (
                  <span className="text-xs text-zinc-500">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && companies.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-green-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-zinc-400">Loading blockchain data...</p>
                </div>
              </div>
            )}

            {/* Main Stats */}
            {(!loading || companies.length > 0) && (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card p-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-5xl font-bold text-green-400 mb-2">{animatedSubmissions}</div>
                    <div className="text-zinc-500">Total Submissions</div>
                    <div className="text-xs text-zinc-600 mt-1">On-chain count</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card p-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-5xl font-bold text-green-400 mb-2">{animatedVerified}</div>
                    <div className="text-zinc-500">Verified Leaks</div>
                    <div className="text-xs text-zinc-600 mt-1">On-chain count</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card p-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-5xl font-bold text-green-400 mb-2">
                      ${(animatedBounty / 1000).toFixed(0)}K
                    </div>
                    <div className="text-zinc-500">Bounty Pool</div>
                    <div className="text-xs text-yellow-500 mt-1">Placeholder</div>
                  </motion.div>
                </div>

                {/* Additional Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                  <div className="card p-6">
                    <div className="text-3xl font-bold text-white mb-1">{verificationRate}%</div>
                    <div className="text-sm text-zinc-500">Verification Rate</div>
                    <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${verificationRate}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-green-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="text-3xl font-bold text-white mb-1">24h</div>
                    <div className="text-sm text-zinc-500">Avg. Verification Time</div>
                    <div className="text-xs text-yellow-500 mt-1">Placeholder</div>
                    <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '40%' }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full bg-yellow-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="text-3xl font-bold text-white mb-1">--</div>
                    <div className="text-sm text-zinc-500">Active Journalists</div>
                    <div className="text-xs text-yellow-500 mt-1">Not enumerable</div>
                    <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-blue-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="text-3xl font-bold text-white mb-1">{companies.length}</div>
                    <div className="text-sm text-zinc-500">Companies Tracked</div>
                    <div className="text-xs text-zinc-600 mt-1">Local registry</div>
                    <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(companies.length * 10, 100)}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="h-full bg-red-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Companies Leaderboard */}
                <div className="card overflow-hidden">
                  <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold">Submissions by Company</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      Company names are hashed—only aggregate data is public
                    </p>
                  </div>

                  {companies.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-zinc-400 mb-2">No Submissions Yet</h3>
                      <p className="text-sm text-zinc-500 max-w-md mx-auto">
                        Statistics will appear here once whistleblowers start submitting leaks.
                        Company hashes are tracked locally as submissions are made.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-900/50">
                          <tr>
                            <th className="text-left p-4 text-sm font-medium text-zinc-400">#</th>
                            <th className="text-left p-4 text-sm font-medium text-zinc-400">Company Hash</th>
                            <th className="text-left p-4 text-sm font-medium text-zinc-400">Submissions</th>
                            <th className="text-left p-4 text-sm font-medium text-zinc-400">Verified</th>
                            <th className="text-left p-4 text-sm font-medium text-zinc-400">Verification Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {companies.map((company, index) => (
                            <motion.tr
                              key={company.hash}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="hover:bg-zinc-900/30"
                            >
                              <td className="p-4 font-bold text-zinc-500">{index + 1}</td>
                              <td className="p-4">
                                <div className="font-mono text-sm">{company.hash}</div>
                                <div className="text-xs text-zinc-600">{company.name}</div>
                              </td>
                              <td className="p-4">
                                <span className="text-xl font-bold text-white">{company.submissions}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-green-400">{company.verified}</span>
                                <span className="text-zinc-600 text-sm"> / {company.submissions}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-400 rounded-full"
                                      style={{ width: `${company.verificationRate}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-zinc-400">{company.verificationRate}%</span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Privacy Preserved</h3>
                      <p className="text-sm text-zinc-400">
                        All statistics shown are aggregated counts from on-chain public mappings.
                        Individual submission contents, whistleblower identities, and document details
                        remain encrypted and private. Company names shown are for illustration only—
                        actual company identities are stored as irreversible hashes.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Data Source Info */}
                <div className="mt-4 text-center text-xs text-zinc-600">
                  Data source: <code className="bg-zinc-800 px-1 rounded">whistleblower_v1.aleo</code> on Aleo testnet
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
