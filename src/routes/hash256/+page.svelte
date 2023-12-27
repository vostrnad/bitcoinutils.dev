<script lang="ts">
  import { sha256 } from '@noble/hashes/sha256'
  import HashTool from '$lib/HashTool.svelte'
</script>

<svelte:head>
  <title>HASH256 - bitcoinutils.dev</title>
</svelte:head>

<HashTool
  title="HASH256"
  description="This tool will compute the double SHA256 hash of a UTF-8 or hexadecimal input."
  hash={(input) => sha256(sha256(input))}
/>
