# Component Inputs

Complete reference for all ng2-pdfjs-viewer component input properties.

## Basic Configuration

### Core Properties

#### `pdfSrc`
- **Type**: `string | Blob | Uint8Array`
- **Default**: `undefined`
- **Description**: The source of the PDF document to display

```typescript
// String URL
pdfSrc = "assets/sample.pdf";

// Blob object
pdfSrc = new Blob([pdfData], { type: 'application/pdf' });

// Uint8Array
pdfSrc = new Uint8Array(pdfBuffer);
```

#### `showSpinner`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show loading spinner while PDF loads

```html
<ng2-pdfjs-viewer [showSpinner]="true"></ng2-pdfjs-viewer>
```

#### `viewerId`
- **Type**: `string`
- **Default**: `'ng2-pdfjs-viewer-ID{increment}'`
- **Description**: Unique identifier for the viewer instance

```typescript
viewerId = 'my-custom-viewer-id';
```

#### `viewerFolder`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Custom PDF.js folder path for custom builds

```typescript
viewerFolder = 'assets/custom-pdfjs';
```

#### `externalWindow`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Open PDF viewer in external window

```typescript
externalWindow = true;
```

#### `target`
- **Type**: `string`
- **Default**: `'_blank'`
- **Description**: Target for external window (when externalWindow is true)

```typescript
target = '_blank'; // or '_self', '_parent', '_top'
```

#### `downloadFileName`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Custom filename for PDF downloads

```typescript
downloadFileName = 'my-document.pdf';
```

#### `locale`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Language/locale setting for the viewer

```typescript
locale = 'en-US'; // or 'es-ES', 'fr-FR', etc.
```

#### `useOnlyCssZoom`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Use CSS-only zoom instead of canvas scaling

```typescript
useOnlyCssZoom = true;
```

#### `diagnosticLogs`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable diagnostic logging for debugging

```typescript
diagnosticLogs = true; // Enable in development
```

## Individual Control Properties

### Button Visibility Controls

#### `showOpenFile`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the open file button

```typescript
showOpenFile = false; // Hide open file button
```

#### `showDownload`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the download button

```typescript
showDownload = true;
```

#### `showPrint`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the print button

```typescript
showPrint = true;
```

#### `showFullScreen`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the fullscreen button

```typescript
showFullScreen = false; // Hide fullscreen button
```

#### `showFind`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the find/search button

```typescript
showFind = true;
```

#### `showViewBookmark`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the bookmark view button

```typescript
showViewBookmark = false; // Hide bookmark button
```

#### `showAnnotations`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Show/hide the annotations button

```typescript
showAnnotations = true; // Show annotations button
```

## Auto-Action Properties

Auto actions are executed automatically when the PDF document loads successfully. They provide a way to trigger common actions without user interaction.

### When Auto Actions Execute
- **Trigger**: When `onDocumentLoad` event fires (PDF fully loaded)
- **Order**: Actions execute in the order they are defined
- **Timing**: After the PDF viewer is fully initialized and ready
- **One-time**: Each auto action executes only once per document load

### Automatic Actions on Load

#### `downloadOnLoad`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Automatically trigger download when PDF loads

```typescript
downloadOnLoad = true; // Auto-download on load
```

#### `printOnLoad`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Automatically trigger print when PDF loads

```typescript
printOnLoad = true; // Auto-print on load
```

#### `rotateCW`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Automatically rotate clockwise on load

```typescript
rotateCW = true; // Auto-rotate clockwise
```

#### `rotateCCW`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Automatically rotate counter-clockwise on load

```typescript
rotateCCW = true; // Auto-rotate counter-clockwise
```

#### `showLastPageOnLoad`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Show last page instead of first page on load

```typescript
showLastPageOnLoad = true; // Start at last page
```

## Navigation Properties

### Document Navigation

#### `namedDest`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Navigate to a named destination in the PDF

