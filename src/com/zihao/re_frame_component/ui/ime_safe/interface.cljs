(ns com.zihao.re-frame-component.ui.ime-safe.interface
  "Public API for the IME-safe text field: input/textarea wrappers that keep CJK composition text
  intact while still reporting a controlled value to the caller."
  (:require
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]))

(defn input-event-composing?
  "True while a keyboard event belongs to an IME composition.

  Use this only when the shortcut handler is attached to a container rather
  than to the IME-safe field; `input` and `textarea` already gate their own
  `:on-key-down`.

  Parameters:
  - `dom-event` — DOM keyboard/input event, or a Reagent event wrapper carrying it in
    `:nativeEvent`. Read for `isComposing`, `inputType` `\"insertCompositionText\"`, and the legacy
    `keyCode`/`which` 229 that older Chromium and Safari send while composing.

  Returns: true when the event belongs to a composition, false otherwise."
  [dom-event]
  (ime-safe/input-event-composing? dom-event))

(defn input
  "Renders an IME-safe input.

  `value` is synchronized only outside composition. `on-value` receives the
  complete text after ordinary changes, composition end, and blur. Remaining
  keys are forwarded as input attributes.

  Parameters:
  - `input-attributes` — field attributes:
    - `:value` — required; controlled text value, rendered as the uncontrolled `default-value` and
      pushed onto the DOM node when the caller changes it outside a composition.
    - `:on-value` — optional function of the complete text string, called on change outside
      composition, on composition end, and on blur.
    - `:on-blur` — optional DOM event handler called after `:on-value` on blur.
    - `:on-key-down` — optional DOM event handler; suppressed while composing.
    - any other key — forwarded as an input attribute.

  Returns: Hiccup/reagent vector rendering an `:input`."
  [{:keys [value on-value on-blur] :as input-attributes}]
  [ime-safe/input
   (assoc input-attributes
          :value value
          :on-value on-value
          :on-blur on-blur)])

(defn textarea
  "Renders an IME-safe textarea with the same value contract as `input`.

  Remaining keys are forwarded as textarea attributes.

  Parameters:
  - `textarea-attributes` — field attributes:
    - `:value` — required; controlled text value.
    - `:on-value` — optional function of the complete text string.
    - `:on-blur` — optional DOM event handler.
    - `:on-key-down` — optional DOM event handler; suppressed while composing.
    - any other key — forwarded as a textarea attribute.

  Returns: Hiccup/reagent vector rendering a `:textarea`."
  [{:keys [value on-value on-blur] :as textarea-attributes}]
  [ime-safe/textarea
   (assoc textarea-attributes
          :value value
          :on-value on-value
          :on-blur on-blur)])
