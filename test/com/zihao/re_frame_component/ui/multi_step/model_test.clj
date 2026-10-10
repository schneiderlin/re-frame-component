(ns com.zihao.re-frame-component.ui.multi-step.model-test
  (:require
   [clojure.test :refer [deftest is]]
   [com.zihao.re-frame-component.ui.multi-step.model :as model]))

(def steps
  [{:id :sessions :action [:go :sessions]}
   {:id :contact-group :action [:go :contact-group]}
   {:id :preview :action [:go :preview]}])

(deftest ordered-steps-distinguish-history-current-and-future
  (let [items (model/step-items steps :contact-group)]
    (is (= [:complete :active :upcoming]
           (mapv :state items)))
    (is (= [true false false]
           (mapv :navigable? items)))
    (is (= [false true false]
           (mapv :active? items)))))

(deftest step-history-requires-an-enabled-action
  (let [items (model/step-items
               [(dissoc (first steps) :action)
                (assoc (second steps) :disabled? true)
                (nth steps 2)]
               :preview)]
    (is (= [false false false]
           (mapv :navigable? items)))))

(deftest unknown-active-step-falls-back-to-first-step
  (is (= :sessions
         (model/normalize-active-id steps :missing)))
  (is (= [:active :upcoming :upcoming]
         (mapv :state (model/step-items steps :missing))))
  (is (nil? (model/normalize-active-id [] :missing)))
  (is (= [] (model/step-items [] :missing))))
