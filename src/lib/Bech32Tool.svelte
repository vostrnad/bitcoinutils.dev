<script lang="ts">
  import { type Bech32, bech32, bech32m } from '@scure/base'
  import { FormGroup, Input, Label } from '@sveltestrap/sveltestrap'
  import IntegerInput from '$lib/IntegerInput.svelte'
  import Output from '$lib/Output.svelte'
  import {
    bech32Input,
    hexInput,
    hrpInput as hrp,
    invalidBech32InputReason as invalidInputReason,
    invalidBech32InputType as invalidInputType,
    versionNumberInput as versionNumber,
  } from '$lib/stores/inputs'
  import { bech32TextToWords, bech32WordsToText } from '$lib/utils/bech32'
  import { bytesToHex, hexToBytes } from '$lib/utils/uintarray'
  import {
    isValidBech32Data,
    isValidBech32Hrp,
    isValidHex,
  } from '$lib/utils/validation'

  export let encoding: 'bech32' | 'bech32m'

  const segwitPrefixes = new Set(['bc', 'tb', 'bcrt'])
  const silentPaymentsPrefixes = new Set(['sp', 'tsp', 'sprt'])

  let encodingName: string
  let encoder: Bech32
  $: {
    encodingName = encoding === 'bech32' ? 'Bech32' : 'Bech32m'
    encoder = encoding === 'bech32' ? bech32 : bech32m
  }

  if (segwitPrefixes.has($hrp.toLowerCase())) {
    if (encoding === 'bech32' && $versionNumber === 1) {
      $versionNumber = 0
    }
    if (encoding === 'bech32m' && $versionNumber === 0) {
      $versionNumber = 1
    }
  }

  let invalidVersionReason: string | undefined

  $: {
    invalidVersionReason = undefined
    if (typeof $versionNumber === 'number') {
      if (segwitPrefixes.has($hrp.toLowerCase())) {
        if (encoding === 'bech32' && $versionNumber !== 0) {
          invalidVersionReason = 'SegWit versions higher than 0 use Bech32m'
        }
        if (encoding === 'bech32m' && $versionNumber === 0) {
          invalidVersionReason = 'SegWit version 0 uses Bech32'
        }
        if (encoding === 'bech32m' && $versionNumber > 16) {
          invalidVersionReason = 'SegWit versions only go up to 16'
        }
      }
    }
  }

  $: $hrp = $hrp.trim()

  let inputUint8Array = new Uint8Array()

  if (!$invalidInputReason && isValidHex($hexInput)) {
    inputUint8Array = hexToBytes($hexInput)
  }

  let output: string | undefined

  let invalidReason: string | undefined
  let invalidHrpReason: string | undefined

  $: {
    invalidReason = undefined
    invalidHrpReason = undefined

    const hrpHasInvalidCharacters = !isValidBech32Hrp($hrp)
    if ($hrp.length === 0) {
      invalidHrpReason = ''
      invalidReason = 'Human-readable part cannot be empty'
    } else if (hrpHasInvalidCharacters) {
      invalidHrpReason = ''
      invalidReason = 'Human-readable part has invalid characters'
    } else if ($hrp.length > 83) {
      invalidHrpReason = 'Human-readable part is too long'
    } else if (
      encoding === 'bech32' &&
      silentPaymentsPrefixes.has($hrp.toLowerCase())
    ) {
      invalidHrpReason = 'Silent payment addresses use Bech32m'
    }

    if ($invalidInputReason && !invalidReason) {
      invalidReason = $invalidInputReason
    }

    if (!invalidReason) {
      let words = encoder.toWords(inputUint8Array)
      if (typeof $versionNumber === 'number') {
        words = [$versionNumber, ...words]
      }
      output = encoder.encode($hrp, words, false)
    }
  }

  const handleHexInput = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    $hexInput = e.currentTarget.value.trim()
    if (isValidHex($hexInput)) {
      inputUint8Array = hexToBytes($hexInput)
      $bech32Input = bech32WordsToText(encoder.toWords(inputUint8Array))
      $invalidInputType = undefined
      $invalidInputReason = undefined
    } else {
      $bech32Input = ''
      $invalidInputType = 'hex'
      $invalidInputReason = 'Input is not valid hex'
    }
  }

  const handleBech32Input = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    $bech32Input = e.currentTarget.value.trim()
    if (isValidBech32Data($bech32Input)) {
      const words = bech32TextToWords($bech32Input)
      try {
        inputUint8Array = encoder.fromWords(words)
        $hexInput = bytesToHex(inputUint8Array)
        $invalidInputType = undefined
        $invalidInputReason = undefined
      } catch (error) {
        $hexInput = ''
        $invalidInputType = 'bech32'
        if (error instanceof Error) {
          let errorMessage = error.message
          if (/^Non-zero padding: \d+$/.test(error.message)) {
            errorMessage = 'Non-zero padding'
          }
          $invalidInputReason = errorMessage
        } else {
          $invalidInputReason = `Input is not valid ${encodingName}`
        }
      }
    } else {
      $hexInput = ''
      $invalidInputType = 'bech32'
      $invalidInputReason = `Invalid characters in ${encodingName} input`
    }
  }
</script>

<h2 class="mb-3">{encodingName}</h2>

<FormGroup>
  <Label>Human-readable part</Label>
  <Input
    class="font-monospace w-auto"
    type="text"
    spellcheck={false}
    invalid={invalidHrpReason !== undefined}
    feedback={invalidHrpReason}
    bind:value={$hrp}
  />
</FormGroup>

<FormGroup>
  <Label>Version number (optional)</Label>
  <IntegerInput
    class="font-monospace w-auto"
    min={0}
    max={31}
    invalidReason={invalidVersionReason}
    bind:value={$versionNumber}
  />
</FormGroup>

<FormGroup>
  <Label>Hex-encoded data</Label>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={$invalidInputType === 'hex'}
    bind:value={$hexInput}
    on:input={handleHexInput}
  />
</FormGroup>

<FormGroup>
  <Label>{encodingName}-encoded data</Label>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={$invalidInputType === 'bech32'}
    bind:value={$bech32Input}
    on:input={handleBech32Input}
  />
</FormGroup>

<Output {invalidReason} {output} />
