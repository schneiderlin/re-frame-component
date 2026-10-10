(ns com.zihao.re-frame-component.ui.table-filter.view
  (:require
   [clojure.string :as str]
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]
   [com.zihao.re-frame-component.ui.optional-range.view :as optional-range-view]
   [com.zihao.re-frame-component.ui.table-filter.model :as model]
   [reagent.core :as r]))

(def default-copy
  {:title "Filters"
   :empty "No conditions. All records are shown."
   :clear-all "Clear all"
   :add-condition "Add condition"
   :choose-field "Choose a field"
   :no-fields "No filterable fields"
   :back "Back"
   :cancel "Cancel"
   :add "Add"
   :operator "Operator"
   :value "Value"
   :remove-condition "Remove condition"
   :choose-value "Choose a value"
   :choose-values "Choose values"
   :search-values "Search values..."
   :no-values "No values"
   :lower-bound "Minimum"
   :upper-bound "Maximum"})

(defn- merge-attrs
  [defaults attrs]
  (merge-with
   (fn [default-value value]
     (cond
       (= default-value value) value
       (and (map? default-value) (map? value)) (merge default-value value)
       (and (sequential? default-value) (sequential? value))
       (vec (concat default-value value))
       (and (string? default-value) (string? value))
       (str default-value " " value)
       :else value))
   defaults
   (or attrs {})))

