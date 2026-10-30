/**
 * Custom Vue 3 Directive `v-focus`
 * Automatically focuses a primary input only on desktop devices to avoid popping up mobile keyboards unexpectedly.
 */
export const vFocus = {
  mounted(el) {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      el.focus()
    }
  }
}
