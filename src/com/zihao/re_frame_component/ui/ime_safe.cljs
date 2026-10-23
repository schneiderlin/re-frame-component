(ns com.zihao.re-frame-component.ui.ime-safe)

(defn- event-value
  [event]
  (.. event -target -value))

(defn- sync-external-value!
  [node composing? last-external-value value]
  (let [value' (or value "")
        el @node]
    (when (and el
               (not @composing?)
               (not= value' @last-external-value)
               (not= value' (.-value el)))
      (set! (.-value el) value'))
    (reset! last-external-value value')))

(defn field
  [{:keys [tag]}]
  (let [node (atom nil)
        composing? (atom false)
        last-external-value (atom nil)]
    (fn [{:keys [value on-value on-blur] :as props}]
      (sync-external-value! node composing? last-external-value value)
      [tag
       (-> props
           (dissoc :tag :value :on-value)
           (assoc :default-value (or value "")
                  :ref #(reset! node %)
                  :on-composition-start #(reset! composing? true)
                  :on-composition-end (fn [event]
                                        (reset! composing? false)
                                        (when on-value
                                          (on-value (event-value event))))
                  :on-change (fn [event]
                               (when-not @composing?
                                 (when on-value
                                   (on-value (event-value event)))))
                  :on-blur (fn [event]
                             (when on-value
                               (on-value (event-value event)))
                             (when on-blur
                               (on-blur event)))))])))

(defn input
  [props]
  [field (assoc props :tag :input)])

(defn textarea
  [props]
  [field (assoc props :tag :textarea)])
