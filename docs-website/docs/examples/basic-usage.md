# Basic Usage Examples

Learn how to use ng2-pdfjs-viewer with practical, copy-paste examples.

## Simple PDF Viewer

The most basic implementation - just display a PDF:

```html title="basic-viewer.component.html"
<ng2-pdfjs-viewer 
  pdfSrc="assets/sample.pdf" 
  [showSpinner]="true">
</ng2-pdfjs-viewer>
```

```typescript title="basic-viewer.component.ts"
import { Component } from '@angular/core';

@Component({
  selector: 'app-basic-viewer',
  templateUrl: './basic-viewer.component.html'
})
export class BasicViewerComponent {
  // No additional code needed!
}
```

## Themed PDF Viewer

Add custom theming to match your application:

```html title="themed-viewer.component.html"
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [theme]="'dark'"
  [primaryColor]="'#ff6b6b'"
  [backgroundColor]="'#2c3e50'">
</ng2-pdfjs-viewer>
```

```typescript title="themed-viewer.component.ts"
import { Component } from '@angular/core';

@Component({
  selector: 'app-themed-viewer',
  templateUrl: './themed-viewer.component.html'
})
export class ThemedViewerComponent {
  // Theme properties are bound directly in template
}
```

## Custom Loading & Error Templates

Use Angular templates for loading and error states:

```html title="custom-templates.component.html"
<!-- Loading Template -->
<ng-template #loadingTemplate>
  <div class="loading">
    <mat-spinner></mat-spinner>
    <p>Loading your document...</p>
    <p>Please wait while we prepare your PDF.</p>
  </div>
</ng-template>

<!-- Error Template -->
<ng-template #errorTemplate>
  <div class="error">
    <mat-icon>error_outline</mat-icon>
    <h3>Oops! Something went wrong</h3>
    <p>We couldn't load your PDF. Please try again.</p>
    <button mat-button (click)="retry()">Retry</button>
  </div>
</ng-template>

<!-- PDF Viewer with Custom Templates -->
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [customSpinnerTpl]="loadingTemplate"
  [customErrorTpl]="errorTemplate">
</ng2-pdfjs-viewer>
```

```typescript title="custom-templates.component.ts"
import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-templates',
  templateUrl: './custom-templates.component.html',
  styleUrls: ['./custom-templates.component.css']
})
export class CustomTemplatesComponent {
  retry() {
    // Reload the page or reset the PDF source
    window.location.reload();
  }
}
```

```css title="custom-templates.component.css"
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #f44336;
}

.error mat-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}
```

## Event Handling

Listen to PDF viewer events for better user experience:

```html title="event-handling.component.html"
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [showSpinner]="true"
  (onDocumentLoad)="onDocumentLoad()"
  (onDocumentError)="onDocumentError($event)"
  (onPageChange)="onPageChange($event)"
  (onScaleChange)="onScaleChange($event)"
  (onMetadataLoaded)="onMetadataLoaded($event)"
  (onOutlineLoaded)="onOutlineLoaded($event)">
</ng2-pdfjs-viewer>

<div class="status">
  <p>Status: {{ status }}</p>
  <p>Current Page: {{ currentPage }} / {{ totalPages }}</p>
  <p>Zoom: {{ currentScale }}x</p>
  <p *ngIf="documentTitle">Title: {{ documentTitle }}</p>
  <p *ngIf="hasOutline">📑 Has outline</p>
</div>
```

```typescript title="event-handling.component.ts"
import { Component } from '@angular/core';
import { ChangedPage, ChangedScale, DocumentMetadata, DocumentOutline } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-event-handling',
  templateUrl: './event-handling.component.html'
})
export class EventHandlingComponent {
  status = 'Loading...';
  currentPage = 0;
  totalPages = 0;
  currentScale = 1;
  documentTitle = '';
  hasOutline = false;

  onDocumentLoad() {
    this.status = 'Document loaded successfully!';
    console.log('PDF loaded successfully!');
  }

  onDocumentError(error: any) {
    this.status = 'Failed to load document';
    console.error('Failed to load PDF:', error);
  }

  onPageChange(event: ChangedPage) {
    this.currentPage = event.pageNumber;
    console.log(`Page changed from ${event.previousPageNumber} to ${event.pageNumber}`);
  }

  onScaleChange(event: ChangedScale) {
    this.currentScale = event.scale;
    console.log(`Scale changed to: ${event.scale}x`);
  }

  onMetadataLoaded(event: DocumentMetadata) {
    this.documentTitle = event.title || 'Untitled Document';
    console.log('Document metadata loaded:', event);
  }

  onOutlineLoaded(event: DocumentOutline) {
    this.hasOutline = event.items && event.items.length > 0;
    console.log('Document outline loaded:', event.items);
  }
}
```

## Dynamic PDF Loading

Load different PDFs based on user interaction:

