/**
 * Badge Engine Unit Tests
 * Tests getCelebrationForBadge (pure function — no DB needed)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getCelebrationForBadge } from '../lib/badgeDefinitions.js';

describe('getCelebrationForBadge', () => {
  it('should return milestone type for streak_100+', () => {
    const result = getCelebrationForBadge('streak_100');
    assert.equal(result.type, 'milestone');
    assert.equal(result.pieces, 200);
  });

  it('should return milestone type for streak_365', () => {
    const result = getCelebrationForBadge('streak_365');
    assert.equal(result.type, 'milestone');
    assert.equal(result.pieces, 200);
  });

  it('should return milestone type for streak_30-99', () => {
    const result = getCelebrationForBadge('streak_30');
    assert.equal(result.type, 'milestone');
    assert.equal(result.pieces, 150);
  });

  it('should return milestone type for streak_60', () => {
    const result = getCelebrationForBadge('streak_60');
    assert.equal(result.type, 'milestone');
    assert.equal(result.pieces, 150);
  });

  it('should return streak type for small streaks', () => {
    const result = getCelebrationForBadge('streak_3');
    assert.equal(result.type, 'streak');
    assert.equal(result.pieces, 100);
  });

  it('should return streak type for streak_7', () => {
    const result = getCelebrationForBadge('streak_7');
    assert.equal(result.type, 'streak');
    assert.equal(result.pieces, 100);
  });

  it('should return streak type for streak_14', () => {
    const result = getCelebrationForBadge('streak_14');
    assert.equal(result.type, 'streak');
    assert.equal(result.pieces, 100);
  });

  it('should return achievement type for perfect_day', () => {
    const result = getCelebrationForBadge('perfect_day');
    assert.equal(result.type, 'achievement');
    assert.equal(result.pieces, 120);
  });

  it('should return achievement type for perfect_week', () => {
    const result = getCelebrationForBadge('perfect_week');
    assert.equal(result.type, 'achievement');
    assert.equal(result.pieces, 120);
  });

  it('should return goal type for goal badges', () => {
    const result = getCelebrationForBadge('first_goal');
    assert.equal(result.type, 'goal');
    assert.equal(result.pieces, 100);
  });

  it('should return goal type for goal_complete', () => {
    const result = getCelebrationForBadge('goal_complete');
    assert.equal(result.type, 'goal');
    assert.equal(result.pieces, 100);
  });

  it('should return goal type for five_goals', () => {
    const result = getCelebrationForBadge('five_goals');
    assert.equal(result.type, 'goal');
    assert.equal(result.pieces, 100);
  });

  it('should return default achievement for other badges', () => {
    const result = getCelebrationForBadge('first_checkin');
    assert.equal(result.type, 'achievement');
    assert.equal(result.pieces, 80);
  });

  it('should return default achievement for comeback_kid', () => {
    const result = getCelebrationForBadge('comeback_kid');
    assert.equal(result.type, 'achievement');
    assert.equal(result.pieces, 80);
  });

  it('should return default achievement for explorer', () => {
    const result = getCelebrationForBadge('explorer');
    assert.equal(result.type, 'achievement');
    assert.equal(result.pieces, 80);
  });

  it('should return default achievement for unknown badge', () => {
    const result = getCelebrationForBadge('unknown_badge');
    assert.equal(result.type, 'achievement');
    assert.equal(result.pieces, 80);
  });

  it('should always return an object with type and pieces', () => {
    const testBadges = [
      'streak_3', 'streak_100', 'perfect_day', 'first_goal',
      'first_checkin', 'first_routine', 'early_bird', 'night_owl',
    ];
    for (const badgeId of testBadges) {
      const result = getCelebrationForBadge(badgeId);
      assert.ok(result.type, `${badgeId} result missing type`);
      assert.ok(typeof result.pieces === 'number', `${badgeId} result.pieces is not a number`);
      assert.ok(result.pieces > 0, `${badgeId} result.pieces should be positive`);
    }
  });
});
