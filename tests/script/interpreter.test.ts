import { describe, expect, test } from 'vitest'
import { createArray } from '$lib/utils/array'
import { evalScript } from '$lib/utils/bitcoin/script/interpreter'
import {
  OP_0NOTEQUAL,
  OP_1ADD,
  OP_1SUB,
  OP_2DROP,
  OP_2DUP,
  OP_2OVER,
  OP_2ROT,
  OP_2SWAP,
  OP_3DUP,
  OP_ABS,
  OP_ADD,
  OP_BOOLAND,
  OP_BOOLOR,
  OP_CHECKLOCKTIMEVERIFY,
  OP_CHECKMULTISIG,
  OP_CHECKMULTISIGVERIFY,
  OP_CHECKSEQUENCEVERIFY,
  OP_CHECKSIG,
  OP_CHECKSIGADD,
  OP_CHECKSIGVERIFY,
  OP_DROP,
  OP_DUP,
  OP_EQUAL,
  OP_EQUALVERIFY,
  OP_GREATERTHAN,
  OP_GREATERTHANOREQUAL,
  OP_HASH160,
  OP_HASH256,
  OP_IFDUP,
  OP_LESSTHAN,
  OP_LESSTHANOREQUAL,
  OP_MAX,
  OP_MIN,
  OP_NEGATE,
  OP_NIP,
  OP_NOT,
  OP_NUMEQUAL,
  OP_NUMEQUALVERIFY,
  OP_NUMNOTEQUAL,
  OP_OVER,
  OP_PICK,
  OP_RIPEMD160,
  OP_ROLL,
  OP_ROT,
  OP_SHA1,
  OP_SHA256,
  OP_SIZE,
  OP_SUB,
  OP_SWAP,
  OP_TOALTSTACK,
  OP_TUCK,
  OP_VERIFY,
  OP_WITHIN,
} from '$lib/utils/bitcoin/script/opcodes'
import { concatBytes, hexToBytes } from '$lib/utils/uintarray'

