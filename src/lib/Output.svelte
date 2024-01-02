<script lang="ts">
  export let invalidReason: string | undefined
  export let output: string | undefined

  $: isValid = !invalidReason
  $: lines = output?.split('\n') || []
</script>

{#if invalidReason || output}
  <p
    class="font-monospace p-3 rounded text-break"
    class:bg-success-subtle={isValid}
    class:bg-danger-subtle={!isValid}
  >
    {#if invalidReason}
      Error: {invalidReason}.
    {:else}
      {#each lines as line}
        {line}
        <br />
      {/each}
    {/if}
  </p>
{/if}
