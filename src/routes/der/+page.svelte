<script lang="ts">
  import { FormGroup, Input, Label } from '@sveltestrap/sveltestrap'
  import HexInput from '$lib/HexInput.svelte'
  import HighlightInput from '$lib/HighlightInput.svelte'
  import InputLength from '$lib/InputLength.svelte'
  import Output from '$lib/Output.svelte'
  import { derSignatureInput as input } from '$lib/stores/inputs'
  import {
    type DecodeDERSignatureResult,
    getSighashFlagByte,
    getSighashFlagName,
    serializeDERSignature,
    tryDecodeDERSignature,
  } from '$lib/utils/bitcoin/signature'
  import {
    bytesToHex,
    hexToBytes,
    uint8ArrayUIntBEEqual,
  } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  let isValidAsHex: boolean

  let rString = ''
  let sString = ''
  let sighashString = ''

  let highlighted: 'r' | 's' | 'sighash' | undefined = undefined

  let decodeRes: DecodeDERSignatureResult | undefined = undefined

  let invalidReason: string | undefined

  $: {
    invalidReason = undefined

    $input = $input.trim()
    isValidAsHex = isValidHex($input)
    if (isValidAsHex) {
      decodeRes = tryDecodeDERSignature(hexToBytes($input))
      if (decodeRes.error) {
        invalidReason = decodeRes.error.text
      }
      rString = decodeRes.r
        ? bytesToHex(decodeRes.r.value).replace(/^00/, '')
        : ''
      sString = decodeRes.s
        ? bytesToHex(decodeRes.s.value).replace(/^00/, '')
        : ''
      sighashString = decodeRes.sighash
        ? getSighashFlagName(decodeRes.sighash.value) || ''
        : ''

      switch (highlighted) {
        case 'r':
          if (decodeRes.r) {
            setHighlight(
              decodeRes.r.pos,
              decodeRes.r.pos + decodeRes.r.value.length,
            )
          } else {
            clearHighlight()
          }
          break
        case 's':
          if (decodeRes.s) {
            setHighlight(
              decodeRes.s.pos,
              decodeRes.s.pos + decodeRes.s.value.length,
            )
          } else {
            clearHighlight()
          }
          break
        case 'sighash':
          if (decodeRes.sighash) {
            setHighlight(decodeRes.sighash.pos, decodeRes.sighash.pos + 1)
          } else {
            clearHighlight()
          }
          break
        default:
          clearHighlight()
      }
    } else {
      decodeRes = undefined
      rString = ''
      sString = ''
      sighashString = ''
      invalidReason = 'Input is not valid hex'
    }
  }

  let highlights: Array<{
    index: number
    length: number
    color: string
  }> = []

  const setHighlight = (start: number, end: number) => {
    highlights = [
      {
        index: start * 2,
        length: (end - start) * 2,
        color: 'var(--highlight-primary)',
      },
    ]
  }

  const clearHighlight = () => {
    highlights = []
  }
</script>

<svelte:head>
  <title>DER signature - bitcoinutils.dev</title>
</svelte:head>

<h2 class="mb-3">DER signature</h2>
<p>This tool allows you to decode or create a DER signature.</p>

<FormGroup>
  <HighlightInput
    bind:value={$input}
    highlights={[
      ...(decodeRes?.error?.location
        ? [
            {
              index: 2 * decodeRes.error.location[0],
              length:
                2 * (decodeRes.error.location[1] - decodeRes.error.location[0]),
              color: 'var(--bs-danger-bg-subtle)',
            },
          ]
        : []),
      ...highlights,
    ]}
  />
  <InputLength
    bind:input={$input}
    type="hex"
    isValid={isValidAsHex}
    defaultValue="300602010002010001"
  />
</FormGroup>

{#if invalidReason}
  <Output {invalidReason} output={undefined} />
{/if}

<FormGroup>
  <Label>r-value</Label>
  <HexInput
    stripLeadingZeros
    disabled={!isValidAsHex}
    on:focus={() => (highlighted = 'r')}
    on:blur={() => (highlighted = undefined)}
    on:change={(e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const r = e.detail
      if (
        decodeRes?.r &&
        decodeRes.s &&
        decodeRes.sighash &&
        !uint8ArrayUIntBEEqual(r, decodeRes.r.value)
      ) {
        $input = bytesToHex(
          serializeDERSignature(r, decodeRes.s.value, decodeRes.sighash.value),
        )
      }
    }}
    input={rString}
  />
  <InputLength
    bind:input={rString}
    type="hex"
    isValid={isValidAsHex}
    showResetButton={false}
  />
</FormGroup>

<FormGroup>
  <Label>s-value</Label>
  <HexInput
    stripLeadingZeros
    disabled={!isValidAsHex}
    on:focus={() => (highlighted = 's')}
    on:blur={() => (highlighted = undefined)}
    on:change={(e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const s = e.detail
      if (
        decodeRes?.r &&
        decodeRes.s &&
        decodeRes.sighash &&
        !uint8ArrayUIntBEEqual(s, decodeRes.s.value)
      ) {
        $input = bytesToHex(
          serializeDERSignature(decodeRes.r.value, s, decodeRes.sighash.value),
        )
      }
    }}
    input={sString}
  />
  <InputLength
    bind:input={sString}
    type="hex"
    isValid={isValidAsHex}
    showResetButton={false}
  />
</FormGroup>

<FormGroup>
  <Label>Sighash flag</Label>
  <Input
    class="w-auto"
    type="select"
    value={sighashString}
    disabled={!isValidAsHex}
    on:focus={() => (highlighted = 'sighash')}
    on:blur={() => (highlighted = undefined)}
    on:change={(e) => {
      const sighash = getSighashFlagByte(e.currentTarget.value || '')
      if (
        decodeRes?.r &&
        decodeRes.s &&
        decodeRes.sighash &&
        sighash !== undefined &&
        sighash !== decodeRes.sighash.value
      ) {
        $input = bytesToHex(
          serializeDERSignature(decodeRes.r.value, decodeRes.s.value, sighash),
        )
      }
    }}
  >
    <option value="all">ALL</option>
    <option value="none">NONE</option>
    <option value="single">SINGLE</option>
    <option value="all-acp">ALL | ANYONECANPAY</option>
    <option value="none-acp">NONE | ANYONECANPAY</option>
    <option value="single-acp">SINGLE | ANYONECANPAY</option>
  </Input>
</FormGroup>

<style>
  :global(:root) {
    --highlight-primary: #b3e5fc;
  }

  :global([data-bs-theme='dark']) {
    --highlight-primary: #15648c;
  }
</style>
