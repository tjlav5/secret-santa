/**
 * WebCrypto AES-256-GCM helpers for encrypting Secret Santa assignments at rest.
 *
 * Each participant's assignment (`recipientId`) is encrypted with a key derived via SHA-256
 * from `(eventId, giverToken)`. Without the giver's private capability token, database rows
 * do not reveal who any participant was matched with.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function deriveParticipantKey(
  eventId: string,
  giverToken: string,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  const material = encoder.encode(`npp-seal-v1:${eventId}:${giverToken}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, [usage]);
}

export async function encryptAssignment(
  eventId: string,
  giverToken: string,
  recipientId: string
): Promise<string> {
  const key = await deriveParticipantKey(eventId, giverToken, 'encrypt');
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(recipientId)
  );
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptAssignment(
  eventId: string,
  giverToken: string,
  encryptedPayload: string | null | undefined
): Promise<string | null> {
  if (!encryptedPayload) return null;
  const dotIdx = encryptedPayload.indexOf('.');
  if (dotIdx <= 0) return null;

  try {
    const iv = base64ToBytes(encryptedPayload.slice(0, dotIdx));
    const cipherBytes = base64ToBytes(encryptedPayload.slice(dotIdx + 1));
    const key = await deriveParticipantKey(eventId, giverToken, 'decrypt');
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );
    return decoder.decode(plainBuffer);
  } catch {
    return null;
  }
}