```typescript
namedDest = 'page.5'; // Go to page 5
namedDest = 'chapter.1'; // Go to chapter 1
```

## Error Handling Properties

### Custom Error Display

#### `errorOverride`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Override default error display with custom template

```typescript
errorOverride = true; // Use custom error template
```

#### `errorAppend`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Append custom message to default error message

```typescript
errorAppend = false; // Replace default error message
```

#### `errorMessage`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Custom error message to display

```typescript
errorMessage = 'Failed to load document. Please try again.';
```

## Display Configuration

### Toolbar Controls


#### `showToolbarLeft`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide left toolbar section

#### `showToolbarMiddle`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide middle toolbar section

#### `showToolbarRight`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide right toolbar section

### Sidebar Controls

#### `showSidebar`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the sidebar

#### `showSidebarLeft`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide left sidebar content

#### `showSidebarRight`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide right sidebar content

## Theming & Appearance

### Theme Configuration

#### `theme`
- **Type**: `'light' | 'dark' | 'auto'`
- **Default**: `'light'`
- **Description**: Overall theme of the viewer

```typescript
theme = 'dark'; // Dark theme
theme = 'auto'; // Auto-detect based on system preference
```

#### `primaryColor`
- **Type**: `string`
- **Default**: `'#3f51b5'`
- **Description**: Primary color for UI elements

```typescript
primaryColor = '#ff6b6b'; // Custom primary color
```

#### `backgroundColor`
- **Type**: `string`
- **Default**: `'#ffffff'`
- **Description**: Background color of the viewer

#### `textColor`
- **Type**: `string`
- **Default**: `'#333333'`
- **Description**: Text color for UI elements

#### `pageBorderColor`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Color of page borders

```typescript
pageBorderColor = '#cccccc'; // Light gray borders
```

#### `toolbarColor`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Background color of the toolbar

```typescript
toolbarColor = '#f5f5f5'; // Light gray toolbar
```

### Advanced Theming

#### `themeConfig`
- **Type**: `ThemeConfig`
- **Default**: `undefined`
- **Description**: Advanced theme configuration object

```typescript
interface ThemeConfig {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  customCSS?: string;
}

themeConfig: ThemeConfig = {
  theme: 'dark',
  primaryColor: '#3f51b5',
  backgroundColor: '#1e1e1e',
  textColor: '#ffffff',
  borderRadius: '8px'
};
```

## Convenience Configuration Objects

### Group Visibility

#### `groupVisibility`
- **Type**: `GroupVisibilityConfig`
- **Default**: `undefined`
- **Description**: Control visibility of toolbar button groups

```typescript
interface GroupVisibilityConfig {
  download?: boolean;
  print?: boolean;
  find?: boolean;
  fullScreen?: boolean;
  openFile?: boolean;
  viewBookmark?: boolean;
  annotations?: boolean;
}

groupVisibility: GroupVisibilityConfig = {
  "download": true,
  "print": true,
  "find": true,
  "fullScreen": true,
  "openFile": true,
  "viewBookmark": true,
  "annotations": false
};
```

### Control Visibility

#### `controlVisibility`
- **Type**: `ControlVisibilityConfig`
- **Default**: `undefined`
- **Description**: Fine-grained control over individual UI elements

```typescript
interface ControlVisibilityConfig {
  showToolbarLeft?: boolean;
  showToolbarMiddle?: boolean;
  showToolbarRight?: boolean;
  showSecondaryToolbarToggle?: boolean;
  showSidebar?: boolean;
  showSidebarLeft?: boolean;
  showSidebarRight?: boolean;
}
```

### Auto Actions

#### `autoActions`
- **Type**: `AutoActionConfig`
- **Default**: `undefined`
- **Description**: Configure automatic actions on document load

```typescript
interface AutoActionConfig {
  downloadOnLoad?: boolean;
  printOnLoad?: boolean;
  rotateCW?: boolean;
  rotateCCW?: boolean;
  showLastPageOnLoad?: boolean;
}

autoActions: AutoActionConfig = {
  "downloadOnLoad": false,
  "printOnLoad": false
};
```

