import { createArray } from '$lib/utils/array'

// push value
export const OP_0 = 0x00
// export const OP_FALSE = OP_0
export const OP_PUSHBYTES_1 = 0x01
export const OP_PUSHBYTES_75 = 0x4b
export const OP_PUSHDATA1 = 0x4c
export const OP_PUSHDATA2 = 0x4d
export const OP_PUSHDATA4 = 0x4e
export const OP_1NEGATE = 0x4f
export const OP_RESERVED = 0x50
export const OP_1 = 0x51
// export const OP_TRUE = OP_1
export const OP_2 = 0x52
export const OP_3 = 0x53
export const OP_4 = 0x54
export const OP_5 = 0x55
export const OP_6 = 0x56
export const OP_7 = 0x57
export const OP_8 = 0x58
export const OP_9 = 0x59
export const OP_10 = 0x5a
export const OP_11 = 0x5b
export const OP_12 = 0x5c
export const OP_13 = 0x5d
export const OP_14 = 0x5e
export const OP_15 = 0x5f
export const OP_16 = 0x60

// control
export const OP_NOP = 0x61
export const OP_VER = 0x62
export const OP_IF = 0x63
export const OP_NOTIF = 0x64
export const OP_VERIF = 0x65
export const OP_VERNOTIF = 0x66
export const OP_ELSE = 0x67
export const OP_ENDIF = 0x68
export const OP_VERIFY = 0x69
export const OP_RETURN = 0x6a

// stack ops
export const OP_TOALTSTACK = 0x6b
export const OP_FROMALTSTACK = 0x6c
export const OP_2DROP = 0x6d
export const OP_2DUP = 0x6e
export const OP_3DUP = 0x6f
export const OP_2OVER = 0x70
export const OP_2ROT = 0x71
export const OP_2SWAP = 0x72
export const OP_IFDUP = 0x73
export const OP_DEPTH = 0x74
export const OP_DROP = 0x75
export const OP_DUP = 0x76
export const OP_NIP = 0x77
export const OP_OVER = 0x78
export const OP_PICK = 0x79
export const OP_ROLL = 0x7a
export const OP_ROT = 0x7b
export const OP_SWAP = 0x7c
export const OP_TUCK = 0x7d

// splice ops
export const OP_CAT = 0x7e
export const OP_SUBSTR = 0x7f
export const OP_LEFT = 0x80
export const OP_RIGHT = 0x81
export const OP_SIZE = 0x82

// bit logic
export const OP_INVERT = 0x83
export const OP_AND = 0x84
export const OP_OR = 0x85
export const OP_XOR = 0x86
export const OP_EQUAL = 0x87
export const OP_EQUALVERIFY = 0x88
export const OP_RESERVED1 = 0x89
export const OP_RESERVED2 = 0x8a

// numeric
export const OP_1ADD = 0x8b
export const OP_1SUB = 0x8c
export const OP_2MUL = 0x8d
export const OP_2DIV = 0x8e
export const OP_NEGATE = 0x8f
export const OP_ABS = 0x90
export const OP_NOT = 0x91
export const OP_0NOTEQUAL = 0x92

export const OP_ADD = 0x93
export const OP_SUB = 0x94
export const OP_MUL = 0x95
export const OP_DIV = 0x96
export const OP_MOD = 0x97
export const OP_LSHIFT = 0x98
export const OP_RSHIFT = 0x99

export const OP_BOOLAND = 0x9a
export const OP_BOOLOR = 0x9b
export const OP_NUMEQUAL = 0x9c
export const OP_NUMEQUALVERIFY = 0x9d
export const OP_NUMNOTEQUAL = 0x9e
export const OP_LESSTHAN = 0x9f
export const OP_GREATERTHAN = 0xa0
export const OP_LESSTHANOREQUAL = 0xa1
export const OP_GREATERTHANOREQUAL = 0xa2
export const OP_MIN = 0xa3
export const OP_MAX = 0xa4

export const OP_WITHIN = 0xa5

