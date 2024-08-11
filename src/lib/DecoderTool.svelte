<script lang="ts">
  import { FormGroup, Input } from '@sveltestrap/sveltestrap'
  import { decoderInput as input } from './stores/inputs'
  import Output from '$lib/Output.svelte'
  import { hexToBytes } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  export let encoding: string
  export let name: string
  export let description: string

  let output: string
  let isValid: boolean
  $: {
    $input = $input.trim()
    isValid = isValidHex($input)
    if (isValid) {
      output = new TextDecoder(encoding).decode(hexToBytes($input))
    }
  }
</script>

<h2 class="mb-3">{name}</h2>
<p>{description}</p>

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
