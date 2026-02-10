'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              How <span className="text-green-400">TruthChain</span> Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-lg bg-green-400/20 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-green-400">1</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Register as Insider</h3>
                <p className="text-zinc-400">
                  Create an anonymous credential proving you work at an organization.
                  Your identity stays completely hidden using zero-knowledge proofs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-lg bg-green-400/20 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Submit Anonymous Report</h3>
                <p className="text-zinc-400">
                  Use your credential to submit a report. Your credential is consumed
                  and re-issued — proving insider status without revealing identity.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-lg bg-green-400/20 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-green-400">3</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Public Accountability</h3>
                <p className="text-zinc-400">
                  Only aggregate stats are public — report count and average severity per org.
                  Individual reports and identities remain completely private.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Privacy Model */}
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Privacy <span className="text-green-400">Model</span>
            </h2>
            <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
              Built on Aleo&apos;s zero-knowledge blockchain — the most advanced privacy
              technology in existence.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <h3 className="text-lg font-bold mb-4 text-green-400">PRIVATE (Records — only you see)</h3>
                <ul className="space-y-3 text-zinc-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">&#x2713;</span>
                    <span>Insider identity (who registered)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">&#x2713;</span>
                    <span>Organization & department details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">&#x2713;</span>
                    <span>Report content and severity</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">&#x2713;</span>
                    <span>Who reported what</span>
                  </li>
                </ul>
              </div>

              <div className="card p-8">
                <h3 className="text-lg font-bold mb-4 text-zinc-400">PUBLIC (Mappings — everyone sees)</h3>
                <ul className="space-y-3 text-zinc-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-zinc-500 mt-1">&#x25CF;</span>
                    <span>Total number of reports per org (aggregate)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-zinc-500 mt-1">&#x25CF;</span>
                    <span>Average severity per org (aggregate)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-zinc-500 mt-1">&#x25CF;</span>
                    <span>Whether an org has registered insiders</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
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
              <div className="text-zinc-500 text-sm">
                Built on <span className="text-green-400">Aleo</span> | WaveHack 2026
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
