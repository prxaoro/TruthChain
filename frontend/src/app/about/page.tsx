'use client';

import Header from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How <span className="text-green-400">TruthChain</span> Works
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                The technology behind anonymous whistleblowing, explained simply.
              </p>
            </div>

            {/* Zero-Knowledge Proofs */}
            <section className="mb-16">
              <div className="card p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-xl bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Zero-Knowledge Proofs</h2>
                    <p className="text-zinc-400 mb-4">
                      Zero-knowledge proofs (ZKPs) allow you to prove something is true without revealing
                      any information about it. In TruthChain:
                    </p>
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold text-sm">1</div>
                          <p className="text-zinc-300">You prove you work at Boeing</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold text-sm">2</div>
                          <p className="text-zinc-300">Without revealing which employee you are</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold text-sm">3</div>
                          <p className="text-zinc-300">Mathematically verified, not just promised</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Built on Aleo—the first blockchain with native zero-knowledge primitives.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* The Flow */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">The Whistleblower Flow</h2>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="card p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-400 flex items-center justify-center text-black font-bold text-xl">1</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Register Anonymous Credential</h3>
                      <p className="text-zinc-400">
                        Create a cryptographic credential that proves you work at a specific company
                        (using hashes). Your identity is never stored—only the ZK proof of employment.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-400 flex items-center justify-center text-black font-bold text-xl">2</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Encrypt & Submit Evidence</h3>
                      <p className="text-zinc-400">
                        Documents are encrypted client-side using AES-256-GCM before ever leaving
                        your device. Only your chosen journalist can decrypt them. Not even TruthChain
                        servers can see the content.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="card p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-400 flex items-center justify-center text-black font-bold text-xl">3</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Journalist Verification</h3>
                      <p className="text-zinc-400">
                        The journalist receives your encrypted submission, decrypts it locally,
                        and verifies the information through their own channels. They then sign
                        a verification transaction on-chain.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="card p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-400 flex items-center justify-center text-black font-bold text-xl">4</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Claim Bounty Reward</h3>
                      <p className="text-zinc-400">
                        Once verified, you can claim your bounty reward—still completely anonymously.
                        The reward goes to your Aleo wallet without linking to your real identity.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Technical Architecture */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Technical Architecture</h2>

              <div className="card p-8">
                <div className="font-mono text-sm overflow-x-auto">
                  <pre className="text-zinc-400">
{`┌─────────────────────────────────────────────────────────────┐
│                     TruthChain Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Whistleblower│    │   Journalist │    │   Verifier   │  │
│  │    (Web UI)  │    │   (Web UI)   │    │   (Web UI)   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js Frontend (React)               │   │
│  │  • Wallet Integration (Leo Wallet Adapter)          │   │
│  │  • ZK Proof Generation (Web Worker)                 │   │
│  │  • Client-side Encryption (AES-256-GCM)             │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Aleo Network (Testnet/Mainnet)            │   │
│  │                                                     │   │
│  │  Records (Private):     Mappings (Public):          │   │
│  │  • InsiderCredential    • company_submission_count  │   │
│  │  • SecureSubmission     • verified_leak_count       │   │
│  │  • JournalistCredential • bounty_pool               │   │
│  │  • BountyReward         • journalist_scores         │   │
│  │  • VerificationToken                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Privacy Guarantees */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Privacy Guarantees</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center space-x-2">
                    <span className="text-green-400">HIDDEN</span>
                  </h3>
                  <ul className="space-y-3 text-zinc-400">
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Whistleblower identity</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Company name (only hash stored)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Document content (encrypted)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>IP address & metadata</span>
                    </li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center space-x-2">
                    <span className="text-zinc-400">PUBLIC (Aggregates Only)</span>
                  </h3>
                  <ul className="space-y-3 text-zinc-400">
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Total submission count per company</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Verified leak count</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Bounty pool total</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Journalist reputation scores</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center">
              <div className="card p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to <span className="text-green-400">Expose the Truth</span>?
                </h2>
                <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                  Your identity is protected by mathematics, not promises.
                  Join the anonymous whistleblower revolution.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/submit" className="btn-primary text-lg px-8 py-4">
                    Submit Anonymous Leak
                  </Link>
                  <Link href="/journalist" className="btn-secondary text-lg px-8 py-4">
                    Register as Journalist
                  </Link>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
    </>
  );
}
