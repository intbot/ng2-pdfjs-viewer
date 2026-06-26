import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PdfAiAssistant } from "../ai";

const PAGES = [
  { page: 1, text: "First page text." },
  { page: 2, text: "Second page text." },
];

function okResponse(content: string) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  } as Response;
}

// A fake OpenAI-style Server-Sent Events response. `frames` are raw wire chunks
// (a single SSE line may be split across two frames to exercise buffering).
function sseResponse(frames: string[]): Response {
  const encoder = new TextEncoder();
  let i = 0;
  return {
    ok: true,
    headers: { get: (h: string) => (/content-type/i.test(h) ? "text/event-stream" : null) },
    body: {
      getReader() {
        return {
          read: async () =>
            i < frames.length
              ? { done: false, value: encoder.encode(frames[i++]) }
              : { done: true, value: undefined },
          releaseLock() {},
        };
      },
    },
  } as unknown as Response;
}

describe("PdfAiAssistant", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires an endpoint", () => {
    expect(() => new PdfAiAssistant({ endpoint: "" })).toThrow(/endpoint/);
  });

  it("never touches the network at construction time (BYO guarantee)", () => {
    new PdfAiAssistant({ endpoint: "https://example.test/v1/chat/completions" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends an OpenAI-compatible payload with document context and page tags", async () => {
    fetchMock.mockResolvedValue(okResponse("It is a test."));
    const ai = new PdfAiAssistant({
      endpoint: "https://example.test/v1/chat/completions",
      apiKey: "sk-test",
      model: "test-model",
    });

    const answer = await ai.ask("What is this?", PAGES);

    expect(answer).toBe("It is a test.");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.test/v1/chat/completions");
    expect(init.headers["Authorization"]).toBe("Bearer sk-test");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("test-model");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toContain("[page 1]");
    expect(body.messages[0].content).toContain("Second page text.");
    expect(body.messages.at(-1)).toEqual({
      role: "user",
      content: "What is this?",
    });
  });

  it("carries multi-turn history between system and user messages", async () => {
    fetchMock.mockResolvedValue(okResponse("ok"));
    const ai = new PdfAiAssistant({ endpoint: "https://e.test/c" });

    await ai.ask("follow-up", PAGES, [
      { role: "user", content: "first question" },
      { role: "assistant", content: "first answer" },
    ]);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages.map((m: any) => m.role)).toEqual([
      "system",
      "user",
      "assistant",
      "user",
    ]);
  });

  it("truncates document context at maxContextChars", async () => {
    fetchMock.mockResolvedValue(okResponse("ok"));
    const ai = new PdfAiAssistant({
      endpoint: "https://e.test/c",
      maxContextChars: 30,
    });

    await ai.ask("q", [
      { page: 1, text: "x".repeat(20) },
      { page: 2, text: "y".repeat(500) },
    ]);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0].content).toContain("[truncated at 30 characters]");
    expect(body.messages[0].content).not.toContain("yyyyy");
  });

  it("throws a useful error on non-2xx responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "bad key",
    } as unknown as Response);
    const ai = new PdfAiAssistant({ endpoint: "https://e.test/c" });

    await expect(ai.ask("q", PAGES)).rejects.toThrow(/401.*bad key/s);
  });

  it("throws on unexpected response shapes", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: true }),
    } as unknown as Response);
    const ai = new PdfAiAssistant({ endpoint: "https://e.test/c" });

    await expect(ai.summarize(PAGES)).rejects.toThrow(/unexpected response/);
  });

  it("merges custom headers (Azure-style api-key)", async () => {
    fetchMock.mockResolvedValue(okResponse("ok"));
    const ai = new PdfAiAssistant({
      endpoint: "https://e.test/c",
      headers: { "api-key": "azure-key" },
    });

    await ai.complete([{ role: "user", content: "hi" }]);

    expect(fetchMock.mock.calls[0][1].headers["api-key"]).toBe("azure-key");
  });

  it("streams tokens via onToken and returns the full text", async () => {
    // The second frame's `data:` line is split across two reads to exercise buffering.
    fetchMock.mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" wo',
        'rld"}}]}\n\n',
        "data: [DONE]\n\n",
      ])
    );
    const ai = new PdfAiAssistant({ endpoint: "https://e.test/c" });

    const deltas: string[] = [];
    const answer = await ai.ask("q", PAGES, [], undefined, (_full, delta) =>
      deltas.push(delta)
    );

    expect(answer).toBe("Hello world");
    expect(deltas).toEqual(["Hello", " world"]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true);
  });

  it("falls back to a single response when the endpoint does not stream", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ choices: [{ message: { content: "Full answer." } }] }),
    } as unknown as Response);
    const ai = new PdfAiAssistant({ endpoint: "https://e.test/c" });

    const fulls: string[] = [];
    const answer = await ai.ask("q", PAGES, [], undefined, (full) => fulls.push(full));

    expect(answer).toBe("Full answer.");
    expect(fulls).toEqual(["Full answer."]); // emitted once so streaming UIs still update
  });

  it("does not request streaming without an onToken callback", async () => {
    fetchMock.mockResolvedValue(okResponse("ok"));
    const ai = new PdfAiAssistant({ endpoint: "https://e.test/c" });

    await ai.ask("q", PAGES);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBeUndefined();
  });
});
