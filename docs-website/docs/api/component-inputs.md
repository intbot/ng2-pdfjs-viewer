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

## Display Configuration

### Toolbar Controls

#### `showToolbar`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show/hide the main toolbar

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

#### `layoutConfig`
- **Type**: `LayoutConfig`
- **Default**: `undefined`
- **Description**: Layout and responsive configuration

```typescript
interface LayoutConfig {
  toolbarDensity?: 'compact' | 'normal' | 'comfortable';
  sidebarWidth?: string;
  toolbarPosition?: 'top' | 'bottom';
  sidebarPosition?: 'left' | 'right';
  responsiveBreakpoint?: number;
}
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