(defn- dom-token
  [value]
  (-> (str value)
      (str/replace #"[^A-Za-z0-9_-]" "-")
      (str/replace #"-+" "-")))

(defn- target-value
  [event]
  (.. event -target -value))

(defn- copy-map
  [copy]
  (merge default-copy (or copy {})))

(defn- change-meta
  [action condition]
  (cond-> {:action action}
    condition
    (assoc :condition-id (:id condition)
           :field-id (:field-id condition)
           :operator-id (:operator-id condition))))

(defn- emit-change!
  [on-conditions-change conditions meta]
  (when on-conditions-change
    (on-conditions-change conditions meta)))

(defn- close-editor!
  ([local-state trigger-node]
   (close-editor! local-state trigger-node true))
  ([local-state trigger-node restore-focus?]
   (reset! local-state {:stage :closed
                        :draft nil})
   (when (and restore-focus? @trigger-node)
     (js/setTimeout #(when-let [node @trigger-node]
                       (.focus node))
                    0))))

(defn- option-id
  [option]
  (:id option))

(defn- option-label
  [option]
  (or (:label option) (option-id option) ""))

(defn- native-multi-select-editor
  [{:keys [component-id field value on-value copy disabled?]}]
  (let [options (vec (or (:options field) []))
        disabled? (or (boolean disabled?) (empty? options))]
    [:select {:id (str (dom-token component-id) "-value")
              :multiple true
              :size (min 8 (max 2 (count options)))
              :value (model/selected-option-dom-values options value)
              :aria-label (str (:value copy) ": " (model/field-label field))
              :disabled disabled?
              :data-component "re-frame-table-filter-multi-select"
              :data-part "value-editor"
              :data-editor "multi-select"
              :data-action "set-condition-values"
              :on-change
              (fn [event]
                (let [selected-options (array-seq
                                        (.. event -target -selectedOptions))]
                  (on-value
                   (model/selected-option-ids
                    options
                    (map #(.-value %) selected-options)))))}
     (if (seq options)
       (for [[index option] (map-indexed vector options)]
         ^{:key (str index "-" (option-id option))}
         [:option {:value (model/option-dom-value index)}
          (option-label option)])
       [:option {:value "" :disabled true} (:no-values copy)])]))

(defn- rendered-option
  [field option]
  (if-let [render-option (:render-option field)]
    [render-option option]
    (option-label option)))

(defn- selected-options
  [options values]
  (let [selected-ids (set (or values []))]
    (filterv #(contains? selected-ids (option-id %)) (or options []))))

(defn- rich-selected-options
  [field value copy]
  (let [selected (selected-options (:options field) value)]
    (if (seq selected)
      (into
       [:span {:data-part "selected-option-list"}]
       (for [[index option] (map-indexed vector selected)]
         ^{:key (str index "-" (option-id option))}
         [:span {:data-part "selected-option"
                 :data-option-id (str (option-id option))}
          [rendered-option field option]]))
      [:span {:data-part "selected-options-empty"}
       (:choose-values copy)])))

(defn- rich-option-list
  [{:keys [component-id field value on-value copy disabled?]}]
  (let [options (vec (or (:options field) []))]
    (if (seq options)
      (into
       [:ul {:data-part "value-options"
             :role "listbox"
             :aria-multiselectable "true"}]
       (for [[index option] (map-indexed vector options)
             :let [id (option-id option)
                   selected? (boolean (some #(= id %) value))
                   input-id (str (dom-token component-id)
                                 "-option-"
                                 index)]]
         ^{:key (str index "-" id)}
         [:li {:data-part "value-option"
               :role "option"
               :aria-selected (str selected?)
               :data-option-id (str id)
               :data-selected (str selected?)}
          [:label {:for input-id}
           [:input {:id input-id
                    :type "checkbox"
                    :checked selected?
                    :disabled (boolean disabled?)
                    :data-action "toggle-condition-value"
                    :on-change #(on-value
                                 (model/toggle-selected-value value id))}]
           [rendered-option field option]]]))
      [:div {:data-part "value-options-empty"
             :data-state "empty"}
       (:no-values copy)])))

(defn- rich-multi-select-editor
  [{:keys [component-id field value on-value copy disabled? expanded?]}]
  (let [editor-options {:component-id component-id
                        :field field
                        :value value
                        :on-value on-value
                        :copy copy
                        :disabled? disabled?}
        selected-count (count (selected-options (:options field) value))]
    (if expanded?
      [:div {:data-component "re-frame-table-filter-rich-multi-select"
             :data-state "expanded"
             :data-selected-count selected-count}
       [rich-selected-options field value copy]
       [rich-option-list editor-options]]
      [:details {:data-component "re-frame-table-filter-rich-multi-select"
                 :data-state "compact"
                 :data-selected-count selected-count}
       [:summary {:data-part "selected-values"}
        [rich-selected-options field value copy]]
       [rich-option-list editor-options]])))

(defn- single-select-editor
  [{:keys [component-id field value on-value copy disabled?]}]
  (let [options (vec (or (:options field) []))]
    [:select {:id (str (dom-token component-id) "-value")
            :value (or (first (model/selected-option-dom-values options [value]))
                       "")
            :aria-label (str (:value copy) ": " (model/field-label field))
            :disabled (or (boolean disabled?) (empty? options))
            :data-part "value-editor"
            :data-editor "single-select"
            :data-action "set-condition-value"
            :on-change
            (fn [event]
              (on-value
               (or (model/option-id-by-dom-value options
                                                 (target-value event))
                   "")))}
   [:option {:value ""} (:choose-value copy)]
   (for [[index option] (map-indexed vector options)]
     ^{:key (str index "-" (option-id option))}
     [:option {:value (model/option-dom-value index)}
      (option-label option)])]))

(defn- range-editor
  [{:keys [component-id field value on-value copy disabled?]}]
  (let [value* (if (map? value) value {})
        update-bound (fn [bound next-value]
                       (on-value (assoc value* bound next-value)))]
    [optional-range-view/optional-range-filter
     {:id (str (dom-token component-id) "-value")
      :label (model/field-label field)
      :lower-label (or (:lower-label field) (:lower-bound copy))
      :upper-label (or (:upper-label field) (:upper-bound copy))
      :lower-value (:lower value*)
      :upper-value (:upper value*)
      :lower-placeholder (:lower-placeholder field)
      :upper-placeholder (:upper-placeholder field)
      :type (or (:input-type field) "number")
      :disabled? disabled?
      :min (:min field)
      :max (:max field)
      :step (:step field)
      :on-lower-value #(update-bound :lower %)
      :on-upper-value #(update-bound :upper %)
      :attrs {:data-part "value-editor"
              :data-editor "range"
              :data-action "set-condition-range"}}]))

(defn- value-editor
  [{:keys [component-id field operator value on-value copy disabled? expanded?]}]
  (let [custom-editor (or (:render-editor operator) (:render-editor field))
        editor-options {:component-id component-id
                        :field field
                        :operator operator
                        :value value
                        :on-value on-value
                        :copy copy
                        :disabled? disabled?
                        :expanded? expanded?}]
    (cond
      custom-editor
      (custom-editor editor-options)

      (and (= :multi-select (model/editor-kind operator))
           (:render-option field))
      [rich-multi-select-editor editor-options]

      (= :multi-select (model/editor-kind operator))
      [native-multi-select-editor editor-options]

      (= :single-select (model/editor-kind operator))
      [single-select-editor editor-options]

      (= :range (model/editor-kind operator))
      [range-editor editor-options]

      (= :none (model/editor-kind operator))
      [:span {:data-part "value-editor"
              :data-editor "none"}]

      :else
      [ime-safe/input
       {:id (str (dom-token component-id) "-value")
        :type "text"
        :value (or value "")
        :placeholder (or (:placeholder field) (:value copy))
        :aria-label (str (:value copy) ": " (model/field-label field))
        :disabled (boolean disabled?)
        :data-part "value-editor"
        :data-editor (name (model/editor-kind operator))
        :data-action "set-condition-value"
        :on-value on-value}])))

(defn- operator-select
  [{:keys [component-id field condition type-definitions copy disabled? on-condition]}]
  (let [operators (model/operators-for-field field type-definitions)]
    [:select {:id (str (dom-token component-id) "-operator")
              :value (str (:operator-id condition))
              :aria-label (str (:operator copy) ": " (model/field-label field))
              :disabled (boolean disabled?)
              :data-part "operator"
              :data-action "select-condition-operator"
              :on-change (fn [event]
                           (when-let [operator
                                      (model/operator-by-dom-value
                                       field
                                       (target-value event)
                                       type-definitions)]
                             (on-condition
                              (model/with-operator condition
                                                   field
                                                   (:id operator)
                                                   type-definitions))))}
     (for [operator operators]
       ^{:key (str (:id operator))}
       [:option {:value (str (:id operator))}
        (:label operator)])]))

(defn- condition-row
  [{:keys [builder-id fields condition conditions type-definitions copy
           disabled? on-conditions-change]}]
  (let [field (model/field-by-id fields (:field-id condition))
        operator (when field
                   (model/operator-by-id field
                                         (:operator-id condition)
                                         type-definitions))
        component-id (str builder-id "-condition-" (:id condition))
        valid? (boolean
                (model/valid-condition? condition fields type-definitions))
        replace! (fn [next-condition]
                   (emit-change!
                    on-conditions-change
                    (model/replace-condition conditions next-condition)
                    (change-meta :condition/update next-condition)))]
    [:li {:data-component "re-frame-table-filter-condition"
          :data-condition-id (str (:id condition))
          :data-field-id (str (:field-id condition))
          :data-operator-id (str (:operator-id condition))
          :data-state (if valid? "valid" "invalid")}
     [:span {:data-part "field"}
      (if field
        (model/field-label field)
        (:field-id condition))]
     (when field
       [operator-select {:component-id component-id
                         :field field
                         :condition condition
                         :type-definitions type-definitions
                         :copy copy
                         :disabled? disabled?
                         :on-condition replace!}])
     (when (and field operator)
       [value-editor {:component-id component-id
                      :field field
                      :operator operator
                      :value (:value condition)
                      :copy copy
                      :disabled? disabled?
                      :on-value #(replace! (assoc condition :value %))}])
     [:button {:type "button"
               :data-action "remove-condition"
               :aria-label (str (:remove-condition copy)
                                ": "
                                (if field
                                  (model/field-label field)
                                  (:field-id condition)))
               :disabled (boolean disabled?)
               :on-click #(emit-change!
                           on-conditions-change
                           (model/remove-condition conditions (:id condition))
                           (change-meta :condition/remove condition))}
      "×"]]))

(defn- field-description
  [field]
  (or (:type-label field)
      (some-> (:type field) name)))

(defn- field-option-label
  [field]
  (if-let [description (field-description field)]
    (str (model/field-label field) " · " description)
    (model/field-label field)))

(defn- field-chooser
  [{:keys [builder-id fields conditions type-definitions copy local-state
           trigger-node]}]
  (let [filterable-fields (model/available-fields fields
                                                  conditions
                                                  type-definitions)]
    [:div {:data-part "condition-editor"
           :id (str (dom-token builder-id) "-condition-editor")
           :data-stage "choose-field"
           :role "dialog"
           :aria-modal "false"
           :on-key-down #(when (= "Escape" (.-key %))
                           (.preventDefault %)
                           (close-editor! local-state trigger-node))}
     [:select {:id (str (dom-token builder-id) "-field")
               :value ""
               :auto-focus true
               :disabled (empty? filterable-fields)
               :aria-label (:choose-field copy)
               :data-part "field-select"
               :data-action "select-condition-field"
               :on-change
               (fn [event]
                 (let [dom-value (target-value event)]
                   (when-let [field
                              (first
                               (filter #(= dom-value (str (model/field-id %)))
                                       filterable-fields))]
                     (when-let [draft (model/draft-for-field
                                       field
                                       type-definitions)]
                       (reset! local-state {:stage :configure
                                            :draft draft})))))}
      [:option {:value "" :disabled true}
       (if (seq filterable-fields)
         (:choose-field copy)
         (:no-fields copy))]
      (for [field filterable-fields]
        ^{:key (str (model/field-id field))}
        [:option {:value (str (model/field-id field))}
         (field-option-label field)])]
     [:button {:type "button"
               :data-action "cancel-condition"
               :on-click #(close-editor! local-state trigger-node)}
      (:cancel copy)]]))

(defn- next-condition-id
  [new-condition-id]
  (if new-condition-id
    (new-condition-id)
    (str (random-uuid))))

(defn- condition-configurator
  [{:keys [builder-id fields conditions type-definitions copy local-state
           trigger-node disabled? on-conditions-change new-condition-id]}]
  (let [draft (:draft @local-state)
        field (model/field-by-id fields (:field-id draft))
        operator (when field
                   (model/operator-by-id field
                                         (:operator-id draft)
                                         type-definitions))
        valid? (boolean (model/valid-condition? draft fields type-definitions))
        add! (fn []
               (when valid?
                 (let [condition (model/condition-from-draft
                                  (next-condition-id new-condition-id)
                                  draft)]
                   (emit-change!
                    on-conditions-change
                    (model/add-condition conditions condition)
                    (change-meta :condition/add condition))
                   (close-editor! local-state trigger-node))))]
    [:form {:data-part "condition-editor"
            :id (str (dom-token builder-id) "-condition-editor")
            :data-stage "configure"
            :role "dialog"
            :aria-modal "false"
            :on-key-down #(when (= "Escape" (.-key %))
                            (.preventDefault %)
                            (close-editor! local-state trigger-node))
            :on-submit (fn [event]
                         (.preventDefault event)
                         (add!))}
     [:header {:data-part "condition-editor-header"}
      [:button {:type "button"
                :data-action "back-to-fields"
                :on-click #(reset! local-state {:stage :choose-field
                                                :draft nil})}
       (:back copy)]
      [:span {:data-part "draft-field"}
       (when field (model/field-label field))]]
     (when field
       [:label {:data-part "operator-field"}
        [:span (:operator copy)]
        [operator-select {:component-id (str builder-id "-draft")
                          :field field
                          :condition draft
                          :type-definitions type-definitions
                          :copy copy
                          :disabled? disabled?
                          :on-condition #(swap! local-state assoc :draft %)}]])
     (when (and field operator)
       [:div {:data-part "value-field"}
        [:span (:value copy)]
        [value-editor {:component-id (str builder-id "-draft")
                       :field field
                       :operator operator
                       :value (:value draft)
                       :copy copy
                       :disabled? disabled?
                       :expanded? true
                       :on-value #(swap! local-state assoc-in [:draft :value] %)}]])
     [:footer {:data-part "condition-editor-footer"}
      [:button {:type "button"
                :data-action "cancel-condition"
                :on-click #(close-editor! local-state trigger-node)}
       (:cancel copy)]
      [:button {:type "submit"
                :data-action "add-condition"
                :disabled (or (boolean disabled?) (not valid?))}
       (:add copy)]]]))

(defn table-filter-builder
  [{:keys [id fields conditions type-definitions copy disabled?
           on-conditions-change new-condition-id attrs class]
    :as _options}]
  (when (str/blank? (str (or id "")))
    (throw (ex-info "table filter builder requires an id" {})))
  (r/with-let [local-state (r/atom {:stage :closed
                                    :draft nil})
               trigger-node (atom nil)]
    (let [fields (vec (or fields []))
          conditions (vec (or conditions []))
          copy (copy-map copy)
          stage (:stage @local-state)
          root-attrs (cond->
                      (merge-attrs
                       {:data-component "re-frame-table-filter-builder"
                        :data-component-id (str id)
                        :data-state (if (seq conditions) "active" "empty")
                        :data-editor-state (name stage)
                        :data-condition-count (count conditions)}
                       attrs)
                       class (update :class #(if (seq %)
                                               (str % " " class)
                                               class)))]
      [:section root-attrs
       [:header {:data-part "header"}
        [:div {:data-part "title"}
         (:title copy)
         [:span {:data-part "condition-count"}
          (count conditions)]]
        (when (seq conditions)
          [:button {:type "button"
                    :data-action "clear-conditions"
                    :disabled (boolean disabled?)
                    :on-click #(emit-change!
                                on-conditions-change
                                (model/clear-conditions conditions)
                                (change-meta :condition/clear nil))}
           (:clear-all copy)])]
       (if (seq conditions)
         (into
          [:ul {:data-part "condition-list"}]
          (map (fn [condition]
                 ^{:key (str (:id condition))}
                 [condition-row {:builder-id id
                                 :fields fields
                                 :condition condition
                                 :conditions conditions
                                 :type-definitions type-definitions
                                 :copy copy
                                 :disabled? disabled?
                                 :on-conditions-change on-conditions-change}])
               conditions))
         [:div {:data-part "empty"
                :data-state "empty"}
          (:empty copy)])
       [:div {:data-part "editor-anchor"}
        [:button {:type "button"
                  :ref #(reset! trigger-node %)
                  :data-action "open-condition-editor"
                  :aria-expanded (str (not= :closed stage))
                  :aria-controls (str (dom-token id) "-condition-editor")
                  :disabled (boolean disabled?)
                  :on-click #(reset! local-state {:stage :choose-field
                                                  :draft nil})}
         (:add-condition copy)]
        (case stage
          :choose-field
          [field-chooser {:builder-id id
                          :fields fields
                          :conditions conditions
                          :type-definitions type-definitions
                          :copy copy
                          :local-state local-state
                          :trigger-node trigger-node}]

          :configure
          [condition-configurator {:builder-id id
                                   :fields fields
                                   :conditions conditions
                                   :type-definitions type-definitions
                                   :copy copy
                                   :local-state local-state
                                   :trigger-node trigger-node
                                   :disabled? disabled?
                                   :on-conditions-change on-conditions-change
                                   :new-condition-id new-condition-id}]

          nil)]])))
