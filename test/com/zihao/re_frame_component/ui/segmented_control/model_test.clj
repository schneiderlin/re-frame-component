(ns com.zihao.re-frame-component.ui.segmented-control.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.segmented-control.model :as model]))

(def levels
  [{:value 25 :label "不太确定"}
   {:value 60 :label "有些把握"}
   {:value 90 :label "很有把握"}])

(defn- item-elements
  "The item elements of a markup tree: everything after the root and its attrs,
   and after the optional indicator."
  [markup]
  (let [children (drop 2 markup)]
    (if (= (keyword model/indicator-tag) (ffirst children))
      (rest children)
      children)))

(deftest markup-is-a-group-with-one-item-per-choice
  (let [markup (model/markup {:id "confidence" :items levels})
        [tag attrs] markup]
    (is (= (keyword model/root-tag) tag))
    (is (= "ui-segmented-control" model/root-tag))
    (is (= {:id "confidence"} attrs))
    (is (= "ui-segmented-control-item" model/item-tag))
    (testing "every choice becomes an item element carrying its stringified value"
      (is (= [[(keyword model/item-tag) {:value "25"} "不太确定"]
              [(keyword model/item-tag) {:value "60"} "有些把握"]
              [(keyword model/item-tag) {:value "90"} "很有把握"]]
             (mapv vec (item-elements markup)))))))

(deftest markup-merges-caller-attributes-on-the-right-part
  (let [[_ root] (model/markup {:id "confidence" :items levels
                                :attrs {:class "scale"
                                        :data-action "learning/select-confidence"}})
        [first-item] (item-elements (model/markup {:id "confidence"
                                                   :items levels
                                                   :item-attrs {:class "segment"}}))]
    (testing "the root keeps the caller's class and data attributes"
      (is (= {:id "confidence"
              :class "scale"
              :data-action "learning/select-confidence"}
             root)))
    (testing "shared item attributes land on every item"
      (is (= {:class "segment" :value "25"} (second first-item))))))

(deftest markup-puts-an-item-override-over-the-shared-attributes
  (let [items (item-elements
               (model/markup {:id "c"
                              :items (assoc-in levels [2 :attrs] {:class "segment-last"})
                              :item-attrs {:class "segment"}}))]
    (is (= {:class "segment-last" :value "90"} (second (last items))))))

(deftest markup-adds-the-indicator-only-on-request
  (testing "the indicator is the group's first child when asked for"
    (let [[_ _ indicator] (model/markup {:id "c" :items levels :indicator? true})]
      (is (= (keyword model/indicator-tag) (first indicator)))
      (is (= "ui-segmented-control-indicator" model/indicator-tag))))
  (testing "and absent otherwise"
    (let [[_ _ first-child] (model/markup {:id "c" :items levels})]
      (is (= (keyword model/item-tag) (first first-child))))))

(deftest markup-renders-the-group-state-as-absence-or-attribute
  (testing "an enabled control renders neither attribute"
    (let [[_ attrs] (model/markup {:id "c" :items levels})]
      (is (not (contains? attrs :disabled)))
      (is (not (contains? attrs :read-only)))))
  (testing "disabled and read-only are present-and-empty, the form the element reads"
    (let [[_ attrs] (model/markup {:id "c" :items levels
                                   :disabled? true :read-only? true})]
      (is (= "" (:disabled attrs)))
      (is (= "" (:read-only attrs)))))
  (testing "one disabled item does not disable the group"
    (let [[_ group-attrs] (model/markup {:id "c"
                                         :items (assoc-in levels [0 :disabled?] true)})]
      (is (not (contains? group-attrs :disabled))))
    (let [[item] (item-elements (model/markup {:id "c"
                                               :items (assoc-in levels [0 :disabled?] true)}))]
      (is (= "" (:disabled (second item)))))))

(deftest markup-never-renders-the-controlled-value-or-driver-props
  (testing "value, handlers and parser stay out of the DOM"
    (let [[_ attrs] (model/markup {:id "c"
                                   :items levels
                                   :value 60
                                   :on-change (fn [_])
                                   :parse-value identity
                                   :attrs {:class "scale"}})]
      (is (= {:id "c" :class "scale"} attrs))))
  (testing "an item's Clojure-only props never leak into its attributes"
    (let [[item] (item-elements (model/markup {:id "c"
                                               :items [(first levels)]}))]
      (is (= {:value "25"} (second item)))
      (is (= "不太确定" (last item))))))
