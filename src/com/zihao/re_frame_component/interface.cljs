(ns com.zihao.re-frame-component.interface
  "Public API for the re-frame2 UI foundation: Playbook scenes, hash routes, and shell mounting,
  the pure route model, the route event/subscription bridges, the shared UI components, and the
  parameterized hash router."
  (:require
   [com.zihao.re-frame-component.playbook.model :as playbook-model]
   [com.zihao.re-frame-component.playbook.route :as playbook-route]
   [com.zihao.re-frame-component.playbook.shell :as playbook-shell]
   [com.zihao.re-frame-component.router.activation :as router-activation]
   [com.zihao.re-frame-component.router.event :as router-event]
   [com.zihao.re-frame-component.router.model :as router-model]
   [com.zihao.re-frame-component.router.sub :as router-sub]
   [com.zihao.re-frame-component.ui.disclosure.interface :as disclosure]
   [com.zihao.re-frame-component.ui.filter-select.interface :as filter-select]
   [com.zihao.re-frame-component.ui.anchor.interface :as anchor]
   [com.zihao.re-frame-component.ui.ime-safe.interface :as ime-safe]
   [com.zihao.re-frame-component.ui.landing.interface :as landing]
   [com.zihao.re-frame-component.ui.multi-step.interface :as multi-step]
   [com.zihao.re-frame-component.ui.navbar.interface :as navbar]
   [com.zihao.re-frame-component.ui.optional-range.interface :as optional-range]
   [com.zihao.re-frame-component.ui.popup.interface :as popup]
   [com.zihao.re-frame-component.ui.sdk-picker :as sdk-picker]
   [com.zihao.re-frame-component.ui.segmented-control.interface :as segmented-control]
   [com.zihao.re-frame-component.ui.switch.interface :as switch]
   [com.zihao.re-frame-component.ui.table-filter.interface :as table-filter]
   [com.zihao.re-frame-component.ui.thread-ref.interface :as thread-ref]
   [com.zihao.re-frame-component.ui.token-input.interface :as token-input]
   [com.zihao.re-frame-component.ui.tabs.interface :as tabs]
   [com.zihao.re-frame-component.ui.tag.interface :as tag]
   [com.zihao.re-frame-component.ui.tree.interface :as tree]))

(defn playbook-scene-id
  "Builds the conventional stable scene id of one module state.

  Parameters:
  - `app-ns` — app namespace segment, keyword or string, e.g. `:knowledge-base`.
  - `module-id` — module segment, keyword or string, e.g. `:deck-list`.
  - `state-id` — state segment, keyword or string, e.g. `:empty`.

  Returns: keyword of the form `<app-ns>.ui.<module-id>/<state-id>` with `_` replaced by `-` and
  illegal characters replaced by `-`.

  Throws `ex-info` when any segment normalizes to blank."
  [app-ns module-id state-id]
  (playbook-model/scene-id app-ns module-id state-id))

(defn playbook-normalize-scene
  "Validates one Scene declaration and fills its optional keys.

  Parameters:
  - `scene` — Scene declaration map:
    - `:id` — required; keyword scene id.
    - `:component` — required; registered view id (a keyword) rendering the Scene.
    - `:title` — optional string or localized string map; defaults to a humanized `:id`.
    - `:args` — optional props map passed to the view; defaults to `{}`.
    - `:initial-events` — optional event vectors dispatched when the Scene frame is created;
      defaults to `[]`.
    - `:tags` — optional tag collection; defaults to `#{}`.
    - `:scope` — optional `:element`, `:component`, or `:page`; defaults to `:component`.
    - `:doc` — optional prose description used by Catalog search.

  Returns: the Scene with defaults applied.

  Throws `ex-info` when `:id` or `:component` is not a keyword, when the declaration contains
  functions, or when `:scope` is not one of the three accepted values."
  [scene]
  (playbook-model/normalize-scene scene))

(defn playbook-normalize-tool
  "Validates one host-supplied Catalog tool destination.

  Parameters:
  - `tool` — tool declaration map:
    - `:id` — required; keyword tool id.
    - `:title` — required; string or localized string map (keyword locale -> string).
    - `:component` — required; registered view id (a keyword) rendering the tool.
    - `:args` — optional props map passed to the view; defaults to `{}`.

  Returns: the tool with `:args` defaulted.

  Throws `ex-info` when `:id`/`:component` is not a keyword, when `:title` is neither a string nor
  a localized string map, or when the declaration contains functions."
  [tool]
  (playbook-model/normalize-tool tool))

(defn playbook-module-scenes
  "Expands one module declaration into flat, independently addressable Scenes.

  Parameters:
  - `module` — module declaration map:
    - `:app-ns` — app namespace segment used by `playbook-scene-id`.
    - `:module-id` — module segment used by `playbook-scene-id`.
    - `:component` — registered view id every Scene of the module renders.
    - `:title` — optional module title; each Scene title becomes `<module title> · <state label>`.
    - `:tags` — optional tags applied to every Scene.
    - `:scope` — optional scope applied to every Scene.
    - `:states` — sequence of `[state-id args]` or `[state-id args scene-options]` entries, where
      `scene-options` overrides any generated Scene key.

  Returns: vector of normalized Scene maps, one per state, in declaration order."
  [module]
  (playbook-model/module-scenes module))

(defn playbook-catalog-scenes
  "Assembles Scene declarations from one or more modules into a stable Catalog.

  Parameters:
  - `module-scenes` — the vararg list (zero or more) of module Scene vectors, forwarded as-is (see
    `playbook-module-scenes`).

  Returns: duplicate-free vector of normalized Scenes ordered by scene id; a later declaration of
  the same `:id` wins."
  [& module-scenes]
  (apply playbook-model/catalog-scenes module-scenes))

(defn playbook-catalog-tools
  "Assembles tool destinations into a stable Catalog.

  Parameters:
  - `tools` — sequence of tool declarations (see `playbook-normalize-tool`).

  Returns: duplicate-free vector of normalized tools ordered by tool id; a later declaration of the
  same `:id` wins.

  Throws `ex-info` for an invalid declaration, as described on `playbook-normalize-tool`."
  [tools]
  (playbook-model/catalog-tools tools))

(defn playbook-find-scene
  "Looks up one Scene in a Catalog.

  Parameters:
  - `scenes` — Catalog Scene vector.
  - `scene-id` — keyword scene id to find.

  Returns: the Scene map with that `:id`, or nil."
  [scenes scene-id]
  (playbook-model/find-scene scenes scene-id))

(defn playbook-find-tool
  "Looks up one tool destination in a Catalog.

  Parameters:
  - `tools` — Catalog tool vector.
  - `tool-id` — keyword tool id to find.

  Returns: the tool map with that `:id`, or nil."
  [tools tool-id]
  (playbook-model/find-tool tools tool-id))

(defn playbook-filter-scenes
  "Filters a Catalog by free text, scope, and tag.

  Parameters:
  - `scenes` — Catalog Scene vector.
  - `filters` — filter criteria:
    - `:query` — optional case-insensitive text matched against scene id, title, doc, and tags;
      blank or absent matches everything.
    - `:scope` — optional `:element`, `:component`, or `:page`; nil matches every scope.
    - `:tag` — optional tag the Scene must carry; nil matches every Scene.

  Returns: vector of the matching Scenes in input order."
  [scenes filters]
  (playbook-model/filter-scenes scenes filters))

(defn playbook-hash?
  "Tests whether a location hash addresses the Web Playbook.

  Parameters:
  - `hash` — location hash such as `\"#/playbook?scene=...\"`; nil is treated as empty.

  Returns: true for `#/playbook` and any `#/playbook/...` or `#/playbook?...` location, false
  otherwise."
  [hash]
  (playbook-route/playbook-hash? hash))

(defn playbook-match-hash
  "Parses a Playbook location hash into a Playbook route.

  Parameters:
  - `hash` — location hash to parse.

  Returns: route map `{:surface :playbook :path <path> :scene-id <keyword-or-nil>}` plus
  `:tool-id` when the hash carries a `tool` query parameter, which also clears `:scene-id`; nil when
  the hash is not a Playbook location."
  [hash]
  (playbook-route/match-hash hash))

(defn playbook-href
  "Builds the Playbook location hash.

  Parameters:
  - `scene-id` — optional scene id; when present it is URL-encoded into `?scene=`.

  Returns: `\"#/playbook\"`, or `\"#/playbook?scene=<scene-id>\"`."
  ([]
   (playbook-route/href))
  ([scene-id]
   (playbook-route/href scene-id)))

(defn playbook-tool-href
  "Builds the Playbook location hash for a Catalog tool destination.

  Parameters:
  - `tool-id` — tool id, keyword or string; keywords lose their leading `:`.

  Returns: `\"#/playbook?tool=<tool-id>\"`, or the bare `\"#/playbook\"` when `tool-id` is nil."
  [tool-id]
  (playbook-route/tool-href tool-id))

(defn playbook-current-hash
  "Returns the current browser location hash.

  Returns: `window.location.hash`, or the empty string when the location has no hash."
  []
  (playbook-shell/current-hash))

(defn playbook-catalog
  "Builds the Web Playbook shell component: Catalog, toolbar, and isolated Scene stage.

  Parameters:
  - `catalog-options` — shell options:
    - `:embedded?` — render the shell without its own page chrome when true.
    - `:scenes` — optional deref-able (atom or reaction) of Scene declarations; defaults to an
      empty source, and the shell re-reads it on every render.
    - `:tools` — optional deref-able of tool declarations; defaults to an empty source.

  Returns: a Reagent component-class value to mount, not a rendered element."
  ([] (playbook-catalog {}))
  ([catalog-options]
   (playbook-shell/catalog-shell catalog-options)))

