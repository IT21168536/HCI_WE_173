import { createHash } from 'node:crypto';
export enum CryptoDigestAlgorithm { SHA256 = 'SHA-256' }
export async function digestStringAsync(_alg: CryptoDigestAlgorithm, data: string) {
  return createHash('sha256').update(data).digest('hex');
}
