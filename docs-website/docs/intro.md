# Welcome to ng2-pdfjs-viewer

Welcome to the comprehensive documentation for **ng2-pdfjs-viewer** - the most reliable and feature-rich Angular PDF viewer component powered by Mozilla's PDF.js.

## What's New 🎉

The latest release bundles Mozilla **PDF.js 6.x**, is built and verified on **Angular 22** (peer range stays `>=10`), and turns the viewer into a full editing surface:

- **Annotation editing & eSign**: highlight, text, draw, stamp + opt-in signature and comment editors — with `getAnnotations()`/`setAnnotations()` server round-trips and download-with-edits
- **Forms**: `[(formData)]` two-way AcroForm binding and programmatic field access
- **Programmatic search**, **page organization** (reorder/delete/extract/merge), **read aloud** with sentence highlighting
- **AI assistant (bring your own endpoint)**: built-in chat panel with clickable page citations — the library never calls any AI service on its own
- **Custom toolbar/sidebar/page-overlay templates**, **content protection + watermarks**, **authenticated loading** (`httpHeaders`/`withCredentials`), **true dark page rendering**

### 🚀 Architecture (v25.x rewrite)

- **Modern Architecture**: Built with modern Angular patterns (verified through Angular 22) and strict TypeScript
- **Event-Driven**: Pure event-based system with universal action dispatcher
- **Template-Based**: Use Angular templates for loading and error states
- **Mobile-First**: Responsive design optimized for all screen sizes
- **Production-Ready**: Comprehensive error handling and performance optimization

### 📈 Battle-Tested Reliability

- **Born in 2018** and still going strong
- **8.3+ million downloads** and growing
- **8+ years** of continuous development
- **Thousands** of applications powered worldwide

## Quick Links

- 🚀 [**Getting Started**](./getting-started) - Set up in 5 minutes
- 🎯 [**Live Demo**](https://angular-pdf-viewer-demo.vercel.app/) - See it in action
- 📚 [**Examples**](./examples/basic-usage) - Copy-paste code examples
- 🔄 [**Migration Guide**](./migration/overview) - Upgrade from v20.x
- 📖 [**API Reference**](./api/component-inputs) - Complete API documentation

## Installation

Get started quickly with npm:

```bash
npm install ng2-pdfjs-viewer --save
```

## Basic Usage

```typescript
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

@NgModule({
  imports: [PdfJsViewerModule],
})
export class AppModule {}
```

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/sample.pdf" 
  [showSpinner]="true">
</ng2-pdfjs-viewer>
```

The `pdfSrc` property accepts URLs (strings), Blob objects, or Uint8Array byte arrays.

That's it! Your PDF viewer is ready to use.

## Why the Rewrite?

The v25.x rewrite addresses key architectural challenges:

### Before (v20.x)
- Mixed event/polling patterns
- Defensive programming
- Limited customization
- Complex integration

### After (v25.x)
- Pure event-driven architecture
- Trust-based execution
- Template-based customization
- Simple, clean API

## Community & Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 📚 **Documentation**: You're reading it!
- 🎯 **Live Demo**: [Vercel Demo](https://angular-pdf-viewer-demo.vercel.app/)

Ready to get started? Head over to the [Getting Started](./getting-started) guide!