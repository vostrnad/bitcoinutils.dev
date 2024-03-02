<script lang="ts">
  import { formatErrorOutput } from './utils/error'

  export let invalidReason: string | undefined = undefined
  export let disabled: boolean | undefined = undefined
  export let showEmpty = false
  export let output: string | undefined

  $: isValid = !invalidReason
</script>

{#if invalidReason || output || disabled || showEmpty}
  <p
    class="font-monospace p-3 rounded text-break"
    class:bg-success-subtle={!disabled && isValid}
    class:bg-danger-subtle={!disabled && !isValid}
    class:bg-secondary-subtle={disabled}
    style:white-space="pre-wrap"
  >
    {#if disabled}
      <br />
    {:else if invalidReason}
      {formatErrorOutput(invalidReason)}
    {:else if output === ''}
      <br />
    {:else}
      {output}
    {/if}
  </p>
{/if}
