(ns com.zihao.re-frame-component.ui.tree.interface
  "Public API for the controlled tree: nested rows that expand, collapse and
  select, with the keyboard and `tree`/`treeitem` semantics supplied by the
  shared ui-sdk elements."
  (:require
   [com.zihao.re-frame-component.ui.tree :as tree]
   [com.zihao.re-frame-component.ui.tree.model :as model]))

(defn tree
  "Renders one controlled tree.

  Parameters:
  - `props` — the tree:
    - `:value` — the selected row's `:value`, or nil when nothing is selected.
    - `:expanded` — the open branches' values; the caller owns which are open.
    - `:current` — optional row the page is showing; it takes the tab stop first
      and its ancestors expand, so a tree cannot hide the row being read.
    - `:mode` — `:none`, `:single` (default) or `:multiple`.
    - `:expand-on-press?` — whether pressing a branch row opens or closes it, or
      whether a press means \"open this row\" and only the indicator expands it.
    - `:on-value-change` — optional function of the value a press, Enter or Space
      selected.
    - `:on-expanded-change` — optional function of the full collection of open
      branch values after a toggle.
    - `:on-action` — optional function of the row value a press or Enter landed
      on, including a row that is already selected (which changes no value).
    - `:attrs` — optional map merged onto the root.
    - `:children` — rows built with `item` / `label` / `indicator` / `group`.

  Returns: Reagent hiccup whose rows carry `data-expanded` / `data-selected` /
  `data-level` / `data-current` once mounted, so a caller's CSS paints every
  state. Nothing here renders text or styles."
  [props]
  [tree/tree props])

(defn item
  "One row, wrapping the caller's own content; see `ui.tree.model/item`."
  [props]
  (tree/item props))

(defn label
  "A row's content part; see `ui.tree.model/label`."
  ([children] (tree/label children))
  ([attrs children] (tree/label attrs children)))

(defn indicator
  "A branch's expand/collapse control; see `ui.tree.model/indicator`."
  ([]
   (tree/indicator))
  ([attrs]
   (tree/indicator attrs))
  ([attrs children]
   (tree/indicator attrs children)))

(defn group
  "The container a branch's children nest in; see `ui.tree.model/group`."
  ([children] (tree/group children))
  ([attrs children] (tree/group attrs children)))

(defn markup
  "The element tree of one tree root, without mounting it.

  Parameters:
  - `props` — `{:id ... :mode ... :current ... :expand-on-press? ... :children
    [...]}`.

  Returns: hiccup `[root attrs row...]`; the root tag is `\"ui-tree\"`."
  [props]
  (model/markup props))

(def root-tag
  "Tag name of the tree root element (`\"ui-tree\"`)."
  model/root-tag)

(def item-tag
  "Tag name of one tree row (`\"ui-tree-item\"`)."
  model/item-tag)

(def label-tag
  "Tag name of a row's content part (`\"ui-tree-item-label\"`)."
  model/label-tag)

(def indicator-tag
  "Tag name of a branch's toggle (`\"ui-tree-item-indicator\"`)."
  model/indicator-tag)

(def group-tag
  "Tag name of a branch's children container (`\"ui-tree-group\"`)."
  model/group-tag)
