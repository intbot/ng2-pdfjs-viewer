import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PdfAiAssistant } from "../src/utils/PdfAiAssistant";

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
});
