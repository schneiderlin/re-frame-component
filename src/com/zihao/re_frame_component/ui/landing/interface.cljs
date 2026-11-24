(ns com.zihao.re-frame-component.ui.landing.interface
  "Public API for landing on a target: bring it into view, focus it, flash it, and
  keep a resting mark until the next landing."
  (:require
   [com.zihao.re-frame-component.ui.landing :as landing]))

(def landed-attribute
  "The attribute a landed element carries: `data-landed`.

  Paint it (`[data-landed]`), never read it as state — it is a DOM fact about
  where the reader arrived, not app state, and it is deliberately not cleared on
  scroll or on a press."
  landing/landed-attribute)

(defn land!
  "Brings `element` into view, focuses it, flashes it once, and marks it.

  This is an imperative DOM behavior, not a component: call it once the target
  exists in the DOM. The caller keeps the address — which row, which annotation,
  whether the target can be found yet — because that is the surface's own
  business.

  What it does, in this order: removes the mark from the previously landed
  element, scrolls the target to the middle of its container, gives it
  `tabindex=\"-1\"` when it has no tabindex, focuses it without a second scroll,
  plays a fading ring (skipped under `prefers-reduced-motion: reduce`), and sets
  `data-landed` on it.

  The mark is a fact rather than a timer: it is not cleared by scrolling or by
  pressing, it moves to the next landing, and it disappears with the element.

  Parameters:
  - `element` — the target element, already found. A detached element is not a
    landing.
  - `options` — optional:
    - `:behavior` — `:auto` (default, instant) or `:smooth`.
    - `:block` — vertical alignment; `:center` by default.
    - `:flash?` — `true` by default; pass `false` to re-centre and re-focus
      while the layout settles, without a second flash.

  Returns: `true` when the element was connected and landed, `false` otherwise."
  ([element]
   (landing/land! element))
  ([element options]
   (landing/land! element options)))
