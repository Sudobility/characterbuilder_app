import type { ReactNode } from 'react';

/**
 * Line-art for SKIN surface traits (0 0 48 48, currentColor) — a skin patch with
 * the relevant surface feature drawn on it. skinTone / skinUndertone → colors.tsx.
 */

const patch = <rect x="9" y="9" width="30" height="30" rx="7" />;
const dot = (x: number, y: number, r = 1): ReactNode => (
  <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
);

export const skinIcons: Record<string, Record<string, ReactNode>> = {
  skinTexture: {
    smooth: patch,
    normal: (
      <>
        {patch}
        {dot(18, 20, 0.7)}
        {dot(28, 26, 0.7)}
        {dot(22, 30, 0.7)}
      </>
    ),
    coarse: (
      <>
        {patch}
        <path d="M15 18 l3 2 M26 17 l3 2 M18 26 l3 2 M28 28 l3 2 M22 32 l3 2" opacity="0.8" />
      </>
    ),
    porous: (
      <>
        {patch}
        {[
          [16, 17],
          [23, 16],
          [30, 19],
          [18, 24],
          [26, 25],
          [32, 28],
          [20, 31],
          [28, 32],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.1" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
  },

  poreVisibility: {
    fine: (
      <>
        {patch}
        {dot(18, 19, 0.5)}
        {dot(26, 22, 0.5)}
        {dot(22, 29, 0.5)}
        {dot(30, 30, 0.5)}
      </>
    ),
    moderate: (
      <>
        {patch}
        {dot(18, 19)}
        {dot(26, 22)}
        {dot(22, 29)}
        {dot(30, 30)}
        {dot(15, 27)}
      </>
    ),
    large: (
      <>
        {patch}
        {dot(18, 19, 1.6)}
        {dot(27, 22, 1.6)}
        {dot(21, 30, 1.6)}
        {dot(31, 30, 1.6)}
        {dot(15, 27, 1.6)}
      </>
    ),
  },

  skinSurface: {
    matte: patch,
    normal: (
      <>
        {patch}
        <circle cx="20" cy="19" r="4" opacity="0.4" />
      </>
    ),
    oily: (
      <>
        {patch}
        <circle cx="19" cy="18" r="3.5" fill="currentColor" opacity="0.45" stroke="none" />
        <circle cx="30" cy="27" r="2.5" fill="currentColor" opacity="0.45" stroke="none" />
      </>
    ),
    dry: (
      <>
        {patch}
        <path d="M15 20 l4 1 M22 17 l3 3 M27 24 l4 1 M18 28 l3 2 M26 31 l4 0" opacity="0.7" />
      </>
    ),
  },

  pigmentation: {
    even: patch,
    freckled: (
      <>
        {patch}
        {[
          [17, 18],
          [23, 16],
          [29, 20],
          [20, 24],
          [27, 26],
          [16, 29],
          [31, 30],
          [24, 31],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
    vitiligo: (
      <>
        {patch}
        <path d="M16 18 q4 -1 5 3 q-1 4 -5 3 q-3 -3 0 -6 z" opacity="0.9" />
        <path d="M27 26 q4 0 4 4 q-2 3 -5 1 q-2 -3 1 -5 z" opacity="0.9" />
      </>
    ),
    melasma: (
      <>
        {patch}
        <path d="M17 17 q7 -2 9 3 q1 5 -5 5 q-7 -1 -4 -8 z" fill="currentColor" opacity="0.35" stroke="none" />
      </>
    ),
    uneven: (
      <>
        {patch}
        <path d="M16 18 q6 -2 8 2 q0 4 -5 4 q-5 0 -3 -6 z" fill="currentColor" opacity="0.3" stroke="none" />
        {dot(29, 27)}
        {dot(26, 31)}
        {dot(31, 22)}
      </>
    ),
  },

  wrinkleLevel: {
    none: patch,
    'fine-lines': (
      <>
        {patch}
        <path d="M14 21 q10 -2 20 0" opacity="0.6" strokeWidth={1.3} />
        <path d="M14 27 q10 -2 20 0" opacity="0.6" strokeWidth={1.3} />
      </>
    ),
    moderate: (
      <>
        {patch}
        <path d="M14 19 q10 -2 20 0" />
        <path d="M14 25 q10 -2 20 0" />
        <path d="M14 31 q10 -2 20 0" />
      </>
    ),
    deep: (
      <>
        {patch}
        <path d="M14 19 q5 -3 10 0 q5 3 10 0" strokeWidth={2.4} />
        <path d="M14 26 q5 -3 10 0 q5 3 10 0" strokeWidth={2.4} />
        <path d="M14 33 q5 -3 10 0 q5 3 10 0" strokeWidth={2.4} />
      </>
    ),
  },
};
