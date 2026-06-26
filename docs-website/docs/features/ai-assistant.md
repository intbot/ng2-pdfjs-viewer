---
description: "A built-in PDF AI assistant for Angular that calls your own OpenAI-compatible endpoint with clickable page citations. No backend to run; the library makes no vendor calls."
keywords: [angular pdf ai assistant, chat with pdf angular, pdf ai angular, openai pdf angular]
---

# AI Assistant (Bring Your Own Endpoint)

Chat with the open PDF — using **your** AI endpoint, **your** key, and **no vendor backend**.

The most important thing to understand about this feature is what it does *not* do:

- The library **never calls any AI service on its own**. There is no bundled API key, no
  default endpoint, no telemetry. If you don't configure an endpoint, no AI-related network
  request is ever made.
- You point it at **any OpenAI-compatible `/chat/completions` endpoint**: OpenAI, Azure
  OpenAI, Ollama, vLLM, LM Studio, or any gateway/proxy that speaks the same protocol.
- Everything runs **client-side**. The component extracts the document's text from the
  PDF.js text layer, builds the prompt in the browser, and sends a single `fetch` to the
  endpoint you configured. Your PDF text goes to your endpoint and nowhere else.

This means you can run fully private setups (a local Ollama model — the PDF text never
leaves the machine) or production setups behind your own server-side proxy.

## Where the request runs: choose local or a proxy

`PdfAiAssistant` sends its `fetch` from wherever you construct it — in an Angular app, that is
**the user's browser**. Pointing `endpoint` *directly* at a hosted cloud LLM (OpenAI, Azure
OpenAI, …) from the browser has two problems:

- **Your API key is exposed.** Anything shipped to the browser is readable by whoever opens
  devtools. A long-lived cloud key in client code is a leak, not a secret.
- **CORS will usually block the call anyway.** Hosted LLM APIs don't return the
  `Access-Control-Allow-Origin` headers a browser requires for cross-origin requests, so the
  `fetch` fails before it ever reaches the model. (Azure OpenAI and OpenAI both reject direct
  browser calls.)

So pick one of these — don't call a cloud provider straight from the browser:

| Setup | `endpoint` points at | Key location | Best for |
| --- | --- | --- | --- |
| **Local model** | a local runtime — Ollama, LM Studio | none needed | private/offline use; the PDF text never leaves the machine. Start the runtime with browser origins allowed (e.g. Ollama's `OLLAMA_ORIGINS`). |
| **Your backend proxy** *(recommended for cloud models)* | a small route on *your* server that forwards to the provider | server-side only, never in the browser | production with a hosted model. The proxy injects the secret key, adds CORS, and can authenticate/rate-limit per user. |

A proxy is tiny — accept the request, attach your secret key, forward to the provider, return the
response:

```js
// POST /api/pdf-chat  — your server, key stays here
app.post('/api/pdf-chat', async (req, res) => {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_KEY}` },
    body: JSON.stringify(req.body),
  });
  res.status(r.status).send(await r.text());
});
```

```ts
// browser — no key in sight
new PdfAiAssistant({ endpoint: '/api/pdf-chat' });
```

## Built-in Chat Panel

Bind `[aiAssistantConfig]` to render a floating chat button in the bottom-right corner of
the viewer. Clicking it opens a chat panel where users can ask questions about the open
document.

```typescript
import { PdfAiPanelConfig } from 'ng2-pdfjs-viewer';

export class MyComponent {
  aiConfig: PdfAiPanelConfig = {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-...',          // sent as 'Authorization: Bearer <apiKey>'
    model: 'gpt-4o-mini',
    title: 'Ask this report',
  };
}
```

```html
<ng2-pdfjs-viewer
  pdfSrc="assets/report.pdf"
  [aiAssistantConfig]="aiConfig">
</ng2-pdfjs-viewer>
```

### PdfAiPanelConfig

| Option            | Type                     | Default                | Description                                                        |
| ----------------- | ------------------------ | ---------------------- | ------------------------------------------------------------------ |
| `endpoint`        | `string`                 | — (required)           | Full URL of an OpenAI-compatible `/chat/completions` endpoint      |
| `apiKey`          | `string`                 | —                      | Sent as `Authorization: Bearer <apiKey>` when provided             |
| `model`           | `string`                 | —                      | Model name passed in the request body                              |
| `headers`         | `Record<string, string>` | —                      | Extra request headers (e.g. Azure's `api-key`)                     |
| `maxContextChars` | `number`                 | `100000`               | Cap on document characters included in the prompt                  |
| `temperature`     | `number`                 | `0.2`                  | Sampling temperature                                               |
| `title`           | `string`                 | `'Ask this document'`  | Panel header text                                                  |
| `placeholder`     | `string`                 | `'Ask the document…'`  | Input placeholder                                                  |

### Clickable Page Citations

The system prompt instructs the model to cite page numbers like `[p.3]` when referencing
content. The panel parses those citations out of every answer and renders them as
**clickable chips** — clicking `p.3` jumps the viewer to page 3. This turns answers into
navigation: "Where is the termination clause?" → click the citation, land on the page.

### Asking Programmatically

`aiAsk(question)` goes through the exact same path as the panel's input — the question and
answer appear in the panel's conversation:

```typescript
@ViewChild('viewer') viewer!: PdfJsViewerComponent;

