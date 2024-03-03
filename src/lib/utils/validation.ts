import { bech32Alphabet } from './bech32'

export const isNotUndefined = <T>(value: T | null | undefined): value is T => {
  return typeof value !== 'undefined' && value !== null
}

export const isValidHex = (hex: string): boolean => {
  return hex.length % 2 === 0 && /^[\da-f]*$/i.test(hex)
}

export const isValidBech32Data = (input: string): boolean => {
  return Array.from(input).every((letter) =>
    bech32Alphabet.includes(letter.toLowerCase()),
  )
}

export const isValidBech32Hrp = (input: string): boolean => {
  return Array.from(input).every((letter) => {
    // eslint-disable-next-line unicorn/prefer-code-point
    const code = letter.charCodeAt(0)
    return code >= 33 && code <= 126
  })
}

export const validateInputLength = (
  input: Uint8Array,
  length: number,
): void => {
  if (input.length !== length) {
    throw new Error(
      `Input must be exactly ${length} bytes (not ${input.length})`,
    )
  }
}
