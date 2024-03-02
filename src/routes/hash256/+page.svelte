<script lang="ts">
  import HashTool from '$lib/HashTool.svelte'
  import { sha256d } from '$lib/utils/hash'
</script>

<svelte:head>
  <title>HASH256 - bitcoinutils.dev</title>
</svelte:head>

<HashTool
  title="HASH256"
  description="This tool will compute the double SHA256 hash of a UTF-8 or hexadecimal input."
  hash={(input) => sha256d(input)}
/>
