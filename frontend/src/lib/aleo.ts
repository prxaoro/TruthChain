// TruthChain Aleo SDK Integration
// Wrapper for interacting with the whistleblower_v1.aleo program

export const PROGRAM_ID = 'whistleblower_v1.aleo';

// Hash a string to field using SHA-256 and convert to Aleo field format
// Aleo fields are decimal numbers, not hex strings
export async function hashToField(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convert to BigInt (only use first 31 bytes to stay within field modulus)
  let bigIntValue = BigInt(0);
  for (let i = 0; i < 31; i++) {
    bigIntValue = (bigIntValue << BigInt(8)) + BigInt(hashArray[i]);
  }

  return `${bigIntValue.toString()}field`;
}

// Generate a random scalar for salt
// Aleo scalars are decimal numbers
export function generateSalt(): string {
  const array = new Uint8Array(31); // 31 bytes to stay within scalar range
  crypto.getRandomValues(array);

  // Convert to BigInt
  let bigIntValue = BigInt(0);
  for (let i = 0; i < array.length; i++) {
    bigIntValue = (bigIntValue << BigInt(8)) + BigInt(array[i]);
  }

  return `${bigIntValue.toString()}scalar`;
}

// Format address for Aleo
export function formatAddress(address: string): string {
  if (address.startsWith('aleo1')) {
    return address;
  }
  return address;
}

// Prepare register_insider inputs
export async function prepareRegisterInsiderInputs(
  companyName: string,
  department: string,
  seniority: number,
  ownerAddress: string
): Promise<string[]> {
  const companyHash = await hashToField(companyName.toLowerCase());
  const departmentHash = await hashToField(department.toLowerCase());
  const salt = generateSalt();

  return [
    companyHash,
    departmentHash,
    `${seniority}u8`,
    salt,
    ownerAddress
  ];
}

// Prepare submit_leak inputs
export async function prepareSubmitLeakInputs(
  credentialJson: string,
  documentContent: string,
  severity: number,
  recipientAddress: string
): Promise<string[]> {
  const documentHash = await hashToField(documentContent);
  const salt = generateSalt();

  return [
    credentialJson,
    documentHash,
    `${severity}u8`,
    recipientAddress,
    salt
  ];
}

// Prepare register_journalist inputs
export async function prepareRegisterJournalistInputs(
  publicationName: string,
  ownerAddress: string
): Promise<string[]> {
  const publicationHash = await hashToField(publicationName.toLowerCase());
  const salt = generateSalt();

  return [
    publicationHash,
    salt,
    ownerAddress
  ];
}

// Encrypt document for submission (using Web Crypto API)
export async function encryptDocument(
  content: string,
  recipientPublicKey: string
): Promise<{ encrypted: string; iv: string }> {
  // Generate a random AES key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the content
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(content)
  );

  // Export key and encrypted data
  const exportedKey = await crypto.subtle.exportKey('raw', key);

  return {
    encrypted: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64')
  };
}

// Severity level descriptions
export const SEVERITY_LEVELS = [
  { level: 1, label: 'Low', description: 'Minor policy violation', color: '#888' },
  { level: 2, label: 'Medium', description: 'Significant misconduct', color: '#ffaa00' },
  { level: 3, label: 'High', description: 'Serious ethical violation', color: '#ff8800' },
  { level: 4, label: 'Critical', description: 'Major fraud or safety risk', color: '#ff4444' },
  { level: 5, label: 'Emergency', description: 'Immediate public danger', color: '#ff0000' },
];

// Company categories
export const COMPANY_CATEGORIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Government',
  'Defense',
  'Energy',
  'Manufacturing',
  'Pharmaceutical',
  'Media',
  'Other'
];

// Program transitions for reference
export const PROGRAM_TRANSITIONS = {
  register_insider: 'register_insider',
  verify_insider_credential: 'verify_insider_credential',
  submit_leak: 'submit_leak',
  register_journalist: 'register_journalist',
  verify_submission: 'verify_submission',
  fund_bounty_pool: 'fund_bounty_pool',
  create_bounty_reward: 'create_bounty_reward',
  claim_bounty: 'claim_bounty',
  prove_insider_status: 'prove_insider_status',
  get_company_hash: 'get_company_hash',
} as const;
