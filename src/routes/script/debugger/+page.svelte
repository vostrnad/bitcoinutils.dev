<script lang="ts">
  import {
    Alert,
    FormGroup,
    TabContent,
    TabPane,
  } from '@sveltestrap/sveltestrap'
  import SyntaxInput from '$lib/SyntaxInput.svelte'
  import { scriptInput as hexInput } from '$lib/stores/inputs'
  import { decodeScript } from '$lib/utils/bitcoin/script/decode'
  import { encodeScript } from '$lib/utils/bitcoin/script/encode'
  import {
    type EvalScriptResult,
    evalScript,
  } from '$lib/utils/bitcoin/script/interpreter'
  import {
    getNonPushOpcodeName,
    isPushOpcode,
  } from '$lib/utils/bitcoin/script/opcodes'
  import { bytesToHex, bytesToIntLE, hexToBytes } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  let asmInput = ''
  let decodedScript = ''
  let scriptBytes = new Uint8Array()

  let asmInputValid: boolean
  let hexInputValid: boolean
  $: isValid = hexInputValid && asmInputValid

  $: {
    $hexInput = $hexInput.trim()
    if (isValidHex($hexInput)) {
      scriptBytes = hexToBytes($hexInput)
      try {
        decodedScript = decodeScript(hexToBytes($hexInput), {
          showPushOps: 'none',
          showShortDecimal: false,
          throwOnError: true,
        })
        asmInput = decodedScript
        hexInputValid = true
        asmInputValid = true
      } catch {
        hexInputValid = false
      }
    } else {
      hexInputValid = false
    }
  }

  $: if (asmInput !== decodedScript) {
    try {
      scriptBytes = encodeScript(asmInput)
      $hexInput = bytesToHex(scriptBytes)
      decodedScript = asmInput
      asmInputValid = true
      hexInputValid = true
    } catch {
      asmInputValid = false
    }
  } else {
    asmInputValid = true
  }

  let evalScriptResult: EvalScriptResult | undefined

  $: {
    if ($hexInput.length === 0) {
      evalScriptResult = undefined
    } else if (hexInputValid) {
      evalScriptResult = evalScript(hexToBytes($hexInput), [])
    }
  }

  const formatWarning = (warning: string) =>
    warning.replaceAll(/([\da-f]{8})[\da-f]{4,}([\da-f]{8})/gi, '$1…$2')

  let inputHeight = 0
</script>

<svelte:head>
  <title>Script debugger - bitcoinutils.dev</title>
</svelte:head>

<h2 class="mb-3">Script debugger</h2>
<p>
  This tool can be used to write and debug custom scripts. The debugger doesn't
  exactly reimplement Bitcoin Core's script interpreter, see <a
    href="/faq#debugger-bitcoin-core-difference">the FAQ</a
  >.
</p>

<TabContent>
  <TabPane tabId="code" tab="Script" active>
    <FormGroup>
      <SyntaxInput
        invalid={!asmInputValid}
        bind:value={asmInput}
        bind:height={inputHeight}
      />
    </FormGroup>
  </TabPane>
  <TabPane tabId="assembly" tab="Assembly">
    <FormGroup>
      <SyntaxInput
        invalid={!hexInputValid}
        bind:value={$hexInput}
        bind:height={inputHeight}
      />
    </FormGroup>
  </TabPane>
</TabContent>

{#if evalScriptResult || !isValid}
  <Alert color={!isValid || evalScriptResult?.error ? 'danger' : 'success'}
    >{!isValid
      ? 'Failed to parse script.'
      : evalScriptResult?.error
        ? `Script error: ${evalScriptResult.error.message}.`
        : 'Script execution successful.'}</Alert
  >
{/if}

{#if evalScriptResult}
  {#if evalScriptResult.warnings.length > 0}
    {#if evalScriptResult.warnings.length === 1}
      <Alert color="warning"
        >Warning: {formatWarning(evalScriptResult.warnings[0])}.</Alert
      >
    {:else}
      <Alert color="warning"
        >Warnings:<br />
        <ul class="mb-0">
          {#each evalScriptResult.warnings as warning}
            <li>{formatWarning(warning)}</li>
          {/each}
        </ul>
      </Alert>
    {/if}
  {/if}

  <div class="d-flex flex-row flex-wrap" style="gap: 8px;">
    {#each evalScriptResult.steps.slice(1) as step (step.position)}
      {@const opcode = scriptBytes[step.position]}
      {@const topStackItem = step.stack.at(-1)}
      {@const opcodeName =
        isPushOpcode(opcode) && topStackItem
          ? `PUSH ${bytesToHex(topStackItem) || '0'}`
          : getNonPushOpcodeName(opcode) || 'OP_UNKNOWN'}
      <div class="step">
        <div
          class="header"
          class:bg-danger-subtle={step.highlight?.color === 'error'}
        >
          <span title={opcodeName}>{opcodeName}</span>
        </div>
        <div class="stack">
          {#each step.stack as stackItem, i}
            {@const hex = bytesToHex(stackItem)}
            <div
              class={step.highlight &&
              step.stack.length - i <= step.highlight.count
                ? step.highlight.color === 'success'
                  ? 'bg-success-subtle'
                  : step.highlight.color === 'error'
                    ? 'bg-danger-subtle'
                    : 'bg-primary-subtle'
                : ''}
            >
              {#if stackItem.length > 0}
                <span title={stackItem.length > 2 ? hex : ''}>{hex}</span>
              {/if}
              {#if stackItem.length <= 4}
                <span class="integer">({bytesToIntLE(stackItem)})</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .step {
    flex-basis: 12rem;
    max-width: 12rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    font-family: var(--bs-font-monospace);
    border-radius: var(--bs-border-radius);
    overflow: hidden;
  }

  .header {
    background-color: var(--bs-secondary-bg-subtle);
    text-align: center;
    padding-block: 0.5rem;
    padding-inline: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stack {
    flex-grow: 1;
    display: flex;
    flex-direction: column-reverse;
    background-color: var(--bs-secondary-bg-subtle);
    padding: 0.75rem;
    gap: 0.5rem;
    min-height: 2.5rem;
  }

  .stack > div {
    border: 1px solid;
    border-radius: 4px;
    padding: 0.5rem;
    line-height: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .stack > div > :first-child {
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stack > div > .integer {
    color: var(--bs-secondary-color);
  }
</style>
