import { Component, OnInit, ViewChild } from '@angular/core';
import { ChangedScale, ChangedRotation } from 'ng2-pdfjs-viewer';
// Additional event data types will be available after library build:
// DocumentError, PagesInfo, PresentationMode, FindOperation, FindMatchesCount,
// DocumentMetadata, DocumentOutline, PageRenderInfo, AnnotationLayerRenderEvent, BookmarkClick

@Component({
  selector: 'app-features',
  standalone: false,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  @ViewChild('pdfViewer', { static: false }) public pdfViewer;

  // Configuration properties - directly bound to the viewer
  public pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
  public downloadFileName = 'sample-document.pdf';
  public diagnosticLogs = true; // Temporarily enabled for debugging theme issues

  // Control visibility using individual properties (traditional approach)
  public showOpenFile = true;
  public showDownload = true;
  public showPrint = true;
  public showFullScreen = true;
  public showFind = true;
  public showViewBookmark = true;
  public showAnnotations = false;

  // Auto Actions
  public downloadOnLoad = false;
  public printOnLoad = false;
  public showLastPageOnLoad = false;
  public rotateCW = false;
  public rotateCCW = false;

  // Two-way binding properties
  public zoom = 'auto';
  public cursor = 'select';
  public scroll = 'vertical';
  public spread = 'none';
  public pageMode = 'none';
  public rotation = 0;

  // Navigation
  public page = 1;
  public namedDest: string | undefined;

  // Configuration options
  public locale = 'en-US';
  public useOnlyCssZoom = false;
  public showSpinner = true;

  // Error handling
  public errorOverride = false;
  public errorAppend = true;
  public errorMessage = 'Custom error message for demonstration';

  // Theme & Visual Customization (Phase 1)
  public theme: 'light' | 'dark' | 'auto' = 'light';
  public primaryColor = '#007acc';
  public backgroundColor = '';
  public pageBackgroundColor = '';
  public toolbarColor = '';
  public textColor = '';
  public borderRadius = '4px';
  public customCSS = '';

  // Spinner demo (Phase 2)
  public useCustomSpinnerTpl = false;
  public useCustomSpinnerHtml = false;
  public customSpinnerHtml = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:#444"><div style="width:36px;height:36px;border:4px dashed #3f51b5;border-radius:50%;animation:ng2-spin 1s linear infinite"></div><div>Preparing document…</div></div>';
  public spinnerCssClass = 'demo-spinner-overlay';

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
    idle: 0
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
    idle: false
  };

  // Current state display
  public currentPage = 1;
  public currentScale = 1;
  public currentRotation = 0;
  public totalPages = 0;

  constructor() { }

  ngOnInit() {
    console.log('🎬 Features Demo: Component initialized');
  }

  // Event handlers - clean and simple with blinking animation
  public onDocumentLoad() {
    this.eventCounts.documentLoad++;
    this.triggerBlink('documentLoad');
    if (this.pdfViewer?.PDFViewerApplication) {
      this.totalPages = this.pdfViewer.PDFViewerApplication.pagesCount || 0;
    }
    console.log('🎬 Features Demo: Document loaded, total pages:', this.totalPages);
  }

  public onPageChange(pageNumber: number) {
    this.eventCounts.pageChange++;
    this.triggerBlink('pageChange');
    this.currentPage = pageNumber;
    this.page = pageNumber; // Fix: Update the property bound to the viewer
    console.log('🎬 Features Demo: Page changed to:', pageNumber);
  }

  public onScaleChange(scale: ChangedScale) {
    this.eventCounts.scaleChange++;
    this.triggerBlink('scaleChange');
    this.currentScale = scale;
    this.zoom = scale.toString(); // Fix: ChangedScale is a number, convert to string for zoom property
    console.log('🎬 Features Demo: Scale changed to:', scale);
  }

  public onRotationChange(rotation: ChangedRotation) {
    this.eventCounts.rotationChange++;
    this.triggerBlink('rotationChange');
    this.currentRotation = rotation.rotation;
    this.rotation = rotation.rotation; // Fix: Update the property bound to the dropdown
    console.log('🎬 Features Demo: Rotation changed to:', rotation.rotation);
  }

  public onBeforePrint() {
    this.eventCounts.beforePrint++;
    this.triggerBlink('beforePrint');
    console.log('🎬 Features Demo: Before print event');
  }

  public onAfterPrint() {
    this.eventCounts.afterPrint++;
    this.triggerBlink('afterPrint');
    console.log('🎬 Features Demo: After print event');
  }

  // New High-Value Event Handlers (13 total)
  public onDocumentError(error: any) {
    this.eventCounts.documentError++;
    this.triggerBlink('documentError');
    console.log('🎬 Features Demo: Document error:', error);
  }

  public onDocumentInit() {
    this.eventCounts.documentInit++;
    this.triggerBlink('documentInit');
    console.log('🎬 Features Demo: Document init event');
  }

  public onPagesInit(pagesInfo: any) {
    this.eventCounts.pagesInit++;
    this.triggerBlink('pagesInit');
    console.log('🎬 Features Demo: Pages init event:', pagesInfo);
  }

  public onPresentationModeChanged(mode: any) {
    this.eventCounts.presentationModeChanged++;
    this.triggerBlink('presentationModeChanged');
    console.log('🎬 Features Demo: Presentation mode changed:', mode);
  }

  public onOpenFile() {
    this.eventCounts.openFile++;
    this.triggerBlink('openFile');
    console.log('🎬 Features Demo: Open file event');
  }

  public onFind(findData: any) {
    this.eventCounts.find++;
    this.triggerBlink('find');
    console.log('🎬 Features Demo: Find operation:', findData);
  }

  public onUpdateFindMatchesCount(matchData: any) {
    this.eventCounts.updateFindMatchesCount++;
    this.triggerBlink('updateFindMatchesCount');
    console.log('🎬 Features Demo: Find matches count updated:', matchData);
  }

  public onMetadataLoaded(metadata: any) {
    this.eventCounts.metadataLoaded++;
    this.triggerBlink('metadataLoaded');
    console.log('🎬 Features Demo: Metadata loaded:', metadata);
  }

  public onOutlineLoaded(outline: any) {
    this.eventCounts.outlineLoaded++;
    this.triggerBlink('outlineLoaded');
    console.log('🎬 Features Demo: Outline loaded:', outline);
  }

  public onPageRendered(pageInfo: any) {
    this.eventCounts.pageRendered++;
    this.triggerBlink('pageRendered');
    console.log('🎬 Features Demo: Page rendered:', pageInfo);
  }

  public onAnnotationLayerRendered(annotationInfo: any) {
    this.eventCounts.annotationLayerRendered++;
    this.triggerBlink('annotationLayerRendered');
    console.log('🎬 Features Demo: Annotation layer rendered:', annotationInfo);
  }

  public onBookmarkClick(bookmarkData: any) {
    this.eventCounts.bookmarkClick++;
    this.triggerBlink('bookmarkClick');
    console.log('🎬 Features Demo: Bookmark clicked:', bookmarkData);
  }

  public onIdle() {
    this.eventCounts.idle++;
    this.triggerBlink('idle');
    console.log('🎬 Features Demo: User idle event');
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
      console.log('🎬 Features Demo: Download triggered:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Download failed:', error);
    }
  }

  public async triggerPrint() {
      try {
      const result = await this.pdfViewer.triggerPrint();
      console.log('🎬 Features Demo: Print triggered:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Print failed:', error);
    }
  }

  public async goToPage(pageNumber: number) {
      try {
      const result = await this.pdfViewer.goToPage(pageNumber);
      console.log('🎬 Features Demo: Navigated to page:', pageNumber, result);
      } catch (error) {
      console.error('🎬 Features Demo: Navigation failed:', error);
    }
  }

  public async rotateClockwise() {
      try {
      const result = await this.pdfViewer.triggerRotation('cw');
      console.log('🎬 Features Demo: Rotated clockwise:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Rotation failed:', error);
    }
  }

  public async rotateCounterClockwise() {
      try {
      const result = await this.pdfViewer.triggerRotation('ccw');
      console.log('🎬 Features Demo: Rotated counter-clockwise:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Rotation failed:', error);
      }
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
      annotations: this.showAnnotations
    };
  }

  public get autoActionsConfig() {
    return {
      downloadOnLoad: this.downloadOnLoad,
      printOnLoad: this.printOnLoad,
      showLastPageOnLoad: this.showLastPageOnLoad
    };
  }

  public get viewerConfig() {
    return {
      diagnosticLogs: this.diagnosticLogs,
      useOnlyCssZoom: this.useOnlyCssZoom,
      locale: this.locale
    };
  }

  public get errorConfig() {
    return {
      override: this.errorOverride,
      append: this.errorAppend,
      message: this.errorMessage
    };
  }

  public get themeConfig() {
    return {
      theme: this.theme,
      primaryColor: this.primaryColor,
      backgroundColor: this.backgroundColor,
      pageBackgroundColor: this.pageBackgroundColor,
      toolbarColor: this.toolbarColor,
      textColor: this.textColor,
      borderRadius: this.borderRadius,
      customCSS: this.customCSS
    };
  }

  // Simple reload using library refresh method
  public reloadViewer() {
    if (this.pdfViewer) {
      console.log('🎬 Features Demo: Reloading viewer');
      this.pdfViewer.refresh();
    }
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
      idle: 0
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
      idle: false
    };
    console.log('🎬 Features Demo: Event counts reset');
  }

  // Test auto actions - reload viewer to trigger currently enabled auto actions
  public testAutoActions() {
    console.log('🎬 Features Demo: Testing auto actions - reloading viewer');
    
    // Reset event counters to better show auto action effects
    this.resetEventCounts();
    
    if (this.pdfViewer) {
      // Store current PDF source
      const currentSrc = this.pdfSrc;
      
      // Log current auto actions state before test
      console.log('🎬 Features Demo: Current auto actions enabled:');
      console.log('  - downloadOnLoad:', this.downloadOnLoad);
      console.log('  - printOnLoad:', this.printOnLoad);
      console.log('  - showLastPageOnLoad:', this.showLastPageOnLoad);
      console.log('  - rotateCW:', this.rotateCW);
      console.log('  - rotateCCW:', this.rotateCCW);
      
      // Clear the source first
      this.pdfSrc = '';
      console.log('🎬 Features Demo: PDF cleared, will reload in 300ms');
      
      // Use timeout to ensure proper clearing, then restore source to trigger auto actions
      setTimeout(() => {
        this.pdfSrc = currentSrc;
        console.log('🎬 Features Demo: PDF source restored - auto actions should trigger now');
      }, 300);
    } else {
      console.warn('🎬 Features Demo: PDF viewer not available for auto actions test');
    }
  }

  // Test error handling
  public testError() {
    console.log('🎬 Features Demo: Testing error handling');
    this.pdfSrc = 'invalid-url.pdf';
  }

  public restoreValidPdf() {
    console.log('🎬 Features Demo: Restoring valid PDF');
    this.pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
  }
} 