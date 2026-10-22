import type { ReactNode } from 'react';

/**
 * Color swatches for the COLOR traits. Unlike the line-art families these fill
 * with the actual colour (not currentColor); a faint currentColor outline keeps
 * the edge visible on a matching background. Hair / brow / facial-hair share the
 * hair palette; iris is a filled eye; teeth a filled incisor.
 */

const HAIR_HEX: Record<string, string> = {
  black: '#1b1b1d',
  'dark-brown': '#3a2a1d',
  brown: '#5a3c25',
  'light-brown': '#8a5c38',
  blonde: '#d9b36b',
  red: '#a4441f',
  auburn: '#7c3a22',
  grey: '#9a9a9a',
  white: '#e9e9e9',
};

const IRIS_HEX: Record<string, string> = {
  'dark-brown': '#3a2415',
  brown: '#6b4423',
  amber: '#b5751c',
  hazel: '#8d7a3e',
  green: '#577b49',
  grey: '#8a99a0',
  blue: '#5a82a8',
};

const SKIN_HEX: Record<string, string> = {
  'very-fair': '#f6e0d1',
  fair: '#f0d2bb',
  light: '#e8c3a3',
  medium: '#d1a073',
  tan: '#b57e4d',
  brown: '#8b5a33',
  'dark-brown': '#5d3920',
  deep: '#3c2415',
};

const UNDERTONE_HEX: Record<string, string> = {
  cool: '#e9c5c1',
  neutral: '#e3c3a3',
  warm: '#e8bd84',
  olive: '#c8b588',
};

const TEETH_HEX: Record<string, string> = {
  bright: '#fdfdf6',
  natural: '#f2e9d4',
  yellowed: '#e5d19e',
};

const swatch = (hex: string): ReactNode => (
  <rect
    x="8"
    y="8"
    width="32"
    height="32"
    rx="7"
    fill={hex}
    stroke="currentColor"
    strokeOpacity="0.25"
    strokeWidth="1.5"
  />
);

// Base + light flecks, for salt-and-pepper (hair) and greying.
const speckled = (base: string): ReactNode => (
  <>
    {swatch(base)}
    {[
      [15, 16],
      [22, 13],
      [31, 18],
      [18, 26],
      [29, 29],
      [24, 22],
      [34, 25],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="1.5" fill="#e4e4e4" stroke="none" />
    ))}
  </>
);

const iris = (hex: string): ReactNode => (
  <>
    <circle cx="24" cy="24" r="13" fill={hex} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="4.5" fill="#111113" stroke="none" />
    <circle cx="20.5" cy="20.5" r="2" fill="#ffffff" opacity="0.75" stroke="none" />
  </>
);

const tooth = (hex: string): ReactNode => (
  <rect x="16" y="11" width="16" height="26" rx="6" fill={hex} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.3" />
);

const hairSwatches = (): Record<string, ReactNode> => {
  const out: Record<string, ReactNode> = {};
  for (const [k, hex] of Object.entries(HAIR_HEX)) out[k] = swatch(hex);
  out['salt-and-pepper'] = speckled('#3a3330');
  return out;
};

export const colorIcons: Record<string, Record<string, ReactNode>> = {
  hairColor: hairSwatches(),
  browColor: hairSwatches(),
  facialHairColor: hairSwatches(),
  irisColor: Object.fromEntries(Object.entries(IRIS_HEX).map(([k, h]) => [k, iris(h)])),
  skinTone: Object.fromEntries(Object.entries(SKIN_HEX).map(([k, h]) => [k, swatch(h)])),
  skinUndertone: Object.fromEntries(Object.entries(UNDERTONE_HEX).map(([k, h]) => [k, swatch(h)])),
  teethColor: Object.fromEntries(Object.entries(TEETH_HEX).map(([k, h]) => [k, tooth(h)])),
};
