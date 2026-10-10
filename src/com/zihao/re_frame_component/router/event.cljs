(ns com.zihao.re-frame-component.router.event
  "Parameterized re-frame2 hash router bridge."
  (:require
   [com.zihao.re-frame-component.router.activation :as activation]
   [com.zihao.re-frame-component.router.model :as model]
   [re-frame.core :as rf]))

(def set-location-fx-id ::set-location)

(defonce installed-listeners* (atom #{}))

(defn current-location
  []
  (or (.. js/window -location -hash) "#/"))

(defn- route-path
  [config]
  (or (:route-path config) [:route]))

(defn route
  [config db]
  (get-in db (route-path config)))

(defn assoc-route
  [config db matched-route]
  (assoc-in db (route-path config) matched-route))

(defn- set-location-effect-id
  [config]
  (or (:set-location-fx-id config) set-location-fx-id))

(defn- current-location*
  [config]
  (if-let [current-location-fn (:current-location-fn config)]
    (current-location-fn)
    (current-location)))

(defn- location-or-current
  [config location]
  (or location (current-location* config) (:default-location config) "#/"))

(defn match-location
  [config location]
  (model/match-location (:route-table config) location))

(defn activation-transition
  [config db reason previous-route matched-route]
  (activation/transition
   {:reason reason
    :previous-route previous-route
    :route matched-route
    :context (when-let [context-fn (:route-activation-context config)]
               (context-fn db))
    :scope-fn (:route-activation-scope config)}))

(defn route-activation-effects
  [config db reason previous-route matched-route]
  (if-let [planner (:route-activation-effects config)]
    (let [transition (activation-transition config
                                            db
                                            reason
                                            previous-route
                                            matched-route)]
      (if (:activate? transition)
        (vec (or (planner transition) []))
        []))
    []))

(defn initialize-effects
  [config {:keys [db]} [_ location]]
  (let [previous-route (route config db)
        matched-route (match-location config (location-or-current config location))]
    {:db (assoc-route config db matched-route)
     :fx (route-activation-effects config
                                   db
                                   :initialize
                                   previous-route
                                   matched-route)}))

(defn location-changed-effects
  [config {:keys [db]} [_ location]]
  (let [previous-route (route config db)
        matched-route (match-location config location)]
    {:db (assoc-route config db matched-route)
     :fx (route-activation-effects config
                                   db
                                   :location-changed
                                   previous-route
                                   matched-route)}))

(defn navigate-effects
  [config {:keys [db]} [_ route-id params query]]
  (let [target (model/href (:route-table config) route-id (or params {}) (or query {}))
        previous-route (route config db)
        matched-route (match-location config target)]
    {:db (assoc-route config db matched-route)
     :fx (conj (route-activation-effects config
                                         db
                                         :navigate
                                         previous-route
                                         matched-route)
               [(set-location-effect-id config) target])}))

(defn reactivate-effects
  [config {:keys [db]} _event]
  (let [current-route (route config db)]
    {:db db
     :fx (route-activation-effects config
                                   db
                                   :reactivate
                                   current-route
                                   current-route)}))

(defn install-location-listener!
  [{:keys [location-changed-id listener-id] :as config}]
  (let [listener-key (or listener-id location-changed-id)]
    (when-not (contains? @installed-listeners* listener-key)
      (.addEventListener js/window
                         "hashchange"
                         #(rf/dispatch [location-changed-id (current-location* config)]))
      (swap! installed-listeners* conj listener-key)))
  {:ok? true})

(defn register-events!
  [{:keys [initialize-id location-changed-id navigate-id activate-current-id]
    :as config}]
  (when (:route-load-effects config)
    (throw (ex-info "Use :route-activation-effects instead of :route-load-effects"
                    {:config-key :route-load-effects})))
  (doseq [[attr event-id] {:initialize-id initialize-id
                           :location-changed-id location-changed-id
                           :navigate-id navigate-id}]
    (when-not event-id
      (throw (ex-info "Router event id is required" {:attr attr}))))
  (rf/reg-event
   initialize-id
   (fn [cofx event]
     (initialize-effects config cofx event)))
  (rf/reg-event
   location-changed-id
   (fn [cofx event]
     (location-changed-effects config cofx event)))
  (rf/reg-event
   navigate-id
   (fn [cofx event]
     (navigate-effects config cofx event)))
  (when activate-current-id
    (rf/reg-event
     activate-current-id
     (fn [cofx event]
       (reactivate-effects config cofx event))))
  (rf/reg-fx
   (set-location-effect-id config)
   (fn [_ctx target]
     (set! (.. js/window -location -hash) target)))
  {:ok? true})
