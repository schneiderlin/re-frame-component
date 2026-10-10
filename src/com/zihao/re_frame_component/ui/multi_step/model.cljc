(ns com.zihao.re-frame-component.ui.multi-step.model)

(defn normalize-active-id
  [steps active-id]
  (let [step-ids (mapv :id steps)]
    (if (some #(= active-id %) step-ids)
      active-id
      (first step-ids))))

(defn step-items
  [steps active-id]
  (let [steps* (vec steps)
        active-id* (normalize-active-id steps* active-id)
        active-index (first
                      (keep-indexed
                       (fn [index step]
                         (when (= active-id* (:id step))
                           index))
                       steps*))]
    (mapv
     (fn [index step]
       (let [state (cond
                     (< index active-index) :complete
                     (= index active-index) :active
                     :else :upcoming)]
         (assoc step
                :index index
                :state state
                :active? (= :active state)
                :complete? (= :complete state)
                :upcoming? (= :upcoming state)
                :navigable? (and (= :complete state)
                                 (some? (:action step))
                                 (not (:disabled? step))))))
     (range (count steps*))
     steps*)))
