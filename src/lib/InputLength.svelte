<script lang="ts">
  import { FormText } from '@sveltestrap/sveltestrap'
  import { createEventDispatcher } from 'svelte'
  import LinkButton from '$lib/LinkButton.svelte'
  import { pluralize } from '$lib/utils/lang'

  export let input: string

  export let type: 'hex' | 'utf8'

  export let isValid: boolean

  let inputLengthStr: string
  $: {
    if (isValid) {
      switch (type) {
        case 'hex': {
          const byteCount = input.length / 2
          inputLengthStr = `${byteCount} ${pluralize(byteCount, 'byte')}`
          break
        }
        case 'utf8': {
          const charCount = input.length
          inputLengthStr = `${charCount} ${pluralize(charCount, 'character')}`
          break
        }
      }
    } else {
      inputLengthStr = 'N/A'
    }
  }

  const dispatch = createEventDispatcher()
</script>

<FormText class="d-flex justify-content-between">
  <span>Length: {inputLengthStr}</span>
  {#if input.length > 0}
    <LinkButton on:click={() => dispatch('clear')}>Clear</LinkButton>
  {/if}
</FormText>
