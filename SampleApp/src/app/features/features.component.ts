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

  // Auto action settings (stored separately for demo purposes)
  public autoActionSettings = {
    autoDownload: false,
    autoPrint: false,
    autoLastPage: false
  };

  // Actual viewer properties (initially set to false for auto-actions)
  public autoDownload = false;
  public autoPrint = false;
  public autoLastPage = false;

  // In-memory state management for mode values
  private savedModeValues: { [key: string]: any } = {};

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
  public diagnosticLogs = true;

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
    // Get total pages from the viewer
    if (this.testPdfViewer && this.testPdfViewer.PDFViewerApplication) {
      this.totalPages = this.testPdfViewer.PDFViewerApplication.pagesCount || 0;
    }
    console.log('🧪 TestFeatures: Document loaded!', this.eventCounts.documentLoad, 'Total pages:', this.totalPages);
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
    console.log('🧪 TestFeatures: Refreshing viewer with auto-actions');
    
    // Apply auto-action settings to actual viewer properties
    this.applyAutoActionSettings();
    
    // Save current mode values before refreshing
    this.saveCurrentModeValues();
    
    this.testPdfViewer.refresh();
    console.log('🧪 TestFeatures: Viewer refreshed with auto-actions applied');
  }

  // Apply auto-action settings to actual viewer properties
  private applyAutoActionSettings() {
    console.log('🧪 TestFeatures: Applying auto-action settings:', this.autoActionSettings);
    
    // Apply auto-action settings to actual viewer properties
    this.autoDownload = this.autoActionSettings.autoDownload;
    this.autoPrint = this.autoActionSettings.autoPrint;
    this.autoLastPage = this.autoActionSettings.autoLastPage;
    
    console.log('🧪 TestFeatures: Auto-actions applied - Download:', this.autoDownload, 'Print:', this.autoPrint, 'LastPage:', this.autoLastPage);
  }

  // Clear auto-action settings (for demo purposes)
  public clearAutoActionSettings() {
    console.log('🧪 TestFeatures: Clearing auto-action settings');
    this.autoActionSettings = {
      autoDownload: false,
      autoPrint: false,
      autoLastPage: false
    };
    console.log('🧪 TestFeatures: Auto-action settings cleared');
  }

  // Save current mode values to memory
  private saveCurrentModeValues() {
    const modeProperties = ['cursor', 'scroll', 'spread', 'zoom', 'locale', 'nameddest', 'pagemode'];
    modeProperties.forEach(property => {
      const value = (this as any)[property];
      if (value !== null && value !== undefined && value !== '') {
        this.savedModeValues[property] = value;
        console.log(`🧪 TestFeatures: Saved ${property} = ${value} to memory`);
      }
    });
    console.log('🧪 TestFeatures: Saved current mode values before refresh');
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

  public async goToLastPageAction() {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Going to last page');
      try {
        const result = await this.testPdfViewer.goToPage(this.totalPages);
        console.log('🧪 TestFeatures: Went to last page, result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to go to last page:', error);
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

  public async setCursorAction(cursor: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Setting cursor to:', cursor);
      try {
        const result = await this.testPdfViewer.setCursor(cursor);
        console.log('🧪 TestFeatures: Cursor set to:', cursor, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to set cursor:', cursor, error);
      }
    }
  }

  public async setScrollAction(scroll: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Setting scroll to:', scroll);
      try {
        const result = await this.testPdfViewer.setScroll(scroll);
        console.log('🧪 TestFeatures: Scroll set to:', scroll, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to set scroll:', scroll, error);
      }
    }
  }

  public async setSpreadAction(spread: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Setting spread to:', spread);
      try {
        const result = await this.testPdfViewer.setSpread(spread);
        console.log('🧪 TestFeatures: Spread set to:', spread, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to set spread:', spread, error);
      }
    }
  }

  public async goToNamedDestinationAction(destination: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Going to named destination:', destination);
      try {
        const result = await this.testPdfViewer.goToNamedDestination(destination);
        console.log('🧪 TestFeatures: Navigated to destination:', destination, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to navigate to destination:', destination, error);
      }
    }
  }

  public async setPageModeAction(mode: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Setting page mode to:', mode);
      try {
        const result = await this.testPdfViewer.setPageMode(mode);
        console.log('🧪 TestFeatures: Page mode set to:', mode, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to set page mode:', mode, error);
      }
    }
  }

  public async setLocaleAction(locale: string) {
    if (this.testPdfViewer) {
      console.log('🧪 TestFeatures: Setting locale to:', locale);
      try {
        const result = await this.testPdfViewer.setLocale(locale);
        console.log('🧪 TestFeatures: Locale set to:', locale, 'result:', result);
      } catch (error) {
        console.error('🧪 TestFeatures: Failed to set locale:', locale, error);
      }
    }
  }

  // Simple mode change handler - let the library handle everything
  public onModeChange(property: string, value: any) {
    console.log(`🧪 TestFeatures: Mode ${property} changed to:`, value);
    
    // Save the value to memory
    this.savedModeValues[property] = value;
    console.log(`🧪 TestFeatures: Saved ${property} = ${value} to memory`);
  }

  // Clear all saved values
  public clearSavedValues() {
    this.savedModeValues = {};
    console.log('🧪 TestFeatures: Cleared all saved values from memory');
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