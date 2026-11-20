(ns com.zihao.re-frame-component.ui.token-input.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.token-input.model :as model]))

(deftest token-input-markup-holds-an-editor-and-a-token-template
  (let [markup (model/markup {:id "composer-input"
                              :editor-attrs {:placeholder "Type"
                                             :data-composer-textarea "true"}})
        [input input-attrs editor template] markup
        token (last template)]
    (testing "the root is the element the binding drives"
      (is (= (keyword model/input-tag) input))
      (is (= "composer-input" (:id input-attrs))))
    (testing "the editor carries only what the caller paints"
      (is (= (keyword model/editor-tag) (first editor)))
      (is (= {:placeholder "Type" :data-composer-textarea "true"} (second editor))))
    (testing "a template holds one token with a label span and a remove part"
      (is (= :template (first template)))
      (is (= (keyword model/token-tag) (first token)))
      (let [[label-span remove-part] (drop 2 token)]
        (is (= :span (first label-span)))
        (is (contains? (second label-span) :data-token-label))
        (is (= (keyword model/token-remove-tag) (first remove-part)))))))

(deftest token-input-markup-never-renders-the-driven-props
  (testing "value, triggers and callbacks are written onto the node, not rendered"
    (let [handle (atom nil)
          [_ root-attrs editor] (model/markup
                                 {:initial-value ["hello" {:type "skill" :value "quality" :label "$quality"}]
                                  :value-key "thread-1"
                                  :handle handle
                                  :triggers [{:char "$" :type "skill" :source :skill}]
                                  :sources {:skill identity}
                                  :on-change (fn [_ _])
                                  :on-paste (fn [_])
                                  :on-blur (fn [_])
                                  :submit-shortcut "mod+enter"
                                  :disabled? true
                                  :attrs {:class "box" :value "ignored" :disabled "false"}})]
      (is (= {:class "box"} root-attrs))
      (is (not (contains? (second editor) :value))))))

(deftest token-input-markup-mounts-the-menu-only-with-a-source
  (let [triggers [{:char "$" :type "skill" :source :skill}]]
    (testing "a declared trigger without a source renders no menu"
      (is (false? (model/trigger-menu? {:triggers triggers :sources {}})))
      (is (not-any? #(= :ui-trigger-menu %)
                    (map first (rest (model/markup {:triggers triggers}))))))
    (testing "the same trigger with a source mounts the menu and its listbox"
      (is (true? (model/trigger-menu? {:triggers triggers :sources {:skill identity}})))
      (let [markup (model/markup {:triggers triggers
                                  :sources {:skill identity}
                                  :menu-attrs {:class "menu"}
                                  :menu-list-attrs {:class "list"}})
            menu (last markup)
            [_ menu-attrs content-element] menu
            [content-tag content-attrs list-element] content-element]
        (is (= (keyword model/trigger-menu-tag) (first menu)))
        (is (= {:class "menu"} menu-attrs))
        (is (= (keyword model/trigger-content-tag) content-tag))
        (is (= {} content-attrs))
        (is (= (keyword model/trigger-list-tag) (first list-element)))
        (is (= {:class "list"} (second list-element)))))
    (testing "no triggers at all is a plain token input"
      (is (false? (model/trigger-menu? {:sources {:skill identity}})))
      (is (= 4 (count (model/markup {:sources {:skill identity}})))))))

(deftest token-input-markup-renders-the-empty-part-only-with-copy
  (let [props {:triggers [{:char "$" :type "skill" :source :skill}]
               :sources {:skill identity}}]
    (testing "without copy the menu closes instead of showing a blank box"
      (is (not-any? #(and (vector? %) (= (keyword model/trigger-empty-tag) (first %)))
                    (tree-seq vector? rest (model/markup props)))))
    (testing "with copy the empty part stays inside the popup"
      (let [markup (model/markup (assoc props :menu-empty {:text "No matches"
                                                          :attrs {:class "empty"}}))]
        (is (some #(and (vector? %)
                        (= (keyword model/trigger-empty-tag) (first %))
                        (= "No matches" (last %)))
                  (tree-seq vector? rest markup)))))))

(deftest token-input-markup-renders-the-remove-affordance-when-given
  (let [template (nth (model/markup {:remove-token-label "x"}) 3)
        token (last template)
        remove-part (last token)]
    (is (= (keyword model/token-remove-tag) (first remove-part)))
    (is (= "x" (last (last remove-part))))))

(deftest token-input-tag-names-are-the-shared-elements
  (is (= "ui-token-input" model/input-tag))
  (is (= "ui-token-input-editor" model/editor-tag))
  (is (= "ui-token-input-token" model/token-tag))
  (is (= "ui-token-input-token-remove" model/token-remove-tag))
  (is (= "ui-trigger-menu" model/trigger-menu-tag))
  (is (= "ui-trigger-menu-content" model/trigger-content-tag))
  (is (= "ui-trigger-menu-list" model/trigger-list-tag))
  (is (= "ui-trigger-menu-empty" model/trigger-empty-tag)))
