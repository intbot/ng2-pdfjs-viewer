---
description: "Read PDFs aloud in Angular with sentence-by-sentence text-to-speech and in-page word highlighting."
keywords: [angular pdf text to speech, read pdf aloud angular, pdf tts angular, accessibility read aloud]
---

# Read Aloud (Text-to-Speech)

Have the browser read the open PDF out loud — an accessibility win for low-vision and
dyslexic users, and a hands-free reading mode for everyone else.

Read Aloud is built entirely on the browser's native `speechSynthesis` API. **No network
requests, no cloud TTS service, no audio leaves the machine.** The viewer extracts the
text, the browser speaks it.

## How It Works

- The document is read **sentence by sentence**, one utterance per sentence (which also
  sidesteps browser limits on very long utterances).
- The sentence currently being spoken is **highlighted in the page's text layer**, so
  listeners can follow along visually.
- Reading proceeds **page by page**: when a page is finished the viewer navigates to the
  next page and continues, following the reading position until the end of the document.
- If a page's text layer isn't rendered in time, the viewer falls back to plain extracted
  text for that page — it still reads, just without the visual highlight.
- Pages with no extractable text (e.g. image-only pages) are skipped.

## API

Four methods control playback:

```typescript
viewer.startReadAloud(options?: { fromPage?: number; rate?: number });
viewer.pauseReadAloud();
viewer.resumeReadAloud();
viewer.stopReadAloud();
```

All four return `Promise<ActionExecutionResult>`.

| `startReadAloud` option | Type     | Default          | Description                                          |
| ----------------------- | -------- | ---------------- | ---------------------------------------------------- |
| `fromPage`              | `number` | the current page | 1-based page to start reading from                   |
| `rate`                  | `number` | `1`              | Speech rate, passed to `SpeechSynthesisUtterance.rate` |

## Tracking Progress: `(onReadAloudStateChange)`

Playback progress arrives on the `onReadAloudStateChange` output as `ReadAloudState`
events:

```typescript
interface ReadAloudState {
  status: 'reading' | 'paused' | 'stopped' | 'finished' | 'error';
  page: number;
  sentence?: string;
}
```

| Status       | When it fires                                                                  |
| ------------ | ------------------------------------------------------------------------------ |
| `'reading'`  | For **each sentence** as it starts, with `sentence` set to its text (also after a resume, without `sentence`) |
| `'paused'`   | After `pauseReadAloud()`                                                       |
| `'stopped'`  | After `stopReadAloud()`                                                        |
| `'finished'` | Reading ran past the last page                                                 |
| `'error'`    | Speech synthesis failed                                                        |

`page` always carries the page currently being read.

## Example: A Read-Aloud Player

Player controls bound to the API, with the UI driven by state events:

```typescript
import { Component, ViewChild } from '@angular/core';
import { PdfJsViewerComponent, ReadAloudState } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
})
export class ReaderComponent {
  @ViewChild('viewer') viewer!: PdfJsViewerComponent;

  status: ReadAloudState['status'] = 'stopped';
  currentPage = 0;
  currentSentence = '';

  onTtsState(state: ReadAloudState): void {
    this.status = state.status;
    this.currentPage = state.page;
    if (state.sentence) {
      this.currentSentence = state.sentence;
    }
  }
}
```

```html
<div class="tts-player">
  <button (click)="viewer.startReadAloud({ rate: 1.1 })"
          [disabled]="status === 'reading'">
    ▶ Play
  </button>
  <button (click)="viewer.pauseReadAloud()"
          [disabled]="status !== 'reading'">
    ⏸ Pause
  </button>
  <button (click)="viewer.resumeReadAloud()"
          [disabled]="status !== 'paused'">
    ⏵ Resume
  </button>
  <button (click)="viewer.stopReadAloud()"
          [disabled]="status === 'stopped' || status === 'finished'">
    ⏹ Stop
  </button>
  <span *ngIf="status === 'reading'">
    Reading page {{ currentPage }}: “{{ currentSentence }}”
  </span>
</div>

<ng2-pdfjs-viewer
  #viewer
  pdfSrc="assets/sample.pdf"
  (onReadAloudStateChange)="onTtsState($event)">
</ng2-pdfjs-viewer>
```

Starting from a specific page is just as direct:

```typescript
this.viewer.startReadAloud({ fromPage: 5, rate: 0.9 });
```

## Browser Support

Read Aloud depends on `window.speechSynthesis`:

- It is widely available in modern browsers, but **voices, languages, and voice quality
  vary** by browser and operating system — the same document will sound different in
  Chrome on Windows than in Safari on macOS.
- The browser's default voice is used; there is currently no voice-selection option
  (`rate` is the only tuning knob).
- If speech synthesis isn't available at all, `startReadAloud()` fails with
  "Speech synthesis not supported in this browser" — treat the feature as progressive
  enhancement and hide your player controls when it's unavailable.

## Related

- [AI Assistant (Bring Your Own Endpoint)](./ai-assistant) — chat with the document, also with zero default network activity
- [Custom Toolbar, Sidebar & Page Overlays](./custom-ui) — put your player controls in a custom toolbar
- [API Reference: Output Events](../api/component-outputs) — all viewer events
- [Features Overview](./overview) — everything the viewer can do
