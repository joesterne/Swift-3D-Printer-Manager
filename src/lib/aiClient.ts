// Browser-side AI client. Calls the server's /api/ai endpoints so the Gemini
// API key stays on the server — the browser used to import src/lib/gemini
// directly with the key inlined into the bundle by vite.config's define.

async function postAi(path: string, body: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  return res.json();
}

export function getSmartSlicingInfo(modelName: string, geometryInfo: string) {
  return postAi('/api/ai/slicing', { modelName, geometryInfo });
}

export async function searchModels(query: string): Promise<string> {
  const data = await postAi('/api/ai/search', { query });
  return data.text as string;
}

// Drop-in replacement for the old stateful Gemini chat session: keeps the
// transcript locally and sends it with each message; the server endpoint is
// stateless. sendMessage resolves to an object with a `text` property, like
// the SDK response the chat UI was written against.
export function createChatSession() {
  const history: { role: 'user' | 'model'; text: string }[] = [];
  return {
    async sendMessage({ message }: { message: string }): Promise<{ text: string }> {
      const data = await postAi('/api/ai/chat', { history, message });
      const text = (data.text as string) || '';
      history.push({ role: 'user', text: message });
      history.push({ role: 'model', text });
      return { text };
    },
  };
}
