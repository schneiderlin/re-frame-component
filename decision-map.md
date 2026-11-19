# Decision Map

Canonical decisions:

- [Re-frame2 Web UI Playbook And Visual Agent Loop](../../docs/decisions/re-frame2-visual-agent-loop.md)
  Affects: shared Catalog and Stage ownership, flat data-shaped Scenes,
  per-Scene frame isolation, Stage DOM containment, public Playbook APIs,
  stable routes, and the browser inspection bridge.
- [UI Behavior Comes From ui-sdk](../../docs/decisions/ui-sdk-behaviors.md)
  Affects: `ui/anchor` and its interface own positioning and the dismissal
  stack, and `ui/switch` and its interface own a controlled boolean's press,
  focus and change behavior behind plain Clojure data; callers keep placement
  policy, copy and styling, and `ui.switch.model` keeps the switch's element
  contract pure.
- [Web Design System](../../docs/decisions/design-system.md)
  Affects: interaction components remain visual-identity-neutral and own their
  accessibility and overlay mechanics; the Catalog hosts app-supplied fixed
  tool destinations without owning product tokens or visual systems.