(defn playbook-mount!
  "Mounts the Playbook shell as the whole surface at `dom-node`.

  Parameters:
  - `dom-node` — DOM element the Playbook renders into.
  - `mount-options` — optional host-owned deref-ables: `:scenes`, `:tools`, and `:embedded?` (see
    `playbook-catalog`).

  Returns: the Reagent root used for the mount; later calls reuse the root created by the first
  mount."
  ([dom-node]
   (playbook-shell/mount! dom-node))
  ([dom-node mount-options]
   (playbook-shell/mount! dom-node mount-options)))

(defn playbook-unmount!
  "Unmounts the Playbook root mounted by `playbook-mount!` and forgets it.

  Returns: nil; the Playbook can be mounted again afterwards."
  []
  (playbook-shell/unmount!))

(defn popup-frame
  "Renders a headless modal overlay and dialog panel around `content`.

  Pass `:on-dismiss` to close the popup on Escape.

  Parameters:
  - `content` — one Hiccup node or a sequence of nodes rendered inside the dialog panel.
  - `options` — trailing keyword options (the vararg part of the call):
    - `:overlay-attrs` — optional attribute map merged over the overlay defaults.
    - `:panel-attrs` — optional attribute map merged over the dialog panel defaults
      (`:role \"dialog\"`, `:aria-modal \"true\"`, `data-*` markers).
    - `:panel-tag` — optional tag for the dialog panel; defaults to `:section`.
    - `:on-dismiss` — optional dismissal action: a re-frame dispatch vector, a sequence of dispatch
      vectors, or a DOM handler function. When present a document-level Escape listener calls it.

  Returns: Hiccup vector rendering the overlay and panel."
  [content & {:keys [overlay-attrs panel-attrs panel-tag on-dismiss]}]
  [popup/popup-frame
   content
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag
   :on-dismiss on-dismiss])

(defn popup
  "Renders a popup frame with optional cancel and confirm actions.

  Actions may be handlers, re-frame event vectors, or sequences of event
  vectors. Cancelling dismisses the popup on Escape; pass `:on-dismiss` when
  dismissal differs from cancelling. Caller attributes style the overlay, panel,
  footer, and buttons.

  Parameters:
  - `content` — one Hiccup node or a sequence of nodes rendered inside the dialog panel.
  - `options` — trailing keyword options (the vararg part of the call):
    - `:on-cancel` — optional cancel action (handler, dispatch vector, or sequence of dispatch
      vectors); also used as the Escape dismissal action when `:on-dismiss` is absent.
    - `:on-dismiss` — optional Escape dismissal action, overriding `:on-cancel` for Escape.
    - `:on-confirm` — optional confirm action.
    - `:cancel-label` — optional cancel button label; defaults to `\"Cancel\"`.
    - `:confirm-label` — optional confirm button label; defaults to `\"Confirm\"`.
    - `:overlay-attrs`, `:panel-attrs`, `:panel-tag` — forwarded to `popup-frame`.
    - `:footer-attrs` — optional attribute map merged onto the footer.
    - `:cancel-attrs`, `:confirm-attrs` — optional attribute maps merged onto the buttons; a
      supplied `:on-click` wins over the generated action handler.

  Returns: Hiccup vector rendering the popup frame with a footer of actions; the footer is omitted
  when neither `:on-cancel` nor `:on-confirm` is given. An action that is none of handler, dispatch
  vector, or sequence of dispatch vectors throws `ex-info` when the button is clicked."
  [content & {:keys [on-cancel
                     on-dismiss
                     on-confirm
                     cancel-label
                     confirm-label
                     overlay-attrs
                     panel-attrs
                     panel-tag
                     footer-attrs
                     cancel-attrs
                     confirm-attrs]
              :or {cancel-label "Cancel"
                   confirm-label "Confirm"}}]
  [popup/popup
   content
   :on-cancel on-cancel
   :on-dismiss on-dismiss
   :on-confirm on-confirm
   :cancel-label cancel-label
   :confirm-label confirm-label
   :overlay-attrs overlay-attrs
   :panel-attrs panel-attrs
   :panel-tag panel-tag
   :footer-attrs footer-attrs
   :cancel-attrs cancel-attrs
   :confirm-attrs confirm-attrs])

(defn anchor-position!
  "Places a floating element beside an anchor and keeps it there.

  This is an imperative DOM binding, not a component: call it from a `:ref` when
  the element mounts and call the returned cleanup when the ref goes back to
  `nil`. The element flips to the other side of the anchor when there is no
  room and stays inside the viewport, and it receives `data-side`, `data-align`,
  `--available-width`, `--available-height`, and `--transform-origin` so paint
  can follow the resolved placement.

  Parameters:
  - `anchor-element` — the element to anchor against, or a function of no
    arguments returning one, read on every check.
  - `element` — the floating element.
  - `options` — placement options, or a function of no arguments returning them:
    - `:side` — `\"top\"`, `\"right\"`, `\"bottom\"`, `\"left\"`.
    - `:align` — `\"start\"`, `\"center\"`, `\"end\"`.
    - `:sideOffset` — gap from the anchor, in px.
    - `:collisionPadding` — space kept from the viewport edges, in px.
    - `:arrow`, `:arrowPadding` — optional arrow element and its inset.

  Returns: a handle map:
  - `:stop` — call it when the element unmounts.
  - `:place` — recompute now, after the anchor element itself changed."
  [anchor-element element options]
  (anchor/position! anchor-element element options))

(defn anchor-bind-layer!
  "Registers a floating element in the page's dismissal stack.

  Escape and outside presses then walk the stack top-down and report the layer
  they dismiss; the caller still owns whether it closes. This replaces the
  per-element document listeners a floating UI would otherwise install.

  Parameters:
  - `element` — the floating element.
  - `options` — layer options:
    - `:onDismiss` — function of the reason string, called when the layer is
      asked to close.
    - `:contains` — function of a DOM node that counts extra nodes as inside.
    - `:modal` — an outside press dismisses without reaching the page beneath.
    - `:topLayer` — join the browser top layer where supported.
    - `:closeOnBlur` — dismiss when the window loses focus.

  Returns: a handle map with `:stop`, to call when the element unmounts."
  [element options]
  (anchor/bind-layer! element options))

(def landed-attribute
  "The attribute a landed element carries: `data-landed`.

  Paint it, never read it as state: it is a DOM fact about where a jump brought
  the reader, not app state. Exactly one element carries it; it moves to the next
  landing and dies with its element."
  landing/landed-attribute)

(defn land!
  "Brings a target into view, focuses it, flashes it, and marks it as landed.

  This is an imperative DOM behavior, not a component: the caller keeps the
  address (which row, which annotation, whether the target can be found yet) and
  calls this once it holds the element.

  In order: the previously landed element loses its mark, the target scrolls to
  the middle of its container, gets `tabindex=\"-1\"` when it has no tabindex and
  takes focus without a second scroll, plays a fading ring (skipped under
  `prefers-reduced-motion: reduce`), and carries `data-landed`.

  The mark is a fact, not a timer: scrolling and pressing do not clear it. It
  moves to the next landing and disappears with the element, so the flash can be
  a plain DOM animation rather than a timer racing the paint.

  Parameters:
  - `element` — the target element, already found. A detached element is not a
    landing and is reported as `false`.
  - `options` — optional:
    - `:behavior` — `:auto` (default, instant) or `:smooth`.
    - `:block` — vertical alignment; `:center` by default.
    - `:flash?` — `true` by default; `false` re-centres and re-focuses while the
      layout settles, without a second flash.

  Returns: `true` when the element was connected and landed."
  ([element]
   (landing/land! element))
  ([element options]
   (landing/land! element options)))

(defn ime-safe-input
  "Renders an input that survives IME composition.

  Parameters:
  - `input-attributes` — field attributes:
    - `:value` — controlled text value; pushed onto the DOM node when it changes outside a
      composition.
    - `:on-value` — optional function of the complete text string, called on change outside
      composition, on composition end, and on blur.
    - `:on-blur` — optional DOM event handler called after `:on-value` on blur.
    - `:on-key-down` — optional DOM event handler; suppressed while composing.
    - any other key — forwarded as an input attribute.

  Returns: Hiccup vector rendering the input."
  [input-attributes]
  (ime-safe/input input-attributes))

(defn ime-safe-textarea
  "Renders a textarea that survives IME composition.

  Parameters:
  - `textarea-attributes` — field attributes with the same `:value`, `:on-value`, `:on-blur`, and
    `:on-key-down` contract as `ime-safe-input`; any other key is forwarded as a textarea
    attribute.

  Returns: Hiccup vector rendering the textarea."
  [textarea-attributes]
  (ime-safe/textarea textarea-attributes))

(defn input-event-composing?
  "True while a keyboard event belongs to an IME composition.

  Parameters:
  - `dom-event` — DOM keyboard/input event, or a Reagent event wrapper carrying it in
    `:nativeEvent`. Read for `isComposing`, `inputType` `\"insertCompositionText\"`, and the legacy
    `keyCode`/`which` 229 that older Chromium and Safari send while composing.

  Returns: true when the event belongs to a composition, false otherwise."
  [dom-event]
  (ime-safe/input-event-composing? dom-event))