## Template Configuration

### Custom Templates

#### `customSpinnerTpl`
- **Type**: `TemplateRef<any>`
- **Default**: `undefined`
- **Description**: Custom Angular template for loading spinner

```html
<ng-template #loadingTemplate>
  <div class="custom-loader">
    <mat-spinner></mat-spinner>
    <p>Loading your document...</p>
  </div>
</ng-template>

<ng2-pdfjs-viewer [customSpinnerTpl]="loadingTemplate">
</ng2-pdfjs-viewer>
```

#### `customErrorTpl`
- **Type**: `TemplateRef<any>`
- **Default**: `undefined`
- **Description**: Custom Angular template for error display

```html
<ng-template #errorTemplate>
  <div class="error-display">
    <mat-icon>error_outline</mat-icon>
    <h3>Failed to load PDF</h3>
    <p>Please check the file and try again.</p>
    <button mat-button (click)="retry()">Retry</button>
  </div>
</ng-template>

<ng2-pdfjs-viewer [customErrorTpl]="errorTemplate">
</ng2-pdfjs-viewer>
```

### Template Classes

#### `spinnerClass`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: CSS class for spinner container

#### `errorClass`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: CSS class for error container

## Advanced Configuration

### Error Handling

#### `errorHandling`
- **Type**: `ErrorConfig`
- **Default**: `undefined`
- **Description**: Advanced error handling configuration

```typescript
interface ErrorConfig {
  showErrors?: boolean;
  customErrorMessages?: { [key: string]: string };
  retryAttempts?: number;
  retryDelay?: number;
}
```

### Viewer Configuration

#### `viewerConfig`
- **Type**: `ViewerConfig`
- **Default**: `undefined`
- **Description**: PDF.js viewer configuration options

```typescript
interface ViewerConfig {
  defaultZoomValue?: string;
  maxCanvasPixels?: number;
  textLayerMode?: number;
  annotationMode?: number;
  imageResourcesPath?: string;
  cMapUrl?: string;
  cMapPacked?: boolean;
}
```

### Layout Configuration

#### `toolbarDensity`
- **Type**: `'compact' | 'normal' | 'comfortable'`
- **Default**: `'default'`
- **Description**: Density of toolbar buttons

```typescript
toolbarDensity = 'compact'; // Smaller buttons, more space
toolbarDensity = 'comfortable'; // Larger buttons, more padding
```

#### `sidebarWidth`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Width of the sidebar

```typescript
sidebarWidth = '280px'; // Fixed width
sidebarWidth = '25%'; // Percentage width
```

#### `toolbarPosition`
- **Type**: `'top' | 'bottom'`
- **Default**: `'top'`
- **Description**: Position of the toolbar

```typescript
toolbarPosition = 'bottom'; // Move toolbar to bottom
```

#### `sidebarPosition`
- **Type**: `'left' | 'right'`
- **Default**: `'left'`
- **Description**: Position of the sidebar

```typescript
sidebarPosition = 'right'; // Move sidebar to right
```

#### `responsiveBreakpoint`
- **Type**: `string | number`
- **Default**: `undefined`
- **Description**: Breakpoint for responsive behavior

```typescript
responsiveBreakpoint = 768; // Mobile breakpoint
responsiveBreakpoint = '768px'; // CSS breakpoint
```

#### `layoutConfig`
- **Type**: `LayoutConfig`
- **Default**: `undefined`
- **Description**: Layout and responsive configuration object

```typescript
interface LayoutConfig {
  toolbarDensity?: 'compact' | 'normal' | 'comfortable';
  sidebarWidth?: string;
  toolbarPosition?: 'top' | 'bottom';
  sidebarPosition?: 'left' | 'right';
  responsiveBreakpoint?: number;
}

layoutConfig: LayoutConfig = {
  toolbarDensity: 'compact',
  sidebarWidth: '280px',
  toolbarPosition: 'top',
  sidebarPosition: 'left',
  responsiveBreakpoint: 768
};
```

