(ns com.zihao.re-frame-component.ui.navbar
  "Generic navbar hiccup helpers that consume router nav models.")

(defn nav-link-attrs
  [{:keys [id href active? current?]} {:keys [class attrs]}]
  (cond-> (merge {:href href
                  :data-route-id (str id)
                  :data-active (str (boolean active?))
                  :aria-current (when current? "page")}
                 attrs)
    class
    (assoc :class class)))

(defn nav-link
  ([item]
   (nav-link item {}))
  ([{:keys [label] :as item} opts]
   [:a (nav-link-attrs item opts) label]))

(defn nav
  ([items]
   (nav items {}))
  ([items {:keys [class aria-label attrs link-options]}]
   (into [:nav (cond-> (merge attrs {})
                 class (assoc :class class)
                 aria-label (assoc :aria-label aria-label))]
         (for [item items]
           ^{:key (:id item)}
           [nav-link item link-options]))))

(defn primary-nav
  ([nav-model]
   (primary-nav nav-model {}))
  ([nav-model opts]
   [nav (:items nav-model) opts]))

(defn secondary-nav
  ([nav-model]
   (secondary-nav nav-model {}))
  ([nav-model opts]
   (when (seq (:secondary-items nav-model))
     [nav (:secondary-items nav-model) opts])))
