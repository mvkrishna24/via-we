/**
 * Normalized pointer shared between the DOM shell and the 3D layer.
 * The canvas sits behind pointer-events-none overlays, so the shell
 * feeds movement in from a window listener.
 */
export const pointerState = { x: 0, y: 0 };
