/* eslint-disable @typescript-eslint/naming-convention */
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  declare type Item = import('svelte-dnd-action').Item
  declare type DndEvent<ItemType = Item> =
    import('svelte-dnd-action').DndEvent<ItemType>
  declare namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:consider'?: (
        event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T },
      ) => void
      'on:finalize'?: (
        event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T },
      ) => void
    }
  }
}

export {}
