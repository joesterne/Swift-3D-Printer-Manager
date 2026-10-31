import { GoogleGenAI } from "@google/genai";

// SERVER-ONLY module: the API key must never reach the browser. The client
// calls these through the /api/ai endpoints (see src/lib/aiClient.ts); this
// file used to be imported by client code with the key inlined into the
// bundle by vite.config's define.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSmartSlicingInfo(modelName: string, geometryInfo: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this 3D model: ${modelName}. 
    Geometry details: ${geometryInfo}.
    Estimate:
    1. Print time (hours) for standard settings.
    2. Filament usage (grams).
    3. Recommended orientation.
    4. Potential print issues.
    5. Suggested Infill percentage (number).
    6. Suggested Layer Height (number in mm).
    7. Suggested Supports (boolean).
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function searchModels(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for 3D printable models related to: ${query}. 
    Provide a list of top 5 models from Thingiverse and Printables with their names, descriptions, and estimated popularity.`,
  });
  return response.text;
}

// Stateless chat: the client keeps the transcript and sends it with each
// message (the previous design held a stateful chats.create() session in
// the browser — inseparable from the client-side API key).
export async function chatReply(history: { role: 'user' | 'model'; text: string }[], message: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ],
    config: {
      systemInstruction: "You are a 3D printing expert assistant. You help users with slicing settings, troubleshooting print failures, finding models, and managing their Bambu Lab printers. Be concise and technical but helpful."
    }
  });
  return response.text;
}
