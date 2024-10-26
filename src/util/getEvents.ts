export async function* getEvents<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null,
  eventTypes: K[],
) {
  if (!element) return;

  const eventsQueue = createAsyncQueue<HTMLElementEventMap[K]>();

  for (const type of eventTypes) {
    element.addEventListener(type, eventsQueue.add);
  }

  try {
    yield* eventsQueue.iterator();
  } finally {
    for (const type of eventTypes) {
      element.removeEventListener(type, eventsQueue.add);
    }
  }
}

function createAsyncQueue<T>() {
  const items: T[] = [];

  let hasNewItem = Promise.withResolvers<void>();

  return {
    async *iterator() {
      while (true) {
        yield* items;
        items.length = 0;

        await hasNewItem.promise;
      }
    },

    add(item: T) {
      items.push(item);

      hasNewItem.resolve();
      hasNewItem = Promise.withResolvers();
    },
  };
}
