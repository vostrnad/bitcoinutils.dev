<script lang="ts">
  import './app.css'
  import {
    Container,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Offcanvas,
  } from '@sveltestrap/sveltestrap'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { navigating } from '$app/stores'
  import SidebarMenu from '$lib/SidebarMenu.svelte'
  import type { CustomFunction } from '$lib/utils/presets'

  let sidebarOpen = false
  const toggleSidebar = () => (sidebarOpen = !sidebarOpen)

  $: if ($navigating) sidebarOpen = false

  setContext('hashInputType', writable<'utf8' | 'hex'>('utf8'))
  setContext(
    'customFunctionItems',
    writable<
      Array<{
        id: number
        preset: CustomFunction
      }>
    >([]),
  )
</script>

<Navbar container={false} expand="md" color="body-tertiary" class="shadow-sm">
  <Container md class="justify-content-start">
    <NavbarToggler class="me-3" on:click={toggleSidebar} />
    <NavbarBrand href="/">bitcoinutils.dev</NavbarBrand>
  </Container>
</Navbar>

<Container md>
  <div class="d-flex">
    <div class="flex-shrink-0 p-3 d-none d-md-block">
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

  :global([data-bs-theme='dark']) {
    --bs-primary-bg-subtle: #0c2448;
    --bs-success-bg-subtle: #094228;
  }
</style>
