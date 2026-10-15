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
