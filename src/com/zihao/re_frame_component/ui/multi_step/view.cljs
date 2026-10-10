(ns com.zihao.re-frame-component.ui.multi-step.view
  (:require
   [com.zihao.re-frame-component.ui.multi-step.model :as model]
   [re-frame.core :as rf]))

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

(defn- child-nodes
  [content]
  (cond
    (nil? content) []
    (seq? content) content
    :else [content]))

(defn- attr-value
  [value]
  (if (keyword? value)
    (name value)
    (str value)))

(defn- action-handler
  [action]
  (cond
    (nil? action) nil
    (fn? action) action
    (vector? action) (fn [_event] (rf/dispatch action))
    (sequential? action) (fn [_event]
                           (doseq [event action]
                             (rf/dispatch event)))
    :else (throw
           (ex-info
            "RF2 multi-step action must be a dispatch vector, a sequence of dispatch vectors, or a handler function."
            {:action action}))))

(defn step-trigger-attrs
  [{:keys [id state active? navigable? action attrs]}]
  (cond->
   (merge-attrs
    {:type "button"
     :data-component "re-frame-multi-step-trigger"
     :data-step-id (attr-value id)
     :data-state (name state)
     :disabled (not navigable?)}
    attrs)
    active?
    (assoc :aria-current "step")

    (and navigable? action (not (:on-click attrs)))
    (assoc :on-click (action-handler action))))

(defn step-trigger
  [{:keys [index label] :as step}]
  [:button (step-trigger-attrs step)
   [:span {:data-part "step-marker"
           :aria-hidden "true"}
    (inc index)]
   [:span {:data-part "step-label"} label]])

(defn timeline
  [{:keys [steps active-id aria-label attrs list-attrs]}]
  (let [items (model/step-items steps active-id)]
    [:nav (cond->
           (merge-attrs
            {:data-component "re-frame-multi-step-timeline"}
            attrs)
            aria-label
            (assoc :aria-label aria-label))
     (into
      [:ol (merge-attrs
            {:data-component "re-frame-multi-step-list"}
            list-attrs)]
      (for [item items]
        ^{:key (:id item)}
        [:li {:data-component "re-frame-multi-step-item"
              :data-step-id (attr-value (:id item))
              :data-state (name (:state item))}
         [step-trigger item]]))]))

(defn step-panel
  [{:keys [active-id content attrs panel-tag]}]
  (let [panel-tag* (or panel-tag :section)]
    (into
     [panel-tag*
      (merge-attrs
       {:data-component "re-frame-multi-step-panel"
        :data-step-id (attr-value active-id)}
       attrs)]
     (child-nodes content))))

(defn multi-step
  [{:keys [steps
           active-id
           content
           footer
           aria-label
           attrs
           timeline-attrs
           list-attrs
           panel-attrs
           panel-tag
           footer-attrs]}]
  (let [active-id* (model/normalize-active-id steps active-id)]
    (into
     [:div (merge-attrs
            {:data-component "re-frame-multi-step"
             :data-active-step-id (attr-value active-id*)}
            attrs)
      [timeline {:steps steps
                 :active-id active-id*
                 :aria-label aria-label
                 :attrs timeline-attrs
                 :list-attrs list-attrs}]
      [step-panel {:active-id active-id*
                   :content content
                   :attrs panel-attrs
                   :panel-tag panel-tag}]]
     (when footer
       [[:footer
         (merge-attrs
          {:data-component "re-frame-multi-step-footer"}
          footer-attrs)
         footer]]))))
