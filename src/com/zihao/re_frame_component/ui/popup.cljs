(ns com.zihao.re-frame-component.ui.popup
  (:require
   [re-frame.core :as rf]
   [reagent.core :as r]))

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
  [action dispatch]
  (cond
    (nil? action) nil
    (fn? action) action
    (vector? action) (fn [_event] (dispatch action))
    (sequential? action) (fn [_event]
                           (doseq [event action]
                             (dispatch event)))
    :else (throw (ex-info "RF2 popup action must be a dispatch vector, a sequence of dispatch vectors, or a handler function."
                          {:action action}))))

(defn- action-attrs
  [attrs action dispatch]
  (cond-> (merge {:type "button"} (or attrs {}))
    (and action (not (:on-click attrs)))
    (assoc :on-click (action-handler action dispatch))))

(defn dismiss-key?
  "True when a popup should treat this keydown as a dismissal request.

  Escape starts as a request and only dismisses the popup when nothing inside
  consumed it first. Inner popups — an open searchable select, for example —
  call `preventDefault` on the Escape they handle, so the enclosing popup waits
  for the next one instead of closing both layers at once."
  [event]
  (and (= "Escape" (.-key event))
       (not (.-defaultPrevented event))))

(defn- dismiss-listener
  "Render `frame` with a document-level Escape listener mounted beside it.

  The listener mounts once and reads the dismissal action from the latest
  render, so hosts can pass a fresh closure every time. `dispatch` is the
  frame-bound dispatcher captured by `escape-dismiss`: a DOM keydown callback
  runs outside the render's frame scope, where a bare `rf/dispatch` has no
  frame to resolve."
  [on-dismiss frame dispatch]
  (r/with-let [dismiss!* (atom nil)
               key-handler (fn [event]
                             (when (dismiss-key? event)
                               (.preventDefault event)
                               (when-let [dismiss! @dismiss!*]
                                 (dismiss! event))))]
    (reset! dismiss!* (action-handler on-dismiss dispatch))
    (.addEventListener js/document "keydown" key-handler)
    frame
    (finally
      (.removeEventListener js/document "keydown" key-handler))))

(rf/reg-view ^{:rf/id ::escape-dismiss} escape-dismiss
  "Popup frame wrapper that closes the popup on Escape."
  [on-dismiss frame]
  (dismiss-listener on-dismiss frame dispatch))

(defn popup-frame
  "Render a headless RF2/Reagent popup frame.

  `content` may be one Hiccup node or a seq of nodes. Callers own the inner
  layout, state, and event ids.
  Options:
  - `:overlay-attrs` merges onto the overlay attrs.
  - `:panel-attrs` merges onto the dialog panel attrs.
  - `:panel-tag` overrides the panel tag, defaulting to `:section`.
  - `:on-dismiss` closes the popup on Escape. It accepts a re-frame dispatch
    vector, a sequence of dispatch vectors, or a DOM handler function, and is
    what keeps Escape working when focus sits outside the dialog."
  [content & {:keys [overlay-attrs panel-attrs panel-tag on-dismiss]}]
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
        panel-tag (or panel-tag :section)
        frame [:div overlay-attrs
               (into [panel-tag panel-attrs]
                     (child-nodes content))]]
    (if on-dismiss
      [escape-dismiss on-dismiss frame]
      frame)))

(defn popup
  "Render an RF2/Reagent popup with optional cancel and confirm buttons.

  `:on-cancel` and `:on-confirm` may be re-frame dispatch vectors, sequences of
  dispatch vectors, or DOM handler functions. Cancelling also dismisses the
  popup on Escape; pass `:on-dismiss` when dismissal differs from cancelling.
  Button attrs can be extended with `:cancel-attrs` and `:confirm-attrs`."
  [content & {:keys [on-cancel
                     on-dismiss
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
          [:button (action-attrs cancel-attrs on-cancel rf/dispatch)
           cancel-label])
        (when on-confirm
          [:button (action-attrs confirm-attrs on-confirm rf/dispatch)
           confirm-label])]]))
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag
   :on-dismiss (or on-dismiss on-cancel)))
