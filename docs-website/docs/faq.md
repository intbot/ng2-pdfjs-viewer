# Frequently Asked Questions (FAQ)

Common questions and answers about ng2-pdfjs-viewer. This FAQ is compiled from recurring GitHub issues and Stack Overflow questions.

## 🔐 Authentication & CORS

### How do I handle CORS issues with AWS S3 or external domains?

**Problem**: Getting CORS errors when loading PDFs from S3, CDN, or external domains.

**Solutions**:

1. **Server-side**: Configure CORS headers on your S3 bucket/server:
```xml
<!-- S3 CORS Configuration -->
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://your-domain.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

2. **Client-side**: Load PDF as Blob via your backend proxy:
```typescript
this.http.get(s3Url, { responseType: 'blob' }).subscribe(blob => {
  this.pdfViewer.pdfSrc = blob;
  this.pdfViewer.refresh();
});
```

**References**: [#9](https://github.com/intbot/ng2-pdfjs-viewer/issues/9), [Stack Overflow](https://stackoverflow.com/questions/72260393/signed-url-from-s3-to-display-pdf-in-angular-using-ng2-pdfjs-viewer)

---

### How do I add authentication headers (JWT, Bearer tokens)?

**Problem**: PDF endpoint requires Authorization header, but can't pass headers directly to `pdfSrc`.

**Solution**: Fetch PDF through your HTTP client, then pass Blob:

```typescript
export class MyComponent {
  downloadPdf() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
    
    this.http.get('https://api.example.com/pdf', { 
      headers, 
      responseType: 'blob' 
    }).subscribe(blob => {
      this.pdfViewer.pdfSrc = blob;
      this.pdfViewer.refresh();
    });
  }
}
```

**References**: [#121](https://github.com/intbot/ng2-pdfjs-viewer/issues/121), [#123](https://github.com/intbot/ng2-pdfjs-viewer/issues/123), [#94](https://github.com/intbot/ng2-pdfjs-viewer/issues/94)

---

### How do I enable fullscreen when viewer and PDF are from different domains?

**Problem**: Fullscreen doesn't work when using CDN for viewer files and different domain for PDF.

**Workaround**: Currently requires adding `allowfullscreen` attribute to iframe (feature request pending).

**References**: [#141](https://github.com/intbot/ng2-pdfjs-viewer/issues/141)

---

## 🎨 UI Customization

### How do I hide the toolbar completely?

**Problem**: Want to show only PDF content without any controls.

**Solution**: Use CSS to hide the toolbar:

```typescript
// Component
customCSS = `
  #toolbarContainer {
    display: none !important;
  }
  #viewerContainer {
    top: 0 !important;
  }
`;
```

```html
<ng2-pdfjs-viewer 
  [pdfSrc]="pdfSrc"
  [customCSS]="customCSS">
</ng2-pdfjs-viewer>
```

**Alternative**: Hide individual sections:
```html
<ng2-pdfjs-viewer 
  [openFile]="false"
  [download]="false"
  [print]="false"
  [viewBookmark]="false"
  [fullScreen]="false">
</ng2-pdfjs-viewer>
```

**References**: [#133](https://github.com/intbot/ng2-pdfjs-viewer/issues/133), [#89](https://github.com/intbot/ng2-pdfjs-viewer/issues/89)

---

### How do I remove iframe border or make PDF full width?

**Solution 1** - Remove border:
```css
/* Global styles.css */
ng2-pdfjs-viewer iframe {
  border: none !important;
}
```

**Solution 2** - Full width:
```typescript
customCSS = `
  #mainContainer {
    min-width: unset !important;
  }
  .page {
    max-width: 100% !important;
  }
`;
```

**References**: [#116](https://github.com/intbot/ng2-pdfjs-viewer/issues/116), [#132](https://github.com/intbot/ng2-pdfjs-viewer/issues/132), [#136](https://github.com/intbot/ng2-pdfjs-viewer/issues/136)

---

### How do I prevent sidebar from opening/flickering randomly?

**Problem**: Sidebar sometimes opens automatically or flickers on load.

**Solution**: Control sidebar in `onDocumentLoad`:
```typescript
loadComplete() {
  this.pdfViewer.PDFViewerApplication.pdfSidebar.close();
}
```

```html
<ng2-pdfjs-viewer 
  (onDocumentLoad)="loadComplete()"
  viewerId="myViewer">
