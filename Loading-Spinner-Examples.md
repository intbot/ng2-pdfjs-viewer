# Loading Spinner Custom HTML Examples

This document provides ready-to-use custom HTML samples for the ng2-pdfjs-viewer loading spinner customization feature.

## How to Use These Examples

### In Your Angular Application:

1. **Set the `spinnerHtml` input** on the `ng2-pdfjs-viewer` component:
   ```html
   <ng2-pdfjs-viewer 
     [pdfSrc]="myPdfSource"
     [spinnerHtml]="customSpinnerHtml"
     [showSpinner]="true">
   </ng2-pdfjs-viewer>
   ```

2. **In your component TypeScript**, set the custom HTML:
   ```typescript
   export class MyComponent {
     customSpinnerHtml = `
       <div style="text-align: center;">
         <div class="ng2-spinner-spin" style="font-size: 48px; margin-bottom: 16px;">⚙️</div>
         <div style="color: #2196F3; font-size: 16px;">Loading PDF...</div>
       </div>
     `;
   }
   ```

### In the SampleApp (for testing):

1. **Turn ON "Use Custom HTML"**
2. **Paste the HTML** into the "Custom Spinner HTML" textarea  
3. **Click "Reload Viewer"** to see your custom spinner

## ✨ Animation Classes Available

The library provides built-in animation classes that work out-of-the-box:

- **`ng2-spinner-spin`** - Continuous rotation (2s duration)
- **`ng2-spinner-pulse`** - Scale pulsing effect (1.4s duration)
- **`ng2-spinner-pulse-1`** - Pulse with 0.16s delay
- **`ng2-spinner-pulse-2`** - Pulse with 0.32s delay
- **`ng2-spinner-bounce`** - Bouncing scale effect (1.4s duration)
- **`ng2-spinner-bounce-1`** - Bounce with 0.16s delay
- **`ng2-spinner-bounce-2`** - Bounce with 0.32s delay
- **`ng2-spinner-fade`** - Fade in/out effect (1.5s duration)
- **`ng2-spinner-fade-1`** - Fade with 0.3s delay
- **`ng2-spinner-fade-2`** - Fade with 0.6s delay
- **`ng2-spinner-progress`** - Sliding progress bar effect (2s duration)
- **`ng2-spinner-float`** - Floating up/down motion (2s duration)

> **Note**: These animations are automatically injected globally by the library component. No additional setup required!

---

## 1. Simple & Clean

Perfect for minimalist designs.

```html
<div style="text-align: center; color: #333;">
  <div style="font-size: 32px; margin-bottom: 16px;">📄</div>
  <div style="font-size: 18px; font-weight: 500;">Loading PDF...</div>
  <div style="font-size: 14px; color: #666; margin-top: 8px;">Please wait</div>
</div>
```

---

## 2. Animated Rotating Icon

Spinning gear animation for a technical feel.

```html
<div style="text-align: center;">
  <div class="ng2-spinner-spin" style="font-size: 48px; margin-bottom: 16px;">⚙️</div>
  <div style="color: #2196F3; font-size: 16px; font-weight: 500;">Processing PDF Document</div>
</div>
```

---

## 3. Pulsing Dots Animation

Three dots with staggered pulsing animation.

```html
<div style="text-align: center;">
  <div style="display: inline-flex; gap: 8px; margin-bottom: 20px;">
    <div class="ng2-spinner-pulse" style="width: 12px; height: 12px; background: #2196F3; border-radius: 50%;"></div>
    <div class="ng2-spinner-pulse-1" style="width: 12px; height: 12px; background: #4ECDC4; border-radius: 50%;"></div>
    <div class="ng2-spinner-pulse-2" style="width: 12px; height: 12px; background: #45B7D1; border-radius: 50%;"></div>
  </div>
  <div style="color: #555; font-size: 16px;">Loading PDF...</div>
</div>
```

---

## 4. Modern Card Design

Professional card-style loading with shadow and rounded corners.

```html
<div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center; max-width: 300px; margin: 0 auto;">
  <div class="ng2-spinner-spin" style="width: 48px; height: 48px; border: 4px solid #f3f3f3; border-top: 4px solid #2196F3; border-radius: 50%; margin: 0 auto 24px;"></div>
  <h3 style="margin: 0 0 8px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Loading PDF</h3>
  <p style="margin: 0; color: #666; font-size: 14px;">Preparing your document...</p>
</div>
```

---

## 5. Progress Bar Style

Animated progress bar with sliding gradient effect.

```html
<div style="text-align: center; color: #333;">
  <div style="font-size: 24px; margin-bottom: 16px;">📖</div>
  <div style="font-size: 16px; margin-bottom: 16px;">Loading PDF Document</div>
  <div style="width: 200px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 0 auto; overflow: hidden;">
    <div class="ng2-spinner-progress" style="width: 50px; height: 100%; background: linear-gradient(90deg, #2196F3, #21CBF3); border-radius: 2px;"></div>
  </div>
</div>
```

---

## 6. Bouncing Animation

Colorful bouncing dots with playful animation.

```html
<div style="text-align: center;">
  <div style="display: inline-flex; gap: 4px; margin-bottom: 20px;">
    <div class="ng2-spinner-bounce" style="width: 16px; height: 16px; background: #FF6B6B; border-radius: 50%;"></div>
    <div class="ng2-spinner-bounce-1" style="width: 16px; height: 16px; background: #4ECDC4; border-radius: 50%;"></div>
    <div class="ng2-spinner-bounce-2" style="width: 16px; height: 16px; background: #45B7D1; border-radius: 50%;"></div>
  </div>
  <div style="color: #555; font-size: 16px;">Loading your PDF...</div>
</div>
```

