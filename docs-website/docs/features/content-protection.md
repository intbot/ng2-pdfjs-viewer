# Content Protection

Discourage casual copying of documents: block the print and download paths, disable text selection, and stamp a watermark on every page — all from a single `[contentProtection]` input.

:::warning Deterrence, not DRM
Content protection is **client-side deterrence, not digital rights management**. The PDF bytes still travel to the user's browser, and a determined user can always retrieve them — from the network tab, devtools, or a script. Use these options to discourage casual copying and to mark documents as confidential, not to enforce access control. Real protection happens on the server: authentication, time-limited signed URLs, and not serving the document to users who shouldn't have it.
:::

## The contentProtection Input

`[contentProtection]` takes a `ContentProtectionConfig`:

```typescript
interface ContentProtectionConfig {
  blockPrint?: boolean;
  blockDownload?: boolean;
  disableTextSelection?: boolean;
  watermark?: WatermarkConfig | null;
}
```

```typescript
export class MyComponent {
  protection: ContentProtectionConfig = {
    blockPrint: true,
    blockDownload: true,
    disableTextSelection: true,
    watermark: {
      text: 'CONFIDENTIAL',
    },
  };
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/confidential.pdf"
  [contentProtection]="protection">
</ng2-pdfjs-viewer>
```

### Blocking print and download

- **`blockPrint: true`** hides the print button *and* blocks the print path inside the viewer (including the keyboard shortcut / `window.print` route).
- **`blockDownload: true`** hides the download button and blocks save shortcuts.

Setting either flag also toggles the corresponding toolbar button automatically — you don't need to set `showPrint`/`showDownload` separately.

### Disabling text selection

`disableTextSelection: true` prevents selecting (and therefore copy/pasting) page text. Note this also affects legitimate uses of selection, and screen readers that rely on the text layer still read the document — it stops the casual select-and-copy, nothing more.

## Watermarks

The `watermark` field renders a repeating text watermark on every page, including pages that render lazily as the user scrolls:

```typescript
interface WatermarkConfig {
  text: string;        // required
  color?: string;      // CSS color, default '#888888'
  opacity?: number;    // 0..1, default 0.25
  fontSize?: string;   // CSS font-size, default '48px'
  rotation?: number;   // degrees, default -35
}
```

```typescript
protection: ContentProtectionConfig = {
  watermark: {
    text: `CONFIDENTIAL — ${this.user.email}`,
    color: '#c0392b',
    opacity: 0.15,
    fontSize: '36px',
    rotation: -30,
  },
};
```

Per-user watermarks (name, email, timestamp) are a classic deterrent for leaked screenshots. To remove the watermark at runtime, set `watermark: null` in a new config object.

The watermark is drawn in the viewer UI — it is **not baked into the PDF bytes**, so a downloaded copy of the original file does not carry it (another reason to pair it with `blockDownload`).

## Lighter Option: Hiding Toolbar Buttons

If you only want a cleaner UI — not active blocking — hide the buttons individually instead:

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/sample.pdf"
  [showDownload]="false"
  [showPrint]="false">
</ng2-pdfjs-viewer>
```

This removes the affordances but doesn't block keyboard shortcuts or programmatic paths the way `contentProtection` does. Both `showDownload` and `showPrint` default to `true`.

## Related

- [Loading Documents](./loading-documents) — authenticated loading and signed URLs (the server-side half of protection)
- [Security Features](./security)
- [iframe Security](./iframe-security)
- [Component Inputs](../api/component-inputs)
