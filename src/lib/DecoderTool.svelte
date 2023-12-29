<script lang="ts">
  import { FormGroup, Input } from '@sveltestrap/sveltestrap'
  import { decoderInput as input } from './stores/inputs'
  import Output from '$lib/Output.svelte'
  import { hexToUint8Array } from '$lib/uintarray'
  import { isValidHex } from '$lib/validation'

  export let encoding: string
  export let name: string
  export let description: string

  let output: string
  let isValid: boolean
  $: {
    $input = $input.trim()
    isValid = isValidHex($input)
    if (isValid) {
      output = new TextDecoder(encoding).decode(hexToUint8Array($input))
    }
  }
</script>

<h2 class="mb-3">{name}</h2>
<p>{description}</p>

<FormGroup class="mb-3">
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
