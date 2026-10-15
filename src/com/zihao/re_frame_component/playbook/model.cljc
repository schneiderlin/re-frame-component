(ns com.zihao.re-frame-component.playbook.model
  "Pure scene declarations and Catalog filtering."
  (:require
   [clojure.string :as str]))

(def scope-tags #{:element :component :page})

(defn data-shaped?
  "True when a value can be registered without runtime closures."
  [value]
  (cond
    (fn? value) false
    (map? value) (every? (fn [[k v]]
                           (and (data-shaped? k) (data-shaped? v)))
                         value)
    (set? value) (every? data-shaped? value)
    (sequential? value) (every? data-shaped? value)
    :else true))

(defn- humanize [value]
  (-> value name (str/replace #"[-_]" " ") str/capitalize))

(defn- normalize-ns-segment [value]
  (let [s (-> value name (str/replace-first #"^:" "") str/trim)]
    (when (str/blank? s)
      (throw (ex-info "Namespace segment cannot be blank" {:value value})))
    (-> s
        (str/replace #"_" "-")
        (str/replace #"[^A-Za-z0-9.-]" "-")
        (str/replace #"-+" "-"))))

(defn scene-id
  "Return the conventional stable scene id for a module state."
  [app-ns module-id state-id]
  (keyword (str (normalize-ns-segment app-ns)
                ".ui."
                (normalize-ns-segment module-id))
           (normalize-ns-segment state-id)))

(defn normalize-scene
  [{:keys [id title component args initial-events tags scope] :as scene}]
  (when-not (keyword? id)
    (throw (ex-info "Playbook scene :id must be a keyword" {:scene scene})))
  (when-not (keyword? component)
    (throw (ex-info "Playbook scene :component must be a registered view id"
                    {:scene-id id :component component})))
  (when-not (data-shaped? scene)
    (throw (ex-info "Playbook scene declarations must not contain functions"
                    {:scene-id id})))
  (let [scope (or scope :component)]
    (when-not (contains? scope-tags scope)
      (throw (ex-info "Playbook scene :scope must be :element, :component, or :page"
                      {:scene-id id :scope scope})))
    (-> scene
        (assoc :title (or title (humanize (name id)))
               :args (or args {})
               :initial-events (vec (or initial-events []))
               :tags (set (or tags #{}))
               :scope scope))))

(defn module-scenes
  "Expand module states into flat, independently addressable scenes.

  Each state is `[state-id args]` or `[state-id args scene-options]`."
  [{:keys [app-ns module-id component title tags scope states]}]
  (mapv (fn [[state-id args options]]
          (normalize-scene
           (merge {:id (scene-id app-ns module-id state-id)
                   :title (str (or title (humanize module-id)) " · "
                               (humanize state-id))
                   :component component
                   :args args
                   :tags tags
                   :scope scope}
                  options)))
        states))

(defn searchable-text [{:keys [id title doc tags]}]
  (str/lower-case
   (str id " "
        (if (map? title) (str/join " " (vals title)) title) " "
        doc " " (str/join " " (map name tags)))))

(defn filter-scenes
  [scenes {:keys [query scope tag]}]
  (let [query (str/lower-case (str/trim (or query "")))]
    (->> scenes
         (filter #(or (str/blank? query)
                      (str/includes? (searchable-text %) query)))
         (filter #(or (nil? scope) (= scope (:scope %))))
         (filter #(or (nil? tag) (contains? (:tags %) tag)))
         vec)))
