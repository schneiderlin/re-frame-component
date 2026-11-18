(ns com.zihao.re-frame-component.ui.tag.interface
  "Public API for the unstyled semantic tag: a span carrying `data-component` and an optional
  `data-color`."
  (:require
   [com.zihao.re-frame-component.ui.tag :as view]))

(defn tag
  "Renders an unstyled semantic tag.

  `color` becomes `data-color`; `class` and `attrs` extend the root span.

  Parameters:
  - `tag-attributes` — tag root attributes:
    - `:color` — optional semantic color; keyword colors render as their name, other values as a
      string, in `data-color`.
    - `:class` — optional class appended to the root span's class list.
    - `:attrs` — optional attribute map merged under the generated `data-component` marker.
  - `children` — the vararg list of tag content nodes, rendered inside the span in order.

  Returns: `[:span attrs ...children]` Hiccup vector."
  [{:keys [color class attrs]} & children]
  (into [view/tag {:color color
                   :class class
                   :attrs attrs}]
        children))
