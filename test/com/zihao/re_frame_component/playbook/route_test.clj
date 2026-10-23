(ns com.zihao.re-frame-component.playbook.route-test
  (:require
   [clojure.test :refer [deftest is]]
   [com.zihao.re-frame-component.playbook.route :as route]))

(deftest playbook-route-round-trips-scene-id
  (let [scene-id :telegram-automation.ui.contacts/default]
    (is (= {:surface :playbook
            :path "playbook"
            :scene-id scene-id}
           (route/match-hash (route/href scene-id))))))

(deftest playbook-route-round-trips-tool-id
  (is (= {:surface :playbook
          :path "playbook"
          :scene-id nil
          :tool-id :design-system}
         (route/match-hash (route/tool-href :design-system))))
  (is (= "#/playbook?tool=design-system"
         (route/tool-href :design-system))))

(deftest tool-selection-wins-over-conflicting-scene-query
  (is (= {:surface :playbook
          :path "playbook"
          :scene-id nil
          :tool-id :design-system}
         (route/match-hash
          "#/playbook?scene=demo%2Fdefault&tool=design-system"))))

(deftest unrelated-routes-do-not-match
  (is (false? (route/playbook-hash? "#/playbookish")))
  (is (nil? (route/match-hash "#/sessions"))))
