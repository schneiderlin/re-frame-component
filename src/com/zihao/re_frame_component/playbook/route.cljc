(ns com.zihao.re-frame-component.playbook.route
  "Stable hash routes for the Web UI Playbook."
  (:require
   [clojure.string :as str]))

(defn playbook-hash? [hash]
  (boolean (re-find #"^#/playbook(?:[/?]|$)" (or hash ""))))

(defn- url-decode [value]
  (try
    #?(:clj (java.net.URLDecoder/decode (str value) "UTF-8")
       :cljs (js/decodeURIComponent (str/replace (str value) "+" "%20")))
    (catch #?(:clj Exception :cljs :default) _
      (str value))))

(defn- url-encode [value]
  #?(:clj (-> (java.net.URLEncoder/encode (str value) "UTF-8")
              (str/replace "+" "%20"))
     :cljs (js/encodeURIComponent (str value))))

(defn id-string->keyword [value]
  (when (and (string? value) (not (str/blank? value)))
    (keyword (str/replace-first value #"^:" ""))))

(defn- query-map [query]
  (into {}
        (keep (fn [part]
                (when-not (str/blank? part)
                  (let [[k v] (str/split part #"=" 2)]
                    [(keyword (url-decode k)) (url-decode (or v ""))]))))
        (str/split (or query "") #"&")))

(defn match-hash [hash]
  (when (playbook-hash? hash)
    (let [[path query] (str/split (subs (or hash "") 2) #"\?" 2)
          params (query-map query)
          tool-id (id-string->keyword (:tool params))]
      (cond-> {:surface :playbook
               :path path
               :scene-id (when-not tool-id (id-string->keyword (:scene params)))}
        tool-id (assoc :tool-id tool-id)))))

(defn href
  ([] "#/playbook")
  ([scene-id]
   (str "#/playbook"
        (when scene-id
          (str "?scene=" (url-encode (str scene-id)))))))

(defn tool-href
  "Render a Playbook location for a Catalog tool destination."
  [tool-id]
  (str "#/playbook"
       (when tool-id
         (let [value (str tool-id)]
           (str "?tool="
                (url-encode (if (keyword? tool-id)
                              (subs value 1)
                              value)))))))
