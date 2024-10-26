import { DependencyList, useEffect, useState } from "react";

export function useAsyncIterator<T>(
  iterator: (signal: AbortSignal) => AsyncIterable<T>,
  dependencyList: DependencyList,
) {
  const [state, setState] = useState<T>();

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      for await (const item of iterator(abortController.signal)) {
        if (abortController.signal.aborted) break;

        setState(item);
      }
    })();

    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList);

  return state;
}
