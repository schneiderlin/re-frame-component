(ns com.zihao.re-frame-component.ui.optional-range.model
  (:require
   [clojure.string :as str]))

(def bounds #{:lower :upper})

(defn present-value?
  [value]
  (not (str/blank? (str (or value "")))))

(defn range-state
  [lower-value upper-value]
  (let [lower? (present-value? lower-value)
        upper? (present-value? upper-value)]
    (cond
      (and lower? upper?) :bounded
      lower? :lower-only
      upper? :upper-only
      :else :empty)))

(defn input-id
  [component-id bound]
  (when-not (contains? bounds bound)
    (throw (ex-info "unknown optional range bound" {:bound bound})))
  (str component-id "-" (name bound)))
