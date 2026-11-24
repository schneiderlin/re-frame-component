(ns com.zihao.re-frame-component.interface
  "Public API for the re-frame2 UI foundation: Playbook scene declarations and hash routes, plus
  the pure route model and route-activation semantics shared by every re-frame2 app."
  (:require
   [com.zihao.re-frame-component.playbook.model :as playbook-model]
   [com.zihao.re-frame-component.playbook.route :as playbook-route]
   [com.zihao.re-frame-component.router.activation :as router-activation]
   [com.zihao.re-frame-component.router.model :as router-model]
   [com.zihao.re-frame-component.ui.disclosure.model :as disclosure-model]))

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

(defn disclosure-markup
  "Returns the element tree of one disclosure without mounting it.

  The JVM half of `disclosure`: a `.cljc` renderer that must stay provable
  without a DOM builds the same elements a browser would mount. Parameters are
  the ones `disclosure` documents — `:open?`, `:trigger-children`,
  `:panel-children` and the painting maps.

  Returns: hiccup `[root attrs [trigger attrs [button attrs ...content]]
  [panel attrs ...content]]` for the shared element tags."
  [props]
  (disclosure-model/markup props))

(defn disclosure-chevron
  "The shared disclosure chevron, for a trigger's content.

  Parameters:
  - `attrs` — optional map merged onto the `<svg>`; pass the caller's class,
    whose paint rotates the glyph from the trigger's `data-open`.

  Returns: hiccup `<svg>` for one stroke chevron pointing right."
  ([]
   (disclosure-model/chevron))
  ([attrs]
   (disclosure-model/chevron attrs)))
