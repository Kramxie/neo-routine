/**
 * Color Utilities Tests
 * Tests toHex color resolver and PALETTE
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import colorUtils, { toHex, PALETTE } from '../lib/colorUtils.js';

describe('PALETTE', () => {
  it('should have at least 10 named colors', () => {
    const keys = Object.keys(PALETTE);
    assert.ok(keys.length >= 10, `Expected at least 10 palette colors, got ${keys.length}`);
  });

  it('all palette values should be valid hex colors', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    for (const [name, hex] of Object.entries(PALETTE)) {
      assert.ok(hexRegex.test(hex), `${name}: "${hex}" is not valid hex`);
    }
  });
});

describe('toHex', () => {
  it('should return neo color for null', () => {
    assert.equal(toHex(null), PALETTE.neo);
  });

  it('should return neo color for undefined', () => {
    assert.equal(toHex(undefined), PALETTE.neo);
  });

  it('should return neo color for empty string', () => {
    assert.equal(toHex(''), PALETTE.neo);
  });

  it('should return hex value as-is for valid 6-digit hex', () => {
    assert.equal(toHex('#ff0000'), '#ff0000');
  });

  it('should return hex value as-is for valid 3-digit hex', () => {
    assert.equal(toHex('#f00'), '#f00');
  });

  it('should resolve named palette color (blue)', () => {
    assert.equal(toHex('blue'), PALETTE.blue);
  });

  it('should resolve named palette color case-insensitively', () => {
    assert.equal(toHex('Blue'), PALETTE.blue);
    assert.equal(toHex('PURPLE'), PALETTE.purple);
  });

  it('should trim whitespace', () => {
    assert.equal(toHex('  green  '), PALETTE.green);
  });

  it('should return input as-is for unknown non-hex string', () => {
    assert.equal(toHex('rgb(255,0,0)'), 'rgb(255,0,0)');
  });

  it('should resolve all palette names', () => {
    for (const [name, hex] of Object.entries(PALETTE)) {
      assert.equal(toHex(name), hex, `toHex("${name}") should return "${hex}"`);
    }
  });
});

describe('colorUtils default export', () => {
  it('should expose toHex function', () => {
    assert.equal(typeof colorUtils.toHex, 'function');
  });

  it('should expose PALETTE object', () => {
    assert.ok(colorUtils.PALETTE);
    assert.equal(typeof colorUtils.PALETTE, 'object');
  });
});
