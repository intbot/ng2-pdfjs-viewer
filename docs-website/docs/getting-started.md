# Getting Started

Get ng2-pdfjs-viewer up and running in your Angular application in just a few minutes.

## Prerequisites

- **Angular**: 20.0+ (recommended) | 10.0+ (supported)
- **Node.js**: 18.0+
- **TypeScript**: 5.0+

## Installation

### Step 1: Install the Package

```bash
npm install ng2-pdfjs-viewer --save
```

### Step 2: Import the Module

Add `PdfJsViewerModule` to your Angular module:

```typescript title="app.module.ts"
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    PdfJsViewerModule  // Add this line
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Step 3: Use in Your Component

```html title="app.component.html"
<ng2-pdfjs-viewer 
  pdfSrc="assets/sample.pdf" 
  [showSpinner]="true">
</ng2-pdfjs-viewer>
```

### Step 4: Add a PDF File

Place a PDF file in your `src/assets/` folder (e.g., `sample.pdf`).

## That's It! 🎉

Your PDF viewer is now ready to use. The component will automatically:

- Load and display your PDF
- Show a loading spinner while loading
- Handle errors gracefully
- Provide full PDF.js functionality

## Next Steps

### Basic Configuration

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [showSpinner]="true"
  [theme]="'light'"
  [showToolbar]="true"
  [showSidebar]="true">
</ng2-pdfjs-viewer>
```

### Event Handling

```typescript title="app.component.ts"
export class AppComponent {
  onDocumentLoad() {
    console.log('PDF loaded successfully!');
  }

  onDocumentError(error: any) {
    console.error('Failed to load PDF:', error);
  }
}
```

```html title="app.component.html"
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  (onDocumentLoad)="onDocumentLoad()"
  (onDocumentError)="onDocumentError($event)">
</ng2-pdfjs-viewer>
```

## Common Issues

### PDF Not Loading?

1. **Check the file path**: Ensure your PDF is in `src/assets/`
2. **Check browser console**: Look for any error messages
3. **Verify file size**: Large PDFs may take time to load
4. **CORS issues**: Ensure your server allows PDF access

### Build Errors?

1. **Clear Angular cache**: `rm -rf .angular/cache`
2. **Reinstall dependencies**: `npm install`
3. **Check Angular version**: Ensure compatibility

## What's Next?

- 🎨 [**Features Overview**](./features/overview) - Explore all available features
- 📚 [**Examples**](./examples/basic-usage) - See more code examples
- 🎨 [**Theming Guide**](./features/theming) - Customize appearance
- 📖 [**API Reference**](./api/component-inputs) - Complete API documentation

## Need Help?

- 🐛 [**Report Issues**](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 💬 [**Ask Questions**](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 🎯 [**Live Demo**](https://angular-pdf-viewer-demo.vercel.app/)
