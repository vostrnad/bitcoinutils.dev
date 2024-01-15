<script lang="ts">
  import { formatErrorOutput } from './utils/error'

  export let invalidReason: string | undefined = undefined
  export let disabled: boolean | undefined = undefined
  export let showEmpty = false
  export let output: string | undefined

  $: isValid = !invalidReason
  $: lines = output?.split('\n') || []
</script>

{#if invalidReason || output || disabled || showEmpty}
  <p
    class="font-monospace p-3 rounded text-break"
    class:bg-success-subtle={!disabled && isValid}
    class:bg-danger-subtle={!disabled && !isValid}
    class:bg-secondary-subtle={disabled}
  >
    {#if disabled}
      <br />
    {:else if invalidReason}
      {formatErrorOutput(invalidReason)}
    {:else}
      {#each lines as line}
        {line}
        <br />
      {/each}
    {/if}
  </p>
{/if}
