# TruthChain 🔐

## Anonymous Whistleblower Platform on Aleo

> **Prove insider status. Submit evidence. Reveal nothing.**

TruthChain is a zero-knowledge whistleblower protection platform built on Aleo. Insiders can cryptographically prove they work at a company and submit evidence of wrongdoing—without ever revealing their identity.

**Built for the [Aleo Privacy Buildathon 2026](https://akindo.io/aleo-buildathon) - Wave 1**

---

## 🎯 The Problem

83% of whistleblowers face retaliation. Current solutions like SecureDrop require trust in intermediaries. But what if we could **mathematically prove** insider status without revealing identity?

**On Ethereum:** Every transaction is public. Whistleblower identity exposed.

**On Aleo:** Zero-knowledge proofs let us prove everything while revealing nothing.

---

## ✨ Key Features

### For Whistleblowers
- **Anonymous Insider Credentials** — ZK proof you work at a company, without revealing who you are
- **Encrypted Submissions** — AES-256-GCM encryption, only the recipient journalist can decrypt
- **Bounty Rewards** — Get rewarded for verified leaks without identity exposure
- **Zero Metadata** — No IP tracking, no logs, no traces

### For Journalists
- **Verified Sources** — Cryptographic proof the source is a real insider
- **Secure Receipt** — Encrypted submissions addressed only to your wallet
- **Reputation System** — Build trust through verified leak count
- **Cross-Browser Sync** — Messages automatically appear without manual lookup

---

## 🔐 Privacy Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      TruthChain Privacy Model                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WHISTLEBLOWER                    JOURNALIST                     │
│  ┌────────────┐                   ┌────────────┐                │
│  │ Leo Wallet │                   │ Leo Wallet │                │
│  └─────┬──────┘                   └─────┬──────┘                │
│        │                                │                        │
│        ▼                                ▼                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              whistleblower_v1.aleo (Testnet)            │    │
│  │                                                         │    │
│  │  PRIVATE RECORDS (Only owner can see):                  │    │
│  │  • InsiderCredential (company_hash, dept, seniority)   │    │
│  │  • SecureSubmission (doc_hash, insider_proof, severity)│    │
│  │  • JournalistCredential (publication, trust_score)     │    │
│  │  • BountyReward, VerificationToken                     │    │
│  │                                                         │    │
│  │  PUBLIC MAPPINGS (Aggregates only):                     │    │
│  │  • company_submission_count (how many, not what)       │    │
│  │  • journalist_scores (reputation)                       │    │
│  │  • bounty_pool (total available)                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  WHAT'S HIDDEN:              WHAT'S PUBLIC:                     │
│  ✗ Whistleblower identity    ✓ Submission count per company     │
│  ✗ Company name (hashed)     ✓ Journalist reputation            │
│  ✗ Document content          ✓ Verification status              │
│  ✗ Submission details        ✓ Bounty pool balance              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Implementation

### Smart Contract: `whistleblower_v1.aleo`

**5 Private Record Types:**
| Record | Owner | Purpose |
|--------|-------|---------|
| `InsiderCredential` | Whistleblower | Proves employment without revealing identity |
| `SecureSubmission` | Journalist | Encrypted leak with ZK insider proof |
| `JournalistCredential` | Journalist | Tracks reputation and verified leaks |
| `BountyReward` | Whistleblower | Claimable reward for verified info |
| `VerificationToken` | Whistleblower | Proof submission was verified |

**8 Transitions:**
```leo
register_insider()      → Creates anonymous InsiderCredential
submit_leak()           → Submits encrypted evidence to journalist
register_journalist()   → Creates JournalistCredential
verify_submission()     → Journalist verifies and scores submission
fund_bounty_pool()      → Anyone can fund rewards
create_bounty_reward()  → Creates reward for verified submission
claim_bounty()          → Whistleblower claims reward
prove_insider_status()  → ZK proof of insider status
```

### Frontend Stack
- **Next.js 16** — React framework with App Router
- **TypeScript** — Type-safe codebase
- **Tailwind CSS** — Dark cyberpunk aesthetic
- **Framer Motion** — Smooth animations
- **@demox-labs/aleo-wallet-adapter** — Leo Wallet integration
- **AES-256-GCM** — Client-side message encryption

### Cross-Browser Messaging
- Encrypted messages stored via API (Supabase for production)
- In-memory storage for local testing
- Auto-sync every 10 seconds on journalist dashboard
- End-to-end encrypted — server only sees ciphertext

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Leo Wallet](https://www.leo.app/) browser extension
- Aleo Testnet credits ([faucet](https://faucet.aleo.org/))

### Installation

```bash
# Clone repository
git clone https://github.com/prateekreddy/truthchain.git
cd truthchain

# Install frontend
cd frontend
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Demo Flow

1. **Browser A (Whistleblower)**
   - Connect Leo Wallet
   - Register as insider (enter company, department)
   - Fetch credential from blockchain
   - Submit leak to journalist address

2. **Browser B (Journalist)**
   - Connect different Leo Wallet
   - Submissions auto-appear every 10 seconds
   - Click "Review" to decrypt message
   - Verify and score submission

---

## 📁 Project Structure

```
truthchain/
├── contracts/
│   └── whistleblower_v1/
│       ├── src/main.leo          # Leo smart contract
│       ├── build/                # Compiled Aleo bytecode
│       └── program.json          # Deployment config
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── submit/           # Whistleblower flow
│   │   │   ├── journalist/       # Journalist dashboard
│   │   │   └── api/messages/     # Cross-browser message API
│   │   ├── components/           # UI components
│   │   ├── hooks/useAleo.ts      # Wallet & transaction hooks
│   │   └── lib/
│   │       ├── aleo.ts           # Aleo SDK wrapper
│   │       └── encryption.ts     # AES-256-GCM encryption
│   └── package.json
├── scripts/
│   └── deploy.sh                 # Testnet deployment script
└── README.md
```

---

## 📊 Judging Criteria Alignment

| Criteria | Weight | Our Implementation |
|----------|--------|-------------------|
| **Privacy Usage** | 40% | ZK proofs for identity, encrypted submissions, private records, public aggregates only |
| **Technical** | 20% | 5 record types, 8 transitions, proper async/finalize, BHP256 hashing |
| **UX/UI** | 20% | Dark secure aesthetic, step-by-step flow, auto-sync, loading states |
| **Practicality** | 10% | Real whistleblower protection need (Boeing, corporate fraud, govt leaks) |
| **Novelty** | 10% | First ZK whistleblower platform, novel credential + bounty system |

---

## 🔗 Deployed Contracts

**Program ID:** `whistleblower_v1.aleo`

**Network:** Aleo Testnet

**Example Transactions:**
- Registration: `at1...` (InsiderCredential created)
- Submission: `at1...` (SecureSubmission sent to journalist)

---

## 🏆 Why TruthChain?

1. **Whistleblower Systems are explicitly mentioned** in the Buildathon brief as a target use case
2. **Real-world impact** — 83% of whistleblowers face retaliation; we solve this with math
3. **Full ZK implementation** — Not just encryption, but cryptographic proofs of insider status
4. **Production-ready architecture** — Cross-browser sync, credential recovery, clean UX
5. **Only possible on Aleo** — Privacy-by-default blockchain required

---

## 👥 Team

**Builder:** Prateek
- Discord: `@prateek`
- Aleo Wallet: `aleo1...`

---

## 📜 License

MIT License

---

## 🙏 Acknowledgments

- [Aleo Network](https://aleo.org/) — Zero-knowledge L1 infrastructure
- [AKINDO](https://akindo.io/) — Buildathon organizers
- [Demox Labs](https://demoxlabs.xyz/) — Aleo wallet adapter

---

<div align="center">

**Built with 🔐 for the Aleo Privacy Buildathon 2026**

*Prove everything. Reveal nothing. Protect the truth.*

</div>
