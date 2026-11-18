(ns com.zihao.re-frame-component.ui.table-filter.interface
  "Public API for the controlled table-filter condition builder: field/operator model helpers for
  both platforms, plus the Reagent view."
  (:require
   [com.zihao.re-frame-component.ui.table-filter.model :as model]
   #?(:cljs [com.zihao.re-frame-component.ui.table-filter.view :as view])))

(def default-type-definitions
  "Built-in text, select, and range editor/operator definitions.

  Keys are field types (`:text`, `:multi-select`, `:single-select`, `:range`); each value is
  `{:editor <editor kind> :operators [{:id :label :editor} ...]}`. Callers extend or replace a
  type by passing their own map as `type-definition-overrides`; nested maps are merged onto these
  defaults."
  model/default-type-definitions)

(defn operators-for-field
  "Returns the operators available for `field`, with editor defaults applied.

  Parameters:
  - `field` — filterable field map:
    - `:id` — field id.
    - `:label` — visible field label; defaults to `:id`.
    - `:type` — field type key into the type definitions (e.g. `:text`, `:multi-select`,
      `:single-select`, `:range`); inferred from `:options` and `:multiple?` when absent.
    - `:operators` — optional field-specific operator vector overriding the type's operators.
    - `:options` — optional value options, used to infer a select type.
    - `:multiple?` — with `:options`, selects `:multi-select` instead of `:single-select`.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `default-type-definitions`.

  Returns: vector of operator maps (`:id`, `:label`, `:editor`, and optionally `:value-kind`,
  `:empty-value`, `:value-required?`); each operator without an explicit `:editor`/`:value-kind`
  inherits the type's default editor. Empty when the field type is unknown and it declares no
  operators."
  ([field]
   (model/operators-for-field field))
  ([field type-definition-overrides]
   (model/operators-for-field field type-definition-overrides)))

(defn repeatable-field?
  "Returns true unless `field` explicitly disables repeated conditions.

  Parameters:
  - `field` — filterable field map; only `:repeatable?` is read.

  Returns: false only when `:repeatable?` is exactly `false`, true otherwise (including when the
  key is absent)."
  [field]
  (model/repeatable-field? field))

(defn available-fields
  "Returns fields that can still add a condition.

  Non-repeatable fields already used by `conditions` are omitted.

  Parameters:
  - `fields` — sequence of filterable field maps (see `operators-for-field`).
  - `conditions` — current condition vector; each condition's `:field-id` counts as used.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `default-type-definitions`.

  Returns: vector of the fields that declare at least one operator and are either repeatable or not
  yet used by a condition, in input order."
  ([fields conditions]
   (model/available-fields fields conditions))
  ([fields conditions type-definition-overrides]
   (model/available-fields fields conditions type-definition-overrides)))

(defn draft-for-field
  "Creates a condition draft using the field's default operator, or nil.

  Parameters:
  - `field` — filterable field map (see `operators-for-field`); `:default-operator-id` selects the
    default operator, otherwise the first operator of the field is used.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `default-type-definitions`.

  Returns: draft map `{:field-id :operator-id :value}` whose `:value` is the operator's empty value
  for its editor kind, or nil when the field has no operators."
  ([field]
   (model/draft-for-field field))
  ([field type-definition-overrides]
   (model/draft-for-field field type-definition-overrides)))

(defn valid-condition?
  "Returns truthy when a condition references a known operator and valid value.

  Parameters:
  - `condition` — condition map:
    - `:field-id` — field the condition applies to; an unknown field makes the condition invalid.
    - `:operator-id` — operator the condition applies to; an unknown operator makes it invalid.
    - `:value` — condition value, checked with the operator's editor kind (a non-blank string for
      text/select, a non-empty collection for multi-select, a map with at least one non-blank
      `:lower`/`:upper` for range, ignored for `:none`).
  - `fields` — sequence of filterable field maps.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `default-type-definitions`.

  Returns: truthy when the condition is valid, nil when the field, the operator, or a required
  value is missing."
  ([condition fields]
   (model/valid-condition? condition fields))
  ([condition fields type-definition-overrides]
   (model/valid-condition? condition fields type-definition-overrides)))

(defn with-operator
  "Changes a condition's operator and preserves only compatible values.

  Parameters:
  - `condition` — condition map; `:operator-id` is replaced and `:value` is kept or reset.
  - `field` — filterable field map the condition applies to.
  - `operator-id` — id of the operator to switch to.
  - `type-definition-overrides` — optional map of field type -> definition merged onto
    `default-type-definitions`.

  Returns: the condition with the new `:operator-id`, keeping `:value` only when the previous and
  next operators share an editor kind and otherwise resetting it to the new operator's empty value;
  the unchanged condition when `operator-id` is not an operator of the field."
  ([condition field operator-id]
   (model/with-operator condition field operator-id))
  ([condition field operator-id type-definition-overrides]
   (model/with-operator condition field operator-id type-definition-overrides)))

(defn add-condition
  "Appends a condition and rejects duplicate condition ids.

  Parameters:
  - `conditions` — current condition vector; nil is treated as empty.
  - `condition` — condition map to append; its `:id` must be unique.

  Returns: the condition vector with `condition` appended.

  Throws `ex-info` when a condition with the same `:id` is already present."
  [conditions condition]
  (model/add-condition conditions condition))

(defn replace-condition
  "Replaces the condition with the same id, preserving collection order.

  Parameters:
  - `conditions` — current condition vector; nil is treated as empty.
  - `condition` — condition map whose `:id` selects the entry to replace; nothing changes when no
    entry has that id.

  Returns: a new condition vector in which the same-id entry is replaced by `condition`."
  [conditions condition]
  (model/replace-condition conditions condition))

(defn remove-condition
  "Removes the condition identified by `condition-id`.

  Parameters:
  - `conditions` — current condition vector; nil is treated as empty.
  - `condition-id` — id of the condition to drop.

  Returns: a new condition vector without that condition, keeping the other entries in order."
  [conditions condition-id]
  (model/remove-condition conditions condition-id))

(defn clear-conditions
  "Returns an empty condition vector.

  Parameters:
  - `conditions` — current condition vector; the value is ignored.

  Returns: `[]`."
  [conditions]
  (model/clear-conditions conditions))

#?(:cljs
   (defn table-filter-builder
     "Renders a controlled condition builder for table filters.

     `fields` describe available predicates, `conditions` is caller-owned, and
     `on-conditions-change` receives each next condition vector plus change
     metadata. The component owns only its uncommitted editor draft.

     Parameters:
     - `builder-options` — builder options:
       - `:id` — required; component id used for the builder's DOM ids.
       - `:fields` — sequence of filterable field maps (see `operators-for-field`).
       - `:conditions` — current condition vector, one entry per row:
         - `:id` — condition id.
         - `:field-id` — field the condition applies to.
         - `:operator-id` — operator the condition applies to.
         - `:value` — condition value in the shape the operator's editor kind expects.
       - `:type-definitions` — optional map of field type -> definition merged onto
         `default-type-definitions`.
       - `:copy` — optional map of UI strings merged onto the default copy.
       - `:disabled?` — disables the row and footer controls when true.
       - `:on-conditions-change` — function of `(conditions meta)` called with the next condition
         vector and change metadata (`:action` one of `:condition/add`, `:condition/update`,
         `:condition/remove`, `:condition/clear`, plus `:condition-id`, `:field-id`, and
         `:operator-id` when a condition is involved).
       - `:new-condition-id` — optional zero-argument function producing the id for a newly added
         condition; defaults to a random UUID string.
       - `:attrs` — optional attribute map merged onto the root `:section`.
       - `:class` — optional class appended to the root element.

     Returns: `[:section ...]` Hiccup vector rendering the condition list and the add-condition
     editor, with `data-state` and `data-editor-state` reflecting the current conditions and editor
     stage.

     Throws `ex-info` when `:id` is blank."
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
