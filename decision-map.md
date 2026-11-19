# Decision Map

Canonical decisions:

- [Re-frame2 Web UI Playbook And Visual Agent Loop](../../docs/decisions/re-frame2-visual-agent-loop.md)
  Affects: shared Catalog and Stage ownership, flat data-shaped Scenes,
  per-Scene frame isolation, Stage DOM containment, public Playbook APIs,
  stable routes, and the browser inspection bridge.
- [Anchored Overlays Come From `@ui-sdk/core`](../../docs/decisions/ui-sdk-anchored-overlays.md)
  Affects: `ui/anchor` and its interface own positioning and the dismissal
  stack; callers keep placement policy as a pure decision and keep their own
  open state.
- [Web Design System](../../docs/decisions/design-system.md)
  Affects: interaction components remain visual-identity-neutral and own their
  accessibility and overlay mechanics; the Catalog hosts app-supplied fixed
  tool destinations without owning product tokens or visual systems.
