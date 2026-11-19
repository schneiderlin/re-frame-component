(ns com.zihao.re-frame-component.ui.anchor.interface
  "Public API for anchored floating elements: place an element beside an anchor
  and keep it there, and register it in the page's dismissal stack."
  (:require
   [com.zihao.re-frame-component.ui.anchor :as anchor]))

(defn position!
  "Places `element` beside `anchor` and keeps it there while the page moves.

  The element flips to the opposite side of the anchor when there is no room,
  and is kept inside the viewport. It is given `data-side`, `data-align`,
  `--available-width`, `--available-height`, and `--transform-origin`, so paint
  can follow the resolved placement; geometry is the only style written.

  Parameters:
  - `anchor-element` — the element to anchor against, or a function of no
    arguments returning one (read on every check, so the anchor may change while
    the element stays mounted).
  - `element` — the floating element.
  - `options` — placement options, or a function of no arguments returning them
    (also read on every check, so placement can follow measured state):
    - `:side` — `\"top\"`, `\"right\"`, `\"bottom\"` or `\"left\"`; flips when
      there is no room.
    - `:align` — `\"start\"`, `\"center\"` or `\"end\"`; which edge of the
      anchor the element hugs along that side.
    - `:sideOffset` — gap from the anchor, in px.
    - `:collisionPadding` — space kept from the viewport edges, in px.
    - `:arrow` — optional element inside the popup that points at the anchor.
    - `:arrowPadding` — space kept between the arrow and the corners, in px.

  Returns: a handle map with `:stop`, to call when the element unmounts, and
  `:place`, to recompute on demand after the anchor element itself changed."
  [anchor-element element options]
  (anchor/position! anchor-element element options))

(defn bind-layer!
  "Registers `element` in the dismissal stack that Escape and outside presses walk.

  The caller keeps ownership of its own open state: dismissal is reported, not
  applied.

  Parameters:
  - `element` — the floating element.
  - `options` — layer options:
    - `:onDismiss` — function of the reason string (`\"escape-key\"`,
      `\"outside-press\"`, …), called when something asks the layer to close.
    - `:contains` — function of a DOM node that counts extra nodes, such as the
      trigger, as inside the layer.
    - `:modal` — an outside press dismisses without reaching the page beneath.
    - `:topLayer` — join the browser top layer where it is supported.
    - `:closeOnBlur` — dismiss when the window loses focus.

  Returns: a handle map with `:stop`, to call when the element unmounts."
  [element options]
  (anchor/bind-layer! element options))
