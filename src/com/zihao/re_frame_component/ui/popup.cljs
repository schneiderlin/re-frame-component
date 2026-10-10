(ns com.zihao.re-frame-component.ui.popup
  (:require
   [re-frame.core :as rf]))

(defn- merge-attrs
  [defaults attrs]
  (merge-with
   (fn [default-value value]
     (cond
       (= default-value value) value
       (and (map? default-value) (map? value)) (merge default-value value)
       (and (sequential? default-value) (sequential? value)) (vec (concat default-value value))
       (and (string? default-value) (string? value)) (str default-value " " value)
       :else value))
   defaults
   (or attrs {})))

(defn- child-nodes
  [content]
  (if (seq? content)
    content
    (list content)))

(defn- action-handler
  [action]
  (cond
    (nil? action) nil
    (fn? action) action
    (vector? action) (fn [_event] (rf/dispatch action))
    (sequential? action) (fn [_event]
                           (doseq [event action]
                             (rf/dispatch event)))
    :else (throw (ex-info "RF2 popup action must be a dispatch vector, a sequence of dispatch vectors, or a handler function."
                          {:action action}))))

(defn- action-attrs
  [attrs action]
  (cond-> (merge {:type "button"} (or attrs {}))
    (and action (not (:on-click attrs)))
    (assoc :on-click (action-handler action))))

(defn popup-frame
  "Render a headless RF2/Reagent popup frame.

  `content` may be one Hiccup node or a seq of nodes. Callers own the inner
  layout, state, and event ids.
  Options:
  - `:overlay-attrs` merges onto the overlay attrs.
  - `:panel-attrs` merges onto the dialog panel attrs.
  - `:panel-tag` overrides the panel tag, defaulting to `:section`."
  [content & {:keys [overlay-attrs panel-attrs panel-tag]}]
  (let [overlay-attrs (merge-attrs
                       {:role "presentation"
                        :data-component "re-frame-popup"
                        :data-state "open"}
                       overlay-attrs)
        panel-attrs (merge-attrs
                     {:role "dialog"
                      :aria-modal "true"
                      :data-component "re-frame-popup-panel"
                      :data-state "open"}
                     panel-attrs)
        panel-tag (or panel-tag :section)]
    [:div overlay-attrs
     (into [panel-tag panel-attrs]
           (child-nodes content))]))

(defn popup
  "Render an RF2/Reagent popup with optional cancel and confirm buttons.

  `:on-cancel` and `:on-confirm` may be re-frame dispatch vectors, sequences of
  dispatch vectors, or DOM handler functions. Button attrs can be extended with
  `:cancel-attrs` and `:confirm-attrs`."
  [content & {:keys [on-cancel
                     on-confirm
                     cancel-label
                     confirm-label
                     overlay-attrs
                     panel-attrs
                     panel-tag
                     footer-attrs
                     cancel-attrs
                     confirm-attrs]
              :or {cancel-label "Cancel"
                   confirm-label "Confirm"}}]
  (popup-frame
   (concat
    (child-nodes content)
    (when (or on-cancel on-confirm)
      [[:footer (merge-attrs {:data-region "popup-footer"} footer-attrs)
        (when on-cancel
          [:button (action-attrs cancel-attrs on-cancel)
           cancel-label])
        (when on-confirm
          [:button (action-attrs confirm-attrs on-confirm)
           confirm-label])]]))
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag))
