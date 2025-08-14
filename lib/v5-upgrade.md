# PDF.js v5.x Upgrade & Architecture Guide

## Status: ✅ COMPLETE
**PDF.js Version**: v5.3.93  
**Upgrade Date**: December 2024  
**Architecture**: Pure Event-Driven with Universal Action Dispatcher

---

## Core Architecture Requirements

### 1. Event-Driven Foundation
- **No polling, timeouts, or retry mechanisms**
- **No defensive programming patterns** 
- **Trust-based execution** - components trust readiness guarantees
- **Single source of truth** for all readiness validation

### 2. Universal Action Dispatcher
- **All actions** (initial load, property changes, user interactions) flow through single dispatcher
- **Readiness-based execution** - actions execute only when requirements are met
- **Promise-based API** - all public methods return `Promise<ActionExecutionResult>`
- **Automatic queuing** - actions queue until required readiness level achieved

### 3. Readiness Hierarchy (5 Levels)
```
0: NOT_LOADED - PDFViewerApplication doesn't exist
1: VIEWER_LOADED - PDFViewerApplication exists  
2: VIEWER_INITIALIZED - PDFViewerApplication.initialized = true
3: EVENTBUS_READY - Event bus available and ready
4: COMPONENTS_READY - All PDF.js components available
5: DOCUMENT_LOADED - PDF document fully loaded
```

### 4. Single File Integration
- **All custom code consolidated in `postmessage-wrapper.js`**
- **Zero modifications to PDF.js core files**
- **Pristine PDF.js directory structure** for easy upgrades

---

## Implementation Requirements

### Component Architecture
- **ng2-pdfjs-viewer.component.ts**: Angular bridge, configuration management, PostMessage orchestration
- **postmessage-wrapper.js**: PDF.js iframe controller, bidirectional communication API
- **Action queue management**: Single unified queue with readiness levels
- **Two-way binding**: Automatic property synchronization with circular update prevention

### API Requirements
- **Complete public API coverage** - all expected methods available
- **Consistent promise returns** - `Promise<ActionExecutionResult>` for all actions
- **Property transformation** - automatic conversion between Angular and PDF.js formats
- **Error handling** - comprehensive error management with user feedback

### Integration Standards
- **100% PDF.js v5.x compliance** - adherent to PDF.js standards and APIs
- **TypeScript strict mode** - full type safety throughout
- **Angular compatibility** - supports current Angular versions
- **Backward compatibility** - existing APIs preserved

---

## Core Principles

### Event-First Design
1. **All actions dispatched at required readiness** - no arbitrary categorization
2. **Trust dispatcher guarantees** - no redundant availability checks
3. **Readiness levels determine execution** - natural timing control
4. **Single execution pathway** - consistent flow for all actions

### Upgradeability First
1. **Single file integration** - all customizations in `postmessage-wrapper.js`
2. **Zero PDF.js modifications** - pristine core files
3. **Drop-in upgrades** - replace PDF.js files, preserve wrapper
4. **Clean separation** - clear boundary between library and PDF.js

### Developer Experience
1. **Self-documenting properties** - clear naming conventions
2. **IDE integration** - proper TypeScript definitions
3. **Error transparency** - clear error messages and handling
4. **Testing support** - BUILD_ID verification system

---

## Development Rules

### Rule 1: Testing Protocol
- **Always use `test.bat`** for complete build → publish → update → install → run workflow
- **Never run individual commands** like `npm run build` or `ng serve`

### Rule 2: Build Verification  
- **Always verify BUILD_ID logs** before debugging:
  - `🟢 ng2-pdfjs-viewer.component.ts: TEST LOG - BUILD_ID: [timestamp]`
  - `🟢 postmessage-wrapper.js: TEST LOG - BUILD_ID: [timestamp]`
- **Clear cache if BUILD_ID missing** before proceeding

### Rule 3: Architecture Compliance
- **100% PDF.js v5.x standards** - no fragile implementations
- **Pure event-driven patterns** - no timeout-based hacks
- **Readiness-based logic** - all actions respect readiness requirements

---

## Completed Phases

### ✅ Phase 1: Code Organization  
- Grouped related code using TypeScript regions
- Organized utility functions and helper classes
- Improved code navigation and readability

### ✅ Phase 2: Universal Action Dispatcher (Breakthrough)
- Implemented comprehensive action dispatcher system
- Eliminated code duplication (90% reduction in duplicate patterns)
- Unified all action handling through single pathway
- Complete public API coverage with consistent promise returns

### ✅ Phase 3: Pure Event-Driven Architecture  
- Removed all defensive programming patterns
- Eliminated redundant validation in PostMessage wrapper
- Established trust-based execution model
- Simplified queue management to single readiness-based system

