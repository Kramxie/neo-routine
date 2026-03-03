/**
 * Badge Definitions Unit Tests
 * Tests badge data structure completeness and consistency
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BADGE_DEFINITIONS, RARITY_COLORS } from '../lib/badgeDefinitions.js';

describe('Badge Definitions', () => {
  const badges = Object.entries(BADGE_DEFINITIONS);
  const validCategories = ['starter', 'streak', 'achievement', 'goals', 'routines', 'volume', 'special'];
  const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  it('should have at least 20 badges defined', () => {
    assert.ok(badges.length >= 20, `Expected at least 20 badges, got ${badges.length}`);
  });

  it('every badge should have required fields (name, description, icon, category, rarity)', () => {
    for (const [id, badge] of badges) {
      assert.ok(badge.name, `Badge "${id}" missing name`);
      assert.ok(badge.description, `Badge "${id}" missing description`);
      assert.ok(badge.icon, `Badge "${id}" missing icon`);
      assert.ok(badge.category, `Badge "${id}" missing category`);
      assert.ok(badge.rarity, `Badge "${id}" missing rarity`);
    }
  });

  it('every badge category should be valid', () => {
    for (const [id, badge] of badges) {
      assert.ok(
        validCategories.includes(badge.category),
        `Badge "${id}" has invalid category "${badge.category}". Valid: ${validCategories.join(', ')}`
      );
    }
  });

  it('every badge rarity should be valid', () => {
    for (const [id, badge] of badges) {
      assert.ok(
        validRarities.includes(badge.rarity),
        `Badge "${id}" has invalid rarity "${badge.rarity}". Valid: ${validRarities.join(', ')}`
      );
    }
  });

  it('badge names should be unique', () => {
    const names = badges.map(([, b]) => b.name);
    const uniqueNames = new Set(names);
    assert.equal(names.length, uniqueNames.size, 'Duplicate badge names found');
  });

  it('should include all streak milestone badges', () => {
    const streakMilestones = [3, 7, 14, 30, 60, 100, 365];
    for (const milestone of streakMilestones) {
      assert.ok(
        BADGE_DEFINITIONS[`streak_${milestone}`],
        `Missing streak_${milestone} badge definition`
      );
    }
  });

  it('should include first_checkin badge', () => {
    assert.ok(BADGE_DEFINITIONS.first_checkin);
    assert.equal(BADGE_DEFINITIONS.first_checkin.category, 'starter');
  });

  it('should include goal badges', () => {
    assert.ok(BADGE_DEFINITIONS.first_goal);
    assert.ok(BADGE_DEFINITIONS.goal_complete);
    assert.ok(BADGE_DEFINITIONS.five_goals);
  });

  it('should include routine badges', () => {
    assert.ok(BADGE_DEFINITIONS.first_routine);
    assert.ok(BADGE_DEFINITIONS.five_routines);
  });

  it('should include volume badges', () => {
    assert.ok(BADGE_DEFINITIONS.checkins_50);
    assert.ok(BADGE_DEFINITIONS.checkins_100);
    assert.ok(BADGE_DEFINITIONS.checkins_500);
    assert.ok(BADGE_DEFINITIONS.checkins_1000);
  });

  it('should include time-based badges', () => {
    assert.ok(BADGE_DEFINITIONS.early_bird);
    assert.ok(BADGE_DEFINITIONS.night_owl);
  });

  it('should include special badges', () => {
    assert.ok(BADGE_DEFINITIONS.comeback_kid);
    assert.ok(BADGE_DEFINITIONS.explorer);
  });

  it('streak badges should have increasing rarity', () => {
    const streakRarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    const streaks = [3, 7, 14, 30, 60, 100, 365];
    
    for (let i = 1; i < streaks.length; i++) {
      const prevRarity = BADGE_DEFINITIONS[`streak_${streaks[i - 1]}`].rarity;
      const currRarity = BADGE_DEFINITIONS[`streak_${streaks[i]}`].rarity;
      assert.ok(
        streakRarityOrder[currRarity] >= streakRarityOrder[prevRarity],
        `streak_${streaks[i]} (${currRarity}) should not be less rare than streak_${streaks[i - 1]} (${prevRarity})`
      );
    }
  });
});

describe('Rarity Colors', () => {
  const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  it('should have color definitions for all rarity levels', () => {
    for (const rarity of validRarities) {
      assert.ok(RARITY_COLORS[rarity], `Missing color for rarity "${rarity}"`);
    }
  });

  it('every rarity color should have bg, border, and text properties', () => {
    for (const [rarity, colors] of Object.entries(RARITY_COLORS)) {
      assert.ok(colors.bg, `Rarity "${rarity}" missing bg color`);
      assert.ok(colors.border, `Rarity "${rarity}" missing border color`);
      assert.ok(colors.text, `Rarity "${rarity}" missing text color`);
    }
  });

  it('all color values should be valid hex colors', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    for (const [rarity, colors] of Object.entries(RARITY_COLORS)) {
      assert.ok(hexRegex.test(colors.bg), `Rarity "${rarity}" bg "${colors.bg}" is not valid hex`);
      assert.ok(hexRegex.test(colors.border), `Rarity "${rarity}" border "${colors.border}" is not valid hex`);
      assert.ok(hexRegex.test(colors.text), `Rarity "${rarity}" text "${colors.text}" is not valid hex`);
    }
  });
});
