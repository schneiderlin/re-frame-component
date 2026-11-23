(ns com.zihao.re-frame-component.ui.segmented-control.interface
  "Public API for the controlled segmented control: one answer on a short scale,
  with the radiogroup behavior supplied by the shared ui-sdk elements."
  (:require
   [com.zihao.re-frame-component.ui.segmented-control :as segmented-control]
   [com.zihao.re-frame-component.ui.segmented-control.model :as model]))

(defn segmented-control
  "Renders one controlled segmented control.

  Parameters:
  - `props` — the control:
    - `:id` — required element id; a caller's legend or label names the group.
    - `:value` — the chosen item's `:value`, or nil when nothing is chosen.
    - `:items` — required sequence of `{:value ... :label ... :attrs ...}`.
    - `:on-change` — optional function of the chosen value. Return `false` to
      keep the current value while a save runs.
    - `:parse-value` — optional function mapping the element's string value back
      to the caller's value type; defaults to `identity`.
    - `:disabled?` / `:read-only?` — optional group state.
    - `:attrs` / `:item-attrs` / `:indicator?` / `:indicator-attrs` — painting
      and semantics.

  Returns: Reagent hiccup whose items carry `data-checked` / `data-unchecked`
  (and `data-disabled` while disabled) once mounted, so a caller's CSS paints
  both states. Nothing here renders text or styles."
  [props]
  [segmented-control/segmented-control props])

(defn markup
  "The element tree of one segmented control, without mounting it.

  Parameters:
  - `props` — `{:id ... :items [...] :attrs ... :item-attrs ...}`.

  Returns: hiccup `[root attrs indicator? item...]`; the root tag is
  `\"ui-segmented-control\"`, an item is `\"ui-segmented-control-item\"`."
  [props]
  (model/markup props))

(def root-tag
  "Tag name of the segmented control's group element (`\"ui-segmented-control\"`)."
  model/root-tag)

(def item-tag
  "Tag name of one segmented control choice (`\"ui-segmented-control-item\"`)."
  model/item-tag)
