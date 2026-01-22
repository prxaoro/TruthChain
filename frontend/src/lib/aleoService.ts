// TruthChain Aleo Service - Real blockchain integration
import { Account, ProgramManager, AleoNetworkClient, NetworkRecordProvider } from '@provablehq/sdk';

// Configuration
export const NETWORK_URL = 'https://api.explorer.provable.com/v1';
export const PROGRAM_ID = 'whistleblower_v1.aleo';

// Network client for reading on-chain state
let networkClient: AleoNetworkClient | null = null;

export function getNetworkClient(): AleoNetworkClient {
  if (!networkClient) {
    networkClient = new AleoNetworkClient(NETWORK_URL);
  }
  return networkClient;
}

// Get program manager for executing transactions
export function getProgramManager(privateKey?: string): ProgramManager {
  const client = getNetworkClient();

  if (privateKey) {
    const account = new Account({ privateKey });
    return new ProgramManager(NETWORK_URL, undefined, undefined);
  }

  return new ProgramManager(NETWORK_URL, undefined, undefined);
}

// Read mapping value from on-chain state
export async function readMapping(
  mappingName: string,
  key: string
): Promise<string | null> {
  try {
    const client = getNetworkClient();
    const value = await client.getProgramMappingValue(PROGRAM_ID, mappingName, key);
    return value;
  } catch (error) {
    console.error(`Error reading mapping ${mappingName}[${key}]:`, error);
    return null;
  }
}

// Read company submission count
export async function getCompanySubmissionCount(companyHash: string): Promise<number> {
  const value = await readMapping('company_submission_count', companyHash);
  if (value) {
    // Parse u64 from response
    const match = value.match(/(\d+)u64/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

// Read verified leak count for company
export async function getVerifiedLeakCount(companyHash: string): Promise<number> {
  const value = await readMapping('verified_leak_count', companyHash);
  if (value) {
    const match = value.match(/(\d+)u64/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

// Read bounty pool total
export async function getBountyPool(): Promise<number> {
  const value = await readMapping('bounty_pool', '0u8');
  if (value) {
    const match = value.match(/(\d+)u64/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

// Read journalist score
export async function getJournalistScore(address: string): Promise<number> {
  const value = await readMapping('journalist_scores', address);
  if (value) {
    const match = value.match(/(\d+)u64/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

// Check if submission is verified
export async function isSubmissionVerified(submissionId: string): Promise<boolean> {
  const value = await readMapping('submission_verified', submissionId);
  return value === 'true';
}

// Get program info
export async function getProgramInfo(): Promise<any> {
  try {
    const client = getNetworkClient();
    const program = await client.getProgram(PROGRAM_ID);
    return program;
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
}

// Format transition inputs
export function formatInputs(inputs: (string | number | boolean)[]): string[] {
  return inputs.map(input => {
    if (typeof input === 'number') {
      return `${input}u64`;
    }
    if (typeof input === 'boolean') {
      return input.toString();
    }
    return input;
  });
}

// Parse record from transaction output
export function parseRecord(recordString: string): Record<string, any> {
  try {
    // Remove the outer braces and parse
    const cleaned = recordString.trim();
    const fields: Record<string, any> = {};

    // Simple parsing for common record format
    const matches = cleaned.matchAll(/(\w+):\s*([^,}]+)/g);
    for (const match of matches) {
      const key = match[1];
      let value = match[2].trim();

      // Remove .private or .public suffix
      value = value.replace(/\.(private|public)$/, '');

      fields[key] = value;
    }

    return fields;
  } catch (error) {
    console.error('Error parsing record:', error);
    return {};
  }
}

// Transaction status check
export async function getTransactionStatus(txId: string): Promise<string> {
  try {
    const client = getNetworkClient();
    const tx = await client.getTransaction(txId);
    return tx ? 'confirmed' : 'pending';
  } catch (error) {
    return 'unknown';
  }
}

// Wait for transaction confirmation
export async function waitForTransaction(
  txId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTransactionStatus(txId);
    if (status === 'confirmed') {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

// Estimate fee for transaction
export async function estimateFee(
  transitionName: string,
  inputs: string[]
): Promise<number> {
  // Base fee estimation (in microcredits)
  const baseFee = 100000; // 0.1 credits

  // Add complexity based on transition
  const complexityMultiplier: Record<string, number> = {
    register_insider: 1.5,
    submit_leak: 2.0,
    register_journalist: 1.5,
    verify_submission: 1.8,
    fund_bounty_pool: 1.2,
    claim_bounty: 1.3,
  };

  const multiplier = complexityMultiplier[transitionName] || 1.0;
  return Math.ceil(baseFee * multiplier);
}
