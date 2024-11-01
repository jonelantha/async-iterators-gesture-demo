import { getEvents } from "./util/getEvents";

export async function* inputEvents(element: HTMLElement | null) {
  if (!element) return;

  const events = getEvents(element, [
    "pointermove",
    "pointerdown",
    "pointerup",
    "pointercancel",
  ]);

  for await (const event of events) {
    switch (event.type) {
      case "pointerdown":
        if (event.button === 0) {
          event.preventDefault();

          element.setPointerCapture(event.pointerId);

          yield event;
        }
        break;

      default:
        yield event;
    }
  }
}
