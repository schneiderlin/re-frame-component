(ns com.zihao.re-frame-component.ui.token-input
  "A token input whose text the element owns: an editor that holds tokens beside
   text.

   The behavior comes from ui-sdk's `ui-token-input` / `ui-token-input-editor` /
   `ui-token-input-token` elements and the `ui-trigger-menu` family they compose
   with — caret movement across tokens, Backspace and Delete semantics, undo and
   redo, input-method-safe submit, the `$`-style suggestion menu, its keyboard
   handling, and the anchored popup it opens in. Those elements ship as ES modules
   Closure cannot parse, so they are bundled once into a plain module asset
   (`re-frame-component/ui-sdk/token-input.js`) and loaded with a module script
   the first time a token input renders. Nothing here imports the npm package, and
   a host that serves this component's resources needs no build step of its own.

   The editor is uncontrolled on purpose. Re-frame2 drains a queued dispatch in a
   later macrotask, so a model copy of the text is always one turn behind what the
   reader sees; a binding that wrote such a copy back would fight the element for
   the caret. Instead the caller passes a seed (`:initial-value`, identified by
   `:value-key`) that is written once per key, edits stay inside the element, and
   the caller reads the element through the `:handle` it hands over — at submit
   and at a commit boundary, never on every keystroke.

   Callers see plain Clojure data and paint it themselves: a value is a vector of
   strings and token maps (`{:type \"file\" :value \"src/routes.ts\" :label \"routes.ts\"}`),
   and a suggestion source is a function of the query. That paint is data, not a
   component tree: this namespace writes it into the template's content as DOM, so
   an `on-*` handler has no reader and a component function cannot run. This
   namespace owns no styles, no copy and no state.

   The token template is filled here, not by the renderer. The elements build a
   token by cloning `template.content`; React appends children to the `<template>`
   element itself, where the browser never looks, so a template rendered the usual
   way clones to nothing and every chip paints blank. The markup renders the
   template empty and `fill-template!` installs `model/token-template` into the
   fragment the elements actually read."
  (:require
   [clojure.string :as str]
   [com.zihao.re-frame-component.ui.token-input.model :as model]
   [reagent.core :as r]))

(def module-url
  "URL of the bundled token input elements, relative to the root that serves this
   component's `resources/public`."
  "/re-frame-component/ui-sdk/token-input.js")

(defonce ^:private elements-state
  ;; :idle → :loading → :ready, or :error when the module never loaded.
  (r/atom :idle))

(defn- elements-ready?
  []
  (boolean (some-> js/window .-customElements (.get model/input-tag))))

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
               "re-frame-component: the shared token input module failed to load"
               error)))
      (.appendChild js/document.head script))))

;; The value is a vector of strings and token maps with keyword keys, mirroring the
;; caller's Clojure idiom; the element reads and writes plain JS arrays.

(defn- read-value
  "The element's value as Clojure data, with keyword keys.

   The caller's value is keyword-keyed, so the read side has to be too: a token
   whose `:value` arrived as the string key `\"value\"` would read as an empty
   token and disappear from the draft."
  [^js node]
  (try
    (js->clj (.-value node) :keywordize-keys true)
    (catch :default _ nil)))

(defn- write-value!
  [^js node value]
  (set! (.-value node) (clj->js value)))

(defn- js-field
  "The JS field name of one declarative trigger key (`:max-length` → `maxLength`)."
  [key]
  (let [[head & tail] (.split (name key) "-")]
    (apply str head (map (fn [part]
                           (if (seq part)
                             (str (.toUpperCase (subs part 0 1)) (subs part 1))
                             part))
                         tail))))

(defn- promise-of
  "Wraps one source call so the element always receives a Promise of JS items."
  [thunk]
  (try
    (.then (js/Promise.resolve (thunk))
           (fn [items] (clj->js (vec (or items [])))))
    (catch :default error
      (js/Promise.reject error))))

(defn- item-loader
  "The element's loader: `(query, {signal})` → Promise of items.

   The source is read through `sources*` on every call, so a caller may rebuild its
   options each render without the element holding a stale closure."
  [sources* trigger]
  (fn [query context]
    (promise-of (fn []
                  (when-let [source (get @sources* (:source trigger))]
                    (source query context))))))

