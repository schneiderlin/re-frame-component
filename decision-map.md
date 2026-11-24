# Decision Map

Canonical decisions:

- [Re-frame2 Web UI Playbook And Visual Agent Loop](../../docs/decisions/re-frame2-visual-agent-loop.md)
  Affects: shared Catalog and Stage ownership, flat data-shaped Scenes,
  per-Scene frame isolation, Stage DOM containment, public Playbook APIs,
  stable routes, and the browser inspection bridge.
- [UI Behavior Comes From ui-sdk](../../docs/decisions/ui-sdk-behaviors.md)
  Affects: `ui/anchor` and its interface own positioning and the dismissal
  stack, `ui/switch` and its interface own a controlled boolean's press, focus
  and change behavior, `ui/token-input` owns an element-held token value, an
  edit's reason and the suggestion menu — seeded by `:value-key` and read through
  a handle, never mirrored — `ui/segmented-control` owns one answer on a short
  scale, and `ui/tree` owns a nested list's roving focus, expansion and
  selection, with `data-row-action` marking a control hosted inside a row so its
  presses stay its own. All behind plain Clojure data; callers keep placement
  policy, copy, styling and whatever snapshot of the text they want. The `.model`
  namespaces keep each element contract pure. `ui/disclosure` owns one panel a
  person opens: the ARIA disclosure pattern, the trigger's press, focus returned
  on close, and `data-open` / `data-closed` on every part, with the shared
  `disclosure-chevron` glyph and a `disclosure-markup` contract a `.cljc` renderer
  can build on the JVM. Each binding is the same shape: one bundled module under
  `resources/public/re-frame-component/ui-sdk/`, a DOM write rule, and no paint.
- [Web Design System](../../docs/decisions/design-system.md)
  Affects: interaction components remain visual-identity-neutral and own their
  accessibility and overlay mechanics; the Catalog hosts app-supplied fixed
  tool destinations without owning product tokens or visual systems.
- [A Landing Marks Its Target As A Fact](../../docs/decisions/landing-highlight.md)
  Affects: `ui/landing` and its interface own the arrival — the previous mark is
  removed, the target is centred, focused and flashed, and carries `data-landed`
  — while the address stays with the surface that can answer it. The mark is a
  DOM fact rather than app state, so nothing clears it on scroll or on a press;
  the flash is a DOM animation because the attribute does not change between two
  landings on the same element.
