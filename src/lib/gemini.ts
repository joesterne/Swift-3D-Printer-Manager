import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const genAI = ai;

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
    contents: [{ parts: [{ text: `Search for 3D printable models related to: ${query}. 
    Provide a list of top 5 models from Thingiverse and Printables with their names, descriptions, and estimated popularity.` }] }],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
}
