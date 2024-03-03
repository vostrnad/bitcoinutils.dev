<script lang="ts">
  import { FormGroup, Input } from '@sveltestrap/sveltestrap'
  import { getContext } from 'svelte'
  import type { Writable } from 'svelte/store'
  import { hashInput as input } from './stores/inputs'
  import Output from '$lib/Output.svelte'
  import { hexToUint8Array, uint8ArrayToHex } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  const type = getContext<Writable<'utf8' | 'hex'>>('hashInputType')

  export let hash: (input: string | Uint8Array) => Uint8Array
  export let title: string
  export let description: string

  let output: string
  let isValid: boolean
  $: {
    if ($type === 'hex') $input = $input.trim()
    isValid = $type !== 'hex' || isValidHex($input)
    if (isValid) {
      switch ($type) {
        case 'hex':
          output = uint8ArrayToHex(hash(hexToUint8Array($input)))
          break
        default:
          output = uint8ArrayToHex(hash($input))
      }
    }
  }
</script>

<h2 class="mb-3">{title}</h2>
<p>{description}</p>

<FormGroup>
  <Input class="w-auto" type="select" bind:value={$type}>
    <option value="utf8">UTF-8</option>
    <option value="hex">Hex</option>
  </Input>
</FormGroup>

<FormGroup>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={!isValid}
    bind:value={$input}
  />
</FormGroup>

<Output
  invalidReason={!isValid ? 'Input is not valid hex' : undefined}
  {output}
/>
