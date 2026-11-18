(ns com.zihao.re-frame-component.ui.optional-range.interface
  "Public API for the optional lower/upper range filter: bound helpers plus the Reagent view."
  (:require
   [com.zihao.re-frame-component.ui.optional-range.model :as model]
   #?(:cljs [com.zihao.re-frame-component.ui.optional-range.view :as view])))

(defn range-state
  "Returns `:empty`, `:lower-only`, `:upper-only`, or `:bounded` for two values.

  Parameters:
  - `lower-value` — lower bound value as the caller stores it; nil, blank, and whitespace-only
    values count as absent.
  - `upper-value` — upper bound value with the same presence rules.

  Returns: `:bounded` when both bounds are present, `:lower-only` / `:upper-only` when one is, and
  `:empty` when neither is."
  [lower-value upper-value]
  (model/range-state lower-value upper-value))

(defn input-id
  "Returns the stable input id for `component-id` and `:lower` or `:upper`.

  Parameters:
  - `component-id` — id of the owning range filter.
  - `bound` — `:lower` or `:upper`.

  Returns: the string `\"<component-id>-lower\"` or `\"<component-id>-upper\"`.

  Throws `ex-info` when `bound` is neither `:lower` nor `:upper`."
  [component-id bound]
  (model/input-id component-id bound))

#?(:cljs
   (defn optional-range-filter
     "Renders independently optional lower and upper range inputs.

     `id` is required. Values and change callbacks are caller-owned; remaining
     input constraints and DOM attributes are shared by both bounds.

     Parameters:
     - `range-options` — range filter options:
       - `:id` — required; component id; the bound input ids are derived from it with `input-id`.
       - `:label` — legend text.
       - `:lower-label` — label of the lower bound input.
       - `:upper-label` — label of the upper bound input.
       - `:lower-value` — current lower bound value; nil renders as an empty input.
       - `:upper-value` — current upper bound value; nil renders as an empty input.
       - `:lower-placeholder` — placeholder of the lower input.
       - `:upper-placeholder` — placeholder of the upper input.
       - `:on-lower-value` — function of the new lower text; defaults to a no-op.
       - `:on-upper-value` — function of the new upper text; defaults to a no-op.
       - `:type` — input type shared by both bounds; defaults to `\"text\"`.
       - `:disabled?` — disables both inputs when true.
       - `:min`, `:max`, `:step` — input constraints shared by both bounds.
       - `:input-options` — optional attribute map merged under the generated input attributes.
       - `:attrs` — optional attribute map merged over the root `:fieldset` attributes.

     Returns: `[:fieldset ...]` Hiccup vector containing the legend and both bound inputs, with
     `data-state` set from `range-state`.

     Throws `ex-info` when `:id` is blank."
     [{:keys [id
              label
              lower-label
              upper-label
              lower-value
              upper-value
              lower-placeholder
              upper-placeholder
              on-lower-value
              on-upper-value
              type
              disabled?
              min
              max
              step
              input-options
              attrs]}]
     [view/optional-range-filter
      {:id id
       :label label
       :lower-label lower-label
       :upper-label upper-label
       :lower-value lower-value
       :upper-value upper-value
       :lower-placeholder lower-placeholder
       :upper-placeholder upper-placeholder
       :on-lower-value on-lower-value
       :on-upper-value on-upper-value
       :type type
       :disabled? disabled?
       :min min
       :max max
       :step step
       :input-options input-options
       :attrs attrs}]))
