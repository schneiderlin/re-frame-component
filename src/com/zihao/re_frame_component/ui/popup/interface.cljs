(ns com.zihao.re-frame-component.ui.popup.interface
  (:require
   [com.zihao.re-frame-component.ui.popup :as view]))

(defn popup-frame
  "Renders a headless modal overlay and dialog panel around `content`."
  [content & {:keys [overlay-attrs panel-attrs panel-tag]}]
  [view/popup-frame
   content
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag])

(defn popup
  "Renders a popup frame with optional cancel and confirm actions.

  Actions may be handlers, re-frame event vectors, or sequences of event
  vectors. Caller attributes style the overlay, panel, footer, and buttons."
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
  [view/popup
   content
   :on-cancel on-cancel
   :on-confirm on-confirm
   :cancel-label cancel-label
   :confirm-label confirm-label
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag
   :footer-attrs footer-attrs
   :cancel-attrs cancel-attrs
   :confirm-attrs confirm-attrs])
