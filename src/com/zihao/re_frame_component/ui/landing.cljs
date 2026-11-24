(ns com.zihao.re-frame-component.ui.landing
  "Landing on a target: the five things that happen when a jump arrives.

   A jump is an address plus this. The address — which row, which note, whether
   it can be found yet — stays with the surface that owns it; this namespace
   owns only what happens to the element once somebody has it:

   1. the previous landing loses its mark,
   2. the element is brought to the middle of its scroll container,
   3. it takes focus, without a second scroll,
   4. it flashes once,
   5. it keeps the mark.

   Two rules hold the design together, and they are the reason this is a
   function rather than a component:

   - **The mark is a fact, not a timer.** `data-landed` says \"the reader arrived
     here\". Nothing clears it on scroll or on a press — a landing is itself a
     scroll, and a press is how a reader keeps working inside the row it just
     arrived in. It moves to the next landing and dies with the element, which
     is what lets the flash be a plain DOM animation instead of a timer racing
     the paint.
   - **Landing is idempotent.** A surface whose layout is still settling calls
     it again on the next frame with `:flash? false`, and gets a re-centre
     without a second flash and without a second announcement.

   Focus is not decoration: it is what announces the arrival to a screen reader
   and puts keyboard continuation at the destination. The resting mark is
   painted by CSS (`[data-landed]::before`), so it stays out of the
   accessibility tree — `aria-current` would claim \"you are here\", and the
   honest claim is \"you came from here\"."
  (:require
   [clojure.string :as str]))

(def landed-attribute
  "The attribute a landed element carries until the next landing replaces it."
  "data-landed")

(def ^:private default-accent
  "The accent `agent-chat/styles.css` falls back to; a host that sets
   `--agent-chat-accent` gets its own color in the flash as well as in the mark."
  "#355fb2")

(def ^:private flash-ms
  "Long enough to be seen after a scroll, short enough to be gone before the
   reader has read a paragraph."
  1200)

(defn- reduced-motion?
  [^js element]
  (boolean
   (when-let [view (.-ownerDocument.defaultView element)]
     (.-matches (.matchMedia view "(prefers-reduced-motion: reduce)")))))

(defn- accent-of
  "The landable element's own accent, read at flash time so a host re-theme or a
   dark-mode switch needs no second source of truth."
  [^js element]
  (let [accent (some-> (js/getComputedStyle element)
                       (.getPropertyValue "--agent-chat-accent")
                       (str/trim))]
    (if (str/blank? accent) default-accent accent)))

(defn- unmark-previous!
  "Exactly one landed element at a time: the mark is a position, not a history."
  [^js document ^js element]
  (doseq [^js node (array-seq (.querySelectorAll document (str "[" landed-attribute "]")))]
    (when-not (identical? node element)
      (.removeAttribute node landed-attribute))))

(defn- focus-target!
  "A row is a `div`, so focusing it needs a tab stop that Tab still skips."
  [^js element]
  (when-not (.hasAttribute element "tabindex")
    (.setAttribute element "tabindex" "-1"))
  (.focus element #js {:preventScroll true}))

(defn- flash!
  "A ring that fades out on the element itself.

   `element.animate` restarts on every call, which is the whole reason the mark
   can be a fact: landing on the same row twice would not replay a CSS
   animation, because its attribute value did not change."
  [^js element]
  (when (and (not (reduced-motion? element)) (fn? (.-animate element)))
    (.animate element
              #js [#js {:boxShadow (str "inset 0 0 0 2px " (accent-of element))}
                   #js {:boxShadow "inset 0 0 0 2px rgba(0, 0, 0, 0)"}]
              #js {:duration flash-ms :easing "ease-out" :fill "none"})))

(defn land!
  "Brings `element` into view and marks it as the place the reader landed.

  Parameters:
  - `element` — the target, already found. Finding it is the caller's: a row
    address, an annotation marker and a DOM id are three different lookups, and
    only the surface that owns the address knows when it can be answered.
  - `options` — optional:
    - `:behavior` — `:auto` (default, instant) or `:smooth`.
    - `:block` — vertical alignment in the scroll container; `:center` by
      default, which is what a transcript wants because the composer owns the
      bottom of the screen.
    - `:flash?` — `false` re-centres and re-focuses without a second flash;
      `true` by default. A surface that calls `land!` twice because its layout
      is still settling passes `false` the second time.

  A detached element is not a landing: it returns `false` and does nothing, so a
  caller can fall back to its own answer (usually \"consume the one-shot
  anyway\" — a reference to something the target no longer holds must not be
  retried forever).

  Returns: `true` when the element was connected and landed."
  ([element]
   (land! element nil))
  ([^js element {:keys [behavior block flash?]
                 :or {behavior :auto block :center flash? true}}]
   (if-not (and element (.-isConnected element))
     false
     (let [document (.-ownerDocument element)]
       (unmark-previous! document element)
       (.scrollIntoView element #js {:block (name block) :behavior (name behavior)})
       (focus-target! element)
       (when flash? (flash! element))
       (.setAttribute element landed-attribute "")
       true))))
