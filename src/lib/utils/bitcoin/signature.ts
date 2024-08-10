import { mapObject } from '$lib/utils/object'

export interface DecodeDERSignatureResult {
  error?: {
    text: string
    location?: [number, number]
  }
  r?: {
    value: Uint8Array
    pos: number
  }
  s?: {
    value: Uint8Array
    pos: number
  }
  sighash?: {
    value: number
    pos: number
  }
}

export const sighashNames: Record<number, string | undefined> = {
  0x01: 'all',
  0x02: 'none',
  0x03: 'single',
  0x81: 'all-acp',
  0x82: 'none-acp',
  0x83: 'single-acp',
}

export const sighashBytes: Record<string, number | undefined> = mapObject(
  sighashNames,
  (byte, name) => (name ? [name, byte] : undefined),
)

export const getSighashFlagName = (byte: number): string | undefined => {
  return sighashNames[byte]
}

export const getSighashFlagByte = (name: string): number | undefined => {
  return sighashBytes[name]
}

const getExcessPaddingBytes = (array: Uint8Array) => {
  let excessBytes = 0
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] === 0 && array[i + 1] < 0x80) {
      excessBytes++
    } else break
  }
  return excessBytes
}

export const tryDecodeDERSignature = (
  sig: Uint8Array,
): DecodeDERSignatureResult => {
  if (sig.length === 0) return {}

  if (sig[0] !== 0x30) {
    return { error: { text: 'First byte must be 0x30', location: [0, 1] } }
  }

  const totalLengthPos = 1

  if (sig.length === totalLengthPos) {
    return { error: { text: 'Missing total length byte' } }
  }

  const totalLength = sig[totalLengthPos]

  const rMarkerPos = 2

  if (sig.length === rMarkerPos) {
    return { error: { text: 'Missing r-value marker byte' } }
  }

  if (sig[rMarkerPos] !== 0x02) {
    return {
      error: {
        text: 'r-value marker byte must be 0x02',
        location: [rMarkerPos, rMarkerPos + 1],
      },
    }
  }

  const rLengthPos = 3

  if (sig.length === rLengthPos) {
    return { error: { text: 'Missing r-value length byte' } }
  }

  const rLength = sig[rLengthPos]

  if (rLength === 0) {
    return {
      error: {
        text: 'r-value length cannot be 0',
        location: [rLengthPos, rLengthPos + 1],
      },
    }
  }

  const rPos = 4

  if (rPos + rLength > sig.length) {
    return {
      error: { text: 'Incomplete r-value', location: [rPos, sig.length] },
    }
  }

  const res: DecodeDERSignatureResult = {}

  res.r = {
    value: sig.slice(rPos, rPos + rLength),
    pos: rPos,
  }

  const rLengthNoPadding = rLength - (sig[rPos] === 0 ? 1 : 0)

  const sMarkerPos = rPos + rLength

  if (sig.length === sMarkerPos) {
    return { ...res, error: { text: 'Missing s-value marker byte' } }
  }

  if (sig[sMarkerPos] !== 0x02) {
    return {
      ...res,
      error: {
        text: 's-value marker byte must be 0x02',
        location: [sMarkerPos, sMarkerPos + 1],
      },
    }
  }

  const sLengthPos = sMarkerPos + 1

  if (sig.length === sLengthPos) {
    return { ...res, error: { text: 'Missing s-value length byte' } }
  }

  const sLength = sig[sLengthPos]

  if (sLength === 0) {
    return {
      ...res,
      error: {
        text: 's-value length cannot be 0',
        location: [sLengthPos, sLengthPos + 1],
      },
    }
  }

  const sPos = sLengthPos + 1

  if (sPos + sLength > sig.length) {
    return {
      ...res,
      error: { text: 'Incomplete s-value', location: [sPos, sig.length] },
    }
  }

  res.s = {
    value: sig.slice(sPos, sPos + sLength),
    pos: sPos,
  }

  const sLengthNoPadding = sLength - (sig[sPos] === 0 ? 1 : 0)

  const sighashPos = sPos + sLength

  if (sig.length === sighashPos) {
    return { ...res, error: { text: 'Missing sighash byte' } }
  }

  res.sighash = {
    value: sig[sighashPos],
    pos: sighashPos,
  }

  const endPos = sighashPos + 1

  if (sig.length > endPos) {
    return {
      ...res,
      error: {
        text: 'Extra bytes at the end of signature',
        location: [endPos, sig.length],
      },
    }
  }

  if (totalLength !== sig.length - 3) {
    return {
      ...res,
      error: {
        text: `Incorrect length byte (should be ${(sig.length - 3).toString(
          16,
        )})`,
        location: [totalLengthPos, totalLengthPos + 1],
      },
    }
  }

  if (!(res.sighash.value in sighashNames)) {
    return {
      ...res,
      error: {
        text: 'Invalid sighash flag',
        location: [sighashPos, sighashPos + 1],
      },
    }
  }

  if (rLengthNoPadding > 32) {
    return {
      ...res,
      error: {
        text: 'r-value too large',
        location: [rPos, rPos + rLength],
      },
    }
  }

  if (sLengthNoPadding > 32) {
    return {
      ...res,
      error: {
        text: 's-value too large',
        location: [sPos, sPos + sLength],
      },
    }
  }

  if (sig[rPos] >= 0x80) {
    return {
      ...res,
      error: {
        text: 'Missing r-value zero padding byte',
        location: [rPos, rPos + 1],
      },
    }
  }

  if (sig[sPos] >= 0x80) {
    return {
      ...res,
      error: {
        text: 'Missing s-value zero padding byte',
        location: [sPos, sPos + 1],
      },
    }
  }

  const excessBytesR = getExcessPaddingBytes(res.r.value)

  if (excessBytesR) {
    return {
      ...res,
      error: {
        text: 'r-value has excessive zero padding',
        location: [rPos, rPos + excessBytesR],
      },
    }
  }

  const excessBytesS = getExcessPaddingBytes(res.s.value)

  if (excessBytesS) {
    return {
      ...res,
      error: {
        text: 's-value has excessive zero padding',
        location: [sPos, sPos + excessBytesS],
      },
    }
  }

  return res
}

export const serializeDERSignature = (
  r: Uint8Array,
  s: Uint8Array,
  sighash: number,
): Uint8Array => {
  const rPrepend = r.length === 0 || Boolean(r[0] & 0x80)
  const sPrepend = s.length === 0 || Boolean(s[0] & 0x80)

  const rPrependOffset = rPrepend ? 1 : 0
  const sPrependOffset = sPrepend ? 1 : 0

  const rLength = r.length + rPrependOffset
  const sLength = s.length + sPrependOffset

  const rMarkerPos = 2
  const rLengthPos = 3
  const rPos = 4

  const sMarkerPos = rPos + rLength
  const sLengthPos = sMarkerPos + 1
  const sPos = sLengthPos + 1

  const sighashPos = sPos + sLength

  const sig = new Uint8Array(rLength + sLength + 7)
  sig[0] = 0x30
  sig[1] = rLength + sLength + 4
  sig[rMarkerPos] = 0x02
  sig[rLengthPos] = rLength
  sig.set(r, rPos + rPrependOffset)
  sig[sMarkerPos] = 0x02
  sig[sLengthPos] = sLength
  sig.set(s, sPos + sPrependOffset)
  sig[sighashPos] = sighash

  return sig
}
