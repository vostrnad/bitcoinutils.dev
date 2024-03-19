<script lang="ts">
  import { Input } from '@sveltestrap/sveltestrap'

  let className: string | undefined = ''
  export { className as class }

  export let value: number | null

  export let min: number

  export let max: number

  export let invalidReason: string | undefined = undefined

  let internalValue: number | null

  $: internalValue = value

  $: {
    if (typeof internalValue === 'number') {
      if (internalValue > max) internalValue = max
      if (internalValue < min) internalValue = min
      if (!Number.isInteger(internalValue)) {
        internalValue = Math.floor(internalValue)
      }
      if (Number.isNaN(internalValue)) {
        internalValue = null
      }
      value = internalValue
    }
  }

  const handleKeyDown = (
    e: KeyboardEvent & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    const key = e.key.toLowerCase()
    if (
      !/^\d$/.test(key) &&
      (key !== '-' || min >= 0) &&
      key !== 'backspace' &&
      key !== 'delete' &&
      !key.startsWith('arrow') &&
      !e.ctrlKey
    ) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleInput = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    if (e.currentTarget.value) {
      e.currentTarget.value = e.currentTarget.value.replace(
        /^(-)?0+(.)/,
        '$1$2',
      )
    } else {
      value = null
    }
  }

  const handleBlur = (
    e: FocusEvent & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    e.currentTarget.value = e.currentTarget.value

    if (e.currentTarget.value === '-0') {
      e.currentTarget.value = '0'
    }
  }
</script>

<Input
  class={className}
  type="number"
  {min}
  {max}
  step={1}
  invalid={invalidReason !== undefined}
  feedback={invalidReason}
  bind:value={internalValue}
  on:input={handleInput}
  on:keydown={handleKeyDown}
  on:blur={handleBlur}
/>
