(ns com.zihao.re-frame-component.router.model
  "Pure route and navigation helpers for re-frame2 apps."
  (:require
   [clojure.string :as str])
  #?(:clj
     (:import
      [java.net URLDecoder URLEncoder])))

(def default-not-found-route-id :not-found)

(defn encode-component
  [value]
  #?(:clj
     (-> (URLEncoder/encode (str value) "UTF-8")
         (str/replace "+" "%20"))
     :cljs
     (js/encodeURIComponent (str value))))

(defn decode-component
  [value]
  #?(:clj
     (URLDecoder/decode (str value) "UTF-8")
     :cljs
     (js/decodeURIComponent (str value))))

(defn route-table
  "Index route specs with app-owned default/not-found route ids."
  ([route-specs]
   (route-table route-specs {}))
  ([route-specs {:keys [default-route-id not-found-route-id]}]
   (let [specs (vec route-specs)
         by-id (into {} (map (juxt :id identity) specs))]
     (doseq [[attr route-id] {:default-route-id default-route-id
                              :not-found-route-id not-found-route-id}
             :when route-id]
       (when-not (contains? by-id route-id)
         (throw (ex-info "Route id is not present in route specs"
                         {:attr attr
                          :route-id route-id}))))
     {:route-specs specs
      :route-by-id by-id
      :default-route-id default-route-id
      :not-found-route-id (or not-found-route-id default-not-found-route-id)})))

(defn spec-by-id
  [table route-id]
  (get-in table [:route-by-id route-id]))

(defn normalize-fragment
  [location]
  (let [fragment (cond-> (or location "")
                   (str/starts-with? (or location "") "#") (subs 1))
        fragment (if (str/blank? fragment) "/" fragment)]
    (if (str/starts-with? fragment "/")
      fragment
      (str "/" fragment))))

