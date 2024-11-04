import { useState } from "react";
import { useAsyncIterator } from "./util/useAsyncIterator";
import { inputEvents } from "./inputEvents";
import { navCycle } from "./navCycle";

import "./App.css";

function App() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const imgState = useAsyncIterator(
    async function* imgStates(signal) {
      let baseTransform = new DOMMatrix();

      while (!signal.aborted) {
        baseTransform = yield* navCycle(baseTransform, inputEvents(container));
      }
    },
    [container],
  );

  return (
    <div id="container" ref={setContainer} tabIndex={0}>
      <img
        className={imgState?.animate ? "animate" : ""}
        style={{ transform: imgState?.transform.toString() }}
      />
    </div>
  );
}

export default App;
