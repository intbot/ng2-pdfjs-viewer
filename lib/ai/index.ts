// Secondary entry point: ng2-pdfjs-viewer/ai
//
// A minimal bring-your-own-endpoint AI client for chat-with-PDF and
// summarization flows. The library NEVER talks to any AI service on its own:
// this class only sends requests when the host application calls it, to the
// endpoint the host application configured, with the host application's key.
//
// Works with any OpenAI-compatible chat-completions endpoint: OpenAI, Azure
// OpenAI, Anthropic-compatible gateways, Ollama, vLLM, LM Studio, etc.
//
// This is a headless, framework-free entry point — it imports nothing from
// Angular, so it can be used outside an Angular context (a worker, a Node
// service, a plain script). The full component re-exports these symbols from
// the package root for backwards compatibility.
//
// Usage:
//   import { PdfAiAssistant } from "ng2-pdfjs-viewer/ai";
//   const text = await viewer.getDocumentText();
//   const ai = new PdfAiAssistant({
//     endpoint: "http://localhost:11434/v1/chat/completions", // e.g. Ollama
//     model: "llama3.2",
//   });
//   const answer = await ai.ask("What is this document about?", text);

// Per-page document text — the shape returned by
// PdfJsViewerComponent.getDocumentText(). Declared locally so this entry point
// has no dependency on the component's type module.
export interface PdfPageText {
  page: number;
  text: string;
}

export interface PdfAiAssistantConfig {
  // Full URL of an OpenAI-compatible /chat/completions endpoint
  endpoint: string;
  // Sent as 'Authorization: Bearer <apiKey>' when provided
  apiKey?: string;
  model?: string;
  // Extra headers (e.g. Azure 'api-key')
  headers?: Record<string, string>;
  // Cap on document characters included in the prompt (default 100k)
  maxContextChars?: number;
  temperature?: number;
}

export interface PdfAiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Configuration for the component's built-in chat panel ([aiAssistantConfig]).
// Same endpoint semantics as PdfAiAssistantConfig - the panel never talks to
// any AI service except the one configured here.
export interface PdfAiPanelConfig extends PdfAiAssistantConfig {
  // Panel header text (default: 'Ask this document')
  title?: string;
  // Input placeholder (default: 'Ask the document…')
  placeholder?: string;
}

// One chat turn in the built-in AI panel. Assistant answers are split into
// `parts`: plain text runs and clickable [p.N] page citations.
export interface PdfAiPanelMessage {
  role: "user" | "assistant";
  content: string;
  error?: string;
  parts: Array<{ text?: string; page?: number }>;
}

export class PdfAiAssistant {
  private readonly config: PdfAiAssistantConfig;

  constructor(config: PdfAiAssistantConfig) {
    if (!config?.endpoint) {
      throw new Error("PdfAiAssistant requires an endpoint");
    }
    this.config = config;
  }

  /**
   * Ask a free-form question about the document. `documentText` is the output
   * of PdfJsViewerComponent.getDocumentText(); `history` carries prior turns
   * for multi-turn chat.
   */
  async ask(
    question: string,
    documentText: PdfPageText[],
    history: PdfAiMessage[] = [],
    signal?: AbortSignal
  ): Promise<string> {
    const context = this.buildContext(documentText);
    const messages: PdfAiMessage[] = [
      {
        role: "system",
        content:
          "You answer questions about the provided PDF document. " +
          "Cite page numbers like [p.3] when referencing content. " +
          "If the answer is not in the document, say so.\n\n" +
          `DOCUMENT:\n${context}`,
      },
      ...history,
      { role: "user", content: question },
    ];
    return this.complete(messages, signal);
  }

  /** One-shot document summary. */
  async summarize(documentText: PdfPageText[]): Promise<string> {
    return this.ask(
      "Summarize this document concisely. Lead with what it is, then the key points.",
      documentText
    );
  }

  /** Raw chat-completions call for custom prompting. */
  async complete(messages: PdfAiMessage[], signal?: AbortSignal): Promise<string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.config.headers ?? {}),
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    const response = await fetch(this.config.endpoint, {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify({
        model: this.config.model,
        temperature: this.config.temperature ?? 0.2,
        messages,
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `AI endpoint returned ${response.status}: ${body.slice(0, 300)}`
      );
    }
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("AI endpoint returned an unexpected response shape");
    }
    return content;
  }

  private buildContext(documentText: PdfPageText[]): string {
    const max = this.config.maxContextChars ?? 100_000;
    let out = "";
    for (const page of documentText ?? []) {
      const chunk = `[page ${page.page}]\n${page.text}\n\n`;
      if (out.length + chunk.length > max) {
        out += `\n[truncated at ${max} characters]`;
        break;
      }
      out += chunk;
    }
    return out;
  }
}
