(ns com.zihao.re-frame-component.ui.segmented-control
  "A controlled choice on a short scale: three to five answers a learner picks
   one of.

   The behavior comes from ui-sdk's `ui-segmented-control` /
   `ui-segmented-control-item` elements — the `radiogroup` and `radio` roles,
   roving focus, Arrow/Home/End navigation, press activation, form participation,
   and the `data-checked` / `data-unchecked` / `data-disabled` hooks on each item.
   Those elements ship as ES modules that Closure cannot parse, so they are
   bundled once into a plain module asset
   (`re-frame-component/ui-sdk/segmented-control.js`) and loaded with a module
   script the first time a control renders. Nothing here imports the npm
   package, and a host that serves this component's resources needs no build
   step of its own.

   Callers see plain Clojure data and paint it themselves: this namespace owns no
   styles, no copy and no state. `ui.segmented-control.model` owns the element
   tree; this namespace keeps that element's value in sync with the caller, loads
   the elements, and reports presses back."
  (:require
   [com.zihao.re-frame-component.ui.segmented-control.model :as model]
   [reagent.core :as r]))

(def module-url
  "URL of the bundled segmented-control elements, relative to the root that
   serves this component's `resources/public`."
  "/re-frame-component/ui-sdk/segmented-control.js")

(defonce ^:private elements-state
  ;; :idle → :loading → :ready, or :error when the module never loaded.
  (r/atom :idle))

(defn- elements-ready?
  []
  (boolean (some-> js/window .-customElements (.get model/root-tag))))

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
               "re-frame-component: the shared segmented control module failed to load"
               error)))
      (.appendChild js/document.head script))))

(defn- write-props!
  "Pushes the controlled state onto the element.

   `value` is live state on the element, so it is written as the property that
   reflects it; `disabled` and `read-only` are options the element reads from its
   attributes."
  [^js node value disabled? read-only?]
  (when node
    (set! (.-value node) (when (some? value) (str value)))
    (.toggleAttribute node "disabled" (boolean disabled?))
    (.toggleAttribute node "read-only" (boolean read-only?))))

(defn- change-reason
  [^js dom-event]
  (some-> dom-event .-detail .-reason))

(defn- change-value
  [^js dom-event]
  (some-> dom-event .-detail .-value))

(defn- control-element
  "The mounted control: loads the elements, writes the controlled value on every
   render, and reports presses through the caller's `:on-change`."
  [props]
  (let [node* (atom nil)
        handler* (atom (:on-change props))
        parse* (atom (or (:parse-value props) identity))
        listening?* (atom false)
        on-change (fn [^js dom-event]
                    ;; Writing the controlled value is an `imperative` change: only
                    ;; a press or a form reset should reach the caller.
                    (when-not (= "imperative" (change-reason dom-event))
                      (let [raw (change-value dom-event)
                            value ((or @parse* identity) raw)
                            accepted? (if-let [handler @handler*]
                                        (handler value)
                                        true)]
                        (when (false? accepted?)
                          ;; The caller is saving: keep the old value until it renders.
                          (.preventDefault dom-event)))))
        sync! (fn [{:keys [value disabled? read-only?]}]
                (when-let [^js node @node*]
                  (write-props! node value disabled? read-only?)
                  (when-not @listening?*
                    (.addEventListener node "valuechange" on-change)
                    (reset! listening?* true))))]
    (r/create-class
     {:display-name "re-frame-component-segmented-control"
      :component-did-mount
      (fn [this]
        (let [[_ props] (r/argv this)]
          (reset! handler* (:on-change props))
          (reset! parse* (or (:parse-value props) identity))
          (load-elements!)
          (sync! props)))
      :component-did-update
      (fn [this _previous-argv]
        (let [[_ props] (r/argv this)]
          (reset! handler* (:on-change props))
          (reset! parse* (or (:parse-value props) identity))
          (sync! props)))
      :component-will-unmount
      (fn [_this]
        (when-let [^js node @node*]
          (.removeEventListener node "valuechange" on-change))
        (reset! listening?* false))
      ;; The elements render only once their definitions are loaded, so the mount
      ;; hook is what starts the load: the first pass draws nothing, the state
      ;; flip re-renders every mounted control with the element in place.
      :reagent-render
      (fn [props]
        (when (or (elements-ready?) (= :ready @elements-state))
          (assoc-in (model/markup props) [1 :ref] #(reset! node* %))))})))

(defn segmented-control
  "Renders one controlled segmented control.

   Parameters:
   - `props` — the control:
     - `:id` — required element id; a caller's legend or label names the group.
     - `:value` — the chosen item's `:value`, or nil when nothing is chosen. The
       caller owns it and re-renders the value it accepts.
     - `:items` — required sequence of `{:value ... :label ... :attrs ...}`; see
       `ui.segmented-control.model/markup`.
     - `:on-change` — optional function of the chosen value, mapped back through
       `:parse-value`. Return `false` to keep the current value while a save
       runs; the element's change is cancelled and the caller re-renders the
       value it accepted.
     - `:parse-value` — optional function of the item's `value` attribute string;
       defaults to `identity`. Use it when the caller's values are numbers or
       keywords.
     - `:disabled?` / `:read-only?` — optional; the group keeps its value but
       stops accepting changes.
     - `:attrs` / `:item-attrs` / `:indicator?` / `:indicator-attrs` — painting
       and semantics, exactly as the markup contract describes.

   Returns: Reagent hiccup for the control, or nil while its elements load. The
   caller owns every visual class and every label; nothing here renders text."
  [props]
  [control-element props])
