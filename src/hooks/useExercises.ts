import { useState, useEffect, useCallback } from 'react';
import { exercisesService } from '../services/exercises.service';
import type { HistoryItem } from '../types';

/**
 * Hook for managing exercise history.
 */
export function useExercises(userId: string | null) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    exercisesService.getHistory(userId).then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, [userId]);

  const saveResult = useCallback(async (
    title: string,
    category: string,
    xpEarned: number,
    accuracy: number,
    timeSpentSeconds: number
  ) => {
    if (!userId) return;
    await exercisesService.saveResult(userId, title, category, xpEarned, accuracy, timeSpentSeconds);
    // Refresh history
    const updated = await exercisesService.getHistory(userId);
    setHistory(updated);
  }, [userId]);

  return {
    history,
    loading,
    saveResult,
  };
}
