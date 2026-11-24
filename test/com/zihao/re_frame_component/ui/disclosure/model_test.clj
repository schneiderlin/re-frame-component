(ns com.zihao.re-frame-component.ui.disclosure.model-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [com.zihao.re-frame-component.ui.disclosure.model :as model]))

(defn- parts
  "One disclosure's parts, as the caller's paint finds them."
  [markup]
  (let [[_ root-attrs trigger panel] markup
        button (nth trigger 2)]
    {:root-attrs root-attrs
     :trigger trigger
     :trigger-attrs (second trigger)
     :button button
     :button-attrs (second button)
     :panel panel
     :panel-attrs (second panel)}))

(deftest a-disclosure-is-a-root-wrapping-a-trigger-and-a-panel
  (let [{:keys [root-attrs trigger trigger-attrs button button-attrs panel]}
        (parts (model/markup {:trigger-children [(model/chevron)]}))]
    (is (= (keyword model/root-tag) (first (model/markup {}))))
    (is (= "ui-collapsible" model/root-tag))
    (is (= {} root-attrs))
    (testing "the trigger wraps the caller's own native button"
      (is (= (keyword model/trigger-tag) (first trigger)))
      (is (= {} trigger-attrs))
      (is (= :button (first button)))
      (is (= "button" (:type button-attrs))))
    (testing "the panel is the root's third part"
      (is (= (keyword model/panel-tag) (first panel))))))

(deftest content-between-the-trigger-and-the-panel-always-shows
  ;; A row whose trigger is only its chevron still has a summary and actions, and
  ;; those must not live inside the button.
  (let [markup (model/markup {:trigger-children [(model/chevron)]
                              :body-children [[:div {:data-part "summary"} "read_file"]
                                              [:span {:data-part "actions"} "->"]]
                              :panel-children [[:p "detail"]]})
        [root-tag root-attrs trigger] markup]
    (is (= (keyword model/root-tag) root-tag))
    (is (= {} root-attrs))
    (testing "the parts read trigger, body, panel in that order"
      (is (= [(keyword model/trigger-tag)
              :div
              :span
              (keyword model/panel-tag)]
             (mapv first (drop 2 markup))))
      (is (= [:p] (mapv first (drop 2 (last markup)))))))
  (testing "a disclosure with no body is the same three parts"
    (is (= [(keyword model/trigger-tag) (keyword model/panel-tag)]
           (mapv first (drop 2 (model/markup {})))))))

(deftest a-closed-panel-starts-hidden-and-an-open-one-does-not
  (testing "a panel that starts closed is hidden before the elements upgrade"
    (is (true? (:hidden (:panel-attrs (parts (model/markup {}))))))
    (is (true? (:hidden (:panel-attrs (parts (model/markup {:open? false})))))))
  (testing "a panel that starts open is already in the page"
    (is (nil? (:hidden (:panel-attrs (parts (model/markup {:open? true}))))))
    (is (nil? (:hidden (:panel-attrs (parts (model/markup {:default-open? true}))))))))

(deftest the-open-state-is-never-an-attribute
  (testing "a controlled state is written as a property, so it is not markup"
    (let [{:keys [root-attrs button-attrs panel-attrs]}
          (parts (model/markup {:open? true
                                :on-open-change identity}))]
      (is (nil? (:open root-attrs)))
      (is (nil? (:open button-attrs)))
      (is (nil? (:open panel-attrs)))))
  (testing "only an uncontrolled starting state is an attribute, spelled as a value"
    (is (= "true" (:default-open (:root-attrs (parts (model/markup
                                                      {:default-open? true})))))))
  (testing "a false default is spelled out rather than left out"
    (is (= "false" (:default-open (:root-attrs (parts (model/markup
                                                       {:default-open? false}))))))))

(deftest a-closed-panel-stays-in-the-page-by-default
  (testing "keeping a panel mounted is the default, so it cannot lose its contents"
    (is (= "true" (:keep-mounted (:panel-attrs (parts (model/markup {}))))))
    (is (true? model/default-keep-mounted?)))
  (testing "a caller can ask for the DOM to go"
    (is (= "false" (:keep-mounted (:panel-attrs (parts (model/markup
                                                        {:keep-mounted? false})))))))
  (testing "find in page is opt-in and spelled as a value"
    (is (nil? (:hidden-until-found (:panel-attrs (parts (model/markup {}))))))
    (is (= "true" (:hidden-until-found
                   (:panel-attrs (parts (model/markup
                                         {:hidden-until-found? true}))))))))

(deftest caller-attributes-land-on-the-right-part
  (let [{:keys [root-attrs trigger-attrs button button-attrs panel panel-attrs]}
        (parts (model/markup {:attrs {:class "context-section" :data-section "toolset"}
                              :trigger-attrs {:class "context-trigger"}
                              :button-attrs {:class "context-button"
                                             :aria-label "Toolset"}
                              :panel-attrs {:class "context-panel"}
                              :trigger-children ["Toolset"]
                              :panel-children [[:p "read_file"]]}))]
    (testing "the root carries the caller's band and its test hook"
      (is (= "context-section" (:class root-attrs)))
      (is (= "toolset" (:data-section root-attrs))))
    (testing "each part keeps the caller's class"
      (is (= "context-trigger" (:class trigger-attrs)))
      (is (= "context-panel" (:class panel-attrs)))
      (is (= "context-button" (:class button-attrs))))
    (testing "the button keeps the caller's attributes and its own type"
      (is (= "Toolset" (:aria-label button-attrs)))
      (is (= "button" (:type button-attrs))))
    (testing "each part's content is the caller's"
      (is (= ["Toolset"] (drop 2 button)))
      (is (= [[:p "read_file"]] (drop 2 panel))))))

(deftest the-component-s-own-props-never-reach-the-dom
  (let [{:keys [root-attrs trigger-attrs button-attrs panel-attrs]}
        (parts (model/markup {:open? true
                              :default-open? false
                              :on-open-change identity
                              :on-ref identity
                              :disabled? true
                              :keep-mounted? true
                              :hidden-until-found? true
                              :trigger-children ["Toolset"]
                              :panel-children ["read_file"]}))]
    (testing "the button and the parts carry no component prop"
      (is (= #{} (set (keys trigger-attrs))))
      (is (= #{:type} (set (keys button-attrs)))))
    (testing "only the starting state is markup, everywhere else the component writes"
      (is (= #{:default-open} (set (keys root-attrs))))
      (is (= "true" (:keep-mounted panel-attrs)))
      (is (= "true" (:hidden-until-found panel-attrs)))
      (is (nil? (:on-open-change root-attrs))))))

(deftest a-button-cannot-become-a-submit-button
  (is (= "button" (:type (:button-attrs
                          (parts (model/markup {:button-attrs {:type "submit"}})))))))

(deftest the-chevron-is-one-neutral-glyph
  (let [[tag attrs path] (model/chevron {:class "disclosure-chevron"})]
    (is (= :svg tag))
    (is (= model/chevron-view-box (:viewBox attrs)))
    (is (= "disclosure-chevron" (:class attrs)))
    (testing "a glyph a screen reader does not read twice"
      (is (= "true" (:aria-hidden attrs)))
      (is (= "false" (:focusable attrs))))
    (testing "the caller's box sizes it, so it has no size of its own"
      (is (nil? (:width attrs)))
      (is (nil? (:height attrs))))
    (testing "one shared path"
      (is (= [:path {:d model/chevron-path}] path)))))
