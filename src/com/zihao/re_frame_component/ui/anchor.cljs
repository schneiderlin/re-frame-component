(ns com.zihao.re-frame-component.ui.anchor
  "Imperative anchoring for floating elements, backed by `@ui-sdk/core`.

   Only two of the SDK's behaviors are used here — the ones that stand on their
   own without its primitive/adapter layer:

   - `position` places an element beside an anchor, keeps it there while the
     page moves, and flips it when there is no room. It writes geometry
     (`left`/`top`, or CSS anchor positioning where the browser has it) and the
     `data-side`, `data-align`, `--available-width`, `--available-height`,
     `--transform-origin` hooks; paint stays ours.
   - `bindLayer` registers an element in the dismissal stack that Escape and
     outside presses walk, so a floating element closes like every other popup
     in the page instead of through its own document listeners.

   Both take DOM elements and return a cleanup, so a Reagent view binds them
   from a `:ref` and calls the cleanup when the ref goes back to `nil`.
   Options may be a map or a function of no arguments; a function is read on
   every check, which is how a caller lets the placement follow measured state.

   Options are plain maps here, not JS objects, so callers stay in Clojure data.
   Keys are the SDK's own names and are passed through untouched — `:side`,
   `:align`, `:sideOffset`, `:collisionPadding`, `:onDismiss`, `:topLayer` —
   because a silently mistranslated key would be a silently ignored option."
  (:require
   ["@ui-sdk/core" :as ui-sdk]))

(defn- js-options
  "Everything the SDK reads from options is either a plain value or a callback
   that requires no CLJS wrapping, so conversion is one-way."
  [options]
  (cond
    (fn? options) (fn [] (clj->js (options)))
    (nil? options) (fn [] #js {})
    :else (clj->js options)))

(defn position!
  "Places `element` beside `anchor` and keeps it there.

  Parameters:
  - `anchor` — element to anchor against, or a function returning one (read on
    every check, so the anchor may change while the element stays mounted).
  - `element` — the floating element.
  - `options` — the SDK's placement options, or a function returning them:
    - `:side` — `\"top\"`, `\"right\"`, `\"bottom\"`, `\"left\"`; flips to the
      opposite side when there is no room.
    - `:align` — `\"start\"`, `\"center\"`, `\"end\"`; which edge of the anchor
      the element hugs along that side.
    - `:sideOffset` — gap from the anchor, in px.
    - `:collisionPadding` — space kept from the viewport edges, in px.
    - `:arrow`, `:arrowPadding` — optional arrow element and its inset.

  Returns: a cleanup function. Call it when the element unmounts."
  [anchor element options]
  (let [cleanup (ui-sdk/position anchor element (js-options options))]
    (fn stop! []
      (when (fn? cleanup)
        (cleanup)))))

(defn bind-layer!
  "Registers `element` as a dismissal layer.

  Parameters:
  - `element` — the floating element.
  - `options` — layer options:
    - `:onDismiss` — function called with the dismissal reason string
      (`\"escape-key\"`, `\"outside-press\"`, `\"focus-out\"`, …). The caller
      still owns whether and how to close.
    - `:contains` — function of a DOM node that treats extra nodes (like the
      trigger) as inside the layer.
    - `:modal` — an outside press only dismisses, without reaching the page.
    - `:topLayer` — join the browser top layer when it is supported.
    - `:closeOnBlur` — dismiss when the window loses focus.

  Returns: a cleanup function. Call it when the element unmounts."
  [element options]
  (let [cleanup (ui-sdk/bindLayer element (js-options options))]
    (fn stop! []
      (when (fn? cleanup)
        (cleanup)))))
