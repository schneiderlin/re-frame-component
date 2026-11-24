# Re-Frame Component

Reusable Reagent UI primitives, Web UI Playbook, and legacy routing helpers for
re-frame2 apps. Applications own domain state, validation, resource effects,
copy and styling. This is an independent library, not an official day8 project.

## Dependencies

The library has no dependency on its original monorepo or local filesystem.
It directly depends on re-frame2 core and its Reagent adapter at the same
Git SHA. The adapter supplies Reagent 2.0.1. Unused machines and epoch
dependencies from the original umbrella module are not carried over.

The development baseline shared with the consuming apps is:

| Dependency | Version |
| --- | --- |
| Clojure | 1.12.3 |
| ClojureScript (development alias) | 1.12.42 |
| shadow-cljs (development alias) | 3.2.1 |
| re-frame2 core and Reagent adapter | `e1a72a31d1f05e56c99ac5a9f55697a14c884b83` |
| Reagent (from the adapter) | 2.0.1 |
| React / React DOM (application npm dependencies) | 19.2.4 |

The shared development server may use its own compiler versions; the table
describes the declared project dependencies, not that server's runtime.
Consumers must install React and React DOM themselves; tools.deps does not
install npm dependencies. The npm package here is private and only supports
local verification; this library is consumed through tools.deps.
The browser compile check also installs `process` 0.11.10 because shadow-cljs
resolves React 19's Node process references through that browser shim.

Add the following with a full published commit SHA (the SHA placeholder is
not a usable coordinate):

```clojure
com.zihao/re-frame-component
{:git/url "https://github.com/schneiderlin/re-frame-component.git"
 :git/sha "<full-published-commit-sha>"}
```

For local development, use
`com.zihao/re-frame-component {:local/root "../re-frame-component"}`.
Do not load the old component source path and this dependency together.

Applications may instead mount this repository as a Git submodule at their
existing component path and keep a `:local/root` dependency. Initialize it with
`git submodule update --init --recursive`; consumers should pin the same commit
whether they use a submodule or a tools.deps Git dependency.

## Web UI Playbook

The public interface exposes a shared Catalog and Stage for flat, independently
addressable Scenes. A Scene names a registered re-frame2 view and contains only
data-shaped args, initial events, scope, and metadata. Each selected Scene runs
inside a fresh re-frame2 frame that is destroyed on unmount, keeping product,
catalog, and Scene state separate.

Apps own fixtures, Scene declarations, and catalog aggregation. Modules declare
Scenes as data with `playbook-module-scenes`; the app assembles them with the
pure `playbook-catalog-scenes` and passes the result to the shell as `:scenes`
(a deref-able). There is no process-global catalog, so an app can add Scenes at
any time — including from a lazily loaded module — by updating that source.

```clojure
;; app-owned aggregation
(def once-scenes (r/atom (rfc/playbook-catalog-scenes
                          (navigation/scenes)
                          (release-card/scenes))))

;; embedded in the app's own shell
[rfc/playbook-catalog {:embedded? true :scenes once-scenes}]

;; or a standalone surface that recognizes #/playbook before product startup
(rfc/playbook-mount! dom-node {:scenes once-scenes})
```

Because the shell derefs `:scenes` inside its render fn, a Reaction or ratom
source re-renders the Catalog in place; the selected Scene is not remounted and
keeps its frame. The browser inspection bridge is available in either mode as
`globalThis.__reFrame2Playbook`, and reports the same source. The stylesheet is
served from `/re-frame-component/playbook.css` when this component's resources
are on the application classpath.

## IME-safe inputs

```clojure
(ns example.view
  (:require [com.zihao.re-frame-component.interface :as component]))

[component/ime-safe-input
 {:value search-text
  :placeholder "Search"
  :on-value (fn [text] (set-search-text! text))}]
```

`ime-safe-textarea` has the same contract. The wrapper removes native `:value`,
initializes with `:default-value`, and keeps composition text in the DOM.
Ordinary changes, composition end and blur call `:on-value` with the complete
current text. Notifications can repeat; callbacks should tolerate identical
values. External value changes are synchronized only outside composition.
Changes received during composition are not queued for application afterward;
the user-visible text is emitted when composition ends.

