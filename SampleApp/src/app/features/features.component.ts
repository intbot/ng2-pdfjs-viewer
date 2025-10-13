import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { ChangedScale, ChangedRotation } from "ng2-pdfjs-viewer";
import { VercelAnalyticsService } from "../services/vercel-analytics.service";
// Additional event data types will be available after library build:
// DocumentError, PagesInfo, PresentationMode, FindOperation, FindMatchesCount,
// DocumentMetadata, DocumentOutline, PageRenderInfo, AnnotationLayerRenderEvent, BookmarkClick

@Component({
  selector: "app-features",
  standalone: false,
  templateUrl: "./features.component.html",
  styleUrls: ["./features.component.scss"],
})
export class FeaturesComponent implements OnInit {
  @ViewChild("pdfViewer", { static: false }) public pdfViewer;

  // Template references for different spinner styles
  @ViewChild("defaultSpinnerTemplate", { static: true })
  defaultSpinnerTemplate!: TemplateRef<any>;
  @ViewChild("dotsSpinnerTemplate", { static: true })
  dotsSpinnerTemplate!: TemplateRef<any>;
  @ViewChild("bounceSpinnerTemplate", { static: true })
  bounceSpinnerTemplate!: TemplateRef<any>;
  @ViewChild("progressSpinnerTemplate", { static: true })
  progressSpinnerTemplate!: TemplateRef<any>;
  @ViewChild("corporateSpinnerTemplate", { static: true })
  corporateSpinnerTemplate!: TemplateRef<any>;

  // Error template references
  @ViewChild("basicErrorTpl", { static: true })
  basicErrorTpl!: TemplateRef<any>;
  @ViewChild("corporateErrorTpl", { static: true })
  corporateErrorTpl!: TemplateRef<any>;
  @ViewChild("minimalistErrorTpl", { static: true })
  minimalistErrorTpl!: TemplateRef<any>;
  @ViewChild("gradientErrorTpl", { static: true })
  gradientErrorTpl!: TemplateRef<any>;
  @ViewChild("darkErrorTpl", { static: true }) darkErrorTpl!: TemplateRef<any>;
  @ViewChild("interactiveErrorTpl", { static: true })
  interactiveErrorTpl!: TemplateRef<any>;

  // Configuration properties - directly bound to the viewer
  public pdfSrc: string | Blob | Uint8Array = "/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf";
  public downloadFileName = "sample-document.pdf";
  public diagnosticLogs = false;

  // Control visibility using individual properties (traditional approach)
  public showOpenFile = true;
  public showDownload = true;
  public showPrint = true;
  public showFullScreen = true;
  public showFind = true;
  public showViewBookmark = true;
  public showAnnotations = false;

  // Group visibility (toolbar/sidebar)
  public showToolbarLeft = true;
  public showToolbarMiddle = true;
  public showToolbarRight = true;
  public showSecondaryToolbarToggle = true;
  public showSidebar = true;
  public showSidebarLeft = true;
  public showSidebarRight = true;

  // Auto Actions
  public downloadOnLoad = false;
  public printOnLoad = false;
  public showLastPageOnLoad = false;

  // Error display customization
  public customErrorTpl: TemplateRef<any> | null = null;
  public errorClass: string = "";
  public selectedErrorExample: string = "";

  // Error display examples
  public errorExamples = [
    { value: "", label: "Default Error" },
    { value: "basic", label: "Basic Error with Company Branding" },
    { value: "corporate", label: "Professional Corporate Style" },
    { value: "minimalist", label: "Clean Minimalist Style" },
    { value: "gradient", label: "Modern Gradient Style" },
    { value: "dark", label: "Dark Theme Style" },
    { value: "interactive", label: "Interactive Animated Style" },
  ];
  public rotateCW = false;
  public rotateCCW = false;

