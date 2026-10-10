(ns com.zihao.re-frame-component.router.activation-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.router.activation :as activation]))

(defn- route
  ([id path]
   (route id path {}))
  ([id path params]
   {:id id
    :path path
    :params params
    :query {}
    :not-found? false}))

(defn- scope
  [route]
  (case (:id route)
    (:items :item-detail) :items
    (:settings :setting-detail) :settings
    nil))

(deftest classifies-page-entry-and-in-page-route-change
  (let [items (route :items "/items")
        detail (route :item-detail "/items/42" {:item-id "42"})
        entered (activation/transition {:reason :initialize
                                        :previous-route nil
                                        :route items
                                        :scope-fn scope})
        changed (activation/transition {:reason :navigate
                                        :previous-route items
                                        :route detail
                                        :scope-fn scope})]
    (testing "initialization enters the active page scope"
      (is (true? (:activate? entered)))
      (is (true? (:entering-scope? entered)))
      (is (= :items (:scope entered))))
    (testing "detail navigation changes route without re-entering the page"
      (is (true? (:activate? changed)))
      (is (true? (:route-changed-within-scope? changed)))
      (is (false? (:entering-scope? changed))))))

(deftest classifies-page-leave-and-entry
  (let [transition (activation/transition
                    {:reason :navigate
                     :previous-route (route :items "/items")
                     :route (route :settings "/settings")
                     :scope-fn scope})]
    (is (true? (:activate? transition)))
    (is (true? (:scope-changed? transition)))
    (is (true? (:leaving-scope? transition)))
    (is (true? (:entering-scope? transition)))
    (is (= :items (:previous-scope transition)))
    (is (= :settings (:scope transition)))))

(deftest suppresses-duplicate-location-change
  (let [current (route :item-detail "/items/42" {:item-id "42"})
        transition (activation/transition
                    {:reason :location-changed
                     :previous-route current
                     :route current
                     :scope-fn scope})]
    (is (false? (:route-changed? transition)))
    (is (false? (:activate? transition)))))

(deftest explicit-reactivation-activates-the-current-route
  (let [current (route :items "/items")
        context {:ready? true :role :admin}
        transition (activation/transition
                    {:reason :reactivate
                     :previous-route current
                     :route current
                     :context context
                     :scope-fn scope})]
    (is (true? (:reactivate? transition)))
    (is (true? (:activate? transition)))
    (is (false? (:entering-scope? transition)))
    (is (= context (:context transition)))))
