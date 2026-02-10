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

const PRIVATE_DATA = [
  { label: 'Insider Identity', storage: 'Record (InsiderCredential)', icon: '🔒' },
  { label: 'Organization Name', storage: 'Hashed in Record', icon: '🔒' },
  { label: 'Department / Role', storage: 'Hashed in Record', icon: '🔒' },
  { label: 'Report Content', storage: 'Hashed in Record', icon: '🔒' },
  { label: 'Report Severity', storage: 'Record (Report)', icon: '🔒' },
  { label: 'Credential ID', storage: 'Record (InsiderCredential)', icon: '🔒' },
];

const PUBLIC_DATA = [
  { label: 'Total Reports per Org', storage: 'Mapping (report_count)', icon: '📊' },
  { label: 'Severity Sum per Org', storage: 'Mapping (severity_sum)', icon: '📊' },
  { label: 'Org Has Insiders', storage: 'Mapping (org_registered)', icon: '📊' },
];

const ZK_STEPS = [
  {
    step: '01',
    title: 'Register as Insider',
    description: 'You provide your organization name and role. These are hashed on the client side — the plaintext never leaves your browser. A private InsiderCredential record is created and stored in your wallet.',
    what_chain_sees: 'A boolean flag that some org has at least one insider. Nothing about who.',
  },
  {
    step: '02',
    title: 'Submit Anonymous Report',
    description: 'Your credential is consumed (proving you are a registered insider), a Report record is created privately, and a new credential is re-issued. This is the UTXO consume/re-issue pattern.',
    what_chain_sees: 'Report count +1 and severity added to the aggregate sum for the org hash. No addresses, no report content.',
  },
  {
    step: '03',
    title: 'Verify Credential',
    description: 'Your credential is consumed and re-issued, generating a ZK proof that you own a valid credential. No finalize step — nothing goes on-chain publicly.',
    what_chain_sees: 'Absolutely nothing. The verification is purely private.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-4 grid-bg">
        <div className="max-w-4xl mx-auto pb-20">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-4">
              Privacy <span className="text-green-400 text-glow">Model</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Zero-knowledge proofs ensure your identity is never revealed — not to the public,
              not to the organization, not even on-chain. Here&apos;s exactly how it works.
            </p>
          </motion.div>

          {/* Private vs Public Data */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">What&apos;s Private vs Public</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Private column */}
              <div className="card p-6 gradient-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <h3 className="text-green-400 font-bold uppercase text-sm tracking-wider">Private — Only You Can See</h3>
                </div>
                <div className="space-y-3">
                  {PRIVATE_DATA.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-green-400/5 border border-green-400/10">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">{item.storage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public column */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-zinc-500" />
                  <h3 className="text-zinc-400 font-bold uppercase text-sm tracking-wider">Public — Aggregate Only</h3>
                </div>
                <div className="space-y-3">
                  {PUBLIC_DATA.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">{item.storage}</span>
                    </div>
                  ))}
                </div>
                <p className="text-zinc-600 text-xs mt-4">
                  Only counters and sums — never individual records, addresses, or content.
                </p>
              </div>
            </div>
          </motion.div>

          {/* How ZK Works — Step by Step */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">How Zero-Knowledge Proofs Protect You</h2>
            <div className="space-y-6">
              {ZK_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-lg">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-zinc-400 text-sm mb-3">{step.description}</p>
                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">What the blockchain sees:</span>
                        <p className="text-sm text-zinc-300 mt-1">{step.what_chain_sees}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Architecture */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Architecture</h2>
            <div className="card p-8 font-mono text-sm">
              <pre className="text-zinc-400 overflow-x-auto">
{`INSIDER (You)                              PUBLIC (Anyone)
  │                                          │
  ▼                                          ▼
┌─────────────────────────────────────────────────┐
│              truthchain_v2.aleo                  │
│                                                  │
│  PRIVATE (Records):          PUBLIC (Mappings):  │
│  ├─ InsiderCredential        ├─ report_count     │
│  │  ├─ owner (you)           │  (org → count)    │
│  │  ├─ org_hash              ├─ severity_sum     │
│  │  ├─ role_hash             │  (org → sum)      │
│  │  └─ credential_id         └─ org_registered   │
│  └─ Report                      (org → bool)     │
│     ├─ owner (you)                               │
│     ├─ report_hash                               │
│     ├─ org_hash                                  │
│     ├─ severity                                  │
│     └─ report_id                                 │
└─────────────────────────────────────────────────┘

Transitions:
1. register_insider  → InsiderCredential (private record)
2. submit_report     → Report + re-issued InsiderCredential
3. verify_credential → re-issued InsiderCredential`}
              </pre>
            </div>
          </motion.div>

          {/* Trust Model */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Trust Model</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'No Trusted Intermediary', desc: 'Unlike SecureDrop or email tip lines, nobody needs to be trusted with your identity. The blockchain enforces privacy cryptographically.' },
                { title: 'Self-Issued Credentials', desc: 'You claim insider status via ZK proof. Nobody can see WHO registered or WHO reported — only that someone with a valid credential did.' },
                { title: 'UTXO Record Model', desc: 'Credentials are consumed and re-issued each use. Only the owner can spend their record — enforced by Aleo\'s native encryption.' },
                { title: 'Aggregate-Only Public Data', desc: 'Only report_count, severity_sum, and org_registered are public. No individual records, addresses, or content ever enter finalize scope.' },
              ].map((item) => (
                <div key={item.title} className="glass p-5">
                  <h3 className="text-green-400 font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-zinc-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Verify on Explorer */}
          <motion.div {...fadeUp} className="text-center">
            <div className="card p-8 glow-green">
              <h2 className="text-xl font-bold mb-3">Verify It Yourself</h2>
              <p className="text-zinc-400 mb-6 text-sm">
                Check the deployed contract on Aleo Explorer. You&apos;ll see that no private data is ever visible in any transaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://explorer.aleo.org/program/truthchain_v2.aleo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-6 py-3"
                >
                  View on Explorer
                </a>
                <Link href="/register" className="btn-secondary px-6 py-3">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
