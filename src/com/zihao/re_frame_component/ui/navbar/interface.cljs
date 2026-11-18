(ns com.zihao.re-frame-component.ui.navbar.interface
  "Public API for the generic Reagent navbar: renders router nav items as links and nav regions."
  (:require
   [com.zihao.re-frame-component.ui.navbar :as view]))

(defn nav-link-attrs
  "Builds route, active-state, and accessibility attributes for one nav item.

  Parameters:
  - `item` — router nav item; only these keys are read:
    - `:id` — route id, rendered as `data-route-id`.
    - `:href` — target href.
    - `:active?` — whether the item is in the active nav branch; rendered as `data-active`.
    - `:current?` — whether the item is the current route; renders `aria-current=\"page\"` when true.
  - `opts` — link styling:
    - `:class` — optional class applied to the anchor.
    - `:attrs` — optional attribute map merged over the generated attributes.

  Returns: attribute map for an `<a>` element."
  [{:keys [id href active? current?]}
   {:keys [class attrs]}]
  (view/nav-link-attrs
   {:id id :href href :active? active? :current? current?}
   {:class class :attrs attrs}))

(defn nav-link
  "Renders one navigation link from a router nav item.

  Parameters:
  - `item` — router nav item:
    - `:label` — link text.
    - `:id`, `:href`, `:active?`, `:current?` — see `nav-link-attrs`.
  - `opts` — optional link styling:
    - `:class` — optional class for the anchor.
    - `:attrs` — optional attribute map merged over the generated attributes.

  Returns: `[:a attrs label]` Hiccup vector."
  ([item]
   [view/nav-link item])
  ([item {:keys [class attrs]}]
   [view/nav-link item {:class class :attrs attrs}]))

(defn nav
  "Renders a navigation region from router nav items.

  Parameters:
  - `items` — sequence of router nav items (see `nav-link`); each is rendered as a link.
  - `opts` — optional region options:
    - `:class` — optional class for the `<nav>` element.
    - `:aria-label` — accessible name of the navigation region.
    - `:attrs` — optional attribute map merged onto the `<nav>` element.
    - `:link-options` — options map passed to `nav-link` for every item.

  Returns: `[:nav ...]` Hiccup vector."
  ([items]
   [view/nav items])
  ([items {:keys [class aria-label attrs link-options]}]
   [view/nav items {:class class
                    :aria-label aria-label
                    :attrs attrs
                    :link-options link-options}]))

(defn primary-nav
  "Renders the primary items from a router navigation model.

  Parameters:
  - `nav-model` — router navigation model; `:items` is the primary item sequence.
  - `opts` — optional nav options passed through to `nav` (`:class`, `:aria-label`, `:attrs`,
    `:link-options`).

  Returns: `[:nav ...]` Hiccup vector."
  ([nav-model]
   [view/primary-nav nav-model])
  ([nav-model opts]
   [view/primary-nav nav-model opts]))

(defn secondary-nav
  "Renders secondary router navigation when secondary items exist.

  Parameters:
  - `nav-model` — router navigation model; `:secondary-items` is read for the secondary item
    sequence.
  - `opts` — optional nav options passed through to `nav` (`:class`, `:aria-label`, `:attrs`,
    `:link-options`).

  Returns: `[:nav ...]` Hiccup vector, or nil when the model has no secondary items."
  ([nav-model]
   [view/secondary-nav nav-model])
  ([nav-model opts]
   [view/secondary-nav nav-model opts]))
