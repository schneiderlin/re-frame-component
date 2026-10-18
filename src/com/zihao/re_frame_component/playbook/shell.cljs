(ns com.zihao.re-frame-component.playbook.shell
  "Own Catalog and Stage shell for re-frame2 scenes.

  The shell is a function of a host-supplied Scene collection. It holds no
  process-global catalog, so hosts own aggregation and may add Scenes at any
  time by updating the deref-able they pass in `:scenes`."
  (:require
   [com.zihao.re-frame-component.playbook.agent :as agent]
   [com.zihao.re-frame-component.playbook.model :as model]
   [com.zihao.re-frame-component.playbook.route :as route]
   [re-frame.core :as rf]
   [re-frame.views]
   [reagent.core :as r]
   [reagent.dom.client :as rdom]))

(defonce ^:private root* (atom nil))
(defonce ^:private hash-listener* (atom nil))

(def empty-scenes
  "Catalog source used when a host does not supply one."
  (r/atom []))

(def viewport-widths
  {:phone 390
   :tablet 768
   :desktop 1280})

(defn current-hash []
  (or (.. js/window -location -hash) ""))

(defn playbook-hash? [hash]
  (route/playbook-hash? hash))

(defn- display-title [title]
  (if (map? title)
    (or (:zh title) (:en title) (first (vals title)))
    title))

(defn- replace-hash! [hash]
  (.replaceState js/history nil ""
                 (str (.. js/window -location -pathname)
                      (.. js/window -location -search)
                      hash)))

(defn- push-hash! [hash]
  (.pushState js/history nil ""
              (str (.. js/window -location -pathname)
                   (.. js/window -location -search)
                   hash)))

(defn- scene-host [scene]
  (let [frame* (r/atom nil)]
    (r/create-class
     {:display-name "re-frame2-playbook-scene"
      :component-did-mount
      (fn [_this]
        (let [frame (rf/make-frame {:id (:id scene)
                                    :initial-events (:initial-events scene)
                                    :doc (str "Web Playbook scene " (:id scene))})]
          (reset! frame* frame)
          (agent/set-selection! (:id scene))))
      :component-will-unmount
      (fn [_this]
        (when-let [frame @frame*]
          (rf/destroy-frame! frame)
          (reset! frame* nil))
        (agent/set-selection! nil))
      :reagent-render
      (fn [scene]
        (if-let [frame @frame*]
          (if-let [view (rf/view (:component scene))]
            [rf/frame-provider {:frame frame}
             [view (:args scene)]]
            [:section.playbook-empty {:data-state "unknown-view"}
             [:strong "Registered view not found"]
             [:code (str (:component scene))]])
          [:section.playbook-empty {:data-state "creating-frame"}
           "Creating isolated scene frame…"]))})))

(defn- scene-link [scene selected-id select-scene!]
  [:button.playbook-scene-link
   {:type "button"
    :data-selected (= (:id scene) selected-id)
    :on-click #(select-scene! (:id scene))}
   [:span.playbook-scene-title (display-title (:title scene))]
   [:span.playbook-scene-scope (name (:scope scene))]])

(defn- toolbar [{:keys [viewport theme]} update-state!]
  [:header.playbook-toolbar
   [:div.playbook-toolbar__identity
    [:strong "Web UI Playbook"]
    [:span "re-frame2"]]
   [:div.playbook-toolbar__controls
    [:label.playbook-control
     [:span "Viewport"]
     [:select {:value (name viewport)
               :on-change #(update-state! assoc :viewport
                                          (keyword (.. % -target -value)))}
      [:option {:value "responsive"} "Responsive"]
      [:option {:value "phone"} "Phone · 390"]
      [:option {:value "tablet"} "Tablet · 768"]
      [:option {:value "desktop"} "Desktop · 1280"]]]
    [:button.playbook-icon-button
     {:type "button"
      :aria-label "Toggle preview theme"
      :on-click #(update-state! update :theme
                                (fn [value] (if (= value :dark) :light :dark)))}
     (if (= theme :dark) "Light" "Dark")]]])

