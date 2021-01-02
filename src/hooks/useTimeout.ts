import { useEffect, useCallback, useRef } from 'react';

export interface TimeoutHook {
  cancelTimer: () => void;
  startTimer: (timeout: number) => void
}

// From https://medium.com/javascript-in-plain-english/usetimeout-react-hook-3cc58b94af1f
export function useTimeout(callback: () => void): TimeoutHook {
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const cancelTimer = useCallback(
    () => {
      const timeoutId = timeoutIdRef.current;
      if (timeoutId) {
        timeoutIdRef.current = undefined;
        clearTimeout(timeoutId);
      }
    },
    [timeoutIdRef],
  );

  const startTimer = useCallback(
    (timeout: number) => {
      timeoutIdRef.current = setTimeout(callback, timeout);
    },
    [timeoutIdRef],
  );


  return {
    cancelTimer,
    startTimer
  };
}