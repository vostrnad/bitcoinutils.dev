<script lang="ts">
  import { Input } from '@sveltestrap/sveltestrap'
  import { hexToUint8Array, uint8ArrayToHex } from '$lib/uintarray'

  export let hash: (input: string | Uint8Array) => Uint8Array
  export let title: string
  export let description: string

  const isValidHex = (hex: string) => {
    return hex.length % 2 === 0 && /^[\da-f]*$/i.test(hex)
  }

  let type = 'utf8'
  let input = ''
  let output: string
  let isValid: boolean
  $: {
    if (type === 'hex') input = input.trim()
    isValid = type !== 'hex' || isValidHex(input)
    if (isValid) {
      switch (type) {
        case 'hex':
          output = uint8ArrayToHex(hash(hexToUint8Array(input)))
          break
        default:
          output = uint8ArrayToHex(hash(input))
      }
    }
  }
</script>

<h2 class="mb-3">{title}</h2>
<p>{description}</p>
<Input class="w-auto mb-3" type="select" bind:value={type}>
  <option value="utf8">UTF-8</option>
  <option value="hex">Hex</option>
</Input>
<Input
  class="font-monospace"
  type="textarea"
  rows={3}
  invalid={!isValid}
  bind:value={input}
/>
<p
  class="font-monospace mt-3 p-3 rounded"
  class:bg-success-subtle={isValid}
  class:bg-danger-subtle={!isValid}
>
  {!isValid ? 'Error: Input is not valid hex.' : output}
</p>