The wrapper owns `:ref`, `:on-change`, `:on-blur`, and composition start/end
handlers. It does not currently guard Enter/Escape or form submission during
composition; the host must handle those interaction semantics.

## Switch

```clojure
(ns example.view
  (:require [com.zihao.re-frame-component.interface :as component]))

[component/switch
 {:id "weekly-digest"
  :checked? digest?
  :on-change (fn [next] (save-digest! next))
  :attrs {:class "settings-switch"}
  :thumb-attrs {:class "settings-switch-thumb"}}]
```

A controlled boolean control for one setting. It owns the accessible behavior —
`switch` role, Space and click activation, focus, form participation — and
writes `data-checked` / `data-unchecked` (and `data-disabled`) on its two parts,
so the caller paints both states from attributes instead of re-deriving them. It
owns no styles, class names or copy. `:on-change` receives the next boolean;
return `false` to keep the current value while a save runs, then re-render the
value the save accepted. `switch-markup` exposes the same element tree without
mounting it, for tests.

The control's elements come from `@ui-sdk/web`, whose ES modules use syntax the
npm/Closure pipeline cannot parse. They are bundled once into
`resources/public/re-frame-component/ui-sdk/switch.js` by
`npm run re-frame-component:ui-sdk-assets` (root `package.json`) and loaded with
a module script the first time a switch renders, so a host only has to serve
this component's `resources/public` at `/re-frame-component`. Re-run that script
after changing the pinned `@ui-sdk/web` version and commit the asset.

## Segmented control

```clojure
(ns example.view
  (:require [com.zihao.re-frame-component.interface :as component]))

[component/segmented-control
 {:id "confidence"
  :value confidence                     ; 60, or nil when nothing is chosen
  :parse-value #(js/parseInt % 10)      ; item values arrive as strings
  :on-change (fn [next] (pick! next))
  :items [{:value 25 :label "不太确定"}
          {:value 60 :label "有些把握"}
          {:value 90 :label "很有把握"}]
  :attrs {:class "confidence-scale"}
  :item-attrs {:class "confidence-segment"}}]
```

One answer on a short scale, as a `radiogroup`: roving focus, Arrow/Home/End
navigation, press activation, form participation and the `data-checked` /
`data-unchecked` / `data-disabled` hooks on each item all come from ui-sdk's
`ui-segmented-control` / `ui-segmented-control-item` elements. The caller paints
both states from those attributes and owns the labels; this namespace owns no
styles, copy or state. `:on-change` receives the chosen item's value mapped back
through `:parse-value`; return `false` to keep the current value while a save
runs. `segmented-control-markup` exposes the same element tree without mounting
it, for tests.

The elements are bundled like the switch's, by
`npm run re-frame-component:ui-sdk-assets`, into
`resources/public/re-frame-component/ui-sdk/segmented-control.js`. Re-run that
script after changing the pinned `@ui-sdk/web` version and commit the asset.

## Tree

```clojure
(ns example.view
  (:require [com.zihao.re-frame-component.interface :as component]))

[component/tree
 {:mode :single
  :value selected-id                    ; the row the caller considers chosen
  :current selected-id                  ; the row the page shows; its ancestors open
  :expanded #{parent-id}                ; the caller owns which branches are open
  :expand-on-press? false               ; a press opens the row; the arrow folds it
  :on-value-change (fn [id] (open! id))
  :on-expanded-change (fn [ids] (remember-open! ids))
  :attrs {:class "file-tree"}
  :children (mapv (fn [row]
                    (component/tree-item
                     {:value (:id row)
                      :branch? (seq (:children row))
                      :label (:title row)
                      :attrs {:class "file-tree-row"}
                      :children (cond-> [(component/tree-label
                                          {:class "file-tree-label"}
                                          [(:title row)])]
                                  (seq (:children row))
                                  (conj (component/tree-indicator
                                         {:class "file-tree-toggle"}
                                         [chevron])
                                        (component/tree-group
                                         {:class "file-tree-children"}
                                         (child-rows row))))}))
                  rows)}]
```