</ng2-pdfjs-viewer>
```

**References**: [#166](https://github.com/intbot/ng2-pdfjs-viewer/issues/166)

---

### How do I enable hand tool by default?

**Solution**:
```typescript
loadComplete() {
  const app = this.pdfViewer.PDFViewerApplication;
  app.pdfCursorTools.switchTool(1); // 0 = text selection, 1 = hand tool
}
```

**References**: [#163](https://github.com/intbot/ng2-pdfjs-viewer/issues/163)

---

## 🔄 Lifecycle & Initialization

### Why doesn't onDocumentLoad fire when viewer is hidden?

**Problem**: Using `*ngIf` or `[hidden]` prevents events from firing.

**Solutions**:

1. **Use visibility instead of display:none**:
```html
<div [style.visibility]="isLoading ? 'hidden' : 'visible'">
  <ng2-pdfjs-viewer (onDocumentLoad)="loadComplete()"></ng2-pdfjs-viewer>
</div>
```

2. **Use opacity**:
```html
<div [style.opacity]="isLoading ? 0 : 1">
  <ng2-pdfjs-viewer (onDocumentLoad)="loadComplete()"></ng2-pdfjs-viewer>
</div>
```

3. **Keep viewer mounted, hide with CSS**:
```css
.hidden-viewer {
  position: absolute;
  left: -9999px;
  visibility: hidden;
}
```

**Why**: iframe needs to be in DOM and visible for postMessage to work.

**References**: [#167](https://github.com/intbot/ng2-pdfjs-viewer/issues/167), [Stack Overflow](https://stackoverflow.com/questions/70925900/angular-ng2-pdfjs-viewer-not-getting-initialized-when-used-within-ngif-div)

---

### How do I display an empty viewer when no file is provided?

**Solution**: Always provide a valid `pdfSrc` or conditionally render:

```typescript
export class MyComponent {
  pdfSrc: string | Blob | null = null;
  showViewer = false;
  
  loadPdf(url: string) {
    this.pdfSrc = url;
    this.showViewer = true;
  }
}
```

```html
<ng2-pdfjs-viewer 
  *ngIf="showViewer && pdfSrc"
  [pdfSrc]="pdfSrc">
</ng2-pdfjs-viewer>
```

**References**: [Stack Overflow](https://stackoverflow.com/questions/58136515/how-to-display-empty-ng2-pdfjs-viewer-when-no-file-provided)

---

### How do I clear/reset the viewer or load a new PDF?

**Solution**: Update `pdfSrc` and call `refresh()`:

```typescript
loadNewPdf(newUrl: string) {
  this.pdfViewer.pdfSrc = newUrl;
  this.pdfViewer.refresh();
}

clearViewer() {
  this.pdfViewer.pdfSrc = null;
  // Or hide the component
  this.showViewer = false;
}
```

**References**: [#90](https://github.com/intbot/ng2-pdfjs-viewer/issues/90)

---

## 📱 Mobile & Print

### Why don't Print and Download work on mobile devices?

**Problem**: Print/Download buttons don't work on iPhone, iPad, or Android.

**Cause**: Browser limitations on mobile devices restrict iframe print/download functionality.

**Workarounds**:

1. **Download**: Use native download via anchor tag:
```typescript
downloadPdf() {
  const link = document.createElement('a');
  link.href = this.pdfUrl;
  link.download = 'document.pdf';
  link.click();
}
```

2. **Print**: Open in new window:
```html
<ng2-pdfjs-viewer [externalWindow]="true"></ng2-pdfjs-viewer>
```

**References**: [#177](https://github.com/intbot/ng2-pdfjs-viewer/issues/177)

---

### How do I improve print quality (resolution)?

**Problem**: Printed PDFs have low quality (150 DPI).

**Solution**: This is controlled by PDF.js rendering settings. For production, consider upgrading to PDF.js v3+ which has better print resolution defaults.

**Temporary workaround**: Modify `pdf.js` constant `PRINT_RESOLUTION` from 150 to 600 (not recommended for library users).

**References**: [#179](https://github.com/intbot/ng2-pdfjs-viewer/issues/179)

---

## 🎯 Advanced Features

### How do I trigger download from an external button?

**Problem**: Want custom download button without reload.

**Solution**: Access PDFViewerApplication directly:

```typescript
@ViewChild('pdfViewer') pdfViewer: PdfJsViewerComponent;

downloadPdf() {
  this.pdfViewer.PDFViewerApplication.download();
}
```

```html
<button (click)="downloadPdf()">Download</button>
<ng2-pdfjs-viewer 
  #pdfViewer
  [download]="false"
  viewerId="myViewer">
