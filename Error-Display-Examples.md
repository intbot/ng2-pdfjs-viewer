# Error Display Customization Examples

This document provides comprehensive examples for customizing error displays in the ng2-pdfjs-viewer library using Angular templates. The library now uses a secure, template-based approach instead of custom HTML to avoid security issues and provide better maintainability.

## Table of Contents
- [Template-Based Error System](#template-based-error-system)
- [Built-in Error Templates](#built-in-error-templates)
- [Custom Template Integration](#custom-template-integration)
- [CSS Classes for Styling](#css-classes-for-styling)
- [Company Logo Integration](#company-logo-integration)
- [Usage Instructions](#usage-instructions)

---

## Template-Based Error System

The ng2-pdfjs-viewer library now uses Angular templates for error display instead of custom HTML. This approach provides better security, maintainability, and integration with Angular's change detection system.

### Key Benefits
- **Security**: No HTML sanitization warnings or XSS vulnerabilities
- **Maintainability**: Templates are easier to modify and debug
- **Performance**: Better integration with Angular's rendering system
- **Type Safety**: Full TypeScript support for template context

### Available Inputs
- `errorOverride`: Enable/disable custom error display
- `errorTemplate`: Select from built-in templates ('basic', 'corporate', 'minimalist', 'gradient', 'dark', 'interactive')
- `customErrorTpl`: Use your own Angular TemplateRef
- `errorClass`: Apply custom CSS classes for styling

---

## Built-in Error Templates

The library includes six professionally designed error templates that you can use out of the box:

### 1. Basic Error Template (`errorTemplate="basic"`)

**Features:**
- Clean, simple design with company branding
- Document icon with error message
- Retry and Go Back buttons
- Professional styling

**Usage:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="basic"
  errorClass="basic-error-style">
</ng2-pdfjs-viewer>
```

### 2. Corporate Error Template (`errorTemplate="corporate"`)

**Features:**
- Professional corporate header with logo placeholder
- Company branding elements
- Support contact information
- Business-appropriate styling

**Usage:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="corporate"
  errorClass="corporate-error-style">
</ng2-pdfjs-viewer>
```

### 3. Minimalist Error Template (`errorTemplate="minimalist"`)

**Features:**
- Clean, minimal design
- Glass-morphism effects
- Simple typography
- Focused user experience

**Usage:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="minimalist"
  errorClass="minimal-error-style">
</ng2-pdfjs-viewer>
```

### 4. Gradient Error Template (`errorTemplate="gradient"`)

**Features:**
- Modern gradient backgrounds
- Animated elements
- Contemporary design
- Visual appeal

**Usage:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="gradient"
  errorClass="gradient-error-style">
</ng2-pdfjs-viewer>
```

### 5. Dark Theme Error Template (`errorTemplate="dark"`)

**Features:**
- Dark theme styling
- High contrast design
- Modern dark aesthetics
- Suitable for dark applications

**Usage:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="dark"
  errorClass="dark-error-style">
</ng2-pdfjs-viewer>
```

### 6. Interactive Error Template (`errorTemplate="interactive"`)

**Features:**
- Animated elements and transitions
- Interactive buttons with hover effects
- Technical details expandable section
- Engaging user experience

**Usage:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="interactive"
  errorClass="interactive-error-style">
</ng2-pdfjs-viewer>
```

---

## Custom Template Integration

For advanced customization, you can create your own Angular templates using the `customErrorTpl` input.

### Creating a Custom Template

**1. Define Template in Component:**
```typescript
@Component({
  template: `
    <ng-template #myCustomError let-errorData="errorData">
      <div class="my-custom-error">
        <div class="custom-header">
          <img src="/assets/my-logo.png" alt="My Company" class="logo">
          <h1>Custom Error Display</h1>
        </div>
        <div class="custom-content">
          <div class="error-icon">🚨</div>
          <h2>{{errorData.errorMessage}}</h2>
          <p>This is a custom error template with your branding!</p>
          <div class="custom-actions">
            <button (click)="reloadViewer()" class="btn-primary">
              Try Again
            </button>
            <button (click)="goBack()" class="btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class MyComponent {
  @ViewChild('myCustomError') customErrorTpl!: TemplateRef<any>;
  
  reloadViewer() {
    // Your reload logic
  }
  
  goBack() {
    // Your go back logic
  }
}
```

**2. Use Template in ng2-pdfjs-viewer:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  [customErrorTpl]="customErrorTpl"
  errorClass="my-custom-error-style">
</ng2-pdfjs-viewer>
```

**3. Add Custom CSS:**
```css
.my-custom-error {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.logo {
  height: 40px;
  width: auto;
}

.custom-content .error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.custom-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.5);
}
```

### Template Context Data

Your custom template receives the following context data:
- `errorMessage`: The error message from PDF.js
- `errorClass`: The CSS class you specified
- `errorTemplateData`: Additional data object for custom properties

---

## CSS Classes for Styling

The built-in templates come with comprehensive CSS styling. You can override or extend these styles using the `errorClass` input.

### Available CSS Classes

Each template has its own CSS class that you can customize:

- `.basic-error-style` - For the basic template
- `.corporate-error-style` - For the corporate template  
- `.minimal-error-style` - For the minimalist template
- `.gradient-error-style` - For the gradient template
- `.dark-error-style` - For the dark theme template
- `.interactive-error-style` - For the interactive template

### Custom Styling Examples

**Override Corporate Template Colors:**
```css
.corporate-error-style {
  --corporate-primary: #ff6b6b;
  --corporate-secondary: #4ecdc4;
  --corporate-text: #2c3e50;
}

.corporate-error-style .corporate-header {
  background: var(--corporate-primary);
}

.corporate-error-style .corporate-btn.primary {
  background: var(--corporate-secondary);
}
```

**Add Custom Animations:**
```css
.interactive-error-style {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Responsive Design:**
```css
.basic-error-style {
  padding: 20px;
}

@media (max-width: 768px) {
  .basic-error-style {
    padding: 15px;
    font-size: 14px;
  }
  
  .basic-error-style .error-actions {
    flex-direction: column;
    gap: 10px;
  }
}
```

---

## Company Logo Integration

### Using Built-in Templates with Logos

The built-in templates include logo placeholders that you can customize:

**Corporate Template with Logo:**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="corporate"
  errorClass="corporate-error-style">
</ng2-pdfjs-viewer>
```

**Custom CSS to add your logo:**
```css
.corporate-error-style .company-logo-placeholder {
  background-image: url('/assets/your-company-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 40px;
  height: 40px;
}

.corporate-error-style .logo-icon {
  display: none; /* Hide the emoji placeholder */
}
```

### Custom Template with Logo

For more control, create a custom template:

```typescript
@Component({
  template: `
    <ng-template #myLogoError let-errorData="errorData">
      <div class="my-logo-error">
        <div class="error-header">
          <img src="/assets/my-logo.png" alt="My Company" class="company-logo">
          <h1>Document Error</h1>
        </div>
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2>{{errorData.errorMessage}}</h2>
          <div class="error-actions">
            <button (click)="reloadViewer()">Retry</button>
            <button (click)="goBack()">Go Back</button>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class MyComponent {
  @ViewChild('myLogoError') customErrorTpl!: TemplateRef<any>;
}
```

---

## Usage Instructions

### 1. Enable Error Override
Set `errorOverride = true` in your component or template.

### 2. Choose a Template
Select from built-in templates using `errorTemplate` or create a custom one with `customErrorTpl`.

### 3. Add Custom Styling
Use the `errorClass` input to apply your custom CSS classes.

### 4. Test Your Implementation
Use the SampleApp's error testing buttons to see your custom error display.

### 5. Customize for Your Brand
- Replace logo placeholders with your actual logo
- Adjust colors to match your brand palette
- Modify text content to match your tone
- Add your company's contact information

---

## Best Practices

1. **Security First**: Use Angular templates instead of custom HTML to avoid XSS vulnerabilities
2. **Keep it Simple**: Don't overwhelm users with too much information
3. **Be Helpful**: Provide clear next steps or contact information
4. **Match Your Brand**: Use consistent colors, fonts, and styling
5. **Test Responsively**: Ensure your error display works on all screen sizes
6. **Accessibility**: Use proper contrast ratios and readable fonts
7. **Performance**: Keep templates lightweight and avoid heavy animations

---

## Troubleshooting

### Common Issues

1. **Template not displaying**: Verify `errorOverride` is set to `true`
2. **CSS not applying**: Check that `errorClass` is correctly set
3. **Logo not showing**: Verify the image path and ensure the file exists
4. **Styling conflicts**: Use more specific CSS selectors or `!important`

### Debug Tips

1. Use browser developer tools to inspect the error overlay
2. Check console for any JavaScript errors
3. Verify that the correct template is selected
4. Test with different error scenarios to ensure consistency
5. Check Angular's change detection if custom templates aren't updating

---

## Migration from Custom HTML

If you were previously using the `errorHtml` input, here's how to migrate:

**Old approach (deprecated):**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorHtml="<div>Custom HTML</div>"
  errorClass="my-error-style">
</ng2-pdfjs-viewer>
```

**New approach (recommended):**
```html
<ng2-pdfjs-viewer
  [errorOverride]="true"
  errorTemplate="basic"
  errorClass="my-error-style">
</ng2-pdfjs-viewer>
```

Or create a custom template:
```typescript
// In your component
@ViewChild('myErrorTemplate') customErrorTpl!: TemplateRef<any>;
```

```html
<!-- In your template -->
<ng-template #myErrorTemplate let-errorData="errorData">
  <div>Your custom template content</div>
</ng-template>

<ng2-pdfjs-viewer
  [errorOverride]="true"
  [customErrorTpl]="customErrorTpl"
  errorClass="my-error-style">
</ng2-pdfjs-viewer>
```

---

This documentation provides comprehensive examples for customizing error displays in the ng2-pdfjs-viewer library using the new secure, template-based approach. Choose the method that best fits your needs and customize it according to your brand requirements.
