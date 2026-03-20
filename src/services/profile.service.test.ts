import { test, describe } from 'node:test';
import assert from 'node:assert';
import { profileService, MOCK_PROGRESS } from './profile.service.ts';

/**
 * These tests cover the profileService.addXP function when Supabase is not configured.
 * In this environment, the Supabase client is naturally null as environment variables
 * are not provided to the test runner.
 */
describe('profileService.addXP (without Supabase)', () => {
  test('should add XP and calculate level correctly', async () => {
    const userId = MOCK_PROGRESS.user_id;
    const amount = 100;

    // When supabase is null (default in test environment without env vars)
    const result = await profileService.addXP(userId, amount);

    const expectedXP = MOCK_PROGRESS.total_xp + amount;
    const expectedLevel = Math.floor(expectedXP / 1000) + 1;

    assert.strictEqual(result.total_xp, expectedXP, 'XP should be added to the total');
    assert.strictEqual(result.current_level, expectedLevel, 'Level should be recalculated based on new XP');
    assert.strictEqual(result.user_id, userId, 'User ID should remain the same');
  });

  test('should handle zero XP addition', async () => {
    const userId = MOCK_PROGRESS.user_id;
    const amount = 0;

    const result = await profileService.addXP(userId, amount);

    assert.strictEqual(result.total_xp, MOCK_PROGRESS.total_xp, 'XP should not change when 0 is added');
    assert.strictEqual(result.current_level, MOCK_PROGRESS.current_level, 'Level should not change when 0 XP is added');
  });

  test('should correctly level up when XP crosses 1000 boundary', async () => {
    const userId = MOCK_PROGRESS.user_id;
    // Current MOCK_PROGRESS.total_xp is 12450 (Level 13)
    // Adding 550 will make it 13000 (Level 14)
    const amount = 550;

    const result = await profileService.addXP(userId, amount);

    assert.strictEqual(result.total_xp, 13000, 'Total XP should be 13000');
    assert.strictEqual(result.current_level, 14, 'Level should increase to 14');
  });

  test('should return a new object with updated values and maintain existing properties', async () => {
    const userId = MOCK_PROGRESS.user_id;
    const amount = 100;

    const result = await profileService.addXP(userId, amount);

    // Check that other properties are still present
    assert.strictEqual(result.id, MOCK_PROGRESS.id);
    assert.strictEqual(result.exercises_completed, MOCK_PROGRESS.exercises_completed);
    assert.strictEqual(result.accuracy_rate, MOCK_PROGRESS.accuracy_rate);

    // Ensure it's not the same object reference (immutability)
    assert.notStrictEqual(result, MOCK_PROGRESS);
  });
});