// crypto
export const OP_RIPEMD160 = 0xa6
export const OP_SHA1 = 0xa7
export const OP_SHA256 = 0xa8
export const OP_HASH160 = 0xa9
export const OP_HASH256 = 0xaa
export const OP_CODESEPARATOR = 0xab
export const OP_CHECKSIG = 0xac
export const OP_CHECKSIGVERIFY = 0xad
export const OP_CHECKMULTISIG = 0xae
export const OP_CHECKMULTISIGVERIFY = 0xaf

// expansion
export const OP_NOP1 = 0xb0
export const OP_CHECKLOCKTIMEVERIFY = 0xb1
// export const OP_NOP2 = OP_CHECKLOCKTIMEVERIFY
export const OP_CHECKSEQUENCEVERIFY = 0xb2
// export const OP_NOP3 = OP_CHECKSEQUENCEVERIFY
export const OP_NOP4 = 0xb3
export const OP_NOP5 = 0xb4
export const OP_NOP6 = 0xb5
export const OP_NOP7 = 0xb6
export const OP_NOP8 = 0xb7
export const OP_NOP9 = 0xb8
export const OP_NOP10 = 0xb9

// Opcode added by BIP 342 (Tapscript)
export const OP_CHECKSIGADD = 0xba

export const OP_INVALIDOPCODE = 0xff

const opcodesShort: Array<[string, number | string]> = [
  // push value
  ['0', OP_0],
  ['FALSE', '0'],
  ['1NEGATE', OP_1NEGATE],
  ['RESERVED', OP_RESERVED],
  ...createArray<[string, number]>(16, (i) => [`${i + 1}`, i + OP_1]),
  ['TRUE', '1'],
  ...createArray<[string, string]>(16, (i) => [`PUSHNUM_${i + 1}`, `${i + 1}`]),

  // control
  ['NOP', OP_NOP],
  ['VER', OP_VER],
  ['IF', OP_IF],
  ['NOTIF', OP_NOTIF],
  ['VERIF', OP_VERIF],
  ['VERNOTIF', OP_VERNOTIF],
  ['ELSE', OP_ELSE],
  ['ENDIF', OP_ENDIF],
  ['VERIFY', OP_VERIFY],
  ['RETURN', OP_RETURN],

  // stack ops
  ['TOALTSTACK', OP_TOALTSTACK],
  ['FROMALTSTACK', OP_FROMALTSTACK],
  ['2DROP', OP_2DROP],
  ['2DUP', OP_2DUP],
  ['3DUP', OP_3DUP],
  ['2OVER', OP_2OVER],
  ['2ROT', OP_2ROT],
  ['2SWAP', OP_2SWAP],
  ['IFDUP', OP_IFDUP],
  ['DEPTH', OP_DEPTH],
  ['DROP', OP_DROP],
  ['DUP', OP_DUP],
  ['NIP', OP_NIP],
  ['OVER', OP_OVER],
  ['PICK', OP_PICK],
  ['ROLL', OP_ROLL],
  ['ROT', OP_ROT],
  ['SWAP', OP_SWAP],
  ['TUCK', OP_TUCK],

  // splice ops
  ['CAT', OP_CAT],
  ['SUBSTR', OP_SUBSTR],
  ['LEFT', OP_LEFT],
  ['RIGHT', OP_RIGHT],
  ['SIZE', OP_SIZE],

  // bit logic
  ['INVERT', OP_INVERT],
  ['AND', OP_AND],
  ['OR', OP_OR],
  ['XOR', OP_XOR],
  ['EQUAL', OP_EQUAL],
  ['EQUALVERIFY', OP_EQUALVERIFY],
  ['RESERVED1', OP_RESERVED1],
  ['RESERVED2', OP_RESERVED2],

  // numeric
  ['1ADD', OP_1ADD],
  ['1SUB', OP_1SUB],
  ['2MUL', OP_2MUL],
  ['2DIV', OP_2DIV],
  ['NEGATE', OP_NEGATE],
  ['ABS', OP_ABS],
  ['NOT', OP_NOT],
  ['0NOTEQUAL', OP_0NOTEQUAL],

  ['ADD', OP_ADD],
  ['SUB', OP_SUB],
  ['MUL', OP_MUL],
  ['DIV', OP_DIV],
  ['MOD', OP_MOD],
  ['LSHIFT', OP_LSHIFT],
  ['RSHIFT', OP_RSHIFT],

  ['BOOLAND', OP_BOOLAND],
  ['BOOLOR', OP_BOOLOR],
  ['NUMEQUAL', OP_NUMEQUAL],
  ['NUMEQUALVERIFY', OP_NUMEQUALVERIFY],
  ['NUMNOTEQUAL', OP_NUMNOTEQUAL],
  ['LESSTHAN', OP_LESSTHAN],
  ['GREATERTHAN', OP_GREATERTHAN],
  ['LESSTHANOREQUAL', OP_LESSTHANOREQUAL],
  ['GREATERTHANOREQUAL', OP_GREATERTHANOREQUAL],
  ['MIN', OP_MIN],
  ['MAX', OP_MAX],

  ['WITHIN', OP_WITHIN],

  // crypto
  ['RIPEMD160', OP_RIPEMD160],
  ['SHA1', OP_SHA1],
  ['SHA256', OP_SHA256],
  ['HASH160', OP_HASH160],
  ['HASH256', OP_HASH256],
  ['CODESEPARATOR', OP_CODESEPARATOR],
  ['CHECKSIG', OP_CHECKSIG],
  ['CHECKSIGVERIFY', OP_CHECKSIGVERIFY],
  ['CHECKMULTISIG', OP_CHECKMULTISIG],
  ['CHECKMULTISIGVERIFY', OP_CHECKMULTISIGVERIFY],

  // expansion
  ['NOP1', OP_NOP1],
  ['CHECKLOCKTIMEVERIFY', OP_CHECKLOCKTIMEVERIFY],
  ['CLTV', 'CHECKLOCKTIMEVERIFY'],
  ['NOP2', 'CHECKLOCKTIMEVERIFY'],
  ['CHECKSEQUENCEVERIFY', OP_CHECKSEQUENCEVERIFY],
  ['CSV', 'CHECKSEQUENCEVERIFY'],
  ['NOP3', 'CHECKSEQUENCEVERIFY'],
  ['NOP4', OP_NOP4],
  ['NOP5', OP_NOP5],
  ['NOP6', OP_NOP6],
  ['NOP7', OP_NOP7],
  ['NOP8', OP_NOP8],
  ['NOP9', OP_NOP9],
  ['NOP10', OP_NOP10],

  // Opcode added by BIP 342 (Tapscript)
  ['CHECKSIGADD', OP_CHECKSIGADD],

  ['INVALIDOPCODE', OP_INVALIDOPCODE],
]

