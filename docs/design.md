# Component boundaries

These contracts preserve the original component's behavior. Extraction changes
packaging, not public namespaces, event semantics or UI behavior.

## Application ownership

Applications own app-db paths, business validation, resource loading,
persistence, query translation, localization and styling. Components expose
stable semantic attributes and callbacks, not a cross-application theme.
Components that accept re-frame action vectors use the host's configured frame.

## Web UI Playbook

The Playbook owns generic Catalog, Stage, registry, route, lifecycle, stylesheet,
and browser-inspection behavior. Apps own deterministic fixtures, Scene
declarations, catalog aggregation, and startup routing. Scene declarations are
data rather than runtime closures and name real registered re-frame2 views.

Every selected Scene receives a new re-frame2 frame. Unmounting destroys that
exact frame. Catalog controls do not live in Scene app-db, and mounting the
Playbook must not start product authentication, routing, resource loading, or
WebSocket effects.

## Multi-step flows

The model derives complete, active and upcoming states from ordered steps,
falling back to the first step for an absent or unknown active id. Only completed
steps have timeline actions. Current and future steps cannot be clicked to skip
validation. The host owns forward gating, active state, content and submission;
disabled buttons are not the business authorization boundary.

## Optional ranges

Lower and upper bounds are independently optional. Controls expose stable bound
ids and empty, lower-only, upper-only and bounded states. Hosts parse values,
convert time zones and validate ordering. The component neither clamps nor
reorders bounds and does not invent an absent minimum or maximum.

## Dynamic table filters

Applied conditions are controlled vectors with independent condition ids:

```clojure
{:id "condition-42"
 :field-id :tags
 :operator-id :set/includes-any
 :value [:vip :paid]}
```

Field selection and incomplete configuration stay component-local. Callbacks
emit the complete next vector and action metadata. Default editors cover text,
single-select, multi-select and ranges; hosts supply operators, options, copy
and custom renderers. Compatible editors preserve values when operators change;
incompatible editors clear them. Non-repeatable fields are unavailable while
an applied condition uses them. Range conditions require at least one bound.

The host owns AND/OR semantics, numeric/date parsing, ordering policy, request
timing and backend predicates. The builder does not filter returned rows or
dispatch resource effects. Cancellation restores focus; outside clicks
deliberately keep the editor's draft open.

## Routing and navigation

Prefer native re-frame2 routing for new apps. The legacy custom hash router
remains for existing consumers; generic navbar primitives remain reusable.
Applications supply route specs, page content and route activation planners.
The library supplies matching, encoding, navigation models and the legacy
hashchange bridge. Route activation planners are pure and return app-owned
effects using readiness context and page scope. Duplicate hashchange events
for a route already selected by navigation do not activate it twice.

Initial reads follow route activation, not indiscriminate application startup
or view mount hooks. Hosts retain ownership of refresh, mutations, cache policy,
polling and WebSockets. No product routes or resource identifiers are built in.
