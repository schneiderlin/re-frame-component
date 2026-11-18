(ns com.zihao.re-frame-component.ui.tabs.interface
  "Public API for the caller-controlled re-frame2 tabs: tablist, tab buttons, tab panel, and the
  composed tabs region."
  (:require
   [com.zihao.re-frame-component.ui.tabs :as view]))

(defn tab-button-attrs
  "Builds ARIA, active-state, disabled-state, and action attrs for one tab.

  Parameters:
  - `tab` — tab item:
    - `:id` — tab id, rendered as `data-tab-id`.
    - `:active?` — renders `data-selected`, `aria-selected`, and the roving `tab-index`
      (`0` when active, `-1` otherwise).
    - `:disabled?` — renders the `disabled` attribute and skips the generated `:on-click`.
    - `:action` — optional tab activation action: handler function, dispatch vector, or sequence of
      dispatch vectors; ignored when `:attrs` already carries `:on-click` or the tab is disabled.
    - `:panel-id` — optional panel id, rendered as `aria-controls`.
    - `:tab-id` — optional DOM id for the button.
    - `:attrs` — optional attribute map merged over the generated attributes.
  - `opts` — optional styling:
    - `:class` — optional class prepended to any existing class.

  Returns: attribute map for a `<button role=\"tab\">`.

  Throws `ex-info` when a clicked action is none of handler, dispatch vector, or sequence of
  dispatch vectors."
  [{:keys [id active? disabled? action panel-id tab-id attrs]}
   {:keys [class]}]
  (view/tab-button-attrs
   {:id id
    :active? active?
    :disabled? disabled?
    :action action
    :panel-id panel-id
    :tab-id tab-id
    :attrs attrs}
   {:class class}))

(defn tab-button
  "Renders one tab button.

  Parameters:
  - `item` — tab item; `:label` is the button text, the rest is documented on `tab-button-attrs`.
  - `opts` — optional styling map (`:class`).

  Returns: `[:button attrs label]` Hiccup vector."
  ([item]
   [view/tab-button item])
  ([item opts]
   [view/tab-button item opts]))

(defn tab-list
  "Renders an accessible tablist and derives active items from `active-id`.

  Parameters:
  - `items` — sequence of tab items (`:id`, `:label`, `:action`, `:disabled?`, `:attrs`). An item's
    own `:active?` wins; otherwise it is active when `:active-id` equals its `:id`.
  - `opts` — tablist options:
    - `:active-id` — optional id of the active tab.
    - `:class` — optional class on the tablist element.
    - `:attrs` — optional attribute map merged onto the tablist element.
    - `:tab-options` — options map passed to every `tab-button`.
    - `:aria-label` — accessible name of the tablist.

  Returns: `[:div role=\"tablist\" ...]` Hiccup vector."
  ([items]
   [view/tab-list items])
  ([items {:keys [active-id class attrs tab-options aria-label]}]
   [view/tab-list
    items
    {:active-id active-id
     :class class
     :attrs attrs
     :tab-options tab-options
     :aria-label aria-label}]))

(defn tab-panel
  "Renders tab content in `panel-tag`, defaulting to a section.

  Parameters:
  - `content` — one Hiccup node or a sequence of nodes with the active tab's content.
  - `opts` — panel options:
    - `:class` — optional class on the panel element.
    - `:attrs` — optional attribute map merged onto the panel element.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.
    - `:tab-id` — optional id of the owning tab button, rendered as `aria-labelledby`.

  Returns: Hiccup vector rendering `role=\"tabpanel\"`."
  ([content]
   [view/tab-panel content])
  ([content {:keys [class attrs panel-tag tab-id]}]
   [view/tab-panel
    content
    {:class class
     :attrs attrs
     :panel-tag panel-tag
     :tab-id tab-id}]))

(defn tabs
  "Renders a caller-controlled tablist and active content panel.

  Parameters:
  - `tabs-options` — the tabs region:
    - `:items` — sequence of tab items (see `tab-list`).
    - `:active-id` — id of the active tab; the caller owns it and switches it through the tab
      actions.
    - `:content` — content of the active tab panel.
  - `options` — trailing keyword options (the vararg part of the call):
    - `:attrs` — optional attribute map merged onto the region element.
    - `:class` — optional class on the region element.
    - `:list-attrs` — optional attribute map for the tablist.
    - `:list-class` — optional class for the tablist.
    - `:tab-options` — options map passed to every tab button.
    - `:panel-attrs` — optional attribute map for the panel.
    - `:panel-class` — optional class for the panel.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.
    - `:aria-label` — accessible name of the tablist.

  Returns: `[:div ...]` Hiccup vector containing the tablist and the active panel."
  [{:keys [items active-id content]}
   & {:keys [attrs
             class
             list-attrs
             list-class
             tab-options
             panel-attrs
             panel-class
             panel-tag
             aria-label]}]
  [view/tabs
   {:items items :active-id active-id :content content}
   :attrs attrs
   :class class
   :list-attrs list-attrs
   :list-class list-class
   :tab-options tab-options
   :panel-attrs panel-attrs
   :panel-class panel-class
   :panel-tag panel-tag
   :aria-label aria-label])
