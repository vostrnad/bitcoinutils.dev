// Ported from https://github.com/bitcoin/bitcoin/blob/v28.0/src/script/interpreter.cpp
// to which this copyright notice applies:
//
// Copyright (c) 2009-2010 Satoshi Nakamoto
// Copyright (c) 2009-2022 The Bitcoin Core developers
// Distributed under the MIT software license

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha1 } from '@noble/hashes/sha1'
import { sha256 } from '@noble/hashes/sha256'
import { mod } from '$lib/utils/number'
import {
  Uint8ArrayReader,
  bytesToIntLE,
  bytesToUIntLE,
  intLEToBytes,
  uint8ArrayEqual,
} from '$lib/utils/uintarray'

const OP_0 = 0x00
// const OP_FALSE = OP_0
const OP_PUSHDATA1 = 0x4c
// const OP_PUSHDATA2 = 0x4d
const OP_PUSHDATA4 = 0x4e
const OP_1NEGATE = 0x4f
// const OP_RESERVED = 0x50
const OP_1 = 0x51
// const OP_TRUE = OP_1
const OP_2 = 0x52
const OP_3 = 0x53
const OP_4 = 0x54
const OP_5 = 0x55
const OP_6 = 0x56
const OP_7 = 0x57
const OP_8 = 0x58
const OP_9 = 0x59
const OP_10 = 0x5a
const OP_11 = 0x5b
const OP_12 = 0x5c
const OP_13 = 0x5d
const OP_14 = 0x5e
const OP_15 = 0x5f
const OP_16 = 0x60

// control
const OP_NOP = 0x61
// const OP_VER = 0x62
const OP_IF = 0x63
const OP_NOTIF = 0x64
// const OP_VERIF = 0x65
// const OP_VERNOTIF = 0x66
const OP_ELSE = 0x67
const OP_ENDIF = 0x68
const OP_VERIFY = 0x69
const OP_RETURN = 0x6a

// stack ops
const OP_TOALTSTACK = 0x6b
const OP_FROMALTSTACK = 0x6c
const OP_2DROP = 0x6d
const OP_2DUP = 0x6e
const OP_3DUP = 0x6f
const OP_2OVER = 0x70
const OP_2ROT = 0x71
const OP_2SWAP = 0x72
const OP_IFDUP = 0x73
const OP_DEPTH = 0x74
const OP_DROP = 0x75
const OP_DUP = 0x76
const OP_NIP = 0x77
const OP_OVER = 0x78
const OP_PICK = 0x79
const OP_ROLL = 0x7a
const OP_ROT = 0x7b
const OP_SWAP = 0x7c
const OP_TUCK = 0x7d

// splice ops
const OP_CAT = 0x7e
const OP_SUBSTR = 0x7f
const OP_LEFT = 0x80
const OP_RIGHT = 0x81
const OP_SIZE = 0x82

// bit logic
const OP_INVERT = 0x83
const OP_AND = 0x84
const OP_OR = 0x85
const OP_XOR = 0x86
const OP_EQUAL = 0x87
const OP_EQUALVERIFY = 0x88
// const OP_RESERVED1 = 0x89
// const OP_RESERVED2 = 0x8a

// numeric
const OP_1ADD = 0x8b
const OP_1SUB = 0x8c
const OP_2MUL = 0x8d
const OP_2DIV = 0x8e
const OP_NEGATE = 0x8f
const OP_ABS = 0x90
const OP_NOT = 0x91
const OP_0NOTEQUAL = 0x92

const OP_ADD = 0x93
const OP_SUB = 0x94
const OP_MUL = 0x95
const OP_DIV = 0x96
const OP_MOD = 0x97
const OP_LSHIFT = 0x98
const OP_RSHIFT = 0x99

const OP_BOOLAND = 0x9a
const OP_BOOLOR = 0x9b
const OP_NUMEQUAL = 0x9c
const OP_NUMEQUALVERIFY = 0x9d
const OP_NUMNOTEQUAL = 0x9e
const OP_LESSTHAN = 0x9f
const OP_GREATERTHAN = 0xa0
const OP_LESSTHANOREQUAL = 0xa1
const OP_GREATERTHANOREQUAL = 0xa2
const OP_MIN = 0xa3
const OP_MAX = 0xa4
const OP_WITHIN = 0xa5

