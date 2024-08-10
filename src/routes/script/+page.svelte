<script lang="ts">
  import { FormGroup, Input } from '@sveltestrap/sveltestrap'
  import HelpTooltip from '$lib/HelpTooltip.svelte'
  import InputLength from '$lib/InputLength.svelte'
  import LabeledInputRow from '$lib/LabeledInputRow.svelte'
  import Output from '$lib/Output.svelte'
  import { scriptInput as input } from '$lib/stores/inputs'
  import { decodeScript } from '$lib/utils/bitcoin/script'
  import { hexToUint8Array } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  const examples: Array<[string, string]> = [
    [
      'Pay to Public Key Hash (P2PKH)',
      '76a91439217a3cf879142e1f15cf0a2a74c6911032ab2b88ac',
    ],
    [
      '2-of-3 multisig (legacy)',
      '522102650d7b061e5d765fc1e6600103d441e8617dc139744a6e53ad2f2693a72c035421038a96ab34fde051ac9f468602ce233980569efd14fb48c24b5c53712bcc9d5b532102d1ad1bd884546fcb8c7575752400092ec0109139e02698a0d2e9d2f19c2882ba53ae',
    ],
    [
      '2-of-3 multisig (tapscript)',
      '20f0c1c353d37bb64e9caaab59294dbf52302dab3c6e27223b7817cbec1f48f080ac20601cdbbf1e9806b58c14d48f404c1a299dec0c103171a6b3a49f33504a261a0eba2045d479009843f7af1f1944a2e6857b200da22a342569fec92793f2e34797b8fdba529c',
    ],
    [
      'Lightning force close',
      '6321038afb372960284470fe2b613f3377b04c48e0c66b18be6f3f36f61ae695b636056702e007b2752102bca97d6daa14842c718d1497b89ac05dc947aa60d64e0d7f84723a4fbd50566768ac',
    ],
  ]

  const presets: Record<
    string,
    {
      newlines: boolean
      showPushOps: 'all' | 'numeric' | 'none'
      pushNumFormat: 'long' | 'short' | undefined
      showPushdataSize: boolean
      showShortDecimal: boolean
    }
  > = {
    mempool: {
      newlines: true,
      showPushOps: 'all',
      pushNumFormat: 'long',
      showPushdataSize: false,
      showShortDecimal: false,
    },
    core: {
      newlines: false,
      showPushOps: 'none',
      pushNumFormat: undefined,
      showPushdataSize: false,
      showShortDecimal: true,
    },
  }

  let preset = 'core'

  let newlines = false
  let showPushOps: 'all' | 'numeric' | 'none' = 'none'
  let pushNumFormat: 'long' | 'short' | undefined = undefined
  let showPushdataSize = false
  let showShortDecimal = true

  $: {
    preset =
      Object.entries(presets).find(
        ([, value]) =>
          value.newlines === newlines &&
          value.pushNumFormat === pushNumFormat &&
          value.showPushOps === showPushOps &&
          value.showPushdataSize === showPushdataSize &&
          value.showShortDecimal === showShortDecimal,
      )?.[0] || 'custom'
  }

  const handlePresetInput = (
    e: Event & {
      currentTarget: EventTarget & HTMLSelectElement
    },
  ) => {
    const newPresetName = e.currentTarget.value
    if (newPresetName in presets) {
      const newPreset = presets[newPresetName]
      newlines = newPreset.newlines
      pushNumFormat = newPreset.pushNumFormat
      showPushOps = newPreset.showPushOps
      showPushdataSize = newPreset.showPushdataSize
      showShortDecimal = newPreset.showShortDecimal
    }
  }

  $: {
    if (showPushOps === 'none') {
      pushNumFormat = undefined
    } else if (!pushNumFormat) {
      pushNumFormat = 'short'
    }

    if (showPushOps !== 'all') {
      showPushdataSize = false
    }
  }

  let output: string
  let isValid: boolean
  $: {
    $input = $input.trim()
    isValid = isValidHex($input)
    if (isValid) {
      output = decodeScript(hexToUint8Array($input), {
        showPushOps,
        pushNumFormat,
        showPushdataSize,
        showShortDecimal,
      })
        .split(showPushOps === 'all' ? / (?=OP_)/ : ' ')
        .join(newlines ? '\n' : ' ')
    }
  }
</script>

<svelte:head>
  <title>Script - bitcoinutils.dev</title>
</svelte:head>

<h2 class="mb-3">Script</h2>
<p>This tool will decode a Bitcoin script from a hexadecimal input.</p>

<FormGroup>
  <Input
    class="font-monospace"
    type="textarea"
    spellcheck={false}
    rows={3}
    invalid={!isValid}
    bind:value={$input}
  />
  <InputLength bind:input={$input} type="hex" {isValid} />
</FormGroup>

<FormGroup>
  <LabeledInputRow label="Preset">
    <Input
      class="w-auto"
      type="select"
      bind:value={preset}
      on:input={handlePresetInput}
    >
      <option value="core" selected>Bitcoin Core</option>
      <option value="mempool">mempool.space</option>
      {#if preset === 'custom'}
        <option value="custom">Custom</option>
      {/if}
    </Input>
  </LabeledInputRow>
</FormGroup>

<FormGroup class="p-3 border rounded lastchild-mb-0">
  <FormGroup>
    <Input type="checkbox" label="Newlines" bind:checked={newlines} />
  </FormGroup>

  <FormGroup>
    <LabeledInputRow
      label="Show push opcodes"
      tooltip="Show opcodes that push data (e.g. OP_PUSHBYTES and OP_PUSHDATA)"
    >
      <Input class="w-auto" type="select" bind:value={showPushOps}>
        <option value="all">All</option>
        <option value="numeric">Numeric only</option>
        <option value="none" selected>None</option>
      </Input>
    </LabeledInputRow>
  </FormGroup>

  <FormGroup>
    <LabeledInputRow
      label="Numeric opcode style"
      disabled={showPushOps === 'none'}
    >
      <Input
        class="w-auto"
        type="select"
        disabled={showPushOps === 'none'}
        bind:value={pushNumFormat}
      >
        <option value="short">Short (OP_1)</option>
        <option value="long">Long (OP_PUSHNUM_1)</option>
      </Input>
    </LabeledInputRow>
  </FormGroup>

  <FormGroup>
    <Input
      type="checkbox"
      label="Show PUSHDATA size"
      disabled={showPushOps !== 'all'}
      bind:checked={showPushdataSize}
    />
  </FormGroup>

  <FormGroup class="d-flex align-items-center">
    <Input
      type="checkbox"
      label="Decimal numbers"
      bind:checked={showShortDecimal}
    />
    <HelpTooltip class="ms-2">
      Show 4-byte and shorter values as decimal numbers
    </HelpTooltip>
  </FormGroup>
</FormGroup>

<Output
  invalidReason={!isValid ? 'Input is not valid hex' : undefined}
  {output}
/>

{#if !$input}
  <p class="mt-4 mb-1">💡 Fill input with example:</p>
  <ul class="example-list">
    {#each examples as [name, script]}
      <li>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a href="" on:click={() => ($input = script)}>{name}</a>
      </li>
    {/each}
  </ul>
{/if}
