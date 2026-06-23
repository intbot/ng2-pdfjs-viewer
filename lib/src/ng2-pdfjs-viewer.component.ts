import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ViewChild,
  EventEmitter,
  ElementRef,
  OnChanges,
  TemplateRef,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectorRef,
  ApplicationRef,
  EmbeddedViewRef,
  NgZone,
  isDevMode,
} from "@angular/core";

// Import extracted modules
import {
  ControlMessage,
  ControlResponse,
  ViewerAction,
  ActionExecutionResult,
  ChangedPage,
  ChangedScale,
  ChangedRotation,
  ControlVisibilityConfig,
  GroupVisibilityConfig,
  LayoutConfig,
  ToolbarDensity,
  ToolbarPosition,
  SidebarPosition,
  AutoActionConfig,
  ErrorConfig,
  ViewerConfig,
  ThemeConfig,
  DocumentError,
  PagesInfo,
  PresentationMode,
  FindOperation,
  FindMatchesCount,
  DocumentMetadata,
  DocumentOutline,
  PageRenderInfo,
  // New high-value events
  AnnotationLayerRenderEvent,
  BookmarkClick,
  ExternalLinkTarget,
  AnnotationEditorMode,
  AnnotationEditorState,
  SearchOptions,
  SearchResult,
  FormDataMap,
  ContentProtectionConfig,
  PagesEditedEvent,
  ReadAloudState,
  SidebarViewChange,
  LayersChange,
  NamedActionEvent,
  PdfSignatureStorage,
  DocumentPageText,
} from "./interfaces/ViewerTypes";
import { ActionQueueManager } from "./managers/ActionQueueManager";
import { PropertyTransformers } from "./utils/PropertyTransformers";
import {
  PdfAiAssistant,
  PdfAiMessage,
  PdfAiPanelConfig,
  PdfAiPanelMessage,
} from "ng2-pdfjs-viewer/ai";

// The iframe sandbox shipped on every viewer embed. allow-popups (+ escape)
// lets external PDF links open in a new, unsandboxed tab - the only link
// behavior that works without granting the document navigation rights over
// the host page.
//
// Honest scope: because the viewer is same-origin and needs allow-scripts +
// allow-same-origin, this sandbox is NOT a containment boundary against a
// compromised PDF.js (same-origin content can reach the parent document).
// It hardens link/navigation behavior of COOPERATIVE viewer code; defenses
// against hostile documents are PDF.js's own parsing/rendering isolation.
const BASE_IFRAME_SANDBOX =
  "allow-forms allow-scripts allow-same-origin allow-modals allow-downloads " +
  "allow-popups allow-popups-to-escape-sandbox";

// Tokens consumers may add via [iframeSandbox]. Deliberately excludes anything
// that would let viewer content reach outside a user-initiated navigation.
// Prefer 'allow-top-navigation-by-user-activation' over 'allow-top-navigation':
// the latter lets a hostile document redirect the whole host page without any
// user gesture (frame-phishing) - only use it with fully trusted documents.
const ALLOWED_EXTRA_SANDBOX_TOKENS: ReadonlySet<string> = new Set([
  "allow-top-navigation",
  "allow-top-navigation-by-user-activation",
  "allow-presentation",
]);

// #region Property registry (single source of truth)
// Maps every postMessage-backed input to its wrapper action, the minimum
// wrapper readiness level it needs, and how it participates in the
// initial-load snapshot:
//   'always'   - always sent at init
//   'truthy'   - sent when the value is truthy
//   'defined'  - sent when the value is not undefined
//   'true'     - sent only when the value is exactly true
//   'nonempty' - sent when the value is a non-blank string
//   false      - never sent at init (the property's setter dispatches itself,
//                or the value is consumed elsewhere)
interface PropertyRegistration {
  prop: string;
  action: string;
  level: number;
  init: "always" | "truthy" | "defined" | "true" | "nonempty" | false;
  payload?: (value: any, c: PdfJsViewerComponent) => any;
  get?: (c: PdfJsViewerComponent) => any;
}

const PROPERTY_REGISTRY: ReadonlyArray<PropertyRegistration> = [
  // Control visibility (DOM toggles)
  { prop: "showOpenFile", action: "show-openfile", level: 3, init: "always" },
  { prop: "showDownload", action: "show-download", level: 3, init: "always" },
  { prop: "showPrint", action: "show-print", level: 3, init: "always" },
  { prop: "showFullScreen", action: "show-fullscreen", level: 3, init: "always" },
  { prop: "showFind", action: "show-find", level: 3, init: "always" },
  { prop: "showViewBookmark", action: "show-bookmark", level: 3, init: "always" },
  { prop: "showAnnotations", action: "show-annotations", level: 3, init: "always" },

  // Toolbar/sidebar group visibility
  { prop: "showToolbarLeft", action: "show-toolbar-left", level: 3, init: "always" },
  { prop: "showToolbarMiddle", action: "show-toolbar-middle", level: 3, init: "always" },
  { prop: "showToolbarRight", action: "show-toolbar-right", level: 3, init: "always" },
  { prop: "showSecondaryToolbarToggle", action: "show-secondary-toolbar-toggle", level: 3, init: "always" },
  // chromeless forces both hidden while leaving the consumer's own
  // showToolbar/showSidebar bindings untouched (see the chromeless @Input).
  { prop: "showToolbar", action: "show-toolbar", level: 3, init: "always", get: (c) => c.showToolbar && !c.chromeless },
  { prop: "showSidebar", action: "show-sidebar", level: 3, init: "always", get: (c) => c.showSidebar && !c.chromeless },
  { prop: "showSidebarLeft", action: "show-sidebar-left", level: 3, init: "always" },
  { prop: "showSidebarRight", action: "show-sidebar-right", level: 3, init: "always" },

  // Layout & responsive customization
  { prop: "toolbarDensity", action: "set-toolbar-density", level: 4, init: "always" },
  { prop: "sidebarWidth", action: "set-sidebar-width", level: 4, init: "truthy" },
  { prop: "toolbarPosition", action: "set-toolbar-position", level: 4, init: "always" },
  { prop: "sidebarPosition", action: "set-sidebar-position", level: 4, init: "always" },
  { prop: "responsiveBreakpoint", action: "set-responsive-breakpoint", level: 4, init: "defined" },

  // Modes & navigation
  { prop: "cursor", action: "set-cursor", level: 4, init: "truthy" },
  { prop: "scroll", action: "set-scroll", level: 4, init: "truthy" },
  { prop: "spread", action: "set-spread", level: 4, init: "truthy" },
  { prop: "zoom", action: "set-zoom", level: 4, init: "truthy" },
  { prop: "pageMode", action: "update-page-mode", level: 4, init: "truthy" },
  { prop: "page", action: "set-page", level: 5, init: "truthy", get: (c) => (c as any)._page },
  { prop: "rotation", action: "set-rotation", level: 5, init: false },
  { prop: "namedDest", action: "go-to-named-dest", level: 5, init: "nonempty" },
  { prop: "rotateCW", action: "trigger-rotate-cw", level: 5, init: "true" },
  { prop: "rotateCCW", action: "trigger-rotate-ccw", level: 5, init: "true" },

  // Theme & visual customization (DOM-only, applies as soon as viewer loads)
  { prop: "theme", action: "set-theme", level: 1, init: "always", payload: (v) => v || "auto" },
  { prop: "primaryColor", action: "set-primary-color", level: 1, init: "truthy" },
  { prop: "backgroundColor", action: "set-background-color", level: 1, init: "truthy" },
  { prop: "pageBorderColor", action: "set-page-border-color", level: 1, init: "truthy" },
  { prop: "pageSpacing", action: "set-page-spacing", level: 3, init: "truthy" },
  { prop: "toolbarColor", action: "set-toolbar-color", level: 1, init: "truthy" },
  { prop: "textColor", action: "set-text-color", level: 1, init: "truthy" },
  { prop: "borderRadius", action: "set-border-radius", level: 1, init: "truthy" },
  {
    prop: "customCSS",
    action: "set-custom-css",
    level: 1,
    init: "truthy",
    payload: (v, c) => (c.cspNonce ? { css: v, nonce: c.cspNonce } : v),
  },

  // Misc configuration. downloadFileName is level 5 because PDF.js overwrites
  // its _contentDispositionFilename during document load.
  { prop: "useOnlyCssZoom", action: "set-css-zoom", level: 3, init: "defined" },
  // 'always': the embedded PDF.js default ('top') is sandbox-blocked, so the
  // component's 'blank' default must reach the viewer on every load.
  { prop: "externalLinkTarget", action: "set-external-link-target", level: 3, init: "always" },
  { prop: "rememberLastView", action: "set-remember-last-view", level: 3, init: "defined" },
  { prop: "downloadFileName", action: "set-download-filename", level: 5, init: "truthy" },
  { prop: "urlValidation", action: "set-url-validation", level: 3, init: false },
  { prop: "diagnosticLogs", action: "set-diagnostic-logs", level: 3, init: false },
  { prop: "highlightEditorColors", action: "set-highlight-editor-colors", level: 3, init: "nonempty" },
  // The hook object stays host-side; the wrapper only needs the on/off bit
  { prop: "signatureStorage", action: "set-signature-storage", level: 3, init: "truthy", payload: (v) => !!v },
  // Setter-dispatched at runtime; registry entry re-applies the active editor
  // after iframe reloads (pdfSrc change / refresh). 'none' is the PDF.js
  // default and never needs sending.
  {
    prop: "annotationEditor",
    action: "set-annotation-editor-mode",
    level: 5,
    init: "truthy",
    get: (c) =>
      (c as any)._annotationEditor === "none"
        ? undefined
        : (c as any)._annotationEditor,
  },
];

const REGISTRY_BY_PROP: Record<string, PropertyRegistration> = {};
const ACTION_READINESS: Record<string, number> = {
  // On-demand triggers without an owning property
  "trigger-download": 5,
  "trigger-print": 5,
  "go-to-last-page": 5,
  // Annotation editing + document queries need a loaded document
  "set-annotation-editor-mode": 5,
  "get-annotations": 5,
  "set-annotations": 5,
  "save-document": 5,
  "search": 5,
  "search-next": 5,
  "search-previous": 5,
  "clear-search": 5,
  // Forms need field objects from the loaded document
  "get-form-data": 5,
  "set-form-data": 5,
  "set-form-field": 5,
  // Content protection is DOM-level
  "set-content-protection": 3,
  "set-watermark": 3,
  // Text extraction + read-aloud need the document
  "get-document-text": 5,
  "read-aloud": 5,
};
for (const entry of PROPERTY_REGISTRY) {
  REGISTRY_BY_PROP[entry.prop] = entry;
  ACTION_READINESS[entry.action] = entry.level;
}

// Wrapper-side event notifications enabled at init. All @Output emitters exist
// unconditionally, so these are enabled unconditionally; 'enable-idle' is the
// exception (it installs document-wide activity listeners in the iframe) and
// is only sent when the consumer actually subscribed to (onIdle).
const ENABLE_EVENT_ACTIONS: ReadonlyArray<string> = [
  "enable-before-print",
  "enable-after-print",
  "enable-pages-loaded",
  "enable-page-change",
  "enable-document-error",
  "enable-document-init",
  "enable-pages-init",
  "enable-presentation-mode-changed",
  "enable-open-file",
  "enable-find",
  "enable-update-find-matches-count",
  "enable-metadata-loaded",
  "enable-outline-loaded",
  "enable-page-rendered",
  "enable-annotation-layer-rendered",
  "enable-bookmark-click",
  "enable-sidebar-view-changed",
  "enable-layers-changed",
  "enable-named-action",
  "enable-document-properties",
];

// Properties whose setters dispatch on their own - skipped in ngOnChanges to
// avoid a second postMessage per change
const SETTER_DISPATCHED_PROPS = new Set([
  "zoom",
  "rotation",
  "cursor",
  "scroll",
  "spread",
  "pageMode",
  "page",
  "diagnosticLogs",
  "annotationEditor",
  "formData",
  "contentProtection",
]);

// Auto-actions are read at the next document load; changing them mid-session
// dispatches nothing
const DOCUMENT_LOAD_PROPS = new Set([
  "downloadOnLoad",
  "printOnLoad",
  "showLastPageOnLoad",
]);

// Config-object inputs fan out to the individual properties their setters
// populate, so post-init changes propagate to the viewer (they used to be
// silently dropped after init)
const CONFIG_FANOUT: Record<string, ReadonlyArray<string>> = {
  controlVisibility: [
    "showDownload", "showPrint", "showFind", "showFullScreen",
    "showOpenFile", "showViewBookmark", "showAnnotations",
  ],
  groupVisibility: [
    "showToolbarLeft", "showToolbarMiddle", "showToolbarRight",
    "showSecondaryToolbarToggle", "showSidebar", "showSidebarLeft", "showSidebarRight",
  ],
  layoutConfig: [
    "toolbarDensity", "sidebarWidth", "toolbarPosition",
    "sidebarPosition", "responsiveBreakpoint",
  ],
  themeConfig: [
    "theme", "primaryColor", "backgroundColor", "pageBorderColor",
    "pageSpacing", "toolbarColor", "textColor", "borderRadius", "customCSS",
  ],
  viewerConfig: ["useOnlyCssZoom", "externalLinkTarget", "rememberLastView"],
  autoActions: ["rotateCW", "rotateCCW"],
  errorHandling: [],
  // chromeless is a preset, not a config object, but it reuses the fanout so a
  // runtime toggle re-dispatches the (get-overridden) toolbar/sidebar actions.
  chromeless: ["showToolbar", "showSidebar"],
};