## Two-Way Bound Properties

These properties support two-way data binding with Angular's `[(property)]` syntax. They automatically emit change events when modified programmatically or by user interaction.

### Two-Way Binding Properties
- `zoom` - Zoom level with `zoomChange` event
- `cursor` - Cursor mode with `cursorChange` event  
- `scroll` - Scroll mode with `scrollChange` event
- `spread` - Spread mode with `spreadChange` event
- `pageMode` - Page mode with `pageModeChange` event
- `page` - Current page number (read-only, no change event)
- `pdfSrc` - PDF source (read-only, no change event)

### One-Way Binding Properties
- `rotation` - Document rotation (one-way only, no change event)

## Getter/Setter Properties

### Current State Properties

#### `zoom` (getter/setter)
- **Type**: `string`
- **Description**: Current zoom level of the PDF

```typescript
// Get current zoom
const currentZoom = this.pdfViewer.zoom; // Returns 'auto', 'page-width', etc.

// Set zoom level
this.pdfViewer.zoom = '150%'; // Set to 150%
this.pdfViewer.zoom = 'page-width'; // Fit to page width
```

#### `rotation` (getter/setter)
- **Type**: `number`
- **Description**: Current rotation angle in degrees

```typescript
// Get current rotation
const currentRotation = this.pdfViewer.rotation; // Returns 0, 90, 180, 270

// Set rotation
this.pdfViewer.rotation = 90; // Rotate 90 degrees clockwise
```

#### `cursor` (getter/setter)
- **Type**: `string`
- **Description**: Current cursor mode

```typescript
// Get current cursor
const currentCursor = this.pdfViewer.cursor; // Returns 'grab', 'grabbing', etc.

// Set cursor mode
this.pdfViewer.cursor = 'grab'; // Hand cursor for panning
```

#### `scroll` (getter/setter)
- **Type**: `string`
- **Description**: Current scroll mode

```typescript
// Get current scroll
const currentScroll = this.pdfViewer.scroll; // Returns 'vertical', 'horizontal', etc.

// Set scroll mode
this.pdfViewer.scroll = 'vertical'; // Vertical scrolling only
```

#### `spread` (getter/setter)
- **Type**: `string`
- **Description**: Current spread mode

```typescript
// Get current spread
const currentSpread = this.pdfViewer.spread; // Returns 'none', 'odd', 'even', etc.

// Set spread mode
this.pdfViewer.spread = 'odd'; // Show odd pages only
```

#### `pageMode` (getter/setter)
- **Type**: `string`
- **Description**: Current page mode

```typescript
// Get current page mode
const currentPageMode = this.pdfViewer.pageMode; // Returns 'single', 'book', etc.

// Set page mode
this.pdfViewer.pageMode = 'book'; // Book-like page layout
```

#### `page` (getter/setter)
- **Type**: `number`
- **Description**: Current page number (1-based)

```typescript
// Get current page
const currentPage = this.pdfViewer.page; // Returns 1, 2, 3, etc.

// Set current page
this.pdfViewer.page = 5; // Go to page 5
```

#### `pdfSrc` (getter/setter)
- **Type**: `string | Blob | Uint8Array`
- **Description**: Current PDF source

```typescript
// Get current PDF source
const currentSrc = this.pdfViewer.pdfSrc; // Returns current PDF source

// Set PDF source
this.pdfViewer.pdfSrc = 'assets/new-document.pdf'; // Load new PDF
this.pdfViewer.pdfSrc = new Blob([pdfData], { type: 'application/pdf' }); // Load from Blob
```

### External Window Properties

#### `externalWindowOptions`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Options for external window (when externalWindow is true)

