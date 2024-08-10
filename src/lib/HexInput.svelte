<script lang="ts">
  import { Input } from '@sveltestrap/sveltestrap'
  import { createEventDispatcher } from 'svelte'
  import { hexToUint8Array } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  export let input: string

  export let invalid = false

  export let disabled = false

  export let rows: number | undefined = undefined

  export let stripLeadingZeros = false

  let lastValidInput = ''

  const dispatch = createEventDispatcher<{
    change: Uint8Array
    focus: undefined
    blur: undefined
  }>()

  $: {
    invalid = false

    input = input.trim()

    if (isValidHex(input)) {
      if (input !== lastValidInput) {
        lastValidInput = stripLeadingZeros ? input.replace(/^(00)*/, '') : input
        dispatch('change', hexToUint8Array(lastValidInput))
      }
    } else {
      invalid = true
    }
  }
</script>

<Input
  class="font-monospace"
  spellcheck={false}
  {rows}
  {invalid}
  {disabled}
  on:blur={(e) => {
    if (invalid) {
      input = lastValidInput
    } else if (stripLeadingZeros) {
      input = input.replace(/^(00)*/, '')
      lastValidInput = input
    }
    if (e.currentTarget.value !== input) {
      e.currentTarget.value = input
    }
    dispatch('blur')
  }}
  on:focus={() => dispatch('focus')}
  bind:value={input}
/>
