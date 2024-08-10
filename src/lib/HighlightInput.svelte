<script lang="ts">
  import { onMount } from 'svelte'
  import { getMax } from '$lib/utils/array'

  export let value: string

  export let highlights: Array<{
    index: number
    length: number
    color: string
  }>

  export let invalid = false

  let highlightsContent: Array<{
    text: string
    color?: string
  }>

  $: {
    const highlightBounds: Array<{
      index: number
      type: 'start' | 'end'
      color: {
        value: string
        priority: number
      }
    }> = []

    for (const [priority, highlight] of highlights.entries()) {
      const end = highlight.index + highlight.length
      const color = {
        value: highlight.color,
        priority,
      }
      highlightBounds.push(
        { type: 'start', index: highlight.index, color },
        { type: 'end', index: end, color },
      )
    }

    highlightBounds.sort((a, b) => a.index - b.index)

    const colors = new Set<{ value: string; priority: number }>()

    highlightsContent = []
    let index = 0
    let color: string | undefined = undefined
    for (const bound of highlightBounds) {
      const newColor =
        colors.size > 0
          ? getMax(Array.from(colors), (item) => item.priority).value
          : undefined
      if (color === newColor && highlightsContent.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        highlightsContent.at(-1)!.text += value.slice(index, bound.index)
      } else {
        color = newColor
        highlightsContent.push({ text: value.slice(index, bound.index), color })
      }

      if (bound.type === 'start') {
        colors.add(bound.color)
      } else {
        colors.delete(bound.color)
      }

      index = bound.index
    }
    highlightsContent.push({ text: value.slice(index) })
  }

  let height = 0
  let textareaElement: HTMLTextAreaElement

  onMount(() => {
    const observer = new ResizeObserver(([el]) => {
      height = el.borderBoxSize[0].blockSize
    })

    observer.observe(textareaElement)

    return () => observer.unobserve(textareaElement)
  })

  let backdropElement: HTMLDivElement
</script>

<div
  style:position="relative"
  style:height={height ? `${height}px` : undefined}
>
  <div
    class="backdrop"
    style:height={`${height}px`}
    bind:this={backdropElement}
  >
    <div
      class="highlights form-control font-monospace"
      class:is-invalid={invalid}
    >
      {#each highlightsContent as item}
        {#if item.color}
          <mark style:background={item.color}>{item.text}</mark>
        {:else}
          {item.text}
        {/if}
      {/each}
    </div>
  </div>
  <textarea
    class="form-control font-monospace"
    class:is-invalid={invalid}
    style:position={height ? 'absolute' : undefined}
    style:z-index="2"
    style:background-color="transparent"
    spellcheck={false}
    rows={3}
    bind:value
    bind:this={textareaElement}
    on:scroll={() => (backdropElement.scrollTop = textareaElement.scrollTop)}
  />
</div>

<style>
  .backdrop {
    width: 100%;
    position: absolute;
    z-index: 1;
    pointer-events: none;
    overflow: auto;
    scrollbar-color: transparent transparent;
  }

  .highlights {
    border-color: transparent;
    background: none;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .highlights,
  .highlights mark {
    color: transparent;
  }

  .highlights mark {
    padding: 0;
    background: #b1d5e5;
    border-radius: 3px;
  }
</style>
