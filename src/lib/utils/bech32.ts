export const bech32Alphabet = Array.from('qpzry9x8gf2tvdw0s3jn54khce6mua7l')

export const bech32AlphabetInverse = bech32Alphabet.reduce<
  Partial<Record<string, number>>
>((res, letter, index) => {
  res[letter] = index
  return res
}, {})

export const bech32WordsToText = (words: number[]): string => {
  return words.map((word) => bech32Alphabet[word]).join('')
}

export const bech32TextToWords = (text: string): number[] => {
  return Array.from(text).map(
    (letter) => bech32AlphabetInverse[letter.toLowerCase()] ?? -1,
  )
}