```html title="dynamic-loading.component.html"
<div class="pdf-selector">
  <button 
    mat-button 
    *ngFor="let pdf of pdfFiles" 
    (click)="loadPdf(pdf.src)"
    [class.active]="currentPdf === pdf.src">
    {{ pdf.name }}
  </button>
</div>

<ng2-pdfjs-viewer
  [pdfSrc]="currentPdf"
  [showSpinner]="true"
  (onDocumentLoad)="onDocumentLoad()">
</ng2-pdfjs-viewer>
```

```typescript title="dynamic-loading.component.ts"
import { Component } from '@angular/core';

@Component({
  selector: 'app-dynamic-loading',
  templateUrl: './dynamic-loading.component.html',
  styleUrls: ['./dynamic-loading.component.css']
})
export class DynamicLoadingComponent {
  currentPdf = 'assets/sample1.pdf';
  
  pdfFiles = [
    { name: 'Sample 1', src: 'assets/sample1.pdf' },
    { name: 'Sample 2', src: 'assets/sample2.pdf' },
    { name: 'Sample 3', src: 'assets/sample3.pdf' },
    { name: 'Remote PDF', src: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' }
  ];

  loadPdf(pdfSrc: string) {
    this.currentPdf = pdfSrc;
  }

  onDocumentLoad() {
    console.log('New PDF loaded:', this.currentPdf);
  }
}
```

```css title="dynamic-loading.component.css"
.pdf-selector {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pdf-selector button.active {
  background-color: #3f51b5;
  color: white;
}
```

## Advanced Configuration

Use convenience configuration objects for cleaner, more maintainable code:

```html title="advanced-config.component.html"
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [showSpinner]="true"
  [theme]="'dark'"
  [groupVisibility]="groupVisibility"
  [controlVisibility]="controlVisibility"
  [autoActions]="autoActions"
  [themeConfig]="themeConfig"
  [layoutConfig]="layoutConfig"
  (onDocumentLoad)="onDocumentLoad()"
  (onPageChange)="onPageChange($event)">
</ng2-pdfjs-viewer>

<div class="controls">
  <button (click)="downloadPdf()">Download</button>
  <button (click)="printPdf()">Print</button>
  <button (click)="goToPage(5)">Go to Page 5</button>
  <button (click)="changeZoom('150%')">Zoom 150%</button>
  <button (click)="rotateDocument('cw')">Rotate CW</button>
</div>
```

```typescript title="advanced-config.component.ts"
import { Component, ViewChild } from '@angular/core';
import { Ng2PdfjsViewerComponent } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-advanced-config',
  templateUrl: './advanced-config.component.html'
})
export class AdvancedConfigComponent {
  @ViewChild('pdfViewer') pdfViewer!: Ng2PdfjsViewerComponent;

  // Convenience configuration objects
  groupVisibility = {
    download: true,
    print: true,
    find: true,
    fullScreen: true,
    openFile: false,
    viewBookmark: true,
    annotations: false
  };

  controlVisibility = {
    showToolbarLeft: true,
    showToolbarMiddle: true,
    showToolbarRight: true,
    showSidebar: true
  };

  autoActions = {
    downloadOnLoad: false,
    printOnLoad: false
  };

  themeConfig = {
    theme: 'dark',
    primaryColor: '#3f51b5',
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    borderRadius: '8px'
  };

  layoutConfig = {
    toolbarDensity: 'compact',
    sidebarWidth: '280px',
    toolbarPosition: 'top',
    sidebarPosition: 'left',
    responsiveBreakpoint: 768
  };

  // Method calls
  async downloadPdf() {
    try {
      const result = await this.pdfViewer.triggerDownload();
      console.log('Download triggered:', result);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  async printPdf() {
    try {
      const result = await this.pdfViewer.triggerPrint();
      console.log('Print triggered:', result);
    } catch (error) {
      console.error('Print failed:', error);
    }
  }

  async goToPage(pageNumber: number) {
    try {
      const result = await this.pdfViewer.setPage(pageNumber);
      console.log(`Navigated to page ${pageNumber}:`, result);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  async changeZoom(zoomLevel: string) {
    try {
      const result = await this.pdfViewer.setZoom(zoomLevel);
      console.log(`Zoom changed to ${zoomLevel}:`, result);
    } catch (error) {
      console.error('Zoom change failed:', error);
    }
  }

  async rotateDocument(direction: 'cw' | 'ccw') {
    try {
      const result = await this.pdfViewer.triggerRotation(direction);
      console.log(`Document rotated ${direction}:`, result);
    } catch (error) {
      console.error('Rotation failed:', error);
    }
  }

  onDocumentLoad() {
    console.log('Document loaded successfully!');
  }

  onPageChange(event: any) {
    console.log(`Page changed to: ${event.pageNumber}`);
  }
}
```

## Responsive Layout

Create a responsive PDF viewer that adapts to different screen sizes:

