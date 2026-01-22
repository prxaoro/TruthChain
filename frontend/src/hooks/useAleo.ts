'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from '@demox-labs/aleo-wallet-adapter-base';
import { PROGRAM_ID, hashToField, generateSalt } from '@/lib/aleo';

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  outputs?: any[];
}

export function useAleo() {
  const { publicKey, requestTransaction, requestRecords, requestRecordPlaintexts, decrypt, connected, connecting } = useWallet();
  const [loading, setLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  // Execute a transition on the whistleblower program
  const executeTransition = useCallback(async (
    transitionName: string,
    inputs: string[],
    fee: number = 500000 // 0.5 credits default fee
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!requestTransaction) {
      return { success: false, error: 'Wallet does not support transactions' };
    }

    setLoading(true);
    try {
      // Create the transaction
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        PROGRAM_ID,
        transitionName,
        inputs,
        fee,
        false // not private fee
      );

      // Request wallet to sign and broadcast
      const txId = await requestTransaction(aleoTransaction);

      if (txId) {
        setLastTxId(txId);
        return {
          success: true,
          transactionId: txId,
        };
      } else {
        return { success: false, error: 'Transaction rejected or failed' };
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      return {
        success: false,
        error: error.message || 'Transaction failed',
      };
    } finally {
      setLoading(false);
    }
  }, [publicKey, requestTransaction]);

  // Register as insider
  const registerInsider = useCallback(async (
    companyName: string,
    department: string,
    seniority: number
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const companyHash = await hashToField(companyName.toLowerCase());
      const departmentHash = await hashToField(department.toLowerCase());
      const salt = generateSalt();

      const inputs = [
        companyHash,
        departmentHash,
        `${seniority}u8`,
        salt,
        publicKey
      ];

      return await executeTransition('register_insider', inputs, 1000000);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [publicKey, executeTransition]);

  // Submit a leak
  const submitLeak = useCallback(async (
    insiderCredential: string, // JSON string of credential record
    documentContent: string,
    severity: number,
    recipientAddress: string
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const documentHash = await hashToField(documentContent);
      const salt = generateSalt();

      const inputs = [
        insiderCredential,
        documentHash,
        `${severity}u8`,
        recipientAddress,
        salt
      ];

      return await executeTransition('submit_leak', inputs, 1500000);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [publicKey, executeTransition]);

  // Register as journalist
  const registerJournalist = useCallback(async (
    publicationName: string
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const publicationHash = await hashToField(publicationName.toLowerCase());
      const salt = generateSalt();

      const inputs = [
        publicationHash,
        salt,
        publicKey
      ];

      return await executeTransition('register_journalist', inputs, 1000000);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [publicKey, executeTransition]);

  // Verify a submission (journalist only)
  const verifySubmission = useCallback(async (
    journalistCredential: string,
    submission: string,
    credibilityScore: number
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const inputs = [
        journalistCredential,
        submission,
        `${credibilityScore}u8`
      ];

      return await executeTransition('verify_submission', inputs, 1200000);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [publicKey, executeTransition]);

  // Fund bounty pool
  const fundBountyPool = useCallback(async (
    amount: number
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const inputs = [`${amount}u64`];
      return await executeTransition('fund_bounty_pool', inputs, 800000);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [publicKey, executeTransition]);

  // Claim bounty reward
  const claimBounty = useCallback(async (
    bountyReward: string
  ): Promise<TransactionResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const inputs = [bountyReward];
      return await executeTransition('claim_bounty', inputs, 1000000);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [publicKey, executeTransition]);

  // Get user's records from the program (basic info, no nonce)
  const getUserRecords = useCallback(async (): Promise<any[]> => {
    if (!publicKey || !requestRecords) {
      return [];
    }

    try {
      const records = await requestRecords(PROGRAM_ID);
      return records || [];
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }, [publicKey, requestRecords]);

  // Get user's records with FULL PLAINTEXT (including _nonce) - needed for transactions!
  const getUserRecordPlaintexts = useCallback(async (): Promise<any[]> => {
    if (!publicKey || !requestRecordPlaintexts) {
      console.log('requestRecordPlaintexts not available, falling back to requestRecords');
      return getUserRecords();
    }

    try {
      console.log('Fetching record plaintexts for:', PROGRAM_ID);
      const result = await requestRecordPlaintexts(PROGRAM_ID) as any;
      console.log('Record plaintexts result:', result);

      // Extract records array from various response formats
      const records: any[] = result?.records || (Array.isArray(result) ? result : []);

      // Map records to ensure plaintext is accessible
      // requestRecordPlaintexts returns records with a 'plaintext' field containing the full record string
      return records.map((record: any) => {
        // If it's already a string (the plaintext itself), return as-is
        if (typeof record === 'string') {
          return record;
        }
        // If it has a plaintext field, preserve the whole record object with plaintext
        if (record.plaintext) {
          console.log('Found record with plaintext field:', record.plaintext.substring(0, 100) + '...');
          return record;
        }
        return record;
      });
    } catch (error: any) {
      console.error('Error fetching record plaintexts:', error);
      // Check if it's a permission error
      if (error?.message?.includes('NOT_GRANTED') || error?.code === 'NOT_GRANTED') {
        console.warn('Decrypt permission not granted. Trying to decrypt ciphertexts manually...');

        // Try getting records and decrypting their ciphertexts
        if (decrypt) {
          try {
            const basicRecords = await getUserRecords();
            console.log('Basic records for manual decrypt:', JSON.stringify(basicRecords, null, 2));

            // Check if records have ciphertext we can decrypt
            const decryptedRecords = await Promise.all(
              basicRecords.map(async (record: any) => {
                if (record.ciphertext) {
                  try {
                    const plaintext = await decrypt(record.ciphertext);
                    console.log('Decrypted record:', plaintext);
                    return { ...record, plaintext };
                  } catch (decryptError) {
                    console.error('Failed to decrypt record:', decryptError);
                    return record;
                  }
                }
                return record;
              })
            );
            return decryptedRecords;
          } catch (decryptError) {
            console.error('Manual decryption failed:', decryptError);
          }
        }
      }
      // Fallback to regular records
      return getUserRecords();
    }
  }, [publicKey, requestRecordPlaintexts, getUserRecords, decrypt]);

  // Get insider credential from records (with full plaintext for transactions)
  const getInsiderCredential = useCallback(async (): Promise<any | null> => {
    // Try to get records with plaintexts first (includes _nonce)
    const records = await getUserRecordPlaintexts();
    console.log('Looking for InsiderCredential in records:', records);

    // Find InsiderCredential - could be plaintext string or parsed object
    // IMPORTANT: Filter out spent records - they can't be used in transactions
    const credential = records.find((r: any) => {
      // Skip spent records - they can't be used
      if (r.spent === true) {
        console.log('Skipping spent record:', r.id || r.recordName);
        return false;
      }

      // If it's a plaintext string, check for credential_id and company_hash
      if (typeof r === 'string') {
        return r.includes('credential_id') && r.includes('company_hash') && !r.includes('publication_hash');
      }
      // If it has a plaintext field (from requestRecordPlaintexts), check the plaintext
      if (r.plaintext && typeof r.plaintext === 'string') {
        return r.plaintext.includes('credential_id') && r.plaintext.includes('company_hash') && !r.plaintext.includes('publication_hash');
      }
      // If it's an object with data property
      if (r.data && r.data.credential_id && r.data.company_hash && !r.data.publication_hash) {
        return true;
      }
      // If it's an object with recordName property (from requestRecords)
      if (r.recordName === 'InsiderCredential') {
        return true;
      }
      // If it's a direct object (plaintext parsed)
      if (r.credential_id && r.company_hash && !r.publication_hash) {
        return true;
      }
      return false;
    });

    console.log('Found InsiderCredential:', credential);

    // If we found a credential but it doesn't have plaintext, try to decrypt the ciphertext
    if (credential && !credential.plaintext && credential.ciphertext && decrypt) {
      console.log('Trying to decrypt record ciphertext...');
      try {
        const plaintext = await decrypt(credential.ciphertext);
        console.log('Decrypted plaintext:', plaintext);
        return { ...credential, plaintext };
      } catch (err) {
        console.error('Failed to decrypt ciphertext:', err);
      }
    }

    return credential || null;
  }, [getUserRecordPlaintexts, decrypt]);

  // Get journalist credential from records
  const getJournalistCredential = useCallback(async (): Promise<any | null> => {
    const records = await getUserRecords();
    const credential = records.find(r =>
      r.data && r.data.publication_hash && r.data.trust_score
    );
    return credential || null;
  }, [getUserRecords]);

  return {
    // State
    address: publicKey,
    connected,
    connecting,
    loading,
    lastTxId,

    // Actions
    registerInsider,
    submitLeak,
    registerJournalist,
    verifySubmission,
    fundBountyPool,
    claimBounty,
    executeTransition,

    // Records
    getUserRecords,
    getUserRecordPlaintexts,
    getInsiderCredential,
    getJournalistCredential,
  };
}