</ng2-pdfjs-viewer>
```

**References**: [#103](https://github.com/intbot/ng2-pdfjs-viewer/issues/103)

---

### How do I capture click or mouse events on the PDF?

**Solution**: Access canvas elements after document loads:

```typescript
loadComplete() {
  const pages = this.pdfViewer.PDFViewerApplication.pdfViewer._pages;
  
  pages.forEach((page, index) => {
    page.canvas.addEventListener('click', (event) => {
      console.log(`Clicked on page ${index + 1}`, {
        x: event.offsetX,
        y: event.offsetY
      });
    });
  });
}
```

**Note**: Text layer sits above canvas by default. Disable it for better event handling:
```typescript
customCSS = `.textLayer { pointer-events: none; }`;
```

**References**: [#107](https://github.com/intbot/ng2-pdfjs-viewer/issues/107), [#153](https://github.com/intbot/ng2-pdfjs-viewer/issues/153), [#128](https://github.com/intbot/ng2-pdfjs-viewer/issues/128)

---

### How do I search content and navigate to results?

**Solution**: Use PDFViewerApplication's findController:

```typescript
searchPdf(query: string) {
  const app = this.pdfViewer.PDFViewerApplication;
  app.findController.executeCommand('find', {
    query: query,
    highlightAll: true,
    caseSensitive: false
  });
}

findNext() {
  this.pdfViewer.PDFViewerApplication.findController.executeCommand('findagain', {
    query: this.lastQuery,
    findPrevious: false
  });
}
```

**References**: [#113](https://github.com/intbot/ng2-pdfjs-viewer/issues/113)

---

### How do I remember the last page viewed (bookmarks)?

**Solution**: Listen to page changes and store in localStorage:

```typescript
loadComplete() {
  const app = this.pdfViewer.PDFViewerApplication;
  
  // Restore last page
  const lastPage = localStorage.getItem('pdf_last_page');
  if (lastPage) {
    app.page = parseInt(lastPage);
  }
  
  // Track page changes
  app.eventBus.on('pagechanging', (e) => {
    localStorage.setItem('pdf_last_page', e.pageNumber);
  });
}
```

**References**: [#138](https://github.com/intbot/ng2-pdfjs-viewer/issues/138)

---

### How do I open multiple PDFs side-by-side in new windows?

**Problem**: `externalWindow` reuses the same tab.

**Solution**: Use unique `viewerId` for each instance:

```html
<!-- First PDF -->
<ng2-pdfjs-viewer 
  [pdfSrc]="pdf1"
  [externalWindow]="true"
  viewerId="viewer1">
</ng2-pdfjs-viewer>

<!-- Second PDF -->
<ng2-pdfjs-viewer 
  [pdfSrc]="pdf2"
  [externalWindow]="true"
  viewerId="viewer2">
</ng2-pdfjs-viewer>
```

**References**: [#174](https://github.com/intbot/ng2-pdfjs-viewer/issues/174)

---

### How do I load password-protected PDFs?

**Problem**: PDFs with password protection don't load.

**Current Status**: Not directly supported via component attribute.

**Workaround**: PDF.js will show native password prompt. To pre-populate password, you'd need to modify PDF.js source or handle via backend (decrypt/proxy).

**References**: [#165](https://github.com/intbot/ng2-pdfjs-viewer/issues/165)

---

### How do I add a watermark to the PDF?

**Solution**: Add watermark overlay using CSS:

```typescript
customCSS = `
  .page::after {
    content: "CONFIDENTIAL";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 72px;
    color: rgba(255, 0, 0, 0.2);
    pointer-events: none;
    z-index: 9999;
  }
`;
```

**Note**: This is visual only - doesn't modify the actual PDF file.

**References**: [#104](https://github.com/intbot/ng2-pdfjs-viewer/issues/104)

---

### How do I load PDFs offline or from IndexedDB (PWA)?

**Problem**: Loading Blob from IndexedDB fails offline on iOS Safari.

**Solution**: Ensure you load as Uint8Array instead of Blob:

```typescript
// IndexedDB retrieval
const pdfData = await db.getPdf(id); // Returns ArrayBuffer
const uint8Array = new Uint8Array(pdfData);

this.pdfViewer.pdfSrc = uint8Array;
this.pdfViewer.refresh();
```

**References**: [#129](https://github.com/intbot/ng2-pdfjs-viewer/issues/129)

---

## 🐛 Common Errors & Troubleshooting

### What is `viewerId` and when do I need it?

**Answer**: `viewerId` is required **only when using events** like `onDocumentLoad`, `onPageChange`, etc.

```html
<!-- ❌ Events won't work -->
<ng2-pdfjs-viewer 
  (onDocumentLoad)="loadComplete()">
