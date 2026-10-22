import type { ReactNode } from 'react';
import { Head, ghostHead } from './_head';

/**
 * Line-art for JAW, CHIN & NECK traits (0 0 48 48, currentColor). Width / shape /
 * definition use a front head outline or jaw-contour fragment; projection, profile,
 * submental fullness and Adam's apple use a side profile fragment.
 */
export const jawIcons: Record<string, Record<string, ReactNode>> = {
  jawWidth: {
    narrow: Head({ JW: 10.5, chin: 'pointed' }),
    medium: Head({ JW: 13 }),
    wide: Head({ JW: 16, chin: 'square' }),
  },

  jawAngle: {
    soft: <path d="M12 23 Q12 37 24 41 Q36 37 36 23" />,
    moderate: <path d="M12 23 L13 34 Q18 40 24 41 Q30 40 35 34 L36 23" />,
    sharp: <path d="M12 23 L13 35 L24 41 L35 35 L36 23" />,
  },

  jawLength: {
    short: Head({ K: 38 }),
    medium: Head({ K: 42 }),
    long: Head({ K: 46 }),
  },

  jawDefinition: {
    soft: Head({ chin: 'round' }),
    defined: (
      <>
        {Head({ JW: 14 })}
        <path d="M13 27 Q24 42 35 27" />
      </>
    ),
  },

  submentalFullness: {
    clean: <path d="M24 28 Q27 34 25 37 L33 38" />,
    slight: <path d="M24 28 Q27 34 24 38 Q29 39 33 38" />,
    'double-chin': <path d="M24 28 Q27 34 24 38 Q21 41 26 41 Q31 41 33 39" />,
  },

  jowls: {
    none: Head({}),
    slight: (
      <>
        {Head({})}
        <path d="M13 31 Q12 35 16 36" opacity="0.8" />
        <path d="M35 31 Q36 35 32 36" opacity="0.8" />
      </>
    ),
    developed: (
      <>
        {Head({})}
        <path d="M12 29 Q10 36 18 38" />
        <path d="M36 29 Q38 36 30 38" />
      </>
    ),
  },

  chinProjection: {
    receding: <path d="M27 26 L28 33 Q29 35 27 35" />,
    neutral: <path d="M25 26 L25 34 Q26 36 24 35" />,
    prominent: <path d="M25 26 L23 34 Q22 37 27 36" />,
  },

  chinShape: {
    pointed: Head({ chin: 'pointed' }),
    round: Head({ chin: 'round' }),
    square: Head({ chin: 'square' }),
    broad: Head({ chin: 'broad', KW: 9 }),
  },

  chinHeight: {
    short: Head({ K: 39 }),
    medium: Head({ K: 42 }),
    long: Head({ K: 46 }),
  },

  chinCleft: {
    none: Head({}),
    slight: (
      <>
        {Head({})}
        <path d="M24 38 L24 40" opacity="0.6" />
      </>
    ),
    pronounced: (
      <>
        {Head({})}
        <path d="M24 37 L24 41" />
      </>
    ),
  },

  profile: {
    orthognathic: <path d="M27 11 L26 20 L20 25 L23 30 L25 37" />,
    'mild-prognathic': <path d="M27 11 L26 20 L20 25 L24 30 L28 37" />,
    prognathic: <path d="M27 11 L26 20 L20 25 L27 30 L31 38" />,
  },

  neckThickness: {
    slender: (
      <>
        {ghostHead({ K: 36 })}
        <path d="M20 37 L21 47" />
        <path d="M28 37 L27 47" />
      </>
    ),
    average: (
      <>
        {ghostHead({ K: 36 })}
        <path d="M19 37 L19 47" />
        <path d="M29 37 L29 47" />
      </>
    ),
    thick: (
      <>
        {ghostHead({ K: 36 })}
        <path d="M17 37 L16 47" />
        <path d="M31 37 L32 47" />
      </>
    ),
  },

  adamsApple: {
    flat: (
      <>
        <path d="M24 27 Q27 33 26 36 L26 47" opacity="0.5" />
        <path d="M26 36 L26 47" />
      </>
    ),
    slight: <path d="M26 34 Q25 40 26 47" />,
    prominent: <path d="M26 34 Q22 40 26 47" />,
  },
};