// crypto
const OP_RIPEMD160 = 0xa6
const OP_SHA1 = 0xa7
const OP_SHA256 = 0xa8
const OP_HASH160 = 0xa9
const OP_HASH256 = 0xaa
const OP_CODESEPARATOR = 0xab
const OP_CHECKSIG = 0xac
const OP_CHECKSIGVERIFY = 0xad
const OP_CHECKMULTISIG = 0xae
const OP_CHECKMULTISIGVERIFY = 0xaf

// expansion
const OP_NOP1 = 0xb0
const OP_CHECKLOCKTIMEVERIFY = 0xb1
// const OP_NOP2 = OP_CHECKLOCKTIMEVERIFY
const OP_CHECKSEQUENCEVERIFY = 0xb2
// const OP_NOP3 = OP_CHECKSEQUENCEVERIFY
const OP_NOP4 = 0xb3
const OP_NOP5 = 0xb4
const OP_NOP6 = 0xb5
const OP_NOP7 = 0xb6
const OP_NOP8 = 0xb7
const OP_NOP9 = 0xb8
const OP_NOP10 = 0xb9

// Opcode added by BIP 342 (Tapscript)
const OP_CHECKSIGADD = 0xba

const MAX_PUBKEYS_PER_MULTISIG = 20

const SCRIPT_ERR_OP_RETURN = 3
const SCRIPT_ERR_SIG_COUNT = 8
const SCRIPT_ERR_PUBKEY_COUNT = 9
const SCRIPT_ERR_VERIFY = 10
const SCRIPT_ERR_EQUALVERIFY = 11
const SCRIPT_ERR_CHECKMULTISIGVERIFY = 12
const SCRIPT_ERR_CHECKSIGVERIFY = 13
const SCRIPT_ERR_NUMEQUALVERIFY = 14
const SCRIPT_ERR_BAD_OPCODE = 15
const SCRIPT_ERR_DISABLED_OPCODE = 16
const SCRIPT_ERR_INVALID_STACK_OPERATION = 17
const SCRIPT_ERR_INVALID_ALTSTACK_OPERATION = 18
const SCRIPT_ERR_UNBALANCED_CONDITIONAL = 19
const SCRIPT_ERR_NEGATIVE_LOCKTIME = 20
const SCRIPT_ERR_SIG_NULLDUMMY = 27

class ConditionStack {
  // A constant for firstFalsePos to indicate there are no falses.
  private static readonly NO_FALSE = Number.MAX_SAFE_INTEGER

  // The size of the implied stack.
  private stackSize = 0
  // The position of the first false value on the implied stack, or NO_FALSE if all true.
  private firstFalsePos = ConditionStack.NO_FALSE

  empty(): boolean {
    return this.stackSize === 0
  }

  allTrue(): boolean {
    return this.firstFalsePos === ConditionStack.NO_FALSE
  }

  pushBack(f: boolean): void {
    if (this.firstFalsePos === ConditionStack.NO_FALSE && !f) {
      // The stack consists of all true values, and a false is added.
      // The first false value will appear at the current size.
      this.firstFalsePos = this.stackSize
    }
    ++this.stackSize
  }

  popBack(): void {
    --this.stackSize
    if (this.firstFalsePos === this.stackSize) {
      // When popping off the first false value, everything becomes true.
      this.firstFalsePos = ConditionStack.NO_FALSE
    }
  }

  toggleTop(): void {
    if (this.firstFalsePos === ConditionStack.NO_FALSE) {
      // The current stack is all true values; the first false will be the top.
      this.firstFalsePos = this.stackSize - 1
    } else if (this.firstFalsePos === this.stackSize - 1) {
      // The top is the first false value; toggling it will make everything true.
      this.firstFalsePos = ConditionStack.NO_FALSE
    } else {
      // There is a false value, but not on top. No action is needed as toggling
      // anything but the first false value is unobservable.
    }
  }
}

const castToBool = (vch: Uint8Array) => {
  for (let i = 0; i < vch.length; i++) {
    if (vch[i] !== 0) {
      // Can be negative zero
      if (i === vch.length - 1 && vch[i] === 0x80) return false
      return true
    }
  }
  return false
}

export interface ScriptStep {
  position: number
  stack: Uint8Array[]
}

export interface EvalScriptResult {
  error?: {
    position: number
    code: number
  }
  stack: Uint8Array[]
}

