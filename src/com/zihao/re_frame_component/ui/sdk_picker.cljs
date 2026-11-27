(ns com.zihao.re-frame-component.ui.sdk-picker
  "Reagent bindings for the ui-sdk Web pickers."
  (:require
   [clojure.string :as str]
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]
   [reagent.core :as r]))

(defn- element-loader [part]
  (let [tag (str "ui-" part)
        url (str "/re-frame-component/ui-sdk/" part ".js")
        state (r/atom :idle)
        defined? (fn [] (some-> js/window .-customElements (.get tag)))]
    {:ready? #(or (defined?) (= :ready @state))
     :load! (fn []
              (when (and (= :idle @state) (not (defined?)))
                (reset! state :loading)
                (let [script (js/document.createElement "script")]
                  (set! (.-type script) "module")
                  (set! (.-src script) url)
                  (set! (.-onload script) #(reset! state (if (defined?) :ready :error)))
                  (set! (.-onerror script)
                        (fn [error]
                          (reset! state :error)
                          (js/console.error "re-frame-component: failed to load" url error)))
                  (.appendChild js/document.head script))))}))

(defonce ^:private command-loader (element-loader "command"))
(defonce ^:private combobox-loader (element-loader "combobox"))

(defn- listen! [^js node event handler capture?]
  (.addEventListener node event handler capture?)
  #(.removeEventListener node event handler capture?))

(defn- guard-ime! [node input]
  (let [composing? (volatile! false)
        start (listen! input "compositionstart" #(vreset! composing? true) false)
        end (listen! input "compositionend" #(vreset! composing? false) false)
        blur (listen! input "blur" #(vreset! composing? false) false)
        keydown (listen! node "keydown"
                         (fn [^js event]
                           (when (and (identical? input (.-target event))
                                      (= "Enter" (.-key event))
                                      (or @composing? (ime-safe/input-event-composing? event)))
                             ;; Capture before the SDK's listener on the native input.
                             ;; Don't cancel the IME's default candidate confirmation.
                             (.stopPropagation event)))
                         true)]
    #(do (start) (end) (blur) (keydown))))

(defn- picker-element [{:keys [ready? load!]} _]
  (let [node* (volatile! nil)
        binding* (volatile! nil)
        ref (fn [node] (vreset! node* node) nil)
        sync! (fn [this]
                (when-let [^js node @node*]
                  (let [[{:keys [bind!]} props] (rest (r/argv this))]
                    (when-not @binding*
                      (let [input (.querySelector node "input")
                            {:keys [cleanup!] :as binding} (bind! node input)]
                        (vreset! binding*
                                 (if input
                                   (let [unguard! (guard-ime! node input)]
                                     (assoc binding :cleanup! #(do (unguard!) (cleanup!))))
                                   binding))))
                    ((:sync! @binding*) props))))]
    (r/create-class
     {:display-name "re-frame-component-sdk-picker"
      :component-did-mount (fn [this] (load!) (sync! this))
      :component-did-update (fn [this _] (sync! this))
      :component-will-unmount (fn [_]
                                (when-let [cleanup! (:cleanup! @binding*)] (cleanup!))
                                (vreset! binding* nil))
      :reagent-render (fn [{:keys [markup]} props]
                        (when (ready?)
                          (assoc-in (markup props) [1 :ref] ref)))})))

(defn- input-markup [input-attrs]
  ;; The SDK writes both the displayed text and the native disabled/ARIA state.
  [:input (dissoc input-attrs :value :default-value :disabled :type)])

(defn- command-item [parts {:keys [value label keywords description]}]
  ^{:key value}
  [:ui-command-item (assoc (:item parts) :value value :label label :keywords (str/join "," keywords))
   [:span {:data-command-label ""} label]
   (when (seq description)
     [:span (assoc (:description parts) :data-command-description "") description])])

(defn- command-markup [querying? {:keys [items attrs input-attrs empty-label part-attrs show-idle?]}]
  [:ui-command (dissoc attrs :value :default-value :query :default-query
                       :pages :default-pages :items)
   [:ui-command-input (input-markup input-attrs)]
   [:div (assoc (:content part-attrs) :data-command-results "" :hidden (not (or querying? show-idle?)))
    (into [:ui-command-list (:list part-attrs)]
          (when (or querying? show-idle?) (map (partial command-item part-attrs) items)))
    [:ui-command-empty [:span (:empty part-attrs) (or empty-label "No results")]]]])

(defn- bind-command! [querying? ^js node ^js input]
  (let [props* (volatile! nil)
        ^js results (.querySelector node "[data-command-results]")
        sync-aria! (fn []
                     (let [expanded (str @querying?)]
                       (when-not (= expanded (.getAttribute input "aria-expanded"))
                         (.setAttribute input "aria-expanded" expanded))
                       (when (and (not @querying?) (.hasAttribute input "aria-activedescendant"))
                         (.removeAttribute input "aria-activedescendant"))))
        ;; Command assumes its list is always open. Reconcile the ARIA attributes
        ;; that depend on our additional visibility rule after SDK updates.
        observer (js/MutationObserver. sync-aria!)
        set-querying! (fn [query]
                        (let [active? (or (:show-idle? @props*) (not (str/blank? query)))]
                          (reset! querying? active?)
                          ;; Reflect visibility before the host can move focus.
                          (set! (.-hidden results) (not active?))
                          (sync-aria!)))
        unquery! (listen! node "querychange"
                          (fn [^js event] (set-querying! (.. event -detail -value))) false)
        unact! (listen! node "action"
                        (fn [^js event]
                          ;; `valuechange` is highlight, not activation.
                          (let [value (.. event -detail -value)
                                {:keys [items on-select show-idle?]} @props*]
                            (when (and (or show-idle? (not (str/blank? (.-query node))))
                                       (some #(= value (:value %)) items))
                              (set! (.-query node) "")
                              (set-querying! "")
                              (when on-select (on-select value))))) false)]
    (.observe observer input #js {:attributeFilter #js ["aria-expanded" "aria-activedescendant"]})
    {:sync! (fn [props]
              (vreset! props* props)
              (set-querying! (.-query node)))
     :cleanup! #(do (.disconnect observer) (unquery!) (unact!))}))

(defn command [_]
  (let [querying? (r/atom false)
        spec (assoc command-loader
                    :markup #(command-markup @querying? %)
                    :bind! (partial bind-command! querying?))]
    (fn [props] [picker-element spec props])))

(defn- combobox-markup [{:keys [attrs input-attrs empty-label part-attrs]}]
  [:ui-combobox (-> attrs
                    (dissoc :value :default-value :query :default-query :items
                            :open :default-open :disabled :read-only :container)
                    (assoc :multiple "false" :allow-custom-value "false"
                           :auto-highlight "true" :presentation "popover"))
   [:ui-combobox-input (input-markup input-attrs)]
   [:ui-combobox-content (assoc (:content part-attrs) :keep-mounted "" :hidden true)
    ;; The SDK owns the children of this list. Reagent only owns its shell.
    [:ui-combobox-list (:list part-attrs)]
    [:ui-combobox-empty [:span (:empty part-attrs) (or empty-label "No options")]]]
   (when-let [item-class (get-in part-attrs [:item :class])]
     [:template
      {:ref (fn [^js template]
              (when template
                ;; Data rows are cloned by the SDK from the template fragment.
                (let [content (.-content template)
                      item (or (.-firstElementChild content)
                               (.appendChild content (js/document.createElement "ui-combobox-item")))]
                  (.setAttribute item "class" item-class))))}])])

(defn- bind-combobox! [^js node _]
  (let [props* (volatile! nil)
        items* (volatile! nil)
        label* (volatile! nil)
        unvalue! (listen! node "valuechange"
                          (fn [^js event]
                            (let [^js detail (.-detail event)
                                  reason (.-reason detail)
                                  value (.-value detail)
                                  {:keys [on-select disabled?]} @props*]
                              ;; beta.10 requests a null value when typing deletes
                              ;; all the text. Cancel that (and other non-picker edits).
                              ;; Also cancel the SDK's own commit for a real pick:
                              ;; the caller commits it by passing :value back.
                              (when-not (= "imperative" reason)
                                (.preventDefault event)
                                (when (and (= "item-press" reason) (not disabled?)
                                           on-select (contains? @items* value))
                                  (on-select value))))) false)
        unquery! (listen! node "querychange"
                          (fn [^js event]
                            ;; A form reset shouldn't overwrite the controlled label.
                            (when (= "reset" (.. event -detail -reason))
                              (.preventDefault event))) false)]
    {:sync! (fn [{:keys [items value disabled?] :as props}]
              (when (or (nil? @items*) (not= items (:items @props*)))
                (vreset! items* (into {} (map (juxt :value :label)) items))
                (set! (.-items node) (clj->js (mapv #(select-keys % [:value :label :keywords]) items))))
              (vreset! props* props)
              (let [value (when (contains? @items* value) value)
                    label (get @items* value "")]
                (when (and disabled? (.-open node))
                  (set! (.-open node) false))
                (try
                  (when (not= value (.-value node))
                    ;; beta.10 also blocks imperative setValue when disabled.
                    (.removeAttribute node "disabled")
                    (set! (.-value node) value)
                    (set! (.-query node) label))
                  (when (and (not= label @label*) (not= label (.-query node)))
                    (set! (.-query node) label))
                  (vreset! label* label)
                  (finally (.toggleAttribute node "disabled" (boolean disabled?))))))
     :cleanup! #(do (unvalue!) (unquery!))}))

(def ^:private combobox-spec
  (assoc combobox-loader :markup combobox-markup :bind! bind-combobox!))

(defn combobox [props]
  [picker-element combobox-spec props])

(defn- select-markup [{:keys [items trigger-attrs part-attrs icon]}]
  [:ui-select {}
   [:ui-select-trigger
    [:button (assoc trigger-attrs :type "button")
     [:ui-select-value]
     icon]]
   [:ui-select-content (merge (:content part-attrs)
                              {:keep-mounted "" :hidden true :align "start" :side-offset "5"})
    (into [:ui-select-list (:list part-attrs)]
          (map (fn [{:keys [value label disabled?]}]
                 ^{:key value}
                 [:ui-select-item (cond-> (assoc (:item part-attrs) :value value :label label)
                                    disabled? (assoc :disabled ""))
                  label]))
          items)]])

(defn- bind-select! [^js node _]
  (let [props* (volatile! nil)
        unlisten! (listen! node "valuechange"
                           (fn [^js event]
                             (let [reason (.. event -detail -reason)
                                   next-value (.. event -detail -value)
                                   {:keys [value disabled? on-select]} @props*]
                               (when-not (= "imperative" reason)
                                 (.preventDefault event)
                                 (when (and on-select (not disabled?) (not= value next-value)
                                            (contains? #{"item-press" "list-navigation"} reason))
                                   (on-select next-value))))) false)]
    {:sync! (fn [{:keys [value disabled?] :as props}]
              (vreset! props* props)
              (when (not= value (.-value node))
                ;; SDK's imperative setter also respects disabled.
                (.removeAttribute node "disabled")
                (set! (.-value node) value))
              (.toggleAttribute node "disabled" (boolean disabled?)))
     :cleanup! unlisten!}))

(def ^:private select-spec
  (assoc (element-loader "select") :markup select-markup :bind! bind-select!))

(defn select [props]
  [picker-element select-spec props])
