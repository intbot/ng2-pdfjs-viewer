# Component Outputs (Events)

Complete reference for all ng2-pdfjs-viewer component output events.

## Document Events

### `onDocumentLoad`
- **Type**: `EventEmitter<void>`
- **Description**: Fired when the PDF document loads successfully

```typescript
onDocumentLoad() {
  console.log('PDF loaded successfully!');
  this.isLoading = false;
}
```

```html
<ng2-pdfjs-viewer 
  (onDocumentLoad)="onDocumentLoad()">
</ng2-pdfjs-viewer>
```

### `onDocumentError`
- **Type**: `EventEmitter<DocumentError>`
- **Description**: Fired when the PDF document fails to load

```typescript
interface DocumentError {
  message: string;
  name: string;
  stack?: string;
}

onDocumentError(error: DocumentError) {
  console.error('Failed to load PDF:', error);
  this.showErrorMessage = true;
}
```

### `onDocumentInit`
- **Type**: `EventEmitter<void>`
- **Description**: Fired when document initialization begins

### `onProgress`
- **Type**: `EventEmitter<ProgressEvent>`
- **Description**: Fired during document loading progress

```typescript
interface ProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

onProgress(event: ProgressEvent) {
  console.log(`Loading progress: ${event.percent}%`);
  this.loadingProgress = event.percent;
}
```

## Page Events

### `onPageChange`
- **Type**: `EventEmitter<PageChangeEvent>`
- **Description**: Fired when the current page changes

```typescript
interface PageChangeEvent {
  current: number;
  total: number;
  previous: number;
}

onPageChange(event: PageChangeEvent) {
  console.log(`Page ${event.current} of ${event.total}`);
  this.currentPage = event.current;
  this.totalPages = event.total;
}
```

### `onPageRender`
- **Type**: `EventEmitter<PageRenderEvent>`
- **Description**: Fired when a page finishes rendering

```typescript
interface PageRenderEvent {
  pageNumber: number;
  source: any;
}

onPageRender(event: PageRenderEvent) {
  console.log(`Page ${event.pageNumber} rendered`);
}
```

### `onPagesLoaded`
- **Type**: `EventEmitter<PagesLoadedEvent>`
- **Description**: Fired when all pages are loaded

```typescript
interface PagesLoadedEvent {
  pagesCount: number;
  source: any;
}

onPagesLoaded(event: PagesLoadedEvent) {
  console.log(`All ${event.pagesCount} pages loaded`);
  this.totalPages = event.pagesCount;
}
```

## View Events

### `onZoomChange`
- **Type**: `EventEmitter<ZoomChangeEvent>`
- **Description**: Fired when zoom level changes

```typescript
interface ZoomChangeEvent {
  scale: number;
  presetValue?: string;
  source: any;
}

onZoomChange(event: ZoomChangeEvent) {
  console.log(`Zoom changed to: ${event.scale}x`);
  this.currentZoom = event.scale;
}
```

### `onRotationChange`
- **Type**: `EventEmitter<RotationChangeEvent>`
- **Description**: Fired when document rotation changes

```typescript
interface RotationChangeEvent {
  pagesRotation: number;
  source: any;
}

onRotationChange(event: RotationChangeEvent) {
  console.log(`Document rotated: ${event.pagesRotation}°`);
  this.currentRotation = event.pagesRotation;
}
```

### `onScaleChange`
- **Type**: `EventEmitter<ScaleChangeEvent>`
- **Description**: Fired when scale/zoom changes

```typescript
interface ScaleChangeEvent {
  scale: number;
  presetValue?: string;
}
```

## Search Events

### `onSearchStart`
- **Type**: `EventEmitter<SearchEvent>`
- **Description**: Fired when search begins

```typescript
interface SearchEvent {
  query: string;
  caseSensitive: boolean;
  entireWord: boolean;
  highlightAll: boolean;
}

onSearchStart(event: SearchEvent) {
  console.log(`Search started: "${event.query}"`);
  this.isSearching = true;
}
```

### `onSearchResult`
- **Type**: `EventEmitter<SearchResultEvent>`
- **Description**: Fired when search results are found

```typescript
interface SearchResultEvent {
  matchesCount: number;
  current: number;
  query: string;
}

onSearchResult(event: SearchResultEvent) {
  console.log(`Found ${event.matchesCount} matches for "${event.query}"`);
  this.searchResults = event;
}
```

### `onSearchComplete`
- **Type**: `EventEmitter<SearchCompleteEvent>`
- **Description**: Fired when search completes