function hasObservers(emitter: EventEmitter<any>): boolean {
  return (
    (emitter as any).observed === true ||
    ((emitter as any).observers?.length ?? 0) > 0
  );
}

// Config-object inputs are commonly bound to getters that return a FRESH
// object every change-detection cycle. Reference identity then flags a
// "change" each cycle - only the content matters.
// (Exported for unit tests; not part of the public package API.)
export function shallowEquals(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length && aKeys.every((k) => a[k] === b[k])
  );
}
// #endregion

@Component({
  selector: "ng2-pdfjs-viewer",
  standalone: false,
  styles: [
    `
      /* Main container styling */
      .ng2-pdfjs-viewer-container {
        position: relative;
        width: 100%;
        height: 100%;
      }

      /* Custom host toolbar stacks above the iframe */
      .ng2-pdfjs-viewer-container.ng2-has-custom-toolbar {
        display: flex;
        flex-direction: column;
      }

      .ng2-pdfjs-viewer-container.ng2-has-custom-toolbar iframe {
        flex: 1 1 auto;
        min-height: 0;
      }

      .ng2-pdfjs-custom-toolbar {
        flex: 0 0 auto;
      }

      /* Custom host sidebar sits beside the iframe; with a custom toolbar
         too, the toolbar spans the full width above both. Grid (not flex)
         so the DOM stays flat and the iframe is never re-created. */
      .ng2-pdfjs-viewer-container.ng2-has-custom-sidebar {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          'toolbar toolbar'
          'sidebar viewer';
      }

      .ng2-pdfjs-viewer-container.ng2-has-custom-sidebar .ng2-pdfjs-custom-toolbar {
        grid-area: toolbar;
      }

      .ng2-pdfjs-custom-sidebar {
        grid-area: sidebar;
        min-height: 0;
        overflow: auto;
      }

      .ng2-pdfjs-viewer-container.ng2-has-custom-sidebar iframe {
        grid-area: viewer;
        min-width: 0;
        min-height: 0;
      }

      /* Spinner overlay styling */
      .ng2-pdfjs-loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: saturate(120%) blur(1px);
      }

      /* Default spinner content styling */
      .ng2-pdfjs-spinner-content {
        text-align: center;
      }

      .ng2-pdfjs-spinner-icon {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #2196F3;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .ng2-pdfjs-spinner-text {
        margin-top: 16px;
        color: #666;
        font-size: 16px;
      }

      /* Error overlay styling */
      .ng2-pdfjs-error-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: saturate(120%) blur(1px);
      }

      /* Default error content styling */
      .ng2-pdfjs-error-content {
        text-align: center;
        max-width: 400px;
        padding: 20px;
      }

      .ng2-pdfjs-error-icon {
        font-size: 48px;
        color: #f44336;
        margin-bottom: 16px;
      }

      .ng2-pdfjs-error-title {
        color: #333;
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .ng2-pdfjs-error-message {
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }

      /* Default spinner animation */
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Built-in AI panel (opt-in via [aiAssistantConfig]) */
      .ng2-ai-fab {
        position: absolute;
        right: 16px;
        bottom: 16px;
        z-index: 20;
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        color: var(--ng2-ai-fab-color, #fff);
        background: var(--ng2-ai-accent, #4436a1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      }

      .ng2-ai-panel {
        position: absolute;
        right: 16px;
        bottom: 72px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        width: min(340px, calc(100% - 32px));
        max-height: min(480px, calc(100% - 96px));
        border-radius: 10px;
        overflow: hidden;
        font-size: 13px;
        color: var(--ng2-ai-text, #222);
        background: var(--ng2-ai-bg, #fff);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);
      }

      .ng2-ai-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 0 0 auto;
        padding: 10px 12px;
        font-weight: 600;
        color: #fff;
        background: var(--ng2-ai-accent, #4436a1);
      }

      .ng2-ai-head button {
        border: none;
        background: transparent;
        color: inherit;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
      }

      .ng2-ai-msgs {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .ng2-ai-msg {
        white-space: pre-wrap;
        word-break: break-word;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--ng2-ai-answer-bg, #f2f1f7);
        align-self: stretch;
      }

      .ng2-ai-msg.ng2-ai-user {
        background: var(--ng2-ai-question-bg, #e4f0fe);
        align-self: flex-end;
        max-width: 85%;
      }

      .ng2-ai-msg.ng2-ai-busy {
        opacity: 0.7;
        font-style: italic;
      }

      .ng2-ai-cite {
        display: inline-block;
        margin: 0 2px;
        padding: 0 6px;
        border: none;
        border-radius: 9px;
        cursor: pointer;
        font: inherit;
        font-size: 12px;
        color: #fff;
        background: var(--ng2-ai-accent, #4436a1);
      }

      .ng2-ai-error {
        color: #b3261e;
      }

      .ng2-ai-input {
        display: flex;
        flex: 0 0 auto;
        gap: 6px;
        padding: 10px 12px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }

      .ng2-ai-input input {
        flex: 1 1 auto;
        min-width: 0;
        padding: 6px 8px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        font: inherit;
      }

      .ng2-ai-input button {
        flex: 0 0 auto;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font: inherit;
        color: #fff;
        background: var(--ng2-ai-accent, #4436a1);
      }

      .ng2-ai-input button:disabled {
        opacity: 0.6;
        cursor: default;
      }

      /* Iframe border styling */
      .ng2-pdfjs-viewer-iframe {
        border: 0;
      }
      
      /* Dynamic border classes */
      .ng2-pdfjs-viewer-iframe.has-border {
        border: 1px solid #ccc;
      }
    `,
  ],
  template: `
    <div
      class="ng2-pdfjs-viewer-container"
      [class.ng2-has-custom-toolbar]="customToolbarTpl && !externalWindow"
      [class.ng2-has-custom-sidebar]="customSidebarTpl && !externalWindow"
    >
      <div
        class="ng2-pdfjs-custom-toolbar"
        *ngIf="customToolbarTpl && !externalWindow"
      >
        <ng-container
          [ngTemplateOutlet]="customToolbarTpl"
          [ngTemplateOutletContext]="{ $implicit: this }"
        ></ng-container>
      </div>
      <div
        class="ng2-pdfjs-custom-sidebar"
        *ngIf="customSidebarTpl && !externalWindow"
      >
        <ng-container
          [ngTemplateOutlet]="customSidebarTpl"
          [ngTemplateOutletContext]="{ $implicit: this }"
        ></ng-container>
      </div>
      <iframe
        [title]="iframeTitle || 'PDF document viewer'"
        [hidden]="externalWindow || (!externalWindow && !pdfSrc)"
        sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-downloads allow-popups allow-popups-to-escape-sandbox"
        [class]="getIframeClasses()"
        #iframe
        width="100%"
        height="100%"
      ></iframe>
      
      <div
        class="ng2-pdfjs-loading-overlay"
        *ngIf="showSpinner && isLoading && !externalWindow"
        [ngClass]="spinnerClass"
      >
        <ng-container
          *ngIf="customSpinnerTpl; else defaultSpinner"
          [ngTemplateOutlet]="customSpinnerTpl"
        ></ng-container>
        <ng-template #defaultSpinner>
          <div class="ng2-pdfjs-spinner-content">
            <div class="ng2-pdfjs-spinner-icon"></div>
            <div class="ng2-pdfjs-spinner-text">
              Loading PDF...
            </div>
          </div>
        </ng-template>
      </div>

      <div
        class="ng2-pdfjs-error-overlay"
        *ngIf="errorOverride && hasError && !externalWindow"
        [ngClass]="errorClass"
      >
        <ng-container
          *ngIf="customErrorTpl; else defaultError"
          [ngTemplateOutlet]="customErrorTpl"
          [ngTemplateOutletContext]="errorTemplateData"
        ></ng-container>
        <ng-template #defaultError>
          <div class="ng2-pdfjs-error-content">
            <div class="ng2-pdfjs-error-icon">
              ⚠️
            </div>
            <div class="ng2-pdfjs-error-title">
              Error Loading PDF
            </div>
            <div class="ng2-pdfjs-error-message">
              {{ currentErrorMessage }}
            </div>
          </div>
        </ng-template>
      </div>

      <button
        type="button"
        class="ng2-ai-fab"
        *ngIf="aiAssistantConfig && !externalWindow"
        (click)="aiPanelOpen = !aiPanelOpen"
        [attr.aria-expanded]="aiPanelOpen"
        aria-label="Ask AI about this document"
      >
        ✦
      </button>

      <div
        class="ng2-ai-panel"
        *ngIf="aiAssistantConfig && aiPanelOpen && !externalWindow"
        role="complementary"
        aria-label="AI assistant"
      >
        <div class="ng2-ai-head">
          <span>{{ aiAssistantConfig.title || 'Ask this document' }}</span>
          <button
            type="button"
            (click)="aiPanelOpen = false"
            aria-label="Close AI panel"
          >
            ×
          </button>
        </div>
        <div class="ng2-ai-msgs" aria-live="polite">
          <div
            class="ng2-ai-msg"
            *ngFor="let m of aiMessages"
            [class.ng2-ai-user]="m.role === 'user'"
          >
            <ng-container *ngFor="let part of m.parts">
              <button
                type="button"
                class="ng2-ai-cite"
                *ngIf="part.page; else plainPart"
                (click)="setPage(part.page!)"
              >
                p.{{ part.page }}
              </button>
              <ng-template #plainPart>{{ part.text }}</ng-template>
            </ng-container>
            <span class="ng2-ai-error" *ngIf="m.error">{{ m.error }}</span>
          </div>
          <div class="ng2-ai-msg ng2-ai-busy" *ngIf="aiBusy">Thinking…</div>
        </div>
        <div class="ng2-ai-input">
          <input
            #aiq
            type="text"
            [placeholder]="aiAssistantConfig.placeholder || 'Ask the document…'"
            [disabled]="aiBusy"
            (keyup.enter)="aiAsk(aiq.value); aiq.value = ''"
            aria-label="Question for the AI assistant"
          />
          <button
            type="button"
            [disabled]="aiBusy"
            (click)="aiAsk(aiq.value); aiq.value = ''"
          >
            Ask
          </button>
        </div>
      </div>

      <div
        class="ng2-pdfjs-error-overlay"
        *ngIf="securityWarning && !externalWindow"
        [ngClass]="errorClass"
      >
        <ng-container
          *ngIf="customSecurityTpl; else defaultSecurity"
          [ngTemplateOutlet]="customSecurityTpl"
          [ngTemplateOutletContext]="{ $implicit: securityWarning, securityWarning: securityWarning }"
        ></ng-container>
        <ng-template #defaultSecurity>
          <div class="ng2-pdfjs-error-content">
            <div class="ng2-pdfjs-error-icon">
              ⚠️
            </div>
            <div class="ng2-pdfjs-error-title">
              Security Warning
            </div>
            <div class="ng2-pdfjs-error-message">
              {{ securityWarning?.message }}
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class PdfJsViewerComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  // #region Component Properties
  @ViewChild("iframe", { static: true }) iframe!: ElementRef;

  static lastID = 0;
  @Input() public viewerId =
    `ng2-pdfjs-viewer-ID${++PdfJsViewerComponent.lastID}`;

  // #region Event Outputs
  @Output() onBeforePrint: EventEmitter<void> = new EventEmitter();
  @Output() onAfterPrint: EventEmitter<void> = new EventEmitter();
  @Output() onDocumentLoad: EventEmitter<void> = new EventEmitter();
  @Output() onPageChange: EventEmitter<ChangedPage> = new EventEmitter();
  @Output() onScaleChange: EventEmitter<ChangedScale> = new EventEmitter();
  @Output() onRotationChange: EventEmitter<ChangedRotation> =
    new EventEmitter();

  // New high-value events for enhanced PDF viewer functionality
  @Output() onDocumentError: EventEmitter<DocumentError> = new EventEmitter();
  @Output() onDocumentInit: EventEmitter<void> = new EventEmitter();
  @Output() onPagesInit: EventEmitter<PagesInfo> = new EventEmitter();
  @Output() onPresentationModeChanged: EventEmitter<PresentationMode> =
    new EventEmitter();
  @Output() onOpenFile: EventEmitter<void> = new EventEmitter();
  @Output() onFind: EventEmitter<FindOperation> = new EventEmitter();
  @Output() onUpdateFindMatchesCount: EventEmitter<FindMatchesCount> =
    new EventEmitter();
  @Output() onMetadataLoaded: EventEmitter<DocumentMetadata> =
    new EventEmitter();
  @Output() onOutlineLoaded: EventEmitter<DocumentOutline> = new EventEmitter();
  @Output() onPageRendered: EventEmitter<PageRenderInfo> = new EventEmitter();

  // New high-value events
  @Output()
  onAnnotationLayerRendered: EventEmitter<AnnotationLayerRenderEvent> =
    new EventEmitter();
  @Output() onBookmarkClick: EventEmitter<BookmarkClick> = new EventEmitter();
  @Output() onIdle: EventEmitter<void> = new EventEmitter();
  // Fired when PDF.js shows its password dialog for a protected document.
  // The loading spinner is dropped automatically so the dialog is usable.
  @Output() onPasswordPrompt: EventEmitter<void> = new EventEmitter();
  // Annotation editor undo/redo/empty state - drives "unsaved changes" UX
  @Output() onAnnotationEditorStateChange: EventEmitter<AnnotationEditorState> =
    new EventEmitter();
  // Page organization events (reorder/delete/extract/merge in the sidebar)
  @Output() onPagesEdited: EventEmitter<PagesEditedEvent> = new EventEmitter();
  // Read-aloud progress: reading | paused | stopped | finished | error
  @Output() onReadAloudStateChange: EventEmitter<ReadAloudState> =
    new EventEmitter();
  // Sidebar panel switches (thumbnails/outline/attachments/layers)
  @Output() onSidebarViewChanged: EventEmitter<SidebarViewChange> =
    new EventEmitter();
  // Optional-content layers: loaded for the document / visibility toggled
  @Output() onLayersChanged: EventEmitter<LayersChange> = new EventEmitter();
  // Named actions triggered from inside the document (GoToPage, Print, ...)
  @Output() onNamedAction: EventEmitter<NamedActionEvent> = new EventEmitter();
  // User opened the document-properties dialog
  @Output() onDocumentProperties: EventEmitter<void> = new EventEmitter();
  // #endregion

  // #region Basic Configuration Properties
  @Input() public viewerFolder!: string;
  @Input() public externalWindow: boolean = false;
  @Input() public target: string = "_blank";
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName!: string;
  @Input() public locale!: string;
  @Input() public useOnlyCssZoom: boolean = false;

  // Where external PDF links open. The embedded PDF.js default ('top') is
  // blocked by the iframe sandbox, leaving links dead (issue #304); 'blank'
  // works with the sandbox's allow-popups and is the safe default.
  @Input() public externalLinkTarget: ExternalLinkTarget = "blank";

  // Restore the previous reading position (page/zoom/sidebar) on reload.
  // Set false to always open documents at page 1 / initial view (issue #299).
  @Input() public rememberLastView: boolean = true;

  // Active annotation editor tool. Two-way bindable: user toolbar clicks emit
  // annotationEditorChange. Editing requires a loaded document (level 5).
  @Input() public set annotationEditor(mode: AnnotationEditorMode) {
    if (mode === this._annotationEditor) {
      return;
    }
    this._annotationEditor = mode ?? "none";
    this.dispatchAction(
      "set-annotation-editor-mode",
      this._annotationEditor,
      "property-change"
    );
  }

  public get annotationEditor(): AnnotationEditorMode {
    return this._annotationEditor;
  }

  private _annotationEditor: AnnotationEditorMode = "none";
  @Output() annotationEditorChange: EventEmitter<AnnotationEditorMode> =
    new EventEmitter();

  // Highlight palette for the highlight editor, PDF.js format:
  // 'yellow=#FFFF98,green=#53FFBC,...'. Applied before the document opens.
  @Input() public highlightEditorColors?: string;

  // Opt-in PDF.js signature editor (draw / type / upload image). Saved as
  // stamp-style annotations - an eSign convenience, NOT cryptographic signing.
  // Init-time option: changing it after load requires a reload.
  @Input() public enableSignatureEditor: boolean = false;

  // Host-side persistence for the signature editor's saved signatures.
  // When set, the viewer's "save signature" feature round-trips through these
  // callbacks (e.g. to a server, per user) instead of the iframe's
  // localStorage. Use with [enableSignatureEditor].
  @Input() public signatureStorage?: PdfSignatureStorage;

  // Re-render page CONTENT with custom colors (true dark mode for pages, not
  // just viewer chrome). Example: { background: '#1e1e1e', foreground: '#e8e8e8' }.
  // Init-time option: changing it after load requires a reload.
  @Input() public pageColors?: { background: string; foreground: string } | null;

  // Raw allowlisted PDF.js AppOptions passthrough for init-time options
  // (e.g. { printResolution: 300, sidebarViewOnLoad: 1, enableComment: true }).
  // Keys outside the wrapper's allowlist are ignored with a console warning.
  // Init-time: changing it after load requires a reload.
  @Input() public pdfJsOptions?: Record<string, string | number | boolean>;

  // Opt-in PDF.js comment editor: threaded comment popups on highlights with
  // edit/delete and undo/redo. Init-time option: changing requires a reload.
  @Input() public enableCommentEditor: boolean = false;

  // Opt-in in-viewer page organization: drag-drop reorder, delete, cut/copy/
  // paste, extract and merge pages from the sidebar's views manager.
  // Init-time option: changing requires a reload.
  @Input() public enablePageEditing: boolean = false;

  // Show/hide the entire viewer toolbar (pair with customToolbarTpl to ship a
  // fully custom host-side toolbar)
  @Input() public showToolbar: boolean = true;

  // Chromeless / embedded mode: hide the toolbar and sidebar in one switch so
  // the iframe shows just the scrolling pages. Shorthand for showToolbar=false
  // + showSidebar=false; it overrides them without mutating those bindings, so
  // flipping it back restores whatever they were. There is still an iframe and
  // its own scroll container - use pageOverlayTpl if you need per-page host DOM.
  @Input() public chromeless: boolean = false;

  // Host-side replacement toolbar rendered ABOVE the viewer iframe. Template
  // context: let-viewer (the component instance) for driving the public API,
  // e.g. <ng-template #tb let-viewer><button (click)="viewer.setPage(1)">...
  @Input() public customToolbarTpl?: TemplateRef<any>;

  // Host-side sidebar panel rendered BESIDE the viewer iframe (left). Same
  // template context as customToolbarTpl: let-viewer (the component
  // instance). Pair with [groupVisibility]="{ sidebar: false }" to replace
  // the built-in sidebar entirely. Size it with your own CSS width.
  @Input() public customSidebarTpl?: TemplateRef<any>;

  // Built-in chat-with-the-document panel (floating, bottom-right). The
  // library only calls the endpoint configured here - never any AI service
  // of its own. Answers cite pages as [p.3]; citations are clickable and
  // jump the viewer to that page. For fully custom UI use PdfAiAssistant +
  // getDocumentText() instead.
  @Input() public aiAssistantConfig?: PdfAiPanelConfig | null;

  // AI panel state (template-bound)
  public aiPanelOpen = false;
  public aiBusy = false;
  public aiMessages: PdfAiPanelMessage[] = [];
  private aiClient?: PdfAiAssistant;
  private aiClientConfig?: PdfAiPanelConfig;
  private aiDocText?: Array<{ page: number; text: string }>;
  // Bumped whenever the document context changes; in-flight aiAsk
  // continuations compare against it and abandon stale answers
  private aiGeneration = 0;
  private aiAbort?: AbortController;

  // Drop AI panel state tied to the current document and abandon any
  // in-flight request, so a slow answer about the OLD document can't land
  // in (or re-enable) the new document's chat.
  private invalidateAiState(clearChat: boolean): void {
    this.aiGeneration++;
    this.aiAbort?.abort();
    this.aiAbort = undefined;
    this.aiDocText = undefined;
    if (clearChat) {
      this.aiMessages = [];
    }
    this.aiBusy = false;
  }

  // Angular template rendered as an overlay on every page (watermark badges,
  // stamps, review UI). Context: let-page (1-based page number). The overlay
  // wrapper is pointer-events:none; re-enable on your own elements as needed.
  // Setter so clearing/replacing the template also unmounts existing overlays.
  private _pageOverlayTpl?: TemplateRef<any>;

  @Input()
  public set pageOverlayTpl(value: TemplateRef<any> | undefined) {
    if (value === this._pageOverlayTpl) {
      return;
    }
    this._pageOverlayTpl = value;
    this.destroyPageOverlays();
    if (value) {
      this.mountOverlaysOnRenderedPages();
    }
  }
  public get pageOverlayTpl(): TemplateRef<any> | undefined {
    return this._pageOverlayTpl;
  }

  // Request headers sent when the component fetches a string pdfSrc URL
  // (JWT bearer tokens, API keys). When set, the component downloads the
  // document itself and hands the viewer a local blob - the URL never needs
  // to be reachable by the viewer iframe directly.
  @Input() public httpHeaders?: Record<string, string>;

  // Send cookies/credentials with the component-side fetch of pdfSrc.
  @Input() public withCredentials: boolean = false;

  // Download progress while the component fetches pdfSrc (only emitted for
  // the httpHeaders/withCredentials fetch path). total is 0 when the server
  // sends no content-length.
  @Output() onProgress: EventEmitter<{ loaded: number; total: number }> =
    new EventEmitter();

  // Monotonic token so a pdfSrc change mid-fetch abandons the stale download
  private authLoadToken = 0;

  // AcroForm field values, two-way bindable: [(formData)]. Setting writes the
  // fields into the viewer; user edits in the viewer emit formDataChange.
  @Input() public set formData(value: FormDataMap) {
    this._formData = value ?? {};
    this.dispatchAction("set-form-data", this._formData, "property-change");
  }

  public get formData(): FormDataMap {
    return this._formData;
  }

  private _formData: FormDataMap = {};
  @Output() formDataChange: EventEmitter<FormDataMap> = new EventEmitter();

  // Client-side content protection (deterrence, not DRM): block print/save
  // shortcuts, disable text selection, render a per-page watermark.
  @Input() public set contentProtection(config: ContentProtectionConfig) {
    this._contentProtection = config ?? {};
    this.dispatchAction(
      "set-content-protection",
      {
        blockPrint: this._contentProtection.blockPrint === true,
        blockDownload: this._contentProtection.blockDownload === true,
        disableTextSelection:
          this._contentProtection.disableTextSelection === true,
      },
      "property-change"
    );
    if (this._contentProtection.blockPrint !== undefined) {
      this.dispatchAction(
        "show-print",
        !this._contentProtection.blockPrint,
        "property-change"
      );
    }
    if (this._contentProtection.blockDownload !== undefined) {
      this.dispatchAction(
        "show-download",
        !this._contentProtection.blockDownload,
        "property-change"
      );
    }
    this.dispatchAction(
      "set-watermark",
      this._contentProtection.watermark ?? null,
      "property-change"
    );
  }

  public get contentProtection(): ContentProtectionConfig {
    return this._contentProtection;
  }

  private _contentProtection: ContentProtectionConfig = {};

  // Additional iframe sandbox permissions, validated against a fixed
  // allowlist; anything else is ignored (issue #304 asked for
  // allow-top-navigation for trusted documents).
  @Input() public set iframeSandbox(value: string) {
    const requested = (value || "").split(/\s+/).filter(Boolean);
    const accepted = requested.filter((token) =>
      ALLOWED_EXTRA_SANDBOX_TOKENS.has(token)
    );
    const rejected = requested.filter(
      (token) => !ALLOWED_EXTRA_SANDBOX_TOKENS.has(token)
    );
    if (rejected.length > 0) {
      console.warn(
        `ng2-pdfjs-viewer: ignoring sandbox tokens not in the allowlist: ${rejected.join(", ")}`
      );
    }
    this._extraSandboxTokens = accepted;
  }

  public get iframeSandbox(): string {
    return this._extraSandboxTokens.join(" ");
  }

  private _extraSandboxTokens: string[] = [];

  public get effectiveSandbox(): string {
    return this._extraSandboxTokens.length === 0
      ? BASE_IFRAME_SANDBOX
      : `${BASE_IFRAME_SANDBOX} ${this._extraSandboxTokens.join(" ")}`;
  }
  @Input() public set diagnosticLogs(value: boolean) {
    this._diagnosticLogs = value;
    // Update action queue manager
    this.actionQueueManager.setDiagnosticLogs(value);
    // Send to wrapper
    this.dispatchAction("set-diagnostic-logs", value, "property-change");
  }
  
  public get diagnosticLogs(): boolean {
    return this._diagnosticLogs;
  }
  
  private _diagnosticLogs: boolean = false;
  // #endregion

  // #region Control Visibility Properties
  @Input() public showOpenFile: boolean = true;
  // Default true since PDF.js 5.7: the editor toolbar (highlight/text/draw/
  // stamp, plus the opt-in signature/comment editors) is core viewer UI.
  // Set false to hide the editing buttons entirely.
  @Input() public showAnnotations: boolean = true;
  @Input() public showDownload: boolean = true;
  @Input() public showViewBookmark: boolean = true;
  @Input() public showPrint: boolean = true;
  @Input() public showFullScreen: boolean = true;
  @Input() public showFind: boolean = true;
  // #endregion

  // #region Auto-Action Properties
  @Input() public downloadOnLoad: boolean = false;
  @Input() public printOnLoad: boolean = false;
  @Input() public rotateCW: boolean = false;
  @Input() public rotateCCW: boolean = false;
  @Input() public showLastPageOnLoad: boolean = false;
  // #endregion

  // #region Navigation Properties
  @Input() public namedDest!: string;
  // #endregion

  // #region Error Handling Properties
  @Input() public errorOverride: boolean = false;
  @Input() public errorAppend: boolean = true;
  @Input() public errorMessage!: string;
  @Input() public urlValidation: boolean = true;
  @Input() public customSecurityTpl!: TemplateRef<any>;
  
  // Security warning state
  public securityWarning: { message: string; originalUrl: string; currentUrl: string } | null = null;
  // #endregion

  // #region Theme & Visual Customization Properties
  @Input() public theme: "light" | "dark" | "auto" = "auto";
  @Input() public primaryColor?: string;
  @Input() public backgroundColor?: string;
  @Input() public pageBorderColor?: string;
  @Input() public pageSpacing?: {
    margin?: string;
    spreadMargin?: string;
    border?: string;
  };
  @Input() public toolbarColor?: string;
  @Input() public textColor?: string;
  @Input() public borderRadius?: string;
  @Input() public customCSS?: string;
  @Input() public cspNonce?: string;
  @Input() public iframeTitle?: string; // CSP nonce for customCSS (optional)
  // #endregion

  // #region Loading & Spinner Customization
  @Input() public customSpinnerTpl?: TemplateRef<any>;
  @Input() public spinnerClass?: string;
  // #endregion

  // #region Error Display Customization
  @Input() public customErrorTpl?: TemplateRef<any>;
  @Input() public errorClass?: string;
  // #endregion

  // #region Toolbar/Sidebar Group Visibility
  @Input() public showToolbarLeft: boolean = true;
  @Input() public showToolbarMiddle: boolean = true;
  @Input() public showToolbarRight: boolean = true;
  @Input() public showSecondaryToolbarToggle: boolean = true;
  @Input() public showSidebar: boolean = true;
  @Input() public showSidebarLeft: boolean = true;
  @Input() public showSidebarRight: boolean = true;
  // #endregion

  // #region Layout & Responsive Customization
  @Input() public toolbarDensity: ToolbarDensity = "default";
  @Input() public sidebarWidth?: string; // e.g., '280px'
  @Input() public toolbarPosition: ToolbarPosition = "top";
  @Input() public sidebarPosition: SidebarPosition = "left";
  @Input() public responsiveBreakpoint?: string | number;
  // #endregion

  // Internal loading state for overlay control
  public isLoading: boolean = true;

  // Internal error state for error display
  public hasError: boolean = false;
  public currentErrorMessage: string = "";
  public errorTemplateData: any = {};

  // Kept for API compatibility; the template binds errorTemplateData directly
  // so change detection sees a stable object identity.
  public getErrorTemplateData(): any {
    return this.errorTemplateData;
  }

  private updateErrorTemplateData(): void {
    this.errorTemplateData = {
      errorMessage: this.currentErrorMessage,
      errorClass: this.errorClass,
    };
  }

  // Helper method to get iframe CSS classes (no per-CD-cycle allocation)
  public getIframeClasses(): string {
    return this.iframeBorder && this.iframeBorder !== "0" && this.iframeBorder !== 0
      ? "ng2-pdfjs-viewer-iframe has-border"
      : "ng2-pdfjs-viewer-iframe";
  }


  // Error template button actions
  public reloadViewer(): void {
    this.refresh();
  }

  public goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
      } else {
      window.close();
    }
  }

  public closeViewer(): void {
    window.close();
  }

  // #region Convenience Configuration Setters
  @Input() public set controlVisibility(config: ControlVisibilityConfig) {
    if (config.download !== undefined) this.showDownload = config.download;
    if (config.print !== undefined) this.showPrint = config.print;
    if (config.find !== undefined) this.showFind = config.find;
    if (config.fullScreen !== undefined)
      this.showFullScreen = config.fullScreen;
    if (config.openFile !== undefined) this.showOpenFile = config.openFile;
    if (config.viewBookmark !== undefined)
      this.showViewBookmark = config.viewBookmark;
    if (config.annotations !== undefined)
      this.showAnnotations = config.annotations;
  }

  @Input() public set autoActions(config: AutoActionConfig) {
    if (config.downloadOnLoad !== undefined)
      this.downloadOnLoad = config.downloadOnLoad;
    if (config.printOnLoad !== undefined) this.printOnLoad = config.printOnLoad;
    if (config.showLastPageOnLoad !== undefined)
      this.showLastPageOnLoad = config.showLastPageOnLoad;
    if (config.rotateCW !== undefined) this.rotateCW = config.rotateCW;
    if (config.rotateCCW !== undefined) this.rotateCCW = config.rotateCCW;
  }

  @Input() public set errorHandling(config: ErrorConfig) {
    if (config.override !== undefined) this.errorOverride = config.override;
    if (config.append !== undefined) this.errorAppend = config.append;
    if (config.message !== undefined) this.errorMessage = config.message;
  }

  @Input() public set viewerConfig(config: ViewerConfig) {
    if (config.showSpinner !== undefined) this.showSpinner = config.showSpinner;
    if (config.useOnlyCssZoom !== undefined)
      this.useOnlyCssZoom = config.useOnlyCssZoom;
    if (config.diagnosticLogs !== undefined)
      this.diagnosticLogs = config.diagnosticLogs;
    if (config.locale !== undefined) this.locale = config.locale;
    if (config.externalLinkTarget !== undefined)
      this.externalLinkTarget = config.externalLinkTarget;
    if (config.rememberLastView !== undefined)
      this.rememberLastView = config.rememberLastView;
  }

  @Input() public set themeConfig(config: ThemeConfig) {
    if (config.theme !== undefined) this.theme = config.theme;
    if (config.primaryColor !== undefined)
      this.primaryColor = config.primaryColor;
    if (config.backgroundColor !== undefined)
      this.backgroundColor = config.backgroundColor;
    if (config.pageBorderColor !== undefined)
      this.pageBorderColor = config.pageBorderColor;
    if (config.pageSpacing !== undefined)
      this.pageSpacing = config.pageSpacing;
    if (config.toolbarColor !== undefined)
      this.toolbarColor = config.toolbarColor;
    if (config.textColor !== undefined) this.textColor = config.textColor;
    if (config.borderRadius !== undefined)
      this.borderRadius = config.borderRadius;
    if (config.customCSS !== undefined) this.customCSS = config.customCSS;
    if (config.cspNonce !== undefined) this.cspNonce = config.cspNonce;
  }

  @Input() public set groupVisibility(config: GroupVisibilityConfig) {
    if (config.toolbarLeft !== undefined)
      this.showToolbarLeft = config.toolbarLeft;
    if (config.toolbarMiddle !== undefined)
      this.showToolbarMiddle = config.toolbarMiddle;
    if (config.toolbarRight !== undefined)
      this.showToolbarRight = config.toolbarRight;
    if (config.secondaryToolbarToggle !== undefined)
      this.showSecondaryToolbarToggle = config.secondaryToolbarToggle;
    if (config.sidebar !== undefined) this.showSidebar = config.sidebar;
    if (config.sidebarLeft !== undefined)
      this.showSidebarLeft = config.sidebarLeft;
    if (config.sidebarRight !== undefined)
      this.showSidebarRight = config.sidebarRight;
  }

  @Input() public set layoutConfig(config: LayoutConfig) {
    if (config.toolbarDensity !== undefined)
      this.toolbarDensity = config.toolbarDensity;
    if (config.sidebarWidth !== undefined)
      this.sidebarWidth = config.sidebarWidth;
    if (config.toolbarPosition !== undefined)
      this.toolbarPosition = config.toolbarPosition;
    if (config.sidebarPosition !== undefined)
      this.sidebarPosition = config.sidebarPosition;
    if (config.responsiveBreakpoint !== undefined)
      this.responsiveBreakpoint = config.responsiveBreakpoint;
  }
  // #endregion

  // #region Helper function for deprecated properties
  private static warnedDeprecations = new Set<string>();

  private setDeprecatedProperty(
    oldName: string,
    newProperty: string,
    value: any,
  ): void {
    if (!PdfJsViewerComponent.warnedDeprecations.has(oldName)) {
      PdfJsViewerComponent.warnedDeprecations.add(oldName);
      console.warn(
        `ng2-pdfjs-viewer: Property "${oldName}" is deprecated. Use "${newProperty}" instead.`,
      );
    }
    (this as any)[newProperty] = value;
  }
  // #endregion

  // #region Deprecated Properties (Simplified)
  /** @deprecated Use `downloadOnLoad` instead. This property will be removed in a future version. */
  @Input() public set startDownload(value: boolean) {
    this.setDeprecatedProperty("startDownload", "downloadOnLoad", value);
  }

  /** @deprecated Use `printOnLoad` instead. This property will be removed in a future version. */
  @Input() public set startPrint(value: boolean) {
    this.setDeprecatedProperty("startPrint", "printOnLoad", value);
  }

  /** @deprecated Use `showOpenFile` instead. This property will be removed in a future version. */
  @Input() public set openFile(value: boolean) {
    this.setDeprecatedProperty("openFile", "showOpenFile", value);
  }

  /** @deprecated Use `showDownload` instead. This property will be removed in a future version. */
  @Input() public set download(value: boolean) {
    this.setDeprecatedProperty("download", "showDownload", value);
  }

  /** @deprecated Use `showPrint` instead. This property will be removed in a future version. */
  @Input() public set print(value: boolean) {
    this.setDeprecatedProperty("print", "showPrint", value);
  }

  /** @deprecated Use `showFullScreen` instead. This property will be removed in a future version. */
  @Input() public set fullScreen(value: boolean) {
    this.setDeprecatedProperty("fullScreen", "showFullScreen", value);
  }

  /** @deprecated Use `showFind` instead. This property will be removed in a future version. */
  @Input() public set find(value: boolean) {
    this.setDeprecatedProperty("find", "showFind", value);
  }

  /** @deprecated Use `showViewBookmark` instead. This property will be removed in a future version. */
  @Input() public set viewBookmark(value: boolean) {
    this.setDeprecatedProperty("viewBookmark", "showViewBookmark", value);
  }

  /** @deprecated Use `showLastPageOnLoad` instead. This property will be removed in a future version. */
  @Input() public set lastPage(value: boolean) {
    this.setDeprecatedProperty("lastPage", "showLastPageOnLoad", value);
  }
  // #endregion

  // #region External Window Properties
  @Input() public externalWindowOptions!: string;
  public viewerTab: any;
  // #endregion

  // #region Security Properties
  // iframe sandbox is static for security and Angular compliance
  // #endregion

  // #region iframe Properties
  @Input() public iframeBorder: string | number = "0";
  // #endregion

  // #region Private Properties
  private _src!: string | Blob | Uint8Array;
  private _page!: number;
  private isPostMessageReady = false;
  private postMessageReadiness = 0;
  private initialConfigQueued = false;
  private actionQueueManager: ActionQueueManager = new ActionQueueManager(this._diagnosticLogs);
  private cdr: ChangeDetectorRef;
  private appRef?: ApplicationRef;
  private ngZone?: NgZone;

  constructor(cdr: ChangeDetectorRef, appRef?: ApplicationRef, ngZone?: NgZone) {
    this.cdr = cdr;
    this.appRef = appRef;
    this.ngZone = ngZone;
  }
  private messageIdCounter = 0;
  // Monotonic suffix keeps action ids unique even within one millisecond
  private actionIdCounter = 0;
  private pendingMessages = new Map<
    string,
    {
      resolve: (response: ControlResponse) => void;
      reject: (error: Error) => void;
    }
  >();
  // Changes that arrived before the viewer was ready, coalesced per property
  // (last write wins)
  private pendingChanges: SimpleChanges = {};
  private releaseUrl?: () => void;
  private webviewerLoadedHandler?: () => void;
  private pdfEventHandlers?: Record<string, (event?: any) => void>;
  // #endregion

  // #region Two-Way Binding Properties
  // Private backing fields for two-way binding properties
  private _zoom: string = "auto";
  private _rotation: number = 0;
  private _cursor: string = "select";
  private _scroll: string = "vertical";
  private _spread: string = "none";
  private _pageMode: string = "none";

  // Two-way binding Output events
  @Output() zoomChange = new EventEmitter<string>();

  @Output() cursorChange = new EventEmitter<string>();
  @Output() scrollChange = new EventEmitter<string>();
  @Output() spreadChange = new EventEmitter<string>();
  @Output() pageModeChange = new EventEmitter<string>();

  /**
   * Two-way binding for zoom level
   * Supports: auto, page-fit, page-width, page-actual, percentage values (e.g., "150%")
   */
  @Input()
  get zoom(): string {
    return this._zoom;
  }
  set zoom(value: string) {
    const normalizedValue = PropertyTransformers.transformZoom.toViewer(value);
    if (this._zoom !== normalizedValue) {
      this._zoom = normalizedValue;
      this.dispatchAction("set-zoom", this._zoom, "property-change");
      this.zoomChange.emit(this._zoom);
    }
  }

  /**
   * One-way binding for document rotation
   * Supports: 0, 90, 180, 270 degrees
   */
  @Input()
  set rotation(value: number) {
    const normalizedValue =
      PropertyTransformers.transformRotation.toViewer(value);
    if (this._rotation !== normalizedValue) {
      this._rotation = normalizedValue;
      this.dispatchAction("set-rotation", this._rotation, "property-change");
    }
  }

  get rotation(): number {
    return this._rotation;
  }

  /**
   * Two-way binding for cursor mode
   * Supports: select, hand, zoom
   */
  @Input()
  get cursor(): string {
    return this._cursor;
  }
  set cursor(value: string) {
    const normalizedValue =
      PropertyTransformers.transformCursor.toViewer(value);
    if (this._cursor !== normalizedValue) {
      this._cursor = normalizedValue;
      this.dispatchAction("set-cursor", this._cursor, "property-change");
      this.cursorChange.emit(this._cursor);
    }
  }

  /**
   * Two-way binding for scroll mode
   * Supports: vertical, horizontal, wrapped, page
   */
  @Input()
  get scroll(): string {
    return this._scroll;
  }
  set scroll(value: string) {
    const normalizedValue =
      PropertyTransformers.transformScroll.toViewer(value);
    if (this._scroll !== normalizedValue) {
      this._scroll = normalizedValue;
      this.dispatchAction("set-scroll", this._scroll, "property-change");
      this.scrollChange.emit(this._scroll);
    }
  }

  /**
   * Two-way binding for spread mode
   * Supports: none, odd, even
   */
  @Input()
  get spread(): string {
    return this._spread;
  }
  set spread(value: string) {
    const normalizedValue =
      PropertyTransformers.transformSpread.toViewer(value);
    if (this._spread !== normalizedValue) {
      this._spread = normalizedValue;
      this.dispatchAction("set-spread", this._spread, "property-change");
      this.spreadChange.emit(this._spread);
    }
  }

  /**
   * Two-way binding for page mode (sidebar state)
   * Supports: none, thumbs, bookmarks, attachments
   */
  @Input()
  get pageMode(): string {
    return this._pageMode;
  }
  set pageMode(value: string) {
    const normalizedValue =
      PropertyTransformers.transformPageMode.toViewer(value);
    if (this._pageMode !== normalizedValue) {
      this._pageMode = normalizedValue;
      this.dispatchAction("update-page-mode", this._pageMode, "property-change");
      this.pageModeChange.emit(this._pageMode);
    }
  }

  @Input()
  public set page(_page: number) {
    this._page = _page;
    if (this.PDFViewerApplication && this.PDFViewerApplication.initialized) {
      this.PDFViewerApplication.page = this._page;
    } else {
      if (this.diagnosticLogs) {
        console.warn(
          "Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)",
        );
      }
    }
  }

  public get page() {
    if (this.PDFViewerApplication && this.PDFViewerApplication.initialized) {
      return this.PDFViewerApplication.page;
      } else {
      if (this.diagnosticLogs) {
        console.warn(
          "Document is not loaded yet!!!. Try to retrieve page# after full load.",
        );
      }
      return this._page || 1;
    }
  }

  @Input()
  public set pdfSrc(_src: string | Blob | Uint8Array) {
    this._src = _src;
  }

  public get pdfSrc() {
    return this._src;
  }
  // #endregion

  // #region PDF.js Application Access Properties
  public get PDFViewerApplicationOptions() {
    let pdfViewerOptions = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewerOptions = this.viewerTab.PDFViewerApplicationOptions;
      }
    } else {
      // Optional-chained: a static `page="5"` attribute runs input setters
      // before the static ViewChild is resolved
      if (this.iframe?.nativeElement?.contentWindow) {
        pdfViewerOptions =
          this.iframe.nativeElement.contentWindow.PDFViewerApplicationOptions;
      }
    }
    return pdfViewerOptions;
  }

  public get PDFViewerApplication() {
    let pdfViewer = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewer = this.viewerTab.PDFViewerApplication;
      }
    } else {
      if (this.iframe?.nativeElement?.contentWindow) {
        pdfViewer =
          this.iframe.nativeElement.contentWindow.PDFViewerApplication;
      }
    }
    if (this.diagnosticLogs) console.debug("PdfJsViewer: Viewer ->", pdfViewer);
    return pdfViewer;
  }

  // #endregion
  // #endregion

  // #region Lifecycle Methods
  // SSR guard: the viewer is browser-only (iframe + postMessage). During
  // server rendering the lifecycle hooks no-op; the real load happens after
  // hydration in the browser.
  private get isBrowser(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    // Connect action queue manager to PostMessage system
    // Wrap sendControlMessage to handle iframe unavailability by re-queuing actions
    this.actionQueueManager.setPostMessageExecutor((action) =>
      this.sendControlMessageWithRequeue(action),
    );

    // Send diagnostic logs setting to wrapper
    this.dispatchAction("set-diagnostic-logs", this._diagnosticLogs, "initial-load");
    
    // Send URL validation setting to wrapper
    this.dispatchAction("set-url-validation", this.urlValidation, "initial-load");
    
    // Set up PostMessage listener
    this.setupMessageListener();
    
    // Note: PDF loading moved to ngAfterViewInit() to ensure iframe is ready
    // This prevents "Cannot read properties of null (reading 'location')" error
    // when pdfSrc is a Blob (Issue #283)

    // Bind events.
    this.bindToPdfJsEventBus();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    // Angular only allows a static sandbox attribute in templates (NG0910), so
    // extra allowlisted tokens are applied natively - safe here because the
    // iframe has not navigated yet (sandbox applies to subsequent loads).
    if (this._extraSandboxTokens.length > 0 && this.iframe?.nativeElement) {
      this.iframe.nativeElement.setAttribute("sandbox", this.effectiveSandbox);
    }

    // Load PDF after view is initialized - trust Angular's lifecycle guarantee
    // that iframe.nativeElement.contentWindow is now available
    if (!this.externalWindow) {
      this.loadPdf();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle pdfSrc changes - reload the PDF (Issue #283)
    // Trust Angular's change detection event to trigger reload when needed
    if (changes['pdfSrc'] && !changes['pdfSrc'].firstChange) {
      // pdfSrc changed after initialization - reload the PDF
      if (!this.externalWindow) {
        // Show spinner immediately when PDF source changes (Issue #275)
        this.isLoading = true;
        this.hasError = false;
        this.currentErrorMessage = "";

        // Don't wait for the new document's documentInit relay (it is
        // enablement-gated and can race a fast local load): the AI panel's
        // text/chat refer to the outgoing document - drop them now
        this.invalidateAiState(true);

        // The new document renders unrotated; without this the stale value
        // makes a consumer's [rotation] re-set a silent no-op
        this._rotation = 0;

        // The iframe reloads fresh: discard in-flight messages and queued
        // actions, and reset readiness so configuration re-applies on the
        // new load's postmessage-ready handshake.
        this.rejectPendingMessages("PDF source changed");
        this.actionQueueManager.reset();
        this.initialConfigQueued = false;
        this.isPostMessageReady = false;
        this.postMessageReadiness = 0;
        this.loadPdf();
      }
      return; // pdfSrc change requires full reload, skip other change processing
    }

    if (
      this.isPostMessageReady &&
      this.PDFViewerApplication?.initialized
    ) {
      this.applyChanges(changes);
    } else {
      // Coalesce per property - only the latest value matters once ready.
      // Initial bindings (firstChange) are excluded: the batched 'configure'
      // snapshot reads live property values when the viewer becomes ready,
      // so replaying them here would only duplicate traffic (and an initial
      // locale binding would trigger a spurious boot-time refresh).
      for (const key of Object.keys(changes)) {
        if (!changes[key].firstChange) {
          this.pendingChanges[key] = changes[key];
        }
      }
    }
  }

  ngOnDestroy(): void {
    // Abort any in-flight AI request (potentially a 100k-char prompt)
    this.aiAbort?.abort();

    // Remove the window message listener - without this every destroyed
    // instance stays rooted forever and keeps processing viewer messages
    window.removeEventListener("message", this.messageHandler);

    // Clean up PDF.js event listeners
    this.teardownPdfJsEventBindings();

    // Settle in-flight promises and queued actions so consumer awaits don't
    // hang forever
    this.rejectPendingMessages("Viewer destroyed");
    this.actionQueueManager.clearQueues();

    // Release page-overlay embedded views
    this.destroyPageOverlays();

    // Clean up URL
    this.releaseUrl?.();
  }
  // #endregion

  // #region Message Handling Methods
  private generateMessageId(): string {
    return `msg_${++this.messageIdCounter}_${Date.now()}`;
  }

  private sendControlMessage(action: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      
      const message: ControlMessage = {
        type: "control-update",
        action,
        payload,
        id: messageId,
        timestamp: Date.now(),
      };

      this.pendingMessages.set(messageId, { resolve, reject });

      // Send message to iframe - verify accessibility (event-driven check).
      // targetOrigin "/" restricts delivery to our own origin (the viewer
      // assets are same-origin), matching the wrapper's outgoing direction.
      if (this.isIframeAccessible()) {
        this.iframe.nativeElement.contentWindow.postMessage(message, "/");
      } else {
        this.pendingMessages.delete(messageId);
        reject(new Error("Iframe not available"));
      }
    });
  }

  // Wrapper for sendControlMessage that re-queues actions on iframe unavailability.
  // The SAME action object (id, resolver) is re-queued so its status and the
  // caller's promise track the retry, with a bounded retry count.
  private async sendControlMessageWithRequeue(actionObj: ViewerAction): Promise<any> {
    try {
      return await this.sendControlMessage(actionObj.action, actionObj.payload);
    } catch (error) {
      // If iframe is not available, re-queue the action for retry when the
      // iframe becomes available or readiness increases
      if (
        error instanceof Error &&
        error.message === "Iframe not available" &&
        (actionObj.retries = (actionObj.retries ?? 0) + 1) <= 3
      ) {
        actionObj.requeued = true;
        this.actionQueueManager.queueAction(
          actionObj,
          actionObj.level ?? this.getRequiredReadinessLevel(actionObj.action),
        );

        // Trigger processing if iframe becomes available soon (event-driven, no polling)
        Promise.resolve().then(() => {
          if (this.isIframeAccessible() && this.isPostMessageReady) {
            this.actionQueueManager.processQueuedActions();
          }
        });
      }
      // Re-throw to maintain error handling in ActionQueueManager
      throw error;
    }
  }

  // Event-driven iframe accessibility check (no polling, trust-based)
  private isIframeAccessible(): boolean {
    return !!(
      this.iframe &&
      this.iframe.nativeElement &&
      this.iframe.nativeElement.contentWindow
    );
  }

  // Process actions on every postmessage-ready (the wrapper announces each
  // readiness increase: levels 3, 4 and 5 of a single load)
  private processPostMessageReadyActions(): void {
    this.actionQueueManager.updateReadiness(this.postMessageReadiness);
    this.actionQueueManager.processQueuedActions();

    // Apply the configuration snapshot ONCE per document load. The flag is
    // reset when the iframe navigates (pdfSrc change / refresh), which is
    // what makes reloads reconfigure the fresh viewer.
    if (!this.initialConfigQueued) {
      this.initialConfigQueued = true;
      this.queueAllConfigurations();
    }

    // Apply any pending changes that occurred before PostMessage API was ready
    this.applyPendingChanges();
  }

  private handleControlResponse(response: ControlResponse): void {
    const pendingMessage = this.pendingMessages.get(response.id);
    if (pendingMessage) {
      this.pendingMessages.delete(response.id);
      
      if (response.success) {
        pendingMessage.resolve(response);
      } else {
        pendingMessage.reject(new Error(response.error || "Unknown error"));
      }
    }
  }

  // Named handler so ngOnDestroy can remove it. Arrow field keeps `this` bound.
  private messageHandler = (event: MessageEvent): void => {
    // Only accept messages from this component's own viewer iframe. This
    // prevents cross-talk between multiple viewer instances on one page and
    // spoofed messages from unrelated windows.
    if (
      !this.iframe?.nativeElement?.contentWindow ||
      event.source !== this.iframe.nativeElement.contentWindow ||
      !event.data
    ) {
      return;
    }

    switch (event.data.type) {
      case "control-response":
        this.handleControlResponse(event.data);
        return;

      case "ng2-pdfjs-viewer-security-warning":
        this.securityWarning = {
          message: event.data.message,
          originalUrl: event.data.originalUrl,
          currentUrl: event.data.currentUrl,
        };
        this.cdr.markForCheck();
        return;

      case "postmessage-ready":
        this.isPostMessageReady = true;
        this.postMessageReadiness = event.data.readiness || 0;

        // Verify iframe is accessible before processing actions (event-driven readiness check)
        // This prevents "Iframe not available" errors when dialog reopens quickly
        if (this.isIframeAccessible()) {
          this.processPostMessageReadyActions();
        } else {
          // Defer to the microtask queue - handles Material Dialog lifecycle timing
          Promise.resolve().then(() => {
            if (this.isIframeAccessible()) {
              this.processPostMessageReadyActions();
            }
          });
        }
        return;

      case "state-change":
        this.handleStateChangeNotification(event.data);
        return;

      case "event-notification":
        this.handleEventNotification(event.data);
        return;

      case "host-request":
        // Wrapper-initiated round-trip (signature storage hooks)
        void this.handleHostRequest(event.data);
        return;
    }
  };

  // Serve a wrapper-initiated request against the host-side hooks and post
  // the result back. Errors are returned (not thrown) so the wrapper's
  // pending promise always settles.
  private async handleHostRequest(request: any): Promise<void> {
    const respond = (data: unknown, error?: string) => {
      this.iframe?.nativeElement?.contentWindow?.postMessage(
        {
          type: "host-response",
          requestId: request.requestId,
          data,
          error: error ?? null,
        },
        "/",
      );
    };

    const storage = this.signatureStorage;
    if (!storage) {
      respond(null, "No signatureStorage hook configured");
      return;
    }

    try {
      switch (request.action) {
        case "signature-storage-get-all":
          respond((await storage.loadAll()) ?? {});
          return;
        case "signature-storage-save":
          await storage.save(request.payload?.uuid, request.payload?.data);
          respond(true);
          return;
        case "signature-storage-delete":
          await storage.delete(request.payload?.uuid);
          respond(true);
          return;
        default:
          respond(null, `Unknown host request: ${request.action}`);
      }
    } catch (e: any) {
      respond(null, e?.message || "signatureStorage hook failed");
    }
  }

  private setupMessageListener(): void {
    window.addEventListener("message", this.messageHandler);
  }

  private rejectPendingMessages(reason: string): void {
    this.pendingMessages.forEach(({ reject }) => reject(new Error(reason)));
    this.pendingMessages.clear();
  }

  private handleStateChangeNotification(notification: any): void {
    const { property, value, source } = notification;

    // Internal loading overlay control is system-driven and must be handled unconditionally
    if (property === "loading") {
      this.isLoading = !!value;
      // Clear error state when loading starts
      if (value) {
        this.hasError = false;
        this.currentErrorMessage = "";
      }
      // Trigger change detection for OnPush scenarios (PostMessage runs outside Angular zone)
      this.cdr.markForCheck();
      return;
    }

    // Two-way [(formData)] sync from user edits in form widgets. Synthetic
    // events from our own set-form-data also land here - the equality check
    // suppresses the echo.
    if (property === "formData") {
      if (!shallowEquals(value, this._formData)) {
        this._formData = value ?? {};
        this.formDataChange.emit(this._formData);
        this.cdr.markForCheck();
      }
      return;
    }

    // Internal error state management
    if (property === "error") {
      this.hasError = !!value;
      if (value && typeof value === "string") {
        this.currentErrorMessage = this.composeErrorMessage(value);
        this.updateErrorTemplateData();
      }
      this.cdr.markForCheck();
      return;
    }

    // Only process user-initiated changes; value-equality checks below are
    // the echo suppression for our own programmatic updates
    if (source !== "user") {
      return;
    }

    switch (property) {
      case "cursor":
        if (this._cursor !== value) {
          this._cursor = PropertyTransformers.transformCursor.fromViewer(value);
          this.cursorChange.emit(this._cursor);
        }
        break;

      case "scroll":
        if (this._scroll !== value) {
          this._scroll = PropertyTransformers.transformScroll.fromViewer(value);
          this.scrollChange.emit(this._scroll);
        }
        break;

      case "spread":
        if (this._spread !== value) {
          this._spread = PropertyTransformers.transformSpread.fromViewer(value);
          this.spreadChange.emit(this._spread);
        }
        break;

      case "pageMode":
        if (this._pageMode !== value) {
          this._pageMode = PropertyTransformers.transformPageMode.fromViewer(value);
          this.pageModeChange.emit(this._pageMode);
        }
        break;

      case "zoom":
      case "rotation":
        // Intentionally ignored: the direct eventBus bindings in
        // bindToPdfJsEventBus are the single channel for zoom/rotation (the
        // wrapper's copy reports a differently-formatted value).
        break;

      default:
        if (this.diagnosticLogs) {
          console.log(`PdfJsViewer: Unknown state change property: ${property}`);
        }
    }
  }

  // Apply the documented errorMessage/errorAppend semantics to the raw
  // viewer error before display
  private composeErrorMessage(raw: string): string {
    if (this.errorMessage) {
      return this.errorAppend ? `${raw} ${this.errorMessage}` : this.errorMessage;
    }
    return raw;
  }

  private handleEventNotification(notification: any): void {
    const { eventName, eventData } = notification;
    if (typeof eventName !== "string" || eventName.length === 0) {
      return;
    }

    // New document: the AI panel's extracted text and chat refer to the old
    // one - drop them. (Falls through to the generic emitter.)
    if (eventName === "documentInit") {
      this.invalidateAiState(true);
      this.cdr.markForCheck();
    }

    // Page add/delete/reorder invalidates extracted text and its page
    // numbers, but the chat history is still about this document.
    if (eventName === "pagesEdited") {
      this.aiDocText = undefined;
    }

    // A failed document load means queued document-gated actions can never
    // run - settle them (and fail-fast later dispatches via the latch) so
    // consumer awaits don't hang forever.
    if (eventName === "documentError") {
      this.documentLoadFailed = true;
      this.actionQueueManager.failDocumentActions(
        "Document failed to load: " + (eventData?.message || "unknown error"),
      );
    }
    // Any sign of a (new) document coming up lifts the latch
    if (eventName === "documentInit" || eventName === "pagesInit") {
      this.documentLoadFailed = false;
    }

    // Mount the per-page overlay template as pages (re-)render. PDF.js may
    // drop appended children on re-render; mounting is idempotent and moves
    // the same embedded-view nodes back in.
    if (eventName === "pageRendered" && this.pageOverlayTpl) {
      const pageNumber = eventData?.pageNumber;
      if (typeof pageNumber === "number") {
        this.mountPageOverlay(pageNumber);
      }
      // fall through to the generic emitter below
    }

    // Two-way [(annotationEditor)] sync: the wrapper relays every editor mode
    // switch, including echoes of our own dispatches - only real changes
    // (user toolbar clicks) update the property and emit.
    if (eventName === "annotationEditorModeChange") {
      const mode = eventData?.mode as AnnotationEditorMode;
      if (mode && mode !== this._annotationEditor) {
        this._annotationEditor = mode;
        this.annotationEditorChange.emit(mode);
        this.cdr.markForCheck();
      }
      return;
    }

    // 'documentError' -> this.onDocumentError, etc.
    const emitter = (this as any)[
      "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1)
    ];
    if (emitter instanceof EventEmitter) {
      emitter.emit(eventData ?? undefined);
    } else if (this.diagnosticLogs) {
      console.log(`PdfJsViewer: Unknown event notification: ${eventName}`);
    }
  }
  // #endregion

  // #region Property Mapping and Update Methods
  private applyChanges(changes: SimpleChanges): void {
    let needsRefresh = false;

    for (const propertyName of Object.keys(changes)) {
      const change = changes[propertyName];
      if (change.currentValue === change.previousValue) {
        continue;
      }

      // PDF.js applies locale only before initialization - reload to switch
      if (
        propertyName === "locale" ||
        (propertyName === "viewerConfig" &&
          change.currentValue?.locale !== change.previousValue?.locale)
      ) {
        needsRefresh = true;
        if (propertyName === "locale") {
          continue;
        }
      }

      // Init-time PDF.js options ride the viewer URL and are read before the
      // postMessage channel exists - a change requires reloading the viewer
      if (
        propertyName === "pdfJsOptions" ||
        propertyName === "enableSignatureEditor" ||
        propertyName === "enableCommentEditor" ||
        propertyName === "enablePageEditing" ||
        propertyName === "pageColors"
      ) {
        needsRefresh = true;
        continue;
      }

      if (
        DOCUMENT_LOAD_PROPS.has(propertyName) ||
        SETTER_DISPATCHED_PROPS.has(propertyName)
      ) {
        continue;
      }

      // Config-object inputs: their setters already copied the values onto
      // the individual properties - propagate those to the viewer. Keys the
      // config never set stay undefined and are skipped. Same-content objects
      // (fresh references from getter bindings) are not real changes.
      const fanout = CONFIG_FANOUT[propertyName];
      if (fanout) {
        if (shallowEquals(change.currentValue, change.previousValue)) {
          continue;
        }
        for (const prop of fanout) {
          const entry = REGISTRY_BY_PROP[prop];
          const v = entry?.get ? entry.get(this) : (this as any)[prop];
          if (v !== undefined) {
            this.dispatchRegisteredProperty(prop, v);
          }
        }
        continue;
      }

      this.dispatchRegisteredProperty(propertyName, change.currentValue);
    }

    if (needsRefresh) {
      this.refresh();
    }
  }

  // Dispatch one registry-backed property to the viewer. Without an explicit
  // value the current (setter-normalized) property value is used.
  private dispatchRegisteredProperty(prop: string, value?: any): void {
    const entry = REGISTRY_BY_PROP[prop];
    if (!entry) {
      return; // not viewer-backed (handled component-side or via URL)
    }
    const v =
      value !== undefined ? value : entry.get ? entry.get(this) : (this as any)[prop];
    this.dispatchAction(
      entry.action,
      entry.payload ? entry.payload(v, this) : v,
      "property-change",
    );
  }

  private applyPendingChanges(): void {
    // Only apply pending changes if PostMessage API is ready
    if (!this.isPostMessageReady) {
      return;
    }

    const changes = this.pendingChanges;
    this.pendingChanges = {};
    if (Object.keys(changes).length > 0) {
      this.applyChanges(changes);
    }
  }
  // #endregion

  // #region PDF.js Event Binding Methods
  /**
   * Waits for the PDF.js viewer to be ready, and binds the the event bus.
   */
  private bindToPdfJsEventBus() {
    // Store the event listener reference so we can remove it later
    const webviewerLoadedHandler = (event?: Event) => {
      // For same-origin embeds PDF.js dispatches 'webviewerloaded' on the
      // PARENT document, so this handler hears the event from EVERY viewer
      // iframe on the page. Only react to our own iframe's dispatch -
      // otherwise instance A re-binds (and duplicates) its eventBus handlers
      // whenever instance B loads, multiplying every relayed event and
      // auto-action.
      const source = (event as CustomEvent | undefined)?.detail?.source;
      if (source && source !== this.iframe?.nativeElement?.contentWindow) {
        return;
      }
      if (this.diagnosticLogs)
        console.debug("PdfJsViewer: webviewerloaded event received");

      // Set locale immediately when PDF.js is loaded but before it initializes
      // https://github.com/mozilla/pdf.js/issues/11829#issuecomment-617668679
      if (this.locale && this.iframe?.nativeElement?.contentWindow) {
        try {
          const iframeWindow = this.iframe.nativeElement.contentWindow;
          if (iframeWindow.PDFViewerApplicationOptions) {
            iframeWindow.PDFViewerApplicationOptions.set("localeProperties", {
              lang: this.locale,
            });
            if (this.diagnosticLogs)
              console.debug(
                `PdfJsViewer: Locale set to ${this.locale} before initialization`,
              );
          }
        } catch (error) {
          if (this.diagnosticLogs)
            console.debug(
              "PdfJsViewer: Could not set locale before initialization:",
              error,
            );
        }
      }

      if (!this.PDFViewerApplication) {
        if (this.diagnosticLogs)
          console.debug(
            "PdfJsViewer: Viewer not yet (or no longer) available, events can not yet be bound.",
          );
        return;
      }

      // https://github.com/mozilla/pdf.js/issues/9527
      this.PDFViewerApplication.initializedPromise.then(() => {
        // Apply any pending changes that occurred before initialization
        this.applyPendingChanges();

        const eventBus = this.PDFViewerApplication.eventBus;

        const handlers: Record<string, (event?: any) => void> = {
          documentloaded: () => {
            this.documentLoaded = true;
            if (this.diagnosticLogs)
              console.debug("PdfJsViewer: The document has now been loaded!");
            this.onDocumentLoad.emit();

            // Queue auto-actions with the property values current at THIS load
            this.queueAutoActionsForDocumentLoad();

            // Execute all queued auto-actions
            this.actionQueueManager.onDocumentLoaded();
          },

          pagesloaded: () => {
            // Auto-print here: the PDF is fully ready for printing
            if (this.printOnLoad === true) {
              this.dispatchAction("trigger-print", true, "initial-load");
            }
          },

          beforeprint: () => this.onBeforePrint.emit(),

          afterprint: () => this.onAfterPrint.emit(),

          pagechanging: (event: any) => {
            this._page = event.pageNumber;
            this.onPageChange.emit(event.pageNumber);
          },

          rotationchanging: (event: any) => {
            this._rotation = PropertyTransformers.transformRotation.fromViewer(
              event.pagesRotation,
            );
            const newRotation: ChangedRotation = {
              rotation: event.pagesRotation,
              page: event.pageNumber,
            };
            this.onRotationChange.emit(newRotation);
          },

          scalechanging: (event: any) => {
            // Named zooms (page-fit, page-width, ...) arrive as presetValue
            // alongside the resolved numeric scale; prefer the name so
            // zoomChange round-trips named values instead of leaking numbers.
            const normalizedZoom =
              typeof event.presetValue === "string" && event.presetValue
                ? event.presetValue
                : PropertyTransformers.transformZoom.fromViewer(event.scale);
            // Value-echo suppression: emit only when the value actually changed
            if (this._zoom !== normalizedZoom) {
              this._zoom = normalizedZoom;
              this.zoomChange.emit(normalizedZoom);
            }
            this.onScaleChange.emit(event.scale as ChangedScale);
          },
        };

        // The eventBus invokes these from the iframe realm, outside the
        // parent's NgZone - without re-entering the zone, consumer bindings
        // driven by these outputs ((onPageChange), [(zoom)], ...) never
        // schedule change detection in zone-based apps.
        const zonedHandlers: Record<string, (event?: any) => void> = {};
        for (const eventName of Object.keys(handlers)) {
          const handler = handlers[eventName];
          zonedHandlers[eventName] = (event?: any) => {
            if (this.ngZone) {
              this.ngZone.run(() => handler(event));
            } else {
              handler(event);
            }
          };
        }

        // Store the registered (zoned) functions so teardown removes the
        // exact listeners that were added
        this.pdfEventHandlers = zonedHandlers;
        for (const eventName of Object.keys(zonedHandlers)) {
          eventBus.on(eventName, zonedHandlers[eventName]);
        }
      });
    };

    // Store the handler reference for cleanup / re-binding on refresh()
    this.webviewerLoadedHandler = webviewerLoadedHandler;

    document.addEventListener("webviewerloaded", webviewerLoadedHandler);
  }

  private teardownPdfJsEventBindings(): void {
    if (this.webviewerLoadedHandler) {
      document.removeEventListener("webviewerloaded", this.webviewerLoadedHandler);
      this.webviewerLoadedHandler = undefined;
    }
    if (this.pdfEventHandlers) {
      const eventBus = this.PDFViewerApplication?.eventBus;
      if (eventBus) {
        for (const eventName of Object.keys(this.pdfEventHandlers)) {
          eventBus.off(eventName, this.pdfEventHandlers[eventName]);
        }
      }
      this.pdfEventHandlers = undefined;
    }
  }
  // #endregion

  // #region Configuration and Action Queue Methods
  // Snapshot every registry-backed property and queue it for the (re)loaded
  // viewer, then enable wrapper-side event notifications.
  private queueAllConfigurations(): void {
    // The whole configuration snapshot ships as ONE batched 'configure'
    // message per readiness level (instead of ~40 individual messages).
    // The wrapper replays each step through its normal control dispatch.
    const batches = new Map<number, Array<{ action: string; payload: any }>>();
    const add = (level: number, action: string, payload: any): void => {
      let steps = batches.get(level);
      if (!steps) {
        batches.set(level, (steps = []));
      }
      steps.push({ action, payload });
    };

    for (const entry of PROPERTY_REGISTRY) {
      if (entry.init === false) {
        continue;
      }
      const value = entry.get ? entry.get(this) : (this as any)[entry.prop];
      const send =
        entry.init === "always" ||
        (entry.init === "truthy" && !!value) ||
        (entry.init === "defined" && value !== undefined) ||
        (entry.init === "true" && value === true) ||
        (entry.init === "nonempty" &&
          typeof value === "string" &&
          value.trim() !== "");
      if (send) {
        add(
          entry.level,
          entry.action,
          entry.payload ? entry.payload(value, this) : value,
        );
      }
    }

    for (const action of ENABLE_EVENT_ACTIONS) {
      add(this.getRequiredReadinessLevel(action), action, true);
    }
    // Idle is opt-in: enabling it installs document-wide activity listeners
    // in the iframe, so only pay for it when someone listens
    if (hasObservers(this.onIdle)) {
      add(this.getRequiredReadinessLevel("enable-idle"), "enable-idle", true);
    }

    // Ascending level order so lower-readiness batches apply first
    for (const level of [...batches.keys()].sort((a, b) => a - b)) {
      this.dispatchAction("configure", batches.get(level), "initial-load", level);
    }
  }

  private queueAutoActionsForDocumentLoad(): void {
    // Use universal dispatcher for auto-actions
    if (this.downloadOnLoad === true) {
      this.dispatchAction("trigger-download", true, "initial-load");
    }

    if (this.showLastPageOnLoad === true) {
      this.dispatchAction("go-to-last-page", true, "initial-load");
    }

    // Auto-print is handled in the pagesloaded handler for timing reasons
  }

  public refresh(): void {
    // Needs to be invoked for external window or when needs to reload pdf

    // The reload swaps the document out from under the AI panel - drop its
    // extracted text/chat and abandon any in-flight request
    this.invalidateAiState(true);

    // Remove stale PDF.js bindings, then re-arm webviewerloaded so the
    // reloaded viewer's events bind again (they used to die after refresh)
    this.teardownPdfJsEventBindings();
    this.bindToPdfJsEventBus();

    // Settle in-flight messages and queued actions from the old load
    this.rejectPendingMessages("Viewer reloading");
    this.actionQueueManager.reset();

    // Reset PostMessage readiness state
    this.isPostMessageReady = false;
    this.postMessageReadiness = 0;
    this.initialConfigQueued = false;

    // Reload the PDF - this will trigger queueAllConfigurations() when PostMessage API is ready
    this.loadPdf();
  }

  // Public method for external control messages
  public sendViewerControlMessage(action: string, payload: any): Promise<any> {
    return this.sendControlMessage(action, payload);
  }

  // #region Public Methods for On-Demand Actions
  public triggerDownload(): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction("trigger-download", true, "user-interaction");
  }

  public triggerPrint(): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction("trigger-print", true, "user-interaction");
  }

  public setPage(page: number): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction("set-page", page, "user-interaction");
  }

  public setZoom(zoom: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction("set-zoom", zoom, "user-interaction");
  }

  public goToLastPage(): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction("go-to-last-page", true, "user-interaction");
  }

  public setCursor(cursor: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    return this.dispatchAction("set-cursor", cursor, "user-interaction");
  }

  public setScroll(scroll: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    return this.dispatchAction("set-scroll", scroll, "user-interaction");
  }

  public setSpread(spread: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    return this.dispatchAction("set-spread", spread, "user-interaction");
  }

  public triggerRotation(
    direction: "cw" | "ccw",
  ): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    const action =
      direction === "cw" ? "trigger-rotate-cw" : "trigger-rotate-ccw";
    return this.dispatchAction(action, true, "user-interaction");
  }

  public goToPage(page: number): Promise<ActionExecutionResult> {
    // Alias for setPage for backward compatibility
    return this.setPage(page);
  }
  // #endregion

  // #region Annotation & Search API
  /**
   * Serialized state of every annotation created or modified in the editor.
   * Send this to a server to persist user annotations.
   */
  public async getAnnotations(): Promise<any[]> {
    const result = await this.dispatchAction(
      "get-annotations",
      null,
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "getAnnotations failed");
    }
    return result.data ?? [];
  }

  /**
   * Restore annotations previously exported with getAnnotations() back into
   * the editor. Each annotation is rebuilt on its own page; annotations for
   * pages that haven't rendered yet apply automatically as those pages
   * render (counted in `pending`). Items with an invalid pageIndex for the
   * current document are skipped (counted in `rejected`). Calling this twice
   * with the same payload creates duplicates - restore is additive. Note:
   * stamp images cannot round-trip (their bitmaps are not serializable).
   */
  public async setAnnotations(
    annotations: any[]
  ): Promise<{ restored: number; pending: number; rejected: number }> {
    const result = await this.dispatchAction(
      "set-annotations",
      annotations ?? [],
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "setAnnotations failed");
    }
    return result.data ?? { restored: 0, pending: 0, rejected: 0 };
  }

  /**
   * The current document - including annotation edits and filled form
   * fields - as a Blob, ready for upload or download.
   */
  public async getDocumentAsBlob(): Promise<Blob> {
    const result = await this.dispatchAction(
      "save-document",
      null,
      "user-interaction"
    );
    if (!result.success || !result.data?.bytes) {
      throw new Error(result.error || "getDocumentAsBlob failed");
    }
    return new Blob([result.data.bytes], { type: "application/pdf" });
  }

  /**
   * Programmatic full-text search. Resolves with totals, per-page match
   * counts and the pages containing matches; matches are highlighted in the
   * viewer (highlightAll defaults to true).
   */
  public async search(
    query: string,
    options?: SearchOptions
  ): Promise<SearchResult> {
    const result = await this.dispatchAction(
      "search",
      { query, ...(options ?? {}) },
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "search failed");
    }
    return result.data as SearchResult;
  }

  /** Move the search selection to the next match. */
  public async searchNext(): Promise<SearchResult> {
    const result = await this.dispatchAction(
      "search-next",
      null,
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "searchNext failed");
    }
    return result.data as SearchResult;
  }

  /** Move the search selection to the previous match. */
  public async searchPrevious(): Promise<SearchResult> {
    const result = await this.dispatchAction(
      "search-previous",
      null,
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "searchPrevious failed");
    }
    return result.data as SearchResult;
  }

  /** Clear search highlights and forget the active query. */
  public clearSearch(): Promise<ActionExecutionResult> {
    return this.dispatchAction("clear-search", null, "user-interaction");
  }

  // Embedded views for pageOverlayTpl, keyed by page number. Views are
  // attached to ApplicationRef so bindings inside stay live.
  private overlayViews = new Map<number, EmbeddedViewRef<any>>();

  private mountPageOverlay(pageNumber: number): void {
    if (!this.pageOverlayTpl || this.externalWindow) return;
    const doc = this.iframe?.nativeElement?.contentDocument;
    const pageEl = doc?.querySelector(
      `.pdfViewer .page[data-page-number="${pageNumber}"]`
    );
    if (!pageEl || pageEl.querySelector(":scope > .ng2-page-overlay")) {
      return;
    }
    let view = this.overlayViews.get(pageNumber);
    if (!view) {
      view = this.pageOverlayTpl.createEmbeddedView({ $implicit: pageNumber });
      this.appRef?.attachView(view);
      view.detectChanges();
      this.overlayViews.set(pageNumber, view);
    }
    const wrapper = doc!.createElement("div");
    wrapper.className = "ng2-page-overlay";
    for (const node of view.rootNodes) {
      wrapper.appendChild(node);
    }
    pageEl.appendChild(wrapper);
  }

  private destroyPageOverlays(): void {
    for (const view of this.overlayViews.values()) {
      this.appRef?.detachView(view);
      view.destroy();
    }
    this.overlayViews.clear();
    // Destroying the views removes their nodes but not the wrapper divs;
    // leftover wrappers would also block the remount guard in mountPageOverlay.
    const doc = this.iframe?.nativeElement?.contentDocument;
    doc
      ?.querySelectorAll(".ng2-page-overlay")
      .forEach((el: Element) => el.remove());
  }

  // Mount overlays on every page div that already exists (used when the
  // template input is set after pages have rendered, e.g. a toggle).
  private mountOverlaysOnRenderedPages(): void {
    const doc = this.iframe?.nativeElement?.contentDocument;
    if (!doc) return;
    doc
      .querySelectorAll(".pdfViewer .page[data-page-number]")
      .forEach((el: Element) => {
        const pageNumber = Number(el.getAttribute("data-page-number"));
        if (pageNumber > 0) {
          this.mountPageOverlay(pageNumber);
        }
      });
  }

  /**
   * Plain text of the document (or a 1-based page range), extracted from the
   * PDF.js text layer. The raw material for BYO-AI chat/summarize flows.
   */
  public async getDocumentText(
    from?: number,
    to?: number
  ): Promise<DocumentPageText[]> {
    // The document may not have finished loading the instant this is called
    // (e.g. an AI 'ask' fired immediately after the viewer appears). Wait for
    // 'documentloaded' so we don't extract empty text; fall back on timeout.
    if (!this.documentLoaded) {
      await this.waitForDocumentLoad(15000);
    }
    const result = await this.dispatchAction(
      "get-document-text",
      { from, to },
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "getDocumentText failed");
    }
    return result.data ?? [];
  }

  /**
   * Resolve once the current document has loaded, or after timeoutMs (in which
   * case callers proceed with whatever the viewer can provide). Never rejects.
   */
  private waitForDocumentLoad(timeoutMs: number): Promise<void> {
    if (this.documentLoaded) return Promise.resolve();
    return new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        sub.unsubscribe();
        clearTimeout(timer);
        resolve();
      };
      const sub = this.onDocumentLoad.subscribe(() => finish());
      const timer = setTimeout(finish, timeoutMs);
    });
  }

  /**
   * Read the document aloud from the current (or given) page using the
   * browser's speech synthesis. Progress arrives on onReadAloudStateChange.
   */
  public startReadAloud(options?: {
    fromPage?: number;
    rate?: number;
  }): Promise<ActionExecutionResult> {
    return this.dispatchAction(
      "read-aloud",
      { command: "start", ...(options ?? {}) },
      "user-interaction"
    );
  }

  public pauseReadAloud(): Promise<ActionExecutionResult> {
    return this.dispatchAction("read-aloud", { command: "pause" }, "user-interaction");
  }

  public resumeReadAloud(): Promise<ActionExecutionResult> {
    return this.dispatchAction("read-aloud", { command: "resume" }, "user-interaction");
  }

  public stopReadAloud(): Promise<ActionExecutionResult> {
    return this.dispatchAction("read-aloud", { command: "stop" }, "user-interaction");
  }

  /**
   * Ask the built-in AI panel a question programmatically (same path the
   * panel's input uses). Requires [aiAssistantConfig]. Document text is
   * extracted once per document and reused across questions.
   */
  public async aiAsk(question: string): Promise<void> {
    const q = (question || "").trim();
    const config = this.aiAssistantConfig;
    if (!q || this.aiBusy || !config) {
      return;
    }
    this.aiBusy = true;
    const generation = this.aiGeneration;
    this.aiAbort = new AbortController();
    const signal = this.aiAbort.signal;
    this.aiMessages.push({ role: "user", content: q, parts: [{ text: q }] });
    this.cdr.markForCheck();
    try {
      if (!this.aiClient || this.aiClientConfig !== config) {
        this.aiClient = new PdfAiAssistant(config);
        this.aiClientConfig = config;
      }
      if (!this.aiDocText) {
        this.aiDocText = await this.getDocumentText();
      }
      const history: PdfAiMessage[] = this.aiMessages
        .slice(0, -1)
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));
      const answer = await this.aiClient.ask(q, this.aiDocText, history, signal);
      if (generation !== this.aiGeneration) {
        return; // document changed mid-flight - stale answer
      }
      this.aiMessages.push({
        role: "assistant",
        content: answer,
        parts: this.parseAiCitations(answer),
      });
    } catch (e: any) {
      if (generation !== this.aiGeneration) {
        return; // aborted by invalidation - already cleaned up
      }
      this.aiMessages.push({
        role: "assistant",
        content: "",
        error: e?.message || "AI request failed",
        parts: [],
      });
    } finally {
      if (generation === this.aiGeneration) {
        this.aiBusy = false;
      }
      this.cdr.markForCheck();
    }
  }

  // Split an answer into text runs and clickable [p.N] page citations
  private parseAiCitations(
    text: string,
  ): Array<{ text?: string; page?: number }> {
    const parts: Array<{ text?: string; page?: number }> = [];
    const re = /\[p\.?\s*(\d+)\]/gi;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        parts.push({ text: text.slice(last, m.index) });
      }
      parts.push({ page: parseInt(m[1], 10) });
      last = m.index + m[0].length;
    }
    if (last < text.length) {
      parts.push({ text: text.slice(last) });
    }
    return parts;
  }

  /**
   * Current AcroForm field values (field name -> value), reflecting any
   * user edits. Returns {} for documents without form fields.
   */
  public async getFormData(): Promise<FormDataMap> {
    const result = await this.dispatchAction(
      "get-form-data",
      null,
      "user-interaction"
    );
    if (!result.success) {
      throw new Error(result.error || "getFormData failed");
    }
    return (result.data ?? {}) as FormDataMap;
  }

  /** Set a single form field by name. */
  public setFormField(
    name: string,
    value: string | boolean | null
  ): Promise<ActionExecutionResult> {
    return this.dispatchAction(
      "set-form-field",
      { name, value },
      "user-interaction"
    );
  }
  // #endregion

  // Action queue management methods
  public getActionStatus(
    actionId: string,
  ): "pending" | "executing" | "completed" | "failed" | "not-found" {
    return this.actionQueueManager.getActionStatus(actionId);
  }

  public getQueueStatus(): { queuedActions: number; executedActions: number } {
    return this.actionQueueManager.getQueueStatus();
  }

  public clearActionQueue(): void {
    this.actionQueueManager.clearQueues();
  }

  /**
   * Enable or disable URL validation security feature
   * When enabled, prevents users from modifying the file parameter in the viewer URL
   * @param enabled - Whether to enable URL validation (default: true)
   * @returns Promise<ActionExecutionResult>
   */
  public setUrlValidation(enabled: boolean = true): Promise<ActionExecutionResult> {
    return this.dispatchAction("set-url-validation", enabled, "user-interaction");
  }

  /**
   * Dismiss the security warning
   */
  public dismissSecurityWarning(): void {
    this.securityWarning = null;
    // Public API called from outside this component's CD context - mark so
    // the overlay clears under OnPush/zoneless consumers
    this.cdr.markForCheck();
  }
  // #endregion

  // #region PDF Loading and URL Handling
  private loadPdf(): void {
    if (!this._src) return;

    // Show spinner immediately when PDF loading starts (Issue #275).
    // markForCheck: loadPdf is reachable from the public refresh() API, where
    // no input-change CD pass marks this (possibly OnPush) view.
    this.isLoading = true;
    this.hasError = false;
    this.currentErrorMessage = "";
    // A new load lifts the failed-document latch (the documentInit relay
    // also clears it, but that is enablement-gated and can race fast loads)
    this.documentLoadFailed = false;
    // Text isn't extractable until the new document finishes loading.
    this.documentLoaded = false;
    this.cdr.markForCheck();

    if (!this.setupExternalWindow()) {
      return; // popup blocked - nothing to navigate
    }

    // Authenticated fetch path: the viewer iframe cannot attach headers to
    // its own request, so the component downloads the document and feeds the
    // viewer a local blob instead.
    if (
      typeof this._src === "string" &&
      (this.httpHeaders || this.withCredentials)
    ) {
      void this.fetchPdfWithAuth(this._src);
      return;
    }

    const fileUrl = this.createFileUrl();
    const viewerUrl = this.buildViewerUrl(fileUrl);
    this.navigateToViewer(viewerUrl);
  }

  private async fetchPdfWithAuth(url: string): Promise<void> {
    const loadToken = ++this.authLoadToken;
    try {
      const response = await fetch(url, {
        headers: this.httpHeaders ?? {},
        credentials: this.withCredentials ? "include" : "same-origin",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      let blob: Blob;
      if (response.body && hasObservers(this.onProgress)) {
        const total =
          Number(response.headers.get("content-length")) || 0;
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loaded = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.byteLength;
          this.onProgress.emit({ loaded, total });
        }
        blob = new Blob(chunks as BlobPart[], { type: "application/pdf" });
      } else {
        blob = await response.blob();
      }

      if (loadToken !== this.authLoadToken) {
        return; // pdfSrc changed while downloading - drop the stale result
      }

      // Hand the bytes to the normal blob path without touching the
      // consumer's pdfSrc (it stays the original string URL).
      this.releaseUrl?.();
      const objectUrl = URL.createObjectURL(blob);
      this.releaseUrl = () => URL.revokeObjectURL(objectUrl);
      const viewerUrl = this.buildViewerUrl(encodeURIComponent(objectUrl));
      this.navigateToViewer(viewerUrl);
    } catch (error) {
      if (loadToken !== this.authLoadToken) {
        return;
      }
      const message =
        error instanceof Error ? error.message : String(error);
      this.isLoading = false;
      this.hasError = true;
      this.currentErrorMessage = this.composeErrorMessage(
        `Failed to fetch PDF: ${message}`
      );
      this.updateErrorTemplateData();
      this.onDocumentError.emit({
        message: this.currentErrorMessage,
        name: "FetchError",
        source: url,
      });
      this.cdr.markForCheck();
    }
  }

  // Returns false when an external window is required but could not be opened
  private setupExternalWindow(): boolean {
    if (!this.externalWindow) return true;

    if (typeof this.viewerTab === "undefined" || this.viewerTab.closed) {
      this.viewerTab = window.open(
        "",
        this.target,
        this.externalWindowOptions || "",
      );
      if (this.viewerTab == null) {
        // Always surface this - it's an actionable consumer-facing failure
        console.error(
          "ng2-pdfjs-viewer: 'externalWindow = true' requires pop-ups to be enabled.",
        );
        return false;
      }

      if (this.showSpinner) {
        this.renderLoadingSpinner();
      }
    }
    return true;
  }

  private renderLoadingSpinner(): void {
        this.viewerTab.document.write(`
          <style>
          .loader {
            position: fixed;
            left: 40%;
            top: 40%;
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          </style>
          <div class="loader"></div>
        `);
    }

  private createFileUrl(): string {
    this.releaseUrl?.();

    if (this._src instanceof Blob) {
      const url = URL.createObjectURL(this._src);
      this.releaseUrl = () => URL.revokeObjectURL(url);
      return encodeURIComponent(url);
    } else if (this._src instanceof Uint8Array) {
      // A typed-array view is a valid BlobPart; using it directly respects
      // byteOffset/byteLength (the raw .buffer of a subarray would not)
      const blob = new Blob([this._src as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      this.releaseUrl = () => URL.revokeObjectURL(url);
      return encodeURIComponent(url);
    } else {
      return this._src;
    }
  }

  private buildViewerUrl(fileUrl: string): string {
    const base = this.viewerFolder
      ? `${this.viewerFolder}/web/viewer.html`
      : `assets/pdfjs/web/viewer.html`;
    // Control params go in the query string first; the file URL is appended
    // LAST. A consumer's file URL may end in a hash fragment that PDF.js reads
    // for navigation (e.g. doc.pdf#search=foo, #page=2). Anything appended
    // after the file param would land inside that fragment instead of the
    // query string - so file trails the whole URL, leaving the hash where
    // PDF.js looks for it. (#305)
    let viewerUrl = `${base}?urlValidation=${this.urlValidation === false ? 0 : 1}`;
    if (typeof this.viewerId !== "undefined") {
      viewerUrl += `&viewerId=${this.viewerId}`;
    }

    // Init-time PDF.js options (signature editor, page colors, passthrough).
    // These are read by PDF.js during initialize() - before the postMessage
    // channel exists - so they ride the viewer URL and are applied by the
    // wrapper at 'webviewerloaded' (after module eval, before run()). The
    // wrapper validates every key against its allowlist.
    const initOptions = this.collectInitTimeOptions();
    if (Object.keys(initOptions).length > 0) {
      viewerUrl += `&pjsOptions=${encodeURIComponent(JSON.stringify(initOptions))}`;
    }

    // Cache-bust in Angular dev mode so editing pdfjs assets takes effect.
    // (Angular's own signal, not a hostname/port heuristic - production apps
    // served from localhost keep clean, cacheable viewer URLs.)
    if (isDevMode()) {
      viewerUrl += `&_t=${Date.now()}`;
    }

    // File last (see above): its optional #hash fragment must trail the URL.
    viewerUrl += `&file=${fileUrl}`;
    return viewerUrl;
  }

  // Merge the dedicated convenience inputs with the raw pdfJsOptions
  // passthrough (dedicated inputs win on conflict).
  private collectInitTimeOptions(): Record<string, string | number | boolean> {
    const options: Record<string, string | number | boolean> = {
      ...(this.pdfJsOptions ?? {}),
    };
    if (this.enableSignatureEditor) {
      options["enableSignatureEditor"] = true;
    }
    if (this.enableCommentEditor) {
      options["enableComment"] = true;
    }
    if (this.enablePageEditing) {
      options["enableMerge"] = true;
      options["enableSplitMerge"] = true;
      options["enableUpdatedAddImage"] = true;
    }
    if (this.pageColors) {
      options["forcePageColors"] = true;
      options["pageColorsBackground"] = this.pageColors.background;
      options["pageColorsForeground"] = this.pageColors.foreground;
    }
    return options;
  }

  private navigateToViewer(viewerUrl: string): void {
    if (this.externalWindow) {
      this.viewerTab.location.href = viewerUrl;
    } else {
      this.iframe.nativeElement.contentWindow.location.replace(viewerUrl);
    }

    if (this.diagnosticLogs) {
      console.debug("PdfJsViewer: loading viewer", {
        viewerUrl,
        pdfSrc: this.pdfSrc,
        externalWindow: this.externalWindow,
        viewerFolder: this.viewerFolder,
        viewerId: this.viewerId,
      });
    }
  }
  // #endregion

  // External-window mode has no postMessage channel (the wrapper runs in the
  // popup, not the hidden iframe) - actions queue forever. Warn once instead
  // of failing silently.
  private externalWindowWarned = false;

  // Set on documentError, cleared when a new load begins: document-gated
  // actions dispatched against a failed load settle immediately instead of
  // queueing forever.
  private documentLoadFailed = false;
  // True once the current document fires 'documentloaded'. getDocumentText()
  // awaits this so an AI 'ask' fired before render doesn't extract empty text.
  private documentLoaded = false;

  // Universal Action Dispatcher - ALL actions go through readiness-based queuing
  private dispatchAction(
    action: string,
    payload: any,
    source:
      | "initial-load"
      | "property-change"
      | "user-interaction" = "property-change",
    level?: number,
  ): Promise<ActionExecutionResult> {
    if (this.externalWindow && !this.externalWindowWarned) {
      this.externalWindowWarned = true;
      console.warn(
        "PdfJsViewer: programmatic actions and event relays are not available " +
          "in externalWindow mode - the postMessage channel only connects to " +
          "the embedded iframe viewer.",
      );
    }
    const requiredReadiness = level ?? this.getRequiredReadinessLevel(action);
    const actionObj: ViewerAction = {
      id: `${source}-${action}-${++this.actionIdCounter}`,
      action: action,
      payload: payload,
      level: level,
    };

    // Document-gated action against a load that already failed: it can never
    // execute - settle now instead of queueing forever.
    if (
      requiredReadiness === 5 &&
      this.documentLoadFailed &&
      !this.actionQueueManager.isDocumentLoaded
    ) {
      return Promise.resolve({
        actionId: actionObj.id,
        success: false,
        error: "Document failed to load",
        timestamp: Date.now(),
      });
    }

    // Check if we have sufficient readiness to execute immediately
    if (this.hasRequiredReadiness(requiredReadiness)) {
      return this.actionQueueManager.executeAction(actionObj);
    }

    // Queue the action; the promise settles when it actually executes (or
    // resolves with success:false if the queue is cleared first)
    this.actionQueueManager.queueAction(actionObj, requiredReadiness);
    return new Promise<ActionExecutionResult>((resolve) => {
      actionObj.resolver = resolve;
    });
  }

  private getRequiredReadinessLevel(action: string): number {
    return ACTION_READINESS[action] ?? 3; // default: EVENTBUS_READY
  }

  private hasRequiredReadiness(requiredLevel: number): boolean {
    if (!this.isPostMessageReady) return false;
    if (requiredLevel === 5 && !this.actionQueueManager.isDocumentLoaded)
      return false;
    return this.postMessageReadiness >= requiredLevel;
  }
}
