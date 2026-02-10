# TruthChain — Anonymous Whistleblowing on Aleo

## Problem

Whistleblowers expose fraud, corruption, and safety violations — yet 83% face retaliation. Existing systems (email tips, web forms, SecureDrop) require trusting intermediaries with your identity. TruthChain eliminates trust entirely.

## Why Privacy Matters

Zero-knowledge proofs let insiders prove organizational membership and submit reports without EVER revealing who they are — not to the public, not to the organization, not even on-chain. The blockchain only sees encrypted commitments and aggregate counters.

## What's Built (Wave 2)

- Private InsiderCredential records (not public tx hashes like Wave 1)
- Anonymous report submission with credential proof (consume + re-issue UTXO pattern)
- Aggregate-only public dashboard (report count, average severity per org)
- Shield/Leo Wallet integration with real on-chain transactions
- Live demo on Vercel
- Complete privacy model — no private data in finalize scope

## Privacy Model

| Data | Storage | Visibility |
|------|---------|------------|
| Insider identity | Record (InsiderCredential) | **Private** — only the insider |
| Organization & department | Record (InsiderCredential) — hashed | **Private** — only the insider |
| Report content | Record (Report) — hashed | **Private** — only the reporter |
| Report severity | Record (Report) | **Private** — only the reporter |
| Total reports per org | Mapping (report_count) | Public — aggregate only |
| Average severity per org | Mapping (severity_sum / report_count) | Public — aggregate only |
| Whether an org has insiders | Mapping (org_registered) | Public — boolean only |

### Trust Model

- Credentials are self-issued (user claims insider status via ZK proof)
- Reports are tied to credentials (proves they registered before reporting)
- Nobody can see WHO registered or WHO reported
- Only aggregate statistics are public
- Credential ownership enforced by Aleo's record model (only owner can spend)

## Wave 1 → Wave 2 Progress

| Aspect | Wave 1 (16/50) | Wave 2 |
|--------|----------------|--------|
| Privacy | Broken — public tx hashes as credentials (0/10) | Fixed — private records, no finalize leaks |
| Technical | Basic transitions (3/10) | Working program with consume/re-issue pattern |
| UX | Good dark theme UI (6/10) | Preserved + improved with 5 focused pages |
| Practicality | Strong concept (5/10) | Added privacy model documentation |
| Novelty | Weak (2/10) | Genuine ZK privacy for whistleblowing |

**Judge feedback from Wave 1:**
> "Privacy model fundamentally broken. Anyone can see when register_insider is called onchain... anyone can copy the TX hash and use anyone else's credential."

**How we fixed it:** Complete contract rewrite. All credentials and reports are now private records. Only aggregate counters (report_count, severity_sum) enter finalize scope. No addresses, no report content, no credential details are ever public.

## Architecture

```
INSIDER                                    PUBLIC
  │                                          │
  ▼                                          ▼
┌───────────────────────────────────────────────────────┐
│                truthchain_v2.aleo                      │
│                                                        │
│  PRIVATE (Records):           PUBLIC (Mappings):       │
│  ├─ InsiderCredential         ├─ report_count          │
│  │  ├─ owner                  │  (org_hash → count)    │
│  │  ├─ org_hash               ├─ severity_sum          │
│  │  ├─ role_hash              │  (org_hash → sum)      │
│  │  └─ credential_id          └─ org_registered        │
│  └─ Report                       (org_hash → bool)     │
│     ├─ owner                                           │
│     ├─ report_hash                                     │
│     ├─ org_hash                                        │
│     ├─ severity                                        │
│     └─ report_id                                       │
└───────────────────────────────────────────────────────┘

Transitions:
1. register_insider → InsiderCredential (private record)
2. submit_report → Report + re-issued InsiderCredential
3. verify_credential → re-issued InsiderCredential
```

## How to Test

1. Visit the live demo URL
2. Install [Shield/Leo Wallet](https://www.leo.app/) browser extension
3. Get testnet ALEO from faucet: https://faucet.aleo.org/
4. **Register:** Go to `/register` → enter organization name → confirm transaction
5. **Report:** Go to `/report` → enter report details and severity → confirm transaction
6. **Dashboard:** Go to `/dashboard` → search for an organization → see aggregate stats
7. **Verify:** Go to `/verify` → verify your credential → ZK proof generated

Check the Aleo Explorer to confirm no private data is visible in transactions.

## Tech Stack

- **Smart Contract:** Leo language on Aleo Testnet (`truthchain_v2.aleo`)
- **Frontend:** Next.js, TypeScript, Tailwind CSS, Framer Motion
- **Wallet:** Shield Wallet (`@demox-labs/aleo-wallet-adapter`)
- **State:** Zustand
- **Deployment:** Vercel (frontend), Aleo Testnet (contract)

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev

# Smart contract
cd contracts/truthchain_v2
leo build
leo deploy --network testnet
```

**Requirements:**
- Node.js 18+
- [Shield/Leo Wallet](https://www.leo.app/) extension
- Aleo testnet credits from [faucet](https://faucet.aleo.org/)
- Leo CLI 3.4.0 (for contract deployment)

## Project Structure

```
TruthChain/
├── contracts/
│   └── truthchain_v2/
│       ├── src/main.leo          # Leo smart contract
│       └── program.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── register/         # Register as insider
│   │   │   ├── report/           # Submit anonymous report
│   │   │   ├── dashboard/        # Public aggregate stats
│   │   │   └── verify/           # Verify credential
│   │   ├── components/           # Wallet provider, header
│   │   ├── hooks/useAleo.ts      # Contract interaction hook
│   │   └── lib/                  # Helpers, network client
│   └── package.json
└── README.md
```

## Links

- Program: https://explorer.aleo.org/program/truthchain_v2.aleo

## License

MIT
