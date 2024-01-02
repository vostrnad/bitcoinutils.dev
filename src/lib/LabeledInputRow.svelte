<script lang="ts">
  import HelpTooltip from '$lib/HelpTooltip.svelte'

  export let label: string
  export let tooltip: string | undefined = undefined
  export let disabled = false
</script>

<div class="row">
  <div class="col-auto d-flex align-items-center">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="col-form-label" class:text-muted={disabled}>{label}</label>
    {#if tooltip}
      <HelpTooltip class="ms-2">{tooltip}</HelpTooltip>
    {/if}
  </div>
  <div class="col">
    <slot />
  </div>
</div>
