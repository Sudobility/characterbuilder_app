import type { ReactNode } from 'react';

/**
 * Line-art for every NOSE-group trait option (0 0 48 48, currentColor).
 * Width / size / tip / nostril traits use a front view; bridge, root, projection,
 * rotation and columella use a left-facing profile silhouette.
 */

/** Front-view nose centred at x=24. */
function frontNose({
  halfTop = 2.6,
  halfBase = 6,
  topY = 13,
  baseY = 32,
  flare = 0,
  tip = 'rounded',
}: {
  halfTop?: number;
  halfBase?: number;
  topY?: number;
  baseY?: number;
  flare?: number;
  tip?: string;
} = {}): ReactNode {
  const L = 24 - halfBase;
  const R = 24 + halfBase;
  const mid = (topY + baseY) / 2;
  const tipTop = baseY - 3;
  const tips: Record<string, ReactNode> = {
    pointed: <path d={`M${L} ${tipTop} Q24 ${baseY + 3} ${R} ${tipTop}`} />,
    rounded: <path d={`M${L} ${tipTop} Q24 ${baseY + 2} ${R} ${tipTop}`} />,
    bulbous: <path d={`M${L - 0.5} ${tipTop - 1} Q24 ${baseY + 4} ${R + 0.5} ${tipTop - 1}`} />,
    boxy: (
      <path
        d={`M${L} ${tipTop} L${L} ${baseY} Q24 ${baseY + 1.5} ${R} ${baseY} L${R} ${tipTop}`}
      />
    ),
    upturned: <path d={`M${L} ${tipTop + 1} Q24 ${baseY - 2.5} ${R} ${tipTop + 1}`} />,
    drooping: <path d={`M${L} ${tipTop - 1} Q24 ${baseY + 5} ${R} ${tipTop - 1}`} />,
  };
  return (
    <>
      <path d={`M${24 - halfTop} ${topY} C${24 - halfTop - 1} ${mid} ${L} ${baseY - 7} ${L} ${tipTop}`} />
      <path d={`M${24 + halfTop} ${topY} C${24 + halfTop + 1} ${mid} ${R} ${baseY - 7} ${R} ${tipTop}`} />
      {tips[tip] ?? tips.rounded}
      <path d={`M${24 - 3.4 - flare} ${baseY - 1} q${1.5 + flare} 1.7 ${3 + flare} 0`} />
      <path d={`M${24 + 3.4 + flare} ${baseY - 1} q${-(1.5 + flare)} 1.7 ${-(3 + flare)} 0`} />
    </>
  );
}

// Profile silhouette (nose points left). Shared root + under-tip segments.
const ROOT = 'M31 11 Q29 15 29 17';
const UNDERTIP = 'Q13 30 18 31 Q24 32 29 33';
const prof = (d: string): ReactNode => <path d={d} />;

export const noseIcons: Record<string, Record<string, ReactNode>> = {
  noseSize: {
    small: frontNose({ halfBase: 4.5, halfTop: 2, topY: 16, baseY: 30, tip: 'rounded' }),
    medium: frontNose({ halfBase: 6, topY: 13, baseY: 32 }),
    large: frontNose({ halfBase: 7.5, halfTop: 3.2, topY: 10, baseY: 34 }),
  },

  noseWidth: {
    narrow: frontNose({ halfBase: 4 }),
    medium: frontNose({ halfBase: 6 }),
    wide: frontNose({ halfBase: 8 }),
  },

  noseBridgeWidth: {
    narrow: frontNose({ halfTop: 1.6, halfBase: 5.5 }),
    medium: frontNose({ halfTop: 2.8, halfBase: 6 }),
    wide: frontNose({ halfTop: 4.2, halfBase: 6.5 }),
  },

  alarBaseWidth: {
    narrow: frontNose({ halfBase: 4.5, flare: -0.6 }),
    medium: frontNose({ halfBase: 6 }),
    wide: frontNose({ halfBase: 8, flare: 0.8 }),
  },

  nostrils: {
    narrow: frontNose({ flare: -0.8 }),
    medium: frontNose({ flare: 0 }),
    flared: frontNose({ flare: 1.8 }),
  },

  nasalIndex: {
    leptorrhine: frontNose({ halfBase: 4, halfTop: 2, flare: -0.6 }),
    mesorrhine: frontNose({ halfBase: 6, halfTop: 2.8 }),
    platyrrhine: frontNose({ halfBase: 8.5, halfTop: 3.6, flare: 1.4 }),
  },

  noseLength: {
    short: frontNose({ topY: 17, baseY: 30 }),
    medium: frontNose({ topY: 13, baseY: 32 }),
    long: frontNose({ topY: 9, baseY: 35 }),
  },

  noseTip: {
    pointed: frontNose({ tip: 'pointed' }),
    rounded: frontNose({ tip: 'rounded' }),
    bulbous: frontNose({ tip: 'bulbous', halfBase: 6.5 }),
    boxy: frontNose({ tip: 'boxy' }),
    upturned: frontNose({ tip: 'upturned' }),
    drooping: frontNose({ tip: 'drooping' }),
  },

  // ── Profile traits ──
  noseBridge: {
    straight: prof(`${ROOT} L15 28 ${UNDERTIP}`),
    convex: prof(`${ROOT} Q19 21 15 28 ${UNDERTIP}`),
    concave: prof(`${ROOT} Q27 24 15 28 ${UNDERTIP}`),
    humped: prof(`${ROOT} Q24 15 22 19 Q18 25 15 28 ${UNDERTIP}`),
  },

  nasalRoot: {
    shallow: prof(`M31 11 Q30 15 30 17 L15 28 ${UNDERTIP}`),
    medium: prof(`${ROOT} L15 28 ${UNDERTIP}`),
    deep: prof(`M31 11 Q27 15 28 18 L15 28 ${UNDERTIP}`),
  },

  noseBridgeHeight: {
    low: prof(`${ROOT} L20 27 Q18 29 22 30 Q25 31 29 33`),
    medium: prof(`${ROOT} L15 28 ${UNDERTIP}`),
    high: prof(`${ROOT} L11 28 Q9 30 15 31 Q22 32 29 33`),
  },

  noseTipProjection: {
    shallow: prof(`${ROOT} L20 27 Q18 29 22 30 Q25 31 29 33`),
    medium: prof(`${ROOT} L16 28 Q14 30 19 31 Q24 32 29 33`),
    projecting: prof(`${ROOT} L10 28 Q8 30 14 31 Q22 32 29 33`),
  },

  noseTipRotation: {
    upturned: prof(`${ROOT} L15 26 Q12 24 17 27 Q23 30 29 33`),
    neutral: prof(`${ROOT} L15 28 ${UNDERTIP}`),
    downturned: prof(`${ROOT} L15 30 Q14 33 19 32 Q24 33 29 34`),
  },

  columella: {
    retracted: prof(`${ROOT} L15 28 Q14 29 18 29 Q24 30 29 32`),
    neutral: prof(`${ROOT} L15 28 ${UNDERTIP}`),
    hanging: prof(`${ROOT} L15 28 Q13 31 18 33 Q24 33 29 33`),
  },
};
