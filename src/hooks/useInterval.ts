import { useCallback, useEffect, useRef } from 'react';

export interface IntervalHook {
  cancelInterval: () => void;
  startInterval: (timeout: number) => void
}

export function useInterval(callback: () => void): IntervalHook {
  const intervalIdRef = useRef<NodeJS.Timeout>();

  const cancelInterval = useCallback(
    () => {
      const timeoutId = intervalIdRef.current;
      if (timeoutId) {
        intervalIdRef.current = undefined;
        clearInterval(timeoutId);
      }
    },
    [intervalIdRef],
  );

  const startInterval = useCallback(
    (timeout: number) => {
      intervalIdRef.current = setInterval(callback, timeout);
    },
    [intervalIdRef],
  );


  return {
    cancelInterval,
    startInterval
  };
}

export default function(callback: () => void, delay: null | number, leading = true) {
  const savedCallback = useRef<() => void>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      const current = savedCallback.current
      current && current()
    }

    if (delay !== null) {
      if (leading) tick()
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return undefined
  }, [delay, leading])
}