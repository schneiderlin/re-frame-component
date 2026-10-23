(ns com.zihao.re-frame-component.ui.filter-select.model
  (:require
   [clojure.string :as str]))

(def default-option-id :id)
(def default-option-label :label)
(def default-search-fields [:label :id :keywords])

(defn value-accessor
  [selector fallback]
  (cond
    (fn? selector) selector
    (keyword? selector) #(get % selector)
    (string? selector) #(get % selector)
    :else fallback))

(defn option-id
  [option opts]
  ((value-accessor (:option-id opts) #(:id %)) option))

(defn option-label
  [option opts]
  (or ((value-accessor (:option-label opts) #(:label %)) option)
      (option-id option opts)
      ""))

(defn option-description
  [option opts]
  (when-let [selector (:option-description opts)]
    ((value-accessor selector (constantly nil)) option)))

(defn option-disabled?
  [option opts]
  (boolean
   (when-let [selector (:option-disabled? opts)]
     ((value-accessor selector (constantly false)) option))))

(defn query-tokens
  [query]
  (->> (str/split (str/lower-case (str/trim (or query ""))) #"\s+")
       (remove str/blank?)
       vec))

(defn- value-parts
  [value]
  (cond
    (nil? value) []
    (string? value) [value]
    (keyword? value) [(name value)]
    (sequential? value) (mapcat value-parts value)
    (set? value) (mapcat value-parts value)
    :else [(str value)]))

(defn option-search-text
  [option opts]
  (let [fields (or (:option-search-fields opts) default-search-fields)]
    (->> fields
         (mapcat (fn [field]
                   (value-parts ((value-accessor field (constantly nil)) option))))
         (str/join " ")
         (str/lower-case))))

(defn default-filter-option?
  [option query opts]
  (let [tokens (query-tokens query)
        text (option-search-text option opts)]
    (or (empty? tokens)
        (every? #(str/includes? text %) tokens))))

(defn filter-options
  ([options query]
   (filter-options options query {}))
  ([options query opts]
   (let [filter-fn (or (:filter-fn opts) default-filter-option?)]
     (->> (or options [])
          (filter #(filter-fn % query opts))
          vec))))

(defn selected-option
  [options selected-id opts]
  (first
   (filter #(= selected-id (option-id % opts))
           (or options []))))

(defn bounded-index
  [index item-count]
  (cond
    (not (pos? item-count)) 0
    (neg? index) 0
    (>= index item-count) (dec item-count)
    :else index))

(defn selectable-index
  "Return the next enabled option index, wrapping in `direction`. Returns nil
  when every option is disabled or the collection is empty."
  [options current-index direction opts]
  (let [options (vec options)
        option-count (count options)]
    (when (pos? option-count)
      (some (fn [step]
              (let [index (mod (+ current-index (* direction step)) option-count)]
                (when-not (option-disabled? (nth options index) opts)
                  index)))
            (range 1 (inc option-count))))))
