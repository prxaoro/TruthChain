'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useAleo } from '@/hooks/useAleo';
import { SEVERITY_LEVELS, hashToField, PROGRAM_ID } from '@/lib/aleo';
import { addKnownCompany } from '@/lib/companyRegistry';
import { encryptAndStoreMessage } from '@/lib/encryption';

type Step = 'connect' | 'register' | 'submit' | 'pending' | 'success';

export default function SubmitPage() {
  const { publicKey, connected, decrypt } = useWallet();
  const { registerInsider, submitLeak, loading, lastTxId, getInsiderCredential } = useAleo();

  const [step, setStep] = useState<Step>('connect');
  const [insiderCredential, setInsiderCredential] = useState<any>(null);
  const [txStatus, setTxStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Registration form state
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [seniority, setSeniority] = useState(3);

  // Submission form state
  const [severity, setSeverity] = useState(3);
  const [description, setDescription] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [manualPlaintext, setManualPlaintext] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTxId, setManualTxId] = useState('');

  // Pending transaction tracking
  const [pendingWalletId, setPendingWalletId] = useState('');
  const [onChainTxId, setOnChainTxId] = useState('');
  const [txConfirmed, setTxConfirmed] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Store message content until transaction is confirmed (to encrypt with on-chain ID)
  const [pendingMessage, setPendingMessage] = useState<{
    description: string;
    recipientAddress: string;
    documentHash: string;
  } | null>(null);

  // Update step based on connection and credential status
  useEffect(() => {
    if (!connected) {
      setStep('connect');
    } else if (insiderCredential) {
      setStep('submit');
    } else {
      setStep('register');
    }
  }, [connected, insiderCredential]);

  // Check for existing credential on connect
  useEffect(() => {
    async function checkCredential() {
      if (connected) {
        const cred = await getInsiderCredential();
        if (cred) {
          setInsiderCredential(cred);
        }
      }
    }
    checkCredential();
  }, [connected, getInsiderCredential]);

  const handleRegister = async () => {
    if (!company || !department) return;
    setError('');
    setTxStatus('Creating ZK proof and signing transaction...');

    try {
      const result = await registerInsider(company, department, seniority);

      if (result.success && result.transactionId) {
        setTxStatus(`Transaction submitted: ${result.transactionId}`);

        // Wait for confirmation
        setTxStatus('Waiting for on-chain confirmation...');

        // Compute company hash and register it for stats tracking
        const companyHash = await hashToField(company.toLowerCase());
        addKnownCompany(companyHash, company);

        // Store registration TX ID for credential recovery
        // NOTE: We DON'T create a local credential because it won't have the _nonce
        // The real credential is created on-chain and must be fetched from wallet/blockchain
        const registrationTxId = result.transactionId;

        // Set a temporary marker so we know they registered
        setInsiderCredential({
          _pendingRecovery: true,
          registrationTxId,
          company,
          department
        });

        // Show manual input immediately since we need to recover the real credential
        setShowManualInput(true);
        setManualTxId(registrationTxId);
        setTxStatus('');
        setError('Registration submitted! Now fetch your credential below to enable leak submission.');
        setStep('submit');
      } else {
        setError(result.error || 'Transaction failed');
        setTxStatus('');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setTxStatus('');
    }
  };

  // Check if the transaction is on-chain and find its real ID
  const checkTransactionStatus = useCallback(async (walletId: string): Promise<{ found: boolean; txId?: string }> => {
    // If walletId already looks like an Aleo transaction ID, check it directly
    if (walletId.startsWith('at1')) {
      try {
        const response = await fetch(`https://api.explorer.provable.com/v1/testnet/transaction/${walletId}`);
        if (response.ok) {
          return { found: true, txId: walletId };
        }
      } catch {
        // Not found yet
      }
      return { found: false };
    }

    // For Leo Wallet internal IDs (UUIDs), we need to search recent transactions
    // from our address to find the matching one
    if (!publicKey) return { found: false };

    try {
      // Search for recent program transactions
      const response = await fetch(
        `https://api.explorer.provable.com/v1/testnet/program/${PROGRAM_ID}/mappings`
      );

      if (!response.ok) {
        console.log('[Submit] Could not fetch program data');
        return { found: false };
      }

      // Alternative: Check the user's recent transactions
      const userTxResponse = await fetch(
        `https://api.explorer.provable.com/v1/testnet/address/${publicKey}/transactions?limit=5`
      );

      if (userTxResponse.ok) {
        const transactions = await userTxResponse.json();
        console.log('[Submit] Recent user transactions:', transactions);

        // Look for submit_leak transaction
        for (const tx of transactions || []) {
          if (tx.id && tx.id.startsWith('at1')) {
            // Check if this is a submit_leak transaction to our program
            const txDetailResponse = await fetch(
              `https://api.explorer.provable.com/v1/testnet/transaction/${tx.id}`
            );
            if (txDetailResponse.ok) {
              const txDetail = await txDetailResponse.json();
              const programId = txDetail?.execution?.transitions?.[0]?.program;
              const functionName = txDetail?.execution?.transitions?.[0]?.function;

              if (programId === PROGRAM_ID && functionName === 'submit_leak') {
                console.log('[Submit] Found matching submit_leak transaction:', tx.id);
                return { found: true, txId: tx.id };
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('[Submit] Error checking transaction status:', err);
    }

    return { found: false };
  }, [publicKey]);

  // Poll for transaction confirmation when pending
  useEffect(() => {
    if (step !== 'pending' || !pendingWalletId || txConfirmed) return;

    const pollInterval = setInterval(async () => {
      setPollCount(prev => prev + 1);
      console.log(`[Submit] Polling for transaction (attempt ${pollCount + 1})...`);

      const result = await checkTransactionStatus(pendingWalletId);

      if (result.found && result.txId) {
        console.log('[Submit] Transaction confirmed on-chain:', result.txId);
        setOnChainTxId(result.txId);
        setTxConfirmed(true);
        setSubmissionId(result.txId);

        // NOW store the encrypted message with the actual on-chain transaction ID
        if (pendingMessage) {
          try {
            console.log('[Submit] Storing encrypted message with on-chain ID:', result.txId);
            await encryptAndStoreMessage(
              pendingMessage.description,
              pendingMessage.recipientAddress,
              result.txId,  // Use the REAL on-chain transaction ID
              pendingMessage.documentHash
            );
            console.log('[Submit] Message encrypted and stored for journalist with correct ID');
          } catch (encryptErr) {
            console.error('[Submit] Failed to encrypt message:', encryptErr);
          }
          setPendingMessage(null);
        }

        setStep('success');
        clearInterval(pollInterval);
      } else if (pollCount >= 30) {
        // After 30 attempts (about 1 minute), show the pending view with manual check option
        console.log('[Submit] Transaction not found after polling, showing pending view');
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [step, pendingWalletId, txConfirmed, pollCount, checkTransactionStatus, pendingMessage]);

  // Fetch record plaintext from transaction ID (for transaction inputs)
  const fetchRecordPlaintext = async (txId: string): Promise<string | null> => {
    try {
      console.log('Fetching transaction:', txId);
      setTxStatus('Fetching your credential from blockchain...');

      // Fetch transaction from Aleo API
      const response = await fetch(`https://api.explorer.provable.com/v1/testnet/transaction/${txId}`);
      if (!response.ok) {
        console.error('Failed to fetch transaction:', response.status);
        return null;
      }

      const txData = await response.json();
      console.log('Transaction data:', txData);

      // Find the record output (usually in execution.transitions[0].outputs)
      const outputs = txData?.execution?.transitions?.[0]?.outputs || [];
      const recordOutput = outputs.find((o: any) => o.type === 'record' && o.value?.startsWith('record1'));

      if (!recordOutput?.value) {
        console.error('No record output found in transaction');
        return null;
      }

      const ciphertext = recordOutput.value;
      console.log('Found record ciphertext:', ciphertext.substring(0, 50) + '...');

      // Decrypt to get the plaintext (required for wallet transactions)
      if (decrypt) {
        setTxStatus('Decrypting credential...');
        try {
          const plaintext = await decrypt(ciphertext);
          console.log('Decrypted plaintext:', plaintext);
          // Verify it's an InsiderCredential (has company_hash, not publication_hash)
          if (!plaintext.includes('company_hash') || plaintext.includes('publication_hash')) {
            console.error('Not an InsiderCredential record');
            return null;
          }
          // Return the plaintext, not ciphertext - wallet needs plaintext for transactions
          return plaintext;
        } catch (e) {
          console.error('Failed to decrypt record:', e);
          return null;
        }
      }

      console.error('No decrypt function available');
      return null;
    } catch (err: any) {
      console.error('Error fetching record:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!description || !recipientAddress) return;
    setError('');

    let credentialRecord: string;

    // Check if credential is in pending recovery state (needs to be fetched)
    if (insiderCredential?._pendingRecovery && !manualPlaintext) {
      setError('Please fetch your credential first using the recovery section below.');
      setShowManualInput(true);
      return;
    }

    // PRIORITY 1: Use record plaintext from recovery flow (starts with '{' and includes '_nonce')
    if (manualPlaintext && (manualPlaintext.trim().startsWith('{') || manualPlaintext.includes('_nonce'))) {
      console.log('Using record plaintext from recovery');
      credentialRecord = manualPlaintext.trim();
      setTxStatus('Encrypting document and creating ZK proof...');
    } else {
      // Try to fetch from wallet
      setTxStatus('Fetching credential from wallet...');

      try {
        const actualCredential = await getInsiderCredential();

        console.log('=== Credential from wallet ===');
        console.log('Type:', typeof actualCredential);
        console.log('Value:', actualCredential);

        if (!actualCredential) {
          setError('No insider credential found in wallet. Please register first.');
          setTxStatus('');
          return;
        }

        setTxStatus('Encrypting document and creating ZK proof...');

        // Check various plaintext formats
        if (actualCredential.plaintext && typeof actualCredential.plaintext === 'string') {
          console.log('Using plaintext field from record (includes _nonce)');
          credentialRecord = actualCredential.plaintext;
        }
        else if (typeof actualCredential === 'string') {
          console.log('Credential is already a plaintext string');
          credentialRecord = actualCredential;
        }
        else if (actualCredential._nonce) {
          console.log('Using parsed plaintext object with _nonce');
          credentialRecord = `{
  owner: ${actualCredential.owner},
  company_hash: ${actualCredential.company_hash},
  department_hash: ${actualCredential.department_hash},
  seniority_level: ${actualCredential.seniority_level},
  credential_id: ${actualCredential.credential_id},
  is_verified: ${actualCredential.is_verified},
  _nonce: ${actualCredential._nonce}
}`;
        }
        // Fallback: Show manual input (blockchain record fetching requires wallet decryption)
        else if (actualCredential.credential_id || insiderCredential?.credential_id) {
          console.log('Record needs wallet decryption. Please use manual input.');
          setError('Could not auto-fetch your credential. Please use manual input below.');
          setShowManualInput(true);
          setTxStatus('');
          return;
        }
        // Last resort: Show manual input
        else {
          console.error('Record missing plaintext/_nonce. Full structure:', JSON.stringify(actualCredential, null, 2));
          setError('Record missing required data. Please use manual input below.');
          setShowManualInput(true);
          setTxStatus('');
          return;
        }
      } catch (innerErr: any) {
        console.error('Error getting credential:', innerErr);
        setError('Failed to get credential. Please use manual input below.');
        setShowManualInput(true);
        setTxStatus('');
        return;
      }
    }

    // Now submit the leak with the credential
    try {
      console.log('Final record plaintext:', credentialRecord.substring(0, 200) + '...');

      const result = await submitLeak(
        credentialRecord,
        description,
        severity,
        recipientAddress
      );

      if (result.success && result.transactionId) {
        console.log('[Submit] Transaction submitted, wallet ID:', result.transactionId);

        // Compute document hash for later storage
        const documentHash = await hashToField(description);

        // Check if it's already an on-chain ID (starts with 'at1')
        if (result.transactionId.startsWith('at1')) {
          // Direct on-chain ID - store message immediately and go to success
          try {
            await encryptAndStoreMessage(
              description,
              recipientAddress,
              result.transactionId,  // Already the real on-chain ID
              documentHash
            );
            console.log('[Submit] Message encrypted and stored with on-chain ID:', result.transactionId);
          } catch (encryptErr) {
            console.error('[Submit] Failed to encrypt message:', encryptErr);
          }

          setSubmissionId(result.transactionId);
          setOnChainTxId(result.transactionId);
          setTxConfirmed(true);
          setTxStatus('');
          setStep('success');
        } else {
          // Leo Wallet tracking ID (UUID) - DON'T store message yet!
          // Wait for on-chain confirmation to get the real transaction ID
          console.log('[Submit] Got wallet tracking ID, waiting for on-chain confirmation...');

          // Store message data for later (once we get the on-chain ID)
          setPendingMessage({
            description,
            recipientAddress,
            documentHash
          });

          setPendingWalletId(result.transactionId);
          setPollCount(0);
          setTxStatus('Waiting for on-chain confirmation...');
          setStep('pending');
        }
      } else {
        setError(result.error || 'Submission failed');
        setTxStatus('');
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      setTxStatus('');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                step === 'connect' ? 'bg-green-400 text-black' : 'bg-green-400/20 text-green-400'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step !== 'connect' ? 'bg-green-400' : 'bg-zinc-700'}`}></div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                step === 'register' ? 'bg-green-400 text-black' :
                ['submit', 'pending', 'success'].includes(step) ? 'bg-green-400/20 text-green-400' : 'bg-zinc-700 text-zinc-500'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${['submit', 'pending', 'success'].includes(step) ? 'bg-green-400' : 'bg-zinc-700'}`}></div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                step === 'submit' ? 'bg-green-400 text-black' :
                ['pending', 'success'].includes(step) ? 'bg-green-400/20 text-green-400' : 'bg-zinc-700 text-zinc-500'
              }`}>
                3
              </div>
              <div className={`w-12 h-1 ${['pending', 'success'].includes(step) ? 'bg-yellow-400' : 'bg-zinc-700'}`}></div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                step === 'pending' ? 'bg-yellow-400 text-black animate-pulse' :
                step === 'success' ? 'bg-green-400/20 text-green-400' : 'bg-zinc-700 text-zinc-500'
              }`}>
                4
              </div>
              <div className={`w-12 h-1 ${step === 'success' ? 'bg-green-400' : 'bg-zinc-700'}`}></div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                step === 'success' ? 'bg-green-400 text-black' : 'bg-zinc-700 text-zinc-500'
              }`}>
                ✓
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${
              error.includes('Registration submitted')
                ? 'bg-green-900/30 border border-green-500 text-green-400'
                : 'bg-red-900/30 border border-red-500 text-red-400'
            }`}>
              {error}
            </div>
          )}

          {/* Transaction Status */}
          {txStatus && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500 rounded-lg text-blue-400 flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{txStatus}</span>
            </div>
          )}

          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            {/* Step 1: Connect */}
            {step === 'connect' && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Connect Your Leo Wallet</h2>
                <p className="text-zinc-400 mb-8">
                  Connect your Leo Wallet to create your anonymous insider credential.
                  This enables real on-chain transactions on Aleo testnet.
                </p>
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-6">
                  <h4 className="text-sm font-medium text-green-400 mb-2">Real Blockchain Integration</h4>
                  <ul className="text-xs text-zinc-500 space-y-1 text-left">
                    <li>✓ Transactions signed by your Leo Wallet</li>
                    <li>✓ ZK proofs generated on-chain</li>
                    <li>✓ Records stored as private Aleo records</li>
                    <li>✓ Verifiable on Aleo testnet explorer</li>
                  </ul>
                </div>
                <p className="text-sm text-zinc-500">
                  Use the "Connect Wallet" button in the header to connect your Leo Wallet
                </p>
              </div>
            )}

            {/* Step 2: Register */}
            {step === 'register' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Insider Credential</h2>
                <p className="text-zinc-400 mb-8">
                  This creates a zero-knowledge proof that you work at this company,
                  without revealing your identity. Transaction will be signed by your wallet.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Boeing, Meta, Goldman Sachs"
                      className="input-dark"
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      This will be hashed on-chain using BHP256.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g., Engineering, Finance, Legal"
                      className="input-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Seniority Level: {seniority}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={seniority}
                      onChange={(e) => setSeniority(parseInt(e.target.value))}
                      className="w-full accent-green-400"
                    />
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>Entry</span>
                      <span>Mid</span>
                      <span>Senior</span>
                      <span>Lead</span>
                      <span>Executive</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <h4 className="text-sm font-medium text-green-400 mb-2">On-Chain Privacy</h4>
                    <ul className="text-xs text-zinc-500 space-y-1">
                      <li>✓ Company name hashed with BHP256</li>
                      <li>✓ Credential stored as private Aleo record</li>
                      <li>✓ Only you can access this credential</li>
                      <li>✓ Transaction verifiable on explorer</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={loading || !company || !department}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Signing Transaction...</span>
                      </span>
                    ) : (
                      'Create Credential (Sign with Wallet)'
                    )}
                  </button>

                  {/* Bypass for users who already registered but wallet hasn't synced */}
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        setShowManualInput(true);
                        setStep('submit');
                      }}
                      className="text-sm text-zinc-400 hover:text-green-400 transition-colors"
                    >
                      Already registered? Use transaction ID to recover credential →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Submit */}
            {step === 'submit' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Submit Your Leak</h2>
                <p className="text-zinc-400 mb-8">
                  Your submission is encrypted and sent on-chain. Only the recipient journalist can decrypt it.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Severity Level
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {SEVERITY_LEVELS.map((level) => (
                        <button
                          key={level.level}
                          onClick={() => setSeverity(level.level)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            severity === level.level
                              ? 'border-green-400 bg-green-400/10'
                              : 'border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <div className="text-lg font-bold" style={{ color: level.color }}>
                            {level.level}
                          </div>
                          <div className="text-xs text-zinc-500">{level.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">
                      {SEVERITY_LEVELS[severity - 1]?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Description of Wrongdoing
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the misconduct, fraud, or safety violation..."
                      rows={6}
                      className="input-dark resize-none"
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      This will be encrypted before on-chain submission.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Recipient Journalist Address
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="aleo1..."
                      className="input-dark font-mono text-sm"
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      Only this Aleo address can decrypt your submission.
                    </p>
                  </div>

                  {/* Manual recovery - shown when credential needs fetching */}
                  {showManualInput && (
                    <div className={`p-4 rounded-lg border ${
                      insiderCredential?._pendingRecovery
                        ? 'bg-blue-900/20 border-blue-700/50'
                        : 'bg-yellow-900/20 border-yellow-700/50'
                    }`}>
                      <h4 className={`text-sm font-medium mb-2 ${
                        insiderCredential?._pendingRecovery ? 'text-blue-400' : 'text-yellow-400'
                      }`}>
                        {insiderCredential?._pendingRecovery
                          ? 'Step 2: Fetch Your Credential'
                          : 'Credential Recovery'}
                      </h4>
                      <p className={`text-xs mb-3 ${
                        insiderCredential?._pendingRecovery ? 'text-blue-300/80' : 'text-yellow-300/80'
                      }`}>
                        {insiderCredential?._pendingRecovery
                          ? 'Your registration is being confirmed. Once confirmed (30-60 seconds), click below to fetch your real credential from the blockchain.'
                          : 'Enter your registration transaction ID from Aleo Explorer:'}
                      </p>
                      <input
                        type="text"
                        value={manualTxId}
                        onChange={(e) => setManualTxId(e.target.value)}
                        placeholder="at1abc123..."
                        className="input-dark font-mono text-xs mb-3"
                      />
                      <button
                        onClick={async () => {
                          const txId = manualTxId || insiderCredential?.registrationTxId || insiderCredential?.credential_id;
                          if (txId) {
                            const plaintext = await fetchRecordPlaintext(txId);
                            if (plaintext) {
                              setManualPlaintext(plaintext);
                              setShowManualInput(false);
                              setError('');
                              setTxStatus(''); // Clear status after successful fetch
                            } else {
                              setTxStatus('');
                              setError('Transaction not confirmed yet. Please wait 30-60 seconds and try again.');
                            }
                          } else {
                            setError('Please enter your transaction ID');
                          }
                        }}
                        disabled={!manualTxId && !insiderCredential?.registrationTxId}
                        className="btn-primary text-sm w-full"
                      >
                        Fetch & Decrypt Credential
                      </button>
                      {manualPlaintext && manualPlaintext.includes('_nonce') && (
                        <p className="text-xs text-green-400 mt-2 text-center">✓ Credential ready - fill out the form and click Submit Leak!</p>
                      )}
                    </div>
                  )}

                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/50">
                    <h4 className="text-sm font-medium text-red-400 mb-2">Important</h4>
                    <ul className="text-xs text-red-300/80 space-y-1">
                      <li>- This transaction will be signed by your wallet</li>
                      <li>- Transaction is recorded on Aleo testnet</li>
                      <li>- Your identity remains protected by ZK proofs</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !description || !recipientAddress}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Signing & Submitting...</span>
                      </span>
                    ) : (
                      'Submit Leak (Sign with Wallet)'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Pending Confirmation */}
            {step === 'pending' && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Transaction Pending</h2>
                <p className="text-zinc-400 mb-6">
                  Your submission has been signed and sent to the Aleo network.
                  Waiting for on-chain confirmation...
                </p>

                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-6">
                  <div className="text-xs text-zinc-500 mb-1">Wallet Tracking ID</div>
                  <div className="font-mono text-yellow-400 text-sm break-all">{pendingWalletId}</div>
                  <div className="mt-3 text-xs text-zinc-500">
                    Checking for confirmation... (attempt {pollCount}/30)
                  </div>
                  <div className="mt-2 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{ width: `${(pollCount / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700 mb-6 text-left">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">What's happening?</h4>
                  <ul className="text-xs text-blue-300/80 space-y-1">
                    <li>1. Your wallet signed the transaction</li>
                    <li>2. Transaction is being broadcast to Aleo nodes</li>
                    <li>3. Waiting for block confirmation (~30 seconds)</li>
                    <li>4. Once confirmed, the journalist will receive it</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700/50 mb-6">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">Check Leo Wallet</h4>
                  <p className="text-xs text-yellow-300/80">
                    Open your Leo Wallet extension and check the Activity tab.
                    Once the transaction shows "Confirmed", you can click below.
                  </p>
                </div>

                {pollCount >= 30 && (
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                      Transaction taking longer than expected. Please check your wallet or enter the transaction ID manually:
                    </p>
                    <input
                      type="text"
                      placeholder="at1abc123..."
                      className="input-dark font-mono text-sm"
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (val.startsWith('at1')) {
                          setOnChainTxId(val);
                        }
                      }}
                    />
                    <button
                      onClick={async () => {
                        if (onChainTxId) {
                          const result = await checkTransactionStatus(onChainTxId);
                          if (result.found) {
                            // Store encrypted message with the verified on-chain ID
                            if (pendingMessage) {
                              try {
                                console.log('[Submit] Manual verify - storing message with ID:', onChainTxId);
                                await encryptAndStoreMessage(
                                  pendingMessage.description,
                                  pendingMessage.recipientAddress,
                                  onChainTxId,
                                  pendingMessage.documentHash
                                );
                                console.log('[Submit] Message stored successfully');
                              } catch (encryptErr) {
                                console.error('[Submit] Failed to encrypt message:', encryptErr);
                              }
                              setPendingMessage(null);
                            }
                            setTxConfirmed(true);
                            setSubmissionId(onChainTxId);
                            setStep('success');
                          } else {
                            setError('Transaction not found on-chain yet. Please wait or check Leo Wallet.');
                          }
                        }
                      }}
                      disabled={!onChainTxId}
                      className="btn-primary w-full"
                    >
                      Verify Transaction
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Success */}
            {step === 'success' && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Submission Complete</h2>
                <p className="text-zinc-400 mb-6">
                  Your anonymous leak has been submitted on-chain.
                  The journalist will receive your encrypted submission.
                </p>

                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-8">
                  <div className="text-xs text-zinc-500 mb-1">Transaction ID</div>
                  <div className="font-mono text-green-400 text-sm break-all">{submissionId}</div>
                  <a
                    href={`https://explorer.aleo.org/transaction/${submissionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-2 inline-block"
                  >
                    View on Aleo Explorer
                  </a>
                </div>

                <div className="space-y-4 text-left bg-zinc-900/50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium">What happens next:</h4>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400">1.</span>
                      <span>The SecureSubmission record is now in the journalist's wallet</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400">2.</span>
                      <span>They'll see it when they open their Journalist Dashboard</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400">3.</span>
                      <span>They verify the information independently</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400">4.</span>
                      <span>Your identity remains protected throughout</span>
                    </li>
                  </ul>
                </div>

                {/* For privacy, show how journalist can load if auto-detection fails */}
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/50 mb-8 text-left">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Backup: Share Transaction ID</h4>
                  <p className="text-xs text-blue-300/80 mb-2">
                    If the journalist doesn't see your submission automatically, they can load it using the transaction ID above.
                    You can share this ID through a secure channel.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Note: The transaction ID only proves a submission exists - it does NOT reveal your identity.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setDescription('');
                    setRecipientAddress('');
                    setStep('submit');
                  }}
                  className="btn-secondary"
                >
                  Submit Another Leak
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
