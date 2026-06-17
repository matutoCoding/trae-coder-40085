import { useEffect, useRef } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';

export const useOverdueTimer = () => {
  const updateOverdueStatus = useApplicationStore(state => state.updateOverdueStatus);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    updateOverdueStatus();

    timerRef.current = window.setInterval(() => {
      updateOverdueStatus();
    }, 60000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [updateOverdueStatus]);

  return null;
};
