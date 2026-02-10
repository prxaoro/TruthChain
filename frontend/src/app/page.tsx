'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const FEATURES = [
  {
    title: 'Zero-Knowledge Identity',
    desc: 'Your wallet address, name, department — none of it ever touches the blockchain. ZK proofs verify you without revealing you.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'UTXO Record Model',
    desc: 'Credentials are consumed and re-issued each use — like spending a coin. Only you can use your credential, enforced by Aleo encryption.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Aggregate-Only Public Data',
    desc: 'The blockchain only sees report counts and severity sums per org. No addresses, no content, no individual records.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'No Trusted Intermediary',
    desc: 'Unlike SecureDrop or email tip lines, nobody needs to be trusted with your identity. Privacy is enforced by math, not promises.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const GUARANTEES = [
  { label: 'Identity', status: 'PRIVATE', color: '#4ade80' },
  { label: 'Organization', status: 'HASHED', color: '#4ade80' },
  { label: 'Report Content', status: 'HASHED', color: '#4ade80' },
  { label: 'Report Count', status: 'AGGREGATE', color: '#facc15' },
  { label: 'Severity Sum', status: 'AGGREGATE', color: '#facc15' },
  { label: 'Wallet Address', status: 'NEVER ON-CHAIN', color: '#4ade80' },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-16 grid-bg">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/20 mb-8">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-semibold">Live on Aleo Testnet</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-white">EXPOSE </span>
                <span className="text-green-400 text-glow">TRUTH</span>
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-500 mb-8">
                PROTECT <span className="text-green-400">IDENTITY</span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12"
            >
              The first anonymous whistleblower platform powered by{' '}
              <span className="text-green-400">zero-knowledge proofs</span>.
              Prove you&apos;re an insider without revealing who you are.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Register as Insider
              </Link>
              <Link href="/report" className="btn-secondary text-lg px-8 py-4">
                Submit Report
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">100%</div>
                <div className="text-zinc-500 text-sm">Anonymous</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">ZK</div>
                <div className="text-zinc-500 text-sm">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">$0</div>
                <div className="text-zinc-500 text-sm">Risk to You</div>
              </div>
            </motion.div>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-16">
              How <span className="text-green-400">TruthChain</span> Works
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: '1',
                  title: 'Register as Insider',
                  desc: 'Create an anonymous credential proving you work at an organization. Your identity stays completely hidden using zero-knowledge proofs.',
                },
                {
                  num: '2',
                  title: 'Submit Anonymous Report',
                  desc: 'Use your credential to submit a report. Your credential is consumed and re-issued — proving insider status without revealing identity.',
                },
                {
                  num: '3',
                  title: 'Public Accountability',
                  desc: 'Only aggregate stats are public — report count and average severity per org. Individual reports and identities remain completely private.',
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-8 gradient-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-400/20 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-green-400">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-zinc-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Guarantee Table */}
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Privacy <span className="text-green-400">Guarantees</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Every piece of data in TruthChain has a clearly defined privacy level.
                Here&apos;s exactly what&apos;s visible and what&apos;s not.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="card p-6 overflow-hidden">
              <div className="space-y-2">
                {GUARANTEES.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/30"
                  >
                    <span className="text-zinc-300 text-sm font-medium">{item.label}</span>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        color: item.color,
                        backgroundColor: `${item.color}15`,
                        border: `1px solid ${item.color}30`,
                      }}
                    >
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why TruthChain — Feature Grid */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why <span className="text-green-400">TruthChain</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Built from the ground up for maximum privacy. Every design decision
                prioritizes protecting whistleblower identity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                    <p className="text-zinc-400 text-sm">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Deployed Contract */}
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp} className="card p-8 text-center glow-green">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Deployed &amp; Verified</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">
                Verify the Contract Yourself
              </h2>
              <p className="text-zinc-400 mb-2 text-sm max-w-xl mx-auto">
                TruthChain is deployed on Aleo Testnet as <span className="text-green-400 font-mono">truthchain_v2.aleo</span>.
                Inspect every transition — you&apos;ll see that no private data is ever exposed on-chain.
              </p>
              <p className="text-zinc-600 text-xs font-mono mb-6">
                Program: truthchain_v2.aleo | Network: Aleo Testnet
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://explorer.aleo.org/program/truthchain_v2.aleo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-6 py-3"
                >
                  View on Aleo Explorer
                </a>
                <Link href="/privacy" className="btn-secondary px-6 py-3">
                  Read Privacy Model
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                TruthChain vs <span className="text-zinc-500">Traditional Platforms</span>
              </h2>
            </motion.div>

            <motion.div {...fadeUp} className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-4 text-zinc-500 font-medium">Feature</th>
                    <th className="text-center p-4 text-green-400 font-bold">TruthChain</th>
                    <th className="text-center p-4 text-zinc-500 font-medium">SecureDrop</th>
                    <th className="text-center p-4 text-zinc-500 font-medium">Email Tips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    ['No Trusted Server', true, false, false],
                    ['Cryptographic Privacy', true, false, false],
                    ['On-Chain Proof', true, false, false],
                    ['Anonymous by Default', true, true, false],
                    ['Aggregate Accountability', true, false, false],
                    ['Decentralized', true, false, false],
                  ].map(([feature, tc, sd, em]) => (
                    <tr key={feature as string} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-4 text-zinc-300">{feature as string}</td>
                      <td className="p-4 text-center">
                        {tc ? <span className="text-green-400 text-lg">&#x2713;</span> : <span className="text-zinc-600">&#x2717;</span>}
                      </td>
                      <td className="p-4 text-center">
                        {sd ? <span className="text-green-400 text-lg">&#x2713;</span> : <span className="text-zinc-600">&#x2717;</span>}
                      </td>
                      <td className="p-4 text-center">
                        {em ? <span className="text-green-400 text-lg">&#x2713;</span> : <span className="text-zinc-600">&#x2717;</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Expose the <span className="text-green-400">Truth</span>?
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Your identity is protected by mathematics, not promises.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="btn-primary text-lg px-12 py-4">
                  Get Started
                </Link>
                <Link href="/dashboard" className="btn-secondary text-lg px-12 py-4">
                  View Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-zinc-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="font-bold">TruthChain</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-zinc-500 text-sm hover:text-green-400 transition-colors">
                  Privacy Model
                </Link>
                <a
                  href="https://explorer.aleo.org/program/truthchain_v2.aleo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 text-sm hover:text-green-400 transition-colors"
                >
                  Explorer
                </a>
                <span className="text-zinc-600 text-sm">
                  Built on <span className="text-green-400">Aleo</span> | WaveHack 2026
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
