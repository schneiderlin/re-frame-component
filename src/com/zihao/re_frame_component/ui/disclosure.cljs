(ns com.zihao.re-frame-component.ui.disclosure
  "One panel a person opens and closes: a Thread's toolset, a file's diff, Help me
   understand.

   The behavior comes from ui-sdk's `ui-collapsible` / `ui-collapsible-trigger` /
   `ui-collapsible-panel` elements — the WAI-ARIA disclosure pattern, Enter and
   Space on the trigger, returning focus to the trigger when a panel closes
   underneath it, the `openchange` event and its reasons, find in page, and the
   `data-open` / `data-closed` / `data-disabled` hooks each part carries. Those
   elements ship as ES modules that Closure cannot parse, so they are bundled
   once into a plain module asset (`re-frame-component/ui-sdk/collapsible.js`)
   and loaded with a module script the first time a disclosure renders. Nothing
   here imports the npm package, and a host that serves this component's
   resources needs no build step of its own.

   Callers see plain Clojure data and paint it themselves: this namespace owns no
   styles, no copy and no open state. `ui.disclosure.model` owns the element tree
   and the shared chevron; this namespace writes the caller's open state onto the
   element, loads the elements, and reports what a person did."
  (:require
   [com.zihao.re-frame-component.ui.disclosure.model :as model]
   [reagent.core :as r]))

(def module-url
  "URL of the bundled collapsible elements, relative to the root that serves this
   component's `resources/public`."
  "/re-frame-component/ui-sdk/collapsible.js")

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
               "re-frame-component: the shared collapsible module failed to load"
               error)))
      (.appendChild js/document.head script))))

(defn- write-props!
  "Pushes the caller's own state onto the element.

   `open` is a live property: an attribute string would read as `true` whenever it
   says anything, and writing it is how a controlled panel is kept in step. A
   panel nobody controls is left alone, so what a person opened survives the next
   render. `disabled` stays an attribute, because the element reads it by
   presence."
  [^js node {:keys [open? disabled?] :as props}]
  (when node
    (when (contains? props :open?)
      (set! (.-open node) (boolean open?)))
    (.toggleAttribute node "disabled" (boolean disabled?))))

(defn- change-reason
  [^js dom-event]
  (some-> dom-event .-detail .-reason))

(defn- change-value
  [^js dom-event]
  (boolean (some-> dom-event .-detail .-value)))

(defn- disclosure-element
  "The mounted disclosure: loads the elements, writes the caller's open state on
   every render, and reports a person's changes through `:on-open-change`."
  [props]
  (let [node* (atom nil)
        handler* (atom (:on-open-change props))
        listening?* (atom false)
        on-open-change (fn [^js dom-event]
                         ;; Writing the controlled state is an `imperative`
                         ;; change: only a press, an arrow key or find in page
                         ;; belongs to the caller.
                         (when-not (= "imperative" (change-reason dom-event))
                           (let [accepted? (if-let [handler @handler*]
                                             (handler (change-value dom-event))
                                             true)]
                             (when (false? accepted?)
                               ;; The caller is saving: keep the old value until
                               ;; it renders the one it accepted.
                               (.preventDefault dom-event)))))
        sync! (fn [props]
                (when-let [^js node @node*]
                  (write-props! node props)
                  (when-let [on-ref (:on-ref props)]
                    (on-ref node))
                  (when-not @listening?*
                    (.addEventListener node "openchange" on-open-change)
                    (reset! listening?* true))))]
    (r/create-class
     {:display-name "re-frame-component-disclosure"
      :component-did-mount
      (fn [this]
        (let [[_ props] (r/argv this)]
          (reset! handler* (:on-open-change props))
          (load-elements!)
          (sync! props)))
      :component-did-update
      (fn [this _previous-argv]
        (let [[_ props] (r/argv this)]
          (reset! handler* (:on-open-change props))
          (sync! props)))
      :component-will-unmount
      (fn [_this]
        (when-let [^js node @node*]
          (.removeEventListener node "openchange" on-open-change))
        (reset! listening?* false))
      ;; The elements render only once their definitions are loaded, so the mount
      ;; hook is what starts the load: the first pass draws nothing, and the
      ;; state flip re-renders every mounted disclosure with the element in
      ;; place.
      :reagent-render
      (fn [props]
        (when (or (elements-ready?) (= :ready @elements-state))
          (assoc-in (model/markup props) [1 :ref] #(reset! node* %))))})))

(defn disclosure
  "Renders one disclosure: a trigger a person presses and the panel it shows.

   Parameters:
   - `props` — the disclosure:
     - `:open?` — the open state, when the caller owns it. Omit it to let the
       element own the state; a caller that owns it re-renders the value it
       accepts, and only a person's change is reported back.
     - `:default-open?` — the state a panel opens with when the element owns it.
     - `:on-open-change` — optional function of the next boolean. Return `false`
       to keep the current state while a save runs.
     - `:on-ref` — optional function of the root element, called on mount and on
       every update, for a surface that must bind a popup layer to the disclosure
       or move focus back into it.
     - `:disabled?` — optional; a press on the trigger then changes nothing.
     - `:keep-mounted?` — whether a closed panel stays in the page, hidden.
       Defaults to `true` (`ui.disclosure.model/default-keep-mounted?`).
     - `:hidden-until-found?` — keeps a closed panel findable by the browser's
       find in page, which opens it on a match.
     - `:attrs` / `:trigger-attrs` / `:button-attrs` / `:panel-attrs` — the
       caller's painting and test hooks on each part. Do not set
       `aria-expanded`, `aria-controls` or `id` on the button: the element owns
       them.
     - `:trigger-children` — the button's content: the caller's label, plus
       usually `(disclosure-chevron {:class ...})`.
     - `:panel-children` — the panel's content.

   Returns: Reagent hiccup for the disclosure, or nil while its elements load. The
   caller owns every visual class and every label; nothing here renders text. The
   mounted parts carry `data-open` / `data-closed` (and `data-disabled`), so the
   caller's paint reads the state from the element instead of re-deriving it."
  [props]
  [disclosure-element props])

(defn disclosure-chevron
  "The shared disclosure chevron, for a trigger's content.

  Parameters:
  - `attrs` — optional map merged onto the `<svg>`; pass the caller's class,
    whose paint rotates the glyph from the trigger's `data-open`.

  Returns: hiccup `<svg>` for one stroke chevron pointing right."
  ([]
   (model/chevron))
  ([attrs]
   (model/chevron attrs)))
