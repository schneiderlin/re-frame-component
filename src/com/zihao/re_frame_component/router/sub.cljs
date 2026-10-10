(ns com.zihao.re-frame-component.router.sub
  "Parameterized router subscriptions."
  (:require
   [com.zihao.re-frame-component.router.model :as model]
   [re-frame.core :as rf]))

(defn- route-path
  [config]
  (or (:route-path config) [:route]))

(defn default-route
  [config]
  (or (:default-route config)
      (model/match-location (:route-table config)
                            (or (:default-location config) "#/"))))

(defn route
  [config db]
  (or (get-in db (route-path config))
      (default-route config)))

(defn nav-model
  [config matched-route]
  (model/nav-model (:route-table config) matched-route))

(defn page-model
  [config matched-route]
  (model/page-model (:route-table config) matched-route))

(defn register-subs!
  [{:keys [route-id nav-model-id page-model-id] :as config}]
  (doseq [[attr sub-id] {:route-id route-id
                         :nav-model-id nav-model-id
                         :page-model-id page-model-id}]
    (when-not sub-id
      (throw (ex-info "Router subscription id is required" {:attr attr}))))
  (rf/reg-sub
   route-id
   (fn [db _query]
     (route config db)))
  (rf/reg-sub
   nav-model-id
   :<- [route-id]
   (fn [matched-route _query]
     (nav-model config matched-route)))
  (rf/reg-sub
   page-model-id
   :<- [route-id]
   (fn [matched-route _query]
     (page-model config matched-route)))
  {:ok? true})
