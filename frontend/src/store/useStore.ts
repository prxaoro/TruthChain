'use client';

import { create } from 'zustand';
import type { InsiderCredential, JournalistCredential, SecureSubmission, UserRole } from '@/types';

interface TruthChainStore {
  // Connection state
  connected: boolean;
  address: string | null;

  // User state
  role: UserRole;
  insiderCredential: InsiderCredential | null;
  journalistCredential: JournalistCredential | null;

  // Submissions
  submissions: SecureSubmission[];

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  setConnected: (connected: boolean, address: string | null) => void;
  setRole: (role: UserRole) => void;
  setInsiderCredential: (credential: InsiderCredential | null) => void;
  setJournalistCredential: (credential: JournalistCredential | null) => void;
  addSubmission: (submission: SecureSubmission) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useStore = create<TruthChainStore>((set) => ({
  // Initial state
  connected: false,
  address: null,
  role: null,
  insiderCredential: null,
  journalistCredential: null,
  submissions: [],
  loading: false,
  error: null,

  // Actions
  setConnected: (connected, address) => set({ connected, address }),
  setRole: (role) => set({ role }),
  setInsiderCredential: (credential) => set({ insiderCredential: credential }),
  setJournalistCredential: (credential) => set({ journalistCredential: credential }),
  addSubmission: (submission) => set((state) => ({
    submissions: [...state.submissions, submission]
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    connected: false,
    address: null,
    role: null,
    insiderCredential: null,
    journalistCredential: null,
    submissions: [],
    loading: false,
    error: null,
  }),
}));
