# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [20.4.0] - 2024-12-07

### Added

#### 🎨 Theme System

- Complete theme customization with CSS custom properties
- Light, dark, and auto theme support
- Custom color schemes for primary, background, toolbar, and text colors
- Border radius and spacing customization
- Material Design integration

#### ⚡ Universal Action Dispatcher

- Event-driven architecture with promise-based API
- Readiness-based action execution (5-level hierarchy)
- Automatic action queuing until requirements are met
- Trust-based execution model (no defensive programming)

#### 🔄 Custom Loading & Error Handling

- Template-based loading spinners with Angular templates
- Multiple built-in error display styles (Basic, Corporate, Minimalist, Gradient, Dark, Interactive)
- Custom error templates with company logo support
- CSS-only styling with animations and responsive design

#### 🎯 Enhanced Developer Experience

- TypeScript strict mode support
- Comprehensive API coverage with consistent promise returns
- Better error handling and debugging capabilities
- Improved IDE integration and autocomplete

#### 📱 Mobile & Responsive Features

- Mobile-first responsive design
- Touch-friendly controls and gestures
- Smart device zoom optimization
- Responsive breakpoint configuration

#### 🌍 Improved Internationalization

- Better locale support with automatic detection
- Fixed locale change issues in PDF.js v5.x
- Support for 50+ languages and locales

### Changed

#### 🔄 PDF.js Upgrade

- **BREAKING**: Upgraded from PDF.js v4.0.x to v5.3.93
- Improved rendering performance and security
- Enhanced event system and API compatibility
- Better mobile device support

#### 🏗️ Architecture Improvements

- Single-file integration in `postmessage-wrapper.js`
- Removed all `window` variable dependencies (except BUILD_ID)
- Pure event-driven patterns (no timeouts or polling)
- Consolidated configuration management

#### 📝 API Enhancements

- Promise-based method returns for all actions
- Consistent error handling across all methods
- Better property transformation between Angular and PDF.js
- Enhanced event system with comprehensive coverage

### Deprecated

#### ⚠️ Properties (Deprecated)

- `[startDownload]` → Use `[downloadOnLoad]`
- `[startPrint]` → Use `[printOnLoad]`
- `[errorHtml]` → Use `[customErrorTpl]`
- `[errorTemplate]` → Use `[customErrorTpl]`
- `[spinnerHtml]` → Use `[customSpinnerTpl]`

#### ⚠️ Methods (Deprecated)

- `setErrorHtml()` → Use `[customErrorTpl]` with ng-template
- `setSpinnerHtml()` → Use `[customSpinnerTpl]` with ng-template

### Fixed

#### 🐛 Bug Fixes

- Fixed locale changes not applying in PDF.js v5.x
- Fixed spinner not hiding on error conditions
- Fixed PostMessage serialization errors
- Fixed CORS/security error handling
- Fixed HTML sanitization warnings in error displays

#### 🔧 Technical Fixes

- Removed timeout-based hacks in favor of event-driven solutions
- Fixed circular update prevention in two-way binding
- Improved error event listener setup and timing
- Enhanced state change notification system

### Security

#### 🔒 Security Improvements

- Updated to PDF.js v5.3.93 with latest security patches
- Removed HTML sanitization issues with template-based approach
- Enhanced CORS error handling
- Better input validation and sanitization

### Performance

#### ⚡ Performance Improvements

- Faster PDF loading with PDF.js v5.3.93
- Reduced memory usage with better cleanup
- Improved rendering performance on mobile devices
- Optimized event handling and state management

### Documentation

#### 📚 Documentation Updates

- Complete README rewrite with SEO optimization
- Comprehensive API reference with examples
- Migration guide from v19.x to v20.4.0
- Enhanced code examples and tutorials
- Better troubleshooting and FAQ sections

## [19.x.x] - Previous Versions

### Legacy Features (Deprecated)

- Old theme system with custom CSS
- HTML string-based error and spinner customization
- Timeout-based action execution
- Window variable dependencies
- PDF.js v4.0.x integration

---

## Migration Guide

### From v19.x to v20.4.0

1. **Update Dependencies**

   ```bash
   npm install ng2-pdfjs-viewer@latest
   ```

2. **Update Theme Configuration**

   ```typescript
   // Old way
   [customCSS] =
     // New way
     "'body { background: red; }'"[theme] =
     "'light'"[primaryColor] =
     "'#ff0000'"[backgroundColor] =
       "'#ffffff'";
   ```

3. **Update Error Handling**

   ```html
   <!-- Old way -->
   [errorHtml]="'
   <div>Custom error</div>
   '"

   <!-- New way -->
   <ng-template #errorTemplate>
     <div>Custom error</div>
   </ng-template>
   <ng2-pdfjs-viewer [customErrorTpl]="errorTemplate"></ng2-pdfjs-viewer>
   ```

4. **Update Loading Spinners**

   ```html
   <!-- Old way -->
   [spinnerHtml]="'
   <div>Loading...</div>
   '"

   <!-- New way -->
   <ng-template #spinnerTemplate>
     <div>Loading...</div>
   </ng-template>
   <ng2-pdfjs-viewer [customSpinnerTpl]="spinnerTemplate"></ng2-pdfjs-viewer>
   ```

### Breaking Changes

- **PDF.js v5.3.93**: Some internal APIs may have changed
- **Theme System**: New CSS custom properties approach
- **Error Handling**: Template-based system replaces HTML strings
- **Window Variables**: Removed most window dependencies

### Compatibility

- **Angular**: 2.0+ (tested with Angular 20.0+)
- **TypeScript**: 5.0+
- **Node.js**: 18.0+
- **Browsers**: Modern browsers with ES2020+ support

---

## Support

- 📖 **Documentation**: [GitHub Wiki](https://github.com/intbot/ng2-pdfjs-viewer/wiki)
- 💬 **Community**: [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- 📧 **Email**: codehippie1@gmail.com
