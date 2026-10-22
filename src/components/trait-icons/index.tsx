import type { ReactNode } from 'react';
import type { FaceSpec } from '@sudobility/characterbuilder_types';
import { cn } from '../../ui';
import { eyeIcons } from './eyes';
import { faceIcons } from './face';
import { browIcons } from './eyebrows';
import { noseIcons } from './nose';
import { mouthIcons } from './mouth';
import { structureIcons } from './structure';
import { cheekIcons } from './cheeks';
import { earIcons } from './ears';
import { jawIcons } from './jaw';
import { colorIcons } from './colors';
import { teethIcons } from './teeth';
import { skinIcons } from './skin';
import { hairIcons } from './hair';
import { eye2Icons } from './eyes2';
import { miscIcons } from './misc';

/**
 * Registry of detailed line-art for FaceSpec trait options, keyed by trait → option
 * value. Built family-by-family; a trait/option with no art simply renders no icon.
 * Every glyph is the inner SVG of a 0 0 48 48 canvas, stroked in `currentColor` so
 * it adapts to the active (light/dark) theme.
 */
const REGISTRY: Partial<Record<keyof FaceSpec, Record<string, ReactNode>>> = {
  ...(eyeIcons as Record<string, Record<string, ReactNode>>),
  ...(faceIcons as Record<string, Record<string, ReactNode>>),
  ...(browIcons as Record<string, Record<string, ReactNode>>),
  ...(noseIcons as Record<string, Record<string, ReactNode>>),
  ...(mouthIcons as Record<string, Record<string, ReactNode>>),
  ...(structureIcons as Record<string, Record<string, ReactNode>>),
  ...(cheekIcons as Record<string, Record<string, ReactNode>>),
  ...(earIcons as Record<string, Record<string, ReactNode>>),
  ...(jawIcons as Record<string, Record<string, ReactNode>>),
  ...(teethIcons as Record<string, Record<string, ReactNode>>),
  ...(skinIcons as Record<string, Record<string, ReactNode>>),
  ...(hairIcons as Record<string, Record<string, ReactNode>>),
  ...(eye2Icons as Record<string, Record<string, ReactNode>>),
  ...(miscIcons as Record<string, Record<string, ReactNode>>),
  // Colors last so swatches win for any trait also keyed elsewhere.
  ...(colorIcons as Record<string, Record<string, ReactNode>>),
};

export function hasTraitIcon(trait: keyof FaceSpec, value: string): boolean {
  return Boolean(REGISTRY[trait]?.[value]);
}

/**
 * Hybrid coloring: each line-art FAMILY gets a tasteful, anatomically-evocative
 * accent (applied as the svg's `color`, which its `currentColor` strokes/fills
 * resolve to). Mid-tone hues so they read on both light and dark themes. The real
 * color-swatch traits (hair/iris/skin/teeth colour) are left out — their nodes
 * fill with the actual colour and shouldn't be tinted.
 */
const FAMILY_ACCENT: Partial<Record<keyof FaceSpec, string>> = {};
const tint = (icons: Record<string, unknown>, color: string) => {
  for (const key of Object.keys(icons)) {
    FAMILY_ACCENT[key as keyof FaceSpec] = color;
  }
};
tint(eyeIcons, '#6ba4cf'); //  eyes — blue
tint(eye2Icons, '#6ba4cf');
tint(browIcons, '#9a7249'); // brows — brown
tint(noseIcons, '#cf9f6f'); // nose — skin tan
tint(mouthIcons, '#d47a86'); // lips — warm pink
tint(structureIcons, '#93a0b5'); // bone — slate
tint(jawIcons, '#93a0b5');
tint(faceIcons, '#93a0b5');
tint(cheekIcons, '#cf9f8a'); // cheeks — rosy tan
tint(earIcons, '#c89a63'); // ears — amber
tint(teethIcons, '#a9b7c2'); // teeth — enamel
tint(skinIcons, '#cda079'); // skin — tan
tint(hairIcons, '#8a6a45'); // hair — brown
tint(miscIcons, '#9f93c4'); // demographics / individuating — soft violet
// Colour-swatch traits intentionally get no accent (they carry real colour).
for (const key of Object.keys(colorIcons)) delete FAMILY_ACCENT[key as keyof FaceSpec];

/** A trait option's illustration, or null when none exists yet. */
export function TraitIcon({
  trait,
  value,
  size = 22,
  className,
}: {
  trait: keyof FaceSpec;
  value: string;
  size?: number;
  className?: string;
}) {
  const node = REGISTRY[trait]?.[value];
  if (!node) return null;
  const accent = FAMILY_ACCENT[trait];
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn('shrink-0', !accent && 'text-theme-text-primary', className)}
      style={accent ? { color: accent } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {node}
    </svg>
  );
}

/**
 * A Select option's content: the trait illustration (when available) followed by
 * its label. Used inside `SelectItem`, whose children are mirrored into the trigger
 * by Radix, so the chosen option's icon shows there too.
 */
export function TraitOption({
  trait,
  value,
  label,
}: {
  trait: keyof FaceSpec;
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <TraitIcon trait={trait} value={value} />
      <span>{label}</span>
    </span>
  );
}
