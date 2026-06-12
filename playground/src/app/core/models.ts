import { Type } from '@angular/core';

/** A bindable input we render into the live <ng2-pdfjs-viewer> and into generated code. */
export interface CodeBinding {
  name: string;
  /** current value */
  value: string | number | boolean;
  kind: 'string' | 'number' | 'boolean' | 'expr';
  /** render as [(name)] two-way binding */
  twoWay?: boolean;
  /** when value equals this, omit from generated code (keeps snippets minimal) */
  omitWhen?: string | number | boolean;
}

export type FeatureGroup =
  | 'Getting Started'
  | 'Viewer UI'
  | 'Editing & AI'
  | 'Behavior'
  | 'Integration';

export const FEATURE_GROUPS: FeatureGroup[] = [
  'Getting Started',
  'Viewer UI',
  'Editing & AI',
  'Behavior',
  'Integration',
];

export interface FeaturePage {
  id: string;
  route: string;
  title: string;
  group: FeatureGroup;
  /** single-glyph icon for the sidebar / palette */
  icon: string;
  /** one-line description for the page header + palette */
  description: string;
  /** input/event names this page showcases — also indexed by the command palette */
  tags: string[];
  /** lazily-loaded standalone component */
  load: () => Promise<Type<unknown>>;
  /** optional count badge (e.g. number of events) */
  badge?: string;
}

export interface SamplePdf {
  id: string;
  label: string;
  /** path under assets, or remote url */
  src: string;
  note: string;
}
