import { sha256 } from '@noble/hashes/sha256'
import { base58check, bech32, bech32m } from '@scure/base'
import { uint8ArrayConcat } from './uintarray'
import { validateInputLength } from './validation'

export const getP2PKHAddress = (publicKeyHash: Uint8Array): string => {
  validateInputLength(publicKeyHash, 20)
  return base58check(sha256).encode(uint8ArrayConcat([0x00, publicKeyHash]))
}

export const getP2SHAddress = (scriptHash: Uint8Array): string => {
  validateInputLength(scriptHash, 20)
  return base58check(sha256).encode(uint8ArrayConcat([0x05, scriptHash]))
}

export const getP2WPKHAddress = (publicKeyHash: Uint8Array): string => {
  validateInputLength(publicKeyHash, 20)
  return bech32.encode('bc', [0, ...bech32.toWords(publicKeyHash)])
}

export const getP2WSHAddress = (scriptHash: Uint8Array): string => {
  validateInputLength(scriptHash, 32)
  return bech32.encode('bc', [0, ...bech32.toWords(scriptHash)])
}

export const getP2TRAddress = (publicKey: Uint8Array): string => {
  validateInputLength(publicKey, 32)
  return bech32m.encode('bc', [1, ...bech32m.toWords(publicKey)])
}
