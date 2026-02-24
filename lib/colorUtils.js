// Color utilities: map named tokens to hex, normalize input
const PALETTE = {
  blue: '#0ea5e9',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  neo: '#0ea5e9',
  calm: '#64748b',
  rose: '#ec4899',
  sand: '#eab308',
  forest: '#22c55e',
  ocean: '#0ea5e9',
  lavender: '#a855f7',
};

const HEX_REGEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function toHex(color) {
  if (!color) return PALETTE.neo;
  const c = String(color).trim();
  if (HEX_REGEX.test(c)) return c;
  const key = c.toLowerCase();
  return PALETTE[key] || c;
}

const colorUtils = { toHex, PALETTE };

export default colorUtils;
