import { Component, OnInit, ViewChild } from '@angular/core';
import { ChangedScale, ChangedRotation } from 'ng2-pdfjs-viewer';

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
  public diagnosticLogs = false;

  // Control visibility using individual properties (traditional approach)
  public showOpenFile = true;
  public showDownload = true;
  public showPrint = true;
  public showFullScreen = true;
  public showFind = true;
  public showViewBookmark = true;
  public showAnnotations = false;

  // Auto-actions (execute when PDF loads)
  public downloadOnLoad = false;
  public printOnLoad = false;
  public showLastPageOnLoad = false;

  // Two-way binding properties
  public zoom = 'auto';
  public cursor = 'select';
  public scroll = 'vertical';
  public spread = 'none';
  public pageMode = 'none';
  public rotation = 0;

  // Navigation
  public page = 1;
  public namedDest = '';

  // Configuration options
  public locale = 'en-US';
  public useOnlyCssZoom = false;

  // Error handling
  public errorOverride = false;
  public errorAppend = true;
  public errorMessage = 'Custom error message for demonstration';

  // Event tracking for demonstration
  public eventCounts = {
    documentLoad: 0,
    pageChange: 0,
    scaleChange: 0,
    rotationChange: 0,
    beforePrint: 0,
    afterPrint: 0
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

  // Event handlers - clean and simple
  public onDocumentLoad() {
    this.eventCounts.documentLoad++;
    if (this.pdfViewer?.PDFViewerApplication) {
      this.totalPages = this.pdfViewer.PDFViewerApplication.pagesCount || 0;
    }
    console.log('🎬 Features Demo: Document loaded, total pages:', this.totalPages);
  }

  public onPageChange(pageNumber: number) {
    this.eventCounts.pageChange++;
    this.currentPage = pageNumber;
    console.log('🎬 Features Demo: Page changed to:', pageNumber);
  }

  public onScaleChange(scale: ChangedScale) {
    this.eventCounts.scaleChange++;
    this.currentScale = scale;
    console.log('🎬 Features Demo: Scale changed to:', scale);
  }

  public onRotationChange(rotation: ChangedRotation) {
    this.eventCounts.rotationChange++;
    this.currentRotation = rotation.rotation;
    console.log('🎬 Features Demo: Rotation changed to:', rotation.rotation);
  }

  public onBeforePrint() {
    this.eventCounts.beforePrint++;
    console.log('🎬 Features Demo: Before print event');
  }

  public onAfterPrint() {
    this.eventCounts.afterPrint++;
    console.log('🎬 Features Demo: After print event');
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
      afterPrint: 0
    };
    console.log('🎬 Features Demo: Event counts reset');
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