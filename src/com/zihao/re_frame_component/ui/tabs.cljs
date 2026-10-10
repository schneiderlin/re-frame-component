(ns com.zihao.re-frame-component.ui.tabs
  (:require
   [re-frame.core :as rf]))

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

(defn- child-nodes
  [content]
  (if (seq? content)
    content
    (list content)))

(defn- action-handler
  [action]
  (cond
    (nil? action) nil
    (fn? action) action
    (vector? action) (fn [_event] (rf/dispatch action))
    (sequential? action) (fn [_event]
                           (doseq [event action]
                             (rf/dispatch event)))
    :else (throw (ex-info "RF2 tab action must be a dispatch vector, a sequence of dispatch vectors, or a handler function."
                          {:action action}))))

(defn tab-button-attrs
  [{:keys [id active? disabled? action panel-id tab-id attrs]} {:keys [class]}]
  (cond-> (merge-attrs
           {:type "button"
            :role "tab"
            :data-component "re-frame-tab"
            :data-tab-id (str id)
            :data-selected (str (boolean active?))
            :aria-selected (str (boolean active?))
            :tab-index (if active? 0 -1)}
           attrs)
    class
    (update :class #(if % (str class " " %) class))

    panel-id
    (assoc :aria-controls panel-id)

    tab-id
    (assoc :id tab-id)

    disabled?
    (assoc :disabled true)

    (and action (not (:on-click attrs)) (not disabled?))
    (assoc :on-click (action-handler action))))

(defn tab-button
  ([item]
   (tab-button item {}))
  ([item opts]
   [:button (tab-button-attrs item opts)
    (:label item)]))

(defn tab-list
  ([items]
   (tab-list items {}))
  ([items {:keys [active-id class attrs tab-options aria-label]}]
   (into [:div (cond-> (merge-attrs
                        {:role "tablist"
                         :data-component "re-frame-tab-list"}
                        attrs)
                 class
                 (update :class #(if % (str class " " %) class))

                 aria-label
                 (assoc :aria-label aria-label))]
         (for [item items
               :let [item* (cond-> item
                             (and (some? active-id) (not (contains? item :active?)))
                             (assoc :active? (= active-id (:id item))))]]
           ^{:key (:id item*)}
           [tab-button item* tab-options]))))

(defn tab-panel
  ([content]
   (tab-panel content {}))
  ([content {:keys [class attrs panel-tag tab-id]}]
   (let [panel-tag (or panel-tag :section)]
     (into [panel-tag (cond-> (merge-attrs
                               {:role "tabpanel"
                                :data-component "re-frame-tab-panel"}
                               attrs)
                        class
                        (update :class #(if % (str class " " %) class))

                        tab-id
                        (assoc :aria-labelledby tab-id))]
           (child-nodes content)))))

(defn tabs
  [{:keys [items active-id content]} & {:keys [attrs
                                               class
                                               list-attrs
                                               list-class
                                               tab-options
                                               panel-attrs
                                               panel-class
                                               panel-tag
                                               aria-label]}]
  [:div (cond-> (merge-attrs {:data-component "re-frame-tabs"} attrs)
          class
          (update :class #(if % (str class " " %) class)))
   [tab-list items {:active-id active-id
                    :attrs list-attrs
                    :class list-class
                    :tab-options tab-options
                    :aria-label aria-label}]
   [tab-panel content {:attrs panel-attrs
                       :class panel-class
                       :panel-tag panel-tag}]])
