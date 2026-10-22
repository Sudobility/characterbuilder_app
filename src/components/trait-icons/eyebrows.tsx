import type { ReactNode } from 'react';

/**
 * Line-art for every EYEBROW-group trait option (0 0 48 48, currentColor).
 * Brow masses are filled; arch/height traits use a stroked brow line plus a
 * reference eye so the vertical position reads.
 */

const brow = (d: string): ReactNode => <path d={d} fill="currentColor" stroke="none" />;

const refEye = (cy: number): ReactNode => (
  <>
    <path d={`M13 ${cy} Q24 ${cy - 4} 35 ${cy}`} />
    <path d={`M13 ${cy} Q24 ${cy + 4} 35 ${cy}`} />
    <circle cx="24" cy={cy} r="2.4" fill="currentColor" stroke="none" />
  </>
);

export const browIcons: Record<string, Record<string, ReactNode>> = {
  browThickness: {
    thin: brow('M9 25 Q24 20 39 24 Q24 22.5 9 27 Z'),
    medium: brow('M9 26 Q24 18 39 24 Q24 22 9 29 Z'),
    thick: brow('M9 28 Q24 15 39 23 Q24 24 9 31 Z'),
  },

  browShape: {
    straight: brow('M9 23 L39 21 L39 25 L9 28 Z'),
    curved: brow('M9 27 Q24 18 39 24 Q24 22 9 29 Z'),
    angled: brow('M9 29 L27 19 L39 24 L38 26.5 L27 23 L9 31 Z'),
    rounded: brow('M9 28 Q24 15 39 28 Q24 23 9 28 Z'),
  },

  browArch: {
    flat: <path d="M9 24 Q24 23 39 24" strokeWidth={3} />,
    low: <path d="M9 25 Q24 22 39 25" strokeWidth={3} />,
    medium: <path d="M9 26 Q24 18 39 26" strokeWidth={3} />,
    high: <path d="M9 27 Q24 13 39 27" strokeWidth={3} />,
  },

  browHeight: {
    low: (
      <>
        <path d="M11 27 Q24 24 37 27" strokeWidth={3} />
        {refEye(33)}
      </>
    ),
    medium: (
      <>
        <path d="M11 22 Q24 19 37 22" strokeWidth={3} />
        {refEye(33)}
      </>
    ),
    high: (
      <>
        <path d="M11 16 Q24 13 37 16" strokeWidth={3} />
        {refEye(33)}
      </>
    ),
  },

  browDensity: {
    sparse: (
      <>
        <path d="M9 27 Q24 23 39 27" opacity="0.3" />
        <path d="M12 28 l1 -3" />
        <path d="M16 27 l1 -3" />
        <path d="M20 26 l1 -3.5" />
        <path d="M24 25.5 l1 -3.5" />
        <path d="M28 26 l1 -3.5" />
        <path d="M32 27 l1 -3" />
        <path d="M36 28 l1 -2.5" />
      </>
    ),
    medium: (
      <>
        {brow('M9 26 Q24 21 39 25 Q24 23 9 28 Z')}
        <path d="M14 24 l1 -3" opacity="0.7" />
        <path d="M20 22 l1 -3.5" opacity="0.7" />
        <path d="M26 22 l1 -3.5" opacity="0.7" />
        <path d="M32 24 l1 -3" opacity="0.7" />
      </>
    ),
    full: brow('M9 28 Q24 16 39 24 Q24 24 9 31 Z'),
  },

  interBrowDistance: {
    unibrow: brow('M7 27 Q24 19 41 27 Q24 23 7 29 Z'),
    narrow: (
      <>
        {brow('M8 28 Q15 23 22 26 Q16 26 8 29 Z')}
        {brow('M40 28 Q33 23 26 26 Q32 26 40 29 Z')}
      </>
    ),
    average: (
      <>
        {brow('M8 28 Q14 23 19 26 Q14 26 8 29 Z')}
        {brow('M40 28 Q34 23 29 26 Q34 26 40 29 Z')}
      </>
    ),
    wide: (
      <>
        {brow('M8 28 Q12 23 16 26 Q12 26 8 29 Z')}
        {brow('M40 28 Q36 23 32 26 Q36 26 40 29 Z')}
      </>
    ),
  },
};
