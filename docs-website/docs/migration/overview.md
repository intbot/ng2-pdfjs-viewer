# Migration Guide Overview

Welcome to the migration guide for upgrading from ng2-pdfjs-viewer v20.x to v25.x. This guide will help you smoothly transition to the new architecture.

## Why Migrate to v25.x?

Version 25.x represents a **complete rewrite** with significant improvements:

### 🚀 Major Improvements

- **Modern Architecture**: Event-driven design with universal action dispatcher
- **Better Performance**: No timeouts, polling, or defensive programming
- **Enhanced Security**: Template-based UI instead of HTML strings
- **Improved DX**: Better TypeScript support and cleaner API
- **Mobile-First**: Responsive design optimized for all devices
- **Production-Ready**: Comprehensive error handling and testing

### 📊 Before vs After

| Aspect | v20.x | v25.x |
|--------|-------|-------|
| **Architecture** | Mixed event/polling | Pure event-driven |
| **Customization** | HTML strings | Angular templates |
| **Error Handling** | Basic | Comprehensive |
| **TypeScript** | Partial | Strict mode |
| **Mobile Support** | Limited | Mobile-first |
| **Performance** | Good | Excellent |

## Migration Strategy

### 1. Assessment Phase
- Review your current implementation
- Identify breaking changes that affect you
- Plan the migration timeline

### 2. Preparation Phase
- Update to Angular 20+ (recommended)
- Backup your current implementation
- Review new features you want to adopt

### 3. Migration Phase
- Update package version
- Apply breaking changes fixes
- Test thoroughly

### 4. Enhancement Phase
- Adopt new features
- Optimize performance
- Improve user experience

## Breaking Changes Summary

:::warning
v25.x introduces several breaking changes. Review each section carefully.
:::

### 1. Template-Based UI
**Old (v20.x):**
```typescript
// HTML strings (deprecated)
this.pdfViewer.setErrorHtml('<div>Error occurred</div>');
this.pdfViewer.setSpinnerHtml('<div>Loading...</div>');
```

**New (v25.x):**
```html
<!-- Angular templates -->
<ng-template #errorTemplate>
  <div>Error occurred</div>
</ng-template>

<ng2-pdfjs-viewer [customErrorTpl]="errorTemplate">
</ng2-pdfjs-viewer>
```

### 2. Property Renames
| Old Property | New Property | Notes |
|-------------|--------------|-------|
| `[startDownload]` | `[downloadOnLoad]` | Clearer naming |
| `[startPrint]` | `[printOnLoad]` | Clearer naming |
| `[errorHtml]` | `[customErrorTpl]` | Template-based |
| `[spinnerHtml]` | `[customSpinnerTpl]` | Template-based |

### 3. Event System Updates
**Old (v20.x):**
```typescript
// Limited events
(onDocumentLoad)="onLoad()"
(onDocumentError)="onError($event)"
```

**New (v25.x):**
```typescript
// 24+ comprehensive events
(onDocumentLoad)="onLoad()"
(onDocumentError)="onError($event)"
(onPageChange)="onPageChange($event)"
(onProgress)="onProgress($event)"
// ... and many more
```

### 4. Configuration Objects
**Old (v20.x):**
```typescript
// Individual properties
[showToolbar]="true"
[showSidebar]="true"
[showDownload]="true"
[showPrint]="true"
```

**New (v25.x):**
```typescript
// Grouped configuration objects
[groupVisibility]="groupVisibilityConfig"
[controlVisibility]="controlVisibilityConfig"

// Where:
groupVisibilityConfig = {
  download: true,
  print: true,
  find: true,
  fullScreen: true
};
```

## Migration Timeline

### Immediate (Required)
1. **Update package version**
2. **Fix breaking changes**
3. **Update deprecated properties**
4. **Test basic functionality**

### Short-term (Recommended)
1. **Migrate to templates**
2. **Adopt configuration objects**
3. **Implement new events**
4. **Update error handling**

### Long-term (Optional)
1. **Adopt new theming system**
2. **Implement mobile optimizations**
3. **Enhance user experience**
4. **Performance optimizations**

## Migration Tools

### Automated Migration (Coming Soon)
We're working on an automated migration tool to help with common changes:

```bash
# Future release
npx ng2-pdfjs-viewer-migrate
```

### Manual Migration Checklist
- [ ] Update package version
- [ ] Replace deprecated properties
- [ ] Convert HTML strings to templates
- [ ] Update event handlers
- [ ] Test all functionality
- [ ] Update documentation

## Testing Strategy

### 1. Unit Tests
Update your unit tests to work with the new API:

```typescript
// Old test approach
it('should set error HTML', () => {
  component.pdfViewer.setErrorHtml('<div>Error</div>');
  // ... test assertions
});

// New test approach
it('should use error template', () => {
  component.errorTemplate = mockTemplate;
  // ... test assertions
});
```

### 2. Integration Tests
Test the complete PDF viewing workflow:

```typescript
it('should load PDF and handle events', async () => {
  const loadSpy = jasmine.createSpy('onDocumentLoad');
  component.onDocumentLoad = loadSpy;
  
  component.pdfSrc = 'test.pdf';
  await fixture.detectChanges();
  
  expect(loadSpy).toHaveBeenCalled();
});
```

### 3. E2E Tests
Ensure the viewer works correctly in real browsers:

```typescript
it('should display PDF correctly', () => {
  cy.visit('/pdf-viewer');
  cy.get('ng2-pdfjs-viewer').should('be.visible');
  cy.get('.pdf-page').should('exist');
});
```

## Support During Migration

### Resources
- 🚀 [**Getting Started**](../getting-started) - Set up v25.x quickly
- 📚 [**Examples**](../examples/basic-usage) - Practical code examples
- 🎯 [**Live Demo**](https://angular-pdf-viewer-demo.vercel.app/) - See v25.x in action

### Community Support
- 💬 [**GitHub Discussions**](https://github.com/intbot/ng2-pdfjs-viewer/discussions) - Ask questions
- 🐛 [**GitHub Issues**](https://github.com/intbot/ng2-pdfjs-viewer/issues) - Report migration issues
- 📖 [**Documentation**](../intro) - Complete documentation

### Professional Support
Need help with your migration? Consider:
- Code review services
- Migration consulting
- Training sessions
- Custom implementation

## Next Steps

Ready to start your migration?

1. 🚀 [**Getting Started**](../getting-started) - Set up v25.x
2. 📚 [**Examples**](../examples/basic-usage) - Learn new patterns
3. 📖 [**API Reference**](../api/component-inputs) - Complete API documentation
4. 🎨 [**Theming Guide**](../features/theming) - Customize appearance

## Migration Success Stories

:::tip Success Story
*"The migration to v25.x took us 2 days and improved our app's performance significantly. The new event system is much more reliable."* - Enterprise Customer
:::

:::tip Success Story
*"Template-based error handling is a game-changer. Our custom error pages look and feel native to our app."* - SaaS Platform
:::

Start your migration journey today and unlock the full potential of ng2-pdfjs-viewer v25.x!