(defn switch
  "Renders one controlled switch for a single boolean setting.

  Parameters:
  - `props` — field attributes:
    - `:id` — required element id; a caller's `<label for>` or description
      `aria-describedby` points at it.
    - `:checked?` — whether the switch is on.
    - `:disabled?` — optional; blocks focus, presses and form submission.
    - `:on-change` — optional function of the next boolean. Return `false` to keep
      the current value while a save runs; the change is cancelled and the caller
      re-renders the value it accepted.
    - `:attrs` — optional map merged onto the track element (`:class`,
      `:data-action`, `aria-*`).
    - `:thumb-attrs` — optional map merged onto the thumb element.

  Returns: Hiccup vector for the switch. The caller owns the styles, the label and
  the copy; the mounted track carries `data-checked` / `data-unchecked` (and
  `data-disabled` while disabled) for the caller's CSS."
  [props]
  [switch/switch props])

(defn switch-markup
  "Returns the element tree of one switch without mounting it.

  Parameters:
  - `props` — `{:id ... :attrs ... :thumb-attrs ...}`.

  Returns: hiccup `[track attrs [thumb attrs]]` for the shared switch's own tags.

  Pure, so the DOM contract the behavior expects is testable without a browser."
  [props]
  (switch/markup props))

(def switch-track-tag
  "Tag name of the switch track element (`\"ui-switch\"`)."
  switch/track-tag)

(def switch-thumb-tag
  "Tag name of the switch thumb element (`\"ui-switch-thumb\"`)."
  switch/thumb-tag)

(defn segmented-control
  "Renders one controlled choice on a short scale.

  Parameters:
  - `props` — the control:
    - `:id` — required element id; a caller's legend or label names the group.
    - `:value` — the chosen item's `:value`, or nil when nothing is chosen.
    - `:items` — required sequence of `{:value ... :label ... :attrs ...}`.
    - `:on-change` — optional function of the chosen value. Return `false` to
      keep the current value while a save runs.
    - `:parse-value` — optional function mapping the element's string value back
      to the caller's value type; defaults to `identity`.
    - `:disabled?` / `:read-only?` — optional group state.
    - `:attrs` / `:item-attrs` / `:indicator?` / `:indicator-attrs` — painting
      and semantics.

  Returns: Hiccup vector for the control. The caller owns the styles, the label
  and the copy; the mounted items carry `data-checked` / `data-unchecked` (and
  `data-disabled` while disabled) for the caller's CSS."
  [props]
  (segmented-control/segmented-control props))

(defn segmented-control-markup
  "Returns the element tree of one segmented control without mounting it.

  Parameters:
  - `props` — `{:id ... :items [...] :attrs ... :item-attrs ...}`.

  Returns: hiccup `[root attrs indicator? item...]` for the shared element tags.

  Pure, so the DOM contract the behavior expects is testable without a browser."
  [props]
  (segmented-control/markup props))

(def segmented-control-root-tag
  "Tag name of the segmented control group (`\"ui-segmented-control\"`)."
  segmented-control/root-tag)

(def segmented-control-item-tag
  "Tag name of one segmented control choice (`\"ui-segmented-control-item\"`)."
  segmented-control/item-tag)

(defn tree
  "Renders one controlled tree of nested rows.

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
    - `:children` — rows built with `tree-item` / `tree-label` / `tree-indicator`
      / `tree-group`. A control a row hosts carries `data-row-action`, so
      pressing it does not also select its row.

  Returns: Hiccup vector for the tree. The caller owns the styles, the labels and
  the copy; the mounted rows carry `data-expanded` / `data-selected` /
  `data-level` / `data-current` for the caller's CSS."
  [props]
  (tree/tree props))

(defn tree-item
  "One tree row, wrapping the caller's own content.

  `:value` is the row's id in the selection and expansion; `:branch?` marks a row
  whose children nest in a `tree-group`; `:label` is the plain text typeahead
  matches; `:attrs` extends the row (do not set `role`, `tabindex` or `aria-*` —
  the element owns them); `:children` are the row's parts."
  [props]
  (tree/item props))

(defn tree-label
  "A tree row's content part. Takes optional attrs and the row's content."
  ([children] (tree/label children))
  ([attrs children] (tree/label attrs children)))

(defn tree-indicator
  "A branch row's expand/collapse control. Takes optional attrs and the caller's
  glyph; the element owns the press, `data-expanded` and the words a person
  hears."
  ([]
   (tree/indicator))
  ([attrs]
   (tree/indicator attrs))
  ([attrs children]
   (tree/indicator attrs children)))

(defn tree-group
  "The container a branch row's children nest in. Takes optional attrs and the
  child rows; the element keeps it hidden while the branch is collapsed."
  ([children] (tree/group children))
  ([attrs children] (tree/group attrs children)))

(defn tree-markup
  "Returns the element tree of one tree root without mounting it.

  Parameters:
  - `props` — `{:id ... :mode ... :current ... :expand-on-press? ... :children
    [...]}`.

  Returns: hiccup `[root attrs row...]` for the shared element tags.

  Pure, so the DOM contract the behavior expects is testable without a browser."
  [props]
  (tree/markup props))

(def tree-root-tag
  "Tag name of the tree root (`\"ui-tree\"`)."
  tree/root-tag)

(def tree-item-tag
  "Tag name of one tree row (`\"ui-tree-item\"`)."
  tree/item-tag)

(def tree-label-tag
  "Tag name of a tree row's content part (`\"ui-tree-item-label\"`)."
  tree/label-tag)

(def tree-indicator-tag
  "Tag name of a branch row's toggle (`\"ui-tree-item-indicator\"`)."
  tree/indicator-tag)

(def tree-group-tag
  "Tag name of a branch row's children container (`\"ui-tree-group\"`)."
  tree/group-tag)

(defn disclosure
  "Renders one disclosure: a trigger a person presses and the panel it shows.

  Parameters:
  - `props` — the disclosure:
    - `:open?` — the open state, when the caller owns it; omit it to let the
      element own the state, and re-render the value you accept.
    - `:default-open?` — the state a panel opens with when the element owns it.
    - `:on-open-change` — optional function of the next boolean; return `false`
      to keep the current state while a save runs.
    - `:on-ref` — optional function of the root element, called on mount and on
      every update.
    - `:disabled?` — optional; a press on the trigger then changes nothing.
    - `:keep-mounted?` — whether a closed panel stays in the page, hidden;
      defaults to `true`, so a panel keeps what is inside it.
    - `:hidden-until-found?` — keeps a closed panel findable by find in page.
    - `:attrs` / `:trigger-attrs` / `:button-attrs` / `:panel-attrs` — painting
      and test hooks on each part. Do not set `aria-expanded`, `aria-controls`
      or `id` on the button; the element owns them.
    - `:trigger-children` — the button's content: the caller's label plus
      usually `(disclosure-chevron {:class ...})`.
    - `:body-children` — optional content that always shows, between the trigger
      and the panel: what a row whose trigger is only its chevron must keep
      outside the button.
    - `:panel-children` — the panel's content.

  Returns: Hiccup vector for the disclosure. The caller owns the styles, the
  labels and the copy; the mounted parts carry `data-open` / `data-closed` (and
  `data-disabled`) for the caller's CSS."
  [props]
  [disclosure/disclosure props])

(defn disclosure-chevron
  "The shared disclosure chevron, for a trigger's content.

  Parameters:
  - `attrs` — optional map merged onto the `<svg>`; pass the caller's class,
    whose paint rotates the glyph from the trigger's `data-open`.

  Returns: hiccup `<svg>` for one stroke chevron pointing right."
  ([]
   (disclosure/chevron))
  ([attrs]
   (disclosure/chevron attrs)))

(defn disclosure-markup
  "Returns the element tree of one disclosure without mounting it.

  Parameters:
  - `props` — see `disclosure`.

  Returns: hiccup `[root attrs [trigger attrs [button attrs ...content]]
  [panel attrs ...content]]` for the shared element tags.

  Pure, so the DOM contract the behavior expects is testable without a browser."
  [props]
  (disclosure/markup props))

(def disclosure-root-tag
  "Tag name of the disclosure root (`\"ui-collapsible\"`)."
  disclosure/root-tag)

(def disclosure-trigger-tag
  "Tag name of the part wrapping the caller's button
  (`\"ui-collapsible-trigger\"`)."
  disclosure/trigger-tag)

(def disclosure-panel-tag
  "Tag name of the panel (`\"ui-collapsible-panel\"`)."
  disclosure/panel-tag)

(defn command
  "Renders a headless ui-sdk Command with an initially empty native input.

  `:items` contains maps with a unique string `:value`, string `:label`, optional
  string vector `:keywords`, and optional string `:description`. The description
  is rendered separately (`[data-command-description]`) for styling as a second
  line; the label uses `[data-command-label]`.

  Results appear only for a non-blank query unless `:show-idle?` is true.
   Activation clears the query before
  invoking `:on-select` with the item's value. `:empty-label` defaults to
  \"No results\". `:input-attrs` styles and names the native input (supply an
  accessible name); `:attrs` extends `ui-command`. `:part-attrs` styles the
  `:content`, `:list`, `:item`, `:description` and `:empty` parts."
  [props]
  [sdk-picker/command props])

(defn combobox
  "Renders a controlled, headless ui-sdk single-select Combobox.

  `:items` contains maps with a unique string `:value`, string `:label`, and
  optional string vector `:keywords`. `:value` is a selected item value or nil;
  unknown values are displayed as no selection. `:disabled?` disables the field.
  `:on-select` receives the new item value on explicit selection. To accept it,
  pass it back as `:value`; typing, dismissal, and prop writes never notify.

  `:empty-label` defaults to \"No options\". `:input-attrs` styles and names the
  native input (supply an accessible name); `:attrs` extends `ui-combobox`.
  `:part-attrs` styles `:content`, `:list` and `:empty`; `:item` takes `:class`. The
  adapter owns widget state and does not accept free-form text."
  [props]
  [sdk-picker/combobox props])

