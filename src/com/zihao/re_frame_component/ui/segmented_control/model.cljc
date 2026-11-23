(ns com.zihao.re-frame-component.ui.segmented-control.model
  "The markup contract of one segmented control, without mounting it.

   The shared elements render one answer on a short scale: a root that owns the
   radio group, one item per choice, and an optional indicator. Everything the
   elements need in order to find each other is plain data here, so the contract
   is provable on the JVM while the mounted behavior — roving focus, arrow-key
   navigation, presses, the controlled value — stays in `ui.segmented-control`.

   The caller owns every class, label and piece of copy; nothing here renders
   text or styles of its own.")

(def root-tag
  "Tag name of the group root (`ui-segmented-control`)."
  "ui-segmented-control")

(def item-tag
  "Tag name of one choice (`ui-segmented-control-item`)."
  "ui-segmented-control-item")

(def indicator-tag
  "Tag name of the optional sliding indicator (`ui-segmented-control-indicator`)."
  "ui-segmented-control-indicator")

(def ^:private driver-keys
  "Props the component drives on the DOM node or keeps to itself, never rendered
   as attributes of the root."
  [:value :items :on-change :parse-value :attrs :item-attrs
   :indicator? :indicator-attrs :disabled :disabled? :read-only :read-only?])

(def ^:private item-driver-keys
  "Props of one item that stay in Clojure data: the label is the element's child,
   and the item's own `:value` attribute is written by this namespace."
  [:label :disabled :disabled? :attrs :value])

(defn value-attribute
  "The string one choice's `:value` becomes.

   The element keys its items by a string attribute, so a caller may keep a
   number, keyword or string in its own data and map the chosen value back with
   `:parse-value` on the way out."
  [value]
  (str value))

(defn- root-attrs
  [{:keys [id attrs disabled? read-only?]}]
  (let [base (apply dissoc (merge {:id id} (or attrs {})) driver-keys)]
    (cond-> base
      disabled? (assoc :disabled "")
      read-only? (assoc :read-only ""))))

(defn- item-attributes
  [shared item]
  (let [base (apply dissoc
                    (merge (or shared {}) (:attrs item))
                    item-driver-keys)]
    (cond-> (assoc base :value (value-attribute (:value item)))
      (:disabled? item) (assoc :disabled ""))))

(defn markup
  "The element tree of one segmented control.

   Parameters:
   - `props` — the control:
     - `:id` — required element id; a caller's `<legend>` labels the group.
     - `:items` — required sequence of `{:value ... :label ...}`. `:value` is
       required and stringified for the element; `:label` is the item's text. An
       item may carry `:attrs` (merged over `:item-attrs`) and `:disabled?`.
     - `:attrs` — optional map merged onto the root (`:class`, `:data-action`,
       `aria-*`).
     - `:item-attrs` — optional map merged onto every item.
     - `:indicator?` — optional; adds the sliding indicator element.
     - `:indicator-attrs` — optional map merged onto the indicator.
     - `:disabled?` / `:read-only?` — optional; rendered as the group's own
       attributes.
     - `:value`, `:on-change`, `:parse-value` — driver props, never rendered:
       the component writes the live value onto the element as a property.

   Returns: hiccup `[root attrs indicator? item...]` using the tags above. Pure,
   and deliberately free of the controlled value and disabled state, because a
   custom element reads those from live state rather than from an attribute
   string that would read as true when it says `\"false\"`."
  [{:keys [items item-attrs indicator? indicator-attrs] :as props}]
  (into [(keyword root-tag) (root-attrs props)]
        (concat
         (when indicator?
           [[(keyword indicator-tag) (or indicator-attrs {})]])
         (map (fn [item]
                [(keyword item-tag) (item-attributes item-attrs item) (:label item)])
              items))))
