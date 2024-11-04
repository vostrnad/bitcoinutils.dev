import {
  OP_0,
  OP_1NEGATE,
  OP_PUSHDATA1,
  OP_PUSHDATA2,
  OP_PUSHDATA4,
  getOpcodeByName,
} from './opcodes'
import {
  concatBytes,
  hexToBytes,
  uintLEToBytesFixed,
} from '$lib/utils/uintarray'
import { isValidHex } from '$lib/utils/validation'

const bytesToMinimalPush = (bytes: Uint8Array): Uint8Array => {
  if (bytes.length === 0) {
    return concatBytes([OP_0])
  }
  if (bytes.length === 1) {
    const byte = bytes[0]
    if (byte >= 1 && byte <= 16) {
      return concatBytes([byte + 0x50])
    }
    if (byte === 0x81) {
      return concatBytes([OP_1NEGATE])
    }
  }
  if (bytes.length <= 75) {
    return concatBytes([bytes.length, bytes])
  }
  if (bytes.length <= 255) {
    return concatBytes([OP_PUSHDATA1, bytes.length, bytes])
  }
  if (bytes.length <= 65535) {
    return concatBytes([
      OP_PUSHDATA2,
      uintLEToBytesFixed(bytes.length, 2),
      bytes,
    ])
  }
  return concatBytes([OP_PUSHDATA4, uintLEToBytesFixed(bytes.length, 4), bytes])
}

export const encodeScript = (input: string): Uint8Array => {
  input = input.trim()

  if (input.length === 0) return new Uint8Array()

  const tokens = input.toUpperCase().split(/\s+/g)

  const scriptChunks: Array<Uint8Array | number> = []

  for (const token of tokens) {
    const chunk = getScriptChunkFromToken(token)
    if (chunk === undefined) {
      const errorMessage = token.startsWith('OP_')
        ? `${token} is not a valid opcode`
        : `${token} is not a valid byte array`
      throw new Error(errorMessage)
    }
    scriptChunks.push(chunk)
  }

  return concatBytes(scriptChunks)
}

const getScriptChunkFromToken = (token: string) => {
  if (token.startsWith('OP_')) {
    return getOpcodeByName(token)
  }
  if (token === '0') {
    return OP_0
  }
  if (isValidHex(token)) {
    return bytesToMinimalPush(hexToBytes(token))
  }
}

export const isValidScriptToken = (token: string): boolean => {
  return getScriptChunkFromToken(token) !== undefined
}
