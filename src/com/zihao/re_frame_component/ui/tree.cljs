(ns com.zihao.re-frame-component.ui.tree
  "A nested list a person opens, closes and picks from: a Thread and the Threads
   it spawned, a folder and its files.

   The behavior comes from ui-sdk's `ui-tree` / `ui-tree-item` /
   `ui-tree-item-label` / `ui-tree-item-indicator` / `ui-tree-group` elements —
   the `tree`/`treeitem` roles, the roving tab stop, Arrow/Home/End/typeahead
   navigation, Enter/Space selection, per-branch expansion, the `current` row's
   ancestors opening themselves, and the `data-expanded` / `data-selected` /
   `data-level` / `data-current` hooks the caller paints from. Those elements
   ship as ES modules that Closure cannot parse, so they are bundled once into a
   plain module asset (`re-frame-component/ui-sdk/tree.js`) and loaded with a
   module script the first time a tree renders. Nothing here imports the npm
   package, and a host that serves this component's resources needs no build
   step of its own.

   Callers see plain Clojure data and paint it themselves: this namespace owns no
   styles, no copy and no expanded-or-selected state. `ui.tree.model` owns the
   element tree; this namespace keeps the caller's selection and expansion on the
   element as live state, loads the elements, and reports what a person did."
  (:require
   [com.zihao.re-frame-component.ui.tree.model :as model]
   [reagent.core :as r]))

(def module-url
  "URL of the bundled tree elements, relative to the root that serves this
   component's `resources/public`."
  "/re-frame-component/ui-sdk/tree.js")

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
               "re-frame-component: the shared tree module failed to load"
               error)))
      (.appendChild js/document.head script))))

(defn- write-props!
  "Pushes the caller's state onto the element.

   `value` and `expanded` are controlled live state on the element, so they are
   written as the properties that reflect them; everything structural (mode,
   `current`, whether a press expands a branch) is an attribute the markup
   already carries."
  [^js node value expanded]
  (when node
    (set! (.-value node) (when (some? value) (model/value-attribute value)))
    (set! (.-expanded node) (clj->js (mapv model/value-attribute (or expanded []))))))

(defn- action-value
  [^js dom-event]
  (some-> dom-event .-detail .-value))

(defn- change-reason
  [^js dom-event]
  (some-> dom-event .-detail .-reason))

(defn- change-value
  [^js dom-event]
  (some-> dom-event .-detail .-value))

(defn- nested-control-press?
  "Whether a row press started inside a control the row hosts.

   The elements treat any press whose nearest `treeitem` is this row as a press
   on the row, so a menu or a button inside a row would also select it. A caller
   marks such a control with `data-row-action`, and its presses stay its own."
  [^js dom-event]
  (let [target (some-> dom-event .-detail .-event .-target)]
    (boolean (and target
                  (fn? (.-closest target))
                  (.closest target "[data-row-action]")))))

(defn- expanded-values
  "The `expandedchange` list as a Clojure vector of strings."
  [^js dom-event]
  (into [] (or (some-> (change-value dom-event) js->clj) [])))

