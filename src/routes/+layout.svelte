<script lang="ts">
  import './app.css'
  import { Container, Navbar, NavbarBrand } from '@sveltestrap/sveltestrap'
</script>

<Navbar container color="light" class="shadow-sm">
  <NavbarBrand href="/">bitcoinutils.dev</NavbarBrand>
</Navbar>
<Container>
  <div class="d-flex">
    <div class="sidebar-menu p-3">
      <ul>
        <li>
          <strong>Cryptography</strong>
          <ul>
            <li><a href="sha256">SHA256</a></li>
            <li><a href="ripemd160">RIPEMD160</a></li>
            <li><a href="hash256">HASH256</a></li>
            <li><a href="hash160">HASH160</a></li>
            <li><a href="sha1">SHA1</a></li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="flex-grow-1 p-5"><slot /></div>
  </div>
</Container>
