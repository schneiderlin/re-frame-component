(ns com.zihao.re-frame-component.ui.tag.interface
  (:require
   [com.zihao.re-frame-component.ui.tag :as view]))

(defn tag
  "Renders an unstyled semantic tag.

  `color` becomes `data-color`; `class` and `attrs` extend the root span."
  [{:keys [color class attrs]} & children]
  (into [view/tag {:color color
                   :class class
                   :attrs attrs}]
        children))
