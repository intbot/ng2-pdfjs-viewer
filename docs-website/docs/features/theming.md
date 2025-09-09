# Theming & Customization

Learn how to customize the appearance of ng2-pdfjs-viewer to match your application's design.

## Theme System Overview

ng2-pdfjs-viewer v25.x introduces a powerful theme system based on CSS custom properties, allowing complete visual customization while maintaining performance and accessibility.

## Basic Theming

### Built-in Themes

Choose from pre-built themes:

```typescript
// Light theme (default)
theme = 'light';

// Dark theme
theme = 'dark';

// Auto theme (follows system preference)
theme = 'auto';
```

```html
<ng2-pdfjs-viewer 
  pdfSrc="assets/sample.pdf"
  [theme]="theme">
</ng2-pdfjs-viewer>
```

### Quick Color Customization

Customize colors with simple properties:

```typescript
export class MyComponent {
  theme = 'dark';
  primaryColor = '#3f51b5';
  backgroundColor = '#1e1e1e';
  textColor = '#ffffff';
}
```

```html
<ng2-pdfjs-viewer
  [theme]="theme"
  [primaryColor]="primaryColor"
  [backgroundColor]="backgroundColor"
  [textColor]="textColor">
</ng2-pdfjs-viewer>
```

## Advanced Theme Configuration

### Theme Configuration Object

For complex theming, use the `themeConfig` object:

