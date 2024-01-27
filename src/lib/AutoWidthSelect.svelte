<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'

  let className = ''
  export { className as class }

  export let value: string

  let width = 0
  let dummy: HTMLSelectElement

  onMount(() => {
    const observer = new ResizeObserver(([el]) => {
      width = el.borderBoxSize[0].inlineSize
    })

    observer.observe(dummy)

    return () => observer.unobserve(dummy)
  })

  const dispatch = createEventDispatcher()

  $: dispatch('change', { value })
</script>

<select class={className} style:width={`${width + 2}px`} bind:value>
  <slot />
</select>
<select
  bind:this={dummy}
  class={className}
  style:visibility="hidden"
  style:position="absolute"
  style:height={0}
>
  <option>{value}</option>
</select>
