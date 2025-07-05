import { Component, OnInit, ViewChild } from '@angular/core';
import { ChangedScale, ChangedRotation } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-features',
  standalone: false,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  @ViewChild('testPdfViewer', { static: true }) public testPdfViewer;

  // Control visibility toggles
  public openFile = true;
  public download = true;
  public print = true;
  public fullScreen = true;
  public find = true;
  public viewBookmark = true;
  public annotations = false;

  // Auto action toggles
  public startDownload = false;
  public startPrint = false;
  public lastPage = false;

  // Mode settings
  public cursor = 'select';
  public scroll = 'vertical';
  public spread = 'none';
  public nameddest = '';
  public pagemode = 'none';

  // Custom values
  public downloadFileName = 'test-document.pdf';
  public zoom = 'auto';
  public locale = 'en-US';
  public useOnlyCssZoom = false;

  // Error handling
  public errorOverride = false;
  public errorAppend = true;
  public errorMessage = 'Custom error message';
  
  // Debug settings
  public diagnosticLogs = false;

  // Event counters
  public eventCounts = {
    documentLoad: 0,
    pageChange: 0,
    scaleChange: 0,
    rotationChange: 0,
    beforePrint: 0,
    afterPrint: 0
  };

  // Current values
  public currentPage = 1;
  public currentScale = 1;
  public currentRotation = 0;
  public totalPages = 0;

  constructor() { }

  ngOnInit() {
    console.log('🧪 TestFeatures: Component initialized');
  }

  // Event handlers
  public onDocumentLoad() {
    this.eventCounts.documentLoad++;
    console.log('🧪 TestFeatures: Document loaded!', this.eventCounts.documentLoad);
  }

  public onPageChange(pageNumber: number) {
    this.eventCounts.pageChange++;
    this.currentPage = pageNumber;
    console.log('🧪 TestFeatures: Page changed to:', pageNumber, 'Count:', this.eventCounts.pageChange);
  }

  public onScaleChange(scale: ChangedScale) {
    this.eventCounts.scaleChange++;
    this.currentScale = scale;
    console.log('🧪 TestFeatures: Scale changed to:', scale, 'Count:', this.eventCounts.scaleChange);
  }

  public onRotationChange(rotation: ChangedRotation) {
    this.eventCounts.rotationChange++;
    this.currentRotation = rotation.rotation;
    console.log('🧪 TestFeatures: Rotation changed to:', rotation.rotation, 'Count:', this.eventCounts.rotationChange);
  }

  public onBeforePrint() {
    this.eventCounts.beforePrint++;
    console.log('🧪 TestFeatures: Before print!', this.eventCounts.beforePrint);
  }

  public onAfterPrint() {
    this.eventCounts.afterPrint++;
    console.log('🧪 TestFeatures: After print!', this.eventCounts.afterPrint);
  }

  // Action buttons
  public refreshViewer() {
    console.log('🧪 TestFeatures: Refreshing viewer');
    this.testPdfViewer.refresh();
    console.log('🧪 TestFeatures: Viewer refreshed');
  }

  public goToPage(page: number) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Navigating to page:', page);
      this.testPdfViewer.page = page;
      console.log('🧪 TestFeatures: Navigated to page:', page);
    }
  }

  // Rotation action buttons
  public async rotateClockwise() {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Rotating clockwise');
      try {
        const result = await this.testPdfViewer.triggerRotation('cw');
        console.log('🧪 TestFeatures: Rotated clockwise, result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to rotate clockwise:', error);
      }
    }
  }

  public async rotateCounterClockwise() {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Rotating counter-clockwise');
      try {
        const result = await this.testPdfViewer.triggerRotation('ccw');
        console.log('🧪 TestFeatures: Rotated counter-clockwise, result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to rotate counter-clockwise:', error);
      }
    }
  }

  // Additional action methods
  public async triggerDownloadAction() {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Triggering download');
      try {
        const result = await this.testPdfViewer.triggerDownload();
        console.log('🧪 TestFeatures: Download triggered, result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to trigger download:', error);
      }
    }
  }

  public async triggerPrintAction() {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Triggering print');
      try {
        const result = await this.testPdfViewer.triggerPrint();
        console.log('🧪 TestFeatures: Print triggered, result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to trigger print:', error);
      }
    }
  }

  public async goToPageAction(page: number) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Navigating to page:', page);
      try {
        const result = await this.testPdfViewer.goToPage(page);
        console.log('🧪 TestFeatures: Navigated to page:', page, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to navigate to page:', page, error);
      }
    }
  }

  public async setZoomAction(zoom: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Setting zoom to:', zoom);
      try {
        const result = await this.testPdfViewer.setZoom(zoom);
        console.log('🧪 TestFeatures: Zoom set to:', zoom, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to set zoom:', zoom, error);
      }
    }
  }

  // Action queue status
  public getActionQueueStatus() {
    if (this.testPdfViewer && typeof this.testPdfViewer.getQueueStatus === 'function') {
      return this.testPdfViewer.getQueueStatus();
    }
    return null;
  }

  public resetEventCounts() {
    console.log('🧪 TestFeatures: Resetting event counts');
    this.eventCounts = {
      documentLoad: 0,
      pageChange: 0,
      scaleChange: 0,
      rotationChange: 0,
      beforePrint: 0,
      afterPrint: 0
    };
    console.log('🧪 TestFeatures: Event counts reset');
  }

  public testError() {
    // This will trigger an error to test error handling
    console.log('🧪 TestFeatures: Testing error handling with invalid URL');
    this.testPdfViewer.pdfSrc = 'invalid-url.pdf';
    console.log('🧪 TestFeatures: Testing error handling with invalid URL');
  }

  public restoreValidPdf() {
    console.log('🧪 TestFeatures: Restoring valid PDF');
    this.testPdfViewer.pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
    console.log('🧪 TestFeatures: Restored valid PDF');
  }

  // Getter for current viewer state
  public get viewerState() {
    if (!this.testPdfViewer) return null;
    
    return {
      page: this.testPdfViewer.page,
      pdfSrc: this.testPdfViewer.pdfSrc,
      totalPages: this.totalPages
    };
  }
} 