<script lang="ts">
  import {
    Alert,
    FormGroup,
    TabContent,
    TabPane,
  } from '@sveltestrap/sveltestrap'
  import InputLength from '$lib/InputLength.svelte'
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
        // eslint-disable-next-line no-useless-assignment
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
      // eslint-disable-next-line no-useless-assignment
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

<FormGroup>
  <TabContent>
    <TabPane tabId="code" tab="Script" active>
      <SyntaxInput
        type="asm"
        invalid={!asmInputValid}
        bind:value={asmInput}
        bind:height={inputHeight}
      />
    </TabPane>
    <TabPane tabId="assembly" tab="Assembly">
      <SyntaxInput
        type="hex"
        invalid={!hexInputValid}
        bind:value={$hexInput}
        bind:height={inputHeight}
      />
    </TabPane>
  </TabContent>
  <InputLength
    bind:input={$hexInput}
    type="hex"
    isValid={hexInputValid && asmInputValid}
  />
</FormGroup>

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

  <div class="steps">
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
  .steps {
    --gap: 8px;
    --columns: 2;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--gap);
    row-gap: 1rem;
  }

  @media (min-width: 576px) {
    .steps {
      --columns: 3;
    }
  }
  @media (min-width: 768px) {
    .steps {
      --columns: 2;
    }
  }
  @media (min-width: 992px) {
    .steps {
      --columns: 3;
    }
  }
  @media (min-width: 1200px) {
    .steps {
      --columns: 4;
    }
  }
  @media (min-width: 1400px) {
    .steps {
      --columns: 5;
    }
  }

  /*
    Container queries are preferred to
    media queries in supported browsers:
  */
  @container (min-width: 0) {
    .steps {
      --columns: 2;
    }
  }
  @container (min-width: 576px) {
    .steps {
      --columns: 3;
    }
  }
  @container (min-width: 768px) {
    .steps {
      --columns: 4;
    }
  }
  @container (min-width: 960px) {
    .steps {
      --columns: 5;
    }
  }
  @container (min-width: 1152px) {
    .steps {
      --columns: 6;
    }
  }

  .step {
    width: calc(
      (100% / var(--columns)) - var(--gap) + (var(--gap) / var(--columns))
    );
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
