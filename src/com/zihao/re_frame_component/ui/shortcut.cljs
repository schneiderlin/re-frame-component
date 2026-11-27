(ns com.zihao.re-frame-component.ui.shortcut
  (:require [com.zihao.re-frame-component.ui.shortcut-model :as model]
            [goog.object :as obj]
            [reagent.core :as r]))

(defonce ^:private sdk (r/atom nil))
(def ^:private sdk-module
  (delay (-> (js* "import('/re-frame-component/ui-sdk/shortcuts.js')")
             (.then #(reset! sdk %)))))

(defn register! [keys-fn handler options]
  (let [cleanup* (volatile! nil)
        disposed? (volatile! false)]
    (.then @sdk-module (fn [module]
                        (when-not @disposed?
                          (vreset! cleanup* ((obj/get module "registerShortcut") keys-fn handler options)))))
    #(do (vreset! disposed? true) (when-let [cleanup @cleanup*] (cleanup)))))

(defn format-shortcut [value]
  (r/with-let [_ @sdk-module]
    (if-let [module @sdk]
      ((obj/get module "formatShortcut") value)
      value)))

(defn record-key [^js e]
  (let [key (or (.-key e) "")
        ;; Option can produce a symbol or dead key instead of the letter.
        physical (when (and (.-altKey e) (not (re-matches #"[a-zA-Z0-9]" key)))
                   (second (re-matches #"(?:Key|Digit)([A-Z0-9])" (or (.-code e) ""))))]
    (model/recorded-shortcut
     {:key (or physical key) :meta? (.-metaKey e) :ctrl? (.-ctrlKey e) :alt? (.-altKey e)
      :shift? (.-shiftKey e) :composing? (.-isComposing e) :repeat? (.-repeat e)
      :alt-graph? (.getModifierState e "AltGraph")})))
