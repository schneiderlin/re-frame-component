(ns com.zihao.re-frame-component.ui.disclosure.model
  "The markup contract of one disclosure, without mounting it.

   ui-sdk's collapsible is three elements that find each other by nesting: a root
   that owns the open state, a trigger that wraps the caller's own native button,
   and a panel that the root shows and hides. Everything the elements need in
   order to agree is plain data here, so the contract is provable on the JVM
   while the mounted behavior — the press, Enter/Space, returning focus to the
   trigger when a panel closes under the pointer, find in page — stays in
   `ui.disclosure`.

   The caller owns every label, class and piece of copy. Nothing here renders
   text or styles of its own, and the one glyph the shared affordance needs
   (`chevron`) is a neutral path, not a product illustration.")

(def root-tag
  "Tag name of the disclosure root (`ui-collapsible`)."
  "ui-collapsible")

(def trigger-tag
  "Tag name of the part that wraps the caller's button
   (`ui-collapsible-trigger`)."
  "ui-collapsible-trigger")

(def panel-tag
  "Tag name of the panel the root shows and hides (`ui-collapsible-panel`)."
  "ui-collapsible-panel")

(def chevron-view-box
  "The 12-unit box the shared chevron is drawn in."
  "0 0 12 12")

(def chevron-path
  "The shared disclosure chevron: one stroke pointing right, rotated by the
   caller's paint when the panel is open."
  "M3.5 2.25 7.25 6 3.5 9.75")

(def default-keep-mounted?
  "Whether a closed panel stays in the page, hidden.

   A panel that unmounts throws away everything inside it — scroll position, a
   half-typed field, the diff a person was reading — so remaining mounted is the
   default, and a caller that wants the DOM gone opts out with
   `:keep-mounted? false`."
  true)

(def ^:private driver-keys
  "Props the component keeps in Clojure data or writes as live state, never
   rendered as ordinary attributes."
  [:open? :default-open? :on-open-change :on-ref :disabled? :attrs
   :trigger-attrs :button-attrs :panel-attrs :trigger-children :panel-children
   :keep-mounted? :hidden-until-found?])

(defn- flag-attribute
  "A boolean the element reads by value.

   ui-sdk parses a boolean attribute by its value for every option except
   `disabled`/`required`, so a `false` that has to survive the trip is spelled
   `\"false\"` rather than left out."
  [value]
  (str (boolean value)))

(defn- root-attrs
  [{:keys [attrs default-open?]}]
  (cond-> (apply dissoc (or attrs {}) driver-keys)
    (some? default-open?) (assoc :default-open (flag-attribute default-open?))))

(defn- trigger-attrs
  [{:keys [trigger-attrs]}]
  (apply dissoc (or trigger-attrs {}) driver-keys))

(defn- button-attrs
  "The native button's attributes.

   Its type is always `button`: a trigger inside a form must not submit it, and
   the element's own contract assumes a plain button, so a caller cannot turn it
   into one by accident."
  [{:keys [button-attrs]}]
  (assoc (apply dissoc (or button-attrs {}) driver-keys) :type "button"))

(defn- panel-attrs
  [{:keys [panel-attrs open? default-open? hidden-until-found?] :as props}]
  (let [keep-mounted? (if (contains? props :keep-mounted?)
                        (:keep-mounted? props)
                        default-keep-mounted?)]
    (cond-> (apply dissoc (or panel-attrs {}) driver-keys)
      (some? keep-mounted?)
      (assoc :keep-mounted (flag-attribute keep-mounted?))

      (some? hidden-until-found?)
      (assoc :hidden-until-found (flag-attribute hidden-until-found?))

      ;; A closed panel is in the page before the elements upgrade, so it starts
      ;; hidden as markup too; afterwards the element owns that attribute.
      (not (or (true? open?) (true? default-open?)))
      (assoc :hidden true))))

(defn markup
  "The element tree of one disclosure.

   Parameters:
   - `props` — the disclosure:
     - `:open?` — the open state, when the caller owns it; the component writes
       it onto the element as live state.
     - `:default-open?` — the state a panel opens with when the element owns it.
     - `:on-open-change` — optional function of the next boolean. Return `false`
       to keep the current state while a save runs.
     - `:on-ref` — optional function of the root element, called on mount and on
       every update, for a caller that must bind a popup layer or move focus to
       the disclosure itself.
     - `:disabled?` — optional; keeps the trigger's press from changing anything.
     - `:keep-mounted?` — whether a closed panel stays in the page, hidden;
       defaults to `true`, so a panel keeps its scroll position and its fields.
     - `:hidden-until-found?` — keeps a closed panel findable by the browser's
       find in page, which then opens it.
     - `:attrs` — optional map merged onto the root (`:class`, `:data-*`).
     - `:trigger-attrs` — optional map merged onto the trigger part.
     - `:button-attrs` — optional map merged onto the native button the trigger
       wraps (its `:class`, `:aria-label`, `:data-*`); `:type` is always
       `\"button\"`, and `aria-expanded` / `aria-controls` come from the element.
     - `:panel-attrs` — optional map merged onto the panel.
     - `:trigger-children` — the button's content, in order: the caller's label
       and usually one `chevron`.
     - `:panel-children` — the panel's content, kept mounted while closed.

   Returns: hiccup `[root attrs [trigger attrs [button attrs ...content]]
   [panel attrs ...content]]`, free of the open state when the caller omits it.

   Pure, so the DOM contract the behavior expects is testable without a browser."
  [{:keys [trigger-children panel-children] :as props}]
  [(keyword root-tag)
   (root-attrs props)
   [(keyword trigger-tag)
    (trigger-attrs props)
    (into [:button (button-attrs props)] (or trigger-children []))]
   (into [(keyword panel-tag) (panel-attrs props)] (or panel-children []))])

(defn chevron
  "One chevron for a disclosure's button.

   Parameters:
   - `attrs` — optional map merged onto the `<svg>` (`:class`, `:data-*`). The
     caller's paint rotates it from the element's `data-open` hook and gives it a
     box, so the glyph carries no size of its own.

   Returns: hiccup `<svg>` for one stroke chevron pointing right."
  ([]
   (chevron nil))
  ([attrs]
   [:svg
    (merge {:viewBox chevron-view-box
            :aria-hidden "true"
            :focusable "false"
            :fill "none"
            :stroke "currentColor"
            :stroke-width "1.5"
            :stroke-linecap "round"
            :stroke-linejoin "round"}
           (or attrs {}))
    [:path {:d chevron-path}]]))