</ng2-pdfjs-viewer>

<!-- ✅ Correct -->
<ng2-pdfjs-viewer 
  viewerId="myViewer"
  (onDocumentLoad)="loadComplete()">
</ng2-pdfjs-viewer>
```

**Why**: Events use postMessage between iframe and parent, requiring unique ID for routing.

**References**: [#134](https://github.com/intbot/ng2-pdfjs-viewer/issues/134)

---

### Error: "offsetParent is not set -- cannot scroll"

**Problem**: Console shows scroll error, PDF may not display properly.

**Cause**: Viewer rendered in hidden container or Bootstrap/Material components with `display: none`.

**Solution**:
```css
/* Don't use display: none, use visibility */
.pdf-container {
  visibility: visible; /* or hidden */
}

/* Ensure parent has layout */
.pdf-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
}
```

**References**: [#171](https://github.com/intbot/ng2-pdfjs-viewer/issues/171)

---

### Why does viewer scroll vertically on load randomly?

**Problem**: PDF sometimes loads scrolled down instead of at top.

**Cause**: Browser scroll position restored or PDF has internal open action.

**Solution**: Force scroll to top after load:
```typescript
loadComplete() {
  const container = this.pdfViewer.PDFViewerApplication.pdfViewer.container;
  container.scrollTop = 0;
}
```

**References**: [#95](https://github.com/intbot/ng2-pdfjs-viewer/issues/95)

---

### Why does `diagnosticLogs="false"` still show logs?

**Problem**: Console still shows "PDF.js: 2.2.171" messages.

**Cause**: Some logs are from PDF.js core, not controlled by the component.

**Workaround**: These are informational and safe to ignore in production builds.

**References**: [#97](https://github.com/intbot/ng2-pdfjs-viewer/issues/97)

---

## 📄 Document Loading

### Why does my Blob/Uint8Array not load or show wrong PDF?

**Problem**: Loading PDF from Blob shows TypeError or loads wrong document.

**Solution** (Fixed in latest version): Ensure you're loading in `ngAfterViewInit`:

```typescript
@ViewChild('pdfViewer') pdfViewer: PdfJsViewerComponent;

ngAfterViewInit() {
  this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
    this.pdfViewer.pdfSrc = blob;
    this.pdfViewer.refresh();
  });
}
```

**References**: [#283](https://github.com/intbot/ng2-pdfjs-viewer/issues/283)

---

### How do I load PDFs from Google Drive or redirect URLs?

**Problem**: Google Drive URLs return HTML redirect page instead of PDF.

**Solution**: Use direct download link format:
```typescript
// ❌ Wrong - Sharing link
const url = 'https://drive.google.com/file/d/FILE_ID/view';

// ✅ Correct - Direct download
const url = 'https://drive.google.com/uc?export=download&id=FILE_ID';
```

**Better**: Download via backend to avoid CORS:
```typescript
this.http.get('/api/proxy-drive-pdf?id=' + fileId, { 
  responseType: 'blob' 
}).subscribe(blob => {
  this.pdfViewer.pdfSrc = blob;
  this.pdfViewer.refresh();
});
```

**References**: [#175](https://github.com/intbot/ng2-pdfjs-viewer/issues/175)

---

## 🖨️ Print & Download

### How do I customize the download behavior or filename?

**Solution**: Intercept download and handle manually:

```typescript
@ViewChild('pdfViewer') pdfViewer: PdfJsViewerComponent;

