(ns com.zihao.re-frame-component.ui.multi-step.interface
  (:require
   [com.zihao.re-frame-component.ui.multi-step.view :as view]))

(defn step-trigger-attrs
  "Builds semantic button attributes for one multi-step timeline item.

  `action` may be a handler, a re-frame event vector, or a sequence of event
  vectors. Caller attributes override defaults."
  [{:keys [id state active? navigable? action attrs]}]
  (view/step-trigger-attrs
   {:id id
    :state state
    :active? active?
    :navigable? navigable?
    :action action
    :attrs attrs}))

(defn step-trigger
  "Renders one numbered timeline trigger from a normalized step item."
  [{:keys [id index label state active? navigable? action attrs]}]
  [view/step-trigger
   {:id id
    :index index
    :label label
    :state state
    :active? active?
    :navigable? navigable?
    :action action
    :attrs attrs}])

(defn timeline
  "Renders the ordered step navigation for `steps` and `active-id`."
  [{:keys [steps active-id aria-label attrs list-attrs]}]
  [view/timeline
   {:steps steps
    :active-id active-id
    :aria-label aria-label
    :attrs attrs
    :list-attrs list-attrs}])

(defn step-panel
  "Renders the active step content in `panel-tag`, defaulting to a section."
  [{:keys [active-id content attrs panel-tag]}]
  [view/step-panel
   {:active-id active-id
    :content content
    :attrs attrs
    :panel-tag panel-tag}])

(defn multi-step
  "Renders a complete timeline, active content panel, and optional footer.

  Selection is caller-owned through `active-id`; completed step actions carry
  navigation behavior supplied by each step."
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
  [view/multi-step
   {:steps steps
    :active-id active-id
    :content content
    :footer footer
    :aria-label aria-label
    :attrs attrs
    :timeline-attrs timeline-attrs
    :list-attrs list-attrs
    :panel-attrs panel-attrs
    :panel-tag panel-tag
    :footer-attrs footer-attrs}])