```typescript
interface ThemeConfig {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  customCSS?: string;
}

export class MyComponent {
  themeConfig: ThemeConfig = {
    theme: 'dark',
    primaryColor: '#ff6b6b',
    backgroundColor: '#2c3e50',
    textColor: '#ecf0f1',
    borderRadius: '12px',
    customCSS: `
      .toolbar {
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .page {
        border-radius: 8px;
      }
    `
  };
}
```

```html
<ng2-pdfjs-viewer [themeConfig]="themeConfig">
</ng2-pdfjs-viewer>
```

## CSS Custom Properties

### Available CSS Variables

The theme system exposes CSS custom properties for fine-grained control:

```css
:root {
  /* Primary Colors */
  --pdf-viewer-primary: #3f51b5;
  --pdf-viewer-primary-dark: #303f9f;
  --pdf-viewer-primary-light: #7986cb;
  
  /* Background Colors */
  --pdf-viewer-background: #ffffff;
  --pdf-viewer-surface: #f5f5f5;
  --pdf-viewer-paper: #ffffff;
  
  /* Text Colors */
  --pdf-viewer-text-primary: #212121;
  --pdf-viewer-text-secondary: #757575;
  --pdf-viewer-text-disabled: #bdbdbd;
  
  /* Border & Dividers */
  --pdf-viewer-border: #e0e0e0;
  --pdf-viewer-divider: #e0e0e0;
  
  /* Shadows */
  --pdf-viewer-shadow: 0 2px 4px rgba(0,0,0,0.1);
  --pdf-viewer-shadow-hover: 0 4px 8px rgba(0,0,0,0.15);
  
  /* Border Radius */
  --pdf-viewer-border-radius: 4px;
  --pdf-viewer-border-radius-large: 8px;
  
  /* Spacing */
  --pdf-viewer-spacing-xs: 4px;
  --pdf-viewer-spacing-sm: 8px;
  --pdf-viewer-spacing-md: 16px;
  --pdf-viewer-spacing-lg: 24px;
  --pdf-viewer-spacing-xl: 32px;
}
```

### Dark Theme Variables

Dark theme automatically applies these overrides:

```css
[data-theme="dark"] {
  /* Primary Colors (unchanged) */
  --pdf-viewer-primary: #3f51b5;
  
  /* Dark Background Colors */
  --pdf-viewer-background: #121212;
  --pdf-viewer-surface: #1e1e1e;
  --pdf-viewer-paper: #2d2d2d;
  
  /* Dark Text Colors */
  --pdf-viewer-text-primary: #ffffff;
  --pdf-viewer-text-secondary: #b0b0b0;
  --pdf-viewer-text-disabled: #6d6d6d;
  
  /* Dark Borders */
  --pdf-viewer-border: #333333;
  --pdf-viewer-divider: #333333;
  
  /* Dark Shadows */
  --pdf-viewer-shadow: 0 2px 4px rgba(0,0,0,0.3);
  --pdf-viewer-shadow-hover: 0 4px 8px rgba(0,0,0,0.4);
}
```

## Custom Themes

### Creating a Custom Theme

Create your own theme by overriding CSS variables:

```css title="custom-theme.css"
/* Custom Blue Theme */
.pdf-viewer-blue-theme {
  --pdf-viewer-primary: #2196f3;
  --pdf-viewer-primary-dark: #1976d2;
  --pdf-viewer-primary-light: #64b5f6;
  
  --pdf-viewer-background: #f3f8ff;
  --pdf-viewer-surface: #e3f2fd;
  --pdf-viewer-paper: #ffffff;
  
  --pdf-viewer-text-primary: #0d47a1;
  --pdf-viewer-text-secondary: #1565c0;
  
  --pdf-viewer-border: #bbdefb;
  --pdf-viewer-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

/* Custom Green Theme */
.pdf-viewer-green-theme {
  --pdf-viewer-primary: #4caf50;
  --pdf-viewer-primary-dark: #388e3c;
  --pdf-viewer-primary-light: #81c784;
  
  --pdf-viewer-background: #f1f8e9;
  --pdf-viewer-surface: #e8f5e8;
  --pdf-viewer-paper: #ffffff;
  
  --pdf-viewer-text-primary: #1b5e20;
  --pdf-viewer-text-secondary: #2e7d32;
  
  --pdf-viewer-border: #c8e6c9;
  --pdf-viewer-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}
```

### Applying Custom Themes

Apply your custom theme using CSS classes:

```typescript
export class MyComponent {
  customThemeClass = 'pdf-viewer-blue-theme';
}
```

```html
<div [class]="customThemeClass">
  <ng2-pdfjs-viewer pdfSrc="assets/sample.pdf">
  </ng2-pdfjs-viewer>
</div>
```

## Component-Specific Styling

### Toolbar Customization

```css
.pdf-viewer-custom {
  /* Toolbar styling */
  --pdf-toolbar-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --pdf-toolbar-text: #ffffff;
  --pdf-toolbar-border: none;
  --pdf-toolbar-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Toolbar buttons */
.pdf-viewer-custom .toolbar button {
  border-radius: var(--pdf-viewer-border-radius-large);
  transition: all 0.2s ease;
}

.pdf-viewer-custom .toolbar button:hover {
  transform: translateY(-1px);
  box-shadow: var(--pdf-viewer-shadow-hover);
}
```

### Sidebar Customization

```css
.pdf-viewer-custom {
  /* Sidebar styling */
  --pdf-sidebar-background: #f8f9fa;
  --pdf-sidebar-border: #dee2e6;
  --pdf-sidebar-width: 280px;
}

/* Sidebar items */
.pdf-viewer-custom .sidebar-item {
  border-radius: var(--pdf-viewer-border-radius);
  padding: var(--pdf-viewer-spacing-sm);
  margin: var(--pdf-viewer-spacing-xs);
  transition: background-color 0.2s ease;
}

.pdf-viewer-custom .sidebar-item:hover {
  background-color: var(--pdf-viewer-surface);
}
```

### Page Styling

```css
.pdf-viewer-custom {
  /* Page styling */
  --pdf-page-shadow: 0 4px 12px rgba(0,0,0,0.1);
  --pdf-page-border-radius: 8px;
  --pdf-page-margin: 16px;
}

/* Page container */
.pdf-viewer-custom .page {
  border-radius: var(--pdf-page-border-radius);
  box-shadow: var(--pdf-page-shadow);
  margin: var(--pdf-page-margin);
  transition: transform 0.2s ease;
}

.pdf-viewer-custom .page:hover {
  transform: translateY(-2px);
}
```

## Responsive Theming

### Mobile-Specific Styling

```css
@media (max-width: 768px) {
  .pdf-viewer-mobile {
    /* Mobile toolbar */
    --pdf-toolbar-height: 48px;
    --pdf-toolbar-padding: var(--pdf-viewer-spacing-sm);
    
    /* Mobile sidebar */
    --pdf-sidebar-width: 100%;
    --pdf-sidebar-overlay: rgba(0,0,0,0.5);
    
    /* Mobile pages */
    --pdf-page-margin: var(--pdf-viewer-spacing-sm);
    --pdf-page-border-radius: var(--pdf-viewer-border-radius);
  }
}
```

### Touch-Friendly Styling

```css
.pdf-viewer-touch {
  /* Larger touch targets */
  --pdf-touch-target-size: 44px;
  --pdf-button-padding: var(--pdf-viewer-spacing-md);
  
  /* Touch feedback */
  --pdf-touch-feedback: rgba(0,0,0,0.1);
}

.pdf-viewer-touch button {
  min-height: var(--pdf-touch-target-size);
  min-width: var(--pdf-touch-target-size);
  padding: var(--pdf-button-padding);
}

.pdf-viewer-touch button:active {
  background-color: var(--pdf-touch-feedback);
}
```

## Animation & Transitions

### Smooth Animations

```css
.pdf-viewer-animated {
  /* Page transitions */
  --pdf-page-transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Zoom transitions */
  --pdf-zoom-transition: transform 0.2s ease-out;
  
  /* Sidebar transitions */
  --pdf-sidebar-transition: transform 0.3s ease-in-out;
}

/* Page animations */
.pdf-viewer-animated .page {
  transition: var(--pdf-page-transition);
}

/* Zoom animations */
.pdf-viewer-animated .zoom-container {
  transition: var(--pdf-zoom-transition);
}

/* Sidebar animations */
.pdf-viewer-animated .sidebar {
  transition: var(--pdf-sidebar-transition);
}
```

### Loading Animations

```css
.pdf-viewer-loading {
  /* Loading spinner */
  --pdf-spinner-color: var(--pdf-viewer-primary);
  --pdf-spinner-size: 40px;
  --pdf-spinner-animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pdf-viewer-loading .spinner {
  width: var(--pdf-spinner-size);
  height: var(--pdf-spinner-size);
  border: 3px solid rgba(var(--pdf-spinner-color), 0.3);
  border-top: 3px solid var(--pdf-spinner-color);
  border-radius: 50%;
  animation: var(--pdf-spinner-animation);
}
```

## Theme Examples

### Corporate Theme

```css
.pdf-viewer-corporate {
  --pdf-viewer-primary: #0066cc;
  --pdf-viewer-background: #f7f9fc;
  --pdf-viewer-surface: #ffffff;
  --pdf-viewer-text-primary: #2c3e50;
  --pdf-viewer-border: #e1e8ed;
  --pdf-viewer-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --pdf-viewer-border-radius: 6px;
}
```

### Creative Theme

```css
.pdf-viewer-creative {
  --pdf-viewer-primary: #ff6b6b;
  --pdf-viewer-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --pdf-viewer-surface: rgba(255,255,255,0.9);
  --pdf-viewer-text-primary: #2c3e50;
  --pdf-viewer-border: rgba(255,255,255,0.2);
  --pdf-viewer-shadow: 0 8px 32px rgba(0,0,0,0.1);
  --pdf-viewer-border-radius: 16px;
}
```

### Minimal Theme

```css
.pdf-viewer-minimal {
  --pdf-viewer-primary: #000000;
  --pdf-viewer-background: #ffffff;
  --pdf-viewer-surface: #ffffff;
  --pdf-viewer-text-primary: #000000;
  --pdf-viewer-text-secondary: #666666;
  --pdf-viewer-border: #e0e0e0;
  --pdf-viewer-shadow: none;
  --pdf-viewer-border-radius: 0;
}
```

## Best Practices

### Performance
- Use CSS custom properties for dynamic theming
- Avoid inline styles for better performance
- Leverage CSS transitions for smooth animations
- Use `will-change` property for animated elements

### Accessibility
- Maintain sufficient color contrast ratios
- Provide focus indicators for keyboard navigation
- Support high contrast mode
- Test with screen readers

### Maintainability
- Use consistent naming conventions
- Group related properties together
- Document custom themes
- Use CSS variables for reusable values

## Troubleshooting

### Common Issues

**Theme not applying:**
```css
/* Ensure CSS is loaded after component styles */
.pdf-viewer-custom {
  --pdf-viewer-primary: #custom-color !important;
}
```

**Variables not working:**
```css
/* Check CSS custom property support */
@supports (--css: variables) {
  .pdf-viewer-modern {
    --pdf-viewer-primary: #modern-color;
  }
}
```

**Mobile styling issues:**
```css
/* Use proper media queries */
@media screen and (max-width: 768px) {
  .pdf-viewer-mobile {
    /* Mobile-specific styles */
  }
}
```

## Next Steps

- 📚 [**Examples**](../examples/basic-usage) - See theming in action
- 📖 [**API Reference**](../api/component-inputs) - Theme configuration options
- 🚀 [**Getting Started**](../getting-started) - Quick setup guide
- 📋 [**Features Overview**](./overview) - All available features
