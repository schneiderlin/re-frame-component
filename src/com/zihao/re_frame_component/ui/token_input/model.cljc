(ns com.zihao.re-frame-component.ui.token-input.model
  "The markup contract of one token input, without mounting it.

   A token input is a text editor that holds tokens (a file reference, a command,
   a skill) as one piece beside ordinary text. The behavior — caret movement
   across tokens, Backspace semantics, undo, input methods, the trigger menu that
   suggests tokens, and the anchored popup that holds it — belongs to the shared
   `@ui-sdk/web` elements. Everything those elements need to find their parts is
   expressed here as plain data, so the contract is provable on the JVM while the
   mounted wiring (properties, events, loading) stays in `ui.token-input`.")

(def input-tag
  "Tag name of the token input that holds the value (`ui-token-input`)."
  "ui-token-input")

(def editor-tag
  "Tag name of the editable text area inside it (`ui-token-input-editor`)."
  "ui-token-input-editor")

(def token-tag
  "Tag name of one token's markup (`ui-token-input-token`)."
  "ui-token-input-token")

(def token-remove-tag
  "Tag name of a token's remove part (`ui-token-input-token-remove`)."
  "ui-token-input-token-remove")

(def trigger-menu-tag
  "Tag name of the suggestion menu (`ui-trigger-menu`)."
  "ui-trigger-menu")

(def trigger-content-tag
  "Tag name of the suggestion popup (`ui-trigger-menu-content`)."
  "ui-trigger-menu-content")

(def trigger-list-tag
  "Tag name of the suggestion listbox (`ui-trigger-menu-list`)."
  "ui-trigger-menu-list")

(def trigger-empty-tag
  "Tag name of the \"nothing matches\" part (`ui-trigger-menu-empty`)."
  "ui-trigger-menu-empty")

(def template-attrs
  "Attributes of the `<template>` a token is cloned from.

   Empty on purpose: every visual hook lives on the token element the binding
   materializes into the template's content, never on the `<template>` itself."
  {})

(def ^:private driven-props
  "Caller props that are written onto the DOM node instead of rendered, plus the
   binding's own options."
  #{:id :initial-value :value-key :handle :triggers :sources :submit-shortcut
    :disabled? :read-only? :on-change :on-paste :on-blur
    :attrs :editor-attrs :token-attrs :token-label-attrs
    :token-remove-attrs :menu-attrs :menu-content-attrs :menu-list-attrs
    :menu-empty :remove-token-label}
  ;; The attribute spellings of the same options are dropped too: a rendered
  ;; `disabled="false"` attribute would read as true on the element.
  )

(def ^:private driven-attributes
  #{"disabled" "read-only" "submit-shortcut" "value" "triggers"})

(defn- passthrough
  [attrs]
  (reduce-kv (fn [attrs* key value]
               (if (or (contains? driven-props key)
                       (contains? driven-attributes (name key)))
                 attrs*
                 (assoc attrs* key value)))
             {}
             (or attrs {})))

(defn- element-attrs
  [{:keys [id attrs]}]
  (cond-> (passthrough attrs)
    id (assoc :id id)))

(defn- editor-attrs
  [{:keys [editor-attrs]}]
  (passthrough editor-attrs))

(defn- token-label-element
  [{:keys [token-label-attrs]}]
  ;; The element fills the first `data-token-label` descendant with the token's
  ;; label, so the caller can style it without rendering text of its own.
  [:span (assoc (passthrough token-label-attrs) :data-token-label "")])

(defn token-template
  "The markup of one token chip, as data the binding installs into the template.

   The elements build a token by cloning `template.content` and then fill its
   `[data-token-label]` descendant with the token's label. That fragment is the
   one place a `<template>`'s markup can live: React appends children to the
   `<template>` element itself, where the browser never looks, so a template
   React filled would clone to nothing and every chip would paint blank. The
   template is therefore rendered empty and the binding writes this tree into its
   content — see `ui.token-input` and `sdk-picker`, which materializes a row
   template the same way.

   Parameters:
   - `props` — the map `markup` takes; `:token-attrs`, `:token-label-attrs`,
     `:token-remove-attrs` and `:remove-token-label` are read.

   Returns: hiccup data for one token: the caller's paint as attributes, the
   label span the element fills, and the remove part. It is **data**, not a
   component tree — the binding writes it as DOM, where an `on-*` handler has no
   reader and a component function cannot run; a caller's mark (an icon's `svg`
   hiccup, say) is copied as elements."
  [{:keys [token-attrs token-label-attrs token-remove-attrs remove-token-label]}]
  [(keyword token-tag) (passthrough token-attrs)
   (token-label-element {:token-label-attrs token-label-attrs})
   [(keyword token-remove-tag)
    (passthrough token-remove-attrs)
    (when (seq remove-token-label)
      [:span {} remove-token-label])]])

