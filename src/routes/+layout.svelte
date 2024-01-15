<script lang="ts">
  import './app.css'
  import {
    Container,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Offcanvas,
  } from '@sveltestrap/sveltestrap'
  import { navigating } from '$app/stores'
  import SidebarMenu from '$lib/SidebarMenu.svelte'

  let sidebarOpen = false
  const toggleSidebar = () => (sidebarOpen = !sidebarOpen)

  $: if ($navigating) sidebarOpen = false
</script>

<Navbar container={false} expand="md" color="light" class="shadow-sm">
  <Container md class="justify-content-start">
    <NavbarToggler class="me-3" on:click={toggleSidebar} />
    <NavbarBrand href="/">bitcoinutils.dev</NavbarBrand>
  </Container>
</Navbar>

<Container md>
  <div class="d-flex">
    <div class="p-3 d-none d-md-block">
      <SidebarMenu />
    </div>
    <div
      style:transition="opacity 0.5s"
      style:opacity={$navigating ? '0.2' : '1'}
      style:pointer-events={$navigating ? 'none' : 'initial'}
      style:user-select={$navigating ? 'none' : 'initial'}
      class="flex-grow-1 p-3 pt-4 p-md-5 pt-md-5"
    >
      <slot />
    </div>
  </div>
</Container>

<Offcanvas toggle={toggleSidebar} isOpen={sidebarOpen} scroll>
  <svelte:fragment slot="header">Tools</svelte:fragment>
  <div class="px-3">
    <SidebarMenu />
  </div>
</Offcanvas>

<style>
  :global(body) {
    overflow-y: scroll;
  }
</style>