  // Two-way binding properties
  // Separated zoom demo - no two-way binding
  public currentZoom = "auto"; // What we send TO the PDF viewer
  public detectedZoom = "auto"; // What we receive FROM the PDF viewer
  public lastZoomSource = "initial"; // Track the source of zoom changes
  public cursor = "select";
  public scroll = "vertical";
  public spread = "none";
  public pageMode = "none";
  public rotation = 0;

  // Navigation
  public page = 1;
  public namedDest: string | undefined;

  // Configuration options
  public locale = "en-US";
  public useOnlyCssZoom = false;
  public showSpinner = true;

  // Error handling
  public errorOverride = false;
  public errorAppend = true;
  public errorMessage = "Custom error message for demonstration";

  // Theme & Visual Customization
  public theme: "light" | "dark" | "auto" = "light";
  public primaryColor = "#007acc";
  public backgroundColor = "";
  public pageBorderColor = "";
  public toolbarColor = "";
  public textColor = "";
  public borderRadius = "4px";
  public customCSS = "";

  // Spinner demo
  public useCustomSpinnerTpl = false;
  public selectedSpinnerTemplate = "default"; // New: template selection
  public spinnerCssClass = "demo-spinner-overlay";

  // Status bar / layout helpers
  public loading = false;
  public sidenavOpened = false; // reserved for future sidenav step

  // Layout customization (demo bindings)
  public toolbarDensity: "default" | "compact" | "comfortable" = "default";
  public sidebarWidth = "";
  public toolbarPosition: "top" | "bottom" = "top";
  public sidebarPosition: "left" | "right" = "left";
  public responsiveBreakpoint = "";

  // Event feed model
  public eventFeed: Array<{ time: string; type: string; data?: any }> = [];
  public feedPaused = false;
  public feedFilter: Set<string> = new Set();

  // Getter for filtered events
  get filteredEventFeed() {
    if (this.feedFilter.size === 0) {
      return this.eventFeed;
    }
    return this.eventFeed.filter((event) => this.feedFilter.has(event.type));
  }

