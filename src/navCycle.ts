export async function* navCycle(
  baseTransform: DOMMatrix,
  events: AsyncIterable<PointerEvent>,
) {
  return (yield* initialPhase(baseTransform)) ?? baseTransform;

  // phases

  async function* initialPhase(transform: DOMMatrix): Phase {
    for await (const event of events) {
      switch (event.type) {
        case "pointerdown":
          return yield* panPhase(transform, getPointer(event));
      }
    }
  }

  async function* panPhase(
    transform: DOMMatrix,
    currentPointer: Pointer,
  ): Phase {
    for await (const event of events) {
      switch (event.type) {
        case "pointermove":
          if (event.pointerId === currentPointer.id) {
            const oldPointer = currentPointer;

            currentPointer = getPointer(event);

            transform = applyPan(transform, currentPointer, oldPointer);

            yield transform;
          }
          break;

        case "pointerup":
        case "pointercancel":
          if (event.pointerId === currentPointer.id) {
            return transform;
          }
          break;
      }
    }
  }

  type Phase = AsyncIterable<DOMMatrix, DOMMatrix | undefined>;
}

// helpers

function applyPan(
  transform: DOMMatrix,
  currentPoint: Point,
  previousPoint: Point,
) {
  return new DOMMatrix()
    .translate(currentPoint.x, currentPoint.y)
    .translate(-previousPoint.x, -previousPoint.y)
    .multiply(transform);
}

function getPointer(pointerEvent: PointerEvent): Pointer {
  return { x: pointerEvent.x, y: pointerEvent.y, id: pointerEvent.pointerId };
}
