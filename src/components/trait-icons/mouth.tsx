import type { ReactNode } from 'react';

/**
 * Line-art for every MOUTH & LIPS trait option (0 0 48 48, currentColor).
 * Lip-shape traits use a front view (upper edge + seam + lower edge); lip
 * projection is a profile; philtrum traits add the two ridges above the lip.
 */

/** Front mouth centred at (24,24). tilt>0 lifts the corners (upturned). */
function mouth({
  hw = 10,
  up = 3,
  lo = 4,
  bow = 'rounded',
  tilt = 0,
}: {
  hw?: number;
  up?: number;
  lo?: number;
  bow?: string;
  tilt?: number;
} = {}): ReactNode {
  const yc = 24;
  const corner = yc - tilt;
  const peakY = yc - up;
  const dip = bow === 'sharp' ? yc - up * 0.15 : bow === 'flat' ? yc - up * 0.8 : yc - up * 0.45;
  const upper =
    bow === 'flat'
      ? `M${24 - hw} ${corner} Q24 ${yc - up} ${24 + hw} ${corner}`
      : `M${24 - hw} ${corner} Q${24 - hw * 0.45} ${peakY} ${24 - 2.2} ${dip} Q24 ${yc - up * 0.05} ${24 + 2.2} ${dip} Q${24 + hw * 0.45} ${peakY} ${24 + hw} ${corner}`;
  return (
    <>
      <path d={upper} />
      <path d={`M${24 - hw} ${corner} Q24 ${yc + 0.8} ${24 + hw} ${corner}`} />
      <path d={`M${24 - hw} ${corner} Q24 ${yc + lo} ${24 + hw} ${corner}`} />
    </>
  );
}

const philtrum = (topY: number, opacity = 1, groove = false): ReactNode => (
  <>
    <path d={`M22 ${topY} L22 21`} opacity={opacity} />
    <path d={`M26 ${topY} L26 21`} opacity={opacity} />
    {groove && <path d={`M24 ${topY + 1} L24 21`} opacity="0.5" />}
    {mouth({ hw: 8, up: 2.5, lo: 3 })}
  </>
);

export const mouthIcons: Record<string, Record<string, ReactNode>> = {
  lipFullness: {
    thin: mouth({ up: 2, lo: 2.5 }),
    medium: mouth({ up: 3, lo: 4 }),
    full: mouth({ up: 4.5, lo: 6 }),
  },

  lipRatio: {
    balanced: mouth({ up: 3.5, lo: 4 }),
    'fuller-upper': mouth({ up: 5, lo: 3 }),
    'fuller-lower': mouth({ up: 3, lo: 6 }),
  },

  mouthWidth: {
    narrow: mouth({ hw: 7 }),
    medium: mouth({ hw: 10 }),
    wide: mouth({ hw: 13 }),
  },

  vermilionHeight: {
    thin: mouth({ up: 2, lo: 2 }),
    medium: mouth({ up: 3, lo: 3.5 }),
    tall: mouth({ up: 4.5, lo: 5.5 }),
  },

  cupidsBow: {
    sharp: mouth({ bow: 'sharp', up: 4 }),
    rounded: mouth({ bow: 'rounded', up: 3.5 }),
    flat: mouth({ bow: 'flat', up: 3 }),
  },

  mouthCorners: {
    downturned: mouth({ tilt: -2.5 }),
    neutral: mouth({ tilt: 0 }),
    upturned: mouth({ tilt: 2.5 }),
  },

  lipProjection: {
    flat: <path d="M30 17 Q27 21 28 24 Q27 27 30 31" />,
    medium: <path d="M30 17 Q24 21 26 24 Q24 27 30 31" />,
    protruding: <path d="M30 17 Q20 21 23 24 Q20 28 30 31" />,
  },

  philtrumLength: {
    short: philtrum(18),
    medium: philtrum(16),
    long: philtrum(13),
  },

  philtrumDepth: {
    shallow: philtrum(16, 0.4),
    medium: philtrum(16, 1),
    deep: philtrum(15, 1, true),
  },

  restingMouth: {
    closed: mouth({}),
    'slightly-parted': (
      <>
        <path d="M14 21 Q24 18 34 21" />
        <path d="M14 23 Q24 24 34 23" />
        <path d="M14 26 Q24 26 34 26" />
        <path d="M14 28 Q24 31 34 28" />
      </>
    ),
    open: (
      <>
        <path d="M13 22 Q24 15 35 22 Q24 33 13 22 Z" />
        <path d="M17 22 Q24 20 31 22" />
      </>
    ),
  },
};
