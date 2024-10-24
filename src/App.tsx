import { useState } from "react";
import { useAsyncIterator } from "./util/useAsyncIterator";
import { getEvents } from "./util/getEvents";

import "./App.css";

function App() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const transform = useAsyncIterator(
    async function* transforms(signal) {
      const events = getEvents(container, ["pointermove"]);

      for await (const event of events) {
        yield new DOMMatrix().translate(event.x, event.y);
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
