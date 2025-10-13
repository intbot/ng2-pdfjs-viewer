# Installation

This guide covers different ways to install and set up ng2-pdfjs-viewer in your Angular project.

## NPM Installation (Recommended)

### Install the Package

```bash
npm install ng2-pdfjs-viewer --save
```

### Verify Installation

Check that the package is installed correctly:

```bash
npm list ng2-pdfjs-viewer
```

You should see output similar to:
```
your-app@1.0.0 /path/to/your-app
└── ng2-pdfjs-viewer@25.0.11
```

## Production Deployment

### Nginx Configuration

For production deployments using nginx, you may need to configure MIME types for PDF.js ES modules (`.mjs` files):

```nginx
# Add to your nginx.conf or site configuration
types {
    application/javascript  js mjs;
}
```

**Why this is needed**: PDF.js v5+ uses `.mjs` files (ES modules). Without proper MIME type configuration, nginx serves these files with incorrect content-type headers, causing the PDF viewer to crash during loading in production environments.

**Symptoms**: Everything works locally but the viewer gets stuck at the loading screen in production.

## Angular Version Compatibility

| Angular Version | Support Level | Notes |
|----------------|---------------|-------|
| **20.0+** | ✅ **Recommended** | Fully tested and optimized |
| **15.0 - 19.x** | ✅ **Supported** | Should work with minor testing |
| **10.0 - 14.x** | ✅ **Supported** | Compatible with testing |
| **2.0 - 9.x** | ⚠️ **Legacy** | May require additional testing |

:::note
While the library supports Angular 2.0+, it's primarily tested and optimized for Angular 20+. For production use with older versions, thorough testing is recommended.
:::

## Module Import

### Standard Import

```typescript title="app.module.ts"
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

@NgModule({
  imports: [
    BrowserModule,
    PdfJsViewerModule
  ],
  // ... rest of your module
})
export class AppModule { }
```

### Standalone Components (Angular 14+)

```typescript title="app.component.ts"
import { Component } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PdfJsViewerModule],
  template: `
    <ng2-pdfjs-viewer pdfSrc="assets/sample.pdf">
    </ng2-pdfjs-viewer>
  `
})
export class AppComponent { }
```

## Alternative Installation Methods

### Yarn

```bash
yarn add ng2-pdfjs-viewer
```

### PNPM

```bash
pnpm add ng2-pdfjs-viewer
```

## Development Setup

If you're contributing to the library or want to use the latest development version:

### Clone the Repository

```bash
git clone https://github.com/intbot/ng2-pdfjs-viewer.git
cd ng2-pdfjs-viewer
```

### Install Dependencies

```bash
npm install
```

### Build the Library

```bash
cd lib
npm run build
```

### Link for Local Development

```bash
# In the lib directory
npm link

# In your project directory
npm link ng2-pdfjs-viewer
```

## Troubleshooting Installation

### Common Issues

#### Peer Dependency Warnings

If you see peer dependency warnings:

```bash
npm install --legacy-peer-deps
```

#### Angular Version Conflicts

For older Angular versions, you might need to use the `--force` flag:

```bash
npm install ng2-pdfjs-viewer --force
```

#### TypeScript Errors

Ensure you're using a compatible TypeScript version:

```bash
npm install typescript@~5.0.0 --save-dev
```

### Clear Cache

If you encounter build issues:

```bash
# Clear npm cache
npm cache clean --force

# Clear Angular cache
rm -rf .angular/cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Verification

### Test Installation

Create a simple test to verify everything is working:

```typescript title="test.component.ts"
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <ng2-pdfjs-viewer 
      pdfSrc="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
      [showSpinner]="true">
    </ng2-pdfjs-viewer>
  `
})
export class TestComponent { }
```

### Check Browser Console

Open your browser's developer tools and check for:
- ✅ No error messages
- ✅ PDF loads successfully
- ✅ All resources load correctly

## Next Steps

Once installation is complete:

1. 🚀 [**Getting Started**](./getting-started) - Basic usage
2. 📚 [**Examples**](./examples/basic-usage) - Code examples
3. ⚙️ [**Configuration**](./features/overview) - Customization options
4. 📖 [**API Reference**](./api/component-inputs) - Complete API

## Need Help?

- 🐛 [**Installation Issues**](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 💬 [**Community Support**](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 📚 [**Documentation**](./intro) - Full documentation
