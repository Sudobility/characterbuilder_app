import type { ReactNode } from 'react';

/**
 * Shared front head/face outline used by the structure, cheeks and jaw families.
 * Half-widths at temple/cheek/jaw/chin; T = hairline y, K = chin y; `chin` picks
 * the chin terminal shape. Returns an SVG path `d` string on the 0 0 48 48 canvas.
 */
export function head({
  TW = 15,
  CW = 16,
  JW = 13,
  KW = 7,
  T = 9,
  K = 42,
  chin = 'round',
}: {
  TW?: number;
  CW?: number;
  JW?: number;
  KW?: number;
  T?: number;
  K?: number;
  chin?: string;
}): string {
  const C = T + (K - T) * 0.4;
  const J = T + (K - T) * 0.74;
  const L = (w: number) => 24 - w;
  const R = (w: number) => 24 + w;
  const chinSeg: Record<string, string> = {
    round: `C${L(JW)} ${J + (K - J) * 0.7} ${L(KW)} ${K} 24 ${K} C${R(KW)} ${K} ${R(JW)} ${J + (K - J) * 0.7} ${R(JW)} ${J}`,
    pointed: `L${L(KW * 0.45)} ${K - 1} L24 ${K} L${R(KW * 0.45)} ${K - 1} L${R(JW)} ${J}`,
    square: `L${L(KW)} ${K} L${R(KW)} ${K} L${R(JW)} ${J}`,
    broad: `C${L(JW)} ${K} ${L(KW)} ${K} 24 ${K} C${R(KW)} ${K} ${R(JW)} ${K} ${R(JW)} ${J}`,
  };
  return (
    `M${L(TW)} ${T} ` +
    `C${L(TW)} ${T + (C - T) * 0.35} ${L(CW)} ${C - 5} ${L(CW)} ${C} ` +
    `C${L(CW)} ${C + (J - C) * 0.5} ${L(JW)} ${J - 5} ${L(JW)} ${J} ` +
    `${chinSeg[chin] ?? chinSeg.round} ` +
    `C${R(JW)} ${J - 5} ${R(CW)} ${C + (J - C) * 0.5} ${R(CW)} ${C} ` +
    `C${R(CW)} ${C - 5} ${R(TW)} ${T + (C - T) * 0.35} ${R(TW)} ${T} ` +
    `Q24 ${T - 4} ${L(TW)} ${T} Z`
  );
}

/** Head outline as a faint reference layer, for overlaying a highlighted feature. */
export const ghostHead = (opts: Parameters<typeof head>[0] = {}): ReactNode => (
  <path d={head(opts)} opacity="0.4" />
);

export const Head = (opts: Parameters<typeof head>[0]): ReactNode => (
  <path d={head(opts)} />
);
