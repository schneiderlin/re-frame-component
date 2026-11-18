(ns com.zihao.re-frame-component.ui.popup.interface
  "Public API for the re-frame2 popup: a headless modal frame plus a cancel/confirm variant that
  dismisses on Escape."
  (:require
   [com.zihao.re-frame-component.ui.popup :as view]))

(defn popup-frame
  "Renders a headless modal overlay and dialog panel around `content`.

  Pass `:on-dismiss` to close the popup on Escape.

  Parameters:
  - `content` — one Hiccup node or a sequence of nodes rendered inside the dialog panel.
  - `options` — trailing keyword options (the vararg part of the call):
    - `:overlay-attrs` — optional attribute map merged over the overlay defaults.
    - `:panel-attrs` — optional attribute map merged over the dialog panel defaults
      (`:role \"dialog\"`, `:aria-modal \"true\"`, `data-*` markers).
    - `:panel-tag` — optional tag for the dialog panel; defaults to `:section`.
    - `:on-dismiss` — optional dismissal action: a re-frame dispatch vector, a sequence of dispatch
      vectors, or a DOM handler function. When present a document-level Escape listener calls it.

  Returns: Hiccup vector rendering the overlay and panel."
  [content & {:keys [overlay-attrs panel-attrs panel-tag on-dismiss]}]
  [view/popup-frame
   content
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag
   :on-dismiss on-dismiss])

(defn popup
  "Renders a popup frame with optional cancel and confirm actions.

  Actions may be handlers, re-frame event vectors, or sequences of event
  vectors. Cancelling dismisses the popup on Escape; pass `:on-dismiss` when
  dismissal differs from cancelling. Caller attributes style the overlay, panel,
  footer, and buttons.

  Parameters:
  - `content` — one Hiccup node or a sequence of nodes rendered inside the dialog panel.
  - `options` — trailing keyword options (the vararg part of the call):
    - `:on-cancel` — optional cancel action (handler, dispatch vector, or sequence of dispatch
      vectors); also used as the Escape dismissal action when `:on-dismiss` is absent.
    - `:on-dismiss` — optional Escape dismissal action, overriding `:on-cancel` for Escape.
    - `:on-confirm` — optional confirm action.
    - `:cancel-label` — optional cancel button label; defaults to `\"Cancel\"`.
    - `:confirm-label` — optional confirm button label; defaults to `\"Confirm\"`.
    - `:overlay-attrs`, `:panel-attrs`, `:panel-tag` — forwarded to `popup-frame`.
    - `:footer-attrs` — optional attribute map merged onto the footer.
    - `:cancel-attrs`, `:confirm-attrs` — optional attribute maps merged onto the buttons; a
      supplied `:on-click` wins over the generated action handler.

  Returns: Hiccup vector rendering the popup frame with a footer of actions; the footer is omitted
  when neither `:on-cancel` nor `:on-confirm` is given. An action that is none of handler, dispatch
  vector, or sequence of dispatch vectors throws `ex-info` when the button is clicked."
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
  [view/popup
   content
   :on-cancel on-cancel
   :on-dismiss on-dismiss
   :on-confirm on-confirm
   :cancel-label cancel-label
   :confirm-label confirm-label
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag
   :footer-attrs footer-attrs
   :cancel-attrs cancel-attrs
   :confirm-attrs confirm-attrs])