(defn catalog-shell
  ([] (catalog-shell {}))
  ([{:keys [embedded? scenes]}]
   (let [scenes (or scenes empty-scenes)
         initial-route (route/match-hash (current-hash))
         route-id (:scene-id initial-route)
         initial-id (or route-id (some-> @scenes first :id))
         root-node* (atom nil)
         state* (r/atom {:scene-id initial-id
                         :query ""
                         :scope nil
                         :viewport :responsive
                         :theme :light})
         select-scene! (fn [scene-id]
                         (swap! state* assoc :scene-id scene-id)
                         (push-hash! (route/href scene-id)))]
     (r/create-class
      {:display-name "re-frame2-playbook"
       :component-did-mount
       (fn [_this]
         (when (and initial-id (nil? route-id))
           (replace-hash! (route/href initial-id)))
         (when-let [root-node @root-node*]
           (agent/install! root-node scenes select-scene!))
         (let [listener (fn [_]
                          (when-let [matched (route/match-hash (current-hash))]
                            (swap! state* assoc :scene-id (:scene-id matched))))]
           (.addEventListener js/window "hashchange" listener)
           (reset! hash-listener* listener)))
       :component-will-unmount
       (fn [_this]
         (when-let [listener @hash-listener*]
           (.removeEventListener js/window "hashchange" listener)
           (reset! hash-listener* nil))
         (agent/uninstall!))
       ;; Props only reach this shell once, so the Catalog derefs the host's
       ;; source inside the render fn. Reaction and ratom sources re-render on
       ;; change without remounting the selected Scene.
       :reagent-render
       (fn []
         (let [all-scenes (vec @scenes)
               {:keys [scene-id query scope viewport theme] :as state} @state*
               selected (model/find-scene all-scenes scene-id)
               visible (model/filter-scenes all-scenes {:query query :scope scope})
               width (get viewport-widths viewport)]
           [:div.playbook-shell
            {:data-theme (name theme)
             :data-embedded (str (boolean embedded?))
             :ref #(reset! root-node* %)}
            [toolbar state (partial swap! state*)]
            [:div.playbook-body
             [:aside.playbook-catalog
              [:div.playbook-catalog__filters
               [:input.playbook-search
                {:type "search"
                 :placeholder "Search scenes"
                 :value query
                 :on-change #(swap! state* assoc :query (.. % -target -value))}]
               [:div.playbook-scope-filter
                (for [[value label] [[nil "All"] [:element "Elements"]
                                     [:component "Components"] [:page "Pages"]]]
                  ^{:key (str value)}
                  [:button {:type "button"
                            :data-selected (= scope value)
                            :on-click #(swap! state* assoc :scope value)}
                   label])]]
              [:nav.playbook-scene-list {:aria-label "Playbook scenes"}
               (for [scene visible]
                 ^{:key (str (:id scene))}
                 [scene-link scene scene-id select-scene!])]]
             [:main.playbook-workspace
              (cond
                (nil? scene-id)
                [:section.playbook-empty
                 {:data-state (if (seq all-scenes) "no-selection" "no-scenes")}
                 (if (seq all-scenes)
                   "Choose a scene from the Catalog."
                   "No scenes in the Catalog yet.")]

                (nil? selected)
                [:section.playbook-empty {:data-state "scene-not-found"}
                 [:strong "Scene not found"]
                 [:code (str scene-id)]]

                :else
                [:div.playbook-stage-scroll
                 [:section.playbook-stage
                  {:data-viewport (name viewport)
                   :data-theme (name theme)
                   :style (when width {:width (str width "px")})}
                  ^{:key (str scene-id)} [scene-host selected]]])]]]))}))))

(defn mount!
  "Mount the Playbook shell as the whole surface at `dom-node`.

  `opts` accepts `:scenes`, a deref-able Scene collection assembled by the host."
  ([dom-node] (mount! dom-node {}))
  ([dom-node opts]
   (let [root (or @root* (reset! root* (rdom/create-root dom-node)))]
     (.render root (r/as-element [catalog-shell opts]))
     root)))

(defn unmount! []
  (when-let [root @root*]
    (.unmount root)
    (reset! root* nil))
  nil)
