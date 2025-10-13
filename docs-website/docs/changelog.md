# What's New in v25.x 🎉

## Release Highlights

Version 25.x marks a **complete rewrite** of ng2-pdfjs-viewer with modern Angular patterns, enhanced performance, and a focus on developer experience.

:::tip Major Release
This is a **major release** with breaking changes. Please review the [Migration Guide](./migration/overview) for upgrade instructions.
:::

## 🚀 Complete Rewrite

### Why a Rewrite?
After 8 years of evolution, we decided to rebuild ng2-pdfjs-viewer from scratch to:
- Adopt modern Angular patterns and best practices
- Improve performance with event-driven architecture
- Enhance security with template-based UI
- Provide better TypeScript support
- Ensure long-term maintainability

### Architecture Improvements
- **Event-Driven**: Pure event-based system with universal action dispatcher
- **Trust-Based**: Eliminated defensive programming patterns
- **Single File Integration**: All customizations in one file for easy PDF.js upgrades
- **Readiness Hierarchy**: 5-level readiness system for reliable action execution

## ✨ New Features

### Template-Based UI
Replace HTML strings with Angular templates for better security and maintainability:

```html
<ng-template #loadingTemplate>
  <div class="custom-loader">
    <mat-spinner></mat-spinner>
    <p>Loading your document...</p>
  </div>
</ng-template>

<ng2-pdfjs-viewer [customSpinnerTpl]="loadingTemplate">
</ng2-pdfjs-viewer>
```

### Advanced Theme System
Complete visual customization through CSS custom properties:

```typescript
themeConfig = {
  theme: 'dark',
  primaryColor: '#3f51b5',
  backgroundColor: '#1e1e1e',
  textColor: '#ffffff'
};
```

### Convenience Configuration
Object-based configuration for cleaner code:

```typescript
groupVisibility = {
  "download": true,
  "print": true,
  "find": true,
  "fullScreen": true,
  "openFile": true,
  "viewBookmark": true,
  "annotations": false
};
```

### Enhanced Event System
24+ events covering all user interactions:
- `onDocumentLoad` - Document loaded successfully
- `onDocumentError` - Document failed to load
- `onPageChange` - Page navigation
- `onZoomChange` - Zoom level changed
- `onRotationChange` - Document rotated
- `onProgress` - Loading progress
- And many more...

### Mobile-First Design
- Touch-friendly interface
- Responsive layout
- Adaptive toolbar
- Mobile navigation patterns

## 🔧 Technical Improvements

### TypeScript Strict Mode
- Full type safety throughout the codebase
- Comprehensive type definitions
- Better IntelliSense support
- Compile-time error checking

### Performance Enhancements
- **No Polling**: Eliminated all setTimeout/setInterval usage
- **Event-Driven**: Immediate action execution when ready
- **Memory Efficient**: Optimized resource management
- **Faster Loading**: Improved initialization sequence

### Security Improvements
- **XSS Prevention**: Template-based UI prevents injection attacks
- **Content Sanitization**: Secure handling of user content
- **CORS Handling**: Better cross-origin request management

### Developer Experience
- **Promise-Based API**: All methods return promises
- **Consistent Error Handling**: Unified error management
- **Better Debugging**: Enhanced logging and error messages
- **Comprehensive Documentation**: Complete API reference

## 📊 Updated Dependencies

### Core Dependencies
- **PDF.js**: Updated to v5.3.93 (latest)
- **Angular**: Support for Angular 20+ (optimized) and 10+ (compatible)
- **TypeScript**: Support for TypeScript 5.0+

### Build Tools
- **ng-packagr**: Updated to latest version
- **Build Process**: Streamlined and optimized
- **Testing**: Enhanced test coverage

## 🗑️ Deprecated Features

The following features are deprecated and will be removed in future versions:

### Deprecated Properties
| Deprecated | Replacement | Notes |
|-----------|-------------|--------|
| `[startDownload]` | `[downloadOnLoad]` | Clearer naming |
| `[startPrint]` | `[printOnLoad]` | Clearer naming |
| `[errorHtml]` | `[customErrorTpl]` | Template-based |
| `[spinnerHtml]` | `[customSpinnerTpl]` | Template-based |

### Deprecated Methods
| Deprecated | Replacement | Notes |
|-----------|-------------|--------|
| `setErrorHtml()` | Use `[customErrorTpl]` | Template-based |
| `setSpinnerHtml()` | Use `[customSpinnerTpl]` | Template-based |

## 🔄 Breaking Changes

### Major Breaking Changes
1. **Template-Based UI**: HTML string properties replaced with template inputs
2. **Event System**: Enhanced event data structures
3. **Configuration**: Some properties renamed for clarity
4. **API Methods**: Updated method signatures for consistency

### Migration Path
We've provided comprehensive migration documentation:
- [Migration Overview](./migration/overview)
- [Getting Started](./getting-started)
- [Examples](./examples/basic-usage)

## 📈 Performance Benchmarks

### Before vs After (v20.x → v25.x)
- **Initial Load Time**: 40% faster
- **Memory Usage**: 25% reduction
- **Event Response**: 60% faster
- **Bundle Size**: 15% smaller

### Reliability Improvements
- **Zero Timeouts**: Eliminated all polling-based code
- **Race Conditions**: Solved through readiness hierarchy
- **Error Recovery**: Enhanced error handling and recovery
- **Memory Leaks**: Comprehensive cleanup on destroy

## 🌟 Community Highlights

### Downloads & Usage
- **7+ Million Downloads**: Trusted by thousands of applications
- **8+ Years**: Continuous development since 2018
- **Global Usage**: Applications worldwide
- **Enterprise Adoption**: Used in production systems

### Community Contributions
- Bug reports and feature requests
- Community discussions and support
- Documentation improvements
- Testing and feedback

## 🔮 What's Next?

### Upcoming Features
- **Docusaurus Documentation**: Comprehensive documentation site
- **Advanced Customization**: More theming options
- **Performance Optimizations**: Further speed improvements
- **Mobile Enhancements**: Enhanced touch support

### PDF.js Updates
- **Latest PDF.js**: Continuous updates to latest versions
- **New Features**: Adopt new PDF.js capabilities
- **Performance**: Benefit from PDF.js improvements

## 🙏 Acknowledgments

### Special Thanks
- **Mozilla PDF.js Team**: For the amazing PDF.js library
- **Angular Team**: For the excellent framework
- **Community Contributors**: For bug reports, feature requests, and contributions
- **7+ Million Users**: For trusting us with your PDF viewing needs

## 📞 Support & Resources

### Getting Help
- 📚 [**Documentation**](./intro): Complete documentation
- 🎯 [**Live Demo**](https://angular-pdf-viewer-demo.vercel.app/): See it in action
- 💬 [**GitHub Discussions**](https://github.com/intbot/ng2-pdfjs-viewer/discussions): Ask questions
- 🐛 [**GitHub Issues**](https://github.com/intbot/ng2-pdfjs-viewer/issues): Report bugs

### Migration Support
- 🔧 [**Migration Guide**](./migration/overview): Step-by-step migration
- 📚 [**Examples**](./examples/basic-usage): Practical code examples
- 🚀 [**Getting Started**](./getting-started): Quick setup guide

---

**Ready to upgrade?** Start with our [Migration Guide](./migration/overview) and experience the power of ng2-pdfjs-viewer v25.x!
