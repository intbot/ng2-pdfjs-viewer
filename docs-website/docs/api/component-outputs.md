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

```typescript
onDocumentInit() {
  console.log('Document initialization started');
  this.isInitializing = true;
}
```

### `onBeforePrint`
- **Type**: `EventEmitter<void>`
- **Description**: Fired before print dialog opens

```typescript
onBeforePrint() {
  console.log('About to print document');
  this.isPrinting = true;
}
```

### `onAfterPrint`
- **Type**: `EventEmitter<void>`
- **Description**: Fired after print dialog closes

```typescript
onAfterPrint() {
  console.log('Print dialog closed');
  this.isPrinting = false;
}
```

## Page Events

### `onPageChange`
- **Type**: `EventEmitter<number>`
- **Description**: Fired when the current page changes

```typescript
onPageChange(pageNumber: number) {
  console.log(`Page changed to: ${pageNumber}`);
  this.currentPage = pageNumber;
}
```

### `onPagesInit`
- **Type**: `EventEmitter<PagesInfo>`
- **Description**: Fired when pages are initialized

```typescript
interface PagesInfo {
  pagesCount: number;
  source: any;
}

onPagesInit(event: PagesInfo) {
  console.log(`Pages initialized: ${event.pagesCount} pages`);
  this.totalPages = event.pagesCount;
}
```

### `onPageRendered`
- **Type**: `EventEmitter<PageRenderInfo>`
- **Description**: Fired when a page finishes rendering

```typescript
interface PageRenderInfo {
  pageNumber: number;
  source: any;
}

onPageRendered(event: PageRenderInfo) {
  console.log(`Page ${event.pageNumber} rendered`);
}
```

## View Events

### `onScaleChange`
- **Type**: `EventEmitter<number>`
- **Description**: Fired when scale/zoom changes

```typescript
onScaleChange(scale: number) {
  console.log(`Scale changed to: ${scale}x`);
  this.currentScale = scale;
}
```

### `onRotationChange`
- **Type**: `EventEmitter<ChangedRotation>`
- **Description**: Fired when document rotation changes

```typescript
interface ChangedRotation {
  rotation: number;
  page: number;
}

onRotationChange(event: ChangedRotation) {
  console.log(`Document rotated: ${event.rotation}° on page ${event.page}`);
  this.currentRotation = event.rotation;
}
```

### `onPresentationModeChanged`
- **Type**: `EventEmitter<PresentationMode>`
- **Description**: Fired when presentation mode changes

```typescript
interface PresentationMode {
  active: boolean;
  switchInProgress: boolean;
}

onPresentationModeChanged(event: PresentationMode) {
  console.log(`Presentation mode: ${event.active ? 'active' : 'inactive'}`);
  this.isPresentationMode = event.active;
}
```

## Search Events

### `onFind`
- **Type**: `EventEmitter<FindOperation>`
- **Description**: Fired when find/search operation occurs

```typescript
interface FindOperation {
  query: string;
  caseSensitive: boolean;
  entireWord: boolean;
  highlightAll: boolean;
  findPrevious: boolean;
}

onFind(event: FindOperation) {
  console.log(`Find operation: "${event.query}"`);
  this.isSearching = true;
}
```

### `onUpdateFindMatchesCount`
- **Type**: `EventEmitter<FindMatchesCount>`
- **Description**: Fired when find matches count updates

```typescript
interface FindMatchesCount {
  matchesCount: number;
  current: number;
  query: string;
}

onUpdateFindMatchesCount(event: FindMatchesCount) {
  console.log(`Found ${event.matchesCount} matches for "${event.query}"`);
  this.searchResults = event;
}
```

## User Interaction Events

### `onOpenFile`
- **Type**: `EventEmitter<void>`
- **Description**: Fired when open file button is clicked

```typescript
onOpenFile() {
  console.log('Open file button clicked');
  // Handle file opening logic
}
```

### `onAnnotationLayerRendered`
- **Type**: `EventEmitter<AnnotationLayerRenderEvent>`
- **Description**: Fired when annotation layer is rendered

```typescript
interface AnnotationLayerRenderEvent {
  pageNumber: number;
  source: any;
}

onAnnotationLayerRendered(event: AnnotationLayerRenderEvent) {
  console.log(`Annotation layer rendered for page ${event.pageNumber}`);
}
```

### `onBookmarkClick`
- **Type**: `EventEmitter<BookmarkClick>`
- **Description**: Fired when a bookmark is clicked

```typescript
interface BookmarkClick {
  dest: any;
  pageNumber: number;
}

onBookmarkClick(event: BookmarkClick) {
  console.log(`Bookmark clicked, going to page ${event.pageNumber}`);
}
```

