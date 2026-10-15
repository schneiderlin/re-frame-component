(ns com.zihao.re-frame-component.playbook.agent
  "Browser bridge for deterministic access to the mounted Playbook."
  (:require
   [com.zihao.re-frame-component.playbook.registry :as registry]
   [com.zihao.re-frame-component.playbook.route :as route]
   [re-frame.core :as rf]))

(def bridge-version 1)
(defonce ^:private active-node* (atom nil))
(defonce ^:private selected-scene* (atom nil))

(defn- id->str [value]
  (some-> value str))

(defn- json-data [value]
  (cond
    (keyword? value) (str value)
    (symbol? value) (str value)
    (map? value) (into {}
                       (map (fn [[k v]]
                              [(cond
                                 (keyword? k) (subs (str k) 1)
                                 (symbol? k) (str k)
                                 :else k)
                               (json-data v)]))
                       value)
    (set? value) (->> value (map json-data) (sort-by str) vec)
    (sequential? value) (mapv json-data value)
    :else value))

(defn- scene-entry [{:keys [id title doc component scope tags]}]
  (cond-> {:id (id->str id)
           :title title
           :component (id->str component)
           :scope (id->str scope)
           :tags (mapv id->str (sort-by str tags))}
    doc (assoc :doc doc)))

(defn catalog-data []
  {:version bridge-version
   :scenes (mapv scene-entry (registry/scenes))})

(defn selection-data []
  {:scene-id (id->str @selected-scene*)
   :frame-id (id->str @selected-scene*)})

(defn inspect-data []
  (let [scene-id @selected-scene*]
    {:version bridge-version
     :selection (selection-data)
     :pair2 {:ok? true
             :frames (vec (rf/frame-ids))
             :selected-frame scene-id}
     :app-db (when scene-id (rf/app-db-value scene-id))
     :epochs (when scene-id
               (->> (rf/epoch-history scene-id)
                    (take-last 20)
                    (mapv #(select-keys % [:epoch-id :frame :event-id :effects]))))}))

(defn set-selection! [scene-id]
  (reset! selected-scene* scene-id)
  (when-let [node @active-node*]
    (if scene-id
      (.setAttribute node "data-playbook-scene" (str scene-id))
      (.removeAttribute node "data-playbook-scene")))
  (selection-data))

(defn- js-result [f]
  (fn [& args]
    (try
      (clj->js (json-data (apply f args)))
      (catch :default error
        (clj->js (json-data {:ok? false
                             :reason :bridge-error
                             :message (.-message error)}))))))

(defn install!
  [dom-node select-scene!]
  (reset! active-node* dom-node)
  (.setAttribute dom-node "data-re-frame2-playbook" "true")
  (aset js/globalThis
        "__reFrame2Playbook"
        (js-obj
         "version" bridge-version
         "catalog" (js-result catalog-data)
         "selection" (js-result selection-data)
         "inspect" (js-result inspect-data)
         "selectScene"
         (js-result
          (fn [scene-id]
            (let [scene-id (route/id-string->keyword scene-id)]
              (if (registry/scene scene-id)
                (do (select-scene! scene-id)
                    {:ok? true :selection (selection-data)})
                {:ok? false :reason :unknown-scene :scene-id scene-id}))))))
  {:ok? true :version bridge-version})

(defn uninstall! []
  (set-selection! nil)
  (when-let [node @active-node*]
    (.removeAttribute node "data-re-frame2-playbook")
    (.removeAttribute node "data-playbook-scene"))
  (reset! active-node* nil)
  (js-delete js/globalThis "__reFrame2Playbook")
  nil)
