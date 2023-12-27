<script lang="ts">
  import { sha1 } from '@noble/hashes/sha1'
  import HashTool from '$lib/HashTool.svelte'
</script>

<svelte:head>
  <title>SHA1 - bitcoinutils.dev</title>
</svelte:head>

<HashTool
  title="SHA1"
  description="This tool will compute the SHA1 hash of a UTF-8 or hexadecimal input."
  hash={sha1}
/>
