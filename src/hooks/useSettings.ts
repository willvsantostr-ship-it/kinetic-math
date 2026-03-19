import { useState, useEffect } from 'react';

export function useSettings() {
  const [exerciseTimer, setExerciseTimerState] = useState<number>(() => {
    const saved = localStorage.getItem('km_exerciseTimer');
    return saved ? parseInt(saved, 10) : 60;
  });

  const setExerciseTimer = (val: number) => {
    setExerciseTimerState(val);
    localStorage.setItem('km_exerciseTimer', String(val));
  };

  return { exerciseTimer, setExerciseTimer };
}
