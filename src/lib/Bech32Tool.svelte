<script lang="ts">
  import { bech32, bech32m } from '@scure/base'
  import { FormGroup, Input, Label } from '@sveltestrap/sveltestrap'
  import { bech32TextToWords, bech32WordsToText } from '$lib/bech32'
  import { hexToUint8Array, uint8ArrayToHex } from '$lib/uintarray'
  import {
    isValidBech32Data,
    isValidBech32Hrp,
    isValidHex,
  } from '$lib/validation'

  export let encoding: 'bech32' | 'bech32m'

  let encodingName: string
  let encoder: typeof bech32 | typeof bech32m
  $: {
    encodingName = encoding === 'bech32' ? 'Bech32' : 'Bech32m'
    encoder = encoding === 'bech32' ? bech32 : bech32m
  }

  let versionNumber: number | null = encoding === 'bech32' ? 0 : 1
  let invalidVersionReason: string | undefined

  $: {
    if (typeof versionNumber === 'number') {
      if (versionNumber > 31) versionNumber = 31
      if (versionNumber < 0) versionNumber = 0
      if (!Number.isInteger(versionNumber)) {
        versionNumber = Math.floor(versionNumber)
      }
      if (Number.isNaN(versionNumber)) versionNumber = null
    }

    invalidVersionReason = undefined
    if (typeof versionNumber === 'number') {
      if (['bc', 'tb', 'bcrt'].includes(hrp.toLowerCase())) {
        if (encoding === 'bech32' && versionNumber !== 0) {
          invalidVersionReason = 'SegWit versions higher than 0 use Bech32m'
        }
        if (encoding === 'bech32m' && versionNumber === 0) {
          invalidVersionReason = 'SegWit version 0 uses Bech32'
        }
        if (encoding === 'bech32m' && versionNumber > 16) {
          invalidVersionReason = 'SegWit versions only go up to 16'
        }
      }
    }
  }

  let hrp = 'bc'
  let hexInput = ''
  let bech32Input = ''

  $: hrp = hrp.trim()

  let inputUint8Array = new Uint8Array()

  let output: string | undefined
  let invalidInputType: 'hex' | 'bech32' | undefined
  let invalidInputReason: string | undefined

  let invalidReason: string | undefined
  let invalidHrpReason: string | undefined

  $: {
    invalidReason = undefined
    invalidHrpReason = undefined

    const hrpHasInvalidCharacters = !isValidBech32Hrp(hrp)
    if (hrp.length === 0) {
      invalidHrpReason = 'Human-readable part cannot be empty'
    } else if (hrpHasInvalidCharacters) {
      invalidHrpReason = ''
      invalidReason = 'Human-readable part has invalid characters'
    } else if (hrp.length > 83) {
      invalidHrpReason = 'Human-readable part is too long'
    } else if (
      ['sp', 'tsp', 'sprt'].includes(hrp.toLowerCase()) &&
      encoding === 'bech32'
    ) {
      invalidHrpReason = 'Silent payment addresses use Bech32m'
    }

    if (invalidInputReason && !invalidReason) {
      invalidReason = invalidInputReason
    }

    if (!invalidReason) {
      let words = encoder.toWords(inputUint8Array)
      if (typeof versionNumber === 'number') {
        words = [versionNumber, ...words]
      }
      output = encoder.encode(hrp, words, false)
    }
  }

  const handleVersionKeyDown = (
    e: KeyboardEvent & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    const key = e.key.toLowerCase()
    if (
      !/^\d$/.test(key) &&
      key !== 'backspace' &&
      !key.startsWith('arrow') &&
      !e.ctrlKey
    ) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleVersionInput = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    e.currentTarget.value = e.currentTarget.value.replace(/^0+(.)/, '$1')
  }

  const handleHexInput = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    hexInput = e.currentTarget.value.trim()
    if (isValidHex(hexInput)) {
      inputUint8Array = hexToUint8Array(hexInput)
      bech32Input = bech32WordsToText(encoder.toWords(inputUint8Array))
      invalidInputType = undefined
      invalidInputReason = undefined
    } else {
      bech32Input = ''
      invalidInputType = 'hex'
      invalidInputReason = 'Input is not valid hex'
    }
  }

  const handleBech32Input = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    bech32Input = e.currentTarget.value.trim()
    if (isValidBech32Data(bech32Input)) {
      const words = bech32TextToWords(bech32Input)
      try {
        inputUint8Array = encoder.fromWords(words)
        hexInput = uint8ArrayToHex(inputUint8Array)
        invalidInputType = undefined
        invalidInputReason = undefined
      } catch (error) {
        hexInput = ''
        invalidInputType = 'bech32'
        if (error instanceof Error) {
          let errorMessage = error.message
          if (/^Non-zero padding: \d+$/.test(error.message)) {
            errorMessage = 'Non-zero padding'
          }
          invalidInputReason = errorMessage
        } else {
          invalidInputReason = `Input is not valid ${encodingName}`
        }
      }
    } else {
      hexInput = ''
      invalidInputType = 'bech32'
      invalidInputReason = `Invalid characters in ${encodingName} input`
    }
  }
</script>

<h2 class="mb-3">{encodingName}</h2>
<FormGroup class="mb-3">
  <Label>Human-readable part</Label>
  <Input
    class="font-monospace w-auto"
    type="text"
    spellcheck={false}
    invalid={invalidHrpReason !== undefined}
    feedback={invalidHrpReason}
    bind:value={hrp}
  />
</FormGroup>

<FormGroup class="mb-3">
  <Label>Version number (optional)</Label>
  <Input
    class="font-monospace w-auto"
    type="number"
    min={0}
    max={31}
    step={1}
    invalid={invalidVersionReason !== undefined}
    feedback={invalidVersionReason}
    bind:value={versionNumber}
    on:input={handleVersionInput}
    on:keydown={handleVersionKeyDown}
  />
</FormGroup>

<FormGroup class="mb-3">
  <Label>Hex-encoded data</Label>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={invalidInputType === 'hex'}
    bind:value={hexInput}
    on:input={handleHexInput}
  />
</FormGroup>

<FormGroup class="mb-3">
  <Label>{encodingName}-encoded data</Label>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={invalidInputType === 'bech32'}
    bind:value={bech32Input}
    on:input={handleBech32Input}
  />
</FormGroup>

<p
  class="font-monospace p-3 rounded text-break"
  class:bg-success-subtle={!invalidReason}
  class:bg-danger-subtle={Boolean(invalidReason)}
>
  {invalidReason ? `Error: ${invalidReason}.` : output}
</p>
