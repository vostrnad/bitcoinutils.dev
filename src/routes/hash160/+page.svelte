<script lang="ts">
  import { ripemd160 } from '@noble/hashes/ripemd160'
  import { sha256 } from '@noble/hashes/sha256'
  import HashTool from '$lib/HashTool.svelte'
</script>

<svelte:head>
  <title>HASH160 - bitcoinutils.dev</title>
</svelte:head>

<HashTool
  title="HASH160"
  description="This tool will compute the SHA256+RIPEMD160 hash of a UTF-8 or hexadecimal input."
  hash={(input) => ripemd160(sha256(input))}
/>
