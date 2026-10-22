import type { ReactNode } from 'react';
import { Head, ghostHead } from './_head';

/**
 * Line-art for DEMOGRAPHICS (sex, ageBand, build) and INDIVIDUATING traits
 * (asymmetry, asymmetryFeature, dimples). Ancestry is intentionally left without
 * an icon — a face per region would caricature rather than clarify.
 */

// Simple standing figure by shoulder/waist half-width.
function figure(sh: number, wa: number): ReactNode {
  const L = (w: number) => 24 - w;
  const R = (w: number) => 24 + w;
  return (
    <>
      <circle cx="24" cy="10" r="5" />
      <path
        d={`M${L(sh)} 18 Q${L(sh) - 1} 29 ${L(wa)} 41 L${R(wa)} 41 Q${R(sh) + 1} 29 ${R(sh)} 18 Q24 16 ${L(sh)} 18 Z`}
      />
    </>
  );
}

const ageFace = (lines: ReactNode, opts = {}): ReactNode => (
  <>
    {Head(opts)}
    {lines}
  </>
);

const featureRing = (cx: number, cy: number, r: number): ReactNode => (
  <circle cx={cx} cy={cy} r={r} strokeDasharray="3 2.5" opacity="0.8" />
);

export const miscIcons: Record<string, Record<string, ReactNode>> = {
  sex: {
    // Traditional Venus (♀) / Mars (♂) symbols, and the combined ⚥ for androgynous.
    female: (
      <>
        <circle cx="24" cy="17" r="8" />
        <path d="M24 25 L24 41" />
        <path d="M18 34 L30 34" />
      </>
    ),
    male: (
      <>
        <circle cx="20" cy="28" r="8" />
        <path d="M25.7 22.3 L37 11" />
        <path d="M30 11 L37 11 L37 18" />
      </>
    ),
    androgynous: (
      <>
        <circle cx="22" cy="24" r="7" />
        <path d="M22 31 L22 41" />
        <path d="M17 37 L27 37" />
        <path d="M26.9 19.1 L35 11" />
        <path d="M29.5 11 L35 11 L35 16.5" />
      </>
    ),
  },

  ageBand: {
    child: Head({ TW: 13, CW: 15, JW: 11, T: 14, K: 40, chin: 'round' }),
    teen: Head({ TW: 14, CW: 15.5, JW: 12, K: 42 }),
    twenties: Head({}),
    thirties: ageFace(<path d="M15 20 q9 -1 18 0" opacity="0.5" strokeWidth={1.2} />),
    forties: ageFace(
      <>
        <path d="M15 19 q9 -1 18 0" opacity="0.6" strokeWidth={1.2} />
        <path d="M18 30 q-2 3 -3 6 M30 30 q2 3 3 6" opacity="0.5" />
      </>
    ),
    fifties: ageFace(
      <>
        <path d="M15 18 q9 -1 18 0" />
        <path d="M15 22 q9 -1 18 0" opacity="0.6" />
        <path d="M17 29 Q15 33 15 36 M31 29 Q33 33 33 36" opacity="0.6" />
      </>
    ),
    sixties: ageFace(
      <>
        <path d="M15 17 q9 -1 18 0" />
        <path d="M15 21 q9 -1 18 0" />
        <path d="M16 29 Q14 34 15 37 M32 29 Q34 34 33 37" />
        <path d="M19 33 q5 2 10 0" opacity="0.5" />
      </>
    ),
    'seventies-plus': ageFace(
      <>
        <path d="M14 16 q10 -1 20 0" />
        <path d="M14 20 q10 -1 20 0" />
        <path d="M15 24 q9 -1 18 0" opacity="0.7" />
        <path d="M16 29 Q14 34 15 38 M32 29 Q34 34 33 38" />
        <path d="M19 33 q5 2 10 0" />
      </>,
      { JW: 15 }
    ),
  },

  build: {
    slim: figure(8, 6.5),
    average: figure(10, 8.5),
    athletic: figure(13.5, 8),
    heavy: figure(12, 13),
  },

  asymmetry: {
    none: (
      <>
        {ghostHead({})}
        <path d="M24 9 L24 41" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="17" cy="21" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="31" cy="21" r="1.6" fill="currentColor" stroke="none" />
      </>
    ),
    subtle: (
      <>
        {ghostHead({})}
        <path d="M24 9 L24 41" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="17" cy="22" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="31" cy="20" r="1.6" fill="currentColor" stroke="none" />
      </>
    ),
    moderate: (
      <>
        {ghostHead({})}
        <path d="M24 9 L24 41" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="17" cy="23" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="31" cy="19" r="1.6" fill="currentColor" stroke="none" />
        <path d="M18 31 Q24 32 30 29" opacity="0.7" />
      </>
    ),
  },

  asymmetryFeature: {
    eyes: (
      <>
        {ghostHead({})}
        <path d="M14 21 Q17 19 20 21 M28 21 Q31 19 34 21" />
        {featureRing(24, 21, 11)}
      </>
    ),
    brows: (
      <>
        {ghostHead({})}
        <path d="M14 17 Q17 15 20 17 M28 17 Q31 15 34 17" />
        {featureRing(24, 17, 11)}
      </>
    ),
    nose: (
      <>
        {ghostHead({})}
        <path d="M23 20 L22 27 Q24 29 26 27 L25 20" />
        {featureRing(24, 25, 7)}
      </>
    ),
    mouth: (
      <>
        {ghostHead({})}
        <path d="M18 31 Q24 33 30 31" />
        {featureRing(24, 31, 8)}
      </>
    ),
    jaw: (
      <>
        {ghostHead({})}
        <path d="M13 28 Q24 41 35 28" />
        {featureRing(24, 36, 9)}
      </>
    ),
    ears: (
      <>
        {ghostHead({})}
        <path d="M10 22 Q8 26 11 29 M38 22 Q40 26 37 29" />
        {featureRing(10, 25, 5)}
        {featureRing(38, 25, 5)}
      </>
    ),
  },

  dimples: {
    none: Head({}),
    cheek: (
      <>
        {Head({})}
        <circle cx="16" cy="30" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="32" cy="30" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    chin: (
      <>
        {Head({})}
        <circle cx="24" cy="38" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    both: (
      <>
        {Head({})}
        <circle cx="16" cy="30" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="32" cy="30" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="24" cy="38" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
  },
};
