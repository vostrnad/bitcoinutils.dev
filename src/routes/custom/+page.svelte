<script lang="ts">
  import {
    Alert,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormGroup,
    Input,
  } from '@sveltestrap/sveltestrap'
  import { getContext } from 'svelte'
  import { flip } from 'svelte/animate'
  import type { Writable } from 'svelte/store'
  import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { navigating, page } from '$app/stores'
  import AutoWidthSelect from '$lib/AutoWidthSelect.svelte'
  import InputLength from '$lib/InputLength.svelte'
  import Output from '$lib/Output.svelte'
  import { hashInput as input } from '$lib/stores/inputs'
  import { formatErrorOutput, getErrorMessage } from '$lib/utils/error'
  import {
    type CustomFunction,
    parseCustomSequence,
    presets,
    serializeCustomSequence,
  } from '$lib/utils/presets'
  import { hexToUint8Array, uint8ArrayToHex } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  const type: Writable<'utf8' | 'hex'> = getContext('hashInputType')
  const items: Writable<
    Array<{
      id: number
      preset: CustomFunction
    }>
  > = getContext('customFunctionItems')

  // load items from parameter on initial load
  const initialParam = $page.url.searchParams.get('s')
  if (initialParam) {
    $items = parseCustomSequence(initialParam).map((preset) => ({
      id: Math.random(),
      preset,
    }))
  }

  // update URL parameter when items change
  $: if (browser) {
    const serialized = serializeCustomSequence(
      $items.map((item) => item.preset),
    )
    void goto(serialized ? `?s=${serialized}` : '?')
  }

  // if clicked on menu item, restore URL parameter
  $: if ($navigating && !$page.url.searchParams.has('s')) {
    const serialized = serializeCustomSequence(
      $items.map((item) => item.preset),
    )
    if (serialized) {
      void goto(`?s=${serialized}`)
    }
  }

  interface Item {
    id: number
    preset: CustomFunction
  }

  let dragDisabled = true
  let dragging = false

  // eslint-disable-next-line no-undef
  const handleConsider = (e: CustomEvent<DndEvent<Item>>) => {
    dragging = true
    const {
      items: newItems,
      info: { source, trigger },
    } = e.detail
    $items = newItems
    if (
      $type === 'hex' &&
      $items.at(0)?.preset.textInput === true &&
      !isValidHex($input.trim())
    ) {
      $type = 'utf8'
    }
    if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
      dragDisabled = true
    }
  }

  // eslint-disable-next-line no-undef
  const handleFinalize = (e: CustomEvent<DndEvent<Item>>) => {
    const {
      items: newItems,
      info: { source },
    } = e.detail
    $items = newItems
    if (source === SOURCES.POINTER) {
      dragging = false
      dragDisabled = true
    }
  }

  const startDrag = (e: Event) => {
    const targetTagName = (e.target as HTMLElement).tagName
    if (targetTagName !== 'SELECT' && targetTagName !== 'BUTTON') {
      e.preventDefault()
      dragDisabled = false
    }
  }

  const cancelDrag = (e: Event) => {
    if (!dragging) {
      e.preventDefault()
      dragDisabled = true
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) {
      dragDisabled = false
    }
  }

  let invalidReason: string | undefined
  let invalidReasonPosition = 0
  let malformedHexInput = false
  let outputs: string[] = []

  const addFunction = (preset: CustomFunction) => {
    $items = $items.concat([{ id: Math.random(), preset }])
  }

  const removeFunction = (index: number) => {
    $items = $items.slice(0, index).concat($items.slice(index + 1))
  }

  const handleChangeFunction = (
    e: CustomEvent<{ value: string }>,
    index: number,
  ) => {
    const name = e.detail.value
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const preset = presets.find((item) => item.name === name)!
    $items = $items
      .slice(0, index)
      .concat([{ id: $items[index].id, preset }])
      .concat($items.slice(index + 1))
  }

  $: (() => {
    invalidReason = undefined
    malformedHexInput = false
    outputs = []

    if ($items.at(0)?.preset.textInput === false) $type = 'hex'

    if ($type === 'hex') {
      $input = $input.trim()

      if (!isValidHex($input)) {
        malformedHexInput = true
        invalidReason = 'Input is not valid hex'
        invalidReasonPosition = 0
        return
      }
    }

    let temp = $type === 'hex' ? hexToUint8Array($input) : $input

    const functions = $items.map((item) => item.preset)
    for (const [index, preset] of functions.entries()) {
      try {
        if (typeof temp === 'string') {
          if (!preset.textInput) {
            throw new Error('Input must be a byte array (not string)')
          }
          temp = new TextEncoder().encode(temp)
        }
        temp = preset.fn(temp)
      } catch (e) {
        invalidReason = getErrorMessage(e)
        invalidReasonPosition = index
        break
      }
      outputs.push(typeof temp === 'string' ? temp : uint8ArrayToHex(temp))
    }
  })()
