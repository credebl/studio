"use client";

import { useEffect, useRef } from "react";

/**
 * Brings a message that has just appeared into view — a confirmation, a
 * result, the next step — and, when asked, moves keyboard focus to it.
 *
 * WHY THIS EXISTS
 *
 * Several confirmations rendered wherever the layout happened to put them:
 * "Invitation sent" under a form, "You've proved who you are" under a scan
 * card, a list of organisations under a paragraph. At a laptop height they
 * landed below the fold, or under the guide card that floats over the
 * bottom-left of the screen, and a presenter pressed the button, saw
 * nothing change, and pressed it again. A message nobody sees has not been
 * shown.
 *
 * WHAT IT DOES, AND WHAT IT LEAVES ALONE
 *
 * Nothing, if the message is already comfortably on screen — scrolling a
 * page that did not need it is its own small disorientation. Otherwise it
 * scrolls the message to the middle of the viewport: the middle, not the
 * nearest edge, because the nearest bottom edge is exactly where the demo's
 * floating controls sit. Under reduced motion the scroll is instant.
 *
 * `focus` is for a confirmation that replaces the thing that was pressed —
 * a form swapped for "sent". Without it focus falls back to the page body
 * and a keyboard or screen-reader user is left nowhere. The target needs
 * `tabIndex={-1}` to accept focus; focusing never scrolls on its own, so
 * the two cannot fight.
 */
export function useReveal<T extends HTMLElement>(
  /** Truthy while the message shows. A new value — the next invitation's id,
   *  say — reveals it again, since the same box now says something new. */
  shown: unknown,
  { focus = false }: { focus?: boolean } = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!shown || !el) return;
    /* After paint, so the element has its final size and position. */
    const frame = window.requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      /* The top bar is 64px; the demo's floating controls and guide card
         take the bottom of the screen, so "visible" means clear of both. */
      const clearTop = 72;
      const clearBottom = window.innerHeight - 150;
      const comfortable = rect.top >= clearTop && rect.bottom <= clearBottom;
      if (!comfortable) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        /* Centred in the clear band; a message taller than the band starts
           just under the top bar instead, so its heading is what shows. The
           window is the scroller everywhere in this app. "instant" rather
           than "auto" under reduced motion, because `html` sets smooth
           scrolling and "auto" would defer to it. */
        const band = clearBottom - clearTop;
        const target = rect.height > band ? clearTop : clearTop + (band - rect.height) / 2;
        window.scrollTo({ top: window.scrollY + rect.top - target, behavior: reduce ? "instant" : "smooth" });
      }
      if (focus) el.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [shown, focus]);

  return ref;
}
