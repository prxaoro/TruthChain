'use client';

import { useCallback } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { PROGRAM_ID } from '@/lib/aleo';
import { useStore } from '@/store/useStore';
import type { InsiderCredential, Report } from '@/types';

const FEE_WITH_FINALIZE = 500_000;
const FEE_SIMPLE = 350_000;

export function useAleo() {
  const {
    publicKey,
    connected,
    requestTransaction,
    requestRecordPlaintexts,
    requestRecords,
    transactionStatus,
  } = useWallet();

  const { setTxStatus, setTxId, setError, setCredential, setReports } = useStore();

  // Execute a transition and poll for confirmation
  const execute = useCallback(async (
    functionName: string,
    inputs: string[],
    fee: number = FEE_WITH_FINALIZE,
  ): Promise<string | null> => {
    if (!publicKey || !requestTransaction) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setTxStatus('signing');
      setError(null);

      const tx = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        PROGRAM_ID,
        functionName,
        inputs,
        fee,
        false,
      );

      setTxStatus('proving');
      const txId = await requestTransaction(tx);
      setTxId(txId);
      setTxStatus('broadcasting');

      // Poll for confirmation
      if (transactionStatus) {
        let attempts = 0;
        const maxAttempts = 120;
        await new Promise<void>((resolve) => {
          const interval = setInterval(async () => {
            try {
              const status = await transactionStatus(txId);
              if (status === 'Finalized' || status === 'Completed') {
                clearInterval(interval);
                setTxStatus('confirmed');
                resolve();
              } else if (status === 'Failed' || status === 'Rejected') {
                clearInterval(interval);
                setTxStatus('failed');
                setError('Transaction was rejected by the network');
                resolve();
              }
            } catch {
              // keep polling
            }
            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setTxStatus('confirmed');
              resolve();
            }
          }, 5000);
        });
      } else {
        setTxStatus('confirmed');
      }

      return txId;
    } catch (err: unknown) {
      setTxStatus('failed');
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      return null;
    }
  }, [publicKey, requestTransaction, transactionStatus, setTxStatus, setTxId, setError]);

  const registerInsider = useCallback(async (
    orgHash: string,
    roleHash: string,
    credentialId: string,
  ) => {
    return execute('register_insider', [orgHash, roleHash, credentialId], FEE_WITH_FINALIZE);
  }, [execute]);

  const submitReport = useCallback(async (
    credentialRecord: string,
    reportHash: string,
    severity: number,
    reportId: string,
  ) => {
    return execute('submit_report', [
      credentialRecord,
      reportHash,
      `${severity}u8`,
      reportId,
    ], FEE_WITH_FINALIZE);
  }, [execute]);

  const verifyCredential = useCallback(async (credentialRecord: string) => {
    return execute('verify_credential', [credentialRecord], FEE_SIMPLE);
  }, [execute]);

  // Parse a record plaintext string into a key-value object
  const parseRecord = useCallback((plaintext: string): Record<string, string> | null => {
    try {
      if (typeof plaintext === 'object') return plaintext as unknown as Record<string, string>;

      const clean = plaintext.trim();
      if (!clean.startsWith('{') || !clean.endsWith('}')) return null;

      const inner = clean.slice(1, -1).trim();
      const result: Record<string, string> = {};
      const pairs = inner.split(',').map(s => s.trim()).filter(Boolean);
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) continue;
        const key = pair.slice(0, colonIdx).trim();
        let val = pair.slice(colonIdx + 1).trim();
        // Remove .private/.public suffixes
        val = val.replace(/\.(private|public)$/, '');
        result[key] = val;
      }
      return result;
    } catch {
      return null;
    }
  }, []);

  // Fetch all records and return raw strings
  const fetchRawRecords = useCallback(async (): Promise<string[]> => {
    if (!connected) return [];
    try {
      let records: unknown[] = [];
      if (requestRecordPlaintexts) {
        try { records = await requestRecordPlaintexts(PROGRAM_ID); } catch { /* fallback */ }
      }
      if (records.length === 0 && requestRecords) {
        try { records = await requestRecords(PROGRAM_ID); } catch { return []; }
      }
      return records.map((r: unknown) => {
        if (typeof r === 'string') return r;
        if (r && typeof r === 'object' && 'plaintext' in r) return (r as { plaintext: string }).plaintext;
        return JSON.stringify(r);
      });
    } catch {
      return [];
    }
  }, [connected, requestRecordPlaintexts, requestRecords]);

  // Fetch InsiderCredential from wallet
  const fetchCredential = useCallback(async (): Promise<InsiderCredential | null> => {
    const records = await fetchRawRecords();
    for (const recStr of records) {
      const parsed = parseRecord(recStr);
      if (!parsed) continue;
      // InsiderCredential has credential_id but NOT report_hash
      if (parsed.credential_id && !parsed.report_hash) {
        const credential: InsiderCredential = {
          owner: parsed.owner || '',
          org_hash: parsed.org_hash || '',
          role_hash: parsed.role_hash || '',
          credential_id: parsed.credential_id,
          _nonce: parsed._nonce || '',
        };
        setCredential(credential);
        return credential;
      }
    }
    return null;
  }, [fetchRawRecords, parseRecord, setCredential]);

  // Fetch Report records from wallet
  const fetchReports = useCallback(async (): Promise<Report[]> => {
    const records = await fetchRawRecords();
    const reports: Report[] = [];
    for (const recStr of records) {
      const parsed = parseRecord(recStr);
      if (!parsed) continue;
      if (parsed.report_hash && parsed.report_id) {
        reports.push({
          owner: parsed.owner || '',
          report_hash: parsed.report_hash,
          org_hash: parsed.org_hash || '',
          severity: parsed.severity || '',
          report_id: parsed.report_id,
          _nonce: parsed._nonce || '',
        });
      }
    }
    setReports(reports);
    return reports;
  }, [fetchRawRecords, parseRecord, setReports]);

  // Get raw credential record string for use as transition input
  const getRawCredentialRecord = useCallback(async (): Promise<string | null> => {
    const records = await fetchRawRecords();
    for (const recStr of records) {
      const parsed = parseRecord(recStr);
      if (!parsed) continue;
      if (parsed.credential_id && !parsed.report_hash) {
        return recStr;
      }
    }
    return null;
  }, [fetchRawRecords, parseRecord]);

  return {
    publicKey,
    connected,
    execute,
    registerInsider,
    submitReport,
    verifyCredential,
    fetchCredential,
    fetchReports,
    getRawCredentialRecord,
  };
}
