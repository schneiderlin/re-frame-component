(ns com.zihao.re-frame-component.ui.tabs.interface
  (:require
   [com.zihao.re-frame-component.ui.tabs :as view]))

(defn tab-button-attrs
  "Builds ARIA, active-state, disabled-state, and action attrs for one tab."
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
  "Renders one tab button."
  ([item]
   [view/tab-button item])
  ([item opts]
   [view/tab-button item opts]))

(defn tab-list
  "Renders an accessible tablist and derives active items from `active-id`."
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
  "Renders tab content in `panel-tag`, defaulting to a section."
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
  "Renders a caller-controlled tablist and active content panel."
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