(defn select
  "Controlled ui-sdk single Select for fixed choices. `:items` contains string
  `:value` and `:label` pairs, optionally `:disabled?`. `:on-select` receives a
  user selection; pass it back as `:value` to accept. Supply the button's
  accessible name in `:trigger-attrs`, optional `:icon` Hiccup, and style the
  popup via `:part-attrs` (`:content`, `:list`, `:item`)."
  [props]
  [sdk-picker/select props])

(defn token-input
  "Renders one controlled token input: an editor that holds tokens beside text.

  Parameters:
  - `props` — input attributes:
    - `:value` — required; a vector of strings and token maps
      `{:type :value :label}` (`:id`, `:status`, `:data` are the element's own).
    - `:on-change` — optional function of `(value details)`; `details` carries
      `:reason`, `:input-type` and the `:removed` tokens a change dropped.
    - `:triggers` — optional vector of declarative triggers (`:char`, `:type`,
      `:source`, plus the element's options in kebab case like `:boundary`).
    - `:sources` — optional map of source key → `(fn [query context] ...)` returning
      items or a Promise of them. A trigger is mounted only when its source exists.
    - `:submit-shortcut` — `\"enter\"` or `\"mod+enter\"`; the element submits the form
      it is in, so the caller owns the `<form>`.
    - `:disabled?`, `:read-only?`, `:id`, and the paint maps described on
      `token-input-markup`.

  Returns: Hiccup vector for the token input, or nil while its elements load. The
  caller owns every class, label and placeholder; the element owns the edits."
  [props]
  [token-input/token-input props])

(defn token-input-markup
  "Returns the element tree of one token input without mounting it.

  Parameters:
  - `props` — the same maps `token-input` takes; `:value` and `:triggers` are never
    rendered, because the binding writes them onto the DOM node.

  Returns: hiccup `[ui-token-input ...]` with the editor, the token `<template>`,
  and the suggestion menu only when a trigger has a source."
  [props]
  (token-input/markup props))

(defn token-input-trigger-menu?
  "Whether the given token input props mount a suggestion menu.

  Parameters:
  - `props` — the maps `token-input` takes.

  Returns: true when at least one declared trigger has a source."
  [props]
  (token-input/trigger-menu? props))

(def token-input-tag
  "Tag name of the token input element (`\"ui-token-input\"`)."
  token-input/input-tag)

(def token-input-editor-tag
  "Tag name of the editor inside a token input (`\"ui-token-input-editor\"`)."
  token-input/editor-tag)

(def token-input-token-tag
  "Tag name of one token (`\"ui-token-input-token\"`)."
  token-input/token-tag)

(def token-input-token-remove-tag
  "Tag name of a token's remove part (`\"ui-token-input-token-remove\"`)."
  token-input/token-remove-tag)

(def token-input-trigger-menu-tag
  "Tag name of the token input's suggestion menu (`\"ui-trigger-menu\"`)."
  token-input/trigger-menu-tag)

(defn filter-select-option-id
  "Returns an option's stable selection id.

  Parameters:
  - `option` — option value, usually a map.
  - `opts` — selector options:
    - `:option-id` — optional keyword, string, or function selecting the option id; defaults to
      `:id`.

  Returns: the resolved option id; nil when the selector finds nothing."
  [option opts]
  (filter-select/option-id option opts))

(defn filter-select-option-label
  "Returns the text shown for an option.

  Parameters:
  - `option` — option value, usually a map.
  - `opts` — selector options:
    - `:option-label` — optional keyword, string, or function selecting the label; defaults to
      `:label`.
    - `:option-id` — used for the fallback label.

  Returns: the resolved label, the resolved option id when the label is missing, or the empty
  string."
  [option opts]
  (filter-select/option-label option opts))

(defn filter-select-option-description
  "Returns an option's secondary description, or nil when none is configured.

  Parameters:
  - `option` — option value, usually a map.
  - `opts` — selector options:
    - `:option-description` — optional keyword, string, or function selecting the description;
      without it no description is read.

  Returns: the resolved description value, or nil."
  [option opts]
  (filter-select/option-description option opts))

(defn filter-select-filter-options
  "Returns options matching every case-insensitive token in `query`.

  Parameters:
  - `options` — sequence of options to filter; nil is treated as empty.
  - `query` — search text; trimmed, lower-cased, and split on whitespace, an empty query matches
    every option.
  - `opts` — filtering options:
    - `:filter-fn` — optional predicate of `(option query opts)` replacing the default token
      filter.
    - `:option-search-fields` — optional sequence of keyword/string/function selectors choosing the
      fields searched by the default filter; defaults to `:label`, `:id`, and `:keywords`.

  Returns: vector of the options that match, in input order."
  ([options query]
   (filter-select/filter-options options query))
  ([options query opts]
   (filter-select/filter-options options query opts)))

(defn filter-select-selected-option
  "Returns the option whose resolved id equals `selected-id`, or nil.

  Parameters:
  - `options` — sequence of options; nil is treated as empty.
  - `selected-id` — id to look for, compared against `filter-select-option-id`.
  - `opts` — selector options forwarded to the id accessor (`:option-id`).

  Returns: the first option with a matching resolved id, or nil."
  [options selected-id opts]
  (filter-select/selected-option options selected-id opts))

(defn filter-select
  "Renders a headless, searchable, single-select combobox.

  Selection is caller-owned through `selected-id` and `on-select`; the component owns only
  transient query, open, and keyboard-navigation state.

  Parameters:
  - `combobox-options` — combobox options:
    - `:id` — component id used to derive the input, listbox, and option DOM ids; callers must
      supply one for stable ids.
    - `:label` — visible field label.
    - `:options` — sequence of options to offer.
    - `:selected-id` — id of the currently selected option, resolved through the option id
      accessor.
    - `:on-select` — optional function called with the chosen option once the menu closes.
    - `:option-id`, `:option-label`, `:option-description`, `:option-disabled?` — optional keyword,
      string, or function selectors.
    - `:option-search-fields` — optional search-field selectors for the default token filter.
    - `:filter-fn` — optional predicate of `(option query opts)` replacing the default filter.
    - `:default-open?` — open the menu on first render when true.
    - `:placeholder` — input placeholder; defaults to `\"Filter...\"`.
    - `:disabled?` — disable the control when true.
    - `:class` — optional class for the root element.
    - `:attrs` — optional attribute map for the root element.
    - `:label-options`, `:control-options`, `:input-options`, `:menu-options`, `:empty-options` —
      optional attribute maps (or functions of the render context) extending those parts.
    - `:menu-layout` — `:anchored` (default), `:inline`, or `:portal`.
    - `:option-options` — optional option attributes map or function of `(option ctx)`; `ctx`
      carries `:active?`, `:selected?`, and `:disabled?`.
    - `:empty-label` — empty-state text; defaults to `\"No options\"`.
    - `:render-option` — optional function of `(option opts)` rendering one option's content.
    - `:end-adornment` — optional passive content rendered at the end of the input.

  Returns: Hiccup vector rendering the labelled combobox."
  [combobox-options]
  (filter-select/filter-select combobox-options))

(defn multi-step-trigger-attrs
  "Builds semantic button attributes for one multi-step timeline item.

  `action` may be a handler, a re-frame event vector, or a sequence of event vectors. Caller
  attributes override defaults.

  Parameters:
  - `step` — step item:
    - `:id` — step id, rendered as `data-step-id`.
    - `:state` — one of `:complete`, `:active`, `:upcoming`; rendered as `data-state`.
    - `:active?` — renders `aria-current=\"step\"` when true.
    - `:navigable?` — the button is `disabled` unless true, and only navigable steps get the
      generated `:on-click`.
    - `:action` — optional navigation action: handler function, dispatch vector, or sequence of
      dispatch vectors.
    - `:attrs` — optional attribute map merged over the generated attributes.

  Returns: attribute map for a `<button>`.

  Throws `ex-info` when a clicked action is none of handler, dispatch vector, or sequence of
  dispatch vectors."
  [step]
  (multi-step/step-trigger-attrs step))

(defn multi-step-trigger
  "Renders one numbered timeline trigger from a normalized step item.

  Parameters:
  - `step` — step item:
    - `:id`, `:state`, `:active?`, `:navigable?`, `:action`, `:attrs` — see
      `multi-step-trigger-attrs`.
    - `:index` — zero-based step index; rendered as a one-based marker number.
    - `:label` — visible step label.

  Returns: `[:button ...]` Hiccup vector with a marker and a label."
  [step]
  (multi-step/step-trigger step))

(defn multi-step-timeline
  "Renders the ordered step navigation for `steps` and `active-id`.

  Parameters:
  - `timeline-options` — timeline options:
    - `:steps` — sequence of step maps (`:id`, `:label`, `:action`, `:disabled?`).
    - `:active-id` — id of the active step; an unknown or nil id falls back to the first step.
    - `:aria-label` — optional accessible name of the `<nav>`.
    - `:attrs` — optional attribute map merged onto the `<nav>`.
    - `:list-attrs` — optional attribute map merged onto the `<ol>`.

  Returns: `[:nav ... [:ol ...]]` Hiccup vector, with steps before the active one marked complete."
  [timeline-options]
  (multi-step/timeline timeline-options))

(defn multi-step-panel
  "Renders the active step content in `panel-tag`, defaulting to a section.

  Parameters:
  - `panel-options` — panel options:
    - `:active-id` — id of the active step, rendered as `data-step-id`.
    - `:content` — panel content: one Hiccup node, a sequence of nodes, or nil for an empty panel.
    - `:attrs` — optional attribute map merged over the generated panel attributes.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.

  Returns: Hiccup vector rendering the panel element."
  [panel-options]
  (multi-step/step-panel panel-options))

(defn multi-step
  "Renders a complete timeline, active content panel, and optional footer.

  Selection is caller-owned through `active-id`; completed step actions carry navigation behavior
  supplied by each step.

  Parameters:
  - `multi-step-options` — surface options:
    - `:steps` — sequence of step maps (`:id`, `:label`, `:action`, `:disabled?`).
    - `:active-id` — id of the active step; an unknown or nil id falls back to the first step and
      the resolved id is rendered as `data-active-step-id`.
    - `:content` — content of the active step panel.
    - `:footer` — optional footer content; the footer element is omitted when nil.
    - `:aria-label` — optional accessible name of the timeline.
    - `:attrs` — optional attribute map merged onto the root element.
    - `:timeline-attrs` — optional attribute map for the timeline `<nav>`.
    - `:list-attrs` — optional attribute map for the timeline `<ol>`.
    - `:panel-attrs` — optional attribute map for the panel.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.
    - `:footer-attrs` — optional attribute map for the footer.

  Returns: `[:div ...]` Hiccup vector containing the timeline, the panel, and the optional footer."
  [multi-step-options]
  (multi-step/multi-step multi-step-options))

(defn optional-range-state
  "Returns `:empty`, `:lower-only`, `:upper-only`, or `:bounded` for two values.

  Parameters:
  - `lower-value` — lower bound value as the caller stores it; nil, blank, and whitespace-only
    values count as absent.
  - `upper-value` — upper bound value with the same presence rules.

  Returns: `:bounded` when both bounds are present, `:lower-only` / `:upper-only` when one is, and
  `:empty` when neither is."
  [lower-value upper-value]
  (optional-range/range-state lower-value upper-value))

(defn optional-range-input-id
  "Returns the stable input id for a component and bound.

  Parameters:
  - `component-id` — id of the owning range filter.
  - `bound` — `:lower` or `:upper`.

  Returns: the string `\"<component-id>-lower\"` or `\"<component-id>-upper\"`.

  Throws `ex-info` when `bound` is neither `:lower` nor `:upper`."
  [component-id bound]
  (optional-range/input-id component-id bound))

(defn optional-range-filter
  "Renders independently optional lower and upper range inputs.

  `id` is required. Values and change callbacks are caller-owned; remaining input constraints and
  DOM attributes are shared by both bounds.

  Parameters:
  - `range-options` — range filter options:
    - `:id` — required; component id; the bound input ids are derived from it.
    - `:label` — legend text.
    - `:lower-label` — label of the lower bound input.
    - `:upper-label` — label of the upper bound input.
    - `:lower-value` — current lower bound value; nil renders as an empty input.
    - `:upper-value` — current upper bound value; nil renders as an empty input.
    - `:lower-placeholder` — placeholder of the lower input.
    - `:upper-placeholder` — placeholder of the upper input.
    - `:on-lower-value` — function of the new lower text; defaults to a no-op.
    - `:on-upper-value` — function of the new upper text; defaults to a no-op.
    - `:type` — input type shared by both bounds; defaults to `\"text\"`.
    - `:disabled?` — disables both inputs when true.
    - `:min`, `:max`, `:step` — input constraints shared by both bounds.
    - `:input-options` — optional attribute map merged under the generated input attributes.
    - `:attrs` — optional attribute map merged over the root `:fieldset` attributes.

  Returns: `[:fieldset ...]` Hiccup vector containing the legend and both bound inputs, with
  `data-state` describing which bounds are present.

  Throws `ex-info` when `:id` is blank."
  [range-options]
  (optional-range/optional-range-filter range-options))

(def table-filter-default-type-definitions
  "Built-in text, select, and range editor/operator definitions.

  Keys are field types (`:text`, `:multi-select`, `:single-select`, `:range`); each value is
  `{:editor <editor kind> :operators [{:id :label :editor} ...]}`. Callers extend or replace a type
  by passing their own map as `type-definition-overrides`; nested maps are merged onto these
  defaults."
  table-filter/default-type-definitions)

(defn table-filter-operators-for-field
  "Returns the operators available for `field`, with editor defaults applied.

  Parameters:
  - `field` — filterable field map:
    - `:id` — field id.
    - `:label` — visible field label; defaults to `:id`.
    - `:type` — field type key into the type definitions; inferred from `:options` and
      `:multiple?` when absent.
    - `:operators` — optional field-specific operator vector overriding the type's operators.
    - `:options` — optional value options, used to infer a select type.
    - `:multiple?` — with `:options`, selects `:multi-select` instead of `:single-select`.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `table-filter-default-type-definitions`.

  Returns: vector of operator maps (`:id`, `:label`, `:editor`, and optionally `:value-kind`,
  `:empty-value`, `:value-required?`); each operator without an explicit `:editor`/`:value-kind`
  inherits the type's default editor. Empty when the field type is unknown and it declares no
  operators."
  ([field]
   (table-filter/operators-for-field field))
  ([field type-definition-overrides]
   (table-filter/operators-for-field field type-definition-overrides)))

(defn table-filter-repeatable-field?
  "Returns true unless `field` explicitly disables repeated conditions.

  Parameters:
  - `field` — filterable field map; only `:repeatable?` is read.

  Returns: false only when `:repeatable?` is exactly `false`, true otherwise (including when the
  key is absent)."
  [field]
  (table-filter/repeatable-field? field))

(defn table-filter-available-fields
  "Returns fields that can still add a condition.

  Non-repeatable fields already used by `conditions` are omitted.

  Parameters:
  - `fields` — sequence of filterable field maps (see `table-filter-operators-for-field`).
  - `conditions` — current condition vector; each condition's `:field-id` counts as used.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `table-filter-default-type-definitions`.

  Returns: vector of the fields that declare at least one operator and are either repeatable or not
  yet used by a condition, in input order."
  ([fields conditions]
   (table-filter/available-fields fields conditions))
  ([fields conditions type-definition-overrides]
   (table-filter/available-fields fields conditions type-definition-overrides)))

(defn table-filter-draft-for-field
  "Creates a condition draft using the field's default operator, or nil.

  Parameters:
  - `field` — filterable field map; `:default-operator-id` selects the default operator, otherwise
    the first operator of the field is used.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `table-filter-default-type-definitions`.

  Returns: draft map `{:field-id :operator-id :value}` whose `:value` is the operator's empty value
  for its editor kind, or nil when the field has no operators."
  ([field]
   (table-filter/draft-for-field field))
  ([field type-definition-overrides]
   (table-filter/draft-for-field field type-definition-overrides)))

(defn table-filter-valid-condition?
  "Returns truthy when a condition references a known operator and valid value.

  Parameters:
  - `condition` — condition map:
    - `:field-id` — field the condition applies to; an unknown field makes the condition invalid.
    - `:operator-id` — operator the condition applies to; an unknown operator makes it invalid.
    - `:value` — condition value, checked with the operator's editor kind (a non-blank string for
      text/select, a non-empty collection for multi-select, a map with at least one non-blank
      `:lower`/`:upper` for range, ignored for `:none`).
  - `fields` — sequence of filterable field maps.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `table-filter-default-type-definitions`.

  Returns: truthy when the condition is valid, nil when the field, the operator, or a required
  value is missing."
  ([condition fields]
   (table-filter/valid-condition? condition fields))
  ([condition fields type-definition-overrides]
   (table-filter/valid-condition? condition fields type-definition-overrides)))

(defn table-filter-with-operator
  "Changes a condition's operator and preserves only compatible values.

  Parameters:
  - `condition` — condition map; `:operator-id` is replaced and `:value` is kept or reset.
  - `field` — filterable field map the condition applies to.
  - `operator-id` — id of the operator to switch to.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `table-filter-default-type-definitions`.

  Returns: the condition with the new `:operator-id`, keeping `:value` only when the previous and
  next operators share an editor kind and otherwise resetting it to the new operator's empty value;
  the unchanged condition when `operator-id` is not an operator of the field."
  ([condition field operator-id]
   (table-filter/with-operator condition field operator-id))
  ([condition field operator-id type-definition-overrides]
   (table-filter/with-operator condition field operator-id type-definition-overrides)))

(defn table-filter-add-condition
  "Appends a condition and rejects duplicate condition ids.

  Parameters:
  - `conditions` — current condition vector; nil is treated as empty.
  - `condition` — condition map to append; its `:id` must be unique.

  Returns: the condition vector with `condition` appended.

  Throws `ex-info` when a condition with the same `:id` is already present."
  [conditions condition]
  (table-filter/add-condition conditions condition))

(defn table-filter-replace-condition
  "Replaces the condition with the same id, preserving collection order.

  Parameters:
  - `conditions` — current condition vector; nil is treated as empty.
  - `condition` — condition map whose `:id` selects the entry to replace; nothing changes when no
    entry has that id.

  Returns: a new condition vector in which the same-id entry is replaced by `condition`."
  [conditions condition]
  (table-filter/replace-condition conditions condition))

(defn table-filter-remove-condition
  "Removes the condition identified by `condition-id`.

  Parameters:
  - `conditions` — current condition vector; nil is treated as empty.
  - `condition-id` — id of the condition to drop.

  Returns: a new condition vector without that condition, keeping the other entries in order."
  [conditions condition-id]
  (table-filter/remove-condition conditions condition-id))

(defn table-filter-clear-conditions
  "Returns an empty condition vector.

  Parameters:
  - `conditions` — current condition vector; the value is ignored.

  Returns: `[]`."
  [conditions]
  (table-filter/clear-conditions conditions))

(defn table-filter-builder
  "Renders a controlled condition builder for table filters.

  `fields` describe available predicates, `conditions` is caller-owned, and `on-conditions-change`
  receives each next condition vector plus change metadata. The component owns only its uncommitted
  editor draft.

  Parameters:
  - `builder-options` — builder options:
    - `:id` — required; component id used for the builder's DOM ids.
    - `:fields` — sequence of filterable field maps (see `table-filter-operators-for-field`).
    - `:conditions` — current condition vector, one entry per row:
      - `:id` — condition id.
      - `:field-id` — field the condition applies to.
      - `:operator-id` — operator the condition applies to.
      - `:value` — condition value in the shape the operator's editor kind expects.
    - `:type-definitions` — optional map of field type -> definition merged onto
      `table-filter-default-type-definitions`.
    - `:copy` — optional map of UI strings merged onto the default copy.
    - `:disabled?` — disables the row and footer controls when true.
    - `:on-conditions-change` — function of `(conditions meta)` called with the next condition
      vector and change metadata (`:action` one of `:condition/add`, `:condition/update`,
      `:condition/remove`, `:condition/clear`, plus `:condition-id`, `:field-id`, and
      `:operator-id` when a condition is involved).
    - `:new-condition-id` — optional zero-argument function producing the id for a newly added
      condition; defaults to a random UUID string.
    - `:attrs` — optional attribute map merged onto the root `:section`.
    - `:class` — optional class appended to the root element.

  Returns: `[:section ...]` Hiccup vector rendering the condition list and the add-condition
  editor, with `data-state` and `data-editor-state` reflecting the current conditions and editor
  stage.

  Throws `ex-info` when `:id` is blank."
  [builder-options]
  (table-filter/table-filter-builder builder-options))

(defn thread-ref
  "Renders one Thread named where a reader can act on it. See
  `com.zihao.re-frame-component.ui.thread-ref.interface/thread-ref` for the
  reference's arguments; the root carries `data-component`
  `\"re-frame-thread-ref\"` and `data-thread`."
  [props]
  (thread-ref/thread-ref props))

(defn tag
  "Renders an unstyled semantic tag.

  `color` becomes `data-color`; `class` and `attrs` extend the root span.

  Parameters:
  - `tag-attributes` — tag root attributes:
    - `:color` — optional semantic color; keyword colors render as their name, other values as a
      string, in `data-color`.
    - `:class` — optional class appended to the root span's class list.
    - `:attrs` — optional attribute map merged under the generated `data-component` marker.
  - `children` — the vararg list of tag content nodes, rendered inside the span in order.

  Returns: `[:span attrs ...children]` Hiccup vector."
  [tag-attributes & children]
  (into [tag/tag tag-attributes] children))

(defn router-activation-route-key
  "Builds the stable identity used to decide whether two routes are the same activation.

  Parameters:
  - `route` — matched route map; `:id`, `:path`, `:params`, `:query`, and `:not-found?` are kept.

  Returns: the identity subset of `route`, or nil when `route` is nil."
  [route]
  (router-activation/route-key route))

(defn router-activation-same-route?
  "Tests whether two routes have the same activation identity.

  Parameters:
  - `left` — matched route map, or nil.
  - `right` — matched route map, or nil.

  Returns: true when both routes carry the same `:id`, `:path`, `:params`, `:query`, and
  `:not-found?`."
  [left right]
  (router-activation/same-route? left right))

(defn router-activation-transition
  "Describes one app-owned route activation opportunity.

  Parameters:
  - `transition-input` — activation input map:
    - `:reason` — why activation is being evaluated: `:initialize`, `:location-changed`,
      `:navigate`, or `:reactivate`.
    - `:previous-route` — route currently stored in app-db, or nil.
    - `:route` — newly matched route, or nil.
    - `:context` — optional app-owned context passed through untouched.
    - `:scope-fn` — optional function (or keyword) deriving the activation scope from a route;
      defaults to `:id`.

  Returns: transition map with `:reason`, `:previous-route`, `:route`, `:previous-scope`,
  `:scope`, `:context`, `:route-changed?`, `:scope-changed?`, `:leaving-scope?`,
  `:entering-scope?`, `:route-changed-within-scope?`, `:reactivate?`, and `:activate?`. A
  `:reactivate` reason activates even when the location is unchanged."
  [transition-input]
  (router-activation/transition transition-input))

(defn router-route-table
  "Indexes route specs into the route table the rest of the API expects.

  Parameters:
  - `route-specs` — sequence of route spec maps:
    - `:id` — required; route id keyword.
    - `:segments` — path pattern: literal strings plus keyword params (`:deck-id`).
    - `:nav` — optional navigation spec: `:label` (visible in nav when present), `:order`,
      `:parent` (parent route id for secondary nav), `:params`, `:query`.
  - `route-options` — optional app-owned ids:
    - `:default-route-id` — route id used for the empty path; must exist in `route-specs`.
    - `:not-found-route-id` — route id used for unmatched locations; defaults to `:not-found`.

  Returns: table map `{:route-specs <vector> :route-by-id <map> :default-route-id
  <keyword-or-nil> :not-found-route-id <keyword>}`.

  Throws `ex-info` when a configured default or not-found route id is not among the specs."
  ([route-specs]
   (router-model/route-table route-specs))
  ([route-specs route-options]
   (router-model/route-table route-specs route-options)))

(defn router-spec-by-id
  "Looks up a route spec in a route table.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route-id` — route id keyword.

  Returns: the route spec, or nil when the id is unknown."
  [table route-id]
  (router-model/spec-by-id table route-id))

(defn router-encode-component
  "Percent-encodes one path or query component.

  Parameters:
  - `value` — value to encode; it is stringified first.

  Returns: the encoded string, with spaces encoded as `%20`."
  [value]
  (router-model/encode-component value))

(defn router-decode-component
  "Decodes one percent-encoded path or query component.

  Parameters:
  - `value` — encoded value; it is stringified first.

  Returns: the decoded string."
  [value]
  (router-model/decode-component value))

(defn router-normalize-fragment
  "Normalizes a location hash or fragment into a path.

  Parameters:
  - `location` — hash (`\"#/decks/1\"`), path, or nil.

  Returns: an absolute path string: the leading `#` is dropped, a blank fragment becomes `\"/\"`, and
  a missing leading slash is added."
  [location]
  (router-model/normalize-fragment location))

(defn router-split-query
  "Splits a fragment into its path and raw query string.

  Parameters:
  - `fragment` — fragment such as `\"/decks?page=2\"`.

  Returns: map `{:path <string> :query-string <string-or-nil>}`, with a blank path reported as
  `\"/\"`."
  [fragment]
  (router-model/split-query fragment))

(defn router-path-segments
  "Splits a path into decoded segments.

  Parameters:
  - `path` — absolute path such as `\"/decks/abc\"`; nil is treated as `\"\"`.

  Returns: vector of decoded segment strings; `\"/\"` and the empty path yield `[]`."
  [path]
  (router-model/path-segments path))

(defn router-parse-query-pair
  "Parses one `key=value` query pair.

  Parameters:
  - `part` — raw pair string such as `\"page=2\"`.

  Returns: `[key value]` vector of the decoded key keyword and the decoded string value; a pair
  without `=` yields an empty-string value, and a blank pair yields the empty keyword `:`."
  [part]
  (router-model/parse-query-pair part))

(defn router-parse-query
  "Parses a raw query string into a map.

  Parameters:
  - `query-string` — query string without the leading `?`; blank or nil yields `{}`.

  Returns: map of decoded keyword keys to decoded string values; later duplicates win."
  [query-string]
  (router-model/parse-query query-string))

(defn router-encode-query-entry
  "Encodes one query map entry as a `key=value` string.

  Parameters:
  - `entry` — a map entry or `[key value]` pair; the key is encoded from its name.

  Returns: the encoded `\"key=value\"` string, or nil when the value is nil (such entries are
  dropped)."
  [entry]
  (router-model/encode-query-entry entry))

(defn router-render-query
  "Renders a query map as a query string.

  Parameters:
  - `query` — map of query keys (keyword or string) to values.

  Returns: `\"?a=1&b=2\"` with entries sorted by key name, or nil when the query has no non-nil
  value."
  [query]
  (router-model/render-query query))

(defn router-match-segments
  "Matches path segments against one route spec's segment pattern.

  Parameters:
  - `spec` — route spec; `:segments` is the pattern of literal strings and keyword params.
  - `segments` — decoded path segments to match.

  Returns: map of param keyword -> segment string, `{}` for a spec that needs no params, or nil
  when the segment count or a literal segment does not match."
  [spec segments]
  (router-model/match-segments spec segments))

(defn router-match-route
  "Matches path segments against a route table.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `segments` — decoded path segments.

  Returns: the first matching route spec with `:params` added, the default route spec with
  `:params {}` for an empty path when the table has a default route, or nil."
  [table segments]
  (router-model/match-route table segments))

(defn router-match-location
  "Matches a location against a route table.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `location` — location hash or fragment, e.g. `\"#/decks/abc?page=2\"`.

  Returns: route map `{:id :path :params :query :not-found?}`; an unmatched location yields the
  table's not-found route id with `:not-found? true` and the original path and query preserved."
  [table location]
  (router-model/match-location table location))

(defn router-path-for-route
  "Builds the path of one route from its params.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route-id` — route id keyword.
  - `params` — map of param keyword -> value, one value per keyword segment of the route.

  Returns: the encoded path string, `\"/\"` for a route with no segments.

  Throws `ex-info` when `route-id` is unknown or a keyword segment has no param value."
  [table route-id params]
  (router-model/path-for-route table route-id params))

(defn router-href
  "Builds the hash href of one route.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route-id` — route id keyword.
  - `params` — optional map of param keyword -> value; defaults to no params.
  - `query` — optional map of query keys to values; defaults to no query.

  Returns: `\"#<path>\"` plus the rendered query string, e.g. `\"#/decks/abc?page=2\"`.

  Throws `ex-info` as described on `router-path-for-route`."
  ([table route-id]
   (router-model/href table route-id))
  ([table route-id params]
   (router-model/href table route-id params))
  ([table route-id params query]
   (router-model/href table route-id params query)))

(defn router-spec-for-route
  "Looks up the route spec of a matched route.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route` — matched route map; `:id` selects the spec.

  Returns: the route spec, or nil when the id is unknown."
  [table route]
  (router-model/spec-for-route table route))

(defn router-primary-route-ids
  "Returns the ids of the routes that act as primary navigation entries.

  Parameters:
  - `table` — route table built by `router-route-table`.

  Returns: set of route ids whose `:nav` has a `:label` and no `:parent`."
  [table]
  (router-model/primary-route-ids table))

(defn router-active-nav-state
  "Describes which navigation entry is active for a matched route.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route` — matched route map.

  Returns: `{:active-id <route-id> :active-parent-id <route-id-or-nil>}`, where the parent id comes
  from the spec's `:nav :parent` and falls back to the route id itself for a primary entry; nil when
  the route is unknown or has no `:nav` spec."
  [table route]
  (router-model/active-nav-state table route))

(defn router-nav-href
  "Builds the href of a nav spec's target route.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `spec` — route spec carrying `:nav`, optionally with `:params` and `:query`.

  Returns: the hash href built from the spec's id, `:nav :params`, and `:nav :query`.

  Throws `ex-info` when the route needs a path parameter that `:nav :params` does not provide."
  [table spec]
  (router-model/nav-href table spec))

(defn router-nav-item
  "Builds one navigation item from a route spec.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route` — currently matched route map.
  - `spec` — route spec to render as a nav item.
  - `children` — optional child nav items for a secondary menu.

  Returns: `{:id :label :href :active? :current?}`, where `:active?` is true when the item is the
  active entry or the active parent, `:current?` is true when it is the current route, and
  `:children` is added when the child sequence is non-empty.

  Throws `ex-info` as described on `router-nav-href`."
  ([table route spec]
   (router-model/nav-item table route spec))
  ([table route spec children]
   (router-model/nav-item table route spec children)))

(defn router-nav-model
  "Builds the whole navigation model of a matched route.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route` — currently matched route map.

  Returns: map with `:items` (primary nav items, each carrying its `:children`), `:secondary-items`
  (children of the active parent, empty when none), and the `router-active-nav-state` keys
  `:active-id` and `:active-parent-id`.

  Throws `ex-info` when a visible nav entry's route needs a path parameter that its `:nav :params`
  does not provide."
  [table route]
  (router-model/nav-model table route))

(defn router-page-model
  "Builds the page model a route renders from.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route` — matched route map.

  Returns: `{:route <route> :nav <nav-model> :page-id <route-id>}`."
  [table route]
  (router-model/page-model table route))

(defn router-route-location
  "Renders the canonical location of a matched route.

  Parameters:
  - `table` — route table built by `router-route-table`.
  - `route` — matched route map; `:not-found?` routes are rendered from their stored `:path` and
    `:query` so unknown locations survive a reload.

  Returns: the hash href string of the route."
  [table route]
  (router-model/route-location table route))

(def router-set-location-fx-id
  "Default re-frame effect id used to write the browser location, `:com.zihao.re-frame-component.router.event/set-location`.
  A router config can override it with `:set-location-fx-id`."
  router-event/set-location-fx-id)

(defn router-current-location
  "Reads the current browser location hash.

  Returns: `window.location.hash`, or `\"#/\"` when the location has no hash."
  []
  (router-event/current-location))

(defn router-route
  "Reads the matched route stored in app-db.

  Parameters:
  - `config` — router config:
    - `:route-path` — optional app-db path of the matched route; defaults to `[:route]`.
  - `db` — app-db map to read.

  Returns: the stored matched route map, or nil before the router initialized."
  [config db]
  (router-event/route config db))

(defn router-assoc-route
  "Stores a matched route in app-db.

  Parameters:
  - `config` — router config; `:route-path` selects the path, defaulting to `[:route]`.
  - `db` — app-db map to update.
  - `matched-route` — route map produced by `router-match-location`.

  Returns: the updated app-db."
  [config db matched-route]
  (router-event/assoc-route config db matched-route))

(defn router-event-match-location
  "Matches a location through a router config's route table.

  Parameters:
  - `config` — router config carrying `:route-table`.
  - `location` — location hash or fragment to match.

  Returns: route map `{:id :path :params :query :not-found?}`."
  [config location]
  (router-event/match-location config location))

(defn router-activation-event-transition
  "Builds the activation transition for one router event.

  Parameters:
  - `config` — router config:
    - `:route-activation-context` — optional function of app-db producing the activation context.
    - `:route-activation-scope` — optional scope function or keyword.
  - `db` — app-db the context is derived from.
  - `reason` — activation reason: `:initialize`, `:location-changed`, `:navigate`, or
    `:reactivate`.
  - `previous-route` — route stored before this event, or nil.
  - `matched-route` — route this event activates.

  Returns: transition map as described on `router-activation-transition`."
  [config db reason previous-route matched-route]
  (router-event/activation-transition config db reason previous-route matched-route))

(defn router-activation-effects
  "Runs the app-owned route activation planner for one transition.

  Parameters:
  - `config` — router config carrying `:route-activation-effects`, a function of the transition
    returning the actions to dispatch.
  - `db` — app-db the transition is computed from.
  - `reason` — activation reason.
  - `previous-route` — route stored before this event, or nil.
  - `matched-route` — route this event activates.

  Returns: vector of actions when the transition activates and the config has a planner, otherwise
  `[]`."
  [config db reason previous-route matched-route]
  (router-event/route-activation-effects config db reason previous-route matched-route))

(defn router-initialize-effects
  "Computes the `:db` and `:fx` of the router initialize event.

  Parameters:
  - `config` — router config; `:current-location-fn` and `:default-location` choose the location
    when the event carries none.
  - `cofx` — re-frame coeffects map; `:db` is read.
  - `event` — initialize event vector `[:<initialize-id> location?]`.

  Returns: `{:db <app-db with the matched route> :fx <activation effects>}`."
  [config cofx event]
  (router-event/initialize-effects config cofx event))

(defn router-location-changed-effects
  "Computes the `:db` and `:fx` of the router location-changed event.

  Parameters:
  - `config` — router config carrying `:route-table`.
  - `cofx` — re-frame coeffects map; `:db` is read.
  - `event` — location-changed event vector `[:<location-changed-id> location]`.

  Returns: `{:db <app-db with the matched route> :fx <activation effects>}`."
  [config cofx event]
  (router-event/location-changed-effects config cofx event))

(defn router-navigate-effects
  "Computes the `:db` and `:fx` of the router navigate event.

  Parameters:
  - `config` — router config carrying `:route-table`, plus `:set-location-fx-id` to override the
    location effect id.
  - `cofx` — re-frame coeffects map; `:db` is read.
  - `event` — navigate event vector `[:<navigate-id> route-id params query]`; `params` and `query`
    default to `{}`.

  Returns: `{:db <app-db with the matched route> :fx <activation effects plus the location write>}`."
  [config cofx event]
  (router-event/navigate-effects config cofx event))

(defn router-reactivate-effects
  "Computes the `:db` and `:fx` of the router reactivate event.

  Reactivation re-runs activation for the current route even though the location did not change,
  which lets authentication or another app context become ready after the router initialized.

  Parameters:
  - `config` — router config carrying the activation planner.
  - `cofx` — re-frame coeffects map; `:db` is read and returned unchanged.
  - `event` — reactivate event vector; the payload is ignored.

  Returns: `{:db <unchanged app-db> :fx <reactivate activation effects>}`."
  [config cofx event]
  (router-event/reactivate-effects config cofx event))

(defn router-install-location-listener!
  "Installs the window `hashchange` listener that dispatches the location-changed event.

  The listener is installed at most once per listener key.

  Parameters:
  - `config` — router config:
    - `:location-changed-id` — event id dispatched on `hashchange`.
    - `:listener-id` — optional key identifying this router's listener; defaults to
      `:location-changed-id`.
    - `:current-location-fn` — optional function of the current location hash.

  Returns: `{:ok? true}`."
  [config]
  (router-event/install-location-listener! config))

(defn router-register-events!
  "Registers the router events and the location effect.

  Parameters:
  - `config` — router config:
    - `:initialize-id` — required; event id handling router initialization.
    - `:location-changed-id` — required; event id handling browser location changes.
    - `:navigate-id` — required; event id handling in-app navigation.
    - `:activate-current-id` — optional; event id re-activating the current route.
    - `:set-location-fx-id` — optional; effect id that writes the browser location.
    - `:route-table`, `:route-activation-effects`, `:route-activation-context`,
      `:route-activation-scope`, `:route-path`, `:default-location`, `:current-location-fn` — as
      described on the events above.

  Returns: `{:ok? true}`.

  Throws `ex-info` when the removed `:route-load-effects` key is present or a required event id is
  missing."
  [config]
  (router-event/register-events! config))

(defn router-default-route
  "Matches the configured default location against the router's route table.

  Parameters:
  - `config` — router config; `:default-route` short-circuits the match, `:default-location`
    supplies the location, and `:route-table` supplies the specs.

  Returns: the configured default route, the route matching `:default-location` (default `\"#/\"`),
  or nil."
  [config]
  (router-sub/default-route config))

(defn router-sub-route
  "Reads the current matched route, falling back to the default route.

  Parameters:
  - `config` — router config; `:route-path` selects the app-db path, defaulting to `[:route]`.
  - `db` — app-db to read.

  Returns: the stored route, or `router-default-route` when nothing is stored yet."
  [config db]
  (router-sub/route config db))

(defn router-sub-nav-model
  "Builds the nav model of a matched route through the router's route table.

  Parameters:
  - `config` — router config carrying `:route-table`.
  - `matched-route` — matched route map.

  Returns: navigation model as described on `router-nav-model`."
  [config matched-route]
  (router-sub/nav-model config matched-route))

(defn router-sub-page-model
  "Builds the page model of a matched route through the router's route table.

  Parameters:
  - `config` — router config carrying `:route-table`.
  - `matched-route` — matched route map.

  Returns: page model as described on `router-page-model`."
  [config matched-route]
  (router-sub/page-model config matched-route))

(defn router-register-subs!
  "Registers the route, nav-model, and page-model subscriptions.

  Parameters:
  - `config` — router config:
    - `:route-id` — required; subscription id yielding the current route.
    - `:nav-model-id` — required; subscription id yielding the nav model.
    - `:page-model-id` — required; subscription id yielding the page model.
    - `:route-table`, `:route-path`, `:default-route`, `:default-location` — as described above.

  Returns: `{:ok? true}`.

  Throws `ex-info` when a subscription id is missing."
  [config]
  (router-sub/register-subs! config))

(defn navbar-nav-link-attrs
  "Builds route, active-state, and accessibility attributes for one nav item.

  Parameters:
  - `item` — router nav item; only these keys are read:
    - `:id` — route id, rendered as `data-route-id`.
    - `:href` — target href.
    - `:active?` — whether the item is in the active nav branch; rendered as `data-active`.
    - `:current?` — whether the item is the current route; renders `aria-current=\"page\"` when true.
  - `opts` — link styling:
    - `:class` — optional class applied to the anchor.
    - `:attrs` — optional attribute map merged over the generated attributes.

  Returns: attribute map for an `<a>` element."
  [item opts]
  (navbar/nav-link-attrs item opts))

(defn navbar-nav-link
  "Renders one navigation link from a router nav item.

  Parameters:
  - `item` — router nav item:
    - `:label` — link text.
    - `:id`, `:href`, `:active?`, `:current?` — see `navbar-nav-link-attrs`.
  - `opts` — optional link styling:
    - `:class` — optional class for the anchor.
    - `:attrs` — optional attribute map merged over the generated attributes.

  Returns: `[:a attrs label]` Hiccup vector."
  ([item]
   (navbar/nav-link item))
  ([item opts]
   (navbar/nav-link item opts)))

(defn navbar-nav
  "Renders a navigation region from router nav items.

  Parameters:
  - `items` — sequence of router nav items (see `navbar-nav-link`); each is rendered as a link.
  - `opts` — optional region options:
    - `:class` — optional class for the `<nav>` element.
    - `:aria-label` — accessible name of the navigation region.
    - `:attrs` — optional attribute map merged onto the `<nav>` element.
    - `:link-options` — options map passed to `navbar-nav-link` for every item.

  Returns: `[:nav ...]` Hiccup vector."
  ([items]
   (navbar/nav items))
  ([items opts]
   (navbar/nav items opts)))

(defn navbar-primary-nav
  "Renders the primary items from a router navigation model.

  Parameters:
  - `nav-model` — router navigation model; `:items` is the primary item sequence.
  - `opts` — optional nav options passed through to `navbar-nav` (`:class`, `:aria-label`,
    `:attrs`, `:link-options`).

  Returns: `[:nav ...]` Hiccup vector."
  ([nav-model]
   (navbar/primary-nav nav-model))
  ([nav-model opts]
   (navbar/primary-nav nav-model opts)))

(defn navbar-secondary-nav
  "Renders secondary router navigation when secondary items exist.

  Parameters:
  - `nav-model` — router navigation model; `:secondary-items` is read for the secondary item
    sequence.
  - `opts` — optional nav options passed through to `navbar-nav` (`:class`, `:aria-label`,
    `:attrs`, `:link-options`).

  Returns: `[:nav ...]` Hiccup vector, or nil when the model has no secondary items."
  ([nav-model]
   (navbar/secondary-nav nav-model))
  ([nav-model opts]
   (navbar/secondary-nav nav-model opts)))

(defn tabs-tab-button-attrs
  "Builds ARIA, active-state, disabled-state, and action attrs for one tab.

  Parameters:
  - `item` — tab item:
    - `:id` — tab id, rendered as `data-tab-id`.
    - `:active?` — renders `data-selected`, `aria-selected`, and the roving `tab-index`
      (`0` when active, `-1` otherwise).
    - `:disabled?` — renders the `disabled` attribute and skips the generated `:on-click`.
    - `:action` — optional tab activation action: handler function, dispatch vector, or sequence of
      dispatch vectors; ignored when `:attrs` already carries `:on-click` or the tab is disabled.
    - `:panel-id` — optional panel id, rendered as `aria-controls`.
    - `:tab-id` — optional DOM id for the button.
    - `:attrs` — optional attribute map merged over the generated attributes.
  - `opts` — optional styling:
    - `:class` — optional class prepended to any existing class.

  Returns: attribute map for a `<button role=\"tab\">`.

  Throws `ex-info` when a clicked action is none of handler, dispatch vector, or sequence of
  dispatch vectors."
  [item opts]
  (tabs/tab-button-attrs item opts))

(defn tabs-tab-button
  "Renders one tab button.

  Parameters:
  - `item` — tab item; `:label` is the button text, the rest is documented on
    `tabs-tab-button-attrs`.
  - `opts` — optional styling map (`:class`).

  Returns: `[:button attrs label]` Hiccup vector."
  ([item]
   (tabs/tab-button item))
  ([item opts]
   (tabs/tab-button item opts)))

(defn tabs-tab-list
  "Renders an accessible tablist and derives active items from `active-id`.

  Parameters:
  - `items` — sequence of tab items (`:id`, `:label`, `:action`, `:disabled?`, `:attrs`). An item's
    own `:active?` wins; otherwise it is active when `:active-id` equals its `:id`.
  - `opts` — tablist options:
    - `:active-id` — optional id of the active tab.
    - `:class` — optional class on the tablist element.
    - `:attrs` — optional attribute map merged onto the tablist element.
    - `:tab-options` — options map passed to every tab button.
    - `:aria-label` — accessible name of the tablist.

  Returns: `[:div role=\"tablist\" ...]` Hiccup vector."
  ([items]
   (tabs/tab-list items))
  ([items opts]
   (tabs/tab-list items opts)))

(defn tabs-tab-panel
  "Renders tab content in `panel-tag`, defaulting to a section.

  Parameters:
  - `content` — one Hiccup node or a sequence of nodes with the active tab's content.
  - `opts` — panel options:
    - `:class` — optional class on the panel element.
    - `:attrs` — optional attribute map merged onto the panel element.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.
    - `:tab-id` — optional id of the owning tab button, rendered as `aria-labelledby`.

  Returns: Hiccup vector rendering `role=\"tabpanel\"`."
  ([content]
   (tabs/tab-panel content))
  ([content opts]
   (tabs/tab-panel content opts)))

(defn tabs
  "Renders a caller-controlled tablist and active content panel.

  Parameters:
  - `tabs-options` — the tabs region:
    - `:items` — sequence of tab items (see `tabs-tab-list`).
    - `:active-id` — id of the active tab; the caller owns it and switches it through the tab
      actions.
    - `:content` — content of the active tab panel.
  - `options` — trailing keyword options (the vararg part of the call):
    - `:attrs` — optional attribute map merged onto the region element.
    - `:class` — optional class on the region element.
    - `:list-attrs` — optional attribute map for the tablist.
    - `:list-class` — optional class for the tablist.
    - `:tab-options` — options map passed to every tab button.
    - `:panel-attrs` — optional attribute map for the panel.
    - `:panel-class` — optional class for the panel.
    - `:panel-tag` — optional panel element tag; defaults to `:section`.
    - `:aria-label` — accessible name of the tablist.

  Returns: `[:div ...]` Hiccup vector containing the tablist and the active panel."
  [tabs-options & {:keys [attrs
                          class
                          list-attrs
                          list-class
                          tab-options
                          panel-attrs
                          panel-class
                          panel-tag
                          aria-label]}]
  (tabs/tabs tabs-options
             :attrs attrs
             :class class
             :list-attrs list-attrs
             :list-class list-class
             :tab-options tab-options
             :panel-attrs panel-attrs
             :panel-class panel-class
             :panel-tag panel-tag
             :aria-label aria-label))
