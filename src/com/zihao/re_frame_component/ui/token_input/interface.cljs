(ns com.zihao.re-frame-component.ui.token-input.interface
  "Public API for the controlled token input: an editor that holds tokens beside
  text, with the accessible behavior and the suggestion menu supplied by the
  shared ui-sdk elements."
  (:require
   [com.zihao.re-frame-component.ui.token-input :as token-input]
   [com.zihao.re-frame-component.ui.token-input.model :as model]))

(defn token-input
  "Renders one token input whose value the caller seeds and reads.

  Parameters:
  - `props` — input attributes:
    - `:initial-value` — required; the value to start from: a vector of strings
      and token maps `{:type :value :label}`.
    - `:value-key` — required; the identity of that seed (a Thread id, a reset
      counter). Written when it changes; never written for a plain re-render.
    - `:handle` — optional atom the binding fills with `{:element node :api api}`
      while mounted; read the text through it at submit.
    - `:on-change` — optional function of `(value details)`; `details` carries
      `:reason`, `:input-type` and the `:removed` tokens.
    - `:on-paste` / `:on-blur` — optional event handlers (clipboard images, the
      commit boundary).
    - `:triggers` — optional vector of declarative triggers (`:char`, `:type`,
      `:source`, plus the element's own options in kebab case).
    - `:sources` — optional map of source key → `(fn [query context] ...)` returning
      items, or a Promise of them. A trigger is only mounted when its source exists.
    - `:submit-shortcut` — `\"enter\"` or `\"mod+enter\"`; the element submits the
      form it is in.
    - `:disabled?`, `:read-only?`, `:id`, and the paint maps described on `markup`.

  Returns: Reagent hiccup for the token input, or nil while its elements load."
  [props]
  [token-input/token-input props])

(defn markup
  "The element tree of one token input, without mounting it.

  Parameters:
  - `props` — the maps `token-input` takes (the seed, the handle, the triggers and
    the handlers are dropped, since the binding writes them onto the DOM node).

  Returns: hiccup `[ui-token-input ...]` holding the editor, the token
  `<template>` and — only when a trigger has a source — the suggestion menu."
  [props]
  (model/markup props))

(defn trigger-menu?
  "Whether `props` describe a suggestion menu worth mounting."
  [props]
  (model/trigger-menu? props))

(def input-tag
  "Tag name of the token input element (`\"ui-token-input\"`)."
  model/input-tag)

(def editor-tag
  "Tag name of the editor inside it (`\"ui-token-input-editor\"`)."
  model/editor-tag)

(def token-tag
  "Tag name of one token (`\"ui-token-input-token\"`)."
  model/token-tag)

(def token-remove-tag
  "Tag name of a token's remove part (`\"ui-token-input-token-remove\"`)."
  model/token-remove-tag)

(def trigger-menu-tag
  "Tag name of the suggestion menu (`\"ui-trigger-menu\"`)."
  model/trigger-menu-tag)
