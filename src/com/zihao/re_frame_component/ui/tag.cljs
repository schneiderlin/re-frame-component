(ns com.zihao.re-frame-component.ui.tag
  (:require
   [clojure.string :as str]))

(defn- attr-token
  [value]
  (if (keyword? value)
    (name value)
    (str value)))

(defn- with-class
  [attrs class]
  (if class
    (update attrs :class
            (fn [current]
              (str/join " "
                        (remove str/blank?
                                [(str (or current "")) (str class)]))))
    attrs))

(defn tag
  [{:keys [color class attrs]} & children]
  (let [tag-attrs (cond-> (merge (or attrs {})
                                 {:data-component "re-frame-tag"})
                    color (assoc :data-color (attr-token color))
                    class (with-class class))]
    (into [:span tag-attrs] children)))
