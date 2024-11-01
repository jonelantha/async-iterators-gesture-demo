import { useState } from "react";
import { useAsyncIterator } from "./util/useAsyncIterator";
import { inputEvents } from "./inputEvents";
import { navCycle } from "./navCycle";

import "./App.css";

function App() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const transform = useAsyncIterator(
    async function* transforms(signal) {
      yield* navCycle(inputEvents(container));
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
