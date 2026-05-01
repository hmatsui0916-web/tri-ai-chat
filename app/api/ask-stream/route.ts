import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Provider = "openai" | "anthropic" | "gemini" | "groq" | "together";
type ColumnId = string;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Histories = Partial<Record<ColumnId, ChatMessage[]>>;

type ColumnRequestConfig = {
  provider: Provider;
  model: string;
  label?: string;
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function sseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function doneEvent(provider: ColumnId): string {
  return sseData({ type: "done", provider });
}

function errorEvent(provider: ColumnId, message: string): string {
  return sseData({ type: "error", provider, message });
}

function deltaEvent(provider: ColumnId, text: string): string {
  return sseData({ type: "delta", provider, text });
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is ChatMessage => {
      return (
        item &&
        typeof item === "object" &&
        ((item as ChatMessage).role === "system" || (item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") &&
        typeof (item as ChatMessage).content === "string"
      );
    })
    .map((item) => ({ role: item.role, content: item.content }));
}

function splitSystem(messages: ChatMessage[]): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const systemMessages = messages.filter((message) => message.role === "system").map((message) => message.content.trim()).filter(Boolean);
  const normalMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role as "user" | "assistant", content: message.content }));
  return { system: systemMessages.join("\n\n"), messages: normalMessages };
}

async function readSseLines(response: Response, onData: (data: string) => void | Promise<void>): Promise<void> {
  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}${text ? `: ${text}` : ""}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const dataLines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s?/, ""));
      if (!dataLines.length) continue;
      const data = dataLines.join("\n");
      if (data === "[DONE]") continue;
      await onData(data);
    }
  }
}

async function streamOpenAI(columnId: ColumnId, model: string, messages: ChatMessage[], emit: (chunk: string) => Promise<void>) {
  const { system, messages: normalMessages } = splitSystem(messages);
  const input = [...(system ? [{ role: "system" as const, content: system }] : []), ...normalMessages];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${getEnv("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input, stream: true }),
  });

  await readSseLines(response, async (data) => {
    const event = JSON.parse(data) as { type?: string; delta?: string; error?: { message?: string } };
    if (event.type === "response.output_text.delta" && typeof event.delta === "string") await emit(deltaEvent(columnId, event.delta));
    if (event.type === "error") throw new Error(event.error?.message ?? "OpenAI stream error");
  });
}

async function streamClaude(columnId: ColumnId, model: string, messages: ChatMessage[], emit: (chunk: string) => Promise<void>) {
  const { system, messages: normalMessages } = splitSystem(messages);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": getEnv("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 2048, stream: true, ...(system ? { system } : {}), messages: normalMessages }),
  });

  await readSseLines(response, async (data) => {
    const event = JSON.parse(data) as { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } };
    if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && typeof event.delta.text === "string") {
      await emit(deltaEvent(columnId, event.delta.text));
    }
    if (event.type === "error") throw new Error(event.error?.message ?? "Claude stream error");
  });
}

async function streamGemini(columnId: ColumnId, model: string, messages: ChatMessage[], emit: (chunk: string) => Promise<void>) {
  const key = getEnv("GEMINI_API_KEY");
  const { system, messages: normalMessages } = splitSystem(messages);

  const contents = normalMessages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  const body: Record<string, unknown> = { contents };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}${text ? `: ${text}` : ""}`);
  }

  const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
  if (data.error?.message) throw new Error(data.error.message);
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  await emit(deltaEvent(columnId, text || "(empty response)"));
}

async function streamOpenAICompatibleChat(columnId: ColumnId, endpoint: string, apiKeyName: string, model: string, messages: ChatMessage[], emit: (chunk: string) => Promise<void>) {
  const { system, messages: normalMessages } = splitSystem(messages);
  const apiMessages = [...(system ? [{ role: "system" as const, content: system }] : []), ...normalMessages];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${getEnv(apiKeyName)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: apiMessages, stream: true, max_tokens: 2048 }),
  });

  await readSseLines(response, async (data) => {
    const event = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }>; error?: { message?: string } };
    if (event.error?.message) throw new Error(event.error.message);
    const delta = event.choices?.[0]?.delta?.content;
    if (delta) await emit(deltaEvent(columnId, delta));
  });
}

async function runProvider(columnId: ColumnId, config: ColumnRequestConfig, messages: ChatMessage[], emit: (chunk: string) => Promise<void>) {
  try {
    if (!messages.length) throw new Error("messages are required");
    if (!config.model) throw new Error("model is required");

    if (config.provider === "openai") {
      await streamOpenAI(columnId, config.model, messages, emit);
    } else if (config.provider === "anthropic") {
      await streamClaude(columnId, config.model, messages, emit);
    } else if (config.provider === "gemini") {
      await streamGemini(columnId, config.model, messages, emit);
    } else if (config.provider === "groq") {
      await streamOpenAICompatibleChat(columnId, "https://api.groq.com/openai/v1/chat/completions", "GROQ_API_KEY", config.model, messages, emit);
    } else {
      await streamOpenAICompatibleChat(columnId, "https://api.together.xyz/v1/chat/completions", "TOGETHER_API_KEY", config.model, messages, emit);
    }
    await emit(doneEvent(columnId));
  } catch (err) {
    await emit(errorEvent(columnId, err instanceof Error ? err.message : "Unknown error"));
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const histories = body?.histories as Histories | undefined;
  const columns = body?.columns as Partial<Record<ColumnId, ColumnRequestConfig>> | undefined;

  const activeKeys = Object.keys(histories ?? {}).filter((key) => Array.isArray(histories?.[key]) && columns?.[key]);
  const normalized: Partial<Record<ColumnId, ChatMessage[]>> = {};
  for (const key of activeKeys) normalized[key] = normalizeMessages(histories?.[key]);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const emit = async (chunk: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(chunk));
      };

      try {
        await Promise.all(activeKeys.map((key) => runProvider(key, columns![key]!, normalized[key] ?? [], emit)));
      } finally {
        closed = true;
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
