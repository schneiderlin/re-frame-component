(ns com.zihao.re-frame-component.ui.tree.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.tree.model :as model]))

(defn- row
  "A row element as the caller builds it: a label part with its own content."
  [value title & children]
  (model/item {:value value
               :label title
               :children (into [(model/label [title])] children)}))

(deftest root-carries-structure-but-not-state
  (let [[tag attrs] (model/markup {:id "threads"
                                  :mode :single
                                  :current "t-2"
                                  :expand-on-press? false
                                  :children []})]
    (is (= (keyword model/root-tag) tag))
    (is (= "ui-tree" model/root-tag))
    (testing "structure an attribute can express is an attribute"
      (is (= {:id "threads" :mode "single" :current "t-2"
              :expand-on-press "false"}
             attrs)))
    (testing "the controlled selection and expansion are live state, never attributes"
      (let [[_ attrs] (model/markup {:value "t-1"
                                    :expanded ["t-1"]
                                    :on-value-change identity
                                    :on-expanded-change identity})]
        (is (= {} attrs))))))

(deftest a-branch-renders-its-children-in-a-group
  (let [markup (model/markup
                {:children
                 [(model/item
                   {:value "t-1"
                    :branch? true
                    :label "Parent"
                    :children [(model/indicator)
                               (model/label ["Parent"])
                               (model/group [(row "t-2" "Child")])]})]})
        [root-name root-attrs parent] markup
        [parent-name parent-attrs indicator label group] parent]
    (is (= (keyword model/root-tag) root-name))
    (is (= {} root-attrs))
    (is (= (keyword model/item-tag) parent-name))
    (testing "a row keys itself by string and says whether it is a branch"
      (is (= {:value "t-1" :branch "" :label "Parent"} parent-attrs)))
    (testing "the indicator is a part of the row, and the group is the nesting"
      (is (= (keyword model/indicator-tag) (first indicator)))
      (is (= [{}] (rest indicator)))
      (is (= (keyword model/label-tag) (first label)))
      (is (= ["Parent"] (drop 2 label)))
      (is (= (keyword model/group-tag) (first group))))
    (testing "a child row nests inside the group"
      (is (= [(keyword model/item-tag)]
             (mapv first (drop 2 group)))))))

(deftest a-leaf-row-neither-branches-nor-labels-for-typeahead
  (let [[_ attrs] (model/item {:value "t-3" :label "  "})]
    (is (= {:value "t-3"} attrs))
    (is (nil? (:branch attrs)))
    (is (nil? (:disabled attrs)))))

(deftest caller-attributes-land-on-the-right-part
  (let [[_ root] (model/markup {:attrs {:class "thread-tree" :data-group "w-1"}
                                :children []})
        [_ item] (model/item {:value "t-1"
                              :attrs {:class "thread-row" :data-thread-id "t-1"}
                              :children []})
        [_ indicator] (model/indicator {:class "branch-toggle"})
        [_ group] (model/group {:class "branch-children"} [])]
    (testing "the root and the row keep the caller's painting hooks"
      (is (= "thread-tree" (:class root)))
      (is (= "w-1" (:data-group root)))
      (is (= "thread-row" (:class item)))
      (is (= "t-1" (:data-thread-id item))))
    (testing "a row's own attributes survive the row's element attributes"
      (is (= "t-1" (:value item))))
    (testing "the parts the caller paints keep their classes"
      (is (= "branch-toggle" (:class indicator)))
      (is (= "branch-children" (:class group))))))

(deftest expand-on-press-is-a-value-not-a-presence-flag
  (testing "ui-sdk reads a boolean attribute by value, so false must be spelled out"
    (is (= "false" (:expand-on-press (second (model/markup {:expand-on-press? false})))))
    (is (= "true" (:expand-on-press (second (model/markup {:expand-on-press? true}))))))
  (testing "an omitted option keeps the element's own default"
    (is (nil? (:expand-on-press (second (model/markup {})))))))