```html title="responsive-viewer.component.html"
<div class="responsive-container">
  <ng2-pdfjs-viewer
    pdfSrc="assets/sample.pdf"
    [showSpinner]="true"
    [theme]="isMobile ? 'auto' : 'light'"
    [showToolbar]="!isMobile || showMobileToolbar"
    [showSidebar]="!isMobile"
    [layoutConfig]="layoutConfig"
    (onDocumentLoad)="onDocumentLoad()">
  </ng2-pdfjs-viewer>
  
  <button 
    *ngIf="isMobile" 
    mat-fab 
    class="mobile-toolbar-toggle"
    (click)="toggleMobileToolbar()">
    <mat-icon>{{ showMobileToolbar ? 'close' : 'menu' }}</mat-icon>
  </button>
</div>
```

```typescript title="responsive-viewer.component.ts"
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-responsive-viewer',
  templateUrl: './responsive-viewer.component.html',
  styleUrls: ['./responsive-viewer.component.css']
})
export class ResponsiveViewerComponent implements OnInit {
  isMobile = false;
  showMobileToolbar = false;

  layoutConfig = {
    toolbarDensity: 'compact',
    sidebarWidth: '280px',
    toolbarPosition: 'top',
    sidebarPosition: 'left',
    responsiveBreakpoint: 768
  };

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.showMobileToolbar = false;
    }
  }

  toggleMobileToolbar() {
    this.showMobileToolbar = !this.showMobileToolbar;
  }

  onDocumentLoad() {
    console.log('Document loaded successfully!');
  }
}
```

```css title="responsive-viewer.component.css"
.responsive-container {
  position: relative;
  height: 100vh;
}

.mobile-toolbar-toggle {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .responsive-container {
    height: calc(100vh - 56px); /* Account for mobile browser UI */
  }
}
```

## Error Handling with Custom Templates

Implement comprehensive error handling with custom templates:

```html title="error-handling.component.html"
<!-- Custom Error Template -->
<ng-template #errorTemplate let-error="errorMessage">
  <div class="error-container">
    <mat-icon class="error-icon">error_outline</mat-icon>
    <h2>Failed to Load PDF</h2>
    <p class="error-message">{{ error }}</p>
    <div class="error-actions">
      <button mat-button (click)="retry()">Retry</button>
      <button mat-button (click)="loadFallback()">Load Fallback</button>
    </div>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  [pdfSrc]="currentPdf"
  [showSpinner]="true"
  [errorOverride]="true"
  [customErrorTpl]="errorTemplate"
  [errorMessage]="customErrorMessage"
  (onDocumentError)="onDocumentError($event)"
  (onDocumentLoad)="onDocumentLoad()">
</ng2-pdfjs-viewer>
```

```typescript title="error-handling.component.ts"
import { Component } from '@angular/core';
import { DocumentError } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-error-handling',
  templateUrl: './error-handling.component.html',
  styleUrls: ['./error-handling.component.css']
})
export class ErrorHandlingComponent {
  currentPdf = 'assets/sample.pdf';
  customErrorMessage = '';
  fallbackPdf = 'assets/fallback.pdf';

  onDocumentError(error: DocumentError) {
    console.error('PDF load error:', error);
    
    // Customize error message based on error type
    if (error.message.includes('404')) {
      this.customErrorMessage = 'The requested PDF file was not found. Please check the file path.';
    } else if (error.message.includes('CORS')) {
      this.customErrorMessage = 'Cross-origin request blocked. Please ensure CORS is properly configured.';
    } else if (error.message.includes('password')) {
      this.customErrorMessage = 'This PDF is password protected. Please provide the correct password.';
    } else {
      this.customErrorMessage = `An error occurred while loading the PDF: ${error.message}`;
    }
  }

  onDocumentLoad() {
    console.log('PDF loaded successfully!');
    this.customErrorMessage = '';
  }

  retry() {
    // Reload the same PDF
    const currentSrc = this.currentPdf;
    this.currentPdf = '';
    setTimeout(() => {
      this.currentPdf = currentSrc;
    }, 100);
  }

  loadFallback() {
    // Load a fallback PDF
    this.currentPdf = this.fallbackPdf;
    this.customErrorMessage = '';
  }
}
```

```css title="error-handling.component.css"
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #f44336;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 1rem;
  color: #f44336;
}

.error-message {
  margin: 1rem 0;
  max-width: 400px;
  line-height: 1.5;
}

.error-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
```

## Next Steps

Ready for more advanced usage?

- 📖 [**API Reference**](../api/component-inputs) - Complete API documentation
- 🎨 [**Theming Guide**](../features/theming) - Customize appearance
- 🔄 [**Migration Guide**](../migration/overview) - Upgrade from v20.x
- 📋 [**Features Overview**](../features/overview) - All available features

## Need Help?

- 🎯 [**Live Demo**](https://angular-pdf-viewer-demo.vercel.app/) - See examples in action
- 💬 [**Discussions**](https://github.com/intbot/ng2-pdfjs-viewer/discussions) - Ask questions
- 🐛 [**Issues**](https://github.com/intbot/ng2-pdfjs-viewer/issues) - Report problems
