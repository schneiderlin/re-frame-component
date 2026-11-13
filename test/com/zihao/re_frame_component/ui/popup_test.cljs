(ns com.zihao.re-frame-component.ui.popup-test
  (:require
   [cljs.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.popup :as popup]))

(defn- keydown
  [key & {:keys [default-prevented?]}]
  (let [event (js-obj)]
    (aset event "key" key)
    (aset event "defaultPrevented" (boolean default-prevented?))
    event))

(deftest escape-dismisses-an-unclaimed-popup
  (is (true? (popup/dismiss-key? (keydown "Escape")))))

(deftest escape-consumed-by-an-inner-popup-keeps-the-outer-popup-open
  (testing "an open select closes itself on the first Escape; the dialog waits for the next one"
    (is (false? (popup/dismiss-key? (keydown "Escape" :default-prevented? true))))))

(deftest other-keys-never-dismiss
  (is (false? (popup/dismiss-key? (keydown "Enter"))))
  (is (false? (popup/dismiss-key? (keydown "ArrowDown")))))
