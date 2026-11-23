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