(defn- trigger->js
  "One declarative trigger as the object the element reads.

   Callers declare a trigger as data (`{:char \"$\" :type \"skill\" :source :skill}`);
   the source key names an entry in `:sources` and never reaches the element."
  [sources* trigger]
  (let [obj #js {}]
    (doseq [[key value] (dissoc trigger :source)]
      (when (some? value)
        (aset obj (js-field key) value)))
    (aset obj "items" (item-loader sources* trigger))
    obj))

(defn- write-attributes!
  "Writes the options a custom element reads as attributes.

   A boolean attribute is presence-only, so `(setAttribute node \"disabled\" \"false\")`
   would read as true; the binding toggles it instead."
  [^js node {:keys [submit-shortcut disabled? read-only?]}]
  (when (some? submit-shortcut)
    (.setAttribute node "submit-shortcut" submit-shortcut))
  (.toggleAttribute node "disabled" (boolean disabled?))
  (.toggleAttribute node "read-only" (boolean read-only?)))

(defn- write-menu!
  "Pushes the trigger list onto the menu element, when the markup has one."
  [^js node props sources* triggers*]
  (when (and node (model/trigger-menu? props))
    (when-let [^js menu (.querySelector node "ui-trigger-menu")]
      (let [triggers (:triggers props)]
        (when (not= triggers @triggers*)
          (reset! triggers* triggers)
          (set! (.-triggers menu)
                (clj->js (mapv #(trigger->js sources* %) triggers))))))))

;; ---------------------------------------------------------------------------
;; The token template. The elements clone `template.content` for each token, and
;; only a browser parse fills that fragment — so the markup renders the template
;; empty and the binding writes the caller's token mark into it here. This is the
;; one place a token's paint becomes DOM; `model/token-template` stays data.

(defn- attribute-text
  "One attribute value as the text a DOM attribute holds.

   A sequential value (a caller's `:class` vector) is space-joined; keywords and
   symbols are written by name. Booleans and `nil` are handled by the caller.
   Anything else — a map, a function — has no attribute spelling and is skipped."
  [value]
  (cond
    (string? value) value
    (keyword? value) (name value)
    (symbol? value) (name value)
    (number? value) (str value)
    (sequential? value) (str/join " " (keep attribute-text value))
    :else nil))

(defn- write-attrs!
  "Writes one hiccup attribute map onto a DOM element.

   `:style` takes a map of property → value; every other key is an attribute name.
   A `true` value is presence-only, `false` drops the attribute, and values with
   no attribute spelling (see `attribute-text`) are ignored."
  [^js element attrs]
  (doseq [[key value] attrs]
    (let [attribute (name key)]
      (cond
        (and (= "style" attribute) (map? value))
        (doseq [[property style-value] value]
          (when (some? style-value)
            (.setProperty (.-style element) (name property) (str style-value))))

        (true? value) (.setAttribute element attribute "")
        (false? value) (.removeAttribute element attribute))
      (when-some [text (and (not (map? value)) (attribute-text value))]
        (.setAttribute element attribute text)))))

(defn- materialize!
  "Appends one data tree (strings, numbers and hiccup vectors) to a DOM parent."
  [^js parent node]
  (cond
    (nil? node) nil

    (or (string? node) (number? node))
    (.appendChild parent (.createTextNode js/document (str node)))

    (sequential? node)
    (let [[tag attrs children] (if (map? (second node))
                                 [(first node) (second node) (drop 2 node)]
                                 [(first node) {} (rest node)])
          element (.createElement js/document (name tag))]
      (write-attrs! element attrs)
      (doseq [child children] (materialize! element child))
      (.appendChild parent element))

    :else nil))

(defn- fill-template!
  "Installs the caller's token mark into the template's content, once.

   Idempotent: the content outlives every re-render of the markup, and a filled
   template is what already-rendered chips were cloned from. It runs before the
   seed, because a draft that arrives holding tokens renders them immediately."
  [^js node props]
  (when-let [^js template (.querySelector node ":scope > template")]
    (let [content (.-content template)]
      (when-not (.-firstElementChild content)
        (materialize! content (model/token-template props))))))

(defn- change-detail
  [^js dom-event]
  (let [^js detail (.-detail dom-event)]
    {:reason (some-> detail .-reason)
     :input-type (some-> detail .-inputType)
     :removed (js->clj (or (some-> detail .-removed) #js []) :keywordize-keys true)}))

(defn- event-value
  "The value a `valuechange` event carries, as Clojure data.

   The element reports the new value *before* it stores it, so while this listener
   runs the node's own `value` still holds the previous one — read from the node and
   every report is one edit behind. The detail is the only reading that is current."
  [^js dom-event]
  (let [value (some-> dom-event .-detail .-value)]
    (when (some? value)
      (try
        (js->clj value :keywordize-keys true)
        (catch :default _ nil)))))

(defn- report-change
  "Reports one edit to the caller.

   The element owns the text, so this is a notification, not a request: nothing
   here writes the value back. The value comes from the event (`event-value`), since
   the element has not stored it yet."
  [{:keys [node* handler*]} ^js dom-event]
  (when-let [^js node @node*]
    (when-let [handler @handler*]
      (handler (or (event-value dom-event) (read-value node))
               (change-detail dom-event)))))

(defn- set-composing!
  "Marks the window in which an input method is composing.

   The element deliberately keeps a composition out of its own value until the
   reader picks a candidate, so every value-derived attribute (the editor's
   `data-empty` among them) is behind the DOM for those few hundred milliseconds.
   Paint that has to follow what is on screen — a placeholder under the composing
   text, for one — needs this window, and only the caller can see it."
  [{:keys [node* composing?*]} composing?]
  (when-not (= composing? @composing?*)
    (reset! composing?* composing?)
    (when-let [^js node @node*]
      (.toggleAttribute node "data-composing" composing?))))

(defn- runtime
  "The per-instance runtime of one mounted token input.

   It lives on the React component instance, not in the render closure: the class
   below is created once, so a caller's re-render updates this instance instead of
   mounting a new one (which would drop the editor's caret, its undo history and
   any open menu)."
  [^js this]
  (or (aget this "tokenInputRuntime")
      (let [base {:node* (atom nil)
                  :handler* (atom nil)
                  :seed-key* (atom ::unset)
                  :blur-handler* (atom nil)
                  :paste-handler* (atom nil)
                  :sources* (atom nil)
                  :triggers* (atom ::unset)
                  :composing?* (atom false)
                  :listening?* (atom false)}
            runtime (assoc base
                           :on-valuechange (fn [dom-event] (report-change base dom-event))
                           :on-paste (fn [^js dom-event]
                                       (when-let [handler @(:paste-handler* base)]
                                         (handler dom-event)))
                           :on-compositionstart (fn [_dom-event]
                                                  (set-composing! base true))
                           :on-compositionend (fn [_dom-event]
                                                (set-composing! base false))
                           :on-focusout (fn [^js dom-event]
                                          (set-composing! base false)
                                          (when-let [handler @(:blur-handler* base)]
                                            (handler dom-event))))]
        (aset this "tokenInputRuntime" runtime)
        runtime)))

(defn- sync!
  "Pushes the seed, the template, the attributes, the triggers and the handle onto
   one element.

   The template's content goes first: a chip is cloned from it, so the mark has to
   be there before any value renders a token. The seed is written when
   `:value-key` changes — a Thread switch, a reset after sending, a host prefill.
   It is never written because the caller re-rendered: setting `value` is an
   undoable step that moves the caret to the end, so a model copy that is one turn
   behind must not be able to drag the text backwards."
  [{:keys [node* handler* seed-key* sources* triggers* listening?* blur-handler*
           paste-handler* on-valuechange on-paste on-compositionstart
           on-compositionend on-focusout]}
   props]
  (reset! handler* (:on-change props))
  (reset! blur-handler* (:on-blur props))
  (reset! paste-handler* (:on-paste props))
  (when-let [^js node @node*]
    (reset! sources* (:sources props))
    ;; The template a token clones must hold its mark before the value renders a
    ;; token: a restored draft writes the seed in this same pass.
    (fill-template! node props)
    (when (not= (:value-key props) @seed-key*)
      (reset! seed-key* (:value-key props))
      (write-value! node (:initial-value props)))
    (write-attributes! node props)
    (write-menu! node props sources* triggers*)
    (when-let [handle (:handle props)]
      (reset! handle {:element node :api (.-api node)}))
    (when-not @listening?*
      ;; All three listeners live on the root: `valuechange` does not bubble, a
      ;; paste from the editor bubbles up to here (the element takes only text and
      ;; tokens, so a clipboard image belongs to the caller), and `focusout` is the
      ;; commit boundary a caller can hang a snapshot on.
      (.addEventListener node "valuechange" on-valuechange)
      (.addEventListener node "paste" on-paste)
      (.addEventListener node "compositionstart" on-compositionstart)
      (.addEventListener node "compositionend" on-compositionend)
      (.addEventListener node "focusout" on-focusout)
      (reset! listening?* true))))

(defn- render-token-input
  "Renders the element tree, with the ref that gives the runtime its node."
  [props]
  (when (or (elements-ready?) (= :ready @elements-state))
    (let [{:keys [node*]} (runtime (r/current-component))]
      (assoc-in (model/markup props) [1 :ref] #(reset! node* %)))))

(def ^:private token-input-class
  ;; One class for every token input: the element owns the editing state, so a
  ;; remount would be a visible bug (the caret, the undo stack and any open menu).
  (r/create-class
   {:display-name "re-frame-component-token-input"
    :component-did-mount
    (fn [this]
      (let [[_ props] (r/argv this)]
        (load-elements!)
        (sync! (runtime this) props)))
    :component-did-update
    (fn [this _previous-argv]
      (let [[_ props] (r/argv this)]
        (sync! (runtime this) props)))
    :component-will-unmount
    (fn [this]
      (let [{:keys [node* listening?* on-valuechange on-paste on-compositionstart
                    on-compositionend on-focusout]} (runtime this)]
        (when-let [^js node @node*]
          (.removeEventListener node "valuechange" on-valuechange)
          (.removeEventListener node "paste" on-paste)
          (.removeEventListener node "compositionstart" on-compositionstart)
          (.removeEventListener node "compositionend" on-compositionend)
          (.removeEventListener node "focusout" on-focusout))
        (reset! listening?* false)))
    :reagent-render render-token-input}))

(defn token-input
  "Renders one token input whose value the caller seeds and reads.

   Parameters:
   - `props` — input attributes:
     - `:initial-value` — required; the value to start from: a vector of strings
       and token maps `{:type :value :label}` (`:id`, `:status`, `:data` are the
       element's). Written when the element mounts and whenever `:value-key`
       changes; never written for a plain re-render.
     - `:value-key` — required; the identity of that seed (a Thread id, a reset
       counter). A different key means \"this is a different draft\".
     - `:handle` — optional atom; the binding stores `{:element node :api api}` in
       it while mounted (and the element's `api` is the element's own controller:
       `getValue`, `setValue`, `getText`, `getLabel`, `clear`, `focus`, …). This is
       how a caller reads the text at submit, because the text lives here.
     - `:on-change` — optional function of `(value details)`, called after every
       edit, menu choice, undo and token removal, with the value the change
       produced (read from the event: the element stores it after reporting).
       `details` carries `:reason`
       (`\"input-change\"`, `\"remove-press\"`, `\"imperative\"`, …), `:input-type`
       and `:removed` (the tokens a change dropped).
     - `:on-paste` — optional function of one paste event, called from the root
       element. The element itself takes only text and tokens, so a caller that
       accepts clipboard images reads `clipboardData.files` here.
     - `:on-blur` — optional function of the `focusout` event, the commit boundary
       a caller can snapshot on.
     - `:triggers` — optional vector of declarative triggers for the suggestion
       menu: `{:char \"@\" :type \"file\" :source :mention}` plus the element's own
       options in kebab case (`:boundary`, `:max-length`, `:after`, `:insert`,
       `:filter`).
     - `:sources` — optional map of source key → `(fn [query context] ...)` returning
       the items for one trigger (`[{:value ... :label ... :keywords [...]}]`, or a
       Promise of them). A trigger is only mounted when its source exists.
     - `:submit-shortcut` — `\"enter\"` (the default) or `\"mod+enter\"`; the element
       submits the form it is in, so the caller owns the `<form>`.
     - `:disabled?`, `:read-only?` — optional booleans.
     - `:id` — optional root element id.
     - `:attrs`, `:editor-attrs`, `:token-attrs`, `:token-label-attrs`,
       `:token-remove-attrs`, `:remove-token-label`, `:menu-attrs`,
       `:menu-content-attrs`, `:menu-list-attrs`, `:menu-empty` — optional paint,
       as described on `model/markup`. Token paint is **data the binding writes as
       DOM** (`model/token-template` → the template's content), so it takes
       attributes, strings and element hiccup — not `on-*` handlers, and not
       component functions.

   Returns: Reagent hiccup for the token input, or nil while its elements load.
   The caller owns every visual class, every label and every placeholder."
  [props]
  [token-input-class props])
