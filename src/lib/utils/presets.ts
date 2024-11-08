import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha1 } from '@noble/hashes/sha1'
import { sha256 } from '@noble/hashes/sha256'
import {
  getP2PKHAddress,
  getP2SHAddress,
  getP2TRAddress,
  getP2WPKHAddress,
  getP2WSHAddress,
} from './bitcoin/address'
import { sha256d } from './hash'
import { createPublicKey } from './secp256k1'
import {
  bytesToBigIntBE,
  bytesToBigIntLE,
  uint8ArrayReverse,
} from './uintarray'
import { isNotUndefined } from './validation'

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
    fn: sha256d,
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
    name: 'Reverse',
    textInput: false,
    fn: uint8ArrayReverse,
  },
  {
    name: 'Hex to decimal (LE)',
    textInput: false,
    fn: (arg) => bytesToBigIntLE(arg).toString(),
  },
  {
    name: 'Hex to decimal (BE)',
    textInput: false,
    fn: (arg) => bytesToBigIntBE(arg).toString(),
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

export const presetToId = (preset: CustomFunction): string =>
  preset.name
    .toLowerCase()
    .replaceAll(/(^\W+|\W+$)/g, '')
    .replaceAll(/\W+/g, '_')

export const getPresetById = (id: string): CustomFunction | undefined =>
  presets.find((preset) => presetToId(preset) === id)

export const serializeCustomSequence = (functions: CustomFunction[]): string =>
  functions.map(presetToId).join(',')

export const parseCustomSequence = (ids: string): CustomFunction[] =>
  ids
    .split(',')
    .map((id) => getPresetById(id.trim()))
    .filter(isNotUndefined)
