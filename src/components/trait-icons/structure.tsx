import type { ReactNode } from 'react';
import { Head as H } from './_head';

/**
 * Line-art for the HEAD & FACE STRUCTURE traits (0 0 48 48, currentColor).
 * Width / height / proportion traits use a front head outline; forehead slope,
 * bossing, brow ridge and glabella use a profile forehead fragment.
 */

export const structureIcons: Record<string, Record<string, ReactNode>> = {
  cranialShape: {
    dolichocephalic: H({ TW: 13, CW: 14, JW: 12, K: 44 }),
    mesocephalic: H({ TW: 15, CW: 16, JW: 13, K: 42 }),
    brachycephalic: H({ TW: 17, CW: 18, JW: 15, K: 40 }),
    hyperbrachycephalic: H({ TW: 18.5, CW: 19, JW: 16, K: 39 }),
  },

  headSize: {
    small: H({ TW: 12, CW: 13, JW: 11, T: 12, K: 38 }),
    average: H({ TW: 15, CW: 16, JW: 13, T: 9, K: 42 }),
    large: H({ TW: 17.5, CW: 18.5, JW: 15.5, T: 6, K: 45 }),
  },

  skullHeight: {
    low: H({ T: 13 }),
    medium: H({ T: 9 }),
    tall: H({ T: 5 }),
  },

  temporalWidth: {
    narrow: H({ TW: 11.5 }),
    average: H({ TW: 15 }),
    wide: H({ TW: 18.5 }),
  },

  facialProportion: {
    euryprosopic: H({ CW: 18.5, JW: 16, K: 40, chin: 'broad' }),
    mesoprosopic: H({ CW: 16, JW: 13, K: 42 }),
    leptoprosopic: H({ CW: 13.5, JW: 11.5, K: 45, chin: 'pointed' }),
  },

  foreheadHeight: {
    low: (
      <>
        {H({ T: 15 })}
        <path d="M14 20 Q24 18 34 20" opacity="0.6" />
      </>
    ),
    medium: (
      <>
        {H({ T: 10 })}
        <path d="M14 20 Q24 18 34 20" opacity="0.6" />
      </>
    ),
    tall: (
      <>
        {H({ T: 5 })}
        <path d="M14 20 Q24 18 34 20" opacity="0.6" />
      </>
    ),
  },

  foreheadBreadth: {
    narrow: H({ TW: 11.5, CW: 15 }),
    medium: H({ TW: 15, CW: 16 }),
    broad: H({ TW: 18.5, CW: 18 }),
  },

  dominantThird: {
    upper: (
      <>
        {H({})}
        <path d="M10 20 L38 20" opacity="0.4" />
        <path d="M10 30 L38 30" opacity="0.4" />
        <path d="M6 9 L6 20" strokeWidth={3} />
      </>
    ),
    middle: (
      <>
        {H({})}
        <path d="M10 20 L38 20" opacity="0.4" />
        <path d="M10 30 L38 30" opacity="0.4" />
        <path d="M6 20 L6 30" strokeWidth={3} />
      </>
    ),
    lower: (
      <>
        {H({})}
        <path d="M10 20 L38 20" opacity="0.4" />
        <path d="M10 30 L38 30" opacity="0.4" />
        <path d="M6 30 L6 41" strokeWidth={3} />
      </>
    ),
    balanced: (
      <>
        {H({})}
        <path d="M10 20 L38 20" opacity="0.4" />
        <path d="M10 30 L38 30" opacity="0.4" />
      </>
    ),
  },

  // ── Profile forehead fragments (face looks left) ──
  foreheadSlope: {
    vertical: <path d="M26 8 L26 21 Q26 23 24 23" />,
    slight: <path d="M28 8 L25 21 Q25 23 23 23" />,
    sloping: <path d="M31 8 L24 21 Q24 23 22 23" />,
  },

  frontalBossing: {
    flat: <path d="M26 8 L25 21" />,
    slight: <path d="M26 8 Q23 14 25 21" />,
    rounded: <path d="M27 8 Q20 14 25 21" />,
  },

  browRidge: {
    flat: (
      <>
        <path d="M26 8 L25 19 Q25 21 23 21" />
        <path d="M16 23 Q20 21 24 23" opacity="0.6" />
      </>
    ),
    moderate: (
      <>
        <path d="M26 8 L25 19 Q22 22 24 22" />
        <path d="M15 24 Q19 22 24 24" opacity="0.6" />
      </>
    ),
    heavy: (
      <>
        <path d="M26 8 L25 18 Q18 23 24 23" />
        <path d="M14 25 Q18 23 24 25" opacity="0.6" />
      </>
    ),
  },

  glabella: {
    flat: <path d="M25 11 L24 21" />,
    prominent: <path d="M25 11 Q21 16 24 21" />,
  },
};
