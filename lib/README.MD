# Angular PDF viewer powered by Mozilla's PDF.js

The most reliable, feature-rich Angular PDF viewer component powered by Mozilla's PDF.js

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/ng2-pdfjs-viewer?logo=npm&color=blue)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![PDF.js Version](https://img.shields.io/badge/PDF.js%20v5.3.93-latest-green?logo=mozilla)](https://github.com/mozilla/pdf.js)
[![Angular Support](https://img.shields.io/badge/Angular%2020+-supported-red?logo=angular)](https://angular.dev/overview)
[![NPM Downloads](https://img.shields.io/npm/dm/ng2-pdfjs-viewer?label=downloads%2Fmonth&color=orange)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![Total Downloads](https://img.shields.io/badge/total%20downloads-7M+-brightgreen?logo=npm)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![Since 2018](https://img.shields.io/badge/since-2018-blue?logo=calendar)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![GitHub Stars](https://img.shields.io/github/stars/intbot/ng2-pdfjs-viewer?logo=github)](https://github.com/intbot/ng2-pdfjs-viewer)
[![GitHub Issues](https://img.shields.io/github/issues/intbot/ng2-pdfjs-viewer?logo=github)](https://github.com/intbot/ng2-pdfjs-viewer/issues)

</div>

<div align="center">

[**Live Demo**](https://ng2-pdfjs-viewer.azurewebsites.net) • [**Documentation**](#documentation) • [**Examples**](#examples) • [**API Reference**](#api-reference) • [**Migration Guide**](#migration-guide)

</div>

---

ng2-pdfjs-viewer is the most comprehensive and feature-rich Angular PDF viewer component available. **Born in 2018** and still going strong with over **7+ million downloads**, this battle-tested library has been trusted by developers worldwide for **over 8 years**, powering thousands of applications.

This powerful library enables developers to seamlessly integrate PDF viewing capabilities into Angular applications with enterprise-grade features, custom theming, and mobile-first responsive design. Built on Mozilla's PDF.js v5.3.93, ng2-pdfjs-viewer provides advanced PDF rendering, document navigation, search functionality, and extensive customization options.

Whether you need a simple embedded PDF viewer or a complex document management system, this component delivers the performance and flexibility required for modern Angular applications. **The most mature and reliable Angular PDF viewer solution** with continuous updates and long-term support.

### Why Choose ng2-pdfjs-viewer?

- **🚀 Always Up-to-Date** - Continuously updated with the latest PDF.js versions and Angular compatibility
- **🏗️ Enterprise-Ready** - Built for production with comprehensive error handling and performance optimization
- **🎨 Highly Customizable** - Extensive theming options, custom templates, and flexible configuration
- **📱 Mobile Optimized** - Touch-friendly interface with responsive design for all screen sizes
- **🔧 Developer Friendly** - Full TypeScript support, comprehensive documentation, and easy integration
- **⚡ High Performance** - Event-driven architecture with efficient memory management and lazy loading
- **🌍 Global Support** - Multi-language support with automatic locale detection and RTL compatibility
- **🛡️ Production Tested** - Trusted by thousands of applications with millions of downloads
- **📈 Proven Track Record** - 8+ years of continuous development and community support
- **🔒 Security Focused** - Regular security updates and vulnerability patches

### 🆕 Latest Features (v20.4.0)

| Feature                       | Description                                                        | Status |
| ----------------------------- | ------------------------------------------------------------------ | ------ |
| **Advanced Theme System**     | CSS custom properties for complete visual customization            | ✅ New |
| **Template-Based UI**         | Custom loading spinners and error displays using Angular templates | ✅ New |
| **Convenience Configuration** | Object-based configuration for cleaner, more maintainable code     | ✅ New |
| **Event-Driven Architecture** | Pure event-based system with universal action dispatcher           | ✅ New |
| **Enhanced Error Handling**   | Multiple error display styles with custom templates                | ✅ New |
| **Mobile-First Design**       | Responsive layout optimized for touch devices                      | ✅ New |
| **TypeScript Strict Mode**    | Full type safety with comprehensive API coverage                   | ✅ New |

### 🏆 Unique Advantages

- **Universal Action Dispatcher** - Single pathway for all actions with readiness validation
- **Template-Based Customization** - Use Angular templates for loading and error states
- **Comprehensive Event System** - 24+ events covering all user interactions and state changes
- **Advanced Configuration Objects** - Clean, object-based configuration for complex setups
- **Production-Ready Architecture** - Event-driven design with no timeouts or polling
- **Complete API Coverage** - 19+ methods with consistent Promise-based returns

### 🎯 Perfect For

- **Enterprise Applications** - Robust, scalable PDF viewing for business applications
- **Document Management Systems** - Complete PDF handling with search and navigation
- **E-Learning Platforms** - Interactive PDF viewing for educational content
- **Financial Applications** - Secure PDF viewing for reports and statements
- **Healthcare Systems** - Reliable PDF viewing for medical documents
- **Government Portals** - Accessible PDF viewing for public services
- **E-Commerce Platforms** - Product catalogs and documentation viewing
- **Content Management Systems** - Integrated PDF viewing and management

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Advanced Configuration](#advanced-configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Migration Guide](#migration-guide)
- [Deprecated Features](#deprecated-features)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Quick Start

### 1. Install the Package

```bash
npm install ng2-pdfjs-viewer --save
```

### 2. Import the Module

```typescript
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";

@NgModule({
  imports: [BrowserModule, PdfJsViewerModule],
  // ... rest of your module
})
export class AppModule {}
```

### 3. Use in Your Component

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [showSpinner]="true"
  [theme]="'light'"
>
</ng2-pdfjs-viewer>
```

### 4. Configure Assets (Required)

Add PDF.js assets to your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
"assets": [
              {
                "glob": "**/*",
                "input": "node_modules/ng2-pdfjs-viewer/pdfjs",
                "output": "/assets/pdfjs"
              }
            ]
          }
        }
      }
    }
  }
}
```

---

## ✨ Features

**🎉 7+ Million Downloads & Counting!** - Trusted by developers worldwide for reliable PDF viewing in Angular applications since 2018.

### 🎯 Core PDF Viewing Features

- **📄 High-Quality PDF Rendering** - Powered by Mozilla's PDF.js v5.3.93 for superior document display
- **🔄 Multiple Display Modes** - Embedded viewer, new window, or external tab options
- **📱 Mobile-First Responsive Design** - Touch-friendly controls optimized for all devices
- **🌍 Complete Internationalization** - Support for 50+ languages with automatic locale detection
- **⚡ Optimized Performance** - Lazy loading, memory management, and efficient rendering

### 🎨 Visual Customization

- **🎨 Theme System** - Light, dark, and auto themes with custom color schemes
- **🎭 Custom Styling** - CSS custom properties for complete visual control
- **🔄 Loading States** - Custom loading spinners with template support
- **❌ Error Handling** - Multiple error display styles with custom templates
- **📐 Layout Control** - Toolbar density, sidebar width, and positioning options

### 🔧 Developer Features

- **📝 TypeScript Support** - Full type safety with strict mode
- **🔌 Event System** - Comprehensive event handling for all user interactions
- **⚙️ Configuration Objects** - Convenience setters for cleaner code
- **🛠️ API Methods** - Promise-based methods for programmatic control
- **🐛 Debugging** - Built-in diagnostic logging and error tracking

### 📊 Advanced Features

- **🔍 Search & Navigation** - Full-text search with highlighting
- **📖 Bookmarks & Attachments** - Document structure navigation
- **🖨️ Print & Download** - Built-in print and download functionality
- **🔄 Rotation & Zoom** - Document manipulation with smooth animations
- **📱 Touch Gestures** - Mobile-optimized touch interactions

---

## 📦 Installation

### Prerequisites

- Angular 20.0+ (supports Angular 2.0+)
- Node.js 18.0+
- TypeScript 5.0+

### Install Package

```bash
# Using npm
npm install ng2-pdfjs-viewer --save

# Using yarn
yarn add ng2-pdfjs-viewer

# Using pnpm
pnpm add ng2-pdfjs-viewer
```

### Configure Assets

Add PDF.js assets to your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/ng2-pdfjs-viewer/pdfjs",
                "output": "/assets/pdfjs"
              }
            ]
          }
        }
      }
    }
  }
}
```

---

## 🎯 Basic Usage

### Simple PDF Viewer

```html
<ng2-pdfjs-viewer pdfSrc="assets/document.pdf" [showSpinner]="true">
</ng2-pdfjs-viewer>
```

### Advanced Configuration

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/document.pdf"
  [theme]="'dark'"
  [primaryColor]="'#007acc'"
  [showSpinner]="true"
  [customSpinnerTpl]="customSpinner"
  [customErrorTpl]="customError"
  (onDocumentLoad)="onDocumentLoaded($event)"
  (onPageChange)="onPageChanged($event)"
>
</ng2-pdfjs-viewer>
```

### Programmatic Control

```typescript
import { Component, ViewChild } from "@angular/core";
import { PdfJsViewerComponent } from "ng2-pdfjs-viewer";

@Component({
  template: `
    <ng2-pdfjs-viewer #pdfViewer pdfSrc="document.pdf"></ng2-pdfjs-viewer>
    <button (click)="goToPage(5)">Go to Page 5</button>
  `,
})
export class MyComponent {
  @ViewChild("pdfViewer") pdfViewer!: PdfJsViewerComponent;

  async goToPage(page: number) {
    await this.pdfViewer.goToPage(page);
  }
}
```

---

## ⚙️ Advanced Configuration

### Theme Customization

```typescript
// Component
export class MyComponent {
  themeConfig = {
    theme: "light",
    primaryColor: "#007acc",
    backgroundColor: "#ffffff",
    toolbarColor: "#f5f5f5",
    textColor: "#333333",
    borderRadius: "8px",
  };
}
```

```html
<!-- Template -->
<ng2-pdfjs-viewer [themeConfig]="themeConfig" [customCSS]="customStyles">
</ng2-pdfjs-viewer>
```

### Custom Loading Spinner

```html
<ng-template #customSpinner>
  <div class="custom-spinner">
    <div class="spinner"></div>
    <p>Loading PDF...</p>
  </div>
</ng-template>

<ng2-pdfjs-viewer
  [customSpinnerTpl]="customSpinner"
  [spinnerClass]="'my-spinner'"
>
</ng2-pdfjs-viewer>
```

### Custom Error Display

```html
<ng-template #customError>
  <div class="error-container">
    <mat-icon>error</mat-icon>
    <h3>Failed to Load PDF</h3>
    <p>Please check your internet connection and try again.</p>
    <button mat-button (click)="retry()">Retry</button>
  </div>
</ng-template>

<ng2-pdfjs-viewer [customErrorTpl]="customError" [errorClass]="'my-error'">
</ng2-pdfjs-viewer>
```

---

## 📚 API Reference

### Input Properties

| Property                     | Type                                      | Default      | Description                           |
| ---------------------------- | ----------------------------------------- | ------------ | ------------------------------------- |
| `pdfSrc`                     | `string \| Blob \| Uint8Array`            | -            | PDF source (URL, Blob, or byte array) |
| `viewerId`                   | `string`                                  | auto         | Unique viewer identifier              |
| `viewerFolder`               | `string`                                  | `'assets'`   | Path to PDF.js assets                 |
| `externalWindow`             | `boolean`                                 | `false`      | Open in new window                    |
| `externalWindowOptions`      | `string`                                  | -            | External window options               |
| `target`                     | `string`                                  | `'_blank'`   | Target for external window            |
| `theme`                      | `'light' \| 'dark' \| 'auto'`             | `'light'`    | Theme selection                       |
| `primaryColor`               | `string`                                  | `'#007acc'`  | Primary color for UI elements         |
| `backgroundColor`            | `string`                                  | `'#ffffff'`  | Background color                      |
| `pageBorderColor`            | `string`                                  | -            | Page border color                     |
| `toolbarColor`               | `string`                                  | -            | Toolbar background color              |
| `textColor`                  | `string`                                  | -            | Text color                            |
| `borderRadius`               | `string`                                  | -            | Border radius                         |
| `customCSS`                  | `string`                                  | -            | Custom CSS styles                     |
| `showSpinner`                | `boolean`                                 | `true`       | Show loading spinner                  |
| `customSpinnerTpl`           | `TemplateRef`                             | -            | Custom spinner template               |
| `spinnerClass`               | `string`                                  | -            | Custom spinner CSS class              |
| `customErrorTpl`             | `TemplateRef`                             | -            | Custom error template                 |
| `errorClass`                 | `string`                                  | -            | Custom error CSS class                |
| `errorOverride`              | `boolean`                                 | `false`      | Override default error handling       |
| `errorAppend`                | `boolean`                                 | `true`       | Append to default error messages      |
| `errorMessage`               | `string`                                  | -            | Custom error message                  |
| `locale`                     | `string`                                  | `'en-US'`    | UI language                           |
| `useOnlyCssZoom`             | `boolean`                                 | `false`      | Use CSS-based zoom for mobile         |
| `diagnosticLogs`             | `boolean`                                 | `false`      | Enable diagnostic logging             |
| `zoom`                       | `string`                                  | `'auto'`     | Initial zoom level (two-way binding)  |
| `page`                       | `number`                                  | `1`          | Initial page number                   |
| `namedDest`                  | `string`                                  | -            | Named destination to navigate to      |
| `cursor`                     | `string`                                  | `'select'`   | Cursor type (two-way binding)         |
| `scroll`                     | `string`                                  | `'vertical'` | Scroll mode (two-way binding)         |
| `spread`                     | `string`                                  | `'none'`     | Spread mode (two-way binding)         |
| `pageMode`                   | `string`                                  | `'none'`     | Page mode (two-way binding)           |
| `rotation`                   | `number`                                  | `0`          | Document rotation (two-way binding)   |
| `showOpenFile`               | `boolean`                                 | `true`       | Show open file button                 |
| `showDownload`               | `boolean`                                 | `true`       | Show download button                  |
| `showPrint`                  | `boolean`                                 | `true`       | Show print button                     |
| `showFind`                   | `boolean`                                 | `true`       | Show search button                    |
| `showFullScreen`             | `boolean`                                 | `true`       | Show fullscreen button                |
| `showViewBookmark`           | `boolean`                                 | `true`       | Show bookmark button                  |
| `showAnnotations`            | `boolean`                                 | `false`      | Show annotations                      |
| `showToolbarLeft`            | `boolean`                                 | `true`       | Show left toolbar section             |
| `showToolbarMiddle`          | `boolean`                                 | `true`       | Show middle toolbar section           |
| `showToolbarRight`           | `boolean`                                 | `true`       | Show right toolbar section            |
| `showSecondaryToolbarToggle` | `boolean`                                 | `true`       | Show secondary toolbar toggle         |
| `showSidebar`                | `boolean`                                 | `true`       | Show sidebar                          |
| `showSidebarLeft`            | `boolean`                                 | `true`       | Show left sidebar                     |
| `showSidebarRight`           | `boolean`                                 | `true`       | Show right sidebar                    |
| `toolbarDensity`             | `'compact' \| 'default' \| 'comfortable'` | `'default'`  | Toolbar density                       |
| `sidebarWidth`               | `string`                                  | -            | Sidebar width (e.g., '280px')         |
| `toolbarPosition`            | `'top' \| 'bottom'`                       | `'top'`      | Toolbar position                      |
| `sidebarPosition`            | `'left' \| 'right'`                       | `'left'`     | Sidebar position                      |
| `responsiveBreakpoint`       | `string \| number`                        | -            | Responsive breakpoint                 |
| `downloadOnLoad`             | `boolean`                                 | `false`      | Auto-download on load                 |
| `printOnLoad`                | `boolean`                                 | `false`      | Auto-print on load                    |
| `rotateCW`                   | `boolean`                                 | `false`      | Rotate clockwise on load              |
| `rotateCCW`                  | `boolean`                                 | `false`      | Rotate counter-clockwise on load      |
| `showLastPageOnLoad`         | `boolean`                                 | `false`      | Go to last page on load               |
| `downloadFileName`           | `string`                                  | -            | Custom download filename              |
| `controlVisibility`          | `ControlVisibilityConfig`                 | -            | Control visibility configuration      |
| `autoActions`                | `AutoActionConfig`                        | -            | Auto actions configuration            |
| `errorHandling`              | `ErrorConfig`                             | -            | Error handling configuration          |
| `viewerConfig`               | `ViewerConfig`                            | -            | Viewer configuration                  |
| `themeConfig`                | `ThemeConfig`                             | -            | Theme configuration                   |
| `groupVisibility`            | `GroupVisibilityConfig`                   | -            | Group visibility configuration        |
| `layoutConfig`               | `LayoutConfig`                            | -            | Layout configuration                  |

### Output Events

| Event                       | Type                                       | Description                                    |
| --------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `onDocumentLoad`            | `EventEmitter<void>`                       | Fired when document loads                      |
| `onDocumentInit`            | `EventEmitter<void>`                       | Fired when document initializes                |
| `onDocumentError`           | `EventEmitter<DocumentError>`              | Fired when document fails to load              |
| `onPageChange`              | `EventEmitter<ChangedPage>`                | Fired when page changes                        |
| `onPagesInit`               | `EventEmitter<PagesInfo>`                  | Fired when pages are initialized               |
| `onPageRendered`            | `EventEmitter<PageRenderInfo>`             | Fired when a page is rendered                  |
| `onScaleChange`             | `EventEmitter<ChangedScale>`               | Fired when zoom/scale changes                  |
| `onRotationChange`          | `EventEmitter<ChangedRotation>`            | Fired when rotation changes                    |
| `onPresentationModeChanged` | `EventEmitter<PresentationMode>`           | Fired when presentation mode changes           |
| `onOpenFile`                | `EventEmitter<void>`                       | Fired when open file is clicked                |
| `onFind`                    | `EventEmitter<FindOperation>`              | Fired when search is performed                 |
| `onUpdateFindMatchesCount`  | `EventEmitter<FindMatchesCount>`           | Fired when search matches are updated          |
| `onMetadataLoaded`          | `EventEmitter<DocumentMetadata>`           | Fired when document metadata loads             |
| `onOutlineLoaded`           | `EventEmitter<DocumentOutline>`            | Fired when document outline loads              |
| `onAnnotationLayerRendered` | `EventEmitter<AnnotationLayerRenderEvent>` | Fired when annotation layer renders            |
| `onBookmarkClick`           | `EventEmitter<BookmarkClick>`              | Fired when bookmark is clicked                 |
| `onIdle`                    | `EventEmitter<void>`                       | Fired when viewer becomes idle                 |
| `onBeforePrint`             | `EventEmitter<void>`                       | Fired before printing                          |
| `onAfterPrint`              | `EventEmitter<void>`                       | Fired after printing                           |
| `zoomChange`                | `EventEmitter<string>`                     | Fired when zoom changes (two-way binding)      |
| `cursorChange`              | `EventEmitter<string>`                     | Fired when cursor changes (two-way binding)    |
| `scrollChange`              | `EventEmitter<string>`                     | Fired when scroll changes (two-way binding)    |
| `spreadChange`              | `EventEmitter<string>`                     | Fired when spread changes (two-way binding)    |
| `pageModeChange`            | `EventEmitter<string>`                     | Fired when page mode changes (two-way binding) |

### Methods

| Method                                                   | Parameters                                                  | Returns                                              | Description                       |
| -------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| `refresh()`                                              | -                                                           | `void`                                               | Refresh viewer                    |
| `goToPage(page: number)`                                 | `page: number`                                              | `Promise<ActionExecutionResult>`                     | Navigate to specific page         |
| `setPage(page: number)`                                  | `page: number`                                              | `Promise<ActionExecutionResult>`                     | Set current page                  |
| `setZoom(zoom: string)`                                  | `zoom: string`                                              | `Promise<ActionExecutionResult>`                     | Set zoom level                    |
| `setCursor(cursor: string)`                              | `cursor: 'select' \| 'hand' \| 'zoom'`                      | `Promise<ActionExecutionResult>`                     | Set cursor type                   |
| `setScroll(scroll: string)`                              | `scroll: 'vertical' \| 'horizontal' \| 'wrapped' \| 'page'` | `Promise<ActionExecutionResult>`                     | Set scroll mode                   |
| `setSpread(spread: string)`                              | `spread: 'none' \| 'odd' \| 'even'`                         | `Promise<ActionExecutionResult>`                     | Set spread mode                   |
| `setPageMode(mode: string)`                              | `mode: 'none' \| 'thumbs' \| 'bookmarks' \| 'attachments'`  | `Promise<ActionExecutionResult>`                     | Set page mode                     |
| `triggerDownload()`                                      | -                                                           | `Promise<ActionExecutionResult>`                     | Trigger download                  |
| `triggerPrint()`                                         | -                                                           | `Promise<ActionExecutionResult>`                     | Trigger print                     |
| `triggerRotation(direction: string)`                     | `direction: 'cw' \| 'ccw'`                                  | `Promise<ActionExecutionResult>`                     | Rotate document                   |
| `goToLastPage()`                                         | -                                                           | `Promise<ActionExecutionResult>`                     | Navigate to last page             |
| `sendViewerControlMessage(action: string, payload: any)` | `action: string, payload: any`                              | `Promise<any>`                                       | Send custom control message       |
| `getActionStatus(actionId: string)`                      | `actionId: string`                                          | `Promise<ActionExecutionResult \| null>`             | Get action status                 |
| `getQueueStatus()`                                       | -                                                           | `{ queuedActions: number; executedActions: number }` | Get queue status                  |
| `clearActionQueue()`                                     | -                                                           | `void`                                               | Clear action queue                |
| `reloadViewer()`                                         | -                                                           | `void`                                               | Reload viewer (alias for refresh) |
| `goBack()`                                               | -                                                           | `void`                                               | Go back in browser history        |
| `closeViewer()`                                          | -                                                           | `void`                                               | Close viewer window               |
| `getErrorTemplateData()`                                 | -                                                           | `any`                                                | Get error template data           |

---

## 🎨 Examples

### 1. Basic PDF Viewer

```html
<ng2-pdfjs-viewer pdfSrc="assets/sample.pdf" [showSpinner]="true">
</ng2-pdfjs-viewer>
```

### 2. Themed PDF Viewer

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [theme]="'dark'"
  [primaryColor]="'#ff6b6b'"
  [backgroundColor]="'#2c3e50'"
>
</ng2-pdfjs-viewer>
```

### 3. Custom Loading & Error

```html
<ng-template #loadingTemplate>
  <div class="loading">
    <mat-spinner></mat-spinner>
    <p>Loading your document...</p>
</div>
</ng-template>

<ng-template #errorTemplate>
  <div class="error">
    <mat-icon>error_outline</mat-icon>
    <h3>Oops! Something went wrong</h3>
    <p>We couldn't load your PDF. Please try again.</p>
    <button mat-button (click)="retry()">Retry</button>
</div>
</ng-template>

<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [customSpinnerTpl]="loadingTemplate"
  [customErrorTpl]="errorTemplate"
>
  </ng2-pdfjs-viewer>
```

### 4. Programmatic Control

```typescript
export class PdfController {
  @ViewChild("pdfViewer") pdfViewer!: PdfJsViewerComponent;

  async loadDocument(url: string) {
    this.pdfViewer.pdfSrc = url;
    await this.pdfViewer.refresh();
  }

  async goToPage(page: number) {
    await this.pdfViewer.goToPage(page);
  }

  async setZoom(zoom: string) {
    await this.pdfViewer.setZoom(zoom);
  }
}
```

---

## 🔄 Migration Guide

### From v19.x to v20.4.0

#### Breaking Changes

1. **PDF.js Upgrade**: Updated to v5.3.93 - some APIs may have changed
2. **Theme System**: New theme properties replace old styling options
3. **Error Handling**: Template-based error system replaces HTML strings

#### Migration Steps

1. **Update Dependencies**

   ```bash
   npm install ng2-pdfjs-viewer@latest
   ```

2. **Update Theme Configuration**

   ```typescript
   // Old way
   [customCSS] =
     // New way
     "'body { background: red; }'"[theme] =
     "'light'"[primaryColor] =
     "'#ff0000'"[backgroundColor] =
       "'#ffffff'";
   ```

3. **Update Error Handling**

   ```html
   <!-- Old way -->
   [errorHtml]="'
   <div>Custom error</div>
   '"

   <!-- New way -->
   <ng-template #errorTemplate>
     <div>Custom error</div>
   </ng-template>
   <ng2-pdfjs-viewer [customErrorTpl]="errorTemplate"></ng2-pdfjs-viewer>
   ```

---

## ⚠️ Deprecated Features

The following features are deprecated and will be removed in future versions:

### Deprecated Properties

| Deprecated        | Replacement          | Description                                   |
| ----------------- | -------------------- | --------------------------------------------- |
| `[startDownload]` | `[downloadOnLoad]`   | Download document automatically when it opens |
| `[startPrint]`    | `[printOnLoad]`      | Print document automatically when it opens    |
| `[errorHtml]`     | `[customErrorTpl]`   | Custom error HTML (use template instead)      |
| `[errorTemplate]` | `[customErrorTpl]`   | Custom error template (renamed)               |
| `[spinnerHtml]`   | `[customSpinnerTpl]` | Custom spinner HTML (use template instead)    |

### Deprecated Methods

| Deprecated         | Replacement              | Description                                    |
| ------------------ | ------------------------ | ---------------------------------------------- |
| `setErrorHtml()`   | Use `[customErrorTpl]`   | Set custom error HTML (use template instead)   |
| `setSpinnerHtml()` | Use `[customSpinnerTpl]` | Set custom spinner HTML (use template instead) |

### Migration Help

```typescript
// Deprecated
this.pdfViewer.setErrorHtml("<div>Error</div>");

// New way
// Use [customErrorTpl] with ng-template
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/intbot/ng2-pdfjs-viewer.git

# Install dependencies
npm install

# Run the sample app
npm run start

# Build the library
npm run build
```

### Reporting Issues

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 📚 **Documentation**: [GitHub Wiki](https://github.com/intbot/ng2-pdfjs-viewer/wiki)

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Mozilla PDF.js Team** - For the amazing PDF.js library
- **Angular Team** - For the excellent framework
- **Community Contributors** - For bug reports, feature requests, and contributions
- **7+ Million Users** - For trusting us with your PDF viewing needs

---

## 📞 Support

- 📖 **Documentation**: [GitHub Wiki](https://github.com/intbot/ng2-pdfjs-viewer/wiki)
- 💬 **Community**: [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 📧 **Email**: codehippie1@gmail.com

---

<div align="center">

**Made with ❤️ by the ng2-pdfjs-viewer team**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/intbot/ng2-pdfjs-viewer)
[![NPM](https://img.shields.io/badge/NPM-Package-red?logo=npm)](https://www.npmjs.com/package/ng2-pdfjs-viewer)
[![Angular](https://img.shields.io/badge/Angular-Component-green?logo=angular)](https://angular.dev/overview)

</div>
