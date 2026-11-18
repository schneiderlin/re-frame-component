(ns com.zihao.re-frame-component.ui.filter-select.interface
  "Public API for the searchable single-select combobox: option accessors and token filtering for
  both platforms, plus the Reagent view."
  (:require
   [com.zihao.re-frame-component.ui.filter-select.model :as model]
   #?(:cljs [com.zihao.re-frame-component.ui.filter-select.view :as view])))

(defn option-id
  "Returns an option's stable selection id.

  `opts` may provide `:option-id` as a keyword, string, or function. Without
  one, the option's `:id` is used.

  Parameters:
  - `option` — option value, usually a map.
  - `opts` — selector options:
    - `:option-id` — optional keyword, string, or function selecting the option id; defaults to
      `:id`.

  Returns: the resolved option id; nil when the selector finds nothing."
  [option opts]
  (model/option-id option opts))

(defn option-label
  "Returns the text shown for an option.

  `opts` may provide `:option-label` as a keyword, string, or function. The
  resolved option id is the fallback label.

  Parameters:
  - `option` — option value, usually a map.
  - `opts` — selector options:
    - `:option-label` — optional keyword, string, or function selecting the option label;
      defaults to `:label`.
    - `:option-id` — used for the fallback label.

  Returns: the resolved label, the resolved option id when the label is missing, or the empty
  string."
  [option opts]
  (model/option-label option opts))

(defn option-description
  "Returns an option's secondary description, or nil when none is configured.

  `opts` may provide `:option-description` as a keyword, string, or function.

  Parameters:
  - `option` — option value, usually a map.
  - `opts` — selector options:
    - `:option-description` — optional keyword, string, or function selecting the description;
      without it no description is read.

  Returns: the resolved description value, or nil."
  [option opts]
  (model/option-description option opts))

(defn filter-options
  "Returns options matching every case-insensitive token in `query`.

  The default search fields are `:label`, `:id`, and `:keywords`. Pass
  `:option-search-fields` or `:filter-fn` in `opts` to customize filtering.

  Parameters:
  - `options` — sequence of options to filter; nil is treated as empty.
  - `query` — search text; it is trimmed, lower-cased, and split on whitespace, and an empty query
    matches every option.
  - `opts` — filtering options:
    - `:filter-fn` — optional predicate of `(option query opts)` replacing the default token
      filter.
    - `:option-search-fields` — optional sequence of keyword/string/function selectors choosing the
      fields searched by the default filter; defaults to `:label`, `:id`, and `:keywords`.

  Returns: vector of the options that match, in input order."
  ([options query]
   (model/filter-options options query))
  ([options query opts]
   (model/filter-options options query opts)))

(defn selected-option
  "Returns the option whose resolved id equals `selected-id`, or nil.

  Parameters:
  - `options` — sequence of options; nil is treated as empty.
  - `selected-id` — id to look for, compared against `option-id`.
  - `opts` — selector options forwarded to `option-id` (`:option-id`).

  Returns: the first option with a matching resolved id, or nil."
  [options selected-id opts]
  (model/selected-option options selected-id opts))

#?(:cljs
   (defn filter-select
     "Renders a headless, searchable, single-select combobox.

     Selection is caller-owned through `selected-id` and `on-select`; the
     component owns only transient query, open, and keyboard-navigation state.

     Option access:
     - `option-id`, `option-label`, and `option-description` accept a keyword,
       string, or function selector.
     - `option-disabled?` accepts a selector returning a truthy value.
     - `option-search-fields` chooses fields searched by the default filter.
     - `filter-fn` replaces the default token filter.

     Presentation hooks:
     - `attrs`, `label-options`, `control-options`, `input-options`,
       `menu-options`, `option-options`, and `empty-options` extend DOM attrs.
     - `render-option` renders an option and `end-adornment` adds passive
       control content.
     - `menu-layout` is `:anchored`, `:inline`, or `:portal`.

     Parameters:
     - `combobox-options` — combobox options:
       - `:id` — component id used to derive the input, listbox, and option DOM ids; callers must
         supply one for stable ids.
       - `:label` — visible field label.
       - `:options` — sequence of options to offer.
       - `:selected-id` — id of the currently selected option, resolved through `option-id`.
       - `:on-select` — optional function called with the chosen option once the menu closes.
       - `:option-id`, `:option-label`, `:option-description`, `:option-disabled?` — optional
         keyword, string, or function selectors (see the accessors above).
       - `:option-search-fields` — optional search-field selectors for the default filter.
       - `:filter-fn` — optional predicate of `(option query opts)` replacing the default filter.
       - `:default-open?` — open the menu on first render when true.
       - `:placeholder` — input placeholder; defaults to `\"Filter...\"`.
       - `:disabled?` — disable the control when true.
       - `:class` — optional class for the root element.
       - `:attrs` — optional attribute map for the root element.
       - `:label-options` — optional label element attributes or function of the render context.
       - `:control-options` — optional control wrapper attributes or function of the render context.
       - `:input-options` — optional input attributes or function of the render context.
       - `:menu-options` — optional menu attributes or function of the render context.
       - `:menu-layout` — `:anchored` (default), `:inline`, or `:portal`.
       - `:option-options` — optional option attributes map or function of `(option ctx)`; `ctx`
         carries `:active?`, `:selected?`, and `:disabled?`.
       - `:empty-options` — optional empty-state attributes or function of the render context.
       - `:empty-label` — empty-state text; defaults to `\"No options\"`.
       - `:render-option` — optional function of `(option opts)` rendering one option's content.
       - `:end-adornment` — optional passive content rendered at the end of the input.

     Returns: Hiccup vector rendering the labelled combobox."
     [{:keys [id
              label
              options
              selected-id
              on-select
              option-id
              option-label
              option-description
              option-disabled?
              option-search-fields
              filter-fn
              default-open?
              placeholder
              disabled?
              class
              attrs
              label-options
              control-options
              input-options
              menu-options
              menu-layout
              option-options
              empty-options
              empty-label
              render-option
              end-adornment]
       :or {placeholder "Filter..."
            menu-layout :anchored
            empty-label "No options"}}]
     [view/filter-select
      {;; Caller-owned value and option semantics.
       :id id
       :label label
       :options options
       :selected-id selected-id
       :on-select on-select
       :option-id option-id
       :option-label option-label
       :option-description option-description
       :option-disabled? option-disabled?
       :option-search-fields option-search-fields
       :filter-fn filter-fn

       ;; Transient interaction defaults.
       :default-open? default-open?
       :placeholder placeholder
       :disabled? disabled?
       :menu-layout menu-layout
       :empty-label empty-label

       ;; Product-owned rendering and styling hooks.
       :class class
       :attrs attrs
       :label-options label-options
       :control-options control-options
       :input-options input-options
       :menu-options menu-options
       :option-options option-options
       :empty-options empty-options
       :render-option render-option
       :end-adornment end-adornment}]))
