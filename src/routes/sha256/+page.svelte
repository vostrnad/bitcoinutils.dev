<script lang="ts">
  import { sha256 } from '@noble/hashes/sha256'
  import HashTool from '$lib/HashTool.svelte'
</script>

<svelte:head>
  <title>SHA256 - bitcoinutils.dev</title>
</svelte:head>

<HashTool
  title="SHA256"
  description="This tool will compute the SHA256 hash of a UTF-8 or hexadecimal input."
  hash={sha256}
/>
