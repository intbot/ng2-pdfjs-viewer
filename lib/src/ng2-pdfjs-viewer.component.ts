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
} from "./interfaces/ViewerTypes";
import { ActionQueueManager } from "./managers/ActionQueueManager";
import { PropertyTransformers } from "./utils/PropertyTransformers";

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
  { prop: "showSidebar", action: "show-sidebar", level: 3, init: "always" },
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
  { prop: "downloadFileName", action: "set-download-filename", level: 5, init: "truthy" },
  { prop: "urlValidation", action: "set-url-validation", level: 3, init: false },
  { prop: "diagnosticLogs", action: "set-diagnostic-logs", level: 3, init: false },
];

const REGISTRY_BY_PROP: Record<string, PropertyRegistration> = {};
const ACTION_READINESS: Record<string, number> = {
  // On-demand triggers without an owning property
  "trigger-download": 5,
  "trigger-print": 5,
  "go-to-last-page": 5,
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
  viewerConfig: ["useOnlyCssZoom"],
  autoActions: ["rotateCW", "rotateCCW"],
  errorHandling: [],
};

function hasObservers(emitter: EventEmitter<any>): boolean {
  return (
    (emitter as any).observed === true ||
    ((emitter as any).observers?.length ?? 0) > 0
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
    <div class="ng2-pdfjs-viewer-container">
      <iframe
        [title]="iframeTitle || 'PDF document viewer'"
        [hidden]="externalWindow || (!externalWindow && !pdfSrc)"
        sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-downloads"
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
  @ViewChild("iframe", { static: true }) iframe: ElementRef;

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
  // #endregion

  // #region Basic Configuration Properties
  @Input() public viewerFolder: string;
  @Input() public externalWindow: boolean = false;
  @Input() public target: string = "_blank";
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public locale: string;
  @Input() public useOnlyCssZoom: boolean = false;
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
  @Input() public showAnnotations: boolean = false;
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
  @Input() public namedDest: string;
  // #endregion

  // #region Error Handling Properties
  @Input() public errorOverride: boolean = false;
  @Input() public errorAppend: boolean = true;
  @Input() public errorMessage: string;
  @Input() public urlValidation: boolean = true;
  @Input() public customSecurityTpl: TemplateRef<any>;
  
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
  @Input() public externalWindowOptions: string;
  public viewerTab: any;
  // #endregion

  // #region Security Properties
  // iframe sandbox is static for security and Angular compliance
  // #endregion

  // #region iframe Properties
  @Input() public iframeBorder: string | number = "0";
  // #endregion

  // #region Private Properties
  private _src: string | Blob | Uint8Array;
  private _page: number;
  private isPostMessageReady = false;
  private postMessageReadiness = 0;
  private initialConfigQueued = false;
  private actionQueueManager: ActionQueueManager = new ActionQueueManager(this._diagnosticLogs);
  private cdr: ChangeDetectorRef;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }
  private messageIdCounter = 0;
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
      if (this.iframe.nativeElement.contentWindow) {
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
      if (this.iframe.nativeElement.contentWindow) {
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
  ngOnInit(): void {   
    
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
      // Coalesce per property - only the latest value matters once ready
      Object.assign(this.pendingChanges, changes);
    }
  }

  ngOnDestroy(): void {
    // Remove the window message listener - without this every destroyed
    // instance stays rooted forever and keeps processing viewer messages
    window.removeEventListener("message", this.messageHandler);

    // Clean up PDF.js event listeners
    this.teardownPdfJsEventBindings();

    // Settle in-flight promises and queued actions so consumer awaits don't
    // hang forever
    this.rejectPendingMessages("Viewer destroyed");
    this.actionQueueManager.clearQueues();

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
          this.getRequiredReadinessLevel(actionObj.action),
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
    }
  };

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

      if (
        DOCUMENT_LOAD_PROPS.has(propertyName) ||
        SETTER_DISPATCHED_PROPS.has(propertyName)
      ) {
        continue;
      }

      // Config-object inputs: their setters already copied the values onto
      // the individual properties - propagate those to the viewer. Keys the
      // config never set stay undefined and are skipped.
      const fanout = CONFIG_FANOUT[propertyName];
      if (fanout) {
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
    const webviewerLoadedHandler = () => {
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

        this.pdfEventHandlers = handlers;
        for (const eventName of Object.keys(handlers)) {
          eventBus.on(eventName, handlers[eventName]);
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
        this.dispatchAction(
          entry.action,
          entry.payload ? entry.payload(value, this) : value,
          "initial-load",
        );
      }
    }

    for (const action of ENABLE_EVENT_ACTIONS) {
      this.dispatchAction(action, true, "initial-load");
    }
    // Idle is opt-in: enabling it installs document-wide activity listeners
    // in the iframe, so only pay for it when someone listens
    if (hasObservers(this.onIdle)) {
      this.dispatchAction("enable-idle", true, "initial-load");
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
  }
  // #endregion

  // #region PDF Loading and URL Handling
  private loadPdf(): void {
    if (!this._src) return;

    // Show spinner immediately when PDF loading starts (Issue #275)
    this.isLoading = true;
    this.hasError = false;
    this.currentErrorMessage = "";

    if (!this.setupExternalWindow()) {
      return; // popup blocked - nothing to navigate
    }
    const fileUrl = this.createFileUrl();
    const viewerUrl = this.buildViewerUrl(fileUrl);
    this.navigateToViewer(viewerUrl);
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
      const blob = new Blob([this._src], { type: "application/pdf" });
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
    let viewerUrl = `${base}?file=${fileUrl}`;
    if (typeof this.viewerId !== "undefined") {
      viewerUrl += `&viewerId=${this.viewerId}`;
    }
    viewerUrl += `&urlValidation=${this.urlValidation === false ? 0 : 1}`;
    // Cache-bust on dev hosts so editing pdfjs assets takes effect
    if (this.isDevelopmentMode()) {
      viewerUrl += `&_t=${Date.now()}`;
    }
    return viewerUrl;
  }

  private isDevelopmentMode(): boolean {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port === "4200" ||
      window.location.href.includes("localhost:4200")
    );
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

  // Universal Action Dispatcher - ALL actions go through readiness-based queuing
  private dispatchAction(
    action: string,
    payload: any,
    source:
      | "initial-load"
      | "property-change"
      | "user-interaction" = "property-change",
  ): Promise<ActionExecutionResult> {
    const requiredReadiness = this.getRequiredReadinessLevel(action);
    const actionObj: ViewerAction = {
      id: `${source}-${action}-${Date.now()}`,
      action: action,
      payload: payload,
    };

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
