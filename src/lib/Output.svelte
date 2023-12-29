<script lang="ts">
  export let invalidReason: string | undefined
  export let output: string | undefined

  let isValid: boolean
  $: isValid = !invalidReason
</script>

{#if invalidReason || output}
  <p
    class="font-monospace p-3 rounded text-break"
    class:bg-success-subtle={isValid}
    class:bg-danger-subtle={!isValid}
  >
    {invalidReason ? `Error: ${invalidReason}.` : output}
  </p>
{/if}
