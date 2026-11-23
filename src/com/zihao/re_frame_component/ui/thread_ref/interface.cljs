(ns com.zihao.re-frame-component.ui.thread-ref.interface
  "Public API for one Thread reference: a chip that names a Thread where a reader
  can act on it."
  (:require
   [com.zihao.re-frame-component.ui.thread-ref :as thread-ref]))

(defn thread-ref
  "Renders one Thread named where a reader can act on it.

  A chip, not a card: the handle, plus the title, relation and state the caller
  has. The chip carries no copy of its own — the surrounding sentence says
  \"from\" or \"spawned\" — and offers no ids: Threads are addressed by handle.

  Parameters:
  - `props` — the reference:
    - `:thread` — required handle; the Thread's address.
    - `:title` — optional title, shown when it differs from the handle.
    - `:relation` — optional `:self`/`:parent`/`:child`/`:sibling`, exposed as
      `data-relation` for the caller's paint.
    - `:status` — optional summary status, shown as text and as `data-status`.
    - `:on-open` — optional function of the handle; makes the root a button and
      leaves opening to the caller's intent.
    - `:attrs` — optional root attribute map.

  Returns: Hiccup whose root carries `data-component` `\"re-frame-thread-ref\"`
  and `data-thread`."
  [props]
  (thread-ref/thread-ref props))