### `onIdle`
- **Type**: `EventEmitter<void>`
- **Description**: Fired when viewer becomes idle

```typescript
onIdle() {
  console.log('Viewer is now idle');
  // Handle idle state
}
```

## Metadata Events

### `onMetadataLoaded`
- **Type**: `EventEmitter<DocumentMetadata>`
- **Description**: Fired when document metadata is loaded

```typescript
interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

onMetadataLoaded(event: DocumentMetadata) {
  console.log('Document metadata loaded:', event);
  this.documentTitle = event.title;
  this.documentAuthor = event.author;
}
```

### `onOutlineLoaded`
- **Type**: `EventEmitter<DocumentOutline>`
- **Description**: Fired when document outline/bookmarks are loaded

```typescript
interface DocumentOutline {
  items: any[];
  source: any;
}

onOutlineLoaded(event: DocumentOutline) {
  console.log('Document outline loaded:', event.items);
  this.hasOutline = event.items && event.items.length > 0;
}
```

## Property Change Events

### `zoomChange`
- **Type**: `EventEmitter<string>`
- **Description**: Fired when zoom level changes

```typescript
zoomChange(zoom: string) {
  console.log(`Zoom changed to: ${zoom}`);
  this.currentZoom = zoom;
}
```

### `cursorChange`
- **Type**: `EventEmitter<string>`
- **Description**: Fired when cursor mode changes

```typescript
cursorChange(cursor: string) {
  console.log(`Cursor changed to: ${cursor}`);
  this.currentCursor = cursor;
}
```

### `scrollChange`
- **Type**: `EventEmitter<string>`
- **Description**: Fired when scroll mode changes

```typescript
scrollChange(scroll: string) {
  console.log(`Scroll changed to: ${scroll}`);
  this.currentScroll = scroll;
}
```

### `spreadChange`
- **Type**: `EventEmitter<string>`
- **Description**: Fired when spread mode changes

```typescript
spreadChange(spread: string) {
  console.log(`Spread changed to: ${spread}`);
  this.currentSpread = spread;
}
```

### `pageModeChange`
- **Type**: `EventEmitter<string>`
- **Description**: Fired when page mode changes

```typescript
pageModeChange(pageMode: string) {
  console.log(`Page mode changed to: ${pageMode}`);
  this.currentPageMode = pageMode;
}
```

## Complete Event List

Here's the complete list of all available events:

### Document Events (5)
- `onDocumentLoad` - Document loaded successfully
- `onDocumentError` - Document load failed
- `onDocumentInit` - Document initialization started
- `onBeforePrint` - Before print dialog opens
- `onAfterPrint` - After print dialog closes

### Page Events (3)
- `onPageChange` - Current page changed
- `onPagesInit` - Pages initialized
- `onPageRendered` - Page finished rendering

### View Events (3)
- `onScaleChange` - Scale/zoom changed
- `onRotationChange` - Rotation changed
- `onPresentationModeChanged` - Presentation mode changed

### Search Events (2)
- `onFind` - Find operation performed
- `onUpdateFindMatchesCount` - Find matches count updated

### User Interaction Events (4)
- `onOpenFile` - Open file button clicked
- `onAnnotationLayerRendered` - Annotation layer rendered
- `onBookmarkClick` - Bookmark clicked
- `onIdle` - Viewer became idle

### Metadata Events (2)
- `onMetadataLoaded` - Document metadata loaded
- `onOutlineLoaded` - Document outline loaded

### Property Change Events (5)
- `zoomChange` - Zoom level changed
- `cursorChange` - Cursor mode changed
- `scrollChange` - Scroll mode changed
- `spreadChange` - Spread mode changed
- `pageModeChange` - Page mode changed

**Total: 24 Events**

## Complete Event Handling Example

