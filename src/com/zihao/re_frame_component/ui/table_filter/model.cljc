(ns com.zihao.re-frame-component.ui.table-filter.model
  (:require
   [clojure.string :as str]))

(def default-type-definitions
  {:text
   {:editor :text
    :operators
    [{:id :text/contains
      :label "contains keyword"
      :editor :text}
     {:id :text/equals
      :label "is exactly"
      :editor :text}]}

   :multi-select
   {:editor :multi-select
    :operators
    [{:id :set/includes-any
      :label "includes any"
      :editor :multi-select}
     {:id :set/includes-all
      :label "includes all"
      :editor :multi-select}
     {:id :set/includes-none
      :label "includes none"
      :editor :multi-select}]}

   :single-select
   {:editor :single-select
    :operators
    [{:id :select/equals
      :label "is exactly"
      :editor :single-select}]}

   :range
   {:editor :range
    :operators
    [{:id :range/between
      :label "is between"
      :editor :range}]}})

(defn type-definitions
  [overrides]
  (merge-with merge default-type-definitions (or overrides {})))

(defn field-id
  [field]
  (:id field))

(defn field-label
  [field]
  (or (:label field) (field-id field) ""))

(defn field-by-id
  [fields id]
  (first (filter #(= id (field-id %)) (or fields []))))

(defn field-type
  [field]
  (or (:type field)
      (when (contains? field :options)
        (if (true? (:multiple? field))
          :multi-select
          :single-select))))

(defn repeatable-field?
  [field]
  (not= false (:repeatable? field)))

(defn operators-for-field
  ([field]
   (operators-for-field field nil))
  ([field type-definition-overrides]
   (let [definitions (type-definitions type-definition-overrides)
         type-definition (get definitions (field-type field))
         default-editor (:editor type-definition)]
     (mapv (fn [operator]
             (cond-> operator
               (and default-editor
                    (not (contains? operator :editor))
                    (not (contains? operator :value-kind)))
               (assoc :editor default-editor)))
           (or (:operators field)
               (:operators type-definition)
               [])))))

(defn option-dom-value
  [index]
  (str "option-" index))

(defn option-id-by-dom-value
  [options value]
  (some (fn [[index option]]
          (when (= (str value) (option-dom-value index))
            (:id option)))
        (map-indexed vector (or options []))))

(defn selected-option-dom-values
  [options option-ids]
  (let [selected-option-ids (set (or option-ids []))]
    (->> (or options [])
         (map-indexed vector)
         (keep (fn [[index option]]
                 (when (contains? selected-option-ids (:id option))
                   (option-dom-value index))))
         vec)))

(defn selected-option-ids
  [options values]
  (let [selected-dom-values (set (map str (or values [])))]
    (->> (or options [])
         (map-indexed vector)
         (keep (fn [[index option]]
                 (when (contains? selected-dom-values
                                  (option-dom-value index))
                   (:id option))))
         vec)))

(defn operator-by-id
  ([field operator-id]
   (operator-by-id field operator-id nil))
  ([field operator-id type-definition-overrides]
   (first
    (filter #(= operator-id (:id %))
            (operators-for-field field type-definition-overrides)))))

(defn operator-by-dom-value
  ([field value]
   (operator-by-dom-value field value nil))
  ([field value type-definition-overrides]
   (first
    (filter #(= (str value) (str (:id %)))
            (operators-for-field field type-definition-overrides)))))

(defn default-operator
  ([field]
   (default-operator field nil))
  ([field type-definition-overrides]
   (let [operators (operators-for-field field type-definition-overrides)
         default-id (or (:default-operator-id field)
                        (get-in (type-definitions type-definition-overrides)
                                [(field-type field) :default-operator-id]))]
     (or (operator-by-id field default-id type-definition-overrides)
         (first operators)))))

(defn editor-kind
  [operator]
  (or (:value-kind operator) (:editor operator) :text))

(defn empty-value
  [operator]
  (if (contains? operator :empty-value)
    (:empty-value operator)
    (case (editor-kind operator)
      :multi-select []
      :single-select ""
      :range {:lower "" :upper ""}
      :none nil
      "")))

(defn value-required?
  [operator]
  (and (not= :none (editor-kind operator))
       (not= false (:value-required? operator))))

(defn value-present?
  [operator value]
  (case (editor-kind operator)
    :none true
    :multi-select (boolean (seq value))
    :single-select (not (str/blank? (str (or value ""))))
    :text (not (str/blank? (str (or value ""))))
    :range (and (map? value)
                (or (not (str/blank? (str (or (:lower value) ""))))
                    (not (str/blank? (str (or (:upper value) ""))))))
    (some? value)))

(defn available-fields
  ([fields conditions]
   (available-fields fields conditions nil))
  ([fields conditions type-definition-overrides]
   (let [used-field-ids (set (map :field-id (or conditions [])))]
     (->> (or fields [])
          (filter #(seq (operators-for-field % type-definition-overrides)))
          (filter #(or (repeatable-field? %)
                       (not (contains? used-field-ids (field-id %)))))
          vec))))

(defn compatible-value?
  [from-operator to-operator]
  (= (editor-kind from-operator)
     (editor-kind to-operator)))

(defn draft-for-field
  ([field]
   (draft-for-field field nil))
  ([field type-definition-overrides]
   (when-let [operator (default-operator field type-definition-overrides)]
     {:field-id (field-id field)
      :operator-id (:id operator)
      :value (empty-value operator)})))

(defn with-operator
  ([condition field operator-id]
   (with-operator condition field operator-id nil))
  ([condition field operator-id type-definition-overrides]
   (if-let [next-operator (operator-by-id field operator-id type-definition-overrides)]
     (let [current-operator (operator-by-id field
                                            (:operator-id condition)
                                            type-definition-overrides)]
       (assoc condition
              :operator-id (:id next-operator)
              :value (if (and current-operator
                              (compatible-value? current-operator next-operator))
                       (:value condition)
                       (empty-value next-operator))))
     condition)))

(defn valid-condition?
  ([condition fields]
   (valid-condition? condition fields nil))
  ([condition fields type-definition-overrides]
   (when-let [field (field-by-id fields (:field-id condition))]
     (when-let [operator (operator-by-id field
                                         (:operator-id condition)
                                         type-definition-overrides)]
       (or (not (value-required? operator))
           (value-present? operator (:value condition)))))))

(defn condition-from-draft
  [condition-id draft]
  (assoc (select-keys draft [:field-id :operator-id :value])
         :id condition-id))

(defn add-condition
  [conditions condition]
  (let [conditions (vec (or conditions []))]
    (when (some #(= (:id condition) (:id %)) conditions)
      (throw (ex-info "Table filter condition id must be unique."
                      {:condition-id (:id condition)})))
    (conj conditions condition)))

(defn replace-condition
  [conditions condition]
  (mapv (fn [current]
          (if (= (:id current) (:id condition))
            condition
            current))
        (or conditions [])))

(defn remove-condition
  [conditions condition-id]
  (into []
        (remove #(= condition-id (:id %)))
        (or conditions [])))

(defn clear-conditions
  [_conditions]
  [])

(defn toggle-selected-value
  [values option-id]
  (let [values (vec (or values []))]
    (if (some #(= option-id %) values)
      (into [] (remove #(= option-id %)) values)
      (conj values option-id))))
