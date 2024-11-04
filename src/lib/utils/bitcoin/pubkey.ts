export const isCompressedKey = (pubkey: Uint8Array): boolean => {
  return pubkey.length === 33 && (pubkey[0] === 0x02 || pubkey[0] === 0x03)
}

export const isUncompressedKey = (pubkey: Uint8Array): boolean => {
  return pubkey.length === 65 && pubkey[0] === 0x04
}

export const isHybridKey = (pubkey: Uint8Array): boolean => {
  return pubkey.length === 65 && (pubkey[0] === 0x06 || pubkey[0] === 0x07)
}

export const isXOnlyKey = (pubkey: Uint8Array): boolean => {
  return pubkey.length === 32
}

export const isAnyPreTapscriptKey = (pubkey: Uint8Array): boolean => {
  return (
    isCompressedKey(pubkey) || isUncompressedKey(pubkey) || isHybridKey(pubkey)
  )
}

export const isAnyKnownPublicKey = (pubkey: Uint8Array): boolean => {
  return isAnyPreTapscriptKey(pubkey) || isXOnlyKey(pubkey)
}
