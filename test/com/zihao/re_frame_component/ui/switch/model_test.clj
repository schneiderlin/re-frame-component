(ns com.zihao.re-frame-component.ui.switch.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.switch.model :as model]))

(deftest switch-markup-is-a-track-with-one-thumb
  (let [markup (model/markup {:id "digest"})]
    (is (= [(keyword model/track-tag) {:id "digest"}
            [(keyword model/thumb-tag) {}]]
           markup))
    (is (= "ui-switch" model/track-tag))
    (is (= "ui-switch-thumb" model/thumb-tag))))

(deftest switch-markup-merges-caller-attributes-on-the-right-part
  (let [[_ track [thumb-tag thumb]] (model/markup
                                     {:id "digest"
                                      :attrs {:class "track" :data-action "toggle"}
                                      :thumb-attrs {:class "thumb"}})]
    (testing "the track keeps the caller's class and data attributes"
      (is (= {:id "digest" :class "track" :data-action "toggle"} track)))
    (testing "the thumb carries only what the caller paints"
      (is (= (keyword model/thumb-tag) thumb-tag))
      (is (= {:class "thumb"} thumb)))))

(deftest switch-markup-never-renders-the-controlled-value-as-an-attribute
  (testing "a custom element reads these as properties, and a \"false\" attribute string would be true"
    (let [[_ track [thumb-tag thumb]] (model/markup
                                      {:id "digest"
                                       :checked? false
                                       :disabled? false
                                       :attrs {:checked false :disabled "false"}
                                       :thumb-attrs {:checked false}})]
      (is (= {:id "digest"} track))
      (is (= (keyword model/thumb-tag) thumb-tag))
      (is (= {} thumb)))))

(deftest switch-markup-drops-driver-props-from-passthrough-attributes
  (let [[_ track [_thumb-tag thumb]] (model/markup
                                      {:id "digest"
                                       :on-change (fn [_])
                                       :attrs {:on-change (fn [_])}
                                       :thumb-attrs {:thumb-attrs {}}})]
    (is (= {:id "digest"} track))
    (is (= {} thumb))))
