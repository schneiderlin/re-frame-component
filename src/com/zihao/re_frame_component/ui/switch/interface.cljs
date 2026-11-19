(ns com.zihao.re-frame-component.ui.switch.interface
  "Public API for the controlled switch: one boolean setting a press turns on or
  off, with the accessible behavior supplied by the shared switch element."
  (:require
   [com.zihao.re-frame-component.ui.switch :as switch]
   [com.zihao.re-frame-component.ui.switch.model :as model]))

(defn switch
  "Renders one controlled switch.

  Parameters:
  - `props` — field attributes:
    - `:id` — required element id; a caller's `<label for>` or description
      `aria-describedby` points at it.
    - `:checked?` — whether the switch is on.
    - `:disabled?` — optional; blocks focus, presses and form submission.
    - `:on-change` — optional function of the next boolean. Return `false` to
      keep the current value while a save runs; the change is cancelled and the
      caller re-renders the value it accepted.
    - `:attrs` — optional map merged onto the track element (`:class`,
      `:data-action`, `aria-*`).
    - `:thumb-attrs` — optional map merged onto the thumb element.

  Returns: Reagent hiccup whose track carries `data-checked` / `data-unchecked`
  (and `data-disabled` while disabled) once it mounts, so a caller's CSS can
  paint both states. Nothing here renders text or styles."
  [props]
  [switch/switch props])

(defn markup
  "The element tree of one switch, without mounting it.

  Parameters:
  - `props` — `{:id ... :attrs ... :thumb-attrs ...}`.

  Returns: hiccup `[track attrs [thumb attrs]]`; the track tag is
  `\"ui-switch\"`, the thumb tag `\"ui-switch-thumb\"`."
  [props]
  (model/markup props))

(def track-tag
  "Tag name of the switch track element (`\"ui-switch\"`)."
  model/track-tag)

(def thumb-tag
  "Tag name of the switch thumb element (`\"ui-switch-thumb\"`)."
  model/thumb-tag)
