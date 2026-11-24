(ns com.zihao.re-frame-component.ui.disclosure.interface
  "Public API for one disclosure: a trigger a person presses and the panel it
  shows, with the ARIA disclosure behavior supplied by the shared ui-sdk
  elements."
  (:require
   [com.zihao.re-frame-component.ui.disclosure :as disclosure]
   [com.zihao.re-frame-component.ui.disclosure.model :as model]))

(defn disclosure
  "Renders one disclosure: a trigger a person presses and the panel it shows.

  Parameters:
  - `props` — the disclosure:
    - `:open?` — the open state, when the caller owns it; omit it to let the
      element own the state.
    - `:default-open?` — the state a panel opens with when the element owns it.
    - `:on-open-change` — optional function of the next boolean; return `false`
      to keep the current state.
    - `:on-ref` — optional function of the root element, called on mount and on
      every update.
    - `:disabled?` — optional; a press on the trigger then changes nothing.
    - `:keep-mounted?` — whether a closed panel stays in the page, hidden;
      defaults to `true`.
    - `:hidden-until-found?` — keeps a closed panel findable by find in page.
    - `:attrs` / `:trigger-attrs` / `:button-attrs` / `:panel-attrs` — the
      caller's painting and test hooks on each part.
    - `:trigger-children` — the button's content: the caller's label plus
      usually `(chevron {:class ...})`.
    - `:panel-children` — the panel's content.

  Returns: Reagent hiccup whose parts carry `data-open` / `data-closed` (and
  `data-disabled`), so a caller's CSS paints every state. Nothing here renders
  text or styles."
  [props]
  [disclosure/disclosure props])

(defn chevron
  "The shared disclosure chevron, for a trigger's content.

  Parameters:
  - `attrs` — optional map merged onto the `<svg>`; pass the caller's class,
    whose paint rotates the glyph from the trigger's `data-open`.

  Returns: hiccup `<svg>` for one stroke chevron pointing right."
  ([]
   (disclosure/disclosure-chevron))
  ([attrs]
   (disclosure/disclosure-chevron attrs)))

(defn markup
  "The element tree of one disclosure, without mounting it.

  Parameters:
  - `props` — see `disclosure`.

  Returns: hiccup `[root attrs [trigger attrs [button attrs ...content]]
  [panel attrs ...content]]`; the root tag is `\"ui-collapsible\"`."
  [props]
  (model/markup props))

(def root-tag
  "Tag name of the disclosure root (`\"ui-collapsible\"`)."
  model/root-tag)

(def trigger-tag
  "Tag name of the part wrapping the caller's button
  (`\"ui-collapsible-trigger\"`)."
  model/trigger-tag)

(def panel-tag
  "Tag name of the panel (`\"ui-collapsible-panel\"`)."
  model/panel-tag)

(def default-keep-mounted?
  "Whether a closed panel stays in the page, hidden, unless the caller says
  otherwise."
  model/default-keep-mounted?)
