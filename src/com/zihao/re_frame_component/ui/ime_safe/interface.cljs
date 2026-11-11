(ns com.zihao.re-frame-component.ui.ime-safe.interface
  (:require
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]))

(defn input-event-composing?
  "True while a keyboard event belongs to an IME composition.

  Use this only when the shortcut handler is attached to a container rather
  than to the IME-safe field; `input` and `textarea` already gate their own
  `:on-key-down`."
  [dom-event]
  (ime-safe/input-event-composing? dom-event))

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
