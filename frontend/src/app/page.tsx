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
            {/* Glitch effect title */}
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

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/submit" className="btn-primary text-lg px-8 py-4">
                Submit Anonymous Leak
              </Link>
              <Link href="/journalist" className="btn-secondary text-lg px-8 py-4">
                I&apos;m a Journalist
              </Link>
            </motion.div>

            {/* Stats */}
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

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              How <span className="text-green-400">TruthChain</span> Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
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
                  Create an anonymous credential proving you work at a company.
                  Your identity stays completely hidden using zero-knowledge proofs.
                </p>
              </motion.div>

              {/* Step 2 */}
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
                <h3 className="text-xl font-bold mb-4">Submit Evidence</h3>
                <p className="text-zinc-400">
                  Upload encrypted documents and describe the wrongdoing.
                  Only your chosen journalist can decrypt and view the evidence.
                </p>
              </motion.div>

              {/* Step 3 */}
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
                <h3 className="text-xl font-bold mb-4">Get Verified & Rewarded</h3>
                <p className="text-zinc-400">
                  Journalists verify your leak. Once verified, claim your bounty
                  reward—all without ever revealing your identity.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Privacy Features */}
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Unbreakable <span className="text-green-400">Privacy</span>
            </h2>
            <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
              Built on Aleo&apos;s zero-knowledge blockchain—the most advanced privacy
              technology in existence.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Zero-Knowledge Proofs</h3>
                    <p className="text-zinc-400">
                      Prove you&apos;re a Boeing engineer without revealing which one.
                      Mathematical certainty, zero data exposure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">End-to-End Encryption</h3>
                    <p className="text-zinc-400">
                      Documents encrypted client-side. Only your chosen journalist
                      can decrypt. Not even we can see your evidence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">No IP Tracking</h3>
                    <p className="text-zinc-400">
                      All transactions happen on-chain with privacy by default.
                      No server logs, no IP addresses, no metadata trails.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Verifiable Without Revealing</h3>
                    <p className="text-zinc-400">
                      Journalists can verify your insider status and submission
                      authenticity without ever learning your identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Expose the <span className="text-green-400">Truth</span>?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Your identity is protected by mathematics, not promises.
            </p>
            <Link href="/submit" className="btn-primary text-lg px-12 py-4">
              Start Anonymous Submission
            </Link>
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
                Built on <span className="text-green-400">Aleo</span> | Privacy Buildathon 2026
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
