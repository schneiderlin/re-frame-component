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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/@ui-sdk/core/dist/foundation/platform/style.js
function pageNonce(doc) {
  var _a, _b, _c;
  if (nonces.has(doc)) {
    return nonces.get(doc);
  }
  let meta;
  for (let at = doc; at && !meta; at = (_b = (_a = at.defaultView) == null ? void 0 : _a.frameElement) == null ? void 0 : _b.ownerDocument) {
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
var adopted, nonces, styleText;
var init_style = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/platform/style.js"() {
    adopted = () => {
      var _a, _b;
      return (_b = globalThis[_a = /* @__PURE__ */ Symbol.for("ui-sdk.styles@1")]) != null ? _b : globalThis[_a] = /* @__PURE__ */ new WeakMap();
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
function isRTL(el) {
  return !!el && isBrowser && getComputedStyle(el).direction === "rtl";
}
var isBrowser;
var init_env = __esm({
  "node_modules/@ui-sdk/core/dist/foundation/platform/env.js"() {
    isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  }
});

// node_modules/@ui-sdk/core/dist/foundation/focus/collection.js
var orientationOf = (value, fallback) => value === "horizontal" || value === "vertical" ? value : fallback;
function stepFor(key, orientation2, rtl) {
  var _a;
  if (orientation2 === "both") {
    return (_a = radioStep(key, rtl)) != null ? _a : key === "Home" ? "first" : key === "End" ? "last" : void 0;
  }
  const forward = orientation2 === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
  const backward = orientation2 === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
  if (key === forward) {
    return 1;
  }
  if (key === backward) {
    return -1;
  }
  if (key === "Home") {
    return "first";
  }
  if (key === "End") {
    return "last";
  }
}
function radioStep(key, rtl) {
  if (key === "ArrowDown" || key === (rtl ? "ArrowLeft" : "ArrowRight")) {
    return 1;
  }
  if (key === "ArrowUp" || key === (rtl ? "ArrowRight" : "ArrowLeft")) {
    return -1;
  }
}
function rovingStop(items, remembered = null) {
  var _a, _b, _c, _d;
  const focusable = items.filter((item) => item.focusable);
  if (remembered !== null && focusable.some((item) => item.key === remembered)) {
    return remembered;
  }
  const enabled = focusable.filter((item) => !item.disabled);
  return (_d = (_c = (_b = (_a = enabled.find((item) => item.preferred)) != null ? _a : enabled[0]) != null ? _b : focusable[0]) == null ? void 0 : _c.key) != null ? _d : null;
}
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

// node_modules/@ui-sdk/core/dist/foundation/kernel/order.js
var following = 4;
var isAfter = (node, later) => !!(node.compareDocumentPosition(later) & following);
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
    var _a;
    moves2 != null ? moves2 : moves2 = new MutationObserver(() => order = void 0);
    const last = (_a = list[list.length - 1]) == null ? void 0 : _a.el;
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
  const owner = form != null ? form : el.ownerDocument;
  if (focusing.has(owner)) {
    return;
  }
  focusing.add(owner);
  setTimeout(() => focusing.delete(owner));
  focusControl(el);
}
function attachFormInternals(el, internals, bind2) {
  internalsOf.set(el, { internals, bind: bind2 });
}
function formInternals(el) {
  var _a;
  return el ? (_a = internalsOf.get(el)) == null ? void 0 : _a.internals : void 0;
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
var blocksImplicitSubmission = /* @__PURE__ */ new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "date",
  "month",
  "week",
  "time",
  "datetime-local",
  "number"
]);
var segments = /* @__PURE__ */ new WeakSet();
var defaultButton = (form) => Array.from(
  form.getRootNode().querySelectorAll("button, input[type=submit], input[type=image]")
).find(
  (el) => el.form === form && (el.type === "submit" || el.type === "image")
);
var blocking = (elements2) => elements2.filter(
  (el) => el instanceof HTMLInputElement && blocksImplicitSubmission.has(el.type)
);
function submitImplicitly(form) {
  if (!form) {
    return;
  }
  const button = defaultButton(form);
  if (button) {
    if (!button.disabled) {
      button.click();
    }
    return;
  }
  if (blocking(Array.from(form.elements)).filter((el) => !segments.has(el)).length <= 1) {
    form.requestSubmit();
  }
}
function dispatchChange(el, types = ["input", "change"]) {
  if (!el || writingFromScript(el)) {
    return;
  }
  queueMicrotask(() => {
    if (!el.isConnected) {
      return;
    }
    if (types.includes("input")) {
      el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
    if (types.includes("change")) {
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
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
  let active = true;
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
    if (!active) {
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
    active = false;
    observer == null ? void 0 : observer.disconnect();
    moves.delete(el);
  };
}
var elementMoved = (el) => {
  var _a;
  return (_a = moves.get(el)) == null ? void 0 : _a();
};
var isDisabled = (state) => state.disabled || state.formDisabled;
function bindHiddenInput(input, options) {
  const write = () => {
    var _a, _b;
    const checked = options.checked();
    if (input.checked !== checked) {
      input.checked = checked;
    }
    const indeterminate = (_b = (_a = options.indeterminate) == null ? void 0 : _a.call(options)) != null ? _b : false;
    if (input.indeterminate !== indeterminate) {
      input.indeterminate = indeterminate;
    }
  };
  write();
  const cleanups = [
    options.subscribe(write),
    associate(input, { ...options, write })
  ];
  const onClick = (event) => {
    var _a, _b;
    const control = (_a = options.control) == null ? void 0 : _a.call(options);
    if (!control || isLabelable(control)) {
      return;
    }
    event.preventDefault();
    options.focus();
    (_b = options.activate) == null ? void 0 : _b.call(options, event);
  };
  input.addEventListener("click", onClick);
  cleanups.push(() => input.removeEventListener("click", onClick));
  queueMicrotask(() => {
    var _a;
    const control = (_a = options.control) == null ? void 0 : _a.call(options);
    if (control && !isLabelable(control)) {
      cleanups.push(labelledBy(control, () => labelsOf(input)));
    }
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
function bindInternals(el, options) {
  const attached = internalsOf.get(el);
  return attached ? attached.bind(el, attached.internals, options) : () => {
  };
}
var labelCount = 0;
function isLabelable(el) {
  return el instanceof HTMLButtonElement || el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement || el instanceof HTMLMeterElement || el instanceof HTMLOutputElement || el instanceof HTMLProgressElement || internalsOf.has(el);
}
function nameFromLabels(el, target = el) {
  return formInternals(el) ? labelledBy(target, () => labelsOf(el), el) : () => {
  };
}
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
  var _a;
  ;
  (_a = controller == null ? void 0 : controller[attach]) == null ? void 0 : _a.call(controller, api);
}
function detachController(controller, api) {
  var _a;
  ;
  (_a = controller == null ? void 0 : controller[detach]) == null ? void 0 : _a.call(controller, api);
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
function createStore(initial, live) {
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
      const liveOnly = changed.every((key) => live.includes(key));
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
var standFor = (owner, store) => {
  held.set(owner, held.get(store));
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
        var _a;
        return (_a = narrowed.selectors.get(`${String(key)}:${value}`)) == null ? void 0 : _a.forEach(run);
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
    const { owner } = part;
    if (!owner.released.length) {
      queueMicrotask(() => sweep(owner));
    }
    owner.released.push(part);
  };
}
function provisional(part) {
  const { owner } = part;
  if (!owner.released.length) {
    queueMicrotask(() => sweep(owner));
  }
  owner.released.push(part);
}
function sweep(owner) {
  for (const part of owner.released) {
    const mapKey = `${part.slot}:${part.key}`;
    if (!part.leases && owner.parts.get(mapKey) === part) {
      owner.parts.delete(mapKey);
    }
  }
  owner.released = [];
}
function attrs(part, props = part.props, state = part.store.get()) {
  var _a, _b;
  const definition = definitionOf(part);
  const context2 = view(part, props);
  const own = (_a = definition.attrs) == null ? void 0 : _a.call(definition, state, context2);
  const declared = definition.role;
  const role = typeof declared === "function" ? declared(state, context2) : declared;
  if (dev) {
    checkRole(
      definition,
      part.slot,
      own,
      role,
      { component: ownerOf(part).label, id: part.id },
      (_b = definition.live) == null ? void 0 : _b.read(state, context2)
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
  var _a, _b, _c;
  return (_c = (_b = (_a = definitionOf(part)).present) == null ? void 0 : _b.call(_a, state, view(part, props))) != null ? _c : true;
}
function conditional(part) {
  return definitionOf(part).present !== void 0;
}
var selectedKeys = (part, props = part.props) => {
  var _a, _b;
  return (_b = (_a = definitionOf(part).selects) == null ? void 0 : _a.selection(part, props)) != null ? _b : "";
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
      var _a;
      if (event.defaultPrevented || composing(event)) {
        return;
      }
      (_a = ownerOf(part).sleeping) == null ? void 0 : _a.wake();
      handler(event, context(part));
    };
  }
  if (typeof activate === "function" && !result.click) {
    result.click = (event) => {
      var _a;
      if (!event.defaultPrevented) {
        (_a = ownerOf(part).sleeping) == null ? void 0 : _a.wake();
        activate(context(part), event);
      }
    };
  }
  return result;
}
function propsRendered(part) {
  var _a;
  (_a = part.propsListeners) == null ? void 0 : _a.forEach((listener) => listener());
}
function onProps(part, listener) {
  var _a;
  const listeners = (_a = part.propsListeners) != null ? _a : part.propsListeners = /* @__PURE__ */ new Set();
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
  var _a, _b;
  const kept = part;
  const { parts } = kept.owner;
  const mapKey = `${part.slot}:${part.key}`;
  if (!part.el && ((_a = parts.get(mapKey)) != null ? _a : kept) === kept) {
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
  const early = (_b = definition.asleep) == null ? void 0 : _b.call(definition, el, part);
  if (early) {
    cleanups.push(early);
  }
  const late = () => {
    var _a2;
    const cleanup = (_a2 = definition.bind) == null ? void 0 : _a2.call(definition, el, part);
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
  var _a, _b, _c;
  return (_c = (_b = (_a = definitionOf(part)).connect) == null ? void 0 : _b.call(_a, el)) != null ? _c : (() => {
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
  var _a, _b;
  return (_b = (_a = definitionOf(part)).attrs) == null ? void 0 : _b.call(
    _a,
    part.store.get(),
    view(part, { ...part.props, id: void 0 })
  ).id;
};
function aliased(part, attrs2) {
  var _a;
  const { owner } = part;
  if (!((_a = owner.named) == null ? void 0 : _a.size) || !references.some((name) => attrs2[name])) {
    return attrs2;
  }
  const aliases = aliasesOf(owner, part.store);
  if (!aliases.size) {
    return attrs2;
  }
  const result = { ...attrs2 };
  for (const name of references) {
    const ids = result[name];
    if (ids) {
      result[name] = ids.split(" ").map((id) => {
        var _a2;
        return (_a2 = aliases.get(id)) != null ? _a2 : id;
      }).join(" ");
    }
  }
  return result;
}
function aliasesOf(owner, store) {
  var _a;
  const version = renders(store);
  if (((_a = owner.aliases) == null ? void 0 : _a.version) === version) {
    return owner.aliases.map;
  }
  const map = /* @__PURE__ */ new Map();
  for (const part of owner.named) {
    const made = madeId(part);
    if (made !== void 0 && made !== part.own) {
      map.set(made, part.own);
    }
  }
  owner.aliases = { version, map };
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
  const { owner } = part;
  if (!owner.unread) {
    owner.unread = /* @__PURE__ */ new Set();
    queueMicrotask(() => readIds(owner, part.store));
  }
  owner.unread.add(part);
}
function readIds(owner, store) {
  const parts = owner.unread;
  owner.unread = void 0;
  let renamed = owner.renamed === true;
  owner.renamed = void 0;
  for (const part of parts) {
    renamed = rename(part, part.el && idOf(part.el)) || renamed;
  }
  if (renamed) {
    touch(store);
  }
}
var idOf = (el) => el.localName === "form" ? el.getAttribute("id") : el.id;
function rename(part, id) {
  var _a;
  const made = madeId(part);
  const own = id && id !== made ? id : void 0;
  if (own === part.own) {
    return false;
  }
  const { owner } = part;
  part.own = own;
  (_a = owner.named) != null ? _a : owner.named = /* @__PURE__ */ new Set();
  if (own === void 0) {
    owner.named.delete(part);
  } else {
    owner.named.add(part);
  }
  owner.aliases = void 0;
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
          var _a;
          return unwatch = (_a = watchers.add) == null ? void 0 : _a.call(watchers, instance, parts, definition);
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
  var _a;
  const slots = definition.slots((slot) => slot);
  const name = definition.name;
  const label = (_a = definition.label) != null ? _a : name;
  if (dev) {
    checkRoles(slots, { component: label });
  }
  const make = (initialOptions) => {
    var _a2, _b, _c, _d;
    let options = initialOptions;
    const id = initialOptions.id;
    const store = createStore(
      { ...definition.state(options), ...(_a2 = definition.sync) == null ? void 0 : _a2.call(definition, options) },
      (_b = definition.live) != null ? _b : []
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
      var _a3;
      if (used.has(feature)) {
        return;
      }
      used.add(feature);
      Object.assign(own, feature.slots);
      wake();
      (_a3 = feature.extend) == null ? void 0 : _a3.call(feature, api);
    }
    const owner = {
      name,
      label,
      slots: own,
      parts: /* @__PURE__ */ new Map(),
      released: []
    };
    const { parts } = owner;
    function keyOf(props = {}) {
      var _a3;
      return (_a3 = props.id) != null ? _a3 : props.value == null ? "" : String(props.value);
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
            owner,
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
    function element(slot, key) {
      var _a3, _b2;
      if (key === void 0) {
        for (const part2 of parts.values()) {
          if (part2.slot === slot && ((_a3 = part2.el) == null ? void 0 : _a3.isConnected)) {
            return part2.el;
          }
        }
        return;
      }
      const el = (_b2 = parts.get(`${slot}:${key}`)) == null ? void 0 : _b2.el;
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
      element,
      props: (slot, key = "") => {
        var _a3;
        const shown = viewedParts == null ? void 0 : viewedParts[slot];
        return shown && keyOf(shown) === key ? shown : (_a3 = parts.get(`${slot}:${key}`)) == null ? void 0 : _a3.props;
      }
    };
    let api = void 0;
    function build() {
      var _a3, _b2;
      api = definition.api(context2);
      connectController(context2, api);
      if (dev) {
        for (const action of (_b2 = (_a3 = definition.agent) == null ? void 0 : _a3.actions) != null ? _b2 : []) {
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
      const { sleeping } = owner;
      if (!sleeping) {
        return;
      }
      owner.sleeping = void 0;
      extendLifecycle(instance, build);
      for (const bind2 of [...sleeping.binds]) {
        bind2();
      }
    }
    if ((_d = definition.asleep) == null ? void 0 : _d.call(definition, options)) {
      owner.sleeping = { wake, binds: /* @__PURE__ */ new Set() };
    } else {
      build();
    }
    let handing = false;
    let following2 = false;
    let destroyed = false;
    const syncFrom = (options2, state) => {
      var _a3;
      return withDerived(store, options2, (_a3 = definition.sync) == null ? void 0 : _a3.call(definition, options2), state);
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
        var _a3;
        const held2 = heldState(store);
        const arriving = next.id === id ? next : { ...next, id };
        const shown = dev && following2 ? syncFrom(arriving, held2) : void 0;
        options = arriving;
        if (dev) {
          checkControlled(from, controlled, options);
        }
        if (owner.sleeping && !definition.asleep(options)) {
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
            source = (_a3 = listener(options, synced)) != null ? _a3 : source;
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
          var _a;
          return [
            slot,
            (_a = def.props) != null ? _a : {}
          ];
        })
      )
    };
    schemas.set(primitive, schema);
  }
  return schema;
}
var renderVersion = (instance) => renders(instance);

// node_modules/@ui-sdk/core/dist/foundation/platform/layout.js
var isTransformed = (style) => style.transform !== "none" || style.translate !== "none" || style.scale !== "none" || style.rotate !== "none";
function movesRects(node, parent) {
  for (let el = node; el && el !== parent; ) {
    const scrolled = el !== node && (el.scrollLeft || el.scrollTop);
    if (scrolled || isTransformed(getComputedStyle(el))) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}
function offsetIn(node, parent) {
  const offset = {
    x: node.offsetLeft + parent.clientLeft,
    y: node.offsetTop + parent.clientTop
  };
  if (parent === node.ownerDocument.body || movesRects(node, parent)) {
    return offset;
  }
  const rect = node.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const size = layoutSize(parent);
  const x = (rect.left - parentRect.left) * size.width / parentRect.width + parent.scrollLeft;
  const y = (rect.top - parentRect.top) * size.height / parentRect.height + parent.scrollTop;
  return {
    x: Math.abs(x - offset.x) < 1 ? x : offset.x,
    y: Math.abs(y - offset.y) < 1 ? y : offset.y
  };
}
function layoutOrigin(el) {
  let x = 0;
  let y = 0;
  for (let node = el; node; node = node.offsetParent) {
    const parent = node.offsetParent;
    if (!parent) {
      x += node.offsetLeft;
      y += node.offsetTop;
      continue;
    }
    const offset = offsetIn(node, parent);
    x += offset.x;
    y += offset.y;
  }
  return { x, y };
}
function layoutSize(el) {
  const style = getComputedStyle(el);
  const total = (...names) => names.reduce(
    (sum, name) => sum + (parseFloat(style.getPropertyValue(name)) || 0),
    0
  );
  const contentBox = style.boxSizing !== "border-box";
  const width = parseFloat(style.width) + (contentBox ? total(
    "padding-left",
    "padding-right",
    "border-left-width",
    "border-right-width"
  ) : 0);
  const height = parseFloat(style.height) + (contentBox ? total(
    "padding-top",
    "padding-bottom",
    "border-top-width",
    "border-bottom-width"
  ) : 0);
  return {
    width: Number.isFinite(width) ? width : el.offsetWidth,
    height: Number.isFinite(height) ? height : el.offsetHeight
  };
}
function layoutBox(el, container) {
  const at = layoutOrigin(el);
  const origin = layoutOrigin(container);
  const left = at.x - origin.x - container.clientLeft;
  const top = at.y - origin.y - container.clientTop;
  const { width, height } = layoutSize(el);
  const area = { width: container.scrollWidth, height: container.scrollHeight };
  return {
    left,
    top,
    width,
    height,
    right: area.width - (left + width),
    bottom: area.height - (top + height)
  };
}

// node_modules/@ui-sdk/core/dist/foundation/selection/indicator.js
function bindIndicator(options) {
  const update = () => {
    const list = options.list();
    const item = options.active();
    options.write(item && list ? layoutBox(item, list) : void 0);
  };
  const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(update);
  const observed = /* @__PURE__ */ new Set();
  const remeasure = () => {
    const list = options.list();
    const targets = new Set(
      list ? [list, ...list.querySelectorAll(options.itemSelector)] : []
    );
    for (const target of observed) {
      if (!targets.has(target)) {
        observed.delete(target);
        observer == null ? void 0 : observer.unobserve(target);
      }
    }
    for (const target of targets) {
      if (observed.has(target)) {
        continue;
      }
      observed.add(target);
      observer == null ? void 0 : observer.observe(target);
    }
    update();
  };
  const unsubscribe = options.subscribe(remeasure);
  queueMicrotask(remeasure);
  return () => {
    unsubscribe();
    observer == null ? void 0 : observer.disconnect();
  };
}
function directionBetween(from, to, orientation2) {
  if (!from || !to) {
    return "none";
  }
  const [a, b] = orientation2 === "vertical" ? [from.top, to.top] : [from.left, to.left];
  if (b === a) {
    return "none";
  }
  if (orientation2 === "vertical") {
    return b > a ? "down" : "up";
  }
  return b > a ? "right" : "left";
}

// node_modules/@ui-sdk/core/dist/foundation/focus/roving-focus.js
init_env();
function createClaim() {
  let claimed2;
  return (key, eligible) => {
    if (claimed2 === void 0 && eligible) {
      claimed2 = key;
    }
    return claimed2 === key;
  };
}
function createRovingFocus(context2, options) {
  var _a;
  const { store } = context2;
  const key = options.key;
  const remember = (_a = options.remember) != null ? _a : true;
  const order = createOrder();
  const claim = createClaim();
  let remembered = null;
  let moving = false;
  const setStop = (itemKey) => {
    moving = true;
    store.set({ [key]: itemKey });
    moving = false;
  };
  let pending = null;
  let holder = null;
  const orientation2 = () => {
    var _a2, _b;
    return (_b = (_a2 = options.orientation) == null ? void 0 : _a2.call(options)) != null ? _b : "vertical";
  };
  const isDisabled2 = (item) => {
    var _a2, _b;
    return (_b = (_a2 = options.disabled) == null ? void 0 : _a2.call(options, item)) != null ? _b : false;
  };
  const isFocusable = (item) => {
    var _a2, _b;
    return (_b = (_a2 = options.focusable) == null ? void 0 : _a2.call(options, item)) != null ? _b : true;
  };
  const isPreferred = (item) => {
    var _a2, _b;
    return (_b = (_a2 = options.preferred) == null ? void 0 : _a2.call(options, item)) != null ? _b : false;
  };
  function stopFor(preferred = isPreferred) {
    const list = order.list();
    if (!list.length) {
      return;
    }
    if (pending && !list.some(({ part }) => part.key === pending.key && isFocusable(part))) {
      return;
    }
    const candidates = list.map(({ part }) => ({
      key: part.key,
      disabled: isDisabled2(part),
      focusable: isFocusable(part),
      preferred: preferred(part)
    }));
    return rovingStop(candidates, remembered);
  }
  function check() {
    const stop2 = stopFor();
    if (stop2 !== void 0) {
      setStop(stop2);
    }
  }
  let queued = false;
  let joined = false;
  function queue(joinedOrLeft) {
    joined || (joined = joinedOrLeft);
    if (queued) {
      return;
    }
    queued = true;
    queueMicrotask(() => {
      var _a2;
      queued = false;
      check();
      focusPending();
      if (joined) {
        (_a2 = options.onItemsChange) == null ? void 0 : _a2.call(options);
      }
      joined = false;
    });
  }
  function moveTo(itemKey, from) {
    const move = pending = { key: itemKey, from };
    const before = remembered;
    if (remember) {
      remembered = itemKey;
    }
    setStop(itemKey);
    setTimeout(() => {
      focusPending();
      if (pending !== move) {
        return;
      }
      pending = null;
      if (remembered === itemKey) {
        remembered = before;
      }
      queue(false);
    });
  }
  const focusOn = (el) => {
    el.focus();
    return el.ownerDocument.activeElement === el;
  };
  function focusPending() {
    if (!pending) {
      return;
    }
    const item = order.list().find(({ part }) => part.key === pending.key);
    if (!item || !isFocusable(item.part)) {
      return;
    }
    const active = item.el.ownerDocument.activeElement;
    const untouched = active === pending.from || active === null || active === item.el.ownerDocument.body;
    if (!untouched || focusOn(item.el)) {
      pending = null;
    }
  }
  let stop = store.get()[key];
  context2.onDestroy(
    store.subscribe(() => {
      const was = stop;
      stop = store.get()[key];
      if (stop === null && was !== null && !moving) {
        remembered = null;
      }
      if (stop === was && order.size()) {
        queue(false);
      }
    })
  );
  function focusables() {
    return order.list().filter(({ part }) => isFocusable(part)).map(({ part, el }) => ({ key: part.key, props: part.props, el }));
  }
  const roving = {
    /** Joins a bound part to the group. Call it from the item slot's `bind` and return its cleanup. */
    bind(el, part) {
      const leave = order.add({ key: part.key, el, part });
      if ((pending == null ? void 0 : pending.left) && pending.from === el) {
        const was = pending.key;
        pending.key = part.key;
        if (remembered === was) {
          remembered = part.key;
        }
        if (store.get()[key] === was) {
          setStop(part.key);
        }
        if (el.ownerDocument.activeElement === el) {
          holder = el;
        }
      }
      const focused = () => {
        holder = el;
        if (remember) {
          roving.remember(part.key);
        }
      };
      const blurred = () => {
        if (holder === el) {
          holder = null;
        }
      };
      el.addEventListener("focus", focused);
      el.addEventListener("blur", blurred);
      let wasDisabled = isDisabled2(part);
      let wasPreferred = isPreferred(part);
      const unwatch = onProps(part, () => {
        if (isDisabled2(part) === wasDisabled && isPreferred(part) === wasPreferred) {
          return;
        }
        wasDisabled = isDisabled2(part);
        wasPreferred = isPreferred(part);
        queue(false);
      });
      queue(true);
      return () => {
        unwatch();
        el.removeEventListener("focus", focused);
        el.removeEventListener("blur", blurred);
        const doc = el.ownerDocument;
        const had = !!doc && (doc.activeElement === el || holder === el && doc.activeElement === doc.body);
        if (holder === el) {
          holder = null;
        }
        leave();
        if (had && !pending && store.get()[key] === part.key) {
          const wait = pending = { key: part.key, from: el, left: true };
          setTimeout(() => {
            if (pending !== wait) {
              return;
            }
            pending = null;
            queue(false);
          });
        }
        queue(true);
      };
    },
    /** The item's `tabindex`: `"0"` for the item with the stop, `"-1"` for the rest. Pure, so `attrs` can call it. */
    tabIndex(state, part) {
      var _a2;
      const stop2 = (_a2 = state[key]) != null ? _a2 : null;
      if (stop2 !== null) {
        return stop2 === part.key ? "0" : "-1";
      }
      const eligible = options.claims ? options.claims(state, part) : !isDisabled2(part) && isFocusable(part);
      return claim(part.key, eligible) ? "0" : "-1";
    },
    /**
     * Moves focus for a key pressed on an item's element. Returns the key it
     * moved to, the key it moved from and whether Shift was held, so the
     * caller can extend a selection, or `undefined` when the key isn't the
     * group's. At either end without `loop`, `key` is `from`.
     */
    keydown(event, el) {
      var _a2, _b, _c;
      if (event.defaultPrevented || event.altKey) {
        return;
      }
      const list = focusables();
      const from = list.find((item) => item.el === el);
      if (!from) {
        return;
      }
      const rtl = isRTL(el);
      let to;
      if (options.move) {
        to = options.move(event, { from, items: list, rtl });
      } else if (!event.ctrlKey && !event.metaKey) {
        const step = stepFor(event.key, orientation2(), rtl);
        if (step !== void 0) {
          to = (_c = list[moveIndex(
            list.indexOf(from),
            step,
            list.length,
            (_b = (_a2 = options.loop) == null ? void 0 : _a2.call(options)) != null ? _b : false
          )]) == null ? void 0 : _c.key;
        }
      }
      if (to === void 0) {
        return;
      }
      event.preventDefault();
      const next = list.find((item) => item.key === to);
      if (!next || next !== from && !focusOn(next.el)) {
        moveTo(to, el);
      }
      return { key: to, from: from.key, shift: event.shiftKey };
    },
    /** The items that can take focus now, in document order, with their elements. */
    items: focusables,
    /**
     * Focuses an item, or the one with the stop, or the first. An item that
     * isn't rendered or focusable yet takes the stop now and focus once it can.
     */
    focus(itemKey) {
      var _a2, _b;
      if (itemKey !== void 0) {
        const item = order.list().find(({ part }) => part.key === itemKey);
        if (item && isFocusable(item.part) && focusOn(item.el)) {
          return;
        }
        moveTo(
          itemKey,
          typeof document === "undefined" ? null : document.activeElement
        );
        return;
      }
      const list = order.list();
      (_b = (_a2 = list.find((item) => item.key === stop)) != null ? _a2 : list[0]) == null ? void 0 : _b.el.focus();
    },
    /**
     * Moves the stop to an item as if focus had landed on it, for an item
     * whose focus went elsewhere, like a menubar trigger whose menu took it.
     * A group that doesn't `remember` ignores it, since its stop follows the
     * preferred item.
     */
    remember(itemKey) {
      if (!remember) {
        return;
      }
      remembered = itemKey;
      setStop(itemKey);
    },
    /** Moves the stop to where the group's rules put it now. It also runs on its own after items join or leave and after state changes. */
    check,
    /**
     * Where the group's rules would put the stop if `preferred` said which
     * items are preferred, like the tab a value from options selects, without
     * moving it. Undefined while the bound items can't decide it, like when
     * none is preferred yet: the item may be about to bind, as when its value
     * changed, and the group decides once it has.
     */
    stopFor: (preferred) => order.list().some(({ part }) => preferred(part)) ? stopFor(preferred) : void 0
  };
  return roving;
}

// node_modules/@ui-sdk/core/dist/foundation/kernel/modality.js
var modality = "pointer";
var installed = false;
var scheduled = false;
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
    var _a, _b, _c, _d;
    if (changing.has(key) && sameValue(changing.get(key), value)) {
      return false;
    }
    const ask = ((_a = asked.get(key)) != null ? _a : 0) + 1;
    asked.set(key, ask);
    const previous = store.get()[key];
    if (sameValue(previous, value)) {
      return false;
    }
    const { reason, event } = details;
    const callbackDetails = createDetails(
      details,
      (_b = details.source) != null ? _b : source(reason, event)
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

// node_modules/@ui-sdk/core/dist/foundation/kernel/elements.js
function elements(context2, slot) {
  const bound = [...context2.parts()].filter(
    (part) => {
      var _a;
      return part.slot === slot && !!((_a = part.el) == null ? void 0 : _a.isConnected);
    }
  );
  return inDocumentOrder(bound).map(({ el, key, props }) => ({
    el,
    key,
    props
  }));
}

// node_modules/@ui-sdk/core/dist/components/radio/radio-api.js
function radioGroupState(options, extra = {}) {
  var _a;
  const value = options.value !== void 0 ? options.value : (_a = options.defaultValue) != null ? _a : null;
  return {
    value,
    initial: value,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    formDisabled: false,
    stop: null,
    exiting: [],
    ...extra
  };
}
function syncRadioGroup(options) {
  return {
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    // Like a native radio's `defaultChecked`, changing it changes what a reset returns to.
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.value === void 0 ? {} : { value: options.value }
  };
}
var isNativeButton = (el) => el instanceof HTMLButtonElement;
function radioGroupApiBody(context2, slots = { group: "group", item: "root" }) {
  const { id, store, options, element, props } = context2;
  const change = createChange(context2);
  let changed = false;
  const enabled = (item) => {
    var _a;
    return !((_a = item.props) == null ? void 0 : _a.disabled) && !isDisabled(store.get());
  };
  const roving = createRovingFocus(context2, {
    slot: slots.item,
    key: "stop",
    remember: false,
    disabled: (item) => !enabled(item),
    focusable: enabled,
    preferred: (item) => store.get().value === item.key,
    claims: (state, item) => {
      var _a;
      return ((_a = state.value) != null ? _a : item.key) === item.key;
    },
    move(event, { from, items, rtl }) {
      var _a;
      if (event.shiftKey) {
        return;
      }
      const step = radioStep(event.key, rtl);
      if (step === void 0) {
        return;
      }
      return items[moveIndex(
        items.indexOf(from),
        step,
        items.length,
        (_a = options().loop) != null ? _a : true
      )].key;
    }
  });
  const exitingAfter = (from, value, exiting) => [
    ...exiting.filter((key) => key !== value),
    ...from !== null && hasIndicator(from) && !exiting.includes(from) ? [from] : []
  ];
  deriveFromOptions(context2, ["exiting", "stop"], (synced, state) => {
    var _a;
    if (!("value" in synced) || synced.value === state.value) {
      return;
    }
    const value = (_a = synced.value) != null ? _a : null;
    const stop = roving.stopFor((item) => item.key === value);
    return {
      exiting: exitingAfter(state.value, value, state.exiting),
      ...stop !== void 0 && { stop }
    };
  });
  let previous = store.get().value;
  store.subscribe(() => {
    const { value, exiting } = store.get();
    if (value === previous) {
      return;
    }
    const from = previous;
    previous = value;
    changed = true;
    store.set({ exiting: exitingAfter(from, value, exiting) });
    roving.check();
  });
  const hasIndicator = (value) => {
    var _a;
    return !!((_a = element("indicator", value)) == null ? void 0 : _a.isConnected);
  };
  const formElement = () => {
    const root = element(slots.group);
    if (formInternals(root)) {
      return root;
    }
    const { value } = store.get();
    return value === null ? void 0 : element("input", value);
  };
  const api = {
    id,
    getValue: () => store.get().value,
    isChanged: () => changed,
    // Checks a radio, as a user would. Disabled radios and read-only groups ignore it.
    setValue(value, { reason = "imperative", event } = {}) {
      var _a;
      const details = { reason, event };
      const state = store.get();
      if (isDisabled(state) || state.readOnly) {
        return false;
      }
      if (value !== null && ((_a = props(slots.item, value)) == null ? void 0 : _a.disabled)) {
        return false;
      }
      const done = change("value", value, details);
      if (done && reason !== "restore") {
        dispatchChange(formElement());
      }
      return done;
    },
    // Moves focus to the item that holds the tab stop, the checked one if it is enabled.
    focus: () => roving.focus(),
    form: () => {
      var _a, _b, _c, _d, _e;
      return (_e = (_d = (_a = formInternals(element(slots.group))) == null ? void 0 : _a.form) != null ? _d : (_c = (_b = elements(context2, "input")[0]) == null ? void 0 : _b.el) == null ? void 0 : _c.form) != null ? _e : null;
    },
    internal: {
      // Checks the radio a press landed on. Rating unchecks a checked one.
      check: (key, details) => api.setValue(key, details),
      reset() {
        if (keepsValueOnReset(options().value, options().defaultValue)) {
          return;
        }
        change("value", store.get().initial, { reason: "reset" });
      },
      // The browser restores a disabled or read-only group too, as a native one.
      restore(saved) {
        change("value", saved || null, { reason: "restore" });
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      finishExit(key) {
        store.set({
          exiting: store.get().exiting.filter((value) => value !== key)
        });
      },
      roving,
      group: () => element(slots.group),
      radio: (key) => element(slots.item, key),
      // The props its item rendered with, for parts inside an item.
      itemProps: (key) => {
        var _a;
        return (_a = props(slots.item, key)) != null ? _a : {};
      },
      anchor: () => {
        var _a, _b;
        return (_b = (_a = roving.items()[0]) != null ? _a : elements(context2, slots.item)[0]) == null ? void 0 : _b.el;
      },
      onKeyDown(event, el) {
        if (event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          if (!event.repeat) {
            submitImplicitly(api.form());
          }
          return;
        }
        if (event.key === " ") {
          if (!isNativeButton(el)) {
            event.preventDefault();
          }
          return;
        }
        const moved = roving.keydown(event, el);
        if (moved && moved.key !== moved.from && !store.get().readOnly) {
          api.setValue(moved.key, { reason: "list-navigation", event });
        }
      }
    }
  };
  return api;
}
var radioGroupApi = radioGroupApiBody;
function itemState(state, key, props) {
  return {
    checked: state.value === key,
    disabled: !!props.disabled || isDisabled(state),
    readOnly: state.readOnly,
    required: state.required
  };
}
function itemData(state, key, props) {
  const { checked, disabled } = itemState(state, key, props);
  return {
    "data-checked": checked ? "" : void 0,
    "data-unchecked": checked ? void 0 : "",
    "data-disabled": disabled ? "" : void 0,
    "data-readonly": state.readOnly ? "" : void 0,
    "data-required": state.required ? "" : void 0
  };
}

// node_modules/@ui-sdk/core/dist/components/radio/radio-parts.js
function bindRadioGroup(el, api, store) {
  const unbind = bindInternals(el, {
    value: () => store.get().value,
    state: () => {
      var _a;
      return (_a = store.get().value) != null ? _a : "";
    },
    restore: api.internal.restore,
    valueMissing: () => store.get().required && store.get().value === null,
    message: () => valueMissingMessage("radio"),
    anchor: api.internal.anchor,
    focus: api.focus,
    reset: api.internal.reset,
    disabled: api.internal.setFormDisabled,
    subscribe: store.subscribe
  });
  const onClick = (event) => {
    if (event.target === el) {
      api.focus();
    }
  };
  let pressedLabel = null;
  const onPointerDown = (event) => {
    var _a, _b, _c;
    pressedLabel = isDisabled(store.get()) ? (_c = (_b = (_a = event.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "label")) != null ? _c : null : null;
  };
  const onFocusIn = (event) => {
    const label = pressedLabel;
    pressedLabel = null;
    const target = event.target;
    if ((label == null ? void 0 : label.control) === target && target !== el) {
      target.blur();
    }
  };
  const doc = el.ownerDocument;
  el.addEventListener("click", onClick);
  el.addEventListener("focusin", onFocusIn);
  doc.addEventListener("pointerdown", onPointerDown, true);
  return () => {
    unbind();
    el.removeEventListener("click", onClick);
    el.removeEventListener("focusin", onFocusIn);
    doc.removeEventListener("pointerdown", onPointerDown, true);
  };
}
var radioGroupAttrs = (state) => ({
  "aria-orientation": state.orientation,
  "data-orientation": state.orientation,
  "aria-required": state.required ? "true" : void 0,
  "aria-readonly": state.readOnly ? "true" : void 0,
  "aria-disabled": isDisabled(state) ? "true" : void 0,
  "data-disabled": isDisabled(state) ? "" : void 0,
  "data-readonly": state.readOnly ? "" : void 0,
  "data-required": state.required ? "" : void 0
});
function radioSlots(slot, groupState, radioAttrs = () => ({})) {
  return {
    group: slot({
      role: "radiogroup",
      keys: { none: "Focus stays on a radio, whose keydown handles them." },
      state: groupState,
      attrs: radioGroupAttrs,
      bind: (el, { api, store }) => bindRadioGroup(el, api, store)
    }),
    item: slot({
      role: "radio",
      focus: "roving",
      keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "],
      props: { value: "string", disabled: "boolean" },
      // Until there's a stop, the checked item holds it, or with nothing
      // checked, the first enabled one claims it: those hear a change to null.
      // Radios never read which indicators are exiting.
      selects: selects({
        value: ({ key }) => [key, null],
        stop: ({ key }) => [key, null],
        exiting: []
      }),
      state: (state, { key, props }) => itemState(state, key, props),
      attrs: (state, { key, props, api }) => {
        const { checked, disabled } = itemState(state, key, props);
        return {
          type: "button",
          "aria-checked": String(checked),
          // Disabled items are skipped, like native radios.
          disabled: props.disabled ? "" : void 0,
          "aria-disabled": disabled ? "true" : void 0,
          tabindex: disabled ? props.disabled ? void 0 : "-1" : api.internal.roving.tabIndex(state, { key, props }),
          ...itemData(state, key, props),
          ...radioAttrs(state, key, api)
        };
      },
      press({ api, key, props }, event) {
        event == null ? void 0 : event.preventDefault();
        if (props.disabled) {
          return;
        }
        api.internal.check(key, { reason: "item-press", event });
      },
      on: {
        // A group's disabled leaves the item focusable to scripts, so a press
        // mustn't focus it either, like a disabled native radio.
        mousedown: (event, { store, key, props }) => {
          if (itemState(store.get(), key, props).disabled) {
            event.preventDefault();
          }
        },
        keydown: (event, { api, el }) => api.internal.onKeyDown(event, el),
        keyup: (event, { api, el, key, props }) => {
          if (event.key === " " && !isNativeButton(el) && !props.disabled) {
            api.internal.check(key, { reason: "item-press", event });
          }
        }
      },
      bind(el, part) {
        const unregister = part.api.internal.roving.bind(el, part);
        const unname = nameFromLabels(el);
        return () => {
          unname();
          unregister();
        };
      }
    }),
    // React and Vue: a native radio per item, so the form submits, resets and validates them.
    input: slot({
      props: { value: "string", disabled: "boolean" },
      attrs: (state, { id, key, props }) => {
        var _a;
        return {
          type: "radio",
          // Required radios need a group to validate as one.
          name: (_a = state.name) != null ? _a : state.required ? id : void 0,
          value: key,
          form: state.form,
          checked: state.initial === key ? "" : void 0,
          required: state.required ? "" : void 0,
          disabled: state.disabled || props.disabled ? "" : void 0,
          "aria-hidden": "true",
          tabindex: "-1",
          style: hiddenInputStyle
        };
      },
      bind: (el, { api, store, key }) => bindHiddenInput(el, {
        checked: () => store.get().value === key,
        subscribe: store.subscribe,
        // The browser focuses an invalid radio on submit. Focus goes to the group's tab stop.
        focus: api.focus,
        control: () => api.internal.radio(key),
        activate: (event) => {
          if (!api.internal.itemProps(key).disabled) {
            api.internal.check(key, { reason: "item-press", event });
          }
        },
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled
      })
    })
  };
}

// node_modules/@ui-sdk/core/dist/components/segmented-control/segmented-control.js
var slotNames = { group: "root", item: "item" };
var indicatorVariables = [
  "left",
  "right",
  "top",
  "bottom",
  "width",
  "height"
];
var orientation = (options) => orientationOf(options.orientation, "horizontal");
var segmentedControlPrimitive = /* @__PURE__ */ definePrimitive({
  name: "segmented-control",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    loop: "boolean",
    orientation: "string",
    controller: "value"
  },
  state: (options) => radioGroupState(options, {
    orientation: orientation(options),
    direction: "none"
  }),
  sync: (options) => ({
    ...syncRadioGroup(options),
    orientation: orientation(options)
  }),
  api: (context2) => radioGroupApi(context2, slotNames),
  slots: (slot) => {
    const { group, item, input } = radioSlots(slot, (state) => {
      var _a;
      return {
        value: state.value,
        disabled: isDisabled(state),
        readOnly: state.readOnly,
        required: state.required,
        orientation: (_a = state.orientation) != null ? _a : "horizontal"
      };
    });
    return {
      root: group,
      item,
      input,
      indicator: slot({
        role: "presentation",
        state: (state) => {
          var _a, _b;
          return {
            value: state.value,
            orientation: (_a = state.orientation) != null ? _a : "horizontal",
            direction: (_b = state.direction) != null ? _b : "none"
          };
        },
        attrs: (state) => {
          var _a;
          return {
            "data-orientation": state.orientation,
            "data-activation-direction": (_a = state.direction) != null ? _a : "none"
          };
        },
        bind(el, { api, store }) {
          let value = store.get().value;
          const rect = (key) => {
            var _a;
            return key === null ? void 0 : (_a = api.internal.radio(key)) == null ? void 0 : _a.getBoundingClientRect();
          };
          return bindIndicator({
            list: () => {
              var _a;
              return (_a = api.internal.group()) != null ? _a : el.parentElement;
            },
            active: () => {
              const { value: value2 } = store.get();
              return value2 === null ? void 0 : api.internal.radio(value2);
            },
            itemSelector: '[role="radio"]',
            subscribe: (remeasure) => store.subscribe(() => {
              var _a;
              if (store.get().value === value) {
                return;
              }
              const direction = directionBetween(
                rect(value),
                rect(store.get().value),
                (_a = store.get().orientation) != null ? _a : "horizontal"
              );
              value = store.get().value;
              el.setAttribute("data-activation-direction", direction);
              store.set({ direction });
              remeasure();
            }),
            write(box) {
              for (const name of indicatorVariables) {
                if (box) {
                  el.style.setProperty(
                    `--segmented-control-indicator-${name}`,
                    `${box[name]}px`
                  );
                } else {
                  el.style.removeProperty(
                    `--segmented-control-indicator-${name}`
                  );
                }
              }
            }
          });
        }
      })
    };
  },
  agent: { actions: ["setValue"], closed: true }
});
var segmentedControl = segmentedControlPrimitive;

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

// node_modules/@ui-sdk/core/dist/foundation/kernel/live.js
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
  var _a, _b;
  if (el === writing) {
    return;
  }
  for (const written of Object.values((_a = applied.get(el)) != null ? _a : {})) {
    written.delete(name);
  }
  for (const values of Object.values((_b = found.get(el)) != null ? _b : {})) {
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
  var _a, _b, _c, _d, _e, _f;
  const channels = (_a = applied.get(el)) != null ? _a : {};
  const previous = (_b = channels[channel]) != null ? _b : /* @__PURE__ */ new Map();
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
  var _a, _b, _c;
  const kept = value == null || name === "id" ? void 0 : references.includes(name) ? authoredIds(value) : value;
  if (kept === void 0) {
    return void ((_b = (_a = found.get(el)) == null ? void 0 : _a[channel]) == null ? void 0 : _b.delete(name));
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
  var _a;
  if (id === null || id === ((_a = channels[channel]) == null ? void 0 : _a.get("id"))) {
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

// node_modules/@ui-sdk/core/dist/foundation/forms/form-internals.js
var callbacksOf = /* @__PURE__ */ new WeakMap();
var customMessages = /* @__PURE__ */ new WeakMap();
function formCallback(el, type, ...args) {
  var _a;
  if (type === "customValidity") {
    customMessages.set(el, args[0]);
  }
  const callback = (_a = callbacksOf.get(el)) == null ? void 0 : _a[type];
  callback == null ? void 0 : callback(...args);
  return !!callback;
}
function bindElementInternals(el, internals, options) {
  let reported = "";
  const sync = () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const value = options.value();
    if (value instanceof FormData) {
      internals.setFormValue(value, options.state());
    } else if (Array.isArray(value)) {
      const data = new FormData();
      const name = (_a = options.name) == null ? void 0 : _a.call(options);
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
    const invalid = (_b = options.invalid) == null ? void 0 : _b.call(options);
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
function reflectAttributes(proto, schema, defaults = {}) {
  for (const [name, type] of Object.entries(schema)) {
    if (name in proto) {
      continue;
    }
    const attribute = kebab(name);
    Object.defineProperty(proto, name, {
      configurable: true,
      get() {
        var _a, _b;
        return (_b = (_a = readAttribute(this, name, type)) != null ? _a : defaultOn(this, defaults[name])) != null ? _b : type === "boolean" ? false : void 0;
      },
      set(value) {
        const removes = value === false && type === "boolean" && !defaultOn(this, defaults[name]);
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
function upgradeProperties(el, names) {
  for (const name of names) {
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
  const owner = partOwners.get(el);
  if (quiet.has(el) || !!owner && quiet.has(owner)) {
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
function withEvents(el, target, silent = [], actions = [], names = {}) {
  return new Proxy(target, {
    get(target2, key) {
      if (key in target2 || typeof key !== "string" || !/^on[A-Z]/.test(key)) {
        return target2[key];
      }
      if (silent.includes(key)) {
        return void 0;
      }
      return (value, details) => {
        var _a, _b, _c;
        if (quietNow(el)) {
          return;
        }
        const only = detailsOnly(value, details);
        const { cancel, canceled, ...rest } = (_a = only ? value : details) != null ? _a : {};
        const detail = only ? rest : { ...rest, value };
        const wait = actions.includes(key) ? waitList() : void 0;
        if (wait) {
          detail.waitUntil = wait.waitUntil;
        }
        const event = new CustomEvent(
          (_b = names[key]) != null ? _b : key.slice(2).toLowerCase(),
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
  var _a;
  if (styleId) {
    return styleId;
  }
  const copies = globalThis;
  const key = /* @__PURE__ */ Symbol.for("ui-sdk.web-styles@1");
  copies[key] = ((_a = copies[key]) != null ? _a : 0) + 1;
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
  const shared = sharedSheet(root.ownerDocument);
  if (!shared || root.adoptedStyleSheets.includes(shared)) {
    return;
  }
  root.adoptedStyleSheets = [shared, ...root.adoptedStyleSheets];
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
var partOwners = /* @__PURE__ */ new WeakMap();
var slotParts = /* @__PURE__ */ new WeakMap();
function innerPart(part, owner) {
  for (let node = part.el; node && node !== owner; node = node.parentElement) {
    const other = slotParts.get(node);
    if (other === part) {
      return;
    }
    if ((other == null ? void 0 : other.el) === part.el && registered.has(other)) {
      return other;
    }
  }
}
function handOver(part) {
  var _a;
  part.dataSlot = void 0;
  const sharing = [];
  for (let node = part.el; node; node = node.parentElement) {
    const other = slotParts.get(node);
    if (other && other !== part && other.el === part.el && registered.has(other)) {
      sharing.push(other);
    }
  }
  if (!sharing.length) {
    return;
  }
  part.el.removeAttribute("data-slot");
  markAuthored(part.el, "data-slot");
  for (const other of sharing) {
    (_a = other.sync) == null ? void 0 : _a.call(other);
  }
}
var registered = /* @__PURE__ */ new WeakSet();
var findOwnerAgain = /* @__PURE__ */ new WeakMap();
var hasRichValue = (props) => props.value !== void 0 && typeof props.value !== "string";
function propsAround(el, slot, owner) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const part = slotParts.get(node);
    if ((part == null ? void 0 : part.slot) !== slot || partOwners.get(node) !== owner) {
      continue;
    }
    return part.keyed && hasRichValue(part.props) ? { ...part.props, value: part.props.id } : part.props;
  }
}
function findOwner(el, selector) {
  const target = el.getAttribute("for");
  if (target) {
    const root = el.getRootNode();
    const owner = "getElementById" in root ? root.getElementById(target) : null;
    if (owner == null ? void 0 : owner.matches(selector)) {
      return owner;
    }
  }
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (node.matches(selector)) {
      return node;
    }
    const owner = partOwners.get(node);
    if (owner == null ? void 0 : owner.matches(selector)) {
      return owner;
    }
  }
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
  var _a, _internals;
  return _a = class extends Base {
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
      var _a2;
      return (_a2 = this.getAttribute("name")) != null ? _a2 : "";
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
  }, _internals = new WeakMap(), __publicField(_a, "formAssociated", true), _a;
}
var defaultOf = (name) => `default${name[0].toUpperCase()}${name.slice(1)}`;
function defineRootElement(tagName, primitive, config) {
  var _a, _b, _c, _view, _Owner_instances, instance_get, _parts, _pending, _connected, _rendering, _rendered, _applying, _stale, _gone, _properties, _state, _saved, configure_fn, quietly_fn, _renderCleanup, render_fn, _childParts, _childObserver, _selfPart, registerSelf_fn, syncSelf_fn, registerChild_fn, syncChildren_fn, flush_fn, watch_fn, rewatch_fn, sync_fn, bind_fn, unbind_fn, portalTarget_fn, moves_fn, move_fn, apply_fn, channel_get, restore_fn;
  if (!claimTag(tagName)) {
    return;
  }
  setDisplay(tagName, config.display);
  const schema = {
    debug: "boolean",
    ...config.attributes
  };
  const state = (_a = config.state) != null ? _a : {};
  const optionsOf = (el, properties, rendered) => {
    var _a2;
    const options = readAttributes(el, schema);
    for (const name of rendered) {
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
    return { ...options, ...(_a2 = config.options) == null ? void 0 : _a2.call(config, el) };
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
        var _a2, _b;
        if (!__privateGet(this, _Owner_instances, instance_get)) {
          return void 0;
        }
        return (_b = __privateGet(this, _view)) != null ? _b : __privateSet(this, _view, controllerView(
          this,
          __privateGet(this, _Owner_instances, instance_get).api,
          (_a2 = config.api) != null ? _a2 : []
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
        var _a2, _b, _c2, _d, _e;
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
          ...(_a2 = config.properties) != null ? _a2 : [],
          ...Object.keys(schema)
        ]);
        for (const [name, value] of Object.entries((_b = config.host) != null ? _b : {})) {
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
          var _a2, _b, _c2, _d;
          __privateSet(this, _saved, (_a2 = formStates.get(this)) == null ? void 0 : _a2());
          (_b = __privateGet(this, _renderCleanup)) == null ? void 0 : _b.call(this);
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
        registered.add(part);
        part.sync = () => __privateGet(this, _pending).has(part) || __privateMethod(this, _Owner_instances, sync_fn).call(this, part);
        if (!__privateGet(this, _pending).size) {
          queueMicrotask(() => __privateMethod(this, _Owner_instances, flush_fn).call(this));
        }
        __privateGet(this, _pending).add(part);
      }
      unregister(part) {
        var _a2, _b, _c2;
        (_a2 = part.unwatch) == null ? void 0 : _a2.call(part);
        part.unwatch = void 0;
        (_b = part.observer) == null ? void 0 : _b.disconnect();
        part.observer = void 0;
        __privateMethod(this, _Owner_instances, unbind_fn).call(this, part);
        releaseAttrs(part.el, __privateGet(this, _Owner_instances, channel_get));
        (_c2 = part.disconnect) == null ? void 0 : _c2.call(part);
        part.disconnect = void 0;
        __privateMethod(this, _Owner_instances, restore_fn).call(this, part);
        __privateGet(this, _parts).delete(part);
        registered.delete(part);
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
    configure_fn = function(defaults) {
      var _a2;
      (_a2 = __privateGet(this, _Owner_instances, instance_get)) == null ? void 0 : _a2.setOptions(
        withEvents(
          this,
          {
            ...optionsOf(this, __privateGet(this, _properties), __privateGet(this, _rendered)),
            ...defaults,
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
      var _a2, _b;
      (_a2 = __privateGet(this, _renderCleanup)) == null ? void 0 : _a2.call(this);
      __privateSet(this, _renderCleanup, ((_b = config.render) == null ? void 0 : _b.call(config, this, __privateGet(this, _Owner_instances, instance_get))) || void 0);
    }, _childParts = new WeakMap(), _childObserver = new WeakMap(), _selfPart = new WeakMap(), registerSelf_fn = function(el) {
      __privateSet(this, _selfPart, { slot: config.self, el, props: {} });
      this.register(__privateGet(this, _selfPart));
    }, // The element the own slot binds was replaced: the new one binds instead.
    syncSelf_fn = function() {
      var _a2;
      if (!config.self || !config.target) {
        return;
      }
      const el = boundElement(this, config.target);
      if (el === ((_a2 = __privateGet(this, _selfPart)) == null ? void 0 : _a2.el)) {
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
      var _a2, _b, _c2;
      const part = {
        slot,
        el,
        props: (_c2 = (_b = (_a2 = config.childProps) == null ? void 0 : _a2.read) == null ? void 0 : _b.call(_a2, el)) != null ? _c2 : {}
      };
      if (config.childProps) {
        part.observer = new MutationObserver(() => {
          var _a3, _b2, _c3;
          part.props = (_c3 = (_b2 = (_a3 = config.childProps).read) == null ? void 0 : _b2.call(_a3, el)) != null ? _c3 : {};
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
      var _a2;
      for (const [slot, find] of Object.entries((_a2 = config.children) != null ? _a2 : {})) {
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
      var _a2;
      const instance = __privateGet(this, _Owner_instances, instance_get);
      (_a2 = part.unwatch) == null ? void 0 : _a2.call(part);
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
      var _a2;
      if (__privateGet(this, _applying).has(part)) {
        return void __privateGet(this, _stale).add(part);
      }
      adoptStyles(part.el);
      const instance = __privateGet(this, _Owner_instances, instance_get);
      const record = instance.part(part.slot, part.props);
      (_a2 = part.disconnect) != null ? _a2 : part.disconnect = connect(record, part.el);
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
      var _a2;
      if (!((_a2 = config.portal) == null ? void 0 : _a2.slots.includes(part.slot))) {
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
      for (const name of (_b = config.properties) != null ? _b : []) {
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
  var _a, _b, _c, _owner, _part, _properties, _PartElement_instances, props_fn, _children, findOwnerLater_fn, retarget_fn;
  if (!claimTag(tagName)) {
    return;
  }
  const schema = (_a = config.props) != null ? _a : {};
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
        var _a2, _b, _c2;
        upgradeProperties(this, [
          ...(_a2 = config.properties) != null ? _a2 : [],
          ...Object.keys(schema)
        ]);
        adoptStyles(this);
        if ((config.target || this.hasAttribute("as-child")) && !__privateGet(this, _children)) {
          __privateSet(this, _children, new MutationObserver(() => __privateMethod(this, _PartElement_instances, retarget_fn).call(this)));
          __privateGet(this, _children).observe(this, { childList: true });
        }
        const owner = (_b = findOwner(this, config.owner)) != null ? _b : __privateGet(this, _owner);
        if (!owner) {
          return queueMicrotask(() => __privateMethod(this, _PartElement_instances, findOwnerLater_fn).call(this));
        }
        if (!("register" in owner)) {
          customElements.whenDefined(owner.localName).then(() => this.isConnected && this.connectedCallback());
          return;
        }
        if (owner === __privateGet(this, _owner) && __privateGet(this, _part) && registered.has(__privateGet(this, _part))) {
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
        __privateSet(this, _owner, owner);
        __privateSet(this, _part, {
          slot: config.slot,
          feature: config.feature,
          el,
          props: __privateMethod(this, _PartElement_instances, props_fn).call(this),
          reread: (config.context || config.from) && (() => __privateMethod(this, _PartElement_instances, props_fn).call(this)),
          keyed: config.keyed
        });
        partOwners.set(this, owner);
        slotParts.set(this, __privateGet(this, _part));
        owner.register(__privateGet(this, _part));
      }
      disconnectedCallback() {
        whenGone(this, () => {
          var _a2;
          (_a2 = __privateGet(this, _children)) == null ? void 0 : _a2.disconnect();
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
        var _a2, _b, _c2;
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
            config.alone((_a2 = boundElement(this, config.target)) != null ? _a2 : this, this);
          }
          return;
        }
        const previous = __privateGet(this, _part).props;
        __privateGet(this, _part).props = __privateMethod(this, _PartElement_instances, props_fn).call(this);
        const next = __privateGet(this, _part).props;
        const rebind = rekeyed(previous, next) || !!((_b = config.rebind) == null ? void 0 : _b.some((name2) => previous[name2] !== next[name2]));
        __privateGet(this, _owner).update(__privateGet(this, _part), rebind);
        (_c2 = config.changed) == null ? void 0 : _c2.call(config, this);
      }
    }, _owner = new WeakMap(), _part = new WeakMap(), _properties = new WeakMap(), _PartElement_instances = new WeakSet(), // What the element says itself, its attributes and properties, wins
    // over what its surroundings give it.
    props_fn = function() {
      var _a2, _b, _c2, _d, _e, _f, _g, _h, _i;
      const props = {
        ...(_a2 = config.context) == null ? void 0 : _a2.call(config, this),
        ...readAttributes(this, schema)
      };
      for (const name of (_b = config.properties) != null ? _b : []) {
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
      var _a2;
      if (!this.isConnected || __privateGet(this, _owner)) {
        return;
      }
      if (findOwner(this, config.owner)) {
        this.connectedCallback();
      } else if (config.alone) {
        config.alone((_a2 = boundElement(this, config.target)) != null ? _a2 : this, this);
      } else if (!this.hasAttribute("for")) {
        warn(`<${tagName}> must be inside ${config.owner}.`);
      }
    }, // The element the part binds came, left or was replaced: the part lets go
    // of the old one and registers again with what's there now. One the owner
    // moved into a portal, like an input a sheet puts in its header, stays bound.
    retarget_fn = function() {
      var _a2;
      const old = (_a2 = __privateGet(this, _part)) == null ? void 0 : _a2.el;
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
      for (const name of (_b = config.properties) != null ? _b : []) {
        Object.defineProperty(_c.prototype, name, {
          get() {
            var _a2;
            return (_a2 = __privateGet(this, _properties)[name]) != null ? _a2 : schema[name] && readAttribute(this, name, schema[name]);
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
  var _a, _b, _c, _d, _e;
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
      .../* @__PURE__ */ new Set([...(_a = rootTags.get(primitive)) != null ? _a : [], tag2])
    ]);
    const { debug: _debug, ...optionSchema } = schema.options;
    const props2 = elementProps(optionSchema, schema, kinds2);
    const config2 = {
      ...options2,
      self: self != null ? self : "root" in schema.slots && !((_b = options2.children) == null ? void 0 : _b.root) ? "root" : void 0,
      attributes: props2.attributes,
      // Live state has its own property.
      properties: [.../* @__PURE__ */ new Set([...props2.properties, ...properties2])].filter(
        (name) => {
          var _a2;
          return !((_a2 = options2.state) == null ? void 0 : _a2[name]);
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
  const roots = rootTags.get(primitive);
  if (!roots) {
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
    owner: [.../* @__PURE__ */ new Set([...root ? [root] : [], ...roots, ...owners])].join(
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
  const owner = partElement(primitive, "root", root);
  return [
    owner,
    ...Object.entries(
      parts
    ).flatMap(
      ([key, tag]) => tag ? [partElement(primitive, key, tag, owner.tagName)] : []
    )
  ];
}
function defineElement(primitive, element) {
  if (element.kind === "owner") {
    defineRootElement(element.tagName, primitive, element.config);
  } else {
    definePartElement(element.tagName, element.config);
  }
}
var pascal = (name) => name.replace(/(^|-)(\w)/g, (_, _dash, char) => char.toUpperCase());
function createParts(primitive, tags) {
  const parts = {};
  for (const element of partElements(primitive, tags)) {
    defineElement(primitive, element);
    parts[pascal(element.key)] = typeof customElements === "undefined" ? void 0 : customElements.get(element.tagName);
  }
  return parts;
}

// node_modules/@ui-sdk/web/dist/segmented-control.js
function defineSegmentedControlElements() {
  createParts(segmentedControl, {
    root: {
      tag: "ui-segmented-control",
      defaults: { loop: true },
      display: "block",
      formAssociated: true,
      state: {
        value: {
          get: (api) => api.getValue(),
          set: (api, value) => api.setValue(value)
        }
      },
      api: ["getValue", "setValue", "focus"]
    },
    // Form-associated, so a <label> around or pointing at an item checks it.
    item: { tag: "ui-segmented-control-item", formAssociated: true },
    indicator: "ui-segmented-control-indicator"
  });
}

// node_modules/@ui-sdk/web/dist/entries/segmented-control.js
defineSegmentedControlElements();
