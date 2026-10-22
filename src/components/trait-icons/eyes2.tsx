import type { ReactNode } from 'react';

/** Line-art for the remaining EYE-detail traits (0 0 48 48, currentColor). */

const eyeOpen = (cx: number): ReactNode => (
  <>
    <path d={`M${cx - 8} 24 Q${cx} 17 ${cx + 8} 24`} />
    <path d={`M${cx - 8} 24 Q${cx} 30 ${cx + 8} 24`} />
  </>
);

export const eye2Icons: Record<string, Record<string, ReactNode>> = {
  heterochromia: {
    none: (
      <>
        {eyeOpen(14)}
        <circle cx="14" cy="24" r="4" />
        {eyeOpen(34)}
        <circle cx="34" cy="24" r="4" />
      </>
    ),
    partial: (
      <>
        {eyeOpen(14)}
        <circle cx="14" cy="24" r="4" />
        {eyeOpen(34)}
        <circle cx="34" cy="24" r="4" />
        <path d="M34 20 A4 4 0 0 1 34 28 Z" fill="currentColor" stroke="none" />
      </>
    ),
    complete: (
      <>
        {eyeOpen(14)}
        <circle cx="14" cy="24" r="4" />
        {eyeOpen(34)}
        <circle cx="34" cy="24" r="4" fill="currentColor" stroke="none" />
      </>
    ),
  },

  limbalRing: {
    faint: (
      <>
        {eyeOpen(24)}
        <circle cx="24" cy="24" r="5" />
        <circle cx="24" cy="24" r="5" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    medium: (
      <>
        {eyeOpen(24)}
        <circle cx="24" cy="24" r="5" strokeWidth="2" />
        <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    strong: (
      <>
        {eyeOpen(24)}
        <circle cx="24" cy="24" r="5" strokeWidth="3.4" />
        <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  },

  lashLength: {
    short: (
      <>
        {eyeOpen(24)}
        <path d="M18 18 l-1 -2 M22 16.5 l0 -2 M26 16.5 l0 -2 M30 18 l1 -2" />
      </>
    ),
    medium: (
      <>
        {eyeOpen(24)}
        <path d="M18 18 l-2 -3 M22 16.5 l-1 -3.5 M26 16.5 l1 -3.5 M30 18 l2 -3" />
      </>
    ),
    long: (
      <>
        {eyeOpen(24)}
        <path d="M18 18 l-3 -5 M22 16 l-1 -5.5 M26 16 l1 -5.5 M30 18 l3 -5" />
      </>
    ),
  },

  lashDensity: {
    sparse: (
      <>
        {eyeOpen(24)}
        <path d="M20 17 l-1 -3 M26 16.5 l1 -3" />
      </>
    ),
    medium: (
      <>
        {eyeOpen(24)}
        <path d="M18 18 l-1 -3 M22 16.5 l0 -3 M26 16.5 l0 -3 M30 18 l1 -3" />
      </>
    ),
    dense: (
      <>
        {eyeOpen(24)}
        <path d="M17 18.5 l-1 -3 M20 17 l-0.5 -3 M23 16.3 l0 -3 M26 16.3 l0 -3 M29 17 l0.5 -3 M32 18.5 l1 -3" />
      </>
    ),
  },

  tearTrough: {
    smooth: (
      <>
        {eyeOpen(24)}
        <path d="M16 29 Q24 31 32 29" opacity="0.4" />
      </>
    ),
    hollow: (
      <>
        {eyeOpen(24)}
        <path d="M16 28 Q24 34 32 28" />
        <path d="M17 31 Q24 35 31 31" opacity="0.4" />
      </>
    ),
    puffy: (
      <>
        {eyeOpen(24)}
        <path d="M16 29 Q24 27 32 29 Q24 34 16 29 Z" opacity="0.6" />
      </>
    ),
  },
};
