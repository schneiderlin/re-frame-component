(ns com.zihao.re-frame-component.ui.ime-safe-test
  (:require
   [cljs.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.ime-safe :as ime-safe]))

(defn- key-event
  [{:keys [composing? native-composing? input-type key-code which]}]
  (let [native-event (js-obj)
        dom-event (js-obj)]
    (when (some? composing?) (aset dom-event "isComposing" composing?))
    (when (some? native-composing?) (aset native-event "isComposing" native-composing?))
    (when input-type (aset native-event "inputType" input-type))
    (when (some? key-code)
      (aset dom-event "keyCode" key-code)
      (aset native-event "keyCode" key-code))
    (when (some? which) (aset native-event "which" which))
    (aset dom-event "nativeEvent" native-event)
    dom-event))

(defn- composition-end-event
  [value]
  (js-obj "target" (js-obj "value" value)))

(deftest input-event-composing-detects-native-and-legacy-signals
  (testing "the standard flag on either event"
    (is (true? (ime-safe/input-event-composing? (key-event {:composing? true}))))
    (is (true? (ime-safe/input-event-composing? (key-event {:native-composing? true})))))
  (testing "legacy composition signals"
    (is (true? (ime-safe/input-event-composing? (key-event {:input-type "insertCompositionText"}))))
    (is (true? (ime-safe/input-event-composing? (key-event {:key-code 229}))))
    (is (true? (ime-safe/input-event-composing? (key-event {:which 229})))))
  (testing "an ordinary keystroke is not composition"
    (is (false? (ime-safe/input-event-composing? (key-event {:key-code 13}))))))

(deftest field-skips-consumer-key-down-while-a-key-event-is-composing
  (let [calls (atom [])
        field (ime-safe/field {:tag :textarea})
        attrs (second (field {:on-key-down #(swap! calls conj %)}))]
    ((:on-key-down attrs) (key-event {:key-code 13}))
    (is (= 1 (count @calls)))
    ((:on-key-down attrs) (key-event {:composing? true}))
    ((:on-key-down attrs) (key-event {:key-code 229}))
    (is (= 1 (count @calls))
        "composition keydown must not reach the consumer after a normal one")))

(deftest field-skips-consumer-key-down-between-composition-start-and-end
  (let [calls (atom [])
        field (ime-safe/field {:tag :textarea})
        attrs (second (field {:on-key-down #(swap! calls conj %)}))]
    ((:on-composition-start attrs) (key-event {}))
    ((:on-key-down attrs) (key-event {:key-code 13}))
    (is (empty? @calls))
    ((:on-composition-end attrs) (composition-end-event "你好"))
    ((:on-key-down attrs) (key-event {:key-code 13}))
    (is (= 1 (count @calls))
        "the consumer receives keydown again once composition ends")))

(deftest field-tolerates-a-missing-key-down-handler
  (let [field (ime-safe/field {:tag :input})
        attrs (second (field {}))]
    (is (nil? ((:on-key-down attrs) (key-event {:key-code 13}))))))