const unshorten = (opcode: string) => `OP_${opcode}`

const opcodes: Array<[string, number | string]> = opcodesShort.map(
  ([name, value]) => [
    unshorten(name),
    typeof value === 'string' ? unshorten(value) : value,
  ],
)

export const opcodeNames = opcodes.map(([opcode]) => opcode)

const filterNumberOpcodes = (
  item: [string, number | string],
): item is [string, number] => {
  return typeof item[1] === 'number'
}

const opcodeNumbers = opcodes.filter(filterNumberOpcodes)

export const isPushOpcode = (opcode: number): boolean => {
  return (
    (opcode >= OP_0 && opcode <= OP_1NEGATE) ||
    (opcode >= OP_1 && opcode <= OP_16)
  )
}

const nonPushOpcodesByNumber = new Map<number, string>(
  opcodeNumbers
    .filter(([, byte]) => !isPushOpcode(byte))
    .map(([name, byte]) => [byte, name]),
)

export const getNonPushOpcodeName = (opcode: number): string | undefined =>
  nonPushOpcodesByNumber.get(opcode)

const opcodesByName = new Map<string, number>()
opcodes.forEach(([name, value]) => {
  if (typeof value === 'number') {
    opcodesByName.set(name, value)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    opcodesByName.set(name, opcodesByName.get(value)!)
  }
})

export const getOpcodeByName = (opcode: string): number | undefined =>
  opcodesByName.get(opcode)
