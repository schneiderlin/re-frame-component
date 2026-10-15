(ns com.zihao.re-frame-component.interface
  (:require
   [com.zihao.re-frame-component.playbook.model :as playbook-model]
   [com.zihao.re-frame-component.playbook.registry :as playbook-registry]
   [com.zihao.re-frame-component.playbook.route :as playbook-route]
   [com.zihao.re-frame-component.playbook.shell :as playbook-shell]
   [com.zihao.re-frame-component.router.activation :as router-activation]
   [com.zihao.re-frame-component.router.event :as router-event]
   [com.zihao.re-frame-component.router.model :as router-model]
   [com.zihao.re-frame-component.router.sub :as router-sub]
   [com.zihao.re-frame-component.ui.filter-select.model :as filter-select-model]
   [com.zihao.re-frame-component.ui.filter-select.view :as filter-select-view]
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]
   [com.zihao.re-frame-component.ui.multi-step.view :as multi-step]
   [com.zihao.re-frame-component.ui.optional-range.model :as optional-range-model]
   [com.zihao.re-frame-component.ui.optional-range.view :as optional-range-view]
   [com.zihao.re-frame-component.ui.table-filter.model :as table-filter-model]
   [com.zihao.re-frame-component.ui.table-filter.view :as table-filter-view]
   [com.zihao.re-frame-component.ui.tag :as tag-view]
   [com.zihao.re-frame-component.ui.navbar :as navbar]
   [com.zihao.re-frame-component.ui.popup :as popup]
   [com.zihao.re-frame-component.ui.tabs :as tabs]))

(def playbook-scene-id playbook-model/scene-id)
(def playbook-normalize-scene playbook-model/normalize-scene)
(def playbook-module-scenes playbook-model/module-scenes)
(def playbook-filter-scenes playbook-model/filter-scenes)
(def playbook-clear! playbook-registry/clear!)
(def playbook-register-scene! playbook-registry/reg-scene!)
(def playbook-register-scenes! playbook-registry/reg-scenes!)
(def playbook-scene playbook-registry/scene)
(def playbook-scenes playbook-registry/scenes)
(def playbook-hash? playbook-route/playbook-hash?)
(def playbook-match-hash playbook-route/match-hash)
(def playbook-href playbook-route/href)
(def playbook-current-hash playbook-shell/current-hash)
(def playbook-catalog playbook-shell/catalog-shell)
(def playbook-mount! playbook-shell/mount!)
(def playbook-unmount! playbook-shell/unmount!)

(def popup-frame popup/popup-frame)

(def popup popup/popup)

(def ime-safe-input ime-safe/input)

(def ime-safe-textarea ime-safe/textarea)

(def filter-select-option-id filter-select-model/option-id)
(def filter-select-option-label filter-select-model/option-label)
(def filter-select-option-description filter-select-model/option-description)
(def filter-select-filter-options filter-select-model/filter-options)
(def filter-select-selected-option filter-select-model/selected-option)
(def filter-select filter-select-view/filter-select)

(def multi-step-trigger-attrs multi-step/step-trigger-attrs)
(def multi-step-trigger multi-step/step-trigger)
(def multi-step-timeline multi-step/timeline)
(def multi-step-panel multi-step/step-panel)
(def multi-step multi-step/multi-step)

(def optional-range-state optional-range-model/range-state)
(def optional-range-input-id optional-range-model/input-id)
(def optional-range-filter optional-range-view/optional-range-filter)

(def table-filter-default-type-definitions table-filter-model/default-type-definitions)
(def table-filter-operators-for-field table-filter-model/operators-for-field)
(def table-filter-repeatable-field? table-filter-model/repeatable-field?)
(def table-filter-available-fields table-filter-model/available-fields)
(def table-filter-draft-for-field table-filter-model/draft-for-field)
(def table-filter-valid-condition? table-filter-model/valid-condition?)
(def table-filter-with-operator table-filter-model/with-operator)
(def table-filter-add-condition table-filter-model/add-condition)
(def table-filter-replace-condition table-filter-model/replace-condition)
(def table-filter-remove-condition table-filter-model/remove-condition)
(def table-filter-clear-conditions table-filter-model/clear-conditions)
(def table-filter-builder table-filter-view/table-filter-builder)

(def tag tag-view/tag)

(def router-activation-route-key router-activation/route-key)
(def router-activation-same-route? router-activation/same-route?)
(def router-activation-transition router-activation/transition)
(def router-route-table router-model/route-table)
(def router-spec-by-id router-model/spec-by-id)
(def router-encode-component router-model/encode-component)
(def router-decode-component router-model/decode-component)
(def router-normalize-fragment router-model/normalize-fragment)
(def router-split-query router-model/split-query)
(def router-path-segments router-model/path-segments)
(def router-parse-query-pair router-model/parse-query-pair)
(def router-parse-query router-model/parse-query)
(def router-encode-query-entry router-model/encode-query-entry)
(def router-render-query router-model/render-query)
(def router-match-segments router-model/match-segments)
(def router-match-route router-model/match-route)
(def router-match-location router-model/match-location)
(def router-path-for-route router-model/path-for-route)
(def router-href router-model/href)
(def router-spec-for-route router-model/spec-for-route)
(def router-primary-route-ids router-model/primary-route-ids)
(def router-active-nav-state router-model/active-nav-state)
(def router-nav-href router-model/nav-href)
(def router-nav-item router-model/nav-item)
(def router-nav-model router-model/nav-model)
(def router-page-model router-model/page-model)
(def router-route-location router-model/route-location)

(def router-set-location-fx-id router-event/set-location-fx-id)
(def router-current-location router-event/current-location)
(def router-route router-event/route)
(def router-assoc-route router-event/assoc-route)
(def router-event-match-location router-event/match-location)
(def router-activation-event-transition router-event/activation-transition)
(def router-activation-effects router-event/route-activation-effects)
(def router-initialize-effects router-event/initialize-effects)
(def router-location-changed-effects router-event/location-changed-effects)
(def router-navigate-effects router-event/navigate-effects)
(def router-reactivate-effects router-event/reactivate-effects)
(def router-install-location-listener! router-event/install-location-listener!)
(def router-register-events! router-event/register-events!)

(def router-default-route router-sub/default-route)
(def router-sub-route router-sub/route)
(def router-sub-nav-model router-sub/nav-model)
(def router-sub-page-model router-sub/page-model)
(def router-register-subs! router-sub/register-subs!)

(def navbar-nav-link-attrs navbar/nav-link-attrs)
(def navbar-nav-link navbar/nav-link)
(def navbar-nav navbar/nav)
(def navbar-primary-nav navbar/primary-nav)
(def navbar-secondary-nav navbar/secondary-nav)

(def tabs-tab-button-attrs tabs/tab-button-attrs)
(def tabs-tab-button tabs/tab-button)
(def tabs-tab-list tabs/tab-list)
(def tabs-tab-panel tabs/tab-panel)
(def tabs tabs/tabs)
