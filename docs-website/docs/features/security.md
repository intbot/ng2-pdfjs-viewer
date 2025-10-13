# Security Features

ng2-pdfjs-viewer v25.x includes built-in security features to protect against common vulnerabilities in PDF viewer applications.

## 🔒 URL Validation

### Overview

The URL validation feature prevents unauthorized file parameter manipulation in external viewer mode. This addresses security concerns where users might modify the `file` parameter in the viewer URL to access arbitrary documents.

### How It Works

1. **Initial Load**: The component stores the original file URL when the viewer first loads
2. **Validation**: On subsequent page loads or URL changes, it compares the current file parameter with the stored original
3. **Protection**: If the URLs don't match, a security warning is triggered

### Basic Usage

```html
<!-- URL validation enabled by default -->
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [urlValidation]="true">
</ng2-pdfjs-viewer>
```

### Disable URL Validation

```html
<!-- Disable URL validation if needed -->
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [urlValidation]="false">
</ng2-pdfjs-viewer>
```

## 🎨 Custom Security Templates

### Overview

When URL manipulation is detected, you can display custom security warnings using Angular templates instead of default browser alerts.

### Basic Security Template

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/document.pdf"
  [urlValidation]="true"
  [customSecurityTpl]="securityTemplate">
</ng2-pdfjs-viewer>

<ng-template #securityTemplate let-warning="securityWarning">
  <div class="alert alert-warning" *ngIf="warning">
    <h4>⚠️ Security Warning</h4>
    <p>{{ warning.message }}</p>
    <p><strong>Original URL:</strong> {{ warning.originalUrl }}</p>
    <p><strong>Current URL:</strong> {{ warning.currentUrl }}</p>
    <button (click)="pdfViewer.dismissSecurityWarning()" class="btn btn-primary">
      Dismiss
    </button>
  </div>
</ng-template>
```

### Advanced Security Template

```html
<ng-template #advancedSecurityTemplate let-warning="securityWarning">
  <div class="security-overlay" *ngIf="warning">
    <div class="security-modal">
      <div class="security-header">
        <i class="fas fa-shield-alt"></i>
        <h3>Security Alert</h3>
      </div>
      <div class="security-body">
        <p>{{ warning.message }}</p>
        <div class="url-comparison">
          <div class="url-item">
            <label>Original:</label>
            <code>{{ warning.originalUrl }}</code>
          </div>
          <div class="url-item">
            <label>Current:</label>
            <code>{{ warning.currentUrl }}</code>
          </div>
        </div>
      </div>
      <div class="security-footer">
        <button (click)="pdfViewer.dismissSecurityWarning()" class="btn btn-secondary">
          Continue Anyway
        </button>
        <button (click)="reloadOriginalDocument()" class="btn btn-primary">
          Reload Original
        </button>
      </div>
    </div>
  </div>
</ng-template>
```

## 🔧 Programmatic Control

### Enable/Disable URL Validation

```typescript
import { Component, ViewChild } from '@angular/core';
import { PdfJsViewerComponent } from 'ng2-pdfjs-viewer';

@Component({
  template: `
    <ng2-pdfjs-viewer #pdfViewer pdfSrc="document.pdf"></ng2-pdfjs-viewer>
    <button (click)="toggleSecurity()">Toggle Security</button>
  `
})
export class MyComponent {
  @ViewChild('pdfViewer') pdfViewer!: PdfJsViewerComponent;

  async toggleSecurity() {
    // Toggle URL validation
    await this.pdfViewer.setUrlValidation(false);
  }
}
```

### Handle Security Warnings

```typescript
export class MyComponent {
  securityWarning: any = null;

  onSecurityWarning(warning: any) {
    this.securityWarning = warning;
    // Log to security monitoring system
    console.warn('Security violation detected:', warning);
  }

  dismissWarning() {
    this.pdfViewer.dismissSecurityWarning();
    this.securityWarning = null;
  }
}
```

## 🛡️ Security Best Practices

### 1. Enable URL Validation

Always enable URL validation for external viewer mode:

```html
<ng2-pdfjs-viewer 
  [externalWindow]="true"
  [urlValidation]="true">
