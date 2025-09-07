# Custom CSS Examples for ng2-pdfjs-viewer

This document provides examples of how to use the Custom CSS feature to customize the appearance of the PDF viewer beyond the built-in theme options.

## Table of Contents

- [Getting Started](#getting-started)
- [Simple Examples](#simple-examples)
- [Intermediate Examples](#intermediate-examples)
- [Advanced Examples](#advanced-examples)
- [Common Selectors](#common-selectors)
- [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### How to Use Custom CSS

1. Open your ng2-pdfjs-viewer application
2. Navigate to **Individual Properties** → **Theme & Visual Customization** → **Custom CSS**
3. Enter your CSS code in the text area
4. Changes apply immediately

### Important Notes

- Always use `!important` to override PDF.js default styles
- Test changes incrementally
- Use browser DevTools (F12) to inspect elements and test CSS

---

## Simple Examples

### 1. Change PDF Page Border

```css
.page {
  border: 3px solid #ff6b6b !important;
  border-radius: 8px !important;
}
```

### 2. Basic Toolbar Styling

```css
#toolbarContainer {
  background-color: #3498db !important;
  color: white !important;
}
```

### 3. Highlight Toolbar Buttons

```css
.toolbarButton {
  background-color: #e74c3c !important;
  color: white !important;
  border-radius: 4px !important;
}
```

### 4. Simple Page Shadow

```css
.page {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}
```

### 5. Basic Sidebar Styling

```css
#sidebarContainer {
  background-color: #2c3e50 !important;
  color: #ecf0f1 !important;
}
```

---

## Intermediate Examples

### 6. Gradient Toolbar

```css
#toolbarContainer {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
  border-radius: 10px !important;
  margin: 5px !important;
}

.toolbarButton {
  color: white !important;
  font-weight: bold !important;
}
```

### 7. Enhanced Button Hover Effects

```css
.toolbarButton {
  background-color: #3498db !important;
  color: white !important;
  border-radius: 8px !important;
  margin: 2px !important;
  transition: all 0.3s ease !important;
}

.toolbarButton:hover {
  background-color: #2980b9 !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
}
```

### 8. Custom Input Field Styling

```css
.toolbarField {
  background: #3498db !important;
  color: white !important;
  border: 2px solid #2980b9 !important;
  border-radius: 20px !important;
  padding: 5px 10px !important;
}

.toolbarField:focus {
  background: #2980b9 !important;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.5) !important;
}
```

### 9. Animated Page Hover

```css
.page {
  transition: all 0.3s ease !important;
  cursor: pointer !important;
}

.page:hover {
  transform: scale(1.02) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3) !important;
}
```

### 10. Styled Secondary Toolbar

```css
#secondaryToolbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 8px !important;
  border: none !important;
}

#secondaryToolbar .toolbarButton {
  color: white !important;
  border-radius: 6px !important;
}
```

---

## Advanced Examples

### 11. Complete Dark Theme Override

```css
/* Main container */
#viewerContainer {
  background: #1a1a1a !important;
  color: #ffffff !important;
}

/* PDF pages with invert filter */
.page {
  background: #2d2d2d !important;
  filter: invert(0.9) hue-rotate(180deg) !important;
  border: 1px solid #444 !important;
}

/* Toolbar dark styling */
#toolbarContainer {
  background: #333333 !important;
  color: #ffffff !important;
  border-bottom: 1px solid #555 !important;
}

/* Sidebar dark styling */
#sidebarContainer {
  background: #2c2c2c !important;
  color: #ffffff !important;
}

/* Input fields */
.toolbarField {
  background: #444 !important;
  color: #fff !important;
  border: 1px solid #666 !important;
}
```

### 12. Custom Scrollbar

```css
/* Webkit scrollbar styling */
#viewerContainer::-webkit-scrollbar {
  width: 12px !important;
}

#viewerContainer::-webkit-scrollbar-track {
  background: #f1f1f1 !important;
  border-radius: 10px !important;
}

#viewerContainer::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
  border-radius: 10px !important;
}

#viewerContainer::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #ff5252, #26a69a) !important;
}
```

### 13. Animated Loading Overlay

```css
/* Hide default spinner */
.ng2-pdf-spinner {
  opacity: 0 !important;
}

/* Custom loading overlay */
#viewerContainer::before {
  content: "" !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: rgba(0, 0, 0, 0.8) !important;
  z-index: 1000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

#viewerContainer::after {
  content: "🚀 Loading PDF..." !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  color: white !important;
  font-size: 24px !important;
  z-index: 1001 !important;
  animation: pulse 1.5s infinite !important;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

### 14. Glassmorphism Effect

```css
#toolbarContainer {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 15px !important;
  margin: 10px !important;
}

.toolbarButton {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(5px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  color: rgba(0, 0, 0, 0.8) !important;
}

.toolbarButton:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) !important;
}
```

### 15. Neon Glow Theme

```css
/* Dark background */
#viewerContainer {
  background: #0a0a0a !important;
}

/* Neon toolbar */
#toolbarContainer {
  background: #1a1a1a !important;
  border: 2px solid #00ffff !important;
  border-radius: 10px !important;
  box-shadow: 0 0 20px #00ffff !important;
}

/* Neon buttons */
.toolbarButton {
  background: transparent !important;
  color: #00ffff !important;
  border: 1px solid #00ffff !important;
  border-radius: 5px !important;
  text-shadow: 0 0 10px #00ffff !important;
  transition: all 0.3s ease !important;
}

.toolbarButton:hover {
  background: #00ffff !important;
  color: #000 !important;
  box-shadow: 0 0 15px #00ffff !important;
}

/* Neon pages */
.page {
  border: 1px solid #ff00ff !important;
  box-shadow: 0 0 15px #ff00ff !important;
  background: #111 !important;
}
```

---

## Common Selectors

### Main Containers

- `#viewerContainer` - Main PDF viewing area
- `#outerContainer` - Outermost container
- `#mainContainer` - Main content container

### Toolbar Elements

- `#toolbarContainer` - Main toolbar
- `#toolbarViewer` - Toolbar viewer section
- `#toolbarViewerLeft` - Left toolbar section
- `#toolbarViewerMiddle` - Middle toolbar section
- `#toolbarViewerRight` - Right toolbar section
- `.toolbarButton` - All toolbar buttons
- `.toolbarField` - Input fields in toolbar
- `#secondaryToolbar` - Secondary (right-click) toolbar

### PDF Content

- `.page` - Individual PDF pages
- `.pdfViewer` - PDF viewer container
- `.textLayer` - Text selection layer
- `.annotationLayer` - Annotation layer

### Sidebar Elements

- `#sidebarContainer` - Sidebar container
- `#sidebarContent` - Sidebar content area
- `#thumbnailView` - Thumbnail view
- `#outlineView` - Outline/bookmarks view

### Specific Buttons (Examples)

- `#zoomIn` - Zoom in button
- `#zoomOut` - Zoom out button
- `#pageNumber` - Page number input
- `#scaleSelect` - Zoom level dropdown
- `#sidebarToggle` - Sidebar toggle button

---

## Tips and Best Practices

### 1. Always Use `!important`

PDF.js has high CSS specificity, so you need `!important` to override:

```css
.toolbarButton {
  background: red !important; /* ✅ Works */
  background: red; /* ❌ Might not work */
}
```

### 2. Target Specific Elements

Use specific selectors to avoid breaking functionality:

```css
/* ✅ Good - specific */
#toolbarContainer .toolbarButton {
}

/* ❌ Bad - too broad */
button {
}
```

### 3. Test Incrementally

Start with simple changes and build up:

```css
/* Start with this */
.page {
  border: 2px solid red !important;
}

/* Then add more */
.page {
  border: 2px solid red !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
}
```

### 4. Use Browser DevTools

1. Press `F12` to open DevTools
2. Go to **Elements** tab
3. Inspect PDF viewer elements
4. Find the right selectors
5. Test CSS live before adding to Custom CSS

### 5. Consider Performance

Avoid expensive CSS operations on frequently changing elements:

```css
/* ❌ Expensive - avoid on scroll elements */
.page {
  filter: blur(2px) drop-shadow(0 0 10px red) !important;
}

/* ✅ Better - simple properties */
.page {
  border: 1px solid red !important;
  background: #f0f0f0 !important;
}
```

### 6. Responsive Design

Consider different screen sizes:

```css
/* Desktop styles */
.toolbarButton {
  padding: 8px !important;
}

/* Mobile styles */
@media (max-width: 768px) {
  .toolbarButton {
    padding: 4px !important;
    font-size: 12px !important;
  }
}
```

### 7. Animation Best Practices

Use CSS animations sparingly and make them smooth:

```css
.toolbarButton {
  transition: all 0.2s ease !important; /* Keep transitions short */
}

.page {
  transition: transform 0.3s ease !important; /* Smooth transforms */
}

/* Avoid animating expensive properties like box-shadow constantly */
```

---

## Troubleshooting

### CSS Not Applying?

1. Check for typos in selectors
2. Add `!important` to your rules
3. Use more specific selectors
4. Check browser console for CSS errors

### Styles Overridden?

1. Increase CSS specificity
2. Use `!important`
3. Check if other custom CSS conflicts

### Performance Issues?

1. Avoid complex filters and effects
2. Limit animations
3. Use simple selectors
4. Test with large PDF files

---

_This documentation covers the most common and useful Custom CSS examples for ng2-pdfjs-viewer. Experiment with these examples and combine them to create your unique PDF viewer appearance!_
