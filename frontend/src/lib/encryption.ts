/**
 * Message encryption for TruthChain
 * Encrypts whistleblower messages so only the intended journalist can read them
 *
 * Uses Next.js API routes for cross-browser storage instead of localStorage
 */

// Simple encryption using Web Crypto API
// In production, this would use proper public key encryption with Aleo keys

const API_BASE = '/api/messages';

interface EncryptedMessage {
  submissionId: string;
  documentHash: string;
  encryptedContent: string;
  iv: string;
  recipientAddress: string;
  timestamp: number;
}

// Derive an encryption key from the journalist's address
// This is a simplified approach - in production, use proper ECDH key exchange
async function deriveKey(journalistAddress: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(journalistAddress + salt),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a message for a specific journalist
export async function encryptMessage(
  message: string,
  journalistAddress: string,
  submissionId: string,
  documentHash: string
): Promise<{ encryptedContent: string; iv: string }> {
  const encoder = new TextEncoder();

  // Use submission ID as salt for unique key per submission
  const key = await deriveKey(journalistAddress, submissionId);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the message
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(message)
  );

  // Convert to base64 for storage
  const encryptedContent = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return { encryptedContent, iv: ivBase64 };
}

// Decrypt a message using the journalist's address
export async function decryptMessage(
  encryptedContent: string,
  iv: string,
  journalistAddress: string,
  submissionId: string
): Promise<string> {
  const decoder = new TextDecoder();

  // Derive the same key
  const key = await deriveKey(journalistAddress, submissionId);

  // Convert from base64
  const encryptedBuffer = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  // Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedBuffer
  );

  return decoder.decode(decryptedBuffer);
}

// Store encrypted message via API (cross-browser compatible)
export async function storeEncryptedMessage(
  submissionId: string,
  documentHash: string,
  encryptedContent: string,
  iv: string,
  recipientAddress: string
): Promise<void> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submissionId,
        documentHash,
        encryptedContent,
        iv,
        recipientAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to store message');
    }

    const result = await response.json();
    console.log('[Encryption] Stored encrypted message via API:', submissionId, result);
  } catch (error) {
    console.error('[Encryption] Error storing message via API:', error);
    // Fallback to localStorage if API fails (same-browser scenario)
    try {
      const STORAGE_KEY = 'truthchain_encrypted_messages';
      const stored = localStorage.getItem(STORAGE_KEY);
      const messages = stored ? JSON.parse(stored) : {};

      const newMessage: EncryptedMessage = {
        submissionId,
        documentHash,
        encryptedContent,
        iv,
        recipientAddress,
        timestamp: Date.now(),
      };

      messages[documentHash] = newMessage;
      messages[submissionId] = newMessage;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      console.log('[Encryption] Fallback: Stored in localStorage');
    } catch (localError) {
      console.error('[Encryption] LocalStorage fallback also failed:', localError);
    }
  }
}

// Retrieve encrypted message by document hash or submission ID via API
export async function getEncryptedMessage(identifier: string): Promise<EncryptedMessage | null> {
  try {
    const response = await fetch(`${API_BASE}?id=${encodeURIComponent(identifier)}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[Encryption] Message not found in API for:', identifier);
        // Try localStorage fallback
        return getFromLocalStorage(identifier);
      }
      throw new Error('Failed to retrieve message');
    }

    const result = await response.json();
    if (result.found && result.message) {
      console.log('[Encryption] Retrieved message from API for:', identifier);
      return result.message as EncryptedMessage;
    }

    return getFromLocalStorage(identifier);
  } catch (error) {
    console.error('[Encryption] Error retrieving from API:', error);
    // Fallback to localStorage
    return getFromLocalStorage(identifier);
  }
}

// LocalStorage fallback for backwards compatibility
function getFromLocalStorage(identifier: string): EncryptedMessage | null {
  try {
    const STORAGE_KEY = 'truthchain_encrypted_messages';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const messages = JSON.parse(stored);
    const message = messages[identifier];

    if (message) {
      console.log('[Encryption] Found message in localStorage fallback');
    }

    return message || null;
  } catch {
    return null;
  }
}

// Get all messages for a specific journalist address
export async function getMessagesForJournalist(journalistAddress: string): Promise<EncryptedMessage[]> {
  try {
    // First try API
    const response = await fetch(`${API_BASE}?recipient=${encodeURIComponent(journalistAddress)}`, {
      method: 'OPTIONS',
    });

    if (response.ok) {
      const result = await response.json();
      if (result.messages) {
        return result.messages;
      }
    }
  } catch (error) {
    console.error('[Encryption] Error fetching from API:', error);
  }

  // Fallback to localStorage
  try {
    const STORAGE_KEY = 'truthchain_encrypted_messages';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const messages = JSON.parse(stored);
    return Object.values(messages).filter(
      (m: any) => m.recipientAddress === journalistAddress
    ) as EncryptedMessage[];
  } catch {
    return [];
  }
}

// Helper to encrypt and store in one call
export async function encryptAndStoreMessage(
  message: string,
  journalistAddress: string,
  submissionId: string,
  documentHash: string
): Promise<void> {
  const { encryptedContent, iv } = await encryptMessage(
    message,
    journalistAddress,
    submissionId,
    documentHash
  );

  await storeEncryptedMessage(
    submissionId,
    documentHash,
    encryptedContent,
    iv,
    journalistAddress
  );
}

// Helper to retrieve and decrypt in one call
export async function retrieveAndDecryptMessage(
  identifier: string,
  journalistAddress: string
): Promise<string | null> {
  const encrypted = await getEncryptedMessage(identifier);

  if (!encrypted) {
    console.log('[Encryption] No encrypted message found for:', identifier);
    return null;
  }

  // Verify this message is for this journalist
  if (encrypted.recipientAddress !== journalistAddress) {
    console.error('[Encryption] Message not intended for this journalist');
    return null;
  }

  try {
    return await decryptMessage(
      encrypted.encryptedContent,
      encrypted.iv,
      journalistAddress,
      encrypted.submissionId
    );
  } catch (error) {
    console.error('[Encryption] Failed to decrypt message:', error);
    return null;
  }
}
