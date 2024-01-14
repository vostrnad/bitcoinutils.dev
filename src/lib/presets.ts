import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha1 } from '@noble/hashes/sha1'
import { sha256 } from '@noble/hashes/sha256'
import {
  getP2PKHAddress,
  getP2SHAddress,
  getP2TRAddress,
  getP2WPKHAddress,
  getP2WSHAddress,
} from './bitcoin'
import { createPublicKey } from '$lib/secp256k1'

export interface CustomFunction {
  name: string
  textInput: boolean
  fn: (input: Uint8Array) => Uint8Array | string
}

export const presets: CustomFunction[] = [
  {
    name: 'SHA256',
    textInput: true,
    fn: sha256,
  },
  {
    name: 'RIPEMD160',
    textInput: true,
    fn: ripemd160,
  },
  {
    name: 'HASH256',
    textInput: true,
    fn: (arg) => sha256(sha256(arg)),
  },
  {
    name: 'HASH160',
    textInput: true,
    fn: (arg) => ripemd160(sha256(arg)),
  },
  {
    name: 'SHA1',
    textInput: true,
    fn: sha1,
  },
  {
    name: 'Public key (uncompressed)',
    textInput: false,
    fn: (arg) => createPublicKey(arg, false),
  },
  {
    name: 'Public key (compressed)',
    textInput: false,
    fn: (arg) => createPublicKey(arg, true),
  },
  {
    name: 'Public key (x-only)',
    textInput: false,
    fn: (arg) => createPublicKey(arg, true).slice(1),
  },
  {
    name: 'Bitcoin address (P2PKH)',
    textInput: false,
    fn: getP2PKHAddress,
  },
  {
    name: 'Bitcoin address (P2SH)',
    textInput: false,
    fn: getP2SHAddress,
  },
  {
    name: 'Bitcoin address (P2WPKH)',
    textInput: false,
    fn: getP2WPKHAddress,
  },
  {
    name: 'Bitcoin address (P2WSH)',
    textInput: false,
    fn: getP2WSHAddress,
  },
  {
    name: 'Bitcoin address (P2TR)',
    textInput: false,
    fn: getP2TRAddress,
  },
]
