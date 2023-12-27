<script lang="ts">
  import { ripemd160 } from '@noble/hashes/ripemd160'
  import HashTool from '$lib/HashTool.svelte'
</script>

<svelte:head>
  <title>RIPEMD160 - bitcoinutils.dev</title>
</svelte:head>

<HashTool
  title="RIPEMD160"
  description="This tool will compute the RIPEMD160 hash of a UTF-8 or hexadecimal input."
  hash={ripemd160}
/>
