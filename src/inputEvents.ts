import { getEvents } from "./util/getEvents";

export async function* inputEvents(element: HTMLElement | null) {
  if (!element) return;

  const events = getEvents(element, [
    "pointermove",
    "pointerdown",
    "pointerup",
    "pointercancel",
    "keydown",
    "wheel",
  ]);

  const elementCenter = getCenter(element);

  for await (const event of events) {
    switch (event.type) {
      case "pointerdown":
        if (event.button === 0) {
          event.preventDefault();

          element.setPointerCapture(event.pointerId);

          element.focus();

          yield offsettedPointerEvent(event, elementCenter);
        }
        break;

      case "pointermove":
      case "pointerup":
      case "pointercancel":
        yield offsettedPointerEvent(event, elementCenter);

        break;

      case "wheel":
        event.preventDefault();

        yield event;

        break;

      default:
        yield event;
    }
  }
}

// helpers

function getCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return { x: rect.width / 2, y: rect.height / 2 };
}

function offsettedPointerEvent(pointerEvent: PointerEvent, offset: Point) {
  return new PointerEvent(pointerEvent.type, {
    pointerId: pointerEvent.pointerId,
    clientX: pointerEvent.clientX - offset.x,
    clientY: pointerEvent.clientY - offset.y,
  });
}
