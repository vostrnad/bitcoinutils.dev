import { writable } from 'svelte/store'

export const hashInput = writable('')

export const hexInput = writable('')

export const bech32Input = writable('')

export const hrpInput = writable('bc')

export const versionNumberInput = writable<number | null>(0)

export const invalidBech32InputType = writable<'hex' | 'bech32' | undefined>()

export const invalidBech32InputReason = writable<string | undefined>()

export const decoderInput = writable('')

export const scriptInput = writable('')

export const privateKeyInput = writable('')

export const derSignatureInput = writable('300602010002010001')