summarize(): Promise<void> {
  return this.viewer.aiAsk('Summarize this document in three bullet points.');
}
```

`aiAsk` requires `[aiAssistantConfig]` to be set, and one question runs at a time (calls
made while a request is in flight are ignored). Document text is extracted once per
document and reused across questions.

### Chat Lifecycle

The conversation is tied to the document. When the document changes (new `pdfSrc`, a
viewer reload), the chat **clears automatically** and any in-flight request is aborted —
a slow answer about the old document can never land in the new document's chat.

### Theming the Panel

The panel and its floating button are styled with CSS custom properties:

```css
ng2-pdfjs-viewer {
  --ng2-ai-accent: #0d9488;        /* button, header, citations, send button */
  --ng2-ai-bg: #ffffff;            /* panel background */
  --ng2-ai-text: #222222;          /* panel text color */
  --ng2-ai-question-bg: #e4f0fe;   /* user message bubbles */
  --ng2-ai-answer-bg: #f2f1f7;     /* assistant message bubbles */
  --ng2-ai-fab-color: #ffffff;     /* floating button icon color */
}
```

## Headless: PdfAiAssistant + getDocumentText()

If you want your own chat UI (or no chat at all — just a "Summarize" button), skip
`[aiAssistantConfig]` entirely and use the two lower-level building blocks:

- **`viewer.getDocumentText(from?, to?)`** — returns `Promise<DocumentPageText[]>`
  (`{ page: number; text: string }` per page), the plain text of the document or a
  1-based page range, extracted from the PDF.js text layer.
- **`PdfAiAssistant`** — a minimal OpenAI-compatible chat client, exported from the
  package:
  - `constructor(config: PdfAiAssistantConfig)` — same options as the panel config,
    minus `title`/`placeholder`; throws if `endpoint` is missing
  - `ask(question, documentText, history?, signal?, onToken?)` — answers a question
    about the document; `history` carries prior `PdfAiMessage` turns for multi-turn
    chat, `signal` is an `AbortSignal` for cancellation, and `onToken(full, delta)`
    streams the answer token-by-token (see [Streaming the answer](#streaming-the-answer))
  - `summarize(documentText)` — one-shot document summary
  - `complete(messages, signal?, onToken?)` — raw chat-completions call for fully
    custom prompting; also accepts `onToken` for streaming

### Example: Local Ollama + a Custom Summarize Button

A fully private setup — the model runs on `localhost`, so the document text never leaves
the machine:

```typescript
import { Component, ViewChild } from '@angular/core';
import { PdfJsViewerComponent, PdfAiAssistant } from 'ng2-pdfjs-viewer';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
})
export class ReportComponent {
  @ViewChild('viewer') viewer!: PdfJsViewerComponent;

  summary = '';
  busy = false;

  private ai = new PdfAiAssistant({
    endpoint: 'http://localhost:11434/v1/chat/completions', // Ollama
    model: 'llama3.2',
    // no apiKey needed for a local model
  });

  async summarize(): Promise<void> {
    this.busy = true;
    try {
      const text = await this.viewer.getDocumentText();
      this.summary = await this.ai.summarize(text);
    } finally {
      this.busy = false;
    }
  }
}
```

```html
<button (click)="summarize()" [disabled]="busy">
  {{ busy ? 'Summarizing…' : 'Summarize' }}
</button>
<p *ngIf="summary">{{ summary }}</p>

<ng2-pdfjs-viewer #viewer pdfSrc="assets/report.pdf"></ng2-pdfjs-viewer>
```

The same `PdfAiAssistant` config shape works for vLLM, LM Studio, and OpenAI-compatible
gateways — only the `endpoint` (and credentials) change.

### Streaming the answer

Pass an `onToken` callback (the last argument of `ask()` / `complete()`) to render the
answer as it arrives instead of waiting for the whole response. It fires once per token
with the running text and the latest delta; the Promise still resolves to the full answer:

```typescript
this.answer = '';
const full = await this.ai.ask(question, text, [], undefined, (running) => {
  this.answer = running; // re-renders on each token
});
// `full` is the complete answer; `this.answer` already holds it
```

Streaming is requested only when you pass `onToken`, and only if the endpoint supports
Server-Sent Events. If a provider ignores `stream`, the client falls back to a single
response and calls `onToken` once with the full text — the same code path works either
way. To force non-streaming even with a callback, set `stream: false` in the config.

The built-in chat panel (`[aiAssistantConfig]`) streams automatically: answers fill in
token-by-token with no extra setup.

## Honest Caveats

**Context stuffing, not RAG.** The assistant includes the document text directly in the
prompt as `[page N]` blocks, capped at `maxContextChars` (default 100,000 characters).
Very large documents are truncated at the cap — questions about content past the cutoff
won't be answerable. There is no chunking, embedding, or retrieval; for very large
corpora, build retrieval on top of `getDocumentText()` and use `complete()` for the
final call.

**Text extraction has limits.** `getDocumentText()` reads the PDF.js text layer, so
scanned/image-only PDFs yield little or no text — there is no OCR.

**Key handling and CORS.** The `apiKey` is sent only as an `Authorization: Bearer` header to
the endpoint *you* configured — nothing else sees it. But this is client-side code: any key
shipped to the browser is visible to that browser's user, and most hosted providers also block
direct browser calls via CORS. Don't point `endpoint` straight at a cloud LLM from the browser —
use a local model or a backend proxy. See [Where the request runs](#where-the-request-runs-choose-local-or-a-proxy).

**Embedded mode only.** The built-in panel is not rendered when the viewer runs in
external-window mode.

## Related

- [Read Aloud (Text-to-Speech)](./read-aloud) — the other no-network assistive feature
- [Custom Toolbar, Sidebar & Page Overlays](./custom-ui) — build your own AI UI into a custom toolbar or sidebar
- [Security Features](./security) — the viewer's broader security model
- [API Reference: Methods](../api/component-methods) — `aiAsk`, `getDocumentText`, and friends