customDownload() {
  const blob = new Blob([this.pdfData], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'my-custom-filename.pdf';
  link.click();
  URL.revokeObjectURL(link.href);
}
```

```html
<ng2-pdfjs-viewer 
  [download]="false"
  [pdfSrc]="pdfSrc">
</ng2-pdfjs-viewer>
<button (click)="customDownload()">Download PDF</button>
```

**References**: [#103](https://github.com/intbot/ng2-pdfjs-viewer/issues/103), [Stack Overflow](https://stackoverflow.com/questions/56381542/print-preview-using-pdfjs-and-angular-7)

---

## 🎨 Customization Examples

### How do I customize icons or toolbar buttons?

**Solution**: Use `customCSS` to override button icons:

```typescript
customCSS = `
  #print::before {
    content: url('data:image/svg+xml;base64,YOUR_ICON_BASE64');
  }
  
  /* Or use Font Awesome */
  #download::before {
    content: "\f019"; /* FontAwesome download icon */
    font-family: "Font Awesome 5 Free";
  }
`;
```

**References**: [Stack Overflow](https://stackoverflow.com/questions/71859564/cannot-customize-the-icons-using-ng2-pdfjs-viewer)

---

### How do I use custom Worker URL?

**Problem**: Need to use custom or CDN-hosted PDF worker.

**Solution**: Set before viewer initializes:

```typescript
ngOnInit() {
  // Must set before viewer loads
  (window as any).pdfWorkerSrc = '/path/to/custom-pdf.worker.js';
}
```

**References**: [#101](https://github.com/intbot/ng2-pdfjs-viewer/issues/101)

---

## 🔧 Configuration & Setup

### Can I change the PDFJS folder location?

**Yes**: Use `viewerFolder` attribute:

```html
<ng2-pdfjs-viewer 
  [viewerFolder]="'/custom-path/pdfjs'"
  [pdfSrc]="pdfSrc">
</ng2-pdfjs-viewer>
```

**Important**: Ensure path is in `angular.json` assets:
```json
{
  "assets": [
    { "glob": "**/*", "input": "custom-path/pdfjs", "output": "/custom-path/pdfjs" }
  ]
}
```

**References**: [#120](https://github.com/intbot/ng2-pdfjs-viewer/issues/120)

---

### How do I disable text layer or annotation layer?

**Solution**: Use CSS to hide layers:

```typescript
customCSS = `
  .textLayer {
    display: none !important;
  }
  
  .annotationLayer {
    display: none !important;
  }
`;
```

**Why**: Reduces memory usage and improves performance for large PDFs.

**References**: [#85](https://github.com/intbot/ng2-pdfjs-viewer/issues/85)

---

## 🌐 Cross-Browser & Production

### Why doesn't PDF load in production (Nginx/IIS) but works locally?

**Problem**: PDFs work in `ng serve` but fail in production with 404 or MIME type errors.

**Solution**: Configure MIME types for `.mjs` and `.ftl` files.

**Nginx**:
```nginx
http {
  types {
    application/javascript mjs;
    text/plain ftl;
  }
}
```

**IIS** (`web.config`):
```xml
<staticContent>
  <mimeMap fileExtension=".mjs" mimeType="application/javascript" />
  <mimeMap fileExtension=".ftl" mimeType="text/plain" />
</staticContent>
```

**References**: [#276](https://github.com/intbot/ng2-pdfjs-viewer/issues/276), [Installation Guide](./installation#production-deployment)

---

### Why doesn't fullscreen work in Firefox?

**Problem**: Fullscreen button doesn't appear or doesn't work in Firefox.

**Cause**: Browser-specific fullscreen API differences.

**Workaround**: Ensure `fullScreen` input is set and test with latest browser:
```html
<ng2-pdfjs-viewer [fullScreen]="true"></ng2-pdfjs-viewer>
```

**References**: [#111](https://github.com/intbot/ng2-pdfjs-viewer/issues/111)

---

## 📚 Additional Resources

### Still need help?

- 🐛 [Report Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 💬 [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 📖 [Full Documentation](./intro)
- 🎯 [Live Demo](https://angular-pdf-viewer-demo.vercel.app/)
- 📚 [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

---

### Common Stack Overflow Questions

- [Signed URL from S3](https://stackoverflow.com/questions/72260393/signed-url-from-s3-to-display-pdf-in-angular-using-ng2-pdfjs-viewer)
- [Cannot customize icons](https://stackoverflow.com/questions/71859564/cannot-customize-the-icons-using-ng2-pdfjs-viewer)
- [Viewer not initializing within ngIf](https://stackoverflow.com/questions/70925900/angular-ng2-pdfjs-viewer-not-getting-initialized-when-used-within-ngif-div)
- [IE11 unexpected server response](https://stackoverflow.com/questions/58292812/ng2-pdfjs-viewer-internet-explorer-11-unexpected-server-response-500-while-ret)
- [Display empty viewer](https://stackoverflow.com/questions/58136515/how-to-display-empty-ng2-pdfjs-viewer-when-no-file-provided)
- [Print preview](https://stackoverflow.com/questions/56381542/print-preview-using-pdfjs-and-angular-7)
- [Integrating PDFjs in Angular](https://stackoverflow.com/questions/54746448/integrating-pdfjs-in-angular)
