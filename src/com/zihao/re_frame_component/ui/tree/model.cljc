(ns com.zihao.re-frame-component.ui.tree.model
  "The markup contract of one tree, without mounting it.

   ui-sdk's tree is five elements that find each other by nesting: a root that
   owns the collection, one item per row, a label and an optional indicator part
   inside an item, and a group inside an item that makes it a branch. Everything
   the elements need in order to agree is plain data here, so the contract is
   provable on the JVM while the mounted behavior — roving focus, Arrow/Home/End
   navigation, typeahead, expansion, selection — stays in `ui.tree`.

   The caller owns every label, class and piece of copy. Nothing here renders
   text or styles of its own, and a row's content is always the caller's: a row
   here is a slot for real UI, never a string the element printed."
  (:require [clojure.string :as str]))

(def root-tag
  "Tag name of the tree root (`ui-tree`)."
  "ui-tree")

(def item-tag
  "Tag name of one row (`ui-tree-item`)."
  "ui-tree-item")

(def label-tag
  "Tag name of a row's content part (`ui-tree-item-label`)."
  "ui-tree-item-label")

(def indicator-tag
  "Tag name of a branch's expand/collapse control (`ui-tree-item-indicator`)."
  "ui-tree-item-indicator")

(def group-tag
  "Tag name of the container a branch's children nest in (`ui-tree-group`)."
  "ui-tree-group")

(def default-mode
  "How many rows can be selected at once. A list of destinations selects one."
  :single)

(def ^:private driver-keys
  "Props the component keeps to itself or writes as live state on the root,
   never rendered as ordinary attributes."
  [:value :expanded :on-value-change :on-expanded-change :attrs :children])

(def ^:private item-driver-keys
  "Props of one row that stay in Clojure data: the label content is the row's
   child, and the row's own attributes are written by this namespace."
  [:branch? :disabled? :label :attrs :children])

(defn value-attribute
  "The string a row's `:value` becomes.

   The elements key both the collection and the selection by a string, so a
   caller that keeps keywords or numbers in its own data converts on the way in
   and out instead of comparing stringified ids at the call site."
  [value]
  (str value))

(defn- flag-attribute
  "A boolean the element reads from an attribute.

   ui-sdk parses every boolean attribute except `disabled`/`required` as a value,
   not as a presence flag, so the string `\"false\"` is the only way to say false
   for an option whose default is true."
  [value]
  (str (boolean value)))

(defn- root-attrs
  [{:keys [id mode current expand-on-press? attrs]}]
  (let [base (apply dissoc (merge (when (some? id) {:id id}) (or attrs {}))
                    driver-keys)]
    (cond-> base
      (some? mode) (assoc :mode (name mode))
      (some? current) (assoc :current (value-attribute current))
      (some? expand-on-press?)
      (assoc :expand-on-press (flag-attribute expand-on-press?)))))

(defn markup
  "The element tree of one tree root.

   Parameters:
   - `props` — the tree:
     - `:id` — optional element id, for a caller's label or a test selector.
     - `:mode` — `:none`, `:single` (default) or `:multiple`; how many rows can
       be selected at once.
     - `:current` — optional value of the row the page is showing. It takes the
       tab stop first, and its ancestors expand.
     - `:expand-on-press?` — whether pressing a branch row expands it; pass
       false when a press means \"open this row\" instead.
     - `:attrs` — optional map merged onto the root (`:class`, `:data-*`).
     - `:value`, `:expanded`, `:on-value-change`, `:on-expanded-change` — driver
       props, never rendered: the component writes them as live state, because a
       custom element reads a value from a property and an attribute string
       would read as true when it says `\"false\"`.
     - `:children` — the caller's rows (see `item`), in order.

   Returns: hiccup `[root attrs row...]`, free of the controlled selection and
   expansion by design."
  [{:keys [children] :as props}]
  (into [(keyword root-tag) (root-attrs props)]
        (or children [])))

(defn item
  "One row, wrapping the caller's own content.

   Parameters:
   - `props` — the row:
     - `:value` — required; the row's id in the tree's selection and expansion.
     - `:branch?` — whether the row has children. A row whose `:children`
       include a `group` is a branch anyway; pass it when the group is rendered
       later, so the indicator and the keyboard agree before it exists.
     - `:label` — optional plain text the element matches for typeahead, for a
       row whose visible content is not one string.
     - `:disabled?` — optional; keeps the row from being selected or expanded.
     - `:attrs` — optional map merged onto the row (`:class`, `:data-*`). Do not
       set `role`, `tabindex` or `aria-*` here: the element owns the tree
       semantics of its rows.
     - `:children` — the row's parts: at least a `label`; for a branch, an
       `indicator` and a `group`.

   Returns: hiccup `[row attrs ...children]`."
  [{:keys [value branch? disabled? label attrs children]}]
  (into [(keyword item-tag)
         (cond-> (assoc (apply dissoc (or attrs {}) item-driver-keys)
                        :value (value-attribute value))
           branch? (assoc :branch "")
           disabled? (assoc :disabled "")
           (not (str/blank? (str label))) (assoc :label (str label)))]
        (or children [])))

(defn label
  "A row's content part: everything the caller paints inside the row.

   Parameters:
   - `attrs` — optional map merged onto the part (`:class`, `:data-*`).
   - `children` — the row's content, in order.

   Returns: hiccup `[label attrs ...children]`."
  ([children] (label nil children))
  ([attrs children]
   (into [(keyword label-tag) (or attrs {})] (or children []))))

(defn indicator
  "A branch's expand/collapse control.

   The element owns the press, the `data-expanded` hook and the words a person
   hears; the caller owns the glyph and its paint.

   Parameters:
   - `attrs` — optional map merged onto the part (`:class`, `:data-*`).
   - `children` — the caller's glyph, usually one chevron icon.

   Returns: hiccup `[indicator attrs ...children]`."
  ([]
   (indicator nil nil))
  ([attrs]
   (indicator attrs nil))
  ([attrs children]
   (into [(keyword indicator-tag) (or attrs {})] (or children []))))

(defn group
  "The container a branch's children nest in.

   The element hides it while the branch is collapsed and owns that state; the
   caller owns how deep it paints.

   Parameters:
   - `attrs` — optional map merged onto the group (`:class`, `:data-*`).
   - `children` — the branch's rows, in order.

   Returns: hiccup `[group attrs ...rows]`."
  ([children] (group nil children))
  ([attrs children]
   (into [(keyword group-tag) (or attrs {})] (or children []))))
