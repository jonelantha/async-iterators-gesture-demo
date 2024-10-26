interface MouseEvent {
  type: "mousedown" | "mouseup" | "mousemove";
}

interface PointerEvent {
  type: "pointerdown" | "pointerup" | "pointermove" | "pointercancel";
}

interface KeyboardEvent {
  type: "keydown";
}

interface WheelEvent {
  type: "wheel";
}

type Point = Readonly<{ x: number; y: number }>;

type Pointer = Readonly<{ x: number; y: number; id: number }>;