---

## 7. Corporate/Branded Style

Professional gradient design perfect for branded applications.

```html
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);">
  <div class="ng2-spinner-spin" style="width: 60px; height: 60px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; margin: 0 auto 24px;"></div>
  <h2 style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600;">Your Company</h2>
  <p style="margin: 0; opacity: 0.9; font-size: 16px;">Loading PDF Document</p>
  <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">Please wait while we prepare your file</div>
</div>
```

---

## 8. Minimalist Dots

Clean, simple fading dots animation.

```html
<div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="font-size: 18px; color: #333; margin-bottom: 20px;">Loading</div>
  <div style="display: inline-flex; gap: 6px;">
    <div class="ng2-spinner-fade" style="width: 8px; height: 8px; background: #333; border-radius: 50%;"></div>
    <div class="ng2-spinner-fade-1" style="width: 8px; height: 8px; background: #333; border-radius: 50%;"></div>
    <div class="ng2-spinner-fade-2" style="width: 8px; height: 8px; background: #333; border-radius: 50%;"></div>
  </div>
</div>
```

---

## 9. File Icon Animation

Floating document icon with gentle bounce animation.

```html
<div style="text-align: center;">
  <div class="ng2-spinner-float" style="font-size: 64px; margin-bottom: 16px;">📄</div>
  <div style="color: #2196F3; font-size: 18px; font-weight: 500; margin-bottom: 8px;">Processing PDF</div>
  <div style="color: #666; font-size: 14px;">This may take a few moments</div>
</div>
```

---

## 10. Rainbow Loading

Colorful rotating rainbow circle for a vibrant look.

```html
<div style="text-align: center;">
  <div class="ng2-spinner-spin" style="display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff0080, #ff0000); margin-bottom: 20px;"></div>
  <div style="color: #333; font-size: 16px; font-weight: 500;">Loading PDF...</div>
  <div style="color: #666; font-size: 12px; margin-top: 8px;">Preparing your document</div>
</div>
```

---

## Customization Tips

### Colors
- Change hex codes (`#2196F3`) to match your brand colors
- Use CSS variables for consistent theming
- Consider accessibility with sufficient color contrast

### Company Branding
- Replace "Your Company" with your actual company name
- Add your logo as a background image or inline SVG
- Use your brand's color palette

### Icons & Symbols
- **Document icons**: 📄, 📊, 📋, 📖, 📃
- **Loading icons**: ⚙️, 🔄, ⚡, 🔧, ⏳
- **Progress icons**: ⏱️, 📈, 🎯, 💫, ✨

### Typography
- Add your custom font families
- Adjust font weights and sizes
- Consider different font stacks for better compatibility

### Responsive Design
- Use relative units (`em`, `rem`, `%`) for better scaling
- Test on different screen sizes
- Consider mobile-specific adjustments

---

## Animation Properties Reference

### Duration
- `1s` - Fast animation (good for attention-grabbing)
- `2s` - Medium speed (balanced)
- `3s` - Slow animation (calming effect)

### Timing Functions
- `linear` - Constant speed
- `ease-in-out` - Smooth acceleration and deceleration
- `ease` - Natural easing
- `cubic-bezier(0.25, 0.46, 0.45, 0.94)` - Custom curves

### Animation Delays
- Use negative delays (`animation-delay: -0.16s`) for staggered effects
- Positive delays (`animation-delay: 0.5s`) for sequential animations

### Iteration Count
- `infinite` - Continuous animation
- `3` - Repeat specific number of times
- `1` - Play once

---

## Advanced Techniques

### Combining Animations
```css
animation: spin 2s linear infinite, pulse 1s ease-in-out infinite alternate;
```

### CSS Variables for Dynamic Theming
```css
:root {
  --primary-color: #2196F3;
  --secondary-color: #FFC107;
}
```

### Media Queries for Responsive Design
```css
@media (max-width: 768px) {
  .spinner { font-size: 14px; }
}
```

### Reduced Motion Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Testing Your Custom Spinners

1. **Use the "Reload Viewer" button** in the Loading & Spinner Customization section
2. **Enable network throttling** in browser dev tools to see spinner longer
3. **Test on different devices** and screen sizes
4. **Verify accessibility** with screen readers
5. **Check console logs** for any errors

---

## Best Practices

- **Keep animations smooth** - avoid janky or CPU-intensive effects
- **Provide meaningful feedback** - let users know what's happening
- **Match your brand** - use consistent colors and typography
- **Consider accessibility** - respect `prefers-reduced-motion` settings
- **Test performance** - ensure animations don't impact loading speed
- **Mobile-first** - design for smaller screens first

---

## Technical Implementation

### How Animation Classes Work

The `ng2-spinner-*` animation classes are **automatically injected** into the document `<head>` when the `ng2-pdfjs-viewer` component initializes. This ensures:

- ✅ **Zero setup required** - Works out-of-the-box in any Angular application
- ✅ **Global availability** - Classes work in custom HTML via `[innerHTML]` 
- ✅ **Single injection** - Prevents duplicate styles (checked by unique ID)
- ✅ **NPM package ready** - No external dependencies needed

### Browser Compatibility

All animations use standard CSS `@keyframes` and are compatible with:
- Chrome 43+
- Firefox 16+
- Safari 9+
- Edge 12+

### Performance Notes

- Animations use `transform` and `opacity` for optimal performance
- Hardware acceleration is automatically applied
- No JavaScript-based animations (pure CSS)
- Respects user's `prefers-reduced-motion` settings (when implemented)

---

*Happy customizing! 🎨*