</script>

<h2 class="mb-3">Custom</h2>
<p>You can define your own sequence of functions.</p>

<svelte:head>
  <title>Custom - bitcoinutils.dev</title>
</svelte:head>

<FormGroup>
  <Input
    class="w-auto"
    type="select"
    disabled={$items.at(0)?.preset.textInput === false}
    bind:value={$type}
  >
    <option value="utf8">UTF-8</option>
    <option value="hex">Hex</option>
  </Input>
</FormGroup>

<FormGroup>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={Boolean(invalidReason) && invalidReasonPosition === 0}
    bind:value={$input}
  />
  <InputLength
    input={$input}
    type={$type}
    isValid={!malformedHexInput}
    on:clear={() => ($input = '')}
  />
</FormGroup>

<div
  use:dndzone={{
    items: $items,
    dragDisabled,
    dropTargetStyle: {},
    transformDraggedElement: (element, _, index) => {
      if (!element || index === undefined) return
      const formGroup = element.children[0]
      formGroup.children[0].children[0].children[1].textContent = (
        index + 1
      ).toString()
      const outputElement = formGroup.children[1]
      outputElement.classList.remove(
        'bg-success-subtle',
        'bg-danger-subtle',
        'bg-secondary-subtle',
      )
      if (invalidReason && index >= invalidReasonPosition) {
        if (invalidReasonPosition === index) {
          outputElement.textContent = formatErrorOutput(invalidReason)
          outputElement.classList.add('bg-danger-subtle')
        } else {
          outputElement.innerHTML = '<br>'
          outputElement.classList.add('bg-secondary-subtle')
        }
      } else {
        const output = outputs[index]
        if (output) {
          outputElement.textContent = output
        } else {
          outputElement.innerHTML = '<br>'
        }
        outputElement.classList.add('bg-success-subtle')
      }
    },
  }}
  on:consider={handleConsider}
  on:finalize={handleFinalize}
>
  {#each $items as item, i (item.id)}
    <div animate:flip={{ duration: 200 }}>
      <FormGroup>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          tabindex={dragDisabled ? 0 : -1}
          aria-label="drag-handle"
          style={!dragDisabled ? 'cursor: grabbing' : 'cursor: grab'}
          on:mousedown={startDrag}
          on:touchstart={startDrag}
          on:keydown={handleKeyDown}
          on:mouseup={cancelDrag}
        >
          <Alert
            tabindex={-1}
            color="primary"
            class="text-center"
            toggle={() => removeFunction(i)}
          >
            <span>{i + 1}</span>.
            <AutoWidthSelect
              class="custom-item-preset-select"
              value={item.preset.name}
              on:change={(e) => handleChangeFunction(e, i)}
            >
              {#each presets as preset}
                <option>{preset.name}</option>
              {/each}
            </AutoWidthSelect>
          </Alert>
        </div>
        <Output
          invalidReason={invalidReasonPosition === i
            ? invalidReason
            : undefined}
          output={outputs[i]}
          disabled={Boolean(invalidReason) && i > invalidReasonPosition}
          showEmpty
        />
      </FormGroup>
    </div>
  {/each}
</div>

<Dropdown>
  <DropdownToggle caret>Add</DropdownToggle>
  <DropdownMenu>
    {#each presets as preset}
      <DropdownItem on:click={() => addFunction(preset)}>
        {preset.name}
      </DropdownItem>
    {/each}
  </DropdownMenu>
  {#if $items.length > 0}
    <Button color="secondary" outline on:click={() => ($items = [])}
      >Clear</Button
    >
  {/if}
</Dropdown>

<style>
  :global(.custom-item-preset-select) {
    background: transparent;
    color: inherit;
    border: none;
    padding: 0;

    outline: none;
    box-shadow: none;

    & option {
      color: var(--bs-body-color);
      background: var(--bs-body-bg);
    }
  }
</style>