```typescript
interface SearchCompleteEvent {
  query: string;
  matchesCount: number;
}

onSearchComplete(event: SearchCompleteEvent) {
  console.log(`Search complete: ${event.matchesCount} total matches`);
  this.isSearching = false;
}
```

## User Interaction Events

### `onTextSelection`
- **Type**: `EventEmitter<TextSelectionEvent>`
- **Description**: Fired when text is selected

```typescript
interface TextSelectionEvent {
  text: string;
  pageNumber: number;
  boundingRect: DOMRect;
}

onTextSelection(event: TextSelectionEvent) {
  console.log(`Selected text: "${event.text}" on page ${event.pageNumber}`);
  this.selectedText = event.text;
}
```

### `onAnnotationClick`
- **Type**: `EventEmitter<AnnotationClickEvent>`
- **Description**: Fired when an annotation is clicked

```typescript
interface AnnotationClickEvent {
  annotation: any;
  pageNumber: number;
  source: any;
}

onAnnotationClick(event: AnnotationClickEvent) {
  console.log(`Annotation clicked on page ${event.pageNumber}`);
}
```

### `onLinkClick`
- **Type**: `EventEmitter<LinkClickEvent>`
- **Description**: Fired when a link is clicked

```typescript
interface LinkClickEvent {
  url: string;
  dest: any;
  pageNumber: number;
}

onLinkClick(event: LinkClickEvent) {
  console.log(`Link clicked: ${event.url}`);
  // Handle external links
  if (event.url) {
    window.open(event.url, '_blank');
  }
}
```

## Print Events

### `onPrintStart`
- **Type**: `EventEmitter<PrintEvent>`
- **Description**: Fired when printing starts

```typescript
interface PrintEvent {
  source: any;
}

onPrintStart(event: PrintEvent) {
  console.log('Print started');
  this.isPrinting = true;
}
```

### `onPrintEnd`
- **Type**: `EventEmitter<PrintEvent>`
- **Description**: Fired when printing ends

```typescript
onPrintEnd(event: PrintEvent) {
  console.log('Print ended');
  this.isPrinting = false;
}
```

## Download Events

### `onDownloadStart`
- **Type**: `EventEmitter<DownloadEvent>`
- **Description**: Fired when download starts

```typescript
interface DownloadEvent {
  filename: string;
  source: any;
}

onDownloadStart(event: DownloadEvent) {
  console.log(`Download started: ${event.filename}`);
  this.isDownloading = true;
}
```

### `onDownloadComplete`
- **Type**: `EventEmitter<DownloadEvent>`
- **Description**: Fired when download completes

```typescript
onDownloadComplete(event: DownloadEvent) {
  console.log(`Download complete: ${event.filename}`);
  this.isDownloading = false;
}
```

## Sidebar Events

### `onSidebarToggle`
- **Type**: `EventEmitter<SidebarToggleEvent>`
- **Description**: Fired when sidebar is toggled

```typescript
interface SidebarToggleEvent {
  visible: boolean;
  view: number;
}

onSidebarToggle(event: SidebarToggleEvent) {
  console.log(`Sidebar ${event.visible ? 'opened' : 'closed'}`);
  this.sidebarVisible = event.visible;
}
```

### `onOutlineLoad`
- **Type**: `EventEmitter<OutlineEvent>`
- **Description**: Fired when document outline loads

```typescript
interface OutlineEvent {
  outline: any[];
  source: any;
}

onOutlineLoad(event: OutlineEvent) {
  console.log('Document outline loaded');
  this.hasOutline = event.outline && event.outline.length > 0;
}
```

## Thumbnail Events

### `onThumbnailLoad`
- **Type**: `EventEmitter<ThumbnailEvent>`
- **Description**: Fired when thumbnails load

```typescript
interface ThumbnailEvent {
  pageNumber: number;
  source: any;
}

onThumbnailLoad(event: ThumbnailEvent) {
  console.log(`Thumbnail loaded for page ${event.pageNumber}`);
}
```

## Error Events

### `onRenderError`
- **Type**: `EventEmitter<RenderError>`
- **Description**: Fired when page rendering fails

```typescript
interface RenderError {
  pageNumber: number;
  error: Error;
  source: any;
}

onRenderError(event: RenderError) {
  console.error(`Render error on page ${event.pageNumber}:`, event.error);
}
```

## Complete Event Handling Example

