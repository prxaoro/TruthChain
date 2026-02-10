import { create } from 'zustand';
import type { InsiderCredential, Report, TxStatus } from '@/types';

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
  credential: null,
  reports: [],
  txStatus: 'idle',
  txId: null,
  error: null,
  setCredential: (c) => set({ credential: c }),
  setReports: (r) => set({ reports: r }),
  setTxStatus: (s) => set({ txStatus: s, error: s === 'failed' ? 'Transaction failed' : null }),
  setTxId: (id) => set({ txId: id }),
  setError: (e) => set({ error: e }),
  reset: () => set({ credential: null, reports: [], txStatus: 'idle', txId: null, error: null }),
}));