```typescript
export class PdfViewerComponent {
  // State management
  isLoading = true;
  currentPage = 1;
  totalPages = 0;
  currentScale = 1;
  isSearching = false;
  searchResults: any = null;
  documentTitle = '';
  hasOutline = false;

  // Document events
  onDocumentLoad() {
    console.log('📄 Document loaded successfully');
    this.isLoading = false;
  }

  onDocumentError(error: DocumentError) {
    console.error('❌ Document load error:', error);
    this.isLoading = false;
  }

  onDocumentInit() {
    console.log('🔄 Document initialization started');
  }

  onBeforePrint() {
    console.log('🖨️ About to print document');
  }

  onAfterPrint() {
    console.log('✅ Print dialog closed');
  }

  // Page events
  onPageChange(pageNumber: number) {
    console.log(`📖 Page changed to: ${pageNumber}`);
    this.currentPage = pageNumber;
  }

  onPagesInit(event: PagesInfo) {
    console.log(`📚 Pages initialized: ${event.pagesCount} pages`);
    this.totalPages = event.pagesCount;
  }

  onPageRendered(event: PageRenderInfo) {
    console.log(`🎨 Page ${event.pageNumber} rendered`);
  }

  // View events
  onScaleChange(scale: number) {
    console.log(`🔍 Scale changed to: ${scale}x`);
    this.currentScale = scale;
  }

  onRotationChange(event: ChangedRotation) {
    console.log(`🔄 Rotation changed: ${event.rotation}° on page ${event.page}`);
  }

  onPresentationModeChanged(event: PresentationMode) {
    console.log(`📺 Presentation mode: ${event.active ? 'active' : 'inactive'}`);
  }

  // Search events
  onFind(event: FindOperation) {
    console.log(`🔎 Find operation: "${event.query}"`);
    this.isSearching = true;
  }

  onUpdateFindMatchesCount(event: FindMatchesCount) {
    console.log(`🎯 Found ${event.matchesCount} matches for "${event.query}"`);
    this.searchResults = event;
  }

  // User interaction events
  onOpenFile() {
    console.log('📁 Open file button clicked');
  }

  onAnnotationLayerRendered(event: AnnotationLayerRenderEvent) {
    console.log(`📝 Annotation layer rendered for page ${event.pageNumber}`);
  }

  onBookmarkClick(event: BookmarkClick) {
    console.log(`🔖 Bookmark clicked, going to page ${event.pageNumber}`);
  }

  onIdle() {
    console.log('😴 Viewer is now idle');
  }

  // Metadata events
  onMetadataLoaded(event: DocumentMetadata) {
    console.log('📋 Document metadata loaded:', event);
    this.documentTitle = event.title || 'Untitled Document';
  }

  onOutlineLoaded(event: DocumentOutline) {
    console.log('📑 Document outline loaded');
    this.hasOutline = event.items && event.items.length > 0;
  }

  // Property change events
  zoomChange(zoom: string) {
    console.log(`🔍 Zoom changed to: ${zoom}`);
  }

  cursorChange(cursor: string) {
    console.log(`🖱️ Cursor changed to: ${cursor}`);
  }

  scrollChange(scroll: string) {
    console.log(`📜 Scroll changed to: ${scroll}`);
  }

  spreadChange(spread: string) {
    console.log(`📖 Spread changed to: ${spread}`);
  }

  pageModeChange(pageMode: string) {
    console.log(`📄 Page mode changed to: ${pageMode}`);
  }
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  
  <!-- Document Events -->
  (onDocumentLoad)="onDocumentLoad()"
  (onDocumentError)="onDocumentError($event)"
  (onDocumentInit)="onDocumentInit()"
  (onBeforePrint)="onBeforePrint()"
  (onAfterPrint)="onAfterPrint()"
  
  <!-- Page Events -->
  (onPageChange)="onPageChange($event)"
  (onPagesInit)="onPagesInit($event)"
  (onPageRendered)="onPageRendered($event)"
  
  <!-- View Events -->
  (onScaleChange)="onScaleChange($event)"
  (onRotationChange)="onRotationChange($event)"
  (onPresentationModeChanged)="onPresentationModeChanged($event)"
  
  <!-- Search Events -->
  (onFind)="onFind($event)"
  (onUpdateFindMatchesCount)="onUpdateFindMatchesCount($event)"
  
  <!-- User Interaction Events -->
  (onOpenFile)="onOpenFile()"
  (onAnnotationLayerRendered)="onAnnotationLayerRendered($event)"
  (onBookmarkClick)="onBookmarkClick($event)"
  (onIdle)="onIdle()"
  
  <!-- Metadata Events -->
  (onMetadataLoaded)="onMetadataLoaded($event)"
  (onOutlineLoaded)="onOutlineLoaded($event)"
  
  <!-- Property Change Events -->
  (zoomChange)="zoomChange($event)"
  (cursorChange)="cursorChange($event)"
  (scrollChange)="scrollChange($event)"
  (spreadChange)="spreadChange($event)"
  (pageModeChange)="pageModeChange($event)">
</ng2-pdfjs-viewer>

<!-- Status Display -->
<div class="status-bar">
  <span *ngIf="isLoading">Loading...</span>
  <span *ngIf="!isLoading">Page {{ currentPage }} of {{ totalPages }}</span>
  <span *ngIf="currentScale !== 1">Scale: {{ (currentScale * 100) | number:'1.0-0' }}%</span>
  <span *ngIf="isSearching">Searching...</span>
  <span *ngIf="searchResults">{{ searchResults.matchesCount }} matches found</span>
  <span *ngIf="documentTitle">Title: {{ documentTitle }}</span>
  <span *ngIf="hasOutline">📑 Has outline</span>
</div>
```

