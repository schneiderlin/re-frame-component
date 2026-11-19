(ns com.zihao.re-frame-component.ui.switch
  "A controlled switch: one boolean setting that a press turns on or off.

   The behavior comes from ui-sdk's `ui-switch` / `ui-switch-thumb` elements —
   `switch` role, Space and click activation, focus handling, form participation,
   and the `data-checked` / `data-unchecked` / `data-disabled` hooks on the track
   and its thumb. Those elements ship as ES modules that Closure cannot parse, so
   they are bundled once into a plain module asset
   (`re-frame-component/ui-sdk/switch.js`) and loaded with a module script the
   first time a switch renders. Nothing here imports the npm package, and a host
   that serves this component's resources needs no build step of its own.

   Callers see plain Clojure data and paint it themselves: this namespace owns no
   styles, no copy and no state. `ui.switch.model` owns the element tree; this
   namespace keeps that element's value in sync with the caller, loads the
   elements, and reports presses back."
  (:require
   [com.zihao.re-frame-component.ui.switch.model :as model]
   [reagent.core :as r]))

(def module-url
  "URL of the bundled switch elements, relative to the root that serves this
   component's `resources/public`."
  "/re-frame-component/ui-sdk/switch.js")

(defonce ^:private elements-state
  ;; :idle → :loading → :ready, or :error when the module never loaded.
  (r/atom :idle))

(defn- elements-ready?
  []
  (boolean (some-> js/window .-customElements (.get model/track-tag))))

(defn- load-elements!
  "Loads the element bundle once and flips `elements-state` when it lands."
  []
  (when (= :idle @elements-state)
    (reset! elements-state :loading)
    (let [script (js/document.createElement "script")]
      (set! (.-type script) "module")
      (set! (.-src script) module-url)
      (set! (.-onload script)
            (fn [_] (reset! elements-state (if (elements-ready?) :ready :error))))
      (set! (.-onerror script)
            (fn [error]
              (reset! elements-state :error)
              (js/console.error
               "re-frame-component: the shared switch module failed to load"
               error)))
      (.appendChild js/document.head script))))

(defn- write-props!
  "Pushes the controlled value onto the element.

   `checked` is a live property on the element (it reflects to its attribute and
   to the `data-*` hooks), while `disabled` is an attribute option, so each is
   written the way the element reads it."
  [^js node checked? disabled?]
  (when node
    (set! (.-checked node) (boolean checked?))
    (.toggleAttribute node "disabled" (boolean disabled?))))

(defn- change-reason
  [^js dom-event]
  (some-> dom-event .-detail .-reason))

(defn- change-value
  [^js dom-event]
  (boolean (some-> dom-event .-detail .-value)))

(defn- switch-element
  "The mounted switch: loads the elements, writes the controlled props on every
   render, and reports presses through the caller's `:on-change`."
  [props]
  (let [node* (atom nil)
        handler* (atom (:on-change props))
        listening?* (atom false)
        on-change (fn [^js dom-event]
                    ;; Writing the controlled value is an `imperative` change: only
                    ;; a press or a form reset should reach the caller.
                    (when-not (= "imperative" (change-reason dom-event))
                      (let [accepted? (if-let [handler @handler*]
                                        (handler (change-value dom-event))
                                        true)]
                        (when (false? accepted?)
                          ;; The caller is saving: keep the old value until it renders.
                          (.preventDefault dom-event)))))
        sync! (fn [props]
                (when-let [^js node @node*]
                  (write-props! node (:checked? props) (:disabled? props))
                  (when-not @listening?*
                    (.addEventListener node "checkedchange" on-change)
                    (reset! listening?* true))))]
    (r/create-class
     {:display-name "re-frame-component-switch"
      :component-did-mount
      (fn [this]
        (let [[_ props] (r/argv this)]
          (reset! handler* (:on-change props))
          (load-elements!)
          (sync! props)))
      :component-did-update
      (fn [this _previous-argv]
        (let [[_ props] (r/argv this)]
          (reset! handler* (:on-change props))
          (sync! props)))
      :component-will-unmount
      (fn [_this]
        (when-let [^js node @node*]
          (.removeEventListener node "checkedchange" on-change))
        (reset! listening?* false))
      ;; The element renders only once its definitions are loaded, so the mount
      ;; hook is what starts the load: the first pass draws nothing, the state
      ;; flip re-renders every mounted switch with the element in place.
      :reagent-render
      (fn [props]
        (when (or (elements-ready?) (= :ready @elements-state))
          (assoc-in (model/markup props) [1 :ref] #(reset! node* %))))})))

(defn switch
  "Renders one controlled switch.

   Parameters:
   - `props` — field attributes:
     - `:id` — required element id; a caller's `<label for>` or description
       `aria-describedby` points at it.
     - `:checked?` — whether the switch is on.
     - `:disabled?` — optional; blocks focus, presses and form submission.
     - `:on-change` — optional function of the next boolean. Return `false` to
       keep the current value while a save runs; the element's change is
       cancelled and the caller re-renders the value it accepted.
     - `:attrs` — optional map merged onto the track element (`:class`,
       `:data-action`, `aria-*`).
     - `:thumb-attrs` — optional map merged onto the thumb element.

   Returns: Reagent hiccup for the switch, or nil while its elements load. The
   caller owns every visual class and every label; nothing here renders text."
  [props]
  [switch-element props])
