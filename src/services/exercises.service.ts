import { supabase } from '../lib/supabase';
import type { Badge, HistoryItem } from '../types';

// --- Mock Data ---

const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'Velocista', description: '10 seg/questão', icon_name: 'Zap', unlocked: true, color: 'text-tertiary' },
  { id: '2', name: 'Insuperável', description: 'Bloqueado', icon_name: 'Trophy', unlocked: false, color: 'text-outline' },
  { id: '3', name: 'Perfeccionista', description: '100 acertos', icon_name: 'Star', unlocked: true, color: 'text-primary' },
  { id: '4', name: 'Bibliotecário', description: 'Teoria Lida', icon_name: 'BookMarked', unlocked: true, color: 'text-secondary' },
];

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', date: 'Hoje, 14:20', title: 'MMC de 3 e 4 números', xp: 150, accuracy: 100, color: 'bg-tertiary' },
  { id: '2', date: 'Ontem, 18:45', title: 'Potenciação: Expoentes Negativos', xp: 220, accuracy: 85, color: 'bg-primary' },
  { id: '3', date: '24 Out, 10:15', title: 'Raiz Quadrada de Quadrados Perfeitos', xp: 80, accuracy: 60, color: 'bg-outline' },
  { id: '4', date: '23 Out, 21:00', title: 'Simulado Geral: Nível 4', xp: 450, accuracy: 92, color: 'bg-tertiary' },
];

// --- Helper ---

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Ontem, ${time}`;
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${time}`;
}

function getColorByAccuracy(accuracy: number): string {
  if (accuracy >= 90) return 'bg-tertiary';
  if (accuracy >= 70) return 'bg-primary';
  return 'bg-outline';
}

// --- Exercises Service ---

export const exercisesService = {
  /**
   * Get user badges with unlock status
   */
  async getBadges(userId: string): Promise<Badge[]> {
    if (!supabase) return MOCK_BADGES;

    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });

    if (badgesError || !allBadges) return MOCK_BADGES;

    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const unlockedIds = new Set((userBadges ?? []).map(ub => ub.badge_id));

    return allBadges.map(b => ({
      id: b.id,
      name: b.name,
      description: unlockedIds.has(b.id) ? b.description : 'Bloqueado',
      icon_name: b.icon_name,
      unlocked: unlockedIds.has(b.id),
      color: b.color,
    }));
  },

  /**
   * Get exercise history
   */
  async getHistory(userId: string, limit = 10): Promise<HistoryItem[]> {
    if (!supabase) return MOCK_HISTORY;

    const { data, error } = await supabase
      .from('exercise_history')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error || !data) return MOCK_HISTORY;
    if (data.length === 0) return [];

    return data.map(item => ({
      id: item.id,
      date: formatDate(item.completed_at),
      title: item.title,
      xp: item.xp_earned,
      accuracy: Number(item.accuracy),
      color: getColorByAccuracy(Number(item.accuracy)),
    }));
  },

  /**
   * Save exercise result
   */
  async saveResult(
    userId: string,
    title: string,
    category: string,
    xpEarned: number,
    accuracy: number,
    timeSpentSeconds: number
  ): Promise<void> {
    if (!supabase) return;

    await supabase.from('exercise_history').insert({
      user_id: userId,
      title,
      category,
      xp_earned: xpEarned,
      accuracy,
      time_spent_seconds: timeSpentSeconds,
    });

    // Also update daily activity
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .single();

    if (existing) {
      await supabase
        .from('daily_activity')
        .update({
          xp_earned: existing.xp_earned + xpEarned,
          exercises_completed: existing.exercises_completed + 1,
          practice_minutes: existing.practice_minutes + Math.ceil(timeSpentSeconds / 60),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('daily_activity').insert({
        user_id: userId,
        activity_date: today,
        xp_earned: xpEarned,
        exercises_completed: 1,
        practice_minutes: Math.ceil(timeSpentSeconds / 60),
      });
    }
  },

  /**
   * Unlock a badge for a user
   */
  async unlockBadge(userId: string, badgeId: string): Promise<void> {
    if (!supabase) return;

    await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badgeId,
    });
  },
};
