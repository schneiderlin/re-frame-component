(ns com.zihao.re-frame-component.ui.multi-step.interface
  "Public API for the caller-controlled multi-step surface: timeline triggers, the active step
  panel, and the composed timeline-plus-panel region."
  (:require
   [com.zihao.re-frame-component.ui.multi-step.view :as view]))

(defn step-trigger-attrs
  "Builds semantic button attributes for one multi-step timeline item.

  `action` may be a handler, a re-frame event vector, or a sequence of event
  vectors. Caller attributes override defaults.

  Parameters:
  - `step` — step item, usually one item produced by the timeline's step normalization:
    - `:id` — step id, rendered as `data-step-id`.
    - `:state` — one of `:complete`, `:active`, `:upcoming`; rendered as `data-state`.
    - `:active?` — renders `aria-current=\"step\"` when true.
    - `:navigable?` — the button is `disabled` unless true, and only navigable steps get the
      generated `:on-click`.
    - `:action` — optional navigation action: handler function, dispatch vector, or sequence of
      dispatch vectors.
    - `:attrs` — optional attribute map merged over the generated attributes.

  Returns: attribute map for a `<button>`.

  Throws `ex-info` when a clicked action is none of handler, dispatch vector, or sequence of
  dispatch vectors."
  [{:keys [id state active? navigable? action attrs]}]
  (view/step-trigger-attrs
   {:id id
    :state state
    :active? active?
    :navigable? navigable?
    :action action
    :attrs attrs}))

(defn step-trigger
  "Renders one numbered timeline trigger from a normalized step item.

  Parameters:
  - `step` — step item:
    - `:id`, `:state`, `:active?`, `:navigable?`, `:action`, `:attrs` — see `step-trigger-attrs`.
    - `:index` — zero-based step index; rendered as a one-based marker number.
    - `:label` — visible step label.

  Returns: `[:button ...]` Hiccup vector with a marker and a label."
  [{:keys [id index label state active? navigable? action attrs]}]
  [view/step-trigger
   {:id id
    :index index
    :label label
    :state state
    :active? active?
    :navigable? navigable?
    :action action
    :attrs attrs}])

(defn timeline
  "Renders the ordered step navigation for `steps` and `active-id`.

  Parameters:
  - `timeline-options` — timeline options:
    - `:steps` — sequence of step maps (`:id`, `:label`, `:action`, `:disabled?`).
    - `:active-id` — id of the active step; an unknown or nil id falls back to the first step.
    - `:aria-label` — optional accessible name of the `<nav>`.
    - `:attrs` — optional attribute map merged onto the `<nav>`.
    - `:list-attrs` — optional attribute map merged onto the `<ol>`.

  Returns: `[:nav ... [:ol ...]]` Hiccup vector, with steps before the active one marked complete."
  [{:keys [steps active-id aria-label attrs list-attrs]}]
  [view/timeline
   {:steps steps
    :active-id active-id
    :aria-label aria-label
    :attrs attrs
    :list-attrs list-attrs}])

(defn step-panel
  "Renders the active step content in `panel-tag`, defaulting to a section.

  Parameters:
  - `panel-options` — panel options:
    - `:active-id` — id of the active step, rendered as `data-step-id`.
    - `:content` — panel content: one Hiccup node, a sequence of nodes, or nil for an empty panel.
    - `:attrs` — optional attribute map merged over the generated panel attributes.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.

  Returns: Hiccup vector rendering the panel element."
  [{:keys [active-id content attrs panel-tag]}]
  [view/step-panel
   {:active-id active-id
    :content content
    :attrs attrs
    :panel-tag panel-tag}])

(defn multi-step
  "Renders a complete timeline, active content panel, and optional footer.

  Selection is caller-owned through `active-id`; completed step actions carry
  navigation behavior supplied by each step.

  Parameters:
  - `multi-step-options` — surface options:
    - `:steps` — sequence of step maps (`:id`, `:label`, `:action`, `:disabled?`).
    - `:active-id` — id of the active step; an unknown or nil id falls back to the first step and
      the resolved id is rendered as `data-active-step-id`.
    - `:content` — content of the active step panel.
    - `:footer` — optional footer content; the footer element is omitted when nil.
    - `:aria-label` — optional accessible name of the timeline.
    - `:attrs` — optional attribute map merged onto the root element.
    - `:timeline-attrs` — optional attribute map for the timeline `<nav>`.
    - `:list-attrs` — optional attribute map for the timeline `<ol>`.
    - `:panel-attrs` — optional attribute map for the panel.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.
    - `:footer-attrs` — optional attribute map for the footer.

  Returns: `[:div ...]` Hiccup vector containing the timeline, the panel, and the optional footer."
  [{:keys [steps
           active-id
           content
           footer
           aria-label
           attrs
           timeline-attrs
           list-attrs
           panel-attrs
           panel-tag
           footer-attrs]}]
  [view/multi-step
   {:steps steps
    :active-id active-id
    :content content
    :footer footer
    :aria-label aria-label
    :attrs attrs
    :timeline-attrs timeline-attrs
    :list-attrs list-attrs
    :panel-attrs panel-attrs
    :panel-tag panel-tag
    :footer-attrs footer-attrs}])
