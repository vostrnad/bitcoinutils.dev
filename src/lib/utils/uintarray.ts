import { sum } from './array'

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

export const uint8ArrayToBigIntLE = (input: Uint8Array): bigint => {
  let res = 0n
  let p = 1n
  for (const byte of input) {
    res += BigInt(byte) * p
    p *= 256n
  }
  return res
}

export const uint8ArrayToBigIntBE = (input: Uint8Array): bigint => {
  let res = 0n
  let p = 1n
  for (let i = input.length - 1; i >= 0; i--) {
    res += BigInt(input[i]) * p
    p *= 256n
  }
  return res
}

export const uint8ArrayConcat = (
  list: Array<Uint8Array | number>,
): Uint8Array => {
  const length = sum(
    list.map((item) => (typeof item === 'number' ? 1 : item.length)),
  )
  const res = new Uint8Array(length)
  let position = 0
  for (const item of list) {
    if (typeof item === 'number') {
      res[position++] = item
    } else {
      res.set(item, position)
      position += item.length
    }
  }
  return res
}

export const uint8ArrayReverse = (array: Uint8Array): Uint8Array => {
  const res = new Uint8Array(array.length)
  for (let i = 0; i < array.length; i++) {
    res[i] = array[array.length - 1 - i]
  }
  return res
}

export const uint8ArrayEqual = (
  arr1: Uint8Array,
  arr2: Uint8Array,
): boolean => {
  if (arr1.length !== arr2.length) {
    return false
  }

  return arr1.every((value, index) => value === arr2[index])
}

const getSubarrayFromFirstNonzero = (array: Uint8Array) => {
  if (array[0] === 0) {
    const firstNonzeroIndex = array.findIndex((n) => n !== 0)
    if (firstNonzeroIndex === -1) {
      array = new Uint8Array()
    } else {
      array = array.subarray(firstNonzeroIndex)
    }
  }
  return array
}

export const uint8ArrayUIntBEEqual = (
  arr1: Uint8Array,
  arr2: Uint8Array,
): boolean => {
  arr1 = getSubarrayFromFirstNonzero(arr1)
  arr2 = getSubarrayFromFirstNonzero(arr2)
  return uint8ArrayEqual(arr1, arr2)
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
