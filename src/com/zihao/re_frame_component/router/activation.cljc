(ns com.zihao.re-frame-component.router.activation
  "Pure route activation transition semantics for re-frame2 routers.")

(defn route-key
  "Return the stable location identity used to suppress duplicate activation."
  [route]
  (when route
    (select-keys route [:id :path :params :query :not-found?])))

(defn same-route?
  [left right]
  (= (route-key left) (route-key right)))

(defn transition
  "Describe one app-owned route activation opportunity.

  `scope-fn` groups addressable routes that share page-entry resources. A
  reactivation deliberately activates the current route even when its location
  is unchanged, which lets authentication or another app context become ready
  after the router has already initialized."
  [{:keys [reason previous-route route context scope-fn]}]
  (let [scope-of (or scope-fn :id)
        previous-scope (some-> previous-route scope-of)
        scope (some-> route scope-of)
        route-changed? (not (same-route? previous-route route))
        reactivate? (= :reactivate reason)
        activate? (and route (or route-changed? reactivate?))
        scope-changed? (not= previous-scope scope)]
    {:reason reason
     :previous-route previous-route
     :route route
     :previous-scope previous-scope
     :scope scope
     :context context
     :route-changed? route-changed?
     :scope-changed? scope-changed?
     :leaving-scope? (and activate?
                           (some? previous-scope)
                           scope-changed?)
     :entering-scope? (and activate?
                            (some? scope)
                            scope-changed?)
     :route-changed-within-scope? (and activate?
                                        route-changed?
                                        (some? scope)
                                        (not scope-changed?))
     :reactivate? reactivate?
     :activate? (boolean activate?)}))
