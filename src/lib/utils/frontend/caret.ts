// Copyright (c) 2015 Jonathan Ong me@jongleberry.com MIT License
// Modified from https://github.com/component/textarea-caret-position/blob/master/index.js

import { isFirefox } from './vendor'

const properties = [
  'direction', // RTL support
  'boxSizing',
  'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY', // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration', // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
] as const

export interface CaretCoordinates {
  top: number
  left: number
  height: number
}

export const getCaretCoordinates = (
  element: HTMLTextAreaElement,
  position: number,
): CaretCoordinates => {
  // The mirror div will replicate the textarea's style
  const div = document.createElement('div')
  div.id = 'input-textarea-caret-position-mirror-div'
  document.body.appendChild(div)

  const style = div.style
  const computed = getComputedStyle(element)
  const isInput = element.nodeName === 'INPUT'

  // Default textarea styles
  style.whiteSpace = 'pre-wrap'
  if (!isInput) style.wordWrap = 'break-word' // only for textarea-s

  // Position off-screen
  style.position = 'absolute' // required to return coordinates properly

  // Transfer the element's properties to the div
  properties.forEach((prop) => {
    if (isInput && prop === 'lineHeight') {
      // Special case for <input>s because text is rendered centered and line height may be != height
      if (computed.boxSizing === 'border-box') {
        const height = Number.parseInt(computed.height, 10)
        const outerHeight =
          Number.parseInt(computed.paddingTop, 10) +
          Number.parseInt(computed.paddingBottom, 10) +
          Number.parseInt(computed.borderTopWidth, 10) +
          Number.parseInt(computed.borderBottomWidth, 10)
        const targetHeight =
          outerHeight + Number.parseInt(computed.lineHeight, 10)
        if (height > targetHeight) {
          style.lineHeight = `${height - outerHeight}px`
        } else if (height === targetHeight) {
          style.lineHeight = computed.lineHeight
        } else {
          style.lineHeight = '0'
        }
      } else {
        style.lineHeight = computed.height
      }
    } else {
      style[prop] = computed[prop]
    }
  })

  if (isFirefox) {
    // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
    if (element.scrollHeight > Number.parseInt(computed.height, 10)) {
      style.overflowY = 'scroll'
    }
  } else {
    style.overflow = 'hidden' // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
  }

  div.textContent = element.value.slice(0, Math.max(0, position))
  // The second special handling for input type="text" vs textarea:
  // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (isInput) div.textContent = div.textContent.replaceAll(/\s/g, '\u00A0')

  const span = document.createElement('span')
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // For inputs, just '.' would be enough, but no need to bother.
  span.textContent = element.value.slice(Math.max(0, position)) || '.' // || because a completely empty faux span doesn't render at all
  div.appendChild(span)

  const coordinates = {
    top: span.offsetTop + Number.parseInt(computed.borderTopWidth, 10),
    left: span.offsetLeft + Number.parseInt(computed.borderLeftWidth, 10),
    height: Number.parseInt(computed.lineHeight, 10),
  }

  div.remove()

  return coordinates
}
