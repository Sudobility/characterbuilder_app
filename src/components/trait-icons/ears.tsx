import type { ReactNode } from 'react';

/**
 * Line-art for EAR traits (0 0 48 48, currentColor). A single ear, front-ish,
 * with helix outline + antihelix fold; traits vary the outline, lobe, protrusion
 * gap, and add Darwin's tubercle.
 */

// Inner antihelix fold, shared.
const fold = <path d="M22 18 C19 20 19 27 22 30" />;

export const earIcons: Record<string, Record<string, ReactNode>> = {
  earSize: {
    small: (
      <>
        <path d="M22 18 C17 18 17 26 21 31 C23 33 26 32 27 30" />
        <path d="M23 21 C21 23 21 27 23 29" />
      </>
    ),
    medium: (
      <>
        <path d="M22 14 C14 14 14 26 20 33 C23 36 28 34 29 31" />
        {fold}
      </>
    ),
    large: (
      <>
        <path d="M22 11 C12 11 12 27 19 36 C23 40 30 37 31 33" />
        <path d="M22 16 C18 19 18 29 22 33" />
      </>
    ),
  },

  earProtrusion: {
    flat: (
      <>
        <path d="M14 12 L14 36" opacity="0.4" />
        <path d="M22 14 C16 14 16 26 21 32 C23 34 27 33 28 31" />
        {fold}
      </>
    ),
    moderate: (
      <>
        <path d="M12 12 L12 36" opacity="0.4" />
        <path d="M24 14 C16 13 15 26 21 32 C24 35 29 33 30 30" />
        {fold}
      </>
    ),
    protruding: (
      <>
        <path d="M10 12 L10 36" opacity="0.4" />
        <path d="M27 14 C16 12 14 27 22 33 C26 36 32 33 33 29" />
        <path d="M25 18 C21 21 21 28 24 31" />
      </>
    ),
  },

  earlobe: {
    attached: (
      <>
        <path d="M22 14 C14 14 14 27 20 32 L24 36" />
        {fold}
      </>
    ),
    free: (
      <>
        <path d="M22 14 C14 14 14 26 20 32 C19 36 25 37 25 32" />
        {fold}
      </>
    ),
  },

  earShape: {
    round: (
      <>
        <path d="M22 13 C13 13 13 27 20 34 C23 37 29 35 30 31" />
        {fold}
      </>
    ),
    oval: (
      <>
        <path d="M22 12 C15 12 15 28 20 34 C23 37 28 35 29 31" />
        {fold}
      </>
    ),
    square: (
      <>
        <path d="M16 13 L28 13 L29 30 Q28 34 23 34 L18 33 L16 30 Z" />
        <path d="M21 18 C19 21 19 27 21 30" />
      </>
    ),
    pointed: (
      <>
        <path d="M24 11 L27 16 C28 24 27 31 22 34 C19 36 15 33 15 27 C15 19 18 13 24 11 Z" />
        {fold}
      </>
    ),
  },

  darwinsTubercle: {
    absent: (
      <>
        <path d="M22 14 C14 14 14 26 20 33 C23 36 28 34 29 31" />
        {fold}
      </>
    ),
    present: (
      <>
        <path d="M22 14 C14 14 14 26 20 33 C23 36 28 34 29 31" />
        {fold}
        <path d="M27 18 q3 0.5 1.5 3" />
      </>
    ),
  },
};
