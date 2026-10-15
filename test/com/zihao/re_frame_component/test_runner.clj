(ns com.zihao.re-frame-component.test-runner
  (:require [clojure.test :as test]
            [com.zihao.re-frame-component.playbook.model-test]
            [com.zihao.re-frame-component.playbook.route-test]
            [com.zihao.re-frame-component.router.activation-test]
            [com.zihao.re-frame-component.router.model-test]
            [com.zihao.re-frame-component.ui.multi-step.model-test]
            [com.zihao.re-frame-component.ui.optional-range.model-test]
            [com.zihao.re-frame-component.ui.table-filter.model-test]))

(defn -main [& _]
  (let [{:keys [fail error]}
        (test/run-tests
         'com.zihao.re-frame-component.playbook.model-test
         'com.zihao.re-frame-component.playbook.route-test
         'com.zihao.re-frame-component.router.activation-test
         'com.zihao.re-frame-component.router.model-test
         'com.zihao.re-frame-component.ui.multi-step.model-test
         'com.zihao.re-frame-component.ui.optional-range.model-test
         'com.zihao.re-frame-component.ui.table-filter.model-test)]
    (shutdown-agents)
    (System/exit (if (zero? (+ fail error)) 0 1))))
