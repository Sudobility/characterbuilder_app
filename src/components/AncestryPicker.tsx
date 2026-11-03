import { useMemo } from 'react';
import {
  ANCESTRY_FOREST,
  type AncestryNode,
} from '@sudobility/characterbuilder_types';
import { Combobox, Label, type ComboboxOption } from '../ui';

// The combobox needs a non-empty value for "any".
const ANY = '__any__';

type Row = { node: AncestryNode; depth: number };
type Index = {
  byId: Map<string, AncestryNode>;
  parent: Map<string, string>; // child id → parent id
  rows: Row[]; // pre-order flatten, for the indented searchable list
};

function buildIndex(forest: AncestryNode[]): Index {
  const byId = new Map<string, AncestryNode>();
  const parent = new Map<string, string>();
  const rows: Row[] = [];
  const walk = (n: AncestryNode, depth: number, parentId?: string) => {
    byId.set(n.id, n);
    if (parentId) parent.set(n.id, parentId);
    rows.push({ node: n, depth });
    n.children?.forEach((c) => walk(c, depth + 1, n.id));
  };
  forest.forEach((n) => walk(n, 0));
  return { byId, parent, rows };
}

/** The ancestor chain (root → node) for a node id, used to reconstruct `path`. */
function pathFor(id: string, index: Index): string[] {
  const chain: string[] = [];
  let cur: string | undefined = id;
  while (cur) {
    chain.unshift(cur);
    cur = index.parent.get(cur);
  }
  return chain;
}

/** The label of the deepest chosen node in a path (undefined = "any"). */
export function pathLabel(path: string[], index?: Index): string | undefined {
  const idx = index ?? buildIndex(ANCESTRY_FOREST);
  const last = path[path.length - 1];
  return last ? idx.byId.get(last)?.label : undefined;
}

/**
 * Resolve a describe-inferred ancestry to a picker `path`, so the Ethnicity
 * control (and the casting it drives) reflect what the prompt said. Tries the
 * specific sub-population note ("Chinese") first, then the broad ancestry enum
 * ("east-asian"), matching a taxonomy node by id / label / alias (case- and
 * separator-insensitive). Returns `[]` when nothing matches (picker stays "Any").
 */
export function pathForAncestry(ancestry?: string, note?: string): string[] {
  const index = buildIndex(ANCESTRY_FOREST);
  const norm = (s: string) => s.trim().toLowerCase();
  const slug = (s: string) => norm(s).replace(/\s+/g, '-');
  const find = (q?: string): AncestryNode | undefined => {
    if (!q) return undefined;
    const n = norm(q);
    const s = slug(q);
    for (const { node } of index.rows) {
      if (norm(node.id) === n || norm(node.id) === s) return node;
      if (norm(node.label) === n) return node;
      if (node.aliases?.some((a) => norm(a) === n || slug(a) === s)) return node;
    }
    return undefined;
  };
  const node = find(note) ?? find(ancestry);
  return node ? pathFor(node.id, index) : [];
}

/**
 * Demographic picker: one searchable combobox listing the whole taxonomy,
 * indented to show the parent/child hierarchy (Asian › East Asian › Chinese →
 * Northern Chinese). Type to filter by name, or scroll the tree. Choosing a
 * broad node (a stem) resolves to a random concrete sub-population at generation
 * time; a specific group is used directly. `path` is the chosen node's ancestor
 * chain from the root down (empty = "any").
 */
export function AncestryPicker(props: {
  label: string;
  path: string[];
  onChange: (path: string[]) => void;
}) {
  const index = useMemo(() => buildIndex(ANCESTRY_FOREST), []);
  const value = props.path[props.path.length - 1] ?? ANY;

  // Flatten to combobox options, indenting labels so the hierarchy reads in the
  // list. The leading (non-breaking) indent does not interfere with name search.
  const options = useMemo<ComboboxOption[]>(() => {
    const opts: ComboboxOption[] = [{ value: ANY, label: 'Any demographic' }];
    for (const { node, depth } of index.rows) {
      const indent = '  '.repeat(depth);
      const marker = depth > 0 ? '› ' : '';
      opts.push({ value: node.id, label: `${indent}${marker}${node.label}` });
    }
    return opts;
  }, [index]);

  const pick = (id: string) => {
    props.onChange(id === ANY ? [] : pathFor(id, index));
  };

  return (
    <div className="flex flex-col gap-1">
      <Label>{props.label}</Label>
      <Combobox
        options={options}
        value={value}
        onChange={pick}
        placeholder="Any demographic"
        searchPlaceholder="Search country or region…"
        emptyMessage="No match"
        className="w-full"
      />
    </div>
  );
}
