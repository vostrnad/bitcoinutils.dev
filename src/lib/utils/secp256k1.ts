import { CURVE, getPublicKey } from '@noble/secp256k1'
import { bytesToBigIntBE } from './uintarray'
import { validateInputLength } from './validation'

export const createPublicKey = (
  privateKey: Uint8Array,
  compressed: boolean,
): Uint8Array => {
  validateInputLength(privateKey, 32)
  const privateKeyBitInt = bytesToBigIntBE(privateKey)
  if (privateKeyBitInt === 0n || privateKeyBitInt >= CURVE.n) {
    throw new Error('Private key out of range')
  }
  return getPublicKey(privateKey, compressed)
}
