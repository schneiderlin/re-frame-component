(ns com.zihao.re-frame-component.ui.thread-ref
  "One Thread named where a reader can act on it.

   A chip, not a card: which Thread, and — when the caller has them — its title,
   relation and state. The chip carries no copy of its own: the surrounding
   sentence supplies the words (\"from\", \"spawned\", \"reading\") and this only
   says which Thread is meant.

   Opening is the caller's intent, so `:on-open` turns the chip into a button and
   a chip without one stays inert text. Nothing here positions, dismisses or
   fetches anything; a hover preview would be an anchored overlay and belongs to
   the caller that needs it (`com.zihao.re-frame-component.interface/anchor-position!`)."
  (:require
   [clojure.string :as str]))

(defn- token [value]
  (cond
    (nil? value) nil
    (keyword? value) (name value)
    (string? value) value
    :else (str value)))

(defn thread-ref
  "Renders one Thread reference.

  Parameters:
  - `props` — the reference:
    - `:thread` — required handle; the Thread's address, and the whole point.
    - `:title` — optional Thread title, shown after the handle when it differs.
    - `:relation` — optional `:self` / `:parent` / `:child` / `:sibling`, as a
      `data-relation` hook for the caller's paint.
    - `:status` — optional summary status (`:running`, `:waiting`, ...), shown as
      text and as `data-status`.
    - `:on-open` — optional function of the handle; makes the root a button.
    - `:attrs` — optional root attribute map.

  Returns: Hiccup `[root ...children]`, where the root is a `button` when
  `:on-open` is given and a `span` otherwise."
  [{:keys [thread title relation status on-open attrs]}]
  (let [root-attrs (cond-> (merge {:data-component "re-frame-thread-ref"
                                   :data-thread thread}
                                  attrs)
                     relation (assoc :data-relation (token relation))
                     status (assoc :data-status (token status))
                     on-open (assoc :type "button"
                                    :on-click (fn [_event] (on-open thread))))
        children (cond-> [[:span {:class "thread-ref-handle"} thread]]
                   (and (not (str/blank? (str title))) (not= title thread))
                   (conj [:span {:class "thread-ref-title"} title])

                   (some? status)
                   (conj [:span {:class "thread-ref-status"} (token status)]))]
    (if on-open
      (into [:button root-attrs] children)
      (into [:span root-attrs] children))))
