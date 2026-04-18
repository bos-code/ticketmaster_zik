import { useCallback, useEffect, useState } from 'react';

export function useResendCountdown(initialSeconds = 30) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const restart = useCallback(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  return {
    canResend: secondsRemaining === 0,
    restart,
    secondsRemaining,
  };
}
