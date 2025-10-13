# Features Overview

ng2-pdfjs-viewer v25.x comes packed with powerful features designed for modern Angular applications. Here's what makes it special:

## 🆕 Latest Features (v25.x)

| Feature | Description | Status |
| ------- | ----------- | ------ |
| **Complete Rewrite** | Full library rewrite with PDF.js v5.x and modern Angular patterns | ✅ New |
| **Advanced Theme System** | CSS custom properties for complete visual customization | ✅ New |
| **Template-Based UI** | Custom loading spinners and error displays using Angular templates | ✅ New |
| **Convenience Configuration** | Object-based configuration for cleaner, more maintainable code | ✅ New |
| **Event-Driven Architecture** | Pure event-based system with universal action dispatcher | ✅ New |
| **Enhanced Error Handling** | Multiple error display styles with custom templates | ✅ New |
| **Mobile-First Design** | Responsive layout optimized for touch devices | ✅ New |
| **TypeScript Strict Mode** | Full type safety with comprehensive API coverage | ✅ New |
| **URL Security Validation** | Prevents unauthorized file parameter manipulation with custom templates | ✅ New |

## 🏆 Unique Advantages

### Universal Action Dispatcher
Single pathway for all actions with readiness validation. No more timing issues or race conditions.

### Template-Based Customization
Use Angular templates for loading and error states instead of HTML strings. More secure and maintainable.

### Comprehensive Event System
24+ events covering all user interactions and state changes. Build reactive applications with confidence.

### Advanced Configuration Objects
Clean, object-based configuration for complex setups. Group related settings logically.

### Production-Ready Architecture
Event-driven design with no timeouts or polling. Built for enterprise applications.

## 📱 Mobile & Responsive

### Touch-Friendly Interface
- Optimized touch gestures
- Responsive toolbar layout
- Mobile-first design approach
- Adaptive UI components

### Screen Size Adaptations
- Automatic layout adjustments
- Collapsible toolbars
- Responsive sidebar
- Mobile navigation patterns

## 🎨 Theming & Customization

### Advanced Theme System
```typescript
themeConfig = {
  theme: 'dark',
  primaryColor: '#3f51b5',
  backgroundColor: '#1e1e1e',
  textColor: '#ffffff'
};
```

### Custom Templates
```html
<ng-template #loadingTemplate>
  <div class="custom-loader">
    <mat-spinner></mat-spinner>
    <p>Loading your document...</p>
  </div>
</ng-template>
```

### CSS Custom Properties
Complete visual control through CSS variables:
```css
:root {
  --pdf-viewer-primary: #3f51b5;
  --pdf-viewer-background: #ffffff;
  --pdf-viewer-text: #333333;
}
```

## ⚡ Performance Features

### Event-Driven Architecture
- No polling or timeouts
- Immediate action execution
- Efficient memory usage
- Optimized rendering pipeline

### Lazy Loading
- On-demand resource loading
- Progressive PDF rendering
- Memory-efficient page handling
- Optimized for large documents

### Caching & Optimization
- Intelligent resource caching
- Minimized re-renders
- Efficient event handling
- Optimized bundle size

## 🔧 Developer Experience

### TypeScript Support
- Full type safety with strict mode
- Comprehensive type definitions
- IntelliSense support
- Compile-time error checking

### Event System
- 24+ comprehensive events
- Strongly typed event data
- Consistent event patterns
- Easy event handling

### API Methods
- 19+ methods with Promise returns
- Consistent error handling
- Comprehensive method coverage
- Easy programmatic control

### Debugging Support
- Built-in diagnostic logging
- Error tracking and reporting
- Development mode helpers
- Clear error messages

## 📊 Advanced Features

### Multi-Language Support
- Automatic locale detection
- RTL language support
- Customizable text strings
- International number formats

### Accessibility
- ARIA label support
- Keyboard navigation
- Screen reader compatibility
- High contrast mode support

### Security
- XSS prevention
- Content sanitization
- Secure template rendering
- CORS handling

### Browser Compatibility
- Modern browser support
- Progressive enhancement
- Fallback mechanisms
- Cross-platform consistency

## 🔄 Migration Benefits

### From v20.x to v25.x
- **Cleaner API**: Simplified configuration
- **Better Performance**: Event-driven architecture
- **Enhanced Security**: Template-based UI
- **Improved DX**: Better TypeScript support
- **Modern Patterns**: Angular best practices

## 🎯 Perfect For

- **Document Management Systems**
- **E-learning Platforms**
- **Report Viewers**
- **Digital Publishing**
- **Enterprise Applications**
- **Mobile Applications**

## 🔒 Security Features

### URL Validation
Prevents unauthorized file parameter manipulation in external viewer mode. When enabled, the component validates that the file parameter in the viewer URL hasn't been tampered with.

### Custom Security Templates
Use Angular templates to display custom security warnings when URL manipulation is detected.

### Developer-Friendly
Console warnings for debugging while maintaining user experience.

## What's Next?

Explore specific features in detail:

- 🎨 [**Theming**](./theming) - Customize the appearance
- 🔒 [**Security**](./security) - URL validation and security features
- 🛡️ [**iframe Security**](./iframe-security) - iframe sandbox and security configuration
- 🪟 [**External Window**](./external-window) - External window and tab management
- 📚 [**Examples**](../examples/basic-usage) - See it in action
- 📖 [**API Reference**](../api/component-inputs) - Complete documentation
- 🔄 [**Migration Guide**](../migration/overview) - Upgrade from v20.x
