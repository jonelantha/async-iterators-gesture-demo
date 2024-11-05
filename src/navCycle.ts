export async function* navCycle(
  baseTransform: DOMMatrix,
  events: AsyncIterable<PointerEvent | KeyboardEvent | WheelEvent>,
) {
  try {
    return (yield* initialPhase(baseTransform)) ?? baseTransform;
  } catch {
    yield { transform: baseTransform, animate: true };

    return baseTransform;
  }

  // phases

  async function* initialPhase(transform: DOMMatrix): Phase {
    for await (const event of events) {
      switch (event.type) {
        case "pointerdown":
          return yield* panPhase(transform, getPointer(event));

        case "keydown": {
          const transformFromKeyEvent = applyKeyEvent(transform, event);

          if (transformFromKeyEvent) {
            yield { transform: transformFromKeyEvent, animate: true };

            return transformFromKeyEvent;
          }
          break;
        }

        case "wheel": {
          transform = applyWheelEvent(transform, event);

          yield { transform };

          return transform;
        }
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

            yield { transform };
          }
          break;

        case "pointerup":
          if (event.pointerId === currentPointer.id) {
            return transform;
          }
          break;

        case "pointercancel":
          if (event.pointerId === currentPointer.id) {
            throw new Error("pointercancel");
          }
          break;

        case "pointerdown":
          if (event.pointerId !== currentPointer.id) {
            const newPointer = getPointer(event);

            return yield* pinchPhase(transform, [currentPointer, newPointer]);
          }
          break;

        case "wheel":
          transform = applyWheelEvent(transform, event);

          yield { transform };

          break;

        case "keydown":
          if (event.key === "Escape") {
            throw new Error("escape");
          }
          break;
      }
    }
  }

  async function* pinchPhase(
    transform: DOMMatrix,
    currentPointers: [Pointer, Pointer],
  ): Phase {
    for await (const event of events) {
      switch (event.type) {
        case "pointermove": {
          const oldPointers = currentPointers;

          if (event.pointerId === currentPointers[0].id) {
            currentPointers = [getPointer(event), currentPointers[1]];
          } else if (event.pointerId === currentPointers[1].id) {
            currentPointers = [currentPointers[0], getPointer(event)];
          }

          if (currentPointers !== oldPointers) {
            transform = applyPinch(transform, currentPointers, oldPointers);

            yield { transform };
          }
          break;
        }

        case "pointerup":
        case "pointercancel":
          if (event.pointerId === currentPointers[0].id) {
            return yield* panPhase(transform, currentPointers[1]);
          } else if (event.pointerId === currentPointers[1].id) {
            return yield* panPhase(transform, currentPointers[0]);
          }
          break;

        case "keydown":
          if (event.key === "Escape") {
            throw new Error("escape");
          }
          break;
      }
    }
  }

  type Phase = AsyncIterable<
    { transform: DOMMatrix; animate?: boolean },
    DOMMatrix | undefined
  >;
}

// helpers

function applyKeyEvent(transform: DOMMatrix, event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowRight":
      return new DOMMatrix().translate(100, 0).multiply(transform);

    case "ArrowLeft":
      return new DOMMatrix().translate(-100, 0).multiply(transform);

    case "ArrowUp":
      return new DOMMatrix().translate(0, -100).multiply(transform);

    case "ArrowDown":
      return new DOMMatrix().translate(0, 100).multiply(transform);

    case "+":
      return new DOMMatrix().scale(2).multiply(transform);

    case "-":
      return new DOMMatrix().scale(0.5).multiply(transform);
  }
}

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

function applyPinch(
  transform: DOMMatrix,
  currentPoints: [Point, Point],
  previousPoints: [Point, Point],
) {
  const previousMidPoint = midPoint(...previousPoints);
  const currentMidPoint = midPoint(...currentPoints);

  return new DOMMatrix()
    .translate(currentMidPoint.x, currentMidPoint.y)
    .scale(distanceBetween(...currentPoints))
    .scale(1 / distanceBetween(...previousPoints))
    .translate(-previousMidPoint.x, -previousMidPoint.y)
    .multiply(transform);
}

function applyWheelEvent(transform: DOMMatrix, wheelEvent: WheelEvent) {
  return new DOMMatrix()
    .scale(1 - wheelEvent.deltaY * 0.01)
    .multiply(transform);
}

function distanceBetween({ x: x0, y: y0 }: Point, { x: x1, y: y1 }: Point) {
  const deltaX = x0 - x1;
  const deltaY = y0 - y1;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function midPoint({ x: x0, y: y0 }: Point, { x: x1, y: y1 }: Point): Point {
  return { x: x0 + (x1 - x0) / 2, y: y0 + (y1 - y0) / 2 };
}

function getPointer(pointerEvent: PointerEvent): Pointer {
  return { x: pointerEvent.x, y: pointerEvent.y, id: pointerEvent.pointerId };
}
