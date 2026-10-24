import type { ReactNode } from 'react';
import {
  FEATURE_GROUPS,
  type FeatureGroup,
  type FeatureMeta,
} from '@sudobility/characterbuilder_lib';
import type { FaceSpec } from '@sudobility/characterbuilder_types';
import { TraitOption } from './trait-icons';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Heading,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextArea,
} from '../ui';

const UNSET = '__unset__';

type SetFeature = (key: keyof FaceSpec, value: unknown) => void;

function EnumField(props: {
  meta: FeatureMeta;
  value: string | undefined;
  set: SetFeature;
}) {
  const { meta, value, set } = props;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={meta.key as string}>{meta.label}</Label>
      <Select
        value={value ?? undefined}
        onValueChange={(v) => set(meta.key, v === UNSET ? undefined : v)}
      >
        <SelectTrigger id={meta.key as string} className="w-full">
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>Any</SelectItem>
          {meta.options!.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <TraitOption trait={meta.key} value={o.value} label={o.label} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MultiField(props: {
  meta: FeatureMeta;
  value: string[] | undefined;
  set: SetFeature;
}) {
  const { meta, value, set } = props;
  const selected = value ?? [];
  const toggle = (v: string, on: boolean) => {
    const next = on ? [...selected, v] : selected.filter((x) => x !== v);
    set(meta.key, next.length ? next : undefined);
  };
  return (
    <div className="flex flex-col gap-1">
      <Label>{meta.label}</Label>
      <div className="flex flex-wrap gap-3">
        {meta.options!.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(o.value)}
              onChange={(on) => toggle(o.value, on)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function TextField(props: {
  meta: FeatureMeta;
  value: string | undefined;
  set: SetFeature;
}) {
  const { meta, value, set } = props;
  const multiline = meta.key === 'extraNotes';
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={meta.key as string}>{meta.label}</Label>
      {multiline ? (
        <TextArea
          value={value ?? ''}
          onChange={(v) => set(meta.key, v || undefined)}
          className="min-h-20"
        />
      ) : (
        <Input
          id={meta.key as string}
          value={value ?? ''}
          placeholder={meta.placeholder}
          onChange={(e) => set(meta.key, e.target.value || undefined)}
        />
      )}
    </div>
  );
}

function NumberField(props: {
  meta: FeatureMeta;
  value: number | undefined;
  set: SetFeature;
}) {
  const { meta, value, set } = props;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={meta.key as string}>{meta.label}</Label>
      <Input
        id={meta.key as string}
        type="number"
        min={meta.min}
        max={meta.max}
        value={value ?? ''}
        onChange={(e) =>
          set(meta.key, e.target.value === '' ? undefined : Number(e.target.value))
        }
      />
    </div>
  );
}

/**
 * One FEATURE_GROUP as a titled card of controls. `extra` injects an app-owned
 * control below the grid (e.g. the hierarchical ancestry picker under "Who they
 * are"). Used both by the full form and, one at a time, by the wizard editor.
 */
export function FaceSpecGroupCard(props: {
  group: FeatureGroup;
  spec: FaceSpec;
  set: SetFeature;
  extra?: ReactNode;
}) {
  const { group, spec, set, extra } = props;
  return (
    <Card>
      <CardHeader>
        <Heading level={3} size="lg">
          {group.title}
        </Heading>
        {group.blurb && (
          <Text as="p" size="sm" className="text-theme-text-secondary">
            {group.blurb}
          </Text>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.features.map((meta) => {
            const value = spec[meta.key];
            if (meta.kind === 'enum')
              return (
                <EnumField
                  key={meta.key as string}
                  meta={meta}
                  value={value as string | undefined}
                  set={set}
                />
              );
            if (meta.kind === 'multi')
              return (
                <MultiField
                  key={meta.key as string}
                  meta={meta}
                  value={value as string[] | undefined}
                  set={set}
                />
              );
            if (meta.kind === 'number')
              return (
                <NumberField
                  key={meta.key as string}
                  meta={meta}
                  value={value as number | undefined}
                  set={set}
                />
              );
            return (
              <TextField
                key={meta.key as string}
                meta={meta}
                value={value as string | undefined}
                set={set}
              />
            );
          })}
        </div>
        {extra && <div className="mt-4">{extra}</div>}
      </CardContent>
    </Card>
  );
}

/**
 * Renders the whole comprehensive FaceSpec editor from FEATURE_GROUPS. `extras`
 * injects app-owned controls (keyed by group id) below that group's fields —
 * e.g. the hierarchical ancestry picker under "Who they are".
 */
export function FaceSpecForm(props: {
  spec: FaceSpec;
  set: SetFeature;
  extras?: Partial<Record<string, ReactNode>>;
}) {
  const { spec, set, extras } = props;
  return (
    <div className="flex flex-col gap-4">
      {FEATURE_GROUPS.map((group) => (
        <FaceSpecGroupCard
          key={group.id}
          group={group}
          spec={spec}
          set={set}
          extra={extras?.[group.id]}
        />
      ))}
    </div>
  );
}
