'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useStore } from '@/store/useStore';
import { hashToField, generateSalt } from '@/lib/aleo';
import { useAleo } from '@/hooks/useAleo';
import { PROGRAM_ID } from '@/lib/aleo';
import { retrieveAndDecryptMessage, getEncryptedMessage } from '@/lib/encryption';

interface Submission {
  id: string;
  companyHash: string;
  severity: number;
  timestamp: number;
  verified: boolean;
  credibilityScore: number | null;
  rawRecord?: any;
  documentHash?: string;
  decryptedMessage?: string;
}

export default function JournalistPage() {
  const { publicKey, connected } = useWallet();
  const { registerJournalist, verifySubmission, getUserRecords, getUserRecordPlaintexts, loading: aleoLoading } = useAleo();
  const { journalistCredential, setJournalistCredential } = useStore();
  const [isRegistered, setIsRegistered] = useState(!!journalistCredential);
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [checkingCredential, setCheckingCredential] = useState(true);
  const [publication, setPublication] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [verifyScore, setVerifyScore] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [manualTxId, setManualTxId] = useState('');
  const [loadingTx, setLoadingTx] = useState(false);

  // Check for existing JournalistCredential on wallet connection
  useEffect(() => {
    async function checkJournalistCredential() {
      if (!connected || !getUserRecords) {
        setCheckingCredential(false);
        return;
      }

      try {
        const records = await getUserRecords();
        console.log('[Journalist] Checking wallet for JournalistCredential...', records);

        // Find JournalistCredential record
        // It should have: publication_hash, trust_score, verified_leaks, credential_id, is_active
        const journalistRecord = records.find((r: any) => {
          const data = r.data || {};
          // Check for distinctive JournalistCredential fields
          return (
            data.publication_hash !== undefined &&
            data.trust_score !== undefined &&
            data.is_active !== undefined
          );
        });

        if (journalistRecord) {
          console.log('[Journalist] Found existing JournalistCredential:', journalistRecord);
          const data = journalistRecord.data || {};

          // Parse trust_score (remove u8 suffix if present)
          let trustScore = 100;
          if (data.trust_score) {
            const scoreMatch = String(data.trust_score).match(/(\d+)/);
            trustScore = scoreMatch ? parseInt(scoreMatch[1]) : 100;
          }

          // Parse verified_leaks
          let verifiedLeaks = 0;
          if (data.verified_leaks) {
            const leaksMatch = String(data.verified_leaks).match(/(\d+)/);
            verifiedLeaks = leaksMatch ? parseInt(leaksMatch[1]) : 0;
          }

          const credential = {
            owner: journalistRecord.owner || publicKey || '',
            publication_hash: data.publication_hash,
            trust_score: trustScore,
            verified_leaks: verifiedLeaks,
            credential_id: data.credential_id,
            is_active: data.is_active === true || data.is_active === 'true',
          };

          setJournalistCredential(credential);
          setIsRegistered(true);
        } else {
          console.log('[Journalist] No JournalistCredential found in wallet');
        }
      } catch (error) {
        console.error('[Journalist] Error checking wallet records:', error);
      } finally {
        setCheckingCredential(false);
      }
    }

    checkJournalistCredential();
  }, [connected, getUserRecords, publicKey, setJournalistCredential]);

  // Fetch submissions from wallet records
  const fetchSubmissions = useCallback(async () => {
    if (!connected || !publicKey) return;

    setRecordsLoading(true);
    try {
      console.log('[Journalist] Fetching records for:', publicKey);

      let foundSubmissions: Submission[] = [];

      // Try getting records with plaintexts first (more complete data)
      let records: any[] = [];
      if (getUserRecordPlaintexts) {
        try {
          records = await getUserRecordPlaintexts();
          console.log('[Journalist] Records with plaintexts:', records.length);
        } catch (e) {
          console.log('[Journalist] Falling back to basic records');
          if (getUserRecords) {
            records = await getUserRecords();
          }
        }
      } else if (getUserRecords) {
        records = await getUserRecords();
      }

      console.log('[Journalist] All wallet records:', JSON.stringify(records, null, 2));

      // Look for SecureSubmission records
      for (const r of records) {
        let data = r.data || {};
        const recordName = r.recordName || '';
        const plaintext = typeof r === 'string' ? r : (r.plaintext || '');

        console.log('[Journalist] Checking record:', recordName, 'plaintext:', plaintext?.substring?.(0, 100));

        // Parse plaintext if available
        if (plaintext && typeof plaintext === 'string') {
          // Check if it's a SecureSubmission (has document_hash but NOT publication_hash)
          const hasDocumentHash = plaintext.includes('document_hash');
          const hasPublicationHash = plaintext.includes('publication_hash');
          const hasSeverityLevel = plaintext.includes('severity_level');

          if (hasDocumentHash && hasSeverityLevel && !hasPublicationHash) {
            console.log('[Journalist] Found SecureSubmission via plaintext analysis');

            // Extract severity from plaintext
            let severity = 3;
            const severityMatch = plaintext.match(/severity_level:\s*(\d+)u8/);
            if (severityMatch) {
              severity = parseInt(severityMatch[1]);
            }

            // Extract submission_id
            let submissionId = `record-${foundSubmissions.length}`;
            const idMatch = plaintext.match(/submission_id:\s*(\d+)field/);
            if (idMatch) {
              submissionId = idMatch[1].slice(0, 16) + '...';
            }

            // Extract document_hash for message lookup
            let documentHash: string | undefined;
            const docHashMatch = plaintext.match(/document_hash:\s*(\d+field(?:\.private)?)/);
            if (docHashMatch) {
              documentHash = docHashMatch[1];
              console.log('[Journalist] Extracted document_hash:', documentHash);
            }

            foundSubmissions.push({
              id: submissionId,
              companyHash: 'Encrypted',
              severity,
              timestamp: Date.now(),
              verified: plaintext.includes('is_verified: true'),
              credibilityScore: null,
              rawRecord: r,
              documentHash,  // Store for message lookup
            });
            continue;
          }
        }

        // Skip JournalistCredential records
        const isJournalistCredential = (
          recordName === 'JournalistCredential' ||
          (data.publication_hash !== undefined && data.trust_score !== undefined && data.is_active !== undefined)
        );

        if (isJournalistCredential) {
          console.log('[Journalist] Skipping JournalistCredential');
          continue;
        }

        // Skip InsiderCredential records (shouldn't be here, but just in case)
        const isInsiderCredential = (
          recordName === 'InsiderCredential' ||
          (data.company_hash !== undefined && data.department_hash !== undefined && !data.document_hash)
        );

        if (isInsiderCredential) {
          console.log('[Journalist] Skipping InsiderCredential');
          continue;
        }

        // Check if this looks like a SecureSubmission via data fields
        const isSecureSubmission = (
          recordName === 'SecureSubmission' ||
          (data.document_hash !== undefined && data.severity_level !== undefined)
        );

        if (isSecureSubmission || (Object.keys(data).length > 0 && !isJournalistCredential && !isInsiderCredential)) {
          let severity = 3;
          if (data.severity_level) {
            const match = String(data.severity_level).match(/(\d+)/);
            severity = match ? parseInt(match[1]) : 3;
          }

          // Get full document hash for message lookup
          const documentHash = data.document_hash ? String(data.document_hash) : undefined;

          foundSubmissions.push({
            id: data.submission_id || r.id || `record-${foundSubmissions.length}`,
            companyHash: documentHash
              ? `${documentHash.slice(0, 12)}...`
              : 'Encrypted',
            severity,
            timestamp: Date.now(),
            verified: data.is_verified === true || data.is_verified === 'true',
            credibilityScore: null,
            rawRecord: r,
            documentHash,  // Store full hash for message lookup
          });
        }
      }

      // Also fetch submissions from the API (cross-browser storage)
      console.log('[Journalist] Checking API for encrypted messages...');
      try {
        const apiResponse = await fetch(`/api/messages?list=true&recipient=${publicKey}`);
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('[Journalist] API messages for recipient:', apiData);

          if (apiData.messages && apiData.messages.length > 0) {
            for (const msg of apiData.messages) {
              // Check if we already have this submission
              const exists = foundSubmissions.some(s => s.id === msg.submissionId);
              if (!exists) {
                // Try to decrypt the message
                let decryptedMessage: string | undefined;
                try {
                  const decrypted = await retrieveAndDecryptMessage(msg.submissionId, publicKey!);
                  if (decrypted) {
                    decryptedMessage = decrypted;
                    console.log('[Journalist] Auto-decrypted message:', decrypted.substring(0, 50) + '...');
                  }
                } catch (decryptErr) {
                  console.log('[Journalist] Could not auto-decrypt:', decryptErr);
                }

                foundSubmissions.push({
                  id: msg.submissionId,
                  companyHash: 'From API',
                  severity: 3, // Default, will be updated when viewing
                  timestamp: msg.timestamp || Date.now(),
                  verified: false,
                  credibilityScore: null,
                  documentHash: msg.documentHash,
                  decryptedMessage,
                });
                console.log('[Journalist] Added submission from API:', msg.submissionId);
              }
            }
          }
        }
      } catch (apiErr) {
        console.log('[Journalist] Could not fetch from API:', apiErr);
      }

      // If still no submissions found via wallet, try checking recent program transactions
      if (foundSubmissions.length === 0) {
        console.log('[Journalist] No submissions in wallet or API, checking recent transactions...');
        try {
          const response = await fetch(
            `https://api.explorer.provable.com/v1/testnet/address/${publicKey}/transitions?limit=10`
          );
          if (response.ok) {
            const transitions = await response.json();
            console.log('[Journalist] Recent transitions:', transitions);

            // This is just informational - actual records need to be in wallet
          }
        } catch (e) {
          console.log('[Journalist] Could not fetch transitions:', e);
        }
      }

      console.log('[Journalist] Total submissions found:', foundSubmissions.length);
      setSubmissions(foundSubmissions);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setRecordsLoading(false);
    }
  }, [connected, publicKey, getUserRecords, getUserRecordPlaintexts]);

  // Fetch submissions when registered
  useEffect(() => {
    if (isRegistered && connected) {
      fetchSubmissions();
    }
  }, [isRegistered, connected, fetchSubmissions]);

  // Auto-refresh submissions every 10 seconds when registered (faster for demo)
  useEffect(() => {
    if (!isRegistered || !connected) return;

    const refreshInterval = setInterval(() => {
      console.log('[Journalist] Auto-refreshing submissions...');
      fetchSubmissions();
    }, 10000); // Refresh every 10 seconds for faster demo

    return () => clearInterval(refreshInterval);
  }, [isRegistered, connected, fetchSubmissions]);

  // Load submission from transaction ID
  const loadSubmissionByTxId = async (txIdToLoad: string) => {
    if (!txIdToLoad) return;

    setLoadingTx(true);
    setError(null);

    try {
      // Fetch transaction from Aleo API
      const response = await fetch(`https://api.explorer.provable.com/v1/testnet/transaction/${txIdToLoad}`);
      if (!response.ok) {
        throw new Error('Transaction not found');
      }

      const txData = await response.json();
      console.log('[Journalist] Transaction data:', txData);

      // Find the SecureSubmission record output
      const outputs = txData?.execution?.transitions?.[0]?.outputs || [];
      const recordOutput = outputs.find((o: any) => o.type === 'record');

      if (!recordOutput) {
        throw new Error('No submission record found in transaction');
      }

      // Parse inputs to get severity and other info
      const inputs = txData?.execution?.transitions?.[0]?.inputs || [];
      let severity = 3;

      // Look for severity in inputs (usually a u8 value)
      for (const input of inputs) {
        if (input.value && typeof input.value === 'string' && input.value.includes('u8')) {
          const match = input.value.match(/(\d+)u8/);
          if (match) {
            severity = parseInt(match[1]);
            break;
          }
        }
      }

      // Create submission object
      const newSubmission: Submission = {
        id: txIdToLoad,
        companyHash: 'From TX',
        severity,
        timestamp: Date.now(),
        verified: false,
        credibilityScore: null,
        rawRecord: recordOutput,
      };

      // Add to submissions if not already present
      setSubmissions(prev => {
        const exists = prev.some(s => s.id === txIdToLoad);
        if (exists) return prev;
        return [newSubmission, ...prev];
      });

      setManualTxId('');
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('[Journalist] Error loading transaction:', err);
      setError(err.message || 'Failed to load transaction');
    } finally {
      setLoadingTx(false);
    }
  };

  const handleRegister = async () => {
    if (!publication || !connected) return;

    setLoading(true);
    setError(null);
    try {
      // Call real contract
      const result = await registerJournalist(publication);

      if (result.success && result.transactionId) {
        setTxId(result.transactionId);

        const publicationHash = await hashToField(publication.toLowerCase());
        const credentialId = await hashToField(publication + Date.now());

        const credential = {
          owner: publicKey || '',
          publication_hash: publicationHash,
          trust_score: 100,
          verified_leaks: 0,
          credential_id: credentialId,
          is_active: true,
        };

        setJournalistCredential(credential);
        setIsRegistered(true);

        // Fetch submissions after registration
        setTimeout(() => fetchSubmissions(), 1000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (submission: Submission) => {
    if (!journalistCredential) return;

    setLoading(true);
    setError(null);
    try {
      // Call real contract for verification
      const result = await verifySubmission(
        JSON.stringify(journalistCredential),
        JSON.stringify(submission.rawRecord || submission),
        verifyScore
      );

      if (result.success && result.transactionId) {
        // Update local state
        setSubmissions(prev => prev.map(s =>
          s.id === submission.id
            ? { ...s, verified: true, credibilityScore: verifyScore }
            : s
        ));
        setSelectedSubmission(null);
        setTxId(result.transactionId);

        // Update journalist credential verified count
        if (journalistCredential) {
          setJournalistCredential({
            ...journalistCredential,
            verified_leaks: (journalistCredential.verified_leaks || 0) + 1,
          });
        }
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
    return colors[severity - 1] || colors[0];
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ['Minor', 'Moderate', 'Serious', 'Severe', 'Critical'];
    return labels[severity - 1] || 'Unknown';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Loading state while checking for existing credential */}
          {checkingCredential && connected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="card p-8 text-center">
                <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-green-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-zinc-400">Checking for existing journalist credentials...</p>
              </div>
            </motion.div>
          ) : !isRegistered ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="card p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Journalist Dashboard</h1>
                  <p className="text-zinc-400">
                    Register as a verified journalist to receive and verify anonymous submissions.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Publication Name
                    </label>
                    <input
                      type="text"
                      value={publication}
                      onChange={(e) => setPublication(e.target.value)}
                      placeholder="e.g., New York Times, Washington Post"
                      className="input-dark"
                    />
                    <p className="text-xs text-zinc-600 mt-1">
                      This will be hashed for your credential.
                    </p>
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">As a Journalist, you can:</h4>
                    <ul className="text-xs text-zinc-500 space-y-1">
                      <li>- Receive encrypted submissions from whistleblowers</li>
                      <li>- Verify insider credentials using ZK proofs</li>
                      <li>- Build reputation through verified leaks</li>
                      <li>- Distribute bounty rewards to verified sources</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {txId && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm">
                      Transaction: <a href={`https://testnet.aleo.info/transaction/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">{txId.slice(0, 20)}...</a>
                    </div>
                  )}

                  <button
                    onClick={handleRegister}
                    disabled={loading || aleoLoading || !publication || !connected}
                    className="btn-primary w-full"
                  >
                    {loading || aleoLoading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Signing Transaction...</span>
                      </span>
                    ) : !connected ? (
                      'Connect Wallet First'
                    ) : (
                      'Register as Journalist (Sign with Wallet)'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Journalist Dashboard</h1>
                  <p className="text-zinc-400">Review and verify anonymous submissions</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-500">Trust Score</div>
                    <div className="text-xl font-bold text-green-400">
                      {journalistCredential?.trust_score || 100}
                    </div>
                  </div>
                  <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-500">Verified</div>
                    <div className="text-xl font-bold text-green-400">
                      {journalistCredential?.verified_leaks || submissions.filter(s => s.verified).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="card p-4">
                  <div className="text-2xl font-bold text-green-400">{submissions.length}</div>
                  <div className="text-sm text-zinc-500">Total Submissions</div>
                  <div className="text-xs text-zinc-600 mt-1">From records</div>
                </div>
                <div className="card p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {submissions.filter(s => !s.verified).length}
                  </div>
                  <div className="text-sm text-zinc-500">Pending Review</div>
                </div>
                <div className="card p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {submissions.filter(s => s.verified).length}
                  </div>
                  <div className="text-sm text-zinc-500">Verified</div>
                </div>
                <div className="card p-4">
                  <div className="text-2xl font-bold text-red-400">
                    {submissions.filter(s => s.severity >= 4).length}
                  </div>
                  <div className="text-sm text-zinc-500">High Severity</div>
                </div>
              </div>

              {/* Load by Transaction ID */}
              <div className="card p-4 mb-6">
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Load Submission by Transaction ID</h3>
                <p className="text-xs text-zinc-500 mb-3">
                  If a whistleblower shared their submission transaction ID, paste it here to load it.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualTxId}
                    onChange={(e) => setManualTxId(e.target.value)}
                    placeholder="at1abc123... or 9706b427-acdb-..."
                    className="input-dark flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => loadSubmissionByTxId(manualTxId)}
                    disabled={loadingTx || !manualTxId}
                    className="btn-primary px-4"
                  >
                    {loadingTx ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Incoming Submissions</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={fetchSubmissions}
                    disabled={recordsLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg
                      className={`w-4 h-4 ${recordsLoading ? 'animate-spin' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{recordsLoading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  {lastRefresh && (
                    <span className="text-xs text-zinc-500">
                      Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Transaction Success */}
              {txId && (
                <div className="mb-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm">
                  Transaction: <a href={`https://testnet.aleo.info/transaction/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">{txId.slice(0, 30)}...</a>
                </div>
              )}

              {/* Submissions Table */}
              <div className="card overflow-hidden">
                {recordsLoading && submissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-green-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-zinc-400">Loading submissions from wallet...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">No Submissions Yet</h3>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                      Submissions will appear here when whistleblowers send leaks to your address.
                      Share your Aleo address with potential sources.
                    </p>
                    <div className="mt-4 p-3 bg-zinc-900 rounded-lg inline-block">
                      <div className="text-xs text-zinc-500 mb-1">Your Address</div>
                      <code className="text-green-400 text-sm">{publicKey}</code>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-900/50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-zinc-400">ID</th>
                          <th className="text-left p-4 text-sm font-medium text-zinc-400">Company</th>
                          <th className="text-left p-4 text-sm font-medium text-zinc-400">Severity</th>
                          <th className="text-left p-4 text-sm font-medium text-zinc-400">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-zinc-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {submissions.map((submission) => (
                          <tr key={submission.id} className="hover:bg-zinc-900/30">
                            <td className="p-4 font-mono text-sm">
                              {typeof submission.id === 'string' && submission.id.length > 16
                                ? `${submission.id.slice(0, 16)}...`
                                : submission.id}
                            </td>
                            <td className="p-4 font-mono text-sm text-zinc-400">{submission.companyHash}</td>
                            <td className="p-4">
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${getSeverityColor(submission.severity)}20`,
                                  color: getSeverityColor(submission.severity),
                                }}
                              >
                                {getSeverityLabel(submission.severity)}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-zinc-400">{formatDate(submission.timestamp)}</td>
                            <td className="p-4">
                              {submission.verified ? (
                                <span className="flex items-center space-x-1 text-green-400 text-sm">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Verified ({submission.credibilityScore}%)</span>
                                </span>
                              ) : (
                                <span className="text-yellow-400 text-sm">Pending</span>
                              )}
                            </td>
                            <td className="p-4">
                              {!submission.verified && (
                                <button
                                  onClick={async () => {
                                    // Try to decrypt the message when reviewing
                                    let decryptedMessage: string | undefined;
                                    if (publicKey) {
                                      // Try multiple lookup methods
                                      const lookupIds = [
                                        submission.id,  // Transaction ID (if loaded by txId) or submission_id field
                                        submission.documentHash,  // Document hash from record
                                        submission.rawRecord?.data?.document_hash,  // Raw document hash
                                      ].filter(Boolean);

                                      console.log('[Journalist] Trying to decrypt with IDs:', lookupIds);

                                      for (const lookupId of lookupIds) {
                                        try {
                                          const message = await retrieveAndDecryptMessage(lookupId!, publicKey);
                                          if (message) {
                                            decryptedMessage = message;
                                            console.log('[Journalist] Decrypted message with ID:', lookupId, message.substring(0, 50) + '...');
                                            break;
                                          }
                                        } catch (e) {
                                          console.log('[Journalist] Could not decrypt with ID:', lookupId, e);
                                        }
                                      }
                                    }
                                    setSelectedSubmission({ ...submission, decryptedMessage });
                                  }}
                                  className="text-green-400 hover:text-green-300 text-sm font-medium"
                                >
                                  Review
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Data Source Info */}
              <div className="mt-4 text-center text-xs text-zinc-600">
                Submissions loaded from wallet records via Leo Wallet
              </div>
            </motion.div>
          )}

          {/* Verification Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 max-w-lg w-full"
              >
                <h2 className="text-xl font-bold mb-4">Verify Submission</h2>
                <p className="text-zinc-400 mb-6">
                  Review this submission and assign a credibility score. This creates an on-chain verification record.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Submission ID:</span>
                    <span className="font-mono text-sm">
                      {typeof selectedSubmission.id === 'string' && selectedSubmission.id.length > 20
                        ? `${selectedSubmission.id.slice(0, 20)}...`
                        : selectedSubmission.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Company Hash:</span>
                    <span className="font-mono">{selectedSubmission.companyHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Severity:</span>
                    <span style={{ color: getSeverityColor(selectedSubmission.severity) }}>
                      {getSeverityLabel(selectedSubmission.severity)}
                    </span>
                  </div>
                </div>

                {/* Decrypted Message Content */}
                {selectedSubmission.decryptedMessage ? (
                  <div className="mb-6">
                    <div className="text-zinc-500 text-sm mb-2">Whistleblower Message:</div>
                    <div className="bg-zinc-900 p-4 rounded-lg border border-green-700/50">
                      <p className="text-green-400 whitespace-pre-wrap">{selectedSubmission.decryptedMessage}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-zinc-500 text-sm mb-2">Whistleblower Message:</div>
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                      <p className="text-zinc-500 italic">Message not available - may have been submitted before encryption was enabled, or from a different device.</p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Credibility Score: {verifyScore}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={verifyScore}
                    onChange={(e) => setVerifyScore(parseInt(e.target.value))}
                    className="w-full accent-green-400"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>Doubtful</span>
                    <span>Highly Credible</span>
                  </div>
                </div>

                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 mb-6">
                  <p className="text-xs text-zinc-500">
                    This will create an on-chain verification record and update verified_leak_count for the company.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVerify(selectedSubmission)}
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Signing...</span>
                      </span>
                    ) : (
                      'Verify Submission'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
