(ns com.zihao.re-frame-component.ui.filter-select.view
  (:require
   [clojure.string :as str]
   [com.zihao.re-frame-component.ui.filter-select.model :as model]
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]
   [reagent.core :as r]))

(defn- merge-attrs
  [defaults attrs]
  (merge-with
   (fn [default-value value]
     (cond
       (= default-value value) value
       (and (map? default-value) (map? value)) (merge default-value value)
       (and (sequential? default-value) (sequential? value)) (vec (concat default-value value))
       (and (string? default-value) (string? value)) (str default-value " " value)
       :else value))
   defaults
   (or attrs {})))

(defn- with-class
  [attrs class-name]
  (cond-> (or attrs {})
    class-name
    (update :class #(if (seq %) (str % " " class-name) class-name))))

(defn- dom-token
  [value]
  (-> (str value)
      (str/replace #"[^A-Za-z0-9_-]" "-")
      (str/replace #"-+" "-")))

(defn- input-id
  [component-id]
  (str (dom-token component-id) "-input"))

(defn- listbox-id
  [component-id]
  (str (dom-token component-id) "-listbox"))

(defn- option-dom-id
  [component-id option-id index]
  (str (dom-token component-id) "-option-" index "-" (dom-token option-id)))

(defn- select-option!
  [local-state on-select option]
  (swap! local-state assoc
         :open? false
         :query ""
         :active-index 0)
  (when on-select
    (on-select option)))

(defn- default-render-option
  [option opts]
  (let [label (model/option-label option opts)
        description (model/option-description option opts)]
    [:span.rf-filter-select__option-content
     [:span.rf-filter-select__option-label label]
     (when (seq (str description))
       [:span.rf-filter-select__option-description description])]))

(defn- option-attrs
  [option ctx option-options]
  (cond
    (fn? option-options) (or (option-options option ctx) {})
    (map? option-options) option-options
    :else {}))

(defn- option-row
  [component-id local-state opts option index]
  (let [{:keys [selected-id render-option on-select option-options]} opts
        option-id (model/option-id option opts)
        active? (= index (:active-index @local-state))
        selected? (= selected-id option-id)
        disabled? (model/option-disabled? option opts)
        ctx {:active? active?
             :selected? selected?
             :disabled? disabled?
             :index index}
        attrs (merge-attrs
               (merge-attrs
                {:id (option-dom-id component-id option-id index)
                 :role "option"
                 :data-component "re-frame-filter-select-option"
                 :data-option-id (str option-id)
                 :data-active (str (boolean active?))
                 :data-selected (str (boolean selected?))
                 :data-disabled (str disabled?)
                 :aria-selected (str (boolean selected?))
                 :aria-disabled (str disabled?)
                 :on-mouse-enter #(when-not disabled?
                                    (swap! local-state assoc :active-index index))}
                (when-not disabled?
                  {:on-mouse-down (fn [event]
                                    (.preventDefault event)
                                    (select-option! local-state on-select option))}))
               (option-attrs option ctx option-options))]
    [:li (with-class attrs "rf-filter-select__option")
     (if render-option
       (render-option option)
       (default-render-option option opts))]))

(defn- open!
  [local-state]
  (swap! local-state assoc
         :open? true
         :query ""
         :active-index 0))

(defn- close!
  [local-state]
  (swap! local-state assoc
         :open? false
         :query ""
         :active-index 0))

(defn- handle-key-down
  [event local-state filtered-options opts]
  (let [key (.-key event)
        option-count (count filtered-options)
        open? (:open? @local-state)
        active-index (model/bounded-index (:active-index @local-state) option-count)]
    (case key
      "ArrowDown"
      (do
        (.preventDefault event)
        (swap! local-state assoc
               :open? true
               :active-index (or (model/selectable-index filtered-options
                                                         active-index 1 opts)
                                 active-index)))

      "ArrowUp"
      (do
        (.preventDefault event)
        (swap! local-state assoc
               :open? true
               :active-index (or (model/selectable-index filtered-options
                                                         active-index -1 opts)
                                 active-index)))

      "Enter"
      (when open?
        (.preventDefault event)
        (when-let [option (nth filtered-options active-index nil)]
          (when-not (model/option-disabled? option opts)
            (select-option! local-state (:on-select opts) option))))

      "Escape"
      (do
        (.preventDefault event)
        (close! local-state))

      nil)))

(defn filter-select
  "Headless searchable single-select. Owns combobox state, keyboard/IME behavior,
  ARIA wiring, root positioning context, and anchored versus inline menu layout.
  Visual facades own product styling via the root/control/input/menu/option attrs
  and may supply a passive :end-adornment."
  [{:keys [id
           label
           options
           selected-id
           default-open?
           placeholder
           disabled?
           class
           attrs
           label-options
           control-options
           input-options
           menu-options
           menu-layout
           empty-options
           empty-label
           end-adornment]
    :or {placeholder "Filter..."
         menu-layout :anchored
         empty-label "No options"}
    :as opts}]
  (r/with-let [local-state (r/atom {:open? (boolean default-open?)
                                    :query ""
                                    :active-index 0})
               generated-id (str "rf-filter-select-" (random-uuid))]
    (let [component-id (or id generated-id)
          selected-option (model/selected-option options selected-id opts)
          selected-label (when selected-option
                           (model/option-label selected-option opts))
          {:keys [open? query]} @local-state
          filtered-options (model/filter-options options query opts)
          active-index (model/bounded-index (:active-index @local-state)
                                            (count filtered-options))
          active-option (nth filtered-options active-index nil)
          active-option-id (when active-option
                             (option-dom-id component-id
                                            (model/option-id active-option opts)
                                            active-index))
          input-value (if open?
                        query
                        (or selected-label ""))
          disabled? (boolean disabled?)]
      [:div (cond-> (merge-attrs
                     {:data-component "re-frame-filter-select"
                      :data-component-id (str component-id)
                      :data-state (if open? "open" "closed")
                      :data-disabled (str disabled?)
                      :style {:position "relative"}}
                     attrs)
              class
              (with-class class))
       (when label
         [:label (merge-attrs
                  {:for (input-id component-id)
                   :class "rf-filter-select__label"}
                  label-options)
          label])
       [:div (merge-attrs
              {:class "rf-filter-select__control"}
              control-options)
        [ime-safe/input (merge-attrs
                         {:id (input-id component-id)
                          :class "rf-filter-select__input"
                          :type "text"
                          :role "combobox"
                          :aria-autocomplete "list"
                          :aria-expanded (str (boolean open?))
                          :aria-controls (listbox-id component-id)
                          :aria-activedescendant active-option-id
                          :auto-complete "off"
                          :spell-check false
                          :placeholder placeholder
                          :disabled disabled?
                          :value input-value
                          :on-value (fn [value]
                                      (swap! local-state assoc
                                             :open? true
                                             :query value
                                             :active-index 0))
                          :on-focus #(when-not disabled?
                                       (open! local-state))
                          :on-key-down #(handle-key-down % local-state filtered-options opts)
                          :on-blur #(close! local-state)}
                         input-options)]
        end-adornment]
       (when open?
         (into [:ul (merge-attrs
                     {:id (listbox-id component-id)
                      :class "rf-filter-select__listbox"
                      :role "listbox"
                      :data-component "re-frame-filter-select-listbox"
                      :data-layout (name menu-layout)
                      :style (if (= :inline menu-layout)
                               {:position "relative"}
                               {:left 0
                                :position "absolute"
                                :top "100%"
                                :width "100%"})}
                     menu-options)]
               (if (seq filtered-options)
                 (map-indexed
                  (fn [index option]
                    ^{:key (str (model/option-id option opts))}
                    [option-row component-id local-state opts option index])
                  filtered-options)
                 [[:li (merge-attrs
                        {:class "rf-filter-select__empty"
                         :data-state "empty"}
                        empty-options)
                   empty-label]])))])))