A nested list a person opens, closes and selects from. ui-sdk's `ui-tree`
elements supply the `tree`/`treeitem` roles, the roving tab stop,
Arrow/Home/End and typeahead navigation, Enter/Space selection, per-branch
expansion, `current` opening its ancestors, and the `data-expanded` /
`data-selected` / `data-level` / `data-current` hooks each row paints from. A
row's label is a slot for the caller's own content, never a string the component
prints.

Selection and expansion are the caller's: `:value` and `:expanded` are written as
live properties on every render, and `:on-value-change` / `:on-expanded-change`
report only what a person changed. A control a row hosts (a row menu, a button)
carries `data-row-action`, so pressing it does not also select the row.
`tree-markup` exposes the element tree without mounting it, for tests.

The elements are bundled like the switch's, by
`npm run re-frame-component:ui-sdk-assets`, into
`resources/public/re-frame-component/ui-sdk/tree.js`. Re-run that script after
changing the pinned `@ui-sdk/web` version and commit the asset.

## Collapsible (disclosure)

```clojure
(ns example.view
  (:require [com.zihao.re-frame-component.interface :as component]))

[component/disclosure
 {:open? toolset-open?                       ; omit to let the element own it
  :on-open-change (fn [next] (save-open! next))
  :attrs {:class "context-section"}
  :button-attrs {:class "context-trigger"}
  :panel-attrs {:class "context-panel"}
  :trigger-children (list [:span "Toolset"]
                          (component/disclosure-chevron
                           {:class "context-toggle"}))
  :panel-children (list [:p "read_file"])}]
```

One panel a person opens and closes. ui-sdk's `ui-collapsible`,
`ui-collapsible-trigger` and `ui-collapsible-panel` supply the ARIA disclosure
pattern: Enter and Space on the trigger, focus returning to the trigger when a
closed panel had it, find in page, and `data-open` / `data-closed` /
`data-disabled` on every part. The trigger wraps **your** native button, whose
type is always `button`, so a disclosure inside a form never submits it. This
namespace owns no styles, copy or state.

`:open?` is written onto the element as live state, and `:on-open-change` reports
only what a person changed (a press, an arrow key, find in page) — never the
caller's own write. Return `false` from it to keep the current state while a save
runs. Omit `:open?` and the element owns the state, which is the right shape for
a row nobody else needs to know about.

A row whose trigger is only its chevron keeps everything else in
`:body-children`, which always shows between the trigger and the panel:

```clojure
[component/disclosure
 {:open? row-open?
  :trigger-children (list (component/disclosure-chevron {:class "row-toggle"}))
  :body-children (list [:div (summary-of row)] [:span (actions-for row)])
  :panel-children (list detail)}]
```

A closed panel stays in the page, hidden, unless you pass `:keep-mounted? false`,
so a panel keeps its scroll position and whatever is half-typed inside it.
`component/disclosure-chevron` is the one glyph every disclosure in an app should
use; paint it with a class whose rule rotates it from the trigger's `data-open`
hook, so the arrow cannot disagree with what is on screen.

The elements are bundled like the switch's, by
`npm run re-frame-component:ui-sdk-assets`, into
`resources/public/re-frame-component/ui-sdk/collapsible.js`. Re-run that script
after changing the pinned `@ui-sdk/web` version and commit the asset.

## Other public primitives

All exports retain the namespace `com.zihao.re-frame-component.interface`.

- `filter-select`: searchable choice UI with caller-owned options and selection.
- `optional-range-filter`: independently optional lower and upper bounds.
- `table-filter-builder`: controlled condition vectors, configurable operators
  and editors, local uncommitted drafts, and change metadata.
- `multi-step`: ordered progress with backward-only timeline navigation.
- `tag`, `tabs`, navbar and popup helpers: reusable interaction and semantic
  attributes without a shared visual theme.

See [design boundaries](docs/design.md) for ownership and routing constraints.
The custom hash router is retained for existing users only. New apps should
prefer re-frame2's native routing API.

## Verify

```sh
npm ci
clojure -M:test
npm run check:cljs
```

The JVM suite runs the pure Playbook, route, activation, multi-step, range and
table-filter model tests. The CLJS check compiles the complete public interface
and all its dependencies into an isolated output directory; it is not a browser
interaction test or an IME compatibility guarantee.

## License

MIT; see [LICENSE](LICENSE). The source was extracted as an audited file
snapshot with its original copyright notice, without monorepo Git history.