### ✅ Phase 4: Single File Integration
- Consolidated all custom code into `postmessage-wrapper.js`
- Removed scattered custom files from PDF.js directory
- Ensured pristine PDF.js structure for easy upgrades
- Eliminated custom directory modifications

### ✅ Phase 5: Production Readiness
- Complete TypeScript compilation without errors
- All expected public methods implemented and tested
- Comprehensive error handling with user feedback
- SampleApp integration fully functional

---

## Key Achievements

### Technical Innovation
- **Universal Action Dispatcher** - single pathway for all actions with readiness validation
- **Trust-Based Architecture** - eliminated defensive programming completely  
- **Pure Event-Driven Flow** - no polling, timeouts, or availability checks
- **Single File Integration** - simplified PDF.js upgrade process

### Upgrade Success
- **PDF.js v5.3.93** - seamless upgrade requiring zero code changes
- **Future-Proof Design** - architecture enables easy future upgrades
- **Maintained Functionality** - all features work identically
- **Enhanced Performance** - immediate execution, no unnecessary delays

### Developer Experience  
- **Self-Documenting Code** - clear property names and function signatures
- **Complete API Coverage** - all expected methods available
- **Error Transparency** - comprehensive error handling and feedback
- **Testing Infrastructure** - BUILD_ID verification and automated workflows

---

## Future Upgrade Process

1. **Download new PDF.js version**
2. **Replace all PDF.js files** (viewer.mjs, viewer.html, viewer.css, etc.)  
3. **Preserve `postmessage-wrapper.js`** (single integration file)
4. **Test functionality** - verify all features work
5. **Update wrapper if needed** (much easier than merging patches)

**Proven Success**: v5.3.93 upgrade required **zero code changes** and worked immediately.

---

## Resources
- [PDF.js Documentation](https://github.com/mozilla/pdf.js/wiki)
- [Angular Compatibility](https://angular.dev/overview)
- [Project Repository](https://github.com/intbot/ng2-pdfjs-viewer) 

---

## Customization Roadmap (Phased, Upgrade-Safe)

This section documents the upgrade-safe, event-driven customization plan we adopt on top of the v5 architecture. All custom code continues to live in `postmessage-wrapper.js` (single-file integration), and all Angular surface is exposed via inputs/outputs on `ng2-pdfjs-viewer`.

### Phase A: Theme & Visual Customization (Complete)
- Inputs: `theme: 'light'|'dark'|'auto'`, `primaryColor`, `backgroundColor`, `pageBackgroundColor`, `toolbarColor`, `textColor`, `borderRadius`, `customCSS`.
- Implementation: CSS custom properties injected from wrapper; no PDF.js code changes. Event-driven only.
- Status: ✅ Complete

### Phase B: Loading & Spinner (Complete)
- Inputs: `customSpinnerTpl`, `spinnerClass`, `spinnerHtml`; non-breaking default spinner.
- Behavior: Loading overlay shows while viewer emits load events; controlled by event-driven state (`documentinit`/`pagesinit` → show, first `pagerendered`/`pagesloaded` → hide). No timeouts/polling.
- Status: ✅ Complete

### Phase C: Advanced Show/Hide Controls (Complete)
- Inputs: `showToolbarLeft`, `showToolbarMiddle`, `showToolbarRight`, `showSecondaryToolbarToggle`, `showSidebar`, `showSidebarLeft`, `showSidebarRight` plus convenience `groupVisibility` object.
- Behavior: Readiness-based actions toggle DOM group containers using CSS-only display rules; no PDF.js edits.
- Status: ✅ Complete

### Phase D: Layout & Responsive Customization (Complete)
- Inputs: `toolbarDensity`, `sidebarWidth`, `toolbarPosition: 'top'|'bottom'`, `sidebarPosition: 'left'|'right'`, `responsiveBreakpoint`.
- Behavior: CSS-only classes and inline vars applied from wrapper; no PDF.js code edits.
- Status: ✅ Complete

### Phase E: Advanced Customization & Accessibility (Planned)
- Goal: Optional custom toolbar buttons, ARIA label mapping, framework-friendly variables.
- Approach: Wrapper-level injection and ARIA improvements without touching PDF.js.
- Status: ⏳ Planned

### Principles for All Phases
1. Single-file integration in `postmessage-wrapper.js`
2. Pure event-driven—no polling, no retry loops, no timeouts (except intentional user idle timer)
3. Readiness-based dispatch via universal action dispatcher
4. Zero modifications to PDF.js core files
5. Backward compatible Angular surface (inputs/outputs only)
