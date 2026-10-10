(ns com.zihao.re-frame-component.ui.optional-range.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.optional-range.model :as model]))

(deftest optional-bounds-have-independent-states
  (testing "neither bound is required"
    (is (= :empty (model/range-state "" nil))))
  (testing "each one-sided range is distinct"
    (is (= :lower-only (model/range-state "0" "")))
    (is (= :upper-only (model/range-state nil "3"))))
  (testing "two present values form a bounded range"
    (is (= :bounded (model/range-state "0" "3")))))

(deftest bound-input-ids-are-stable
  (is (= "broadcast-count-lower"
         (model/input-id "broadcast-count" :lower)))
  (is (= "broadcast-count-upper"
         (model/input-id "broadcast-count" :upper))))