```typescript
externalWindowOptions = 'width=1200,height=800,scrollbars=yes,resizable=yes';
```

## Deprecated Properties

:::warning Deprecated
These properties are deprecated and will be removed in future versions. Use the recommended alternatives.
:::

### Deprecated Inputs

#### `startDownload` ⚠️
- **Deprecated**: Use `downloadOnLoad` in `autoActions` instead
- **Type**: `boolean`
- **Migration**: 
  ```typescript
  // Old
  [startDownload]="true"
  
  // New
  autoActions = { downloadOnLoad: true };
  [autoActions]="autoActions"
  ```

#### `startPrint` ⚠️
- **Deprecated**: Use `printOnLoad` in `autoActions` instead
- **Type**: `boolean`
- **Migration**: 
  ```typescript
  // Old
  [startPrint]="true"
  
  // New
  autoActions = { printOnLoad: true };
  [autoActions]="autoActions"
  ```

#### `errorHtml` ⚠️
- **Deprecated**: Use `customErrorTpl` instead
- **Type**: `string`
- **Migration**: 
  ```typescript
  // Old
  [errorHtml]="'<div>Error</div>'"
  
  // New
  [customErrorTpl]="errorTemplate"
  ```

#### `spinnerHtml` ⚠️
- **Deprecated**: Use `customSpinnerTpl` instead
- **Type**: `string`
- **Migration**: 
  ```typescript
  // Old
  [spinnerHtml]="'<div>Loading...</div>'"
  
  // New
  [customSpinnerTpl]="loadingTemplate"
  ```

## Type Definitions

### Common Types

```typescript
// Theme types
type Theme = 'light' | 'dark' | 'auto';

// Source types
type PdfSource = string | Blob | Uint8Array;

// Zoom types
type ZoomValue = string | number;

// Page fit types
type PageFit = 'auto' | 'page-width' | 'page-height' | 'page-fit' | 'actual';
```

### Configuration Interfaces

```typescript
interface GroupVisibilityConfig {
  download?: boolean;
  print?: boolean;
  find?: boolean;
  fullScreen?: boolean;
  openFile?: boolean;
  viewBookmark?: boolean;
  annotations?: boolean;
}

interface ControlVisibilityConfig {
  showToolbarLeft?: boolean;
  showToolbarMiddle?: boolean;
  showToolbarRight?: boolean;
  showSecondaryToolbarToggle?: boolean;
  showSidebar?: boolean;
  showSidebarLeft?: boolean;
  showSidebarRight?: boolean;
}

interface AutoActionConfig {
  downloadOnLoad?: boolean;
  printOnLoad?: boolean;
  rotateCW?: boolean;
  rotateCCW?: boolean;
  showLastPageOnLoad?: boolean;
}

interface ThemeConfig {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  customCSS?: string;
}
```

## Examples

### Complete Configuration Example

```typescript
export class PdfViewerComponent {
  // Basic configuration
  pdfSrc = 'assets/sample.pdf';
  showSpinner = true;
  theme = 'dark';

  // Convenience configuration
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

  // Advanced theming
  themeConfig = {
    theme: 'dark',
    primaryColor: '#3f51b5',
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff'
  };
}
```

```html
<ng2-pdfjs-viewer
  [pdfSrc]="pdfSrc"
  [showSpinner]="showSpinner"
  [theme]="theme"
  [groupVisibility]="groupVisibility"
  [controlVisibility]="controlVisibility"
  [autoActions]="autoActions"
  [themeConfig]="themeConfig"
  [customSpinnerTpl]="loadingTemplate"
  [customErrorTpl]="errorTemplate">
</ng2-pdfjs-viewer>
```

## Next Steps

- 📤 [**Component Outputs**](./component-outputs) - Event handling
- 📚 [**Examples**](../examples/basic-usage) - Practical examples
- 🚀 [**Getting Started**](../getting-started) - Quick setup guide
- 📖 [**Features Overview**](../features/overview) - All features
