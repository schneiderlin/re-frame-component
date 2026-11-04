(ns com.zihao.re-frame-component.ui.filter-select.interface
  (:require
   [com.zihao.re-frame-component.ui.filter-select.model :as model]
   #?(:cljs [com.zihao.re-frame-component.ui.filter-select.view :as view])))

(defn option-id
  "Returns an option's stable selection id.

  `opts` may provide `:option-id` as a keyword, string, or function. Without
  one, the option's `:id` is used."
  [option opts]
  (model/option-id option opts))

(defn option-label
  "Returns the text shown for an option.

  `opts` may provide `:option-label` as a keyword, string, or function. The
  resolved option id is the fallback label."
  [option opts]
  (model/option-label option opts))

(defn option-description
  "Returns an option's secondary description, or nil when none is configured.

  `opts` may provide `:option-description` as a keyword, string, or function."
  [option opts]
  (model/option-description option opts))

(defn filter-options
  "Returns options matching every case-insensitive token in `query`.

  The default search fields are `:label`, `:id`, and `:keywords`. Pass
  `:option-search-fields` or `:filter-fn` in `opts` to customize filtering."
  ([options query]
   (model/filter-options options query))
  ([options query opts]
   (model/filter-options options query opts)))

(defn selected-option
  "Returns the option whose resolved id equals `selected-id`, or nil."
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
     - `menu-layout` is `:anchored`, `:inline`, or `:portal`."
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
