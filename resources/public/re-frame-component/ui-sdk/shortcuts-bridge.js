import { formatShortcut, registerShortcut } from './shortcuts.js';

// Keep the SDK outside Closure's property renaming in :browser release builds.
globalThis.ReFrameComponentShortcuts = { formatShortcut, registerShortcut };
