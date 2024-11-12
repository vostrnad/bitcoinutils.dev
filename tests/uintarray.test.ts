import { expect, test } from 'vitest'
import { bytesToIntLE, hexToBytes, intLEToBytes } from '$lib/utils/uintarray'

test('uintarray', () => {
  expect(intLEToBytes(0)).toEqual(hexToBytes(''))
  expect(intLEToBytes(1)).toEqual(hexToBytes('01'))
  expect(intLEToBytes(127)).toEqual(hexToBytes('7f'))
  expect(intLEToBytes(-1)).toEqual(hexToBytes('81'))
  expect(intLEToBytes(128)).toEqual(hexToBytes('8000'))
  expect(intLEToBytes(-128)).toEqual(hexToBytes('8080'))
  expect(intLEToBytes(32767)).toEqual(hexToBytes('ff7f'))
  expect(intLEToBytes(-32767)).toEqual(hexToBytes('ffff'))

  expect(bytesToIntLE(hexToBytes(''))).toBe(0)
  expect(bytesToIntLE(hexToBytes('01'))).toBe(1)
  expect(bytesToIntLE(hexToBytes('7f'))).toBe(127)
  expect(bytesToIntLE(hexToBytes('81'))).toBe(-1)
  expect(bytesToIntLE(hexToBytes('ff'))).toBe(-127)
  expect(bytesToIntLE(hexToBytes('8080'))).toBe(-128)
})