## Event Categories

### Essential Events
Events you'll most commonly use:
- `onDocumentLoad` - Document ready
- `onDocumentError` - Handle errors
- `onPageChange` - Track navigation
- `onPagesInit` - Get page count

### User Interaction Events
Events for interactive features:
- `onOpenFile` - Handle file opening
- `onBookmarkClick` - Handle bookmark navigation
- `onAnnotationLayerRendered` - Handle annotations
- `onIdle` - Handle idle state

### Search Events
Events for search functionality:
- `onFind` - Find operation performed
- `onUpdateFindMatchesCount` - Search results updated

### Advanced Events
Events for advanced use cases:
- `onScaleChange` - Zoom tracking
- `onRotationChange` - Rotation tracking
- `onPresentationModeChanged` - Presentation mode
- `onMetadataLoaded` - Document metadata
- `onOutlineLoaded` - Document outline

### Property Change Events
Events for property changes:
- `zoomChange` - Zoom level changes
- `cursorChange` - Cursor mode changes
- `scrollChange` - Scroll mode changes
- `spreadChange` - Spread mode changes
- `pageModeChange` - Page mode changes

## Annotation & Editing Events

### `onAnnotationEditorStateChange`
- **Type**: `EventEmitter<AnnotationEditorState>` (`{ isEditing, isEmpty, hasSomethingToUndo, hasSomethingToRedo, hasSelectedEditor }`)
- **Description**: Annotation editor undo/redo/dirty state — drive "unsaved changes" UX

```typescript
onEditorState(state: AnnotationEditorState) {
  this.hasUnsavedAnnotations = !state.isEmpty;
}
```

### `annotationEditorChange`
- **Type**: `EventEmitter<AnnotationEditorMode>`
- **Description**: Two-way companion of `[(annotationEditor)]` — fires when the user switches editor modes in the toolbar

### `onPagesEdited`
- **Type**: `EventEmitter<PagesEditedEvent>` (`{ operation, pagesCount }`)
- **Description**: Page organization changes (reorder/delete/extract/merge) when `enablePageEditing` is on

## Forms & Loading Events

### `formDataChange`
- **Type**: `EventEmitter<FormDataMap>`
- **Description**: Two-way companion of `[(formData)]` — fires when the user edits form fields

### `onProgress`
- **Type**: `EventEmitter<{ loaded: number; total: number }>`
- **Description**: Download progress while the component fetches an authenticated document (`httpHeaders`/`withCredentials`)

### `onPasswordPrompt`
- **Type**: `EventEmitter<void>`
- **Description**: Fired when PDF.js shows its password dialog for a protected document (the built-in spinner is dropped automatically so the dialog is usable)

## Read Aloud Events

### `onReadAloudStateChange`
- **Type**: `EventEmitter<ReadAloudState>` (`{ status: 'reading' | 'paused' | 'stopped' | 'finished' | 'error'; page; sentence? }`)
- **Description**: Read-aloud progress. `'reading'` fires once per sentence with the sentence text; the viewer highlights that sentence in the page text layer

## Viewer State Events

### `onSidebarViewChanged`
- **Type**: `EventEmitter<SidebarViewChange>` (`{ view: 'none' | 'thumbs' | 'outline' | 'attachments' | 'layers' | 'unknown' }`)
- **Description**: Sidebar panel switches

### `onLayersChanged`
- **Type**: `EventEmitter<LayersChange>` (`{ reason: 'loaded' | 'changed'; layersCount? }`)
- **Description**: Optional-content layers loaded for the document, or layer visibility toggled

### `onNamedAction`
- **Type**: `EventEmitter<NamedActionEvent>` (`{ action: string }`)
- **Description**: Named actions triggered from inside the document (GoToPage, Print, …)

### `onDocumentProperties`
- **Type**: `EventEmitter<void>`
- **Description**: User opened the document-properties dialog

## Next Steps

- ⚙️ [**Component Inputs**](./component-inputs) - Configuration options
- 📚 [**Examples**](../examples/basic-usage) - Practical examples
- 🚀 [**Getting Started**](../getting-started) - Quick setup guide
- 📖 [**Features Overview**](../features/overview) - All features