(defn- tree-element
  "The mounted tree: loads the elements, writes the caller's value and expansion
   on every render, and reports presses and toggles through the caller's
   callbacks."
  [props]
  (let [node* (atom nil)
        on-value-change* (atom (:on-value-change props))
        on-expanded-change* (atom (:on-expanded-change props))
        on-action* (atom (:on-action props))
        listening?* (atom false)
        ;; Writing the controlled state is an `imperative` change: only what a
        ;; person pressed, walked to or had announced belongs to the caller.
        on-value-change (fn [^js dom-event]
                          (when-not (or (= "imperative" (change-reason dom-event))
                                        (nested-control-press? dom-event))
                            (when-let [handler @on-value-change*]
                              (handler (change-value dom-event)))))
        on-expanded-change (fn [^js dom-event]
                             (when-not (= "imperative" (change-reason dom-event))
                               (when-let [handler @on-expanded-change*]
                                 (handler (expanded-values dom-event)))))
        ;; Every press on a row is an action, including one on the row that is
        ;; already selected — that press changes no value, so the element cannot
        ;; report it as a selection.
        on-action (fn [^js dom-event]
                    (when-not (nested-control-press? dom-event)
                      (when-let [handler @on-action*]
                        (handler (action-value dom-event)))))
        sync! (fn [{:keys [value expanded]}]
                (when-let [^js node @node*]
                  (write-props! node value expanded)
                  (when-not @listening?*
                    (.addEventListener node "valuechange" on-value-change)
                    (.addEventListener node "expandedchange" on-expanded-change)
                    (.addEventListener node "action" on-action)
                    (reset! listening?* true))))]
    (r/create-class
     {:display-name "re-frame-component-tree"
      :component-did-mount
      (fn [this]
        (let [[_ props] (r/argv this)]
          (reset! on-value-change* (:on-value-change props))
          (reset! on-expanded-change* (:on-expanded-change props))
          (reset! on-action* (:on-action props))
          (load-elements!)
          (sync! props)))
      :component-did-update
      (fn [this _previous-argv]
        (let [[_ props] (r/argv this)]
          (reset! on-value-change* (:on-value-change props))
          (reset! on-expanded-change* (:on-expanded-change props))
          (reset! on-action* (:on-action props))
          (sync! props)))
      :component-will-unmount
      (fn [_this]
        (when-let [^js node @node*]
          (.removeEventListener node "valuechange" on-value-change)
          (.removeEventListener node "expandedchange" on-expanded-change)
          (.removeEventListener node "action" on-action))
        (reset! listening?* false))
      ;; The elements render only once their definitions are loaded, so the mount
      ;; hook is what starts the load: the first pass draws nothing, and the
      ;; state flip re-renders every mounted tree with the element in place.
      :reagent-render
      (fn [props]
        (when (or (elements-ready?) (= :ready @elements-state))
          (assoc-in (model/markup props) [1 :ref] #(reset! node* %))))})))

(defn tree
  "Renders one controlled tree.

   Parameters:
   - `props` — the tree:
     - `:value` — the selected row's `:value`, or nil when nothing is selected.
       The caller owns it and re-renders the value it accepts.
     - `:expanded` — the open branches' values, as a collection of row values.
       The caller owns it: a branch that is open is open because the caller says
       so, and `:on-expanded-change` reports what to render next.
     - `:current` — optional row the page is showing; it takes the tab stop
       first, and its ancestors expand. Pass it so a tree cannot hide the row the
       person is reading.
     - `:mode` — `:none`, `:single` (default) or `:multiple`.
     - `:expand-on-press?` — whether pressing a branch row opens or closes it, or
       whether a press means \"open this row\" and only the indicator (or the
       arrow keys) expands it.
     - `:on-value-change` — optional function of the row value a press, Enter or
       Space selected. Nothing is reported for the caller's own writes.
     - `:on-expanded-change` — optional function of the full collection of open
       branch values after an indicator press or a Left/Right key. Nothing is
       reported for the caller's own writes.
     - `:on-action` — optional function of the row value a press or Enter landed
       on, including the row that is already selected, which changes no value
       and so is never a `:on-value-change`.
     - `:attrs` — optional map merged onto the root (`:class`, `:data-*`).
     - `:children` — the caller's rows, built with this namespace's `item`,
       `label`, `indicator` and `group` helpers or with
       `ui.tree.model` directly. A control a row hosts (a row menu, a button)
       carries `data-row-action`, so pressing it does not also select the row.

   Returns: Reagent hiccup for the tree, or nil while its elements load. The
   caller owns every visual class and every label; nothing here renders text."
  [props]
  [tree-element props])

;; The markup helpers are re-exported here so a caller builds rows without
;; reaching into the model namespace, exactly as `switch` exposes its parts.

(defn item [props] (model/item props))
(defn label
  ([children] (model/label children))
  ([attrs children] (model/label attrs children)))
(defn indicator
  ([]
   (model/indicator))
  ([attrs]
   (model/indicator attrs))
  ([attrs children]
   (model/indicator attrs children)))
(defn group
  ([children] (model/group children))
  ([attrs children] (model/group attrs children)))
