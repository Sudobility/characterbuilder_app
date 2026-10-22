import type { ReactNode } from 'react';

/** Line-art for TEETH traits (0 0 48 48, currentColor). teethColor → colors.tsx. */

const teethRow = (xs: number[], y: number, w: number, h: number): ReactNode => (
  <>
    {xs.map((x, i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx="1.6" />
    ))}
  </>
);

export const teethIcons: Record<string, Record<string, ReactNode>> = {
  biteClass: {
    'class-i': (
      <>
        <rect x="17" y="17" width="14" height="7" rx="3" />
        <rect x="17" y="26" width="14" height="7" rx="3" />
      </>
    ),
    'class-ii': (
      <>
        <rect x="14" y="17" width="14" height="7" rx="3" />
        <rect x="19" y="26" width="14" height="7" rx="3" />
      </>
    ),
    'class-iii': (
      <>
        <rect x="19" y="17" width="14" height="7" rx="3" />
        <rect x="14" y="26" width="14" height="7" rx="3" />
      </>
    ),
  },

  teeth: {
    even: teethRow([13, 18, 23, 28, 33], 21, 4, 8),
    gapped: teethRow([12, 18.5, 25, 31.5], 21, 3.5, 8),
    crowded: (
      <>
        <rect x="13" y="22" width="4" height="8" rx="1.5" />
        <rect x="16.5" y="20" width="4" height="8" rx="1.5" />
        <rect x="20" y="22" width="4" height="8" rx="1.5" />
        <rect x="24" y="20.5" width="4" height="8" rx="1.5" />
        <rect x="27.5" y="22" width="4" height="8" rx="1.5" />
        <rect x="31" y="20.5" width="4" height="8" rx="1.5" />
      </>
    ),
    prominent: (
      <>
        <rect x="14" y="23" width="3.5" height="6" rx="1.4" />
        <rect x="19" y="20" width="5" height="10" rx="2" />
        <rect x="24" y="20" width="5" height="10" rx="2" />
        <rect x="30.5" y="23" width="3.5" height="6" rx="1.4" />
      </>
    ),
  },

  toothSize: {
    small: teethRow([13, 17, 21, 25, 29, 33], 22, 3, 6),
    medium: teethRow([14, 19, 24, 29], 21, 4.5, 8),
    large: teethRow([15, 23.5, 32], 20, 7, 10),
  },

  toothShow: {
    none: <path d="M13 24 Q24 27 35 24" />,
    slight: (
      <>
        <path d="M13 22 Q24 20 35 22" />
        {teethRow([16, 20.5, 25, 29.5], 23, 3.5, 4)}
        <path d="M13 29 Q24 31 35 29" />
      </>
    ),
    prominent: (
      <>
        <path d="M12 20 Q24 14 36 20" />
        {teethRow([15, 19.5, 24, 28.5, 32.5], 21, 4, 8)}
        <path d="M12 20 Q24 36 36 20" />
      </>
    ),
  },

  gumDisplay: {
    low: (
      <>
        <path d="M13 22 Q24 20 35 22" />
        {teethRow([16, 21, 26, 31], 22, 4, 8)}
      </>
    ),
    normal: (
      <>
        <path d="M13 19 Q24 17 35 19" />
        <path d="M13 22 Q24 21 35 22" opacity="0.5" />
        {teethRow([16, 21, 26, 31], 22, 4, 8)}
      </>
    ),
    gummy: (
      <>
        <path d="M13 15 Q24 13 35 15" />
        <path d="M14 24 Q24 22 34 24" opacity="0.5" />
        {teethRow([17, 21.5, 26, 30.5], 24, 4, 6)}
      </>
    ),
  },
};
