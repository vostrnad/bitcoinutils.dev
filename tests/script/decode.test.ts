import { describe, expect, test } from 'vitest'
import {
  type DecodeOptions,
  decodeScript,
} from '$lib/utils/bitcoin/script/decode'
import { OutOfRangeError, hexToBytes } from '$lib/utils/uintarray'
import { invalidScripts, validScripts } from './testcases'

describe('decodeScript', () => {
  test('should decode valid scripts in debugger format', () => {
    const options: Partial<DecodeOptions> = {
      showPushOps: 'none',
    }

    validScripts.forEach(([script, result]) => {
      expect(decodeScript(hexToBytes(script), options)).toBe(result)
    })
  })

  test('should decode valid scripts in Bitcoin Core format', () => {
    const options: Partial<DecodeOptions> = {
      showPushOps: 'none',
      showShortDecimal: true,
    }

    validScripts.forEach(([script, , result]) => {
      expect(decodeScript(hexToBytes(script), options)).toBe(result)
    })
  })

  test('should decode invalid scripts with [error]', () => {
    const options: Partial<DecodeOptions> = {
      showPushOps: 'none',
    }

    invalidScripts.forEach((script) => {
      expect(decodeScript(hexToBytes(script), options)).toContain('[error]')
    })
  })

  test('should throw error on invalid scripts with throwOnError', () => {
    const options: Partial<DecodeOptions> = {
      showPushOps: 'none',
      throwOnError: true,
    }

    invalidScripts.forEach((script) => {
      expect(() => decodeScript(hexToBytes(script), options)).toThrow(
        OutOfRangeError,
      )
    })
  })
})
