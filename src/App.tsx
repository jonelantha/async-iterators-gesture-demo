import { useState } from "react";
import { useAsyncIterator } from "./util/useAsyncIterator";
import { inputEvents } from "./inputEvents";
import { applyPan } from "./navCycle";

import "./App.css";

function App() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const transform = useAsyncIterator(
    async function* transforms(signal) {
      const events = inputEvents(container);

      let transform = new DOMMatrix();

      let currentPointer: Pointer | undefined;

      for await (const event of events) {
        if (currentPointer === undefined) {
          if (event.type === "pointerdown") {
            currentPointer = { id: event.pointerId, x: event.x, y: event.y };
          }
        } else {
          // currentPointer !== undefined
          if (event.pointerId === currentPointer.id) {
            if (event.type === "pointermove") {
              const oldPointer = currentPointer;

              currentPointer = { id: event.pointerId, x: event.x, y: event.y };

              transform = applyPan(transform, currentPointer, oldPointer);

              yield transform;
            }

            if (event.type === "pointerup" || event.type === "pointercancel") {
              currentPointer = undefined;
            }
          }
        }
      }
    },
    [container],
  );

  return (
    <div id="container" ref={setContainer}>
      <img style={{ transform: transform?.toString() }} />
    </div>
  );
}

export default App;