(defn- template-element
  "The empty template the elements clone a token from.

   Empty on purpose: the binding installs `token-template` into its content, which
   is the fragment a clone reads. React cannot do that for us — it appends children
   to the `<template>` element, not to the template content the browser clones."
  []
  [:template template-attrs])

(defn- trigger-menu-element
  [{:keys [menu-attrs menu-content-attrs menu-list-attrs menu-empty]}]
  [(keyword trigger-menu-tag) (passthrough menu-attrs)
   (cond-> [(keyword trigger-content-tag) (passthrough menu-content-attrs)]
     ;; Rendering the empty part keeps the menu open while nothing matches; without
     ;; it the menu closes instead of showing a blank box.
     (some? (:text menu-empty))
     (conj [(keyword trigger-empty-tag) (passthrough (:attrs menu-empty))
            (:text menu-empty)])
     true
     (conj [(keyword trigger-list-tag) (passthrough menu-list-attrs)]))])

(defn trigger-menu?
  "Whether `props` describe a suggestion menu worth mounting.

   A trigger is only worth mounting when the caller has something to suggest:
   with no source the input is a plain token input, not a menu that can only ever
   show an empty list."
  [{:keys [triggers sources]}]
  (boolean
   (and (seq triggers)
        (some (fn [trigger] (contains? (or sources {}) (:source trigger)))
              triggers))))

(defn markup
  "The element tree of one token input.

   Parameters:
   - `props` — the same map `ui.token-input/token-input` takes:
     - `:id` — optional id of the root element; a caller's `<label for>` or
       `aria-describedby` points at it.
     - `:attrs` — optional map merged onto the root element (`:class`,
       `:data-*`, `aria-*`). Props the binding drives are dropped from it.
     - `:editor-attrs` — optional map merged onto the editor (`:placeholder`,
       `aria-label`, `:class`).
     - `:token-attrs`, `:token-label-attrs`, `:token-remove-attrs` — optional maps
       painted on each token's parts; they travel through `token-template`, which
       the binding writes into the template's content.
     - `:remove-token-label` — optional data markup for the remove part (usually an
       icon's `svg` hiccup); the element hides it from assistive technology.
     - `:menu-attrs`, `:menu-content-attrs`, `:menu-list-attrs` — optional maps
       for the suggestion menu, its popup and its listbox.
     - `:menu-empty` — optional `{:text ... :attrs ...}`; when absent no empty
       part is rendered and the menu closes instead of showing a blank list.
     - `:initial-value`, `:value-key`, `:handle`, `:triggers`, `:sources`,
       `:submit-shortcut`, `:disabled?`, `:read-only?`, `:on-change`, `:on-paste`,
       `:on-blur` — never rendered; the binding writes them onto the DOM node,
       because a custom element reads a property for a value and an attribute
       string `\"false\"` would read as true.

   Returns: hiccup `[ui-token-input ...]` holding the editor, the token
   `<template>` (empty: see `token-template`), and — only when `trigger-menu?` —
   the suggestion menu."
  [props]
  (cond-> [(keyword input-tag) (element-attrs props)
           [(keyword editor-tag) (editor-attrs props)]
           (template-element)]
    (trigger-menu? props)
    (conj (trigger-menu-element props))))
