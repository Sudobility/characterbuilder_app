import type { ReactNode } from 'react';
import { Head, ghostHead } from './_head';

/**
 * Line-art for CHEEKS & MIDFACE traits (0 0 48 48, currentColor). Mostly a ghost
 * head outline with the relevant cheek / midface feature drawn on top; projection
 * traits use a profile cheek fragment.
 */

const cheekMarks = (y: number): ReactNode => (
  <>
    <circle cx="15" cy={y} r="1.6" fill="currentColor" stroke="none" />
    <circle cx="33" cy={y} r="1.6" fill="currentColor" stroke="none" />
  </>
);

export const cheekIcons: Record<string, Record<string, ReactNode>> = {
  cheekFullness: {
    gaunt: (
      <>
        {Head({ CW: 13.5 })}
        <path d="M15 25 Q18 30 16 35" opacity="0.7" />
        <path d="M33 25 Q30 30 32 35" opacity="0.7" />
      </>
    ),
    flat: Head({ CW: 16 }),
    full: (
      <>
        {Head({ CW: 18.5 })}
        <path d="M15 27 Q20 29 18 33" opacity="0.7" />
        <path d="M33 27 Q28 29 30 33" opacity="0.7" />
      </>
    ),
  },

  cheekboneHeight: {
    low: (
      <>
        {ghostHead({})}
        {cheekMarks(28)}
      </>
    ),
    medium: (
      <>
        {ghostHead({})}
        {cheekMarks(24)}
      </>
    ),
    high: (
      <>
        {ghostHead({})}
        {cheekMarks(21)}
      </>
    ),
  },

  cheekboneWidth: {
    narrow: Head({ CW: 13 }),
    medium: Head({ CW: 16 }),
    wide: Head({ CW: 19 }),
  },

  cheekboneProjection: {
    flat: <path d="M28 10 C26 18 26 30 28 38" />,
    moderate: <path d="M28 10 C24 18 24 30 28 38" />,
    prominent: <path d="M28 10 C19 18 20 30 28 38" />,
  },

  submalarHollow: {
    filled: (
      <>
        {ghostHead({})}
        <path d="M15 27 Q19 28 17 32" opacity="0.6" />
        <path d="M33 27 Q29 28 31 32" opacity="0.6" />
      </>
    ),
    moderate: (
      <>
        {ghostHead({})}
        <path d="M15 26 Q19 31 17 34" opacity="0.7" />
        <path d="M33 26 Q29 31 31 34" opacity="0.7" />
      </>
    ),
    hollow: (
      <>
        {ghostHead({})}
        <path d="M15 25 Q20 33 17 37" />
        <path d="M33 25 Q28 33 31 37" />
      </>
    ),
  },

  nasolabialFold: {
    faint: (
      <>
        <path d="M20 22 Q22 23 23 24" />
        <path d="M28 22 Q26 23 25 24" />
        <path d="M19 30 Q24 32 29 30" opacity="0.6" />
      </>
    ),
    moderate: (
      <>
        <path d="M19 21 Q20 26 22 29" />
        <path d="M29 21 Q28 26 26 29" />
        <path d="M19 31 Q24 33 29 31" opacity="0.6" />
      </>
    ),
    deep: (
      <>
        <path d="M18 20 Q18 27 23 31" />
        <path d="M30 20 Q30 27 25 31" />
        <path d="M19 32 Q24 34 29 32" opacity="0.6" />
      </>
    ),
  },

  midfaceProjection: {
    flat: <path d="M28 10 L27 22 L24 27 L27 32" />,
    medium: <path d="M28 10 L26 22 L21 27 L26 32" />,
    forward: <path d="M28 10 L25 22 L17 27 L25 32" />,
  },

  midfaceLength: {
    short: (
      <>
        {ghostHead({})}
        <path d="M11 20 L13 20 M35 20 L37 20" />
        <path d="M11 27 L13 27 M35 27 L37 27" />
      </>
    ),
    medium: (
      <>
        {ghostHead({})}
        <path d="M11 19 L13 19 M35 19 L37 19" />
        <path d="M11 29 L13 29 M35 29 L37 29" />
      </>
    ),
    long: (
      <>
        {ghostHead({})}
        <path d="M11 18 L13 18 M35 18 L37 18" />
        <path d="M11 32 L13 32 M35 32 L37 32" />
      </>
    ),
  },
};
