import type { ReactNode } from 'react';

/**
 * Detailed line-art for every EYE-group trait option. Each node is the inner SVG
 * of a 0 0 48 48 canvas (see TraitIcon), stroked in `currentColor` so it adapts
 * to the theme. Iris = outlined circle + filled pupil.
 */

const Iris = ({ cx, cy, r }: { cx: number; cy: number; r: number }): ReactNode => (
  <>
    <circle cx={cx} cy={cy} r={r} />
    <circle cx={cx} cy={cy} r={Math.max(1.4, r * 0.38)} fill="currentColor" stroke="none" />
  </>
);

/** A compact almond eye centred at (cx,25), used where a reference eye is enough. */
const SmallEye = ({ cx }: { cx: number }): ReactNode => (
  <>
    <path d={`M${cx - 7} 25 Q${cx} 20 ${cx + 7} 25`} />
    <path d={`M${cx - 7} 25 Q${cx} 29 ${cx + 7} 25`} />
    <circle cx={cx} cy="25" r="2.6" fill="currentColor" stroke="none" />
  </>
);

const crease = (y: number): ReactNode => <path d={`M12 ${y} Q24 ${y - 3} 36 ${y}`} />;

export const eyeIcons: Record<string, Record<string, ReactNode>> = {
  eyeShape: {
    almond: (
      <>
        <path d="M7 25 Q24 15 41 25" />
        <path d="M7 25 Q24 32 41 25" />
        <Iris cx={24} cy={25} r={5.5} />
      </>
    ),
    round: (
      <>
        <path d="M9 24 Q24 12 39 24" />
        <path d="M9 24 Q24 35 39 24" />
        <Iris cx={24} cy={24} r={7} />
      </>
    ),
    upturned: (
      <>
        <path d="M8 29 Q22 17 41 21" />
        <path d="M8 29 Q24 31 41 21" />
        <Iris cx={22} cy={25} r={5} />
      </>
    ),
    downturned: (
      <>
        <path d="M8 21 Q24 16 41 29" />
        <path d="M8 21 Q22 31 41 29" />
        <Iris cx={24} cy={24} r={5} />
      </>
    ),
    hooded: (
      <>
        <path d="M8 22 Q24 14 40 22" />
        <path d="M9 26 Q24 21 39 26" />
        <path d="M9 26 Q24 31 39 26" />
        <Iris cx={24} cy={26} r={4.2} />
      </>
    ),
  },

  eyeSize: {
    small: (
      <>
        <path d="M15 25 Q24 20 33 25" />
        <path d="M15 25 Q24 30 33 25" />
        <Iris cx={24} cy={25} r={3} />
      </>
    ),
    medium: (
      <>
        <path d="M11 25 Q24 18 37 25" />
        <path d="M11 25 Q24 31 37 25" />
        <Iris cx={24} cy={25} r={4.5} />
      </>
    ),
    large: (
      <>
        <path d="M7 25 Q24 14 41 25" />
        <path d="M7 25 Q24 34 41 25" />
        <Iris cx={24} cy={25} r={6.5} />
      </>
    ),
  },

  eyeSpacing: {
    'close-set': (
      <>
        <SmallEye cx={18} />
        <SmallEye cx={30} />
      </>
    ),
    average: (
      <>
        <SmallEye cx={14} />
        <SmallEye cx={34} />
      </>
    ),
    'wide-set': (
      <>
        <SmallEye cx={10} />
        <SmallEye cx={38} />
      </>
    ),
  },

  orbitalDepth: {
    shallow: (
      <>
        <path d="M9 18 Q24 15 39 18" />
        <path d="M9 27 Q24 20 39 27" />
        <path d="M9 27 Q24 32 39 27" />
        <Iris cx={24} cy={26} r={4.5} />
      </>
    ),
    average: (
      <>
        <path d="M9 15 Q24 12 39 15" />
        <path d="M9 28 Q24 21 39 28" />
        <path d="M9 28 Q24 33 39 28" />
        <Iris cx={24} cy={27} r={4.5} />
      </>
    ),
    deep: (
      <>
        <path d="M9 13 Q24 10 39 13" />
        <path d="M11 18 Q24 23 37 18" opacity="0.5" />
        <path d="M10 29 Q24 23 38 29" />
        <path d="M10 29 Q24 34 38 29" />
        <Iris cx={24} cy={28} r={4.3} />
      </>
    ),
  },

  canthalTilt: {
    negative: (
      <>
        <path d="M8 22 Q24 17 41 28" />
        <path d="M8 22 Q22 30 41 28" />
        <Iris cx={23} cy={24} r={4.5} />
        <path d="M6 21 L42 30" strokeDasharray="3 3" opacity="0.45" />
      </>
    ),
    neutral: (
      <>
        <path d="M7 25 Q24 16 41 25" />
        <path d="M7 25 Q24 32 41 25" />
        <Iris cx={24} cy={25} r={5} />
        <path d="M6 25 L42 25" strokeDasharray="3 3" opacity="0.45" />
      </>
    ),
    positive: (
      <>
        <path d="M8 28 Q24 17 41 22" />
        <path d="M8 28 Q22 31 41 22" />
        <Iris cx={23} cy={25} r={4.5} />
        <path d="M6 29 L42 20" strokeDasharray="3 3" opacity="0.45" />
      </>
    ),
  },

  lidType: {
    double: (
      <>
        {crease(20)}
        <path d="M10 26 Q24 18 38 26" />
        <path d="M10 26 Q24 32 38 26" />
        <Iris cx={24} cy={26} r={4.8} />
      </>
    ),
    monolid: (
      <>
        <path d="M9 25 Q24 20 39 25" />
        <path d="M9 25 Q24 29 39 25" />
        <Iris cx={24} cy={25} r={4.5} />
      </>
    ),
    hooded: (
      <>
        <path d="M8 22 Q24 14 40 22" />
        <path d="M9 26 Q24 21 39 26" />
        <path d="M9 26 Q24 31 39 26" />
        <Iris cx={24} cy={26} r={4.2} />
      </>
    ),
    'deep-set': (
      <>
        <path d="M9 14 Q24 11 39 14" />
        <path d="M10 19 Q24 24 38 19" opacity="0.5" />
        <path d="M10 29 Q24 23 38 29" />
        <path d="M10 29 Q24 34 38 29" />
        <Iris cx={24} cy={28} r={4.3} />
      </>
    ),
    prominent: (
      <>
        <path d="M9 24 Q24 12 39 24" />
        <path d="M9 24 Q24 35 39 24" />
        <Iris cx={24} cy={24} r={6.2} />
        <circle cx="21" cy="21" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },

  lidCrease: {
    none: (
      <>
        <path d="M9 26 Q24 20 39 26" />
        <path d="M9 26 Q24 31 39 26" />
        <Iris cx={24} cy={26} r={4.6} />
      </>
    ),
    single: (
      <>
        {crease(20)}
        <path d="M9 27 Q24 21 39 27" />
        <path d="M9 27 Q24 32 39 27" />
        <Iris cx={24} cy={27} r={4.4} />
      </>
    ),
    double: (
      <>
        {crease(20)}
        {crease(16)}
        <path d="M9 27 Q24 21 39 27" />
        <path d="M9 27 Q24 32 39 27" />
        <Iris cx={24} cy={27} r={4.2} />
      </>
    ),
    triple: (
      <>
        {crease(20)}
        {crease(16.5)}
        {crease(13)}
        <path d="M9 28 Q24 22 39 28" />
        <path d="M9 28 Q24 33 39 28" />
        <Iris cx={24} cy={28} r={4} />
      </>
    ),
  },

  lidFoldHeight: {
    low: (
      <>
        {crease(23)}
        <path d="M9 27 Q24 22 39 27" />
        <path d="M9 27 Q24 32 39 27" />
        <Iris cx={24} cy={27} r={4.3} />
      </>
    ),
    medium: (
      <>
        {crease(19)}
        <path d="M9 27 Q24 21 39 27" />
        <path d="M9 27 Q24 32 39 27" />
        <Iris cx={24} cy={27} r={4.3} />
      </>
    ),
    high: (
      <>
        {crease(14)}
        <path d="M9 27 Q24 21 39 27" />
        <path d="M9 27 Q24 32 39 27" />
        <Iris cx={24} cy={27} r={4.3} />
      </>
    ),
  },

  epicanthicFold: {
    none: (
      <>
        <path d="M7 25 Q24 16 41 25" />
        <path d="M7 25 Q24 32 41 25" />
        <Iris cx={24} cy={25} r={5} />
      </>
    ),
    slight: (
      <>
        <path d="M9 25 Q24 16 41 25" />
        <path d="M9 25 Q24 32 41 25" />
        <path d="M10 21 Q13 25 10 29" />
        <Iris cx={25} cy={25} r={4.6} />
      </>
    ),
    pronounced: (
      <>
        <path d="M12 25 Q26 16 41 25" />
        <path d="M12 25 Q26 32 41 25" />
        <path d="M13 19 Q18 25 12 31" />
        <Iris cx={27} cy={25} r={4.4} />
      </>
    ),
  },

  scleralShow: {
    none: (
      <>
        <path d="M8 25 Q24 17 40 25" />
        <path d="M8 25 Q24 32 40 25" />
        <Iris cx={24} cy={25} r={6} />
      </>
    ),
    lower: (
      <>
        <path d="M8 24 Q24 16 40 24" />
        <path d="M8 24 Q24 33 40 24" />
        <Iris cx={24} cy={22} r={4.6} />
      </>
    ),
    'upper-and-lower': (
      <>
        <path d="M8 24 Q24 14 40 24" />
        <path d="M8 24 Q24 35 40 24" />
        <Iris cx={24} cy={24} r={3.6} />
      </>
    ),
  },
};
