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
    description: 'Toggle individual buttons and whole toolbar/sidebar groups, or go chromeless for an embedded pages-only view.',
    tags: ['chromeless', 'embedded', 'showDownload', 'showPrint', 'showFind', 'showFullScreen', 'showSidebar', 'showToolbarLeft'],
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

  // ── Editing & AI ───────────────────────────────────────────────────
  {
    id: 'editor', route: 'editor', title: 'Annotation Editor & eSign', group: 'Editing & AI', icon: '✎', badge: 'new',
    description: 'Highlight, draw, type, stamp and sign — then serialize annotations or download the edited PDF.',
    tags: ['annotationEditor', 'enableSignatureEditor', 'enableCommentEditor', 'getAnnotations', 'getDocumentAsBlob', 'onAnnotationEditorStateChange'],
    load: () => import('../pages/editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    id: 'search', route: 'search', title: 'Programmatic Search', group: 'Editing & AI', icon: '⌕', badge: 'new',
    description: 'Run queries from code and get totals, per-page counts and the selection position back as data.',
    tags: ['search', 'searchNext', 'searchPrevious', 'clearSearch', 'SearchResult'],
    load: () => import('../pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    id: 'forms', route: 'forms', title: 'Forms & Data', group: 'Editing & AI', icon: '⍞', badge: 'new',
    description: 'Two-way AcroForm binding: fill fields from Angular, read user input back, save the filled PDF.',
    tags: ['formData', 'getFormData', 'setFormField', 'AcroForm'],
    load: () => import('../pages/forms/forms.component').then((m) => m.FormsComponent),
  },
  {
    id: 'ai', route: 'ai', title: 'AI Assistant & Read Aloud', group: 'Editing & AI', icon: '✦', badge: 'new',
    description: 'Chat with the document via your own OpenAI-compatible endpoint, and read it aloud with browser speech.',
    tags: ['getDocumentText', 'PdfAiAssistant', 'startReadAloud', 'onReadAloudStateChange', 'AI', 'chat'],
    load: () => import('../pages/ai/ai.component').then((m) => m.AiComponent),
  },

  // ── Behavior ───────────────────────────────────────────────────────
  {
    id: 'protection', route: 'protection', title: 'Content Protection', group: 'Behavior', icon: '▣', badge: 'new',
    description: 'Block print/save, disable text selection, and watermark every page (deterrence, not DRM).',
    tags: ['contentProtection', 'watermark', 'blockPrint', 'blockDownload', 'disableTextSelection'],
    load: () => import('../pages/protection/protection.component').then((m) => m.ProtectionComponent),
  },
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
    description: 'Override error messages, append context, validate URLs, render custom error UI, and handle password-protected documents.',
    tags: ['errorOverride', 'errorAppend', 'errorMessage', 'customErrorTpl', 'urlValidation', 'onPasswordPrompt'],
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
  {
    id: 'signals', route: 'signals', title: 'Signals (zoneless / OnPush)', group: 'Integration', icon: '∿', badge: 'new',
    description: 'Read viewer state as read-only Angular signals — page, zoom, totals, search matches — for zoneless and OnPush apps.',
    tags: ['signals', 'pdfViewerSignals', 'zoneless', 'OnPush', 'computed', 'toSignal'],
    load: () => import('../pages/signals/signals.component').then((m) => m.SignalsComponent),
  },
  {
    id: 'custom-ui', route: 'custom-ui', title: 'Custom Toolbar & Overlays', group: 'Viewer UI', icon: '⊞', badge: 'new',
    description: 'Replace the toolbar with your own Angular template and project templates onto every page.',
    tags: ['customToolbarTpl', 'pageOverlayTpl', 'showToolbar', 'headless'],
    load: () => import('../pages/custom-ui/custom-ui.component').then((m) => m.CustomUiComponent),
  },
  {
    id: 'power', route: 'power', title: 'Power Options', group: 'Integration', icon: '⚡', badge: 'new',
    description: 'Page organization, true dark pages, session restore, link targets, PDF.js options, auth loading.',
    tags: ['enablePageEditing', 'pageColors', 'rememberLastView', 'externalLinkTarget', 'pdfJsOptions', 'httpHeaders', 'onPagesEdited'],
    load: () => import('../pages/power/power.component').then((m) => m.PowerComponent),
  },
];

export function featureByRoute(route: string): FeaturePage | undefined {
  return FEATURES.find((f) => f.route === route);
}
