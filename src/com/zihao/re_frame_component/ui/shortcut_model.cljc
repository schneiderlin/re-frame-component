(ns com.zihao.re-frame-component.ui.shortcut-model
  (:require [clojure.string :as str]))

(defn recorded-shortcut
  "Convert one key press to UI SDK notation, or nil if it is not a shortcut."
  [{:keys [key meta? ctrl? alt? shift? composing? repeat? alt-graph?]}]
  (let [key (str/lower-case (or key ""))
        function-key? (re-matches #"f(?:[1-9]|1[0-9]|2[0-4])" key)]
    (when (and (not (or composing? repeat? alt-graph?))
               (or function-key?
                   (and (or meta? ctrl? alt?)
                        (re-matches #"[a-z0-9]|arrow(?:up|down|left|right)|enter|backspace|delete|home|end|pageup|pagedown| " key))))
      (str/join "+" (cond-> [] meta? (conj "meta") ctrl? (conj "ctrl")
                            alt? (conj "alt") shift? (conj "shift")
                            true (conj (if (= " " key) "space" key)))))))
