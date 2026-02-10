export const PROGRAM_ID = 'truthchain_v2.aleo';
export const NETWORK_URL = 'https://api.explorer.provable.com/v1';

export const SEVERITY_LEVELS = [
  { value: 1, label: 'Low', description: 'Minor policy violation', color: '#4ade80' },
  { value: 2, label: 'Medium', description: 'Significant misconduct', color: '#facc15' },
  { value: 3, label: 'High', description: 'Serious ethical violation', color: '#fb923c' },
  { value: 4, label: 'Critical', description: 'Major fraud or safety risk', color: '#f87171' },
  { value: 5, label: 'Emergency', description: 'Immediate public danger', color: '#ef4444' },
];

// Convert a string to a valid Aleo field element via SHA-256
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

// Generate a unique ID by hashing address + timestamp + random
export async function generateId(address: string): Promise<string> {
  const seed = address + Date.now().toString() + Math.random().toString();
  return hashToField(seed);
}

// Format an Aleo address for display
export function formatAddress(addr: string): string {
  if (!addr || addr.length < 14) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}
