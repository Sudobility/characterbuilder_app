import type { ReactNode } from 'react';

/**
 * Line-art for HAIR traits (0 0 48 48, currentColor). hairColor / browColor /
 * facialHairColor → colors.tsx. Textures are strands; hairline / balding /
 * greying use a front hair-cap fill; facial hair uses a lower-face outline.
 */

const strand = (x: number, kind: string): string => {
  switch (kind) {
    case 'wavy':
      return `M${x} 10 q3 5 0 10 q-3 5 0 10 q3 5 0 10`;
    case 'curly':
      return `M${x} 10 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 6`;
    case 'coily':
      return `M${x} 10 q3 3 0 5 q-3 3 0 5 q3 3 0 5 q-3 3 0 5 q3 3 0 5`;
    default:
      return `M${x} 10 L${x} 40`;
  }
};

const strands = (xs: number[], kind: string, w?: number): ReactNode => (
  <>
    {xs.map((x, i) => (
      <path key={i} d={strand(x, kind)} strokeWidth={w} />
    ))}
  </>
);

// Hair-cap fill: `bottom` is the hairline edge (left→right); the dome closes it.
const DOME = 'L37 12 Q37 7 24 7 Q11 7 11 12 Z';
const cap = (bottom: string, opacity = 1): ReactNode => (
  <path d={`${bottom} ${DOME}`} fill="currentColor" stroke="none" opacity={opacity} />
);
const lowerFace = <path d="M12 15 Q12 31 24 37 Q36 31 36 15" />;
const brows = <path d="M16 29 Q19 28 22 29 M26 29 Q29 28 32 29" opacity="0.6" />;

const hairline = (bottom: string): ReactNode => (
  <>
    {lowerFace}
    {cap(bottom)}
    {brows}
  </>
);

// Top-of-head crown (front view) for balding — scalp outline + hair fill variants.
const scalp = <path d="M11 34 L11 15 Q11 7 24 7 Q37 7 37 15 L37 34" opacity="0.4" />;

export const hairIcons: Record<string, Record<string, ReactNode>> = {
  hairTexture: {
    straight: strands([12, 20, 28, 36], 'straight'),
    wavy: strands([12, 20, 28, 36], 'wavy'),
    curly: strands([12, 20, 28, 36], 'curly'),
    coily: strands([12, 20, 28, 36], 'coily'),
  },

  hairDensity: {
    thin: strands([18, 24, 30], 'straight'),
    medium: strands([12, 18, 24, 30, 36], 'straight'),
    thick: strands([11, 14.5, 18, 21.5, 25, 28.5, 32, 35.5], 'straight'),
  },

  strandThickness: {
    fine: strands([16, 24, 32], 'straight', 1),
    medium: strands([16, 24, 32], 'straight', 2.2),
    coarse: strands([16, 24, 32], 'straight', 3.6),
  },

  hairline: {
    straight: hairline('M11 18 L37 18'),
    rounded: hairline('M11 19 Q24 14 37 19'),
    'widows-peak': hairline('M11 16 Q18 17 24 22 Q30 17 37 16'),
    'm-shaped': hairline('M11 15 Q15 21 19 17 Q24 15 29 17 Q33 21 37 15'),
    receding: hairline('M13 13 Q24 20 35 13'),
  },

  balding: {
    none: (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18')}
      </>
    ),
    'temple-recession': (
      <>
        {scalp}
        {cap('M11 16 Q13 14 16 16 Q19 20 24 18 Q29 20 32 16 Q35 14 37 16')}
      </>
    ),
    'crown-thinning': (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18')}
        <ellipse cx="24" cy="13" rx="6" ry="4" fill="#000" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    'norwood-advanced': (
      <>
        {scalp}
        <path d="M11 30 L11 16 Q11 10 15 9 L15 24 Z" fill="currentColor" stroke="none" />
        <path d="M37 30 L37 16 Q37 10 33 9 L33 24 Z" fill="currentColor" stroke="none" />
      </>
    ),
    'diffuse-thinning': (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18', 0.4)}
      </>
    ),
  },

  greying: {
    none: (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18')}
      </>
    ),
    temples: (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18')}
        <path d="M12 11 L12 17 M36 11 L36 17" stroke="#dcdcdc" strokeWidth="2.5" />
      </>
    ),
    'salt-and-pepper': (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18')}
        {[
          [15, 11],
          [21, 10],
          [28, 12],
          [33, 10],
          [18, 15],
          [25, 15],
          [31, 15],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.3" fill="#e2e2e2" stroke="none" />
        ))}
      </>
    ),
    full: (
      <>
        {scalp}
        {cap('M11 18 Q24 15 37 18', 0.45)}
      </>
    ),
  },

  facialHair: {
    'clean-shaven': (
      <>
        {lowerFace}
        <path d="M18 24 Q24 26 30 24" />
      </>
    ),
    stubble: (
      <>
        {lowerFace}
        <path d="M18 24 Q24 26 30 24" />
        {[
          [16, 29],
          [20, 31],
          [24, 32],
          [28, 31],
          [32, 29],
          [18, 27],
          [30, 27],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.8" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
    moustache: (
      <>
        {lowerFace}
        <path d="M17 23 Q24 21 31 23 Q24 26 17 23 Z" fill="currentColor" stroke="none" />
        <path d="M19 27 Q24 29 29 27" />
      </>
    ),
    goatee: (
      <>
        {lowerFace}
        <path d="M18 23 Q24 21 30 23 Q24 25 18 23 Z" fill="currentColor" stroke="none" />
        <path d="M21 29 Q24 36 27 29 Q24 31 21 29 Z" fill="currentColor" stroke="none" />
      </>
    ),
    'short-beard': (
      <>
        {lowerFace}
        <path d="M13 22 Q14 33 24 37 Q34 33 35 22 Q24 27 13 22 Z" fill="currentColor" stroke="none" opacity="0.55" />
        <path d="M18 24 Q24 26 30 24" stroke="currentColor" />
      </>
    ),
    'full-beard': (
      <>
        {lowerFace}
        <path d="M12 20 Q13 34 24 38 Q35 34 36 20 Q24 26 12 20 Z" fill="currentColor" stroke="none" />
        <path d="M18 23 Q24 21 30 23 Q24 25 18 23 Z" fill="currentColor" stroke="none" />
      </>
    ),
  },

  facialHairDensity: {
    patchy: (
      <>
        {lowerFace}
        {[
          [16, 26],
          [21, 30],
          [27, 30],
          [32, 26],
          [24, 33],
          [19, 24],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
    medium: (
      <>
        {lowerFace}
        <path d="M14 23 Q15 33 24 37 Q33 33 34 23 Q24 27 14 23 Z" fill="currentColor" stroke="none" opacity="0.5" />
      </>
    ),
    full: (
      <>
        {lowerFace}
        <path d="M12 20 Q13 34 24 38 Q35 34 36 20 Q24 26 12 20 Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
};
