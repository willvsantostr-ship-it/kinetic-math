import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profile.service';
import { exercisesService } from '../services/exercises.service';
import type { Profile, UserProgress, Badge, WeeklyActivity } from '../types';

/**
 * Hook for managing user profile, progress, and badges.
 */
export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      profileService.getProfile(userId),
      profileService.getProgress(userId),
      exercisesService.getBadges(userId),
      profileService.getWeeklyActivity(userId),
    ]).then(([p, prog, b, w]) => {
      setProfile(p);
      setProgress(prog);
      setBadges(b);
      setWeeklyActivity(w);
      setLoading(false);
    });
  }, [userId]);

  const addXP = useCallback(async (amount: number) => {
    if (!userId) return;
    const updated = await profileService.addXP(userId, amount);
    setProgress(updated);
  }, [userId]);

  return {
    profile,
    progress,
    badges,
    weeklyActivity,
    loading,
    addXP,
  };
}