  private pushEventToFeed(type: string, data?: any) {
    if (this.feedPaused) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour12: false });
    // Always add to eventFeed, filtering happens in the getter
    this.eventFeed.unshift({ time, type, data });
    if (this.eventFeed.length > 200) this.eventFeed.pop();
  }

  // Event tracking for demonstration
  public eventCounts = {
    documentLoad: 0,
    pageChange: 0,
    scaleChange: 0,
    rotationChange: 0,
    beforePrint: 0,
    afterPrint: 0,
    // New high-value events (13 total)
    documentError: 0,
    documentInit: 0,
    pagesInit: 0,
    presentationModeChanged: 0,
    openFile: 0,
    find: 0,
    updateFindMatchesCount: 0,
    metadataLoaded: 0,
    outlineLoaded: 0,
    pageRendered: 0,
    annotationLayerRendered: 0,
    bookmarkClick: 0,
    idle: 0,
  };

  // Blinking animation tracking
  public blinkingEvents = {
    documentLoad: false,
    pageChange: false,
    scaleChange: false,
    rotationChange: false,
    beforePrint: false,
    afterPrint: false,
    // New high-value events (13 total)
    documentError: false,
    documentInit: false,
    pagesInit: false,
    presentationModeChanged: false,
    openFile: false,
    find: false,
    updateFindMatchesCount: false,
    metadataLoaded: false,
    outlineLoaded: false,
    pageRendered: false,
    annotationLayerRendered: false,
    bookmarkClick: false,
    idle: false,
  };

  // Current state display
  public currentPage = 1;
  public currentScale = 1;
  public currentRotation = 0;
  public totalPages = 0;

  constructor(private analytics: VercelAnalyticsService) {}

  ngOnInit() {
    // Initialize detected zoom display
    this.detectedZoom = this.formatZoomDisplay(1.0); // Default to 100%
    this.lastZoomSource = "initial";
  }

  // Get the selected spinner template reference
  getSelectedSpinnerTemplate(): TemplateRef<any> | null {
    switch (this.selectedSpinnerTemplate) {
      case "dots":
        return this.dotsSpinnerTemplate;
      case "bounce":
        return this.bounceSpinnerTemplate;
      case "progress":
        return this.progressSpinnerTemplate;
      case "corporate":
        return this.corporateSpinnerTemplate;
      default:
        return this.defaultSpinnerTemplate;
    }
  }

  // Zoom demo methods (Angular → PDF direction)
  setZoom(zoomValue: string) {
    this.currentZoom = zoomValue;
    this.lastZoomSource = "Angular button click";
  }

  // Format zoom value for display (PDF → Angular direction)
  formatZoomDisplay(scale: number | string): string {
    if (typeof scale === "number") {
      return `${Math.round(scale * 100)}%`;
    }
    return scale?.toString() || "auto";
  }

  // Event handlers - clean and simple with blinking animation
  public onDocumentLoad() {
    this.eventCounts.documentLoad++;
    this.triggerBlink("documentLoad");
    if (this.pdfViewer?.PDFViewerApplication) {
      this.totalPages = this.pdfViewer.PDFViewerApplication.pagesCount || 0;
    }

    // Track PDF load event
    this.analytics.trackPdfViewerEvent('pdf_loaded', {
      totalPages: this.totalPages,
      source: 'features_demo'
    });

    this.pushEventToFeed("documentLoad");
  }

  public onPageChange(pageNumber: number) {
    this.eventCounts.pageChange++;
    this.triggerBlink("pageChange");
    this.currentPage = pageNumber;
    this.page = pageNumber; // Fix: Update the property bound to the viewer

    this.pushEventToFeed("pageChange", { pageNumber });
  }

  public onScaleChange(scale: ChangedScale) {
    this.eventCounts.scaleChange++;
    this.triggerBlink("scaleChange");
    this.currentScale = scale;

    // Update detected zoom display (PDF → Angular direction)
    this.detectedZoom = this.formatZoomDisplay(scale);
    this.lastZoomSource = "PDF viewer user action";

    this.pushEventToFeed("scaleChange", { scale });
  }

  public onRotationChange(rotation: ChangedRotation) {
    this.eventCounts.rotationChange++;
    this.triggerBlink("rotationChange");
    this.currentRotation = rotation.rotation;
    // Update the rotation property since we now use one-way binding
    this.rotation = rotation.rotation;

    this.pushEventToFeed("rotationChange", rotation);
  }

  public onBeforePrint() {
    this.eventCounts.beforePrint++;
    this.triggerBlink("beforePrint");

    this.pushEventToFeed("beforePrint");
  }

  public onAfterPrint() {
    this.eventCounts.afterPrint++;
    this.triggerBlink("afterPrint");

    this.pushEventToFeed("afterPrint");
  }

  // New High-Value Event Handlers (13 total)
  public onDocumentError(error: any) {
    this.eventCounts.documentError++;
    this.triggerBlink("documentError");
    console.log("🎬 Features Demo: Document error:", error);
    this.pushEventToFeed("documentError", error);
  }

  // Error display example selection
  public onErrorExampleChange(): void {
    if (!this.selectedErrorExample) {
      this.errorClass = "";
      this.customErrorTpl = null;
      return;
    }

    this.errorClass = this.selectedErrorExample + "-error-style";
    // Set the appropriate template based on selection
    this.setErrorTemplate(this.selectedErrorExample);
  }

  private setErrorTemplate(templateName: string): void {
    switch (templateName) {
      case "basic":
        this.customErrorTpl = this.basicErrorTpl;
        break;
      case "corporate":
        this.customErrorTpl = this.corporateErrorTpl;
        break;
      case "minimalist":
        this.customErrorTpl = this.minimalistErrorTpl;
        break;
      case "gradient":
        this.customErrorTpl = this.gradientErrorTpl;
        break;
      case "dark":
        this.customErrorTpl = this.darkErrorTpl;
        break;
      case "interactive":
        this.customErrorTpl = this.interactiveErrorTpl;
        break;
      default:
        this.customErrorTpl = null;
    }
  }

  public onDocumentInit() {
    this.eventCounts.documentInit++;
    this.triggerBlink("documentInit");

    this.pushEventToFeed("documentInit");
  }

  public onPagesInit(pagesInfo: any) {
    this.eventCounts.pagesInit++;
    this.triggerBlink("pagesInit");

    this.pushEventToFeed("pagesInit", pagesInfo);
  }

  public onPresentationModeChanged(mode: any) {
    this.eventCounts.presentationModeChanged++;
    this.triggerBlink("presentationModeChanged");

    this.pushEventToFeed("presentationModeChanged", mode);
  }

  public onOpenFile() {
    this.eventCounts.openFile++;
    this.triggerBlink("openFile");

    this.pushEventToFeed("openFile");
  }

  public onFind(findData: any) {
    this.eventCounts.find++;
    this.triggerBlink("find");

    this.pushEventToFeed("find", findData);
  }

  public onUpdateFindMatchesCount(matchData: any) {
    this.eventCounts.updateFindMatchesCount++;
    this.triggerBlink("updateFindMatchesCount");

    this.pushEventToFeed("updateFindMatchesCount", matchData);
  }

  public onMetadataLoaded(metadata: any) {
    this.eventCounts.metadataLoaded++;
    this.triggerBlink("metadataLoaded");

    this.pushEventToFeed("metadataLoaded", metadata);
  }

  public onOutlineLoaded(outline: any) {
    this.eventCounts.outlineLoaded++;
    this.triggerBlink("outlineLoaded");

    this.pushEventToFeed("outlineLoaded", outline);
  }

  public onPageRendered(pageInfo: any) {
    this.eventCounts.pageRendered++;
    this.triggerBlink("pageRendered");

    this.pushEventToFeed("pageRendered", pageInfo);
  }

  public onAnnotationLayerRendered(annotationInfo: any) {
    this.eventCounts.annotationLayerRendered++;
    this.triggerBlink("annotationLayerRendered");

    this.pushEventToFeed("annotationLayerRendered", annotationInfo);
  }

  public onBookmarkClick(bookmarkData: any) {
    this.eventCounts.bookmarkClick++;
    this.triggerBlink("bookmarkClick");

    this.pushEventToFeed("bookmarkClick", bookmarkData);
  }

  public onIdle() {
    this.eventCounts.idle++;
    this.triggerBlink("idle");

    this.pushEventToFeed("idle");
  }

  // Trigger blinking animation for event counters
  private triggerBlink(eventType: keyof typeof this.blinkingEvents) {
    this.blinkingEvents[eventType] = true;
    setTimeout(() => {
      this.blinkingEvents[eventType] = false;
    }, 1000); // Blink for 1 second
  }

  // Simple action methods using the library's public API
  public async triggerDownload() {
    try {
      const result = await this.pdfViewer.triggerDownload();
      
      // Track download event
      this.analytics.trackPdfViewerEvent('download_clicked', {
        success: true,
        source: 'features_demo'
      });
      } catch (error) {
      console.error("🎬 Features Demo: Download failed:", error);
      
      // Track failed download
      this.analytics.trackPdfViewerEvent('download_failed', {
        error: error.message,
        source: 'features_demo'
      });
    }
  }

  public async triggerPrint() {
      try {
      const result = await this.pdfViewer.triggerPrint();
      
      // Track print event
      this.analytics.trackPdfViewerEvent('print_clicked', {
        success: true,
        source: 'features_demo'
      });
      } catch (error) {
      console.error("🎬 Features Demo: Print failed:", error);
      
      // Track failed print
      this.analytics.trackPdfViewerEvent('print_failed', {
        error: error.message,
        source: 'features_demo'
      });
    }
  }

  public async goToPage(pageNumber: number) {
      try {
      const result = await this.pdfViewer.goToPage(pageNumber);
      } catch (error) {
      console.error("🎬 Features Demo: Navigation failed:", error);
    }
  }

  public async rotateClockwise() {
      try {
      const result = await this.pdfViewer.triggerRotation("cw");
      } catch (error) {
      console.error("🎬 Features Demo: Rotation failed:", error);
    }
  }

  public async rotateCounterClockwise() {
      try {
      const result = await this.pdfViewer.triggerRotation("ccw");
      } catch (error) {
      console.error("🎬 Features Demo: Rotation failed:", error);
    }
  }

  // Test Blob and Uint8Array loading (Issue #283)
  public currentSourceType: 'string' | 'blob' | 'uint8array' = 'string';
  
  public async loadBlobPdf() {
    try {
      console.log("🧪 Testing Blob pdfSrc loading...");
      const response = await fetch('/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf');
      const blob = await response.blob();
      this.pdfSrc = blob;
      this.currentSourceType = 'blob';
      console.log("✅ Blob pdfSrc set successfully:", blob);
    } catch (error) {
      console.error("❌ Blob loading failed:", error);
    }
  }
  
  public async loadUint8ArrayPdf() {
    try {
      console.log("🧪 Testing Uint8Array pdfSrc loading...");
      const response = await fetch('/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf');
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      this.pdfSrc = uint8Array;
      this.currentSourceType = 'uint8array';
      console.log("✅ Uint8Array pdfSrc set successfully:", uint8Array);
    } catch (error) {
      console.error("❌ Uint8Array loading failed:", error);
    }
  }
  
  public loadStringPdf() {
    console.log("🧪 Testing string pdfSrc loading...");
    this.pdfSrc = "/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf";
    this.currentSourceType = 'string';
    console.log("✅ String pdfSrc set successfully");
  }

  // Convenience setter demonstrations
  public useTraditionalApproach = true;

  public get controlVisibilityConfig() {
    return {
      download: this.showDownload,
      print: this.showPrint,
      find: this.showFind,
      fullScreen: this.showFullScreen,
      openFile: this.showOpenFile,
      viewBookmark: this.showViewBookmark,
      annotations: this.showAnnotations,
    };
  }

  public get autoActionsConfig() {
    return {
      downloadOnLoad: this.downloadOnLoad,
      printOnLoad: this.printOnLoad,
      showLastPageOnLoad: this.showLastPageOnLoad,
    };
  }

  public get viewerConfig() {
    return {
      diagnosticLogs: this.diagnosticLogs,
      useOnlyCssZoom: this.useOnlyCssZoom,
      locale: this.locale,
    };
  }

  public get errorConfig() {
    return {
      override: this.errorOverride,
      append: this.errorAppend,
      message: this.errorMessage,
    };
  }

  public get themeConfig() {
    return {
      theme: this.theme,
      primaryColor: this.primaryColor,
      backgroundColor: this.backgroundColor,
      pageBorderColor: this.pageBorderColor,
      toolbarColor: this.toolbarColor,
      textColor: this.textColor,
      borderRadius: this.borderRadius,
      customCSS: this.customCSS,
    };
  }

  // Reset event counters for demo purposes
  public resetEventCounts() {
    this.eventCounts = {
      documentLoad: 0,
      pageChange: 0,
      scaleChange: 0,
      rotationChange: 0,
      beforePrint: 0,
      afterPrint: 0,
      // New high-value events (13 total)
      documentError: 0,
      documentInit: 0,
      pagesInit: 0,
      presentationModeChanged: 0,
      openFile: 0,
      find: 0,
      updateFindMatchesCount: 0,
      metadataLoaded: 0,
      outlineLoaded: 0,
      pageRendered: 0,
      annotationLayerRendered: 0,
      bookmarkClick: 0,
      idle: 0,
    };
    this.blinkingEvents = {
      documentLoad: false,
      pageChange: false,
      scaleChange: false,
      rotationChange: false,
      beforePrint: false,
      afterPrint: false,
      // New high-value events (13 total)
      documentError: false,
      documentInit: false,
      pagesInit: false,
      presentationModeChanged: false,
      openFile: false,
      find: false,
      updateFindMatchesCount: false,
      metadataLoaded: false,
      outlineLoaded: false,
      pageRendered: false,
      annotationLayerRendered: false,
      bookmarkClick: false,
      idle: false,
    };
  }

  // Auto-actions only execute on component creation, not property changes.
  // Use trackBy key to force component recreation for testing.
  public viewerTrackingKey = Date.now();
  public trackByKey = (index: number, item: any): any => item;

  // Reload viewer - forces complete component destruction and recreation
  public reloadViewer() {
    // Reset event counters to better show auto action effects
    this.resetEventCounts();

    // Force complete component recreation by changing the tracking key
    const previousKey = this.viewerTrackingKey;
    this.viewerTrackingKey = Date.now();
    console.log(
      `🎬 Features Demo: Component tracking key changed from ${previousKey} to ${this.viewerTrackingKey} - component will be recreated`,
    );
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

  // Reload viewer to test loading spinner - forces complete component destruction and recreation
  public testLoadingSpinner() {
    // Force complete component recreation by changing the tracking key
    const previousKey = this.viewerTrackingKey;
    this.viewerTrackingKey = Date.now();
    console.log(
      `🎬 Features Demo: Component tracking key changed from ${previousKey} to ${this.viewerTrackingKey} - component will be recreated`,
    );
  }

  // Test error handling
  public testError() {
    this.pdfSrc = "invalid-url.pdf";
    this.reloadViewer(); // Reload the component to apply the error
  }

  public restoreValidPdf() {
    this.pdfSrc = "/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf";
    console.log("Restored valid PDF");
    this.reloadViewer(); // Reload the component to apply the valid PDF
  }

  // Toggle methods for Control Visibility buttons
  public toggleShowOpenFile() {
    this.showOpenFile = !this.showOpenFile;
  }

  public toggleShowDownload() {
    this.showDownload = !this.showDownload;
  }

  public toggleShowPrint() {
    this.showPrint = !this.showPrint;
  }

  public toggleShowFullScreen() {
    this.showFullScreen = !this.showFullScreen;
  }

  public toggleShowFind() {
    this.showFind = !this.showFind;
  }

  public toggleShowViewBookmark() {
    this.showViewBookmark = !this.showViewBookmark;
  }

  public toggleShowAnnotations() {
    this.showAnnotations = !this.showAnnotations;
  }

  // Toggle methods for Group Visibility buttons
  public toggleShowToolbarLeft() {
    this.showToolbarLeft = !this.showToolbarLeft;
  }

  public toggleShowToolbarMiddle() {
    this.showToolbarMiddle = !this.showToolbarMiddle;
  }

  public toggleShowToolbarRight() {
    this.showToolbarRight = !this.showToolbarRight;
  }

  public toggleShowSecondaryToolbarToggle() {
    this.showSecondaryToolbarToggle = !this.showSecondaryToolbarToggle;
  }

  public toggleShowSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  public toggleShowSidebarLeft() {
    this.showSidebarLeft = !this.showSidebarLeft;
  }

  public toggleShowSidebarRight() {
    this.showSidebarRight = !this.showSidebarRight;
  }

  // Error testing methods
  public testInvalidUrlError() {
    this.pdfSrc = "https://invalid-url-that-does-not-exist.pdf";
    console.log(
      "Testing invalid URL error with custom message:",
      this.errorMessage,
    );
    this.reloadViewer(); // Reload the component to apply the error
  }

  public testCorruptedFileError() {
    // Use a valid URL but with a file that's not a PDF
    this.pdfSrc = "https://httpbin.org/json";
    console.log(
      "Testing corrupted file error with custom message:",
      this.errorMessage,
    );
    this.reloadViewer(); // Reload the component to apply the error
  }

  public testPasswordProtectedError() {
    // Use a password-protected PDF URL (this is a common test PDF)
    this.pdfSrc =
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    console.log(
      "Testing password protected error with custom message:",
      this.errorMessage,
    );
    this.reloadViewer(); // Reload the component to apply the error
  }
}
