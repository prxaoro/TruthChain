# CLAUDE.md — TruthChain (Aleo WaveHack Wave 2)

## MANDATORY RULES — READ BEFORE DOING ANYTHING

**BEFORE writing ANY code, you MUST:**
1. Read and understand ALL sections of this file completely
2. Review the RESOURCE LINKS section and understand Aleo/Leo patterns
3. Verify every code change against the JUDGE REQUIREMENTS below
4. Check every Leo function against the CRITICAL PRIVACY RULES
5. For EVERY task, think: "Is there a tool, agent, MCP server, hook, or plugin I can use for this?" — and use it automatically without asking the user
6. Use subagents for research (Leo docs, Aleo patterns, wallet adapter API) BEFORE writing code
7. Use code-review agents after writing code to catch issues
8. Use parallel tool calls whenever tasks are independent

**NEVER do any of the following (instant disqualification / score killer):**
- Store private data (addresses, report content, credential details) in mappings or finalize scope
- Pass private values into finalize/async functions — everything in finalize is PUBLIC
- Send records to program addresses (records become permanently lost)
- Create or modify records in finalize scope (impossible in Leo, won't compile)
- Submit another user's record (only the owner can spend a record)
- Use fake payment records instead of real credits.aleo transfers
- Implement manual nullifiers or ZK proof verification (Aleo handles this automatically)
- Use ProgramManager.run() with raw Leo code (doesn't work)
- Remove or weaken the consume + re-issue credential pattern
- Make the project downloadable-only (must be a live web URL)
- Use Solidity/EVM contracts (must be Leo/Aleo)

**MUST HAVE for submission (judges check these FIRST):**
- Live web URL on Vercel that loads and works
- README.md with: project description, privacy model, how to test, architecture, Wave 1→2 progress
- At least 1 Leo program deployed on Aleo Testnet
- At least 1 real on-chain transaction visible on explorer
- Frontend buttons connected to real on-chain transitions (not mocked)
- Wallet connection working (Shield/Leo Wallet)
- Video demo showing end-to-end flow

---

## PROJECT OVERVIEW

TruthChain is an **anonymous whistleblowing platform** on Aleo blockchain. Insiders prove they belong to an organization and submit anonymous reports — without ever revealing their identity on-chain.

**Buildathon:** Aleo WaveHack on Akindo (https://app.akindo.io)
**Wave 2 Deadline:** Feb 25, 2026
**Prize Pool:** $5,000 USDT split among qualifying submissions
**Wave 1 Score:** 16/50 (P:0, T:3, UX:6, Prac:5, Nov:2)

## WAVE 1 JUDGE FEEDBACK (MUST FIX)

> "Privacy model fundamentally broken. Anyone can see when register_insider is called onchain... anyone can copy the TX hash and use anyone else's credential."

**Root cause:** Credentials were verified via public transaction hashes instead of private records. Anyone watching the chain could see who registered and copy their credential.

## WHAT TO KEEP FROM WAVE 1

- Frontend UI/UX (scored 6/10 — looks good)
- Whistleblowing concept (scored 5/10 practicality)
- Basic project structure

## WHAT TO COMPLETELY REWRITE

- **ALL Leo smart contract code** — privacy model is broken at the foundation
- **Frontend-to-contract integration** — must connect to new program
- **README** — must explain new privacy model

---

## TECH STACK

- **Smart Contracts:** Leo language on Aleo Testnet
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Wallet:** Shield/Leo Wallet via `@demox-labs/aleo-wallet-adapter`
- **Deployment:** Vercel (frontend), Aleo Testnet (contracts)

## SCORING CRITERIA (What judges grade on)

| Criteria | Weight | What judges check |
|----------|--------|-------------------|
| Privacy Usage | 40% | Records for private data, no finalize leaks, real privacy model |
| Technical Implementation | 20% | Working programs, real testnet transactions, correct patterns |
| User Experience | 20% | Clean UI, wallet works, clear flow, no crashes |
| Practicality | 10% | Real-world use case, trust model explained |
| Novelty | 10% | Unique approach in Aleo ecosystem |

---

## LEO PROGRAM SPECIFICATION

**Program name:** `truthchain_v2.aleo`

### Records (PRIVATE — only owner can see)

```leo
record InsiderCredential {
    owner: address,           // the insider (private)
    org_hash: field,          // hash of organization name (private)
    role_hash: field,         // hash of role/department (private)
    credential_id: field,     // unique identifier (private)
}

record Report {
    owner: address,           // reporter (private)
    report_hash: field,       // hash of report content stored off-chain (private)
    org_hash: field,          // which org this is about (private)
    severity: u8,             // 1-5 severity rating (private)
    report_id: field,         // unique identifier (private)
}
```

### Mappings (PUBLIC — only aggregate data)

```leo
mapping report_count: field => u64;      // org_hash => total number of reports
mapping severity_sum: field => u64;      // org_hash => sum of all severity ratings
mapping org_registered: field => bool;   // org_hash => has any insider registered for this org
```

### Transitions

```leo
// 1. Insider registers — gets private credential
transition register_insider(
    org_hash: field,
    role_hash: field,
    credential_id: field,
) -> InsiderCredential

// 2. Submit report — consumes credential, creates report, re-issues credential
async transition submit_report(
    credential: InsiderCredential,
    report_hash: field,
    severity: u8,
    report_id: field,
) -> (Report, InsiderCredential, Future)

// 3. Verify credential — proves insider status without revealing identity
transition verify_credential(
    credential: InsiderCredential,
) -> InsiderCredential
```

### CRITICAL PRIVACY RULES

1. **Records = PRIVATE.** All sensitive data (who registered, who reported, report content) goes in records.
2. **Mappings = PUBLIC.** Only aggregate counters (total reports, average severity) go in mappings.
3. **finalize scope = PUBLIC.** NEVER pass private data (addresses, credential details, report content) into finalize. Only pass aggregate values.
4. **Record ownership:** Only the owner can spend/consume a record. Never design flows where User A submits User B's record.
5. **Consume + re-issue pattern:** To verify a credential, consume the old record and create a new identical one. This is the standard Aleo UTXO pattern.
6. **No records to program addresses:** Records sent to a program address are permanently lost (programs can't spend records).
7. **No manual ZK:** Don't implement nullifiers, proof verification, or encryption manually — Aleo handles all of this automatically.
8. **No record creation in finalize:** Records can only be created/consumed in transitions, never in async functions.

---

## FRONTEND SPECIFICATION

### Pages

```
/                    → Landing page (explain what TruthChain does + why privacy matters)
/register            → Register as insider (connect wallet, enter org, get credential)
/report              → Submit anonymous report (requires credential, enter report details)
/dashboard           → Public dashboard (aggregate stats per org — report count, avg severity)
/verify              → Verify your credential (proves you're a registered insider)
```

### Wallet Integration

```bash
npm install @demox-labs/aleo-wallet-adapter-base \
            @demox-labs/aleo-wallet-adapter-react \
            @demox-labs/aleo-wallet-adapter-reactui \
            @demox-labs/aleo-wallet-adapter-leo
```

```typescript
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";

const wallets = [new LeoWalletAdapter({ appName: "TruthChain" })];

<WalletProvider
  wallets={wallets}
  decryptPermission={DecryptPermission.UponRequest}
  network={WalletAdapterNetwork.TestnetBeta}
  autoConnect
>
  <WalletModalProvider>
    {children}
  </WalletModalProvider>
</WalletProvider>
```

### Every button must trigger real on-chain transactions

- "Register" button → calls `register_insider()` transition → creates InsiderCredential record
- "Submit Report" button → calls `submit_report()` transition → consumes credential, creates Report, re-issues credential
- "Verify" button → calls `verify_credential()` transition → consumes + re-issues credential

### Transaction status flow

Show these states in UI: `Idle → Signing → Proving → Broadcasting → Confirmed ✓`

### UI Requirements

- Dark theme, professional look
- Clean typography, no generic AI aesthetics
- Error handling: wallet not connected, transaction failed, insufficient fees
- Loading indicators during proof generation (can take 30-60 seconds)
- Mobile responsive

---

## ALEO / LEO LANGUAGE REFERENCE

### Program structure
```leo
import credits.aleo;  // optional — only if using real token transfers

program truthchain_v2.aleo {
    record MyRecord {
        owner: address,    // required, always first field
        data: field,       // default visibility is private
    }

    mapping my_counter: field => u64;  // public on-chain storage

    // Transition = external entry point (off-chain, private)
    async transition my_function(input: MyRecord) -> (MyRecord, Future) {
        let output: MyRecord = MyRecord {
            owner: self.caller,
            data: input.data,
        };
        return (output, finalize_my_function(input.data));
    }

    // Async function = on-chain execution (PUBLIC — everything here is visible!)
    async function finalize_my_function(data: field) {
        let count: u64 = Mapping::get_or_use(my_counter, data, 0u64);
        Mapping::set(my_counter, data, count + 1u64);
    }
}
```

### Key Leo syntax
```leo
// Types: address, bool, field, group, i8-i128, u8-u128, scalar, string
// Assertions
assert(severity >= 1u8);
assert(severity <= 5u8);
assert_eq(credential.owner, self.caller);

// self.caller = who called this transition
// self.signer = original transaction signer

// Hashing (use for org names, report content, etc.)
let hash: field = BHP256::hash_to_field(data);
let hash2: field = Poseidon2::hash_to_field(data);

// Random values (only in transitions, not finalize)
let random_id: field = ChaCha::rand_field();
```

### Common mistakes to avoid
```leo
// ❌ WRONG: Private data in finalize (becomes PUBLIC)
async function finalize_report(reporter: address, content: field) {
    Mapping::set(reports, reporter, content);  // LEAKED!
}

// ✅ CORRECT: Only aggregate data in finalize
async function finalize_report(org_hash: field) {
    let count: u64 = Mapping::get_or_use(report_count, org_hash, 0u64);
    Mapping::set(report_count, org_hash, count + 1u64);
}

// ❌ WRONG: Sending record to program address
let record: MyRecord = MyRecord { owner: truthchain_v2.aleo, ... };  // LOST FOREVER

// ✅ CORRECT: Records always owned by user addresses
let record: MyRecord = MyRecord { owner: self.caller, ... };

// ❌ WRONG: Creating records in finalize
async function finalize_fn() {
    let r: MyRecord = MyRecord { ... };  // IMPOSSIBLE — won't compile
}

// ✅ CORRECT: Create records in transitions only
transition my_fn() -> MyRecord {
    return MyRecord { owner: self.caller, data: 0field };
}
```

---

## BUILD & DEPLOY COMMANDS

### Leo (smart contracts)
```bash
# Install Leo
curl -sSf https://install.aleo.org | bash

# Create new Leo project
leo new truthchain_v2
cd truthchain_v2

# Write program in src/main.leo

# Build (compile + check for errors)
leo build

# Run locally (test)
leo run register_insider <org_hash>field <role_hash>field <credential_id>field

# Deploy to testnet
leo deploy --network testnet

# Execute on testnet
leo execute register_insider <args> --network testnet
```

### Frontend
```bash
# Create Next.js project
npx create-next-app@14 truthchain-frontend --typescript --tailwind --app --src-dir

# Install Aleo wallet adapter
npm install @demox-labs/aleo-wallet-adapter-base \
            @demox-labs/aleo-wallet-adapter-react \
            @demox-labs/aleo-wallet-adapter-reactui \
            @demox-labs/aleo-wallet-adapter-leo

# Dev server
npm run dev

# Deploy to Vercel
npx vercel --prod
```

---

## README TEMPLATE (Must include all of this)

```markdown
# TruthChain — Anonymous Whistleblowing on Aleo

## Problem
Whistleblowers risk retaliation. Existing systems (email, forms) expose reporter identity.

## Why Privacy Matters
Zero-knowledge proofs let insiders prove organizational membership and submit reports
without EVER revealing who they are — not to the public, not to the org, not even on-chain.

## What's Built (Wave 2)
- ✅ Private InsiderCredential records (not public tx hashes)
- ✅ Anonymous report submission with credential proof
- ✅ Aggregate-only public dashboard (report count, avg severity)
- ✅ Shield Wallet integration
- ✅ Live demo on Vercel

## Privacy Model
| Data | Storage | Visibility |
|------|---------|------------|
| Insider identity | Record (InsiderCredential) | Private — only insider |
| Report content | Record (Report) + off-chain | Private — only reporter |
| Report severity | Record (Report) | Private — only reporter |
| Total reports per org | Mapping (report_count) | Public — aggregate only |
| Avg severity per org | Mapping (severity_sum) | Public — aggregate only |

## Wave 1 → Wave 2 Progress
- Wave 1: Privacy model used public tx hashes (broken). No live demo. Score: 16/50.
- Wave 2: Complete rewrite using private records. Live Vercel demo. Shield Wallet.
- Wave 3 goals: Add credential issuance by org admins, multi-signature verification.

## How to Test
1. Visit [VERCEL_URL]
2. Install Shield/Leo Wallet extension
3. Get testnet ALEO from faucet: https://faucet.aleo.org/
4. Click "Register as Insider" → enter org name → confirm tx
5. Click "Submit Report" → enter report details → confirm tx
6. View "Dashboard" → see aggregate stats (your identity is NOT shown)

## Links
- 🌐 Live Demo: [VERCEL_URL]
- 💻 GitHub: [REPO_URL]
- 📺 Demo Video: [VIDEO_URL]
- 🔗 Program: https://explorer.aleo.org/program/truthchain_v2.aleo
- 🔗 Sample Tx: [TX_URL]

## Tech Stack
- Smart Contract: Leo (Aleo Testnet)
- Frontend: Next.js 14, TypeScript, Tailwind
- Wallet: Shield Wallet (@demox-labs/aleo-wallet-adapter)

## Team
- [Name] — [Discord handle]
- Wallet: aleo1...
```

---

## RESOURCE LINKS

| Resource | URL |
|----------|-----|
| Leo Language Docs | https://docs.leo-lang.org/leo |
| Leo Program Structure | https://docs.leo-lang.org/language/structure |
| Aleo Developer Docs | https://developer.aleo.org/ |
| Aleo Records | https://developer.aleo.org/concepts/fundamentals/records/ |
| Aleo Credits | https://developer.aleo.org/concepts/fundamentals/credits/ |
| Transfer Credits SDK | https://developer.aleo.org/sdk/guides/transfer_credits/ |
| Wallet Adapter GitHub | https://github.com/demox-labs/aleo-wallet-adapter |
| Provable Wallet Adapter | https://github.com/ProvableHQ/aleo-wallet-adapter |
| Aleo Testnet Faucet | https://faucet.aleo.org/ |
| Aleo Explorer | https://explorer.aleo.org/ |
| Aleoscan | https://aleoscan.io/ |
| Shield/Leo Wallet | https://www.leo.app/ |
| Awesome Aleo (examples) | https://github.com/howardwu/awesome-aleo |
| Leo Security Patterns | https://blog.zksecurity.xyz/posts/aleo-program-security/ |
| Solidity→Leo Migration | https://developer.aleo.org/guides/solidity-to-leo/migration-guide/ |

---

## PROJECT STRUCTURE

```
truthchain/
├── CLAUDE.md                  ← this file
├── contracts/
│   └── truthchain_v2/
│       ├── src/
│       │   └── main.leo       ← Leo smart contract
│       ├── program.json
│       └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     ← wallet provider wrapper
│   │   │   ├── page.tsx       ← landing page
│   │   │   ├── register/
│   │   │   │   └── page.tsx   ← register insider
│   │   │   ├── report/
│   │   │   │   └── page.tsx   ← submit report
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   ← public aggregate stats
│   │   │   └── verify/
│   │   │       └── page.tsx   ← verify credential
│   │   ├── components/
│   │   │   ├── WalletProvider.tsx
│   │   │   ├── ClientWrapper.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/
│   │   │   └── useAleo.ts     ← contract interaction hook
│   │   ├── lib/
│   │   │   ├── aleo.ts        ← hashing, constants
│   │   │   └── aleoService.ts ← mapping queries
│   │   ├── store/
│   │   │   └── useStore.ts    ← Zustand state
│   │   └── types/
│   │       └── index.ts       ← TypeScript types
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
└── README.md                  ← submission README
```

## TASK ORDER

1. Write Leo program in `contracts/truthchain_v2/src/main.leo`
2. Run `leo build` — fix ALL errors
3. Deploy to Aleo Testnet
4. Execute each transition at least once — verify on explorer
5. Build Next.js frontend with all 5 pages
6. Connect wallet + wire every button to real transitions
7. Add dark theme + loading states + error handling
8. Deploy frontend to Vercel
9. Write README with privacy model + test instructions
10. Record demo video
11. Submit on Akindo

## TESTING CHECKLIST

- [ ] `leo build` passes with zero errors
- [ ] `register_insider` creates InsiderCredential record (check: record only visible to caller)
- [ ] `submit_report` requires a credential record (check: fails without one)
- [ ] `submit_report` creates Report record + re-issues credential (check: both returned)
- [ ] Dashboard shows ONLY aggregate data (check: no addresses or report content visible)
- [ ] Explorer shows transaction but NO private data in finalize (check: only org_hash + counters)
- [ ] Frontend loads on Vercel URL
- [ ] Wallet connects and shows address
- [ ] Register button triggers real transaction
- [ ] Report button triggers real transaction
- [ ] Dashboard fetches from on-chain mappings
- [ ] Fresh browser test: can a stranger use this without help?