(defn split-query
  [fragment]
  (let [[path query-string] (str/split fragment #"\?" 2)]
    {:path (if (str/blank? path) "/" path)
     :query-string query-string}))

(defn path-segments
  [path]
  (let [path* (str/replace (or path "") #"^/|/$" "")]
    (if (str/blank? path*)
      []
      (mapv decode-component (str/split path* #"/")))))

(defn parse-query-pair
  [part]
  (let [[raw-key raw-value] (str/split part #"=" 2)
        key* (some-> raw-key decode-component keyword)
        value* (decode-component (or raw-value ""))]
    (when key*
      [key* value*])))

(defn parse-query
  [query-string]
  (if (str/blank? query-string)
    {}
    (->> (str/split query-string #"&")
         (keep parse-query-pair)
         (into {}))))

(defn encode-query-entry
  [[k v]]
  (when-not (nil? v)
    (str (encode-component (name k))
         "="
         (encode-component v))))

(defn render-query
  [query]
  (let [entries (->> query
                     (sort-by (comp name key))
                     (keep encode-query-entry))]
    (when (seq entries)
      (str "?" (str/join "&" entries)))))

(defn match-segments
  [spec segments]
  (when (= (count (:segments spec)) (count segments))
    (loop [patterns (:segments spec)
           values segments
           params {}]
      (cond
        (empty? patterns)
        params

        (keyword? (first patterns))
        (recur (rest patterns)
               (rest values)
               (assoc params (first patterns) (first values)))

        (= (first patterns) (first values))
        (recur (rest patterns) (rest values) params)

        :else
        nil))))

(defn- default-route-match
  [table segments]
  (when (and (empty? segments) (:default-route-id table))
    (when-let [spec (spec-by-id table (:default-route-id table))]
      (assoc spec :params {}))))

(defn match-route
  [table segments]
  (or (default-route-match table segments)
      (some (fn [spec]
              (when-let [params (match-segments spec segments)]
                (assoc spec :params params)))
            (:route-specs table))))

(defn match-location
  [table location]
  (let [{:keys [path query-string]} (-> location normalize-fragment split-query)
        segments (path-segments path)
        query (parse-query query-string)]
    (if-let [match (match-route table segments)]
      {:id (:id match)
       :path path
       :params (:params match)
       :query query
       :not-found? false}
      {:id (:not-found-route-id table)
       :path path
       :params {}
       :query query
       :not-found? true})))

(defn path-for-route
  [table route-id params]
  (let [spec (or (spec-by-id table route-id)
                 (throw (ex-info "Unknown route id"
                                 {:route-id route-id})))
        segments (mapv (fn [segment]
                         (if (keyword? segment)
                           (if-some [value (get params segment)]
                             (encode-component value)
                             (throw (ex-info "Missing route parameter"
                                             {:route-id route-id
                                              :param segment})))
                           segment))
                       (:segments spec))]
    (if (seq segments)
      (str "/" (str/join "/" segments))
      "/")))

(defn href
  ([table route-id]
   (href table route-id {} {}))
  ([table route-id params]
   (href table route-id params {}))
  ([table route-id params query]
   (str "#" (path-for-route table route-id params) (render-query query))))

(defn spec-for-route
  [table route]
  (spec-by-id table (:id route)))

(defn nav-spec?
  [spec]
  (boolean (:nav spec)))

(defn visible-nav-spec?
  [spec]
  (and (nav-spec? spec)
       (some? (get-in spec [:nav :label]))))

(defn nav-order
  [spec]
  (or (get-in spec [:nav :order]) 0))

(defn primary-nav-spec?
  [spec]
  (and (visible-nav-spec? spec)
       (nil? (get-in spec [:nav :parent]))))

(defn primary-route-ids
  [table]
  (->> (:route-specs table)
       (filter primary-nav-spec?)
       (map :id)
       set))

(defn active-nav-state
  [table route]
  (when-let [spec (spec-for-route table route)]
    (when (nav-spec? spec)
      (let [route-id (:id spec)
            parent-id (get-in spec [:nav :parent])]
        {:active-id route-id
         :active-parent-id (or parent-id
                               (when (primary-nav-spec? spec)
                                 route-id))}))))

(defn nav-href
  [table spec]
  (let [{:keys [params query]} (:nav spec)]
    (href table (:id spec) (or params {}) (or query {}))))

(defn nav-item
  ([table route spec]
   (nav-item table route spec nil))
  ([table route spec children]
   (let [{:keys [active-id active-parent-id]} (active-nav-state table route)
         id (:id spec)]
     (cond-> {:id id
              :label (get-in spec [:nav :label])
              :href (nav-href table spec)
              :active? (or (= active-id id)
                           (= active-parent-id id))
              :current? (= (:id route) id)}
       (seq children)
       (assoc :children children)))))

(defn nav-model
  [table route]
  (let [visible-specs (filter visible-nav-spec? (:route-specs table))
        grouped (group-by #(get-in % [:nav :parent]) visible-specs)
        children-by-parent (into {}
                                 (for [[parent specs] grouped
                                       :when parent]
                                   [parent (->> specs
                                                (sort-by nav-order)
                                                (mapv #(nav-item table route % nil)))]))
        primary (->> (get grouped nil)
                     (sort-by nav-order)
                     (mapv #(nav-item table route % (get children-by-parent (:id %)))))
        active-state (active-nav-state table route)
        active-parent-id (:active-parent-id active-state)
        secondary (some (fn [item]
                          (when (= active-parent-id (:id item))
                            (:children item)))
                        primary)]
    (merge {:items primary
            :secondary-items (vec secondary)}
           active-state)))

(defn page-model
  [table route]
  {:route route
   :nav (nav-model table route)
   :page-id (:id route)})

(defn route-location
  [table route]
  (if (:not-found? route)
    (str "#" (:path route) (render-query (:query route)))
    (href table (:id route) (:params route) (:query route))))
