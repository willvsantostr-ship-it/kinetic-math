import { supabase } from '../lib/supabase';
import type { Profile, UserProgress, WeeklyActivity } from '../types';

// --- Mock Data ---

const MOCK_PROFILE: Profile = {
  id: 'mock-user-001',
  display_name: 'Arthur Pentágono',
  avatar_url: 'https://picsum.photos/seed/avatar/200/200',
  location: 'São Paulo, BR',
  title: 'Mestre das Equações',
  global_ranking: 1240,
  streak_days: 14,
  is_pro: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_PROGRESS: UserProgress = {
  id: 'mock-progress-001',
  user_id: 'mock-user-001',
  total_xp: 12450,
  current_level: 13,
  exercises_completed: 1200,
  total_practice_hours: 15,
  accuracy_rate: 98,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_WEEKLY: WeeklyActivity[] = [
  { day: 'SEG', percentage: 40, isHighlight: false },
  { day: 'TER', percentage: 65, isHighlight: false },
  { day: 'QUA', percentage: 90, isHighlight: true },
  { day: 'QUI', percentage: 30, isHighlight: false },
  { day: 'SEX', percentage: 55, isHighlight: false },
  { day: 'SAB', percentage: 20, isHighlight: false },
  { day: 'DOM', percentage: 10, isHighlight: false },
];

// --- Profile Service ---

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<Profile> {
    if (!supabase) return MOCK_PROFILE;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return MOCK_PROFILE;
    return data as Profile;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (!supabase) return { ...MOCK_PROFILE, ...updates };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) return MOCK_PROFILE;
    return data as Profile;
  },

  /**
   * Get user progress (XP, level, etc.)
   */
  async getProgress(userId: string): Promise<UserProgress> {
    if (!supabase) return MOCK_PROGRESS;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return MOCK_PROGRESS;
    return data as UserProgress;
  },

  /**
   * Add XP to user and update level
   */
  async addXP(userId: string, amount: number): Promise<UserProgress> {
    if (!supabase) {
      const newXP = MOCK_PROGRESS.total_xp + amount;
      return {
        ...MOCK_PROGRESS,
        total_xp: newXP,
        current_level: Math.floor(newXP / 1000) + 1,
      };
    }

    // First get current progress
    const { data: current } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!current) return MOCK_PROGRESS;

    const newXP = (current.total_xp || 0) + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;

    const { data, error } = await supabase
      .from('user_progress')
      .update({
        total_xp: newXP,
        current_level: newLevel,
        exercises_completed: (current.exercises_completed || 0) + 1,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) return MOCK_PROGRESS;
    return data as UserProgress;
  },

  /**
   * Get weekly activity data
   */
  async getWeeklyActivity(userId: string): Promise<WeeklyActivity[]> {
    if (!supabase) return MOCK_WEEKLY;

    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const { data, error } = await supabase
      .from('daily_activity')
      .select('activity_date, xp_earned')
      .eq('user_id', userId)
      .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: true });

    if (error || !data) return MOCK_WEEKLY;
    if (data.length === 0) {
      return ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map(day => ({
        day, percentage: 0, isHighlight: false,
      }));
    }

    const maxXP = Math.max(...data.map(d => d.xp_earned), 1);

    return data.map(d => {
      const date = new Date(d.activity_date + 'T12:00:00');
      const pct = Math.round((d.xp_earned / maxXP) * 100);
      return {
        day: dayNames[date.getDay()],
        percentage: pct,
        isHighlight: pct >= 80,
      };
    });
  },
};
