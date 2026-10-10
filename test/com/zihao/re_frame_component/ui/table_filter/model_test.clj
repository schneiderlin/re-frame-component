(ns com.zihao.re-frame-component.ui.table-filter.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.table-filter.model :as model]))

(def fields
  [{:id :name
    :operators [{:id :name/contains
                 :editor :text}
                {:id :name/equals
                 :editor :text}
                {:id :name/in
                 :editor :multi-select}]
    :default-operator-id :name/equals}
   {:id :tags
    :operators [{:id :tags/any
                 :editor :multi-select}]}
   {:id :status
    :type :single-select
    :repeatable? false}
   {:id :archived
    :operators [{:id :archived/empty
                 :editor :none}]}])

(deftest field-selection-creates-an-uncommitted-draft
  (is (= {:field-id :name
          :operator-id :name/equals
          :value ""}
         (model/draft-for-field (first fields)))))

(deftest caller-options-infer-native-select-editors
  (testing "options default to a single select"
    (is (= {:field-id :owner
            :operator-id :select/equals
            :value ""}
           (model/draft-for-field
            {:id :owner
             :options [{:id :ada :label "Ada"}]}))))
  (testing "multiple option fields default to a multi-select value"
    (is (= {:field-id :tags
            :operator-id :set/includes-any
            :value []}
           (model/draft-for-field
            {:id :tags
             :multiple? true
             :options [{:id "vip" :label "VIP"}]})))))

(deftest option-selection-preserves-caller-owned-id-types-and-order
  (let [options [{:id :vip} {:id ":vip"} {:id 42}]]
    (is (= :vip (model/option-id-by-dom-value options "option-0")))
    (is (= ":vip" (model/option-id-by-dom-value options "option-1")))
    (is (= ["option-1" "option-2"]
           (model/selected-option-dom-values options [42 ":vip"])))
    (is (= [":vip" 42]
           (model/selected-option-ids options ["option-2" "option-1"])))
    (is (= []
           (model/selected-option-ids options ["unknown"])))))

(deftest field-type-supplies-editor-for-localized-custom-operators
  (let [field {:id :tags
               :type :multi-select
               :options [{:id "vip" :label "VIP"}]
               :operators [{:id :tags/any :label "包含任一"}]}
        operator (first (model/operators-for-field field))]
    (is (= :multi-select (model/editor-kind operator)))
    (is (= [] (:value (model/draft-for-field field)))))
  (testing "type-definition operator overrides retain the default editor"
    (let [field {:id :tags :type :multi-select :options []}
          operator (first
                    (model/operators-for-field
                     field
                     {:multi-select
                      {:operators [{:id :tags/none :label "不包含"}]}}))]
      (is (= :multi-select (model/editor-kind operator))))))

(deftest operator-changes-preserve-only-compatible-values
  (let [condition {:id "condition-1"
                   :field-id :name
                   :operator-id :name/contains
                   :value "Ada"}
        field (first fields)]
    (testing "operators using the same editor preserve the entered value"
      (is (= "Ada"
             (:value (model/with-operator condition field :name/equals)))))
    (testing "changing editor kind resets the value to that editor's empty value"
      (is (= []
             (:value (model/with-operator condition field :name/in)))))))

(deftest validity-follows-the-selected-operator-editor
  (is (not (model/valid-condition? {:field-id :name
                                    :operator-id :name/contains
                                    :value "  "}
                                   fields)))
  (is (model/valid-condition? {:field-id :tags
                               :operator-id :tags/any
                               :value [:vip]}
                              fields))
  (is (not (model/valid-condition? {:field-id :tags
                                    :operator-id :tags/any
                                    :value []}
                                   fields)))
  (is (model/valid-condition? {:field-id :archived
                               :operator-id :archived/empty
                               :value nil}
                              fields)))

(deftest condition-collection-transitions-use-condition-identity
  (let [first-condition {:id "condition-1"
                         :field-id :name
                         :operator-id :name/equals
                         :value "Ada"}
        second-condition {:id "condition-2"
                          :field-id :name
                          :operator-id :name/contains
                          :value "Lovelace"}
        conditions [first-condition second-condition]
        updated (assoc second-condition :value "Byron")]
    (is (= [first-condition updated]
           (model/replace-condition conditions updated)))
    (is (= [second-condition]
           (model/remove-condition conditions "condition-1")))
    (is (= [] (model/clear-conditions conditions)))
    (is (= [first-condition second-condition]
           (model/add-condition [first-condition] second-condition)))
    (is (thrown? clojure.lang.ExceptionInfo
                 (model/add-condition conditions first-condition)))))

(deftest multi-select-values-toggle-without-duplicates
  (is (= [:vip :paid]
         (model/toggle-selected-value [:vip] :paid)))
  (is (= [:paid]
         (model/toggle-selected-value [:vip :paid] :vip))))

(deftest single-select-default-requires-one-value
  (let [field (model/field-by-id fields :status)
        draft (model/draft-for-field field)]
    (is (= {:field-id :status
            :operator-id :select/equals
            :value ""}
           draft))
    (is (not (model/valid-condition? draft fields)))
    (is (model/valid-condition? (assoc draft :value :online) fields))))

(deftest range-type-supports-independent-optional-bounds
  (let [field {:id :contact-count :type :range}
        draft (model/draft-for-field field)]
    (is (= {:field-id :contact-count
            :operator-id :range/between
            :value {:lower "" :upper ""}}
           draft))
    (is (not (model/valid-condition? draft [field])))
    (is (model/valid-condition?
         (assoc draft :value {:lower "0" :upper ""}) [field]))
    (is (model/valid-condition?
         (assoc draft :value {:lower "" :upper "10"}) [field]))
    (is (model/valid-condition?
         (assoc draft :value {:lower "0" :upper "10"}) [field]))))

(deftest non-repeatable-fields-are-hidden-after-use
  (let [condition {:id "condition-1"
                   :field-id :status
                   :operator-id :select/equals
                   :value :online}]
    (is (= #{:name :tags :archived}
           (set (map :id (model/available-fields fields [condition])))))
    (is (= #{:name :tags :status :archived}
           (set (map :id (model/available-fields fields [])))))))
