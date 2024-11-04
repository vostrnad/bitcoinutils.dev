import { browser } from '$app/environment'
import { isNotUndefined } from '$lib/utils/validation'

// @ts-expect-error mozInnerScreenX not in DOM types
export const isFirefox = browser && isNotUndefined(window.mozInnerScreenX)
