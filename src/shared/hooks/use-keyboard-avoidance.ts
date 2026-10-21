"use client"

import { useEffect } from "react"

function isEditableElement(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

/** Nearest scrollable ancestor (bottom-sheet content). Found even when the
 *  content doesn't overflow yet — we add a spacer below so it can scroll. */
function findSheetScrollContainer(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const overflowY = window.getComputedStyle(node).overflowY
    if (overflowY === "auto" || overflowY === "scroll") return node
    if (node === document.body) break
    node = node.parentElement
  }
  return null
}

const KEYBOARD_THRESHOLD = 120
/** Focused field lands ~22% below the visible top → wide gap above keyboard. */
const TOP_RATIO = 0.22
const EXTRA_GAP = 24

const originalPadding = new WeakMap<HTMLElement, string>()
let lastContainer: HTMLElement | null = null
let resizeTimer = 0

function ensureSpacer(container: HTMLElement, keyboardHeight: number) {
  if (!originalPadding.has(container)) {
    originalPadding.set(container, container.style.paddingBottom)
  }
  container.style.paddingBottom = `${Math.ceil(keyboardHeight + EXTRA_GAP)}px`
  lastContainer = container
}

function restoreSpacer(container: HTMLElement) {
  if (originalPadding.has(container)) {
    container.style.paddingBottom = originalPadding.get(container) as string
    originalPadding.delete(container)
  }
  if (lastContainer === container) lastContainer = null
}

/**
 * Pushes the focused field above the virtual keyboard with a comfortable gap.
 * Works even on first focus (keyboard still animating) because callers retry
 * after the keyboard finishes opening.
 */
function bringAboveKeyboard(field: HTMLElement) {
  try {
    const vv = window.visualViewport
    if (!vv) {
      field.scrollIntoView({ block: "center", inline: "nearest" })
      return
    }

    const container = findSheetScrollContainer(field)
    const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop

    if (container && keyboardHeight > KEYBOARD_THRESHOLD) {
      ensureSpacer(container, keyboardHeight)
    }

    // Measure after the spacer affects layout.
    window.requestAnimationFrame(() => {
      try {
        if (document.activeElement !== field) return
        const rect = field.getBoundingClientRect()
        const targetTop = vv.offsetTop + vv.height * TOP_RATIO
        const delta = rect.top - targetTop
        if (delta > 8) {
          if (container) container.scrollTop += delta
          else window.scrollBy(0, delta)
        }
      } catch {
        // Best-effort: never break typing if scrolling fails.
      }
    })
  } catch {
    // Best-effort: never break typing if scrolling fails.
  }
}

/**
 * Global keyboard avoidance for bottom sheets on mobile.
 *
 * iOS Safari doesn't resize the layout viewport when the virtual keyboard
 * opens, so a field focused for the first time ends up hidden behind the
 * keyboard (the old single scrollIntoView fired before the keyboard finished
 * opening). This version:
 * - adds a bottom spacer the size of the keyboard to the sheet container so
 *   the content can actually scroll up,
 * - scrolls the field to ~22% below the visible top (wide gap, not covered),
 * - retries after focus + on every visual-viewport resize so the final state
 *   always lands after the keyboard animation settles,
 * - removes the spacer when the keyboard closes or focus leaves the field.
 */
export function useKeyboardAvoidance() {
  useEffect(() => {
    function onFocusIn(event: FocusEvent) {
      if (!isEditableElement(event.target)) return
      const field = event.target

      bringAboveKeyboard(field)
      window.setTimeout(() => {
        if (document.activeElement === field) bringAboveKeyboard(field)
      }, 400)
      window.setTimeout(() => {
        if (document.activeElement === field) bringAboveKeyboard(field)
      }, 800)
    }

    function onFocusOut() {
      window.setTimeout(() => {
        if (!isEditableElement(document.activeElement) && lastContainer) {
          restoreSpacer(lastContainer)
        }
      }, 150)
    }

    function onViewportResize() {
      const vv = window.visualViewport
      if (!vv) return
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop
      const active = document.activeElement

      if (keyboardHeight > KEYBOARD_THRESHOLD && isEditableElement(active)) {
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(() => {
          if (document.activeElement === active) bringAboveKeyboard(active)
        }, 80)
      } else if (keyboardHeight <= KEYBOARD_THRESHOLD && lastContainer) {
        restoreSpacer(lastContainer)
      }
    }

    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    window.visualViewport?.addEventListener("resize", onViewportResize)

    return () => {
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      window.visualViewport?.removeEventListener("resize", onViewportResize)
      window.clearTimeout(resizeTimer)
    }
  }, [])
}
