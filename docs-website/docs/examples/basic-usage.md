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
  (onProgress)="onProgress($event)">
</ng2-pdfjs-viewer>

<div class="status">
  <p>Status: {{ status }}</p>
  <p>Current Page: {{ currentPage }} / {{ totalPages }}</p>
  <p>Progress: {{ progress }}%</p>
</div>
```

```typescript title="event-handling.component.ts"
import { Component } from '@angular/core';

@Component({
  selector: 'app-event-handling',
  templateUrl: './event-handling.component.html'
})
export class EventHandlingComponent {
  status = 'Loading...';
  currentPage = 0;
  totalPages = 0;
  progress = 0;

  onDocumentLoad() {
    this.status = 'Document loaded successfully!';
    console.log('PDF loaded successfully!');
  }

  onDocumentError(error: any) {
    this.status = 'Failed to load document';
    console.error('Failed to load PDF:', error);
  }

  onPageChange(event: any) {
    this.currentPage = event.current;
    this.totalPages = event.total;
    console.log(`Page changed: ${event.current}/${event.total}`);
  }

  onProgress(event: any) {
    this.progress = Math.round(event.loaded / event.total * 100);
    console.log(`Loading progress: ${this.progress}%`);
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

## Responsive Layout

Create a responsive PDF viewer that adapts to different screen sizes:

```html title="responsive-viewer.component.html"
<div class="responsive-container">
  <ng2-pdfjs-viewer
    pdfSrc="assets/sample.pdf"
    [showSpinner]="true"
    [theme]="isMobile ? 'mobile' : 'desktop'"
    [showToolbar]="!isMobile || showMobileToolbar"
    [showSidebar]="!isMobile">
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
