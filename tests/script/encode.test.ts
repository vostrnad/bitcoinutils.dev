import { describe, expect, test } from 'vitest'
import { encodeScript } from '$lib/utils/bitcoin/script/encode'
import { bytesToHex } from '$lib/utils/uintarray'
import { validSymmetricScripts } from './testcases'

describe('encodeScript', () => {
  test('should encode valid minimal scripts', () => {
    validSymmetricScripts.forEach(([script, text]) => {
      expect(bytesToHex(encodeScript(text))).toBe(script)
    })
  })

  test('should encode scripts with other formats', () => {
    const testcases: Array<[string, string]> = [
      ['OP_0 OP_FALSE', '0000'],
      ['OP_1 OP_PUSHNUM_1 OP_TRUE', '515151'],
      ['OP_CLTV OP_CSV', 'b1b2'],
    ]

    testcases.forEach(([text, script]) => {
      expect(bytesToHex(encodeScript(text))).toBe(script)
    })
  })

  test('should throw error on non-existent opcodes', () => {
    const testcases: string[] = [
      'OP_PUSHNUM_0',
      'OP_UNKNOWN',
      'OP_PUSHDATA3',
      'OP_PUSHDATA5',
    ]

    testcases.forEach((text) => {
      expect(() => encodeScript(text)).toThrow(`${text} is not a valid opcode`)
    })
  })

  test('should throw error on variable-length push opcodes', () => {
    const testcases: string[] = [
      'OP_PUSHBYTES1',
      'OP_PUSHDATA1',
      'OP_PUSHDATA2',
      'OP_PUSHDATA4',
    ]

    testcases.forEach((text) => {
      expect(() => encodeScript(text)).toThrow(`${text} is not a valid opcode`)
    })
  })
})
