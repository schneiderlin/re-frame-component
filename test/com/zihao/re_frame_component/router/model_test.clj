(ns com.zihao.re-frame-component.router.model-test
  (:require
   [clojure.test :refer [deftest is]]
   [com.zihao.re-frame-component.router.model :as model]))

(def route-specs
  [{:id :app/home
    :segments ["home"]
    :nav {:label "Home"
          :order 0}}
   {:id :app/items
    :segments ["items"]
    :nav {:label "Items"
          :order 10}}
   {:id :app/item-detail
    :segments ["items" :item-id]
    :nav {:label "Detail"
          :parent :app/items
          :order 0
          :params {:item-id "alpha item"}
          :query {:tab "summary"}}}
   {:id :app/item-hidden
    :segments ["items" :item-id "hidden"]
    :nav {:parent :app/items}}
   {:id :app/settings
    :segments ["settings"]
    :nav {:label "Settings"
          :parent :app/items
          :order 1}}
   {:id :app/not-found
    :segments ["not-found"]}])

(def table
  (model/route-table route-specs
                     {:default-route-id :app/home
                      :not-found-route-id :app/not-found}))

(deftest matches-default-detail-and-not-found-routes
  (is (= {:id :app/home
          :path "/"
          :params {}
          :query {}
          :not-found? false}
         (model/match-location table "#/")))
  (is (= {:id :app/item-detail
          :path "/items/session%201"
          :params {:item-id "session 1"}
          :query {:tab "logs"}
          :not-found? false}
         (model/match-location table "#/items/session%201?tab=logs")))
  (is (= {:id :app/not-found
          :path "/missing/path"
          :params {}
          :query {:q "hello world"}
          :not-found? true}
         (model/match-location table "#/missing/path?q=hello%20world"))))

(deftest href-generation-encodes-params-sorts-query-and-reports-errors
  (is (= "#/items/session%201?a=1&b=2"
         (model/href table
                     :app/item-detail
                     {:item-id "session 1"}
                     {:b "2"
                      :skip nil
                      :a "1"})))
  (is (thrown-with-msg?
       clojure.lang.ExceptionInfo
       #"Missing route parameter"
       (model/href table :app/item-detail)))
  (is (thrown-with-msg?
       clojure.lang.ExceptionInfo
       #"Unknown route id"
       (model/href table :app/unknown))))

(deftest nav-model-derives-primary-secondary-and-parent-active-state
  (let [nav (:nav (model/page-model table
                                    (model/match-location table "#/items/beta")))
        items (some #(when (= :app/items (:id %)) %) (:items nav))
        detail (some #(when (= :app/item-detail (:id %)) %)
                     (:secondary-items nav))]
    (is (= :app/item-detail (:active-id nav)))
    (is (= :app/items (:active-parent-id nav)))
    (is (= true (:active? items)))
    (is (= false (:current? items)))
    (is (= true (:current? detail)))
    (is (= "#/items/alpha%20item?tab=summary" (:href detail)))))

(deftest hidden-child-routes-can-activate-visible-parents
  (let [nav (:nav (model/page-model table
                                    (model/match-location table "#/items/beta/hidden")))
        hidden-child (some #(when (= :app/item-hidden (:id %)) %)
                           (:secondary-items nav))]
    (is (= :app/item-hidden (:active-id nav)))
    (is (= :app/items (:active-parent-id nav)))
    (is (nil? hidden-child))))
