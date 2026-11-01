(ns com.zihao.re-frame-component.ui.filter-select.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.filter-select.model :as model]))

(deftest selectable-index-skips-disabled-options-and-wraps
  (let [options [{:id :offline :disabled? true}
                 {:id :first}
                 {:id :second}]
        opts {:option-disabled? :disabled?}]
    (is (= 1 (model/selectable-index options 0 1 opts)))
    (is (= 2 (model/selectable-index options 0 -1 opts)))
    (is (= 1 (model/selectable-index options 2 1 opts)))
    (testing "no option is selectable"
      (is (nil? (model/selectable-index [{:disabled? true}] 0 1 opts))))))
