<script lang="ts">
  import { onMount } from 'svelte'
  import { setFieldText } from 'text-field-edit'
  import { isValidScriptToken } from '$lib/utils/bitcoin/script/encode'
  import { opcodeNames } from '$lib/utils/bitcoin/script/opcodes'
  import { getCaretCoordinates } from '$lib/utils/frontend/caret'
  import { isFirefox } from '$lib/utils/frontend/vendor'
  import { mod } from '$lib/utils/number'

  export let value: string

  export let invalid = false

  interface Token {
    text: string
    position: number
    color?: string
    invalid?: boolean
  }

  let tokenizedInput: Token[]

  let cursorPosition = 0

  let shouldCheckForNewCurrentToken = false
  let currentlyEditingToken: Token | undefined

  let suggestedOpcodes: string[] = []
  $: if (currentlyEditingToken) {
    const tokenUpper = currentlyEditingToken.text.toUpperCase()
    suggestedOpcodes = opcodeNames
      .filter((opcode) => opcode.includes(tokenUpper))
      .sort((a, b) => {
        if (a === tokenUpper) return -1
        if (b === tokenUpper) return 1
        if (a.replace(/^OP_/, '') === tokenUpper) return -1
        if (b.replace(/^OP_/, '') === tokenUpper) return 1
        return a.indexOf(tokenUpper) - b.indexOf(tokenUpper)
      })
  }

  let selectedSuggestion: string | undefined
  $: {
    if (!currentlyEditingToken || suggestedOpcodes.length === 0) {
      selectedSuggestion = undefined
    }
    if (selectedSuggestion && !suggestedOpcodes.includes(selectedSuggestion)) {
      selectedSuggestion = undefined
    }
    if (
      !selectedSuggestion &&
      currentlyEditingToken &&
      suggestedOpcodes.length > 0
    ) {
      selectedSuggestion = suggestedOpcodes[0]
    }
  }

  $: {
    tokenizedInput = []
    let index = 0
    for (const match of (value || '').matchAll(/\S+/g)) {
      const token = match[0]
      let color: string | undefined
      if (token.startsWith('OP_')) {
        color = 'var(--syntax-code)'
      } else if (/^[\da-f]+$/i.test(token)) {
        color = 'var(--syntax-data)'
      }
      tokenizedInput.push(
        { text: value.slice(index, match.index), position: index },
        {
          text: token,
          position: match.index,
          color,
          invalid: !isValidScriptToken(token),
        },
      )
      index = match.index + token.length
    }
    if (index < value.length) {
      tokenizedInput.push({ text: value.slice(index), position: index })
    }
  }

  $: if (shouldCheckForNewCurrentToken) {
    shouldCheckForNewCurrentToken = false

    const token = tokenizedInput.findLast(
      ({ position }) => position < cursorPosition,
    )
    if (token !== currentlyEditingToken) {
      currentlyEditingToken = token
    }
  }

  export let width = 0
  export let height = 0
  let textareaElement: HTMLTextAreaElement

  onMount(() => {
    const resizeObserver = new ResizeObserver(([el]) => {
      const newWidth = el.borderBoxSize[0].inlineSize
      if (newWidth) {
        width = newWidth
      }
      const newHeight = el.borderBoxSize[0].blockSize
      if (newHeight) {
        height = newHeight
      }
    })

    let visible = false

    const intersectionObserver = new IntersectionObserver(
      ([el]) => {
        const newVisible = el.isIntersecting
        // Firefox scrolls the textarea to top when it becomes hidden which
        // causes the backdrop to get out of sync, the best solution is to
        // scroll the textarea back when it becomes visible again.
        if (isFirefox && !visible && newVisible) {
          textareaElement.scrollTop = scrollTop
        }
        visible = newVisible
      },
      { root: document.documentElement },
    )

    resizeObserver.observe(textareaElement)
    intersectionObserver.observe(textareaElement)

    return () => {
      resizeObserver.unobserve(textareaElement)
      intersectionObserver.unobserve(textareaElement)
    }
  })

  let backdropElement: HTMLDivElement

  let autocompletionElement: HTMLDivElement

  let scrollTop = 0
  let autocompletionCoords = [0, 0]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  $: if (textareaElement && currentlyEditingToken && width) {
    const coords = getCaretCoordinates(
      textareaElement,
      currentlyEditingToken.position,
    )
    // TODO: actually measure autocomplete element
    autocompletionCoords = [
      Math.min(coords.left - 4, width - 204),
      coords.top + coords.height - scrollTop,
    ]
  }

  const applySuggestion = (suggestion: string) => {
    const textTokens = tokenizedInput.map(({ text }) => text)
    const currentTokenIndex = currentlyEditingToken
      ? tokenizedInput.indexOf(currentlyEditingToken)
      : tokenizedInput.length - 1
    const beforeCursor =
      textTokens.slice(0, currentTokenIndex).join('') + suggestion
    const afterCursor = textTokens.slice(currentTokenIndex + 1).join('')
    value = beforeCursor + afterCursor
    // needed so selection range works
    setFieldText(textareaElement, value)
    currentlyEditingToken = undefined
    shouldCheckForNewCurrentToken = false
    textareaElement.setSelectionRange(beforeCursor.length, beforeCursor.length)
  }
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
      {#each tokenizedInput as item}
        {#if item.color || item.invalid}
          <span style:color={item.color} class:invalid={item.invalid}
            >{item.text}</span
          >
        {:else}
          {item.text}
        {/if}
      {/each}
      <br />
    </div>
  </div>
  <textarea
    class="form-control font-monospace"
    class:is-invalid={invalid}
    style:position={height ? 'absolute' : undefined}
    style:z-index="2"
    style:color={height ? 'transparent' : undefined}
    style:caret-color="var(--bs-body-color)"
    style:background-color="transparent"
    style:border-top-left-radius="0"
    style:border-top-right-radius="0"
    style:height={height ? `${height}px` : undefined}
    spellcheck={false}
    rows={6}
    bind:value
    bind:this={textareaElement}
    on:scroll={() => {
      scrollTop = textareaElement.scrollTop
      backdropElement.scrollTop = textareaElement.scrollTop
    }}
    on:keydown={(e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        currentlyEditingToken = undefined
      }
      if (
        (e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
        currentlyEditingToken &&
        suggestedOpcodes.length > 0
      ) {
        e.preventDefault()
        const increment = e.key === 'ArrowDown' ? 1 : -1
        const currentIndex = suggestedOpcodes.indexOf(selectedSuggestion || '')
        const newIndex =
          currentIndex === -1
            ? 0
            : mod(currentIndex + increment, suggestedOpcodes.length)
        selectedSuggestion = suggestedOpcodes[newIndex]
        autocompletionElement
          .querySelectorAll('li')
          .item(newIndex)
          .scrollIntoView({
            block: 'nearest',
            behavior: 'instant',
          })
      }
      if (e.key === 'Enter' && selectedSuggestion) {
        e.preventDefault()
        applySuggestion(selectedSuggestion)
      }
      if (e.key === 'Backspace') {
        selectedSuggestion = undefined
        suggestedOpcodes = []
      }
    }}
    on:input={() => {
      cursorPosition = textareaElement.selectionStart
      shouldCheckForNewCurrentToken = true
    }}
    on:click={() => {
      currentlyEditingToken = undefined
    }}
  />
  <div
    class="autocompletion font-monospace border shadow-sm"
    style:z-index="3"
    style:display={currentlyEditingToken &&
    suggestedOpcodes.length > 0 &&
    autocompletionCoords[1] > -4 &&
    autocompletionCoords[1] < height + 20
      ? 'initial'
      : 'none'}
    style:left={`${autocompletionCoords[0]}px`}
    style:top={`${autocompletionCoords[1]}px`}
    bind:this={autocompletionElement}
  >
    <ul>
      {#each suggestedOpcodes as opcode}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          class:selected={selectedSuggestion === opcode}
          on:click={() => applySuggestion(opcode)}
        >
          {opcode}
        </li>
      {/each}
    </ul>
  </div>
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

    --syntax-data: #58c554;
    --syntax-code: #fc6f09;
  }

  .highlights .invalid {
    text-decoration: underline wavy red;
  }

  .autocompletion {
    position: absolute;
    color: var(--bs-dark);
    background-color: var(--bs-light);
    border: 1px solid #ddd;
    min-width: 12rem;
    max-height: 12rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .autocompletion ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .autocompletion ul li {
    padding-inline: 0.25rem;
    cursor: pointer;
  }

  .autocompletion ul li:hover {
    background-color: #e4eeff;
  }

  .autocompletion ul li.selected {
    background-color: #aecbfd;
  }
</style>
