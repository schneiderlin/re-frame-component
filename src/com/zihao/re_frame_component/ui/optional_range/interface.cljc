(ns com.zihao.re-frame-component.ui.optional-range.interface
  (:require
   [com.zihao.re-frame-component.ui.optional-range.model :as model]
   #?(:cljs [com.zihao.re-frame-component.ui.optional-range.view :as view])))

(defn range-state
  "Returns `:empty`, `:lower-only`, `:upper-only`, or `:bounded` for two values."
  [lower-value upper-value]
  (model/range-state lower-value upper-value))

(defn input-id
  "Returns the stable input id for `component-id` and `:lower` or `:upper`."
  [component-id bound]
  (model/input-id component-id bound))

#?(:cljs
   (defn optional-range-filter
     "Renders independently optional lower and upper range inputs.

     `id` is required. Values and change callbacks are caller-owned; remaining
     input constraints and DOM attributes are shared by both bounds."
     [{:keys [id
              label
              lower-label
              upper-label
              lower-value
              upper-value
              lower-placeholder
              upper-placeholder
              on-lower-value
              on-upper-value
              type
              disabled?
              min
              max
              step
              input-options
              attrs]}]
     [view/optional-range-filter
      {:id id
       :label label
       :lower-label lower-label
       :upper-label upper-label
       :lower-value lower-value
       :upper-value upper-value
       :lower-placeholder lower-placeholder
       :upper-placeholder upper-placeholder
       :on-lower-value on-lower-value
       :on-upper-value on-upper-value
       :type type
       :disabled? disabled?
       :min min
       :max max
       :step step
       :input-options input-options
       :attrs attrs}]))
