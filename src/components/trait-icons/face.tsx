import type { ReactNode } from 'react';

/**
 * Face-outline silhouettes for FACE_SHAPES. Each is a closed outline on the
 * 0 0 48 48 canvas (hairline at top → chin at bottom), stroked in currentColor.
 */
export const faceIcons: Record<string, Record<string, ReactNode>> = {
  faceShape: {
    oval: (
      <path d="M24 6 C33 6 37 16 37 24 C37 35 31 43 24 43 C17 43 11 35 11 24 C11 16 15 6 24 6 Z" />
    ),
    round: (
      <path d="M24 7 C34 7 40 15 40 24 C40 34 34 41 24 41 C14 41 8 34 8 24 C8 15 14 7 24 7 Z" />
    ),
    square: (
      <path d="M13 10 L35 10 L35 31 Q35 41 24 41 Q13 41 13 31 Z" />
    ),
    rectangular: (
      <path d="M14 7 L34 7 L34 34 Q34 42 24 42 Q14 42 14 34 Z" />
    ),
    heart: (
      <path d="M11 15 Q11 8 17 8 Q22 8 24 12 Q26 8 31 8 Q37 8 37 15 C37 26 31 35 24 43 C17 35 11 26 11 15 Z" />
    ),
    diamond: (
      <path d="M24 6 Q31 14 38 24 Q31 34 24 43 Q17 34 10 24 Q17 14 24 6 Z" />
    ),
    triangle: (
      <path d="M18 9 Q24 7 30 9 L37 35 Q37 41 24 41 Q11 41 11 35 Z" />
    ),
    trapezoid: (
      <path d="M15 10 L33 10 L39 33 Q39 41 24 41 Q9 41 9 33 Z" />
    ),
  },
};
