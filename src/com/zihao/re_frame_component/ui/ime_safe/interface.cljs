(ns com.zihao.re-frame-component.ui.ime-safe.interface
  (:require
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]))

(defn input
  "Renders an IME-safe input.

  `value` is synchronized only outside composition. `on-value` receives the
  complete text after ordinary changes, composition end, and blur. Remaining
  keys are forwarded as input attributes."
  [{:keys [value on-value on-blur] :as input-attributes}]
  [ime-safe/input
   (assoc input-attributes
          :value value
          :on-value on-value
          :on-blur on-blur)])

(defn textarea
  "Renders an IME-safe textarea with the same value contract as `input`.

  Remaining keys are forwarded as textarea attributes."
  [{:keys [value on-value on-blur] :as textarea-attributes}]
  [ime-safe/textarea
   (assoc textarea-attributes
          :value value
          :on-value on-value
          :on-blur on-blur)])
