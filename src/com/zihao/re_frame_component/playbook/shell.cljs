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

(def empty-tools
  "Catalog tool source used when a host does not supply one."
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

(defn- tool-link [tool selected-id select-tool!]
  [:button.playbook-tool-link
   {:type "button"
    :data-tool-id (str (:id tool))
    :data-selected (= (:id tool) selected-id)
    :on-click #(select-tool! (:id tool))}
   [:span.playbook-scene-title (display-title (:title tool))]])

(defn- tool-host [tool]
  (let [frame* (r/atom nil)]
    (r/create-class
     {:display-name "re-frame2-playbook-tool"
      :component-did-mount
      (fn [_this]
        (reset! frame*
                (rf/make-frame {:id (keyword "re-frame-component.playbook-tool"
                                             (name (:id tool)))
                                :doc (str "Web Playbook tool " (:id tool))})))
      :component-will-unmount
      (fn [_this]
        (when-let [frame @frame*]
          (rf/destroy-frame! frame)
          (reset! frame* nil)))
      :reagent-render
      (fn [tool]
        (if-let [frame @frame*]
          (if-let [view (rf/view (:component tool))]
            [:div.playbook-tool-workspace
             {:data-tool-id (str (:id tool))}
             [rf/frame-provider {:frame frame}
              [view (:args tool)]]]
            [:section.playbook-empty {:data-state "unknown-tool-view"}
             [:strong "Registered view not found"]
             [:code (str (:component tool))]])
          [:section.playbook-empty {:data-state "creating-tool-frame"}
           "Creating tool frame…"]))})))

(defn- toolbar [{:keys [tool-id viewport theme]} update-state!]
  [:header.playbook-toolbar
   [:div.playbook-toolbar__identity
    [:strong "Web UI Playbook"]
    [:span "re-frame2"]]
   (when-not tool-id
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
       (if (= theme :dark) "Light" "Dark")]])])

(defn catalog-shell
  ([] (catalog-shell {}))
  ([{:keys [embedded? scenes tools]}]
   (let [scenes (or scenes empty-scenes)
         tools (or tools empty-tools)
         initial-route (route/match-hash (current-hash))
         route-id (:scene-id initial-route)
         route-tool-id (:tool-id initial-route)
         initial-id (when-not route-tool-id
                      (or route-id (some-> @scenes first :id)))
         root-node* (atom nil)
         state* (r/atom {:scene-id initial-id
                         :tool-id route-tool-id
                         :query ""
                         :scope nil
                         :viewport :responsive
                         :theme :light})
         select-scene! (fn [scene-id]
                         (swap! state* assoc :scene-id scene-id :tool-id nil)
                         (push-hash! (route/href scene-id)))
         select-tool! (fn [tool-id]
                        (swap! state* assoc :scene-id nil :tool-id tool-id)
                        (push-hash! (route/tool-href tool-id)))]
     (r/create-class
      {:display-name "re-frame2-playbook"
       :component-did-mount
       (fn [_this]
         (when (and initial-id (nil? route-id) (nil? route-tool-id))
           (replace-hash! (route/href initial-id)))
         (when-let [root-node @root-node*]
           (agent/install! root-node scenes select-scene!))
         (let [listener (fn [_]
                          (when-let [matched (route/match-hash (current-hash))]
                            (swap! state* assoc
                                   :scene-id (:scene-id matched)
                                   :tool-id (:tool-id matched))))]
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
               all-tools (model/catalog-tools @tools)
               {:keys [scene-id tool-id query scope viewport theme] :as state} @state*
               selected-scene (model/find-scene all-scenes scene-id)
               selected-tool (model/find-tool all-tools tool-id)
               visible (model/filter-scenes all-scenes {:query query :scope scope})
               width (get viewport-widths viewport)]
           [:div.playbook-shell
            {:data-theme (name theme)
             :data-embedded (str (boolean embedded?))
             :ref #(reset! root-node* %)}
            [toolbar state (partial swap! state*)]
            [:div.playbook-body
             [:aside.playbook-catalog
              (when (seq all-tools)
                [:nav.playbook-tool-list {:aria-label "Playbook tools"}
                 (for [tool all-tools]
                   ^{:key (str (:id tool))}
                   [tool-link tool tool-id select-tool!])])
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
                tool-id
                (if selected-tool
                  ^{:key (str tool-id)} [tool-host selected-tool]
                  [:section.playbook-empty {:data-state "tool-not-found"}
                   [:strong "Tool not found"]
                   [:code (str tool-id)]])

                (nil? scene-id)
                [:section.playbook-empty
                 {:data-state (if (seq all-scenes) "no-selection" "no-scenes")}
                 (if (seq all-scenes)
                   "Choose a scene from the Catalog."
                   "No scenes in the Catalog yet.")]

                (nil? selected-scene)
                [:section.playbook-empty {:data-state "scene-not-found"}
                 [:strong "Scene not found"]
                 [:code (str scene-id)]]

                :else
                [:div.playbook-stage-scroll
                 [:section.playbook-stage
                  {:data-viewport (name viewport)
                   :data-theme (name theme)
                   :style (when width {:width (str width "px")})}
                  ^{:key (str scene-id)} [scene-host selected-scene]]])]]]))}))))

(defn mount!
  "Mount the Playbook shell as the whole surface at `dom-node`.

  `opts` accepts host-owned deref-able `:scenes` and `:tools` collections."
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
