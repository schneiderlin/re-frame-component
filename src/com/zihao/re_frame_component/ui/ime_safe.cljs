(ns com.zihao.re-frame-component.ui.ime-safe)

(defn input-event-composing?
  "True while a keyboard event belongs to an IME composition.

   `field` owns composition text and gates its own `:on-key-down`, so this
   predicate is for hosts that handle shortcuts on a container instead of the
   field. Detects the standard flag plus the legacy `keyCode`/`which` 229 that
   older Chromium and Safari send while composing."
  [^js dom-event]
  (let [^js native-event (or (.-nativeEvent dom-event) dom-event)]
    (boolean
     (or (some-> dom-event .-isComposing)
         (some-> native-event .-isComposing)
         (= "insertCompositionText" (some-> native-event .-inputType))
         (= 229 (some-> dom-event .-keyCode))
         (= 229 (some-> native-event .-keyCode))
         (= 229 (some-> dom-event .-which))
         (= 229 (some-> native-event .-which))))))

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
    (fn [{:keys [value on-value on-blur on-key-down] :as props}]
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
                  :on-key-down (fn [event]
                                 (when (and on-key-down
                                            (not @composing?)
                                            (not (input-event-composing? event)))
                                   (on-key-down event)))
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