export const evalScript = (
  script: Uint8Array,
  initialStack: Uint8Array[],
): EvalScriptResult => {
  const reader = new Uint8ArrayReader(script)

  const stack = [...initialStack]
  const altstack: Uint8Array[] = []

  let loopStartReaderPosition = 0

  const stacktop = (n = -1) => stack.at(n)
  const popstack = () => stack.pop()
  const altstacktop = (n = -1) => altstack.at(n)
  const popaltstack = () => altstack.pop()
  const swap = (a: number, b: number) => {
    a = mod(a, stack.length)
    b = mod(b, stack.length)
    const temp = stack[a]
    stack[a] = stack[b]
    stack[b] = temp
  }
  const setError = (errCode: number): EvalScriptResult => {
    return {
      error: {
        code: errCode,
        position: loopStartReaderPosition,
      },
      stack,
    }
  }

  const vchFalse = intLEToBytes(0)
  const vchTrue = intLEToBytes(1)

  const vfExec = new ConditionStack()

  while (reader.position < script.length) {
    loopStartReaderPosition = reader.position

    const fExec = vfExec.allTrue()
    const opcode = reader.readByte()

    if (
      opcode === OP_CAT ||
      opcode === OP_SUBSTR ||
      opcode === OP_LEFT ||
      opcode === OP_RIGHT ||
      opcode === OP_INVERT ||
      opcode === OP_AND ||
      opcode === OP_OR ||
      opcode === OP_XOR ||
      opcode === OP_2MUL ||
      opcode === OP_2DIV ||
      opcode === OP_MUL ||
      opcode === OP_DIV ||
      opcode === OP_MOD ||
      opcode === OP_LSHIFT ||
      opcode === OP_RSHIFT
    ) {
      return setError(SCRIPT_ERR_DISABLED_OPCODE) // Disabled opcodes (CVE-2010-5137).
    }

    if (opcode >= 1 && opcode <= OP_PUSHDATA4) {
      let pushBytes: number

      if (opcode <= 75) {
        pushBytes = opcode
      } else {
        const lengthBytes = 2 ** (opcode - OP_PUSHDATA1)

        if (reader.position + lengthBytes > script.length) {
          return setError(SCRIPT_ERR_BAD_OPCODE)
        }

        const pushBytesArray = reader.read(lengthBytes)
        pushBytes = bytesToUIntLE(pushBytesArray)
      }

      if (reader.position + pushBytes > script.length) {
        return setError(SCRIPT_ERR_BAD_OPCODE)
      }

      const pushValue = reader.read(pushBytes)

      if (fExec) {
        stack.push(pushValue)
      }

      continue
    }

    if (!(fExec || (opcode >= OP_IF && opcode <= OP_ENDIF))) {
      continue
    }

    switch (opcode) {
      case OP_0:
        stack.push(new Uint8Array())
        break

      case OP_1NEGATE:
      case OP_1:
      case OP_2:
      case OP_3:
      case OP_4:
      case OP_5:
      case OP_6:
      case OP_7:
      case OP_8:
      case OP_9:
      case OP_10:
      case OP_11:
      case OP_12:
      case OP_13:
      case OP_14:
      case OP_15:
      case OP_16:
        stack.push(intLEToBytes(opcode - OP_1 + 1))
        break

      case OP_NOP:
      case OP_NOP1:
      case OP_NOP4:
      case OP_NOP5:
      case OP_NOP6:
      case OP_NOP7:
      case OP_NOP8:
      case OP_NOP9:
      case OP_NOP10:
        break

      case OP_CHECKLOCKTIMEVERIFY:
      case OP_CHECKSEQUENCEVERIFY: {
        if (stack.length === 0) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }

        const value = bytesToIntLE(stacktop()!)

        if (value < 0) {
          return setError(SCRIPT_ERR_NEGATIVE_LOCKTIME)
        }

        break
      }

      case OP_IF:
      case OP_NOTIF:
        {
          // <expression> if [statements] [else [statements]] endif
          let fValue = false
          if (fExec) {
            if (stack.length === 0) {
              return setError(SCRIPT_ERR_UNBALANCED_CONDITIONAL)
            }
            const vch = stacktop()!
            fValue = castToBool(vch)
            if (opcode === OP_NOTIF) {
              fValue = !fValue
            }
            popstack()
          }
          vfExec.pushBack(fValue)
        }
        break

      case OP_ELSE:
        if (vfExec.empty()) {
          return setError(SCRIPT_ERR_UNBALANCED_CONDITIONAL)
        }
        vfExec.toggleTop()
        break

      case OP_ENDIF:
        if (vfExec.empty()) {
          return setError(SCRIPT_ERR_UNBALANCED_CONDITIONAL)
        }
        vfExec.popBack()
        break

      case OP_VERIFY:
        {
          if (stack.length === 0) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const fValue = castToBool(stacktop()!)
          if (fValue) {
            popstack()
          } else {
            return setError(SCRIPT_ERR_VERIFY)
          }
        }
        break

      case OP_RETURN:
        return setError(SCRIPT_ERR_OP_RETURN)

      case OP_TOALTSTACK:
        if (stack.length === 0) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        altstack.push(stacktop()!)
        popstack()
        break

      case OP_FROMALTSTACK:
        if (altstack.length === 0) {
          return setError(SCRIPT_ERR_INVALID_ALTSTACK_OPERATION)
        }
        stack.push(altstacktop()!)
        popaltstack()
        break

      case OP_2DROP:
        // (x1 x2 -- )
        if (stack.length < 2) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        popstack()
        popstack()
        break

      case OP_2DUP:
        {
          // (x1 x2 -- x1 x2 x1 x2)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch1 = stacktop(-2)!
          const vch2 = stacktop(-1)!
          stack.push(vch1, vch2)
        }
        break

      case OP_3DUP:
        {
          // (x1 x2 x3 -- x1 x2 x3 x1 x2 x3)
          if (stack.length < 3) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch1 = stacktop(-3)!
          const vch2 = stacktop(-2)!
          const vch3 = stacktop(-1)!
          stack.push(vch1, vch2, vch3)
        }
        break

      case OP_2OVER:
        {
          // (x1 x2 x3 x4 -- x1 x2 x3 x4 x1 x2)
          if (stack.length < 4) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch1 = stacktop(-4)!
          const vch2 = stacktop(-3)!
          stack.push(vch1, vch2)
        }
        break

      case OP_2ROT:
        {
          // (x1 x2 x3 x4 x5 x6 -- x3 x4 x5 x6 x1 x2)
          if (stack.length < 6) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch1 = stacktop(-6)!
          const vch2 = stacktop(-5)!
          stack.splice(-6, 2)
          stack.push(vch1, vch2)
        }
        break

      case OP_2SWAP:
        // (x1 x2 x3 x4 -- x3 x4 x1 x2)
        if (stack.length < 4) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        swap(-4, -2)
        swap(-3, -1)
        break

      case OP_IFDUP:
        {
          // (x - 0 | x x)
          if (stack.length === 0) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch = stacktop()!
          if (castToBool(vch)) stack.push(vch)
        }
        break

      case OP_DEPTH:
        stack.push(intLEToBytes(stack.length))
        break

      case OP_DROP:
        // (x -- )
        if (stack.length === 0) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        popstack()
        break

      case OP_DUP:
        {
          // (x -- x x)
          if (stack.length === 0) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch = stacktop()!
          stack.push(vch)
        }
        break

      case OP_NIP:
        // (x1 x2 -- x2)
        if (stack.length < 2) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        stack.splice(-2, 1)
        break

      case OP_OVER:
        {
          // (x1 x2 -- x1 x2 x1)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch = stacktop(-2)!
          stack.push(vch)
        }
        break

      case OP_PICK:
      case OP_ROLL:
        {
          // (xn ... x2 x1 x0 n - xn ... x2 x1 x0 xn)
          // (xn ... x2 x1 x0 n - ... x2 x1 x0 xn)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const n = bytesToIntLE(stacktop()!)
          popstack()
          if (n < 0 || n >= stack.length) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch = stacktop(-n - 1)!
          if (opcode === OP_ROLL) {
            stack.splice(-n - 1, 1)
          }
          stack.push(vch)
        }
        break

      case OP_ROT:
        // (x1 x2 x3 -- x2 x3 x1)
        //  x2 x1 x3  after first swap
        //  x2 x3 x1  after second swap
        if (stack.length < 3) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        swap(-3, -2)
        swap(-2, -1)
        break

      case OP_SWAP:
        // (x1 x2 -- x2 x1)
        if (stack.length < 2) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        swap(-2, -1)
        break

      case OP_TUCK:
        {
          // (x1 x2 -- x2 x1 x2)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch = stacktop()!
          stack.splice(-2, 0, vch)
        }
        break

      case OP_SIZE:
        // (in -- in size)
        if (stack.length === 0) {
          return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
        }
        stack.push(intLEToBytes(stacktop()!.length))
        break

      //
      // Bitwise logic
      //
      case OP_EQUAL:
      case OP_EQUALVERIFY:
        {
          // (x1 x2 - bool)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch1 = stacktop(-2)!
          const vch2 = stacktop(-1)!
          const fEqual = uint8ArrayEqual(vch1, vch2)
          popstack()
          popstack()
          stack.push(fEqual ? vchTrue : vchFalse)
          if (opcode === OP_EQUALVERIFY) {
            if (fEqual) popstack()
            else {
              return setError(SCRIPT_ERR_EQUALVERIFY)
            }
          }
        }
        break

      //
      // Numeric
      //
      case OP_1ADD:
      case OP_1SUB:
      case OP_NEGATE:
      case OP_ABS:
      case OP_NOT:
      case OP_0NOTEQUAL:
        {
          // (in -- out)
          if (stack.length === 0) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          let bn = bytesToIntLE(stacktop()!)
          switch (opcode) {
            case OP_1ADD:
              bn += 1
              break
            case OP_1SUB:
              bn -= 1
              break
            case OP_NEGATE:
              bn = -bn
              break
            case OP_ABS:
              if (bn < 0) bn = -bn
              break
            case OP_NOT:
              bn = Number(bn === 0)
              break
            case OP_0NOTEQUAL:
              bn = Number(bn !== 0)
              break
          }
          popstack()
          stack.push(intLEToBytes(bn))
        }
        break

      case OP_ADD:
      case OP_SUB:
      case OP_BOOLAND:
      case OP_BOOLOR:
      case OP_NUMEQUAL:
      case OP_NUMEQUALVERIFY:
      case OP_NUMNOTEQUAL:
      case OP_LESSTHAN:
      case OP_GREATERTHAN:
      case OP_LESSTHANOREQUAL:
      case OP_GREATERTHANOREQUAL:
      case OP_MIN:
      case OP_MAX:
        {
          // (x1 x2 -- out)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const bn1 = bytesToIntLE(stacktop(-2)!)
          const bn2 = bytesToIntLE(stacktop(-1)!)
          let bn: number | boolean = 0
          switch (opcode) {
            case OP_ADD:
              bn = bn1 + bn2
              break
            case OP_SUB:
              bn = bn1 - bn2
              break
            case OP_BOOLAND:
              bn = bn1 !== 0 && bn2 !== 0
              break
            case OP_BOOLOR:
              bn = bn1 !== 0 || bn2 !== 0
              break
            case OP_NUMEQUAL:
              bn = bn1 === bn2
              break
            case OP_NUMEQUALVERIFY:
              bn = bn1 === bn2
              break
            case OP_NUMNOTEQUAL:
              bn = bn1 !== bn2
              break
            case OP_LESSTHAN:
              bn = bn1 < bn2
              break
            case OP_GREATERTHAN:
              bn = bn1 > bn2
              break
            case OP_LESSTHANOREQUAL:
              bn = bn1 <= bn2
              break
            case OP_GREATERTHANOREQUAL:
              bn = bn1 >= bn2
              break
            case OP_MIN:
              bn = bn1 < bn2 ? bn1 : bn2
              break
            case OP_MAX:
              bn = bn1 > bn2 ? bn1 : bn2
              break
          }
          popstack()
          popstack()
          stack.push(intLEToBytes(Number(bn)))

          if (opcode === OP_NUMEQUALVERIFY) {
            if (castToBool(stacktop(-1)!)) {
              popstack()
            } else {
              return setError(SCRIPT_ERR_NUMEQUALVERIFY)
            }
          }
        }
        break

      case OP_WITHIN:
        {
          // (x min max -- out)
          if (stack.length < 3) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const bn1 = bytesToIntLE(stacktop(-3)!)
          const bn2 = bytesToIntLE(stacktop(-2)!)
          const bn3 = bytesToIntLE(stacktop(-1)!)
          const fValue = bn2 <= bn1 && bn1 < bn3
          popstack()
          popstack()
          popstack()
          stack.push(fValue ? vchTrue : vchFalse)
        }
        break

      //
      // Crypto
      //
      case OP_RIPEMD160:
      case OP_SHA1:
      case OP_SHA256:
      case OP_HASH160:
      case OP_HASH256:
        {
          // (in -- hash)
          if (stack.length === 0) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          const vch = stacktop(-1)!
          let vchHash: Uint8Array
          switch (opcode) {
            case OP_RIPEMD160:
              vchHash = ripemd160(vch)
              break
            case OP_SHA1:
              vchHash = sha1(vch)
              break
            case OP_SHA256:
              vchHash = sha256(vch)
              break
            case OP_HASH160:
              vchHash = ripemd160(sha256(vch))
              break
            case OP_HASH256:
              vchHash = sha256(sha256(vch))
              break
          }
          popstack()
          stack.push(vchHash)
        }
        break

      case OP_CODESEPARATOR:
        break

      case OP_CHECKSIG:
      case OP_CHECKSIGVERIFY:
        {
          // (sig pubkey -- bool)
          if (stack.length < 2) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }

          const vchSig = stacktop(-2)!
          const vchPubKey = stacktop(-1)!

          const success = vchSig.length > 0 && vchPubKey.length > 0

          popstack()
          popstack()
          stack.push(success ? vchTrue : vchFalse)
          if (opcode === OP_CHECKSIGVERIFY) {
            if (success) popstack()
            else return setError(SCRIPT_ERR_CHECKSIGVERIFY)
          }
        }
        break

      case OP_CHECKSIGADD:
        {
          // (sig num pubkey -- num)
          if (stack.length < 3) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }

          const sig = stacktop(-3)!
          const num = bytesToIntLE(stacktop(-2)!)
          const pubkey = stacktop(-1)!

          const success = sig.length > 0 && pubkey.length > 0

          popstack()
          popstack()
          popstack()
          stack.push(intLEToBytes(num + (success ? 1 : 0)))
        }
        break

      case OP_CHECKMULTISIG:
      case OP_CHECKMULTISIGVERIFY:
        {
          // ([sig ...] num_of_signatures [pubkey ...] num_of_pubkeys -- bool)

          let i = 1
          if (stack.length < i) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }

          let nKeysCount = bytesToIntLE(stacktop(-i)!)
          if (nKeysCount < 0 || nKeysCount > MAX_PUBKEYS_PER_MULTISIG) {
            return setError(SCRIPT_ERR_PUBKEY_COUNT)
          }
          let ikey = ++i
          // ikey2 is the position of last non-signature item in the stack. Top stack item = 1.
          // With SCRIPT_VERIFY_NULLFAIL, this is used for cleanup if operation fails.
          let ikey2 = nKeysCount + 2
          i += nKeysCount
          if (stack.length < i) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }

          let nSigsCount = bytesToIntLE(stacktop(-i)!)
          if (nSigsCount < 0 || nSigsCount > nKeysCount) {
            return setError(SCRIPT_ERR_SIG_COUNT)
          }
          let isig = ++i
          i += nSigsCount
          if (stack.length < i) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }

          let fSuccess = true
          while (fSuccess && nSigsCount > 0) {
            const vchSig = stacktop(-isig)!
            const vchPubKey = stacktop(-ikey)!

            const fOk = vchSig.length > 0 && vchPubKey.length > 0

            if (fOk) {
              isig++
              nSigsCount--
            }
            ikey++
            nKeysCount--

            // If there are more signatures left than keys left,
            // then too many signatures have failed. Exit early,
            // without checking any further signatures.
            if (nSigsCount > nKeysCount) fSuccess = false
          }

          // Clean up stack of actual arguments
          while (i-- > 1) {
            if (ikey2 > 0) ikey2--
            popstack()
          }

          // A bug causes CHECKMULTISIG to consume one extra argument
          // whose contents were not checked in any way.
          //
          // Unfortunately this is a potential source of mutability,
          // so optionally verify it is exactly equal to zero prior
          // to removing it from the stack.
          if (stack.length === 0) {
            return setError(SCRIPT_ERR_INVALID_STACK_OPERATION)
          }
          if (stacktop(-1)!.length > 0) {
            return setError(SCRIPT_ERR_SIG_NULLDUMMY)
          }
          popstack()

          stack.push(fSuccess ? vchTrue : vchFalse)

          if (opcode === OP_CHECKMULTISIGVERIFY) {
            if (fSuccess) {
              popstack()
            } else {
              return setError(SCRIPT_ERR_CHECKMULTISIGVERIFY)
            }
          }
        }
        break

      default:
        return setError(SCRIPT_ERR_BAD_OPCODE)
    }
  }

  if (!vfExec.empty()) {
    return setError(SCRIPT_ERR_UNBALANCED_CONDITIONAL)
  }

  return { stack }
}