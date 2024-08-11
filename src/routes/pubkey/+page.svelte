<script lang="ts">
  import { Alert, FormGroup, Input, Label } from '@sveltestrap/sveltestrap'
  import Output from '$lib/Output.svelte'
  import { privateKeyInput as input } from '$lib/stores/inputs'
  import { getErrorMessage } from '$lib/utils/error'
  import { createPublicKey } from '$lib/utils/secp256k1'
  import { bytesToHex, concatBytes, hexToBytes } from '$lib/utils/uintarray'
  import { isValidHex } from '$lib/utils/validation'

  let publicKeyUncompressed: Uint8Array | undefined
  let publicKeyCompressed: Uint8Array | undefined
  let publicKeyXOnly: Uint8Array | undefined
  let invalidReason: string | undefined

  $: (() => {
    invalidReason = undefined

    $input = $input.trim()

    if ($input.length === 0) {
      publicKeyUncompressed = undefined
      publicKeyCompressed = undefined
      publicKeyXOnly = undefined
      return
    }

    if (!isValidHex($input)) {
      invalidReason = 'Input is not valid hex'
      return
    }
    const privateKey = hexToBytes($input)
    try {
      publicKeyUncompressed = createPublicKey(privateKey, false)
    } catch (e) {
      invalidReason = getErrorMessage(e)
      return
    }
    publicKeyXOnly = publicKeyUncompressed.slice(1, 33)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parity = publicKeyUncompressed.at(-1)! & 1
    publicKeyCompressed = concatBytes([parity ? 0x03 : 0x02, ...publicKeyXOnly])
  })()
</script>

<h2 class="mb-3">Private to public key</h2>
<p>
  This tool will convert a private key to a public key (a point on the curve
  secp256k1).
</p>

<svelte:head>
  <title>Public key - bitcoinutils.dev</title>
</svelte:head>

<Alert color="warning">
  Your private keys are not sent to the server. However, you should never paste
  sensitive private keys into any website.
</Alert>

<FormGroup>
  <Input
    class="font-monospace"
    spellcheck={false}
    rows={3}
    invalid={Boolean(invalidReason)}
    bind:value={$input}
  />
</FormGroup>

{#if invalidReason}
  <Output {invalidReason} output={undefined} />
{/if}

{#if !invalidReason && publicKeyUncompressed && publicKeyCompressed && publicKeyXOnly}
  <Label>Uncompressed public key:</Label>
  <Output output={bytesToHex(publicKeyUncompressed)} />

  <Label>Compressed public key:</Label>
  <Output output={bytesToHex(publicKeyCompressed)} />

  <Label>X-only public key:</Label>
  <Output output={bytesToHex(publicKeyXOnly)} />
{/if}
