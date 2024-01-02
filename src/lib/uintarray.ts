import { sum } from './utils/array'

const hexes = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0'),
)

export const uint8ArrayToHex = (array: Uint8Array): string => {
  let res = ''
  for (const byte of array) {
    res += hexes[byte]
  }
  return res
}

const hexToNum = (hex: string, pos: number) => {
  // eslint-disable-next-line unicorn/prefer-code-point
  const code = hex.charCodeAt(pos)
  if (code >= 48 && code <= 57) return code - 48
  if (code >= 97 && code <= 102) return code - 87
  if (code >= 65 && code <= 70) return code - 55
  throw new Error('Character is not a hex number')
}

export const hexToUint8Array = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string has odd length')
  }
  const len = hex.length / 2
  const array = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    const h = i * 2
    const a = hexToNum(hex, h)
    const b = hexToNum(hex, h + 1)
    array[i] = 16 * a + b
  }
  return array
}

export const uint8ArrayToUIntLE = (array: Uint8Array): number => {
  return sum(Array.from(array).map((byte, index) => byte * 256 ** index))
}

export const uint8ArrayToIntLE = (array: Uint8Array): number => {
  const uint = uint8ArrayToUIntLE(array)
  const midpoint = 128 * 256 ** (array.length - 1)
  if (uint < midpoint) {
    return uint
  }
  return midpoint - uint
}

export class OutOfRangeError extends Error {}

export class Uint8ArrayReader {
  private readonly array: Uint8Array
  public position = 0

  constructor(array: Uint8Array) {
    this.array = array
  }

  public read(size: number): Uint8Array {
    const endPosition = this.position + size
    this.checkIfOutOfRange(endPosition)
    const res = this.array.subarray(this.position, endPosition)
    this.position = endPosition
    return res
  }

  public readByte(): number {
    this.checkIfOutOfRange(this.position + 1)
    return this.array[this.position++]
  }

  public readUIntLE(size: number): number {
    return uint8ArrayToUIntLE(this.read(size))
  }

  private checkIfOutOfRange(endPosition: number) {
    if (endPosition > this.array.length) {
      throw new OutOfRangeError()
    }
  }
}