</ng2-pdfjs-viewer>
```

### 2. Use Custom Templates

Provide user-friendly security warnings instead of relying on browser alerts:

```html
<ng2-pdfjs-viewer 
  [customSecurityTpl]="securityTemplate">
</ng2-pdfjs-viewer>
```

### 3. Monitor Security Events

Log security violations for monitoring and analysis:

```typescript
onSecurityWarning(warning: any) {
  // Send to security monitoring service
  this.securityService.logViolation(warning);
}
```

### 4. Validate File Sources

Always validate PDF sources on the server side:

```typescript
// Server-side validation
if (!isValidPdfSource(requestedFile)) {
  throw new Error('Invalid PDF source');
}
```

## 🔍 Debugging Security Issues

### Console Warnings

When URL validation fails, check the browser console for warnings:

```
🚨 Security Warning: Unauthorized file access detected. The file URL has been tampered with.
```

### Security Warning Data

The security warning object contains:

```typescript
interface SecurityWarning {
  message: string;        // Human-readable warning message
  originalUrl: string;    // The original file URL
  currentUrl: string;     // The current (modified) file URL
}
```

## 📋 API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `urlValidation` | `boolean` | `true` | Enable/disable URL validation |
| `customSecurityTpl` | `TemplateRef<any>` | `undefined` | Custom security warning template |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `setUrlValidation(enabled: boolean)` | `Promise<ActionExecutionResult>` | Enable/disable URL validation |
| `dismissSecurityWarning()` | `void` | Dismiss the current security warning |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `securityWarning` | `SecurityWarning \| null` | Current security warning data |

## 🚨 Security Considerations

### What URL Validation Protects Against

- ✅ **File Parameter Manipulation** - Prevents users from changing the `file` parameter
- ✅ **Unauthorized Document Access** - Blocks access to documents not intended for the user
- ✅ **Phishing Attacks** - Prevents malicious URLs from being loaded

### What URL Validation Doesn't Protect Against

- ❌ **Server-Side Vulnerabilities** - Always validate file access on the server
- ❌ **XSS Attacks** - Use proper Angular sanitization
- ❌ **CSRF Attacks** - Implement proper CSRF protection
- ❌ **File Content Validation** - Validate PDF content separately

### Additional Security Measures

1. **Server-Side Validation** - Always validate file access permissions
2. **Content Security Policy** - Implement CSP headers (viewer is CSP-compliant)
3. **HTTPS Only** - Use HTTPS in production
4. **File Type Validation** - Validate PDF files on upload
5. **Access Control** - Implement proper user authentication and authorization

## 🔐 Content Security Policy (CSP) Compliance

### Overview

ng2-pdfjs-viewer is fully compliant with strict Content Security Policy (`style-src 'self'`). All styling is implemented using CSP-safe methods.

### CSP Compliance Features

- ✅ **External Stylesheets** - All static styles loaded from external CSS files
- ✅ **CSS Custom Properties** - Dynamic styling via `element.style.setProperty()`
- ✅ **CSS Classes** - Visibility and layout via class toggles
- ✅ **Optional Nonce Support** - For `customCSS` with strict CSP

### Using with Strict CSP

The viewer works out-of-the-box with strict CSP policies:

```html
<!-- Your index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self'; 
               script-src 'self';">

<!-- Viewer works without modifications -->
<ng2-pdfjs-viewer pdfSrc="document.pdf"></ng2-pdfjs-viewer>
```

### Custom CSS with CSP

When using `customCSS` with strict CSP, provide a nonce:

```typescript
// Component
customCSS = '.page { box-shadow: 0 4px 8px rgba(0,0,0,0.2); }';
cspNonce = 'your-random-nonce'; // Must match CSP policy
```

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="style-src 'self' 'nonce-your-random-nonce';">

<!-- Template -->
<ng2-pdfjs-viewer
  [customCSS]="customCSS"
  [cspNonce]="cspNonce">
</ng2-pdfjs-viewer>
```

### CSP Best Practices

1. **Default Usage** - No nonce needed for standard theming
2. **Custom CSS** - Only provide nonce when using `customCSS`
3. **Server-Generated Nonce** - Generate unique nonce per request
4. **Test Thoroughly** - Verify zero CSP violations in console

:::tip
The viewer is CSP-compliant by default. You only need the `cspNonce` input when using `customCSS` with strict CSP policies.
:::
