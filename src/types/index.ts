// =============================================
// Kinetic Math - Shared Types
// =============================================

// --- Database Types (mirror Supabase schema) ---

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  title: string;
  global_ranking: number;
  streak_days: number;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  exercises_completed: number;
  total_practice_hours: number;
  accuracy_rate: number;
  created_at: string;
  updated_at: string;
}

export interface BadgeRecord {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  required_condition: string | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface ExerciseHistory {
  id: string;
  user_id: string;
  title: string;
  category: string;
  xp_earned: number;
  accuracy: number;
  time_spent_seconds: number;
  completed_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  xp_earned: number;
  exercises_completed: number;
  practice_minutes: number;
}

// --- UI Types (used by components) ---

export type Page = 'home' | 'mmc-mdc' | 'power-root' | 'exercises' | 'profile';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  unlocked: boolean;
  color: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  title: string;
  xp: number;
  accuracy: number;
  color: string;
}

export interface WeeklyActivity {
  day: string;
  percentage: number;
  isHighlight: boolean;
}

// --- Auth Types ---

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}
