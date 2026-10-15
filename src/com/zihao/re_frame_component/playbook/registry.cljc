(ns com.zihao.re-frame-component.playbook.registry
  "Process-local registry of data-shaped Playbook scenes."
  (:require
   [com.zihao.re-frame-component.playbook.model :as model]))

(defonce ^:private scenes* (atom {}))

(defn clear! []
  (reset! scenes* {})
  nil)

(defn reg-scene!
  [scene]
  (let [{:keys [id] :as scene} (model/normalize-scene scene)]
    (swap! scenes* assoc id scene)
    id))

(defn reg-scenes!
  [scenes]
  (doseq [scene scenes]
    (reg-scene! scene))
  {:ok? true :scene-ids (mapv :id scenes)})

(defn scene [id]
  (get @scenes* id))

(defn scenes []
  (->> @scenes* vals (sort-by (comp str :id)) vec))
