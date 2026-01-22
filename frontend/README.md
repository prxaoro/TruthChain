# TruthChain Frontend

Next.js frontend for the TruthChain anonymous whistleblower platform.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local` for production features:

```bash
# Supabase (optional - enables persistent cross-browser messaging)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without Supabase, the app uses in-memory storage (works for local demo).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/submit` | Whistleblower submission flow |
| `/journalist` | Journalist dashboard |
| `/about` | How TruthChain works |

## Tech Stack

- **Next.js 16** — React framework with App Router
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Animations
- **@demox-labs/aleo-wallet-adapter** — Leo Wallet integration
- **Zustand** — State management

## Key Files

- `src/hooks/useAleo.ts` — Wallet & transaction hooks
- `src/lib/aleo.ts` — Aleo SDK wrapper, hashing utilities
- `src/lib/encryption.ts` — AES-256-GCM message encryption
- `src/app/api/messages/route.ts` — Cross-browser message API
