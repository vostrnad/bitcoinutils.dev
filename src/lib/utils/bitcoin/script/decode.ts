import {
  OP_0,
  OP_1,
  OP_16,
  OP_1NEGATE,
  OP_PUSHBYTES_1,
  OP_PUSHBYTES_75,
  OP_PUSHDATA1,
  OP_PUSHDATA4,
  getNonPushOpcodeName,
} from './opcodes'
import {
  OutOfRangeError,
  Uint8ArrayReader,
  bytesToHex,
  bytesToIntLE,
  bytesToUIntLE,
} from '$lib/utils/uintarray'

export const range = (min: number, max: number): number[] => {
  const res: number[] = []
  for (let i = min; i <= max; i++) {
    res.push(i)
  }
  return res
}

// 80, 98, 126-129, 131-134, 137-138, 141-142, 149-153, 187-254
const opSuccessCodes = new Set([
  80,
  98,
  ...range(126, 129),
  ...range(131, 134),
  ...range(137, 138),
  ...range(141, 142),
  ...range(149, 153),
  ...range(187, 254),
])

export interface DecodeOptions {
  pushNumFormat: 'short' | 'long'
  showPushOps: 'all' | 'numeric' | 'none'
  showPushdataSize: boolean
  showShortDecimal: boolean
  isTapscript: boolean
  throwOnError: boolean
}

export function* getDecodeScriptGenerator(
  script: Uint8Array,
  options?: Partial<DecodeOptions>,
): Generator<string> {
  const reader = new Uint8ArrayReader(script)

  options = {
    pushNumFormat: 'short',
    showPushOps: 'all',
    showPushdataSize: true,
    showShortDecimal: false,
    isTapscript: false,
    throwOnError: false,
    ...options,
  }

  try {
    while (reader.position < script.length) {
      const byte = reader.readByte()

      if (options.isTapscript && opSuccessCodes.has(byte)) {
        yield `OP_SUCCESS${byte}`

        if (reader.position !== script.length) {
          yield bytesToHex(reader.read(script.length - reader.position))
        }
        continue
      }

      const opcode = getNonPushOpcodeName(byte)

      if (opcode) {
        yield opcode
        continue
      }

      if (byte === OP_0 || (byte >= OP_1 && byte <= OP_16)) {
        const number = byte === OP_0 ? 0 : byte - OP_1 + 1
        if (options.showPushOps !== 'none') {
          if (byte === OP_0) {
            yield 'OP_0'
          } else if (options.pushNumFormat === 'short') {
            yield `OP_${number}`
          } else {
            yield `OP_PUSHNUM_${number}`
          }
        } else {
          if (options.showShortDecimal || byte === OP_0) {
            yield number.toString()
          } else {
            yield number.toString(16).padStart(2, '0')
          }
        }
        continue
      }

      if (byte === OP_1NEGATE) {
        if (options.showPushOps !== 'none') {
          yield 'OP_1NEGATE'
        } else if (options.showShortDecimal) {
          yield '-1'
        } else {
          yield '81'
        }
        continue
      }

      if (byte >= OP_PUSHBYTES_1 && byte <= OP_PUSHDATA4) {
        let pushBytes: number

        if (byte <= OP_PUSHBYTES_75) {
          pushBytes = byte
          if (options.showPushOps === 'all') yield `OP_PUSHBYTES_${byte}`
        } else {
          const lengthBytes = 2 ** (byte - OP_PUSHDATA1)
          if (options.showPushOps === 'all') yield `OP_PUSHDATA${lengthBytes}`

          const pushBytesArray = reader.read(lengthBytes)
          pushBytes = bytesToUIntLE(pushBytesArray)
          if (options.showPushOps === 'all' && options.showPushdataSize) {
            if (options.showShortDecimal) {
              yield pushBytes.toString()
            } else {
              yield bytesToHex(pushBytesArray)
            }
          }
        }

        const subarray = reader.read(pushBytes)
        if (pushBytes === 0 || (pushBytes <= 4 && options.showShortDecimal)) {
          yield bytesToIntLE(subarray).toString()
        } else {
          yield bytesToHex(subarray)
        }
        continue
      }

      yield `OP_UNKNOWN`
    }
  } catch (e) {
    if (!options.throwOnError && e instanceof OutOfRangeError) {
      yield '[error]'
    } else {
      throw e
    }
  }
}

export const decodeScript = (
  script: Uint8Array,
  options?: Partial<DecodeOptions>,
): string => {
  return Array.from(getDecodeScriptGenerator(script, options)).join(' ')
}
