(ns com.zihao.re-frame-component.playbook.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.playbook.model :as model]))

(deftest module-states-become-flat-scenes
  (let [scenes (model/module-scenes
                {:app-ns "demo.app"
                 :module-id :task_board
                 :component :demo.task-board/panel
                 :tags #{:demo}
                 :states [[:default {:items [1]}]
                          [:empty {:items []} {:scope :page}] ]})]
    (is (= [:demo.app.ui.task-board/default
            :demo.app.ui.task-board/empty]
           (mapv :id scenes)))
    (is (= [:component :page] (mapv :scope scenes)))
    (is (= #{:demo} (:tags (first scenes))))))

(deftest scene-declarations-remain-data-shaped
  (is (thrown-with-msg?
       clojure.lang.ExceptionInfo
       #"must not contain functions"
       (model/normalize-scene
        {:id :demo/button
         :component :demo/button
         :args {:on-click (fn [])}}))))

(deftest tool-destinations-normalize-as-data
  (is (= {:id :design-system
          :title {:en "Design System" :zh "设计系统"}
          :component :demo.design-system/workspace
          :args {}}
         (model/normalize-tool
          {:id :design-system
           :title {:en "Design System" :zh "设计系统"}
           :component :demo.design-system/workspace})))
  (testing "tool identity, title, component, and data shape are validated"
    (doseq [tool [{:id "design-system"
                   :title "Design System"
                   :component :demo/workspace}
                  {:id :design-system
                   :title {:en :not-a-string}
                   :component :demo/workspace}
                  {:id :design-system
                   :title "Design System"
                   :component "demo/workspace"}
                  {:id :design-system
                   :title "Design System"
                   :component :demo/workspace
                   :args {:render (fn [])}}]]
      (is (thrown? clojure.lang.ExceptionInfo
                   (model/normalize-tool tool))))))

(deftest catalog-tools-are-stable-and-duplicate-free
  (let [tools (model/catalog-tools
               [{:id :tokens :title "Old" :component :demo/old}
                {:id :accessibility :title "Accessibility" :component :demo/a11y}
                {:id :tokens :title "Tokens" :component :demo/tokens
                 :args {:palette :dark}}])]
    (is (= [:accessibility :tokens] (mapv :id tools)))
    (is (= :demo/tokens (:component (model/find-tool tools :tokens))))
    (is (= {:palette :dark} (:args (model/find-tool tools :tokens))))
    (is (nil? (model/find-tool tools :missing)))))

(deftest catalog-filtering-composes-query-scope-and-tag
  (let [scenes [(model/normalize-scene
                 {:id :demo/button :title "Action Button"
                  :component :demo/button :scope :element :tags #{:demo}})
                (model/normalize-scene
                 {:id :admin/page :title "Admin"
                  :component :admin/page :scope :page :tags #{:admin}})]]
    (testing "all active filters must match"
      (is (= [:demo/button]
             (mapv :id (model/filter-scenes scenes
                                             {:query "button"
                                              :scope :element
                                              :tag :demo})))))))

(deftest catalog-assembles-deterministic-scene-order
  (let [scenes (model/catalog-scenes
                (model/module-scenes
                 {:app-ns "demo.app" :module-id :zebra
                  :component :demo/zebra :tags #{:z}
                  :states [[:default {}]]})
                (model/module-scenes
                 {:app-ns "demo.app" :module-id :alpha
                  :component :demo/alpha :tags #{:a}
                  :states [[:default {}]]}))]
    (is (= [:demo.app.ui.alpha/default
            :demo.app.ui.zebra/default]
           (mapv :id scenes)))
    (testing "module assembly order does not change the catalog order"
      (is (= (mapv :id scenes)
             (mapv :id (apply model/catalog-scenes
                              (reverse
                               [(model/module-scenes
                                 {:app-ns "demo.app" :module-id :zebra
                                  :component :demo/zebra :tags #{:z}
                                  :states [[:default {}]]})
                                (model/module-scenes
                                 {:app-ns "demo.app" :module-id :alpha
                                  :component :demo/alpha :tags #{:a}
                                  :states [[:default {}]]})]))))))))

(deftest catalog-keeps-last-declaration-per-scene-id
  (let [first-declaration (model/module-scenes
                           {:app-ns "demo.app" :module-id :panel
                            :component :demo/panel
                            :states [[:default {:variant :old}]]})
        later-declaration (model/module-scenes
                           {:app-ns "demo.app" :module-id :panel
                            :component :demo/panel
                            :states [[:default {:variant :new}]]})
        scenes (model/catalog-scenes first-declaration later-declaration)]
    (is (= 1 (count scenes)))
    (is (= {:variant :new} (:args (first scenes))))))

(deftest catalog-validates-every-declaration
  (is (thrown-with-msg?
       clojure.lang.ExceptionInfo
       #"must be a registered view id"
       (model/catalog-scenes [{:id :demo/broken
                               :component "demo/broken"}]))))

(deftest find-scene-returns-matching-scene-or-nil
  (let [scenes (model/catalog-scenes
                (model/module-scenes
                 {:app-ns "demo.app" :module-id :panel
                  :component :demo/panel
                  :states [[:default {}]]}))]
    (is (= :demo.app.ui.panel/default
           (:id (model/find-scene scenes :demo.app.ui.panel/default))))
    (is (nil? (model/find-scene scenes :demo.app.ui.missing/default)))))
