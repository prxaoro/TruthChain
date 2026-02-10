import { create } from 'zustand';
import type { InsiderCredential, Report, TxStatus } from '@/types';

// Persist credential to localStorage so it survives page reloads
function loadCredential(): InsiderCredential | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('truthchain_credential');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveCredential(c: InsiderCredential | null) {
  if (typeof window === 'undefined') return;
  try {
    if (c) {
      localStorage.setItem('truthchain_credential', JSON.stringify(c));
    } else {
      localStorage.removeItem('truthchain_credential');
    }
  } catch { /* ignore */ }
}

interface AppState {
  credential: InsiderCredential | null;
  reports: Report[];
  txStatus: TxStatus;
  txId: string | null;
  error: string | null;
  setCredential: (c: InsiderCredential | null) => void;
  setReports: (r: Report[]) => void;
  setTxStatus: (s: TxStatus) => void;
  setTxId: (id: string | null) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  credential: loadCredential(),
  reports: [],
  txStatus: 'idle',
  txId: null,
  error: null,
  setCredential: (c) => { saveCredential(c); set({ credential: c }); },
  setReports: (r) => set({ reports: r }),
  setTxStatus: (s) => set({ txStatus: s, error: s === 'failed' ? 'Transaction failed' : null }),
  setTxId: (id) => set({ txId: id }),
  setError: (e) => set({ error: e }),
  reset: () => { saveCredential(null); set({ credential: null, reports: [], txStatus: 'idle', txId: null, error: null }); },
}));
