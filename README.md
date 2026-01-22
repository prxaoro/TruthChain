# TruthChain

**Zero-Knowledge Whistleblower Protection Platform**

Cryptographically prove insider status. Submit evidence anonymously. Protect your identity with mathematics.

---

## The Problem

Whistleblowers expose fraud, corruption, and safety violations that cost the public billions. Yet 83% face retaliation—job loss, legal threats, or worse. Current solutions like SecureDrop require trusting intermediaries with your identity.

TruthChain eliminates trust entirely. Using zero-knowledge proofs on Aleo, insiders can prove they work at a company and submit evidence without revealing who they are. Not to the platform. Not to anyone.

---

## How It Works

```
WHISTLEBLOWER                              JOURNALIST
     │                                          │
     ▼                                          ▼
┌─────────────┐                         ┌─────────────┐
│ Leo Wallet  │                         │ Leo Wallet  │
└──────┬──────┘                         └──────┬──────┘
       │                                       │
       │  1. Register (ZK proof of employment) │
       │  2. Submit encrypted evidence ────────┼───►
       │  3. Claim bounty reward ◄─────────────┤
       │                                       │
       ▼                                       ▼
┌──────────────────────────────────────────────────────┐
│              whistleblower_v1.aleo                   │
│                                                      │
│  PRIVATE:                    PUBLIC:                 │
│  • Whistleblower identity    • Submission counts     │
│  • Company name (hashed)     • Journalist reputation │
│  • Document contents         • Bounty pool balance   │
│  • Submission details        • Verification status   │
└──────────────────────────────────────────────────────┘
```

---

## Features

**Anonymous Credentials**
Zero-knowledge proof of employment. Prove you're an insider without revealing your name, department, or any identifying information.

**End-to-End Encryption**
AES-256-GCM encrypted submissions. Only the intended journalist can decrypt. The server only ever sees ciphertext.

**Bounty Rewards**
Get paid for verified information without exposing your identity. Rewards are claimed through ZK proofs.

**Verified Sources**
Journalists receive cryptographic proof that sources are real insiders—not random actors or competitors.

**Cross-Browser Sync**
Submit from one device, receive on another. Encrypted messages sync automatically via API.

---

## Technical Stack

**Smart Contract**
- Leo language on Aleo
- 5 private record types
- 8 state transitions
- BHP256 hashing for company identifiers

**Frontend**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion animations
- Leo Wallet integration

**Encryption**
- AES-256-GCM for message content
- Wallet-based key derivation
- Zero metadata exposure

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/prxaoro/TruthChain.git
cd TruthChain/frontend
npm install

# Run development server
npm run dev
```

**Requirements:**
- Node.js 18+
- [Leo Wallet](https://www.leo.app/) extension
- Aleo testnet credits from [faucet](https://faucet.aleo.org/)

---

## Project Structure

```
TruthChain/
├── contracts/
│   └── whistleblower_v1/
│       ├── src/main.leo       # Smart contract
│       └── build/             # Compiled bytecode
├── frontend/
│   ├── src/app/
│   │   ├── submit/            # Whistleblower interface
│   │   ├── journalist/        # Journalist dashboard
│   │   └── api/               # Message sync API
│   └── src/lib/
│       ├── aleo.ts            # Blockchain interactions
│       └── encryption.ts      # AES-256-GCM
└── scripts/
    └── deploy.sh              # Deployment automation
```

---

## Smart Contract

**Program:** `whistleblower_v1.aleo`
**Network:** Aleo Testnet

| Record | Purpose |
|--------|---------|
| `InsiderCredential` | Anonymous proof of employment |
| `SecureSubmission` | Encrypted leak with insider proof |
| `JournalistCredential` | Reputation and verification count |
| `BountyReward` | Claimable reward for verified leaks |
| `VerificationToken` | Proof of submission verification |

---

## Why Aleo?

This application is only possible on a privacy-by-default blockchain. On Ethereum, every transaction is public—whistleblower identities would be exposed through wallet analysis. Aleo's zero-knowledge architecture keeps all sensitive data private while still allowing cryptographic verification.

---

## License

MIT
