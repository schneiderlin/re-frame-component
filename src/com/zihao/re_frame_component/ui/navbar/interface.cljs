(ns com.zihao.re-frame-component.ui.navbar.interface
  (:require
   [com.zihao.re-frame-component.ui.navbar :as view]))

(defn nav-link-attrs
  "Builds route, active-state, and accessibility attributes for one nav item."
  [{:keys [id href active? current?]}
   {:keys [class attrs]}]
  (view/nav-link-attrs
   {:id id :href href :active? active? :current? current?}
   {:class class :attrs attrs}))

(defn nav-link
  "Renders one navigation link from a router nav item."
  ([item]
   [view/nav-link item])
  ([item {:keys [class attrs]}]
   [view/nav-link item {:class class :attrs attrs}]))

(defn nav
  "Renders a navigation region from router nav items."
  ([items]
   [view/nav items])
  ([items {:keys [class aria-label attrs link-options]}]
   [view/nav items {:class class
                    :aria-label aria-label
                    :attrs attrs
                    :link-options link-options}]))

(defn primary-nav
  "Renders the primary items from a router navigation model."
  ([nav-model]
   [view/primary-nav nav-model])
  ([nav-model opts]
   [view/primary-nav nav-model opts]))

(defn secondary-nav
  "Renders secondary router navigation when secondary items exist."
  ([nav-model]
   [view/secondary-nav nav-model])
  ([nav-model opts]
   [view/secondary-nav nav-model opts]))
