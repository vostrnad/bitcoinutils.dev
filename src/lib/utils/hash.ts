import { sha256 } from '@noble/hashes/sha256'

export const sha256d = (input: Uint8Array | string): Uint8Array =>
  sha256(sha256(input))
