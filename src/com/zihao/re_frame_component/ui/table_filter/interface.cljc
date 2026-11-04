(ns com.zihao.re-frame-component.ui.table-filter.interface
  (:require
   [com.zihao.re-frame-component.ui.table-filter.model :as model]
   #?(:cljs [com.zihao.re-frame-component.ui.table-filter.view :as view])))

(def ^{:doc "Built-in text, select, and range editor/operator definitions."}
  default-type-definitions
  model/default-type-definitions)

(defn operators-for-field
  "Returns the operators available for `field`, with editor defaults applied."
  ([field]
   (model/operators-for-field field))
  ([field type-definition-overrides]
   (model/operators-for-field field type-definition-overrides)))

(defn repeatable-field?
  "Returns true unless `field` explicitly disables repeated conditions."
  [field]
  (model/repeatable-field? field))

(defn available-fields
  "Returns fields that can still add a condition.

  Non-repeatable fields already used by `conditions` are omitted."
  ([fields conditions]
   (model/available-fields fields conditions))
  ([fields conditions type-definition-overrides]
   (model/available-fields fields conditions type-definition-overrides)))

(defn draft-for-field
  "Creates a condition draft using the field's default operator, or nil."
  ([field]
   (model/draft-for-field field))
  ([field type-definition-overrides]
   (model/draft-for-field field type-definition-overrides)))

(defn valid-condition?
  "Returns truthy when a condition references a known operator and valid value."
  ([condition fields]
   (model/valid-condition? condition fields))
  ([condition fields type-definition-overrides]
   (model/valid-condition? condition fields type-definition-overrides)))

(defn with-operator
  "Changes a condition's operator and preserves only compatible values."
  ([condition field operator-id]
   (model/with-operator condition field operator-id))
  ([condition field operator-id type-definition-overrides]
   (model/with-operator condition field operator-id type-definition-overrides)))

(defn add-condition
  "Appends a condition and rejects duplicate condition ids."
  [conditions condition]
  (model/add-condition conditions condition))

(defn replace-condition
  "Replaces the condition with the same id, preserving collection order."
  [conditions condition]
  (model/replace-condition conditions condition))

(defn remove-condition
  "Removes the condition identified by `condition-id`."
  [conditions condition-id]
  (model/remove-condition conditions condition-id))

(defn clear-conditions
  "Returns an empty condition vector."
  [conditions]
  (model/clear-conditions conditions))

#?(:cljs
   (defn table-filter-builder
     "Renders a controlled condition builder for table filters.

     `fields` describe available predicates, `conditions` is caller-owned, and
     `on-conditions-change` receives each next condition vector plus change
     metadata. The component owns only its uncommitted editor draft."
     [{:keys [id
              fields
              conditions
              type-definitions
              copy
              disabled?
              on-conditions-change
              new-condition-id
              attrs
              class]}]
     [view/table-filter-builder
      {:id id
       :fields fields
       :conditions conditions
       :type-definitions type-definitions
       :copy copy
       :disabled? disabled?
       :on-conditions-change on-conditions-change
       :new-condition-id new-condition-id
       :attrs attrs
       :class class}]))