```typescript
export class PdfViewerComponent {
  // State management
  isLoading = true;
  currentPage = 1;
  totalPages = 0;
  currentZoom = 1;
  isSearching = false;
  searchResults: any = null;

  // Document events
  onDocumentLoad() {
    console.log('📄 Document loaded successfully');
    this.isLoading = false;
  }

  onDocumentError(error: any) {
    console.error('❌ Document load error:', error);
    this.isLoading = false;
  }

  onProgress(event: any) {
    console.log(`⏳ Loading progress: ${event.percent}%`);
  }

  // Page events
  onPageChange(event: any) {
    console.log(`📖 Page changed: ${event.current}/${event.total}`);
    this.currentPage = event.current;
    this.totalPages = event.total;
  }

  onPagesLoaded(event: any) {
    console.log(`📚 All pages loaded: ${event.pagesCount}`);
    this.totalPages = event.pagesCount;
  }

  // View events
  onZoomChange(event: any) {
    console.log(`🔍 Zoom changed: ${event.scale}x`);
    this.currentZoom = event.scale;
  }

  onRotationChange(event: any) {
    console.log(`🔄 Rotation changed: ${event.pagesRotation}°`);
  }

  // Search events
  onSearchStart(event: any) {
    console.log(`🔎 Search started: "${event.query}"`);
    this.isSearching = true;
  }

  onSearchResult(event: any) {
    console.log(`🎯 Search results: ${event.matchesCount} matches`);
    this.searchResults = event;
  }

  onSearchComplete(event: any) {
    console.log(`✅ Search complete: ${event.matchesCount} total matches`);
    this.isSearching = false;
  }

  // User interaction events
  onTextSelection(event: any) {
    console.log(`📝 Text selected: "${event.text}"`);
  }

  onLinkClick(event: any) {
    console.log(`🔗 Link clicked: ${event.url}`);
    if (event.url) {
      window.open(event.url, '_blank');
    }
  }

  // Print/Download events
  onPrintStart() {
    console.log('🖨️ Print started');
  }

  onDownloadStart(event: any) {
    console.log(`💾 Download started: ${event.filename}`);
  }
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  
  <!-- Document Events -->
  (onDocumentLoad)="onDocumentLoad()"
  (onDocumentError)="onDocumentError($event)"
  (onProgress)="onProgress($event)"
  
  <!-- Page Events -->
  (onPageChange)="onPageChange($event)"
  (onPagesLoaded)="onPagesLoaded($event)"
  
  <!-- View Events -->
  (onZoomChange)="onZoomChange($event)"
  (onRotationChange)="onRotationChange($event)"
  
  <!-- Search Events -->
  (onSearchStart)="onSearchStart($event)"
  (onSearchResult)="onSearchResult($event)"
  (onSearchComplete)="onSearchComplete($event)"
  
  <!-- User Interaction Events -->
  (onTextSelection)="onTextSelection($event)"
  (onLinkClick)="onLinkClick($event)"
  
  <!-- Print/Download Events -->
  (onPrintStart)="onPrintStart()"
  (onDownloadStart)="onDownloadStart($event)">
</ng2-pdfjs-viewer>

<!-- Status Display -->
<div class="status-bar">
  <span *ngIf="isLoading">Loading...</span>
  <span *ngIf="!isLoading">Page {{ currentPage }} of {{ totalPages }}</span>
  <span *ngIf="currentZoom !== 1">Zoom: {{ (currentZoom * 100) | number:'1.0-0' }}%</span>
  <span *ngIf="isSearching">Searching...</span>
  <span *ngIf="searchResults">{{ searchResults.matchesCount }} matches found</span>
</div>
```

## Event Categories

### Essential Events
Events you'll most commonly use:
- `onDocumentLoad` - Document ready
- `onDocumentError` - Handle errors
- `onPageChange` - Track navigation
- `onProgress` - Show loading progress

### User Interaction Events
Events for interactive features:
- `onTextSelection` - Handle text selection
- `onLinkClick` - Handle link clicks
- `onAnnotationClick` - Handle annotations

### Search Events
Events for search functionality:
- `onSearchStart` - Search begins
- `onSearchResult` - Results found
- `onSearchComplete` - Search finished

### Advanced Events
Events for advanced use cases:
- `onZoomChange` - Zoom tracking
- `onRotationChange` - Rotation tracking
- `onSidebarToggle` - Sidebar state
- `onThumbnailLoad` - Thumbnail loading

## Next Steps

- ⚙️ [**Component Inputs**](./component-inputs) - Configuration options
- 📚 [**Examples**](../examples/basic-usage) - Practical examples
- 🚀 [**Getting Started**](../getting-started) - Quick setup guide
- 📖 [**Features Overview**](../features/overview) - All features
