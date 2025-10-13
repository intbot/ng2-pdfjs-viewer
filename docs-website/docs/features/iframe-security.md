# iframe Security

ng2-pdfjs-viewer includes built-in iframe security features to protect your application from potential security vulnerabilities.

## 🔒 Security Overview

The library uses static iframe sandbox attributes to provide a secure environment for PDF viewing while maintaining full functionality. The sandbox configuration is fixed for security and Angular compliance.

### Built-in Security Configuration

```html
<ng2-pdfjs-viewer pdfSrc="document.pdf"></ng2-pdfjs-viewer>
```

**Static sandbox attributes (always enabled):**
- `allow-forms` - Enables PDF form functionality
- `allow-scripts` - Enables PDF.js JavaScript execution
- `allow-same-origin` - Enables loading PDF files and assets
- `allow-modals` - Enables PDF.js dialogs (print, download)

## 🛡️ Security Benefits

### XSS Prevention
- Prevents malicious scripts in PDFs from affecting the parent page
- Isolates PDF.js execution environment
- Blocks unauthorized access to parent window context

### CSP Compliance
- Meets Content Security Policy requirements
- Compatible with strict CSP headers
- Reduces security audit findings

### Data Protection
- Limits iframe access to parent window
- Prevents data exfiltration through PDFs
- Protects sensitive application data

### Enterprise Ready
- Suitable for corporate security environments
- Meets regulatory compliance requirements
- Integrates with security monitoring tools

## ⚙️ Configuration Options

### Basic Usage

```html
<!-- Built-in security (always enabled) -->
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf">
</ng2-pdfjs-viewer>
```

### iframe Border Customization

```html
<!-- Custom border styling -->
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  iframeBorder="2px solid #ccc">
</ng2-pdfjs-viewer>
```

> **Note**: Sandbox attributes are fixed for security and Angular compliance. Only border styling can be customized.

## 📋 Sandbox Attributes Reference

### Required Attributes

| Attribute | Purpose | Required For |
|-----------|---------|--------------|
| `allow-forms` | PDF form functionality | PDF form filling and submission |
| `allow-scripts` | JavaScript execution | PDF.js viewer functionality |
| `allow-same-origin` | Same-origin requests | Loading PDF files and assets |
| `allow-modals` | Dialog boxes | Print dialog, download confirmations |

### Optional Attributes

| Attribute | Purpose | Use Case |
|-----------|---------|----------|
| `allow-popups` | Open new windows | External window functionality |
| `allow-downloads` | Download files | PDF download functionality |
| `allow-top-navigation` | Navigate parent window | PDF navigation features |
| `allow-pointer-lock` | Pointer lock API | Advanced interaction features |

### Security Attributes

| Attribute | Purpose | Security Impact |
|-----------|---------|-----------------|
| `allow-same-origin` | Same-origin requests | Required for functionality |
| `allow-forms` | Form submission | Required for PDF forms |
| `allow-scripts` | JavaScript execution | Required for PDF.js |
| `allow-modals` | Dialog boxes | Required for user interactions |

## 🔧 Advanced Configuration

### Border Customization

```typescript
export class MyComponent {
  // Dynamic border configuration
  borderConfig = "0";
  
  // Update border based on theme
  updateBorder(theme: string) {
    switch (theme) {
      case 'dark':
        this.borderConfig = "1px solid #333";
        break;
      case 'light':
        this.borderConfig = "1px solid #ccc";
        break;
      case 'none':
        this.borderConfig = "0";
        break;
    }
  }
}
```

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  [iframeBorder]="borderConfig">
</ng2-pdfjs-viewer>
```

## 🧪 Testing Security Configuration

### Basic Functionality Test

```typescript
describe('iframe Security', () => {
  it('should load PDF with static sandbox', () => {
    const fixture = TestBed.createComponent(PdfViewerComponent);
    fixture.componentInstance.pdfSrc = 'test.pdf';
    fixture.detectChanges();
    
    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe.nativeElement.sandbox).toBe('allow-forms allow-scripts allow-same-origin allow-modals');
  });
  
  it('should allow custom border configuration', () => {
    const fixture = TestBed.createComponent(PdfViewerComponent);
    fixture.componentInstance.pdfSrc = 'test.pdf';
    fixture.componentInstance.iframeBorder = '2px solid #ccc';
    fixture.detectChanges();
    
    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe.nativeElement.style.border).toBe('2px solid #ccc');
  });
});
```

### Security Validation Test

```typescript
it('should prevent XSS attacks', () => {
  // Test that malicious scripts in PDFs cannot access parent window
  const maliciousPdf = createMaliciousPdf();
  // ... test implementation
});
```

## 🚨 Common Issues and Solutions

### Issue: PDF Forms Not Working

**Problem:** PDF forms are not interactive or submit buttons don't work.

**Solution:** Ensure `allow-forms` is included in sandbox attributes.

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  iframeSandbox="allow-forms allow-scripts allow-same-origin allow-modals">
</ng2-pdfjs-viewer>
```

### Issue: Download/Print Buttons Not Working

**Problem:** Download and print functionality is disabled.

**Solution:** Add `allow-modals` to sandbox attributes.

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  iframeSandbox="allow-forms allow-scripts allow-same-origin allow-modals">
</ng2-pdfjs-viewer>
```

### Issue: External Window Not Opening

**Problem:** "Open in new tab" button doesn't work.

**Solution:** Add `allow-popups` to sandbox attributes.

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  iframeSandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-popups">
</ng2-pdfjs-viewer>
```

### Issue: PDF Not Loading

**Problem:** PDF fails to load with sandbox enabled.

**Solution:** Ensure `allow-same-origin` is included for same-domain PDFs.

```html
<ng2-pdfjs-viewer 
  pdfSrc="document.pdf"
  iframeSandbox="allow-forms allow-scripts allow-same-origin allow-modals">
</ng2-pdfjs-viewer>
```

## 🔍 Security Best Practices

### 1. Use Default Configuration
- Start with the default sandbox attributes
- Only add additional permissions when needed
- Test thoroughly after any changes

### 2. Regular Security Audits
- Review sandbox configuration regularly
- Test with security scanning tools
- Monitor for security advisories

### 3. Principle of Least Privilege
- Only enable permissions that are actually needed
- Document why each permission is required
- Remove unused permissions

### 4. Environment-Specific Configuration
- Use stricter settings in production
- Relax settings only in development when needed
- Implement security policies consistently

### 5. Monitoring and Logging
- Monitor for security violations
- Log sandbox configuration changes
- Alert on unexpected behavior

## 📚 Related Documentation

- [Security Features Overview](./security) - Complete security guide
- [Component Inputs](../api/component-inputs) - All configuration options
- [Getting Started](../getting-started) - Quick setup guide
- [Examples](../examples/basic-usage) - Practical examples

## 🆘 Support

If you encounter security-related issues:

1. Check the [Common Issues](#-common-issues-and-solutions) section
2. Review your sandbox configuration
3. Test with minimal sandbox attributes
4. Open an issue on GitHub with details

Remember: Security is a shared responsibility. Always test your configuration and stay updated with security best practices.
