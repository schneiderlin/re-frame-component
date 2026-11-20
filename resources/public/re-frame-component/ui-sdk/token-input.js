var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/@ui-sdk/core/dist/foundation/platform/style.js
function setStyle(el, name, value) {
  const previous = el.style.getPropertyValue(name);
  const priority = el.style.getPropertyPriority(name);
  el.style.setProperty(name, value);
  const ours = el.style.getPropertyValue(name);
  return () => {
    if (el.style.getPropertyValue(name) !== ours) {
      return;
    }
    if (previous) {
      el.style.setProperty(name, previous, priority);
    } else {
      el.style.removeProperty(name);
    }
  };
}
function registerUninherited(names2) {
  if (typeof CSS === "undefined" || !CSS.registerProperty) {
    return;
  }
  for (const name of names2) {
    if (registered.has(name)) {
      continue;
    }
    registered.add(name);
    try {
      CSS.registerProperty({ name, syntax: "*", inherits: false });
    } catch {
    }
  }
}
function pageNonce(doc) {
  var _a3, _b3, _c;
  if (nonces.has(doc)) {
    return nonces.get(doc);
  }
  let meta;
  for (let at = doc; at && !meta; at = (_b3 = (_a3 = at.defaultView) == null ? void 0 : _a3.frameElement) == null ? void 0 : _b3.ownerDocument) {
    meta = (_c = at.head) == null ? void 0 : _c.querySelector('meta[property="csp-nonce"]');
  }
  const nonce = meta ? meta.nonce || meta.getAttribute("nonce") || "" : null;
  nonces.set(doc, nonce);
  return nonce;
}
function writeStyle(doc, id, css2) {
  if (!doc.head) {
    return;
  }
  const view2 = doc.defaultView;
  if (pageNonce(doc) === "" && view2 && "adoptedStyleSheets" in doc) {
    adoptStyle(doc, view2, id, css2);
  } else {
    appendStyle(doc, id, css2);
  }
}
function appendStyle(doc, id, css2) {
  const existing = doc.getElementById(id);
  if (existing) {
    if (styleText.get(existing) === css2) {
      return;
    }
    if (existing.textContent !== css2) {
      existing.textContent = css2;
    }
    styleText.set(existing, css2);
    return;
  }
  const style = doc.createElement("style");
  style.id = id;
  const nonce = pageNonce(doc);
  if (nonce) {
    style.nonce = nonce;
  }
  style.textContent = css2;
  styleText.set(style, css2);
  const ours = doc.head.querySelectorAll(':scope > style[id^="ui-sdk-"]');
  if (ours.length) {
    ours[ours.length - 1].after(style);
  } else {
    doc.head.prepend(style);
  }
}
function adoptStyle(doc, view2, id, css2) {
  let sheets = adopted().get(doc);
  if (!sheets) {
    adopted().set(doc, sheets = /* @__PURE__ */ new Map());
  }
  let entry = sheets.get(id);
  if (!entry) {
    sheets.set(id, entry = { sheet: new view2.CSSStyleSheet(), css: "" });
  }
  if (entry.css !== css2) {
    entry.sheet.replaceSync(css2);
    entry.css = css2;
  }
  if (!doc.adoptedStyleSheets.includes(entry.sheet)) {
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, entry.sheet];
  }
}
function enforceHidden(doc) {
  writeStyle(
    doc,
    "ui-sdk-hidden",
    '@layer ui-sdk { :where([data-slot][hidden]:not([hidden="until-found"])) { display: none !important } }'
  );
}
function ahead(work) {
  var _a3;
  if (typeof window === "undefined") {
    return;
  }
  if (!performance.getEntriesByType("paint").length) {
    work();
  } else if (queued) {
    queued.push(work);
  } else {
    queued = [work];
    ((_a3 = window.requestIdleCallback) != null ? _a3 : setTimeout)(() => {
      const jobs = queued;
      queued = void 0;
      jobs.forEach((job) => job());
    });
  }
}
function afterPaint(work) {
  let timer;
  const frame = requestAnimationFrame(() => {
    timer = setTimeout(work);
  });
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
  };
}
var registered, adopted, nonces, styleText, queued;
var init_style = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/platform/style.js"() {
    registered = /* @__PURE__ */ new Set();
    adopted = () => {
      var _a3, _b3;
      return (_b3 = globalThis[_a3 = /* @__PURE__ */ Symbol.for("ui-sdk.styles@1")]) != null ? _b3 : globalThis[_a3] = /* @__PURE__ */ new WeakMap();
    };
    nonces = /* @__PURE__ */ new WeakMap();
    styleText = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/@ui-sdk/core/dist/foundation/kernel/events.js
function on(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener, options);
}
function isComposing(event) {
  const key = "nativeEvent" in event ? event.nativeEvent : event;
  return key.isComposing === true || key.keyCode === 229;
}
var init_events = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/kernel/events.js"() {
  }
});

// node_modules/@ui-sdk/core/dist/foundation/platform/env.js
function isIOS() {
  return isBrowser && (/iP(hone|ad|od)/.test(navigator.platform) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isRTL(el) {
  return !!el && isBrowser && getComputedStyle(el).direction === "rtl";
}
var isBrowser;
var init_env = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/platform/env.js"() {
    isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  }
});

// node_modules/@ui-sdk/core/dist/foundation/platform/announce.js
var announce_exports = {};
__export(announce_exports, {
  announce: () => announce,
  prepareAnnouncements: () => prepareAnnouncements,
  setAnnouncer: () => setAnnouncer
});
function setAnnouncer(announce2) {
  announcer = announce2;
}
function regionIn(doc, priority) {
  let found2 = regions.get(doc);
  if (!found2) {
    regions.set(doc, found2 = {});
  }
  const existing = found2[priority];
  if (existing == null ? void 0 : existing.isConnected) {
    return existing;
  }
  const region = doc.createElement("div");
  region.setAttribute("role", priority === "assertive" ? "alert" : "status");
  region.setAttribute("aria-live", priority);
  region.setAttribute("aria-atomic", "true");
  region.setAttribute(
    "data-ui-sdk-announcer",
    priority === "assertive" ? "assertive" : ""
  );
  region.style.cssText = "position:fixed;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
  doc.body.append(region);
  found2[priority] = region;
  return region;
}
function prepareAnnouncements(doc) {
  if (announcer || !doc.body) {
    return;
  }
  regionIn(doc, "polite");
  regionIn(doc, "assertive");
}
function announce(text, {
  priority = "polite",
  doc = typeof document === "undefined" ? void 0 : document
} = {}) {
  if (!text) {
    return;
  }
  if (announcer) {
    return announcer(text, priority);
  }
  if (!(doc == null ? void 0 : doc.body)) {
    return;
  }
  const region = regionIn(doc, priority);
  region.textContent = "";
  clearTimeout(pending[priority]);
  pending[priority] = setTimeout(() => {
    region.textContent = text;
  }, 100);
}
var regions, announcer, pending;
var init_announce = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/platform/announce.js"() {
    regions = /* @__PURE__ */ new WeakMap();
    pending = {};
  }
});

// node_modules/@ui-sdk/core/dist/foundation/platform/sides.js
function physicalSide(side, rtl = false) {
  if (side === "start") {
    return rtl ? "right" : "left";
  }
  if (side === "end") {
    return rtl ? "left" : "right";
  }
  return side;
}
var opposite;
var init_sides = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/platform/sides.js"() {
    opposite = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left"
    };
  }
});

// node_modules/@ui-sdk/core/dist/foundation/kernel/dev-stub.js
var dev = false;
function emit(_event) {
}
function warn(_message, _from, _detail) {
}
function warnMissing(slots, _from) {
  return slots;
}
function checkRoles(_slots, _from) {
}
function checkRole(_definition, _slot, _own, _role, _from, _live) {
}
function checkFocus(_focus, _slot, _el, _from) {
}
function expectControlled(_instance, _info, _current) {
}
function forgetControlled(_instance) {
}
function heardControlled(_instance, _options) {
}
function measured(read) {
  read();
}
var isMeasuring = () => false;
function checkEvent(_reason, _event, _from) {
}
function checkPrevented(_name, _prevented, _details, _from) {
}
function checkControlled(_from, _keys, _options) {
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/keep.js
var lifecycles = /* @__PURE__ */ new WeakMap();
var making;
var deferring = false;
var destroying = 0;
function whileDestroying(run) {
  destroying++;
  try {
    run();
  } finally {
    destroying--;
  }
}
function withLifecycle(make) {
  const outer = making;
  const lifecycle = { starts: [] };
  making = lifecycle;
  let instance;
  try {
    instance = make();
  } finally {
    making = outer;
  }
  lifecycles.set(instance, lifecycle);
  if (outer) {
    outer.starts.push(() => {
      keep(instance);
      return () => release(instance);
    });
  } else if (!deferring && typeof document !== "undefined") {
    keep(instance);
  }
  return instance;
}
function whenKept(start) {
  if (making) {
    making.starts.push(start);
  } else if (dev) {
    warn(
      "`whenKept` runs only while an instance is made, so this work never starts."
    );
  }
}
function extendLifecycle(instance, run) {
  const outer = making;
  const added = { starts: [] };
  making = added;
  try {
    run();
  } finally {
    making = outer;
  }
  const lifecycle = lifecycles.get(instance);
  if (!lifecycle) {
    return;
  }
  lifecycle.starts.push(...added.starts);
  for (const start of lifecycle.stops ? added.starts : []) {
    const stop = start();
    if (stop) {
      lifecycle.stops.push(stop);
    }
  }
}
function keep(instance) {
  const lifecycle = lifecycles.get(instance);
  if (!lifecycle || lifecycle.stops) {
    return;
  }
  const stops = lifecycle.stops = [];
  for (const start of lifecycle.starts) {
    const stop = start();
    if (stop) {
      stops.push(stop);
    }
  }
}
function release(instance) {
  const lifecycle = lifecycles.get(instance);
  const stops = lifecycle == null ? void 0 : lifecycle.stops;
  if (!stops) {
    return;
  }
  lifecycle.stops = void 0;
  stops.forEach((stop) => stop());
}
function discard(instance) {
  release(instance);
  lifecycles.delete(instance);
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/controller.js
var attach = /* @__PURE__ */ Symbol.for("ui-sdk.controller.attach");
var detach = /* @__PURE__ */ Symbol.for("ui-sdk.controller.detach");
function attachController(controller, api) {
  var _a3;
  ;
  (_a3 = controller == null ? void 0 : controller[attach]) == null ? void 0 : _a3.call(controller, api);
}
function detachController(controller, api) {
  var _a3;
  ;
  (_a3 = controller == null ? void 0 : controller[detach]) == null ? void 0 : _a3.call(controller, api);
}
function connectController(context2, api) {
  let current = context2.options().controller;
  let kept = false;
  whenKept(() => {
    kept = true;
    attachController(current, api);
    return () => {
      kept = false;
      detachController(current, api);
    };
  });
  context2.onOptions(({ controller }) => {
    if (controller === current) {
      return;
    }
    detachController(current, api);
    current = controller;
    if (kept) {
      attachController(controller, api);
    }
  });
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/derive.js
var derivations = /* @__PURE__ */ new WeakMap();
function register(store, derivation) {
  let list = derivations.get(store);
  if (!list) {
    derivations.set(store, list = []);
  }
  list.push(derivation);
}
function deriveFromOptions(context2, keys, derive) {
  register(context2.store, {
    from: "options",
    keys,
    derive
  });
}
function deriveState(context2, keys, derive, { live: live2 = true } = {}) {
  const { store } = context2;
  register(store, {
    from: "state",
    keys,
    derive
  });
  store.subscribe((liveOnly) => {
    if (liveOnly && !live2) {
      return;
    }
    const patch = derive(store.get());
    if (patch) {
      store.set(patch);
    }
  });
}
function withDerived(store, options, synced, state) {
  const list = derivations.get(store);
  if (!list) {
    return synced;
  }
  let result = synced != null ? synced : {};
  for (const derivation of list) {
    if (!synced && derivation.from === "state") {
      continue;
    }
    const next = { ...state, ...result };
    const derived = derivation.from === "state" ? store.view(next, () => derivation.derive(next)) : derivation.derive(result, state, options);
    result = { ...result };
    for (const key of derivation.keys) {
      if (derived && key in derived) {
        result[key] = derived[key];
      } else if (derivation.from === "state") {
        result[key] = next[key];
      }
    }
  }
  return synced || Object.keys(result).length ? result : void 0;
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/details.js
var dismissReasons = [
  "escape-key",
  "outside-press",
  "focus-out",
  "window-blur",
  "back",
  "swipe"
];
function isDismissal(reason) {
  return dismissReasons.includes(reason);
}
var programmaticReasons = /* @__PURE__ */ new Set([
  "image-load",
  "image-error",
  "imperative",
  "item-removed",
  "unmount",
  "reset",
  "restore",
  "timeout",
  "resize",
  "page-hide"
]);
var cause;
function resolveSource(reason, eventSource) {
  if (cause === "agent") {
    return cause;
  }
  if (programmaticReasons.has(reason)) {
    return "programmatic";
  }
  if (eventSource) {
    const source = eventSource();
    return source === "programmatic" && cause ? cause : source;
  }
  return cause != null ? cause : "programmatic";
}
function withSource(source, run) {
  const outer = cause;
  cause = source;
  try {
    return run();
  } finally {
    cause = outer;
  }
}
function createDetails(given, source, cancelable = true) {
  if (!cancelable) {
    return { ...given, source };
  }
  let canceled = false;
  return {
    ...given,
    source,
    cancel: () => {
      canceled = true;
    },
    get canceled() {
      return canceled;
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/part.js
init_style();
init_events();

// node_modules/@ui-sdk/core/dist/foundation/kernel/store.js
var changedInPlace = /* @__PURE__ */ new WeakSet();
function sameValue(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  if (changedInPlace.has(a) || changedInPlace.has(b)) {
    return false;
  }
  return a.every((item, index) => Object.is(item, b[index]));
}
function createStore(initial, live2) {
  let state = initial;
  let renders2 = 0;
  let writes2 = 0;
  let followed2;
  let merged;
  let reading = false;
  let viewed;
  const listeners = /* @__PURE__ */ new Set();
  const skipping = /* @__PURE__ */ new Map();
  let fanout;
  const store = {
    get() {
      return viewed != null ? viewed : withFollowed();
    },
    // `delivered` marks keys `follow` already delivers, which parts that read
    // them through the framework skip.
    set(patch, delivered = false) {
      if (followed2 && !delivered && !reading) {
        const over = withFollowed();
        if (over !== state) {
          const rest = { ...over };
          for (const key in patch) {
            delete rest[key];
          }
          store.set(rest, true);
        }
      }
      const changed = [];
      for (const key in patch) {
        if (!sameValue(state[key], patch[key])) {
          changed.push(key);
        }
      }
      if (!changed.length) {
        return;
      }
      const previous = state;
      state = { ...state, ...patch };
      const liveOnly = changed.every((key) => live2.includes(key));
      notify(changed, previous, liveOnly, delivered);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    // The listeners of parts that select values, which `kernel/selects.ts` installs once.
    setFanout(next) {
      fanout = next;
    },
    // Keys `get()` reads from `read` from now on, ahead of `set`, like a
    // framework's props it hands over from an effect. `read` gets the state
    // the store holds.
    follow(read) {
      followed2 = read;
    },
    // Runs `read` with `get()` returning `next`, for state derived from state
    // the store doesn't hold yet, like what the framework is rendering.
    view(next, read) {
      const before = viewed;
      viewed = next;
      try {
        return read();
      } finally {
        viewed = before;
      }
    }
  };
  function withFollowed() {
    if (!followed2 || reading) {
      return state;
    }
    reading = true;
    let over;
    try {
      over = followed2(state);
    } finally {
      reading = false;
    }
    if (!over) {
      return state;
    }
    if ((merged == null ? void 0 : merged.state) === state && merged.over === over) {
      return merged.result;
    }
    let result = state;
    for (const key in over) {
      if (!sameValue(state[key], over[key])) {
        result = { ...state, ...over };
        break;
      }
    }
    merged = { state, over, result };
    return result;
  }
  function notify(changed, previous, liveOnly, delivered) {
    if (!liveOnly) {
      renders2++;
    }
    if (!delivered) {
      writes2++;
    }
    const run = (listener) => listener(liveOnly, delivered, changed);
    listeners.forEach(run);
    for (const [skip, group] of skipping) {
      if (!changed.length || changed.some((key) => !Object.hasOwn(skip, key))) {
        group.forEach(run);
      }
    }
    fanout == null ? void 0 : fanout(changed, previous, run);
  }
  held.set(store, {
    state: () => state,
    renders: () => renders2,
    writes: () => writes2,
    touch: () => notify([], state, false, false),
    skipping
  });
  return store;
}
var held = /* @__PURE__ */ new WeakMap();
function subscribeSkipping(store, skip, listener) {
  return join(held.get(store).skipping, skip, listener);
}
function join(groups, group, listener) {
  let members = groups.get(group);
  if (!members) {
    groups.set(group, members = /* @__PURE__ */ new Set());
  }
  members.add(listener);
  return () => {
    members.delete(listener);
    if (!members.size && groups.get(group) === members) {
      groups.delete(group);
    }
  };
}
var heldState = (store) => held.get(store).state();
var renders = (store) => held.get(store).renders();
var standFor = (owner3, store) => {
  held.set(owner3, held.get(store));
};
var touch = (store) => held.get(store).touch();

// node_modules/@ui-sdk/core/dist/foundation/kernel/selects.js
var isReader = (values) => typeof values === "object" && values !== null && !Array.isArray(values);
var narrowedStores = /* @__PURE__ */ new WeakMap();
function narrowedOf(store) {
  const found2 = narrowedStores.get(store);
  if (found2) {
    return found2;
  }
  const narrowed = {
    selectors: /* @__PURE__ */ new Map(),
    selecting: /* @__PURE__ */ new Map()
  };
  narrowedStores.set(store, narrowed);
  store.setFanout((changed, previous, run) => {
    const state = store.get();
    for (const key of changed) {
      const movers = narrowed.selecting.get(key);
      if (!movers) {
        continue;
      }
      const notify = (value) => {
        var _a3;
        return (_a3 = narrowed.selectors.get(`${String(key)}:${value}`)) == null ? void 0 : _a3.forEach(run);
      };
      const before = previous[key];
      for (const [moved, naming] of movers) {
        if (moved(before, state[key], notify) === true) {
          naming.forEach(run);
        }
      }
    }
  });
  return narrowed;
}
function selects(reads2) {
  const narrowing = Object.entries(reads2).filter(
    ([, values]) => isReader(values) || typeof values === "function" || values.length > 0
  );
  const valuesOf = (values, partView) => isReader(values) ? values.values(partView) : typeof values === "function" ? values(partView) : values;
  const selected = (part, props) => {
    const partView = view(part, props);
    return narrowing.map(
      ([key, values]) => [key, valuesOf(values, partView)]
    );
  };
  return {
    /**
     * The values a part reads each key it lists by, an empty list for a key it
     * never reads. A key it doesn't list, it reads whole.
     */
    reading(part, props) {
      const partView = view(part, props);
      return new Map(
        Object.entries(reads2).flatMap(
          ([key, values]) => isReader(values) ? [] : [[key, valuesOf(values, partView)]]
        )
      );
    },
    /** The values a part selects on, which it subscribes again for when they change. */
    selection(part, props) {
      const values = selected(part, props);
      return values.length ? JSON.stringify(values) : "";
    },
    /**
     * Runs `listener` when a change can affect the part: a key it selects on
     * took or left one of its values, or any other key changed. Every part of
     * the slot skips the listed keys as one group.
     */
    subscribe(part, listener, props) {
      const cleanups = [subscribeSkipping(part.store, reads2, listener)];
      for (const [key, values] of selected(part, props)) {
        const reader = reads2[key];
        const moved = isReader(reader) ? reader.moved : eachMoved;
        cleanups.push(
          ...values.map(
            (value) => select(part.store, key, value, listener, moved)
          )
        );
        if (moved !== eachMoved) {
          cleanups.push(joinMover(part.store, key, moved, listener));
        }
      }
      return () => cleanups.forEach((cleanup) => cleanup());
    }
  };
}
function select(store, key, value, listener, moved = eachMoved) {
  const leaveMover = joinMover(store, key, moved, () => {
  });
  const leave = join(
    narrowedOf(store).selectors,
    `${String(key)}:${value}`,
    listener
  );
  return () => {
    leave();
    leaveMover();
  };
}
function joinMover(store, key, moved, listener) {
  const { selecting } = narrowedOf(store);
  let movers = selecting.get(key);
  if (!movers) {
    selecting.set(key, movers = /* @__PURE__ */ new Map());
  }
  const leave = join(movers, moved, listener);
  return () => {
    leave();
    if (!movers.size && selecting.get(key) === movers) {
      selecting.delete(key);
    }
  };
}
function eachMoved(before, after, notify) {
  if (before == null) {
    before = emptyLike(after, before);
  } else if (after == null) {
    after = emptyLike(before, after);
  }
  if (isRecord(before) && isRecord(after)) {
    for (const name in before) {
      if (!Object.hasOwn(after, name) || !Object.is(before[name], after[name])) {
        notify(name);
      }
    }
    for (const name in after) {
      if (!Object.hasOwn(before, name)) {
        notify(name);
      }
    }
    return;
  }
  if (!Array.isArray(before) || !Array.isArray(after)) {
    return [before, after].forEach(notify);
  }
  let start = 0;
  let end = 0;
  while (start < before.length && before[start] === after[start]) {
    start++;
  }
  while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) {
    end++;
  }
  for (const values of [before, after]) {
    for (let index = start; index < values.length - end; index++) {
      notify(values[index]);
    }
  }
}
var isRecord = (value) => !!value && Object.getPrototypeOf(value) === Object.prototype;
var noItems = [];
var noEntries = {};
var emptyLike = (other, missing) => Array.isArray(other) ? noItems : isRecord(other) ? noEntries : missing;

// node_modules/@ui-sdk/core/dist/foundation/kernel/part.js
var ownerOf = (part) => part.owner;
var definitionOf = (part) => ownerOf(part).slots[part.slot];
var view = (part, props) => ({
  id: part.id,
  key: part.key,
  props,
  api: part.api
});
var context = (part, props = part.props) => ({
  el: part.el,
  id: part.id,
  key: part.key,
  props,
  store: part.store,
  api: part.api
});
function lease(part) {
  const { parts } = part.owner;
  const mapKey = `${part.slot}:${part.key}`;
  if (!parts.has(mapKey)) {
    parts.set(mapKey, part);
  }
  part.leases++;
  let held2 = true;
  return () => {
    if (!held2) {
      return;
    }
    held2 = false;
    if (--part.leases) {
      return;
    }
    const { owner: owner3 } = part;
    if (!owner3.released.length) {
      queueMicrotask(() => sweep(owner3));
    }
    owner3.released.push(part);
  };
}
function provisional(part) {
  const { owner: owner3 } = part;
  if (!owner3.released.length) {
    queueMicrotask(() => sweep(owner3));
  }
  owner3.released.push(part);
}
function sweep(owner3) {
  for (const part of owner3.released) {
    const mapKey = `${part.slot}:${part.key}`;
    if (!part.leases && owner3.parts.get(mapKey) === part) {
      owner3.parts.delete(mapKey);
    }
  }
  owner3.released = [];
}
function attrs(part, props = part.props, state = part.store.get()) {
  var _a3, _b3;
  const definition = definitionOf(part);
  const context2 = view(part, props);
  const own = (_a3 = definition.attrs) == null ? void 0 : _a3.call(definition, state, context2);
  const declared = definition.role;
  const role = typeof declared === "function" ? declared(state, context2) : declared;
  if (dev) {
    checkRole(
      definition,
      part.slot,
      own,
      role,
      { component: ownerOf(part).label, id: part.id },
      (_b3 = definition.live) == null ? void 0 : _b3.read(state, context2)
    );
  }
  const { name } = ownerOf(part);
  const result = {
    "data-slot": part.slot === "root" ? name : `${name}-${part.slot}`,
    ...declared === void 0 ? void 0 : { role },
    ...own
  };
  if (declared !== void 0) {
    result.role = role;
  }
  return aliased(part, result);
}
var authorOwned = /* @__PURE__ */ new Set([
  "aria-label",
  "aria-labelledby",
  "aria-description",
  "title",
  "autocomplete",
  "autocapitalize",
  "autocorrect",
  "spellcheck",
  "inputmode",
  "enterkeyhint"
]);
var madeLabel = (value) => typeof value === "string" && value.split(/\s+/).every((id) => id.startsWith("ui-sdk-"));
function present(part, props = part.props, state = part.store.get()) {
  var _a3, _b3, _c;
  return (_c = (_b3 = (_a3 = definitionOf(part)).present) == null ? void 0 : _b3.call(_a3, state, view(part, props))) != null ? _c : true;
}
function conditional(part) {
  return definitionOf(part).present !== void 0;
}
function liveAttrs(part, props = part.props) {
  var _a3, _b3;
  return aliased(
    part,
    (_b3 = (_a3 = definitionOf(part).live) == null ? void 0 : _a3.read(part.store.get(), view(part, props))) != null ? _b3 : {}
  );
}
var selectedKeys = (part, props = part.props) => {
  var _a3, _b3;
  return (_b3 = (_a3 = definitionOf(part).selects) == null ? void 0 : _a3.selection(part, props)) != null ? _b3 : "";
};
var skipNone = {};
function subscribe(part, listener, props = part.props) {
  const narrowed = definitionOf(part).selects;
  const cleanups = [
    lease(part),
    narrowed ? narrowed.subscribe(part, listener, props) : subscribeSkipping(part.store, skipNone, listener)
  ];
  return () => cleanups.forEach((cleanup) => cleanup());
}
function handlers(part) {
  const { on: events, press: activate } = definitionOf(part);
  const result = {};
  for (const type in events) {
    const handler = events[type];
    result[type] = (event) => {
      var _a3;
      if (event.defaultPrevented || composing(event)) {
        return;
      }
      (_a3 = ownerOf(part).sleeping) == null ? void 0 : _a3.wake();
      handler(event, context(part));
    };
  }
  if (typeof activate === "function" && !result.click) {
    result.click = (event) => {
      var _a3;
      if (!event.defaultPrevented) {
        (_a3 = ownerOf(part).sleeping) == null ? void 0 : _a3.wake();
        activate(context(part), event);
      }
    };
  }
  return result;
}
function propsRendered(part) {
  var _a3;
  (_a3 = part.propsListeners) == null ? void 0 : _a3.forEach((listener) => listener());
}
function onProps(part, listener) {
  var _a3;
  const listeners = (_a3 = part.propsListeners) != null ? _a3 : part.propsListeners = /* @__PURE__ */ new Set();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
var hidingSlots = /* @__PURE__ */ new WeakMap();
function canHide(part) {
  const definition = definitionOf(part);
  let hides = hidingSlots.get(definition);
  if (hides === void 0) {
    hides = !!definition.attrs && "hidden" in definition.attrs(part.store.get(), view(part, part.props));
    hidingSlots.set(definition, hides);
  }
  return hides;
}
function bind(part, el, host = { by: "core" }) {
  var _a3, _b3;
  const kept = part;
  const { parts } = kept.owner;
  const mapKey = `${part.slot}:${part.key}`;
  if (!part.el && ((_a3 = parts.get(mapKey)) != null ? _a3 : kept) === kept) {
    parts.delete(mapKey);
    parts.set(mapKey, kept);
  }
  if (dev) {
    checkShared(part, part.el, el);
    const { focus } = definitionOf(part);
    checkFocus(
      typeof focus === "function" ? focus(part.store.get(), view(part, part.props)) : focus,
      part.slot,
      el,
      {
        component: ownerOf(part).label,
        id: part.id
      }
    );
  }
  const binding = {};
  part.el = el;
  kept.binding = binding;
  const cleanups = [lease(kept)];
  if (canHide(part)) {
    enforceHidden(el.ownerDocument);
  }
  for (const [type, handler] of Object.entries(handlers(part))) {
    if (host.by === "core" || host.attaches !== "all" && !host.attaches.includes(type)) {
      cleanups.push(on(el, type, handler));
    }
  }
  const definition = definitionOf(part);
  if (definition.live) {
    cleanups.push(definition.live.attach(part, el));
  }
  if (host.by === "framework" && definition.direct) {
    cleanups.push(definition.direct.attach(part, el));
  }
  const early2 = (_b3 = definition.asleep) == null ? void 0 : _b3.call(definition, el, part);
  if (early2) {
    cleanups.push(early2);
  }
  const late = () => {
    var _a4;
    const cleanup = (_a4 = definition.bind) == null ? void 0 : _a4.call(definition, el, part);
    if (cleanup) {
      cleanups.push(cleanup);
    }
  };
  const { sleeping } = kept.owner;
  if (sleeping && definition.bind) {
    sleeping.binds.add(late);
    cleanups.push(() => sleeping.binds.delete(late));
  } else {
    late();
  }
  if (definition.attrs && typeof MutationObserver !== "undefined") {
    cleanups.push(followId(kept, el));
  }
  return () => {
    cleanups.forEach((cleanup) => cleanup());
    if (kept.binding !== binding) {
      return;
    }
    part.el = kept.binding = void 0;
    if (kept.own !== void 0) {
      readIdLater(kept);
    }
  };
}
function checkShared(part, bound, el) {
  if (!part.key || !bound || bound === el) {
    return;
  }
  queueMicrotask(() => {
    if (part.el !== el || !bound.isConnected || !el.isConnected) {
      return;
    }
    const { parts, label } = ownerOf(part);
    for (const other of parts.values()) {
      if (other.el === bound) {
        return;
      }
    }
    warn(
      `two "${part.slot}" parts share the key "${part.key}". Give each an id or a unique value.`,
      {
        component: label,
        id: part.id
      }
    );
  });
}
var connect = (part, el) => {
  var _a3, _b3, _c;
  return (_c = (_b3 = (_a3 = definitionOf(part)).connect) == null ? void 0 : _b3.call(_a3, el)) != null ? _c : (() => {
  });
};
var references = [
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
  "for",
  "headers"
];
var madeId = (part) => {
  var _a3, _b3;
  return (_b3 = (_a3 = definitionOf(part)).attrs) == null ? void 0 : _b3.call(
    _a3,
    part.store.get(),
    view(part, { ...part.props, id: void 0 })
  ).id;
};
function aliased(part, attrs2) {
  var _a3;
  const { owner: owner3 } = part;
  if (!((_a3 = owner3.named) == null ? void 0 : _a3.size) || !references.some((name) => attrs2[name])) {
    return attrs2;
  }
  const aliases = aliasesOf(owner3, part.store);
  if (!aliases.size) {
    return attrs2;
  }
  const result = { ...attrs2 };
  for (const name of references) {
    const ids = result[name];
    if (ids) {
      result[name] = ids.split(" ").map((id) => {
        var _a4;
        return (_a4 = aliases.get(id)) != null ? _a4 : id;
      }).join(" ");
    }
  }
  return result;
}
function aliasReferences(context2, attrs2) {
  for (const part of context2.parts()) {
    return aliased(part, attrs2);
  }
  return attrs2;
}
function aliasesOf(owner3, store) {
  var _a3;
  const version = renders(store);
  if (((_a3 = owner3.aliases) == null ? void 0 : _a3.version) === version) {
    return owner3.aliases.map;
  }
  const map = /* @__PURE__ */ new Map();
  for (const part of owner3.named) {
    const made = madeId(part);
    if (made !== void 0 && made !== part.own) {
      map.set(made, part.own);
    }
  }
  owner3.aliases = { version, map };
  return map;
}
function followId(part, el) {
  if (el.hasAttribute("id") || part.own !== void 0) {
    readIdLater(part);
  }
  const observer = new MutationObserver(() => readIdLater(part));
  observer.observe(el, { attributeFilter: ["id"] });
  return () => observer.disconnect();
}
function readIdLater(part) {
  const { owner: owner3 } = part;
  if (!owner3.unread) {
    owner3.unread = /* @__PURE__ */ new Set();
    queueMicrotask(() => readIds(owner3, part.store));
  }
  owner3.unread.add(part);
}
function readIds(owner3, store) {
  const parts = owner3.unread;
  owner3.unread = void 0;
  let renamed = owner3.renamed === true;
  owner3.renamed = void 0;
  for (const part of parts) {
    renamed = rename(part, part.el && idOf(part.el)) || renamed;
  }
  if (renamed) {
    touch(store);
  }
}
var idOf = (el) => el.localName === "form" ? el.getAttribute("id") : el.id;
function rename(part, id) {
  var _a3;
  const made = madeId(part);
  const own = id && id !== made ? id : void 0;
  if (own === part.own) {
    return false;
  }
  const { owner: owner3 } = part;
  part.own = own;
  (_a3 = owner3.named) != null ? _a3 : owner3.named = /* @__PURE__ */ new Set();
  if (own === void 0) {
    owner3.named.delete(part);
  } else {
    owner3.named.add(part);
  }
  owner3.aliases = void 0;
  return made !== void 0;
}
function composing(event) {
  return (event.type === "keydown" || event.type === "keyup") && isComposing(event);
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/watchers.js
var watchers = {};
var earlier = /* @__PURE__ */ new Set();
var watchLater = /* @__PURE__ */ new WeakMap();
function watchWhileKept(instance, parts, definition) {
  let unwatch;
  let waiting;
  const untrack = () => {
    unwatch == null ? void 0 : unwatch();
    unwatch = void 0;
    if (waiting) {
      earlier.delete(waiting);
    }
    waiting = void 0;
  };
  whenKept(() => {
    if (watchers.add) {
      unwatch = watchers.add(instance, parts, definition);
    } else if (typeof document !== "undefined") {
      earlier.add(waiting = new WeakRef(instance));
      watchLater.set(
        instance,
        () => {
          var _a3;
          return unwatch = (_a3 = watchers.add) == null ? void 0 : _a3.call(watchers, instance, parts, definition);
        }
      );
      if (earlier.size % 1e3 === 0) {
        for (const old of earlier) {
          if (!old.deref()) {
            earlier.delete(old);
          }
        }
      }
    }
    return untrack;
  });
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/primitive.js
function definePrimitive(definition) {
  var _a3;
  const slots = definition.slots((slot) => slot);
  const name = definition.name;
  const label = (_a3 = definition.label) != null ? _a3 : name;
  if (dev) {
    checkRoles(slots, { component: label });
  }
  const make = (initialOptions) => {
    var _a4, _b3, _c, _d;
    let options = initialOptions;
    const id = initialOptions.id;
    const store = createStore(
      { ...definition.state(options), ...(_a4 = definition.sync) == null ? void 0 : _a4.call(definition, options) },
      (_b3 = definition.live) != null ? _b3 : []
    );
    const destroys = [];
    const optionsListeners = [];
    const from = { component: label, id };
    const controlled = dev ? ((_c = definition.controlled) != null ? _c : ["open", "value", "checked"]).filter(
      (key) => key in store.get()
    ) : [];
    if (dev) {
      checkControlled(from, controlled, options);
    }
    const own = Object.create(
      dev ? warnMissing(slots, from) : slots
    );
    const used = /* @__PURE__ */ new Set();
    function use(feature) {
      var _a5;
      if (used.has(feature)) {
        return;
      }
      used.add(feature);
      Object.assign(own, feature.slots);
      wake();
      (_a5 = feature.extend) == null ? void 0 : _a5.call(feature, api);
    }
    const owner3 = {
      name,
      label,
      slots: own,
      parts: /* @__PURE__ */ new Map(),
      released: []
    };
    const { parts } = owner3;
    function keyOf(props = {}) {
      var _a5;
      return (_a5 = props.id) != null ? _a5 : props.value == null ? "" : String(props.value);
    }
    let viewedParts;
    function part(slot, props = {}, rendering = false) {
      const key = keyOf(props);
      const mapKey = `${slot}:${key}`;
      let found2 = parts.get(mapKey);
      if (!found2) {
        parts.set(
          mapKey,
          found2 = {
            slot,
            key,
            id,
            // Read when used, since an asleep instance builds its api later.
            get api() {
              return api;
            },
            store,
            props,
            el: void 0,
            owner: owner3,
            leases: 0
          }
        );
        if (rendering) {
          provisional(found2);
        }
      } else if (rendering) {
        return found2;
      }
      found2.props = props;
      propsRendered(found2);
      return found2;
    }
    function element2(slot, key) {
      var _a5, _b4;
      if (key === void 0) {
        for (const part2 of parts.values()) {
          if (part2.slot === slot && ((_a5 = part2.el) == null ? void 0 : _a5.isConnected)) {
            return part2.el;
          }
        }
        return;
      }
      const el = (_b4 = parts.get(`${slot}:${key}`)) == null ? void 0 : _b4.el;
      return (el == null ? void 0 : el.isConnected) ? el : void 0;
    }
    const context2 = {
      id,
      label,
      store,
      options: () => options,
      onOptions: (listener) => optionsListeners.push(listener),
      onDestroy: (cleanup) => destroys.push(cleanup),
      parts: () => parts.values(),
      element: element2,
      props: (slot, key = "") => {
        var _a5;
        const shown = viewedParts == null ? void 0 : viewedParts[slot];
        return shown && keyOf(shown) === key ? shown : (_a5 = parts.get(`${slot}:${key}`)) == null ? void 0 : _a5.props;
      }
    };
    let api = void 0;
    function build() {
      var _a5, _b4;
      api = definition.api(context2);
      connectController(context2, api);
      if (dev) {
        for (const action of (_b4 = (_a5 = definition.agent) == null ? void 0 : _a5.actions) != null ? _b4 : []) {
          if (typeof api[action] !== "function") {
            warn(
              `lists \`${action}\` in \`agent.actions\`, but its api has no such method.`,
              from
            );
          }
        }
      }
    }
    function wake() {
      const { sleeping } = owner3;
      if (!sleeping) {
        return;
      }
      owner3.sleeping = void 0;
      extendLifecycle(instance, build);
      for (const bind2 of [...sleeping.binds]) {
        bind2();
      }
    }
    if ((_d = definition.asleep) == null ? void 0 : _d.call(definition, options)) {
      owner3.sleeping = { wake, binds: /* @__PURE__ */ new Set() };
    } else {
      build();
    }
    let handing = false;
    let following2 = false;
    let destroyed = false;
    const syncFrom = (options2, state) => {
      var _a5;
      return withDerived(store, options2, (_a5 = definition.sync) == null ? void 0 : _a5.call(definition, options2), state);
    };
    const instance = {
      // Type-only. Lets adapters read slot props, state and api types.
      types: void 0,
      name,
      id,
      get: store.get,
      subscribe: store.subscribe,
      get api() {
        wake();
        return api;
      },
      part,
      use,
      // The state `next` would make, or undefined when it makes none new, so
      // a framework can render a controlled value before it commits it.
      preview(next) {
        const synced = syncFrom({ ...next, id }, store.get());
        const current = store.get();
        for (const key in synced) {
          if (!sameValue(current[key], synced[key])) {
            return { ...current, ...synced };
          }
        }
      },
      // Runs `read` with `get()` returning `state`, and the api reading the
      // parts in `around` with the props given there, so a framework that
      // renders a preview reads the api, like a list's items or a radio
      // group's value, from it too.
      view(state, read, around) {
        const outer = viewedParts;
        viewedParts = around;
        try {
          return store.view(state, read);
        } finally {
          viewedParts = outer;
        }
      },
      setOptions(next) {
        var _a5;
        const held2 = heldState(store);
        const arriving = next.id === id ? next : { ...next, id };
        const shown = dev && following2 ? syncFrom(arriving, held2) : void 0;
        options = arriving;
        if (dev) {
          checkControlled(from, controlled, options);
        }
        if (owner3.sleeping && !definition.asleep(options)) {
          wake();
        }
        const synced = syncFrom(options, held2);
        if (dev && shown) {
          const torn = tornKeys(shown, synced);
          if (torn.length) {
            emit({ type: "relay", ...from, keys: torn });
          }
        }
        let source;
        handing = true;
        try {
          for (const listener of optionsListeners) {
            source = (_a5 = listener(options, synced)) != null ? _a5 : source;
          }
          const landing = heldState(store) === held2 ? synced : syncFrom(options, heldState(store));
          if (landing) {
            withSource(source, () => store.set(landing, true));
          }
        } finally {
          handing = false;
        }
      },
      // The state a new instance with `next` would start at. The web adapter
      // reads a form reset's defaults from it when properties set before
      // connecting started an element elsewhere.
      startState: (next) => definition.state({ ...next, id }),
      // Reads the keys `sync` makes from `current`, a framework's props, from
      // now on: state has them the moment the props change, before
      // `setOptions` hands them over from an effect, and parts the framework
      // renders read them through it rather than hear the store. Pass the same
      // object while the props stay the same. Returns a read of what `sync`
      // makes of them. Given the options an earlier read had as `before`, it
      // reads what those make of the same state, so a framework tells what
      // the props changed from what state did.
      follow(current) {
        following2 = true;
        let last;
        let synced;
        const read = (state = heldState(store), before) => {
          if (before) {
            return syncFrom({ ...before, id }, state);
          }
          if (destroyed) {
            return synced;
          }
          const options2 = current();
          if ((last == null ? void 0 : last.options) !== options2 || last.state !== state) {
            last = { options: options2, state };
            synced = syncFrom({ ...options2, id }, state);
          }
          return synced;
        };
        store.follow(read);
        if (dev) {
          store.subscribe((_, delivered, keys) => {
            if (handing && !delivered && !isMeasuring()) {
              emit({ type: "relay", ...from, keys: [...keys] });
            }
          });
        }
        return read;
      },
      // The instance left the page. Stops what it started outside itself for
      // good, then runs its `onDestroy` callbacks, which settle what waits on
      // it, like a popup's pending `open()`. Adapters call it once the
      // component unmounts, and a second call does nothing.
      destroy() {
        if (destroyed) {
          return;
        }
        destroyed = true;
        discard(instance);
        whileDestroying(() => destroys.forEach((cleanup) => cleanup()));
        if (dev) {
          emit({ type: "instance", action: "destroy", ...from, controlled });
        }
      }
    };
    standFor(instance, store);
    watchWhileKept(instance, parts, definition);
    if (dev) {
      emit({ type: "instance", action: "create", ...from, controlled });
    }
    return instance;
  };
  const create = (initialOptions) => withLifecycle(() => make(initialOptions));
  Object.defineProperty(create, "name", { value: name });
  return Object.assign(create, {
    options: definition.options,
    slots
  });
}
function tornKeys(shown, landed) {
  const before = shown;
  const after = landed != null ? landed : {};
  const keys = /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => !sameValue(before[key], after[key]));
}
var schemas = /* @__PURE__ */ new WeakMap();
function schemaOf(primitive) {
  let schema = schemas.get(primitive);
  if (!schema) {
    const { options, slots = {} } = primitive;
    schema = {
      options: { debug: "boolean", ...options },
      slots: Object.fromEntries(
        Object.entries(slots).map(([slot, def]) => {
          var _a3;
          return [
            slot,
            (_a3 = def.props) != null ? _a3 : {}
          ];
        })
      )
    };
    schemas.set(primitive, schema);
  }
  return schema;
}
var renderVersion = (instance) => renders(instance);

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-model.js
var TOKEN_CHAR = "\uFFFC";
var lastId = 0;
var nextId = () => `t${++lastId}`;
var reserveId = (id) => {
  if (/^t\d{1,15}$/.test(id)) {
    lastId = Math.max(lastId, Number(id.slice(1)));
  }
};
var isToken = (segment) => typeof segment === "object" && segment !== null;
function normalizeValue(value) {
  for (const segment of value) {
    if (isToken(segment) && segment.id) {
      reserveId(segment.id);
    }
  }
  const ids = /* @__PURE__ */ new Set();
  const result = [];
  for (const segment of value) {
    if (isToken(segment)) {
      const token = segment.id && !ids.has(segment.id) ? segment : { ...segment, id: nextId() };
      ids.add(token.id);
      result.push(token);
      continue;
    }
    if (!segment) {
      continue;
    }
    const last = result.length - 1;
    if (typeof result[last] === "string") {
      result[last] += segment;
    } else {
      result.push(segment);
    }
  }
  return result;
}
function valueLength(value) {
  let length = 0;
  for (const segment of value) {
    length += isToken(segment) ? 1 : segment.length;
  }
  return length;
}
function offsetText(value) {
  return value.map((segment) => isToken(segment) ? TOKEN_CHAR : segment).join("");
}
function sliceValue(value, start, end = Infinity) {
  const result = [];
  let at = 0;
  for (const segment of value) {
    const length = isToken(segment) ? 1 : segment.length;
    const from = Math.max(start - at, 0);
    const to = Math.min(end - at, length);
    if (from < to) {
      result.push(isToken(segment) ? segment : segment.slice(from, to));
    }
    at += length;
    if (at >= end) {
      break;
    }
  }
  return result;
}
function replaceRange(value, range, content) {
  return normalizeValue([
    ...sliceValue(value, 0, range.start),
    ...content,
    ...sliceValue(value, range.end)
  ]);
}
function tokenAt(value, offset) {
  const segment = sliceValue(value, offset, offset + 1)[0];
  return isToken(segment) ? segment : void 0;
}
var tokensOf = (value) => value.filter(isToken);
function removedTokens(before, after) {
  const kept = new Set(tokensOf(after).map((token) => token.id));
  return tokensOf(before).filter((token) => !kept.has(token.id));
}
function sameValue2(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((segment, index) => {
    const other = b[index];
    if (!isToken(segment) || !isToken(other)) {
      return segment === other;
    }
    return segment.id === other.id && segment.type === other.type && segment.value === other.value && segment.label === other.label && segment.status === other.status && segment.data === other.data;
  });
}
function wordBoundary(value, offset, direction) {
  const text = offsetText(value);
  let at = offset;
  const charAt = (index) => text[direction < 0 ? index - 1 : index];
  const inside = (index) => direction < 0 ? index > 0 : index < text.length;
  if (charAt(at) === TOKEN_CHAR) {
    return at + direction;
  }
  while (inside(at) && /\s/.test(charAt(at)) && charAt(at) !== "\n") {
    at += direction;
  }
  if (charAt(at) === TOKEN_CHAR && at !== offset) {
    return at;
  }
  while (inside(at) && !/\s/.test(charAt(at)) && charAt(at) !== TOKEN_CHAR) {
    at += direction;
  }
  return at === offset && inside(at) ? at + direction : at;
}
function lineBoundary(value, offset, direction) {
  const text = offsetText(value);
  if (direction < 0) {
    const start = text.lastIndexOf("\n", offset - 1) + 1;
    return start === offset && offset > 0 ? offset - 1 : start;
  }
  const end = text.indexOf("\n", offset);
  return end === -1 ? text.length : end === offset ? offset + 1 : end;
}
var escapeIn = (text, special) => text.replace(special, (char) => `\\${char}`);
var unescape = (text) => text.replace(/\\([\s\S])/g, "$1");
var linkPattern = /\[@((?:\\[\s\S]|[^\\\]])*)\]\(([\w-]+):((?:\\[\s\S]|[^\\()])*)\)/y;
function trailingSlashes(text) {
  let end = text.length;
  while (end > 0 && text[end - 1] === "\\") {
    end--;
  }
  return text.slice(end);
}
var defaultCodec = {
  format: (token) => `[@${escapeIn(token.label, /[\\[\]]/g)}](${token.type}:${escapeIn(token.value, /[\\()]/g)})`,
  // Backslashes before `[@` double, plus one more when the bracket is literal.
  // A run of backslashes at the end of text before a token doubles too.
  escape(text, next) {
    const parts = text.split("[@");
    const last = parts.pop();
    return parts.map((part) => `${part}${trailingSlashes(part)}\\[@`).join("") + last + (next ? trailingSlashes(last) : "");
  },
  parse(text) {
    const value = [];
    let plain2 = "";
    let index = 0;
    while (index < text.length) {
      const bracket = text.indexOf("[@", index);
      if (bracket === -1) {
        break;
      }
      let slashes = 0;
      while (bracket - slashes - 1 >= index && text[bracket - slashes - 1] === "\\") {
        slashes++;
      }
      plain2 += text.slice(index, bracket - slashes) + "\\".repeat(Math.floor(slashes / 2));
      if (slashes % 2) {
        plain2 += "[@";
        index = bracket + 2;
        continue;
      }
      linkPattern.lastIndex = bracket;
      const link = linkPattern.exec(text);
      if (!link) {
        plain2 += "[@";
        index = bracket + 2;
        continue;
      }
      value.push(plain2, {
        type: link[2],
        value: unescape(link[3]),
        label: unescape(link[1])
      });
      plain2 = "";
      index = linkPattern.lastIndex;
    }
    value.push(plain2 + text.slice(index));
    return normalizeValue(value);
  }
};
function toText(value, codec = defaultCodec) {
  return value.map((segment, index) => {
    if (isToken(segment)) {
      return codec.format(segment);
    }
    const next = value[index + 1];
    return codec.escape ? codec.escape(segment, isToken(next) ? next : void 0) : segment;
  }).join("");
}
function toLabel(value) {
  return value.map((segment) => isToken(segment) ? segment.label : segment).join("");
}
function fromText(text, codec = defaultCodec) {
  return codec.parse(text);
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/order.js
var following = 4;
var isAfter = (node, later2) => !!(node.compareDocumentPosition(later2) & following);
var documentOrder = (a, b) => isAfter(a, b) ? -1 : 1;
var walkFrom = 16;
var walkPerEntry = 32;
function inDocumentOrder(entries) {
  let container = entries.length < walkFrom ? null : entries[0].el.parentNode;
  while (container && !entries.every(({ el }) => container.contains(el))) {
    container = container.parentNode;
  }
  if (container) {
    const byElement = new Map(
      entries.map((entry) => [entry.el, entry])
    );
    const sorted = [];
    const walker = entries[0].el.ownerDocument.createTreeWalker(container, 1);
    let budget = entries.length * walkPerEntry;
    for (let node = container; node && budget--; node = walker.nextNode()) {
      const entry = byElement.get(node);
      if (entry && sorted.push(entry) === entries.length) {
        return sorted;
      }
    }
  }
  return entries.sort((a, b) => documentOrder(a.el, b.el));
}
function createOrder() {
  const entries = /* @__PURE__ */ new Map();
  let order;
  let joined = [];
  let left = false;
  let moves2;
  const watched = /* @__PURE__ */ new Set();
  const current = (entry) => entries.get(entry.key) === entry;
  function watch(added, list) {
    var _a3;
    moves2 != null ? moves2 : moves2 = new MutationObserver(() => order = void 0);
    const last = (_a3 = list[list.length - 1]) == null ? void 0 : _a3.el;
    for (const { el } of added) {
      for (let node = el.parentNode; node && !watched.has(node); node = node.parentNode) {
        watched.add(node);
        moves2.observe(node, { childList: true });
        if (node.contains(last)) {
          break;
        }
      }
    }
  }
  function sorted() {
    const all = [...entries.values()];
    const list = inDocumentOrder(all.filter((entry) => entry.el.isConnected));
    if (list.length < all.length) {
      return list;
    }
    if (typeof MutationObserver !== "undefined") {
      moves2 == null ? void 0 : moves2.disconnect();
      watched.clear();
      watch(list, list);
    }
    return order = list;
  }
  function updated(kept) {
    const added = joined.filter(current);
    if (added.some((entry) => !entry.el.isConnected)) {
      return;
    }
    const list = kept.filter(current);
    if (added.length * Math.log2(list.length + 2) > list.length) {
      return;
    }
    for (const entry of added) {
      let low = 0;
      let high = list.length;
      while (low < high) {
        const middle = low + high >> 1;
        if (isAfter(list[middle].el, entry.el)) {
          low = middle + 1;
        } else {
          high = middle;
        }
      }
      list.splice(low, 0, entry);
    }
    if (moves2) {
      watch(added, list);
    }
    return list;
  }
  return {
    /** The entries in the page, in document order. Shared until one is added, removed or moved. */
    list() {
      if (moves2 == null ? void 0 : moves2.takeRecords().length) {
        order = void 0;
      }
      if (order && (joined.length || left)) {
        order = updated(order);
      }
      joined = [];
      left = false;
      return order != null ? order : sorted();
    },
    /** Adds an entry, or replaces the one with its key. Returns its removal. */
    add(entry) {
      if (order && entries.has(entry.key)) {
        left = true;
      }
      entries.set(entry.key, entry);
      if (order) {
        joined.push(entry);
      }
      return () => {
        if (!current(entry)) {
          return;
        }
        entries.delete(entry.key);
        left = true;
        if (!entries.size) {
          moves2 == null ? void 0 : moves2.disconnect();
          watched.clear();
          order = void 0;
        }
      };
    },
    get: (key) => entries.get(key),
    size: () => entries.size
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/trusted.js
var trusted = (event) => event.isTrusted;

// node_modules/@ui-sdk/core/dist/foundation/forms/value.js
function prototypeValue(el) {
  return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
}
function afterReset(event, run) {
  setTimeout(() => {
    if (!event.defaultPrevented) {
      run();
    }
  });
}
var scriptWrites = /* @__PURE__ */ new Set();
function writeFromScript(el, write) {
  if (scriptWrites.has(el)) {
    return write();
  }
  scriptWrites.add(el);
  try {
    write();
  } finally {
    scriptWrites.delete(el);
  }
}
function writingFromScript(el) {
  for (let node = el; node; node = node.parentElement) {
    if (scriptWrites.has(node)) {
      return true;
    }
  }
  return false;
}
function writeValue(el, value, options) {
  if ((options == null ? void 0 : options.asUser) && !writingFromScript(el)) {
    prototypeValue(el).set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  } else if (el.value !== value) {
    el.value = value;
  }
}
function keepsValueOnReset(value, defaultValue) {
  return value !== void 0 && defaultValue === void 0;
}

// node_modules/@ui-sdk/core/dist/foundation/forms/form.js
var internalsOf = /* @__PURE__ */ new WeakMap();
var focusOf = /* @__PURE__ */ new WeakMap();
function focusWith(el, focus) {
  focusOf.set(el, focus);
  return () => {
    if (focusOf.get(el) === focus) {
      focusOf.delete(el);
    }
  };
}
function focusControl(el) {
  const focus = focusOf.get(el);
  if (focus) {
    focus();
  } else {
    el.focus();
  }
}
var focusing = /* @__PURE__ */ new WeakSet();
function claimInvalidFocus(el, form) {
  const owner3 = form != null ? form : el.ownerDocument;
  if (focusing.has(owner3)) {
    return;
  }
  focusing.add(owner3);
  setTimeout(() => focusing.delete(owner3));
  focusControl(el);
}
function attachFormInternals(el, internals, bind2) {
  internalsOf.set(el, { internals, bind: bind2 });
}
var messages = /* @__PURE__ */ new Map();
function valueMissingMessage(type) {
  if (typeof document === "undefined") {
    return "";
  }
  if (!messages.has(type)) {
    const control = type === "select" ? document.createElement("select") : Object.assign(document.createElement("input"), { type });
    control.name = "message";
    control.required = true;
    messages.set(type, control.validationMessage);
  }
  return messages.get(type);
}
var validityListeners = /* @__PURE__ */ new Set();
function validityChanged(el) {
  validityListeners.forEach((listener) => listener(el));
}
function fieldsetDisabled(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (!(node instanceof HTMLFieldSetElement) || !node.disabled) {
      continue;
    }
    const legend = node.querySelector(":scope > legend");
    if (!(legend == null ? void 0 : legend.contains(el))) {
      return true;
    }
  }
  return false;
}
var hiddenInputStyle = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;opacity:0;pointer-events:none";
function associate(input, options) {
  const cleanups = [];
  const onReset = (event) => {
    if (event.target !== input.form) {
      return;
    }
    afterReset(event, () => {
      options.reset();
      options.write();
    });
  };
  input.ownerDocument.addEventListener("reset", onReset, true);
  cleanups.push(
    () => input.ownerDocument.removeEventListener("reset", onReset, true)
  );
  const onFocus = () => options.focus();
  input.addEventListener("focus", onFocus);
  cleanups.push(() => input.removeEventListener("focus", onFocus));
  cleanups.push(watchFieldsets(input, options.disabled));
  return () => cleanups.forEach((cleanup) => cleanup());
}
var moves = /* @__PURE__ */ new WeakMap();
function watchFieldsets(el, onChange) {
  let disabled;
  let observer;
  let active2 = true;
  const check = () => {
    if (observer) {
      observer.disconnect();
      for (let node = el.parentElement; node == null ? void 0 : node.closest("fieldset"); node = node.parentElement) {
        observer.observe(node, {
          childList: true,
          attributeFilter: ["disabled"]
        });
      }
    }
    const now = fieldsetDisabled(el);
    if (now !== disabled) {
      onChange(disabled = now);
    }
  };
  const watch = () => {
    if (!active2) {
      return;
    }
    if (typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(check);
    }
    check();
    moves.set(el, check);
  };
  if (el.isConnected) {
    watch();
  } else {
    queueMicrotask(watch);
  }
  return () => {
    active2 = false;
    observer == null ? void 0 : observer.disconnect();
    moves.delete(el);
  };
}
var elementMoved = (el) => {
  var _a3;
  return (_a3 = moves.get(el)) == null ? void 0 : _a3();
};
var isDisabled = (state) => state.disabled || state.formDisabled;
function bindValueInput(input, options) {
  const write = () => writeValue(input, options.value());
  write();
  const onChange = (event) => {
    var _a3;
    if (!trusted(event) || input.value === options.value()) {
      return;
    }
    (_a3 = options.autofill) == null ? void 0 : _a3.call(options, input.value);
    write();
  };
  input.addEventListener("change", onChange);
  const cleanups = [
    options.subscribe(write),
    associate(input, { ...options, write }),
    () => input.removeEventListener("change", onChange)
  ];
  return () => cleanups.forEach((cleanup) => cleanup());
}
function bindInternals(el, options) {
  const attached = internalsOf.get(el);
  return attached ? attached.bind(el, attached.internals, options) : () => {
  };
}
var labelCount = 0;
function labelsOf(el) {
  const labels = [];
  const around = el.closest("label");
  if ((around == null ? void 0 : around.control) === el) {
    labels.push(around);
  }
  if (el.id) {
    const root = el.getRootNode();
    root.querySelectorAll(`label[for="${CSS.escape(el.id)}"]`).forEach((label) => {
      if (label !== around && label.control === el) {
        labels.push(label);
      }
    });
  }
  return labels.sort(documentOrder);
}
function labelledBy(el, findLabels, watch = el) {
  let written;
  const update = () => {
    const current = el.getAttribute("aria-labelledby");
    if (el.hasAttribute("aria-label") || current !== null && current !== written) {
      return;
    }
    const labels = findLabels();
    for (const label of labels) {
      if (!label.id) {
        label.id = `ui-sdk-label-${++labelCount}`;
      }
    }
    const ids = labels.map((label) => label.id).join(" ");
    if (!ids) {
      if (written !== void 0) {
        el.removeAttribute("aria-labelledby");
      }
      written = void 0;
      return;
    }
    written = ids;
    if (current !== ids) {
      el.setAttribute("aria-labelledby", ids);
    }
  };
  queueMicrotask(update);
  watch.addEventListener("focusin", update);
  return () => watch.removeEventListener("focusin", update);
}

// node_modules/@ui-sdk/core/dist/foundation/focus/press-keeps-focus.js
var fields = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
function holdFocus(event, { el }) {
  const field = event.target.closest(fields);
  if (field && !field.contains(el != null ? el : null)) {
    return;
  }
  event.preventDefault();
}
var pressKeepsFocus = { pointerdown: holdFocus, mousedown: holdFocus };

// node_modules/@ui-sdk/core/dist/foundation/lists/async-options.js
function createAsyncOptions(load, {
  debounce = 200,
  query = "",
  immediate = false,
  minLength = 0
} = {}) {
  let state = {
    query,
    items: [],
    status: "idle",
    error: void 0,
    hasMore: false
  };
  const listeners = /* @__PURE__ */ new Set();
  let timer;
  let controller;
  let page = 0;
  function set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }
  function cancel() {
    clearTimeout(timer);
    timer = void 0;
    controller == null ? void 0 : controller.abort();
    controller = void 0;
  }
  const tooShort = (text) => text.trim().length < minLength;
  function clear(text) {
    cancel();
    set({
      query: text,
      items: [],
      status: "idle",
      error: void 0,
      hasMore: false
    });
  }
  function run(next) {
    if (tooShort(state.query)) {
      clear(state.query);
      return;
    }
    controller == null ? void 0 : controller.abort();
    const current = new AbortController();
    controller = current;
    page = next;
    set({ status: "loading", error: void 0 });
    load(state.query, { signal: current.signal, page: next }).then(
      (result) => {
        var _a3;
        if (current.signal.aborted) {
          return;
        }
        controller = void 0;
        const items = Array.isArray(result) ? result : (_a3 = result == null ? void 0 : result.items) != null ? _a3 : [];
        const hasMore = !Array.isArray(result) && !!(result == null ? void 0 : result.hasMore);
        set({
          items: next === 0 ? items : [...state.items, ...items],
          status: "idle",
          hasMore
        });
      },
      (error) => {
        if (current.signal.aborted) {
          return;
        }
        controller = void 0;
        set({ status: "error", error });
      }
    );
  }
  if (immediate) {
    run(0);
  }
  return {
    /** The current items, text and status. */
    getState: () => state,
    /** Runs `listener` after every change. Returns an unsubscribe. */
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Loads for new text once typing pauses, replacing any load still running. */
    setQuery(next) {
      if (next === state.query && (state.status === "loading" || timer !== void 0)) {
        return;
      }
      if (tooShort(next)) {
        clear(next);
        return;
      }
      cancel();
      set({ query: next, status: "loading", error: void 0 });
      timer = setTimeout(() => {
        timer = void 0;
        run(0);
      }, debounce);
    },
    /** Loads the current text again, now. */
    reload() {
      cancel();
      run(0);
    },
    /** Loads the next page and appends it, when `load` said there's more. */
    loadMore() {
      if (state.status === "loading" || !state.hasMore) {
        return;
      }
      run(page + 1);
    },
    /** Stops any pending or running load. */
    cancel() {
      cancel();
      if (state.status === "loading") {
        set({ status: "idle" });
      }
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/bound-keys.js
var queued2 = /* @__PURE__ */ new WeakMap();
function later(store, edit) {
  const waiting = queued2.get(store);
  if (waiting) {
    return void waiting.push(edit);
  }
  const edits = [edit];
  queued2.set(store, edits);
  queueMicrotask(() => {
    queued2.delete(store);
    const draft = {};
    for (const run of edits) {
      run(draft);
    }
    store.set(draft);
  });
}
function keyWhileBound(store, field, key) {
  const edit = (change) => later(store, (draft) => {
    var _a3;
    draft[field] = change(
      (_a3 = draft[field]) != null ? _a3 : store.get()[field]
    );
  });
  let bound = true;
  let added = false;
  edit((keys) => {
    if (!bound) {
      return keys;
    }
    added = true;
    return [...keys, key];
  });
  return () => {
    bound = false;
    edit((keys) => {
      if (!added) {
        return keys;
      }
      const index = keys.indexOf(key);
      return index === -1 ? keys : keys.filter((_, at) => at !== index);
    });
  };
}
function flagWhileBound(store, key, { now = false } = {}) {
  const flag = (value) => now ? store.set({ [key]: value }) : later(store, (draft) => draft[key] = value);
  flag(true);
  return () => flag(false);
}

// node_modules/@ui-sdk/core/dist/foundation/motion/presence.js
var pendingResets = /* @__PURE__ */ new WeakMap();
function animateIn(el, done) {
  var _a3, _b3;
  (_a3 = pendingResets.get(el)) == null ? void 0 : _a3();
  const running = (_b3 = el.getAnimations) == null ? void 0 : _b3.call(el, { subtree: true }).filter(isTransition);
  const settled = running == null ? void 0 : running.every((animation) => targetOf(animation) !== el);
  el.setAttribute("data-starting-style", "");
  if (running && settled) {
    for (const animation of el.getAnimations({ subtree: true })) {
      if (isTransition(animation) && !running.some((moving2) => continues(animation, moving2))) {
        animation.finish();
      }
    }
  }
  let stopWaiting;
  let timer;
  const frame = requestAnimationFrame(
    () => timer = setTimeout(() => {
      el.removeAttribute("data-starting-style");
      if (done) {
        stopWaiting = whenFinished(el, done);
      }
    })
  );
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    stopWaiting == null ? void 0 : stopWaiting();
    el.removeAttribute("data-starting-style");
  };
}
var isTransition = (animation) => "transitionProperty" in animation;
var targetOf = (animation) => {
  var _a3;
  return (_a3 = animation.effect) == null ? void 0 : _a3.target;
};
var continues = (animation, moving2) => targetOf(animation) === targetOf(moving2) && animation.transitionProperty === moving2.transitionProperty;
function seconds(value) {
  return value.split(",").map((part) => {
    const number = parseFloat(part) || 0;
    return part.trim().endsWith("ms") ? number / 1e3 : number;
  });
}
function longest(el) {
  return Math.max(
    durationOf(getComputedStyle(el)),
    durationOf(getComputedStyle(el, "::backdrop"))
  );
}
function durationOf(style) {
  const pairs = (durations, delays, iterations = "1") => {
    const d = seconds(durations);
    const l = seconds(delays);
    const n = iterations.split(",").map((part) => part.trim() === "infinite" ? 1 : parseFloat(part) || 1);
    return d.map(
      (duration, index) => {
        var _a3, _b3;
        return (duration * ((_a3 = n[index % n.length]) != null ? _a3 : 1) + ((_b3 = l[index % l.length]) != null ? _b3 : 0)) * 1e3;
      }
    );
  };
  return Math.max(
    0,
    ...pairs(style.transitionDuration, style.transitionDelay),
    ...pairs(
      style.animationDuration,
      style.animationDelay,
      style.animationIterationCount
    )
  );
}
function remaining(animations) {
  var _a3;
  let longestLeft = 0;
  for (const animation of animations) {
    const timing = (_a3 = animation.effect) == null ? void 0 : _a3.getComputedTiming();
    const end = Number(timing == null ? void 0 : timing.endTime);
    if (!timing || !Number.isFinite(end)) {
      continue;
    }
    longestLeft = Math.max(longestLeft, end - (Number(timing.localTime) || 0));
  }
  return longestLeft;
}
function whenFinished(el, done) {
  let finished = false;
  const animations = el.getAnimations({ subtree: true });
  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimeout(timer);
    done();
  };
  const timer = animations.length ? setTimeout(finish, Math.max(longest(el), remaining(animations)) + 50) : void 0;
  if (!animations.length) {
    measured(finish);
  } else {
    Promise.allSettled(animations.map((animation) => animation.finished)).then(
      finish
    );
  }
  return () => {
    finished = true;
    clearTimeout(timer);
  };
}
function writeOpen(el, open) {
  el.toggleAttribute("data-open", open);
  el.toggleAttribute("data-closed", !open);
}
function animateOut(el, done) {
  var _a3, _b3, _c;
  (_a3 = pendingResets.get(el)) == null ? void 0 : _a3();
  el.removeAttribute("data-starting-style");
  el.setAttribute("data-ending-style", "");
  const wasInert = el.hasAttribute("inert");
  el.setAttribute("inert", "");
  const Observer = (_c = (_b3 = el.ownerDocument) == null ? void 0 : _b3.defaultView) == null ? void 0 : _c.MutationObserver;
  let written = false;
  const owner3 = Observer && new Observer(() => written = true);
  owner3 == null ? void 0 : owner3.observe(el, { attributeFilter: ["inert"] });
  let frame = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    pendingResets.delete(el);
    el.removeAttribute("data-ending-style");
    written || (written = !!(owner3 == null ? void 0 : owner3.takeRecords().length));
    owner3 == null ? void 0 : owner3.disconnect();
    if (!written) {
      el.toggleAttribute("inert", wasInert);
    }
  };
  let isAnimating = false;
  const stop = whenFinished(el, () => {
    if (!isAnimating) {
      reset();
      return done();
    }
    pendingResets.set(el, reset);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(reset);
    });
    done();
  });
  isAnimating = true;
  return () => {
    stop();
    reset();
  };
}

// node_modules/@ui-sdk/core/dist/foundation/focus/collection.js
function moveIndex(index, step, count2, loop) {
  if (step === "first") {
    return 0;
  }
  if (step === "last") {
    return count2 - 1;
  }
  const next = index + step;
  if (loop) {
    return (next % count2 + count2) % count2;
  }
  return Math.max(0, Math.min(count2 - 1, next));
}
function scrollToShow(scroll, viewport, start, size, before = 0, after = 0) {
  if (start - before < scroll) {
    return Math.max(0, start - before);
  }
  if (start + size + after > scroll + viewport) {
    return Math.max(0, start + size + after - viewport);
  }
  return scroll;
}

// node_modules/@ui-sdk/core/dist/foundation/text/locale.js
function toLocale(tag) {
  try {
    return Intl.getCanonicalLocales(
      tag ? tag.split(/[.@]/)[0].replaceAll("_", "-") : []
    )[0];
  } catch {
  }
}
function userLocale() {
  var _a3, _b3;
  if (typeof navigator === "undefined") {
    return void 0;
  }
  return toLocale((_b3 = (_a3 = navigator.languages) == null ? void 0 : _a3[0]) != null ? _b3 : navigator.language);
}

// node_modules/@ui-sdk/core/dist/foundation/text/match.js
var latinLetters = "abcdefghijklmnopqrstuvwxyz";
var diacritics = /\p{Diacritic}/gu;
var latin = /\p{Script=Latin}/u;
var ascii = /^[\u0000-\u007f]*$/;
var specialCase = /^(tr|az|lt)\b/i;
function createFolder(locale) {
  const collator = new Intl.Collator(locale, {
    sensitivity: "base",
    usage: "search"
  });
  const lower = specialCase.test(locale != null ? locale : "") ? (text) => text.toLocaleLowerCase(locale) : (text) => text.toLowerCase();
  const chars = /* @__PURE__ */ new Map();
  const texts = /* @__PURE__ */ new Map();
  function foldChar(char) {
    let folded = chars.get(char);
    if (folded !== void 0) {
      return folded;
    }
    const lowered = lower(char);
    if (char < "\x80") {
      chars.set(char, lowered);
      return lowered;
    }
    const stripped = lower(char.normalize("NFD").replace(diacritics, ""));
    if (stripped.length === char.length && stripped !== lowered && collator.compare(char, stripped) === 0) {
      folded = stripped;
    } else if (latin.test(char)) {
      folded = [...latinLetters].find(
        (letter) => collator.compare(char, letter) === 0
      );
    }
    folded != null ? folded : folded = lowered.length === char.length ? lowered : char;
    chars.set(char, folded);
    return folded;
  }
  function fold(text) {
    let folded = texts.get(text);
    if (folded !== void 0) {
      return folded;
    }
    if (ascii.test(text)) {
      folded = lower(text);
    } else {
      folded = "";
      for (const char of text) {
        folded += foldChar(char);
      }
    }
    if (texts.size > 5e4) {
      texts.clear();
    }
    texts.set(text, folded);
    return folded;
  }
  return { locale, fold };
}
var folder;
var watching = false;
function userFolder() {
  if (folder) {
    return folder;
  }
  if (!watching && typeof window !== "undefined") {
    watching = true;
    window.addEventListener("languagechange", () => folder = void 0);
  }
  return folder = createFolder(userLocale());
}
var foldText = (text) => userFolder().fold(text);
function leadingSpaces(text) {
  let index = 0;
  while (index < text.length && text.charCodeAt(index) <= 32) {
    index++;
  }
  return index;
}

// node_modules/@ui-sdk/core/dist/foundation/text/typeahead.js
var normalize = (text) => foldText(text).trim();
function textOf(el) {
  var _a3;
  let text = "";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const hidden2 = (_a3 = node.parentElement) == null ? void 0 : _a3.closest('[aria-hidden="true"], [hidden]');
    if (hidden2 && el.contains(hidden2) && (hidden2 !== el || hidden2.getAttribute("aria-hidden") === "true")) {
      continue;
    }
    text += node.textContent;
  }
  return text;
}
function labelOf(el) {
  var _a3;
  const text = textOf(el).replace(/\s+/g, " ").trim();
  return text || ((_a3 = el.getAttribute("aria-label")) != null ? _a3 : "");
}
function searchStart(current, query) {
  return query.length === 1 ? current + 1 : Math.max(current, 0);
}
function createTypeahead(timeout = 500) {
  let query = "";
  let lastKey = "";
  let stepping = false;
  let timer;
  function reset() {
    query = "";
    lastKey = "";
    stepping = false;
    clearTimeout(timer);
  }
  function scan(labels, prefix, start) {
    const count2 = labels.length;
    for (let step = 0; step < count2; step++) {
      const index = ((start + step) % count2 + count2) % count2;
      if (normalize(labels[index]).startsWith(prefix)) {
        return index;
      }
    }
    return -1;
  }
  function search(key, labels, current) {
    if (key.length !== 1 || key === " " && !query) {
      return -1;
    }
    clearTimeout(timer);
    timer = setTimeout(reset, timeout);
    const char = normalize(key) || key;
    stepping = char === lastKey && (stepping || query.length === 1);
    lastKey = char;
    query += char;
    if (stepping) {
      const whole = scan(labels, query, Math.max(current, 0));
      return whole !== -1 ? whole : scan(labels, char, searchStart(current, char));
    }
    return scan(labels, query, searchStart(current, query));
  }
  return Object.assign(search, { reset, active: () => query.length > 0 });
}

// node_modules/@ui-sdk/core/dist/foundation/lists/listbox-engine.js
function itemKey(value, itemToValue) {
  var _a3;
  if (value === null || value === void 0) {
    return "";
  }
  if (itemToValue) {
    return itemToValue(value);
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    const own = (_a3 = value.value) != null ? _a3 : value.id;
    if (own !== void 0 && own !== null && typeof own !== "object") {
      return String(own);
    }
  }
  return String(value);
}
function toListItem(entry) {
  return typeof entry === "string" ? { value: entry, label: entry } : entry;
}
var isGroup = (entry) => typeof entry === "object" && "type" in entry && entry.type === "group";
var isSeparator = (entry) => typeof entry === "object" && "type" in entry && entry.type === "separator";
function flattenData(data, toKey) {
  const entries = [];
  data.forEach((entry, index) => {
    if (isSeparator(entry)) {
      return;
    }
    if (isGroup(entry)) {
      for (const child of entry.items) {
        entries.push(entryOf(toListItem(child), toKey, `group-${index}`));
      }
      return;
    }
    entries.push(entryOf(toListItem(entry), toKey));
  });
  return entries;
}
function entryOf(item, toKey, group) {
  return {
    key: toKey(item.value),
    value: item.value,
    label: item.label,
    keywords: item.keywords,
    disabled: !!item.disabled,
    group
  };
}
function revealInList(el, stop) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      const top = el.getBoundingClientRect().top - node.getBoundingClientRect().top - node.clientTop + node.scrollTop;
      const before = parseFloat(style.scrollPaddingTop) || 0;
      const after = parseFloat(style.scrollPaddingBottom) || 0;
      const shown = scrollToShow(
        node.scrollTop,
        node.clientHeight,
        top,
        el.offsetHeight,
        before,
        after
      );
      const scrollTop = Math.min(shown, node.scrollHeight - node.clientHeight);
      if (scrollTop !== node.scrollTop) {
        node.scrollTop = scrollTop;
      }
      return;
    }
    if (node === stop) {
      return;
    }
  }
}
function createListboxEngine(config, filtering2) {
  const { store } = config;
  const focusMode = typeof config.focus === "function" ? config.focus : () => config.focus;
  const registry2 = createOrder();
  const known = /* @__PURE__ */ new Map();
  const typeahead = createTypeahead();
  const pinned = /* @__PURE__ */ new Set();
  let dataMemo;
  let emptyMemo;
  let visibleMemo;
  let composedMemo;
  let labelsVersion = 0;
  let mountsVersion = 0;
  const memoOf = (items, memo) => {
    if ((memo == null ? void 0 : memo.data) === items) {
      return memo;
    }
    const flat = flattenData(items, config.toKey);
    return {
      data: items,
      flat,
      byKey: new Map(flat.map((entry) => [entry.key, entry]))
    };
  };
  function data() {
    const items = config.items();
    if (!items) {
      return void 0;
    }
    return dataMemo = memoOf(items, dataMemo);
  }
  function emptySource() {
    var _a3;
    const items = (_a3 = config.emptyItems) == null ? void 0 : _a3.call(config);
    return items && (emptyMemo = memoOf(items, emptyMemo));
  }
  function emptyData() {
    var _a3, _b3;
    if (!config.items() || !((_b3 = (_a3 = config.showEmpty) == null ? void 0 : _a3.call(config)) != null ? _b3 : !config.query().trim())) {
      return void 0;
    }
    return emptySource();
  }
  function dataEntry(key) {
    var _a3, _b3, _c;
    return (_c = (_a3 = data()) == null ? void 0 : _a3.byKey.get(key)) != null ? _c : (_b3 = emptySource()) == null ? void 0 : _b3.byKey.get(key);
  }
  function visibleData() {
    var _a3, _b3, _c;
    const source = (_a3 = emptyData()) != null ? _a3 : data();
    if (!source) {
      return void 0;
    }
    const query = config.query();
    const filter = config.filter();
    const rank = (_c = (_b3 = config.rank) == null ? void 0 : _b3.call(config)) != null ? _c : false;
    if ((visibleMemo == null ? void 0 : visibleMemo.data) !== source.data || visibleMemo.query !== query || visibleMemo.filter !== filter || visibleMemo.rank !== rank) {
      const list = filtering2.data(source.data, query, filter, { rank });
      visibleMemo = {
        data: source.data,
        query,
        filter,
        rank,
        list,
        flat: flattenData(list, config.toKey)
      };
    }
    return visibleMemo;
  }
  function warnIfShared(key, el) {
    var _a3, _b3;
    const other = (_a3 = registry2.get(key)) == null ? void 0 : _a3.el;
    if (!other || other === el || !other.isConnected) {
      return;
    }
    const slot = (_b3 = el.getAttribute("data-slot")) != null ? _b3 : "";
    warn(
      `Two items have the value "${key}". Give each item its own value, or arrow keys skip one and choosing it picks the other.`,
      { component: slot.replace(/-item$/, "") || "listbox" }
    );
  }
  function liveLabel(key, registered3) {
    var _a3;
    const meta = registered3.meta();
    const label = (_a3 = meta.label) != null ? _a3 : labelOf(registered3.el);
    if (meta.pinned) {
      return label;
    }
    const previous = known.get(key);
    if ((previous == null ? void 0 : previous.label) !== label) {
      known.set(key, { ...previous, label, value: meta.value });
      labelsVersion++;
    }
    return label;
  }
  function registeredEntry(key, registered3) {
    const meta = registered3.meta();
    return {
      key,
      value: meta.value,
      label: liveLabel(key, registered3),
      keywords: meta.keywords,
      // Read live, since the list is cached while an item's props change.
      get disabled() {
        return !!registered3.meta().disabled;
      },
      group: meta.group,
      pinned: meta.pinned
    };
  }
  const asked = /* @__PURE__ */ new Map();
  const shows = (key, meta) => !!data() || composedMatches(key, meta);
  function matches(key, meta) {
    asked.set(key, meta);
    return shows(key, meta);
  }
  function composedMatches(key, meta) {
    var _a3, _b3, _c;
    const registered3 = registry2.get(key);
    const label = (_c = (_b3 = meta.label) != null ? _b3 : registered3 ? liveLabel(key, registered3) : (_a3 = known.get(key)) == null ? void 0 : _a3.label) != null ? _c : typeof meta.value === "string" ? meta.value : "";
    return filtering2.matches(
      { value: meta.value, label, keywords: meta.keywords },
      config.query(),
      config.filter()
    );
  }
  function dataEntries(flat) {
    var _a3;
    if (!pinned.size) {
      return flat;
    }
    const first = flat.length ? (_a3 = registry2.get(flat[0].key)) == null ? void 0 : _a3.el : void 0;
    const before = [];
    const after = [];
    for (const key of pinned) {
      const registered3 = registry2.get(key);
      if (!(registered3 == null ? void 0 : registered3.el.isConnected)) {
        continue;
      }
      const precedes = !!(first == null ? void 0 : first.isConnected) && isAfter(registered3.el, first);
      (precedes ? before : after).push(registeredEntry(key, registered3));
    }
    return before.length || after.length ? [...before, ...flat, ...after] : flat;
  }
  function composedEntries() {
    const list = registry2.list();
    const query = config.query();
    const filter = config.filter();
    if ((composedMemo == null ? void 0 : composedMemo.order) === list && composedMemo.query === query && composedMemo.filter === filter && composedMemo.version === labelsVersion) {
      return composedMemo.list;
    }
    const result = list.map((registered3) => registeredEntry(registered3.key, registered3)).filter(
      (entry, index) => list[index].meta().pinned || composedMatches(entry.key, entry)
    );
    composedMemo = {
      order: list,
      query,
      filter,
      version: labelsVersion,
      list: result
    };
    return result;
  }
  function entries() {
    const visible = visibleData();
    if (visible) {
      return dataEntries(visible.flat);
    }
    return composedEntries();
  }
  const disabled = (entry) => {
    var _a3;
    return entry.disabled || !!((_a3 = config.blocked) == null ? void 0 : _a3.call(config, entry));
  };
  function find(key) {
    if (key === null) {
      return void 0;
    }
    const fromData = dataEntry(key);
    if (fromData) {
      return fromData;
    }
    const registered3 = registry2.get(key);
    if (registered3) {
      return registeredEntry(key, registered3);
    }
    const remembered = known.get(key);
    if (remembered) {
      return {
        key,
        value: remembered.value,
        label: remembered.label,
        disabled: false
      };
    }
  }
  function reveal(el, focus) {
    var _a3, _b3, _c;
    if (focusMode() === "real" && focus && config.active()) {
      el.focus({ preventScroll: true });
    }
    if (((_a3 = config.keepInView) == null ? void 0 : _a3.call(config)) !== false) {
      revealInList(el, (_c = (_b3 = config.scrollRoot) != null ? _b3 : config.container) == null ? void 0 : _c());
    }
  }
  function highlight(key, { focus = true, event } = {}) {
    var _a3, _b3, _c;
    store.set({ highlighted: key });
    const list = entries();
    const index = key === null ? -1 : list.findIndex((entry) => entry.key === key);
    (_a3 = config.onHighlight) == null ? void 0 : _a3.call(config, key, index, event);
    let last = list.length - 1;
    if (config.skipDisabled) {
      while (last > 0 && list[last].disabled) {
        last--;
      }
    }
    if (index !== -1 && index === last) {
      (_b3 = config.onLastReached) == null ? void 0 : _b3.call(config);
    }
    if (key === null) {
      return;
    }
    const el = (_c = registry2.get(key)) == null ? void 0 : _c.el;
    if (el == null ? void 0 : el.isConnected) {
      reveal(el, focus);
    }
  }
  function stepKey(step, { loop = config.loop() && Math.abs(Number(step)) === 1 } = {}) {
    const all = entries();
    const list = config.skipDisabled ? all.filter((entry) => !entry.disabled) : all;
    if (!list.length) {
      return void 0;
    }
    const current = store.get().highlighted;
    const index = list.findIndex((entry) => entry.key === current);
    if (index !== -1 || typeof step !== "number") {
      return list[moveIndex(index, step, list.length, loop)].key;
    }
    const skipped = all.findIndex((entry) => entry.key === current);
    if (skipped !== -1) {
      const before = all.slice(0, skipped).filter((entry) => !entry.disabled).length;
      return list[moveIndex(step > 0 ? before - 1 : before, step, list.length, loop)].key;
    }
    return list[step > 0 ? 0 : list.length - 1].key;
  }
  function move(step, event) {
    const key = stepKey(step);
    if (key !== void 0) {
      highlight(key, { event });
    }
  }
  function search(char, from) {
    const list = entries().filter((entry) => !entry.pinned);
    const found2 = typeahead(
      char,
      list.map((entry) => disabled(entry) ? "" : entry.label),
      list.findIndex((entry) => entry.key === from)
    );
    return found2 === -1 ? void 0 : list[found2];
  }
  function focusLost(el) {
    const doc = el.ownerDocument;
    return !doc.activeElement || doc.activeElement === doc.body;
  }
  const moves2 = typeof MutationObserver === "undefined" ? void 0 : new MutationObserver(moved);
  function moved() {
    var _a3;
    const key = store.get().highlighted;
    const el = key === null ? void 0 : (_a3 = registry2.get(key)) == null ? void 0 : _a3.el;
    if ((el == null ? void 0 : el.isConnected) && focusLost(el)) {
      reveal(el, true);
    }
  }
  function focusWhenMounted(key, el) {
    const shouldFocus = () => store.get().highlighted === key && config.active();
    if (focusMode() !== "real" || !shouldFocus() || el.ownerDocument.activeElement === el) {
      return;
    }
    queueMicrotask(() => {
      if (shouldFocus() && el.isConnected) {
        reveal(el, true);
      }
    });
  }
  function register2(key, el, meta) {
    var _a3, _b3, _c;
    mountsVersion++;
    if (dev) {
      warnIfShared(key, el);
    }
    const entry = { key, el, meta };
    const remove = registry2.add(entry);
    const current = meta();
    if (current.pinned) {
      pinned.add(key);
    } else {
      const previous = known.get(key);
      if (current.label !== void 0 && (previous == null ? void 0 : previous.label) !== current.label) {
        labelsVersion++;
      }
      known.set(key, {
        ...previous,
        label: (_b3 = (_a3 = current.label) != null ? _a3 : previous == null ? void 0 : previous.label) != null ? _b3 : "",
        value: current.value,
        keywords: current.keywords,
        group: current.group
      });
    }
    queueMicrotask(() => {
      if (registry2.get(key) !== entry || !entry.el.isConnected) {
        return;
      }
      liveLabel(key, entry);
      if (entry.el.parentNode) {
        moves2 == null ? void 0 : moves2.observe(entry.el.parentNode, { childList: true });
      }
    });
    (_c = config.onRegister) == null ? void 0 : _c.call(config, key);
    focusWhenMounted(key, el);
    return () => {
      var _a4;
      if (registry2.get(key) !== entry) {
        return;
      }
      remove();
      mountsVersion++;
      pinned.delete(key);
      if (!registry2.size()) {
        moves2 == null ? void 0 : moves2.disconnect();
      }
      (_a4 = config.onRegister) == null ? void 0 : _a4.call(config, key);
      queueMicrotask(() => left(key, el));
    };
  }
  function left(key, el) {
    var _a3, _b3, _c;
    if (registry2.get(key) || dataEntry(key) || store.get().highlighted !== key) {
      return;
    }
    store.set({ highlighted: null });
    (_a3 = config.onHighlight) == null ? void 0 : _a3.call(config, null, -1);
    if (focusMode() === "real" && config.active() && focusLost(el)) {
      (_c = (_b3 = config.container) == null ? void 0 : _b3.call(config)) == null ? void 0 : _c.focus({ preventScroll: true });
    }
  }
  return {
    entries,
    visibleData,
    // Every data item, whatever the query. Undefined for composed items.
    dataItems: () => {
      var _a3;
      return (_a3 = data()) == null ? void 0 : _a3.flat;
    },
    find,
    disabled,
    // Whether an item is disabled by itself, which keys and the pointer pass
    // over. A `blocked` item can't be chosen but stays reachable.
    isItemDisabled: (key) => {
      var _a3;
      return !!((_a3 = find(key)) == null ? void 0 : _a3.disabled);
    },
    highlight,
    move,
    stepKey,
    // The first item that can be chosen, for highlighting the best match.
    firstEnabled: () => {
      var _a3;
      return (_a3 = entries().find((entry) => !entry.pinned && !disabled(entry))) == null ? void 0 : _a3.key;
    },
    search,
    register: register2,
    typing: () => typeahead.active(),
    resetTyping: () => typeahead.reset(),
    // The label of an item, from data, a mounted item, or one that was mounted before.
    labelOf(key) {
      var _a3;
      const fromData = dataEntry(key);
      if (fromData) {
        return fromData.label;
      }
      const registered3 = registry2.get(key);
      if (registered3) {
        return liveLabel(key, registered3);
      }
      return (_a3 = known.get(key)) == null ? void 0 : _a3.label;
    },
    valueOf(key) {
      var _a3, _b3, _c;
      const fromData = dataEntry(key);
      if (fromData) {
        return fromData.value;
      }
      return (_c = (_a3 = registry2.get(key)) == null ? void 0 : _a3.meta().value) != null ? _c : (_b3 = known.get(key)) == null ? void 0 : _b3.value;
    },
    matches,
    // What each item shows from the list as a whole, by key, as a short
    // string: "-" while the query hides it, then the list's size for an item
    // placed by `index`, then what `more` adds, like "s" while it's selected.
    // Every item that rendered, mounted or was remembered, and every data
    // item, has an entry. See listbox-listing.ts.
    listing(more) {
      var _a3, _b3, _c, _d;
      const listing = {};
      let size;
      const filtering22 = !data() && !!config.query().trim();
      const shown = filtering22 ? new Set(composedEntries().map((entry) => entry.key)) : void 0;
      const add = (key, item, latest) => {
        var _a4;
        if (typeof listing[key] === "string") {
          return;
        }
        const registered3 = registry2.get(key);
        const meta = latest ? item : (_a4 = registered3 == null ? void 0 : registered3.meta()) != null ? _a4 : item;
        const matched = !shown || shown.has(key) || !(registered3 == null ? void 0 : registered3.el.isConnected) && composedMatches(key, meta);
        let entry = matched ? "" : "-";
        if (meta.index !== void 0) {
          entry += size != null ? size : size = entries().length;
        }
        if (more) {
          entry += more(key, meta.value);
        }
        listing[key] = entry;
      };
      for (const [key, item] of asked) {
        add(key, item, true);
      }
      for (const [key, item] of known) {
        add(key, item, false);
      }
      for (const entry of (_b3 = (_a3 = data()) == null ? void 0 : _a3.flat) != null ? _b3 : []) {
        add(entry.key, entry, false);
      }
      for (const entry of (_d = (_c = emptySource()) == null ? void 0 : _c.flat) != null ? _d : []) {
        add(entry.key, entry, false);
      }
      return listing;
    },
    // Everything the listing depends on besides a component's own state, like
    // the selected value. The listing changes only when one of these does. A
    // data list's entries don't depend on which items are mounted or on their
    // labels, only on its pinned items, which count toward its size. So rows
    // scrolling into a virtualized list don't make it list every item again.
    listingInputs: () => {
      var _a3, _b3, _c;
      return [
        config.items() ? pinned.size : mountsVersion,
        config.items() ? 0 : labelsVersion,
        config.query(),
        config.filter(),
        config.items(),
        (_a3 = config.emptyItems) == null ? void 0 : _a3.call(config),
        (_b3 = config.showEmpty) == null ? void 0 : _b3.call(config),
        (_c = config.rank) == null ? void 0 : _c.call(config)
      ];
    },
    // The keys of the items that match and can be chosen, in one group or in
    // all, leaving out pinned entries. For selecting all of them at once.
    selectable(group) {
      var _a3, _b3;
      const keys = [];
      for (const entry of entries()) {
        if (entry.pinned || entry.disabled) {
          continue;
        }
        if (group !== void 0 && ((_b3 = (_a3 = registry2.get(entry.key)) == null ? void 0 : _a3.meta().group) != null ? _b3 : entry.group) !== group) {
          continue;
        }
        keys.push(entry.key);
      }
      return keys;
    },
    // How many items match, leaving out pinned entries like a create option.
    count() {
      let count2 = 0;
      for (const entry of entries()) {
        if (!entry.pinned) {
          count2++;
        }
      }
      return count2;
    },
    // Whether any item of a composed group matches.
    groupMatches(group) {
      if (data()) {
        return true;
      }
      return registry2.list().some(
        (registered3) => registered3.meta().group === group && composedMatches(registered3.key, registered3.meta())
      );
    },
    element: (key) => {
      var _a3;
      return (_a3 = registry2.get(key)) == null ? void 0 : _a3.el;
    },
    // Counts every label change, so a part showing a label can re-render.
    labelsVersion: () => labelsVersion,
    // Remembers a label, like the one an item had when it was chosen.
    remember(key, label, value, keywords) {
      const current = known.get(key);
      const words = current == null ? void 0 : current.keywords;
      const sameText = (current == null ? void 0 : current.label) === label && (!keywords || (words == null ? void 0 : words.length) === keywords.length && keywords.every((word, index) => word === words[index]));
      if (current && sameText) {
        if (current.value !== value) {
          known.set(key, { ...current, value });
        }
        return;
      }
      known.set(key, {
        ...current,
        label,
        value,
        ...keywords && { keywords }
      });
      labelsVersion++;
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/lists/listbox.js
function textMatches(text, query, mode) {
  const needle = foldText(query.trim());
  if (!needle) {
    return true;
  }
  const haystack = foldText(text);
  return mode === "startsWith" ? haystack.startsWith(needle, leadingSpaces(haystack)) : haystack.includes(needle);
}
function itemScore(item, query, filter) {
  var _a3;
  if (filter === false || filter === void 0 || !query.trim()) {
    return 1;
  }
  if (typeof filter === "function") {
    const result = filter(item, query);
    return typeof result === "number" ? Math.max(0, result) : result ? 1 : 0;
  }
  return [item.label, ...(_a3 = item.keywords) != null ? _a3 : []].some(
    (text) => textMatches(text, query, filter)
  ) ? 1 : 0;
}
function itemMatches(item, query, filter) {
  return itemScore(item, query, filter) > 0;
}
function filterData(data, query, filter, { rank = false } = {}) {
  if (filter === false || filter === void 0 || !query.trim()) {
    return data;
  }
  if (rank) {
    return rankData(data, query, filter);
  }
  const result = [];
  let separator;
  const keep2 = (entry) => {
    if (separator && result.length) {
      result.push(separator);
    }
    separator = void 0;
    result.push(entry);
  };
  for (const entry of data) {
    if (isSeparator(entry)) {
      separator = entry;
      continue;
    }
    if (isGroup(entry)) {
      const items = entry.items.filter(
        (child) => itemMatches(toListItem(child), query, filter)
      );
      if (items.length) {
        keep2({ ...entry, items });
      }
      continue;
    }
    if (itemMatches(toListItem(entry), query, filter)) {
      keep2(entry);
    }
  }
  return result;
}
var byScore = (a, b) => b.score - a.score;
function rankData(data, query, filter) {
  const ranked = [];
  let separator;
  const keep2 = (entry, score) => {
    ranked.push({
      entry,
      score,
      separator: ranked.length ? separator : void 0
    });
    separator = void 0;
  };
  for (const entry of data) {
    if (isSeparator(entry)) {
      separator = entry;
      continue;
    }
    if (isGroup(entry)) {
      const items = [];
      for (const child of entry.items) {
        const score2 = itemScore(toListItem(child), query, filter);
        if (score2 > 0) {
          items.push({ entry: child, score: score2 });
        }
      }
      if (!items.length) {
        continue;
      }
      items.sort(byScore);
      keep2(
        {
          ...entry,
          items: items.map((item) => item.entry)
        },
        items[0].score
      );
      continue;
    }
    const score = itemScore(toListItem(entry), query, filter);
    if (score > 0) {
      keep2(entry, score);
    }
  }
  const sorted = [...ranked].sort(byScore);
  if (sorted.some((item, index) => item !== ranked[index])) {
    return sorted.map((item) => item.entry);
  }
  return ranked.flatMap(
    (item) => item.separator ? [item.separator, item.entry] : [item.entry]
  );
}
var filtering = { data: filterData, matches: itemMatches };
function createFilteredListbox(config) {
  return createListboxEngine(config, filtering);
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/attrs.js
function openAttrs(open) {
  return {
    "data-open": open ? "" : void 0,
    "data-closed": open ? void 0 : ""
  };
}
function idPart(value) {
  return value.replace(/[\s%]/g, encodeURIComponent);
}

// node_modules/@ui-sdk/core/dist/foundation/lists/listbox-parts.js
function stashContent(el, shown, subscribe2) {
  const stash = el.ownerDocument.createDocumentFragment();
  const write = () => {
    if (shown() && stash.childNodes.length) {
      el.append(stash);
    } else if (!shown() && el.childNodes.length) {
      stash.append(...Array.from(el.childNodes));
    }
  };
  write();
  const unsubscribe = subscribe2(write);
  return () => {
    unsubscribe();
    if (stash.childNodes.length) {
      el.append(stash);
    }
  };
}
var groupLabelledBy = (state, id, group) => state.groupLabels.includes(group) ? `${id}-group-${idPart(group)}` : void 0;
function groupLabelPart() {
  return {
    // Its group is the one it's inside, which every renderer fills in. The
    // group's id keys it too, so labels of two groups are two parts.
    props: {
      id: { kind: "string", from: "group.id", required: true },
      group: { kind: "string", from: "group.id", required: true }
    },
    attrs: (state, { id, props }) => ({
      id: `${id}-group-${idPart(props.group)}`
    }),
    bind: (el, { store, props }) => keyWhileBound(store, "groupLabels", props.group)
  };
}

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-editing.js
init_events();
init_env();

// node_modules/@ui-sdk/core/dist/foundation/platform/platform.js
init_env();
function supportsTopLayer() {
  return isBrowser && typeof HTMLElement.prototype.showPopover === "function";
}
function portalTarget(container) {
  if (container) {
    return container;
  }
  if (isBrowser && !supportsTopLayer()) {
    return document.body;
  }
  return null;
}
function activeElement(doc = document) {
  var _a3;
  let active2 = doc.activeElement;
  while ((_a3 = active2 == null ? void 0 : active2.shadowRoot) == null ? void 0 : _a3.activeElement) {
    active2 = active2.shadowRoot.activeElement;
  }
  return active2;
}
function composedHops(node) {
  var _a3, _b3;
  const hops = [node];
  let at = node;
  while (at) {
    const next = (_b3 = (_a3 = at.assignedSlot) != null ? _a3 : at.parentNode) != null ? _b3 : at.host;
    if (next && next !== at.parentNode) {
      hops.push(next);
    }
    at = next;
  }
  return hops;
}
function composedContains(container, node) {
  return composedHops(node).some((hop) => container.contains(hop));
}
var platformOverride;
var apple;
function isApple() {
  if (platformOverride) {
    return platformOverride === "apple";
  }
  return apple != null ? apple : apple = isBrowser && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}
var keyNames = {
  alt: "Alt",
  option: "Alt",
  opt: "Alt",
  shift: "Shift",
  ctrl: "Control",
  control: "Control",
  cmd: "Meta",
  command: "Meta",
  meta: "Meta",
  backspace: "Backspace",
  delete: "Delete",
  del: "Delete",
  enter: "Enter",
  return: "Enter",
  escape: "Escape",
  esc: "Escape",
  tab: "Tab",
  space: "Space",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  home: "Home",
  end: "End",
  pageup: "PageUp",
  pagedown: "PageDown"
};
function ariaKeyshortcuts(shortcut, apple2 = isApple()) {
  return shortcut.split("+").map((key) => {
    const lower = key.toLowerCase();
    if (lower === "mod") {
      return apple2 ? "Meta" : "Control";
    }
    if (keyNames[lower]) {
      return keyNames[lower];
    }
    return key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1);
  }).join("+");
}
function matchesKey(event, key) {
  const typed = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === "Space") {
    return typed === " ";
  }
  if (!/^[A-Z0-9]$/.test(key)) {
    return typed.toLowerCase() === key.toLowerCase();
  }
  if (typed === key.toLowerCase()) {
    return true;
  }
  if (/^[a-z0-9]$/.test(typed)) {
    return false;
  }
  return event.code === (/\d/.test(key) ? `Digit${key}` : `Key${key}`);
}
var parsed = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
function matchesShortcut(event, shortcut, apple2 = isApple()) {
  const cache = parsed[+apple2];
  let keys = cache.get(shortcut);
  if (!keys) {
    cache.set(shortcut, keys = ariaKeyshortcuts(shortcut, apple2).split("+"));
  }
  return matchesKey(event, keys.at(-1)) && event.metaKey === keys.includes("Meta") && event.ctrlKey === keys.includes("Control") && event.altKey === keys.includes("Alt") && event.shiftKey === keys.includes("Shift");
}

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-editing.js
var escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
var unescapeHtml = (text) => text.replace(
  /&(#\d+|quot|amp|lt|gt);/g,
  (_, code) => code[0] === "#" ? String.fromCharCode(Number(code.slice(1))) : { quot: '"', amp: "&", lt: "<", gt: ">" }[code]
);
function charLength(text, offset, direction) {
  const code = text.charCodeAt(direction < 0 ? offset - 1 : offset);
  const surrogate = direction < 0 ? code >= 56320 && code <= 57343 : code >= 55296 && code <= 56319;
  return surrogate ? 2 : 1;
}
function deletionTarget(type, value, at, direction) {
  if (type.includes("Word")) {
    return wordBoundary(value, at, direction);
  }
  if (type.includes("Line")) {
    return lineBoundary(value, at, direction);
  }
  return at + direction * charLength(offsetText(value), at, direction);
}
function bindTokenEditing(el, view2, api) {
  const { internal } = api;
  const doc = el.ownerDocument;
  let lastEnd = -1;
  let afterSpace = false;
  let dragged = null;
  let armed = null;
  const value = () => internal.latest();
  function edit(next, selection, details) {
    if (details.group && details.at !== void 0 && details.at !== lastEnd) {
      internal.seal();
    }
    internal.commit(next, { ...details, selection });
    lastEnd = details.group ? selection.end : -1;
  }
  function remove(type, range, event) {
    const current = value();
    if (range.start !== range.end) {
      armed = null;
      return edit(
        replaceRange(current, range, []),
        internal.caretAt(range.start),
        {
          reason: type === "deleteByCut" ? "cut" : "input-change",
          event,
          inputType: type
        }
      );
    }
    const direction = type.includes("Backward") ? -1 : 1;
    const at = range.start;
    const neighbour = direction < 0 ? at - 1 : at;
    const token = tokenAt(current, neighbour);
    if (token && /^delete(Content|Word)/.test(type)) {
      return removeToken(token, neighbour, event, type);
    }
    armed = null;
    const target = Math.max(
      0,
      Math.min(
        deletionTarget(type, current, at, direction),
        valueLength(current)
      )
    );
    if (target === at) {
      return;
    }
    const start = Math.min(at, target);
    edit(
      replaceRange(current, { start, end: Math.max(at, target) }, []),
      internal.caretAt(start),
      {
        reason: "input-change",
        event,
        inputType: type,
        group: "delete",
        at
      }
    );
  }
  function removeToken(token, offset, event, inputType) {
    var _a3, _b3, _c;
    const current = value();
    const tokenId = token.id;
    const policy = (_a3 = internal.options().tokenDeletion) != null ? _a3 : "whole";
    const range = { start: offset, end: offset + 1 };
    if (policy === "select" && armed !== tokenId) {
      armed = tokenId;
      view2.select(range);
      internal.say(
        `${token.label}, ${internal.describe(token)}, selected. Press Backspace again to remove it`
      );
      return;
    }
    armed = null;
    const text = policy === "revert" ? `${(_c = (_b3 = token.data) == null ? void 0 : _b3.trigger) != null ? _c : ""}${token.label}` : "";
    const replacement = text ? [text] : [];
    const end = offset + text.length;
    edit(replaceRange(current, range, replacement), internal.caretAt(end), {
      reason: "input-change",
      event,
      inputType
    });
  }
  function onBeforeInput(event) {
    var _a3, _b3, _c, _d, _e, _f, _g;
    const type = event.inputType;
    if (!internal.editable()) {
      return event.preventDefault();
    }
    if (type === "historyUndo" || type === "historyRedo") {
      event.preventDefault();
      return type === "historyUndo" ? internal.undo(event) : internal.redo(event);
    }
    if (type === "insertCompositionText" || internal.composing()) {
      return;
    }
    const range = view2.selection();
    if (!range) {
      return;
    }
    const anchor = (_b3 = (_a3 = doc.getSelection()) == null ? void 0 : _a3.anchorNode) != null ? _b3 : null;
    if (type === "insertText" || type === "insertReplacementText") {
      const text = (_e = (_d = event.data) != null ? _d : (_c = event.dataTransfer) == null ? void 0 : _c.getData("text/plain")) != null ? _e : "";
      const target = (_f = targetRange(event)) != null ? _f : range;
      if (type === "insertText" && target.start === target.end && !view2.inHost(anchor)) {
        return;
      }
      event.preventDefault();
      return insertText2(text, target, event);
    }
    event.preventDefault();
    if (type === "insertParagraph" || type === "insertLineBreak") {
      return insertText2("\n", range, event);
    }
    if (type.startsWith("delete")) {
      return remove(type, range, event);
    }
    if (type === "insertFromYank") {
      insertText2((_g = event.data) != null ? _g : "", range, event);
    }
  }
  function targetRange(event) {
    var _a3, _b3;
    const [target] = (_b3 = (_a3 = event.getTargetRanges) == null ? void 0 : _a3.call(event)) != null ? _b3 : [];
    if (!target) {
      return null;
    }
    return {
      start: view2.offsetAt(target.startContainer, target.startOffset),
      end: view2.offsetAt(target.endContainer, target.endOffset)
    };
  }
  function insertText2(text, range, event) {
    if (afterSpace && /\S/.test(text)) {
      internal.seal();
    }
    afterSpace = /\s$/.test(text);
    edit(
      replaceRange(value(), range, [text]),
      internal.caretAt(range.start + text.length),
      {
        reason: "input-change",
        event,
        inputType: event.inputType,
        group: "insert",
        at: range.start
      }
    );
  }
  function onInput(event) {
    if (internal.composing() || event.isComposing) {
      return;
    }
    reconcile(event);
  }
  function reconcile(event) {
    var _a3, _b3;
    if (!internal.editable()) {
      return view2.render(value());
    }
    const next = view2.read();
    const selection = (_a3 = view2.selection()) != null ? _a3 : internal.caretAt(valueLength(next));
    const text = (_b3 = event == null ? void 0 : event.data) != null ? _b3 : "";
    if (afterSpace && /\S/.test(text)) {
      internal.seal();
    }
    if (text) {
      afterSpace = /\s$/.test(text);
    }
    edit(next, selection, {
      reason: "input-change",
      event,
      inputType: event == null ? void 0 : event.inputType,
      group: event ? "insert" : void 0,
      at: selection.end - text.length
    });
  }
  function onKeyDown(event) {
    var _a3;
    if (event.defaultPrevented || isComposing(event)) {
      return;
    }
    const mod = isApple() ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();
    if (mod && !event.altKey && key === "z") {
      event.preventDefault();
      if (!internal.editable()) {
        return;
      }
      return event.shiftKey ? internal.redo(event) : internal.undo(event);
    }
    if (!isApple() && event.ctrlKey && key === "y") {
      event.preventDefault();
      if (internal.editable()) {
        internal.redo(event);
      }
      return;
    }
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !event.shiftKey && !mod && !event.altKey) {
      return crossToken(event);
    }
    if (mod && (key === "b" || key === "i" || key === "u")) {
      return event.preventDefault();
    }
    if (event.key === "Enter") {
      const shortcut = (_a3 = internal.options().submitShortcut) != null ? _a3 : "enter";
      const submits = shortcut === "enter" ? !event.shiftKey && !mod && !event.altKey : mod && !event.shiftKey;
      if (!submits || !internal.canSubmit()) {
        return;
      }
      event.preventDefault();
      internal.submit(event);
    }
  }
  function crossToken(event) {
    const range = view2.selection();
    if (!range || range.start !== range.end) {
      return;
    }
    const forward = event.key === "ArrowRight" !== isRTL(el);
    const target = forward ? range.end : range.start - 1;
    if (!tokenAt(value(), target)) {
      return;
    }
    event.preventDefault();
    view2.select(internal.caretAt(forward ? target + 1 : target));
  }
  function writeClipboard(data, range) {
    if (!data) {
      return;
    }
    const part = sliceValue(value(), range.start, range.end);
    const text = toText(part, internal.codec());
    data.setData(
      "text/plain",
      internal.options().copy === "label" ? toLabel(part) : text
    );
    data.setData(
      "text/html",
      `<span data-ui-tokens="${escapeHtml(text)}">${escapeHtml(toLabel(part))}</span>`
    );
  }
  function readClipboard(data) {
    if (!data) {
      return [];
    }
    const tokens = /data-ui-tokens="([^"]*)"/.exec(data.getData("text/html"));
    return fromText(
      tokens ? unescapeHtml(tokens[1]) : data.getData("text/plain"),
      internal.codec()
    );
  }
  function onCopy(event) {
    const range = view2.selection();
    if (!range || range.start === range.end) {
      return;
    }
    event.preventDefault();
    writeClipboard(event.clipboardData, range);
  }
  function onCut(event) {
    const range = view2.selection();
    if (!range || range.start === range.end) {
      return;
    }
    event.preventDefault();
    if (!internal.editable()) {
      return;
    }
    writeClipboard(event.clipboardData, range);
    edit(replaceRange(value(), range, []), internal.caretAt(range.start), {
      reason: "cut",
      event
    });
  }
  function onPaste(event) {
    event.preventDefault();
    const range = view2.selection();
    if (!range || !internal.editable()) {
      return;
    }
    const content = readClipboard(event.clipboardData);
    if (!content.length) {
      return;
    }
    edit(
      replaceRange(value(), range, content),
      internal.caretAt(range.start + valueLength(content)),
      {
        reason: "paste",
        event
      }
    );
  }
  function onDragStart(event) {
    const range = view2.selection();
    if (!range || range.start === range.end) {
      return;
    }
    dragged = range;
    writeClipboard(event.dataTransfer, range);
  }
  function onDragEnd() {
    dragged = null;
  }
  function onDrop(event) {
    event.preventDefault();
    const source = dragged;
    dragged = null;
    if (!internal.editable()) {
      return;
    }
    const point = pointFrom(event);
    let at = point ? view2.offsetAt(point[0], point[1]) : valueLength(value());
    const content = readClipboard(event.dataTransfer);
    let current = value();
    if (source && !(event.ctrlKey || event.altKey)) {
      if (at > source.start && at < source.end) {
        return;
      }
      current = replaceRange(current, source, []);
      if (at >= source.end) {
        at -= source.end - source.start;
      }
    }
    edit(
      replaceRange(current, internal.caretAt(at), content),
      internal.caretAt(at + valueLength(content)),
      {
        reason: "drop",
        event
      }
    );
  }
  function pointFrom(event) {
    var _a3, _b3;
    const position2 = (_a3 = doc.caretPositionFromPoint) == null ? void 0 : _a3.call(doc, event.clientX, event.clientY);
    if (position2) {
      return [position2.offsetNode, position2.offset];
    }
    const range = (_b3 = doc.caretRangeFromPoint) == null ? void 0 : _b3.call(doc, event.clientX, event.clientY);
    return range ? [range.startContainer, range.startOffset] : null;
  }
  function onCompositionStart() {
    internal.setComposing(true);
  }
  function onCompositionEnd() {
    internal.setComposing(false);
    internal.seal();
    reconcile();
    internal.seal();
  }
  function onSelectionChange() {
    var _a3;
    const selected = doc.getSelection();
    if (!(selected == null ? void 0 : selected.rangeCount) || !el.contains(selected.anchorNode)) {
      return;
    }
    const range = view2.selection();
    if (!range) {
      return;
    }
    if (view2.inHost(selected.anchorNode) || view2.inHost(selected.focusNode)) {
      view2.select(range);
    }
    if (armed && !(range.end - range.start === 1 && ((_a3 = tokenAt(value(), range.start)) == null ? void 0 : _a3.id) === armed)) {
      armed = null;
    }
    internal.setSelection(range);
  }
  function onFocus() {
    internal.setFocused(true);
    internal.setSelection(view2.selection());
  }
  function onBlur() {
    if (internal.composing()) {
      internal.setComposing(false);
    }
    internal.setFocused(false);
  }
  const listeners = [
    [el, "beforeinput", onBeforeInput],
    [el, "input", onInput],
    [el, "keydown", onKeyDown],
    [el, "copy", onCopy],
    [el, "cut", onCut],
    [el, "paste", onPaste],
    [el, "dragstart", onDragStart],
    [el, "dragend", onDragEnd],
    [el, "drop", onDrop],
    [el, "compositionstart", onCompositionStart],
    [el, "compositionend", onCompositionEnd],
    [el, "focus", onFocus],
    [el, "blur", onBlur],
    [doc, "selectionchange", onSelectionChange]
  ];
  for (const [target, type, listener] of listeners) {
    target.addEventListener(type, listener);
  }
  if (doc.activeElement === el) {
    onFocus();
  }
  return () => {
    for (const [target, type, listener] of listeners) {
      target.removeEventListener(type, listener);
    }
  };
}

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-view.js
var ANCHOR = "\u200B";
var visuallyHidden = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
var HOST = "data-token-id";
var SERVER_INDEX = "data-token-index";
var SENTINEL_ATTRIBUTE = "data-ui-sentinel";
var SENTINEL = /* @__PURE__ */ Symbol("sentinel");
function layout(value) {
  const nodes = [];
  value.forEach((segment, index) => {
    if (isToken(segment)) {
      const last3 = nodes.length - 1;
      if (typeof nodes[last3] === "string") {
        nodes[last3] += ANCHOR;
      } else {
        nodes.push(ANCHOR);
      }
      nodes.push(segment, ANCHOR);
      return;
    }
    const last2 = nodes.length - 1;
    if (index > 0 && typeof nodes[last2] === "string") {
      nodes[last2] += segment;
    } else {
      nodes.push(segment);
    }
  });
  const last = value.at(-1);
  if (isToken(last) || typeof last === "string" && last.endsWith("\n")) {
    nodes.push(SENTINEL);
  }
  return nodes;
}
var isHost = (node) => (node == null ? void 0 : node.nodeType) === Node.ELEMENT_NODE && node.hasAttribute(HOST);
var isSentinel = (node) => (node == null ? void 0 : node.nodeType) === Node.ELEMENT_NODE && node.hasAttribute(SENTINEL_ATTRIBUTE);
var realLength = (text) => text.replaceAll(ANCHOR, "").length;
function createTokenView(el, {
  describe,
  customContent,
  onHosts
}) {
  const doc = el.ownerDocument;
  const hosts = /* @__PURE__ */ new Map();
  let hostCount = 0;
  function hostFor(token) {
    let entry = hosts.get(token.id);
    if (!entry) {
      const host2 = doc.createElement("span");
      host2.setAttribute(HOST, token.id);
      host2.setAttribute("contenteditable", "false");
      host2.setAttribute("spellcheck", "false");
      host2.setAttribute("data-slot", "token-input-host");
      const content = doc.createElement("span");
      const label = doc.createElement("span");
      label.style.cssText = visuallyHidden;
      label.setAttribute("data-slot", "token-input-token-label");
      host2.append(content, label);
      entry = { host: host2, content, label, labelText: doc.createTextNode(""), token };
      hosts.set(token.id, entry);
    }
    entry.token = token;
    const description = ` ${describe(token)}`;
    if (entry.label.textContent !== description) {
      entry.label.textContent = description;
    }
    showLabel(entry);
    host(entry.host, token);
    return entry.host;
  }
  function showLabel({ content, labelText, token }) {
    if (customContent()) {
      return labelText.remove();
    }
    if (labelText.data !== token.label) {
      labelText.data = token.label;
    }
    if (labelText.parentNode !== content) {
      content.prepend(labelText);
    }
  }
  function host(element2, token) {
    element2.setAttribute("data-token-type", token.type);
    for (const status of ["pending", "unresolved"]) {
      if (token.status === status) {
        element2.setAttribute(`data-${status}`, "");
      } else {
        element2.removeAttribute(`data-${status}`);
      }
    }
  }
  function render(value) {
    const wanted = layout(value);
    const used = /* @__PURE__ */ new Set();
    let cursor = el.firstChild;
    for (const item of wanted) {
      if (item === SENTINEL) {
        if (isSentinel(cursor)) {
          cursor = cursor.nextSibling;
        } else {
          el.insertBefore(doc.createElement("br"), cursor).setAttribute(
            SENTINEL_ATTRIBUTE,
            ""
          );
        }
        continue;
      }
      if (typeof item === "string") {
        if ((cursor == null ? void 0 : cursor.nodeType) === Node.TEXT_NODE) {
          if (cursor.data !== item) {
            ;
            cursor.data = item;
          }
          cursor = cursor.nextSibling;
        } else {
          el.insertBefore(doc.createTextNode(item), cursor);
        }
        continue;
      }
      const element2 = hostFor(item);
      used.add(item.id);
      if (cursor === element2) {
        cursor = cursor.nextSibling;
      } else {
        el.insertBefore(element2, cursor);
      }
    }
    while (cursor) {
      const next = cursor.nextSibling;
      cursor.remove();
      cursor = next;
    }
    let changed = false;
    for (const [id, entry] of hosts) {
      if (!used.has(id)) {
        entry.host.remove();
        hosts.delete(id);
        changed = true;
      }
    }
    if (changed || used.size !== hostCount) {
      hostCount = used.size;
      onHosts();
    }
  }
  function read(rendered2 = []) {
    const value = [];
    const walk = (parent, nested) => {
      parent.childNodes.forEach((node, index) => {
        if (node.nodeType === Node.TEXT_NODE) {
          value.push(node.data.replaceAll(ANCHOR, ""));
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        if (isHost(node)) {
          const entry = hosts.get(node.getAttribute(HOST));
          if (entry && entry.host === node && node.isConnected) {
            value.push(entry.token);
          }
          return;
        }
        if (isSentinel(node)) {
          return;
        }
        if (node.matches('[data-slot="token-input-host"]')) {
          const token = rendered2[Number(node.getAttribute(SERVER_INDEX))];
          return void (token && value.push(token));
        }
        const name = node.localName;
        if (name === "br") {
          return void value.push("\n");
        }
        const block = name === "div" || name === "p";
        if (block && (index > 0 || nested)) {
          value.push("\n");
        }
        walk(node, nested || block);
      });
    };
    walk(el, false);
    return value;
  }
  function hostOf(node) {
    const element2 = (node == null ? void 0 : node.nodeType) === Node.ELEMENT_NODE ? node : node == null ? void 0 : node.parentElement;
    const host2 = element2 == null ? void 0 : element2.closest(`[${HOST}]`);
    return host2 && el.contains(host2) ? host2 : null;
  }
  function startOf(node) {
    let total = 0;
    for (let current = node; current && current !== el; current = current.parentNode) {
      for (let sibling = current.previousSibling; sibling; sibling = sibling.previousSibling) {
        total += lengthOf(sibling);
      }
    }
    return total;
  }
  function offsetOf(node, offset, after = false) {
    const host2 = hostOf(node);
    if (host2) {
      return startOf(host2) + (after || host2 === node && offset > 0 ? 1 : 0);
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return startOf(node) + realLength(node.data.slice(0, offset));
    }
    let total = node === el ? 0 : startOf(node);
    for (let index = 0; index < offset && index < node.childNodes.length; index++) {
      total += lengthOf(node.childNodes[index]);
    }
    return total;
  }
  function lengthOf(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return realLength(node.data);
    }
    if (isHost(node)) {
      return 1;
    }
    if (isSentinel(node)) {
      return 0;
    }
    if (node.localName === "br") {
      return 1;
    }
    let total = 0;
    node.childNodes.forEach((child) => total += lengthOf(child));
    return total;
  }
  function pointAt(offset) {
    let remaining2 = offset;
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const data = child.data;
        const length = realLength(data);
        if (remaining2 <= length) {
          let index = data.startsWith(ANCHOR) && data.length > 1 ? 1 : 0;
          for (let counted = 0; counted < remaining2; index++) {
            if (data[index] !== ANCHOR) {
              counted++;
            }
          }
          return [child, index];
        }
        remaining2 -= length;
      } else {
        remaining2 -= lengthOf(child);
      }
    }
    return [el, el.childNodes.length - (isSentinel(el.lastChild) ? 1 : 0)];
  }
  function selection() {
    const selected = doc.getSelection();
    if (!selected || !selected.rangeCount || !el.contains(selected.anchorNode)) {
      return null;
    }
    const range = selected.getRangeAt(0);
    const start = offsetOf(range.startContainer, range.startOffset);
    const end = offsetOf(range.endContainer, range.endOffset, !range.collapsed);
    return { start: Math.min(start, end), end: Math.max(start, end) };
  }
  function select2({ start, end }) {
    const selected = doc.getSelection();
    if (!selected) {
      return;
    }
    const [startNode, startOffset] = pointAt(start);
    const [endNode, endOffset] = start === end ? [startNode, startOffset] : pointAt(end);
    const current = selected.rangeCount ? selected.getRangeAt(0) : null;
    if (current && current.startContainer === startNode && current.startOffset === startOffset && current.endContainer === endNode && current.endOffset === endOffset) {
      return;
    }
    selected.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
  }
  function rectAt(offset) {
    if (!el.isConnected) {
      return null;
    }
    const [node, index] = pointAt(offset);
    const range = doc.createRange();
    range.setStart(node, index);
    range.collapse(true);
    const rect = range.getBoundingClientRect();
    if (rect.height) {
      return { x: rect.x, y: rect.y, width: 0, height: rect.height };
    }
    if (node.nodeType === Node.TEXT_NODE && index > 0) {
      range.setStart(node, index - 1);
      range.setEnd(node, index);
      const before = range.getBoundingClientRect();
      if (before.height) {
        return { x: before.right, y: before.y, width: 0, height: before.height };
      }
    }
    const previous = node.nodeType === Node.TEXT_NODE ? node.previousSibling : node.childNodes[index - 1];
    if (isHost(previous)) {
      const box2 = previous.getBoundingClientRect();
      return { x: box2.right, y: box2.y, width: 0, height: box2.height };
    }
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      x: box.x + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
      y: box.y + parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth),
      width: 0,
      height: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2
    };
  }
  function typedBeforeBind(value) {
    const server = doc.createElement("template");
    server.innerHTML = renderStaticHtml(value, describe);
    if (!el.firstChild || el.querySelector(`[${HOST}]`) || el.innerHTML === server.innerHTML) {
      return;
    }
    return read(value.filter(isToken));
  }
  return {
    render,
    read: () => read(),
    typedBeforeBind,
    selection,
    select: select2,
    rectAt,
    offsetAt: (node, offset) => offsetOf(node, offset),
    // Whether a DOM point is inside a token's host.
    inHost: (node) => !!hostOf(node),
    hosts: () => [...hosts].map(([id, { token, content }]) => ({
      id,
      token,
      host: content
    })),
    hostElement: (id) => {
      var _a3;
      return (_a3 = hosts.get(id)) == null ? void 0 : _a3.host;
    },
    showLabels: () => hosts.forEach(showLabel),
    destroy() {
      hosts.clear();
      onHosts();
    }
  };
}
function renderStaticHtml(value, describe) {
  const escape = (text) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
  let tokens = 0;
  return layout(value).map((item) => {
    if (item === SENTINEL) {
      return `<br ${SENTINEL_ATTRIBUTE}="">`;
    }
    if (typeof item === "string") {
      return escape(item);
    }
    return `<span contenteditable="false" spellcheck="false" data-slot="token-input-host" ${SERVER_INDEX}="${tokens++}" data-token-type="${escape(item.type)}"><span>${escape(item.label)}</span><span data-slot="token-input-token-label" style="${visuallyHidden}"> ${escape(describe(item))}</span></span>`;
  }).join("");
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/live.js
function live(read) {
  return {
    read,
    /**
     * Writes the attributes to `el` now and on every change the part hears.
     * Returns the cleanup, which removes them again.
     */
    attach(part, el) {
      const channel = `live:${part.id}`;
      const write = () => applyAttrs(el, liveAttrs(part), channel);
      write();
      const unsubscribe = subscribe(part, write);
      return () => {
        unsubscribe();
        applyAttrs(el, {}, channel);
      };
    }
  };
}
function direct(names2) {
  const written = /* @__PURE__ */ new WeakMap();
  return {
    names: names2,
    /** Keeps the attributes current on `el` on every change the part hears. Returns the cleanup. */
    attach: (part, el) => {
      var _a3;
      let last = attrs(part);
      const own = (_a3 = written.get(el)) != null ? _a3 : /* @__PURE__ */ new Map();
      written.set(el, own);
      for (const [name, value] of own) {
        if (last[name] === void 0 && el.getAttribute(name) === value) {
          el.removeAttribute(name);
        }
      }
      own.clear();
      const update = () => {
        const values = attrs(part);
        for (const name of names2) {
          const value = values[name];
          if (value === void 0) {
            if (last[name] !== void 0 && el.getAttribute(name) === last[name]) {
              el.removeAttribute(name);
            }
            continue;
          }
          const current = el.getAttribute(name);
          if (current === value) {
            continue;
          }
          if (authorOwned.has(name) && current !== null && current !== last[name]) {
            continue;
          }
          el.setAttribute(name, value);
          own.set(name, value);
        }
        last = values;
      };
      update();
      return subscribe(part, update);
    }
  };
}
var applied = /* @__PURE__ */ new WeakMap();
var found = /* @__PURE__ */ new WeakMap();
var writing;
function applyAttrs(el, attrs2, channel = "render") {
  writeAttrs(el, attrs2, channel, false);
}
function releaseAttrs(el, channel) {
  writeAttrs(el, {}, channel, true);
}
function markAuthored(el, name) {
  var _a3, _b3;
  if (el === writing) {
    return;
  }
  for (const written of Object.values((_a3 = applied.get(el)) != null ? _a3 : {})) {
    written.delete(name);
  }
  for (const values of Object.values((_b3 = found.get(el)) != null ? _b3 : {})) {
    values.delete(name);
  }
}
function writeAttrs(el, attrs2, channel, release2) {
  const outer = writing;
  writing = el;
  try {
    writeChannel(el, attrs2, channel, release2);
  } finally {
    writing = outer;
  }
}
function writeChannel(el, attrs2, channel, release2) {
  var _a3, _b3, _c, _d, _e, _f;
  const channels = (_a3 = applied.get(el)) != null ? _a3 : {};
  const previous = (_b3 = channels[channel]) != null ? _b3 : /* @__PURE__ */ new Map();
  const written = /* @__PURE__ */ new Map();
  const styles = attrs2.style === void 0 ? [] : styleDeclarations(attrs2.style);
  for (const [property, value] of styles) {
    written.set(`style:${property}`, value);
  }
  for (const [name, value] of Object.entries(attrs2)) {
    if (value !== void 0 && name !== "style") {
      written.set(name, value);
    }
  }
  const id = written.has("id") || previous.has("id") ? el.getAttribute("id") : null;
  const keeps = keepsId(id, channels, channel);
  if (keeps) {
    written.delete("id");
  }
  const authors = /* @__PURE__ */ new Set();
  const read = /* @__PURE__ */ new Map();
  for (const name of /* @__PURE__ */ new Set([...written.keys(), ...previous.keys()])) {
    if (!authorOwned.has(name)) {
      continue;
    }
    const current = el.getAttribute(name);
    read.set(name, current);
    if (current === null || current === written.get(name) || name === "aria-labelledby" && madeLabel(current)) {
      continue;
    }
    if (!Object.values(channels).some((wrote) => wrote.get(name) === current)) {
      authors.add(name);
    }
  }
  for (const name of authors) {
    written.delete(name);
  }
  for (const name of previous.keys()) {
    if (written.has(name) || authors.has(name) || name === "id" && keeps) {
      continue;
    }
    if (name.startsWith("style:")) {
      el.style.removeProperty(name.slice(6));
      continue;
    }
    if (!release2) {
      el.removeAttribute(name);
      keepFound(el, channel, name, null);
      continue;
    }
    const current = el.getAttribute(name);
    if (current !== previous.get(name)) {
      continue;
    }
    const original = (_d = (_c = found.get(el)) == null ? void 0 : _c[channel]) == null ? void 0 : _d.get(name);
    if (original === void 0) {
      el.removeAttribute(name);
    } else if (current !== original) {
      el.setAttribute(name, original);
    }
  }
  for (const [property, value] of styles) {
    if (el.style.getPropertyValue(property) !== value) {
      el.style.setProperty(property, value);
    }
  }
  for (const [name, value] of Object.entries(attrs2)) {
    if (value === void 0 || !written.has(name)) {
      continue;
    }
    const current = name === "id" ? id : read.has(name) ? read.get(name) : el.getAttribute(name);
    if (current !== ((_e = previous.get(name)) != null ? _e : null)) {
      keepFound(el, channel, name, current);
    }
    if (current === value) {
      continue;
    }
    if (name === "value" && isTextField(el) && el.value !== value) {
      el.value = value;
    }
    el.setAttribute(name, value);
  }
  channels[channel] = written;
  applied.set(el, channels);
  if (release2) {
    (_f = found.get(el)) == null ? true : delete _f[channel];
  }
}
function keepFound(el, channel, name, value) {
  var _a3, _b3, _c;
  const kept = value == null || name === "id" ? void 0 : references.includes(name) ? authoredIds(value) : value;
  if (kept === void 0) {
    return void ((_b3 = (_a3 = found.get(el)) == null ? void 0 : _a3[channel]) == null ? void 0 : _b3.delete(name));
  }
  let channels = found.get(el);
  if (!channels) {
    found.set(el, channels = {});
  }
  ;
  ((_c = channels[channel]) != null ? _c : channels[channel] = /* @__PURE__ */ new Map()).set(name, kept);
}
var authoredIds = (ids) => ids.split(/\s+/).filter((id) => id && !id.startsWith("ui-sdk-")).join(" ") || void 0;
function keepsId(id, channels, channel) {
  var _a3;
  if (id === null || id === ((_a3 = channels[channel]) == null ? void 0 : _a3.get("id"))) {
    return false;
  }
  return !id.startsWith("ui-sdk-") || Object.values(channels).some((written) => written.get("id") === id);
}
var isTextField = (el) => el.localName === "textarea" || el.localName === "input" && el.type !== "file";
function styleDeclarations(css2) {
  const declarations = [];
  for (const declaration of css2.split(";")) {
    const index = declaration.indexOf(":");
    if (index > 0) {
      declarations.push([
        declaration.slice(0, index).trim(),
        declaration.slice(index + 1).trim()
      ]);
    }
  }
  return declarations;
}

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-parts.js
init_style();
function editorState(state) {
  return {
    empty: valueLength(state.value) === 0,
    disabled: isDisabled(state),
    readOnly: state.readOnly
  };
}
function tokenState(state, props) {
  var _a3;
  const token = (_a3 = tokensOf(state.value).find(
    (candidate) => candidate.id === props.token
  )) != null ? _a3 : {
    type: "",
    value: "",
    label: ""
  };
  return {
    token,
    selected: isSelected(state, props.token),
    pending: token.status === "pending",
    unresolved: token.status === "unresolved",
    disabled: isDisabled(state),
    readOnly: state.readOnly
  };
}
var isSelected = (state, id) => !!id && ` ${state.selected} `.includes(` ${id} `);
function editorStyles(doc) {
  writeStyle(
    doc,
    "ui-sdk-token-input",
    '@layer ui-sdk { :where([data-slot="token-input-editor"]) { white-space: pre-wrap; overflow-wrap: anywhere } :where([data-slot="token-input-host"]) { user-select: all } }'
  );
}
var tokenInputSlots = (slot) => ({
  // Web components only: the element takes part in forms with the codec text.
  // A field can disable it without the `disabled` attribute the browser leaves
  // a control out of the form by, so disabled it submits and validates nothing.
  root: slot({
    bind: (el, { api, store }) => bindInternals(el, {
      value: () => store.get().name && !isDisabled(store.get()) ? api.internal.text() : null,
      state: api.internal.text,
      restore: api.internal.restore,
      valueMissing: () => store.get().required && !isDisabled(store.get()) && valueLength(store.get().value) === 0,
      message: () => valueMissingMessage("text"),
      anchor: () => api.editor.element,
      focus: () => api.focus(),
      reset: api.internal.reset,
      disabled: api.internal.setFormDisabled,
      subscribe: store.subscribe
    })
  }),
  // The editable text. The core owns what's inside it.
  editor: slot({
    role: "textbox",
    focus: "native",
    props: { placeholder: "string" },
    state: editorState,
    attrs: (state, { id, props }) => {
      const { empty, disabled, readOnly } = editorState(state);
      return {
        id: `${id}-editor`,
        "aria-multiline": "true",
        contenteditable: disabled ? "false" : "true",
        "aria-placeholder": props.placeholder,
        "aria-disabled": disabled ? "true" : void 0,
        "aria-readonly": readOnly ? "true" : void 0,
        "aria-required": state.required ? "true" : void 0,
        "data-empty": empty ? "" : void 0,
        "data-disabled": disabled ? "" : void 0,
        "data-readonly": readOnly ? "" : void 0
      };
    },
    bind(el, { api, store }) {
      editorStyles(el.ownerDocument);
      const view2 = createTokenView(el, {
        describe: api.internal.describe,
        customContent: () => store.get().custom,
        // The hosts count what the editor holds now, which the page decides.
        onHosts: () => measured(() => store.set({ hosts: store.get().hosts + 1 }))
      });
      const typed = view2.typedBeforeBind(store.get().value);
      api.internal.setView(view2);
      let bound = true;
      if (typed) {
        queueMicrotask(
          () => bound && api.internal.commit(typed, {
            reason: "input-change",
            selection: api.internal.caretAt(valueLength(typed))
          })
        );
      }
      const unbind = bindTokenEditing(el, view2, api);
      let selected = "";
      const writeSelected = () => {
        var _a3;
        const state = store.get();
        if (state.selected === selected) {
          return;
        }
        selected = state.selected;
        for (const token of tokensOf(state.value)) {
          (_a3 = view2.hostElement(token.id)) == null ? void 0 : _a3.toggleAttribute("data-selected", isSelected(state, token.id));
        }
      };
      let custom = store.get().custom;
      const writeLabels = () => {
        if (store.get().custom === custom) {
          return;
        }
        custom = store.get().custom;
        view2.showLabels();
      };
      const unsubscribe = store.subscribe(() => {
        writeSelected();
        writeLabels();
      });
      return () => {
        bound = false;
        unsubscribe();
        unbind();
        api.internal.setView(void 0);
        view2.destroy();
      };
    }
  }),
  // A token's content, rendered by a framework inside its host.
  token: slot({
    // Internal: passed by renderers, from the host the core renders the token in.
    props: { token: "string" },
    state: (state, { props }) => tokenState(state, props),
    attrs: (state, { props }) => {
      const { token, pending: pending2, unresolved, disabled, readOnly } = tokenState(
        state,
        props
      );
      return {
        "data-token-type": token.type,
        "data-pending": pending2 ? "" : void 0,
        "data-unresolved": unresolved ? "" : void 0,
        "data-disabled": disabled ? "" : void 0,
        "data-readonly": readOnly ? "" : void 0
      };
    },
    live: live((state, { props }) => ({
      "data-selected": isSelected(state, props.token) ? "" : void 0
    }))
  }),
  // Removes its token. For pointers only: the keyboard's way is Backspace.
  // Disabled and read-only inputs mark it, so it can hide or dim.
  "token-remove": slot({
    // Internal: passed by renderers, from the host the core renders the token in.
    props: { token: "string" },
    attrs: (state) => ({
      "aria-hidden": "true",
      "data-disabled": isDisabled(state) ? "" : void 0,
      "data-readonly": state.readOnly ? "" : void 0
    }),
    // Pressing it keeps focus and the caret in the editor.
    on: pressKeepsFocus,
    press: ({ api, props }, event) => {
      if (api.internal.editable()) {
        api.internal.removeToken(props.token, { reason: "remove-press", event });
      }
    }
  }),
  // React and Vue: a visually hidden textarea with the codec text, so forms
  // submit, reset and validate it, even before hydration. A textarea, since
  // a text input drops new lines.
  "form-input": slot({
    attrs: (state, { id, api }) => ({
      id: `${id}-form-input`,
      name: state.name,
      value: api.internal.text(),
      form: state.form,
      required: state.required ? "" : void 0,
      disabled: state.disabled ? "" : void 0,
      "aria-hidden": "true",
      tabindex: "-1",
      style: hiddenInputStyle
    }),
    bind: (el, { api, store }) => bindValueInput(el, {
      value: api.internal.text,
      subscribe: store.subscribe,
      focus: () => api.focus(),
      reset: api.internal.reset,
      disabled: api.internal.setFormDisabled
    })
  })
});

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-api.js
init_announce();

// node_modules/@ui-sdk/core/dist/foundation/text/caret.js
var mirrored = [
  "direction",
  "boxSizing",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "fontFeatureSettings",
  "textAlign",
  "textTransform",
  "textIndent",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "wordBreak",
  "overflowWrap"
];
function measureInMirror(field, offset) {
  const doc = field.ownerDocument;
  const style = getComputedStyle(field);
  const mirror = doc.createElement("div");
  const target = mirror.style;
  for (const name of mirrored) {
    target[name] = style[name];
  }
  const multiline = field.localName === "textarea";
  target.position = "absolute";
  target.visibility = "hidden";
  target.top = "0";
  target.left = "-9999px";
  target.overflow = "hidden";
  target.boxSizing = "content-box";
  target.borderStyle = "solid";
  target.whiteSpace = multiline ? "pre-wrap" : "pre";
  target.width = `${field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)}px`;
  const marker = doc.createElement("span");
  marker.textContent = "\u200B";
  const value = field.value;
  mirror.append(value.slice(0, offset), marker, value.slice(offset));
  doc.body.append(mirror);
  const result = {
    x: marker.offsetLeft,
    y: marker.offsetTop,
    height: marker.offsetHeight
  };
  mirror.remove();
  return result;
}
function nativeRect(field, offset) {
  if (typeof field.createValueRange !== "function") {
    return null;
  }
  try {
    const rect = field.createValueRange(offset, offset).getBoundingClientRect();
    if (rect.height === 0 && rect.width === 0 && rect.x === 0 && rect.y === 0) {
      return null;
    }
    return { x: rect.x, y: rect.y, width: 0, height: rect.height };
  } catch {
    return null;
  }
}
function createCaretRects(field) {
  let cache = null;
  return (offset) => {
    if (!field.isConnected) {
      return null;
    }
    const native = nativeRect(field, offset);
    if (native) {
      return native;
    }
    const width = field.clientWidth;
    if (!cache || cache.value !== field.value || cache.offset !== offset || cache.width !== width) {
      cache = {
        value: field.value,
        offset,
        width,
        rect: measureInMirror(field, offset)
      };
    }
    const box = field.getBoundingClientRect();
    return {
      x: box.left + cache.rect.x - field.scrollLeft,
      y: box.top + cache.rect.y - field.scrollTop,
      width: 0,
      height: cache.rect.height
    };
  };
}
function textDiff(before, after) {
  let start = 0;
  const shortest = Math.min(before.length, after.length);
  while (start < shortest && before[start] === after[start]) {
    start++;
  }
  let end = 0;
  while (end < shortest - start && before[before.length - 1 - end] === after[after.length - 1 - end]) {
    end++;
  }
  return {
    range: { start, end: before.length - end },
    inserted: after.slice(start, after.length - end)
  };
}
function insertText(field, range, text) {
  if (field.ownerDocument.activeElement !== field) {
    field.focus({ preventScroll: true });
  }
  field.setSelectionRange(range.start, range.end);
  let inserted = false;
  try {
    inserted = text === "" && range.start !== range.end ? field.ownerDocument.execCommand("delete", false) : field.ownerDocument.execCommand("insertText", false, text);
  } catch {
  }
  if (inserted) {
    return;
  }
  field.setRangeText(text, range.start, range.end, "end");
  field.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text
    })
  );
}
function textFieldAdapter(field) {
  const listeners = /* @__PURE__ */ new Set();
  const rectAt = createCaretRects(field);
  let previous = field.value;
  let composing2 = false;
  let programmatic = false;
  let lastSelection = "";
  const emit2 = (change) => listeners.forEach((listener) => listener(change));
  const focused = () => field.ownerDocument.activeElement === field;
  function onBeforeInput() {
    if (!composing2) {
      previous = field.value;
    }
  }
  function onInput(event) {
    if (!event.isComposing) {
      composing2 = false;
    }
    if (composing2) {
      return;
    }
    const value = field.value;
    const { range, inserted } = textDiff(previous, value);
    previous = value;
    emit2({
      type: "input",
      range,
      inserted,
      user: !programmatic && trusted(event)
    });
    noteSelection();
  }
  function noteSelection() {
    const key = `${field.selectionStart}:${field.selectionEnd}`;
    if (key === lastSelection) {
      return;
    }
    lastSelection = key;
    emit2({ type: "selection" });
  }
  function onCompositionStart() {
    composing2 = true;
    previous = field.value;
    emit2({ type: "compositionstart" });
  }
  function onCompositionEnd() {
    composing2 = false;
    const value = field.value;
    const { range, inserted } = textDiff(previous, value);
    previous = value;
    emit2({ type: "compositionend" });
    if (range.start !== range.end || inserted) {
      emit2({ type: "input", range, inserted, user: true });
    }
  }
  const selectionEvents = [
    "selectionchange",
    "keyup",
    "pointerup",
    "focus"
  ];
  const onBlur = () => {
    composing2 = false;
    lastSelection = "";
    emit2({ type: "selection" });
  };
  function attach2() {
    field.addEventListener("beforeinput", onBeforeInput);
    field.addEventListener("input", onInput);
    field.addEventListener("compositionstart", onCompositionStart);
    field.addEventListener("compositionend", onCompositionEnd);
    field.addEventListener("blur", onBlur);
    for (const type of selectionEvents) {
      field.addEventListener(type, noteSelection);
    }
  }
  function detach2() {
    field.removeEventListener("beforeinput", onBeforeInput);
    field.removeEventListener("input", onInput);
    field.removeEventListener("compositionstart", onCompositionStart);
    field.removeEventListener("compositionend", onCompositionEnd);
    field.removeEventListener("blur", onBlur);
    for (const type of selectionEvents) {
      field.removeEventListener(type, noteSelection);
    }
  }
  return {
    element: field,
    textBefore(length) {
      var _a3;
      if (!focused()) {
        return null;
      }
      const caret = (_a3 = field.selectionEnd) != null ? _a3 : 0;
      const offset = Math.max(0, caret - length);
      return { text: field.value.slice(offset, caret), offset };
    },
    selection: () => {
      var _a3;
      return focused() && field.selectionStart !== null ? {
        start: field.selectionStart,
        end: (_a3 = field.selectionEnd) != null ? _a3 : field.selectionStart
      } : null;
    },
    rectAt,
    replace(range, content) {
      const text = typeof content === "string" ? content : content.label;
      programmatic = true;
      try {
        insertText(field, range, text);
      } finally {
        programmatic = false;
      }
      previous = field.value;
    },
    subscribe(listener) {
      if (!listeners.size) {
        attach2();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          detach2();
        }
      };
    },
    composing: () => composing2,
    submit: () => {
      var _a3;
      return (_a3 = field.form) == null ? void 0 : _a3.requestSubmit();
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/undo-stack.js
var defaults = {};
function createUndoStack(initial, options = defaults) {
  const settings = () => {
    var _a3;
    return (_a3 = typeof options === "function" ? options() : options) != null ? _a3 : defaults;
  };
  let entries = [initial];
  let index = 0;
  let open = null;
  return {
    /**
     * Records the state after an edit. Edits of the same `group`, like
     * "insert" or "delete", join the last entry while they come within
     * `groupDelay` of each other. Without a group, the edit is its own entry.
     */
    record(state, { group, time = Date.now() } = {}) {
      const { limit = 100, groupDelay = 500 } = settings();
      entries = entries.slice(0, index + 1);
      const joins = !!group && (open == null ? void 0 : open.group) === group && time - open.time < groupDelay;
      if (joins) {
        entries[index] = state;
      } else {
        entries.push(state);
        if (entries.length > limit + 1) {
          entries.shift();
        }
        index = entries.length - 1;
      }
      open = group ? { group, time } : null;
    },
    /** Ends the open group, so the next edit starts an entry, like after a caret jump. */
    seal() {
      open = null;
    },
    /** Steps back, and returns the state to show, or `undefined` at the first entry. */
    undo() {
      open = null;
      if (index === 0) {
        return void 0;
      }
      return entries[--index];
    },
    /** Steps forward again, and returns the state to show, or `undefined` at the last entry. */
    redo() {
      open = null;
      if (index === entries.length - 1) {
        return void 0;
      }
      return entries[++index];
    },
    /** Whether there's an entry to step back to. */
    canUndo: () => index > 0,
    /** Whether there's an entry to step forward to. */
    canRedo: () => index < entries.length - 1,
    /** Rewrites every entry, like a token's status changing everywhere without an entry of its own. */
    map(update) {
      entries = entries.map(update);
    },
    /** Starts over from `state`, like after a controlled value from outside. */
    reset(state) {
      entries = [state];
      index = 0;
      open = null;
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/modality.js
var modality = "pointer";
var installed = false;
var scheduled = false;
var restoring = false;
var moving = false;
var windowLeft = false;
var lastPointer = "mouse";
var pointerPressed = false;
var forgetPointerPress = () => pointerPressed = false;
var keyTarget = null;
var forgetKeyTarget = () => keyTarget = null;
function noteKey(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  keyTarget = event.target;
  setTimeout(forgetKeyTarget);
}
function noteKeydown(event) {
  noteKey(event);
  windowLeft = false;
  const modifierOnly = event.metaKey || event.ctrlKey || event.altKey || /^(Meta|Control|Alt|Shift)$/.test(event.key);
  if (event.key === "Tab" || !modifierOnly) {
    modality = "keyboard";
  }
}
function notePress(event) {
  modality = "pointer";
  windowLeft = false;
  if (!("pointerType" in event)) {
    if (!pointerPressed) {
      lastPointer = "touch";
    }
    return;
  }
  pointerPressed = true;
  setTimeout(forgetPointerPress);
  const type = event.pointerType;
  lastPointer = isSyntheticPointer(event) ? "virtual" : type === "touch" || type === "pen" ? type : "mouse";
}
function install() {
  if (installed || typeof document === "undefined") {
    return;
  }
  installed = true;
  document.addEventListener("keydown", noteKeydown, true);
  document.addEventListener("keyup", noteKey, true);
  document.addEventListener("pointerdown", notePress, true);
  document.addEventListener("touchstart", notePress, {
    capture: true,
    passive: true
  });
  window.addEventListener("blur", (event) => {
    if (event.target === window) {
      windowLeft = true;
    }
  });
}
function trackInput() {
  if (installed || scheduled) {
    return;
  }
  scheduled = true;
  queueMicrotask(install);
}
function isSyntheticPointer(event) {
  if (event.type === "pointermove") {
    return false;
  }
  if (event.width === 0 && event.height === 0 && event.pressure === 0) {
    return true;
  }
  return event.pointerType === "mouse" && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0;
}
function clickSource(event) {
  if (event.detail > 0) {
    return lastPointer;
  }
  const fromKey = !!keyTarget && keyTarget.contains(event.target);
  return fromKey ? "keyboard" : "virtual";
}
var currentSource = () => modality === "keyboard" ? "keyboard" : lastPointer;
function sourceOf(event) {
  install();
  if (!event) {
    return currentSource();
  }
  if (!trusted(event)) {
    return "programmatic";
  }
  if (event.type.startsWith("key")) {
    return "keyboard";
  }
  if (event.type.startsWith("touch")) {
    return "touch";
  }
  if (event.type === "click") {
    return clickSource(event);
  }
  const pointerType = event.pointerType;
  if (pointerType === "mouse" || pointerType === "touch" || pointerType === "pen") {
    return isSyntheticPointer(event) ? "virtual" : pointerType;
  }
  if ("button" in event) {
    return lastPointer;
  }
  return currentSource();
}
function restoreFocus(el) {
  install();
  restoring = true;
  try {
    el.focus({ preventScroll: true });
  } finally {
    restoring = false;
  }
}
function moveFocus(el) {
  install();
  moving = true;
  try {
    el.focus({ preventScroll: true });
  } finally {
    moving = false;
  }
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/option-names.js
var capitalized = (key) => `${key[0].toUpperCase()}${key.slice(1)}`;
var callbackName = (key, kind) => `on${capitalized(key)}${kind}`;

// node_modules/@ui-sdk/core/dist/foundation/kernel/change.js
function debug(context2, key, value, reason, source) {
  if (dev && context2.options().debug) {
    console.debug(
      `[ui-sdk] ${context2.label}#${context2.id} ${key}: ${String(value)} (${reason}, ${source})`
    );
  }
}
function changeFrom(context2, source) {
  const { store, options } = context2;
  const requested = /* @__PURE__ */ new Map();
  const asked = /* @__PURE__ */ new Map();
  const changing = /* @__PURE__ */ new Map();
  context2.onOptions((next, synced) => {
    if (dev) {
      heardControlled(requested, next);
    }
    if (!synced) {
      return;
    }
    let source2;
    for (const [key, entry] of requested) {
      if (!(key in synced)) {
        continue;
      }
      if (sameValue(synced[key], entry.value)) {
        source2 = entry.source;
      }
      requested.delete(key);
    }
    return source2;
  });
  if (dev) {
    context2.onDestroy(() => forgetControlled(requested));
  }
  return (key, value, details) => {
    var _a3, _b3, _c, _d;
    if (changing.has(key) && sameValue(changing.get(key), value)) {
      return false;
    }
    const ask = ((_a3 = asked.get(key)) != null ? _a3 : 0) + 1;
    asked.set(key, ask);
    const previous = store.get()[key];
    if (sameValue(previous, value)) {
      return false;
    }
    const { reason, event } = details;
    const callbackDetails = createDetails(
      details,
      (_b3 = details.source) != null ? _b3 : source(reason, event)
    );
    if (dev) {
      checkEvent(reason, event, { component: context2.label, id: context2.id });
    }
    debug(context2, key, value, reason, callbackDetails.source);
    const current = options();
    const isControlled = current[key] !== void 0;
    const outer = changing.has(key);
    const outerValue = changing.get(key);
    changing.set(key, value);
    try {
      withSource(callbackDetails.source, () => {
        const name = callbackName(key, "Change");
        const callback = current[name];
        if (typeof callback === "function") {
          const prevented = dev && !!(event == null ? void 0 : event.defaultPrevented);
          callback(value, callbackDetails);
          if (dev) {
            checkPrevented(name, prevented, callbackDetails, {
              component: context2.label,
              id: context2.id
            });
          }
        }
        const askedInside = asked.get(key) !== ask;
        if (!callbackDetails.canceled && !isControlled && !askedInside) {
          store.set({ [key]: value });
        }
      });
    } finally {
      if (outer) {
        changing.set(key, outerValue);
      } else {
        changing.delete(key);
      }
    }
    if (dev) {
      emit({
        type: "change",
        component: context2.label,
        id: context2.id,
        key,
        value,
        reason,
        source: callbackDetails.source,
        canceled: callbackDetails.canceled,
        controlled: isControlled
      });
    }
    if (callbackDetails.canceled) {
      return false;
    }
    (_d = (_c = watchers).change) == null ? void 0 : _d.call(_c, context2.id, key, value, callbackDetails, previous);
    if (isControlled) {
      requested.set(key, { value, source: callbackDetails.source });
      if (dev) {
        expectControlled(
          requested,
          {
            component: context2.label,
            id: context2.id,
            key,
            value,
            reason,
            source: callbackDetails.source
          },
          () => options()[key]
        );
      }
    }
    return true;
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/input-source.js
var changeSource = (reason, event) => resolveSource(reason, event && (() => sourceOf(event)));
function inputSource() {
  trackInput();
  return changeSource;
}
function createChange(context2, source = inputSource()) {
  return changeFrom(context2, source);
}

// node_modules/@ui-sdk/core/dist/components/token-input/token-input-api.js
var userReasons = /* @__PURE__ */ new Set(["input-change", "paste", "drop", "cut"]);
var normalized = /* @__PURE__ */ new WeakMap();
function normalizedOnce(value) {
  let result = normalized.get(value);
  if (!result) {
    normalized.set(value, result = normalizeValue(value));
  }
  return result;
}
function initialTokenInputState(options) {
  var _a3;
  const initial = normalizedOnce((_a3 = options.defaultValue) != null ? _a3 : []);
  return {
    value: options.value ? normalizedOnce(options.value) : initial,
    initial,
    selected: "",
    hosts: 0,
    custom: false,
    disabled: !!options.disabled,
    formDisabled: false,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form
  };
}
function syncTokenInputState(options) {
  return {
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    ...options.value === void 0 ? {} : { value: normalizedOnce(options.value) },
    ...options.defaultValue === void 0 ? {} : { initial: normalizedOnce(options.defaultValue) }
  };
}
function selectedIds(value, range) {
  if (!range || range.start === range.end) {
    return "";
  }
  let at = 0;
  const ids = [];
  for (const segment of value) {
    if (isToken(segment) && at >= range.start && at < range.end) {
      ids.push(segment.id);
    }
    at += isToken(segment) ? 1 : segment.length;
  }
  return ids.join(" ");
}
var defaultDescription = (token) => `${token.type}${token.status === "pending" ? ", loading" : token.status === "unresolved" ? ", unresolved" : ""}`;
function ownerForm(el, formId) {
  if (!el) {
    return null;
  }
  if (formId === void 0) {
    return el.closest("form");
  }
  const root = el.getRootNode();
  const named2 = "getElementById" in root ? root.getElementById(formId) : el.ownerDocument.getElementById(formId);
  return named2 instanceof HTMLFormElement ? named2 : null;
}
function tokenInputApiBody(context2) {
  const { id, store, options, element: element2 } = context2;
  const change = createChange(context2);
  let view2;
  let selection = null;
  let focused = false;
  let composing2 = false;
  let pendingSelection;
  let committed = store.get().value;
  const listeners = /* @__PURE__ */ new Set();
  const history = createUndoStack({ value: store.get().value, selection: null }, () => options().history);
  let messages2 = [];
  const codec = () => {
    var _a3;
    return (_a3 = options().codec) != null ? _a3 : defaultCodec;
  };
  const describe = (token) => {
    var _a3, _b3, _c;
    return (_c = (_b3 = (_a3 = options()).getTokenDescription) == null ? void 0 : _b3.call(_a3, token)) != null ? _c : defaultDescription(token);
  };
  const editable = () => {
    const state = store.get();
    return !isDisabled(state) && !state.readOnly;
  };
  const emit2 = (change2) => listeners.forEach((listener) => listener(change2));
  function say(message) {
    messages2.push(message);
    announce(messages2.join(". "));
    queueMicrotask(() => messages2 = []);
  }
  function caretAt(offset) {
    return { start: offset, end: offset };
  }
  function commit2(next, { reason, event, inputType, selection: after, group, record = true }) {
    const before = committed;
    const value = normalizeValue(next);
    normalized.set(value, value);
    if (sameValue2(before, value)) {
      if (after) {
        setSelection(after);
      }
      return false;
    }
    const removed = removedTokens(before, value);
    pendingSelection = after;
    if (after) {
      selection = after;
    }
    committed = value;
    const accepted = change("value", value, {
      reason,
      event,
      inputType,
      removed
    });
    if (!accepted) {
      committed = before;
      pendingSelection = void 0;
      render();
      return false;
    }
    if (record) {
      history.record({ value, selection: after != null ? after : null }, { group });
    }
    emit2({
      type: "input",
      ...textDiff(offsetText(before), offsetText(value)),
      user: userReasons.has(reason)
    });
    for (const token of removed) {
      say(`Removed ${describe(token)} ${token.label}`);
    }
    if (options().value !== void 0) {
      setTimeout(() => {
        if (committed !== value || store.get().value === value) {
          return;
        }
        committed = store.get().value;
        render();
      });
    }
    return true;
  }
  function render() {
    if (!view2) {
      return;
    }
    view2.render(store.get().value);
    const length = valueLength(store.get().value);
    const target = pendingSelection != null ? pendingSelection : focused ? selection : null;
    pendingSelection = void 0;
    if (target && focused) {
      view2.select({
        start: Math.min(target.start, length),
        end: Math.min(target.end, length)
      });
    }
  }
  let shown = store.get().value;
  store.subscribe(() => {
    const { value } = store.get();
    if (value === shown) {
      return;
    }
    shown = value;
    if (value !== committed) {
      if (!sameValue2(value, committed)) {
        history.record({ value, selection: null });
      }
      committed = value;
    }
    render();
  });
  function setSelection(next) {
    selection = next;
    if (next && view2 && focused) {
      view2.select(next);
    }
  }
  function insertAt(range, content, {
    reason,
    event,
    pending: pending2
  }) {
    const value = committed;
    const inserted = Array.isArray(content) ? normalizeValue(content) : typeof content === "string" ? [content] : normalizeValue([
      { ...content, ...pending2 ? { status: "pending" } : {} }
    ]);
    const token = inserted.length === 1 && isToken(inserted[0]) ? inserted[0] : void 0;
    const following2 = offsetText(value)[range.end];
    if (token && (following2 === void 0 || !/\s/.test(following2))) {
      inserted.push(" ");
    }
    const end = range.start + valueLength(inserted);
    const next = replaceRange(value, range, inserted);
    if (!commit2(next, { reason, event, selection: caretAt(end) })) {
      return false;
    }
    if (token) {
      say(`Inserted ${describe(token)} ${token.label}`);
    }
    if (!token || !pending2) {
      return true;
    }
    const tokenId = tokenAt(next, range.start).id;
    pending2.then(
      (patch) => updateToken(tokenId, { ...patch != null ? patch : {}, status: patch == null ? void 0 : patch.status }),
      () => {
        say(`Couldn't add ${token.label}`);
        removeToken(tokenId, { reason: "imperative", record: false });
      }
    );
    return true;
  }
  function updateToken(tokenId, patch) {
    var _a3;
    const update = (value) => value.map(
      (segment) => isToken(segment) && segment.id === tokenId ? { ...segment, ...patch } : segment
    );
    history.map((entry) => ({ ...entry, value: update(entry.value) }));
    const before = tokensOf(committed).find((token) => token.id === tokenId);
    if (!before) {
      return false;
    }
    const changed = commit2(update(committed), {
      reason: "imperative",
      record: false
    });
    if (before.status === "pending" && !patch.status) {
      say(`${(_a3 = patch.label) != null ? _a3 : before.label} ready`);
    }
    return changed;
  }
  function removeToken(tokenId, {
    reason = "imperative",
    record = true,
    event
  } = {}) {
    const remove = (value) => value.filter((segment) => !(isToken(segment) && segment.id === tokenId));
    if (!record) {
      history.map((entry) => ({ ...entry, value: remove(entry.value) }));
    }
    return commit2(remove(committed), { reason, event, record });
  }
  function undo(event) {
    var _a3;
    const entry = history.undo();
    return !!entry && commit2(entry.value, {
      reason: "undo",
      event,
      selection: (_a3 = entry.selection) != null ? _a3 : void 0,
      record: false
    });
  }
  function redo(event) {
    var _a3;
    const entry = history.redo();
    return !!entry && commit2(entry.value, {
      reason: "redo",
      event,
      selection: (_a3 = entry.selection) != null ? _a3 : void 0,
      record: false
    });
  }
  function submit(event) {
    var _a3;
    const onSubmit = options().onSubmit;
    if (onSubmit) {
      return onSubmit(store.get().value, { event });
    }
    (_a3 = ownerForm(element2("editor"), store.get().form)) == null ? void 0 : _a3.requestSubmit();
  }
  const canSubmit = () => !!options().onSubmit || !!ownerForm(element2("editor"), store.get().form);
  const editor = {
    get element() {
      return element2("editor");
    },
    textBefore(length) {
      if (!focused || !selection) {
        return null;
      }
      const caret = selection.end;
      const offset = Math.max(0, caret - length);
      return { text: offsetText(committed).slice(offset, caret), offset };
    },
    selection: () => focused ? selection : null,
    rectAt: (offset) => {
      var _a3;
      return (_a3 = view2 == null ? void 0 : view2.rectAt(offset)) != null ? _a3 : null;
    },
    replace: (range, content, replaceOptions) => insertAt(range, content, {
      reason: "item-press",
      pending: replaceOptions == null ? void 0 : replaceOptions.pending
    }),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    composing: () => composing2,
    tokens: true,
    submit
  };
  const api = {
    id,
    editor,
    getValue: () => store.get().value,
    setValue: (value, { reason = "imperative", event } = {}) => commit2(value, {
      reason,
      event,
      selection: caretAt(valueLength(normalizeValue(value)))
    }),
    getText: (custom) => toText(store.get().value, custom != null ? custom : codec()),
    getLabel: () => toLabel(store.get().value),
    insert(content, {
      at = "caret",
      resolve,
      reason = "imperative",
      event
    } = {}) {
      const length = valueLength(committed);
      const range = typeof at === "object" ? at : at === "end" || !selection ? caretAt(length) : selection;
      return insertAt(range, content, { reason, event, pending: resolve });
    },
    updateToken,
    removeToken: (tokenId, { reason, event } = {}) => removeToken(tokenId, { reason, event }),
    undo: () => undo(),
    redo: () => redo(),
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    clear: ({ reason = "imperative", event } = {}) => commit2([], { reason, event, selection: caretAt(0) }),
    focus({ at = "end" } = {}) {
      const el = element2("editor");
      if (!el) {
        return;
      }
      el.focus({ preventScroll: true });
      setSelection(caretAt(at === "start" ? 0 : valueLength(store.get().value)));
    },
    // Internal. Used by slots, the editing module and adapters.
    internal: {
      options,
      editable,
      codec,
      describe,
      commit: commit2,
      undo,
      redo,
      submit,
      canSubmit,
      say,
      seal: history.seal,
      // The latest value, which a controlled owner may not have passed back yet.
      latest: () => committed,
      removeToken,
      caretAt,
      setView(next) {
        view2 = next;
        if (next) {
          render();
        }
      },
      view: () => view2,
      setSelection(next) {
        selection = next;
        store.set({ selected: selectedIds(store.get().value, next) });
        emit2({ type: "selection" });
      },
      selection: () => selection,
      setFocused(next) {
        focused = next;
        if (!next) {
          emit2({ type: "selection" });
        }
      },
      setComposing(next) {
        composing2 = next;
        emit2({ type: next ? "compositionstart" : "compositionend" });
      },
      composing: () => composing2,
      // Frameworks render each token's content into its host.
      hosts: () => {
        var _a3;
        return (_a3 = view2 == null ? void 0 : view2.hosts()) != null ? _a3 : [];
      },
      setCustom: (custom) => store.set({ custom }),
      text: () => toText(store.get().value, codec()),
      reset() {
        if (!keepsValueOnReset(options().value, options().defaultValue)) {
          commit2(store.get().initial, {
            reason: "reset",
            selection: caretAt(0)
          });
        }
      },
      setFormDisabled: (formDisabled) => store.set({ formDisabled }),
      restore: (saved) => commit2(codec().parse(saved), { reason: "restore" })
    }
  };
  return api;
}
var tokenInputApi = tokenInputApiBody;

// node_modules/@ui-sdk/core/dist/components/token-input/token-input.js
var valueAttribute = (attribute) => attribute === null ? void 0 : fromText(attribute);
var tokenInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "token-input",
  options: {
    value: valueAttribute,
    defaultValue: "value",
    onValueChange: "callback",
    onSubmit: "callback",
    submitShortcut: "string",
    tokenDeletion: "string",
    copy: "string",
    codec: "value",
    getTokenDescription: "value",
    history: "value",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value"
  },
  state: initialTokenInputState,
  live: ["selected"],
  sync: syncTokenInputState,
  api: tokenInputApi,
  slots: (slot) => tokenInputSlots(slot),
  agent: { actions: ["setValue", "insert", "removeToken", "clear"] }
});
var tokenInput = tokenInputPrimitive;

// node_modules/@ui-sdk/core/dist/foundation/lists/listbox-keyboard.js
var PAGE = 10;
function listStep(event, { apple: apple2 }) {
  const { key } = event;
  if (key === "ArrowDown") {
    return event.metaKey ? "last" : 1;
  }
  if (key === "ArrowUp") {
    return event.metaKey ? "first" : -1;
  }
  if (key === "PageDown") {
    return PAGE;
  }
  if (key === "PageUp") {
    return -PAGE;
  }
  const emacs = apple2 && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
  if (emacs && key === "n") {
    return 1;
  }
  if (emacs && key === "p") {
    return -1;
  }
}

// node_modules/@ui-sdk/core/dist/foundation/popups/popup.js
init_events();

// node_modules/@ui-sdk/core/dist/foundation/platform/layers.js
init_events();

// node_modules/@ui-sdk/core/dist/foundation/platform/scrollbar.js
function onScrollbar(point, box) {
  const { x, y } = point;
  const { borders } = box;
  const inBorders = x >= borders.left && x < box.width - borders.right && y >= borders.top && y < box.height - borders.bottom;
  const inPadding = x >= box.clientLeft && x < box.clientLeft + box.clientWidth && y >= box.clientTop && y < box.clientTop + box.clientHeight;
  return inBorders && !inPadding;
}
function pressedScrollbar(event, target) {
  if (!(target instanceof Element)) {
    return false;
  }
  const doc = target.ownerDocument;
  if (target === doc.documentElement) {
    return event.clientX >= target.clientWidth || event.clientY >= target.clientHeight;
  }
  if (target.clientWidth === 0 && target.clientHeight === 0) {
    return false;
  }
  const rect = target.getBoundingClientRect();
  const style = getComputedStyle(target);
  return onScrollbar(
    { x: event.clientX - rect.left, y: event.clientY - rect.top },
    {
      width: rect.width,
      height: rect.height,
      clientLeft: target.clientLeft,
      clientTop: target.clientTop,
      clientWidth: target.clientWidth,
      clientHeight: target.clientHeight,
      borders: {
        top: parseFloat(style.borderTopWidth) || 0,
        right: parseFloat(style.borderRightWidth) || 0,
        bottom: parseFloat(style.borderBottomWidth) || 0,
        left: parseFloat(style.borderLeftWidth) || 0
      }
    }
  );
}

// node_modules/@ui-sdk/core/dist/foundation/platform/layers.js
var _a, _b;
var realm = (_b = globalThis[_a = /* @__PURE__ */ Symbol.for("ui-sdk.layers@2")]) != null ? _b : globalThis[_a] = {
  stack: [],
  listening: /* @__PURE__ */ new Map()
};
function persistent() {
  var _a3;
  return (_a3 = realm.persistent) != null ? _a3 : realm.persistent = /* @__PURE__ */ new Set();
}
function inPersistentLayer(target) {
  for (const el of persistent()) {
    if (composedContains(el, target)) {
      return true;
    }
  }
  return false;
}
function persistentLayers() {
  return [...persistent()].filter((el) => el.isConnected);
}
function layerCount() {
  var _a3;
  return (_a3 = realm.pushed) != null ? _a3 : 0;
}
function openedSince(order) {
  return active().some((layer) => {
    var _a3;
    return ((_a3 = layer.order) != null ? _a3 : 0) > order;
  });
}
function active() {
  return realm.stack.filter((layer) => layer.active());
}
function activeLayers() {
  return active();
}
function lastEscape() {
  var _a3;
  return (_a3 = realm.escapeAt) != null ? _a3 : -Infinity;
}
function insideTree(layer, target, event) {
  return insideTreeAt(layer, composedHops(target), event);
}
function insideTreeAt(layer, hops, event) {
  if (hops.some((hop) => layer.contains(hop, event))) {
    return true;
  }
  return active().some(
    (other) => other.parent === layer && insideTreeAt(other, hops, event)
  );
}
function listen(doc, win) {
  let swallowClick = false;
  let touch2;
  let pending2;
  function plan(event, target, point) {
    var _a3, _b3;
    const dismissed = [];
    let consume = false;
    if (inPersistentLayer(target)) {
      return { dismissed, consume };
    }
    for (const layer of [...realm.stack].reverse()) {
      if (layer.active()) {
        if (insideTree(layer, target, event)) {
          break;
        }
        if (layer.modal !== false) {
          consume = true;
        }
        dismissed.push(layer);
        if (layer.shield) {
          break;
        }
      } else if ((_a3 = layer.exiting) == null ? void 0 : _a3.call(layer)) {
        if (insideTree(layer, target, event)) {
          break;
        }
        if (layer.modal === false) {
          continue;
        }
        if ((_b3 = layer.overBackdrop) == null ? void 0 : _b3.call(layer, point.x, point.y)) {
          consume = true;
        }
        break;
      }
    }
    return { dismissed, consume };
  }
  function dismiss(event, target, point) {
    var _a3;
    const { dismissed, consume } = plan(event, target, point);
    for (const layer of dismissed) {
      (_a3 = layer.onOutsidePress) == null ? void 0 : _a3.call(layer, event);
    }
    return consume;
  }
  const offPointerDown = on(
    win,
    "pointerdown",
    (event) => {
      var _a3, _b3;
      swallowClick = false;
      const target = event.composedPath()[0];
      if (event.pointerType === "touch") {
        touch2 = { x: event.clientX, y: event.clientY, target };
        return;
      }
      touch2 = void 0;
      pending2 = void 0;
      if (pressedScrollbar(event, target)) {
        return;
      }
      const point = { x: event.clientX, y: event.clientY };
      const { dismissed, consume } = plan(event, target, point);
      if (((_a3 = dismissed[0]) == null ? void 0 : _a3.outsidePress) === "click") {
        if (event.button !== 0) {
          return;
        }
        pending2 = { layer: dismissed[0], target, point };
        if (consume) {
          event.preventDefault();
          swallowClick = true;
        }
        return;
      }
      if (consume) {
        event.preventDefault();
        swallowClick = true;
      }
      for (const layer of dismissed) {
        (_b3 = layer.onOutsidePress) == null ? void 0 : _b3.call(layer, event);
      }
    },
    { capture: true }
  );
  const offPointerUp = on(
    win,
    "pointerup",
    (event) => {
      const press2 = pending2;
      pending2 = void 0;
      if (!press2 || !press2.layer.active()) {
        return;
      }
      if (insideTree(press2.layer, event.composedPath()[0], event)) {
        return;
      }
      dismiss(event, press2.target, press2.point);
    },
    { capture: true }
  );
  const offClick = on(
    win,
    "click",
    (event) => {
      if (swallowClick && event.detail) {
        swallowClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      swallowClick = false;
      if (!touch2) {
        return;
      }
      const press2 = touch2;
      touch2 = void 0;
      if (Math.hypot(event.clientX - press2.x, event.clientY - press2.y) > 10) {
        return;
      }
      if (dismiss(event, press2.target, { x: press2.x, y: press2.y })) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true }
  );
  const offKey = on(doc, "keydown", (event) => escapeTop(doc, event));
  const offBlur = on(win, "blur", (event) => {
    var _a3;
    for (const layer of active().reverse()) {
      (_a3 = layer.onBlur) == null ? void 0 : _a3.call(layer, event);
    }
  });
  return () => {
    offPointerDown();
    offPointerUp();
    offKey();
    offBlur();
    if (!swallowClick) {
      return offClick();
    }
    const off = () => (offClick(), offNext(), offSwallowed());
    const offNext = on(win, "pointerdown", off, { capture: true });
    const offSwallowed = on(win, "click", off, { capture: true });
  };
}
function layerContains(layer, target) {
  return insideTree(layer, target);
}
function findLayer(target) {
  const hops = composedHops(target);
  return active().reverse().find((layer) => hops.some((hop) => layer.contains(hop)));
}
function markClosed(target) {
  realm.closed = target;
  setTimeout(() => {
    if (realm.closed === target) {
      realm.closed = void 0;
    }
  });
}
function lastClosed() {
  return realm.closed;
}
function report() {
  if (!dev) {
    return;
  }
  emit({
    type: "layers",
    stack: realm.stack.map((layer) => {
      var _a3, _b3;
      return {
        component: (_a3 = layer.component) != null ? _a3 : "popup",
        id: (_b3 = layer.id) != null ? _b3 : "",
        modal: layer.modal,
        blocking: !!layer.blocking,
        el: layer.el
      };
    })
  });
}
function listenIn(doc) {
  const win = doc.defaultView;
  if (!win) {
    return () => {
    };
  }
  let entry = realm.listening.get(doc);
  if (!entry) {
    realm.listening.set(doc, entry = { layers: 0, stop: listen(doc, win) });
  }
  const current = entry;
  current.layers++;
  return () => {
    if (--current.layers > 0) {
      return;
    }
    realm.listening.delete(doc);
    current.stop();
  };
}
function documentOf(layer) {
  var _a3, _b3;
  return (_b3 = (_a3 = layer.el) == null ? void 0 : _a3.ownerDocument) != null ? _b3 : document;
}
function escapeTop(doc, event, from) {
  if (event.key !== "Escape" || event.defaultPrevented || isComposing(event)) {
    return;
  }
  const top = active().filter((layer) => documentOf(layer) === doc).at(-1);
  if (!(top == null ? void 0 : top.onEscape) || from && top !== from) {
    return;
  }
  realm.escapeAt = performance.now();
  top.onEscape(event);
}
function escapeLayer(layer, event) {
  escapeTop(documentOf(layer), event, layer);
}
function pushLayer(layer) {
  var _a3;
  realm.pushed = ((_a3 = realm.pushed) != null ? _a3 : 0) + 1;
  layer.order = realm.pushed;
  realm.stack.push(layer);
  const stopListening = listenIn(documentOf(layer));
  report();
  let popped = false;
  return () => {
    if (popped) {
      return;
    }
    popped = true;
    const index = realm.stack.indexOf(layer);
    if (index !== -1) {
      realm.stack.splice(index, 1);
    }
    stopListening();
    report();
  };
}

// node_modules/@ui-sdk/core/dist/foundation/popups/modal.js
init_events();
init_env();
init_style();
var _a2, _b2;
var shared = (_b2 = globalThis[_a2 = /* @__PURE__ */ Symbol.for("ui-sdk.modal@2")]) != null ? _b2 : globalThis[_a2] = {
  holders: /* @__PURE__ */ new WeakMap(),
  thaw: /* @__PURE__ */ new WeakMap(),
  inert: /* @__PURE__ */ new WeakMap()
};
function lockScroll(doc = document, modal) {
  const token = {};
  let tokens = shared.holders.get(doc);
  if (!tokens) {
    shared.holders.set(doc, tokens = /* @__PURE__ */ new Set());
  }
  if (!tokens.size) {
    shared.thaw.set(doc, freezeScroller(doc));
  }
  tokens.add(token);
  const unguard = modal && isIOS() ? guardTouch(modal) : void 0;
  return () => {
    var _a3;
    if (!tokens.delete(token)) {
      return;
    }
    unguard == null ? void 0 : unguard();
    if (tokens.size) {
      return;
    }
    (_a3 = shared.thaw.get(doc)) == null ? void 0 : _a3();
    shared.thaw.delete(doc);
  };
}
function scrollLockStyles({
  scrollbar,
  gutter,
  padding
}) {
  const styles = {
    overflow: "hidden",
    // Smooth scrolling would animate when the lock lifts.
    "scroll-behavior": "auto"
  };
  if (scrollbar > 0) {
    if (gutter) {
      styles["scrollbar-gutter"] = "stable";
    } else {
      styles["padding-right"] = `${padding + scrollbar}px`;
    }
  }
  return styles;
}
function freezeScroller(doc) {
  var _a3;
  const { scroller, gutter, padding } = (_a3 = early.get(doc)) != null ? _a3 : measureScroller(doc);
  const styles = scrollLockStyles({
    scrollbar: gutter,
    gutter: typeof CSS !== "undefined" && CSS.supports("scrollbar-gutter", "stable"),
    padding
  });
  const restores = Object.entries(styles).map(
    ([name, value]) => setStyle(scroller, name, value)
  );
  if (gutter > 0) {
    restores.push(
      setStyle(doc.documentElement, "--scrollbar-width", `${gutter}px`)
    );
  }
  return () => restores.forEach((restore) => restore());
}
var early = /* @__PURE__ */ new WeakMap();
function measureScroller(doc) {
  var _a3;
  const view2 = (_a3 = doc.defaultView) != null ? _a3 : window;
  const scroller = documentScroller(doc, view2);
  const computed = view2.getComputedStyle(scroller);
  return {
    scroller,
    gutter: gutterWidth(scroller, doc, view2, computed),
    padding: parseFloat(computed.paddingRight) || 0
  };
}
function documentScroller(doc, view2) {
  const { body, documentElement: root } = doc;
  if (!body || view2.getComputedStyle(root).overflowY === "visible") {
    return root;
  }
  return /auto|scroll/.test(view2.getComputedStyle(body).overflowY) ? body : root;
}
function gutterWidth(scroller, doc, view2, computed) {
  if (scroller === doc.documentElement) {
    return view2.innerWidth - scroller.clientWidth;
  }
  const borders = (parseFloat(computed.borderLeftWidth) || 0) + (parseFloat(computed.borderRightWidth) || 0);
  return scroller.offsetWidth - scroller.clientWidth - borders;
}
function canScroll(el, view2) {
  const style = view2.getComputedStyle(el);
  const vertical = /auto|scroll/.test(style.overflowY) && el.scrollHeight > el.clientHeight;
  const horizontal = /auto|scroll/.test(style.overflowX) && el.scrollWidth > el.clientWidth;
  return vertical || horizontal;
}
function insideScroller(el, view2) {
  const { body, documentElement } = el.ownerDocument;
  for (let node = el; node && node !== body && node !== documentElement; node = node.parentElement) {
    if (canScroll(node, view2)) {
      return true;
    }
  }
  return false;
}
function touchOwner(start) {
  if (start.fingers > 1 || start.zoomed) {
    return "browser";
  }
  if (start.scroller || start.slider || start.selecting) {
    return "element";
  }
  return "page";
}
var guardRule = "@layer ui-sdk { [data-scroll-guard], [data-scroll-guard] * { overscroll-behavior: contain } }";
function guardTouch(modal) {
  var _a3;
  const doc = modal.ownerDocument;
  const view2 = (_a3 = doc.defaultView) != null ? _a3 : window;
  writeStyle(doc, "ui-sdk-scroll-guard", guardRule);
  const marked = !modal.hasAttribute("data-scroll-guard");
  if (marked) {
    modal.setAttribute("data-scroll-guard", "");
  }
  let owner3 = "browser";
  const offStart = on(
    doc,
    "touchstart",
    (event) => {
      var _a4, _b3, _c;
      const target = event.target instanceof Element ? event.target : null;
      owner3 = touchOwner({
        fingers: event.touches.length,
        zoomed: ((_b3 = (_a4 = view2.visualViewport) == null ? void 0 : _a4.scale) != null ? _b3 : 1) !== 1,
        scroller: !!target && insideScroller(target, view2),
        slider: !!(target == null ? void 0 : target.closest('input[type="range"]')),
        selecting: ((_c = doc.getSelection()) == null ? void 0 : _c.type) === "Range"
      });
    },
    { capture: true, passive: true }
  );
  const offMove = on(
    doc,
    "touchmove",
    (event) => {
      if (owner3 === "page" && event.cancelable) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
  return () => {
    offStart();
    offMove();
    if (marked) {
      modal.removeAttribute("data-scroll-guard");
    }
  };
}
var liveRegions = '[aria-live]:not([aria-live="off"]),[role="status"],[role="alert"],[role="log"],output';
function parentOf(node) {
  const parent = node.parentNode;
  return parent instanceof ShadowRoot ? parent.host : parent;
}
function applyInert(keep2) {
  var _a3, _b3, _c, _d, _e;
  const doc = (_b3 = (_a3 = keep2[0]) == null ? void 0 : _a3.ownerDocument) != null ? _b3 : document;
  const all = [
    ...keep2,
    ...Array.from(doc.querySelectorAll(liveRegions)),
    ...persistentLayers()
  ];
  const targets = all.filter(
    (el) => !all.some((other) => other !== el && other.contains(el))
  );
  const keepSet = /* @__PURE__ */ new Set();
  for (const el of targets) {
    for (let node = el; node; node = parentOf(node)) {
      keepSet.add(node);
    }
  }
  const changed = [];
  for (const el of targets) {
    for (let node = el; node && node !== doc.body; node = parentOf(node)) {
      for (const sibling of Array.from(
        (_d = (_c = node.parentNode) == null ? void 0 : _c.children) != null ? _d : []
      )) {
        if (keepSet.has(sibling) || !(sibling instanceof HTMLElement)) {
          continue;
        }
        const count2 = (_e = shared.inert.get(sibling)) != null ? _e : sibling.inert ? Infinity : 0;
        if (count2 === 0) {
          sibling.inert = true;
        }
        if (count2 !== Infinity) {
          shared.inert.set(sibling, count2 + 1);
        }
        changed.push(sibling);
      }
    }
  }
  return () => {
    for (const el of changed) {
      const count2 = shared.inert.get(el);
      if (count2 === void 0) {
        continue;
      }
      if (count2 <= 1) {
        el.inert = false;
        shared.inert.delete(el);
      } else {
        shared.inert.set(el, count2 - 1);
      }
    }
  };
}
function inertOutside(keep2) {
  let current = keep2;
  let release2 = applyInert(current);
  let done = false;
  const swap = (next) => {
    const previous = release2;
    current = next;
    release2 = applyInert(next);
    previous();
  };
  return Object.assign(
    () => {
      if (done) {
        return;
      }
      done = true;
      release2();
    },
    {
      keep(el) {
        if (done) {
          return () => {
          };
        }
        swap([...current, el]);
        return () => {
          if (!done) {
            swap(current.filter((node) => node !== el));
          }
        };
      }
    }
  );
}

// node_modules/@ui-sdk/core/dist/foundation/popups/popup.js
init_env();
init_style();

// node_modules/@ui-sdk/core/dist/foundation/popups/popup-behavior.js
var plain = {
  tab: "close",
  blur: "always",
  outsidePress: "pointerdown",
  shield: false,
  keepTrigger: true,
  focusOnMount: false,
  dismissOnFocusLoss: true,
  closeWatcher: false,
  blocking: false,
  movesFocus: true
};
var trapOrFlow = (modal) => modal.trapFocus ? "trap" : "flow";
var popupPresets = {
  // Tab closes it, like a native menu, and so does the window losing focus.
  menu: plain,
  // Like a native select: Tab closes it and focus moves on from the trigger.
  select: plain,
  // Focus stays in the input while the list is open, so Tab is the browser's.
  // The combobox closes the list itself when focus leaves its input.
  combobox: { ...plain, tab: "native" },
  // Part of the page's Tab order unless modal, and it stays open while you
  // switch windows, so work in it can continue.
  popover: { ...plain, tab: trapOrFlow, blur: "iframe" },
  // Waits for the user whatever has focus. A modal one shields the layers
  // beneath, holds focus from the start, keeps its trigger inert, pauses the
  // page's shortcuts and closes on Android's back. Outside presses count once
  // released, so a text selection dragged out of a field doesn't close it.
  dialog: {
    ...plain,
    tab: trapOrFlow,
    blur: "never",
    outsidePress: "click",
    shield: true,
    keepTrigger: false,
    focusOnMount: true,
    dismissOnFocusLoss: false,
    closeWatcher: true,
    blocking: (modal) => modal.inertAndLock
  },
  // Never takes focus and has nothing to Tab to, so the browser moves focus
  // past it. Escape and an outside press close it, and so does leaving the window.
  tooltip: { ...plain, tab: "native", movesFocus: false },
  // Part of the page's Tab order after its trigger, like a non-modal popover,
  // and focus leaving closes it. It's a passing preview, so leaving the window does too.
  hoverCard: { ...plain, tab: "flow" },
  // Site navigation: Tab flows from a trigger into its panel and on to the
  // next item, focus leaving the navigation closes it, and switching windows
  // leaves it as it was.
  navigationMenu: { ...plain, tab: "flow", blur: "never" }
};
function resolveBehavior(preset, overrides) {
  const behavior = { ...popupPresets[preset] };
  for (const key of Object.keys(plain)) {
    const value = overrides[key];
    if (value !== void 0) {
      Object.assign(behavior, { [key]: value });
    }
  }
  return behavior;
}

// node_modules/@ui-sdk/core/dist/foundation/popups/popup-elements.js
var registry = () => {
  var _a3, _b3;
  return (_b3 = globalThis[_a3 = /* @__PURE__ */ Symbol.for("ui-sdk.popup-elements@1")]) != null ? _b3 : globalThis[_a3] = /* @__PURE__ */ new WeakMap();
};
function registerPopupElement(el) {
  var _a3;
  const elements2 = registry();
  elements2.set(el, ((_a3 = elements2.get(el)) != null ? _a3 : 0) + 1);
  let done = false;
  return () => {
    var _a4;
    if (done) {
      return;
    }
    done = true;
    const count2 = ((_a4 = elements2.get(el)) != null ? _a4 : 1) - 1;
    if (count2 > 0) {
      elements2.set(el, count2);
    } else {
      elements2.delete(el);
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/popups/frame-guards.js
init_events();

// node_modules/@ui-sdk/core/dist/foundation/focus/tabbable.js
var candidates = [
  "a[href]",
  "area[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "iframe",
  "summary",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]"
].join(",");
function isTabbable(el) {
  if (!(el instanceof HTMLElement) || el.tabIndex < 0) {
    return false;
  }
  if (el.matches(":disabled") || el.closest("[inert]")) {
    return false;
  }
  const group = el.checked ? [] : radioGroup(el);
  if (group.some((radio) => radio.checked && isTabbable(radio))) {
    return false;
  }
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({ visibilityProperty: true });
  }
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
}
function radioGroup(el) {
  if (!(el instanceof HTMLInputElement) || el.type !== "radio" || !el.name) {
    return [];
  }
  const scope = el.form ? Array.from(el.form.elements) : Array.from(
    el.getRootNode().querySelectorAll(
      `input[name="${CSS.escape(el.name)}"]`
    )
  );
  return scope.filter(
    (radio) => radio instanceof HTMLInputElement && radio.type === "radio" && radio.name === el.name && radio.form === el.form
  );
}
function tabbables(root) {
  return Array.from(root.querySelectorAll(candidates)).filter(isTabbable);
}
function composedTabbables(root) {
  const ordered = (scope) => [
    ...scope.filter((entry) => entry.index > 0).sort((a, b) => a.index - b.index),
    ...scope.filter((entry) => entry.index <= 0)
  ].flatMap((entry) => entry.stops);
  const walk = (nodes, scope) => {
    var _a3, _b3, _c;
    for (const el of nodes) {
      const index = el.hasAttribute("tabindex") ? el.tabIndex : 0;
      if (el.hasAttribute("inert") || el.shadowRoot && index < 0) {
        continue;
      }
      const stops = el.matches(candidates) && !((_a3 = el.shadowRoot) == null ? void 0 : _a3.delegatesFocus) && isTabbable(el) ? [el] : [];
      const slotted = el instanceof HTMLSlotElement ? el.assignedElements() : [];
      if (el.shadowRoot || slotted.length) {
        const inner = [];
        walk((_c = (_b3 = el.shadowRoot) == null ? void 0 : _b3.children) != null ? _c : slotted, inner);
        scope.push({ index, stops: [...stops, ...ordered(inner)] });
      } else {
        scope.push({ index, stops });
        walk(el.children, scope);
      }
    }
  };
  const top = [];
  walk(root.children, top);
  return top.flatMap((entry) => entry.stops);
}
function positiveTabStops(stops, root) {
  const slotted = (el) => {
    for (let node = el; node && node !== root; node = node.parentElement) {
      if (node.assignedSlot) {
        return true;
      }
    }
    return false;
  };
  return stops.filter((el) => el.tabIndex > 0 && !slotted(el)).sort((a, b) => a.tabIndex - b.tabIndex);
}
function nextTabbable(node, skip) {
  var _a3;
  const doc = (_a3 = node.ownerDocument) != null ? _a3 : document;
  return tabbables(doc.body).find(
    (el) => !el.contains(node) && !(skip == null ? void 0 : skip.contains(el)) && isAfter(node, el)
  );
}

// node_modules/@ui-sdk/core/dist/foundation/popups/frame-guards.js
var hidden = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;outline:none";
function guardFrames(popup, trapping) {
  var _a3;
  const doc = popup.ownerDocument;
  let frame;
  let guards = [];
  const remove = () => {
    guards.forEach((guard2) => guard2.remove());
    guards = [];
    frame = void 0;
  };
  const guard = () => {
    const el = doc.createElement("span");
    el.tabIndex = 0;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = hidden;
    return el;
  };
  const watch = () => {
    const active2 = doc.activeElement;
    if (guards.length || !trapping() || !(active2 instanceof HTMLIFrameElement) || !popup.contains(active2)) {
      return;
    }
    frame = active2;
    guards = [guard(), guard()];
    active2.before(guards[0]);
    active2.after(guards[1]);
  };
  const later2 = () => {
    watch();
    setTimeout(watch);
  };
  const offBlur = on((_a3 = doc.defaultView) != null ? _a3 : window, "blur", later2);
  const offFocusOut = on(doc, "focusout", later2);
  const offFocus = on(doc, "focusin", (event) => {
    const side = guards.indexOf(event.target);
    const from = frame;
    remove();
    if (side < 0 || !from) {
      return;
    }
    const stops = tabbables(popup);
    const step = side === 0 ? -1 : 1;
    const next = stops.at((stops.indexOf(from) + step) % stops.length);
    (next != null ? next : popup).focus({ preventScroll: true });
  });
  return () => {
    offBlur();
    offFocusOut();
    offFocus();
    remove();
  };
}

// node_modules/@ui-sdk/core/dist/foundation/popups/popup.js
function modalTriple(modal) {
  return {
    consumeOutsidePress: modal === true || modal === "pointer",
    trapFocus: modal === true || modal === "trap-focus",
    inertAndLock: modal === true
  };
}
function initialFocusPlan(opener) {
  if (opener === "initial" || opener === "hover") {
    return "none";
  }
  if (opener === "touch") {
    return "popup";
  }
  return "auto";
}
function outsidePressFocus(press2) {
  if (press2.focusable && !press2.consumed) {
    return false;
  }
  return press2.type === "pointerdown" ? "later" : true;
}
var selectableTypes = /* @__PURE__ */ new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password"
]);
function selectFilled(el) {
  if (el.localName === "input" && selectableTypes.has(el.type) && el.value && el.getAttribute("aria-expanded") !== "true") {
    ;
    el.select();
  }
}
function firstUsable(candidates2, usable2) {
  for (const candidate of candidates2) {
    const value = candidate();
    if (value && usable2(value)) {
      return value;
    }
  }
}
function deriveOpen(context2, keys, derive) {
  deriveFromOptions(
    context2,
    keys,
    (synced, state) => "open" in synced && synced.open !== state.open ? derive(!!synced.open, state) : void 0
  );
}
function popupContentAttrs(state, id) {
  return {
    id: `${id}-content`,
    tabindex: "-1",
    hidden: state.mounted ? void 0 : "",
    ...openAttrs(state.open)
  };
}
var focusableSelector = "a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]";
function resolveTarget(target, root) {
  var _a3, _b3;
  if (typeof target === "function") {
    return (_a3 = target()) != null ? _a3 : void 0;
  }
  if (typeof target === "string") {
    return (_b3 = root.querySelector(target)) != null ? _b3 : void 0;
  }
  return target;
}
function usable(el) {
  return el.isConnected && !el.closest("[inert]");
}
function readCaret(selection) {
  const range = selection.getRangeAt(0).cloneRange();
  const backward = !range.collapsed && selection.anchorNode === range.endContainer && selection.anchorOffset === range.endOffset;
  return { range, backward };
}
function focusIsLost() {
  var _a3;
  const active2 = activeElement();
  return !active2 || active2 === active2.ownerDocument.body || !usable(active2) || ((_a3 = active2.checkVisibility) == null ? void 0 : _a3.call(active2)) === false;
}
function outsideBox(point, rect) {
  return point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom;
}
function focusedFrom(el) {
  return el.getRootNode().activeElement;
}
function watchClose(close) {
  const Watcher = globalThis.CloseWatcher;
  if (!Watcher || !/Android/.test(navigator.userAgent)) {
    return;
  }
  let watcher;
  try {
    watcher = new Watcher();
  } catch {
    return;
  }
  watcher.addEventListener("close", (event) => {
    if (performance.now() - lastEscape() < 100) {
      return;
    }
    close(event);
  });
  return () => watcher == null ? void 0 : watcher.destroy();
}
var layerParts = /* @__PURE__ */ new WeakMap();
var freezing = /* @__PURE__ */ new WeakSet();
var showsAgain = /* @__PURE__ */ new WeakMap();
function above(layer, modal) {
  var _a3, _b3;
  for (let up = layer; up; up = up.parent) {
    if (up === modal || freezing.has(up) && ((_a3 = up.order) != null ? _a3 : 0) > ((_b3 = modal.order) != null ? _b3 : 0)) {
      return true;
    }
  }
  return false;
}
function createPopupLayer(options) {
  var _a3;
  const behavior = resolveBehavior(options.preset, options);
  const tabMode = () => typeof behavior.tab === "function" ? behavior.tab(options.modal()) : behavior.tab;
  const { store } = options;
  let bound;
  let shown;
  let layer;
  let stopExit;
  let releaseInert;
  let releaseWatcher;
  let opener = store.get().open ? "initial" : "imperative";
  let focusPending = behavior.focusOnMount && store.get().open;
  let enterPending = false;
  let openedOnPress = false;
  let openedByKey = false;
  let returnMode = true;
  let before;
  let caret;
  let openedWithoutTrigger = store.get().open;
  let upstream = () => void 0;
  let path = [];
  const returnTrigger = (_a3 = options.returnTrigger) != null ? _a3 : options.trigger;
  let place2;
  let checkPlacement;
  let remodal;
  let observer;
  const complete = (open, closed) => {
    var _a4;
    return (_a4 = options.onOpenChangeComplete) == null ? void 0 : _a4.call(options, open, closed);
  };
  const mountedAs = (open) => open || !!(shown == null ? void 0 : shown.el) && isBrowser;
  deriveOpen(
    { store },
    ["mounted"],
    (open) => mountedAs(open) === open ? { mounted: open } : void 0
  );
  function openedFrom(focused) {
    var _a4;
    before = focused;
    const selection = (focused == null ? void 0 : focused.isContentEditable) ? focused.ownerDocument.getSelection() : null;
    caret = (selection == null ? void 0 : selection.rangeCount) && focused.contains(selection.anchorNode) ? readCaret(selection) : void 0;
    const openerLayer = before && findLayer(before);
    const openerTarget = openerLayer ? void 0 : lastClosed();
    upstream = (_a4 = openerLayer == null ? void 0 : openerLayer.returnTarget) != null ? _a4 : (() => openerTarget);
  }
  let wasOpen = store.get().open;
  store.subscribe(() => {
    var _a4, _b3, _c, _d, _e;
    const { open } = store.get();
    if (open === wasOpen) {
      return;
    }
    wasOpen = open;
    if (open) {
      observer == null ? void 0 : observer(true);
      (_a4 = options.onOpenChange) == null ? void 0 : _a4.call(options, true);
      stopExit == null ? void 0 : stopExit();
      stopExit = void 0;
      if (shown) {
        for (const part of [shown.el, shown.backdrop]) {
          if (part) {
            writeOpen(part, true);
          }
        }
      }
      focusPending = true;
      enterPending = true;
      returnMode = true;
      const active22 = isBrowser ? activeElement() : null;
      openedFrom(
        active22 && active22 !== active22.ownerDocument.body ? active22 : void 0
      );
      const trigger2 = returnTrigger();
      openedWithoutTrigger = opener === "imperative" || openedByKey && !!before && !findLayer(before) && !lastClosed() && !(trigger2 && composedContains(trigger2, before));
      const exiting2 = !!shown;
      store.set({ mounted: true });
      if (bound) {
        if (exiting2) {
          hide();
        }
        show();
      } else if (!isBrowser) {
        enterPending = false;
        complete(true);
      }
      return;
    }
    const mode = behavior.movesFocus && returnMode;
    returnMode = true;
    focusPending = false;
    enterPending = false;
    opener = "imperative";
    openedByKey = false;
    const closed = observer == null ? void 0 : observer(false);
    const el = shown == null ? void 0 : shown.el;
    if (layer) {
      markClosed(returnTarget());
    }
    const from = upstream;
    const range = caret;
    caret = void 0;
    if (!el || !isBrowser) {
      (_b3 = options.onOpenChange) == null ? void 0 : _b3.call(options, false, closed);
      store.set({ mounted: false });
      complete(false, closed);
      return;
    }
    const active2 = activeElement();
    const trigger = options.trigger();
    const hadFocus = !active2 || active2 === el.ownerDocument.body || composedContains(el, active2) || !!layer && layerContains(layer, active2) && !(trigger && composedContains(trigger, active2));
    (_c = options.onOpenChange) == null ? void 0 : _c.call(options, false, closed);
    (_e = bound == null ? void 0 : (_d = bound.config).onClose) == null ? void 0 : _e.call(_d);
    const order = layerCount();
    const exiting = [el, ...(shown == null ? void 0 : shown.backdrop) ? [shown.backdrop] : []];
    let left = exiting.length;
    const stops = exiting.map((target) => {
      writeOpen(target, false);
      return animateOut(target, () => {
        if (--left > 0) {
          return;
        }
        stopExit = void 0;
        store.set({ mounted: false });
        hide();
        complete(false, closed);
      });
    });
    if (left > 0) {
      stopExit = () => stops.forEach((stop) => stop());
    }
    releaseInert == null ? void 0 : releaseInert();
    releaseInert = void 0;
    releaseWatcher == null ? void 0 : releaseWatcher();
    releaseWatcher = void 0;
    if (!mode || !hadFocus) {
      return;
    }
    if (mode === true) {
      returnFocus(el, from, false, range);
      const target = activeElement();
      setTimeout(() => {
        if (target && !target.isConnected && focusIsLost() && !openedSince(order)) {
          returnFocus(el, from);
        }
      });
      return;
    }
    if (mode === "unless-moved") {
      queueMicrotask(() => {
        const now = activeElement();
        const moved = !!now && now !== el.ownerDocument.body && !composedContains(el, now);
        if (!moved && !openedSince(order)) {
          returnFocus(el, from, false, range);
        }
      });
      return;
    }
    const settle = () => {
      off();
      clearTimeout(fallback);
      setTimeout(() => {
        const active22 = activeElement();
        if (!active22 || active22 === el.ownerDocument.body) {
          returnFocus(el, from, false, range);
        }
      });
    };
    const off = on(window, "pointerup", settle, { capture: true });
    const fallback = setTimeout(settle, 1e3);
  });
  function returnChain(el, take, from = upstream, strict = false) {
    const inherited = () => from(take, strict);
    const nearby = () => neighbour(el, strict);
    return openedWithoutTrigger ? [() => before, inherited, returnTrigger, nearby, options.trigger] : [returnTrigger, () => before, inherited, nearby, options.trigger];
  }
  let resolving = false;
  function returnTarget(take = usable, strict = false) {
    if (resolving) {
      return;
    }
    resolving = true;
    try {
      return firstUsable(returnChain(shown == null ? void 0 : shown.el, take, upstream, strict), take);
    } finally {
      resolving = false;
    }
  }
  function neighbour(el, strict = false) {
    var _a4, _b3, _c, _d;
    const trigger = (_a4 = path[0]) == null ? void 0 : _a4.node;
    if ((trigger == null ? void 0 : trigger.isConnected) && !(el == null ? void 0 : el.contains(trigger))) {
      for (const node of [
        ...path.slice(1).map((step) => step.node),
        trigger.ownerDocument.body
      ]) {
        const list = tabbables(node).filter(
          (candidate) => !(el == null ? void 0 : el.contains(candidate))
        );
        const found2 = (_b3 = list.find(
          (candidate) => isAfter(trigger, candidate) && !trigger.contains(candidate)
        )) != null ? _b3 : list.filter((candidate) => isAfter(candidate, trigger)).pop();
        if (found2) {
          return found2;
        }
      }
      return;
    }
    const index = path.findIndex(
      (step, i) => {
        var _a5;
        return !step.node.isConnected && ((_a5 = path[i + 1]) == null ? void 0 : _a5.node.isConnected);
      }
    );
    if (index === -1) {
      return;
    }
    const { next, previous } = path[index];
    const parent = path[index + 1].node;
    const inPlace = (sibling) => !!(sibling == null ? void 0 : sibling.isConnected) && sibling.parentNode === parent;
    const closed = inPlace(next) ? next.previousElementSibling === previous : !next && (previous ? inPlace(previous) && !previous.nextElementSibling : !parent.firstElementChild);
    if (strict && !closed) {
      return;
    }
    const from = (node, candidate) => node.contains(candidate) || isAfter(node, candidate);
    const after = inPlace(next) ? (candidate) => from(next, candidate) : inPlace(previous) ? (candidate) => isAfter(previous, candidate) && !previous.contains(candidate) : (candidate) => from(parent, candidate);
    for (const { node } of path.slice(index + 1)) {
      const list = tabbables(node).filter(
        (candidate) => !(el == null ? void 0 : el.contains(candidate))
      );
      const prior = inPlace(previous) ? list.filter(
        (candidate) => !from(previous, candidate) || previous.contains(candidate)
      ).pop() : void 0;
      const found2 = (_d = (_c = list.find(after)) != null ? _c : prior) != null ? _d : list[0];
      if (found2) {
        return found2;
      }
    }
  }
  function returnFocus(el, from, strict = false, range, setting = ((_c) => (_c = ((_b3) => (_b3 = options.finalFocus) == null ? void 0 : _b3.call(options))()) != null ? _c : "trigger")()) {
    if (setting === "none") {
      return;
    }
    const take = (target) => {
      if (!usable(target) || el.contains(target)) {
        return false;
      }
      const selection = target.ownerDocument.getSelection();
      const kept = range && target === before ? (selection == null ? void 0 : selection.rangeCount) && target.contains(selection.anchorNode) ? readCaret(selection) : range : void 0;
      restoreFocus(target);
      if (activeElement() !== target) {
        return false;
      }
      if (kept && target.contains(kept.range.startContainer)) {
        const { startContainer, startOffset, endContainer, endOffset } = kept.range;
        if (kept.backward) {
          selection == null ? void 0 : selection.setBaseAndExtent(
            endContainer,
            endOffset,
            startContainer,
            startOffset
          );
        } else {
          selection == null ? void 0 : selection.setBaseAndExtent(
            startContainer,
            startOffset,
            endContainer,
            endOffset
          );
        }
      }
      return true;
    };
    const chain = returnChain(el, take, from, strict);
    if (setting !== "trigger") {
      chain.unshift(() => resolveTarget(setting, el.ownerDocument));
    }
    firstUsable(chain, take);
  }
  function initialFocus(resolve) {
    if (!focusPending || !shown || !store.get().open || !behavior.movesFocus) {
      return;
    }
    focusPending = false;
    const plan = opener === "initial" && behavior.focusOnMount ? "auto" : initialFocusPlan(opener);
    if (plan === "none") {
      return;
    }
    const run = () => {
      if (!shown || !store.get().open) {
        return;
      }
      const target = plan === "popup" ? shown.el : resolve == null ? void 0 : resolve();
      if (target) {
        moveFocus(target);
        selectFilled(target);
      }
    };
    if (openedOnPress) {
      requestAnimationFrame(run);
    } else {
      run();
    }
  }
  function attach2(el, config) {
    var _a4, _b3, _c, _d, _e, _f, _g, _h, _i;
    const cleanups = [];
    const trigger = options.trigger();
    const host = (_b3 = (_a4 = config.host) == null ? void 0 : _a4.call(config)) != null ? _b3 : el;
    if (opener === "initial" && !before) {
      const active2 = activeElement();
      openedFrom(
        active2 && active2 !== active2.ownerDocument.body && !composedContains(el, active2) ? active2 : void 0
      );
    }
    el.removeAttribute("hidden");
    host.removeAttribute("hidden");
    const backdrop = shown == null ? void 0 : shown.backdrop;
    if (backdrop) {
      const stop = showBackdrop(backdrop, config.inline);
      cleanups.push(() => {
        stop();
        hideBackdrop(backdrop);
      });
    }
    if (!config.inline) {
      host.setAttribute("popover", "manual");
      try {
        host.showPopover();
      } catch {
      }
    }
    if (config.position && options.position) {
      const placement2 = options.position(
        () => {
          var _a5, _b4;
          return (_b4 = (_a5 = config.anchor) == null ? void 0 : _a5.call(config)) != null ? _b4 : options.trigger();
        },
        el,
        config.position
      );
      place2 = placement2.place;
      checkPlacement = placement2.follow;
      cleanups.push(placement2, () => place2 = checkPlacement = void 0);
      if (config.rendered) {
        cleanups.push(config.rendered(placement2.follow));
      }
    }
    if (!config.inline && !supportsTopLayer() && !host.style.zIndex) {
      host.style.zIndex = "2147483000";
    }
    cleanups.push(
      animateIn(
        el,
        enterPending ? () => {
          enterPending = false;
          complete(true);
        } : void 0
      )
    );
    trackInput();
    let modal = options.modal();
    const blur = behavior.blur;
    const persistent2 = (_d = (_c = options.persistent) == null ? void 0 : _c.call(options)) != null ? _d : [];
    const pressedBackdrop = (target, event) => target === el && !!event && "clientX" in event && outsideBox(
      { x: event.clientX, y: event.clientY },
      el.getBoundingClientRect()
    );
    const returnsTo = (_e = returnTrigger()) != null ? _e : !trigger && (before == null ? void 0 : before.isConnected) ? before : void 0;
    if (returnsTo || !trigger) {
      path = [];
    }
    for (let node = returnsTo != null ? returnsTo : null; node && node !== el.ownerDocument.body; node = node.parentElement) {
      path.push({
        node,
        next: node.nextElementSibling,
        previous: node.previousElementSibling
      });
    }
    const own = {
      parent: (_g = (_f = options.parent) == null ? void 0 : _f.call(options)) != null ? _g : trigger && findLayer(trigger),
      active: () => store.get().open,
      exiting: () => !store.get().open && store.get().mounted,
      modal: modal.consumeOutsidePress,
      blocking: typeof behavior.blocking === "function" ? behavior.blocking(modal) : behavior.blocking,
      outsidePress: behavior.outsidePress,
      shield: behavior.shield,
      component: (_h = options.owner) == null ? void 0 : _h.component,
      id: (_i = options.owner) == null ? void 0 : _i.id,
      el,
      contains: (target, event) => {
        var _a5;
        return el.contains(target) && !pressedBackdrop(target, event) || persistent2.some((node) => node.contains(target)) || (options.contains ? options.contains(target, event) : !!((_a5 = options.trigger()) == null ? void 0 : _a5.contains(target)));
      },
      overBackdrop: (x, y) => !!(shown == null ? void 0 : shown.backdrop) && !outsideBox({ x, y }, shown.backdrop.getBoundingClientRect()) && outsideBox({ x, y }, el.getBoundingClientRect()),
      returnTarget,
      onOutsidePress: (event) => {
        var _a5;
        const target = event.composedPath()[0];
        options.close("outside-press", {
          event,
          focus: outsidePressFocus({
            type: event.type,
            focusable: !!((_a5 = target == null ? void 0 : target.closest) == null ? void 0 : _a5.call(target, focusableSelector)),
            consumed: modal.consumeOutsidePress
          })
        });
      },
      onEscape: (event) => {
        event.preventDefault();
        if (options.onEscape) {
          options.onEscape(event);
        } else {
          options.close("escape-key", { event, focus: true });
        }
      },
      onBlur: blur === "never" ? void 0 : blur === "always" ? (event) => options.close("window-blur", { event, focus: false }) : (
        // A click into an iframe never reaches the page.
        ((event) => setTimeout(() => {
          var _a5;
          const active2 = (_a5 = focusedFrom(el)) != null ? _a5 : el.ownerDocument.activeElement;
          if ((active2 == null ? void 0 : active2.tagName) === "IFRAME" && !el.contains(active2)) {
            options.close("focus-out", { event, focus: false });
          }
        }))
      )
    };
    layer = own;
    layerParts.set(own, [el, ...backdrop ? [backdrop] : []]);
    cleanups.push(pushLayer(own));
    showsAgain.set(own, {
      inside: (outer) => outer.contains(el) || !!trigger && outer.contains(trigger),
      again: () => {
        const focused = activeElement();
        hide();
        for (const part of [host, backdrop]) {
          try {
            part == null ? void 0 : part.hidePopover();
          } catch {
          }
        }
        show();
        if (focused && focused !== activeElement()) {
          ;
          focused.focus({ preventScroll: true });
        }
      }
    });
    if (modal.inertAndLock) {
      freezing.add(own);
    }
    for (const onShow of [options.onShow, config.onShow]) {
      const cleanup = onShow == null ? void 0 : onShow(own);
      if (cleanup) {
        cleanups.push(cleanup);
      }
    }
    let releaseLock;
    let releaseOwnInert;
    let pendingFreeze;
    const freezePage = () => {
      var _a5;
      const keep2 = [
        el,
        ...(shown == null ? void 0 : shown.backdrop) ? [shown.backdrop] : [],
        ...persistent2
      ];
      if (trigger && behavior.keepTrigger) {
        keep2.push(trigger);
      }
      for (const layer2 of activeLayers()) {
        if (layer2 !== own && above(layer2, own)) {
          keep2.push(...(_a5 = layerParts.get(layer2)) != null ? _a5 : []);
        }
      }
      releaseLock = lockScroll(el.ownerDocument, el);
      const inert = inertOutside(keep2);
      own.keep = inert.keep;
      releaseInert = releaseOwnInert = inert;
    };
    const thawPage = () => {
      pendingFreeze == null ? void 0 : pendingFreeze();
      releaseOwnInert == null ? void 0 : releaseOwnInert();
      releaseLock == null ? void 0 : releaseLock();
      if (releaseInert === releaseOwnInert) {
        releaseInert = void 0;
      }
      releaseOwnInert = releaseLock = own.keep = void 0;
    };
    if (modal.inertAndLock) {
      pendingFreeze = afterPaint(() => {
        pendingFreeze = void 0;
        if (!store.get().open) {
          return;
        }
        const focused = activeElement();
        freezePage();
        if (tabMode() === "trap" && focused && !usable(focused)) {
          focusPending = true;
          initialFocus(config.initialFocus);
        }
      });
    }
    remodal = () => {
      const next = options.modal();
      own.modal = next.consumeOutsidePress;
      own.blocking = typeof behavior.blocking === "function" ? behavior.blocking(next) : behavior.blocking;
      if (next.inertAndLock) {
        freezing.add(own);
      } else {
        freezing.delete(own);
      }
      if (next.inertAndLock && !modal.inertAndLock && store.get().open) {
        freezePage();
      } else if (!next.inertAndLock && modal.inertAndLock) {
        thawPage();
      }
      modal = next;
    };
    cleanups.push(thawPage, () => remodal = void 0);
    const beneath = new Set(activeLayers());
    for (let up = own.parent; up; up = up.parent) {
      beneath.add(up);
    }
    beneath.delete(own);
    for (const layer2 of beneath) {
      if (layer2.keep && above(own, layer2)) {
        for (const part of [el, ...backdrop ? [backdrop] : []]) {
          cleanups.push(layer2.keep(part));
        }
      }
    }
    if (tabMode() === "flow" && behavior.dismissOnFocusLoss) {
      let press2;
      cleanups.push(
        on(
          el.ownerDocument,
          "mousedown",
          (event) => {
            press2 = event;
            setTimeout(() => {
              if (press2 === event) {
                press2 = void 0;
              }
            });
          },
          { capture: true }
        ),
        on(el.ownerDocument, "focusin", (event) => {
          var _a5;
          const target = (_a5 = focusedFrom(el)) != null ? _a5 : event.target;
          if (!store.get().open || layerContains(own, target)) {
            return;
          }
          if (press2 && own.contains(target, press2)) {
            return;
          }
          options.close("focus-out", { event, focus: false });
        })
      );
    }
    cleanups.push(guardFrames(el, () => tabMode() === "trap"));
    if (behavior.closeWatcher) {
      const stop = watchClose(
        (event) => options.close("back", { event, focus: true })
      );
      if (stop) {
        releaseWatcher = stop;
        cleanups.push(() => {
          stop();
          if (releaseWatcher === stop) {
            releaseWatcher = void 0;
          }
        });
      }
    }
    const onSubmit = (event) => {
      var _a5;
      const form = event.target;
      const submitter = event.submitter;
      const method = (_a5 = submitter == null ? void 0 : submitter.getAttribute("formmethod")) != null ? _a5 : form.getAttribute("method");
      if ((method == null ? void 0 : method.toLowerCase()) !== "dialog" || findLayer(form) !== own) {
        return;
      }
      event.preventDefault();
      options.close("close-press", {
        event,
        focus: true,
        returnValue: (submitter == null ? void 0 : submitter.value) || void 0
      });
    };
    el.addEventListener("submit", onSubmit);
    cleanups.push(() => el.removeEventListener("submit", onSubmit));
    if (store.get().open && !focusPending && tabMode() === "trap" && focusIsLost()) {
      focusPending = true;
    }
    for (const other of activeLayers()) {
      const shows = showsAgain.get(other);
      if (other !== own && (shows == null ? void 0 : shows.inside(el))) {
        shows.again();
      }
    }
    queueMicrotask(() => initialFocus(config.initialFocus));
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      if (layer === own) {
        layer = void 0;
      }
      if (!store.get().mounted && !config.inline) {
        try {
          host.hidePopover();
        } catch {
        }
      }
    };
  }
  function show() {
    var _a4;
    if (!bound || shown) {
      return;
    }
    const { el, config } = bound;
    shown = { el, cleanup: () => {
    }, backdrop: (_a4 = config.backdrop) == null ? void 0 : _a4.call(config) };
    shown.cleanup = attach2(el, config);
  }
  function showBackdrop(backdrop, inline = false) {
    backdrop.removeAttribute("hidden");
    if (inline) {
      return animateIn(backdrop);
    }
    backdrop.setAttribute("popover", "manual");
    try {
      backdrop.showPopover();
    } catch {
    }
    if (!supportsTopLayer() && !backdrop.style.zIndex) {
      backdrop.style.zIndex = "2147483000";
    }
    return animateIn(backdrop);
  }
  function hideBackdrop(backdrop) {
    if (!store.get().mounted) {
      try {
        backdrop.hidePopover();
      } catch {
      }
    }
  }
  function hide() {
    if (!shown) {
      return;
    }
    const { cleanup } = shown;
    shown = void 0;
    cleanup();
  }
  function keydown(event) {
    var _a4;
    if (event.key === "Escape" && layer) {
      return escapeLayer(layer, event);
    }
    const popup = shown == null ? void 0 : shown.el;
    if (event.key !== "Tab" || !popup) {
      return;
    }
    const mode = tabMode();
    if (mode === "native") {
      return;
    }
    if (mode === "close") {
      return options.close("focus-out", { event, focus: false });
    }
    const list = tabbables(popup);
    const stops = composedTabbables(popup);
    const first = stops[0];
    const last = stops.at(-1);
    const active2 = activeElement();
    const atStart = !first || active2 === first || active2 === popup;
    const atEnd = !last || active2 === last;
    const ahead2 = mode === "trap" ? positiveTabStops(list, popup) : [];
    if (ahead2.length) {
      const order = [...ahead2, ...list.filter((el) => !ahead2.includes(el))];
      const index = order.indexOf(active2);
      const next = active2 === popup ? order.at(event.shiftKey ? -1 : 0) : order.at((index + (event.shiftKey ? -1 : 1)) % order.length);
      const crossing = ahead2.includes(active2) || !!next && ahead2.includes(next);
      const shadow = active2 == null ? void 0 : active2.shadowRoot;
      const entersShadow = !event.shiftKey && !!shadow && tabbables(shadow).length > 0;
      if (active2 !== popup && (index < 0 || !crossing || entersShadow)) {
        return;
      }
      event.preventDefault();
      next == null ? void 0 : next.focus({ preventScroll: true });
      return;
    }
    if (mode === "trap") {
      if (event.shiftKey ? atStart : atEnd) {
        event.preventDefault();
        ((_a4 = event.shiftKey ? last : first) != null ? _a4 : popup).focus({
          preventScroll: true
        });
        return;
      }
      const index = list.indexOf(active2);
      const next = index < 0 ? void 0 : list[index + (event.shiftKey ? -1 : 1)];
      const group = next && !next.checked ? radioGroup(next) : [];
      if (group.some((radio) => radio.checked) && !group.includes(active2)) {
        event.preventDefault();
        next == null ? void 0 : next.focus({ preventScroll: true });
      }
      return;
    }
    const trigger = options.trigger();
    if (!trigger) {
      return;
    }
    if (event.shiftKey && atStart) {
      event.preventDefault();
      trigger.focus({ preventScroll: true });
    } else if (!event.shiftKey && atEnd) {
      const next = nextTabbable(trigger, popup);
      if (!next) {
        return;
      }
      event.preventDefault();
      next.focus();
    }
  }
  return {
    // Call from the content slot's `bind`. Content kept mounted binds while
    // closed and shows when the popup opens. Vue sets refs on a client-only
    // mount before the app is in the document, and a disconnected popup can't
    // be shown, so it waits for that.
    bind(el, config = {}) {
      let cancelled = false;
      const unregister = registerPopupElement(el);
      const start = () => {
        bound = { el, config };
        if (store.get().mounted) {
          if (shown && shown.el !== el) {
            hide();
          }
          show();
        }
      };
      if (el.isConnected) {
        start();
      } else {
        queueMicrotask(() => {
          if (!cancelled && el.isConnected) {
            start();
          }
        });
      }
      return () => {
        var _a4, _b3;
        cancelled = true;
        const setting = (_b3 = (_a4 = options.finalFocus) == null ? void 0 : _a4.call(options)) != null ? _b3 : "trigger";
        unregister();
        if ((bound == null ? void 0 : bound.el) !== el) {
          return;
        }
        bound = void 0;
        if ((shown == null ? void 0 : shown.el) === el) {
          const active2 = activeElement();
          const held2 = store.get().open && behavior.movesFocus && (!active2 || active2 === el.ownerDocument.body || composedContains(el, active2));
          const from = upstream;
          hide();
          if (held2) {
            const range = caret;
            caret = void 0;
            queueMicrotask(() => {
              if (!bound && !el.isConnected && focusIsLost()) {
                returnFocus(el, from, true, range, setting);
              }
            });
          }
        }
      };
    },
    // Call from the content's keydown, for keys from this popup only.
    keydown,
    // Call from the trigger's keydown. Tab from the trigger enters an open
    // flowing popup, even when it renders somewhere else in the document.
    triggerKeydown(event) {
      var _a4;
      const popup = shown == null ? void 0 : shown.el;
      if (event.key !== "Tab" || event.shiftKey || !popup || !store.get().open) {
        return;
      }
      if (tabMode() !== "flow") {
        return;
      }
      event.preventDefault();
      ((_a4 = composedTabbables(popup)[0]) != null ? _a4 : popup).focus({ preventScroll: true });
    },
    // Call before opening, with how and from what event.
    opening(by, event) {
      opener = by;
      openedOnPress = (event == null ? void 0 : event.type) === "pointerdown";
      openedByKey = (event == null ? void 0 : event.type) === "keydown";
    },
    opener: () => opener,
    // For the popup's control only: hears every open and close first, from any
    // source, and returns why a close happened. A second call replaces the first.
    observe(listener) {
      observer = listener;
    },
    // Asks the component to close, returning focus, like a sheet swiped away.
    requestClose: (reason, event) => options.close(reason, { event, focus: true }),
    // Where focus goes on the next close. Reset after every close, and on open.
    returnFocus(mode) {
      returnMode = mode;
    },
    // Runs the component's initial focus now, like when a controller asks an open popup.
    initialFocus,
    // Places the shown popup again now, without animating, like once its size is known.
    place: () => place2 == null ? void 0 : place2(),
    // Checks the shown popup's placement without starting it over, like when
    // its arrow binds late, so an animation it runs goes on.
    checkPlacement: () => checkPlacement == null ? void 0 : checkPlacement(),
    // Applies `modal` again while shown, after it changed, like a sheet
    // crossing the snap point above which it's modal. Focus doesn't move.
    updateModal: () => remodal == null ? void 0 : remodal(),
    layer: () => layer,
    element: () => shown == null ? void 0 : shown.el,
    // For a component whose state the layer reads through a lens, which
    // derives `mounted` with a controlled `open` itself.
    mountedAs,
    // Call from a backdrop's `bind`. A backdrop that binds after its popup
    // has shown goes into the top layer, and the popup goes back above it.
    // Returns a cleanup.
    backdrop(backdrop) {
      var _a4, _b3, _c, _d;
      if (!shown || shown.backdrop === backdrop) {
        return () => {
        };
      }
      const { el } = shown;
      const host = (_c = (_b3 = bound == null ? void 0 : (_a4 = bound.config).host) == null ? void 0 : _b3.call(_a4)) != null ? _c : el;
      const inline = !!(bound == null ? void 0 : bound.config.inline);
      shown.backdrop = backdrop;
      const stop = showBackdrop(backdrop, inline);
      const active2 = activeElement();
      if (!inline) {
        try {
          host.hidePopover();
          host.showPopover();
        } catch {
        }
      }
      if (active2 && active2 !== activeElement()) {
        active2.focus({ preventScroll: true });
      }
      const release2 = (_d = layer == null ? void 0 : layer.keep) == null ? void 0 : _d.call(layer, backdrop);
      return () => {
        release2 == null ? void 0 : release2();
        stop();
        if ((shown == null ? void 0 : shown.backdrop) === backdrop) {
          shown.backdrop = void 0;
        }
        hideBackdrop(backdrop);
      };
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/elements.js
function elements(context2, slot) {
  const bound = [...context2.parts()].filter(
    (part) => {
      var _a3;
      return part.slot === slot && !!((_a3 = part.el) == null ? void 0 : _a3.isConnected);
    }
  );
  return inDocumentOrder(bound).map(({ el, key, props }) => ({
    el,
    key,
    props
  }));
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/action.js
var DEFAULT_PENDING_ANNOUNCEMENT = "Loading";
var PENDING_ANNOUNCE_DELAY = 1e3;
var popupResults = /* @__PURE__ */ new WeakSet();
var popupResult = (promise) => (popupResults.add(promise), promise);
var isPromise = (value) => !!value && typeof value.then === "function" && !popupResults.has(value);
function announcePending(context2, isPending) {
  const say = () => {
    var _a3;
    const text = (_a3 = context2.options().pendingAnnouncement) != null ? _a3 : DEFAULT_PENDING_ANNOUNCEMENT;
    Promise.resolve().then(() => (init_announce(), announce_exports)).then(
      ({ announce: announce2 }) => wasPending && announce2(text),
      () => {
      }
    );
  };
  let timer;
  let wasPending = false;
  const unsubscribe = context2.store.subscribe(() => {
    const pending2 = isPending();
    if (pending2 === wasPending) {
      return;
    }
    wasPending = pending2;
    clearTimeout(timer);
    if (pending2) {
      timer = setTimeout(say, PENDING_ANNOUNCE_DELAY);
    }
  });
  context2.onDestroy(() => {
    wasPending = false;
    clearTimeout(timer);
    unsubscribe();
  });
}

// node_modules/@ui-sdk/core/dist/foundation/popups/popup-steps.js
function unopened(reason, event) {
  return popupResult(
    Promise.resolve({
      reason,
      source: changeSource(reason, event)
    })
  );
}
function createOpenSteps(config) {
  const { popup, store, rules: rules2 = {} } = config;
  const imperative = "imperative";
  const triggerPress = "trigger-press";
  let pending2;
  let requested;
  let openAnchor;
  popup.observe((open) => {
    const closed = open ? void 0 : requested != null ? requested : { reason: imperative, source: "programmatic" };
    requested = void 0;
    if (!closed) {
      return;
    }
    pending2 == null ? void 0 : pending2.resolve(closed);
    pending2 = void 0;
    return closed;
  });
  config.onDestroy(() => {
    pending2 == null ? void 0 : pending2.resolve({ reason: "unmount", source: "programmatic" });
    pending2 = void 0;
  });
  function result(signal) {
    if (!pending2) {
      let resolve;
      const promise = popupResult(
        new Promise((done) => resolve = done)
      );
      pending2 = { promise, resolve };
    }
    if (signal && !signal.aborted) {
      const abort = () => popup.requestClose("imperative");
      signal.addEventListener("abort", abort, { once: true });
      pending2.promise.then(() => signal.removeEventListener("abort", abort));
    }
    return pending2.promise;
  }
  function show(request = {}, openReason) {
    return attempt(request, openReason).result;
  }
  function attempt(request, openReason) {
    var _a3, _c, _d, _e;
    const { event, signal } = request;
    if (signal == null ? void 0 : signal.aborted) {
      return { opened: false, result: unopened(imperative) };
    }
    const payloadReason = (_a3 = request.reason) != null ? _a3 : event ? triggerPress : imperative;
    const reason = openReason != null ? openReason : payloadReason;
    const settled = { ...request, reason, payloadReason };
    let opened = false;
    const open = (by = ((_b3) => (_b3 = request.by) != null ? _b3 : "imperative")()) => {
      var _a4;
      openAnchor = request.anchor;
      const restorePayload = (_a4 = config.payload) == null ? void 0 : _a4.opening(
        request.trigger,
        request.payload,
        {
          reason: payloadReason,
          event
        }
      );
      popup.opening(by, event);
      opened = config.change(true, { reason, event });
      if (!opened) {
        restorePayload == null ? void 0 : restorePayload();
      }
      return opened;
    };
    if (store.get().open) {
      if (popup.opener() === "hover" && request.by !== "hover") {
        popup.opening((_c = request.by) != null ? _c : "imperative", event);
      }
      if (request.trigger === void 0 && ((_d = config.payload) == null ? void 0 : _d.reopening(request, { reason: payloadReason })) && request.anchor) {
        openAnchor = request.anchor;
      }
      (_e = rules2.reopen) == null ? void 0 : _e.call(rules2, settled, open);
      return { opened, result: result(signal) };
    }
    if (rules2.open) {
      rules2.open(settled, open);
    } else {
      open();
    }
    return {
      opened,
      result: opened ? result(signal) : unopened(reason, event)
    };
  }
  function hide(request = {}) {
    var _a3;
    if (!store.get().open) {
      return false;
    }
    const { event, returnValue } = request;
    const reason = (_a3 = request.reason) != null ? _a3 : imperative;
    if (config.dismissal && !config.dismissal.allows(reason, event)) {
      return false;
    }
    let closed = false;
    const close = () => {
      var _a4, _b3;
      requested = { reason, source: changeSource(reason, event), returnValue };
      popup.returnFocus((_b3 = (_a4 = request.focus) != null ? _a4 : config.returnFocus) != null ? _b3 : true);
      const changed = config.change(false, {
        reason,
        event,
        ...returnValue !== void 0 && { returnValue }
      });
      if (!changed) {
        popup.returnFocus(true);
        requested = void 0;
      }
      closed = changed;
      return changed;
    };
    if (rules2.close) {
      rules2.close({ ...request, reason }, close);
    } else {
      close();
    }
    return closed;
  }
  function takeOver({
    trigger,
    payload,
    anchor,
    reason,
    event
  }) {
    var _a3;
    openAnchor = anchor;
    (_a3 = config.payload) == null ? void 0 : _a3.handOver(trigger, payload, { reason, event });
  }
  const showFor = (reason, event) => attempt(
    { reason: imperative, event },
    reason
  ).opened;
  return {
    // The controller's methods. Components add `focus` and `getPayload` themselves, so lists don't expose a payload.
    api: {
      isOpen: () => store.get().open,
      setOpen: (open, { reason, event } = {}) => open ? showFor(reason, event) : hide({ reason, event }),
      // An app's event is no trigger's, so the reason stays "imperative" unless it names one.
      open: (options = {}) => {
        var _a3;
        return show({ ...options, reason: (_a3 = options.reason) != null ? _a3 : imperative });
      },
      close: ({
        reason,
        event,
        returnValue
      } = {}) => hide({ reason, event, returnValue }),
      toggle: ({ reason, event } = {}) => store.get().open ? hide({ reason, event }) : showFor(reason, event)
    },
    show,
    attempt,
    hide,
    takeOver,
    // The next close, for an `open()` that opened the popup its own way.
    result,
    // A controller's or a take-over's anchor. The component falls back to its own.
    anchor: () => openAnchor
  };
}

// node_modules/@ui-sdk/core/dist/foundation/popups/create-popup.js
function createPopup(primitiveContext, config) {
  var _a3, _b3, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
  const context2 = primitiveContext;
  const { store, element: element2, options } = context2;
  const { preset } = config;
  const contentSlot = (_a3 = config.slot) != null ? _a3 : "content";
  const triggerSlot = (_b3 = config.trigger) != null ? _b3 : "trigger";
  const change = createChange(context2);
  const contentProps = (key) => {
    var _a4;
    return key !== void 0 && context2.props(contentSlot, key) || ((_a4 = elements(context2, contentSlot)[0]) == null ? void 0 : _a4.props) || context2.props(contentSlot) || {};
  };
  const triggerElement = () => {
    if (rules2 == null ? void 0 : rules2.trigger) {
      return rules2.trigger();
    }
    const key = store.get().trigger;
    return key !== null && element2(triggerSlot, key) || element2(triggerSlot);
  };
  let goneAtOpen = null;
  let onlyTrigger;
  const openedFrom = () => {
    var _a4;
    const key = store.get().trigger;
    if ((rules2 == null ? void 0 : rules2.trigger) || key === null || key === goneAtOpen) {
      return triggerElement();
    }
    const only = onlyTrigger != null ? onlyTrigger : elements(context2, triggerSlot).length <= 1;
    return (_a4 = element2(triggerSlot, key)) != null ? _a4 : only ? element2(triggerSlot) : void 0;
  };
  let wasOpen = store.get().open;
  store.subscribe(() => {
    const { open, trigger } = store.get();
    if (open === wasOpen) {
      return;
    }
    wasOpen = open;
    if (!open) {
      return;
    }
    goneAtOpen = trigger !== null && !element2(triggerSlot, trigger) ? trigger : null;
    onlyTrigger = elements(context2, triggerSlot).length <= 1;
  });
  const core = {
    label: context2.label,
    role: (_c = config.role) != null ? _c : preset.role,
    store,
    options,
    onOptions: context2.onOptions,
    onDestroy: context2.onDestroy,
    element: element2,
    parts: context2.parts,
    preset,
    // The layer and the steps are made last, since they call the features,
    // which reach them through these once something happens.
    get popup() {
      return popup;
    },
    get control() {
      return control;
    },
    triggerElement,
    triggerSlot,
    triggerDisabled: (key) => {
      var _a4;
      return !!((_a4 = context2.props(triggerSlot, key)) == null ? void 0 : _a4.disabled);
    },
    contentProps
  };
  const rules2 = core.rules = (_d = config.rules) == null ? void 0 : _d.call(config, core);
  const dismissal = (_e = preset.dismissal) == null ? void 0 : _e.call(preset, options, rules2);
  const presentation = (_f = preset.presentation) == null ? void 0 : _f.call(preset, core, dismissal);
  const press2 = (_g = preset.press) == null ? void 0 : _g.call(preset, core);
  const group = (_h = preset.group) == null ? void 0 : _h.call(preset, core);
  const hover = (_i = preset.hover) == null ? void 0 : _i.call(preset, core, group);
  const focus = (_j = preset.focus) == null ? void 0 : _j.call(preset, core);
  const triggerName2 = (_k = preset.triggerName) == null ? void 0 : _k.call(preset, core);
  (_l = preset.resetStyles) == null ? void 0 : _l.prepare(context2.label, contentSlot);
  (_m = preset.placement) == null ? void 0 : _m.prepare();
  function modalOf(arriving, state) {
    var _a4;
    if (preset.modal === void 0) {
      return;
    }
    return {
      modal: (_a4 = arriving.modal) != null ? _a4 : state.presentation === "sheet" ? true : preset.modal
    };
  }
  function updateModal() {
    const patch = modalOf(options(), store.get());
    if (patch) {
      store.set(patch);
    }
  }
  function dismiss(reason, details) {
    if (rules2 == null ? void 0 : rules2.dismiss) {
      rules2.dismiss(reason, details);
    } else {
      control.hide({ reason, ...details });
    }
  }
  const popup = createPopupLayer({
    ...config.behavior,
    preset: preset.behavior,
    position: (_n = preset.placement) == null ? void 0 : _n.position,
    owner: { component: context2.label, id: context2.id },
    store,
    trigger: triggerElement,
    returnTrigger: openedFrom,
    contains: (target, event) => {
      var _a4;
      return (rules2 == null ? void 0 : rules2.contains) ? rules2.contains(target, event) : !!((_a4 = triggerElement()) == null ? void 0 : _a4.contains(target)) || !!(press2 == null ? void 0 : press2.contains(target, event));
    },
    close: dismiss,
    modal: () => {
      var _a4, _b4;
      return (_b4 = (_a4 = rules2 == null ? void 0 : rules2.modal) == null ? void 0 : _a4.call(rules2)) != null ? _b4 : modalTriple(store.get().modal);
    },
    parent: () => {
      var _a4;
      return (_a4 = rules2 == null ? void 0 : rules2.parent) == null ? void 0 : _a4.call(rules2);
    },
    persistent: () => {
      var _a4, _b4;
      return (_b4 = (_a4 = rules2 == null ? void 0 : rules2.persistent) == null ? void 0 : _a4.call(rules2)) != null ? _b4 : [];
    },
    finalFocus: () => contentProps().finalFocus,
    onEscape: (event) => (rules2 == null ? void 0 : rules2.onEscape) ? rules2.onEscape(event) : dismiss("escape-key", { event, focus: true }),
    onShow: (layer) => {
      var _a4;
      return (_a4 = rules2 == null ? void 0 : rules2.onShow) == null ? void 0 : _a4.call(rules2, layer);
    },
    onOpenChange(open, closed) {
      var _a4;
      (_a4 = rules2 == null ? void 0 : rules2.onOpenChange) == null ? void 0 : _a4.call(rules2, open, closed);
      group == null ? void 0 : group.change(open);
      if (open) {
        presentation == null ? void 0 : presentation.open();
        updateModal();
        return;
      }
      hover == null ? void 0 : hover.clear();
      focus == null ? void 0 : focus.clear();
    },
    onOpenChangeComplete(open, closed) {
      var _a4, _b4, _c2;
      (_a4 = rules2 == null ? void 0 : rules2.onOpenChangeComplete) == null ? void 0 : _a4.call(rules2, open, closed);
      (_c2 = (_b4 = options()).onOpenChangeComplete) == null ? void 0 : _c2.call(_b4, open);
    }
  });
  const control = createOpenSteps({
    dismissal,
    popup,
    store,
    payload: (_o = preset.payload) == null ? void 0 : _o.call(
      preset,
      store,
      (payload, details) => change("payload", payload, details)
    ),
    change: (open, details) => {
      var _a4;
      return change("open", open, { ...details, ...(_a4 = rules2 == null ? void 0 : rules2.details) == null ? void 0 : _a4.call(rules2) });
    },
    onDestroy: context2.onDestroy,
    // Read on every close, once the rules exist.
    get returnFocus() {
      return rules2 == null ? void 0 : rules2.returnFocus;
    },
    rules: {
      // A pending hover open or close never fires once something else opens it.
      open(request, open) {
        hover == null ? void 0 : hover.clear();
        group == null ? void 0 : group.opening(request.event);
        if (rules2 == null ? void 0 : rules2.open) {
          rules2.open(request, open);
        } else {
          open();
        }
      },
      // Another trigger that shares the open popup takes it over, with its payload.
      reopen(request) {
        hover == null ? void 0 : hover.clear();
        if (rules2 == null ? void 0 : rules2.reopen) {
          return rules2.reopen(request);
        }
        const { trigger, payload, payloadReason, event } = request;
        if (trigger !== void 0 && trigger !== store.get().trigger) {
          control.takeOver({ trigger, payload, reason: payloadReason, event });
        }
      },
      close: (request, close) => (rules2 == null ? void 0 : rules2.close) ? rules2.close(request, close) : close()
    }
  });
  updateModal();
  deriveFromOptions(
    context2,
    ["modal"],
    (synced, state, arriving) => modalOf(arriving, { ...state, ...synced })
  );
  let modalShown = store.get().modal;
  store.subscribe(() => {
    const { modal } = store.get();
    if (modal === modalShown) {
      return;
    }
    modalShown = modal;
    popup.updateModal();
  });
  const features = {
    dismissal,
    presentation,
    press: press2,
    group,
    hover,
    focus,
    triggerName: triggerName2,
    rules: rules2
  };
  const controller = {
    ...control.api,
    getPayload: () => store.get().payload,
    focus: () => {
      var _a4;
      return (_a4 = triggerElement()) == null ? void 0 : _a4.focus();
    }
  };
  return {
    ...controller,
    // Internal. Used by parts and adapters: the core the features share, with
    // them and what the parts call.
    internal: Object.assign(core, features)
  };
}
function popupState(options) {
  var _a3, _b3;
  const open = (_b3 = (_a3 = options.open) != null ? _a3 : options.defaultOpen) != null ? _b3 : false;
  const state = {
    open,
    mounted: open,
    trigger: null,
    payload: void 0,
    titled: null,
    described: false,
    modal: false,
    presentation: "popover"
  };
  return state;
}

// node_modules/@ui-sdk/core/dist/foundation/popups/dismissal.js
function createDismissal(options, rules2 = {}) {
  const dismissible = () => options().dismissible !== false;
  const attempt = (reason, event) => {
    var _a3, _b3;
    return (_b3 = (_a3 = options()).onDismissAttempt) == null ? void 0 : _b3.call(_a3, {
      reason,
      event
    });
  };
  return {
    allows(reason, event) {
      var _a3, _b3, _c;
      const refused = (_b3 = (_a3 = rules2.refusal) == null ? void 0 : _a3.call(rules2, reason)) != null ? _b3 : isDismissal(reason) && !dismissible() ? "attempt" : void 0;
      if (!refused) {
        return true;
      }
      if (refused === "attempt" && reason !== "focus-out" && reason !== "window-blur") {
        attempt(reason, event);
        (_c = rules2.refused) == null ? void 0 : _c.call(rules2, reason);
      }
      return false;
    },
    sheet: {
      dismissible,
      onDismissAttempt: (event) => attempt("swipe", event)
    }
  };
}

// node_modules/@ui-sdk/core/dist/foundation/platform/anchoring.js
init_sides();
var supported;
function supportsAnchoring() {
  supported != null ? supported : supported = typeof CSS !== "undefined" && typeof CSS.supports === "function" && [
    "position-anchor: --a",
    "position-try-fallbacks: flip-y",
    "position-visibility: always"
  ].every((declaration) => CSS.supports(declaration));
  return supported;
}
var fillsLayoutViewport = (viewport) => {
  const root = document.documentElement;
  return !viewport.x && !viewport.y && Math.abs(viewport.width - root.clientWidth) < 1 && Math.abs(viewport.height - root.clientHeight) < 1;
};
function anchorable(anchor, shown, el, style, viewport) {
  if (!supportsAnchoring() || anchor.getRootNode() !== el.getRootNode() || !(shown.width || shown.height) || !fillsLayoutViewport(viewport)) {
    return false;
  }
  const moves2 = (durations) => durations.split(",").some((duration) => parseFloat(duration) > 0);
  return !moves2(style.transitionDuration) && (style.animationName === "none" || !moves2(style.animationDuration));
}
function anchorStyles(name, side, align, options, size) {
  const { sideOffset, alignOffset, collisionPadding: padding } = options;
  const vertical = side === "top" || side === "bottom";
  const [start, end] = vertical ? ["left", "right"] : ["top", "bottom"];
  const length = vertical ? size.width : size.height;
  const ideal = align === "start" ? `anchor(${start}) + ${alignOffset}px` : align === "end" ? `anchor(${end}) - ${length + alignOffset}px` : `anchor(center) - ${length / 2 - alignOffset}px`;
  const facing = opposite[side];
  return {
    // Whole pixels, so text inside renders the same each time.
    [facing]: `round(anchor(${side}), 1px)`,
    [side]: "auto",
    [`margin-${facing}`]: `${sideOffset}px`,
    [`margin-${side}`]: `${padding}px`,
    [start]: `round(min(max(${ideal}, min(${padding}px, anchor(${end}))), max(100% - ${length + padding}px, anchor(${start}) - ${length}px)), 1px)`,
    "position-anchor": name,
    "position-try-fallbacks": vertical ? "flip-y" : "flip-x",
    // Its initial value hides a popup whose anchor is scrolled out of view.
    "position-visibility": "always"
  };
}
var names = /* @__PURE__ */ new WeakMap();
var named = 0;
function nameAnchor(anchor) {
  let name = names.get(anchor);
  if (!name) {
    name = `--ui-anchor-${++named}`;
    names.set(anchor, name);
  }
  const own = anchor.style.getPropertyValue("anchor-name");
  if (!own.split(",").some((part) => part.trim() === name)) {
    const current = getComputedStyle(anchor).getPropertyValue("anchor-name");
    anchor.style.setProperty(
      "anchor-name",
      current && current !== "none" ? `${current}, ${name}` : name
    );
  }
  return name;
}
function unnameAnchor(anchor) {
  const name = names.get(anchor);
  const rest = anchor.style.getPropertyValue("anchor-name").split(",").map((part) => part.trim()).filter((part) => part && part !== name);
  if (rest.length) {
    anchor.style.setProperty("anchor-name", rest.join(", "));
  } else {
    anchor.style.removeProperty("anchor-name");
  }
  if (!anchor.getAttribute("style")) {
    anchor.removeAttribute("style");
  }
}

// node_modules/@ui-sdk/core/dist/foundation/platform/moves.js
var wakers = /* @__PURE__ */ new Map();
var idle = () => {
};
var unlisten = idle;
var wakeOutside = (event) => wakers.forEach(
  (popup, wake) => event.target instanceof Node && (popup == null ? void 0 : popup.contains(event.target)) || wake()
);
var wakeOnChanges = (records) => wakers.forEach(
  (popup, wake) => records.some(
    (record) => record.attributeName != "aria-activedescendant" && !(popup == null ? void 0 : popup.contains(record.target))
  ) && wake()
);
function listen2() {
  const listening = new AbortController();
  const options = { capture: true, passive: true, signal: listening.signal };
  const targets = [
    // Pointer moves and focus can change layout through `:hover` and `:focus`
    // styles, and typing through fields that grow with their text. A
    // transition starts after its delay.
    [
      document,
      [
        "scroll",
        "load",
        "input",
        "pointermove",
        "focusin",
        "transitionstart",
        "animationstart"
      ]
    ],
    [window, ["resize"]],
    // Pinch zoom moves the visual viewport without resizing the window.
    [window.visualViewport, ["resize", "scroll"]],
    [document.fonts, ["loadingdone"]]
  ];
  for (const [target, types] of targets) {
    for (const type of types) {
      target == null ? void 0 : target.addEventListener(type, wakeOutside, options);
    }
  }
  const changes = new MutationObserver(wakeOnChanges);
  changes.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  });
  return () => {
    listening.abort();
    changes.disconnect();
  };
}
var roots = /* @__PURE__ */ new Map();
function listenIn2(root) {
  const listening = new AbortController();
  const options = { capture: true, passive: true, signal: listening.signal };
  for (const type of ["scroll", "load", "transitionstart", "animationstart"]) {
    root.addEventListener(type, wakeOutside, options);
  }
  const changes = new MutationObserver(wakeOnChanges);
  changes.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  });
  return () => {
    listening.abort();
    changes.disconnect();
  };
}
function shadowRootsAround(node) {
  var _a3;
  const found2 = [];
  for (let at = node; at; ) {
    if (at.nodeType === 11 && "host" in at) {
      found2.push(at);
      at = at.host;
    } else {
      at = (_a3 = at.assignedSlot) != null ? _a3 : at.parentNode;
    }
  }
  return found2;
}
function watchShadowRoots(shadowRoots) {
  var _a3;
  const watched = [...shadowRoots];
  for (const root of watched) {
    const entry = (_a3 = roots.get(root)) != null ? _a3 : { count: 0, stop: listenIn2(root) };
    entry.count++;
    roots.set(root, entry);
  }
  return () => {
    for (const root of watched.splice(0)) {
      const entry = roots.get(root);
      if (--entry.count) {
        continue;
      }
      entry.stop();
      roots.delete(root);
    }
  };
}
function watchMoves(wake, popup) {
  if (!wakers.size) {
    unlisten = listen2();
  }
  const sizes = typeof ResizeObserver == "function" ? new ResizeObserver(wake) : void 0;
  if (popup) {
    sizes == null ? void 0 : sizes.observe(popup);
  }
  wakers.set(wake, sizes && popup);
  return () => {
    sizes == null ? void 0 : sizes.disconnect();
    wakers.delete(wake);
    if (wakers.size) {
      return;
    }
    unlisten();
    unlisten = idle;
  };
}

// node_modules/@ui-sdk/core/dist/foundation/platform/position.js
init_sides();
init_style();
function renderedRect(el) {
  let rendered2 = el;
  if (!el.getClientRects().length) {
    if (getComputedStyle(el).display !== "contents") {
      return void 0;
    }
    rendered2 = el.ownerDocument.createRange();
    rendered2.selectNodeContents(el);
    if (!rendered2.getClientRects().length) {
      return void 0;
    }
  }
  const { x, y, width, height } = rendered2.getBoundingClientRect();
  return { x, y, width, height };
}
function anchorRect(anchor) {
  const rect = "getBoundingClientRect" in anchor ? anchor.getBoundingClientRect() : { width: 0, height: 0, ...anchor };
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}
var isVertical = (side) => side === "top" || side === "bottom";
function place(anchor, size, side, align, options) {
  const { sideOffset, alignOffset } = options;
  const vertical = side === "top" || side === "bottom";
  let x = 0;
  let y = 0;
  if (side === "bottom") {
    y = anchor.y + anchor.height + sideOffset;
  }
  if (side === "top") {
    y = anchor.y - size.height - sideOffset;
  }
  if (side === "right") {
    x = anchor.x + anchor.width + sideOffset;
  }
  if (side === "left") {
    x = anchor.x - size.width - sideOffset;
  }
  if (vertical) {
    if (align === "start") {
      x = anchor.x + alignOffset;
    }
    if (align === "center") {
      x = anchor.x + anchor.width / 2 - size.width / 2 + alignOffset;
    }
    if (align === "end") {
      x = anchor.x + anchor.width - size.width - alignOffset;
    }
  } else {
    if (align === "start") {
      y = anchor.y + alignOffset;
    }
    if (align === "center") {
      y = anchor.y + anchor.height / 2 - size.height / 2 + alignOffset;
    }
    if (align === "end") {
      y = anchor.y + anchor.height - size.height - alignOffset;
    }
  }
  return { x, y };
}
function overflow(side, point, size, viewport, padding) {
  if (side === "bottom") {
    return point.y + size.height - (viewport.y + viewport.height - padding);
  }
  if (side === "top") {
    return viewport.y + padding - point.y;
  }
  if (side === "right") {
    return point.x + size.width - (viewport.x + viewport.width - padding);
  }
  return viewport.x + padding - point.x;
}
function available(side, anchor, viewport, options) {
  const { sideOffset, collisionPadding: padding } = options;
  const height = side === "bottom" ? viewport.y + viewport.height - padding - (anchor.y + anchor.height + sideOffset) : side === "top" ? anchor.y - sideOffset - padding - viewport.y : viewport.height - padding * 2;
  const width = side === "right" ? viewport.x + viewport.width - padding - (anchor.x + anchor.width + sideOffset) : side === "left" ? anchor.x - sideOffset - padding - viewport.x : viewport.width - padding * 2;
  return { width: Math.max(0, width), height: Math.max(0, height) };
}
var physicalAlign = (side, align, rtl = false) => rtl && isVertical(side) && align !== "center" ? align === "start" ? "end" : "start" : align;
var clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
function computePlacement(anchor, size, visible, placement2) {
  const viewport = { x: 0, y: 0, ...visible };
  const options = {
    ...placement2,
    side: physicalSide(placement2.side, placement2.rtl)
  };
  const align = physicalAlign(options.side, options.align, options.rtl);
  let side = options.side;
  let point = place(anchor, size, side, align, options);
  const over = overflow(side, point, size, viewport, options.collisionPadding);
  if (over > 0) {
    const other = opposite[side];
    const otherPoint = place(anchor, size, other, align, options);
    if (overflow(other, otherPoint, size, viewport, options.collisionPadding) < over) {
      side = other;
      point = otherPoint;
    }
  }
  const padding = options.collisionPadding;
  const room = available(side, anchor, viewport, options);
  if (overflow(side, point, size, viewport, padding) > 0) {
    if ((side === "top" || side === "bottom") && size.height && anchor.height >= size.height) {
      point.y = clamp(
        clamp(
          point.y,
          viewport.y + padding,
          viewport.y + viewport.height - size.height - padding
        ),
        anchor.y,
        anchor.y + anchor.height - size.height
      );
      room.height = Math.max(0, viewport.height - padding * 2);
    } else if ((side === "left" || side === "right") && size.width && anchor.width >= size.width) {
      point.x = clamp(
        clamp(
          point.x,
          viewport.x + padding,
          viewport.x + viewport.width - size.width - padding
        ),
        anchor.x,
        anchor.x + anchor.width - size.width
      );
      room.width = Math.max(0, viewport.width - padding * 2);
    }
  }
  if (side === "top" || side === "bottom") {
    const x = clamp(
      point.x,
      viewport.x + padding,
      viewport.x + viewport.width - size.width - padding
    );
    point.x = x === point.x ? x : clamp(x, anchor.x - size.width, anchor.x + anchor.width);
  } else {
    const y = clamp(
      point.y,
      viewport.y + padding,
      viewport.y + viewport.height - size.height - padding
    );
    point.y = y === point.y ? y : clamp(y, anchor.y - size.height, anchor.y + anchor.height);
  }
  return {
    ...point,
    side,
    align: options.align,
    available: room
  };
}
var stillFrames = 3;
var slowCheck = 500;
var roomVariables = ["--available-height", "--available-width"];
var roomRegistered = false;
function preparePosition() {
  if (roomRegistered) {
    return;
  }
  roomRegistered = true;
  ahead(() => registerUninherited(roomVariables));
}
function createWriter(el) {
  const written = /* @__PURE__ */ new Map();
  const changed = (name, value) => {
    if (written.get(name) === value) {
      return false;
    }
    written.set(name, value);
    return true;
  };
  return {
    style(name, value) {
      if (changed(`style:${name}`, value)) {
        el.style.setProperty(name, value);
      }
    },
    attribute(name, value) {
      if (!changed(name, value)) {
        return;
      }
      if (value === null) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }
    },
    reset: () => written.clear()
  };
}
function visibleViewport() {
  var _a3, _b3, _c, _d;
  const visual = window.visualViewport;
  return {
    x: (_a3 = visual == null ? void 0 : visual.offsetLeft) != null ? _a3 : 0,
    y: (_b3 = visual == null ? void 0 : visual.offsetTop) != null ? _b3 : 0,
    width: (_c = visual == null ? void 0 : visual.width) != null ? _c : document.documentElement.clientWidth,
    height: (_d = visual == null ? void 0 : visual.height) != null ? _d : document.documentElement.clientHeight
  };
}
function position(anchorOrGetter, el, optionsOrGetter = {}) {
  const read = () => typeof optionsOrGetter === "function" ? optionsOrGetter() : optionsOrGetter;
  const anchorOf = () => typeof anchorOrGetter === "function" ? anchorOrGetter() : anchorOrGetter;
  const resolve = (options) => {
    var _a3, _b3, _c, _d, _e;
    return {
      side: (_a3 = options.side) != null ? _a3 : "bottom",
      align: (_b3 = options.align) != null ? _b3 : "start",
      sideOffset: Number((_c = options.sideOffset) != null ? _c : 4),
      alignOffset: Number((_d = options.alignOffset) != null ? _d : 0),
      collisionPadding: Number((_e = options.collisionPadding) != null ? _e : 8)
    };
  };
  registerUninherited(roomVariables);
  Object.assign(el.style, {
    position: "fixed",
    inset: "auto",
    margin: "0",
    left: "0",
    top: "0"
  });
  const popup = createWriter(el);
  const style = getComputedStyle(el);
  let arrowWriter;
  let last = "";
  let placed = false;
  let unwatched = false;
  let stopped = false;
  let watchedRoots = [];
  let unwatchRoots = () => {
  };
  let decided = false;
  let anchoring;
  let anchoredAt = { left: "0", top: "0" };
  let lastAnchorBox;
  const anchoredStyles = /* @__PURE__ */ new Set();
  function unanchor(at = { left: "0", top: "0" }) {
    if (anchoring) {
      unnameAnchor(anchoring.anchor);
    }
    anchoring = void 0;
    for (const name of anchoredStyles) {
      popup.style(name, "");
    }
    anchoredStyles.clear();
    last = "";
    popup.style("inset", "auto");
    popup.style("margin", "0");
    popup.style("left", at.left);
    popup.style("top", at.top);
  }
  function update() {
    var _a3, _b3;
    if (stopped) {
      return false;
    }
    const options = read();
    const resolved = resolve(options);
    const arrowPadding = Number((_a3 = options.arrowPadding) != null ? _a3 : 6);
    const anchor = anchorOf();
    if (!anchor) {
      return false;
    }
    const node = "nodeType" in anchor ? anchor : void 0;
    const shown = node && renderedRect(node);
    if (node && placed && (!node.isConnected || !shown)) {
      if (anchoring) {
        unanchor(anchoredAt);
      }
      return false;
    }
    const around = node ? shadowRootsAround(node) : [];
    if (around.length !== watchedRoots.length || around.some((root, index) => root !== watchedRoots[index])) {
      unwatchRoots();
      watchedRoots = around;
      unwatchRoots = watchShadowRoots(around);
    }
    unwatched = !node && "getBoundingClientRect" in anchor;
    const viewport = visibleViewport();
    if (anchoring && (node !== anchoring.anchor || !fillsLayoutViewport(viewport))) {
      unanchor();
    }
    if (!decided) {
      decided = true;
      if (node && shown && anchorable(node, shown, el, style, viewport)) {
        anchoring = { anchor: node, name: nameAnchor(node) };
      } else {
        for (const name of leftoverStyles) {
          if (el.style.getPropertyValue(name)) {
            el.style.removeProperty(name);
          }
        }
      }
    } else if (anchoring) {
      nameAnchor(anchoring.anchor);
    }
    const first = !placed;
    const transition = el.style.transition;
    if (first) {
      el.style.transition = "none";
    }
    const a = anchorRect(shown != null ? shown : anchor);
    const offsets = { width: el.offsetWidth, height: el.offsetHeight };
    const arrow = arrowOf(options);
    const arrowSize = arrow ? { width: arrow.offsetWidth, height: arrow.offsetHeight } : void 0;
    const key = [
      a.x,
      a.y,
      a.width,
      a.height,
      offsets.width,
      offsets.height,
      viewport.x,
      viewport.y,
      viewport.width,
      viewport.height,
      arrowSize == null ? void 0 : arrowSize.width,
      arrowSize == null ? void 0 : arrowSize.height,
      ...Object.values(resolved),
      arrowPadding
    ].join();
    if (key === last && (!arrow || arrow === (arrowWriter == null ? void 0 : arrowWriter.el))) {
      return false;
    }
    last = key;
    const inner = {
      left: el.clientLeft,
      top: el.clientTop,
      width: el.clientWidth,
      height: el.clientHeight
    };
    const rtl = style.direction === "rtl";
    const exact = exactSize(style, offsets);
    if (anchoring) {
      const side = physicalSide(resolved.side, rtl);
      const styles = anchorStyles(
        anchoring.name,
        side,
        physicalAlign(side, resolved.align, rtl),
        resolved,
        exact
      );
      for (const [name, value] of Object.entries(styles)) {
        anchoredStyles.add(name);
        popup.style(name, value);
      }
    }
    const box = untransformed(el.getBoundingClientRect(), exact, style);
    const { scale } = box;
    const size = {
      width: exact.width * scale.x,
      height: exact.height * scale.y
    };
    const placement2 = {
      ...resolved,
      sideOffset: resolved.sideOffset * (isVertical(resolved.side) ? scale.y : scale.x),
      alignOffset: resolved.alignOffset * (isVertical(resolved.side) ? scale.x : scale.y),
      rtl
    };
    const anchorBox = { x: a.x, y: a.y, width: a.width, height: a.height };
    const result = computePlacement(anchorBox, size, viewport, placement2);
    const previous = lastAnchorBox;
    lastAnchorBox = anchorBox;
    const near = (point) => Math.abs(box.x - point.x) <= 1 && Math.abs(box.y - point.y) <= 1;
    if (anchoring) {
      const caughtUp = near(result);
      const behind = !caughtUp && !!previous && near(computePlacement(previous, size, viewport, placement2));
      if (!caughtUp && !behind) {
        unanchor();
        el.style.transition = transition;
        return update();
      }
      if (behind) {
        last = "";
      }
      anchoredAt = {
        left: `${parseFloat(style.left) + parseFloat(style.marginLeft)}px`,
        top: `${parseFloat(style.top) + parseFloat(style.marginTop)}px`
      };
    } else {
      const origin = {
        x: box.x - (parseFloat(style.left) || 0) * scale.x,
        y: box.y - (parseFloat(style.top) || 0) * scale.y
      };
      const ratio = ((_b3 = el.ownerDocument.defaultView) == null ? void 0 : _b3.devicePixelRatio) || 1;
      const snap = (value) => Math.round(value * ratio) / ratio;
      popup.style("left", `${snap((result.x - origin.x) / scale.x)}px`);
      popup.style("top", `${snap((result.y - origin.y) / scale.y)}px`);
    }
    const across = isVertical(result.side) ? scale.x : scale.y;
    if (first) {
      placed = true;
      void style.left;
      el.style.transition = transition;
    }
    popup.attribute("data-side", result.side);
    popup.attribute("data-align", result.align);
    popup.style("--available-height", `${result.available.height / scale.y}px`);
    popup.style("--available-width", `${result.available.width / scale.x}px`);
    popup.style("--anchor-width", `${a.width / scale.x}px`);
    popup.style("--anchor-height", `${a.height / scale.y}px`);
    const [originX, originY] = transformOrigin(
      result.side,
      result.align,
      rtl,
      a,
      size,
      result
    );
    popup.style(
      "--transform-origin",
      `${Math.round(originX / scale.x)}px ${Math.round(originY / scale.y)}px`
    );
    const paddingBox = {
      x: result.x + inner.left * scale.x,
      y: result.y + inner.top * scale.y,
      width: inner.width * scale.x,
      height: inner.height * scale.y
    };
    const edge = arrowOffset(a, paddingBox, result.side, arrowPadding * across);
    popup.style("--arrow-offset", `${Math.round(edge / across)}px`);
    if (arrow && arrowSize) {
      const box2 = { ...paddingBox, ...size };
      const length = {
        width: arrowSize.width * scale.x,
        height: arrowSize.height * scale.y
      };
      const placed2 = computeArrow(
        a,
        box2,
        length,
        result.side,
        arrowPadding * across
      );
      const offset = Math.round(placed2.offset / across);
      if ((arrowWriter == null ? void 0 : arrowWriter.el) !== arrow) {
        arrowWriter = { el: arrow, write: createWriter(arrow) };
      }
      const { write } = arrowWriter;
      write.style("position", "absolute");
      write.style("left", isVertical(result.side) ? `${offset}px` : "");
      write.style("top", isVertical(result.side) ? "" : `${offset}px`);
      write.attribute("data-side", result.side);
      write.attribute("data-align", result.align);
      write.attribute("data-arrow-clamped", placed2.clamped ? "" : null);
    }
    return true;
  }
  let frame = 0;
  let still = 0;
  function loop() {
    frame = 0;
    still = update() ? 0 : still + 1;
    if (still < stillFrames || unwatched) {
      frame = requestAnimationFrame(loop);
    }
  }
  function wake() {
    still = 0;
    frame || (frame = requestAnimationFrame(loop));
  }
  const unwatch = watchMoves(wake, el);
  const slow = setInterval(() => frame || update() && wake(), slowCheck);
  update();
  wake();
  const stop = () => {
    cancelAnimationFrame(frame);
    clearInterval(slow);
    unwatch();
    unwatchRoots();
    watchedRoots = [];
    stopped = true;
  };
  const initial = read();
  let asked = optionsKey(initial);
  let askedArrow = arrowOf(initial);
  function follow() {
    const options = read();
    const next = optionsKey(options);
    const arrow = arrowOf(options);
    if (next === asked && arrow === askedArrow) {
      return;
    }
    asked = next;
    askedArrow = arrow;
    wake();
  }
  return Object.assign(stop, {
    follow,
    place() {
      placed = false;
      last = "";
      popup.reset();
      arrowWriter == null ? void 0 : arrowWriter.write.reset();
      update();
    }
  });
}
var leftoverStyles = [
  "position-anchor",
  "position-try-fallbacks",
  "position-visibility"
];
var arrowOf = (options) => typeof options.arrow === "function" ? options.arrow() : options.arrow;
var optionsKey = (options) => [
  options.side,
  options.align,
  options.sideOffset,
  options.alignOffset,
  options.collisionPadding,
  options.arrowPadding
].join();
function exactSize(style, offsets) {
  const px = (name) => parseFloat(style.getPropertyValue(name)) || 0;
  const edges = (start, end) => style.boxSizing === "border-box" ? 0 : px(`padding-${start}`) + px(`padding-${end}`) + px(`border-${start}-width`) + px(`border-${end}-width`);
  const width = parseFloat(style.width) + edges("left", "right");
  const height = parseFloat(style.height) + edges("top", "bottom");
  const exact = {
    width: Math.abs(width - offsets.width) < 1,
    height: Math.abs(height - offsets.height) < 1
  };
  return {
    width: exact.width ? width : offsets.width,
    height: exact.height ? height : offsets.height,
    exact
  };
}
var angle = (value) => {
  const number = parseFloat(value) || 0;
  if (value.endsWith("turn")) {
    return number * 2 * Math.PI;
  }
  if (value.endsWith("grad")) {
    return number * Math.PI / 200;
  }
  if (value.endsWith("rad")) {
    return number;
  }
  return number * Math.PI / 180;
};
function untransformed(rect, size, style) {
  var _a3, _b3, _c, _d;
  const [originX = 0, originY = 0] = style.transformOrigin.split(" ").map((part) => parseFloat(part) || 0);
  const length = (part, whole) => !part ? 0 : part.endsWith("%") ? parseFloat(part) / 100 * whole : parseFloat(part) || 0;
  const moves2 = style.translate && style.translate !== "none" ? style.translate.split(" ") : [];
  const moveX = length(moves2[0], size.width);
  const moveY = length(moves2[1], size.height);
  const turn = style.rotate && style.rotate !== "none" ? style.rotate.split(" ") : [];
  const named2 = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[turn[0]];
  const [kx, ky, kz] = named2 != null ? named2 : turn.length === 4 ? turn.slice(0, 3).map(parseFloat) : [0, 0, 1];
  const axis = Math.hypot(kx, ky, kz) || 1;
  const [ux, uy, uz] = [kx / axis, ky / axis, kz / axis];
  const radians = turn.length ? angle(turn[turn.length - 1]) : 0;
  const [cos, sin] = [Math.cos(radians), Math.sin(radians)];
  const r = [
    cos + (1 - cos) * ux * ux,
    (1 - cos) * ux * uy - sin * uz,
    (1 - cos) * ux * uy + sin * uz,
    cos + (1 - cos) * uy * uy
  ];
  const [scaleX = 1, scaleY = scaleX] = style.scale && style.scale !== "none" ? style.scale.split(" ").map(parseFloat) : [];
  const matrix = /^matrix(3d)?\((.*)\)$/.exec((_a3 = style.transform) != null ? _a3 : "");
  const m = (_b3 = matrix == null ? void 0 : matrix[2].split(",").map(parseFloat)) != null ? _b3 : [];
  const [a, b, c, d, e, f, p, q, w] = !matrix ? [1, 0, 0, 1, 0, 0, 0, 0, 1] : matrix[1] ? [m[0], m[1], m[4], m[5], m[12], m[13], m[3], m[7], m[15]] : [...m, 0, 0, 1];
  const corner = (x, y) => {
    const [dx, dy] = [x - originX, y - originY];
    const depth = p * dx + q * dy + w || 1;
    const tx = scaleX * (a * dx + c * dy + e) / depth;
    const ty = scaleY * (b * dx + d * dy + f) / depth;
    return [
      originX + moveX + r[0] * tx + r[1] * ty,
      originY + moveY + r[2] * tx + r[3] * ty
    ];
  };
  const corners = [
    corner(0, 0),
    corner(size.width, 0),
    corner(0, size.height),
    corner(size.width, size.height)
  ];
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const rest = (shown, whole, exact = false) => whole > 0.01 && Math.abs(shown - whole) >= (exact ? 0.05 : 1) ? shown / whole : 1;
  const scale = {
    x: rest(rect.width, Math.max(...xs) - left, (_c = size.exact) == null ? void 0 : _c.width),
    y: rest(rect.height, Math.max(...ys) - top, (_d = size.exact) == null ? void 0 : _d.height)
  };
  return { x: rect.x - scale.x * left, y: rect.y - scale.y * top, scale };
}
function computeArrow(anchor, popup, arrow, side, padding) {
  const vertical = side === "top" || side === "bottom";
  const length = vertical ? arrow.width : arrow.height;
  const center = vertical ? anchor.x + anchor.width / 2 - popup.x : anchor.y + anchor.height / 2 - popup.y;
  const ideal = center - length / 2;
  const max = (vertical ? popup.width : popup.height) - length - padding;
  const offset = Math.max(padding, Math.min(ideal, max));
  return { offset: Math.round(offset), clamped: Math.abs(offset - ideal) > 0.5 };
}
function arrowOffset(anchor, box, side, padding) {
  const vertical = side === "top" || side === "bottom";
  const center = vertical ? anchor.x + anchor.width / 2 - box.x : anchor.y + anchor.height / 2 - box.y;
  const length = vertical ? box.width : box.height;
  return Math.round(
    Math.min(Math.max(center, padding), Math.max(padding, length - padding))
  );
}
function transformOrigin(side, align, rtl, a, size, point) {
  if (side === "top" || side === "bottom") {
    const start = rtl ? a.right - point.x : a.left - point.x;
    const end = rtl ? a.left - point.x : a.right - point.x;
    const x = align === "center" ? a.left + a.width / 2 - point.x : align === "start" ? start : end;
    return [x, side === "bottom" ? 0 : size.height];
  }
  const y = align === "center" ? a.top + a.height / 2 - point.y : align === "start" ? a.top - point.y : a.bottom - point.y;
  return [side === "right" ? 0 : size.width, y];
}

// node_modules/@ui-sdk/core/dist/foundation/popups/popup-features.js
function contentAnchor(el, setting, fallback) {
  if (typeof setting !== "string") {
    return setting != null ? setting : fallback();
  }
  const root = el.getRootNode();
  const own = root === el.ownerDocument ? null : root.querySelector(setting);
  return own != null ? own : el.ownerDocument.querySelector(setting);
}
function placementOptions(props, defaults2, arrow) {
  var _a3, _b3, _c, _d, _e, _f, _g;
  return {
    side: (_b3 = (_a3 = props.side) != null ? _a3 : defaults2.side) != null ? _b3 : "bottom",
    align: (_c = props.align) != null ? _c : defaults2.align,
    sideOffset: (_e = (_d = props.sideOffset) != null ? _d : defaults2.sideOffset) != null ? _e : 4,
    alignOffset: (_g = (_f = props.alignOffset) != null ? _f : defaults2.alignOffset) != null ? _g : 0,
    collisionPadding: props.collisionPadding,
    arrow,
    arrowPadding: props.arrowPadding
  };
}
var placement = {
  position,
  prepare: () => whenKept(preparePosition),
  anchor: contentAnchor,
  options: placementOptions
};

// node_modules/@ui-sdk/core/dist/foundation/popups/popup-presets.js
var triggerMenuPreset = {
  behavior: "combobox",
  dismissal: createDismissal,
  placement
};

// node_modules/@ui-sdk/core/dist/foundation/lists/listbox-listing.js
var noListing = {};
function keepListing(store, listbox, selection) {
  let last;
  deriveState(
    { store },
    ["listing"],
    (state) => {
      var _a3;
      const inputs = [
        ...listbox.listingInputs(),
        ...(_a3 = selection == null ? void 0 : selection.inputs()) != null ? _a3 : []
      ];
      if (!last || !sameValue(inputs, last.inputs)) {
        const next = listbox.listing(selection == null ? void 0 : selection.entry);
        last = {
          inputs,
          listing: sameEntries(state.listing, next) ? state.listing : next
        };
      }
      return { listing: last.listing };
    },
    { live: false }
  );
}
function sameEntries(a, b) {
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (typeof a[key] !== "string") {
      return false;
    }
  }
  return true;
}

// node_modules/@ui-sdk/core/dist/foundation/text/name-check-stub.js
function checkName(_el, _part, _from) {
}

// node_modules/@ui-sdk/core/dist/foundation/lists/item-icon.js
init_style();
var marks = /* @__PURE__ */ new WeakMap();
function mark(el, attribute) {
  var _a3;
  let counts = marks.get(el);
  if (!counts) {
    marks.set(el, counts = {});
  }
  counts[attribute] = ((_a3 = counts[attribute]) != null ? _a3 : 0) + 1;
  if (counts[attribute] === 1) {
    el.setAttribute(attribute, "");
  }
  return () => {
    counts[attribute]--;
    if (counts[attribute] === 0) {
      el.removeAttribute(attribute);
    }
  };
}
function addMirrorRule(doc) {
  writeStyle(
    doc,
    "ui-sdk-mirror",
    "@layer ui-sdk{:where([data-mirror][aria-hidden]){display:inline-block}:where([data-mirror][aria-hidden]:dir(rtl)){scale:-1 1}}"
  );
}
function placeIcon(el, placement2, subscribe2, found2) {
  let unmarkItem;
  let unmarkList;
  let unsubscribe;
  let active2 = true;
  const place2 = () => {
    var _a3, _b3;
    const item = (_a3 = el.parentElement) == null ? void 0 : _a3.closest(placement2.item);
    if (!item) {
      return false;
    }
    if (!unmarkItem) {
      unmarkItem = mark(item, "data-has-icon");
      found2(item);
    }
    if (!placement2.list) {
      return true;
    }
    const list = (_b3 = item.parentElement) == null ? void 0 : _b3.closest(placement2.list);
    if (list) {
      unmarkList = mark(list, "data-has-icons");
    }
    return !!list;
  };
  const placeOnChange = () => {
    if (!place2()) {
      return;
    }
    unsubscribe == null ? void 0 : unsubscribe();
    unsubscribe = void 0;
  };
  if (!place2()) {
    queueMicrotask(() => {
      if (active2 && !place2()) {
        unsubscribe = subscribe2(placeOnChange);
      }
    });
  }
  return () => {
    active2 = false;
    unsubscribe == null ? void 0 : unsubscribe();
    unmarkItem == null ? void 0 : unmarkItem();
    unmarkList == null ? void 0 : unmarkList();
  };
}
function itemIconPart(placement2) {
  return {
    // An icon's id is made for it, and its item is the one it's inside.
    props: {
      mirror: "boolean",
      id: "id",
      item: { kind: "string", from: "item.value" }
    },
    state: (state, { props }) => ({ mirror: !!props.mirror }),
    attrs: (state, { props }) => ({
      "aria-hidden": "true",
      "data-mirror": props.mirror ? "" : void 0
    }),
    bind(el, { api, props, id, store }) {
      var _a3;
      addMirrorRule(el.ownerDocument);
      const found2 = (item) => dev && queueMicrotask(() => {
        if (item.isConnected) {
          checkName(item, "An item with only an icon", {
            component: placement2.component,
            id
          });
        }
      });
      const unplace = placeIcon(el, placement2, store.subscribe, found2);
      const unregister = (_a3 = placement2.register) == null ? void 0 : _a3.call(placement2, el, { api, props });
      return () => {
        unplace();
        unregister == null ? void 0 : unregister();
      };
    }
  };
}
var optionIcon = { item: '[role="option"]', list: '[role="listbox"]' };

// node_modules/@ui-sdk/core/dist/foundation/forms/form-internals.js
var callbacksOf = /* @__PURE__ */ new WeakMap();
var customMessages = /* @__PURE__ */ new WeakMap();
function formCallback(el, type, ...args) {
  var _a3;
  if (type === "customValidity") {
    customMessages.set(el, args[0]);
  }
  const callback = (_a3 = callbacksOf.get(el)) == null ? void 0 : _a3[type];
  callback == null ? void 0 : callback(...args);
  return !!callback;
}
function bindElementInternals(el, internals, options) {
  let reported = "";
  const sync = () => {
    var _a3, _b3, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const value = options.value();
    if (value instanceof FormData) {
      internals.setFormValue(value, options.state());
    } else if (Array.isArray(value)) {
      const data = new FormData();
      const name = (_a3 = options.name) == null ? void 0 : _a3.call(options);
      if (name) {
        for (const item of value) {
          data.append(name, item);
        }
      }
      internals.setFormValue(data, options.state());
    } else {
      internals.setFormValue(value, options.state());
    }
    const missing = options.valueMissing();
    const custom = customMessages.get(el);
    const invalid = (_b3 = options.invalid) == null ? void 0 : _b3.call(options);
    if (custom) {
      internals.setValidity(
        { customError: true },
        custom,
        (_d = (_c = options.anchor) == null ? void 0 : _c.call(options)) != null ? _d : el
      );
    } else if (invalid) {
      internals.setValidity(
        invalid.flags,
        invalid.message,
        (_g = (_f = invalid.anchor) != null ? _f : (_e = options.anchor) == null ? void 0 : _e.call(options)) != null ? _g : el
      );
    } else if (missing) {
      internals.setValidity(
        { valueMissing: true },
        options.message(),
        (_i = (_h = options.anchor) == null ? void 0 : _h.call(options)) != null ? _i : el
      );
    } else {
      internals.setValidity({});
    }
    if (((_j = invalid == null ? void 0 : invalid.message) != null ? _j : "") === reported) {
      return;
    }
    reported = (_k = invalid == null ? void 0 : invalid.message) != null ? _k : "";
    validityChanged(el);
  };
  sync();
  const unsubscribe = options.subscribe(sync);
  const unfocus = options.focus ? focusWith(el, options.focus) : () => {
  };
  if (el.matches(":disabled")) {
    options.disabled(true);
  }
  callbacksOf.set(el, {
    reset: () => {
      options.reset();
      sync();
    },
    disabled: (disabled) => options.disabled(disabled),
    restore: (state) => {
      if (typeof state === "string") {
        options.restore(state);
      }
    },
    customValidity: sync
  });
  const unlabel = labelledBy(el, () => labelsOf(el));
  const onInvalid = () => {
    if (options.focus) {
      claimInvalidFocus(el, internals.form);
    }
  };
  el.addEventListener("invalid", onInvalid);
  return () => {
    el.removeEventListener("invalid", onInvalid);
    unsubscribe();
    unlabel();
    callbacksOf.delete(el);
    unfocus();
  };
}

// node_modules/@ui-sdk/core/dist/renderer.js
init_style();

// node_modules/@ui-sdk/web/dist/action.js
function waitList() {
  const waiting = [];
  let dispatching = true;
  const waitUntil = (promise) => {
    if (!dispatching) {
      throw new DOMException(
        "waitUntil() can only be called while the event dispatches.",
        "InvalidStateError"
      );
    }
    waiting.push(promise);
  };
  const done = () => {
    dispatching = false;
    return waiting;
  };
  return { waitUntil, done };
}

// node_modules/@ui-sdk/web/dist/define-element.js
var autoIds = /* @__PURE__ */ new WeakMap();
var count = 0;
var claimed = /* @__PURE__ */ new Set();
function claimTag(tagName) {
  if (typeof customElements === "undefined" || claimed.has(tagName)) {
    return false;
  }
  if (customElements.get(tagName)) {
    warn(
      `<${tagName}> is already defined by another library or another copy of ui-sdk. This one is skipped.`
    );
    return false;
  }
  claimed.add(tagName);
  return true;
}
function autoId(el) {
  if (!autoIds.has(el)) {
    autoIds.set(el, `auto-${++count}`);
  }
  return autoIds.get(el);
}
var wrappedChild = (selector) => (el) => {
  var _a3;
  return (_a3 = el.querySelector(`:scope > ${selector}`)) != null ? _a3 : el.firstElementChild;
};
function boundElement(el, target) {
  if (target) {
    return target(el);
  }
  return el.hasAttribute("as-child") ? el.firstElementChild : el;
}
var rekeyed = (previous, next) => previous.id !== next.id || previous.value !== next.value;
var kebab = (name) => name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
var semantics = ["role", "aria-disabled"];
function parseAttribute(type, value) {
  if (value === null) {
    return void 0;
  }
  if (typeof type === "function") {
    return type(value);
  }
  if (type === "boolean") {
    return value !== "false";
  }
  if (type === "number") {
    const number = Number(value);
    return value.trim() === "" || Number.isNaN(number) ? void 0 : number;
  }
  if (type === "list") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return value;
}
var presence = /* @__PURE__ */ new Set(["disabled", "required"]);
function readAttribute(el, name, type) {
  const value = el.getAttribute(kebab(name));
  if (type === "boolean" && presence.has(name)) {
    return value === null ? void 0 : true;
  }
  return parseAttribute(type, value);
}
function readAttributes(el, schema) {
  const result = {};
  for (const [name, type] of Object.entries(schema)) {
    const value = readAttribute(el, name, type);
    if (value !== void 0) {
      result[name] = value;
    }
  }
  return result;
}
var defaultOn = (el, value) => typeof value === "function" ? value(el) : value;
function reflectAttributes(proto, schema, defaults2 = {}) {
  for (const [name, type] of Object.entries(schema)) {
    if (name in proto) {
      continue;
    }
    const attribute = kebab(name);
    Object.defineProperty(proto, name, {
      configurable: true,
      get() {
        var _a3, _b3;
        return (_b3 = (_a3 = readAttribute(this, name, type)) != null ? _a3 : defaultOn(this, defaults2[name])) != null ? _b3 : type === "boolean" ? false : void 0;
      },
      set(value) {
        const removes = value === false && type === "boolean" && !defaultOn(this, defaults2[name]);
        if (value == null || removes) {
          this.removeAttribute(attribute);
        } else {
          this.setAttribute(
            attribute,
            value === true ? "" : Array.isArray(value) ? value.join(",") : String(value)
          );
        }
      }
    });
  }
}
function upgradeProperties(el, names2) {
  for (const name of names2) {
    if (!Object.prototype.hasOwnProperty.call(el, name)) {
      continue;
    }
    const value = el[name];
    delete el[name];
    el[name] = value;
  }
}
var quiet = /* @__PURE__ */ new Set();
function restoreQuietly(el, state, mode) {
  quiet.add(el);
  try {
    return formCallback(el, "restore", state, mode);
  } finally {
    quiet.delete(el);
  }
}
var pendingRestores = /* @__PURE__ */ new Map();
function wroteFromScript(el) {
  for (const waiting of pendingRestores.keys()) {
    if (waiting.contains(el)) {
      pendingRestores.delete(waiting);
    }
  }
}
function restoreOnceBound(el, state, mode) {
  const token = {};
  pendingRestores.set(el, token);
  queueMicrotask(() => {
    if (pendingRestores.get(el) !== token) {
      return;
    }
    pendingRestores.delete(el);
    restoreQuietly(el, state, mode);
  });
}
function quietNow(el) {
  const owner3 = partOwners.get(el);
  if (quiet.has(el) || !!owner3 && quiet.has(owner3)) {
    return true;
  }
  for (const inside of quiet) {
    if (el.contains(inside)) {
      return true;
    }
  }
  return false;
}
function detailsOnly(value, details) {
  return details === void 0 && !!value && typeof value === "object" && "reason" in value && !(typeof Event !== "undefined" && value instanceof Event);
}
function withEvents(el, target, silent = [], actions = [], names2 = {}) {
  return new Proxy(target, {
    get(target2, key) {
      if (key in target2 || typeof key !== "string" || !/^on[A-Z]/.test(key)) {
        return target2[key];
      }
      if (silent.includes(key)) {
        return void 0;
      }
      return (value, details) => {
        var _a3, _b3, _c;
        if (quietNow(el)) {
          return;
        }
        const only = detailsOnly(value, details);
        const { cancel, canceled, ...rest } = (_a3 = only ? value : details) != null ? _a3 : {};
        const detail = only ? rest : { ...rest, value };
        const wait = actions.includes(key) ? waitList() : void 0;
        if (wait) {
          detail.waitUntil = wait.waitUntil;
        }
        const event = new CustomEvent(
          (_b3 = names2[key]) != null ? _b3 : key.slice(2).toLowerCase(),
          {
            detail,
            bubbles: false,
            // Only a change with details or an event to cancel is cancelable.
            cancelable: typeof cancel === "function" || typeof (value == null ? void 0 : value.preventDefault) === "function",
            composed: true
          }
        );
        const proceed = el.dispatchEvent(event);
        const waiting = (_c = wait == null ? void 0 : wait.done()) != null ? _c : [];
        if (!proceed) {
          if (typeof cancel === "function") {
            cancel();
          } else if (value && typeof value.preventDefault === "function") {
            ;
            value.preventDefault();
          }
        }
        return waiting.length > 1 ? Promise.all(waiting).then((values) => values.at(-1)) : waiting[0];
      };
    }
  });
}
var instances = /* @__PURE__ */ new WeakMap();
function instanceOf(el) {
  return el ? instances.get(el) : void 0;
}
var reads = /^(?:get|is|can)[A-Z]|^focus$/;
function controllerView(el, api, methods) {
  const view2 = {};
  for (const name of methods) {
    const method = api[name];
    if (typeof method === "function") {
      view2[name] = (...args) => {
        if (!reads.test(name)) {
          wroteFromScript(el);
        }
        return method.apply(api, args);
      };
    }
  }
  return Object.freeze(view2);
}
var display = /* @__PURE__ */ new Map();
var aligned = /* @__PURE__ */ new Set();
var styleId;
function documentStyle() {
  var _a3;
  if (styleId) {
    return styleId;
  }
  const copies = globalThis;
  const key = /* @__PURE__ */ Symbol.for("ui-sdk.web-styles@1");
  copies[key] = ((_a3 = copies[key]) != null ? _a3 : 0) + 1;
  return styleId = `ui-sdk-web-${copies[key]}`;
}
var css = "";
var rulesVersion = 0;
var constructed = /* @__PURE__ */ new WeakMap();
function setDisplay(selector, value, align = false) {
  if (align) {
    aligned.add(selector);
  }
  if (!value && !align) {
    return;
  }
  if (value) {
    display.set(selector, value);
  }
  css = rules();
  writeStyle(document, documentStyle(), css);
  rulesVersion++;
}
function rules() {
  return [
    "@layer ui-sdk {",
    // Parts that aren't shown stay hidden whatever display a class gives them.
    '  :where([data-slot][hidden]:not([hidden="until-found"])) { display: none !important }',
    // Content hidden until found is only hidden inside a box, so those keep theirs.
    ...[...display].map(
      ([selector, value]) => `  :where(${selector}:not([hidden]), ${selector}[hidden="until-found"]) { display: ${value} }`
    ),
    ...[...aligned].map(
      (tag) => `  :where(${tag}[align]) { text-align: inherit }`
    ),
    // A part with as-child hands its role to its child, so it has no box of its own.
    "  :where([as-child]) { display: contents }",
    "}"
  ].join("\n");
}
function adoptStyles(el) {
  const root = el.getRootNode();
  if (!isShadowRoot(root)) {
    return copyStyles(el.ownerDocument);
  }
  const shared2 = sharedSheet(root.ownerDocument);
  if (!shared2 || root.adoptedStyleSheets.includes(shared2)) {
    return;
  }
  root.adoptedStyleSheets = [shared2, ...root.adoptedStyleSheets];
}
var isShadowRoot = (node) => node.nodeType === 11 && "host" in node;
function sharedSheet(doc) {
  const view2 = doc.defaultView;
  if (!view2) {
    return;
  }
  let entry = constructed.get(doc);
  if (!entry) {
    constructed.set(
      doc,
      entry = { sheet: new view2.CSSStyleSheet(), version: -1 }
    );
  }
  if (entry.version !== rulesVersion) {
    entry.sheet.replaceSync(rules());
    entry.version = rulesVersion;
  }
  return entry.sheet;
}
function copyStyles(doc) {
  if (css) {
    writeStyle(doc, documentStyle(), css);
  }
}
var dependents = /* @__PURE__ */ new Set();
function reconfigureInside(el) {
  for (const dependent of dependents) {
    if (dependent !== el && el.contains(dependent)) {
      dependent.reconfigure();
    }
  }
}
var portals = /* @__PURE__ */ new WeakMap();
var passedOn = /* @__PURE__ */ new WeakMap();
function inheritedPortal(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const target = portals.get(node);
    if (target) {
      return passedOn.has(target) ? passedOn.get(target) : target;
    }
  }
  return null;
}
var partOwners = /* @__PURE__ */ new WeakMap();
var slotParts = /* @__PURE__ */ new WeakMap();
function innerPart(part, owner3) {
  for (let node = part.el; node && node !== owner3; node = node.parentElement) {
    const other = slotParts.get(node);
    if (other === part) {
      return;
    }
    if ((other == null ? void 0 : other.el) === part.el && registered2.has(other)) {
      return other;
    }
  }
}
function handOver(part) {
  var _a3;
  part.dataSlot = void 0;
  const sharing = [];
  for (let node = part.el; node; node = node.parentElement) {
    const other = slotParts.get(node);
    if (other && other !== part && other.el === part.el && registered2.has(other)) {
      sharing.push(other);
    }
  }
  if (!sharing.length) {
    return;
  }
  part.el.removeAttribute("data-slot");
  markAuthored(part.el, "data-slot");
  for (const other of sharing) {
    (_a3 = other.sync) == null ? void 0 : _a3.call(other);
  }
}
var registered2 = /* @__PURE__ */ new WeakSet();
var findOwnerAgain = /* @__PURE__ */ new WeakMap();
var hasRichValue = (props) => props.value !== void 0 && typeof props.value !== "string";
function propsAround(el, slot, owner3) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const part = slotParts.get(node);
    if ((part == null ? void 0 : part.slot) !== slot || partOwners.get(node) !== owner3) {
      continue;
    }
    return part.keyed && hasRichValue(part.props) ? { ...part.props, value: part.props.id } : part.props;
  }
}
function findOwner(el, selector) {
  const target = el.getAttribute("for");
  if (target) {
    const root = el.getRootNode();
    const owner3 = "getElementById" in root ? root.getElementById(target) : null;
    if (owner3 == null ? void 0 : owner3.matches(selector)) {
      return owner3;
    }
  }
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (node.matches(selector)) {
      return node;
    }
    const owner3 = partOwners.get(node);
    if (owner3 == null ? void 0 : owner3.matches(selector)) {
      return owner3;
    }
  }
}
var unmatched = /* @__PURE__ */ new WeakMap();
function findContainer(el, selector) {
  for (let root = el.getRootNode(); ; root = root.host.getRootNode()) {
    const container = root.querySelector(selector);
    if (container) {
      return container;
    }
    if (!isShadowRoot(root)) {
      break;
    }
  }
  if (unmatched.get(el) !== selector) {
    warn(
      `<${el.localName}> container="${selector}" matches no element yet, so it renders in place. A container rendered later is used from its next open.`
    );
  }
  unmatched.set(el, selector);
  return null;
}
function whenGone(el, run) {
  queueMicrotask(() => {
    if (!el.isConnected) {
      run();
    }
  });
}
var formStates = /* @__PURE__ */ new WeakMap();
var bindInternals2 = (el, internals, options) => {
  formStates.set(el, options.state);
  return bindElementInternals(el, internals, options);
};
function formAssociated(Base) {
  var _a3, _internals;
  return _a3 = class extends Base {
    constructor() {
      super();
      __privateAdd(this, _internals);
      __privateSet(this, _internals, this.attachInternals());
      attachFormInternals(this, __privateGet(this, _internals), bindInternals2);
    }
    get form() {
      return __privateGet(this, _internals).form;
    }
    get labels() {
      return __privateGet(this, _internals).labels;
    }
    get name() {
      var _a4;
      return (_a4 = this.getAttribute("name")) != null ? _a4 : "";
    }
    set name(value) {
      this.setAttribute("name", value);
    }
    get validity() {
      return __privateGet(this, _internals).validity;
    }
    get validationMessage() {
      return __privateGet(this, _internals).validationMessage;
    }
    get willValidate() {
      return __privateGet(this, _internals).willValidate;
    }
    checkValidity() {
      return __privateGet(this, _internals).checkValidity();
    }
    reportValidity() {
      return __privateGet(this, _internals).reportValidity();
    }
    setCustomValidity(message) {
      if (!formCallback(this, "customValidity", message)) {
        __privateGet(this, _internals).setValidity(
          message ? { customError: true } : {},
          message
        );
      }
    }
    formResetCallback() {
      pendingRestores.delete(this);
      formCallback(this, "reset");
    }
    formDisabledCallback(disabled) {
      formCallback(this, "disabled", disabled);
    }
    formStateRestoreCallback(state, mode) {
      pendingRestores.delete(this);
      if (!restoreQuietly(this, state, mode)) {
        restoreOnceBound(this, state, mode);
      }
    }
  }, _internals = new WeakMap(), __publicField(_a3, "formAssociated", true), _a3;
}
var defaultOf = (name) => `default${name[0].toUpperCase()}${name.slice(1)}`;
function defineRootElement(tagName, primitive, config) {
  var _a3, _b3, _c, _view, _Owner_instances, instance_get, _parts, _pending, _connected, _rendering, _rendered, _applying, _stale, _gone, _properties, _state, _saved, configure_fn, quietly_fn, _renderCleanup, render_fn, _childParts, _childObserver, _selfPart, registerSelf_fn, syncSelf_fn, registerChild_fn, syncChildren_fn, flush_fn, watch_fn, rewatch_fn, sync_fn, bind_fn, unbind_fn, portalTarget_fn, moves_fn, move_fn, apply_fn, channel_get, restore_fn;
  if (!claimTag(tagName)) {
    return;
  }
  setDisplay(tagName, config.display);
  const schema = {
    debug: "boolean",
    ...config.attributes
  };
  const state = (_a3 = config.state) != null ? _a3 : {};
  const optionsOf = (el, properties, rendered2) => {
    var _a4;
    const options = readAttributes(el, schema);
    for (const name of rendered2) {
      delete options[name];
    }
    for (const [name, value] of Object.entries(properties)) {
      if (value !== void 0) {
        options[name] = value;
      }
    }
    for (const name of Object.keys(state)) {
      if (!(name in options)) {
        continue;
      }
      const fallback = defaultOf(name);
      if (!(fallback in options)) {
        options[fallback] = options[name];
      }
      delete options[name];
    }
    return { ...options, ...(_a4 = config.options) == null ? void 0 : _a4.call(config, el) };
  };
  customElements.define(
    tagName,
    (_c = class extends (config.formAssociated ? formAssociated(HTMLElement) : HTMLElement) {
      constructor() {
        super(...arguments);
        __privateAdd(this, _Owner_instances);
        __privateAdd(this, _view);
        __privateAdd(this, _parts, /* @__PURE__ */ new Set());
        __privateAdd(this, _pending, /* @__PURE__ */ new Set());
        __privateAdd(this, _connected, false);
        __privateAdd(this, _rendering, false);
        __privateAdd(this, _rendered, /* @__PURE__ */ new Set());
        __privateAdd(this, _applying, /* @__PURE__ */ new Set());
        __privateAdd(this, _stale, /* @__PURE__ */ new Set());
        // Left the page and destroyed its instance, which a reconnect replaces.
        __privateAdd(this, _gone, false);
        __privateAdd(this, _properties, {});
        // State properties set while there's no live instance, like before the
        // element connects, where the next instance starts.
        __privateAdd(this, _state, {});
        // What a form-associated element reported to its form when it left,
        // which it restores when it's back.
        __privateAdd(this, _saved);
        __privateAdd(this, _renderCleanup);
        __privateAdd(this, _childParts, /* @__PURE__ */ new Map());
        __privateAdd(this, _childObserver);
        __privateAdd(this, _selfPart);
      }
      // The controller's methods. Internals stay out of reach.
      get api() {
        var _a4, _b3;
        if (!__privateGet(this, _Owner_instances, instance_get)) {
          return void 0;
        }
        return (_b3 = __privateGet(this, _view)) != null ? _b3 : __privateSet(this, _view, controllerView(
          this,
          __privateGet(this, _Owner_instances, instance_get).api,
          (_a4 = config.api) != null ? _a4 : []
        ));
      }
      attributeChangedCallback(name, previous, value) {
        markAuthored(this, name);
        if (semantics.includes(name)) {
          return;
        }
        const key = name.replace(
          /-(\w)/g,
          (_, char) => char.toUpperCase()
        );
        if (key in state && value !== previous && !__privateGet(this, _rendering)) {
          wroteFromScript(this);
        }
        if (!__privateGet(this, _rendering) || value === null) {
          __privateGet(this, _rendered).delete(key);
        } else if (previous === null) {
          __privateGet(this, _rendered).add(key);
        }
        if (!__privateGet(this, _connected)) {
          return;
        }
        __privateMethod(this, _Owner_instances, configure_fn).call(this);
        reconfigureInside(this);
        if (!(key in state) || value === previous) {
          return;
        }
        const type = schema[key];
        const cleared = type === "boolean" ? false : type === "list" ? [] : null;
        __privateMethod(this, _Owner_instances, quietly_fn).call(this, () => state[key].set(
          __privateGet(this, _Owner_instances, instance_get).api,
          value === null ? cleared : parseAttribute(type, value)
        ));
      }
      connectedCallback() {
        var _a4, _b3, _c2, _d, _e;
        adoptStyles(this);
        if (__privateGet(this, _connected)) {
          for (const part of __privateGet(this, _parts)) {
            elementMoved(part.el);
          }
          if (config.options) {
            __privateMethod(this, _Owner_instances, configure_fn).call(this);
          }
          return;
        }
        upgradeProperties(this, [
          ...Object.keys(state),
          ...(_a4 = config.properties) != null ? _a4 : [],
          ...Object.keys(schema)
        ]);
        for (const [name, value] of Object.entries((_b3 = config.host) != null ? _b3 : {})) {
          if (!this.hasAttribute(name)) {
            this.setAttribute(name, value);
          }
        }
        const restore = __privateGet(this, _gone) && !Object.keys(__privateGet(this, _state)).length ? __privateGet(this, _saved) : void 0;
        const starts = {};
        if (__privateGet(this, _gone) && restore === void 0) {
          for (const [name, { get }] of Object.entries(state)) {
            starts[name] = get(__privateGet(this, _Owner_instances, instance_get).api);
          }
        }
        Object.assign(starts, __privateGet(this, _state));
        __privateSet(this, _state, {});
        const last = Object.fromEntries(
          Object.entries(starts).map(([name, value]) => [
            defaultOf(name),
            value
          ])
        );
        if (__privateGet(this, _gone)) {
          instances.delete(this);
          __privateSet(this, _view, void 0);
          __privateSet(this, _gone, false);
          __privateSet(this, _saved, void 0);
        }
        let instance = __privateGet(this, _Owner_instances, instance_get);
        if (instance) {
          __privateMethod(this, _Owner_instances, configure_fn).call(this);
        } else {
          instance = primitive(
            withEvents(
              this,
              {
                ...optionsOf(this, __privateGet(this, _properties), __privateGet(this, _rendered)),
                ...last,
                id: this.id || `ui-sdk-${tagName.replace(/^ui-/, "")}-${++count}`
              },
              config.silent,
              config.actions,
              config.events
            )
          );
          instances.set(this, instance);
        }
        if (config.formAssociated && Object.keys(starts).length) {
          const base = instance.startState(
            optionsOf(this, __privateGet(this, _properties), __privateGet(this, _rendered))
          );
          __privateMethod(this, _Owner_instances, configure_fn).call(this, Object.fromEntries(
            Object.keys(starts).map((name) => [defaultOf(name), base[name]])
          ));
        }
        __privateSet(this, _connected, true);
        if (config.options) {
          dependents.add(this);
        }
        if (config.self) {
          const el = boundElement(this, config.target);
          if (el) {
            __privateMethod(this, _Owner_instances, registerSelf_fn).call(this, el);
          } else {
            warn(`<${tagName}> needs an element inside it.`);
          }
        }
        for (const [slot, find] of Object.entries((_c2 = config.children) != null ? _c2 : {})) {
          const child = find(this);
          if (child) {
            __privateMethod(this, _Owner_instances, registerChild_fn).call(this, slot, child);
          } else if (!((_d = config.optionalChildren) == null ? void 0 : _d.includes(slot))) {
            warn(
              `<${tagName}> needs its native element inside it for "${slot}".`
            );
          }
        }
        if (config.children || config.target) {
          __privateSet(this, _childObserver, new MutationObserver(() => {
            __privateMethod(this, _Owner_instances, syncChildren_fn).call(this);
            __privateMethod(this, _Owner_instances, syncSelf_fn).call(this);
          }));
          __privateGet(this, _childObserver).observe(this, { childList: true });
        }
        __privateMethod(this, _Owner_instances, render_fn).call(this);
        if (this.id) {
          const root = this.getRootNode();
          for (const el of root.querySelectorAll(
            `[for="${CSS.escape(this.id)}"]`
          )) {
            (_e = findOwnerAgain.get(el)) == null ? void 0 : _e();
          }
        }
        if (restore !== void 0) {
          restoreOnceBound(this, restore, "restore");
        }
      }
      reconfigure() {
        if (__privateGet(this, _connected)) {
          __privateMethod(this, _Owner_instances, configure_fn).call(this);
        }
      }
      disconnectedCallback() {
        whenGone(this, () => {
          var _a4, _b3, _c2, _d;
          __privateSet(this, _saved, (_a4 = formStates.get(this)) == null ? void 0 : _a4());
          (_b3 = __privateGet(this, _renderCleanup)) == null ? void 0 : _b3.call(this);
          __privateSet(this, _renderCleanup, void 0);
          (_c2 = __privateGet(this, _childObserver)) == null ? void 0 : _c2.disconnect();
          __privateSet(this, _childObserver, void 0);
          __privateGet(this, _childParts).clear();
          __privateSet(this, _selfPart, void 0);
          __privateSet(this, _connected, false);
          dependents.delete(this);
          for (const part of __privateGet(this, _parts)) {
            this.unregister(part);
          }
          (_d = __privateGet(this, _Owner_instances, instance_get)) == null ? void 0 : _d.destroy();
          __privateSet(this, _gone, true);
        });
      }
      // Parts register as they upgrade, in no useful order. They sync together a
      // microtask later in DOM order, so a trigger binds before an open popup.
      register(part) {
        __privateGet(this, _parts).add(part);
        registered2.add(part);
        part.sync = () => __privateGet(this, _pending).has(part) || __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
        if (!__privateGet(this, _pending).size) {
          queueMicrotask(() => __privateMethod(this, _Owner_instances, flush_fn).call(this));
        }
        __privateGet(this, _pending).add(part);
      }
      unregister(part) {
        var _a4, _b3, _c2;
        (_a4 = part.unwatch) == null ? void 0 : _a4.call(part);
        part.unwatch = void 0;
        (_b3 = part.observer) == null ? void 0 : _b3.disconnect();
        part.observer = void 0;
        __privateMethod(this, _Owner_instances, unbind_fn).call(this, part);
        releaseAttrs(part.el, __privateGet(this, _Owner_instances, channel_get));
        (_c2 = part.disconnect) == null ? void 0 : _c2.call(part);
        part.disconnect = void 0;
        __privateMethod(this, _Owner_instances, restore_fn).call(this, part);
        __privateGet(this, _parts).delete(part);
        registered2.delete(part);
        __privateGet(this, _pending).delete(part);
        handOver(part);
      }
      // Binds every bound part again, in DOM order, for what they found when
      // they bound, like the menubar a menu joins, which may upgrade later.
      rebind() {
        const parts = inDocumentOrder(
          [...__privateGet(this, _parts)].filter((part) => !__privateGet(this, _pending).has(part))
        );
        for (const part of parts) {
          __privateMethod(this, _Owner_instances, unbind_fn).call(this, part);
        }
        for (const part of parts) {
          __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
        }
      }
      // Props changed. A new key needs a new binding. Other parts can depend on
      // this one's props, like radio items on their group's value, or on its
      // attributes, like toolbar items on their group's `disabled`, so they
      // read their props again and sync too.
      update(part, rebind) {
        if (__privateGet(this, _pending).has(part)) {
          return;
        }
        __privateMethod(this, _Owner_instances, rewatch_fn).call(this, part, rebind);
        __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
        for (const other of __privateGet(this, _parts)) {
          if (other === part || __privateGet(this, _pending).has(other)) {
            continue;
          }
          if (other.reread) {
            const previous = other.props;
            other.props = other.reread();
            __privateMethod(this, _Owner_instances, rewatch_fn).call(this, other, rekeyed(previous, other.props));
          }
          __privateMethod(this, _Owner_instances, sync_fn).call(this, other);
        }
        reconfigureInside(part.el);
      }
    }, _view = new WeakMap(), _Owner_instances = new WeakSet(), instance_get = function() {
      return instances.get(this);
    }, _parts = new WeakMap(), _pending = new WeakMap(), _connected = new WeakMap(), _rendering = new WeakMap(), _rendered = new WeakMap(), _applying = new WeakMap(), _stale = new WeakMap(), _gone = new WeakMap(), _properties = new WeakMap(), _state = new WeakMap(), _saved = new WeakMap(), // Options come from attributes and properties, with `defaults` over them.
    // Re-read them into the instance.
    configure_fn = function(defaults2) {
      var _a4;
      (_a4 = __privateGet(this, _Owner_instances, instance_get)) == null ? void 0 : _a4.setOptions(
        withEvents(
          this,
          {
            ...optionsOf(this, __privateGet(this, _properties), __privateGet(this, _rendered)),
            ...defaults2,
            id: __privateGet(this, _Owner_instances, instance_get).id
          },
          config.silent,
          config.actions,
          config.events
        )
      );
    }, // State set from script commits without events, like a native input's
    // `value`, so a page that renders the state back never hears its own write.
    quietly_fn = function(write) {
      const nested = quiet.has(this);
      quiet.add(this);
      try {
        writeFromScript(this, write);
      } finally {
        if (!nested) {
          quiet.delete(this);
          validityChanged(this);
        }
      }
    }, _renderCleanup = new WeakMap(), // Runs only while connected, when the instance exists.
    render_fn = function() {
      var _a4, _b3;
      (_a4 = __privateGet(this, _renderCleanup)) == null ? void 0 : _a4.call(this);
      __privateSet(this, _renderCleanup, ((_b3 = config.render) == null ? void 0 : _b3.call(config, this, __privateGet(this, _Owner_instances, instance_get))) || void 0);
    }, _childParts = new WeakMap(), _childObserver = new WeakMap(), _selfPart = new WeakMap(), registerSelf_fn = function(el) {
      __privateSet(this, _selfPart, { slot: config.self, el, props: {} });
      this.register(__privateGet(this, _selfPart));
    }, // The element the own slot binds was replaced: the new one binds instead.
    syncSelf_fn = function() {
      var _a4;
      if (!config.self || !config.target) {
        return;
      }
      const el = boundElement(this, config.target);
      if (el === ((_a4 = __privateGet(this, _selfPart)) == null ? void 0 : _a4.el)) {
        return;
      }
      if (__privateGet(this, _selfPart)) {
        this.unregister(__privateGet(this, _selfPart));
      }
      __privateSet(this, _selfPart, void 0);
      __privateMethod(this, _Owner_instances, configure_fn).call(this);
      if (el) {
        __privateMethod(this, _Owner_instances, registerSelf_fn).call(this, el);
      }
    }, registerChild_fn = function(slot, el) {
      var _a4, _b3, _c2;
      const part = {
        slot,
        el,
        props: (_c2 = (_b3 = (_a4 = config.childProps) == null ? void 0 : _a4.read) == null ? void 0 : _b3.call(_a4, el)) != null ? _c2 : {}
      };
      if (config.childProps) {
        part.observer = new MutationObserver(() => {
          var _a5, _b4, _c3;
          part.props = (_c3 = (_b4 = (_a5 = config.childProps).read) == null ? void 0 : _b4.call(_a5, el)) != null ? _c3 : {};
          __privateMethod(this, _Owner_instances, configure_fn).call(this);
          this.update(part, false);
        });
        part.observer.observe(el, {
          attributeFilter: config.childProps.attributes
        });
      }
      __privateGet(this, _childParts).set(slot, part);
      this.register(part);
    }, syncChildren_fn = function() {
      var _a4;
      for (const [slot, find] of Object.entries((_a4 = config.children) != null ? _a4 : {})) {
        const child = find(this);
        const current = __privateGet(this, _childParts).get(slot);
        if ((current == null ? void 0 : current.el) === child) {
          continue;
        }
        if (current) {
          this.unregister(current);
          __privateGet(this, _childParts).delete(slot);
        }
        if (child) {
          __privateMethod(this, _Owner_instances, registerChild_fn).call(this, slot, child);
        }
      }
    }, flush_fn = function() {
      const parts = inDocumentOrder([...__privateGet(this, _pending)]);
      __privateGet(this, _pending).clear();
      for (const part of parts) {
        if (!__privateGet(this, _parts).has(part)) {
          continue;
        }
        if (part.reread) {
          part.props = part.reread();
        }
        if (part.feature) {
          __privateGet(this, _Owner_instances, instance_get).use(part.feature);
        }
        __privateMethod(this, _Owner_instances, watch_fn).call(this, part);
        __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
      }
    }, // Syncs a part again when a change can affect it, so a highlight change
    // reaches the two items it moves between, not every part. Live state is
    // written by the core, so only changes to state that affects rendering
    // apply attributes again. A part that selects on a live key, like an
    // item on the highlight, hears that key alone, and has nothing to apply.
    watch_fn = function(part) {
      var _a4;
      const instance = __privateGet(this, _Owner_instances, instance_get);
      (_a4 = part.unwatch) == null ? void 0 : _a4.call(part);
      const record = instance.part(part.slot, part.props);
      part.record = record;
      part.selected = selectedKeys(record);
      part.version = renderVersion(instance);
      part.unwatch = subscribe(record, (liveOnly) => {
        if (present(record) !== part.shown) {
          part.version = renderVersion(instance);
          return __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
        }
        if (liveOnly) {
          return;
        }
        const version = renderVersion(instance);
        if (version === part.version) {
          return;
        }
        part.version = version;
        __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
      });
    }, rewatch_fn = function(part, rebind) {
      if (rebind) {
        __privateMethod(this, _Owner_instances, unbind_fn).call(this, part);
      }
      const record = __privateGet(this, _Owner_instances, instance_get).part(part.slot, part.props);
      if (record !== part.record || selectedKeys(record) !== part.selected) {
        __privateMethod(this, _Owner_instances, watch_fn).call(this, part);
      }
    }, sync_fn = function(part) {
      var _a4;
      if (__privateGet(this, _applying).has(part)) {
        return void __privateGet(this, _stale).add(part);
      }
      adoptStyles(part.el);
      const instance = __privateGet(this, _Owner_instances, instance_get);
      const record = instance.part(part.slot, part.props);
      (_a4 = part.disconnect) != null ? _a4 : part.disconnect = connect(record, part.el);
      part.shown = present(record);
      if (part.shown) {
        const target = __privateMethod(this, _Owner_instances, portalTarget_fn).call(this, part);
        if (target !== void 0 && __privateMethod(this, _Owner_instances, moves_fn).call(this, part, target)) {
          __privateMethod(this, _Owner_instances, unbind_fn).call(this, part);
          __privateMethod(this, _Owner_instances, move_fn).call(this, part, target);
        }
        const attrs2 = attrs(record);
        if (attrs2.hidden === void 0 && (conditional(record) || "hidden" in attrs2)) {
          part.el.removeAttribute("hidden");
        }
        __privateMethod(this, _Owner_instances, apply_fn).call(this, part, attrs2);
        if (!part.unbind) {
          __privateMethod(this, _Owner_instances, bind_fn).call(this, part, record);
        }
      } else {
        if (part.unbind) {
          __privateMethod(this, _Owner_instances, apply_fn).call(this, part, attrs(record));
          __privateMethod(this, _Owner_instances, unbind_fn).call(this, part);
        }
        if (!part.el.hasAttribute("hidden")) {
          part.el.setAttribute("hidden", "");
        }
        const slot = attrs(record)["data-slot"];
        if (slot && !part.el.hasAttribute("data-slot")) {
          part.el.setAttribute("data-slot", slot);
        }
        __privateMethod(this, _Owner_instances, restore_fn).call(this, part);
      }
    }, // Binding and unbinding can change state, which syncs parts again. The part
    // counts as bound from the start, so a nested sync never binds it twice,
    // and as unbound from the start, so it never unbinds twice.
    bind_fn = function(part, record) {
      let cleanup;
      let unbound = false;
      part.unbind = () => {
        unbound = true;
        cleanup == null ? void 0 : cleanup();
      };
      cleanup = bind(record, part.el);
      if (unbound) {
        cleanup();
      }
    }, unbind_fn = function(part) {
      const unbind = part.unbind;
      part.unbind = void 0;
      unbind == null ? void 0 : unbind();
    }, // Where a portaled slot's part belongs: a container, or null for in
    // place. Undefined for slots that never move.
    portalTarget_fn = function(part) {
      var _a4;
      if (!((_a4 = config.portal) == null ? void 0 : _a4.slots.includes(part.slot))) {
        return void 0;
      }
      return portalTarget(config.portal.container(this, part));
    }, moves_fn = function(part, target) {
      return target ? part.el.parentNode !== target : !!part.placeholder;
    }, // Moves a part into its container, or back in place for null.
    move_fn = function(part, target) {
      __privateMethod(this, _Owner_instances, restore_fn).call(this, part);
      if (!target) {
        return;
      }
      part.placeholder = document.createComment(`${tagName} ${part.slot}`);
      part.el.replaceWith(part.placeholder);
      target.appendChild(part.el);
      portals.set(part.el, target);
    }, // An attribute the owner writes on itself is state, not an option, like a
    // grouped checkbox's `disabled` from its group, so it never disables it for good.
    apply_fn = function(part, attrs2) {
      const inner = innerPart(part, this);
      if (inner == null ? void 0 : inner.dataSlot) {
        attrs2 = { ...attrs2, "data-slot": inner.dataSlot };
      }
      part.dataSlot = attrs2["data-slot"];
      const rendering = __privateGet(this, _rendering);
      __privateSet(this, _rendering, part.el === this);
      __privateGet(this, _applying).add(part);
      try {
        applyAttrs(part.el, attrs2, __privateGet(this, _Owner_instances, channel_get));
      } finally {
        __privateSet(this, _rendering, rendering);
        __privateGet(this, _applying).delete(part);
      }
      if (__privateGet(this, _stale).delete(part)) {
        __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
      }
    }, channel_get = function() {
      return `render:${autoId(this)}`;
    }, restore_fn = function(part) {
      if (!part.placeholder) {
        return;
      }
      part.placeholder.replaceWith(part.el);
      part.placeholder = void 0;
      portals.delete(part.el);
    }, __publicField(_c, "observedAttributes", [
      ...Object.keys(schema).map(kebab),
      ...semantics
    ]), (() => {
      for (const [name, { get, set }] of Object.entries(state)) {
        Object.defineProperty(_c.prototype, name, {
          get() {
            if (name in __privateGet(this, _state)) {
              return __privateGet(this, _state)[name];
            }
            return __privateGet(this, _Owner_instances, instance_get) ? get(__privateGet(this, _Owner_instances, instance_get).api) : void 0;
          },
          set(value) {
            wroteFromScript(this);
            if (__privateGet(this, _Owner_instances, instance_get) && !__privateGet(this, _gone)) {
              __privateMethod(this, _Owner_instances, quietly_fn).call(this, () => set(__privateGet(this, _Owner_instances, instance_get).api, value));
            } else {
              __privateGet(this, _state)[name] = value;
            }
          }
        });
      }
      for (const name of (_b3 = config.properties) != null ? _b3 : []) {
        Object.defineProperty(_c.prototype, name, {
          get() {
            return __privateGet(this, _properties)[name];
          },
          set(value) {
            if (Object.is(__privateGet(this, _properties)[name], value)) {
              return;
            }
            __privateGet(this, _properties)[name] = value;
            if (!__privateGet(this, _connected)) {
              return;
            }
            __privateMethod(this, _Owner_instances, configure_fn).call(this);
            __privateMethod(this, _Owner_instances, render_fn).call(this);
          }
        });
      }
      reflectAttributes(
        _c.prototype,
        schema,
        config.defaults
      );
    })(), _c)
  );
}
function definePartElement(tagName, config) {
  var _a3, _b3, _c, _owner, _part, _properties, _PartElement_instances, props_fn, _children, findOwnerLater_fn, retarget_fn;
  if (!claimTag(tagName)) {
    return;
  }
  const schema = (_a3 = config.props) != null ? _a3 : {};
  setDisplay(tagName, config.display, "align" in schema);
  customElements.define(
    tagName,
    (_c = class extends (config.formAssociated ? formAssociated(HTMLElement) : HTMLElement) {
      constructor() {
        super();
        __privateAdd(this, _PartElement_instances);
        __privateAdd(this, _owner);
        __privateAdd(this, _part);
        __privateAdd(this, _properties, {});
        // Watches the children for the element the part binds, which can come
        // later or be replaced, like a framework's conditional content.
        __privateAdd(this, _children);
        findOwnerAgain.set(this, () => {
          if (this.isConnected) {
            this.connectedCallback();
          }
        });
      }
      connectedCallback() {
        var _a4, _b3, _c2;
        upgradeProperties(this, [
          ...(_a4 = config.properties) != null ? _a4 : [],
          ...Object.keys(schema)
        ]);
        adoptStyles(this);
        if ((config.target || this.hasAttribute("as-child")) && !__privateGet(this, _children)) {
          __privateSet(this, _children, new MutationObserver(() => __privateMethod(this, _PartElement_instances, retarget_fn).call(this)));
          __privateGet(this, _children).observe(this, { childList: true });
        }
        const owner3 = (_b3 = findOwner(this, config.owner)) != null ? _b3 : __privateGet(this, _owner);
        if (!owner3) {
          return queueMicrotask(() => __privateMethod(this, _PartElement_instances, findOwnerLater_fn).call(this));
        }
        if (!("register" in owner3)) {
          customElements.whenDefined(owner3.localName).then(() => this.isConnected && this.connectedCallback());
          return;
        }
        if (owner3 === __privateGet(this, _owner) && __privateGet(this, _part) && registered2.has(__privateGet(this, _part))) {
          return;
        }
        if (__privateGet(this, _owner) && __privateGet(this, _part)) {
          __privateGet(this, _owner).unregister(__privateGet(this, _part));
        }
        const el = boundElement(this, config.target);
        if (!el) {
          return queueMicrotask(() => {
            if (this.isConnected && !__privateGet(this, _part) && !boundElement(this, config.target)) {
              warn(`<${tagName}> needs an element inside it.`);
            }
          });
        }
        if (!__privateGet(this, _part)) {
          (_c2 = config.render) == null ? void 0 : _c2.call(config, this);
          if (__privateGet(this, _part)) {
            return;
          }
        }
        __privateSet(this, _owner, owner3);
        __privateSet(this, _part, {
          slot: config.slot,
          feature: config.feature,
          el,
          props: __privateMethod(this, _PartElement_instances, props_fn).call(this),
          reread: (config.context || config.from) && (() => __privateMethod(this, _PartElement_instances, props_fn).call(this)),
          keyed: config.keyed
        });
        partOwners.set(this, owner3);
        slotParts.set(this, __privateGet(this, _part));
        owner3.register(__privateGet(this, _part));
      }
      disconnectedCallback() {
        whenGone(this, () => {
          var _a4;
          (_a4 = __privateGet(this, _children)) == null ? void 0 : _a4.disconnect();
          __privateSet(this, _children, void 0);
          if (__privateGet(this, _owner) && __privateGet(this, _part)) {
            __privateGet(this, _owner).unregister(__privateGet(this, _part));
          }
          partOwners.delete(this);
          slotParts.delete(this);
          __privateSet(this, _owner, void 0);
          __privateSet(this, _part, void 0);
        });
      }
      attributeChangedCallback(name) {
        var _a4, _b3, _c2;
        markAuthored(this, name);
        if (semantics.includes(name)) {
          return;
        }
        if (name === "for") {
          if (!this.isConnected) {
            return;
          }
          if (!findOwner(this, config.owner) && __privateGet(this, _owner) && __privateGet(this, _part)) {
            __privateGet(this, _owner).unregister(__privateGet(this, _part));
            __privateSet(this, _owner, void 0);
            partOwners.delete(this);
          }
          this.connectedCallback();
          return;
        }
        if (!__privateGet(this, _owner) || !__privateGet(this, _part)) {
          if (config.alone && this.isConnected && !findOwner(this, config.owner)) {
            config.alone((_a4 = boundElement(this, config.target)) != null ? _a4 : this, this);
          }
          return;
        }
        const previous = __privateGet(this, _part).props;
        __privateGet(this, _part).props = __privateMethod(this, _PartElement_instances, props_fn).call(this);
        const next = __privateGet(this, _part).props;
        const rebind = rekeyed(previous, next) || !!((_b3 = config.rebind) == null ? void 0 : _b3.some((name2) => previous[name2] !== next[name2]));
        __privateGet(this, _owner).update(__privateGet(this, _part), rebind);
        (_c2 = config.changed) == null ? void 0 : _c2.call(config, this);
      }
    }, _owner = new WeakMap(), _part = new WeakMap(), _properties = new WeakMap(), _PartElement_instances = new WeakSet(), // What the element says itself, its attributes and properties, wins
    // over what its surroundings give it.
    props_fn = function() {
      var _a4, _b3, _c2, _d, _e, _f, _g, _h, _i;
      const props = {
        ...(_a4 = config.context) == null ? void 0 : _a4.call(config, this),
        ...readAttributes(this, schema)
      };
      for (const name of (_b3 = config.properties) != null ? _b3 : []) {
        if (__privateGet(this, _properties)[name] !== void 0) {
          props[name] = __privateGet(this, _properties)[name];
        }
      }
      for (const [name, { slot, prop }] of Object.entries(
        (_c2 = config.from) != null ? _c2 : {}
      )) {
        (_e = props[name]) != null ? _e : props[name] = (_d = propsAround(this, slot, __privateGet(this, _owner))) == null ? void 0 : _d[prop];
      }
      for (const name of (_f = config.ids) != null ? _f : []) {
        (_g = props[name]) != null ? _g : props[name] = autoId(this);
      }
      if (props.value === void 0 && props.id === void 0) {
        props.id = autoId(this);
      }
      if (config.keyed && hasRichValue(props)) {
        (_i = props.id) != null ? _i : props.id = (_h = instanceOf(__privateGet(this, _owner))) == null ? void 0 : _h.api.internal.keyOf(
          props.value
        );
      }
      return withEvents(this, props, [], config.actions);
    }, _children = new WeakMap(), // Put back on the page, a part can connect before what leads to its owner
    // does, like an item in a list its owner renders again. Warned only when
    // the owner is still missing once the task's other elements connected.
    findOwnerLater_fn = function() {
      var _a4;
      if (!this.isConnected || __privateGet(this, _owner)) {
        return;
      }
      if (findOwner(this, config.owner)) {
        this.connectedCallback();
      } else if (config.alone) {
        config.alone((_a4 = boundElement(this, config.target)) != null ? _a4 : this, this);
      } else if (!this.hasAttribute("for")) {
        warn(`<${tagName}> must be inside ${config.owner}.`);
      }
    }, // The element the part binds came, left or was replaced: the part lets go
    // of the old one and registers again with what's there now. One the owner
    // moved into a portal, like an input a sheet puts in its header, stays bound.
    retarget_fn = function() {
      var _a4;
      const old = (_a4 = __privateGet(this, _part)) == null ? void 0 : _a4.el;
      if (!this.isConnected || old && portals.has(old)) {
        return;
      }
      const el = boundElement(this, config.target);
      if (el === (old != null ? old : null)) {
        return;
      }
      if (__privateGet(this, _owner) && __privateGet(this, _part)) {
        __privateGet(this, _owner).unregister(__privateGet(this, _part));
      }
      __privateSet(this, _owner, void 0);
      __privateSet(this, _part, void 0);
      if (el) {
        this.connectedCallback();
      }
    }, __publicField(_c, "observedAttributes", [
      ...Object.keys(schema).map(kebab),
      "for",
      ...semantics
    ]), (() => {
      for (const name of (_b3 = config.properties) != null ? _b3 : []) {
        Object.defineProperty(_c.prototype, name, {
          get() {
            var _a4;
            return (_a4 = __privateGet(this, _properties)[name]) != null ? _a4 : schema[name] && readAttribute(this, name, schema[name]);
          },
          set(value) {
            __privateGet(this, _properties)[name] = value;
            this.attributeChangedCallback("");
          }
        });
      }
      reflectAttributes(_c.prototype, schema, config.defaults);
    })(), _c)
  );
}
var rootTags = /* @__PURE__ */ new WeakMap();
function elementProps(props, schema, kinds = {}) {
  const attributes = {};
  const properties = [];
  const ids = [];
  const actions = [];
  let keyed = false;
  const from = {};
  for (const [name, spec] of Object.entries({ ...props, ...kinds })) {
    if (!spec) {
      continue;
    }
    if (typeof spec === "object") {
      const [slot, prop = name] = spec.from.split(".");
      if (slot in schema.slots) {
        from[name] = { slot, prop };
      }
      if (!(name in kinds)) {
        continue;
      }
    }
    const kind = typeof spec === "object" ? spec.kind : spec;
    if (kind === "value") {
      properties.push(name);
    } else if (kind === "action") {
      actions.push(name);
    } else if (kind === "id") {
      ids.push(name);
    } else if (kind === "key") {
      keyed = true;
    }
    if (kind === "value" || kind === "action" || kind === "callback") {
      continue;
    }
    if (name !== "id" || name in kinds) {
      attributes[name] = kind === "id" || kind === "key" ? "string" : kind;
    }
  }
  return {
    attributes,
    properties,
    ids,
    actions,
    keyed,
    from: Object.keys(from).length ? from : void 0
  };
}
var tagOf = (tagOrOptions) => typeof tagOrOptions === "string" ? { tag: tagOrOptions } : tagOrOptions;
function partElement(primitive, key, tagOrOptions, root) {
  var _a3, _b3, _c, _d, _e;
  const schema = schemaOf(primitive);
  if (key === "root") {
    const {
      tag: tag2,
      self,
      kinds: kinds2,
      properties: properties2 = [],
      ...options2
    } = tagOf(tagOrOptions);
    rootTags.set(primitive, [
      .../* @__PURE__ */ new Set([...(_a3 = rootTags.get(primitive)) != null ? _a3 : [], tag2])
    ]);
    const { debug: _debug, ...optionSchema } = schema.options;
    const props2 = elementProps(optionSchema, schema, kinds2);
    const config2 = {
      ...options2,
      self: self != null ? self : "root" in schema.slots && !((_b3 = options2.children) == null ? void 0 : _b3.root) ? "root" : void 0,
      attributes: props2.attributes,
      // Live state has its own property.
      properties: [.../* @__PURE__ */ new Set([...props2.properties, ...properties2])].filter(
        (name) => {
          var _a4;
          return !((_a4 = options2.state) == null ? void 0 : _a4[name]);
        }
      ),
      actions: props2.actions
    };
    return { kind: "owner", key, tagName: tag2, config: config2 };
  }
  const {
    tag,
    slot = key,
    owners = [],
    kinds,
    properties = [],
    ...options
  } = tagOf(tagOrOptions);
  const roots2 = rootTags.get(primitive);
  if (!roots2) {
    throw new Error(
      `<${tag}> is a part of ${primitive.name}: define its root first.`
    );
  }
  const slotSchema = (_e = schema.slots[slot]) != null ? _e : ((_c = options.feature) == null ? void 0 : _c.slots[slot]) && ((_d = options.feature.slots[slot].props) != null ? _d : {});
  if (!slotSchema) {
    throw new Error(`<${tag}>: ${primitive.name} has no ${slot} slot.`);
  }
  const { attributes, ...props } = elementProps(slotSchema, schema, kinds);
  const config = {
    ...options,
    slot,
    owner: [.../* @__PURE__ */ new Set([...root ? [root] : [], ...roots2, ...owners])].join(
      ", "
    ),
    props: attributes,
    ...props,
    properties: [.../* @__PURE__ */ new Set([...props.properties, ...properties])]
  };
  return { kind: "part", key, tagName: tag, config };
}
function partElements(primitive, tags) {
  const { root, ...parts } = tags;
  const owner3 = partElement(primitive, "root", root);
  return [
    owner3,
    ...Object.entries(
      parts
    ).flatMap(
      ([key, tag]) => tag ? [partElement(primitive, key, tag, owner3.tagName)] : []
    )
  ];
}
function defineElement(primitive, element2) {
  if (element2.kind === "owner") {
    defineRootElement(element2.tagName, primitive, element2.config);
  } else {
    definePartElement(element2.tagName, element2.config);
  }
}
var pascal = (name) => name.replace(/(^|-)(\w)/g, (_, _dash, char) => char.toUpperCase());
function createParts(primitive, tags) {
  const parts = {};
  for (const element2 of partElements(primitive, tags)) {
    defineElement(primitive, element2);
    parts[pascal(element2.key)] = typeof customElements === "undefined" ? void 0 : customElements.get(element2.tagName);
  }
  return parts;
}

// node_modules/@ui-sdk/web/dist/token-input.js
var owner = "ui-token-input";
function tokenOf(el) {
  var _a3, _b3;
  const id = (_b3 = (_a3 = el.closest("[data-token-id]")) == null ? void 0 : _a3.getAttribute("data-token-id")) != null ? _b3 : "";
  return { id, token: id };
}
function defineTokenInputElements() {
  createParts(tokenInput, {
    root: {
      tag: owner,
      formAssociated: true,
      properties: ["renderToken"],
      // The submit shortcut submits the form the element is in, so a form's own
      // submit event hears it. A bubbling "submit" event would reach the form too.
      silent: ["onSubmit"],
      // A disabled <ui-field> around it disables it, as a disabled Field does
      // in the other frameworks.
      options: (el) => {
        var _a3;
        return {
          ...((_a3 = el.closest("ui-field")) == null ? void 0 : _a3.hasAttribute("disabled")) && {
            disabled: true
          }
        };
      },
      display: "block",
      state: {
        value: {
          get: (api) => api.getValue(),
          set: (api, value) => api.setValue(
            typeof value === "string" ? api.internal.codec().parse(value) : value
          )
        }
      },
      api: [
        "getValue",
        "setValue",
        "getText",
        "getLabel",
        "insert",
        "updateToken",
        "removeToken",
        "undo",
        "redo",
        "canUndo",
        "canRedo",
        "clear",
        "focus"
      ],
      render(el, { api, subscribe: subscribe2 }) {
        const target = el;
        const mode = contentMode(target);
        api.internal.setCustom(mode !== "label");
        reconfigureInside(el);
        const rendered2 = /* @__PURE__ */ new WeakMap();
        const showTokens = () => renderTokens(target, api, rendered2);
        showTokens();
        const unsubscribe = subscribe2(showTokens);
        return () => {
          unsubscribe();
          if (el.isConnected && contentMode(target) === mode) {
            return;
          }
          for (const { host } of api.internal.hosts()) {
            if (rendered2.has(host)) {
              host.replaceChildren();
            }
          }
        };
      }
    },
    editor: { tag: "ui-token-input-editor", display: "block" },
    token: { tag: "ui-token-input-token", context: tokenOf },
    "token-remove": { tag: "ui-token-input-token-remove", context: tokenOf }
  });
}
var contentMode = (el) => el.renderToken ? "renderToken" : el.querySelector(":scope > template") ? "template" : "label";
function renderTokens(el, api, rendered2) {
  const template = el.querySelector(":scope > template");
  for (const { token, host } of api.internal.hosts()) {
    if (rendered2.get(host) === token) {
      continue;
    }
    rendered2.set(host, token);
    if (el.renderToken) {
      el.renderToken(token, host);
      continue;
    }
    if (!template) {
      continue;
    }
    if (!host.firstChild) {
      host.append(template.content.cloneNode(true));
    }
    for (const label of host.querySelectorAll("[data-token-label]")) {
      label.textContent = token.label;
    }
  }
}

// node_modules/@ui-sdk/web/dist/entries/token-input.js
defineTokenInputElements();

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu-parts.js
var noItems2 = [];
function contentState(state, { api }) {
  var _a3, _b3, _c;
  return {
    open: state.open,
    trigger: state.trigger,
    query: state.query,
    argument: state.argument,
    status: (_a3 = api.internal.options().status) != null ? _a3 : state.loading,
    items: (_c = (_b3 = api.internal.listbox.visibleData()) == null ? void 0 : _b3.list) != null ? _c : noItems2
  };
}
var unreadByItems = {
  open: [],
  mounted: [],
  navigated: [],
  trigger: [],
  query: [],
  argument: [],
  hint: [],
  items: [],
  loading: [],
  editor: [],
  field: [],
  listed: [],
  hasEmpty: [],
  settled: [],
  mounts: [],
  groupLabels: [],
  payload: [],
  pending: [],
  titled: [],
  described: [],
  modal: [],
  presentation: []
};
var triggerMenuSlots = (slot) => ({
  // A <textarea> by default, or an <input> through custom rendering.
  input: slot({
    role: (state) => state.field === "input" ? "combobox" : void 0,
    roles: ["combobox"],
    focus: "native",
    // Home and End move the caret, which ends the match.
    keys: [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "ctrl+n",
      "ctrl+p",
      "Enter",
      "Tab",
      "Escape",
      "Home",
      "End"
    ],
    state: (state) => ({ open: state.open, trigger: state.trigger }),
    attrs: (state) => {
      var _a3;
      return {
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        "data-trigger": (_a3 = state.trigger) != null ? _a3 : void 0,
        ...openAttrs(state.open)
      };
    },
    // The expansion and active option, which depend on the element and the arrow keys.
    live: live((state, { api }) => {
      const {
        "aria-expanded": expanded,
        "aria-controls": controls,
        "aria-activedescendant": active2
      } = api.internal.fieldAttrs(state, state.field);
      return {
        "aria-expanded": expanded,
        "aria-controls": controls,
        "aria-activedescendant": active2
      };
    }),
    on: {
      keydown: (event, { api }) => api.internal.onKeyDown(event)
    },
    bind(el, { api }) {
      const field = el;
      api.internal.setOwnEditor(
        textFieldAdapter(field),
        field.localName === "input" ? "input" : "multiline"
      );
      return () => api.internal.setOwnEditor(void 0);
    }
  }),
  content: slot({
    props: {
      side: "string",
      align: "string",
      sideOffset: "number",
      alignOffset: "number",
      collisionPadding: "number",
      arrowPadding: "number",
      container: "value",
      anchor: "string",
      keepMounted: "boolean"
    },
    connect: registerPopupElement,
    // A list inside it is the listbox instead.
    role: (state) => state.listed ? "presentation" : "listbox",
    roles: ["presentation", "listbox"],
    keys: {
      none: "The editor handles them, and keeps focus while they move the highlight."
    },
    state: contentState,
    present: (state, { props }) => state.mounted || !!props.keepMounted,
    attrs: (state, { id, api }) => {
      var _a3;
      return {
        ...popupContentAttrs(state, id),
        ...state.listed ? {} : api.internal.listLabel(),
        "aria-busy": !state.listed && state.loading === "loading" ? "true" : void 0,
        "data-trigger": (_a3 = state.trigger) != null ? _a3 : void 0
      };
    },
    // Pressing the list keeps focus, the caret and the on-screen keyboard in the editor.
    on: pressKeepsFocus,
    bind(el, part) {
      const { api, key, store } = part;
      const { internal } = api;
      let active2 = true;
      queueMicrotask(() => {
        if (!active2) {
          return;
        }
        store.set({ settled: true });
        internal.settle();
      });
      let last = { x: 0, y: 0, width: 0, height: 0 };
      const textAnchor = {
        getBoundingClientRect: () => {
          var _a3;
          return last = (_a3 = internal.anchorRect()) != null ? _a3 : last;
        }
      };
      const unbind = internal.popup.bind(el, {
        anchor: () => contentAnchor(
          el,
          internal.contentProps(key).anchor,
          () => textAnchor
        ),
        position: () => placementOptions(internal.contentProps(key), { align: "start" }),
        rendered: (listener) => onProps(part, listener),
        // Focus stays in the editor.
        initialFocus: () => void 0
      });
      return () => {
        active2 = false;
        unbind();
        store.set({ settled: false });
      };
    }
  }),
  list: slot({
    role: "listbox",
    keys: {
      none: "The editor handles them, and keeps focus while they move the highlight."
    },
    state: contentState,
    attrs: (state, { id, api }) => ({
      id: `${id}-list`,
      ...api.internal.listLabel(),
      "aria-busy": state.loading === "loading" ? "true" : void 0
    }),
    bind: (_, { store }) => flagWhileBound(store, "listed")
  }),
  item: slot({
    // `onSelect`'s Promise makes the token it inserts pending.
    props: {
      value: "key",
      label: "string",
      keywords: "list",
      disabled: "boolean",
      onSelect: "action",
      // Internal: passed by renderers, from the group it's inside.
      group: { kind: "string", from: "group.id" }
    },
    selects: selects({
      highlighted: ({ key }) => [key],
      listing: ({ key }) => [key],
      ...unreadByItems
    }),
    role: "option",
    focus: "active-descendant",
    state: (state, { key, props }) => ({
      highlighted: state.highlighted === key,
      disabled: !!props.disabled
    }),
    attrs: (state, { id, key, props, api }) => ({
      id: `${id}-option-${idPart(key)}`,
      "aria-disabled": props.disabled ? "true" : void 0,
      // Written by `live`, so moving the highlight doesn't render every option.
      "aria-selected": void 0,
      hidden: api.internal.listbox.matches(key, props) ? void 0 : "",
      "data-disabled": props.disabled ? "" : void 0
    }),
    // Typing hides options without rendering them.
    direct: direct(["hidden"]),
    live: live((state, { key }) => ({
      "aria-selected": state.highlighted === key ? "true" : "false",
      "data-highlighted": state.highlighted === key ? "" : void 0
    })),
    on: {
      ...pressKeepsFocus,
      pointermove(event, { api, key, store }) {
        if (event.pointerType === "touch" || !store.get().open) {
          return;
        }
        if (store.get().highlighted !== key) {
          api.internal.listbox.highlight(key, { event });
        }
      }
    },
    press: ({ api, key }, event) => api.internal.choose(key, event),
    bind(el, { api, key, props }) {
      const unregister = api.internal.listbox.register(key, el, () => {
        var _a3;
        const latest = (_a3 = api.internal.itemProps(key)) != null ? _a3 : props;
        return {
          value: latest.value,
          label: latest.label,
          keywords: latest.keywords,
          disabled: latest.disabled,
          group: latest.group
        };
      });
      return unregister;
    }
  }),
  // An icon inside a suggestion.
  "item-icon": slot(
    itemIconPart({
      component: "trigger-menu",
      ...optionIcon
    })
  ),
  group: slot({
    // Its id is made for it, and names the group its items and label are in.
    props: { id: "id" },
    role: "group",
    attrs: (state, { id, key, api }) => ({
      "aria-labelledby": groupLabelledBy(state, id, key),
      hidden: api.internal.listbox.groupMatches(key) ? void 0 : ""
    })
  }),
  "group-label": slot(groupLabelPart()),
  // A listbox may only hold options and groups, so separators are hidden from assistive technology.
  separator: slot({
    role: "none",
    attrs: (state) => ({
      "aria-hidden": "true",
      hidden: state.query && !state.items ? "" : void 0
    })
  }),
  // Shown while no item matches. Rendering it keeps the menu open with no matches.
  empty: slot({
    // Internal: passed by renderers.
    props: { stash: "boolean" },
    role: "status",
    state: (state, { api }) => {
      var _a3;
      return {
        loading: ((_a3 = api.internal.options().status) != null ? _a3 : state.loading) === "loading",
        empty: api.internal.isEmpty(state),
        query: state.query
      };
    },
    attrs: (state, { api }) => ({
      "aria-live": "polite",
      "aria-atomic": "true",
      "data-empty": api.internal.isEmpty(state) ? "" : void 0,
      "data-loading": state.loading === "loading" ? "" : void 0
    }),
    bind(el, { api, store, props }) {
      if (!store.get().hasEmpty) {
        queueMicrotask(api.internal.markEmptyPart);
      }
      if (props.stash) {
        return stashContent(
          el,
          () => api.internal.isEmpty(store.get()),
          store.subscribe
        );
      }
    }
  }),
  // A polite status outside the popup. Without content of its own, it says the
  // count and the keys, a moment after typing pauses.
  status: slot({
    // Internal: passed by renderers.
    props: { text: "boolean" },
    state: (state, { api }) => {
      var _a3, _b3;
      return {
        open: state.open,
        status: (_a3 = api.internal.options().status) != null ? _a3 : state.loading,
        loading: ((_b3 = api.internal.options().status) != null ? _b3 : state.loading) === "loading",
        count: api.internal.itemCount(),
        argument: state.argument
      };
    },
    role: "status",
    attrs: () => ({ "aria-live": "polite", "aria-atomic": "true" }),
    bind: (_, { api }) => api.internal.announceState()
  }),
  // Ghost text for the arguments still to type, drawn at the caret.
  hint: slot({
    // Internal: passed by renderers.
    props: { text: "boolean" },
    present: (state) => !!state.hint,
    state: (state) => ({ argument: state.argument, hint: state.hint }),
    attrs: () => ({ "aria-hidden": "true" }),
    bind(el, { api, props, store }) {
      const computed = getComputedStyle(el);
      if (computed.position === "static") {
        el.style.position = "fixed";
      }
      el.style.pointerEvents = "none";
      const write = () => {
        if (props.text && el.textContent !== store.get().hint) {
          el.textContent = store.get().hint;
        }
      };
      write();
      let last = { x: 0, y: 0, width: 0, height: 0 };
      const unsubscribe = store.subscribe(write);
      const side = computed.direction === "rtl" ? "left" : "right";
      const stop = position(
        () => ({
          getBoundingClientRect: () => {
            var _a3;
            return last = (_a3 = api.internal.caretRect()) != null ? _a3 : last;
          }
        }),
        el,
        { side, align: "center", sideOffset: 2, collisionPadding: 0 }
      );
      return () => {
        unsubscribe();
        stop();
      };
    }
  })
});

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu-api.js
init_events();
init_announce();

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu-keyboard.js
function createTriggerMenuKeyboard({
  store,
  listbox,
  active: active2,
  inArguments,
  choose,
  accept,
  dismiss,
  caretMove
}) {
  function move(event, step) {
    event.preventDefault();
    store.set({ navigated: true });
    listbox.move(step, event);
  }
  function onKeyDown(event) {
    if (!active2()) {
      return;
    }
    const { open, highlighted } = store.get();
    const step = listStep(event, { apple: isApple() });
    const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";
    if (step !== void 0) {
      if (open && !(arrow && (event.altKey || event.metaKey))) {
        move(event, step);
      }
      return;
    }
    switch (event.key) {
      case "Enter":
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (!open && !inArguments()) {
          return;
        }
        event.preventDefault();
        if (inArguments()) {
          return accept(event, { tab: false });
        }
        if (highlighted !== null) {
          choose(highlighted, event, { tab: false });
        }
        return;
      case "Tab":
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (inArguments()) {
          event.preventDefault();
          return accept(event, { tab: true });
        }
        if (open && highlighted !== null) {
          event.preventDefault();
          choose(highlighted, event, { tab: true });
        }
        return;
      case "Escape":
        if (open) {
          return;
        }
        event.preventDefault();
        dismiss(event);
        return;
      case "Home":
      case "End":
        caretMove(event);
        return;
    }
  }
  return { onKeyDown };
}

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-match.js
var defaultPattern = /[\p{L}\p{N}\p{M}_\-.]/u;
var defaultMaxLength = 50;
var fullWidth = {
  "\uFF20": "@",
  "\uFF03": "#",
  "\uFF0F": "/",
  "\uFF0B": "+",
  "\uFF1A": ":",
  "\uFF3B": "["
};
var fullWidthPattern = /[＠＃／＋：［]/g;
function normalizeTriggerText(text) {
  return text.replace(fullWidthPattern, (char) => fullWidth[char]);
}
var openers = /* @__PURE__ */ new Set(["(", "[", "{", '"', "'", "\uFFFC"]);
var stateless = /* @__PURE__ */ new WeakMap();
function characterPattern(pattern) {
  if (!pattern.global && !pattern.sticky) {
    return pattern;
  }
  let copy2 = stateless.get(pattern);
  if (!copy2) {
    stateless.set(
      pattern,
      copy2 = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""))
    );
  }
  return copy2;
}
function isValidQuery(query, rule) {
  var _a3, _b3, _c;
  if (query.length > ((_a3 = rule.maxLength) != null ? _a3 : defaultMaxLength)) {
    return false;
  }
  if (/^\s/.test(query) || query.includes("\n")) {
    return false;
  }
  const pattern = characterPattern((_b3 = rule.pattern) != null ? _b3 : defaultPattern);
  const spaces = (_c = rule.spaces) != null ? _c : false;
  let words = 1;
  let previous = "";
  for (const char of query) {
    if (char === " ") {
      if (!spaces || previous === " ") {
        return false;
      }
      words++;
    } else if (!pattern.test(char)) {
      return false;
    }
    previous = char;
  }
  return typeof spaces !== "number" || words - (previous === " " ? 1 : 0) <= spaces;
}
function isAtBoundary(text, index, offset, boundary) {
  const absolute = offset + index;
  if (boundary === "anywhere" || absolute === 0) {
    return true;
  }
  if (boundary === "start") {
    return false;
  }
  if (index === 0) {
    return false;
  }
  const before = text[index - 1];
  if (boundary === "line") {
    return before === "\n";
  }
  return /\s/.test(before) || openers.has(before);
}
function lookBehind(rules2) {
  var _a3;
  let longest2 = 0;
  for (const rule of rules2) {
    longest2 = Math.max(
      longest2,
      ((_a3 = rule.maxLength) != null ? _a3 : defaultMaxLength) + rule.char.length
    );
  }
  return longest2 + 1;
}
function findTriggerMatch(text, offset, rules2) {
  if (!rules2.length) {
    return null;
  }
  const source = normalizeTriggerText(text);
  const caret = source.length;
  const limit = lookBehind(rules2);
  for (let index = caret - 1; index >= 0 && caret - index <= limit; index--) {
    for (let rule = 0; rule < rules2.length; rule++) {
      const { char: char2, boundary = "word" } = rules2[rule];
      if (!char2 || !source.startsWith(char2, index)) {
        continue;
      }
      const query = text.slice(index + char2.length);
      if (isValidQuery(normalizeTriggerText(query), rules2[rule]) && isAtBoundary(source, index, offset, boundary)) {
        return {
          rule,
          match: {
            trigger: char2,
            start: offset + index,
            end: offset + caret,
            query
          }
        };
      }
    }
    const char = source[index];
    const continues2 = rules2.some(
      (rule) => {
        var _a3;
        return rule.char.includes(char) || char === " " && !!rule.spaces || characterPattern((_a3 = rule.pattern) != null ? _a3 : defaultPattern).test(char);
      }
    );
    if (!continues2) {
      break;
    }
  }
  return null;
}
function mapDismissed(dismissed, range, inserted) {
  const delta = inserted - (range.end - range.start);
  const triggerEnd = dismissed.start + dismissed.trigger.length;
  if (range.end <= dismissed.start) {
    return {
      ...dismissed,
      start: dismissed.start + delta,
      end: dismissed.end + delta
    };
  }
  if (range.start < triggerEnd) {
    return null;
  }
  if (range.start <= dismissed.end) {
    return { ...dismissed, end: Math.max(triggerEnd, dismissed.end + delta) };
  }
  return dismissed;
}

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu-levels.js
var argumentOf = (level) => {
  var _a3, _b3;
  return (_b3 = (_a3 = level == null ? void 0 : level.item) == null ? void 0 : _a3.arguments) == null ? void 0 : _b3[level.starts.length - 1];
};
var triggerLevel = (found2) => ({
  rule: found2.rule,
  match: found2.match,
  queryStart: found2.match.start + found2.match.trigger.length,
  starts: [],
  values: {}
});
function createTriggerLevels({
  editor,
  rules: rules2,
  isWriting,
  apply,
  close
}) {
  let current = null;
  let dismissed = [];
  function caret() {
    var _a3;
    const selection = (_a3 = editor()) == null ? void 0 : _a3.selection();
    return selection && selection.start === selection.end ? selection.end : null;
  }
  function textFrom(start) {
    var _a3;
    const at = caret();
    if (at === null || at < start) {
      return null;
    }
    const before = (_a3 = editor()) == null ? void 0 : _a3.textBefore(at - start);
    return before && before.offset === start ? before.text : null;
  }
  function matchAtCaret() {
    var _a3;
    if (caret() === null) {
      return null;
    }
    const before = (_a3 = editor()) == null ? void 0 : _a3.textBefore(lookBehind(rules2()));
    return before ? findTriggerMatch(before.text, before.offset, rules2()) : null;
  }
  function enter(level, query, reason, open, event) {
    current = level;
    apply(level, query, reason, open, event);
  }
  function end(reason, event, { dismiss = false } = {}) {
    var _a3;
    const level = current;
    if (dismiss && level && !level.continued) {
      const at = (_a3 = caret()) != null ? _a3 : level.match.end;
      dismissed.push({
        trigger: level.match.trigger,
        start: level.match.start,
        end: Math.max(at, level.match.end)
      });
    }
    current = null;
    close(reason, event);
  }
  function reopen(reason, event) {
    const found2 = matchAtCaret();
    if (!found2) {
      return false;
    }
    dismissed = dismissed.filter((entry) => entry.start !== found2.match.start);
    enter(
      triggerLevel(found2),
      found2.match.query,
      reason === "shortcut" ? "input-change" : "imperative",
      reason,
      event
    );
    return true;
  }
  function onInput(change) {
    var _a3;
    dismissed = dismissed.flatMap(
      (entry) => {
        var _a4;
        return (_a4 = mapDismissed(entry, change.range, change.inserted.length)) != null ? _a4 : [];
      }
    );
    if (isWriting() || ((_a3 = editor()) == null ? void 0 : _a3.composing())) {
      return;
    }
    if ((current == null ? void 0 : current.item) || (current == null ? void 0 : current.continued)) {
      return followLevel(change.user);
    }
    const found2 = matchAtCaret();
    const isDismissed = !!found2 && dismissed.some(
      (entry) => entry.start === found2.match.start && entry.trigger === found2.match.trigger
    );
    const editEnd = change.range.start + change.inserted.length;
    const touched2 = !!found2 && change.range.start <= found2.match.end && editEnd >= found2.match.start;
    const same = !!found2 && (current == null ? void 0 : current.match.start) === found2.match.start && current.match.trigger === found2.match.trigger;
    if (!found2 || isDismissed || !same && !(change.user && touched2)) {
      if (current) {
        end("input-change");
      }
      return;
    }
    enter(
      triggerLevel(found2),
      found2.match.query,
      "input-change",
      "input-change"
    );
  }
  function followLevel(user) {
    var _a3;
    const level = current;
    const at = caret();
    if (at === null) {
      return end("input-change");
    }
    if (at < level.queryStart) {
      return user ? stepBack() : end("input-change");
    }
    const query = (_a3 = textFrom(level.queryStart)) != null ? _a3 : "";
    if (query.includes("\n") || level.continued && !isValidQuery(query, rules2()[level.rule])) {
      return end("input-change");
    }
    enter(
      { ...level, match: { ...level.match, end: at } },
      query,
      "input-change",
      "input-change"
    );
  }
  function stepBack() {
    var _a3;
    const level = current;
    if (level.continued) {
      return end("input-change");
    }
    if (level.starts.length > 1) {
      const starts = level.starts.slice(0, -1);
      const values = { ...level.values };
      delete values[level.item.arguments[starts.length - 1].name];
      const queryStart = starts.at(-1);
      return enter(
        { ...level, starts, values, queryStart },
        (_a3 = textFrom(queryStart)) != null ? _a3 : "",
        "input-change",
        "input-change"
      );
    }
    current = null;
    const found2 = matchAtCaret();
    if (!found2) {
      return end("input-change");
    }
    enter(
      triggerLevel(found2),
      found2.match.query,
      "input-change",
      "input-change"
    );
  }
  function onSelection() {
    var _a3;
    if (!current || isWriting()) {
      return;
    }
    const at = caret();
    if (at === null || at < current.queryStart) {
      return end("caret-move");
    }
    if (current.item || current.continued) {
      return;
    }
    if (((_a3 = matchAtCaret()) == null ? void 0 : _a3.match.start) !== current.match.start) {
      end("caret-move");
    }
  }
  return {
    current: () => current,
    caret,
    textFrom,
    matchAtCaret,
    enter,
    end,
    reopen,
    onEditorChange(change) {
      if (change.type === "input") {
        onInput(change);
      } else if (change.type === "selection") {
        onSelection();
      }
    }
  };
}

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu-select.js
function itemsByKey(data, toKey) {
  const map = /* @__PURE__ */ new Map();
  const visit = (list) => {
    for (const entry of list) {
      if (typeof entry === "object" && "type" in entry) {
        if (entry.type === "group") {
          visit(entry.items);
        }
        continue;
      }
      const item = toListItem(
        entry
      );
      map.set(toKey(item.value), item);
    }
  };
  if (data) {
    visit(data);
  }
  return map;
}
function defaultInsert(item, level, rule, tokens, toKey) {
  var _a3;
  const values = Object.values(level.values);
  const trigger = level.continued ? "" : level.match.trigger;
  if (!tokens) {
    return `${[`${trigger}${item.label}`, ...values].join(" ")} `;
  }
  return {
    type: (_a3 = rule.type) != null ? _a3 : "mention",
    value: toKey(item.value),
    label: [item.label, ...values].join(" "),
    data: { trigger, ...values.length ? { arguments: level.values } : {} }
  };
}
function createTriggerSelect({
  levels,
  editor,
  options,
  items,
  find,
  highlighted,
  itemProps,
  toKey,
  waiting
}) {
  let writing2 = false;
  let byKey = itemsByKey(void 0, toKey);
  let byKeyData;
  function itemFor(key) {
    const data = items();
    if (data !== byKeyData) {
      byKeyData = data;
      byKey = itemsByKey(data, toKey);
    }
    const fromData = byKey.get(key);
    if (fromData) {
      return fromData;
    }
    const entry = find(key);
    if (!entry) {
      return void 0;
    }
    const props = itemProps(key);
    const onSelect = props && "onSelect" in props ? props.onSelect : void 0;
    const composed = {
      value: entry.value,
      label: entry.label,
      keywords: entry.keywords,
      disabled: entry.disabled,
      onSelect
    };
    return composed;
  }
  function write(range, content, pending2) {
    const target = editor();
    if (!target) {
      return;
    }
    writing2 = true;
    try {
      target.replace(range, content, pending2 ? { pending: pending2 } : void 0);
    } finally {
      writing2 = false;
    }
  }
  function choose(key, event, { tab = false } = {}) {
    var _a3;
    const level = levels.current();
    if (!level) {
      return;
    }
    if (level.item) {
      return accept(event, { tab });
    }
    const item = itemFor(key);
    const at = levels.caret();
    if (!item || item.disabled || at === null) {
      return;
    }
    if (!((_a3 = item.arguments) == null ? void 0 : _a3.length)) {
      return complete(item, level, at, event, { tab });
    }
    const text = `${level.match.trigger}${item.label} `;
    write({ start: level.match.start, end: at }, text);
    const start = level.match.start + text.length;
    levels.enter(
      {
        ...level,
        item,
        starts: [start],
        values: {},
        queryStart: start,
        match: { ...level.match, end: start }
      },
      "",
      "item-press",
      "item-press",
      event
    );
  }
  function accept(event, { tab = false } = {}) {
    var _a3;
    const level = levels.current();
    const argument = argumentOf(level);
    const at = levels.caret();
    if (!argument || at === null) {
      return;
    }
    const query = ((_a3 = levels.textFrom(level.queryStart)) != null ? _a3 : "").trim();
    const key = highlighted();
    const chosen = key !== null ? itemFor(key) : void 0;
    const value = chosen ? toKey(chosen.value) : argument.allowCustomValue !== false ? query : "";
    if (!value && argument.required) {
      return;
    }
    const values = {
      ...level.values,
      ...value ? { [argument.name]: value } : {}
    };
    const label = chosen ? chosen.label : query;
    const index = level.starts.length - 1;
    const rest = level.item.arguments.slice(index + 1);
    const finish = !rest.length || !tab && rest.every((next2) => !next2.required);
    const text = label ? `${label} ` : "";
    if (text) {
      write({ start: level.queryStart, end: at }, text);
    }
    const next = level.queryStart + text.length;
    if (finish) {
      return complete(level.item, { ...level, values }, next, event, { tab });
    }
    levels.enter(
      {
        ...level,
        values,
        starts: [...level.starts, next],
        queryStart: next,
        match: { ...level.match, end: next }
      },
      "",
      "item-press",
      "item-press",
      event
    );
  }
  function complete(item, level, at, event, { tab = false } = {}) {
    var _a3, _b3, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const rule = options().triggers[level.rule];
    const range = { start: level.match.start, end: at };
    const match = {
      ...level.match,
      end: at,
      query: level.continued ? (_a3 = levels.textFrom(level.queryStart)) != null ? _a3 : "" : level.match.query
    };
    let prevented = false;
    let inserted = false;
    let waited;
    const details = createDetails(
      {
        reason: "item-press",
        event,
        trigger: level.match.trigger,
        match,
        item,
        arguments: level.values,
        insert(content) {
          inserted = true;
          write(range, content);
        },
        waitUntil: (promise) => waited = promise,
        preventDefault: () => prevented = true
      },
      changeSource("item-press", event)
    );
    Object.defineProperty(details, "defaultPrevented", {
      get: () => prevented || inserted || details.canceled
    });
    const selectDetails = details;
    const results = [
      (_b3 = item.onSelect) == null ? void 0 : _b3.call(item, item.value, selectDetails),
      (_d = (_c = options()).onSelect) == null ? void 0 : _d.call(_c, item.value, selectDetails)
    ];
    const pending2 = (_e = results.find(isPromise)) != null ? _e : waited;
    if (pending2) {
      waiting(pending2);
    }
    if (!selectDetails.defaultPrevented) {
      const content = (_h = (_f = rule.insert) == null ? void 0 : _f.call(rule, item, {
        match,
        arguments: level.values
      })) != null ? _h : defaultInsert(item, level, rule, !!((_g = editor()) == null ? void 0 : _g.tokens), toKey);
      write(range, content, typeof content === "string" ? void 0 : pending2);
    }
    const after = (_i = item.after) != null ? _i : "compose";
    if (after === "continue") {
      const start = (_j = levels.caret()) != null ? _j : at;
      return levels.enter(
        {
          rule: level.rule,
          match: { trigger: level.match.trigger, start, end: start, query: "" },
          queryStart: start,
          starts: [],
          values: {},
          continued: true
        },
        "",
        "item-press",
        "item-press",
        event
      );
    }
    levels.end("item-press", event);
    if (after === "submit" && !tab) {
      (_l = (_k = editor()) == null ? void 0 : _k.submit) == null ? void 0 : _l.call(_k, event);
    }
  }
  return { choose, accept, write, isWriting: () => writing2 };
}

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu-api.js
function initialTriggerMenuState(options) {
  return {
    // It opens only once a trigger is typed.
    ...popupState({}),
    highlighted: null,
    navigated: false,
    query: "",
    argument: null,
    hint: "",
    items: void 0,
    loading: "idle",
    editor: options.editor,
    field: "multiline",
    listed: false,
    hasEmpty: false,
    settled: false,
    mounts: 0,
    groupLabels: [],
    listing: noListing,
    pending: 0
  };
}
function syncTriggerMenuState(options) {
  return {
    editor: options.editor,
    ...options.open === void 0 ? {} : { open: options.open }
  };
}
var isLoader = (items) => typeof items === "function";
function hintFor(level, query) {
  var _a3;
  const list = (_a3 = level.item) == null ? void 0 : _a3.arguments;
  if (!list) {
    return "";
  }
  const index = level.starts.length - 1;
  return list.slice(query ? index + 1 : index).map((argument) => {
    var _a4;
    return (_a4 = argument.hint) != null ? _a4 : `<${argument.name}>`;
  }).join(" ");
}
var sameLevel = (a, b) => !!a && a.rule === b.rule && a.item === b.item && a.starts.length === b.starts.length && a.queryStart === b.queryStart;
function triggerMenuApiBody(context2) {
  const { id, store, options, element: element2 } = context2;
  deriveOpen(
    context2,
    ["highlighted", "navigated"],
    (open) => open ? void 0 : { highlighted: null, navigated: false }
  );
  let ownEditor;
  let kept = false;
  let connected;
  let mountsQueued = false;
  let requested = null;
  let shown = null;
  const toKey = (value) => itemKey(value);
  const editor = () => ownEditor != null ? ownEditor : store.get().editor;
  const rules2 = () => {
    var _a3;
    return (_a3 = options().triggers) != null ? _a3 : [];
  };
  const loadingStatus = () => {
    var _a3;
    return (_a3 = options().status) != null ? _a3 : store.get().loading;
  };
  const levelItems = () => {
    var _a3, _b3;
    const level = levels.current();
    return (level == null ? void 0 : level.item) ? (_a3 = argumentOf(level)) == null ? void 0 : _a3.items : level ? (_b3 = rules2()[level.rule]) == null ? void 0 : _b3.items : void 0;
  };
  const isFreeText = () => {
    var _a3;
    const level = levels.current();
    return !!(level == null ? void 0 : level.item) && !((_a3 = argumentOf(level)) == null ? void 0 : _a3.items);
  };
  const listbox = createFilteredListbox({
    store,
    focus: "virtual",
    items: () => store.get().items,
    toKey,
    filter: () => {
      var _a3, _b3;
      const level = levels.current();
      return isLoader(levelItems()) ? false : (_b3 = level && ((_a3 = rules2()[level.rule]) == null ? void 0 : _a3.filter)) != null ? _b3 : "contains";
    },
    query: () => store.get().query,
    loop: () => {
      var _a3;
      return (_a3 = options().loop) != null ? _a3 : true;
    },
    active: () => store.get().open,
    container: () => {
      var _a3, _b3;
      return (_b3 = (_a3 = element2("list")) != null ? _a3 : popup.element()) != null ? _b3 : element2("content");
    },
    scrollRoot: () => {
      var _a3;
      return (_a3 = popup.element()) != null ? _a3 : element2("content");
    },
    onRegister() {
      if (mountsQueued) {
        return;
      }
      mountsQueued = true;
      queueMicrotask(() => {
        mountsQueued = false;
        store.set({ mounts: store.get().mounts + 1 });
      });
    }
  });
  keepListing(store, listbox);
  const loader = createAsyncOptions(
    async (query, loadContext) => {
      const items = levelItems();
      return isLoader(items) ? await items(query, loadContext) : [];
    },
    { debounce: 150 }
  );
  loader.subscribe(() => {
    const state = loader.getState();
    if (!levels.current() || state.query !== requested || state.status === "loading") {
      return;
    }
    store.set({
      items: state.items,
      loading: state.status
    });
    settle("input-change");
  });
  const { control, popup, contentProps } = createPopup(context2, {
    preset: triggerMenuPreset,
    rules: () => ({
      trigger: () => {
        var _a3;
        return (_a3 = editor()) == null ? void 0 : _a3.element;
      },
      // The editor isn't outside: a press in it moves the caret, which decides.
      contains: (target) => {
        var _a3, _b3;
        return !!((_b3 = (_a3 = editor()) == null ? void 0 : _a3.element) == null ? void 0 : _b3.contains(target));
      },
      // Without a sheet or a close watcher, it never closes for a swipe or Back.
      dismiss(reason, { event }) {
        levels.end(
          reason,
          event,
          {
            dismiss: reason === "escape-key"
          }
        );
      },
      // Focus stays in the editor.
      returnFocus: false,
      details: () => ({ trigger: store.get().trigger }),
      onOpenChange(open) {
        if (!open) {
          store.set({ highlighted: null, navigated: false });
        }
      }
    })
  }).internal;
  context2.onDestroy(() => loader.cancel());
  let moved = false;
  function show(reason, event, by = "keyboard") {
    if (!store.get().open) {
      moved = control.attempt({ reason, event, by }).opened;
    }
  }
  function hide(reason, event) {
    moved = control.hide({ reason, event });
  }
  function moving2(write) {
    moved = false;
    write();
    return moved;
  }
  function setQuery(query, reason, event) {
    var _a3, _b3, _c;
    if (store.get().query === query) {
      return;
    }
    store.set({ query });
    const level = levels.current();
    if (level) {
      (_c = (_b3 = options()).onQueryChange) == null ? void 0 : _c.call(
        _b3,
        query,
        createDetails(
          {
            reason,
            event,
            trigger: level.match.trigger,
            argument: (_a3 = argumentOf(level)) == null ? void 0 : _a3.name
          },
          changeSource(reason, event)
        )
      );
    }
  }
  function loadLevel(query, levelChanged) {
    const items = levelItems();
    if (!isLoader(items)) {
      loader.cancel();
      requested = null;
      return store.set({
        items: isFreeText() ? [] : items,
        loading: "idle"
      });
    }
    if (levelChanged) {
      loader.cancel();
      store.set({ items: [] });
    }
    requested = query;
    store.set({ loading: "loading" });
    loader.setQuery(query);
  }
  const levels = createTriggerLevels({
    editor,
    rules: rules2,
    isWriting: () => select2.isWriting(),
    apply(level, query, reason, open, event) {
      var _a3, _b3;
      const levelChanged = !sameLevel(shown, level);
      shown = level;
      store.set({
        trigger: level.match.trigger,
        argument: (_b3 = (_a3 = argumentOf(level)) == null ? void 0 : _a3.name) != null ? _b3 : null,
        hint: hintFor(level, query),
        navigated: false
      });
      setQuery(query, reason, event);
      if (levelChanged || isLoader(levelItems())) {
        loadLevel(query, levelChanged);
      }
      settle(open, event);
    },
    close(reason, event) {
      shown = null;
      requested = null;
      loader.cancel();
      hide(reason, event);
      store.set({
        trigger: null,
        argument: null,
        hint: "",
        navigated: false,
        loading: "idle",
        query: ""
      });
      announceState();
    }
  });
  const select2 = createTriggerSelect({
    levels,
    editor,
    options,
    items: () => store.get().items,
    find: (key) => listbox.find(key),
    highlighted: () => store.get().open ? store.get().highlighted : null,
    itemProps: (key) => context2.props("item", key),
    toKey,
    waiting(promise) {
      store.set({ pending: store.get().pending + 1 });
      const settled = () => store.set({ pending: store.get().pending - 1 });
      promise.then(settled, settled);
    }
  });
  announcePending(context2, () => store.get().pending > 0);
  function hasEntries() {
    const state = store.get();
    if (!state.items && !listbox.entries().length && !state.settled) {
      return true;
    }
    return listbox.entries().length > 0;
  }
  function settle(reason, event) {
    const visible = !!levels.current() && !isFreeText() && (hasEntries() || loadingStatus() === "loading" || store.get().hasEmpty);
    if (visible) {
      show(reason, event);
    } else {
      hide(reason, event);
    }
    settleHighlight();
    announceState();
  }
  function settleHighlight() {
    var _a3, _b3;
    const list = listbox.entries();
    const current = store.get().highlighted;
    const present2 = current !== null && list.some((entry) => entry.key === current);
    if (((_a3 = options().autoHighlight) != null ? _a3 : true) && list.length) {
      if (present2 && store.get().navigated) {
        return;
      }
      const first = (_b3 = list.find((entry) => !listbox.disabled(entry))) != null ? _b3 : list[0];
      if (first.key !== current) {
        listbox.highlight(first.key);
      }
      return;
    }
    if (current !== null && !present2) {
      listbox.highlight(null);
    }
  }
  function statusMessage() {
    var _a3;
    const state = store.get();
    if (!state.open && !levels.current()) {
      return "";
    }
    if (loadingStatus() === "loading") {
      return "Loading";
    }
    if (!state.open) {
      return state.argument ? `${state.argument}. ${state.hint}`.trim() : "";
    }
    const count2 = listbox.entries().length;
    if (!count2) {
      return "No matches";
    }
    const next = ((_a3 = levels.current()) == null ? void 0 : _a3.item) ? ", Tab for the next" : "";
    return `${count2} ${count2 === 1 ? "suggestion" : "suggestions"}. Up and Down to choose, Enter to insert${next}`;
  }
  let statusTimer;
  context2.onDestroy(() => clearTimeout(statusTimer));
  function announceState() {
    var _a3, _b3, _c;
    const message = statusMessage();
    const region = element2("status");
    if (!region) {
      return announce(message);
    }
    if (!((_c = (_b3 = (_a3 = elements(context2, "status")[0]) == null ? void 0 : _a3.props) != null ? _b3 : context2.props("status")) == null ? void 0 : _c.text)) {
      return;
    }
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      region.textContent = message && region.textContent === message ? `${message}\xA0` : message;
    }, 350);
  }
  const keyboard = createTriggerMenuKeyboard({
    store,
    listbox,
    active: () => !!levels.current(),
    inArguments: () => {
      var _a3;
      return !!((_a3 = levels.current()) == null ? void 0 : _a3.item);
    },
    choose: select2.choose,
    accept: select2.accept,
    dismiss: (event) => levels.end("escape-key", event, { dismiss: true }),
    caretMove: (event) => levels.end("caret-move", event)
  });
  function onKeyDown(event) {
    var _a3;
    if (event.defaultPrevented || isComposing(event)) {
      return;
    }
    const shortcut = (_a3 = options().shortcut) != null ? _a3 : "ctrl+space";
    if (shortcut && matchesShortcut(event, shortcut)) {
      if (levels.reopen("shortcut", event)) {
        event.preventDefault();
      }
      return;
    }
    keyboard.onKeyDown(event);
  }
  function disconnect() {
    connected == null ? void 0 : connected.cleanup();
    connected = void 0;
  }
  function connect2(next, { ownKeys = false } = {}) {
    if ((connected == null ? void 0 : connected.editor) === next) {
      return;
    }
    disconnect();
    if (!next) {
      return;
    }
    const cleanups = [next.subscribe(levels.onEditorChange)];
    if (!ownKeys && typeof document !== "undefined") {
      const onKey = (event) => {
        var _a3;
        const target = event.target;
        if (target && ((_a3 = next.element) == null ? void 0 : _a3.contains(target))) {
          onKeyDown(event);
        }
      };
      document.addEventListener("keydown", onKey, true);
      cleanups.push(() => document.removeEventListener("keydown", onKey, true));
      const writeAttrs2 = () => next.element && applyAttrs(
        next.element,
        aliasReferences(context2, fieldAttrs(store.get(), "multiline")),
        "trigger-menu"
      );
      writeAttrs2();
      cleanups.push(store.subscribe(writeAttrs2), next.subscribe(writeAttrs2));
    }
    connected = {
      editor: next,
      cleanup: () => cleanups.forEach((cleanup) => cleanup())
    };
  }
  const follow = () => {
    if (kept) {
      connect2(editor(), { ownKeys: !!ownEditor });
    }
  };
  whenKept(() => {
    kept = true;
    follow();
    return () => {
      kept = false;
      disconnect();
    };
  });
  let lastEditor = store.get().editor;
  store.subscribe(() => {
    const { editor: option } = store.get();
    if (option === lastEditor) {
      return;
    }
    lastEditor = option;
    follow();
  });
  let lastMounts = store.get().mounts;
  let lastItems = store.get().items;
  store.subscribe(() => {
    const { mounts, items } = store.get();
    if (mounts === lastMounts && items === lastItems) {
      return;
    }
    lastMounts = mounts;
    lastItems = items;
    settleHighlight();
  });
  function activeDescendant(state) {
    var _a3;
    const { highlighted } = state;
    if (!state.open || !state.navigated || highlighted === null) {
      return void 0;
    }
    if (!((_a3 = listbox.element(highlighted)) == null ? void 0 : _a3.isConnected)) {
      return void 0;
    }
    return `${id}-option-${idPart(highlighted)}`;
  }
  function fieldAttrs(state, field) {
    return {
      "aria-expanded": field === "input" ? String(state.open) : void 0,
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-controls": state.open ? `${id}-${state.listed ? "list" : "content"}` : void 0,
      "aria-activedescendant": activeDescendant(state)
    };
  }
  return {
    id,
    isOpen: () => store.get().open,
    setOpen(open, {
      reason = "imperative",
      event
    } = {}) {
      if (!open) {
        return moving2(() => levels.end(reason, event));
      }
      return moving2(
        () => levels.current() ? show(reason, event, "imperative") : levels.reopen(reason, event)
      );
    },
    open({
      trigger,
      reason = "imperative",
      event,
      signal
    } = {}) {
      var _a3, _b3, _c;
      const target = editor();
      const char = trigger != null ? trigger : (_a3 = rules2()[0]) == null ? void 0 : _a3.char;
      if ((signal == null ? void 0 : signal.aborted) || !target || !char) {
        return unopened(reason, event);
      }
      if (levels.caret() === null) {
        (_b3 = target.element) == null ? void 0 : _b3.focus();
      }
      if (((_c = levels.matchAtCaret()) == null ? void 0 : _c.match.trigger) !== char) {
        const at = levels.caret();
        if (at === null) {
          return unopened(reason, event);
        }
        select2.write({ start: at, end: at }, char);
      }
      if (!levels.reopen(reason, event)) {
        return unopened(reason, event);
      }
      return control.result(signal);
    },
    close: ({
      reason = "imperative",
      event
    } = {}) => moving2(() => levels.end(reason, event)),
    getQuery: () => store.get().query,
    getMatch() {
      var _a3;
      const level = levels.current();
      return level ? {
        ...level.match,
        end: (_a3 = levels.caret()) != null ? _a3 : level.match.end,
        query: store.get().query
      } : null;
    },
    insert(content) {
      const at = levels.caret();
      if (at === null) {
        return;
      }
      const level = levels.current();
      select2.write({ start: level ? level.match.start : at, end: at }, content);
      if (level) {
        levels.end("item-press");
      }
    },
    focus: () => {
      var _a3, _b3;
      return (_b3 = (_a3 = editor()) == null ? void 0 : _a3.element) == null ? void 0 : _b3.focus();
    },
    // Internal. Used by slots and adapters.
    internal: {
      options,
      listbox,
      popup,
      choose: select2.choose,
      onKeyDown,
      fieldAttrs,
      itemCount: () => listbox.entries().length,
      announceState,
      settle: () => settle("input-change"),
      // The list is named like the field: by its labels, or its own aria-label.
      // Not by the field itself, whose name as a reference would be its text.
      listLabel() {
        var _a3, _b3;
        const el = (_a3 = editor()) == null ? void 0 : _a3.element;
        if (!el) {
          return {};
        }
        const labelledBy2 = el.getAttribute("aria-labelledby");
        if (labelledBy2) {
          return { "aria-labelledby": labelledBy2 };
        }
        const labels = Array.from((_b3 = el.labels) != null ? _b3 : []);
        if (labels.length) {
          return {
            "aria-labelledby": labels.map((label2, index) => label2.id || (label2.id = `${id}-label-${index}`)).join(" ")
          };
        }
        const label = el.getAttribute("aria-label");
        return label ? { "aria-label": label } : {};
      },
      // The list opens at the trigger, or at an argument's start, and stays there as the query grows.
      anchorRect() {
        var _a3, _b3;
        const level = levels.current();
        if (!level) {
          return null;
        }
        return (_b3 = (_a3 = editor()) == null ? void 0 : _a3.rectAt(
          level.item || level.continued ? level.queryStart : level.match.start
        )) != null ? _b3 : null;
      },
      caretRect() {
        var _a3, _b3;
        const at = levels.caret();
        return at === null ? null : (_b3 = (_a3 = editor()) == null ? void 0 : _a3.rectAt(at)) != null ? _b3 : null;
      },
      // TriggerMenuInput builds the editor for its field.
      setOwnEditor(next, field = "multiline") {
        ownEditor = next;
        store.set({ field });
        follow();
      },
      keyOf: toKey,
      // An empty part is rendered, so no matches keeps the menu open.
      markEmptyPart: () => store.set({ hasEmpty: true }),
      isEmpty: (state) => {
        var _a3;
        return ((_a3 = options().status) != null ? _a3 : state.loading) !== "loading" && (!!state.items || state.settled) && !listbox.entries().length;
      },
      itemProps: (key) => context2.props("item", key),
      contentProps: (key) => contentProps(key)
    }
  };
}
var triggerMenuApi = triggerMenuApiBody;

// node_modules/@ui-sdk/core/dist/components/trigger-menu/trigger-menu.js
var triggerMenuPrimitive = /* @__PURE__ */ definePrimitive({
  name: "trigger-menu",
  // `onSelect`'s Promise makes the token it inserts pending.
  options: {
    container: "value",
    triggers: "value",
    editor: "value",
    open: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    onQueryChange: "callback",
    onSelect: "action",
    pendingAnnouncement: "string",
    status: "string",
    autoHighlight: "boolean",
    loop: "boolean",
    shortcut: "string",
    controller: "value",
    dismissible: "boolean",
    onDismissAttempt: "callback"
  },
  state: initialTriggerMenuState,
  live: ["highlighted", "navigated"],
  controlled: ["open"],
  sync: syncTriggerMenuState,
  api: triggerMenuApi,
  slots: (slot) => triggerMenuSlots(slot),
  agent: { actions: ["setOpen", "insert"] }
});
var triggerMenu = triggerMenuPrimitive;

// node_modules/@ui-sdk/web/dist/list.js
var templateOf = (el) => {
  var _a3;
  return (_a3 = el == null ? void 0 : el.querySelector(":scope > template")) != null ? _a3 : null;
};
function copy(template, tagName, deep = true) {
  const model = template == null ? void 0 : template.content.querySelector(tagName);
  return model ? model.cloneNode(deep) : document.createElement(tagName);
}
function element(tagName, attributes = {}, text, template) {
  const el = copy(template, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === void 0 || value === false) {
      continue;
    }
    el.setAttribute(name, value === true ? "" : value);
  }
  if (text) {
    const slot = el.querySelector(`${tagName}-text`);
    if (slot) {
      slot.textContent = text;
    } else {
      el.prepend(text);
    }
  }
  return el;
}
var stashedEmpty = {
  display: "block",
  context: () => ({ stash: true }),
  kinds: { stash: null }
};
function renderListItems(prefix, items, toKey = (value) => String(value), template) {
  return items.map((entry) => {
    if (typeof entry === "string") {
      return element(
        `${prefix}-item`,
        { value: entry, label: entry },
        entry,
        template
      );
    }
    if ("type" in entry && entry.type === "separator") {
      return element(`${prefix}-separator`, {}, "", template);
    }
    if ("type" in entry && entry.type === "group") {
      const group = copy(template, `${prefix}-group`, false);
      if (entry.label) {
        group.append(
          element(`${prefix}-group-label`, {}, entry.label, template)
        );
      }
      group.append(...renderListItems(prefix, entry.items, toKey, template));
      return group;
    }
    const data = entry;
    const el = element(
      `${prefix}-item`,
      { value: toKey(data.value), label: data.label, disabled: data.disabled },
      data.label,
      template
    );
    if (data.keywords) {
      el.setAttribute("keywords", data.keywords.join(","));
    }
    if (data.shortcut) {
      el.setAttribute("shortcut", data.shortcut);
    }
    return el;
  });
}

// node_modules/@ui-sdk/web/dist/popup.js
var popupPortal = {
  slots: ["content"],
  container: (el, part) => {
    var _a3, _b3;
    const own = (part == null ? void 0 : part.slot) === "content" ? (_b3 = (_a3 = part.el) == null ? void 0 : _a3.getAttribute("container")) != null ? _b3 : null : null;
    const selector = own != null ? own : el.getAttribute("container");
    return selector ? findContainer(el, selector) : inheritedPortal(el);
  }
};
var popupKinds = { container: "string" };
var popupState2 = {
  open: {
    get: (api) => api.isOpen(),
    set: (api, open) => api.setOpen(!!open)
  }
};

// node_modules/@ui-sdk/web/dist/trigger-menu.js
var owner2 = "ui-trigger-menu";
var automatic = /* @__PURE__ */ new WeakSet();
var automaticText = {
  render(el) {
    if (!el.childNodes.length) {
      automatic.add(el);
    }
  },
  context: (el) => ({ text: automatic.has(el) }),
  kinds: { text: null }
};
function defineTriggerMenuElements() {
  createParts(triggerMenu, {
    root: {
      tag: owner2,
      defaults: { autoHighlight: true, loop: true, dismissible: true },
      display: "contents",
      kinds: popupKinds,
      options: (el) => {
        var _a3, _b3;
        const menu = el;
        return {
          triggers: (_a3 = menu.triggers) != null ? _a3 : [],
          // Nesting is the default: a menu inside a token input uses its editor.
          editor: (_b3 = menu.editor) != null ? _b3 : tokenInputEditor(el),
          container: void 0
        };
      },
      state: popupState2,
      api: [
        "isOpen",
        "setOpen",
        "open",
        "close",
        "getQuery",
        "getMatch",
        "insert",
        "focus"
      ],
      // The field's own `select`, for selected text, bubbles up here.
      events: { onSelect: "itemselect" },
      portal: popupPortal,
      // Data items follow the trigger, the level and the query.
      render(el, { api, subscribe: subscribe2 }) {
        renderData(el, api);
        return subscribe2(() => renderData(el, api));
      }
    },
    // A wrapper, so the field stays a real textarea or input.
    input: {
      tag: "ui-trigger-menu-input",
      display: "contents",
      target: wrappedChild("textarea, input")
    },
    content: { tag: "ui-trigger-menu-content", kinds: popupKinds },
    list: { tag: "ui-trigger-menu-list", display: "block" },
    item: { tag: "ui-trigger-menu-item", display: "block" },
    // An icon inside a suggestion. Screen readers and filtering skip it.
    "item-icon": "ui-trigger-menu-item-icon",
    group: { tag: "ui-trigger-menu-group", display: "block" },
    "group-label": { tag: "ui-trigger-menu-group-label", display: "block" },
    separator: { tag: "ui-trigger-menu-separator", display: "block" },
    empty: { tag: "ui-trigger-menu-empty", ...stashedEmpty },
    // Without content, the status says the count and the keys.
    status: {
      tag: "ui-trigger-menu-status",
      display: "block",
      ...automaticText
    },
    // Without content, the hint shows the arguments to type.
    hint: { tag: "ui-trigger-menu-hint", ...automaticText }
  });
}
function tokenInputEditor(el) {
  var _a3;
  return (_a3 = instanceOf(
    findOwner(el, "ui-token-input")
  )) == null ? void 0 : _a3.api.editor;
}
var generatedItems = /* @__PURE__ */ new WeakSet();
var rendered = /* @__PURE__ */ new WeakMap();
var contents = /* @__PURE__ */ new WeakMap();
function renderData(el, api) {
  var _a3, _b3, _c;
  const template = templateOf(el);
  let content = (_a3 = el.querySelector(":scope > ui-trigger-menu-content")) != null ? _a3 : contents.get(el);
  if (!content) {
    content = copy(template, "ui-trigger-menu-content", false);
    content.append(copy(template, "ui-trigger-menu-list", false));
    el.append(content);
  }
  contents.set(el, content);
  const list = content.querySelector("ui-trigger-menu-list");
  if (!list) {
    return;
  }
  const own = Array.from(list.querySelectorAll("ui-trigger-menu-item")).some(
    (item) => {
      const group = item.closest("ui-trigger-menu-group");
      return !generatedItems.has(item) && !(group && generatedItems.has(group));
    }
  );
  const visible = (_c = (_b3 = api.internal.listbox.visibleData()) == null ? void 0 : _b3.list) != null ? _c : [];
  if (own || rendered.get(list) === visible) {
    return;
  }
  rendered.set(list, visible);
  for (const child of Array.from(list.children)) {
    if (generatedItems.has(child)) {
      child.remove();
    }
  }
  const fresh = renderListItems(
    "ui-trigger-menu",
    visible,
    api.internal.keyOf,
    template
  );
  fresh.forEach((item) => generatedItems.add(item));
  list.prepend(...fresh);
}

// node_modules/@ui-sdk/web/dist/entries/trigger-menu.js
defineTriggerMenuElements();
