import { FeaturePage } from './models';

/**
 * Single source of truth for the playground. Drives the sidebar, breadcrumbs,
 * the ⌘K command palette, and prev/next navigation. Add a page = add an entry.
 */
export const FEATURES: FeaturePage[] = [
  // ── Getting Started ────────────────────────────────────────────────
  {
    id: 'overview', route: '', title: 'Overview', group: 'Getting Started', icon: '◇',
    description: 'The component at a glance and how this explorer is organized.',
    tags: ['intro', 'tour', 'getting started'],
    load: () => import('../pages/overview/overview.component').then((m) => m.OverviewComponent),
  },
  {
    id: 'quickstart', route: 'quickstart', title: 'Quick Start & Embed', group: 'Getting Started', icon: '▸',
    description: 'Drop the component in, size the container, embed inline or full-page.',
    tags: ['pdfSrc', 'viewerId', 'inline', 'embed', 'container'],
    load: () => import('../pages/quickstart/quickstart.component').then((m) => m.QuickStartComponent),
  },
  {
    id: 'sources', route: 'sources', title: 'PDF Sources', group: 'Getting Started', icon: '⛁', badge: '6',
    description: 'Load from URL, relative path, Blob, Uint8Array, base64, file upload, or a new tab.',
    tags: ['pdfSrc', 'Blob', 'Uint8Array', 'base64', 'file upload', 'externalWindow'],
    load: () => import('../pages/sources/sources.component').then((m) => m.SourcesComponent),
  },

  // ── Viewer UI ──────────────────────────────────────────────────────
  {
    id: 'toolbar', route: 'toolbar', title: 'Toolbar & Controls', group: 'Viewer UI', icon: '▦',
    description: 'Toggle individual buttons and whole toolbar/sidebar groups.',
    tags: ['showDownload', 'showPrint', 'showFind', 'showFullScreen', 'showSidebar', 'showToolbarLeft'],
    load: () => import('../pages/toolbar/toolbar.component').then((m) => m.ToolbarComponent),
  },
  {
    id: 'navigation', route: 'navigation', title: 'Navigation & View Modes', group: 'Viewer UI', icon: '⤢',
    description: 'Drive page, zoom, cursor, scroll, spread, page mode and rotation — all two-way bound.',
    tags: ['page', 'zoom', 'cursor', 'scroll', 'spread', 'pageMode', 'rotation', 'namedDest'],
    load: () => import('../pages/navigation/navigation.component').then((m) => m.NavigationComponent),
  },
  {
    id: 'theming', route: 'theming', title: 'Theming & Appearance', group: 'Viewer UI', icon: '◑',
    description: 'Recolor the viewer to your brand: theme, colors, radius, custom CSS, density and positions.',
    tags: ['theme', 'primaryColor', 'backgroundColor', 'borderRadius', 'customCSS', 'toolbarDensity', 'sidebarPosition'],
    load: () => import('../pages/theming/theming.component').then((m) => m.ThemingComponent),
  },

  // ── Behavior ───────────────────────────────────────────────────────
  {
    id: 'auto-actions', route: 'auto-actions', title: 'Auto Actions', group: 'Behavior', icon: '⚙',
    description: 'Auto download/print on load, rotate, jump to the last page, set the download filename.',
    tags: ['downloadOnLoad', 'printOnLoad', 'rotateCW', 'rotateCCW', 'showLastPageOnLoad', 'downloadFileName'],
    load: () => import('../pages/auto-actions/auto-actions.component').then((m) => m.AutoActionsComponent),
  },
  {
    id: 'loading', route: 'loading', title: 'Loading & Spinners', group: 'Behavior', icon: '◴',
    description: 'Toggle the spinner, swap spinner CSS classes, and provide custom loading templates.',
    tags: ['showSpinner', 'spinnerClass', 'customSpinnerTpl'],
    load: () => import('../pages/loading/loading.component').then((m) => m.LoadingComponent),
  },
  {
    id: 'errors', route: 'errors', title: 'Error Handling', group: 'Behavior', icon: '⚠',
    description: 'Override error messages, append context, validate URLs, and render custom error UI.',
    tags: ['errorOverride', 'errorAppend', 'errorMessage', 'customErrorTpl', 'urlValidation'],
    load: () => import('../pages/errors/errors.component').then((m) => m.ErrorsComponent),
  },
  {
    id: 'localization', route: 'localization', title: 'Localization', group: 'Behavior', icon: '⌘',
    description: 'Switch the viewer locale and watch the UI translate.',
    tags: ['locale', 'i18n'],
    load: () => import('../pages/localization/localization.component').then((m) => m.LocalizationComponent),
  },

  // ── Integration ────────────────────────────────────────────────────
  {
    id: 'events', route: 'events', title: 'Events & Console', group: 'Integration', icon: '⚡', badge: '19',
    description: 'A live feed of all 19 viewer events with counts and filtering.',
    tags: ['onDocumentLoad', 'onPageChange', 'onFind', 'onOutlineLoaded', 'onMetadataLoaded', 'events'],
    load: () => import('../pages/events/events.component').then((m) => m.EventsComponent),
  },
  {
    id: 'config-objects', route: 'config-objects', title: 'Config Objects', group: 'Integration', icon: '{}',
    description: 'The convenience setters: configure the viewer with grouped config objects.',
    tags: ['controlVisibility', 'autoActions', 'viewerConfig', 'themeConfig', 'groupVisibility', 'layoutConfig'],
    load: () => import('../pages/config-objects/config-objects.component').then((m) => m.ConfigObjectsComponent),
  },
  {
    id: 'api', route: 'api', title: 'API & Inspector', group: 'Integration', icon: '⟨⟩',
    description: 'Call imperative methods and watch a live property inspector of the viewer state.',
    tags: ['refresh', 'triggerDownload', 'goToPage', 'inspector', 'ViewChild'],
    load: () => import('../pages/api/api.component').then((m) => m.ApiComponent),
  },
];

export function featureByRoute(route: string): FeaturePage | undefined {
  return FEATURES.find((f) => f.route === route);
}
