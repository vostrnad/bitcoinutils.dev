<script lang="ts">
  import {
    Alert,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormGroup,
    Input,
  } from '@sveltestrap/sveltestrap'
  import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action'
  import Output from '$lib/Output.svelte'
  import { type CustomFunction, presets } from '$lib/presets'
  import {
    hashInput as input,
    customFunctionItems as items,
    hashInputType as type,
  } from '$lib/stores/inputs'
  import { hexToUint8Array, uint8ArrayToHex } from '$lib/uintarray'
  import { formatErrorOutput, getErrorMessage } from '$lib/utils/error'
  import { isValidHex } from '$lib/validation'

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
    e.preventDefault()
    dragDisabled = false
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
  let outputs: string[] = []

  const addFunction = (preset: CustomFunction) => {
    $items = $items.concat([{ id: Math.random(), preset }])
  }

  const removeFunction = (index: number) => {
    $items = $items.slice(0, index).concat($items.slice(index + 1))
  }

  $: (() => {
    invalidReason = undefined
    outputs = []

    if ($items.at(0)?.preset.textInput === false) $type = 'hex'

    if ($type === 'hex') {
      $input = $input.trim()

      if (!isValidHex($input)) {
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
        outputElement.textContent = outputs[index]
        outputElement.classList.add('bg-success-subtle')
      }
    },
  }}
  on:consider={handleConsider}
  on:finalize={handleFinalize}
>
  {#each $items as item, i (item.id)}
    <div>
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
            <span>{i + 1}</span>. {item.preset.name}
          </Alert>
        </div>
        <Output
          invalidReason={invalidReasonPosition === i
            ? invalidReason
            : undefined}
          output={outputs[i]}
          disabled={Boolean(invalidReason) && i > invalidReasonPosition}
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
</Dropdown>
