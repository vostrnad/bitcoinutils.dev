<script>
  import PageAnchor from '$lib/PageAnchor.svelte'
</script>

<svelte:head>
  <title>FAQ - bitcoinutils.dev</title>
</svelte:head>

<h2>Frequently Asked Questions</h2>

<dl>
  <dt>
    <PageAnchor id="source-code" />
    Where do I find the source code?
  </dt>
  <dd>
    In the <a
      target="_blank"
      rel="noreferrer"
      href="https://github.com/vostrnad/bitcoinutils.dev">GitHub repository</a
    >.
  </dd>

  <dt>
    <PageAnchor id="debugger-initial-stack" />
    How do I add an initial stack to a script?
  </dt>
  <dd>You can push the required stack items at the beginning of a script.</dd>

  <dt>
    <PageAnchor id="debugger-bitcoin-core-difference" />
    How does the script debugger differ from Bitcoin Core's script interpreter?
  </dt>
  <dd>
    Here is a non-exhaustive list of differences:
    <ul>
      <li>
        Because we're executing scripts without knowing the rest of the
        transaction, several opcodes behave differently:
        <ul>
          <li>
            All signature-checking opcodes succeed on non-empty signatures and
            public keys. Consequently, OP_CODESEPARATOR does not do anything.
          </li>
          <li>
            OP_CHECKLOCKTIMEVERIFY and OP_CHECKSEQUENCEVERIFY succeed on any
            valid locktime value.
          </li>
        </ul>
      </li>
      <li>Stack limits and the opcode limit are not enforced.</li>
      <li>
        Both OP_CHECKMULTISIG and OP_CHECKSIGADD are implemented and can be used
        in the same script, which wouldn't normally be possible.
      </li>
      <li>
        Standardness rules are not enforced, though some are implemented as
        warnings.
      </li>
    </ul>
  </dd>
</dl>

<style>
  h2 {
    margin-bottom: 1.5rem;
  }

  dt {
    font-size: 1.5rem;
    font-weight: unset;
    margin-bottom: 1rem;
  }

  dd {
    margin-bottom: 1rem;
  }

  ul ul {
    margin-block: 0.25rem;
  }
</style>
