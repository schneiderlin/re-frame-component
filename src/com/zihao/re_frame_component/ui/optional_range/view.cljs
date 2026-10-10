(ns com.zihao.re-frame-component.ui.optional-range.view
  (:require
   [clojure.string :as str]
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]
   [com.zihao.re-frame-component.ui.optional-range.model :as model]))

(defn- bound-control
  [{:keys [id type disabled? min max step input-options]}
   bound label value placeholder on-value]
  (let [input-id (model/input-id id bound)]
    [:label {:data-part "bound"
             :data-bound (name bound)
             :for input-id}
     [:span {:data-part "bound-label"} label]
     [ime-safe/input
      (merge
       input-options
       {:id input-id
        :type (or type "text")
        :value (or value "")
        :placeholder placeholder
        :disabled (boolean disabled?)
        :min min
        :max max
        :step step
        :data-bound (name bound)
        :on-value (or on-value (fn [_value] nil))})]]))

(defn optional-range-filter
  [{:keys [id label
           lower-label upper-label
           lower-value upper-value
           lower-placeholder upper-placeholder
           attrs]
    :as options}]
  (when (str/blank? (str (or id "")))
    (throw (ex-info "optional range filter requires an id" {})))
  [:fieldset
   (merge
    attrs
    {:data-component "re-frame-optional-range-filter"
     :data-component-id (str id)
     :data-state (name (model/range-state lower-value upper-value))})
   [:legend {:data-part "label"} label]
   [:div {:data-part "bounds"}
    [bound-control options :lower lower-label lower-value
     lower-placeholder (:on-lower-value options)]
    [bound-control options :upper upper-label upper-value
     upper-placeholder (:on-upper-value options)]]])
