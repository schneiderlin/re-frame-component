(ns com.zihao.re-frame-component.ui.switch.model
  "The markup contract of one switch, without mounting it.

   The shared switch element renders two parts: a track that holds the setting
   and a thumb that shows its position. Everything the element needs to find them
   is expressed here as plain data, so the contract is provable on the JVM while
   the mounted behavior (presses, focus, controlled value) stays in
   `ui.switch`.")

(def track-tag
  "Tag name of the switch track element (`ui-switch`)."
  "ui-switch")

(def thumb-tag
  "Tag name of the switch thumb element (`ui-switch-thumb`)."
  "ui-switch-thumb")

(defn- element-attrs
  "Attributes rendered on the track: its id and everything the caller passes,
   minus the props the component drives on the DOM node."
  [{:keys [id attrs]}]
  (-> (merge {:id id} (or attrs {}))
      (dissoc :checked :checked? :disabled :disabled? :on-change :thumb-attrs :attrs)))

(defn- thumb-element-attrs
  [{:keys [thumb-attrs]}]
  (-> (or thumb-attrs {})
      (dissoc :checked :checked? :disabled :disabled? :on-change :thumb-attrs :attrs)))

(defn markup
  "The element tree of one switch.

   Parameters:
   - `props` — `{:id ... :attrs ... :thumb-attrs ...}`; `:attrs` is merged onto
     the track after its id, `:thumb-attrs` onto the thumb.

   Returns: hiccup `[track attrs [thumb attrs]]`, with the track tag
   `track-tag` and the thumb tag `thumb-tag`.

   Pure, and deliberately free of the checked and disabled state: the component
   writes those onto the DOM node, because a custom element reads a property for
   them and an attribute string would read as true when it says `false`."
  [props]
  [(keyword track-tag)
   (element-attrs props)
   [(keyword thumb-tag)
    (thumb-element-attrs props)]])
