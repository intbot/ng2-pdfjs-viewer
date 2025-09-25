# External Window Features

ng2-pdfjs-viewer supports opening PDFs in external windows or tabs, providing a dedicated viewing experience separate from your main application.

## 🪟 Basic External Window

### Simple External Window

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [externalWindow]="true">
</ng2-pdfjs-viewer>
```

This opens the PDF in a new tab/window with default settings.

## ⚙️ Window Configuration

### Custom Window Options

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [externalWindow]="true"
  [externalWindowOptions]="'width=1200,height=800,scrollbars=yes,resizable=yes'">
</ng2-pdfjs-viewer>
```

### Available Window Options

| Option | Description | Example |
|--------|-------------|---------|
| `width` | Window width in pixels | `width=1200` |
| `height` | Window height in pixels | `height=800` |
| `left` | Window position from left | `left=100` |
| `top` | Window position from top | `top=100` |
| `scrollbars` | Show scrollbars | `scrollbars=yes` |
| `resizable` | Allow window resizing | `resizable=yes` |
| `toolbar` | Show browser toolbar | `toolbar=no` |
| `menubar` | Show browser menubar | `menubar=no` |
| `location` | Show address bar | `location=no` |
| `status` | Show status bar | `status=no` |

### Complete Example

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [externalWindow]="true"
  [externalWindowOptions]="'width=1200,height=800,left=100,top=100,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'">
</ng2-pdfjs-viewer>
```

## 🔄 Tab Reuse Behavior

### How Tab Reuse Works

The library intelligently manages external windows to provide a better user experience:

1. **First Click**: Opens a new window/tab
2. **Subsequent Clicks**: Reuses the existing window/tab
3. **Window Closed**: Next click opens a new window/tab

### Controlling Tab Reuse

#### Default Behavior (Reuse Same Tab)

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [externalWindow]="true"
  [target]="_blank">
</ng2-pdfjs-viewer>
```

#### Always Open New Tab

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [externalWindow]="true"
  [target]="'pdf-viewer-' + Date.now()">
</ng2-pdfjs-viewer>
```

#### Named Target (Reuse if Same Name)

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [externalWindow]="true"
  [target]="'my-pdf-viewer'">
</ng2-pdfjs-viewer>
```

### Target Name Behavior

| Target Value | Behavior |
|--------------|----------|
| `_blank` | Browser decides (usually reuses) |
| `_self` | Opens in same window |
| `_parent` | Opens in parent window |
| `_top` | Opens in top-level window |
| `unique-name` | Reuses if same name, new if different |
| `dynamic-name` | Always opens new (e.g., `'pdf-' + Date.now()`) |

## 🎯 Programmatic Control

### Opening External Window Programmatically

```typescript
import { Component, ViewChild } from '@angular/core';
import { PdfJsViewerComponent } from 'ng2-pdfjs-viewer';

@Component({
  template: `
    <ng2-pdfjs-viewer #pdfViewer pdfSrc="document.pdf"></ng2-pdfjs-viewer>
    <button (click)="openInNewWindow()">Open in New Window</button>
  `
})
export class MyComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;

  openInNewWindow() {
    // Enable external window mode
    this.pdfViewer.externalWindow = true;
    this.pdfViewer.externalWindowOptions = 'width=1200,height=800';
    this.pdfViewer.target = 'my-pdf-viewer';
    
    // Trigger PDF load
    this.pdfViewer.loadPdf();
  }
}
```

### Dynamic Window Configuration

```typescript
export class MyComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;

  openCustomWindow() {
    const windowOptions = [
      'width=1200',
      'height=800',
      'left=' + (screen.width - 1200) / 2,
      'top=' + (screen.height - 800) / 2,
      'scrollbars=yes',
      'resizable=yes',
      'toolbar=no',
      'menubar=no'
    ].join(',');

    this.pdfViewer.externalWindow = true;
    this.pdfViewer.externalWindowOptions = windowOptions;
    this.pdfViewer.target = 'pdf-viewer-' + Date.now();
  }
}
```

## 🔧 Advanced Configuration

### Multiple PDF Viewers

```html
<!-- Different targets for different viewers -->
<ng2-pdfjs-viewer 
  pdfSrc="document1.pdf"
  [externalWindow]="true"
  [target]="'viewer-1'">
</ng2-pdfjs-viewer>

<ng2-pdfjs-viewer 
  pdfSrc="document2.pdf"
  [externalWindow]="true"
  [target]="'viewer-2'">
</ng2-pdfjs-viewer>
```

### Conditional External Window

```typescript
export class MyComponent {
  useExternalWindow = false;

  toggleWindowMode() {
    this.useExternalWindow = !this.useExternalWindow;
  }
}
```

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  [externalWindow]="useExternalWindow"
  [externalWindowOptions]="useExternalWindow ? 'width=1200,height=800' : ''">
</ng2-pdfjs-viewer>
```

## 🚨 Common Issues

### Pop-up Blockers

If external windows don't open, check for pop-up blockers:

```typescript
// Check if pop-up was blocked
if (this.viewerTab === null) {
  console.error('Pop-up blocked. Please allow pop-ups for this site.');
}
```

### Window Focus

```typescript
// Focus the external window
if (this.viewerTab && !this.viewerTab.closed) {
  this.viewerTab.focus();
}
```

### Window State Monitoring

```typescript
// Monitor window state
setInterval(() => {
  if (this.viewerTab && this.viewerTab.closed) {
    console.log('External window was closed');
    // Handle window close event
  }
}, 1000);
```

## 📱 Mobile Considerations

### Mobile External Window Behavior

On mobile devices, external windows behave differently:

- **iOS Safari**: Opens in new tab (not popup)
- **Android Chrome**: May open in new tab or popup
- **Mobile Apps**: Behavior depends on WebView implementation

### Responsive Window Sizing

```typescript
getWindowOptions(): string {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    return 'width=' + window.innerWidth + ',height=' + window.innerHeight;
  } else {
    return 'width=1200,height=800,left=100,top=100';
  }
}
```

## 🔍 Debugging

### Enable Diagnostic Logs

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  [externalWindow]="true"
  [diagnosticLogs]="true">
</ng2-pdfjs-viewer>
```

### Check Window State

```typescript
// Debug window state
console.log('Window exists:', typeof this.viewerTab !== 'undefined');
console.log('Window closed:', this.viewerTab?.closed);
console.log('Window location:', this.viewerTab?.location?.href);
```

## 📋 API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `externalWindow` | `boolean` | `false` | Enable external window mode |
| `externalWindowOptions` | `string` | `undefined` | Window features string |
| `target` | `string` | `'_blank'` | Target name for window |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `viewerTab` | `Window` | Reference to external window |

### Methods

| Method | Description |
|--------|-------------|
| `setupExternalWindow()` | Initialize external window |
| `navigateToViewer(url)` | Navigate external window to URL |