describe('evalScript', () => {
  test('should successfully verify correct scripts', () => {
    const testcases: Array<[string, string[], ...string[][]]> = [
      [
        // 0 NOTIF 1 ENDIF
        '645168',
        [''],
      ],
      [
        // 1 1 VERIFY
        '515169',
        [],
      ],
      [
        // PUSHDATA 1 1
        '4c0101',
        [],
      ],
      [
        // IF IF 2 ELSE 3 ENDIF ELSE 4 ENDIF EQUAL
        '63635267536867546887',
        ['02', '01', '01'],
        ['03', '', '01'],
        ['04', ''],
      ],
      [
        // 0 0 EQUAL
        '000087',
        [],
      ],
      [
        // all hash functions in sequence
        'a6a7a8a9aa87',
        [
          '267aeb7817c22fdfd61ce1240733037b213aaeaccdc404fcb3030d19da1ddcb2',
          '',
        ],
      ],
      [
        // P2PK
        '41049434a2dd7c5b82df88f578f8d7fd14e8d36513aaa9c003eb5bd6cb56065e44b7e0227139e8a8e68e7de0a4ed32b8c90edc9673b8a7ea541b52f2a22196f7b8cfac',
        [
          '3044022004f027ae0b19bb7a7aa8fcdf135f1da769d087342020359ef4099a9f0f0ba4ec02206a83a9b78df3fed89a3b6052e69963e1fb08d8f6d17d945e43b51b5214aa41e601',
        ],
      ],
      [
        // P2PKH
        '76a914bbb1f7d0f7e15ac088af9bafe25aaac1a59832d088ac',
        [
          '304302204dc2939be89ab6626457fff40aec2cc4e6213e64bcb4d2c43bf6b49358ff638c021f33d2f8fdf6d54a2c82bb7cddc62becc2cbbaca6fd7f3ec927ea975f29ad85102',
          '028b98707adfd6f468d56c1a6067a6f0c7fef43afbacad45384017f8be93a18d40',
        ],
      ],
      [
        // 3-of-5 multisig
        '532103e0a220d36f6f7ed5f3f58c279d055707c454135baf18fd00d798fec3cb52dfbc2103cf689db9313b9f7fc0b984dd9cac750be76041b392919b06f6bf94813da34cd421027f8af2eb6e904deddaa60d5af393d430575eb35e4dfd942a8a5882734b078906410411db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a34104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84c55ae',
        [
          '',
          '3041021d1313459a48bd1d0628eec635495f793e970729684394f9b814d2b24012022050be6d9918444e283da0136884f8311ec465d0fed2f8d24b75a8485ebdc13aea01',
          '303702153b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63021e78644ba72eab69fefb5fe50700671bfb91dda699f72ffbb325edc6a3c4ef82',
          '303602153b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63021d2c2db104e70720c39af43b6ba3edd930c26e0818aa59ff9c886281d8ba83',
        ],
      ],
      [
        // HTLC
        '76a914db865fd920959506111079995f1e4017b489bfe38763ac6721024d560f7f5d28aae5e1a8aa2b7ba615d7fc48e4ea27e5d27336e6a8f5fa0f5c8c7c820120876475527c2103443e8834fa7d79d7b5e95e0e9d0847f6b03ac3ea977979858b4104947fca87ca52ae67a91446c3747322b220fdb925c9802f0e949c1feab99988ac6868',
        [
          '303f021c65aee6696e80be6e14545cfd64b44f17b0514c150eefdb090c0f0bd9021f3fef4aa95c252a225622aba99e4d5af5a6fe40d177acd593e64cf2f8557ccc03',
          '03b55c6f0749e0f3e2caeca05f68e3699f1b3c62a550730f704985a6a9aae437a1',
        ],
      ],
      [
        // LN force close
        '632102fd6db4de50399b2aa086edb23f8e140bbc823d6651e024a0eb871288068789cd67012ab27521034134a2bb35c3f83dab2489d96160741888b8b5589bb694dea6e7bc24486e9c6f68ac',
        [
          '303d021c32f9454db85cb1a4ca63a9883d4347c5e13f3654e884ae44e9efa3c8021d62f07fe452c06b084bc3e09afd3aac4039136549a465533bc1ca66967902',
          '01',
        ],
      ],
      [
        // CHECKSIGADD multisig
        '205f4237bd7dae576b34abc8a9c6fa4f0e4787c04234ca963e9e96c8f9b67b56d1ac205f4237bd7f93c69403a30c6b641f27ccf5201090152fcf1596474221307831c3ba205ac8ff25ce63564963d1148b84627f614af1f3c77d7caa23adc61264fa5e4996ba20b210c83e6f5b3f866837112d023d9ae8da2a6412168d54968ab87860ab970690ba20d3ee3b7a8b8149122b3c886330b3241538ba4b935c4040f4a73ddab917241bc5ba20cdfabb9d0e5c8f09a83f19e36e100d8f5e882f1b60aa60dacd9e6d072c117bc0ba20aab038c238e95fb54cdd0a6705dc1b1f8d135a9e9b20ab9c7ff96eef0e9bf545ba559c',
        [
          'fe6eb715dceffefc067fdc787d250a9a9116682d216f6356ea38fc1f112bd74995faa90315e81981d2c2260b7eaca3c41a16b280362980f0d8faf4c05ebb82c5',
          'e34ad0ad33885a473831f8ba8d9339123cb19d0e642e156d8e0d6e2ab2691aedb30e55a35637a806927225e1aa72223d41e59f92c6579b819e7d331a7ada9d2e01',
          '2a4861fb4cb951c791bf6c93859ef65abccd90034f91b9b77abb918e13b6fce75d5fa3e2d2f6eeeae105315178c2cb9db2ef238fe89b282f691c06db43bc71ca02',
          'fc97bb2be673c3bf388aaf58178ef14d354caf83c92aca8ef1831d619b8511e928f4f5fdea3962067b11e7cecfe094cd0f66a4ea9af9ec836d70d18f2b37df0281',
          'a5781a0adaa80ab7f7f164172dd1a1cb127e523daa0d6949aba074a15c589f12dfb8183182afec9230cb7947b7422a4abc1bb78173550d66274ea19f6c9dd92c82',
          '',
          '',
        ],
      ],
    ]

    testcases.forEach(([script, ...stacks]) => {
      stacks.forEach((stack) => {
        const res = evalScript(hexToBytes(script), stack.map(hexToBytes))
        expect(res).not.toHaveProperty('error')
        expect(res.warnings).toEqual([])
        expect(res.stack).toEqual([hexToBytes('01')])
      })
    })
  })

  test('should return error for incorrect scripts', () => {
    const testcases: Array<[string, string[], number]> = [
      // disabled opcode OP_CAT
      ['7e', [], 16],
      // incomplete push
      ['01', [], 15],
      ['4c', [], 15],
      // no stack items to drop
      ['75', [], 17],
      // IF without stack item
      ['63', [], 19],
      // IF without ELSE item
      ['63', ['01'], 19],
      // NOTIF without stack item
      ['64', [], 19],
    ]

    testcases.forEach(([script, stack, errCode]) => {
      const res = evalScript(hexToBytes(script), stack.map(hexToBytes))
      expect(res).toHaveProperty('error')
      expect(res.error?.code).toBe(errCode)
    })
  })

  test('should require a specific number of stack items for some opcodes', () => {
    const testcases: Array<[number, number | string[]]> = [
      [OP_VERIFY, 1],

      [OP_TOALTSTACK, 1],
      [OP_2DROP, 2],
      [OP_2DUP, 2],
      [OP_3DUP, 3],
      [OP_2OVER, 4],
      [OP_2ROT, 6],
      [OP_2SWAP, 4],
      [OP_IFDUP, 1],
      [OP_DROP, 1],
      [OP_DUP, 1],
      [OP_NIP, 2],
      [OP_OVER, 2],
      [OP_PICK, ['01', '']],
      [OP_PICK, 3],
      [OP_ROLL, ['01', '']],
      [OP_ROLL, 3],
      [OP_ROT, 3],
      [OP_SWAP, 2],
      [OP_TUCK, 2],

      [OP_SIZE, 1],

      [OP_EQUAL, 2],
      [OP_EQUALVERIFY, 2],

      [OP_1ADD, 1],
      [OP_1SUB, 1],
      [OP_NEGATE, 1],
      [OP_ABS, 1],
      [OP_NOT, 1],
      [OP_0NOTEQUAL, 1],

      [OP_ADD, 2],
      [OP_SUB, 2],
      [OP_BOOLAND, 2],
      [OP_BOOLOR, 2],
      [OP_NUMEQUAL, 2],
      [OP_NUMEQUALVERIFY, 2],
      [OP_NUMNOTEQUAL, 2],
      [OP_LESSTHAN, 2],
      [OP_GREATERTHAN, 2],
      [OP_LESSTHANOREQUAL, 2],
      [OP_GREATERTHANOREQUAL, 2],
      [OP_MIN, 2],
      [OP_MAX, 2],

      [OP_WITHIN, 3],

      [OP_RIPEMD160, 1],
      [OP_SHA1, 1],
      [OP_SHA256, 1],
      [OP_HASH160, 1],
      [OP_HASH256, 1],

      [OP_CHECKSIG, 2],
      [OP_CHECKSIGVERIFY, 2],
      [OP_CHECKMULTISIG, ['', '', '']],
      [OP_CHECKMULTISIGVERIFY, ['', '', '']],

      [OP_CHECKLOCKTIMEVERIFY, 1],
      [OP_CHECKSEQUENCEVERIFY, 1],

      [OP_CHECKSIGADD, 3],
    ]

    testcases.forEach(([opcode, items]) => {
      const script = concatBytes([opcode])
      const stack =
        typeof items === 'number'
          ? createArray(items, () => hexToBytes('01'))
          : items.map(hexToBytes)

      const resCorrect = evalScript(script, stack)
      expect(resCorrect).not.toHaveProperty('error')

      const resIncorrect = evalScript(script, stack.slice(1))
      expect(resIncorrect).toHaveProperty('error')
      expect(resIncorrect.error?.code).toBe(17)
    })
  })
})
